import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function FormAnalytics() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Form Analytics</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Total Forms: 10</p>
                <p>Total Submissions: 150</p>
                <p>Most Active Form: "Survey 2024"</p>
            </CardContent>
        </Card>
    );
}
