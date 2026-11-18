import { NextResponse, connection } from "next/server";
import { ensureSeeded } from "@/lib/seed-data";
import { resolveActorAfterSeed } from "@/lib/rbac";
import {
  callTelegramApi,
  getTelegramBotStatus,
  getTelegramBotToken,
  saveTelegramBotConfig,
  sendDoctorVisitReminders,
} from "@/lib/telegram-bot";

export async function GET() {
  await connection();
  try {
    await ensureSeeded();
    const status = await getTelegramBotStatus();
    return NextResponse.json({ ok: true, ...status });
  } catch (error) {
    console.error("GET /api/telegram/setup error:", error);
    return NextResponse.json({ error: "Failed to check Telegram bot status" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (actor.role !== "ADMIN_RECEPTION") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const action = body.action || "CONFIGURE";

    if (action === "SEND_REMINDERS") {
      const summary = await sendDoctorVisitReminders();
      return NextResponse.json({ ok: true, action, summary });
    }

    const rawToken = (body.botToken || "").trim();
    const rawUsername = (body.botUsername || "").trim();
    if (rawToken || rawUsername) {
      await saveTelegramBotConfig({ token: rawToken, username: rawUsername });
    }

    const activeToken = rawToken || (await getTelegramBotToken());
    if (!activeToken) {
      return NextResponse.json(
        { error: "Please provide a valid @BotFather token or configure TELEGRAM_BOT_TOKEN env var." },
        { status: 400 }
      );
    }

    const host = req.headers.get("host") || "edu-coders.vercel.app";
    const proto = host.includes("localhost") ? "http" : "https";
    const webhookUrl = body.webhookUrl || `${proto}://${host}/api/telegram/webhook`;
    const secretToken = (process.env.TELEGRAM_WEBHOOK_SECRET || "").trim();

    const setRes = await callTelegramApi(
      "setWebhook",
      {
        url: webhookUrl,
        ...(secretToken ? { secret_token: secretToken } : {}),
      },
      activeToken
    );

    const status = await getTelegramBotStatus();
    return NextResponse.json({
      ok: Boolean(setRes?.ok),
      webhookResult: setRes,
      status,
    });
  } catch (error) {
    console.error("POST /api/telegram/setup error:", error);
    return NextResponse.json({ error: "Failed to configure Telegram bot" }, { status: 500 });
  }
}
