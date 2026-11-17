import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed-data";
import { recordAuditLog, resolveActorContext } from "@/lib/rbac";
import { notifyUserViaTelegram, sendDoctorVisitReminders } from "@/lib/telegram-bot";

export async function POST(req) {
  try {
    await ensureSeeded();
    const actor = await resolveActorContext(req);
    if (!actor || actor.role !== "ADMIN_RECEPTION") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    if (body.doctorId) {
      const doctor = await prisma.user.findUnique({ where: { id: body.doctorId } });
      if (!doctor) {
        return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
      }
      const msg =
        body.message ||
        `⏰ <b>Admin Tashrif Eslatmasi (${doctor.fullName}):</b>\nSizga biriktirilgan faol bemor shikoyatlari va 24 soatlik ko'riklarni tekshiring va joyiga borib verifikatsiya qiling.`;
      const delivery = await notifyUserViaTelegram(doctor.id, msg);
      await recordAuditLog({
        actor,
        action: "ADMIN_TELEGRAM_REMINDER",
        resourceType: "User",
        resourceId: doctor.id,
        details: { doctorName: doctor.fullName, telegramLinked: Boolean(doctor.telegramChatId) },
      });
      return NextResponse.json({ success: true, delivery });
    }

    const summary = await sendDoctorVisitReminders();
    await recordAuditLog({
      actor,
      action: "ADMIN_BATCH_REMINDERS",
      resourceType: "System",
      resourceId: "telegram-reminders",
      details: summary,
    });
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("POST /api/admin/remind-doctor error:", error);
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 });
  }
}
