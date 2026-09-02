'use client';

import React, { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { QRCode, downloadQRCode } from '@/components/ui/qr-code';
import {
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  ShareIcon,
  DownloadIcon,
  WhatsAppIcon,
  XTwitterIcon,
  LinkedInIcon,
  TelegramIcon,
  FacebookIcon,
  RedditIcon,
  MailIcon,
  MoreVerticalIcon,
} from '@/components/ui/svgs/icons';
import { toast } from 'sonner';

export interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title?: string;
  description?: string;
  subject?: string;
}

interface SocialDestination {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  color: string;
  hoverBadgeClass: string;
  hoverBorderClass: string;
  getUrl: (url: string, title?: string, subject?: string) => string;
}

const SOCIAL_DESTINATIONS: SocialDestination[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: WhatsAppIcon,
    color: '#25D366',
    hoverBadgeClass: 'group-hover:bg-[#25D366] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#25D366]/30',
    hoverBorderClass: 'hover:border-[#25D366]/40 hover:bg-[#25D366]/5',
    getUrl: (url, title) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title ? `${title} — ` : ''}${url}`)}`,
  },
  {
    id: 'twitter',
    name: 'X',
    icon: XTwitterIcon,
    color: '#000000',
    hoverBadgeClass: 'group-hover:bg-foreground group-hover:text-background group-hover:shadow-md group-hover:shadow-foreground/20',
    hoverBorderClass: 'hover:border-foreground/30 hover:bg-foreground/5',
    getUrl: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title || 'Check this out!')}`,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: LinkedInIcon,
    color: '#0A66C2',
    hoverBadgeClass: 'group-hover:bg-[#0A66C2] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#0A66C2]/30',
    hoverBorderClass: 'hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/5',
    getUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: TelegramIcon,
    color: '#229ED9',
    hoverBadgeClass: 'group-hover:bg-[#229ED9] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#229ED9]/30',
    hoverBorderClass: 'hover:border-[#229ED9]/40 hover:bg-[#229ED9]/5',
    getUrl: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title || '')}`,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: FacebookIcon,
    color: '#1877F2',
    hoverBadgeClass: 'group-hover:bg-[#1877F2] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#1877F2]/30',
    hoverBorderClass: 'hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5',
    getUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: RedditIcon,
    color: '#FF4500',
    hoverBadgeClass: 'group-hover:bg-[#FF4500] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#FF4500]/30',
    hoverBorderClass: 'hover:border-[#FF4500]/40 hover:bg-[#FF4500]/5',
    getUrl: (url, title) =>
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title || '')}`,
  },
  {
    id: 'email',
    name: 'Email',
    icon: MailIcon,
    color: '#64748B',
    hoverBadgeClass: 'group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/30',
    hoverBorderClass: 'hover:border-primary/40 hover:bg-primary/5',
    getUrl: (url, title, subject) =>
      `mailto:?subject=${encodeURIComponent(subject || title || 'Sharing link')}&body=${encodeURIComponent(
        `${title ? `${title}\n\n` : ''}${url}`
      )}`,
  },
];

export function ShareModal({
  open,
  onOpenChange,
  url,
  title = 'Share',
  description = 'Anyone with this link can view and interact with this form.',
  subject,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const handleCopyLink = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      startTransition(() => {
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShareDestination = (dest: SocialDestination) => {
    const shareHref = dest.getUrl(url, title, subject);
    if (dest.id === 'email') {
      window.location.href = shareHref;
    } else {
      window.open(shareHref, '_blank', 'noopener,noreferrer,width=600,height=550');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        toast.success('Shared successfully');
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          toast.error('Could not complete sharing');
        }
      }
    } else {
      // Fallback: copy link and notify
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-md p-6 sm:p-7">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShareIcon size={18} />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold sm:text-lg">
                {title || 'Share Link'}
              </DialogTitle>
              {description && (
                <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* 1. Styled QR Code Section */}
          <div className="relative flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-muted/30 p-5 backdrop-blur-xs">
            {/* Top-Left Download Icon on outer box */}
            <button
              type="button"
              onClick={() =>
                downloadQRCode({
                  value: url,
                  fileName: title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'share-qr',
                  dotScale: 0.42,
                  darkColor: '#0B132B',
                  lightColor: '#FFFFFF',
                })
              }
              aria-label="Download QR Code"
              title="Download QR Code"
              className="absolute top-3 start-3 z-10 flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground shadow-2xs transition-all hover:bg-muted hover:text-foreground active:scale-95"
            >
              <DownloadIcon size={15} />
            </button>

            <QRCode
              value={url}
              size={175}
              scale={10}
              margin={2.5}
              dotScale={0.42}
              darkColor="#0B132B"
              lightColor="#FFFFFF"
            />
          </div>

          {/* 2. Media / Social Share Carousel */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Share via</span>
            </div>

            <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 py-1.5">
              {SOCIAL_DESTINATIONS.map((dest) => {
                const Icon = dest.icon;
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => handleShareDestination(dest)}
                    className={`group relative flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-2.5 text-center shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-95 ${dest.hoverBorderClass}`}
                    style={{ minWidth: '68px' }}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground transition-all duration-200 group-hover:scale-110 group-hover:-rotate-3 ${dest.hoverBadgeClass}`}
                    >
                      <Icon size={19} />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground transition-colors duration-200 group-hover:font-semibold group-hover:text-foreground">
                      {dest.name}
                    </span>
                  </button>
                );
              })}

              {/* More / Native Share Trigger */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="group relative flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/60 p-2.5 text-center shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md active:translate-y-0 active:scale-95"
                style={{ minWidth: '68px' }}
                title="More sharing options"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground transition-all duration-200 group-hover:rotate-90 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/30">
                  <MoreVerticalIcon size={19} />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground transition-colors duration-200 group-hover:font-semibold group-hover:text-foreground">
                  More
                </span>
              </button>
            </div>
          </div>

          {/* 3. Link Input with Copy & Open Actions */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Direct Link
            </label>
            <div className="relative flex items-center rounded-xl border border-border bg-card shadow-xs transition-within:border-primary/60 transition-within:ring-2 transition-within:ring-ring/20">
              <input
                type="text"
                readOnly
                value={url}
                onFocus={(e) => e.target.select()}
                className="w-full bg-transparent py-2.5 ps-3 pe-20 text-xs font-mono text-foreground focus:outline-none"
              />

              <div className="absolute end-1.5 flex items-center gap-1">
                {/* External Link */}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Open in new tab"
                >
                  <ExternalLinkIcon size={14} />
                </a>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                    copied
                      ? 'bg-success/15 text-success'
                      : 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckIcon size={13} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
