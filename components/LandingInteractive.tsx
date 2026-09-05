'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  StarIcon,
  CheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  DownloadIcon,
  QrCodeIcon,
  ShareIcon,
  BarChartIcon,
  ListIcon,
  FileTextIcon,
  UploadCloudIcon,
  ChevronDownIcon,
  UsersIcon,
  ActivityIcon,
  GripVerticalIcon,
} from '@/components/ui/svgs/icons';

// ─── INTERACTIVE HERO DEMO TABS ───────────────────────────────────────────────

type DemoTab = 'preview' | 'builder' | 'analytics';

export function InteractiveHeroDemo({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [activeTab, setActiveTab] = useState<DemoTab>('preview');

  // Interactive state inside preview
  const [rating, setRating] = useState<number>(5);
  const [selectedTopic, setSelectedTopic] = useState<string>('Feature Request');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const topics = ['Feature Request', 'Bug Report', 'General Feedback', 'Other'];

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-border bg-card shadow-xl overflow-hidden transition-all">
      {/* Demo Window Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 me-2">
            <span className="h-3 w-3 rounded-full bg-destructive/60 inline-block" />
            <span className="h-3 w-3 rounded-full bg-warning/60 inline-block" />
            <span className="h-3 w-3 rounded-full bg-success/60 inline-block" />
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            formify.app/forms/demo-feedback
          </span>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-background/80 p-1 rounded-lg border border-border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'preview'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Form View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'builder'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Drag & Drop Builder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Live Analytics
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 sm:p-8 bg-card">
        {/* 1. Live Interactive Form Experience */}
        {activeTab === 'preview' && (
          <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
            <div className="border-b border-border-subtle pb-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <Badge variant="secondary" className="text-[11px]">
                  Interactive Live Demo
                </Badge>
                <span className="text-xs text-muted-foreground">Takes 30s</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                Product Experience Survey
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Try clicking below to experience Formify&apos;s fluid, accessible questionnaire.
              </p>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-3 animate-fade-in">
                <div className="h-12 w-12 rounded-full bg-success/15 text-success mx-auto flex items-center justify-center">
                  <CheckIcon size={24} />
                </div>
                <h4 className="text-base font-semibold text-foreground">
                  Response Recorded Instantly!
                </h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  In real forms, responses stream directly to your live dashboard and can be exported as CSV with 1 click.
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSubmitted(false)}
                  >
                    Reset Demo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Question 1: Rating */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>1. How satisfied are you with our product?</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      {rating} / 5 Stars
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 rounded-md hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Rate ${star} out of 5 stars`}
                      >
                        <StarIcon
                          size={24}
                          className={
                            star <= rating
                              ? 'text-warning fill-warning'
                              : 'text-muted-foreground/40'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2: Topic Choice */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">
                    2. Select your feedback category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {topics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setSelectedTopic(topic)}
                        className={`text-xs px-3 py-2 rounded-lg border text-start transition-all ${
                          selectedTopic === topic
                            ? 'border-primary bg-primary/10 text-primary font-medium shadow-xs'
                            : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 3: File Upload Mock */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">
                    3. Attach screenshot or document (optional)
                  </label>
                  <div className="border border-dashed border-border rounded-lg p-3 text-center bg-muted/20 hover:bg-muted/40 transition-colors">
                    <UploadCloudIcon size={20} className="mx-auto text-muted-foreground mb-1" />
                    <p className="text-[11px] text-foreground font-medium">
                      Drag and drop or browse file
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      PNG, PDF, DOCX up to 10MB (Cloudinary / Uploadthing)
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Powered by Formify
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setSubmitted(true)}
                  >
                    <span>Submit Feedback</span>
                    <ArrowRightIcon size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Drag & Drop Builder View */}
        {activeTab === 'builder' && (
          <div className="max-w-xl mx-auto space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Visual Form Canvas
                </h4>
                <p className="text-xs text-muted-foreground">
                  Drag handle to rearrange questions instantly with @dnd-kit
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                3 Questions Added
              </Badge>
            </div>

            <div className="space-y-2.5">
              {[
                { title: 'Full Name & Email Address', type: 'Text / Email', required: true },
                { title: 'Rate your overall satisfaction', type: 'Star Rating (1-5)', required: true },
                { title: 'Project scope requirements', type: 'Paragraph (Markdown)', required: false },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card shadow-xs hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-muted-foreground cursor-grab active:cursor-grabbing hover:text-foreground">
                      <GripVerticalIcon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {item.type}
                        </span>
                        {item.required && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg border border-dashed border-border-subtle bg-muted/20 text-center text-xs text-muted-foreground">
              + Click &quot;Add Question&quot; to choose from 10+ field types (Ranking, Dropdown, File Upload)
            </div>
          </div>
        )}

        {/* 3. Live Analytics View */}
        {activeTab === 'analytics' && (
          <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
                <span className="text-xs font-semibold text-foreground">
                  Live Response Stream (WebSocket Sync)
                </span>
              </div>
              <Badge variant="outline" className="text-xs gap-1">
                <DownloadIcon size={12} />
                <span>1-Click CSV Ready</span>
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-border bg-muted/20">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Total Responses</p>
                <p className="text-xl font-bold text-foreground mt-1">1,428</p>
                <p className="text-[10px] text-success mt-0.5">↑ 100% Free / No Cap</p>
              </div>
              <div className="p-3 rounded-xl border border-border bg-muted/20">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Avg. Rating</p>
                <p className="text-xl font-bold text-foreground mt-1">4.9 / 5</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">94% Positive</p>
              </div>
              <div className="p-3 rounded-xl border border-border bg-muted/20">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Completion Rate</p>
                <p className="text-xl font-bold text-foreground mt-1">92.4%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Mobile Optimized</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/10 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Recent Submissions</span>
                <span className="text-muted-foreground text-[10px]">Auto-refreshing</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border-subtle">
                  <span className="font-medium text-foreground">Anonymous #1428</span>
                  <span className="text-muted-foreground text-[11px]">Just now</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border-subtle">
                  <span className="font-medium text-foreground">Anonymous #1427</span>
                  <span className="text-muted-foreground text-[11px]">2 mins ago</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <Link href={isAuthenticated ? '/dashboard' : '/sign-up'}>
                <Button size="sm" className="gap-2">
                  <span>Open Your Free Dashboard</span>
                  <ArrowRightIcon size={14} />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── INTERACTIVE FAQ ACCORDION ───────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Is Formify really 100% free with no response caps?',
    answer:
      'Yes. Unlike Typeform and Tally which enforce restrictive free plans (such as 10 responses per month) before demanding expensive monthly subscriptions, Formify lets you create forms and collect responses without artificial paywalls.',
  },
  {
    question: 'How does the 1-Click CSV export work?',
    answer:
      'Inside your form analytics dashboard, simply click the "Export CSV" button. Formify instantly compiles all submitted answers, dates, and file URLs into a clean, UTF-8 formatted CSV spreadsheet compatible with Excel, Google Sheets, and data tools.',
  },
  {
    question: 'Do respondents need an account to fill out forms?',
    answer:
      'No. Respondents can access your public form URL or scan your custom QR code on any device without signing in or creating an account.',
  },
  {
    question: 'What types of questions can I add?',
    answer:
      'Formify supports over 10 question types: short text, markdown-enabled paragraphs, star ratings, linear scales, multiple-choice, checkboxes, dropdowns, rankings, dates, emails, numbers, and multimedia file uploads.',
  },
  {
    question: 'Can I set expiration dates or close forms automatically?',
    answer:
      'Yes. You can assign a deadline date to any form. Once the deadline passes, submissions are closed automatically, or you can manually change status between Draft, Published, and Archived at any time.',
  },
];

export function LandingFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {FAQS.map((faq, index) => {
        const isOpen = openIdx === index;
        return (
          <div
            key={index}
            className="rounded-xl border border-border bg-card overflow-hidden transition-colors"
          >
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : index)}
              className="flex w-full items-center justify-between p-4 sm:p-5 text-start font-semibold text-foreground hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={isOpen}
            >
              <span className="text-sm sm:text-base">{faq.question}</span>
              <ChevronDownIcon
                size={18}
                className={`text-muted-foreground shrink-0 ms-3 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-primary' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border-subtle mt-1 pt-3 animate-fade-in">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
