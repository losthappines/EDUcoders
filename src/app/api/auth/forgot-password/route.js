import { NextResponse } from "next/server";
import { getDatabaseConfigInfo, prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { createPasswordResetChallenge, hashPassword, verifyPasswordResetChallenge, } from "@/lib/auth";
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
                    message: "If an account exists for this email, a 6-digit verification code has been prepared.",
                });
            }
            const { code, resetToken } = createPasswordResetChallenge(user.email, user.passwordHash);
            return NextResponse.json({
                success: true,
                accountFound: true,
                resetToken,
                // Hackathon/demo mode surfaces the OTP directly because no external SMTP relay is attached
                demoVerificationCode: code,
                message: "Verification code generated. Enter the 6-digit code and your new password below.",
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
