import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/user';
import { getFormById } from '@/actions/forms';
import { FormBuilder } from '@/components/FormBuilder';

export const metadata = {
  title: 'Edit Form',
};

export default async function EditFormPage({
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

  return (
    <FormBuilder
      initialData={{
        id: form.id,
        title: form.title,
        description: form.description,
        questions: form.questions,
        status: form.status,
      }}
    />
  );
}
