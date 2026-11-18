import { NextResponse } from "next/server";
import { getDatabaseConfigInfo, prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { createPasswordResetChallenge, hashPassword, verifyPasswordResetChallenge, } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { notifyUserViaTelegram } from "@/lib/telegram-bot";
export async function POST(req) {
    let body;
    try {
        body = (await req.json());
    }
    catch {
        return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }
    const action = typeof body.action === "string" ? body.action : "REQUEST";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    const ip = getClientIp(req);
    const rl = checkRateLimit({
        key: `forgot:${action}:${ip}:${email}`,
        limit: 5,
        windowMs: 10 * 60_000,
    });
    if (!rl.allowed) {
        return NextResponse.json({ error: "Too many password reset requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
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
        if (action === "REQUEST") {
            if (!user) {
                return NextResponse.json({
                    success: true,
                    accountFound: false,
                    message: "If an account exists for this email, a 6-digit verification code has been sent to your linked Telegram or support channel.",
                });
            }
            const { code, resetToken } = createPasswordResetChallenge(user.email, user.passwordHash);
            let telegramDelivered = false;
            if (user.telegramChatId) {
                const res = await notifyUserViaTelegram(user.id, `🔐 <b>Parolni tiklash kodi:</b> <code>${code}</code>\n15 daqiqa amal qiladi.`);
                telegramDelivered = Boolean(res?.delivered);
            }
            const allowDemoCode = process.env.NODE_ENV !== "production" && !telegramDelivered;
            return NextResponse.json({
                success: true,
                accountFound: true,
                resetToken,
                telegramDelivered,
                ...(allowDemoCode ? { demoVerificationCode: code } : {}),
                message: telegramDelivered
                    ? "Verification code sent to your linked Telegram bot chat."
                    : "Verification code prepared. Check your linked Telegram or contact clinic support.",
            });
        }
        if (action === "RESET") {
            const code = typeof body.code === "string" ? body.code.trim() : "";
            const resetToken = typeof body.resetToken === "string" ? body.resetToken : "";
            const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
            if (newPassword.length < 6) {
                return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
            }
            if (!user ||
                !verifyPasswordResetChallenge({
                    resetToken,
                    email: user.email,
                    code,
                    currentPasswordHash: user.passwordHash,
                })) {
                return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
            }
            const newHash = hashPassword(newPassword);
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: newHash },
            });
            return NextResponse.json({
                success: true,
                message: "Password updated successfully. You can now sign in.",
            });
        }
        return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
    }
    catch (error) {
        console.error("POST /api/auth/forgot-password error:", error);
        return NextResponse.json({ error: "Unable to process password reset right now." }, { status: 503 });
    }
}
