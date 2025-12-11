import { MapPin, SignalHigh } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface NextGameData {
    week: string;
    opponent: string;
    venue: string;
    broadcaster: string;
    is_home: boolean;
    ticket_url?: string;
    stallions_record?: string;
}

export default function NextGameCard({ game }: { game: NextGameData }) {
    if (!game) return null;

    const homeTeamName = game.is_home ? "Stallions" : game.opponent.split(' ').pop();
    const homeTeamLocation = game.is_home ? "Birmingham" : game.opponent.split(' ').slice(0, -1).join(' ');
    // If Stallions are home, use passed record. If Opponent is home, we don't have their record, use placeholder or hide.
    const homeTeamRecord = game.is_home ? game.stallions_record : "0-0";

    const awayTeamName = game.is_home ? game.opponent.split(' ').pop() : "Stallions";
    const awayTeamLocation = game.is_home ? game.opponent.split(' ').slice(0, -1).join(' ') : "Birmingham";
    const awayTeamRecord = game.is_home ? "0-0" : game.stallions_record;

    return (
        <div className="container max-w-5xl w-full mx-auto mt-8 md:-mt-24 relative z-30 px-4">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none rounded-3xl -z-10" />
                <div className="relative group">
                    {/* Subtle outer glow for separation */}
                    <div className="absolute -inset-4 rounded-xl bg-secondary/[0.35] blur-2xl pointer-events-none opacity-80" />

                    {/* Large Soft Shadow / Glow - Kept but tweaked to be subtler backing */}
                    <div className="absolute -inset-4 bg-black/40 rounded-[2rem] blur-xl opacity-100 transition duration-1000 pointer-events-none"></div>

                    {/* Bottom Soft Fade for "Floating" Effect */}
                    <div className="absolute -bottom-6 left-0 w-full h-10 bg-black/40 blur-2xl pointer-events-none" />

                    {/* Main Card - Metal Look */}
                    <Card className="relative rounded-xl bg-gradient-to-b from-black/80 to-black/95 shadow-[0_0_40px_rgba(0,0,0,0.6)] border border-white/5 overflow-hidden">
                        {/* Inner Bevel / Sheen */}
                        <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-b from-white/5 via-transparent to-black/40 mix-blend-soft-light z-10" />

                        {/* Top Bar: Metal Header Look + Gold Top Border */}
                        <div className="border-b-2 border-secondary/60 bg-gradient-to-b from-black/40 to-black/80 py-3 px-6 flex items-center justify-between relative shadow-lg z-20">
                            {/* Subtle Top Rim Shadow */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-secondary/15 shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />

                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                                <span className="text-xs font-bold uppercase tracking-widest text-white/70">Next Matchup</span>
                            </div>
                            <div className="text-xs font-black uppercase text-secondary tracking-[0.2em] flex items-center gap-2">
                                WEEK {game.week} <span className="text-white/20">|</span> UFL 2026
                            </div>
                        </div>

                        <CardContent className="p-0 relative z-20">
                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] relative">
                                {/* HOME TEAM */}
                                <div className="relative p-8 flex flex-col items-center justify-center border-b lg:border-b-0 border-white/5">
                                    <Badge className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/5 text-white/50 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest border-0 px-3 py-1">
                                        Home
                                    </Badge>
                                    <div className="mt-2 text-center flex flex-col items-center">
                                        <div className="text-4xl md:text-6xl font-black uppercase text-white tracking-wide leading-none mb-0 drop-shadow-2xl">
                                            {homeTeamName}
                                        </div>
                                        <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 mt-2">
                                            <span className="text-lg font-bold text-muted-foreground uppercase tracking-wider">{homeTeamLocation}</span>
                                            {homeTeamRecord && (
                                                <>
                                                    <div className="hidden md:block h-4 w-px bg-white/10" />
                                                    <span className="text-2xl font-black text-white">{homeTeamRecord}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* VS Divider - Medallion Style */}
                                <div className="relative h-32 lg:h-auto flex items-center justify-center w-full lg:w-40 z-20 my-[-1rem] lg:my-0">
                                    {/* Vertical Separators for the "Scoreboard Cards" feel - Left and Right of VS */}
                                    <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-16 bg-white/5" />
                                    <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-white/5" />

                                    {/* VS Badge with Trailing Glow */}
                                    <div className="relative w-20 h-20 flex items-center justify-center">
                                        {/* Rotating Trailing Glow */}
                                        <div className="absolute inset-[-3px] rounded-full animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg,transparent_0%,transparent_50%,#C5B783_100%)] opacity-70 blur-sm mix-blend-screen" />

                                        {/* Solid Medallion */}
                                        <div className="relative w-full h-full rounded-full bg-[#0B0B0C] border-2 border-[#C5B783]/30 flex items-center justify-center shadow-[0_0_20px_rgba(197,183,131,0.3)] z-10">
                                            <div className="absolute inset-1 rounded-full border border-white/10" />
                                            <span className="text-[#C5B783] font-black tracking-wider text-xl drop-shadow-lg">VS</span>
                                        </div>
                                    </div>
                                </div>

                                {/* AWAY TEAM */}
                                <div className="relative p-8 flex flex-col items-center justify-center border-t lg:border-t-0 border-white/5">
                                    <Badge className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/5 text-white/50 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest border-0 px-3 py-1">
                                        Away
                                    </Badge>
                                    <div className="mt-2 text-center flex flex-col items-center">
                                        <div className="text-4xl md:text-6xl font-black uppercase text-white tracking-wide leading-none mb-0 drop-shadow-2xl">
                                            {awayTeamName}
                                        </div>
                                        <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3 mt-2">
                                            <span className="text-lg font-bold text-muted-foreground uppercase tracking-wider">{awayTeamLocation}</span>
                                            {awayTeamRecord && (
                                                <>
                                                    <div className="hidden md:block h-4 w-px bg-white/10" />
                                                    <span className="text-2xl font-black text-white">{awayTeamRecord}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Info Bar - Unified Strip */}
                            <div className="w-full bg-black/40 border-t border-white/10 backdrop-blur-sm px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">

                                {/* Left: Stadium + Home Game */}
                                <div className="flex items-center justify-center md:justify-start gap-4 px-4 py-1.5 rounded-full border border-white/5 bg-black/20 text-xs md:text-sm font-medium uppercase text-muted-foreground tracking-wider">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-white">{game.venue}</span>
                                        <span className="text-white/10">|</span>
                                        <span className="text-secondary/80 font-bold">{game.is_home ? "Home Game" : "Away Game"}</span>
                                    </div>
                                </div>

                                {/* Center: Broadcast Pill */}
                                <div className="px-6 py-1.5 rounded-full border border-white/10 bg-black/60 text-xs font-bold uppercase tracking-wider text-white shadow-inner flex items-center gap-2">
                                    <SignalHigh className="w-3 h-3 text-secondary" />
                                    <span>Broadcast: {game.broadcaster || "FOX"}</span>
                                </div>

                                {/* Right: Buy Tickets Button */}
                                <div className="flex justify-center md:justify-end w-full md:w-auto">
                                    {game.ticket_url ? (
                                        <Link href={game.ticket_url} target="_blank">
                                            <Button className="w-full md:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:scale-105 hover:shadow-[0_0_20px_rgba(197,183,131,0.2)] transition-all duration-300 font-black uppercase px-6 text-xs tracking-wider border border-[#C5B783]/50 h-9">
                                                Buy Tickets
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button disabled className="w-full md:w-auto bg-neutral-800 text-neutral-500 font-black uppercase px-6 text-xs tracking-wider border border-white/5 h-9">
                                            Tickets Not Available
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
