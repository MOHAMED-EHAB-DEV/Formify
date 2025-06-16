"use server";

import { nanoid } from "nanoid";
import { connectToDatabase } from "../database";
import Form from "../models/form";
import mongoose from "mongoose";
import { createEvent } from "./events";

type SaveFormInput = {
  formId?: string;
  title: string;
  description?: string;
  questions: QuestionInput[];
  creatorId: string;
};

export async function saveOrUpdateForm(data: SaveFormInput) {
  try {
    await connectToDatabase();

    if (data.formId) {
      const form = await Form.findOne({ id: data.formId });
      if (!form) return { success: false, error: "Form not found" };

      form.title = data.title;
      form.description = data.description || "";
      form.questions = data.questions.map((q) => ({
        _id: q._id
          ? new mongoose.Types.ObjectId(q._id)
          : new mongoose.Types.ObjectId(),
        id: q.id,
        type: q.type,
        label: q.label,
        options: q.options || [],
      }));

      await form.save();

      // Create event for form update
      await createEvent({
        type: "form_updated",
        formId: form.id,
        formTitle: form.title,
        userId: data.creatorId,
        metadata: {
          questionCount: form.questions.length,
        },
      });

      return { success: true, formId: form._id.toString(), updated: true };
    } else {
      const id = nanoid(10);
      const newForm = await Form.create({
        id,
        title: data.title,
        description: data.description || "",
        creatorId: data.creatorId,
        questions: data.questions.map((q) => ({
          _id: new mongoose.Types.ObjectId(),
          id: nanoid(12),
          type: q.type,
          label: q.label,
          options: q.options || [],
        })),
      });

      // Create event for form creation
      await createEvent({
        type: "form_created",
        formId: newForm.id,
        formTitle: newForm.title,
        userId: data.creatorId,
        metadata: {
          questionCount: newForm.questions.length,
        },
      });

      return { success: true, formId: newForm.id.toString(), created: true };
    }
  } catch (error) {
    console.error("Error saving/updating form:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function getFormById(formId: string) {
  try {
    await connectToDatabase();

    const form = await Form.findOne(
      { id: formId },
      {
        _id: 0,
        id: 1,
        creatorId: 1,
        title: 1,
        description: 1,
        status: 1,
        responses: 1,
        questions: 1,
      }
    ).lean();
    if (!form) return { success: false, error: "Form not found" };
    return { success: true, form };
  } catch (error) {
    console.error("Error fetching form:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function getFormByUserId(userId: string) {
  try {
    await connectToDatabase();

    const forms = await Form.find(
      { creatorId: userId },
      {
        _id: 0,
        id: 1,
        creatorId: 1,
        title: 1,
        description: 1,
        status: 1,
        responses: 1,
      }
    ).lean();
    if (!forms) return { success: false, error: "Forms not found" };
    return { success: true, forms };
  } catch (error) {
    console.error("Error fetching forms:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function submitResponse(
  formId: string,
  answers: { [key: string]: string }
) {
  try {
    await connectToDatabase();

    const form = await Form.findOne({ id: formId });
    if (!form) return { success: false, error: "Form not found" };

    const updatedForm = await Form.findByIdAndUpdate(
      form._id,
      {
        $push: {
          responses: {
            id: nanoid(14),
            answers: Object.entries(answers).map(([questionId, answer]) => ({
              questionId,
              answer,
            })),
          },
        },
      },
      { new: true }
    ).lean();

    if (!updatedForm) {
      return { success: false, error: "Failed to update form" };
    }

    // Create event for form submission
    await createEvent({
      type: "form_submitted",
      formId: form.id,
      formTitle: form.title,
      userId: form.creatorId,
      metadata: {
        responseCount: form.responses.length + 1,
      },
    });

    // Emit socket event for real-time updates
    if (global.io) {
      const newResponse =
        updatedForm.responses[updatedForm.responses.length - 1];
      console.log("Emitting new-response event:", {
        formId,
        response: newResponse,
        totalResponses: updatedForm.responses.length,
      });

      global.io.to(`form-${formId}`).emit("new-response", {
        formId,
        response: newResponse,
        totalResponses: updatedForm.responses.length,
      });
    } else {
      console.error("Socket.IO instance not found");
    }

    return { success: true, response: updatedForm };
  } catch (error) {
    console.error("Error submitting response:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function deleteForm(formId: string) {
  try {
    await connectToDatabase();

    const form = await Form.findOne({ id: formId });
    if (!form) return { success: false, error: "Form not found" };

    // Create event for form deletion before deleting
    await createEvent({
      type: "form_deleted",
      formId: form.id,
      formTitle: form.title,
      userId: form.creatorId,
      metadata: {
        questionCount: form.questions.length,
        responseCount: form.responses?.length || 0,
      },
    });

    await Form.deleteOne({ id: formId });
    return { success: true, message: "Form deleted successfully" };
  } catch (error) {
    console.error("Error deleting form:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function ChangeStatus(formId: string, status: string) {
  try {
    await connectToDatabase();

    const form = await Form.findOne({ id: formId });
    if (!form) return { success: false, error: "Form not found" };

    form.status = status;
    await form.save();

    // Create event for status change
    await createEvent({
      type: "form_updated",
      formId: form.id,
      formTitle: form.title,
      userId: form.creatorId,
      metadata: {
        status: status,
        previousStatus: form.status,
      },
    });

    return { success: true, message: "Form status changed successfully" };
  } catch (error) {
    console.error("Error changing form status:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
