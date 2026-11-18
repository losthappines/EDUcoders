import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { canVerifyVisitAsDoctor, resolveActorAfterSeed } from "@/lib/rbac";
import { getTelegramMiniAppUrl, notifyUserViaTelegram } from "@/lib/telegram-bot";

export async function GET(req) {
  await connection();
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const patientIdParam = req.nextUrl.searchParams.get("patientId");
    const complaintIdParam = req.nextUrl.searchParams.get("complaintId");

    let where = {};
    if (actor.role === "PATIENT") {
      const patient = await prisma.patient.findUnique({ where: { userId: actor.userId } });
      if (!patient) return NextResponse.json({ messages: [] });
      where = {
        patientId: patient.id,
        ...(complaintIdParam ? { complaintId: complaintIdParam } : {}),
      };
    } else if (actor.role === "PSYCHOLOGIST") {
      if (!patientIdParam) {
        where = {
          OR: [{ senderUserId: actor.userId }, { recipientUserId: actor.userId }],
        };
      } else {
        const consent = await prisma.psychConsent.findUnique({
          where: { patientId_psychologistId: { patientId: patientIdParam, psychologistId: actor.userId } },
        });
        if (!consent || consent.status !== "ACTIVE") {
          return NextResponse.json({ error: "Active patient consent is required for chat" }, { status: 403 });
        }
        where = {
          patientId: patientIdParam,
          OR: [{ senderUserId: actor.userId }, { recipientUserId: actor.userId }],
        };
      }
    } else if (canVerifyVisitAsDoctor(actor.role)) {
      if (actor.role === "FAMILY_MD" && patientIdParam) {
        const patient = await prisma.patient.findUnique({ where: { id: patientIdParam } });
        if (
          patient &&
          actor.polyclinicId &&
          patient.polyclinicId !== actor.polyclinicId &&
          patient.assignedFamilyDoctorId !== actor.userId
        ) {
          return NextResponse.json({ error: "RBAC Denied: Patient outside your clinic scope" }, { status: 403 });
        }
      }
      where = {
        ...(patientIdParam ? { patientId: patientIdParam } : {}),
        ...(complaintIdParam ? { complaintId: complaintIdParam } : {}),
      };
    } else {
      return NextResponse.json({ error: "Forbidden — private clinical chat access only" }, { status: 403 });
    }

    const messages = await prisma.directMessage.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: 80,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const text = (body.body || "").trim().slice(0, 1500);
    if (!text) {
      return NextResponse.json({ error: "Message text cannot be empty." }, { status: 400 });
    }

    let patient = null;
    if (actor.role === "PATIENT") {
      patient = await prisma.patient.findUnique({ where: { userId: actor.userId } });
    } else if (actor.role === "PSYCHOLOGIST") {
      if (!body.patientId) {
        return NextResponse.json({ error: "patientId is required" }, { status: 400 });
      }
      const consent = await prisma.psychConsent.findUnique({
        where: { patientId_psychologistId: { patientId: body.patientId, psychologistId: actor.userId } },
      });
      if (!consent || consent.status !== "ACTIVE") {
        return NextResponse.json({ error: "Active patient consent is required" }, { status: 403 });
      }
      patient = await prisma.patient.findUnique({ where: { id: body.patientId } });
    } else if (canVerifyVisitAsDoctor(actor.role)) {
      if (!body.patientId) {
        return NextResponse.json({ error: "patientId is required" }, { status: 400 });
      }
      patient = await prisma.patient.findUnique({ where: { id: body.patientId } });
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!patient) {
      return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
    }

    let recipientUserId = body.recipientUserId || null;
    if (actor.role === "PATIENT" && !recipientUserId) {
      const latestComp = await prisma.complaint.findFirst({
        where: { patientId: patient.id, assignedDoctorId: { not: null } },
        orderBy: { createdAt: "desc" },
      });
      recipientUserId = latestComp?.assignedDoctorId || patient.assignedFamilyDoctorId || null;
      if (!recipientUserId) {
        const fallbackDoc =
          (patient.polyclinicId
            ? await prisma.user.findFirst({
                where: {
                  role: "FAMILY_MD",
                  polyclinicId: patient.polyclinicId,
                  verificationStatus: "VERIFIED",
                },
                select: { id: true },
              })
            : null) ||
          (await prisma.user.findFirst({
            where: { role: { in: ["FAMILY_MD", "OVABMU_MD"] }, verificationStatus: "VERIFIED" },
            select: { id: true },
          }));
        recipientUserId = fallbackDoc?.id || null;
      }
    } else if (actor.role !== "PATIENT" && !recipientUserId) {
      recipientUserId = patient.userId || null;
    }

    const message = await prisma.directMessage.create({
      data: {
        complaintId: body.complaintId || null,
        patientId: patient.id,
        senderUserId: actor.userId,
        senderName: actor.fullName,
        senderRole: actor.role,
        recipientUserId,
        body: text,
        channel: "WEB",
      },
    });

    if (recipientUserId) {
      const miniAppUrl = getTelegramMiniAppUrl();
      const prefix =
        actor.role === "PATIENT"
          ? `💬 <b>Bemordan xabar (${actor.fullName}):</b>`
          : actor.role === "PSYCHOLOGIST"
            ? `💜 <b>Psixologdan xabar (${actor.fullName}):</b>`
            : `🩺 <b>Shifokor / Hamshira maslahati (${actor.fullName}):</b>`;
      const actionButtons =
        actor.role === "PATIENT"
          ? [
              [
                {
                  text: "✍️ Javob qaytarish",
                  callbackData: body.complaintId ? `DOC_RESPOND:${body.complaintId}` : `DOC_DM_PATIENT:${patient.id}`,
                },
              ],
              [{ text: "📱 Kabinetni ochish", webAppUrl: miniAppUrl }],
            ]
          : actor.role === "PSYCHOLOGIST"
            ? [[{ text: "📱 Mini Appda javob berish", webAppUrl: miniAppUrl }]]
            : [
                [{ text: "💬 Javob yozish", callbackData: "PATIENT:DM_START" }],
                [{ text: "📱 Mini Appda ochish", webAppUrl: miniAppUrl }],
              ];
      await notifyUserViaTelegram(recipientUserId, `${prefix}\n\n${text}`, actionButtons);
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
