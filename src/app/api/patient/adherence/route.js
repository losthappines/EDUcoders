import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveActorAfterSeed } from "@/lib/rbac";
import { getSimulatedNow } from "@/lib/sla-queue";
export async function POST(req) {
    try {
        const actor = await resolveActorAfterSeed(req);
        if (!actor) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        const simulatedNow = await getSimulatedNow();
        const body = (await req.json());
        const rx = await prisma.prescription.findUnique({
            where: { id: body.prescriptionId },
            include: { patient: true },
        });
        if (!rx) {
            return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
        }
        if (actor.role !== "PATIENT" || rx.patient.userId !== actor.userId) {
            return NextResponse.json({ error: "RBAC Denied" }, { status: 403 });
        }
        const logs = JSON.parse(rx.adherenceLogsJson || "[]");
        const today = simulatedNow.toISOString().slice(0, 10);
        const updated = [
            { date: `${today} ${simulatedNow.toTimeString().slice(0, 5)}`, taken: body.taken },
            ...logs,
        ];
        await prisma.prescription.update({
            where: { id: rx.id },
            data: { adherenceLogsJson: JSON.stringify(updated) },
        });
        return NextResponse.json({ success: true, adherenceLogs: updated });
    }
    catch (error) {
        console.error("POST /api/patient/adherence error:", error);
        return NextResponse.json({ error: "Failed to log adherence" }, { status: 500 });
    }
}
