import { FormDetails } from '@/components/FormDetails';
import { getFormById } from '@/lib/actions/forms';

const page = async ({ params }: { params: { id: string } }) => {
  const formResponse = await getFormById(params.id);
  const form = formResponse.form as unknown as Form;

  return (
    <FormDetails
      totalResponses={form?.responses?.length || 0}
      id={params.id}
      responses={form?.responses || []}
    />
  )
}

export default page
