
import { createClient } from '@/lib/supabase-server'
import FantasyLanding from '@/components/fantasy/FantasyLanding'

export default async function FantasyLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return <FantasyLanding />
    }

    return (
        <>
            {children}
        </>
    )
}
