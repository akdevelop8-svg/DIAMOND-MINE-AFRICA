import React from 'react';
import { Pickaxe, ArrowLeftRight, Users, User, ShieldAlert } from 'lucide-react';
import { useMining } from '../context/MiningContext';

interface BottomNavProps {
  onOpenInvest: () => void;
  onOpenRechargeWithdraw: () => void;
  onOpenTeam: () => void;
  onOpenAccount: () => void;
  onOpenAdmin?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onOpenInvest,
  onOpenRechargeWithdraw,
  onOpenTeam,
  onOpenAccount,
  onOpenAdmin,
}) => {
  const { currentUser, isAdmin, theme } = useMining();
  const isDark = theme === 'dark';

  return (
    <aside
      aria-label="Bottom Navigation Bar"
      className={`fixed bottom-0 left-0 right-0 w-full z-40 border-t transition-all duration-300 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] ${
        isDark
          ? 'bg-[#050e20]/95 border-cyan-500/40 backdrop-blur-2xl'
          : 'bg-[#FAF8F5]/95 border-amber-300/80 backdrop-blur-2xl shadow-[0_-8px_25px_rgba(245,158,11,0.12)]'
      }`}
    >
      <div className="w-full flex items-center justify-between px-2 sm:px-6 py-2">
        {/* 1. INVEST */}
        <button
          type="button"
          onClick={onOpenInvest}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            isDark
              ? 'text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 active:scale-95'
              : 'text-slate-700 hover:text-cyan-800 hover:bg-amber-100/60 active:scale-95'
          }`}
        >
          <Pickaxe className="w-5 h-5 mb-1 text-cyan-400" />
          <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase">INVEST</span>
        </button>

        {/* 2. RECHARGE & WITHDRAW */}
        <button
          type="button"
          onClick={onOpenRechargeWithdraw}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            isDark
              ? 'text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 active:scale-95'
              : 'text-slate-700 hover:text-amber-700 hover:bg-amber-100/60 active:scale-95'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5 mb-1 text-[#E5B869]" />
          <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase">
            RECHARGE
          </span>
        </button>

        {/* 3. SHARE (INVITE) */}
        <button
          type="button"
          onClick={onOpenTeam}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            isDark
              ? 'text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 active:scale-95'
              : 'text-slate-700 hover:text-emerald-700 hover:bg-amber-100/60 active:scale-95'
          }`}
        >
          <Users className="w-5 h-5 mb-1 text-emerald-400" />
          <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase">SHARE</span>
        </button>

        {/* 4. MY ACCOUNT */}
        <button
          type="button"
          onClick={onOpenAccount}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
            isDark
              ? 'text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 active:scale-95'
              : 'text-slate-700 hover:text-amber-800 hover:bg-amber-100/60 active:scale-95'
          }`}
        >
          <User className="w-5 h-5 mb-1 text-cyan-300" />
          <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase">
            {currentUser ? 'ACCOUNT' : 'SIGN IN'}
          </span>
          {currentUser && (
            <span className="absolute top-1.5 right-6 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        {/* 5. ADMIN (If admin logged in) */}
        {isAdmin && onOpenAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl bg-red-950/70 border border-red-500/60 text-red-300 hover:text-white transition-all active:scale-95"
          >
            <ShieldAlert className="w-5 h-5 mb-1 text-red-400 animate-bounce" />
            <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase">ADMIN</span>
          </button>
        )}
      </div>
    </aside>
  );
};
