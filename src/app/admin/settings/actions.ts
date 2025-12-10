'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateSetting(key: string, value: string) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value }, { onConflict: 'key' })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/')
    revalidatePath('/admin/settings')
    return { success: true }
}
