"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  IconBrandTelegram,
  IconCheck,
  IconLink,
  IconMapPin,
  IconRefresh,
  IconRobot,
  IconSend,
  IconShieldCheck,
  IconSparkles,
  IconUserPlus,
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
      "Bemor va shifokorlarni GPS lokatsiyasi bilan ro'yxatdan o'tkazadi, shikoyatlarni qabul qiladi, paramedik tashrif manzilini tanlash imkonini beradi, shifokorlarga tashrif eslatmasi yuboradi va to'g'ridan-to'g'ri maslahat chatini bog'laydi.",
    liveChatTitle: "Jonli Telegram bot interfeysi (@OnaCarePatronajBot)",
    liveChatSub: "Har bir tugma va xabar to'g'ridan-to'g'ri PostgreSQL bazasiga ulangan.",
    linkMeBtn: "Hozirgi kirgan hisobimni bog'lash",
    resetChatBtn: "Chatni yangilash (/start)",
    shareGpsBtn: "GPS lokatsiya yuborish",
    gpsLoading: "GPS aniqlanmoqda...",
    inputPlaceholder: "Xabar yoki javob yozing (masalan: /start, /complaint, /nearby)...",
    sendBtn: "Yuborish",
    quickGpsLabel: "Tezkor sinov GPS nuqtalari:",
    botStatusTitle: "Haqiqiy Telegram bot (@BotFather) holati",
    configured: "Ulangan (Token faol)",
    notConfigured: "Interaktiv rejim (Token hali kiritilmagan)",
    linkedPatients: "Ulangan bemorlar",
    linkedDoctors: "Ulangan shifokorlar",
    sessionsCount: "Faol chatlar",
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
  },
  ru: {
    badge: "Интеграция Telegram-бота",
    title: "Telegram-бот OnaCare — Связь пациента и врача",
    subtitle:
      "Регистрирует пациентов и врачей с GPS-локацией, принимает жалобы, позволяет выбрать место выезда бригады или врача, отправляет напоминания врачам и связывает их прямым чатом консультаций.",
    liveChatTitle: "Живой интерфейс Telegram-бота (@OnaCarePatronajBot)",
    liveChatSub: "Каждая кнопка и сообщение работают напрямую с базой данных PostgreSQL.",
    linkMeBtn: "Привязать мой текущий аккаунт",
    resetChatBtn: "Сбросить чат (/start)",
    shareGpsBtn: "Отправить GPS-локацию",
    gpsLoading: "Определение GPS...",
    inputPlaceholder: "Введите сообщение или команду (/start, /complaint, /nearby)...",
    sendBtn: "Отправить",
    quickGpsLabel: "Быстрые тестовые GPS-точки:",
    botStatusTitle: "Статус реального Telegram-бота (@BotFather)",
    configured: "Подключен (Токен активен)",
    notConfigured: "Интерактивный режим (Токен не задан)",
    linkedPatients: "Подключено пациентов",
    linkedDoctors: "Подключено врачей",
    sessionsCount: "Активных чатов",
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
  },
  en: {
    badge: "Telegram Bot Integration",
    title: "OnaCare Telegram Bot — Patient & Doctor Bridge",
    subtitle:
      "Registers patients & doctors with GPS location, collects complaints & chosen paramedic visit destinations, reminds doctors of pending visits, and links them in direct advice chat.",
    liveChatTitle: "Live Telegram Bot Console (@OnaCarePatronajBot)",
    liveChatSub: "Every button tap and message runs directly against the live PostgreSQL backend.",
    linkMeBtn: "Link My Signed-In Account",
    resetChatBtn: "Restart Bot (/start)",
    shareGpsBtn: "Share GPS Location",
    gpsLoading: "Detecting GPS...",
    inputPlaceholder: "Type a message or command (/start, /complaint, /nearby)...",
    sendBtn: "Send",
    quickGpsLabel: "Quick test GPS locations:",
    botStatusTitle: "Live @BotFather Connection Status",
    configured: "Connected (Token Active)",
    notConfigured: "Interactive Web Mode (No Bot Token Yet)",
    linkedPatients: "Linked Patients",
    linkedDoctors: "Linked Doctors",
    sessionsCount: "Active Sessions",
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
  },
};

const QUICK_GPS_POINTS = [
  { label: "Chilonzor (41.275, 69.204)", latitude: 41.2753, longitude: 69.2036 },
  { label: "Yunusobod (41.367, 69.287)", latitude: 41.3667, longitude: 69.2869 },
  { label: "Namangan (41.008, 71.608)", latitude: 41.0085, longitude: 71.6083 },
];

export default function TelegramConsolePage() {
  const { authUser, showToast, refreshData } = usePlatform();
  const { lang } = useLanguage();
  const t = TG_COPY[lang];

  const [chatId, setChatId] = useState("web-sim-1");
  const [history, setHistory] = useState([]);
  const [flowState, setFlowState] = useState("IDLE");
  const [linkedUser, setLinkedUser] = useState(null);
  const [botStatus, setBotStatus] = useState(null);
  const [inputText, setInputText] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;
    let cid = "web-sim-1";
    try {
      const saved = window.localStorage.getItem("onacare_tg_chat_id");
      if (saved) {
        cid = saved;
      } else {
        cid = `web-${Math.floor(100000 + Math.random() * 899999)}`;
        window.localStorage.setItem("onacare_tg_chat_id", cid);
      }
    } catch {
      cid = "web-sim-1";
    }

    (async () => {
      try {
        const [simRes, statusRes] = await Promise.all([
          fetch(`/api/telegram/simulate?chatId=${encodeURIComponent(cid)}`, { cache: "no-store" }),
          fetch("/api/telegram/setup", { cache: "no-store" }),
        ]);
        if (!active) return;
        setChatId(cid);
        if (simRes.ok) {
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
              body: JSON.stringify({ chatId: cid, text: "/start" }),
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
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  async function sendPayload(payload) {
    setBusy(true);
    try {
      const res = await fetch("/api/telegram/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ chatId, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Telegram error");
        return;
      }
      setHistory(data.history || []);
      setFlowState(data.flowState || "IDLE");
      setLinkedUser(data.linkedUser || null);
      if (authUser) {
        refreshData();
      }
    } catch {
      showToast("error", "Network error while contacting Telegram backend");
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 space-y-6">
        <Emergency103Banner />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300 mb-2">
              <IconBrandTelegram className="h-3.5 w-3.5" />
              {t.badge}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {t.title}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <IconUserPlus className="h-4 w-4 text-teal-600" />
              {t.openSignupBtn}
            </Link>
            {authUser?.role === "ADMIN_RECEPTION" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition"
              >
                <IconShieldCheck className="h-4 w-4" />
                {t.openAdminBtn}
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left: Live Interactive Telegram Messenger */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
            {/* Bot Header */}
            <div className="bg-sky-600 dark:bg-sky-900 px-4 py-3 text-white flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center">
                  <IconRobot className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold flex items-center gap-1.5">
                    {t.liveChatTitle}
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[11px] text-sky-100">{t.liveChatSub}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {authUser && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => sendPayload({ action: "LINK_CURRENT_USER" })}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1.5 text-[11px] font-semibold transition"
                  >
                    <IconLink className="h-3.5 w-3.5" />
                    {t.linkMeBtn}
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => sendPayload({ action: "RESET" })}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1.5 text-[11px] font-semibold transition"
                >
                  <IconRefresh className="h-3.5 w-3.5" />
                  {t.resetChatBtn}
                </button>
              </div>
            </div>

            {/* Session Info Ribbon */}
            <div className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <span>
                {t.linkedAccountLabel}{" "}
                <strong className="text-slate-900 dark:text-slate-100">
                  {linkedUser ? `${linkedUser.fullName} (${linkedUser.role})` : t.guestLabel}
                </strong>
              </span>
              <span>
                {t.stateLabel}{" "}
                <code className="rounded bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 text-[10px]">
                  {flowState}
                </code>
              </span>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 min-h-[380px] max-h-[480px] overflow-y-auto p-4 space-y-3 bg-slate-100/70 dark:bg-slate-950/60">
              {history.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                      msg.from === "user"
                        ? "bg-sky-600 text-white rounded-br-sm"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm"
                    }`}
                  >
                    <div
                      className="whitespace-pre-line leading-relaxed [&_code]:rounded [&_code]:bg-slate-100 [&_code]:dark:bg-slate-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px]"
                      dangerouslySetInnerHTML={{
                        __html: String(msg.text || ""),
                      }}
                    />
                    {msg.from === "bot" && Array.isArray(msg.buttons) && msg.buttons.length > 0 && (
                      <div className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {msg.buttons.map((row, rIdx) => (
                          <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {row.map((btn) => (
                              <button
                                key={btn.callbackData}
                                type="button"
                                disabled={busy}
                                onClick={() => sendPayload({ callbackData: btn.callbackData })}
                                className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/50 px-2.5 py-1.5 text-[11px] font-semibold text-sky-800 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-900/70 transition text-center"
                              >
                                {btn.text}
                              </button>
                            ))}
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
            <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-4 py-2 flex flex-wrap items-center gap-2">
              <GpsConsentButton
                label={t.shareGpsBtn}
                busy={busy}
                className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                  lastBotMsg?.requestLocation
                    ? "bg-emerald-700 text-white hover:bg-emerald-800 animate-pulse"
                    : "border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100"
                }`}
                onLocationCaptured={({ latitude, longitude }) =>
                  sendPayload({ location: { latitude, longitude } })
                }
                onDeniedFallback={() => sendPayload({ location: QUICK_GPS_POINTS[0] })}
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{t.quickGpsLabel}</span>
              {QUICK_GPS_POINTS.map((pt) => (
                <button
                  key={pt.label}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    sendPayload({ location: { latitude: pt.latitude, longitude: pt.longitude } })
                  }
                  className="min-h-[34px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:border-sky-400"
                >
                  <IconMapPin className="inline h-3 w-3 mr-0.5 text-sky-600" />
                  {pt.label}
                </button>
              ))}
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSendText}
              className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex items-center gap-2"
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
                className="min-h-[42px] flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || !inputText.trim()}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 transition"
              >
                <IconSend className="h-3.5 w-3.5" />
                {t.sendBtn}
              </button>
            </form>
          </div>

          {/* Right: Real Telegram Bot Connection Status & Commands Guide */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <IconBrandTelegram className="h-4 w-4 text-sky-600" />
                {t.botStatusTitle}
              </h2>
              <div
                className={`rounded-xl border px-3 py-2 text-xs font-semibold flex items-center gap-1.5 ${
                  botStatus?.configured
                    ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200"
                    : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200"
                }`}
              >
                {botStatus?.configured ? (
                  <IconCheck className="h-4 w-4 shrink-0" />
                ) : (
                  <IconSparkles className="h-4 w-4 shrink-0" />
                )}
                <span>{botStatus?.configured ? t.configured : t.notConfigured}</span>
              </div>

              {botStatus?.username && (
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Bot:{" "}
                  <a
                    href={`https://t.me/${botStatus.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    @{botStatus.username}
                  </a>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-2.5 text-center border border-slate-200 dark:border-slate-700">
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {botStatus?.linkedPatients ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400">{t.linkedPatients}</div>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-2.5 text-center border border-slate-200 dark:border-slate-700">
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {botStatus?.linkedDoctors ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400">{t.linkedDoctors}</div>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-2.5 text-center border border-slate-200 dark:border-slate-700">
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {botStatus?.sessionCount ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400">{t.sessionsCount}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t.howToConnectTitle}
              </h3>
              <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside">
                {t.howToConnectSteps.map((st, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {st}
                  </li>
                ))}
              </ol>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                <div>
                  <code>/start</code> • <code>/signup</code> • <code>/complaint</code>
                </div>
                <div>
                  <code>/nearby</code> • <code>/reminders</code> • <code>/dm</code> • <code>/subscription</code>
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
