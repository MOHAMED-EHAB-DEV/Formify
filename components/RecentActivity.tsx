'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RecentActivity() {
    const [open, setOpen] = useState(false);
    return (
        <Card>
            <CardHeader className='flex justify-between items-center'>
                <CardTitle>Recent Activity</CardTitle>
                <DropdownMenu open={open} onOpenChange={(open) => setOpen(open)}>
                    <DropdownMenuTrigger className='flex items-center justify-center'>Form A {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuItem>Subscription</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    <li>✔️ Form "Survey 2024" was submitted.</li>
                    <li>✏️ "User A" edited Form X.</li>
                    <li>📅 Deadline for Form Y in 3 days.</li>
                </ul>
            </CardContent>
        </Card>
    );
}