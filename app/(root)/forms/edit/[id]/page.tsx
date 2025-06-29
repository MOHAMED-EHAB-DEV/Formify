import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import { getFormById } from '@/lib/actions/forms';
import FormBuilder from '@/components/FormBuilder';

export default async function EditFormPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/login');
    }

    const formResponse = await getFormById(params.id);
    const form = formResponse.form as unknown as Form;

    if (!form) {
        return (
            <div className="flex justify-center items-center h-screen text-xl font-semibold">
                Form not found.
            </div>
        );
    }

    const initialData = {
        id: form?.id.toString(),
        title: form.title.toString(),
        description: form.description.toString(),
        questions: form.questions.map((q: any) => ({
            id: q.id || q._id || '',
            type: q.type,
            label: q.label,
            options: q.options || [],
        })),
    };

    return (
        <div className="max-w-full w-full flex flex-col sm:px-8">
            <h1 className="text-2xl font-bold mb-4">Edit Form</h1>
            <div className="max-w-2xl">
                <FormBuilder email={session.user.email} initialData={initialData} />
            </div>
        </div>
    );
}
