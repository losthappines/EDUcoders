import { BLOOD_TYPE_OPTIONS, UZ_REGIONS } from "@/lib/uz-locations";
import { getNextStep } from "@/lib/ai-signup-helper";

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    reply: {
      type: "STRING",
      description:
        "Warm, concise assistant response in the active language answering any user question and asking for the next missing detail(s).",
    },
    answeredQuestion: {
      type: "BOOLEAN",
      description: "True if the user asked a question or requested clarification.",
    },
    extracted: {
      type: "OBJECT",
      description:
        "Only fields explicitly stated or corrected by the user in this turn. Omit any field not mentioned.",
      properties: {
        role: {
          type: "STRING",
          description: "For DOCTOR persona only: OVABMU_MD or FAMILY_MD",
        },
        fullName: { type: "STRING" },
        dateOfBirth: {
          type: "STRING",
          description: "ISO YYYY-MM-DD if known, else raw date string",
        },
        deliveryDate: {
          type: "STRING",
          description: "Optional baby delivery date YYYY-MM-DD for PATIENT mothers",
        },
        phone: { type: "STRING" },
        region: { type: "STRING" },
        district: { type: "STRING" },
        mahalla: { type: "STRING" },
        bloodType: { type: "STRING" },
        specialty: { type: "STRING" },
        expertiseArea: { type: "STRING" },
        experienceYears: { type: "STRING" },
        email: { type: "STRING" },
      },
    },
    suggestedChips: {
      type: "ARRAY",
      description: "Up to 4 helpful quick-reply options or follow-up FAQ chips.",
      items: {
        type: "OBJECT",
        properties: {
          label: { type: "STRING" },
          value: { type: "STRING" },
        },
        required: ["label", "value"],
      },
    },
  },
  required: ["reply", "answeredQuestion"],
};

function getMissingFieldsForDraft(draft) {
  const missing = [];
  if (draft.persona === "DOCTOR" && !draft.doctorTypePicked) missing.push("role (OVABMU_MD or FAMILY_MD)");
  if (!String(draft.fullName || "").trim()) missing.push("fullName");
  if (!String(draft.dateOfBirth || "").trim()) missing.push("dateOfBirth");
  if (!String(draft.phone || "").trim()) missing.push("phone");
  if (draft.persona === "DOCTOR" || draft.persona === "NURSE" || draft.persona === "PSYCHOLOGIST") {
    if (!String(draft.specialty || "").trim()) missing.push("specialty");
    if (!String(draft.expertiseArea || "").trim()) missing.push("expertiseArea");
    if (
      draft.experienceYears === "" ||
      draft.experienceYears === null ||
      draft.experienceYears === undefined
    ) {
      missing.push("experienceYears");
    }
  }
  if (!String(draft.district || "").trim()) missing.push("region & district");
  if (draft.persona === "PATIENT") {
    if (!String(draft.mahalla || "").trim()) missing.push("mahalla");
    if (!String(draft.bloodType || "").trim()) missing.push("bloodType (or 'I don't know')");
  }
  if (!String(draft.email || "").trim()) missing.push("email");
  if (!draft.hasPassword && !(typeof draft.password === "string" && draft.password.length >= 6)) {
    missing.push("password (client-side masked input)");
  }
  return missing;
}

function buildSystemPrompt({ draft, lang }) {
  const langName = lang === "ru" ? "Russian" : lang === "en" ? "English" : "Uzbek (Latin script)";
  const missing = getMissingFieldsForDraft(draft);
  const nextStep = getNextStep({
    ...draft,
    password: draft.hasPassword ? "******" : draft.password || "",
  });

  const safeDraftSummary = {
    persona: draft.persona,
    role: draft.role,
    doctorTypePicked: Boolean(draft.doctorTypePicked),
    fullName: draft.fullName || "",
    dateOfBirth: draft.dateOfBirth || "",
    deliveryDate: draft.deliveryDate || "",
    phone: draft.phone || "",
    region: draft.region || "",
    district: draft.district || "",
    mahalla: draft.mahalla || "",
    bloodType: draft.bloodType || "",
    specialty: draft.specialty || "",
    expertiseArea: draft.expertiseArea || "",
    experienceYears: draft.experienceYears ?? "",
    email: draft.email || "",
    hasGps: typeof draft.latitude === "number" && typeof draft.longitude === "number",
    hasPassword: Boolean(draft.hasPassword || (draft.password && draft.password.length >= 6)),
  };

  const regionNames = UZ_REGIONS.map((r) => r.name).join(", ");
  const bloodValues = BLOOD_TYPE_OPTIONS.map((b) => b.value).join(", ");

  return [
    "You are OnaCare AI Sign-Up & Information Assistant, powered by Gemini 3.5 Flash.",
    `Respond naturally in ${langName} (unless the user explicitly writes in Uzbek, Russian, or English — match their language when appropriate).`,
    "",
    "ABOUT ONACARE (facts you may share accurately when asked):",
    "- OnaCare coordinates free postpartum maternal & newborn home care in Uzbekistan: a 24-hour family clinic doctor/nurse visit after maternity discharge, daily wellbeing check-ins, EPDS screening, medication reminders via Telegram (@OnaCarePatronajBot), and direct advice chats.",
    "- Urgent emergencies are NEVER handled by AI chat — always advise calling 103 immediately for medical/self-harm emergencies.",
    "- Roles: PATIENT (Mother/Patient), DOCTOR (OVABMU_MD = Maternity Hospital Doctor, FAMILY_MD = Local Family Clinic Doctor), NURSE (Monitoring/Patronage Nurse), PSYCHOLOGIST (Perinatal Psychologist — emotional wellbeing & EPDS only, strictly isolated from clinical EHR/lab records and gated by patient PsychConsent), ADMIN_RECEPTION (Clinic Coordinator).",
    "- Verification & Security: JSHSHIR, clinical notes, and psychologist notes are encrypted with AES-256-GCM. New PATIENT, DOCTOR, NURSE, and PSYCHOLOGIST accounts wait for clinic administrator verification before sign-in; after signup, users get an instant Telegram bot link.",
    "- Location & GPS: District/region auto-matches the nearest polyclinic. Live GPS is optional (system uses district center coordinates if skipped).",
    `- Blood types accepted: ${bloodValues}. Users who don't know can choose "I don't know".`,
    `- Uzbekistan regions supported: ${regionNames}.`,
    "- For PATIENT mothers, deliveryDate (baby's birth date) is optional.",
    "",
    "CURRENT REGISTRATION STATE:",
    `Draft so far: ${JSON.stringify(safeDraftSummary)}`,
    `Next required step: ${nextStep}`,
    `Missing fields: ${missing.length ? missing.join(", ") : "NONE (all required fields filled!)"}`,
    "",
    "YOUR INSTRUCTIONS:",
    "1. Answer any question the user asked clearly, warmly, and concisely (2-4 short sentences max).",
    "2. Extract ALL registration fields mentioned or corrected in the user's message into `extracted`. Never fabricate or guess fields the user didn't provide.",
    "3. If missing fields remain (other than password), briefly confirm what was filled and kindly ask for the next 1-2 missing fields.",
    "4. NEVER ask the user to share their password inside regular question messages; if only password is missing, tell them to type a 6+ character password in the masked password input box below.",
    "5. If all fields including password are complete, congratulate them and remind them they can press 'Create Account' or keep asking questions.",
    "6. Return up to 4 concise `suggestedChips` helpful for the next step or common questions.",
  ].join("\n");
}

function getGeminiModelsToTry() {
  const configured = (process.env.GEMINI_MODEL || "gemini-3.5-flash").trim();
  const candidates = [configured, "gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"];
  return [...new Set(candidates.filter(Boolean))];
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

export async function runGeminiSignupAssistant({ message, draft, lang, history = [] }) {
  const apiKey = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    ""
  ).trim();

  if (!apiKey) {
    return { ok: false, reason: "NO_API_KEY" };
  }

  const systemInstruction = {
    parts: [{ text: buildSystemPrompt({ draft, lang }) }],
  };

  const rawTurns = Array.isArray(history)
    ? history
        .slice(-8)
        .filter((m) => m && typeof m.text === "string" && m.text.trim() && !/^[•]+$/.test(m.text.trim()))
        .map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          text: m.text.trim().slice(0, 1200),
        }))
    : [];

  // Gemini generateContent requires the first turn to be "user" and alternating roles
  while (rawTurns.length > 0 && rawTurns[0].role !== "user") {
    rawTurns.shift();
  }
  const normalizedHistory = [];
  for (const turn of rawTurns) {
    const prev = normalizedHistory[normalizedHistory.length - 1];
    if (prev && prev.role === turn.role) {
      prev.parts[0].text += `\n${turn.text}`;
    } else {
      normalizedHistory.push({
        role: turn.role,
        parts: [{ text: turn.text }],
      });
    }
  }
  // Ensure the final appended user message alternates after a "model" turn (or starts fresh)
  if (normalizedHistory.length > 0 && normalizedHistory[normalizedHistory.length - 1].role === "user") {
    normalizedHistory[normalizedHistory.length - 1].parts[0].text += `\n${String(message || "").trim().slice(0, 1500)}`;
  } else {
    normalizedHistory.push({
      role: "user",
      parts: [{ text: String(message || "").trim().slice(0, 1500) }],
    });
  }

  const contents = normalizedHistory;

  const payload = {
    systemInstruction,
    contents,
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 700,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  const models = getGeminiModelsToTry();
  let lastError = "UNKNOWN";

  for (const model of models) {
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
        const errBody = await res.text().catch(() => "");
        lastError = `HTTP_${res.status}:${errBody.slice(0, 200)}`;
        // Retry next model only if model not found / invalid / unavailable
        if (res.status === 404 || res.status === 400 || res.status === 503) {
          continue;
        }
        return { ok: false, reason: lastError };
      }

      const json = await res.json();
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const textPart = parts.find((p) => typeof p?.text === "string" && !p?.thought) || parts[0];
      const parsed = parseJsonFromGeminiCandidate(textPart?.text || "");
      if (!parsed || typeof parsed.reply !== "string") {
        lastError = "INVALID_JSON_RESPONSE";
        continue;
      }

      const chips = Array.isArray(parsed.suggestedChips)
        ? parsed.suggestedChips
            .filter((c) => c && typeof c.label === "string" && typeof c.value === "string")
            .slice(0, 4)
        : [];

      return {
        ok: true,
        modelUsed: model,
        reply: parsed.reply.trim(),
        answeredQuestion: Boolean(parsed.answeredQuestion),
        extracted: parsed.extracted && typeof parsed.extracted === "object" ? parsed.extracted : {},
        suggestedChips: chips,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    } finally {
      clearTimeout(timer);
    }
  }

  return { ok: false, reason: lastError };
}
