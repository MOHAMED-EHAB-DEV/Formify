'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem } from '@/components/ui/select';
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  StarIcon,
  UploadCloudIcon,
  GripVerticalIcon,
  TrashIcon,
  FileTextIcon,
  ClockIcon,
} from '@/components/ui/svgs/icons';
import { submitResponse } from '@/actions/forms';
import { uploadFormFile } from '@/actions/upload';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import type { Form, AnswerValue, FileAnswer } from '@/types';

interface SubmitFormProps {
  form: Pick<Form, 'id' | 'title' | 'description' | 'questions' | 'status' | 'closeDate'> & {
    creator?: { name?: string; email?: string };
  };
  isOwner?: boolean;
}

export default function SubmitForm({ form, isOwner = false }: SubmitFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // File upload state for file-upload questions
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isClosed = form.closeDate ? new Date() > new Date(form.closeDate) : false;

  const questions = form.questions || [];
  const totalSteps = questions.length;
  const currentQuestion = questions[currentStep];

  const handleAnswerChange = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Toggle for multi-select checkbox questions
  const handleCheckboxToggle = (questionId: string, option: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  };

  // Reorder for ranking questions
  const handleRankingDragEnd = (event: DragEndEvent, questionId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setAnswers((prev) => {
      const currentItems = (prev[questionId] as string[]) || currentQuestion.options || [];
      const oldIndex = currentItems.indexOf(String(active.id));
      const newIndex = currentItems.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return prev;
      return { ...prev, [questionId]: arrayMove(currentItems, oldIndex, newIndex) };
    });
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, questionId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('formId', form.id);
      if (currentQuestion.maxFileSizeMb) {
        formData.append('maxSizeBytes', String(currentQuestion.maxFileSizeMb * 1024 * 1024));
      }

      const res = await uploadFormFile(formData);
      if (res.success) {
        handleAnswerChange(questionId, res.data);
        toast.success('File attached successfully');
      } else {
        toast.error(res.error || 'Failed to upload file');
      }
    } catch {
      toast.error('An error occurred during file upload');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    const currentAnswer = answers[currentQuestion.id];

    // Enforce required validation
    if (currentQuestion.required) {
      if (
        currentAnswer === undefined ||
        currentAnswer === null ||
        (typeof currentAnswer === 'string' && !currentAnswer.trim()) ||
        (Array.isArray(currentAnswer) && currentAnswer.length === 0)
      ) {
        toast.error('Please answer this required question before continuing');
        return;
      }
    }

    // Specific format validation if answered
    if (typeof currentAnswer === 'string' && currentAnswer.trim()) {
      if (currentQuestion.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(currentAnswer.trim())) {
          toast.error('Please enter a valid email address');
          return;
        }
      }
      if (currentQuestion.type === 'number') {
        if (isNaN(Number(currentAnswer))) {
          toast.error('Please enter a valid numeric value');
          return;
        }
      }
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

  // Closed Form Screen
  if (isClosed && !isOwner) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-background animate-fade-in">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xs space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10 text-warning">
            <ClockIcon size={30} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Form Closed
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            &quot;{form.title}&quot; reached its deadline on {new Date(form.closeDate!).toLocaleString()} and is no longer accepting submissions.
          </p>
          <div className="pt-3 border-t border-border-subtle">
            <Link href="/" className="text-xs font-medium text-primary hover:underline">
              Return to Formify Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Completion Screen
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
        {isClosed && isOwner && (
          <aside role="alert" className="bg-warning/10 px-4 py-2 text-center text-xs font-medium text-warning">
            Notice: This form&apos;s close date has passed. Public respondents are blocked from submitting.
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
              <legend className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                <MarkdownRenderer content={currentQuestion.label} />
                {currentQuestion.required ? (
                  <span className="text-destructive ms-1" title="Required">*</span>
                ) : (
                  <span className="text-xs font-normal text-muted-foreground ms-2">(Optional)</span>
                )}
              </legend>

              {form.description && currentStep === 0 && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{form.description}</p>
              )}

              {/* 1. Short Text */}
              {currentQuestion.type === 'text' && (
                <div className="pt-2">
                  <Input
                    type="text"
                    placeholder={currentQuestion.placeholder || 'Type your answer here...'}
                    value={(answers[currentQuestion.id] as string) || ''}
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
              )}

              {/* 2. Paragraph Text */}
              {currentQuestion.type === 'paragraph' && (
                <div className="pt-2">
                  <Textarea
                    placeholder={currentQuestion.placeholder || 'Type your detailed response here...'}
                    value={(answers[currentQuestion.id] as string) || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    autoFocus
                    className="min-h-35 text-base p-4"
                  />
                </div>
              )}

              {/* 3. Multiple Choice (Radio) */}
              {currentQuestion.type === 'multiple-choice' && (
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

              {/* 4. Checkboxes (Multi-select) */}
              {currentQuestion.type === 'checkbox' && (
                <div role="group" className="space-y-2.5 pt-2">
                  {(currentQuestion.options || []).map((option, idx) => {
                    const selectedList = (answers[currentQuestion.id] as string[]) || [];
                    const isSelected = selectedList.includes(option);
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
                          type="checkbox"
                          value={option}
                          checked={isSelected}
                          onChange={() => handleCheckboxToggle(currentQuestion.id, option)}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                            isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/50'
                          }`}
                        >
                          {isSelected && <CheckCircleIcon size={14} />}
                        </span>
                        <span className="text-sm font-medium text-foreground">{option}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* 5. Dropdown Menu */}
              {currentQuestion.type === 'dropdown' && (
                <div className="pt-2">
                  <Select
                    size="lg"
                    value={(answers[currentQuestion.id] as string) || ''}
                    onValueChange={(val) => handleAnswerChange(currentQuestion.id, val)}
                    placeholder="Select an option..."
                    aria-label={currentQuestion.label || 'Select an option'}
                  >
                    {(currentQuestion.options || []).map((option, idx) => (
                      <SelectItem key={idx} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              )}

              {/* 6. Rating (Stars or Linear Scale) */}
              {currentQuestion.type === 'rating' && (
                <div className="pt-4 space-y-4">
                  {currentQuestion.ratingStyle === 'linear-scale' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {Array.from({ length: currentQuestion.ratingMax || 5 }, (_, i) => {
                          const val = i + 1;
                          const isSelected = answers[currentQuestion.id] === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleAnswerChange(currentQuestion.id, val)}
                              className={`flex-1 h-12 rounded-xl border font-bold text-base transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                  : 'border-border bg-card hover:bg-muted text-foreground'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground px-1 font-medium">
                        <span>{currentQuestion.ratingMinLabel || '1'}</span>
                        <span>{currentQuestion.ratingMaxLabel || `${currentQuestion.ratingMax || 5}`}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 sm:gap-3 py-3">
                      {Array.from({ length: currentQuestion.ratingMax || 5 }, (_, i) => {
                        const starVal = i + 1;
                        const activeVal = Number(answers[currentQuestion.id]) || 0;
                        const isFilled = starVal <= activeVal;
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => handleAnswerChange(currentQuestion.id, starVal)}
                            className="p-1 text-warning hover:scale-110 transition-transform"
                            aria-label={`${starVal} out of ${currentQuestion.ratingMax || 5} stars`}
                          >
                            <StarIcon
                              size={36}
                              fill={isFilled ? 'currentColor' : 'none'}
                              className={isFilled ? 'text-warning' : 'text-muted-foreground/40'}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 7. Ranking (Drag-and-Drop Preference Ordering) */}
              {currentQuestion.type === 'ranking' && (
                <RankingRunner
                  items={(answers[currentQuestion.id] as string[]) || currentQuestion.options || []}
                  onReorder={(newItems) => handleAnswerChange(currentQuestion.id, newItems)}
                />
              )}

              {/* 8. File Upload */}
              {currentQuestion.type === 'file-upload' && (
                <div className="pt-2 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    id={`file-${currentQuestion.id}`}
                    onChange={(e) => handleFileUpload(e, currentQuestion.id)}
                  />

                  {answers[currentQuestion.id] ? (
                    <div className="flex items-center justify-between p-4 rounded-xl border border-primary/30 bg-primary/5">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileTextIcon size={24} className="text-primary shrink-0" />
                        <div className="truncate">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {(answers[currentQuestion.id] as FileAnswer).name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(((answers[currentQuestion.id] as FileAnswer).size || 0) / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAnswerChange(currentQuestion.id, '')}
                        className="text-muted-foreground hover:text-destructive h-8 px-2"
                      >
                        <TrashIcon size={16} />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor={`file-${currentQuestion.id}`}
                      className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border bg-card hover:bg-muted/40 cursor-pointer transition-colors text-center space-y-2"
                    >
                      <UploadCloudIcon size={32} className="text-primary animate-pulse" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {isUploading ? 'Uploading file...' : 'Choose a file to attach'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Max size: {currentQuestion.maxFileSizeMb || 10}MB
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              )}

              {/* 9. Number */}
              {currentQuestion.type === 'number' && (
                <div className="pt-2">
                  <Input
                    type="number"
                    placeholder={currentQuestion.placeholder || 'e.g. 25'}
                    value={(answers[currentQuestion.id] as string) || ''}
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
              )}

              {/* 10. Date */}
              {currentQuestion.type === 'date' && (
                <div className="pt-2">
                  <Input
                    type="date"
                    value={(answers[currentQuestion.id] as string) || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    autoFocus
                    className="h-12 text-base px-4"
                  />
                </div>
              )}

              {/* 11. Email */}
              {currentQuestion.type === 'email' && (
                <div className="pt-2">
                  <Input
                    type="email"
                    placeholder={currentQuestion.placeholder || 'name@example.com'}
                    value={(answers[currentQuestion.id] as string) || ''}
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
            isLoading={isSubmitting || isUploading}
          >
            <span>{currentStep === totalSteps - 1 ? 'Submit' : 'Continue'}</span>
            {currentStep < totalSteps - 1 && <ChevronRightIcon size={16} />}
          </Button>
        </div>
      </footer>
    </main>
  );
}

// Subcomponent for Ranking Question drag-and-drop ordering
function RankingRunner({
  items,
  onReorder,
}: {
  items: string[];
  onReorder: (newItems: string[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.indexOf(String(active.id));
    const newIndex = items.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-2 pt-2">
      <p className="text-xs text-muted-foreground mb-1">
        Drag items to order by your preference (top = highest priority):
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <SortableRankingItem key={item} id={item} text={item} index={idx} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableRankingItem({ id, text, index }: { id: string; text: string; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card shadow-xs transition-colors"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder preference"
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
      >
        <GripVerticalIcon size={18} />
      </button>
      <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
        {index + 1}
      </span>
      <span className="text-sm font-medium text-foreground">{text}</span>
    </div>
  );
}
