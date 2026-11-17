import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { canVerifyVisitAsDoctor, resolveActorContext } from "@/lib/rbac";
import { notifyUserViaTelegram } from "@/lib/telegram-bot";

export async function GET(req) {
  await connection();
  try {
    await ensureSeeded();
    const actor = await resolveActorContext(req);
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
    } else if (canVerifyVisitAsDoctor(actor.role) || actor.role === "ADMIN_RECEPTION") {
      where = {
        ...(patientIdParam ? { patientId: patientIdParam } : {}),
        ...(complaintIdParam ? { complaintId: complaintIdParam } : {}),
      };
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    await ensureSeeded();
    const actor = await resolveActorContext(req);
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
      const prefix =
        actor.role === "PATIENT"
          ? `💬 <b>Bemordan xabar (${actor.fullName}):</b>`
          : `🩺 <b>Shifokor maslahati (${actor.fullName}):</b>`;
      await notifyUserViaTelegram(recipientUserId, `${prefix}\n\n${text}`);
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
