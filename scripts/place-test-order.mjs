/**
 * Places one REAL COD order for the branch of test@gmail.com via customer API.
 * Used to verify the admin panel updates in realtime without refresh.
 * Run: node scripts/place-test-order.mjs
 */
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = join(__dirname, '..', '..', 'dukaan-backend');
const requireBackend = createRequire(join(BACKEND_ROOT, 'package.json'));
const { Client: PgClient } = requireBackend('pg');
const jwt = requireBackend('jsonwebtoken');

const API = process.env.API_URL || 'http://localhost:3001';
const MANAGER_EMAIL = process.env.MANAGER_EMAIL || 'test@gmail.com';

const env = readFileSync(join(BACKEND_ROOT, '.env'), 'utf8');
const DATABASE_URL = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
const JWT_SECRET = env.match(/^JWT_SECRET=(.+)$/m)?.[1]?.trim();

async function request(path, { token, ...options } = {}) {
  const res = await fetch(`${API}/api/v1${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${options.method || 'GET'} ${path} -> ${res.status}: ${JSON.stringify(body)}`);
  return body.data ?? body;
}

async function main() {
  const pg = new PgClient({ connectionString: DATABASE_URL });
  await pg.connect();
  const admin = (await pg.query(
    `SELECT "branchId" FROM admins WHERE email = $1 AND "deletedAt" IS NULL`, [MANAGER_EMAIL],
  )).rows[0];
  const recentOrder = (await pg.query(
    `SELECT id, "customerId" FROM orders WHERE "branchId" = $1 ORDER BY "createdAt" DESC LIMIT 1`,
    [admin.branchId],
  )).rows[0];
  const customer = (await pg.query(
    `SELECT id, email, phone FROM customers WHERE id = $1`, [recentOrder.customerId],
  )).rows[0];
  const address = (await pg.query(
    `SELECT id FROM addresses WHERE "customerId" = $1 AND "deletedAt" IS NULL ORDER BY "isDefault" DESC, "updatedAt" DESC LIMIT 1`,
    [customer.id],
  )).rows[0];
  const food = (await pg.query(
    `SELECT f.id FROM order_items oi JOIN food_items f ON f.id = oi."foodItemId"
     WHERE oi."orderId" = $1 AND f."deletedAt" IS NULL AND f."isAvailable" = true LIMIT 1`,
    [recentOrder.id],
  )).rows[0];
  await pg.end();

  const token = jwt.sign({ sub: customer.id, email: customer.email, phone: customer.phone }, JWT_SECRET, { expiresIn: '15m' });

  const active = await request('/checkout', { token }).catch(() => null);
  if (active?.id) await request(`/checkout/${active.id}`, { method: 'DELETE', token }).catch(() => {});
  await request('/cart', { method: 'DELETE', token }).catch(() => {});
  await request('/cart/items', { method: 'POST', token, body: JSON.stringify({ foodItemId: food.id, quantity: 1 }) });
  await request('/cart/address', { method: 'PATCH', token, body: JSON.stringify({ addressId: address.id }) });
  await request('/cart/payment-method', { method: 'PATCH', token, body: JSON.stringify({ paymentMethod: 'COD' }) });
  const checkout = await request('/checkout', {
    method: 'POST', token,
    body: JSON.stringify({ addressId: address.id, deliveryType: 'QUICK', paymentMethod: 'COD' }),
  });
  const payment = await request('/payments/create-order', {
    method: 'POST', token, body: JSON.stringify({ checkoutSessionId: checkout.id }),
  });
  const order = await request('/orders/create-from-checkout', {
    method: 'POST', token,
    body: JSON.stringify({ checkoutSessionId: checkout.id, paymentId: payment.paymentId ?? payment.id }),
  });
  console.log(`ORDER_PLACED ${order.orderNumber} (${order.id})`);
}

main().catch((err) => { console.error('FAILED', err.message); process.exit(1); });
