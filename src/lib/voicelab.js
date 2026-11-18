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

function inferExtensionFromMime(mimeType, fallbackFilename = "voice.ogg") {
  const lower = String(mimeType || "").toLowerCase();
  if (lower.includes("m4a") || lower.includes("mp4") || lower.includes("aac")) return "voice.m4a";
  if (lower.includes("mpeg") || lower.includes("mp3")) return "voice.mp3";
  if (lower.includes("wav")) return "voice.wav";
  if (lower.includes("webm")) return "voice.webm";
  if (lower.includes("ogg") || lower.includes("opus")) return "voice.ogg";
  return fallbackFilename;
}

/**
 * Fallback multimodal STT via Gemini when VoiceLab API key is missing or rejects an audio codec.
 */
async function transcribeWithGeminiFallback(audioBuffer, mimeType = "audio/ogg") {
  const apiKey = getGeminiApiKey();
  if (!apiKey || !audioBuffer || audioBuffer.length === 0) {
    return { ok: false, error: "NO_STT_KEY" };
  }

  const normalizedMime = String(mimeType || "audio/ogg").split(";")[0].trim() || "audio/ogg";
  const configured = (process.env.GEMINI_MODEL || "gemini-3.5-flash").trim();
  const models = [...new Set([configured, "gemini-3.5-flash", "gemini-2.5-flash", "gemini-3.5-flash-lite"].filter(Boolean))];
  const base64Audio = Buffer.from(audioBuffer).toString("base64");

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: normalizedMime,
              data: base64Audio,
            },
          },
          {
            text:
              "Transcribe this voice message verbatim. The speaker may speak Uzbek (Latin script), Russian, or English. " +
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
        if (res.status === 404 || res.status === 400 || res.status === 503) continue;
        return { ok: false, error: `GEMINI_STT_HTTP_${res.status}` };
      }
      const json = await res.json();
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const textPart = parts.find((p) => typeof p?.text === "string" && !p?.thought) || parts[0];
      const raw = (textPart?.text || "").trim();
      const parsed = JSON.parse(raw);
      if (parsed?.transcript) {
        return {
          ok: true,
          provider: `gemini-fallback:${model}`,
          transcript: String(parsed.transcript).trim(),
          language: normalizeVoiceLang(parsed.language),
        };
      }
    } catch {
      // try next model
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, error: "GEMINI_STT_FAILED" };
}

/**
 * Speech-to-Text via VoiceLab.uz (Aisha REST API: POST /api/v1/stt/post/).
 * Automatically falls back to Gemini audio transcription if VOICELAB_API_KEY is missing or fails.
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
  const safeFilename = filename || inferExtensionFromMime(mimeType);
  const cleanMime = String(mimeType || "audio/ogg").split(";")[0].trim() || "audio/ogg";

  if (apiKey) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 16_000);
    try {
      const form = new FormData();
      const blob = new Blob([audioBuffer], { type: cleanMime });
      form.append("audio", blob, safeFilename);
      if (preferredLang) {
        form.append("language", normalizeVoiceLang(preferredLang));
      }

      const headers = {
        "X-Api-Key": apiKey,
      };
      if (preferredLang) {
        headers["Accept-Language"] = normalizeVoiceLang(preferredLang);
      }

      const res = await fetch(`${VOICELAB_BASE_URL}/api/v1/stt/post/`, {
        method: "POST",
        headers,
        body: form,
        signal: controller.signal,
      });

      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        const transcript = String(
          json?.transcript ||
            json?.text ||
            json?.result?.transcript ||
            json?.result?.text ||
            json?.data?.transcript ||
            json?.data?.text ||
            ""
        ).trim();
        if (transcript) {
          return {
            ok: true,
            provider: "voicelab",
            transcript,
            language: normalizeVoiceLang(json?.language || preferredLang || "uz"),
          };
        }
      } else {
        const errBody = await res.text().catch(() => "");
        console.warn(`VoiceLab STT HTTP ${res.status}: ${errBody.slice(0, 180)}`);
      }
    } catch (err) {
      console.warn("VoiceLab STT request error:", err instanceof Error ? err.message : String(err));
    } finally {
      clearTimeout(timer);
    }
  }

  // Fallback to Gemini native audio STT so voice flows keep working seamlessly
  return transcribeWithGeminiFallback(audioBuffer, cleanMime);
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
    // Handle direct binary audio stream if returned
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
    const rawPath = json?.audio_path || json?.audioUrl || json?.url || json?.data?.audio_path || "";
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
    const audioMime = audioRes.headers.get("content-type") || (audioUrl.endsWith(".mp3") ? "audio/mpeg" : audioUrl.endsWith(".ogg") ? "audio/ogg" : "audio/wav");
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
