/**
 * Generates public/sounds/order-alert.wav — a Zomato-style two-tone alert loop (~1.4s).
 * Run: node scripts/generate-order-alert-wav.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "sounds");
const outPath = path.join(outDir, "order-alert.wav");

const sampleRate = 44100;
const durationSec = 1.4;
const numSamples = Math.floor(sampleRate * durationSec);

function toneSample(t, freq, attack = 0.02, sustain = 0.2) {
  if (t < 0 || t > sustain) return 0;
  const env =
    t < attack ? t / attack : t > sustain - 0.05 ? Math.max(0, (sustain - t) / 0.05) : 1;
  return Math.sin(2 * Math.PI * freq * t) * env * 0.45;
}

const pcm = Buffer.alloc(numSamples * 2);
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const cycle = t % 1.4;
  let sample = 0;
  if (cycle < 0.22) sample += toneSample(cycle, 880, 0.02, 0.22);
  else if (cycle >= 0.24 && cycle < 0.48) sample += toneSample(cycle - 0.24, 1175, 0.02, 0.24);
  else if (cycle >= 0.72 && cycle < 0.94) sample += toneSample(cycle - 0.72, 880, 0.02, 0.22);
  else if (cycle >= 0.96 && cycle < 1.2) sample += toneSample(cycle - 0.96, 1175, 0.02, 0.24);

  const clamped = Math.max(-1, Math.min(1, sample));
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
fs.writeFileSync(outPath, Buffer.concat([header, pcm]));
console.log(`Wrote ${outPath} (${numSamples} samples)`);
