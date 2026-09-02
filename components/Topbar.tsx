'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  PlusIcon,
  LayoutDashboardIcon,
  FileTextIcon,
  SettingsIcon,
  LogOutIcon,
  UserIcon,
  ListIcon,
  XIcon,
} from '@/components/ui/svgs/icons';
import { signOutAction } from '@/actions/auth';
import type { IUser } from '@/types';

interface TopbarProps {
  user?: IUser | null;
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOutAction();
    router.push('/sign-in');
    router.refresh();
  };

  const getPageTitle = () => {
    if (pathname.startsWith('/forms/builder')) return 'Form Builder';
    if (pathname.startsWith('/forms/edit')) return 'Edit Form';
    if (pathname.startsWith('/forms/details')) return 'Form Analytics';
    if (pathname.startsWith('/forms')) return 'My Forms';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-card/90 px-4 sm:px-6 backdrop-blur-xs">
        {/* Left: Mobile hamburger or Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {mobileMenuOpen ? <XIcon size={20} /> : <ListIcon size={20} />}
          </button>

          <span className="text-sm font-semibold text-foreground">
            {getPageTitle()}
          </span>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-3">
          <Link href="/forms/builder">
            <Button size="sm" className="h-8 gap-1.5 px-3">
              <PlusIcon size={14} aria-hidden="true" />
              <span className="hidden sm:inline">New Form</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 start-0 z-50 w-64 bg-card p-5 shadow-xl border-e border-border flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Image src="/assets/icons/icon.svg" alt="Formify" width={24} height={24} />
                  <span className="text-sm font-bold text-foreground">Formify</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                >
                  <XIcon size={18} />
                </button>
              </div>

              <nav>
                <ul className="space-y-1">
                  {[
                    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
                    { label: 'My Forms', href: '/forms', icon: FileTextIcon },
                    { label: 'Settings', href: '/settings', icon: SettingsIcon },
                  ].map(({ label, href, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                          pathname === href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {user?.image ? (
                      <Image src={user.image} alt="" fill className="rounded-full object-cover" unoptimized />
                    ) : (
                      <UserIcon size={14} />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-foreground truncate">{user?.name || 'Account'}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOutIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
