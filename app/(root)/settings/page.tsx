import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/user';
import { UpdateProfile } from '@/components/UpdateProfile';

export const metadata = {
  title: 'Settings',
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  return <UpdateProfile user={user} />;
}