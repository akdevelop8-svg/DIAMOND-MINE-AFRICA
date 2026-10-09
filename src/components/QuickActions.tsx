import React from 'react';
import {
  Wallet,
  CalendarCheck2,
  ArrowDownLeft,
  Share2,
  ArrowUpRight,
  Headphones,
} from 'lucide-react';
import { QUICK_ACTIONS, QuickAction } from '../data/miningData';
import { useMining } from '../context/MiningContext';

interface QuickActionsProps {
  onActionClick: (actionKey: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const { theme } = useMining();
  const isDark = theme === 'dark';

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'wallet':
        return <Wallet className="w-5 h-5 text-cyan-400" />;
      case 'calendar':
        return <CalendarCheck2 className="w-5 h-5 text-purple-400" />;
      case 'arrow-down-left':
        return <ArrowDownLeft className="w-5 h-5 text-emerald-400" />;
      case 'share2':
        return <Share2 className="w-5 h-5 text-[#E5B869]" />;
      case 'arrow-up-right':
        return <ArrowUpRight className="w-5 h-5 text-amber-400" />;
      case 'headphones':
        return <Headphones className="w-5 h-5 text-blue-400" />;
      default:
        return <Wallet className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getIconBg = (actionKey: string) => {
    switch (actionKey) {
      case 'wallet':
        return 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400';
      case 'recharge':
        return 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400';
      case 'withdraw':
        return 'bg-amber-950/60 border-amber-500/40 text-amber-400';
      case 'check-in':
        return 'bg-purple-950/60 border-purple-500/40 text-purple-400';
      case 'tasks':
        return 'bg-amber-950/60 border-amber-500/40 text-[#E5B869]';
      case 'support':
        return 'bg-blue-950/60 border-blue-500/40 text-blue-400';
      default:
        return 'bg-blue-950/60 border-blue-500/40';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {QUICK_ACTIONS.map((action: QuickAction) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.actionKey)}
            type="button"
            className={`group relative flex flex-col items-start justify-between p-4 rounded-3xl border transition-all duration-300 hover:-translate-y-1 text-left shadow-lg img-highlight-card ${
              isDark
                ? 'bg-[#08152e]/90 hover:bg-[#0c224a] border-blue-900/60 hover:border-cyan-400/60'
                : 'bg-white hover:bg-amber-50/70 border-amber-200/90 hover:border-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.08)]'
            }`}
          >
            {/* Top row: Icon + optional badge */}
            <div className="flex items-center justify-between w-full mb-3">
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${getIconBg(
                  action.actionKey
                )}`}
              >
                {getIcon(action.iconName)}
              </div>

              {action.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border border-amber-400/50 text-[#E5B869]">
                  {action.badge}
                </span>
              )}
            </div>

            {/* Title & description */}
            <div className="w-full">
              <h4 className={`text-xs sm:text-sm font-black uppercase tracking-tight transition-colors ${
                isDark ? 'text-white group-hover:text-cyan-200' : 'text-slate-900 group-hover:text-amber-800'
              }`}>
                {action.title}
              </h4>
              <p className={`text-[11px] mt-0.5 line-clamp-1 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
