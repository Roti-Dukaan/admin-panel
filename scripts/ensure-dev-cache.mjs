/**
 * Clears .next when it contains production build artifacts or a broken CSS cache.
 * Runs automatically via npm "predev".
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const DEV_PORT = Number(process.env.PORT || process.env.NEXT_DEV_PORT || 3002);

function isDevPortInUse(port) {
  try {
    const out = execSync(`netstat -ano | findstr ":${port}" | findstr "LISTENING"`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.trim().length > 0;
  } catch {
    return false;
  }
}

const nextDir = path.join(process.cwd(), ".next");
if (!fs.existsSync(nextDir)) process.exit(0);

function rmNext(reason) {
  if (isDevPortInUse(DEV_PORT)) {
    console.warn(`[predev] ${reason} - port ${DEV_PORT} in use; skip clearing .next`);
    console.warn("[predev] Stop dev first, then npm run dev:clean if cache is corrupt.");
    process.exit(0);
  }
  console.warn(`[predev] ${reason} - clearing .next`);
  fs.rmSync(nextDir, { recursive: true, force: true });
}

const prodMarkers = ["required-server-files.json", "standalone", "export", "export-detail.json"];
for (const marker of prodMarkers) {
  if (fs.existsSync(path.join(nextDir, marker))) {
    rmNext(`Production build artifact "${marker}" found`);
    process.exit(0);
  }
}

const buildId = path.join(nextDir, "BUILD_ID");
const staticDir = path.join(nextDir, "static");
if (fs.existsSync(buildId) && fs.existsSync(staticDir)) {
  const cssFiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".css")) cssFiles.push(full);
    }
  };
  try { walk(staticDir); } catch { /* ignore */ }
  if (cssFiles.length === 0) {
    rmNext("BUILD_ID set but no CSS in .next/static");
  }
}
