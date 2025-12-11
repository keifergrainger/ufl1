'use server';

import { createClient } from '@/lib/supabase-server';

export async function subscribeToMailingList(formData: FormData) {
    const email = formData.get('email') as string;

    if (!email) {
        return { error: 'Email is required' };
    }

    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('mailing_list')
            .insert({ email, source: 'web_footer' });

        if (error) {
            // Handle unique constraint violation gracefully
            if (error.code === '23505') {
                return { success: true, message: 'Already subscribed!' };
            }
            throw error;
        }

        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'Failed to subscribe' };
    }
}
