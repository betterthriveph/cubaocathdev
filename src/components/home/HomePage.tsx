import React from 'react';
import { Link } from 'react-router-dom';
import { 
  NEWS_ARTICLES, 
  PARISH_EVENTS 
} from '../../data/cathedralData';
import { 
  ArrowRight, 
  ChevronRight, 
  MapPin, 
  Clock,
  Calendar,
  Building2,
  Sparkles,
  Flame
} from 'lucide-react';
import { useModals } from '../../context/ModalContext';

export const HomePage: React.FC = () => {
  const featuredAnnouncements = NEWS_ARTICLES.slice(0, 4);
  const featuredEvents = PARISH_EVENTS.slice(0, 3);
  const { openCandleModal } = useModals();

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 pt-6">
      
      {/* 1. ABOUT OUR CATHEDRAL WITH BACKGROUND IMAGE */}
      <section id="about-our-cathedral-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-950 text-white group">
          {/* Background Image Behind */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=1800"
              alt="Immaculate Conception Cathedral of Cubao Sanctuary"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-40 sm:opacity-50"
            />
            {/* Elegant Gradient Overlay for Pristine Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent sm:hidden" />
          </div>

          {/* Content Over Background */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-3xl space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Diocese of Cubao • Consecrated Cathedral 2003</span>
            </div>

            <h2 className="font-cathedral text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
              Mother Church of the Diocese of Cubao
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              Established in 1950 by the Society of the Divine Word (SVD) and solemnly consecrated as a Cathedral in 2003, the Immaculate Conception Cathedral of Cubao serves as the episcopal seat of the Bishop of Cubao and a spiritual sanctuary for thousands of Catholic faithful in Quezon City.
            </p>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Under the maternal mantle of our Titular Patroness, Our Lady of the Immaculate Conception, our parish fosters vibrant sacramental devotions, active social services, and communal worship.
            </p>

            <div className="pt-2">
              <Link
                id="about-learn-more-btn"
                to="/about"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/30 backdrop-blur-md transition-all group/btn cursor-pointer shadow-sm"
              >
                <span>Read Cathedral History, Clergy & Pastoral Leadership</span>
                <ArrowRight className="w-4 h-4 text-amber-300 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PARISH SPACES FOR THE COMMUNITY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
              Parish Spaces for the Community
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Explore spaces where our parish community can gather, celebrate, connect, and come together.
            </p>
          </div>

          <Link
            to="/facilities"
            className="text-[#0171bb] hover:text-[#015f9e] font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>View All Facilities Overview</span>
            <ArrowRight className="w-4 h-4 text-[#0171bb]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Facility 1: Parish Center Halls */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="h-44 relative bg-slate-900 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800"
                  alt="Parish Center Grand Hall"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-cathedral text-lg font-bold text-slate-900 group-hover:text-[#0171bb] transition-colors">
                  Cathedral Parish Center
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Air-conditioned banquet halls for weddings, baptisms, anniversaries, and parish seminars.
                </p>
                <div className="pt-1 text-xs text-slate-700 font-semibold">
                  Capacity: Up to 350 pax
                </div>
              </div>
            </div>
            <div className="p-5 pt-0">
              <Link
                to="/facilities/parish-center"
                className="w-full py-2.5 px-3 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Parish Center Halls</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
              </Link>
            </div>
          </div>

          {/* Facility 2: Grotto */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="h-44 relative bg-slate-900 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=800"
                  alt="Grotto of Our Lady of Lourdes"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-cathedral text-lg font-bold text-slate-900 group-hover:text-[#0171bb] transition-colors">
                  Grotto of Our Lady of Lourdes
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Peaceful outdoor prayer cave, holy water fountain, and multi-colored votive candle lighting.
                </p>
                <div className="pt-1 text-xs text-slate-700 font-semibold">
                  Capacity: 200 visitors
                </div>
              </div>
            </div>
            <div className="p-5 pt-0">
              <Link
                to="/facilities/grotto"
                className="w-full py-2.5 px-3 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Grotto Sanctuary</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
              </Link>
            </div>
          </div>

          {/* Facility 3: Nativity Chapel */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="h-44 relative bg-slate-900 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=800"
                  alt="Nativity Adoration Chapel"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-cathedral text-lg font-bold text-slate-900 group-hover:text-[#0171bb] transition-colors">
                  Nativity Adoration Chapel
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Silent sanctuary for continuous adoration of the Blessed Sacrament exposed in the Monstrance.
                </p>
                <div className="pt-1 text-xs text-slate-700 font-semibold">
                  Capacity: 60 pax
                </div>
              </div>
            </div>
            <div className="p-5 pt-0">
              <Link
                to="/facilities/nativity-chapel"
                className="w-full py-2.5 px-3 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Nativity Chapel</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 3. LATEST ANNOUNCEMENTS & NEWS (LEAN VERTICAL TILES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
              Latest Announcements & News
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Pastoral letters, schedules, and community updates from our parish.
            </p>
          </div>

          <Link
            to="/news"
            className="text-[#0171bb] hover:text-[#015f9e] font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Read All Parish News</span>
            <ArrowRight className="w-4 h-4 text-[#0171bb]" />
          </Link>
        </div>

        {/* Lean Vertical Tiles Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredAnnouncements.map((news) => (
            <Link
              key={news.id}
              to={`/news/${news.slug}`}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-[#0171bb]/40 transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              {/* Left Column: Date, Title, Excerpt + Read More link */}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="text-[11px] font-semibold text-slate-400">
                  {news.date}
                </div>
                
                <h3 className="font-cathedral text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0171bb] transition-colors leading-snug line-clamp-2">
                  {news.title}
                </h3>
                
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {news.summary}
                </p>

                <div className="pt-1">
                  <span className="text-xs font-bold text-[#0171bb] group-hover:text-[#015f9e] inline-flex items-center gap-1">
                    Read more <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>

              {/* Right Column: Image Thumbnail */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED UPCOMING EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
              Upcoming Parish Events & Feasts
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Join our liturgical celebrations, formation sessions, and parish fellowship.
            </p>
          </div>

          <Link
            to="/calendar"
            className="text-[#0171bb] hover:text-[#015f9e] font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>View Full Calendar</span>
            <ArrowRight className="w-4 h-4 text-[#0171bb]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredEvents.map((event) => (
            <Link
              key={event.id}
              to="/calendar"
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#0171bb]">
                    {event.category}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-800">{event.date}</span>
                </div>
                <h3 className="font-cathedral text-base font-bold text-slate-900 group-hover:text-[#0171bb] transition-colors leading-snug">
                  {event.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {event.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{event.time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};
