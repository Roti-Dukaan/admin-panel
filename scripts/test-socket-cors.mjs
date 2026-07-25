/**
 * Quick Socket.IO CORS probe for Vercel admin → EC2 backend.
 * Run: node scripts/test-socket-cors.mjs
 */
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { io } = require("socket.io-client");

const API = process.env.API_URL || "https://backend-dev.rotidukaan.com";
const ORIGIN = process.env.ORIGIN || "https://admin-panel-silk-six.vercel.app";

const result = { connected: false, error: null, events: [] };

const socket = io(API, {
  path: "/socket.io",
  transports: ["websocket"],
  extraHeaders: { Origin: ORIGIN },
  auth: { token: "invalid-probe-token" },
  reconnection: false,
  timeout: 10_000,
});

socket.on("connect", () => {
  result.connected = true;
  finish("connected (unexpected without valid JWT)");
});

socket.on("connect_error", (err) => {
  result.error = err.message;
  // CORS failure usually mentions xhr poll / websocket error before auth.
  // Auth failure after handshake shows as connect_error with unauthorized-ish message.
  finish(`connect_error: ${err.message}`);
});

socket.on("exception", (payload) => {
  result.events.push({ type: "exception", payload });
});

setTimeout(() => finish("timeout"), 12_000);

function finish(reason) {
  console.log(JSON.stringify({ api: API, origin: ORIGIN, reason, ...result }, null, 2));
  socket.close();
  process.exit(result.error?.toLowerCase().includes("cors") ? 1 : 0);
}
