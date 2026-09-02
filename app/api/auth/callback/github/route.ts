import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { githubOAuth } from '@/lib/oauth';
import { connectToDatabase } from '@/lib/database';
import User from '@/models/user.model';
import { signToken } from '@/lib/jwt';
import { setSessionCookie } from '@/lib/session';

interface GitHubUserResponse {
  id: number;
  name: string | null;
  login: string;
  email: string | null;
  avatar_url: string;
}

interface GitHubEmailResponse {
  email: string;
  primary: boolean;
  verified: boolean;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('github_oauth_state')?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/sign-in?error=invalid_oauth_state', request.url));
  }

  try {
    const tokens = await githubOAuth.validateAuthorizationCode(code);
    const accessToken = tokens.accessToken();

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Formify-App',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL('/sign-in?error=github_user_failed', request.url));
    }

    const githubUser: GitHubUserResponse = await userResponse.json();
    let userEmail = githubUser.email;

    if (!userEmail) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'Formify-App',
        },
      });

      if (emailResponse.ok) {
        const emails: GitHubEmailResponse[] = await emailResponse.json();
        const primaryEmail = emails.find((e) => e.primary && e.verified) || emails[0];
        if (primaryEmail) {
          userEmail = primaryEmail.email;
        }
      }
    }

    if (!userEmail) {
      return NextResponse.redirect(new URL('/sign-in?error=missing_email', request.url));
    }

    await connectToDatabase();

    let user = await User.findOne({ email: userEmail.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: githubUser.name || githubUser.login || 'GitHub User',
        email: userEmail.toLowerCase(),
        image: githubUser.avatar_url || '',
        provider: 'github',
        verified: true,
      });
    } else if (!user.image && githubUser.avatar_url) {
      user.image = githubUser.avatar_url;
      await user.save();
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image || '',
    });

    await setSessionCookie(token);

    cookieStore.delete('github_oauth_state');

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(new URL('/sign-in?error=oauth_failed', request.url));
  }
}
