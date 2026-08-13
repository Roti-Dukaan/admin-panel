/**
 * Place COD order + verify socket events for branch manager alert testing.
 * Run: node scripts/test-order-alert-flow.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN_PANEL_ROOT = join(__dirname, "..");
const BACKEND_ROOT = join(ADMIN_PANEL_ROOT, "..", "dukaan-backend");
const requireAdmin = createRequire(join(ADMIN_PANEL_ROOT, "package.json"));
const requireBackend = createRequire(join(BACKEND_ROOT, "package.json"));
const { io } = requireAdmin("socket.io-client");
const { Client: PgClient } = requireBackend("pg");

const API = process.env.API_URL || "http://localhost:3001";
const MANAGER_EMAIL = process.env.MANAGER_EMAIL || "test2@gmail.com";

const env = readFileSync(join(BACKEND_ROOT, ".env"), "utf8");
const DATABASE_URL = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
const JWT_SECRET = env.match(/^JWT_SECRET=(.+)$/m)?.[1]?.trim();

async function request(path, { token, ...options } = {}) {
  const res = await fetch(`${API}/api/v1${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${options.method || "GET"} ${path} -> ${res.status}: ${JSON.stringify(body)}`);
  }
  return body.data ?? body;
}

async function main() {
  const pg = new PgClient({ connectionString: DATABASE_URL });
  await pg.connect();

  const adminRow = (
    await pg.query(
      `SELECT id, email, "branchId" FROM admins WHERE lower(email) = lower($1) AND "deletedAt" IS NULL`,
      [MANAGER_EMAIL],
    )
  ).rows[0];
  if (!adminRow) throw new Error(`admin ${MANAGER_EMAIL} not found`);
  if (!adminRow.branchId) {
    throw new Error(`admin ${MANAGER_EMAIL} has no branchId — assign a branch before testing alerts`);
  }

  const otpRow = (
    await pg.query(
      `SELECT code FROM admin_otps WHERE "adminId" = $1 AND "isUsed" = false AND "expiresAt" > NOW() ORDER BY "createdAt" DESC LIMIT 1`,
      [adminRow.id],
    )
  ).rows[0];

  let accessToken;
  if (otpRow?.code) {
    const login = await request("/admin-auth/login", {
      method: "POST",
      body: JSON.stringify({ email: MANAGER_EMAIL, otp: otpRow.code }),
    });
    accessToken = login.accessToken;
  } else {
    const jwt = requireBackend("jsonwebtoken");
    accessToken = jwt.sign(
      { sub: adminRow.id, email: adminRow.email, roles: ["BRANCH_MANAGER"], branchId: adminRow.branchId },
      JWT_SECRET,
      { expiresIn: "1h" },
    );
  }

  const received = [];
  const socket = io(API, {
    path: "/socket.io",
    transports: ["websocket"],
    auth: { token: accessToken },
  });

  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("socket connect timeout")), 10000);
    socket.on("connect", () => {
      clearTimeout(t);
      resolve(undefined);
    });
    socket.on("connect_error", (err) => {
      clearTimeout(t);
      reject(err);
    });
  });

  socket.on("branch:order_new", (p) => received.push({ event: "branch:order_new", orderId: p.orderId }));
  socket.on("kitchen:ticket_created", (p) => received.push({ event: "kitchen:ticket_created", orderId: p.orderId }));

  // Reuse test-branch-realtime-live order placement logic (minimal)
  const branchId = adminRow.branchId;
  const recentOrder = (
    await pg.query(
      `SELECT o."customerId", o."addressId" FROM orders o WHERE o."branchId" = $1 ORDER BY o."createdAt" DESC LIMIT 1`,
      [branchId],
    )
  ).rows[0];
  if (!recentOrder) throw new Error("no prior order for branch — place one manually first");

  const food = (
    await pg.query(
      `SELECT fi.id FROM food_items fi
       INNER JOIN branch_menu_availability bma ON bma."foodItemId" = fi.id AND bma."branchId" = $1
       WHERE bma."isAvailable" = true LIMIT 1`,
      [branchId],
    )
  ).rows[0];
  if (!food) throw new Error("no available food item for branch");

  const customerToken = (
    await pg.query(`SELECT id FROM customers WHERE id = $1`, [recentOrder.customerId])
  ).rows[0];
  if (!customerToken) throw new Error("customer not found");

  // Customer JWT for order placement
  const jwt = requireBackend("jsonwebtoken");
  const customerJwt = jwt.sign({ sub: recentOrder.customerId, phone: "9999999999" }, JWT_SECRET, {
    expiresIn: "1h",
  });

  const cart = await request("/customer/cart", {
    token: customerJwt,
    method: "POST",
    body: JSON.stringify({ branchId }),
  }).catch(async () => {
    const existing = await request("/customer/cart", { token: customerJwt });
    return existing;
  });

  await request(`/customer/cart/${cart.id}/items`, {
    token: customerJwt,
    method: "POST",
    body: JSON.stringify({ foodItemId: food.id, quantity: 1 }),
  }).catch(() => undefined);

  const checkout = await request("/customer/checkout", {
    token: customerJwt,
    method: "POST",
    body: JSON.stringify({
      cartId: cart.id,
      addressId: recentOrder.addressId,
      paymentMethod: "COD",
      deliveryType: "QUICK",
    }),
  });

  const payment = await request("/customer/payments/create-from-checkout", {
    token: customerJwt,
    method: "POST",
    body: JSON.stringify({ checkoutSessionId: checkout.id }),
  });

  await request(`/customer/payments/${payment.id}/place-cod-order`, {
    token: customerJwt,
    method: "POST",
    body: JSON.stringify({}),
  });

  await new Promise((r) => setTimeout(r, 5000));
  socket.disconnect();
  await pg.end();

  const result = {
    manager: MANAGER_EMAIL,
    branchId,
    received,
    ok: received.some((e) => e.event === "branch:order_new") && received.some((e) => e.event === "kitchen:ticket_created"),
  };
  writeFileSync(join(__dirname, "order-alert-test-result.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

main().catch((err) => {
  console.error("[order-alert-test] FAILED:", err.message);
  process.exit(1);
});
