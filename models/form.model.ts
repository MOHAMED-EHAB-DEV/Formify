import mongoose, { Schema, Document, Model } from 'mongoose';
import type { FormStatus, QuestionType } from '@/types';

export interface IQuestionSubdoc {
  _id: mongoose.Types.ObjectId;
  id: string;
  type: QuestionType;
  label: string;
  options: string[];
}

export interface IResponseSubdoc {
  _id: mongoose.Types.ObjectId;
  id: string;
  submittedAt: Date;
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
}

export interface IFormDocument extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  title: string;
  description: string;
  questions: IQuestionSubdoc[];
  responses: IResponseSubdoc[];
  creatorId: mongoose.Types.ObjectId;
  status: FormStatus;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'multiple-choice'],
      required: true,
    },
    label: { type: String, required: true },
    options: { type: [String], default: [] },
  },
  { _id: true }
);

const ResponseSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    id: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    answers: [
      {
        questionId: { type: String, required: true },
        answer: { type: String, required: true, default: '' },
      },
    ],
  },
  { _id: true }
);

const FormSchema = new Schema<IFormDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    questions: { type: [QuestionSchema], default: [] },
    responses: { type: [ResponseSchema], default: [] },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
  },
  { timestamps: true }
);

const FormModel: Model<IFormDocument> =
  (mongoose.models.Form as Model<IFormDocument>) ||
  mongoose.model<IFormDocument>('Form', FormSchema);

export default FormModel;
