'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PlusIcon,
  FileTextIcon,
  UsersIcon,
  BarChartIcon,
  ActivityIcon,
  ClockIcon,
  ChevronRightIcon,
} from '@/components/ui/svgs/icons';
import { formatDate, camelize, cn } from '@/lib/utils';
import type { Form, AppEvent } from '@/types';

interface DashboardOverviewProps {
  username: string;
  forms: Form[];
  events: AppEvent[];
}

export function DashboardOverview({ username, forms, events }: DashboardOverviewProps) {
  const activeForms = forms.filter((f) => f.status === 'published');
  const totalSubmissions = forms.reduce((acc, f) => acc + (f.responsesCount ?? f.responses?.length ?? 0), 0);
  const completionRate =
    activeForms.length > 0 ? `${Math.min(100, Math.round((totalSubmissions / (activeForms.length * 5 || 1)) * 100))}%` : '0%';

  const recentForms = forms.slice(0, 4);

  const getEventDescription = (event: AppEvent) => {
    const actor = typeof event.userId === 'object' ? event.userId.name : 'User';
    switch (event.type) {
      case 'form_created':
        return `${actor} created form "${event.formTitle}"`;
      case 'form_updated':
        return `${actor} updated form "${event.formTitle}"`;
      case 'form_submitted':
        return `New response received for "${event.formTitle}"`;
      case 'form_deleted':
        return `${actor} deleted form "${event.formTitle}"`;
      case 'responses_purged':
        return `System purged ${event.metadata?.purgedCount ?? ''} expired responses (>90d) and archived "${event.formTitle}"`;
      default:
        return `${actor} performed an action`;
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {username}!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            You have <strong className="text-foreground font-semibold">{activeForms.length} active forms</strong> accepting submissions.
          </p>
        </div>

        <Link href="/forms/builder">
          <Button size="sm">
            <PlusIcon size={16} aria-hidden="true" />
            <span>New Form</span>
          </Button>
        </Link>
      </div>

      {/* Semantic Stat Metrics (<dl>) */}
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FileTextIcon size={16} className="text-primary" />
              <span>Total Forms</span>
            </dt>
            <dd className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {forms.length}
            </dd>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <UsersIcon size={16} className="text-primary" />
              <span>Submissions</span>
            </dt>
            <dd className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {totalSubmissions}
            </dd>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <BarChartIcon size={16} className="text-primary" />
              <span>Active Forms</span>
            </dt>
            <dd className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {activeForms.length}
            </dd>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ActivityIcon size={16} className="text-primary" />
              <span>Activity Rate</span>
            </dt>
            <dd className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {completionRate}
            </dd>
          </CardContent>
        </Card>
      </dl>

      {/* Main Dashboard Grid: Recent Forms + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Forms List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Recent Forms</h2>
            <Link href="/forms" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              <span>View all</span>
              <ChevronRightIcon size={14} />
            </Link>
          </div>

          {recentForms.length > 0 ? (
            <div className="space-y-3">
              {recentForms.map((form) => (
                <Link
                  key={form.id}
                  href={`/forms/details/${form.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-xs group"
                >
                  <div className="space-y-1 min-w-0 flex-1 pe-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {form.title}
                      </h3>
                      <Badge
                        variant={
                          form.status === 'published'
                            ? 'success'
                            : form.status === 'archived'
                            ? 'warning'
                            : 'secondary'
                        }
                        dot
                        className="text-[10px]"
                      >
                        {camelize(form.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {form.description || 'No description'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    <span className="font-semibold text-foreground">
                      {form.responsesCount ?? (form.responses ? form.responses.length : 0)} resps
                    </span>
                    <ChevronRightIcon size={16} className="text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-1">
                  <FileTextIcon size={28} />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">No forms created yet</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Get started by creating your first interactive form in seconds.
                  </p>
                </div>
                <Link href="/forms/builder" className="pt-2">
                  <Button size="sm">Create Form</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base font-bold text-foreground">Recent Activity</h2>

          <Card>
            <CardContent className={cn('p-5 sm:p-6', events.length > 0 ? 'pt-5 sm:pt-6' : '')}>
              {events.length > 0 ? (
                <ol className="relative border-s border-border-subtle ms-3 space-y-4">
                  {events.map((event) => (
                    <li key={event.id} className="ms-4">
                      <div className="absolute -inset-s-1.5 mt-1.5 h-3 w-3 rounded-full border border-card bg-primary" />
                      <p className="text-xs font-medium text-foreground leading-snug">
                        {getEventDescription(event)}
                      </p>
                      <time className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                        <ClockIcon size={12} />
                        <span>{formatDate(event.timestamp)}</span>
                      </time>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
                    <ClockIcon size={22} />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No recent activity</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Actions like creating, editing, and publishing forms will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
