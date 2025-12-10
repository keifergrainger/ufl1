'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export interface CoachData {
    id?: string
    name: string
    role: string
    headshot_url?: string
    bio_short?: string
    tagline?: string
    sort_order: number
}

export async function saveCoach(coach: CoachData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const payload = {
        name: coach.name,
        role: coach.role,
        headshot_url: coach.headshot_url,
        bio_short: coach.bio_short,
        tagline: coach.tagline,
        sort_order: coach.sort_order
    }

    if (coach.id) {
        const { error } = await supabase.from('coaches').update(payload).eq('id', coach.id)
        if (error) throw new Error(error.message)
    } else {
        const { error } = await supabase.from('coaches').insert([payload])
        if (error) throw new Error(error.message)
    }

    revalidatePath('/admin/coaches')
    revalidatePath('/roster') // Public roster page shows coaches
    return { success: true }
}

export async function deleteCoach(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase.from('coaches').delete().eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath('/admin/coaches')
    revalidatePath('/roster')
    return { success: true }
}
