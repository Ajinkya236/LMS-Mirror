import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowLeft,
  X,
  Play,
  Sparkles,
  Layers,
  Film,
  Compass,
  Heart,
  Eye
} from 'lucide-react';
import { ShortItem, shortsService } from '../services/shortsService';

export const ShortsSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allShorts, setAllShorts] = useState<ShortItem[]>([]);

  useEffect(() => {
    setAllShorts(shortsService.getApprovedShorts());
    inputRef.current?.focus();
  }, []);

  const predefinedTags = useMemo(() => {
    return shortsService.getConfig().predefinedTags;
  }, []);

  // Filter results ONLY when user has typed something or selected a tag
  const searchResults = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed && !selectedTag) {
      return [];
    }

    return shortsService.searchShorts(trimmed, selectedTag || undefined);
  }, [query, selectedTag, allShorts]);

  const hasSearchInput = query.trim().length > 0 || selectedTag !== null;

  const handleSelectTag = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
      if (!query) {
        setQuery(tag.replace('#', ''));
      }
    }
  };

  // Play short from search, storing grid order so the feed plays in search order
  const handleOpenShort = (shortId: string) => {
    if (searchResults.length > 0) {
      const orderedIds = searchResults.map(s => s.id);
      sessionStorage.setItem('jio_shorts_search_ordered_ids', JSON.stringify(orderedIds));
    }
    navigate(`/shorts?short=${shortId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Search Header Bar (Light Mode) */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={() => navigate('/shorts')}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            title="Back to Shorts Feed"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Search Input Field */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What would you like to learn today? (e.g. Microservices, AI, Sales)..."
              className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-300 focus:border-[#002B7F] focus:bg-white rounded-2xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all shadow-inner"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSelectedTag(null);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Popular Learning Topic Pills */}
        <div className="max-w-4xl mx-auto px-4 pb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap mr-1">
            Topics:
          </span>
          {predefinedTags.slice(0, 10).map(tag => {
            const isSelected = selectedTag === tag || query.toLowerCase() === tag.replace('#', '').toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => handleSelectTag(tag)}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all font-mono ${
                  isSelected
                    ? 'bg-[#002B7F] text-white font-bold shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* State A: User hasn't typed anything yet */}
        {!hasSearchInput && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200 shadow-sm space-y-6 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#002B7F] flex items-center justify-center mx-auto shadow-xs">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-gray-900">
                What would you like to learn today?
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
                Search topics, technical skills, or colleagues to discover high-impact 60-second learning shorts.
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <span className="text-[11px] font-bold text-gray-500 block uppercase tracking-wider">
                Explore popular topics
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {predefinedTags.slice(0, 6).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleSelectTag(tag)}
                    className="text-xs px-3.5 py-1.5 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-[#002B7F] border border-gray-200 hover:border-blue-200 rounded-xl transition-all font-mono"
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
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 shadow-xs space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">No Learning Shorts Found</h3>
            <p className="text-xs text-gray-500">
              We couldn't find any approved shorts matching "<span className="font-semibold text-gray-800">{query || selectedTag}</span>".
            </p>
            <button
              onClick={() => {
                setQuery('');
                setSelectedTag(null);
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* State C: Search Results — 9:16 Instagram-style Vertical Reels Grid */}
        {hasSearchInput && searchResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-600 px-1">
              <span>
                Found <strong className="text-gray-900">{searchResults.length}</strong> Learning Short{searchResults.length > 1 ? 's' : ''}
              </span>
              <span className="text-[11px] text-gray-400">Click any reel to play in grid order</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {searchResults.map((short, idx) => (
                <div
                  key={short.id}
                  onClick={() => handleOpenShort(short.id)}
                  className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-gray-900 cursor-pointer shadow-md hover:shadow-xl transition-all hover:scale-[1.02] border border-gray-200"
                >
                  {/* Thumbnail */}
                  {short.mediaType === 'video' ? (
                    <video
                      src={short.mediaUrls[0]}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <img
                      src={short.mediaUrls[0]}
                      alt={short.title}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  )}

                  {/* Format Badge (Top Right) */}
                  <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                    {short.mediaType === 'video' ? (
                      <>
                        <Film className="w-3 h-3 text-blue-400" />
                        <span>Video</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-3 h-3 text-emerald-400" />
                        <span>{short.mediaUrls.length} Slides</span>
                      </>
                    )}
                  </div>

                  {/* Play Icon Center Hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white text-[#002B7F] flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-6 h-6 fill-[#002B7F] ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Metadata Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/95 via-black/65 to-transparent text-white space-y-1">
                    <h4 className="text-xs font-bold leading-tight line-clamp-2 drop-shadow">
                      {short.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-gray-300 pt-0.5">
                      <span className="truncate max-w-[100px] text-gray-200">{short.author.name}</span>
                      <span className="flex items-center gap-0.5 text-rose-300">
                        <Heart className="w-3 h-3 fill-rose-400" />
                        <span>{short.likesCount}</span>
                      </span>
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
