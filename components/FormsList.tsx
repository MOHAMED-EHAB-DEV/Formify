'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/dropdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  PlusIcon,
  SearchIcon,
  FileTextIcon,
  UsersIcon,
  MoreVerticalIcon,
  PencilIcon,
  ShareIcon,
  TrashIcon,
  ArchiveIcon,
  RssIcon,
  ExternalLinkIcon,
} from '@/components/ui/svgs/icons';
import { deleteForm, changeStatus } from '@/actions/forms';
import { formatDate, camelize } from '@/lib/utils';
import { ShareModal } from '@/components/ShareModal';
import type { Form, FormStatus } from '@/types';

export function FormsList({ initialForms }: { initialForms: Form[] }) {
  const router = useRouter();

  const [forms, setForms] = useState<Form[]>(initialForms);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | FormStatus>('all');
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [formToShare, setFormToShare] = useState<Form | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredForms = useMemo(() => {
    return forms.filter((form) => {
      const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [forms, statusFilter, searchQuery]);

  const handleCopyLink = (formId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/forms/${formId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Form link copied to clipboard');
  };

  const handleStatusChange = async (formId: string, newStatus: FormStatus) => {
    try {
      const res = await changeStatus(formId, newStatus);
      if (res.success) {
        setForms((prev) =>
          prev.map((f) => (f.id === formId ? { ...f, status: newStatus } : f))
        );
        toast.success(`Form is now ${newStatus}`);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error('Failed to change status');
    }
  };

  const handleDelete = async () => {
    if (!formToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteForm(formToDelete.id);
      if (res.success) {
        setForms((prev) => prev.filter((f) => f.id !== formToDelete.id));
        toast.success('Form deleted successfully');
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error('Failed to delete form');
    } finally {
      setIsDeleting(false);
      setFormToDelete(null);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Top Header & Search/Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Forms
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your surveys, questionnaires, and feedback collection.
          </p>
        </div>

        <Link href="/forms/builder">
          <Button size="sm" className="w-full sm:w-auto">
            <PlusIcon size={16} aria-hidden="true" />
            <span>Create Form</span>
          </Button>
        </Link>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search forms by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<SearchIcon size={16} />}
            className="h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {status === 'all' ? 'All Forms' : camelize(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Form Cards Grid */}
      {filteredForms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForms.map((form) => (
            <article
              key={form.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    variant={
                      form.closeDate && new Date() > new Date(form.closeDate)
                        ? 'warning'
                        : form.status === 'published'
                        ? 'success'
                        : form.status === 'archived'
                        ? 'warning'
                        : 'secondary'
                    }
                    dot
                  >
                    {form.closeDate && new Date() > new Date(form.closeDate) ? 'Expired' : camelize(form.status)}
                  </Badge>

                  <Dropdown
                    trigger={
                      <button
                        type="button"
                        aria-label={`Options for ${form.title}`}
                        className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <MoreVerticalIcon size={18} />
                      </button>
                    }
                  >
                    <DropdownItem onClick={() => router.push(`/forms/details/${form.id}`)}>
                      <FileTextIcon size={16} />
                      <span>View Analytics</span>
                    </DropdownItem>
                    <DropdownItem onClick={() => router.push(`/forms/edit/${form.id}`)}>
                      <PencilIcon size={16} />
                      <span>Edit Form</span>
                    </DropdownItem>
                    <DropdownItem onClick={() => setFormToShare(form)}>
                      <ShareIcon size={16} />
                      <span>Share Form</span>
                    </DropdownItem>
                    <DropdownSeparator />
                    {form.status === 'published' ? (
                      <DropdownItem onClick={() => handleStatusChange(form.id, 'archived')}>
                        <ArchiveIcon size={16} />
                        <span>Archive</span>
                      </DropdownItem>
                    ) : (
                      <DropdownItem onClick={() => handleStatusChange(form.id, 'published')}>
                        <RssIcon size={16} />
                        <span>Publish</span>
                      </DropdownItem>
                    )}
                    <DropdownSeparator />
                    <DropdownItem destructive onClick={() => setFormToDelete(form)}>
                      <TrashIcon size={16} />
                      <span>Delete</span>
                    </DropdownItem>
                  </Dropdown>
                </div>

                <Link href={`/forms/details/${form.id}`} className="block group">
                  <h3 className="font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
                    {form.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 min-h-8">
                    {form.description || 'No description provided.'}
                  </p>
                </Link>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <UsersIcon size={14} className="text-primary" />
                  <span className="font-semibold text-foreground">
                    {form.responsesCount ?? (form.responses ? form.responses.length : 0)}
                  </span>
                  <span>responses</span>
                </div>
                <span>{formatDate(form.updatedAt)}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 sm:py-24 px-6 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
              <FileTextIcon size={28} />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {searchQuery || statusFilter !== 'all' ? 'No matching forms found' : 'No forms created yet'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search keyword or status filter.'
                : 'Create your first smart form to begin collecting responses in real time.'}
            </p>
            <Link href="/forms/builder" className="mt-5">
              <Button size="sm">
                <PlusIcon size={16} aria-hidden="true" />
                <span>Create First Form</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Share Modal */}
      {formToShare && (
        <ShareModal
          open={formToShare !== null}
          onOpenChange={(open) => !open && setFormToShare(null)}
          url={typeof window !== 'undefined' ? `${window.location.origin}/forms/${formToShare.id}` : ''}
          title={formToShare.title}
          description={formToShare.description || 'Share this form to start collecting responses.'}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={formToDelete !== null} onOpenChange={(open) => !open && setFormToDelete(null)}>
        <DialogContent onClose={() => setFormToDelete(null)}>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &quot;{formToDelete?.title}&quot;? All associated responses will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormToDelete(null)}
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
