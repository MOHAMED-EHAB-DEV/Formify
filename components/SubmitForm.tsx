'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircleIcon, ChevronRightIcon, ChevronLeftIcon } from '@/components/ui/svgs/icons';
import { submitResponse } from '@/actions/forms';
import type { Form } from '@/types';

interface SubmitFormProps {
  form: Pick<Form, 'id' | 'title' | 'description' | 'questions' | 'status'> & {
    creator?: { name?: string; email?: string };
  };
  isOwner?: boolean;
}

export default function SubmitForm({ form, isOwner = false }: SubmitFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = form.questions || [];
  const totalSteps = questions.length;
  const currentQuestion = questions[currentStep];

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (!currentQuestion) return;
    const currentAnswer = answers[currentQuestion.id];
    if (!currentAnswer || !currentAnswer.trim()) {
      toast.error('Please answer this question before continuing');
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitResponse(form.id, answers);
      if (res.success) {
        setIsCompleted(true);

        const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
        if (baseUrl) {
          try {
            const socketUrl = baseUrl.endsWith('/formify') ? baseUrl : `${baseUrl.replace(/\/$/, '')}/formify`;
            const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
            socket.emit('submit_response', {
              formId: form.id,
              response: {
                id: Math.random().toString(36).slice(2, 11),
                submittedAt: new Date().toISOString(),
                answers: Object.entries(answers).map(([k, v]) => ({ questionId: k, answer: v })),
              },
            });
            setTimeout(() => socket.disconnect(), 1000);
          } catch {
            // Ignore fallback client error
          }
        }
      } else {
        toast.error(res.error || 'Failed to submit response');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-background animate-fade-in">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircleIcon size={36} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Thank you!
          </h1>
          <p className="text-sm text-muted-foreground">
            Your response for &quot;{form.title}&quot; has been recorded successfully.
          </p>
          <div className="pt-4 border-t border-border-subtle">
            <Link
              href="/"
              className="text-xs font-semibold text-primary hover:underline underline-offset-4"
            >
              Powered by Formify
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const progressPercent = totalSteps > 0 ? Math.round(((currentStep + 1) / totalSteps) * 100) : 0;

  return (
    <main className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      {/* Top Banner & Progress Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xs sticky top-0 z-30">
        {isOwner && (
          <aside role="alert" className="bg-primary/10 px-4 py-2 text-center text-xs font-medium text-primary">
            You are previewing your own form. Submissions will be logged.
          </aside>
        )}
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/assets/icons/icon.svg" alt="Formify" width={24} height={24} />
            <span className="text-sm font-bold tracking-tight text-foreground">Formify</span>
          </Link>
          <div className="text-xs font-medium text-muted-foreground" aria-live="polite">
            Step {currentStep + 1} of {totalSteps}
          </div>
        </div>
        {/* Accessible Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={currentStep + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label="Form progress"
          className="h-1 w-full bg-muted overflow-hidden"
        >
          <div
            className="h-full bg-primary transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Question Form Runner */}
      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        {currentQuestion && (
          <div key={currentQuestion.id} className="space-y-6 animate-fade-in">
            <fieldset className="space-y-4">
              <legend className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {currentQuestion.label}
              </legend>

              {form.description && currentStep === 0 && (
                <p className="text-sm text-muted-foreground">{form.description}</p>
              )}

              {currentQuestion.type === 'text' ? (
                <div className="pt-2">
                  <Input
                    type="text"
                    placeholder="Type your answer here..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleNext();
                      }
                    }}
                    autoFocus
                    className="h-12 text-base px-4"
                  />
                </div>
              ) : (
                <div role="radiogroup" className="space-y-2.5 pt-2">
                  {(currentQuestion.options || []).map((option, idx) => {
                    const isSelected = answers[currentQuestion.id] === option;
                    return (
                      <label
                        key={idx}
                        className={`flex items-center gap-3.5 rounded-xl border p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-xs'
                            : 'border-border bg-card hover:bg-muted/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${currentQuestion.id}`}
                          value={option}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(currentQuestion.id, option)}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                            isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/50'
                          }`}
                        >
                          {isSelected && <span className="h-2 w-2 rounded-full bg-card" />}
                        </span>
                        <span className="text-sm font-medium text-foreground">{option}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </fieldset>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <footer className="border-t border-border bg-card/80 backdrop-blur-xs p-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0 || isSubmitting}
          >
            <ChevronLeftIcon size={16} />
            <span>Back</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleNext}
            isLoading={isSubmitting}
          >
            <span>{currentStep === totalSteps - 1 ? 'Submit' : 'Continue'}</span>
            {currentStep < totalSteps - 1 && <ChevronRightIcon size={16} />}
          </Button>
        </div>
      </footer>
    </main>
  );
}
