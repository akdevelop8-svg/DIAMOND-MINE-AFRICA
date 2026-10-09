import React, { useState } from 'react';
import {
  X,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Pickaxe,
  CalendarCheck,
  Users,
  History,
  Send,
  Headphones,
  LogOut,
  Sun,
  Moon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useMining } from '../context/MiningContext';
import { PLATFORM_CONFIG } from '../data/miningData';
import diamondmineLogo from '../assets/images/diamondmine.jpg';

interface MyAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecharge: () => void;
  onOpenWithdraw: () => void;
  onOpenTeam: () => void;
}

export const MyAccountModal: React.FC<MyAccountModalProps> = ({
  isOpen,
  onClose,
  onOpenRecharge,
  onOpenWithdraw,
  onOpenTeam,
}) => {
  const {
    currentUser,
    logout,
    theme,
    toggleTheme,
    claimCheckIn,
    canCheckIn,
    checkInCountdown,
    getUserTransactions,
  } = useMining();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HISTORY'>('OVERVIEW');

  if (!isOpen || !currentUser) return null;

  const isDark = theme === 'dark';
  const transactions = getUserTransactions();

  const highestVip = currentUser.activeInvestments.reduce(
    (max, inv) => (inv.vipTier > max ? inv.vipTier : max),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl my-auto rounded-3xl border p-5 sm:p-8 shadow-2xl transition-all max-h-[90vh] overflow-y-auto ${
          isDark
            ? 'bg-[#07132a]/98 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-slate-100'
            : 'bg-white border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.2)] text-slate-900'
        }`}
      >
        {/* Top Floating Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Header with Official Logo Avatar */}
        <div className="flex items-center gap-4 mb-6 pt-1">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#E5B869] shadow-[0_0_20px_rgba(229,184,105,0.4)] shrink-0">
            <img
              src={diamondmineLogo}
              alt="Diamondmine Africa Official Logo Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                {currentUser.name}
              </h2>
              {highestVip > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-extrabold text-[10px] uppercase">
                  VIP {highestVip}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
              <span>ID: <strong className="text-cyan-300">DMA-{currentUser.numericId}</strong></span>
              <span>Phone: <strong className="text-slate-300">{currentUser.phone}</strong></span>
              <span>Joined: <strong className="text-slate-300">{currentUser.registeredAt}</strong></span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-2xl bg-slate-900/80 p-1 border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
              activeTab === 'OVERVIEW'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MY DASHBOARD & WALLET
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'HISTORY'
                ? 'bg-gradient-to-r from-[#F6C76D] to-[#D4AF37] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>TRANSACTION HISTORY</span>
          </button>
        </div>

        {activeTab === 'OVERVIEW' ? (
          <div className="space-y-6">
            {/* Primary Live Balance Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0c224a] via-[#091b3b] to-[#040e22] border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-300 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" />
                  <span>TOTAL WALLET BALANCE</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Active & Withdrawable
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight mb-4">
                {currentUser.balance.toLocaleString()} <span className="text-xl text-[#E5B869]">ETB</span>
              </div>

              {/* Action Buttons: Recharge & Withdraw */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-900/80">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRecharge();
                  }}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>RECHARGE (CBE)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWithdraw();
                  }}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-[#E5B869] text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>WITHDRAW</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#061226] border border-blue-900/60 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Recharged</span>
                <span className="text-sm sm:text-base font-black text-cyan-300 font-mono">
                  {currentUser.totalRecharged.toLocaleString()} ETB
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#061226] border border-blue-900/60 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Withdrawn</span>
                <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
                  {currentUser.totalWithdrawn.toLocaleString()} ETB
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#061226] border border-blue-900/60 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Active VIP Nodes</span>
                <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                  {currentUser.activeInvestments.length}
                </span>
              </div>
            </div>

            {/* Daily Mining Award & Check-In Feature */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-blue-950/60 to-cyan-950/60 border border-purple-500/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-400/60 flex items-center justify-center text-purple-300">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Daily Mining Attendance Award (+1 ETB)
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Claim every 24 hours free bonus
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={claimCheckIn}
                disabled={!canCheckIn}
                className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  canCheckIn
                    ? 'bg-gradient-to-r from-[#F6C76D] to-[#D4AF37] text-slate-950 shadow-[0_0_15px_rgba(246,199,109,0.5)] hover:brightness-110 active:scale-95'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                }`}
              >
                {canCheckIn ? 'CLAIM +1 ETB' : `IN ${checkInCountdown}`}
              </button>
            </div>

            {/* Platform Quick Links */}
            <div className="space-y-2.5">
              {/* My Team / Share */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTeam();
                }}
                className="w-full p-3.5 rounded-2xl bg-[#081733] hover:bg-[#0c224a] border border-blue-900/70 hover:border-cyan-400 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      My Team & Invitation Link
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {`${window.location.origin}/register?ref_by=${encodeURIComponent(currentUser.numericId)}`}
                    </span>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-[#E5B869] group-hover:scale-125 transition-transform" />
              </button>

              {/* Join Telegram Community Link */}
              <a
                href={PLATFORM_CONFIG.telegramCommunity}
                target="_blank"
                rel="noreferrer"
                className="w-full p-3.5 rounded-2xl bg-[#081733] hover:bg-[#0c224a] border border-blue-900/70 hover:border-cyan-400 transition-all flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-cyan-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Join Our Official Community
                    </span>
                    <span className="text-[11px] text-slate-400">
                      https://t.me/diamondmineafrica
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-cyan-400" />
              </a>

              {/* Official Customer Support */}
              <a
                href={PLATFORM_CONFIG.telegramSupport}
                target="_blank"
                rel="noreferrer"
                className="w-full p-3.5 rounded-2xl bg-[#081733] hover:bg-[#0c224a] border border-blue-900/70 hover:border-cyan-400 transition-all flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <Headphones className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      24/7 Official Support Help Center
                    </span>
                    <span className="text-[11px] text-slate-400">
                      @DiamondMineAfricaSupport
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-amber-400" />
              </a>
            </div>

            {/* Logout Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full py-3 rounded-2xl bg-red-950/40 hover:bg-red-950/80 border border-red-500/40 text-red-300 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>SIGN OUT FROM MINING LEDGER</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= TRANSACTION HISTORY ================= */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                DEPOSIT & WITHDRAWAL LEDGER
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {transactions.length} Records
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No recorded transactions yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-[#061226] border border-blue-900/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          tx.type === 'RECHARGE'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : tx.type === 'WITHDRAW' || tx.type === 'INVESTMENT'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            : tx.type === 'MINING_CLAIM'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {tx.type === 'RECHARGE' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : tx.type === 'WITHDRAW' || tx.type === 'INVESTMENT' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : tx.type === 'MINING_CLAIM' ? (
                          <Pickaxe className="w-4 h-4" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="font-extrabold text-white">
                          {tx.type.replace('_', ' ')}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {tx.date} • {tx.time}
                          {tx.transactionCode && ` • Ref: ${tx.transactionCode}`}
                        </div>
                        {tx.adminNote && (
                          <div className="text-[10px] text-slate-400 italic">
                            {tx.adminNote}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-sm font-black font-mono ${
                          tx.type === 'WITHDRAW' ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {tx.type === 'WITHDRAW' || tx.type === 'INVESTMENT' ? '-' : '+'}{tx.amount.toLocaleString()} ETB
                      </div>
                      <div className="mt-0.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            tx.status === 'APPROVED'
                              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                              : tx.status === 'PENDING'
                              ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 animate-pulse'
                              : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                          }`}
                        >
                          {tx.status === 'APPROVED' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : tx.status === 'PENDING' ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span>{tx.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
