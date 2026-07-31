# Local development (admin panel)

Ports: **3002** (admin), **3001** (API), **3000** (customer site).

## Quick restart

From `admin-panel`: `.\scripts\dev.ps1`  
Admin only: `.\scripts\dev.ps1 -AdminOnly`

## Why localhost goes blank on changes

1. **predev deletes .next while next dev is running** (second terminal `npm run dev`). `ensure-dev-cache` now skips delete when the dev port is listening.
2. **build + dev overlap** — run `dev:clean` only after stopping port 3002.
3. **Zombie Node processes** — multiple dev sessions; kill 3000/3001/3002 and restart once.
4. **Backend down** — check `http://localhost:3001/api/v1/health`.
5. **HMR mid-compile** — wait for "Compiled" in the terminal after big edits (socket/alert changes).

## Verify

| URL | Expect |
|-----|--------|
| /login | 200 |
| /branch/dashboard | 200 with branch manager session (307 to /login without cookies) |
| localhost:3000 | customer home |
| localhost:3001/api/v1/health | success JSON |
