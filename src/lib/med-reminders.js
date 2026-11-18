import { prisma } from "@/lib/db";
import { getTashkentTimeParts, tashkentDateTimeToUtcDate } from "@/lib/wellbeing";
import {
  inferReminderTimesFromFrequency,
  parseReminderTimesJson,
  validateReminderTimes,
} from "@/lib/wellbeing-catalog";
import { getTelegramMiniAppUrl, notifyAdminsViaTelegram, notifyUserViaTelegram } from "@/lib/telegram-bot";

export {
  inferReminderTimesFromFrequency,
  parseReminderTimesJson,
  validateReminderTimes,
};

let lastThrottledRunMs = 0;
let activeRunPromise = null;

export async function maybeRunThrottledReminders() {
  const nowMs = Date.now();
  if (nowMs - lastThrottledRunMs < 60_000) {
    return null;
  }
  if (activeRunPromise) {
    return activeRunPromise;
  }
  lastThrottledRunMs = nowMs;
  activeRunPromise = runReminderDispatchCycle({ now: new Date() })
    .catch((err) => {
      console.error("Throttled reminder cycle warning:", err);
      return null;
    })
    .finally(() => {
      activeRunPromise = null;
    });
  return activeRunPromise;
}

export async function runReminderDispatchCycle({ now = new Date() } = {}) {
  const tashkent = getTashkentTimeParts(now);
  const summary = {
    tashkentNow: `${tashkent.dateStr} ${tashkent.hhmm}`,
    medPreSent: 0,
    medAtDoseSent: 0,
    medSnoozeSent: 0,
    medMarkedMissed: 0,
    medDeactivatedExpired: 0,
    doctorMissedAlerts: 0,
    psychSessionReminders: 0,
    morningWellbeingPrompts: 0,
    selfHarmSlaEscalations: 0,
    visitRemindersSent: 0,
  };

  // 1. Prescription Medication Reminders
  const prescriptions = await prisma.prescription.findMany({
    where: { active: true },
    include: {
      patient: {
        include: {
          user: { select: { id: true, telegramChatId: true, fullName: true } },
        },
      },
    },
  });

  const webAppUrl = getTelegramMiniAppUrl();

  for (const rx of prescriptions) {
    const elapsedDays = Math.floor((now.getTime() - new Date(rx.createdAt).getTime()) / 86400000);
    if (elapsedDays >= (rx.durationDays || 14)) {
      await prisma.prescription.update({
        where: { id: rx.id },
        data: { active: false },
      });
      summary.medDeactivatedExpired += 1;
      continue;
    }

    if (!rx.remindersEnabled) continue;
    const recipientUserId = rx.patient?.userId;
    if (!recipientUserId || !rx.patient?.user?.telegramChatId) continue;

    const times = parseReminderTimesJson(rx.reminderTimesJson, rx.frequency);
    for (const hhmm of times) {
      const doseAt = tashkentDateTimeToUtcDate(tashkent.dateStr, hhmm);
      const diffMin = (doseAt.getTime() - now.getTime()) / 60000;

      let log = await prisma.medReminderLog.findUnique({
        where: {
          prescriptionId_doseAt: {
            prescriptionId: rx.id,
            doseAt,
          },
        },
      });

      // Pre-create log if entering pre-window (-120m to +15m)
      if (!log && diffMin <= 15 && diffMin >= -180) {
        log = await prisma.medReminderLog.create({
          data: {
            prescriptionId: rx.id,
            patientId: rx.patientId,
            doseAt,
            status: "PENDING",
          },
        });
      }
      if (!log || log.status === "TAKEN" || log.status === "MISSED") continue;

      const actionButtons = [
        [
          { text: "✅ Ichdim", callbackData: `MED_TAKEN:${log.id}` },
          ...(log.snoozeCount < 2 ? [{ text: "⏰ 30 daqiqa keyin", callbackData: `MED_SNOOZE:${log.id}` }] : []),
        ],
        [{ text: "📱 Kabinet", webAppUrl }],
      ];

      // A) 10-minute pre-reminder (window: 1..15 min before dose, or 0..15)
      if (!log.preSentAt && diffMin <= 15 && diffMin >= -2) {
        const text =
          `💊 <b>Dori ichish eslatmasi (10 daqiqadan so'ng — ${hhmm})</b>\n\n` +
          `• <b>Dori:</b> ${rx.medicationName} (${rx.dosage})\n` +
          `• <b>Yo'riqnoma:</b> ${rx.instructionsUz}`;
        const sent = await notifyUserViaTelegram(recipientUserId, text, actionButtons);
        if (sent.delivered || sent.storedInSession) {
          await prisma.medReminderLog.update({
            where: { id: log.id },
            data: { preSentAt: now },
          });
          summary.medPreSent += 1;
        }
        continue;
      }

      // B) Snoozed follow-up when nextRemindAt is reached
      if (log.status === "SNOOZED" && log.nextRemindAt && now.getTime() >= new Date(log.nextRemindAt).getTime()) {
        const text =
          `⏰ <b>Takroriy dori eslatmasi — ${hhmm} dozasi</b>\n\n` +
          `• <b>Dori:</b> ${rx.medicationName} (${rx.dosage})\n` +
          `• <b>Yo'riqnoma:</b> ${rx.instructionsUz}`;
        const sent = await notifyUserViaTelegram(recipientUserId, text, actionButtons);
        if (sent.delivered || sent.storedInSession) {
          await prisma.medReminderLog.update({
            where: { id: log.id },
            data: { nextRemindAt: null, atDoseSentAt: now },
          });
          summary.medSnoozeSent += 1;
        }
        continue;
      }

      // C) At-dose follow-up (if past dose time by 1..120m and atDoseSentAt is null)
      if (log.status === "PENDING" && !log.atDoseSentAt && diffMin < -1 && diffMin >= -120) {
        const text =
          `🩺 <b>Dori vaqti keldi (${hhmm})</b>\n\n` +
          `<b>${rx.medicationName}</b> (${rx.dosage}) ni qabul qildingizmi?`;
        const sent = await notifyUserViaTelegram(recipientUserId, text, actionButtons);
        if (sent.delivered || sent.storedInSession) {
          await prisma.medReminderLog.update({
            where: { id: log.id },
            data: { atDoseSentAt: now },
          });
          summary.medAtDoseSent += 1;
        }
        continue;
      }

      // D) Expire after > 2 hours without confirmation -> MISSED
      if (diffMin < -120 && (log.preSentAt || log.atDoseSentAt)) {
        await prisma.medReminderLog.update({
          where: { id: log.id },
          data: { status: "MISSED", respondedAt: now },
        });
        summary.medMarkedMissed += 1;

        const recentLogs = await prisma.medReminderLog.findMany({
          where: { prescriptionId: rx.id },
          orderBy: { doseAt: "desc" },
          take: 2,
        });
        if (recentLogs.length >= 2 && recentLogs.every((r) => r.status === "MISSED")) {
          if (rx.patient.assignedFamilyDoctorId) {
            await notifyUserViaTelegram(
              rx.patient.assignedFamilyDoctorId,
              `⚠️ <b>Ketma-ket 2 marta dori o'tkazib yuborildi</b>\n\n` +
                `👩 <b>Bemor:</b> ${rx.patient.fullName} (${rx.patient.district})\n` +
                `💊 <b>Dori:</b> ${rx.medicationName} (${rx.dosage})\n` +
                `📞 <b>Telefon:</b> ${rx.patient.phone}`
            );
            summary.doctorMissedAlerts += 1;
          }
        }
      }
    }
  }

  // 2. PsychSession 10-minute Pre-Reminders
  const upcomingSessions = await prisma.psychSession.findMany({
    where: {
      status: "SCHEDULED",
      reminder10mSentAt: null,
      scheduledAt: {
        gte: new Date(now.getTime() - 2 * 60000),
        lte: new Date(now.getTime() + 15 * 60000),
      },
    },
    include: {
      patient: { select: { id: true, fullName: true, userId: true } },
      psychologist: { select: { id: true, fullName: true } },
    },
  });

  for (const sess of upcomingSessions) {
    const timeLabel = getTashkentTimeParts(new Date(sess.scheduledAt)).hhmm;
    if (sess.patient?.userId) {
      await notifyUserViaTelegram(
        sess.patient.userId,
        `💜 <b>Psixolog seansi 10 daqiqadan so'ng (${timeLabel})</b>\n` +
          `Mutaxassis: <b>${sess.psychologist.fullName}</b>\n` +
          `Format: ${sess.sessionType}${sess.topic ? `\nMavzu: ${sess.topic}` : ""}`,
        [[{ text: "📱 Kabinetni ochish", webAppUrl }]]
      );
    }
    await notifyUserViaTelegram(
      sess.psychologistId,
      `💜 <b>Konsultatsiya 10 daqiqadan so'ng (${timeLabel})</b>\n` +
        `Bemor: <b>${sess.patient.fullName}</b>\nFormat: ${sess.sessionType}`,
      [[{ text: "📱 Psixolog kabineti", webAppUrl }]]
    );
    await prisma.psychSession.update({
      where: { id: sess.id },
      data: { reminder10mSentAt: now },
    });
    summary.psychSessionReminders += 1;
  }

  // 3. Morning Daily Wellbeing Prompt (09:00–11:59 Asia/Tashkent, deduped once daily per patient)
  if (tashkent.hour >= 9 && tashkent.hour < 12) {
    const patientsWithTg = await prisma.patient.findMany({
      where: {
        status: { notIn: ["PENDING_VERIFICATION", "REJECTED"] },
        user: { telegramChatId: { not: null }, verificationStatus: "VERIFIED" },
      },
      include: { user: { select: { id: true, telegramChatId: true } } },
    });

    for (const p of patientsWithTg) {
      const existingToday = await prisma.wellbeingCheckin.findFirst({
        where: { patientId: p.id, date: tashkent.dateStr },
      });
      if (existingToday) continue;

      const tgSess = p.user?.telegramChatId
        ? await prisma.telegramSession.findUnique({ where: { chatId: p.user.telegramChatId } })
        : null;
      let draft = {};
      try {
        draft = tgSess?.draftJson ? JSON.parse(tgSess.draftJson) : {};
      } catch {
        draft = {};
      }
      if (draft.lastWellbeingPromptDate === tashkent.dateStr) continue;

      const sent = await notifyUserViaTelegram(
        p.userId,
        `☀️ <b>Xayrli tong, ${p.fullName.split(" ")[0]}!</b>\n\n` +
          `Bugun o'zingizni qanday his qilyapsiz? 1 ta tugma bilan belgilang:`,
        [
          [
            { text: "😢", callbackData: "WELLBEING_MOOD:1" },
            { text: "😕", callbackData: "WELLBEING_MOOD:2" },
            { text: "😐", callbackData: "WELLBEING_MOOD:3" },
            { text: "🙂", callbackData: "WELLBEING_MOOD:4" },
            { text: "😊", callbackData: "WELLBEING_MOOD:5" },
          ],
          [{ text: "📱 Kabinetda to'ldirish", webAppUrl }],
        ]
      );
      if ((sent.delivered || sent.storedInSession) && tgSess) {
        await prisma.telegramSession.update({
          where: { chatId: tgSess.chatId },
          data: {
            draftJson: JSON.stringify({ ...draft, lastWellbeingPromptDate: tashkent.dateStr }),
          },
        });
        summary.morningWellbeingPrompts += 1;
      }
    }
  }

  // 4. Unacknowledged Self-Harm 1h SLA Escalation
  const unackedConsents = await prisma.psychConsent.findMany({
    where: {
      selfHarmAlertAt: { lte: new Date(now.getTime() - 60 * 60000) },
      selfHarmAckAt: null,
    },
    include: {
      patient: { select: { id: true, fullName: true, district: true, phone: true, assignedFamilyDoctorId: true } },
      psychologist: { select: { id: true, fullName: true } },
    },
  });

  for (const c of unackedConsents) {
    const markerAction = `SELF_HARM_SLA_ESCALATED:${c.id}:${new Date(c.selfHarmAlertAt).toISOString().slice(0, 16)}`;
    const alreadyLogged = await prisma.auditLog.findFirst({
      where: { action: markerAction },
    });
    if (alreadyLogged) continue;

    const text =
      `🚨 <b>1 SOATLIK SLA O'TDI — SHOSHILINCH NAZORAT!</b>\n\n` +
      `👩 <b>Bemor:</b> ${c.patient.fullName} (${c.patient.district})\n` +
      `📞 <b>Telefon:</b> ${c.patient.phone}\n` +
      `🧠 <b>Psixolog:</b> ${c.psychologist.fullName} hali tasdiqlamadi.\n` +
      `Iltimos, shoshilinch bog'laning yoki 103 xizmatini yo'naltiring.`;

    if (c.patient.assignedFamilyDoctorId) {
      await notifyUserViaTelegram(c.patient.assignedFamilyDoctorId, text);
    }
    await notifyAdminsViaTelegram(text);

    await prisma.auditLog.create({
      data: {
        actorId: "SYSTEM_CRON",
        actorName: "OnaCare SLA Monitor",
        actorRole: "SYSTEM",
        action: markerAction,
        resourceType: "PsychConsent",
        resourceId: c.id,
        ipAddress: "cron",
        detailsJson: JSON.stringify({ patientId: c.patientId, psychologistId: c.psychologistId }),
      },
    });
    summary.selfHarmSlaEscalations += 1;
  }

  // 5. 24-Hour Home-Visit Reminders for Assigned Doctors / Nurses & Patients (deduped every 6h)
  const pendingCalls = await prisma.activeCall.findMany({
    where: {
      status: { in: ["SCHEDULED", "ESCALATED_12H", "CRITICAL_18H"] },
    },
    include: {
      patient: {
        select: { id: true, fullName: true, phone: true, address: true, district: true, userId: true },
      },
      assignedDoctor: {
        select: { id: true, fullName: true, phone: true, telegramChatId: true },
      },
    },
  });

  const blockSlot = Math.floor(tashkent.hour / 6);
  for (const call of pendingCalls) {
    if (call.assignedDoctorId && call.assignedDoctor?.telegramChatId) {
      const docMarker = `VISIT_REMINDER_DOC:${call.id}:${tashkent.dateStr}:${blockSlot}`;
      const docSeen = await prisma.auditLog.findFirst({ where: { action: docMarker } });
      if (!docSeen) {
        const windowStart = getTashkentTimeParts(new Date(call.scheduledWindowStart)).hhmm;
        const windowEnd = getTashkentTimeParts(new Date(call.scheduledWindowEnd)).hhmm;
        const sentDoc = await notifyUserViaTelegram(
          call.assignedDoctorId,
          `⏰ <b>24 soatlik uy tashrifi eslatmasi (${call.status})</b>\n\n` +
            `👩 <b>Bemor:</b> ${call.patient.fullName} (${call.patient.phone})\n` +
            `📍 <b>Manzil:</b> ${call.patient.address}\n` +
            `🕒 <b>Tashrif oynasi:</b> ${windowStart} – ${windowEnd}`,
          [
            [{ text: "📱 Kabinetni ochish (Mini App)", webAppUrl }],
            [{ text: "💬 Bemorga yozish", callbackData: `DOC_DM_PATIENT:${call.patientId}` }],
          ]
        );
        if (sentDoc.delivered || sentDoc.storedInSession) {
          await prisma.auditLog.create({
            data: {
              actorId: "SYSTEM_CRON",
              actorName: "OnaCare Visit Reminder",
              actorRole: "SYSTEM",
              action: docMarker,
              resourceType: "ActiveCall",
              resourceId: call.id,
              ipAddress: "cron",
              detailsJson: JSON.stringify({ patientId: call.patientId }),
            },
          });
          summary.visitRemindersSent += 1;
        }
      }
    }

    if (call.patient?.userId) {
      const patMarker = `VISIT_REMINDER_PAT:${call.id}:${tashkent.dateStr}`;
      const patSeen = await prisma.auditLog.findFirst({ where: { action: patMarker } });
      if (!patSeen) {
        const windowStart = getTashkentTimeParts(new Date(call.scheduledWindowStart)).hhmm;
        const windowEnd = getTashkentTimeParts(new Date(call.scheduledWindowEnd)).hhmm;
        const sentPat = await notifyUserViaTelegram(
          call.patient.userId,
          `🩺 <b>Uy tashrifi eslatmasi</b>\n\n` +
            `Shifokor / hamshira <b>${call.assignedDoctor?.fullName || "Patronaj guruhi"}</b> bugun <b>${windowStart} – ${windowEnd}</b> oralig'ida tashrif buyurishi rejalashtirilgan.\n` +
            `🔑 Tasdiqlash OTP kodi: <b>${call.patientOtpCode}</b>`,
          [
            [{ text: "📱 Kabinetni ochish (Mini App)", webAppUrl }],
            [{ text: "💬 Shifokorga yozish", callbackData: "PATIENT:DM_START" }],
          ]
        );
        if (sentPat.delivered || sentPat.storedInSession) {
          await prisma.auditLog.create({
            data: {
              actorId: "SYSTEM_CRON",
              actorName: "OnaCare Visit Reminder",
              actorRole: "SYSTEM",
              action: patMarker,
              resourceType: "ActiveCall",
              resourceId: call.id,
              ipAddress: "cron",
              detailsJson: JSON.stringify({ patientId: call.patientId }),
            },
          });
          summary.visitRemindersSent += 1;
        }
      }
    }
  }

  return summary;
}
