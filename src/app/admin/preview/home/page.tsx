"use client";

import { useState, useEffect } from "react";
import HomePageContent, { HomeContent } from "@/components/home/HomePageContent";
import { Loader2, Save, PanelLeft, PanelBottom } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { schedule } from "@/data/schedule";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function HomePreviewPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Layout State: 'side' (Desktop) or 'bottom' (Laptop/Tablet)
    // Defaulting to 'bottom' per user request to avoid "cutoff"
    const [layoutMode, setLayoutMode] = useState<"side" | "bottom">("bottom");

    // Auto-Scaling Logic
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
    const [scale, setScale] = useState(0.6);

    useEffect(() => {
        if (!containerRef) return;

        const updateScale = () => {
            if (containerRef) {
                const { width } = containerRef.getBoundingClientRect();
                const targetWidth = 1200; // Target laptop width
                // Calculate scale: fit available width / target width
                // Cap at 1.0 (don't upscale)
                const newScale = Math.min((width - 48) / targetWidth, 1);
                setScale(newScale > 0 ? newScale : 0.5);
            }
        };

        const resizeObserver = new ResizeObserver(updateScale);
        resizeObserver.observe(containerRef);
        updateScale(); // Initial call

        return () => resizeObserver.disconnect();
    }, [containerRef, layoutMode]); // Re-run when layout mode changes

    // Data State...
    const [content, setContent] = useState<HomeContent>({
        hero: {
            title: "BIRMINGHAM",
            highlight: "WE ARE",
            subtitle: "Defending the Dynasty",
        },
        stats: {
            record: "32-4",
            championships: 3,
            capacity: 47,
        },
        nextGame: {
            week: "1",
            opponent: "DC Defenders",
            venue: "Protective Stadium",
            broadcaster: "FOX",
            is_home: true,
            ticket_url: "",
            stallions_record: "0-0"
        },
        news: [],
    });

    useEffect(() => {
        const fetchSettings = async () => {
            const nextGameRaw = schedule.find((g) => g.result === null) || schedule[schedule.length - 1];
            if (nextGameRaw) {
                setContent(prev => ({
                    ...prev,
                    nextGame: {
                        week: nextGameRaw.week.toString(),
                        opponent: nextGameRaw.opponent || "TBD",
                        venue: nextGameRaw.venue,
                        broadcaster: nextGameRaw.broadcaster || "FOX",
                        is_home: nextGameRaw.isHome,
                        ticket_url: nextGameRaw.ticket_url || "",
                        stallions_record: "0-0"
                    }
                }));
            }
        };
        fetchSettings();
    }, []);

    const handlePublish = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/home-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(content),
            });
            if (!res.ok) throw new Error("Failed to update");
            toast({ title: "Home Page Updated", description: "Changes live.", variant: 'default' });
        } catch (error) {
            toast({ title: "Error", description: "Failed to publish.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`flex h-screen overflow-hidden bg-black text-white ${layoutMode === 'side' ? 'flex-row' : 'flex-col'}`}>

            {/* EDITOR CONTROLS */}
            <div
                className={`
                    shrink-0 bg-neutral-900 flex flex-col z-20 shadow-2xl relative border-white/10
                    ${layoutMode === 'side'
                        ? 'w-[340px] h-full border-r order-1'
                        : 'w-full h-[400px] border-t order-2'
                    }
                `}
            >
                <div className="p-4 border-b border-white/10 bg-neutral-900/95 backdrop-blur sticky top-0 z-10 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold">Home Editor</h1>
                        {/* Layout Toggles */}
                        <div className="flex bg-black/50 rounded-md p-1 gap-1 border border-white/10">
                            <button
                                onClick={() => setLayoutMode('side')}
                                className={`p-1 rounded ${layoutMode === 'side' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
                                title="Side-by-Side"
                            >
                                <PanelLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setLayoutMode('bottom')}
                                className={`p-1 rounded ${layoutMode === 'bottom' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
                                title="Dock to Bottom"
                            >
                                <PanelBottom className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handlePublish}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-black text-sm font-bold rounded hover:bg-secondary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Publish
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-8">
                    {/* Simplified Form Layout for Horizontal Space if need be, but keeping standard for now */}

                    {/* Hero Section */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold uppercase text-neutral-500 tracking-wider">Hero Section</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-3">
                                <label className="text-xs text-neutral-400 block mb-1">Highlight (Gold Text)</label>
                                <input
                                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white font-bold text-sm"
                                    value={content.hero.highlight}
                                    onChange={e => setContent({ ...content, hero: { ...content.hero, highlight: e.target.value } })}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-xs text-neutral-400 block mb-1">Main Title</label>
                                <input
                                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white font-bold text-sm"
                                    value={content.hero.title}
                                    onChange={e => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-xs text-neutral-400 block mb-1">Subtitle</label>
                                <input
                                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white text-sm"
                                    value={content.hero.subtitle}
                                    onChange={e => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    {/* Stats Section */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold uppercase text-neutral-500 tracking-wider">Key Stats</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs text-neutral-400 block mb-1">Record</label>
                                <input
                                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white font-mono text-sm"
                                    value={content.stats.record}
                                    onChange={e => setContent({ ...content, stats: { ...content.stats, record: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-400 block mb-1">Championships</label>
                                <input
                                    type="number"
                                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white text-sm"
                                    value={content.stats.championships}
                                    onChange={e => setContent({ ...content, stats: { ...content.stats, championships: parseInt(e.target.value) || 0 } })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-400 block mb-1">Capacity (k)</label>
                                <input
                                    type="number"
                                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white text-sm"
                                    value={content.stats.capacity}
                                    onChange={e => setContent({ ...content, stats: { ...content.stats, capacity: parseInt(e.target.value) || 0 } })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    {/* Next Game Section */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold uppercase text-neutral-500 tracking-wider">Next Matchup</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-neutral-400 block mb-1">Week</label>
                                <input
                                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white text-sm"
                                    value={content.nextGame.week}
                                    onChange={e => setContent({ ...content, nextGame: { ...content.nextGame, week: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-400 block mb-1">Broadcaster</label>
                                <input
                                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white text-sm"
                                    value={content.nextGame.broadcaster}
                                    onChange={e => setContent({ ...content, nextGame: { ...content.nextGame, broadcaster: e.target.value } })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-neutral-400 block mb-1">Opponent</label>
                                <input
                                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white text-sm"
                                    value={content.nextGame.opponent}
                                    onChange={e => setContent({ ...content, nextGame: { ...content.nextGame, opponent: e.target.value } })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-neutral-400 block mb-1">Venue</label>
                                <input
                                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white text-sm"
                                    value={content.nextGame.venue}
                                    onChange={e => setContent({ ...content, nextGame: { ...content.nextGame, venue: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PREVIEW PANEL - ADAPTIVE */}
            <div
                ref={setContainerRef}
                className={`
                    bg-[#121212] overflow-hidden relative flex items-start justify-center pt-8 overflow-y-auto
                    ${layoutMode === 'side' ? 'order-2 flex-1 h-full' : 'order-1 flex-1 w-full'}
                `}
            >
                {/* 
                   Dynamic Scaled Container.
                */}
                <div
                    className="origin-top shadow-2xl transition-transform duration-75 ease-out mb-[-50%]"
                    style={{
                        transform: `scale(${scale})`,
                    }}
                >
                    <div className="w-[1200px] bg-black min-h-screen border border-white/10 rounded-lg overflow-hidden relative flex flex-col">
                        {/* Chrome Header */}
                        <div className="h-10 bg-[#1e1e1e] flex items-center px-4 gap-2 border-b border-white/5 flex-shrink-0 z-50 relative">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <span className="text-xs text-neutral-500 font-mono">
                                    Desktop Width ({Math.round(scale * 100)}%)
                                </span>
                            </div>
                        </div>
                        {/* Wrapper */}
                        <div
                            className="home-preview-wrapper text-base flex-1 relative overflow-y-auto max-h-[calc(100vh-40px)] scrollbar-hide"
                            onClickCapture={(e) => {
                                const target = e.target as HTMLElement;
                                const link = target.closest('a');
                                if (link) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toast({
                                        description: "Navigation disabled in preview.",
                                        duration: 1500,
                                        className: "bg-black/90 text-white border-white/10 top-20"
                                    });
                                }
                            }}
                        >
                            <Navbar />
                            <main className="min-h-screen">
                                <HomePageContent content={content} />
                            </main>
                            <Footer />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
