# DiamondMine Africa — Auth and Vercel Routing Repair

## What changed

- Removed the deprecated TypeScript `baseUrl` and unused `paths` settings that were stopping the production type-check.
- Exposed `sessionReady` through `MiningProvider`, fixing the session gate state.
- Routed every `/api/*` request through one Vercel API function and restored the original Express route before dispatch. This prevents nested auth requests from falling through to Vercel's static 404 page.
- Kept the frontend SPA fallback after the API routing rule.
- Made a valid admin login stay successful if only the admin dashboard data refresh fails.
- Normalized phone-number login identifiers and prevented API responses containing session/user data from being shared through caches.
- Kept the frontend login/sign-up gate; protected account, wallet, investment, recharge, withdrawal, and admin endpoints still require a valid server-side session.

## Before testing on Vercel

1. Replace the repository files with the contents of this archive, then commit and push to the Git branch connected to Vercel.
2. In Neon, run `database/schema.sql` if this database has not been initialized yet.
3. In Vercel → Project → Settings → Environment Variables, confirm `DATABASE_URL` and a strong `ADMIN_PASSWORD` are set. Also set `APP_ORIGIN` and `CORS_ORIGINS` to the deployed site origin and `COOKIE_SECURE=true`. Set CBE account variables if recharge is to be used.
4. Redeploy the latest commit. Open `https://YOUR-DOMAIN/api/health`; expect `ok: true` and `schemaReady: true`.
5. Test signup using a phone number not already registered, then test login/logout. For administrator login, use `ADMIN_NAME` (defaults to `Diamond Mine Africa`) as the identifier and the exact secret stored in Vercel's `ADMIN_PASSWORD` variable.

## Validation status

Configuration JSON, JavaScript syntax, relative source imports, TypeScript/TSX syntax transpilation, and API-route restoration logic were checked. A complete `npm run build` could not be run in this isolated environment because npm dependency installation timed out; verify the first real Vercel build and `/api/health` response after pushing these files.
