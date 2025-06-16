"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "../database";
import User from "../models/user";
import { createEvent } from "./events";

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

export async function getUserById(id: string) {
  try {
    await connectToDatabase();

    const user = (await User.findById(id)).toObject();

    return { success: true, user };
  } catch (error) {
    console.log(`Error while getting user by id: ${error}`);
    return { success: false, error: "Internal Server Error" };
  }
}

export const UpdateUser = async (
  {
    name,
    email,
    image,
  }: {
    name: string;
    email: string;
    image: string;
  },
  actualEmail: string
) => {
  try {
    await connectToDatabase();

    const userExists = await getUser({ email: actualEmail });
    if (!userExists) {
      return {
        message: "User Doesn't Exists",
        updated: false,
      };
    }

    const user = await User.findOneAndUpdate(
      { email: actualEmail },
      { name, email, image }
    );

    revalidatePath("/");

    return {
      message: "User Successfully Updated",
      updated: true,
      user,
    };
  } catch (error) {
    console.log(`Error Updating User: ${error}`);
    return {
      message: `Error Updating User`,
      updated: false,
    };
  }
};
