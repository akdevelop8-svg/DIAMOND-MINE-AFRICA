# DiamondMine Africa

DiamondMine Africa keeps the original React/Vite UI and user flow, but the production architecture is now prepared for Vercel + Neon PostgreSQL.

## Architecture
- Frontend: React + Vite + TypeScript
- API: Express (`server.js`) exported through `api/index.js`
- Hosting: Vercel Node.js 24 runtime
- Database: Neon PostgreSQL
- Persistence: normalized relational tables (users, wallets, investments, transactions, wallet ledger, sessions, receipts, referrals, team rewards, audit logs)
- Authentication: HttpOnly session cookie + salted `scrypt` password hashes
- Wallet accounting: append-only wallet ledger + atomic PostgreSQL transactions

## Why the database was changed
The old JSONB/file model stored application state as one large mutable document. That is unsafe for concurrent requests and does not provide durable file persistence on Vercel.

The new model separates state into relational tables and uses database transactions for balance-changing operations. Wallet balance is protected by SQL updates with non-negative constraints, while every change also creates an immutable-style ledger entry.

## Local setup from a phone
1. Create a Neon PostgreSQL project.
2. Put the connection string into `.env` as `DATABASE_URL`.
3. Set `ADMIN_PASSWORD` and the CBE environment values.
4. Install packages with `npm install`.
5. Create the schema with `npm run db:setup` (the same `database/schema.sql` also seeds the 10 VIP reference plans).
6. Start with `npm run dev`.
7. Open `http://localhost:3000`.

For an old `database/data.json` file, use:

`npm run db:migrate`

Only run the migration after creating the PostgreSQL schema. It is intended as a one-time migration from the old JSON database.

## Vercel deployment
The frontend is built by Vite into `dist/`, while `api/index.js` is the single Vercel serverless API entry point. `vercel.json` rewrites every `/api/*` request through that handler and restores the original route before dispatching it to Express; this avoids relying on nested catch-all function matching. A separate SPA fallback sends client-side routes such as `/register?...` to `index.html`. Unauthenticated visitors remain on the login/sign-up gate until the server finishes checking `/api/me`, and protected operations are enforced again by server-side middleware.

Before the first production deployment, create the Neon schema once with `npm run db:setup` locally or by running `database/schema.sql` in the Neon SQL editor.

Then add these Vercel Environment Variables:

- `DATABASE_URL`
- `ADMIN_NAME`
- `ADMIN_PASSWORD`
- `SESSION_COOKIE_NAME`
- `SESSION_TTL_DAYS`
- `CBE_ACCOUNT_NUMBER`
- `CBE_ACCOUNT_NAME`
- `CBE_BRANCH`
- `APP_ORIGIN` (your final site origin, e.g. `https://your-domain.vercel.app`)
- `CORS_ORIGINS` (same value as `APP_ORIGIN` for a single-domain deployment)
- `COOKIE_SECURE=true`

The Vercel build command is already defined in `vercel.json`.

## Health check
After deployment, open:

`https://YOUR-DOMAIN/api/health`

A healthy deployment returns `ok: true` and `database: "connected"`.

## Important
Never put `DATABASE_URL`, `ADMIN_PASSWORD`, or other server secrets in `VITE_*` variables or source code. Payment-account information needed by the UI is provided after authentication by the server `/api/payment-config` endpoint rather than hard-coded into the frontend bundle.
