/**
 * Realtime integration test (no secrets printed).
 * Run: node scripts/test-realtime-e2e.mjs
 */
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const { io } = require('socket.io-client');

const API = process.env.API_URL || 'http://localhost:3001';
const log = [];
const __dirname = dirname(fileURLToPath(import.meta.url));

async function request(path, options = {}) {
  const res = await fetch(`${API}/api/v1${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} ${res.status}: ${JSON.stringify(body)}`);
  return body.data ?? body;
}

async function main() {
  const otpData = await request('/admin-auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@rotidukaan.com' }),
  });
  const login = await request('/admin-auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@rotidukaan.com', otp: otpData.otp }),
  });
  const token = login.accessToken;

  const received = [];
  const socket = io(API, {
    path: '/socket.io',
    transports: ['websocket'],
    auth: { token },
  });

  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('socket connect timeout')), 5000);
    socket.on('connect', () => {
      clearTimeout(t);
      log.push('socket_connected');
      resolve();
    });
    socket.on('connect_error', (err) => {
      clearTimeout(t);
      reject(err);
    });
  });

  for (const evt of ['kitchen:ticket_updated', 'branch:order_updated']) {
    socket.on(evt, (payload) => {
      received.push({ evt, orderId: payload.orderId, status: payload.status ?? payload.stage });
    });
  }

  const orders = await request('/admin/kitchen/orders?limit=5', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const pending = orders.items?.find((i) => i.kitchenStatus === 'PENDING');
  if (!pending) {
    log.push('no_pending_order');
    writeFileSync(join(__dirname, 'realtime-test-result.json'), JSON.stringify({ log, received }, null, 2));
    socket.disconnect();
    return;
  }

  await request(`/admin/kitchen/orders/${pending.orderId}/preparing`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  log.push(`marked_preparing:${pending.orderId}`);

  await new Promise((r) => setTimeout(r, 1500));

  writeFileSync(join(__dirname, 'realtime-test-result.json'), JSON.stringify({ log, received }, null, 2));
  socket.disconnect();
}

main().catch((err) => {
  writeFileSync(join(__dirname, 'realtime-test-result.json'), JSON.stringify({ error: err.message }, null, 2));
  process.exit(1);
});
