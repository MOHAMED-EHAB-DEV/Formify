import { getServerSession } from "next-auth/next";

import { authOptions } from "@/auth";
import { getUser } from "@/lib/actions/user";
import { getFormByUserId } from "@/lib/actions/forms";
import Forms from "@/components/Forms";

const page = async () => {
  const session = await getServerSession(authOptions);
  const user = await getUser({ email: session?.user?.email! });

  const forms = (await getFormByUserId(user?._id?.toString() as string)).forms as [Form];
  return <Forms forms={forms} />;
}

export default page;