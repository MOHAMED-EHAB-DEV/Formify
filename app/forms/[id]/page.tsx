import { getFormById } from '@/lib/actions/forms';
import { getUserById } from '@/lib/actions/user';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import SubmitForm from '@/components/SubmtForm';

export default async function page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const formRes = (await getFormById(params.id)).form;

  if (!formRes) {
    return <div className="p-8 text-red-500 text-center">🚫 Form not found</div>;
  }

  const creator = await getUserById(formRes?.creatorId as string);
  const userEmail = creator?.user?.email;
  const currentUserEmail = session?.user?.email;
  const isOwner = currentUserEmail && currentUserEmail === userEmail;

  if (!isOwner && formRes?.status !== 'published') {
    return <div className="p-8 text-red-500 text-center">🚫 Form is not available</div>;
  }

  const form = {
    _id: formRes?._id,
    id: formRes?.id,
    title: formRes?.title,
    description: formRes?.description,
    questions: formRes?.questions,
    status: formRes?.status,
    creator: {
      name: creator?.user?.name,
      email: creator?.user?.email,
    }
  };
  

  return (
    <SubmitForm
      form={form}
      isOwner={isOwner as boolean}
    />
  );
}
