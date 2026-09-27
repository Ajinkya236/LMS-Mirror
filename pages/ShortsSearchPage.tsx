import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  ArrowLeft,
  X,
  Play,
  Layers,
  Film,
  Heart,
  LayoutGrid,
  Hash,
  ChevronRight,
  Keyboard as KeyboardIcon
} from 'lucide-react';
import { ShortItem, shortsService } from '../services/shortsService';
import { VirtualKeyboard } from '../components/common/VirtualKeyboard';

interface TopicItem {
  name: string;
  count: number;
}

const BASE_TOPICS: string[] = [
  'System Design',
  'Generative AI',
  'Cloud Architecture',
  'Microservices',
  'Kubernetes',
  'DevOps Pipeline',
  'Data Engineering',
  'AI Prompting',
  'Cyber Security',
  'Product Strategy',
  'Full Stack Development',
  'Leadership Skills',
  'Agile Coaching',
  'Customer Success'
];

export const ShortsSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const topicParam = searchParams.get('topic');

  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  // Two sub-menus: 'feed' (Reels) and 'tags' (Tags)
  const [activeSubMenu, setActiveSubMenu] = useState<'feed' | 'tags'>('feed');
  const [showKeyboard, setShowKeyboard] = useState(false);

  // Endless scroll batch count for search feed
  const [visibleFeedCount, setVisibleFeedCount] = useState<number>(18);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  // Fetch approved shorts for search and topic view
  const allApproved = useMemo(() => {
    return shortsService.getApprovedShorts();
  }, []);

  // Clean topic string without hashtag
  const cleanActiveTopic = useMemo(() => {
    if (!topicParam) return null;
    return topicParam.replace(/^#/, '').trim();
  }, [topicParam]);

  // If active topic is present, get topic shorts matching with or without hashtag
  const topicShorts = useMemo(() => {
    if (!cleanActiveTopic) return [];
    const target = cleanActiveTopic.toLowerCase();
    return allApproved.filter(short =>
      short.tags.some(t => t.replace(/^#/, '').trim().toLowerCase() === target)
    );
  }, [allApproved, cleanActiveTopic]);

  // Filtered shorts for the 3x3 search feed
  const feedShorts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allApproved;

    return allApproved.filter(short => {
      const titleMatch = short.title.toLowerCase().includes(q);
      const descMatch = (short.caption || short.description || '').toLowerCase().includes(q);
      const authorMatch =
        short.author.name.toLowerCase().includes(q) ||
        short.author.role.toLowerCase().includes(q) ||
        short.author.department.toLowerCase().includes(q);
      const tagMatch = short.tags.some(t =>
        t.replace('#', '').toLowerCase().includes(q.replace('#', ''))
      );

      return titleMatch || descMatch || authorMatch || tagMatch;
    });
  }, [allApproved, query]);

  // Endless display list: takes feedShorts and expands seamlessly
  const displayedFeedShorts = useMemo(() => {
    if (feedShorts.length === 0) return [];
    if (feedShorts.length <= visibleFeedCount) {
      const result: ShortItem[] = [];
      while (result.length < visibleFeedCount && feedShorts.length > 0) {
        result.push(...feedShorts);
      }
      return result.slice(0, visibleFeedCount);
    }
    return feedShorts.slice(0, visibleFeedCount);
  }, [feedShorts, visibleFeedCount]);

  // Intersection observer for endless scrolling
  useEffect(() => {
    if (activeSubMenu !== 'feed' || cleanActiveTopic) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleFeedCount((prev) => prev + 9);
        }
      },
      { threshold: 0.1 }
    );

    if (bottomSentinelRef.current) {
      observer.observe(bottomSentinelRef.current);
    }

    return () => observer.disconnect();
  }, [activeSubMenu, cleanActiveTopic, displayedFeedShorts.length]);

  // Clean Tags List: Shows ONLY the name of the topic and number of reels
  const tagsList = useMemo<TopicItem[]>(() => {
    const tagCountMap = new Map<string, number>();
    allApproved.forEach(short => {
      short.tags.forEach(rawTag => {
        const clean = rawTag.replace(/^#/, '').trim();
        if (clean) {
          const matchKey = clean.toLowerCase();
          tagCountMap.set(matchKey, (tagCountMap.get(matchKey) || 0) + 1);
        }
      });
    });

    const list: TopicItem[] = BASE_TOPICS.map(name => {
      const lower = name.toLowerCase();
      const count = tagCountMap.get(lower) || allApproved.filter(s =>
        s.tags.some(t => t.replace(/^#/, '').trim().toLowerCase() === lower)
      ).length;

      return {
        name,
        count: Math.max(count, 1)
      };
    });

    tagCountMap.forEach((count, key) => {
      const alreadyPresent = list.some(t => t.name.toLowerCase() === key);
      if (!alreadyPresent) {
        const titleCase = key.charAt(0).toUpperCase() + key.slice(1);
        list.push({
          name: titleCase,
          count
        });
      }
    });

    list.sort((a, b) => b.count - a.count);

    const q = query.trim().toLowerCase();
    if (!q) return list;

    return list.filter(t => t.name.toLowerCase().includes(q));
  }, [allApproved, query]);

  useEffect(() => {
    if (!topicParam && activeSubMenu === 'feed') {
      inputRef.current?.focus();
    }
  }, [topicParam, activeSubMenu]);

  const handleOpenShort = (shortId: string, fromContext: string, currentList: ShortItem[]) => {
    const orderedIds = currentList.map(s => s.id);
    sessionStorage.setItem('jio_shorts_search_order', JSON.stringify(orderedIds));
    navigate(`/shorts?short=${shortId}&from=${fromContext}`);
  };

  const handleSelectTopic = (topicName: string) => {
    setSearchParams({ topic: topicName });
  };

  const handleBackFromTopic = () => {
    setSearchParams({});
    setActiveSubMenu('tags');
  };

  // =========================================================================
  // VIEW 1: ACTIVE TOPIC REELS (Opened by clicking on a topic)
  // =========================================================================
  if (cleanActiveTopic) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
        {/* Sticky Header with Back Button and Topic Name */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackFromTopic}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                title="Back to Tags"
                aria-label="Back to Tags"
              >
                <ArrowLeft className="w-5 h-5 text-gray-800" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold text-gray-900">
                    {cleanActiveTopic}
                  </span>
                  <span className="text-[10px] bg-blue-50 text-[#002B7F] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                    Tag
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  {topicShorts.length} reel{topicShorts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSearchParams({});
                setActiveSubMenu('feed');
              }}
              className="text-xs text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#002B7F]" />
              <span>Feed</span>
            </button>
          </div>
        </div>

        {/* Topic Reels 3x3 Grid */}
        <div className="max-w-4xl mx-auto px-1 sm:px-4 py-3">
          {topicShorts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-xs mt-4 space-y-3">
              <Film className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-sm font-bold text-gray-800">No reels found for "{cleanActiveTopic}"</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Be the first educator or engineer to create a 60-second micro-learning short on this topic!
              </p>
              <button
                onClick={() => navigate('/shorts/create')}
                className="px-5 py-2 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Create Reel on this Topic
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {topicShorts.map((short, idx) => (
                <div
                  key={`${short.id}-${idx}`}
                  onClick={() => handleOpenShort(short.id, `topic_${encodeURIComponent(cleanActiveTopic)}`, topicShorts)}
                  className="group relative aspect-[3/4] bg-gray-950 overflow-hidden cursor-pointer transition-transform active:scale-[0.98] rounded-md sm:rounded-xl shadow-xs"
                >
                  {/* Media Preview */}
                  {short.mediaType === 'video' ? (
                    <video
                      src={short.mediaUrls[0]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <img
                      src={short.mediaUrls[0]}
                      alt={short.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Format Badge */}
                  <div className="absolute top-1.5 right-1.5 z-10 drop-shadow-md">
                    {short.mediaType === 'video' ? (
                      <Film className="w-3.5 h-3.5 text-white drop-shadow" />
                    ) : (
                      <Layers className="w-3.5 h-3.5 text-white drop-shadow" />
                    )}
                  </div>

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-75 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-1.5 sm:p-2.5 text-white">
                    <h4 className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-2 drop-shadow mb-1">
                      {short.title}
                    </h4>

                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-gray-300 drop-shadow">
                      <span className="truncate max-w-[65px] sm:max-w-[85px] text-gray-200 font-medium">
                        {short.author.name}
                      </span>
                      <span className="flex items-center gap-0.5 text-rose-300 font-semibold flex-shrink-0">
                        <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-rose-400" />
                        <span>{short.likesCount}</span>
                      </span>
                    </div>
                  </div>

                  {/* Center Play Indicator */}
                  <div className="absolute inset-0 items-center justify-center bg-black/20 hidden group-hover:flex transition-opacity">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-[#002B7F] flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-[#002B7F] ml-0.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LIGHT MODE SEARCH PAGE (NO NOTIFICATIONS BUTTON, ICONS SUBMENU BELOW)
  // =========================================================================
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-2.5 pb-2 space-y-2">
          {/* Top Search Bar Row (Notification icon removed per requirements) */}
          <div className="flex items-center gap-2.5">
            {/* Back to Shorts Button */}
            <button
              onClick={() => navigate('/shorts')}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all active:scale-95 flex items-center justify-center flex-shrink-0 cursor-pointer"
              title="Back to Shorts Feed"
              aria-label="Back to Shorts Feed"
            >
              <ArrowLeft className="w-5 h-5 text-gray-800" />
            </button>

            {/* Search Input Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onFocus={() => setShowKeyboard(true)}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  activeSubMenu === 'feed'
                    ? 'Search reels, skills, tags...'
                    : 'Filter tags...'
                }
                className="w-full pl-9 pr-14 py-2 bg-gray-100 focus:bg-white border border-gray-200 focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all shadow-inner"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  className={`p-1 rounded-md transition-colors ${
                    showKeyboard ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Toggle Virtual Keyboard"
                >
                  <KeyboardIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Submenu Below Search Bar: Small Icons for Reels vs Tags */}
          <div className="flex items-center justify-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setActiveSubMenu('feed')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeSubMenu === 'feed'
                  ? 'bg-[#002B7F] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Reels Feed"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Reels</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubMenu('tags')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeSubMenu === 'tags'
                  ? 'bg-[#002B7F] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Tags"
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Tags</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-1 sm:px-4 py-3">
        {/* ========================================================================= */}
        {/* SUB-MENU 1: REELS SEARCH FEED (Complete 3x3 Grid with Endless Scroll) */}
        {/* ========================================================================= */}
        {activeSubMenu === 'feed' && (
          <div>
            {query.trim() && (
              <div className="px-3 py-1.5 mb-2 text-xs text-gray-600 flex items-center justify-between">
                <span>
                  Showing results for <strong className="text-gray-900">"{query}"</strong>
                </span>
                <span className="text-[11px] text-gray-500 font-mono">
                  {feedShorts.length} matching reel{feedShorts.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {feedShorts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-xs mt-4 space-y-3 mx-2">
                <Search className="w-8 h-8 text-gray-400 mx-auto" />
                <h3 className="text-sm font-bold text-gray-800">No reels matched "{query}"</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Try another keyword, clear the search, or explore tags.
                </p>
                <button
                  onClick={() => setQuery('')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div>
                {/* 3x3 Grid for the Reels */}
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  {displayedFeedShorts.map((short, idx) => (
                    <div
                      key={`${short.id}-${idx}`}
                      onClick={() => handleOpenShort(short.id, 'search', displayedFeedShorts)}
                      className="group relative aspect-[3/4] bg-gray-950 overflow-hidden cursor-pointer transition-transform active:scale-[0.98] rounded-md sm:rounded-xl shadow-xs"
                    >
                      {/* Media Preview */}
                      {short.mediaType === 'video' ? (
                        <video
                          src={short.mediaUrls[0]}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <img
                          src={short.mediaUrls[0]}
                          alt={short.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      {/* Format Badge */}
                      <div className="absolute top-1.5 right-1.5 z-10 drop-shadow-md">
                        {short.mediaType === 'video' ? (
                          <Film className="w-3.5 h-3.5 text-white drop-shadow" />
                        ) : (
                          <Layers className="w-3.5 h-3.5 text-white drop-shadow" />
                        )}
                      </div>

                      {/* Dark Overlay with Title & Author */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-80 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-1.5 sm:p-2.5 text-white">
                        <h4 className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-2 drop-shadow mb-1">
                          {short.title}
                        </h4>

                        <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-gray-300 drop-shadow">
                          <span className="truncate max-w-[65px] sm:max-w-[85px] text-gray-200 font-medium">
                            {short.author.name}
                          </span>
                          <span className="flex items-center gap-0.5 text-rose-300 font-semibold flex-shrink-0">
                            <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-rose-400" />
                            <span>{short.likesCount}</span>
                          </span>
                        </div>
                      </div>

                      {/* Center Play Indicator */}
                      <div className="absolute inset-0 items-center justify-center bg-black/20 hidden group-hover:flex transition-opacity">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-[#002B7F] flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-[#002B7F] ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Endless Scroll Trigger Sentinel */}
                <div ref={bottomSentinelRef} className="py-6 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    <span>Loading more learning reels...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-MENU 2: TAGS (Clean list showing ONLY topic name and number of reels) */}
        {/* ========================================================================= */}
        {activeSubMenu === 'tags' && (
          <div className="space-y-2 px-2 sm:px-0">
            {tagsList.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-xs space-y-2">
                <p className="text-xs text-gray-500">No tags matched your search filter.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {tagsList.map((topic) => (
                  <button
                    key={topic.name}
                    onClick={() => handleSelectTopic(topic.name)}
                    className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-gray-50 active:scale-[0.99] border border-gray-200 hover:border-blue-300 rounded-2xl transition-all cursor-pointer group shadow-2xs text-left"
                  >
                    {/* ONLY name of the topic */}
                    <span className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#002B7F] transition-colors">
                      {topic.name}
                    </span>

                    {/* ONLY number of reels for that topic & subtle arrow */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">
                        {topic.count} reel{topic.count !== 1 ? 's' : ''}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Virtual Keyboard Accessory */}
      {showKeyboard && (
        <VirtualKeyboard
          isOpen={showKeyboard}
          onClose={() => setShowKeyboard(false)}
        />
      )}
    </div>
  );
};

export default ShortsSearchPage;
