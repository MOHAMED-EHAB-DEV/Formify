'use client'

import { useState, useMemo, useEffect } from 'react';
import { useFormContext, useForm, FormProvider } from 'react-hook-form';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from "sonner"
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { saveOrUpdateForm } from '@/lib/actions/forms';
import { getUser } from '@/lib/actions/user';

type QuestionType = 'text' | 'multiple-choice';

interface Question {
    id: string;
    type: QuestionType;
    label: string;
    options?: string[];
}

interface FormBuilderProps {
    email?: string;
    initialData?: {
        id?: string;
        title: string;
        description: string;
        questions: Question[];
    };
}


export default function FormBuilder({ email, initialData }: FormBuilderProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const router = useRouter();

    const addQuestion = (type: QuestionType) => {
        setQuestions((prev) => [
            ...prev,
            {
                id: nanoid(),
                type,
                label: '',
                options: type === 'multiple-choice' ? [''] : undefined
            }
        ]);
    };

    const deleteQuestion = (id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
    };

    const updateQuestion = (id: string, field: keyof Question, value: any) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
        );
    };

    const updateOption = (qid: string, index: number, value: string) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === qid && q.options
                    ? {
                        ...q,
                        options: q.options.map((opt, i) => (i === index ? value : opt))
                    }
                    : q
            )
        );
    };

    const addOption = (qid: string) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === qid && q.options ? { ...q, options: [...q.options, ''] } : q
            )
        );
    };

    const changeQuestionType = (id: string) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === id
                    ? {
                        ...q,
                        type: q.type === 'text' ? 'multiple-choice' : 'text',
                        options: q.type === 'text' ? [''] : undefined
                    }
                    : q
            )
        );
    };

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description);
            setQuestions(initialData.questions);
        }
    }, [initialData]);


    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over?.id) return;
        const oldIndex = questions.findIndex((q) => q.id === active.id);
        const newIndex = questions.findIndex((q) => q.id === over.id);
        setQuestions((items) => arrayMove(items, oldIndex, newIndex));
    };

    const schema = useMemo(() => {
        const shape: Record<string, z.ZodTypeAny> = {};
        for (const q of questions) {
            shape[q.id] = z.string().min(1, 'Required');
        }
        return z.object(shape);
    }, [questions]);

    const form = useForm({
        resolver: zodResolver(schema),
        mode: 'onSubmit'
    });

    const onSubmit = async (data: any) => {
        const user = await getUser({ email: email as string });
        const payload = {
            formId: initialData?.id,
            title,
            description,
            creatorId: user?._id as string,
            questions: questions.map((q) => ({
                id: q.id,
                type: q.type,
                label: q.label,
                options: q.options || []
            })) as QuestionInput[],
        };

        const res = await saveOrUpdateForm(payload);
        if (res.success && res.updated) {
            toast.success('Form updated successfully');
            router.push(`/forms/`);
        } else if (res.success && res.created) {
            toast.success('Form created successfully');
            router.push(`/forms/${res.formId}`);
        } else {
            alert(res.error || 'Failed to save form');
        }
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center w-full space-y-8">
                    <div className="w-full max-w-3xl">
                        <Input
                            placeholder="Form Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-lg sm:text-xl w-full"
                        />
                        <Textarea
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px] w-full mt-4"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row w-full max-w-3xl gap-4">
                        <Button onClick={() => addQuestion('text')} type="button" className="w-full sm:w-1/2">
                            Add Text
                        </Button>
                        <Button onClick={() => addQuestion('multiple-choice')} type="button" className="w-full sm:w-1/2">
                            Add MCQ
                        </Button>
                    </div>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-6 max-w-3xl mx-auto">
                            {questions.map((q) => (
                                <SortableQuestionCard
                                    key={q.id}
                                    question={q}
                                    updateQuestion={updateQuestion}
                                    updateOption={updateOption}
                                    addOption={addOption}
                                    deleteQuestion={deleteQuestion}
                                    changeType={changeQuestionType}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <div className="flex justify-center w-full">
                    <Button type="submit" onClick={onSubmit} className="w-full max-w-3xl">
                        Submit
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}

function SortableQuestionCard({
    question,
    updateQuestion,
    updateOption,
    addOption,
    deleteQuestion,
    changeType
}: {
    question: Question;
    updateQuestion: (id: string, field: keyof Question, value: any) => void;
    updateOption: (qid: string, index: number, value: string) => void;
    addOption: (qid: string) => void;
    deleteQuestion: (id: string) => void;
    changeType: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    const { register } = useFormContext();

    return (
        <Card ref={setNodeRef} style={style} className="cursor-default w-full">
            <CardContent className="space-y-6 py-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Input
                        placeholder="Enter question..."
                        value={question.label}
                        onChange={(e) => updateQuestion(question.id, 'label', e.target.value)}
                        className="w-full"
                    />

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Button variant="ghost" type="button" {...attributes} {...listeners} className="w-full sm:w-auto">
                            ⠿
                        </Button>

                        <Button variant="outline" type="button" onClick={() => changeType(question.id)} className="w-full sm:w-auto">
                            Switch Type
                        </Button>
                        <Button variant="destructive" type="button" onClick={() => deleteQuestion(question.id)} className="w-full sm:w-auto">
                            Delete
                        </Button>
                    </div>
                </div>

                {question.type === 'text' && (
                    <Input
                        {...register(question.id)}
                        placeholder="User response..."
                        className="w-full"
                    />
                )}

                {question.type === 'multiple-choice' && (
                    <div className="space-y-4">
                        {question.options?.map((opt, idx) => (
                            <Input
                                key={idx}
                                value={opt}
                                onChange={(e) => updateOption(question.id, idx, e.target.value)}
                                placeholder={`Option ${idx + 1}`}
                                className="w-full"
                            />
                        ))}
                    </div>
                )}

                {question.type === 'multiple-choice' && (
                    <Button variant="outline" size="sm" type="button" onClick={() => addOption(question.id)} className="w-full sm:w-auto">
                        Add Option
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
