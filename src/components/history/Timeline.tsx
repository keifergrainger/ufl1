"use client";

import { history } from "@/data/history";
import { motion } from "framer-motion";

export default function Timeline() {
    return (
        <div className="relative py-10 md:py-20">
            {/* Vertical Spine (Gold Thread) */}
            <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2 z-0 bg-gradient-to-b from-transparent via-[#C5B783]/50 to-transparent shadow-[0_0_15px_rgba(197,183,131,0.3)]" />

            <div className="flex flex-col gap-24 md:gap-32 relative z-10 max-w-7xl mx-auto">
                {history.map((event, index) => {
                    const isEven = index % 2 === 0;

                    return (
                        <motion.div
                            key={event.year}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className={`relative flex flex-col md:flex-row items-center gap-8 ${isEven ? "md:flex-row-reverse" : ""}`}
                        >
                            {/* Content Side */}
                            <div className="w-full md:w-1/2 pl-12 md:pl-0 md:pr-12 md:text-right flex flex-col md:block group">
                                {/* Mobile Dot (Gold) */}
                                <div className={`md:hidden absolute left-[11px] w-5 h-5 rounded-full border border-[#C5B783]/60 bg-[#050505] z-10 flex items-center justify-center shadow-[0_0_15px_rgba(197,183,131,0.4)]`}>
                                    <div className="w-1.5 h-1.5 bg-[#C5B783] rounded-full shadow-[0_0_8px_#C5B783]" />
                                </div>

                                <span className={`text-6xl md:text-9xl font-black text-white/[0.04] absolute top-[-40px] md:top-[-80px] ${isEven ? "md:right-12" : "md:left-12"} select-none tracking-tighter blur-[2px]`}>
                                    {event.year}
                                </span>

                                <div className="relative z-10">
                                    <h2 className="text-3xl md:text-5xl font-black uppercase text-white mb-4 tracking-tight drop-shadow-[0_4px_24px_rgba(255,255,255,0.15)]">
                                        <span className="text-[#C5B783] drop-shadow-[0_0_10px_rgba(197,183,131,0.4)]">{event.year}</span> <br />
                                        {event.title}
                                    </h2>
                                    <p className="text-lg text-white/60 leading-relaxed font-medium max-w-xl md:ml-auto group-hover:text-white/90 transition-colors duration-500">
                                        {event.description}
                                    </p>
                                </div>
                            </div>

                            {/* Marker (Desktop) - Gold Flare Node */}
                            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border border-[#C5B783]/80 bg-[#0B0B0C] z-20 items-center justify-center shadow-[0_0_20px_2px_rgba(197,183,131,0.5)]">
                                <div className="w-1.5 h-1.5 bg-[#C5B783] rounded-full shadow-[0_0_10px_#C5B783]" />
                            </div>

                            {/* Empty Side for balance (Desktop only) */}
                            <div className="hidden md:block w-1/2" />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
