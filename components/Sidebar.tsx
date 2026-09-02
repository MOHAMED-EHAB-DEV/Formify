'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboardIcon,
  FileTextIcon,
  SettingsIcon,
  LogOutIcon,
  UserIcon,
} from '@/components/ui/svgs/icons';
import { signOutAction } from '@/actions/auth';
import type { IUser } from '@/types';

interface SidebarProps {
  user?: IUser | null;
}

const NAV_LINKS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    label: 'My Forms',
    href: '/forms',
    icon: FileTextIcon,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
  },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutAction();
    router.push('/sign-in');
    router.refresh();
  };

  return (
    <aside className="fixed start-0 top-0 z-40 hidden md:flex h-screen w-60 flex-col justify-between border-e border-border bg-sidebar p-4 shadow-xs select-none">
      {/* Top Brand Logo */}
      <div className="space-y-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-1">
          <Image src="/assets/icons/icon.svg" alt="Formify Logo" width={28} height={28} priority />
          <span className="text-base font-bold tracking-tight text-foreground">Formify</span>
        </Link>

        {/* Navigation Items */}
        <nav aria-label="Main Navigation">
          <ul className="space-y-1">
            {NAV_LINKS.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                    }`}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Footer User Info & Sign Out */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border bg-muted flex items-center justify-center text-muted-foreground shrink-0">
              {user?.image ? (
                <Image src={user.image} alt={user.name || 'User'} fill className="object-cover" unoptimized />
              ) : (
                <UserIcon size={16} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{user?.name || 'My Account'}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email || ''}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            title="Sign out"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOutIcon size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
