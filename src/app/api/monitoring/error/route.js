import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { buildSafeErrorReport } from "@/lib/monitoring";

export async function POST(req) {
  const ip = getClientIp(req);
  const rl = checkRateLimit({
    key: `monitoring:${ip}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many reports" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const safe = buildSafeErrorReport({
    name: body?.name,
    message: body?.message,
    route: body?.route,
    source: body?.source,
  });
  console.error("[OnaCare Monitoring]", JSON.stringify(safe));
  return NextResponse.json({ ok: true });
}
