export interface CollectionCourseItem {
  id: string | number;
  title: string;
  type?: 'Course' | 'Course/video/blog/learning path' | 'Video' | 'Learning Path' | 'Blog';
  provider?: string;
  imageUrl: string;
  duration?: string;
  addedAt?: string;
}

export interface LearningCollection {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
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
const WATCH_LATER_KEY = 'jio_learning_watch_later_v1';

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
    id: 'col_watch_later',
    title: 'Watch Later',
    description: 'Saved videos and courses to watch at a later time',
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
        duration: '3h 30m'
      },
      {
        id: 1,
        title: 'Environmental, social, and governance concerns',
        type: 'Course',
        provider: 'Video',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&q=80',
        duration: '2h 12m'
      }
    ],
    updatedAt: '2026-09-23',
    author: 'You'
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
        duration: '3h 30m'
      },
      {
        id: 'c-saved-2',
        title: 'learning process 1',
        type: 'Course/video/blog/learning path',
        provider: 'Internal',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&q=80',
        duration: '1h 45m'
      },
      {
        id: 1,
        title: 'Environmental, social, and governance concerns',
        type: 'Course',
        provider: 'Video',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&q=80',
        duration: '2h 12m'
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
        duration: '45m'
      },
      {
        id: 3,
        title: 'The demand for ESG',
        type: 'Course',
        provider: 'Video',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=300&fit=crop&q=80',
        duration: '1h 15m'
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
        duration: '2h 00m'
      },
      {
        id: 5,
        title: 'Benefits of a strong ESG program',
        type: 'Course',
        provider: 'Harvard ManageMentor',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=300&fit=crop&q=80',
        duration: '3h 10m'
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
        duration: '6h 15m'
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
        duration: '4h 00m'
      },
      {
        id: 5,
        title: 'Benefits of a strong ESG program',
        type: 'Course',
        provider: 'Harvard ManageMentor',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=300&fit=crop&q=80',
        duration: '3h 10m'
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
        duration: '1h 50m'
      }
    ],
    updatedAt: '2026-09-15',
    author: 'Priya Sharma'
  },
  {
    id: 'col_elearning',
    title: 'E-LEARNING',
    description: 'Core self-paced modules, interactive labs and certifications',
    isPublic: true,
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=300&fit=crop&q=80',
    courseIds: ['c-saved-2', 7],
    items: [
      {
        id: 'c-saved-2',
        title: 'learning process 1',
        type: 'Course',
        provider: 'Internal',
        imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=300&fit=crop&q=80',
        duration: '1h 45m'
      }
    ],
    updatedAt: '2026-09-10',
    author: 'Jio Digital Academy'
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

    // Ensure 'Watch Later' collection exists and is placed first
    let watchLaterCol = list.find(c => c.id === 'col_watch_later' || c.title.toLowerCase() === 'watch later');
    if (!watchLaterCol) {
      watchLaterCol = initialCollections[0];
      list = [watchLaterCol, ...list];
      this.saveCollections(list);
    } else {
      // Re-order to make sure Watch Later is at index 0
      list = [watchLaterCol, ...list.filter(c => c.id !== watchLaterCol!.id)];
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
      isPublic,
      coverImage: initialCourse?.imageUrl || randomImg,
      courseIds: initialCourse ? [initialCourse.id] : [],
      items: initialCourse ? [{
        id: initialCourse.id,
        title: initialCourse.title,
        type: 'Course',
        provider: initialCourse.provider || 'Online Course',
        imageUrl: initialCourse.imageUrl || randomImg,
        duration: '2h 00m'
      }] : [],
      updatedAt: new Date().toISOString().split('T')[0],
      author: 'You'
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
          duration: '2h 00m'
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

    // If toggled collection was 'col_watch_later', also sync watch later key
    if (collectionId === 'col_watch_later' || collectionName.toLowerCase() === 'watch later') {
      const wl = this.getWatchLater();
      const inWl = wl.some(id => String(id) === String(course.id));
      if (added && !inWl) {
        localStorage.setItem(WATCH_LATER_KEY, JSON.stringify([course.id, ...wl]));
      } else if (!added && inWl) {
        localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(wl.filter(id => String(id) !== String(course.id))));
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

  // Watch Later Queue
  getWatchLater(): (string | number)[] {
    try {
      const stored = localStorage.getItem(WATCH_LATER_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn(e);
    }
    return [];
  },

  addToWatchLater(courseId: string | number, courseInfo?: { title?: string; imageUrl?: string; provider?: string }): boolean {
    const list = this.getWatchLater();
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
      localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    // Also sync with col_watch_later in collections
    const allCols = this.getCollections();
    const watchLaterCol = allCols.find(c => c.id === 'col_watch_later' || c.title.toLowerCase() === 'watch later');
    if (watchLaterCol) {
      if (added) {
        if (!watchLaterCol.courseIds.some(cid => String(cid) === String(courseId))) {
          watchLaterCol.courseIds = [courseId, ...watchLaterCol.courseIds];
          watchLaterCol.items = [{
            id: courseId,
            title: courseInfo?.title || 'Saved Course',
            type: 'Course',
            provider: courseInfo?.provider || 'Video',
            imageUrl: courseInfo?.imageUrl || defaultCollectionImages[0],
            duration: '2h 12m'
          }, ...watchLaterCol.items.filter(item => String(item.id) !== String(courseId))];
        }
      } else {
        watchLaterCol.courseIds = watchLaterCol.courseIds.filter(cid => String(cid) !== String(courseId));
        watchLaterCol.items = watchLaterCol.items.filter(item => String(item.id) !== String(courseId));
      }
      this.saveCollections(allCols);
    }

    return added;
  },

  // Queries based on permissions & sharing
  getMyCollections(): LearningCollection[] {
    const all = this.getCollections();
    return all.filter(c => c.author === 'You' || c.isOwner === true || (!c.sharedWithMe && c.author === undefined));
  },

  getSharedCollections(): LearningCollection[] {
    const all = this.getCollections();
    return all.filter(c => c.sharedWithMe === true);
  },

  getPublicCollections(): LearningCollection[] {
    const all = this.getCollections();
    return all.filter(c => c.isPublic === true);
  },

  shareCollectionWithUser(collectionId: string, recipientName: string = 'Colleague'): void {
    const all = this.getCollections();
    const updated = all.map(c => {
      if (c.id === collectionId) {
        return {
          ...c,
          sharedWithMe: true,
          sharedBy: c.author === 'You' ? 'You' : (c.sharedBy || c.author || 'Colleague')
        };
      }
      return c;
    });
    this.saveCollections(updated);
  }
};
