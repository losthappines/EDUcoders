const VOICELAB_BASE_URL = (process.env.VOICELAB_BASE_URL || "https://back.aisha.group").replace(/\/$/, "");

export function getVoiceLabApiKey() {
  return (
    process.env.VOICELAB_API_KEY ||
    process.env.AISHA_API_KEY ||
    ""
  ).trim();
}

export function isVoiceLabConfigured() {
  return Boolean(getVoiceLabApiKey());
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
  if (s.startsWith("ru")) return "ru";
  if (s.startsWith("en")) return "en";
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

function normalizeAudioFormat(mimeType, filename = "") {
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
    // VoiceLab and Gemini recognize .ogg reliably (some parsers reject .oga)
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

function extractVoiceLabTranscript(json) {
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollVoiceLabSttResult(taskId, apiKey) {
  if (!taskId || !apiKey) return "";
  for (let attempt = 0; attempt < 5; attempt++) {
    await sleep(900);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${VOICELAB_BASE_URL}/api/v1/stt/status/${encodeURIComponent(String(taskId))}/`, {
        headers: { "X-Api-Key": apiKey },
        signal: controller.signal,
      });
      if (res.ok) {
        const json = await res.json().catch(() => null);
        const text = extractVoiceLabTranscript(json);
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

async function pollVoiceLabTtsAudioPath(taskId, apiKey) {
  if (!taskId || !apiKey) return "";
  for (let attempt = 0; attempt < 5; attempt++) {
    await sleep(900);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${VOICELAB_BASE_URL}/api/v1/tts/status/${encodeURIComponent(String(taskId))}/`, {
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
    ...new Set([envModel, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite", "gemini-3.5-flash"].filter(Boolean)),
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
        lastError = `GEMINI_HTTP_${res.status}`;
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
      // If Gemini responded with plain text transcript instead of JSON
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

async function callVoiceLabSttOnce({ audioBuffer, mimeType, filename, language, apiKey }) {
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

    const headers = {
      "X-Api-Key": apiKey,
    };
    if (language) {
      headers["Accept-Language"] = normalizeVoiceLang(language);
    }

    const res = await fetch(`${VOICELAB_BASE_URL}/api/v1/stt/post/`, {
      method: "POST",
      headers,
      body: form,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.warn(`VoiceLab STT HTTP ${res.status}: ${errBody.slice(0, 180)}`);
      return { ok: false, status: res.status, error: `VOICELAB_HTTP_${res.status}` };
    }

    const json = await res.json().catch(() => ({}));
    let transcript = extractVoiceLabTranscript(json);
    if (!transcript && (json?.id || json?.task_id)) {
      transcript = await pollVoiceLabSttResult(json.id || json.task_id, apiKey);
    }
    if (transcript) {
      return {
        ok: true,
        provider: "voicelab",
        transcript,
        language: normalizeVoiceLang(json?.language || language || "uz"),
      };
    }
    return { ok: false, status: 200, error: "VOICELAB_EMPTY_TRANSCRIPT" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("VoiceLab STT request error:", msg);
    return {
      ok: false,
      status: 0,
      error: err instanceof Error && err.name === "AbortError" ? "VOICELAB_TIMEOUT" : "VOICELAB_NETWORK_ERR",
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Speech-to-Text via VoiceLab.uz (Aisha REST API: POST /api/v1/stt/post/).
 * Automatically retries without explicit language on HTTP 400/422, polls async task IDs,
 * and falls back to Gemini multimodal audio transcription if VoiceLab fails.
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

  const apiKey = getVoiceLabApiKey();
  const normalized = normalizeAudioFormat(mimeType, filename);
  let voiceLabErr = apiKey ? "" : "NO_VOICELAB_KEY";

  if (apiKey) {
    const firstTry = await callVoiceLabSttOnce({
      audioBuffer,
      mimeType: normalized.mimeType,
      filename: normalized.filename,
      language: preferredLang,
      apiKey,
    });
    if (firstTry.ok) return firstTry;
    voiceLabErr = firstTry.error || "VOICELAB_STT_FAILED";

    // Retry once without language hint in case strict language validation rejected the audio/language pair
    if (preferredLang && (firstTry.status === 400 || firstTry.status === 422 || firstTry.error === "VOICELAB_EMPTY_TRANSCRIPT")) {
      const retry = await callVoiceLabSttOnce({
        audioBuffer,
        mimeType: normalized.mimeType,
        filename: normalized.filename,
        language: "",
        apiKey,
      });
      if (retry.ok) return retry;
      voiceLabErr = retry.error || voiceLabErr;
    }
  }

  // Fallback to Gemini native audio STT so voice flows keep working seamlessly
  const fallback = await transcribeWithGeminiFallback(audioBuffer, normalized.mimeType);
  if (fallback.ok) return fallback;

  return {
    ok: false,
    error: `${voiceLabErr}|${fallback.error || "STT_FAILED"}`,
  };
}

/**
 * Text-to-Speech via VoiceLab.uz (Aisha REST API: POST /api/v1/tts/post/).
 * Supports Uzbek (Gulnoza), Russian (language=ru), and English (language=en).
 */
export async function synthesizeVoiceSpeech({
  text,
  language = "uz",
  mood = "Neutral",
  speed = "1.0",
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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 16_000);
  try {
    const form = new FormData();
    form.append("transcript", transcript);
    form.append("language", lang);
    form.append("speed", String(speed || "1.0"));

    if (lang === "uz") {
      form.append("model", (process.env.VOICELAB_TTS_MODEL_UZ || "Gulnoza").trim());
      form.append("mood", mood || "Neutral");
    } else if (lang === "ru" && process.env.VOICELAB_TTS_MODEL_RU) {
      form.append("model", process.env.VOICELAB_TTS_MODEL_RU.trim());
    } else if (lang === "en" && process.env.VOICELAB_TTS_MODEL_EN) {
      form.append("model", process.env.VOICELAB_TTS_MODEL_EN.trim());
    }

    const res = await fetch(`${VOICELAB_BASE_URL}/api/v1/tts/post/`, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Accept-Language": lang,
      },
      body: form,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      return { ok: false, error: `VOICELAB_TTS_HTTP_${res.status}:${errBody.slice(0, 180)}` };
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.startsWith("audio/")) {
      const arr = await res.arrayBuffer();
      const ext = contentType.includes("mpeg") || contentType.includes("mp3") ? "mp3" : contentType.includes("ogg") ? "ogg" : "wav";
      return {
        ok: true,
        provider: "voicelab",
        language: lang,
        audioBuffer: Buffer.from(arr),
        contentType,
        filename: `onacare-reply-${lang}.${ext}`,
      };
    }

    const json = await res.json().catch(() => ({}));
    let rawPath = json?.audio_path || json?.audioUrl || json?.url || json?.data?.audio_path || "";
    if (!rawPath && (json?.id || json?.task_id)) {
      rawPath = await pollVoiceLabTtsAudioPath(json.id || json.task_id, apiKey);
    }
    if (!rawPath) {
      return { ok: false, error: "VOICELAB_TTS_NO_AUDIO_PATH" };
    }

    const audioUrl = rawPath.startsWith("http")
      ? rawPath
      : `${VOICELAB_BASE_URL}${rawPath.startsWith("/") ? "" : "/"}${rawPath}`;

    const audioRes = await fetch(audioUrl, { signal: controller.signal });
    if (!audioRes.ok) {
      return { ok: false, error: `VOICELAB_AUDIO_FETCH_HTTP_${audioRes.status}` };
    }
    const audioArr = await audioRes.arrayBuffer();
    const audioMime =
      audioRes.headers.get("content-type") ||
      (audioUrl.endsWith(".mp3") ? "audio/mpeg" : audioUrl.endsWith(".ogg") ? "audio/ogg" : "audio/wav");
    const ext = audioUrl.endsWith(".mp3") ? "mp3" : audioUrl.endsWith(".ogg") ? "ogg" : "wav";

    return {
      ok: true,
      provider: "voicelab",
      language: lang,
      audioUrl,
      audioBuffer: Buffer.from(audioArr),
      contentType: audioMime,
      filename: `onacare-reply-${lang}.${ext}`,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}
