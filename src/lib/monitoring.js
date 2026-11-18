/**
 * Privacy-safe error scrubbing and telemetry helper.
 * Guarantees zero PII, medical symptoms, coordinates, emails, or phone numbers are logged or transmitted.
 */
const ALLOWED_ANALYTICS_PATHS = new Set([
    "/",
    "/ru",
    "/en",
    "/login",
    "/signup",
    "/forgot-password",
    "/technology",
    "/privacy",
    "/terms",
    "/telegram",
    "/patient",
    "/clinical",
    "/admin",
    "/admin/verifications",
]);
export function scrubPiiAndHealthData(input) {
    if (typeof input !== "string")
        return "";
    return input
        // Mask email addresses
        .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
        // Mask Uzbekistan or international phone numbers
        .replace(/(\+?\d[\d\s()-]{7,}\d)/g, "[redacted-phone]")
        // Mask JSHSHIR / 14-digit IDs
        .replace(/\b\d{10,16}\b/g, "[redacted-id]")
        // Mask GPS coordinates
        .replace(/[-+]?\d{1,3}\.\d{3,}/g, "[redacted-coord]")
        // Mask OTPs or secrets in URL query params
        .replace(/([?&](?:token|code|otp|chatId|email|phone|password|key)=)[^&\s]+/gi, "$1[redacted]")
        .slice(0, 280);
}
export function sanitizeTelemetryPath(rawUrl) {
    try {
        const parsed = new URL(rawUrl, "https://edu-coders.vercel.app");
        if (ALLOWED_ANALYTICS_PATHS.has(parsed.pathname)) {
            return parsed.pathname;
        }
        return "/[app-route]";
    }
    catch {
        return "/[unknown]";
    }
}
export function buildSafeErrorReport({ name, message, route, source }) {
    return {
        name: scrubPiiAndHealthData(String(name || "Error")).slice(0, 64),
        message: scrubPiiAndHealthData(String(message || "Unexpected application error")),
        route: sanitizeTelemetryPath(String(route || "/")),
        source: source === "boundary" || source === "rejection" ? source : "window",
        ts: new Date().toISOString(),
    };
}
