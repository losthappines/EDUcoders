import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { resolveActorContext } from "@/lib/rbac";
import { processTelegramUpdate } from "@/lib/telegram-bot";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req) {
  await connection();
  try {
    await ensureSeeded();
    const chatId = (req.nextUrl.searchParams.get("chatId") || "web-sim-1").trim();
    const session = await prisma.telegramSession.findUnique({ where: { chatId } });
    if (session?.userId) {
      const actor = await resolveActorContext(req);
      if (!actor || (actor.userId !== session.userId && actor.role !== "ADMIN_RECEPTION")) {
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
    const existingSession = await prisma.telegramSession.findUnique({ where: { chatId } });

    if (body.action !== "LINK_CURRENT_USER" && existingSession?.userId) {
      const actor = await resolveActorContext(req);
      if (!actor || (actor.userId !== existingSession.userId && actor.role !== "ADMIN_RECEPTION")) {
        return NextResponse.json(
          { error: "Forbidden — this Telegram chat is linked to another user." },
          { status: 403 }
        );
      }
    }

    // Allow an authenticated web user to link their own current session to this simulator chat
    if (body.action === "LINK_CURRENT_USER") {
      const actor = await resolveActorContext(req);
      if (!actor) {
        return NextResponse.json({ error: "Please sign in first to link your account." }, { status: 401 });
      }
      await prisma.user.update({
        where: { id: actor.userId },
        data: { telegramChatId: chatId },
      });
      await prisma.patient.updateMany({
        where: { userId: actor.userId },
        data: { telegramChatId: chatId },
      });
      await prisma.telegramSession.upsert({
        where: { chatId },
        update: { userId: actor.userId, flowState: "IDLE", draftJson: "{}" },
        create: { chatId, userId: actor.userId, flowState: "IDLE", draftJson: "{}", historyJson: "[]" },
      });
      const res = await processTelegramUpdate(
        { message: { chat: { id: chatId }, text: "/start" } },
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
