import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { spawn } from 'child_process';
import { Readable } from 'stream';
import { query, withTransaction } from './server/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'dist');
const PORT = Number(process.env.API_PORT || 4000);
const ADMIN_NAME = String(process.env.ADMIN_NAME || 'Diamond Mine Africa').trim();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || '');
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || 'dma_session';
const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS || 7);
const APP_ORIGIN = String(process.env.APP_ORIGIN || '').trim().replace(/\/$/, '');
const CORS_ORIGINS = String(process.env.CORS_ORIGINS || APP_ORIGIN).split(',').map(v => v.trim()).filter(Boolean);
const APP_TIMEZONE = String(process.env.APP_TIMEZONE || 'Africa/Addis_Ababa');
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const COOKIE_SECURE = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : IS_PRODUCTION;
const MAX_RECEIPT_CHARS = 2_500_000;
const AUTH_RATE_WINDOW_MS = 5 * 60 * 1000;
const AUTH_RATE_LIMIT = 12;
const authRateBuckets = new Map();
let vercelBlobModulePromise = null;

async function getVercelBlobModule() {
  if (!vercelBlobModulePromise) vercelBlobModulePromise = import('@vercel/blob');
  return vercelBlobModulePromise;
}

function decodeReceiptDataUrl(dataUrl) {
  const match = String(dataUrl || '').match(/^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) return null;
  return { mimeType: match[1].toLowerCase(), buffer: Buffer.from(match[2], 'base64') };
}

async function uploadReceiptToBlob(transactionId, dataUrl) {
  const decoded = decodeReceiptDataUrl(dataUrl);
  if (!decoded) return null;
  try {
    const { put } = await getVercelBlobModule();
    const extension = decoded.mimeType === 'image/jpeg' ? 'jpg' : decoded.mimeType.split('/')[1];
    const pathname = `recharge-receipts/${transactionId}-${crypto.randomBytes(8).toString('hex')}.${extension}`;
    const blob = await put(pathname, decoded.buffer, {
      access: 'private',
      addRandomSuffix: false,
      contentType: decoded.mimeType,
    });
    return { pathname: blob.pathname, url: blob.url, mimeType: decoded.mimeType };
  } catch (error) {
    console.warn('Receipt Blob storage unavailable; retaining database receipt fallback:', error?.message || error);
    return null;
  }
}

async function deleteReceiptBlob(pathname) {
  if (!pathname) return;
  try {
    const { del } = await getVercelBlobModule();
    await del(pathname);
  } catch (error) {
    console.warn('Could not delete orphaned receipt blob:', error?.message || error);
  }
}

const CONFIG = {
  registrationBonus: 100,
  minInvestment: 300,
  maxInvestment: 200000,
  minWithdrawal: 150,
  withdrawalFeeRate: 0.08,
  dailyCheckInBonus: 1,
  miningPeriodDays: 365,
};



const COMMISSION_TIERS = [
  { level: 1, rate: 10 },
  { level: 2, rate: 3 },
  { level: 3, rate: 2 },
  { level: 4, rate: 1 },
];

const TEAM_RECHARGE_REWARDS = [
  { code:'team-15000', threshold:15000, reward:200 },
  { code:'team-25000', threshold:25000, reward:500 },
  { code:'team-50000', threshold:50000, reward:800 },
  { code:'team-75000', threshold:75000, reward:1200 },
  { code:'team-100000', threshold:100000, reward:1800 },
  { code:'team-150000', threshold:150000, reward:2500 },
  { code:'team-200000', threshold:200000, reward:3500 },
  { code:'team-250000', threshold:250000, reward:5000 },
];

function now() { return Date.now(); }
function round(n) { return Math.round((Number(n) + Number.EPSILON) * 100) / 100; }
function id(prefix) { return `${prefix}_${Date.now()}_${crypto.randomBytes(5).toString('hex')}`; }
function numericId() { return String(17960000 + crypto.randomInt(0, 90000)); }
function normalizePhone(value) { return String(value || '').trim().replace(/[^\d+]/g, ''); }
function isValidPhone(phone) { return phone.replace(/\D/g, '').length >= 9; }
function dateParts(ts = now()) {
  const d = new Date(ts);
  return {
    date: d.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric', timeZone:APP_TIMEZONE}),
    time: d.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', timeZone:APP_TIMEZONE}),
  };
}
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}
function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, expected] = stored.split(':');
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(actual, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function hashToken(token) { return crypto.createHash('sha256').update(token).digest('hex'); }
function parseCookies(header = '') {
  const cookies = {};
  for (const chunk of String(header).split(';')) {
    const [key, ...rest] = chunk.trim().split('=');
    if (key) cookies[key] = decodeURIComponent(rest.join('=') || '');
  }
  return cookies;
}
function setSessionCookie(res, token) {
  const attrs = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    `Max-Age=${SESSION_TTL_DAYS * 24 * 60 * 60}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (COOKIE_SECURE) attrs.push('Secure');
  res.setHeader('Set-Cookie', attrs.join('; '));
}
function clearSessionCookie(res) {
  const attrs = [`${SESSION_COOKIE}=`, 'Path=/', 'Max-Age=0', 'HttpOnly', 'SameSite=Lax'];
  if (COOKIE_SECURE) attrs.push('Secure');
  res.setHeader('Set-Cookie', attrs.join('; '));
}
function safeNumber(value) { return Number(value || 0); }
function parsePositiveAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? round(amount) : null;
}
function publicPaymentConfig() {
  return {
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    accountNumber: String(process.env.CBE_ACCOUNT_NUMBER || ''),
    accountName: String(process.env.CBE_ACCOUNT_NAME || ''),
    branch: String(process.env.CBE_BRANCH || 'Commercial Bank of Ethiopia'),
  };
}
function isUniqueError(error) { return error?.code === '23505'; }
function isForeignKeyError(error) { return error?.code === '23503'; }

async function ensureAdminUser() {
  if (!ADMIN_PASSWORD) return;
  const existing = await query(`SELECT id FROM users WHERE role='admin' ORDER BY registered_at LIMIT 1`);
  if (existing.rowCount) return;

  const adminId = 'admin_master';
  const passwordHash = hashPassword(ADMIN_PASSWORD);
  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO users (id,numeric_id,name,phone,password_hash,role,referral_code)
       VALUES ($1,'ADMIN',$2,'',$3,'admin','ADMIN')
       ON CONFLICT (id) DO NOTHING`,
      [adminId, ADMIN_NAME, passwordHash]
    );
    await client.query(`INSERT INTO wallets (user_id,available_balance) VALUES ($1,0) ON CONFLICT (user_id) DO NOTHING`, [adminId]);
  });
}

async function getPlanById(planId) {
  const result = await query(
    `SELECT id,vip_tier,mineral_name,invest_amount,daily_mining_amount,total_period_days
     FROM plans WHERE id=$1 AND is_active=TRUE LIMIT 1`,
    [String(planId || '')]
  );
  if (!result.rowCount) return null;
  const row=result.rows[0];
  return {
    id:row.id,
    vipTier:Number(row.vip_tier),
    mineralName:row.mineral_name,
    investAmount:safeNumber(row.invest_amount),
    dailyMiningAmount:safeNumber(row.daily_mining_amount),
    totalPeriodDays:Number(row.total_period_days),
  };
}

async function getUserById(userId) {
  const result = await query(
    `SELECT
       u.id,u.numeric_id,u.name,u.phone,u.role,u.total_earned,u.total_recharged,u.total_withdrawn,
       u.referral_code,u.referred_by_user_id,u.registered_at,u.last_check_in_at,
       parent.numeric_id AS referred_by_numeric_id,
       w.available_balance,
       COALESCE((
         SELECT json_agg(json_build_object(
           'id',i.id,'planId',i.plan_id,'vipTier',i.vip_tier,'mineralName',i.mineral_name,
           'investAmount',i.invest_amount,'dailyMiningAmount',i.daily_mining_amount,
           'startedAt',EXTRACT(EPOCH FROM i.started_at)*1000,
           'lastClaimedAt',CASE WHEN i.last_claimed_at IS NULL THEN NULL ELSE EXTRACT(EPOCH FROM i.last_claimed_at)*1000 END,
           'daysClaimed',i.days_claimed,'totalPeriodDays',i.total_period_days
         ) ORDER BY i.started_at DESC)
         FROM investments i
         WHERE i.user_id=u.id AND i.days_claimed < i.total_period_days
       ), '[]'::json) AS active_investments
     FROM users u
     JOIN wallets w ON w.user_id=u.id
     LEFT JOIN users parent ON parent.id=u.referred_by_user_id
     WHERE u.id=$1
     LIMIT 1`,
    [userId]
  );
  if (!result.rowCount) return null;
  const r = result.rows[0];
  return {
    id:r.id,
    numericId:r.numeric_id,
    name:r.name,
    phone:r.phone,
    balance:safeNumber(r.available_balance),
    totalEarned:safeNumber(r.total_earned),
    totalRecharged:safeNumber(r.total_recharged),
    totalWithdrawn:safeNumber(r.total_withdrawn),
    referralCode:r.referral_code,
    referredBy:r.referred_by_numeric_id || undefined,
    registeredAt:new Date(r.registered_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
    lastCheckInTimestamp:r.last_check_in_at ? new Date(r.last_check_in_at).getTime() : null,
    activeInvestments:Array.isArray(r.active_investments) ? r.active_investments : [],
  };
}

async function getTransactionsForUser(userId, limit = 250) {
  const result = await query(
    `SELECT t.id,t.user_id,t.type,t.amount,t.fee,t.net_amount,t.status,t.occurred_at,
            t.payment_method,t.account_number,t.account_name,t.transaction_code,t.proof_message,t.admin_note,
            u.name AS user_name,u.phone AS user_phone
     FROM transactions t JOIN users u ON u.id=t.user_id
     WHERE t.user_id=$1
     ORDER BY t.occurred_at DESC
     LIMIT $2`,
    [userId, Math.min(Math.max(Number(limit)||250,1),500)]
  );
  return result.rows.map(txPayload);
}

async function getAdminTransactions(limit = 500) {
  const result = await query(
    `SELECT t.id,t.user_id,t.type,t.amount,t.fee,t.net_amount,t.status,t.occurred_at,
            t.payment_method,t.account_number,t.account_name,t.transaction_code,t.proof_message,t.admin_note,
            u.name AS user_name,u.phone AS user_phone
     FROM transactions t JOIN users u ON u.id=t.user_id
     ORDER BY t.occurred_at DESC
     LIMIT $1`,
    [Math.min(Math.max(Number(limit)||500,1),1000)]
  );
  return result.rows.map(txPayload);
}

function txPayload(r) {
  const ts = new Date(r.occurred_at).getTime();
  const p = dateParts(ts);
  return {
    id:r.id,
    userId:r.user_id,
    userName:r.user_name,
    userPhone:r.user_phone,
    type:r.type,
    amount:safeNumber(r.amount),
    fee:safeNumber(r.fee),
    netAmount:r.net_amount == null ? undefined : safeNumber(r.net_amount),
    status:r.status,
    date:p.date,
    time:p.time,
    timestamp:ts,
    paymentMethod:r.payment_method || undefined,
    accountNumber:r.account_number || undefined,
    accountName:r.account_name || undefined,
    transactionCode:r.transaction_code || undefined,
    proofMessage:r.proof_message || undefined,
    adminNote:r.admin_note || undefined,
  };
}

async function createTransaction(client, user, type, amount, status, extra = {}) {
  const txId = extra.id || id('tx');
  await client.query(
    `INSERT INTO transactions (
      id,user_id,type,amount,fee,net_amount,status,occurred_at,
      payment_method,account_number,account_name,transaction_code,proof_message,admin_note,metadata
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),$8,$9,$10,$11,$12,$13,$14)`,
    [txId,user.id,type,round(amount),round(extra.fee||0),extra.netAmount==null?null:round(extra.netAmount),status,
     extra.paymentMethod||null,extra.accountNumber||null,extra.accountName||null,extra.transactionCode||null,
     extra.proofMessage||null,extra.adminNote||null,extra.metadata||{}]
  );
  return txId;
}

async function writeLedger(client, {userId, transactionId, entryType, amount, balanceAfter, metadata = {}}) {
  await client.query(
    `INSERT INTO wallet_ledger (id,user_id,transaction_id,entry_type,amount,balance_after,metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id('led'),userId,transactionId,entryType,round(amount),round(balanceAfter),metadata]
  );
}

async function creditWallet(client, userId, amount, entryType, transactionId = null, metadata = {}) {
  const result = await client.query(
    `UPDATE wallets
     SET available_balance=ROUND(available_balance + $2::numeric,2), updated_at=NOW()
     WHERE user_id=$1
     RETURNING available_balance`,
    [userId, round(amount)]
  );
  if (!result.rowCount) throw new Error('Wallet not found.');
  const balanceAfter = safeNumber(result.rows[0].available_balance);
  await writeLedger(client,{userId,transactionId,entryType,amount:Math.abs(amount),balanceAfter,metadata});
  return balanceAfter;
}

async function debitWallet(client, userId, amount, entryType, transactionId = null, metadata = {}) {
  const result = await client.query(
    `UPDATE wallets
     SET available_balance=ROUND(available_balance - $2::numeric,2), updated_at=NOW()
     WHERE user_id=$1 AND available_balance >= $2::numeric
     RETURNING available_balance`,
    [userId, round(amount)]
  );
  if (!result.rowCount) return null;
  const balanceAfter = safeNumber(result.rows[0].available_balance);
  await writeLedger(client,{userId,transactionId,entryType,amount:-Math.abs(amount),balanceAfter,metadata});
  return balanceAfter;
}

async function audit(client, actorUserId, action, targetUserId = null, targetTransactionId = null, details = {}) {
  await client.query(
    `INSERT INTO audit_logs (id,actor_user_id,action,target_user_id,target_transaction_id,details)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [id('audit'),actorUserId||null,action,targetUserId,targetTransactionId,details]
  );
}

async function issueSession(client, userId, role='user') {
  const token = crypto.randomBytes(32).toString('hex');
  await client.query(
    `INSERT INTO sessions (token_hash,user_id,role,expires_at)
     VALUES ($1,$2,$3,NOW() + ($4 || ' days')::interval)`,
    [hashToken(token),userId,role,String(SESSION_TTL_DAYS)]
  );
  return token;
}

async function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const bearer = String(req.headers.authorization || '');
  const rawToken = bearer.startsWith('Bearer ') ? bearer.slice(7).trim() : cookies[SESSION_COOKIE];
  if (!rawToken) return null;
  const result = await query(
    `SELECT s.token_hash,s.user_id,s.role AS session_role,u.id AS uid,u.role AS current_role
     FROM sessions s JOIN users u ON u.id=s.user_id
     WHERE s.token_hash=$1 AND s.revoked_at IS NULL AND s.expires_at>NOW() LIMIT 1`,
    [hashToken(rawToken)]
  );
  if (!result.rowCount) return null;
  return { ...result.rows[0], role: result.rows[0].current_role, rawToken };
}

async function auth(req, res, next) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return res.status(401).json({error:'Authentication required'});
    const user = await getUserById(session.user_id);
    if (!user) return res.status(401).json({error:'User session is invalid'});
    session.role = user.role;
    req.session = session;
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

function admin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({error:'Administrator access required'});
  next();
}

async function findReferrer(refBy) {
  const value = String(refBy || '').trim();
  if (!value) return null;
  const result = await query(`SELECT id FROM users WHERE numeric_id=$1 OR referral_code=$1 LIMIT 1`, [value]);
  return result.rowCount ? result.rows[0].id : null;
}

async function creditReferralCommissions(client, rechargeTxId, rechargeUserId, rechargeAmount) {
  let currentUserId = rechargeUserId;
  for (const tier of COMMISSION_TIERS) {
    const parent = await client.query(`SELECT referred_by_user_id FROM users WHERE id=$1 LIMIT 1`, [currentUserId]);
    const referrerId = parent.rows[0]?.referred_by_user_id;
    if (!referrerId) break;

    const commission = round(rechargeAmount * tier.rate / 100);
    if (commission <= 0) break;

    const earningId = id('ref');
    const inserted = await client.query(
      `INSERT INTO referral_earnings (id,referrer_user_id,referred_user_id,source_transaction_id,level,rate_percent,amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (source_transaction_id,referrer_user_id,level) DO NOTHING
       RETURNING id`,
      [earningId,referrerId,currentUserId,rechargeTxId,tier.level,tier.rate,commission]
    );
    if (!inserted.rowCount) { currentUserId = referrerId; continue; }

    const referrer = { id:referrerId };
    const bonusTx = await createTransaction(client, referrer,'TEAM_BONUS',commission,'APPROVED',{
      adminNote:`Level ${tier.level} referral commission (${tier.rate}%) from recharge ${rechargeTxId}`,
      metadata:{ sourceRechargeTransactionId: rechargeTxId, referralLevel:tier.level, ratePercent:tier.rate }
    });
    await creditWallet(client,referrerId,commission,'TEAM_BONUS',bonusTx,{referralLevel:tier.level,sourceRechargeTransactionId:rechargeTxId});
    await client.query(`UPDATE users SET total_earned=ROUND(total_earned+$2::numeric,2) WHERE id=$1`, [referrer.id, commission]);
    currentUserId = referrerId;
  }
}

async function teamVolume(client, userId) {
  const result = await client.query(
    `WITH RECURSIVE team AS (
       SELECT id FROM users WHERE referred_by_user_id=$1
       UNION ALL
       SELECT u.id FROM users u JOIN team t ON u.referred_by_user_id=t.id
     )
     SELECT COALESCE(SUM(t.amount),0) AS total
     FROM transactions t
     WHERE t.user_id IN (SELECT id FROM team)
       AND t.type='RECHARGE' AND t.status='APPROVED'`,
    [userId]
  );
  return safeNumber(result.rows[0]?.total);
}

async function awardTeamMilestones(client, userId, sourceTransactionId) {
  const volume = await teamVolume(client,userId);
  if (volume <= 0) return;
  for (const reward of TEAM_RECHARGE_REWARDS) {
    if (volume < reward.threshold) continue;
    const inserted = await client.query(
      `INSERT INTO team_rewards (id,user_id,reward_code,threshold_amount,reward_amount,source_transaction_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (user_id,reward_code) DO NOTHING
       RETURNING id`,
      [id('teamreward'),userId,reward.code,reward.threshold,reward.reward,sourceTransactionId]
    );
    if (!inserted.rowCount) continue;
    const txId = await createTransaction(client,{id:userId},'TEAM_BONUS',reward.reward,'APPROVED',{
      adminNote:`Team recharge milestone ${reward.threshold.toLocaleString()} ETB`,
      metadata:{teamRewardCode:reward.code,threshold:reward.threshold}
    });
    await creditWallet(client,userId,reward.reward,'TEAM_BONUS',txId,{teamRewardCode:reward.code});
    await client.query(`UPDATE users SET total_earned=ROUND(total_earned+$2::numeric,2) WHERE id=$1`, [userId,reward.reward]);
  }
}

function authRateLimit(req, res, next) {
  const key = `${req.ip || 'unknown'}:${req.path}`;
  const current = Date.now();
  const bucket = authRateBuckets.get(key);
  if (!bucket || current - bucket.startedAt >= AUTH_RATE_WINDOW_MS) {
    authRateBuckets.set(key, {startedAt:current,count:1});
    return next();
  }
  bucket.count += 1;
  if (bucket.count > AUTH_RATE_LIMIT) {
    const retryAfter = Math.max(1, Math.ceil((AUTH_RATE_WINDOW_MS - (current - bucket.startedAt)) / 1000));
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({error:'Too many authentication attempts. Please try again later.'});
  }
  if (authRateBuckets.size > 5000) {
    for (const [bucketKey, value] of authRateBuckets) {
      if (current - value.startedAt >= AUTH_RATE_WINDOW_MS) authRateBuckets.delete(bucketKey);
    }
  }
  next();
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
if (CORS_ORIGINS.length) {
  app.use(cors({
    origin(origin, callback) {
      if (!origin || CORS_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed.'));
    },
    credentials: true,
  }));
}
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, private');
    res.setHeader('Vary', 'Cookie');
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  if (IS_PRODUCTION) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

function requestOrigin(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const protocol = forwardedProto || req.protocol;
  const host = String(req.headers.host || '').trim();
  return host ? `${protocol}://${host}`.replace(/\/$/, '') : '';
}

function csrfOriginGuard(req, res, next) {
  if (!['POST','PUT','PATCH','DELETE'].includes(req.method)) return next();
  const origin = String(req.headers.origin || '').trim();
  const referer = String(req.headers.referer || '').trim();
  const candidate = origin || (referer ? (() => { try { return new URL(referer).origin; } catch { return ''; } })() : '');
  if (!candidate) return next();
  const allowed = new Set([
    ...CORS_ORIGINS,
    APP_ORIGIN,
    requestOrigin(req),
  ].filter(Boolean));
  if (allowed.has(candidate)) return next();
  return res.status(403).json({error:'Request origin is not allowed.'});
}

app.use(express.json({ limit: '3.5mb' }));
app.use(csrfOriginGuard);

app.get('/api/health', async (_req,res,next)=>{
  try {
    const result = await query(`SELECT NOW() AS now,
      to_regclass('public.users') AS users_table,
      to_regclass('public.wallets') AS wallets_table,
      to_regclass('public.transactions') AS transactions_table,
      to_regclass('public.wallet_ledger') AS ledger_table`);
    const row=result.rows[0];
    const schemaReady=Boolean(row.users_table && row.wallets_table && row.transactions_table && row.ledger_table);
    const paymentConfigured=Boolean(process.env.CBE_ACCOUNT_NUMBER && process.env.CBE_ACCOUNT_NAME);
    res.status(schemaReady ? 200 : 503).json({
      ok:schemaReady,
      service:'Diamond Mine Africa API',
      database:'connected',
      schemaReady,
      paymentConfigured,
      receiptStorage: 'Vercel Blob with database fallback',
      time:new Date(row.now).toISOString()
    });
  } catch (error) { next(error); }
});

app.get('/api/config', (_req,res)=>res.json({
  platform:'DiamondMine Africa',
  currency:'ETB',
  registrationBonus:CONFIG.registrationBonus,
  minInvestment:CONFIG.minInvestment,
  maxInvestment:CONFIG.maxInvestment,
  minWithdrawal:CONFIG.minWithdrawal,
  withdrawalFeeRate:CONFIG.withdrawalFeeRate,
}));

app.get('/api/plans', async (_req,res,next)=>{
  try {
    const result = await query(`SELECT id,vip_tier,mineral_name,invest_amount,daily_mining_amount,total_period_days FROM plans WHERE is_active=TRUE ORDER BY vip_tier ASC`);
    res.json({plans:result.rows.map(row => ({
      id:row.id,
      vipTier:Number(row.vip_tier),
      mineralName:row.mineral_name,
      investAmount:Number(row.invest_amount),
      dailyMiningAmount:Number(row.daily_mining_amount),
      totalPeriodDays:Number(row.total_period_days),
    }))});
  } catch (error) { next(error); }
});

app.get('/api/payment-config', auth, (req,res)=>{
  if (req.user.role === 'admin') return res.status(403).json({error:'Admin account does not use customer recharge payment details.'});
  res.json({paymentAccount:publicPaymentConfig()});
});

app.post('/api/auth/register', authRateLimit, async (req,res,next)=>{
  try {
    const name=String(req.body?.name||'').trim();
    const phone=normalizePhone(req.body?.phone);
    const password=String(req.body?.password||'');
    const refBy=String(req.body?.refBy || req.body?.ref_by || '').trim();
    if(name.length<2 || name.length>80) return res.status(400).json({error:'Please enter a valid full name.'});
    if(!isValidPhone(phone)) return res.status(400).json({error:'Please enter a valid phone number.'});
    if(password.length<8) return res.status(400).json({error:'Password must be at least 8 characters long.'});

    const referrerId = await findReferrer(refBy);
    const userId=id('usr');
    let numeric=numericId();
    const passwordHash=hashPassword(password);

    const payload = await withTransaction(async (client)=>{
      while ((await client.query('SELECT 1 FROM users WHERE numeric_id=$1',[numeric])).rowCount) numeric=numericId();
      await client.query(
        `INSERT INTO users (id,numeric_id,name,phone,password_hash,role,total_earned,total_recharged,total_withdrawn,referral_code,referred_by_user_id)
         VALUES ($1,$2,$3,$4,$5,'user',0,0,0,$2,$6)`,
        [userId,numeric,name,phone,passwordHash,referrerId]
      );
      await client.query(`INSERT INTO wallets (user_id,available_balance) VALUES ($1,0)`, [userId]);
      const txId=await createTransaction(client,{id:userId},'REGISTRATION_BONUS',CONFIG.registrationBonus,'APPROVED',{adminNote:'Welcome Registration Bonus'});
      await creditWallet(client,userId,CONFIG.registrationBonus,'REGISTRATION_BONUS',txId,{reason:'registration'});
      await client.query(`UPDATE users SET total_earned=$2 WHERE id=$1`, [userId,CONFIG.registrationBonus]);
      const token=await issueSession(client,userId,'user');
      return {token};
    });
    setSessionCookie(res,payload.token);
    const user=await getUserById(userId);
    res.status(201).json({authenticated:true,isAdmin:false,user,transactions:await getTransactionsForUser(userId)});
  } catch (error) {
    if (isUniqueError(error)) return res.status(409).json({error:'An account with this Name, Phone, or referral identifier already exists.'});
    next(error);
  }
});

app.post('/api/auth/login', authRateLimit, async (req,res,next)=>{
  try {
    const identifier=String(req.body?.nameOrPhone||'').trim();
    const password=String(req.body?.password||'');
    if (!identifier || !password) return res.status(400).json({error:'Please enter your login details.'});

    const adminPasswordMatches = ADMIN_PASSWORD && password.length === ADMIN_PASSWORD.length && crypto.timingSafeEqual(Buffer.from(password),Buffer.from(ADMIN_PASSWORD));
    if (ADMIN_PASSWORD && identifier.toLowerCase()===ADMIN_NAME.toLowerCase() && adminPasswordMatches) {
      await ensureAdminUser();
      const adminResult=await query(`SELECT id FROM users WHERE role='admin' ORDER BY registered_at LIMIT 1`);
      if (!adminResult.rowCount) return res.status(500).json({error:'Administrator account is not configured.'});
      const adminId=adminResult.rows[0].id;
      const token=await withTransaction((client)=>issueSession(client,adminId,'admin'));
      setSessionCookie(res,token);
      return res.json({authenticated:true,isAdmin:true,user:await getUserById(adminId),transactions:[]});
    }

    const normalizedIdentifier=normalizePhone(identifier);
    const lookup=await query(
      `SELECT id,password_hash FROM users
       WHERE LOWER(name)=LOWER($1) OR phone=$2 OR numeric_id=$1
       LIMIT 1`,
      [identifier, normalizedIdentifier]
    );
    if (!lookup.rowCount || !verifyPassword(password,lookup.rows[0].password_hash)) return res.status(401).json({error:'Invalid credentials. Please verify your Name / Phone / ID and Password.'});
    const userId=lookup.rows[0].id;
    const token=await withTransaction((client)=>issueSession(client,userId,'user'));
    setSessionCookie(res,token);
    res.json({authenticated:true,isAdmin:false,user:await getUserById(userId),transactions:await getTransactionsForUser(userId)});
  } catch (error) { next(error); }
});

app.post('/api/auth/logout', auth, async (req,res,next)=>{
  try {
    await query(`UPDATE sessions SET revoked_at=NOW() WHERE token_hash=$1`,[hashToken(req.session.rawToken)]);
    clearSessionCookie(res);
    res.json({ok:true});
  } catch (error) { next(error); }
});

app.get('/api/me', auth, async (req,res,next)=>{
  try {
    res.json({isAdmin:req.user.role==='admin',user:req.user,transactions:req.user.role==='admin'?[]:await getTransactionsForUser(req.user.id)});
  } catch (error) { next(error); }
});

app.get('/api/transactions', auth, async (req,res,next)=>{
  try { res.json({transactions:req.user.role==='admin'?await getAdminTransactions(req.query.limit):await getTransactionsForUser(req.user.id,req.query.limit)}); }
  catch (error) { next(error); }
});

app.get('/api/team/summary', auth, async (req,res,next)=>{
  try {
    const result=await query(
      `WITH RECURSIVE downline AS (
         SELECT id,1 AS level FROM users WHERE referred_by_user_id=$1
         UNION ALL
         SELECT u.id,d.level+1 FROM users u JOIN downline d ON u.referred_by_user_id=d.id WHERE d.level<20
       )
       SELECT d.level,COUNT(*)::int AS members,COALESCE(SUM(r.amount),0) AS recharge_volume
       FROM downline d LEFT JOIN transactions r ON r.user_id=d.id AND r.type='RECHARGE' AND r.status='APPROVED'
       GROUP BY d.level ORDER BY d.level`,
      [req.user.id]
    );
    const earnings=await query(`SELECT COALESCE(SUM(amount),0) AS total FROM referral_earnings WHERE referrer_user_id=$1`,[req.user.id]);
    const rewardRows=await query(`SELECT reward_code,reward_amount,threshold_amount,created_at FROM team_rewards WHERE user_id=$1 ORDER BY created_at DESC`,[req.user.id]);
    res.json({
      referralCode:req.user.referralCode,
      levels:result.rows.map(r=>({level:Number(r.level),members:Number(r.members),rechargeVolume:safeNumber(r.recharge_volume)})),
      totalCommission:safeNumber(earnings.rows[0]?.total),
      rewards:rewardRows.rows.map(r=>({code:r.reward_code,amount:safeNumber(r.reward_amount),threshold:safeNumber(r.threshold_amount),createdAt:r.created_at})),
    });
  } catch(error){ next(error); }
});

app.post('/api/investments', auth, async (req,res,next)=>{
  try {
    if(req.user.role==='admin') return res.status(403).json({error:'Admin cannot invest.'});
    const plan=await getPlanById(req.body?.planId);
    if(!plan) return res.status(400).json({error:'Invalid VIP plan.'});

    const result=await withTransaction(async(client)=>{
      const existing=await client.query(
        `SELECT 1 FROM investments WHERE user_id=$1 AND plan_id=$2 AND days_claimed<total_period_days LIMIT 1 FOR UPDATE`,
        [req.user.id,req.body.planId]
      );
      if(existing.rowCount) throw Object.assign(new Error(`VIP ${plan.vipTier} is already active.`),{status:409,reason:'ALREADY_ACTIVE'});

      const debitAmount=plan.investAmount;
      const txId=await createTransaction(client,req.user,'INVESTMENT',debitAmount,'APPROVED',{adminNote:`VIP ${plan.vipTier} (${plan.mineralName}) Investment Activation`});
      const balanceAfter=await debitWallet(client,req.user.id,debitAmount,'INVESTMENT_DEBIT',txId,{planId:String(req.body.planId)});
      if(balanceAfter===null) throw Object.assign(new Error(`Insufficient balance. Please recharge at least ${debitAmount.toLocaleString()} ETB.`),{status:400,reason:'INSUFFICIENT_BALANCE'});
      const investmentId=id('inv');
      await client.query(
        `INSERT INTO investments (id,user_id,plan_id,vip_tier,mineral_name,invest_amount,daily_mining_amount,started_at,last_claimed_at,days_claimed,total_period_days)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW(),0,$8)`,
        [investmentId,req.user.id,String(req.body.planId),plan.vipTier,plan.mineralName,plan.investAmount,plan.dailyMiningAmount,plan.totalPeriodDays]
      );
      await audit(client,req.user.id,'INVESTMENT_CREATED',req.user.id,txId,{planId:String(req.body.planId),balanceAfter});
      return investmentId;
    });
    res.json({user:await getUserById(req.user.id),transactions:await getTransactionsForUser(req.user.id),investment:{id:result,planId:String(req.body.planId),vipTier:plan.vipTier,mineralName:plan.mineralName,investAmount:plan.investAmount,dailyMiningAmount:plan.dailyMiningAmount,startedAt:now(),lastClaimedAt:now(),daysClaimed:0,totalPeriodDays:plan.totalPeriodDays}});
  } catch(error){
    if(error?.status) return res.status(error.status).json({error:error.message,reason:error.reason});
    if(isUniqueError(error)) return res.status(409).json({error:'This VIP plan is already active.',reason:'ALREADY_ACTIVE'});
    next(error);
  }
});

app.post('/api/investments/:investmentId/claim', auth, async (req,res,next)=>{
  try {
    if(req.user.role==='admin') return res.status(403).json({error:'Admin cannot claim.'});
    const result=await withTransaction(async(client)=>{
      const claimed=await client.query(
        `UPDATE investments
         SET days_claimed=days_claimed+1,last_claimed_at=NOW()
         WHERE id=$1 AND user_id=$2 AND days_claimed<total_period_days
           AND (last_claimed_at IS NULL OR last_claimed_at <= NOW()-INTERVAL '24 hours')
         RETURNING daily_mining_amount,days_claimed,total_period_days`,
        [req.params.investmentId,req.user.id]
      );
      if(!claimed.rowCount) {
        const existing=await client.query(`SELECT id,days_claimed,total_period_days,last_claimed_at FROM investments WHERE id=$1 AND user_id=$2 LIMIT 1`,[req.params.investmentId,req.user.id]);
        if(!existing.rowCount) throw Object.assign(new Error('Active VIP plan not found.'),{status:404});
        if(Number(existing.rows[0].days_claimed)>=Number(existing.rows[0].total_period_days)) throw Object.assign(new Error('This VIP plan has completed its 365-day period.'),{status:400});
        throw Object.assign(new Error('Please wait until the next 24-hour claim window.'),{status:400});
      }
      const amount=safeNumber(claimed.rows[0].daily_mining_amount);
      const txId=await createTransaction(client,req.user,'MINING_CLAIM',amount,'APPROVED',{adminNote:`VIP Daily Mining Yield (+${amount} ETB)`});
      await creditWallet(client,req.user.id,amount,'MINING_CLAIM',txId,{investmentId:req.params.investmentId});
      await client.query(`UPDATE users SET total_earned=ROUND(total_earned+$2::numeric,2) WHERE id=$1`,[req.user.id,amount]);
      await audit(client,req.user.id,'MINING_CLAIM',req.user.id,txId,{investmentId:req.params.investmentId});
      return amount;
    });
    res.json({user:await getUserById(req.user.id),transactions:await getTransactionsForUser(req.user.id),amount:result});
  }catch(error){ if(error?.status) return res.status(error.status).json({error:error.message}); next(error); }
});

app.post('/api/check-in', auth, async (req,res,next)=>{
  try {
    if(req.user.role==='admin') return res.status(403).json({error:'Admin cannot claim.'});
    const result=await withTransaction(async(client)=>{
      const updated=await client.query(
        `UPDATE users SET last_check_in_at=NOW()
         WHERE id=$1 AND (last_check_in_at IS NULL OR last_check_in_at <= NOW()-INTERVAL '24 hours')
         RETURNING id`,[req.user.id]
      );
      if(!updated.rowCount) throw Object.assign(new Error('Daily check-in is available after the 24-hour window.'),{status:400});
      const txId=await createTransaction(client,req.user,'CHECK_IN',CONFIG.dailyCheckInBonus,'APPROVED',{adminNote:'Daily Active Check-in Reward (+1 ETB)'});
      await creditWallet(client,req.user.id,CONFIG.dailyCheckInBonus,'CHECK_IN',txId);
      await client.query(`UPDATE users SET total_earned=ROUND(total_earned+$2::numeric,2) WHERE id=$1`,[req.user.id,CONFIG.dailyCheckInBonus]);
      return CONFIG.dailyCheckInBonus;
    });
    res.json({user:await getUserById(req.user.id),transactions:await getTransactionsForUser(req.user.id),amount:result});
  }catch(error){ if(error?.status) return res.status(error.status).json({error:error.message}); next(error); }
});

app.post('/api/recharge', auth, async (req,res,next)=>{
  try {
    if(req.user.role==='admin') return res.status(403).json({error:'Admin cannot recharge.'});
    const amount=parsePositiveAmount(req.body?.amount);
    const code=String(req.body?.transactionCode||'').trim().toUpperCase();
    const proofMessage=String(req.body?.proofMessage||'').trim().slice(0,500);
    const receiptImageUrl=String(req.body?.receiptImageUrl||'').trim();
    if(amount===null || amount<CONFIG.minInvestment || amount>CONFIG.maxInvestment) return res.status(400).json({error:`Recharge amount must be between ${CONFIG.minInvestment.toLocaleString()} ETB and ${CONFIG.maxInvestment.toLocaleString()} ETB.`});
    if(!code || code.length>120) return res.status(400).json({error:'Please enter a valid CBE transaction reference number.'});
    if(receiptImageUrl && receiptImageUrl.length>MAX_RECEIPT_CHARS) return res.status(413).json({error:'Receipt image is too large. Please upload a smaller screenshot.'});
    if(receiptImageUrl && !/^data:image\/(png|jpe?g|webp);base64,/i.test(receiptImageUrl)) return res.status(400).json({error:'Receipt must be a PNG, JPG, or WebP image.'});

    const txId=await withTransaction(async(client)=>{
      const forcedId=id('tx');
      await createTransaction(client,req.user,'RECHARGE',amount,'PENDING',{
        id:forcedId,
        paymentMethod:'Commercial Bank of Ethiopia (CBE)',
        accountNumber:publicPaymentConfig().accountNumber,
        accountName:publicPaymentConfig().accountName,
        transactionCode:code,
        proofMessage,
        adminNote:'Pending administrator verification',
      });
      if(receiptImageUrl){
        const mime=receiptImageUrl.match(/^data:([^;]+);/)?.[1] || 'image/jpeg';
        await client.query(`INSERT INTO transaction_receipts (transaction_id,mime_type,data_url) VALUES ($1,$2,$3)`,[forcedId,mime,receiptImageUrl]);
      }
      return forcedId;
    });
    if (receiptImageUrl) {
      const stored = await uploadReceiptToBlob(txId, receiptImageUrl);
      if (stored) {
        await query(
          `UPDATE transaction_receipts SET mime_type=$2,data_url=NULL,storage_pathname=$3,storage_url=$4 WHERE transaction_id=$1`,
          [txId,stored.mimeType,stored.pathname,stored.url]
        );
      }
    }
    const user=await getUserById(req.user.id);
    const transactions=await getTransactionsForUser(req.user.id);
    const transaction=transactions.find(t=>t.id===txId);
    res.status(201).json({user,transactions,transaction});
  }catch(error){
    if(isUniqueError(error)) return res.status(409).json({error:'This CBE transaction reference has already been submitted.'});
    next(error);
  }
});

app.post('/api/withdraw', auth, async (req,res,next)=>{
  try {
    if(req.user.role==='admin') return res.status(403).json({error:'Admin cannot withdraw.'});
    const amount=parsePositiveAmount(req.body?.amount);
    const paymentMethod=String(req.body?.paymentMethod||'').trim().slice(0,80);
    const accountNumber=String(req.body?.accountNumber||'').trim().slice(0,100);
    const accountName=String(req.body?.accountName||'').trim().slice(0,120);
    if(amount===null || amount<CONFIG.minWithdrawal) return res.status(400).json({error:`Minimum withdrawal amount is ${CONFIG.minWithdrawal.toLocaleString()} ETB.`});
    if(!paymentMethod || !accountNumber || !accountName) return res.status(400).json({error:'Please enter valid payout details.'});

    const result=await withTransaction(async(client)=>{
      const fee=round(amount*CONFIG.withdrawalFeeRate), netAmount=round(amount-fee);
      const txId=await createTransaction(client,req.user,'WITHDRAW',amount,'PENDING',{fee,netAmount,paymentMethod,accountNumber,accountName,adminNote:`Pending payout of ${netAmount.toLocaleString()} ETB (${CONFIG.withdrawalFeeRate*100}% fee)`});
      const balanceAfter=await debitWallet(client,req.user.id,amount,'WITHDRAWAL_HOLD',txId,{reason:'pending_withdrawal'});
      if(balanceAfter===null) throw Object.assign(new Error(`Insufficient balance. Available: ${req.user.balance.toLocaleString()} ETB.`),{status:400});
      await audit(client,req.user.id,'WITHDRAWAL_REQUESTED',req.user.id,txId,{balanceAfter,paymentMethod});
      return {txId};
    });
    const transactions=await getTransactionsForUser(req.user.id);
    res.status(201).json({user:await getUserById(req.user.id),transactions,transaction:transactions.find(t=>t.id===result.txId)});
  }catch(error){ if(error?.status) return res.status(error.status).json({error:error.message}); next(error); }
});

app.get('/api/admin/state', auth, admin, async (req,res,next)=>{
  try {
    const [users,transactions,stats]=await Promise.all([
      query(`SELECT u.id,u.numeric_id,u.name,u.phone,u.role,u.total_earned,u.total_recharged,u.total_withdrawn,u.referral_code,u.registered_at,u.last_check_in_at,w.available_balance FROM users u JOIN wallets w ON w.user_id=u.id WHERE u.role='user' ORDER BY u.registered_at DESC LIMIT 2000`),
      getAdminTransactions(500),
      query(`SELECT
        COUNT(*) FILTER (WHERE u.role='user')::int AS total_users,
        COALESCE(SUM(u.total_recharged) FILTER (WHERE u.role='user'),0) AS total_recharged,
        COALESCE(SUM(u.total_withdrawn) FILTER (WHERE u.role='user'),0) AS total_withdrawn,
        (SELECT COUNT(*)::int FROM transactions WHERE type='RECHARGE' AND status='PENDING') AS pending_recharges,
        (SELECT COUNT(*)::int FROM transactions WHERE type='WITHDRAW' AND status='PENDING') AS pending_withdrawals,
        (SELECT COUNT(*)::int FROM transactions) AS total_transactions
       FROM users u`),
    ]);
    res.json({
      users:users.rows.map(r=>({id:r.id,numericId:r.numeric_id,name:r.name,phone:r.phone,balance:safeNumber(r.available_balance),totalEarned:safeNumber(r.total_earned),totalRecharged:safeNumber(r.total_recharged),totalWithdrawn:safeNumber(r.total_withdrawn),referralCode:r.referral_code,registeredAt:new Date(r.registered_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),lastCheckInTimestamp:r.last_check_in_at?new Date(r.last_check_in_at).getTime():null,activeInvestments:[]})),
      transactions,
      stats:{
        totalUsers:Number(stats.rows[0]?.total_users||0),
        totalRecharged:safeNumber(stats.rows[0]?.total_recharged),
        totalWithdrawn:safeNumber(stats.rows[0]?.total_withdrawn),
        pendingRecharges:Number(stats.rows[0]?.pending_recharges||0),
        pendingWithdrawals:Number(stats.rows[0]?.pending_withdrawals||0),
        totalTransactions:Number(stats.rows[0]?.total_transactions||0),
      },
    });
  }catch(error){ next(error); }
});

app.get('/api/admin/recharge/:txId/receipt', auth, admin, async (req,res,next)=>{
  try {
    const result=await query(`SELECT mime_type,data_url,storage_pathname,storage_url FROM transaction_receipts WHERE transaction_id=$1 LIMIT 1`,[req.params.txId]);
    if(!result.rowCount) return res.status(404).json({error:'Receipt proof not found.'});
    const row=result.rows[0];
    if (row.storage_pathname) {
      return res.json({receiptImageUrl:`/api/admin/recharge/${encodeURIComponent(req.params.txId)}/receipt/view`,mimeType:row.mime_type});
    }
    if (row.data_url) return res.json({receiptImageUrl:row.data_url,mimeType:row.mime_type});
    return res.status(404).json({error:'Receipt proof is unavailable.'});
  }catch(error){ next(error); }
});

app.get('/api/admin/recharge/:txId/receipt/view', auth, admin, async (req,res,next)=>{
  try {
    const result=await query(`SELECT mime_type,data_url,storage_pathname FROM transaction_receipts WHERE transaction_id=$1 LIMIT 1`,[req.params.txId]);
    if(!result.rowCount) return res.status(404).end();
    const row=result.rows[0];
    res.setHeader('Cache-Control','private, no-store');
    if (row.storage_pathname) {
      const { get } = await getVercelBlobModule();
      const blob = await get(row.storage_pathname, { access:'private' });
      if (!blob) return res.status(404).end();
      res.setHeader('Content-Type', blob.blob.contentType || row.mime_type || 'image/jpeg');
      return Readable.fromWeb(blob.stream).pipe(res);
    }
    const decoded=decodeReceiptDataUrl(row.data_url);
    if(!decoded) return res.status(404).end();
    res.setHeader('Content-Type',decoded.mimeType);
    return res.end(decoded.buffer);
  }catch(error){ next(error); }
});

app.post('/api/admin/recharge/:txId/approve', auth, admin, async (req,res,next)=>{
  try {
    const result=await withTransaction(async(client)=>{
      const txRes=await client.query(`SELECT * FROM transactions WHERE id=$1 AND type='RECHARGE' AND status='PENDING' FOR UPDATE`,[req.params.txId]);
      if(!txRes.rowCount) throw Object.assign(new Error('Pending recharge not found.'),{status:404});
      const tx=txRes.rows[0];
      const userRes=await client.query(`SELECT id,numeric_id,name FROM users WHERE id=$1 LIMIT 1`,[tx.user_id]);
      if(!userRes.rowCount) throw Object.assign(new Error('User not found.'),{status:404});
      const user=userRes.rows[0];
      await client.query(`UPDATE transactions SET status='APPROVED',admin_note='Verified and credited by Admin' WHERE id=$1`,[tx.id]);
      await creditWallet(client,user.id,safeNumber(tx.amount),'RECHARGE_CREDIT',tx.id,{transactionCode:tx.transaction_code});
      await client.query(`UPDATE users SET total_recharged=ROUND(total_recharged+$2::numeric,2) WHERE id=$1`,[user.id,safeNumber(tx.amount)]);
      await creditReferralCommissions(client,tx.id,user.id,safeNumber(tx.amount));
      const parentRows=await client.query(`WITH RECURSIVE ancestors AS (SELECT referred_by_user_id AS id FROM users WHERE id=$1 UNION ALL SELECT u.referred_by_user_id FROM users u JOIN ancestors a ON u.id=a.id WHERE a.id IS NOT NULL) SELECT id FROM ancestors WHERE id IS NOT NULL`,[user.id]);
      for(const row of parentRows.rows){ await awardTeamMilestones(client,row.id,tx.id); }
      await audit(client,req.user.id,'RECHARGE_APPROVED',user.id,tx.id,{amount:safeNumber(tx.amount)});
      return tx.id;
    });
    res.json({ok:true,transactionId:result});
  }catch(error){ if(error?.status) return res.status(error.status).json({error:error.message}); if(isForeignKeyError(error)) return res.status(409).json({error:'Recharge could not be credited because related records are missing.'}); next(error); }
});

app.post('/api/admin/recharge/:txId/reject', auth, admin, async (req,res,next)=>{
  try {
    await withTransaction(async(client)=>{
      const tx=await client.query(`SELECT id,user_id FROM transactions WHERE id=$1 AND type='RECHARGE' AND status='PENDING' FOR UPDATE`,[req.params.txId]);
      if(!tx.rowCount) throw Object.assign(new Error('Pending recharge not found.'),{status:404});
      const note=String(req.body?.note||'Rejected: Invalid or unconfirmed CBE transaction reference.').slice(0,500);
      await client.query(`UPDATE transactions SET status='REJECTED',admin_note=$2 WHERE id=$1`,[req.params.txId,note]);
      await audit(client,req.user.id,'RECHARGE_REJECTED',tx.rows[0].user_id,req.params.txId,{note});
    });
    res.json({ok:true});
  }catch(error){ if(error?.status) return res.status(error.status).json({error:error.message}); next(error); }
});

app.post('/api/admin/withdraw/:txId/approve', auth, admin, async (req,res,next)=>{
  try {
    await withTransaction(async(client)=>{
      const tx=await client.query(`SELECT id,user_id,amount,net_amount,payment_method,account_number FROM transactions WHERE id=$1 AND type='WITHDRAW' AND status='PENDING' FOR UPDATE`,[req.params.txId]);
      if(!tx.rowCount) throw Object.assign(new Error('Pending withdrawal not found.'),{status:404});
      const row=tx.rows[0];
      await client.query(`UPDATE transactions SET status='APPROVED',admin_note=$2 WHERE id=$1`,[row.id,`Payout of ${safeNumber(row.net_amount||row.amount)} ETB successfully transferred to ${row.payment_method} (${row.account_number})`]);
      await client.query(`UPDATE users SET total_withdrawn=ROUND(total_withdrawn+$2::numeric,2) WHERE id=$1`,[row.user_id,safeNumber(row.amount)]);
      await audit(client,req.user.id,'WITHDRAW_APPROVED',row.user_id,row.id,{amount:safeNumber(row.amount),netAmount:safeNumber(row.net_amount||row.amount)});
    });
    res.json({ok:true});
  }catch(error){ if(error?.status) return res.status(error.status).json({error:error.message}); next(error); }
});

app.post('/api/admin/withdraw/:txId/reject', auth, admin, async (req,res,next)=>{
  try {
    await withTransaction(async(client)=>{
      const tx=await client.query(`SELECT id,user_id,amount FROM transactions WHERE id=$1 AND type='WITHDRAW' AND status='PENDING' FOR UPDATE`,[req.params.txId]);
      if(!tx.rowCount) throw Object.assign(new Error('Pending withdrawal not found.'),{status:404});
      const note=String(req.body?.note||'Rejected: Incorrect payment credentials. Funds refunded to wallet.').slice(0,500);
      await client.query(`UPDATE transactions SET status='REJECTED',admin_note=$2 WHERE id=$1`,[req.params.txId,note]);
      await creditWallet(client,tx.rows[0].user_id,safeNumber(tx.rows[0].amount),'WITHDRAWAL_REFUND',tx.rows[0].id,{reason:'withdrawal_rejected'});
      await audit(client,req.user.id,'WITHDRAW_REJECTED',tx.rows[0].user_id,req.params.txId,{note});
    });
    res.json({ok:true});
  }catch(error){ if(error?.status) return res.status(error.status).json({error:error.message}); next(error); }
});

app.post('/api/admin/users/:userId/balance', auth, admin, async (req,res,next)=>{
  try {
    const delta=Number(req.body?.deltaAmount);
    if(!Number.isFinite(delta) || delta===0) return res.status(400).json({error:'Invalid balance adjustment.'});
    await withTransaction(async(client)=>{
      const user=await client.query(`SELECT id FROM users WHERE id=$1 AND role='user' LIMIT 1`,[req.params.userId]);
      if(!user.rowCount) throw Object.assign(new Error('User not found.'),{status:404});
      const txId=await createTransaction(client,{id:req.params.userId},'ADMIN_ADJUSTMENT',Math.abs(delta),'APPROVED',{adminNote:`Admin balance adjustment: ${delta>0?'+':''}${round(delta)} ETB`});
      const balanceAfter=delta>0
        ? await creditWallet(client,req.params.userId,delta,'ADMIN_ADJUSTMENT',txId,{delta})
        : await debitWallet(client,req.params.userId,Math.abs(delta),'ADMIN_ADJUSTMENT',txId,{delta});
      if(balanceAfter===null) throw Object.assign(new Error('Adjustment would make the wallet balance negative.'),{status:400});
      if(delta>0) await client.query(`UPDATE users SET total_earned=ROUND(total_earned+$2::numeric,2) WHERE id=$1`,[req.params.userId,delta]);
      await audit(client,req.user.id,'ADMIN_BALANCE_ADJUSTMENT',req.params.userId,txId,{delta,balanceAfter});
    });
    res.json({ok:true,user:await getUserById(req.params.userId)});
  }catch(error){ if(error?.status) return res.status(error.status).json({error:error.message}); next(error); }
});

// Local development/static fallback. Vercel serves public/** itself and runs api/index.js as the server function.
app.use(express.static(PUBLIC_DIR));
app.get('*', (req,res,next)=> req.path.startsWith('/api/') ? next() : res.sendFile(path.join(PUBLIC_DIR,'index.html')));

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error?.message === 'Origin not allowed.') return res.status(403).json({error:'Origin is not allowed.'});
  res.status(Number(error?.status)||500).json({error:'Internal server error.'});
});

export default app;

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  const start = async () => {
    try {
      if (process.argv.includes('--dev')) {
        // The API will be served on :4000 while Vite runs on :3000.
        app.listen(PORT, () => console.log(`DiamondMine Africa API running on http://localhost:${PORT}`));
        const viteBin = process.platform === 'win32'
          ? path.join(__dirname,'node_modules','.bin','vite.cmd')
          : path.join(__dirname,'node_modules','.bin','vite');
        const child = spawn(viteBin,['--port','3000','--host','0.0.0.0'],{stdio:'inherit',env:process.env});
        child.on('exit', code => process.exit(code ?? 0));
        return;
      }
      if (process.env.DATABASE_URL) await ensureAdminUser();
      app.listen(PORT, () => console.log(`DiamondMine Africa API running on http://localhost:${PORT}`));
    } catch (error) {
      console.error('Startup failed:', error);
      process.exit(1);
    }
  };
  void start();
}
