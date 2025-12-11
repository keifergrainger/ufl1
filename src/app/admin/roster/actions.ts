'use server'

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export interface PlayerData {
    id?: string
    name: string
    number: string
    position: string
    height: string
    weight: string
    college: string
    bio?: string
    image_url?: string
    side_of_ball: string // 'OFFENSE' | 'DEFENSE' | 'SPECIAL_TEAMS'
    active: boolean
    unit?: string // Legacy 'unit' for filters if needed, but side_of_ball is better
}

export async function savePlayer(player: PlayerData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const payload = {
        name: player.name,
        number: player.number,
        position: player.position,
        height: player.height,
        weight: player.weight,
        college: player.college,
        bio: player.bio,
        image_url: player.image_url,
        side_of_ball: player.side_of_ball,
        active: player.active,
        unit: player.side_of_ball // Sync unit with side of ball for now or use mapping
    }

    if (player.id) {
        const { error } = await supabase.from('players').update(payload).eq('id', player.id)
        if (error) throw new Error(error.message)
    } else {
        const { error } = await supabase.from('players').insert([payload])
        if (error) throw new Error(error.message)
    }

    revalidatePath('/admin/roster')
    revalidatePath('/roster')
    return { success: true }
}

export async function deletePlayer(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase.from('players').delete().eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath('/admin/roster')
    revalidatePath('/roster')
    revalidatePath('/roster')
    return { success: true }
}


export async function approvePlayer(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Use admin client to bypass RLS for approval
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('players')
        .update({ status: 'approved', active: true })
        .eq('id', id)

    if (error) throw new Error(`Admin Update Error: ${error.message}`)

    revalidatePath('/admin/roster')
    revalidatePath('/roster')
    return { success: true }
}

export async function rejectPlayer(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Use admin client to bypass RLS for deletion
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('players')
        .delete()
        .eq('id', id)

    if (error) throw new Error(`Admin Delete Error: ${error.message}`)

    revalidatePath('/admin/roster')
    revalidatePath('/roster')
    return { success: true }
}
