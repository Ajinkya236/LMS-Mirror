import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  ChevronDown, 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  Menu, 
  MoreHorizontal, 
  Bookmark, 
  Share2, 
  Trash2, 
  Play, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  User, 
  Info, 
  Plus, 
  ArrowLeft, 
  Edit3, 
  SlidersHorizontal,
  X,
  ListPlus
} from 'lucide-react';
import { collectionsService, LearningCollection, CollectionCourseItem } from '../services/collectionsService';
import SelectCollectionModal from '../components/SelectCollectionModal';
import CreateCollectionModal from '../components/CreateCollectionModal';
import CourseCard from '../components/CourseCard';
import CollectionCard from '../components/CollectionCard';
import ShareCollectionModal from '../components/ShareCollectionModal';

export interface MyLearningCourse {
  id: string | number;
  title: string;
  source: 'LinkedIn Learning' | 'Internal' | 'Coursera' | 'Harvard ManageMentor' | 'Jio Academy' | 'Video';
  trainingCategory: 'CLASSROOM' | 'ONLINE' | 'VIRTUAL' | 'SELF-PACED';
  category: 'Safety & Compliance' | 'Technical' | 'Process' | 'Leadership' | 'Marketing';
  savedDate: string;
  savedTimestamp: string;
  imageUrl: string;
  imageType?: 'safety' | 'process' | 'tech' | 'leadership';
  duration?: string;
  progress?: number;
  status: 'saved' | 'my-courses' | 'history' | 'shared';
  sharedBy?: string;
  completedDate?: string;
}

export const MyLearningPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Top sub-nav tab: Courses (active by default), Rewards, My Learning Goals, Events
  const [activeSubNav, setActiveSubNav] = useState<'Courses' | 'Rewards' | 'My Learning Goals' | 'Events'>('Courses');

  // Sub-Pills: My Courses | Collections (active by default) | Learn Later | Learning History | Shared with me
  const [activeTab, setActiveTab] = useState<'collections' | 'my-courses' | 'learn-later' | 'history' | 'shared'>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'my-courses' || tabParam === 'learn-later' || tabParam === 'history' || tabParam === 'shared') {
      return tabParam;
    }
    return 'collections'; // Default is Collections
  });

  // Selected Collection for Detail View
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(() => {
    return searchParams.get('collection') || null;
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainingCategory, setSelectedTrainingCategory] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL months');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');

  // Dropdowns & Modals state
  const [isTrainingCategoryOpen, setIsTrainingCategoryOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [activeMenuCourseId, setActiveMenuCourseId] = useState<string | number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Collections Store
  const [collections, setCollections] = useState<LearningCollection[]>(() => collectionsService.getCollections());
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [isSelectCollectionOpen, setIsSelectCollectionOpen] = useState(false);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<{ id: string | number; title: string; imageUrl?: string; provider?: string } | null>(null);
  
  // Edit collection state
  const [editingCollection, setEditingCollection] = useState<LearningCollection | null>(null);
  const [shareModalCollection, setShareModalCollection] = useState<LearningCollection | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setCollections(collectionsService.getCollections());
    };
    window.addEventListener('collections_updated', handleUpdate);
    return () => window.removeEventListener('collections_updated', handleUpdate);
  }, []);

  // Standard Courses Dataset
  const [courses, setCourses] = useState<MyLearningCourse[]>([
    {
      id: 'c-saved-1',
      title: 'Jio Safety Day _ August 2026',
      source: 'LinkedIn Learning',
      trainingCategory: 'CLASSROOM',
      category: 'Safety & Compliance',
      savedDate: '23-07-2026',
      savedTimestamp: '2026-07-23',
      imageType: 'safety',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&q=80',
      duration: '3h 30m',
      status: 'saved'
    },
    {
      id: 'c-saved-2',
      title: 'learning process 1',
      source: 'Internal',
      trainingCategory: 'ONLINE',
      category: 'Process',
      savedDate: '19-05-2025',
      savedTimestamp: '2025-05-19',
      imageType: 'process',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=300&fit=crop&q=80',
      duration: '1h 45m',
      status: 'saved'
    },
    {
      id: 'c-my-1',
      title: 'Advanced React & TypeScript Masterclass',
      source: 'Internal',
      trainingCategory: 'ONLINE',
      category: 'Technical',
      savedDate: '10-06-2026',
      savedTimestamp: '2026-06-10',
      imageType: 'tech',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=300&fit=crop&q=80',
      duration: '6h 15m',
      progress: 65,
      status: 'my-courses'
    },
    {
      id: 'c-my-2',
      title: 'Data Privacy & Enterprise Information Security',
      source: 'Internal',
      trainingCategory: 'CLASSROOM',
      category: 'Safety & Compliance',
      savedDate: '15-08-2026',
      savedTimestamp: '2026-08-15',
      imageType: 'safety',
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=300&fit=crop&q=80',
      duration: '2h 00m',
      progress: 30,
      status: 'my-courses'
    },
    {
      id: 'c-hist-1',
      title: 'Design Thinking & Human Centric Innovation',
      source: 'LinkedIn Learning',
      trainingCategory: 'ONLINE',
      category: 'Leadership',
      savedDate: '12-01-2025',
      savedTimestamp: '2025-01-12',
      completedDate: '28-02-2025',
      imageType: 'leadership',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=300&fit=crop&q=80',
      duration: '4h 00m',
      progress: 100,
      status: 'history'
    },
    {
      id: 'c-shared-1',
      title: 'Generative AI & Cloud Architecture Bootcamp',
      source: 'Coursera',
      trainingCategory: 'ONLINE',
      category: 'Technical',
      savedDate: '01-09-2026',
      savedTimestamp: '2026-09-01',
      sharedBy: 'Rohan Sharma (Team Lead)',
      imageType: 'tech',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop&q=80',
      duration: '8h 20m',
      status: 'shared'
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTabChange = (tab: 'collections' | 'my-courses' | 'learn-later' | 'history' | 'shared') => {
    setActiveTab(tab);
    setSelectedCollectionId(null);
    setSearchParams(tab === 'collections' ? {} : { tab });
  };

  const handleSelectCollection = (colId: string) => {
    setSelectedCollectionId(colId);
    setSearchParams({ tab: 'collections', collection: colId });
  };

  const handleBackToCollections = () => {
    setSelectedCollectionId(null);
    setSearchParams({ tab: 'collections' });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTrainingCategory('All');
    setSelectedCategory('All');
    setSelectedSource('All');
    setSelectedMonth('ALL months');
    setSortOrder('newest');
    showToast('Filters reset successfully');
  };

  // Course Actions
  const handleStartResume = (courseId: string | number) => {
    setActiveMenuCourseId(null);
    navigate(`/course/${courseId}`);
  };

  const handleOpenSaveToCollection = (course: { id: string | number; title: string; imageUrl?: string; provider?: string }) => {
    setSelectedCourseForModal(course);
    setActiveMenuCourseId(null);
    setIsSelectCollectionOpen(true);
  };

  const handleSaveToWatchLater = (course: { id: string | number; title: string }) => {
    setActiveMenuCourseId(null);
    const added = collectionsService.addToWatchLater(course.id);
    showToast(added ? 'Added to Watch Later' : 'Removed from Watch Later');
  };

  const handleShare = (title: string, path?: string) => {
    setActiveMenuCourseId(null);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(path ? `${window.location.origin}${path}` : window.location.href);
      showToast(`Link copied to clipboard!`);
    } else {
      showToast(`Link ready to share!`);
    }
  };

  const handleDeleteCollection = (colId: string, colTitle: string) => {
    collectionsService.deleteCollection(colId);
    setCollections(collectionsService.getCollections());
    setSelectedCollectionId(null);
    showToast(`Deleted collection "${colTitle}"`);
  };

  // Active Collection Data (if open)
  const currentCollection = useMemo(() => {
    if (!selectedCollectionId) return null;
    return collections.find(c => c.id === selectedCollectionId) || null;
  }, [collections, selectedCollectionId]);

  // Is viewing a shared collection
  const isViewingSharedCollection = currentCollection !== null && currentCollection.sharedWithMe === true;

  // Filtered collections for list (personal & created by user)
  const filteredCollections = useMemo(() => {
    const list = collectionsService.getMyCollections();
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q)
    );
  }, [collections, searchQuery]);

  // Filtered shared collections for 'Shared with me' tab
  const filteredSharedCollections = useMemo(() => {
    const sharedList = collectionsService.getSharedCollections();
    if (!searchQuery.trim()) return sharedList;
    const q = searchQuery.toLowerCase();
    return sharedList.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q)
    );
  }, [collections, searchQuery]);

  // Filtered Courses for standard tabs
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (course.status !== activeTab) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(q);
        const matchesId = String(course.id).toLowerCase().includes(q);
        const matchesSource = course.source.toLowerCase().includes(q);
        if (!matchesTitle && !matchesId && !matchesSource) return false;
      }

      if (selectedTrainingCategory !== 'All' && course.trainingCategory !== selectedTrainingCategory) {
        return false;
      }
      if (selectedCategory !== 'All' && course.category !== selectedCategory) {
        return false;
      }
      if (selectedSource !== 'All' && course.source !== selectedSource) {
        return false;
      }

      return true;
    });
  }, [courses, activeTab, searchQuery, selectedTrainingCategory, selectedCategory, selectedSource]);

  // Close menus when clicking outside
  const handleContainerClick = () => {
    if (activeMenuCourseId) setActiveMenuCourseId(null);
    if (isTrainingCategoryOpen) setIsTrainingCategoryOpen(false);
    if (isCategoryOpen) setIsCategoryOpen(false);
    if (isSourceOpen) setIsSourceOpen(false);
    if (isSortOpen) setIsSortOpen(false);
    if (isMonthOpen) setIsMonthOpen(false);
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-24" onClick={handleContainerClick}>
      
      {/* Sub-Header Navigation Bar: Courses | Rewards | My Learning Goals | Events */}
      {!isViewingSharedCollection && (
        <div className="bg-[#002B7F] text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 overflow-x-auto no-scrollbar py-3.5">
              {(['Courses', 'Rewards', 'My Learning Goals', 'Events'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveSubNav(tab);
                    if (tab === 'Events') navigate('/events');
                  }}
                  className={`text-sm font-semibold whitespace-nowrap transition-colors relative py-1 ${
                    activeSubNav === tab 
                      ? 'text-white font-bold after:content-[""] after:absolute after:bottom-[-6px] after:left-0 after:right-0 after:h-[3px] after:bg-white after:rounded-t-sm' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Secondary Filter Pills & View/Sort Actions Row */}
        {!isViewingSharedCollection && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Sub-Pills: My Courses (1st) | Learn Later (2nd) | My Collections (3rd) | Learning History (4th) | Shared with me (5th) */}
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
              
              {/* 1. My Courses */}
              <button
                onClick={() => handleTabChange('my-courses')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'my-courses'
                    ? 'bg-[#0a47d0] text-white shadow-md'
                    : 'bg-[#e9edf5] text-gray-700 hover:bg-[#dfe4ef]'
                }`}
              >
                My Courses
              </button>

              {/* 2. Learn Later */}
              <button
                onClick={() => handleTabChange('learn-later')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'learn-later'
                    ? 'bg-[#0a47d0] text-white shadow-md'
                    : 'bg-[#e9edf5] text-gray-700 hover:bg-[#dfe4ef]'
                }`}
              >
                Learn Later
              </button>

              {/* 3. My Collections */}
              <button
                onClick={() => handleTabChange('collections')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'collections'
                    ? 'bg-[#0052cc] text-white shadow-md ring-2 ring-[#0052cc]/30'
                    : 'bg-[#e9edf5] text-gray-700 hover:bg-[#dfe4ef]'
                }`}
              >
                My Collections
              </button>

              {/* 4. Learning History */}
              <button
                onClick={() => handleTabChange('history')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'bg-[#0a47d0] text-white shadow-md'
                    : 'bg-[#e9edf5] text-gray-700 hover:bg-[#dfe4ef]'
                }`}
              >
                Learning History
              </button>

              {/* 5. Shared with me */}
              <button
                onClick={() => handleTabChange('shared')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'shared'
                    ? 'bg-[#0a47d0] text-white shadow-md'
                    : 'bg-[#e9edf5] text-gray-700 hover:bg-[#dfe4ef]'
                }`}
              >
                Shared with me
              </button>
            </div>

            {/* Right Action Controls: View Toggle, Sort, Filter */}
            <div className="flex items-center gap-2.5 sm:gap-3 self-end md:self-auto">
              
              {/* View Mode Toggle */}
              <div className="bg-[#e9edf5] p-1 rounded-full flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="p-1.5 rounded-full bg-white text-gray-700 shadow-2xs hover:text-[#0a47d0] transition-colors"
                  title="Toggle View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSortOpen(!isSortOpen);
                  }}
                  className="px-4 py-2 bg-white hover:bg-gray-50 rounded-full border border-gray-300 text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  <span>Sort</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {isSortOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-up"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {['Date Added: Newest', 'Date Added: Oldest', 'Title: A to Z'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setIsSortOpen(false)}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter Pill Button */}
              <button
                onClick={() => showToast('Filters refreshed')}
                className="px-4 sm:px-5 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-full border border-gray-300 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-2xs transition-all"
              >
                <span>Filter</span>
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
              </button>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* VIEW 1: SINGLE COLLECTION DETAIL VIEW                                     */}
        {/* ------------------------------------------------------------------------- */}
        {(activeTab === 'collections' || activeTab === 'shared') && currentCollection ? (
          <div className="space-y-6 animate-fade-in">
            {/* Header: Back arrow (Only for personal collections) + Collection Title + Total Count + Right Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2 border-b border-gray-200 pb-4">
              <div className="flex items-start gap-3">
                {!isViewingSharedCollection && (
                  <button
                    onClick={handleBackToCollections}
                    className="p-1.5 -ml-1.5 mt-1 rounded-full hover:bg-gray-200 text-gray-800 transition-colors"
                    title="Back to Collections"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                )}
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 tracking-tight">
                      {currentCollection.title}
                    </h1>
                    <span className="text-xs font-bold text-[#002B7F] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      {currentCollection.items.length} {currentCollection.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Creator Info & Add/Remove from My Collections toggle button for shared collections */}
                  {currentCollection.sharedWithMe && (
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-gray-700 font-bold bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                        Created by {currentCollection.author || currentCollection.sharedBy || 'Colleague'}
                      </span>
                      {currentCollection.isOwner ? (
                        <button
                          onClick={() => {
                            const res = collectionsService.toggleSharedCollectionInMyCollections(currentCollection.id);
                            setCollections(collectionsService.getCollections());
                            showToast(`Removed "${currentCollection.title}" from My Collections`);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-red-50 text-emerald-700 hover:text-red-700 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-emerald-200 hover:border-red-200 transition-all cursor-pointer group"
                          title="Click to remove from My Collections"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 group-hover:hidden" />
                          <Trash2 className="w-3.5 h-3.5 text-red-600 hidden group-hover:block" />
                          <span className="group-hover:hidden">Added to My Collections</span>
                          <span className="hidden group-hover:inline">Remove from My Collections</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const res = collectionsService.toggleSharedCollectionInMyCollections(currentCollection.id);
                            setCollections(collectionsService.getCollections());
                            showToast(`Added "${currentCollection.title}" to My Collections!`);
                          }}
                          className="px-3.5 py-1.5 bg-[#002B7F] hover:bg-[#0a47d0] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to My Collections</span>
                        </button>
                      )}
                    </div>
                  )}
                  {!currentCollection.sharedWithMe && (
                    <span className="text-xs text-gray-500 font-semibold block mt-1">
                      Created by You
                    </span>
                  )}
                </div>
              </div>

              {/* Right Action Icons: Share (for all) | Edit & Delete (ONLY for Original Creator, never for shared) */}
              <div className="flex items-center gap-4 self-start sm:self-center text-sm font-semibold text-gray-700">
                <button
                  onClick={() => setShareModalCollection(currentCollection)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:text-[#0a47d0] hover:border-blue-200 transition-colors shadow-2xs"
                >
                  <Share2 className="w-4 h-4 text-gray-600" />
                  <span>Share</span>
                </button>

                {!currentCollection.sharedWithMe && (currentCollection.author === 'You' || currentCollection.author === undefined) && (
                  <>
                    <button
                      onClick={() => setEditingCollection(currentCollection)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:text-[#0a47d0] hover:border-blue-200 transition-colors shadow-2xs"
                    >
                      <Edit3 className="w-4 h-4 text-gray-600" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteCollection(currentCollection.id, currentCollection.title)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:text-red-600 hover:border-red-200 transition-colors shadow-2xs"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Collection Description if any */}
            {currentCollection.description && (
              <p className="text-sm text-gray-600">
                {currentCollection.description}
              </p>
            )}

            {/* Items inside collection */}
            <div className="pt-2">
              {currentCollection.items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {currentCollection.items.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl group h-full flex flex-col relative border border-gray-100 shadow-xs hover:shadow-md transition-all">
                      <div onClick={() => navigate(`/course/${item.id}`)} className="relative block overflow-hidden rounded-t-xl cursor-pointer">
                        <img className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-300" src={item.imageUrl} alt={item.title} />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-[#002B7F] text-white">
                            {item.type || 'Course'}
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                          {item.duration || '2h 12m'}
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-grow justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.provider || 'Internal'}</p>
                          <h3 onClick={() => navigate(`/course/${item.id}`)} className="mt-1 text-sm font-heading font-semibold text-gray-900 group-hover:text-[#0a47d0] line-clamp-2 cursor-pointer transition-colors">
                            {item.title}
                          </h3>
                        </div>

                        {/* Completion status with green tick mark and date */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          {item.isCompleted ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span>Completed on {item.completedOn || 'recently'}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                              <span>In Progress</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs space-y-3">
                  <div className="w-12 h-12 bg-blue-50 text-[#0a47d0] rounded-full flex items-center justify-center mx-auto">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">This collection is empty</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Save courses or videos into this collection from the Discover page or three dots (...) menu.
                  </p>
                  <button
                    onClick={() => navigate('/discover')}
                    className="px-4 py-2 bg-[#002B7F] hover:bg-[#0a47d0] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'collections' ? (
          /* ----------------------------------------------------------------------- */
          /* VIEW 2: COLLECTIONS GRID                                                */
          /* ----------------------------------------------------------------------- */
          <div className="space-y-6">
            
            {/* Header: Collections + Add new Collection button */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  My Collections
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">Your personal learning playlists and curated collections</p>
              </div>

              <button
                onClick={() => setIsCreateCollectionOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#002B7F] hover:bg-[#0a47d0] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Add new Collection</span>
              </button>
            </div>

            {/* Grid of Collection Cards */}
            {filteredCollections.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCollections.map((col) => (
                  <CollectionCard
                    key={col.id}
                    collection={col}
                    onExplore={() => handleSelectCollection(col.id)}
                    onEdit={() => setEditingCollection(col)}
                    onDelete={() => handleDeleteCollection(col.id, col.title)}
                    onShare={() => setShareModalCollection(col)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs space-y-3">
                <div className="w-12 h-12 bg-blue-50 text-[#0a47d0] rounded-full flex items-center justify-center mx-auto">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">No collections found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Create a collection to organize your learning courses and paths.
                </p>
                <button
                  onClick={() => setIsCreateCollectionOpen(true)}
                  className="px-4 py-2 bg-[#002B7F] hover:bg-[#0a47d0] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Create Collection
                </button>
              </div>
            )}

          </div>
        ) : activeTab === 'learn-later' ? (
          /* ----------------------------------------------------------------------- */
          /* VIEW 3: LEARN LATER SECTION                                             */
          /* ----------------------------------------------------------------------- */
          <div className="space-y-6">
            <div className="flex items-center justify-between pt-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Learn Later
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Saved courses and videos to learn at a later time
                </p>
              </div>
            </div>

            {(() => {
              const learnLaterCol = collections.find(c => c.id === 'col_learn_later' || c.id === 'col_watch_later' || c.title.toLowerCase() === 'learn later' || c.title.toLowerCase() === 'watch later');
              const items = learnLaterCol?.items || [];
              if (items.length === 0) {
                return (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs space-y-3">
                    <div className="w-12 h-12 bg-blue-50 text-[#0a47d0] rounded-full flex items-center justify-center mx-auto">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Your Learn Later list is empty</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Save courses or videos using "Save to Learn Later" from any course options menu.
                    </p>
                    <button
                      onClick={() => navigate('/discover')}
                      className="px-4 py-2 bg-[#002B7F] hover:bg-[#0a47d0] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                    >
                      Browse Courses
                    </button>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl group h-full flex flex-col relative border border-gray-100 shadow-xs hover:shadow-md transition-all">
                      <div onClick={() => navigate(`/course/${item.id}`)} className="relative block overflow-hidden rounded-t-xl cursor-pointer">
                        <img className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-300" src={item.imageUrl} alt={item.title} />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-[#002B7F] text-white">
                            {item.type || 'Course'}
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                          {item.duration || '2h 12m'}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-grow justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.provider || 'Internal'}</p>
                          <h3 onClick={() => navigate(`/course/${item.id}`)} className="mt-1 text-sm font-heading font-semibold text-gray-900 group-hover:text-[#0a47d0] line-clamp-2 cursor-pointer transition-colors">
                            {item.title}
                          </h3>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <button
                            onClick={() => {
                              collectionsService.removeFromLearnLater(item.id);
                              setCollections(collectionsService.getCollections());
                              showToast('Removed from Learn Later');
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                          <button
                            onClick={() => navigate(`/course/${item.id}`)}
                            className="flex items-center gap-1.5 text-xs font-bold text-[#002B7F] hover:text-[#0a47d0]"
                          >
                            <Play className="w-3.5 h-3.5 fill-[#002B7F]" />
                            <span>Start</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ) : activeTab === 'shared' ? (
          /* ----------------------------------------------------------------------- */
          /* VIEW 4: SHARED WITH ME TAB                                              */
          /* ----------------------------------------------------------------------- */
          <div className="space-y-8">
            {/* Shared Collections Section */}
            {filteredSharedCollections.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <span>Shared Collections</span>
                    <span className="text-xs bg-blue-100 text-[#002B7F] px-2 py-0.5 rounded-full font-semibold">
                      {filteredSharedCollections.length}
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredSharedCollections.map((col) => (
                    <CollectionCard
                      key={col.id}
                      collection={col}
                      onExplore={() => {
                        setSelectedCollectionId(col.id);
                        setSearchParams({ tab: 'shared', collection: col.id });
                      }}
                      onShare={() => setShareModalCollection(col)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Shared Courses Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Shared Courses ({filteredCourses.length})
              </h2>

              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={{
                        id: course.id,
                        title: course.title,
                        provider: course.source,
                        imageUrl: course.imageUrl,
                        tags: [course.trainingCategory, course.category]
                      }}
                      status={undefined}
                    />
                  ))}
                </div>
              ) : (
                filteredSharedCollections.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs">
                    <p className="text-sm text-gray-500">No shared items found.</p>
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          /* ----------------------------------------------------------------------- */
          /* VIEW 5: STANDARD TABS (My Courses, History)                             */
          /* ----------------------------------------------------------------------- */
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              {activeTab === 'my-courses' ? 'My Courses' : 'Learning History'} ({filteredCourses.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={{
                    id: course.id,
                    title: course.title,
                    provider: course.source,
                    imageUrl: course.imageUrl,
                    tags: [course.trainingCategory, course.category]
                  }}
                  status={course.status === 'history' ? 'Completed' : course.status === 'my-courses' ? 'In Progress' : undefined}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Share Collection Modal */}
      {shareModalCollection && (
        <ShareCollectionModal
          isOpen={!!shareModalCollection}
          onClose={() => setShareModalCollection(null)}
          collection={shareModalCollection}
          onToast={showToast}
        />
      )}

      {/* Select Collection Modal */}
      {selectedCourseForModal && (
        <SelectCollectionModal
          isOpen={isSelectCollectionOpen}
          onClose={() => setIsSelectCollectionOpen(false)}
          course={selectedCourseForModal}
          onToast={showToast}
        />
      )}

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={isCreateCollectionOpen}
        onClose={() => setIsCreateCollectionOpen(false)}
        onCreated={(name) => {
          setCollections(collectionsService.getCollections());
          showToast(`Created collection: ${name}`);
        }}
      />

      {/* Edit Collection Modal */}
      {editingCollection && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setEditingCollection(null)}
        >
          <div 
            className="bg-[#2b3341] text-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/10 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Edit Collection</h3>
              <button onClick={() => setEditingCollection(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 font-medium">Title *</label>
                <input
                  type="text"
                  value={editingCollection.title}
                  onChange={(e) => setEditingCollection({ ...editingCollection, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-medium">Description</label>
                <textarea
                  rows={3}
                  value={editingCollection.description}
                  onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium mt-1 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCollection(null)}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  collectionsService.updateCollection(editingCollection.id, {
                    title: editingCollection.title,
                    description: editingCollection.description
                  });
                  setCollections(collectionsService.getCollections());
                  setEditingCollection(null);
                  showToast('Collection updated successfully');
                }}
                className="px-5 py-2 bg-[#002B7F] hover:bg-[#0a47d0] text-white text-xs font-bold rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-gray-900 border border-gray-200 text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full shadow-2xl flex items-center gap-3 z-[9999] animate-fade-in-up">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};

export default MyLearningPage;
