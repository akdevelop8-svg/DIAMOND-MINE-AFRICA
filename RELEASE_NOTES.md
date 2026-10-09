# DiamondMine Africa — Release Notes

## Production repair pass

- Preserved the existing React/Vite visual structure and user flow.
- Moved application persistence from a single mutable JSONB-style document to normalized PostgreSQL tables.
- Added users, wallets, wallet ledger, plans, investments, transactions, receipt storage, sessions, referral earnings, team rewards, and audit logs.
- Made wallet-changing operations atomic with PostgreSQL transactions and non-negative balance protection.
- Added unique recharge transaction-code protection and concurrent VIP activation protection.
- Reworked authentication to HttpOnly session cookies instead of browser `localStorage` tokens.
- Removed the hard-coded admin password fallback.
- Removed the CBE account number/name fallback from frontend source; payment account details now come from the server environment through an authenticated `/api/payment-config` endpoint.
- Added Vercel `api/index.js` and catch-all `api/[...path].js` entry points so Express auth endpoints resolve on nested `/api/...` paths, plus SPA routing for client paths.
- Vite production output is generated into `dist/`; Vercel serves the configured build output directory.
- Added SPA rewrite support for client routes such as `/register?ref_by=...`.
- Added static asset caching headers for hashed build assets.
- Compressed receipt screenshots in the browser and lazy-load receipt proof in admin to reduce function request/response payload size.
- Added a public health endpoint that checks both database connectivity and schema readiness.
- Added live Team summary data in the existing Team modal without changing the referral flow.
- Made application timestamps use `APP_TIMEZONE` (default `Africa/Addis_Ababa`) for consistent user-facing history.
- Added authentication attempt throttling per runtime instance.
- Restored a strict authentication gate: the app checks `/api/me` before rendering the platform, and unauthenticated visitors cannot close the sign-in/sign-up screen.
- Fixed hard-coded referral domains so links use the current deployment origin.
- Corrected outdated withdrawal FAQ/copy to match the real admin-verification flow.
- Shortened the cinematic initial loading animation and removed unnecessary artificial API delays.
- Added an idempotent database setup script that seeds the 10 VIP plans.

## Deployment hardening / Vercel repair pass

- Fixed the production build failure caused by the `Iron.png` / `iron.png` case mismatch by standardizing the mineral asset path to lowercase and removing the duplicate case-variant file.
- Removed the direct `esbuild` dependency that could conflict with Vite's supported esbuild peer range during clean Vercel installs.
- Removed the unused `@google/genai` dependency to reduce install-time script warnings and the production dependency surface.
- Pinned direct dependency versions to make fresh installs more deterministic in the absence of a committed lockfile.
- Kept Node.js pinned to `24.x` through `package.json` and removed legacy function-runtime configuration from `vercel.json`.
- Added request-origin protection for state-changing HTTP methods and hardened response headers.
- Made admin authorization re-check the current database role rather than trusting only the role captured when the session was created.
- Added `/api/plans` and made the frontend use the database plan catalog at runtime, with the local catalog retained as a styling/fallback source.
- Added private Vercel Blob receipt storage with automatic database fallback, plus a protected admin receipt streaming endpoint.
- Extended the receipt schema with storage pathname/URL fields and made the migration safe for existing installations.

## Validation note

Server-side JavaScript syntax and all relative local import paths were validated. A complete `npm run build` could not be executed in this isolated environment because package installation timed out, so the final verification still requires one real Vercel build after the repository is pushed.


## Repair pass (2026-10-09)

- Fixed the invalid `disabled` property on the recharge account display element; the element is now non-interactive when no account number is available.
- Made the withdrawal form handler `async`, prevented duplicate submissions, and ensured pending state is cleared after success or failure.
- Standardized Vite output to `dist/`, enabled normal `public/` asset copying, and aligned Vercel and local static-serving configuration.
- Aligned the TypeScript `@/*` path mapping with Vite's `src/` alias.
- Added the Vercel API catch-all function for auth/API subpaths, addressing the frontend `NOT_FOUND` shown when submitting login/registration requests.
- Added a session-loading gate so platform content is not rendered before `/api/me` is checked; visitors must successfully sign in or register first.
- Removed the uppercase duplicate `public/assets/minerals/Iron.png`; the app's canonical source import remains lowercase `iron.png` to avoid case-sensitive deployment failures.
- Verified JSON config syntax, JavaScript syntax, and relative local imports. Full TypeScript/Vite production build could not run in this environment because npm package download failed with a DNS (`EAI_AGAIN`) network error.

## Auth/API follow-up repair (2026-10-09)

- Removed the obsolete TypeScript `baseUrl` and `paths` options because the project uses relative imports and the installed TypeScript version rejects the deprecated configuration.
- Fixed the `MiningProvider` value so `sessionReady` is actually exposed to `App.tsx`; this prevents the secure-session gate from waiting forever.
- Replaced ambiguous nested catch-all routing with one Vercel function plus an explicit `/api/:path*` rewrite, preserving each original Express API path and its query parameters.
- Kept the SPA fallback after the API rewrite, so API requests do not fall through to `index.html`.
- Made successful administrator authentication remain successful when the dashboard's follow-up data request fails.
- Normalized phone-number identifiers before comparing them with stored registration phone numbers.
- Kept session and user-specific API responses out of shared caches; improved the frontend error shown when a Vercel HTML 404 reaches the API client.
- Synchronized the signup/login tab with referral-link navigation and updated deployment documentation.
- Verified JSON configuration, server/API JavaScript syntax, and TypeScript/TSX syntax transpilation. A complete production build still requires installing the project's npm dependencies and running `npm run build` in a connected environment.
