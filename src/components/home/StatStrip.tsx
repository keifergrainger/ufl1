"use client";

import { Trophy, Star, MapPin } from "lucide-react";
import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

function Counter({ from, to, duration = 1.5 }: { from: number; to: number; duration?: number }) {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const isInView = useInView(nodeRef, { once: true, margin: "-50px" });

    useEffect(() => {
        if (!isInView) return;

        const element = nodeRef.current;
        if (!element) return;

        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);

            element.textContent = Math.floor(progress * (to - from) + from).toString();

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [isInView, from, to, duration]);

    return <span ref={nodeRef}>{from}</span>;
}

// stats array cleared

export default function StatStrip() {
    return (
        // Lighter black panel, Gold Top Border matching scoreboard inner ring
        <section className="relative py-16 border-t border-[#C5B783]/20 border-b border-white/5 bg-[#0c0c0c] overflow-hidden">
            {/* Field Texture Background (Diagonal Lines) - Kept per request */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}
            />

            <div className="container max-w-5xl mx-auto relative z-10 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-baseline">

                    {/* Left: Championships */}
                    <div className="flex flex-col items-center text-center group p-8 lg:border-r border-white/5">
                        <Trophy className="w-10 h-10 text-secondary mb-5 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_8px_rgba(197,183,131,0.3)]" />
                        <div className="text-4xl md:text-5xl font-black text-white mb-2 flex items-baseline drop-shadow-lg">
                            <Counter from={0} to={3} duration={1.2} />
                        </div>
                        <div className="text-sm font-bold uppercase tracking-widest text-[#C5B783] mb-1">Championships</div>
                        <div className="text-[10px] uppercase text-white/40 font-bold tracking-wider">2022 • 2023 • 2024</div>
                    </div>

                    {/* Center: All-Time Wins (Aligned with VS) */}
                    <div className="flex flex-col items-center text-center group w-full lg:w-40 px-4 pt-4 lg:pt-0">
                        <Star className="w-10 h-10 text-secondary mb-5 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_8px_rgba(197,183,131,0.3)]" />
                        <div className="text-4xl md:text-5xl font-black text-white mb-2 flex items-baseline drop-shadow-lg">
                            <Counter from={0} to={32} duration={1.2} />
                            <span className="text-2xl text-white/50 ml-1">-4</span>
                        </div>
                        <div className="text-sm font-bold uppercase tracking-widest text-[#C5B783] mb-1">All-Time Wins</div>
                        <div className="text-[10px] uppercase text-white/40 font-bold tracking-wider">32-4 Record</div>
                    </div>

                    {/* Right: Protective Stadium */}
                    <div className="flex flex-col items-center text-center group p-8 lg:border-l border-white/5">
                        <MapPin className="w-10 h-10 text-secondary mb-5 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_8px_rgba(197,183,131,0.3)]" />
                        <div className="text-4xl md:text-5xl font-black text-white mb-2 flex items-baseline drop-shadow-lg">
                            <Counter from={0} to={47} duration={1.2} />
                            <span className="text-2xl text-white/50 ml-1">k+</span>
                        </div>
                        <div className="text-sm font-bold uppercase tracking-widest text-[#C5B783] mb-1">Protective Stadium</div>
                        <div className="text-[10px] uppercase text-white/40 font-bold tracking-wider">47,100 Capacity</div>
                    </div>

                </div>
            </div>
        </section>
    );
}
