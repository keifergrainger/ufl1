'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createArticle(formData: FormData) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const title = formData.get('title') as string
    const summary = formData.get('summary') as string
    const category = formData.get('category') as string
    const image_url = formData.get('image_url') as string
    const link = formData.get('link') as string
    const published_at = formData.get('published_at') as string || new Date().toISOString()
    const content = formData.get('content') as string

    if (!title) throw new Error('Title is required')

    const { error } = await supabase
        .from('news_articles')
        .insert({ title, summary, category, image_url, link, published_at, content })

    if (error) throw new Error(error.message)

    revalidatePath('/admin/news')
    revalidatePath('/') // Home page news grid
    return { success: true }
}

export async function updateArticle(id: string, formData: FormData) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const title = formData.get('title') as string
    const summary = formData.get('summary') as string
    const category = formData.get('category') as string
    const image_url = formData.get('image_url') as string
    const link = formData.get('link') as string
    const published_at = formData.get('published_at') as string
    const content = formData.get('content') as string

    const { error } = await supabase
        .from('news_articles')
        .update({ title, summary, category, image_url, link, published_at, content, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/news')
    revalidatePath('/')
    return { success: true }
}

export async function deleteArticle(id: string) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/news')
    revalidatePath('/')
    return { success: true }
}
