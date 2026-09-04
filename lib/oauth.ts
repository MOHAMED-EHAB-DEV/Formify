import { Google, GitHub } from 'arctic';

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');

export const googleOAuth = new Google(
  process.env.GOOGLE_CLIENT_ID || '',
  process.env.GOOGLE_CLIENT_SECRET || '',
  `${appUrl}/api/auth/callback/google`
);

export const githubOAuth = new GitHub(
  process.env.GITHUB_CLIENT_ID || '',
  process.env.GITHUB_CLIENT_SECRET || '',
  `${appUrl}/api/auth/callback/github`
);
