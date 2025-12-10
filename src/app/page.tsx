import { createClient } from "@/lib/supabase-server";
import { schedule } from "@/data/schedule";
import HomePageContent, { HomeContent } from "@/components/home/HomePageContent";

export default async function Home() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*");
  const { data: newsItems } = await supabase
    .from('news_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(3);

  const get = (key: string, def: string) => settings?.find((s) => s.key === key)?.value || def;

  // Parsing for StatStrip
  const record = get("team_record", "32-4");

  // Capacity: "47,100" -> 47
  const capacityRaw = get("stadium_capacity", "47,100");
  const capacityCount = parseInt(capacityRaw.replace(/,/g, "").substring(0, 2)) || 47;
  const champCount = parseInt(get("championship_count", "3"));

  // Next Game Logic
  const nextGameRaw = schedule.find((g) => g.result === null) || schedule[schedule.length - 1];

  const content: HomeContent = {
    hero: {
      title: get("hero_title", "BIRMINGHAM"),
      highlight: get("hero_title_highlight", "WE ARE"),
      subtitle: get("hero_subtitle", "Defending the Dynasty"),
    },
    stats: {
      record: record,
      championships: champCount,
      capacity: capacityCount,
    },
    nextGame: {
      week: nextGameRaw.week,
      opponent: nextGameRaw.opponent,
      venue: nextGameRaw.venue,
      broadcaster: nextGameRaw.broadcaster,
    },
    news: newsItems || [],
  };

  return <HomePageContent content={content} />;
}
