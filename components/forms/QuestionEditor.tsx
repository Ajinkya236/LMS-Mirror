// components/forms/QuestionEditor.tsx
import React, { useState } from 'react';
import {
  FormQuestion,
  FormSection,
  FormType,
  QuestionType,
  QuestionOption,
  BranchingRule,
} from '../../types/forms';
import {
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Plus,
  HelpCircle,
  Award,
  Star,
  Heart,
  ThumbsUp,
  Hash,
  CheckCircle2,
  GitBranch,
  Settings2,
  Table,
  CheckSquare,
  ListFilter,
  Type,
  AlignLeft,
  X,
  Sliders,
  Layers,
  ArrowRight
} from 'lucide-react';
import { BranchingRuleModal } from './BranchingRuleModal';

interface QuestionEditorProps {
  question: FormQuestion;
  index: number;
  totalQuestions: number;
  formType: FormType;
  sections: FormSection[];
  allQuestions: FormQuestion[];
  onUpdate: (updated: FormQuestion) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  totalQuestions,
  formType,
  sections,
  allQuestions,
  onUpdate,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const [showBranchingModal, setShowBranchingModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Normalize normalized question type
  const isQuiz = formType === 'Quiz';

  const handleTypeChange = (newType: QuestionType) => {
    let updates: Partial<FormQuestion> = { type: newType };

    if (newType === 'choice' || newType === 'single_choice' || newType === 'multiple_choice') {
      if (!question.options || question.options.length === 0) {
        updates.options = [
          { id: `opt-${Date.now()}-1`, text: 'Option 1' },
          { id: `opt-${Date.now()}-2`, text: 'Option 2' },
          { id: `opt-${Date.now()}-3`, text: 'Option 3' },
        ];
        if (isQuiz) {
          updates.correctOptionId = updates.options[0].id;
        }
      }
      if (!question.choiceDisplay) {
        updates.choiceDisplay = 'radio';
      }
    } else if (newType === 'rating') {
      updates.ratingLevels = question.ratingLevels || 5;
      updates.ratingIcon = question.ratingIcon || 'star';
      updates.ratingLabels = question.ratingLabels || { min: 'Poor', max: 'Excellent' };
    } else if (newType === 'likert') {
      updates.likertStatements = question.likertStatements || [
        'Content was relevant to my role and daily workflows',
        'Instructor was engaging and responsive to questions',
        'Pace of instruction was well-balanced and clear'
      ];
      updates.likertOptions = question.likertOptions || [
        'Strongly Disagree',
        'Disagree',
        'Neutral',
        'Agree',
        'Strongly Agree'
      ];
    } else if (newType === 'number') {
      updates.numberValidation = question.numberValidation || {
        min: 0,
        max: 100,
        step: 1,
        allowDecimals: false,
        placeholder: 'Enter a number...'
      };
    }

    onUpdate({ ...question, ...updates });
  };

  // Option handlers
  const handleAddOption = () => {
    const newId = `opt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newOptions: QuestionOption[] = [
      ...(question.options || []),
      { id: newId, text: `Option ${(question.options?.length || 0) + 1}` }
    ];
    onUpdate({ ...question, options: newOptions });
  };

  const handleUpdateOption = (optId: string, text: string) => {
    const updatedOptions = (question.options || []).map(opt =>
      opt.id === optId ? { ...opt, text } : opt
    );
    onUpdate({ ...question, options: updatedOptions });
  };

  const handleRemoveOption = (optId: string) => {
    const updatedOptions = (question.options || []).filter(opt => opt.id !== optId);
    let correctId = question.correctOptionId;
    if (correctId === optId) {
      correctId = updatedOptions[0]?.id;
    }
    const correctIds = (question.correctOptionIds || []).filter(id => id !== optId);
    onUpdate({
      ...question,
      options: updatedOptions,
      correctOptionId: correctId,
      correctOptionIds: correctIds
    });
  };

  // Quiz correct answer toggles
  const handleSingleCorrectToggle = (optId: string) => {
    onUpdate({
      ...question,
      correctOptionId: optId
    });
  };

  const handleMultiCorrectToggle = (optId: string) => {
    const current = question.correctOptionIds || [];
    const updated = current.includes(optId)
      ? current.filter(id => id !== optId)
      : [...current, optId];
    onUpdate({
      ...question,
      correctOptionIds: updated
    });
  };

  // Likert Matrix Row/Col Handlers
  const handleAddLikertStatement = () => {
    const updated = [...(question.likertStatements || []), `New Statement ${(question.likertStatements?.length || 0) + 1}`];
    onUpdate({ ...question, likertStatements: updated });
  };

  const handleUpdateLikertStatement = (idx: number, text: string) => {
    const updated = [...(question.likertStatements || [])];
    updated[idx] = text;
    onUpdate({ ...question, likertStatements: updated });
  };

  const handleRemoveLikertStatement = (idx: number) => {
    const updated = (question.likertStatements || []).filter((_, i) => i !== idx);
    onUpdate({ ...question, likertStatements: updated });
  };

  const handleAddLikertOption = () => {
    const updated = [...(question.likertOptions || []), `Option ${(question.likertOptions?.length || 0) + 1}`];
    onUpdate({ ...question, likertOptions: updated });
  };

  const handleUpdateLikertOption = (idx: number, text: string) => {
    const updated = [...(question.likertOptions || [])];
    updated[idx] = text;
    onUpdate({ ...question, likertOptions: updated });
  };

  const handleRemoveLikertOption = (idx: number) => {
    const updated = (question.likertOptions || []).filter((_, i) => i !== idx);
    onUpdate({ ...question, likertOptions: updated });
  };

  const branchingRuleCount = question.branchingRules?.filter(r => r.targetAction !== 'next').length || 0;

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-xs transition-all duration-200 overflow-hidden">
      {/* Header bar */}
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {index + 1}
          </span>

          {/* Question Type Selector */}
          <select
            value={
              question.type === 'single_choice' || question.type === 'multiple_choice'
                ? 'choice'
                : question.type === 'short_text' || question.type === 'long_text'
                ? 'text'
                : question.type
            }
            onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
          >
            <option value="choice">Choice (Single / Multi / Dropdown)</option>
            <option value="text">Text (Short / Long Answer)</option>
            <option value="number">Number (Validated Input)</option>
            <option value="rating">Rating (Star / Heart / Thumb / Scale)</option>
            <option value="likert">Likert Matrix (Rows & Columns)</option>
            <option value="nps">NPS (0-10 Scale)</option>
            <option value="yes_no">Yes / No Binary</option>
          </select>

          {/* Section Assignment */}
          {sections.length > 0 && (
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={question.sectionId || sections[0]?.id || ''}
                onChange={(e) => onUpdate({ ...question, sectionId: e.target.value })}
                className="px-2 py-1 bg-slate-100/80 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 max-w-[140px] truncate"
              >
                {sections.map((sec, sIdx) => (
                  <option key={sec.id} value={sec.id}>
                    Sec {sIdx + 1}: {sec.title.substring(0, 18)}...
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Forward Branching Button */}
          {(question.type === 'choice' || question.type === 'single_choice') && (
            <button
              type="button"
              onClick={() => setShowBranchingModal(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                branchingRuleCount > 0
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-white text-slate-600 hover:text-indigo-600 border border-slate-200 hover:bg-slate-50'
              }`}
              title="Configure forward-only branching rules"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Branching {branchingRuleCount > 0 ? `(${branchingRuleCount})` : ''}</span>
            </button>
          )}

          {/* Move Up */}
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className="p-1 text-slate-500 hover:text-slate-800 disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-200/60 rounded-md"
            title="Move Question Up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Move Down */}
          <button
            type="button"
            disabled={index === totalQuestions - 1}
            onClick={onMoveDown}
            className="p-1 text-slate-500 hover:text-slate-800 disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-200/60 rounded-md"
            title="Move Question Down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-md"
            title="Duplicate Question"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md"
            title="Delete Question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-4">
        {/* Title and Subtitle */}
        <div className="space-y-2">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Question Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={question.title}
              onChange={(e) => onUpdate({ ...question, title: e.target.value })}
              placeholder="e.g. Which operational standard applies to 5G NR?"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Subtitle / Helper Instructions (Optional)
            </label>
            <input
              type="text"
              value={question.subtitle || question.description || ''}
              onChange={(e) =>
                onUpdate({
                  ...question,
                  subtitle: e.target.value,
                  description: e.target.value
                })
              }
              placeholder="e.g. Select the primary specification from the dropdown list below."
              className="w-full px-3 py-1.5 bg-slate-50/30 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-xs text-slate-600 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Question Type Specific Body */}

        {/* 1. CHOICE QUESTION */}
        {(question.type === 'choice' || question.type === 'single_choice' || question.type === 'multiple_choice') && (
          <div className="space-y-3 pt-1">
            {/* Display & Multiple Choice Controls */}
            <div className="flex flex-wrap items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Display Style:</span>
                <select
                  value={question.choiceDisplay || (question.multipleAnswers ? 'checkbox' : 'radio')}
                  onChange={(e) => {
                    const mode = e.target.value as 'radio' | 'checkbox' | 'dropdown';
                    onUpdate({
                      ...question,
                      choiceDisplay: mode,
                      multipleAnswers: mode === 'checkbox'
                    });
                  }}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 text-xs"
                >
                  <option value="radio">Radio Buttons (Single Choice)</option>
                  <option value="checkbox">Checkboxes (Multiple Answers)</option>
                  <option value="dropdown">Dropdown Select List</option>
                </select>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={question.multipleAnswers || question.choiceDisplay === 'checkbox'}
                  onChange={(e) => {
                    const isMulti = e.target.checked;
                    onUpdate({
                      ...question,
                      multipleAnswers: isMulti,
                      choiceDisplay: isMulti ? 'checkbox' : 'radio'
                    });
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Multiple Answers</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={question.shuffleOptions || false}
                  onChange={(e) =>
                    onUpdate({ ...question, shuffleOptions: e.target.checked })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Shuffle Options</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={question.allowOther || false}
                  onChange={(e) =>
                    onUpdate({
                      ...question,
                      allowOther: e.target.checked,
                      otherOptionText: question.otherOptionText || 'Other'
                    })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Allow "Other" Option</span>
              </label>
            </div>

            {/* Options List */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Options {isQuiz ? '(Select Correct Answer)' : ''}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {isQuiz ? 'Checkmark designates the scoring answer key' : ''}
                </span>
              </div>

              {(question.options || []).map((opt, optIdx) => {
                const isCorrect = question.multipleAnswers
                  ? (question.correctOptionIds || []).includes(opt.id)
                  : question.correctOptionId === opt.id;

                return (
                  <div key={opt.id} className="flex items-center gap-2">
                    {/* Quiz correct indicator */}
                    {isQuiz && (
                      <button
                        type="button"
                        onClick={() => {
                          if (question.multipleAnswers) {
                            handleMultiCorrectToggle(opt.id);
                          } else {
                            handleSingleCorrectToggle(opt.id);
                          }
                        }}
                        className={`p-1.5 rounded-lg transition-all ${
                          isCorrect
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={isCorrect ? 'Correct Answer' : 'Mark as Correct'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}

                    <span className="text-xs font-bold text-slate-400 w-5 text-center">
                      {String.fromCharCode(65 + optIdx)}
                    </span>

                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => handleUpdateOption(opt.id, e.target.value)}
                      placeholder={`Option ${optIdx + 1}`}
                      className={`flex-1 px-3 py-2 bg-slate-50/50 border rounded-xl text-xs font-semibold focus:outline-none focus:bg-white ${
                        isCorrect && isQuiz
                          ? 'border-emerald-500 bg-emerald-50/30 text-emerald-950'
                          : 'border-slate-200 text-slate-800 focus:border-indigo-500'
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveOption(opt.id)}
                      disabled={(question.options || []).length <= 2}
                      className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {/* "Other" Option preview if active */}
              {question.allowOther && (
                <div className="flex items-center gap-2 p-2 bg-indigo-50/40 border border-dashed border-indigo-200 rounded-xl text-xs text-indigo-900">
                  <span className="font-bold text-indigo-600 w-5 text-center">•</span>
                  <input
                    type="text"
                    value={question.otherOptionText || 'Other (Please specify)'}
                    onChange={(e) => onUpdate({ ...question, otherOptionText: e.target.value })}
                    className="flex-1 px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-950"
                  />
                  <span className="text-[10px] text-indigo-500 font-medium italic">
                    (Respondent enters text)
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddOption}
                className="mt-1 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50/60 hover:bg-indigo-100 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Choice Option</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. TEXT QUESTION */}
        {(question.type === 'text' || question.type === 'short_text' || question.type === 'long_text') && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">Text Mode:</span>
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name={`text-mode-${question.id}`}
                  checked={question.type === 'short_text' || question.type === 'text'}
                  onChange={() => onUpdate({ ...question, type: 'short_text' })}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Single-line Short Text</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                <input
                  type="radio"
                  name={`text-mode-${question.id}`}
                  checked={question.type === 'long_text'}
                  onChange={() => onUpdate({ ...question, type: 'long_text' })}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Multi-line Long Feedback / Paragraph</span>
              </label>
            </div>

            <div className="p-3 bg-slate-100/50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 italic">
              {question.type === 'long_text'
                ? 'Respondents will see an expandable multiline rich text box.'
                : 'Respondents will see a clean single-line input field.'}
            </div>
          </div>
        )}

        {/* 3. NUMBER QUESTION */}
        {question.type === 'number' && (
          <div className="space-y-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-indigo-600" />
                <span>Number Bounds & Formatting</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Min Value
                  </label>
                  <input
                    type="number"
                    value={question.numberValidation?.min ?? 0}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        numberValidation: {
                          ...question.numberValidation,
                          min: e.target.value === '' ? undefined : Number(e.target.value)
                        }
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Max Value
                  </label>
                  <input
                    type="number"
                    value={question.numberValidation?.max ?? 100}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        numberValidation: {
                          ...question.numberValidation,
                          max: e.target.value === '' ? undefined : Number(e.target.value)
                        }
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Step
                  </label>
                  <input
                    type="number"
                    value={question.numberValidation?.step ?? 1}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        numberValidation: {
                          ...question.numberValidation,
                          step: Number(e.target.value) || 1
                        }
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Unit / Suffix
                  </label>
                  <input
                    type="text"
                    value={question.numberValidation?.unit || ''}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        numberValidation: {
                          ...question.numberValidation,
                          unit: e.target.value
                        }
                      })
                    }
                    placeholder="e.g. hrs, %, kg"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={question.numberValidation?.allowDecimals || false}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        numberValidation: {
                          ...question.numberValidation,
                          allowDecimals: e.target.checked
                        }
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Allow Decimal / Floating Point Numbers</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 4. RATING QUESTION */}
        {question.type === 'rating' && (
          <div className="space-y-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">Rating Levels:</span>
                  <div className="flex items-center gap-1">
                    {[3, 4, 5, 7, 10].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() =>
                          onUpdate({
                            ...question,
                            ratingLevels: lvl,
                            maxRating: lvl
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          (question.ratingLevels || 5) === lvl
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Icon Style:</span>
                  <div className="flex items-center gap-1">
                    {[
                      { icon: 'star', label: 'Star', comp: Star },
                      { icon: 'heart', label: 'Heart', comp: Heart },
                      { icon: 'thumb', label: 'Thumb', comp: ThumbsUp },
                      { icon: 'number', label: 'Number', comp: Hash },
                    ].map(({ icon, label, comp: IconComp }) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() =>
                          onUpdate({
                            ...question,
                            ratingIcon: icon as any
                          })
                        }
                        className={`p-1.5 rounded-lg transition-all ${
                          (question.ratingIcon || 'star') === icon
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                        title={label}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Min/Mid/Max Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Min Label (1)
                  </label>
                  <input
                    type="text"
                    value={question.ratingLabels?.min || ''}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        ratingLabels: {
                          ...question.ratingLabels,
                          min: e.target.value,
                          max: question.ratingLabels?.max || 'Excellent'
                        }
                      })
                    }
                    placeholder="e.g. Strongly Disagree / Poor"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Mid Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={question.ratingLabels?.mid || ''}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        ratingLabels: {
                          ...question.ratingLabels,
                          min: question.ratingLabels?.min || 'Poor',
                          max: question.ratingLabels?.max || 'Excellent',
                          mid: e.target.value
                        }
                      })
                    }
                    placeholder="e.g. Neutral / Average"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Max Label ({question.ratingLevels || 5})
                  </label>
                  <input
                    type="text"
                    value={question.ratingLabels?.max || ''}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        ratingLabels: {
                          ...question.ratingLabels,
                          min: question.ratingLabels?.min || 'Poor',
                          max: e.target.value
                        }
                      })
                    }
                    placeholder="e.g. Strongly Agree / Outstanding"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. LIKERT MATRIX QUESTION */}
        {question.type === 'likert' && (
          <div className="space-y-4 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              {/* Rows: Statements */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Matrix Statements (Rows)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLikertStatement}
                    className="px-2 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Statement</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {(question.likertStatements || []).map((stmt, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-5 text-center">
                        {sIdx + 1}.
                      </span>
                      <input
                        type="text"
                        value={stmt}
                        onChange={(e) => handleUpdateLikertStatement(sIdx, e.target.value)}
                        placeholder={`Statement ${sIdx + 1}`}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                      />
                      <button
                        type="button"
                        disabled={(question.likertStatements || []).length <= 1}
                        onClick={() => handleRemoveLikertStatement(sIdx)}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded-lg"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columns: Scale Options */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Rating Scale Options (Columns)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLikertOption}
                    className="px-2 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Column Option</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {(question.likertOptions || []).map((colOpt, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400 w-5 text-center">
                        ★
                      </span>
                      <input
                        type="text"
                        value={colOpt}
                        onChange={(e) => handleUpdateLikertOption(cIdx, e.target.value)}
                        placeholder={`Scale ${cIdx + 1}`}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                      />
                      <button
                        type="button"
                        disabled={(question.likertOptions || []).length <= 2}
                        onClick={() => handleRemoveLikertOption(cIdx)}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded-lg"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. YES / NO QUESTION */}
        {question.type === 'yes_no' && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-700">
              Binary Options (Yes / No)
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">
                Option A: Yes / True
              </span>
              <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">
                Option B: No / False
              </span>
            </div>
            {isQuiz && (
              <div className="pt-2 flex items-center gap-3 text-xs">
                <span className="font-bold text-slate-700">Correct Answer:</span>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-emerald-800">
                  <input
                    type="radio"
                    name={`yes-no-correct-${question.id}`}
                    checked={question.correctOptionId === 'y1' || !question.correctOptionId}
                    onChange={() => onUpdate({ ...question, correctOptionId: 'y1' })}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Yes / True</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-emerald-800">
                  <input
                    type="radio"
                    name={`yes-no-correct-${question.id}`}
                    checked={question.correctOptionId === 'n1'}
                    onChange={() => onUpdate({ ...question, correctOptionId: 'n1' })}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>No / False</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* 7. NPS QUESTION */}
        {question.type === 'nps' && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-700">Net Promoter Score (0 - 10 Scale)</div>
            <div className="text-slate-500">
              Standard 11-point button array automatically groups Detractors (0-6), Passives (7-8), and Promoters (9-10).
            </div>
          </div>
        )}

        {/* Footer: Quiz Points, Required, & Explanation */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Required toggle */}
          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onUpdate({ ...question, required: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>Mandatory / Required</span>
          </label>

          {/* Quiz points & explanation */}
          {isQuiz && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-700">Points:</span>
                <input
                  type="number"
                  value={question.points ?? 10}
                  onChange={(e) =>
                    onUpdate({ ...question, points: Math.max(0, parseInt(e.target.value, 10) || 0) })
                  }
                  min={0}
                  step={5}
                  className="w-16 px-2 py-1 bg-amber-50/50 border border-amber-200 rounded-lg font-bold text-amber-950 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                <span>{showAdvanced ? 'Hide Explanation' : '+ Feedback Note'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Quiz Answer Explanation on Review */}
        {isQuiz && showAdvanced && (
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1.5 animate-fade-in">
            <label className="font-bold text-amber-900 block">
              Answer Explanation / Feedback Note (Shown on Result Review)
            </label>
            <textarea
              rows={2}
              value={question.correctExplanation || ''}
              onChange={(e) => onUpdate({ ...question, correctExplanation: e.target.value })}
              placeholder="Explain why this answer is correct to help learners benchmark..."
              className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}
      </div>

      {/* Forward-only Branching Modal */}
      {showBranchingModal && (
        <BranchingRuleModal
          isOpen={showBranchingModal}
          onClose={() => setShowBranchingModal(false)}
          question={question}
          questionIndex={index}
          allQuestions={allQuestions}
          allSections={sections}
          onSaveRules={(rules) => onUpdate({ ...question, branchingRules: rules })}
        />
      )}
    </div>
  );
};
