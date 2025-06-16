'use client';

import { Card } from "@/components/ui/card";
import { Users, BarChart2, List, User, AlertCircle, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MoreOptionsMenu from "./MoreOptionsMenu";
import { camelize } from "@/lib/utils";

interface FormDetailsProps {
    totalResponses: number;
    id: string;
    responses: any[];
    status: string;
}

export function FormDetails({
    totalResponses,
    id,
    responses,
    status
}: FormDetailsProps) {
    const hasResponses = responses && responses.length > 0;

    const calculateAverageTime = () => {
        if (!hasResponses || responses.length < 2) return 0;

        const times = responses
            .map(response => {
                const submittedAt = new Date(response.submittedAt);
                return isNaN(submittedAt.getTime()) ? null : submittedAt.getTime();
            })
            .filter((time): time is number => time !== null)
            .sort((a, b) => a - b);

        if (times.length < 2) return 0;

        const timeDifferences = [];
        for (let i = 1; i < times.length; i++) {
            const diff = times[i] - times[i - 1];
            if (diff > 0) {
                timeDifferences.push(diff);
            }
        }

        if (timeDifferences.length === 0) return 0;

        const averageTimeMs = timeDifferences.reduce((acc, curr) => acc + curr, 0) / timeDifferences.length;
        return Math.round(averageTimeMs / (1000 * 60));
    };

    const formatTime = (minutes: number) => {
        if (!minutes || isNaN(minutes)) return 'No data';
        if (minutes < 1) return 'Less than a minute';
        if (minutes === 1) return '1 minute';
        return `${minutes} minutes`;
    };

    return (
        <div className="w-full p-4 sm:p-6 bg-background">
            <div className="flex flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Form Analytics</h2>

                <MoreOptionsMenu id={id} status={status} />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                <Card className="p-4 sm:p-6 w-full sm:w-1/4">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Total Responses</h3>
                    </div>
                    <p className="mt-2 text-xl sm:text-2xl font-bold">{totalResponses}</p>
                </Card>
                <Card className="p-4 sm:p-6 w-full sm:w-1/4">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Status</h3>
                    </div>
                    <p className="mt-2 text-xl sm:text-2xl font-bold">{camelize(status)}</p>
                </Card>
            </div>

            <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-0">
                    <TabsTrigger value="summary" className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Summary</span>
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        <span className="hidden sm:inline">Questions</span>
                    </TabsTrigger>
                    <TabsTrigger value="individuals" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Individuals</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="mt-6">
                    <Card className="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold mb-4">Response Summary</h3>
                        {hasResponses ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                                    <p className="text-xl sm:text-2xl font-bold">{(responses.length / totalResponses * 100).toFixed(1)}%</p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Average Time Between Responses</p>
                                    </div>
                                    <p className="text-xl sm:text-2xl font-bold">{formatTime(calculateAverageTime())}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                <h4 className="text-lg font-medium mb-2">No Responses Yet</h4>
                                <p className="text-muted-foreground">Share your form to start collecting responses</p>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="questions" className="mt-6">
                    <Card className="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold mb-4">Question Analysis</h3>
                        {hasResponses ? (
                            <div className="space-y-6 sm:space-y-8">
                                {Object.values(
                                    responses.reduce((acc: { [key: string]: { id: string, question: string } }, response) => {
                                        response.answers.forEach((answer: any) => {
                                            if (!acc[answer.questionId]) {
                                                acc[answer.questionId] = {
                                                    id: answer.questionId,
                                                    question: answer.question
                                                };
                                            }
                                        });
                                        return acc;
                                    }, {})
                                ).map((question) => {
                                    const questionResponses = responses
                                        .map(response => {
                                            const answer = response.answers.find((a: any) => a.questionId === question.id);
                                            if (answer) {
                                                return {
                                                    ...answer,
                                                    submittedAt: response.submittedAt
                                                };
                                            }
                                            return null;
                                        })
                                        .filter(Boolean);

                                    const formatDate = (dateString: string) => {
                                        try {
                                            const date = new Date(dateString);
                                            if (isNaN(date.getTime())) return 'Invalid date';
                                            return date.toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            });
                                        } catch (error) {
                                            return 'Invalid date';
                                        }
                                    };

                                    return (
                                        <div key={question.id} className="border rounded-lg overflow-hidden">
                                            <div className="p-4 bg-muted">
                                                <h4 className="font-medium text-base sm:text-lg">{question.question}</h4>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {questionResponses.length} {questionResponses.length === 1 ? 'response' : 'responses'}
                                                </p>
                                            </div>
                                            <div className="p-4">
                                                {questionResponses.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {questionResponses.map((response: any, index: number) => (
                                                            <div key={index} className="p-3 bg-muted/50 rounded-md">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                                                    <span className="font-medium">
                                                                        {response.value || response.answer || 'No answer provided'}
                                                                    </span>
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {formatDate(response.submittedAt)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">No responses for this question</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                <h4 className="text-lg font-medium mb-2">No Question Data Available</h4>
                                <p className="text-muted-foreground">Question analysis will appear once responses are collected</p>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="individuals" className="mt-6">
                    <Card className="p-4 sm:p-6">
                        <h3 className="text-lg font-semibold mb-4">Individual Responses</h3>
                        {hasResponses ? (
                            <div className="space-y-4">
                                {responses.map((response: any, index: number) => {
                                    const formatDate = (dateString: string) => {
                                        try {
                                            const date = new Date(dateString);
                                            if (isNaN(date.getTime())) return 'Invalid date';
                                            return date.toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            });
                                        } catch (error) {
                                            return 'Invalid date';
                                        }
                                    };

                                    return (
                                        <div key={index} className="p-4 bg-muted rounded-lg">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
                                                <h4 className="font-medium">Response #{index + 1}</h4>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDate(response.submittedAt)}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {response.answers?.map((answer: any, ansIndex: number) => (
                                                    <div key={ansIndex} className="p-3 bg-background rounded-md">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-sm font-medium text-muted-foreground">
                                                                {answer.question}
                                                            </span>
                                                            <span className="text-sm break-words">
                                                                {answer.value || answer.answer || 'No answer provided'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                <h4 className="text-lg font-medium mb-2">No Individual Responses</h4>
                                <p className="text-muted-foreground">Individual responses will appear here once people start filling out your form</p>
                            </div>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
