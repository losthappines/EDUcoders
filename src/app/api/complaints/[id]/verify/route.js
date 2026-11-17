import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { canVerifyVisitAsDoctor, recordAuditLog, resolveActorContext } from "@/lib/rbac";
import { notifyUserViaTelegram } from "@/lib/telegram-bot";

export async function POST(req, { params }) {
  try {
    await ensureSeeded();
    const { id } = await params;
    const actor = await resolveActorContext(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (!canVerifyVisitAsDoctor(actor.role)) {
      return NextResponse.json({ error: "Forbidden — only doctors can verify visits" }, { status: 403 });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { patient: true },
    });
    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    const body = await req.json();
    const otpCode = (body.otpCode || "").trim();
    if (otpCode && otpCode !== complaint.visitOtpCode) {
      return NextResponse.json(
        { error: "Visit OTP code does not match patient's confirmation code." },
        { status: 400 }
      );
    }

    const vitals = {
      systolicBp: Number(body.systolicBp) || 120,
      diastolicBp: Number(body.diastolicBp) || 80,
      heartRate: Number(body.heartRate) || 78,
      tempC: Number(body.tempC) || 36.6,
      spo2: Number(body.spo2) || 98,
      recordedAt: new Date().toISOString(),
    };
    const visitVerificationNote =
      (body.visitVerificationNote || "").trim().slice(0, 1000) ||
      "Shifokor belgilangan manzilga borib bemorni ko'rikdan o'tkazdi va holatini tasdiqladi.";

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        assignedDoctorId: actor.userId,
        status: "VERIFIED_COMPLETED",
        visitVerifiedAt: new Date(),
        visitVerificationNote,
        verifiedVitalsJson: JSON.stringify(vitals),
      },
      include: {
        patient: { select: { id: true, userId: true, fullName: true } },
        assignedDoctor: { select: { id: true, fullName: true, specialty: true } },
      },
    });

    if (complaint.patient.userId) {
      await notifyUserViaTelegram(
        complaint.patient.userId,
        `✅ <b>Shifokor tashrifi tasdiqlandi!</b>\n` +
          `👨‍⚕️ ${actor.fullName} belgilangan joyga kelib holingizdan xabar oldi.\n` +
          `🩺 Ko'rsatkichlar: AQB ${vitals.systolicBp}/${vitals.diastolicBp}, Harorat ${vitals.tempC}°C, SpO2 ${vitals.spo2}%\n` +
          `📝 Xulosa: ${visitVerificationNote}`
      );
    }

    await recordAuditLog({
      actor,
      action: "COMPLAINT_VISIT_VERIFIED",
      resourceType: "Complaint",
      resourceId: id,
      details: { patientName: complaint.patient.fullName, vitals, otpVerified: Boolean(otpCode) },
    });

    return NextResponse.json({ success: true, complaint: { ...updated, verifiedVitals: vitals } });
  } catch (error) {
    console.error("POST /api/complaints/[id]/verify error:", error);
    return NextResponse.json({ error: "Failed to verify complaint visit" }, { status: 500 });
  }
}
