import { NextResponse } from "next/server";
import { getDatabaseConfigInfo, prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import {
  clearSessionCookie,
  getPortalPathForRole,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { getTelegramBotToken, linkTelegramChatToUser } from "@/lib/telegram-bot";
import { verifyTelegramWebAppInitData } from "@/lib/telegram-webapp";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function sanitizeMiniAppUser(u) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    polyclinicId: u.polyclinicId,
    polyclinicName: u.polyclinicName,
    district: u.district,
    verificationStatus: u.verificationStatus,
    verificationNote: u.verificationNote,
  };
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const initData = typeof body.initData === "string" ? body.initData.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if ((email || password) && (!email || !password)) {
      return NextResponse.json(
        { error: "Email and password are required.", code: "MISSING_CREDENTIALS" },
        { status: 400 }
      );
    }

    const dbInfo = getDatabaseConfigInfo();
    if (!dbInfo.url || !dbInfo.isPostgres) {
      return NextResponse.json(
        {
          error: "Database is not connected on this deployment (missing PostgreSQL DATABASE_URL).",
          code: "DB_NOT_CONFIGURED",
        },
        { status: 503 }
      );
    }

    await ensureSeeded();
    const botToken = await getTelegramBotToken();

    // Flow 1: Inline Sign-In from Telegram Mini App (Email + Password, optionally linking Telegram initData)
    if (email && password) {

      const clientIp = getClientIp(req);
      const rl = checkRateLimit({
        key: `tg-webapp-login:${clientIp}:${email}`,
        limit: 12,
        windowMs: 5 * 60_000,
      });
      if (!rl.allowed) {
        return NextResponse.json(
          { error: "Too many sign-in attempts. Please wait a few minutes.", code: "RATE_LIMITED" },
          { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
        );
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return NextResponse.json(
          { error: "Incorrect email or password.", code: "INVALID_CREDENTIALS" },
          { status: 401 }
        );
      }

      let linkedNow = Boolean(user.telegramChatId);
      if (initData && botToken) {
        const verified = verifyTelegramWebAppInitData(initData, botToken);
        if (verified.valid && verified.user?.id) {
          const linkedUser = await linkTelegramChatToUser({
            chatId: String(verified.user.id),
            userId: user.id,
            tgUsername: verified.user.username || null,
          });
          if (linkedUser) {
            linkedNow = true;
          }
        }
      }

      if (user.verificationStatus === "PENDING") {
        const res = NextResponse.json(
          {
            authenticated: false,
            linked: linkedNow,
            code: "PENDING_VERIFICATION",
            pendingVerification: true,
            verificationStatus: "PENDING",
            verificationNote: user.verificationNote,
            error: "Your account is awaiting administrator verification.",
            user: sanitizeMiniAppUser(user),
          },
          { status: 403 }
        );
        clearSessionCookie(res);
        return res;
      }

      if (user.verificationStatus === "REJECTED") {
        const res = NextResponse.json(
          {
            authenticated: false,
            linked: linkedNow,
            code: "REJECTED",
            verificationStatus: "REJECTED",
            verificationNote: user.verificationNote,
            error: "Your registration was declined by the administrator.",
            user: sanitizeMiniAppUser(user),
          },
          { status: 403 }
        );
        clearSessionCookie(res);
        return res;
      }

      const redirectTo = getPortalPathForRole(user.role);
      const res = NextResponse.json({
        authenticated: true,
        linked: linkedNow,
        redirectTo,
        portalPath: redirectTo,
        user: sanitizeMiniAppUser(user),
      });
      setSessionCookie(res, user.id, user.role);
      return res;
    }

    // Flow 2: Automatic Telegram WebApp initData SSO
    if (!botToken) {
      return NextResponse.json({ error: "Telegram bot token is not configured" }, { status: 503 });
    }

    const verified = verifyTelegramWebAppInitData(initData, botToken);
    if (!verified.valid) {
      return NextResponse.json({ error: verified.error || "Invalid Telegram initData" }, { status: 401 });
    }

    const strChatId = String(verified.user.id);
    const selectFields = {
      id: true,
      email: true,
      fullName: true,
      role: true,
      polyclinicId: true,
      polyclinicName: true,
      verificationStatus: true,
      verificationNote: true,
      district: true,
      telegramChatId: true,
    };

    let user = await prisma.user.findFirst({
      where: { telegramChatId: strChatId },
      select: selectFields,
    });

    if (!user) {
      const tgSession = await prisma.telegramSession.findUnique({ where: { chatId: strChatId } });
      if (tgSession?.userId) {
        user = await prisma.user.findUnique({
          where: { id: tgSession.userId },
          select: selectFields,
        });
      }
    }

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        linked: false,
        code: "NOT_LINKED",
        telegramUser: {
          id: strChatId,
          firstName: verified.user.first_name || "",
          username: verified.user.username || null,
        },
      });
    }

    if (user.verificationStatus !== "VERIFIED") {
      return NextResponse.json({
        authenticated: false,
        linked: true,
        code: user.verificationStatus === "PENDING" ? "PENDING_VERIFICATION" : "REJECTED",
        pendingVerification: user.verificationStatus === "PENDING",
        verificationStatus: user.verificationStatus,
        verificationNote: user.verificationNote,
        user: sanitizeMiniAppUser(user),
      });
    }

    const redirectTo = getPortalPathForRole(user.role);
    const res = NextResponse.json({
      authenticated: true,
      linked: true,
      redirectTo,
      portalPath: redirectTo,
      user: sanitizeMiniAppUser(user),
    });
    setSessionCookie(res, user.id, user.role);
    return res;
  } catch (error) {
    console.error("POST /api/telegram/webapp-auth error:", error);
    return NextResponse.json({ error: "Failed to authenticate Telegram Mini App" }, { status: 500 });
  }
}
