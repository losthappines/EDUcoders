import { NextRequest, NextResponse, connection } from "next/server";
import { ensureSeeded } from "@/lib/seed-data";
import { resolveActorContext } from "@/lib/rbac";
import { getPortalPathForRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await connection();
  try {
    await ensureSeeded();
    const actor = await resolveActorContext(req);
    if (!actor) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    return NextResponse.json({
      authenticated: true,
      redirectTo: getPortalPathForRole(actor.role),
      user: actor,
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
