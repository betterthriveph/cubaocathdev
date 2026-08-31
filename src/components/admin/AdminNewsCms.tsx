import React, { useState, useEffect } from 'react';
import { BlogPost, ParishEvent, UserRole } from '../../types';
import { postService } from '../../services/postService';
import { eventService } from '../../services/eventService';
import { 
  Newspaper, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Share2, 
  FileText, 
  Sparkles, 
  Tag, 
  Image as ImageIcon, 
  User, 
  X, 
  Check, 
  AlertCircle, 
  ArrowUpRight,
  Send,
  RotateCcw,
  Pin,
  Calendar,
  MapPin,
  CalendarDays
} from 'lucide-react';

interface AdminNewsCmsProps {
  userRole: UserRole;
  currentUserName: string;
  showToast: (msg: string) => void;
}

const PRESET_IMAGES = [
  { name: 'Cathedral Facade', url: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=800' },
  { name: 'Sacred Altar & Cross', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800' },
  { name: 'Caritas Relief Outreach', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800' },
  { name: 'Holy Matrimony Nuptials', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800' },
  { name: 'Youth Ministry Gathering', url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800' },
  { name: 'Simbang Gabi Dawn Lights', url: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=800' },
  { name: 'Votive Prayer Candles', url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800' },
];

export const AdminNewsCms: React.FC<AdminNewsCmsProps> = ({
  userRole,
  currentUserName,
  showToast
}) => {
  // Mode: 'articles' or 'calendar'
  const [activeSubTab, setActiveSubTab] = useState<'articles' | 'calendar'>('articles');

  // ================= POSTS / ARTICLES STATE =================
  const [posts, setPosts] = useState<BlogPost[]>(() => postService.getAllPosts());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Post Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  // Post Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState<BlogPost['category']>('Announcements');
  const [formAuthor, setFormAuthor] = useState(currentUserName);
  const [formAuthorRole, setFormAuthorRole] = useState('Parish Communications');
  const [formSummary, setFormSummary] = useState('');
  const [formFeaturedImage, setFormFeaturedImage] = useState(PRESET_IMAGES[0].url);
  const [formBody, setFormBody] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);

  // ================= LITURGICAL CALENDAR / EVENTS STATE =================
  const [events, setEvents] = useState<ParishEvent[]>(() => eventService.getAllEvents());
  const [eventSearch, setEventSearch] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>('all');

  // Event Modals
  const [isEventEditorOpen, setIsEventEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ParishEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<ParishEvent | null>(null);

  // Event Form State
  const [evtTitle, setEvtTitle] = useState('');
  const [evtCategory, setEvtCategory] = useState<ParishEvent['category']>('Liturgical');
  const [evtDate, setEvtDate] = useState('2026-10-01');
  const [evtTime, setEvtTime] = useState('6:00 PM Mass');
  const [evtLocation, setEvtLocation] = useState('Main Cathedral Sanctuary');
  const [evtDescription, setEvtDescription] = useState('');
  const [evtImage, setEvtImage] = useState(PRESET_IMAGES[0].url);
  const [evtIsFeatured, setEvtIsFeatured] = useState(false);
  const [evtHighlightNote, setEvtHighlightNote] = useState('');

  // Subscriptions
  useEffect(() => {
    const unsubPosts = postService.subscribe((updated) => setPosts(updated));
    const unsubEvents = eventService.subscribe((updated) => setEvents(updated));
    return () => {
      unsubPosts();
      unsubEvents();
    };
  }, []);

  // Post Actions
  const openCreateModal = () => {
    setEditingPost(null);
    setFormTitle('');
    setFormSlug('');
    setFormCategory('Announcements');
    setFormAuthor(currentUserName);
    setFormAuthorRole(userRole === 'admin' ? 'Parish Secretariat' : 'Media Contributor');
    setFormSummary('');
    setFormFeaturedImage(PRESET_IMAGES[0].url);
    setFormBody('');
    setFormTags('Cubao Cathedral, Announcement');
    setFormIsPinned(false);
    setIsEditorOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormCategory(post.category);
    setFormAuthor(post.author);
    setFormAuthorRole(post.authorRole || 'Parish Communications');
    setFormSummary(post.summary);
    setFormFeaturedImage(post.featuredImage);
    setFormBody(post.body);
    setFormTags(post.tags.join(', '));
    setFormIsPinned(Boolean(post.isPinned));
    setIsEditorOpen(true);
  };

  const handleSavePost = (status: 'published' | 'draft') => {
    if (!formTitle.trim() || !formSummary.trim() || !formBody.trim()) {
      showToast('Please fill out Title, Summary, and Article Body.');
      return;
    }

    const tagsArray = formTags.split(',').map(t => t.trim()).filter(Boolean);
    const readTimeCalc = `${Math.max(1, Math.ceil(formBody.split(' ').length / 200))} min read`;
    const autoSlug = formSlug.trim() || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingPost) {
      postService.updatePost(editingPost.id, {
        title: formTitle,
        slug: autoSlug,
        category: formCategory,
        author: formAuthor,
        authorRole: formAuthorRole,
        summary: formSummary,
        featuredImage: formFeaturedImage,
        body: formBody,
        tags: tagsArray,
        isPinned: formIsPinned,
        readTime: readTimeCalc,
        status,
        publishDate: status === 'published' && editingPost.status === 'draft' ? new Date().toISOString().split('T')[0] : editingPost.publishDate,
      });
      showToast(`Article "${formTitle}" updated (${status.toUpperCase()})`);
    } else {
      postService.createPost({
        title: formTitle,
        slug: autoSlug,
        category: formCategory,
        author: formAuthor,
        authorRole: formAuthorRole,
        summary: formSummary,
        featuredImage: formFeaturedImage,
        body: formBody,
        tags: tagsArray,
        isPinned: formIsPinned,
        readTime: readTimeCalc,
        status,
        publishDate: new Date().toISOString().split('T')[0],
      });
      showToast(`New article created and ${status === 'published' ? 'PUBLISHED' : 'SAVED AS DRAFT'}`);
    }

    setIsEditorOpen(false);
  };

  const handleDeletePostConfirm = () => {
    if (!postToDelete) return;
    postService.deletePost(postToDelete.id);
    showToast(`Article deleted.`);
    setPostToDelete(null);
  };

  // Event Actions
  const openCreateEventModal = () => {
    setEditingEvent(null);
    setEvtTitle('');
    setEvtCategory('Liturgical');
    setEvtDate(new Date().toISOString().split('T')[0]);
    setEvtTime('6:00 PM');
    setEvtLocation('Main Cathedral Sanctuary');
    setEvtDescription('');
    setEvtImage(PRESET_IMAGES[0].url);
    setEvtIsFeatured(false);
    setEvtHighlightNote('');
    setIsEventEditorOpen(true);
  };

  const openEditEventModal = (evt: ParishEvent) => {
    setEditingEvent(evt);
    setEvtTitle(evt.title);
    setEvtCategory(evt.category);
    setEvtDate(evt.date);
    setEvtTime(evt.time);
    setEvtLocation(evt.location);
    setEvtDescription(evt.description);
    setEvtImage(evt.image);
    setEvtIsFeatured(Boolean(evt.isFeatured));
    setEvtHighlightNote(evt.highlightNote || '');
    setIsEventEditorOpen(true);
  };

  const handleSaveEvent = () => {
    if (!evtTitle.trim() || !evtDate || !evtDescription.trim()) {
      showToast('Please fill out Event Title, Date, and Description.');
      return;
    }

    if (editingEvent) {
      eventService.updateEvent(editingEvent.id, {
        title: evtTitle,
        category: evtCategory,
        date: evtDate,
        time: evtTime,
        location: evtLocation,
        description: evtDescription,
        image: evtImage,
        isFeatured: evtIsFeatured,
        highlightNote: evtHighlightNote,
      });
      showToast(`Parish Event "${evtTitle}" updated successfully!`);
    } else {
      eventService.createEvent({
        title: evtTitle,
        category: evtCategory,
        date: evtDate,
        time: evtTime,
        location: evtLocation,
        description: evtDescription,
        image: evtImage,
        isFeatured: evtIsFeatured,
        highlightNote: evtHighlightNote,
      });
      showToast(`New Parish Event added to Liturgical Calendar!`);
    }

    setIsEventEditorOpen(false);
  };

  const handleDeleteEventConfirm = () => {
    if (!eventToDelete) return;
    eventService.deleteEvent(eventToDelete.id);
    showToast(`Event removed from calendar.`);
    setEventToDelete(null);
  };

  // Filtered Posts
  const filteredPosts = posts.filter((p) => {
    const matchQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       p.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchQuery && matchStatus && matchCategory;
  });

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    const matchQuery = e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
                       e.description.toLowerCase().includes(eventSearch.toLowerCase()) ||
                       e.location.toLowerCase().includes(eventSearch.toLowerCase());
    const matchCat = eventCategoryFilter === 'all' || e.category === eventCategoryFilter;
    return matchQuery && matchCat;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0171bb] border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
            <Newspaper className="w-3 h-3" />
            <span>Communications & Liturgical Calendar CMS</span>
          </div>
          <h2 className="font-cathedral text-xl sm:text-2xl font-bold text-slate-900">
            News, Announcements & Event Calendar
          </h2>
          <p className="text-xs text-slate-600">
            Publish parish articles, pastoral circulars, and manage the Liturgical & Event Calendar displayed on <code>/news</code>.
          </p>
        </div>

        {/* CMS Mode Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSubTab('articles')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'articles'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#0171bb]" />
            <span>Articles & News ({posts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('calendar')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'calendar'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
            <span>Liturgical Calendar ({events.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: ARTICLES & NEWS POSTS CMS
          ========================================================================= */}
      {activeSubTab === 'articles' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search articles by title, author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#0171bb]"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-[#0171bb]"
              >
                <option value="all">All Statuses ({posts.length})</option>
                <option value="published">Published ({posts.filter(p => p.status === 'published').length})</option>
                <option value="draft">Drafts ({posts.filter(p => p.status === 'draft').length})</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-[#0171bb]"
              >
                <option value="all">All Categories</option>
                <option value="Announcements">Announcements</option>
                <option value="Pastoral Letters">Pastoral Letters</option>
                <option value="Parish Life">Parish Life</option>
                <option value="Youth Spotlight">Youth Spotlight</option>
                <option value="Social Action">Social Action</option>
                <option value="Feast Celebration">Feast Celebration</option>
                <option value="Liturgical">Liturgical</option>
              </select>
            </div>

            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Compose New Article</span>
            </button>
          </div>

          {/* Articles Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 pl-6">Article & Summary</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Author</th>
                    <th className="p-3.5">Status & Date</th>
                    <th className="p-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No articles match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 pl-6 max-w-md">
                          <div className="flex items-start gap-3">
                            <img
                              src={post.featuredImage}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 mt-0.5"
                            />
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                {post.isPinned && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[9px] flex items-center gap-0.5">
                                    <Pin className="w-2.5 h-2.5" /> Pinned
                                  </span>
                                )}
                                <span className="font-bold text-slate-900 text-xs hover:text-[#0171bb] cursor-pointer">
                                  {post.title}
                                </span>
                              </div>
                              <p className="text-slate-500 text-[11px] line-clamp-1">
                                {post.summary}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Slug: /{post.slug} • {post.readTime}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {post.category}
                          </span>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{post.author}</div>
                          <div className="text-[10px] text-slate-400">{post.authorRole}</div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase block w-fit mb-1 ${
                            post.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {post.status}
                          </span>
                          <span className="text-[10px] text-slate-500">{post.publishDate}</span>
                        </td>

                        <td className="p-3.5 pr-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(post)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="Edit Article"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPostToDelete(post)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title="Delete Article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: LITURGICAL & EVENT CALENDAR CMS (Requirement 2)
          ========================================================================= */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-6">
          
          {/* Calendar Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search events, locations, descriptions..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#0171bb]"
                />
              </div>

              {/* Category Filter */}
              <select
                value={eventCategoryFilter}
                onChange={(e) => setEventCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-[#0171bb]"
              >
                <option value="all">All Categories ({events.length})</option>
                <option value="Liturgical">Liturgical</option>
                <option value="Feast Celebration">Feast Celebration</option>
                <option value="Youth">Youth</option>
                <option value="Formation">Formation</option>
                <option value="Outreach">Outreach</option>
                <option value="Parish Assembly">Parish Assembly</option>
              </select>
            </div>

            <button
              onClick={openCreateEventModal}
              className="px-4 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Add Parish Event to Calendar</span>
            </button>
          </div>

          {/* Events Grid / Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                No calendar events match the current filter.
              </div>
            ) : (
              filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Event Banner */}
                    <div className="h-40 relative bg-slate-900 overflow-hidden">
                      <img
                        src={evt.image}
                        alt=""
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 text-amber-300 font-bold text-[10px] border border-amber-400/30">
                          {evt.category}
                        </span>
                      </div>
                      {evt.isFeatured && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-sm">
                            ★ Featured
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#0171bb]">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>{evt.date} • {evt.time}</span>
                        </div>
                        <h3 className="font-cathedral text-base font-bold text-slate-900 leading-tight">
                          {evt.title}
                        </h3>
                      </div>

                      <div className="flex items-start gap-1.5 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{evt.location}</span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {evt.description}
                      </p>

                      {evt.highlightNote && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                          <strong>Note:</strong> {evt.highlightNote}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {evt.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditEventModal(evt)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventToDelete(evt)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* =========================================================================
          MODAL 1: POST EDITOR (Create / Edit Article)
          ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-cathedral text-xl font-bold text-slate-900">
                  {editingPost ? 'Edit Parish Article' : 'Compose New Article'}
                </h3>
                <p className="text-xs text-slate-500">
                  Update article title, category, featured image, and markdown body.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Article Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Solemn Pontifical Mass for the Feast of the Immaculate Conception"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0171bb]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Announcements">Announcements</option>
                    <option value="Pastoral Letters">Pastoral Letters</option>
                    <option value="Parish Life">Parish Life</option>
                    <option value="Youth Spotlight">Youth Spotlight</option>
                    <option value="Social Action">Social Action</option>
                    <option value="Feast Celebration">Feast Celebration</option>
                    <option value="Liturgical">Liturgical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Author Name</label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Summary / Lead Paragraph *</label>
                <textarea
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Brief 1-2 sentence lead overview for article cards."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0171bb]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Featured Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formFeaturedImage}
                    onChange={(e) => setFormFeaturedImage(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Article Content (Markdown / Text) *</label>
                <textarea
                  rows={6}
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Write the full announcement or pastoral message here..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0171bb] font-sans"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0171bb]"
                  />
                  <span className="font-semibold text-slate-700">Pin to top of News section</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSavePost('draft')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSavePost('published')}
                className="px-5 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Publish Article Now
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EVENT EDITOR (Create / Edit Parish Event)
          ========================================================================= */}
      {isEventEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-cathedral text-xl font-bold text-slate-900">
                  {editingEvent ? 'Edit Liturgical Calendar Event' : 'Add Event to Liturgical Calendar'}
                </h3>
                <p className="text-xs text-slate-500">
                  This event will display immediately on <code>/news</code> (Liturgical Calendar tab) and homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEventEditorOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Event Title *</label>
                <input
                  type="text"
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  placeholder="e.g. Solemnity of the Immaculate Conception Pontifical Mass"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0171bb]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={evtCategory}
                    onChange={(e) => setEvtCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Liturgical">Liturgical</option>
                    <option value="Feast Celebration">Feast Celebration</option>
                    <option value="Youth">Youth</option>
                    <option value="Formation">Formation</option>
                    <option value="Outreach">Outreach</option>
                    <option value="Parish Assembly">Parish Assembly</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Event Date *</label>
                  <input
                    type="date"
                    value={evtDate}
                    onChange={(e) => setEvtDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Time / Schedule</label>
                  <input
                    type="text"
                    value={evtTime}
                    onChange={(e) => setEvtTime(e.target.value)}
                    placeholder="e.g. 6:00 PM – 8:00 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Location / Venue</label>
                <input
                  type="text"
                  value={evtLocation}
                  onChange={(e) => setEvtLocation(e.target.value)}
                  placeholder="e.g. Main Cathedral Sanctuary & East Courtyard"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Event Description *</label>
                <textarea
                  rows={3}
                  value={evtDescription}
                  onChange={(e) => setEvtDescription(e.target.value)}
                  placeholder="Details about presiders, plenary indulgence, choir, or participation guidelines..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0171bb]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Featured Image URL</label>
                <input
                  type="text"
                  value={evtImage}
                  onChange={(e) => setEvtImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Liturgical / Pastoral Highlight Note (Optional)</label>
                <input
                  type="text"
                  value={evtHighlightNote}
                  onChange={(e) => setEvtHighlightNote(e.target.value)}
                  placeholder="e.g. Plenary Indulgence granted under usual conditions."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={evtIsFeatured}
                    onChange={(e) => setEvtIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0171bb]"
                  />
                  <span className="font-semibold text-slate-700">Featured event highlight</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEventEditorOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEvent}
                className="px-5 py-2.5 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Event to Calendar</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modals */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-cathedral text-lg font-bold text-slate-900">Delete Article?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete <strong>"{postToDelete.title}"</strong>?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePostConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-cathedral text-lg font-bold text-slate-900">Remove Event?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to remove <strong>"{eventToDelete.title}"</strong> from the Liturgical Calendar?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEventConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white"
              >
                Remove from Calendar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
