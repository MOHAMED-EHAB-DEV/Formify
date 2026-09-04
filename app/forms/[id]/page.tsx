import { notFound } from 'next/navigation';
import { getFormById } from '@/actions/forms';
import { getUserById, getCurrentUser } from '@/actions/user';
import SubmitForm from '@/components/SubmitForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getFormById(id);
  if (!res.success || !res.data?.form) {
    return { title: 'Form Not Found' };
  }
  return {
    title: res.data.form.title,
    description: res.data.form.description || 'Submit response on Formify',
  };
}

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const formRes = await getFormById(id);

  if (!formRes.success || !formRes.data?.form) {
    notFound();
  }

  const form = formRes.data.form;
  const currentUser = await getCurrentUser();
  const isOwner = currentUser?._id === form.creatorId;

  if (form.status !== 'published' && !isOwner) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center shadow-xs space-y-3">
          <h1 className="text-xl font-bold text-foreground">Form Not Available</h1>
          <p className="text-xs text-muted-foreground">
            This form is currently in draft or has been archived by the creator.
          </p>
        </div>
      </main>
    );
  }

  const creator = await getUserById(form.creatorId);

  return (
    <SubmitForm
      form={{
        id: form.id,
        title: form.title,
        description: form.description,
        questions: form.questions,
        status: form.status,
        closeDate: form.closeDate,
        creator: creator ? { name: creator.name, email: creator.email } : undefined,
      }}
      isOwner={isOwner}
    />
  );
}
