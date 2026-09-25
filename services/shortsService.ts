/**
 * Learning Shorts Service
 * Manages Short video/photo content, moderation workflow, 
 * hybrid personalized recommendation algorithm, and creator profiles.
 */

export type ShortMediaType = 'video' | 'photo' | 'carousel';
export type ShortStatus = 'pending' | 'approved' | 'rejected';

export interface ShortReport {
  id: string;
  shortId: string;
  reason: string;
  details?: string;
  reportedAt: string;
  reporterName: string;
  status: 'pending' | 'reviewed' | 'revoked' | 'dismissed';
}

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
  reportsCount?: number;
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

export const REPORT_REASONS = [
  "I don't like this content",
  "Unwanted content",
  "Self-injurious content",
  "Violent hate or exploitation",
  "Selling or promoting items",
  "Inappropriate content",
  "Scam, fraud, or spam",
  "False information",
  "Intellectual property"
] as const;

export type ReportReasonType = typeof REPORT_REASONS[number];

const STORAGE_SHORTS_KEY = 'jio_learning_shorts_items_v1';
const STORAGE_CONFIG_KEY = 'jio_learning_shorts_config_v1';
const STORAGE_USER_LIKES_KEY = 'jio_learning_shorts_likes_v1';
const STORAGE_USER_SAVED_KEY = 'jio_learning_shorts_saved_v1';
const STORAGE_USER_FOLLOWS_KEY = 'jio_learning_shorts_follows_v1';
const STORAGE_USER_HISTORY_KEY = 'jio_learning_shorts_history_v1';
const STORAGE_REPORTS_KEY = 'jio_learning_shorts_reports_v1';

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
    'CloudArchitecture',
    'GenerativeAI',
    'LeadershipSkills',
    'SystemDesign',
    'CyberSecurity',
    'DevOpsPipeline',
    'Telecom5G',
    'ProductManagement',
    'CustomerSuccess',
    'SalesMastery',
    'Microservices',
    'DataEngineering'
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
  },
  {
    id: 'short_110',
    title: 'Building Async Microservices with Rust & Tokio in 60s',
    description: 'Ultra high-throughput asynchronous actor model patterns for low-latency network gateways.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    ],
    author: INITIAL_CREATORS['u_current'],
    tags: ['#SystemDesign', '#RustLang', '#FastAPIHacks'], // Contains custom user-created tags not in enterprise list
    status: 'pending',
    createdAt: '2026-09-23T09:30:00.000Z',
    viewsCount: 0,
    likesCount: 0,
    sharesCount: 0,
    durationSeconds: 15
  },
  {
    id: 'short_111',
    title: 'PostgreSQL Indexing: B-Tree vs GIN in 60 Seconds',
    description: 'Stop scanning full tables! When to choose standard B-Tree for equality/range checks vs Generalized Inverted Indexes for JSONB and text search.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
    ],
    author: INITIAL_CREATORS['u_sandeep'],
    tags: ['SystemDesign', 'PostgreSQL', 'DataEngineering'],
    status: 'approved',
    createdAt: '2026-09-24T05:00:00.000Z',
    viewsCount: 3410,
    likesCount: 894,
    sharesCount: 210,
    durationSeconds: 15
  },
  {
    id: 'short_112',
    title: 'Kafka Partitioning Secrets: Avoid Hot Partitions & Consumer Lag',
    description: 'Why default hash partitioning causes stragglers in distributed streaming, and how custom partitioners preserve message ordering without hotspots.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
    ],
    author: INITIAL_CREATORS['u_sandeep'],
    tags: ['Kafka', 'SystemDesign', 'CloudArchitecture'],
    status: 'approved',
    createdAt: '2026-09-24T06:15:00.000Z',
    viewsCount: 2890,
    likesCount: 712,
    sharesCount: 165,
    durationSeconds: 15
  },
  {
    id: 'short_113',
    title: 'Few-Shot vs Chain-of-Thought Prompting: Visual Cheat Sheet',
    description: 'Comparing zero-shot, few-shot with exemplars, and step-by-step reasoning prompts for LLM accuracy on complex enterprise math and code tasks.',
    mediaType: 'carousel',
    mediaUrls: [
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&h=1600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&h=1600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=900&h=1600&fit=crop&q=80'
    ],
    audioUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
    audioTitle: 'Prompting Masterclass - Dr. Anika Singh',
    author: INITIAL_CREATORS['u_anika'],
    tags: ['GenerativeAI', 'PromptEngineering', 'AIArchitecture'],
    status: 'approved',
    createdAt: '2026-09-24T07:20:00.000Z',
    viewsCount: 4120,
    likesCount: 1105,
    sharesCount: 340,
    durationSeconds: 18
  },
  {
    id: 'short_114',
    title: 'Docker Distroless & Multi-Stage Builds: Drop Image Size by 85%',
    description: 'Say goodbye to bloated 1GB container images. See how building on Alpine and copying pure binaries to Google Distroless eliminates CVE attack surfaces.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    ],
    author: INITIAL_CREATORS['u_priya'],
    tags: ['DevOpsPipeline', 'CyberSecurity', 'CloudArchitecture'],
    status: 'approved',
    createdAt: '2026-09-24T08:10:00.000Z',
    viewsCount: 1980,
    likesCount: 520,
    sharesCount: 135,
    durationSeconds: 15
  },
  {
    id: 'short_115',
    title: 'Python AsyncIO vs Multiprocessing: When to Use What',
    description: 'Bypassing the GIL without burning CPU! The definitive guide to non-blocking I/O event loops versus process pools for CPU-bound computation.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    ],
    author: INITIAL_CREATORS['u_anika'],
    tags: ['Python', 'SoftwareEngineering', 'SystemDesign'],
    status: 'approved',
    createdAt: '2026-09-24T09:00:00.000Z',
    viewsCount: 2650,
    likesCount: 680,
    sharesCount: 142,
    durationSeconds: 15
  },
  {
    id: 'short_116',
    title: 'API Rate Limiting: Token Bucket vs Leaky Bucket vs Sliding Window',
    description: 'Handling DDoS traffic and API bursts gracefully. Visual comparison of Redis-backed distributed rate limiters across API gateways.',
    mediaType: 'carousel',
    mediaUrls: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&h=1600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&h=1600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=900&h=1600&fit=crop&q=80'
    ],
    audioUrl: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    audioTitle: 'Gateway Architecture - Sandeep Khurana',
    author: INITIAL_CREATORS['u_sandeep'],
    tags: ['SystemDesign', 'Microservices', 'CloudArchitecture'],
    status: 'approved',
    createdAt: '2026-09-24T09:45:00.000Z',
    viewsCount: 3100,
    likesCount: 780,
    sharesCount: 195,
    durationSeconds: 20
  },
  {
    id: 'short_117',
    title: 'Kubernetes Ingress vs Gateway API: Why Teams are Migrating',
    description: 'Role-oriented routing, cross-namespace HTTPRoutes, and native traffic splitting without vendor-specific ingress controller annotations.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
    ],
    author: INITIAL_CREATORS['u_priya'],
    tags: ['Kubernetes', 'CloudArchitecture', 'DevOpsPipeline'],
    status: 'approved',
    createdAt: '2026-09-24T10:30:00.000Z',
    viewsCount: 2240,
    likesCount: 590,
    sharesCount: 150,
    durationSeconds: 15
  },
  {
    id: 'short_118',
    title: 'Git Rebase vs Merge: The Golden Monorepo Strategy',
    description: 'Keep your git history bisect-friendly. When to use interactive squash rebasing for feature PRs and merge commits for main releases.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
    ],
    author: INITIAL_CREATORS['u_rahul'],
    tags: ['SoftwareEngineering', 'DevOpsPipeline', 'LeadershipSkills'],
    status: 'approved',
    createdAt: '2026-09-24T11:15:00.000Z',
    viewsCount: 1850,
    likesCount: 460,
    sharesCount: 90,
    durationSeconds: 15
  },
  {
    id: 'short_119',
    title: 'Event Sourcing & CQRS: When Traditional CRUD Fails at Scale',
    description: 'Separating read models from write models with immutable event ledgers for audit compliance and zero-lock financial transactions.',
    mediaType: 'carousel',
    mediaUrls: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=1600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&h=1600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=1600&fit=crop&q=80'
    ],
    audioUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
    audioTitle: 'Fintech Scale - Sandeep Khurana',
    author: INITIAL_CREATORS['u_sandeep'],
    tags: ['SystemDesign', 'CloudArchitecture', 'Microservices'],
    status: 'approved',
    createdAt: '2026-09-24T12:00:00.000Z',
    viewsCount: 2780,
    likesCount: 710,
    sharesCount: 180,
    durationSeconds: 20
  },
  {
    id: 'short_120',
    title: 'Product Discovery: 3 Questions Before Writing Any Code',
    description: 'What problem are we solving? How will we measure success? What is the cheapest way to invalidate our hypothesis this week?',
    mediaType: 'photo',
    mediaUrls: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&h=1600&fit=crop&q=80'
    ],
    audioUrl: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    audioTitle: 'Product Leadership - Rahul Verma',
    author: INITIAL_CREATORS['u_rahul'],
    tags: ['ProductStrategy', 'LeadershipSkills', 'CustomerSuccess'],
    status: 'approved',
    createdAt: '2026-09-24T12:45:00.000Z',
    viewsCount: 1540,
    likesCount: 395,
    sharesCount: 88,
    durationSeconds: 15
  },
  {
    id: 'short_121',
    title: 'GraphQL vs REST vs gRPC: The 2026 API Decision Guide',
    description: 'When to pick REST for public web hooks, gRPC for ultra-fast internal microservice RPCs, and GraphQL for client-driven frontend data fetching.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    ],
    author: INITIAL_CREATORS['u_sandeep'],
    tags: ['SystemDesign', 'CloudArchitecture', 'Microservices'],
    status: 'approved',
    createdAt: '2026-09-24T13:10:00.000Z',
    viewsCount: 2980,
    likesCount: 742,
    sharesCount: 184,
    durationSeconds: 15
  },
  {
    id: 'short_122',
    title: 'Redis as a Primary Database? 4 Real-World Tradeoffs',
    description: 'Can Redis replace PostgreSQL? Understanding AOF persistence, memory pricing limits, clustering shard limits, and transactional isolation.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    ],
    author: INITIAL_CREATORS['u_sandeep'],
    tags: ['Redis', 'DataEngineering', 'SystemDesign'],
    status: 'approved',
    createdAt: '2026-09-24T13:30:00.000Z',
    viewsCount: 3120,
    likesCount: 820,
    sharesCount: 205,
    durationSeconds: 15
  },
  {
    id: 'short_123',
    title: 'React 19 Server Components: Visual Data-Flow Explained',
    description: 'Swipe through to see how Server Components serialize virtual DOM trees to JSON-like flight streams without shipping client JavaScript bundles.',
    mediaType: 'carousel',
    mediaUrls: [
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900&h=1600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&h=1600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&h=1600&fit=crop&q=80'
    ],
    audioUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
    audioTitle: 'Modern Frontend Patterns - Dr. Anika Singh',
    author: INITIAL_CREATORS['u_anika'],
    tags: ['React', 'SoftwareEngineering', 'FrontendArchitecture'],
    status: 'approved',
    createdAt: '2026-09-24T14:00:00.000Z',
    viewsCount: 2450,
    likesCount: 630,
    sharesCount: 160,
    durationSeconds: 18
  },
  {
    id: 'short_124',
    title: '5 Hard Lessons from a 3-Hour Production Outage',
    description: 'A single unindexed query cascaded connection pool exhaustion. How connection timeouts, circuit breakers, and read replicas prevent system blackouts.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
    ],
    author: INITIAL_CREATORS['u_priya'],
    tags: ['DevOpsPipeline', 'SiteReliability', 'SystemDesign'],
    status: 'approved',
    createdAt: '2026-09-24T14:30:00.000Z',
    viewsCount: 4210,
    likesCount: 1190,
    sharesCount: 310,
    durationSeconds: 15
  },
  {
    id: 'short_125',
    title: 'LLM Evaluation at Scale: ROUGE, BLEU, and LLM-as-a-Judge',
    description: 'Automating enterprise prompt regressions: Why traditional n-gram metrics fail and how to build dual-agent LLM evaluation benchmarks.',
    mediaType: 'carousel',
    mediaUrls: [
      'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=900&h=1600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&h=1600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&h=1600&fit=crop&q=80'
    ],
    audioUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
    audioTitle: 'AI Research Dispatch - Dr. Anika Singh',
    author: INITIAL_CREATORS['u_anika'],
    tags: ['GenerativeAI', 'PromptEngineering', 'DataEngineering'],
    status: 'approved',
    createdAt: '2026-09-24T15:10:00.000Z',
    viewsCount: 3890,
    likesCount: 970,
    sharesCount: 240,
    durationSeconds: 20
  },
  {
    id: 'short_126',
    title: 'Zero-Downtime Database Migrations: Expand & Contract',
    description: 'Never drop columns in one migration! The 4-phase rollout: expand schema, dual-write in application layer, backfill data, and contract legacy columns.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
    ],
    author: INITIAL_CREATORS['u_sandeep'],
    tags: ['PostgreSQL', 'SystemDesign', 'DevOpsPipeline'],
    status: 'approved',
    createdAt: '2026-09-24T15:45:00.000Z',
    viewsCount: 2750,
    likesCount: 680,
    sharesCount: 155,
    durationSeconds: 15
  },
  {
    id: 'short_127',
    title: 'Design Systems at Scale: Token Architecture in 60s',
    description: 'Organizing semantic color, typography, and spacing tokens with style-dictionary for seamless sync across Figma, React, Android, and iOS.',
    mediaType: 'photo',
    mediaUrls: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=900&h=1600&fit=crop&q=80'
    ],
    audioUrl: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    audioTitle: 'UI Architecture - Rahul Verma',
    author: INITIAL_CREATORS['u_rahul'],
    tags: ['DesignSystems', 'FrontendArchitecture', 'ProductManagement'],
    status: 'approved',
    createdAt: '2026-09-24T16:15:00.000Z',
    viewsCount: 1980,
    likesCount: 512,
    sharesCount: 118,
    durationSeconds: 16
  },
  {
    id: 'short_128',
    title: 'Prometheus & Grafana: The 4 Golden Signals of Observability',
    description: 'Latency, Traffic, Errors, and Saturation. How Google SRE monitoring principles turn alert spam into actionable incident dashboards.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
    ],
    author: INITIAL_CREATORS['u_priya'],
    tags: ['DevOpsPipeline', 'SiteReliability', 'CloudArchitecture'],
    status: 'approved',
    createdAt: '2026-09-24T16:50:00.000Z',
    viewsCount: 3340,
    likesCount: 840,
    sharesCount: 192,
    durationSeconds: 22
  },
  {
    id: 'short_129',
    title: 'OAuth 2.1 & PKCE Flow for Single Page Applications',
    description: 'Why implicit grant tokens are obsolete in modern browser security. Visual step-by-step of Proof Key for Code Exchange with cryptographically secure verifiers.',
    mediaType: 'carousel',
    mediaUrls: [
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=900&h=1600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&h=1600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&h=1600&fit=crop&q=80'
    ],
    audioUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
    audioTitle: 'Cyber Security Brief - Priya Nambiar',
    author: INITIAL_CREATORS['u_priya'],
    tags: ['CyberSecurity', 'SoftwareEngineering', 'CloudArchitecture'],
    status: 'approved',
    createdAt: '2026-09-24T17:25:00.000Z',
    viewsCount: 2890,
    likesCount: 715,
    sharesCount: 178,
    durationSeconds: 19
  },
  {
    id: 'short_130',
    title: 'Active Listening in Engineering 1-on-1s: 3 Powerful Prompts',
    description: 'Move beyond status updates. Use these 3 coaching questions: What has felt energizing this week? Where are you blocked? What decision do you want feedback on?',
    mediaType: 'photo',
    mediaUrls: [
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&h=1600&fit=crop&q=80'
    ],
    audioUrl: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    audioTitle: 'Engineering Leadership - Rahul Verma',
    author: INITIAL_CREATORS['u_rahul'],
    tags: ['LeadershipSkills', 'Mentorship', 'CareerGrowth'],
    status: 'approved',
    createdAt: '2026-09-24T18:00:00.000Z',
    viewsCount: 2210,
    likesCount: 580,
    sharesCount: 145,
    durationSeconds: 15
  },
  {
    id: 'short_current_101',
    title: 'React Server Components & Streaming SSR in 60s',
    description: 'Master server-side streaming, React 19 action primitives, and zero-bundle server logic for high-performance enterprise web apps.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    ],
    author: INITIAL_CREATORS['u_current'],
    tags: ['CloudArchitecture', 'SystemDesign', 'DevOpsPipeline'],
    status: 'approved',
    createdAt: '2026-09-24T18:30:00.000Z',
    viewsCount: 3120,
    likesCount: 420,
    sharesCount: 95,
    durationSeconds: 15
  },
  {
    id: 'short_current_102',
    title: 'Zero-Trust API Security & OAuth 2.1 in 60 Seconds',
    description: 'Say goodbye to long-lived JWTs in local storage. Use PKCE code exchange, httpOnly refreshed cookies, and mutual TLS.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    ],
    author: INITIAL_CREATORS['u_current'],
    tags: ['CyberSecurity', 'CloudArchitecture', 'Microservices'],
    status: 'approved',
    createdAt: '2026-09-24T19:00:00.000Z',
    viewsCount: 2840,
    likesCount: 380,
    sharesCount: 78,
    durationSeconds: 15
  },
  {
    id: 'short_current_103',
    title: 'Kafka Event Streaming Architecture: 4 Visual Rules',
    description: 'Avoid consumer group lag! Partition keys, tombstone compaction, at-least-once idempotency, and dead-letter queue routing.',
    mediaType: 'photo',
    mediaUrls: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&h=1600&fit=crop&q=80'
    ],
    audioUrl: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    audioTitle: 'System Patterns - You',
    author: INITIAL_CREATORS['u_current'],
    tags: ['SystemDesign', 'Microservices', 'DataEngineering'],
    status: 'approved',
    createdAt: '2026-09-24T19:15:00.000Z',
    viewsCount: 1950,
    likesCount: 290,
    sharesCount: 64,
    durationSeconds: 12
  },
  {
    id: 'short_current_104',
    title: 'High-Scale Redis Caching: Cache-Aside vs Write-Through',
    description: 'When cache stampedes hit at 100k RPS, you need probabilistic early expiration or single-flight locking. Here is how in 60s.',
    mediaType: 'video',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
    ],
    author: INITIAL_CREATORS['u_current'],
    tags: ['SystemDesign', 'CloudArchitecture', 'DevOpsPipeline'],
    status: 'approved',
    createdAt: '2026-09-24T19:30:00.000Z',
    viewsCount: 4120,
    likesCount: 610,
    sharesCount: 132,
    durationSeconds: 15
  }
];

const SEED_REPORTS: ShortReport[] = [
  {
    id: 'rep_1',
    shortId: 'short_108',
    reason: 'Selling or promoting items',
    details: 'Video emphasizes third-party commercial software without enterprise discount approval.',
    reportedAt: '2026-09-23T14:20:00.000Z',
    reporterName: 'Vikram Joshi (Compliance Officer)',
    status: 'pending'
  },
  {
    id: 'rep_2',
    shortId: 'short_105',
    reason: 'Inappropriate content',
    details: 'Contains deprecated security keys syntax in slide 2 example.',
    reportedAt: '2026-09-23T16:45:00.000Z',
    reporterName: 'Sunita Menon (Infra Lead)',
    status: 'pending'
  }
];

class ShortsService {
  private shorts: ShortItem[] = [];
  private reports: ShortReport[] = [];
  private config: ShortsRecommendationConfig = DEFAULT_SHORTS_CONFIG;
  private likedShortIds: Set<string> = new Set();
  private savedShortIds: Set<string> = new Set(['short_101', 'short_103']); // Seed saved collection
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
      this.config.predefinedTags = this.config.predefinedTags.map(t => t.replace(/^#/, '').trim());

      const storedShorts = localStorage.getItem(STORAGE_SHORTS_KEY);
      if (storedShorts) {
        const parsed: ShortItem[] = JSON.parse(storedShorts);
        // Ensure newly added seed sample reels are available to the user
        const existingIds = new Set(parsed.map(s => s.id));
        const missingSeeds = SEED_SHORTS.filter(s => !existingIds.has(s.id));
        let merged = missingSeeds.length > 0 ? [...parsed, ...missingSeeds] : parsed;
        // Strip hashtags from all shorts
        merged.forEach(s => {
          s.tags = s.tags.map(t => t.replace(/^#/, '').trim());
        });
        this.shorts = merged;
        this.saveShorts();
      } else {
        this.shorts = SEED_SHORTS.map(s => ({
          ...s,
          tags: s.tags.map(t => t.replace(/^#/, '').trim())
        }));
        this.saveShorts();
      }

      const storedReports = localStorage.getItem(STORAGE_REPORTS_KEY);
      if (storedReports) {
        this.reports = JSON.parse(storedReports);
      } else {
        this.reports = SEED_REPORTS;
        this.saveReports();
      }

      const storedLikes = localStorage.getItem(STORAGE_USER_LIKES_KEY);
      if (storedLikes) {
        this.likedShortIds = new Set(JSON.parse(storedLikes));
      }

      const storedSaved = localStorage.getItem(STORAGE_USER_SAVED_KEY);
      if (storedSaved) {
        this.savedShortIds = new Set(JSON.parse(storedSaved));
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
      this.reports = SEED_REPORTS;
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

  private saveReports() {
    try {
      localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(this.reports));
      window.dispatchEvent(new CustomEvent('jio_shorts_reports_updated'));
    } catch (e) {
      console.error('Error saving reports:', e);
    }
  }

  private saveSaved() {
    try {
      localStorage.setItem(STORAGE_USER_SAVED_KEY, JSON.stringify(Array.from(this.savedShortIds)));
      window.dispatchEvent(new CustomEvent('jio_shorts_saved_updated'));
    } catch (e) {
      console.error('Error saving saved shorts:', e);
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

  // --- Saved / Bookmarks Collection ---

  public isShortSaved(shortId: string): boolean {
    return this.savedShortIds.has(shortId);
  }

  public toggleSaveShort(shortId: string): { isSaved: boolean; count: number } {
    const wasSaved = this.savedShortIds.has(shortId);
    if (wasSaved) {
      this.savedShortIds.delete(shortId);
    } else {
      this.savedShortIds.add(shortId);
    }
    this.saveSaved();
    return {
      isSaved: !wasSaved,
      count: this.savedShortIds.size
    };
  }

  public getSavedShorts(): ShortItem[] {
    return this.shorts.filter(s => this.savedShortIds.has(s.id) && s.status === 'approved');
  }

  public getSavedShortIds(): string[] {
    return Array.from(this.savedShortIds);
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

    // Validate all tags if provided
    if (data.tags && data.tags.length > 0) {
      if (data.tags.length > 10) {
        return { success: false, error: 'Maximum 10 topics allowed per reel' };
      }
      for (const tag of data.tags) {
        const val = this.validateTag(tag);
        if (!val.isValid) {
          return { success: false, error: `Invalid tag "${tag}": ${val.error}` };
        }
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
      tags: (data.tags || []).map(t => t.replace(/^#/, '').trim()),
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
    let clean = tag.replace(/^#/, '').trim();
    if (!clean) return { success: false, error: 'Tag cannot be empty' };

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
    const clean = tag.replace(/^#/, '').trim().toLowerCase();
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
      let tag = raw.replace(/^#/, '').trim();
      if (!tag) return;

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
    let clean = tagToApprove.replace(/^#/, '').trim();

    // Add to predefined tags if not already present
    this.addPredefinedTag(clean);

    const short = this.shorts.find(s => s.id === shortId);
    if (short) {
      if (!short.tags.some(t => t.toLowerCase() === clean.toLowerCase())) {
        short.tags.push(clean);
      }
      if (short.pendingCustomTags) {
        short.pendingCustomTags = short.pendingCustomTags.filter(t => t.toLowerCase() !== clean.toLowerCase());
      }
      this.saveShorts();
    }
    return true;
  }

  public rejectTagForShort(shortId: string, tagToReject: string): boolean {
    const short = this.shorts.find(s => s.id === shortId);
    if (!short) return false;
    const clean = tagToReject.replace(/^#/, '').trim().toLowerCase();
    short.tags = short.tags.filter(t => t.toLowerCase() !== clean);
    if (short.pendingCustomTags) {
      short.pendingCustomTags = short.pendingCustomTags.filter(t => t.toLowerCase() !== clean);
    }
    this.saveShorts();
    return true;
  }

  public revokeRejection(shortId: string): boolean {
    const short = this.shorts.find(s => s.id === shortId);
    if (!short) return false;
    short.status = 'approved';
    delete short.rejectionReason;
    this.saveShorts();
    return true;
  }

  // --- Content Reporting & Violation Management ---

  public reportShort(
    shortId: string,
    reason: string,
    details?: string,
    reporterName?: string
  ): ShortReport {
    const report: ShortReport = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      shortId,
      reason,
      details: details?.trim() || undefined,
      reportedAt: new Date().toISOString(),
      reporterName: reporterName || 'Anonymous Learner',
      status: 'pending'
    };

    this.reports.unshift(report);

    // Update short's reportsCount
    const short = this.shorts.find(s => s.id === shortId);
    if (short) {
      short.reportsCount = (short.reportsCount || 0) + 1;
      this.saveShorts();
    }

    this.saveReports();
    return report;
  }

  public getReports(): ShortReport[] {
    return [...this.reports];
  }

  public getReportsForShort(shortId: string): ShortReport[] {
    return this.reports.filter(r => r.shortId === shortId);
  }

  public getReportedShorts(): { short: ShortItem; reports: ShortReport[] }[] {
    const map = new Map<string, ShortReport[]>();
    this.reports.forEach(r => {
      const list = map.get(r.shortId) || [];
      list.push(r);
      map.set(r.shortId, list);
    });

    const result: { short: ShortItem; reports: ShortReport[] }[] = [];
    map.forEach((reports, shortId) => {
      const short = this.shorts.find(s => s.id === shortId);
      if (short) {
        result.push({ short, reports });
      }
    });

    return result;
  }

  public revokeShortWithReason(shortId: string, revokeReason: string): boolean {
    const short = this.shorts.find(s => s.id === shortId);
    if (!short) return false;
    short.status = 'rejected';
    short.rejectionReason = revokeReason || 'Content revoked following violation report review.';
    
    // Mark associated reports as revoked
    this.reports.forEach(r => {
      if (r.shortId === shortId) {
        r.status = 'revoked';
      }
    });

    this.saveReports();
    this.saveShorts();
    return true;
  }

  public dismissReportsForShort(shortId: string): boolean {
    this.reports.forEach(r => {
      if (r.shortId === shortId) {
        r.status = 'dismissed';
      }
    });
    
    const short = this.shorts.find(s => s.id === shortId);
    if (short) {
      short.reportsCount = 0;
      this.saveShorts();
    }

    this.saveReports();
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
