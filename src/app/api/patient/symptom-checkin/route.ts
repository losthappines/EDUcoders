import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { recordAuditLog, resolveActorContext } from "@/lib/rbac";
import { evaluateSymptomCheckinTriage } from "@/lib/agentic-coordinator";
import { getSimulatedNow } from "@/lib/sla-queue";
import type { NotificationLogEntry, SymptomCheckin } from "@/lib/types";

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
      fever: boolean;
      severeHeadache: boolean;
      bleeding: boolean;
      swelling: boolean;
      bpReading: string;
      notes: string;
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

    const triage = evaluateSymptomCheckinTriage({
      fever: Boolean(body.fever),
      severeHeadache: Boolean(body.severeHeadache),
      bleeding: Boolean(body.bleeding),
      swelling: Boolean(body.swelling),
      bpReading: body.bpReading || "120/80",
    });

    const checkin: SymptomCheckin = {
      id: `sym-${Date.now()}`,
      createdAt: simulatedNow.toISOString(),
      fever: Boolean(body.fever),
      severeHeadache: Boolean(body.severeHeadache),
      bleeding: Boolean(body.bleeding),
      swelling: Boolean(body.swelling),
      bpReading: body.bpReading || "120/80",
      notes: body.notes || "",
      aiTriageLevel: triage.aiTriageLevel,
      aiAdviceUz: triage.aiAdviceUz,
      aiAdviceRu: triage.aiAdviceRu,
      aiAdviceEn: triage.aiAdviceEn,
    };

    const existingCheckins: SymptomCheckin[] = JSON.parse(
      call.symptomCheckinsJson || "[]"
    );
    const existingNotifs: NotificationLogEntry[] = JSON.parse(
      call.notificationLogJson || "[]"
    );

    const addedNotifs: NotificationLogEntry[] = [];
    let nextPriority = call.priority;

    if (triage.aiTriageLevel === "RED_EMERGENCY") {
      nextPriority = "CRITICAL";
      addedNotifs.push({
        id: `notif-sym-red-${Date.now()}`,
        channel: "TELEGRAM",
        recipientName: call.assignedDoctor.fullName,
        recipientRole: "FAMILY_MD",
        recipientHandle: call.assignedDoctor.telegramHandle || "@family_md",
        message: `🚨 [AI BEMOR XAVF SIGNALI] ${call.patient.fullName} (AQB: ${checkin.bpReading}) shoshilinch simptomlar belgiladi! Zudlik bilan bog'laning!`,
        severity: "CRITICAL",
        sentAt: simulatedNow.toISOString(),
      });
    } else if (triage.aiTriageLevel === "YELLOW") {
      if (nextPriority === "NORMAL") nextPriority = "HIGH";
      addedNotifs.push({
        id: `notif-sym-yel-${Date.now()}`,
        channel: "TELEGRAM",
        recipientName: call.assignedDoctor.fullName,
        recipientRole: "FAMILY_MD",
        recipientHandle: call.assignedDoctor.telegramHandle || "@family_md",
        message: `⚠️ [BEMOR SIMPTOM OGOHLANTIRISHI] ${call.patient.fullName}: AQB ${checkin.bpReading}, ko'rsatkichlar me'yordan yuqori.`,
        severity: "WARNING",
        sentAt: simulatedNow.toISOString(),
      });
    }

    await prisma.activeCall.update({
      where: { id: call.id },
      data: {
        priority: nextPriority,
        symptomCheckinsJson: JSON.stringify([checkin, ...existingCheckins]),
        notificationLogJson: JSON.stringify([...addedNotifs, ...existingNotifs]),
      },
    });

    if (triage.aiTriageLevel !== "GREEN") {
      await recordAuditLog({
        actor,
        action: "SYMPTOM_ALERT",
        resourceType: "ActiveCall",
        resourceId: call.id,
        details: {
          patientName: call.patient.fullName,
          aiTriageLevel: triage.aiTriageLevel,
          bpReading: checkin.bpReading,
          priorityUpgradedTo: nextPriority,
        },
      });
    }

    return NextResponse.json({
      success: true,
      checkin,
      priority: nextPriority,
    });
  } catch (error) {
    console.error("POST /api/patient/symptom-checkin error:", error);
    return NextResponse.json(
      { error: "Failed to submit symptom check-in" },
      { status: 500 }
    );
  }
}
