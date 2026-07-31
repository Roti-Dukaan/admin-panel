/**
 * Ensures public/sounds/order-alert.wav exists before dev/build.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "..", "public", "sounds", "order-alert.wav");

if (fs.existsSync(outPath)) {
  process.exit(0);
}

console.log("[ensure-order-alert-sound] order-alert.wav missing — generating...");
const result = spawnSync(process.execPath, ["scripts/generate-order-alert-wav.mjs"], {
  cwd: path.join(__dirname, ".."),
  stdio: "inherit",
});

process.exit(result.status ?? 1);
