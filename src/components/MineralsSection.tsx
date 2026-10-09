import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Mineral, MINERALS_LIST } from '../data/miningData';
import { useMining } from '../context/MiningContext';
import { MineralGraphic } from './MineralGraphic';

interface MineralsSectionProps {
  onSelectMineral: (mineral: Mineral) => void;
  onExploreAll: () => void;
}

export const MineralsSection: React.FC<MineralsSectionProps> = ({
  onSelectMineral,
  onExploreAll,
}) => {
  const { theme } = useMining();
  const isDark = theme === 'dark';

  return (
    <section id="minerals" className="relative py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left scroll-mt-20">
      
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          {/* Eyebrow Label */}
          <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#E5B869] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
            <span>OUR STRATEGIC MINERALS</span>
          </div>

          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Valuable Resources <br />
            <span className={isDark ? 'text-slate-300' : 'text-[#E5B869]'}>
              For a Brighter Future
            </span>
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:max-w-xl">
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            We power progress through Africa&apos;s rich natural resources. Explore our premium mineral categories and be part of their primary extraction.
          </p>

          <button
            onClick={onExploreAll}
            type="button"
            className="group flex items-center gap-2 text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 px-4 py-2 rounded-full border border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/40 transition-all duration-200 shrink-0 shadow-sm"
          >
            <span>Explore all</span>
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 group-hover:bg-cyan-400/40 flex items-center justify-center transition-colors">
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* 8 Mineral Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {MINERALS_LIST.map((mineral) => {
          return (
            <button
              key={mineral.id}
              onClick={() => onSelectMineral(mineral)}
              type="button"
              className={`group relative flex flex-col items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shadow-lg img-highlight-card ${
                isDark
                  ? 'bg-[#081226]/90 hover:bg-[#0d1e3d] border-blue-900/60 hover:border-cyan-400/60 text-white'
                  : 'bg-white hover:bg-amber-50/60 border-amber-200 hover:border-amber-400 text-slate-900'
              }`}
            >
              {/* Graphic container with subtle ambient glow */}
              <div className="relative py-2 flex items-center justify-center w-full min-h-[76px]">
                <MineralGraphic
                  type={mineral.name}
                  size="md"
                  className="group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                />
              </div>

              {/* Mineral Name */}
              <div className="mt-2 text-center w-full">
                <span className={`text-sm font-black uppercase transition-colors ${
                  isDark ? 'text-white group-hover:text-cyan-200' : 'text-slate-900 group-hover:text-amber-800'
                }`}>
                  {mineral.name}
                </span>
              </div>

              {/* Bottom Glow Indicator Line */}
              <div
                className="w-8 h-[3px] rounded-full mt-2.5 transition-all duration-300 group-hover:w-12 shadow-sm"
                style={{
                  backgroundColor: mineral.accentColor,
                  boxShadow: `0 0 10px ${mineral.glowColor}`,
                }}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
};
