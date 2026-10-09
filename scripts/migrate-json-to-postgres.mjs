import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { Client } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
const file = process.env.JSON_DB_FILE || path.resolve('database/data.json');

if (!url) {
  console.error('DATABASE_URL is missing.');
  process.exit(1);
}

let db;
try {
  db = JSON.parse(await fs.readFile(file, 'utf8'));
} catch (error) {
  console.error(`Could not read ${file}:`, error.message);
  process.exit(1);
}

const client = new Client(url);
const id = (prefix) => `${prefix}_${Date.now()}_${crypto.randomBytes(5).toString('hex')}`;
const toDate = (value) => value ? new Date(Number(value) || value) : new Date();

try {
  await client.connect();
  await client.query('BEGIN');

  for (const user of db.users || []) {
    await client.query(
      `INSERT INTO users (id,numeric_id,name,phone,password_hash,role,total_earned,total_recharged,total_withdrawn,referral_code,registered_at,last_check_in_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO NOTHING`,
      [user.id,user.numericId,user.name,user.phone,user.passwordHash,user.id==='admin_master'?'admin':'user',user.totalEarned||0,user.totalRecharged||0,user.totalWithdrawn||0,user.referralCode||user.numericId,toDate(user.registeredAt),user.lastCheckInTimestamp?toDate(user.lastCheckInTimestamp):null]
    );
    await client.query('INSERT INTO wallets (user_id,available_balance) VALUES ($1,$2) ON CONFLICT (user_id) DO UPDATE SET available_balance=EXCLUDED.available_balance', [user.id,user.balance||0]);
  }

  for (const user of db.users || []) {
    if (user.referredBy) {
      const ref = await client.query('SELECT id FROM users WHERE numeric_id=$1 LIMIT 1',[user.referredBy]);
      if (ref.rowCount) await client.query('UPDATE users SET referred_by_user_id=$1 WHERE id=$2',[ref.rows[0].id,user.id]);
    }
  }

  for (const inv of (db.users || []).flatMap(u => (u.activeInvestments || []).map(i => ({...i,userId:u.id})))) {
    await client.query(
      `INSERT INTO investments (id,user_id,plan_id,vip_tier,mineral_name,invest_amount,daily_mining_amount,started_at,last_claimed_at,days_claimed,total_period_days)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO NOTHING`,
      [inv.id,inv.userId,inv.planId,inv.vipTier,inv.mineralName,inv.investAmount,inv.dailyMiningAmount,toDate(inv.startedAt),inv.lastClaimedAt?toDate(inv.lastClaimedAt):null,inv.daysClaimed||0,inv.totalPeriodDays||365]
    );
  }

  for (const tx of db.transactions || []) {
    await client.query(
      `INSERT INTO transactions (id,user_id,type,amount,fee,net_amount,status,occurred_at,payment_method,account_number,account_name,transaction_code,proof_message,admin_note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (id) DO NOTHING`,
      [tx.id,tx.userId,tx.type,tx.amount||0,tx.fee||0,tx.netAmount??null,tx.status,toDate(tx.timestamp),tx.paymentMethod||null,tx.accountNumber||null,tx.accountName||null,tx.transactionCode||null,tx.proofMessage||null,tx.adminNote||null]
    );
    if (tx.receiptImageUrl) {
      await client.query(
        `INSERT INTO transaction_receipts (transaction_id,mime_type,data_url) VALUES ($1,$2,$3) ON CONFLICT (transaction_id) DO NOTHING`,
        [tx.id, String(tx.receiptImageUrl).match(/^data:([^;]+);/)?.[1] || 'image/jpeg', tx.receiptImageUrl]
      );
    }
  }

  for (const session of db.sessions || []) {
    const tokenHash = crypto.createHash('sha256').update(String(session.token)).digest('hex');
    await client.query(
      `INSERT INTO sessions (token_hash,user_id,role,created_at,expires_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (token_hash) DO NOTHING`,
      [tokenHash,session.userId,session.role,toDate(session.createdAt),toDate(session.expiresAt)]
    );
  }

  await client.query('COMMIT');
  console.log('✅ JSON database migrated to normalized PostgreSQL tables.');
} catch (error) {
  try { await client.query('ROLLBACK'); } catch {}
  console.error('Migration failed:', error);
  process.exitCode = 1;
} finally {
  await client.end();
}
