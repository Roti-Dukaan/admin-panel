# Admin Panel — Deploy (Vercel)

Production and preview deploys are handled by **Vercel**, not GitHub Actions EC2 deploy.

## How deploys run

1. Connect the Vercel project to `Roti-Dukaan/admin-panel` in the Vercel dashboard.
2. Set the production branch (usually `main`).
3. On push to that branch, Vercel builds and deploys using `vercel.json`:
   - `installCommand`: `npm install`
   - `buildCommand`: `npm run build`

## GitHub Actions

Workflow: `.github/workflows/ci.yml`

- Runs on push/PR to `main` and `development`
- Validates `npm ci` + `npm run build` (does **not** deploy to Vercel)

To deploy via Actions instead of Vercel Git integration, add Vercel secrets
(`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) and a separate deploy workflow.

## Required Vercel environment variables

| Variable | Example (dev) |
|----------|----------------|
| `NEXT_PUBLIC_API_URL` | `https://backend-dev.rotidukaan.com` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Maps JS key |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Same as above (alias) |

`next.config.ts` fails Vercel builds if `NEXT_PUBLIC_API_URL` is missing or points at localhost.

## Domains

- Dev: `https://admin-dev.rotidukaan.com` (typical)
- Ensure backend `CORS_ORIGINS` includes the admin URL after deploy.
