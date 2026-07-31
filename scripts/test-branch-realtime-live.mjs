/**
 * LIVE branch-manager realtime verification.
 *
 * 1. Logs in as branch manager (test@gmail.com) via admin OTP API.
 * 2. Connects a socket.io client with that token (same as admin panel).
 * 3. Places a REAL COD order through the customer API (cart -> checkout ->
 *    payment -> create-from-checkout) for the manager's branch.
 * 4. Asserts the socket receives branch:order_new AND kitchen:ticket_created.
 *
 * Run: node scripts/test-branch-realtime-live.mjs   (cwd: admin-panel)
 */
import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN_PANEL_ROOT = join(__dirname, '..');
const BACKEND_ROOT = join(ADMIN_PANEL_ROOT, '..', 'dukaan-backend');

const requireAdmin = createRequire(join(ADMIN_PANEL_ROOT, 'package.json'));
const requireBackend = createRequire(join(BACKEND_ROOT, 'package.json'));

const { io } = requireAdmin('socket.io-client');
const { Client: PgClient } = requireBackend('pg');
const jwt = requireBackend('jsonwebtoken');

const API = process.env.API_URL || 'http://localhost:3001';
const MANAGER_EMAIL = process.env.MANAGER_EMAIL || 'test@gmail.com';

const env = readFileSync(join(BACKEND_ROOT, '.env'), 'utf8');
const DATABASE_URL = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
const JWT_SECRET = env.match(/^JWT_SECRET=(.+)$/m)?.[1]?.trim();

const result = {
  steps: [],
  received: [],
  ok: false,
};
function log(step, extra) {
  const line = extra === undefined ? step : `${step}: ${JSON.stringify(extra)}`;
  console.log(`[e2e] ${line}`);
  result.steps.push(line);
}

async function request(path, { token, ...options } = {}) {
  const res = await fetch(`${API}/api/v1${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${options.method || 'GET'} ${path} -> ${res.status}: ${JSON.stringify(body)}`);
  }
  return body.data ?? body;
}

async function main() {
  // ── 1. DB probe: branch of the manager + a customer/address/food usable for a real order
  const pg = new PgClient({ connectionString: DATABASE_URL });
  await pg.connect();

  const adminRow = (await pg.query(
    `SELECT id, email, "branchId" FROM admins WHERE email = $1 AND "deletedAt" IS NULL`,
    [MANAGER_EMAIL],
  )).rows[0];
  if (!adminRow) throw new Error(`admin ${MANAGER_EMAIL} not found`);
  if (!adminRow.branchId) throw new Error(`admin ${MANAGER_EMAIL} has no branchId`);
  const branchId = adminRow.branchId;
  log('manager', { id: adminRow.id, branchId });

  const branch = (await pg.query(`SELECT id, name FROM branches WHERE id = $1`, [branchId])).rows[0];
  log('branch', branch);

  // Most recent order for this branch tells us a customer whose address is serviceable here.
  const recentOrder = (await pg.query(
    `SELECT o.id, o."orderNumber", o."customerId", o."createdAt"
     FROM orders o WHERE o."branchId" = $1 ORDER BY o."createdAt" DESC LIMIT 1`,
    [branchId],
  )).rows[0];
  if (!recentOrder) throw new Error(`no historical order for branch ${branchId} - cannot infer serviceable customer`);
  log('recent_order', { orderNumber: recentOrder.orderNumber, customerId: recentOrder.customerId });

  const customer = (await pg.query(
    `SELECT id, email, phone, "fullName" FROM customers WHERE id = $1 AND "isActive" = true AND "deletedAt" IS NULL`,
    [recentOrder.customerId],
  )).rows[0];
  if (!customer) throw new Error('customer of recent order not active');

  const address = (await pg.query(
    `SELECT id, label, area, pincode FROM addresses
     WHERE "customerId" = $1 AND "deletedAt" IS NULL
     ORDER BY "isDefault" DESC, "updatedAt" DESC LIMIT 1`,
    [customer.id],
  )).rows[0];
  if (!address) throw new Error('customer has no address');
  log('customer', { id: customer.id, address: { id: address.id, area: address.area, pincode: address.pincode } });

  // Prefer a food item from the recent order (guaranteed orderable at this branch).
  let food = (await pg.query(
    `SELECT f.id, f.name FROM order_items oi
     JOIN food_items f ON f.id = oi."foodItemId"
     WHERE oi."orderId" = $1 AND f."deletedAt" IS NULL AND f."isAvailable" = true
     LIMIT 1`,
    [recentOrder.id],
  )).rows[0];
  if (!food) {
    food = (await pg.query(
      `SELECT id, name FROM food_items
       WHERE "deletedAt" IS NULL AND "isAvailable" = true
       ORDER BY "updatedAt" DESC LIMIT 1`,
    )).rows[0];
  }
  if (!food) throw new Error('no active food item');
  log('food_item', food);

  await pg.end();

  // ── 2. Branch manager login (same OTP flow the admin panel uses)
  const otpData = await request('/admin-auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email: MANAGER_EMAIL }),
  });
  if (!otpData.otp) throw new Error('send-otp did not return otp (dev mode expected)');
  const login = await request('/admin-auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: MANAGER_EMAIL, otp: otpData.otp }),
  });
  const managerToken = login.accessToken;
  log('manager_logged_in');

  // ── 3. Socket connect exactly like the admin panel does
  const socket = io(API, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    withCredentials: true,
    auth: { token: managerToken },
  });

  const targetEvents = ['branch:order_new', 'kitchen:ticket_created'];
  const gotEvents = new Map();
  let resolveEvents;
  const eventsPromise = new Promise((resolve) => { resolveEvents = resolve; });

  for (const evt of targetEvents) {
    socket.on(evt, (payload) => {
      log(`socket_event ${evt}`, { orderId: payload.orderId, orderNumber: payload.orderNumber, branchId: payload.branchId });
      result.received.push({ evt, payload });
      gotEvents.set(evt, payload);
      if (targetEvents.every((e) => gotEvents.has(e))) resolveEvents();
    });
  }

  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('socket connect timeout')), 8000);
    socket.on('connect', () => { clearTimeout(t); resolve(); });
    socket.on('connect_error', (err) => { clearTimeout(t); reject(new Error(`connect_error: ${err.message}`)); });
  });
  log('socket_connected', { id: socket.id });

  // Gateway emits pong { role } right after room joins — use it as a join signal.
  const pong = await new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), 3000);
    socket.once('pong', (p) => { clearTimeout(t); resolve(p); });
    socket.emit('ping');
  });
  log('pong', pong);

  // ── 4. Place a REAL COD order via customer API
  const customerToken = jwt.sign(
    { sub: customer.id, email: customer.email, phone: customer.phone },
    JWT_SECRET,
    { expiresIn: '15m' },
  );

  // Reset any stale cart/checkout state
  const activeCheckout = await request('/checkout', { token: customerToken }).catch(() => null);
  if (activeCheckout?.id) {
    await request(`/checkout/${activeCheckout.id}`, { method: 'DELETE', token: customerToken }).catch(() => {});
    log('cancelled_stale_checkout', activeCheckout.id);
  }
  await request('/cart', { method: 'DELETE', token: customerToken }).catch(() => {});

  await request('/cart/items', {
    method: 'POST',
    token: customerToken,
    body: JSON.stringify({ foodItemId: food.id, quantity: 1 }),
  });
  log('cart_item_added');

  await request('/cart/address', {
    method: 'PATCH',
    token: customerToken,
    body: JSON.stringify({ addressId: address.id }),
  });
  await request('/cart/payment-method', {
    method: 'PATCH',
    token: customerToken,
    body: JSON.stringify({ paymentMethod: 'COD' }),
  });
  log('cart_configured');

  const checkout = await request('/checkout', {
    method: 'POST',
    token: customerToken,
    body: JSON.stringify({ addressId: address.id, deliveryType: 'QUICK', paymentMethod: 'COD' }),
  });
  log('checkout_created', { id: checkout.id, grandTotal: checkout.pricing?.grandTotal });

  const paymentOrder = await request('/payments/create-order', {
    method: 'POST',
    token: customerToken,
    body: JSON.stringify({ checkoutSessionId: checkout.id }),
  });
  const paymentId = paymentOrder.paymentId ?? paymentOrder.id;
  log('payment_created', { paymentId });

  const order = await request('/orders/create-from-checkout', {
    method: 'POST',
    token: customerToken,
    body: JSON.stringify({ checkoutSessionId: checkout.id, paymentId }),
  });
  log('ORDER_PLACED', { id: order.id, orderNumber: order.orderNumber, branchId: order.branchId });

  if (order.branchId && order.branchId !== branchId) {
    log('WARNING order routed to different branch', { expected: branchId, actual: order.branchId });
  }

  // ── 5. Wait for both realtime events
  await Promise.race([
    eventsPromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT waiting for realtime events')), 15000)),
  ]);

  const branchEvt = gotEvents.get('branch:order_new');
  const kitchenEvt = gotEvents.get('kitchen:ticket_created');
  if (branchEvt.orderId !== order.id) throw new Error('branch:order_new orderId mismatch');
  if (kitchenEvt.orderId !== order.id) throw new Error('kitchen:ticket_created orderId mismatch');

  result.ok = true;
  log('SUCCESS both events received for the new order');
  socket.disconnect();
}

main()
  .catch((err) => {
    log('FAILED', err.message);
    process.exitCode = 1;
  })
  .finally(() => {
    writeFileSync(join(__dirname, 'branch-realtime-live-result.json'), JSON.stringify(result, null, 2));
    // socket may still hold the loop open on failure
    setTimeout(() => process.exit(process.exitCode ?? 0), 500);
  });
