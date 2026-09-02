'use client';

import React from 'react';
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
import {
  PlusIcon,
  TrashIcon,
  GripVerticalIcon,
  FileTextIcon,
  ListIcon,
  CheckCircleIcon,
} from '@/components/ui/svgs/icons';
import { useFormBuilder } from '@/hooks/use-form-builder';
import type { Question, FormStatus } from '@/types';

interface FormBuilderProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    questions?: Question[];
    status?: FormStatus;
  };
}

export function FormBuilder({ initialData }: FormBuilderProps) {
  const {
    title,
    setTitle,
    description,
    setDescription,
    questions,
    isSaving,
    addQuestion,
    deleteQuestion,
    updateQuestionLabel,
    changeQuestionType,
    addOption,
    updateOption,
    deleteOption,
    handleDragEnd,
    handleSave,
  } = useFormBuilder(initialData);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Action Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
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
                  className="min-h-[80px]"
                />
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
                    onDelete={deleteQuestion}
                    onAddOption={addOption}
                    onUpdateOption={updateOption}
                    onDeleteOption={deleteOption}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add Question Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => addQuestion('text')}
              className="flex-1 border-dashed"
            >
              <FileTextIcon size={16} aria-hidden="true" />
              <span>Add Short Answer</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => addQuestion('multiple-choice')}
              className="flex-1 border-dashed"
            >
              <ListIcon size={16} aria-hidden="true" />
              <span>Add Multiple Choice</span>
            </Button>
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
              </div>

              <div className="space-y-4 pt-2">
                {questions.map((q, idx) => (
                  <div key={q.id} className="rounded-xl border border-border-subtle bg-muted/30 p-4 space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      {idx + 1}. {q.label || <span className="italic text-muted-foreground">Untitled question</span>}
                    </p>

                    {q.type === 'text' ? (
                      <div className="h-9 w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-muted-foreground">
                        User text response...
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        {(q.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2.5 text-xs text-foreground">
                            <span className="h-3.5 w-3.5 rounded-full border border-primary/40 bg-card shrink-0" />
                            <span>{opt || `Option ${optIdx + 1}`}</span>
                          </div>
                        ))}
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
  onDelete,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
}: {
  question: Question;
  index: number;
  onUpdateLabel: (id: string, label: string) => void;
  onChangeType: (id: string, type: 'text' | 'multiple-choice') => void;
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

  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder"
              className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            >
              <GripVerticalIcon size={18} />
            </button>
            <span className="text-xs font-semibold text-muted-foreground">
              Q{index + 1}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={question.type}
              onChange={(e) => onChangeType(question.id, e.target.value as 'text' | 'multiple-choice')}
              className="h-8 rounded-md border border-input bg-card px-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="text">Short Answer</option>
              <option value="multiple-choice">Multiple Choice</option>
            </select>

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

        <div className="space-y-1.5">
          <Input
            placeholder="Type your question here..."
            value={question.label}
            onChange={(e) => onUpdateLabel(question.id, e.target.value)}
            className="font-medium"
          />
        </div>

        {question.type === 'multiple-choice' && (
          <div className="space-y-2.5 ps-2 border-s-2 border-border-subtle pt-1">
            <label className="text-xs font-semibold text-muted-foreground">Options</label>
            {(question.options || []).map((option, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50 shrink-0" />
                <Input
                  value={option}
                  onChange={(e) => onUpdateOption(question.id, optIdx, e.target.value)}
                  placeholder={`Option ${optIdx + 1}`}
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
              <span>Add Option</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
