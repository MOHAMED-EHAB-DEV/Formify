import { Suspense } from 'react';
import { SigninCard } from '@/components/SigninCard';

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your Formify account',
};

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Suspense fallback={<div className="w-full max-w-[420px] h-[480px] rounded-2xl border border-border bg-card animate-pulse" />}>
        <SigninCard initialMode="sign-in" />
      </Suspense>
    </main>
  );
}