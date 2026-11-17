import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed-data";
import { canTriggerDischarge, recordAuditLog, resolveActorContext, } from "@/lib/rbac";
import { runDischargeHandoffAgent } from "@/lib/agentic-coordinator";
import { prisma } from "@/lib/db";
export async function POST(req) {
    try {
        await ensureSeeded();
        const actor = await resolveActorContext(req);
        if (!actor) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        if (!canTriggerDischarge(actor.role)) {
            await recordAuditLog({
                actor,
                action: "RBAC_DENIED",
                resourceType: "DischargeTrigger",
                resourceId: actor.role,
                details: {
                    reason: "Only OVABMU_MD may discharge inpatient and trigger AI Patronage",
                },
            });
            return NextResponse.json({
                error: "RBAC Denied: Only OvaBMU Inpatient Doctors (OVABMU_MD) can trigger discharge & AI patronage.",
            }, { status: 403 });
        }
        const body = (await req.json());
        if (!body.patientId) {
            return NextResponse.json({ error: "patientId is required" }, { status: 400 });
        }
        const existingCall = await prisma.activeCall.findFirst({
            where: {
                patientId: body.patientId,
                status: { not: "COMPLETED" },
            },
        });
        if (existingCall) {
            return NextResponse.json({ error: "An active 24h patronage task already exists for this patient." }, { status: 409 });
        }
        const result = await runDischargeHandoffAgent({
            patientId: body.patientId,
            dischargingDoctorId: actor.userId,
        });
        return NextResponse.json({
            success: true,
            activeCallId: result.activeCall.id,
            epikrizKey: result.epikrizKey,
            agentTrace: result.agentTrace,
            totalDurationMs: result.totalDurationMs,
        });
    }
    catch (error) {
        console.error("POST /api/agent/discharge-handoff error:", error);
        return NextResponse.json({ error: error.message || "Agentic handoff failed" }, { status: 500 });
    }
}
