import { BlogPost } from '../types';
import { NEWS_ARTICLES } from '../data/cathedralData';

const STORAGE_KEY = 'cathedral_posts_cms';
const POSTS_CHANGE_EVENT = 'cathedral_posts_changed';

// Initial posts seeded from cathedralData with full blog post properties
const INITIAL_POSTS: BlogPost[] = [
  ...NEWS_ARTICLES.map((article, idx) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    featuredImage: article.image,
    category: article.category as BlogPost['category'],
    body: Array.isArray(article.content) ? article.content.join('\n\n') : (article.content as any) || '',
    author: article.author,
    authorRole: article.authorRole,
    status: 'published' as const,
    publishDate: '2026-08-01',
    createdDate: '2026-07-20',
    updatedDate: '2026-08-01',
    tags: article.tags || [],
    isPinned: article.isPinned,
    readTime: article.readTime || '3 min read',
  })),
  // Sample Draft Post to showcase CMS draft capabilities
  {
    id: 'draft-simbang-gabi-schedule-2026',
    title: '[DRAFT] 2026 Simbang Gabi & Misa de Gallo Liturgical Schedule & Choir Roster',
    slug: 'draft-simbang-gabi-schedule-2026',
    summary: 'Preliminary announcement draft for the upcoming December dawn and anticipated nine-day Novena Masses leading to the Nativity of our Lord.',
    featuredImage: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=800',
    category: 'Liturgical',
    body: 'The Cathedral Liturgical Committee is finalizing the schedule for the 2026 Simbang Gabi Novena Masses.\n\nAnticipated Evening Masses: 8:00 PM (December 15–23)\nDawn Masses (Misa de Gallo): 4:30 AM (December 16–24)\n\nChoirs and ministries are requested to confirm their designated schedules with the Liturgy Commission.',
    author: 'Liturgical Commission Secretariat',
    authorRole: 'Cathedral Office',
    status: 'draft',
    publishDate: '2026-11-15',
    createdDate: '2026-08-25',
    updatedDate: '2026-08-28',
    tags: ['Simbang Gabi', 'Advent', 'Liturgy', 'Christmas'],
    readTime: '2 min read',
  },
  {
    id: 'draft-youth-recollection-october',
    title: '[DRAFT] Diocesan Youth Jubilee Recollection & Leadership Camp',
    slug: 'draft-youth-recollection-camp',
    summary: 'A weekend of prayer, praise and worship, and pastoral leadership formation for all parish youth leaders across the Vicariates.',
    featuredImage: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
    category: 'Youth Spotlight',
    body: 'Join the Parish Youth Ministry for a 2-day spirit-filled recollection at the Cathedral Parish Center Grand Hall.\n\nTheme: "Pilgrims of Hope in Christ"\nGuest Speakers: Diocesan Youth Chaplains and inspirational speakers.\n\nRegistration fee covers food and camp kits. Subsidies available for students.',
    author: 'Bro. John Paul Ramirez',
    authorRole: 'PYM Coordinator',
    status: 'draft',
    publishDate: '2026-09-15',
    createdDate: '2026-08-26',
    updatedDate: '2026-08-29',
    tags: ['Youth', 'Recollection', 'Formation', 'Jubilee'],
    readTime: '3 min read',
  },
];

/**
 * Service / Data Layer for News & Parish Announcements CMS
 * Prepares the app for seamless future Netlify Database / REST API integration
 */
class PostService {
  private getStorage(): BlogPost[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load posts from storage:', e);
    }
    // Initialize storage if empty
    this.saveStorage(INITIAL_POSTS);
    return INITIAL_POSTS;
  }

  private saveStorage(posts: BlogPost[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
      // Dispatch event to notify listeners (subscribers, components)
      window.dispatchEvent(new CustomEvent(POSTS_CHANGE_EVENT, { detail: posts }));
    } catch (e) {
      console.error('Failed to save posts to storage:', e);
    }
  }

  /**
   * Returns all posts (both published and drafts) - for Admin / CMS users
   */
  getAllPosts(): BlogPost[] {
    return this.getStorage();
  }

  /**
   * Returns published posts only - for Public-facing pages
   */
  getPublishedPosts(): BlogPost[] {
    return this.getStorage().filter(post => post.status === 'published');
  }

  /**
   * Get single post by ID
   */
  getPostById(id: string): BlogPost | undefined {
    return this.getStorage().find(post => post.id === id);
  }

  /**
   * Get single post by Slug
   */
  getPostBySlug(slug: string): BlogPost | undefined {
    return this.getStorage().find(post => post.slug === slug);
  }

  /**
   * Create a new post
   */
  createPost(newPostData: Omit<BlogPost, 'id' | 'createdDate' | 'updatedDate'>): BlogPost {
    const posts = this.getStorage();
    const now = new Date().toISOString().split('T')[0];
    const newPost: BlogPost = {
      ...newPostData,
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdDate: now,
      updatedDate: now,
      slug: newPostData.slug || this.generateSlug(newPostData.title),
      readTime: newPostData.readTime || `${Math.max(1, Math.ceil(newPostData.body.split(/\s+/).length / 200))} min read`,
    };

    const updated = [newPost, ...posts];
    this.saveStorage(updated);
    return newPost;
  }

  /**
   * Update an existing post
   */
  updatePost(id: string, updates: Partial<BlogPost>): BlogPost | null {
    const posts = this.getStorage();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return null;

    const now = new Date().toISOString().split('T')[0];
    const updatedPost: BlogPost = {
      ...posts[index],
      ...updates,
      updatedDate: now,
    };

    if (updates.body && !updates.readTime) {
      updatedPost.readTime = `${Math.max(1, Math.ceil(updatedPost.body.split(/\s+/).length / 200))} min read`;
    }

    posts[index] = updatedPost;
    this.saveStorage(posts);
    return updatedPost;
  }

  /**
   * Publish a draft post
   */
  publishPost(id: string): BlogPost | null {
    const now = new Date().toISOString().split('T')[0];
    return this.updatePost(id, { 
      status: 'published', 
      publishDate: now,
      updatedDate: now 
    });
  }

  /**
   * Unpublish a post (set to draft)
   */
  unpublishPost(id: string): BlogPost | null {
    const now = new Date().toISOString().split('T')[0];
    return this.updatePost(id, { 
      status: 'draft',
      updatedDate: now 
    });
  }

  /**
   * Delete a post
   */
  deletePost(id: string): boolean {
    const posts = this.getStorage();
    const filtered = posts.filter(p => p.id !== id);
    if (filtered.length === posts.length) return false;
    this.saveStorage(filtered);
    return true;
  }

  /**
   * Subscribe to post updates across components
   */
  subscribe(callback: (posts: BlogPost[]) => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<BlogPost[]>;
      callback(customEvent.detail || this.getStorage());
    };
    window.addEventListener(POSTS_CHANGE_EVENT, handler);
    return () => window.removeEventListener(POSTS_CHANGE_EVENT, handler);
  }

  /**
   * Helper to generate URL-friendly slug
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Reset to initial defaults
   */
  resetToDefaults(): BlogPost[] {
    this.saveStorage(INITIAL_POSTS);
    return INITIAL_POSTS;
  }
}

export const postService = new PostService();
