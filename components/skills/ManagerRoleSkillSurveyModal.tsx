import React, { useState, useEffect, useMemo } from 'react';
import { 
  XIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  SparklesIcon, 
  AwardIcon, 
  InfoIcon,
  ShieldCheckIcon,
  UserIcon
} from '../Icons';
import { ReporteeRoleSkill, TeamMemberProfile } from '../../utils/skillsData';

interface ManagerRoleSkillSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportee: TeamMemberProfile | null;
  isDirectReport: boolean;
  initialRatings?: Record<string, number>;
  isResubmitting?: boolean;
  onSaveDraft: (reporteeId: string, ratings: Record<string, number>) => void;
  onSubmitSurvey: (reporteeId: string, ratings: Record<string, number>) => void;
}

const PROFICIENCY_LEVELS = [
  {
    level: 1,
    name: 'Awareness',
    shortDesc: 'Foundational concepts understood, requires active guidance and oversight.',
    badge: 'L1',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300'
  },
  {
    level: 2,
    name: 'Working',
    shortDesc: 'Applies knowledge to standard tasks with minimal daily supervision.',
    badge: 'L2',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-300'
  },
  {
    level: 3,
    name: 'Practitioner',
    shortDesc: 'Autonomous execution, solves complex issues, standard role target.',
    badge: 'L3',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-300'
  },
  {
    level: 4,
    name: 'Expert',
    shortDesc: 'Deep subject mastery, mentors others, establishes technical standards.',
    badge: 'L4',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-300'
  }
];

export const ManagerRoleSkillSurveyModal: React.FC<ManagerRoleSkillSurveyModalProps> = ({
  isOpen,
  onClose,
  reportee,
  isDirectReport,
  initialRatings = {},
  isResubmitting = false,
  onSaveDraft,
  onSubmitSurvey
}) => {
  const [selectedRatings, setSelectedRatings] = useState<Record<string, number>>({});
  const [draftSavedFeedback, setDraftSavedFeedback] = useState<boolean>(false);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Sync initial ratings whenever modal opens or reportee changes
  useEffect(() => {
    if (isOpen && reportee) {
      const merged: Record<string, number> = { ...initialRatings };
      reportee.roleSkills?.forEach(skill => {
        if (merged[skill.id] === undefined && skill.managerRating !== undefined) {
          merged[skill.id] = skill.managerRating;
        }
      });
      setSelectedRatings(merged);
      setDraftSavedFeedback(false);
      setValidationWarning(null);
    }
  }, [isOpen, reportee, initialRatings]);

  const roleSkills = useMemo(() => reportee?.roleSkills || [], [reportee]);
  const totalSkillsCount = roleSkills.length;
  
  const completedCount = useMemo(() => {
    return roleSkills.filter(sk => selectedRatings[sk.id] !== undefined).length;
  }, [roleSkills, selectedRatings]);

  const isAllRated = totalSkillsCount > 0 && completedCount === totalSkillsCount;
  const progressPercent = totalSkillsCount > 0 ? Math.round((completedCount / totalSkillsCount) * 100) : 0;

  if (!isOpen || !reportee) return null;

  const handleSelectLevel = (skillId: string, level: number) => {
    setSelectedRatings(prev => ({
      ...prev,
      [skillId]: level
    }));
    setValidationWarning(null);
    setDraftSavedFeedback(false);
  };

  const handleSaveDraft = () => {
    onSaveDraft(reportee.id, selectedRatings);
    setDraftSavedFeedback(true);
    setTimeout(() => setDraftSavedFeedback(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllRated) {
      const missingSkill = roleSkills.find(s => selectedRatings[s.id] === undefined);
      setValidationWarning(
        `Please select a manager proficiency level for every role-mapped skill before submitting (${completedCount}/${totalSkillsCount} completed).`
      );
      if (missingSkill) {
        const el = document.getElementById(`manager-skill-item-${missingSkill.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    onSubmitSurvey(reportee.id, selectedRatings);
  };

  return (
    <div 
      id="manager-survey-modal-overlay"
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div 
        id="manager-survey-modal-container"
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-scale-up"
      >
        
        {/* Header Section */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-start gap-4">
            <img 
              src={reportee.photo} 
              alt={reportee.name} 
              className="w-13 h-13 rounded-2xl object-cover ring-2 ring-blue-400/50 shadow-md flex-shrink-0 mt-0.5" 
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider">
                  Manager Competency Evaluation
                </span>
                {isResubmitting && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider">
                    Resubmission / Update
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-semibold">
                  Direct Report
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white flex items-center gap-2">
                <span>{reportee.name}</span>
                <span className="text-sm font-normal text-slate-300">({reportee.grade})</span>
              </h2>
              <p className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <span>{reportee.role}</span>
                <span className="text-slate-500">•</span>
                <span className="text-blue-200">{reportee.department}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={roleSkills.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              title="Save partially selected responses as draft"
            >
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Guard Check for Direct Team List */}
        {!isDirectReport ? (
          <div className="p-10 text-center space-y-4 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertCircleIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-black text-slate-900 font-heading">Access Restricted</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You can only conduct evaluations for employees assigned to your direct team reporting hierarchy.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Return to My Team
            </button>
          </div>
        ) : roleSkills.length === 0 ? (
          /* Empty / Error State: Reportee has no role-mapped skills or role profile is missing (Epic C requirement) */
          <div className="p-10 sm:p-12 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
              <AwardIcon className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full border border-amber-300 uppercase tracking-wider">
                Profile Mapping Required
              </span>
              <h3 className="text-xl font-black text-slate-900 font-heading">
                No Role-Mapped Skills Found
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                There are currently no mapped competencies configured for role profile <strong>"{reportee.role}"</strong> ({reportee.grade}).
              </p>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 text-left space-y-1">
                <span className="font-bold text-slate-800 block">Next Steps:</span>
                <p>• Map competencies for this role profile via the <strong>Skill Admin</strong> tab.</p>
                <p>• Or contact the Jio Talent & Organizational Readiness Operations team.</p>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-r-blue text-white rounded-xl text-xs font-bold hover:bg-r-blue-dark transition-colors shadow-xs"
              >
                Close Survey
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Progress & Guidance Banner */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-black text-slate-900">
                  Manager Progress: {completedCount} of {totalSkillsCount} Skills Evaluated
                </span>
                <div className="w-32 sm:w-44 bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-r-blue h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="font-extrabold text-r-blue">{progressPercent}%</span>
              </div>

              {draftSavedFeedback && (
                <div className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 text-xs font-bold flex items-center gap-1.5 animate-fade-in">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Draft saved! You can resume anytime without losing progress.</span>
                </div>
              )}

              {validationWarning && (
                <div className="text-rose-700 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200 text-xs font-bold flex items-center gap-1.5 animate-fade-in">
                  <AlertCircleIcon className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{validationWarning}</span>
                </div>
              )}
            </div>

            {/* Scrollable Skills Evaluation List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-100/50">
              {roleSkills.map((skill, index) => {
                const selectedLevel = selectedRatings[skill.id];
                const requiredLevel = skill.targetLevel || 3;
                const hasSelected = selectedLevel !== undefined;
                const isGap = hasSelected && selectedLevel < requiredLevel;
                const isMet = hasSelected && selectedLevel >= requiredLevel;

                return (
                  <div
                    key={skill.id}
                    id={`manager-skill-item-${skill.id}`}
                    className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 shadow-xs space-y-4 ${
                      hasSelected 
                        ? 'border-blue-300 ring-1 ring-blue-100' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Skill Header Info */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 pb-3 border-b border-slate-150">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Skill #{index + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                            {skill.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            skill.criticality === 'Critical'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : skill.criticality === 'High'
                              ? 'bg-orange-50 text-orange-800 border-orange-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}>
                            Criticality: {skill.criticality}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 font-heading">
                          {skill.name}
                        </h4>
                        <p className="text-xs text-slate-600 font-normal leading-relaxed max-w-2xl">
                          {skill.description}
                        </p>
                      </div>

                      {/* Required Target Badge */}
                      <div className="flex-shrink-0 self-start p-2 bg-indigo-50/80 rounded-xl border border-indigo-150 text-right space-y-0.5">
                        <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">
                          Role Target
                        </span>
                        <div className="text-xs font-black text-indigo-950 flex items-center gap-1">
                          <AwardIcon className="w-3.5 h-3.5 text-r-blue" />
                          <span>Required: L{skill.targetLevel}</span>
                        </div>
                        <span className="text-[10px] text-indigo-700 font-medium block">
                          {PROFICIENCY_LEVELS.find(l => l.level === skill.targetLevel)?.name || 'Practitioner'}
                        </span>
                      </div>
                    </div>

                    {/* Reportee Self-Rating Comparison Bar */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">Employee Self-Rating:</span>
                        {skill.selfRating !== undefined ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 font-black flex items-center gap-1">
                            <span>L{skill.selfRating}</span>
                            <span className="text-[11px] font-semibold text-blue-700">
                              ({PROFICIENCY_LEVELS.find(l => l.level === skill.selfRating)?.name || 'Working'})
                            </span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold flex items-center gap-1">
                            <InfoIcon className="w-3 h-3 text-amber-600" />
                            <span>Not submitted</span>
                          </span>
                        )}
                      </div>

                      {/* Real-time Gap / Met Status Feedback */}
                      <div>
                        {hasSelected ? (
                          isMet ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-black inline-flex items-center gap-1 shadow-3xs">
                              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                              Target Met (L{selectedLevel} ≥ L{requiredLevel})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-300 rounded-lg text-xs font-black inline-flex items-center gap-1 shadow-3xs">
                              <AlertCircleIcon className="w-3.5 h-3.5 text-rose-600" />
                              Gap Identified: -{requiredLevel - selectedLevel} level(s) below L{requiredLevel}
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Select manager rating below
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Manager Proficiency Selection (L1 - L4) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Assess Manager Proficiency Level:
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {PROFICIENCY_LEVELS.map((lvl) => {
                          const isSelected = selectedLevel === lvl.level;
                          const isRoleTarget = lvl.level === requiredLevel;

                          return (
                            <button
                              key={lvl.level}
                              type="button"
                              onClick={() => handleSelectLevel(skill.id, lvl.level)}
                              className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                                isSelected
                                  ? 'bg-blue-50/90 border-r-blue ring-2 ring-r-blue/30 shadow-xs'
                                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-2 py-0.5 text-xs font-black rounded-md border ${lvl.badgeColor}`}>
                                    {lvl.badge}
                                  </span>
                                  <span className="font-extrabold text-xs text-slate-900">
                                    {lvl.name}
                                  </span>
                                </div>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected 
                                    ? 'border-r-blue bg-r-blue text-white' 
                                    : 'border-slate-300 bg-white'
                                }`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              </div>

                              <p className="text-[11px] text-slate-500 leading-snug font-normal">
                                {lvl.shortDesc}
                              </p>

                              {isRoleTarget && (
                                <div className="pt-1 border-t border-slate-150">
                                  <span className="text-[10px] font-extrabold text-indigo-700 tracking-tight block">
                                    ★ Role Target Benchmark
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="text-xs text-slate-500 font-medium">
                {isAllRated ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    All {totalSkillsCount} role-mapped skills evaluated. Ready to submit.
                  </span>
                ) : (
                  <span className="text-amber-800 font-semibold">
                    {totalSkillsCount - completedCount} skill(s) remaining before submission.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Save Draft & Resume Later
                </button>

                <button
                  type="button"
                  id="btn-submit-manager-survey"
                  onClick={handleSubmit}
                  disabled={!isAllRated}
                  className="px-5 py-2.5 rounded-xl bg-r-blue hover:bg-r-blue-dark text-white text-xs font-black shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <SparklesIcon className="w-4 h-4 text-amber-300" />
                  <span>{isResubmitting ? 'Update & Resubmit Evaluation' : 'Submit Manager Evaluation'}</span>
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
