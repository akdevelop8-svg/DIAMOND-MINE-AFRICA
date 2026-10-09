import React, { useState } from 'react';
import { api } from '../lib/api';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Database,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { useMining } from '../context/MiningContext';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const {
    isAdmin,
    users,
    transactions,
    adminStats,
    adminApproveRecharge,
    adminRejectRecharge,
    adminApproveWithdrawal,
    adminRejectWithdrawal,
    adminAdjustBalance,
    logout,
    theme,
  } = useMining();

  const [activeTab, setActiveTab] = useState<'RECHARGES' | 'WITHDRAWALS' | 'USERS' | 'LOGS'>('RECHARGES');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectReason, setRejectReason] = useState<{ [txId: string]: string }>({});
  const [receiptByTx, setReceiptByTx] = useState<Record<string, string>>({});
  const [receiptLoading, setReceiptLoading] = useState<Record<string, boolean>>({});

  if (!isOpen || !isAdmin) return null;

  const isDark = theme === 'dark';

  const pendingRecharges = transactions.filter((t) => t.type === 'RECHARGE' && t.status === 'PENDING');
  const pendingWithdrawals = transactions.filter((t) => t.type === 'WITHDRAW' && t.status === 'PENDING');

  const totalDeposited = adminStats?.totalRecharged ?? transactions.filter((t) => t.type === 'RECHARGE' && t.status === 'APPROVED').reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawn = adminStats?.totalWithdrawn ?? transactions.filter((t) => t.type === 'WITHDRAW' && t.status === 'APPROVED').reduce((sum, t) => sum + t.amount, 0);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.numericId.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className={`relative w-full max-w-5xl my-auto rounded-3xl border-2 p-5 sm:p-8 shadow-2xl transition-all max-h-[92vh] overflow-y-auto ${
          isDark
            ? 'bg-[#050c1e]/98 border-red-500/50 shadow-[0_0_60px_rgba(239,68,68,0.3)] text-slate-100'
            : 'bg-white border-red-300 shadow-[0_0_50px_rgba(239,68,68,0.2)] text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-red-500/30 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-500/60 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase bg-red-950/80 px-2 py-0.5 rounded-md border border-red-500/40">
                  MASTER CONTROLLER
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                DIAMONDMINE AFRICA ADMIN CONSOLE
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>EXIT ADMIN</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-[#081733] border border-blue-900/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Users</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{(adminStats?.totalUsers ?? users.length).toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#081733] border border-blue-900/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Approved Deposits</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {totalDeposited.toLocaleString()} ETB
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#081733] border border-blue-900/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Approved Payouts</span>
            <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
              {totalWithdrawn.toLocaleString()} ETB
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#081733] border border-blue-900/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pending Orders</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {(adminStats?.pendingRecharges ?? pendingRecharges.length) + (adminStats?.pendingWithdrawals ?? pendingWithdrawals.length)}
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('RECHARGES')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
              activeTab === 'RECHARGES'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] font-black'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>PENDING RECHARGES ({pendingRecharges.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WITHDRAWALS')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
              activeTab === 'WITHDRAWALS'
                ? 'bg-rose-500 text-slate-950 shadow-[0_0_20px_rgba(244,63,94,0.4)] font-black'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>PENDING WITHDRAWALS ({pendingWithdrawals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('USERS')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
              activeTab === 'USERS'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] font-black'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>MINER ACCOUNTS ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LOGS')}
            className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
              activeTab === 'LOGS'
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] font-black'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>FULL LEDGER AUDIT</span>
          </button>
        </div>

        {/* Tab 1: Pending Recharges */}
        {activeTab === 'RECHARGES' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4" />
              <span>Pending CBE Deposit Approvals</span>
            </h3>

            {pendingRecharges.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs rounded-2xl bg-[#061226] border border-blue-900/60">
                ✅ No pending deposit orders. All recharges are verified!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRecharges.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-[#081b3d] border-2 border-emerald-500/50 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white">{tx.userName}</span>
                        <span className="text-xs font-mono text-cyan-300">({tx.userPhone})</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                          {tx.date} {tx.time}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 font-mono">
                        CBE Reference Code: <strong className="text-[#E5B869] text-sm">{tx.transactionCode || 'N/A'}</strong>
                      </div>

                      <div className="pt-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                          Attached Bank Receipt Proof:
                        </span>
                        {receiptByTx[tx.id] ? (
                          <a
                            href={receiptByTx[tx.id]}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block relative rounded-xl overflow-hidden border-2 border-cyan-400 max-w-xs group shadow-md"
                          >
                            <img
                              src={receiptByTx[tx.id]}
                              alt="Customer Deposit Receipt"
                              className="max-h-36 object-contain rounded-lg bg-black/60 group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-opacity">
                              Click to View Full Receipt
                            </div>
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled={Boolean(receiptLoading[tx.id])}
                            onClick={async () => {
                              setReceiptLoading((prev) => ({...prev, [tx.id]: true}));
                              try {
                                const data = await api<{receiptImageUrl:string}>(`/admin/recharge/${encodeURIComponent(tx.id)}/receipt`);
                                setReceiptByTx((prev) => ({...prev, [tx.id]: data.receiptImageUrl}));
                              } catch (error) {
                                setReceiptByTx((prev) => ({...prev, [tx.id]: ''}));
                              } finally {
                                setReceiptLoading((prev) => ({...prev, [tx.id]: false}));
                              }
                            }}
                            className="px-3 py-2 rounded-lg bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold uppercase hover:bg-cyan-900 disabled:opacity-50"
                          >
                            {receiptLoading[tx.id] ? 'LOADING PROOF…' : 'LOAD RECEIPT PROOF'}
                          </button>
                        )}
                      </div>

                      {tx.proofMessage && (
                        <div className="text-xs text-slate-400 italic">
                          Remarks: "{tx.proofMessage}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="text-right mr-2">
                        <span className="text-[10px] text-slate-400 block uppercase">Deposit Amount</span>
                        <span className="text-xl font-black text-emerald-400 font-mono">
                          +{tx.amount.toLocaleString()} ETB
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => { void adminApproveRecharge(tx.id); }}
                        className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ACCEPT & CREDIT</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { void adminRejectRecharge(tx.id, rejectReason[tx.id]); }}
                        className="py-2.5 px-3 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/60 text-rose-300 font-bold text-xs uppercase transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>REJECT</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pending Withdrawals */}
        {activeTab === 'WITHDRAWALS' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              <span>Pending Payout Requests</span>
            </h3>

            {pendingWithdrawals.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs rounded-2xl bg-[#061226] border border-blue-900/60">
                ✅ No pending withdrawal requests. All payouts are cleared!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingWithdrawals.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-[#1a0c24] border-2 border-rose-500/50 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white">{tx.userName}</span>
                        <span className="text-xs font-mono text-cyan-300">({tx.userPhone})</span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 text-[10px] font-bold border border-rose-500/40">
                          {tx.date} {tx.time}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 font-mono">
                        Channel: <strong className="text-white">{tx.paymentMethod}</strong> • Account: <strong className="text-cyan-300">{tx.accountNumber}</strong>
                      </div>

                      <div className="text-xs text-slate-400 font-mono">
                        Account Holder: <strong className="text-slate-200">{tx.accountName}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="text-right mr-2">
                        <span className="text-[10px] text-slate-400 block uppercase">Net Payout to Send</span>
                        <span className="text-xl font-black text-amber-400 font-mono">
                          {tx.netAmount?.toLocaleString() || tx.amount.toLocaleString()} ETB
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          (Gross: {tx.amount.toLocaleString()} ETB - 8% fee)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => { void adminApproveWithdrawal(tx.id); }}
                        className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>MARK PAID</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { void adminRejectWithdrawal(tx.id, rejectReason[tx.id]); }}
                        className="py-2.5 px-3 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/60 text-rose-300 font-bold text-xs uppercase transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>REJECT & REFUND</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Miner Accounts Management */}
        {activeTab === 'USERS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search miner by name, phone, or ID..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0a1835] border border-blue-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <span className="text-xs font-mono text-slate-400">
                Showing {filteredUsers.length} of {users.length} miners
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-3.5 rounded-2xl bg-[#061226] border border-blue-900/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{user.name}</span>
                      <span className="text-xs font-mono text-cyan-300">ID: DMA-{user.numericId}</span>
                      <span className="text-xs text-slate-400">{user.phone}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Joined: {user.registeredAt} • VIP Investments: {user.activeInvestments.length}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-400 block uppercase">Wallet Balance</span>
                      <span className="text-base font-black text-[#E5B869]">
                        {user.balance.toLocaleString()} ETB
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => { void adminAdjustBalance(user.id, 500); }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900 text-xs font-bold font-mono"
                        title="Grant +500 ETB bonus"
                      >
                        +500 ETB
                      </button>
                      <button
                        type="button"
                        onClick={() => { void adminAdjustBalance(user.id, -500); }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-950 border border-rose-500/50 text-rose-300 hover:bg-rose-900 text-xs font-bold font-mono"
                        title="Deduct 500 ETB"
                      >
                        -500 ETB
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Logs Audit */}
        {activeTab === 'LOGS' && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>Full System Activity Log ({(adminStats?.totalTransactions ?? transactions.length).toLocaleString()} Total Events)</span>
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 font-mono text-xs">
              {transactions.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-[#061226] border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">{t.date} {t.time}</span> • <strong className="text-white">{t.userName}</strong> ({t.type})
                    {t.transactionCode && <span className="text-cyan-300 ml-2">[{t.transactionCode}]</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#E5B869]">{t.amount.toLocaleString()} ETB</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300' : t.status === 'PENDING' ? 'bg-amber-950 text-amber-300' : 'bg-rose-950 text-rose-300'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
