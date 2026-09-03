// components/forms/FormBuilderModal.tsx
import React, { useState, useEffect } from 'react';
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
  ArrowRight
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

  // Active Tab
  const [activeTab, setActiveTab] = useState<'info' | 'questions' | 'settings' | 'preview'>('info');

  // Form Info
  const [formType, setFormType] = useState<FormType>('Survey');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Training Evaluation');
  const [targetAudience, setTargetAudience] = useState('All Organization');

  // Sections
  const [sections, setSections] = useState<FormSection[]>([]);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');

  // Questions
  const [questions, setQuestions] = useState<FormQuestion[]>([]);

  // Settings State
  const [acceptResponses, setAcceptResponses] = useState(true);
  const [startDate, setStartDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endDate, setEndDate] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('23:59');
  const [oneResponsePerRespondent, setOneResponsePerRespondent] = useState(false);
  const [showProgressIndicator, setShowProgressIndicator] = useState(true);
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [requireLogin, setRequireLogin] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | ''>('');
  const [passPercentage, setPassPercentage] = useState<number>(75);
  const [showScoreImmediately, setShowScoreImmediately] = useState(true);
  const [allowRetakeAfterFailure, setAllowRetakeAfterFailure] = useState(true);
  const [maxRetakeAttempts, setMaxRetakeAttempts] = useState<number>(3);
  const [thankYouMessage, setThankYouMessage] = useState(
    'Thank you for submitting your responses. Your insights are greatly appreciated.'
  );
  const [closedMessage, setClosedMessage] = useState(
    'This form is currently not accepting responses.'
  );

  // Preview interactive state
  const [previewSectionIndex, setPreviewSectionIndex] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  // Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (formToEdit) {
      setFormType(formToEdit.type);
      setTitle(formToEdit.title);
      setDescription(formToEdit.description);
      setCategory(formToEdit.category || 'General');
      setTargetAudience(formToEdit.targetAudience || 'All Organization');

      // Sections
      const initialSections = formToEdit.sections && formToEdit.sections.length > 0
        ? formToEdit.sections
        : [{ id: 'sec-1', title: 'Section 1', description: 'Primary questionnaire section', order: 0 }];
      setSections(initialSections);

      // Settings
      setAcceptResponses(formToEdit.settings?.acceptResponses ?? true);
      setStartDate(formToEdit.settings?.startDate || '');
      setStartTime(formToEdit.settings?.startTime || '09:00');
      setEndDate(formToEdit.endDate || formToEdit.settings?.endDate || '');
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
      // New form defaults
      const defaultSec: FormSection = {
        id: `sec-${Date.now()}-1`,
        title: 'Section 1: General Assessment',
        description: 'Core feedback questionnaire',
        order: 0
      };
      setFormType('Survey');
      setTitle('');
      setDescription('');
      setCategory('Training Evaluation');
      setTargetAudience('All Organization');
      setSections([defaultSec]);
      setAcceptResponses(true);
      setStartDate('');
      setStartTime('09:00');
      setEndDate('');
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
      setThankYouMessage(
        'Thank you for submitting your responses. Your insights are greatly appreciated.'
      );
      setClosedMessage('This form is currently not accepting responses.');
      setQuestions(getDefaultQuestions('Survey', defaultSec.id));
    }
    setActiveTab('info');
    setSelectedSectionFilter('all');
    setErrors({});
    setPreviewSubmitted(false);
    setPreviewAnswers({});
  }, [formToEdit, isOpen]);

  if (!isOpen) return null;

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

  // Question manipulation
  const handleAddQuestion = (targetSectionId?: string) => {
    const secId = targetSectionId || (sections[0]?.id ?? 'sec-1');
    const newQ: FormQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sectionId: secId,
      title: 'New Question',
      subtitle: '',
      type: formType === 'Quiz' ? 'choice' : 'rating',
      choiceDisplay: 'radio',
      required: true,
      points: formType === 'Quiz' ? 10 : undefined,
      ratingLevels: 5,
      ratingIcon: 'star',
      options: formType === 'Quiz' ? [
        { id: `opt-${Date.now()}-1`, text: 'Option 1' },
        { id: `opt-${Date.now()}-2`, text: 'Option 2' },
        { id: `opt-${Date.now()}-3`, text: 'Option 3' }
      ] : undefined,
      correctOptionId: formType === 'Quiz' ? `opt-${Date.now()}-1` : undefined
    };

    setQuestions(prev => [...prev, newQ]);
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
      options: original.options ? original.options.map(o => ({ ...o, id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` })) : undefined
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

  // Section deletion sync: when a section is removed, assign its questions to the first remaining section
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

    if (questions.length === 0) {
      newErrors.questions = 'Please add at least one question.';
    }

    questions.forEach((q, idx) => {
      if (!q.title.trim()) {
        newErrors[`q_${idx}`] = `Question ${idx + 1} must have a title.`;
      }
      if ((q.type === 'choice' || q.type === 'single_choice' || q.type === 'multiple_choice') && (!q.options || q.options.length < 2)) {
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
      // Find first tab with error
      if (errors.title) {
        setActiveTab('info');
      } else {
        setActiveTab('questions');
      }
      return;
    }

    const payload: Partial<LMSForm> = {
      title: title.trim(),
      description: description.trim(),
      type: formType,
      category,
      targetAudience,
      endDate: endDate || null,
      sections,
      settings: {
        acceptResponses,
        startDate: startDate || null,
        startTime: startTime || null,
        endDate: endDate || null,
        endTime: endTime || null,
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

    let savedForm: LMSForm | undefined;
    if (isEditing && formToEdit) {
      savedForm = updateForm(formToEdit.id, payload);
    } else {
      savedForm = createNewForm(payload);
    }

    if (savedForm) {
      onFormSaved(savedForm, publish);
      onClose();
    }
  };

  // Filtered questions for the Questions tab
  const displayedQuestions = selectedSectionFilter === 'all'
    ? questions
    : questions.filter(q => q.sectionId === selectedSectionFilter);

  // Total calculated points for Quiz
  const totalQuizPoints = questions.reduce((acc, q) => acc + (q.points || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-5xl w-full h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Enterprise LMS Form Builder
                </span>
                {formToEdit && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-slate-300 border border-slate-700">
                    {formToEdit.fid}
                  </span>
                )}
                {/* Responses accepted badge */}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    acceptResponses
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {acceptResponses ? '● Accepting Responses' : '○ Responses Paused'}
                </span>
              </div>
              <h2 className="text-lg font-bold font-heading text-white">
                {isEditing ? `Edit Form: ${title || 'Untitled'}` : 'Create New LMS Form'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-md hover:shadow-indigo-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isEditing && formToEdit?.status === 'Published' ? 'Update & Keep Live' : 'Publish Form'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[
              { id: 'info', label: '1. Form Info', icon: FileText },
              { id: 'questions', label: `2. Sections & Questions (${questions.length})`, icon: ListOrdered },
              { id: 'settings', label: '3. Settings & Scheduling', icon: Settings },
              { id: 'preview', label: '4. Live Respondent Preview', icon: Eye },
            ].map(({ id, label, icon: IconComp }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id as any)}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === id
                    ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Quiz summary pill in tabs bar */}
          {formType === 'Quiz' && (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Total Points: {totalQuizPoints}</span>
              <span>•</span>
              <span>Pass: {passPercentage}%</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
          {/* TAB 1: FORM INFO */}
          {activeTab === 'info' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
              {/* Form Type Selection Cards */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Form Purpose & Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      type: 'Survey' as FormType,
                      title: 'Organizational Survey',
                      desc: 'Culture pulse, leadership feedback, and wide cohort sentiment analysis.',
                      icon: Star,
                      color: 'border-indigo-300 bg-indigo-50/40 text-indigo-900'
                    },
                    {
                      type: 'Feedback' as FormType,
                      title: 'Session / Module Feedback',
                      desc: 'Post-training evaluations, instructor ratings, and qualitative comments.',
                      icon: FileText,
                      color: 'border-blue-300 bg-blue-50/40 text-blue-900'
                    },
                    {
                      type: 'Quiz' as FormType,
                      title: 'Knowledge Check / Quiz',
                      desc: 'Scored technical assessment with passing scores, retake logic, and certificates.',
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
                            ? `${card.color} border-indigo-600 ring-2 ring-indigo-100 shadow-sm`
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-3 right-3 p-1 rounded-full bg-indigo-600 text-white">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                        <div className="p-2 rounded-xl bg-white/80 w-fit mb-2 shadow-xs">
                          <IconC className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{card.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{card.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Description */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Form Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 5G Radio Access Network (RAN) Knowledge Check"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-sm font-bold text-slate-900 focus:outline-none transition-all"
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
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide context on why this form is distributed, completion expectations, and how results will be applied..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl text-xs font-medium text-slate-800 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Training Evaluation">Training Evaluation</option>
                      <option value="Technical Certification">Technical Certification</option>
                      <option value="Organizational Pulse">Organizational Pulse</option>
                      <option value="Mentorship & Coaching">Mentorship & Coaching</option>
                      <option value="Security & DevOps">Security & DevOps</option>
                      <option value="Product Feedback">Product Feedback</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. All Organization, RAN Engineering Track"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action next */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('questions')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <span>Proceed to Sections & Questions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SECTIONS & QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              {/* Section Manager */}
              <SectionManager
                sections={sections}
                onUpdateSections={handleUpdateSections}
                activeSectionId={selectedSectionFilter !== 'all' ? selectedSectionFilter : undefined}
                onSelectSection={(secId) => setSelectedSectionFilter(secId === selectedSectionFilter ? 'all' : secId)}
                onAddQuestionToSection={(secId) => handleAddQuestion(secId)}
              />

              {/* Filter and Add Question Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Filter Section View:</span>
                  <select
                    value={selectedSectionFilter}
                    onChange={(e) => setSelectedSectionFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Sections ({questions.length} Questions)</option>
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
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
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
                      onUpdate={(updated) => handleUpdateQuestion(absoluteIndex, updated)}
                      onDuplicate={() => handleDuplicateQuestion(absoluteIndex)}
                      onDelete={() => handleDeleteQuestion(absoluteIndex)}
                      onMoveUp={() => handleMoveQuestion(absoluteIndex, 'up')}
                      onMoveDown={() => handleMoveQuestion(absoluteIndex, 'down')}
                    />
                  );
                })}

                {displayedQuestions.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-sm font-bold text-slate-700">No questions in this section yet</p>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion(selectedSectionFilter !== 'all' ? selectedSectionFilter : undefined)}
                      className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                    >
                      + Add First Question Here
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS & SCHEDULING */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
              {/* 1. Accept Responses Toggle */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ToggleRight className="w-4 h-4 text-indigo-600" />
                      <span>Accept Responses</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Toggle whether learners can submit new responses or view a closed status notice.
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
                  <div className="pt-2">
                    <label className="text-xs font-bold text-rose-700 block mb-1">
                      Custom Closed Notice (Shown to Respondents when closed)
                    </label>
                    <input
                      type="text"
                      value={closedMessage}
                      onChange={(e) => setClosedMessage(e.target.value)}
                      placeholder="e.g. This evaluation window has concluded. Please contact your administrator."
                      className="w-full px-3.5 py-2 bg-rose-50/40 border border-rose-200 rounded-xl text-xs font-semibold text-rose-950 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 2. Start/End Date and Time */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Timeframe & Scheduling
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Start Date & Time */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700">Start Date & Time</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Time</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* End Date & Time */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700">End Date & Time</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Date</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Time</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Submission Constraints & Progress Bar */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Respondent Constraints & Experience
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        One Response per Respondent
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Restricts multiple submissions from the same respondent account or session.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={oneResponsePerRespondent}
                      onChange={(e) => setOneResponsePerRespondent(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Show Progress Indicator
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Displays dynamic progress percentage and section step dots to the respondent.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showProgressIndicator}
                      onChange={(e) => setShowProgressIndicator(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Allow Anonymous Submissions
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Does not mandate verified employee login or email capture.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowAnonymous}
                      onChange={(e) => setAllowAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
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
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>

              {/* 4. Quiz Specific Settings (Passing Score, Retake Logic, Show Score) */}
              {formType === 'Quiz' && (
                <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-5 rounded-2xl border border-amber-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    <div>
                      <h3 className="text-sm font-bold text-amber-950">
                        Quiz Certification & Retake Rules
                      </h3>
                      <p className="text-[11px] text-amber-700">
                        Configure pass benchmarks, immediate result disclosures, and remediation retakes.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Passing Score */}
                    <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
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
                          className="w-24 px-3 py-1.5 bg-amber-50/40 border border-amber-300 rounded-lg text-sm font-bold text-amber-950"
                        />
                        <span className="text-xs font-bold text-slate-500">% required to pass</span>
                      </div>
                    </div>

                    {/* Time limit */}
                    <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
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
                          className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900"
                        />
                        <span className="text-xs text-slate-500">Leave blank for untimed</span>
                      </div>
                    </div>
                  </div>

                  {/* Show Score & Retake Toggles */}
                  <div className="space-y-2.5 pt-1">
                    <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-200 cursor-pointer">
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

                    <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-200 cursor-pointer">
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
                      <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between text-xs">
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

              {/* Thank You Message */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Post-Submission Thank You Message
                </label>
                <textarea
                  rows={2}
                  value={thankYouMessage}
                  onChange={(e) => setThankYouMessage(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: LIVE INTERACTIVE PREVIEW */}
          {activeTab === 'preview' && (
            <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
              <div className="bg-indigo-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                    Live Respondent Experience Simulator
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewAnswers({});
                    setPreviewSubmitted(false);
                  }}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Test</span>
                </button>
              </div>

              {/* Respondent Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200 uppercase tracking-wider">
                      {formType}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{category}</span>
                  </div>
                  <h1 className="text-xl font-bold font-heading text-slate-900">{title || 'Untitled Form'}</h1>
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
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${((previewSectionIndex + 1) / (sections.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Questions Preview for active section */}
                {!previewSubmitted ? (
                  <div className="space-y-6">
                    {questions
                      .filter(q => !sections[previewSectionIndex] || q.sectionId === sections[previewSectionIndex].id)
                      .map((q, idx) => (
                        <div key={q.id} className="space-y-2 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-indigo-600 mt-0.5">{idx + 1}.</span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                {q.title} {q.required && <span className="text-rose-500">*</span>}
                              </h4>
                              {q.subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{q.subtitle}</p>}
                            </div>
                          </div>

                          {/* Choice render */}
                          {(q.type === 'choice' || q.type === 'single_choice' || q.type === 'multiple_choice') && (
                            <div className="space-y-2 pt-2">
                              {q.choiceDisplay === 'dropdown' ? (
                                <select
                                  value={previewAnswers[q.id] || ''}
                                  onChange={(e) => setPreviewAnswers({ ...previewAnswers, [q.id]: e.target.value })}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                                >
                                  <option value="">Select an option...</option>
                                  {(q.options || []).map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.text}</option>
                                  ))}
                                </select>
                              ) : (
                                (q.options || []).map(opt => (
                                  <label
                                    key={opt.id}
                                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                      previewAnswers[q.id] === opt.id
                                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900'
                                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                                    }`}
                                  >
                                    <input
                                      type={q.multipleAnswers ? 'checkbox' : 'radio'}
                                      name={`preview-q-${q.id}`}
                                      checked={
                                        q.multipleAnswers
                                          ? (previewAnswers[q.id] || []).includes(opt.id)
                                          : previewAnswers[q.id] === opt.id
                                      }
                                      onChange={() => setPreviewAnswers({ ...previewAnswers, [q.id]: opt.id })}
                                      className="text-indigo-600"
                                    />
                                    <span>{opt.text}</span>
                                  </label>
                                ))
                              )}
                            </div>
                          )}

                          {/* Rating render */}
                          {q.type === 'rating' && (
                            <div className="flex items-center gap-2 pt-2">
                              {Array.from({ length: q.ratingLevels || 5 }).map((_, rIdx) => {
                                const val = rIdx + 1;
                                const isSelected = previewAnswers[q.id] >= val;
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setPreviewAnswers({ ...previewAnswers, [q.id]: val })}
                                    className={`p-2 rounded-xl transition-all ${
                                      isSelected
                                        ? 'bg-amber-400 text-white shadow-xs'
                                        : 'bg-white text-slate-400 border border-slate-200 hover:bg-amber-50'
                                    }`}
                                  >
                                    <Star className="w-5 h-5 fill-current" />
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Number render */}
                          {q.type === 'number' && (
                            <div className="pt-2">
                              <input
                                type="number"
                                value={previewAnswers[q.id] || ''}
                                onChange={(e) => setPreviewAnswers({ ...previewAnswers, [q.id]: e.target.value })}
                                placeholder={q.numberValidation?.placeholder || 'Enter number...'}
                                className="w-48 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                              />
                            </div>
                          )}
                        </div>
                      ))}

                    <div className="pt-4 flex items-center justify-between">
                      {previewSectionIndex > 0 ? (
                        <button
                          type="button"
                          onClick={() => setPreviewSectionIndex(prev => prev - 1)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                        >
                          Previous Section
                        </button>
                      ) : <div />}

                      {previewSectionIndex < sections.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => setPreviewSectionIndex(prev => prev + 1)}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <span>Next Section</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPreviewSubmitted(true)}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                        >
                          <Check className="w-4 h-4" />
                          <span>Submit Responses</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4 animate-fade-in">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Submission Recorded</h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">{thankYouMessage}</p>
                    {formType === 'Quiz' && showScoreImmediately && (
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 max-w-sm mx-auto space-y-2">
                        <div className="text-xs font-bold text-amber-900">Calculated Test Result</div>
                        <div className="text-2xl font-bold text-amber-600">85% PASS</div>
                        <p className="text-[11px] text-amber-800">
                          Passing benchmark was {passPercentage}%. Verified into Skills Passport.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
