import { Calendar, ArrowRight, ImageIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    image_url?: string;
    category: string;
    published_at: string;
    link?: string;
}

export default function NewsGrid({ newsItems = [] }: { newsItems: NewsItem[] }) {
    if (newsItems.length === 0) return null;

    return (
        <section className="py-24 md:py-32 bg-black/20">
            <div className="container mx-auto px-4 lg:px-6 max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2 leading-none">Latest Headlines</h2>
                        <p className="text-muted-foreground text-lg">Key updates from the Stallions.</p>
                    </div>
                    {/* Placeholder Link - Could lead to a full news archive page later */}
                    <Link href="#" className="hidden md:flex items-center text-secondary hover:text-white transition-colors font-bold uppercase tracking-wide text-sm mb-1 opacity-50 cursor-not-allowed">
                        View All News <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {newsItems.map((item) => (
                        <Link
                            href={item.link || '#'}
                            key={item.id}
                            target={item.link ? "_blank" : "_self"}
                            className="group relative flex flex-col h-full border border-white/10 bg-card rounded-lg overflow-hidden hover:border-secondary/50 transition-colors"
                        >
                            {/* Image placeholder */}
                            <div className="h-48 bg-white/5 w-full flex items-center justify-center relative overflow-hidden">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors" />
                                        <ImageIcon className="text-white/20 w-8 h-8" />
                                    </>
                                )}
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center justify-between mb-4">
                                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">{item.category}</Badge>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {new Date(item.published_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-secondary transition-colors leading-tight">
                                    {item.title}
                                </h3>

                                <p className="text-sm text-muted-foreground line-clamp-3 mb-6">
                                    {item.summary}
                                </p>

                                <div className="mt-auto pt-4 border-t border-white/5">
                                    <span className="text-sm font-bold text-white/50 group-hover:text-white transition-colors flex items-center">
                                        Read More <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
