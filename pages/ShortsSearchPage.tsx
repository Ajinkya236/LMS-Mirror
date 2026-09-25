import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  ArrowLeft,
  X,
  Play,
  Layers,
  Film,
  Heart
} from 'lucide-react';
import { ShortItem, shortsService } from '../services/shortsService';

const SUGGESTED_TOPICS = [
  'System Design',
  'Generative AI',
  'Cloud Architecture',
  'Microservices',
  'Cyber Security',
  'DevOps Pipeline',
  'Leadership Skills',
  'Customer Success',
  'Data Engineering',
  'Kubernetes',
  'Product Strategy',
  'AI Prompting',
  'Agile Coaching',
  'Full Stack Development'
];

export const ShortsSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topicParam = searchParams.get('topic');

  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

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

  // Live search results when user types a query
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return allApproved.filter(short => {
      const titleMatch = short.title.toLowerCase().includes(q);
      const descMatch = short.description.toLowerCase().includes(q);
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

  useEffect(() => {
    if (!topicParam) {
      inputRef.current?.focus();
    }
  }, [topicParam]);

  const handleOpenShort = (shortId: string, fromContext: string, currentList: ShortItem[]) => {
    const orderedIds = currentList.map(s => s.id);
    sessionStorage.setItem('jio_shorts_search_order', JSON.stringify(orderedIds));
    navigate(`/shorts?short=${shortId}&from=${fromContext}`);
  };

  // =========================================================================
  // VIEW 1: TOPIC REELS VIEW (No search bar, only Topic Title & Back Button)
  // =========================================================================
  if (cleanActiveTopic) {
    return (
      <div className="min-h-screen bg-slate-950 text-white pb-20">
        {/* Sticky Header with Back Button and Topic Name ONLY (No top nav, No search bar) */}
        <div className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-white/10 shadow-md">
          <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/shorts/search')}
                className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                title="Back to Topics"
                aria-label="Back to Topics"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold text-white">
                    {cleanActiveTopic}
                  </span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-400/30">
                    Topic
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {topicShorts.length} micro-learning reel{topicShorts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/shorts')}
              className="text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition-colors cursor-pointer"
            >
              Feed
            </button>
          </div>
        </div>

        {/* Topic Reels 3-Column Grid */}
        <div className="max-w-4xl mx-auto px-1 sm:px-4 py-3">
          {topicShorts.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-white/10 mt-4 space-y-3">
              <Film className="w-10 h-10 text-gray-500 mx-auto" />
              <h3 className="text-sm font-bold text-gray-300">No reels found for "{cleanActiveTopic}"</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Be the first educator or engineer to create a 60-second micro-learning short on this topic!
              </p>
              <button
                onClick={() => navigate('/shorts/create')}
                className="px-5 py-2 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Create Reel on this Topic
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {topicShorts.map(short => (
                <div
                  key={short.id}
                  onClick={() => handleOpenShort(short.id, `topic_${encodeURIComponent(cleanActiveTopic)}`, topicShorts)}
                  className="group relative aspect-[3/4] bg-slate-900 overflow-hidden cursor-pointer transition-transform active:scale-[0.98] rounded-md sm:rounded-xl"
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
  // VIEW 2: SEARCH & SUGGESTED TOPICS VIEW (Pure Bubbles, No Ranking Text)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Back to Feed Button */}
          <button
            onClick={() => navigate('/shorts')}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 flex items-center justify-center flex-shrink-0 cursor-pointer"
            title="Back to Shorts Feed"
            aria-label="Back to Shorts Feed"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Search Input Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, skills, creators, or keywords..."
              className="w-full pl-10 pr-9 py-2.5 bg-white/10 focus:bg-white/15 border border-white/10 focus:border-blue-400 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none transition-all shadow-inner"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* CASE A: No active query -> Show 'Suggested Topics' as pure bubbles (text and bubble only) */}
        {!query.trim() && (
          <div className="space-y-3.5">
            <h2 className="text-sm sm:text-base font-bold text-white">
              Suggested Topics
            </h2>

            {/* Topics strictly as bubbles: text and the bubble, nothing else, NO hashtags */}
            <div className="flex flex-wrap gap-2.5">
              {SUGGESTED_TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => navigate(`/shorts/search?topic=${encodeURIComponent(topic)}`)}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs sm:text-sm font-medium border border-white/15 backdrop-blur-xs transition-all cursor-pointer shadow-xs"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CASE B: Query entered -> Show live search results */}
        {query.trim() && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                Found <strong className="text-white">{searchResults.length}</strong> learning short{searchResults.length !== 1 ? 's' : ''} for "{query}"
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-white/10 space-y-3">
                <Search className="w-8 h-8 text-gray-500 mx-auto" />
                <h3 className="text-sm font-bold text-gray-300">No shorts matched "{query}"</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Try searching for another topic or explore one of the suggested topics.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  {SUGGESTED_TOPICS.slice(0, 4).map(t => (
                    <button
                      key={t}
                      onClick={() => navigate(`/shorts/search?topic=${encodeURIComponent(t)}`)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs text-blue-300 font-medium cursor-pointer"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {searchResults.map(short => (
                  <div
                    key={short.id}
                    onClick={() => handleOpenShort(short.id, `search_${encodeURIComponent(query)}`, searchResults)}
                    className="group relative aspect-[3/4] bg-slate-900 overflow-hidden cursor-pointer transition-transform active:scale-[0.98] rounded-md sm:rounded-xl"
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
        )}
      </div>
    </div>
  );
};

export default ShortsSearchPage;
