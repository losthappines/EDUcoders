import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { canAccessPsychologistPortal, canViewClinicalNotes, recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";
import { evaluateWellbeingSignals, getTashkentDateString, triggerWellbeingRiskAlerts } from "@/lib/wellbeing";
import { notifyAdminsViaTelegram, notifyUserViaTelegram } from "@/lib/telegram-bot";

export async function GET(req) {
  await connection();
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const patientIdParam = req.nextUrl.searchParams.get("patientId");
    let patient = null;

    if (actor.role === "PATIENT") {
      patient = await prisma.patient.findUnique({ where: { userId: actor.userId } });
    } else if (canViewClinicalNotes(actor.role) || actor.role === "ADMIN_RECEPTION") {
      if (!patientIdParam) {
        return NextResponse.json({ error: "patientId is required" }, { status: 400 });
      }
      patient = await prisma.patient.findUnique({ where: { id: patientIdParam } });
    } else if (canAccessPsychologistPortal(actor.role)) {
      if (!patientIdParam) {
        return NextResponse.json({ error: "patientId is required" }, { status: 400 });
      }
      const consent = await prisma.psychConsent.findUnique({
        where: {
          patientId_psychologistId: {
            patientId: patientIdParam,
            psychologistId: actor.userId,
          },
        },
      });
      if (!consent || consent.status !== "ACTIVE" || !consent.shareWellbeing) {
        return NextResponse.json({ error: "Active patient consent is required" }, { status: 403 });
      }
      patient = await prisma.patient.findUnique({ where: { id: patientIdParam } });
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!patient) {
      return NextResponse.json({ checkins: [], summary: null });
    }

    const since = new Date(Date.now() - 30 * 86400000);
    const rows = await prisma.wellbeingCheckin.findMany({
      where: {
        patientId: patient.id,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    const checkins = rows.map((r) => {
      let answers = {};
      try {
        answers = JSON.parse(r.answersJson || "{}");
      } catch {
        answers = {};
      }
      return {
        id: r.id,
        patientId: r.patientId,
        date: r.date,
        mood: r.mood,
        answers,
        epdsScore: r.epdsScore,
        epdsSelfHarmFlag: r.epdsSelfHarmFlag,
        riskFlag: r.riskFlag,
        source: r.source,
        createdAt: r.createdAt,
      };
    });

    const todayStr = getTashkentDateString();
    const todayCheckin = checkins.find((c) => c.date === todayStr) || null;
    const latestEpds = checkins.find((c) => typeof c.epdsScore === "number") || null;

    return NextResponse.json({
      patientId: patient.id,
      deliveryDate: patient.deliveryDate,
      todayDate: todayStr,
      todayCheckin,
      latestEpds,
      checkins,
    });
  } catch (error) {
    console.error("GET /api/patient/wellbeing error:", error);
    return NextResponse.json({ error: "Failed to load wellbeing check-ins" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (actor.role !== "PATIENT") {
      return NextResponse.json({ error: "Only mothers/patients can submit daily wellbeing check-ins" }, { status: 403 });
    }

    const patient = await prisma.patient.findUnique({ where: { userId: actor.userId } });
    if (!patient) {
      return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const mood = Math.max(1, Math.min(5, Number(body.mood) || 3));
    const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
    const epdsAnswers = Array.isArray(body.epdsAnswers) && body.epdsAnswers.length === 10 ? body.epdsAnswers : null;
    const source = ["WEB", "TELEGRAM", "VOICE"].includes(body.source) ? body.source : "WEB";

    const recentCheckins = await prisma.wellbeingCheckin.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: "desc" },
      take: 14,
    });

    const evaluation = evaluateWellbeingSignals({
      mood,
      answers,
      epdsAnswers,
      recentCheckins,
    });

    const todayStr = getTashkentDateString();
    const checkin = await prisma.wellbeingCheckin.create({
      data: {
        patientId: patient.id,
        date: todayStr,
        mood,
        answersJson: JSON.stringify({
          ...answers,
          ...(epdsAnswers ? { epdsAnswers } : {}),
        }),
        epdsScore: evaluation.epdsScore,
        epdsSelfHarmFlag: evaluation.epdsSelfHarmFlag,
        riskFlag: evaluation.riskFlag,
        source,
      },
    });

    if (body.deliveryDate) {
      const parsedDelivery = new Date(body.deliveryDate);
      if (!Number.isNaN(parsedDelivery.getTime())) {
        await prisma.patient.update({
          where: { id: patient.id },
          data: { deliveryDate: parsedDelivery },
        });
      }
    }

    // Add notification entry to any active patronage visit if high risk
    if (evaluation.riskFlag !== "GREEN" && evaluation.riskFlag !== "YELLOW") {
      const activeCall = await prisma.activeCall.findFirst({
        where: { patientId: patient.id, status: { not: "COMPLETED" } },
        orderBy: { createdAt: "desc" },
        include: { assignedDoctor: true },
      });
      if (activeCall) {
        let existingNotifs = [];
        try {
          existingNotifs = JSON.parse(activeCall.notificationLogJson || "[]");
        } catch {
          existingNotifs = [];
        }
        const msg =
          evaluation.riskFlag === "SELF_HARM_CRITICAL"
            ? `🚨 [EPDS Q10 / 103 SLA] ${patient.fullName}: o'ziga zarar yetkazish xavfi aniqlandi!`
            : evaluation.riskFlag === "RED_PHYSICAL"
              ? `🩺 [KUNDALIK QIZIL BAYROQ] ${patient.fullName}: ona/chaqaloqda jismoniy xavf belgisi!`
              : `💜 [PSIXOLOGIK XAVF] ${patient.fullName}: ${evaluation.epdsScore !== null ? `EPDS=${evaluation.epdsScore}` : `${evaluation.consecutiveLowDays} kun past kayfiyat`}`;
        await prisma.activeCall.update({
          where: { id: activeCall.id },
          data: {
            priority: evaluation.riskFlag === "SELF_HARM_CRITICAL" || evaluation.riskFlag === "RED_PHYSICAL" ? "CRITICAL" : activeCall.priority,
            notificationLogJson: JSON.stringify([
              {
                id: `notif-wb-${Date.now()}`,
                channel: "WEB_WELLBEING",
                recipientName: activeCall.assignedDoctor?.fullName || "Shifokor",
                recipientRole: "FAMILY_MD",
                message: msg,
                severity: evaluation.riskFlag === "SELF_HARM_CRITICAL" || evaluation.riskFlag === "RED_PHYSICAL" ? "CRITICAL" : "WARNING",
                sentAt: new Date().toISOString(),
              },
              ...existingNotifs,
            ]),
          },
        });
      }
    }

    const notifiedTargets = await triggerWellbeingRiskAlerts({
      patient,
      checkin,
      evaluation,
      notifyUserViaTelegram,
      notifyAdminsViaTelegram,
    });

    await recordAuditLog({
      actor,
      action: "WELLBEING_CHECKIN_SUBMITTED",
      resourceType: "WellbeingCheckin",
      resourceId: checkin.id,
      details: {
        date: todayStr,
        mood,
        riskFlag: evaluation.riskFlag,
        epdsScore: evaluation.epdsScore,
        selfHarmFlag: evaluation.epdsSelfHarmFlag,
      },
    });

    return NextResponse.json(
      {
        success: true,
        checkin: {
          ...checkin,
          answers,
        },
        evaluation,
        notifiedTargets,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/patient/wellbeing error:", error);
    return NextResponse.json({ error: "Failed to save wellbeing check-in" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor || actor.role !== "PATIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const parsedDelivery = body.deliveryDate ? new Date(body.deliveryDate) : null;
    if (!parsedDelivery || Number.isNaN(parsedDelivery.getTime())) {
      return NextResponse.json({ error: "Valid deliveryDate is required" }, { status: 400 });
    }
    const patient = await prisma.patient.update({
      where: { userId: actor.userId },
      data: { deliveryDate: parsedDelivery },
    });
    return NextResponse.json({ success: true, deliveryDate: patient.deliveryDate });
  } catch (error) {
    console.error("PATCH /api/patient/wellbeing error:", error);
    return NextResponse.json({ error: "Failed to update delivery date" }, { status: 500 });
  }
}
