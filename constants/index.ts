import { LayoutDashboardIcon, FileTextIcon, SettingsIcon } from '@/components/ui/svgs/icons';

export const SidebarLinks = [
  {
    id: 0,
    Icon: LayoutDashboardIcon,
    text: 'Dashboard',
    to: '/dashboard',
  },
  {
    id: 1,
    Icon: FileTextIcon,
    text: 'My Forms',
    to: '/forms',
  },
  {
    id: 2,
    Icon: SettingsIcon,
    text: 'Settings',
    to: '/settings',
  },
] as const;