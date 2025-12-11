
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

// Generate a browser fingerprint as fallback
function getBrowserFingerprint(): string {
    if (typeof window === 'undefined') return '';

    const components = [
        navigator.userAgent,
        navigator.language,
        screen.colorDepth,
        screen.width,
        screen.height,
        new Date().getTimezoneOffset()
    ];

    // Simple hash function
    const str = components.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return 'fp_' + Math.abs(hash).toString(36);
}

function getVisitorId() {
    if (typeof window === 'undefined') return undefined;

    // Try to get from localStorage first
    let id = localStorage.getItem('visitor_id');

    if (!id) {
        // Check if we have a fingerprint-based ID
        const fingerprintKey = 'visitor_fingerprint';
        const storedFingerprint = localStorage.getItem(fingerprintKey);
        const currentFingerprint = getBrowserFingerprint();

        if (storedFingerprint === currentFingerprint) {
            // Same browser, localStorage was cleared - restore the ID
            const fingerprintId = localStorage.getItem('visitor_id_backup');
            if (fingerprintId) {
                id = fingerprintId;
                localStorage.setItem('visitor_id', id);
            }
        }

        if (!id) {
            // Generate new ID
            id = crypto.randomUUID();
            localStorage.setItem('visitor_id', id);
            localStorage.setItem('visitor_id_backup', id);
            localStorage.setItem(fingerprintKey, currentFingerprint);
        }
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

// Initialize visitor ID immediately on module load
if (typeof window !== 'undefined') {
    // Force visitor ID creation
    getVisitorId();
}
