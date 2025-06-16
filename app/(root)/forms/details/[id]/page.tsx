import { FormDetails } from '@/components/FormDetails';
import { getFormById } from '@/lib/actions/forms';

const page = async ({ params }: { params: { id: string } }) => {
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
