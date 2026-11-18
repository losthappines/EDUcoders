import { NextResponse, connection } from "next/server";
import { ensureSeeded } from "@/lib/seed-data";
import { resolveActorAfterSeed } from "@/lib/rbac";
import { runReminderDispatchCycle } from "@/lib/med-reminders";

export async function GET(req) {
  await connection();
  try {
    await ensureSeeded();

    const configuredSecret = (process.env.CRON_SECRET || "").trim();
    const authHeader = (req.headers.get("authorization") || "").trim();
    const querySecret = (req.nextUrl.searchParams.get("secret") || "").trim();
    const bearerSecret = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

    let authorized = false;
    if (configuredSecret && (bearerSecret === configuredSecret || querySecret === configuredSecret)) {
      authorized = true;
    } else {
      const actor = await resolveActorAfterSeed(req);
      if (actor && actor.role === "ADMIN_RECEPTION") {
        authorized = true;
      }
    }

    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
    }

    const summary = await runReminderDispatchCycle();
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    console.error("GET /api/cron/med-reminders error:", error);
    return NextResponse.json({ error: "Failed to run reminder cycle" }, { status: 500 });
  }
}
