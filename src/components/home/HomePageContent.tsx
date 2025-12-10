"use client";

import Hero from "@/components/home/Hero";
import NextGameCard, { NextGameData } from "@/components/home/NextGameCard";
import StatStrip from "@/components/home/StatStrip";
import NewsGrid, { NewsItem } from "@/components/home/NewsGrid";
import EmailCapture from "@/components/home/EmailCapture";

export interface HomeContent {
    hero: {
        title: string;
        highlight: string;
        subtitle: string;
    };
    stats: {
        record: string;
        championships: number;
        capacity: number;
    };
    nextGame: NextGameData;
    news: NewsItem[];
}

export default function HomePageContent({ content }: { content: HomeContent }) {
    // Parse record for stats wins
    const winCount = parseInt(content.stats.record.split("-")[0]) || 32;

    return (
        <div className="flex flex-col min-h-screen">
            <Hero
                heroTitleHighlight={content.hero.highlight}
                heroTitle={content.hero.title}
                heroSubtitle={content.hero.subtitle}
                teamRecord={`${content.stats.record} All-Time Record`}
                nextOpponentName={content.nextGame.opponent}
                nextGameWeek={content.nextGame.week}
                nextGameDateTime={null} // TODO: Add datetime to settings if needed
                nextGameBroadcast={content.nextGame.broadcaster}
            />
            <NextGameCard game={content.nextGame} />
            <StatStrip
                championshipCount={content.stats.championships}
                winCount={winCount}
                capacityCount={content.stats.capacity}
            />
            <NewsGrid newsItems={content.news} />
            <EmailCapture />
        </div>
    );
}
