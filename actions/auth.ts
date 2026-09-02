'use server';

import bcrypt from 'bcryptjs';
import * as v from 'valibot';
import { cookies } from 'next/headers';
import { generateState, generateCodeVerifier } from 'arctic';
import { connectToDatabase } from '@/lib/database';
import User from '@/models/user.model';
import { signToken } from '@/lib/jwt';
import { setSessionCookie, clearSessionCookie } from '@/lib/session';
import { googleOAuth, githubOAuth } from '@/lib/oauth';
import { SignInSchema, SignUpSchema, type SignInInput, type SignUpInput } from '@/schemas/auth.schema';
import type { ActionResult, IUser } from '@/types';

export async function signInWithCredentials(input: SignInInput): Promise<ActionResult<{ user: IUser }>> {
  try {
    const parsed = v.safeParse(SignInSchema, input);
    if (!parsed.success) {
      const issue = parsed.issues[0];
      return { success: false, error: issue?.message || 'Invalid input data', code: 'VALIDATION' };
    }

    await connectToDatabase();

    const user = await User.findOne({ email: parsed.output.email.toLowerCase() });
    if (!user) {
      return { success: false, error: 'No account found with this email', code: 'NOT_FOUND' };
    }

    if (!user.hashedPassword) {
      return {
        success: false,
        error: `This account was registered via ${user.provider || 'OAuth'}. Please sign in with ${user.provider}.`,
        code: 'CONFLICT',
      };
    }

    const isPasswordValid = await bcrypt.compare(parsed.output.password, user.hashedPassword);
    if (!isPasswordValid) {
      return { success: false, error: 'Incorrect password', code: 'UNAUTHORIZED' };
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image || '',
    });

    await setSessionCookie(token);

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
    };
  } catch (error) {
    console.error('signInWithCredentials error:', error);
    return { success: false, error: 'Failed to sign in. Please try again.', code: 'INTERNAL' };
  }
}

export async function signUpWithCredentials(input: SignUpInput): Promise<ActionResult<{ user: IUser }>> {
  try {
    const parsed = v.safeParse(SignUpSchema, input);
    if (!parsed.success) {
      const issue = parsed.issues[0];
      return { success: false, error: issue?.message || 'Invalid input data', code: 'VALIDATION' };
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: parsed.output.email.toLowerCase() });
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists', code: 'CONFLICT' };
    }

    const hashedPassword = await bcrypt.hash(parsed.output.password, 10);

    const newUser = await User.create({
      name: parsed.output.name,
      email: parsed.output.email.toLowerCase(),
      hashedPassword,
      provider: 'credentials',
      verified: true,
    });

    const token = await signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      image: '',
    });

    await setSessionCookie(token);

    return {
      success: true,
      data: {
        user: {
          _id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          image: newUser.image,
          provider: newUser.provider,
          createdAt: newUser.createdAt,
          verified: newUser.verified,
        },
      },
    };
  } catch (error) {
    console.error('signUpWithCredentials error:', error);
    return { success: false, error: 'Failed to create account. Please try again.', code: 'INTERNAL' };
  }
}

export async function signOutAction(): Promise<ActionResult> {
  try {
    await clearSessionCookie();
    return { success: true, data: undefined };
  } catch (error) {
    console.error('signOutAction error:', error);
    return { success: false, error: 'Failed to sign out', code: 'INTERNAL' };
  }
}

export async function getGoogleAuthUrl(): Promise<ActionResult<{ url: string }>> {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = googleOAuth.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);

    const cookieStore = await cookies();
    cookieStore.set('google_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 10,
    });
    cookieStore.set('google_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 10,
    });

    return { success: true, data: { url: url.toString() } };
  } catch (error) {
    console.error('getGoogleAuthUrl error:', error);
    return { success: false, error: 'Failed to initialize Google login', code: 'INTERNAL' };
  }
}

export async function getGitHubAuthUrl(): Promise<ActionResult<{ url: string }>> {
  try {
    const state = generateState();
    const url = githubOAuth.createAuthorizationURL(state, ['user:email']);

    const cookieStore = await cookies();
    cookieStore.set('github_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 10,
    });

    return { success: true, data: { url: url.toString() } };
  } catch (error) {
    console.error('getGitHubAuthUrl error:', error);
    return { success: false, error: 'Failed to initialize GitHub login', code: 'INTERNAL' };
  }
}
