import { prisma } from "@/lib/db";
import { computeEpdsScore, EPDS_QUESTIONS, MOOD_SCALE } from "@/lib/wellbeing-catalog";

export { computeEpdsScore, EPDS_QUESTIONS, MOOD_SCALE };

const TASHKENT_TZ = "Asia/Tashkent";

export function getTashkentDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TASHKENT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value || "2026";
  const month = parts.find((p) => p.type === "month")?.value || "01";
  const day = parts.find((p) => p.type === "day")?.value || "01";
  return `${year}-${month}-${day}`;
}

export function getTashkentTimeParts(date = new Date()) {
  const dateStr = getTashkentDateString(date);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TASHKENT_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);
  return {
    dateStr,
    hour,
    minute,
    hhmm: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

export function tashkentDateTimeToUtcDate(dateStr, hhmm) {
  const [hh, mm] = String(hhmm || "09:00").split(":").map((n) => Number(n));
  const safeH = Number.isFinite(hh) ? String(hh).padStart(2, "0") : "09";
  const safeM = Number.isFinite(mm) ? String(mm).padStart(2, "0") : "00";
  return new Date(`${dateStr}T${safeH}:${safeM}:00+05:00`);
}

export function evaluateWellbeingSignals({
  mood,
  answers = {},
  epdsAnswers = null,
  recentCheckins = [],
}) {
  const numMood = Math.max(1, Math.min(5, Number(mood) || 3));
  const motherPain = answers?.motherPain || "none";
  const motherBleeding = answers?.motherBleeding || "normal";
  const motherFever = Boolean(answers?.motherFever);
  const newbornFeeding = answers?.newbornFeeding || "good";
  const newbornJaundice = Boolean(answers?.newbornJaundice);
  const newbornTempHigh = Boolean(answers?.newbornTempHigh);

  const hasPhysicalRedFlag =
    motherPain === "severe" ||
    motherBleeding === "heavy" ||
    motherFever ||
    newbornFeeding === "refusing" ||
    newbornTempHigh;

  const epdsResult = computeEpdsScore(epdsAnswers);

  // Deduplicate by date keeping latest entry per day, sorted newest first
  const byDate = new Map();
  for (const row of recentCheckins) {
    if (!row?.date) continue;
    if (!byDate.has(row.date)) {
      byDate.set(row.date, row);
    }
  }
  const previousDays = Array.from(byDate.values()).sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0
  );

  let consecutiveLowDays = numMood <= 2 ? 1 : 0;
  if (consecutiveLowDays > 0) {
    const todayStr = getTashkentDateString();
    for (const prev of previousDays) {
      if (prev.date === todayStr) continue;
      if (Number(prev.mood) <= 2) {
        consecutiveLowDays += 1;
      } else {
        break;
      }
    }
  }

  const lowMoodStreak3Plus = consecutiveLowDays >= 3;
  const epdsHighRisk = Boolean(epdsResult && epdsResult.totalScore >= 13);
  const selfHarmFlag = Boolean(epdsResult?.selfHarmFlag);

  let riskFlag = "GREEN";
  if (selfHarmFlag) {
    riskFlag = "SELF_HARM_CRITICAL";
  } else if (hasPhysicalRedFlag) {
    riskFlag = "RED_PHYSICAL";
  } else if (lowMoodStreak3Plus || epdsHighRisk) {
    riskFlag = "PSYCH_RISK";
  } else if (
    numMood <= 2 ||
    (epdsResult && epdsResult.totalScore >= 10) ||
    newbornJaundice ||
    motherPain === "mild" ||
    newbornFeeding === "less"
  ) {
    riskFlag = "YELLOW";
  }

  return {
    riskFlag,
    hasPhysicalRedFlag,
    consecutiveLowDays,
    lowMoodStreak3Plus,
    epdsScore: epdsResult ? epdsResult.totalScore : null,
    epdsSelfHarmFlag: selfHarmFlag,
    suggestPsychologist: lowMoodStreak3Plus || epdsHighRisk || selfHarmFlag || numMood <= 2,
  };
}

export async function triggerWellbeingRiskAlerts({
  patient,
  checkin,
  evaluation,
  notifyUserViaTelegram,
  notifyAdminsViaTelegram,
}) {
  const notified = [];

  if (evaluation.selfHarmFlag || evaluation.riskFlag === "SELF_HARM_CRITICAL") {
    // Flag active psych consents or mark patient consents with selfHarmAlertAt
    await prisma.psychConsent.updateMany({
      where: { patientId: patient.id, status: "ACTIVE" },
      data: { selfHarmAlertAt: new Date(), selfHarmAckAt: null },
    });

    const urgentText =
      `🚨 <b>SHOSHILINCH PSIXOLOGIK OGOHLANTIRISH (103 SLA)!</b>\n\n` +
      `👩 <b>Bemor:</b> ${patient.fullName}\n` +
      `📍 <b>Hudud:</b> ${patient.district}, ${patient.address}\n` +
      `⚠️ <b>Holat:</b> EPDS Q10 (o'ziga zarar yetkazish fikri) aniqlandi.\n` +
      `⏱️ <b>1 soatlik SLA:</b> Zudlik bilan bog'laning va tasdiqlang.`;

    if (patient.assignedFamilyDoctorId && notifyUserViaTelegram) {
      await notifyUserViaTelegram(patient.assignedFamilyDoctorId, urgentText);
      notified.push("FAMILY_MD");
    }

    const districtPsychologists = await prisma.user.findMany({
      where: {
        role: "PSYCHOLOGIST",
        verificationStatus: "VERIFIED",
        ...(patient.district ? { district: patient.district } : {}),
      },
      select: { id: true },
    });
    const fallbackPsychs =
      districtPsychologists.length > 0
        ? districtPsychologists
        : await prisma.user.findMany({
            where: { role: "PSYCHOLOGIST", verificationStatus: "VERIFIED" },
            select: { id: true },
            take: 5,
          });

    for (const psych of fallbackPsychs) {
      if (notifyUserViaTelegram) {
        await notifyUserViaTelegram(psych.id, urgentText);
        notified.push(`PSYCH:${psych.id}`);
      }
    }
    if (notifyAdminsViaTelegram) {
      await notifyAdminsViaTelegram(urgentText);
      notified.push("ADMIN");
    }
  } else if (evaluation.lowMoodStreak3Plus || (evaluation.epdsScore !== null && evaluation.epdsScore >= 13)) {
    const psychText =
      `💜 <b>Psixologik qo'llab-quvvatlash zarur</b>\n` +
      `👩 <b>Bemor:</b> ${patient.fullName} (${patient.district})\n` +
      `📊 <b>Belgi:</b> ${
        evaluation.epdsScore !== null && evaluation.epdsScore >= 13
          ? `EPDS=${evaluation.epdsScore}/30`
          : `${evaluation.consecutiveLowDays} kun ketma-ket past kayfiyat`
      }`;
    if (patient.assignedFamilyDoctorId && notifyUserViaTelegram) {
      await notifyUserViaTelegram(patient.assignedFamilyDoctorId, psychText);
      notified.push("FAMILY_MD");
    }
    const consented = await prisma.psychConsent.findMany({
      where: { patientId: patient.id, status: "ACTIVE" },
      select: { psychologistId: true },
    });
    for (const c of consented) {
      if (notifyUserViaTelegram) {
        await notifyUserViaTelegram(c.psychologistId, psychText);
        notified.push(`PSYCH:${c.psychologistId}`);
      }
    }
  }

  if (evaluation.hasPhysicalRedFlag && patient.assignedFamilyDoctorId && notifyUserViaTelegram) {
    const redText =
      `🩺 <b>Jismoniy qizil bayroq — Kundalik check-in</b>\n` +
      `👩 <b>Bemor:</b> ${patient.fullName} (${patient.district})\n` +
      `📞 <b>Telefon:</b> ${patient.phone}\n` +
      `⚠️ Ona yoki chaqaloq holatida xavf belgisi qayd etildi (${checkin.date}).`;
    await notifyUserViaTelegram(patient.assignedFamilyDoctorId, redText);
    notified.push("PHYSICAL_DOCTOR");
  }

  return notified;
}
