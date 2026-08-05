/**
 * Ensures a fallback order alert exists when no custom ringtone is bundled.
 * Skips generation when public/sounds/ringing_old_phone.* is present.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const soundsDir = path.join(__dirname, "..", "public", "sounds");
const fallbackPath = path.join(soundsDir, "partner-order-alert.wav");
const VERSION = "partner-order-alert-v1";
const stampPath = path.join(soundsDir, ".order-alert-version");

const CUSTOM_RING_NAMES = ["ringing_old_phone.mp3", "ringing_old_phone.wav", "ringing_old_phone.ogg"];

function hasCustomRingtone() {
  return CUSTOM_RING_NAMES.some((name) => fs.existsSync(path.join(soundsDir, name)));
}

if (hasCustomRingtone()) {
  process.exit(0);
}

function needsRegenerate() {
  if (!fs.existsSync(fallbackPath)) return true;
  try {
    const stamp = fs.readFileSync(stampPath, "utf8").trim();
    return stamp !== VERSION;
  } catch {
    return true;
  }
}

if (!needsRegenerate()) {
  process.exit(0);
}

console.log("[ensure-order-alert-sound] no custom ringtone — generating fallback alert...");
const result = spawnSync(process.execPath, ["scripts/generate-order-alert-wav.mjs"], {
  cwd: path.join(__dirname, ".."),
  stdio: "inherit",
});

if ((result.status ?? 1) === 0) {
  fs.mkdirSync(soundsDir, { recursive: true });
  fs.writeFileSync(stampPath, VERSION);
}

process.exit(result.status ?? 1);
