import React from 'react';
import { Layers, CalendarCheck, Users, Network } from 'lucide-react';
import { FEATURE_STRIP } from '../data/miningData';
import { useMining } from '../context/MiningContext';

interface FeatureStripProps {
  onItemClick?: (id: string) => void;
}

export const FeatureStrip: React.FC<FeatureStripProps> = ({ onItemClick }) => {
  const { theme } = useMining();
  const isDark = theme === 'dark';

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'layers':
        return <Layers className="w-5 h-5 text-blue-400" />;
      case 'calendar-check':
        return <CalendarCheck className="w-5 h-5 text-purple-400" />;
      case 'users':
        return <Users className="w-5 h-5 text-amber-400" />;
      case 'network':
        return <Network className="w-5 h-5 text-cyan-400" />;
      default:
        return <Layers className="w-5 h-5 text-blue-400" />;
    }
  };

  const getIconBg = (id: string) => {
    switch (id) {
      case 'active-plans':
        return 'bg-blue-600/20 border-blue-400/50 shadow-[0_0_12px_rgba(59,130,246,0.3)]';
      case 'daily-activity':
        return 'bg-purple-600/20 border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
      case 'community':
        return 'bg-amber-600/20 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
      case 'mineral-network':
        return 'bg-cyan-600/20 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]';
      default:
        return 'bg-blue-600/20 border-blue-400/50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div
        className={`rounded-3xl border backdrop-blur-md p-4 sm:p-5 shadow-xl transition-colors ${
          isDark
            ? 'bg-[#07132a]/85 border-blue-900/60 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-white border-amber-200/90 shadow-[0_4px_25px_rgba(245,158,11,0.1)]'
        }`}
      >
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x ${
          isDark ? 'lg:divide-blue-900/40' : 'lg:divide-amber-200/60'
        }`}>
          {FEATURE_STRIP.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick && onItemClick(item.id)}
              type="button"
              className={`group flex items-center gap-4 px-3 lg:px-6 py-2 rounded-2xl transition-all text-left focus:outline-none ${
                isDark ? 'hover:bg-blue-950/40' : 'hover:bg-amber-50/80'
              }`}
            >
              {/* Circular Icon */}
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${getIconBg(
                  item.id
                )}`}
              >
                {getIcon(item.iconName)}
              </div>

              {/* Text */}
              <div className="leading-tight">
                <span className={`text-sm font-black block uppercase ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {item.title}
                </span>
                <span className={`text-xs block mt-0.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {item.subtitle}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
