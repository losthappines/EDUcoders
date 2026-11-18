import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canVerifyVisitAsDoctor, recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";
import { resolveCoordinatesForLocation } from "@/lib/geo";

export async function PATCH(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (!canVerifyVisitAsDoctor(actor.role)) {
      return NextResponse.json({ error: "Forbidden — clinical doctor role required" }, { status: 403 });
    }

    const body = await req.json();
    const expertiseArea = typeof body.expertiseArea === "string" ? body.expertiseArea.trim().slice(0, 160) : undefined;
    const specialty = typeof body.specialty === "string" ? body.specialty.trim().slice(0, 120) : undefined;
    const bioSummary = typeof body.bioSummary === "string" ? body.bioSummary.trim().slice(0, 400) : undefined;
    const district = typeof body.district === "string" ? body.district.trim().slice(0, 120) : undefined;
    const expNum =
      body.experienceYears !== undefined && body.experienceYears !== null && body.experienceYears !== ""
        ? Math.max(0, Math.min(65, parseInt(String(body.experienceYears), 10) || 0))
        : undefined;

    let latitude = typeof body.latitude === "number" ? body.latitude : undefined;
    let longitude = typeof body.longitude === "number" ? body.longitude : undefined;
    if ((latitude === undefined || longitude === undefined) && district) {
      const resolved = resolveCoordinatesForLocation(district, "");
      latitude = resolved.latitude;
      longitude = resolved.longitude;
    }

    const updated = await prisma.user.update({
      where: { id: actor.userId },
      data: {
        ...(expertiseArea !== undefined ? { expertiseArea } : {}),
        ...(specialty !== undefined ? { specialty } : {}),
        ...(bioSummary !== undefined ? { bioSummary } : {}),
        ...(expNum !== undefined ? { experienceYears: expNum } : {}),
        ...(district !== undefined ? { district } : {}),
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
      },
      select: {
        id: true,
        fullName: true,
        specialty: true,
        expertiseArea: true,
        experienceYears: true,
        bioSummary: true,
        district: true,
        latitude: true,
        longitude: true,
      },
    });

    await recordAuditLog({
      actor,
      action: "DOCTOR_PROFILE_GPS_UPDATED",
      resourceType: "User",
      resourceId: actor.userId,
      details: {
        expertiseArea: updated.expertiseArea,
        experienceYears: updated.experienceYears,
        latitude: updated.latitude,
        longitude: updated.longitude,
      },
    });

    return NextResponse.json({ success: true, doctor: updated });
  } catch (error) {
    console.error("PATCH /api/clinical/profile error:", error);
    return NextResponse.json({ error: "Failed to update doctor profile" }, { status: 500 });
  }
}
