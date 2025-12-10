"use client";

import { Button } from "@/components/ui/button";
import { Ticket, CalendarDays, Timer, MapPin, SignalHigh } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";

// Countdown hook
const useCountdown = (targetDate: Date) => {
    const calculateTimeLeft = () => {
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();

        if (diff > 0) {
            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / 1000 / 60) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            };
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return timeLeft;
};

export default function Hero({
    heroTitleHighlight = "We Are",
    heroTitle = "Birmingham",
    heroSubtitle = "Defending the Dynasty",
    teamRecord = "32-4 All-Time Record",
    nextOpponentName = "DC Defenders",
    nextGameWeek = "4",
    nextGameDateTime = null, // ISO String
    nextGameBroadcast = "FOX",
    formattedDate,
    formattedTime
}: {
    heroTitleHighlight?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    teamRecord?: string;
    nextOpponentName?: string;
    nextGameWeek?: string;
    nextGameDateTime?: string | null;
    nextGameBroadcast?: string;
    formattedDate?: string;
    formattedTime?: string;
}) {
    // Default to 3 days from now if no date provided
    // Or parse the provided string
    // useMemo to prevent Effect loops
    const targetDate = useMemo(() => {
        const d = nextGameDateTime ? new Date(nextGameDateTime) : new Date();
        if (!nextGameDateTime) {
            d.setDate(d.getDate() + 3);
            d.setHours(19, 0, 0, 0);
        }
        return d;
    }, [nextGameDateTime]);

    const { days, hours, minutes, seconds } = useCountdown(targetDate);

    // Server/Initial defaults (Pre-formatted server string -> Client Hydration match)
    const [displayDate, setDisplayDate] = useState(formattedDate || targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const [displayTime, setDisplayTime] = useState(formattedTime || targetDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));

    useEffect(() => {
        // Client-side: Recalculate based on user's browser timezone
        if (typeof window !== 'undefined') {
            setDisplayDate(targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            setDisplayTime(targetDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
        }
    }, [targetDate]);

    const dd = String(days).padStart(2, "0");
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return (
        // SHARED CONTAINER: Standard min-h-screen to avoid dvh resize jitter
        <section className="relative w-full min-h-screen md:min-h-[85vh] flex flex-col justify-center items-center overflow-hidden border-b-4 border-secondary/20 bg-black">

            {/* =========================================
             SHARED BACKGROUND (Cinematic Stack)
             ========================================= */}
            <div className="absolute inset-0 z-0 overflow-hidden h-[110%] w-full">
                <Image
                    src="https://cdn.discordapp.com/attachments/723741657048285275/1446746206549315655/88e24751-2024-06-03_Birmingham-Stallions-feature_16x9.png?ex=693b09a6&is=6939b826&hm=48eb0d692408c3e889a38c648be6adba4900c450eeda772c6eb130951d42d821&"
                    alt="Football stadium at night"
                    fill
                    className="object-cover opacity-100 blur-[1px]"
                    priority
                />

                {/* --- DESKTOP OVERLAYS MOVED HERE (Shared) --- */}

                {/* Darken center for better text contrast */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_65%,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.2)_40%,transparent_75%)] pointer-events-none z-[1]" />

                {/* Dark / red overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-[#3a0000]/80" />

                {/* Top Vignette - Helmet Contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent z-[1] pointer-events-none" />

                {/* Spotlight effect */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />

                {/* Top Dark Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />

                {/* Top Stadium Light Flare */}
                <div className="absolute top-[-10%] left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.4)_0%,transparent_70%)] opacity-70 pointer-events-none mix-blend-screen" />

                {/* Field Lines / Texture at Bottom */}
                <div className="absolute inset-x-0 bottom-0 h-[35%] bg-[repeating-linear-gradient(90deg,transparent,transparent_18px,rgba(255,255,255,0.18)_18px,rgba(255,255,255,0.18)_20px)] opacity-20 mix-blend-screen pointer-events-none" />
                <div className="absolute inset-x-0 bottom-[18%] h-px bg-white/30 opacity-40 pointer-events-none" />
            </div>


            {/* =========================================
             MOBILE FOREGROUND - Robust Static Layout (No Jumps)
             ========================================= */}
            <div className="relative z-20 flex flex-col items-center pt-28 pb-32 px-4 min-h-screen md:hidden">

                {/* 1. TOP GAME BANNER */}
                <div className="flex items-center mb-14 transform -skew-x-12">
                    <div className="bg-black/80 backdrop-blur-md border border-secondary/50 px-5 py-2 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(197,183,131,0.2)]">
                        <span className="text-secondary font-black uppercase tracking-wider text-xs">
                            Week {nextGameWeek}
                        </span>
                        <div className="w-0.5 h-4 bg-secondary/50 rotate-12" />
                        <span className="text-white font-bold text-sm uppercase tracking-tight">vs {nextOpponentName?.split(' ').pop()}</span>
                        <div className="w-0.5 h-4 bg-secondary/50 rotate-12" />
                        <span className="text-white/80 text-xs font-bold uppercase tracking-wide">{displayDate} • {displayTime}</span>
                    </div>
                </div>

                {/* 2. MAIN HEADLINE */}
                <h1 className="relative text-5xl font-black uppercase tracking-tighter text-white mb-4 leading-[0.85] italic flex flex-col items-center">
                    <span className="relative inline-block z-10 px-6 py-2 mx-2">
                        {/* Text Span with extra padding for italic safety */}
                        <span className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] relative z-20 inline-block pr-3 italic">{heroTitleHighlight}</span>
                        {/* Gold Bar Background */}
                        <div className="absolute inset-0 bg-[#C5B783] rounded z-0 shadow-[0_0_15px_rgba(197,183,131,0.4)] overflow-hidden transform -skew-x-12">
                            {/* Shimmer Animation */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_2s_infinite]" />
                        </div>
                    </span>
                    <span className="relative inline-block z-10 drop-shadow-[0_5px_10px_rgba(0,0,0,0.75)] mt-3 text-[1.15em]">
                        {heroTitle}
                    </span>
                </h1>

                {/* 3. SUBHEAD & RECORD */}
                <div className="flex flex-col items-center gap-2 mb-8 transform -skew-x-6">
                    <p className="text-sm text-white font-black italic tracking-tight uppercase drop-shadow-md bg-black/40 px-4 py-1">
                        {heroSubtitle}
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="h-0.5 w-8 bg-secondary skew-x-12" />
                        <p className="text-sm font-bold uppercase tracking-widest text-secondary drop-shadow-sm">
                            {teamRecord}
                        </p>
                        <div className="h-0.5 w-8 bg-secondary skew-x-12" />
                    </div>
                </div>

                {/* 4. COUNTDOWN */}
                <div className="flex items-center gap-2 mb-auto text-white bg-black/70 px-5 py-2 rounded-full border border-white/10 shadow-lg">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-60 animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
                    </span>
                    <span className="text-[10px] font-black uppercase text-secondary tracking-widest">Kickoff in</span>
                    <div className="font-mono text-sm font-bold tracking-wider flex items-center gap-1 leading-none" suppressHydrationWarning>
                        <span>{dd}<span className="text-[8px] text-white/40 ml-0.5 font-sans">d</span></span> :
                        <span>{hh}<span className="text-[8px] text-white/40 ml-0.5 font-sans">h</span></span> :
                        <span>{mm}<span className="text-[8px] text-white/40 ml-0.5 font-sans">m</span></span> :
                        <span className="text-secondary">{ss}<span className="text-[8px] text-white/40 ml-0.5 font-sans">s</span></span>
                    </div>
                </div>

                {/* 5. CTAs - Fixed at bottom of flow */}
                <div className="flex flex-col gap-3 w-full max-w-sm mt-8">
                    <Button
                        size="lg"
                        className="w-full h-14 px-8 text-base font-black bg-secondary text-black hover:bg-white hover:text-black uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)] transform -skew-x-12 rounded-none transition-all duration-300"
                    >
                        <span className="skew-x-12 flex items-center gap-2">
                            <Ticket className="w-5 h-5" /> Buy Tickets
                        </span>
                    </Button>
                    <Button
                        size="lg"
                        variant="ghost"
                        className="w-full h-14 px-8 text-base font-black border-2 border-[#d2b15b]/50 text-white hover:bg-secondary hover:text-black hover:border-secondary uppercase tracking-tight transform -skew-x-12 rounded-none bg-black/30 transition-all duration-300"
                        asChild
                    >
                        <Link href="/schedule">
                            <span className="skew-x-12 flex items-center gap-2">
                                <CalendarDays className="w-5 h-5" /> View Schedule
                            </span>
                        </Link>
                    </Button>
                </div>
            </div>


            {/* =========================================
             DESKTOP FOREGROUND (Cinematic Text)
             ========================================= */}
            <div className="container relative z-20 flex-col items-center text-center pt-20 pb-32 hidden md:flex">

                {/* Crest Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[600px] h-[600px] border-[20px] border-white/5 rounded-full blur-sm opacity-20 pointer-events-none -z-10 flex items-center justify-center">
                    <div className="w-[80%] h-[80%] border-[2px] border-white/10 rounded-full" />
                </div>

                {/* Game Context Banner */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-8 transform -skew-x-12">
                    <div className="bg-black/80 backdrop-blur-md border border-secondary/50 px-8 py-3 flex items-center gap-4 shadow-[10px_10px_0px_0px_rgba(197,183,131,0.2)]">
                        <span className="text-secondary font-black uppercase tracking-wider text-sm flex items-center gap-2">
                            Game Week {nextGameWeek}
                        </span>
                        <div className="w-0.5 h-4 bg-secondary/50 rotate-12" />
                        <span className="text-white font-bold text-base uppercase tracking-tight">vs {nextOpponentName}</span>
                        <div className="hidden md:block w-0.5 h-4 bg-secondary/50 rotate-12" />
                        <span className="text-white/80 text-xs font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 -skew-x-6">{displayDate} • {displayTime}</span>
                    </div>
                </div>

                {/* Main Headline */}
                <h1 className="relative text-6xl md:text-8xl lg:text-9xl xl:text-[11rem] font-black uppercase tracking-tighter text-white mb-4 leading-[0.85] italic flex flex-col items-center">

                    {/* Highlighted Line */}
                    <span className="relative inline-block z-10 pl-2 pr-8 md:pl-4 md:pr-14">
                        <span className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] relative z-20">{heroTitleHighlight}</span>
                        {/* Animated Gold Wipe */}
                        <div className="absolute top-1/2 left-0 -translate-y-[45%] w-full h-[85%] bg-gradient-to-r from-secondary/40 via-secondary/90 to-secondary/40 animate-gold-shine rounded-md z-0 mix-blend-screen shadow-[0_0_20px_rgba(197,183,131,0.3)]" />
                    </span>

                    {/* Main Title Line */}
                    <span className="relative inline-block z-10 drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
                        {heroTitle}
                    </span>
                </h1>

                {/* Subheadline & Record */}
                <div className="flex flex-col items-center gap-4 mb-12 transform -skew-x-6">
                    <p className="text-2xl md:text-3xl text-white font-black italic tracking-tight uppercase drop-shadow-md bg-black/40 px-4 py-1">
                        {heroSubtitle}
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="h-1 w-12 bg-secondary skew-x-12" />
                        <p className="text-lg font-bold uppercase tracking-widest text-secondary drop-shadow-sm">
                            {teamRecord}
                        </p>
                        <div className="h-1 w-12 bg-secondary skew-x-12" />
                    </div>
                </div>

                {/* Countdown */}
                <div className="mb-12 flex items-center gap-4 text-white bg-black/80 px-8 py-4 transform -skew-x-12 border-l-4 border-l-secondary shadow-2xl">
                    <div className="skew-x-12 flex items-center gap-3">
                        <Timer className="w-5 h-5 text-secondary animate-pulse" />
                        <span className="text-sm font-black uppercase text-secondary tracking-widest mr-2">Kickoff in</span>
                        <div className="font-mono text-2xl font-bold tracking-wider flex items-center gap-2 leading-none">
                            <span>{dd}<span className="text-[10px] text-white/30 ml-0.5 font-sans">d</span></span> :
                            <span>{hh}<span className="text-[10px] text-white/30 ml-0.5 font-sans">h</span></span> :
                            <span>{mm}<span className="text-[10px] text-white/30 ml-0.5 font-sans">m</span></span> :
                            <span className="text-secondary">{ss}<span className="text-[10px] text-white/30 ml-0.5 font-sans">s</span></span>
                        </div>
                    </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-8 w-full sm:w-auto mt-4">
                    <Button
                        size="lg"
                        className="w-full sm:w-auto h-20 px-12 text-2xl font-black bg-secondary text-black hover:bg-white hover:text-black uppercase tracking-tight shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] transform -skew-x-12 rounded-none transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.5)]"
                    >
                        <span className="skew-x-12 flex items-center gap-2">
                            <Ticket className="w-6 h-6" /> Buy Tickets
                        </span>
                    </Button>
                    <Button
                        size="lg"
                        variant="ghost"
                        className="w-full sm:w-auto h-20 px-12 text-2xl font-black border-2 border-white/20 text-white hover:bg-secondary hover:text-black hover:border-secondary uppercase tracking-tight transform -skew-x-12 rounded-none backdrop-blur-sm transition-all duration-300"
                        asChild
                    >
                        <Link href="/schedule">
                            <span className="skew-x-12 flex items-center gap-2">
                                <CalendarDays className="w-6 h-6" /> View Schedule
                            </span>
                        </Link>
                    </Button>
                </div>
            </div>

        </section>
    );
}
