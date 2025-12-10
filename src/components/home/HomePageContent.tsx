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
        formattedDate?: string;
        formattedTime?: string;
    };
    stats: {
        record: string;
        championships: number;
        capacity: number;
    };
    nextGame: NextGameData;
    nextGameDateTime?: string | null;
    news: NewsItem[];
}

export default function HomePageContent({ content }: { content: HomeContent }) {
    // Parse record for stats wins/losses
    const winCount = parseInt(content.stats.record.split("-")[0]) || 32;
    const lossCount = parseInt(content.stats.record.split("-")[1]) || 4;

    return (
        <div className="flex flex-col min-h-screen">
            <Hero
                heroTitleHighlight={content.hero.highlight}
                heroTitle={content.hero.title}
                heroSubtitle={content.hero.subtitle}
                teamRecord={`${content.stats.record} All-Time Record`}
                nextOpponentName={content.nextGame.opponent}
                nextGameWeek={content.nextGame.week}
                nextGameDateTime={content.nextGameDateTime}
                nextGameBroadcast={content.nextGame.broadcaster}
                formattedDate={content.hero.formattedDate}
                formattedTime={content.hero.formattedTime}
            />
            {/* Pull Up Wrapper */}
            <div className="relative z-30 -mt-32 md:mt-0">
                <NextGameCard game={content.nextGame} />
            </div>
            <StatStrip
                championshipCount={content.stats.championships}
                winCount={winCount}
                lossCount={lossCount}
                capacityCount={content.stats.capacity}
            />
            <NewsGrid newsItems={content.news} />
            <EmailCapture />
        </div>
    );
}
