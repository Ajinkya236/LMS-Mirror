import React from 'react';
import { X, Play, Heart, Eye, Film, Sparkles, Building, Mail } from 'lucide-react';
import { ShortAuthor, ShortItem, shortsService } from '../../services/shortsService';

interface CreatorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: ShortAuthor | null;
  onSelectShort: (short: ShortItem) => void;
}

export const CreatorProfileModal: React.FC<CreatorProfileModalProps> = ({
  isOpen,
  onClose,
  creator,
  onSelectShort
}) => {
  if (!isOpen || !creator) return null;

  const data = shortsService.getShortsByCreator(creator.id) || {
    author: creator,
    shorts: shortsService.getApprovedShorts().filter(s => s.author.id === creator.id)
  };

  const author = data.author;
  const publishedShorts = data.shorts;

  const totalViews = publishedShorts.reduce((acc, s) => acc + s.viewsCount, 0);
  const totalLikes = publishedShorts.reduce((acc, s) => acc + s.likesCount, 0);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xs z-[99999] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white text-gray-900 rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-7 border border-gray-100 space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-xs font-bold text-[#002B7F] uppercase tracking-wider">
            <Film className="w-4 h-4" />
            <span>Learning Shorts Creator Profile</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Creator Hero Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="relative">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-blue-50 shadow-md ring-2 ring-[#002B7F]/20"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#002B7F] text-white p-1.5 rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <h2 className="text-xl font-heading font-black text-gray-900 tracking-tight">
              {author.name}
            </h2>
            <div className="text-xs font-bold text-[#002B7F]">
              {author.role}
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-gray-500">
              <Building className="w-3.5 h-3.5 text-gray-400" />
              <span>{author.department}</span>
            </div>
            <p className="text-xs text-gray-600 pt-1 leading-relaxed">
              {author.bio || 'Contributing byte-sized learning moments and architecture patterns.'}
            </p>
          </div>
        </div>

        {/* Creator Stats */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200/70 text-center">
          <div>
            <div className="text-lg font-black text-[#002B7F] font-mono">
              {publishedShorts.length}
            </div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
              Published Shorts
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-gray-900 font-mono">
              {totalViews.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
              Total Views
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-rose-600 font-mono">
              {totalLikes.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
              Total Likes
            </div>
          </div>
        </div>

        {/* Published Shorts Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Published Shorts ({publishedShorts.length})
            </h3>
            <span className="text-[11px] text-gray-500">Click any short to watch</span>
          </div>

          {publishedShorts.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Film className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-500">No approved public Shorts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {publishedShorts.map(short => (
                <div
                  key={short.id}
                  onClick={() => {
                    onSelectShort(short);
                    onClose();
                  }}
                  className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 cursor-pointer shadow-xs hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  {/* Thumbnail */}
                  {short.mediaType === 'video' ? (
                    <video
                      src={short.mediaUrls[0]}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={short.mediaUrls[0]}
                      alt={short.title}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent group-hover:from-black/95 transition-colors" />

                  {/* Play icon overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-[#002B7F] text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom details */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-1">
                    <p className="text-[11px] font-bold text-white line-clamp-2 leading-snug">
                      {short.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-300 font-mono">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {short.viewsCount}
                      </span>
                      <span className="flex items-center gap-1 text-rose-300">
                        <Heart className="w-3 h-3 fill-rose-300" />
                        {short.likesCount}
                      </span>
                    </div>
                  </div>

                  {/* Media type badge */}
                  <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white uppercase backdrop-blur-xs">
                    {short.mediaType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfileModal;
