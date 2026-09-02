import * as v from 'valibot';

export const QuestionTypeSchema = v.picklist(['text', 'multiple-choice']);

export const QuestionInputSchema = v.object({
  id: v.pipe(v.string(), v.nonEmpty()),
  type: QuestionTypeSchema,
  label: v.pipe(
    v.string('Question label must be a string'),
    v.trim(),
    v.nonEmpty('Question label is required')
  ),
  options: v.optional(v.array(v.string())),
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
  status: v.optional(v.picklist(['draft', 'published', 'archived'])),
});

export type SaveFormInput = v.InferInput<typeof SaveFormSchema>;

export const SubmitResponseSchema = v.object({
  formId: v.pipe(v.string(), v.nonEmpty()),
  answers: v.record(v.string(), v.string()),
});

export type SubmitResponseInput = v.InferInput<typeof SubmitResponseSchema>;
