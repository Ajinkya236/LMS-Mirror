export interface CollectionCourseItem {
  id: string | number;
  title: string;
  type?: 'Course' | 'Course/video/blog/learning path' | 'Video' | 'Learning Path' | 'Blog';
  provider?: string;
  imageUrl: string;
  duration?: string;
  addedAt?: string;
  isCompleted?: boolean;
  completedOn?: string;
}

export interface LearningCollection {
  id: string;
  title: string;
  description: string;
  isPublic?: boolean;
  coverImage?: string;
  courseIds: (string | number)[];
  items: CollectionCourseItem[];
  updatedAt: string;
  author?: string;
  isOwner?: boolean;
  sharedWithMe?: boolean;
  sharedBy?: string;
}

const STORAGE_KEY = 'jio_learning_collections_v1';
const LEARN_LATER_KEY = 'jio_learning_learn_later_v1';

const defaultCollectionImages = [
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=300&fit=crop&q=80'
];

const initialCollections: LearningCollection[] = [
  {
    id: 'col_learn_later',
    title: 'Learn Later',
    description: 'Saved courses and videos to learn at a later time',
    isPublic: false,
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=300&fit=crop&q=80',
    courseIds: ['c-saved-1', 1],
    items: [
      {
        id: 'c-saved-1',
        title: 'Jio Safety Day _ August 2026',
        type: 'Course',
        provider: 'LinkedIn Learning',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&q=80',
        duration: '3h 30m',
        isCompleted: false
      },
      {
        id: 1,
        title: 'Environmental, social, and governance concerns',
        type: 'Course',
        provider: 'Video',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&q=80',
        duration: '2h 12m',
        isCompleted: true,
        completedOn: '2026-09-10'
      }
    ],
    updatedAt: '2026-09-23',
    author: 'You'
  },
  {
    id: 'col_sample_shared',
    title: 'AI & Prompt Engineering Masterclass',
    description: 'A curated collection of industry-leading courses and labs on Generative AI, LLMs, and Prompt Engineering shared with you by Dr. Sarah Jenkins.',
    isPublic: false,
    isOwner: false,
    sharedWithMe: true,
    sharedBy: 'Dr. Sarah Jenkins (Lead AI Architect)',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=300&fit=crop&q=80',
    courseIds: ['c-ai-1', 'c-ai-2', 'c-ai-3'],
    items: [
      {
        id: 'c-ai-1',
        title: 'Fundamentals of Generative AI & Prompt Design',
        type: 'Course',
        provider: 'Jio Digital Academy',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=300&fit=crop&q=80',
        duration: '3h 15m',
        isCompleted: true,
        completedOn: '2026-08-15'
      },
      {
        id: 'c-ai-2',
        title: 'Building Autonomous AI Agents with LangChain',
        type: 'Course',
        provider: 'LinkedIn Learning',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=300&fit=crop&q=80',
        duration: '4h 30m',
        isCompleted: true,
        completedOn: '2026-09-02'
      },
      {
        id: 'c-ai-3',
        title: 'Enterprise LLM Security & Governance',
        type: 'Course',
        provider: 'Internal',
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=300&fit=crop&q=80',
        duration: '2h 45m',
        isCompleted: false
      }
    ],
    updatedAt: '2026-09-24',
    author: 'Dr. Sarah Jenkins (Lead AI Architect)'
  },
  {
    id: 'col_sample_shared_added',
    title: 'Cloud Native Architecture & Microservices',
    description: 'Advanced Cloud-Native design patterns, Kubernetes orchestration, and Distributed Microservices shared by Senior Architect Rajesh Kumar.',
    isPublic: false,
    isOwner: true,
    sharedWithMe: true,
    sharedBy: 'Rajesh Kumar (Senior Architect)',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=300&fit=crop&q=80',
    courseIds: ['c-cloud-1', 'c-cloud-2'],
    items: [
      {
        id: 'c-cloud-1',
        title: 'Kubernetes & Container Orchestration Masterclass',
        type: 'Course',
        provider: 'Jio Academy',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=300&fit=crop&q=80',
        duration: '5h 00m',
        isCompleted: true,
        completedOn: '2026-09-01'
      },
      {
        id: 'c-cloud-2',
        title: 'Designing Resilient Microservices with gRPC',
        type: 'Course',
        provider: 'Internal',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=300&fit=crop&q=80',
        duration: '3h 30m',
        isCompleted: false
      }
    ],
    updatedAt: '2026-09-25',
    author: 'Rajesh Kumar (Senior Architect)'
  },
  {
    id: 'col_saved',
    title: 'Saved',
    description: 'All saved courses and videos for quick access',
    isPublic: false,
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&q=80',
    courseIds: ['c-saved-1', 'c-saved-2', 1],
    items: [
      {
        id: 'c-saved-1',
        title: 'Jio Safety Day _ August 2026',
        type: 'Course',
        provider: 'LinkedIn Learning',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&q=80',
        duration: '3h 30m',
        isCompleted: false
      },
      {
        id: 'c-saved-2',
        title: 'learning process 1',
        type: 'Course/video/blog/learning path',
        provider: 'Internal',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&q=80',
        duration: '1h 45m',
        isCompleted: true,
        completedOn: '2026-07-20'
      },
      {
        id: 1,
        title: 'Environmental, social, and governance concerns',
        type: 'Course',
        provider: 'Video',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&q=80',
        duration: '2h 12m',
        isCompleted: false
      }
    ],
    updatedAt: '2026-09-23',
    author: 'You'
  },
  {
    id: 'col_liked',
    title: 'Liked',
    description: 'Favorite sessions and top-rated lessons',
    isPublic: false,
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=300&fit=crop&q=80',
    courseIds: [2, 3],
    items: [
      {
        id: 2,
        title: 'What is ESG?',
        type: 'Course',
        provider: 'Video',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=300&fit=crop&q=80',
        duration: '45m',
        isCompleted: true,
        completedOn: '2026-08-30'
      },
      {
        id: 3,
        title: 'The demand for ESG',
        type: 'Course',
        provider: 'Video',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=300&fit=crop&q=80',
        duration: '1h 15m',
        isCompleted: false
      }
    ],
    updatedAt: '2026-09-20',
    author: 'You'
  },
  {
    id: 'col_ay2324',
    title: 'AY_23-24 Learning Objectives',
    description: 'Mandatory milestones and executive development paths for 2023-2024',
    isPublic: true,
    isOwner: false,
    sharedWithMe: true,
    sharedBy: 'HR Academy',
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=300&fit=crop&q=80',
    courseIds: [4, 5],
    items: [
      {
        id: 4,
        title: 'Sustainable investing approaches',
        type: 'Course/video/blog/learning path',
        provider: 'Jio Academy',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=300&fit=crop&q=80',
        duration: '2h 00m',
        isCompleted: true,
        completedOn: '2026-06-12'
      },
      {
        id: 5,
        title: 'Benefits of a strong ESG program',
        type: 'Course',
        provider: 'Harvard ManageMentor',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=300&fit=crop&q=80',
        duration: '3h 10m',
        isCompleted: false
      }
    ],
    updatedAt: '2026-09-18',
    author: 'HR Academy'
  },
  {
    id: 'col_tech',
    title: 'Tech',
    description: 'collection for Tech trends, best practices, innovation practices',
    isPublic: true,
    isOwner: true,
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=300&fit=crop&q=80',
    courseIds: ['c-my-1'],
    items: [
      {
        id: 'c-my-1',
        title: 'Advanced React & TypeScript Masterclass',
        type: 'Course',
        provider: 'Internal',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=300&fit=crop&q=80',
        duration: '6h 15m',
        isCompleted: false
      }
    ],
    updatedAt: '2026-09-22',
    author: 'You'
  },
  {
    id: 'col_leadership_pvt',
    title: 'Strategic Leadership Mastery',
    description: 'Executive roadmap and frameworks curated by senior mentors',
    isPublic: false,
    isOwner: false,
    sharedWithMe: true,
    sharedBy: 'Alex Chen (Mentor)',
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=300&fit=crop&q=80',
    courseIds: ['c-hist-1', 5],
    items: [
      {
        id: 'c-hist-1',
        title: 'Design Thinking & Human Centric Innovation',
        type: 'Course',
        provider: 'LinkedIn Learning',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=300&fit=crop&q=80',
        duration: '4h 00m',
        isCompleted: true,
        completedOn: '2026-02-28'
      },
      {
        id: 5,
        title: 'Benefits of a strong ESG program',
        type: 'Course',
        provider: 'Harvard ManageMentor',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=300&fit=crop&q=80',
        duration: '3h 10m',
        isCompleted: false
      }
    ],
    updatedAt: '2026-09-21',
    author: 'Alex Chen'
  },
  {
    id: 'col_product',
    title: 'Product',
    description: 'Product thinking, user research, agile roadmapping and discovery',
    isPublic: true,
    isOwner: false,
    sharedWithMe: true,
    sharedBy: 'Priya Sharma (Lead)',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop&q=80',
    courseIds: [6],
    items: [
      {
        id: 6,
        title: 'Integrating ESG into corporate strategy',
        type: 'Course',
        provider: 'LinkedIn Learning',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop&q=80',
        duration: '1h 50m',
        isCompleted: false
      }
    ],
    updatedAt: '2026-09-15',
    author: 'Priya Sharma'
  }
];

export const collectionsService = {
  getCollections(): LearningCollection[] {
    let list: LearningCollection[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        list = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed reading collections from localStorage', e);
    }

    if (!list || list.length === 0) {
      this.saveCollections(initialCollections);
      return initialCollections;
    }

    // Merge any missing initial default collections into stored list so newly added samples show up
    let needsSave = false;
    initialCollections.forEach(initCol => {
      if (!list.some(c => c.id === initCol.id)) {
        list.push(initCol);
        needsSave = true;
      }
    });

    // Ensure 'Learn Later' collection exists and is placed first internally
    let learnLaterCol = list.find(c => c.id === 'col_learn_later' || c.id === 'col_watch_later' || c.title.toLowerCase() === 'learn later' || c.title.toLowerCase() === 'watch later');
    if (!learnLaterCol) {
      learnLaterCol = initialCollections[0];
      list = [learnLaterCol, ...list];
      needsSave = true;
    } else {
      // Sync title to Learn Later
      if (learnLaterCol.title !== 'Learn Later') {
        learnLaterCol.title = 'Learn Later';
        learnLaterCol.description = 'Saved courses and videos to learn at a later time';
        needsSave = true;
      }
      list = [learnLaterCol, ...list.filter(c => c.id !== learnLaterCol!.id)];
    }

    if (needsSave) {
      this.saveCollections(list);
    }

    return list;
  },

  saveCollections(collections: LearningCollection[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
      window.dispatchEvent(new CustomEvent('collections_updated'));
    } catch (e) {
      console.warn('Failed writing collections to localStorage', e);
    }
  },

  getCollectionById(id: string): LearningCollection | undefined {
    const list = this.getCollections();
    return list.find(c => c.id === id);
  },

  createCollection(title: string, description: string, isPublic: boolean = false, initialCourse?: { id: string | number; title: string; imageUrl?: string; provider?: string }): LearningCollection {
    const collections = this.getCollections();
    const randomImg = defaultCollectionImages[collections.length % defaultCollectionImages.length];
    
    const newCol: LearningCollection = {
      id: `col_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      isPublic: false,
      coverImage: initialCourse?.imageUrl || randomImg,
      courseIds: initialCourse ? [initialCourse.id] : [],
      items: initialCourse ? [{
        id: initialCourse.id,
        title: initialCourse.title,
        type: 'Course',
        provider: initialCourse.provider || 'Online Course',
        imageUrl: initialCourse.imageUrl || randomImg,
        duration: '2h 00m',
        isCompleted: false
      }] : [],
      updatedAt: new Date().toISOString().split('T')[0],
      author: 'You',
      isOwner: true
    };

    const updated = [...collections, newCol];
    this.saveCollections(updated);
    return newCol;
  },

  toggleCourseInCollection(collectionId: string, course: { id: string | number; title: string; imageUrl?: string; provider?: string }): { added: boolean; collectionName: string } {
    const collections = this.getCollections();
    let added = false;
    let collectionName = '';

    const updated = collections.map(col => {
      if (col.id !== collectionId) return col;
      collectionName = col.title;
      const exists = col.courseIds.some(cid => String(cid) === String(course.id));
      if (exists) {
        added = false;
        return {
          ...col,
          courseIds: col.courseIds.filter(cid => String(cid) !== String(course.id)),
          items: col.items.filter(item => String(item.id) !== String(course.id)),
          updatedAt: new Date().toISOString().split('T')[0]
        };
      } else {
        added = true;
        const newItem: CollectionCourseItem = {
          id: course.id,
          title: course.title,
          type: 'Course',
          provider: course.provider || 'Online Course',
          imageUrl: course.imageUrl || col.coverImage || defaultCollectionImages[0],
          duration: '2h 00m',
          isCompleted: false
        };
        return {
          ...col,
          courseIds: [...col.courseIds, course.id],
          items: [newItem, ...col.items],
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
    });

    this.saveCollections(updated);

    // If toggled collection was Learn Later, also sync learn later key
    if (collectionId === 'col_learn_later' || collectionId === 'col_watch_later' || collectionName.toLowerCase() === 'learn later' || collectionName.toLowerCase() === 'watch later') {
      const ll = this.getLearnLater();
      const inLl = ll.some(id => String(id) === String(course.id));
      if (added && !inLl) {
        localStorage.setItem(LEARN_LATER_KEY, JSON.stringify([course.id, ...ll]));
      } else if (!added && inLl) {
        localStorage.setItem(LEARN_LATER_KEY, JSON.stringify(ll.filter(id => String(id) !== String(course.id))));
      }
    }

    return { added, collectionName };
  },

  isCourseInCollection(collectionId: string, courseId: string | number): boolean {
    const col = this.getCollectionById(collectionId);
    if (!col) return false;
    return col.courseIds.some(cid => String(cid) === String(courseId));
  },

  deleteCollection(collectionId: string): void {
    const collections = this.getCollections();
    const updated = collections.filter(c => c.id !== collectionId);
    this.saveCollections(updated);
  },

  updateCollection(collectionId: string, updates: Partial<LearningCollection>): void {
    const collections = this.getCollections();
    const updated = collections.map(c => c.id === collectionId ? { ...c, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : c);
    this.saveCollections(updated);
  },

  // Learn Later Queue
  getLearnLater(): (string | number)[] {
    try {
      const stored = localStorage.getItem(LEARN_LATER_KEY) || localStorage.getItem('jio_learning_watch_later_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn(e);
    }
    return [];
  },

  // Alias for backward compatibility
  getWatchLater(): (string | number)[] {
    return this.getLearnLater();
  },

  addToLearnLater(courseId: string | number, courseInfo?: { title?: string; imageUrl?: string; provider?: string }): boolean {
    const list = this.getLearnLater();
    const exists = list.some(id => String(id) === String(courseId));
    let added = false;
    let updated: (string | number)[];
    if (exists) {
      updated = list.filter(id => String(id) !== String(courseId));
      added = false;
    } else {
      updated = [courseId, ...list];
      added = true;
    }
    try {
      localStorage.setItem(LEARN_LATER_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    // Also sync with Learn Later collection
    const allCols = this.getCollections();
    const learnLaterCol = allCols.find(c => c.id === 'col_learn_later' || c.id === 'col_watch_later' || c.title.toLowerCase() === 'learn later' || c.title.toLowerCase() === 'watch later');
    if (learnLaterCol) {
      if (added) {
        if (!learnLaterCol.courseIds.some(cid => String(cid) === String(courseId))) {
          learnLaterCol.courseIds = [courseId, ...learnLaterCol.courseIds];
          learnLaterCol.items = [{
            id: courseId,
            title: courseInfo?.title || 'Saved Course',
            type: 'Course',
            provider: courseInfo?.provider || 'Video',
            imageUrl: courseInfo?.imageUrl || defaultCollectionImages[0],
            duration: '2h 12m',
            isCompleted: false
          }, ...learnLaterCol.items.filter(item => String(item.id) !== String(courseId))];
        }
      } else {
        learnLaterCol.courseIds = learnLaterCol.courseIds.filter(cid => String(cid) !== String(courseId));
        learnLaterCol.items = learnLaterCol.items.filter(item => String(item.id) !== String(courseId));
      }
      this.saveCollections(allCols);
    }

    return added;
  },

  // Alias for backward compatibility
  addToWatchLater(courseId: string | number, courseInfo?: { title?: string; imageUrl?: string; provider?: string }): boolean {
    return this.addToLearnLater(courseId, courseInfo);
  },

  removeFromLearnLater(courseId: string | number): void {
    const list = this.getLearnLater();
    const updated = list.filter(id => String(id) !== String(courseId));
    try {
      localStorage.setItem(LEARN_LATER_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    const allCols = this.getCollections();
    const learnLaterCol = allCols.find(c => c.id === 'col_learn_later' || c.id === 'col_watch_later' || c.title.toLowerCase() === 'learn later' || c.title.toLowerCase() === 'watch later');
    if (learnLaterCol) {
      learnLaterCol.courseIds = learnLaterCol.courseIds.filter(cid => String(cid) !== String(courseId));
      learnLaterCol.items = learnLaterCol.items.filter(item => String(item.id) !== String(courseId));
      this.saveCollections(allCols);
    }
  },

  // Queries based on permissions & sharing
  getMyCollections(): LearningCollection[] {
    const all = this.getCollections();
    // Exclude Learn Later collection from general Collections list!
    return all.filter(c => 
      c.id !== 'col_learn_later' && 
      c.id !== 'col_watch_later' && 
      c.title.toLowerCase() !== 'learn later' && 
      c.title.toLowerCase() !== 'watch later' &&
      (c.author === 'You' || c.isOwner === true || (!c.sharedWithMe && c.author === undefined))
    );
  },

  getSharedCollections(): LearningCollection[] {
    const all = this.getCollections();
    return all.filter(c => c.sharedWithMe === true && c.id !== 'col_learn_later' && c.id !== 'col_watch_later');
  },

  getPublicCollections(): LearningCollection[] {
    const all = this.getCollections();
    return all.filter(c => c.id !== 'col_learn_later' && c.id !== 'col_watch_later');
  },

  toggleSharedCollectionInMyCollections(collectionId: string): { isAdded: boolean; collection: LearningCollection } | null {
    const all = this.getCollections();
    const target = all.find(c => c.id === collectionId);
    if (!target) return null;

    const newOwnerState = !target.isOwner;

    const updated = all.map(c => {
      if (c.id === collectionId) {
        return {
          ...c,
          isOwner: newOwnerState,
          sharedWithMe: true, // Always remains accessible in Shared with me
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });

    this.saveCollections(updated);
    const updatedTarget: LearningCollection = { ...target, isOwner: newOwnerState, sharedWithMe: true };
    return { isAdded: newOwnerState, collection: updatedTarget };
  },

  addSharedCollectionToMyCollections(collectionId: string): LearningCollection | null {
    const res = this.toggleSharedCollectionInMyCollections(collectionId);
    return res ? res.collection : null;
  }
};

