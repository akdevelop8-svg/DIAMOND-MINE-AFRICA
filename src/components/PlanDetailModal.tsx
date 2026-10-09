import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Clock, AlertCircle, Pickaxe, ArrowDownLeft } from 'lucide-react';
import { VipPlan, PLATFORM_CONFIG } from '../data/miningData';
import { useMining } from '../context/MiningContext';
import { MineralGraphic } from './MineralGraphic';

interface PlanDetailModalProps {
  plan: VipPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenRecharge: () => void;
}

export const PlanDetailModal: React.FC<PlanDetailModalProps> = ({
  plan,
  isOpen,
  onClose,
  onOpenRecharge,
}) => {
  const { currentUser, investInPlan, theme, showToast } = useMining();
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !plan) return null;

  const isDark = theme === 'dark';
  const balance = currentUser?.balance || 0;
  const isInsufficient = balance < plan.investAmountNum;

  const handleConfirmInvestment = async () => {
    if (!currentUser) {
      showToast('Please sign in or register to activate this plan.');
      return;
    }

    if (isInsufficient) {
      showToast(`Insufficient balance (${balance.toLocaleString()} ETB). Please recharge at least ${plan.investAmountNum.toLocaleString()} ETB.`);
      return;
    }

    if (!confirmed) {
      showToast('Please check the confirmation box before continuing.');
      return;
    }

    setIsSubmitting(true);
    const res = await investInPlan(plan);
    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else if (res.message) {
      showToast(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className={`relative w-full max-w-lg my-auto rounded-3xl border-2 p-6 sm:p-8 shadow-2xl transition-all ${
          isDark
            ? 'bg-[#07132a]/98 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-slate-100'
            : 'bg-white border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.2)] text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-[#061226] border border-cyan-500/40 p-2 flex items-center justify-center shadow-lg shrink-0">
            <MineralGraphic type={plan.mineralName} size="md" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase border ${plan.badgeBg}`}>
                {plan.vipBadge}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase">
                {plan.mineralName} Node
              </span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
              VIP {plan.vipTier} CONTRACT
            </h2>
          </div>
        </div>

        {/* Investment Details Table */}
        <div className="p-4 rounded-2xl bg-[#061226] border border-blue-900/80 space-y-2.5 text-xs font-mono mb-5">
          <div className="flex justify-between items-center text-slate-300">
            <span>Investment Required:</span>
            <span className="text-base font-black text-[#E5B869]">{plan.investAmount}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span>Daily Mining Yield:</span>
            <span className="text-base font-black text-emerald-400">+{plan.dailyMining} / day</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span>Contract Duration:</span>
            <span className="text-white font-bold">{plan.periodDays} Days</span>
          </div>

          <div className="flex justify-between items-center text-slate-300 pt-2 border-t border-slate-800">
            <span>Total 365-Day Projected Return:</span>
            <span className="text-base font-black text-cyan-300">{plan.totalProfit}</span>
          </div>
        </div>

        {/* How It Works Notice */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-slate-300 leading-relaxed mb-4 space-y-1.5">
          <div className="font-bold text-cyan-300 uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Automated 24-Hour Mining Cycle:</span>
          </div>
          <p>
            Upon activation, this plan transforms into a <strong>CLAIM</strong> node. Every 24 hours, you can click claim to deposit <strong>+{plan.dailyMining}</strong> directly into your available wallet balance. You can withdraw your earnings anytime without waiting for the full 365 days.
          </p>
        </div>

        {/* Balance Status */}
        {isInsufficient ? (
          <div className="p-3.5 rounded-2xl bg-red-950/70 border border-red-500/50 text-xs text-red-200 mb-4 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Insufficient Balance ({balance.toLocaleString()} ETB)</span>
            </div>
            <p className="text-[11px] text-slate-300">
              You need <strong>{plan.investAmountNum.toLocaleString()} ETB</strong> to activate this VIP tier. Please recharge your wallet via CBE.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRecharge();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>RECHARGE VIA CBE NOW</span>
            </button>
          </div>
        ) : (
          /* Checkbox Confirmation */
          <div className="mb-5">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0a1835] border border-blue-900 cursor-pointer hover:border-cyan-400 transition-colors">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-[11px] text-slate-200 leading-tight">
                <strong>I HAVE READ AND CONFIRM THE INVESTMENT</strong> of {plan.investAmount} for VIP {plan.vipTier} ({plan.mineralName}).
              </span>
            </label>
          </div>
        )}

        {/* Action Button */}
        {!isInsufficient && (
          <button
            type="button"
            onClick={handleConfirmInvestment}
            disabled={!confirmed || isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-[#E5B869] text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Pickaxe className="w-4 h-4" />
                <span>CONFIRM & ACTIVATE VIP {plan.vipTier} NODE</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
