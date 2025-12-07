
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
// NOTE: for production, use a SERVICE ROLE key for write access if RLS is strict.
// For this "admin123" quick setup, we are using the detailed client or the anon key if policies allow.
// Assuming the anon key allows 'insert' for 'pending' status as per the schema plan.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, bio, stats, image_url, number, position, height, weight, college, hometown, age_info } = body;

        // TODO: Add basic validation

        const { data, error } = await supabase
            .from('players')
            .insert([
                {
                    name,
                    bio,
                    stats,
                    image_url,
                    number,
                    position,
                    height,
                    weight,
                    college,
                    hometown,
                    age_info,
                    status: 'pending' // Default to pending
                }
            ]);

        if (error) {
            console.error('Supabase Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Player imported successfully', data }, { status: 200 });
    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
