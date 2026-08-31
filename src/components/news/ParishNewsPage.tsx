import React, { useState } from 'react';
import { NEWS_ARTICLES } from '../../data/cathedralData';
import { NewsArticle } from '../../types';
import { 
  Newspaper, 
  Search, 
  Tag, 
  Clock, 
  User, 
  Share2, 
  Check, 
  ChevronRight, 
  X, 
  Bookmark, 
  Pin,
  Sparkles
} from 'lucide-react';

interface ParishNewsPageProps {
  selectedArticleId?: string;
}

export const ParishNewsPage: React.FC<ParishNewsPageProps> = ({ selectedArticleId }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(
    selectedArticleId ? NEWS_ARTICLES.find(a => a.id === selectedArticleId) || null : null
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const categories = [
    { id: 'all', label: 'All Articles' },
    { id: 'Pastoral Letters', label: 'Pastoral Letters' },
    { id: 'Announcements', label: 'Announcements' },
    { id: 'Parish Life', label: 'Parish Life' },
    { id: 'Youth Spotlight', label: 'Youth' },
    { id: 'Social Action', label: 'Social Action' },
  ];

  const filteredArticles = NEWS_ARTICLES.filter((article) => {
    if (selectedCategory !== 'all' && article.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (article.title || '').toLowerCase().includes(q) ||
        (article.summary || '').toLowerCase().includes(q) ||
        (Array.isArray(article.tags) && article.tags.some(t => (t || '').toLowerCase().includes(q)))
      );
    }
    return true;
  });

  const handleShare = (article: NewsArticle) => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#0171bb] via-[#015f9e] to-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <h1 className="font-cathedral text-3xl sm:text-5xl font-bold tracking-tight">
            Parish News & Updates
          </h1>
          <p className="font-scriptural italic text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
            Pastoral letters, ministry highlights, liturgical notices, and stories of faith across our community.
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, topics, keywords..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]/20 focus:border-[#0171bb]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span className="text-[#0171bb] font-bold">{article.date}</span>
                  <span>•</span>
                  <span>{article.category}</span>
                </div>

                <h3 className="font-cathedral text-base font-bold text-slate-900 group-hover:text-[#0171bb] transition-colors leading-snug line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>

                <div className="pt-1">
                  <span className="text-xs font-bold text-[#0171bb] inline-flex items-center gap-1 group-hover:underline">
                    Read more <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Image thumbnail of post on the right */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                  {activeArticle.category}
                </span>
                <span className="text-slate-400">{activeArticle.date}</span>
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
                  <span><strong>Author:</strong> {activeArticle.author} ({activeArticle.authorRole})</span>
                  <span>•</span>
                  <span>{activeArticle.readTime}</span>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden h-64 bg-slate-100">
                <img src={activeArticle.image} alt={activeArticle.title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                {activeArticle.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Tags */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
                {activeArticle.tags.map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
