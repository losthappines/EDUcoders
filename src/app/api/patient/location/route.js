import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveActorAfterSeed } from "@/lib/rbac";

export async function PATCH(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (actor.role !== "PATIENT") {
      return NextResponse.json({ error: "Only patients can update patient GPS" }, { status: 403 });
    }

    const body = await req.json();
    const latitude = typeof body.latitude === "number" ? body.latitude : undefined;
    const longitude = typeof body.longitude === "number" ? body.longitude : undefined;
    const address = typeof body.address === "string" ? body.address.trim().slice(0, 200) : undefined;
    const district = typeof body.district === "string" ? body.district.trim().slice(0, 100) : undefined;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: actor.userId },
        data: {
          ...(latitude !== undefined ? { latitude } : {}),
          ...(longitude !== undefined ? { longitude } : {}),
          ...(district !== undefined ? { district } : {}),
        },
      }),
      prisma.patient.updateMany({
        where: { userId: actor.userId },
        data: {
          ...(latitude !== undefined ? { latitude } : {}),
          ...(longitude !== undefined ? { longitude } : {}),
          ...(address !== undefined ? { address } : {}),
          ...(district !== undefined ? { district } : {}),
        },
      }),
    ]);

    return NextResponse.json({ success: true, latitude, longitude, address });
  } catch (error) {
    console.error("PATCH /api/patient/location error:", error);
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}
