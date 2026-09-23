import React, { useState, useEffect } from 'react';
import { X, Plus, Bookmark, Check } from 'lucide-react';
import { collectionsService, LearningCollection } from '../services/collectionsService';
import CreateCollectionModal from './CreateCollectionModal';

interface SelectCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: { id: string | number; title: string; imageUrl?: string; provider?: string };
  onToast: (msg: string) => void;
}

export const SelectCollectionModal: React.FC<SelectCollectionModalProps> = ({
  isOpen,
  onClose,
  course,
  onToast
}) => {
  const [collections, setCollections] = useState<LearningCollection[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCollections(collectionsService.getCollections());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (collectionId: string) => {
    const result = collectionsService.toggleCourseInCollection(collectionId, course);
    setCollections(collectionsService.getCollections());
    if (result.added) {
      onToast(`Added to collection: ${result.collectionName}`);
      onClose();
    } else {
      onToast(`Removed from collection: ${result.collectionName}`);
    }
  };

  const handleCreated = (collectionTitle: string) => {
    setCollections(collectionsService.getCollections());
    onToast(`Created collection: ${collectionTitle}`);
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
      >
        <div 
          className="bg-[#2d3748] text-white rounded-2xl shadow-2xl max-w-sm w-full p-5 sm:p-6 border border-white/10 space-y-4 animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-lg font-bold tracking-tight text-white">Select Collection</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Collection Items Checkbox List */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {collections.map((col) => {
              const isChecked = col.courseIds.some(cid => String(cid) === String(course.id));
              return (
                <div
                  key={col.id}
                  onClick={() => handleToggle(col.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors select-none group"
                >
                  <div className="flex items-center gap-3">
                    {/* Custom Blue Checkbox */}
                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                      isChecked ? 'bg-[#0052cc] text-white' : 'border-2 border-gray-400 group-hover:border-white bg-transparent'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <span className="text-sm font-medium text-gray-100 group-hover:text-white">
                      {col.title}
                    </span>
                  </div>

                  <Bookmark className={`w-4 h-4 ${
                    isChecked ? 'text-gray-200 fill-gray-200' : 'text-gray-400'
                  }`} />
                </div>
              );
            })}
          </div>

          {/* Bottom + Create new collection button */}
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/15 text-gray-200 hover:text-white text-xs font-bold transition-colors border border-white/10"
            >
              <Plus className="w-4 h-4" />
              <span>Create new collection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Create Collection Modal */}
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        courseToInclude={course}
        onCreated={handleCreated}
      />
    </>
  );
};

export default SelectCollectionModal;
