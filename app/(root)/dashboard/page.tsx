import { getServerSession } from "next-auth/next";

import DashboardHeader from "@/components/DashboardHeader";
import RecentForms from "@/components/RecentForms";
import FormAnalytics from "@/components/FormAnalytics";
import { authOptions } from "@/auth";
import { getUser } from "@/lib/actions/user";
import OverviewStats from "@/components/OverviewStats";
import RecentActivity from "@/components/RecentActivity";
import { getFormByUserId } from "@/lib/actions/forms";
import { getEventsByUserId } from "@/lib/actions/events";

interface Form {
    _id: string;
    title: string;
    status: string;
    submissions?: Array<any>;
}

export default async function page() {
    const session = await getServerSession(authOptions);
    const user = await getUser({ email: session?.user?.email! });
    const firstName = user?.name.split(" ")[0] as string;
    const Forms = (await getFormByUserId(user?._id as string))?.forms as Form[];
    const activeForms = Forms.filter((form) => form.status === "published").length;
    const totalSubmissions = Forms.reduce((acc, form) => acc + (form.submissions?.length || 0), 0);
    const completionRate = activeForms > 0 ? `${Math.round((totalSubmissions / activeForms) * 100)}%` : "0%";
    const systemStatus = "Online";
    const events = await getEventsByUserId(user?._id as string);

    return (
        <div className="p-6 space-y-6 w-full min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardHeader username={firstName} activeForms={activeForms as number} />
                <RecentActivity events={events} />
            </div>
            <OverviewStats
                totalForms={activeForms}
                totalSubmissions={totalSubmissions}
                completionRate={completionRate}
                systemStatus={systemStatus}
            />
        </div>
    );
}
