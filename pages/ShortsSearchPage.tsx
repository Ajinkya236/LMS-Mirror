import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowLeft,
  X,
  Play,
  Layers,
  Film,
  Compass,
  Heart,
  Eye,
  Sparkles
} from 'lucide-react';
import { ShortItem, shortsService } from '../services/shortsService';

export const ShortsSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [predefinedTags, setPredefinedTags] = useState<string[]>([]);

  useEffect(() => {
    setPredefinedTags(shortsService.getPredefinedTags());
    inputRef.current?.focus();
  }, []);

  // Fetch approved shorts for search
  const allApproved = useMemo(() => {
    return shortsService.getApprovedShorts();
  }, []);

  // Filter shorts based ONLY on active query or selected topic tag
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && !selectedTag) {
      return [];
    }

    return allApproved.filter(short => {
      if (selectedTag) {
        const hasTag = short.tags.some(
          t => t.toLowerCase() === selectedTag.toLowerCase()
        );
        if (hasTag) return true;
      }

      if (q) {
        const titleMatch = short.title.toLowerCase().includes(q);
        const descMatch = short.description.toLowerCase().includes(q);
        const authorMatch =
          short.author.name.toLowerCase().includes(q) ||
          short.author.role.toLowerCase().includes(q) ||
          short.author.department.toLowerCase().includes(q);
        const tagMatch = short.tags.some(t =>
          t.toLowerCase().includes(q.replace('#', ''))
        );

        return titleMatch || descMatch || authorMatch || tagMatch;
      }

      return false;
    });
  }, [allApproved, query, selectedTag]);

  const hasSearchInput = query.trim().length > 0 || selectedTag !== null;

  const handleSelectTag = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
      setQuery('');
    }
  };

  const handleOpenShort = (shortId: string) => {
    // Save search result order in sessionStorage so viewer keeps this grid order
    const orderedIds = searchResults.map(s => s.id);
    sessionStorage.setItem('jio_shorts_search_order', JSON.stringify(orderedIds));
    navigate(`/shorts?short=${shortId}`);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20">
      {/* Sticky Search Header */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={() => navigate('/shorts')}
            className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
            title="Back to Shorts Feed"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Search Input Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value) setSelectedTag(null);
              }}
              placeholder="Search for what you are looking for..."
              className="w-full pl-10 pr-9 py-2.5 bg-gray-100 focus:bg-white border border-transparent focus:border-[#002B7F] rounded-2xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all shadow-inner"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSelectedTag(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Popular Learning Topic Pills */}
        <div className="max-w-4xl mx-auto px-4 pb-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap mr-1">
            Topics:
          </span>
          {predefinedTags.slice(0, 10).map(tag => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => handleSelectTag(tag)}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all font-mono ${
                  isSelected
                    ? 'bg-[#002B7F] text-white font-bold shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4">
        {/* State A: User hasn't typed anything yet */}
        {!hasSearchInput && (
          <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 text-center border border-gray-100 space-y-5 max-w-md mx-auto my-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#002B7F] flex items-center justify-center mx-auto shadow-xs">
              <Compass className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-gray-900">
                Explore Learning Shorts
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                Type keywords or tap a topic tag above to find micro-learning reels.
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="pt-2 border-t border-gray-200/60 space-y-2.5">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                Popular topics
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {predefinedTags.slice(0, 6).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleSelectTag(tag)}
                    className="text-xs px-3 py-1 bg-white hover:bg-blue-50 text-gray-700 hover:text-[#002B7F] border border-gray-200 rounded-xl transition-all font-mono"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* State B: User searched, but 0 matching results */}
        {hasSearchInput && searchResults.length === 0 && (
          <div className="bg-gray-50 rounded-3xl p-10 text-center border border-gray-100 space-y-3 max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-white text-gray-400 flex items-center justify-center mx-auto shadow-xs">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">No Learning Shorts Found</h3>
            <p className="text-xs text-gray-500">
              No approved shorts matched "<span className="font-semibold text-gray-800">{query || selectedTag}</span>".
            </p>
            <button
              onClick={() => {
                setQuery('');
                setSelectedTag(null);
              }}
              className="px-4 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 shadow-xs"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* State C: Search Results — Instagram Explore Matrix Grid (3 Columns, Tight Borders, Shorter Aspect Ratio) */}
        {hasSearchInput && searchResults.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span>
                <strong className="text-gray-900">{searchResults.length}</strong> result{searchResults.length > 1 ? 's' : ''}
              </span>
              <span className="text-[11px] text-gray-400">Tap to watch in sequence</span>
            </div>

            {/* Matrix 3-Column Grid sharing tight borders like Instagram Explore */}
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5 bg-gray-100 p-1 sm:p-1.5 rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              {searchResults.map((short) => (
                <div
                  key={short.id}
                  onClick={() => handleOpenShort(short.id)}
                  className="group relative aspect-[4/5] bg-gray-950 overflow-hidden cursor-pointer rounded-lg transition-transform active:scale-[0.98]"
                >
                  {/* Media Cover */}
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

                  {/* Format Indicator Icon (Top Right, Instagram Style) */}
                  <div className="absolute top-1.5 right-1.5 z-10 drop-shadow-md">
                    {short.mediaType === 'video' ? (
                      <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white drop-shadow" />
                    ) : (
                      <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white drop-shadow" />
                    )}
                  </div>

                  {/* Dark Vignette Overlay on Hover / Mobile */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity flex flex-col justify-end p-1.5 sm:p-2.5 text-white">
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

                  {/* Center Play Icon on Hover */}
                  <div className="absolute inset-0 items-center justify-center bg-black/20 hidden group-hover:flex transition-opacity">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 text-[#002B7F] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-[#002B7F] ml-0.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortsSearchPage;
