import React from 'react';
import {
  Send,
  Headphones,
  UserPlus,
  Layers,
  CalendarCheck,
  Wallet,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { PLATFORM_CONFIG } from '../data/miningData';
import communityImg from '../assets/images/community_miners_sunset_1791052755608.jpg';
import supportImg from '../assets/images/support_help_center_1791062643777.jpg';

interface BottomSectionsProps {
  onRegisterStep: () => void;
  onChoosePlanStep: () => void;
  onDailyActivityStep: () => void;
  onDashboardStep: () => void;
}

export const BottomSections: React.FC<BottomSectionsProps> = ({
  onRegisterStep,
  onChoosePlanStep,
  onDailyActivityStep,
  onDashboardStep,
}) => {
  const steps = [
    {
      step: 1,
      title: 'Sign Up (+100 ETB)',
      desc: 'Create your digital mining account with Name and Phone.',
      icon: UserPlus,
      action: onRegisterStep,
    },
    {
      step: 2,
      title: 'Select VIP Plan',
      desc: 'Recharge via CBE and choose your 365-day mineral node.',
      icon: Layers,
      action: onChoosePlanStep,
    },
    {
      step: 3,
      title: 'Daily Mining & Check-in',
      desc: 'Claim your automated daily yield every 24 hours.',
      icon: CalendarCheck,
      action: onDailyActivityStep,
    },
    {
      step: 4,
      title: 'Secure Cash Out',
      desc: 'Request a payout to Telebirr or bank channels (8% fee) for admin verification.',
      icon: Wallet,
      action: onDashboardStep,
    },
  ];

  return (
    <section className="relative py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
      
      {/* 1. HOW IT WORKS */}
      <div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[#E5B869] text-xs font-bold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
              <span>STEP-BY-STEP OPERATION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              HOW DIAMONDMINE WORKS
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md md:text-right">
            Get started in 4 simple steps and participate in Africa's premier digital mineral asset network.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                onClick={item.action}
                className="p-5 rounded-3xl bg-[#08152e]/90 hover:bg-[#0c224a] border border-blue-900/60 hover:border-cyan-400/60 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-black text-sm group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-cyan-300 transition-colors" />
                  </div>

                  <h3 className="text-base font-extrabold text-white mb-1.5 uppercase">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 flex items-center text-xs font-bold text-cyan-300 group-hover:text-[#E5B869] transition-colors">
                  <span>Start Step</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. DUAL OFFICIAL TELEGRAM CHANNELS (COMMUNITY & SUPPORT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Card 1: Official Telegram Community */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-cyan-500/40 bg-[#09162e] p-6 sm:p-8 flex flex-col justify-between shadow-2xl group img-highlight-card">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src={communityImg}
              alt="Miners Community"
              className="w-full h-full object-cover filter brightness-[0.55] contrast-125 saturate-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060e20] via-[#060e20]/80 to-transparent" />
          </div>

          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/90 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-md">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              JOIN OUR COMMUNITY
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed max-w-sm">
              Connect with thousands of active miners, get daily payment receipts, announcements, and referral strategies on Telegram.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <a
              href={PLATFORM_CONFIG.telegramCommunity}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>JOIN COMMUNITY</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Card 2: Official Telegram Customer Support */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 bg-[#081329] p-6 sm:p-8 flex flex-col justify-between shadow-2xl group img-highlight-card">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src={supportImg}
              alt="Customer Support"
              className="w-full h-full object-cover filter brightness-[0.55] contrast-125 saturate-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060e20] via-[#060e20]/80 to-transparent" />
          </div>

          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/90 border border-amber-400/60 flex items-center justify-center text-[#E5B869] shadow-md">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              CUSTOMER SUPPORT
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed max-w-sm">
              Need help with deposits, withdrawals, or account verification? Our 24/7 official support team is ready to assist you directly on Telegram.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <a
              href={PLATFORM_CONFIG.telegramSupport}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#F6C76D] via-[#E5B869] to-[#D4AF37] text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(246,199,109,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>CONTACT</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

    </section>
  );
};
