'use client';

import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { saveOrUpdateForm } from '@/actions/forms';
import type { Question, QuestionType, FormStatus } from '@/types';

interface InitialFormData {
  id?: string;
  title?: string;
  description?: string;
  questions?: Question[];
  status?: FormStatus;
}

export function useFormBuilder(initialData?: InitialFormData) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions && initialData.questions.length > 0
      ? initialData.questions
      : [
          {
            id: nanoid(10),
            type: 'text',
            label: '',
            options: undefined,
          },
        ]
  );
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = useCallback((type: QuestionType) => {
    setQuestions((prev) => [
      ...prev,
      {
        id: nanoid(10),
        type,
        label: '',
        options: type === 'multiple-choice' ? ['Option 1', 'Option 2'] : undefined,
      },
    ]);
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setQuestions((prev) => {
      if (prev.length <= 1) {
        toast.error('Form must have at least one question');
        return prev;
      }
      return prev.filter((q) => q.id !== id);
    });
  }, []);

  const updateQuestionLabel = useCallback((id: string, label: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, label } : q)));
  }, []);

  const changeQuestionType = useCallback((id: string, type: QuestionType) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              type,
              options: type === 'multiple-choice' ? (q.options?.length ? q.options : ['Option 1', 'Option 2']) : undefined,
            }
          : q
      )
    );
  }, []);

  const addOption = useCallback((questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || !q.options) return q;
        return {
          ...q,
          options: [...q.options, `Option ${q.options.length + 1}`],
        };
      })
    );
  }, []);

  const updateOption = useCallback((questionId: string, index: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || !q.options) return q;
        const newOptions = [...q.options];
        newOptions[index] = value;
        return {
          ...q,
          options: newOptions,
        };
      })
    );
  }, []);

  const deleteOption = useCallback((questionId: string, index: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || !q.options) return q;
        if (q.options.length <= 1) {
          toast.error('Multiple choice question must have at least one option');
          return q;
        }
        return {
          ...q,
          options: q.options.filter((_, i) => i !== index),
        };
      })
    );
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((q) => q.id === active.id);
        const newIndex = items.findIndex((q) => q.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const handleSave = async (status: FormStatus = 'draft') => {
    if (!title.trim()) {
      toast.error('Please enter a form title');
      return;
    }

    const emptyQuestion = questions.find((q) => !q.label.trim());
    if (emptyQuestion) {
      toast.error('Please fill in all question labels');
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveOrUpdateForm({
        formId: initialData?.id,
        title: title.trim(),
        description: description.trim(),
        status,
        questions: questions.map((q) => ({
          id: q.id,
          type: q.type,
          label: q.label.trim(),
          options: q.options?.map((opt) => opt.trim()).filter(Boolean),
        })),
      });

      if (res.success) {
        toast.success(status === 'published' ? 'Form published!' : 'Form saved as draft');
        router.push(`/forms/details/${res.data.formId}`);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to save form');
      }
    } catch {
      toast.error('An error occurred while saving the form');
    } finally {
      setIsSaving(false);
    }
  };

  return {
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
  };
}
