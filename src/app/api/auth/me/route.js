import { NextResponse, connection } from "next/server";
import { resolveActorAfterSeed } from "@/lib/rbac";
import { clearSessionCookie, getPortalPathForRole } from "@/lib/auth";
import { permanentlyDeleteUserAccount } from "@/lib/account-deletion";

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

export async function DELETE(req) {
    try {
        const actor = await resolveActorAfterSeed(req);
        if (!actor) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        const body = await req.json().catch(() => ({}));
        if (body?.confirm !== true) {
            return NextResponse.json({ error: "Permanent deletion confirmation is required." }, { status: 400 });
        }
        const result = await permanentlyDeleteUserAccount({ userId: actor.userId });
        if (!result.deleted) {
            return NextResponse.json({ error: "Account not found." }, { status: 404 });
        }
        const res = NextResponse.json({
            ok: true,
            deleted: true,
            deletedUserId: result.deletedUserId,
        });
        clearSessionCookie(res);
        return res;
    }
    catch (error) {
        console.error("DELETE /api/auth/me error:", error);
        return NextResponse.json({ error: "Failed to delete account permanently." }, { status: 500 });
    }
}
