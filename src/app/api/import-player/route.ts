
import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { playerSchema } from '@/lib/schemas';
import { mutationLimiter } from '@/lib/rate-limit';

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        try {
            await mutationLimiter.check(5, ip); // 5 requests per minute per IP
        } catch {
            return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
        }

        const supabase = await createClient();
        const { authorized } = await requireAdmin(supabase);

        if (!authorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const json = await request.json();
        const result = playerSchema.safeParse(json);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input", details: result.error.issues }, { status: 400 });
        }

        const { name, bio, stats, image_url, number, position, height, weight, college, hometown, age_info } = result.data;

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
