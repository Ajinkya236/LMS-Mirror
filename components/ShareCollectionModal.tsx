import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { LearningCollection } from '../services/collectionsService';

interface ShareCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: LearningCollection | null;
  onToast?: (msg: string) => void;
}

export const ShareCollectionModal: React.FC<ShareCollectionModalProps> = ({
  isOpen,
  onClose,
  collection,
  onToast
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !collection) return null;

  // Generate clean TinyURL format for the collection
  const shortId = collection.id.replace(/^col_/, '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'learn';
  const tinyUrl = `https://tinyurl.com/jio-${shortId}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tinyUrl);
      setCopied(true);
      if (onToast) {
        onToast('Collection link copied to clipboard!');
      }
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white text-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100 space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#002B7F] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-gray-900">Share Collection</h3>
              <p className="text-xs text-gray-500">Anyone with the link can view this collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collection Summary */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
          <img
            src={collection.coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&q=80'}
            alt={collection.title}
            className="w-13 h-13 rounded-xl object-cover flex-shrink-0 shadow-xs"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-gray-900 truncate">{collection.title}</h4>
            <p className="text-xs text-gray-500 line-clamp-1">{collection.description || 'Curated learning collection'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-semibold text-[#002B7F] bg-blue-50 px-2.5 py-0.5 rounded-full">
                {collection.items?.length || collection.courseIds?.length || 0} items
              </span>
              <span className="text-[11px] text-gray-400">
                • {collection.isPublic ? 'Public' : 'Private (accessible via link)'}
              </span>
            </div>
          </div>
        </div>

        {/* URL Box with Copy Link Button */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-2xl p-2 focus-within:border-[#002B7F] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input
              type="text"
              readOnly
              value={tinyUrl}
              className="flex-1 bg-transparent text-gray-800 text-xs px-2.5 py-1.5 font-mono focus:outline-hidden select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#002B7F] hover:bg-[#0a47d0] text-white active:scale-95'
              }`}
              title="Copy Link"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareCollectionModal;
