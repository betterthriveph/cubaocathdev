import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { MINISTRIES_DATA } from '../../data/cathedralData';
import { Ministry } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  Sparkles, 
  HeartHandshake, 
  Send, 
  CheckCircle2, 
  Mail, 
  Calendar, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';

export const MinistriesPage: React.FC = () => {
  const [selectedCommission, setSelectedCommission] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMinistryForVolunteer, setSelectedMinistryForVolunteer] = useState<Ministry | null>(null);
  
  // Volunteer form state
  const [volName, setVolName] = useState('');
  const [volEmail, setVolEmail] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volExperience, setVolExperience] = useState('');
  const [isVolunteerSubmitted, setIsVolunteerSubmitted] = useState(false);

  const commissions = [
    { id: 'all', label: 'All Commissions' },
    { id: 'Liturgy & Worship', label: 'Liturgy & Worship' },
    { id: 'Formation & Evangelization', label: 'Formation & Evangelization' },
    { id: 'Social Services & Development', label: 'Social Services (Caritas)' },
    { id: 'Mandated Organizations & Movements', label: 'Mandated Movements' },
  ];

  const filteredMinistries = MINISTRIES_DATA.filter((m) => {
    if (selectedCommission !== 'all' && m.commission !== selectedCommission) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (m.name || '').toLowerCase().includes(q) ||
        (m.acronym ? m.acronym.toLowerCase().includes(q) : false) ||
        (m.description || '').toLowerCase().includes(q) ||
        (m.headCoordinator || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volName || !volEmail || !volPhone) return;

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }

    setIsVolunteerSubmitted(true);
  };

  const closeVolunteerModal = () => {
    setSelectedMinistryForVolunteer(null);
    setVolName('');
    setVolEmail('');
    setVolPhone('');
    setVolExperience('');
    setIsVolunteerSubmitted(false);
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#0171bb] via-[#015f9e] to-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Diocese of Cubao • Lay Apostolate</span>
          </div>

          <h1 className="font-cathedral text-3xl sm:text-5xl font-bold tracking-tight">
            Parish Ministries & Organizations
          </h1>

          <p className="font-scriptural italic text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
            "As each has received a gift, use it to serve one another, as good stewards of God's varied grace." — 1 Peter 4:10
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Commission Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {commissions.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCommission(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCommission === c.id
                    ? 'bg-[#0171bb] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ministry or coordinator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/40 focus:border-[#0171bb]"
            />
          </div>
        </div>

        {/* Ministries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMinistries.map((ministry) => (
            <div
              key={ministry.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#0171bb] text-[10px] font-bold uppercase tracking-wider">
                    {ministry.commission}
                  </span>
                  {ministry.acronym && (
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {ministry.acronym}
                    </span>
                  )}
                </div>

                <h3 className="font-cathedral text-lg font-bold text-slate-900 group-hover:text-[#0171bb] transition-colors leading-snug">
                  {ministry.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {ministry.description}
                </p>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  {ministry.headCoordinator && (
                    <div>
                      <span className="text-slate-400">Coordinator:</span> <span className="font-semibold text-slate-800">{ministry.headCoordinator}</span>
                    </div>
                  )}
                  {ministry.meetingSchedule && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{ministry.meetingSchedule}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedMinistryForVolunteer(ministry)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <HeartHandshake className="w-4 h-4 text-amber-300" />
                  <span>Join this Ministry</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredMinistries.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="font-cathedral text-lg font-bold text-slate-700">No ministries found</div>
            <p className="text-xs text-slate-500">Try adjusting your search terms or filter selection.</p>
          </div>
        )}

      </div>

      {/* Volunteer Signup Modal */}
      {selectedMinistryForVolunteer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-200">
            {!isVolunteerSubmitted ? (
              <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#0171bb] uppercase tracking-wider">
                    Volunteer Application
                  </div>
                  <h3 className="font-cathedral text-xl font-bold text-slate-900">
                    Join {selectedMinistryForVolunteer.name}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Sign up to share your time and talents with the Cathedral community.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={volName}
                      onChange={(e) => setVolName(e.target.value)}
                      placeholder="Juan Dela Cruz"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/40 focus:border-[#0171bb]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={volEmail}
                        onChange={(e) => setVolEmail(e.target.value)}
                        placeholder="juan@gmail.com"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/40 focus:border-[#0171bb]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={volPhone}
                        onChange={(e) => setVolPhone(e.target.value)}
                        placeholder="0917 123 4567"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/40 focus:border-[#0171bb]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Past Experience or Specific Talents (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={volExperience}
                      onChange={(e) => setVolExperience(e.target.value)}
                      placeholder="e.g. Previous lector in school, singing soprano in choir..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/40 focus:border-[#0171bb]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeVolunteerModal}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Volunteer Form</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-cathedral text-xl font-bold text-slate-900">
                  Thank You for Answering the Call!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your volunteer application for <strong>{selectedMinistryForVolunteer.name}</strong> has been received. Coordinator {selectedMinistryForVolunteer.headCoordinator || 'the Secretariat'} will reach out to you via SMS/Email for orientation.
                </p>
                <div className="pt-3">
                  <button
                    onClick={closeVolunteerModal}
                    className="px-6 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
