// pages/CreateFormPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  LMSForm,
  FormType,
  FormSection,
  FormQuestion,
  QuestionType,
} from '../types/forms';
import {
  createNewForm,
  updateForm,
  getFormById,
  getStoredForms
} from '../utils/formsStorage';
import { QuestionEditor } from '../components/forms/QuestionEditor';
import { SectionManager } from '../components/forms/SectionManager';
import { ShareFormModal } from '../components/forms/ShareFormModal';
import {
  FileText,
  ListOrdered,
  Settings,
  Eye,
  ArrowLeft,
  Save,
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ToggleRight,
  ToggleLeft,
  Award,
  Star,
  RotateCcw,
  Check,
  ArrowRight,
  Plus,
  Clock,
  Layers,
  HelpCircle,
  Share2,
  Search,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckSquare,
  Hash,
  AlignLeft,
  ThumbsUp,
  Table,
  ShieldCheck,
  Lock,
  Globe
} from 'lucide-react';

export const CreateFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { formId } = useParams<{ formId?: string }>();
  const isEditing = Boolean(formId);

  // Loaded form instance when in edit mode
  const [existingForm, setExistingForm] = useState<LMSForm | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 3-Stage Navigation: 'settings' (Stage 1) -> 'questions' (Stage 2) -> 'preview' (Stage 3)
  const [activeTab, setActiveTab] = useState<'settings' | 'questions' | 'preview'>('settings');

  // Stage 1: Form Basics & Purpose
  const [formType, setFormType] = useState<FormType>('Survey');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Stage 1: Response Acceptance & Scheduling (Start & End Date/Time automation)
  const [acceptResponses, setAcceptResponses] = useState(true);
  const [closedMessage, setClosedMessage] = useState(
    'This form is currently not accepting responses.'
  );

  // Start Date / Time flag & pickers
  const [hasStartDate, setHasStartDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');

  // End Date / Time flag & pickers
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('23:59');

  // Respondent Constraints & Experience Settings
  const [oneResponsePerRespondent, setOneResponsePerRespondent] = useState(false);
  const [showProgressIndicator, setShowProgressIndicator] = useState(true);
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [requireLogin, setRequireLogin] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  // Quiz Specific Settings
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | ''>('');
  const [passPercentage, setPassPercentage] = useState(75);
  const [showScoreImmediately, setShowScoreImmediately] = useState(true);
  const [allowRetakeAfterFailure, setAllowRetakeAfterFailure] = useState(true);
  const [maxRetakeAttempts, setMaxRetakeAttempts] = useState(3);
  const [thankYouMessage, setThankYouMessage] = useState(
    'Thank you for submitting your responses. Your insights are greatly appreciated.'
  );

  // Stage 2: Sections & Questions
  const [sections, setSections] = useState<FormSection[]>([]);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');
  const [allCollapsed, setAllCollapsed] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Live Preview Emulator State
  const [previewSectionIndex, setPreviewSectionIndex] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState<{ [qId: string]: any }>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  // Share Modal on Publish
  const [publishedForm, setPublishedForm] = useState<LMSForm | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Helper date generators for convenient presets
  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  const getFutureDateString = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  // Default question generators
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

  // Load existing form if in edit mode, or initialize new form
  useEffect(() => {
    if (formId) {
      const found = getFormById(formId) || getStoredForms().find(f => f.id === formId || f.fid === formId);
      if (found) {
        setExistingForm(found);
        setFormType(found.type || 'Survey');
        setTitle(found.title || '');
        setDescription(found.description || '');

        const initialSections = found.sections && found.sections.length > 0
          ? found.sections
          : [{ id: 'sec-1', title: 'Section 1', description: 'Primary questionnaire section', order: 0 }];
        setSections(initialSections);

        // Settings
        setAcceptResponses(found.settings?.acceptResponses ?? true);

        // Start Date/Time
        const hasStart = found.settings?.hasStartDate ?? Boolean(found.settings?.startDate);
        setHasStartDate(hasStart);
        setStartDate(found.settings?.startDate || '');
        setStartTime(found.settings?.startTime || '09:00');

        // End Date/Time
        const rawEnd = found.endDate || found.settings?.endDate || '';
        const hasEnd = found.settings?.hasEndDate ?? Boolean(rawEnd);
        setHasEndDate(hasEnd);
        setEndDate(rawEnd);
        setEndTime(found.settings?.endTime || '23:59');

        setOneResponsePerRespondent(found.settings?.oneResponsePerRespondent ?? false);
        setShowProgressIndicator(found.settings?.showProgressIndicator ?? true);
        setAllowAnonymous(found.settings?.allowAnonymous ?? true);
        setRequireLogin(found.settings?.requireLogin ?? false);
        setShuffleQuestions(found.settings?.shuffleQuestions ?? false);
        setTimeLimitMinutes(found.settings?.timeLimitMinutes || '');
        setPassPercentage(found.settings?.passPercentage || 75);
        setShowScoreImmediately(found.settings?.showScoreImmediately ?? true);
        setAllowRetakeAfterFailure(found.settings?.allowRetakeAfterFailure ?? true);
        setMaxRetakeAttempts(found.settings?.maxRetakeAttempts || 3);
        setThankYouMessage(
          found.settings?.thankYouMessage ||
            'Thank you for submitting your responses. Your insights are greatly appreciated.'
        );
        setClosedMessage(
          found.settings?.closedMessage || 'This form is currently not accepting responses.'
        );

        // Questions
        const qs = found.questions && found.questions.length > 0
          ? found.questions.map(q => ({
              ...q,
              sectionId: q.sectionId || initialSections[0].id
            }))
          : getDefaultQuestions(found.type, initialSections[0].id);
        setQuestions(qs);
      }
    } else {
      // New form initialization
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
    setLoading(false);
  }, [formId]);

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

  // Section deletion sync: when a section is removed, assign its questions to first section
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
        newErrors.endDate = 'End Date & Time must be after the Start Date & Time.';
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
      status: publish ? 'Published' : (existingForm?.status || 'Draft'),
    };

    let saved: LMSForm | undefined;
    if (isEditing && existingForm) {
      saved = updateForm(existingForm.id, payload);
    } else {
      saved = createNewForm(payload);
    }

    if (saved) {
      if (publish) {
        setPublishedForm(saved);
        setIsShareModalOpen(true);
      } else {
        setSaveToast('Form saved successfully!');
        setTimeout(() => {
          setSaveToast(null);
          navigate('/admin/forms');
        }, 1200);
      }
    }
  };

  // Filtered questions for the Questions tab
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

  // Metrics
  const totalQuizPoints = questions.reduce((acc, q) => acc + (q.points || 0), 0);
  const requiredQuestionsCount = questions.filter(q => q.required).length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-semibold text-sm">
          <Clock className="w-5 h-5 animate-spin text-r-blue" />
          <span>Loading Form Configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Save Success Toast */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Share Modal on publish */}
      {publishedForm && (
        <ShareFormModal
          form={publishedForm}
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            navigate('/admin/forms');
          }}
          onTokenRegenerated={(updated) => setPublishedForm(updated)}
        />
      )}

      {/* Top Banner / Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Breadcrumb & Title */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Link to="/" className="hover:text-r-blue transition-colors">Home</Link>
                <span>/</span>
                <Link to="/admin/forms" className="hover:text-r-blue transition-colors">Forms & Feedback</Link>
                <span>/</span>
                <span className="text-slate-800 font-semibold">
                  {isEditing ? `Edit Form (${existingForm?.fid || 'FID'})` : 'Create Form'}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/admin/forms')}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Back to Forms"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
                      {isEditing ? `Edit Form: ${title || 'Untitled'}` : 'Create New LMS Form'}
                    </h1>
                    {existingForm && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
                        {existingForm.fid}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        acceptResponses
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {acceptResponses ? '● Accepting Responses' : '○ Closed'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure form purpose, automated scheduling, questions, and scoring in an intuitive 3-stage flow.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 self-start md:self-center">
              <button
                type="button"
                onClick={() => navigate('/admin/forms')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Discard
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-r-blue hover:bg-blue-700 text-white flex items-center gap-1.5 transition-all shadow-md hover:shadow-blue-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isEditing && existingForm?.status === 'Published' ? 'Update & Keep Live' : 'Publish Form'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3-Stage Stepper Navigation (Stage 1 is Setup & Settings!) */}
        <div className="border-t border-slate-200 bg-slate-50/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between overflow-x-auto">
              <div className="flex items-center gap-1 py-1">
                {[
                  { id: 'settings', label: '1. Setup & Settings', icon: Settings, desc: 'Form Details, Schedule & Behavior' },
                  { id: 'questions', label: `2. Questions & Sections (${questions.length})`, icon: ListOrdered, desc: 'Questionnaire Design' },
                  { id: 'preview', label: '3. Live Respondent Preview', icon: Eye, desc: 'Simulator & Testing' },
                ].map(({ id, label, icon: IconComp }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id as any)}
                    className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                      activeTab === id
                        ? 'border-r-blue text-r-blue bg-white shadow-xs rounded-t-xl'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-t-xl'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Summary Pill for Quiz */}
              {formType === 'Quiz' && (
                <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Total Quiz Points: {totalQuizPoints}</span>
                  <span>•</span>
                  <span>Passing: {passPercentage}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* ========================================================================= */}
        {/* STAGE 1: SETUP & SETTINGS (Form Details, Schedule, Automation & Behavior) */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* 1. Form Purpose & Archetype */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Form Purpose & Archetype <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose the structural behavior and scoring requirements for this form.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    type: 'Survey' as FormType,
                    title: 'Organizational Survey',
                    desc: 'Culture pulse, team sentiment, and wide cohort alignment analysis.',
                    icon: Star,
                    color: 'border-indigo-300 bg-indigo-50/40 text-indigo-900'
                  },
                  {
                    type: 'Feedback' as FormType,
                    title: 'Training / Module Feedback',
                    desc: 'Post-training evaluations, instructor ratings, and qualitative comments.',
                    icon: FileText,
                    color: 'border-blue-300 bg-blue-50/40 text-blue-900'
                  },
                  {
                    type: 'Quiz' as FormType,
                    title: 'Knowledge Check / Quiz',
                    desc: 'Scored assessment with passing benchmarks, retakes, and immediate grading.',
                    icon: Award,
                    color: 'border-amber-300 bg-amber-50/40 text-amber-900'
                  }
                ].map((card) => {
                  const isSelected = formType === card.type;
                  const IconC = card.icon;
                  return (
                    <button
                      key={card.type}
                      type="button"
                      onClick={() => setFormType(card.type)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                        isSelected
                          ? `${card.color} border-r-blue ring-2 ring-blue-100 shadow-sm`
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-3 right-3 p-1 rounded-full bg-r-blue text-white shadow-xs">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                      <div className="p-2 rounded-xl bg-white/80 w-fit mb-2 shadow-xs">
                        <IconC className="w-5 h-5 text-r-blue" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{card.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{card.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Title & Description (No Category or Target Audience fields) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Form Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5G Radio Access Network (RAN) Technical Knowledge Check"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-r-blue rounded-xl text-sm font-bold text-slate-900 focus:outline-none transition-all"
                />
                {errors.title && (
                  <p className="text-xs text-rose-500 font-bold mt-1.5 flex items-center gap-1">
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
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context on why this form is distributed, expected completion time, and how findings will be applied..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-r-blue rounded-xl text-xs font-medium text-slate-800 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* 3. Accept Responses Toggle & Closed Message */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ToggleRight className="w-4 h-4 text-r-blue" />
                    <span>Accept Responses</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Master switch for whether respondents can access questions and submit new responses.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptResponses}
                    onChange={(e) => setAcceptResponses(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {!acceptResponses && (
                <div className="pt-2 animate-fade-in">
                  <label className="text-xs font-bold text-rose-700 block mb-1">
                    Custom Notice (Shown to respondents when form is closed)
                  </label>
                  <input
                    type="text"
                    value={closedMessage}
                    onChange={(e) => setClosedMessage(e.target.value)}
                    placeholder="e.g. This form has concluded. Please contact your training administrator."
                    className="w-full px-3.5 py-2 bg-rose-50/40 border border-rose-200 rounded-xl text-xs font-semibold text-rose-950 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* 4. Automated Start Date & End Date Scheduling (Requirements 3 & 4) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-r-blue" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Automated Scheduling & Timeframe
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure automated opening and expiration dates using date and time pickers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                {/* START DATE & TIME TOGGLE & PICKERS (Requirement 3) */}
                <div className={`p-4 rounded-2xl border transition-all ${hasStartDate ? 'bg-blue-50/30 border-blue-200' : 'bg-slate-50/80 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Automate Form Opening (Start Date & Time)
                        </span>
                        {hasStartDate && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-r-blue text-[10px] font-bold">
                            Active Schedule
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Automatically unlocks and opens the form to respondents at the designated date and time.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasStartDate}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setHasStartDate(val);
                          if (val && !startDate) {
                            setStartDate(getTodayDateString());
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-r-blue"></div>
                    </label>
                  </div>

                  {hasStartDate && (
                    <div className="space-y-3 pt-2 border-t border-blue-100 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Start Date <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-r-blue shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-r-blue shadow-xs"
                          />
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setStartDate(getTodayDateString());
                            setStartTime('09:00');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200 shadow-2xs"
                        >
                          Today 9:00 AM
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStartDate(getFutureDateString(1));
                            setStartTime('09:00');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200 shadow-2xs"
                        >
                          Tomorrow 9:00 AM
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStartDate(getFutureDateString(7));
                            setStartTime('00:00');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200 shadow-2xs"
                        >
                          In 1 Week
                        </button>
                      </div>

                      {errors.startDate && (
                        <p className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.startDate}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* END DATE & TIME TOGGLE & PICKERS (Requirement 4) */}
                <div className={`p-4 rounded-2xl border transition-all ${hasEndDate ? 'bg-amber-50/30 border-amber-200' : 'bg-slate-50/80 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Automate Form Closing (End Date & Expiration Time)
                        </span>
                        {hasEndDate && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Active Expiry
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Automatically locks the form and stops accepting new submissions when reached.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasEndDate}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setHasEndDate(val);
                          if (val && !endDate) {
                            setEndDate(getFutureDateString(14));
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  {hasEndDate && (
                    <div className="space-y-3 pt-2 border-t border-amber-100 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            End Date <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 shadow-xs"
                          />
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEndDate(getFutureDateString(7));
                            setEndTime('23:59');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200 shadow-2xs"
                        >
                          +7 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEndDate(getFutureDateString(14));
                            setEndTime('23:59');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200 shadow-2xs"
                        >
                          +14 Days (2 Weeks)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEndDate(getFutureDateString(30));
                            setEndTime('23:59');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200 shadow-2xs"
                        >
                          +30 Days (1 Month)
                        </button>
                      </div>

                      {errors.endDate && (
                        <p className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.endDate}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Respondent Experience & Submission Controls */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Respondent Experience & Submission Controls
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      One Response per Respondent
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Restricts duplicate submissions from the same respondent account or browser session.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={oneResponsePerRespondent}
                    onChange={(e) => setOneResponsePerRespondent(e.target.checked)}
                    className="w-4 h-4 rounded text-r-blue focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Show Progress Indicator
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Displays dynamic progress bar percentage and section step indicators to respondents.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showProgressIndicator}
                    onChange={(e) => setShowProgressIndicator(e.target.checked)}
                    className="w-4 h-4 rounded text-r-blue focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Allow Anonymous Submissions
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Does not mandate verified employee login or identify learner accounts.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowAnonymous}
                    onChange={(e) => setAllowAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded text-r-blue focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Shuffle Questions
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Randomizes question order for each respondent session.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4 rounded text-r-blue focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            {/* 6. Quiz Specific Benchmarks (if Quiz) */}
            {formType === 'Quiz' && (
              <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-6 rounded-2xl border border-amber-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-950">
                      Quiz Benchmarks, Timing & Remediation Rules
                    </h3>
                    <p className="text-[11px] text-amber-700">
                      Configure passing score thresholds, time limits, and retake attempts.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Passing Score */}
                  <div className="p-3.5 bg-white rounded-xl border border-amber-200 space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      Passing Score Benchmark (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={passPercentage}
                        onChange={(e) => setPassPercentage(Number(e.target.value))}
                        min={1}
                        max={100}
                        className="w-24 px-3 py-1.5 bg-amber-50/40 border border-amber-300 rounded-lg text-sm font-bold text-amber-950 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-500">% required to pass</span>
                    </div>
                  </div>

                  {/* Time limit */}
                  <div className="p-3.5 bg-white rounded-xl border border-amber-200 space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">
                      Time Limit (Minutes)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={timeLimitMinutes}
                        onChange={(e) => setTimeLimitMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="No Limit"
                        min={1}
                        max={180}
                        className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none"
                      />
                      <span className="text-xs text-slate-500">Leave blank for untimed</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <label className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-amber-200 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Show Score & Answers Immediately
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Discloses final percentage score, point breakdown, and feedback explanations upon submission.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showScoreImmediately}
                      onChange={(e) => setShowScoreImmediately(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-amber-200 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Allow Retake after Failure
                      </span>
                      <span className="text-[11px] text-slate-500">
                        If respondent fails below {passPercentage}%, enable the "Retake Assessment" remediation button.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowRetakeAfterFailure}
                      onChange={(e) => setAllowRetakeAfterFailure(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                  </label>

                  {allowRetakeAfterFailure && (
                    <div className="p-3.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Max Allowed Retake Attempts:</span>
                      <input
                        type="number"
                        value={maxRetakeAttempts}
                        onChange={(e) => setMaxRetakeAttempts(Math.max(1, Number(e.target.value)))}
                        min={1}
                        max={10}
                        className="w-20 px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-lg font-bold text-amber-950 text-right"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. Post-Submission Thank You Message */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Post-Submission Thank You Message
              </label>
              <textarea
                rows={2}
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-r-blue"
              />
            </div>

            {/* Action: Next to Questions */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  if (validateForm()) {
                    setActiveTab('questions');
                  }
                }}
                className="px-6 py-3 bg-r-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
              >
                <span>Proceed to Questions & Sections</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: QUESTIONS & SECTIONS (UX Improved Builder & Quick Presets Toolbar) */}
        {/* ========================================================================= */}
        {activeTab === 'questions' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Top Metrics Header */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-r-blue border border-indigo-100">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Questionnaire Design Studio
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-semibold text-slate-700">{questions.length} Total Questions</span>
                    <span>&bull;</span>
                    <span>{sections.length} Section{sections.length > 1 ? 's' : ''}</span>
                    <span>&bull;</span>
                    <span>{requiredQuestionsCount} Mandatory</span>
                    {formType === 'Quiz' && (
                      <>
                        <span>&bull;</span>
                        <span className="text-amber-700 font-bold">{totalQuizPoints} Total Points</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAllCollapsed(!allCollapsed)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {allCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  <span>{allCollapsed ? 'Expand All' : 'Collapse All'}</span>
                </button>
              </div>
            </div>

            {/* Quick Add Question Toolbar (Requirement 5) */}
            <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/80 rounded-2xl p-4 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-r-blue" />
                  <span className="text-xs font-bold text-slate-800">
                    Quick Insert Question Presets
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Click any template to append a pre-configured question instantly
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {[
                  { type: 'rating' as QuestionType, label: '5-Star Rating', icon: Star, color: 'hover:border-amber-400 hover:bg-amber-50 text-amber-700' },
                  { type: 'likert' as QuestionType, label: 'Likert Scale', icon: Table, color: 'hover:border-indigo-400 hover:bg-indigo-50 text-indigo-700' },
                  { type: 'single_choice' as QuestionType, label: 'Single Choice', icon: Sliders, color: 'hover:border-blue-400 hover:bg-blue-50 text-blue-700' },
                  { type: 'multiple_choice' as QuestionType, label: 'Multi Choice', icon: CheckSquare, color: 'hover:border-cyan-400 hover:bg-cyan-50 text-cyan-700' },
                  { type: 'nps' as QuestionType, label: '0-10 NPS', icon: ThumbsUp, color: 'hover:border-purple-400 hover:bg-purple-50 text-purple-700' },
                  { type: 'long_text' as QuestionType, label: 'Feedback Text', icon: AlignLeft, color: 'hover:border-emerald-400 hover:bg-emerald-50 text-emerald-700' },
                  { type: 'number' as QuestionType, label: 'Number Input', icon: Hash, color: 'hover:border-rose-400 hover:bg-rose-50 text-rose-700' },
                  { type: 'yes_no' as QuestionType, label: 'Yes / No Check', icon: CheckCircle2, color: 'hover:border-orange-400 hover:bg-orange-50 text-orange-700' },
                ].map(({ type, label, icon: IconC, color }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleAddPresetQuestion(type)}
                    className={`p-2.5 bg-white border border-slate-200 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all shadow-2xs ${color}`}
                    title={`Add ${label} Question`}
                  >
                    <IconC className="w-4 h-4" />
                    <span className="text-[11px] font-bold text-slate-800 whitespace-nowrap">{label}</span>
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

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={questionSearchQuery}
                    onChange={(e) => setQuestionSearchQuery(e.target.value)}
                    placeholder="Search questions by keyword or title..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-r-blue"
                  />
                </div>

                <select
                  value={selectedSectionFilter}
                  onChange={(e) => setSelectedSectionFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-r-blue"
                >
                  <option value="all">All Sections ({questions.length})</option>
                  {sections.map((sec, idx) => {
                    const count = questions.filter(q => q.sectionId === sec.id).length;
                    return (
                      <option key={sec.id} value={sec.id}>
                        Section {idx + 1}: {sec.title} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddQuestion(selectedSectionFilter !== 'all' ? selectedSectionFilter : undefined)}
                  className="px-4 py-2 bg-r-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
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

              {displayedQuestions.length === 0 && (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
                  <p className="text-sm font-bold text-slate-700">No questions match your current view/filter</p>
                  <p className="text-xs text-slate-500">Add a new question or clear your search query.</p>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion(selectedSectionFilter !== 'all' ? selectedSectionFilter : undefined)}
                    className="px-4 py-2 bg-r-blue text-white rounded-xl text-xs font-bold"
                  >
                    + Add Question Here
                  </button>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                ← Back to Setup & Settings
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="px-6 py-2.5 bg-r-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <span>Proceed to Live Preview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: LIVE RESPONDENT PREVIEW (Testing, Simulation & Verification) */}
        {/* ========================================================================= */}
        {activeTab === 'preview' && (
          <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
            {/* Simulation Header */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Live Respondent Experience Simulator
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewAnswers({});
                  setPreviewSubmitted(false);
                  setPreviewSectionIndex(0);
                }}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Test</span>
              </button>
            </div>

            {/* Respondent Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-r-blue text-[10px] font-bold border border-blue-200 uppercase tracking-wider">
                    {formType}
                  </span>
                  {hasStartDate && startDate && (
                    <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span>Starts: {startDate} {startTime}</span>
                    </span>
                  )}
                  {hasEndDate && endDate && (
                    <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      <span>Closes: {endDate} {endTime}</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold font-heading text-slate-900">{title || 'Untitled Form'}</h2>
                {description && <p className="text-xs text-slate-600 mt-2 leading-relaxed">{description}</p>}
              </div>

              {/* Progress bar preview */}
              {showProgressIndicator && (
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Section {previewSectionIndex + 1} of {sections.length || 1}</span>
                    <span>Progress: {Math.round(((previewSectionIndex + 1) / (sections.length || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-r-blue rounded-full transition-all duration-300"
                      style={{ width: `${((previewSectionIndex + 1) / (sections.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Section Header */}
              {sections[previewSectionIndex] && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">{sections[previewSectionIndex].title}</h3>
                  {sections[previewSectionIndex].description && (
                    <p className="text-xs text-slate-500 mt-0.5">{sections[previewSectionIndex].description}</p>
                  )}
                </div>
              )}

              {/* Form questions inside current active section */}
              <div className="space-y-6">
                {questions
                  .filter(q => q.sectionId === (sections[previewSectionIndex]?.id || sections[0]?.id))
                  .map((q, qIdx) => (
                    <div key={q.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {qIdx + 1}. {q.title}
                            {q.required && <span className="text-rose-500 ml-1">*</span>}
                          </p>
                          {q.subtitle && <p className="text-xs text-slate-500 mt-0.5">{q.subtitle}</p>}
                        </div>
                        {formType === 'Quiz' && q.points && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold">
                            {q.points} pts
                          </span>
                        )}
                      </div>

                      {/* Choice rendering */}
                      {(q.type === 'choice' || q.type === 'single_choice' || q.type === 'multiple_choice') && (
                        <div className="space-y-2">
                          {q.choiceDisplay === 'dropdown' ? (
                            <select
                              value={previewAnswers[q.id] || ''}
                              onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                            >
                              <option value="">Select an option...</option>
                              {q.options?.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.text}</option>
                              ))}
                            </select>
                          ) : (
                            q.options?.map(opt => {
                              const isSelected = q.multipleAnswers
                                ? Array.isArray(previewAnswers[q.id]) && previewAnswers[q.id].includes(opt.id)
                                : previewAnswers[q.id] === opt.id;

                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => {
                                    if (q.multipleAnswers) {
                                      const current = Array.isArray(previewAnswers[q.id]) ? previewAnswers[q.id] : [];
                                      const next = current.includes(opt.id)
                                        ? current.filter((id: string) => id !== opt.id)
                                        : [...current, opt.id];
                                      setPreviewAnswers(prev => ({ ...prev, [q.id]: next }));
                                    } else {
                                      setPreviewAnswers(prev => ({ ...prev, [q.id]: opt.id }));
                                    }
                                  }}
                                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                                    isSelected
                                      ? 'bg-blue-50 border-r-blue text-blue-950 ring-1 ring-r-blue'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded-${q.multipleAnswers ? 'md' : 'full'} border flex items-center justify-center ${
                                    isSelected ? 'bg-r-blue border-r-blue text-white' : 'border-slate-300 bg-white'
                                  }`}>
                                    {isSelected && <Check className="w-2.5 h-2.5" />}
                                  </div>
                                  <span>{opt.text}</span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}

                      {/* Rating rendering */}
                      {q.type === 'rating' && (
                        <div className="flex items-center gap-1.5 py-1">
                          {Array.from({ length: q.ratingLevels || 5 }).map((_, rIdx) => {
                            const val = rIdx + 1;
                            const isFilled = (previewAnswers[q.id] || 0) >= val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setPreviewAnswers(prev => ({ ...prev, [q.id]: val }))}
                                className={`p-2 rounded-xl transition-all ${
                                  isFilled ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400 bg-white border border-slate-200'
                                }`}
                              >
                                <Star className="w-5 h-5 fill-current" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* NPS rendering */}
                      {q.type === 'nps' && (
                        <div className="grid grid-cols-11 gap-1 py-1">
                          {Array.from({ length: 11 }).map((_, nIdx) => {
                            const isSelected = previewAnswers[q.id] === nIdx;
                            return (
                              <button
                                key={nIdx}
                                type="button"
                                onClick={() => setPreviewAnswers(prev => ({ ...prev, [q.id]: nIdx }))}
                                className={`py-2 text-center rounded-lg text-xs font-bold border transition-all ${
                                  isSelected ? 'bg-r-blue text-white border-r-blue' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {nIdx}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Text rendering */}
                      {(q.type === 'text' || q.type === 'short_text' || q.type === 'long_text') && (
                        <div>
                          {q.type === 'long_text' ? (
                            <textarea
                              rows={3}
                              value={previewAnswers[q.id] || ''}
                              onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                              placeholder="Write your response here..."
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                            />
                          ) : (
                            <input
                              type="text"
                              value={previewAnswers[q.id] || ''}
                              onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                              placeholder="Enter your short answer..."
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                            />
                          )}
                        </div>
                      )}

                      {/* Number rendering */}
                      {q.type === 'number' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={previewAnswers[q.id] || ''}
                            onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            placeholder={q.numberValidation?.placeholder || 'Enter number...'}
                            className="w-36 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                          />
                          {q.numberValidation?.unit && (
                            <span className="text-xs font-semibold text-slate-500">{q.numberValidation.unit}</span>
                          )}
                        </div>
                      )}

                      {/* Yes / No rendering */}
                      {q.type === 'yes_no' && (
                        <div className="flex items-center gap-3">
                          {['Yes / True', 'No / False'].map((optText, oIdx) => {
                            const valId = oIdx === 0 ? 'y1' : 'n1';
                            const isSelected = previewAnswers[q.id] === valId;
                            return (
                              <button
                                key={valId}
                                type="button"
                                onClick={() => setPreviewAnswers(prev => ({ ...prev, [q.id]: valId }))}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                  isSelected ? 'bg-r-blue text-white border-r-blue' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {optText}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Navigation in simulator */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={previewSectionIndex === 0}
                  onClick={() => setPreviewSectionIndex(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-700"
                >
                  ← Previous Section
                </button>

                {previewSectionIndex < sections.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setPreviewSectionIndex(prev => prev + 1)}
                    className="px-5 py-2 bg-r-blue text-white rounded-xl text-xs font-bold"
                  >
                    Next Section →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPreviewSubmitted(true)}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulate Submit</span>
                  </button>
                )}
              </div>

              {/* Submission Feedback in Preview */}
              {previewSubmitted && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 text-xs space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Submission Successfully Simulated!</span>
                  </div>
                  <p className="leading-relaxed">{thankYouMessage}</p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('questions')}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                ← Back to Questions
              </button>

              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-6 py-2.5 bg-r-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Publish Form Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CreateFormPage;
