import ScheduleList from "@/components/schedule/ScheduleList";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
    title: "Schedule | Birmingham Stallions",
    description: "2024 Season Schedule and Results for the Birmingham Stallions.",
};

export default async function SchedulePage() {
    const supabase = await createClient();
    const { data: games } = await supabase.from('games').select('*').order('week', { ascending: true });

    // Map DB to UI Model
    const scheduleData = (games || []).map(g => ({
        id: g.id,
        week: g.week,
        opponent: g.opponent,
        opponentLogo: g.opponent_logo,
        date: g.date_display,
        time: g.time_display,
        venue: g.venue,
        isHome: g.is_home,
        result: g.result,
        score: (g.score_home !== null && g.score_away !== null) ? `${g.score_home}-${g.score_away}` : undefined,
        broadcaster: g.broadcaster,
        ticketUrl: g.ticket_url // Pass this through if the component supports it, otherwise it's just extra data
    }));

    return (
        <div className="container mx-auto px-4 lg:px-6 max-w-6xl py-12 md:py-20 min-h-screen">
            <div className="flex flex-col items-center mb-12 text-center">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4">Season Schedule</h1>
                <p className="text-muted-foreground max-w-2xl text-lg">
                    Follow the 3-time champions on their quest for glory.
                </p>
            </div>

            <ScheduleList initialData={scheduleData} />
        </div>
    );
}
