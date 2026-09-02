import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/user';
import { getFormById } from '@/actions/forms';
import { FormDetails } from '@/components/FormDetails';

export const metadata = {
  title: 'Form Analytics',
};

export default async function FormDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const res = await getFormById(id);

  if (!res.success || !res.data?.form) {
    notFound();
  }

  const form = res.data.form;

  if (form.creatorId !== user._id) {
    redirect('/forms');
  }

  return <FormDetails form={form} />;
}
