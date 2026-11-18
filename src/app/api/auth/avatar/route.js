import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";

const PRESET_PATTERN = /^preset:[a-z0-9-]{2,40}$/;
const DATA_IMAGE_PATTERN = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_AVATAR_DATA_LENGTH = 360000;

export async function PATCH(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const raw = typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : "";

    if (!raw) {
      await prisma.user.update({
        where: { id: actor.userId },
        data: { avatarUrl: null },
      });
      await recordAuditLog({
        actor,
        action: "USER_AVATAR_CLEARED",
        resourceType: "User",
        resourceId: actor.userId,
        details: {},
      });
      return NextResponse.json({ ok: true, avatarUrl: null });
    }

    const isPreset = PRESET_PATTERN.test(raw);
    const isDataImage = DATA_IMAGE_PATTERN.test(raw);

    if (!isPreset && !isDataImage) {
      return NextResponse.json(
        { error: "Invalid avatar format. Please upload a PNG, JPG, or WebP image or pick a preset." },
        { status: 400 }
      );
    }

    if (isDataImage && raw.length > MAX_AVATAR_DATA_LENGTH) {
      return NextResponse.json(
        { error: "Profile image is too large after compression. Please pick a smaller image." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: actor.userId },
      data: { avatarUrl: raw },
      select: { id: true, avatarUrl: true },
    });

    await recordAuditLog({
      actor,
      action: "USER_AVATAR_UPDATED",
      resourceType: "User",
      resourceId: actor.userId,
      details: { mode: isPreset ? raw : "custom_upload" },
    });

    return NextResponse.json({ ok: true, avatarUrl: updated.avatarUrl });
  } catch (error) {
    console.error("PATCH /api/auth/avatar error:", error);
    return NextResponse.json({ error: "Failed to save profile picture" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: actor.userId },
      data: { avatarUrl: null },
    });

    await recordAuditLog({
      actor,
      action: "USER_AVATAR_CLEARED",
      resourceType: "User",
      resourceId: actor.userId,
      details: {},
    });

    return NextResponse.json({ ok: true, avatarUrl: null });
  } catch (error) {
    console.error("DELETE /api/auth/avatar error:", error);
    return NextResponse.json({ error: "Failed to remove profile picture" }, { status: 500 });
  }
}
