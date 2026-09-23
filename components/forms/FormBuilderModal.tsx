// components/forms/FormBuilderModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  LMSForm,
  FormType,
  FormStatus,
  FormQuestion,
  FormSection,
  QuestionType,
  QuestionOption,
} from '../../types/forms';
import { createNewForm, updateForm } from '../../utils/formsStorage';
import {
  X,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  Settings,
  ListOrdered,
  FileText,
  Star,
  Layers,
  Send,
  Save,
  Check,
  Award,
  AlertCircle,
  Eye,
  Calendar,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  RotateCcw,
  BarChart2,
  Lock,
  GitBranch,
  ArrowRight,
  Table,
  Sliders,
  CheckSquare,
  ThumbsUp,
  AlignLeft,
  Hash,
  Search
} from 'lucide-react';
import { QuestionEditor } from './QuestionEditor';
import { SectionManager } from './SectionManager';

interface FormBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  formToEdit?: LMSForm | null;
  onFormSaved: (form: LMSForm, isPublish: boolean) => void;
}

export const FormBuilderModal: React.FC<FormBuilderModalProps> = ({
  isOpen,
  onClose,
  formToEdit,
  onFormSaved,
}) => {
  const isEditing = Boolean(formToEdit);

  // 3-Stage Workflow: Stage 1 = 'settings' -> Stage 2 = 'questions' -> Stage 3 = 'preview'
  const [activeTab, setActiveTab] = useState<'settings' | 'questions' | 'preview'>('settings');

  // Stage 1: Form Purpose & Basics
  const [formType, setFormType] = useState<FormType>('Survey');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Stage 1: Response Acceptance & Scheduling (Requirements 3 & 4)
  const [acceptResponses, setAcceptResponses] = useState(true);
  const [closedMessage, setClosedMessage] = useState('This form is currently not accepting responses.');

  const [hasStartDate, setHasStartDate] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');

  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('23:59');

  // Respondent Constraints & Experience
  const [oneResponsePerRespondent, setOneResponsePerRespondent] = useState(false);
  const [showProgressIndicator, setShowProgressIndicator] = useState(true);
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [requireLogin, setRequireLogin] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  // Quiz Specific
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | ''>('');
  const [passPercentage, setPassPercentage] = useState<number>(75);
  const [showScoreImmediately, setShowScoreImmediately] = useState(true);
  const [allowRetakeAfterFailure, setAllowRetakeAfterFailure] = useState(true);
  const [maxRetakeAttempts, setMaxRetakeAttempts] = useState<number>(3);
  const [thankYouMessage, setThankYouMessage] = useState(
    'Thank you for submitting your responses. Your insights are greatly appreciated.'
  );

  // Stage 2: Sections & Questions
  const [sections, setSections] = useState<FormSection[]>([]);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');
  const [allCollapsed, setAllCollapsed] = useState(false);

  // Preview State
  const [previewSectionIndex, setPreviewSectionIndex] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  // Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  const getFutureDateString = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (formToEdit) {
      setFormType(formToEdit.type);
      setTitle(formToEdit.title);
      setDescription(formToEdit.description);

      // Sections
      const initialSections = formToEdit.sections && formToEdit.sections.length > 0
        ? formToEdit.sections
        : [{ id: 'sec-1', title: 'Section 1', description: 'Primary questionnaire section', order: 0 }];
      setSections(initialSections);

      // Settings
      setAcceptResponses(formToEdit.settings?.acceptResponses ?? true);

      // Start Schedule
      const hasStart = formToEdit.settings?.hasStartDate ?? Boolean(formToEdit.settings?.startDate);
      setHasStartDate(hasStart);
      setStartDate(formToEdit.settings?.startDate || '');
      setStartTime(formToEdit.settings?.startTime || '09:00');

      // End Schedule
      const rawEnd = formToEdit.endDate || formToEdit.settings?.endDate || '';
      const hasEnd = formToEdit.settings?.hasEndDate ?? Boolean(rawEnd);
      setHasEndDate(hasEnd);
      setEndDate(rawEnd);
      setEndTime(formToEdit.settings?.endTime || '23:59');

      setOneResponsePerRespondent(formToEdit.settings?.oneResponsePerRespondent ?? false);
      setShowProgressIndicator(formToEdit.settings?.showProgressIndicator ?? true);
      setAllowAnonymous(formToEdit.settings?.allowAnonymous ?? true);
      setRequireLogin(formToEdit.settings?.requireLogin ?? false);
      setShuffleQuestions(formToEdit.settings?.shuffleQuestions ?? false);
      setTimeLimitMinutes(formToEdit.settings?.timeLimitMinutes || '');
      setPassPercentage(formToEdit.settings?.passPercentage || 75);
      setShowScoreImmediately(formToEdit.settings?.showScoreImmediately ?? true);
      setAllowRetakeAfterFailure(formToEdit.settings?.allowRetakeAfterFailure ?? true);
      setMaxRetakeAttempts(formToEdit.settings?.maxRetakeAttempts || 3);
      setThankYouMessage(
        formToEdit.settings?.thankYouMessage ||
          'Thank you for submitting your responses. Your insights are greatly appreciated.'
      );
      setClosedMessage(
        formToEdit.settings?.closedMessage || 'This form is currently not accepting responses.'
      );

      // Questions with default sectionIds if missing
      const qs = formToEdit.questions && formToEdit.questions.length > 0
        ? formToEdit.questions.map(q => ({
            ...q,
            sectionId: q.sectionId || initialSections[0].id
          }))
        : getDefaultQuestions(formToEdit.type, initialSections[0].id);
      setQuestions(qs);
    } else {
      // Default reset for new form
      const defaultSec: FormSection = {
        id: `sec-${Date.now()}-1`,
        title: 'Section 1: General Assessment',
        description: 'Core questionnaire section',
        order: 0
      };
      setFormType('Survey');
      setTitle('');
      setDescription('');
      setSections([defaultSec]);
      setAcceptResponses(true);
      setHasStartDate(false);
      setStartDate(getTodayDateString());
      setStartTime('09:00');
      setHasEndDate(false);
      setEndDate(getFutureDateString(14));
      setEndTime('23:59');
      setOneResponsePerRespondent(false);
      setShowProgressIndicator(true);
      setAllowAnonymous(true);
      setRequireLogin(false);
      setShuffleQuestions(false);
      setTimeLimitMinutes('');
      setPassPercentage(75);
      setShowScoreImmediately(true);
      setAllowRetakeAfterFailure(true);
      setMaxRetakeAttempts(3);
      setThankYouMessage('Thank you for submitting your responses. Your insights are greatly appreciated.');
      setClosedMessage('This form is currently not accepting responses.');
      setQuestions(getDefaultQuestions('Survey', defaultSec.id));
    }
    setActiveTab('settings');
    setErrors({});
  }, [formToEdit, isOpen]);

  // Default question template
  function getDefaultQuestions(type: FormType, defaultSectionId: string): FormQuestion[] {
    if (type === 'Quiz') {
      return [
        {
          id: `q-${Date.now()}-1`,
          sectionId: defaultSectionId,
          title: 'What is the primary architectural benefit of continuous skill validation in enterprise LMS?',
          subtitle: 'Select the single best operational answer.',
          type: 'choice',
          choiceDisplay: 'radio',
          required: true,
          points: 25,
          options: [
            { id: 'opt1', text: 'Targeted skill benchmarking with verifiable evidence' },
            { id: 'opt2', text: 'Increases administrative onboarding delay' },
            { id: 'opt3', text: 'Restricts asynchronous peer learning' },
            { id: 'opt4', text: 'Disables automated credential passports' }
          ],
          correctOptionId: 'opt1',
          correctExplanation: 'Continuous skill validation provides verifiable evidence while keeping learning targeted.'
        },
        {
          id: `q-${Date.now()}-2`,
          sectionId: defaultSectionId,
          title: 'True or False: Role-focused skill competencies require periodic verification through hands-on diagnostics.',
          subtitle: 'Binary verification check.',
          type: 'yes_no',
          required: true,
          points: 25,
          options: [
            { id: 'y1', text: 'True / Yes' },
            { id: 'n1', text: 'False / No' }
          ],
          correctOptionId: 'y1',
          correctExplanation: 'True. Periodic diagnostics ensure skills match evolving enterprise architecture standards.'
        }
      ];
    } else if (type === 'Feedback') {
      return [
        {
          id: `q-${Date.now()}-1`,
          sectionId: defaultSectionId,
          title: 'How effective was this learning module in advancing your core domain competency?',
          subtitle: '5-Star rating evaluation.',
          type: 'rating',
          required: true,
          ratingLevels: 5,
          ratingIcon: 'star',
          ratingLabels: { min: 'Needs Improvement', max: 'Outstanding' }
        },
        {
          id: `q-${Date.now()}-2`,
          sectionId: defaultSectionId,
          title: 'What aspects of this course could be further improved for future cohorts?',
          subtitle: 'Open feedback reviewed directly by curriculum leads.',
          type: 'text',
          required: false,
        }
      ];
    } else {
      return [
        {
          id: `q-${Date.now()}-1`,
          sectionId: defaultSectionId,
          title: 'Overall satisfaction with our learning and development resources:',
          subtitle: 'Select your level of satisfaction.',
          type: 'rating',
          required: true,
          ratingLevels: 5,
          ratingIcon: 'star',
          ratingLabels: { min: 'Very Dissatisfied', max: 'Very Satisfied' }
        },
        {
          id: `q-${Date.now()}-2`,
          sectionId: defaultSectionId,
          title: 'Which technical domains are you most interested in mastering over the next 6 months?',
          subtitle: 'Select all tracks that align with your growth plan.',
          type: 'choice',
          choiceDisplay: 'checkbox',
          multipleAnswers: true,
          allowOther: true,
          required: true,
          options: [
            { id: 'optA', text: '5G RAN & Open Telecom Architecture' },
            { id: 'optB', text: 'Kubernetes Platform Engineering & GitOps' },
            { id: 'optC', text: 'Enterprise Generative AI & LLM Systems' },
            { id: 'optD', text: 'Zero-Trust Cloud Security & Compliance' },
          ]
        }
      ];
    }
  }

  // Quick Preset Add Question Handlers (Requirement 5)
  const handleAddPresetQuestion = (presetType: QuestionType, targetSectionId?: string) => {
    const secId = targetSectionId || (selectedSectionFilter !== 'all' ? selectedSectionFilter : (sections[0]?.id ?? 'sec-1'));
    let newQ: FormQuestion;

    switch (presetType) {
      case 'rating':
        newQ = {
          id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sectionId: secId,
          title: 'How would you rate your overall experience?',
          subtitle: 'Please select a rating from 1 to 5.',
          type: 'rating',
          required: true,
          ratingLevels: 5,
          ratingIcon: 'star',
          ratingLabels: { min: 'Poor', max: 'Outstanding' }
        };
        break;

      case 'likert':
        newQ = {
          id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sectionId: secId,
          title: 'Please rate your level of agreement with the following statements:',
          subtitle: 'Matrix evaluation across key operational areas.',
          type: 'likert',
          required: true,
          likertStatements: [
            'The training content was clear and relevant',
            'Sufficient practical examples were provided',
            'I feel confident applying these skills in my role'
          ],
          likertOptions: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
        };
        break;

      case 'nps':
        newQ = {
          id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sectionId: secId,
          title: 'How likely are you to recommend this program to a colleague or peer?',
          subtitle: 'Standard Net Promoter Score (0 = Not at all likely, 10 = Extremely likely)',
          type: 'nps',
          required: true
        };
        break;

      case 'multiple_choice':
        newQ = {
          id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sectionId: secId,
          title: 'Which of the following topics would you like to explore further?',
          subtitle: 'Select all that apply.',
          type: 'choice',
          choiceDisplay: 'checkbox',
          multipleAnswers: true,
          required: true,
          options: [
            { id: `opt-${Date.now()}-1`, text: 'Hands-on Architecture Labs' },
            { id: `opt-${Date.now()}-2`, text: '1-on-1 Expert Mentorship' },
            { id: `opt-${Date.now()}-3`, text: 'Certification Exam Prep' }
          ],
          allowOther: true,
          otherOptionText: 'Other Topic'
        };
        break;

      case 'single_choice':
      case 'choice':
        newQ = {
          id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sectionId: secId,
          title: 'Which option best describes your current experience level?',
          subtitle: 'Select one option from the list.',
          type: 'choice',
          choiceDisplay: 'radio',
          required: true,
          points: formType === 'Quiz' ? 10 : undefined,
          options: [
            { id: `opt-${Date.now()}-1`, text: 'Beginner / Exploring' },
            { id: `opt-${Date.now()}-2`, text: 'Intermediate / Practitioner' },
            { id: `opt-${Date.now()}-3`, text: 'Advanced / Expert' }
          ],
          correctOptionId: formType === 'Quiz' ? `opt-${Date.now()}-1` : undefined
        };
        break;

      case 'long_text':
        newQ = {
          id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sectionId: secId,
          title: 'What additional feedback, suggestions, or insights would you like to share?',
          subtitle: 'Open paragraph response.',
          type: 'long_text',
          required: false
        };
        break;

      case 'short_text':
      case 'text':
        newQ = {
          id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sectionId: secId,
          title: 'Please provide a short summary or keyword response:',
          subtitle: 'Single line text answer.',
          type: 'short_text',
          required: true
        };
        break;

      case 'number':
        newQ = {
          id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sectionId: secId,
          title: 'How many hours did you dedicate to this course per week?',
          subtitle: 'Enter a numeric value.',
          type: 'number',
          required: true,
          numberValidation: {
            min: 0,
            max: 100,
            step: 1,
            unit: 'hours',
            placeholder: 'e.g. 5'
          }
        };
        break;

      case 'yes_no':
        newQ = {
          id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sectionId: secId,
          title: 'Did this module meet your initial learning expectations?',
          subtitle: 'Select Yes or No.',
          type: 'yes_no',
          required: true,
          points: formType === 'Quiz' ? 10 : undefined,
          options: [
            { id: 'y1', text: 'Yes / True' },
            { id: 'n1', text: 'No / False' }
          ],
          correctOptionId: formType === 'Quiz' ? 'y1' : undefined
        };
        break;

      default:
        newQ = {
          id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sectionId: secId,
          title: 'New Question',
          subtitle: '',
          type: 'choice',
          choiceDisplay: 'radio',
          required: true,
          options: [
            { id: `opt-${Date.now()}-1`, text: 'Option 1' },
            { id: `opt-${Date.now()}-2`, text: 'Option 2' }
          ]
        };
    }

    setQuestions(prev => [...prev, newQ]);
  };

  const handleAddQuestion = (targetSectionId?: string) => {
    handleAddPresetQuestion(formType === 'Quiz' ? 'single_choice' : 'rating', targetSectionId);
  };

  const handleUpdateQuestion = (index: number, updated: FormQuestion) => {
    setQuestions(prev => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  const handleDuplicateQuestion = (index: number) => {
    const original = questions[index];
    const clone: FormQuestion = {
      ...original,
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${original.title} (Copy)`,
      options: original.options
        ? original.options.map(o => ({
            ...o,
            id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
          }))
        : undefined
    };
    setQuestions(prev => {
      const next = [...prev];
      next.splice(index + 1, 0, clone);
      return next;
    });
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('A form must contain at least one question.');
      return;
    }
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    setQuestions(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const handleUpdateSections = (newSections: FormSection[]) => {
    setSections(newSections);
    if (newSections.length > 0) {
      const validSecIds = new Set(newSections.map(s => s.id));
      const fallbackId = newSections[0].id;
      setQuestions(prev =>
        prev.map(q => (q.sectionId && validSecIds.has(q.sectionId) ? q : { ...q, sectionId: fallbackId }))
      );
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Form Title is required.';
    }

    if (hasStartDate && !startDate) {
      newErrors.startDate = 'Please select a valid Start Date.';
    }

    if (hasEndDate && !endDate) {
      newErrors.endDate = 'Please select a valid End Date.';
    }

    if (hasStartDate && hasEndDate && startDate && endDate) {
      const startFull = new Date(`${startDate}T${startTime || '00:00'}`);
      const endFull = new Date(`${endDate}T${endTime || '23:59'}`);
      if (endFull <= startFull) {
        newErrors.endDate = 'End Date & Time must be after Start Date & Time.';
      }
    }

    if (questions.length === 0) {
      newErrors.questions = 'Please add at least one question.';
    }

    questions.forEach((q, idx) => {
      if (!q.title.trim()) {
        newErrors[`q_${idx}`] = `Question ${idx + 1} must have a title.`;
      }
      if (
        (q.type === 'choice' || q.type === 'single_choice' || q.type === 'multiple_choice') &&
        (!q.options || q.options.length < 2)
      ) {
        newErrors[`q_${idx}_options`] = `Question ${idx + 1} must have at least 2 choice options.`;
      }
      if (formType === 'Quiz') {
        if ((q.type === 'choice' || q.type === 'single_choice') && !q.correctOptionId && !q.multipleAnswers) {
          newErrors[`q_${idx}_correct`] = `Question ${idx + 1} must have a designated correct answer.`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (publish: boolean) => {
    if (!validateForm()) {
      if (errors.title || errors.startDate || errors.endDate) {
        setActiveTab('settings');
      } else {
        setActiveTab('questions');
      }
      return;
    }

    const payload: Partial<LMSForm> = {
      title: title.trim(),
      description: description.trim(),
      type: formType,
      category: 'General',
      targetAudience: 'All Organization',
      endDate: hasEndDate && endDate ? endDate : null,
      sections,
      settings: {
        acceptResponses,
        hasStartDate,
        startDate: hasStartDate && startDate ? startDate : null,
        startTime: hasStartDate && startTime ? startTime : null,
        hasEndDate,
        endDate: hasEndDate && endDate ? endDate : null,
        endTime: hasEndDate && endTime ? endTime : null,
        enableStartDate: hasStartDate,
        enableEndDate: hasEndDate,
        oneResponsePerRespondent,
        showProgressIndicator,
        allowAnonymous,
        requireLogin,
        shuffleQuestions,
        timeLimitMinutes: timeLimitMinutes === '' ? null : Number(timeLimitMinutes),
        passPercentage: Number(passPercentage) || 75,
        showScoreImmediately,
        allowRetakeAfterFailure,
        maxRetakeAttempts: Number(maxRetakeAttempts) || 3,
        thankYouMessage,
        closedMessage,
      },
      questions,
      status: publish ? 'Published' : (formToEdit?.status || 'Draft'),
    };

    let saved: LMSForm | undefined;
    if (isEditing && formToEdit) {
      saved = updateForm(formToEdit.id, payload);
    } else {
      saved = createNewForm(payload);
    }

    if (saved) {
      onFormSaved(saved, publish);
      onClose();
    }
  };

  const displayedQuestions = useMemo(() => {
    let list = questions;
    if (selectedSectionFilter !== 'all') {
      list = list.filter(q => q.sectionId === selectedSectionFilter);
    }
    if (questionSearchQuery.trim()) {
      const qLower = questionSearchQuery.toLowerCase();
      list = list.filter(
        q =>
          q.title.toLowerCase().includes(qLower) ||
          (q.subtitle && q.subtitle.toLowerCase().includes(qLower)) ||
          (q.options && q.options.some(o => o.text.toLowerCase().includes(qLower)))
      );
    }
    return list;
  }, [questions, selectedSectionFilter, questionSearchQuery]);

  const totalQuizPoints = questions.reduce((acc, q) => acc + (q.points || 0), 0);
  const requiredQuestionsCount = questions.filter(q => q.required).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-slate-50 border border-slate-200 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {isEditing ? `Edit Form: ${title || 'Untitled'}` : 'Create New LMS Form'}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                    acceptResponses
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {acceptResponses ? '● Accepting' : '○ Closed'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Setup details, scheduling rules, questions, and scoring.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Stage Bar (Stage 1 is Setup & Settings!) */}
        <div className="bg-white border-b border-slate-200 px-6 flex items-center justify-between overflow-x-auto shrink-0">
          <div className="flex items-center gap-1">
            {[
              { id: 'settings', label: '1. Setup & Settings', icon: Settings },
              { id: 'questions', label: `2. Questions & Sections (${questions.length})`, icon: ListOrdered },
              { id: 'preview', label: '3. Live Preview & Test', icon: Eye },
            ].map(({ id, label, icon: IconC }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id as any)}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'border-indigo-600 text-indigo-600 bg-slate-50/70 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <IconC className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {formType === 'Quiz' && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Points: {totalQuizPoints}</span>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ================= STAGE 1: SETUP & SETTINGS ================= */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Form Purpose */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Form Purpose & Archetype <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { type: 'Survey' as FormType, title: 'Organizational Survey', desc: 'Culture pulse & sentiment.', icon: Star },
                    { type: 'Feedback' as FormType, title: 'Training Feedback', desc: 'Module reviews & ratings.', icon: FileText },
                    { type: 'Quiz' as FormType, title: 'Scored Quiz', desc: 'Knowledge benchmark with scoring.', icon: Award }
                  ].map((card) => {
                    const isSelected = formType === card.type;
                    const IconC = card.icon;
                    return (
                      <button
                        key={card.type}
                        type="button"
                        onClick={() => setFormType(card.type)}
                        className={`p-3.5 rounded-xl border-2 text-left transition-all relative ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-white/80 w-fit mb-1.5 shadow-xs">
                          <IconC className="w-4 h-4 text-indigo-600" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{card.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{card.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Description (No category or targetAudience) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Form Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 5G Architecture Diagnostics & Readiness"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                  {errors.title && (
                    <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.title}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Description & Overview
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Context, instructions, and intended outcomes..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Accept Responses Toggle */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Accept Responses</h3>
                    <p className="text-[11px] text-slate-500">Allow respondents to access and submit.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptResponses}
                      onChange={(e) => setAcceptResponses(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {!acceptResponses && (
                  <input
                    type="text"
                    value={closedMessage}
                    onChange={(e) => setClosedMessage(e.target.value)}
                    placeholder="Closed form notice message..."
                    className="w-full px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-950"
                  />
                )}
              </div>

              {/* Automated Scheduling (Start Date & End Date toggles and pickers) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Automated Scheduling & Timeframe</h3>
                    <p className="text-[11px] text-slate-500">Toggle automated opening and expiration times.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Start Date Toggle & Pickers */}
                  <div className={`p-3.5 rounded-xl border ${hasStartDate ? 'bg-blue-50/40 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Automate Opening (Start Date & Time)</span>
                        <span className="text-[11px] text-slate-500">Form opens automatically on this schedule.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasStartDate}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setHasStartDate(val);
                            if (val && !startDate) setStartDate(getTodayDateString());
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {hasStartDate && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-100">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">Start Time</label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* End Date Toggle & Pickers */}
                  <div className={`p-3.5 rounded-xl border ${hasEndDate ? 'bg-amber-50/40 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Automate Closing (End Date & Expiration Time)</span>
                        <span className="text-[11px] text-slate-500">Form closes automatically on this schedule.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasEndDate}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setHasEndDate(val);
                            if (val && !endDate) setEndDate(getFutureDateString(14));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>

                    {hasEndDate && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-100">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">End Date</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">End Time</label>
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Respondent Experience */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900">Submission Rules & Controls</h3>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl cursor-pointer">
                    <span className="font-semibold text-slate-800">One Response per Respondent</span>
                    <input
                      type="checkbox"
                      checked={oneResponsePerRespondent}
                      onChange={(e) => setOneResponsePerRespondent(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl cursor-pointer">
                    <span className="font-semibold text-slate-800">Show Progress Bar</span>
                    <input
                      type="checkbox"
                      checked={showProgressIndicator}
                      onChange={(e) => setShowProgressIndicator(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl cursor-pointer">
                    <span className="font-semibold text-slate-800">Allow Anonymous Submissions</span>
                    <input
                      type="checkbox"
                      checked={allowAnonymous}
                      onChange={(e) => setAllowAnonymous(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                  </label>
                </div>
              </div>

              {/* Quiz Rules if Quiz */}
              {formType === 'Quiz' && (
                <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Quiz Scoring & Retake Benchmarks</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Passing Score (%)</label>
                      <input
                        type="number"
                        value={passPercentage}
                        onChange={(e) => setPassPercentage(Number(e.target.value))}
                        min={1}
                        max={100}
                        className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Time Limit (Mins)</label>
                      <input
                        type="number"
                        value={timeLimitMinutes}
                        onChange={(e) => setTimeLimitMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Untimed"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= STAGE 2: QUESTIONS & SECTIONS ================= */}
          {activeTab === 'questions' && (
            <div className="max-w-4xl mx-auto space-y-5">
              {/* Quick Presets Toolbar */}
              <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200 rounded-2xl p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Quick Insert Question Templates</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAllCollapsed(!allCollapsed)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                  >
                    {allCollapsed ? 'Expand All' : 'Collapse All'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                  {[
                    { type: 'rating' as QuestionType, label: 'Rating', icon: Star },
                    { type: 'likert' as QuestionType, label: 'Likert', icon: Table },
                    { type: 'single_choice' as QuestionType, label: 'Single', icon: Sliders },
                    { type: 'multiple_choice' as QuestionType, label: 'Multi', icon: CheckSquare },
                    { type: 'nps' as QuestionType, label: 'NPS', icon: ThumbsUp },
                    { type: 'long_text' as QuestionType, label: 'Feedback', icon: AlignLeft },
                    { type: 'number' as QuestionType, label: 'Number', icon: Hash },
                    { type: 'yes_no' as QuestionType, label: 'Yes/No', icon: CheckCircle2 },
                  ].map(({ type, label, icon: IconC }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleAddPresetQuestion(type)}
                      className="p-2 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-slate-700"
                    >
                      <IconC className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[10px] font-bold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Manager */}
              <SectionManager
                sections={sections}
                onUpdateSections={handleUpdateSections}
                activeSectionId={selectedSectionFilter !== 'all' ? selectedSectionFilter : undefined}
                onSelectSection={(secId) => setSelectedSectionFilter(secId === selectedSectionFilter ? 'all' : secId)}
                onAddQuestionToSection={(secId) => handleAddQuestion(secId)}
              />

              {/* Questions List Filter */}
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={questionSearchQuery}
                    onChange={(e) => setQuestionSearchQuery(e.target.value)}
                    placeholder="Search questions..."
                    className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleAddQuestion(selectedSectionFilter !== 'all' ? selectedSectionFilter : undefined)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              {/* Questions Render */}
              <div className="space-y-3">
                {displayedQuestions.map((q) => {
                  const absoluteIndex = questions.findIndex(item => item.id === q.id);
                  return (
                    <QuestionEditor
                      key={q.id}
                      question={q}
                      index={absoluteIndex}
                      totalQuestions={questions.length}
                      formType={formType}
                      sections={sections}
                      allQuestions={questions}
                      isForceCollapsed={allCollapsed}
                      onUpdate={(updated) => handleUpdateQuestion(absoluteIndex, updated)}
                      onDuplicate={() => handleDuplicateQuestion(absoluteIndex)}
                      onDelete={() => handleDeleteQuestion(absoluteIndex)}
                      onMoveUp={() => handleMoveQuestion(absoluteIndex, 'up')}
                      onMoveDown={() => handleMoveQuestion(absoluteIndex, 'down')}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= STAGE 3: LIVE PREVIEW & TEST ================= */}
          {activeTab === 'preview' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-indigo-600 text-[10px] font-bold border border-blue-200">
                    {formType}
                  </span>
                  {hasStartDate && startDate && (
                    <span className="text-[11px] text-slate-500 font-semibold">Starts: {startDate} {startTime}</span>
                  )}
                  {hasEndDate && endDate && (
                    <span className="text-[11px] text-amber-700 font-semibold">Closes: {endDate} {endTime}</span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900">{title || 'Untitled Form'}</h3>
                {description && <p className="text-xs text-slate-600">{description}</p>}

                {/* Questions Preview */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  {questions
                    .filter(q => q.sectionId === (sections[previewSectionIndex]?.id || sections[0]?.id))
                    .map((q, idx) => (
                      <div key={q.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <p className="text-xs font-bold text-slate-900">
                          {idx + 1}. {q.title} {q.required && <span className="text-rose-500">*</span>}
                        </p>
                        {q.subtitle && <p className="text-[11px] text-slate-500">{q.subtitle}</p>}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isEditing && formToEdit?.status === 'Published' ? 'Update Live Form' : 'Publish Form'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FormBuilderModal;
