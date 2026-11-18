import {
  VoiceLab,
  APIError,
  AuthenticationError,
  PaymentRequiredError,
  PermissionDeniedError,
  RateLimitError,
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
  ValidationError,
  RequestTimeoutError,
  NetworkError,
} from "@voicelab/sdk";

const DEFAULT_VOICELAB_BASE_URL = "https://api.voicelab.uz";
const LEGACY_AISHA_BASE_URL = "https://back.aisha.group";
const DEFAULT_GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const VOICE_CACHE_TTL_MS = 15 * 60 * 1000;

const clientCache = new Map();
const voiceIdCache = new Map();

export function getVoiceLabApiKey() {
  return (
    process.env.VOICELAB_API_KEY ||
    process.env.AISHA_API_KEY ||
    ""
  ).trim();
}

export function getGroqApiKey() {
  return (process.env.GROQ_API_KEY || "").trim();
}

export function isGroqConfigured() {
  return Boolean(getGroqApiKey());
}

export function isLegacyAishaMode(apiKey = getVoiceLabApiKey()) {
  const envBase = (process.env.VOICELAB_BASE_URL || "").trim().toLowerCase();
  if (envBase.includes("aisha.group")) return true;
  if (!process.env.VOICELAB_API_KEY && process.env.AISHA_API_KEY && !String(apiKey).startsWith("vlk_")) {
    return true;
  }
  return false;
}

export function getVoiceLabBaseUrl(apiKey = getVoiceLabApiKey()) {
  const envBase = (process.env.VOICELAB_BASE_URL || "").trim().replace(/\/+$/, "");
  if (envBase) return envBase;
  return isLegacyAishaMode(apiKey) ? LEGACY_AISHA_BASE_URL : DEFAULT_VOICELAB_BASE_URL;
}

export function isVoiceLabConfigured() {
  return Boolean(getVoiceLabApiKey());
}

export function createVoiceLabClient(apiKey = getVoiceLabApiKey(), baseUrl = getVoiceLabBaseUrl(apiKey)) {
  if (!apiKey) return null;
  const cacheKey = `${apiKey}::${baseUrl}`;
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey);
  }
  const client = new VoiceLab({
    apiKey,
    baseUrl,
    timeoutMs: 25_000,
  });
  clientCache.set(cacheKey, client);
  return client;
}

function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    ""
  ).trim();
}

export function normalizeVoiceLang(lang) {
  const s = String(lang || "").trim().toLowerCase();
  if (s === "ru" || s.startsWith("ru") || s === "russian") return "ru";
  if (s === "en" || s.startsWith("en") || s === "english") return "en";
  return "uz";
}

export function stripHtmlForSpeech(text) {
  return String(text || "")
    .replace(/<br\s*\/?>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function clampSpeechText(text, maxChars = 940) {
  const clean = stripHtmlForSpeech(text);
  if (clean.length <= maxChars) return clean;
  const slice = clean.slice(0, maxChars);
  const lastPeriod = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  if (lastPeriod > maxChars * 0.55) {
    return slice.slice(0, lastPeriod + 1).trim();
  }
  return `${slice.trim()}...`;
}

export function normalizeAudioFormat(mimeType, filename = "") {
  const rawMime = String(mimeType || "").split(";")[0].trim().toLowerCase();
  const rawName = String(filename || "").trim().toLowerCase();

  if (
    rawMime.includes("mp4") ||
    rawMime.includes("m4a") ||
    rawMime.includes("aac") ||
    rawName.endsWith(".m4a") ||
    rawName.endsWith(".mp4") ||
    rawName.endsWith(".aac")
  ) {
    return { mimeType: "audio/mp4", filename: "voice.m4a" };
  }
  if (rawMime.includes("mpeg") || rawMime.includes("mp3") || rawName.endsWith(".mp3")) {
    return { mimeType: "audio/mpeg", filename: "voice.mp3" };
  }
  if (rawMime.includes("wav") || rawName.endsWith(".wav")) {
    return { mimeType: "audio/wav", filename: "voice.wav" };
  }
  if (rawMime.includes("webm") || rawName.endsWith(".webm")) {
    return { mimeType: "audio/webm", filename: "voice.webm" };
  }
  if (
    rawMime.includes("ogg") ||
    rawMime.includes("opus") ||
    rawMime.includes("oga") ||
    rawName.endsWith(".ogg") ||
    rawName.endsWith(".oga") ||
    rawName.endsWith(".opus")
  ) {
    // Normalize .oga to .ogg so VoiceLab and Gemini recognize it reliably
    return { mimeType: "audio/ogg", filename: "voice.ogg" };
  }
  return { mimeType: "audio/ogg", filename: "voice.ogg" };
}

function parseJsonSafe(text) {
  if (!text) return null;
  const trimmed = String(text).trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
      try {
        return JSON.parse(fenced[1].trim());
      } catch {
        // continue
      }
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        // continue
      }
    }
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatVoiceLabSdkError(err, scope = "stt") {
  const prefix = scope === "tts" ? "VOICELAB_TTS" : "VOICELAB";
  if (err instanceof AuthenticationError) {
    console.warn(`[voicelab-${scope}] Auth failed (401):`, err.message, err.requestId || "");
    return { status: 401, code: `${prefix}_AUTH_401` };
  }
  if (err instanceof PaymentRequiredError) {
    console.warn(`[voicelab-${scope}] Credits exhausted (402):`, err.message, err.requestId || "");
    return { status: 402, code: `${prefix}_CREDITS_402` };
  }
  if (err instanceof PermissionDeniedError) {
    console.warn(`[voicelab-${scope}] Permission denied (403):`, err.message, err.requestId || "");
    return { status: 403, code: `${prefix}_FORBIDDEN_403` };
  }
  if (err instanceof RateLimitError) {
    console.warn(`[voicelab-${scope}] Rate limit (429):`, err.message, err.retryAfterSeconds ?? "");
    return { status: 429, code: `${prefix}_RATE_LIMIT_429` };
  }
  if (err instanceof PayloadTooLargeError) {
    console.warn(`[voicelab-${scope}] Payload too large (413):`, err.message);
    return { status: 413, code: `${prefix}_TOO_LARGE_413` };
  }
  if (err instanceof UnsupportedMediaTypeError) {
    console.warn(`[voicelab-${scope}] Unsupported media (415):`, err.message);
    return { status: 415, code: `${prefix}_MEDIA_415` };
  }
  if (err instanceof ValidationError) {
    console.warn(`[voicelab-${scope}] Validation (${err.status}):`, err.message, err.fields || "");
    return { status: err.status || 422, code: `${prefix}_VALIDATION_${err.status || 422}` };
  }
  if (err instanceof RequestTimeoutError) {
    console.warn(`[voicelab-${scope}] Timeout:`, err.message);
    return { status: 0, code: `${prefix}_TIMEOUT` };
  }
  if (err instanceof NetworkError) {
    console.warn(`[voicelab-${scope}] Network error:`, err.message);
    return { status: 0, code: `${prefix}_NETWORK_ERR` };
  }
  if (err instanceof APIError) {
    console.warn(`[voicelab-${scope}] API error (${err.status} ${err.code}):`, err.message, err.requestId || "");
    return { status: err.status, code: `${prefix}_HTTP_${err.status}` };
  }
  const msg = err instanceof Error ? err.message : String(err);
  console.warn(`[voicelab-${scope}] Unexpected error:`, msg);
  return { status: 0, code: `${prefix}_SDK_ERR` };
}

async function pollSdkTranscription(client, transcriptionId, fallbackLang) {
  if (!client || !transcriptionId) return { ok: false, error: "VOICELAB_MISSING_JOB_ID" };
  const delaysMs = [700, 900, 1100, 1300, 1500, 1500, 1500, 1500, 1500, 1500];
  for (const delay of delaysMs) {
    await sleep(delay);
    try {
      const detail = await client.stt.getTranscription(transcriptionId, { timeoutMs: 8000 });
      const text = typeof detail?.transcript === "string" ? detail.transcript.trim() : "";
      if (text) {
        return {
          ok: true,
          provider: "voicelab",
          transcript: text,
          language: normalizeVoiceLang(detail.language || fallbackLang),
        };
      }
      const status = String(detail?.status || "").toLowerCase();
      if (status === "failed" || status === "error" || status === "canceled" || status === "cancelled") {
        return { ok: false, status: 500, error: "VOICELAB_JOB_FAILED" };
      }
    } catch (err) {
      const info = formatVoiceLabSdkError(err, "stt");
      if (info.status === 401 || info.status === 403 || info.status === 404) {
        return { ok: false, status: info.status, error: info.code };
      }
    }
  }
  return { ok: false, status: 202, error: "VOICELAB_JOB_PENDING" };
}

async function callVoiceLabSdkSttOnce({ audioBuffer, mimeType, filename, language, apiKey, baseUrl }) {
  const client = createVoiceLabClient(apiKey, baseUrl);
  if (!client) return { ok: false, status: 0, error: "NO_VOICELAB_KEY" };

  const sttLang = language ? normalizeVoiceLang(language) : "uz";
  try {
    const audioBytes = Buffer.isBuffer(audioBuffer) ? audioBuffer : Buffer.from(audioBuffer);
    const result = await client.stt.transcribe(
      {
        audio: {
          data: audioBytes,
          filename,
          contentType: mimeType,
        },
        language: sttLang,
        includeSpeakers: false,
      },
      { timeoutMs: 25_000 }
    );

    if (result && "transcript" in result && typeof result.transcript === "string" && result.transcript.trim()) {
      return {
        ok: true,
        provider: "voicelab",
        transcript: result.transcript.trim(),
        language: normalizeVoiceLang(result.language || sttLang),
      };
    }

    if (result?.id) {
      return await pollSdkTranscription(client, result.id, sttLang);
    }

    return { ok: false, status: 200, error: "VOICELAB_EMPTY_TRANSCRIPT" };
  } catch (err) {
    const info = formatVoiceLabSdkError(err, "stt");
    return { ok: false, status: info.status, error: info.code };
  }
}

function pickBestVoiceForLanguage(voices, lang) {
  if (!Array.isArray(voices) || voices.length === 0) return null;
  const preferredKeywords =
    lang === "uz"
      ? /gulnoza|sevara|madina|dilnoza|malika|female|ayol|warm|calm|natural/i
      : /female|woman|warm|calm|gentle|natural|anna|elena|olga|sophia|emma|claire|maya/i;
  const match = voices.find((v) =>
    preferredKeywords.test(`${v.displayName || ""} ${v.shortDescription || ""} ${v.description || ""}`)
  );
  return match || voices[0];
}

function getEnvVoiceOverride(lang) {
  if (lang === "uz" && process.env.VOICELAB_VOICE_ID_UZ) return process.env.VOICELAB_VOICE_ID_UZ.trim();
  if (lang === "ru" && process.env.VOICELAB_VOICE_ID_RU) return process.env.VOICELAB_VOICE_ID_RU.trim();
  if (lang === "en" && process.env.VOICELAB_VOICE_ID_EN) return process.env.VOICELAB_VOICE_ID_EN.trim();
  if (process.env.VOICELAB_VOICE_ID) return process.env.VOICELAB_VOICE_ID.trim();
  return "";
}

async function resolveVoiceLabVoiceId(client, apiKey, lang) {
  const envVoice = getEnvVoiceOverride(lang);
  if (envVoice) return { voiceId: envVoice, language: lang };

  const cacheKey = `${apiKey.slice(0, 12)}::${lang}`;
  const cached = voiceIdCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { voiceId: cached.voiceId, language: cached.language };
  }

  try {
    const list = await client.voices.list({ language: lang }, { timeoutMs: 8000 });
    const picked = pickBestVoiceForLanguage(list?.data, lang);
    if (picked?.id) {
      const entry = {
        voiceId: picked.id,
        language: picked.language || lang,
        expiresAt: Date.now() + VOICE_CACHE_TTL_MS,
      };
      voiceIdCache.set(cacheKey, entry);
      return { voiceId: entry.voiceId, language: entry.language };
    }
  } catch (err) {
    formatVoiceLabSdkError(err, "tts");
  }

  // Fallback to Uzbek voices if requested language has no dedicated voice listed
  if (lang !== "uz") {
    try {
      const fallbackList = await client.voices.list({ language: "uz" }, { timeoutMs: 8000 });
      const picked = pickBestVoiceForLanguage(fallbackList?.data, "uz");
      if (picked?.id) {
        return { voiceId: picked.id, language: picked.language || "uz" };
      }
    } catch (err) {
      formatVoiceLabSdkError(err, "tts");
    }
  }

  return null;
}

async function synthesizeWithVoiceLabSdk({ text, language, speed, apiKey, baseUrl }) {
  const client = createVoiceLabClient(apiKey, baseUrl);
  if (!client) return { ok: false, error: "VOICELAB_API_KEY_NOT_SET" };

  const resolved = await resolveVoiceLabVoiceId(client, apiKey, language);
  if (!resolved?.voiceId) {
    return { ok: false, error: "VOICELAB_NO_VOICE_AVAILABLE" };
  }

  const parsedSpeed = Number(speed);
  const numericSpeed = Number.isFinite(parsedSpeed) && parsedSpeed >= 0.5 && parsedSpeed <= 2.0 ? parsedSpeed : 1.0;

  try {
    const speech = await client.tts.synthesize(
      {
        text,
        language: resolved.language,
        voiceId: resolved.voiceId,
        ...(numericSpeed !== 1.0 ? { speed: numericSpeed } : {}),
      },
      { timeoutMs: 22_000 }
    );

    const contentType = speech.contentType || "audio/wav";
    const ext =
      contentType.includes("mpeg") || contentType.includes("mp3")
        ? "mp3"
        : contentType.includes("ogg")
          ? "ogg"
          : "wav";

    return {
      ok: true,
      provider: "voicelab",
      language,
      voiceId: resolved.voiceId,
      audioBuffer: Buffer.from(speech.audio),
      contentType,
      filename: `onacare-reply-${language}.${ext}`,
    };
  } catch (err) {
    const info = formatVoiceLabSdkError(err, "tts");
    return { ok: false, error: info.code };
  }
}

// ==================== LEGACY AISHA AI SUPPORT (ONLY WHEN AISHA_API_KEY / back.aisha.group USED) ====================

function extractLegacyAishaTranscript(json) {
  if (!json) return "";
  if (typeof json === "string") return json.trim();
  const candidates = [
    json?.transcript,
    json?.text,
    typeof json?.result === "string" ? json.result : null,
    json?.result?.transcript,
    json?.result?.text,
    json?.data?.transcript,
    json?.data?.text,
    Array.isArray(json?.results) ? json.results[0]?.transcript || json.results[0]?.text : null,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) {
      return c.trim();
    }
  }
  return "";
}

async function pollLegacyAishaSttResult(taskId, apiKey, baseUrl) {
  if (!taskId || !apiKey) return "";
  for (let attempt = 0; attempt < 5; attempt++) {
    await sleep(900);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${baseUrl}/api/v1/stt/status/${encodeURIComponent(String(taskId))}/`, {
        headers: { "X-Api-Key": apiKey },
        signal: controller.signal,
      });
      if (res.ok) {
        const json = await res.json().catch(() => null);
        const text = extractLegacyAishaTranscript(json);
        if (text) return text;
        const status = String(json?.status || "").toUpperCase();
        if (status === "FAILED" || status === "ERROR") break;
      } else if (res.status === 404) {
        break;
      }
    } catch {
      // retry next poll
    } finally {
      clearTimeout(timer);
    }
  }
  return "";
}

async function callLegacyAishaSttOnce({ audioBuffer, mimeType, filename, language, apiKey, baseUrl }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 16_000);
  try {
    const form = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType });
    form.append("audio", blob, filename);
    form.append("has_diarization", "false");
    if (language) {
      form.append("language", normalizeVoiceLang(language));
    }

    const headers = { "X-Api-Key": apiKey };
    if (language) {
      headers["Accept-Language"] = normalizeVoiceLang(language);
    }

    const res = await fetch(`${baseUrl}/api/v1/stt/post/`, {
      method: "POST",
      headers,
      body: form,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.warn(`Aisha STT HTTP ${res.status}: ${errBody.slice(0, 180)}`);
      return { ok: false, status: res.status, error: `AISHA_HTTP_${res.status}` };
    }

    const json = await res.json().catch(() => ({}));
    let transcript = extractLegacyAishaTranscript(json);
    if (!transcript && (json?.id || json?.task_id)) {
      transcript = await pollLegacyAishaSttResult(json.id || json.task_id, apiKey, baseUrl);
    }
    if (transcript) {
      return {
        ok: true,
        provider: "aisha",
        transcript,
        language: normalizeVoiceLang(json?.language || language || "uz"),
      };
    }
    return { ok: false, status: 200, error: "AISHA_EMPTY_TRANSCRIPT" };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err instanceof Error && err.name === "AbortError" ? "AISHA_TIMEOUT" : "AISHA_NETWORK_ERR",
    };
  } finally {
    clearTimeout(timer);
  }
}

async function pollLegacyAishaTtsAudioPath(taskId, apiKey, baseUrl) {
  if (!taskId || !apiKey) return "";
  for (let attempt = 0; attempt < 5; attempt++) {
    await sleep(900);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${baseUrl}/api/v1/tts/status/${encodeURIComponent(String(taskId))}/`, {
        headers: { "X-Api-Key": apiKey },
        signal: controller.signal,
      });
      if (res.ok) {
        const json = await res.json().catch(() => null);
        const rawPath = json?.audio_path || json?.audioUrl || json?.url || json?.data?.audio_path || "";
        if (rawPath) return rawPath;
        const status = String(json?.status || "").toUpperCase();
        if (status === "FAILED" || status === "ERROR") break;
      } else if (res.status === 404) {
        break;
      }
    } catch {
      // retry next poll
    } finally {
      clearTimeout(timer);
    }
  }
  return "";
}

async function synthesizeWithLegacyAisha({ text, language, mood, speed, apiKey, baseUrl }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 16_000);
  try {
    const form = new FormData();
    form.append("transcript", text);
    form.append("language", language);
    form.append("speed", String(speed || "1.0"));

    if (language === "uz") {
      form.append("model", (process.env.VOICELAB_TTS_MODEL_UZ || "Gulnoza").trim());
      form.append("mood", mood || "Neutral");
    } else if (language === "ru" && process.env.VOICELAB_TTS_MODEL_RU) {
      form.append("model", process.env.VOICELAB_TTS_MODEL_RU.trim());
    } else if (language === "en" && process.env.VOICELAB_TTS_MODEL_EN) {
      form.append("model", process.env.VOICELAB_TTS_MODEL_EN.trim());
    }

    const res = await fetch(`${baseUrl}/api/v1/tts/post/`, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Accept-Language": language,
      },
      body: form,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      return { ok: false, error: `AISHA_TTS_HTTP_${res.status}:${errBody.slice(0, 120)}` };
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.startsWith("audio/")) {
      const arr = await res.arrayBuffer();
      const ext = contentType.includes("mpeg") || contentType.includes("mp3") ? "mp3" : contentType.includes("ogg") ? "ogg" : "wav";
      return {
        ok: true,
        provider: "aisha",
        language,
        audioBuffer: Buffer.from(arr),
        contentType,
        filename: `onacare-reply-${language}.${ext}`,
      };
    }

    const json = await res.json().catch(() => ({}));
    let rawPath = json?.audio_path || json?.audioUrl || json?.url || json?.data?.audio_path || "";
    if (!rawPath && (json?.id || json?.task_id)) {
      rawPath = await pollLegacyAishaTtsAudioPath(json.id || json.task_id, apiKey, baseUrl);
    }
    if (!rawPath) {
      return { ok: false, error: "AISHA_TTS_NO_AUDIO_PATH" };
    }

    const audioUrl = rawPath.startsWith("http")
      ? rawPath
      : `${baseUrl}${rawPath.startsWith("/") ? "" : "/"}${rawPath}`;

    const audioRes = await fetch(audioUrl, { signal: controller.signal });
    if (!audioRes.ok) {
      return { ok: false, error: `AISHA_AUDIO_FETCH_HTTP_${audioRes.status}` };
    }
    const audioArr = await audioRes.arrayBuffer();
    const audioMime =
      audioRes.headers.get("content-type") ||
      (audioUrl.endsWith(".mp3") ? "audio/mpeg" : audioUrl.endsWith(".ogg") ? "audio/ogg" : "audio/wav");
    const ext = audioUrl.endsWith(".mp3") ? "mp3" : audioUrl.endsWith(".ogg") ? "ogg" : "wav";

    return {
      ok: true,
      provider: "aisha",
      language,
      audioUrl,
      audioBuffer: Buffer.from(audioArr),
      contentType: audioMime,
      filename: `onacare-reply-${language}.${ext}`,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

// ==================== GEMINI MULTIMODAL STT FALLBACK ====================

/**
 * Fallback multimodal STT via Gemini when VoiceLab API key is missing, rate-limited, or rejects an audio codec.
 */
async function transcribeWithGeminiFallback(audioBuffer, mimeType = "audio/ogg") {
  const apiKey = getGeminiApiKey();
  if (!apiKey || !audioBuffer || audioBuffer.length === 0) {
    return { ok: false, error: "NO_STT_KEY" };
  }

  const normalized = normalizeAudioFormat(mimeType);
  const envModel = (process.env.GEMINI_MODEL || "").trim();
  const models = [
    ...new Set([envModel, "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"].filter(Boolean)),
  ];
  const base64Audio = Buffer.from(audioBuffer).toString("base64");

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: normalized.mimeType,
              data: base64Audio,
            },
          },
          {
            text:
              "Transcribe this spoken voice message verbatim. The speaker may speak Uzbek (Latin script), Russian, or English. " +
              'Return strict JSON: {"transcript":"...","language":"uz"|"ru"|"en"}.',
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 500,
      responseMimeType: "application/json",
    },
  };

  let lastError = "GEMINI_STT_FAILED";
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
        if (lastError === "GEMINI_STT_FAILED" || res.status === 429 || res.status >= 500) {
          lastError = `GEMINI_HTTP_${res.status}`;
        }
        continue;
      }
      const json = await res.json();
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const textPart = parts.find((p) => typeof p?.text === "string" && !p?.thought) || parts[0];
      const raw = (textPart?.text || "").trim();
      const parsed = parseJsonSafe(raw);
      if (parsed?.transcript) {
        return {
          ok: true,
          provider: `gemini-fallback:${model}`,
          transcript: String(parsed.transcript).trim(),
          language: normalizeVoiceLang(parsed.language),
        };
      }
      if (raw && !raw.startsWith("{")) {
        return {
          ok: true,
          provider: `gemini-fallback:${model}`,
          transcript: raw.replace(/^["']|["']$/g, "").trim(),
          language: "uz",
        };
      }
      lastError = "GEMINI_EMPTY_TRANSCRIPT";
    } catch (err) {
      lastError = err instanceof Error && err.name === "AbortError" ? "GEMINI_TIMEOUT" : "GEMINI_NETWORK_ERR";
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, error: lastError };
}

// ==================== GROQ WHISPER STT ====================

async function callGroqWhisperOnce({
  audioBuffer,
  mimeType,
  filename,
  model,
  language,
  apiKey,
  baseUrl,
}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18_000);
  try {
    const form = new FormData();
    form.append("file", new Blob([audioBuffer], { type: mimeType }), filename);
    form.append("model", model);
    form.append("response_format", "verbose_json");
    form.append("temperature", "0");

    if (language) {
      const langCode = normalizeVoiceLang(language);
      form.append("language", langCode);
      if (langCode === "uz") {
        form.append(
          "prompt",
          "OnaCare patronaj. O'zbek tilida murojaat: isitma, bosh og'rig'i, qon bosimi, chaqaloq, emizish, shifokor, tuman."
        );
      }
    }

    const res = await fetch(`${baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.warn(`[groq-stt] ${model} HTTP ${res.status}: ${errBody.slice(0, 180)}`);
      return { ok: false, status: res.status, error: `GROQ_HTTP_${res.status}` };
    }

    const json = await res.json().catch(() => ({}));
    const transcript = typeof json?.text === "string" ? json.text.trim() : "";
    if (transcript) {
      return {
        ok: true,
        provider: `groq:${model}`,
        transcript,
        language: normalizeVoiceLang(json?.language || language || "uz"),
      };
    }
    return { ok: false, status: 200, error: "GROQ_EMPTY_TRANSCRIPT" };
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    console.warn(`[groq-stt] ${model} error:`, err instanceof Error ? err.message : String(err));
    return {
      ok: false,
      status: 0,
      error: isAbort ? "GROQ_TIMEOUT" : "GROQ_NETWORK_ERR",
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Speech-to-Text via Groq OpenAI-compatible Whisper API (whisper-large-v3 / whisper-large-v3-turbo).
 * Supports Uzbek, Russian, and English with auto-detection when preferredLang is omitted.
 */
export async function transcribeWithGroqWhisper({
  audioBuffer,
  mimeType = "audio/ogg",
  filename = "voice.ogg",
  preferredLang = "",
}) {
  const apiKey = getGroqApiKey();
  if (!apiKey || !audioBuffer || audioBuffer.length === 0) {
    return { ok: false, error: "NO_GROQ_KEY" };
  }

  const baseUrl = (process.env.GROQ_BASE_URL || DEFAULT_GROQ_BASE_URL).trim().replace(/\/+$/, "");
  const normalized = normalizeAudioFormat(mimeType, filename);
  const envModel = (process.env.GROQ_WHISPER_MODEL || "").trim();
  const models = [
    ...new Set([envModel, "whisper-large-v3", "whisper-large-v3-turbo"].filter(Boolean)),
  ];

  let lastError = "GROQ_STT_FAILED";
  for (const model of models) {
    const attempt = await callGroqWhisperOnce({
      audioBuffer,
      mimeType: normalized.mimeType,
      filename: normalized.filename,
      model,
      language: preferredLang,
      apiKey,
      baseUrl,
    });
    if (attempt.ok) return attempt;
    lastError = attempt.error || lastError;

    // Retry once without language hint if strict language validation failed
    if (preferredLang && (attempt.status === 400 || attempt.status === 422 || attempt.error === "GROQ_EMPTY_TRANSCRIPT")) {
      const retry = await callGroqWhisperOnce({
        audioBuffer,
        mimeType: normalized.mimeType,
        filename: normalized.filename,
        model,
        language: "",
        apiKey,
        baseUrl,
      });
      if (retry.ok) return retry;
      lastError = retry.error || lastError;
    }

    // Don't burn extra calls on invalid API keys
    if (attempt.status === 401 || attempt.status === 403) break;
  }

  return { ok: false, error: lastError };
}

// ==================== PUBLIC API ====================

async function tryVoiceLabStt({ audioBuffer, normalized, preferredLang }) {
  const apiKey = getVoiceLabApiKey();
  if (!apiKey) return { ok: false, error: "NO_VOICELAB_KEY" };

  const baseUrl = getVoiceLabBaseUrl(apiKey);
  const useLegacy = isLegacyAishaMode(apiKey);

  if (useLegacy) {
    const firstTry = await callLegacyAishaSttOnce({
      audioBuffer,
      mimeType: normalized.mimeType,
      filename: normalized.filename,
      language: preferredLang,
      apiKey,
      baseUrl,
    });
    if (firstTry.ok) return firstTry;

    if (preferredLang && (firstTry.status === 400 || firstTry.status === 422 || firstTry.error === "AISHA_EMPTY_TRANSCRIPT")) {
      const retry = await callLegacyAishaSttOnce({
        audioBuffer,
        mimeType: normalized.mimeType,
        filename: normalized.filename,
        language: "",
        apiKey,
        baseUrl,
      });
      if (retry.ok) return retry;
      return { ok: false, error: retry.error || firstTry.error || "AISHA_STT_FAILED" };
    }
    return { ok: false, error: firstTry.error || "AISHA_STT_FAILED" };
  }

  const firstTry = await callVoiceLabSdkSttOnce({
    audioBuffer,
    mimeType: normalized.mimeType,
    filename: normalized.filename,
    language: preferredLang,
    apiKey,
    baseUrl,
  });
  if (firstTry.ok) return firstTry;

  if (
    preferredLang &&
    normalizeVoiceLang(preferredLang) !== "uz" &&
    (firstTry.status === 400 || firstTry.status === 422 || firstTry.error === "VOICELAB_EMPTY_TRANSCRIPT")
  ) {
    const retry = await callVoiceLabSdkSttOnce({
      audioBuffer,
      mimeType: normalized.mimeType,
      filename: normalized.filename,
      language: "uz",
      apiKey,
      baseUrl,
    });
    if (retry.ok) return retry;
    return { ok: false, error: retry.error || firstTry.error || "VOICELAB_STT_FAILED" };
  }
  return { ok: false, error: firstTry.error || "VOICELAB_STT_FAILED" };
}

/**
 * Speech-to-Text across VoiceLab (@voicelab/sdk), Groq Whisper (whisper-large-v3), and Gemini fallback.
 * Respects optional STT_PROVIDER ("groq" | "voicelab" | "gemini" | "auto").
 */
export async function transcribeVoiceAudio({
  audioBuffer,
  mimeType = "audio/ogg",
  filename = "voice.ogg",
  preferredLang = "",
}) {
  if (!audioBuffer || audioBuffer.length === 0) {
    return { ok: false, error: "EMPTY_AUDIO" };
  }

  const normalized = normalizeAudioFormat(mimeType, filename);
  const sttPref = (process.env.STT_PROVIDER || "auto").trim().toLowerCase();

  const hasVoiceLab = isVoiceLabConfigured();
  const hasGroq = isGroqConfigured();
  const hasGemini = Boolean(getGeminiApiKey());

  if (!hasVoiceLab && !hasGroq && !hasGemini) {
    return { ok: false, error: "NO_STT_KEY" };
  }

  const order =
    sttPref === "groq"
      ? ["groq", "voicelab", "gemini"]
      : sttPref === "gemini"
        ? ["gemini", "groq", "voicelab"]
        : ["voicelab", "groq", "gemini"];

  const errors = [];
  for (const provider of order) {
    if (provider === "voicelab" && hasVoiceLab) {
      const res = await tryVoiceLabStt({ audioBuffer, normalized, preferredLang });
      if (res.ok) return res;
      if (res.error) errors.push(res.error);
    } else if (provider === "groq" && hasGroq) {
      const res = await transcribeWithGroqWhisper({
        audioBuffer,
        mimeType: normalized.mimeType,
        filename: normalized.filename,
        preferredLang,
      });
      if (res.ok) return res;
      if (res.error) errors.push(res.error);
    } else if (provider === "gemini" && hasGemini) {
      const res = await transcribeWithGeminiFallback(audioBuffer, normalized.mimeType);
      if (res.ok) return res;
      if (res.error) errors.push(res.error);
    }
  }

  return {
    ok: false,
    error: errors.join("|") || "STT_FAILED",
  };
}

/**
 * Text-to-Speech via official @voicelab/sdk (https://api.voicelab.uz).
 * Automatically resolves valid voice IDs for Uzbek (uz), Russian (ru), and English (en),
 * with optional overrides via VOICELAB_VOICE_ID_UZ / _RU / _EN.
 */
export async function synthesizeVoiceSpeech({
  text,
  language = "uz",
  mood = "Neutral",
  speed = 1.0,
}) {
  const apiKey = getVoiceLabApiKey();
  if (!apiKey) {
    return { ok: false, error: "VOICELAB_API_KEY_NOT_SET" };
  }

  const lang = normalizeVoiceLang(language);
  const transcript = clampSpeechText(text, 940);
  if (!transcript) {
    return { ok: false, error: "EMPTY_TEXT" };
  }

  const baseUrl = getVoiceLabBaseUrl(apiKey);
  if (isLegacyAishaMode(apiKey)) {
    return synthesizeWithLegacyAisha({
      text: transcript,
      language: lang,
      mood,
      speed,
      apiKey,
      baseUrl,
    });
  }

  return synthesizeWithVoiceLabSdk({
    text: transcript,
    language: lang,
    speed,
    apiKey,
    baseUrl,
  });
}
