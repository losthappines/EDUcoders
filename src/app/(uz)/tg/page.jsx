"use client";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBrandTelegram,
  IconCheck,
  IconClock,
  IconHeartHandshake,
  IconLogin,
  IconRefresh,
  IconShieldCheck,
  IconUserPlus,
} from "@tabler/icons-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePlatform } from "@/context/PlatformContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

const TG_COPY = {
  uz: {
    eyebrow: "OnaCare Telegram Mini App",
    checkingTitle: "Kabinetga xavfsiz kirilmoqda...",
    checkingSub: "Telegram sessiyasi tekshirilmoqda va hisobingiz bilan moslanmoqda.",
    readyTitle: "Tasdiqlandi — yo'naltirilmoqda",
    notInTgTitle: "Bu sahifa Telegram Mini App uchun",
    notInTgSub:
      "Telegram ichidagi «📱 Kabinet» tugmasini bosing yoki quyidagi havolalar orqali veb-kabinet va hamjamiyatga kiring.",
    notLinkedTitle: "Telegram hisobingiz hali bog'lanmagan",
    notLinkedSub:
      "Kabinetga kirish uchun avval saytda ro'yxatdan o'ting yoki tizimga kiring va Telegram profilingizni ulang.",
    pendingTitle: "Hisobingiz tasdiqlanmoqda",
    pendingSub:
      "Administrator hisobingizni ko'rib chiqmoqda. Tasdiqlangandan so'ng kabinetingiz avtomatik ochiladi.",
    rejectedTitle: "Hisob arizasi rad etilgan",
    rejectedSub:
      "Batafsil ma'lumot uchun @OnaCarePatronajBot yoki poliklinika qabulxonasiga murojaat qiling.",
    errorTitle: "Kirishda xatolik yuz berdi",
    openBotBtn: "Telegram botni ochish",
    loginBtn: "Kirish (Web)",
    signupBtn: "Ro'yxatdan o'tish",
    communityBtn: "Onalar hamjamiyati",
    retryBtn: "Qayta tekshirish",
    emergencyNote: "Shoshilinch holatda darhol 103 raqamiga qo'ng'iroq qiling.",
  },
  ru: {
    eyebrow: "OnaCare Telegram Mini App",
    checkingTitle: "Безопасный вход в кабинет...",
    checkingSub: "Проверяем подпись Telegram и связываем ваш профиль.",
    readyTitle: "Подтверждено — перенаправляем",
    notInTgTitle: "Страница для Telegram Mini App",
    notInTgSub:
      "Нажмите кнопку «📱 Kabinet» внутри Telegram-бота или откройте веб-кабинет и сообщество мам ниже.",
    notLinkedTitle: "Ваш Telegram еще не привязан",
    notLinkedSub:
      "Войдите или зарегистрируйтесь на сайте, затем привяжите свой аккаунт в настройках профиля.",
    pendingTitle: "Аккаунт проходит проверку",
    pendingSub:
      "Координатор клиники проверяет вашу заявку. После подтверждения кабинет откроется автоматически.",
    rejectedTitle: "Заявка отклонена",
    rejectedSub:
      "Для уточнения деталей обратитесь в @OnaCarePatronajBot или в регистратуру поликлиники.",
    errorTitle: "Ошибка авторизации Telegram",
    openBotBtn: "Открыть Telegram-бота",
    loginBtn: "Войти на сайте",
    signupBtn: "Регистрация",
    communityBtn: "Сообщество мам",
    retryBtn: "Повторить",
    emergencyNote: "При экстренных симптомах немедленно звоните 103.",
  },
  en: {
    eyebrow: "OnaCare Telegram Mini App",
    checkingTitle: "Signing in securely...",
    checkingSub: "Verifying your Telegram WebApp session and loading your portal.",
    readyTitle: "Verified — redirecting",
    notInTgTitle: "Telegram Mini App Entry",
    notInTgSub:
      "Open the «📱 Kabinet» menu button inside our Telegram bot, or use the web portal links below.",
    notLinkedTitle: "Telegram Account Not Linked Yet",
    notLinkedSub:
      "Sign in or create your OnaCare account first, then link Telegram from your portal settings.",
    pendingTitle: "Account Pending Verification",
    pendingSub:
      "A clinic coordinator is reviewing your registration. Your portal opens automatically once approved.",
    rejectedTitle: "Account Application Declined",
    rejectedSub:
      "Please contact @OnaCarePatronajBot or your local clinic reception for assistance.",
    errorTitle: "Unable to Verify Telegram Session",
    openBotBtn: "Open Telegram Bot",
    loginBtn: "Sign In (Web)",
    signupBtn: "Create Account",
    communityBtn: "Mothers Community",
    retryBtn: "Try Again",
    emergencyNote: "In an emergency, call 103 immediately.",
  },
};

function MiniAppInner() {
  const router = useRouter();
  const { lang } = useLanguage();
  const { refreshData } = usePlatform();
  const t = TG_COPY[lang] || TG_COPY.uz;
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "OnaCarePatronajBot";

  const [status, setStatus] = useState("checking"); // checking | ready | not_in_tg | not_linked | pending | rejected | error
  const [errorMessage, setErrorMessage] = useState("");
  const startedRef = useRef(false);

  const authenticate = useCallback(async () => {
    setStatus("checking");
    setErrorMessage("");
    const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : null;
    if (tg) {
      try {
        tg.ready();
        tg.expand();
      } catch {
        // ignore SDK readiness quirks
      }
    }

    const initData = tg?.initData || "";
    if (!initData) {
      setStatus("not_in_tg");
      return;
    }

    try {
      const res = await fetch("/api/telegram/webapp-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ initData }),
      });
      const json = await res.json();
      if (res.ok && json.authenticated && json.portalPath) {
        setStatus("ready");
        await refreshData();
        router.replace(json.portalPath);
        return;
      }
      if (json.code === "NOT_LINKED") {
        setStatus("not_linked");
        return;
      }
      if (json.code === "PENDING_VERIFICATION") {
        setStatus("pending");
        return;
      }
      if (json.code === "REJECTED") {
        setStatus("rejected");
        return;
      }
      setErrorMessage(json.error || "");
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }, [refreshData, router]);

  useEffect(() => {
    if (startedRef.current) return;
    const timer = setTimeout(() => {
      if (startedRef.current) return;
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        startedRef.current = true;
        authenticate();
      } else {
        startedRef.current = true;
        authenticate();
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [authenticate]);

  const title =
    status === "checking"
      ? t.checkingTitle
      : status === "ready"
        ? t.readyTitle
        : status === "not_in_tg"
          ? t.notInTgTitle
          : status === "not_linked"
            ? t.notLinkedTitle
            : status === "pending"
              ? t.pendingTitle
              : status === "rejected"
                ? t.rejectedTitle
                : t.errorTitle;

  const subtitle =
    status === "checking" || status === "ready"
      ? t.checkingSub
      : status === "not_in_tg"
        ? t.notInTgSub
        : status === "not_linked"
          ? t.notLinkedSub
          : status === "pending"
            ? t.pendingSub
            : status === "rejected"
              ? t.rejectedSub
              : errorMessage || t.notInTgSub;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F7F5EF] dark:bg-[#161A18] text-[#292E2B] dark:text-[#F3F0E8] px-4 py-6">
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (!startedRef.current && window.Telegram?.WebApp?.initData) {
            startedRef.current = true;
            authenticate();
          }
        }}
      />

      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-2">
        <Link href="/" className="inline-flex items-center gap-2 font-heading text-base font-bold text-[#244C40] dark:text-[#F3F0E8]">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#244C40] text-[#F7F5EF]">
            <IconHeartHandshake className="h-4 w-4" />
          </span>
          <span>OnaCare</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <main className="mx-auto my-8 w-full max-w-md">
        <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border ${
                status === "ready"
                  ? "border-[#A7BBAA] bg-[#EFECE3] text-[#244C40]"
                  : status === "pending"
                    ? "border-[#DDD8CC] bg-[#EFECE3] text-[#9A6B42]"
                    : status === "rejected" || status === "error"
                      ? "border-[#D9B8AE] bg-[#F3EAE7] text-[#9E4747]"
                      : "border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#242A27] text-[#244C40] dark:text-[#A7BBAA]"
              }`}
            >
              {status === "ready" ? (
                <IconCheck className="h-5 w-5" />
              ) : status === "pending" ? (
                <IconClock className="h-5 w-5" />
              ) : status === "rejected" || status === "error" ? (
                <IconAlertTriangle className="h-5 w-5" />
              ) : (
                <IconBrandTelegram className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#525954] dark:text-[#B8C2BA]">
                {t.eyebrow}
              </p>
              <h1 className="font-heading text-lg font-semibold text-[#292E2B] dark:text-[#F3F0E8]">
                {title}
              </h1>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-[#525954] dark:text-[#B8C2BA]">{subtitle}</p>

          {status === "checking" && (
            <div className="flex items-center gap-2 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3.5 py-2.5 text-xs text-[#244C40] dark:text-[#A7BBAA]">
              <IconShieldCheck className="h-4 w-4 animate-pulse" />
              <span>HMAC-SHA256</span>
            </div>
          )}

          {status !== "checking" && status !== "ready" && (
            <div className="space-y-2.5 pt-1">
              <a
                href={`https://t.me/${botUsername}?start=webapp`}
                target="_blank"
                rel="noreferrer"
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-sm bg-[#244C40] hover:bg-[#1A382F] dark:bg-[#2C5B4D] px-4 py-2.5 text-xs font-semibold text-[#F7F5EF] transition-colors"
              >
                <IconBrandTelegram className="h-4 w-4" />
                <span>{t.openBotBtn}</span>
                <IconArrowRight className="h-3.5 w-3.5" />
              </a>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-2 text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8] hover:border-[#244C40]"
                >
                  <IconLogin className="h-3.5 w-3.5" />
                  <span>{t.loginBtn}</span>
                </Link>
                <Link
                  href="/signup?role=PATIENT"
                  className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-2 text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8] hover:border-[#244C40]"
                >
                  <IconUserPlus className="h-3.5 w-3.5" />
                  <span>{t.signupBtn}</span>
                </Link>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#DDD8CC] dark:border-[#2F3733]">
                <Link
                  href="/hamjamiyat"
                  className="text-xs font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:underline underline-offset-4"
                >
                  {t.communityBtn} →
                </Link>
                <button
                  type="button"
                  onClick={authenticate}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#525954] dark:text-[#B8C2BA] hover:text-[#244C40]"
                >
                  <IconRefresh className="h-3.5 w-3.5" />
                  <span>{t.retryBtn}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-md text-center">
        <p className="rounded-sm border border-[#D9B8AE] dark:border-[#6B3A3A] bg-[#F3EAE7]/80 dark:bg-[#2E1E1D]/60 px-3 py-2 text-[11px] font-medium text-[#7A2E2E] dark:text-[#F0C8C4]">
          {t.emergencyNote}
        </p>
      </footer>
    </div>
  );
}

export default function TelegramMiniAppPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF] text-xs text-[#525954]">
          OnaCare Telegram Mini App...
        </div>
      }
    >
      <MiniAppInner />
    </Suspense>
  );
}
