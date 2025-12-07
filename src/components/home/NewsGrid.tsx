import { news } from "@/data/news";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function NewsGrid() {
    const latestNews = news.slice(0, 3);

    return (
        <section className="py-24 md:py-32 bg-black/20">
            <div className="container">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2 leading-none">Latest Headlines</h2>
                        <p className="text-muted-foreground text-lg">Key updates from the Stallions.</p>
                    </div>
                    <Link href="#" className="hidden md:flex items-center text-secondary hover:text-white transition-colors font-bold uppercase tracking-wide text-sm mb-1">
                        View All News <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {latestNews.map((item) => (
                        <div key={item.id} className="group relative flex flex-col h-full border border-white/10 bg-card rounded-lg overflow-hidden hover:border-secondary/50 transition-colors">
                            {/* Image placeholder */}
                            <div className="h-48 bg-white/5 w-full flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors" />
                                <span className="text-muted-foreground text-xs uppercase tracking-widest">Article Image</span>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center justify-between mb-4">
                                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">{item.category}</Badge>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {item.date}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-secondary transition-colors leading-tight">
                                    {item.title}
                                </h3>

                                <p className="text-sm text-muted-foreground line-clamp-3 mb-6">
                                    {item.snippet}
                                </p>

                                <div className="mt-auto pt-4 border-t border-white/5">
                                    <span className="text-sm font-bold text-white/50 group-hover:text-white transition-colors flex items-center">
                                        Read More <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 md:hidden flex justify-center">
                    <Link href="#" className="flex items-center text-secondary font-bold uppercase tracking-wide text-sm">
                        View All News <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
