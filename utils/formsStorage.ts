// utils/formsStorage.ts
import {
  LMSForm,
  FormSubmissionRecord,
  FormSection,
  FeedbackAssignment,
  AssignmentStatus,
  CSVValidationSummary,
  CSVValidationRowResult,
  FormResponseItem
} from '../types/forms';

const STORAGE_KEY = 'lms_admin_forms_v2';
const RESPONSES_STORAGE_KEY = 'lms_form_responses_v2';
const ASSIGNMENTS_STORAGE_KEY = 'lms_feedback_assignments_v2';

export const INITIAL_MOCK_FORMS: LMSForm[] = [
  {
    id: 'form-101',
    fid: 'FID-1092',
    title: 'Q3 Enterprise Leadership & Culture Pulse Survey',
    description: 'Comprehensive pulse survey across all engineering, product, and operations divisions to evaluate organizational clarity, psychological safety, and leadership enablement.',
    type: 'Survey',
    status: 'Published',
    responseCount: 248,
    createdDate: '2026-08-10',
    endDate: '2026-09-30',
    token: 'nfb_lead92a',
    targetAudience: 'All Organization (Global)',
    category: 'Organizational Pulse',
    creatorName: 'Rajesh Sharma',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80',
    sections: [
      {
        id: 'sec-1',
        title: 'Section 1: Strategic Vision & Psychological Safety',
        description: 'Assessing communication quality, goal alignment, and leadership transparency.',
        order: 0
      },
      {
        id: 'sec-2',
        title: 'Section 2: Team Collaboration & Workload Metrics',
        description: 'Quantitative and qualitative feedback on tooling, velocity, and daily productivity.',
        order: 1
      }
    ],
    settings: {
      acceptResponses: true,
      startDate: '2026-08-10',
      startTime: '09:00',
      endDate: '2026-09-30',
      endTime: '23:59',
      oneResponsePerRespondent: true,
      showProgressIndicator: true,
      allowAnonymous: true,
      requireLogin: false,
      shuffleQuestions: false,
      thankYouMessage: 'Thank you for contributing to our continuous cultural evolution. Your insights directly shape our next quarter roadmap.',
    },
    questions: [
      {
        id: 'q1',
        sectionId: 'sec-1',
        title: 'How clearly do you understand our strategic company priorities for H2 2026?',
        subtitle: 'Consider company all-hands updates and quarterly OKR milestones.',
        type: 'rating',
        required: true,
        ratingLevels: 5,
        ratingIcon: 'star',
        ratingLabels: { min: 'Completely Unclear', mid: 'Somewhat Clear', max: 'Crystal Clear' },
        minRating: 1,
        maxRating: 5
      },
      {
        id: 'q2',
        sectionId: 'sec-1',
        title: 'On a scale of 0-10, how likely are you to recommend our company as a top-tier workplace?',
        subtitle: 'Standard Net Promoter Score rating scale.',
        type: 'nps',
        required: true,
      },
      {
        id: 'q3',
        sectionId: 'sec-1',
        title: 'Which department/track are you primarily affiliated with?',
        subtitle: 'Select your operational domain (Forward branching enabled).',
        type: 'choice',
        choiceDisplay: 'dropdown',
        required: true,
        options: [
          { id: 'opt_eng', text: 'Engineering & DevOps' },
          { id: 'opt_prod', text: 'Product & Design' },
          { id: 'opt_ops', text: 'Operations & People' },
          { id: 'opt_other', text: 'Other Specialized Team' }
        ],
        allowOther: true,
        otherOptionText: 'Other Team',
        branchingRules: [
          { optionId: 'opt_eng', targetAction: 'next' },
          { optionId: 'opt_prod', targetAction: 'section', targetId: 'sec-2' },
          { optionId: 'opt_ops', targetAction: 'section', targetId: 'sec-2' },
          { optionId: 'opt_other', targetAction: 'section', targetId: 'sec-2' }
        ]
      },
      {
        id: 'q4',
        sectionId: 'sec-2',
        title: 'Please rate your agreement with the following team environment statements:',
        subtitle: 'Likert matrix scale across organizational dimensions.',
        type: 'likert',
        required: true,
        likertStatements: [
          'Our sprint goals are well-scoped and achievable.',
          'Cross-team dependencies are resolved without friction.',
          'Continuous learning time is encouraged by my manager.',
          'We have the technical tools needed to succeed.'
        ],
        likertOptions: [
          'Strongly Disagree',
          'Disagree',
          'Neutral',
          'Agree',
          'Strongly Agree'
        ]
      },
      {
        id: 'q5',
        sectionId: 'sec-2',
        title: 'Approximately how many hours per week do you spend in synchronous meetings?',
        subtitle: 'Enter an estimated number between 0 and 40.',
        type: 'number',
        required: false,
        numberValidation: {
          min: 0,
          max: 40,
          step: 1,
          allowDecimals: false,
          unit: 'hrs/week',
          placeholder: 'e.g. 8'
        }
      },
      {
        id: 'q6',
        sectionId: 'sec-2',
        title: 'What is one concrete initiative leadership could take to remove impediments in your daily workflow?',
        subtitle: 'Open feedback is reviewed directly by our People & Culture task force.',
        type: 'long_text',
        required: false,
      }
    ]
  },
  {
    id: 'form-102',
    fid: 'FID-1088',
    title: '5G Radio Access Network (RAN) Architecture Knowledge Check',
    description: 'Mid-term proficiency assessment for RAN deployment engineers covering beamforming, MIMO spatial multiplexing, CU/DU split architectures, and 3GPP Release 17 specifications.',
    type: 'Quiz',
    status: 'Published',
    responseCount: 114,
    createdDate: '2026-08-18',
    endDate: '2026-09-15',
    token: 'nfb_ran5g88',
    targetAudience: 'Network Engineering & Telecom Track',
    category: 'Technical Certification',
    creatorName: 'Priya Sharma',
    creatorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&q=80',
    sections: [
      {
        id: 'qsec-1',
        title: 'Part A: O-RAN Fronthaul & Architecture',
        description: 'Testing core knowledge of 3GPP splits and RAN disaggregation.',
        order: 0
      },
      {
        id: 'qsec-2',
        title: 'Part B: MIMO, Spectrum & URLLC Capabilities',
        description: 'Advanced radio resource management and low-latency parameters.',
        order: 1
      }
    ],
    settings: {
      acceptResponses: true,
      startDate: '2026-08-18',
      startTime: '08:00',
      endDate: '2026-09-15',
      endTime: '18:00',
      oneResponsePerRespondent: false,
      showProgressIndicator: true,
      allowAnonymous: false,
      requireLogin: true,
      shuffleQuestions: false,
      timeLimitMinutes: 15,
      passPercentage: 80,
      showScoreImmediately: true,
      allowRetakeAfterFailure: true,
      maxRetakeAttempts: 3,
      thankYouMessage: 'Assessment submitted successfully. Your score has been verified and registered on your Skills Passport.',
    },
    questions: [
      {
        id: 'qz1',
        sectionId: 'qsec-1',
        title: 'In a 3GPP 5G O-RAN split architecture, which functional interface connects the O-DU (Distributed Unit) to the O-RU (Radio Unit)?',
        subtitle: 'Select the primary open fronthaul standardized specification.',
        type: 'choice',
        choiceDisplay: 'radio',
        required: true,
        points: 25,
        options: [
          { id: 'o1', text: 'F1 Interface (Split 2)' },
          { id: 'o2', text: '7-2x Open Fronthaul Interface' },
          { id: 'o3', text: 'E2 Service Interface' },
          { id: 'o4', text: 'Xn Inter-gNB Interface' },
        ],
        correctOptionId: 'o2',
        correctExplanation: 'The 7-2x split defines the lower layer functional partition between O-DU and O-RU across the Open Fronthaul.'
      },
      {
        id: 'qz2',
        sectionId: 'qsec-1',
        title: 'Select the primary operating spectrum range for 5G NR TDD band n78:',
        subtitle: 'Dropdown single selection check.',
        type: 'choice',
        choiceDisplay: 'dropdown',
        required: true,
        points: 25,
        options: [
          { id: 'o5', text: '3.3 GHz - 3.8 GHz TDD' },
          { id: 'o6', text: '700 MHz FDD paired' },
          { id: 'o7', text: '28 GHz mmWave beam-only' },
          { id: 'o8', text: '850 MHz Supplemental Downlink' },
        ],
        correctOptionId: 'o5',
        correctExplanation: '3GPP defines Band n78 as 3300 MHz – 3800 MHz in Time Division Duplexing (TDD) mode.'
      },
      {
        id: 'qz3',
        sectionId: 'qsec-2',
        title: 'Which features are introduced in 3GPP Release 16 & 17 for enhanced URLLC (Ultra-Reliable Low-Latency Communication)?',
        subtitle: 'Select all applicable options.',
        type: 'choice',
        choiceDisplay: 'checkbox',
        multipleAnswers: true,
        required: true,
        points: 25,
        options: [
          { id: 'o9', text: 'Mini-slot / non-slot based fast scheduling' },
          { id: 'o10', text: 'Multi-TRP (Transmission/Reception Point) redundancy' },
          { id: 'o11', text: 'Legacy 2G/3G circuit switched fallback' },
          { id: 'o12', text: 'PDCP duplication across dual active radio links' },
        ],
        correctOptionIds: ['o9', 'o10', 'o12'],
        correctExplanation: 'Enhanced URLLC relies on mini-slots, multi-TRP spatial diversity, and dual PDCP duplication without legacy CSFB.'
      },
      {
        id: 'qz4',
        sectionId: 'qsec-2',
        title: 'Does Massive MIMO dynamic digital beamforming increase cell-edge SNR by concentrating RF energy toward active UEs?',
        subtitle: 'Binary True / False diagnostic.',
        type: 'yes_no',
        required: true,
        points: 25,
        options: [
          { id: 'y1', text: 'Yes / True' },
          { id: 'n1', text: 'No / False' },
        ],
        correctOptionId: 'y1',
        correctExplanation: 'Yes, dynamic beamforming applies constructive phase shifts to maximize gain towards specific user locations.'
      }
    ]
  },
  {
    id: 'form-103',
    fid: 'FID-1074',
    title: 'Mentorship Program Cohort 2026 Mid-Point Feedback',
    description: 'Evaluation form for mentees and mentors to share qualitative observations on goal tracking, session cadence, and mentor-mentee pairing synergy.',
    type: 'Feedback',
    status: 'Published',
    responseCount: 89,
    createdDate: '2026-08-01',
    endDate: '2026-10-15',
    token: 'nfb_mentor74',
    targetAudience: 'Active Mentorship Pairs (Cohort 2026)',
    category: 'Mentorship & Coaching',
    creatorName: 'Rohan Mehta',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80',
    settings: {
      acceptResponses: true,
      startDate: '2026-08-01',
      endDate: '2026-10-15',
      oneResponsePerRespondent: true,
      showProgressIndicator: true,
      allowAnonymous: false,
      requireLogin: true,
      shuffleQuestions: false,
      thankYouMessage: 'Your feedback has been logged. Mentorship coordinators will review observations to ensure maximal growth during the remainder of the cohort.',
    },
    questions: [
      {
        id: 'mf1',
        title: 'How satisfied are you with the cadence and depth of your 1-on-1 mentoring sessions?',
        subtitle: '10-Point deep rating scale.',
        type: 'rating',
        required: true,
        ratingLevels: 10,
        ratingIcon: 'star',
        ratingLabels: { min: 'Needs Improvement', max: 'Exceeded Expectations' }
      },
      {
        id: 'mf2',
        title: 'Have your defined Action Items and Milestone Goals progressed as planned?',
        subtitle: 'Select current milestone status.',
        type: 'yes_no',
        required: true,
      },
      {
        id: 'mf3',
        title: 'Which developmental areas have received the most focused mentorship discussions?',
        subtitle: 'Select all tracks that apply.',
        type: 'choice',
        choiceDisplay: 'checkbox',
        multipleAnswers: true,
        allowOther: true,
        required: false,
        options: [
          { id: 'mo1', text: 'System Architecture & High-Scale Design' },
          { id: 'mo2', text: 'Executive Communication & Stakeholder Influence' },
          { id: 'mo3', text: 'Project Management & Resource Allocation' },
          { id: 'mo4', text: 'Career Pathing & Promotion Milestones' },
        ]
      },
      {
        id: 'mf4',
        title: 'Share any specific breakthroughs or constructive feedback regarding program administration:',
        subtitle: 'Your notes help us tailor mid-cycle workshops.',
        type: 'long_text',
        required: false,
      }
    ]
  },
  {
    id: 'form-104',
    fid: 'FID-1065',
    title: 'Cloud Architecture & Kubernetes Security Posture Check',
    description: 'Diagnostic assessment for platform engineers regarding RBAC policies, network namespaces, mTLS service meshes, and GitOps secret management.',
    type: 'Quiz',
    status: 'Draft',
    responseCount: 0,
    createdDate: '2026-08-25',
    endDate: '2026-11-01',
    token: 'nfb_k8ssec65',
    targetAudience: 'Cloud & Infrastructure SREs',
    category: 'Security & DevOps',
    creatorName: 'Siddharth Rao',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80',
    settings: {
      acceptResponses: true,
      oneResponsePerRespondent: false,
      showProgressIndicator: true,
      allowAnonymous: false,
      requireLogin: true,
      shuffleQuestions: true,
      timeLimitMinutes: 20,
      passPercentage: 80,
      showScoreImmediately: true,
      allowRetakeAfterFailure: true,
      thankYouMessage: 'Quiz submitted successfully.',
    },
    questions: [
      {
        id: 'k1',
        title: 'Which Kubernetes native primitive is used to enforce layer 3/4 traffic isolation between pods?',
        subtitle: 'Core networking primitive.',
        type: 'choice',
        choiceDisplay: 'radio',
        required: true,
        points: 20,
        options: [
          { id: 'ko1', text: 'NetworkPolicy' },
          { id: 'ko2', text: 'ClusterRoleBinding' },
          { id: 'ko3', text: 'IngressClass' },
          { id: 'ko4', text: 'PodDisruptionBudget' },
        ],
        correctOptionId: 'ko1'
      },
      {
        id: 'k2',
        title: 'What is the recommended mechanism for injecting runtime dynamic credentials into pods without saving secrets in Git?',
        subtitle: 'Enterprise secret vault integration pattern.',
        type: 'choice',
        choiceDisplay: 'radio',
        required: true,
        points: 20,
        options: [
          { id: 'ko5', text: 'Hardcoded configmap variables' },
          { id: 'ko6', text: 'HashiCorp Vault or Cloud Secret Store CSI Driver' },
          { id: 'ko7', text: 'Base64 encoded pod annotations' },
          { id: 'ko8', text: 'Environment variable export in Dockerfile' },
        ],
        correctOptionId: 'ko6'
      }
    ]
  },
  {
    id: 'form-105',
    fid: 'FID-1052',
    title: 'New Hire Engineering Onboarding 30-Day Evaluation',
    description: 'Post-onboarding survey capturing feedback on local environment setup, buddy pairing, internal doc accessibility, and tech bootcamp effectiveness.',
    type: 'Feedback',
    status: 'Closed',
    responseCount: 64,
    createdDate: '2026-07-01',
    endDate: '2026-08-15',
    token: 'nfb_onboard52',
    targetAudience: 'Q2/Q3 Engineering New Hires',
    category: 'People & Talent Experience',
    creatorName: 'Ananya Roy',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&q=80',
    settings: {
      acceptResponses: false,
      closedMessage: 'The 30-Day onboarding feedback window for Q2 cohorts has concluded.',
      allowAnonymous: true,
      requireLogin: false,
      shuffleQuestions: false,
      thankYouMessage: 'Thank you for helping us polish the onboarding experience for future team members!',
    },
    questions: [
      {
        id: 'on1',
        title: 'How long did it take to complete your first production pull request merge from Day 1?',
        subtitle: 'Measuring ramp-up acceleration.',
        type: 'choice',
        choiceDisplay: 'radio',
        required: true,
        options: [
          { id: 'on_opt1', text: 'Within 3 days' },
          { id: 'on_opt2', text: 'First 1-2 weeks' },
          { id: 'on_opt3', text: '3-4 weeks' },
          { id: 'on_opt4', text: 'Over 1 month' },
        ]
      },
      {
        id: 'on2',
        title: 'Rate the helpfulness of your designated Onboarding Buddy:',
        subtitle: '5-star evaluation.',
        type: 'rating',
        required: true,
        ratingLevels: 5,
        ratingIcon: 'star',
        ratingLabels: { min: 'Not helpful', max: 'Outstanding support' }
      }
    ]
  },
  {
    id: 'form-106',
    fid: 'FID-1039',
    title: 'Annual Enterprise Learning & LMS Platform Usability Survey',
    description: 'Archived annual study collecting usability feedback on video speed controls, skill gap visualizations, and mobile micro-learning features.',
    type: 'Survey',
    status: 'Archived',
    responseCount: 420,
    createdDate: '2026-01-15',
    endDate: '2026-03-30',
    token: 'nfb_annual39',
    targetAudience: 'All LMS Registered Learners',
    category: 'Product Feedback',
    creatorName: 'Rajesh Sharma',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80',
    settings: {
      acceptResponses: false,
      allowAnonymous: true,
      requireLogin: false,
      shuffleQuestions: false,
      thankYouMessage: 'Survey archived.',
    },
    questions: [
      {
        id: 'a1',
        title: 'Overall satisfaction with LMS desktop and mobile performance:',
        type: 'rating',
        required: true,
        ratingLevels: 5,
        ratingIcon: 'star'
      }
    ]
  }
];

export const generateUniqueToken = (prefix = 'nfb_'): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateNextFID = (forms: LMSForm[]): string => {
  const numbers = forms.map(f => {
    const match = f.fid.match(/\d+/);
    return match ? parseInt(match[0], 10) : 1000;
  });
  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 1090;
  return `FID-${maxNum + 1}`;
};

export const getStoredForms = (): LMSForm[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_FORMS));
      return INITIAL_MOCK_FORMS;
    }
    const parsed: LMSForm[] = JSON.parse(raw);
    // Ensure all forms have valid settings
    return parsed.map(f => ({
      ...f,
      settings: {
        acceptResponses: true,
        oneResponsePerRespondent: false,
        showProgressIndicator: true,
        allowRetakeAfterFailure: true,
        passPercentage: 75,
        showScoreImmediately: true,
        ...f.settings
      }
    }));
  } catch (e) {
    console.error('Failed to parse stored LMS forms:', e);
    return INITIAL_MOCK_FORMS;
  }
};

export const saveStoredForms = (forms: LMSForm[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
  } catch (e) {
    console.error('Failed to save LMS forms to localStorage:', e);
  }
};

export const getFormById = (id: string): LMSForm | undefined => {
  const forms = getStoredForms();
  return forms.find(f => f.id === id);
};

export const getFormByToken = (token: string): LMSForm | undefined => {
  const forms = getStoredForms();
  return forms.find(f => f.token.toLowerCase() === token.toLowerCase());
};

export const createNewForm = (formData: Partial<LMSForm>): LMSForm => {
  const forms = getStoredForms();
  const fid = formData.fid || generateNextFID(forms);
  const token = formData.token || generateUniqueToken();
  const id = `form-${Date.now()}`;
  const now = new Date().toISOString().split('T')[0];

  const newForm: LMSForm = {
    id,
    fid,
    title: formData.title || 'Untitled Form',
    description: formData.description || '',
    type: formData.type || 'Survey',
    status: formData.status || 'Draft',
    responseCount: 0,
    createdDate: now,
    endDate: formData.endDate || null,
    token,
    targetAudience: formData.targetAudience || 'All Organization',
    category: formData.category || 'General',
    creatorName: formData.creatorName || 'Admin User',
    creatorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&q=80',
    sections: formData.sections || [
      {
        id: `sec-${Date.now()}-1`,
        title: 'Section 1',
        description: 'Primary questionnaire section',
        order: 0
      }
    ],
    settings: {
      acceptResponses: formData.settings?.acceptResponses ?? true,
      startDate: formData.settings?.startDate ?? null,
      startTime: formData.settings?.startTime ?? null,
      endDate: formData.settings?.endDate ?? null,
      endTime: formData.settings?.endTime ?? null,
      oneResponsePerRespondent: formData.settings?.oneResponsePerRespondent ?? false,
      showProgressIndicator: formData.settings?.showProgressIndicator ?? true,
      allowAnonymous: formData.settings?.allowAnonymous ?? true,
      requireLogin: formData.settings?.requireLogin ?? false,
      shuffleQuestions: formData.settings?.shuffleQuestions ?? false,
      timeLimitMinutes: formData.settings?.timeLimitMinutes ?? null,
      passPercentage: formData.settings?.passPercentage ?? 75,
      showScoreImmediately: formData.settings?.showScoreImmediately ?? true,
      allowRetakeAfterFailure: formData.settings?.allowRetakeAfterFailure ?? true,
      maxRetakeAttempts: formData.settings?.maxRetakeAttempts ?? 3,
      thankYouMessage: formData.settings?.thankYouMessage || 'Thank you for completing this form. Your submission has been securely recorded.',
      closedMessage: formData.settings?.closedMessage || 'This form is currently not accepting responses.',
    },
    questions: formData.questions && formData.questions.length > 0 ? formData.questions : [
      {
        id: `q-${Date.now()}-1`,
        title: 'Please enter your first question here',
        subtitle: 'Provide optional helper text or instructions',
        type: formData.type === 'Quiz' ? 'choice' : 'rating',
        choiceDisplay: 'radio',
        required: true,
        points: formData.type === 'Quiz' ? 10 : undefined,
        ratingLevels: 5,
        ratingIcon: 'star',
        options: formData.type === 'Quiz' ? [
          { id: 'opt-1', text: 'Option A' },
          { id: 'opt-2', text: 'Option B' },
          { id: 'opt-3', text: 'Option C' }
        ] : undefined,
        correctOptionId: formData.type === 'Quiz' ? 'opt-1' : undefined
      }
    ]
  };

  const updated = [newForm, ...forms];
  saveStoredForms(updated);
  return newForm;
};

export const updateForm = (id: string, updates: Partial<LMSForm>): LMSForm | undefined => {
  const forms = getStoredForms();
  const index = forms.findIndex(f => f.id === id);
  if (index === -1) return undefined;

  const current = forms[index];
  const updatedForm: LMSForm = {
    ...current,
    ...updates,
    settings: {
      ...current.settings,
      ...(updates.settings || {})
    },
    updatedAt: new Date().toISOString()
  };

  forms[index] = updatedForm;
  saveStoredForms(forms);
  return updatedForm;
};

export const publishForm = (id: string): LMSForm | undefined => {
  return updateForm(id, { status: 'Published' });
};

export const unpublishForm = (id: string): LMSForm | undefined => {
  return updateForm(id, { status: 'Draft' });
};

export const regenerateFormToken = (id: string): { form?: LMSForm; newToken: string } => {
  const newToken = generateUniqueToken();
  const updated = updateForm(id, { token: newToken });
  return { form: updated, newToken };
};

export const duplicateForm = (id: string): LMSForm | undefined => {
  const forms = getStoredForms();
  const original = forms.find(f => f.id === id);
  if (!original) return undefined;

  const newFid = generateNextFID(forms);
  const newToken = generateUniqueToken();
  const now = new Date().toISOString().split('T')[0];

  const clone: LMSForm = {
    ...original,
    id: `form-${Date.now()}`,
    fid: newFid,
    title: `${original.title} (Copy)`,
    status: 'Draft',
    responseCount: 0,
    createdDate: now,
    token: newToken,
    updatedAt: now,
    responses: []
  };

  const updated = [clone, ...forms];
  saveStoredForms(updated);
  return clone;
};

export const archiveForm = (id: string): LMSForm | undefined => {
  return updateForm(id, { status: 'Archived' });
};

export const restoreForm = (id: string): LMSForm | undefined => {
  return updateForm(id, { status: 'Draft' });
};

export const deleteForm = (id: string): boolean => {
  const forms = getStoredForms();
  const filtered = forms.filter(f => f.id !== id);
  if (filtered.length === forms.length) return false;
  saveStoredForms(filtered);
  return true;
};

export const INITIAL_MOCK_ASSIGNMENTS: FeedbackAssignment[] = [
  {
    id: 'ASG-5001',
    feedbackId: 'FID-1092',
    formId: 'form-101',
    formTitle: 'Q3 Enterprise Leadership & Culture Pulse Survey',
    formType: 'Survey',
    username: 'alex.chen',
    status: 'Pending',
    assignedDate: '2026-08-28 09:30',
    dueDate: '2026-09-15',
    token: 'nfb_lead92a',
    assignedBy: 'Rajesh Sharma'
  },
  {
    id: 'ASG-5002',
    feedbackId: 'FID-1092',
    formId: 'form-101',
    formTitle: 'Q3 Enterprise Leadership & Culture Pulse Survey',
    formType: 'Survey',
    username: 'priya.sharma',
    status: 'Completed',
    assignedDate: '2026-08-28 09:30',
    completedDate: '2026-08-29 14:15',
    dueDate: '2026-09-15',
    token: 'nfb_lead92a',
    assignedBy: 'Rajesh Sharma'
  },
  {
    id: 'ASG-5003',
    feedbackId: 'FID-1092',
    formId: 'form-101',
    formTitle: 'Q3 Enterprise Leadership & Culture Pulse Survey',
    formType: 'Survey',
    username: 'vikram.verma',
    status: 'Pending',
    assignedDate: '2026-08-28 09:30',
    dueDate: '2026-09-15',
    token: 'nfb_lead92a',
    assignedBy: 'Rajesh Sharma'
  },
  {
    id: 'ASG-5004',
    feedbackId: 'FID-1088',
    formId: 'form-102',
    formTitle: '5G Radio Access Network (RAN) Architecture Knowledge Check',
    formType: 'Quiz',
    username: 'aarav.mehta',
    status: 'Completed',
    assignedDate: '2026-08-29 11:00',
    completedDate: '2026-08-30 16:45',
    dueDate: '2026-09-10',
    token: 'nfb_ran5g88',
    assignedBy: 'Priya Sharma'
  },
  {
    id: 'ASG-5005',
    feedbackId: 'FID-1088',
    formId: 'form-102',
    formTitle: '5G Radio Access Network (RAN) Architecture Knowledge Check',
    formType: 'Quiz',
    username: 'kavita.patel',
    status: 'Pending',
    assignedDate: '2026-08-29 11:00',
    dueDate: '2026-09-10',
    token: 'nfb_ran5g88',
    assignedBy: 'Priya Sharma'
  },
  {
    id: 'ASG-5006',
    feedbackId: 'FID-1088',
    formId: 'form-102',
    formTitle: '5G Radio Access Network (RAN) Architecture Knowledge Check',
    formType: 'Quiz',
    username: 'dev.sharma',
    status: 'Pending',
    assignedDate: '2026-08-29 11:00',
    dueDate: '2026-09-10',
    token: 'nfb_ran5g88',
    assignedBy: 'Priya Sharma'
  },
  {
    id: 'ASG-5007',
    feedbackId: 'FID-1074',
    formId: 'form-103',
    formTitle: 'Mentorship Program Cohort 2026 Mid-Point Feedback',
    formType: 'Feedback',
    username: 'ananya.roy',
    status: 'Completed',
    assignedDate: '2026-08-25 14:00',
    completedDate: '2026-08-26 10:20',
    dueDate: '2026-09-20',
    token: 'nfb_mentor74',
    assignedBy: 'Rohan Mehta'
  },
  {
    id: 'ASG-5008',
    feedbackId: 'FID-1074',
    formId: 'form-103',
    formTitle: 'Mentorship Program Cohort 2026 Mid-Point Feedback',
    formType: 'Feedback',
    username: 'siddharth.rao',
    status: 'Pending',
    assignedDate: '2026-08-25 14:00',
    dueDate: '2026-09-20',
    token: 'nfb_mentor74',
    assignedBy: 'Rohan Mehta'
  },
  {
    id: 'ASG-5009',
    feedbackId: 'FID-1074',
    formId: 'form-103',
    formTitle: 'Mentorship Program Cohort 2026 Mid-Point Feedback',
    formType: 'Feedback',
    username: 'neha.kapoor',
    status: 'Cancelled',
    assignedDate: '2026-08-25 14:00',
    dueDate: '2026-09-20',
    token: 'nfb_mentor74',
    assignedBy: 'Rohan Mehta'
  },
  {
    id: 'ASG-5010',
    feedbackId: 'FID-1092',
    formId: 'form-101',
    formTitle: 'Q3 Enterprise Leadership & Culture Pulse Survey',
    formType: 'Survey',
    username: 'rahul.nair',
    status: 'Pending',
    assignedDate: '2026-08-30 08:45',
    dueDate: '2026-09-15',
    token: 'nfb_lead92a',
    assignedBy: 'Rajesh Sharma'
  },
  {
    id: 'ASG-5011',
    feedbackId: 'FID-1088',
    formId: 'form-102',
    formTitle: '5G Radio Access Network (RAN) Architecture Knowledge Check',
    formType: 'Quiz',
    username: 'sneha.reddy',
    status: 'Pending',
    assignedDate: '2026-08-30 15:30',
    dueDate: '2026-09-10',
    token: 'nfb_ran5g88',
    assignedBy: 'Priya Sharma'
  }
];

export const INITIAL_MOCK_RESPONSES: FormSubmissionRecord[] = [
  {
    id: 'RESP-9001',
    formId: 'form-102',
    formFid: 'FID-1088',
    formTitle: '5G Radio Access Network (RAN) Architecture Knowledge Check',
    formType: 'Quiz',
    respondentName: 'Aarav Mehta',
    respondentEmail: 'aarav.mehta@enterprise.com',
    respondentRole: 'Staff Systems Engineer',
    submittedAt: '2026-08-30T16:45:00.000Z',
    score: 100,
    totalPoints: 100,
    passed: true,
    attemptNumber: 1,
    answers: [
      {
        questionId: 'qz1',
        questionTitle: 'In a 3GPP 5G O-RAN split architecture, which functional interface connects the O-DU to the O-RU?',
        questionType: 'choice',
        value: '7-2x Open Fronthaul Interface',
        isCorrect: true,
        pointsAwarded: 25
      },
      {
        questionId: 'qz2',
        questionTitle: 'Select the primary operating spectrum range for 5G NR TDD band n78:',
        questionType: 'choice',
        value: '3.3 GHz - 3.8 GHz TDD',
        isCorrect: true,
        pointsAwarded: 25
      },
      {
        questionId: 'qz3',
        questionTitle: 'Which features are introduced in 3GPP Release 16 & 17 for enhanced URLLC?',
        questionType: 'choice',
        value: ['Mini-slot / non-slot based fast scheduling', 'Multi-TRP (Transmission/Reception Point) redundancy', 'PDCP duplication across dual active radio links'],
        isCorrect: true,
        pointsAwarded: 25
      },
      {
        questionId: 'qz4',
        questionTitle: 'Does Massive MIMO dynamic digital beamforming increase cell-edge SNR by concentrating RF energy toward active UEs?',
        questionType: 'yes_no',
        value: 'Yes / True',
        isCorrect: true,
        pointsAwarded: 25
      }
    ]
  },
  {
    id: 'RESP-9002',
    formId: 'form-102',
    formFid: 'FID-1088',
    formTitle: '5G Radio Access Network (RAN) Architecture Knowledge Check',
    formType: 'Quiz',
    respondentName: 'Priya Sharma',
    respondentEmail: 'priya.sharma@enterprise.com',
    respondentRole: 'Senior Network Architect',
    submittedAt: '2026-08-30T14:15:00.000Z',
    score: 75,
    totalPoints: 100,
    passed: false,
    attemptNumber: 1,
    answers: [
      {
        questionId: 'qz1',
        questionTitle: 'In a 3GPP 5G O-RAN split architecture, which functional interface connects the O-DU to the O-RU?',
        questionType: 'choice',
        value: '7-2x Open Fronthaul Interface',
        isCorrect: true,
        pointsAwarded: 25
      },
      {
        questionId: 'qz2',
        questionTitle: 'Select the primary operating spectrum range for 5G NR TDD band n78:',
        questionType: 'choice',
        value: '700 MHz FDD paired',
        isCorrect: false,
        pointsAwarded: 0
      },
      {
        questionId: 'qz3',
        questionTitle: 'Which features are introduced in 3GPP Release 16 & 17 for enhanced URLLC?',
        questionType: 'choice',
        value: ['Mini-slot / non-slot based fast scheduling', 'Multi-TRP (Transmission/Reception Point) redundancy', 'PDCP duplication across dual active radio links'],
        isCorrect: true,
        pointsAwarded: 25
      },
      {
        questionId: 'qz4',
        questionTitle: 'Does Massive MIMO dynamic digital beamforming increase cell-edge SNR by concentrating RF energy toward active UEs?',
        questionType: 'yes_no',
        value: 'Yes / True',
        isCorrect: true,
        pointsAwarded: 25
      }
    ]
  },
  {
    id: 'RESP-9003',
    formId: 'form-101',
    formFid: 'FID-1092',
    formTitle: 'Q3 Enterprise Leadership & Culture Pulse Survey',
    formType: 'Survey',
    respondentName: 'Ananya Roy',
    respondentEmail: 'ananya.roy@enterprise.com',
    respondentRole: 'Product Operations Lead',
    submittedAt: '2026-08-29T11:20:00.000Z',
    answers: [
      {
        questionId: 'q1',
        questionTitle: 'How clearly do you understand our strategic company priorities for H2 2026?',
        questionType: 'rating',
        value: 5
      },
      {
        questionId: 'q2',
        questionTitle: 'On a scale of 0-10, how likely are you to recommend our company as a top-tier workplace?',
        questionType: 'nps',
        value: 9
      },
      {
        questionId: 'q3',
        questionTitle: 'Which department/track are you primarily affiliated with?',
        questionType: 'choice',
        value: 'Product & Design'
      },
      {
        questionId: 'q4',
        questionTitle: 'Please rate your agreement with the following team environment statements:',
        questionType: 'likert',
        value: {
          'Our sprint goals are well-scoped and achievable.': 'Agree',
          'Cross-team dependencies are resolved without friction.': 'Neutral',
          'Continuous learning time is encouraged by my manager.': 'Strongly Agree',
          'We have the technical tools needed to succeed.': 'Strongly Agree'
        }
      },
      {
        questionId: 'q5',
        questionTitle: 'Approximately how many hours per week do you spend in synchronous meetings?',
        questionType: 'number',
        value: 12
      },
      {
        questionId: 'q6',
        questionTitle: 'What is one concrete initiative leadership could take to remove impediments in your daily workflow?',
        questionType: 'long_text',
        value: 'Establish a dedicated "No-Meeting Focus Block" on Wednesday mornings company-wide so product and engineering teams can work uninterrupted on deep architecture.'
      }
    ]
  },
  {
    id: 'RESP-9004',
    formId: 'form-103',
    formFid: 'FID-1074',
    formTitle: 'Mentorship Program Cohort 2026 Mid-Point Feedback',
    formType: 'Feedback',
    respondentName: 'Vikram Verma',
    respondentEmail: 'vikram.v@enterprise.com',
    respondentRole: 'DevOps Specialist',
    submittedAt: '2026-08-28T17:10:00.000Z',
    answers: [
      {
        questionId: 'mf1',
        questionTitle: 'How satisfied are you with the cadence and depth of your 1-on-1 mentoring sessions?',
        questionType: 'rating',
        value: 9
      },
      {
        questionId: 'mf2',
        questionTitle: 'Have your defined Action Items and Milestone Goals progressed as planned?',
        questionType: 'yes_no',
        value: 'Yes'
      },
      {
        questionId: 'mf3',
        questionTitle: 'Which developmental areas have received the most focused mentorship discussions?',
        questionType: 'choice',
        value: ['System Architecture & High-Scale Design', 'Executive Communication & Stakeholder Influence']
      },
      {
        questionId: 'mf4',
        questionTitle: 'Share any specific breakthroughs or constructive feedback regarding program administration:',
        questionType: 'long_text',
        value: 'My mentor provided excellent code review guidance for distributed microservices. Would love to have session transcripts automated.'
      }
    ]
  },
  {
    id: 'RESP-9005',
    formId: 'form-101',
    formFid: 'FID-1092',
    formTitle: 'Q3 Enterprise Leadership & Culture Pulse Survey',
    formType: 'Survey',
    respondentName: 'Anonymous Respondent',
    respondentEmail: 'anonymous@learner.org',
    respondentRole: 'Full Stack Engineer',
    submittedAt: '2026-08-27T09:40:00.000Z',
    answers: [
      {
        questionId: 'q1',
        questionTitle: 'How clearly do you understand our strategic company priorities for H2 2026?',
        questionType: 'rating',
        value: 4
      },
      {
        questionId: 'q2',
        questionTitle: 'On a scale of 0-10, how likely are you to recommend our company as a top-tier workplace?',
        questionType: 'nps',
        value: 8
      },
      {
        questionId: 'q3',
        questionTitle: 'Which department/track are you primarily affiliated with?',
        questionType: 'choice',
        value: 'Engineering & DevOps'
      },
      {
        questionId: 'q4',
        questionTitle: 'Please rate your agreement with the following team environment statements:',
        questionType: 'likert',
        value: {
          'Our sprint goals are well-scoped and achievable.': 'Neutral',
          'Cross-team dependencies are resolved without friction.': 'Disagree',
          'Continuous learning time is encouraged by my manager.': 'Agree',
          'We have the technical tools needed to succeed.': 'Agree'
        }
      },
      {
        questionId: 'q5',
        questionTitle: 'Approximately how many hours per week do you spend in synchronous meetings?',
        questionType: 'number',
        value: 18
      },
      {
        questionId: 'q6',
        questionTitle: 'What is one concrete initiative leadership could take to remove impediments in your daily workflow?',
        questionType: 'long_text',
        value: 'Streamline CI/CD pipeline deployment approvals for staging environments.'
      }
    ]
  }
];

// ----------------------------------------------------
// ASSIGNMENTS STORAGE
// ----------------------------------------------------

export const getStoredAssignments = (): FeedbackAssignment[] => {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ASSIGNMENTS));
      return INITIAL_MOCK_ASSIGNMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error parsing stored assignments:', e);
    return INITIAL_MOCK_ASSIGNMENTS;
  }
};

export const saveStoredAssignments = (assignments: FeedbackAssignment[]): void => {
  try {
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
  } catch (e) {
    console.error('Error saving assignments:', e);
  }
};

export const createAssignments = (
  newAssignments: Array<{
    feedbackId: string;
    username: string;
    formId: string;
    formTitle: string;
    formType: any;
    token: string;
    dueDate?: string;
  }>
): FeedbackAssignment[] => {
  const current = getStoredAssignments();
  const created: FeedbackAssignment[] = [];
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

  newAssignments.forEach((item, idx) => {
    const asgId = `ASG-${5100 + current.length + idx}`;
    const asg: FeedbackAssignment = {
      id: asgId,
      feedbackId: item.feedbackId,
      formId: item.formId,
      formTitle: item.formTitle,
      formType: item.formType,
      username: item.username,
      status: 'Pending',
      assignedDate: nowStr,
      dueDate: item.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      token: item.token,
      assignedBy: 'System Administrator'
    };
    created.push(asg);
  });

  const updated = [...created, ...current];
  saveStoredAssignments(updated);
  return created;
};

export const deleteAssignment = (id: string): boolean => {
  const current = getStoredAssignments();
  const filtered = current.filter(a => a.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredAssignments(filtered);
  return true;
};

export const deletePendingAssignments = (ids?: string[]): number => {
  const current = getStoredAssignments();
  let remaining: FeedbackAssignment[];
  let removedCount = 0;

  if (ids && ids.length > 0) {
    const idSet = new Set(ids);
    remaining = current.filter(a => {
      if (idSet.has(a.id) && a.status === 'Pending') {
        removedCount++;
        return false;
      }
      return true;
    });
  } else {
    // Delete all pending
    remaining = current.filter(a => {
      if (a.status === 'Pending') {
        removedCount++;
        return false;
      }
      return true;
    });
  }

  saveStoredAssignments(remaining);
  return removedCount;
};

export const updateAssignmentStatus = (id: string, status: AssignmentStatus): FeedbackAssignment | undefined => {
  const current = getStoredAssignments();
  const index = current.findIndex(a => a.id === id);
  if (index === -1) return undefined;

  const updated = {
    ...current[index],
    status,
    completedDate: status === 'Completed' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : current[index].completedDate
  };
  current[index] = updated;
  saveStoredAssignments(current);
  return updated;
};

// ----------------------------------------------------
// RESPONSES STORAGE
// ----------------------------------------------------

export const getStoredResponses = (): FormSubmissionRecord[] => {
  try {
    const raw = localStorage.getItem(RESPONSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RESPONSES_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_RESPONSES));
      return INITIAL_MOCK_RESPONSES;
    }
    const parsed: FormSubmissionRecord[] = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.error('Error parsing stored responses:', e);
    return INITIAL_MOCK_RESPONSES;
  }
};

export const saveStoredResponses = (responses: FormSubmissionRecord[]): void => {
  try {
    localStorage.setItem(RESPONSES_STORAGE_KEY, JSON.stringify(responses));
  } catch (e) {
    console.error('Error saving responses:', e);
  }
};

export const deleteResponse = (responseId: string): boolean => {
  const responses = getStoredResponses();
  const target = responses.find(r => r.id === responseId);
  if (!target) return false;

  const filtered = responses.filter(r => r.id !== responseId);
  saveStoredResponses(filtered);

  // Decrement responseCount in form
  if (target.formId) {
    const forms = getStoredForms();
    const form = forms.find(f => f.id === target.formId);
    if (form && form.responseCount > 0) {
      form.responseCount -= 1;
      if (form.responses) {
        form.responses = form.responses.filter(r => r.id !== responseId);
      }
      saveStoredForms(forms);
    }
  }

  return true;
};

export const bulkDeleteResponses = (responseIds: string[]): number => {
  const responses = getStoredResponses();
  const idSet = new Set(responseIds);
  const targets = responses.filter(r => idSet.has(r.id));
  if (targets.length === 0) return 0;

  const remaining = responses.filter(r => !idSet.has(r.id));
  saveStoredResponses(remaining);

  // Adjust form response counts
  const forms = getStoredForms();
  let formsChanged = false;
  targets.forEach(t => {
    const form = forms.find(f => f.id === t.formId);
    if (form && form.responseCount > 0) {
      form.responseCount = Math.max(0, form.responseCount - 1);
      if (form.responses) {
        form.responses = form.responses.filter(r => !idSet.has(r.id));
      }
      formsChanged = true;
    }
  });

  if (formsChanged) {
    saveStoredForms(forms);
  }

  return targets.length;
};

export const simulateIncomingResponse = (formId?: string): FormSubmissionRecord => {
  const forms = getStoredForms();
  const targetForm = formId ? forms.find(f => f.id === formId) || forms[0] : forms[Math.floor(Math.random() * forms.length)];
  
  const sampleUsers = [
    { name: 'Sameer Sen', email: 'sameer.sen@enterprise.com', role: 'Staff Site Reliability Engineer' },
    { name: 'Kavita Patel', email: 'kavita.p@enterprise.com', role: 'Senior UX Architect' },
    { name: 'Dev Sharma', email: 'dev.sharma@enterprise.com', role: 'Backend Tech Lead' },
    { name: 'Priya Iyer', email: 'priya.iyer@enterprise.com', role: 'Product Operations Analyst' },
    { name: 'Aakash Verma', email: 'aakash.v@enterprise.com', role: 'Security Compliance Engineer' }
  ];

  const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
  const isQuiz = targetForm.type === 'Quiz';
  const totalQuestions = targetForm.questions.length || 1;
  const correctCount = isQuiz ? Math.floor(Math.random() * (totalQuestions + 1)) : 0;
  const score = isQuiz ? Math.round((correctCount / totalQuestions) * 100) : undefined;
  const passed = isQuiz ? (score! >= (targetForm.settings.passPercentage || 75)) : undefined;

  const answers: FormResponseItem[] = targetForm.questions.map((q, qIdx) => {
    if (q.type === 'rating') {
      return {
        questionId: q.id,
        questionTitle: q.title,
        questionType: q.type,
        value: Math.floor(Math.random() * (q.ratingLevels || 5)) + 1
      };
    }
    if (q.type === 'nps') {
      return {
        questionId: q.id,
        questionTitle: q.title,
        questionType: q.type,
        value: [7, 8, 9, 10, 10, 9][Math.floor(Math.random() * 6)]
      };
    }
    if (q.type === 'number') {
      return {
        questionId: q.id,
        questionTitle: q.title,
        questionType: q.type,
        value: Math.floor(Math.random() * 20) + 5
      };
    }
    if (q.type === 'likert') {
      const likertObj: Record<string, string> = {};
      const options = q.likertOptions || ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
      (q.likertStatements || ['Core objective clarity', 'Cross-team synergy']).forEach(s => {
        likertObj[s] = options[Math.floor(Math.random() * options.length)];
      });
      return {
        questionId: q.id,
        questionTitle: q.title,
        questionType: q.type,
        value: likertObj
      };
    }
    if (q.type === 'long_text' || q.type === 'short_text') {
      const texts = [
        'The hands-on lab sessions were clear and high-value.',
        'Great organization, would love more deep-dive examples in the next module.',
        'Immediate application to our current production deployment.',
        'Thorough documentation and clear step-by-step guidance.'
      ];
      return {
        questionId: q.id,
        questionTitle: q.title,
        questionType: q.type,
        value: texts[Math.floor(Math.random() * texts.length)]
      };
    }
    // Choice / YesNo
    const isThisCorrect = isQuiz ? qIdx < correctCount : true;
    const selectedText = q.options && q.options.length > 0
      ? (isThisCorrect && q.correctOptionId ? q.options.find(o => o.id === q.correctOptionId)?.text || q.options[0].text : q.options[0].text)
      : 'Option A';

    return {
      questionId: q.id,
      questionTitle: q.title,
      questionType: q.type,
      value: selectedText,
      isCorrect: isQuiz ? isThisCorrect : undefined,
      pointsAwarded: isQuiz && isThisCorrect ? (q.points || 10) : 0
    };
  });

  const newRecord: FormSubmissionRecord = {
    id: `RESP-${Date.now().toString().slice(-4)}`,
    formId: targetForm.id,
    formFid: targetForm.fid,
    formTitle: targetForm.title,
    formType: targetForm.type,
    respondentName: user.name,
    respondentEmail: user.email,
    respondentRole: user.role,
    submittedAt: new Date().toISOString(),
    score,
    totalPoints: isQuiz ? 100 : undefined,
    passed,
    attemptNumber: 1,
    answers
  };

  const existingResponses = getStoredResponses();
  const updatedResponses = [newRecord, ...existingResponses];
  saveStoredResponses(updatedResponses);

  // Update form count
  targetForm.responseCount = (targetForm.responseCount || 0) + 1;
  if (!targetForm.responses) targetForm.responses = [];
  targetForm.responses.unshift(newRecord);
  saveStoredForms(forms);

  // Check if there is a pending assignment for this user & FID to mark completed
  const assignments = getStoredAssignments();
  const asgIdx = assignments.findIndex(
    a => a.formId === targetForm.id && (a.username === user.email || a.username === user.name.toLowerCase().replace(' ', '.')) && a.status === 'Pending'
  );
  if (asgIdx !== -1) {
    assignments[asgIdx].status = 'Completed';
    assignments[asgIdx].completedDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
    saveStoredAssignments(assignments);
  }

  return newRecord;
};

export const recordFormSubmission = (
  token: string,
  submission: {
    respondentName?: string;
    respondentEmail?: string;
    respondentRole?: string;
    score?: number;
    totalPoints?: number;
    passed?: boolean;
    attemptNumber?: number;
    answers: FormResponseItem[];
  }
): FormSubmissionRecord | null => {
  const forms = getStoredForms();
  const form = forms.find(f => f.token === token);
  if (!form) return null;

  const newRecord: FormSubmissionRecord = {
    id: `RESP-${Date.now().toString().slice(-4)}`,
    formId: form.id,
    formFid: form.fid,
    formTitle: form.title,
    formType: form.type,
    respondentName: submission.respondentName || 'Anonymous',
    respondentEmail: submission.respondentEmail,
    respondentRole: submission.respondentRole,
    submittedAt: new Date().toISOString(),
    score: submission.score,
    totalPoints: submission.totalPoints,
    passed: submission.passed,
    attemptNumber: submission.attemptNumber || 1,
    answers: submission.answers
  };

  const existingResponses = getStoredResponses();
  const updatedResponses = [newRecord, ...existingResponses];
  saveStoredResponses(updatedResponses);

  // Update form counter
  form.responseCount = (form.responseCount || 0) + 1;
  if (!form.responses) form.responses = [];
  form.responses.unshift(newRecord);
  saveStoredForms(forms);

  // Mark pending assignment completed if matched
  if (submission.respondentEmail || submission.respondentName) {
    const userIdentifier = (submission.respondentEmail || submission.respondentName || '').toLowerCase().trim();
    const assignments = getStoredAssignments();
    const asgIdx = assignments.findIndex(
      a => (a.formId === form.id || a.feedbackId === form.fid) && 
           (a.username.toLowerCase() === userIdentifier || userIdentifier.includes(a.username.toLowerCase())) &&
           a.status === 'Pending'
    );
    if (asgIdx !== -1) {
      assignments[asgIdx].status = 'Completed';
      assignments[asgIdx].completedDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
      saveStoredAssignments(assignments);
    }
  }

  return newRecord;
};

// ----------------------------------------------------
// CSV PARSING, VALIDATION & EXPORT UTILITIES
// ----------------------------------------------------

export const validateAssignmentCSV = (
  csvContent: string,
  forms: LMSForm[],
  existingAssignments: FeedbackAssignment[]
): CSVValidationSummary => {
  const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  if (lines.length === 0) {
    return {
      totalRows: 0,
      validRows: 0,
      errorRows: 0,
      duplicateRows: 0,
      results: []
    };
  }

  // Detect header
  const headerLine = lines[0].toLowerCase();
  const hasFeedbackIdCol = headerLine.includes('feedbackid') || headerLine.includes('feedback_id') || headerLine.includes('fid') || headerLine.includes('formid');
  const hasUsernameCol = headerLine.includes('username') || headerLine.includes('user_name') || headerLine.includes('user') || headerLine.includes('email');

  let dataLines = lines;
  let hasHeader = false;

  if (hasFeedbackIdCol && hasUsernameCol) {
    hasHeader = true;
    dataLines = lines.slice(1);
  }

  const results: CSVValidationRowResult[] = [];
  const maxRowsLimit = 2000;
  const processedPairs = new Set<string>();
  let duplicateCount = 0;

  // Build fast form lookup map by FID or Form ID
  const formMap = new Map<string, LMSForm>();
  forms.forEach(f => {
    formMap.set(f.fid.trim().toUpperCase(), f);
    formMap.set(f.id.trim().toUpperCase(), f);
  });

  // Build existing pending assignment set
  const existingPendingSet = new Set<string>();
  existingAssignments.forEach(a => {
    if (a.status === 'Pending') {
      existingPendingSet.add(`${a.feedbackId.toUpperCase()}|${a.username.toLowerCase()}`);
    }
  });

  const linesToProcess = dataLines.slice(0, maxRowsLimit);

  linesToProcess.forEach((line, index) => {
    const rowNumber = hasHeader ? index + 2 : index + 1;
    const errors: string[] = [];

    // Parse columns (handling comma, tab or semicolon)
    let parts: string[] = [];
    if (line.includes(',')) {
      parts = line.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    } else if (line.includes('\t')) {
      parts = line.split('\t').map(s => s.trim().replace(/^["']|["']$/g, ''));
    } else if (line.includes(';')) {
      parts = line.split(';').map(s => s.trim().replace(/^["']|["']$/g, ''));
    } else {
      parts = [line.trim()];
    }

    const rawFid = (parts[0] || '').trim();
    const rawUsername = (parts[1] || '').trim();

    // 1. Check empty columns
    if (!rawFid) {
      errors.push('FeedbackID (FID) column is missing or blank');
    }
    if (!rawUsername) {
      errors.push('Username column is missing or blank');
    }

    // 2. Validate FeedbackID existence
    let matchedForm: LMSForm | undefined;
    if (rawFid) {
      matchedForm = formMap.get(rawFid.toUpperCase());
      if (!matchedForm) {
        errors.push(`FeedbackID "${rawFid}" does not match any existing LMS form or survey in the directory`);
      }
    }

    // 3. Validate username format
    if (rawUsername) {
      // Username validation: alphanumeric with dots, underscores, hyphens or email format (length 2-80)
      const usernameRegex = /^[a-zA-Z0-9._%+-]+(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?$/;
      if (rawUsername.length < 2 || rawUsername.length > 80) {
        errors.push(`Username length (${rawUsername.length}) must be between 2 and 80 characters`);
      } else if (!usernameRegex.test(rawUsername)) {
        errors.push(`Username "${rawUsername}" contains invalid characters (allowed: a-z, 0-9, ., _, -, @)`);
      }
    }

    // 4. Check duplicate within file
    const pairKey = `${rawFid.toUpperCase()}|${rawUsername.toLowerCase()}`;
    if (rawFid && rawUsername && processedPairs.has(pairKey)) {
      errors.push(`Duplicate row in CSV file for user "${rawUsername}" with FeedbackID "${rawFid}"`);
      duplicateCount++;
    } else if (rawFid && rawUsername) {
      processedPairs.add(pairKey);
    }

    // 5. Warning / Note if already has pending assignment
    if (rawFid && rawUsername && existingPendingSet.has(pairKey)) {
      errors.push(`User "${rawUsername}" already has an active pending assignment for "${rawFid}"`);
    }

    const isValid = errors.length === 0;

    results.push({
      rowNumber,
      feedbackId: rawFid,
      username: rawUsername,
      matchedForm,
      isValid,
      errors
    });
  });

  // Check if file exceeded 2000 rows
  if (dataLines.length > maxRowsLimit) {
    results.push({
      rowNumber: maxRowsLimit + 1,
      feedbackId: 'LIMIT_EXCEEDED',
      username: 'SYSTEM',
      isValid: false,
      errors: [`File contains ${dataLines.length} rows. Maximum allowed per batch is 2,000 rows. Excess rows were truncated.`]
    });
  }

  const validRows = results.filter(r => r.isValid).length;
  const errorRows = results.filter(r => !r.isValid).length;

  return {
    totalRows: dataLines.length,
    validRows,
    errorRows,
    duplicateRows: duplicateCount,
    results
  };
};

export const generateSampleCSV = (forms: LMSForm[]): string => {
  const publishedForms = forms.filter(f => f.status === 'Published');
  const fid1 = publishedForms[0]?.fid || 'FID-1092';
  const fid2 = publishedForms[1]?.fid || 'FID-1088';
  const fid3 = publishedForms[2]?.fid || 'FID-1074';

  const rows = [
    'FeedbackID,username',
    `${fid1},alex.chen`,
    `${fid1},priya.sharma@enterprise.com`,
    `${fid1},vikram.verma`,
    `${fid2},aarav.mehta`,
    `${fid2},kavita.patel@enterprise.com`,
    `${fid2},dev.sharma`,
    `${fid3},ananya.roy`,
    `${fid3},siddharth.rao@enterprise.com`,
    `${fid3},rahul.nair`,
    `${fid1},sneha.reddy`
  ];

  return rows.join('\n');
};

export const exportResponsesToCSV = (responses: FormSubmissionRecord[], forms: LMSForm[]): string => {
  const header = [
    'Submission ID',
    'Feedback ID',
    'Form Title',
    'Form Type',
    'Respondent Name',
    'Respondent Email',
    'Respondent Role',
    'Submitted At',
    'Score (%)',
    'Total Points',
    'Passing Status',
    'Attempt Number',
    'Answers Summary'
  ];

  const rows = responses.map(r => {
    const matchedForm = forms.find(f => f.id === r.formId);
    const fid = r.formFid || matchedForm?.fid || 'N/A';
    const title = r.formTitle || matchedForm?.title || 'Form Assessment';
    const type = r.formType || matchedForm?.type || 'Survey';
    const passedStr = r.passed !== undefined ? (r.passed ? 'PASSED' : 'FAILED') : 'N/A';
    const scoreStr = r.score !== undefined ? `${r.score}%` : 'N/A';

    const answersSummary = (r.answers || []).map(a => {
      let valStr = '';
      if (typeof a.value === 'object' && a.value !== null) {
        valStr = JSON.stringify(a.value).replace(/"/g, "'");
      } else {
        valStr = String(a.value || '');
      }
      return `[${a.questionTitle}: ${valStr}]`;
    }).join('; ');

    return [
      `"${r.id}"`,
      `"${fid}"`,
      `"${title.replace(/"/g, '""')}"`,
      `"${type}"`,
      `"${(r.respondentName || 'Anonymous').replace(/"/g, '""')}"`,
      `"${(r.respondentEmail || 'N/A').replace(/"/g, '""')}"`,
      `"${(r.respondentRole || 'N/A').replace(/"/g, '""')}"`,
      `"${r.submittedAt}"`,
      `"${scoreStr}"`,
      `"${r.totalPoints || 'N/A'}"`,
      `"${passedStr}"`,
      `"${r.attemptNumber || 1}"`,
      `"${answersSummary.replace(/"/g, '""')}"`
    ].join(',');
  });

  return [header.join(','), ...rows].join('\n');
};

export const downloadBlobFile = (content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;'): void => {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


