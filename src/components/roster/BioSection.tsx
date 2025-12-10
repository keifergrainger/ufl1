"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function BioSection({ bio }: { bio: string | null }) {
    const [isBioExpanded, setIsBioExpanded] = useState(false);

    // If no bio, just return fallback
    if (!bio) return <div className="text-gray-500 italic">No bio available.</div>;

    const shouldTruncate = bio.length > 300; // Only show button for long bios

    return (
        <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/5 h-fit">
            <h2 className="text-xl font-bold mb-4 text-red-500 uppercase border-b border-red-500/30 pb-2">Bio / Career</h2>
            <div className={cn(
                "prose prose-invert prose-sm text-gray-300 whitespace-pre-wrap leading-relaxed relative",
                !isBioExpanded && shouldTruncate ? "line-clamp-5" : ""
            )}>
                {bio}
            </div>
            {shouldTruncate && (
                <button
                    onClick={() => setIsBioExpanded(!isBioExpanded)}
                    className="mt-4 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-white transition-colors flex items-center gap-1"
                >
                    {isBioExpanded ? "Show Less" : "Read Full Bio"}
                </button>
            )}
        </div>
    );
}
