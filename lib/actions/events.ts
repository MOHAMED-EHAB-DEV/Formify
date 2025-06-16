"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database";
import Event from "../models/event";
import { EventType } from "../models/event";

export async function getEventsByUserId(userId: string) {
  try {
    await connectToDatabase();

    const events = await Event.find({ userId })
      .sort({ timestamp: -1 })
      .limit(3)
      .populate("userId", "name email")
      .lean();

    return events.map((event) => ({
      ...event,
      userId: String(event.userId),
    }));
  } catch (error) {
    console.log(`Error while getting events by user id: ${error}`);
    return [];
  }
}

export async function createEvent(data: {
  type: EventType;
  formId: string;
  formTitle: string;
  userId: string;
  metadata?: {
    submissions?: number;
    status?: string;
    [key: string]: any;
  };
}) {
  try {
    await connectToDatabase();

    const event = await Event.create({
      ...data,
      timestamp: new Date(),
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      event: event.toObject(),
    };
  } catch (error) {
    console.log(`Error while creating event: ${error}`);
    return {
      success: false,
      error: "Internal Server Error",
    };
  }
}
