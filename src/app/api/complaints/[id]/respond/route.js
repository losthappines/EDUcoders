import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { canVerifyVisitAsDoctor, recordAuditLog, resolveActorContext } from "@/lib/rbac";
import { haversineDistanceKm } from "@/lib/geo";
import { notifyUserViaTelegram } from "@/lib/telegram-bot";

const ALLOWED_TRANSITIONS = new Set(["DOCTOR_RESPONDED", "EN_ROUTE", "ARRIVED"]);

export async function POST(req, { params }) {
  try {
    await ensureSeeded();
    const { id } = await params;
    const actor = await resolveActorContext(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (!canVerifyVisitAsDoctor(actor.role)) {
      return NextResponse.json({ error: "Forbidden — clinical doctor role required" }, { status: 403 });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { patient: true },
    });
    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    const body = await req.json();
    const responseText = (body.doctorResponse || "").trim().slice(0, 1500);
    const nextStatus = ALLOWED_TRANSITIONS.has(body.status)
      ? body.status
      : complaint.status === "SUBMITTED"
        ? "DOCTOR_RESPONDED"
        : complaint.status;

    const doctorUser = await prisma.user.findUnique({ where: { id: actor.userId } });
    const distanceKm =
      typeof doctorUser?.latitude === "number" &&
      typeof doctorUser?.longitude === "number" &&
      typeof complaint.latitude === "number" &&
      typeof complaint.longitude === "number"
        ? haversineDistanceKm(
            doctorUser.latitude,
            doctorUser.longitude,
            complaint.latitude,
            complaint.longitude
          )
        : complaint.distanceKm;

    const updated = await prisma.$transaction(async (tx) => {
      const saved = await tx.complaint.update({
        where: { id },
        data: {
          assignedDoctorId: actor.userId,
          status: nextStatus,
          ...(responseText ? { doctorResponse: responseText, doctorRespondedAt: new Date() } : {}),
          distanceKm,
        },
        include: {
          patient: { select: { id: true, userId: true, fullName: true } },
          assignedDoctor: {
            select: {
              id: true,
              fullName: true,
              specialty: true,
              expertiseArea: true,
              experienceYears: true,
              phone: true,
            },
          },
        },
      });

      if (responseText) {
        await tx.directMessage.create({
          data: {
            complaintId: id,
            patientId: complaint.patientId,
            senderUserId: actor.userId,
            senderName: actor.fullName,
            senderRole: actor.role,
            recipientUserId: complaint.patient.userId || null,
            body: responseText,
            channel: "WEB",
          },
        });
      }
      return saved;
    });

    if (complaint.patient.userId) {
      const statusLabel =
        nextStatus === "EN_ROUTE"
          ? "🚗 Shifokor yo'lga chiqdi!"
          : nextStatus === "ARRIVED"
            ? "📍 Shifokor belgilangan manzilga yetib keldi!"
            : "🩺 Shifokor shikoyatingizga javob berdi!";
      await notifyUserViaTelegram(
        complaint.patient.userId,
        `${statusLabel}\n` +
          `👨‍⚕️ Shifokor: <b>${actor.fullName}</b>\n` +
          (responseText ? `💬 Maslahat: <i>${responseText}</i>\n` : "") +
          `🔑 Tashrif OTP kodi: <b>${complaint.visitOtpCode}</b>`
      );
    }

    await recordAuditLog({
      actor,
      action: "COMPLAINT_DOCTOR_RESPONDED",
      resourceType: "Complaint",
      resourceId: id,
      details: { nextStatus, hasMessage: Boolean(responseText), distanceKm },
    });

    return NextResponse.json({ success: true, complaint: updated });
  } catch (error) {
    console.error("POST /api/complaints/[id]/respond error:", error);
    return NextResponse.json({ error: "Failed to respond to complaint" }, { status: 500 });
  }
}
