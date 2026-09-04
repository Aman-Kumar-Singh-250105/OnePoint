export type Role = 'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_EMPLOYEE';
export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'EXPIRED';
export type DistributionType = 'PUBLIC_LINK' | 'QR_CODE' | 'INTERNAL_EMPLOYEE';
export type QuestionType = 'TEXT' | 'MULTILINE_TEXT' | 'EMAIL' | 'NUMBER' | 'DATE' | 'TIME' | 'DROPDOWN' | 'CHECKBOX' | 'RADIO' | 'RATING' | 'FILE_UPLOAD';

export interface User {
  employeeId: string;
  email: string;
  fullName: string;
  department?: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  employeeId: string;
  email: string;
  fullName: string;
  department?: string;
  role: Role;
}

export interface QuestionOption {
  id?: number;
  optionLabel: string;
  optionValue: string;
  orderIndex: number;
}

export interface Question {
  id?: number;
  questionText: string;
  helpText?: string;
  questionType: QuestionType;
  required: boolean;
  orderIndex: number;
  minRating?: number;
  maxRating?: number;
  validationRegex?: string;
  options: QuestionOption[];
}

export interface FormSection {
  id?: number;
  sectionTitle: string;
  sectionDescription?: string;
  orderIndex: number;
  questions: Question[];
}

export interface Form {
  id?: number;
  title: string;
  description?: string;
  status: FormStatus;
  distributionType: DistributionType;
  allowAnonymous: boolean;
  responseLimit?: number;
  currentResponseCount?: number;
  startDate?: string;
  expiryDate?: string;
  shareToken?: string;
  createdByEmployeeId?: string;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
  sections: FormSection[];
}

export interface Answer {
  id?: number;
  questionId: number;
  questionText?: string;
  answerValue: string;
}

export interface FormSubmission {
  id?: number;
  formId: number;
  formTitle?: string;
  submissionToken?: string;
  isDraft: boolean;
  sendResponseCopy?: boolean;
  isAnonymous?: boolean;
  employeeId?: string;
  respondentName?: string;
  respondentEmail?: string;
  submittedAt?: string;
  answers: Answer[];
}

export interface RuleGenerationResponse {
  prompt: string;
  matchedCategory: string;
  generatedForm: Form;
  explanation: string;
}

export interface FormTemplate {
  id: number;
  category: string;
  title: string;
  description: string;
  templateJson: string;
  iconName?: string;
}

export interface DashboardMetrics {
  totalForms: number;
  activeForms: number;
  archivedForms: number;
  totalResponses: number;
  recentForms: Form[];
}

export interface QuestionAnalytics {
  questionId: number;
  questionText: string;
  questionType: string;
  averageRating?: number;
  optionCounts?: { [key: string]: number };
  textAnswers?: string[];
}

export interface FormAnalytics {
  formId: number;
  formTitle: string;
  totalSubmissions: number;
  dailySubmissions: number;
  weeklySubmissions: number;
  monthlySubmissions: number;
  completionRate: number;
  questionAnalyticsList: QuestionAnalytics[];
  timelineData: { [key: string]: number };
}
