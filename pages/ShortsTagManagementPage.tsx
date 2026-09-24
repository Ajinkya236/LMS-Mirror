import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Tag,
  Plus,
  Trash2,
  AlertCircle,
  Search,
  X,
  ShieldCheck,
  Check
} from 'lucide-react';
import { shortsService } from '../services/shortsService';

export const ShortsTagManagementPage: React.FC = () => {
  const navigate = useNavigate();

  const [tags, setTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  // Tag deletion confirmation popup modal state
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadTags = () => {
    setTags(shortsService.getPredefinedTags());
  };

  useEffect(() => {
    loadTags();
  }, []);

  const filteredTags = tags.filter(t =>
    t.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Add single tag
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const res = shortsService.addPredefinedTag(newTagInput);
    if (res.success) {
      setNewTagInput('');
      loadTags();
      showToast('✅ Enterprise tag added successfully!');
    } else {
      setAddError(res.error || 'Failed to add tag');
    }
  };

  // Confirm delete tag from popup
  const handleConfirmDeleteTag = () => {
    if (!tagToDelete) return;
    shortsService.removePredefinedTag(tagToDelete);
    showToast(`🗑️ Deleted tag "${tagToDelete}"`);
    setTagToDelete(null);
    loadTags();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 pt-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/shorts/moderation')}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Back to Moderation"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Tag className="w-6 h-6 text-[#002B7F]" />
                <h1 className="text-xl font-bold text-gray-900">
                  Enterprise Tags & Taxonomy
                </h1>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maintain standard predefined learning tags and topics available across the enterprise
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/shorts/moderation')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors border border-gray-200 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Moderation Queue</span>
            </button>
          </div>
        </div>

        {/* Add New Single Tag Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm mb-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Add Enterprise Learning Tag</h2>
          <form onSubmit={handleAddTag} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="e.g. #SystemDesign or #DeepLearning"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 focus:border-[#002B7F] rounded-xl text-xs text-gray-900 focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#002B7F] hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tag</span>
            </button>
          </form>

          {addError && (
            <p className="text-xs text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{addError}</span>
            </p>
          )}
        </div>

        {/* Current Active Tags List */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">
                Active Enterprise Topics ({tags.length})
              </h2>
            </div>

            {/* Filter tags search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tags..."
                className="w-full pl-9 pr-8 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#002B7F]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {filteredTags.map(tag => (
              <div
                key={tag}
                className="p-3 bg-gray-50 hover:bg-blue-50/50 rounded-2xl border border-gray-200 flex items-center justify-between transition-colors group"
              >
                <span className="font-mono font-bold text-xs text-gray-800 group-hover:text-[#002B7F]">
                  {tag}
                </span>
                <button
                  onClick={() => setTagToDelete(tag)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title={`Delete tag ${tag}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {filteredTags.length === 0 && (
            <div className="py-8 text-center text-xs text-gray-500">
              No enterprise tags matching "{searchQuery}".
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Popup Modal for Tag Deletion */}
      {tagToDelete && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setTagToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 space-y-4 animate-scale-up text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                onClick={() => setTagToDelete(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">
                Delete Enterprise Tag?
              </h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to delete <strong className="text-gray-900 font-mono">{tagToDelete}</strong> from enterprise topics? It will no longer appear in the predefined suggestions list.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setTagToDelete(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteTag}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Delete Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full shadow-2xl z-[99999] animate-fade-in-up border border-gray-700">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ShortsTagManagementPage;
