# Database layout

The production database is PostgreSQL. The schema is intentionally normalized so that high-write areas do not live inside one JSON document.

- `users`: identity, referral relationship, aggregate statistics
- `wallets`: one current balance per user
- `wallet_ledger`: append-only balance movements with `balance_after`
- `plans`: VIP plan reference data
- `investments`: one row per activated VIP position
- `transactions`: recharge/withdrawal/investment/claim workflow records
- `transaction_receipts`: receipt data separated from the transaction row
- `sessions`: hashed authentication sessions
- `referral_earnings`: commission records tied to a source recharge transaction
- `team_rewards`: one-time team milestone awards
- `audit_logs`: administrator/security audit trail

Balance-changing operations are performed inside PostgreSQL transactions. The API never treats a browser-held balance as authoritative.
