import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { recordAuditLog, resolveActorContext } from "@/lib/rbac";
import { getSimulatedNow, slaMemoryQueue } from "@/lib/sla-queue";
import type { ChecklistItem, DoctorScheduleSlot } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const actor = await resolveActorContext(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const simulatedNow = await getSimulatedNow();

    const body = (await req.json()) as {
      activeCallId: string;
      method: "OTP_4DIGIT" | "ONE_TAP_PORTAL";
      otpCode?: string;
    };

    const call = await prisma.activeCall.findUnique({
      where: { id: body.activeCallId },
      include: { patient: true, assignedDoctor: true },
    });

    if (!call) {
      return NextResponse.json({ error: "ActiveCall not found" }, { status: 404 });
    }
    if (actor.role !== "PATIENT" || call.patient.userId !== actor.userId) {
      return NextResponse.json({ error: "RBAC Denied" }, { status: 403 });
    }

    if (body.method === "OTP_4DIGIT") {
      if (!body.otpCode || body.otpCode.trim() !== call.patientOtpCode) {
        return NextResponse.json(
          { error: "Noto'g'ri 4 xonali OTP kod. Qayta tekshiring." },
          { status: 400 }
        );
      }
    }

    const checklist: ChecklistItem[] = JSON.parse(call.checklistJson || "[]").map(
      (item: ChecklistItem) => ({ ...item, checked: true })
    );

    await prisma.$transaction(async (tx) => {
      await tx.activeCall.update({
        where: { id: call.id },
        data: {
          status: "COMPLETED",
          checklistJson: JSON.stringify(checklist),
          visitVerifiedAt: simulatedNow,
          verificationMethod: body.method,
          visitNotes:
            call.visitNotes ||
            `Bemor tomonidan ${body.method === "OTP_4DIGIT" ? "4-xonali OTP kod" : "1-bosish tugmasi"} orqali tasdiqlandi.`,
        },
      });

      await tx.patient.update({
        where: { id: call.patientId },
        data: { status: "VISIT_COMPLETED" },
      });

      const slots: DoctorScheduleSlot[] = JSON.parse(
        call.assignedDoctor.scheduleSlotsJson || "[]"
      );
      const freed = slots.map((s) =>
        s.bookedPatientId === call.patientId ? { ...s, bookedPatientId: null } : s
      );
      await tx.user.update({
        where: { id: call.assignedDoctorId },
        data: { scheduleSlotsJson: JSON.stringify(freed) },
      });
    });

    slaMemoryQueue.delete(call.id);

    await recordAuditLog({
      actor,
      action: "VISIT_VERIFIED",
      resourceType: "ActiveCall",
      resourceId: call.id,
      details: {
        patientName: call.patient.fullName,
        method: body.method,
        verifiedAt: simulatedNow.toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      verifiedAt: simulatedNow.toISOString(),
      method: body.method,
    });
  } catch (error) {
    console.error("POST /api/patient/confirm-visit error:", error);
    return NextResponse.json(
      { error: "Failed to confirm visit" },
      { status: 500 }
    );
  }
}
