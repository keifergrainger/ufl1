import ScheduleList from "@/components/schedule/ScheduleList";
import { schedule } from "@/data/schedule";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Schedule | Birmingham Stallions",
    description: "2024 Season Schedule and Results for the Birmingham Stallions.",
};

export default function SchedulePage() {
    return (
        <div className="container py-12 md:py-20 min-h-screen">
            <div className="flex flex-col items-center mb-12 text-center">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4">Season Schedule</h1>
                <p className="text-muted-foreground max-w-2xl text-lg">
                    Follow the 3-time champions on their quest for glory.
                </p>
            </div>

            <ScheduleList initialData={schedule} />
        </div>
    );
}
