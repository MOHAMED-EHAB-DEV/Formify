import * as v from 'valibot';

export const QuestionTypeSchema = v.picklist([
  'text',
  'paragraph',
  'multiple-choice',
  'checkbox',
  'dropdown',
  'rating',
  'ranking',
  'file-upload',
  'number',
  'date',
  'email',
]);

export const QuestionInputSchema = v.object({
  id: v.pipe(v.string(), v.nonEmpty()),
  type: QuestionTypeSchema,
  label: v.pipe(
    v.string('Question label must be a string'),
    v.trim(),
    v.nonEmpty('Question label is required')
  ),
  description: v.optional(v.string()),
  required: v.optional(v.boolean()),
  placeholder: v.optional(v.string()),
  options: v.optional(v.array(v.string())),
  ratingStyle: v.optional(v.picklist(['stars', 'linear-scale'])),
  ratingMax: v.optional(v.number()),
  ratingMinLabel: v.optional(v.string()),
  ratingMaxLabel: v.optional(v.string()),
  maxFileSizeMb: v.optional(v.number()),
  allowedFileTypes: v.optional(v.array(v.string())),
});

export const SaveFormSchema = v.object({
  formId: v.optional(v.string()),
  title: v.pipe(
    v.string('Title must be a string'),
    v.trim(),
    v.nonEmpty('Form title is required'),
    v.maxLength(200, 'Title cannot exceed 200 characters')
  ),
  description: v.optional(v.string()),
  questions: v.pipe(
    v.array(QuestionInputSchema),
    v.minLength(1, 'Please add at least one question to your form')
  ),
  closeDate: v.optional(v.nullable(v.string())),
  status: v.optional(v.picklist(['draft', 'published', 'archived'])),
});

export type SaveFormInput = v.InferInput<typeof SaveFormSchema>;

export const SubmitResponseSchema = v.object({
  formId: v.pipe(v.string(), v.nonEmpty()),
  answers: v.record(v.string(), v.unknown()),
});

export type SubmitResponseInput = v.InferInput<typeof SubmitResponseSchema>;

