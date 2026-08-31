import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BlogPost } from '../../types';
import { postService } from '../../services/postService';
import { 
  Newspaper, 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  Check, 
  ArrowLeft, 
  Tag, 
  ChevronRight, 
  Bookmark, 
  Printer, 
  Sparkles,
  Building2,
  Phone,
  Pin
} from 'lucide-react';
import { useModals } from '../../context/ModalContext';

export const AnnouncementDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { openCandleModal, openDonationModal } = useModals();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const loadPost = () => {
      const published = postService.getPublishedPosts();
      setAllPosts(published);
      if (slug) {
        // Find by slug, fallback to ID
        const found = published.find(p => p.slug === slug || p.id === slug);
        setPost(found || null);
      }
    };

    loadPost();
    const unsubscribe = postService.subscribe(loadPost);
    return () => unsubscribe();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#0171bb] flex items-center justify-center mx-auto shadow-sm">
          <Newspaper className="w-8 h-8" />
        </div>
        <h1 className="font-cathedral text-2xl sm:text-3xl font-bold text-slate-900">
          Announcement Not Found
        </h1>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          The parish announcement or pastoral letter you are looking for may have been updated, moved, or is currently unpublished.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            to="/news"
            className="px-5 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white text-xs font-bold transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All News & Announcements</span>
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = allPosts
    .filter(p => p.id !== post.id && (p.category === post.category || p.tags.some(t => post.tags.includes(t))))
    .slice(0, 3);

  // If no category-specific related posts, pick latest other posts
  const fallbackRelated = relatedPosts.length > 0 
    ? relatedPosts 
    : allPosts.filter(p => p.id !== post.id).slice(0, 3);

  // Split body into paragraphs
  const paragraphs = post.body ? post.body.split('\n\n') : [];

  return (
    <div className="space-y-12 pb-24">
      {/* Breadcrumb Bar */}
      <div className="bg-slate-100 border-b border-slate-200/80 py-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link to="/" className="hover:text-[#0171bb] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link to="/news" className="hover:text-[#0171bb] transition-colors">News & Announcements</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Article Content Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Back Link & Quick Actions */}
        <div className="flex items-center justify-between gap-4 pb-2">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0171bb] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-1 transition-transform" />
            <span>All Parish Announcements</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy link to clipboard"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Share</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors hidden sm:inline-flex"
              title="Print announcement"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Header Metadata */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0171bb] text-xs font-bold uppercase tracking-wide">
              {post.category}
            </span>
            {post.isPinned && (
              <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
                <Pin className="w-3 h-3 text-amber-600" />
                <span>Pinned Announcement</span>
              </span>
            )}
          </div>

          <h1 className="font-cathedral text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-snug">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 pt-2 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#0171bb]/10 text-[#0171bb] flex items-center justify-center font-bold text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-slate-800">{post.author}</span>
                {post.authorRole && (
                  <span className="text-slate-500 ml-1">({post.authorRole})</span>
                )}
              </div>
            </div>

            <span className="text-slate-300 hidden sm:inline">•</span>

            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{post.publishDate || post.createdDate}</span>
            </div>

            {post.readTime && (
              <>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{post.readTime}</span>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Hero Featured Image */}
        {post.featuredImage && (
          <div className="rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-950 max-h-[460px]">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover max-h-[460px]"
            />
          </div>
        )}

        {/* Lead Summary Excerpt */}
        {post.summary && (
          <div className="p-5 rounded-2xl bg-blue-50/70 border-l-4 border-[#0171bb] text-slate-800 text-sm sm:text-base font-medium leading-relaxed italic">
            "{post.summary}"
          </div>
        )}

        {/* Article Body */}
        <div className="space-y-5 text-sm sm:text-base text-slate-700 leading-relaxed font-sans pt-2">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, idx) => (
              <p key={idx} className="leading-relaxed">
                {p}
              </p>
            ))
          ) : (
            <p>{post.body}</p>
          )}
        </div>

        {/* Tags Section */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-6 border-t border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Related Topics & Tags</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {post.tags.map((tag, idx) => (
                <Link
                  key={idx}
                  to={`/news?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#0171bb] text-slate-700 text-xs font-medium transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Parish Support & Actions Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4 my-8">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Immaculate Conception Cathedral Parish</span>
          </div>
          <h3 className="font-cathedral text-xl sm:text-2xl font-bold">
            Participate in our Parish Sacramental and Pastoral Life
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            Light a virtual prayer candle at Our Lady's Grotto, submit mass intentions, or support our Caritas and parish ministries.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={openCandleModal}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
            >
              Light a Prayer Candle
            </button>
            <Link
              to="/contact?subject=Mass%20Intentions%20Request"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-sm transition-colors"
            >
              Offer Mass Intention
            </Link>
            <Link
              to="/contact"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
            >
              Parish Secretariat
            </Link>
          </div>
        </div>

      </article>

      {/* Related News & Announcements Section */}
      {fallbackRelated.length > 0 && (
        <section className="bg-slate-100/80 border-t border-slate-200 py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-cathedral text-xl sm:text-2xl font-bold text-slate-900">
                  More Cathedral News & Announcements
                </h2>
                <p className="text-xs text-slate-600">
                  Pastoral letters, announcements, and faith stories from our community.
                </p>
              </div>

              <Link
                to="/news"
                className="text-[#0171bb] hover:text-[#015f9e] font-bold text-xs flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {fallbackRelated.map((related) => (
                <Link
                  key={related.id}
                  to={`/news/${related.slug}`}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-[#0171bb]/40 transition-all flex flex-col justify-between group"
                >
                  <div className="h-40 bg-slate-100 overflow-hidden relative">
                    <img
                      src={related.featuredImage}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-blue-200 text-[10px] font-bold">
                      {related.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-[#0171bb] font-bold">
                        {related.publishDate || related.createdDate}
                      </div>
                      <h3 className="font-cathedral text-sm font-bold text-slate-900 group-hover:text-[#0171bb] transition-colors line-clamp-2 leading-snug">
                        {related.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {related.summary}
                      </p>
                    </div>

                    <div className="pt-2 text-xs font-bold text-[#0171bb] flex items-center gap-1 group-hover:underline">
                      <span>Read announcement</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
