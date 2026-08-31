import React, { useState } from 'react';
import { X, Heart, Copy, Check, QrCode, ShieldCheck, Sparkles, Building, HandHeart } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [selectedFund, setSelectedFund] = useState<'mass' | 'restoration' | 'caritas' | 'tithes'>('mass');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const funds = [
    {
      id: 'mass' as const,
      name: 'Mass Intentions Stipend',
      description: 'Offerings for Thanksgiving, Holy Souls, Healing, or Special Petitions',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'restoration' as const,
      name: 'Cathedral Heritage & Restoration',
      description: 'Stained glass restoration, pipe organ care, and structural maintenance',
      icon: <Building className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 'caritas' as const,
      name: 'Caritas Cubao Relief & Feeding',
      description: 'Food packs, medical assistance, and calamity disaster relief funds',
      icon: <HandHeart className="w-4 h-4 text-rose-500" />,
    },
    {
      id: 'tithes' as const,
      name: 'Parish Tithes & Stewardship',
      description: 'Sunday collections supporting parish operations, pastoral ministries and staff',
      icon: <Heart className="w-4 h-4 text-emerald-500" />,
    },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 relative">
          <button
            id="close-donation-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Heart className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="font-cathedral text-xl font-bold text-amber-200">
                Parish Stewardship & Offerings
              </h2>
              <p className="text-xs text-slate-300">
                Immaculate Conception Cathedral of Cubao
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Parish Offering Purpose:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {funds.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFund(f.id)}
                  className={`p-3 rounded-xl text-left border transition-all text-xs flex items-start gap-2.5 ${
                    selectedFund === f.id
                      ? 'border-blue-900 bg-blue-50/60 ring-2 ring-blue-900/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                  }`}
                >
                  <span className="mt-0.5">{f.icon}</span>
                  <div>
                    <span className="font-semibold text-slate-900 block">{f.name}</span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">{f.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bank / E-Wallet Channels */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
              <span>Official Cathedral Accounts</span>
              <span className="text-[11px] text-emerald-700 font-normal flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Parish Account
              </span>
            </div>

            {/* BDO Bank */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-blue-950">BDO Unibank (Current Account)</div>
                <div className="text-[11px] text-slate-500">Account Name: Immaculate Conception Cathedral Parish</div>
                <div className="font-mono text-xs font-semibold text-slate-800 mt-0.5">0012-3456-7890</div>
              </div>
              <button
                onClick={() => handleCopy('001234567890', 'bdo')}
                className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
              >
                {copiedKey === 'bdo' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'bdo' ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* BPI Bank */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-red-950">BPI (Bank of the Philippine Islands)</div>
                <div className="text-[11px] text-slate-500">Account Name: Roman Catholic Bishop of Cubao (Cathedral)</div>
                <div className="font-mono text-xs font-semibold text-slate-800 mt-0.5">3281-0987-65</div>
              </div>
              <button
                onClick={() => handleCopy('3281098765', 'bpi')}
                className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
              >
                {copiedKey === 'bpi' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'bpi' ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* GCash / Maya */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-sky-950">GCash / Maya (QR Ph Standard)</div>
                <div className="text-[11px] text-slate-500">Account Name: Cubao Cathedral Parish Office</div>
                <div className="font-mono text-xs font-semibold text-slate-800 mt-0.5">0917-842-2284</div>
              </div>
              <button
                onClick={() => handleCopy('09178422284', 'gcash')}
                className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
              >
                {copiedKey === 'gcash' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'gcash' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
            <strong>Parish Acknowledgment:</strong> For official receipts or to submit mass intention date requests, please email your transaction receipt screenshot to <span className="font-semibold underline">iccc.cubaocathedral@gmail.com</span> with your name and intention.
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs shadow transition-colors"
          >
            Done / Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
