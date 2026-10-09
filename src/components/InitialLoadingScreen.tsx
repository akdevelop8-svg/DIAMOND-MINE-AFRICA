import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import diamondmineLogo from '../assets/images/diamondmine.jpg';

interface InitialLoadingScreenProps {
  onFinish: () => void;
}

export const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING MINING PROTOCOL...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onFinish();
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Slower, smooth and steady increment
        const increment = Math.floor(Math.random() * 5) + 4; // 4 to 8 percent per tick
        const next = Math.min(100, prev + increment);

        if (next < 25) {
          setStatusText('CALIBRATING GEOLOGICAL SENSORS...');
        } else if (next < 55) {
          setStatusText('SYNCHRONIZING AFRICAN MINERAL LEDGER...');
        } else if (next < 85) {
          setStatusText('ENCRYPTING 256-BIT MINING NODES...');
        } else {
          setStatusText('ACCESS GRANTED · WELCOME');
        }

        return next;
      });
    }, 55); // roughly 0.8–1.5 seconds

    return () => clearInterval(interval);
  }, [onFinish]);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        const finishTimer = setTimeout(() => {
          onFinish();
        }, 350);
        return () => clearTimeout(finishTimer);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030712] text-white transition-all duration-700 select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Deep Space Background Lighting & Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-950/50 via-[#030712] to-[#02040a]" />

      <div className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      {/* Floating Shards */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-sm bg-cyan-400/20 blur-[1px] transform rotate-45 animate-pulse"
            style={{
              width: `${(i % 4) * 4 + 4}px`,
              height: `${(i % 4) * 4 + 4}px`,
              top: `${(i * 19) % 100}%`,
              left: `${(i * 23) % 100}%`,
              animationDuration: `${2 + (i % 3)}s`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Center 3D Loading Emblem & Rings */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Outer Rotating Energy Rings */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center mb-6">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-slate-800/80 fill-none"
              strokeWidth="3.5"
            />
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-cyan-400 fill-none transition-all duration-150 ease-out"
              strokeWidth="3.5"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={2 * Math.PI * 80 * (1 - progress / 100)}
              strokeLinecap="round"
              style={{
                filter: 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.9))',
              }}
            />
          </svg>

          {/* Dash rings */}
          <div
            className="absolute inset-2 border-2 border-dashed border-[#E5B869]/40 rounded-full animate-spin"
            style={{ animationDuration: '16s' }}
          />

          {/* Official Logo in center */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#E5B869] shadow-[0_0_35px_rgba(229,184,105,0.6)] transform hover:scale-105 transition-transform">
            <img src={diamondmineLogo} alt="Diamond Mine Africa" className="w-full h-full object-cover" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full blur-[1px] animate-ping" />
          </div>
        </div>

        {/* Brand Typography */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-black tracking-[0.25em] text-[#E5B869] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
            <span>TODAY WE CREATE || TOMORROW WE GROW</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            DIAMONDMINE
          </h1>
          <div className="text-lg sm:text-xl font-extrabold tracking-[0.35em] text-cyan-400 uppercase">
            AFRICA
          </div>
        </div>

        {/* Progress Bar & Status */}
        <div className="w-full space-y-2.5">
          <div className="relative w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-[#E5B869] rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(56,189,248,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 truncate max-w-[210px] text-left">
              {statusText}
            </span>
            <span className="text-cyan-300 font-bold tabular-nums">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
