import React, { useState } from 'react';
import { X, ArrowUpRight, ShieldCheck, AlertCircle, CheckCircle2, Wallet } from 'lucide-react';
import { useMining } from '../context/MiningContext';
import { PLATFORM_CONFIG } from '../data/miningData';

import telebirrLogo from '../assets/images/telebirr.png';
import cbeLogo from '../assets/images/cbe.png';
import awashLogo from '../assets/images/awash.png';
import abyssiniaLogo from '../assets/images/Abyssinia.png';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecharge?: () => void;
}

const PAYMENT_METHODS = [
  { id: 'telebirr', name: 'Telebirr', tag: 'Instant Mobile', logo: telebirrLogo, color: 'border-cyan-400 bg-cyan-950/40 text-cyan-300' },
  { id: 'cbe', name: 'Commercial Bank of Ethiopia (CBE)', tag: 'Direct Bank', logo: cbeLogo, color: 'border-amber-400 bg-amber-950/40 text-[#E5B869]' },
  { id: 'awash', name: 'Awash Bank', tag: 'Commercial Bank', logo: awashLogo, color: 'border-blue-400 bg-blue-950/40 text-blue-300' },
  { id: 'abyssinia', name: 'Bank of Abyssinia', tag: 'Commercial Bank', logo: abyssiniaLogo, color: 'border-purple-400 bg-purple-950/40 text-purple-300' },
];

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  onOpenRecharge,
}) => {
  const { currentUser, submitWithdrawal, theme, showToast } = useMining();

  const [amount, setAmount] = useState<number>(150);
  const [selectedMethod, setSelectedMethod] = useState('telebirr');
  const [accountNumber, setAccountNumber] = useState(currentUser?.phone || '');
  const [accountName, setAccountName] = useState(currentUser?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const balance = currentUser?.balance || 0;
  const fee = Math.round(amount * PLATFORM_CONFIG.withdrawalFeeRate * 100) / 100;
  const netAmount = Math.max(0, Math.round((amount - fee) * 100) / 100);
  const isInsufficient = amount > balance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (amount < PLATFORM_CONFIG.minWithdrawal) {
      showToast(`Minimum withdrawal is ${PLATFORM_CONFIG.minWithdrawal} ETB.`);
      return;
    }
    if (isInsufficient) {
      showToast(`Insufficient balance. Your current balance is ${balance.toLocaleString()} ETB.`);
      return;
    }
    if (!accountNumber.trim() || !accountName.trim()) {
      showToast('Please enter your account number/phone and account holder name.');
      return;
    }

    const methodObj = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
    const methodName = methodObj ? methodObj.name : selectedMethod;

    setIsSubmitting(true);
    try {
      const res = await submitWithdrawal({ amount, paymentMethod: methodName, accountNumber: accountNumber.trim(), accountName: accountName.trim() });
      if (res.success) {
        setIsSuccess(true);
        window.setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2200);
      } else if (res.message) {
        showToast(res.message);
      }
    } catch {
      showToast('Could not submit the withdrawal request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className={`relative w-full max-w-lg my-auto rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
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
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.4)]">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest text-cyan-400 uppercase block">
              SECURE CASH OUT
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              WITHDRAW FUNDS
            </h2>
          </div>
        </div>

        {/* Current Balance Bar */}
        <div className="p-3.5 rounded-2xl bg-[#091b3b] border border-cyan-500/30 flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Available Balance</span>
              <span className="text-base font-black text-white font-mono">
                {balance.toLocaleString()} ETB
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAmount(balance)}
            className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold transition-colors"
          >
            MAX ALL
          </button>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="py-6 text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.5)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white uppercase">
                Withdrawal Order Submitted
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                Net payout of <strong className="text-emerald-300">{netAmount.toLocaleString()} ETB</strong> is being processed to your <strong className="text-white">{accountNumber}</strong>.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-semibold text-cyan-300">
              Successfully queued! Admin will transfer funds within banking hours.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Withdrawal Amount (ETB)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={PLATFORM_CONFIG.minWithdrawal}
                  max={balance}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Minimum 150"
                  required
                  className={`w-full pl-4 pr-16 py-3 rounded-2xl bg-[#0a1835] border text-white font-mono text-xl font-black focus:outline-none transition-all ${
                    isInsufficient
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-blue-900/70 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-cyan-400 font-mono">
                  ETB
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                <span>Min: {PLATFORM_CONFIG.minWithdrawal} ETB</span>
                <span>Platform Fee: 8%</span>
              </div>
            </div>

            {/* Insufficient Warning */}
            {isInsufficient && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 flex items-center justify-between text-xs text-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Insufficient balance to withdraw {amount.toLocaleString()} ETB</span>
                </div>
                {onOpenRecharge && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRecharge();
                    }}
                    className="underline font-bold text-cyan-300 hover:text-white shrink-0 ml-2"
                  >
                    Recharge
                  </button>
                )}
              </div>
            )}

            {/* Select Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Select Payout Channel
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      selectedMethod === m.id
                        ? `${m.color} border-2 shadow-lg font-black scale-[1.02]`
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-700/60 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      <img src={m.logo} alt={m.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-extrabold block text-white truncate">{m.name}</span>
                      <span className="text-[10px] text-slate-400 block">{m.tag}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">
                  Account Number / Phone <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 0911234567 or 1000..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1835] border border-blue-900/70 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">
                  Account Holder Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Full name as in bank"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1835] border border-blue-900/70 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Breakdown Summary */}
            <div className="p-3.5 rounded-2xl bg-[#061226] border border-blue-900/80 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Requested Amount:</span>
                <span className="text-white">{amount.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>8% Platform Service Fee:</span>
                <span className="text-amber-400">-{fee.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1.5 border-t border-slate-800">
                <span>Net You Will Receive:</span>
                <span className="text-emerald-400 text-sm">{netAmount.toLocaleString()} ETB</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isInsufficient || amount < PLATFORM_CONFIG.minWithdrawal}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-[#E5B869] text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>I'M SURE TO WITHDRAW</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
