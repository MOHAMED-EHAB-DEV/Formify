import { getServerSession } from "next-auth/next";

import UpdateProfile from '@/components/UpdateProfile';
import { authOptions } from "@/auth";
import { getUser } from "@/lib/actions/user";

const page = async () => {
  const session = await getServerSession(authOptions);
  const user = await getUser({ email: session?.user?.email! });
  return (
    <div className="flex flex-col gap-5 w-full pr-5">
      <UpdateProfile user={user as IUser} />
    </div>
  )
}

export default page;