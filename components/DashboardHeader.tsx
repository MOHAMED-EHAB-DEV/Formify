'use client';

import { EllipsisVertical, CirclePlus } from "lucide-react";
import { redirect } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardHeader({ username, activeForms }: { username: string, activeForms: number }) {
    const date = new Date().toDateString();
    return (
        <Card>
            <CardHeader className="flex gap-2 justify-between">
                <div className="flex flex-col justify-center gap-2">
                    <CardTitle>Welcome back, {username}!</CardTitle>
                    <CardDescription>{date}</CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <EllipsisVertical />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => redirect("/forms/create-form")} className="cursor-pointer flex items-center justify-center gap-2">
                            <CirclePlus /> New Form
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <p>You have {activeForms} active forms.</p>
            </CardContent>
        </Card>
    );
}