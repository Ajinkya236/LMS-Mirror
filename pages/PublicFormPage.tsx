// pages/PublicFormPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LMSForm,
  FormQuestion,
  FormResponseItem,
  FormSection,
  FeedbackAssignment,
  FormSubmissionRecord
} from '../types/forms';
import {
  getFormByToken,
  recordFormSubmission,
  getStoredAssignments,
  getStoredResponses,
  saveStoredAssignments
} from '../utils/formsStorage';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Star,
  Heart,
  ThumbsUp,
  Hash,
  Send,
  ShieldCheck,
  User,
  Layers,
  Check,
  Lock,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  XCircle,
  Info,
  LogIn,
  LogOut,
  AlertTriangle,
  FileText,
  Calendar,
  HelpCircle,
  Home,
  Copy,
  CheckCheck,
  Pause,
  Play,
  X
} from 'lucide-react';

export const PublicFormPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  // Form State
  const [form, setForm] = useState<LMSForm | null | undefined>(undefined);
  const [assignments, setAssignments] = useState<FeedbackAssignment[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmissionRecord[]>([]);

  // User Authentication State
  const [selectedUser, setSelectedUser] = useState<string>(() => {
    return localStorage.getItem('lms_learner_username') || 'alex.chen';
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('lms_learner_logged_in') !== 'false';
  });
  const [customLoginInput, setCustomLoginInput] = useState('');

  // Form input answers state
  const [answers, setAnswers] = useState<{ [qId: string]: any }>({});
  const [otherTextMap, setOtherTextMap] = useState<{ [qId: string]: string }>({});
  const [respondentName, setRespondentName] = useState('');
  const [respondentEmail, setRespondentEmail] = useState('');
  const [respondentRole, setRespondentRole] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [submittedReceiptId, setSubmittedReceiptId] = useState<string>('');
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number | null>(null);
  const [isRedirectPaused, setIsRedirectPaused] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [attemptCount, setAttemptCount] = useState(1);
  const [submissionResult, setSubmissionResult] = useState<{
    score?: number;
    totalPoints?: number;
    passed?: boolean;
    percentage?: number;
    showScore?: boolean;
    answers?: FormResponseItem[];
  }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Available mock enterprise learners for quick switching / sign-in
  const mockLearners = [
    { username: 'alex.chen', name: 'Alex Chen', email: 'alex.chen@enterprise.com', role: 'Senior Frontend Engineer' },
    { username: 'priya.sharma', name: 'Priya Sharma', email: 'priya.sharma@enterprise.com', role: 'Staff Network Architect' },
    { username: 'dev.sharma', name: 'Dev Sharma', email: 'dev.sharma@enterprise.com', role: 'Backend Lead' },
    { username: 'kavita.patel', name: 'Kavita Patel', email: 'kavita.patel@enterprise.com', role: 'Senior UX Architect' },
    { username: 'aarav.mehta', name: 'Aarav Mehta', email: 'aarav.mehta@enterprise.com', role: 'Staff Systems Engineer' },
    { username: 'vikram.verma', name: 'Vikram Verma', email: 'vikram.verma@enterprise.com', role: 'DevOps Specialist' },
    { username: 'ananya.roy', name: 'Ananya Roy', email: 'ananya.roy@enterprise.com', role: 'Engineering Lead' },
    { username: 'guest.user', name: 'Guest Learner (Unassigned)', email: 'guest@contractor.com', role: 'External Consultant' }
  ];

  const currentLearnerObj = useMemo(() => {
    return mockLearners.find(m => m.username.toLowerCase() === selectedUser.toLowerCase()) || {
      username: selectedUser,
      name: selectedUser.replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: `${selectedUser}@enterprise.com`,
      role: 'Enterprise Member'
    };
  }, [selectedUser]);

  // Load storage data
  const loadData = () => {
    if (!token) {
      setForm(null);
      return;
    }
    const found = getFormByToken(token);
    setForm(found || null);
    setAssignments(getStoredAssignments());
    setSubmissions(getStoredResponses());

    if (found && found.settings?.timeLimitMinutes) {
      setTimeLeft(found.settings.timeLimitMinutes * 60);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [token]);

  // Auto-fill respondent info when logged in
  useEffect(() => {
    if (isLoggedIn && currentLearnerObj) {
      setRespondentName(currentLearnerObj.name);
      setRespondentEmail(currentLearnerObj.email);
      setRespondentRole(currentLearnerObj.role);
    }
  }, [isLoggedIn, currentLearnerObj]);

  // Handle Log In
  const handleLoginUser = (username: string) => {
    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser) return;
    setSelectedUser(cleanUser);
    setIsLoggedIn(true);
    localStorage.setItem('lms_learner_username', cleanUser);
    localStorage.setItem('lms_learner_logged_in', 'true');
  };

  // Handle Log Out
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('lms_learner_logged_in', 'false');
  };

  // Quiz Countdown Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev !== null && prev <= 1) {
          clearInterval(timer);
          handleFinalConfirmSubmit();
          return 0;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  // 1. Loading State
  if (form === undefined) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-r-blue" />
      </div>
    );
  }

  // 2. Form Not Found
  if (form === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900">Form Not Found</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The requested form token <code className="bg-slate-100 px-2 py-0.5 rounded font-bold font-mono">{token}</code> does not exist or has been regenerated by the administrator.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/form/native-feedback-assignment"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-r-blue hover:bg-r-blue-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Go to My Feedback</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ACCESS & RESTRICTION EVALUATION
  // ----------------------------------------------------
  const now = new Date();
  let isNotYetOpen = false;
  let isExpired = false;

  // 1. Start Date / Time Validation
  if (form.settings?.startDate) {
    const startStr = form.settings.startTime
      ? `${form.settings.startDate}T${form.settings.startTime}`
      : `${form.settings.startDate}T00:00:00`;
    const startObj = new Date(startStr);
    if (now < startObj) {
      isNotYetOpen = true;
    }
  }

  // 2. End Date / Time Validation
  if (form.settings?.endDate || form.endDate) {
    const endRaw = form.settings?.endDate || form.endDate;
    const endStr = form.settings?.endTime
      ? `${endRaw}T${form.settings.endTime}`
      : `${endRaw}T23:59:59`;
    const endObj = new Date(endStr);
    if (now > endObj) {
      isExpired = true;
    }
  }

  // 3. Accept Responses Validation
  const isAccepting = form.settings?.acceptResponses !== false;

  // 4. Maximum Submission Restriction
  const formSubmissions = submissions.filter(
    s => s.formId === form.id || s.formFid === form.fid
  );
  const isMaxSubmissionsReached =
    form.settings?.maxSubmissions !== undefined &&
    form.settings?.maxSubmissions !== null &&
    form.settings.maxSubmissions > 0 &&
    formSubmissions.length >= form.settings.maxSubmissions;

  const isClosed =
    form.status === 'Closed' ||
    form.status === 'Archived' ||
    !isAccepting ||
    isExpired ||
    isNotYetOpen ||
    isMaxSubmissionsReached;

  const isDraft = form.status === 'Draft';
  const isQuiz = form.type === 'Quiz';

  // Assignments for this specific form
  const formAssignments = assignments.filter(
    a => a.formId === form.id || a.feedbackId === form.fid
  );

  const isAssignedForm =
    formAssignments.length > 0 ||
    form.settings?.requireLogin === true ||
    (form.targetAudience !== 'Public' &&
      form.targetAudience !== 'All Organization' &&
      form.targetAudience !== 'All LMS Registered Learners');

  // Find user assignment if logged in
  const userAssignment = formAssignments.find(
    a =>
      a.username.toLowerCase() === selectedUser.toLowerCase() ||
      a.username.toLowerCase() === currentLearnerObj.email.toLowerCase() ||
      (selectedUser.includes('@') &&
        a.username.toLowerCase() === selectedUser.split('@')[0].toLowerCase())
  );

  // Check user previous submissions
  const userPreviousSubmissions = submissions.filter(s => {
    if (s.formId !== form.id && s.formFid !== form.fid) return false;
    const rEmail = s.respondentEmail?.toLowerCase() || '';
    const rName = s.respondentName?.toLowerCase().replace(' ', '.') || '';
    return (
      rEmail.includes(selectedUser.toLowerCase()) ||
      rName.includes(selectedUser.toLowerCase())
    );
  });

  const lastSubmission =
    userPreviousSubmissions.length > 0 ? userPreviousSubmissions[0] : null;

  // Quiz retake rules:
  // - If user passed, retake is STRICTLY BLOCKED.
  // - If user failed and allowRetakeAfterFailure is true and attempts < maxRetakeAttempts, retake is allowed.
  const isUserPassed = lastSubmission?.passed === true;
  const allowRetake =
    isQuiz &&
    form.settings?.allowRetakeAfterFailure === true &&
    lastSubmission &&
    !lastSubmission.passed &&
    (lastSubmission.attemptNumber || 1) < (form.settings?.maxRetakeAttempts || 3);

  // One response restriction check
  const isOneResponseRestricted =
    form.settings?.oneResponsePerRespondent === true ||
    (isAssignedForm && userAssignment?.status === 'Completed');

  const hasSubmittedBefore =
    !!lastSubmission ||
    (typeof window !== 'undefined' &&
      !!localStorage.getItem(`lms_sub_${form.id}`));

  // Determine Access State
  let accessState:
    | 'CLOSED_UNAVAILABLE'
    | 'MAX_CAPACITY_REACHED'
    | 'LOGIN_REQUIRED'
    | 'ACCESS_DENIED_UNASSIGNED'
    | 'BLOCKED_ALREADY_SUBMITTED'
    | 'ALLOW_ENTRY' = 'ALLOW_ENTRY';

  if (isMaxSubmissionsReached && !isDraft) {
    accessState = 'MAX_CAPACITY_REACHED';
  } else if (isClosed && !isDraft) {
    accessState = 'CLOSED_UNAVAILABLE';
  } else if (isAssignedForm) {
    if (!isLoggedIn) {
      accessState = 'LOGIN_REQUIRED';
    } else if (!userAssignment && formAssignments.length > 0) {
      accessState = 'ACCESS_DENIED_UNASSIGNED';
    } else if (hasSubmittedBefore && !allowRetake) {
      accessState = 'BLOCKED_ALREADY_SUBMITTED';
    } else {
      accessState = 'ALLOW_ENTRY';
    }
  } else {
    // Public unassigned form
    if (isOneResponseRestricted && hasSubmittedBefore && !allowRetake) {
      accessState = 'BLOCKED_ALREADY_SUBMITTED';
    } else {
      accessState = 'ALLOW_ENTRY';
    }
  }

  // ----------------------------------------------------
  // SECTIONS & FORWARD-ONLY BRANCHING LOGIC EVALUATION
  // ----------------------------------------------------
  const sections: FormSection[] =
    form.sections && form.sections.length > 0
      ? form.sections
      : [{ id: 'sec-1', title: 'General', description: 'Questionnaire', order: 0 }];

  // Dynamic branching evaluation to find skipped questions/sections
  const { skippedQuestionIds, skippedSectionIds } = useMemo(() => {
    const skippedQ = new Set<string>();
    const skippedSec = new Set<string>();

    // Iterate sequentially through all questions to evaluate branching jumps
    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      if (skippedQ.has(q.id)) continue;

      const userAns = answers[q.id];
      if (q.branchingRules && typeof userAns === 'string' && userAns) {
        const matchingRule = q.branchingRules.find(r => r.optionId === userAns);
        if (matchingRule) {
          // 1. Jump to a specific forward question
          if (matchingRule.targetAction === 'question' && matchingRule.targetId) {
            const targetQIdx = form.questions.findIndex(item => item.id === matchingRule.targetId);
            // Enforce Forward-only navigation: target must be AFTER current question index
            if (targetQIdx > i) {
              for (let k = i + 1; k < targetQIdx; k++) {
                skippedQ.add(form.questions[k].id);
              }
            }
          }

          // 2. Jump to a specific forward section
          if (matchingRule.targetAction === 'section' && matchingRule.targetId) {
            const targetSecIdx = sections.findIndex(s => s.id === matchingRule.targetId);
            const currentSecIdx = q.sectionId
              ? sections.findIndex(s => s.id === q.sectionId)
              : 0;

            // Enforce Forward-only navigation: target section must be ahead of current section
            if (targetSecIdx > currentSecIdx) {
              // Skip intermediate sections
              for (let s = currentSecIdx + 1; s < targetSecIdx; s++) {
                skippedSec.add(sections[s].id);
              }
              // Skip questions belonging to current section that appear after this question
              for (let k = i + 1; k < form.questions.length; k++) {
                const intermediateQ = form.questions[k];
                const intermediateSecIdx = intermediateQ.sectionId
                  ? sections.findIndex(s => s.id === intermediateQ.sectionId)
                  : 0;
                if (intermediateSecIdx < targetSecIdx) {
                  skippedQ.add(intermediateQ.id);
                }
              }
            }
          }

          // 3. Jump to End / Submit
          if (matchingRule.targetAction === 'end') {
            for (let k = i + 1; k < form.questions.length; k++) {
              skippedQ.add(form.questions[k].id);
            }
          }
        }
      }
    }

    return { skippedQuestionIds: skippedQ, skippedSectionIds: skippedSec };
  }, [form.questions, sections, answers]);

  // Filter visible sections (excluding fully skipped sections)
  const visibleSections = useMemo(() => {
    return sections.filter(sec => !skippedSectionIds.has(sec.id));
  }, [sections, skippedSectionIds]);

  const currentSection = sections[currentSectionIndex] || sections[0];

  // Questions belonging to current section, excluding dynamically skipped questions
  const currentSectionQuestions = useMemo(() => {
    return form.questions.filter(
      q =>
        (!q.sectionId || q.sectionId === currentSection.id || sections.length === 1) &&
        !skippedQuestionIds.has(q.id)
    );
  }, [form.questions, currentSection.id, sections.length, skippedQuestionIds]);

  // ----------------------------------------------------
  // ANSWER CHANGE HANDLER
  // ----------------------------------------------------
  const handleAnswerChange = (qId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));

    // Clear error immediately upon answer
    if (errors[qId]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });
    }

    // Check branching rule feedback
    const question = form.questions.find(q => q.id === qId);
    if (question && question.branchingRules && typeof value === 'string') {
      const rule = question.branchingRules.find(r => r.optionId === value);
      if (rule) {
        if (rule.targetAction === 'section' && rule.targetId) {
          const targetSecIdx = sections.findIndex(s => s.id === rule.targetId);
          // Forward-only jump
          if (targetSecIdx > currentSectionIndex) {
            setCurrentSectionIndex(targetSecIdx);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else if (rule.targetAction === 'question' && rule.targetId) {
          const targetQ = form.questions.find(q => q.id === rule.targetId);
          if (targetQ && targetQ.sectionId && targetQ.sectionId !== currentSection.id) {
            const targetSecIdx = sections.findIndex(s => s.id === targetQ.sectionId);
            if (targetSecIdx > currentSectionIndex) {
              setCurrentSectionIndex(targetSecIdx);
            }
          }
        } else if (rule.targetAction === 'end') {
          setCurrentSectionIndex(sections.length - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  // Multiple checkboxes toggle
  const handleMultipleChoiceToggle = (qId: string, optId: string) => {
    const current: string[] = Array.isArray(answers[qId]) ? answers[qId] : [];
    const updated = current.includes(optId)
      ? current.filter(id => id !== optId)
      : [...current, optId];
    handleAnswerChange(qId, updated);
  };

  // Likert Matrix answer handler
  const handleLikertChange = (qId: string, statementIdx: number, selectedOption: string) => {
    const currentMatrix = answers[qId] || {};
    const updated = {
      ...currentMatrix,
      [statementIdx]: selectedOption
    };
    handleAnswerChange(qId, updated);
  };

  // ----------------------------------------------------
  // SECTION & QUESTION VALIDATION ENGINE
  // ----------------------------------------------------
  const validateCurrentSection = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    currentSectionQuestions.forEach(q => {
      const ans = answers[q.id];
      const maxChars = q.maxLength || q.characterLimit;
      const minChars = q.minLength;

      // 1. Required Question Validation
      if (q.required) {
        if (ans === undefined || ans === null || ans === '') {
          newErrors[q.id] = 'This question requires an answer before proceeding.';
        } else if (Array.isArray(ans) && ans.length === 0) {
          newErrors[q.id] = 'Please select at least one option.';
        } else if (typeof ans === 'string' && !ans.trim()) {
          newErrors[q.id] = 'Please provide a non-empty text response.';
        }
      }

      // 2. Required Likert Row Validation
      if (q.type === 'likert') {
        const statements = q.likertStatements || [
          'Overall clarity of instructions',
          'Relevance to current project'
        ];
        const matrix = ans || {};
        const ratedCount = Object.keys(matrix).filter(
          k => matrix[k] !== undefined && matrix[k] !== ''
        ).length;

        if (q.required && ratedCount < statements.length) {
          newErrors[q.id] = `Please provide a rating for each criteria statement in this matrix (${ratedCount} of ${statements.length} completed).`;
        }
      }

      // 3. Numeric Validation (Range, Step, Decimal / Integer check)
      if (q.type === 'number' && ans !== undefined && ans !== '') {
        const numVal = Number(ans);
        if (isNaN(numVal)) {
          newErrors[q.id] = 'Please enter a valid numeric value.';
        } else {
          // Decimal / Integer enforcement
          if (
            q.numberValidation?.allowDecimals === false &&
            !Number.isInteger(numVal)
          ) {
            newErrors[q.id] = 'Please enter a whole integer value (no decimals allowed).';
          }

          // Min value check
          if (
            q.numberValidation?.min !== undefined &&
            numVal < q.numberValidation.min
          ) {
            newErrors[q.id] = `Value cannot be less than ${q.numberValidation.min}${
              q.numberValidation.unit ? ' ' + q.numberValidation.unit : ''
            }.`;
          }

          // Max value check
          if (
            q.numberValidation?.max !== undefined &&
            numVal > q.numberValidation.max
          ) {
            newErrors[q.id] = `Value cannot exceed ${q.numberValidation.max}${
              q.numberValidation.unit ? ' ' + q.numberValidation.unit : ''
            }.`;
          }
        }
      }

      // 4. Text Character Limit & Min Length Validation
      if (
        (q.type === 'short_text' ||
          q.type === 'long_text' ||
          q.type === 'text') &&
        typeof ans === 'string'
      ) {
        const strLen = ans.length;

        if (maxChars && strLen > maxChars) {
          newErrors[q.id] = `Character limit exceeded. Maximum ${maxChars} characters allowed (currently ${strLen}).`;
        }

        if (minChars && strLen > 0 && strLen < minChars) {
          newErrors[q.id] = `Response is too short. Minimum ${minChars} characters required (currently ${strLen}).`;
        }
      }

      // 5. 'Other' free text field validation
      if (q.allowOther && ans === 'opt_other') {
        const customText = otherTextMap[q.id];
        if (q.required && (!customText || !customText.trim())) {
          newErrors[q.id] = 'Please specify your custom text response for "Other".';
        }
      }
    });

    // Final section: Validate email if not anonymous
    if (currentSectionIndex === sections.length - 1) {
      if (!form.settings?.allowAnonymous && !respondentEmail.trim()) {
        newErrors['email'] = 'Enterprise corporate email is required.';
      }
    }

    setErrors(newErrors);

    // Auto-scroll to first invalid element
    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      const firstErrorId = errorKeys[0];
      const targetElem =
        document.getElementById(`q-${firstErrorId}`) ||
        document.getElementById(`field-${firstErrorId}`);
      if (targetElem) {
        targetElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  const handleNextSection = () => {
    if (!validateCurrentSection()) {
      return;
    }
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ----------------------------------------------------
  // SUBMISSION & CONFIRMATION HANDLERS
  // ----------------------------------------------------
  const handleRequestSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!validateCurrentSection()) {
      return;
    }

    // Open confirmation modal for final user verification
    setIsConfirmModalOpen(true);
  };

  const handleFinalConfirmSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Process Quiz score if Quiz
    let score = 0;
    let totalPoints = 0;
    let passed = true;

    const responseItems: FormResponseItem[] = form.questions.map(q => {
      const val = answers[q.id];
      const pts = q.points || 10;
      const otherVal = otherTextMap[q.id];

      if (isQuiz) {
        totalPoints += pts;
        let isCorrect = false;

        if (
          q.type === 'choice' ||
          q.type === 'single_choice' ||
          q.type === 'multiple_choice' ||
          q.type === 'yes_no'
        ) {
          if (q.multipleAnswers || q.type === 'multiple_choice') {
            const userArr = Array.isArray(val) ? [...val].sort() : [];
            const correctArr = [...(q.correctOptionIds || [])].sort();
            isCorrect =
              userArr.length > 0 &&
              JSON.stringify(userArr) === JSON.stringify(correctArr);
          } else {
            isCorrect = val === q.correctOptionId;
          }
        }
        if (isCorrect) score += pts;

        return {
          questionId: q.id,
          questionTitle: q.title,
          questionType: q.type,
          value: val,
          otherValue: otherVal,
          isCorrect,
          pointsAwarded: isCorrect ? pts : 0
        };
      }

      return {
        questionId: q.id,
        questionTitle: q.title,
        questionType: q.type,
        value: val,
        otherValue: otherVal
      };
    });

    const passMark = form.settings?.passPercentage ?? 75;
    const percentage =
      totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 100;
    if (isQuiz) {
      passed = percentage >= passMark;
    }

    const showScoreConfigured =
      form.settings?.showScoreImmediately !== false &&
      form.settings?.showScoreAfterSubmission !== false;

    setSubmissionResult({
      score: isQuiz ? score : undefined,
      totalPoints: isQuiz ? totalPoints : undefined,
      passed: isQuiz ? passed : undefined,
      percentage: isQuiz ? percentage : undefined,
      showScore: showScoreConfigured,
      answers: responseItems
    });

    setTimeout(() => {
      // Record submission
      const recorded = recordFormSubmission(form.token, {
        respondentName: respondentName.trim() || currentLearnerObj.name,
        respondentEmail: respondentEmail.trim() || currentLearnerObj.email,
        respondentRole: respondentRole.trim() || currentLearnerObj.role,
        score: isQuiz ? score : undefined,
        totalPoints: isQuiz ? totalPoints : undefined,
        passed: isQuiz ? passed : undefined,
        attemptNumber: attemptCount,
        answers: responseItems
      });

      const receiptId = recorded?.id || `RESP-${Date.now().toString().slice(-4)}`;
      setSubmittedReceiptId(receiptId);

      // Mark assignment as completed for active learner
      if (userAssignment) {
        const storedAsgs = getStoredAssignments();
        const asgIdx = storedAsgs.findIndex(a => a.id === userAssignment.id);
        if (asgIdx !== -1) {
          storedAsgs[asgIdx].status = 'Completed';
          storedAsgs[asgIdx].completedDate = new Date()
            .toISOString()
            .replace('T', ' ')
            .substring(0, 16);
          saveStoredAssignments(storedAsgs);
        }
      }

      // Mark locked if single submission
      if (form.settings?.oneResponsePerRespondent) {
        localStorage.setItem(`lms_sub_${form.id}`, new Date().toISOString());
      }

      setIsConfirmModalOpen(false);
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Start auto-redirect countdown for logged-in or assigned users
      if (isLoggedIn || isAssignedForm) {
        setAutoRedirectCountdown(12);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 450);
  };

  // Copy Receipt ID to clipboard
  const handleCopyReceiptId = () => {
    if (!submittedReceiptId) return;
    navigator.clipboard.writeText(submittedReceiptId);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  // Submit Another Response (when allowed)
  const handleResetForAnotherResponse = () => {
    setAnswers({});
    setOtherTextMap({});
    setErrors({});
    setIsSubmitted(false);
    setIsConfirmModalOpen(false);
    setCurrentSectionIndex(0);
    setSubmittedReceiptId('');
    setAutoRedirectCountdown(null);
    setIsRedirectPaused(false);
    if (form.settings?.timeLimitMinutes) {
      setTimeLeft(form.settings.timeLimitMinutes * 60);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto-redirect timer effect
  useEffect(() => {
    if (!isSubmitted || isRedirectPaused || autoRedirectCountdown === null || autoRedirectCountdown <= 0) return;

    const timer = setInterval(() => {
      setAutoRedirectCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          window.location.href = '/form/native-feedback-assignment?tab=submitted';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, isRedirectPaused, autoRedirectCountdown]);

  // ----------------------------------------------------
  // RETAKE HANDLER (QUIZ ONLY - ALLOWED ONLY IF FAILED & CONFIGURED)
  // ----------------------------------------------------
  const handleRetake = () => {
    // If user passed, retake is strictly forbidden
    if (submissionResult.passed) return;

    const maxAttempts = form.settings?.maxRetakeAttempts || 3;
    if (attemptCount >= maxAttempts) return;

    setAttemptCount(prev => prev + 1);
    setAnswers({});
    setOtherTextMap({});
    setErrors({});
    setIsSubmitted(false);
    setIsConfirmModalOpen(false);
    setAutoRedirectCountdown(null);
    setCurrentSectionIndex(0);
    if (form.settings?.timeLimitMinutes) {
      setTimeLeft(form.settings.timeLimitMinutes * 60);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const activeQuestionsList = form.questions.filter(
    q => !skippedQuestionIds.has(q.id)
  );
  const totalQuestions = activeQuestionsList.length;
  const answeredCount = activeQuestionsList.filter(
    q => answers[q.id] !== undefined && answers[q.id] !== ''
  ).length;
  const progressPercent = Math.round(
    (answeredCount / (totalQuestions || 1)) * 100
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Floating Top Brand Nav */}
        <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-r-blue text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                LMS
              </div>
              <span className="font-heading font-extrabold text-slate-900 text-sm sm:text-base">
                Learning & Feedback Portal
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* My Feedback Direct Shortcut */}
            <Link
              to="/form/native-feedback-assignment"
              className="text-xs font-bold text-slate-600 hover:text-r-blue flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>My Feedback</span>
            </Link>

            {/* Learner Authentication Pill */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 bg-slate-100 pl-2.5 pr-1.5 py-1 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <User className="w-3.5 h-3.5 text-r-blue" />
                  <span className="hidden sm:inline">{currentLearnerObj.name}</span>
                  <span className="sm:hidden font-mono">{selectedUser}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out of learner profile"
                  className="p-1 hover:bg-slate-200 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleLoginUser('alex.chen')}
                className="px-3 py-1.5 bg-r-blue hover:bg-r-blue-dark text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Learner Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* ACCESS SCENARIO 1: CLOSED / EXPIRED / NOT YET OPEN   */}
        {/* ---------------------------------------------------- */}
        {accessState === 'CLOSED_UNAVAILABLE' && !isSubmitted && (
          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 bg-slate-100 border border-slate-200 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-slate-500" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 mb-2">
                <span>{form.fid}</span>
                <span>•</span>
                <span>
                  {isNotYetOpen
                    ? 'Scheduled for Later'
                    : isExpired
                    ? 'Response Window Closed'
                    : 'Responses Closed'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                {form.title}
              </h2>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-lg mx-auto text-xs text-slate-600 leading-relaxed">
              {form.settings?.closedMessage ||
                (isNotYetOpen
                  ? `This form is scheduled to open on ${form.settings?.startDate} at ${
                      form.settings?.startTime || '00:00'
                    }. Please return once the response period begins.`
                  : isExpired
                  ? `The response deadline for this form was ${
                      form.settings?.endDate || form.endDate
                    } at ${
                      form.settings?.endTime || '23:59'
                    }. Submissions are no longer accepted.`
                  : 'This form is currently closed and not accepting new responses.')}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/form/native-feedback-assignment"
                className="px-6 py-2.5 bg-r-blue hover:bg-r-blue-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Go to My Feedback</span>
              </Link>
              <Link
                to="/"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ACCESS SCENARIO 2: MAXIMUM SUBMISSION LIMIT REACHED  */}
        {/* ---------------------------------------------------- */}
        {accessState === 'MAX_CAPACITY_REACHED' && !isSubmitted && (
          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-amber-200 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 mb-2">
                <span>{form.fid}</span>
                <span>•</span>
                <span>Capacity Limit Reached</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                Maximum Responses Reached
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              This form has reached its configured maximum response capacity (
              <strong>{form.settings?.maxSubmissions} submissions</strong>). No further responses can be accepted at this time.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/form/native-feedback-assignment"
                className="px-6 py-2.5 bg-r-blue hover:bg-r-blue-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Go to My Feedback</span>
              </Link>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ACCESS SCENARIO 3: LOGIN REQUIRED                    */}
        {/* ---------------------------------------------------- */}
        {accessState === 'LOGIN_REQUIRED' && !isSubmitted && (
          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-blue-50 border border-blue-200 text-r-blue rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-r-blue" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-r-blue border border-blue-200 mb-2">
                <span>{form.fid}</span>
                <span>•</span>
                <span>Assigned Enterprise Feedback</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                Learner Authentication Required
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
                <strong>{form.title}</strong> is restricted to authenticated enterprise learners. Please sign in to verify your assignment.
              </p>
            </div>

            {/* Quick Mock Account Selection */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-left space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Select Your Learner Account:
              </span>
              <div className="space-y-2">
                {mockLearners.slice(0, 4).map(m => (
                  <button
                    key={m.username}
                    type="button"
                    onClick={() => handleLoginUser(m.username)}
                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-blue-50/60 hover:border-r-blue/50 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group shadow-2xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-r-blue">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {m.role} • {m.email}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-r-blue group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>

              {/* Custom Username Input */}
              <div className="pt-2 border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter username (e.g. alex.chen)"
                  value={customLoginInput}
                  onChange={e => setCustomLoginInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-r-blue"
                />
                <button
                  type="button"
                  onClick={() => handleLoginUser(customLoginInput || 'alex.chen')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ACCESS SCENARIO 4: UNASSIGNED LEARNER                */}
        {/* ---------------------------------------------------- */}
        {accessState === 'ACCESS_DENIED_UNASSIGNED' && !isSubmitted && (
          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-rose-200 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 mb-2">
                <span>{form.fid}</span>
                <span>•</span>
                <span>Restricted Cohort Access</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                Access Restricted to Target Cohort
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
                You are currently signed in as <strong>{currentLearnerObj.name}</strong> (<code className="font-mono text-xs">{selectedUser}</code>). This feedback questionnaire has been assigned to a specific target project group.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/form/native-feedback-assignment"
                  className="w-full sm:w-auto px-6 py-2.5 bg-r-blue hover:bg-r-blue-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Go to My Feedback</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const nextUser = selectedUser === 'alex.chen' ? 'priya.sharma' : 'alex.chen';
                    handleLoginUser(nextUser);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Switch Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ACCESS SCENARIO 5: ALREADY SUBMITTED & RETAKE BLOCKED*/}
        {/* ---------------------------------------------------- */}
        {accessState === 'BLOCKED_ALREADY_SUBMITTED' && !isSubmitted && (
          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-emerald-200 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                <span>{form.fid}</span>
                <span>•</span>
                <span>{isUserPassed ? 'Assessment Passed' : 'Response Submitted'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
                {isUserPassed
                  ? 'Assessment Passed — Retake Not Required'
                  : 'Response Already Submitted'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
                {isUserPassed
                  ? `Congratulations! You have successfully passed ${form.title}. Passing learners are not required to retake this evaluation.`
                  : `You have already submitted your response for ${form.title}. This form is configured for one response per respondent.`}
              </p>
            </div>

            {/* Past Submission Badge Details */}
            {lastSubmission && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Response Record:</span>
                  <span className="font-mono font-bold text-slate-800">{lastSubmission.id}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Submitted On:</span>
                  <span className="font-bold text-slate-800">
                    {new Date(lastSubmission.submittedAt).toLocaleString()}
                  </span>
                </div>
                {lastSubmission.score !== undefined && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-semibold">Evaluation Score:</span>
                    <span
                      className={`font-bold ${
                        lastSubmission.passed ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {lastSubmission.score} pts ({lastSubmission.passed ? 'Passed' : 'Needs Review'})
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/form/native-feedback-assignment?tab=submitted"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>View in Submitted Feedbacks</span>
              </Link>
              <Link
                to="/form/native-feedback-assignment"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Go to My Feedback</span>
              </Link>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ACCESS SCENARIO 6: ALLOW ENTRY (ACTIVE FORM TAKING) */}
        {/* ---------------------------------------------------- */}
        {accessState === 'ALLOW_ENTRY' && !isSubmitted && (
          <form onSubmit={handleRequestSubmit} className="space-y-6 animate-fade-in">
            {/* Draft Warning Banner */}
            {isDraft && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-amber-800 text-xs font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Admin Preview Mode: This form is currently in Draft status.</span>
              </div>
            )}

            {/* Assigned Status Banner */}
            {isAssignedForm && userAssignment && (
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-r-blue font-bold">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Assigned to you by {userAssignment.assignedBy || 'LMS Program Manager'}</span>
                </div>
                {userAssignment.dueDate && (
                  <div className="flex items-center gap-1 text-slate-600 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Due by: <strong className="text-slate-800">{userAssignment.dueDate}</strong>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Form Header Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4 relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      form.type === 'Quiz'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : form.type === 'Feedback'
                        ? 'bg-blue-100 text-r-blue border border-blue-200'
                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}
                  >
                    {form.type}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {form.fid}
                  </span>
                </div>

                {/* Quiz Countdown Timer */}
                {timeLeft !== null && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 rounded-full text-xs font-bold text-amber-900 shadow-xs animate-pulse">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Time Remaining: {formatTimer(timeLeft)}</span>
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-bold font-heading text-slate-900 leading-tight">
                  {form.title}
                </h1>
                {form.description && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {form.description}
                  </p>
                )}
              </div>

              {/* Progress Bar & Indicators */}
              {form.settings?.showProgressIndicator !== false && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-r-blue">
                        Section {currentSectionIndex + 1} of {sections.length}:
                      </span>
                      <span className="text-slate-900">{currentSection.title}</span>
                    </div>
                    <span className="text-slate-500">
                      {answeredCount} of {totalQuestions} answered ({progressPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-r-blue rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(5, progressPercent)}%` }}
                    />
                  </div>

                  {/* Section Stepper Dots */}
                  {sections.length > 1 && (
                    <div className="flex items-center gap-1.5 pt-1">
                      {sections.map((sec, sIdx) => (
                        <div
                          key={sec.id}
                          className={`flex-1 h-1.5 rounded-full transition-all ${
                            sIdx === currentSectionIndex
                              ? 'bg-r-blue'
                              : sIdx < currentSectionIndex
                              ? 'bg-emerald-500'
                              : 'bg-slate-200'
                          }`}
                          title={`Section ${sIdx + 1}: ${sec.title}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Current Section Context Banner */}
            {sections.length > 1 && (
              <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-r-blue-dark font-bold text-xs">
                  <Layers className="w-4 h-4 text-r-blue" />
                  <span>
                    Section {currentSectionIndex + 1}: {currentSection.title}
                  </span>
                </div>
                {currentSection.description && (
                  <p className="text-[11px] text-r-blue mt-1">{currentSection.description}</p>
                )}
              </div>
            )}

            {/* Questions for Current Section */}
            <div className="space-y-4">
              {currentSectionQuestions.map((q, idx) => {
                const answer = answers[q.id];
                const error = errors[q.id];
                const absoluteIndex = form.questions.findIndex(item => item.id === q.id);

                // Text limits
                const maxChars =
                  q.maxLength ||
                  q.characterLimit ||
                  (q.type === 'short_text' ? 150 : q.type === 'long_text' ? 2000 : 500);
                const currentLength = typeof answer === 'string' ? answer.length : 0;
                const charRatio = currentLength / maxChars;

                return (
                  <div
                    key={q.id}
                    id={`q-${q.id}`}
                    className={`bg-white p-6 rounded-3xl border transition-all duration-200 ${
                      error
                        ? 'border-rose-400 ring-2 ring-rose-100 shadow-sm'
                        : 'border-slate-200 shadow-xs'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="space-y-1 mb-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900 leading-snug">
                          {absoluteIndex + 1}. {q.title}
                          {q.required && <span className="text-rose-500 ml-1 font-black">*</span>}
                        </span>

                        {/* Quiz Point Badge */}
                        {isQuiz && q.points && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex-shrink-0">
                            {q.points} pts
                          </span>
                        )}
                      </div>

                      {q.subtitle && (
                        <p className="text-xs text-slate-500 leading-relaxed">{q.subtitle}</p>
                      )}
                    </div>

                    {/* QUESTION FIELDS ACCORDING TO TYPE */}

                    {/* 1. Single Choice (Radio) */}
                    {(q.type === 'single_choice' || (q.type === 'choice' && !q.multipleAnswers)) && (
                      <div className="space-y-2">
                        {q.options?.map(opt => (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer text-xs sm:text-sm font-semibold ${
                              answer === opt.id
                                ? 'bg-blue-50/80 border-r-blue text-r-blue-dark ring-1 ring-r-blue/20 shadow-2xs'
                                : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/70 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              checked={answer === opt.id}
                              onChange={() => handleAnswerChange(q.id, opt.id)}
                              className="w-4 h-4 text-r-blue focus:ring-r-blue cursor-pointer"
                            />
                            <span>{opt.text}</span>
                          </label>
                        ))}

                        {/* Allow 'Other' free text if configured */}
                        {q.allowOther && (
                          <div className="pt-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
                              <span>Other (please specify):</span>
                            </label>
                            <input
                              type="text"
                              value={otherTextMap[q.id] || ''}
                              onChange={e =>
                                setOtherTextMap(prev => ({ ...prev, [q.id]: e.target.value }))
                              }
                              placeholder="Type your custom answer..."
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-r-blue focus:bg-white"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. Multiple Choice (Checkbox) */}
                    {((q.type === 'choice' && q.multipleAnswers) ||
                      q.type === 'multiple_choice') && (
                      <div className="space-y-2">
                        <span className="text-[11px] text-slate-500 font-medium italic block mb-1">
                          Select all that apply:
                        </span>
                        {q.options?.map(opt => {
                          const isChecked = Array.isArray(answer) && answer.includes(opt.id);
                          return (
                            <label
                              key={opt.id}
                              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer text-xs sm:text-sm font-semibold ${
                                isChecked
                                  ? 'bg-blue-50/80 border-r-blue text-r-blue-dark ring-1 ring-r-blue/20 shadow-2xs'
                                  : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/70 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleMultipleChoiceToggle(q.id, opt.id)}
                                className="w-4 h-4 text-r-blue rounded focus:ring-r-blue cursor-pointer"
                              />
                              <span>{opt.text}</span>
                            </label>
                          );
                        })}

                        {q.allowOther && (
                          <div className="pt-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
                              <span>Other (please specify):</span>
                            </label>
                            <input
                              type="text"
                              value={otherTextMap[q.id] || ''}
                              onChange={e =>
                                setOtherTextMap(prev => ({ ...prev, [q.id]: e.target.value }))
                              }
                              placeholder="Type your custom answer..."
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-r-blue focus:bg-white"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. Yes / No Toggle */}
                    {q.type === 'yes_no' && (
                      <div className="grid grid-cols-2 gap-3">
                        {['Yes', 'No'].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleAnswerChange(q.id, val.toLowerCase())}
                            className={`py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer text-center ${
                              answer === val.toLowerCase()
                                ? 'bg-r-blue text-white border-r-blue shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* 4. Rating Stars / Hearts / Thumbs */}
                    {q.type === 'rating' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {Array.from({ length: q.ratingLevels || 5 }, (_, i) => i + 1).map(val => {
                            const isSelected = answer >= val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleAnswerChange(q.id, val)}
                                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-400 text-white shadow-xs scale-105 ring-2 ring-amber-200'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                                }`}
                              >
                                {q.ratingIcon === 'heart' ? (
                                  <Heart className="w-5 h-5 fill-current" />
                                ) : q.ratingIcon === 'thumb' ? (
                                  <ThumbsUp className="w-5 h-5 fill-current" />
                                ) : (
                                  <Star className="w-5 h-5 fill-current" />
                                )}
                              </button>
                            );
                          })}
                          {answer && (
                            <span className="text-xs font-bold text-slate-700 ml-2">
                              {answer} / {q.ratingLevels || 5}{' '}
                              {q.ratingIcon === 'heart'
                                ? 'Hearts'
                                : q.ratingIcon === 'thumb'
                                ? 'Thumbs'
                                : 'Stars'}
                            </span>
                          )}
                        </div>

                        {q.ratingLabels && (
                          <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-1">
                            <span>{q.ratingLabels.min}</span>
                            {q.ratingLabels.mid && <span>{q.ratingLabels.mid}</span>}
                            <span>{q.ratingLabels.max}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 5. Net Promoter Score (0 - 10) */}
                    {q.type === 'nps' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                          {Array.from({ length: 11 }, (_, i) => i).map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleAnswerChange(q.id, val)}
                              className={`h-11 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                                answer === val
                                  ? 'bg-r-blue text-white shadow-xs scale-105 ring-2 ring-r-blue/30'
                                  : val <= 6
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  : val <= 8
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                          <span>0 - Not at all likely</span>
                          <span>10 - Extremely likely</span>
                        </div>
                      </div>
                    )}

                    {/* 6. Short Text Input with Live Counter */}
                    {(q.type === 'short_text' || (q.type === 'text' && !q.multiline)) && (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={answer || ''}
                          maxLength={maxChars}
                          onChange={e => handleAnswerChange(q.id, e.target.value)}
                          placeholder="Enter your response here..."
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-r-blue focus:bg-white transition-all"
                        />
                        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                          <span>
                            {q.minLength ? `Min: ${q.minLength} chars` : 'Short response'}
                          </span>
                          <span
                            className={`font-semibold ${
                              charRatio > 0.95
                                ? 'text-rose-600'
                                : charRatio > 0.8
                                ? 'text-amber-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {currentLength} / {maxChars} characters
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 7. Long Text Input with Live Counter */}
                    {(q.type === 'long_text' || (q.type === 'text' && q.multiline)) && (
                      <div className="space-y-1.5">
                        <textarea
                          rows={4}
                          value={answer || ''}
                          maxLength={maxChars}
                          onChange={e => handleAnswerChange(q.id, e.target.value)}
                          placeholder="Share your detailed feedback or notes here..."
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-r-blue focus:bg-white transition-all resize-y"
                        />
                        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                          <span>
                            {q.minLength
                              ? `Min: ${q.minLength} chars required`
                              : 'Multi-line detailed feedback'}
                          </span>
                          <span
                            className={`font-semibold ${
                              charRatio > 0.95
                                ? 'text-rose-600'
                                : charRatio > 0.8
                                ? 'text-amber-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {currentLength} / {maxChars} characters
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 8. Number Input with Numeric Constraints */}
                    {q.type === 'number' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={answer ?? ''}
                            min={q.numberValidation?.min}
                            max={q.numberValidation?.max}
                            step={
                              q.numberValidation?.step ||
                              (q.numberValidation?.allowDecimals ? '0.01' : '1')
                            }
                            onChange={e => handleAnswerChange(q.id, e.target.value)}
                            placeholder={
                              q.numberValidation?.placeholder ||
                              (q.numberValidation
                                ? `Range: ${q.numberValidation.min ?? ''} - ${
                                    q.numberValidation.max ?? ''
                                  }`
                                : 'Enter numeric value')
                            }
                            className="w-full sm:w-56 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-r-blue focus:bg-white transition-all"
                          />
                          {q.numberValidation?.unit && (
                            <span className="text-xs font-bold text-slate-500">
                              {q.numberValidation.unit}
                            </span>
                          )}
                        </div>
                        {q.numberValidation && (
                          <div className="text-[11px] text-slate-400 space-x-2">
                            {q.numberValidation.min !== undefined && (
                              <span>Min: {q.numberValidation.min}</span>
                            )}
                            {q.numberValidation.max !== undefined && (
                              <span>• Max: {q.numberValidation.max}</span>
                            )}
                            {q.numberValidation.allowDecimals === false && (
                              <span>• Whole integers only</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 9. Likert Matrix (Desktop Table & Mobile Friendly Stack) */}
                    {q.type === 'likert' && (
                      <div className="space-y-3">
                        {/* Desktop Table View */}
                        <div className="hidden sm:block overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200">
                                <th className="p-2.5 font-bold text-slate-600 min-w-[150px]">
                                  Criteria Statement
                                </th>
                                {(
                                  q.likertOptions || [
                                    'Strongly Disagree',
                                    'Disagree',
                                    'Neutral',
                                    'Agree',
                                    'Strongly Agree'
                                  ]
                                ).map((opt, oIdx) => (
                                  <th
                                    key={oIdx}
                                    className="p-2.5 font-bold text-slate-600 text-center min-w-[90px]"
                                  >
                                    {opt}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(
                                q.likertStatements || [
                                  'Overall clarity of instructions',
                                  'Relevance to current project'
                                ]
                              ).map((stmt, sIdx) => {
                                const isRowUnrated =
                                  error && (!answer || answer[sIdx] === undefined);
                                return (
                                  <tr
                                    key={sIdx}
                                    className={`transition-colors ${
                                      isRowUnrated
                                        ? 'bg-rose-50/50'
                                        : 'hover:bg-slate-50/60'
                                    }`}
                                  >
                                    <td className="p-2.5 font-semibold text-slate-800">
                                      {stmt}
                                      {q.required && isRowUnrated && (
                                        <span className="text-rose-500 font-bold ml-1">*</span>
                                      )}
                                    </td>
                                    {(
                                      q.likertOptions || [
                                        'Strongly Disagree',
                                        'Disagree',
                                        'Neutral',
                                        'Agree',
                                        'Strongly Agree'
                                      ]
                                    ).map((opt, oIdx) => {
                                      const isSelected = answer && answer[sIdx] === opt;
                                      return (
                                        <td key={oIdx} className="p-2.5 text-center">
                                          <input
                                            type="radio"
                                            name={`likert-${q.id}-${sIdx}`}
                                            checked={isSelected}
                                            onChange={() => handleLikertChange(q.id, sIdx, opt)}
                                            className="w-4 h-4 text-r-blue focus:ring-r-blue cursor-pointer"
                                          />
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Stacked Card View */}
                        <div className="sm:hidden space-y-3">
                          {(
                            q.likertStatements || [
                              'Overall clarity of instructions',
                              'Relevance to current project'
                            ]
                          ).map((stmt, sIdx) => {
                            const isRowUnrated =
                              error && (!answer || answer[sIdx] === undefined);
                            return (
                              <div
                                key={sIdx}
                                className={`p-3 rounded-2xl border space-y-2 ${
                                  isRowUnrated
                                    ? 'bg-rose-50/60 border-rose-200'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <div className="text-xs font-bold text-slate-800">
                                  {stmt}
                                  {q.required && isRowUnrated && (
                                    <span className="text-rose-500 font-bold ml-1">*</span>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 gap-1.5">
                                  {(
                                    q.likertOptions || [
                                      'Strongly Disagree',
                                      'Disagree',
                                      'Neutral',
                                      'Agree',
                                      'Strongly Agree'
                                    ]
                                  ).map((opt, oIdx) => {
                                    const isSelected = answer && answer[sIdx] === opt;
                                    return (
                                      <label
                                        key={oIdx}
                                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                                          isSelected
                                            ? 'bg-blue-100/70 border-r-blue text-r-blue-dark ring-1 ring-r-blue/30'
                                            : 'bg-white border-slate-200 text-slate-700'
                                        }`}
                                      >
                                        <span>{opt}</span>
                                        <input
                                          type="radio"
                                          name={`likert-mob-${q.id}-${sIdx}`}
                                          checked={isSelected}
                                          onChange={() => handleLikertChange(q.id, sIdx, opt)}
                                          className="w-3.5 h-3.5 text-r-blue focus:ring-r-blue"
                                        />
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Field-level validation error message */}
                    {error && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Respondent Email & Identity (Final Section) */}
            {currentSectionIndex === sections.length - 1 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="w-4 h-4 text-r-blue" />
                  <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                    Respondent Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Name {!form.settings?.allowAnonymous && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={respondentName}
                      onChange={e => setRespondentName(e.target.value)}
                      placeholder="e.g. Alex Chen"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-r-blue"
                    />
                  </div>

                  <div id="field-email">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Enterprise Email {!form.settings?.allowAnonymous && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="email"
                      value={respondentEmail}
                      onChange={e => {
                        setRespondentEmail(e.target.value);
                        if (errors['email']) {
                          setErrors(prev => {
                            const next = { ...prev };
                            delete next['email'];
                            return next;
                          });
                        }
                      }}
                      placeholder="e.g. alex.chen@enterprise.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-r-blue"
                    />
                    {errors['email'] && (
                      <p className="text-rose-600 text-[11px] font-bold mt-1">
                        {errors['email']}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Navigation Footer */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <div>
                {currentSectionIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevSection}
                    className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Section</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentSectionIndex < sections.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextSection}
                    className="px-6 py-2.5 bg-r-blue hover:bg-r-blue-dark text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <span>Next Section</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestSubmit}
                    disabled={isSubmitting}
                    className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2 active:scale-95 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Response</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUBMISSION CONFIRMATION MODAL (PRE-SUBMIT CHECK)     */}
        {/* ---------------------------------------------------- */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Confirm Submission
                    </h3>
                    <p className="text-xs text-slate-500">
                      Please review your answers before submitting
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Form / Assessment:</span>
                    <strong className="text-slate-900 font-bold max-w-[220px] truncate">{form.title}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Feedback Code (FID):</span>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">{form.fid}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Completed Questions:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {answeredCount} of {totalQuestions} answered ({progressPercent}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Submitting As:</span>
                    <span className="text-slate-800 font-semibold truncate max-w-[200px]">
                      {respondentName || currentLearnerObj.name || 'Anonymous'} ({respondentEmail || currentLearnerObj.email || 'N/A'})
                    </span>
                  </div>
                </div>

                {isQuiz && (
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                    <Award className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Assessment Policy:</strong> Your answers will be automatically evaluated upon submission. Passing score requirement: <strong>{form.settings?.passPercentage ?? 75}%</strong>.
                    </span>
                  </div>
                )}

                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you ready to submit? Once submitted, your responses will be recorded and locked in the LMS repository.
                </p>
              </div>

              {/* Actions with double submission lock */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Review Answers
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalConfirmSubmit}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                      <span>Recording Submission...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Yes, Final Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUBMISSION CONFIRMATION & QUIZ RESULTS / RETAKE VIEW */}
        {/* ---------------------------------------------------- */}
        {isSubmitted && (
          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200 space-y-6 animate-fade-in">
            {/* Header Success State */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-bold font-heading text-slate-900">
                Responses Successfully Submitted
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                {form.settings?.confirmationMessage ||
                  form.settings?.thankYouMessage ||
                  'Thank you for completing this evaluation. Your submission has been securely recorded.'}
              </p>
            </div>

            {/* Digital Audit Receipt Card */}
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Digital Submission Receipt
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    VERIFIED
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyReceiptId}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedReceipt ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Receipt ID</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase">Receipt ID</div>
                  <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                    {submittedReceiptId || 'RESP-COMPLETED'}
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase">Submitted At</div>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">
                    {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-400 font-bold text-[10px] uppercase">Respondent</div>
                  <div className="font-bold text-slate-800 text-xs mt-0.5 truncate">
                    {respondentName || currentLearnerObj.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Quiz Result Card (Calculated score, Max score, Pass/Fail) */}
            {isQuiz && (
              <>
                {submissionResult.showScore ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Assessment Evaluation Result
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-bold font-heading text-slate-900">
                            {submissionResult.percentage}%
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            (Score: {submissionResult.score} / {submissionResult.totalPoints} max points)
                          </span>
                        </div>
                      </div>

                      {/* Pass / Fail Status */}
                      <div>
                        {submissionResult.passed ? (
                          <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>PASSED (Passing Mark: {form.settings?.passPercentage ?? 75}%)</span>
                          </span>
                        ) : (
                          <span className="px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300 flex items-center gap-1.5 shadow-2xs">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>NEEDS RETAKE (Passing Mark: {form.settings?.passPercentage ?? 75}%)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Block retake if Passed */}
                    {submissionResult.passed && (
                      <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>
                          <strong>Assessment Completed & Passed:</strong> You have met the proficiency requirement. Retakes are not required.
                        </span>
                      </div>
                    )}

                    {/* Retake Section if Failed & Configured */}
                    {!submissionResult.passed && (
                      <>
                        {form.settings?.allowRetakeAfterFailure ? (
                          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                            <div className="text-xs text-amber-900 leading-relaxed max-w-md">
                              <strong>Remediation Retake Available:</strong> You scored below the {form.settings?.passPercentage ?? 75}% threshold. You may retake the assessment. (Attempt {attemptCount} of {form.settings?.maxRetakeAttempts || 3})
                            </div>
                            <button
                              type="button"
                              onClick={handleRetake}
                              disabled={attemptCount >= (form.settings?.maxRetakeAttempts || 3)}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Retake Assessment</span>
                            </button>
                          </div>
                        ) : (
                          <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700">
                            <strong>Retake Policy:</strong> Retakes are not permitted for this assessment. Please connect with your instructor for feedback.
                          </div>
                        )}
                      </>
                    )}

                    {/* Question breakdown review */}
                    {submissionResult.answers && submissionResult.answers.length > 0 && (
                      <div className="pt-2 space-y-2">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Question Review
                        </div>
                        <div className="space-y-2">
                          {submissionResult.answers.map((ansItem, aIdx) => {
                            const origQ = form.questions.find(q => q.id === ansItem.questionId);
                            return (
                              <div
                                key={ansItem.questionId}
                                className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                                  ansItem.isCorrect
                                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                                    : 'bg-rose-50/50 border-rose-200 text-rose-950'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="font-bold flex items-center gap-1.5">
                                    {ansItem.isCorrect ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                    )}
                                    <span>
                                      Q{aIdx + 1}: {ansItem.questionTitle}
                                    </span>
                                  </div>
                                  {!ansItem.isCorrect && origQ?.correctExplanation && (
                                    <p className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg border border-slate-200">
                                      <strong>Explanation:</strong> {origQ.correctExplanation}
                                    </p>
                                  )}
                                </div>
                                <div className="font-bold flex-shrink-0">
                                  {ansItem.pointsAwarded} / {origQ?.points || 10} pts
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // When Show Score is configured as FALSE
                  <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 text-xs text-slate-700 space-y-2 text-center">
                    <div className="w-10 h-10 bg-blue-100 text-r-blue rounded-full flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-900 text-sm">
                      Quiz Assessment Submitted
                    </p>
                    <p className="text-slate-600 max-w-md mx-auto">
                      Your quiz submission has been recorded. Per assessment policy, scores and official evaluation results will be published by your instructor after review.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Auto-redirect notification countdown bar */}
            {autoRedirectCountdown !== null && autoRedirectCountdown > 0 && (
              <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-blue-900 font-medium">
                  <Clock className="w-4 h-4 text-r-blue flex-shrink-0 animate-pulse" />
                  <span>
                    Auto-redirecting to <strong>My Feedback</strong> in <strong>{autoRedirectCountdown} seconds</strong>...
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRedirectPaused(prev => !prev)}
                    className="px-2.5 py-1 bg-white hover:bg-blue-100/50 text-blue-800 rounded-lg border border-blue-300 font-bold transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                  >
                    {isRedirectPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    <span>{isRedirectPaused ? 'Resume Redirect' : 'Stay on Page'}</span>
                  </button>

                  <Link
                    to="/form/native-feedback-assignment?tab=submitted"
                    className="px-3 py-1 bg-r-blue hover:bg-r-blue-dark text-white rounded-lg font-bold transition-all text-[11px] shadow-2xs"
                  >
                    Redirect Now
                  </Link>
                </div>
              </div>
            )}

            {/* Direct Navigation Links */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/form/native-feedback-assignment?tab=submitted"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Go to My Feedback (Submitted)</span>
              </Link>

              {/* Submit another response when multiple responses are permitted */}
              {!form.settings?.oneResponsePerRespondent && (!isAssignedForm || allowRetake) && (
                <button
                  type="button"
                  onClick={handleResetForAnotherResponse}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>Submit Another Response</span>
                </button>
              )}

              <Link
                to="/form/native-feedback-assignment"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>My Feedback Dashboard</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicFormPage;
