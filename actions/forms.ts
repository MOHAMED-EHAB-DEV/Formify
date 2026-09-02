'use server';

import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import * as v from 'valibot';
import { connectToDatabase } from '@/lib/database';
import FormModel from '@/models/form.model';
import { getSession } from '@/lib/session';
import { createEvent } from '@/actions/events';
import { SaveFormSchema, type SaveFormInput } from '@/schemas/form.schema';
import { broadcastSocketEvent } from '@/lib/socket';
import type { ActionResult, Form, FormStatus } from '@/types';

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
      existingForm.questions = data.questions.map((q) => ({
        _id: new mongoose.Types.ObjectId(),
        id: q.id || nanoid(10),
        type: q.type,
        label: q.label,
        options: q.options || [],
      }));

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
        questions: data.questions.map((q) => ({
          _id: new mongoose.Types.ObjectId(),
          id: q.id || nanoid(10),
          type: q.type,
          label: q.label,
          options: q.options || [],
        })),
        responses: [],
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

    const form: Form = {
      id: formDoc.id,
      title: formDoc.title,
      description: formDoc.description || '',
      status: formDoc.status as FormStatus,
      creatorId: formDoc.creatorId.toString(),
      questions: formDoc.questions.map((q) => ({
        id: q.id,
        type: q.type,
        label: q.label,
        options: q.options || [],
      })),
      responses: formDoc.responses.map((r) => ({
        id: r.id,
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
      creatorId: formDoc.creatorId.toString(),
      questions: (formDoc.questions || []).map((q) => ({
        id: q.id,
        type: q.type,
        label: q.label,
        options: q.options || [],
      })),
      responses: (formDoc.responses || []).map((r) => ({
        id: r.id,
        submittedAt: r.submittedAt ? new Date(r.submittedAt).toISOString() : new Date().toISOString(),
        answers: (r.answers || []).map((a) => ({
          questionId: a.questionId,
          answer: a.answer,
        })),
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

export async function submitResponse(formId: string, answers: Record<string, string>): Promise<ActionResult> {
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

    const responseId = nanoid(14);
    const newResponse = {
      _id: new mongoose.Types.ObjectId(),
      id: responseId,
      submittedAt: new Date(),
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer: String(answer || ''),
      })),
    };

    form.responses.push(newResponse);
    await form.save();

    await createEvent({
      type: 'form_submitted',
      formId: form.id,
      formTitle: form.title,
      userId: form.creatorId.toString(),
      metadata: { responseCount: form.responses.length },
    });

    // Broadcast event to socket server
    await broadcastSocketEvent(formId, 'new_response', {
      formId,
      response: {
        id: responseId,
        submittedAt: newResponse.submittedAt.toISOString(),
        answers: newResponse.answers,
      },
      totalResponses: form.responses.length,
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
      metadata: { questionCount: form.questions.length, responseCount: form.responses.length },
    });

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
