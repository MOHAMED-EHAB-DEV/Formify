'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { IEvent } from "@/lib/models/event";
import { formatDistanceToNow } from "date-fns";

interface EventWithUser extends Omit<IEvent, 'userId'> {
    userId: {
        name: string;
        email: string;
    };
}

interface RecentActivityProps {
    events: EventWithUser[];
}

export default function RecentActivity({ events }: RecentActivityProps) {
    const getEventIcon = (type: string) => {
        switch (type) {
            case 'form_created':
                return '📝';
            case 'form_updated':
                return '✏️';
            case 'form_submitted':
                return '✅';
            case 'form_deleted':
                return '🗑️';
            default:
                return '📌';
        }
    };

    const getEventMessage = (event: EventWithUser) => {
        switch (event.type) {
            case 'form_created':
                return `created form "${event.formTitle}"`;
            case 'form_updated':
                return `updated form "${event.formTitle}"`;
            case 'form_submitted':
                return `received a submission for "${event.formTitle}"`;
            case 'form_deleted':
                return `deleted form "${event.formTitle}"`;
            default:
                return 'performed an action';
        }
    };

    return (
        <Card>
            <CardHeader className='flex justify-between items-center'>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {events.map((event) => (
                        <div key={event.id} className="flex items-start gap-4">
                            <span className="text-xl">{getEventIcon(event.type)}</span>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {event.userId.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {getEventMessage(event)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No recent activity
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}