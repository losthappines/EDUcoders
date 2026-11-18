import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { createTelegramLinkToken } from "@/lib/auth";
import { resolveActorAfterSeed } from "@/lib/rbac";
import { getTelegramBotUsername } from "@/lib/telegram-bot";

export async function GET(req) {
  await connection();
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const [user, botUsername] = await Promise.all([
      prisma.user.findUnique({
        where: { id: actor.userId },
        select: { id: true, telegramChatId: true, telegramHandle: true },
      }),
      getTelegramBotUsername(),
    ]);
    const linkToken = createTelegramLinkToken(actor.userId);
    const telegramDeepLink = `https://t.me/${botUsername}?start=${linkToken}`;
    const webBotLinkUrl = `/telegram?link=${encodeURIComponent(linkToken)}`;
    return NextResponse.json({
      ok: true,
      linked: Boolean(user?.telegramChatId),
      telegramHandle: user?.telegramHandle || null,
      botUsername,
      linkToken,
      telegramDeepLink,
      webBotLinkUrl,
    });
  } catch (error) {
    console.error("GET /api/telegram/link error:", error);
    return NextResponse.json({ error: "Failed to prepare Telegram link" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: actor.userId },
        data: { telegramChatId: null },
      });
      await tx.patient.updateMany({
        where: { userId: actor.userId },
        data: { telegramChatId: null },
      });
      await tx.telegramSession.updateMany({
        where: { userId: actor.userId },
        data: { userId: null },
      });
    });
    return NextResponse.json({ ok: true, linked: false });
  } catch (error) {
    console.error("DELETE /api/telegram/link error:", error);
    return NextResponse.json({ error: "Failed to unlink Telegram" }, { status: 500 });
  }
}
