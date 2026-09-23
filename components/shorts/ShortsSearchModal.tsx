import React, { useState, useMemo } from 'react';
import { Search, X, Film, Eye, Heart, User, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { ShortItem, shortsService } from '../../services/shortsService';

interface ShortsSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectShort: (short: ShortItem) => void;
  onSelectTag?: (tag: string) => void;
}

export const ShortsSearchModal: React.FC<ShortsSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectShort,
  onSelectTag
}) => {
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const approvedShorts = useMemo(() => {
    return shortsService.getApprovedShorts();
  }, [isOpen]);

  const config = useMemo(() => shortsService.getConfig(), []);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    return approvedShorts.filter(short => {
      const matchesTag = selectedTag
        ? short.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase())
        : true;

      if (!matchesTag) return false;
      if (!q) return true;

      const titleMatch = short.title.toLowerCase().includes(q);
      const descMatch = short.description.toLowerCase().includes(q);
      const authorMatch = short.author.name.toLowerCase().includes(q) || short.author.role.toLowerCase().includes(q);
      const tagMatch = short.tags.some(t => t.toLowerCase().includes(q));

      return titleMatch || descMatch || authorMatch || tagMatch;
    });
  }, [approvedShorts, query, selectedTag]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 text-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-white/15 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Search Learning Shorts</h3>
              <p className="text-xs text-gray-400">Search by title, topic, creator, or skill</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="p-4 sm:p-5 space-y-4 flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, topic, creator name..."
              className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/15 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Suggested Learning Tags */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-blue-400" />
              <span>Suggested Learning Topics</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedTag(null)}
                className={`text-xs px-2.5 py-1 rounded-xl font-bold transition-colors ${
                  selectedTag === null
                    ? 'bg-[#002B7F] text-white shadow-md'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                All Topics
              </button>
              {config.predefinedTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(prev => prev === tag ? null : tag)}
                  className={`text-xs px-2.5 py-1 rounded-xl font-semibold transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 pb-5 space-y-2.5 divide-y divide-white/5">
          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 font-mono">
            <span>{searchResults.length} {searchResults.length === 1 ? 'Short' : 'Shorts'} found</span>
            {selectedTag && (
              <span className="text-blue-400 font-sans">Filtered by {selectedTag}</span>
            )}
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-10 text-gray-400 space-y-2">
              <Film className="w-8 h-8 mx-auto text-gray-600" />
              <p className="text-sm font-semibold text-gray-300">No matching Learning Shorts</p>
              <p className="text-xs text-gray-500">Try different search keywords or select another topic.</p>
            </div>
          ) : (
            searchResults.map(short => (
              <div
                key={short.id}
                onClick={() => {
                  onSelectShort(short);
                  onClose();
                }}
                className="pt-2.5 flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors group"
              >
                {/* Thumbnail */}
                <div className="w-14 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0 relative border border-white/10">
                  {short.mediaType === 'video' ? (
                    <video src={short.mediaUrls[0]} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={short.mediaUrls[0]} alt={short.title} className="w-full h-full object-cover" />
                  )}
                  <span className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-xs text-[9px] font-bold px-1 rounded text-white uppercase">
                    {short.mediaType === 'carousel' ? `${short.mediaUrls.length}P` : short.mediaType}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {short.title}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {short.description}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5 text-[11px] text-gray-400">
                    <div className="flex items-center gap-1">
                      <img src={short.author.avatar} alt={short.author.name} className="w-3.5 h-3.5 rounded-full" />
                      <span className="truncate max-w-[100px] text-gray-300 font-medium">{short.author.name}</span>
                    </div>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Eye className="w-3 h-3 text-blue-400" />
                      {short.viewsCount}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-rose-400">
                      <Heart className="w-3 h-3 fill-rose-400" />
                      {short.likesCount}
                    </span>
                  </div>

                  {/* Tag pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {short.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShortsSearchModal;
