import { Card, CardContent } from "@/components/ui/card";
import { FileText, BarChart, Calendar, Activity, Percent } from "lucide-react";

export default function OverviewStats({ totalForms, totalSubmissions, completionRate, systemStatus }: { totalForms: number, totalSubmissions: number, completionRate: string, systemStatus: string }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="flex items-center gap-4 p-4">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <div>
                        <p className="text-lg font-bold">{totalForms}</p>
                        <p className="text-sm">Total Forms</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="flex items-center gap-4 p-4">
                    <BarChart className="w-6 h-6 text-green-500" />
                    <div>
                        <p className="text-lg font-bold">{totalSubmissions}</p>
                        <p className="text-sm">Total Submissions(Published, Archived)</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="flex items-center gap-4 p-4">
                    <Percent className="w-6 h-6 text-purple-500" />
                    <div>
                        <p className="text-lg font-bold">{completionRate}</p>
                        <p className="text-sm">Completion Rate</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="flex items-center gap-4 p-4">
                    <Activity className="w-6 h-6 text-red-500" />
                    <div>
                        <p className="text-lg font-bold">{systemStatus}</p>
                        <p className="text-sm">System Status</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}