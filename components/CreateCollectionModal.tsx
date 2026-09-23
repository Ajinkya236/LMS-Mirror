import React, { useState } from 'react';
import { X } from 'lucide-react';
import { collectionsService } from '../services/collectionsService';

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToInclude?: { id: string | number; title: string; imageUrl?: string; provider?: string };
  onCreated: (collectionTitle: string) => void;
}

export const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
  isOpen,
  onClose,
  courseToInclude,
  onCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newCol = collectionsService.createCollection(
      title.trim(),
      description.trim(),
      isPublic,
      courseToInclude
    );

    setTitle('');
    setDescription('');
    onCreated(newCol.title);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#2b3341] text-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-white/10 space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h3 className="text-xl font-bold tracking-tight text-white">Create Collection</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-gray-300 font-medium">
              <label htmlFor="collection-title">Title *</label>
              <span className="text-gray-400 text-[11px]">{title.length}/150 max character limit</span>
            </div>
            <input
              id="collection-title"
              type="text"
              maxLength={150}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tech, Product, Executive Leadership..."
              className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-medium border border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400"
              autoFocus
            />
          </div>

          {/* Description input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-gray-300 font-medium">
              <label htmlFor="collection-description">Description</label>
              <span className="text-gray-400 text-[11px]">{description.length}/500 max character limit</span>
            </div>
            <textarea
              id="collection-description"
              maxLength={500}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="collection for Tech trends, best practices, innovation practices..."
              className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-medium border border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Visibility toggle */}
          <div className="bg-[#1f2633] p-3 rounded-xl flex items-center justify-between border border-white/5">
            <div>
              <div className="text-xs font-bold text-white">Public Collection</div>
              <div className="text-[11px] text-gray-400">Allow colleagues to discover and learn from this collection</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPublic} 
                onChange={(e) => setIsPublic(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a47d0]" />
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs transition-colors shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-2 rounded-lg bg-[#002B7F] hover:bg-[#0a47d0] disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-md"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCollectionModal;
