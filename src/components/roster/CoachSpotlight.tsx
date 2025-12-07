import { Trophy, TrendingUp, NotebookPen } from "lucide-react";
import Image from "next/image";

export default function CoachSpotlight() {
    return (
        <section className="mb-12">

            {/* Heading */}
            <div className="flex items-center gap-3 mb-6">
                <span className="h-px bg-white/20 w-12" />
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5B783]">
                    Coaching Staff
                </h2>
                <span className="h-px bg-white/20 flex-1" />
            </div>

            {/* Coach Typographic Hero Card */}
            <div className="w-full relative rounded-xl overflow-hidden border border-white/10 shadow-lg bg-gradient-to-r from-black via-[#0B0B0C] to-black group shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(255,255,255,0.05)] transition-transform duration-300 hover:-translate-y-[2px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)]">

                {/* Background Pattern (Subtle Diagonal Lines) */}
                <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 40px)' }}
                />

                {/* Abstract Bokeh Texture (Subtle Depth) */}
                <div className="absolute right-0 top-0 bottom-0 w-2/3 opacity-[0.06] pointer-events-none mix-blend-overlay"
                    style={{ background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.4), transparent 60%)' }} />

                {/* Top-Left Gold Spotlight (Warmth behind name) */}
                <div className="absolute -top-[100px] -left-[100px] w-[500px] h-[500px] bg-[#C5B783]/15 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

                {/* Subtle Glow Effect */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="mx-auto max-w-6xl px-6 py-6 lg:px-10 lg:py-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">

                    {/* Left: Text Hero */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-auto">
                        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">

                            {/* Coach Avatar */}
                            <div className="relative flex-shrink-0">
                                {/* Faint Gold Ring Glow */}
                                <div className="absolute -inset-1 bg-[#C5B783]/15 rounded-full blur-sm" />

                                <div className="relative h-20 w-20 rounded-full border-2 border-[#C5B783] shadow-lg overflow-hidden bg-black/50">
                                    {/* Real Skip Holtz Headshot */}
                                    <Image
                                        src="https://cdn.discordapp.com/attachments/723741657048285275/1447010738735546467/aHR0cHM6Ly9zdG9yYWdlLmdvb2dsZWFwaXMuY29tL3VmbGVhZ3VlLXByb2QvMjAyNS8wMS8yOS9jNzk4OWUzYy00NmE3LTQ5MWEtYWNlZC01ODNkMjk3YWYyNTAud2VicA.png?ex=69361144&is=6934bfc4&hm=35e9f97c0a40e11c7024392cb3e13123215b9b1c6674d07c2d5f1415caf4f29e&"
                                        alt="Skip Holtz"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-baseline gap-3">
                                <div className="relative inline-block">
                                    <span className="absolute -inset-x-2 -left-1 w-[105%] bottom-0 h-3 bg-[#C5B783]/50 -skew-x-12 transform" />
                                    <h3 className="relative text-4xl md:text-5xl lg:text-6xl font-black text-white italic uppercase tracking-tighter leading-none z-10">
                                        Skip Holtz
                                    </h3>
                                </div>
                                <span className="bg-[#C5B783] text-black text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-sm border border-[#C5B783] ml-2 flex-shrink-0">
                                    Head Coach
                                </span>
                            </div>
                        </div>

                        <p className="text-white/60 text-lg font-medium leading-relaxed max-w-2xl">
                            Leading the Stallions’ modern dynasty with discipline, detail, and relentless preparation.
                        </p>
                    </div>

                    {/* Right: Big Stats */}
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-4 w-full lg:w-auto">

                        {/* Stat 1 */}
                        <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-white/5 border border-white/5 min-w-[140px] w-full sm:w-auto shadow-inner relative group/stat hover:border-white/10 transition-colors">
                            <div className="mb-2 p-2 rounded-full bg-black/40 border border-white/5">
                                <Trophy className="w-5 h-5 text-secondary" />
                            </div>
                            <div className="text-4xl font-black text-white leading-none mb-1">3<span className="text-2xl text-white/50 align-top">x</span></div>
                            <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">UFL Titles</div>
                        </div>

                        {/* Stat 2 */}
                        <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-white/5 border border-white/5 min-w-[140px] w-full sm:w-auto shadow-inner relative group/stat hover:border-white/10 transition-colors">
                            <div className="mb-2 p-2 rounded-full bg-black/40 border border-white/5">
                                <TrendingUp className="w-5 h-5 text-secondary" />
                            </div>
                            <div className="text-4xl font-black text-white leading-none mb-1">32<span className="text-2xl text-white/50">-4</span></div>
                            <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Overall Record</div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
