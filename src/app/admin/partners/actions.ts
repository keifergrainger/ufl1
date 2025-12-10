'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createPartner(formData: FormData) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const name = formData.get('name') as string
    const tier = formData.get('tier') as string
    const logo_url = formData.get('logo_url') as string
    const link = formData.get('link') as string

    if (!name || !tier) throw new Error('Name and Tier are required')

    const { error } = await supabase
        .from('partners')
        .insert({ name, tier, logo_url, link })

    if (error) throw new Error(error.message)

    revalidatePath('/admin/partners')
    revalidatePath('/partners') // Public page
    return { success: true }
}

export async function updatePartner(id: string, formData: FormData) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const name = formData.get('name') as string
    const tier = formData.get('tier') as string
    const logo_url = formData.get('logo_url') as string
    const link = formData.get('link') as string

    const { error } = await supabase
        .from('partners')
        .update({ name, tier, logo_url, link, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/partners')
    revalidatePath('/partners')
    return { success: true }
}

export async function deletePartner(id: string) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/partners')
    revalidatePath('/partners')
    return { success: true }
}
