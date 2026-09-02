import mongoose, { Schema, Document, Model } from 'mongoose';
import type { AuthProvider } from '@/types';

export interface IUserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  provider: AuthProvider;
  hashedPassword?: string;
  createdAt: Date;
  verified: boolean;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      enum: ['google', 'github', 'credentials'],
      required: true,
      default: 'credentials',
    },
    hashedPassword: {
      type: String,
      required: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUserDocument> =
  (mongoose.models.User as Model<IUserDocument>) ||
  mongoose.model<IUserDocument>('User', userSchema);

export default User;
