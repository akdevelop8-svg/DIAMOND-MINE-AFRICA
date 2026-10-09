import React, { useState, useEffect } from 'react';
import { Pickaxe, ArrowRight, ArrowDownLeft, Gift, ShieldCheck, CheckCircle2, Award, Zap, Sparkles, Moon } from 'lucide-react';
import { PLATFORM_CONFIG } from '../data/miningData';
import { useMining } from '../context/MiningContext';
import { ThreeDDiamond } from './ThreeDDiamond';
import diamondmineLogo from '../assets/images/diamondmine.jpg';
import heroBg from '../assets/images/hero_diamondmine_landscape_1791052743976.jpg';
import minersHighlightImg1 from '../assets/images/miners_diamonds_night_1791348378876.jpg';
import minersHighlightImg2 from '../assets/images/african_mineral_extraction_night_1791353039968.jpg';

interface HeroSectionProps {
  onMineAndEarn: () => void;
  onOpenRecharge: () => void;
  onOpenRegister: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onMineAndEarn,
  onOpenRecharge,
  onOpenRegister,
}) => {
  const { currentUser, theme } = useMining();
  const isDark = theme === 'dark';

  // 5-second automatic image rotation between the 2 vivid African Mineral Extraction images
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const highlightImages = [minersHighlightImg1, minersHighlightImg2];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % highlightImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [highlightImages.length]);

  return (
    <section id="home" className="relative w-full overflow-hidden pt-6 pb-12 lg:pb-16 text-left">
      {/* Background Image with Obsidian & Blue Gradient Overlays */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={heroBg}
          alt="Diamond Mining Operations"
          className="w-full h-full object-cover object-center filter brightness-[0.4] contrast-[1.2]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#040814] via-[#040814]/90 to-[#040814]/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040814] via-transparent to-[#040814]/70 z-10" />
      </div>

      {/* Luminous Moon & Starry Cosmos Sky (ጨረቃ እና ኮከቦች) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Glowing Luminous Moon (ጨረቃ) */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-24 w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
          {/* Moonlight Outer Radiance Halo */}
          <div className="absolute inset-0 rounded-full bg-cyan-200/20 blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-amber-100/15 blur-3xl" />
          
          {/* Moon Body with Craters & Crescent Sheen */}
          <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#CBD5E1] shadow-[0_0_35px_rgba(254,243,199,0.9),0_0_20px_rgba(56,189,248,0.7)] border border-white/60 flex items-center justify-center overflow-hidden">
            {/* Crater shadows */}
            <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-amber-300/30 blur-[1px]" />
            <div className="absolute bottom-3 right-4 w-4 h-4 rounded-full bg-slate-400/25 blur-[1px]" />
            <div className="absolute top-6 right-3 w-2 h-2 rounded-full bg-amber-400/20" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/40 pointer-events-none" />
          </div>
        </div>

        {/* Twinkling Cosmic Stars (ኮከቦች) */}
        {[
          { top: '6%', left: '8%', size: 3, delay: '0.1s', dur: '2.4s', color: 'bg-white' },
          { top: '14%', left: '32%', size: 4, delay: '0.7s', dur: '3.1s', color: 'bg-cyan-200' },
          { top: '25%', left: '48%', size: 3, delay: '1.2s', dur: '2.8s', color: 'bg-amber-100' },
          { top: '10%', left: '62%', size: 5, delay: '0.4s', dur: '3.5s', color: 'bg-cyan-300' },
          { top: '18%', right: '35%', size: 4, delay: '1.5s', dur: '2.6s', color: 'bg-white' },
          { top: '30%', right: '12%', size: 3, delay: '0.8s', dur: '3.3s', color: 'bg-cyan-200' },
          { top: '42%', left: '15%', size: 4, delay: '1.8s', dur: '3.8s', color: 'bg-amber-200' },
          { top: '55%', left: '4%', size: 3, delay: '0.3s', dur: '2.7s', color: 'bg-cyan-100' },
          { top: '68%', right: '28%', size: 4, delay: '1.0s', dur: '3.0s', color: 'bg-white' },
          { top: '78%', left: '52%', size: 3, delay: '0.5s', dur: '2.9s', color: 'bg-cyan-300' },
        ].map((star, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${star.color} shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse`}
            style={{
              top: star.top,
              left: star.left,
              right: star.right,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
              animationDuration: star.dur,
            }}
          />
        ))}
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Typography, Value Proposition & Dual Action Cards */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">

            {/* Main Title Lockup with Brand Logo */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#E5B869] shadow-[0_0_25px_rgba(229,184,105,0.6)] shrink-0">
                  <img src={diamondmineLogo} alt="Diamondmine Africa Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase">
                  DIAMONDMINE
                </h1>
              </div>
              
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wide text-[#E5B869] drop-shadow-[0_0_25px_rgba(229,184,105,0.4)] uppercase">
                AFRICA
              </div>

              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full bg-[#0a1b38] border border-cyan-400/60 text-xs sm:text-sm font-black tracking-[0.2em] text-[#E5B869] uppercase shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  TODAY WE CREATE || TOMORROW WE GROW
                </span>
              </div>
            </div>

            {/* Subtext */}
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Africa's premier digital mineral asset ecosystem. Participate in 365-day strategic yield mining contracts from VIP 1 to VIP 10, claim daily mining earnings every 24 hours, and enjoy instant bank withdrawals via CBE and Telebirr.
            </p>

            {/* Dual Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-xl pt-2">
              {/* Card 1: MINE & EARN */}
              <button
                onClick={onMineAndEarn}
                type="button"
                className="group relative flex items-center justify-between p-4 rounded-2xl bg-[#091938]/90 hover:bg-[#0c224d] border border-cyan-500/40 hover:border-cyan-400 backdrop-blur-md transition-all shadow-[0_4px_24px_rgba(6,182,212,0.25)] hover:shadow-[0_6px_30px_rgba(6,182,212,0.4)] text-left img-highlight-card"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-cyan-950/90 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.5)]">
                    <Pickaxe className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                      MINE & EARN
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Explore VIP 1 - 10 Plans
                    </p>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-cyan-500/20 group-hover:bg-cyan-400/30 flex items-center justify-center text-cyan-200 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Card 2: RECHARGE WALLET */}
              <button
                onClick={onOpenRecharge}
                type="button"
                className="group relative flex items-center justify-between p-4 rounded-2xl bg-[#1b1509]/90 hover:bg-[#281f0e] border border-amber-500/40 hover:border-amber-400 backdrop-blur-md transition-all shadow-[0_4px_24px_rgba(245,158,11,0.2)] hover:shadow-[0_6px_30px_rgba(245,158,11,0.4)] text-left img-highlight-card"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-950/90 border border-amber-400/60 flex items-center justify-center text-[#E5B869] shadow-[0_0_12px_rgba(229,184,105,0.5)]">
                    <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                      RECHARGE WALLET
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Commercial Bank of Ethiopia
                    </p>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-amber-500/20 group-hover:bg-amber-400/30 flex items-center justify-center text-amber-200 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* Vivid Highlight Showcase: Real Miners Harvesting Glowing Diamonds (Dual Rotating 5s Slideshow) */}
            <div className="w-full max-w-xl rounded-3xl overflow-hidden border-2 border-cyan-400/50 bg-gradient-to-br from-[#06152d] via-[#091f42] to-[#040e20] shadow-[0_10px_35px_rgba(6,182,212,0.35)] p-3 group relative">
              <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden">
                {/* Image 1 */}
                <img
                  src={minersHighlightImg1}
                  alt="African Miners Harvesting Glowing Diamonds"
                  className={`absolute inset-0 w-full h-full object-cover filter brightness-[1.05] contrast-[1.12] transition-opacity duration-1000 ${
                    activeImgIndex === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                  }`}
                  referrerPolicy="no-referrer"
                />

                {/* Image 2 */}
                <img
                  src={minersHighlightImg2}
                  alt="African Mineral Extraction Quarry Operations"
                  className={`absolute inset-0 w-full h-full object-cover filter brightness-[1.05] contrast-[1.12] transition-opacity duration-1000 ${
                    activeImgIndex === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                  }`}
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#040c1d] via-[#040c1d]/30 to-transparent pointer-events-none" />

                {/* Slide Indicators on top right */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#051126]/80 border border-cyan-400/50 backdrop-blur-md z-10">
                  <span
                    onClick={() => setActiveImgIndex(0)}
                    className={`h-2 rounded-full cursor-pointer transition-all ${
                      activeImgIndex === 0 ? 'w-5 bg-cyan-400' : 'w-2 bg-slate-500 hover:bg-slate-400'
                    }`}
                  />
                  <span
                    onClick={() => setActiveImgIndex(1)}
                    className={`h-2 rounded-full cursor-pointer transition-all ${
                      activeImgIndex === 1 ? 'w-5 bg-[#E5B869]' : 'w-2 bg-slate-500 hover:bg-slate-400'
                    }`}
                  />
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-10">
                  <div>
                    <span className="text-xs sm:text-sm font-black text-[#E5B869] block drop-shadow-md uppercase tracking-wider">
                      AFRICAN MINERAL EXTRACTION
                    </span>
                    <span className="text-[11px] text-slate-200">
                      Real-time automated yield distribution every 24h
                    </span>
                  </div>
                  <button
                    onClick={onMineAndEarn}
                    type="button"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-[#E5B869] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span>START</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Faceted Diamond Shield Visual with Unobstructed View */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="w-full max-w-sm sm:max-w-md aspect-square flex items-center justify-center">
              <ThreeDDiamond />
            </div>
          </div>

        </div>

        {/* Official Platform Parameters Grid (Matching image4.jpg) */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 p-3 rounded-3xl bg-[#061124]/90 border border-cyan-500/30 backdrop-blur-md font-mono text-center shadow-2xl">
          <div className="p-2.5 rounded-2xl bg-[#081733] border border-blue-900/60">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Reg. Bonus</span>
            <span className="text-sm font-black text-[#E5B869]">100 ETB</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#081733] border border-blue-900/60">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Min Investment</span>
            <span className="text-sm font-black text-cyan-300">300 ETB</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#081733] border border-blue-900/60">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Max Investment</span>
            <span className="text-sm font-black text-white">200,000 ETB</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#081733] border border-blue-900/60">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Min Withdrawal</span>
            <span className="text-sm font-black text-emerald-400">150 ETB</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#081733] border border-blue-900/60">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Withdrawal Fee</span>
            <span className="text-sm font-black text-amber-400">8%</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#081733] border border-blue-900/60">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Contract Period</span>
            <span className="text-sm font-black text-purple-300">365 Days</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#081733] border border-blue-900/60 col-span-2 sm:col-span-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Daily Check-In</span>
            <span className="text-sm font-black text-[#E5B869]">1 ETB</span>
          </div>
        </div>

      </div>
    </section>
  );
};
