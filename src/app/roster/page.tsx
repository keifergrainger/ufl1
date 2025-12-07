import RosterGrid from "@/components/roster/RosterGrid";
import CoachSpotlight from "@/components/roster/CoachSpotlight";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Team Roster | Birmingham Stallions",
    description: "Meet the Birmingham Stallions player roster.",
};

export default function RosterPage() {
    return (
        <div className="container py-12 md:py-20 min-h-screen">
            <div className="flex flex-col items-start mb-12">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4">Active Roster</h1>
                <p className="text-muted-foreground max-w-2xl text-lg">
                    The athletes defending the championship title.
                </p>
            </div>

            <CoachSpotlight />
            <RosterGrid />
        </div>
    );
}
