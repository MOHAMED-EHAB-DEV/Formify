'use server';

import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import * as v from 'valibot';
import { connectToDatabase } from '@/lib/database';
import FormModel from '@/models/form.model';
import FormResponseModel from '@/models/response.model';
import { getSession } from '@/lib/session';
import { createEvent } from '@/actions/events';
import { SaveFormSchema, type SaveFormInput } from '@/schemas/form.schema';
import { broadcastSocketEvent } from '@/lib/socket';
import type { ActionResult, Form, FormStatus, AnswerValue, FormResponse } from '@/types';

export async function saveOrUpdateForm(input: SaveFormInput): Promise<ActionResult<{ formId: string; isNew: boolean }>> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: 'Unauthorized. Please sign in.', code: 'UNAUTHORIZED' };
    }

    const parsed = v.safeParse(SaveFormSchema, input);
    if (!parsed.success) {
      const issue = parsed.issues[0];
      return { success: false, error: issue?.message || 'Invalid form data', code: 'VALIDATION' };
    }

    await connectToDatabase();

    const data = parsed.output;

    const mappedQuestions = data.questions.map((q) => ({
      _id: new mongoose.Types.ObjectId(),
      id: q.id || nanoid(10),
      type: q.type,
      label: q.label,
      description: q.description || '',
      required: q.required ?? false,
      placeholder: q.placeholder || '',
      options: q.options || [],
      ratingStyle: q.ratingStyle || 'stars',
      ratingMax: q.ratingMax ?? 5,
      ratingMinLabel: q.ratingMinLabel || '',
      ratingMaxLabel: q.ratingMaxLabel || '',
      maxFileSizeMb: q.maxFileSizeMb ?? 10,
      allowedFileTypes: q.allowedFileTypes || [],
    }));

    if (data.formId) {
      const existingForm = await FormModel.findOne({ id: data.formId });
      if (!existingForm) {
        return { success: false, error: 'Form not found', code: 'NOT_FOUND' };
      }

      if (existingForm.creatorId.toString() !== session.userId) {
        return { success: false, error: 'You do not have permission to edit this form', code: 'UNAUTHORIZED' };
      }

      existingForm.title = data.title;
      existingForm.description = data.description || '';
      existingForm.questions = mappedQuestions;
      existingForm.closeDate = data.closeDate ? new Date(data.closeDate) : null;

      if (data.status) {
        existingForm.status = data.status as FormStatus;
      }

      await existingForm.save();

      await createEvent({
        type: 'form_updated',
        formId: existingForm.id,
        formTitle: existingForm.title,
        userId: session.userId,
        metadata: { questionCount: existingForm.questions.length },
      });

      revalidatePath(`/forms`);
      revalidatePath(`/forms/details/${existingForm.id}`);
      revalidatePath(`/forms/edit/${existingForm.id}`);

      return {
        success: true,
        data: { formId: existingForm.id, isNew: false },
        message: 'Form updated successfully',
      };
    } else {
      const id = nanoid(10);
      const newForm = await FormModel.create({
        id,
        title: data.title,
        description: data.description || '',
        creatorId: new mongoose.Types.ObjectId(session.userId),
        status: (data.status as FormStatus) || 'draft',
        questions: mappedQuestions,
        responsesCount: 0,
        closeDate: data.closeDate ? new Date(data.closeDate) : null,
      });

      await createEvent({
        type: 'form_created',
        formId: newForm.id,
        formTitle: newForm.title,
        userId: session.userId,
        metadata: { questionCount: newForm.questions.length },
      });

      revalidatePath('/forms');
      revalidatePath('/dashboard');

      return {
        success: true,
        data: { formId: newForm.id, isNew: true },
        message: 'Form created successfully',
      };
    }
  } catch (error) {
    console.error('saveOrUpdateForm error:', error);
    return { success: false, error: 'Failed to save form. Please try again.', code: 'INTERNAL' };
  }
}

export async function getFormById(formId: string): Promise<ActionResult<{ form: Form }>> {
  try {
    if (!formId) {
      return { success: false, error: 'Form ID is required', code: 'VALIDATION' };
    }

    await connectToDatabase();

    const formDoc = await FormModel.findOne({ id: formId }).lean();
    if (!formDoc) {
      return { success: false, error: 'Form not found', code: 'NOT_FOUND' };
    }

    const responsesDocs = await FormResponseModel.find({ formId })
      .sort({ submittedAt: -1 })
      .lean();

    const form: Form = {
      id: formDoc.id,
      title: formDoc.title,
      description: formDoc.description || '',
      status: formDoc.status as FormStatus,
      closeDate: formDoc.closeDate ? new Date(formDoc.closeDate).toISOString() : null,
      responsesCount: formDoc.responsesCount ?? responsesDocs.length,
      creatorId: formDoc.creatorId.toString(),
      questions: (formDoc.questions || []).map((q) => ({
        id: q.id,
        type: q.type,
        label: q.label,
        description: q.description || '',
        required: q.required ?? false,
        placeholder: q.placeholder || '',
        options: q.options || [],
        ratingStyle: q.ratingStyle || 'stars',
        ratingMax: q.ratingMax ?? 5,
        ratingMinLabel: q.ratingMinLabel || '',
        ratingMaxLabel: q.ratingMaxLabel || '',
        maxFileSizeMb: q.maxFileSizeMb ?? 10,
        allowedFileTypes: q.allowedFileTypes || [],
      })),
      responses: responsesDocs.map((r) => ({
        id: r.id,
        formId: r.formId,
        respondentId: r.respondentId?.toString(),
        submittedAt: r.submittedAt ? new Date(r.submittedAt).toISOString() : new Date().toISOString(),
        answers: (r.answers || []).map((a) => ({
          questionId: a.questionId,
          answer: a.answer,
        })),
      })),
      createdAt: formDoc.createdAt ? new Date(formDoc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: formDoc.updatedAt ? new Date(formDoc.updatedAt).toISOString() : new Date().toISOString(),
    };

    return { success: true, data: { form } };
  } catch (error) {
    console.error('getFormById error:', error);
    return { success: false, error: 'Failed to fetch form', code: 'INTERNAL' };
  }
}

export async function getFormByUserId(userId: string): Promise<ActionResult<{ forms: Form[] }>> {
  try {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, error: 'Invalid user ID', code: 'VALIDATION' };
    }

    await connectToDatabase();

    const formsDocs = await FormModel.find({ creatorId: new mongoose.Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .lean();

    const forms: Form[] = formsDocs.map((formDoc) => ({
      id: formDoc.id,
      title: formDoc.title,
      description: formDoc.description || '',
      status: formDoc.status as FormStatus,
      closeDate: formDoc.closeDate ? new Date(formDoc.closeDate).toISOString() : null,
      responsesCount: formDoc.responsesCount ?? 0,
      creatorId: formDoc.creatorId.toString(),
      questions: (formDoc.questions || []).map((q) => ({
        id: q.id,
        type: q.type,
        label: q.label,
        description: q.description || '',
        required: q.required ?? false,
        placeholder: q.placeholder || '',
        options: q.options || [],
        ratingStyle: q.ratingStyle || 'stars',
        ratingMax: q.ratingMax ?? 5,
        ratingMinLabel: q.ratingMinLabel || '',
        ratingMaxLabel: q.ratingMaxLabel || '',
        maxFileSizeMb: q.maxFileSizeMb ?? 10,
        allowedFileTypes: q.allowedFileTypes || [],
      })),
      createdAt: formDoc.createdAt ? new Date(formDoc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: formDoc.updatedAt ? new Date(formDoc.updatedAt).toISOString() : new Date().toISOString(),
    }));

    return { success: true, data: { forms } };
  } catch (error) {
    console.error('getFormByUserId error:', error);
    return { success: false, error: 'Failed to fetch forms', code: 'INTERNAL' };
  }
}

export async function submitResponse(formId: string, answers: Record<string, AnswerValue>): Promise<ActionResult> {
  try {
    if (!formId) {
      return { success: false, error: 'Form ID is required', code: 'VALIDATION' };
    }

    await connectToDatabase();

    const form = await FormModel.findOne({ id: formId });
    if (!form) {
      return { success: false, error: 'Form not found', code: 'NOT_FOUND' };
    }

    if (form.status !== 'published') {
      return { success: false, error: 'This form is not currently accepting submissions', code: 'UNAUTHORIZED' };
    }

    if (form.closeDate && new Date() > new Date(form.closeDate)) {
      return {
        success: false,
        error: `This form closed on ${new Date(form.closeDate).toLocaleDateString()} and is no longer accepting responses.`,
        code: 'CONFLICT',
      };
    }

    // Validate email format if provided for an email question
    for (const question of form.questions || []) {
      if (question.type === 'email') {
        const val = answers[question.id];
        if (typeof val === 'string' && val.trim().length > 0) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val.trim())) {
            return {
              success: false,
              error: 'Please enter a valid email address',
              code: 'VALIDATION',
            };
          }
        }
      }
    }

    const session = await getSession();
    const responseId = nanoid(14);
    const submittedAt = new Date();

    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    // Create record in dedicated FormResponse collection
    await FormResponseModel.create({
      id: responseId,
      formId: form.id,
      respondentId: session?.userId ? new mongoose.Types.ObjectId(session.userId) : null,
      submittedAt,
      answers: formattedAnswers,
    });

    // Atomic increment of response count
    await FormModel.updateOne({ id: formId }, { $inc: { responsesCount: 1 } });
    const currentTotalResponses = (form.responsesCount || 0) + 1;

    await createEvent({
      type: 'form_submitted',
      formId: form.id,
      formTitle: form.title,
      userId: form.creatorId.toString(),
      metadata: { responseCount: currentTotalResponses },
    });

    // Broadcast event to socket server for real-time live sync
    await broadcastSocketEvent(formId, 'new_response', {
      formId,
      response: {
        id: responseId,
        formId: form.id,
        submittedAt: submittedAt.toISOString(),
        answers: formattedAnswers,
      },
      totalResponses: currentTotalResponses,
    });

    revalidatePath(`/forms/details/${formId}`);
    revalidatePath('/dashboard');

    return { success: true, data: undefined, message: 'Response submitted successfully' };
  } catch (error) {
    console.error('submitResponse error:', error);
    return { success: false, error: 'Failed to submit response. Please try again.', code: 'INTERNAL' };
  }
}

export async function deleteForm(formId: string): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }

    await connectToDatabase();

    const form = await FormModel.findOne({ id: formId });
    if (!form) {
      return { success: false, error: 'Form not found', code: 'NOT_FOUND' };
    }

    if (form.creatorId.toString() !== session.userId) {
      return { success: false, error: 'Permission denied', code: 'UNAUTHORIZED' };
    }

    await createEvent({
      type: 'form_deleted',
      formId: form.id,
      formTitle: form.title,
      userId: session.userId,
      metadata: { questionCount: form.questions.length, responseCount: form.responsesCount || 0 },
    });

    // Cascade delete: purge all responses associated with this form
    await FormResponseModel.deleteMany({ formId });
    await FormModel.deleteOne({ id: formId });

    revalidatePath('/forms');
    revalidatePath('/dashboard');

    return { success: true, data: undefined, message: 'Form deleted successfully' };
  } catch (error) {
    console.error('deleteForm error:', error);
    return { success: false, error: 'Failed to delete form', code: 'INTERNAL' };
  }
}

export async function changeStatus(formId: string, status: FormStatus): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }

    await connectToDatabase();

    const form = await FormModel.findOne({ id: formId });
    if (!form) {
      return { success: false, error: 'Form not found', code: 'NOT_FOUND' };
    }

    if (form.creatorId.toString() !== session.userId) {
      return { success: false, error: 'Permission denied', code: 'UNAUTHORIZED' };
    }

    const prevStatus = form.status;
    form.status = status;
    await form.save();

    await createEvent({
      type: 'form_updated',
      formId: form.id,
      formTitle: form.title,
      userId: session.userId,
      metadata: { previousStatus: prevStatus, newStatus: status },
    });

    await broadcastSocketEvent(formId, 'status_changed', { formId, status });

    revalidatePath('/forms');
    revalidatePath(`/forms/details/${formId}`);
    revalidatePath(`/forms/edit/${formId}`);

    return { success: true, data: undefined, message: `Status updated to ${status}` };
  } catch (error) {
    console.error('changeStatus error:', error);
    return { success: false, error: 'Failed to update form status', code: 'INTERNAL' };
  }
}
