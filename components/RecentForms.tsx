import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function RecentForms() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Forms</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    <li>Form 1 - Last updated 2 days ago</li>
                    <li>Form 2 - Last updated 5 days ago</li>
                    <li>Form 3 - Last updated 1 week ago</li>
                </ul>
            </CardContent>
        </Card>
    );
}