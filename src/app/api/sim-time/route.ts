import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded, resetDemoDatabase } from "@/lib/seed-data";
import { evaluateAllSlaTimers } from "@/lib/sla-queue";

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const body = (await req.json()) as {
      action: "ADD_HOURS" | "RESET";
      hours?: number;
    };

    if (body.action === "RESET") {
      await resetDemoDatabase();
      const evaluation = await evaluateAllSlaTimers();
      return NextResponse.json({
        success: true,
        timeOffsetHours: 0,
        evaluation,
      });
    }

    const delta = Number(body.hours ?? 0);
    const current = await prisma.systemSimState.upsert({
      where: { id: "singleton" },
      update: { timeOffsetHours: { increment: delta } },
      create: { id: "singleton", timeOffsetHours: delta },
    });

    const evaluation = await evaluateAllSlaTimers();

    return NextResponse.json({
      success: true,
      timeOffsetHours: current.timeOffsetHours,
      evaluation,
    });
  } catch (error) {
    console.error("POST /api/sim-time error:", error);
    return NextResponse.json(
      { error: "Failed to update simulated time" },
      { status: 500 }
    );
  }
}
