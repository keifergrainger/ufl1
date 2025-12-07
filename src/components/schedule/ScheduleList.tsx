"use client";

import { useState } from "react";
import { Game } from "@/data/schedule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Tv } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScheduleList({ initialData }: { initialData: Game[] }) {
    const [filter, setFilter] = useState<"ALL" | "HOME" | "AWAY">("ALL");

    const filteredGames = initialData.filter((game) => {
        if (filter === "HOME") return game.isHome;
        if (filter === "AWAY") return !game.isHome;
        return true;
    });

    return (
        <div className="space-y-8">
            {/* Filters */}
            <div className="flex justify-center gap-2 md:gap-4 overflow-x-auto pb-2">
                {(["ALL", "HOME", "AWAY"] as const).map((f) => (
                    <Button
                        key={f}
                        variant={filter === f ? "default" : "outline"}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "uppercase font-bold tracking-wider min-w-[100px]",
                            filter === f ? "bg-primary text-white hover:bg-primary/90" : "border-white/10 text-muted-foreground hover:text-white"
                        )}
                    >
                        {f === "ALL" ? "Full Schedule" : f}
                    </Button>
                ))}
            </div>

            {/* Desktop View (Table-like) */}
            <div className="hidden md:flex flex-col gap-4">
                {filteredGames.map((game) => (
                    <div
                        key={game.id}
                        className={cn(
                            "grid grid-cols-12 items-center gap-4 p-6 rounded-lg border transition-all hover:scale-[1.01]",
                            game.result === null
                                ? "bg-gradient-to-r from-card to-background border-white/10 shadow-lg" // Upcoming
                                : "bg-card/30 border-white/5 opacity-80 hover:opacity-100" // Past
                        )}
                    >
                        <div className="col-span-1 flex flex-col items-center justify-center border-r border-white/10 pr-4">
                            <span className="text-xs uppercase text-muted-foreground font-bold">Week</span>
                            <span className="text-xl font-black text-white">{game.week}</span>
                        </div>

                        <div className="col-span-2 flex flex-col text-sm font-medium">
                            <span className="text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {game.date}</span>
                            <span className="text-muted-foreground pl-6">{game.time}</span>
                        </div>

                        <div className="col-span-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-white/50">
                                VS
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-white uppercase tracking-tight">{game.opponent}</span>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    {game.isHome ? <Badge variant="secondary" className="text-[10px] h-5">HOME</Badge> : <Badge variant="outline" className="text-[10px] h-5 border-white/20">AWAY</Badge>}
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {game.venue}</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2 flex flex-col items-center justify-center">
                            {game.broadcaster && (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase bg-white/5 px-2 py-1 rounded">
                                    <Tv className="w-3 h-3" /> {game.broadcaster}
                                </div>
                            )}
                        </div>

                        <div className="col-span-2 flex justify-end">
                            {game.result ? (
                                <div className="flex flex-col items-end">
                                    <span className={cn("text-2xl font-black uppercase", game.result === "W" ? "text-green-500" : "text-red-500")}>
                                        {game.result === "W" ? "WIN" : "LOSS"}
                                    </span>
                                    <span className="text-sm font-bold text-white">{game.score}</span>
                                </div>
                            ) : (
                                <Button size="sm" className="bg-secondary text-secondary-foreground font-bold uppercase hover:bg-secondary/90">
                                    Get Tickets
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
                {filteredGames.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">No games found for this filter.</div>
                )}
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden flex flex-col gap-4">
                {filteredGames.map((game) => (
                    <div
                        key={game.id}
                        className={cn(
                            "flex flex-col gap-4 p-5 rounded-lg border bg-card",
                            game.result === null ? "border-secondary/30" : "border-white/5 opacity-90"
                        )}
                    >
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-white/20 text-muted-foreground">Week {game.week}</Badge>
                                {game.isHome ? <Badge variant="secondary">HOME</Badge> : <Badge variant="outline">AWAY</Badge>}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                                <Calendar className="w-3 h-3" /> {game.date.split(',')[0]}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs uppercase text-muted-foreground font-bold">Opponent</span>
                            <span className="text-2xl font-black text-white leading-none">{game.opponent}</span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" /> {game.venue}
                            </span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            {game.result ? (
                                <div className="flex items-center gap-3">
                                    <span className={cn("text-xl font-black uppercase", game.result === "W" ? "text-green-500" : "text-red-500")}>
                                        {game.result === "W" ? "WIN" : "LOSS"}
                                    </span>
                                    <span className="text-lg font-bold text-white">{game.score}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 w-full">
                                    <div className="flex flex-col text-xs font-medium text-muted-foreground">
                                        <span>{game.time}</span>
                                        <span className="uppercase">{game.broadcaster}</span>
                                    </div>
                                    <Button className="ml-auto bg-secondary text-secondary-foreground font-bold uppercase w-full max-w-[140px]">
                                        Tickets
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
