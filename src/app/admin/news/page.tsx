import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import NewsList from './NewsList'

export const dynamic = 'force-dynamic'

export default async function AdminNewsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/admin')
    }

    // Fetch news
    const { data: articles } = await supabase
        .from('news_articles')
        .select('*')
        .order('published_at', { ascending: false })

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-black uppercase italic text-white mb-2">Newsroom</h1>
                <p className="text-neutral-400">Manage team news, press releases, and game recaps.</p>
            </div>

            <NewsList initialArticles={articles || []} />
        </div>
    )
}
