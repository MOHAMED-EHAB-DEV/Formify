'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleIcon, GitHubIcon, EyeIcon, EyeOffIcon, LoaderIcon } from '@/components/ui/svgs/icons';
import {
  signInWithCredentials,
  signUpWithCredentials,
  getGoogleAuthUrl,
  getGitHubAuthUrl,
} from '@/actions/auth';

export function SigninCard({ initialMode = 'sign-in' }: { initialMode?: 'sign-in' | 'sign-up' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [mode, setMode] = useState<'sign-in' | 'sign-up'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  const errorParam = searchParams.get('error');
  const getErrorMessageFromParam = (param: string | null): string | null => {
    if (!param) return null;
    switch (param) {
      case 'oauth_failed':
        return 'Social sign-in failed. Please verify your connection or try with email.';
      case 'invalid_oauth_state':
        return 'Security check failed. Please refresh and try again.';
      case 'missing_email':
        return 'No verified email was provided by your OAuth account.';
      case 'google_userinfo_failed':
        return 'Could not retrieve profile information from Google.';
      case 'github_user_failed':
        return 'Could not retrieve profile information from GitHub.';
      case 'unauthorized':
        return 'Please sign in to access this page.';
      default:
        return 'An authentication error occurred. Please try again.';
    }
  };

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(getErrorMessageFromParam(errorParam));

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null);
    setOauthLoading(provider);
    try {
      const res = provider === 'google' ? await getGoogleAuthUrl() : await getGitHubAuthUrl();
      if (res.success) {
        window.location.href = res.data.url;
      } else {
        toast.error(res.error || `Failed to initialize ${provider} login`);
        setOauthLoading(null);
      }
    } catch {
      toast.error('An unexpected error occurred');
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'sign-in') {
        const res = await signInWithCredentials({ email, password });
        if (res.success) {
          toast.success('Welcome back!');
          router.push(callbackUrl);
          router.refresh();
        } else {
          setError(res.error);
          toast.error(res.error);
        }
      } else {
        const res = await signUpWithCredentials({ name, email, password });
        if (res.success) {
          toast.success('Account created successfully!');
          router.push(callbackUrl);
          router.refresh();
        } else {
          setError(res.error);
          toast.error(res.error);
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm transition-all animate-fade-in">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Image src="/assets/icons/icon.svg" alt="Formify" width={32} height={32} priority />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {mode === 'sign-in' ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === 'sign-in'
            ? 'Sign in to access your forms and analytics'
            : 'Get started with fast, smart, accessible forms'}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        <Button
          type="button"
          variant="outline"
          className="w-full h-10 font-normal justify-center"
          disabled={isLoading || oauthLoading !== null}
          onClick={() => handleOAuth('google')}
        >
          {oauthLoading === 'google' ? (
            <LoaderIcon size={18} />
          ) : (
            <GoogleIcon size={18} aria-hidden="true" />
          )}
          <span>Continue with Google</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full h-10 font-normal justify-center"
          disabled={isLoading || oauthLoading !== null}
          onClick={() => handleOAuth('github')}
        >
          {oauthLoading === 'github' ? (
            <LoaderIcon size={18} />
          ) : (
            <GitHubIcon size={18} aria-hidden="true" />
          )}
          <span>Continue with GitHub</span>
        </Button>
      </div>

      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border-subtle" />
        </div>
        <span className="relative bg-card px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Or continue with email
        </span>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'sign-up' && (
          <div className="space-y-1.5 text-start">
            <Label htmlFor="name" required>
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        )}

        <div className="space-y-1.5 text-start">
          <Label htmlFor="email" required>
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5 text-start">
          <Label htmlFor="password" required>
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            }
          />
        </div>

        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
          {mode === 'sign-in' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        {mode === 'sign-in' ? (
          <p>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('sign-up');
                setError(null);
              }}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('sign-in');
                setError(null);
              }}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
