"use server";

import { connectToDatabase } from "../database";
import Form from "../models/form";
import mongoose from "mongoose";

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
      const form = await Form.findById(data.formId);
      if (!form) return { success: false, error: "Form not found" };

      form.title = data.title;
      form.description = data.description || "";
      form.questions = data.questions.map((q) => ({
        _id: q._id
          ? new mongoose.Types.ObjectId(q._id)
          : new mongoose.Types.ObjectId(),
        type: q.type,
        label: q.label,
        options: q.options || [],
      }));

      await form.save();
      return { success: true, formId: form._id.toString(), updated: true };
    } else {
      const newForm = await Form.create({
        title: data.title,
        description: data.description || "",
        creatorId: data.creatorId,
        questions: data.questions.map((q) => ({
          _id: new mongoose.Types.ObjectId(),
          type: q.type,
          label: q.label,
          options: q.options || [],
        })),
      });

      return { success: true, formId: newForm._id.toString(), created: true };
    }
  } catch (error) {
    console.error("Error saving/updating form:", error);
    return { success: false, error: "Internal Server Error" };
  }
};

export async function getFormById(formId: string) {
  try {
    await connectToDatabase();

    const form = await Form.findById(formId);
    if (!form) return { success: false, error: "Form not found" };
    return { success: true, form };
  } catch (error) {
    console.error("Error fetching form:", error);
    return { success: false, error: "Internal Server Error" };
  }
};

export async function getFormByUserId(userId: string) {
  try {
    await connectToDatabase();

    const forms = await Form.find({ creatorId: userId });
    if (!forms) return { success: false, error: "Forms not found" };
    return { success: true, forms };
  } catch (error) {
    console.error("Error fetching forms:", error);
    return { success: false, error: "Internal Server Error" };
  }
}