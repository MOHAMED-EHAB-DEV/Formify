'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/database';
import User from '@/models/user.model';
import { cloudinary } from '@/lib/cloudinary';
import { getSession } from '@/lib/session';
import type { ActionResult, IUser } from '@/types';

export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const session = await getSession();
    if (!session?.email) return null;

    await connectToDatabase();
    const user = await User.findOne({ email: session.email.toLowerCase() }).lean();
    if (!user) return null;

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image || '',
      provider: user.provider,
      createdAt: user.createdAt,
      verified: user.verified,
    };
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('Dynamic server usage')) {
      throw error;
    }
    console.error('getCurrentUser error:', error);
    return null;
  }
}

export async function getUserById(id: string): Promise<IUser | null> {
  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;

    await connectToDatabase();
    const user = await User.findById(id).lean();
    if (!user) return null;

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image || '',
      provider: user.provider,
      createdAt: user.createdAt,
      verified: user.verified,
    };
  } catch (error) {
    console.error('getUserById error:', error);
    return null;
  }
}

export async function updateProfile(data: {
  name: string;
  image?: string;
}): Promise<ActionResult<{ user: IUser }>> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }

    await connectToDatabase();

    const user = await User.findById(session.userId);
    if (!user) {
      return { success: false, error: 'User not found', code: 'NOT_FOUND' };
    }

    user.name = data.name.trim();

    // If image is a base64 string, upload to Cloudinary inline in formify/avatars
    if (data.image && data.image.startsWith('data:image')) {
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        // Fallback if cloudinary credentials not configured
        user.image = data.image;
      } else {
        const uploadResult = await cloudinary.uploader.upload(data.image, {
          folder: 'formify/avatars',
          public_id: `user_${user._id}`,
          overwrite: true,
          resource_type: 'image',
          transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }],
        });
        user.image = uploadResult.secure_url;
      }
    } else if (data.image !== undefined) {
      user.image = data.image;
    }

    await user.save();

    revalidatePath('/settings');
    revalidatePath('/dashboard');
    revalidatePath('/(root)', 'layout');

    return {
      success: true,
      data: {
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          provider: user.provider,
          createdAt: user.createdAt,
          verified: user.verified,
        },
      },
      message: 'Profile updated successfully',
    };
  } catch (error) {
    console.error('updateProfile error:', error);
    return { success: false, error: 'Failed to update profile', code: 'INTERNAL' };
  }
}

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }

    await connectToDatabase();

    const user = await User.findById(session.userId);
    if (!user) {
      return { success: false, error: 'User not found', code: 'NOT_FOUND' };
    }

    if (!user.hashedPassword) {
      return {
        success: false,
        error: `Password cannot be updated for accounts managed via ${user.provider}`,
        code: 'CONFLICT',
      };
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.hashedPassword);
    if (!isMatch) {
      return { success: false, error: 'Current password is incorrect', code: 'UNAUTHORIZED' };
    }

    user.hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await user.save();

    return { success: true, data: undefined, message: 'Password updated successfully' };
  } catch (error) {
    console.error('updatePassword error:', error);
    return { success: false, error: 'Failed to update password', code: 'INTERNAL' };
  }
}
