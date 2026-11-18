import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canVerifyVisitAsDoctor, recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";
import { getSimulatedNow, slaMemoryQueue } from "@/lib/sla-queue";
import { encryptField } from "@/lib/crypto";
export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const actor = await resolveActorAfterSeed(req);
        if (!actor) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        if (!canVerifyVisitAsDoctor(actor.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const body = (await req.json());
        const call = await prisma.activeCall.findUnique({
            where: { id },
            include: { patient: true },
        });
        if (!call) {
            return NextResponse.json({ error: "ActiveCall not found" }, { status: 404 });
        }
        if (actor.role === "FAMILY_MD" &&
            call.assignedDoctorId !== actor.userId &&
            actor.polyclinicId &&
            call.patient.polyclinicId !== actor.polyclinicId) {
            return NextResponse.json({ error: "RBAC Denied: Patient outside your clinic scope" }, { status: 403 });
        }
        const checklist = JSON.parse(call.checklistJson || "[]");
        const updated = checklist.map((item) => item.id === body.checklistItemId ? { ...item, checked: body.checked } : item);
        await prisma.activeCall.update({
            where: { id },
            data: { checklistJson: JSON.stringify(updated) },
        });
        return NextResponse.json({ success: true, checklist: updated });
    }
    catch (error) {
        console.error("PATCH /api/active-calls/[id]/verify error:", error);
        return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 });
    }
}
export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const actor = await resolveActorAfterSeed(req);
        if (!actor) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
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
        if (actor.role === "FAMILY_MD" &&
            call.assignedDoctorId !== actor.userId &&
            actor.polyclinicId &&
            call.patient.polyclinicId !== actor.polyclinicId) {
            return NextResponse.json({ error: "RBAC Denied: Patient outside your clinic scope" }, { status: 403 });
        }
        const body = (await req.json());
        const simulatedNow = await getSimulatedNow();
        const vitals = {
            systolicBp: Number(body.systolicBp) || 122,
            diastolicBp: Number(body.diastolicBp) || 78,
            heartRate: Number(body.heartRate) || 82,
            tempC: Number(body.tempC) || 36.6,
            spo2: Number(body.spo2) || 98,
            respRate: 18,
            recordedAt: simulatedNow.toISOString(),
            phase: "POST_DISCHARGE_HOME",
        };
        const checklist = JSON.parse(call.checklistJson || "[]").map((item) => ({ ...item, checked: true }));
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
                    clinicalNotesEncrypted: encryptField(body.visitNotes || "Oilaviy shifokor uy ko'rigi o'tkazildi, vitallar barqaror."),
                    vitalsJson: JSON.stringify(vitals),
                    proceduresJson: JSON.stringify(["Uy sharoitida patronaj fizik ko'rigi"]),
                },
            });
            // Release doctor slot
            const slots = JSON.parse(call.assignedDoctor.scheduleSlotsJson || "[]");
            const freedSlots = slots.map((s) => s.bookedPatientId === call.patientId ? { ...s, bookedPatientId: null } : s);
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
    }
    catch (error) {
        console.error("POST /api/active-calls/[id]/verify error:", error);
        return NextResponse.json({ error: "Failed to verify home visit" }, { status: 500 });
    }
}
