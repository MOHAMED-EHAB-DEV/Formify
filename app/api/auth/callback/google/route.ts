import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { googleOAuth } from '@/lib/oauth';
import { connectToDatabase } from '@/lib/database';
import User from '@/models/user.model';
import { signToken } from '@/lib/jwt';
import { setSessionCookie } from '@/lib/session';

interface GoogleUserResponse {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  email_verified?: boolean;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('google_oauth_state')?.value;
  const codeVerifier = cookieStore.get('google_code_verifier')?.value;

  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    return NextResponse.redirect(new URL('/sign-in?error=invalid_oauth_state', request.url));
  }

  try {
    const tokens = await googleOAuth.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL('/sign-in?error=google_userinfo_failed', request.url));
    }

    const googleUser: GoogleUserResponse = await response.json();

    if (!googleUser.email) {
      return NextResponse.redirect(new URL('/sign-in?error=missing_email', request.url));
    }

    await connectToDatabase();

    let user = await User.findOne({ email: googleUser.email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: googleUser.name || 'Google User',
        email: googleUser.email.toLowerCase(),
        image: googleUser.picture || '',
        provider: 'google',
        verified: googleUser.email_verified || true,
      });
    } else if (!user.image && googleUser.picture) {
      user.image = googleUser.picture;
      await user.save();
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image || '',
    });

    await setSessionCookie(token);

    // Clean up temporary OAuth cookies
    cookieStore.delete('google_oauth_state');
    cookieStore.delete('google_code_verifier');

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/sign-in?error=oauth_failed', request.url));
  }
}
