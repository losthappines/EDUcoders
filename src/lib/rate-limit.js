/**
 * Sliding-window in-memory rate limiter for auth & public endpoints.
 * Keys are typically `${bucket}:${clientIp}:${identifier}`.
 */
const globalForRateLimit = globalThis;
const rateLimitStore =
    globalForRateLimit.__onacareRateLimitStore || new Map();
if (!globalForRateLimit.__onacareRateLimitStore) {
    globalForRateLimit.__onacareRateLimitStore = rateLimitStore;
}
function pruneExpired(now) {
    if (rateLimitStore.size < 2000)
        return;
    for (const [k, entry] of rateLimitStore.entries()) {
        if (entry.resetAt <= now) {
            rateLimitStore.delete(k);
        }
    }
}
export function getClientIp(req) {
    if (!req || !req.headers)
        return "unknown";
    const xff = req.headers.get("x-forwarded-for");
    if (xff)
        return xff.split(",")[0].trim();
    const realIp = req.headers.get("x-real-ip");
    if (realIp)
        return realIp.trim();
    return "unknown";
}
export function checkRateLimit({ key, limit = 10, windowMs = 60_000 }) {
    const now = Date.now();
    pruneExpired(now);
    const existing = rateLimitStore.get(key);
    if (!existing || existing.resetAt <= now) {
        const entry = { count: 1, resetAt: now + windowMs };
        rateLimitStore.set(key, entry);
        return {
            allowed: true,
            remaining: Math.max(0, limit - 1),
            retryAfterSec: Math.ceil(windowMs / 1000),
        };
    }
    if (existing.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
        };
    }
    existing.count += 1;
    rateLimitStore.set(key, existing);
    return {
        allowed: true,
        remaining: Math.max(0, limit - existing.count),
        retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
}
