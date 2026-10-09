import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Lock,
  Phone,
  User,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Gem,
} from 'lucide-react';
import { ConfettiCelebration } from './ConfettiCelebration';
import { useMining } from '../context/MiningContext';
import { PLATFORM_CONFIG } from '../data/miningData';
import diamondmineLogo from '../assets/images/diamondmine.jpg';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register';
  onClose: () => void;
  onOpenAdmin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onOpenAdmin,
}) => {
  const { currentUser, isAdmin, register, login, theme } = useMining();
  const isAuthenticated = Boolean(currentUser || isAdmin);
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [initialTab, isOpen]);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+251 9');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rockerPledgeActive, setRockerPledgeActive] = useState(false);

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // 3D Tilt
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -8;
    const rotY = ((x - centerX) / centerX) * 8;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handlePointerLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!phone || phone.replace(/\D/g, '').length < 9) {
      setError('Please enter a valid phone number');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password Confirmation does not match');
      return;
    }
    if (!rockerPledgeActive) {
      setError('Please check the box to confirm your mining pledge and agreement');
      return;
    }

    setLoading(true);
    const refBy = new URLSearchParams(window.location.search).get('ref_by') || undefined;
    const res = await register({ name, phone, password, refBy });
    setLoading(false);

    if (!res.success) {
      setError(res.message || 'Registration failed');
      return;
    }

    setRegistrationSuccess(true);
    setShowConfetti(true);

    window.setTimeout(() => {
      setRegistrationSuccess(false);
      setShowConfetti(false);
      onClose();
    }, 1800);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginIdentifier.trim()) {
      setError('Please enter your Registered Name, Phone, or ID');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    const res = await login({ nameOrPhone: loginIdentifier, password });
    setLoading(false);

    if (!res.success) {
      setError(res.message || 'Invalid credentials');
      return;
    }

    setLoginSuccess(true);

    window.setTimeout(() => {
      setLoginSuccess(false);
      onClose();
      if (res.isAdmin && onOpenAdmin) {
        onOpenAdmin();
      }
    }, 700);
  };

  return (
    <>
      <ConfettiCelebration active={showConfetti} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
        <div
          className="relative w-full max-w-md my-auto"
          style={{ perspective: '1400px' }}
        >
          <div
            ref={cardRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className={`relative w-full rounded-3xl border-2 p-6 sm:p-8 shadow-2xl text-left backdrop-blur-xl transition-transform duration-200 ease-out overflow-hidden ${
              isDark
                ? 'bg-[#07132a]/95 border-cyan-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.25)] text-slate-100'
                : 'bg-white/95 border-amber-300 shadow-[0_20px_50px_rgba(0,0,0,0.2),0_0_30px_rgba(245,158,11,0.2)] text-slate-900'
            }`}
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Dynamic Glare */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20 transition-opacity duration-300 rounded-3xl"
              style={{
                background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
              }}
            />

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#E5B869] rounded-tr-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#E5B869] rounded-bl-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-3xl pointer-events-none" />

            {/* Close Button - Only available if already authenticated */}
            {isAuthenticated && (
              <button
                onClick={onClose}
                type="button"
                className="absolute top-4 right-4 z-20 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* STATE 1: REGISTRATION SUCCESS */}
            {registrationSuccess ? (
              <div className="py-6 flex flex-col items-center text-center animate-scaleUp">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#E5B869] shadow-[0_0_30px_rgba(229,184,105,0.7)] mb-4">
                  <img src={diamondmineLogo} alt="Logo" className="w-full h-full object-cover" />
                </div>

                <div className="space-y-1 mb-4">
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#E5B869] flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
                    <span>+100 ETB BONUS CREDITED</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase drop-shadow-[0_0_25px_rgba(56,189,248,0.8)]">
                    YOU HAVE <br />
                    <span className="bg-gradient-to-r from-cyan-300 via-white to-[#E5B869] bg-clip-text text-transparent">
                      SUCCESSFULLY
                    </span> <br />
                    REGISTERED
                  </h2>
                </div>

                <p className="text-xs text-slate-300 max-w-xs mb-6 leading-relaxed">
                  Welcome to <strong className="text-white">DiamondMine Africa</strong>, <span className="text-cyan-300 font-bold">{name}</span>! Your mining wallet is loaded with your 100 ETB registration bonus.
                </p>

                <div className="w-full p-3.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-center gap-2 text-cyan-300 text-xs font-bold animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>SYNCHRONIZING SECURE DASHBOARD...</span>
                </div>
              </div>
            ) : loginSuccess ? (
              /* STATE 2: LOGIN SUCCESS */
              <div className="py-8 flex flex-col items-center text-center animate-scaleUp">
                <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-400/60 flex items-center justify-center text-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.5)] mb-4">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                  AUTHENTICATION VERIFIED
                </h3>
                <p className="text-xs text-slate-300 mb-4">
                  Welcome back to your DiamondMine Africa account.
                </p>
                <div className="text-xs font-mono text-cyan-300 animate-pulse">
                  Opening Secure Portfolio Nodes...
                </div>
              </div>
            ) : (
              /* STATE 3: FORM */
              <>
                {/* Header with Official Circular Logo */}
                <div className="text-center mb-5">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#E5B869] mx-auto mb-2.5 shadow-[0_0_20px_rgba(229,184,105,0.4)]">
                    <img src={diamondmineLogo} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    DIAMONDMINE AFRICA
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {tab === 'register'
                      ? 'Create your digital mineral account & get 100 ETB Bonus'
                      : 'Sign in with your registered credentials'}
                  </p>
                </div>

                {/* Tabs Switcher */}
                <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800 mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('register');
                      setError('');
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      tab === 'register'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    SIGN UP (+100 ETB)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setError('');
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      tab === 'login'
                        ? 'bg-gradient-to-r from-[#F6C76D] to-[#D4AF37] text-slate-950 font-black shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    SIGN IN (LOGIN)
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/50 flex items-center gap-2 text-xs text-red-200 shadow-sm animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* SIGN UP FORM */}
                {tab === 'register' ? (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    {/* 1. Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Full Name <span className="text-cyan-400">*</span>
                      </label>
                      <div className="relative group">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-300" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          required
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0a1835] border border-blue-900/70 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    {/* 2. Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Phone Number (Telebirr / CBE) <span className="text-cyan-400">*</span>
                      </label>
                      <div className="relative group">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-300" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+251 9..."
                          required
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0a1835] border border-blue-900/70 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    {/* 3. Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Password <span className="text-cyan-400">*</span>
                      </label>
                      <div className="relative group">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-300" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create secure password"
                          required
                          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#0a1835] border border-blue-900/70 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* 4. Password Confirm */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Confirm Password <span className="text-cyan-400">*</span>
                      </label>
                      <div className="relative group">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-300" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          required
                          className={`w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#0a1835] border text-white placeholder-slate-500 text-xs focus:outline-none ${
                            confirmPassword && password !== confirmPassword
                              ? 'border-red-500'
                              : 'border-blue-900/70 focus:border-cyan-400'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* 5. Box (I confirm) Checkbox */}
                    <div className="pt-1">
                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 cursor-pointer hover:border-cyan-500/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={rockerPledgeActive}
                          onChange={(e) => setRockerPledgeActive(e.target.checked)}
                          className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                        />
                        <span className="text-[11px] text-slate-300 leading-tight">
                          I confirm my registration, accept platform terms, and claim my <strong>100 ETB Registration Bonus</strong>.
                        </span>
                      </label>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-[#E5B869] text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>COMPLETE REGISTRATION</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* SIGN IN FORM */
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Registered Name, Phone, or ID <span className="text-[#E5B869]">*</span>
                      </label>
                      <div className="relative group">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E5B869]" />
                        <input
                          type="text"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="Name, +251 9..., or 17967805"
                          required
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0a1835] border border-blue-900/70 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E5B869]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Password <span className="text-[#E5B869]">*</span>
                      </label>
                      <div className="relative group">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E5B869]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Your secure password"
                          required
                          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#0a1835] border border-blue-900/70 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E5B869]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#F6C76D] to-[#D4AF37] text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(246,199,109,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>AUTHENTICATE & ENTER</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <div className="mt-5 pt-3 border-t border-slate-800/80 text-center text-[10px] text-slate-400 font-mono">
                  256-Bit Encrypted African Mineral Platform
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
