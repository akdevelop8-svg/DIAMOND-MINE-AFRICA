import React from 'react';
import { X, HelpCircle, ChevronDown } from 'lucide-react';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const faqs = [
    {
      q: 'What is Diamondmine Africa?',
      a: 'Diamondmine Africa is a digital mining platform that enables members to participate in tokenized yields from African strategic mineral extractions including diamonds, gold, lithium, emeralds, and copper.',
    },
    {
      q: 'What currency is used for investments and payouts?',
      a: 'All plans, daily yields, and withdrawals are calculated and settled in Ethiopian Birr (ETB). Payment channels include Telebirr, CBE Birr, and USDT (TRC20).',
    },
    {
      q: 'How are daily mining profits distributed?',
      a: 'Once a VIP mineral plan is activated, automated daily mining yields are credited directly to your connected wallet balance every 24 hours without manual hardware maintenance.',
    },
    {
      q: 'What is the minimum withdrawal amount?',
      a: 'The minimum withdrawal threshold is ETB 150.00. Withdrawal requests are queued for admin verification and payout during normal processing hours.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#081329] border border-blue-800/60 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-left max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-400">Everything you need to know about Diamondmine Africa</p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="p-4 rounded-xl bg-[#0b1733] border border-blue-900/60">
              <h4 className="text-sm font-bold text-white mb-1.5 flex items-center justify-between">
                <span>{faq.q}</span>
                <ChevronDown className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            type="button"
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
