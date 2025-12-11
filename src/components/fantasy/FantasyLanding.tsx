
import Link from 'next/link';
import FantasyShell from './FantasyShell';
import { Trophy, Users, BarChart2, Shield } from 'lucide-react';

export default function FantasyLanding() {
    return (
        <FantasyShell>
            {/* Hero Section */}
            <section className="relative min-h-[45vh] flex items-center justify-center overflow-hidden py-12">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[url('/field-texture.jpg')] bg-cover bg-center opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900/80 to-neutral-950" />

                <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
                    <div className="inline-block mb-4 animate-fade-in-up">
                        <span className="bg-red-600/10 text-red-500 border border-red-600/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                            Season 2025
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-4 leading-tight drop-shadow-2xl animate-fade-in-up delay-100 py-2">
                        Stallions <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 pr-2">Fantasy</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed font-light animate-fade-in-up delay-200">
                        Build your dynasty. Draft your favorite UFL stars. Compete with friends in the ultimate Birmingham Stallions fantasy experience.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
                        <Link
                            href="/login"
                            className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white text-base font-bold uppercase py-3 px-8 rounded-lg transition-all transform hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                        >
                            Start Playing Now
                        </Link>
                        <Link
                            href="/login?view=signup"
                            className="w-full md:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white text-base font-bold uppercase py-3 px-8 rounded-lg transition-all backdrop-blur-sm"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-12 relative bg-neutral-950/50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-white uppercase italic tracking-tight mb-2">
                            The Game Has Changed
                        </h2>
                        <div className="h-1 w-16 bg-red-600 mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={Users}
                            title="Create Leagues"
                            description="Commission your own private league or join public ones to prove your dominance."
                        />
                        <FeatureCard
                            icon={BarChart2}
                            title="Live Scoring"
                            description="Real-time stat tracking and scoring updates as the action happens on the field."
                        />
                        <FeatureCard
                            icon={Trophy}
                            title="Weekly Prizes"
                            description="Compete for exclusive Stallions merchandise, tickets, and experiences."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Official Data"
                            description="Powered by official UFL stats for the most accurate fantasy experience."
                        />
                    </div>
                </div>
            </section>
        </FantasyShell>
    );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="bg-neutral-900/50 border border-white/5 p-8 rounded-2xl hover:bg-neutral-900 hover:border-red-500/30 transition-all group">
            <div className="bg-red-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
                <Icon className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white uppercase italic mb-3 group-hover:text-red-400 transition-colors">
                {title}
            </h3>
            <p className="text-gray-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
