import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canVerifyVisitAsDoctor, recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";
import { getSimulatedNow } from "@/lib/sla-queue";
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
        const body = (await req.json());
        if (!body.patientId) {
            return NextResponse.json({ error: "patientId is required" }, { status: 400 });
        }
        const patient = await prisma.patient.findUnique({ where: { id: body.patientId } });
        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }
        if (actor.role === "FAMILY_MD" &&
            patient.assignedFamilyDoctorId !== actor.userId &&
            actor.polyclinicId &&
            patient.polyclinicId !== actor.polyclinicId) {
            await recordAuditLog({
                actor,
                action: "RBAC_DENIED",
                resourceType: "ClinicalOrder",
                resourceId: patient.id,
                details: { reason: "Patient outside doctor's assigned polyclinic scope" },
            });
            return NextResponse.json({ error: "RBAC Denied: Patient outside your clinic scope" }, { status: 403 });
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
            const { inferReminderTimesFromFrequency, validateReminderTimes } = await import("@/lib/med-reminders");
            const freq = body.frequency || "Kuniga 2 mahal";
            const parsedTimes = Array.isArray(body.reminderTimes) && body.reminderTimes.length > 0
                ? validateReminderTimes(body.reminderTimes)
                : inferReminderTimesFromFrequency(freq);
            const rx = await prisma.prescription.create({
                data: {
                    patientId: body.patientId,
                    prescribedById: actor.userId,
                    medicationName: body.medicationName || "Magne B6",
                    dosage: body.dosage || "100 mg",
                    frequency: freq,
                    durationDays: Number(body.durationDays) || 14,
                    reminderTimesJson: JSON.stringify(parsedTimes),
                    remindersEnabled: body.remindersEnabled !== false,
                    instructionsUz: body.instructionsUz || "Ovqatdan keyin suv bilan iching.",
                    instructionsRu: "Принимать после еды.",
                    instructionsEn: "Take after meals with water.",
                    pharmacyStockStatus: "IN_STOCK",
                    polyclinicPharmacy: "Hududiy Ijtimoiy Dorixona",
                    adherenceLogsJson: "[]",
                },
            });
            return NextResponse.json({
                success: true,
                prescription: {
                    ...rx,
                    reminderTimes: parsedTimes,
                },
            });
        }
        return NextResponse.json({ error: "Unsupported order type" }, { status: 400 });
    }
    catch (error) {
        console.error("POST /api/clinical/orders error:", error);
        return NextResponse.json({ error: "Failed to create clinical order" }, { status: 500 });
    }
}
