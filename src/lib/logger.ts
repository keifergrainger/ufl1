/**
 * Safe Logger Wrapper
 * Prevents accidental logging of secrets or massive objects.
 */

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'key', 'auth', 'cookie'];

function sanitize(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
        return obj.map(sanitize);
    }

    const newObj: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
                newObj[key] = '***REDACTED***';
            } else {
                newObj[key] = sanitize(obj[key]);
            }
        }
    }
    return newObj;
}

export const logger = {
    info: (message: string, meta?: any) => {
        console.log(JSON.stringify({ level: 'info', message, meta: sanitize(meta) }));
    },
    error: (message: string, error?: any) => {
        console.error(JSON.stringify({ level: 'error', message, error: sanitize(error) }));
    },
    warn: (message: string, meta?: any) => {
        console.warn(JSON.stringify({ level: 'warn', message, meta: sanitize(meta) }));
    }
};
