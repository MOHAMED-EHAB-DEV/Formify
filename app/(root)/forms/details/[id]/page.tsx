import { FormDetails } from '@/components/FormDetails';
import { getFormById } from '@/lib/actions/forms';

type PageProps = {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

const page = async ({ params }: PageProps) => {
  const { id } = params;
  const form = (await getFormById(id)).form as unknown as Form;

  return (
    <FormDetails
      totalResponses={form?.responses?.length || 0}
      id={id}
      responses={form?.responses || []}
    />
  )
}

export default page
