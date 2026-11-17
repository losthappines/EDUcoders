import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import {
  canVerifyVisitAsDoctor,
  recordAuditLog,
  resolveActorContext,
} from "@/lib/rbac";
import { getSimulatedNow, slaMemoryQueue } from "@/lib/sla-queue";
import { encryptField } from "@/lib/crypto";
import type {
  ChecklistItem,
  DoctorScheduleSlot,
  VitalsSnapshot,
} from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeeded();
    const { id } = await params;
    const actor = await resolveActorContext(req);
    if (!canVerifyVisitAsDoctor(actor.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as { checklistItemId: string; checked: boolean };
    const call = await prisma.activeCall.findUnique({ where: { id } });
    if (!call) {
      return NextResponse.json({ error: "ActiveCall not found" }, { status: 404 });
    }

    const checklist: ChecklistItem[] = JSON.parse(call.checklistJson || "[]");
    const updated = checklist.map((item) =>
      item.id === body.checklistItemId ? { ...item, checked: body.checked } : item
    );

    await prisma.activeCall.update({
      where: { id },
      data: { checklistJson: JSON.stringify(updated) },
    });

    return NextResponse.json({ success: true, checklist: updated });
  } catch (error) {
    console.error("PATCH /api/active-calls/[id]/verify error:", error);
    return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeeded();
    const { id } = await params;
    const actor = await resolveActorContext(req);

    if (!canVerifyVisitAsDoctor(actor.role)) {
      await recordAuditLog({
        actor,
        action: "RBAC_DENIED",
        resourceType: "ActiveCall",
        resourceId: id,
        details: { reason: "Only FAMILY_MD or OVABMU_MD can log doctor visit verification" },
      });
      return NextResponse.json({ error: "RBAC Denied" }, { status: 403 });
    }

    const call = await prisma.activeCall.findUnique({
      where: { id },
      include: { patient: true, assignedDoctor: true },
    });
    if (!call) {
      return NextResponse.json({ error: "ActiveCall not found" }, { status: 404 });
    }

    const body = (await req.json()) as {
      systolicBp: number;
      diastolicBp: number;
      heartRate: number;
      tempC: number;
      spo2: number;
      visitNotes: string;
      otpCode?: string;
    };

    const simulatedNow = await getSimulatedNow();
    const vitals: VitalsSnapshot = {
      systolicBp: Number(body.systolicBp) || 122,
      diastolicBp: Number(body.diastolicBp) || 78,
      heartRate: Number(body.heartRate) || 82,
      tempC: Number(body.tempC) || 36.6,
      spo2: Number(body.spo2) || 98,
      respRate: 18,
      recordedAt: simulatedNow.toISOString(),
      phase: "POST_DISCHARGE_HOME",
    };

    const checklist: ChecklistItem[] = JSON.parse(call.checklistJson || "[]").map(
      (item: ChecklistItem) => ({ ...item, checked: true })
    );

    const latestEhr = await prisma.ehrRecord.findFirst({
      where: { patientId: call.patientId },
      orderBy: { createdAt: "desc" },
    });

    await prisma.$transaction(async (tx) => {
      await tx.activeCall.update({
        where: { id },
        data: {
          status: "COMPLETED",
          checklistJson: JSON.stringify(checklist),
          doctorVitalsJson: JSON.stringify(vitals),
          visitNotes: body.visitNotes || "Uy patronaji muvaffaqiyatli bajarildi.",
          visitVerifiedAt: simulatedNow,
          verificationMethod: body.otpCode ? "OTP_4DIGIT" : "FAMILY_MD_SIGN_OFF",
        },
      });

      await tx.patient.update({
        where: { id: call.patientId },
        data: { status: "VISIT_COMPLETED" },
      });

      await tx.ehrRecord.create({
        data: {
          patientId: call.patientId,
          authorId: actor.userId,
          recordType: "POST_DISCHARGE_VITALS",
          diagnosisIcd10: latestEhr?.diagnosisIcd10 ?? "Z39.2",
          diagnosisText: "24 soatlik uy patronaji ko'rigi — dinamika ijobiy",
          severity: latestEhr?.severity ?? "HIGH_RISK",
          clinicalNotesEncrypted: encryptField(
            body.visitNotes || "Oilaviy shifokor uy ko'rigi o'tkazildi, vitallar barqaror."
          ),
          vitalsJson: JSON.stringify(vitals),
          proceduresJson: JSON.stringify(["Uy sharoitida patronaj fizik ko'rigi"]),
        },
      });

      // Release doctor slot
      const slots: DoctorScheduleSlot[] = JSON.parse(
        call.assignedDoctor.scheduleSlotsJson || "[]"
      );
      const freedSlots = slots.map((s) =>
        s.bookedPatientId === call.patientId ? { ...s, bookedPatientId: null } : s
      );
      await tx.user.update({
        where: { id: call.assignedDoctorId },
        data: { scheduleSlotsJson: JSON.stringify(freedSlots) },
      });

      await tx.auditLog.create({
        data: {
          actorId: actor.userId,
          actorName: actor.fullName,
          actorRole: actor.role,
          action: "VISIT_VERIFIED",
          resourceType: "ActiveCall",
          resourceId: id,
          ipAddress: actor.ipAddress,
          detailsJson: JSON.stringify({
            patientName: call.patient.fullName,
            vitals,
            verifiedAt: simulatedNow.toISOString(),
          }),
        },
      });
    });

    slaMemoryQueue.delete(id);

    return NextResponse.json({
      success: true,
      verifiedAt: simulatedNow.toISOString(),
      vitals,
    });
  } catch (error) {
    console.error("POST /api/active-calls/[id]/verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify home visit" },
      { status: 500 }
    );
  }
}
