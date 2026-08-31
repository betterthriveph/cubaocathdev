import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { MASS_SCHEDULES } from '../../data/cathedralData';
import { 
  Clock, 
  Video, 
  Sparkles, 
  CheckCircle2, 
  Heart, 
  HelpCircle, 
  Calendar, 
  ShieldCheck, 
  ChevronRight,
  Filter,
  Flame,
  FileText
} from 'lucide-react';

interface MassSchedulePageProps {
  onOpenDonationModal: () => void;
  onOpenCandleModal: () => void;
}

export const MassSchedulePage: React.FC<MassSchedulePageProps> = ({
  onOpenDonationModal,
  onOpenCandleModal,
}) => {
  const [selectedDayType, setSelectedDayType] = useState<'all' | 'weekday' | 'saturday' | 'sunday'>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'English' | 'Tagalog'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Mass Intention State
  const [intentionType, setIntentionType] = useState<'Thanksgiving' | 'Eternal Repose (Soul)' | 'Healing & Recovery' | 'Special Petition'>('Thanksgiving');
  const [intentionDate, setIntentionDate] = useState('');
  const [intentionTime, setIntentionTime] = useState('6:00 AM');
  const [names, setNames] = useState('');
  const [offeredBy, setOfferedBy] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const filteredSchedules = MASS_SCHEDULES.filter((sched) => {
    if (selectedDayType === 'weekday' && sched.dayType !== 'weekday') return false;
    if (selectedDayType === 'saturday' && sched.dayType !== 'saturday') return false;
    if (selectedDayType === 'sunday' && sched.dayType !== 'sunday') return false;
    return true;
  });

  const handleSubmitIntention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!names.trim() || !offeredBy.trim() || !intentionDate) return;

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }

    setIsSubmitted(true);
  };

  const resetForm = () => {
    setNames('');
    setOfferedBy('');
    setContactNumber('');
    setIntentionDate('');
    setIsSubmitted(false);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-400/30">
            <Clock className="w-3.5 h-3.5" />
            Liturgical Timetable & Devotions
          </div>
          <h1 className="font-cathedral text-3xl sm:text-5xl font-bold tracking-tight">
            Mass & Confession Schedule
          </h1>
          <p className="font-scriptural italic text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            "For where two or three are gathered in my name, there am I among them." (Matthew 18:20)
          </p>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>Offer Mass Intention (Misa de Gracia)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Confession & Adoration Highlight Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Confession Box */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-6 rounded-2xl border border-blue-700/50 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-cathedral text-base font-bold text-amber-300">
                Sacrament of Reconciliation (Confession)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 text-[10px] font-semibold">
                Daily Available
              </span>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <strong>Monday to Friday:</strong> 5:00 PM – 5:50 PM (Before evening mass)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <strong>Saturdays:</strong> 4:30 PM – 5:50 PM (Before Anticipated Mass)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <strong>Sundays:</strong> During all scheduled Masses at side confessionals
              </li>
              <li className="flex items-center gap-2 text-slate-300 italic pt-1">
                * Available anytime by appointment or upon ringing the Parish Office bell.
              </li>
            </ul>
          </div>

          {/* Perpetual Adoration Box */}
          <div className="bg-gradient-to-br from-slate-900 to-amber-950/60 text-white p-6 rounded-2xl border border-amber-500/30 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-cathedral text-base font-bold text-amber-300">
                Nativity Perpetual Adoration Chapel
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] font-semibold">
                Blessed Sacrament
              </span>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <strong>Public Adoration:</strong> Open Daily 6:00 AM – 10:00 PM
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <strong>Nocturnal Adoration:</strong> 10:00 PM – 6:00 AM (Registered Adorers)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <strong>First Friday Benediction:</strong> 5:00 PM Eucharistic Holy Hour
              </li>
              <li className="flex items-center gap-2 text-amber-200 italic pt-1">
                * Quiet sanctuary for personal meditation and adoration.
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Filter Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Day Filter:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Days' },
                { id: 'sunday', label: 'Sunday (9 Masses)' },
                { id: 'weekday', label: 'Monday – Friday' },
                { id: 'saturday', label: 'Saturday (Anticipated)' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedDayType(filter.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedDayType === filter.id
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Language:</span>
            <div className="flex gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'Tagalog', label: 'Filipino / Tagalog' },
                { id: 'English', label: 'English' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguageFilter(lang.id as any)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    languageFilter === lang.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Mass Schedules Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedules.map((schedule, idx) => {
            const displayMasses = schedule.masses.filter((m) => {
              if (languageFilter !== 'all' && m.language !== languageFilter) return false;
              return true;
            });

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Header */}
                <div className={`p-4 ${
                  schedule.dayType === 'sunday'
                    ? 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white'
                    : 'bg-slate-900 text-amber-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-cathedral text-base font-bold">
                      {schedule.day}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-semibold">
                      {schedule.masses.length} Masses
                    </span>
                  </div>
                  {schedule.novenaDetails && (
                    <p className="text-[11px] text-amber-200/90 mt-1">
                      ✨ {schedule.novenaDetails}
                    </p>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 flex-1 space-y-2.5 divide-y divide-slate-100">
                  {displayMasses.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 italic">
                      No masses matching selected filter.
                    </div>
                  ) : (
                    displayMasses.map((mass, mIdx) => (
                      <div key={mIdx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {mass.time}
                            </span>
                            {mass.isLivestreamed && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-600 text-white flex items-center gap-0.5">
                                <Video className="w-2.5 h-2.5" /> LIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {mass.type} {mass.notes && `• ${mass.notes}`}
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          mass.language === 'English'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}>
                          {mass.language}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Confession row */}
                {schedule.confessionTimes && (
                  <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600">
                    <strong>Confession:</strong> {schedule.confessionTimes.join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Online Mass Intention Offering Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 relative">
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
              >
                ✕
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                  <FileText className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="font-cathedral text-xl font-bold text-amber-200">
                    Offer a Mass Intention
                  </h2>
                  <p className="text-xs text-slate-300">
                    Misa de Gracia • Immaculate Conception Cathedral of Cubao
                  </p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6">
              {isSubmitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <h3 className="font-cathedral text-xl font-bold text-slate-900">
                    Mass Intention Registered
                  </h3>

                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Your mass intention has been submitted to the Cathedral sacristy and will be included in the intentions offered at the altar.
                  </p>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs space-y-1.5">
                    <div><strong>Type:</strong> {intentionType}</div>
                    <div><strong>Date & Time:</strong> {intentionDate} at {intentionTime}</div>
                    <div><strong>Names:</strong> {names}</div>
                    <div><strong>Offered By:</strong> {offeredBy}</div>
                  </div>

                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-semibold"
                    >
                      Submit Another Intention
                    </button>
                    <button
                      onClick={onOpenDonationModal}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold"
                    >
                      Send Mass Stipend
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitIntention} className="space-y-4">
                  
                  {/* Intention Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      1. Type of Mass Intention *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Thanksgiving',
                        'Eternal Repose (Soul)',
                        'Healing & Recovery',
                        'Special Petition',
                      ].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setIntentionType(t as any)}
                          className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                            intentionType === t
                              ? 'border-blue-900 bg-blue-50 font-bold text-blue-900 ring-1 ring-blue-900'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Mass Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={intentionDate}
                        onChange={(e) => setIntentionDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Mass Time *
                      </label>
                      <select
                        value={intentionTime}
                        onChange={(e) => setIntentionTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/20 bg-white"
                      >
                        <option value="6:00 AM">6:00 AM (Tagalog)</option>
                        <option value="7:30 AM">7:30 AM (Tagalog - Sunday)</option>
                        <option value="9:00 AM">9:00 AM (English - High Mass)</option>
                        <option value="10:30 AM">10:30 AM (English - Sunday)</option>
                        <option value="12:15 PM">12:15 PM (English - Weekday)</option>
                        <option value="4:00 PM">4:00 PM (Tagalog - Sunday)</option>
                        <option value="5:30 PM">5:30 PM (English - Youth Mass)</option>
                        <option value="6:00 PM">6:00 PM (Evening Mass)</option>
                        <option value="7:00 PM">7:00 PM (Tagalog - Sunday)</option>
                        <option value="8:15 PM">8:15 PM (English - Sunday)</option>
                      </select>
                    </div>
                  </div>

                  {/* Names */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Names to be Offered *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={names}
                      onChange={(e) => setNames(e.target.value)}
                      placeholder="e.g. Juan Dela Cruz, Maria Santos, or The Santos Family"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                    />
                  </div>

                  {/* Offered By & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Offered By *
                      </label>
                      <input
                        type="text"
                        required
                        value={offeredBy}
                        onChange={(e) => setOfferedBy(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="0917-xxx-xxxx"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-md transition-colors"
                    >
                      Submit Mass Intention to Sacristy
                    </button>
                    <p className="text-[11px] text-slate-500 text-center mt-2">
                      Voluntary mass stipends (₱100 – ₱500 recommended) can be given via Parish GCash/Bank or at the sacristy counter.
                    </p>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
