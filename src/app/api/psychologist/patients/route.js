import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { canAccessPsychologistPortal, recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";
import { notifyAdminsViaTelegram, notifyUserViaTelegram } from "@/lib/telegram-bot";

export async function GET(req) {
  await connection();
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (!canAccessPsychologistPortal(actor.role)) {
      await recordAuditLog({
        actor,
        action: "RBAC_DENIED",
        resourceType: "PsychologistPortal",
        resourceId: "patients",
        details: { reason: "Only PSYCHOLOGIST role may access /api/psychologist/patients" },
      });
      return NextResponse.json({ error: "Forbidden — psychologist access only" }, { status: 403 });
    }

    const psychUser = await prisma.user.findUnique({
      where: { id: actor.userId },
      select: {
        id: true,
        fullName: true,
        district: true,
        specialty: true,
        expertiseArea: true,
        experienceYears: true,
        bioSummary: true,
        scheduleSlotsJson: true,
      },
    });

    const [consents, recentCheckins, sessions, noteCounts] = await Promise.all([
      prisma.psychConsent.findMany({
        where: { psychologistId: actor.userId, status: "ACTIVE" },
        include: {
          patient: {
            select: {
              id: true,
              userId: true,
              fullName: true,
              district: true,
              mahalla: true,
              phone: true,
              deliveryDate: true,
              assignedFamilyDoctorId: true,
              assignedFamilyDoctor: {
                select: { id: true, fullName: true, phone: true, specialty: true },
              },
            },
          },
        },
      }),
      prisma.wellbeingCheckin.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
        },
        orderBy: { createdAt: "desc" },
        include: {
          patient: {
            select: {
              id: true,
              userId: true,
              fullName: true,
              district: true,
              mahalla: true,
              phone: true,
              deliveryDate: true,
              assignedFamilyDoctorId: true,
              assignedFamilyDoctor: {
                select: { id: true, fullName: true, phone: true, specialty: true },
              },
            },
          },
        },
      }),
      prisma.psychSession.findMany({
        where: { psychologistId: actor.userId },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.psychNote.groupBy({
        by: ["patientId"],
        where: { psychologistId: actor.userId },
        _count: { id: true },
      }),
    ]);

    const consentByPatientId = new Map(consents.map((c) => [c.patientId, c]));
    const noteCountByPatientId = new Map(noteCounts.map((n) => [n.patientId, n._count.id]));
    const checkinsByPatientId = new Map();
    for (const row of recentCheckins) {
      if (!checkinsByPatientId.has(row.patientId)) {
        checkinsByPatientId.set(row.patientId, []);
      }
      checkinsByPatientId.get(row.patientId).push(row);
    }

    const patientMap = new Map();

    // 1. Add all actively consented patients
    for (const c of consents) {
      patientMap.set(c.patientId, {
        patient: c.patient,
        consent: c,
        hasActiveConsent: true,
      });
    }

    // 2. Add district high-risk mothers (unconsented emergency / triage flags)
    const psychDistrict = (psychUser?.district || "").split(",")[0].trim().toLowerCase();
    for (const [patientId, rows] of checkinsByPatientId.entries()) {
      if (patientMap.has(patientId)) continue;
      const latest = rows[0];
      const hasHighRisk = rows.some(
        (r) =>
          r.epdsSelfHarmFlag ||
          r.riskFlag === "SELF_HARM_CRITICAL" ||
          r.riskFlag === "PSYCH_RISK" ||
          (typeof r.epdsScore === "number" && r.epdsScore >= 13)
      );
      if (!hasHighRisk) continue;
      const pDistrict = (latest.patient?.district || "").toLowerCase();
      if (!psychDistrict || pDistrict.includes(psychDistrict) || latest.epdsSelfHarmFlag) {
        patientMap.set(patientId, {
          patient: latest.patient,
          consent: null,
          hasActiveConsent: false,
        });
      }
    }

    const patients = Array.from(patientMap.values())
      .map(({ patient, consent, hasActiveConsent }) => {
        const rows = checkinsByPatientId.get(patient.id) || [];
        const latest = rows[0] || null;
        const latestEpdsRow = rows.find((r) => typeof r.epdsScore === "number") || null;
        const activeSelfHarm =
          Boolean(consent?.selfHarmAlertAt && !consent?.selfHarmAckAt) ||
          Boolean(latest?.epdsSelfHarmFlag && !consent?.selfHarmAckAt);

        const selfHarmTriggeredAt =
          consent?.selfHarmAlertAt ||
          rows.find((r) => r.epdsSelfHarmFlag)?.createdAt ||
          null;
        const slaDeadlineAt =
          activeSelfHarm && selfHarmTriggeredAt
            ? new Date(new Date(selfHarmTriggeredAt).getTime() + 60 * 60000).toISOString()
            : null;

        let priorityScore = 1;
        if (activeSelfHarm) priorityScore = 4;
        else if (latest?.riskFlag === "PSYCH_RISK" || (latestEpdsRow && latestEpdsRow.epdsScore >= 13))
          priorityScore = 3;
        else if (latest?.riskFlag === "YELLOW" || (latest && latest.mood <= 2)) priorityScore = 2;

        const nextSession = sessions.find(
          (s) => s.patientId === patient.id && s.status === "SCHEDULED" && new Date(s.scheduledAt) >= new Date(Date.now() - 3600000)
        );

        return {
          patientId: patient.id,
          userId: patient.userId,
          fullName: patient.fullName,
          district: patient.district,
          mahalla: hasActiveConsent ? patient.mahalla : null,
          phone: hasActiveConsent || activeSelfHarm ? patient.phone : null,
          deliveryDate: patient.deliveryDate,
          hasActiveConsent,
          shareWellbeing: consent?.shareWellbeing ?? false,
          shareAssistantTopics: consent?.shareAssistantTopics ?? false,
          assignedFamilyDoctor: patient.assignedFamilyDoctor || null,
          latestMood: latest?.mood ?? null,
          latestCheckinDate: latest?.date ?? null,
          latestRiskFlag: latest?.riskFlag ?? "GREEN",
          latestEpdsScore: latestEpdsRow?.epdsScore ?? null,
          activeSelfHarm,
          selfHarmTriggeredAt,
          selfHarmAckAt: consent?.selfHarmAckAt ?? null,
          slaDeadlineAt,
          priorityScore,
          notesCount: noteCountByPatientId.get(patient.id) || 0,
          nextSession: nextSession || null,
        };
      })
      .sort((a, b) => {
        if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
        return (a.latestMood ?? 5) - (b.latestMood ?? 5);
      });

    const todaySessions = sessions.filter(
      (s) => s.status === "SCHEDULED" && new Date(s.scheduledAt).toDateString() === new Date().toDateString()
    );

    return NextResponse.json({
      profile: {
        ...psychUser,
        scheduleSlots: JSON.parse(psychUser?.scheduleSlotsJson || "[]"),
      },
      kpis: {
        consentedCount: consents.length,
        highRiskCount: patients.filter((p) => p.priorityScore >= 3).length,
        selfHarmActiveCount: patients.filter((p) => p.activeSelfHarm).length,
        todaySessionsCount: todaySessions.length,
      },
      patients,
    });
  } catch (error) {
    console.error("GET /api/psychologist/patients error:", error);
    return NextResponse.json({ error: "Failed to load psychologist queue" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor || !canAccessPsychologistPortal(actor.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    if (body.action === "ACK_SELF_HARM" && body.patientId) {
      const now = new Date();
      const existing = await prisma.psychConsent.findUnique({
        where: {
          patientId_psychologistId: {
            patientId: body.patientId,
            psychologistId: actor.userId,
          },
        },
      });
      if (existing) {
        await prisma.psychConsent.update({
          where: { id: existing.id },
          data: { selfHarmAckAt: now },
        });
      }
      const patient = await prisma.patient.findUnique({
        where: { id: body.patientId },
        select: { id: true, fullName: true, assignedFamilyDoctorId: true },
      });
      if (patient?.assignedFamilyDoctorId) {
        await notifyUserViaTelegram(
          patient.assignedFamilyDoctorId,
          `✅ <b>Psixolog 103 SLA ni tasdiqladi</b>\nPsixolog ${actor.fullName} bemor <b>${patient.fullName}</b> bilan aloqaga chiqishni o'z zimmasiga oldi.`
        );
      }
      await notifyAdminsViaTelegram(
        `✅ <b>Psixolog 103 SLA tasdiqlandi:</b> ${actor.fullName} → ${patient?.fullName || body.patientId}`
      );
      await recordAuditLog({
        actor,
        action: "PSYCH_SELF_HARM_SLA_ACK",
        resourceType: "Patient",
        resourceId: body.patientId,
        details: { ackAt: now.toISOString() },
      });
      return NextResponse.json({ success: true, selfHarmAckAt: now.toISOString() });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/psychologist/patients error:", error);
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
  }
}
