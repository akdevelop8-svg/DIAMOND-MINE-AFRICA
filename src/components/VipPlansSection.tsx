import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Lock,
  Pickaxe,
  Zap,
} from 'lucide-react';
import { VipPlan } from '../data/miningData';
import { useMining } from '../context/MiningContext';
import { MineralGraphic } from './MineralGraphic';

interface VipPlansSectionProps {
  onSelectPlan: (plan: VipPlan) => void;
  onOpenRecharge: () => void;
}

export const VipPlansSection: React.FC<VipPlansSectionProps> = ({
  onSelectPlan,
  onOpenRecharge,
}) => {
  const { currentUser, claimDailyMining, getClaimCountdown, theme, vipPlans } = useMining();
  const [, setTimerTick] = useState(0);

  const isDark = theme === 'dark';

  // Force re-render every second for real-time live countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="plans" className="relative py-12 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left scroll-mt-20">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[#E5B869] text-xs font-bold uppercase tracking-widest mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
            <span>365-DAY CAPITAL YIELD CONTRACTS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase">
            VIP INVESTMENT PLANS
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md md:text-right">
          Sequential digital tier progression from VIP 1 to VIP 10. Activate your mineral asset to earn automated daily mining yields every 24 hours.
        </p>
      </div>

      {/* Grid of VIP Plans (10 Plans) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 w-full max-w-6xl mx-auto">
        {vipPlans.map((plan: VipPlan) => {
          // Check if currentUser has an active investment in this plan
          const activeInvestment = currentUser?.activeInvestments?.find(
            (inv) => inv.planId === plan.id || inv.vipTier === plan.vipTier
          );

          const countdown = activeInvestment ? getClaimCountdown(activeInvestment) : null;
          const canClaim = countdown?.canClaim ?? false;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-5 sm:p-6 border-2 transition-all duration-300 backdrop-blur-xl shadow-xl overflow-hidden group ${
                activeInvestment
                  ? 'bg-gradient-to-br from-[#0a224a] via-[#071936] to-[#040e22] border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/50'
                  : isDark
                  ? 'bg-[#08152e]/90 border-blue-900/60 hover:border-cyan-500/50 hover:bg-[#0c224a]'
                  : 'bg-white border-amber-200 hover:border-amber-400'
              }`}
            >
              {/* Active Badge / Watermark */}
              {activeInvestment && (
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl pointer-events-none" />
              )}

              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3.5">
                  {/* Mineral Icon Graphic */}
                  <div className="w-14 h-14 rounded-2xl bg-[#061226] border border-cyan-500/40 p-2 flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
                    <MineralGraphic type={plan.mineralName} size="md" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase border ${plan.badgeBg}`}>
                        {plan.vipBadge}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        {plan.mineralName}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-0.5">
                      VIP {plan.vipTier} MINING NODE
                    </h3>
                  </div>
                </div>

                {/* Investment Price Pill */}
                <div className="text-right font-mono shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Investment
                  </span>
                  <span className="text-lg sm:text-xl font-black text-[#E5B869]">
                    {plan.investAmount}
                  </span>
                </div>
              </div>

              {/* Data Specs Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#061226]/80 border border-blue-900/60 mb-4 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Daily Yield</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-400">
                    +{plan.dailyMining}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Period</span>
                  <span className="text-xs sm:text-sm font-black text-white">
                    {plan.periodDays} Days
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Total Return</span>
                  <span className="text-xs sm:text-sm font-black text-cyan-300">
                    {plan.totalProfit}
                  </span>
                </div>
              </div>

              {/* Card Footer: If Active $\rightarrow$ Claim Button with 24h timer, Else $\rightarrow$ Invest Now */}
              {activeInvestment ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-cyan-300 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>Active Mineral Node</span>
                    </span>
                    <span className="font-bold">
                      Claimed: {activeInvestment.daysClaimed}/{activeInvestment.totalPeriodDays} Days
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => claimDailyMining(activeInvestment.id)}
                    disabled={!canClaim}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      canClaim
                        ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:brightness-110 active:scale-95 animate-pulse'
                        : 'bg-slate-900/90 text-cyan-200 border border-cyan-500/30 cursor-not-allowed opacity-90'
                    }`}
                  >
                    {canClaim ? (
                      <>
                        <Pickaxe className="w-4 h-4" />
                        <span>CLAIM +{plan.dailyMining} NOW (READY)</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <span>CLAIM IN: {countdown?.formattedTime} (+{plan.dailyMining})</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-[#E5B869] text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <span>INVEST {plan.investAmount} (START MINING)</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
