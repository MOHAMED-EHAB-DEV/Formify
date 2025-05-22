import { getServerSession } from "next-auth/next";

import FormBuilder from '@/components/FormBuilder';
import { authOptions } from "@/auth";
import Navbar from "@/components/Navbar";

export default async function page() {
  const session = await getServerSession(authOptions);

  return (
    <main className="home-container pl-8">
      <Navbar user={session?.user as unknown as IUser} isFormBuilder={true} />
      <h1 className="text-2xl font-bold mb-4">Form Builder</h1>
      <FormBuilder email={session?.user?.email as string} />
    </main>
  )
}
