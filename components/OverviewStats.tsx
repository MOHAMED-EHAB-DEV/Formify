import { Card, CardContent } from "@/components/ui/card";
import { FileText, BarChart, Calendar, Activity, } from "lucide-react";

export default function OverviewStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="flex items-center gap-4 p-4">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <div>
                        <p className="text-lg font-bold">10</p>
                        <p className="text-sm">Total Forms</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="flex items-center gap-4 p-4">
                    <BarChart className="w-6 h-6 text-green-500" />
                    <div>
                        <p className="text-lg font-bold">150</p>
                        <p className="text-sm">Total Submissions</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="flex items-center gap-4 p-4">
                    <Calendar className="w-6 h-6 text-yellow-500" />
                    <div>
                        <p className="text-lg font-bold">2</p>
                        <p className="text-sm">Upcoming Deadlines</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="flex items-center gap-4 p-4">
                    <Activity className="w-6 h-6 text-red-500" />
                    <div>
                        <p className="text-lg font-bold">Online</p>
                        <p className="text-sm">System Status</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}