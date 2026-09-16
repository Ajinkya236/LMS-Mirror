// components/skills/SkillAssessmentJourneyPlayer.tsx
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  LockIcon, 
  ClockIcon, 
  AwardIcon, 
  InfoIcon,
  SparklesIcon
} from '../Icons';
import { SkillDetailedInfo, AssessmentSection } from '../../utils/skillsCatalog';
import { getQuizQuestions, QuizQuestion } from '../../utils/skillsQuizQuestions';

interface SkillAssessmentJourneyPlayerProps {
  skill: SkillDetailedInfo;
  initialSectionNumber?: number;
  onClose: () => void;
  onSaveSkill: (updatedSkill: SkillDetailedInfo) => void;
  onCompleteJourney: (updatedSkill: SkillDetailedInfo, passed: boolean) => void;
}

export const SkillAssessmentJourneyPlayer: React.FC<SkillAssessmentJourneyPlayerProps> = ({
  skill,
  initialSectionNumber = 1,
  onClose,
  onSaveSkill,
  onCompleteJourney,
}) => {
  const sections = skill.assessmentJourney.sections;

  // Find initial section index (0-indexed)
  const initialIndex = useMemo(() => {
    const idx = sections.findIndex(s => s.sectionNumber === initialSectionNumber);
    return idx >= 0 ? idx : 0;
  }, [sections, initialSectionNumber]);

  const [activeStageIndex, setActiveStageIndex] = useState<number>(initialIndex);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  // Navigation Rule: Sequential by default (can be toggled by user)
  const [isSequentialMode, setIsSequentialMode] = useState<boolean>(true);

  // Answers state keyed by `sectionNumber-questionIndex`
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(`jio_skill_answers_${skill.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved answers", e);
      }
    }
    return {};
  });

  // Section completion status and scores local tracking
  const [sectionScores, setSectionScores] = useState<Record<number, number>>(() => {
    const initialScores: Record<number, number> = {};
    sections.forEach(sec => {
      if (sec.score !== undefined) {
        initialScores[sec.sectionNumber] = sec.score;
      }
    });
    return initialScores;
  });

  const [completedStageIndexes, setCompletedStageIndexes] = useState<Set<number>>(() => {
    const set = new Set<number>();
    sections.forEach((sec, idx) => {
      if (sec.status === 'completed' || (sec.score !== undefined && sec.score >= 85)) {
        set.add(idx);
      }
    });
    return set;
  });

  // Modal / Feedback state
  const [ruleNotice, setRuleNotice] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [finalPassed, setFinalPassed] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);

  const currentSection = sections[activeStageIndex] || sections[0];
  const passingScoreNum = useMemo(() => {
    const passStr = currentSection.assessments?.[0]?.passingScore || skill.assessmentJourney.targetScore || '85%';
    const match = passStr.match(/\d+/);
    return match ? parseInt(match[0]) : 85;
  }, [currentSection, skill]);

  // Questions for active section
  const currentQuestions: QuizQuestion[] = useMemo(() => {
    return getQuizQuestions(
      skill.id, 
      currentSection.sectionNumber, 
      skill.name, 
      currentSection.sectionTitle
    );
  }, [skill.id, skill.name, currentSection]);

  const currentQuestion = currentQuestions[activeQuestionIndex] || currentQuestions[0];
  const currentAnswerKey = `${currentSection.sectionNumber}-${activeQuestionIndex}`;
  const selectedAnswer = answers[currentAnswerKey];

  // Helper to check if a stage is completed
  const isStageCompleted = (idx: number) => {
    return completedStageIndexes.has(idx);
  };

  // Helper to check if a stage is accessible in sequential mode
  const isStageAccessible = (targetIdx: number) => {
    if (!isSequentialMode) return true;
    if (targetIdx === 0) return true;
    // Accessible if already completed or if all preceding stages are completed
    for (let i = 0; i < targetIdx; i++) {
      if (!completedStageIndexes.has(i)) {
        return false;
      }
    }
    return true;
  };

  // Check if current stage questions are all answered
  const areAllQuestionsAnsweredInStage = (stageIdx: number) => {
    const sec = sections[stageIdx];
    const qs = getQuizQuestions(skill.id, sec.sectionNumber, skill.name, sec.sectionTitle);
    for (let qIdx = 0; qIdx < qs.length; qIdx++) {
      if (!answers[`${sec.sectionNumber}-${qIdx}`]) {
        return false;
      }
    }
    return true;
  };

  // Calculate score for a stage
  const calculateStageScore = (stageIdx: number): number => {
    const sec = sections[stageIdx];
    const qs = getQuizQuestions(skill.id, sec.sectionNumber, skill.name, sec.sectionTitle);
    let correct = 0;
    qs.forEach((q, idx) => {
      if (answers[`${sec.sectionNumber}-${idx}`] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / qs.length) * 100);
  };

  // Select an option
  const handleSelectOption = (option: string) => {
    const updated = {
      ...answers,
      [currentAnswerKey]: option
    };
    setAnswers(updated);
    localStorage.setItem(`jio_skill_answers_${skill.id}`, JSON.stringify(updated));
  };

  // Handle clicking a stage node in the Stepper
  const handleStageClick = (idx: number) => {
    setRuleNotice(null);
    if (isSequentialMode && !isStageAccessible(idx)) {
      setRuleNotice(`Sequential Rule: Please complete Stage ${idx} first before advancing to Stage ${idx + 1}.`);
      setTimeout(() => setRuleNotice(null), 4000);
      return;
    }
    setActiveStageIndex(idx);
    setActiveQuestionIndex(0);
  };

  // Complete current stage & advance
  const evaluateAndCompleteCurrentStage = (advanceToNext: boolean = true) => {
    const score = calculateStageScore(activeStageIndex);
    const passed = score >= passingScoreNum;

    // Update score
    setSectionScores(prev => ({
      ...prev,
      [currentSection.sectionNumber]: score
    }));

    // Mark completed if passed or all answered
    const nextCompleted = new Set(completedStageIndexes);
    if (passed || areAllQuestionsAnsweredInStage(activeStageIndex)) {
      nextCompleted.add(activeStageIndex);
      setCompletedStageIndexes(nextCompleted);
    }

    // Persist to skill
    const updatedSections = skill.assessmentJourney.sections.map((sec, idx) => {
      if (idx === activeStageIndex) {
        return {
          ...sec,
          status: (passed ? 'completed' : 'in_progress') as 'completed' | 'in_progress' | 'available' | 'locked',
          score
        };
      }
      // Unlock next section if sequential
      if (idx === activeStageIndex + 1 && passed) {
        return {
          ...sec,
          status: (sec.status === 'locked' ? 'available' : sec.status) as 'completed' | 'in_progress' | 'available' | 'locked'
        };
      }
      return sec;
    });

    const updatedSkill: SkillDetailedInfo = {
      ...skill,
      assessmentJourney: {
        ...skill.assessmentJourney,
        sections: updatedSections,
        completedAssessments: updatedSections.filter(s => s.status === 'completed').length
      }
    };

    onSaveSkill(updatedSkill);

    if (advanceToNext && activeStageIndex < sections.length - 1) {
      setActiveStageIndex(activeStageIndex + 1);
      setActiveQuestionIndex(0);
    }

    return { score, passed };
  };

  // PREV button handler
  const handlePrev = () => {
    setRuleNotice(null);
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    } else if (activeStageIndex > 0) {
      const prevStage = activeStageIndex - 1;
      const prevQs = getQuizQuestions(
        skill.id, 
        sections[prevStage].sectionNumber, 
        skill.name, 
        sections[prevStage].sectionTitle
      );
      setActiveStageIndex(prevStage);
      setActiveQuestionIndex(prevQs.length - 1);
    }
  };

  // NEXT button handler
  const handleNext = () => {
    setRuleNotice(null);
    // If not at the last question of current stage, just advance question
    if (activeQuestionIndex < currentQuestions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
      return;
    }

    // At the last question of current stage: time to evaluate stage and move to next stage
    if (activeStageIndex < sections.length - 1) {
      if (isSequentialMode) {
        if (!areAllQuestionsAnsweredInStage(activeStageIndex)) {
          setRuleNotice("Sequential Rule: Please answer all questions in this stage before proceeding to the next stage.");
          setTimeout(() => setRuleNotice(null), 4000);
          return;
        }
      }
      evaluateAndCompleteCurrentStage(true);
    }
  };

  // FINISH button handler
  const handleFinish = () => {
    setRuleNotice(null);
    if (isSequentialMode && !areAllQuestionsAnsweredInStage(activeStageIndex)) {
      setRuleNotice("Sequential Rule: Please answer all questions in this stage before finishing.");
      setTimeout(() => setRuleNotice(null), 4000);
      return;
    }

    // Evaluate active stage
    const { score } = evaluateAndCompleteCurrentStage(false);

    // Calculate total score across all sections
    let totalScoreSum = 0;
    sections.forEach((sec, idx) => {
      const secScore = idx === activeStageIndex ? score : (sectionScores[sec.sectionNumber] || calculateStageScore(idx));
      totalScoreSum += secScore;
    });
    const avgScore = Math.round(totalScoreSum / sections.length);
    const overallPassed = avgScore >= 80;

    setFinalScore(avgScore);
    setFinalPassed(overallPassed);
    setShowSummaryModal(true);

    // Update entire skill competency level if overall passed
    const updatedSections = skill.assessmentJourney.sections.map((sec, idx) => {
      const sScore = idx === activeStageIndex ? score : (sectionScores[sec.sectionNumber] || calculateStageScore(idx));
      return {
        ...sec,
        status: (sScore >= 80 ? 'completed' : 'in_progress') as 'completed' | 'in_progress' | 'available' | 'locked',
        score: sScore
      };
    });

    const newCurrentLevel = overallPassed && skill.currentLevel < skill.targetLevel 
      ? skill.targetLevel 
      : skill.currentLevel;

    const finalSkill: SkillDetailedInfo = {
      ...skill,
      currentLevel: newCurrentLevel,
      status: overallPassed ? 'Met' : skill.status,
      assessmentJourney: {
        ...skill.assessmentJourney,
        sections: updatedSections,
        completedAssessments: updatedSections.filter(s => s.status === 'completed').length
      }
    };

    onSaveSkill(finalSkill);
    onCompleteJourney(finalSkill, overallPassed);
  };

  const isAtFirstItem = activeStageIndex === 0 && activeQuestionIndex === 0;
  const isAtLastItemOfLastStage = 
    activeStageIndex === sections.length - 1 && 
    activeQuestionIndex === currentQuestions.length - 1;

  // Short labels for stepper (matching clean style from attached image: Cart, Checkout, Billing, Done)
  const getStageShortLabel = (sec: AssessmentSection) => {
    // Generate concise 1-2 word label
    const words = sec.sectionTitle.split(/\s+|&|\//).filter(w => w.length > 2);
    if (words.length >= 2) {
      return `${words[0]} ${words[1]}`;
    }
    return words[0] || `Section ${sec.sectionNumber}`;
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      {/* 1. Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Back / Exit */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors border border-slate-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Exit Assessment"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Journey</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-r-blue flex items-center gap-1">
                  <AwardIcon className="w-3 h-3 text-r-blue" />
                  Skill Assessment Journey
                </span>
                <span className="hidden md:inline text-xs text-slate-400">•</span>
                <span className="hidden md:inline text-xs text-slate-500 font-medium">{skill.name}</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-950 truncate max-w-xs sm:max-w-md">
                Stage {currentSection.sectionNumber}: {currentSection.sectionTitle}
              </h1>
            </div>
          </div>

          {/* Right: Sequential / Non-Sequential Rule Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsSequentialMode(true);
                  setRuleNotice("Sequential mode enabled: Stages unlock in sequential order.");
                  setTimeout(() => setRuleNotice(null), 3500);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  isSequentialMode 
                    ? 'bg-white text-slate-950 shadow-xs border border-slate-200' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Sequential: complete stages in order"
              >
                <LockIcon className="w-3 h-3 text-r-blue" />
                <span className="hidden sm:inline">Sequential</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSequentialMode(false);
                  setRuleNotice("Non-Sequential (Free Navigation) enabled: You can navigate between any stage freely.");
                  setTimeout(() => setRuleNotice(null), 3500);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  !isSequentialMode 
                    ? 'bg-white text-slate-950 shadow-xs border border-slate-200' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Non-Sequential: free navigation between all stages"
              >
                <SparklesIcon className="w-3 h-3 text-amber-600" />
                <span className="hidden sm:inline">Non-Sequential</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Save & Exit
            </button>
          </div>
        </div>
      </header>

      {/* Rule Notification Toast */}
      {ruleNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs font-semibold text-amber-900 flex items-center justify-center gap-2 animate-fade-in">
          <InfoIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{ruleNotice}</span>
        </div>
      )}

      {/* 2. Top Progress Menu / Stepper (Web & Mobile view as in attached image) */}
      <div className="bg-white border-b border-slate-200 py-5 sm:py-7 px-4 sm:px-8 shadow-2xs">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between w-full">
            {sections.map((stage, idx) => {
              const isCompleted = isStageCompleted(idx);
              const isCurrent = activeStageIndex === idx;
              const isFuture = !isCompleted && !isCurrent;
              const accessible = isStageAccessible(idx);

              // Styling matching the attached image:
              // - Completed (e.g. Cart): solid blue circle, white number, blue connecting line after it
              // - Current (e.g. Checkout): white circle with thick blue border, blue number, gray line after it, bold black font label
              // - Upcoming (e.g. Billing, Done): solid gray circle, dark gray number, gray line after it, gray font label
              return (
                <React.Fragment key={stage.sectionNumber}>
                  {/* Stepper Node Item */}
                  <button
                    type="button"
                    onClick={() => handleStageClick(idx)}
                    className={`flex flex-col items-center flex-shrink-0 group cursor-pointer focus:outline-none transition-transform hover:scale-105 ${
                      !accessible ? 'opacity-80' : ''
                    }`}
                    title={`${stage.sectionTitle} (${isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'})`}
                  >
                    {/* Circle */}
                    <div
                      className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-[#2563eb] text-white shadow-xs'
                          : isCurrent
                          ? 'bg-white border-[3px] sm:border-[3.5px] border-[#2563eb] text-[#2563eb] shadow-sm'
                          : 'bg-[#d1d5db] text-slate-700'
                      }`}
                    >
                      <span className="font-bold text-sm sm:text-lg leading-none">
                        {stage.sectionNumber}
                      </span>
                    </div>

                    {/* Stage Label underneath */}
                    <span
                      className={`mt-2 text-center text-[11px] sm:text-xs max-w-[70px] sm:max-w-[110px] leading-tight transition-colors ${
                        isCurrent
                          ? 'text-slate-950 font-bold'
                          : isCompleted
                          ? 'text-slate-600 font-medium'
                          : 'text-slate-500 font-normal'
                      }`}
                    >
                      {getStageShortLabel(stage)}
                    </span>
                  </button>

                  {/* Connecting Line between nodes */}
                  {idx < sections.length - 1 && (
                    <div className="flex-1 flex items-center pt-4 sm:pt-6 px-1 sm:px-2">
                      <div
                        className={`h-[3px] sm:h-[4px] w-full rounded-full transition-colors ${
                          isCompleted ? 'bg-[#2563eb]' : 'bg-slate-200'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Course Player Screen (Main Content in Each Stage) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Stage Title & Metadata Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-r-blue border border-blue-200">
                Stage {currentSection.sectionNumber} of {sections.length}
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                {currentSection.estimatedTime}
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <AwardIcon className="w-3.5 h-3.5 text-amber-500" />
                Pass Score: {passingScoreNum}%
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-normal text-slate-950">
              {currentSection.sectionTitle}
            </h2>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {sectionScores[currentSection.sectionNumber] !== undefined && (
              <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Stage Score</span>
                <span className={`text-sm font-black ${
                  sectionScores[currentSection.sectionNumber] >= passingScoreNum 
                    ? 'text-emerald-600' 
                    : 'text-amber-600'
                }`}>
                  {sectionScores[currentSection.sectionNumber]}%
                </span>
              </div>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isStageCompleted(activeStageIndex)
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isStageCompleted(activeStageIndex) ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>

        {/* Course Player Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Stage Syllabus / Questions List (Course Contents Sidebar) */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Stage Syllabus & Items</h3>
                <p className="text-xs text-slate-500">
                  {currentQuestions.length} Items • {
                    currentQuestions.filter((_, idx) => !!answers[`${currentSection.sectionNumber}-${idx}`]).length
                  } Answered
                </p>
              </div>
              <span className="text-xs font-bold text-r-blue bg-blue-50 px-2 py-0.5 rounded-md">
                {Math.round((currentQuestions.filter((_, idx) => !!answers[`${currentSection.sectionNumber}-${idx}`]).length / currentQuestions.length) * 100)}%
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
              {currentQuestions.map((q, idx) => {
                const isAnswered = !!answers[`${currentSection.sectionNumber}-${idx}`];
                const isActive = activeQuestionIndex === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-blue-50/60 border-l-4 border-l-r-blue' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isAnswered ? (
                        <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                          isActive ? 'border-r-blue text-r-blue' : 'border-slate-300 text-slate-500'
                        }`}>
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          isActive ? 'text-r-blue' : 'text-slate-500'
                        }`}>
                          Question {idx + 1}
                        </span>
                        <span className="text-[10px] text-slate-400">10 pts</span>
                      </div>
                      <p className={`text-xs line-clamp-2 ${
                        isActive ? 'text-slate-950 font-semibold' : 'text-slate-700 font-normal'
                      }`}>
                        {q.question}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Stage Evaluation Workspace (Interactive Player Canvas) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
              
              {/* Question Header & Counter */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Item {activeQuestionIndex + 1} of {currentQuestions.length}
                </span>
                <span className="text-xs text-slate-400">
                  Multiple Choice Evaluation
                </span>
              </div>

              {/* Question Prompt */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-950 leading-snug">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = selectedAnswer === option;
                  const optionLetters = ['A', 'B', 'C', 'D'];

                  return (
                    <label
                      key={optIdx}
                      onClick={() => handleSelectOption(option)}
                      className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 border-r-blue shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 border ${
                        isSelected
                          ? 'bg-r-blue text-white border-r-blue'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}>
                        {optionLetters[optIdx] || optIdx + 1}
                      </div>

                      <span className={`text-sm leading-relaxed flex-1 ${
                        isSelected ? 'font-semibold text-slate-950' : 'font-normal text-slate-800'
                      }`}>
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Verified Explanation if Answered */}
              {selectedAnswer && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4 animate-fade-in">
                  <div className="flex items-center gap-2 mb-1.5">
                    <InfoIcon className="w-4 h-4 text-r-blue" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Technical Concept & Explanation
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Prev / Next / Finish Action Controls Bar (as per sequential/non-sequential rules) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-3">
              {/* Prev Button */}
              <button
                type="button"
                onClick={handlePrev}
                disabled={isAtFirstItem}
                className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  isAtFirstItem
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950 border border-slate-200'
                }`}
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Previous
              </button>

              <div className="text-xs text-slate-500 font-medium hidden sm:block">
                Stage {currentSection.sectionNumber} • Question {activeQuestionIndex + 1}/{currentQuestions.length}
              </div>

              {/* Next or Finish Button */}
              {isAtLastItemOfLastStage ? (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-5 sm:px-8 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <AwardIcon className="w-4 h-4" />
                  Finish Assessment
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 sm:px-8 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-r-blue text-white hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>
                    {activeQuestionIndex === currentQuestions.length - 1 
                      ? 'Next Stage' 
                      : 'Next Question'}
                  </span>
                  <span className="font-mono">→</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* 4. Assessment Completion / Results Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-fade-in">
            
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-blue-50 text-r-blue border border-blue-200 shadow-xs">
              <AwardIcon className="w-8 h-8 text-r-blue" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-r-blue block mb-1">
                Assessment Journey Finished
              </span>
              <h2 className="text-2xl font-bold text-slate-950">
                {finalPassed ? 'Skill Milestone Achieved!' : 'Assessment Attempt Recorded'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
                {finalPassed 
                  ? `Congratulations! You scored ${finalScore}%, meeting the proficiency requirement for ${skill.name}.`
                  : `You completed all stages with an overall score of ${finalScore}%. Review the section breakdowns below.`}
              </p>
            </div>

            {/* Sections Score Breakdown */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Section Breakdown
              </h4>
              {sections.map((sec, idx) => {
                const sScore = sectionScores[sec.sectionNumber] || calculateStageScore(idx);
                const passed = sScore >= passingScoreNum;
                return (
                  <div key={sec.sectionNumber} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-none">
                    <span className="font-normal text-slate-900 truncate max-w-[200px]">
                      {sec.sectionNumber}. {sec.sectionTitle}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {sScore}%
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {passed ? 'Passed' : 'Review'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-r-blue text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Return to Skill Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillAssessmentJourneyPlayer;
