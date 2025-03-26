'use server';

import { connectToDatabase } from "../database";
import User from "../models/user";

export async function getUser({ email } : { email: string }) {
    try {
        await connectToDatabase();

        const user = User.findOne({ email });

        return user;
    } catch (error) {
        console.log(`Error while getting user by email: ${error}`)
    }
}