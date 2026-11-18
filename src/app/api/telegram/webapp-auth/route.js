import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { getPortalPathForRole, setSessionCookie } from "@/lib/auth";
import { getTelegramBotToken } from "@/lib/telegram-bot";
import { verifyTelegramWebAppInitData } from "@/lib/telegram-webapp";

export async function POST(req) {
  try {
    await ensureSeeded();
    const body = await req.json().catch(() => ({}));
    const initData = typeof body.initData === "string" ? body.initData : "";

    const botToken = await getTelegramBotToken();
    if (!botToken) {
      return NextResponse.json({ error: "Telegram bot token is not configured" }, { status: 503 });
    }

    const verified = verifyTelegramWebAppInitData(initData, botToken);
    if (!verified.valid) {
      return NextResponse.json({ error: verified.error || "Invalid Telegram initData" }, { status: 401 });
    }

    const strChatId = String(verified.user.id);
    let user = await prisma.user.findFirst({
      where: { telegramChatId: strChatId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        verificationStatus: true,
        verificationNote: true,
        district: true,
      },
    });

    if (!user) {
      const tgSession = await prisma.telegramSession.findUnique({ where: { chatId: strChatId } });
      if (tgSession?.userId) {
        user = await prisma.user.findUnique({
          where: { id: tgSession.userId },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            verificationStatus: true,
            verificationNote: true,
            district: true,
          },
        });
      }
    }

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        linked: false,
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
        pendingVerification: user.verificationStatus === "PENDING",
        verificationStatus: user.verificationStatus,
        verificationNote: user.verificationNote,
        user,
      });
    }

    const redirectTo = getPortalPathForRole(user.role);
    const res = NextResponse.json({
      authenticated: true,
      linked: true,
      redirectTo,
      user,
    });
    setSessionCookie(res, user.id, user.role);
    return res;
  } catch (error) {
    console.error("POST /api/telegram/webapp-auth error:", error);
    return NextResponse.json({ error: "Failed to authenticate Telegram Mini App" }, { status: 500 });
  }
}
