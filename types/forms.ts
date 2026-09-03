// types/forms.ts

export type FormType = 'Survey' | 'Feedback' | 'Quiz';

export type FormStatus = 'Draft' | 'Published' | 'Archived' | 'Closed';

export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'rating'
  | 'nps'
  | 'short_text'
  | 'long_text'
  | 'yes_no'
  | 'number'
  | 'likert'
  | 'choice'
  | 'text';

export interface QuestionOption {
  id: string;
  text: string;
}

export type BranchTargetAction = 'next' | 'end' | 'question' | 'section';

export interface BranchingRule {
  optionId: string; // The choice option ID triggering this jump
  targetAction: BranchTargetAction; // 'next' (default flow), 'end' (jump to submit/end), 'question' (jump to specific forward question), 'section' (jump to forward section)
  targetId?: string; // target question ID or section ID
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
}

export interface NumberValidationConfig {
  min?: number;
  max?: number;
  step?: number;
  allowDecimals?: boolean;
  unit?: string;
  placeholder?: string;
}

export interface RatingConfig {
  levels: number; // e.g. 3, 5, 7, 10
  icon: 'star' | 'heart' | 'thumb' | 'number';
  labels?: {
    min: string;
    mid?: string;
    max: string;
  };
}

export interface FormQuestion {
  id: string;
  title: string;
  subtitle?: string; // Subtitle / Question description / Helper text
  description?: string; // alias for subtitle
  type: QuestionType;
  required: boolean;
  sectionId?: string; // Associated section
  order?: number;

  // Choice settings (Single / Multiple / Dropdown / Shuffle / Other)
  choiceDisplay?: 'radio' | 'checkbox' | 'dropdown';
  multipleAnswers?: boolean;
  shuffleOptions?: boolean;
  allowOther?: boolean;
  otherOptionText?: string;
  options?: QuestionOption[];

  // Quiz assessment
  correctOptionId?: string; // For Quiz single choice or dropdown
  correctOptionIds?: string[]; // For Quiz multi choice
  points?: number; // For Quiz scoring (default 10)
  correctExplanation?: string; // Feedback displayed on review

  // Rating question
  minRating?: number;
  maxRating?: number;
  ratingLevels?: number; // 3, 5, 7, 10
  ratingIcon?: 'star' | 'heart' | 'thumb' | 'number';
  ratingLabels?: {
    min: string;
    mid?: string;
    max: string;
  };

  // Number question
  numberValidation?: NumberValidationConfig;

  // Likert Matrix question
  likertStatements?: string[]; // Rows (e.g. ["Clear documentation", "Effective pace", "Practical lab relevance"])
  likertOptions?: string[]; // Columns (e.g. ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"])

  // Forward-only branching
  branchingRules?: BranchingRule[];

  // Text validation & character limits
  maxLength?: number;
  minLength?: number;
  characterLimit?: number;
  showCharCount?: boolean;
}

export interface FormSettings {
  acceptResponses: boolean; // Accept Responses toggle
  startDate?: string | null; // "YYYY-MM-DD"
  startTime?: string | null; // "HH:mm"
  endDate?: string | null; // "YYYY-MM-DD" or null
  endTime?: string | null; // "HH:mm"
  oneResponsePerRespondent?: boolean; // One response per respondent enforcement
  maxSubmissions?: number | null; // Maximum allowed submissions across all learners
  showProgressIndicator?: boolean; // Progress indicator visibility

  // General & Privacy
  allowAnonymous: boolean;
  requireLogin: boolean;
  shuffleQuestions: boolean;

  // Quiz Specific
  timeLimitMinutes?: number | null; // For Quiz
  passPercentage?: number; // Passing Score (e.g. 75%)
  showScoreImmediately?: boolean; // Show Score toggle
  showScoreAfterSubmission?: boolean; // Alias for showScoreImmediately
  allowRetakeAfterFailure?: boolean; // Retake after Failure toggle
  maxRetakeAttempts?: number; // Max retakes allowed (default: 3)

  multipleSubmissions?: boolean;
  thankYouMessage?: string;
  closedMessage?: string;
  redirectUrl?: string;
}

export interface FormResponseItem {
  questionId: string;
  questionTitle: string;
  questionType: QuestionType;
  value: any; // string | string[] | number | Record<string, string> (for Likert)
  otherValue?: string; // if respondent chose "Other" and wrote text
  isCorrect?: boolean;
  pointsAwarded?: number;
}

export interface FormSubmissionRecord {
  id: string;
  formId: string;
  formFid?: string;
  formTitle?: string;
  formType?: FormType;
  respondentName?: string;
  respondentEmail?: string;
  respondentRole?: string;
  submittedAt: string;
  score?: number;
  totalPoints?: number;
  passed?: boolean;
  attemptNumber?: number;
  answers: FormResponseItem[];
}

export type AssignmentStatus = 'Pending' | 'Completed' | 'Expired' | 'Cancelled';

export interface FeedbackAssignment {
  id: string; // e.g. "ASG-1001"
  feedbackId: string; // e.g. "FID-1092"
  formId: string;
  formTitle: string;
  formType: FormType;
  username: string; // e.g. "alex.chen" or "alex.chen@enterprise.com"
  status: AssignmentStatus;
  assignedDate: string; // "YYYY-MM-DD HH:mm"
  dueDate?: string; // "YYYY-MM-DD"
  completedDate?: string; // "YYYY-MM-DD HH:mm"
  token: string;
  assignedBy?: string;
}

export interface CSVValidationRowResult {
  rowNumber: number;
  feedbackId: string;
  username: string;
  matchedForm?: LMSForm;
  isValid: boolean;
  errors: string[];
}

export interface CSVValidationSummary {
  totalRows: number;
  validRows: number;
  errorRows: number;
  duplicateRows: number;
  results: CSVValidationRowResult[];
}

export interface LMSForm {
  id: string;
  fid: string; // e.g. "FID-1042"
  title: string;
  description: string;
  type: FormType;
  status: FormStatus;
  responseCount: number;
  createdDate: string; // "YYYY-MM-DD"
  endDate: string | null; // "YYYY-MM-DD" or null
  token: string; // e.g. "nfb_8f93a1c2"
  targetAudience: string;
  category: string;
  creatorName: string;
  creatorAvatar?: string;
  sections?: FormSection[]; // Form Sections
  settings: FormSettings;
  questions: FormQuestion[];
  responses?: FormSubmissionRecord[];
  updatedAt?: string;
}


