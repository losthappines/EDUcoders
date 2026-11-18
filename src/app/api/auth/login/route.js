import { NextResponse } from "next/server";
import { getDatabaseConfigInfo, prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { clearSessionCookie, getPortalPathForRole, setSessionCookie, verifyPassword, } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
export async function POST(req) {
    let body;
    try {
        body = (await req.json());
    }
    catch {
        return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    const clientIp = getClientIp(req);
    const rl = checkRateLimit({
        key: `login:${clientIp}:${email}`,
        limit: 12,
        windowMs: 5 * 60_000,
    });
    if (!rl.allowed) {
        return NextResponse.json({ error: "Too many sign-in attempts. Please wait a few minutes before retrying." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
    }
    const dbInfo = getDatabaseConfigInfo();
    if (!dbInfo.url || !dbInfo.isPostgres) {
        return NextResponse.json({
            error: "Database is not connected on this deployment (missing PostgreSQL DATABASE_URL).",
            code: "DB_NOT_CONFIGURED",
        }, { status: 503 });
    }
    try {
        await ensureSeeded();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !verifyPassword(password, user.passwordHash)) {
            return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
        }
        if (user.verificationStatus === "PENDING") {
            const res = NextResponse.json({
                error: "Your account is awaiting administrator verification before you can sign in.",
                code: "PENDING_VERIFICATION",
                verificationStatus: "PENDING",
            }, { status: 403 });
            clearSessionCookie(res);
            return res;
        }
        if (user.verificationStatus === "REJECTED") {
            const res = NextResponse.json({
                error: "Your registration was declined by the administrator.",
                code: "VERIFICATION_REJECTED",
                verificationStatus: "REJECTED",
                reason: user.verificationNote || null,
            }, { status: 403 });
            clearSessionCookie(res);
            return res;
        }
        const redirectTo = getPortalPathForRole(user.role);
        const res = NextResponse.json({
            success: true,
            redirectTo,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                polyclinicId: user.polyclinicId,
                polyclinicName: user.polyclinicName,
                district: user.district,
                avatarUrl: user.avatarUrl || null,
            },
        });
        setSessionCookie(res, user.id, user.role);
        return res;
    }
    catch (error) {
        console.error("POST /api/auth/login error:", error);
        return NextResponse.json({
            error: "Unable to connect to the database right now. Please try again.",
            code: "DB_UNREACHABLE",
        }, { status: 503 });
    }
}
