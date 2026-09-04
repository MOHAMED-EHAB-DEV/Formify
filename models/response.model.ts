import mongoose, { Schema, Document, Model } from 'mongoose';
import type { AnswerValue } from '@/types';

export interface IFormResponseDocument extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  formId: string;
  respondentId?: mongoose.Types.ObjectId;
  answers: Array<{
    questionId: string;
    answer: AnswerValue;
  }>;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FormResponseSchema = new Schema<IFormResponseDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    formId: { type: String, required: true, index: true },
    respondentId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    answers: [
      {
        _id: false,
        questionId: { type: String, required: true },
        answer: { type: Schema.Types.Mixed, required: true },
      },
    ],
    submittedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Compound index for querying form submissions sorted by submission time
FormResponseSchema.index({ formId: 1, submittedAt: -1 });

const FormResponseModel: Model<IFormResponseDocument> =
  (mongoose.models.FormResponse as Model<IFormResponseDocument>) ||
  mongoose.model<IFormResponseDocument>('FormResponse', FormResponseSchema);

export default FormResponseModel;
