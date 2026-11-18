import { UZ_REGIONS } from "@/lib/uz-locations";
import { parseReminderTimesJson } from "@/lib/wellbeing-catalog";
import { normalizeVoiceLang } from "@/lib/voicelab";

const VOICE_INTENT_SCHEMA = {
  type: "OBJECT",
  properties: {
    intent: {
      type: "STRING",
      description:
        "Choose SIGNUP (user wants to register or is giving name/phone/district/email while unlinked or in signup flow), ILLNESS_REPORT (mother reports pain, fever, bleeding, headache, baby symptoms, or wants a doctor visit/complaint), WELLBEING_CHECKIN (daily mood, pain, baby feeding update), or GENERAL_QUESTION (asking about medications, home visit, recovery, breastfeeding, OnaCare).",
    },
    detectedLanguage: {
      type: "STRING",
      description: "uz, ru, or en matching the user's spoken transcript.",
    },
    urgentEmergency103: {
      type: "BOOLEAN",
      description:
        "True if transcript mentions severe bleeding, fever >= 38C, severe headache/blurred vision, chest pain, trouble breathing, seizure, baby refusing to feed, or self-harm.",
    },
    replyText: {
      type: "STRING",
      description:
        "Warm, clear, spoken-friendly reply in detectedLanguage (max 750 chars, plain text without HTML or markdown). For GENERAL_QUESTION, answer directly and kindly. For SIGNUP/ILLNESS_REPORT/WELLBEING_CHECKIN, briefly confirm what was understood.",
    },
    signupFields: {
      type: "OBJECT",
      properties: {
        role: { type: "STRING", description: "PATIENT, FAMILY_MD, or OVABMU_MD if mentioned" },
        fullName: { type: "STRING" },
        dateOfBirth: { type: "STRING", description: "YYYY-MM-DD if stated" },
        phone: { type: "STRING" },
        region: { type: "STRING" },
        district: { type: "STRING" },
        mahalla: { type: "STRING" },
        email: { type: "STRING" },
      },
    },
    illnessFields: {
      type: "OBJECT",
      properties: {
        category: {
          type: "STRING",
          description: "POSTPARTUM, CARDIO, PEDIATRIC, EMERGENCY, or GENERAL",
        },
        severity: {
          type: "STRING",
          description: "MILD, MODERATE, SEVERE, or CRITICAL",
        },
        visitDestination: {
          type: "STRING",
          description: "HOME, CURRENT_GPS, RELATIVE_HOME, CLINIC, or CUSTOM",
        },
        visitAddress: { type: "STRING" },
        description: { type: "STRING" },
      },
    },
    wellbeingFields: {
      type: "OBJECT",
      properties: {
        mood: { type: "INTEGER", description: "1 (very sad) to 5 (happy)" },
        motherPain: { type: "STRING", description: "none, mild, or severe" },
        motherBleeding: { type: "STRING", description: "normal or heavy" },
        motherFever: { type: "BOOLEAN" },
        newbornFeeding: { type: "STRING", description: "good, less, or refusing" },
        newbornJaundice: { type: "BOOLEAN" },
        newbornTempHigh: { type: "BOOLEAN" },
      },
    },
  },
  required: ["intent", "detectedLanguage", "urgentEmergency103", "replyText"],
};

const RED_FLAG_PATTERNS = [
  /qon\s*ket/i,
  /ko['`’]?p\s*qon/i,
  /\bbleeding\b/i,
  /\bhemorrhage\b/i,
  /кровотечен/i,
  /isitma/i,
  /harorat/i,
  /температур/i,
  /\bfever\b/i,
  /\b(38|39|40)\b/,
  /bosh\s*og['`’]?riq/i,
  /ko['`’]?z\s*xira/i,
  /blurred\s*vision/i,
  /сильн\w*\s*головн/i,
  /nafas\s*(olish|qis)/i,
  /shortness\s*of\s*breath/i,
  /задыха/i,
  /ko['`’]?krak\s*og['`’]?ri/i,
  /chest\s*pain/i,
  /боль\s*в\s*груди/i,
  /hushidan/i,
  /sudorog/i,
  /судорог/i,
  /seizure/i,
  /chaqaloq\s*emmay/i,
  /emmayapti/i,
  /refusing\s*(feed|milk)/i,
  /отказывается\s*от\s*(груди|еды)/i,
  /sarg['`’]?ay/i,
  /\bjaundice\b/i,
  /желтух/i,
  /o['`’]?zimga\s*zarar/i,
  /\bsuicid/i,
  /суицид/i,
];

export function detectVoiceRedFlags(text) {
  const s = String(text || "");
  return RED_FLAG_PATTERNS.some((rx) => rx.test(s));
}

export function detectLanguageFromTranscript(text, fallback = "uz") {
  const s = String(text || "");
  if (/[а-яёА-ЯЁ]/.test(s)) {
    // Distinguish Uzbek Cyrillic from Russian
    if (/[ўқғҳЎҚҒҲ]/.test(s)) return "uz";
    return "ru";
  }
  if (/\b(hello|please|doctor|baby|fever|bleeding|medicine|pain|register|sign\s*up|help)\b/i.test(s)) {
    return "en";
  }
  return normalizeVoiceLang(fallback);
}

function buildSafePatientSummary(linkedUser) {
  const patient = linkedUser?.patientProfile;
  if (!patient) {
    return "User is not registered as a verified patient yet.";
  }

  const meds = (patient.prescriptions || [])
    .filter((rx) => rx.active !== false)
    .slice(0, 6)
    .map((rx) => {
      const times = parseReminderTimesJson(rx.reminderTimesJson, rx.frequency);
      return `- ${rx.medicationName} (${rx.dosage}), ${rx.frequency}, times: ${times.join(", ") || "as directed"}`;
    });

  const activeCall = Array.isArray(patient.activeCalls) ? patient.activeCalls[0] : null;
  const docName =
    patient.assignedFamilyDoctor?.fullName ||
    activeCall?.assignedDoctor?.fullName ||
    "Regional family doctor";

  return [
    `Patient: ${patient.fullName}, District: ${patient.district}, Polyclinic: ${patient.polyclinicName || ""}`,
    `Assigned Doctor: ${docName}`,
    activeCall
      ? `24h Home Visit Status: ${activeCall.status}, Window: ${activeCall.visitWindowLabel || "Within 24h"}`
      : "No active 24h discharge call right now.",
    meds.length ? `Active Prescriptions:\n${meds.join("\n")}` : "No active prescriptions.",
  ].join("\n");
}

function buildDeterministicVoiceFallback({ transcript, flowState, linkedUser, preferredLang }) {
  const lang = detectLanguageFromTranscript(transcript, preferredLang);
  const lower = String(transcript || "").toLowerCase();
  const redFlag = detectVoiceRedFlags(transcript);
  const isSignupState = String(flowState || "").startsWith("SIGNUP_");

  const looksLikeSignup =
    isSignupState ||
    (!linkedUser &&
      /(ro['`’]?yxat|registr|sign\s*up|регистр|ismim|меня\s*зовут|my\s*name|telefon|phone|pochta|email)/i.test(lower));

  const looksLikeIllness =
    String(flowState || "").startsWith("COMPLAINT_") ||
    redFlag ||
    /(og['`’]?ri|kasal|isitma|harorat|qon|bosh|bosim|ko['`’]?ngil|chaqaloq|shikoyat|болит|температур|давлен|жалоб|ребен|pain|fever|sick|headache|symptom)/i.test(
      lower
    );

  const looksLikeCheckin =
    String(flowState || "").startsWith("WELLBEING_") ||
    /(kayfiyat|check-?in|настроен|самочувств|mood|feeling\s+good|yaxshiman)/i.test(lower);

  const phoneMatch = transcript.match(/(\+?998[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}|\b\d{9}\b)/);
  const emailMatch = transcript.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const matchedDistrict = UZ_REGIONS.flatMap((r) => r.districts.map((d) => ({ region: r.name, district: d }))).find((item) =>
    lower.includes(item.district.toLowerCase())
  );

  if (looksLikeSignup) {
    return {
      intent: "SIGNUP",
      detectedLanguage: lang,
      urgentEmergency103: false,
      replyText:
        lang === "ru"
          ? "Я распознала ваши регистрационные данные из голосового сообщения. Проверьте и подтвердите их ниже."
          : lang === "en"
            ? "I captured your sign-up details from your voice note. Please review and confirm below."
            : "Ovozli xabaringizdan ro'yxatdan o'tish ma'lumotlarini tushundim. Quyida tekshirib tasdiqlang.",
      signupFields: {
        ...(phoneMatch ? { phone: phoneMatch[0] } : {}),
        ...(emailMatch ? { email: emailMatch[0].toLowerCase() } : {}),
        ...(matchedDistrict ? { region: matchedDistrict.region, district: matchedDistrict.district } : {}),
      },
      illnessFields: {},
      wellbeingFields: {},
    };
  }

  if (looksLikeIllness && linkedUser?.role === "PATIENT") {
    return {
      intent: "ILLNESS_REPORT",
      detectedLanguage: lang,
      urgentEmergency103: redFlag,
      replyText: redFlag
        ? lang === "ru"
          ? "Внимание! Вы назвали тревожные симптомы. Если состояние острое, немедленно звоните 103. Подтвердите отправку жалобы врачу ниже."
          : lang === "en"
            ? "Urgent warning signs detected. Please call 103 immediately if this is an emergency. Confirm below to dispatch your report to your doctor."
            : "Diqqat! Xavfli belgilar aniqlandi. Holat shoshilinch bo'lsa darhol 103 ga qo'ng'iroq qiling. Shifokorga yuborishni quyida tasdiqlang."
        : lang === "ru"
          ? "Я поняла ваши симптомы и подготовила отчёт для вашего врача. Нажмите подтвердить ниже."
          : lang === "en"
            ? "I understood your symptoms and prepared a report for your doctor. Tap confirm below."
            : "Shikoyat va belgilaringizni tushundim va shifokor uchun tayyorladim. Quyida tasdiqlang.",
      signupFields: {},
      illnessFields: {
        category: /(chaqaloq|ребен|baby|newborn|emmay|sarg)/i.test(lower)
          ? "PEDIATRIC"
          : /(bosim|yurak|давлен|сердц|pressure|heart)/i.test(lower)
            ? "CARDIO"
            : redFlag
              ? "EMERGENCY"
              : "POSTPARTUM",
        severity: redFlag ? "CRITICAL" : "MODERATE",
        visitDestination: "HOME",
        description: transcript,
      },
      wellbeingFields: {},
    };
  }

  if (looksLikeCheckin && linkedUser?.role === "PATIENT") {
    return {
      intent: "WELLBEING_CHECKIN",
      detectedLanguage: lang,
      urgentEmergency103: redFlag,
      replyText:
        lang === "ru"
          ? "Я сохранила ваш ежедневный чек-ин из голосового сообщения. Подтвердите отправку ниже."
          : lang === "en"
            ? "I prepared your daily check-in from your voice message. Please confirm below."
            : "Kunlik holat check-in ma'lumotlaringizni ovozdan tayyorladim. Quyida tasdiqlang.",
      signupFields: {},
      illnessFields: {},
      wellbeingFields: {
        mood: redFlag ? 2 : 4,
        motherPain: redFlag ? "severe" : /(og['`’]?ri|болит|pain)/i.test(lower) ? "mild" : "none",
        motherBleeding: /(ko['`’]?p\s*qon|heavy\s*bleed|сильн\w*\s*кровотеч)/i.test(lower) ? "heavy" : "normal",
        motherFever: /(isitma|harorat|температур|fever)/i.test(lower),
        newbornFeeding: /(emmay|refusing|отказывается)/i.test(lower) ? "refusing" : "good",
        newbornJaundice: /(sarg['`’]?ay|желтух|jaundice)/i.test(lower),
        newbornTempHigh: /(chaqaloq.*isitma|baby.*fever)/i.test(lower),
      },
    };
  }

  return {
    intent: "GENERAL_QUESTION",
    detectedLanguage: lang,
    urgentEmergency103: redFlag,
    replyText: redFlag
      ? lang === "ru"
        ? "Внимание! При высокой температуре, сильном кровотечении или резкой боли немедленно звоните 103. Ваш семейный врач доступен через меню жалоб и прямого чата в OnaCare."
        : lang === "en"
          ? "Urgent notice: For fever, heavy bleeding, or severe pain, please call 103 right away and message your doctor in OnaCare."
          : "Diqqat! Kuchli qon ketishi, yuqori isitma yoki qattiq og'riq bo'lsa darhol 103 tez yordamiga qo'ng'iroq qiling va OnaCare orqali shifokoringizga yozing."
      : lang === "ru"
        ? "Я получила ваш голосовой вопрос. Вы можете посмотреть назначенные лекарства, график 24-часового визита врача и задать уточняющие вопросы прямо в мини-приложении OnaCare."
        : lang === "en"
          ? "I received your voice question. You can review your prescribed medications, 24-hour home visit schedule, and chat with your doctor in the OnaCare Mini App."
          : "Ovozli savolingizni qabul qildim. Sizga yozilgan dorilar, 24 soatlik shifokor tashrifi jadvali va shifokor bilan bevosita suhbatni OnaCare kabinetida ko'rishingiz mumkin.",
    signupFields: {},
    illnessFields: {},
    wellbeingFields: {},
  };
}

/**
 * Uses Gemini 3.5 Flash to reason over a VoiceLab STT transcript and classify intent,
 * extract signup/illness/wellbeing fields, or generate a concise voice-ready clinical guidance answer.
 */
export async function runVoiceIntentAssistant({
  transcript,
  flowState = "IDLE",
  linkedUser = null,
  draft = {},
  preferredLang = "uz",
}) {
  const cleanTranscript = String(transcript || "").trim();
  const detectedFallbackLang = detectLanguageFromTranscript(cleanTranscript, preferredLang);
  const apiKey = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    ""
  ).trim();

  if (!apiKey || !cleanTranscript) {
    return buildDeterministicVoiceFallback({
      transcript: cleanTranscript,
      flowState,
      linkedUser,
      preferredLang: detectedFallbackLang,
    });
  }

  const regionNames = UZ_REGIONS.map((r) => r.name).join(", ");
  const patientContext = buildSafePatientSummary(linkedUser);

  const systemPrompt = [
    "You are OnaCare AI Voice Triage & Onboarding Assistant on Telegram (powered by Gemini 3.5 Flash).",
    "A mother (or clinician) just sent a Telegram voice note that was transcribed by VoiceLab STT.",
    `Current Telegram bot flowState: ${flowState}`,
    `User linked status: ${linkedUser ? `${linkedUser.role} (${linkedUser.fullName})` : "UNLINKED_GUEST"}`,
    `Current draft state: ${JSON.stringify(draft || {})}`,
    `Patient clinical context:\n${patientContext}`,
    `Supported Uzbekistan regions: ${regionNames}`,
    "",
    "RULES:",
    "1. Detect spoken language accurately (`uz`, `ru`, or `en`) and write `replyText` in THAT language.",
    "2. Classify `intent` carefully:",
    "   - `SIGNUP`: If flowState starts with SIGNUP_, or user is UNLINKED_GUEST giving personal registration info (name, phone, district, DOB, email, patient/doctor role) or asking to register.",
    "   - `ILLNESS_REPORT`: If linked patient describes symptoms, illness, pain, bleeding, fever, blood pressure, newborn illness, or asks for a home visit/complaint.",
    "   - `WELLBEING_CHECKIN`: If linked patient is giving a routine daily mood/mother/baby wellbeing check-in without requesting an urgent complaint.",
    "   - `GENERAL_QUESTION`: If user asks a question about medications, doses, breastfeeding, postpartum recovery, 24h home visit, or how OnaCare works.",
    "3. Extract ONLY fields clearly spoken in the transcript—never fabricate phone numbers, emails, or addresses.",
    "4. Set `urgentEmergency103: true` for ANY postpartum or newborn red flag (heavy bleeding, fever >=38C, severe headache/blurred vision, chest pain, breathing trouble, seizures, baby refusing to feed, newborn jaundice, or self-harm).",
    "5. Keep `replyText` warm, natural, spoken-friendly plain text (NO HTML tags, NO markdown, NO emojis, max 700 chars) so VoiceLab TTS reads it clearly out loud.",
    "6. Never ask users to speak passwords aloud.",
  ].join("\n");

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [
      {
        role: "user",
        parts: [{ text: `Voice transcript:\n"${cleanTranscript}"` }],
      },
    ],
    generationConfig: {
      temperature: 0.25,
      maxOutputTokens: 700,
      responseMimeType: "application/json",
      responseSchema: VOICE_INTENT_SCHEMA,
    },
  };

  const configured = (process.env.GEMINI_MODEL || "").trim();
  const models = [
    ...new Set([configured, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite", "gemini-3.5-flash"].filter(Boolean)),
  ];

  for (const model of models) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 14_000);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );
      if (!res.ok) {
        continue;
      }
      const json = await res.json();
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const textPart = parts.find((p) => typeof p?.text === "string" && !p?.thought) || parts[0];
      const rawText = (textPart?.text || "").trim();
      let parsed = null;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const fenced = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
        const jsonCandidate = fenced?.[1] || (rawText.includes("{") ? rawText.slice(rawText.indexOf("{"), rawText.lastIndexOf("}") + 1) : "");
        if (jsonCandidate) {
          parsed = JSON.parse(jsonCandidate.trim());
        }
      }
      if (parsed && typeof parsed.replyText === "string") {
        const urgent = Boolean(parsed.urgentEmergency103) || detectVoiceRedFlags(cleanTranscript);
        return {
          modelUsed: model,
          intent: ["SIGNUP", "ILLNESS_REPORT", "WELLBEING_CHECKIN", "GENERAL_QUESTION"].includes(parsed.intent)
            ? parsed.intent
            : "GENERAL_QUESTION",
          detectedLanguage: normalizeVoiceLang(parsed.detectedLanguage || detectedFallbackLang),
          urgentEmergency103: urgent,
          replyText: parsed.replyText.trim(),
          signupFields: parsed.signupFields && typeof parsed.signupFields === "object" ? parsed.signupFields : {},
          illnessFields: parsed.illnessFields && typeof parsed.illnessFields === "object" ? parsed.illnessFields : {},
          wellbeingFields: parsed.wellbeingFields && typeof parsed.wellbeingFields === "object" ? parsed.wellbeingFields : {},
        };
      }
    } catch {
      // retry next model
    } finally {
      clearTimeout(timer);
    }
  }

  return buildDeterministicVoiceFallback({
    transcript: cleanTranscript,
    flowState,
    linkedUser,
    preferredLang: detectedFallbackLang,
  });
}
