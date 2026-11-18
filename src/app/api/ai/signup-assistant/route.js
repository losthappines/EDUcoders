import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  applyExtractedFields,
  createInitialDraft,
  getStepPrompt,
  processAiAnswer,
} from "@/lib/ai-signup-helper";
import { runGeminiSignupAssistant } from "@/lib/gemini-signup";

function sanitizeIncomingDraft(rawDraft) {
  const persona = ["PATIENT", "DOCTOR", "NURSE", "PSYCHOLOGIST", "ADMIN_RECEPTION"].includes(
    rawDraft?.persona
  )
    ? rawDraft.persona
    : "PATIENT";
  const base = createInitialDraft(persona, rawDraft?.role);
  return {
    ...base,
    role: typeof rawDraft?.role === "string" && rawDraft.role ? rawDraft.role : base.role,
    doctorTypePicked: Boolean(rawDraft?.doctorTypePicked ?? base.doctorTypePicked),
    fullName: typeof rawDraft?.fullName === "string" ? rawDraft.fullName : "",
    dateOfBirth: typeof rawDraft?.dateOfBirth === "string" ? rawDraft.dateOfBirth : "",
    deliveryDate: typeof rawDraft?.deliveryDate === "string" ? rawDraft.deliveryDate : "",
    phone: typeof rawDraft?.phone === "string" ? rawDraft.phone : "",
    region: typeof rawDraft?.region === "string" ? rawDraft.region : "",
    district: typeof rawDraft?.district === "string" ? rawDraft.district : "",
    mahalla: typeof rawDraft?.mahalla === "string" ? rawDraft.mahalla : "",
    bloodType: typeof rawDraft?.bloodType === "string" ? rawDraft.bloodType : "",
    specialty: typeof rawDraft?.specialty === "string" ? rawDraft.specialty : "",
    expertiseArea: typeof rawDraft?.expertiseArea === "string" ? rawDraft.expertiseArea : "",
    experienceYears:
      rawDraft?.experienceYears !== undefined && rawDraft?.experienceYears !== null
        ? String(rawDraft.experienceYears)
        : "",
    latitude: typeof rawDraft?.latitude === "number" ? rawDraft.latitude : null,
    longitude: typeof rawDraft?.longitude === "number" ? rawDraft.longitude : null,
    email: typeof rawDraft?.email === "string" ? rawDraft.email : "",
    // Never accept or pass plaintext password on the AI assistant route
    password: rawDraft?.hasPassword ? "__SET__" : "",
    hasPassword: Boolean(rawDraft?.hasPassword),
  };
}

function stripPasswordFromDraft(draft) {
  const clean = { ...draft };
  delete clean.password;
  delete clean.hasPassword;
  return clean;
}

export async function POST(req) {
  const clientIp = getClientIp(req);
  const rl = checkRateLimit({
    key: `ai-signup:${clientIp}`,
    limit: 35,
    windowMs: 5 * 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many AI requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 1500) : "";
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const lang = body?.lang === "ru" || body?.lang === "en" ? body.lang : "uz";
  const safeDraft = sanitizeIncomingDraft(body?.draft);
  const history = Array.isArray(body?.history) ? body.history : [];

  const geminiResult = await runGeminiSignupAssistant({
    message,
    draft: safeDraft,
    lang,
    history,
  });

  if (geminiResult.ok) {
    const { nextDraft, filledFields } = applyExtractedFields(safeDraft, geminiResult.extracted);
    const nextPrompt = getStepPrompt(
      {
        ...nextDraft,
        password: safeDraft.hasPassword ? "******" : "",
      },
      lang
    );

    const chips =
      geminiResult.suggestedChips.length > 0
        ? geminiResult.suggestedChips
        : nextPrompt.chips.slice(0, 6);

    return NextResponse.json({
      ok: true,
      provider: geminiResult.modelUsed,
      reply: geminiResult.reply,
      answeredQuestion: geminiResult.answeredQuestion,
      filledFields,
      nextDraft: stripPasswordFromDraft(nextDraft),
      chips,
    });
  }

  // Fallback when GEMINI_API_KEY is absent or Gemini API temporarily fails
  const fallback = processAiAnswer(
    {
      ...safeDraft,
      password: safeDraft.hasPassword ? "******" : "",
    },
    message,
    lang
  );
  const nextPrompt = getStepPrompt(fallback.nextDraft, lang);

  return NextResponse.json({
    ok: true,
    provider: "smart-fallback",
    fallbackReason: geminiResult.reason || "UNAVAILABLE",
    reply: fallback.reply,
    answeredQuestion: Boolean(fallback.answeredQuestion),
    filledFields: fallback.filledFields || [],
    nextDraft: stripPasswordFromDraft(fallback.nextDraft),
    chips: nextPrompt.chips.slice(0, 6),
  });
}
