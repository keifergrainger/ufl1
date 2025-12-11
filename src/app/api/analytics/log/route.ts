import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const payload = await request.json()
        // console.log('Analytics Event Received:', payload) // Debug log

        const { eventType, page, playerId, section, meta, visitorId, sessionId } = payload

        if (!eventType) {
            return NextResponse.json({ error: 'Event type is required' }, { status: 400 })
        }

        const supabase = await createClient()

        const { error } = await supabase
            .from('analytics_events')
            .insert({
                event_type: eventType,
                page,
                player_id: playerId,
                section,
                meta,
                visitor_id: visitorId,
                session_id: sessionId
            })

        if (error) {
            console.error('Supabase analytics insert error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Analytics API error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
