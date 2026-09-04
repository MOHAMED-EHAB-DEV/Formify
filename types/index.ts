export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code?: 'UNAUTHORIZED' | 'NOT_FOUND' | 'VALIDATION' | 'INTERNAL' | 'CONFLICT' };

export type AuthProvider = 'google' | 'github' | 'credentials';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  provider: AuthProvider;
  createdAt: Date;
  verified: boolean;
}

export type QuestionType =
  | 'text'
  | 'paragraph'
  | 'multiple-choice'
  | 'checkbox'
  | 'dropdown'
  | 'rating'
  | 'ranking'
  | 'file-upload'
  | 'number'
  | 'date'
  | 'email';

export type RatingStyle = 'stars' | 'linear-scale';

export interface FileAnswer {
  url: string;
  name: string;
  size?: number;
  type?: string;
  key?: string;
}

export type AnswerValue = string | number | string[] | FileAnswer;

export interface QuestionInput {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  ratingStyle?: RatingStyle;
  ratingMax?: number;
  ratingMinLabel?: string;
  ratingMaxLabel?: string;
  maxFileSizeMb?: number;
  allowedFileTypes?: string[];
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  ratingStyle?: RatingStyle;
  ratingMax?: number;
  ratingMinLabel?: string;
  ratingMaxLabel?: string;
  maxFileSizeMb?: number;
  allowedFileTypes?: string[];
}

export interface Answer {
  questionId: string;
  answer: AnswerValue;
}

export interface FormResponse {
  id: string;
  formId: string;
  submittedAt: Date | string;
  answers: Answer[];
  respondentId?: string;
}

export const FORM_STATUS = {
  Draft: 'draft',
  Published: 'published',
  Archived: 'archived',
} as const;

export type FormStatus = typeof FORM_STATUS[keyof typeof FORM_STATUS];

export interface Form {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  responses?: FormResponse[];
  responsesCount: number;
  closeDate?: Date | string | null;
  creatorId: string;
  status: FormStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FormSummary {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  responsesCount: number;
  questionsCount?: number;
  closeDate?: Date | string | null;
  creatorId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export const EVENT_TYPE = {
  FormCreated: 'form_created',
  FormUpdated: 'form_updated',
  FormSubmitted: 'form_submitted',
  FormDeleted: 'form_deleted',
  ResponsesPurged: 'responses_purged',
} as const;

export type EventType = typeof EVENT_TYPE[keyof typeof EVENT_TYPE];

export interface AppEvent {
  id: string;
  type: EventType;
  formId: string;
  formTitle: string;
  userId: string | { name: string; email: string };
  metadata?: Record<string, unknown>;
  timestamp: Date | string;
}

