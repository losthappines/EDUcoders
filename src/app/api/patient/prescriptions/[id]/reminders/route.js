import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canVerifyVisitAsDoctor, recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";
import { parseReminderTimesJson, validateReminderTimes } from "@/lib/med-reminders";

export async function PATCH(req, context) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;
    const rx = await prisma.prescription.findUnique({
      where: { id },
      include: { patient: true },
    });
    if (!rx) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    const isOwnPatient = actor.role === "PATIENT" && rx.patient.userId === actor.userId;
    const isScopedClinician =
      canVerifyVisitAsDoctor(actor.role) &&
      (actor.role === "OVABMU_MD" ||
        rx.patient.assignedFamilyDoctorId === actor.userId ||
        (actor.polyclinicId && rx.patient.polyclinicId === actor.polyclinicId));

    if (!isOwnPatient && !isScopedClinician) {
      return NextResponse.json({ error: "RBAC Denied" }, { status: 403 });
    }

    const body = await req.json();
    const nextTimes =
      body.reminderTimes !== undefined
        ? validateReminderTimes(body.reminderTimes)
        : parseReminderTimesJson(rx.reminderTimesJson, rx.frequency);

    const remindersEnabled =
      typeof body.remindersEnabled === "boolean" ? body.remindersEnabled : rx.remindersEnabled;

    const updated = await prisma.prescription.update({
      where: { id: rx.id },
      data: {
        reminderTimesJson: JSON.stringify(nextTimes),
        remindersEnabled,
      },
    });

    await recordAuditLog({
      actor,
      action: "PRESCRIPTION_REMINDERS_UPDATED",
      resourceType: "Prescription",
      resourceId: rx.id,
      details: {
        medicationName: rx.medicationName,
        reminderTimes: nextTimes,
        remindersEnabled,
      },
    });

    return NextResponse.json({
      success: true,
      prescription: {
        ...updated,
        reminderTimes: nextTimes,
      },
    });
  } catch (error) {
    console.error("PATCH /api/patient/prescriptions/[id]/reminders error:", error);
    return NextResponse.json({ error: "Failed to update medication reminders" }, { status: 500 });
  }
}
