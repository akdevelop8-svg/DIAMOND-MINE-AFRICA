import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Building,
  CheckCircle2,
  Clock,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { useMining } from '../context/MiningContext';
import { api } from '../lib/api';
import { PLATFORM_CONFIG } from '../data/miningData';
import cbeLogo from '../assets/images/cbe.png';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  isOpen,
  onClose,
  defaultAmount = 300,
}) => {
  const { submitRecharge, theme, showToast } = useMining();
  const [step, setStep] = useState<'AMOUNT' | 'DETAILS' | 'PROOF'>('AMOUNT');
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [transactionCode, setTransactionCode] = useState('');
  const [proofMessage, setProofMessage] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [paymentAccount, setPaymentAccount] = useState<{bankName:string;accountNumber:string;accountName:string;branch:string} | null>(null);
  const [paymentConfigLoading, setPaymentConfigLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setPaymentConfigLoading(true);
    api<{paymentAccount:{bankName:string;accountNumber:string;accountName:string;branch:string}}>('/payment-config')
      .then((data) => { if (active) setPaymentAccount(data.paymentAccount); })
      .catch(() => { if (active) showToast('Payment account details are temporarily unavailable. Please try again.'); })
      .finally(() => { if (active) setPaymentConfigLoading(false); });
    return () => { active = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const quickAmounts = [300, 500, 1000, 3000, 7000, 15000, 30000, 60000, 120000, 200000];

  const handleCopyAccount = () => {
    if (!paymentAccount?.accountNumber) return;
    navigator.clipboard.writeText(paymentAccount.accountNumber);
    setCopied(true);
    showToast('CBE Account Number copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, or screenshot).');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      showToast('Receipt image is too large. Please choose an image under 12 MB.');
      return;
    }

    try {
      const source = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Could not read receipt image.'));
        reader.readAsDataURL(file);
      });

      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Could not decode receipt image.'));
        img.src = source;
      });

      const maxSide = 1400;
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is unavailable.');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      let quality = 0.82;
      let result = canvas.toDataURL('image/jpeg', quality);
      while (result.length > 1_900_000 && quality > 0.5) {
        quality -= 0.08;
        result = canvas.toDataURL('image/jpeg', quality);
      }
      if (result.length > 2_100_000) {
        showToast('Receipt image is still too large after compression. Please use a clearer smaller screenshot.');
        return;
      }
      setReceiptImage(result);
      showToast('Receipt screenshot compressed and attached successfully.');
    } catch {
      showToast('Could not process the receipt image. Please try another image.');
    } finally {
      e.target.value = '';
    }
  };

  const handleProceedToDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < PLATFORM_CONFIG.minInvestment || amount > PLATFORM_CONFIG.maxInvestment) {
      showToast(`Amount must be between ${PLATFORM_CONFIG.minInvestment.toLocaleString()} ETB and ${PLATFORM_CONFIG.maxInvestment.toLocaleString()} ETB`);
      return;
    }
    if (!paymentAccount?.accountNumber || !paymentAccount.accountName) {
      showToast('Payment account details are not available yet. Please try again shortly.');
      return;
    }
    setStep('DETAILS');
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionCode.trim()) {
      showToast('Please enter your CBE transaction reference short code.');
      return;
    }

    if (!receiptImage) {
      showToast('Please attach your deposit receipt image / screenshot.');
      return;
    }

    setIsSubmitting(true);
    const res = await submitRecharge({ amount, transactionCode: transactionCode.trim(), proofMessage: proofMessage.trim(), receiptImageUrl: receiptImage });
    setIsSubmitting(false);
    if (res.success) {
      setIsDone(true);
      window.setTimeout(() => {
        setIsDone(false);
        setStep('AMOUNT');
        setTransactionCode('');
        setProofMessage('');
        setReceiptImage(null);
        onClose();
      }, 2200);
    } else if (res.message) {
      showToast(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className={`relative w-full max-w-lg my-auto rounded-3xl border-2 p-6 sm:p-8 shadow-2xl transition-all ${
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

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-[#E5B869] shadow-[0_0_15px_rgba(229,184,105,0.4)]">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#E5B869] uppercase block">
              OFFICIAL DEPOSIT GATEWAY
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              RECHARGE WALLET
            </h2>
          </div>
        </div>

        {/* Success State */}
        {isDone ? (
          <div className="py-8 text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-cyan-950 border-2 border-cyan-400 mx-auto flex items-center justify-center text-cyan-300 shadow-[0_0_30px_rgba(56,189,248,0.6)] animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#E5B869] tracking-widest uppercase">
                ORDER SUBMITTED
              </span>
              <h3 className="text-xl font-black text-cyan-300 uppercase">
                Your Order Is Under Verification
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                Your deposit of <strong className="text-white">{amount.toLocaleString()} ETB</strong> with CBE code <span className="font-mono text-cyan-200">{transactionCode}</span> and uploaded receipt is being verified by admin.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Funds will credit to your wallet upon admin acceptance</span>
            </div>
          </div>
        ) : step === 'AMOUNT' ? (
          /* ================= STEP 1: SELECT AMOUNT ================= */
          <form onSubmit={handleProceedToDetails} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Enter Recharge Amount (ETB)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={PLATFORM_CONFIG.minInvestment}
                  max={PLATFORM_CONFIG.maxInvestment}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="e.g. 300"
                  required
                  className="w-full pl-4 pr-16 py-3 rounded-2xl bg-[#0a1835] border border-blue-900/70 text-white font-mono text-xl font-black focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-cyan-400 font-mono">
                  ETB
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                <span>Min: {PLATFORM_CONFIG.minInvestment.toLocaleString()} ETB</span>
                <span>Max: {PLATFORM_CONFIG.maxInvestment.toLocaleString()} ETB</span>
              </div>
            </div>

            {/* Quick Amount Selectors */}
            <div>
              <span className="block text-xs font-bold text-slate-400 mb-2 uppercase">
                Quick Select Tier Amount:
              </span>
              <div className="grid grid-cols-5 gap-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition-all ${
                      amount === q
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md scale-105'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    {q >= 1000 ? `${q / 1000}k` : q}
                  </button>
                ))}
              </div>
            </div>

            {/* Bank Card with Official CBE Logo */}
            <div className="p-3.5 rounded-2xl bg-[#091b3b] border border-cyan-500/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white p-1 border border-amber-400/60 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                  <img src={cbeLogo} alt="Commercial Bank of Ethiopia" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-xs font-black text-white block">
                    {paymentAccount?.bankName || 'Commercial Bank of Ethiopia (CBE)'}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    Direct mobile & branch deposit
                  </span>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>

            {/* Next Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-[#E5B869] text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>PROCEED TO TRANSFER DETAILS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : step === 'DETAILS' ? (
          /* ================= STEP 2: BANK DETAILS ================= */
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-[#081b3d] border border-cyan-400/50 space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-blue-900/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white p-0.5 border border-amber-400/50 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={cbeLogo} alt="CBE" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase">Selected Bank</span>
                </div>
                <span className="text-xs font-black text-[#E5B869] uppercase">
                  {paymentAccount?.bankName || 'Commercial Bank of Ethiopia (CBE)'}
                </span>
              </div>

              {/* Account Number with Copy */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase mb-1">
                  CBE Account Number (Touch to Copy)
                </span>
                <div
                  onClick={paymentAccount?.accountNumber ? handleCopyAccount : undefined}
                  aria-disabled={!paymentAccount?.accountNumber}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#061226] border border-cyan-500/40 cursor-pointer hover:border-cyan-300 transition-colors group"
                >
                  <span className="text-lg font-mono font-black text-cyan-300 tracking-wider">
                    {paymentAccount?.accountNumber || (paymentConfigLoading ? 'Loading secure payment account…' : 'Payment account unavailable')}
                  </span>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg bg-cyan-950 text-cyan-300 group-hover:bg-cyan-900 transition-colors flex items-center gap-1 text-xs font-bold"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
              </div>

              {/* Account Name */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Account Name</span>
                <span className="text-xs font-black text-white font-mono">
                  {paymentAccount?.accountName || 'Payment account unavailable'}
                </span>
              </div>

              {/* Exact Amount */}
              <div className="flex items-center justify-between pt-2 border-t border-blue-900/80">
                <span className="text-xs font-bold text-slate-400 uppercase">Exact Transfer Amount</span>
                <span className="text-base font-black text-cyan-300 font-mono">
                  {amount.toLocaleString()} ETB
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
              Transfer exactly <strong className="text-white">{amount.toLocaleString()} ETB</strong> to the CBE account above. Then click below to upload your transaction receipt and enter the short code.
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('AMOUNT')}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                BACK
              </button>
              <button
                type="button"
                onClick={() => setStep('PROOF')}
                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-[#E5B869] text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>I HAVE SEEN ALL & TRANSFERRED</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ================= STEP 3: TRANSACTION PROOF & RECEIPT UPLOAD ================= */
          <form onSubmit={handleSubmitProof} className="space-y-4">
            {/* 1. Transaction Code */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                1. CBE Transaction Reference / Short Code <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={transactionCode}
                onChange={(e) => setTransactionCode(e.target.value)}
                placeholder="e.g. FT262791892842 or CBE SMS Code"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0a1835] border border-blue-900/70 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all uppercase"
              />
            </div>

            {/* 2. REAL RECEIPT IMAGE UPLOAD */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                2. Deposit Receipt Screenshot / Photo <span className="text-cyan-400">*</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {receiptImage ? (
                <div className="relative p-2 rounded-2xl bg-[#061226] border-2 border-cyan-400/60 overflow-hidden group">
                  <img
                    src={receiptImage}
                    alt="Uploaded Deposit Receipt Preview"
                    className="w-full h-36 object-contain rounded-xl bg-black/40"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setReceiptImage(null)}
                      className="p-1.5 rounded-lg bg-red-950/90 text-red-300 hover:text-white border border-red-500 transition-colors shadow-md"
                      title="Remove Receipt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-1.5 text-center text-[10px] text-emerald-400 font-bold uppercase flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Receipt image attached and ready to send to admin</span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl bg-[#061226] border-2 border-dashed border-cyan-500/50 hover:border-cyan-300 transition-colors cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white block uppercase mb-0.5">
                    Click to Upload Deposit Receipt
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Upload CBE Mobile Banking Screenshot or Bank Paper Receipt
                  </span>
                </div>
              )}
            </div>

            {/* 3. Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">
                3. Note / Remarks or Sender Name (Optional)
              </label>
              <textarea
                rows={2}
                value={proofMessage}
                onChange={(e) => setProofMessage(e.target.value)}
                placeholder="Enter sender account name or remarks for admin..."
                className="w-full px-4 py-2 rounded-xl bg-[#0a1835] border border-blue-900/70 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                BACK
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>DONE ✅ SUBMIT PROOF</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
