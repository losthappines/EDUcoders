import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { decryptField } from "@/lib/crypto";
import { canAccessPsychologistPortal, recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";
import { notifyUserViaTelegram } from "@/lib/telegram-bot";

export async function GET(req, context) {
  await connection();
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor || !canAccessPsychologistPortal(actor.role)) {
      return NextResponse.json({ error: "Forbidden — psychologist access only" }, { status: 403 });
    }

    const { id: patientId } = await context.params;
    const [patient, consent] = await Promise.all([
      prisma.patient.findUnique({
        where: { id: patientId },
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
            select: { id: true, fullName: true, phone: true, specialty: true, polyclinicName: true },
          },
        },
      }),
      prisma.psychConsent.findUnique({
        where: {
          patientId_psychologistId: {
            patientId,
            psychologistId: actor.userId,
          },
        },
      }),
    ]);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const hasActiveConsent = Boolean(consent && consent.status === "ACTIVE");
    const since = new Date(Date.now() - 30 * 86400000);
    const checkinsRaw = await prisma.wellbeingCheckin.findMany({
      where: { patientId, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    const isEmergencyFlagged = checkinsRaw.some(
      (r) =>
        r.epdsSelfHarmFlag ||
        r.riskFlag === "SELF_HARM_CRITICAL" ||
        r.riskFlag === "PSYCH_RISK" ||
        (typeof r.epdsScore === "number" && r.epdsScore >= 13)
    );

    if (!hasActiveConsent && !isEmergencyFlagged) {
      return NextResponse.json({ error: "Active patient consent is required" }, { status: 403 });
    }

    const [notesRaw, sessions, messages] = await Promise.all([
      prisma.psychNote.findMany({
        where: { patientId, psychologistId: actor.userId },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.psychSession.findMany({
        where: { patientId, psychologistId: actor.userId },
        orderBy: { scheduledAt: "desc" },
        take: 30,
      }),
      hasActiveConsent
        ? prisma.directMessage.findMany({
            where: {
              patientId,
              OR: [
                { senderUserId: actor.userId },
                { recipientUserId: actor.userId },
              ],
            },
            orderBy: { createdAt: "asc" },
            take: 80,
          })
        : Promise.resolve([]),
    ]);

    const checkins = checkinsRaw.map((r) => {
      let answers = {};
      try {
        answers = JSON.parse(r.answersJson || "{}");
      } catch {
        answers = {};
      }
      return {
        id: r.id,
        date: r.date,
        mood: r.mood,
        epdsScore: r.epdsScore,
        epdsSelfHarmFlag: r.epdsSelfHarmFlag,
        riskFlag: r.riskFlag,
        source: r.source,
        answers: hasActiveConsent && consent.shareWellbeing ? answers : {},
        createdAt: r.createdAt,
      };
    });

    const notes = notesRaw.map((n) => ({
      id: n.id,
      sessionId: n.sessionId,
      riskAssessment: n.riskAssessment,
      notes: decryptField(n.notesEncrypted),
      createdAt: n.createdAt,
    }));

    return NextResponse.json({
      patient: {
        ...patient,
        mahalla: hasActiveConsent ? patient.mahalla : null,
      },
      hasActiveConsent,
      consent,
      checkins,
      epdsHistory: checkins.filter((c) => typeof c.epdsScore === "number"),
      notes,
      sessions,
      messages,
      clinicalEhrSeparated: true,
    });
  } catch (error) {
    console.error("GET /api/psychologist/patients/[id] error:", error);
    return NextResponse.json({ error: "Failed to load patient psychological record" }, { status: 500 });
  }
}

export async function POST(req, context) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor || !canAccessPsychologistPortal(actor.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: patientId } = await context.params;
    const body = await req.json();

    if (body.action === "ESCALATE_TO_DOCTOR") {
      const noteText = (body.message || "").trim().slice(0, 800);
      if (!noteText) {
        return NextResponse.json({ error: "Message text is required" }, { status: 400 });
      }
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: { assignedFamilyDoctor: true },
      });
      if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
      }
      if (!patient.assignedFamilyDoctorId) {
        return NextResponse.json({ error: "No family doctor assigned to this patient yet" }, { status: 400 });
      }

      const dm = await prisma.directMessage.create({
        data: {
          patientId: patient.id,
          senderUserId: actor.userId,
          senderName: actor.fullName,
          senderRole: actor.role,
          recipientUserId: patient.assignedFamilyDoctorId,
          body: `[Psixologdan shifokorga] ${noteText}`,
          channel: "WEB",
        },
      });

      await notifyUserViaTelegram(
        patient.assignedFamilyDoctorId,
        `🧠➡️🩺 <b>Psixologdan shifokorga shoshilinch xabar</b>\n\n` +
          `• <b>Psixolog:</b> ${actor.fullName}\n` +
          `• <b>Bemor:</b> ${patient.fullName} (${patient.district})\n` +
          `• <b>Xabar:</b> ${noteText}`
      );

      await recordAuditLog({
        actor,
        action: "PSYCH_ESCALATED_TO_DOCTOR",
        resourceType: "Patient",
        resourceId: patient.id,
        details: { doctorId: patient.assignedFamilyDoctorId },
      });

      return NextResponse.json({ success: true, directMessage: dm });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/psychologist/patients/[id] error:", error);
    return NextResponse.json({ error: "Failed to communicate with doctor" }, { status: 500 });
  }
}
