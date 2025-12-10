import RosterGrid from "@/components/roster/RosterGrid";
import CoachSpotlight from "@/components/roster/CoachSpotlight";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
    title: "Team Roster | Birmingham Stallions",
    description: "Meet the Birmingham Stallions player roster.",
};

export default async function RosterPage() {
    const supabase = await createClient();

    const { data: players } = await supabase
        .from('players')
        .select('*')
        .eq('active', true)
        .order('number', { ascending: true });

    const { data: coaches } = await supabase
        .from('coaches')
        .select('*')
        .order('sort_order', { ascending: true });

    return (
        <div className="container mx-auto px-4 lg:px-6 max-w-6xl py-12 md:py-20 min-h-screen">
            <div className="flex flex-col items-start mb-12">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4">Active Roster</h1>
                <p className="text-muted-foreground max-w-2xl text-lg">
                    The athletes defending the championship title.
                </p>
            </div>

            <CoachSpotlight initialCoaches={coaches || []} />
            <RosterGrid initialPlayers={players || []} />
        </div>
    );
}
