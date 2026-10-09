import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Copy,
  Check,
  Users,
  Share2,
  TrendingUp,
  Award,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useMining } from '../context/MiningContext';
import { TEAM_RECHARGE_REWARDS, COMMISSION_TIERS, PLATFORM_CONFIG } from '../data/miningData';
import { api } from '../lib/api';

import image1 from '../assets/images/image1.jpg';
import image2 from '../assets/images/image2.jpg';
import image3 from '../assets/images/image3.jpg';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, theme, showToast } = useMining();
  const [copied, setCopied] = useState(false);
  const [summary, setSummary] = useState<{
    levels: Array<{level:number;members:number;rechargeVolume:number}>;
    totalCommission:number;
    rewards:Array<{code:string;amount:number;threshold:number;createdAt:string}>;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !currentUser) return;
    let active = true;
    setSummaryLoading(true);
    api<{levels:Array<{level:number;members:number;rechargeVolume:number}>;totalCommission:number;rewards:Array<{code:string;amount:number;threshold:number;createdAt:string}>}>('/team/summary')
      .then((data) => { if (active) setSummary(data); })
      .catch(() => { if (active) setSummary(null); })
      .finally(() => { if (active) setSummaryLoading(false); });
    return () => { active = false; };
  }, [isOpen, currentUser?.id]);

  const levelSummary = useMemo(() => {
    const map = new Map<number, {members:number;rechargeVolume:number}>();
    for (const row of summary?.levels || []) map.set(row.level, {members:row.members, rechargeVolume:row.rechargeVolume});
    return map;
  }, [summary]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const referralId = currentUser?.numericId || '';
  const referralLink = `${window.location.origin}/register?ref_by=${encodeURIComponent(referralId)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('Personal invitation link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className={`relative w-full max-w-3xl my-auto rounded-3xl border p-5 sm:p-8 shadow-2xl transition-all max-h-[90vh] overflow-y-auto ${
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#E5B869] uppercase block">
              MINERAL NETWORK & REWARDS
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              MY TEAM & INVITATION PROGRAM
            </h2>
          </div>
        </div>

        {/* Invitation Link Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c224a] via-[#091b3b] to-[#040e22] border-2 border-cyan-500/50 shadow-lg mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Share2 className="w-4 h-4" />
              <span>Your Exclusive Invitation Link</span>
            </span>
            <span className="text-[11px] font-mono text-[#E5B869] font-bold">
              User ID: {referralId}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="w-full flex-1 p-3 rounded-xl bg-[#061226] border border-cyan-500/40 text-xs font-mono text-cyan-200 truncate select-all">
              {referralLink}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-[#E5B869] text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 shadow-md"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'COPIED LINK' : 'COPY INVITATION LINK'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Share this link with friends and partners. When they register and recharge, you automatically earn tier commissions and unlock qualifying team recharge rewards!
          </p>
        </div>

        {/* Live Team Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          <div className="p-3 rounded-2xl bg-[#081b3d] border border-cyan-500/30">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Team Members</span>
            <span className="text-xl font-black text-cyan-300 font-mono">{summaryLoading ? '—' : (summary?.levels || []).reduce((n, row) => n + row.members, 0)}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#081b3d] border border-cyan-500/30">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Team Volume</span>
            <span className="text-xl font-black text-cyan-300 font-mono">{summaryLoading ? '—' : `${Math.round((summary?.levels || []).reduce((n,row) => n + row.rechargeVolume, 0)).toLocaleString()} ETB`}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#081b3d] border border-cyan-500/30">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Commission Earned</span>
            <span className="text-xl font-black text-[#E5B869] font-mono">{summaryLoading ? '—' : `+${Number(summary?.totalCommission || 0).toLocaleString()} ETB`}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#081b3d] border border-cyan-500/30">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Rewards Claimed</span>
            <span className="text-xl font-black text-emerald-300 font-mono">{summaryLoading ? '—' : (summary?.rewards || []).length}</span>
          </div>
        </div>

        {/* 4-Tier Commission Levels */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>4-Level Team Commission Structure (Up to 16% Total)</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-[#081b3d] border border-cyan-500/40 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Level 1 (Direct)</span>
              <span className="text-2xl font-black text-cyan-300 font-mono block">10%</span>
              <span className="text-[10px] text-slate-300">Direct referrals</span><span className="text-[9px] text-cyan-300/80 block mt-1">{levelSummary.get(1)?.members ?? 0} members · {(levelSummary.get(1)?.rechargeVolume ?? 0).toLocaleString()} ETB</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#081b3d] border border-cyan-500/40 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Level 2 (Tier 2)</span>
              <span className="text-2xl font-black text-cyan-300 font-mono block">3%</span>
              <span className="text-[10px] text-slate-300">Sub-team referrals</span><span className="text-[9px] text-cyan-300/80 block mt-1">{levelSummary.get(2)?.members ?? 0} members · {(levelSummary.get(2)?.rechargeVolume ?? 0).toLocaleString()} ETB</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#081b3d] border border-cyan-500/40 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Level 3 (Tier 3)</span>
              <span className="text-2xl font-black text-cyan-300 font-mono block">2%</span>
              <span className="text-[10px] text-slate-300">Level 3 team</span><span className="text-[9px] text-cyan-300/80 block mt-1">{levelSummary.get(3)?.members ?? 0} members · {(levelSummary.get(3)?.rechargeVolume ?? 0).toLocaleString()} ETB</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#081b3d] border border-cyan-500/40 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Level 4 (Tier 4)</span>
              <span className="text-2xl font-black text-cyan-300 font-mono block">1%</span>
              <span className="text-[10px] text-slate-300">Level 4 team</span><span className="text-[9px] text-cyan-300/80 block mt-1">{levelSummary.get(4)?.members ?? 0} members · {(levelSummary.get(4)?.rechargeVolume ?? 0).toLocaleString()} ETB</span>
            </div>
          </div>
        </div>

        {/* Team Recharge Reward Milestones Table */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[#E5B869] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Team Cumulative Recharge Rewards</span>
            </h3>
          </div>

          <div className="rounded-2xl border border-blue-900/80 bg-[#061226] overflow-hidden">
            <div className="grid grid-cols-2 p-3 bg-[#081733] border-b border-blue-900 text-[11px] font-black uppercase text-slate-300">
              <span>Total Team Recharge Volume</span>
              <span className="text-right">Cash Reward Credited</span>
            </div>

            <div className="divide-y divide-slate-800/80 font-mono text-xs">
              {TEAM_RECHARGE_REWARDS.map((item, index) => (
                <div key={index} className="grid grid-cols-2 p-3 hover:bg-slate-900/60 transition-colors items-center">
                  <span className="text-slate-200 font-semibold">{item.label}</span>
                  <span className="text-right font-black text-[#E5B869] text-sm">
                    +{item.rewardETB.toLocaleString()} ETB
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Graphic Banners from User Uploads (No Duplicates) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-xl img-highlight-card">
            <img src={image1} alt="Team Recharge Reward Graphic" className="w-full h-auto object-cover filter brightness-[1.02] contrast-[1.08]" />
          </div>
          <div className="rounded-2xl overflow-hidden border-2 border-blue-400/50 shadow-xl img-highlight-card">
            <img src={image2} alt="Team Commission Program Graphic" className="w-full h-auto object-cover filter brightness-[1.02] contrast-[1.08]" />
          </div>
        </div>

        {/* Telegram Community Quick Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <a
            href={PLATFORM_CONFIG.telegramCommunity}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>Join Official Telegram Channel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
