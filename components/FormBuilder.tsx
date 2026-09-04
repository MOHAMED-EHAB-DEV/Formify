'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectItem, SelectSection } from '@/components/ui/select';
import { Portal } from '@/components/ui/portal';
import {
  PlusIcon,
  TrashIcon,
  GripVerticalIcon,
  FileTextIcon,
  ListIcon,
  CheckCircleIcon,
  CheckSquareIcon,
  StarIcon,
  UploadCloudIcon,
  CalendarIcon,
  HashIcon,
  MailIcon,
  MoveIcon,
  ClockIcon,
} from '@/components/ui/svgs/icons';
import { useFormBuilder } from '@/hooks/use-form-builder';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import type { Question, FormStatus, QuestionType } from '@/types';

interface FormBuilderProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    questions?: Question[];
    status?: FormStatus;
    closeDate?: Date | string | null;
  };
}

export function FormBuilder({ initialData }: FormBuilderProps) {
  const {
    title,
    setTitle,
    description,
    setDescription,
    closeDate,
    setCloseDate,
    questions,
    isSaving,
    addQuestion,
    deleteQuestion,
    updateQuestion,
    updateQuestionLabel,
    toggleQuestionRequired,
    changeQuestionType,
    addOption,
    updateOption,
    deleteOption,
    handleDragEnd,
    handleSave,
  } = useFormBuilder(initialData);

  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [showFloatingBar, setShowFloatingBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setShowFloatingBar(rect.bottom < 50);
      } else {
        setShowFloatingBar(window.scrollY > 80);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  return (
    <div className="w-full space-y-6">
      {/* Action Header Bar */}
      <div
        ref={headerRef}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs"
      >
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {initialData?.id ? 'Edit Form' : 'Form Studio'}
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure questions on the left; view respondent layout on the right.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            isLoading={isSaving}
            onClick={() => handleSave('draft')}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="flex-1 sm:flex-none"
            isLoading={isSaving}
            onClick={() => handleSave('published')}
          >
            <CheckCircleIcon size={16} aria-hidden="true" />
            <span>Publish Form</span>
          </Button>
        </div>
      </div>

      {/* Floating Action Box On Scroll */}
      {showFloatingBar && (
        <Portal>
          <div
            role="region"
            aria-label="Floating form actions"
            className="fixed bottom-6 inset-s-4 inset-e-4 sm:inset-s-1/2 sm:inset-e-auto sm:-translate-x-1/2 md:inset-s-[calc(50%+7.5rem)] z-50 pointer-events-auto animate-fade-in"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/95 backdrop-blur-lg p-2 shadow-2xl ring-1 ring-border/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none h-9 text-xs"
                isLoading={isSaving}
                onClick={() => handleSave('draft')}
              >
                Save Draft
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="flex-1 sm:flex-none h-9 text-xs"
                isLoading={isSaving}
                onClick={() => handleSave('published')}
              >
                <CheckCircleIcon size={14} aria-hidden="true" />
                <span>Publish Form</span>
              </Button>
            </div>
          </div>
        </Portal>
      )}

      {/* Split Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Builder */}
        <div className="lg:col-span-7 space-y-5">
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="form-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Form Title <span className="text-destructive">*</span>
                </label>
                <Input
                  id="form-title"
                  placeholder="e.g. Product Feedback Survey"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="form-description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description (Optional)
                </label>
                <Textarea
                  id="form-description"
                  placeholder="Tell respondents what this form is for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-20"
                />
              </div>

              {/* Close Date / Deadline Setting */}
              <div className="pt-2 border-t border-border-subtle">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label htmlFor="close-date" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <ClockIcon size={14} className="text-primary" />
                      <span>Form Close Date / Expiration</span>
                      <span className="text-[10px] font-normal text-muted-foreground">(Optional)</span>
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Optional — leave blank to keep form open indefinitely. Submissions are rejected after this deadline.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="close-date"
                      type="datetime-local"
                      value={closeDate}
                      onChange={(e) => setCloseDate(e.target.value)}
                      className="h-8 text-xs max-w-52.5"
                    />
                    {closeDate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCloseDate('')}
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Cards List with DnD */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <SortableQuestionItem
                    key={question.id}
                    question={question}
                    index={index}
                    onUpdateLabel={updateQuestionLabel}
                    onChangeType={changeQuestionType}
                    onToggleRequired={toggleQuestionRequired}
                    onUpdateQuestion={updateQuestion}
                    onDelete={deleteQuestion}
                    onAddOption={addOption}
                    onUpdateOption={updateOption}
                    onDeleteOption={deleteOption}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Comprehensive Question Insertion Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Add Question
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAddMenuOpen((prev) => !prev)}
                className="text-xs h-7 text-primary"
              >
                {addMenuOpen ? 'Hide Menu' : 'Show All Types'}
              </Button>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion('text')}
                className="justify-start gap-2 border-dashed h-9 text-xs"
              >
                <FileTextIcon size={14} />
                <span>Short Text</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion('paragraph')}
                className="justify-start gap-2 border-dashed h-9 text-xs"
              >
                <FileTextIcon size={14} />
                <span>Paragraph</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion('multiple-choice')}
                className="justify-start gap-2 border-dashed h-9 text-xs"
              >
                <ListIcon size={14} />
                <span>Choice</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion('checkbox')}
                className="justify-start gap-2 border-dashed h-9 text-xs"
              >
                <CheckSquareIcon size={14} />
                <span>Checkboxes</span>
              </Button>
            </div>

            {/* Expanded categorized menu */}
            {addMenuOpen && (
              <div className="rounded-xl border border-border bg-card p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-fade-in">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addQuestion('dropdown')}
                  className="justify-start gap-2 text-xs"
                >
                  <ListIcon size={14} />
                  <span>Dropdown Menu</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addQuestion('rating')}
                  className="justify-start gap-2 text-xs"
                >
                  <StarIcon size={14} />
                  <span>Rating Scale</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addQuestion('ranking')}
                  className="justify-start gap-2 text-xs"
                >
                  <MoveIcon size={14} />
                  <span>Ranking Reorder</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addQuestion('file-upload')}
                  className="justify-start gap-2 text-xs"
                >
                  <UploadCloudIcon size={14} />
                  <span>File Upload</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addQuestion('number')}
                  className="justify-start gap-2 text-xs"
                >
                  <HashIcon size={14} />
                  <span>Number</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addQuestion('date')}
                  className="justify-start gap-2 text-xs"
                >
                  <CalendarIcon size={14} />
                  <span>Date Picker</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addQuestion('email')}
                  className="justify-start gap-2 text-xs"
                >
                  <MailIcon size={14} />
                  <span>Email</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Live Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Live Preview
              </span>
              <span className="text-xs text-muted-foreground">
                {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {title || 'Untitled Form'}
                </h3>
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {description}
                  </p>
                )}
                {closeDate && (
                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-warning bg-warning/10 px-2.5 py-1 rounded-md">
                    <ClockIcon size={13} />
                    <span>Closes {new Date(closeDate).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-2">
                {questions.map((q, idx) => (
                  <div key={q.id} className="rounded-xl border border-border-subtle bg-muted/30 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold text-foreground">
                        <span>{idx + 1}. </span>
                        {q.label ? (
                          <MarkdownRenderer content={q.label} />
                        ) : (
                          <span className="italic text-muted-foreground">Untitled question</span>
                        )}
                        {q.required && <span className="text-destructive ms-1">*</span>}
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider shrink-0">
                        {q.type}
                      </Badge>
                    </div>

                    {/* Type-specific preview renderers */}
                    {q.type === 'text' && (
                      <div className="h-9 w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-muted-foreground">
                        {q.placeholder || 'User text response...'}
                      </div>
                    )}

                    {q.type === 'paragraph' && (
                      <div className="h-16 w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-muted-foreground">
                        {q.placeholder || 'Detailed user response...'}
                      </div>
                    )}

                    {q.type === 'multiple-choice' && (
                      <div className="space-y-1.5 pt-1">
                        {(q.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2.5 text-xs text-foreground">
                            <span className="h-3.5 w-3.5 rounded-sm border border-primary/40 bg-card shrink-0" />
                            <span>{opt || `Option ${optIdx + 1}`}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'checkbox' && (
                      <div className="space-y-1.5 pt-1">
                        {(q.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2.5 text-xs text-foreground">
                            <span className="h-3.5 w-3.5 rounded-sm border border-primary/40 bg-card shrink-0" />
                            <span>{opt || `Option ${optIdx + 1}`}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'dropdown' && (
                      <div className="h-9 w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
                        <span>Select an option...</span>
                        <span>▼</span>
                      </div>
                    )}

                    {q.type === 'rating' && (
                      <div className="pt-1">
                        {q.ratingStyle === 'linear-scale' ? (
                          <div className="space-y-1.5">
                            <div className="flex gap-1.5">
                              {Array.from({ length: q.ratingMax || 5 }, (_, i) => (
                                <div
                                  key={i}
                                  className="h-8 flex-1 flex items-center justify-center rounded-md border border-input bg-card text-xs font-semibold"
                                >
                                  {i + 1}
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                              <span>{q.ratingMinLabel || '1'}</span>
                              <span>{q.ratingMaxLabel || `${q.ratingMax || 5}`}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            {Array.from({ length: q.ratingMax || 5 }, (_, i) => (
                              <StarIcon key={i} size={18} className="text-warning fill-warning/20" />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {q.type === 'ranking' && (
                      <div className="space-y-1.5 pt-1">
                        {(q.options || []).map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="flex items-center gap-2 p-2 rounded-lg border border-border-subtle bg-card text-xs font-medium"
                          >
                            <span className="h-4 w-4 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                              {itemIdx + 1}
                            </span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'file-upload' && (
                      <div className="rounded-lg border border-dashed border-border bg-card p-3 text-center space-y-1">
                        <UploadCloudIcon size={18} className="mx-auto text-primary" />
                        <p className="text-xs text-foreground font-medium">Click or drag file to upload</p>
                        <p className="text-[10px] text-muted-foreground">
                          Max size: {q.maxFileSizeMb || 10}MB
                        </p>
                      </div>
                    )}

                    {q.type === 'number' && (
                      <div className="h-9 w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-muted-foreground">
                        {q.placeholder || '12345...'}
                      </div>
                    )}

                    {q.type === 'date' && (
                      <div className="h-9 w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
                        <span>YYYY-MM-DD</span>
                        <CalendarIcon size={14} />
                      </div>
                    )}

                    {q.type === 'email' && (
                      <div className="h-9 w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
                        <span>{q.placeholder || 'name@example.com'}</span>
                        <MailIcon size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableQuestionItem({
  question,
  index,
  onUpdateLabel,
  onChangeType,
  onToggleRequired,
  onUpdateQuestion,
  onDelete,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
}: {
  question: Question;
  index: number;
  onUpdateLabel: (id: string, label: string) => void;
  onChangeType: (id: string, type: QuestionType) => void;
  onToggleRequired: (id: string) => void;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onDelete: (id: string) => void;
  onAddOption: (id: string) => void;
  onUpdateOption: (id: string, index: number, val: string) => void;
  onDeleteOption: (id: string, index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const hasOptions = ['multiple-choice', 'checkbox', 'dropdown', 'ranking'].includes(question.type);

  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Header: Drag handle, index, type select, required switch, delete */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder"
              style={{ touchAction: 'none' }}
              className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors touch-none"
            >
              <GripVerticalIcon size={18} />
            </button>
            <span className="text-xs font-semibold text-muted-foreground">
              Q{index + 1}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Question Type Selector */}
            <Select
              size="sm"
              value={question.type}
              onValueChange={(val) => onChangeType(question.id, val as QuestionType)}
              className="w-40"
              triggerClassName="h-8 text-xs font-medium"
              aria-label="Select question type"
            >
              <SelectSection title="Text">
                <SelectItem value="text" startContent={<FileTextIcon size={14} />}>
                  Short Answer
                </SelectItem>
                <SelectItem value="paragraph" startContent={<FileTextIcon size={14} />}>
                  Paragraph
                </SelectItem>
              </SelectSection>
              <SelectSection title="Selection" showDivider>
                <SelectItem value="multiple-choice" startContent={<CheckSquareIcon size={14} />}>
                  Multiple Choice
                </SelectItem>
                <SelectItem value="checkbox" startContent={<CheckSquareIcon size={14} />}>
                  Checkboxes
                </SelectItem>
                <SelectItem value="dropdown" startContent={<ListIcon size={14} />}>
                  Dropdown
                </SelectItem>
              </SelectSection>
              <SelectSection title="Rating & Order" showDivider>
                <SelectItem value="rating" startContent={<StarIcon size={14} />}>
                  Rating Scale
                </SelectItem>
                <SelectItem value="ranking" startContent={<MoveIcon size={14} />}>
                  Ranking Order
                </SelectItem>
              </SelectSection>
              <SelectSection title="Inputs & Media" showDivider>
                <SelectItem value="file-upload" startContent={<UploadCloudIcon size={14} />}>
                  File Upload
                </SelectItem>
                <SelectItem value="number" startContent={<HashIcon size={14} />}>
                  Number
                </SelectItem>
                <SelectItem value="date" startContent={<CalendarIcon size={14} />}>
                  Date
                </SelectItem>
                <SelectItem value="email" startContent={<MailIcon size={14} />}>
                  Email
                </SelectItem>
              </SelectSection>
            </Select>

            {/* Required Toggle */}
            <button
              type="button"
              onClick={() => onToggleRequired(question.id)}
              className={`h-8 px-2.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                question.required
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Required</span>
              {question.required && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>

            {/* Delete button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(question.id)}
              aria-label="Delete question"
              className="text-muted-foreground hover:text-destructive h-8 px-2"
            >
              <TrashIcon size={16} />
            </Button>
          </div>
        </div>

        {/* Question Label with Markdown Helper */}
        <div className="space-y-1">
          <Input
            placeholder="Type your question here... (Supports **bold**, *italic*, - lists)"
            value={question.label}
            onChange={(e) => onUpdateLabel(question.id, e.target.value)}
            className="font-medium text-sm"
          />
          <p className="text-[10px] text-muted-foreground ps-1">
            Markdown enabled: <code className="text-foreground">**bold**</code>, <code className="text-foreground">*italic*</code>, <code className="text-foreground">- list</code>
          </p>
        </div>

        {/* Optional Placeholder for text/number/email */}
        {['text', 'paragraph', 'number', 'email'].includes(question.type) && (
          <div className="space-y-1 ps-2 border-s-2 border-border-subtle">
            <Input
              placeholder="Custom input placeholder (optional)..."
              value={question.placeholder || ''}
              onChange={(e) => onUpdateQuestion(question.id, { placeholder: e.target.value })}
              className="h-8 text-xs text-muted-foreground"
            />
          </div>
        )}

        {/* Rating Configuration */}
        {question.type === 'rating' && (
          <div className="space-y-3 ps-2 border-s-2 border-border-subtle pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Rating Style</label>
                <Select
                  size="sm"
                  value={question.ratingStyle || 'stars'}
                  onValueChange={(val) =>
                    onUpdateQuestion(question.id, { ratingStyle: val as 'stars' | 'linear-scale' })
                  }
                  triggerClassName="h-8 text-xs font-medium"
                  aria-label="Rating Style"
                >
                  <SelectItem value="stars" startContent={<StarIcon size={14} />}>
                    Star Rating
                  </SelectItem>
                  <SelectItem value="linear-scale">Linear Scale</SelectItem>
                </Select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Maximum Value</label>
                <Select
                  size="sm"
                  value={String(question.ratingMax || 5)}
                  onValueChange={(val) => onUpdateQuestion(question.id, { ratingMax: Number(val) })}
                  triggerClassName="h-8 text-xs font-medium"
                  aria-label="Maximum Value"
                >
                  <SelectItem value="5">1 to 5</SelectItem>
                  <SelectItem value="10">1 to 10</SelectItem>
                </Select>
              </div>
            </div>

            {question.ratingStyle === 'linear-scale' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Min Label (e.g. Poor)</label>
                  <Input
                    placeholder="Not likely"
                    value={question.ratingMinLabel || ''}
                    onChange={(e) => onUpdateQuestion(question.id, { ratingMinLabel: e.target.value })}
                    className="h-8 text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Max Label (e.g. Excellent)</label>
                  <Input
                    placeholder="Very likely"
                    value={question.ratingMaxLabel || ''}
                    onChange={(e) => onUpdateQuestion(question.id, { ratingMaxLabel: e.target.value })}
                    className="h-8 text-xs mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* File Upload Configuration */}
        {question.type === 'file-upload' && (
          <div className="space-y-2 ps-2 border-s-2 border-border-subtle pt-1">
            <label className="text-[11px] font-semibold text-muted-foreground">
              Max File Size (MB)
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={50}
                value={question.maxFileSizeMb || 10}
                onChange={(e) => onUpdateQuestion(question.id, { maxFileSizeMb: Number(e.target.value) || 10 })}
                className="h-8 w-28 text-xs"
              />
              <span className="text-xs text-muted-foreground">MB (Default: 10MB)</span>
            </div>
          </div>
        )}

        {/* Options / Ranking Items Editor */}
        {hasOptions && (
          <div className="space-y-2.5 ps-2 border-s-2 border-border-subtle pt-1">
            <label className="text-xs font-semibold text-muted-foreground">
              {question.type === 'ranking' ? 'Items to Rank (Drag order preview)' : 'Options'}
            </label>
            {(question.options || []).map((option, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 shrink-0 ${
                    question.type === 'multiple-choice' || question.type === 'checkbox'
                      ? 'rounded-xs bg-muted-foreground/50'
                      : 'rounded-full bg-muted-foreground/50'
                  }`}
                />
                <Input
                  value={option}
                  onChange={(e) => onUpdateOption(question.id, optIdx, e.target.value)}
                  placeholder={`${question.type === 'ranking' ? 'Item' : 'Option'} ${optIdx + 1}`}
                  className="h-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => onDeleteOption(question.id, optIdx)}
                  aria-label={`Remove option ${optIdx + 1}`}
                  className="p-1 text-muted-foreground hover:text-destructive rounded-md"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onAddOption(question.id)}
              className="h-8 text-xs text-primary font-medium ps-0 hover:bg-transparent hover:underline"
            >
              <PlusIcon size={14} aria-hidden="true" />
              <span>Add {question.type === 'ranking' ? 'Item' : 'Option'}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
