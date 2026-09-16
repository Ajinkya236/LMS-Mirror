import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award as AwardIcon,
  CheckCircle2 as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  ArrowLeft as ArrowLeftIcon,
  Save as SaveIcon,
  Send as SendIcon,
  ShieldCheck as ShieldCheckIcon,
  Sparkles as SparklesIcon,
  HelpCircle as HelpCircleIcon,
  ChevronRight as ChevronRightIcon,
  Clock as ClockIcon,
  Zap as ZapIcon,
  Info as InfoIcon
} from 'lucide-react';
import {
  ROLE_SKILLS,
  getStoredRoleSurvey,
  saveRoleSurveyDraft,
  submitRoleSurvey,
  type RoleSkillItem
} from '../utils/skillsData';

export const RoleSkillSelfSurveyPage: React.FC = () => {
  const navigate = useNavigate();

  // Load saved survey record
  const [surveyRecord, setSurveyRecord] = useState(() => getStoredRoleSurvey());
  
  // Active in-memory ratings (seeded from draft or submitted ratings)
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const saved = getStoredRoleSurvey();
    if (Object.keys(saved.draftRatings).length > 0) {
      return { ...saved.draftRatings };
    }
    if (Object.keys(saved.submittedRatings).length > 0) {
      return { ...saved.submittedRatings };
    }
    // Default seed from initial skills with selfRating
    const initial: Record<string, number> = {};
    ROLE_SKILLS.forEach(sk => {
      if (sk.selfRating !== undefined) {
        initial[sk.id] = sk.selfRating;
      }
    });
    return initial;
  });

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showValidationWarning, setShowValidationWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleSkills = ROLE_SKILLS;
  const totalSkills = roleSkills.length;
  const answeredCount = Object.keys(ratings).filter(k => ratings[k] !== undefined && ratings[k] > 0).length;
  const isAllAnswered = answeredCount === totalSkills && totalSkills > 0;
  const remainingCount = Math.max(0, totalSkills - answeredCount);
  const progressPercent = totalSkills > 0 ? Math.round((answeredCount / totalSkills) * 100) : 0;
  const isCompleted = surveyRecord.status === 'Completed';

  // Handle single skill level selection
  const handleSelectLevel = (skillId: string, level: number) => {
    setRatings(prev => ({
      ...prev,
      [skillId]: level
    }));
    setShowValidationWarning(false);
  };

  // Save Draft action
  const handleSaveDraft = () => {
    const updated = saveRoleSurveyDraft(ratings);
    setSurveyRecord(updated);
    setToastMessage({
      text: `Survey draft saved successfully (${answeredCount} of ${totalSkills} skills recorded).`,
      type: 'success'
    });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Submit Final Survey action
  const handleSubmitSurvey = () => {
    if (!isAllAnswered) {
      setShowValidationWarning(true);
      // Scroll to first unrated skill
      const firstUnrated = roleSkills.find(s => !ratings[s.id]);
      if (firstUnrated) {
        const el = document.getElementById(`survey-skill-card-${firstUnrated.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const updated = submitRoleSurvey(ratings);
      setSurveyRecord(updated);
      setIsSubmitting(false);
      setToastMessage({
        text: 'Role Competency Self-Survey submitted successfully! Your self-ratings are now live on your profile.',
        type: 'success'
      });
      
      // Navigate back to My Skills after brief acknowledgement
      setTimeout(() => {
        navigate('/skills');
      }, 1200);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24">
      {/* Top Sticky Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Breadcrumbs & Navigation */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 flex-wrap">
            <button
              onClick={() => navigate('/skills')}
              className="inline-flex items-center gap-1.5 text-gray-600 hover:text-r-blue transition-colors cursor-pointer py-1 px-2 -ml-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to My Skills</span>
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700">Role Assessment</span>
            <span className="text-gray-300">/</span>
            <span className="text-r-blue font-bold">Self-Survey</span>
          </div>

          {/* Action CTAs in Sticky Bar */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              id="btn-save-draft-top"
              onClick={handleSaveDraft}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <SaveIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              id="btn-submit-survey-top"
              onClick={handleSubmitSurvey}
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                isAllAnswered
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-r-blue hover:bg-r-blue-dark text-white'
              }`}
            >
              <SendIcon className="w-3.5 h-3.5" />
              <span>{isCompleted ? 'Update & Resubmit' : 'Submit Survey'}</span>
            </button>
          </div>
        </div>

        {/* Evaluation Progress Meter Bar */}
        <div className="bg-slate-100/90 border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800">
                Evaluation Progress:
              </span>
              <span className="font-bold text-r-blue">
                {answeredCount} of {totalSkills} skills evaluated ({progressPercent}%)
              </span>
              {isCompleted && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-300">
                  Previously Submitted on {surveyRecord.submittedAt}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                isAllAnswered
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                {isAllAnswered ? 'All skills evaluated ✓ Ready to submit' : `${remainingCount} ${remainingCount === 1 ? 'skill' : 'skills'} remaining`}
              </span>
              <div className="w-32 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isAllAnswered ? 'bg-emerald-500' : 'bg-r-blue'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Page Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-fade-in shadow-xs ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-bold">{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Incomplete Survey Warning Banner */}
        {showValidationWarning && !isAllAnswered && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-xs animate-shake">
            <AlertCircleIcon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-rose-950">
                Evaluation Incomplete ({remainingCount} skills unrated)
              </h4>
              <p className="text-xs text-rose-800">
                To submit your self-survey, please select a proficiency level (L1 to L4) for all {totalSkills} role-mapped competencies. Unrated skills are highlighted with an alert badge below.
              </p>
            </div>
          </div>
        )}

        {/* Hero Card Banner */}
        <div className="bg-linear-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <AwardIcon className="w-3.5 h-3.5 text-blue-400" />
                  Role Profile Self-Survey
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ZapIcon className="w-3.5 h-3.5 text-emerald-400" />
                  Survey Open
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white">
                {isCompleted ? 'Role Competency Assessment (Open for Updates)' : 'Role-Mapped Skill Self-Survey'}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Self-evaluate your demonstrated proficiency across all role-mapped skills for <strong className="text-white">Software Development & Platform Engineering (Senior Platform Architect)</strong>. Your honest appraisal powers targeted learning paths, role readiness scoring, and manager alignment.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <strong>9 Role Competencies</strong>
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                  Estimated time: <strong>3–5 minutes</strong>
                </span>
                <span>&bull;</span>
                <span className="text-slate-400">
                  Last saved: <strong>{surveyRecord.updatedAt || 'Not saved yet'}</strong>
                </span>
              </div>
            </div>

            {/* Quick Metrics Badge Card */}
            <div className="bg-slate-800/80 backdrop-blur-xs rounded-2xl p-5 border border-slate-700/80 flex flex-col justify-between gap-4 md:min-w-[240px] flex-shrink-0">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Evaluation Status</span>
                <div className="text-xl font-black text-white mt-1 flex items-center gap-2">
                  <span>{progressPercent}% Complete</span>
                  {isAllAnswered && <CheckCircleIcon className="w-5 h-5 text-emerald-400" />}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-700/60 pt-3">
                <div className="flex justify-between">
                  <span>Target Met (L3/L4):</span>
                  <strong className="text-emerald-300 font-bold">
                    {roleSkills.filter(s => (ratings[s.id] || 0) >= (s.targetLevel || 3)).length} skills
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Development Gap:</span>
                  <strong className="text-amber-300 font-bold">
                    {roleSkills.filter(s => ratings[s.id] && ratings[s.id] < (s.targetLevel || 3)).length} skills
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proficiency Scale Reference Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
            <InfoIcon className="w-4 h-4 text-r-blue" />
            <span>Proficiency Rating Standard (L1 – L4 Scale)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-black text-[11px] flex items-center justify-center">1</span>
                L1: Awareness
              </span>
              <p className="text-gray-600 text-[11px] leading-relaxed">
                Conceptual knowledge, knows terminology and theoretical fundamentals. Requires direct guidance.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1">
              <span className="font-extrabold text-blue-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-900 font-black text-[11px] flex items-center justify-center">2</span>
                L2: Working
              </span>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                Can execute standard tasks independently. Resolves routine issues with occasional peer review.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-1">
              <span className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-900 font-black text-[11px] flex items-center justify-center">3</span>
                L3: Practitioner (Target)
              </span>
              <p className="text-indigo-800 text-[11px] leading-relaxed">
                Full autonomy, solves complex scenarios, authors standards, and guides other engineers.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1">
              <span className="font-extrabold text-purple-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-900 font-black text-[11px] flex items-center justify-center">4</span>
                L4: Expert
              </span>
              <p className="text-purple-800 text-[11px] leading-relaxed">
                Organization-wide subject matter authority, leads cross-domain architecture and innovation.
              </p>
            </div>
          </div>
        </div>

        {/* Survey Questions List */}
        <div className="space-y-5">
          {roleSkills.map((skill, index) => {
            const currentSelected = ratings[skill.id];
            const targetLevel = skill.targetLevel || 3;
            const isAnswered = currentSelected !== undefined && currentSelected > 0;
            const isMet = isAnswered && currentSelected >= targetLevel;

            return (
              <section
                key={skill.id}
                id={`survey-skill-card-${skill.id}`}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 shadow-xs ${
                  !isAnswered && showValidationWarning
                    ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200'
                    : isAnswered
                    ? 'border-gray-200 hover:border-r-blue/40'
                    : 'border-amber-200/80 bg-amber-50/10'
                }`}
              >
                {/* Skill Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-gray-100">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center border border-slate-300">
                        {index + 1}
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">
                        {skill.name}
                      </h2>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                        skill.criticality === 'Critical'
                          ? 'bg-red-50 text-red-800 border-red-300 font-extrabold'
                          : skill.criticality === 'High'
                          ? 'bg-orange-50 text-orange-800 border-orange-200 font-extrabold'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        Criticality: {skill.criticality}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
                      {skill.description || skill.skillMeaning || 'Core competency evaluated for role readiness.'}
                    </p>
                  </div>

                  {/* Target & Status Badges */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto flex-shrink-0">
                    <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200">
                      Required Target: <strong>L{targetLevel}</strong>
                    </span>

                    {isAnswered ? (
                      <span className={`px-3 py-1 text-xs font-bold rounded-xl border flex items-center gap-1.5 ${
                        isMet
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Self: L{currentSelected} ({isMet ? 'Target Met' : `Gap -${targetLevel - currentSelected}`})</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 flex items-center gap-1">
                        <AlertCircleIcon className="w-3.5 h-3.5 text-amber-600" />
                        <span>Unrated</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 4 Proficiency Selection Cards */}
                <div className="pt-4 space-y-2">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                    Select Your Self-Assessed Level:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {skill.levels.map((lvl) => {
                      const isSelected = currentSelected === lvl.level;
                      const isRequired = lvl.level === targetLevel;

                      return (
                        <button
                          key={lvl.level}
                          type="button"
                          id={`btn-skill-${skill.id}-lvl-${lvl.level}`}
                          onClick={() => handleSelectLevel(skill.id, lvl.level)}
                          className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-r-blue/10 border-r-blue shadow-xs ring-2 ring-r-blue/30'
                              : 'bg-slate-50/70 hover:bg-slate-100/90 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-extrabold flex items-center gap-1.5 ${
                              isSelected ? 'text-r-blue' : 'text-gray-900'
                            }`}>
                              <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                                isSelected ? 'bg-r-blue text-white' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {lvl.level}
                              </span>
                              <span>Level {lvl.level} ({lvl.name})</span>
                            </span>

                            {isRequired && (
                              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                                Target
                              </span>
                            )}
                          </div>

                          <p className={`text-[11px] leading-relaxed line-clamp-3 ${
                            isSelected ? 'text-slate-800 font-medium' : 'text-gray-600'
                          }`}>
                            {lvl.description}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 text-[10px] font-bold">
                            <span className={isSelected ? 'text-r-blue' : 'text-gray-400'}>
                              {isSelected ? '✓ Selected' : 'Click to select'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom Submission Action Bar */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">
              Ready to submit your Role Self-Survey?
            </h3>
            <p className="text-xs text-gray-600">
              {isAllAnswered 
                ? 'All 9 competencies have been self-rated. Click submit to update your live profile ratings and readiness score.' 
                : `You still have ${remainingCount} competencies unassessed. You can save as a draft or finish rating all items.`}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              id="btn-save-draft-bottom"
              onClick={handleSaveDraft}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <SaveIcon className="w-4 h-4 text-slate-600" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              id="btn-submit-survey-bottom"
              onClick={handleSubmitSurvey}
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                isAllAnswered
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-r-blue hover:bg-r-blue-dark text-white'
              }`}
            >
              <SendIcon className="w-4 h-4" />
              <span>{isCompleted ? 'Update & Resubmit Survey' : 'Submit Final Survey'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RoleSkillSelfSurveyPage;
