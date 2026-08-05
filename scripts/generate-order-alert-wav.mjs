/**
 * Generates partner-style order alert (Zomato / Swiggy restaurant app style).
 * Ascending two-tone "ding-dong" chime — NOT phone ring or dial tone.
 * Run: node scripts/generate-order-alert-wav.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "sounds");
const outPath = path.join(outDir, "partner-order-alert.wav");
const legacyPaths = [
  path.join(outDir, "phone-ring.wav"),
  path.join(outDir, "order-alert.wav"),
];

const sampleRate = 44100;
/** One alert cycle — repeats for continuous loop while order is pending. */
const durationSec = 2.8;
const numSamples = Math.floor(sampleRate * durationSec);

function toneAt(t, freq, start, length, attack = 0.008, release = 0.04, gain = 0.5) {
  const x = t - start;
  if (x < 0 || x > length) return 0;
  let env = 1;
  if (x < attack) env = x / attack;
  else if (x > length - release) env = Math.max(0, (length - x) / release);
  const fundamental = Math.sin(2 * Math.PI * freq * t);
  const harmonic = Math.sin(2 * Math.PI * freq * 2 * t) * 0.18;
  return (fundamental + harmonic) * env * gain;
}

/**
 * Zomato / Swiggy partner pattern: urgent ascending ding-dong × 2, short pause, repeat.
 * Frequencies tuned to match the bright alert tone used in food-partner apps.
 */
function sampleAtTime(t) {
  const cycle = t % durationSec;
  let sample = 0;

  // First pair — lower → higher (classic partner "ding-dong")
  sample += toneAt(cycle, 880, 0.0, 0.16, 0.006, 0.035, 0.48);
  sample += toneAt(cycle, 1175, 0.2, 0.18, 0.006, 0.04, 0.52);

  // Second pair — repeats for urgency (Swiggy-style double alert)
  sample += toneAt(cycle, 880, 0.46, 0.16, 0.006, 0.035, 0.48);
  sample += toneAt(cycle, 1175, 0.66, 0.18, 0.006, 0.04, 0.52);

  // Optional bright third hit (Zomato-style extra ping on some versions)
  sample += toneAt(cycle, 1320, 0.92, 0.14, 0.006, 0.03, 0.38);

  return sample;
}

const pcm = Buffer.alloc(numSamples * 2);
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const clamped = Math.max(-1, Math.min(1, sampleAtTime(t)));
  pcm.writeInt16LE(Math.round(clamped * 32767), i * 2);
}

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(sampleRate * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);

fs.mkdirSync(outDir, { recursive: true });
const wav = Buffer.concat([header, pcm]);
fs.writeFileSync(outPath, wav);
for (const legacy of legacyPaths) {
  fs.writeFileSync(legacy, wav);
}
console.log(`Wrote ${outPath} (${numSamples} samples, partner order alert)`);
