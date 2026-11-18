import { NextResponse, connection } from "next/server";
import { resolveActorAfterSeed } from "@/lib/rbac";
import { getPortalPathForRole } from "@/lib/auth";
export async function GET(req) {
    await connection();
    try {
        const actor = await resolveActorAfterSeed(req);
        if (!actor) {
            return NextResponse.json({ authenticated: false, user: null });
        }
        return NextResponse.json({
            authenticated: true,
            redirectTo: getPortalPathForRole(actor.role),
            user: actor,
        });
    }
    catch (error) {
        console.error("GET /api/auth/me error:", error);
        return NextResponse.json({ authenticated: false, user: null });
    }
}
