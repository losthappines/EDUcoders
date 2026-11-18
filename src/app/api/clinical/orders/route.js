import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canVerifyVisitAsDoctor, recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";
import { getSimulatedNow } from "@/lib/sla-queue";
import { getTelegramMiniAppUrl, notifyUserViaTelegram } from "@/lib/telegram-bot";

export async function POST(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (!canVerifyVisitAsDoctor(actor.role)) {
      await recordAuditLog({
        actor,
        action: "RBAC_DENIED",
        resourceType: "ClinicalOrder",
        resourceId: actor.role,
        details: { reason: "Clinical role required to place lab/rx orders" },
      });
      return NextResponse.json({ error: "RBAC Denied" }, { status: 403 });
    }

    const simulatedNow = await getSimulatedNow();
    const body = await req.json();
    if (!body.patientId) {
      return NextResponse.json({ error: "patientId is required" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({ where: { id: body.patientId } });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    if (actor.role === "FAMILY_MD" && patient.assignedFamilyDoctorId !== actor.userId) {
      const sameClinic = Boolean(actor.polyclinicId && patient.polyclinicId === actor.polyclinicId);
      const [assignedCall, assignedComplaint] = sameClinic
        ? [null, null]
        : await Promise.all([
            prisma.activeCall.findFirst({
              where: { patientId: patient.id, assignedDoctorId: actor.userId },
              select: { id: true },
            }),
            prisma.complaint.findFirst({
              where: { patientId: patient.id, assignedDoctorId: actor.userId },
              select: { id: true },
            }),
          ]);

      if (!sameClinic && !assignedCall && !assignedComplaint) {
        await recordAuditLog({
          actor,
          action: "RBAC_DENIED",
          resourceType: "ClinicalOrder",
          resourceId: patient.id,
          details: { reason: "Patient outside doctor's assigned scope" },
        });
        return NextResponse.json(
          { error: "RBAC Denied: Patient outside your assigned scope" },
          { status: 403 }
        );
      }
    }

    if (body.type === "FOLLOWUP_LAB") {
      const panelName = body.panelName || "Uy sharoitida Qayta Qon & Siydik Nazorati";
      const placeholderResults = [
        {
          testName: "Hemoglobin (Hb) — Kutilmoqda",
          value: "Namuna olinadi",
          unit: "g/L",
          refRange: "120–145",
          flag: "NORMAL",
        },
        {
          testName: "CRP / Proteinuria — Kutilmoqda",
          value: "Rejalashtirilgan",
          unit: "mg/L",
          refRange: "< 10",
          flag: "NORMAL",
        },
      ];
      const lab = await prisma.labReport.create({
        data: {
          patientId: body.patientId,
          orderedById: actor.userId,
          panelName,
          status: "ORDERED_FOLLOWUP",
          resultsJson: JSON.stringify(placeholderResults),
          reportedAt: simulatedNow,
        },
      });
      await recordAuditLog({
        actor,
        action: "LAB_FOLLOWUP_ORDERED",
        resourceType: "LabReport",
        resourceId: lab.id,
        details: { patientId: body.patientId, panelName },
      });
      return NextResponse.json({ success: true, lab });
    }

    if (body.type === "ADD_PRESCRIPTION") {
      const { inferReminderTimesFromFrequency, validateReminderTimes } = await import(
        "@/lib/med-reminders"
      );
      const medicationName = String(body.medicationName || "").trim() || "Magne B6";
      const dosage = String(body.dosage || "").trim() || "100 mg";
      const freq = String(body.frequency || "").trim() || "Kuniga 2 mahal";
      const durationDays = Math.min(180, Math.max(1, Number(body.durationDays) || 14));
      const parsedTimes =
        Array.isArray(body.reminderTimes) && body.reminderTimes.length > 0
          ? validateReminderTimes(body.reminderTimes)
          : inferReminderTimesFromFrequency(freq);

      const customInstr = typeof body.instructionsUz === "string" ? body.instructionsUz.trim() : "";

      const rx = await prisma.prescription.create({
        data: {
          patientId: body.patientId,
          prescribedById: actor.userId,
          medicationName,
          dosage,
          frequency: freq,
          durationDays,
          reminderTimesJson: JSON.stringify(parsedTimes),
          remindersEnabled: body.remindersEnabled !== false,
          instructionsUz: customInstr || "Ovqatdan keyin suv bilan iching.",
          instructionsRu:
            typeof body.instructionsRu === "string" && body.instructionsRu.trim()
              ? body.instructionsRu.trim()
              : customInstr || "Принимать после еды.",
          instructionsEn:
            typeof body.instructionsEn === "string" && body.instructionsEn.trim()
              ? body.instructionsEn.trim()
              : customInstr || "Take after meals with water.",
          pharmacyStockStatus: "IN_STOCK",
          polyclinicPharmacy: patient.polyclinicName || "Hududiy Ijtimoiy Dorixona",
          adherenceLogsJson: "[]",
        },
      });

      await recordAuditLog({
        actor,
        action: "PRESCRIPTION_ADDED",
        resourceType: "Prescription",
        resourceId: rx.id,
        details: {
          patientId: patient.id,
          medicationName,
          dosage,
          frequency: freq,
          durationDays,
          reminderTimes: parsedTimes,
        },
      });

      if (patient.userId) {
        const timesLabel = parsedTimes.length > 0 ? parsedTimes.join(", ") : freq;
        await notifyUserViaTelegram(
          patient.userId,
          `💊 <b>Yangi dori tayinlandi</b>\n\nShifokor: ${actor.fullName}\nDori: <b>${medicationName}</b> (${dosage})\nTartib: ${freq} (${durationDays} kun)\nEslatma vaqtlari: ${timesLabel}`,
          [[{ text: "📱 Kabinet", webAppUrl: getTelegramMiniAppUrl() }]]
        ).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        prescription: {
          ...rx,
          reminderTimes: parsedTimes,
        },
      });
    }

    return NextResponse.json({ error: "Unsupported order type" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/clinical/orders error:", error);
    return NextResponse.json({ error: "Failed to create clinical order" }, { status: 500 });
  }
}
