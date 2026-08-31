import React, { useState, useEffect } from 'react';
import { BlogPost, ParishEvent, NewsAndEventsTab } from '../../types';
import { postService } from '../../services/postService';
import { PARISH_EVENTS } from '../../data/cathedralData';
import { 
  Newspaper, 
  Calendar, 
  Search, 
  Tag, 
  Clock, 
  User, 
  Share2, 
  Check, 
  ChevronRight, 
  X, 
  MapPin, 
  CalendarPlus, 
  Filter, 
  Sparkles,
  BookOpen,
  Pin
} from 'lucide-react';

interface NewsAndEventsPageProps {
  initialTab?: NewsAndEventsTab;
  selectedArticleId?: string;
  selectedEventId?: string;
}

export const NewsAndEventsPage: React.FC<NewsAndEventsPageProps> = ({ 
  initialTab = 'news',
  selectedArticleId,
  selectedEventId
}) => {
  const [activeTab, setActiveTab] = useState<NewsAndEventsTab>(initialTab);
  
  // News state
  const [posts, setPosts] = useState<BlogPost[]>(() => postService.getPublishedPosts());
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<string>('all');
  const [newsSearchQuery, setNewsSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Events state
  const [selectedEventCategory, setSelectedEventCategory] = useState<string>('all');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [activeEvent, setActiveEvent] = useState<ParishEvent | null>(null);

  // Synchronize tab when initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Subscribe to live post updates from postService
  useEffect(() => {
    const updatePublishedPosts = () => {
      const published = postService.getPublishedPosts();
      setPosts(published);
      if (selectedArticleId) {
        const found = published.find(p => p.id === selectedArticleId || p.slug === selectedArticleId);
        if (found) setActiveArticle(found);
      }
    };

    updatePublishedPosts();
    const unsubscribe = postService.subscribe(() => {
      updatePublishedPosts();
    });
    return () => unsubscribe();
  }, [selectedArticleId]);

  // If selectedEventId is provided, open it
  useEffect(() => {
    if (selectedEventId) {
      const found = PARISH_EVENTS.find(e => e.id === selectedEventId);
      if (found) {
        setActiveEvent(found);
        setActiveTab('calendar');
      }
    }
  }, [selectedEventId]);

  // News categories
  const newsCategories = [
    { id: 'all', label: 'All Articles' },
    { id: 'Pastoral Letters', label: 'Pastoral Letters' },
    { id: 'Announcements', label: 'Announcements' },
    { id: 'Parish Life', label: 'Parish Life' },
    { id: 'Youth Spotlight', label: 'Youth' },
    { id: 'Social Action', label: 'Social Action' },
    { id: 'Liturgical', label: 'Liturgical' },
  ];

  // Event categories
  const eventCategories = [
    { id: 'all', label: 'All Events' },
    { id: 'Feast Celebration', label: 'Feast Days & Solemnities' },
    { id: 'Liturgical', label: 'Liturgical Seasons' },
    { id: 'Youth', label: 'Youth & Young Adults' },
    { id: 'Formation', label: 'Formation & Recollections' },
    { id: 'Outreach', label: 'Outreach & Caritas' },
  ];

  // Filtered news (published only)
  const filteredArticles = posts.filter((article) => {
    if (selectedNewsCategory !== 'all' && article.category !== selectedNewsCategory) return false;
    if (newsSearchQuery.trim()) {
      const q = newsSearchQuery.toLowerCase();
      return (
        (article.title || '').toLowerCase().includes(q) ||
        (article.summary || '').toLowerCase().includes(q) ||
        (article.body || '').toLowerCase().includes(q) ||
        (Array.isArray(article.tags) && article.tags.some(t => (t || '').toLowerCase().includes(q)))
      );
    }
    return true;
  });

  // Filtered events
  const filteredEvents = PARISH_EVENTS.filter((evt) => {
    if (selectedEventCategory !== 'all' && evt.category !== selectedEventCategory) return false;
    if (eventSearchQuery.trim()) {
      const q = eventSearchQuery.toLowerCase();
      return (
        (evt.title || '').toLowerCase().includes(q) ||
        (evt.description || '').toLowerCase().includes(q) ||
        (evt.location || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleShare = (article: BlogPost) => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadICS = (evt: ParishEvent) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cubao Cathedral//Parish Events//EN
BEGIN:VEVENT
SUMMARY:${evt.title}
DESCRIPTION:${evt.description}
LOCATION:${evt.location} - Immaculate Conception Cathedral of Cubao
DTSTART:20261208T090000Z
DTEND:20261208T110000Z
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${evt.id || 'cathedral-event'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#0171bb] via-[#015f9e] to-slate-900 text-white py-14 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-xs font-semibold backdrop-blur-sm border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Diocese of Cubao • Parish Communications</span>
          </div>
          <h1 className="font-cathedral text-3xl sm:text-5xl font-bold tracking-tight">
            News and Events
          </h1>
          <p className="font-scriptural italic text-base sm:text-xl text-blue-100 max-w-2xl mx-auto">
            Stay informed with our latest parish pastoral updates, announcements, solemn feast days, and liturgical activities.
          </p>

          {/* Unified Tab Switcher */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 shadow-lg">
              <button
                id="news-tab-btn"
                onClick={() => setActiveTab('news')}
                className={`px-5 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'news'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Newspaper className="w-4 h-4 text-[#0171bb]" />
                <span>Parish News & Announcements</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0171bb]/15 text-[#0171bb]">
                  {posts.length}
                </span>
              </button>

              <button
                id="calendar-tab-btn"
                onClick={() => setActiveTab('calendar')}
                className={`px-5 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'calendar'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#0171bb]" />
                <span>Liturgical & Event Calendar</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0171bb]/15 text-[#0171bb]">
                  {PARISH_EVENTS.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TAB 1: PARISH NEWS & ANNOUNCEMENTS */}
      {activeTab === 'news' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Filter & Search Bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={newsSearchQuery}
                  onChange={(e) => setNewsSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, keywords..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20 focus:border-[#0171bb]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {newsCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedNewsCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedNewsCategory === cat.id
                        ? 'bg-[#0171bb] text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Articles Grid - Lean Vertical Tiles with Thumbnail on the right */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <Newspaper className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-cathedral text-lg font-bold text-slate-700">No published articles found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try adjusting your search keywords or category filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => setActiveArticle(article)}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-[#0171bb]/40 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <span className="text-[#0171bb] font-bold">{article.publishDate || article.createdDate}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0171bb] font-semibold text-[10px]">
                          {article.category}
                        </span>
                        {article.isPinned && (
                          <span className="flex items-center gap-1 text-amber-600 font-bold text-[10px]">
                            <Pin className="w-3 h-3" /> Pinned
                          </span>
                        )}
                      </div>

                      <h3 className="font-cathedral text-base font-bold text-slate-900 group-hover:text-[#0171bb] transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>

                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0171bb] inline-flex items-center gap-1 group-hover:underline">
                          Read announcement <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                        {article.readTime && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {article.readTime}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Image thumbnail of post on the right */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LITURGICAL & EVENT CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Filter Category Bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  placeholder="Search events, feast days, locations..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20 focus:border-[#0171bb]"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {eventCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedEventCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedEventCategory === cat.id
                        ? 'bg-[#0171bb] text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-cathedral text-lg font-bold text-slate-700">No events found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try adjusting your search criteria or category filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="h-48 overflow-hidden bg-slate-100 relative">
                      <img
                        src={evt.image}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-blue-950/80 backdrop-blur-sm text-amber-300 px-2.5 py-0.5 rounded text-[10px] font-semibold">
                        {evt.category}
                      </div>
                      {evt.highlightNote && (
                        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-sm text-amber-200 px-2.5 py-1 rounded text-[10px] font-semibold truncate border border-amber-400/30">
                          ✨ {evt.highlightNote}
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{evt.date}</span>
                        </div>

                        <h3 className="font-cathedral text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                          {evt.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {evt.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#0171bb] shrink-0" />
                          <span>{evt.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#0171bb] shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>

                        <div className="pt-2 flex items-center gap-2">
                          <button
                            id={`event-details-${evt.id}-btn`}
                            onClick={() => setActiveEvent(evt)}
                            className="flex-1 py-2 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>View Details</span>
                            <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                          </button>

                          <button
                            onClick={() => handleDownloadICS(evt)}
                            title="Add to iCal / Calendar"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                          >
                            <CalendarPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded bg-[#0171bb] text-white font-semibold text-[11px]">
                  {activeArticle.category}
                </span>
                <span className="text-slate-400">{activeArticle.publishDate || activeArticle.createdDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare(activeArticle)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1"
                  title="Share Article Link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div className="space-y-3">
                <h2 className="font-cathedral text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {activeArticle.title}
                </h2>

                <div className="flex items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100">
                  <span><strong>Author:</strong> {activeArticle.author} {activeArticle.authorRole ? `(${activeArticle.authorRole})` : ''}</span>
                  {articleReadTime(activeArticle) && (
                    <>
                      <span>•</span>
                      <span>{activeArticle.readTime}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden h-64 bg-slate-100">
                <img src={activeArticle.featuredImage} alt={activeArticle.title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-line">
                {activeArticle.body}
              </div>

              {/* Tags */}
              {activeArticle.tags && activeArticle.tags.length > 0 && (
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  {activeArticle.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {activeEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200">
            
            <div className="h-48 relative bg-slate-950">
              <img src={activeEvent.image} alt={activeEvent.title} className="w-full h-full object-cover opacity-80" />
              <button
                onClick={() => setActiveEvent(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">{activeEvent.category}</span>
                <h3 className="font-cathedral text-xl font-bold">{activeEvent.title}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1 text-amber-950">
                <div><strong>Date:</strong> {activeEvent.date}</div>
                <div><strong>Time:</strong> {activeEvent.time}</div>
                <div><strong>Venue:</strong> {activeEvent.location}</div>
              </div>

              <div className="space-y-1 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block">Description & Liturgical Schedule:</span>
                <p className="leading-relaxed">{activeEvent.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <button
                  onClick={() => handleDownloadICS(activeEvent)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4 text-amber-300" />
                  Add to Google / Apple Calendar (.ics)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

function articleReadTime(article: BlogPost) {
  return article.readTime || '3 min read';
}
