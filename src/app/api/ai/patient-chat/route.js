import { NextResponse } from "next/server";
import { getDatabaseConfigInfo, prisma } from "@/lib/db";
import { resolveActorAfterSeed } from "@/lib/rbac";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { parseReminderTimesJson } from "@/lib/wellbeing-catalog";

const CHAT_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    reply: {
      type: "STRING",
      description:
        "Clear, compassionate, concise maternal & newborn support answer in the user's active language.",
    },
    urgentAlert103: {
      type: "BOOLEAN",
      description:
        "True if the message mentions emergency warning signs (heavy bleeding, fever >=38C, severe headache/blurred vision, chest pain, breathing difficulty, newborn fever/refusal to feed/jaundice, or self-harm thoughts).",
    },
    suggestedQuestions: {
      type: "ARRAY",
      description: "Up to 3 helpful follow-up questions the patient might ask next.",
      items: { type: "STRING" },
    },
  },
  required: ["reply", "urgentAlert103"],
};

const RED_FLAG_PATTERNS = [
  /qon\s*ket/i,
  /ko['`’]?p\s*qon/i,
  /\bbleeding\b/i,
  /\bhemorrhage\b/i,
  /кровотечен/i,
  /isitma/i,
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
  /o['`’]?zimga\s*zarar/i,
  /o['`’]?lim/i,
  /\bself[\s-]*harm\b/i,
  /\bsuicid/i,
  /суицид/i,
  /hushidan/i,
  /sudorog/i,
  /судорог/i,
  /seizure/i,
  /chaqaloq\s*emmay/i,
  /refusing\s*(feed|milk)/i,
  /отказывается\s*от\s*(груди|еды)/i,
  /sarg['`’]?ay/i,
  /\bjaundice\b/i,
  /желтух/i,
];

function detectRedFlags(text) {
  const s = String(text || "");
  return RED_FLAG_PATTERNS.some((rx) => rx.test(s));
}

function getGeminiModelsToTry() {
  const configured = (process.env.GEMINI_MODEL || "gemini-3.5-flash").trim();
  return [...new Set([configured, "gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"].filter(Boolean))];
}

function parseJsonFromGeminiCandidate(text) {
  if (!text) return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
      try {
        return JSON.parse(fenced[1].trim());
      } catch {
        return null;
      }
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function buildSafePatientContextSummary(patient, lang) {
  if (!patient) {
    return "No linked patient profile found for this user yet.";
  }

  const meds = (patient.prescriptions || [])
    .filter((rx) => rx.active !== false)
    .map((rx) => {
      const times = parseReminderTimesJson(rx.reminderTimesJson, rx.frequency);
      const instr =
        lang === "ru"
          ? rx.instructionsRu
          : lang === "en"
            ? rx.instructionsEn
            : rx.instructionsUz;
      return `- ${rx.medicationName} (${rx.dosage}), ${rx.frequency}, ${rx.durationDays}d, times: ${times.join(", ") || "as directed"}, note: ${instr}`;
    });

  const activeCall = (patient.activeCalls || [])[0];
  const latestCheckin = (patient.wellbeingCheckins || [])[0];
  const recentLabs = (patient.labReports || []).map((l) => `- ${l.panelName} (${l.status})`);

  return [
    `Patient first name/profile district: ${patient.district || "Uzbekistan"}`,
    patient.deliveryDate ? `Delivery date: ${String(patient.deliveryDate).slice(0, 10)}` : null,
    patient.assignedFamilyDoctor
      ? `Assigned family doctor: ${patient.assignedFamilyDoctor.fullName}${patient.assignedFamilyDoctor.specialty ? ` (${patient.assignedFamilyDoctor.specialty})` : ""}`
      : "Assigned family doctor: Pending clinic assignment",
    activeCall
      ? `24h Home Visit status: ${activeCall.status}, window: ${new Date(activeCall.scheduledWindowStart).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} - ${new Date(activeCall.scheduledWindowEnd).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}, visit doctor: ${activeCall.assignedDoctor?.fullName || "Assigned doctor"}`
      : "24h Home Visit status: None scheduled yet",
    meds.length > 0 ? `Active prescribed medications:\n${meds.join("\n")}` : "Active prescribed medications: None currently prescribed",
    latestCheckin
      ? `Latest wellbeing check-in mood: ${latestCheckin.mood}/5, risk: ${latestCheckin.riskFlag}`
      : "Latest wellbeing check-in: None submitted yet",
    recentLabs.length > 0 ? `Recent lab panel names:\n${recentLabs.join("\n")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildFallbackReply({ message, patient, lang, urgentAlert103, mode }) {
  const lower = String(message || "").toLowerCase();
  const meds = (patient?.prescriptions || []).filter((rx) => rx.active !== false);
  const activeCall = (patient?.activeCalls || [])[0];
  const docName = patient?.assignedFamilyDoctor?.fullName || activeCall?.assignedDoctor?.fullName;

  if (urgentAlert103) {
    if (lang === "ru") {
      return {
        reply:
          "⚠️ Описанные симптомы могут требовать срочной медицинской помощи. Пожалуйста, немедленно позвоните на номер 103 или обратитесь в ближайшее приемное отделение.\n\nИИ-помощник не заменяет экстренный осмотр врача.",
        suggestedQuestions: [
          "Как подготовиться до приезда скорой помощи 103?",
          "Как написать моему закрепленному врачу?",
        ],
      };
    }
    if (lang === "en") {
      return {
        reply:
          "⚠️ The symptoms you mentioned may need urgent medical care. Please call emergency services (103) right away or go to the nearest hospital.\n\nThis AI assistant cannot handle emergencies or replace an in-person clinical exam.",
        suggestedQuestions: [
          "What should I tell the 103 emergency team?",
          "How do I contact my assigned family doctor?",
        ],
      };
    }
    return {
      reply:
        "⚠️ Siz yozgan belgilar shoshilinch tibbiy yordam talab qilishi mumkin. Iltimos, darhol 103 tez yordam raqamiga qo'ng'iroq qiling yoki eng yaqin shifoxonaga murojaat qiling.\n\nAI yordamchi shifokor ko'rigi va 103 tez yordam o'rnini bosa olmaydi.",
      suggestedQuestions: [
        "103 kelgunicha nimalarga e'tibor berishim kerak?",
        "Shifokorimga qanday xabar yuborsam bo'ladi?",
      ],
    };
  }

  const askingMeds =
    /dori|retsept|ichish|tablet|rx|medic|pill|лекарств|препарат|прием|таблет|@medications/i.test(lower);
  const askingVisit =
    /tashrif|uyga|shifokor|hamshira|otp|kod|visit|doctor|nurse|визит|врач|медсестр|@visit/i.test(lower);
  const askingWellbeing =
    /kayfiyat|epds|psix|chaqaloq|emiz|mood|baby|feed|настроен|малыш|кормл|@checkins/i.test(lower);

  if (askingMeds) {
    if (meds.length > 0) {
      const list = meds
        .map((rx) => {
          const times = parseReminderTimesJson(rx.reminderTimesJson, rx.frequency).join(", ");
          const instr =
            lang === "ru" ? rx.instructionsRu : lang === "en" ? rx.instructionsEn : rx.instructionsUz;
          return `• ${rx.medicationName} (${rx.dosage}) — ${rx.frequency}${times ? ` [${times}]` : ""}${instr ? ` — ${instr}` : ""}`;
        })
        .join("\n");

      if (lang === "ru") {
        return {
          reply: `Ваши актуальные назначения в OnaCare:\n${list}\n\nНе меняйте дозировку самостоятельно; при вопросах напишите врачу во вкладке «Кабинет».`,
          suggestedQuestions: [
            "Как включить напоминания о лекарствах в Telegram?",
            "Что делать, если я пропустила прием?",
          ],
        };
      }
      if (lang === "en") {
        return {
          reply: `Here are your active OnaCare prescriptions:\n${list}\n\nNever adjust doses without consulting your doctor; message them in the Dashboard tab if side effects occur.`,
          suggestedQuestions: [
            "How do Telegram medication reminders work?",
            "What if I miss a scheduled dose?",
          ],
        };
      }
      return {
        reply: `OnaCare kabinetingizdagi faol dorilar ro'yxati:\n${list}\n\nDoza yoki ichish tartibini o'zgartirishdan oldin albatta shifokoringiz bilan maslahatlashing.`,
        suggestedQuestions: [
          "Telegram eslatma vaqtlarini qanday sozlayman?",
          "Dori ichish vaqtini o'tkazib yuborsam nima qilay?",
        ],
      };
    }

    return {
      reply:
        lang === "ru"
          ? "В вашей карте пока нет активных рецептов. Когда семейный врач или врач роддома добавит препарат, он сразу появится в разделе лекарств и в Telegram."
          : lang === "en"
            ? "You have no active prescriptions listed yet. Once your doctor or nurse prescribes a medication, it will appear in Your Medicines and sync with Telegram reminders."
            : "Hozircha sizga yozilgan faol dorilar yo'q. Shifokoringiz yoki hamshirangiz dori qo'shganda, u kabinetingizda va Telegramda darhol ko'rinadi.",
      suggestedQuestions: [
        lang === "ru" ? "Когда придет врач на визит?" : lang === "en" ? "When is my home visit?" : "Uy tashrifi qachon bo'ladi?",
      ],
    };
  }

  if (askingVisit) {
    if (activeCall) {
      const wStart = new Date(activeCall.scheduledWindowStart).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const wEnd = new Date(activeCall.scheduledWindowEnd).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        reply:
          lang === "ru"
            ? `Ваш 24-часовой визит на дом запланирован на ${wStart}–${wEnd}. Назначенный специалист: ${docName || "Семейный врач"}. После осмотра назовите 4-значный OTP-код из кабинета.`
            : lang === "en"
              ? `Your 24-hour home visit is scheduled between ${wStart} and ${wEnd} with ${docName || "your assigned family doctor"}. Share the 4-digit OTP code in your Dashboard to verify arrival.`
              : `Sizning 24 soatlik uy tashrifingiz ${wStart}–${wEnd} oralig'ida belgilangan. Mas'ul shifokor: ${docName || "Oilaviy shifokor"}. Shifokor kelgach kabinetdagi 4 xonali OTP kodni ko'rsating.`,
        suggestedQuestions: [
          lang === "ru" ? "Какие лекарства мне назначены?" : lang === "en" ? "Show my active medicines" : "Menga qanday dorilar yozilgan?",
        ],
      };
    }

    return {
      reply:
        lang === "ru"
          ? `${docName ? `Ваш закрепленный врач: ${docName}. ` : ""}Вы можете написать врачу или медсестре прямо из вкладки «Кабинет» либо через Telegram-бот.`
          : lang === "en"
            ? `${docName ? `Your assigned doctor is ${docName}. ` : ""}You can message your doctor or nurse anytime from the Dashboard chat or Telegram bot.`
            : `${docName ? `Sizga biriktirilgan shifokor: ${docName}. ` : ""}Shifokor yoki hamshirangizga kabinetdagi chat yoki Telegram bot orqali istalgan vaqtda yozishingiz mumkin.`,
      suggestedQuestions: [],
    };
  }

  if (askingWellbeing) {
    return {
      reply:
        lang === "ru"
          ? "Ежедневная проверка самочувствия и опросник EPDS помогают вовремя заметить усталость, боль или послеродовую тревожность. Если настроение снижено более 2 недель, обратитесь к семейному врачу или перинатальному психологу в вашем кабинете."
          : lang === "en"
            ? "Daily mood check-ins and the weekly EPDS screening help spot fatigue or postpartum stress early. You can log today's check-in or book a confidential session with a perinatal psychologist in the Dashboard tab."
            : "Kunlik holat tekshiruvi va haftalik EPDS skriningi charchoq yoki tug'ruqdan keyingi stressni erta aniqlashga yordam beradi. Kabinet bo'limida bugungi holatingizni belgilashingiz yoki psixolog bilan maxfiy suhbat band qilishingiz mumkin.",
      suggestedQuestions: [
        lang === "ru" ? "Как записаться к психологу?" : lang === "en" ? "How do I book a psychologist session?" : "Psixolog bilan suhbatga qanday yozilaman?",
      ],
    };
  }

  const modeHintUz =
    mode === "Plan"
      ? "Bugungi parvarish rejasi: 1) Kunlik kayfiyat check-in topshiring; 2) Dorilarni vaqtida ichib 'Ichdim' tugmasini bosing; 3) Isitma 38°C+, kuchli qon ketishi yoki bosh og'rig'ida darhol 103 ga murojaat qiling."
      : "Tug'ruqdan keyingi parvarish, dorilar jadvali, uy tashrifi va chaqaloq parvarishi bo'yicha istalgan savolingizni berishingiz mumkin. Zarurat bo'lsa @medications yoki @visit teglaridan foydalaning.";

  if (lang === "ru") {
    return {
      reply:
        mode === "Plan"
          ? "План на сегодня: 1) Заполните ежедневный чек-ин самочувствия; 2) Принимайте назначенные лекарства по расписанию; 3) При температуре 38°C+, сильном кровотечении или резкой боли сразу звоните 103."
          : "Я ваш помощник OnaCare. Вы можете спросить о ваших лекарствах, графике домашнего визита, ежедневном чек-ине или уходе после родов.",
      suggestedQuestions: [
        "Какие лекарства мне сейчас назначены?",
        "Когда у меня домашний визит врача?",
        "При каких симптомах срочно вызывать 103?",
      ],
    };
  }
  if (lang === "en") {
    return {
      reply:
        mode === "Plan"
          ? "Today's recovery plan: 1) Complete your 30-second wellbeing check-in; 2) Follow your prescribed medication schedule; 3) Call 103 immediately for fever 38°C+, heavy bleeding, or severe headache/vision changes."
          : "I'm your OnaCare patient assistant. Ask me about your prescribed medicines, upcoming home visit, postpartum care, or newborn feeding.",
      suggestedQuestions: [
        "Show my active prescriptions",
        "When is my next doctor visit?",
        "What warning signs require calling 103?",
      ],
    };
  }

  return {
    reply: modeHintUz,
    suggestedQuestions: [
      "Menga yozilgan dorilar va vaqtlari qanday?",
      "Shifokorim va uy tashrifim haqida ma'lumot bering",
      "Qaysi belgilarda darhol 103 ga qo'ng'iroq qilish kerak?",
    ],
  };
}

export async function POST(req) {
  try {
    const actor = await resolveActorAfterSeed(req);
    if (!actor) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const clientIp = getClientIp(req);
    const rate = checkRateLimit({
      key: `ai-patient-chat:${clientIp}:${actor.userId}`,
      limit: 30,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const message = String(body.message || body.prompt || "").trim().slice(0, 2500);
    const lang = body.lang === "ru" || body.lang === "en" ? body.lang : "uz";
    const mode = body.mode === "Plan" || body.mode === "Build" ? body.mode : "Ask";
    const effort = ["Low", "Medium", "High", "Max"].includes(body.effort) ? body.effort : "High";
    const attachedFiles = Array.isArray(body.attachedFiles)
      ? body.attachedFiles.map((f) => String(f).slice(0, 120)).slice(0, 5)
      : [];
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

    if (!message && attachedFiles.length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const urgentAlert103 = detectRedFlags(message);

    let patient = null;
    if (getDatabaseConfigInfo().isPostgres) {
      patient = await prisma.patient.findFirst({
        where: { userId: actor.userId },
        include: {
          assignedFamilyDoctor: {
            select: { fullName: true, specialty: true, district: true },
          },
          prescriptions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          activeCalls: {
            orderBy: { createdAt: "desc" },
            take: 2,
            include: {
              assignedDoctor: { select: { fullName: true, specialty: true } },
            },
          },
          wellbeingCheckins: {
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { mood: true, epdsScore: true, riskFlag: true, createdAt: true },
          },
          labReports: {
            orderBy: { reportedAt: "desc" },
            take: 3,
            select: { panelName: true, status: true },
          },
        },
      });
    }

    const apiKey = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      ""
    ).trim();

    if (apiKey) {
      const langName =
        lang === "ru" ? "Russian" : lang === "en" ? "English" : "Uzbek (Latin script)";
      const patientContext = buildSafePatientContextSummary(patient, lang);

      const systemText = [
        "You are OnaCare AI Health Assistant inside a maternal & postpartum patient portal in Uzbekistan.",
        `Respond clearly, empathetically, and safely in ${langName} (matching the user's language).`,
        `Selected composer mode: ${mode} (Ask = concise direct answer; Plan = step-by-step daily recovery plan; Build = structured checklist or questions for their doctor).`,
        `Reasoning effort requested: ${effort}.`,
        "",
        "PATIENT CARE CONTEXT (use accurately if relevant, never invent prescriptions or test results):",
        patientContext,
        attachedFiles.length > 0 ? `User attached file names (metadata only): ${attachedFiles.join(", ")}` : "",
        "",
        "SAFETY RULES:",
        "- NEVER prescribe new prescription drugs or change prescribed doses; advise confirming dose changes with their assigned doctor.",
        "- If urgent symptoms or red flags appear (heavy bleeding, fever >=38C, severe headache/blurred vision, chest pain, breathing trouble, seizures, newborn fever/jaundice/refusal to feed, self-harm thoughts), set urgentAlert103=true and advise calling 103 emergency services immediately.",
        "- Keep replies helpful, well-structured, and under 180 words unless Plan/Build mode requests a short checklist.",
      ]
        .filter(Boolean)
        .join("\n");

      const turns = [];
      for (const h of history) {
        if (!h || typeof h.text !== "string" || !h.text.trim()) continue;
        const r = h.sender === "user" ? "user" : "model";
        const prev = turns[turns.length - 1];
        if (turns.length === 0 && r !== "user") continue;
        if (prev && prev.role === r) {
          prev.parts[0].text += `\n${h.text.trim().slice(0, 1000)}`;
        } else {
          turns.push({ role: r, parts: [{ text: h.text.trim().slice(0, 1000) }] });
        }
      }

      const finalUserText = message || `Please review my attached files: ${attachedFiles.join(", ")}`;
      if (turns.length > 0 && turns[turns.length - 1].role === "user") {
        turns[turns.length - 1].parts[0].text += `\n${finalUserText}`;
      } else {
        turns.push({ role: "user", parts: [{ text: finalUserText }] });
      }

      const payload = {
        systemInstruction: { parts: [{ text: systemText }] },
        contents: turns,
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 700,
          responseMimeType: "application/json",
          responseSchema: CHAT_RESPONSE_SCHEMA,
        },
      };

      const modelsToTry = getGeminiModelsToTry();
      for (const model of modelsToTry) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 14_000);
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
            model
          )}:generateContent`;
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          if (!res.ok) {
            if (res.status === 404 || res.status === 400 || res.status === 503) {
              continue;
            }
            break;
          }
          const json = await res.json();
          const parts = json?.candidates?.[0]?.content?.parts || [];
          const textPart = parts.find((p) => typeof p?.text === "string" && !p?.thought) || parts[0];
          const parsed = parseJsonFromGeminiCandidate(textPart?.text || "");
          if (parsed && typeof parsed.reply === "string" && parsed.reply.trim()) {
            const suggestedQuestions = Array.isArray(parsed.suggestedQuestions)
              ? parsed.suggestedQuestions
                  .filter((q) => typeof q === "string" && q.trim())
                  .slice(0, 3)
              : [];
            return NextResponse.json({
              ok: true,
              reply: parsed.reply.trim(),
              urgentAlert103: urgentAlert103 || Boolean(parsed.urgentAlert103),
              suggestedQuestions,
              provider: "gemini",
              modelUsed: model,
            });
          }
        } catch {
          // Try next model or fallback
        } finally {
          clearTimeout(timer);
        }
      }
    }

    const fallback = buildFallbackReply({
      message,
      patient,
      lang,
      urgentAlert103,
      mode,
    });

    return NextResponse.json({
      ok: true,
      reply: fallback.reply,
      urgentAlert103,
      suggestedQuestions: fallback.suggestedQuestions,
      provider: "fallback",
      modelUsed: "onacare-care-fallback",
    });
  } catch (error) {
    console.error("POST /api/ai/patient-chat error:", error);
    return NextResponse.json({ error: "Failed to process AI chat message" }, { status: 500 });
  }
}
