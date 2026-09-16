import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getSkillDetailedInfo, 
  SkillDetailedInfo, 
  AssessmentSection 
} from '../utils/skillsCatalog';
import { 
  ArrowLeftIcon,
  ZapIcon,
  AwardIcon,
  CheckCircleIcon,
  ClockIcon,
  LockIcon,
  PlayIcon,
  CheckIcon,
  ExternalLinkIcon,
  InfoIcon,
  SparklesIcon
} from '../components/Icons';
import { SkillAssessmentJourneyPlayer } from '../components/skills/SkillAssessmentJourneyPlayer';

const SkillDetailsPage: React.FC = () => {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();
  const assessmentSectionRef = useRef<HTMLDivElement>(null);

  // Core skill state with local storage loading
  const [skill, setSkill] = useState<SkillDetailedInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'assessment' | 'courses'>('courses');
  const [videoFilter, setVideoFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Section-Wise Assessment Journey Player State
  const [isJourneyPlayerActive, setIsJourneyPlayerActive] = useState<boolean>(false);
  const [journeyInitialSectionNumber, setJourneyInitialSectionNumber] = useState<number>(1);

  // Load and save skill intelligence
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (skillId) {
      const saved = localStorage.getItem(`jio_skill_detail_${skillId}`);
      if (saved) {
        try {
          setSkill(JSON.parse(saved));
        } catch (e) {
          console.error("Error reading saved skill data:", e);
          setSkill(getSkillDetailedInfo(skillId));
        }
      } else {
        setSkill(getSkillDetailedInfo(skillId));
      }
    }
  }, [skillId]);

  const saveSkillData = (updatedSkill: SkillDetailedInfo) => {
    setSkill(updatedSkill);
    if (skillId) {
      localStorage.setItem(`jio_skill_detail_${skillId}`, JSON.stringify(updatedSkill));
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Launch the Section-Wise Assessment Journey
  const handleStartAssessmentClick = (sectionNumber?: number) => {
    let targetSecNum = sectionNumber;
    if (!targetSecNum && skill) {
      const firstIncomplete = skill.assessmentJourney.sections.find(
        sec => sec.status !== 'completed'
      );
      targetSecNum = firstIncomplete ? firstIncomplete.sectionNumber : 1;
    }
    setJourneyInitialSectionNumber(targetSecNum || 1);
    setIsJourneyPlayerActive(true);
  };

  if (!skill) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-r-blue border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading skill intelligence...</p>
      </div>
    );
  }

  // If user launched the Section-Wise Assessment Journey, render the Journey Player
  if (isJourneyPlayerActive) {
    return (
      <SkillAssessmentJourneyPlayer
        skill={skill}
        initialSectionNumber={journeyInitialSectionNumber}
        onClose={() => setIsJourneyPlayerActive(false)}
        onSaveSkill={(updatedSkill) => {
          saveSkillData(updatedSkill);
        }}
        onCompleteJourney={(updatedSkill, passed) => {
          saveSkillData(updatedSkill);
          if (passed) {
            showToast(`Assessment Passed! ${skill.name} verified.`);
          }
        }}
      />
    );
  }

  // Filter YouTube courses
  const filteredCourses = skill.youtubeCourses.filter(course => {
    if (videoFilter === 'All') return true;
    return course.categoryTag.toLowerCase().includes(videoFilter.toLowerCase()) ||
           course.difficulty.toLowerCase() === videoFilter.toLowerCase();
  });

  // Calculate scores and progress
  const completedSections = skill.assessmentJourney.sections.filter(s => s.status === 'completed' && s.score !== undefined);
  const avgScore = completedSections.length > 0 
    ? Math.round(completedSections.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedSections.length) 
    : 88; // Default initial verified avg score

  // Check if skill is role-mapped
  const isRoleMapped = skillId?.startsWith('sk-') || ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5', 'sk-6', 'sk-7', 'sk-8', 'sk-9'].includes(skillId || '');

  // Dynamic unfinished check
  const hasUnfinishedAssessment = skill.assessmentJourney.sections.some(sec => sec.status === 'in_progress');

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-950 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-800 animate-fade-in text-xs font-semibold">
          <SparklesIcon className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Skill Header - Light Sky Blue 80% Opacity */}
      <div className="bg-sky-100/80 border-b border-sky-200/80 text-slate-900 pt-10 sm:pt-14 pb-0 px-4 sm:px-6 lg:px-8 shadow-xs relative overflow-hidden backdrop-blur-xs">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-blue-100/60 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-7">
          
          {/* Back Button */}
          <div>
            <button
              onClick={() => navigate('/skills')}
              className="text-slate-800 hover:text-slate-950 transition-all inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer hover:underline"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5 text-slate-800" />
              <span>Back to My Skills</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            {/* Skill Titles & Badges */}
            <div className="space-y-5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-950 tracking-tight">
                  {skill.name}
                </h1>
                {isRoleMapped && (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 rounded-lg text-[10px] sm:text-xs flex items-center gap-1 whitespace-nowrap shadow-3xs uppercase tracking-wider">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                    Role Relevant
                  </span>
                )}
              </div>

              {/* Badges: Criticality, Type, Category */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md font-semibold bg-white text-slate-800 border border-slate-300/80 shadow-3xs">
                  {skill.category}
                </span>
                <span className="px-2.5 py-1 rounded-md font-semibold bg-white text-slate-800 border border-slate-300/80 shadow-3xs">
                  {skill.type} Capability
                </span>
                <span className={`px-2.5 py-1 rounded-md font-bold text-xs uppercase tracking-wider border shadow-3xs ${
                  skill.criticality === 'Critical' 
                    ? 'bg-rose-100 text-rose-800 border-rose-200' 
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}>
                  {skill.criticality} Priority
                </span>
              </div>

              {/* Meaning / Elevator Pitch */}
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
                {skill.skillMeaning}
              </p>
            </div>

            {/* Right Card: High-Impact Competency Snapshot Card */}
            <div className="bg-white/95 rounded-2xl p-5 border border-sky-200 shadow-sm flex flex-col justify-between w-full lg:w-96 flex-shrink-0 backdrop-blur-md">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Proficiency
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                  skill.status === 'Met' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  Gap: {skill.status === 'Met' ? 'Met (Proficient)' : 'Action Required'}
                </span>
              </div>

              {/* Current Level vs Target Level Visual Pill */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 text-center">
                  <span className="text-[10px] uppercase text-slate-500 font-bold block mb-0.5">My Current Level</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-black text-slate-900">L{skill.currentLevel}</span>
                    <span className="text-xs font-semibold text-slate-600">
                      ({skill.levels.find(l => l.level === skill.currentLevel)?.name || 'Practitioner'})
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50/70 rounded-xl p-3 border border-blue-200/80 text-center">
                  <span className="text-[10px] uppercase text-r-blue font-bold block mb-0.5">Target Grade</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-black text-r-blue">L{skill.targetLevel}</span>
                    <span className="text-xs font-semibold text-r-blue">
                      ({skill.levels.find(l => l.level === skill.targetLevel)?.name || 'Specialist'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress & Quick Assessment Action */}
              <div className="space-y-3">
                {/* Step Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>Level Progress</span>
                    <span>{Math.round((completedSections.length / skill.assessmentJourney.sections.length) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-r-blue h-full rounded-full transition-all duration-500"
                      style={{ width: `${(completedSections.length / skill.assessmentJourney.sections.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Main Contextual Assessment CTA */}
                <button
                  onClick={() => handleStartAssessmentClick()}
                  className="w-full py-2.5 px-4 bg-r-blue hover:bg-r-blue-dark text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs cursor-pointer border border-transparent active:scale-98"
                >
                  <ZapIcon className="w-3.5 h-3.5 fill-white animate-pulse" />
                  <span>
                    {hasUnfinishedAssessment ? "Continue Assessment" : "Start Skill Assessment"}
                  </span>
                  <span className="font-bold">→</span>
                </button>
              </div>

            </div>

          </div>

          {/* Navigation Sub-Menu Tabs (Skill Evidence Tab is Removed) */}
          <div className="flex items-center gap-4 mt-12 border-b border-sky-300/60 overflow-x-auto pb-0">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-2.5 font-bold text-sm transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer -mb-[2px] ${
                activeTab === 'courses'
                  ? 'text-r-blue border-r-blue font-black'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-300'
              }`}
            >
              <span>Suggested Courses</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2.5 font-bold text-sm transition-all border-b-2 whitespace-nowrap cursor-pointer -mb-[2px] ${
                activeTab === 'overview'
                  ? 'text-r-blue border-r-blue font-black'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-300'
              }`}
            >
              Skill Overview
            </button>

            <button
              onClick={() => setActiveTab('assessment')}
              className={`px-3 py-2.5 font-bold text-sm transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer -mb-[2px] ${
                activeTab === 'assessment'
                  ? 'text-r-blue border-r-blue font-black'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-300'
              }`}
            >
              <span>Assessment journey</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ========================================================= */}
        {/* SUB MENU 1: SKILL OVERVIEW                                */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <section className="space-y-6 animate-fade-in">
            
            {/* Skill Description */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <InfoIcon className="w-5 h-5 text-r-blue" />
                <h2 className="text-xl font-heading font-extrabold text-gray-900">
                  Skill description
                </h2>
              </div>

              <div className="text-sm sm:text-base text-gray-700 leading-relaxed">
                <p>{skill.fullDescription}</p>
              </div>
            </div>

            {/* Proficiency Levels */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-heading font-extrabold text-gray-900">
                    Proficiency Levels
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Clear operational capabilities and typical benchmarks for each grade level.
                  </p>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-bold text-r-blue">
                    <span className="w-2.5 h-2.5 rounded-full bg-r-blue" />
                    Target: L{skill.targetLevel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Current: L{skill.currentLevel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {skill.levels.map((lvl) => {
                  const isCurrent = lvl.level === skill.currentLevel;
                  const isTarget = lvl.level === skill.targetLevel;

                  return (
                    <div
                      key={lvl.level}
                      className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                        isCurrent 
                          ? 'border-emerald-400 bg-emerald-50/40 shadow-xs' 
                          : isTarget 
                          ? 'border-blue-400 bg-blue-50/40 shadow-xs' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                            isCurrent 
                              ? 'bg-emerald-600 text-white' 
                              : isTarget 
                              ? 'bg-r-blue text-white' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            LEVEL {lvl.level}
                          </span>
                          
                          {isCurrent && (
                            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                          {isTarget && !isCurrent && (
                            <span className="text-[10px] font-black uppercase text-r-blue bg-blue-100 px-2 py-0.5 rounded-full">
                              Target
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-heading font-extrabold text-base text-gray-900">
                            {lvl.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                            {lvl.shortDesc}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-gray-100 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                            Key Competencies
                          </span>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {lvl.coreCompetencies.slice(0, 3).map((comp, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-r-blue font-bold">•</span>
                                <span className="leading-snug">{comp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className="text-[11px] text-gray-500 italic">
                          "{lvl.assessmentCriteria}"
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Tools, Frameworks & Business Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-3">
                <h3 className="font-heading font-extrabold text-base text-gray-900">
                  Key Tools & Frameworks
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skill.keyToolsAndFrameworks.map((tool, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-3">
                <h3 className="font-heading font-extrabold text-base text-gray-900">
                  Business & Operational Impact
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                  {skill.businessImpact}
                </p>
              </div>
            </div>

            {/* Related Skills */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="font-heading font-extrabold text-base text-gray-900">
                Related Competency Adjacencies
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {skill.relatedSkills.map((rel) => (
                  <div 
                    key={rel.id}
                    onClick={() => navigate(`/skills/details/${rel.id}`)}
                    className="p-3 rounded-2xl border border-gray-200 hover:border-r-blue hover:shadow-xs transition-all cursor-pointer bg-slate-50/50 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{rel.name}</h4>
                      <p className="text-xs text-gray-500">{rel.category} • {rel.relation}</p>
                    </div>
                    <span className="text-xs font-bold text-r-blue">
                      {rel.relevanceScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

        {/* ========================================================= */}
        {/* SUB MENU 2: ASSESSMENT JOURNEY                             */}
        {/* ========================================================= */}
        {activeTab === 'assessment' && (
          <section ref={assessmentSectionRef} className="space-y-4 animate-fade-in">
            
            {/* Top Box Removed completely as per User Requirement 1 */}

            {/* Sections Stack: Showing only section title, duration, pass score, my score, completion status */}
            <div className="space-y-3">
              {skill.assessmentJourney.sections.map((sec) => {
                const isSectionLocked = sec.status === 'locked' || (sec.sectionNumber === 4 && skill.currentLevel < 3);
                const hasScore = sec.score !== undefined;
                const passingScore = sec.assessments?.[0]?.passingScore || '85%';

                return (
                  <div 
                    key={sec.sectionNumber} 
                    className={`bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isSectionLocked
                        ? 'border-slate-200 opacity-60 bg-slate-50/50'
                        : sec.status === 'completed'
                        ? 'border-emerald-200 hover:border-emerald-300 shadow-2xs'
                        : sec.status === 'in_progress'
                        ? 'border-blue-300 ring-1 ring-blue-300/50 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Left: Section Title (Reduced font size, non-bold, black font as per Requirement 2) */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                        isSectionLocked
                          ? 'bg-slate-200 text-slate-400 border border-slate-300'
                          : sec.status === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : sec.status === 'in_progress'
                          ? 'bg-r-blue text-white'
                          : 'bg-slate-800 text-white'
                      }`}>
                        {isSectionLocked ? (
                          <LockIcon className="w-4 h-4 text-slate-400" />
                        ) : sec.status === 'completed' ? (
                          <CheckIcon className="w-4 h-4 text-white" />
                        ) : (
                          <span>{sec.sectionNumber}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        {/* Section Title: reduced font size, not bold, black font */}
                        <h3 className="text-sm sm:text-base font-normal text-black leading-snug truncate">
                          {sec.sectionTitle}
                        </h3>
                      </div>
                    </div>

                    {/* Middle: Duration, Pass Score, My Score, Completion Status */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-700 bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-200/80 flex-shrink-0">
                      {/* Duration */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase text-slate-400 font-bold">Duration:</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                          {sec.estimatedTime}
                        </span>
                      </div>

                      <div className="h-4 w-px bg-slate-200" />

                      {/* Pass Score */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase text-slate-400 font-bold">Pass:</span>
                        <span className="font-bold text-slate-900">{passingScore}</span>
                      </div>

                      <div className="h-4 w-px bg-slate-200" />

                      {/* My Score */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase text-slate-400 font-bold">My Score:</span>
                        {hasScore ? (
                          <span className={`font-bold ${parseInt(sec.score?.toString() || '0') >= parseInt(passingScore) ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {sec.score}%
                          </span>
                        ) : sec.status === 'in_progress' ? (
                          <span className="text-blue-600 font-semibold italic text-[11px]">In Progress</span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </div>

                      <div className="h-4 w-px bg-slate-200" />

                      {/* Completion Status */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase text-slate-400 font-bold">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isSectionLocked
                            ? 'bg-slate-100 text-slate-500 border-slate-200'
                            : sec.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : sec.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {isSectionLocked ? 'Locked' : sec.status === 'completed' ? 'Completed' : sec.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Action Button */}
                    <div className="flex-shrink-0 self-end md:self-center">
                      {isSectionLocked ? (
                        <button
                          disabled
                          className="px-3.5 py-1.5 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl border border-slate-200 cursor-not-allowed flex items-center gap-1.5"
                        >
                          <LockIcon className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </button>
                      ) : sec.status === 'completed' ? (
                        <button
                          onClick={() => handleStartAssessmentClick(sec.sectionNumber)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-3xs"
                        >
                          Retake
                        </button>
                      ) : sec.status === 'in_progress' ? (
                        <button
                          onClick={() => handleStartAssessmentClick(sec.sectionNumber)}
                          className="px-3.5 py-1.5 bg-r-blue hover:bg-r-blue-dark text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-97 border border-transparent"
                        >
                          <PlayIcon className="w-3 h-3 fill-white" />
                          <span>Resume</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartAssessmentClick(sec.sectionNumber)}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-97 border border-transparent"
                        >
                          <ZapIcon className="w-3 h-3 fill-white" />
                          <span>Start Assessment</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </section>
        )}

        {/* ========================================================= */}
        {/* SUB MENU 3: SUGGESTED COURSES                              */}
        {/* ========================================================= */}
        {activeTab === 'courses' && (
          <section className="space-y-6 animate-fade-in">
            
            <div className="space-y-4 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-gray-900">
                  Suggested Courses
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Curated technical deep dives, masterclasses, and video lectures to level up in {skill.name}.
                </p>
              </div>

              {/* Proficiency filters */}
              <div className="flex flex-wrap items-center gap-2">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setVideoFilter(chip)}
                    className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      videoFilter === chip
                        ? 'bg-gray-950 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Course Tiles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((video) => (
                <div
                  key={video.id}
                  className="flex flex-col space-y-2.5 group cursor-pointer"
                  onClick={() => navigate(`/course/${video.id}`)}
                >
                  {/* Thumbnail with ONLINE badge */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-[#0d9488] text-white text-[10px] font-extrabold rounded uppercase tracking-wider shadow-xs">
                      ONLINE
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                    <span>{video.channelName}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard?.writeText?.(window.location.href);
                        showToast("Course share link copied to clipboard!");
                      }}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                      title="Share Course"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 12a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Bold Title */}
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-r-blue transition-colors px-1 leading-snug line-clamp-2">
                    {video.title}
                  </h3>
                </div>
              ))}
            </div>

          </section>
        )}

      </div>

    </div>
  );
};

export default SkillDetailsPage;
