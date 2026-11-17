import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed-data";
import { processTelegramUpdate } from "@/lib/telegram-bot";

export async function POST(req) {
  try {
    const expectedSecret = (process.env.TELEGRAM_WEBHOOK_SECRET || "").trim();
    if (expectedSecret) {
      const provided = req.headers.get("x-telegram-bot-api-secret-token") || "";
      if (provided !== expectedSecret) {
        return NextResponse.json({ error: "Invalid webhook secret" }, { status: 403 });
      }
    }

    await ensureSeeded();
    const update = await req.json();
    const result = await processTelegramUpdate(update, { dryRun: false });
    return NextResponse.json({ ok: true, flowState: result.flowState });
  } catch (error) {
    console.error("POST /api/telegram/webhook error:", error);
    return NextResponse.json({ ok: false, error: "Webhook processing failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/telegram/webhook",
    message: "Telegram webhook endpoint is active. Send POST updates from Telegram Bot API.",
  });
}
