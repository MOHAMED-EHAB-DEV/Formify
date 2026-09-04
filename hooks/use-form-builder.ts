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
  closeDate?: Date | string | null;
}

const OPTION_BASED_TYPES: QuestionType[] = ['multiple-choice', 'checkbox', 'dropdown', 'ranking'];

export function useFormBuilder(initialData?: InitialFormData) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [closeDate, setCloseDate] = useState<string>(
    initialData?.closeDate ? new Date(initialData.closeDate).toISOString().slice(0, 16) : ''
  );
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions && initialData.questions.length > 0
      ? initialData.questions
      : [
          {
            id: nanoid(10),
            type: 'text',
            label: '',
            required: false,
          },
        ]
  );
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = useCallback((type: QuestionType) => {
    setQuestions((prev) => {
      const isOptionBased = OPTION_BASED_TYPES.includes(type);
      const isRanking = type === 'ranking';
      const isRating = type === 'rating';
      const isFileUpload = type === 'file-upload';

      return [
        ...prev,
        {
          id: nanoid(10),
          type,
          label: '',
          required: false,
          placeholder: '',
          options: isRanking
            ? ['Item 1', 'Item 2', 'Item 3']
            : isOptionBased
            ? ['Option 1', 'Option 2']
            : undefined,
          ratingStyle: isRating ? 'stars' : undefined,
          ratingMax: isRating ? 5 : undefined,
          ratingMinLabel: isRating ? '' : undefined,
          ratingMaxLabel: isRating ? '' : undefined,
          maxFileSizeMb: isFileUpload ? 10 : undefined,
          allowedFileTypes: isFileUpload ? [] : undefined,
        },
      ];
    });
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

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  }, []);

  const updateQuestionLabel = useCallback((id: string, label: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, label } : q)));
  }, []);

  const toggleQuestionRequired = useCallback((id: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, required: !q.required } : q)));
  }, []);

  const changeQuestionType = useCallback((id: string, type: QuestionType) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;

        const isTargetOptionBased = OPTION_BASED_TYPES.includes(type);
        const existingOptions = q.options?.length ? q.options : ['Option 1', 'Option 2'];

        return {
          ...q,
          type,
          options: isTargetOptionBased ? existingOptions : undefined,
          ratingStyle: type === 'rating' ? q.ratingStyle || 'stars' : undefined,
          ratingMax: type === 'rating' ? q.ratingMax || 5 : undefined,
          ratingMinLabel: type === 'rating' ? q.ratingMinLabel || '' : undefined,
          ratingMaxLabel: type === 'rating' ? q.ratingMaxLabel || '' : undefined,
          maxFileSizeMb: type === 'file-upload' ? q.maxFileSizeMb || 10 : undefined,
          allowedFileTypes: type === 'file-upload' ? q.allowedFileTypes || [] : undefined,
        };
      })
    );
  }, []);

  const addOption = useCallback((questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || !q.options) return q;
        const prefix = q.type === 'ranking' ? 'Item' : 'Option';
        return {
          ...q,
          options: [...q.options, `${prefix} ${q.options.length + 1}`],
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
        if (q.options.length <= 2 && q.type === 'ranking') {
          toast.error('Ranking question must have at least 2 items');
          return q;
        }
        if (q.options.length <= 1) {
          toast.error('Question must have at least one option');
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
        closeDate: closeDate ? new Date(closeDate).toISOString() : null,
        questions: questions.map((q) => ({
          id: q.id,
          type: q.type,
          label: q.label.trim(),
          description: q.description?.trim() || '',
          required: Boolean(q.required),
          placeholder: q.placeholder?.trim() || '',
          options: q.options?.map((opt) => opt.trim()).filter(Boolean),
          ratingStyle: q.ratingStyle,
          ratingMax: q.ratingMax,
          ratingMinLabel: q.ratingMinLabel?.trim(),
          ratingMaxLabel: q.ratingMaxLabel?.trim(),
          maxFileSizeMb: q.maxFileSizeMb,
          allowedFileTypes: q.allowedFileTypes,
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
  };
}
