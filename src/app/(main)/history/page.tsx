import Timeline from "@/components/history/Timeline";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
    title: "History | Birmingham Stallions",
    description: "The championship legacy of the Birmingham Stallions.",
};

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
    const supabase = await createClient();
    const { data: events } = await supabase
        .from('history_events')
        .select('*')
        .order('display_order', { ascending: true });

    return (
        <div className="relative min-h-screen bg-[#050505] overflow-hidden">

            {/* === ATMOSPHERE LAYER (Moved from Timeline) === */}

            {/* 1. Base Stage Gradient (Floor) */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000000] pointer-events-none" />

            {/* 2. Smoky Fog (Static Clouds) */}
            <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-screen"
                style={{ background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.04) 0%, transparent 40%)' }}
            />

            {/* 3. Spotlights (Beams from Top Corners) - NOW ABOVE HEADER */}
            {/* Left Beam */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[120%] bg-gradient-to-b from-white/10 via-white/0 to-transparent transform rotate-[25deg] blur-2xl pointer-events-none mix-blend-overlay" />
            {/* Right Beam */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[120%] bg-gradient-to-b from-white/10 via-white/0 to-transparent transform -rotate-[25deg] blur-2xl pointer-events-none mix-blend-overlay" />

            {/* 4. Textured Dust (Noise) */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* 5. Brushed Metal Micro-Texture (Premium Tactile Feel) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 3px)`
                }}
            />

            {/* Content Container */}
            <div className="container mx-auto px-4 lg:px-6 max-w-6xl relative z-10 py-20">
                <div className="text-center mb-20 relative">
                    {/* Header Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-white/5 blur-[50px] pointer-events-none" />
                    <h1 className="relative text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6 drop-shadow-xl">
                        Our Legacy
                    </h1>
                    <p className="relative text-xl text-white/60 max-w-2xl mx-auto font-medium">
                        From the origins of the USFL to the unified UFL, the Stallions have set the standard for excellence.
                    </p>
                </div>

                <Timeline events={events || []} />
            </div>
        </div>
    );
}
