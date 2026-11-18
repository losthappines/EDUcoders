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
    <div className="min-h-screen flex flex-col bg-[#F7F5EF] dark:bg-[#161A18] text-[#292E2B] dark:text-[#F3F0E8] transition-colors duration-200">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 sm:px-8 py-10 sm:py-12 space-y-8">
        <Emergency103Banner />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-[#DDD8CC] dark:border-[#2F3733] pb-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#244C40] dark:text-[#A7BBAA] mb-2">
              <IconBrandTelegram className="h-3.5 w-3.5" />
              {t.badge}
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-semibold tracking-tight text-[#292E2B] dark:text-[#F3F0E8]">
              {t.title}
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-[#525954] dark:text-[#B8C2BA] leading-relaxed">
              {t.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href="/signup"
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] px-4 py-2 text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8] hover:border-[#244C40] dark:hover:border-[#A7BBAA] transition-colors"
            >
              <IconUserPlus className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]" />
              {t.openSignupBtn}
            </Link>
            {authUser?.role === "ADMIN_RECEPTION" && (
              <Link
                href="/admin"
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-sm bg-[#244C40] dark:bg-[#2C5B4D] px-4 py-2 text-xs font-semibold text-[#F7F5EF] hover:bg-[#1B3A31] dark:hover:bg-[#356C5C] transition-colors"
              >
                <IconShieldCheck className="h-4 w-4" />
                {t.openAdminBtn}
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: Live Interactive Telegram Messenger */}
          <div className="lg:col-span-8 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] overflow-hidden flex flex-col">
            {/* Bot Header */}
            <div className="bg-[#244C40] dark:bg-[#1E3B32] px-5 py-3.5 text-[#F7F5EF] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-sm bg-[#F7F5EF]/15 flex items-center justify-center">
                  <IconRobot className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-heading text-sm font-semibold flex items-center gap-2">
                    {t.liveChatTitle}
                    <span className="h-2 w-2 rounded-full bg-[#A7BBAA]" />
                  </div>
                  <div className="text-[11px] text-[#D8E2DA]">{t.liveChatSub}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {authUser && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => sendPayload({ action: "LINK_CURRENT_USER" })}
                    className="inline-flex items-center gap-1 rounded-sm border border-[#F7F5EF]/25 bg-[#F7F5EF]/10 hover:bg-[#F7F5EF]/20 px-2.5 py-1.5 text-[11px] font-semibold transition-colors"
                  >
                    <IconLink className="h-3.5 w-3.5" />
                    {t.linkMeBtn}
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => sendPayload({ action: "RESET" })}
                  className="inline-flex items-center gap-1 rounded-sm border border-[#F7F5EF]/25 bg-[#F7F5EF]/10 hover:bg-[#F7F5EF]/20 px-2.5 py-1.5 text-[11px] font-semibold transition-colors"
                >
                  <IconRefresh className="h-3.5 w-3.5" />
                  {t.resetChatBtn}
                </button>
              </div>
            </div>

            {/* Session Info Ribbon */}
            <div className="bg-[#EFECE3]/70 dark:bg-[#242A27] border-b border-[#DDD8CC] dark:border-[#2F3733] px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#525954] dark:text-[#B8C2BA]">
              <span>
                {t.linkedAccountLabel}{" "}
                <strong className="text-[#292E2B] dark:text-[#F3F0E8]">
                  {linkedUser ? `${linkedUser.fullName} (${linkedUser.role})` : t.guestLabel}
                </strong>
              </span>
              <span>
                {t.stateLabel}{" "}
                <code className="border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#161A18] px-1.5 py-0.5 font-mono text-[10px]">
                  {flowState}
                </code>
              </span>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 min-h-[380px] max-h-[480px] overflow-y-auto p-5 space-y-3 bg-[#F7F5EF]/70 dark:bg-[#161A18]">
              {history.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-sm px-4 py-3 text-xs ${
                      msg.from === "user"
                        ? "bg-[#244C40] dark:bg-[#2C5B4D] text-[#F7F5EF]"
                        : "bg-[#FFFFFF] dark:bg-[#1D221F] border border-[#DDD8CC] dark:border-[#2F3733] text-[#292E2B] dark:text-[#F3F0E8]"
                    }`}
                  >
                    <div
                      className="whitespace-pre-line leading-relaxed [&_code]:border [&_code]:border-[#DDD8CC] [&_code]:dark:border-[#2F3733] [&_code]:bg-[#F7F5EF] [&_code]:dark:bg-[#161A18] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px]"
                      dangerouslySetInnerHTML={{
                        __html: String(msg.text || ""),
                      }}
                    />
                    {msg.from === "bot" && Array.isArray(msg.buttons) && msg.buttons.length > 0 && (
                      <div className="mt-3 space-y-1.5 pt-2.5 border-t border-[#DDD8CC] dark:border-[#2F3733]">
                        {msg.buttons.map((row, rIdx) => (
                          <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {row.map((btn) => (
                              <button
                                key={btn.callbackData}
                                type="button"
                                disabled={busy}
                                onClick={() => sendPayload({ callbackData: btn.callbackData })}
                                className="rounded-sm border border-[#A7BBAA] dark:border-[#6E8572] bg-[#F7F5EF] dark:bg-[#161A18] px-2.5 py-2 text-[11px] font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:bg-[#EFECE3] dark:hover:bg-[#242A27] transition-colors text-center"
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
            <div className="border-t border-[#DDD8CC] dark:border-[#2F3733] bg-[#EFECE3]/60 dark:bg-[#242A27] px-4 py-2.5 flex flex-wrap items-center gap-2">
              <GpsConsentButton
                label={t.shareGpsBtn}
                busy={busy}
                className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-sm px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  lastBotMsg?.requestLocation
                    ? "bg-[#244C40] dark:bg-[#2C5B4D] text-[#F7F5EF] hover:bg-[#1B3A31]"
                    : "border border-[#244C40] dark:border-[#A7BBAA] bg-[#FFFFFF] dark:bg-[#161A18] text-[#244C40] dark:text-[#A7BBAA] hover:bg-[#EFECE3] dark:hover:bg-[#242A27]"
                }`}
                onLocationCaptured={({ latitude, longitude }) =>
                  sendPayload({ location: { latitude, longitude } })
                }
                onDeniedFallback={() => sendPayload({ location: QUICK_GPS_POINTS[0] })}
              />
              <span className="text-[10px] text-[#525954] dark:text-[#B8C2BA]">{t.quickGpsLabel}</span>
              {QUICK_GPS_POINTS.map((pt) => (
                <button
                  key={pt.label}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    sendPayload({ location: { latitude: pt.latitude, longitude: pt.longitude } })
                  }
                  className="min-h-[34px] rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] px-2.5 py-1 text-[10px] font-medium text-[#292E2B] dark:text-[#F3F0E8] hover:border-[#244C40] dark:hover:border-[#A7BBAA] transition-colors"
                >
                  <IconMapPin className="inline h-3 w-3 mr-0.5 text-[#244C40] dark:text-[#A7BBAA]" />
                  {pt.label}
                </button>
              ))}
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSendText}
              className="border-t border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-3 flex items-center gap-2"
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
                className="min-h-[42px] flex-1 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF]/60 dark:bg-[#161A18] px-3.5 py-2 text-xs text-[#292E2B] dark:text-[#F3F0E8] placeholder:text-[#767E78] focus:border-[#244C40] dark:focus:border-[#A7BBAA] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={busy || !inputText.trim()}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-sm bg-[#244C40] dark:bg-[#2C5B4D] px-4 py-2 text-xs font-semibold text-[#F7F5EF] hover:bg-[#1B3A31] dark:hover:bg-[#356C5C] disabled:opacity-50 transition-colors"
              >
                <IconSend className="h-3.5 w-3.5" />
                {t.sendBtn}
              </button>
            </form>
          </div>

          {/* Right: Real Telegram Bot Connection Status & Commands Guide */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-5 space-y-4">
              <h2 className="font-heading text-sm font-semibold text-[#292E2B] dark:text-[#F3F0E8] flex items-center gap-2">
                <IconBrandTelegram className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]" />
                {t.botStatusTitle}
              </h2>
              <div
                className={`border-l-4 px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 ${
                  botStatus?.configured
                    ? "border-[#244C40] bg-[#EFECE3] dark:bg-[#242A27] text-[#244C40] dark:text-[#A7BBAA]"
                    : "border-[#9A6B42] bg-[#F3EAE7] dark:bg-[#2E1E1D] text-[#7A2E2E] dark:text-[#F0C8C4]"
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
                <div className="text-xs text-[#525954] dark:text-[#B8C2BA]">
                  Bot:{" "}
                  <a
                    href={`https://t.me/${botStatus.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:underline underline-offset-4"
                  >
                    @{botStatus.username}
                  </a>
                </div>
              )}

              <div className="grid grid-cols-3 divide-x divide-[#DDD8CC] dark:divide-[#2F3733] border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18]">
                <div className="p-3 text-center">
                  <div className="font-heading text-lg font-semibold text-[#292E2B] dark:text-[#F3F0E8] tabular-nums">
                    {botStatus?.linkedPatients ?? 0}
                  </div>
                  <div className="text-[10px] text-[#525954] dark:text-[#B8C2BA]">{t.linkedPatients}</div>
                </div>
                <div className="p-3 text-center">
                  <div className="font-heading text-lg font-semibold text-[#292E2B] dark:text-[#F3F0E8] tabular-nums">
                    {botStatus?.linkedDoctors ?? 0}
                  </div>
                  <div className="text-[10px] text-[#525954] dark:text-[#B8C2BA]">{t.linkedDoctors}</div>
                </div>
                <div className="p-3 text-center">
                  <div className="font-heading text-lg font-semibold text-[#292E2B] dark:text-[#F3F0E8] tabular-nums">
                    {botStatus?.sessionCount ?? 0}
                  </div>
                  <div className="text-[10px] text-[#525954] dark:text-[#B8C2BA]">{t.sessionsCount}</div>
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#EFECE3]/60 dark:bg-[#1D221F] p-5 space-y-3">
              <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-[#292E2B] dark:text-[#F3F0E8]">
                {t.howToConnectTitle}
              </h3>
              <ol className="space-y-2 text-xs text-[#525954] dark:text-[#B8C2BA] list-decimal list-inside">
                {t.howToConnectSteps.map((st, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {st}
                  </li>
                ))}
              </ol>
              <div className="pt-3 border-t border-[#DDD8CC] dark:border-[#2F3733] font-mono text-[11px] text-[#525954] dark:text-[#B8C2BA] space-y-1">
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
