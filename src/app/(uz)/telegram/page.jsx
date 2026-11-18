"use client";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  IconBrandTelegram,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconLink,
  IconLinkOff,
  IconMapPin,
  IconMicrophone,
  IconPlayerStop,
  IconRefresh,
  IconRobot,
  IconSend,
  IconShieldCheck,
  IconSparkles,
  IconUser,
  IconUserPlus,
  IconVolume,
} from "@tabler/icons-react";
import { PublicHeader } from "@/components/PublicHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Emergency103Banner } from "@/components/Emergency103Banner";
import { GpsConsentButton } from "@/components/GpsConsentButton";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";

const TG_COPY = {
  uz: {
    badge: "Telegram bot integratsiyasi",
    title: "OnaCare Telegram boti — Bemor va shifokor aloqasi",
    subtitle:
      "Bemor va shifokorlarni GPS lokatsiyasi bilan ro'yxatdan o'tkazadi, shikoyatlarni qabul qiladi, profil va asosiy ma'lumotlarni ko'rsatadi, shifokorlarga tashrif eslatmasi yuboradi va maslahat chatini bog'laydi.",
    liveChatTitle: "Jonli Telegram bot interfeysi (@OnaCarePatronajBot)",
    liveChatSub: "Har bir tugma va xabar to'g'ridan-to'g'ri PostgreSQL bazasiga ulangan.",
    profileQuickBtn: "Mening hisobim (/profile)",
    linkMeBtn: "Hozirgi hisobimni ulash",
    resetChatBtn: "Qayta boshlash (/start)",
    shareGpsBtn: "GPS lokatsiya yuborish",
    gpsLoading: "GPS aniqlanmoqda...",
    inputPlaceholder: "Xabar yoki buyruq yozing (/profile, /delete_account, /start, /link)...",
    sendBtn: "Yuborish",
    recordVoiceBtn: "Ovoz yozish",
    stopVoiceBtn: "To'xtatish va yuborish",
    voiceUnsupported: "Brauzeringiz mikrofon yozuvini qo'llab-quvvatlamaydi.",
    voiceLabActive: "VoiceLab STT + TTS (UZ / RU / EN) faol",
    voiceLabNeedsKey: "VOICELAB_API_KEY ulansa o'zbekcha/ruscha/inglizcha ovozli javob qaytadi",
    voiceReplyBadge: "VoiceLab AI ovozli javobi",
    quickGpsLabel: "Tezkor sinov GPS nuqtalari:",
    botStatusTitle: "Haqiqiy Telegram bot (@BotFather) holati",
    configured: "Ulangan (Token faol)",
    notConfigured: "Interaktiv rejim (Token hali kiritilmagan)",
    linkedPatients: "Ulangan bemorlar",
    linkedDoctors: "Ulangan shifokorlar",
    sessionsCount: "Faol chatlar",
    myLinkTitle: "Mening Telegram bog'lanishim",
    myLinkDesc:
      "Veb-sayt hisobingizni Telegram botga ulang va bot ichida profilingiz hamda asosiy tibbiy ma'lumotlaringizni ko'ring.",
    myLinkStatusLinked: "Telegram ulangan",
    myLinkStatusUnlinked: "Hali ulanmagan",
    linkWebHereBtn: "Shu botda ulash va profilni ko'rish",
    openTgAppBtn: "Telegram ilovasida ochish",
    copyLinkCmdBtn: "Buyruqni nusxalash",
    copiedText: "Nusxalandi ✓",
    unlinkBtn: "Telegramni uzish",
    howToConnectTitle: "Haqiqiy Telegram ilovasiga ulash yo'riqnomasi",
    howToConnectSteps: [
      "Telegramda @BotFather orqali yangi bot yarating va bot tokenini oling.",
      "Administrator kabinetiga (/admin) kiring yoki Vercel muhit o'zgaruvchilariga TELEGRAM_BOT_TOKEN qo'shing.",
      "Administrator panelida 'Webhookni ulash' tugmasini bosing — bot /api/telegram/webhook manziliga ulanadi.",
    ],
    openAdminBtn: "Administrator Telegram sozlamalari",
    openSignupBtn: "Veb-ro'yxatdan o'tish",
    stateLabel: "Joriy qadam:",
    linkedAccountLabel: "Ulangan hisob:",
    guestLabel: "Mehmon (ulanmagan)",
    loadingConsole: "Telegram bot konsoli yuklanmoqda...",
  },
  ru: {
    badge: "Интеграция Telegram-бота",
    title: "Telegram-бот OnaCare — Связь пациента и врача",
    subtitle:
      "Регистрирует пациентов и врачей с GPS-локацией, показывает профиль и основные данные, принимает жалобы, отправляет напоминания врачам и связывает их в прямом чате.",
    liveChatTitle: "Живой интерфейс Telegram-бота (@OnaCarePatronajBot)",
    liveChatSub: "Каждая кнопка и сообщение работают напрямую с базой данных PostgreSQL.",
    profileQuickBtn: "Мой аккаунт (/profile)",
    linkMeBtn: "Привязать мой аккаунт",
    resetChatBtn: "Сбросить чат (/start)",
    shareGpsBtn: "Отправить GPS-локацию",
    gpsLoading: "Определение GPS...",
    inputPlaceholder: "Введите сообщение или команду (/profile, /delete_account, /start, /link)...",
    sendBtn: "Отправить",
    recordVoiceBtn: "Голосовое",
    stopVoiceBtn: "Стоп и отправить",
    voiceUnsupported: "Ваш браузер не поддерживает запись с микрофона.",
    voiceLabActive: "VoiceLab STT + TTS (UZ / RU / EN) активен",
    voiceLabNeedsKey: "Добавьте VOICELAB_API_KEY для голосовых ответов на русском/узбекском/английском",
    voiceReplyBadge: "Голосовой ответ VoiceLab AI",
    quickGpsLabel: "Быстрые тестовые GPS-точки:",
    botStatusTitle: "Статус реального Telegram-бота (@BotFather)",
    configured: "Подключен (Токен активен)",
    notConfigured: "Интерактивный режим (Токен не задан)",
    linkedPatients: "Подключено пациентов",
    linkedDoctors: "Подключено врачей",
    sessionsCount: "Активных чатов",
    myLinkTitle: "Моя привязка к Telegram",
    myLinkDesc:
      "Привяжите свой аккаунт к Telegram-боту, чтобы просматривать профиль и ключевые данные прямо в боте.",
    myLinkStatusLinked: "Telegram привязан",
    myLinkStatusUnlinked: "Еще не привязан",
    linkWebHereBtn: "Привязать здесь и открыть профиль",
    openTgAppBtn: "Открыть в приложении Telegram",
    copyLinkCmdBtn: "Копировать команду",
    copiedText: "Скопировано ✓",
    unlinkBtn: "Отвязать Telegram",
    howToConnectTitle: "Как подключить к реальному боту в Telegram",
    howToConnectSteps: [
      "Создайте бота через @BotFather в Telegram и получите Bot Token.",
      "Укажите токен в панели администратора (/admin) или добавьте TELEGRAM_BOT_TOKEN в переменные Vercel.",
      "Нажмите 'Подключить Webhook' в панели администратора — бот подключится к /api/telegram/webhook.",
    ],
    openAdminBtn: "Настройки Telegram",
    openSignupBtn: "Веб-регистрация",
    stateLabel: "Текущий шаг:",
    linkedAccountLabel: "Привязанный аккаунт:",
    guestLabel: "Гость (не привязан)",
    loadingConsole: "Загрузка консоли Telegram-бота...",
  },
  en: {
    badge: "Telegram Bot Integration",
    title: "OnaCare Telegram Bot — Patient & Doctor Bridge",
    subtitle:
      "Registers patients & doctors with GPS location, displays your profile & essentials, collects complaints & visit destinations, reminds doctors, and connects direct advice chat.",
    liveChatTitle: "Live Telegram Bot Console (@OnaCarePatronajBot)",
    liveChatSub: "Every button tap and message runs directly against the live PostgreSQL backend.",
    profileQuickBtn: "My Account (/profile)",
    linkMeBtn: "Link My Signed-In Account",
    resetChatBtn: "Restart Bot (/start)",
    shareGpsBtn: "Share GPS Location",
    gpsLoading: "Detecting GPS...",
    inputPlaceholder: "Type a message or command (/profile, /delete_account, /start, /link)...",
    sendBtn: "Send",
    recordVoiceBtn: "Record Voice",
    stopVoiceBtn: "Stop & Send",
    voiceUnsupported: "Microphone recording is not supported in this browser.",
    voiceLabActive: "VoiceLab STT + TTS (UZ / RU / EN) Active",
    voiceLabNeedsKey: "Add VOICELAB_API_KEY to enable Uzbek/Russian/English voice replies",
    voiceReplyBadge: "VoiceLab AI Voice Reply",
    quickGpsLabel: "Quick test GPS locations:",
    botStatusTitle: "Live @BotFather Connection Status",
    configured: "Connected (Token Active)",
    notConfigured: "Interactive Web Mode (No Bot Token Yet)",
    linkedPatients: "Linked Patients",
    linkedDoctors: "Linked Doctors",
    sessionsCount: "Active Sessions",
    myLinkTitle: "My Telegram Account Link",
    myLinkDesc:
      "Link your web account to the Telegram bot to view your profile, medical essentials, and care updates directly in chat.",
    myLinkStatusLinked: "Telegram Linked",
    myLinkStatusUnlinked: "Not Linked Yet",
    linkWebHereBtn: "Link Here & View Profile",
    openTgAppBtn: "Open in Telegram App",
    copyLinkCmdBtn: "Copy /link Command",
    copiedText: "Copied ✓",
    unlinkBtn: "Unlink Telegram",
    howToConnectTitle: "Connect to a Live Mobile Telegram Bot",
    howToConnectSteps: [
      "Create a bot via @BotFather on Telegram and copy your Bot Token.",
      "Enter the token in the Admin Portal (/admin) or set TELEGRAM_BOT_TOKEN in Vercel.",
      "Click 'Register Webhook' in Admin — Telegram routes live updates to /api/telegram/webhook.",
    ],
    openAdminBtn: "Admin Telegram Controls",
    openSignupBtn: "Web Signup",
    stateLabel: "Flow state:",
    linkedAccountLabel: "Linked account:",
    guestLabel: "Guest (unlinked)",
    loadingConsole: "Loading Telegram bot console...",
  },
};

const QUICK_GPS_POINTS = [
  { label: "Chilonzor (41.275, 69.204)", latitude: 41.2753, longitude: 69.2036 },
  { label: "Yunusobod (41.367, 69.287)", latitude: 41.3667, longitude: 69.2869 },
  { label: "Namangan (41.008, 71.608)", latitude: 41.0085, longitude: 71.6083 },
];

function TelegramConsoleContent() {
  const { authUser, showToast, refreshData, clearLocalSession } = usePlatform();
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const t = TG_COPY[lang];

  const queryLinkToken = (searchParams.get("link") || "").trim();

  const [chatId, setChatId] = useState("web-sim-1");
  const [activeLinkToken, setActiveLinkToken] = useState("");
  const [history, setHistory] = useState([]);
  const [flowState, setFlowState] = useState("IDLE");
  const [linkedUser, setLinkedUser] = useState(null);
  const [botStatus, setBotStatus] = useState(null);
  const [personalLink, setPersonalLink] = useState(null);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [inputText, setInputText] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceAudioMap, setVoiceAudioMap] = useState({});
  const mediaRecorderRef = useRef(null);
  const mediaChunksRef = useRef([]);
  const bottomRef = useRef(null);

  const loadPersonalLink = useCallback(async () => {
    if (!authUser) return;
    try {
      const res = await fetch("/api/telegram/link", {
        cache: "no-store",
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setPersonalLink(json);
      }
    } catch {
      // ignore background link fetch error
    }
  }, [authUser]);

  useEffect(() => {
    if (!authUser) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/telegram/link", {
          cache: "no-store",
          credentials: "include",
        });
        if (res.ok && active) {
          const json = await res.json();
          setPersonalLink(json);
        }
      } catch {
        // ignore background link fetch error
      }
    })();
    return () => {
      active = false;
    };
  }, [authUser]);

  useEffect(() => {
    let active = true;
    let cid = "web-sim-1";
    let storedToken = "";
    try {
      const saved = window.localStorage.getItem("onacare_tg_chat_id");
      if (saved) {
        cid = saved;
      } else {
        cid = `web-${Math.floor(100000 + Math.random() * 899999)}`;
        window.localStorage.setItem("onacare_tg_chat_id", cid);
      }
      if (queryLinkToken) {
        window.sessionStorage.setItem("onacare_tg_link_token", queryLinkToken);
        storedToken = queryLinkToken;
      } else {
        storedToken = window.sessionStorage.getItem("onacare_tg_link_token") || "";
      }
    } catch {
      cid = "web-sim-1";
      storedToken = queryLinkToken;
    }

    (async () => {
      try {
        const statusPromise = fetch("/api/telegram/setup", { cache: "no-store" });

        // If user came with ?link=<token> (from AI Signup, Traditional Signup, or Portal), auto-link & show profile
        if (queryLinkToken) {
          const linkRes = await fetch("/api/telegram/simulate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              chatId: cid,
              action: "LINK_WITH_TOKEN",
              token: queryLinkToken,
            }),
          });
          if (linkRes.ok && active) {
            const linkData = await linkRes.json();
            setChatId(cid);
            setActiveLinkToken(storedToken);
            setHistory(linkData.history || []);
            setFlowState(linkData.flowState || "IDLE");
            setLinkedUser(linkData.linkedUser || null);
            const statusRes = await statusPromise;
            if (statusRes.ok && active) {
              setBotStatus(await statusRes.json());
            }
            return;
          }
        }

        if (active) {
          setChatId(cid);
          setActiveLinkToken(storedToken);
        }

        const simUrl = storedToken
          ? `/api/telegram/simulate?chatId=${encodeURIComponent(cid)}&link=${encodeURIComponent(storedToken)}`
          : `/api/telegram/simulate?chatId=${encodeURIComponent(cid)}`;
        const [simRes, statusRes] = await Promise.all([
          fetch(simUrl, { cache: "no-store", credentials: "include" }),
          statusPromise,
        ]);
        if (!active) return;

        if (simRes.status === 403) {
          // Previously bound chatId from another user — rotate to a clean session id
          const freshCid = `web-${Math.floor(100000 + Math.random() * 899999)}`;
          try {
            window.localStorage.setItem("onacare_tg_chat_id", freshCid);
          } catch {
            // ignore storage failure
          }
          setChatId(freshCid);
          const initRes = await fetch("/api/telegram/simulate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ chatId: freshCid, text: "/start" }),
          });
          if (initRes.ok && active) {
            const initData = await initRes.json();
            setHistory(initData.history || []);
            setFlowState(initData.flowState || "IDLE");
            setLinkedUser(initData.linkedUser || null);
          }
        } else if (simRes.ok) {
          const sim = await simRes.json();
          if (!active) return;
          if (sim.history && sim.history.length > 0) {
            setHistory(sim.history);
            setFlowState(sim.flowState || "IDLE");
            setLinkedUser(sim.linkedUser || null);
          } else {
            const initRes = await fetch("/api/telegram/simulate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ chatId: cid, text: "/start", linkToken: storedToken || undefined }),
            });
            if (initRes.ok && active) {
              const initData = await initRes.json();
              setHistory(initData.history || []);
              setFlowState(initData.flowState || "IDLE");
              setLinkedUser(initData.linkedUser || null);
            }
          }
        }
        if (statusRes.ok && active) {
          const st = await statusRes.json();
          setBotStatus(st);
        }
      } catch (err) {
        console.error("Failed loading telegram console:", err);
      }
    })();

    return () => {
      active = false;
    };
  }, [queryLinkToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  async function sendPayload(payload) {
    setBusy(true);
    try {
      if (payload.action === "RESET") {
        try {
          window.sessionStorage.removeItem("onacare_tg_link_token");
        } catch {
          // ignore
        }
        setActiveLinkToken("");
      }
      const res = await fetch("/api/telegram/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          chatId,
          linkToken: payload.action === "RESET" ? undefined : activeLinkToken || undefined,
          ...payload,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Telegram error");
        return;
      }
      const prevLinkedId = linkedUser?.id || null;
      const nextHistory = data.history || [];
      setHistory(nextHistory);
      setFlowState(data.flowState || "IDLE");
      setLinkedUser(data.linkedUser || null);
      if (data.reply?.voiceReplyDataUrl) {
        const lastBot = [...nextHistory].reverse().find((m) => m.from === "bot");
        if (lastBot?.id) {
          setVoiceAudioMap((prev) => ({
            ...prev,
            [lastBot.id]: {
              url: data.reply.voiceReplyDataUrl,
              lang: data.reply.voiceReplyLang || "uz",
            },
          }));
        }
      }
      if (payload.callbackData === "ACCOUNT:DELETE_EXECUTE" && !data.linkedUser) {
        try {
          window.sessionStorage.removeItem("onacare_tg_link_token");
        } catch {
          // ignore
        }
        setActiveLinkToken("");
        if (authUser && prevLinkedId === authUser.userId) {
          clearLocalSession();
          return;
        }
      }
      if (authUser) {
        refreshData();
        loadPersonalLink();
      }
    } catch {
      showToast("error", "Network error while contacting Telegram backend");
    } finally {
      setBusy(false);
    }
  }

  async function toggleVoiceRecording() {
    if (busy) return;
    if (recording && mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.requestData?.();
          mediaRecorderRef.current.stop();
        }
      } catch {
        // ignore stop error
      }
      setRecording(false);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      showToast("error", t.voiceUnsupported);
      return;
    }

    // Pause any playing AI voice audio before opening microphone
    if (typeof document !== "undefined") {
      document.querySelectorAll("audio").forEach((el) => {
        try {
          el.pause();
        } catch {
          // ignore
        }
      });
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
          ? "audio/ogg;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "";
      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);
      mediaChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          mediaChunksRef.current.push(ev.data);
        }
      };

      recorder.onerror = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        mediaRecorderRef.current = null;
        setRecording(false);
        setBusy(false);
        showToast("error", t.voiceUnsupported);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        mediaRecorderRef.current = null;
        const mimeType = recorder.mimeType || preferredMime || "audio/webm";
        const blob = new Blob(mediaChunksRef.current, { type: mimeType });
        mediaChunksRef.current = [];
        if (blob.size < 150) {
          showToast(
            "error",
            lang === "ru"
              ? "Запись слишком короткая. Удерживайте кнопку немного дольше."
              : lang === "en"
                ? "Recording was too short. Please speak for at least 1 second."
                : "Ovoz yozuvi juda qisqa. Kamida 1 soniya gapirib qayta yuboring."
          );
          return;
        }
        setBusy(true);
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = typeof reader.result === "string" ? reader.result : "";
          if (dataUrl) {
            sendPayload({
              voiceAudioBase64: dataUrl,
              voiceMimeType: mimeType,
              lang,
            });
          } else {
            setBusy(false);
          }
        };
        reader.onerror = () => {
          setBusy(false);
          showToast("error", "Failed to read recorded audio.");
        };
        reader.readAsDataURL(blob);
      };

      recorder.start(250);
      setRecording(true);
    } catch {
      showToast("error", t.voiceUnsupported);
      setRecording(false);
    }
  }

  async function handleUnlinkTelegram() {
    setBusy(true);
    try {
      const res = await fetch("/api/telegram/link", {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setLinkedUser(null);
        await loadPersonalLink();
        refreshData();
        showToast("success", t.myLinkStatusUnlinked);
      }
    } catch {
      showToast("error", "Failed to unlink Telegram");
    } finally {
      setBusy(false);
    }
  }

  function handleSendText(e) {
    e.preventDefault();
    if (!inputText.trim() || busy) return;
    const text = inputText.trim();
    setInputText("");
    sendPayload({ text });
  }

  const lastBotMsg = [...history].reverse().find((m) => m.from === "bot");

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8F7] dark:bg-[#091315] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-8 py-8 sm:py-12 space-y-8 oc-fade-up">
        <Emergency103Banner />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-[#D7E4E1] dark:border-[#1E353A] pb-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-teal-700 dark:text-teal-300 mb-2.5">
              <IconBrandTelegram className="h-3.5 w-3.5" />
              {t.badge}
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.title}
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href="/signup"
              className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-teal-600 dark:hover:border-teal-400 transition-colors"
            >
              <IconUserPlus className="h-4 w-4 text-teal-700 dark:text-teal-300" />
              {t.openSignupBtn}
            </Link>
            {authUser?.role === "ADMIN_RECEPTION" && (
              <Link
                href="/admin"
                className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-teal-700 dark:bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 dark:hover:bg-teal-500 transition-all active:scale-[0.98]"
              >
                <IconShieldCheck className="h-4 w-4" />
                {t.openAdminBtn}
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left: Live Interactive Telegram Messenger */}
          <div className="lg:col-span-8 med-card overflow-hidden flex flex-col">
            {/* Bot Header */}
            <div className="bg-teal-700 dark:bg-teal-800 px-4 sm:px-5 py-4 text-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <IconRobot className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-heading text-sm sm:text-base font-bold flex items-center gap-2">
                    {t.liveChatTitle}
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  </div>
                  <div className="text-xs text-teal-100">{t.liveChatSub}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {linkedUser && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => sendPayload({ callbackData: "MENU:PROFILE" })}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-white/25 bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold transition-colors"
                  >
                    <IconUser className="h-3.5 w-3.5" />
                    {t.profileQuickBtn}
                  </button>
                )}
                {authUser && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => sendPayload({ action: "LINK_CURRENT_USER" })}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold transition-colors"
                  >
                    <IconLink className="h-3.5 w-3.5" />
                    {t.linkMeBtn}
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => sendPayload({ action: "RESET" })}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                  <IconRefresh className="h-3.5 w-3.5" />
                  {t.resetChatBtn}
                </button>
              </div>
            </div>

            {/* Session Info Ribbon */}
            <div className="bg-[#EDF5F3] dark:bg-[#16272B] border-b border-[#D7E4E1] dark:border-[#1E353A] px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span>
                {t.linkedAccountLabel}{" "}
                <strong className="text-slate-900 dark:text-white">
                  {linkedUser ? `${linkedUser.fullName} (${linkedUser.role})` : t.guestLabel}
                </strong>
              </span>
              <span>
                {t.stateLabel}{" "}
                <code className="rounded-md border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] px-2 py-0.5 font-mono text-xs">
                  {flowState}
                </code>
              </span>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 min-h-[380px] max-h-[500px] overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#F4F8F7] dark:bg-[#091315]">
              {history.map((msg) => (
                <div
                  key={msg.id}
                  className={`oc-fade-up flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-2xs ${
                      msg.from === "user"
                        ? "bg-teal-700 dark:bg-teal-600 text-white rounded-br-sm"
                        : "bg-white dark:bg-[#101E21] border border-[#D7E4E1] dark:border-[#1E353A] text-slate-900 dark:text-slate-100 rounded-bl-sm"
                    }`}
                  >
                    <div
                      className="whitespace-pre-line leading-relaxed [&_code]:rounded [&_code]:border [&_code]:border-[#D7E4E1] [&_code]:dark:border-[#1E353A] [&_code]:bg-[#F4F8F7] [&_code]:dark:bg-[#091315] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs"
                      dangerouslySetInnerHTML={{
                        __html: String(msg.text || ""),
                      }}
                    />
                    {msg.from === "bot" && voiceAudioMap[msg.id]?.url && (
                      <div className="mt-2.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-[#F4F8F7] dark:bg-[#091315] p-2.5 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-200">
                          <IconVolume className="h-4 w-4 shrink-0" />
                          <span>
                            {t.voiceReplyBadge} ({String(voiceAudioMap[msg.id].lang || "uz").toUpperCase()})
                          </span>
                        </div>
                        <audio controls autoPlay src={voiceAudioMap[msg.id].url} className="w-full h-9" />
                      </div>
                    )}
                    {msg.from === "bot" && Array.isArray(msg.buttons) && msg.buttons.length > 0 && (
                      <div className="mt-3 space-y-2 pt-3 border-t border-[#D7E4E1] dark:border-[#1E353A]">
                        {msg.buttons.map((row, rIdx) => (
                          <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {row.map((btn, bIdx) =>
                              btn.webAppUrl ? (
                                <Link
                                  key={`${rIdx}-${bIdx}-${btn.text}`}
                                  href="/tg"
                                  className="min-h-[42px] inline-flex items-center justify-center rounded-xl border border-teal-200 dark:border-teal-800 bg-[#F4F8F7] dark:bg-[#091315] px-3 py-2 text-xs font-semibold text-teal-800 dark:text-teal-200 hover:bg-[#EDF5F3] dark:hover:bg-[#16272B] transition-colors text-center"
                                >
                                  {btn.text}
                                </Link>
                              ) : (
                                <button
                                  key={btn.callbackData || `${rIdx}-${bIdx}`}
                                  type="button"
                                  disabled={busy}
                                  onClick={() => sendPayload({ callbackData: btn.callbackData })}
                                  className="min-h-[42px] rounded-xl border border-teal-200 dark:border-teal-800 bg-[#F4F8F7] dark:bg-[#091315] px-3 py-2 text-xs font-semibold text-teal-800 dark:text-teal-200 hover:bg-[#EDF5F3] dark:hover:bg-[#16272B] transition-colors text-center"
                                >
                                  {btn.text}
                                </button>
                              )
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* GPS & Quick Controls */}
            <div className="border-t border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#16272B] px-4 py-3 flex flex-wrap items-center gap-2">
              <GpsConsentButton
                label={t.shareGpsBtn}
                busy={busy}
                className={`inline-flex min-h-[42px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                  lastBotMsg?.requestLocation
                    ? "bg-teal-700 dark:bg-teal-600 text-white hover:bg-teal-800"
                    : "border border-teal-700 dark:border-teal-500 bg-white dark:bg-[#091315] text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-[#101E21]"
                }`}
                onLocationCaptured={({ latitude, longitude }) =>
                  sendPayload({ location: { latitude, longitude } })
                }
                onDeniedFallback={() => sendPayload({ location: QUICK_GPS_POINTS[0] })}
              />
              <span className="text-xs text-slate-600 dark:text-slate-300">{t.quickGpsLabel}</span>
              {QUICK_GPS_POINTS.map((pt) => (
                <button
                  key={pt.label}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    sendPayload({ location: { latitude: pt.latitude, longitude: pt.longitude } })
                  }
                  className="min-h-[38px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 hover:border-teal-600 dark:hover:border-teal-400 transition-colors"
                >
                  <IconMapPin className="inline h-3.5 w-3.5 mr-1 text-teal-700 dark:text-teal-300" />
                  {pt.label}
                </button>
              ))}
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSendText}
              className="border-t border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-3.5 flex items-center gap-2"
            >
              <label htmlFor="tg-msg-input" className="sr-only">
                {t.inputPlaceholder}
              </label>
              <input
                id="tg-msg-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="min-h-[46px] flex-1 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-4 py-2 text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-600 dark:focus:border-teal-400 focus:outline-none transition-colors"
              />
              <button
                type="button"
                disabled={busy}
                onClick={toggleVoiceRecording}
                title={recording ? t.stopVoiceBtn : t.recordVoiceBtn}
                className={`inline-flex min-h-[46px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 ${
                  recording
                    ? "bg-rose-600 text-white animate-pulse hover:bg-rose-700"
                    : "border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] text-teal-700 dark:text-teal-300 hover:border-teal-600"
                }`}
              >
                {recording ? <IconPlayerStop className="h-4 w-4" /> : <IconMicrophone className="h-4 w-4" />}
                <span className="hidden md:inline">{recording ? t.stopVoiceBtn : t.recordVoiceBtn}</span>
              </button>
              <button
                type="submit"
                disabled={busy || !inputText.trim()}
                className="inline-flex min-h-[46px] items-center gap-1.5 rounded-xl bg-teal-700 dark:bg-teal-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 dark:hover:bg-teal-500 active:scale-[0.98] disabled:opacity-50 transition-all"
              >
                <IconSend className="h-4 w-4" />
                <span className="hidden sm:inline">{t.sendBtn}</span>
              </button>
            </form>
          </div>

          {/* Right: Signed-in Link Card + Bot Connection Status & Commands Guide */}
          <div className="lg:col-span-4 space-y-5">
            {authUser && personalLink && (
              <div className="med-card p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconLink className="h-5 w-5 text-teal-700 dark:text-teal-300" />
                    {t.myLinkTitle}
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                      personalLink.linked
                        ? "border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
                        : "border-[#D7E4E1] bg-[#F4F8F7] text-slate-600 dark:border-[#1E353A] dark:bg-[#091315] dark:text-slate-300"
                    }`}
                  >
                    {personalLink.linked ? t.myLinkStatusLinked : t.myLinkStatusUnlinked}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.myLinkDesc}
                </p>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => sendPayload({ action: "LINK_CURRENT_USER" })}
                    className="w-full inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-teal-700 dark:bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 dark:hover:bg-teal-500 active:scale-[0.98] transition-all"
                  >
                    <IconUser className="h-4 w-4" />
                    {t.linkWebHereBtn}
                  </button>
                  {personalLink.telegramDeepLink && (
                    <a
                      href={personalLink.telegramDeepLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:border-teal-600 dark:hover:border-teal-400 transition-colors"
                    >
                      <IconBrandTelegram className="h-4 w-4 text-teal-700 dark:text-teal-300" />
                      <span>{t.openTgAppBtn}</span>
                      <IconExternalLink className="h-4 w-4 text-slate-400" />
                    </a>
                  )}
                </div>

                {personalLink.linkToken && (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3 py-2.5">
                    <code className="text-xs font-mono text-slate-900 dark:text-slate-100 truncate">
                      {`/link ${personalLink.linkToken}`}
                    </code>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(`/link ${personalLink.linkToken}`);
                          setCopiedCmd(true);
                          setTimeout(() => setCopiedCmd(false), 2000);
                        } catch {
                          // ignore clipboard error
                        }
                      }}
                      className="inline-flex min-h-[34px] shrink-0 items-center gap-1 rounded-lg border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-2.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300"
                    >
                      {copiedCmd ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
                      <span>{copiedCmd ? t.copiedText : t.copyLinkCmdBtn}</span>
                    </button>
                  </div>
                )}

                {personalLink.linked && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleUnlinkTelegram}
                    className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline underline-offset-4"
                  >
                    <IconLinkOff className="h-4 w-4" />
                    {t.unlinkBtn}
                  </button>
                )}
              </div>
            )}

            <div className="med-card p-5 space-y-4">
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <IconBrandTelegram className="h-5 w-5 text-teal-700 dark:text-teal-300" />
                {t.botStatusTitle}
              </h2>
              <div
                className={`rounded-xl border px-3.5 py-3 text-sm font-semibold flex items-center gap-2 ${
                  botStatus?.configured
                    ? "border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200"
                    : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200"
                }`}
              >
                {botStatus?.configured ? (
                  <IconCheck className="h-4 w-4 shrink-0" />
                ) : (
                  <IconSparkles className="h-4 w-4 shrink-0" />
                )}
                <span>{botStatus?.configured ? t.configured : t.notConfigured}</span>
              </div>

              <div
                className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 ${
                  botStatus?.voiceLabConfigured
                    ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300"
                }`}
              >
                <IconVolume className="h-4 w-4 shrink-0" />
                <span>{botStatus?.voiceLabConfigured ? t.voiceLabActive : t.voiceLabNeedsKey}</span>
              </div>

              {botStatus?.username && (
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Bot:{" "}
                  <a
                    href={`https://t.me/${botStatus.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-teal-700 dark:text-teal-300 hover:underline underline-offset-4"
                  >
                    @{botStatus.username}
                  </a>
                </div>
              )}

              <div className="grid grid-cols-3 divide-x divide-[#D7E4E1] dark:divide-[#1E353A] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] overflow-hidden">
                <div className="p-3 text-center">
                  <div className="font-heading text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {botStatus?.linkedPatients ?? 0}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{t.linkedPatients}</div>
                </div>
                <div className="p-3 text-center">
                  <div className="font-heading text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {botStatus?.linkedDoctors ?? 0}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{t.linkedDoctors}</div>
                </div>
                <div className="p-3 text-center">
                  <div className="font-heading text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {botStatus?.sessionCount ?? 0}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{t.sessionsCount}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#101E21] p-5 space-y-3">
              <h3 className="font-heading text-sm font-bold uppercase tracking-[0.06em] text-slate-900 dark:text-white">
                {t.howToConnectTitle}
              </h3>
              <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-decimal list-inside">
                {t.howToConnectSteps.map((st, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {st}
                  </li>
                ))}
              </ol>
              <div className="pt-3 border-t border-[#D7E4E1] dark:border-[#1E353A] font-mono text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div>
                  <code>/start</code> • <code>/profile</code> • <code>/account</code> • <code>/link</code> • <code>/delete_account</code>
                </div>
                <div>
                  <code>/signup</code> • <code>/complaint</code> • <code>/nearby</code> • <code>/reminders</code> • <code>/dm</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function TelegramConsolePage() {
  const { lang } = useLanguage();
  const loadingText = TG_COPY[lang]?.loadingConsole || TG_COPY.uz.loadingConsole;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F4F8F7] dark:bg-[#091315] text-sm font-semibold text-slate-600 dark:text-slate-300">
          {loadingText}
        </div>
      }
    >
      <TelegramConsoleContent />
    </Suspense>
  );
}
