import { prisma } from "@/lib/db";
import { decryptField, encryptField } from "@/lib/crypto";
import { verifyPassword, hashPassword, verifyTelegramLinkToken } from "@/lib/auth";
import { haversineDistanceKm, matchNearestDoctor, resolveCoordinatesForLocation, VISIT_DESTINATION_OPTIONS } from "@/lib/geo";
import { getPlanByCode, formatUzs } from "@/lib/subscriptions";
import { resolvePolyclinicForLocation } from "@/lib/uz-locations";
import { permanentlyDeleteUserAccount } from "@/lib/account-deletion";
import {
  evaluateWellbeingSignals,
  getTashkentDateString,
  getTashkentTimeParts,
  triggerWellbeingRiskAlerts,
} from "@/lib/wellbeing";
import { parseReminderTimesJson } from "@/lib/wellbeing-catalog";
import { isVoiceLabConfigured, synthesizeVoiceSpeech, transcribeVoiceAudio } from "@/lib/voicelab";
import { runVoiceIntentAssistant } from "@/lib/voice-triage";

export function getTelegramMiniAppUrl() {
  const envUrl = (process.env.NEXT_PUBLIC_TG_WEBAPP_URL || "").trim();
  if (envUrl) return envUrl;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/$/, "");
  return appUrl ? `${appUrl}/tg` : "https://edu-coders.vercel.app/tg";
}

function mapTelegramInlineButton(b) {
  if (b?.webAppUrl) {
    return { text: b.text, web_app: { url: b.webAppUrl } };
  }
  if (b?.url) {
    return { text: b.text, url: b.url };
  }
  return {
    text: b?.text || "Tanlash",
    callback_data: b?.callbackData || "MENU:HOME",
  };
}

let menuButtonSynced = false;
async function ensureTelegramMenuButton(token) {
  if (menuButtonSynced || !token) return;
  menuButtonSynced = true;
  try {
    await callTelegramApi(
      "setChatMenuButton",
      {
        menu_button: {
          type: "web_app",
          text: "📱 Kabinet",
          web_app: { url: getTelegramMiniAppUrl() },
        },
      },
      token
    );
  } catch {
    menuButtonSynced = false;
  }
}

export async function getTelegramBotUsername() {
  try {
    const state = await prisma.systemSimState.findUnique({ where: { id: "singleton" } });
    if (state?.telegramBotUsername) {
      return state.telegramBotUsername.replace(/^@/, "");
    }
  } catch {
    // ignore if table not ready yet
  }
  const envUser = (process.env.TELEGRAM_BOT_USERNAME || "").trim().replace(/^@/, "");
  if (envUser) return envUser;

  const token = await getTelegramBotToken();
  if (token) {
    const meRes = await callTelegramApi("getMe", {}, token);
    const liveUsername = meRes?.ok && meRes?.result?.username ? String(meRes.result.username).replace(/^@/, "") : "";
    if (liveUsername) {
      await prisma.systemSimState
        .updateMany({ where: { id: "singleton" }, data: { telegramBotUsername: liveUsername } })
        .catch(() => {});
      return liveUsername;
    }
  }
  return "onacare_bot";
}

export async function linkTelegramChatToUser({ chatId, userId, tgUsername = null }) {
  const strChatId = String(chatId);
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { patientProfile: true },
  });
  if (!existingUser) return null;

  await prisma.$transaction(async (tx) => {
    // Clear chatId from any other user holding it to respect @unique constraint
    await tx.user.updateMany({
      where: { telegramChatId: strChatId, id: { not: userId } },
      data: { telegramChatId: null },
    });
    await tx.patient.updateMany({
      where: { telegramChatId: strChatId, userId: { not: userId } },
      data: { telegramChatId: null },
    });
    await tx.user.update({
      where: { id: userId },
      data: {
        telegramChatId: strChatId,
        ...(tgUsername ? { telegramHandle: `@${String(tgUsername).replace(/^@/, "")}` } : {}),
      },
    });
    if (existingUser.patientProfile) {
      await tx.patient.update({
        where: { id: existingUser.patientProfile.id },
        data: { telegramChatId: strChatId },
      });
    }
    await tx.telegramSession.upsert({
      where: { chatId: strChatId },
      update: { userId, flowState: "IDLE", draftJson: "{}" },
      create: {
        chatId: strChatId,
        userId,
        telegramUsername: tgUsername || null,
        flowState: "IDLE",
        draftJson: "{}",
        historyJson: "[]",
      },
    });
  });

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      patientProfile: {
        include: { assignedFamilyDoctor: true },
      },
    },
  });
}

export async function getTelegramBotToken() {
  const envToken = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  if (envToken) return envToken;
  try {
    const state = await prisma.systemSimState.findUnique({ where: { id: "singleton" } });
    if (state?.telegramBotTokenEnc) {
      return decryptField(state.telegramBotTokenEnc);
    }
  } catch {
    // ignore if table not ready yet
  }
  return "";
}

export async function saveTelegramBotConfig({ token, username }) {
  const cleanToken = (token || "").trim();
  const cleanUsername = (username || "").trim().replace(/^@/, "");
  await prisma.systemSimState.upsert({
    where: { id: "singleton" },
    update: {
      ...(cleanToken ? { telegramBotTokenEnc: encryptField(cleanToken) } : {}),
      ...(cleanUsername ? { telegramBotUsername: cleanUsername } : {}),
    },
    create: {
      id: "singleton",
      timeOffsetHours: 0,
      telegramBotTokenEnc: cleanToken ? encryptField(cleanToken) : null,
      telegramBotUsername: cleanUsername || null,
    },
  });
}

export async function callTelegramApi(method, payload = {}, explicitToken = "") {
  const token = explicitToken || (await getTelegramBotToken());
  if (!token) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured" };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Telegram API error" };
  }
}

async function downloadTelegramFileBuffer(fileId, explicitToken = "") {
  const token = explicitToken || (await getTelegramBotToken());
  if (!token || !fileId) return { ok: false, error: "Missing token or fileId" };
  const fileInfo = await callTelegramApi("getFile", { file_id: fileId }, token);
  const filePath = fileInfo?.result?.file_path;
  if (!fileInfo?.ok || !filePath) {
    return { ok: false, error: fileInfo?.description || "Telegram getFile failed" };
  }
  try {
    const res = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
    if (!res.ok) return { ok: false, error: `File download HTTP ${res.status}` };
    const arr = await res.arrayBuffer();
    const rawName = filePath.split("/").pop() || "voice.ogg";
    const lower = rawName.toLowerCase();
    const inferredMime =
      lower.endsWith(".m4a") || lower.endsWith(".mp4")
        ? "audio/mp4"
        : lower.endsWith(".mp3")
          ? "audio/mpeg"
          : lower.endsWith(".wav")
            ? "audio/wav"
            : "audio/ogg";
    const filename = lower.endsWith(".oga") ? rawName.replace(/\.oga$/i, ".ogg") : rawName;
    return {
      ok: true,
      buffer: Buffer.from(arr),
      filePath,
      filename,
      mimeType: inferredMime,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Telegram file download error" };
  }
}

async function sendTelegramVoiceOrAudio(
  { chatId, audioBuffer, filename = "reply.wav", contentType = "audio/wav", caption = "", replyMarkup = null, language = "uz" },
  explicitToken = ""
) {
  const token = explicitToken || (await getTelegramBotToken());
  if (!token || !audioBuffer) return { ok: false, error: "Missing token or audio" };

  const useVoiceEndpoint = contentType.includes("ogg") || filename.endsWith(".ogg") || filename.endsWith(".oga");
  const method = useVoiceEndpoint ? "sendVoice" : "sendAudio";
  const fieldName = useVoiceEndpoint ? "voice" : "audio";

  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append(fieldName, new Blob([audioBuffer], { type: contentType }), filename);
  if (caption) {
    const rawCaption = String(caption);
    if (rawCaption.length <= 1000) {
      form.append("caption", rawCaption);
      form.append("parse_mode", "HTML");
    } else {
      const plainCaption = rawCaption.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 990);
      form.append("caption", plainCaption);
    }
  }
  if (!useVoiceEndpoint) {
    form.append("title", "OnaCare AI");
    form.append("performer", language === "ru" ? "OnaCare (RU)" : language === "en" ? "OnaCare (EN)" : "OnaCare (UZ)");
  }
  if (replyMarkup) {
    form.append("reply_markup", JSON.stringify(replyMarkup));
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      body: form,
    });
    return await res.json();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Telegram voice send error" };
  }
}

export async function getTelegramBotStatus() {
  const token = await getTelegramBotToken();
  const state = await prisma.systemSimState.findUnique({ where: { id: "singleton" } }).catch(() => null);
  const [linkedPatients, linkedDoctors, sessionCount] = await Promise.all([
    prisma.user.count({ where: { role: "PATIENT", telegramChatId: { not: null } } }),
    prisma.user.count({ where: { role: { in: ["FAMILY_MD", "OVABMU_MD"] }, telegramChatId: { not: null } } }),
    prisma.telegramSession.count(),
  ]);

  if (!token) {
    return {
      configured: false,
      voiceLabConfigured: isVoiceLabConfigured(),
      username: state?.telegramBotUsername || process.env.TELEGRAM_BOT_USERNAME || "OnaCarePatronajBot",
      webhookUrl: null,
      linkedPatients,
      linkedDoctors,
      sessionCount,
    };
  }

  const [meRes, whRes] = await Promise.all([
    callTelegramApi("getMe", {}, token),
    callTelegramApi("getWebhookInfo", {}, token),
  ]);

  return {
    configured: true,
    voiceLabConfigured: isVoiceLabConfigured(),
    botLive: Boolean(meRes?.ok),
    username: meRes?.result?.username || state?.telegramBotUsername || "OnaCarePatronajBot",
    firstName: meRes?.result?.first_name || "OnaCare Bot",
    webhookUrl: whRes?.result?.url || null,
    pendingUpdateCount: whRes?.result?.pending_update_count || 0,
    lastErrorMessage: whRes?.result?.last_error_message || null,
    linkedPatients,
    linkedDoctors,
    sessionCount,
  };
}

async function appendBotHistory(chatId, messageEntry) {
  const session = await prisma.telegramSession.findUnique({ where: { chatId: String(chatId) } });
  if (!session) return;
  let history = [];
  try {
    history = JSON.parse(session.historyJson || "[]");
  } catch {
    history = [];
  }
  const nextHistory = [
    ...history.slice(-39),
    {
      id: `tg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      at: new Date().toISOString(),
      ...messageEntry,
    },
  ];
  await prisma.telegramSession.update({
    where: { chatId: String(chatId) },
    data: { historyJson: JSON.stringify(nextHistory) },
  });
}

export async function notifyUserViaTelegram(userId, text, buttons = []) {
  if (!userId) return { delivered: false, reason: "missing_userId" };
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.telegramChatId) {
    return { delivered: false, reason: "no_telegram_chat_id" };
  }
  const chatId = user.telegramChatId;
  await appendBotHistory(chatId, {
    from: "bot",
    text,
    buttons,
  });

  const replyMarkup =
    buttons.length > 0
      ? {
          inline_keyboard: buttons.map((row) =>
            (Array.isArray(row) ? row : [row]).map(mapTelegramInlineButton)
          ),
        }
      : undefined;

  const token = await getTelegramBotToken();
  if (!token) {
    return { delivered: false, storedInSession: true, reason: "bot_token_not_set" };
  }
  const apiRes = await callTelegramApi(
    "sendMessage",
    {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    },
    token
  );
  return { delivered: Boolean(apiRes?.ok), storedInSession: true, apiRes };
}

export async function notifyAdminsViaTelegram(text) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN_RECEPTION", telegramChatId: { not: null } },
    select: { id: true },
  });
  for (const a of admins) {
    await notifyUserViaTelegram(a.id, text);
  }
}

export async function sendDoctorVisitReminders() {
  const doctors = await prisma.user.findMany({
    where: {
      role: { in: ["FAMILY_MD", "OVABMU_MD"] },
      verificationStatus: "VERIFIED",
    },
  });

  const results = [];
  for (const doc of doctors) {
    const [openComplaints, openCalls] = await Promise.all([
      prisma.complaint.findMany({
        where: {
          assignedDoctorId: doc.id,
          status: { in: ["SUBMITTED", "DOCTOR_RESPONDED", "EN_ROUTE", "ARRIVED"] },
        },
        include: { patient: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.activeCall.findMany({
        where: {
          assignedDoctorId: doc.id,
          status: { in: ["SCHEDULED", "ESCALATED_12H", "CRITICAL_18H"] },
        },
        include: { patient: true },
        orderBy: { slaDeadlineAt: "asc" },
      }),
    ]);

    if (openComplaints.length === 0 && openCalls.length === 0) continue;

    const lines = [`⏰ <b>OnaCare Tashrif Eslatmasi (${doc.fullName})</b>\n`];
    if (openComplaints.length > 0) {
      lines.push(`🚨 <b>Faol bemor shikoyatlari (${openComplaints.length}):</b>`);
      for (const c of openComplaints.slice(0, 5)) {
        const dist =
          typeof c.distanceKm === "number" ? ` • ~${c.distanceKm} km` : "";
        lines.push(
          `• <b>${c.patient.fullName}</b> (${c.severity}${dist})\n  📍 ${c.visitAddress}\n  📝 ${c.title}`
        );
      }
    }
    if (openCalls.length > 0) {
      lines.push(`\n🩺 <b>24 soatlik patronaj tashriflari (${openCalls.length}):</b>`);
      for (const call of openCalls.slice(0, 5)) {
        lines.push(
          `• <b>${call.patient.fullName}</b> (${call.status}) — 📍 ${call.patient.address}`
        );
      }
    }
    lines.push(`\nKo'rikdan o'tkazish va tasdiqlash uchun /reminders yoki Mini App kabinetidan foydalaning.`);

    const delivery = await notifyUserViaTelegram(doc.id, lines.join("\n"), [
      [{ text: "📱 Kabinetni ochish (Mini App)", webAppUrl: getTelegramMiniAppUrl() }],
      [
        { text: "⏰ Eslatmalar (/reminders)", callbackData: "DOCTOR:REMINDERS" },
        { text: "💬 Bemorlar chati", callbackData: "DOCTOR:DM_LIST" },
      ],
    ]);
    results.push({
      doctorId: doc.id,
      doctorName: doc.fullName,
      telegramLinked: Boolean(doc.telegramChatId),
      openComplaints: openComplaints.length,
      openCalls: openCalls.length,
      deliveredLive: Boolean(delivery.delivered),
    });
  }

  return {
    doctorsWithPendingVisits: results.length,
    doctorsNotifiedOnTelegram: results.filter((r) => r.telegramLinked).length,
    details: results,
  };
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatRoleLabel(role) {
  switch (role) {
    case "PATIENT":
      return "Bemor / Ona";
    case "FAMILY_MD":
      return "Oilaviy shifokor / Hamshira";
    case "OVABMU_MD":
      return "Tug'ruqxona shifokori (OvaBMU)";
    case "PSYCHOLOGIST":
      return "Perinatal psixolog";
    case "ADMIN_RECEPTION":
      return "Poliklinika koordinatori (Admin)";
    default:
      return role || "Foydalanuvchi";
  }
}

function formatVerificationLabel(status) {
  if (status === "VERIFIED") return "✅ Tasdiqlangan (Faol)";
  if (status === "REJECTED") return "❌ Rad etilgan";
  return "⏳ Administrator tasdig'ini kutmoqda";
}

async function buildUserProfileMessage(user) {
  if (!user) {
    return buildMainMenuForUser(null);
  }

  const freshUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      patientProfile: {
        include: {
          assignedFamilyDoctor: {
            select: { fullName: true, specialty: true, phone: true },
          },
        },
      },
    },
  });
  const u = freshUser || user;
  const subExpiry = u.subscriptionExpiresAt
    ? new Date(u.subscriptionExpiresAt).toISOString().slice(0, 10)
    : null;
  const gpsText =
    typeof u.latitude === "number" && typeof u.longitude === "number"
      ? `${u.latitude.toFixed(4)}, ${u.longitude.toFixed(4)}`
      : "Ulashilmagan";

  const lines = [
    `👤 <b>Mening Hisobim va Profilim</b>`,
    ``,
    `• <b>F.I.O.:</b> ${escapeHtml(u.fullName)}`,
    `• <b>Rol:</b> ${formatRoleLabel(u.role)}`,
    `• <b>Holat:</b> ${formatVerificationLabel(u.verificationStatus)}`,
    `• <b>Email:</b> <code>${escapeHtml(u.email)}</code>`,
    `• <b>Telefon:</b> ${escapeHtml(u.phone || "Kiritilmagan")}`,
    `• <b>Hudud / Tuman:</b> ${escapeHtml(u.district || "Belgilanmagan")}`,
    `• <b>Muassasa:</b> ${escapeHtml(u.polyclinicName || "Belgilanmagan")}`,
    `• <b>GPS koordinata:</b> <code>${gpsText}</code>`,
  ];

  const miniAppUrl = getTelegramMiniAppUrl();

  if (u.role === "PATIENT") {
    const p = u.patientProfile;
    let allergies = [];
    try {
      allergies = p?.allergiesJson ? JSON.parse(p.allergiesJson) : [];
    } catch {
      allergies = [];
    }
    const [openComplaintsCount, activeCallsCount, rxCount] = p
      ? await Promise.all([
          prisma.complaint.count({
            where: { patientId: p.id, status: { not: "VERIFIED_COMPLETED" } },
          }),
          prisma.activeCall.count({
            where: { patientId: p.id, status: { not: "COMPLETED" } },
          }),
          prisma.prescription.count({ where: { patientId: p.id, active: true } }),
        ])
      : [0, 0, 0];

    lines.push(
      ``,
      `🤰 <b>Tibbiy va Manzil Ma'lumotlari:</b>`,
      `• <b>Tug'ilgan sana:</b> ${escapeHtml(p?.dateOfBirth || "Kiritilmagan")}`,
      `• <b>Qon guruhi:</b> ${escapeHtml(p?.bloodType || "Noma'lum")}`,
      `• <b>JSHSHIR:</b> <code>${escapeHtml(p?.jshshirMasked || "Kiritilmagan")}</code>`,
      `• <b>Mahalla / Manzil:</b> ${escapeHtml(p?.mahalla || "—")} • ${escapeHtml(p?.address || u.district || "—")}`,
      `• <b>Allergiyalar:</b> ${escapeHtml(allergies.length > 0 ? allergies.join(", ") : "Yo'q")}`,
      `• <b>Biriktirilgan shifokor:</b> ${
        p?.assignedFamilyDoctor
          ? `${escapeHtml(p.assignedFamilyDoctor.fullName)}${
              p.assignedFamilyDoctor.phone ? ` (${escapeHtml(p.assignedFamilyDoctor.phone)})` : ""
            }`
          : "Tasdiqlangandan so'ng biriktiriladi"
      }`,
      `• <b>Obuna:</b> <b>${escapeHtml(u.subscriptionTier)}</b> (${escapeHtml(u.subscriptionStatus)})${subExpiry ? ` • ${subExpiry} gacha` : ""}`,
      `• <b>Faol murojaatlar:</b> ${openComplaintsCount} shikoyat • ${activeCallsCount} patronaj tashrif • ${rxCount} retsept`
    );

    const buttons =
      u.verificationStatus === "VERIFIED"
        ? [
            [{ text: "📱 Kabinetni ochish (Mini App)", webAppUrl: miniAppUrl }],
            [
              { text: "🧠 Kundalik holat (/checkin)", callbackData: "PATIENT:CHECKIN" },
              { text: "💊 Dorilarim (/dorilar)", callbackData: "PATIENT:MEDS" },
            ],
            [{ text: "🚨 Shikoyat yuborish (GPS)", callbackData: "PATIENT:NEW_COMPLAINT" }],
            [
              { text: "🩺 Tashrif holati", callbackData: "PATIENT:STATUS" },
              { text: "💬 Shifokorga yozish", callbackData: "PATIENT:DM_START" },
            ],
            [
              { text: "💎 Obunalar", callbackData: "MENU:SUBSCRIPTIONS" },
              { text: "🏠 Bosh menyu", callbackData: "MENU:HOME" },
            ],
            [{ text: "🗑️ Hisobni butunlay o'chirish", callbackData: "ACCOUNT:DELETE_CONFIRM" }],
          ]
        : [
            [
              { text: "🔄 Holatni tekshirish", callbackData: "MENU:REFRESH" },
              { text: "🏠 Bosh menyu", callbackData: "MENU:HOME" },
            ],
            [{ text: "🗑️ Hisobni butunlay o'chirish", callbackData: "ACCOUNT:DELETE_CONFIRM" }],
          ];
    return { text: lines.join("\n"), buttons };
  }

  if (u.role === "FAMILY_MD" || u.role === "OVABMU_MD") {
    const [assignedComplaints, assignedCalls] = await Promise.all([
      prisma.complaint.count({
        where: {
          assignedDoctorId: u.id,
          status: { in: ["SUBMITTED", "DOCTOR_RESPONDED", "EN_ROUTE", "ARRIVED"] },
        },
      }),
      prisma.activeCall.count({
        where: {
          assignedDoctorId: u.id,
          status: { in: ["SCHEDULED", "ESCALATED_12H", "CRITICAL_18H"] },
        },
      }),
    ]);

    lines.push(
      ``,
      `🩺 <b>Shifokor Mutaxassisligi va Faoliyati:</b>`,
      `• <b>Mutaxassislik:</b> ${escapeHtml(u.specialty || "Kiritilmagan")}`,
      `• <b>Ekspertiza:</b> ${escapeHtml(u.expertiseArea || "Kiritilmagan")}`,
      `• <b>Ish tajribasi:</b> ${u.experienceYears != null ? `${u.experienceYears} yil` : "Kiritilmagan"}`,
      `• <b>Biriktirilgan ishlar:</b> ${assignedComplaints} faol shikoyat • ${assignedCalls} 24s tashrif`
    );

    const buttons =
      u.verificationStatus === "VERIFIED"
        ? [
            [{ text: "📱 Shifokor kabineti (Mini App)", webAppUrl: miniAppUrl }],
            [{ text: "📍 Eng yaqin bemorlar", callbackData: "DOCTOR:NEARBY" }],
            [
              { text: "🧭 GPS yangilash", callbackData: "DOCTOR:UPDATE_GPS" },
              { text: "⏰ Eslatmalar", callbackData: "DOCTOR:REMINDERS" },
            ],
            [{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
            [{ text: "🗑️ Hisobni butunlay o'chirish", callbackData: "ACCOUNT:DELETE_CONFIRM" }],
          ]
        : [
            [
              { text: "🔄 Holatni tekshirish", callbackData: "MENU:REFRESH" },
              { text: "🏠 Bosh menyu", callbackData: "MENU:HOME" },
            ],
            [{ text: "🗑️ Hisobni butunlay o'chirish", callbackData: "ACCOUNT:DELETE_CONFIRM" }],
          ];
    return { text: lines.join("\n"), buttons };
  }

  if (u.role === "PSYCHOLOGIST") {
    const [consentsCount, upcomingSessionsCount] = await Promise.all([
      prisma.psychConsent.count({ where: { psychologistId: u.id, status: "ACTIVE" } }),
      prisma.psychSession.count({ where: { psychologistId: u.id, status: "SCHEDULED" } }),
    ]);

    lines.push(
      ``,
      `💜 <b>Psixolog Mutaxassisligi va Faoliyati:</b>`,
      `• <b>Mutaxassislik:</b> ${escapeHtml(u.specialty || "Perinatal psixolog")}`,
      `• <b>Tajriba:</b> ${u.experienceYears != null ? `${u.experienceYears} yil` : "Kiritilmagan"}`,
      `• <b>Rozilik bergan onalar:</b> ${consentsCount}`,
      `• <b>Rejalashtirilgan seanslar:</b> ${upcomingSessionsCount}`
    );

    const buttons =
      u.verificationStatus === "VERIFIED"
        ? [
            [{ text: "📱 Psixolog kabineti (Mini App)", webAppUrl: miniAppUrl }],
            [{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
            [{ text: "🗑️ Hisobni butunlay o'chirish", callbackData: "ACCOUNT:DELETE_CONFIRM" }],
          ]
        : [
            [
              { text: "🔄 Holatni tekshirish", callbackData: "MENU:REFRESH" },
              { text: "🏠 Bosh menyu", callbackData: "MENU:HOME" },
            ],
            [{ text: "🗑️ Hisobni butunlay o'chirish", callbackData: "ACCOUNT:DELETE_CONFIRM" }],
          ];
    return { text: lines.join("\n"), buttons };
  }

  const [pendingAccs, openComplaints, activeSubs] = await Promise.all([
    prisma.user.count({ where: { verificationStatus: "PENDING" } }),
    prisma.complaint.count({ where: { status: { not: "VERIFIED_COMPLETED" } } }),
    prisma.user.count({ where: { role: "PATIENT", subscriptionStatus: "ACTIVE" } }),
  ]);

  lines.push(
    ``,
    `🛡️ <b>Koordinator Qabulxonasi Holati:</b>`,
    `• <b>Tasdiqlash kutilayotganlar:</b> ${pendingAccs}`,
    `• <b>Ochiq shikoyatlar:</b> ${openComplaints}`,
    `• <b>Faol obunalar:</b> ${activeSubs}`
  );

  return {
    text: lines.join("\n"),
    buttons: [
      [{ text: "📱 Admin kabineti (Mini App)", webAppUrl: miniAppUrl }],
      [
        { text: "📊 Jonli statistika", callbackData: "ADMIN:STATS" },
        { text: "🏠 Bosh menyu", callbackData: "MENU:HOME" },
      ],
      [{ text: "🗑️ Hisobni butunlay o'chirish", callbackData: "ACCOUNT:DELETE_CONFIRM" }],
    ],
  };
}

function buildMainMenuForUser(user) {
  const miniAppUrl = getTelegramMiniAppUrl();

  if (!user) {
    return {
      text:
        "👋 <b>OnaCare Patronaj & Shoshilinch Yordam Botiga xush kelibsiz!</b>\n\n" +
        "Bu bot orqali:\n" +
        "• 📱 <b>Mini App</b> orqali tizimga kirib to'g'ridan-to'g'ri kabinetingizga o'tishingiz\n" +
        "• 🤰 Bemor yoki 🩺 Shifokor / Hamshira sifatida ro'yxatdan o'tishingiz\n" +
        "• 🧠 Kundalik holat check-in (/checkin) va 💊 dori eslatmalarini (/dorilar) olishingiz\n" +
        "• 💬 Biriktirilgan shifokor / hamshira bilan bevosita suhbatlashishingiz mumkin.\n\n" +
        "Quyidagi amallardan birini tanlang:",
      buttons: [
        [{ text: "📱 Kabinetga kirish (Mini App)", webAppUrl: miniAppUrl }],
        [
          { text: "🤰 Bemor bo'lib ro'yxatdan o'tish", callbackData: "SIGNUP_ROLE:PATIENT" },
          { text: "🩺 Shifokor / Hamshira ro'yxatdan o'tishi", callbackData: "SIGNUP_ROLE:DOCTOR" },
        ],
        [
          { text: "🔗 Saytdagi hisobni bog'lash (/link)", callbackData: "MENU:LINK_HELP" },
        ],
      ],
    };
  }

  if (user.verificationStatus === "PENDING") {
    return {
      text:
        `⏳ <b>Salom, ${escapeHtml(user.fullName)}!</b>\n\n` +
        `Sizning <b>${formatRoleLabel(user.role)}</b> hisobingiz ro'yxatga olingan va hozirda Administrator tasdig'ini kutmoqda.\n` +
        `Tasdiqlangandan so'ng darhol barcha imkoniyatlar (kabinet, eslatmalar, shifokor/hamshira bilan chat) faollashadi.`,
      buttons: [
        [{ text: "📱 Kabinet holati (Mini App)", webAppUrl: miniAppUrl }],
        [{ text: "👤 Mening hisobim / Profilim (/profile)", callbackData: "MENU:PROFILE" }],
        [{ text: "🔄 Holatni tekshirish", callbackData: "MENU:REFRESH" }],
      ],
    };
  }

  if (user.verificationStatus === "REJECTED") {
    return {
      text:
        `❌ <b>Hisob rad etilgan</b>\nSabab: ${escapeHtml(user.verificationNote || "Admin bilan bog'laning.")}`,
      buttons: [
        [{ text: "👤 Mening hisobim / Profilim", callbackData: "MENU:PROFILE" }],
        [{ text: "🔄 Qayta ro'yxatdan o'tish", callbackData: "SIGNUP_ROLE:PATIENT" }],
      ],
    };
  }

  if (user.role === "PATIENT") {
    return {
      text:
        `🤰 <b>OnaCare Bemor Kabineti — ${escapeHtml(user.fullName)}</b>\n` +
        `📍 Hudud: ${escapeHtml(user.district || "Belgilanmagan")}${user.latitude ? ` (${user.latitude.toFixed(4)}, ${user.longitude.toFixed(4)})` : ""}\n` +
        `💎 Obuna: <b>${escapeHtml(user.subscriptionTier)}</b>\n\n` +
        `Nima qilishni xohlaysiz?`,
      buttons: [
        [{ text: "📱 Kabinetni ochish (Mini App)", webAppUrl: miniAppUrl }],
        [
          { text: "🧠 Kundalik holat (/checkin)", callbackData: "PATIENT:CHECKIN" },
          { text: "💊 Dorilarim (/dorilar)", callbackData: "PATIENT:MEDS" },
        ],
        [{ text: "🚨 Shikoyat yuborish (GPS & Manzil)", callbackData: "PATIENT:NEW_COMPLAINT" }],
        [
          { text: "🩺 Shifokorim & Tashrif holati", callbackData: "PATIENT:STATUS" },
          { text: "💬 Shifokordan maslahat olish", callbackData: "PATIENT:DM_START" },
        ],
        [
          { text: "👤 Mening hisobim", callbackData: "MENU:PROFILE" },
          { text: "💎 Obuna sotib olish", callbackData: "MENU:SUBSCRIPTIONS" },
        ],
      ],
    };
  }

  if (user.role === "FAMILY_MD" || user.role === "OVABMU_MD") {
    return {
      text:
        `🩺 <b>OnaCare Shifokor Kabineti — ${escapeHtml(user.fullName)}</b>\n` +
        `🏥 Soha: ${escapeHtml(user.expertiseArea || user.specialty || "Belgilanmagan")}\n` +
        `⏳ Tajriba: ${user.experienceYears != null ? `${user.experienceYears} yil` : "Kiritilmagan"}\n` +
        `📍 GPS: ${user.latitude ? `${user.latitude.toFixed(4)}, ${user.longitude.toFixed(4)}` : "Ulashilmagan"}\n\n` +
        `Quyidagi bo'limlardan birini tanlang:`,
      buttons: [
        [{ text: "📱 Kabinetni ochish (Mini App)", webAppUrl: miniAppUrl }],
        [{ text: "📍 Eng yaqin bemorlar & Shikoyatlar", callbackData: "DOCTOR:NEARBY" }],
        [
          { text: "⏰ Tashrif eslatmalari", callbackData: "DOCTOR:REMINDERS" },
          { text: "🧭 GPS Lokatsiyani yangilash", callbackData: "DOCTOR:UPDATE_GPS" },
        ],
        [
          { text: "💬 Bemorlarga maslahat yozish", callbackData: "DOCTOR:DM_LIST" },
          { text: "👤 Mening hisobim", callbackData: "MENU:PROFILE" },
        ],
      ],
    };
  }

  if (user.role === "PSYCHOLOGIST") {
    return {
      text:
        `💜 <b>OnaCare Psixolog Kabineti — ${escapeHtml(user.fullName)}</b>\n` +
        `🎓 Soha: ${escapeHtml(user.specialty || "Perinatal psixolog")}\n` +
        `📍 Hudud: ${escapeHtml(user.district || "Belgilanmagan")}\n\n` +
        `Onalar ruhiy holati, EPDS skriningi va seanslarni boshqarish uchun Mini App kabinetini oching:`,
      buttons: [
        [{ text: "📱 Psixolog kabineti (Mini App)", webAppUrl: miniAppUrl }],
        [{ text: "👤 Mening hisobim", callbackData: "MENU:PROFILE" }],
      ],
    };
  }

  return {
    text:
      `🛡️ <b>OnaCare Admin — ${escapeHtml(user.fullName)}</b>\n` +
      `Tizimdagi barcha bemor, shifokor va shikoyatlarni nazorat qilishingiz mumkin.`,
    buttons: [
      [{ text: "📱 Admin kabineti (Mini App)", webAppUrl: miniAppUrl }],
      [{ text: "👤 Mening hisobim", callbackData: "MENU:PROFILE" }],
      [{ text: "⏰ Barcha shifokorlarga eslatma yuborish", callbackData: "ADMIN:REMIND_ALL" }],
      [{ text: "📊 Jonli statistika", callbackData: "ADMIN:STATS" }],
    ],
  };
}

function makeBotReply(text, buttons = [], requestLocation = false, requestContact = false) {
  return { text, buttons, requestLocation, requestContact };
}

export async function processTelegramUpdate(update, options = {}) {
  const dryRun = Boolean(options.dryRun);
  const message = update?.message;
  const callbackQuery = update?.callback_query;

  const chatId = String(
    callbackQuery?.message?.chat?.id ||
      message?.chat?.id ||
      update?.chatId ||
      ""
  );
  if (!chatId) {
    return { ok: false, error: "No chatId in Telegram update" };
  }

  const tgUsername =
    callbackQuery?.from?.username ||
    message?.from?.username ||
    update?.username ||
    null;
  const tgFirstName =
    callbackQuery?.from?.first_name ||
    message?.from?.first_name ||
    update?.firstName ||
    null;

  let session = await prisma.telegramSession.findUnique({ where: { chatId } });
  if (!session) {
    session = await prisma.telegramSession.create({
      data: {
        chatId,
        telegramUsername: tgUsername,
        telegramFirstName: tgFirstName,
        flowState: "IDLE",
        draftJson: "{}",
        historyJson: "[]",
      },
    });
  }

  let draft = {};
  try {
    draft = JSON.parse(session.draftJson || "{}");
  } catch {
    draft = {};
  }

  let history = [];
  try {
    history = JSON.parse(session.historyJson || "[]");
  } catch {
    history = [];
  }

  const userInclude = {
    patientProfile: {
      include: {
        assignedFamilyDoctor: true,
        prescriptions: { where: { active: true }, take: 6 },
        activeCalls: { orderBy: { createdAt: "desc" }, take: 1, include: { assignedDoctor: true } },
      },
    },
  };

  let linkedUser = session.userId
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        include: userInclude,
      })
    : await prisma.user.findFirst({
        where: { telegramChatId: chatId },
        include: userInclude,
      });

  if (linkedUser && session.userId !== linkedUser.id) {
    await prisma.telegramSession.update({
      where: { chatId },
      data: { userId: linkedUser.id },
    });
  }

  const rawText = (message?.text || "").trim();
  const callbackData = (callbackQuery?.data || "").trim();
  const incomingLocation = message?.location || null;
  const incomingContact = message?.contact || null;
  const incomingVoice = message?.voice || message?.audio || null;
  const simVoiceBase64 = typeof update?.voiceAudioBase64 === "string" ? update.voiceAudioBase64.trim() : "";
  const simVoiceMime = typeof update?.voiceMimeType === "string" ? update.voiceMimeType : "audio/webm";
  const hasIncomingVoice = Boolean(incomingVoice || simVoiceBase64);

  let voiceTranscript = "";
  let voiceLanguage = update?.lang || "uz";
  let voiceSttError = "";
  let voiceSttProvider = "";

  if (hasIncomingVoice) {
    const durationSec = Number(incomingVoice?.duration || 0);
    const fileSize = Number(incomingVoice?.file_size || 0);
    if (durationSec > 95 || fileSize > 5_000_000) {
      voiceSttError = "VOICE_TOO_LONG";
    } else {
      let audioBuffer = null;
      let audioMime = simVoiceMime;
      let audioFilename = "voice.ogg";

      if (simVoiceBase64) {
        const cleanB64 = simVoiceBase64.includes(",") ? simVoiceBase64.split(",").pop() : simVoiceBase64;
        audioBuffer = Buffer.from(cleanB64, "base64");
        audioFilename = simVoiceMime.includes("mp4") || simVoiceMime.includes("m4a")
          ? "voice.m4a"
          : simVoiceMime.includes("ogg")
            ? "voice.ogg"
            : "voice.webm";
      } else if (incomingVoice?.file_id) {
        const token = await getTelegramBotToken();
        if (!dryRun && token) {
          callTelegramApi("sendChatAction", { chat_id: chatId, action: "typing" }, token).catch(() => {});
        }
        const dl = await downloadTelegramFileBuffer(incomingVoice.file_id, token);
        if (dl.ok) {
          audioBuffer = dl.buffer;
          audioMime = incomingVoice.mime_type || dl.mimeType;
          audioFilename = incomingVoice.file_name || dl.filename;
        } else {
          voiceSttError = dl.error || "DOWNLOAD_FAILED";
        }
      }

      if (!voiceSttError && (!audioBuffer || audioBuffer.length === 0)) {
        voiceSttError = "EMPTY_AUDIO";
      }

      if (audioBuffer && audioBuffer.length > 0 && !voiceSttError) {
        const stt = await transcribeVoiceAudio({
          audioBuffer,
          mimeType: audioMime,
          filename: audioFilename,
          preferredLang: update?.lang || "",
        });
        if (stt.ok && stt.transcript) {
          voiceTranscript = stt.transcript;
          voiceLanguage = stt.language || "uz";
          voiceSttProvider = stt.provider || "voicelab";
        } else {
          voiceSttError = stt.error || "STT_FAILED";
        }
      }
    }
    if (!voiceTranscript && voiceSttError) {
      console.warn(`[telegram-voice] STT failed (${voiceSttError}) for chat=${chatId}`);
    }
  }

  // Mask passwords before writing user messages into persistent transcript history
  let sanitizedTextForHistory = rawText;
  if (rawText.startsWith("/link ") && !rawText.replace(/^\/link\s+/i, "").trim().startsWith("link_")) {
    const parts = rawText.replace(/^\/link\s+/i, "").trim().split(/\s+/);
    if (parts.length >= 2) {
      sanitizedTextForHistory = `/link ${parts[0]} ••••••`;
    }
  } else if (session.flowState === "LINK_CREDENTIALS" && rawText && !rawText.startsWith("link_") && !rawText.startsWith("/")) {
    const parts = rawText.trim().split(/\s+/);
    if (parts.length >= 2) {
      sanitizedTextForHistory = `${parts[0]} ••••••`;
    }
  } else if (session.flowState === "SIGNUP_PASSWORD" && rawText && !rawText.startsWith("/")) {
    sanitizedTextForHistory = "••••••";
  }

  // Record user action in transcript history
  const incomingLabel = callbackData
    ? `[Tugma] ${callbackData}`
    : hasIncomingVoice
      ? voiceTranscript
        ? `🎙️ "${voiceTranscript}"`
        : "🎙️ [Ovozli xabar]"
      : incomingLocation
        ? `📍 GPS: ${incomingLocation.latitude.toFixed(5)}, ${incomingLocation.longitude.toFixed(5)}`
        : incomingContact
          ? `📱 Kontakt: ${incomingContact.phone_number}`
          : sanitizedTextForHistory || "/start";

  history.push({
    id: `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    from: "user",
    text: incomingLabel,
    at: new Date().toISOString(),
  });

  let nextFlowState = session.flowState || "IDLE";
  let reply = null;
  let voiceReplyPayload = null;

  const setIdleWithMenu = () => {
    nextFlowState = "IDLE";
    draft = {};
    const m = buildMainMenuForUser(linkedUser);
    reply = makeBotReply(m.text, m.buttons);
  };

  // Handle /start <linkToken> deep link from website signup / portal
  if (rawText.startsWith("/start ")) {
    const startArg = rawText.slice(7).trim();
    if (!startArg || startArg === "webapp") {
      setIdleWithMenu();
    } else {
      const tokenPayload = verifyTelegramLinkToken(startArg);
      if (tokenPayload) {
        const boundUser = await linkTelegramChatToUser({
          chatId,
          userId: tokenPayload.userId,
          tgUsername,
        });
        if (boundUser) {
          linkedUser = boundUser;
          nextFlowState = "IDLE";
          draft = {};
          const profileMsg = await buildUserProfileMessage(linkedUser);
          reply = makeBotReply(
            `✅ <b>Saytdagi hisobingiz Telegram botga muvaffaqiyatli bog'landi!</b>\n\n${profileMsg.text}`,
            profileMsg.buttons
          );
        } else {
          setIdleWithMenu();
        }
      } else {
        const m = buildMainMenuForUser(linkedUser);
        nextFlowState = "IDLE";
        draft = {};
        reply = makeBotReply(
          `⚠️ Bog'lash havolasi muddati tugagan yoki noto'g'ri. Hisobingizni <code>/link</code> buyrug'i orqali bog'lashingiz mumkin.\n\n${m.text}`,
          m.buttons
        );
      }
    }
  }
  // Global reset commands
  else if (
    rawText === "/start" ||
    rawText === "/menu" ||
    rawText === "/cancel" ||
    rawText.toLowerCase() === "bekor qilish" ||
    callbackData === "MENU:HOME" ||
    callbackData === "MENU:REFRESH"
  ) {
    setIdleWithMenu();
  }
  // ==================== VOICE MESSAGES (VOICELAB STT -> GEMINI -> VOICELAB TTS) ====================
  else if (hasIncomingVoice) {
    if (voiceSttError === "VOICE_TOO_LONG") {
      reply = makeBotReply(
        "⚠️ Ovozli xabar juda uzun (maksimal 90 soniya). Iltimos, qisqaroq ovozli xabar yuboring yoki matn yozing.",
        [[{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }]]
      );
    } else if (!voiceTranscript) {
      const errNote = voiceSttError ? `\n<code>(${escapeHtml(voiceSttError.slice(0, 64))})</code>` : "";
      reply = makeBotReply(
        `⚠️ Ovozli xabarni matnga aylantirib bo'lmadi. Iltimos, mikrofon yaqinida aniqroq qayta gapiring yoki matn yozing.${errNote}`,
        [[{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }]]
      );
      reply.voiceMeta = { sttError: voiceSttError || "STT_FAILED" };
    } else {
      const aiVoice = await runVoiceIntentAssistant({
        transcript: voiceTranscript,
        flowState: nextFlowState,
        linkedUser,
        draft,
        preferredLang: voiceLanguage,
      });
      const vLang = aiVoice.detectedLanguage || voiceLanguage || "uz";
      const safeTranscriptHtml = escapeHtml(voiceTranscript);

      if (aiVoice.intent === "SIGNUP") {
        const sf = aiVoice.signupFields || {};
        if (!draft.targetRole) {
          draft.targetRole = ["PATIENT", "FAMILY_MD", "OVABMU_MD"].includes(sf.role) ? sf.role : "PATIENT";
        }
        if (sf.fullName) draft.fullName = sf.fullName;
        if (sf.dateOfBirth) draft.dateOfBirth = sf.dateOfBirth;
        if (sf.phone) draft.phone = sf.phone;
        if (sf.email) draft.email = sf.email.toLowerCase();
        if (sf.district || sf.region) {
          draft.district = sf.district || sf.region;
          const coords = resolveCoordinatesForLocation(draft.district, sf.region || "");
          draft.latitude = coords.latitude;
          draft.longitude = coords.longitude;
        }

        const isDoctor = draft.targetRole !== "PATIENT";
        const filledLines = [
          draft.fullName ? `👤 F.I.O.: <b>${escapeHtml(draft.fullName)}</b>` : null,
          draft.dateOfBirth && !isDoctor ? `🎂 Tug'ilgan sana: <code>${escapeHtml(draft.dateOfBirth)}</code>` : null,
          draft.phone ? `📱 Telefon: <code>${escapeHtml(draft.phone)}</code>` : null,
          draft.district ? `📍 Hudud: <b>${escapeHtml(draft.district)}</b>` : null,
          draft.email ? `✉️ Email: <code>${escapeHtml(draft.email)}</code>` : null,
        ].filter(Boolean);

        let nextPrompt = "";
        let askLocation = false;
        let askContact = false;
        if (!draft.fullName) {
          nextFlowState = "SIGNUP_NAME";
          nextPrompt = vLang === "ru" ? "Напишите или продиктуйте ваше ФИО:" : vLang === "en" ? "Please share your full name:" : "To'liq ism-familiyangizni ayting yoki yozing:";
        } else if (!isDoctor && !draft.dateOfBirth) {
          nextFlowState = "SIGNUP_DOB";
          nextPrompt = vLang === "ru" ? "Укажите дату рождения (например, 1995-05-14):" : vLang === "en" ? "Please share your date of birth (e.g. 1995-05-14):" : "Tug'ilgan sanangizni yozing (masalan: <code>1995-05-14</code>):";
        } else if (isDoctor && !draft.expertiseArea) {
          nextFlowState = "SIGNUP_EXPERTISE";
          nextPrompt = vLang === "ru" ? "Укажите вашу медицинскую специальность:" : vLang === "en" ? "Please share your medical specialty:" : "Tibbiy mutaxassisligingizni yozing:";
        } else if (!draft.phone) {
          nextFlowState = "SIGNUP_PHONE";
          askContact = true;
          nextPrompt = vLang === "ru" ? "Поделитесь номером телефона:" : vLang === "en" ? "Please share your phone number:" : "Telefon raqamingizni yuboring:";
        } else if (!draft.district) {
          nextFlowState = "SIGNUP_LOCATION";
          askLocation = true;
          nextPrompt = vLang === "ru" ? "Отправьте GPS или назовите район:" : vLang === "en" ? "Share GPS location or district:" : "GPS lokatsiya ulashing yoki tuman nomini yozing:";
        } else if (!draft.email) {
          nextFlowState = "SIGNUP_EMAIL";
          nextPrompt = vLang === "ru" ? "Укажите ваш Email для входа:" : vLang === "en" ? "Please type your login email:" : "Kirish uchun Email manzilingizni yozing:";
        } else {
          nextFlowState = "SIGNUP_PASSWORD";
          nextPrompt =
            vLang === "ru"
              ? "🔒 Введите пароль текстом (минимум 6 символов; не диктуйте пароль вслух):"
              : vLang === "en"
                ? "🔒 Please type a password (at least 6 characters; never speak passwords aloud):"
                : "🔒 Endi kamida 6 ta belgidan iborat parolni <b>matn</b> shaklida yozing (parolni ovozda aytmang):";
        }

        const headerTxt =
          vLang === "ru"
            ? `🎙️ <i>"${safeTranscriptHtml}"</i>\n\n✅ <b>Данные регистрации заполнены из голосового сообщения:</b>`
            : vLang === "en"
              ? `🎙️ <i>"${safeTranscriptHtml}"</i>\n\n✅ <b>Sign-up details filled from your voice message:</b>`
              : `🎙️ <i>"${safeTranscriptHtml}"</i>\n\n✅ <b>Ovozli xabardan ro'yxatdan o'tish ma'lumotlari to'ldirildi:</b>`;

        reply = makeBotReply(
          `${headerTxt}\n${filledLines.join("\n") || "—"}\n\n${nextPrompt}`,
          askLocation || askContact ? [] : [[{ text: "❌ Bekor qilish", callbackData: "MENU:HOME" }]],
          askLocation,
          askContact
        );
      } else if (aiVoice.intent === "ILLNESS_REPORT") {
        if (!linkedUser || linkedUser.role !== "PATIENT" || linkedUser.verificationStatus !== "VERIFIED") {
          reply = makeBotReply(
            `🎙️ <i>"${safeTranscriptHtml}"</i>\n\n` +
              (vLang === "ru"
                ? "Чтобы отправить отчёт врачу, сначала привяжите или зарегистрируйте аккаунт пациента."
                : vLang === "en"
                  ? "To send a medical report to a doctor, please link or register your patient account first."
                  : "Shifokorga shikoyat yuborish uchun avval bemor hisobingizni bog'lang yoki ro'yxatdan o'ting."),
            [
              [{ text: "🤰 Ro'yxatdan o'tish", callbackData: "SIGNUP_ROLE:PATIENT" }],
              [{ text: "🔗 Hisobni bog'lash (/link)", callbackData: "MENU:LINK_HELP" }],
            ]
          );
        } else {
          const inf = aiVoice.illnessFields || {};
          draft = {
            category: ["POSTPARTUM", "CARDIO", "PEDIATRIC", "EMERGENCY", "GENERAL"].includes(inf.category)
              ? inf.category
              : "POSTPARTUM",
            severity: ["MILD", "MODERATE", "SEVERE", "CRITICAL"].includes(inf.severity)
              ? inf.severity
              : aiVoice.urgentEmergency103
                ? "CRITICAL"
                : "MODERATE",
            visitDestination: ["HOME", "CURRENT_GPS", "RELATIVE_HOME", "CLINIC", "CUSTOM"].includes(inf.visitDestination)
              ? inf.visitDestination
              : "HOME",
            visitAddress: inf.visitAddress || linkedUser.patientProfile?.address || linkedUser.district || "",
            description: inf.description || voiceTranscript,
            title: (inf.description || voiceTranscript).slice(0, 72),
          };
          nextFlowState = "VOICE_COMPLAINT_CONFIRM";

          const emergencyPrefix = aiVoice.urgentEmergency103
            ? vLang === "ru"
              ? "🚨 <b>ВНИМАНИЕ! Названы тревожные симптомы — при экстренном состоянии немедленно звоните 103!</b>\n\n"
              : vLang === "en"
                ? "🚨 <b>URGENT! Warning signs detected — call 103 immediately for any emergency!</b>\n\n"
                : "🚨 <b>DIQQAT! Xavfli belgilar aniqlandi — shoshilinch holatda darhol 103 ga qo'ng'iroq qiling!</b>\n\n"
            : "";

          const cardText =
            `${emergencyPrefix}🎙️ <i>"${safeTranscriptHtml}"</i>\n\n` +
            `🩺 <b>${vLang === "ru" ? "Отчёт о состоянии подготовлен:" : vLang === "en" ? "Health report prepared:" : "Shikoyat va holat hisoboti tayyorlandi:"}</b>\n` +
            `• ${vLang === "ru" ? "Направление" : vLang === "en" ? "Category" : "Yo'nalish"}: <b>${escapeHtml(draft.category)}</b>\n` +
            `• ${vLang === "ru" ? "Степень" : vLang === "en" ? "Severity" : "Jiddiylik"}: <b>${escapeHtml(draft.severity)}</b>\n` +
            `• ${vLang === "ru" ? "Адрес" : vLang === "en" ? "Address" : "Manzil"}: ${escapeHtml(draft.visitAddress || "Uy manzili")}\n` +
            `• 📝 ${escapeHtml(draft.description)}\n\n` +
            (vLang === "ru"
              ? "Подтвердите отправку ближайшему врачу:"
              : vLang === "en"
                ? "Confirm dispatching this report to the nearest doctor:"
                : "Eng yaqin shifokorga yuborishni tasdiqlang:");

          reply = makeBotReply(cardText, [
            [{ text: vLang === "ru" ? "✅ Отправить врачу" : vLang === "en" ? "✅ Send to doctor" : "✅ Ha, shifokorga yuborish", callbackData: "VOICE_COMPLAINT:CONFIRM" }],
            [{ text: vLang === "ru" ? "📍 Уточнить GPS" : vLang === "en" ? "📍 Share exact GPS" : "📍 Aniq GPS qo'shish", callbackData: "VOICE_COMPLAINT:NEED_GPS" }],
            [{ text: "❌ Bekor qilish", callbackData: "MENU:HOME" }],
          ]);
        }
      } else if (aiVoice.intent === "WELLBEING_CHECKIN" && linkedUser?.role === "PATIENT" && linkedUser.verificationStatus === "VERIFIED") {
        const wb = aiVoice.wellbeingFields || {};
        draft = {
          wellbeing: {
            mood: Math.max(1, Math.min(5, Number(wb.mood) || 3)),
            motherPain: ["none", "mild", "severe"].includes(wb.motherPain) ? wb.motherPain : "none",
            motherBleeding: wb.motherBleeding === "heavy" ? "heavy" : "normal",
            motherFever: Boolean(wb.motherFever),
            newbornFeeding: ["good", "less", "refusing"].includes(wb.newbornFeeding) ? wb.newbornFeeding : "good",
            newbornJaundice: Boolean(wb.newbornJaundice),
            newbornTempHigh: Boolean(wb.newbornTempHigh),
          },
        };
        nextFlowState = "VOICE_WELLBEING_CONFIRM";
        reply = makeBotReply(
          `🎙️ <i>"${safeTranscriptHtml}"</i>\n\n` +
            `🧠 <b>Kundalik check-in tayyorlandi:</b>\n` +
            `• Kayfiyat: <b>${draft.wellbeing.mood}/5</b>\n` +
            `• Ona og'rig'i / isitmasi: ${draft.wellbeing.motherPain}${draft.wellbeing.motherFever ? " • Isitma bor" : ""}\n` +
            `• Chaqaloq emishi: ${draft.wellbeing.newbornFeeding}${draft.wellbeing.newbornJaundice ? " • Sariqlik" : ""}\n\n` +
            `Saqlashni tasdiqlaysizmi?`,
          [
            [{ text: "✅ Ha, check-inni saqlash", callbackData: "VOICE_WB:CONFIRM" }],
            [{ text: "❌ Bekor qilish", callbackData: "MENU:HOME" }],
          ]
        );
      } else {
        // GENERAL_QUESTION -> synthesize VoiceLab TTS reply customized to uz / ru / en!
        const emergencyPrefix = aiVoice.urgentEmergency103
          ? vLang === "ru"
            ? "🚨 <b>Срочно:</b> При опасных симптомах звоните <b>103</b>!\n\n"
            : vLang === "en"
              ? "🚨 <b>Urgent:</b> For warning signs, call <b>103</b> immediately!\n\n"
              : "🚨 <b>Shoshilinch:</b> Xavfli belgilar bo'lsa darhol <b>103</b> ga qo'ng'iroq qiling!\n\n"
          : "";

        const textBody = `${emergencyPrefix}🎙️ <i>"${safeTranscriptHtml}"</i>\n\n🤖 <b>OnaCare AI (${vLang.toUpperCase()}):</b>\n${escapeHtml(aiVoice.replyText)}`;
        const miniAppUrl = getTelegramMiniAppUrl();
        const menuButtons = linkedUser
          ? [
              [{ text: "📱 Kabinetni ochish (Mini App)", webAppUrl: miniAppUrl }],
              [{ text: "🚨 Shikoyat yuborish", callbackData: "PATIENT:NEW_COMPLAINT" }, { text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
            ]
          : [
              [{ text: "🤰 Ro'yxatdan o'tish", callbackData: "SIGNUP_ROLE:PATIENT" }, { text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
            ];

        if (!dryRun) {
          const tok = await getTelegramBotToken();
          if (tok) {
            callTelegramApi("sendChatAction", { chat_id: chatId, action: "record_voice" }, tok).catch(() => {});
          }
        }

        const tts = await synthesizeVoiceSpeech({
          text: aiVoice.replyText,
          language: vLang,
          mood: "Neutral",
          speed: "1.0",
        });

        if (tts.ok && tts.audioBuffer) {
          voiceReplyPayload = {
            audioBuffer: tts.audioBuffer,
            contentType: tts.contentType,
            filename: tts.filename,
            language: vLang,
            provider: "voicelab",
          };
        }

        reply = makeBotReply(textBody, menuButtons);
        reply.voiceMeta = {
          sttProvider: voiceSttProvider || "voicelab",
          ttsDelivered: Boolean(tts.ok),
          language: vLang,
          transcript: voiceTranscript,
        };
      }
    }
  }
  // ==================== VOICE CONFIRMATION CALLBACKS ====================
  else if (callbackData === "VOICE_COMPLAINT:NEED_GPS" && linkedUser?.role === "PATIENT") {
    nextFlowState = "COMPLAINT_GPS";
    reply = makeBotReply(
      `📍 Iltimos, hozirgi GPS lokatsiyangizni ulashing (<b>📍 Lokatsiya yuborish</b> tugmasi) yoki aniq manzilni yozing:`,
      [],
      true,
      false
    );
  } else if (callbackData === "VOICE_COMPLAINT:CONFIRM" && linkedUser?.role === "PATIENT" && linkedUser.patientProfile) {
    const patient = linkedUser.patientProfile;
    const coords =
      typeof patient.latitude === "number" && typeof patient.longitude === "number"
        ? { latitude: patient.latitude, longitude: patient.longitude }
        : resolveCoordinatesForLocation(patient.district, "");
    const doctors = await prisma.user.findMany({
      where: { role: { in: ["FAMILY_MD", "OVABMU_MD"] }, verificationStatus: "VERIFIED" },
    });
    const matched = matchNearestDoctor(doctors, {
      latitude: coords.latitude,
      longitude: coords.longitude,
      district: patient.district,
      category: draft.category || "POSTPARTUM",
    });
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const complaint = await prisma.complaint.create({
      data: {
        patientId: patient.id,
        assignedDoctorId: matched.doctor?.id ?? null,
        title: draft.title || "Ovozli shikoyat",
        description: draft.description || "Telegram ovozli xabar orqali yuborilgan shikoyat",
        category: draft.category || "POSTPARTUM",
        severity: draft.severity || "MODERATE",
        status: "SUBMITTED",
        visitDestination: draft.visitDestination || "HOME",
        visitAddress: draft.visitAddress || patient.address || patient.district,
        latitude: coords.latitude,
        longitude: coords.longitude,
        distanceKm: matched.distanceKm,
        preferredTimeWindow: "Eng qisqa vaqtda",
        sourceChannel: "TELEGRAM_VOICE",
        visitOtpCode: otp,
      },
    });
    if (matched.doctor) {
      await notifyUserViaTelegram(
        matched.doctor.id,
        `🚨 <b>Yangi bemor shikoyati (Telegram Ovozli xabar)!</b>\n\n` +
          `👩 Bemor: <b>${escapeHtml(patient.fullName)}</b> (${escapeHtml(patient.phone)})\n` +
          `📌 Yo'nalish: ${complaint.category} • Daraja: <b>${complaint.severity}</b>\n` +
          `📍 Manzil: ${escapeHtml(complaint.visitAddress)}\n` +
          `📝 Shikoyat: ${escapeHtml(complaint.description)}`,
        [
          [
            { text: "💬 Javob berish", callbackData: `DOC_RESPOND:${complaint.id}` },
            { text: "🚗 Yo'lga chiqdim", callbackData: `DOC_ENROUTE:${complaint.id}` },
          ],
          [{ text: "✅ Borib ko'rdim & Verifikatsiya", callbackData: `DOC_VERIFY:${complaint.id}` }],
        ]
      );
    }
    nextFlowState = "IDLE";
    draft = {};
    reply = makeBotReply(
      `✅ <b>Shikoyatingiz shifokorga yuborildi!</b>\n\n` +
        `🩺 Shifokor: <b>${escapeHtml(matched.doctor?.fullName || "Navbatchi shifokor")}</b>\n` +
        `🔑 Tasdiqlash OTP kodi: <b>${otp}</b>`,
      [
        [{ text: "💬 Shifokorga yozish", callbackData: "PATIENT:DM_START" }],
        [{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
      ]
    );
  } else if (callbackData === "VOICE_WB:CONFIRM" && linkedUser?.role === "PATIENT" && linkedUser.patientProfile && draft?.wellbeing) {
    const patient = linkedUser.patientProfile;
    const answers = draft.wellbeing;
    const recent = await prisma.wellbeingCheckin.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: "desc" },
      take: 14,
    });
    const evaluation = evaluateWellbeingSignals({
      mood: answers.mood || 3,
      answers,
      recentCheckins: recent,
    });
    const dateStr = getTashkentDateString();
    const checkin = await prisma.wellbeingCheckin.create({
      data: {
        patientId: patient.id,
        date: dateStr,
        mood: answers.mood || 3,
        answersJson: JSON.stringify(answers),
        riskFlag: evaluation.riskFlag,
        source: "TELEGRAM_VOICE",
      },
    });
    await triggerWellbeingRiskAlerts({
      patient,
      checkin,
      evaluation,
      notifyUserViaTelegram,
      notifyAdminsViaTelegram,
    });
    nextFlowState = "IDLE";
    draft = {};
    reply = makeBotReply(
      `✅ <b>Ovozli holat check-in saqlandi (${dateStr})!</b>\n` +
        (evaluation.hasPhysicalRedFlag
          ? "🚨 Xavfli belgi qayd etildi — oilaviy shifokoringiz ogohlantirildi. Zarur bo'lsa 103 ga qo'ng'iroq qiling!"
          : "Shifokoringiz kunlik dinamikangizni ko'rishi mumkin."),
      [[{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }]]
    );
  }
  // Profile & Essentials view (/profile, /me, /essentials, /account, /hisobim, MENU:PROFILE)
  else if (
    rawText === "/profile" ||
    rawText === "/me" ||
    rawText === "/essentials" ||
    rawText === "/account" ||
    rawText === "/hisobim" ||
    callbackData === "MENU:PROFILE"
  ) {
    nextFlowState = "IDLE";
    draft = {};
    if (!linkedUser) {
      reply = makeBotReply(
        "🔗 Hisobingizni ko'rish uchun Mini App orqali tizimga kiring, saytdagi hisobingizni bog'lang yoki bot orqali ro'yxatdan o'ting.",
        [
          [{ text: "📱 Kabinetga kirish (Mini App)", webAppUrl: getTelegramMiniAppUrl() }],
          [{ text: "🔗 Saytdagi hisobni bog'lash (/link)", callbackData: "MENU:LINK_HELP" }],
          [
            { text: "🤰 Bemor bo'lib ro'yxatdan o'tish", callbackData: "SIGNUP_ROLE:PATIENT" },
            { text: "🩺 Shifokor / Hamshira ro'yxatdan o'tishi", callbackData: "SIGNUP_ROLE:DOCTOR" },
          ],
        ]
      );
    } else {
      const profileMsg = await buildUserProfileMessage(linkedUser);
      reply = makeBotReply(profileMsg.text, profileMsg.buttons);
    }
  }
  // Permanent account & records deletion confirmation inside Mening hisobim
  else if (
    (callbackData === "ACCOUNT:DELETE_CONFIRM" ||
      rawText === "/delete_account" ||
      rawText === "/hisobni_ochirish") &&
    linkedUser
  ) {
    nextFlowState = "ACCOUNT_DELETE_CONFIRM";
    draft = {};
    reply = makeBotReply(
      `⚠️ <b>Diqqat! Hisobingizni butunlay o'chirmoqchimisiz?</b>\n\n` +
        `Bu amal qaytarib bo'lmaydi. Sizning hisobingiz (<code>${escapeHtml(linkedUser.email)}</code>) va unga bog'liq <b>barcha yozuvlar</b> ` +
        `(bemor profili, tibbiy yozuvlar, shikoyatlar, tashriflar, retseptlar, xabarlar, obunalar va Telegram sessiyasi) bazadan butunlay o'chiriladi.\n\n` +
        `Tasdiqlash uchun pastdagi tugmani bosing:`,
      [
        [{ text: "✅ Ha, hisobimni butunlay o'chirish", callbackData: "ACCOUNT:DELETE_EXECUTE" }],
        [{ text: "❌ Bekor qilish", callbackData: "MENU:PROFILE" }],
      ]
    );
  } else if (callbackData === "ACCOUNT:DELETE_EXECUTE" && linkedUser) {
    const deletedEmail = linkedUser.email;
    await permanentlyDeleteUserAccount({ userId: linkedUser.id });
    linkedUser = null;
    nextFlowState = "IDLE";
    draft = {};
    // Wipe previous user conversation/profile entries from transcript
    history = [
      {
        id: `u-${Date.now()}-del`,
        from: "user",
        text: "[Tugma] ACCOUNT:DELETE_EXECUTE",
        at: new Date().toISOString(),
      },
    ];
    reply = makeBotReply(
      `🗑️ <b>Hisobingiz va barcha yozuvlar butunlay o'chirildi.</b>\n` +
        `(O'chirilgan hisob: <code>${escapeHtml(deletedEmail)}</code>)\n\n` +
        `Xohlasangiz /start orqali yangidan ro'yxatdan o'tishingiz mumkin.`,
      [[{ text: "🏠 Bosh menyu (/start)", callbackData: "MENU:HOME" }]]
    );
  }
  // /link <token> OR /link <email> <password>
  else if (rawText === "/link" || rawText.startsWith("/link ") || callbackData === "MENU:LINK_HELP") {
    if (callbackData === "MENU:LINK_HELP" || rawText === "/link") {
      nextFlowState = "LINK_CREDENTIALS";
      reply = makeBotReply(
        "🔗 <b>Saytdagi hisobingizni Telegramga bog'lash</b>\n\n" +
          "Quyidagilardan birini yuboring:\n" +
          "1️⃣ Saytda berilgan bog'lash kodi: <code>link_...</code>\n" +
          "2️⃣ Yoki elektron pochta va parolingiz (bo'shliq bilan): <code>siz@example.uz parolingiz</code>"
      );
    } else {
      const argStr = rawText.replace(/^\/link\s+/i, "").trim();
      const parts = argStr.split(/\s+/);
      if (parts.length === 1 && parts[0].startsWith("link_")) {
        const tokenPayload = verifyTelegramLinkToken(parts[0]);
        const boundUser = tokenPayload
          ? await linkTelegramChatToUser({
              chatId,
              userId: tokenPayload.userId,
              tgUsername,
            })
          : null;
        if (!boundUser) {
          reply = makeBotReply("❌ Bog'lash kodi noto'g'ri yoki muddati tugagan. Saytdan yangi havola oling yoki <code>/link email parol</code> kiriting.");
        } else {
          linkedUser = boundUser;
          nextFlowState = "IDLE";
          const profileMsg = await buildUserProfileMessage(linkedUser);
          reply = makeBotReply(
            `✅ Telegram hisobingiz <b>${escapeHtml(boundUser.fullName)}</b> ga muvaffaqiyatli bog'landi!\n\n${profileMsg.text}`,
            profileMsg.buttons
          );
        }
      } else {
        const email = (parts[0] || "").toLowerCase();
        const password = parts[1] || "";
        const targetUser = await prisma.user.findUnique({
          where: { email },
          include: { patientProfile: true },
        });
        if (!targetUser || !verifyPassword(password, targetUser.passwordHash)) {
          reply = makeBotReply("❌ Email yoki parol noto'g'ri. Qayta urining: <code>/link email parol</code>");
        } else {
          linkedUser = await linkTelegramChatToUser({
            chatId,
            userId: targetUser.id,
            tgUsername,
          });
          const profileMsg = await buildUserProfileMessage(linkedUser);
          nextFlowState = "IDLE";
          reply = makeBotReply(
            `✅ Telegram hisobingiz <b>${escapeHtml(targetUser.fullName)}</b> ga muvaffaqiyatli bog'landi!\n\n${profileMsg.text}`,
            profileMsg.buttons
          );
        }
      }
    }
  } else if (nextFlowState === "LINK_CREDENTIALS" && rawText) {
    const parts = rawText.trim().split(/\s+/);
    if (parts.length === 1 && parts[0].startsWith("link_")) {
      const tokenPayload = verifyTelegramLinkToken(parts[0]);
      const boundUser = tokenPayload
        ? await linkTelegramChatToUser({
            chatId,
            userId: tokenPayload.userId,
            tgUsername,
          })
        : null;
      if (!boundUser) {
        reply = makeBotReply("❌ Bog'lash kodi noto'g'ri yoki muddati tugagan. Iltimos <code>email parol</code> ko'rinishida yuboring.");
      } else {
        linkedUser = boundUser;
        nextFlowState = "IDLE";
        const profileMsg = await buildUserProfileMessage(linkedUser);
        reply = makeBotReply(
          `✅ Hisob bog'landi: <b>${escapeHtml(boundUser.fullName)}</b>!\n\n${profileMsg.text}`,
          profileMsg.buttons
        );
      }
    } else {
      const email = (parts[0] || "").toLowerCase();
      const password = parts[1] || "";
      const targetUser = await prisma.user.findUnique({
        where: { email },
        include: { patientProfile: true },
      });
      if (!targetUser || !verifyPassword(password, targetUser.passwordHash)) {
        reply = makeBotReply("❌ Email yoki parol noto'g'ri. Iltimos: <code>email parol</code> ko'rinishida yuboring.");
      } else {
        linkedUser = await linkTelegramChatToUser({
          chatId,
          userId: targetUser.id,
          tgUsername,
        });
        const profileMsg = await buildUserProfileMessage(linkedUser);
        nextFlowState = "IDLE";
        reply = makeBotReply(
          `✅ Hisob bog'landi: <b>${escapeHtml(targetUser.fullName)}</b>!\n\n${profileMsg.text}`,
          profileMsg.buttons
        );
      }
    }
  } else if (rawText === "/unlink") {
    if (linkedUser) {
      await prisma.user.update({
        where: { id: linkedUser.id },
        data: { telegramChatId: null },
      });
      if (linkedUser.patientProfile) {
        await prisma.patient.update({
          where: { id: linkedUser.patientProfile.id },
          data: { telegramChatId: null },
        });
      }
    }
    await prisma.telegramSession.update({ where: { chatId }, data: { userId: null } });
    linkedUser = null;
    setIdleWithMenu();
  }
  // ==================== SIGNUP IN TELEGRAM ====================
  else if (rawText === "/signup" || callbackData.startsWith("SIGNUP_ROLE:")) {
    if (callbackData === "SIGNUP_ROLE:PATIENT") {
      draft = { targetRole: "PATIENT" };
      nextFlowState = "SIGNUP_NAME";
      reply = makeBotReply("🤰 <b>Bemor ro'yxatdan o'tishi</b>\n\nTo'liq ism-familiyangizni (F.I.O.) yozing:");
    } else if (callbackData === "SIGNUP_ROLE:DOCTOR") {
      draft = { targetRole: "FAMILY_MD" };
      nextFlowState = "SIGNUP_DOC_TYPE";
      reply = makeBotReply("🩺 <b>Shifokor ro'yxatdan o'tishi</b>\nQaysi muassasada ishlaysiz?", [
        [
          { text: "🏥 Oilaviy Poliklinika (Patronaj)", callbackData: "DOCROLE:FAMILY_MD" },
          { text: "🏩 Tug'ruqxona (OvaBMU)", callbackData: "DOCROLE:OVABMU_MD" },
        ],
      ]);
    } else {
      reply = makeBotReply("Ro'yxatdan o'tish turini tanlang:", [
        [
          { text: "🤰 Bemor", callbackData: "SIGNUP_ROLE:PATIENT" },
          { text: "🩺 Shifokor", callbackData: "SIGNUP_ROLE:DOCTOR" },
        ],
      ]);
    }
  } else if (nextFlowState === "SIGNUP_DOC_TYPE" && callbackData.startsWith("DOCROLE:")) {
    draft.targetRole = callbackData.split(":")[1] || "FAMILY_MD";
    nextFlowState = "SIGNUP_NAME";
    reply = makeBotReply("To'liq ism-familiyangizni (F.I.O.) kiriting:");
  } else if (nextFlowState === "SIGNUP_NAME" && rawText.length >= 2) {
    draft.fullName = rawText;
    if (draft.targetRole === "PATIENT") {
      nextFlowState = "SIGNUP_DOB";
      reply = makeBotReply("Tug'ilgan sanangizni yozing (masalan: <code>1995-05-14</code>):");
    } else {
      nextFlowState = "SIGNUP_EXPERTISE";
      reply = makeBotReply(
        "🩺 <b>Qaysi soha / ekspertiza bo'yicha ishlaysiz?</b>\n(Masalan: Akusher-ginekolog, Oilaviy shifokor, Pediatr, Kardiolog)"
      );
    }
  } else if (nextFlowState === "SIGNUP_DOB" && rawText) {
    draft.dateOfBirth = rawText;
    nextFlowState = "SIGNUP_PHONE";
    reply = makeBotReply("Telefon raqamingizni yuboring (masalan: <code>+998 90 123 45 67</code>):", [], false, true);
  } else if (nextFlowState === "SIGNUP_EXPERTISE" && rawText.length >= 2) {
    draft.expertiseArea = rawText;
    draft.specialty = rawText;
    nextFlowState = "SIGNUP_EXPERIENCE";
    reply = makeBotReply("⏳ Necha yillik ish tajribangiz bor? (raqam yozing, masalan: <code>7</code>):");
  } else if (nextFlowState === "SIGNUP_EXPERIENCE" && rawText) {
    const yrs = parseInt(rawText.replace(/\D/g, ""), 10);
    draft.experienceYears = Number.isFinite(yrs) && yrs >= 0 ? Math.min(yrs, 65) : 3;
    nextFlowState = "SIGNUP_PHONE";
    reply = makeBotReply("Telefon raqamingizni yuboring (masalan: <code>+998 90 123 45 67</code>):", [], false, true);
  } else if (nextFlowState === "SIGNUP_PHONE" && (incomingContact || rawText.length >= 5)) {
    draft.phone = incomingContact ? incomingContact.phone_number : rawText;
    nextFlowState = "SIGNUP_LOCATION";
    reply = makeBotReply(
      "📍 <b>Joylashuvingizni (GPS) ulashing</b> yoki tuman/shahar nomini yozing (masalan: <code>Chilonzor, Toshkent</code>):\n\n" +
        (draft.targetRole === "PATIENT"
          ? "Bu sizga eng yaqin shifokorni topish uchun kerak."
          : "Bu sizga eng yaqin bemorlarni ko'rsatish uchun kerak."),
      [],
      true,
      false
    );
  } else if (nextFlowState === "SIGNUP_LOCATION" && (incomingLocation || rawText.length >= 2)) {
    if (incomingLocation) {
      draft.latitude = incomingLocation.latitude;
      draft.longitude = incomingLocation.longitude;
      draft.district = draft.district || "Toshkent (GPS)";
    } else {
      draft.district = rawText;
      const coords = resolveCoordinatesForLocation(rawText, rawText);
      draft.latitude = coords.latitude;
      draft.longitude = coords.longitude;
    }
    nextFlowState = "SIGNUP_EMAIL";
    reply = makeBotReply("Kirish uchun elektron pochta (Email) manzilingizni yozing:");
  } else if (nextFlowState === "SIGNUP_EMAIL" && rawText.includes("@")) {
    draft.email = rawText.toLowerCase();
    nextFlowState = "SIGNUP_PASSWORD";
    reply = makeBotReply("Kamida 6 ta belgidan iborat parol yozing:");
  } else if (nextFlowState === "SIGNUP_PASSWORD" && rawText.length >= 6) {
    const email = draft.email;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      nextFlowState = "SIGNUP_EMAIL";
      reply = makeBotReply("⚠️ Bu email allaqachon mavjud. Boshqa email kiriting:");
    } else {
      const role = draft.targetRole || "PATIENT";
      const locInfo = resolvePolyclinicForLocation(draft.district || "Yunusobod", "");
      const polyclinicId = role === "OVABMU_MD" ? "OVABMU-TSH-01" : locInfo.polyclinicId;
      const polyclinicName =
        role === "OVABMU_MD"
          ? "Respublika Ona va Bola Salomatligi Markazi (OvaBMU)"
          : locInfo.polyclinicName;

      const createdUser = await prisma.$transaction(async (tx) => {
        await tx.user.updateMany({
          where: { telegramChatId: chatId },
          data: { telegramChatId: null },
        });
        await tx.patient.updateMany({
          where: { telegramChatId: chatId },
          data: { telegramChatId: null },
        });
        const u = await tx.user.create({
          data: {
            email,
            passwordHash: hashPassword(rawText),
            fullName: draft.fullName,
            role,
            verificationStatus: "PENDING",
            polyclinicId,
            polyclinicName,
            district: draft.district || "Yunusobod",
            specialty: draft.specialty || (role === "PATIENT" ? "Bemor" : "Hududiy oilaviy shifokor"),
            expertiseArea: draft.expertiseArea || null,
            experienceYears: draft.experienceYears ?? null,
            latitude: draft.latitude ?? null,
            longitude: draft.longitude ?? null,
            phone: draft.phone || "",
            telegramHandle: tgUsername ? `@${tgUsername}` : null,
            telegramChatId: chatId,
            scheduleSlotsJson:
              role === "FAMILY_MD"
                ? JSON.stringify([
                    { slotId: `slot-${Date.now()}-1`, startHourOffset: 3, endHourOffset: 5, bookedPatientId: null },
                    { slotId: `slot-${Date.now()}-2`, startHourOffset: 7, endHourOffset: 9, bookedPatientId: null },
                  ])
                : "[]",
          },
        });
        if (role === "PATIENT") {
          const jshshir = `4960${Math.floor(1000000000 + Math.random() * 8999999999)}`;
          await tx.patient.create({
            data: {
              userId: u.id,
              fullName: draft.fullName,
              jshshirEncrypted: encryptField(jshshir),
              jshshirMasked: `4960••••••${jshshir.slice(-4)}`,
              dateOfBirth: draft.dateOfBirth || "1995-01-01",
              phone: draft.phone || "",
              district: draft.district || "Yunusobod",
              mahalla: "Telegram GPS MFY",
              address: `${draft.district || "Toshkent"}${draft.latitude ? ` (${draft.latitude.toFixed(4)}, ${draft.longitude.toFixed(4)})` : ""}`,
              latitude: draft.latitude ?? null,
              longitude: draft.longitude ?? null,
              telegramChatId: chatId,
              bloodType: "I don't know",
              allergiesJson: JSON.stringify(["Ma'lumot kiritilmagan"]),
              polyclinicId,
              polyclinicName,
              emergencyContact: draft.phone || "Kiritilmagan",
              status: "PENDING_VERIFICATION",
            },
          });
        }
        return u;
      });

      linkedUser = await prisma.user.findUnique({
        where: { id: createdUser.id },
        include: { patientProfile: { include: { assignedFamilyDoctor: true } } },
      });
      await prisma.telegramSession.update({
        where: { chatId },
        data: { userId: createdUser.id },
      });
      await notifyAdminsViaTelegram(
        `🆕 <b>Yangi Telegram Ro'yxatdan o'tish!</b>\nFoydalanuvchi: <b>${createdUser.fullName}</b> (${createdUser.role})\n📍 ${createdUser.district}\nTasdiqlash uchun Qabulxona -> Hisoblarni tasdiqlash bo'limini oching.`
      );

      nextFlowState = "IDLE";
      draft = {};
      reply = makeBotReply(
        `✅ <b>Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!</b>\n\n` +
          `👤 ${escapeHtml(createdUser.fullName)} (${formatRoleLabel(createdUser.role)})\n` +
          `📍 GPS: ${createdUser.latitude?.toFixed(4)}, ${createdUser.longitude?.toFixed(4)}\n` +
          `⏳ <b>Holat: Administrator tasdig'ini kutmoqda.</b>\n` +
          `Admin tasdiqlagach sizga shu botga xabar keladi!`,
        [
          [{ text: "👤 Profilim va ma'lumotlarim (/profile)", callbackData: "MENU:PROFILE" }],
          [{ text: "🔄 Holatni tekshirish", callbackData: "MENU:REFRESH" }],
        ]
      );
    }
  }
  // ==================== PATIENT COMPLAINT + GPS + PARAMEDIC DESTINATION ====================
  else if (
    (rawText === "/complaint" || callbackData === "PATIENT:NEW_COMPLAINT") &&
    linkedUser?.role === "PATIENT" &&
    linkedUser.verificationStatus === "VERIFIED"
  ) {
    draft = {};
    nextFlowState = "COMPLAINT_CATEGORY";
    reply = makeBotReply("🚨 <b>Yangi shikoyat yuborish</b>\nShikoyatingiz yo'nalishini tanlang:", [
      [
        { text: "🤰 Tug'ruqdan keyingi", callbackData: "CAT:POSTPARTUM" },
        { text: "❤️ Yurak / Qon bosimi", callbackData: "CAT:CARDIO" },
      ],
      [
        { text: "👶 Chaqaloq / Pediatr", callbackData: "CAT:PEDIATRIC" },
        { text: "🚑 Shoshilinch holat", callbackData: "CAT:EMERGENCY" },
      ],
      [{ text: "🩺 Umumiy shikoyat", callbackData: "CAT:GENERAL" }],
    ]);
  } else if (nextFlowState === "COMPLAINT_CATEGORY" && callbackData.startsWith("CAT:")) {
    draft.category = callbackData.split(":")[1] || "POSTPARTUM";
    nextFlowState = "COMPLAINT_TEXT";
    reply = makeBotReply("📝 Bezovtalik yoki shikoyatingizni batafsil yozing (qayeringiz og'riyapti, harorat, bosim):");
  } else if (nextFlowState === "COMPLAINT_TEXT" && rawText.length >= 3) {
    draft.description = rawText;
    draft.title = rawText.slice(0, 72);
    nextFlowState = "COMPLAINT_SEVERITY";
    reply = makeBotReply("📊 Holat qanchalik jiddiy? Baholang:", [
      [
        { text: "1 · Yengil", callbackData: "SEV:MILD" },
        { text: "2 · O'rtacha", callbackData: "SEV:MODERATE" },
      ],
      [
        { text: "3 · Jiddiy", callbackData: "SEV:SEVERE" },
        { text: "4 · O'ta jiddiy (Shoshilinch)", callbackData: "SEV:CRITICAL" },
      ],
    ]);
  } else if (nextFlowState === "COMPLAINT_SEVERITY" && callbackData.startsWith("SEV:")) {
    draft.severity = callbackData.split(":")[1] || "MODERATE";
    nextFlowState = "COMPLAINT_DEST";
    reply = makeBotReply(
      "🚑 <b>Paramedik / Shifokor qayerga tashrif buyursin?</b>\nManzil turini tanlang:",
      [
        [
          { text: "🏠 Uy manzilim", callbackData: "DEST:HOME" },
          { text: "📍 Hozirgi GPS joyim", callbackData: "DEST:CURRENT_GPS" },
        ],
        [
          { text: "👨‍👩‍👧 Yaqinlarim uyi", callbackData: "DEST:RELATIVE_HOME" },
          { text: "🏥 Poliklinika", callbackData: "DEST:CLINIC" },
        ],
        [{ text: "✏️ Boshqa manzil yozaman", callbackData: "DEST:CUSTOM" }],
      ]
    );
  } else if (nextFlowState === "COMPLAINT_DEST" && callbackData.startsWith("DEST:")) {
    draft.visitDestination = callbackData.split(":")[1] || "HOME";
    nextFlowState = "COMPLAINT_GPS";
    const destOpt = VISIT_DESTINATION_OPTIONS.find((d) => d.value === draft.visitDestination);
    reply = makeBotReply(
      `📍 Tanlandi: <b>${destOpt?.uz || draft.visitDestination}</b>\n\n` +
        `Endi aniq GPS lokatsiyangizni ulashing (<b>📍 Lokatsiya yuborish</b> tugmasi) yoki aniq ko'cha/uy manzilingizni yozing:`,
      [],
      true,
      false
    );
  } else if (nextFlowState === "COMPLAINT_GPS" && (incomingLocation || rawText.length >= 2)) {
    const patient = linkedUser?.patientProfile;
    if (!patient) {
      setIdleWithMenu();
    } else {
      const fallbackCoords =
        typeof patient.latitude === "number" && typeof patient.longitude === "number"
          ? { latitude: patient.latitude, longitude: patient.longitude }
          : resolveCoordinatesForLocation(patient.district, "");
      const lat = incomingLocation ? incomingLocation.latitude : fallbackCoords.latitude;
      const lng = incomingLocation ? incomingLocation.longitude : fallbackCoords.longitude;
      const visitAddress = incomingLocation
        ? `${patient.address || patient.district} (GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`
        : rawText;

      const doctors = await prisma.user.findMany({
        where: { role: { in: ["FAMILY_MD", "OVABMU_MD"] }, verificationStatus: "VERIFIED" },
      });
      const matched = matchNearestDoctor(doctors, {
        latitude: lat,
        longitude: lng,
        district: patient.district,
        category: draft.category,
      });

      const otp = String(Math.floor(1000 + Math.random() * 9000));
      const complaint = await prisma.complaint.create({
        data: {
          patientId: patient.id,
          assignedDoctorId: matched.doctor?.id ?? null,
          title: draft.title || "Telegram shikoyati",
          description: draft.description || rawText,
          category: draft.category || "POSTPARTUM",
          severity: draft.severity || "MODERATE",
          status: "SUBMITTED",
          visitDestination: draft.visitDestination || "HOME",
          visitAddress,
          latitude: lat,
          longitude: lng,
          distanceKm: matched.distanceKm,
          preferredTimeWindow: "Eng qisqa vaqtda",
          sourceChannel: "TELEGRAM",
          visitOtpCode: otp,
        },
      });

      // Notify matched doctor on Telegram immediately!
      if (matched.doctor) {
        await notifyUserViaTelegram(
          matched.doctor.id,
          `🚨 <b>Yangi bemor shikoyati (Telegram GPS)!</b>\n\n` +
            `👩 Bemor: <b>${patient.fullName}</b> (${patient.phone})\n` +
            `📌 Yo'nalish: ${complaint.category} • Daraja: <b>${complaint.severity}</b>\n` +
            `🚑 Tashrif joyi: ${complaint.visitDestination} — ${complaint.visitAddress}\n` +
            `📏 Masofa: ${matched.distanceKm !== null ? `${matched.distanceKm} km` : "Hudud bo'yicha"}\n` +
            `📝 Shikoyat: ${complaint.description}`,
          [
            [
              { text: "💬 Javob berish", callbackData: `DOC_RESPOND:${complaint.id}` },
              { text: "🚗 Yo'lga chiqdim", callbackData: `DOC_ENROUTE:${complaint.id}` },
            ],
            [{ text: "✅ Borib ko'rdim & Verifikatsiya", callbackData: `DOC_VERIFY:${complaint.id}` }],
          ]
        );
      }

      nextFlowState = "IDLE";
      draft = {};
      reply = makeBotReply(
        `✅ <b>Shikoyatingiz qabul qilindi va eng yaqin shifokorga yuborildi!</b>\n\n` +
          `🩺 Biriktirilgan shifokor: <b>${matched.doctor?.fullName || "Navbatchi shifokor"}</b>\n` +
          (matched.doctor?.expertiseArea ? `🏥 Soha: ${matched.doctor.expertiseArea}\n` : "") +
          (matched.doctor?.experienceYears ? `⏳ Tajriba: ${matched.doctor.experienceYears} yil\n` : "") +
          `📏 Masofa: ${matched.distanceKm !== null ? `${matched.distanceKm} km` : "Yaqin hudud"}\n` +
          `📍 Manzil: ${visitAddress}\n` +
          `🔑 Tashrifni tasdiqlash OTP kodi: <b>${otp}</b>\n\n` +
          `Shifokor bilan to'g'ridan-to'g'ri maslahatlashish uchun pastdagi tugmani bosing:`,
        [
          [{ text: "💬 Shifokorga xabar yozish", callbackData: "PATIENT:DM_START" }],
          [{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
        ]
      );
    }
  }
  // ==================== PATIENT STATUS & DIRECT ADVICE ====================
  else if (callbackData === "PATIENT:STATUS" && linkedUser?.role === "PATIENT") {
    const patient = linkedUser.patientProfile;
    const complaints = patient
      ? await prisma.complaint.findMany({
          where: { patientId: patient.id },
          include: { assignedDoctor: true },
          orderBy: { createdAt: "desc" },
          take: 3,
        })
      : [];
    if (complaints.length === 0) {
      reply = makeBotReply("Sizda hozircha yuborilgan shikoyatlar yo'q.", [
        [{ text: "🚨 Shikoyat yuborish", callbackData: "PATIENT:NEW_COMPLAINT" }],
        [{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
      ]);
    } else {
      const txt = complaints
        .map(
          (c, i) =>
            `${i + 1}. <b>${c.title}</b>\n` +
            `   Holat: <b>${c.status}</b> • Daraja: ${c.severity}\n` +
            `   🩺 Shifokor: ${c.assignedDoctor?.fullName || "Biriktirilmoqda"} (${c.distanceKm ?? "?"} km)\n` +
            `   📍 Joy: ${c.visitAddress}\n` +
            `   🔑 OTP: <b>${c.visitOtpCode}</b>` +
            (c.doctorResponse ? `\n   💬 Shifokor javobi: <i>${c.doctorResponse}</i>` : "")
        )
        .join("\n\n");
      reply = makeBotReply(`🩺 <b>Shikoyatlaringiz va shifokor tashrifi holati:</b>\n\n${txt}`, [
        [{ text: "💬 Shifokorga yozish", callbackData: "PATIENT:DM_START" }],
        [{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
      ]);
    }
  } else if (
    (callbackData === "PATIENT:DM_START" || rawText === "/dm" || rawText === "/advice") &&
    linkedUser?.role === "PATIENT" &&
    linkedUser.verificationStatus === "VERIFIED"
  ) {
    const patient = linkedUser.patientProfile;
    const latestComp = patient
      ? await prisma.complaint.findFirst({
          where: { patientId: patient.id, assignedDoctorId: { not: null } },
          include: { assignedDoctor: { select: { fullName: true, specialty: true } } },
          orderBy: { createdAt: "desc" },
        })
      : null;
    const assignee =
      latestComp?.assignedDoctor ||
      patient?.assignedFamilyDoctor ||
      (patient?.polyclinicId
        ? await prisma.user.findFirst({
            where: {
              role: { in: ["FAMILY_MD", "OVABMU_MD"] },
              polyclinicId: patient.polyclinicId,
              verificationStatus: "VERIFIED",
            },
            select: { fullName: true, specialty: true },
          })
        : null);
    nextFlowState = "PATIENT_DM_ACTIVE";
    reply = makeBotReply(
      `💬 <b>Shifokor / Hamshira bilan to'g'ridan-to'g'ri chat</b>\n` +
        (assignee
          ? `🩺 Qabul qiluvchi: <b>${escapeHtml(assignee.fullName)}</b>${assignee.specialty ? ` (${escapeHtml(assignee.specialty)})` : ""}\n\n`
          : "") +
        `Savolingizni yozing — xabaringiz darhol yetkaziladi (bekor qilish uchun /cancel):`,
      [[{ text: "📱 Mini Appda chatni ochish", webAppUrl: getTelegramMiniAppUrl() }]]
    );
  } else if (nextFlowState === "PATIENT_DM_ACTIVE" && rawText) {
    const patient = linkedUser?.patientProfile;
    if (!patient) {
      setIdleWithMenu();
    } else {
      const latestComp = await prisma.complaint.findFirst({
        where: { patientId: patient.id },
        orderBy: { createdAt: "desc" },
      });
      let recipientId = latestComp?.assignedDoctorId || patient.assignedFamilyDoctorId || null;
      if (!recipientId) {
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
        recipientId = fallbackDoc?.id || null;
      }
      await prisma.directMessage.create({
        data: {
          complaintId: latestComp?.id || null,
          patientId: patient.id,
          senderUserId: linkedUser.id,
          senderName: linkedUser.fullName,
          senderRole: "PATIENT",
          recipientUserId: recipientId,
          body: rawText,
          channel: "TELEGRAM",
        },
      });
      if (recipientId) {
        const replyAction = latestComp
          ? { text: "✍️ Javob qaytarish", callbackData: `DOC_RESPOND:${latestComp.id}` }
          : { text: "✍️ Javob qaytarish", callbackData: `DOC_DM_PATIENT:${patient.id}` };
        await notifyUserViaTelegram(
          recipientId,
          `💬 <b>Bemor xabari (${escapeHtml(linkedUser.fullName)}):</b>\n\n${escapeHtml(rawText)}`,
          [
            [replyAction],
            [{ text: "📱 Kabinetni ochish", webAppUrl: getTelegramMiniAppUrl() }],
          ]
        );
      }
      reply = makeBotReply(
        "✅ Xabaringiz biriktirilgan shifokor / hamshiraga yuborildi! Yana yozishingiz mumkin yoki menyuga qayting.",
        [
          [{ text: "📱 Mini Appda ko'rish", webAppUrl: getTelegramMiniAppUrl() }],
          [{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
        ]
      );
    }
  }
  // ==================== DOCTOR FEATURES IN TELEGRAM ====================
  else if (
    (callbackData === "DOCTOR:NEARBY" || rawText === "/nearby") &&
    (linkedUser?.role === "FAMILY_MD" || linkedUser?.role === "OVABMU_MD") &&
    linkedUser.verificationStatus === "VERIFIED"
  ) {
    const complaints = await prisma.complaint.findMany({
      where: { status: { in: ["SUBMITTED", "DOCTOR_RESPONDED", "EN_ROUTE", "ARRIVED"] } },
      include: { patient: true },
    });
    const docLat = linkedUser.latitude ?? resolveCoordinatesForLocation(linkedUser.district || "", "").latitude;
    const docLng = linkedUser.longitude ?? resolveCoordinatesForLocation(linkedUser.district || "", "").longitude;

    const ranked = complaints
      .map((c) => {
        const dist =
          typeof c.latitude === "number" && typeof c.longitude === "number"
            ? haversineDistanceKm(docLat, docLng, c.latitude, c.longitude)
            : c.distanceKm ?? 99;
        return { ...c, computedKm: dist ?? 99 };
      })
      .sort((a, b) => a.computedKm - b.computedKm)
      .slice(0, 5);

    if (ranked.length === 0) {
      reply = makeBotReply("Hozircha yaqin atrofda ochiq shikoyatlar yo'q.", [
        [{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
      ]);
    } else {
      const txt = ranked
        .map(
          (c, idx) =>
            `${idx + 1}. <b>${c.patient.fullName}</b> — 📏 <b>${c.computedKm} km</b> (${c.severity})\n` +
            `   📍 ${c.visitAddress}\n` +
            `   📝 ${c.title}\n` +
            `   Holat: ${c.status}`
        )
        .join("\n\n");
      const actionRows = ranked.slice(0, 3).map((c) => [
        { text: `💬 Javob: ${c.patient.fullName.split(" ")[0]}`, callbackData: `DOC_RESPOND:${c.id}` },
        { text: `✅ Verifikatsiya`, callbackData: `DOC_VERIFY:${c.id}` },
      ]);
      actionRows.push([{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }]);
      reply = makeBotReply(`📍 <b>Sizga eng yaqin bemor shikoyatlari:</b>\n\n${txt}`, actionRows);
    }
  } else if (
    (callbackData === "DOCTOR:REMINDERS" || rawText === "/reminders") &&
    (linkedUser?.role === "FAMILY_MD" || linkedUser?.role === "OVABMU_MD") &&
    linkedUser.verificationStatus === "VERIFIED"
  ) {
    const myComplaints = await prisma.complaint.findMany({
      where: {
        assignedDoctorId: linkedUser.id,
        status: { in: ["SUBMITTED", "DOCTOR_RESPONDED", "EN_ROUTE", "ARRIVED"] },
      },
      include: { patient: true },
    });
    const myCalls = await prisma.activeCall.findMany({
      where: {
        assignedDoctorId: linkedUser.id,
        status: { in: ["SCHEDULED", "ESCALATED_12H", "CRITICAL_18H"] },
      },
      include: { patient: true },
    });
    const parts = [];
    if (myComplaints.length > 0) {
      parts.push(
        `🚨 <b>Sizga biriktirilgan shikoyatlar (${myComplaints.length}):</b>\n` +
          myComplaints
            .map((c) => `• ${c.patient.fullName} (${c.status}) — 📍 ${c.visitAddress}`)
            .join("\n")
      );
    }
    if (myCalls.length > 0) {
      parts.push(
        `🩺 <b>24 soatlik majburiy tashriflar (${myCalls.length}):</b>\n` +
          myCalls.map((call) => `• ${call.patient.fullName} (${call.status}) — 📍 ${call.patient.address}`).join("\n")
      );
    }
    reply = makeBotReply(
      parts.length > 0 ? parts.join("\n\n") : "✅ Sizda barcha tashriflar va shikoyatlar yakunlangan!",
      [[{ text: "📍 Eng yaqin bemorlar", callbackData: "DOCTOR:NEARBY" }, { text: "🏠 Menyu", callbackData: "MENU:HOME" }]]
    );
  } else if (
    callbackData === "DOCTOR:UPDATE_GPS" &&
    (linkedUser?.role === "FAMILY_MD" || linkedUser?.role === "OVABMU_MD")
  ) {
    nextFlowState = "DOCTOR_UPDATE_GPS";
    reply = makeBotReply("🧭 Hozirgi GPS lokatsiyangizni ulashing yoki tuman nomini yozing:", [], true, false);
  } else if (nextFlowState === "DOCTOR_UPDATE_GPS" && (incomingLocation || rawText)) {
    const coords = incomingLocation
      ? { latitude: incomingLocation.latitude, longitude: incomingLocation.longitude }
      : resolveCoordinatesForLocation(rawText, rawText);
    await prisma.user.update({
      where: { id: linkedUser.id },
      data: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        ...(rawText ? { district: rawText } : {}),
      },
    });
    linkedUser = await prisma.user.findUnique({
      where: { id: linkedUser.id },
      include: { patientProfile: true },
    });
    nextFlowState = "IDLE";
    reply = makeBotReply(
      `✅ GPS lokatsiyangiz yangilandi (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}). Endi eng yaqin bemorlarni ko'rishingiz mumkin!`,
      [[{ text: "📍 Eng yaqin bemorlar", callbackData: "DOCTOR:NEARBY" }]]
    );
  } else if (
    callbackData.startsWith("DOC_RESPOND:") &&
    (linkedUser?.role === "FAMILY_MD" || linkedUser?.role === "OVABMU_MD")
  ) {
    const complaintId = callbackData.split(":")[1];
    draft = { complaintId };
    nextFlowState = "DOC_REPLY_TEXT";
    reply = makeBotReply("✍️ Bemor uchun javob va tibbiy maslahatingizni yozing:");
  } else if (nextFlowState === "DOC_REPLY_TEXT" && rawText && draft.complaintId) {
    const comp = await prisma.complaint.findUnique({
      where: { id: draft.complaintId },
      include: { patient: true },
    });
    if (!comp) {
      setIdleWithMenu();
    } else {
      const dist =
        typeof linkedUser.latitude === "number" &&
        typeof linkedUser.longitude === "number" &&
        typeof comp.latitude === "number" &&
        typeof comp.longitude === "number"
          ? haversineDistanceKm(linkedUser.latitude, linkedUser.longitude, comp.latitude, comp.longitude)
          : comp.distanceKm;

      await prisma.complaint.update({
        where: { id: comp.id },
        data: {
          assignedDoctorId: linkedUser.id,
          status: comp.status === "SUBMITTED" ? "DOCTOR_RESPONDED" : comp.status,
          doctorResponse: rawText,
          doctorRespondedAt: new Date(),
          distanceKm: dist,
        },
      });
      await prisma.directMessage.create({
        data: {
          complaintId: comp.id,
          patientId: comp.patientId,
          senderUserId: linkedUser.id,
          senderName: linkedUser.fullName,
          senderRole: linkedUser.role,
          recipientUserId: comp.patient.userId || null,
          body: rawText,
          channel: "TELEGRAM",
        },
      });
      if (comp.patient.userId) {
        await notifyUserViaTelegram(
          comp.patient.userId,
          `🩺 <b>${escapeHtml(linkedUser.fullName)} javob berdi:</b>\n\n"${escapeHtml(rawText)}"`,
          [
            [{ text: "💬 Javob yozish", callbackData: "PATIENT:DM_START" }],
            [{ text: "📱 Mini Appda ochish", webAppUrl: getTelegramMiniAppUrl() }],
          ]
        );
      }
      nextFlowState = "IDLE";
      draft = {};
      reply = makeBotReply(
        `✅ Javobingiz <b>${comp.patient.fullName}</b> bemorga yuborildi va shikoyatga biriktirildi!`,
        [
          [{ text: "🚗 Yo'lga chiqdim", callbackData: `DOC_ENROUTE:${comp.id}` }],
          [{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
        ]
      );
    }
  } else if (
    callbackData.startsWith("DOC_ENROUTE:") &&
    (linkedUser?.role === "FAMILY_MD" || linkedUser?.role === "OVABMU_MD")
  ) {
    const complaintId = callbackData.split(":")[1];
    const comp = await prisma.complaint.update({
      where: { id: complaintId },
      data: { assignedDoctorId: linkedUser.id, status: "EN_ROUTE" },
      include: { patient: true },
    });
    if (comp.patient.userId) {
      await notifyUserViaTelegram(
        comp.patient.userId,
        `🚑 <b>Shifokor yo'lga chiqdi!</b>\n${linkedUser.fullName} belgilangan manzilga (${comp.visitAddress}) kelmoqda.\n🔑 OTP kodingiz: <b>${comp.visitOtpCode}</b>`
      );
    }
    reply = makeBotReply(
      `🚗 Holat <b>YO'LDA (EN_ROUTE)</b> ga o'zgartirildi. Bemor xabardor qilindi.`,
      [[{ text: "✅ Borib ko'rdim & Verifikatsiya", callbackData: `DOC_VERIFY:${comp.id}` }]]
    );
  } else if (
    callbackData.startsWith("DOC_VERIFY:") &&
    (linkedUser?.role === "FAMILY_MD" || linkedUser?.role === "OVABMU_MD")
  ) {
    const complaintId = callbackData.split(":")[1];
    const comp = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        assignedDoctorId: linkedUser.id,
        status: "VERIFIED_COMPLETED",
        visitVerifiedAt: new Date(),
        visitVerificationNote: "Telegram orqali shifokor joyiga borib bemor holidan xabar oldi va tasdiqladi.",
      },
      include: { patient: true },
    });
    if (comp.patient.userId) {
      await notifyUserViaTelegram(
        comp.patient.userId,
        `✅ <b>Tashrif verifikatsiya qilindi!</b>\n${linkedUser.fullName} ko'rikdan o'tkazib tashrifni tasdiqladi. Salomat bo'ling!`
      );
    }
    reply = makeBotReply(
      `✅ <b>${comp.patient.fullName}</b> tashrifi muvaffaqiyatli verifikatsiya qilindi!`,
      [[{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }]]
    );
  } else if (
    (callbackData === "DOCTOR:DM_LIST" || rawText === "/patients_chat") &&
    (linkedUser?.role === "FAMILY_MD" || linkedUser?.role === "OVABMU_MD")
  ) {
    const [assignedPatients, assignedCalls, openComps, recentDms] = await Promise.all([
      prisma.patient.findMany({
        where: {
          assignedFamilyDoctorId: linkedUser.id,
          status: { notIn: ["PENDING_VERIFICATION", "REJECTED"] },
        },
        take: 6,
      }),
      prisma.activeCall.findMany({
        where: { assignedDoctorId: linkedUser.id },
        include: { patient: true },
        orderBy: { slaDeadlineAt: "asc" },
        take: 6,
      }),
      prisma.complaint.findMany({
        where: { assignedDoctorId: linkedUser.id },
        include: { patient: true },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      prisma.directMessage.findMany({
        where: { OR: [{ recipientUserId: linkedUser.id }, { senderUserId: linkedUser.id }] },
        include: { patient: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const patientMap = new Map();
    for (const dm of recentDms) {
      if (dm.patient && !patientMap.has(dm.patient.id)) {
        patientMap.set(dm.patient.id, dm.patient);
      }
    }
    for (const c of openComps) {
      if (c.patient && !patientMap.has(c.patient.id)) {
        patientMap.set(c.patient.id, c.patient);
      }
    }
    for (const call of assignedCalls) {
      if (call.patient && !patientMap.has(call.patient.id)) {
        patientMap.set(call.patient.id, call.patient);
      }
    }
    for (const p of assignedPatients) {
      if (!patientMap.has(p.id)) {
        patientMap.set(p.id, p);
      }
    }

    const chatPatients = Array.from(patientMap.values()).slice(0, 6);
    if (chatPatients.length === 0) {
      reply = makeBotReply("Hozircha sizga biriktirilgan faol suhbatlar yo'q.", [
        [{ text: "📱 Kabinetni ochish (Mini App)", webAppUrl: getTelegramMiniAppUrl() }],
        [{ text: "📍 Eng yaqin bemorlar", callbackData: "DOCTOR:NEARBY" }],
      ]);
    } else {
      const btnRows = chatPatients.map((p) => [
        {
          text: `👩 ${p.fullName}${p.district ? ` • ${p.district}` : ""}`.slice(0, 48),
          callbackData: `DOC_DM_PATIENT:${p.id}`,
        },
      ]);
      btnRows.push([{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }]);
      reply = makeBotReply(
        "💬 <b>Bemor bilan to'g'ridan-to'g'ri chat</b>\nQaysi bemorga maslahat yozmoqchisiz?",
        btnRows
      );
    }
  } else if (
    callbackData.startsWith("DOC_DM_PATIENT:") &&
    (linkedUser?.role === "FAMILY_MD" || linkedUser?.role === "OVABMU_MD")
  ) {
    const patientId = callbackData.split(":")[1];
    const targetPatient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!targetPatient) {
      setIdleWithMenu();
    } else {
      const recentMsgs = await prisma.directMessage.findMany({
        where: { patientId: targetPatient.id },
        orderBy: { createdAt: "desc" },
        take: 4,
      });
      const preview = recentMsgs
        .reverse()
        .map((m) => `• <b>${escapeHtml(m.senderName)}:</b> ${escapeHtml(m.body)}`)
        .join("\n");
      draft = { patientId: targetPatient.id };
      nextFlowState = "DOC_DM_REPLY";
      reply = makeBotReply(
        `💬 <b>${escapeHtml(targetPatient.fullName)}</b> bilan chat\n` +
          (preview ? `\n<i>Oxirgi xabarlar:</i>\n${preview}\n` : "") +
          `\nJavobingizni yozing (bekor qilish uchun /cancel):`,
        [[{ text: "📱 Mini Appda ko'rish", webAppUrl: getTelegramMiniAppUrl() }]]
      );
    }
  } else if (
    nextFlowState === "DOC_DM_REPLY" &&
    rawText &&
    draft.patientId &&
    (linkedUser?.role === "FAMILY_MD" || linkedUser?.role === "OVABMU_MD")
  ) {
    const targetPatient = await prisma.patient.findUnique({ where: { id: draft.patientId } });
    if (!targetPatient) {
      setIdleWithMenu();
    } else {
      const latestComp = await prisma.complaint.findFirst({
        where: { patientId: targetPatient.id },
        orderBy: { createdAt: "desc" },
      });
      await prisma.directMessage.create({
        data: {
          complaintId: latestComp?.id || null,
          patientId: targetPatient.id,
          senderUserId: linkedUser.id,
          senderName: linkedUser.fullName,
          senderRole: linkedUser.role,
          recipientUserId: targetPatient.userId || null,
          body: rawText,
          channel: "TELEGRAM",
        },
      });
      if (targetPatient.userId) {
        await notifyUserViaTelegram(
          targetPatient.userId,
          `🩺 <b>${escapeHtml(linkedUser.fullName)} javob berdi:</b>\n\n"${escapeHtml(rawText)}"`,
          [
            [{ text: "💬 Javob yozish", callbackData: "PATIENT:DM_START" }],
            [{ text: "📱 Mini Appda ochish", webAppUrl: getTelegramMiniAppUrl() }],
          ]
        );
      }
      nextFlowState = "IDLE";
      draft = {};
      reply = makeBotReply(
        `✅ Xabaringiz <b>${escapeHtml(targetPatient.fullName)}</b> bemorga yuborildi!`,
        [
          [{ text: "✍️ Yana xabar yozish", callbackData: `DOC_DM_PATIENT:${targetPatient.id}` }],
          [{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
        ]
      );
    }
  }
  // ==================== SUBSCRIPTIONS ====================
  else if (
    (callbackData === "MENU:SUBSCRIPTIONS" || rawText === "/subscription") &&
    linkedUser
  ) {
    if (linkedUser.role !== "PATIENT") {
      reply = makeBotReply(
        `ℹ️ <b>Shifokor va hamshira hisoblari bepul</b>\n\nOnaCare tizimida shifokorlar va hamshiralar uchun barcha klinik imkoniyatlar (GPS qidiruv, tashriflar nazorati, Telegram eslatmalar) bepul taqdim etiladi. Pullik obuna talab qilinmaydi.`,
        [[{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }]]
      );
    } else {
      reply = makeBotReply(
        `💎 <b>Bemor Obunalari</b>\nHozirgi rejangiz: <b>${linkedUser.subscriptionTier}</b>\n\n• <b>CARE_PLUS</b> — 49,000 UZS/oy (Tezkor GPS shifokor + Telegram maslahat)\n• <b>CARE_FAMILY</b> — 99,000 UZS/oy (24/7 Oila VIP)`,
        [
          [
            { text: "💎 CARE_PLUS faollashtirish", callbackData: "BUY_PLAN:CARE_PLUS" },
            { text: "👨‍👩‍👧 CARE_FAMILY", callbackData: "BUY_PLAN:CARE_FAMILY" },
          ],
          [{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
        ]
      );
    }
  } else if (callbackData.startsWith("BUY_PLAN:") && linkedUser) {
    const planCode = callbackData.split(":")[1];
    const plan = getPlanByCode(planCode);
    if (linkedUser.role !== "PATIENT") {
      reply = makeBotReply(
        `ℹ️ Shifokor va hamshira hisoblari bepul — pullik obuna talab qilinmaydi.`,
        [[{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }]]
      );
    } else if (!plan || plan.targetRole !== "PATIENT") {
      setIdleWithMenu();
    } else {
      const expiresAt = new Date(Date.now() + 30 * 86400000);
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: linkedUser.id },
          data: {
            subscriptionTier: plan.code,
            subscriptionStatus: plan.priceUzs > 0 ? "ACTIVE" : "NONE",
            subscriptionExpiresAt: expiresAt,
          },
        });
        if (linkedUser.patientProfile) {
          await tx.patient.update({
            where: { id: linkedUser.patientProfile.id },
            data: {
              subscriptionTier: plan.code,
              subscriptionStatus: plan.priceUzs > 0 ? "ACTIVE" : "NONE",
              subscriptionExpiresAt: expiresAt,
            },
          });
        }
        await tx.subscriptionRecord.create({
          data: {
            userId: linkedUser.id,
            targetRole: "PATIENT",
            planCode: plan.code,
            planName: plan.nameUz,
            priceUzs: plan.priceUzs,
            paymentMethod: "PAYME",
            status: "ACTIVE",
            expiresAt,
          },
        });
      });
      linkedUser = await prisma.user.findUnique({
        where: { id: linkedUser.id },
        include: { patientProfile: true },
      });
      reply = makeBotReply(
        `✅ <b>Obuna faollashtirildi!</b>\nReja: <b>${plan.nameUz}</b> (${formatUzs(plan.priceUzs)})\nAmal qilish muddati: ${expiresAt.toISOString().slice(0, 10)}`,
        [[{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }]]
      );
    }
  }
  // ==================== DAILY WELLBEING CHECK-IN (/checkin) ====================
  else if (
    (rawText === "/checkin" || callbackData === "PATIENT:CHECKIN") &&
    linkedUser?.role === "PATIENT" &&
    linkedUser.verificationStatus === "VERIFIED"
  ) {
    nextFlowState = "WELLBEING_MOOD";
    draft = {};
    reply = makeBotReply(
      "🧠 <b>Kundalik ruhiy va jismoniy holat check-in</b>\n\n" +
        "Bugun o'zingizni qanday his qilyapsiz? 1 ta emoji tugmasini bosing:",
      [
        [
          { text: "😢", callbackData: "WELLBEING_MOOD:1" },
          { text: "😕", callbackData: "WELLBEING_MOOD:2" },
          { text: "😐", callbackData: "WELLBEING_MOOD:3" },
          { text: "🙂", callbackData: "WELLBEING_MOOD:4" },
          { text: "😊", callbackData: "WELLBEING_MOOD:5" },
        ],
        [{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
      ]
    );
  } else if (callbackData.startsWith("WELLBEING_MOOD:") && linkedUser?.role === "PATIENT") {
    const mood = Math.max(1, Math.min(5, Number(callbackData.split(":")[1]) || 3));
    draft = { mood };
    nextFlowState = "WELLBEING_MOTHER";
    reply = makeBotReply(
      `Kayfiyat belgilandi (${mood}/5).\n\n🩺 <b>O'zingizning jismoniy holatingiz qanday?</b> (og'riq, qon ketish yoki isitma bormi?)`,
      [
        [{ text: "✅ Yaxshi, xavfli belgi yo'q", callbackData: "WELLBEING_MOTHER:OK" }],
        [{ text: "⚠️ Biroz og'riq / holsizlik", callbackData: "WELLBEING_MOTHER:MILD" }],
        [{ text: "🚨 Kuchli og'riq / Qon / Isitma", callbackData: "WELLBEING_MOTHER:RED" }],
      ]
    );
  } else if (nextFlowState === "WELLBEING_MOTHER" && callbackData.startsWith("WELLBEING_MOTHER:")) {
    const mFlag = callbackData.split(":")[1] || "OK";
    draft.motherStatus = mFlag;
    nextFlowState = "WELLBEING_BABY";
    reply = makeBotReply(
      "👶 <b>Chaqaloq holati qanday?</b> (emishi, uyqusi, harorati)",
      [
        [{ text: "✅ Yaxshi emyapti va tinch", callbackData: "WELLBEING_BABY:OK" }],
        [{ text: "⚠️ Kamroq emyapti / sariqlik", callbackData: "WELLBEING_BABY:YELLOW" }],
        [{ text: "🚨 Emmayapti / Yuqori isitma", callbackData: "WELLBEING_BABY:RED" }],
      ]
    );
  } else if (nextFlowState === "WELLBEING_BABY" && callbackData.startsWith("WELLBEING_BABY:") && linkedUser?.patientProfile) {
    const bFlag = callbackData.split(":")[1] || "OK";
    const patient = linkedUser.patientProfile;
    const answers = {
      motherPain: draft.motherStatus === "RED" ? "severe" : draft.motherStatus === "MILD" ? "mild" : "none",
      motherBleeding: draft.motherStatus === "RED" ? "heavy" : "normal",
      motherFever: draft.motherStatus === "RED",
      newbornFeeding: bFlag === "RED" ? "refusing" : bFlag === "YELLOW" ? "less" : "good",
      newbornJaundice: bFlag === "YELLOW",
      newbornTempHigh: bFlag === "RED",
    };

    const recent = await prisma.wellbeingCheckin.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: "desc" },
      take: 14,
    });
    const evaluation = evaluateWellbeingSignals({
      mood: draft.mood || 3,
      answers,
      recentCheckins: recent,
    });
    const dateStr = getTashkentDateString();
    const checkin = await prisma.wellbeingCheckin.create({
      data: {
        patientId: patient.id,
        date: dateStr,
        mood: draft.mood || 3,
        answersJson: JSON.stringify(answers),
        riskFlag: evaluation.riskFlag,
        source: "TELEGRAM",
      },
    });
    await triggerWellbeingRiskAlerts({
      patient,
      checkin,
      evaluation,
      notifyUserViaTelegram,
      notifyAdminsViaTelegram,
    });

    nextFlowState = "IDLE";
    draft = {};
    const miniAppUrl = getTelegramMiniAppUrl();

    if (evaluation.hasPhysicalRedFlag) {
      reply = makeBotReply(
        `🚨 <b>DIQQAT! Xavfli jismoniy belgi qayd etildi.</b>\n\n` +
          `• Agar ahvolingiz shoshilinch bo'lsa, darhol <b>103</b> tez yordamiga qo'ng'iroq qiling!\n` +
          `• Oilaviy shifokoringiz Telegram orqali xabardor qilindi.`,
        [
          [{ text: "🚨 Shikoyat / Qabul yuborish", callbackData: "PATIENT:NEW_COMPLAINT" }],
          [{ text: "📱 Kabinetni ochish", webAppUrl: miniAppUrl }],
        ]
      );
    } else if (evaluation.suggestPsychologist) {
      reply = makeBotReply(
        `💜 <b>Check-in saqlandi. O'zingizni ehtiyot qiling!</b>\n\n` +
          `Sizda so'nggi kunlarda kayfiyat pasayishi kuzatildi. Shaxsiy perinatal psixolog bilan bepul suhbat boshlashingiz mumkin.`,
        [
          [{ text: "📱 Kabinetda psixologga yozish", webAppUrl: miniAppUrl }],
          [{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
        ]
      );
    } else {
      reply = makeBotReply(
        `✅ <b>Bugungi holat check-in saqlandi (${dateStr})!</b>\nRahmat! Har kuni holatingizni belgilash shifokoringizga aniq yordam beradi.`,
        [
          [{ text: "📱 Kabinetni ochish", webAppUrl: miniAppUrl }],
          [{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
        ]
      );
    }
  }
  // ==================== MEDICATION REMINDERS (/dorilar) ====================
  else if (
    (rawText === "/dorilar" || callbackData === "PATIENT:MEDS") &&
    linkedUser?.role === "PATIENT" &&
    linkedUser.verificationStatus === "VERIFIED"
  ) {
    const patient = linkedUser.patientProfile;
    const rxs = patient
      ? await prisma.prescription.findMany({
          where: { patientId: patient.id, active: true },
          orderBy: { createdAt: "desc" },
          take: 6,
        })
      : [];
    const miniAppUrl = getTelegramMiniAppUrl();

    if (rxs.length === 0) {
      reply = makeBotReply("💊 Hozircha faol dorilar ro'yxati yo'q.", [
        [{ text: "📱 Kabinetni ochish", webAppUrl: miniAppUrl }],
        [{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }],
      ]);
    } else {
      const todayStr = getTashkentDateString();
      const lines = ["💊 <b>Bugungi faol dorilar va eslatma vaqtlari:</b>\n"];
      const btnRows = [];
      for (const rx of rxs) {
        const times = parseReminderTimesJson(rx.reminderTimesJson, rx.frequency);
        lines.push(
          `• <b>${escapeHtml(rx.medicationName)}</b> (${escapeHtml(rx.dosage)})\n` +
            `  🕒 Vaqtlar: <code>${times.join(", ") || rx.frequency}</code>`
        );
        btnRows.push([
          { text: `✅ Ichdim: ${rx.medicationName.slice(0, 18)}`, callbackData: `MED_LOG_NOW:${rx.id}` },
        ]);
      }
      btnRows.push([{ text: "📱 Vaqtlarni kabinetda tahrirlash", webAppUrl: miniAppUrl }]);
      btnRows.push([{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }]);
      lines.push(`\n📅 Bugungi sana: <code>${todayStr}</code>`);
      reply = makeBotReply(lines.join("\n"), btnRows);
    }
  } else if (callbackData.startsWith("MED_LOG_NOW:") && linkedUser?.role === "PATIENT") {
    const rxId = callbackData.split(":")[1];
    const rx = await prisma.prescription.findUnique({
      where: { id: rxId },
      include: { patient: true },
    });
    if (!rx || rx.patient.userId !== linkedUser.id) {
      setIdleWithMenu();
    } else {
      const tashkent = getTashkentTimeParts();
      let logs = [];
      try {
        logs = JSON.parse(rx.adherenceLogsJson || "[]");
      } catch {
        logs = [];
      }
      const nextLogs = [{ date: `${tashkent.dateStr} ${tashkent.hhmm}`, taken: true, source: "TELEGRAM" }, ...logs];
      await prisma.prescription.update({
        where: { id: rx.id },
        data: { adherenceLogsJson: JSON.stringify(nextLogs) },
      });
      reply = makeBotReply(
        `✅ <b>${escapeHtml(rx.medicationName)}</b> qabul qilindi deb belgilandi (${tashkent.hhmm}). Barakalla!`,
        [[{ text: "💊 Barcha dorilar", callbackData: "PATIENT:MEDS" }, { text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }]]
      );
    }
  } else if (callbackData.startsWith("MED_TAKEN:") && linkedUser?.role === "PATIENT") {
    const logId = callbackData.split(":")[1];
    const log = await prisma.medReminderLog.findUnique({
      where: { id: logId },
      include: { prescription: { include: { patient: true } } },
    });
    if (!log || log.prescription?.patient?.userId !== linkedUser.id) {
      setIdleWithMenu();
    } else {
      const now = new Date();
      const tashkent = getTashkentTimeParts(now);
      let adherence = [];
      try {
        adherence = JSON.parse(log.prescription.adherenceLogsJson || "[]");
      } catch {
        adherence = [];
      }
      await prisma.$transaction([
        prisma.medReminderLog.update({
          where: { id: log.id },
          data: { status: "TAKEN", respondedAt: now, nextRemindAt: null },
        }),
        prisma.prescription.update({
          where: { id: log.prescriptionId },
          data: {
            adherenceLogsJson: JSON.stringify([
              { date: `${tashkent.dateStr} ${tashkent.hhmm}`, taken: true, source: "TELEGRAM_REMINDER" },
              ...adherence,
            ]),
          },
        }),
      ]);
      reply = makeBotReply(
        `✅ <b>${escapeHtml(log.prescription.medicationName)}</b> (${log.prescription.dosage}) qabul qilindi deb belgilandi!`,
        [[{ text: "💊 Dorilarim", callbackData: "PATIENT:MEDS" }, { text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }]]
      );
    }
  } else if (callbackData.startsWith("MED_SNOOZE:") && linkedUser?.role === "PATIENT") {
    const logId = callbackData.split(":")[1];
    const log = await prisma.medReminderLog.findUnique({
      where: { id: logId },
      include: { prescription: { include: { patient: true } } },
    });
    if (!log || log.prescription?.patient?.userId !== linkedUser.id) {
      setIdleWithMenu();
    } else if (log.snoozeCount >= 2) {
      reply = makeBotReply(
        `⚠️ Ushbu doza allaqachon 2 marta kechiktirilgan. Iltimos dorini o'z vaqtida iching.`,
        [[{ text: "✅ Hozir ichdim", callbackData: `MED_TAKEN:${log.id}` }]]
      );
    } else {
      const nextRemindAt = new Date(Date.now() + 30 * 60000);
      await prisma.medReminderLog.update({
        where: { id: log.id },
        data: {
          status: "SNOOZED",
          snoozeCount: log.snoozeCount + 1,
          nextRemindAt,
          respondedAt: new Date(),
        },
      });
      reply = makeBotReply(
        `⏰ Tushunarli! <b>${escapeHtml(log.prescription.medicationName)}</b> eslatmasi 30 daqiqadan keyin qayta yuboriladi.`,
        [[{ text: "✅ Ichib bo'ldim", callbackData: `MED_TAKEN:${log.id}` }]]
      );
    }
  }
  // ==================== ADMIN IN TELEGRAM ====================
  else if (callbackData === "ADMIN:REMIND_ALL" && linkedUser?.role === "ADMIN_RECEPTION") {
    const rem = await sendDoctorVisitReminders();
    reply = makeBotReply(
      `⏰ <b>Eslatmalar yuborildi!</b>\nFaol tashrifi bor shifokorlar: ${rem.doctorsWithPendingVisits}\nTelegram orqali xabardor qilindi: ${rem.doctorsNotifiedOnTelegram}`,
      [[{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }]]
    );
  } else if (callbackData === "ADMIN:STATS" && linkedUser?.role === "ADMIN_RECEPTION") {
    const [pendingAccs, openComplaints, activeSubs] = await Promise.all([
      prisma.user.count({ where: { verificationStatus: "PENDING" } }),
      prisma.complaint.count({ where: { status: { not: "VERIFIED_COMPLETED" } } }),
      prisma.user.count({ where: { role: "PATIENT", subscriptionStatus: "ACTIVE" } }),
    ]);
    reply = makeBotReply(
      `📊 <b>OnaCare Jonli Holat</b>\n• Tasdiqlash kutilayotgan hisoblar: ${pendingAccs}\n• Ochiq shikoyatlar: ${openComplaints}\n• Faol obunalar: ${activeSubs}`,
      [[{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }]]
    );
  }
  // Sharing GPS location directly while IDLE
  else if (incomingLocation && linkedUser) {
    await prisma.user.update({
      where: { id: linkedUser.id },
      data: {
        latitude: incomingLocation.latitude,
        longitude: incomingLocation.longitude,
      },
    });
    if (linkedUser.patientProfile) {
      await prisma.patient.update({
        where: { id: linkedUser.patientProfile.id },
        data: {
          latitude: incomingLocation.latitude,
          longitude: incomingLocation.longitude,
        },
      });
    }
    reply = makeBotReply(
      `📍 GPS lokatsiyangiz saqlandi (${incomingLocation.latitude.toFixed(4)}, ${incomingLocation.longitude.toFixed(4)})!`,
      [[{ text: "🏠 Bosh menyu", callbackData: "MENU:HOME" }]]
    );
  } else {
    setIdleWithMenu();
  }

  history.push({
    id: `b-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    from: "bot",
    text: reply.text,
    buttons: reply.buttons,
    requestLocation: reply.requestLocation,
    requestContact: reply.requestContact,
    at: new Date().toISOString(),
  });

  await prisma.telegramSession.upsert({
    where: { chatId },
    update: {
      userId: linkedUser?.id || null,
      telegramUsername: tgUsername || session.telegramUsername,
      telegramFirstName: tgFirstName || session.telegramFirstName,
      flowState: nextFlowState,
      draftJson: JSON.stringify(draft),
      historyJson: JSON.stringify(history.slice(-40)),
    },
    create: {
      chatId,
      userId: linkedUser?.id || null,
      telegramUsername: tgUsername || session.telegramUsername,
      telegramFirstName: tgFirstName || session.telegramFirstName,
      flowState: nextFlowState,
      draftJson: JSON.stringify(draft),
      historyJson: JSON.stringify(history.slice(-40)),
    },
  });

  // Send live Telegram message if not dryRun and token is configured
  if (!dryRun) {
    const token = await getTelegramBotToken();
    if (token) {
      let replyMarkup = undefined;
      if (reply.requestLocation || reply.requestContact) {
        replyMarkup = {
          keyboard: [
            [
              reply.requestLocation
                ? { text: "📍 GPS Lokatsiyamni ulashish", request_location: true }
                : { text: "📱 Telefon raqamni ulashish", request_contact: true },
            ],
            [{ text: "❌ Bekor qilish" }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        };
      } else if (reply.buttons && reply.buttons.length > 0) {
        replyMarkup = {
          inline_keyboard: reply.buttons.map((row) =>
            row.map(mapTelegramInlineButton)
          ),
        };
      }
      if (rawText.startsWith("/start")) {
        await ensureTelegramMenuButton(token);
      }

      let deliveredAsVoice = false;
      if (voiceReplyPayload?.audioBuffer) {
        const voiceSendRes = await sendTelegramVoiceOrAudio(
          {
            chatId,
            audioBuffer: voiceReplyPayload.audioBuffer,
            filename: voiceReplyPayload.filename,
            contentType: voiceReplyPayload.contentType,
            caption: reply.text,
            replyMarkup,
            language: voiceReplyPayload.language,
          },
          token
        );
        deliveredAsVoice = Boolean(voiceSendRes?.ok);
      }

      if (!deliveredAsVoice) {
        await callTelegramApi(
          "sendMessage",
          {
            chat_id: chatId,
            text: reply.text,
            parse_mode: "HTML",
            ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
          },
          token
        );
      }

      if (callbackQuery?.id) {
        await callTelegramApi("answerCallbackQuery", { callback_query_id: callbackQuery.id }, token);
      }
    }
  }

  const replyWithAudio = voiceReplyPayload?.audioBuffer
    ? {
        ...reply,
        voiceReplyDataUrl: `data:${voiceReplyPayload.contentType};base64,${Buffer.from(
          voiceReplyPayload.audioBuffer
        ).toString("base64")}`,
        voiceReplyLang: voiceReplyPayload.language,
      }
    : reply;

  return {
    ok: true,
    chatId,
    flowState: nextFlowState,
    reply: replyWithAudio,
    history: history.slice(-40),
    linkedUser: linkedUser
      ? {
          id: linkedUser.id,
          fullName: linkedUser.fullName,
          role: linkedUser.role,
          verificationStatus: linkedUser.verificationStatus,
          subscriptionTier: linkedUser.subscriptionTier,
          latitude: linkedUser.latitude,
          longitude: linkedUser.longitude,
        }
      : null,
  };
}
