import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";
import { evaluateSymptomCheckinTriage } from "@/lib/agentic-coordinator";
import { getSimulatedNow } from "@/lib/sla-queue";
import { CONDITION_SEVERITY_OPTIONS, getSymptomLabel, VALID_SYMPTOM_IDS, } from "@/lib/symptoms-catalog";
const VALID_SEVERITIES = new Set(CONDITION_SEVERITY_OPTIONS.map((o) => o.value));
export async function POST(req) {
    try {
        const actor = await resolveActorAfterSeed(req);
        if (!actor) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        const simulatedNow = await getSimulatedNow();
        const body = (await req.json());
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
        const additionalSymptoms = Array.isArray(body.additionalSymptoms)
            ? Array.from(new Set(body.additionalSymptoms.filter((id) => typeof id === "string" && VALID_SYMPTOM_IDS.has(id)))).slice(0, 30)
            : [];
        const customConditions = Array.isArray(body.customConditions)
            ? body.customConditions
                .map((item, idx) => {
                const name = typeof item?.name === "string" ? item.name.trim().slice(0, 120) : "";
                const rawSev = typeof item?.severity === "string" ? item.severity : "MODERATE";
                const severity = VALID_SEVERITIES.has(rawSev) ? rawSev : "MODERATE";
                return {
                    id: typeof item?.id === "string" && item.id ? item.id.slice(0, 40) : `custom-${Date.now()}-${idx}`,
                    name,
                    severity,
                };
            })
                .filter((item) => item.name.length > 0)
                .slice(0, 20)
            : [];
        const triage = evaluateSymptomCheckinTriage({
            fever: Boolean(body.fever),
            severeHeadache: Boolean(body.severeHeadache),
            bleeding: Boolean(body.bleeding),
            swelling: Boolean(body.swelling),
            additionalSymptoms,
            customConditions,
            bpReading: body.bpReading || "120/80",
        });
        const checkin = {
            id: `sym-${Date.now()}`,
            createdAt: simulatedNow.toISOString(),
            fever: Boolean(body.fever),
            severeHeadache: Boolean(body.severeHeadache),
            bleeding: Boolean(body.bleeding),
            swelling: Boolean(body.swelling),
            additionalSymptoms,
            customConditions,
            bpReading: body.bpReading || "120/80",
            notes: (body.notes || "").trim().slice(0, 500),
            aiTriageLevel: triage.aiTriageLevel,
            aiAdviceUz: triage.aiAdviceUz,
            aiAdviceRu: triage.aiAdviceRu,
            aiAdviceEn: triage.aiAdviceEn,
        };
        const existingCheckins = JSON.parse(call.symptomCheckinsJson || "[]");
        const existingNotifs = JSON.parse(call.notificationLogJson || "[]");
        const extraSummaryParts = [
            ...additionalSymptoms.map((id) => getSymptomLabel(id, "uz")),
            ...customConditions.map((c) => `${c.name} [${c.severity}]`),
        ];
        const extraSummary = extraSummaryParts.length > 0 ? ` • Belgilar: ${extraSummaryParts.join(", ")}` : "";
        const addedNotifs = [];
        let nextPriority = call.priority;
        if (triage.aiTriageLevel === "RED_EMERGENCY") {
            nextPriority = "CRITICAL";
            addedNotifs.push({
                id: `notif-sym-red-${Date.now()}`,
                channel: "TELEGRAM",
                recipientName: call.assignedDoctor.fullName,
                recipientRole: "FAMILY_MD",
                recipientHandle: call.assignedDoctor.telegramHandle || "@family_md",
                message: `🚨 [BEMOR XAVF SIGNALI] ${call.patient.fullName} (AQB: ${checkin.bpReading}) shoshilinch simptomlar belgiladi!${extraSummary}`,
                severity: "CRITICAL",
                sentAt: simulatedNow.toISOString(),
            });
        }
        else if (triage.aiTriageLevel === "YELLOW") {
            if (nextPriority === "NORMAL")
                nextPriority = "HIGH";
            addedNotifs.push({
                id: `notif-sym-yel-${Date.now()}`,
                channel: "TELEGRAM",
                recipientName: call.assignedDoctor.fullName,
                recipientRole: "FAMILY_MD",
                recipientHandle: call.assignedDoctor.telegramHandle || "@family_md",
                message: `⚠️ [BEMOR SIMPTOM OGOHLANTIRISHI] ${call.patient.fullName}: AQB ${checkin.bpReading}.${extraSummary}`,
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
                    additionalSymptomsCount: additionalSymptoms.length,
                    customConditionsCount: customConditions.length,
                    priorityUpgradedTo: nextPriority,
                },
            });
        }
        return NextResponse.json({
            success: true,
            checkin,
            priority: nextPriority,
        });
    }
    catch (error) {
        console.error("POST /api/patient/symptom-checkin error:", error);
        return NextResponse.json({ error: "Failed to submit symptom check-in" }, { status: 500 });
    }
}
