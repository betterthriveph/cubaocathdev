import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_PRAYER_PETITIONS } from '../../data/cathedralData';
import { PrayerPetition } from '../../types';
import { 
  X, 
  Flame, 
  Sparkles, 
  Heart, 
  CheckCircle2, 
  MessageSquare, 
  Share2, 
  ShieldCheck 
} from 'lucide-react';

interface PrayerCandleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrayerCandleModal: React.FC<PrayerCandleModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'light' | 'wall'>('light');
  const [petitions, setPetitions] = useState<PrayerPetition[]>(INITIAL_PRAYER_PETITIONS);
  
  const [name, setName] = useState('');
  const [intention, setIntention] = useState('');
  const [selectedColor, setSelectedColor] = useState<'amber' | 'blue' | 'rose' | 'white' | 'gold'>('amber');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [amenCounts, setAmenCounts] = useState<Record<string, number>>({
    'prayer-1': 34,
    'prayer-2': 58,
    'prayer-3': 41,
    'prayer-4': 29,
    'prayer-5': 62,
  });

  if (!isOpen) return null;

  const candleColorMap = {
    amber: {
      name: 'Amber Candle',
      meaning: 'Health, Family Protection & Wisdom',
      bgClass: 'bg-amber-500',
      borderClass: 'border-amber-400',
      glowClass: 'shadow-amber-500/50',
      textColor: 'text-amber-700',
      pillBg: 'bg-amber-50 text-amber-900 border-amber-200',
    },
    blue: {
      name: 'Marian Blue Candle',
      meaning: 'Peace, Mental Solace & Grace',
      bgClass: 'bg-sky-500',
      borderClass: 'border-sky-400',
      glowClass: 'shadow-sky-500/50',
      textColor: 'text-sky-700',
      pillBg: 'bg-sky-50 text-sky-900 border-sky-200',
    },
    rose: {
      name: 'Rose Candle',
      meaning: 'Thanksgiving & Answered Prayers',
      bgClass: 'bg-rose-400',
      borderClass: 'border-rose-300',
      glowClass: 'shadow-rose-400/50',
      textColor: 'text-rose-700',
      pillBg: 'bg-rose-50 text-rose-900 border-rose-200',
    },
    white: {
      name: 'Pure White Candle',
      meaning: 'Spiritual Purity & Special Petitions',
      bgClass: 'bg-slate-100',
      borderClass: 'border-slate-300',
      glowClass: 'shadow-slate-200/50',
      textColor: 'text-slate-700',
      pillBg: 'bg-slate-50 text-slate-900 border-slate-200',
    },
    gold: {
      name: 'Gold Candle',
      meaning: 'Eternal Repose of Souls & Vocations',
      bgClass: 'bg-yellow-500',
      borderClass: 'border-yellow-400',
      glowClass: 'shadow-yellow-500/50',
      textColor: 'text-amber-800',
      pillBg: 'bg-yellow-50 text-yellow-950 border-yellow-200',
    },
  };

  const handleLightCandle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intention.trim()) return;

    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#38bdf8', '#fb7185'],
      });
    } catch {
      // safe fallback
    }

    const newPetition: PrayerPetition = {
      id: `prayer-${Date.now()}`,
      senderName: name.trim() || 'Anonymous Devotee',
      intention: intention.trim(),
      candleColor: selectedColor,
      date: 'Just now',
      isPrivate,
    };

    if (!isPrivate) {
      setPetitions([newPetition, ...petitions]);
      setAmenCounts((prev) => ({ ...prev, [newPetition.id]: 1 }));
    }

    setIsSubmitted(true);
  };

  const handleAmen = (id: string) => {
    setAmenCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleReset = () => {
    setName('');
    setIntention('');
    setIsSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 relative">
          <button
            id="close-candle-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Flame className="w-6 h-6 text-amber-400 candle-flame" />
            </div>
            <div>
              <h2 className="font-cathedral text-xl font-bold text-amber-200">
                The Grotto of Our Lady of Lourdes
              </h2>
              <p className="text-xs text-slate-300">
                Virtual Devotional Candle Room & Parish Prayer Wall
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={() => setActiveTab('light')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'light'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Light a Prayer Candle
            </button>
            <button
              onClick={() => setActiveTab('wall')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'wall'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Parish Prayer Wall ({petitions.length})
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {activeTab === 'light' ? (
            isSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center relative shadow-lg shadow-amber-500/20">
                  <Flame className="w-10 h-10 text-amber-600 candle-flame" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-cathedral text-2xl font-bold text-slate-900">
                    Your Prayer Candle is Lit
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    "Under thy protection, we seek refuge, O Holy Mother of God." Your intention has been placed in spirit before the Grotto of Our Lady of Lourdes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-left max-w-md mx-auto space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                    <span>Intention: {candleColorMap[selectedColor].name}</span>
                    <span className="text-[11px] font-normal text-amber-800">
                      {isPrivate ? 'Private Intention' : 'Shared on Prayer Wall'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 italic font-scriptural text-sm">
                    "{intention}"
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Offered by: {name || 'Anonymous Devotee'}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                  >
                    Light Another Candle
                  </button>
                  <button
                    onClick={() => setActiveTab('wall')}
                    className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold transition-colors"
                  >
                    View Community Prayers
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLightCandle} className="space-y-4">
                
                {/* Candle Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    1. Select Devotional Candle Intention
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {(Object.keys(candleColorMap) as Array<keyof typeof candleColorMap>).map((key) => {
                      const candle = candleColorMap[key];
                      const isSelected = selectedColor === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedColor(key)}
                          className={`p-3 rounded-xl text-left border text-xs transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-blue-900 bg-blue-50/50 ring-2 ring-blue-900/30'
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className={`w-4 h-4 rounded-full border ${candle.bgClass} ${candle.borderClass}`} />
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-900" />}
                          </div>
                          <span className="font-semibold text-slate-900">{candle.name}</span>
                          <span className="text-[10px] text-slate-500 leading-tight mt-0.5">{candle.meaning}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    2. Offered By (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maria Santos / The Dela Cruz Family"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                  />
                </div>

                {/* Intention Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    3. Your Prayer Petition or Thanksgiving *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="Write your prayers, healing petitions, gratitude, or intention for loved ones..."
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                  />
                </div>

                {/* Privacy Check */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="privacy-toggle"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded text-blue-900 focus:ring-blue-900"
                  />
                  <label htmlFor="privacy-toggle" className="text-xs text-slate-600 cursor-pointer select-none">
                    Keep my prayer private (Do not display on public Prayer Wall)
                  </label>
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4 text-slate-950 candle-flame" />
                    Light Devotional Candle & Offer Prayer
                  </button>
                  <p className="text-[11px] text-center text-slate-500 mt-2">
                    Devotions at the Grotto of Cubao Cathedral are included in the daily intentions of the Cathedral clergy.
                  </p>
                </div>

              </form>
            )
          ) : (
            /* Prayer Wall Tab */
            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Parish Prayer Intentions</span>
                  <span className="text-[11px] text-amber-800">
                    Join in praying with our brothers and sisters in Christ.
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('light')}
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-semibold rounded-lg text-xs hover:bg-amber-600 transition-colors shrink-0"
                >
                  Light Mine
                </button>
              </div>

              <div className="space-y-3">
                {petitions.map((pet) => {
                  const candle = candleColorMap[pet.candleColor] || candleColorMap.amber;
                  const count = amenCounts[pet.id] || 0;
                  return (
                    <div
                      key={pet.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 hover:border-amber-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${candle.bgClass} ${candle.borderClass} border shrink-0`} />
                          <span className="font-semibold text-slate-900">{pet.senderName}</span>
                        </div>
                        <span className="text-[10px] text-slate-600">{pet.date}</span>
                      </div>

                      <p className="text-slate-800 font-scriptural text-base leading-relaxed italic">
                        "{pet.intention}"
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${candle.pillBg} font-medium`}>
                          {candle.name}
                        </span>

                        <button
                          onClick={() => handleAmen(pet.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-800 font-semibold text-[11px] transition-colors"
                        >
                          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                          Amen ({count})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
