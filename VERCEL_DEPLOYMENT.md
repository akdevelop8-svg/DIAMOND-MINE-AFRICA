# DiamondMine Africa — Phone-first Vercel Deployment

## 1) GitHub
1. Download `DiamondMine-Africa-Vercel-Fixed.zip` and extract it.
2. In your GitHub repository, replace the old project files with these files.
3. Commit and push to your main branch.

## 2) Neon PostgreSQL
1. Create a Neon project and copy its PostgreSQL connection string.
2. Before production, create the schema by opening the Neon SQL Editor and running `database/schema.sql`.
3. Run the complete `database/schema.sql` once. It now creates the normalized tables **and seeds the 10 VIP reference plans**, so you do not need a local Node/npm setup just to initialize the production database.

## 3) Vercel project
1. Vercel → Add New → Project → Import the GitHub repository.
2. Build command: `npm run build`.
3. Output directory: `dist`. The repository already contains `vercel.json` with this configuration.
4. Runtime: Node.js 24.x. The project pins `24.x` in `package.json`. Do **not** add a legacy `functions.runtime` entry to `vercel.json`; the previous invalid runtime configuration caused `Function Runtimes must have a valid version` errors. Vercel supports Node 24.x for Builds and Functions.
5. Keep the project root as the Vercel Root Directory. `vercel.json` routes `/api/*` through the single `api/index.js` function before applying the frontend SPA fallback. Do not restore an extra `api/[...path].js` file unless you also change and retest the routing rules.



## 4) Vercel Blob receipts
Create/connect a Vercel Blob store for the project. New Vercel Blob connections can use OIDC authentication, so a long-lived `BLOB_READ_WRITE_TOKEN` is not required on Vercel. The app uploads receipt images to private Blob storage when available and keeps the existing PostgreSQL receipt as a fallback for compatibility.

## 5) Environment Variables
Add these in Vercel → Settings → Environment Variables for Production (and Preview if you need preview environments):

```text
DATABASE_URL=your_neon_connection_string
ADMIN_NAME=Diamond Mine Africa
ADMIN_PASSWORD=use-a-long-random-secret
SESSION_COOKIE_NAME=dma_session
SESSION_TTL_DAYS=7
COOKIE_SECURE=true
CBE_ACCOUNT_NUMBER=your_cbe_account
CBE_ACCOUNT_NAME=your_cbe_account_name
CBE_BRANCH=Commercial Bank of Ethiopia
APP_ORIGIN=https://your-project.vercel.app
CORS_ORIGINS=https://your-project.vercel.app
```

Do not use `VITE_` variables for secrets. The CBE destination is supplied only to authenticated recharge sessions by `/api/payment-config`; it is not bundled into the frontend source.

## 6) First deployment checks
After Deploy, first confirm that all environment variables below are set and the Neon SQL schema has been run. Then open:

`https://YOUR-DOMAIN/api/health`

You want:

```json
{
  "ok": true,
  "database": "connected",
  "schemaReady": true
}
```

Then test:
- `/`
- `/register?ref_by=YOUR_ID`
- registration
- login/logout
- recharge submission
- admin approval
- withdrawal request/reject
- VIP activation and daily claim
- team/referral summary

## 7) Old JSON database migration
Only when you have an old `database/data.json` that must be preserved:

```bash
npm run db:setup
npm run db:migrate
```

The migration reads `database/data.json`, writes normalized PostgreSQL rows, and keeps passwords as their existing hashes. Do the migration before deleting the old JSON file.

## 8) If a deploy fails
Open Vercel → Deployments → the failed deployment → Functions/Runtime Logs. The first error in the log is the useful one; do not repeatedly redeploy before fixing it.
