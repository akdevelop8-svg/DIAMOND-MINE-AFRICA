import 'dotenv/config';
import fs from 'fs/promises';
import { Client } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is missing. Add your Neon connection string first.');
  process.exit(1);
}

const schema = await fs.readFile(new URL('../database/schema.sql', import.meta.url), 'utf8');
const client = new Client(url);
try {
  await client.connect();
  await client.query(schema);
  const plans = [
    ['vip-1',1,'Uranium',300,30,365], ['vip-2',2,'Lithium',500,50,365],
    ['vip-3',3,'Copper',1000,70,365], ['vip-4',4,'Iron',3000,225,365],
    ['vip-5',5,'Platinum',7000,560,365], ['vip-6',6,'Sapphire',15000,1300,365],
    ['vip-7',7,'Ruby',30000,2750,365], ['vip-8',8,'Emerald',60000,5700,365],
    ['vip-9',9,'Gold',120000,11800,365], ['vip-10',10,'Diamond',200000,20500,365],
  ];
  for (const [id,vipTier,mineralName,investAmount,dailyMiningAmount,totalPeriodDays] of plans) {
    await client.query(
      `INSERT INTO plans (id,vip_tier,mineral_name,invest_amount,daily_mining_amount,total_period_days)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET
         vip_tier=EXCLUDED.vip_tier, mineral_name=EXCLUDED.mineral_name,
         invest_amount=EXCLUDED.invest_amount, daily_mining_amount=EXCLUDED.daily_mining_amount,
         total_period_days=EXCLUDED.total_period_days`,
      [id,vipTier,mineralName,investAmount,dailyMiningAmount,totalPeriodDays]
    );
  }
  console.log('✅ Database schema and VIP reference plans created/verified successfully.');
} finally {
  await client.end();
}
