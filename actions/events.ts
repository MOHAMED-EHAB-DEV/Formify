'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/database';
import EventModel from '@/models/event.model';
import type { EventType, AppEvent, ActionResult } from '@/types';
import mongoose from 'mongoose';

export async function getEventsByUserId(userId: string): Promise<AppEvent[]> {
  try {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return [];
    await connectToDatabase();

    const events = await EventModel.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ timestamp: -1 })
      .limit(6)
      .populate<{ userId: { name: string; email: string } }>('userId', 'name email')
      .lean();

    return events.map((event) => ({
      id: event._id.toString(),
      type: event.type as EventType,
      formId: event.formId,
      formTitle: event.formTitle,
      userId: event.userId ? { name: event.userId.name, email: event.userId.email } : 'Anonymous',
      metadata: event.metadata as Record<string, unknown>,
      timestamp: event.timestamp.toISOString(),
    }));
  } catch (error) {
    console.error('getEventsByUserId error:', error);
    return [];
  }
}

export async function createEvent(data: {
  type: EventType;
  formId: string;
  formTitle: string;
  userId: string;
  metadata?: Record<string, unknown>;
}): Promise<ActionResult<{ id: string }>> {
  try {
    await connectToDatabase();

    const newEvent = await EventModel.create({
      type: data.type,
      formId: data.formId,
      formTitle: data.formTitle,
      userId: new mongoose.Types.ObjectId(data.userId),
      metadata: data.metadata || {},
      timestamp: new Date(),
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      data: { id: newEvent._id.toString() },
    };
  } catch (error) {
    console.error('createEvent error:', error);
    return {
      success: false,
      error: 'Failed to record event log',
      code: 'INTERNAL',
    };
  }
}
