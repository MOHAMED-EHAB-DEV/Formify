'use client';

import { useState } from 'react';
import { submitResponse } from '@/lib/actions/forms';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Question {
    id: string;
    label: string;
    type: 'text' | 'multiple-choice';
    options?: string[];
}

export default function SubmitForm({
    form,
    isOwner,
}: {
    form: any;
    isOwner: boolean;
}) {
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(0);

    const questions: Question[] = form.questions;
    const currentQuestion = questions[step];

    const handleChange = (qid: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [qid]: value }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        const result = await submitResponse(form.id as string, answers);
        setSubmitting(false);

        if (result.success) {
            setSubmitted(true);
        } else {
            toast.error('Submission failed.');
        }
    };

    const handleNext = () => {
        if (step < questions.length - 1) {
            setStep((prev) => prev + 1);
        }
    };

    if (submitted) {
        return (
            <div className="p-8 text-center w-full min-h-screen h-full flex justify-center items-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-xl mx-auto bg-green-100 text-green-800 p-6 rounded-xl shadow-md"
                >
                    <h2 className="text-2xl font-bold mb-2">🎉 Thank you!</h2>
                    <p>Your response has been submitted successfully.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <main className="min-h-screen relative bg-background px-4 sm:px-6 lg:px-8 pb-32">
            {/* Title & Description */}
            <div className="text-center max-w-2xl mx-auto pt-6">
                <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
                <p className="mb-4 text-muted-foreground">{form.description}</p>

                {!isOwner && form.status !== 'published' && (
                    <div className="text-red-500 text-center mb-4">
                        This form is currently not published.
                    </div>
                )}
            </div>

            {/* Question Centered Full Width */}
            <div className="flex justify-center items-center min-h-[60vh]">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-4xl px-4"
                >
                    <Card className="w-full">
                        <CardContent className="py-6 px-4 sm:px-6 space-y-4">
                            <label className="block font-semibold text-lg">{currentQuestion.label}</label>

                            {currentQuestion.type === 'text' && (
                                <Input
                                    className="w-full"
                                    placeholder="Type your answer"
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(e) => handleChange(currentQuestion.id, e.target.value)}
                                />
                            )}

                            {currentQuestion.type === 'multiple-choice' && (
                                <div className="space-y-2">
                                    {currentQuestion.options?.map((opt, idx) => (
                                        <label key={idx} className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name={currentQuestion.id}
                                                value={opt}
                                                checked={answers[currentQuestion.id] === opt}
                                                onChange={() => handleChange(currentQuestion.id, opt)}
                                            />
                                            <span>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Sticky Action Buttons */}
            <div className="fixed bottom-4 right-4 sm:right-8 z-50 flex gap-4">
                {step < questions.length - 1 ? (
                    <Button onClick={handleNext} className="w-28">
                        Next
                    </Button>
                ) : (
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button onClick={handleSubmit} disabled={submitting} className="w-28">
                            {submitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
