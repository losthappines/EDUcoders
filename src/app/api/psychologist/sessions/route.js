import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { canAccessPsychologistPortal, recordAuditLog, resolveActorAfterSeed } from "@/lib/rbac";
import { notifyUserViaTelegram } from "@/lib/telegram-bot";

export async function GET(req) {
  await connection();
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const psychologists = await prisma.user.findMany({
      where: { role: "PSYCHOLOGIST", verificationStatus: "VERIFIED" },
      select: {
        id: true,
        fullName: true,
        district: true,
        specialty: true,
        expertiseArea: true,
        experienceYears: true,
        bioSummary: true,
        polyclinicName: true,
        scheduleSlotsJson: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const parsedPsychologists = psychologists.map((p) => ({
      ...p,
      scheduleSlots: JSON.parse(p.scheduleSlotsJson || "[]"),
    }));

    if (actor.role === "PATIENT") {
      const patient = await prisma.patient.findUnique({ where: { userId: actor.userId } });
      if (!patient) {
        return NextResponse.json({ psychologists: parsedPsychologists, consents: [], sessions: [] });
      }
      const [consents, sessions] = await Promise.all([
        prisma.psychConsent.findMany({
          where: { patientId: patient.id },
          include: {
            psychologist: { select: { id: true, fullName: true, specialty: true, district: true } },
          },
        }),
        prisma.psychSession.findMany({
          where: { patientId: patient.id },
          include: {
            psychologist: { select: { id: true, fullName: true, specialty: true } },
          },
          orderBy: { scheduledAt: "asc" },
        }),
      ]);
      return NextResponse.json({
        psychologists: parsedPsychologists,
        consents,
        sessions,
      });
    }

    if (canAccessPsychologistPortal(actor.role)) {
      const sessions = await prisma.psychSession.findMany({
        where: { psychologistId: actor.userId },
        include: {
          patient: { select: { id: true, fullName: true, district: true, phone: true } },
        },
        orderBy: { scheduledAt: "asc" },
      });
      return NextResponse.json({
        psychologists: parsedPsychologists,
        sessions,
      });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("GET /api/psychologist/sessions error:", error);
    return NextResponse.json({ error: "Failed to load sessions" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action || "";

    if (actor.role === "PATIENT") {
      const patient = await prisma.patient.findUnique({ where: { userId: actor.userId } });
      if (!patient) {
        return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
      }

      if (action === "GRANT_CONSENT") {
        const psychologistId = String(body.psychologistId || "").trim();
        const psych = await prisma.user.findFirst({
          where: { id: psychologistId, role: "PSYCHOLOGIST", verificationStatus: "VERIFIED" },
        });
        if (!psych) {
          return NextResponse.json({ error: "Verified psychologist not found" }, { status: 404 });
        }

        const consent = await prisma.psychConsent.upsert({
          where: {
            patientId_psychologistId: { patientId: patient.id, psychologistId },
          },
          update: {
            status: "ACTIVE",
            shareWellbeing: body.shareWellbeing !== false,
            shareAssistantTopics: body.shareAssistantTopics !== false,
            consentedAt: new Date(),
            withdrawnAt: null,
          },
          create: {
            patientId: patient.id,
            psychologistId,
            status: "ACTIVE",
            shareWellbeing: body.shareWellbeing !== false,
            shareAssistantTopics: body.shareAssistantTopics !== false,
          },
        });

        await notifyUserViaTelegram(
          psychologistId,
          `🤝 <b>Yangi ona roziligi</b>\n<b>${patient.fullName}</b> (${patient.district}) sizga kundalik ruhiy holat yozuvlari va suhbat uchun rozilik berdi.`
        );
        await recordAuditLog({
          actor,
          action: "PSYCH_CONSENT_GRANTED",
          resourceType: "PsychConsent",
          resourceId: consent.id,
          details: { psychologistId },
        });

        return NextResponse.json({ success: true, consent });
      }

      if (action === "WITHDRAW_CONSENT") {
        const psychologistId = String(body.psychologistId || "").trim();
        const consent = await prisma.psychConsent.update({
          where: {
            patientId_psychologistId: { patientId: patient.id, psychologistId },
          },
          data: {
            status: "WITHDRAWN",
            withdrawnAt: new Date(),
          },
        });
        await recordAuditLog({
          actor,
          action: "PSYCH_CONSENT_WITHDRAWN",
          resourceType: "PsychConsent",
          resourceId: consent.id,
          details: { psychologistId },
        });
        return NextResponse.json({ success: true, consent });
      }

      if (action === "BOOK_SESSION") {
        const psychologistId = String(body.psychologistId || "").trim();
        const psych = await prisma.user.findFirst({
          where: { id: psychologistId, role: "PSYCHOLOGIST", verificationStatus: "VERIFIED" },
        });
        if (!psych) {
          return NextResponse.json({ error: "Verified psychologist not found" }, { status: 404 });
        }
        const scheduledAt = new Date(body.scheduledAt || Date.now() + 24 * 3600000);
        if (Number.isNaN(scheduledAt.getTime())) {
          return NextResponse.json({ error: "Valid scheduledAt is required" }, { status: 400 });
        }
        const sessionType = ["CHAT", "VOICE", "VIDEO", "TELEGRAM_CALL"].includes(body.sessionType)
          ? body.sessionType
          : "CHAT";
        const topic = (body.topic || "Tug'ruqdan keyingi ruhiy ko'mak").trim().slice(0, 200);

        // Automatically ensure active consent exists when mother explicitly books a session
        await prisma.psychConsent.upsert({
          where: { patientId_psychologistId: { patientId: patient.id, psychologistId } },
          update: { status: "ACTIVE", withdrawnAt: null },
          create: {
            patientId: patient.id,
            psychologistId,
            status: "ACTIVE",
            shareWellbeing: true,
            shareAssistantTopics: true,
          },
        });

        const session = await prisma.psychSession.create({
          data: {
            patientId: patient.id,
            psychologistId,
            sessionType,
            scheduledAt,
            durationMin: Number(body.durationMin) || 45,
            status: "SCHEDULED",
            topic,
          },
        });

        await notifyUserViaTelegram(
          psychologistId,
          `📅 <b>Yangi seans band qilindi</b>\n👩 <b>Ona:</b> ${patient.fullName}\n🕒 <b>Vaqt:</b> ${scheduledAt.toISOString().slice(0, 16).replace("T", " ")}\n💬 <b>Format:</b> ${sessionType}\n📝 <b>Mavzu:</b> ${topic}`
        );

        return NextResponse.json({ success: true, session }, { status: 201 });
      }

      if (action === "CANCEL_SESSION") {
        const sessionId = String(body.sessionId || "").trim();
        const session = await prisma.psychSession.findUnique({ where: { id: sessionId } });
        if (!session || session.patientId !== patient.id) {
          return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }
        if (session.status !== "SCHEDULED") {
          return NextResponse.json({ error: "Only scheduled sessions can be cancelled" }, { status: 400 });
        }
        const updated = await prisma.psychSession.update({
          where: { id: session.id },
          data: { status: "CANCELLED" },
        });
        await notifyUserViaTelegram(
          session.psychologistId,
          `ℹ️ <b>Seans bekor qilindi</b>\n👩 <b>Ona:</b> ${patient.fullName}\n🕒 <b>Vaqt:</b> ${new Date(session.scheduledAt).toISOString().slice(0, 16).replace("T", " ")}`
        );
        return NextResponse.json({ success: true, session: updated });
      }

      return NextResponse.json({ error: "Unsupported patient action" }, { status: 400 });
    }

    if (canAccessPsychologistPortal(actor.role)) {
      if (action === "UPDATE_SLOTS") {
        const slots = Array.isArray(body.slots) ? body.slots.slice(0, 24) : [];
        await prisma.user.update({
          where: { id: actor.userId },
          data: { scheduleSlotsJson: JSON.stringify(slots) },
        });
        return NextResponse.json({ success: true, slots });
      }

      if (action === "UPDATE_SESSION_STATUS") {
        const session = await prisma.psychSession.findUnique({
          where: { id: String(body.sessionId || "") },
          include: { patient: true },
        });
        if (!session || session.psychologistId !== actor.userId) {
          return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }
        const nextStatus = ["SCHEDULED", "COMPLETED", "CANCELLED"].includes(body.status)
          ? body.status
          : session.status;
        const updated = await prisma.psychSession.update({
          where: { id: session.id },
          data: {
            status: nextStatus,
            ...(body.meetingUrl !== undefined ? { meetingUrl: String(body.meetingUrl || "").slice(0, 300) || null } : {}),
          },
        });
        if (session.patient?.userId && body.status) {
          await notifyUserViaTelegram(
            session.patient.userId,
            nextStatus === "COMPLETED"
              ? `✅ <b>Psixolog seansi yakunlandi</b> (${actor.fullName}). O'zingizni ehtiyot qiling!`
              : nextStatus === "CANCELLED"
                ? `ℹ️ <b>Psixolog seansi bekor qilindi</b> (${actor.fullName}). Yangi vaqt tanlashingiz mumkin.`
                : `📅 <b>Seans yangilandi</b> (${actor.fullName})`
          );
        }
        return NextResponse.json({ success: true, session: updated });
      }

      if (action === "CREATE_SESSION") {
        const patientId = String(body.patientId || "").trim();
        const scheduledAt = new Date(body.scheduledAt || Date.now() + 2 * 3600000);
        if (!patientId || Number.isNaN(scheduledAt.getTime())) {
          return NextResponse.json({ error: "patientId and valid scheduledAt required" }, { status: 400 });
        }
        const sessionType = ["CHAT", "VOICE", "VIDEO", "TELEGRAM_CALL"].includes(body.sessionType)
          ? body.sessionType
          : "VOICE";
        const session = await prisma.psychSession.create({
          data: {
            patientId,
            psychologistId: actor.userId,
            sessionType,
            scheduledAt,
            durationMin: Number(body.durationMin) || 45,
            status: "SCHEDULED",
            topic: (body.topic || "Individual qo'llab-quvvatlash seansi").trim().slice(0, 200),
            meetingUrl: body.meetingUrl ? String(body.meetingUrl).slice(0, 300) : null,
          },
        });
        return NextResponse.json({ success: true, session }, { status: 201 });
      }
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("POST /api/psychologist/sessions error:", error);
    return NextResponse.json({ error: "Failed to process session action" }, { status: 500 });
  }
}
