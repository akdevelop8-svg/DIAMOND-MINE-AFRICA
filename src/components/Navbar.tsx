import React, { useState } from 'react';
import { Menu, X, Sun, Moon, User, ShieldAlert, Send, Headphones } from 'lucide-react';
import { NAV_LINKS, PLATFORM_CONFIG } from '../data/miningData';
import { useMining } from '../context/MiningContext';
import diamondmineLogo from '../assets/images/diamondmine.jpg';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenAccount: () => void;
  onOpenAdmin: () => void;
  onOpenAbout: () => void;
  onOpenTeam: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLogin,
  onOpenRegister,
  onOpenAccount,
  onOpenAdmin,
  onOpenAbout,
  onOpenTeam,
}) => {
  const { currentUser, isAdmin, theme, toggleTheme, logout } = useMining();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');

  const isDark = theme === 'dark';

  const handleNavClick = (name: string, href: string, isExternal?: boolean) => {
    setActiveItem(name);
    setMobileMenuOpen(false);

    if (isExternal) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }

    if (name.toUpperCase() === 'ABOUT') {
      onOpenAbout();
      return;
    }

    if (name.toUpperCase() === 'TEAM & REWARDS') {
      onOpenTeam();
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-300 shadow-lg ${
        isDark
          ? 'bg-[#040814]/90 border-blue-900/40 shadow-[0_4px_30px_rgba(0,0,0,0.6)]'
          : 'bg-white/90 border-amber-200 shadow-[0_4px_25px_rgba(0,0,0,0.08)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Zone with Official Diamond Mine Africa Logo */}
        <a 
          href="#home" 
          className="flex items-center gap-3 group focus:outline-none rounded-lg p-1 animate-brandReveal"
        >
          {/* Circular Gold & Diamond Official Logo */}
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#E5B869] shadow-[0_0_15px_rgba(229,184,105,0.4)] group-hover:scale-105 transition-transform shrink-0">
            <img
              src={diamondmineLogo}
              alt="Diamond Mine Africa Official Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col text-left leading-tight">
            <span className={`font-black text-lg sm:text-xl tracking-wider uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              DIAMONDMINE
            </span>
            <span className="font-extrabold text-[11px] sm:text-xs tracking-[0.25em] text-[#E5B869] uppercase">
              AFRICA
            </span>
          </div>
        </a>

        {/* Center Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const isActive = activeItem === link.name;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.name, link.href, link.isExternal);
                }}
                className={`relative text-xs font-bold tracking-wider uppercase transition-all duration-200 py-1 flex items-center gap-1.5 ${
                  link.isHighlight
                    ? 'text-amber-400 hover:text-amber-300 font-black'
                    : isActive
                    ? 'text-cyan-300 font-black'
                    : isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {link.isHighlight && <Headphones className="w-3.5 h-3.5" />}
                <span>{link.name}</span>
                {isActive && !link.isHighlight && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-[#E5B869] rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Desktop Auth / Account / Theme Area */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Toggle (Black / White) */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
                : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* If Admin Logged In */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenAdmin}
                className="py-2.5 px-4 rounded-xl bg-red-950 border border-red-500/80 text-red-200 hover:text-white text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-2 animate-pulse"
              >
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>ADMIN CONSOLE</span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                title="Log out"
              >
                Logout
              </button>
            </div>
          ) : currentUser ? (
            /* If User Logged In $\rightarrow$ MY ACCOUNT button with Balance & Avatar */
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onOpenAccount}
                className="flex items-center gap-2.5 p-1.5 pr-4 rounded-2xl bg-[#091b3b] hover:bg-[#0c2452] border border-cyan-500/50 hover:border-cyan-300 transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E5B869] shrink-0">
                  <img src={diamondmineLogo} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="text-left leading-none">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                    MY ACCOUNT
                  </span>
                  <span className="text-xs font-black text-cyan-300 font-mono">
                    {currentUser.balance.toLocaleString()} ETB
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-colors"
                title="Sign out"
              >
                Logout
              </button>
            </div>
          ) : (
            /* If Guest $\rightarrow$ Login & Get Started */
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onOpenLogin}
                className={`text-xs font-black uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all ${
                  isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-700 hover:text-black hover:bg-amber-100/60'
                }`}
              >
                LOGIN
              </button>

              <button
                type="button"
                onClick={onOpenRegister}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-[#E5B869] text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all"
              >
                GET STARTED
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-800 text-amber-300"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`lg:hidden px-4 pt-2 pb-6 border-b space-y-3 transition-colors ${
            isDark ? 'bg-[#050c1e] border-blue-900/60' : 'bg-white border-amber-200'
          }`}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.name, link.href, link.isExternal);
              }}
              className="block py-2 text-sm font-bold uppercase tracking-wider text-slate-300 hover:text-cyan-300"
            >
              {link.name}
            </a>
          ))}

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAccount();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase"
              >
                MY ACCOUNT ({currentUser.balance.toLocaleString()} ETB)
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase"
                >
                  LOGIN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenRegister();
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-[#E5B869] text-slate-950 font-black text-xs uppercase"
                >
                  GET STARTED (SIGN UP)
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
