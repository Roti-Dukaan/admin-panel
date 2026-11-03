# Admin panel — Git branches

## Intended flow

```
feature/fix commits  →  development  →  main (production)
```

1. **Do all work on `development`** (commit and push here first).
2. **Open a PR** `development` → `main` when ready for production (or merge locally and push `main`).
3. **Never** commit directly to `main` for normal features/fixes.
4. **Never** merge `main` → `development` to “catch up” — that reverses the flow. If `main` accidentally got commits, cherry-pick those commits onto `development` or merge `development` → `main` once, then continue on `development`.

## Deployments

| Branch | Typical target |
|--------|----------------|
| `development` | Dev admin (e.g. admin-dev) — preview / dev API |
| `main` | Production admin — Vercel production branch |

CI (`.github/workflows/ci.yml`) builds both branches; Vercel production should track **`main`** only.

## Local setup

```bash
git checkout development
git pull origin development
```

Set your IDE default branch to **`development`** for this repo.

## If you committed on `main` by mistake

```bash
git checkout development
git cherry-pick <commit-sha>   # repeat for each commit
git push origin development
# Then merge development → main via PR
```

Do **not** `git merge origin/main` on `development`.
