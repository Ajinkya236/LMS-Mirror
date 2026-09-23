import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Compass, Edit3, Share2, Trash2, X } from 'lucide-react';
import { LearningCollection } from '../services/collectionsService';
import ShareCollectionModal from './ShareCollectionModal';

interface CollectionCardProps {
  collection: LearningCollection;
  onEdit?: (collection: LearningCollection) => void;
  onDelete?: (collectionId: string) => void;
  onShare?: (collection: LearningCollection) => void;
  onExplore?: (collection: LearningCollection) => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onEdit,
  onDelete,
  onShare,
  onExplore
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = collection.author === 'You' || collection.isOwner === true;

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = () => {
    if (onExplore) {
      onExplore(collection);
    } else {
      navigate(`/mylearning?tab=saved-collections&collection=${collection.id}`);
    }
  };

  const handleExplore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    if (onExplore) {
      onExplore(collection);
    } else {
      navigate(`/mylearning?tab=saved-collections&collection=${collection.id}`);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    if (onEdit) {
      onEdit(collection);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    if (onShare) {
      onShare(collection);
    } else {
      setIsShareModalOpen(true);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    if (onDelete) {
      onDelete(collection.id);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`bg-white rounded-xl group h-full flex flex-col relative border border-gray-100 shadow-xs hover:shadow-md transition-all cursor-pointer ${
          menuOpen ? 'z-30' : 'z-0'
        }`}
      >
        {/* Top Cover Image with Items Badge Overlay */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-xl bg-slate-900">
          <img
            src={
              collection.coverImage ||
              'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&q=80'
            }
            alt={collection.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Item count overlay badge in top-right */}
          <div className="absolute top-2.5 right-2.5 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
            {collection.items?.length || collection.courseIds?.length || 0}{' '}
            {(collection.items?.length || collection.courseIds?.length || 0) === 1 ? 'item' : 'items'}
          </div>

          {/* Visibility / Shared badge in top-left */}
          {collection.sharedWithMe && !isOwner && (
            <div className="absolute top-2.5 left-2.5 bg-[#002B7F]/85 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
              <span>Shared with you</span>
            </div>
          )}
        </div>

        {/* Card Content: Title and Three-Dot Options */}
        <div className="p-3.5 flex items-center justify-between gap-3 min-h-[56px]">
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#0a47d0] transition-colors truncate flex-1">
            {collection.title}
          </h3>

          {/* Three Dots Button & Dropdown Menu */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Collection Options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* Dark Floating Dropdown Menu matching CourseCard style */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[#374151] text-white rounded-xl shadow-2xl z-50 border border-white/10 py-1.5 animate-scale-up">
                {/* 1. Explore (Always visible) */}
                <button
                  type="button"
                  onClick={handleExplore}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-100 hover:bg-white/10 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <Compass className="w-4 h-4 text-gray-300" />
                  <span>Explore</span>
                </button>

                {/* 2. Edit (ONLY if Owner/Creator) */}
                {isOwner && onEdit && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-100 hover:bg-white/10 hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-gray-300" />
                    <span>Edit</span>
                  </button>
                )}

                {/* 3. Share (Always visible) */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-100 hover:bg-white/10 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-gray-300" />
                  <span>Share</span>
                </button>

                {/* 4. Delete (ONLY if Owner/Creator) */}
                {isOwner && onDelete && collection.id !== 'col_watch_later' && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center gap-2.5 transition-colors border-t border-white/10 mt-1 pt-2"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal Popup */}
      <ShareCollectionModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        collection={collection}
        onToast={triggerToast}
      />

      {/* Floating Bottom Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-gray-900 border border-gray-200 text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full shadow-2xl flex items-center gap-3 z-[9999] animate-fade-in-up">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};

export default CollectionCard;
