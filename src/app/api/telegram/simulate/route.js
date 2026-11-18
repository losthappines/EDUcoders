import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { createTelegramLinkToken, verifyTelegramLinkToken } from "@/lib/auth";
import { resolveActorContext } from "@/lib/rbac";
import { linkTelegramChatToUser, processTelegramUpdate } from "@/lib/telegram-bot";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function hasValidLinkAccess(reqToken, sessionUserId) {
  if (!reqToken || !sessionUserId) return false;
  const parsed = verifyTelegramLinkToken(reqToken);
  return Boolean(parsed && parsed.userId === sessionUserId);
}

export async function GET(req) {
  await connection();
  try {
    await ensureSeeded();
    const chatId = (req.nextUrl.searchParams.get("chatId") || "web-sim-1").trim();
    const linkToken = (req.nextUrl.searchParams.get("link") || "").trim();
    const session = await prisma.telegramSession.findUnique({ where: { chatId } });
    if (session?.userId) {
      const actor = await resolveActorContext(req);
      const tokenAuthorized = hasValidLinkAccess(linkToken, session.userId);
      if (
        !tokenAuthorized &&
        (!actor || (actor.userId !== session.userId && actor.role !== "ADMIN_RECEPTION"))
      ) {
        return NextResponse.json(
          { error: "Sign in as the linked account owner to view this Telegram session." },
          { status: 403 }
        );
      }
    }
    let history = [];
    if (session?.historyJson) {
      try {
        history = JSON.parse(session.historyJson);
      } catch {
        history = [];
      }
    }
    const linkedUser = session?.userId
      ? await prisma.user.findUnique({
          where: { id: session.userId },
          select: {
            id: true,
            fullName: true,
            role: true,
            verificationStatus: true,
            subscriptionTier: true,
            latitude: true,
            longitude: true,
            district: true,
          },
        })
      : null;

    return NextResponse.json({
      ok: true,
      chatId,
      flowState: session?.flowState || "IDLE",
      history,
      linkedUser,
    });
  } catch (error) {
    console.error("GET /api/telegram/simulate error:", error);
    return NextResponse.json({ error: "Failed to load Telegram session" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit({
      key: `tg-sim:${ip}`,
      limit: 40,
      windowMs: 60_000,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many Telegram bot requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    await ensureSeeded();
    const body = await req.json();
    const chatId = String(body.chatId || "web-sim-1");
    const linkToken = typeof body.linkToken === "string" ? body.linkToken.trim() : "";
    const existingSession = await prisma.telegramSession.findUnique({ where: { chatId } });

    if (
      body.action !== "LINK_CURRENT_USER" &&
      body.action !== "LINK_WITH_TOKEN" &&
      existingSession?.userId
    ) {
      const actor = await resolveActorContext(req);
      const tokenAuthorized = hasValidLinkAccess(linkToken, existingSession.userId);
      if (
        !tokenAuthorized &&
        (!actor || (actor.userId !== existingSession.userId && actor.role !== "ADMIN_RECEPTION"))
      ) {
        return NextResponse.json(
          { error: "Forbidden — this Telegram chat is linked to another user." },
          { status: 403 }
        );
      }
    }

    // Link using a signed deep-link token (works even for PENDING accounts right after signup)
    if (body.action === "LINK_WITH_TOKEN") {
      const tokenStr = String(body.token || linkToken || "").trim();
      const parsed = verifyTelegramLinkToken(tokenStr);
      if (!parsed) {
        return NextResponse.json(
          { error: "Invalid or expired Telegram link token." },
          { status: 400 }
        );
      }
      const boundUser = await linkTelegramChatToUser({ chatId, userId: parsed.userId });
      if (!boundUser) {
        return NextResponse.json({ error: "Account not found." }, { status: 404 });
      }
      const res = await processTelegramUpdate(
        { message: { chat: { id: chatId }, text: `/start ${tokenStr}` } },
        { dryRun: true }
      );
      return NextResponse.json(res);
    }

    // Allow an authenticated web user to link their own current session to this simulator chat
    if (body.action === "LINK_CURRENT_USER") {
      const actor = await resolveActorContext(req);
      if (!actor) {
        return NextResponse.json({ error: "Please sign in first to link your account." }, { status: 401 });
      }
      await linkTelegramChatToUser({ chatId, userId: actor.userId });
      const token = createTelegramLinkToken(actor.userId);
      const res = await processTelegramUpdate(
        { message: { chat: { id: chatId }, text: `/start ${token}` } },
        { dryRun: true }
      );
      return NextResponse.json(res);
    }

    if (body.action === "RESET") {
      await prisma.telegramSession.deleteMany({ where: { chatId } });
      const res = await processTelegramUpdate(
        { message: { chat: { id: chatId }, text: "/start" } },
        { dryRun: true }
      );
      return NextResponse.json(res);
    }

    const update = body.callbackData
      ? {
          callback_query: {
            id: `sim-cb-${Date.now()}`,
            from: { username: "onacare_user", first_name: "OnaCare User" },
            message: { chat: { id: chatId } },
            data: String(body.callbackData),
          },
        }
      : body.location
        ? {
            message: {
              chat: { id: chatId },
              from: { username: "onacare_user", first_name: "OnaCare User" },
              location: {
                latitude: Number(body.location.latitude),
                longitude: Number(body.location.longitude),
              },
            },
          }
        : {
            message: {
              chat: { id: chatId },
              from: { username: "onacare_user", first_name: "OnaCare User" },
              text: String(body.text || "/start"),
            },
          };

    const result = await processTelegramUpdate(update, { dryRun: true });
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/telegram/simulate error:", error);
    return NextResponse.json({ error: "Telegram bot command failed" }, { status: 500 });
  }
}
