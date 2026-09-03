// components/forms/SectionManager.tsx
import React, { useState } from 'react';
import { FormSection } from '../../types/forms';
import {
  Layers,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Edit2,
  Check,
  X,
  FileText
} from 'lucide-react';

interface SectionManagerProps {
  sections: FormSection[];
  onUpdateSections: (sections: FormSection[]) => void;
  activeSectionId?: string;
  onSelectSection?: (sectionId: string) => void;
  onAddQuestionToSection: (sectionId: string) => void;
}

export const SectionManager: React.FC<SectionManagerProps> = ({
  sections,
  onUpdateSections,
  activeSectionId,
  onSelectSection,
  onAddQuestionToSection,
}) => {
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleAddSection = () => {
    const newSection: FormSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `Section ${sections.length + 1}`,
      description: 'Enter section instructions or topic context',
      order: sections.length
    };
    onUpdateSections([...sections, newSection]);
  };

  const handleStartEdit = (sec: FormSection) => {
    setEditingSectionId(sec.id);
    setEditTitle(sec.title);
    setEditDesc(sec.description || '');
  };

  const handleSaveEdit = (secId: string) => {
    const updated = sections.map(s =>
      s.id === secId
        ? { ...s, title: editTitle.trim() || 'Untitled Section', description: editDesc.trim() }
        : s
    );
    onUpdateSections(updated);
    setEditingSectionId(null);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    // re-index order
    const reordered = newSections.map((s, i) => ({ ...s, order: i }));
    onUpdateSections(reordered);
  };

  const handleDeleteSection = (secId: string) => {
    if (sections.length <= 1) return;
    const filtered = sections.filter(s => s.id !== secId).map((s, i) => ({ ...s, order: i }));
    onUpdateSections(filtered);
  };

  return (
    <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold font-heading text-slate-800">
              Form Sections ({sections.length})
            </h4>
            <p className="text-[11px] text-slate-500">
              Group questions logically with distinct section titles and respondent progress steps
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddSection}
          className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Section</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {sections.map((sec, idx) => {
          const isEditing = editingSectionId === sec.id;
          const isActive = activeSectionId === sec.id;

          return (
            <div
              key={sec.id}
              className={`p-3 rounded-xl border transition-all ${
                isActive
                  ? 'bg-white border-indigo-400 ring-2 ring-indigo-100 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Section Title"
                    className="w-full px-2.5 py-1 text-xs font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Section Description"
                    className="w-full px-2.5 py-1 text-[11px] text-slate-600 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center justify-end gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingSectionId(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(sec.id)}
                      className="px-2 py-1 bg-indigo-600 text-white rounded-md text-[11px] font-bold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs text-slate-800 truncate">
                        {sec.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSection(idx, 'up')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move section up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sections.length - 1}
                        onClick={() => handleMoveSection(idx, 'down')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move section down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(sec)}
                        className="p-1 text-slate-400 hover:text-indigo-600"
                        title="Edit section title"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={sections.length <= 1}
                        onClick={() => handleDeleteSection(sec.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20"
                        title="Delete section"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {sec.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                      {sec.description}
                    </p>
                  )}

                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <button
                      type="button"
                      onClick={() => onAddQuestionToSection(sec.id)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Question Here</span>
                    </button>
                    {onSelectSection && (
                      <button
                        type="button"
                        onClick={() => onSelectSection(sec.id)}
                        className="text-slate-400 hover:text-slate-600 font-semibold"
                      >
                        {isActive ? 'Selected' : 'Filter View'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
