import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PLATFORM_CONFIG, VipPlan, VIP_PLANS } from '../data/miningData';
import { api, ApiError } from '../lib/api';

export interface UserInvestment {
  id: string; planId: string; vipTier: number; mineralName: string;
  investAmount: number; dailyMiningAmount: number; startedAt: number;
  lastClaimedAt: number | null; daysClaimed: number; totalPeriodDays: number;
}
export interface Transaction {
  id: string; userId: string; userName: string; userPhone: string;
  type: 'RECHARGE' | 'INVESTMENT' | 'WITHDRAW' | 'MINING_CLAIM' | 'CHECK_IN' | 'REGISTRATION_BONUS' | 'TEAM_BONUS' | 'ADMIN_ADJUSTMENT';
  amount: number; fee?: number; netAmount?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string; time: string; timestamp: number;
  paymentMethod?: string; accountNumber?: string; accountName?: string;
  transactionCode?: string; proofMessage?: string; receiptImageUrl?: string; adminNote?: string;
}
export interface AppUser {
  id: string; numericId: string; name: string; phone: string;
  password?: string; balance: number; totalEarned: number; totalRecharged: number;
  totalWithdrawn: number; referralCode: string; referredBy?: string;
  registeredAt: string; lastCheckInTimestamp?: number | null; activeInvestments: UserInvestment[];
}
interface Result { success: boolean; message?: string; amount?: number; reason?: 'INSUFFICIENT_BALANCE'|'ALREADY_ACTIVE'|'ERROR'; }
interface AdminStats { totalUsers:number; totalRecharged:number; totalWithdrawn:number; pendingRecharges:number; pendingWithdrawals:number; totalTransactions:number; }
interface MiningContextType {
  currentUser: AppUser | null; isAdmin: boolean; sessionReady: boolean; users: AppUser[]; transactions: Transaction[]; adminStats: AdminStats | null;
  theme: 'dark'|'light'; setTheme:(theme:'dark'|'light')=>void; toggleTheme:()=>void; vipPlans:VipPlan[];
  register:(data:{name:string;phone:string;password:string;refBy?:string})=>Promise<Result>;
  login:(data:{nameOrPhone:string;password:string})=>Promise<Result & {isAdmin?:boolean}>;
  logout:()=>Promise<void>;
  investInPlan:(plan:VipPlan)=>Promise<Result>;
  claimDailyMining:(investmentId:string)=>Promise<Result>;
  getClaimCountdown:(investment:UserInvestment)=>{canClaim:boolean;remainingSeconds:number;formattedTime:string};
  claimCheckIn:()=>Promise<Result>; canCheckIn:boolean; checkInCountdown:string;
  submitRecharge:(data:{amount:number;transactionCode:string;proofMessage?:string;receiptImageUrl?:string})=>Promise<Result>;
  submitWithdrawal:(data:{amount:number;paymentMethod:string;accountNumber:string;accountName:string})=>Promise<Result>;
  adminApproveRecharge:(txId:string)=>Promise<void>; adminRejectRecharge:(txId:string,note?:string)=>Promise<void>;
  adminApproveWithdrawal:(txId:string)=>Promise<void>; adminRejectWithdrawal:(txId:string,note?:string)=>Promise<void>;
  adminAdjustBalance:(userId:string,deltaAmount:number)=>Promise<void>;
  getUserTransactions:()=>Transaction[];
  toastMessage:string|null; showToast:(msg:string)=>void;
}
const MiningContext=createContext<MiningContextType|undefined>(undefined);
const THEME_KEY='dma_theme_v3';

export const MiningProvider:React.FC<{children:ReactNode}>=({children})=>{
  const [theme,setThemeState]=useState<'dark'|'light'>(()=>(localStorage.getItem(THEME_KEY) as any)||'dark');
  const [currentUser,setCurrentUser]=useState<AppUser|null>(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [sessionReady,setSessionReady]=useState(false);
  const [users,setUsers]=useState<AppUser[]>([]);
  const [transactions,setTransactions]=useState<Transaction[]>([]);
  const [adminStats,setAdminStats]=useState<AdminStats|null>(null);
  const [vipPlans,setVipPlans]=useState<VipPlan[]>(VIP_PLANS);
  const [toastMessage,setToastMessage]=useState<string|null>(null);

  const [, setClockTick] = useState(0);
  useEffect(() => { const t = window.setInterval(() => setClockTick(v => v + 1), 1000); return () => window.clearInterval(t); }, []);
  const showToast=(msg:string)=>{setToastMessage(msg); window.setTimeout(()=>setToastMessage(p=>p===msg?null:p),4000);};
  const setTheme=(v:'dark'|'light')=>{setThemeState(v);localStorage.setItem(THEME_KEY,v);};
  const toggleTheme=()=>setTheme(theme==='dark'?'light':'dark');

  const applyUserPayload=(data:any)=>{
    if (data?.user) setCurrentUser(data.user);
    if (Array.isArray(data?.transactions)) setTransactions(data.transactions);
  };
  const refreshAdmin=async()=>{
    const data=await api<{users:AppUser[];transactions:Transaction[];stats:AdminStats}>('/admin/state');
    setUsers(data.users); setTransactions(data.transactions); setAdminStats(data.stats);
  };

  useEffect(() => {
    let active = true;

    // Load the optional plan catalog independently so a slow plans endpoint never
    // prevents the login screen from appearing after the session check.
    void (async () => {
      try {
        const remote = await api<{plans:Array<{id:string;vipTier:number;mineralName:string;investAmount:number;dailyMiningAmount:number;totalPeriodDays:number}>}>('/plans');
        if (!active || !Array.isArray(remote.plans)) return;
        setVipPlans(VIP_PLANS.map(base => {
          const live = remote.plans.find(item => item.id === base.id);
          if (!live) return base;
          const totalProfit = live.dailyMiningAmount * live.totalPeriodDays;
          return {
            ...base,
            mineralName: live.mineralName,
            investAmountNum: live.investAmount,
            dailyMiningNum: live.dailyMiningAmount,
            totalProfitNum: totalProfit,
            investAmount: `${live.investAmount.toLocaleString()} ETB`,
            dailyMining: `${live.dailyMiningAmount.toLocaleString()} ETB`,
            totalProfit: `${totalProfit.toLocaleString()} ETB`,
            periodDays: live.totalPeriodDays,
          };
        }));
      } catch {
        // Keep the bundled catalog if the database/API is not ready.
      }
    })();

    void (async () => {
      try {
        const data = await api<{isAdmin:boolean;user:AppUser|null;transactions:Transaction[]}>('/me');
        if (!active) return;
        setIsAdmin(Boolean(data.isAdmin));
        applyUserPayload(data);
        if (data.isAdmin) {
          try { await refreshAdmin(); }
          catch { showToast('Admin session is active, but dashboard data could not be loaded.'); }
        }
      } catch {
        if (active) {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (active) setSessionReady(true);
      }
    })();

    return () => { active = false; };
  }, []);

  const register=async(data:{name:string;phone:string;password:string;refBy?:string}):Promise<Result>=>{
    try{
      const res=await api<any>('/auth/register',{method:'POST',body:JSON.stringify(data)});
      setIsAdmin(false); applyUserPayload(res); setSessionReady(true);
      showToast(`🎉 Registration Successful! +${PLATFORM_CONFIG.registrationBonus} ETB Bonus Credited.`);
      return {success:true};
    }catch(e){
      return {success:false,message:e instanceof ApiError?e.message:'Registration failed.'};
    }
  };
  const login=async(data:{nameOrPhone:string;password:string})=>{
    try{
      const res=await api<any>('/auth/login',{method:'POST',body:JSON.stringify(data)});
      setIsAdmin(Boolean(res.isAdmin)); applyUserPayload(res); setSessionReady(true);
      if(res.isAdmin){
        try {
          await refreshAdmin();
          showToast('🛡️ Welcome Administrator! Master Admin Console Access Granted.');
        } catch {
          // Authentication already succeeded; an admin dashboard refresh failure must not
          // incorrectly turn a valid login into a credentials error.
          showToast('Administrator signed in, but dashboard data could not be loaded.');
        }
      } else {
        showToast(`✨ Welcome back, ${res.user?.name || 'back'}!`);
      }
      return {success:true,isAdmin:Boolean(res.isAdmin)};
    }catch(e){return {success:false,message:e instanceof ApiError?e.message:'Login request failed. Check your connection and try again.'};}
  };
  const logout=async()=>{
    try{await api('/auth/logout',{method:'POST'});}catch{}
    setCurrentUser(null);setIsAdmin(false);setUsers([]);setTransactions([]);setAdminStats(null);
    showToast('Logged out successfully.');
  };

  const investInPlan=async(plan:VipPlan):Promise<Result>=>{
    if(!currentUser)return {success:false,reason:'ERROR',message:'Please sign in or register to invest.'};
    try{const res=await api<any>('/investments',{method:'POST',body:JSON.stringify({planId:plan.id})});applyUserPayload(res);showToast(`💎 VIP ${plan.vipTier} (${plan.mineralName}) activated! Daily mining of ${plan.dailyMiningNum} ETB is now running.`);return {success:true};}
    catch(e){const x=e instanceof ApiError?e:new Error('Investment failed.');return {success:false,reason:(x instanceof ApiError?x.reason:undefined) as any,message:x.message};}
  };
  const getClaimCountdown=(inv:UserInvestment)=>{
    if(inv.daysClaimed>=inv.totalPeriodDays)return {canClaim:false,remainingSeconds:0,formattedTime:'COMPLETED'};
    const remaining=Math.max(0,24*60*60*1000-(Date.now()-Number(inv.lastClaimedAt||inv.startedAt)));
    const s=Math.floor(remaining/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;
    const pad=(n:number)=>String(n).padStart(2,'0');
    return remaining===0?{canClaim:true,remainingSeconds:0,formattedTime:'READY TO CLAIM'}:{canClaim:false,remainingSeconds:s,formattedTime:`${pad(h)}:${pad(m)}:${pad(sec)}`};
  };
  const claimDailyMining=async(investmentId:string):Promise<Result>=>{
    try{const res=await api<any>(`/investments/${encodeURIComponent(investmentId)}/claim`,{method:'POST'});applyUserPayload(res);showToast(`⚡ +${res.amount} ETB daily mining reward claimed to your wallet!`);return {success:true,amount:res.amount};}
    catch(e){return {success:false,message:e instanceof ApiError?e.message:'Claim failed.'};}
  };

  const checkInRemaining=Math.max(0,24*60*60*1000-(Date.now()-Number(currentUser?.lastCheckInTimestamp||0)));
  const checkInSeconds=Math.floor(checkInRemaining/1000);
  const pad=(n:number)=>String(n).padStart(2,'0');
  const checkInCountdown=checkInRemaining===0?'READY':`${pad(Math.floor(checkInSeconds/3600))}:${pad(Math.floor((checkInSeconds%3600)/60))}:${pad(checkInSeconds%60)}`;
  const canCheckIn=Boolean(currentUser)&&checkInRemaining===0;
  const claimCheckIn=async():Promise<Result>=>{
    try{const res=await api<any>('/check-in',{method:'POST'});applyUserPayload(res);showToast(`🎁 +${res.amount} ETB Daily Check-in Bonus claimed!`);return {success:true,amount:res.amount};}
    catch(e){return {success:false,message:e instanceof ApiError?e.message:'Check-in failed.'};}
  };

  const submitRecharge=async(data:{amount:number;transactionCode:string;proofMessage?:string;receiptImageUrl?:string}):Promise<Result>=>{
    try{const res=await api<any>('/recharge',{method:'POST',body:JSON.stringify(data)});applyUserPayload(res);showToast('✅ Your deposit order is under verification! Admin will review your receipt shortly.');return {success:true};}
    catch(e){return {success:false,message:e instanceof ApiError?e.message:'Recharge submission failed.'};}
  };
  const submitWithdrawal=async(data:{amount:number;paymentMethod:string;accountNumber:string;accountName:string}):Promise<Result>=>{
    try{const res=await api<any>('/withdraw',{method:'POST',body:JSON.stringify(data)});applyUserPayload(res);showToast('🚀 Withdrawal request submitted! Processing will complete within banking hours.');return {success:true};}
    catch(e){return {success:false,message:e instanceof ApiError?e.message:'Withdrawal submission failed.'};}
  };

  const adminApproveRecharge=async(txId:string)=>{try{await api(`/admin/recharge/${encodeURIComponent(txId)}/approve`,{method:'POST'});await refreshAdmin();}catch(e){showToast(e instanceof ApiError?e.message:'Could not approve recharge.');}};
  const adminRejectRecharge=async(txId:string,note?:string)=>{try{await api(`/admin/recharge/${encodeURIComponent(txId)}/reject`,{method:'POST',body:JSON.stringify({note})});await refreshAdmin();}catch(e){showToast(e instanceof ApiError?e.message:'Could not reject recharge.');}};
  const adminApproveWithdrawal=async(txId:string)=>{try{await api(`/admin/withdraw/${encodeURIComponent(txId)}/approve`,{method:'POST'});await refreshAdmin();}catch(e){showToast(e instanceof ApiError?e.message:'Could not approve withdrawal.');}};
  const adminRejectWithdrawal=async(txId:string,note?:string)=>{try{await api(`/admin/withdraw/${encodeURIComponent(txId)}/reject`,{method:'POST',body:JSON.stringify({note})});await refreshAdmin();}catch(e){showToast(e instanceof ApiError?e.message:'Could not reject withdrawal.');}};
  const adminAdjustBalance=async(userId:string,deltaAmount:number)=>{try{await api(`/admin/users/${encodeURIComponent(userId)}/balance`,{method:'POST',body:JSON.stringify({deltaAmount})});await refreshAdmin();}catch(e){showToast(e instanceof ApiError?e.message:'Could not adjust balance.');}};

  const getUserTransactions=()=>currentUser?transactions.filter(t=>t.userId===currentUser.id):[];

  return <MiningContext.Provider value={{currentUser,isAdmin,sessionReady,users,transactions,adminStats,theme,setTheme,toggleTheme,vipPlans,register,login,logout,investInPlan,claimDailyMining,getClaimCountdown,claimCheckIn,canCheckIn,checkInCountdown,submitRecharge,submitWithdrawal,adminApproveRecharge,adminRejectRecharge,adminApproveWithdrawal,adminRejectWithdrawal,adminAdjustBalance,getUserTransactions,toastMessage,showToast}}>
    {children}
  </MiningContext.Provider>;
};
export const useMining=()=>{const context=useContext(MiningContext);if(!context)throw new Error('useMining must be used within a MiningProvider');return context;};
