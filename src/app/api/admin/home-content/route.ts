import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { hero, stats, news } = body;

        // 1. Update Hero & Stats in site_settings
        const upserts = [
            { key: "hero_title", value: hero.title },
            { key: "hero_title_highlight", value: hero.highlight },
            { key: "hero_subtitle", value: hero.subtitle },
            { key: "team_record", value: stats.record },
            { key: "championship_count", value: stats.championships.toString() },
            { key: "stadium_capacity", value: stats.capacity.toString() + ",100" }, // Simple format
        ];

        const { error: settingsError } = await supabase
            .from("site_settings")
            .upsert(upserts, { onConflict: "key" });

        if (settingsError) throw settingsError;

        // 2. Update News (Batch Update)
        // For simplicity in this preview, we might just update titles/categories if changed
        // But the user might have added/removed?
        // The preview UI just has a "Headlines mini-editor".
        // Let's assume we update the 3 items passed if they have IDs.

        if (news && Array.isArray(news)) {
            for (const item of news) {
                if (item.id) {
                    await supabase
                        .from('news_articles')
                        .update({
                            title: item.title,
                            category: item.category,
                            // we don't update image/summary/link here to keep it simple unless requested
                        })
                        .eq('id', item.id);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
