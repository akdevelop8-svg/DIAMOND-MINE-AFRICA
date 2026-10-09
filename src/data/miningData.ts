export interface Mineral {
  id: string;
  name: string;
  accentColor: string;
  glowColor: string;
  borderColor: string;
  description: string;
  purity: string;
  hardness: string;
  location: string;
}

export interface VipPlan {
  id: string;
  vipTier: number;
  vipBadge: string;
  mineralName: string;
  mineralKey: string;
  investAmountNum: number;
  dailyMiningNum: number;
  totalProfitNum: number;
  investAmount: string;
  dailyMining: string;
  totalProfit: string;
  periodDays: number;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  glowClass: string;
  borderClass: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
  actionKey: string;
}

export interface FeatureStripItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  color: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  subtitle: string;
  iconName: string;
}

export const PLATFORM_CONFIG = {
  name: 'DiamondMine Africa',
  tagline: 'TODAY WE CREATE || TOMORROW WE GROW',
  subTagline: 'TODAY WE CREATE || TOMORROW WE GROW',
  developerBrand: 'POWERED BY ¥$$ AK DEVELOP ™',
  developerLink: 'https://t.me/AK_DEVELOP2',
  currency: 'ETB',
  registrationBonus: 100,
  minInvestment: 300,
  maxInvestment: 200000,
  minWithdrawal: 150,
  withdrawalFeeRate: 0.08, // 8%
  dailyCheckInBonus: 1, // 1 ETB
  miningPeriodDays: 365,
  telegramCommunity: 'https://t.me/diamondmineafrica',
  telegramSupport: 'https://t.me/DiamondMineAfricaSupport',
};

export const NAV_LINKS = [
  { name: 'Home', href: '#home', active: true },
  { name: 'Minerals', href: '#minerals' },
  { name: 'VIP Plans', href: '#plans' },
  { name: 'Team & Rewards', href: '#team-rewards' },
  { name: 'About', href: '#about' },
  { name: 'SUPPORT', href: PLATFORM_CONFIG.telegramSupport, isExternal: true, isHighlight: true },
];

export const MINERALS_LIST: Mineral[] = [
  {
    id: 'diamond',
    name: 'Diamond',
    accentColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    borderColor: 'rgba(56, 189, 248, 0.5)',
    description: 'High-purity rough & gemological diamonds extracted from southern and central African kimberlite deposits.',
    purity: '99.95%',
    hardness: '10 Mohs',
    location: 'Botswana & Angola Basin',
  },
  {
    id: 'gold',
    name: 'Gold',
    accentColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    borderColor: 'rgba(245, 158, 11, 0.5)',
    description: 'Alluvial and hard-rock gold veins with high recovery grades from ancient geological formations.',
    purity: '98.50%',
    hardness: '2.5 Mohs',
    location: 'Ashanti & Witwatersrand Reef',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    accentColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
    description: 'Vivid green beryl crystals prized for exceptional saturation and crystalline structure.',
    purity: 'Grade AAA',
    hardness: '7.5 Mohs',
    location: 'Kafubu Belt, Zambia',
  },
  {
    id: 'ruby',
    name: 'Ruby',
    accentColor: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
    description: 'Pigeon-blood deep red corundum with striking natural fluorescence and crystalline brilliance.',
    purity: 'Grade AA+',
    hardness: '9.0 Mohs',
    location: 'Montepuez, Mozambique',
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    accentColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
    description: 'Cornflower and deep royal blue corundum sourced from highland alluvial terraces.',
    purity: 'Grade A1',
    hardness: '9.0 Mohs',
    location: 'Madagascar & East African Rift',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    accentColor: '#CBD5E1',
    glowColor: 'rgba(203, 213, 225, 0.45)',
    borderColor: 'rgba(203, 213, 225, 0.5)',
    description: 'Dense, lustrous transition metal essential for green hydrogen fuel cells and industrial catalytic systems.',
    purity: '99.90%',
    hardness: '4.5 Mohs',
    location: 'Bushveld Complex, South Africa',
  },
  {
    id: 'iron',
    name: 'Iron',
    accentColor: '#94A3B8',
    glowColor: 'rgba(148, 163, 184, 0.45)',
    borderColor: 'rgba(148, 163, 184, 0.5)',
    description: 'High-grade hematite and magnetite deposits supplying Africa’s infrastructure foundation.',
    purity: 'Fe 65.5%',
    hardness: '5.5 Mohs',
    location: 'Simandou & Sishen Mines',
  },
  {
    id: 'copper',
    name: 'Copper',
    accentColor: '#F97316',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    borderColor: 'rgba(249, 115, 22, 0.5)',
    description: 'Cathode-grade copper extracted along the world-renowned Central African Copperbelt.',
    purity: '99.99%',
    hardness: '3.0 Mohs',
    location: 'Central African Copperbelt',
  },
  {
    id: 'lithium',
    name: 'Lithium',
    accentColor: '#7DD3FC',
    glowColor: 'rgba(125, 211, 252, 0.45)',
    borderColor: 'rgba(125, 211, 252, 0.5)',
    description: 'Battery-grade spodumene and pegmatite ore powering modern global energy storage and electric mobility.',
    purity: 'Li2O 6.2%',
    hardness: '6.5 Mohs',
    location: 'Bikita & Kamativi Fields',
  },
  {
    id: 'uranium',
    name: 'Uranium',
    accentColor: '#FACC15',
    glowColor: 'rgba(250, 204, 21, 0.45)',
    borderColor: 'rgba(250, 204, 21, 0.5)',
    description: 'Energy-dense strategic mineral ore extracted from desert sedimentary calcrete basins.',
    purity: 'U3O8 99.2%',
    hardness: '6.0 Mohs',
    location: 'Husab & Rössing Fields',
  },
];

export const VIP_PLANS: VipPlan[] = [
  {
    id: 'vip-1',
    vipTier: 1,
    vipBadge: 'VIP 1',
    mineralName: 'Uranium',
    mineralKey: 'uranium',
    investAmountNum: 300,
    dailyMiningNum: 30,
    totalProfitNum: 10950,
    investAmount: '300 ETB',
    dailyMining: '30 ETB',
    totalProfit: '10,950 ETB',
    periodDays: 365,
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    badgeText: 'text-amber-300',
    accentColor: '#EAB308',
    glowClass: 'hover:shadow-[0_0_25px_rgba(234,179,8,0.35)]',
    borderClass: 'border-amber-500/30 hover:border-amber-400',
  },
  {
    id: 'vip-2',
    vipTier: 2,
    vipBadge: 'VIP 2',
    mineralName: 'Lithium',
    mineralKey: 'lithium',
    investAmountNum: 500,
    dailyMiningNum: 50,
    totalProfitNum: 18250,
    investAmount: '500 ETB',
    dailyMining: '50 ETB',
    totalProfit: '18,250 ETB',
    periodDays: 365,
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    badgeText: 'text-sky-300',
    accentColor: '#38BDF8',
    glowClass: 'hover:shadow-[0_0_25px_rgba(56,189,248,0.35)]',
    borderClass: 'border-sky-500/30 hover:border-sky-400',
  },
  {
    id: 'vip-3',
    vipTier: 3,
    vipBadge: 'VIP 3',
    mineralName: 'Copper',
    mineralKey: 'copper',
    investAmountNum: 1000,
    dailyMiningNum: 70,
    totalProfitNum: 25550,
    investAmount: '1,000 ETB',
    dailyMining: '70 ETB',
    totalProfit: '25,550 ETB',
    periodDays: 365,
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    badgeText: 'text-orange-300',
    accentColor: '#F97316',
    glowClass: 'hover:shadow-[0_0_25px_rgba(249,115,22,0.35)]',
    borderClass: 'border-orange-500/30 hover:border-orange-400',
  },
  {
    id: 'vip-4',
    vipTier: 4,
    vipBadge: 'VIP 4',
    mineralName: 'Iron',
    mineralKey: 'iron',
    investAmountNum: 3000,
    dailyMiningNum: 225,
    totalProfitNum: 82125,
    investAmount: '3,000 ETB',
    dailyMining: '225 ETB',
    totalProfit: '82,125 ETB',
    periodDays: 365,
    badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    badgeText: 'text-slate-300',
    accentColor: '#94A3B8',
    glowClass: 'hover:shadow-[0_0_25px_rgba(148,163,184,0.35)]',
    borderClass: 'border-slate-500/30 hover:border-slate-400',
  },
  {
    id: 'vip-5',
    vipTier: 5,
    vipBadge: 'VIP 5',
    mineralName: 'Platinum',
    mineralKey: 'platinum',
    investAmountNum: 7000,
    dailyMiningNum: 560,
    totalProfitNum: 204400,
    investAmount: '7,000 ETB',
    dailyMining: '560 ETB',
    totalProfit: '204,400 ETB',
    periodDays: 365,
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    badgeText: 'text-indigo-300',
    accentColor: '#818CF8',
    glowClass: 'hover:shadow-[0_0_25px_rgba(129,140,248,0.35)]',
    borderClass: 'border-indigo-500/30 hover:border-indigo-400',
  },
  {
    id: 'vip-6',
    vipTier: 6,
    vipBadge: 'VIP 6',
    mineralName: 'Sapphire',
    mineralKey: 'sapphire',
    investAmountNum: 15000,
    dailyMiningNum: 1300,
    totalProfitNum: 474500,
    investAmount: '15,000 ETB',
    dailyMining: '1,300 ETB',
    totalProfit: '474,500 ETB',
    periodDays: 365,
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    badgeText: 'text-blue-300',
    accentColor: '#3B82F6',
    glowClass: 'hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]',
    borderClass: 'border-blue-500/30 hover:border-blue-400',
  },
  {
    id: 'vip-7',
    vipTier: 7,
    vipBadge: 'VIP 7',
    mineralName: 'Ruby',
    mineralKey: 'ruby',
    investAmountNum: 30000,
    dailyMiningNum: 2750,
    totalProfitNum: 1003750,
    investAmount: '30,000 ETB',
    dailyMining: '2,750 ETB',
    totalProfit: '1,003,750 ETB',
    periodDays: 365,
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    badgeText: 'text-rose-300',
    accentColor: '#F43F5E',
    glowClass: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.35)]',
    borderClass: 'border-rose-500/30 hover:border-rose-400',
  },
  {
    id: 'vip-8',
    vipTier: 8,
    vipBadge: 'VIP 8',
    mineralName: 'Emerald',
    mineralKey: 'emerald',
    investAmountNum: 60000,
    dailyMiningNum: 5700,
    totalProfitNum: 2080500,
    investAmount: '60,000 ETB',
    dailyMining: '5,700 ETB',
    totalProfit: '2,080,500 ETB',
    periodDays: 365,
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    badgeText: 'text-emerald-300',
    accentColor: '#10B981',
    glowClass: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.35)]',
    borderClass: 'border-emerald-500/30 hover:border-emerald-400',
  },
  {
    id: 'vip-9',
    vipTier: 9,
    vipBadge: 'VIP 9',
    mineralName: 'Gold',
    mineralKey: 'gold',
    investAmountNum: 120000,
    dailyMiningNum: 11800,
    totalProfitNum: 4307000,
    investAmount: '120,000 ETB',
    dailyMining: '11,800 ETB',
    totalProfit: '4,307,000 ETB',
    periodDays: 365,
    badgeBg: 'bg-amber-500/20 text-[#E5B869] border-[#E5B869]/40',
    badgeText: 'text-[#E5B869]',
    accentColor: '#E5B869',
    glowClass: 'hover:shadow-[0_0_25px_rgba(229,184,105,0.4)]',
    borderClass: 'border-[#E5B869]/40 hover:border-[#E5B869]',
  },
  {
    id: 'vip-10',
    vipTier: 10,
    vipBadge: 'VIP 10',
    mineralName: 'Diamond',
    mineralKey: 'diamond',
    investAmountNum: 200000,
    dailyMiningNum: 20500,
    totalProfitNum: 7482500,
    investAmount: '200,000 ETB',
    dailyMining: '20,500 ETB',
    totalProfit: '7,482,500 ETB',
    periodDays: 365,
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
    badgeText: 'text-cyan-300',
    accentColor: '#38BDF8',
    glowClass: 'hover:shadow-[0_0_30px_rgba(56,189,248,0.5)]',
    borderClass: 'border-cyan-400/50 hover:border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
  },
];

export const FEATURE_STRIP: FeatureStripItem[] = [
  {
    id: 'active-plans',
    title: 'Active Plans',
    subtitle: 'Multiple VIP plans available',
    iconName: 'layers',
    color: '#3B82F6',
  },
  {
    id: 'daily-activity',
    title: 'Daily Activity',
    subtitle: '+1 ETB daily check-in',
    iconName: 'calendar-check',
    color: '#A855F7',
  },
  {
    id: 'community',
    title: 'Community',
    subtitle: '@diamondmineafrica',
    iconName: 'users',
    color: '#F59E0B',
  },
  {
    id: 'mineral-network',
    title: 'Team Network',
    subtitle: 'Up to 16% commission',
    iconName: 'network',
    color: '#06B6D4',
  },
];

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'wallet',
    title: 'Wallet & Account',
    description: 'View balance & payouts',
    iconName: 'wallet',
    actionKey: 'wallet',
  },
  {
    id: 'recharge',
    title: 'Recharge (CBE)',
    description: 'Deposit funds to mine',
    iconName: 'arrow-down-left',
    badge: 'CBE',
    actionKey: 'recharge',
  },
  {
    id: 'withdraw',
    title: 'Withdraw',
    description: 'Telebirr & CBE Cashout',
    iconName: 'arrow-up-right',
    actionKey: 'withdraw',
  },
  {
    id: 'check-in',
    title: 'Daily Check-in',
    description: 'Claim +1 ETB daily',
    iconName: 'calendar',
    badge: 'Daily',
    actionKey: 'check-in',
  },
  {
    id: 'tasks',
    title: 'My Team & Share',
    description: 'Invite and earn up to 16%',
    iconName: 'share2',
    actionKey: 'tasks',
  },
  {
    id: 'support',
    title: 'Official Support',
    description: '@DiamondMineAfricaSupport',
    iconName: 'headphones',
    actionKey: 'support',
  },
];

export const TEAM_RECHARGE_REWARDS = [
  { minETB: 15000, maxETB: 24999, rewardETB: 200, label: '15,000 – 24,999 ETB' },
  { minETB: 25000, maxETB: 49999, rewardETB: 500, label: '25,000 – 49,999 ETB' },
  { minETB: 50000, maxETB: 74999, rewardETB: 800, label: '50,000 – 74,999 ETB' },
  { minETB: 75000, maxETB: 99999, rewardETB: 1200, label: '75,000 – 99,999 ETB' },
  { minETB: 100000, maxETB: 149999, rewardETB: 1800, label: '100,000 – 149,999 ETB' },
  { minETB: 150000, maxETB: 199999, rewardETB: 2500, label: '150,000 – 199,999 ETB' },
  { minETB: 200000, maxETB: 249999, rewardETB: 3500, label: '200,000 – 249,999 ETB' },
  { minETB: 250000, maxETB: Infinity, rewardETB: 5000, label: '250,000+ ETB' },
];

export const COMMISSION_TIERS = [
  { level: 1, rate: 10, title: 'Direct Referrals (Level 1)', desc: 'From every recharge made by your direct invitees' },
  { level: 2, rate: 3, title: 'Second Tier (Level 2)', desc: 'From recharges made by your level 1 team invites' },
  { level: 3, rate: 2, title: 'Third Tier (Level 3)', desc: 'From recharges made by your level 2 team invites' },
  { level: 4, rate: 1, title: 'Fourth Tier (Level 4)', desc: 'From recharges made by your level 3 team invites' },
];

export const FOOTER_LINKS = [
  { name: 'Home', href: '#home' },
  { name: 'VIP Plans', href: '#plans' },
  { name: 'Minerals', href: '#minerals' },
  { name: 'About Us', href: '#about' },
  { name: 'FAQ', href: '#faq' },
  { name: 'Official Channel', href: PLATFORM_CONFIG.telegramCommunity, isExternal: true },
  { name: 'Customer Support', href: PLATFORM_CONFIG.telegramSupport, isExternal: true },
];
