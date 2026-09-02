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
} from '@/components/ui/svgs/icons';
import { deleteForm, changeStatus } from '@/actions/forms';
import { useFormSocket } from '@/hooks/use-form-socket';
import { formatDate, camelize } from '@/lib/utils';
import { ShareModal } from '@/components/ShareModal';
import type { Form, FormResponse, FormStatus } from '@/types';

export function FormDetails({ form }: { form: Form }) {
  const router = useRouter();

  const [responses, setResponses] = useState<FormResponse[]>(form.responses || []);
  const [currentStatus, setCurrentStatus] = useState<FormStatus>(form.status);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const responsesPerPage = 10;

  const { isConnected } = useFormSocket({
    formId: form.id,
    onNewResponse: (data) => {
      setResponses((prev) => {
        if (data.response?.id && prev.some((r) => r.id === data.response.id)) {
          return prev;
        }
        return [data.response, ...prev];
      });
      toast.success('New response received in real time!');
    },
  });

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/forms/${form.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Form link copied to clipboard');
  };

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
            <span className="font-medium text-foreground truncate max-w-[200px]">
              {form.title}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {form.title}
            </h1>
            <Badge
              variant={
                currentStatus === 'published'
                  ? 'success'
                  : currentStatus === 'archived'
                  ? 'warning'
                  : 'secondary'
              }
              dot
            >
              {camelize(currentStatus)}
            </Badge>
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

      {/* Metric Stats Cards (Semantic <dl>) */}
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
              {camelize(currentStatus)}
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
                            className="w-full max-w-[28px] rounded-t-md bg-primary/80 transition-all hover:bg-primary"
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
                        </span>
                        <h4 className="text-sm font-semibold text-foreground">{question.label}</h4>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {answersForQ.length} {answersForQ.length === 1 ? 'response' : 'responses'}
                      </Badge>
                    </div>

                    {/* Question Answers Display */}
                    {answersForQ.length > 0 ? (
                      <div className="space-y-2 pt-2 border-t border-border-subtle">
                        {question.type === 'multiple-choice' ? (
                          <div className="space-y-1.5">
                            {question.options?.map((option, optIdx) => {
                              const count = answersForQ.filter((a) => {
                                return a.answer === option;
                              }).length;
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
                        ) : (
                          <div className="max-h-40 overflow-y-auto space-y-1.5 pe-1">
                            {answersForQ.map((ans, aIdx) => (
                              <div
                                key={aIdx}
                                className="p-2 rounded-lg bg-card border border-border-subtle text-xs text-foreground"
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
              <h3 className="text-base font-semibold text-foreground">Individual Responses</h3>

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
                                  <p className="text-xs font-medium text-muted-foreground">{q.label}</p>
                                  <p className="text-sm font-semibold text-foreground">
                                    {ans ? String(ans.answer) : <span className="italic text-muted-foreground">No response</span>}
                                  </p>
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
              Are you sure you want to delete &quot;{form.title}&quot;? This action cannot be undone and will erase all {totalResponses} submissions.
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
