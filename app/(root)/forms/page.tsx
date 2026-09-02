import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/user';
import { getFormByUserId } from '@/actions/forms';
import { FormsList } from '@/components/FormsList';

export const metadata = {
  title: 'My Forms',
};

export default async function FormsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const formsRes = await getFormByUserId(user._id);
  const forms = formsRes.success ? formsRes.data.forms : [];

  return <FormsList initialForms={forms} />;
}