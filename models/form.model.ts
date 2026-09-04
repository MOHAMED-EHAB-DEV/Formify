import mongoose, { Schema, Document, Model } from 'mongoose';
import type { FormStatus, QuestionType, RatingStyle } from '@/types';

export interface IQuestionSubdoc {
  _id: mongoose.Types.ObjectId;
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

export interface IFormDocument extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  title: string;
  description: string;
  questions: IQuestionSubdoc[];
  responsesCount: number;
  closeDate?: Date | null;
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
      enum: [
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
      ],
      required: true,
    },
    label: { type: String, required: true },
    description: { type: String, default: '' },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    options: { type: [String], default: [] },
    ratingStyle: {
      type: String,
      enum: ['stars', 'linear-scale'],
      default: 'stars',
    },
    ratingMax: { type: Number, default: 5 },
    ratingMinLabel: { type: String, default: '' },
    ratingMaxLabel: { type: String, default: '' },
    maxFileSizeMb: { type: Number, default: 10 },
    allowedFileTypes: { type: [String], default: [] },
  },
  { _id: true }
);

const FormSchema = new Schema<IFormDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    questions: { type: [QuestionSchema], default: [] },
    responsesCount: { type: Number, default: 0, index: true },
    closeDate: { type: Date, default: null },
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

