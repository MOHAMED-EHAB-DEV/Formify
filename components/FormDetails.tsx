'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/dropdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  UsersIcon,
  BarChartIcon,
  ListIcon,
  UserIcon,
  PencilIcon,
  ShareIcon,
  TrashIcon,
  MoreVerticalIcon,
  ArchiveIcon,
  RssIcon,
  ExternalLinkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertCircleIcon,
  ClockIcon,
  StarIcon,
  FileTextIcon,
  UploadCloudIcon,
  DownloadIcon,
} from '@/components/ui/svgs/icons';
import { deleteForm, changeStatus } from '@/actions/forms';
import { useFormSocket } from '@/hooks/use-form-socket';
import { formatDate, camelize, truncateFileName } from '@/lib/utils';
import { ShareModal } from '@/components/ShareModal';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import type { Form, FormResponse, FormStatus, AnswerValue, FileAnswer } from '@/types';

async function handleDownloadFile(url: string, filename: string) {
  try {
    toast.loading('Starting download...', { id: `dl-${filename}` });
    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    const res = await fetch(downloadUrl);
    if (!res.ok) throw new Error('Download request failed');

    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);

    toast.success('Downloaded successfully', { id: `dl-${filename}` });
  } catch (error) {
    console.error('Direct download error:', error);
    // Fallback: trigger download endpoint directly without navigating away
    window.location.href = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    toast.dismiss(`dl-${filename}`);
  }
}

function stripMarkdownForCsv(text: string): string {
  if (!text) return '';
  return text
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[#*~_>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatCsvDateTime(dateVal: Date | string | number | undefined): string {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const mins = pad(d.getMinutes());
  const secs = pad(d.getSeconds());
  return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
}

function escapeCsvValue(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);

  // Mitigate CSV Formula Injection in spreadsheet tools
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Double quotes escaping
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

function formatAnswerForCsv(
  answer: AnswerValue | undefined,
  question: Form['questions'][number]
): string {
  if (answer === undefined || answer === null || answer === '') return '';

  if (question.type === 'ranking' && Array.isArray(answer)) {
    return answer.map((item, idx) => `${idx + 1}. ${item}`).join(' | ');
  }

  if (Array.isArray(answer)) {
    return answer.join(', ');
  }

  if (typeof answer === 'object' && answer !== null) {
    if ('url' in answer) {
      const file = answer as FileAnswer;
      return file.url ? `${file.name || 'file'} (${file.url})` : '';
    }
  }

  if (question.type === 'rating' && typeof answer === 'number') {
    return `${answer}/${question.ratingMax || 5}`;
  }

  return String(answer).trim();
}

function exportResponsesToCSV(
  formTitle: string,
  questions: Form['questions'],
  responsesList: FormResponse[]
) {
  if (!responsesList.length) {
    toast.error('No responses available to export');
    return;
  }

  // 1. Column Headers
  const headers = [
    'Submission #',
    'Submission Date (Local)',
    'Submission Date (UTC)',
    ...questions.map((q, idx) => {
      const cleanLabel = stripMarkdownForCsv(q.label) || `Question ${idx + 1}`;
      let typeIndicator = '';
      if (q.type === 'rating') typeIndicator = ` [Rating /${q.ratingMax || 5}]`;
      else if (q.type === 'ranking') typeIndicator = ' [Ranking]';
      else if (q.type === 'file-upload') typeIndicator = ' [File]';
      else if (q.type === 'checkbox') typeIndicator = ' [Multi-Choice]';
      return `${cleanLabel}${typeIndicator}`;
    }),
  ];
  const headerRow = headers.map(escapeCsvValue).join(',');

  // 2. Sort chronologically (earliest to latest: #1 is first submission)
  const sortedResponses = [...responsesList].sort((a, b) => {
    const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return timeA - timeB;
  });

  // 3. Data Rows
  const rows = sortedResponses.map((resItem, index) => {
    const rowNum = index + 1;
    const localDate = formatCsvDateTime(resItem.submittedAt);
    const utcDate = resItem.submittedAt ? new Date(resItem.submittedAt).toISOString() : '';

    const answers = questions.map((q) => {
      const matched = resItem.answers?.find((a) => a.questionId === q.id);
      return formatAnswerForCsv(matched?.answer, q);
    });

    return [
      escapeCsvValue(rowNum),
      escapeCsvValue(localDate),
      escapeCsvValue(utcDate),
      ...answers.map(escapeCsvValue),
    ].join(',');
  });

  // 4. Build CSV with UTF-8 BOM for Excel & CRLF line breaks
  const csvBody = '\uFEFF' + [headerRow, ...rows].join('\r\n');
  const blob = new Blob([csvBody], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  const dateStamp = new Date().toISOString().slice(0, 10);
  const cleanTitle = (formTitle || 'form')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 30);

  link.href = downloadUrl;
  link.setAttribute('download', `${cleanTitle}_responses_${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);

  toast.success(`Exported ${sortedResponses.length} responses to CSV`);
}

export function FormDetails({ form }: { form: Form }) {
  const router = useRouter();

  const [responses, setResponses] = useState<FormResponse[]>(form.responses || []);
  const [currentStatus, setCurrentStatus] = useState<FormStatus>(form.status);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const responsesPerPage = 10;

  const isClosed = form.closeDate ? new Date() > new Date(form.closeDate) : false;

  const { isConnected } = useFormSocket({
    formId: form.id,
    onNewResponse: (data) => {
      setResponses((prev) => {
        if (data.response?.id && prev.some((r) => r.id === data.response.id)) {
          return prev;
        }
        return [data.response, ...prev];
      });
    },
  });

  const handleStatusChange = async (newStatus: FormStatus) => {
    try {
      const res = await changeStatus(form.id, newStatus);
      if (res.success) {
        setCurrentStatus(newStatus);
        toast.success(`Form is now ${newStatus}`);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteForm(form.id);
      if (res.success) {
        toast.success('Form deleted successfully');
        router.push('/forms');
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error('Failed to delete form');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const totalResponses = responses.length;
  const paginatedResponses = responses.slice((currentPage - 1) * responsesPerPage, currentPage * responsesPerPage);
  const totalPages = Math.ceil(totalResponses / responsesPerPage) || 1;

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/forms" className="hover:text-foreground transition-colors">
              My Forms
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground truncate max-w-50">
              {form.title}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {form.title}
            </h1>
            <Badge
              variant={
                isClosed
                  ? 'warning'
                  : currentStatus === 'published'
                  ? 'success'
                  : currentStatus === 'archived'
                  ? 'warning'
                  : 'secondary'
              }
              dot
            >
              {isClosed ? 'Closed (Deadline Passed)' : camelize(currentStatus)}
            </Badge>

            {form.closeDate && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1">
                <ClockIcon size={12} />
                <span>Deadline: {new Date(form.closeDate).toLocaleDateString()}</span>
              </Badge>
            )}

            {isConnected && (
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot me-1" />
                Live Sync
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button type="button" variant="outline" size="sm" onClick={() => setShareModalOpen(true)}>
            <ShareIcon size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Share Form</span>
          </Button>

          <Link href={`/forms/${form.id}`} target="_blank">
            <Button type="button" variant="outline" size="sm">
              <ExternalLinkIcon size={16} aria-hidden="true" />
              <span className="hidden sm:inline">View Public</span>
            </Button>
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportResponsesToCSV(form.title, form.questions, responses)}
            disabled={totalResponses === 0}
            title={totalResponses === 0 ? 'No responses yet' : 'Export responses to CSV'}
          >
            <DownloadIcon size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          <Dropdown
            trigger={
              <button
                type="button"
                aria-label="More options"
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
              >
                <MoreVerticalIcon size={18} />
              </button>
            }
          >
            <DropdownItem
              onClick={() => exportResponsesToCSV(form.title, form.questions, responses)}
              disabled={totalResponses === 0}
            >
              <DownloadIcon size={16} />
              <span>Export CSV</span>
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem onClick={() => router.push(`/forms/edit/${form.id}`)}>
              <PencilIcon size={16} />
              <span>Edit Questions</span>
            </DropdownItem>
            <DropdownSeparator />
            {currentStatus === 'published' ? (
              <DropdownItem onClick={() => handleStatusChange('archived')}>
                <ArchiveIcon size={16} />
                <span>Archive Form</span>
              </DropdownItem>
            ) : (
              <DropdownItem onClick={() => handleStatusChange('published')}>
                <RssIcon size={16} />
                <span>Publish Form</span>
              </DropdownItem>
            )}
            <DropdownSeparator />
            <DropdownItem destructive onClick={() => setDeleteDialogOpen(true)}>
              <TrashIcon size={16} />
              <span>Delete Form</span>
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Metric Stats Cards */}
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <UsersIcon size={16} className="text-primary" />
              <span>Total Responses</span>
            </dt>
            <dd className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {totalResponses}
            </dd>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ListIcon size={16} className="text-primary" />
              <span>Questions</span>
            </dt>
            <dd className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {form.questions.length}
            </dd>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ClockIcon size={16} className="text-primary" />
              <span>Last Modified</span>
            </dt>
            <dd className="mt-2 text-sm font-semibold text-foreground pt-1 truncate">
              {formatDate(form.updatedAt)}
            </dd>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <BarChartIcon size={16} className="text-primary" />
              <span>Status</span>
            </dt>
            <dd className="mt-2 text-base font-semibold text-foreground pt-0.5">
              {isClosed ? 'Expired' : camelize(currentStatus)}
            </dd>
          </CardContent>
        </Card>
      </dl>

      {/* Analytics Tabs */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="summary">
            <BarChartIcon size={16} />
            <span>Summary</span>
          </TabsTrigger>
          <TabsTrigger value="questions">
            <ListIcon size={16} />
            <span>Questions</span>
          </TabsTrigger>
          <TabsTrigger value="individuals">
            <UserIcon size={16} />
            <span>Responses ({totalResponses})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Summary */}
        <TabsContent value="summary">
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-6">
              <h3 className="text-base font-semibold text-foreground">Activity Summary</h3>
              {totalResponses > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border-subtle bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">
                      Recent Activity Distribution
                    </p>
                    <div className="h-32 flex items-end gap-2 pt-4">
                      {responses.slice(0, 12).reverse().map((r, i) => (
                        <div key={r.id || i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div
                            className="w-full max-w-7 rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                            style={{ height: `${Math.max(20, ((i + 1) / Math.min(12, totalResponses)) * 100)}%` }}
                            title={`Submission on ${formatDate(r.submittedAt)}`}
                          />
                          <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                            #{i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
                    <AlertCircleIcon size={26} />
                  </div>
                  <h4 className="text-base font-semibold text-foreground">No responses yet</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Publish and share your form to start collecting responses from users.
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShareModalOpen(true)} className="mt-5">
                    <ShareIcon size={14} />
                    <span>Share Form</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Question Breakdown */}
        <TabsContent value="questions">
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-5">
              <h3 className="text-base font-semibold text-foreground">Question Analysis</h3>
              {form.questions.map((question, qIdx) => {
                const answersForQ = responses
                  .flatMap((r) => r.answers)
                  .filter((a) => a.questionId === question.id);

                return (
                  <div key={question.id} className="p-4 rounded-xl border border-border-subtle bg-muted/20 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Question {qIdx + 1} • {camelize(question.type)}
                          {question.required && ' • Required'}
                        </span>
                        <div className="text-sm font-semibold text-foreground">
                          <MarkdownRenderer content={question.label} />
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {answersForQ.length} {answersForQ.length === 1 ? 'response' : 'responses'}
                      </Badge>
                    </div>

                    {/* Question Analysis Display */}
                    {answersForQ.length > 0 ? (
                      <div className="space-y-2 pt-2 border-t border-border-subtle">
                        {/* A. Multiple Choice & Dropdown Analysis */}
                        {['multiple-choice', 'dropdown'].includes(question.type) && (
                          <div className="space-y-2">
                            {question.options?.map((option, optIdx) => {
                              const count = answersForQ.filter((a) => a.answer === option).length;
                              const percentage = answersForQ.length > 0 ? Math.round((count / answersForQ.length) * 100) : 0;
                              return (
                                <div key={optIdx} className="space-y-1">
                                  <div className="flex justify-between text-xs text-foreground">
                                    <span>{option}</span>
                                    <span className="font-semibold text-muted-foreground">
                                      {count} ({percentage}%)
                                    </span>
                                  </div>
                                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* B. Checkbox (Multi-select) Analysis */}
                        {question.type === 'checkbox' && (
                          <div className="space-y-2">
                            {question.options?.map((option, optIdx) => {
                              const count = answersForQ.filter((a) => {
                                if (Array.isArray(a.answer)) return a.answer.includes(option);
                                return a.answer === option;
                              }).length;
                              const percentage = answersForQ.length > 0 ? Math.round((count / answersForQ.length) * 100) : 0;
                              return (
                                <div key={optIdx} className="space-y-1">
                                  <div className="flex justify-between text-xs text-foreground">
                                    <span>{option}</span>
                                    <span className="font-semibold text-muted-foreground">
                                      {count} selected ({percentage}%)
                                    </span>
                                  </div>
                                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* C. Rating Analysis */}
                        {question.type === 'rating' && (
                          <div className="space-y-3">
                            {/* Average Score Badge */}
                            {(() => {
                              const numericAnswers = answersForQ
                                .map((a) => Number(a.answer))
                                .filter((n) => !isNaN(n) && n > 0);
                              const avg = numericAnswers.length
                                ? (numericAnswers.reduce((acc, v) => acc + v, 0) / numericAnswers.length).toFixed(1)
                                : '0';
                              const max = question.ratingMax || 5;

                              return (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border-subtle">
                                  <div className="flex items-center gap-1.5 text-warning">
                                    <StarIcon size={24} fill="currentColor" />
                                    <span className="text-2xl font-bold text-foreground">{avg}</span>
                                    <span className="text-xs text-muted-foreground">/ {max}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Based on {numericAnswers.length} ratings
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Breakdown by value */}
                            <div className="space-y-1.5">
                              {Array.from({ length: question.ratingMax || 5 }, (_, i) => {
                                const val = (question.ratingMax || 5) - i;
                                const count = answersForQ.filter((a) => Number(a.answer) === val).length;
                                const percentage = answersForQ.length > 0 ? Math.round((count / answersForQ.length) * 100) : 0;

                                return (
                                  <div key={val} className="flex items-center gap-2 text-xs">
                                    <span className="w-8 font-medium text-muted-foreground text-end">{val}★</span>
                                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                                      <div
                                        className="h-full bg-warning rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <span className="w-12 text-[11px] text-muted-foreground text-end">
                                      {count} ({percentage}%)
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* D. Ranking Analysis */}
                        {question.type === 'ranking' && (
                          <div className="space-y-2">
                            <p className="text-[11px] text-muted-foreground">
                              Average ranked position (lower number = higher priority):
                            </p>
                            {(() => {
                              const items = question.options || [];
                              const itemScores = items.map((item) => {
                                const ranks = answersForQ
                                  .map((a) => (Array.isArray(a.answer) ? a.answer.indexOf(item) : -1))
                                  .filter((idx) => idx !== -1)
                                  .map((idx) => idx + 1);

                                const avgRank = ranks.length
                                  ? (ranks.reduce((acc, r) => acc + r, 0) / ranks.length).toFixed(2)
                                  : '—';

                                return { item, avgRank: Number(avgRank) || 999, display: avgRank };
                              });

                              itemScores.sort((a, b) => a.avgRank - b.avgRank);

                              return itemScores.map((score, rankIdx) => (
                                <div
                                  key={score.item}
                                  className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border-subtle text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
                                      #{rankIdx + 1}
                                    </span>
                                    <span className="font-medium text-foreground">{score.item}</span>
                                  </div>
                                  <span className="text-muted-foreground font-semibold">
                                    Avg Position: {score.display}
                                  </span>
                                </div>
                              ));
                            })()}
                          </div>
                        )}

                        {/* E. File Upload Analysis */}
                        {question.type === 'file-upload' && (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {answersForQ.map((ans, aIdx) => {
                              const file = ans.answer as FileAnswer;
                              if (!file?.url) return null;
                              return (
                                <div
                                  key={aIdx}
                                  className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border-subtle text-xs gap-2"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <FileTextIcon size={16} className="text-primary shrink-0" />
                                    <span
                                      className="font-medium text-foreground truncate"
                                      title={file.name}
                                    >
                                      {truncateFileName(file.name, 28)}
                                    </span>
                                    {file.size && (
                                      <span className="text-[10px] text-muted-foreground shrink-0">
                                        ({Math.round(file.size / 1024)} KB)
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadFile(file.url, file.name)}
                                    className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold shrink-0 ms-2 cursor-pointer"
                                  >
                                    <DownloadIcon size={14} />
                                    <span>Download</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* F. Standard Text / Number / Email / Date Answers */}
                        {['text', 'paragraph', 'number', 'date', 'email'].includes(question.type) && (
                          <div className="max-h-40 overflow-y-auto space-y-1.5 pe-1">
                            {answersForQ.map((ans, aIdx) => (
                              <div
                                key={aIdx}
                                className="p-2.5 rounded-lg bg-card border border-border-subtle text-xs text-foreground"
                              >
                                {String(ans.answer || '—')}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No answers collected for this question yet.</p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Individual Responses */}
        <TabsContent value="individuals">
          <Card>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground">Individual Responses</h3>
                {totalResponses > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => exportResponsesToCSV(form.title, form.questions, responses)}
                  >
                    <DownloadIcon size={14} aria-hidden="true" />
                    <span>Download CSV</span>
                  </Button>
                )}
              </div>

              {totalResponses > 0 ? (
                <>
                  <div className="space-y-3">
                    {paginatedResponses.map((response, rIdx) => {
                      const absoluteIndex = totalResponses - ((currentPage - 1) * responsesPerPage + rIdx);
                      return (
                        <details
                          key={response.id || rIdx}
                          className="group rounded-xl border border-border bg-card p-4 transition-colors open:bg-muted/10"
                        >
                          <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-foreground">
                            <div className="flex items-center gap-2">
                              <span>Response #{absoluteIndex}</span>
                              <span className="text-xs font-normal text-muted-foreground">
                                · {formatDate(response.submittedAt)}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-primary group-open:rotate-180 transition-transform">
                              ▼
                            </span>
                          </summary>

                          <div className="mt-4 space-y-3 border-t border-border-subtle pt-3">
                            {form.questions.map((q) => {
                              const ans = response.answers.find((a) => a.questionId === q.id);
                              return (
                                <div key={q.id} className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">
                                    <MarkdownRenderer content={q.label} />
                                  </div>
                                  <div className="text-sm font-semibold text-foreground">
                                    <FormattedAnswer answer={ans?.answer} type={q.type} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground">
                        Showing {(currentPage - 1) * responsesPerPage + 1} to{' '}
                        {Math.min(currentPage * responsesPerPage, totalResponses)} of {totalResponses}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={currentPage <= 1}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        >
                          <ChevronLeftIcon size={14} />
                          <span className="sr-only sm:not-sr-only">Previous</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={currentPage >= totalPages}
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        >
                          <span className="sr-only sm:not-sr-only">Next</span>
                          <ChevronRightIcon size={14} />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
                    <UserIcon size={26} />
                  </div>
                  <h4 className="text-base font-semibold text-foreground">No individual responses yet</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Individual user submissions will be recorded and displayed here in real time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        url={typeof window !== 'undefined' ? `${window.location.origin}/forms/${form.id}` : ''}
        title={form.title}
        description={form.description || 'Share this form to start collecting responses.'}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent onClose={() => setDeleteDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{form.title}&quot;? This action cannot be undone and will permanently erase all {totalResponses} submissions and uploaded files.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FormattedAnswer({ answer, type }: { answer: AnswerValue | undefined; type: string }) {
  if (answer === undefined || answer === null || answer === '') {
    return <span className="italic text-muted-foreground">No response</span>;
  }

  // Checkbox array
  if (type === 'checkbox' && Array.isArray(answer)) {
    return (
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {answer.map((item, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {item}
          </Badge>
        ))}
      </div>
    );
  }

  // Ranking array
  if (type === 'ranking' && Array.isArray(answer)) {
    return (
      <ol className="list-decimal ps-5 space-y-0.5 text-xs">
        {answer.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    );
  }

  // File answer object
  if (type === 'file-upload' && typeof answer === 'object' && 'url' in answer) {
    const file = answer as FileAnswer;
    return (
      <button
        type="button"
        onClick={() => handleDownloadFile(file.url, file.name)}
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs cursor-pointer font-medium max-w-full min-w-0"
        title={file.name}
      >
        <DownloadIcon size={14} className="shrink-0" />
        <span className="truncate">{truncateFileName(file.name, 28)}</span>
      </button>
    );
  }

  // Rating
  if (type === 'rating') {
    return (
      <div className="inline-flex items-center gap-1 text-warning">
        <StarIcon size={16} fill="currentColor" />
        <span className="font-bold text-foreground text-sm">{String(answer)}</span>
      </div>
    );
  }

  return <span>{String(answer)}</span>;
}
