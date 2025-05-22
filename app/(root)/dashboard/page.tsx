import { getServerSession } from "next-auth/next";

import DashboardHeader from "@/components/DashboardHeader";
import RecentForms from "@/components/RecentForms";
import FormAnalytics from "@/components/FormAnalytics";
import { authOptions } from "@/auth";
import { getUser } from "@/lib/actions/user";
import OverviewStats from "@/components/OverviewStats";
import RecentActivity from "@/components/RecentActivity";


export default async function page() {
    const session = await getServerSession(authOptions);
    const user = await getUser({ email: session?.user?.email! });
    const firstName = user?.name.split(" ")[0] as string;
    return (
        <div className="p-6 space-y-6 w-full min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardHeader username={firstName} />
                <RecentActivity />
            </div>
            <OverviewStats />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RecentForms />
                <FormAnalytics />
            </div>
        </div>
    );
}
