/**
 * Simple in-memory rate limiter for Next.js API routes.
 * In a real production serverless environment (Vercel), this memory is ephemeral.
 * For robust rate limiting across lambdas, use Redis (Upstash).
 * This acts as a "best effort" abuse deterrent for Phase 1/2.
 */

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export interface RateLimitOptions {
    interval: number; // in milliseconds
    uniqueTokenPerInterval: number; // Max requests per interval
}

export function rateLimit(options: RateLimitOptions) {
    return {
        check: (limit: number, token: string) =>
            new Promise<void>((resolve, reject) => {
                const now = Date.now();
                const record = rateLimitMap.get(token);

                if (!record) {
                    rateLimitMap.set(token, { count: 1, lastReset: now });
                    return resolve();
                }

                if (now - record.lastReset > options.interval) {
                    record.count = 1;
                    record.lastReset = now;
                    return resolve();
                }

                if (record.count >= limit) {
                    return reject();
                }

                record.count += 1;
                resolve();
            }),
    };
}

// Default limiter for critical mutations (5 calls per minute per IP/User)
export const mutationLimiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});
