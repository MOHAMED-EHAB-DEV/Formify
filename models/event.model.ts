import mongoose, { Schema, Document, Model } from 'mongoose';
import type { EventType } from '@/types';

export interface IEventDocument extends Document {
  _id: mongoose.Types.ObjectId;
  type: EventType;
  formId: string;
  formTitle: string;
  userId: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const eventSchema = new Schema<IEventDocument>({
  type: {
    type: String,
    enum: ['form_created', 'form_updated', 'form_submitted', 'form_deleted', 'responses_purged'],
    required: true,
  },
  formId: {
    type: String,
    required: true,
  },
  formTitle: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const EventModel: Model<IEventDocument> =
  (mongoose.models.Event as Model<IEventDocument>) ||
  mongoose.model<IEventDocument>('Event', eventSchema);

export default EventModel;
