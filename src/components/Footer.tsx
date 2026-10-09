import React from 'react';
import { FOOTER_LINKS, PLATFORM_CONFIG } from '../data/miningData';
import diamondmineLogo from '../assets/images/diamondmine.jpg';

interface FooterProps {
  onLinkClick: (href: string) => void;
  onFaqClick: () => void;
  onAboutClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onLinkClick, onFaqClick, onAboutClick }) => {
  return (
    <footer id="footer" className="relative w-full bg-[#030611] border-t border-blue-950/80 pt-12 pb-28 lg:pb-20 overflow-hidden text-left">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-10 border-b border-blue-900/30">
          
          {/* Left: Official Logo + Brand + Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-[#E5B869] shadow-[0_0_20px_rgba(229,184,105,0.5)] shrink-0">
                <img src={diamondmineLogo} alt="Diamondmine Africa" className="w-12 h-12 object-cover" />
              </div>

              <div>
                <span className="font-black text-lg sm:text-xl tracking-wider text-white block uppercase">
                  DIAMONDMINE
                </span>
                <span className="font-extrabold text-xs tracking-[0.25em] text-[#E5B869] block uppercase">
                  AFRICA
                </span>
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-blue-800/60" />

            <div className="text-xs font-black tracking-[0.2em] text-[#E5B869] uppercase leading-snug">
              TODAY WE CREATE || TOMORROW WE GROW
            </div>
          </div>

          {/* Middle: Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-bold uppercase tracking-wider text-slate-300">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (link.isExternal) return;
                  e.preventDefault();
                  if (link.name === 'FAQ') {
                    onFaqClick();
                  } else if (link.name === 'About' || link.name === 'About Us' || link.href === '#about') {
                    if (onAboutClick) onAboutClick();
                  } else {
                    onLinkClick(link.href);
                  }
                }}
                target={link.isExternal ? '_blank' : undefined}
                rel={link.isExternal ? 'noreferrer' : undefined}
                className="hover:text-cyan-300 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right: Telegram Community & Support */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <a
              href={PLATFORM_CONFIG.telegramCommunity}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:text-white transition-colors"
            >
              Community
            </a>
            <a
              href={PLATFORM_CONFIG.telegramSupport}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-amber-950 border border-amber-500/40 text-[#E5B869] hover:text-white transition-colors"
            >
              Support
            </a>
          </div>
        </div>

        {/* Bottom Credits with Powered By Developer Link */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <p className="text-slate-400">
            © {new Date().getFullYear()} DIAMONDMINE AFRICA. All Rights Reserved.
          </p>

          {/* Developer Credit Link */}
          <a
            href={PLATFORM_CONFIG.developerLink}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/40 text-[#E5B869] hover:text-white hover:border-amber-400 transition-all shadow-md font-bold tracking-wider"
          >
            <span className="w-2 h-2 rounded-full bg-[#E5B869] group-hover:animate-ping" />
            <span>{PLATFORM_CONFIG.developerBrand}</span>
          </a>
        </div>

      </div>
    </footer>
  );
};
