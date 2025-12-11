'use server';

import { createClient } from '@/lib/supabase-server';

import { subscriptionSchema } from '@/lib/schemas';

export async function subscribeToMailingList(formData: FormData) {
    const rawData = {
        email: formData.get('email'),
        source: formData.get('source') || 'web_footer',
    };

    const result = subscriptionSchema.safeParse(rawData);

    if (!result.success) {
        return { error: result.error.issues[0].message };
    }

    const { email, source } = result.data;

    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('mailing_list')
            .insert({ email, source });

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
