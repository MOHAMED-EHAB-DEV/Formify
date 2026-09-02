import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/user';
import { getFormByUserId } from '@/actions/forms';
import { getEventsByUserId } from '@/actions/events';
import { DashboardOverview } from '@/components/DashboardOverview';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const formsRes = await getFormByUserId(user._id);
  const forms = formsRes.success ? formsRes.data.forms : [];

  const events = await getEventsByUserId(user._id);

  const firstName = user.name ? user.name.split(' ')[0] : 'User';

  return (
    <DashboardOverview
      username={firstName || 'User'}
      forms={forms}
      events={events}
    />
  );
}
