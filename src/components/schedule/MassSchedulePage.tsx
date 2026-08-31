import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Radio, 
  CheckCircle2, 
  HelpCircle, 
  Printer, 
  ChevronRight, 
  Flame, 
  ShieldCheck, 
  Heart,
  Video,
  ExternalLink
} from 'lucide-react';
import { useModals } from '../../context/ModalContext';

export const MassSchedulePage: React.FC = () => {
  const { openCandleModal } = useModals();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sundayMasses = [
    { time: '6:00 AM', language: 'Tagalog', presider: 'Parish Vicar', livestream: false, choir: 'St. Joseph Choir' },
    { time: '7:30 AM', language: 'English', presider: 'Cathedral Rector', livestream: false, choir: 'Cathedral Youth Choir' },
    { time: '9:00 AM', language: 'Tagalog (Solemn Mass)', presider: 'Bishop of Cubao / Rector', livestream: true, choir: 'Cathedral Grand Choir' },
    { time: '10:30 AM', language: 'English', presider: 'Parish Priest', livestream: false, choir: 'Coro Immaculata' },
    { time: '12:00 NN', language: 'English', presider: 'Visiting Priest', livestream: false, choir: 'Voices of Faith' },
    { time: '3:30 PM', language: 'Tagalog', presider: 'Parish Vicar', livestream: false, choir: 'Marian Chorale' },
    { time: '5:00 PM', language: 'English', presider: 'Cathedral Rector', livestream: true, choir: 'Cathedral Youth Ministry Choir' },
    { time: '6:30 PM', language: 'Tagalog', presider: 'Parish Vicar', livestream: false, choir: 'Angelicum Choir' },
    { time: '8:00 PM', language: 'English (Youth & Workers Mass)', presider: 'Youth Chaplain', livestream: false, choir: 'Acoustic Youth Ensemble' },
  ];

  const weekdayMasses = [
    { day: 'Monday to Friday', times: ['6:00 AM (Tagalog)', '7:30 AM (English)', '12:15 NN (English)', '6:00 PM (Tagalog/English)'], livestream: '6:00 PM Mass is Livestreamed' },
    { day: 'Saturday (Morning)', times: ['6:00 AM (Tagalog)', '7:30 AM (English)'], livestream: 'Morning Masses in Sanctuary' },
    { day: 'Saturday (Anticipated Sunday Mass)', times: ['6:00 PM (English Anticipated)', '7:30 PM (Tagalog Anticipated)'], livestream: '6:00 PM Anticipated Mass is Livestreamed' },
  ];

  const devotions = [
    { name: 'Novena to Our Mother of Perpetual Help', day: 'Every Wednesday', times: 'After 6:00 AM, 7:30 AM, 12:15 NN, and before 6:00 PM Masses', icon: '🙏' },
    { name: 'Novena to St. Jude Thaddeus', day: 'Every Thursday', times: 'After the 6:00 PM Mass', icon: '🕯️' },
    { name: 'Sacred Heart of Jesus First Friday Devotion', day: '1st Friday of the Month', times: 'All-Day Exposition of the Blessed Sacrament; Holy Hour at 5:00 PM', icon: '❤️' },
    { name: 'First Saturday Dawn Rosary & Marian Devotion', day: '1st Saturday of the Month', times: '5:30 AM Dawn Rosary Procession followed by 6:00 AM Mass', icon: '🌹' },
  ];

  const confessionSchedules = [
    { day: 'Tuesday to Friday', time: '5:00 PM – 6:00 PM (Before Evening Mass)', venue: 'Cathedral Main Sanctuary Confessionals' },
    { day: 'Saturday', time: '4:30 PM – 6:00 PM', venue: 'West Nave Confessional Box' },
    { day: 'Sunday', time: 'During all scheduled Masses', venue: 'Confessional Booths (Subject to Priest Availability)' },
    { day: 'Sick Calls / Emergencies', time: 'Available 24/7 upon request', venue: 'Call Emergency Hotline: +63 920 950 4222' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#0171bb] via-[#015f9e] to-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Diocese of Cubao • Liturgical Schedule</span>
          </div>

          <h1 className="font-cathedral text-3xl sm:text-5xl font-bold tracking-tight">
            Mass & Confession Schedule
          </h1>

          <p className="font-scriptural italic text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
            "Come to me, all you who labor and are burdened, and I will give you rest." — Matthew 11:28
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Schedule Guide</span>
            </button>
            <button
              onClick={openCandleModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Flame className="w-4 h-4" />
              <span>Light a Prayer Candle</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Live Broadcast Notice Card */}
        <div className="bg-gradient-to-r from-red-900/90 via-slate-900 to-slate-900 border border-red-800/50 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500 text-red-400 flex items-center justify-center shrink-0 animate-pulse">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-red-400 uppercase tracking-wide">Live Mass Streaming</div>
              <div className="font-cathedral text-base font-bold text-white">
                Sunday 9:00 AM (Solemn High Mass) & 5:00 PM Evening Mass
              </div>
              <div className="text-xs text-slate-300">
                Broadcasted simultaneously on Cubao Cathedral Facebook Page & YouTube Channel
              </div>
            </div>
          </div>

          <a
            href="https://facebook.com/cubaocathedral"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center gap-2 shrink-0"
          >
            <Video className="w-4 h-4" />
            <span>Watch Live Stream</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 1. Sunday Masses Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="font-cathedral text-2xl font-bold text-slate-900">
                Sunday Eucharistic Celebrations
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Nine Holy Masses celebrated throughout the Lord's Day in Tagalog and English.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0171bb] text-xs font-bold hidden sm:inline-block">
              9 Masses Total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sundayMasses.map((m, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  m.livestream
                    ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-cathedral text-xl font-bold text-slate-900">
                    {m.time}
                  </div>
                  {m.livestream && (
                    <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                      Live Stream
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-semibold text-[#0171bb]">
                    <span>{m.language}</span>
                  </div>
                  <div className="text-slate-700">
                    <span className="text-slate-400">Presider:</span> {m.presider}
                  </div>
                  <div className="text-slate-500 italic">
                    <span className="text-slate-400 not-italic">Choir:</span> {m.choir}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Weekday & Anticipated Masses */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="font-cathedral text-2xl font-bold text-slate-900">
              Weekday & Anticipated Masses
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Daily Masses to sanctify your work week in the presence of the Lord.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weekdayMasses.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#0171bb] uppercase tracking-wider">
                    {item.day}
                  </div>
                  <div className="space-y-2">
                    {item.times.map((t, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-xs text-slate-800 flex items-center justify-between"
                      >
                        <span>{t}</span>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{item.livestream}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Sacrament of Reconciliation (Confession) */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Sacrament of Mercy</span>
            </div>
            <h2 className="font-cathedral text-2xl sm:text-3xl font-bold">
              Sacrament of Reconciliation (Confession)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              "Those who approach the sacrament of Penance obtain pardon from God's mercy for the offense committed against Him."
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {confessionSchedules.map((c, idx) => (
              <div
                key={idx}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2"
              >
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  {c.day}
                </div>
                <div className="font-semibold text-sm text-white">
                  {c.time}
                </div>
                <div className="text-xs text-slate-400">
                  {c.venue}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Weekly Novenas & Devotions */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="font-cathedral text-2xl font-bold text-slate-900">
              Weekly Parish Novenas & Eucharistic Devotions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Join our parish devotional traditions throughout the liturgical week.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {devotions.map((dev, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="text-2xl p-2.5 rounded-xl bg-amber-50 border border-amber-100 shrink-0">
                  {dev.icon}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="text-xs font-bold text-[#0171bb]">{dev.day}</div>
                  <h3 className="font-cathedral text-base font-bold text-slate-900">{dev.name}</h3>
                  <p className="text-xs text-slate-600">{dev.times}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
