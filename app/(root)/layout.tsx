import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import Navbar from "@/components/Navbar";
import { authOptions } from "@/auth";
import { getUser } from "@/lib/actions/user";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getServerSession(authOptions);
    const user = await getUser({ email: session?.user?.email! });

    if (!user) {
        redirect("/sign-in");
    }
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />
            <main className="home-container">
                <Navbar user={user} />
                {children}
            </main>
        </SidebarProvider>
    );
}