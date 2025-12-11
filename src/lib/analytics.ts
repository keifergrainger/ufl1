
type AnalyticsEvent = {
    eventType: string;
    page?: string;
    playerId?: string;
    section?: string;
    meta?: any;
}

const LOG_ENDPOINT = '/api/analytics/log';

// Track last event to prevent duplicates
let lastEventKey = '';
let lastEventTime = 0;

function getVisitorId() {
    if (typeof window === 'undefined') return undefined; // SSR check
    let id = localStorage.getItem('visitor_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('visitor_id', id);
    }
    return id;
}

function getSessionId() {
    if (typeof window === 'undefined') return undefined;
    let id = sessionStorage.getItem('session_id');
    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem('session_id', id);
    }
    return id;
}

async function logEvent(data: AnalyticsEvent) {
    try {
        const visitorId = getVisitorId();
        const sessionId = getSessionId();

        // Create unique key for this event
        const eventKey = `${data.eventType}:${data.page}:${visitorId}`;
        const now = Date.now();

        // Prevent duplicate events within 5 seconds
        if (eventKey === lastEventKey && (now - lastEventTime) < 5000) {
            console.log('Analytics: Skipping duplicate event');
            return;
        }

        lastEventKey = eventKey;
        lastEventTime = now;

        const payload = {
            ...data,
            visitorId,
            sessionId
        }
        await fetch(LOG_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
        });
    } catch (error) {
        console.error('Analytics logging failed:', error);
    }
}

export const analytics = {
    logPageView: (page: string, meta?: any) => {
        logEvent({ eventType: 'page_view', page, meta });
    },

    logPlayerView: (playerId: string, meta?: any) => {
        logEvent({ eventType: 'player_view', page: `/roster/${playerId}`, playerId, meta });
    },

    logMerchClick: (meta?: any) => {
        logEvent({ eventType: 'merch_click', section: 'commerce', meta });
    },

    logTicketClick: (meta?: any) => {
        logEvent({ eventType: 'ticket_click', section: 'commerce', meta });
    }
}
