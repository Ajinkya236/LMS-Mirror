/**
 * Learning Shorts Service
 * Manages Short video/photo content, moderation workflow, 
 * hybrid personalized recommendation algorithm, and creator profiles.
 */

export type ShortMediaType = 'video' | 'photo' | 'carousel';
export type ShortStatus = 'pending' | 'approved' | 'rejected';

export interface ShortAuthor {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  bio: string;
  email?: string;
}

export interface ShortItem {
  id: string;
  title: string;
  description: string;
  mediaType: ShortMediaType;
  mediaUrls: string[]; // 1 video URL, 1 photo URL, or up to 20 photo URLs
  thumbnailUrl?: string; // Auto-generated video thumbnail or custom uploaded image
  audioUrl?: string; // Optional audio for photo/carousel posts
  audioTitle?: string;
  author: ShortAuthor;
  tags: string[]; // Predefined + user-created learning tags
  pendingCustomTags?: string[]; // Custom tags awaiting approval from approver
  status: ShortStatus;
  rejectionReason?: string;
  createdAt: string;
  viewsCount: number;
  likesCount: number;
  sharesCount: number;
  durationSeconds?: number;
}

export interface ShortsRecommendationConfig {
  viewThresholdSeconds: number; // default 3 seconds
  maxVideoFileSizeMB: number; // default 100 MB
  maxAudioFileSizeMB: number; // default 25 MB
  maxCarouselPhotos: number; // default 20
  allowedVideoFormats: string[];
  allowedAudioFormats: string[];
  allowedPhotoFormats: string[];
  // Recommendation weights (sum to 1.0)
  itemItemCFWeight: number; // default 0.50 (Highest weight)
  contentBasedWeight: number; // default 0.30
  userUserCFWeight: number; // default 0.20
  predefinedTags: string[];
  forbiddenKeywords: string[];
}

const STORAGE_SHORTS_KEY = 'jio_learning_shorts_items_v1';
const STORAGE_CONFIG_KEY = 'jio_learning_shorts_config_v1';
const STORAGE_USER_LIKES_KEY = 'jio_learning_shorts_likes_v1';
const STORAGE_USER_FOLLOWS_KEY = 'jio_learning_shorts_follows_v1';
const STORAGE_USER_HISTORY_KEY = 'jio_learning_shorts_history_v1';

export const DEFAULT_SHORTS_CONFIG: ShortsRecommendationConfig = {
  viewThresholdSeconds: 3,
  maxVideoFileSizeMB: 100,
  maxAudioFileSizeMB: 25,
  maxCarouselPhotos: 20,
  allowedVideoFormats: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', '.mp4', '.webm', '.mov', '.mkv'],
  allowedAudioFormats: ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/aac', '.mp3', '.wav', '.m4a', '.ogg', '.aac'],
  allowedPhotoFormats: ['image/jpeg', 'image/png', 'image/webp', '.jpg', '.jpeg', '.png', '.webp'],
  itemItemCFWeight: 0.50, // Highest initial weight strategy
  contentBasedWeight: 0.30,
  userUserCFWeight: 0.20,
  predefinedTags: [
    '#CloudArchitecture',
    '#GenerativeAI',
    '#LeadershipSkills',
    '#SystemDesign',
    '#CyberSecurity',
    '#DevOpsPipeline',
    '#Telecom5G',
    '#ProductManagement',
    '#CustomerSuccess',
    '#SalesMastery',
    '#Microservices',
    '#DataEngineering'
  ],
  forbiddenKeywords: ['spam', 'abuse', 'offensive', 'leak', 'vulgar', 'hate', 'illegal']
};

export const INITIAL_CREATORS: Record<string, ShortAuthor> = {
  'u_sandeep': {
    id: 'u_sandeep',
    name: 'Sandeep Gupta',
    role: 'Principal Architect & Technical Fellow',
    department: 'Cloud & Distributed Systems',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80',
    bio: '15+ years architecting scalable telecom & cloud microservices. Passionate about mentoring next-gen engineering leads.'
  },
  'u_anika': {
    id: 'u_anika',
    name: 'Dr. Anika Singh',
    role: 'Lead AI Scientist',
    department: 'AI & Data Platforms',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80',
    bio: 'Specializing in LLM agent orchestration, RAG architectures, and ethical AI deployment for enterprise platforms.'
  },
  'u_rahul': {
    id: 'u_rahul',
    name: 'Rahul Verma',
    role: 'Senior Director of Product',
    department: 'Jio Digital Enterprise',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80',
    bio: 'Product strategist bridging user empathy, high-velocity delivery, and business metric impact.'
  },
  'u_priya': {
    id: 'u_priya',
    name: 'Priya Nambiar',
    role: 'DevSecOps & Platform Security Lead',
    department: 'Cyber Defense Center',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&q=80',
    bio: 'Securing cloud-native Kubernetes workloads, zero-trust perimeter, and container vulnerability pipelines.'
  },
  'u_ajinkya': {
    id: 'u_ajinkya',
    name: 'Ajinkya Patil',
    role: 'Head of Enterprise Customer Success',
    department: 'Client Engagement & Enablement',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&q=80',
    bio: 'Championing customer objection handling, enterprise deal retention, and value realization across Fortune 500 accounts.'
  },
  'u_current': {
    id: 'u_current',
    name: 'You (Learner)',
    role: 'Software Engineer',
    department: 'Platform Engineering',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80',
    bio: 'Continuous learner exploring Cloud, AI, and modern scalable system patterns.'
  }
};

const SEED_SHORTS: ShortItem[] = [
  {
    id: 'short_101',
    title: '5 Core Rules for Clean Microservices Design in 60s',
    description: 'Avoid distributed monolith traps! Here are the 5 domain boundaries, idempotency, and asynchronous event bus patterns we use at scale.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    ],
    author: INITIAL_CREATORS['u_sandeep'],
    tags: ['#SystemDesign', '#Microservices', '#CloudArchitecture'],
    status: 'approved',
    createdAt: '2026-09-21T10:30:00.000Z',
    viewsCount: 1420,
    likesCount: 384,
    sharesCount: 92,
    durationSeconds: 15
  },
  {
    id: 'short_102',
    title: 'How to Handle Customer Objections: The L.A.E.R. Framework',
    description: 'Listen, Acknowledge, Explore, and Respond. Watch how to diffuse aggressive client pushback in high-stakes sales conversations.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    ],
    author: INITIAL_CREATORS['u_ajinkya'],
    tags: ['#CustomerSuccess', '#SalesMastery', '#LeadershipSkills'],
    status: 'approved',
    createdAt: '2026-09-21T16:00:00.000Z',
    viewsCount: 1890,
    likesCount: 520,
    sharesCount: 110,
    durationSeconds: 15
  },
  {
    id: 'short_103',
    title: 'Understanding RAG vs Fine-Tuning: Quick Visual Guide',
    description: 'Swipe through this 4-step framework to know exactly when your team should choose Retrieval-Augmented Generation over Model Fine-Tuning.',
    mediaType: 'carousel',
    mediaUrls: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&h=1600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&h=1600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=900&h=1600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=900&h=1600&fit=crop&q=80'
    ],
    audioUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
    audioTitle: 'AI Tech Bites - Dr. Anika Singh',
    author: INITIAL_CREATORS['u_anika'],
    tags: ['#GenerativeAI', '#DataEngineering', '#SystemDesign'],
    status: 'approved',
    createdAt: '2026-09-22T08:15:00.000Z',
    viewsCount: 2150,
    likesCount: 612,
    sharesCount: 145,
    durationSeconds: 20
  },
  {
    id: 'short_104',
    title: '3 Executive Leadership Habits for High-Velocity Teams',
    description: 'How to replace 60-minute syncs with 5-minute async written memos and clear 2-way door decision frameworks.',
    mediaType: 'photo',
    mediaUrls: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&h=1600&fit=crop&q=80'
    ],
    audioUrl: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    audioTitle: 'Executive Voiceover - Rahul Verma',
    author: INITIAL_CREATORS['u_rahul'],
    tags: ['#LeadershipSkills', '#ProductManagement'],
    status: 'approved',
    createdAt: '2026-09-22T14:45:00.000Z',
    viewsCount: 980,
    likesCount: 247,
    sharesCount: 68,
    durationSeconds: 18
  },
  {
    id: 'short_105',
    title: 'Zero-Trust Container Security Checklist',
    description: 'Top security checks before pushing container images to production registries: non-root users, minimal base images, and secret scanning.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
    ],
    author: INITIAL_CREATORS['u_priya'],
    tags: ['#CyberSecurity', '#DevOpsPipeline', '#CloudArchitecture'],
    status: 'approved',
    createdAt: '2026-09-23T04:20:00.000Z',
    viewsCount: 810,
    likesCount: 195,
    sharesCount: 44,
    durationSeconds: 15
  },
  {
    id: 'short_106',
    title: '5G Network Slicing & Edge Compute Fundamentals',
    description: 'Learn how low-latency URLLC slices are dynamically partitioned in next-gen telecom infrastructures.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
    ],
    author: INITIAL_CREATORS['u_sandeep'],
    tags: ['#Telecom5G', '#SystemDesign', '#CloudArchitecture'],
    status: 'approved',
    createdAt: '2026-09-23T06:10:00.000Z',
    viewsCount: 1250,
    likesCount: 310,
    sharesCount: 88,
    durationSeconds: 15
  },
  {
    id: 'short_107',
    title: 'Building Enterprise RAG: Chunking & Hybrid Search Strategies',
    description: 'Why semantic embedding search fails on tabular and code data, and how BM25 sparse + dense retrieval fixes hallucinations.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
    ],
    author: INITIAL_CREATORS['u_anika'],
    tags: ['#GenerativeAI', '#DataEngineering', '#CloudArchitecture'],
    status: 'approved',
    createdAt: '2026-09-23T07:15:00.000Z',
    viewsCount: 1680,
    likesCount: 430,
    sharesCount: 97,
    durationSeconds: 22
  },
  {
    id: 'short_108',
    title: 'Negotiation Tactics: Anchor Pricing & Concession Matrix',
    description: 'Never drop your price without exchanging value! The 3-rule concession playbook for enterprise B2B sales leads.',
    mediaType: 'photo',
    mediaUrls: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&h=1600&fit=crop&q=80'
    ],
    audioUrl: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    audioTitle: 'Sales Masterclass - Ajinkya Patil',
    author: INITIAL_CREATORS['u_ajinkya'],
    tags: ['#SalesMastery', '#CustomerSuccess', '#LeadershipSkills'],
    status: 'approved',
    createdAt: '2026-09-23T08:00:00.000Z',
    viewsCount: 1120,
    likesCount: 290,
    sharesCount: 75,
    durationSeconds: 16
  },
  {
    id: 'short_109',
    title: 'Draft: Kubernetes Pod Autoscaling (HPA vs KEDA)',
    description: 'Comparison of CPU-based autoscaling vs event-driven queue metrics in cloud deployments.',
    mediaType: 'photo',
    mediaUrls: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&h=1600&fit=crop&q=80'
    ],
    author: INITIAL_CREATORS['u_current'],
    tags: ['#DevOpsPipeline', '#CloudArchitecture'],
    status: 'pending', // Pending Review by Content Manager
    createdAt: '2026-09-23T08:50:00.000Z',
    viewsCount: 0,
    likesCount: 0,
    sharesCount: 0,
    durationSeconds: 10
  }
];

class ShortsService {
  private shorts: ShortItem[] = [];
  private config: ShortsRecommendationConfig = DEFAULT_SHORTS_CONFIG;
  private likedShortIds: Set<string> = new Set();
  private followedCreatorIds: Set<string> = new Set(['u_anika']); // Default seed follow
  private viewedHistory: { shortId: string; watchedSeconds: number; timestamp: string; tags: string[] }[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedConfig = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (storedConfig) {
        this.config = { ...DEFAULT_SHORTS_CONFIG, ...JSON.parse(storedConfig) };
      }

      const storedShorts = localStorage.getItem(STORAGE_SHORTS_KEY);
      if (storedShorts) {
        this.shorts = JSON.parse(storedShorts);
      } else {
        this.shorts = SEED_SHORTS;
        this.saveShorts();
      }

      const storedLikes = localStorage.getItem(STORAGE_USER_LIKES_KEY);
      if (storedLikes) {
        this.likedShortIds = new Set(JSON.parse(storedLikes));
      }

      const storedFollows = localStorage.getItem(STORAGE_USER_FOLLOWS_KEY);
      if (storedFollows) {
        this.followedCreatorIds = new Set(JSON.parse(storedFollows));
      }

      const storedHistory = localStorage.getItem(STORAGE_USER_HISTORY_KEY);
      if (storedHistory) {
        this.viewedHistory = JSON.parse(storedHistory);
      }
    } catch (e) {
      console.error('Error loading shorts data:', e);
      this.shorts = SEED_SHORTS;
      this.config = DEFAULT_SHORTS_CONFIG;
    }
  }

  private saveShorts() {
    try {
      localStorage.setItem(STORAGE_SHORTS_KEY, JSON.stringify(this.shorts));
      window.dispatchEvent(new CustomEvent('jio_shorts_updated'));
    } catch (e) {
      console.error('Error saving shorts:', e);
    }
  }

  private saveLikes() {
    try {
      localStorage.setItem(STORAGE_USER_LIKES_KEY, JSON.stringify(Array.from(this.likedShortIds)));
    } catch (e) {
      console.error('Error saving likes:', e);
    }
  }

  private saveFollows() {
    try {
      localStorage.setItem(STORAGE_USER_FOLLOWS_KEY, JSON.stringify(Array.from(this.followedCreatorIds)));
      window.dispatchEvent(new CustomEvent('jio_shorts_follows_updated'));
    } catch (e) {
      console.error('Error saving follows:', e);
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem(STORAGE_USER_HISTORY_KEY, JSON.stringify(this.viewedHistory));
    } catch (e) {
      console.error('Error saving history:', e);
    }
  }

  // --- Configuration Management ---

  public getConfig(): ShortsRecommendationConfig {
    return { ...this.config };
  }

  public updateConfig(partial: Partial<ShortsRecommendationConfig>): ShortsRecommendationConfig {
    this.config = { ...this.config, ...partial };
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(this.config));
    window.dispatchEvent(new CustomEvent('jio_shorts_config_changed', { detail: this.config }));
    return this.config;
  }

  public resetConfigToDefaults(): ShortsRecommendationConfig {
    this.config = { ...DEFAULT_SHORTS_CONFIG };
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(this.config));
    window.dispatchEvent(new CustomEvent('jio_shorts_config_changed', { detail: this.config }));
    return this.config;
  }

  // --- Shorts Queries ---

  public getAllShorts(): ShortItem[] {
    return [...this.shorts];
  }

  public getApprovedShorts(): ShortItem[] {
    return this.shorts.filter(s => s.status === 'approved');
  }

  public getPendingShorts(): ShortItem[] {
    return this.shorts.filter(s => s.status === 'pending');
  }

  public getRejectedShorts(): ShortItem[] {
    return this.shorts.filter(s => s.status === 'rejected');
  }

  public getShortById(id: string): ShortItem | undefined {
    return this.shorts.find(s => s.id === id);
  }

  public getShortsByCreator(creatorIdOrName: string): { author: ShortAuthor; shorts: ShortItem[] } | null {
    const creatorShorts = this.shorts.filter(
      s => (s.author.id === creatorIdOrName || s.author.name.toLowerCase() === creatorIdOrName.toLowerCase()) && s.status === 'approved'
    );
    
    // Find author profile info
    let author = Object.values(INITIAL_CREATORS).find(
      c => c.id === creatorIdOrName || c.name.toLowerCase() === creatorIdOrName.toLowerCase()
    );

    if (!author && creatorShorts.length > 0) {
      author = creatorShorts[0].author;
    }

    if (!author) {
      return null;
    }

    return {
      author,
      shorts: creatorShorts
    };
  }

  public getCreatorProfile(creatorId: string): ShortAuthor | undefined {
    return Object.values(INITIAL_CREATORS).find(c => c.id === creatorId) || 
      this.shorts.find(s => s.author.id === creatorId)?.author;
  }

  // --- Creator Follow Management ---

  public isFollowingCreator(creatorId: string): boolean {
    return this.followedCreatorIds.has(creatorId);
  }

  public toggleFollowCreator(creatorId: string): { isFollowing: boolean; followersCount: number } {
    const isCurrentlyFollowing = this.followedCreatorIds.has(creatorId);
    if (isCurrentlyFollowing) {
      this.followedCreatorIds.delete(creatorId);
    } else {
      this.followedCreatorIds.add(creatorId);
    }
    this.saveFollows();
    return {
      isFollowing: !isCurrentlyFollowing,
      followersCount: this.getCreatorFollowersCount(creatorId)
    };
  }

  public getCreatorFollowersCount(creatorId: string): number {
    // Base seed follower numbers plus user follow state
    const baseMap: Record<string, number> = {
      'u_sandeep': 428,
      'u_anika': 892,
      'u_rahul': 315,
      'u_priya': 276,
      'u_ajinkya': 654,
      'u_current': 12
    };
    const base = baseMap[creatorId] || 85;
    return this.isFollowingCreator(creatorId) ? base + 1 : base;
  }

  // --- Search Shorts ---
  public searchShorts(query: string, tag?: string): ShortItem[] {
    const q = query.trim().toLowerCase();
    const approved = this.getApprovedShorts();

    return approved.filter(short => {
      const matchesTag = tag && tag !== 'All'
        ? short.tags.some(t => t.toLowerCase() === tag.toLowerCase())
        : true;

      if (!matchesTag) return false;
      if (!q) return true;

      const titleMatch = short.title.toLowerCase().includes(q);
      const descMatch = short.description.toLowerCase().includes(q);
      const authorMatch = short.author.name.toLowerCase().includes(q) || short.author.role.toLowerCase().includes(q) || short.author.department.toLowerCase().includes(q);
      const tagMatch = short.tags.some(t => t.toLowerCase().includes(q));

      return titleMatch || descMatch || authorMatch || tagMatch;
    });
  }

  // --- Hybrid Personalized Recommendation Algorithm ---
  /**
   * Generates a personalized ranking for each approved Short based on:
   * 1. Item-Item Collaborative Filtering (Highest Weight: 0.50 by default)
   * 2. Content-Based Tag Similarity (Weight: 0.30 by default)
   * 3. User-User Collaborative Filtering (Weight: 0.20 by default)
   */
  public getPersonalizedFeed(targetTag?: string): ShortItem[] {
    const approved = this.getApprovedShorts();
    if (approved.length === 0) return [];

    if (targetTag && targetTag !== 'All') {
      return approved.filter(s => s.tags.some(t => t.toLowerCase() === targetTag.toLowerCase()));
    }

    const { itemItemCFWeight, contentBasedWeight, userUserCFWeight } = this.config;

    // Collect user watched and liked tags
    const watchedTagsFrequency: Record<string, number> = {};
    const likedShorts = approved.filter(s => this.likedShortIds.has(s.id));
    
    // Aggregate user affinity from history and likes
    this.viewedHistory.forEach(h => {
      h.tags.forEach(t => {
        watchedTagsFrequency[t] = (watchedTagsFrequency[t] || 0) + 1;
      });
    });

    likedShorts.forEach(s => {
      s.tags.forEach(t => {
        watchedTagsFrequency[t] = (watchedTagsFrequency[t] || 0) + 2;
      });
    });

    const rankedShorts = approved.map(short => {
      // 1. Content-Based Score (0 to 1) based on tag match with user preferences
      let contentScore = 0;
      if (Object.keys(watchedTagsFrequency).length > 0) {
        const matchingTagsCount = short.tags.reduce((acc, t) => acc + (watchedTagsFrequency[t] || 0), 0);
        contentScore = Math.min(1.0, matchingTagsCount / 5);
      } else {
        contentScore = 0.5; // neutral baseline
      }

      // 2. Item-Item Collaborative Filtering Score (0 to 1)
      // High score if this item shares strong co-interaction signals with items user has liked
      let itemItemScore = 0;
      if (likedShorts.length > 0) {
        let coOccurrences = 0;
        likedShorts.forEach(liked => {
          // Tag overlap + creator proximity
          const commonTags = short.tags.filter(t => liked.tags.includes(t));
          if (commonTags.length > 0) coOccurrences += commonTags.length * 0.4;
          if (short.author.id === liked.author.id) coOccurrences += 0.3;
        });
        itemItemScore = Math.min(1.0, coOccurrences / Math.max(1, likedShorts.length));
      } else {
        // Fallback popularity ratio
        itemItemScore = Math.min(1.0, (short.likesCount * 2 + short.viewsCount * 0.1) / 800);
      }

      // 3. User-User Collaborative Filtering Score (0 to 1)
      // Simulation of cohort lookalike similarity
      const userUserScore = Math.min(1.0, (short.sharesCount * 1.5 + short.likesCount) / 500);

      // Weighted Total Score
      const totalScore = 
        (itemItemScore * itemItemCFWeight) +
        (contentScore * contentBasedWeight) +
        (userUserScore * userUserCFWeight);

      return {
        short,
        score: totalScore
      };
    });

    // Sort descending by calculated score
    rankedShorts.sort((a, b) => b.score - a.score);
    return rankedShorts.map(r => r.short);
  }

  // --- Interaction & Engagement ---

  public isShortLiked(shortId: string): boolean {
    return this.likedShortIds.has(shortId);
  }

  public isLiked(shortId: string): boolean {
    return this.likedShortIds.has(shortId);
  }

  public toggleLike(shortId: string): { isLiked: boolean; newCount: number } {
    const short = this.shorts.find(s => s.id === shortId);
    if (!short) return { isLiked: false, newCount: 0 };

    const wasLiked = this.likedShortIds.has(shortId);
    if (wasLiked) {
      this.likedShortIds.delete(shortId);
      short.likesCount = Math.max(0, short.likesCount - 1);
    } else {
      this.likedShortIds.add(shortId);
      short.likesCount += 1;
    }

    this.saveLikes();
    this.saveShorts();
    return {
      isLiked: !wasLiked,
      newCount: short.likesCount
    };
  }

  /**
   * Records a view only when consumed for >= threshold seconds
   */
  public recordView(shortId: string, durationWatchedSeconds: number): { counted: boolean; newCount: number } {
    const threshold = this.config.viewThresholdSeconds;
    const short = this.shorts.find(s => s.id === shortId);
    if (!short) return { counted: false, newCount: 0 };

    if (durationWatchedSeconds >= threshold) {
      short.viewsCount += 1;
      this.viewedHistory.push({
        shortId,
        watchedSeconds: durationWatchedSeconds,
        timestamp: new Date().toISOString(),
        tags: short.tags
      });
      // Keep recent 100 entries
      if (this.viewedHistory.length > 100) {
        this.viewedHistory = this.viewedHistory.slice(-100);
      }
      this.saveHistory();
      this.saveShorts();
      return { counted: true, newCount: short.viewsCount };
    }

    return { counted: false, newCount: short.viewsCount };
  }

  public recordShare(shortId: string): number {
    const short = this.shorts.find(s => s.id === shortId);
    if (!short) return 0;
    short.sharesCount += 1;
    this.saveShorts();
    return short.sharesCount;
  }

  // --- Learning Shorts Creation & Moderation ---

  /**
   * Validate custom tag against moderation rules
   */
  public validateTag(tag: string): { isValid: boolean; error?: string } {
    const cleaned = tag.trim().toLowerCase();
    if (!cleaned) {
      return { isValid: false, error: 'Tag cannot be empty' };
    }
    if (cleaned.length > 30) {
      return { isValid: false, error: 'Tag cannot exceed 30 characters' };
    }
    const hasForbidden = this.config.forbiddenKeywords.some(kw => cleaned.includes(kw));
    if (hasForbidden) {
      return { isValid: false, error: 'Tag contains prohibited words flagged by moderation policy' };
    }
    return { isValid: true };
  }

  /**
   * Submit a new short (enters 'pending' review)
   */
  public submitShort(data: {
    title: string;
    description: string;
    mediaType: ShortMediaType;
    mediaUrls: string[];
    audioUrl?: string;
    audioTitle?: string;
    tags: string[];
    author?: ShortAuthor;
  }): { success: boolean; short?: ShortItem; error?: string } {
    if (!data.title.trim()) {
      return { success: false, error: 'Title is required' };
    }
    if (!data.mediaUrls || data.mediaUrls.length === 0) {
      return { success: false, error: 'At least one media file is required' };
    }
    if (data.mediaType === 'carousel' && data.mediaUrls.length > this.config.maxCarouselPhotos) {
      return { success: false, error: `Maximum ${this.config.maxCarouselPhotos} photos allowed in carousel` };
    }

    // Validate all tags
    for (const tag of data.tags) {
      const val = this.validateTag(tag);
      if (!val.isValid) {
        return { success: false, error: `Invalid tag "${tag}": ${val.error}` };
      }
    }

    const newShort: ShortItem = {
      id: `short_${Date.now()}`,
      title: data.title.trim(),
      description: data.description.trim(),
      mediaType: data.mediaType,
      mediaUrls: data.mediaUrls,
      audioUrl: data.audioUrl,
      audioTitle: data.audioTitle || (data.audioUrl ? 'Original Sound' : undefined),
      author: data.author || INITIAL_CREATORS['u_current'],
      tags: data.tags.map(t => (t.startsWith('#') ? t : `#${t}`)),
      status: 'pending', // Moderation rule: enters Pending Review
      createdAt: new Date().toISOString(),
      viewsCount: 0,
      likesCount: 0,
      sharesCount: 0,
      durationSeconds: data.mediaType === 'video' ? 15 : 10
    };

    this.shorts.unshift(newShort);
    this.saveShorts();
    return { success: true, short: newShort };
  }

  // --- Creator Profile Management ---

  public updateCreatorProfile(creatorId: string, updates: Partial<ShortAuthor>): boolean {
    if (INITIAL_CREATORS[creatorId]) {
      INITIAL_CREATORS[creatorId] = {
        ...INITIAL_CREATORS[creatorId],
        ...updates
      };
    }
    // Also update author info across all shorts authored by this creator
    this.shorts.forEach(s => {
      if (s.author.id === creatorId) {
        s.author = {
          ...s.author,
          ...updates
        };
      }
    });
    this.saveShorts();
    window.dispatchEvent(new CustomEvent('jio_shorts_updated'));
    return true;
  }

  // --- Tag Management & Moderation ---

  public getPredefinedTags(): string[] {
    return [...this.config.predefinedTags];
  }

  public addPredefinedTag(tag: string): { success: boolean; error?: string } {
    let clean = tag.trim();
    if (!clean) return { success: false, error: 'Tag cannot be empty' };
    if (!clean.startsWith('#')) clean = `#${clean}`;

    const validation = this.validateTag(clean);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const exists = this.config.predefinedTags.some(t => t.toLowerCase() === clean.toLowerCase());
    if (exists) {
      return { success: false, error: `Tag "${clean}" already exists in enterprise tags` };
    }

    this.config.predefinedTags.push(clean);
    this.updateConfig({ predefinedTags: this.config.predefinedTags });
    return { success: true };
  }

  public removePredefinedTag(tag: string): boolean {
    const clean = tag.toLowerCase();
    const initialLen = this.config.predefinedTags.length;
    this.config.predefinedTags = this.config.predefinedTags.filter(t => t.toLowerCase() !== clean);
    if (this.config.predefinedTags.length !== initialLen) {
      this.updateConfig({ predefinedTags: this.config.predefinedTags });
      return true;
    }
    return false;
  }

  public bulkAddPredefinedTags(rawTags: string[]): {
    successCount: number;
    failureCount: number;
    report: { tag: string; status: 'success' | 'failed'; reason?: string }[];
  } {
    const report: { tag: string; status: 'success' | 'failed'; reason?: string }[] = [];
    let successCount = 0;
    let failureCount = 0;

    rawTags.forEach(raw => {
      let tag = raw.trim();
      if (!tag) return;
      if (!tag.startsWith('#')) tag = `#${tag}`;

      const validation = this.validateTag(tag);
      if (!validation.isValid) {
        failureCount++;
        report.push({ tag, status: 'failed', reason: validation.error || 'Invalid format' });
        return;
      }

      const exists = this.config.predefinedTags.some(t => t.toLowerCase() === tag.toLowerCase());
      if (exists) {
        failureCount++;
        report.push({ tag, status: 'failed', reason: 'Duplicate tag already in system' });
        return;
      }

      this.config.predefinedTags.push(tag);
      successCount++;
      report.push({ tag, status: 'success' });
    });

    if (successCount > 0) {
      this.updateConfig({ predefinedTags: this.config.predefinedTags });
    }

    return { successCount, failureCount, report };
  }

  public approveTagForShort(shortId: string, tagToApprove: string): boolean {
    let clean = tagToApprove.trim();
    if (!clean.startsWith('#')) clean = `#${clean}`;

    // Add to predefined tags if not already present
    this.addPredefinedTag(clean);

    const short = this.shorts.find(s => s.id === shortId);
    if (short && short.pendingCustomTags) {
      short.pendingCustomTags = short.pendingCustomTags.filter(t => t.toLowerCase() !== clean.toLowerCase());
      this.saveShorts();
    }
    return true;
  }

  public rejectTagForShort(shortId: string, tagToReject: string): boolean {
    const short = this.shorts.find(s => s.id === shortId);
    if (!short) return false;
    const clean = tagToReject.toLowerCase();
    short.tags = short.tags.filter(t => t.toLowerCase() !== clean);
    if (short.pendingCustomTags) {
      short.pendingCustomTags = short.pendingCustomTags.filter(t => t.toLowerCase() !== clean);
    }
    this.saveShorts();
    return true;
  }

  // --- Content Manager Moderation Actions ---

  public approveShort(shortId: string): boolean {
    const short = this.shorts.find(s => s.id === shortId);
    if (!short) return false;
    short.status = 'approved';
    delete short.rejectionReason;
    this.saveShorts();
    return true;
  }

  public rejectShort(shortId: string, reason: string): boolean {
    const short = this.shorts.find(s => s.id === shortId);
    if (!short) return false;
    short.status = 'rejected';
    short.rejectionReason = reason || 'Does not meet learning quality standards';
    this.saveShorts();
    return true;
  }

  public deleteShort(shortId: string): boolean {
    const initialLen = this.shorts.length;
    this.shorts = this.shorts.filter(s => s.id !== shortId);
    if (this.shorts.length !== initialLen) {
      this.saveShorts();
      return true;
    }
    return false;
  }
}

export const shortsService = new ShortsService();
