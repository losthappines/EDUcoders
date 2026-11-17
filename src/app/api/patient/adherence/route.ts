import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { getSimulatedNow } from "@/lib/sla-queue";
import type { AdherenceLog } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const simulatedNow = await getSimulatedNow();
    const body = (await req.json()) as { prescriptionId: string; taken: boolean };

    const rx = await prisma.prescription.findUnique({
      where: { id: body.prescriptionId },
    });
    if (!rx) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    const logs: AdherenceLog[] = JSON.parse(rx.adherenceLogsJson || "[]");
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
  } catch (error) {
    console.error("POST /api/patient/adherence error:", error);
    return NextResponse.json({ error: "Failed to log adherence" }, { status: 500 });
  }
}
