import Hero from "@/components/home/Hero";
import NextGameCard from "@/components/home/NextGameCard";
import StatStrip from "@/components/home/StatStrip";
import NewsGrid from "@/components/home/NewsGrid";
import EmailCapture from "@/components/home/EmailCapture";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <NextGameCard />
      <StatStrip />
      <NewsGrid />
      <EmailCapture />
    </div>
  );
}
