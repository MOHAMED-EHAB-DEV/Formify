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

export type QuestionType = 'text' | 'multiple-choice';

export interface QuestionInput {
  id: string;
  type: QuestionType;
  label: string;
  options?: string[];
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  options?: string[];
}

export interface Answer {
  questionId: string;
  answer: string;
}

export interface FormResponse {
  id: string;
  submittedAt: Date | string;
  answers: Answer[];
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
  responses: FormResponse[];
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
  creatorId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export const EVENT_TYPE = {
  FormCreated: 'form_created',
  FormUpdated: 'form_updated',
  FormSubmitted: 'form_submitted',
  FormDeleted: 'form_deleted',
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
