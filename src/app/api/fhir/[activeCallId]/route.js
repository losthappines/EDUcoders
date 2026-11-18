import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { buildFhirR4Bundle } from "@/lib/fhir";
import { recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";
export async function GET(req, { params }) {
    await connection();
    try {
        const { activeCallId } = await params;
        const actor = await resolveActorAfterSeed(req);
        if (!actor) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        if (actor.role === "PATIENT") {
            return NextResponse.json({ error: "RBAC Denied" }, { status: 403 });
        }
        const call = await prisma.activeCall.findUnique({
            where: { id: activeCallId },
            include: {
                patient: {
                    include: {
                        ehrRecords: { orderBy: { createdAt: "desc" }, take: 1 },
                        prescriptions: { where: { active: true } },
                    },
                },
                assignedDoctor: true,
                dischargedBy: true,
            },
        });
        if (!call) {
            return NextResponse.json({ error: "ActiveCall not found" }, { status: 404 });
        }
        if (actor.role === "FAMILY_MD" &&
            call.assignedDoctorId !== actor.userId &&
            actor.polyclinicId &&
            call.patient.polyclinicId !== actor.polyclinicId) {
            return NextResponse.json({ error: "RBAC Denied: Outside your clinic scope" }, { status: 403 });
        }
        const bundle = buildFhirR4Bundle({
            patient: call.patient,
            ehr: call.patient.ehrRecords[0] ?? null,
            activeCall: {
                id: call.id,
                status: call.status,
                priority: call.priority,
                riskScore: call.riskScore,
                polyclinicName: call.polyclinicName,
                dischargedAt: call.dischargedAt,
                slaDeadlineAt: call.slaDeadlineAt,
                scheduledWindowStart: call.scheduledWindowStart,
                scheduledWindowEnd: call.scheduledWindowEnd,
                redFlags: JSON.parse(call.redFlagsJson || "[]"),
                checklist: JSON.parse(call.checklistJson || "[]"),
                assignedDoctorName: call.assignedDoctor.fullName,
                dischargedByName: call.dischargedBy.fullName,
            },
            prescriptions: call.patient.prescriptions,
        });
        await recordAuditLog({
            actor,
            action: "VIEW_FHIR_BUNDLE",
            resourceType: "FhirBundle",
            resourceId: call.id,
            details: {
                patientName: call.patient.fullName,
                resourceCount: bundle.entry.length,
            },
        });
        return NextResponse.json(bundle);
    }
    catch (error) {
        console.error("GET /api/fhir/[activeCallId] error:", error);
        return NextResponse.json({ error: "Failed to generate HL7 FHIR R4 Bundle" }, { status: 500 });
    }
}
