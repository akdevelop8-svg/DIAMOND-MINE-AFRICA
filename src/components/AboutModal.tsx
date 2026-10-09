import React from 'react';
import {
  X,
  Sparkles,
  Users,
  Award,
  Layers,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Compass,
} from 'lucide-react';

import image1 from '../assets/images/image1.jpg';
import image2 from '../assets/images/image2.jpg';
import image3 from '../assets/images/image3.jpg';
import image4 from '../assets/images/image4.jpg';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinTeam?: () => void;
  onExplorePlans?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onJoinTeam,
  onExplorePlans,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Background ambient lighting */}
      <div className="fixed w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none -top-12 -left-12" />
      <div className="fixed w-96 h-96 rounded-full bg-amber-500/15 blur-[120px] pointer-events-none -bottom-12 -right-12" />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl max-h-[90vh] my-auto rounded-3xl bg-[#07132a]/95 border-2 border-cyan-500/40 p-5 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_50px_rgba(6,182,212,0.25)] text-left backdrop-blur-xl overflow-y-auto">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="sticky top-0 float-right z-30 p-2.5 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 transition-colors shadow-lg"
          title="Close About Us"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Clear float */}
        <div className="clear-both" />

        {/* ======================================================== */}
        {/* OVERALL ABOUT US INTRO                                   */}
        {/* ======================================================== */}
        <div className="relative z-10 mb-8 rounded-2xl bg-gradient-to-br from-[#091d3f] via-[#081733] to-[#040e22] border border-cyan-500/40 p-5 sm:p-7 shadow-inner">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-[#E5B869] text-xs font-bold uppercase tracking-[0.2em]">
                <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
                <span>ABOUT DIAMONDMINE AFRICA</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight">
                About DiamondMine Africa
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                DiamondMine Africa is a digital platform focused on technology, community participation, and creating a simple user experience. Our platform brings together digital participation features, VIP plans, daily activities, team programs, rewards, and personal account management in one convenient environment.
              </p>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Our mission is to provide a clear and user-friendly digital experience while encouraging responsible participation, community collaboration, and transparency.
              </p>

              {/* Vision Card */}
              <div className="pt-1">
                <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-start gap-3">
                  <Compass className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-0.5">
                      Our Vision
                    </h4>
                    <p className="text-xs text-cyan-100/90 leading-relaxed">
                      To build a recognized and user-friendly digital platform in Africa and use technology to create a better digital participation experience.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-1 text-xs font-mono font-bold tracking-widest text-[#E5B869] uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E5B869] animate-ping" />
                <span>DiamondMine Africa — Mine Today • Grow Tomorrow</span>
              </div>
            </div>

            {/* Quick Pillars */}
            <div className="grid grid-cols-2 gap-2.5 w-full lg:w-72 shrink-0">
              <div className="p-3 rounded-xl bg-[#061124] border border-blue-900/60 flex flex-col justify-between">
                <Users className="w-5 h-5 text-cyan-400 mb-1.5" />
                <div>
                  <div className="text-base font-black text-white">Community</div>
                  <div className="text-[10px] text-slate-400">Team rewards</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#061124] border border-blue-900/60 flex flex-col justify-between">
                <Award className="w-5 h-5 text-[#E5B869] mb-1.5" />
                <div>
                  <div className="text-base font-black text-white">10 VIP Plans</div>
                  <div className="text-[10px] text-slate-400">Tier progression</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#061124] border border-blue-900/60 flex flex-col justify-between">
                <TrendingUp className="w-5 h-5 text-emerald-400 mb-1.5" />
                <div>
                  <div className="text-base font-black text-white">4 Levels</div>
                  <div className="text-[10px] text-slate-400">Up to 16% total</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#061124] border border-blue-900/60 flex flex-col justify-between">
                <ShieldCheck className="w-5 h-5 text-purple-400 mb-1.5" />
                <div>
                  <div className="text-base font-black text-white">Transparent</div>
                  <div className="text-[10px] text-slate-400">Clear structure</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4 SHOWCASE MODULES WITH ACTUAL IMAGES                    */}
        {/* ======================================================== */}
        <div className="space-y-8 sm:space-y-10">
          
          {/* ======================================================== */}
          {/* ITEM 1: Team Recharge Reward (image1.jpg)                */}
          {/* ======================================================== */}
          <div className="rounded-2xl bg-[#08152e] border border-blue-900/60 p-5 sm:p-7 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Image 1 */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)] img-highlight-card">
                  <img
                    src={image1}
                    alt="DiamondMine Africa Team Recharge Reward"
                    className="w-full h-auto object-cover object-center filter brightness-[0.98] contrast-[1.05]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060e20]/60 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Text 1 */}
              <div className="lg:col-span-6 space-y-3 order-1 lg:order-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Team Recharge Reward</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Team Recharge Reward
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  At DiamondMine Africa, we believe that community participation and teamwork are important parts of the platform experience. The Team Recharge Reward section is designed to recognize qualifying team activity based on the total recharge volume generated within a user's team.
                </p>

                <p className="text-xs text-slate-300 leading-relaxed">
                  As team activity grows, users may become eligible for different reward levels according to the applicable recharge thresholds. This feature encourages users to build and maintain an active community while participating in the DiamondMine Africa ecosystem.
                </p>

                {/* Key Highlights */}
                <div className="pt-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
                    <span>Key Highlights:</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Build and grow your team</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Track total team recharge activity</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Reward levels based on qualifying team volume</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Encourage teamwork and community participation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Transparent reward structure</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono font-semibold text-[#E5B869]">
                  DiamondMine Africa — Today We Create • Tomorrow We Grow
                </div>
              </div>

            </div>
          </div>

          {/* ======================================================== */}
          {/* ITEM 2: Team Commission Program (image2.jpg)             */}
          {/* ======================================================== */}
          <div className="rounded-2xl bg-[#08152e] border border-blue-900/60 p-5 sm:p-7 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Text 2 */}
              <div className="lg:col-span-6 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Team Commission</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Team Commission Program
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  The DiamondMine Africa Team Commission Program is designed to recognize eligible team-building activity across multiple levels.
                </p>

                <p className="text-xs text-slate-300 leading-relaxed">
                  The program includes four commission levels, allowing eligible users to receive commissions from qualifying activity within their referral structure:
                </p>

                {/* Levels Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Level 1</div>
                    <div className="text-lg font-black text-cyan-300">10%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Level 2</div>
                    <div className="text-lg font-black text-cyan-300">3%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Level 3</div>
                    <div className="text-lg font-black text-cyan-300">2%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Level 4</div>
                    <div className="text-lg font-black text-cyan-300">1%</div>
                  </div>
                </div>

                {/* Total banner */}
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-purple-950/80 border border-cyan-400/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase">Total Commission</span>
                  <span className="text-xs font-extrabold text-[#E5B869] font-mono">
                    Up to 16% across four levels
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Our goal is to provide a clear and easy-to-understand team structure while encouraging collaboration, community growth, and responsible participation.
                </p>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono font-semibold text-[#E5B869]">
                  Build Your Team • Grow Your Community • Track Your Activity
                </div>
              </div>

              {/* Image 2 */}
              <div className="lg:col-span-6">
                <div className="relative rounded-xl overflow-hidden border border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.2)] img-highlight-card">
                  <img
                    src={image2}
                    alt="DiamondMine Africa Team Commission Program"
                    className="w-full h-auto object-cover object-center filter brightness-[0.98] contrast-[1.05]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060e20]/60 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

            </div>
          </div>

          {/* ======================================================== */}
          {/* ITEM 3: Grow Together with Team Rewards (image3.jpg)     */}
          {/* ======================================================== */}
          <div className="rounded-2xl bg-[#08152e] border border-blue-900/60 p-5 sm:p-7 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Image 3 */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)] img-highlight-card">
                  <img
                    src={image3}
                    alt="DiamondMine Africa Grow Together with Team Rewards"
                    className="w-full h-auto object-cover object-center filter brightness-[0.98] contrast-[1.05]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060e20]/60 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Text 3 */}
              <div className="lg:col-span-6 space-y-3 order-1 lg:order-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Team Recharge Reward</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Grow Together with Team Rewards
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  DiamondMine Africa provides community-oriented features designed to encourage teamwork and participation. The Team Recharge Reward is based on qualifying team recharge activity and provides different reward levels according to the applicable program structure.
                </p>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Users can monitor their team activity and understand how qualifying recharge volumes correspond to available rewards.
                </p>

                <p className="text-xs text-slate-300 leading-relaxed">
                  We aim to make the experience simple, transparent, and accessible so that users can clearly understand the platform's reward structure before participating.
                </p>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono font-semibold text-[#E5B869]">
                  Build Your Team. Support Your Community. Grow Together.
                </div>
              </div>

            </div>
          </div>

          {/* ======================================================== */}
          {/* ITEM 4: VIP Plans & Digital Mining Experience (image4.jpg) */}
          {/* ======================================================== */}
          <div className="rounded-2xl bg-[#08152e] border border-blue-900/60 p-5 sm:p-7 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Text 4 */}
              <div className="lg:col-span-6 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-[#E5B869] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
                  <span>VIP Investment Plans</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  VIP Plans & Digital Mining Experience
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  DiamondMine Africa offers a range of VIP plans designed to provide users with different participation options within the platform.
                </p>

                <p className="text-xs text-slate-300 leading-relaxed">
                  The available plans range from VIP 1 to VIP 10, with different stated investment amounts, daily mining figures, and plan periods. Each plan is presented with its corresponding parameters so users can compare the available options before making a decision.
                </p>

                {/* Features list */}
                <div className="pt-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                    The platform also provides features such as:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span>🎁</span>
                      <span>Registration bonus</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>💎</span>
                      <span>Multiple VIP levels</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>📅</span>
                      <span>Defined plan periods</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>✅</span>
                      <span>Daily check-in functionality</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>📊</span>
                      <span>Personal dashboard</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>💬</span>
                      <span>Customer support</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      <span>👥</span>
                      <span>Team participation and commission features</span>
                    </div>
                  </div>
                </div>

                {/* Risk Notice */}
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed">
                  Users should carefully review the applicable terms, fees, withdrawal conditions, and risks before participating. DiamondMine Africa does not guarantee profits, and participation in financial or mining-related programs may involve risk.
                </div>

                {/* Our Approach */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Our Approach
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Our objective is to create a straightforward digital platform where users can access information, manage their account activity, participate in available programs, and monitor their platform experience from a personal dashboard.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono font-bold text-[#E5B869] uppercase">
                  DiamondMine Africa — TODAY WE CREATE • TOMORROW WE GROW
                </div>
              </div>

              {/* Image 4 */}
              <div className="lg:col-span-6">
                <div className="relative rounded-xl overflow-hidden border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)] img-highlight-card">
                  <img
                    src={image4}
                    alt="DiamondMine Africa VIP Investment Plans"
                    className="w-full h-auto object-cover object-center filter brightness-[0.98] contrast-[1.05]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060e20]/60 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Diamondmine Africa Mining Operations Platform
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              Close Window
            </button>
            {onJoinTeam && (
              <button
                onClick={() => {
                  onClose();
                  onJoinTeam();
                }}
                type="button"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
              >
                Join Team Now
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
