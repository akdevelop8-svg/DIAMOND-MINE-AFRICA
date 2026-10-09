CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  numeric_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  total_earned NUMERIC(16,2) NOT NULL DEFAULT 0,
  total_recharged NUMERIC(16,2) NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC(16,2) NOT NULL DEFAULT 0,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_check_in_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS users_name_ci_uq ON users (LOWER(name));
CREATE INDEX IF NOT EXISTS users_referred_by_idx ON users (referred_by_user_id);
CREATE INDEX IF NOT EXISTS users_registered_at_idx ON users (registered_at DESC);

CREATE TABLE IF NOT EXISTS wallets (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  available_balance NUMERIC(16,2) NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  vip_tier INTEGER NOT NULL UNIQUE,
  mineral_name TEXT NOT NULL,
  invest_amount NUMERIC(16,2) NOT NULL CHECK (invest_amount > 0),
  daily_mining_amount NUMERIC(16,2) NOT NULL CHECK (daily_mining_amount >= 0),
  total_period_days INTEGER NOT NULL CHECK (total_period_days > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  vip_tier INTEGER NOT NULL,
  mineral_name TEXT NOT NULL,
  invest_amount NUMERIC(16,2) NOT NULL CHECK (invest_amount > 0),
  daily_mining_amount NUMERIC(16,2) NOT NULL CHECK (daily_mining_amount >= 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_claimed_at TIMESTAMPTZ,
  days_claimed INTEGER NOT NULL DEFAULT 0 CHECK (days_claimed >= 0),
  total_period_days INTEGER NOT NULL CHECK (total_period_days > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS investments_one_active_per_plan_uq
  ON investments (user_id, plan_id)
  WHERE days_claimed < total_period_days;
CREATE INDEX IF NOT EXISTS investments_user_idx ON investments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS investments_claim_idx ON investments (user_id, last_claimed_at);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('RECHARGE','INVESTMENT','WITHDRAW','MINING_CLAIM','CHECK_IN','REGISTRATION_BONUS','TEAM_BONUS','ADMIN_ADJUSTMENT')),
  amount NUMERIC(16,2) NOT NULL CHECK (amount >= 0),
  fee NUMERIC(16,2) NOT NULL DEFAULT 0 CHECK (fee >= 0),
  net_amount NUMERIC(16,2),
  status TEXT NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payment_method TEXT,
  account_number TEXT,
  account_name TEXT,
  transaction_code TEXT,
  proof_message TEXT,
  admin_note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS transactions_user_idx ON transactions (user_id, occurred_at DESC);
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check CHECK (type IN ('RECHARGE','INVESTMENT','WITHDRAW','MINING_CLAIM','CHECK_IN','REGISTRATION_BONUS','TEAM_BONUS','ADMIN_ADJUSTMENT'));

CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions (status, occurred_at DESC);
CREATE INDEX IF NOT EXISTS transactions_type_status_idx ON transactions (type, status, occurred_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS transactions_recharge_code_uq
  ON transactions (LOWER(transaction_code))
  WHERE type = 'RECHARGE' AND transaction_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS transaction_receipts (
  transaction_id TEXT PRIMARY KEY REFERENCES transactions(id) ON DELETE CASCADE,
  mime_type TEXT NOT NULL,
  data_url TEXT,
  storage_pathname TEXT,
  storage_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE transaction_receipts ADD COLUMN IF NOT EXISTS storage_pathname TEXT;
ALTER TABLE transaction_receipts ADD COLUMN IF NOT EXISTS storage_url TEXT;
ALTER TABLE transaction_receipts ALTER COLUMN data_url DROP NOT NULL;

CREATE TABLE IF NOT EXISTS wallet_ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id TEXT REFERENCES transactions(id) ON DELETE SET NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'REGISTRATION_BONUS','RECHARGE_CREDIT','INVESTMENT_DEBIT','MINING_CLAIM',
    'CHECK_IN','WITHDRAWAL_HOLD','WITHDRAWAL_REFUND','TEAM_BONUS','ADMIN_ADJUSTMENT'
  )),
  amount NUMERIC(16,2) NOT NULL CHECK (amount <> 0),
  balance_after NUMERIC(16,2) NOT NULL CHECK (balance_after >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS wallet_ledger_user_idx ON wallet_ledger (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS wallet_ledger_transaction_idx ON wallet_ledger (transaction_id);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS referral_earnings (
  id TEXT PRIMARY KEY,
  referrer_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
  rate_percent NUMERIC(6,2) NOT NULL CHECK (rate_percent >= 0),
  amount NUMERIC(16,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_transaction_id, referrer_user_id, level)
);
CREATE INDEX IF NOT EXISTS referral_earnings_referrer_idx ON referral_earnings (referrer_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS referral_earnings_source_idx ON referral_earnings (source_transaction_id);

CREATE TABLE IF NOT EXISTS team_rewards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_code TEXT NOT NULL,
  threshold_amount NUMERIC(16,2) NOT NULL,
  reward_amount NUMERIC(16,2) NOT NULL CHECK (reward_amount >= 0),
  source_transaction_id TEXT REFERENCES transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, reward_code)
);
CREATE INDEX IF NOT EXISTS team_rewards_user_idx ON team_rewards (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  target_transaction_id TEXT REFERENCES transactions(id) ON DELETE SET NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON audit_logs (actor_user_id, created_at DESC);

CREATE OR REPLACE VIEW user_wallet_summary AS
SELECT
  u.id,
  u.numeric_id,
  u.name,
  u.phone,
  u.role,
  w.available_balance,
  u.total_earned,
  u.total_recharged,
  u.total_withdrawn,
  u.referral_code,
  u.referred_by_user_id,
  u.registered_at,
  u.last_check_in_at
FROM users u
JOIN wallets w ON w.user_id = u.id;

-- Reference VIP plans. Safe to run repeatedly; values are synchronized with the existing UI plan catalog.
INSERT INTO plans (id, vip_tier, mineral_name, invest_amount, daily_mining_amount, total_period_days)
VALUES
  ('vip-1',1,'Uranium',300,30,365),
  ('vip-2',2,'Lithium',500,50,365),
  ('vip-3',3,'Copper',1000,70,365),
  ('vip-4',4,'Iron',3000,225,365),
  ('vip-5',5,'Platinum',7000,560,365),
  ('vip-6',6,'Sapphire',15000,1300,365),
  ('vip-7',7,'Ruby',30000,2750,365),
  ('vip-8',8,'Emerald',60000,5700,365),
  ('vip-9',9,'Gold',120000,11800,365),
  ('vip-10',10,'Diamond',200000,20500,365)
ON CONFLICT (id) DO UPDATE SET
  vip_tier=EXCLUDED.vip_tier,
  mineral_name=EXCLUDED.mineral_name,
  invest_amount=EXCLUDED.invest_amount,
  daily_mining_amount=EXCLUDED.daily_mining_amount,
  total_period_days=EXCLUDED.total_period_days,
  updated_at=NOW();
