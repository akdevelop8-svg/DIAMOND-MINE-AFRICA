/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { MiningProvider, useMining } from './context/MiningContext';

// Components
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MineralsSection } from './components/MineralsSection';
import { FeatureStrip } from './components/FeatureStrip';
import { QuickActions } from './components/QuickActions';
import { VipPlansSection } from './components/VipPlansSection';
import { BottomSections } from './components/BottomSections';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';

// Modals
import { AuthModal } from './components/AuthModal';
import { PlanDetailModal } from './components/PlanDetailModal';
import { RechargeModal } from './components/RechargeModal';
import { WithdrawModal } from './components/WithdrawModal';
import { MyAccountModal } from './components/MyAccountModal';
import { TeamModal } from './components/TeamModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { AboutModal } from './components/AboutModal';
import { FaqModal } from './components/FaqModal';
import { MineralDetailModal } from './components/MineralDetailModal';
import { InitialLoadingScreen } from './components/InitialLoadingScreen';

import { Mineral, VipPlan, MINERALS_LIST, PLATFORM_CONFIG } from './data/miningData';

function MiningAppContent() {
  const { currentUser, isAdmin, sessionReady, theme, toastMessage } = useMining();
  const isAuthenticated = Boolean(currentUser || isAdmin);

  useEffect(() => {
    const refBy = new URLSearchParams(window.location.search).get('ref_by');
    if (refBy && !isAuthenticated) {
      setAuthTab('register');
      setAuthModalOpen(true);
    }
  }, [isAuthenticated]);

  // Initial Loading Screen
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const handleInitialLoadFinish = useCallback(() => setIsLoadingInitial(false), []);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  const [selectedPlan, setSelectedPlan] = useState<VipPlan | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  const [selectedMineral, setSelectedMineral] = useState<Mineral | null>(null);
  const [mineralModalOpen, setMineralModalOpen] = useState(false);

  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [myAccountModalOpen, setMyAccountModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);

  // Handlers
  const handleOpenLogin = () => {
    setAuthTab('login');
    setAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthTab('register');
    setAuthModalOpen(true);
  };

  const handleSelectPlan = (plan: VipPlan) => {
    setSelectedPlan(plan);
    setPlanModalOpen(true);
  };

  const handleSelectMineral = (mineral: Mineral) => {
    setSelectedMineral(mineral);
    setMineralModalOpen(true);
  };

  const handleQuickAction = (actionKey: string) => {
    if (actionKey === 'wallet') {
      if (currentUser) setMyAccountModalOpen(true);
      else handleOpenLogin();
    } else if (actionKey === 'check-in') {
      if (currentUser) setMyAccountModalOpen(true);
      else handleOpenLogin();
    } else if (actionKey === 'mining-tasks' || actionKey === 'plans') {
      const el = document.getElementById('plans');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (actionKey === 'referral-tasks' || actionKey === 'tasks') {
      if (currentUser) setTeamModalOpen(true);
      else handleOpenLogin();
    } else if (actionKey === 'withdraw') {
      if (currentUser) setWithdrawModalOpen(true);
      else handleOpenLogin();
    } else if (actionKey === 'recharge') {
      if (currentUser) setRechargeModalOpen(true);
      else handleOpenLogin();
    } else if (actionKey === 'support') {
      window.open(PLATFORM_CONFIG.telegramSupport, '_blank', 'noopener,noreferrer');
    }
  };

  const isDark = theme === 'dark';

  // Preserve the cinematic loader, then check the server session before rendering
  // any platform content. An unauthenticated visitor can only see login/sign-up.
  if (isLoadingInitial) {
    return <InitialLoadingScreen onFinish={handleInitialLoadFinish} />;
  }

  if (!sessionReady) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030712] text-white px-6 text-center">
        <div className="mb-5 h-12 w-12 rounded-full border-4 border-cyan-900 border-t-cyan-400 animate-spin" />
        <p className="text-sm font-black tracking-[0.2em] text-cyan-200">DIAMONDMINE AFRICA</p>
        <p className="mt-2 text-xs text-slate-400">CHECKING SECURE SESSION...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030712]">
        <AuthModal
          isOpen={true}
          initialTab={authTab}
          onClose={() => { /* Keep the gate closed until authentication succeeds. */ }}
          onOpenAdmin={() => { /* Admin access is granted only by the server session. */ }}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 select-none ${
        isDark
          ? 'bg-[#040814] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200'
          : 'bg-[#F8FAFC] text-slate-900 selection:bg-amber-400/30 selection:text-amber-900'
      }`}
    >
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 p-4 max-w-sm rounded-2xl bg-cyan-950/95 border-2 border-cyan-400 text-cyan-200 text-xs sm:text-sm font-bold shadow-[0_0_30px_rgba(6,182,212,0.6)] backdrop-blur-xl animate-fadeIn flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
        onOpenAccount={() => setMyAccountModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenAbout={() => setAboutModalOpen(true)}
        onOpenTeam={() => { if (currentUser) setTeamModalOpen(true); else handleOpenLogin(); }}
      />

      {/* Main Page Layout */}
      <main className="flex-1 w-full space-y-6 lg:space-y-10 pb-16">
        
        {/* Hero Section */}
        <HeroSection
          onMineAndEarn={() => {
            const el = document.getElementById('plans');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenRecharge={() => {
            if (currentUser) setRechargeModalOpen(true);
            else handleOpenLogin();
          }}
          onOpenRegister={handleOpenRegister}
        />

        {/* Minerals Section */}
        <MineralsSection
          onSelectMineral={handleSelectMineral}
          onExploreAll={() => {
            handleSelectMineral(MINERALS_LIST[0]);
          }}
        />

        {/* Feature / Information Strip */}
        <FeatureStrip
          onItemClick={(id) => {
            if (id === 'active-plans') {
              const el = document.getElementById('plans');
              el?.scrollIntoView({ behavior: 'smooth' });
            } else if (id === 'daily-activity') {
              if (currentUser) setMyAccountModalOpen(true);
              else handleOpenLogin();
            } else if (id === 'community') {
              window.open(PLATFORM_CONFIG.telegramCommunity, '_blank', 'noopener,noreferrer');
            } else if (id === 'mineral-network') {
              if (currentUser) setTeamModalOpen(true);
              else handleOpenLogin();
            }
          }}
        />

        {/* Quick Actions Strip */}
        <QuickActions onActionClick={handleQuickAction} />

        {/* VIP Plans Section (10 VIP Plans with Real 24h Claims) */}
        <VipPlansSection
          onSelectPlan={handleSelectPlan}
          onOpenRecharge={() => { if (currentUser) setRechargeModalOpen(true); else handleOpenLogin(); }}
        />

        {/* How It Works / VIP Poster / Community & Support Links */}
        <BottomSections
          onRegisterStep={handleOpenRegister}
          onChoosePlanStep={() => {
            const el = document.getElementById('plans');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onDailyActivityStep={() => {
            if (currentUser) setMyAccountModalOpen(true);
            else handleOpenLogin();
          }}
          onDashboardStep={() => {
            if (currentUser) setMyAccountModalOpen(true);
            else handleOpenLogin();
          }}
        />

      </main>

      {/* Footer */}
      <Footer
        onLinkClick={(href) => {
          const el = document.querySelector(href);
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onFaqClick={() => setFaqModalOpen(true)}
        onAboutClick={() => setAboutModalOpen(true)}
      />

      {/* Fixed Bottom Quick Navigation (Desktop & Mobile) */}
      <BottomNav
        onOpenInvest={() => {
          const el = document.getElementById('plans');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenRechargeWithdraw={() => {
          if (currentUser) setRechargeModalOpen(true);
          else handleOpenLogin();
        }}
        onOpenTeam={() => { if (currentUser) setTeamModalOpen(true); else handleOpenLogin(); }}
        onOpenAccount={() => {
          if (currentUser) setMyAccountModalOpen(true);
          else handleOpenLogin();
        }}
        onOpenAdmin={isAdmin ? () => setAdminModalOpen(true) : undefined}
      />

      {/* ================= MODALS ================= */}

      {/* 1. Auth Modal (Sign Up & Login & Admin) */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authTab}
        onClose={() => setAuthModalOpen(false)}
        onOpenAdmin={() => setAdminModalOpen(true)}
      />

      {/* 2. Plan Detail & Investment Confirmation Modal */}
      <PlanDetailModal
        plan={selectedPlan}
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        onOpenRecharge={() => {
          setPlanModalOpen(false);
          if (currentUser) setRechargeModalOpen(true); else handleOpenLogin();
        }}
      />

      {/* 3. Recharge Modal (Commercial Bank of Ethiopia) */}
      <RechargeModal
        isOpen={rechargeModalOpen}
        onClose={() => setRechargeModalOpen(false)}
      />

      {/* 4. Withdraw Modal (Telebirr / CBE / Awash / Abyssinia) */}
      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        onOpenRecharge={() => {
          setWithdrawModalOpen(false);
          setRechargeModalOpen(true);
        }}
      />

      {/* 5. My Account & Transaction History Modal */}
      <MyAccountModal
        isOpen={myAccountModalOpen}
        onClose={() => setMyAccountModalOpen(false)}
        onOpenRecharge={() => setRechargeModalOpen(true)}
        onOpenWithdraw={() => setWithdrawModalOpen(true)}
        onOpenTeam={() => { if (currentUser) setTeamModalOpen(true); else handleOpenLogin(); }}
      />

      {/* 6. Team & Invitation Rewards Modal */}
      <TeamModal
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
      />

      {/* 7. Master Admin Console Modal */}
      <AdminDashboardModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />

      {/* 8. About Us Modal */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        onJoinTeam={handleOpenRegister}
        onExplorePlans={() => {
          setAboutModalOpen(false);
          const el = document.getElementById('plans');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 9. FAQ Modal */}
      <FaqModal
        isOpen={faqModalOpen}
        onClose={() => setFaqModalOpen(false)}
      />

      {/* 10. Mineral Detail Modal */}
      <MineralDetailModal
        mineral={selectedMineral}
        isOpen={mineralModalOpen}
        onClose={() => setMineralModalOpen(false)}
        onViewPlans={() => {
          const el = document.getElementById('plans');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <MiningProvider>
      <MiningAppContent />
    </MiningProvider>
  );
}
