import React from 'react';
import { X, Sparkles, MapPin, Gauge, Shield, ArrowRight } from 'lucide-react';
import { Mineral } from '../data/miningData';
import { MineralGraphic } from './MineralGraphic';

interface MineralDetailModalProps {
  mineral: Mineral | null;
  isOpen: boolean;
  onClose: () => void;
  onViewPlans: () => void;
}

export const MineralDetailModal: React.FC<MineralDetailModalProps> = ({
  mineral,
  isOpen,
  onClose,
  onViewPlans,
}) => {
  if (!isOpen || !mineral) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#081329] border border-blue-800/60 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-left">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mineral Header & Graphic */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <div className="relative p-4 rounded-2xl bg-[#0b1730] border border-blue-900/60 shadow-inner flex items-center justify-center">
            <MineralGraphic type={mineral.name} size="lg" />
          </div>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-[#E5B869] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>African Strategic Mineral</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {mineral.name}
            </h2>
            <div
              className="w-12 h-1 rounded-full mt-2 mx-auto sm:mx-0 shadow-sm"
              style={{ backgroundColor: mineral.accentColor }}
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {mineral.description}
        </p>

        {/* Geological Specs */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-[#0c1c3c] border border-blue-900/60 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Purity</span>
            </div>
            <div className="text-sm font-bold text-white font-mono">{mineral.purity}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0c1c3c] border border-blue-900/60 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hardness</span>
            </div>
            <div className="text-sm font-bold text-white font-mono">{mineral.hardness}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0c1c3c] border border-blue-900/60 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#E5B869]" />
              <span>Reserve Zone</span>
            </div>
            <div className="text-xs font-bold text-white truncate">{mineral.location}</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              onClose();
              onViewPlans();
            }}
            type="button"
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <span>View {mineral.name} Mining Plans</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            type="button"
            className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
