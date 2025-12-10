'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export interface GameData {
    id?: string
    week: number
    opponent: string
    opponent_logo?: string
    date_display: string
    time_display: string
    kickoff_timestamp?: string // ISO
    venue: string
    is_home: boolean
    result?: string
    score_home?: number
    score_away?: number
    broadcaster?: string
    ticket_url?: string
}

export async function saveGame(game: GameData) {
    const supabase = await createClient()

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Basic cleaning
    const payload = {
        week: game.week,
        opponent: game.opponent,
        opponent_logo: game.opponent_logo,
        date_display: game.date_display,
        time_display: game.time_display,
        kickoff_timestamp: game.kickoff_timestamp,
        venue: game.venue,
        is_home: game.is_home,
        result: game.result || null,
        score_home: game.score_home || null,
        score_away: game.score_away || null,
        broadcaster: game.broadcaster,
        ticket_url: game.ticket_url
    }

    if (game.id) {
        // Update
        const { error } = await supabase
            .from('games')
            .update(payload)
            .eq('id', game.id)

        if (error) throw new Error(error.message)
    } else {
        // Insert
        const { error } = await supabase
            .from('games')
            .insert([payload])

        if (error) throw new Error(error.message)
    }

    revalidatePath('/admin/schedule')
    revalidatePath('/schedule')
    revalidatePath('/') // Next game card on home might change
    return { success: true }
}

export async function deleteGame(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase.from('games').delete().eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath('/admin/schedule')
    revalidatePath('/schedule')
    return { success: true }
}
