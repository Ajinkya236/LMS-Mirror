// components/forms/BranchingRuleModal.tsx
import React, { useState } from 'react';
import { FormQuestion, FormSection, BranchingRule, BranchTargetAction } from '../../types/forms';
import { GitBranch, X, Check, ArrowRight, ShieldCheck, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface BranchingRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: FormQuestion;
  questionIndex: number;
  allQuestions: FormQuestion[];
  allSections: FormSection[];
  onSaveRules: (rules: BranchingRule[]) => void;
}

export const BranchingRuleModal: React.FC<BranchingRuleModalProps> = ({
  isOpen,
  onClose,
  question,
  questionIndex,
  allQuestions,
  allSections,
  onSaveRules,
}) => {
  const [rules, setRules] = useState<BranchingRule[]>(() => {
    const existing = question.branchingRules || [];
    const options = question.options || [];
    // Initialize default rules for each option if not already set
    return options.map(opt => {
      const found = existing.find(r => r.optionId === opt.id);
      return found || {
        optionId: opt.id,
        targetAction: 'next' as BranchTargetAction
      };
    });
  });

  if (!isOpen) return null;

  // STRICT FORWARD-ONLY RULE: Only allow questions strictly AFTER this question
  const forwardQuestions = allQuestions.slice(questionIndex + 1);

  // Find current section index and only allow forward sections
  const currentSectionId = question.sectionId;
  const currentSectionIndex = allSections.findIndex(s => s.id === currentSectionId);
  const forwardSections = currentSectionIndex >= 0
    ? allSections.slice(currentSectionIndex + 1)
    : allSections;

  const handleActionChange = (optionId: string, action: BranchTargetAction) => {
    setRules(prev =>
      prev.map(r => {
        if (r.optionId !== optionId) return r;
        let targetId = r.targetId;
        if (action === 'question') {
          targetId = forwardQuestions.length > 0 ? forwardQuestions[0].id : undefined;
        } else if (action === 'section') {
          targetId = forwardSections.length > 0 ? forwardSections[0].id : undefined;
        } else {
          targetId = undefined;
        }
        return {
          ...r,
          targetAction: action,
          targetId
        };
      })
    );
  };

  const handleTargetIdChange = (optionId: string, targetId: string) => {
    setRules(prev =>
      prev.map(r => (r.optionId === optionId ? { ...r, targetId } : r))
    );
  };

  const handleSave = () => {
    onSaveRules(rules);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <GitBranch className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
              Logic & Forward Branching
            </span>
          </div>
          <h3 className="text-lg font-bold font-heading text-white">
            Branching Rules for Question {questionIndex + 1}
          </h3>
          <p className="text-xs text-slate-300 mt-1 line-clamp-1">
            "{question.title}"
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-indigo-50/80 border-b border-indigo-100 px-5 py-3 flex items-center gap-2.5 text-xs text-indigo-900">
          <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <div className="leading-relaxed">
            <strong>Forward-Only Rule Enforced:</strong> You can only branch to subsequent questions or forward sections to prevent infinite cycles.
          </div>
        </div>

        {/* Options Branching Mapping */}
        <div className="p-5 max-h-[55vh] overflow-y-auto space-y-4">
          {question.options && question.options.length > 0 ? (
            <div className="space-y-3">
              {question.options.map((opt, optIdx) => {
                const rule = rules.find(r => r.optionId === opt.id) || {
                  optionId: opt.id,
                  targetAction: 'next' as BranchTargetAction
                };

                return (
                  <div
                    key={opt.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="font-bold text-xs text-slate-800">
                          If Respondent selects: <span className="text-indigo-700 font-semibold">"{opt.text}"</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Target Action */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Then:
                        </label>
                        <select
                          value={rule.targetAction}
                          onChange={(e) =>
                            handleActionChange(opt.id, e.target.value as BranchTargetAction)
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 text-xs"
                        >
                          <option value="next">Continue to Next Question</option>
                          <option value="question" disabled={forwardQuestions.length === 0}>
                            Jump to Specific Question {forwardQuestions.length === 0 ? '(None ahead)' : ''}
                          </option>
                          <option value="section" disabled={forwardSections.length === 0}>
                            Jump to Specific Section {forwardSections.length === 0 ? '(None ahead)' : ''}
                          </option>
                          <option value="end">Jump to End of Form & Submit</option>
                        </select>
                      </div>

                      {/* Target Dropdown (Question or Section) */}
                      {rule.targetAction === 'question' && (
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Target Forward Question:
                          </label>
                          <select
                            value={rule.targetId || (forwardQuestions[0]?.id ?? '')}
                            onChange={(e) => handleTargetIdChange(opt.id, e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 text-xs truncate"
                          >
                            {forwardQuestions.map((fq, fqIdx) => {
                              const absoluteIndex = questionIndex + 1 + fqIdx + 1;
                              return (
                                <option key={fq.id} value={fq.id}>
                                  Q{absoluteIndex}: {fq.title.substring(0, 45)}...
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}

                      {rule.targetAction === 'section' && (
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Target Forward Section:
                          </label>
                          <select
                            value={rule.targetId || (forwardSections[0]?.id ?? '')}
                            onChange={(e) => handleTargetIdChange(opt.id, e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 text-xs truncate"
                          >
                            {forwardSections.map((fs) => (
                              <option key={fs.id} value={fs.id}>
                                {fs.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              No choices defined yet. Add options to this question to configure branching.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply Branching Rules</span>
          </button>
        </div>
      </div>
    </div>
  );
};
