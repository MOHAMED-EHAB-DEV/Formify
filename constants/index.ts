import { LayoutDashboard, FileText, Settings } from "lucide-react";

const SidebarLinks = [
    {
        id: 0,
        Icon: LayoutDashboard,
        text: "Dashboard",
        to: "/dashboard",
    },
    {
        id: 1,
        Icon: FileText,
        text: "My Forms",
        to: "/forms",
    },
    {
        id: 2,
        Icon: Settings,
        text: "Settings",
        to: "/settings",
    },
];
export { SidebarLinks };