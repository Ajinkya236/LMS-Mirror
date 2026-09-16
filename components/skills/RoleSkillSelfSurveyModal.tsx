import React, { useState, useEffect } from 'react';
import { 
  XIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  AwardIcon, 
  SparklesIcon, 
  CheckIcon 
} from '../Icons';

export interface SurveySkillItem {
  id: string;
  name: string;
  type: 'Technical' | 'Functional' | 'Behavioral' | 'Domain';
  category: string;
  criticality: 'High' | 'Medium' | 'Low';
  targetLevel: number; // Required level
  currentLevel?: number;
  selfRating?: number;
  skillMeaning: string;
  levels?: {
    level: number;
    name: string;
    description: string;
  }[];
}

interface RoleSkillSelfSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleSkills: SurveySkillItem[];
  initialRatings: Record<string, number>;
  isResubmitting: boolean;
  onSaveDraft: (draftRatings: Record<string, number>) => void;
  onSubmitSurvey: (finalRatings: Record<string, number>) => void;
}

const PROFICIENCY_LEVEL_META = [
  { 
    level: 1, 
    code: 'L1', 
    title: 'Awareness', 
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    shortDesc: 'Basic theoretical understanding; executes foundational tasks with active guidance and checklists.'
  },
  { 
    level: 2, 
    code: 'L2', 
    title: 'Working', 
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-300',
    shortDesc: 'Routine execution capability; handles standard scenarios and problem resolution independently.'
  },
  { 
    level: 3, 
    code: 'L3', 
    title: 'Practitioner', 
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-300',
    shortDesc: 'Autonomous mastery; commissions, designs, and optimizes complex configurations and multi-vendor scenarios.'
  },
  { 
    level: 4, 
    code: 'L4', 
    title: 'Expert', 
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-300',
    shortDesc: 'Authority level; defines enterprise standards, leads architectural blueprints, and mentors teams.'
  }
];

export const RoleSkillSelfSurveyModal: React.FC<RoleSkillSelfSurveyModalProps> = ({
  isOpen,
  onClose,
  roleSkills,
  initialRatings,
  isResubmitting,
  onSaveDraft,
  onSubmitSurvey
}) => {
  const [selectedRatings, setSelectedRatings] = useState<Record<string, number>>({});
  const [draftSavedToast, setDraftSavedToast] = useState<string | null>(null);
  const [showValidationWarning, setShowValidationWarning] = useState<boolean>(false);

  // Sync state when modal opens or initialRatings change
  useEffect(() => {
    if (isOpen) {
      setSelectedRatings({ ...initialRatings });
      setShowValidationWarning(false);
    }
  }, [isOpen, initialRatings]);

  if (!isOpen) return null;

  const totalSkills = roleSkills.length;
  const answeredCount = roleSkills.filter(s => selectedRatings[s.id] !== undefined && selectedRatings[s.id] > 0).length;
  const isAllAnswered = totalSkills > 0 && answeredCount === totalSkills;
  const remainingCount = totalSkills - answeredCount;

  // Handle selecting a proficiency level for a skill (exactly one level per skill)
  const handleSelectLevel = (skillId: string, level: number) => {
    setSelectedRatings(prev => ({
      ...prev,
      [skillId]: level
    }));
    setShowValidationWarning(false);
  };

  // Handle Save Draft
  const handleSaveDraftClick = () => {
    onSaveDraft(selectedRatings);
    setDraftSavedToast('Draft saved successfully! You can resume anytime without losing progress.');
    setTimeout(() => {
      setDraftSavedToast(null);
    }, 3000);
  };

  // Handle Submit
  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllAnswered) {
      setShowValidationWarning(true);
      // Scroll to the first unanswered skill
      const firstUnanswered = roleSkills.find(s => !selectedRatings[s.id]);
      if (firstUnanswered) {
        const el = document.getElementById(`survey-skill-${firstUnanswered.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    onSubmitSurvey(selectedRatings);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6"
      id="role-skill-self-survey-modal"
    >
      <div 
        className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-modal-title"
      >
        {/* ======================================================== */}
        {/* TOP HEADER                                               */}
        {/* ======================================================== */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-start justify-between gap-4 border-b border-slate-800 flex-shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <AwardIcon className="w-3 h-3 text-blue-400" />
                Role Profile Competency Self-Survey
              </span>
              {isResubmitting && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider">
                  Resubmission Mode
                </span>
              )}
            </div>
            <h2 id="survey-modal-title" className="text-xl sm:text-2xl font-black font-heading tracking-tight">
              {isResubmitting ? 'Update / Resubmit Role Self-Survey' : 'Role-Mapped Skill Self-Survey'}
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              Employee: <strong className="text-white">Sandeep Gupta</strong> &middot; Role: <strong className="text-white">Software Development & Platform Engineering (Senior Platform Architect)</strong> &middot; 9 Role-Mapped Skills
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleSaveDraftClick}
              className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Save current selections as draft and resume later"
            >
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SUBHEADER PROGRESS BAR & INSTRUCTIONS                     */}
        {/* ======================================================== */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>Evaluation Progress:</span>
                <span className="text-r-blue font-black">{answeredCount} of {totalSkills} skills assessed</span>
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                isAllAnswered 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                {isAllAnswered ? 'All skills evaluated ✓ Ready to submit' : `${remainingCount} ${remainingCount === 1 ? 'skill' : 'skills'} remaining`}
              </span>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 rounded-full ${isAllAnswered ? 'bg-emerald-500' : 'bg-r-blue'}`}
                style={{ width: `${Math.round((answeredCount / (totalSkills || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Feedback / Toast inside Modal */}
        {draftSavedToast && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fade-in flex-shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{draftSavedToast}</span>
            </div>
            <button 
              type="button"
              onClick={() => setDraftSavedToast(null)}
              className="text-emerald-700 hover:text-emerald-950 text-xs font-black cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Incomplete Submission Warning */}
        {showValidationWarning && !isAllAnswered && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fade-in flex-shrink-0">
            <AlertCircleIcon className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>
              Incomplete survey: You must select a proficiency level (L1–L4) for all {totalSkills} role-mapped skills before submitting ({remainingCount} unanswered).
            </span>
          </div>
        )}

        {/* Empty State when no role-mapped skills exist */}
        {roleSkills.length === 0 ? (
          <div className="p-10 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <AwardIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-black text-slate-900 font-heading">No Role-Mapped Skills Found</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No competencies have been mapped to your current role profile yet. Please check with your manager or Talent Operations administrator.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-r-blue hover:bg-r-blue-dark text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close Survey
            </button>
          </div>
        ) : (
          <>
            {/* ======================================================== */}
            {/* SCROLLABLE BODY: LIST OF ALL ROLE-MAPPED SKILLS          */}
            {/* ======================================================== */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl text-xs text-slate-700 flex items-start gap-3">
            <SparklesIcon className="w-4 h-4 text-r-blue flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-slate-900">
                Instructions for Employee Self-Evaluation:
              </p>
              <p className="mt-0.5 text-slate-600 leading-relaxed">
                For each role-mapped skill below, your <strong>Required Proficiency Level</strong> is highlighted. Select exactly one proficiency level (L1 to L4) that genuinely reflects your current practical independence. You can save your draft at any point and resume later.
              </p>
            </div>
          </div>

          <form id="role-survey-form" onSubmit={handleSubmitClick} className="space-y-6">
            {roleSkills.map((skill, index) => {
              const currentRating = selectedRatings[skill.id];
              const isAnswered = currentRating !== undefined && currentRating > 0;
              const targetLevel = skill.targetLevel || 3;
              const targetMeta = PROFICIENCY_LEVEL_META.find(p => p.level === targetLevel);

              return (
                <div 
                  key={skill.id}
                  id={`survey-skill-${skill.id}`}
                  className={`p-5 rounded-2xl border transition-all duration-200 ${
                    isAnswered 
                      ? 'bg-white border-gray-200 shadow-xs' 
                      : showValidationWarning 
                      ? 'bg-rose-50/30 border-rose-300 ring-2 ring-rose-200' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Skill Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h3 className="font-heading font-extrabold text-base text-slate-900">
                          {skill.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                          {skill.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          skill.criticality === 'High' 
                            ? 'bg-orange-50 text-orange-700 border-orange-200' 
                            : skill.criticality === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}>
                          Criticality: {skill.criticality}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 font-normal leading-relaxed">
                        {skill.skillMeaning}
                      </p>
                    </div>

                    {/* REQUIRED PROFICIENCY LEVEL SHOWN PROMINENTLY */}
                    <div className="self-start sm:self-center flex-shrink-0">
                      <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-2 shadow-3xs">
                        <span className="text-[10px] uppercase font-black text-indigo-900 tracking-wider">
                          Required Level:
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white font-black text-xs">
                          L{targetLevel} &middot; {targetMeta?.title || `Level ${targetLevel}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Proficiency Level Selection (L1 to L4) */}
                  <div className="pt-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-800">
                        Select Your Self-Assessed Proficiency Level: <span className="text-rose-600">*</span>
                      </label>
                      {isAnswered && (
                        <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                          <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                          Selected: L{currentRating} ({PROFICIENCY_LEVEL_META.find(p => p.level === currentRating)?.title})
                        </span>
                      )}
                    </div>

                    {/* 4 Selection Options (L1-L4) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {PROFICIENCY_LEVEL_META.map((meta) => {
                        const isSelected = currentRating === meta.level;
                        const isTarget = meta.level === targetLevel;
                        // Skill-specific custom level text if present in skill.levels
                        const specificLevel = skill.levels?.find(l => l.level === meta.level);
                        const displayDesc = specificLevel?.description || meta.shortDesc;
                        const displayName = specificLevel?.name || meta.title;

                        return (
                          <button
                            key={meta.level}
                            type="button"
                            onClick={() => handleSelectLevel(skill.id, meta.level)}
                            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 cursor-pointer relative ${
                              isSelected
                                ? 'bg-blue-50/80 border-r-blue ring-2 ring-r-blue/30 shadow-xs'
                                : 'bg-white hover:bg-slate-50 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="space-y-1.5 w-full">
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5">
                                  {/* Radio indicator */}
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                    isSelected 
                                      ? 'border-r-blue bg-r-blue text-white' 
                                      : 'border-gray-300 bg-white'
                                  }`}>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                  <span className={`text-xs font-black ${isSelected ? 'text-r-blue' : 'text-slate-800'}`}>
                                    {meta.code}: {displayName}
                                  </span>
                                </div>

                                {isTarget && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300">
                                    Target
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-gray-600 leading-snug font-medium line-clamp-3">
                                {displayDesc}
                              </p>
                            </div>

                            {/* Footer comparison pill */}
                            <div className="pt-2 mt-2 border-t border-gray-150/70 flex items-center justify-between text-[10px]">
                              <span className={isSelected ? 'text-r-blue font-bold' : 'text-gray-400 font-medium'}>
                                {isSelected ? '✓ Selected' : 'Click to select'}
                              </span>
                              {meta.level >= targetLevel ? (
                                <span className="text-emerald-700 font-bold">
                                  {meta.level === targetLevel ? 'Meets requirement' : 'Exceeds target'}
                                </span>
                              ) : (
                                <span className="text-amber-700 font-bold">
                                  {targetLevel - meta.level} lvl below target
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })}
          </form>

        </div>

        {/* ======================================================== */}
        {/* STICKY FOOTER CONTROLS                                    */}
        {/* ======================================================== */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraftClick}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-gray-300 transition-colors shadow-3xs cursor-pointer"
            >
              Save Draft & Resume Later
            </button>
            <span className="text-xs text-gray-500 font-medium">
              {isAllAnswered ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                  All 9 skills evaluated
                </span>
              ) : (
                <span>{remainingCount} more {remainingCount === 1 ? 'skill' : 'skills'} required to submit</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitClick}
              disabled={!isAllAnswered}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
                isAllAnswered 
                  ? 'bg-r-blue hover:bg-r-blue-dark text-white' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title={isAllAnswered ? 'Submit your completed self-assessment survey' : 'All 9 skills must have a proficiency level selected before submitting'}
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>{isResubmitting ? 'Over-write & Resubmit Survey' : 'Submit Self-Survey'}</span>
            </button>
          </div>
        </div>
          </>
        )}

      </div>
    </div>
  );
};
export default RoleSkillSelfSurveyModal;
