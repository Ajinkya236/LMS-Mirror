import React, { useState } from 'react';
import { X, Copy, Check, Share2, Link as LinkIcon, Users, Send } from 'lucide-react';
import { LearningCollection, collectionsService } from '../services/collectionsService';

interface ShareCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: LearningCollection | null;
  onToast?: (msg: string) => void;
}

const mockColleagues = [
  { id: 'u1', name: 'Sandeep Gupta', role: 'Leadership Track', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80' },
  { id: 'u2', name: 'Rahul Verma', role: 'Product Manager', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80' },
  { id: 'u3', name: 'Anika Singh', role: 'Data Science', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80' },
  { id: 'u4', name: 'Alex Chen', role: 'Senior Mentor', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80' }
];

export const ShareCollectionModal: React.FC<ShareCollectionModalProps> = ({
  isOpen,
  onClose,
  collection,
  onToast
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  if (!isOpen || !collection) return null;

  // Generate clean TinyURL format for the collection
  const shortId = collection.id.replace(/^col_/, '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'learn';
  const tinyUrl = `https://tinyurl.com/jio-${shortId}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tinyUrl);
      setCopied(true);
      if (onToast) {
        onToast('TinyURL copied to clipboard!');
      }
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSendShare = () => {
    if (selectedUserIds.length === 0) {
      handleCopy();
      onClose();
      return;
    }

    const selectedNames = mockColleagues
      .filter(u => selectedUserIds.includes(u.id))
      .map(u => u.name);

    collectionsService.shareCollectionWithUser(collection.id, selectedNames.join(', '));
    if (onToast) {
      onToast(`Collection shared with ${selectedNames.join(', ')}!`);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white text-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 space-y-5 animate-scale-up"
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
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200/80">
          <img
            src={collection.coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop&q=80'}
            alt={collection.title}
            className="w-13 h-13 rounded-lg object-cover flex-shrink-0 shadow-xs"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-gray-900 truncate">{collection.title}</h4>
            <p className="text-xs text-gray-500 line-clamp-1">{collection.description || 'Curated learning collection'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-semibold text-[#002B7F] bg-blue-50 px-2 py-0.5 rounded-md">
                {collection.items?.length || collection.courseIds?.length || 0} items
              </span>
              <span className="text-[11px] text-gray-400">
                • {collection.isPublic ? 'Public' : 'Private (accessible via link)'}
              </span>
            </div>
          </div>
        </div>

        {/* TinyURL Input Section with Copy Button */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-[#002B7F]" />
            <span>Collection TinyURL</span>
          </label>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-xl p-1.5 focus-within:border-[#002B7F] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input
              type="text"
              readOnly
              value={tinyUrl}
              className="flex-1 bg-transparent text-gray-800 text-xs px-2.5 py-1.5 font-mono focus:outline-hidden select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#002B7F] hover:bg-[#0a47d0] text-white active:scale-95'
              }`}
              title="Copy TinyURL"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share with Team & Colleagues */}
        <div className="space-y-2 pt-1 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-700">
            <span className="font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#002B7F]" />
              Direct Share with Colleagues
            </span>
            <span className="text-[11px] text-gray-500">Appears in their "Shared with me"</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {mockColleagues.map(user => {
              const isSelected = selectedUserIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${
                    isSelected ? 'bg-blue-50/80 border-[#002B7F]/40' : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-900 truncate">{user.name}</div>
                      <div className="text-[10px] text-gray-500">{user.role}</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-[#002B7F] text-white' : 'border border-gray-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSendShare}
            className="px-5 py-2 bg-[#002B7F] hover:bg-[#0a47d0] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {selectedUserIds.length > 0 ? (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Share with ({selectedUserIds.length})</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy & Close</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareCollectionModal;
