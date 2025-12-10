import { createClient } from "@/lib/supabase-server";
import { schedule } from "@/data/schedule";
import HomePageContent, { HomeContent } from "@/components/home/HomePageContent";

export default async function Home() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*");

  // Fetch News and Schedule from DB
  const { data: newsItems } = await supabase
    .from('news_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(3);

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .order('week', { ascending: true });

  const get = (key: string, def: string) => settings?.find((s) => s.key === key)?.value || def;

  // Parsing for StatStrip
  const record = get("team_record", "32-4");

  // Capacity: "47,100" -> 47
  const capacityRaw = get("stadium_capacity", "47,100");
  const capacityCount = parseInt(capacityRaw.replace(/,/g, "").substring(0, 2)) || 47;
  const champCount = parseInt(get("championship_count", "3"));

  // Next Game Logic from DB
  const scheduleList = (games && games.length > 0) ? games : schedule;

  const now = new Date();

  // Helper to normalize game object properties (DB vs Static)
  const getGameDate = (g: any): Date | null => {
    // 1. Kickoff Timestamp (Best source, ISO)
    if (g.kickoff_timestamp) {
      const d = new Date(g.kickoff_timestamp);
      if (!isNaN(d.getTime())) return d;
    }

    // 2. Date Display + Time Display (DB Schema)
    if (g.date_display) {
      // Clean time
      const timeStr = (g.time_display || "12:00 PM").replace(/\b[A-Z]{3,4}\b/g, "").trim();
      const d = new Date(`${g.date_display} ${timeStr}`);
      if (!isNaN(d.getTime())) return d;

      // Try just date
      const dDate = new Date(g.date_display);
      if (!isNaN(dDate.getTime())) {
        dDate.setHours(19, 0, 0, 0);
        return dDate;
      }
    }

    // 3. Legacy Date + Time (Static Schedule Schema)
    if (g.date) {
      const timeStr = (g.time || "12:00 PM").replace(/\b[A-Z]{3,4}\b/g, "").trim();
      const d = new Date(`${g.date} ${timeStr}`);
      if (!isNaN(d.getTime())) return d;

      const dDate = new Date(g.date);
      if (!isNaN(dDate.getTime())) {
        dDate.setHours(19, 0, 0, 0);
        return dDate;
      }
    }

    return null;
  };

  // 1. Find first future game (or today's game)
  // We want games where date is today or later
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  let validNextGame = scheduleList.find((g) => {
    if (g.result) return false;
    const d = getGameDate(g);
    if (!d) return false;
    // Strip time from game date to compare dates only
    const gameDay = new Date(d);
    gameDay.setHours(0, 0, 0, 0);
    return gameDay.getTime() >= today.getTime();
  });

  // 2. Fallback: Any future game
  if (!validNextGame) {
    validNextGame = scheduleList.find(g => {
      const d = getGameDate(g);
      if (!d) return null;
      return d > now;
    });
  }

  // 3. Fallback: Unresulted game
  if (!validNextGame) {
    validNextGame = scheduleList.find((g) => !g.result);
  }

  // 4. Absolute fallback
  const nextGameRaw = validNextGame || scheduleList[scheduleList.length - 1];

  // Construct ISO string for Hero if valid
  let nextGameDateTime: string | null = null;
  if (nextGameRaw) {
    const d = getGameDate(nextGameRaw);
    if (d) nextGameDateTime = d.toISOString();
  }

  // Calculate Season Record (Dynamic)
  const seasonWins = scheduleList.filter(g => g.result === 'W').length;
  const seasonLosses = scheduleList.filter(g => g.result === 'L').length;
  const seasonRecord = `${seasonWins}-${seasonLosses}`;

  // Pre-format Date and Time for Server rendering (Prevents Hydration Mismatch)
  const siteTimezone = get('site_timezone', 'America/Chicago');
  let formattedDate: string | undefined = undefined;
  let formattedTime: string | undefined = undefined;

  if (nextGameDateTime) {
    const d = new Date(nextGameDateTime);
    formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: siteTimezone
    }).format(d);

    formattedTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: siteTimezone
    }).format(d);
  }

  const content: HomeContent = {
    hero: {
      title: get("hero_title", "BIRMINGHAM"),
      highlight: get("hero_title_highlight", "WE ARE"),
      subtitle: get("hero_subtitle", "Defending the Dynasty"),
      formattedDate,
      formattedTime
    },
    stats: {
      record: record,
      championships: champCount,
      capacity: capacityCount,
    },
    nextGame: {
      week: nextGameRaw.week.toString(),
      opponent: nextGameRaw.opponent,
      venue: nextGameRaw.venue,
      broadcaster: nextGameRaw.broadcaster || "",
      is_home: nextGameRaw.is_home,
      ticket_url: nextGameRaw.ticket_url,
      stallions_record: seasonRecord, // Use dynamic season record here
    },
    nextGameDateTime: nextGameDateTime,
    news: newsItems || [],
  };

  return <HomePageContent content={content} />;
}
