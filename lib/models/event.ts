import mongoose, { Schema, Document } from "mongoose";
import { nanoid } from "nanoid";

export type EventType =
  | "form_created"
  | "form_updated"
  | "form_submitted"
  | "form_deleted";

export interface IEvent extends Document {
  id: string;
  type: EventType;
  formId: string;
  formTitle: string;
  userId: string;
  timestamp: Date;
  metadata?: {
    submissions?: number;
    status?: string;
    [key: string]: any;
  };
}

const EventSchema = new Schema<IEvent>({
  id: {
    type: String,
    required: true,
    default: () => nanoid(10),
  },
  type: {
    type: String,
    required: true,
    enum: ["form_created", "form_updated", "form_submitted", "form_deleted"],
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
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
});

const Event =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
