import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";

export async function GET() {
  await connection();
  try {
    await ensureSeeded();

    const [patients, specialists, totalSessions] = await Promise.all([
      prisma.patient.findMany({
        where: { status: { notIn: ["PENDING_VERIFICATION", "REJECTED"] } },
        select: { deliveryDate: true },
      }),
      prisma.user.findMany({
        where: {
          verificationStatus: "VERIFIED",
          role: { in: ["PSYCHOLOGIST", "FAMILY_MD"] },
        },
        select: {
          id: true,
          fullName: true,
          role: true,
          specialty: true,
          expertiseArea: true,
          experienceYears: true,
          district: true,
          bioSummary: true,
        },
        orderBy: [{ role: "desc" }, { experienceYears: "desc" }],
        take: 12,
      }),
      prisma.psychSession.count(),
    ]);

    const nowMs = Date.now();
    const cohorts = {
      d0_30: 0,
      m1_3: 0,
      m3_6: 0,
      m6_12: 0,
      unspecified: 0,
    };

    for (const p of patients) {
      if (!p.deliveryDate) {
        cohorts.unspecified += 1;
        continue;
      }
      const ageDays = Math.max(0, Math.floor((nowMs - new Date(p.deliveryDate).getTime()) / 86400000));
      if (ageDays <= 30) cohorts.d0_30 += 1;
      else if (ageDays <= 90) cohorts.m1_3 += 1;
      else if (ageDays <= 180) cohorts.m3_6 += 1;
      else cohorts.m6_12 += 1;
    }

    return NextResponse.json({
      cohorts,
      totalVerifiedMothers: patients.length,
      totalCompletedOrBookedSessions: totalSessions,
      specialists,
    });
  } catch (error) {
    console.error("GET /api/community/overview error:", error);
    return NextResponse.json({ error: "Failed to load community overview" }, { status: 500 });
  }
}
