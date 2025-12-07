"use client";

import { Button } from "@/components/ui/button";
import { Ticket, CalendarDays, Timer } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

// Countdown hook
const useCountdown = (targetDate: Date) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const diff = targetDate.getTime() - now.getTime();

            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            } else {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return timeLeft;
};

export default function Hero() {
    // 3 days from now at 7PM demo kickoff time
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    targetDate.setHours(19, 0, 0, 0);

    const { days, hours, minutes, seconds } = useCountdown(targetDate);

    const dd = String(days).padStart(2, "0");
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return (
        <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden border-b-4 border-secondary/20">
            {/* BACKGROUND STADIUM */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://cdn.discordapp.com/attachments/723741657048285275/1446746206549315655/88e24751-2024-06-03_Birmingham-Stallions-feature_16x9.png?ex=69351ae6&is=6933c966&hm=c91c6f420080474ab12be08e4a1e22f7a36c207d41bf93fc35fc83ef340675a3&"
                    alt="Football stadium at night"
                    fill
                    className="object-cover opacity-100 blur-[1px]"
                    priority
                />
                {/* Darken center for better text contrast - Adjusted lighter & lower */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_65%,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.2)_40%,transparent_75%)] pointer-events-none z-[1]" />
                {/* Dark / red overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-[#3a0000]/80" />
                {/* Top Vignette - Helmet Contrast (User Request) */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent z-[1] pointer-events-none" />
                {/* Spotlight effect */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />
                {/* Top Dark Gradient - Helmet Contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
                {/* Top Stadium Light Flare - Prominent Mood */}
                <div className="absolute top-[-10%] left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.4)_0%,transparent_70%)] opacity-70 pointer-events-none mix-blend-screen" />
            </div>

            {/* FIELD LINES / TEXTURE AT BOTTOM */}
            <div className="absolute inset-x-0 bottom-0 h-[35%] bg-[repeating-linear-gradient(90deg,transparent,transparent_18px,rgba(255,255,255,0.18)_18px,rgba(255,255,255,0.18)_20px)] opacity-20 mix-blend-screen pointer-events-none" />
            <div className="absolute inset-x-0 bottom-[18%] h-px bg-white/30 opacity-40 pointer-events-none" />

            {/* 2. Light Sweep Animation (CSS) */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-[30deg] translate-x-[-100%] animate-light-sweep pointer-events-none z-10" />





            {/* MAIN CONTENT */}
            <div className="container relative z-20 flex flex-col items-center text-center pt-20 pb-32">

                {/* Crest Overlay (Behind Text) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[600px] h-[600px] border-[20px] border-white/5 rounded-full blur-sm opacity-20 pointer-events-none -z-10 flex items-center justify-center">
                    <div className="w-[80%] h-[80%] border-[2px] border-white/10 rounded-full" />
                </div>

                {/* Game Context Banner - AGGRESSIVE SKEW */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-8 transform -skew-x-12">
                    <div className="bg-black/80 backdrop-blur-md border border-secondary/50 px-8 py-3 flex items-center gap-4 shadow-[10px_10px_0px_0px_rgba(197,183,131,0.2)]">
                        <span className="text-secondary font-black uppercase tracking-wider text-sm flex items-center gap-2">
                            Game Week 4
                        </span>
                        <div className="w-0.5 h-4 bg-secondary/50 rotate-12" />
                        <span className="text-white font-bold text-base uppercase tracking-tight">vs DC Defenders</span>
                        <div className="hidden md:block w-0.5 h-4 bg-secondary/50 rotate-12" />
                        <span className="text-white/80 text-xs font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 -skew-x-6">Apr 20 • 7:00 PM</span>
                    </div>
                </div>

                {/* Main Headline */}
                <h1 className="relative text-7xl md:text-9xl lg:text-[11rem] font-black uppercase tracking-tighter text-white mb-4 leading-[0.85] italic">
                    <span className="inline-block relative z-10">
                        <span className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">We Are</span>
                        {/* Animated Gold Wipe - Anchored to Text */}
                        <div className="absolute bottom-2 left-[54%] -translate-x-1/2 w-[105%] h-[40%] bg-gradient-to-r from-secondary/20 via-secondary/80 to-secondary/20 animate-gold-shine rounded-sm -z-10 mix-blend-screen" />
                    </span>
                    <br className="md:hidden" />
                    <span className="relative inline-block text-transparent bg-clip-text bg-white z-10 text-outline-black drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] pr-8">
                        Birmingham
                    </span>
                </h1>

                {/* Subheadline & Record */}
                <div className="flex flex-col items-center gap-4 mb-12 transform -skew-x-6">
                    <p className="text-2xl md:text-3xl text-white font-black italic tracking-tight uppercase drop-shadow-md bg-black/40 px-4 py-1">
                        Defending the Dynasty
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="h-1 w-12 bg-secondary skew-x-12" />
                        <p className="text-lg font-bold uppercase tracking-widest text-secondary drop-shadow-sm">
                            32–4 All-Time Record
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
        </section >
    );
}
