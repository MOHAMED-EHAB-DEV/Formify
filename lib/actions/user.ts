"use server";

import { connectToDatabase } from "../database";
import User from "../models/user";

export async function getUser({ email }: { email: string }) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ email }).lean();

    if (!user) return null;

    return { ...user, _id: String(user._id) };
  } catch (error) {
    console.log(`Error while getting user by email: ${error}`);
    return null;
  }
}

export async function UpdateUser(
  { image, email, name }: { image: string; email: string; name: string },
  userEmail: string
) {}
