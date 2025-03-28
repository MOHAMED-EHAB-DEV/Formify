'use client';

import Image from "next/image";
import { useTheme } from "next-themes";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarLinks } from "@/constants";
import { usePathname } from "next/navigation";

export function AppSidebar() {
    const pathname = usePathname();
    const { theme } = useTheme();
    return (
        <Sidebar>
            <SidebarHeader>
                <div>
                    {theme && (
                        <Image
                            src={`/assets/images/logo-${theme}.svg`}
                            alt="logo"
                            width={152}
                            height={152}
                        />
                    )}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {SidebarLinks.map(({ Icon, id, text, to }) => (
                                <SidebarMenuItem key={id}>
                                    <SidebarMenuButton className={`${to === pathname && "bg-accent"}`} asChild>
                                        <a href={to}>
                                            <Icon />
                                            <span className={`${to === pathname && "font-bold"}`}>{text}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}
