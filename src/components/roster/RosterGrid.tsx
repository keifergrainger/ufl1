"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the Player interface matching Supabase
interface Player {
    id: string;
    name: string;
    number: string;
    position: string;
    unit: string; // May be missing in scraped data, default to "Unknown"
    height: string;
    weight: string;
    college: string;
    image_url?: string;
}

const UNITS = ["ALL", "Offense", "Defense", "Special Teams"];

export default function RosterGrid() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeUnit, setActiveUnit] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchRoster() {
            try {
                const res = await fetch('/api/players?status=approved');
                const data = await res.json();
                setPlayers(data);
            } catch (error) {
                console.error("Failed to load roster", error);
            } finally {
                setLoading(false);
            }
        }
        fetchRoster();
    }, []);

    const filteredRoster = players.filter((player) => {
        // Simple unit inference if missing (optional enhancement: add unit editing in admin)
        const playerUnit = player.unit || "Offense";

        const matchesUnit = activeUnit === "ALL" || playerUnit === activeUnit;
        const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (player.position || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesUnit && matchesSearch;
    });

    if (loading) return <div className="text-white text-center p-10">Loading Roster...</div>;

    return (
        <div className="space-y-8">
            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-card p-6 rounded-lg border border-white/5">

                {/* Unit Tabs */}
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {UNITS.map((unit) => (
                        <Button
                            key={unit}
                            variant={activeUnit === unit ? "default" : "ghost"}
                            onClick={() => setActiveUnit(unit)}
                            className={cn(
                                "uppercase font-bold tracking-wider",
                                activeUnit === unit
                                    ? "bg-primary text-white hover:bg-primary/90"
                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}
                        >
                            {unit}
                        </Button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or position..."
                        className="pl-10 bg-black/50 border-white/10 text-white placeholder:text-muted-foreground"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRoster.map((player) => (
                    <div
                        key={player.id}
                        className="group relative bg-card rounded-lg overflow-hidden border border-white/5 hover:border-secondary/50 transition-all hover:translate-y-[-4px]"
                    >
                        {/* Image Area */}
                        <div className="h-[300px] w-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-end justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors z-10" />

                            {player.image_url ? (
                                <img src={player.image_url} alt={player.name} className="w-full h-full object-cover z-0" />
                            ) : (
                                <User className="w-48 h-48 text-white/5 absolute bottom-0 mb-[-20px] z-0 scale-150" />
                            )}

                            {/* Number Overlay */}
                            <div className="absolute top-4 right-4 text-5xl font-black text-white/5 font-mono select-none z-0">
                                {player.number}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col relative z-20 bg-card border-t border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="border-secondary text-secondary font-bold text-xs">{player.position}</Badge>
                                <span className="text-muted-foreground text-sm font-mono">#{player.number}</span>
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1 group-hover:text-primary transition-colors">
                                {player.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                                <span>{player.height}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span>{player.weight}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span className="uppercase">{player.college}</span>
                            </div>

                            <a
                                href={`/roster/${player.id}`}
                                className="w-full text-center bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase py-2 rounded transition"
                            >
                                Full Bio
                            </a>
                        </div>
                    </div>
                ))}

                {filteredRoster.length === 0 && (
                    <div className="col-span-full text-center py-20 text-muted-foreground">No approved players found. Import and approve them in the Admin Dashboard!</div>
                )}
            </div>
        </div>
    );
}
