'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createEvent(formData: FormData) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const year = formData.get('year') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const display_order = parseInt(formData.get('display_order') as string) || 0

    if (!year || !title || !description) throw new Error('All fields are required')

    const { error } = await supabase
        .from('history_events')
        .insert({ year, title, description, display_order })

    if (error) throw new Error(error.message)

    revalidatePath('/admin/history')
    revalidatePath('/history')
    return { success: true }
}

export async function updateEvent(id: string, formData: FormData) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const year = formData.get('year') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const display_order = parseInt(formData.get('display_order') as string) || 0

    const { error } = await supabase
        .from('history_events')
        .update({ year, title, description, display_order, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/history')
    revalidatePath('/history')
    return { success: true }
}

export async function deleteEvent(id: string) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('history_events')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/history')
    revalidatePath('/history')
    return { success: true }
}

export async function reorderEvents(items: { id: string; display_order: number }[]) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Perform parallel updates
    // Note: For larger datasets, a stored procedure or specific SQL query would be better
    const updates = items.map(item =>
        supabase.from('history_events').update({ display_order: item.display_order, updated_at: new Date().toISOString() }).eq('id', item.id)
    )

    await Promise.all(updates)

    revalidatePath('/admin/history')
    revalidatePath('/history')
    return { success: true }
}
