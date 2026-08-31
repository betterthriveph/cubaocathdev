import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { AboutTab, Ministry } from '../../types';
import { CATHEDRAL_INFO, CLERGY_MEMBERS, MINISTRIES_DATA } from '../../data/cathedralData';
import { 
  Church, 
  History, 
  Target, 
  Users, 
  Award, 
  Sparkles, 
  Compass, 
  HeartHandshake,
  CheckCircle2,
  Clock,
  Video,
  Flame,
  Search,
  Calendar,
  Heart,
  Send,
  ShieldCheck,
  Building,
  ChevronRight,
  Info,
  ExternalLink
} from 'lucide-react';

interface AboutPageProps {
  setCurrentPage?: (page: any) => void;
  initialTab?: AboutTab;
}

export const AboutPage: React.FC<AboutPageProps> = ({ initialTab }) => {
  const { tab: urlTab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  
  const validTabs: AboutTab[] = ['history', 'mass-times', 'ministries', 'mission', 'clergy', 'leadership', 'heritage'];
  const resolvedTab = (urlTab && validTabs.includes(urlTab as AboutTab) ? (urlTab as AboutTab) : initialTab) || 'history';
  
  const [activeTab, setActiveTab] = useState<AboutTab>(resolvedTab);

  useEffect(() => {
    if (urlTab && validTabs.includes(urlTab as AboutTab)) {
      setActiveTab(urlTab as AboutTab);
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [urlTab, initialTab]);

  const handleTabChange = (tabId: AboutTab) => {
    setActiveTab(tabId);
    navigate(`/about/${tabId}`, { replace: true });
  };

  // Ministries Tab State
  const [selectedCommission, setSelectedCommission] = useState<string>('all');
  const [ministrySearchQuery, setMinistrySearchQuery] = useState('');
  const [selectedMinistryForVolunteer, setSelectedMinistryForVolunteer] = useState<Ministry | null>(null);
  const [volName, setVolName] = useState('');
  const [volEmail, setVolEmail] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volExperience, setVolExperience] = useState('');
  const [isVolunteerSubmitted, setIsVolunteerSubmitted] = useState(false);

  const commissions = [
    { id: 'all', label: 'All Ministries' },
    { id: 'Liturgy & Worship', label: 'Liturgy & Worship' },
    { id: 'Formation & Evangelization', label: 'Formation & Evangelization' },
    { id: 'Social Services & Development', label: 'Social Services (Caritas)' },
    { id: 'Mandated Organizations & Movements', label: 'Mandated Movements' },
  ];

  const filteredMinistries = MINISTRIES_DATA.filter((m) => {
    if (selectedCommission !== 'all' && m.commission !== selectedCommission) return false;
    if (ministrySearchQuery.trim()) {
      const q = ministrySearchQuery.toLowerCase();
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

  const historyMilestones = [
    {
      year: '1950',
      title: 'Foundation by the SVD Fathers',
      description: 'The Immaculate Conception Parish was canonically erected on July 15, 1950 by the Society of the Divine Word (SVD) under Rev. Fr. Arthur Rhiel, SVD, to serve the growing residential and commercial community of Cubao.',
    },
    {
      year: '1964',
      title: 'Dedication of the Cathedral Sanctuary',
      description: 'The monumental modernist cathedral edifice with its soaring vaulted ceilings, bell tower, and majestic marble sanctuary was dedicated to Our Lady of the Immaculate Conception.',
    },
    {
      year: '1989',
      title: 'Turnover to the Diocesan Clergy',
      description: 'The SVD Fathers transferred pastoral administration of the parish to the diocesan priests of the Archdiocese of Manila.',
    },
    {
      year: '2003',
      title: 'Elevation to Cathedral of the Diocese of Cubao',
      description: 'On August 28, 2003, Pope John Paul II promulgated the apostolic constitution creating the Diocese of Cubao. The parish was designated as the Cathedral and seat of the Bishop, with Most Rev. Honesto F. Ongtioco installed as the first Bishop.',
    },
    {
      year: '2024',
      title: 'Installation of Bishop Elias L. Ayuban, CMF',
      description: 'Pope Francis appointed Most Rev. Elias L. Ayuban, Jr., CMF, as the 2nd Bishop of Cubao, ushering in an era of synodal missionary dynamism and community revitalization.',
    },
  ];

  const councilLeaders = [
    { name: 'Bro. Emmanuel Garcia', role: 'President, Parish Pastoral Council' },
    { name: 'Sis. Maria Teresa Santos', role: 'Vice President & Head of Liturgical Ministry' },
    { name: 'Bro. Antonio Velasquez', role: 'Head, Commission on Social Services (Caritas Cubao)' },
    { name: 'Sis. Elena Bautista', role: 'Head, Commission on Formation & Catechesis' },
    { name: 'Bro. Joshua Alcantara', role: 'President, Parish Youth Ministry (PYM)' },
    { name: 'Bro. Jun & Sis. Maricar Ramos', role: 'Head, Commission on Family & Life' },
  ];

  const tabs: { id: AboutTab; label: string; icon: React.ReactNode }[] = [
    { id: 'history', label: 'Cathedral History', icon: <History className="w-4 h-4" /> },
    { id: 'mass-times', label: 'Mass Times', icon: <Clock className="w-4 h-4" /> },
    { id: 'ministries', label: 'Ministries', icon: <Users className="w-4 h-4" /> },
    { id: 'mission', label: 'Mission & Vision', icon: <Target className="w-4 h-4" /> },
    { id: 'clergy', label: 'Cathedral Clergy', icon: <Church className="w-4 h-4" /> },
    { id: 'leadership', label: 'Parish Leadership', icon: <HeartHandshake className="w-4 h-4" /> },
    { id: 'heritage', label: 'Sacred Heritage', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-12 pb-20">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#0171bb] via-[#015f9e] to-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-white/15">
            <Church className="w-3.5 h-3.5" />
            Diocese of Cubao • Established 1950
          </div>
          <h1 className="font-cathedral text-3xl sm:text-5xl font-bold tracking-tight">
            About Cubao Cathedral
          </h1>
          <p className="font-scriptural italic text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
            "Sub Tuum Praesidium — The Episcopal Seat of the Roman Catholic Diocese of Cubao"
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`about-tab-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#0171bb] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: HISTORY                                            */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <h2 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
              Chronicles of Faith & Dedication
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              From an SVD mission chapel in 1950 to the episcopal seat of the Diocese of Cubao.
            </p>
          </div>

          <div className="relative border-l-2 border-amber-500/40 ml-4 md:ml-32 space-y-8 pl-6 md:pl-8">
            {historyMilestones.map((milestone, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#0171bb] border-4 border-white shadow-sm group-hover:scale-125 transition-transform" />
                <div className="hidden md:block absolute -left-36 top-1 text-sm font-bold text-amber-800 font-mono">
                  {milestone.year}
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 group-hover:border-blue-300 transition-colors">
                  <div className="md:hidden text-xs font-bold text-amber-800 font-mono mb-1">
                    {milestone.year}
                  </div>
                  <h3 className="font-cathedral text-base font-bold text-slate-900">
                    {milestone.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MASS TIMES (COMBINED TEXT SCHEDULE)                */}
      {/* ========================================================= */}
      {activeTab === 'mass-times' && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <h2 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
              Mass Times & Liturgical Schedule
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Regular Eucharistic celebrations, sacraments of reconciliation, and liturgical devotions at the Cathedral.
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Monday to Friday Schedule */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0171bb] flex items-center justify-center font-bold text-sm">
                    M–F
                  </div>
                  <div>
                    <h3 className="font-cathedral text-lg font-bold text-slate-900">
                      Monday to Friday (Weekdays)
                    </h3>
                    <p className="text-xs text-slate-500">Daily Eucharistic celebrations & novena masses</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  Daily
                </span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start justify-between py-1.5 border-b border-slate-50">
                  <div className="font-mono font-bold text-slate-900 text-sm">6:00 AM</div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-900">Tagalog Mass</span>
                    <span className="text-xs text-slate-500 block">Daily Morning Liturgy (Main Altar / Nativity Chapel)</span>
                  </div>
                </div>

                <div className="flex items-start justify-between py-1.5 border-b border-slate-50">
                  <div className="font-mono font-bold text-slate-900 text-sm">12:15 PM</div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-900">English Mass</span>
                    <span className="text-xs text-slate-500 block">Midday Eucharistic Celebration for workers & visitors</span>
                  </div>
                </div>

                <div className="flex items-start justify-between py-1.5 border-b border-slate-50">
                  <div className="font-mono font-bold text-slate-900 text-sm">6:00 PM</div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-900">Tagalog Evening Mass</span>
                    <span className="text-xs text-slate-500 block">
                      Wed: Our Lady of Perpetual Help (Live) • Thu: St. Jude • Fri: Sacred Heart (Live)
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#0171bb] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Sacrament of Reconciliation (Confession):</strong> Monday to Friday from <strong>4:30 PM – 5:50 PM</strong> at the Cathedral Confessionals.
                  </div>
                </div>
              </div>
            </div>

            {/* Saturday Schedule */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-sm">
                    SAT
                  </div>
                  <div>
                    <h3 className="font-cathedral text-lg font-bold text-slate-900">
                      Saturday (Anticipated & Marian Devotions)
                    </h3>
                    <p className="text-xs text-slate-500">Dawn Marian devotions & Anticipated Sunday Mass</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
                  Anticipated
                </span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start justify-between py-1.5 border-b border-slate-50">
                  <div className="font-mono font-bold text-slate-900 text-sm">6:00 AM</div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-900">Tagalog Mass</span>
                    <span className="text-xs text-slate-500 block">Dawn Marian Mass & Rosary</span>
                  </div>
                </div>

                <div className="flex items-start justify-between py-1.5 border-b border-slate-50">
                  <div className="font-mono font-bold text-slate-900 text-sm">12:15 PM</div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-900">English Mass</span>
                    <span className="text-xs text-slate-500 block">Midday Eucharistic Celebration</span>
                  </div>
                </div>

                <div className="flex items-start justify-between py-1.5 border-b border-slate-50">
                  <div className="font-mono font-bold text-slate-900 text-sm">6:00 PM</div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-900">English Anticipated Sunday Mass</span>
                    <span className="text-xs text-slate-500 block flex items-center gap-1 justify-end">
                      <span className="text-rose-600 font-semibold text-[11px]">● Livestreamed</span> • Fulfills Sunday Obligation
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#0171bb] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Confessions:</strong> 4:30 PM – 5:50 PM before the Anticipated Mass. First Saturday Dawn Rosary at 5:30 AM.
                  </div>
                </div>
              </div>
            </div>

            {/* Sunday Schedule */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                    SUN
                  </div>
                  <div>
                    <h3 className="font-cathedral text-lg font-bold text-slate-900">
                      Sunday (The Lord's Day)
                    </h3>
                    <p className="text-xs text-slate-500">Solemn community liturgies throughout the day</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-950">
                  Solemn Sunday
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs sm:text-sm text-slate-700">
                <div className="space-y-3">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-[#0171bb]">
                    Morning Liturgies
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-mono font-bold text-slate-900">6:00 AM</span>
                    <span className="text-slate-700">Tagalog (Parish Mass)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-mono font-bold text-slate-900">7:30 AM</span>
                    <span className="text-slate-700">Tagalog (Family Mass)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-mono font-bold text-slate-900">9:00 AM</span>
                    <span className="text-slate-900 font-semibold text-right">
                      English (Solemn High Mass • Live)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-mono font-bold text-slate-900">10:30 AM</span>
                    <span className="text-slate-700">English (Community Mass)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-mono font-bold text-slate-900">12:00 NN</span>
                    <span className="text-slate-700">English (Midday Mass)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-[#0171bb]">
                    Afternoon & Evening Liturgies
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-mono font-bold text-slate-900">4:00 PM</span>
                    <span className="text-slate-700">Tagalog (Devotional Mass)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-mono font-bold text-slate-900">5:30 PM</span>
                    <span className="text-slate-900 font-semibold text-right">
                      English (Youth Mass • Live)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-mono font-bold text-slate-900">7:00 PM</span>
                    <span className="text-slate-700">Tagalog (Evening Mass)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-mono font-bold text-slate-900">8:15 PM</span>
                    <span className="text-slate-700">English (Night Sunday Mass)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#0171bb] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Confessions:</strong> Available during all scheduled Sunday Holy Masses in cathedral confessionals. Blessing of sacramentals and holy water after every mass.
                </div>
              </div>
            </div>

            {/* Adoration Chapel & Devotions Banner */}
            <div className="bg-gradient-to-r from-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Nativity Adoration Chapel
                </div>
                <p className="text-xs sm:text-sm text-slate-200">
                  Perpetual Blessed Sacrament Sanctuary open daily from <strong>6:00 AM – 9:00 PM</strong> for personal prayer and quiet contemplation.
                </p>
              </div>
              <Link
                to="/contact"
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 transition-colors inline-block"
              >
                Parish Inquiries →
              </Link>
            </div>

          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* TAB 3: MINISTRIES DIRECTORY                               */}
      {/* ========================================================= */}
      {activeTab === 'ministries' && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <h2 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
              Parish Ministries & Apostolates
            </h2>
            <p className="font-scriptural italic text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              "As each has received a gift, use it to serve one another, as good stewards of God's varied grace." (1 Peter 4:10)
            </p>
          </div>

          {/* Search & Commission Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ministrySearchQuery}
                onChange={(e) => setMinistrySearchQuery(e.target.value)}
                placeholder="Search ministry, choir, coordinator..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/30 focus:border-[#0171bb]"
              />
            </div>

            {/* Commission Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {commissions.map((comm) => (
                <button
                  key={comm.id}
                  onClick={() => setSelectedCommission(comm.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCommission === comm.id
                      ? 'bg-[#0171bb] text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {comm.label}
                </button>
              ))}
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
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0171bb] border border-blue-200">
                      {ministry.commission}
                    </span>
                    {ministry.acronym && (
                      <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {ministry.acronym}
                      </span>
                    )}
                  </div>

                  <h3 className="font-cathedral text-base font-bold text-slate-900 group-hover:text-[#0171bb] transition-colors">
                    {ministry.name}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {ministry.description}
                  </p>

                  {/* Coordinator & Meeting schedule */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="text-slate-700">
                      <strong className="text-slate-900">Coordinator:</strong> {ministry.headCoordinator}
                    </div>
                    {ministry.spiritualDirector && (
                      <div className="text-slate-600 text-[11px]">
                        <strong>Spiritual Director:</strong> {ministry.spiritualDirector}
                      </div>
                    )}
                    <div className="text-slate-500 text-[11px] flex items-center gap-1.5 pt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{ministry.meetingSchedule}</span>
                    </div>
                  </div>

                  {/* Key Activities tags */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                      Key Apostolates:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {ministry.keyActivities.slice(0, 2).map((act, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    id={`join-ministry-${ministry.id}-btn`}
                    onClick={() => setSelectedMinistryForVolunteer(ministry)}
                    className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-[#0171bb] text-[#0171bb] hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-blue-200/80 hover:border-transparent"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Volunteer / Join Ministry</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Volunteer Modal */}
          {selectedMinistryForVolunteer && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 relative">
                  <button
                    onClick={closeVolunteerModal}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                  >
                    ✕
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                      <Heart className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="font-cathedral text-lg font-bold text-amber-200">
                        Join {selectedMinistryForVolunteer.name}
                      </h2>
                      <p className="text-xs text-slate-300">
                        Parish Ministry Volunteer Registration
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {isVolunteerSubmitted ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>

                      <h3 className="font-cathedral text-xl font-bold text-slate-900">
                        Application Received!
                      </h3>

                      <p className="text-xs text-slate-600 max-w-md mx-auto">
                        Praise God for your generous heart! Ministry Coordinator <strong>{selectedMinistryForVolunteer.headCoordinator}</strong> will contact you regarding upcoming orientation meetings.
                      </p>

                      <button
                        onClick={closeVolunteerModal}
                        className="px-5 py-2.5 bg-[#0171bb] hover:bg-[#015f9e] text-white rounded-xl text-xs font-semibold"
                      >
                        Done / Close Window
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={volName}
                          onChange={(e) => setVolName(e.target.value)}
                          placeholder="e.g. Juanita Santos"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/30"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={volEmail}
                            onChange={(e) => setVolEmail(e.target.value)}
                            placeholder="juanita@email.com"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/30"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Mobile Phone *
                          </label>
                          <input
                            type="tel"
                            required
                            value={volPhone}
                            onChange={(e) => setVolPhone(e.target.value)}
                            placeholder="0917-xxx-xxxx"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/30"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Past Experience or Skills (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={volExperience}
                          onChange={(e) => setVolExperience(e.target.value)}
                          placeholder="e.g. Previous choir singer, lector, catechist, medical background..."
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/30"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-3 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4 text-amber-300" />
                          Submit Volunteer Application
                        </button>
                      </div>

                    </form>
                  )}
                </div>

              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* TAB 4: MISSION & VISION                                   */}
      {/* ========================================================= */}
      {activeTab === 'mission' && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Vision */}
            <div className="bg-gradient-to-br from-blue-950 to-slate-900 text-white p-8 rounded-3xl border border-amber-500/30 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="font-cathedral text-2xl font-bold text-amber-200">
                  Our Vision
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  "We, the community of faith in the Immaculate Conception Cathedral Parish, envision a synodal Church deeply rooted in Jesus Christ, led by the Holy Spirit, united with Mary our Mother, actively proclaiming the Gospel of Life, transforming society into a civilization of love, justice, and solidarity with the poor."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 text-[11px] text-amber-300 font-semibold uppercase tracking-wider">
                Diocese of Cubao Pastoral Vision
              </div>
            </div>

            {/* Mission */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0171bb] flex items-center justify-center border border-blue-200">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-cathedral text-2xl font-bold text-slate-900">
                  Our Mission
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>To foster reverent, Christ-centered liturgical worship and vibrant Eucharistic adoration.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>To provide ongoing faith formation and catechesis for children, youth, and families.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>To serve Christ in the marginalized through Caritas Cubao social relief and medical programs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>To accompany young adults into active apostolic leadership in the Church.</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-100 text-[11px] text-[#0171bb] font-semibold uppercase tracking-wider">
                Cathedral Pastoral Mandate
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* TAB 5: CLERGY                                             */}
      {/* ========================================================= */}
      {activeTab === 'clergy' && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <h2 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
              Cathedral Clergy & Pastoral Ministers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              The shepherds consecrated to lead, sanctify, and govern the Cathedral flock.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CLERGY_MEMBERS.map((priest) => (
              <div
                key={priest.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="h-56 bg-slate-100 relative overflow-hidden">
                  <img
                    src={priest.image}
                    alt={priest.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-blue-950/80 backdrop-blur-sm text-amber-300 px-2.5 py-0.5 rounded text-[10px] font-semibold">
                    {priest.role}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-cathedral text-base font-bold text-slate-900">
                      {priest.name}
                    </h3>
                    <p className="text-xs text-amber-800 font-semibold mt-0.5">
                      {priest.subRole}
                    </p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {priest.bio}
                    </p>
                  </div>

                  {priest.ordinationDate && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                      {priest.ordinationDate}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* TAB 6: PARISH LEADERSHIP                                  */}
      {/* ========================================================= */}
      {activeTab === 'leadership' && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <h2 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
              Parish Pastoral Council (PPC)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Collaborative governance between the clergy and mandated lay leaders.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-cathedral text-lg font-bold text-blue-950 border-b border-slate-100 pb-2">
              Executive Pastoral Officers (2025–2028)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {councilLeaders.map((leader, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-xs text-slate-900">{leader.name}</div>
                  <div className="text-[11px] text-amber-800 font-medium mt-0.5">{leader.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* TAB 7: SACRED HERITAGE & ARCHITECTURE                     */}
      {/* ========================================================= */}
      {activeTab === 'heritage' && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <h2 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
              Sacred Heritage & Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Treasures of faith and architectural beauty within the Cathedral sanctuary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="font-cathedral text-lg font-bold text-blue-950">
                The German Antique Stained Glass
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Handcrafted stained glass panels depicting the Mysteries of the Holy Rosary and the Life of the Blessed Virgin Mary, illuminating the sanctuary in rich jewel tones of ruby and sapphire.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="font-cathedral text-lg font-bold text-blue-950">
                The Cathedral Pipe Organ
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                A custom-built mechanical pipe organ capable of producing majestic liturgical music for pontifical masses, choral concerts, and nuptial liturgies.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="font-cathedral text-lg font-bold text-blue-950">
                Relics of the Saints
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The high altar stone encases first-class relics of St. Arnold Janssen, St. Joseph Freinademetz, and St. Lorenzo Ruiz, connecting the parish to universal martyrdom and mission.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="font-cathedral text-lg font-bold text-blue-950">
                The 45-Meter Nuptial Nave
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                A wide central aisle paved in Italian Carrara marble leading to the elevated sanctuary, acclaimed as one of Metro Manila’s most reverent wedding venues.
              </p>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
