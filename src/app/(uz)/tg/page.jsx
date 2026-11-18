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
  IconEye,
  IconEyeOff,
  IconHeartHandshake,
  IconLock,
  IconLogin,
  IconRefresh,
  IconShieldCheck,
  IconUserPlus,
} from "@tabler/icons-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePlatform } from "@/context/PlatformContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

function getPortalForRole(role) {
  switch (role) {
    case "PATIENT":
      return "/patient";
    case "OVABMU_MD":
    case "FAMILY_MD":
      return "/clinical";
    case "PSYCHOLOGIST":
      return "/psychologist";
    case "ADMIN_RECEPTION":
      return "/admin";
    default:
      return "/patient";
  }
}

const TG_COPY = {
  uz: {
    eyebrow: "OnaCare Telegram Mini App",
    checkingTitle: "Kabinetga xavfsiz kirilmoqda...",
    checkingSub: "Telegram sessiyasi tekshirilmoqda va hisobingiz bilan moslanmoqda.",
    readyTitle: "Tasdiqlandi — kabinetga yo'naltirilmoqda",
    notInTgTitle: "Kabinetga kirish (Mini App)",
    notInTgSub:
      "OnaCare hisobingizga kiring — keyingi safar Telegram botdan ochganingizda darhol kabinetingiz ochiladi.",
    notLinkedTitle: "Hisobingizni Telegram bilan bog'lang",
    notLinkedSub:
      "Bir marta kiring: hisobingiz ushbu Telegram profiliga avtomatik ulanadi va kabinetingiz darhol ochiladi.",
    pendingTitle: "Hisobingiz tasdiqlanmoqda",
    pendingSub:
      "Administrator hisobingizni ko'rib chiqmoqda. Tasdiqlangandan so'ng kabinetingiz avtomatik ochiladi.",
    rejectedTitle: "Hisob arizasi rad etilgan",
    rejectedSub:
      "Batafsil ma'lumot uchun @OnaCarePatronajBot yoki poliklinika qabulxonasiga murojaat qiling.",
    errorTitle: "Kirishda xatolik yuz berdi",
    emailLabel: "Elektron pochta",
    emailPlaceholder: "ism@example.uz",
    passwordLabel: "Parol",
    passwordPlaceholder: "Parolingizni kiriting",
    signInSubmitBtn: "Kirish va kabinetni ochish",
    signingInBtn: "Tekshirilmoqda...",
    openBotBtn: "Telegram botni ochish",
    signupBtn: "Ro'yxatdan o'tish",
    communityBtn: "Onalar hamjamiyati",
    retryBtn: "Qayta tekshirish",
    emergencyNote: "Shoshilinch holatda darhol 103 raqamiga qo'ng'iroq qiling.",
  },
  ru: {
    eyebrow: "OnaCare Telegram Mini App",
    checkingTitle: "Безопасный вход в кабинет...",
    checkingSub: "Проверяем подпись Telegram и связываем ваш профиль.",
    readyTitle: "Подтверждено — открываем кабинет",
    notInTgTitle: "Вход в кабинет (Mini App)",
    notInTgSub:
      "Войдите в свой аккаунт OnaCare — при следующем запуске из Telegram ваш кабинет откроется автоматически.",
    notLinkedTitle: "Привяжите аккаунт к Telegram",
    notLinkedSub:
      "Войдите один раз: ваш аккаунт автоматически привяжется к этому Telegram-профилю и сразу откроется кабинет.",
    pendingTitle: "Аккаунт проходит проверку",
    pendingSub:
      "Координатор клиники проверяет вашу заявку. После подтверждения кабинет откроется автоматически.",
    rejectedTitle: "Заявка отклонена",
    rejectedSub:
      "Для уточнения деталей обратитесь в @OnaCarePatronajBot или в регистратуру поликлиники.",
    errorTitle: "Ошибка авторизации Telegram",
    emailLabel: "Электронная почта",
    emailPlaceholder: "name@example.uz",
    passwordLabel: "Пароль",
    passwordPlaceholder: "Введите пароль",
    signInSubmitBtn: "Войти и открыть кабинет",
    signingInBtn: "Входим...",
    openBotBtn: "Открыть Telegram-бота",
    signupBtn: "Регистрация",
    communityBtn: "Сообщество мам",
    retryBtn: "Повторить",
    emergencyNote: "При экстренных симптомах немедленно звоните 103.",
  },
  en: {
    eyebrow: "OnaCare Telegram Mini App",
    checkingTitle: "Signing in securely...",
    checkingSub: "Verifying your Telegram WebApp session and loading your portal.",
    readyTitle: "Verified — opening dashboard",
    notInTgTitle: "Sign In to OnaCare Mini App",
    notInTgSub:
      "Sign in with your OnaCare email and password to go straight to your dashboard.",
    notLinkedTitle: "Link Your Account to Telegram",
    notLinkedSub:
      "Sign in once below: your OnaCare account will be linked to this Telegram profile and open your dashboard right away.",
    pendingTitle: "Account Pending Verification",
    pendingSub:
      "A clinic coordinator is reviewing your registration. Your portal opens automatically once approved.",
    rejectedTitle: "Account Application Declined",
    rejectedSub:
      "Please contact @OnaCarePatronajBot or your local clinic reception for assistance.",
    errorTitle: "Unable to Verify Telegram Session",
    emailLabel: "Email address",
    emailPlaceholder: "name@example.uz",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    signInSubmitBtn: "Sign In & Open Dashboard",
    signingInBtn: "Signing in...",
    openBotBtn: "Open Telegram Bot",
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
  const [tgGreetingName, setTgGreetingName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submittingLogin, setSubmittingLogin] = useState(false);
  const [loginError, setLoginError] = useState("");

  const attemptedInitDataRef = useRef(false);
  const initialCheckStartedRef = useRef(false);

  const getTgInitData = useCallback(() => {
    if (typeof window === "undefined") return "";
    const tg = window.Telegram?.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand();
      } catch {
        // ignore SDK readiness quirks
      }
    }
    return tg?.initData || "";
  }, []);

  const redirectToPortal = useCallback(
    async (targetPath) => {
      setStatus("ready");
      await refreshData();
      router.replace(targetPath);
    },
    [refreshData, router]
  );

  const authenticate = useCallback(
    async (forceInitDataCheck = false) => {
      setStatus("checking");
      setErrorMessage("");
      setLoginError("");

      const initData = getTgInitData();
      if (initData) {
        attemptedInitDataRef.current = true;
        try {
          const res = await fetch("/api/telegram/webapp-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ initData }),
          });
          const json = await res.json().catch(() => ({}));
          const portalTarget = json.redirectTo || json.portalPath;
          if (res.ok && json.authenticated && portalTarget) {
            await redirectToPortal(portalTarget);
            return;
          }
          if (json.telegramUser?.firstName) {
            setTgGreetingName(json.telegramUser.firstName);
          }
          if (json.code === "NOT_LINKED" || json.linked === false) {
            setStatus("not_linked");
            return;
          }
          if (json.code === "PENDING_VERIFICATION" || json.verificationStatus === "PENDING") {
            setStatus("pending");
            return;
          }
          if (json.code === "REJECTED" || json.verificationStatus === "REJECTED") {
            setStatus("rejected");
            return;
          }
          setErrorMessage(json.error || "");
          setStatus("error");
          return;
        } catch {
          setStatus("error");
          return;
        }
      }

      if (forceInitDataCheck) {
        return;
      }

      // No initData: check if the user already has a valid browser/WebView session
      try {
        const meRes = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (meRes.ok) {
          const me = await meRes.json().catch(() => null);
          if (me?.authenticated && me.user?.role) {
            await redirectToPortal(getPortalForRole(me.user.role));
            return;
          }
        }
      } catch {
        // ignore and show sign-in UI
      }

      setStatus("not_in_tg");
    },
    [getTgInitData, redirectToPortal]
  );

  useEffect(() => {
    if (initialCheckStartedRef.current) return;
    const timer = setTimeout(() => {
      if (initialCheckStartedRef.current) return;
      initialCheckStartedRef.current = true;
      authenticate(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [authenticate]);

  const handleInlineSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoginError("");
    setSubmittingLogin(true);
    try {
      const initData = getTgInitData();
      const res = await fetch("/api/telegram/webapp-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
          ...(initData ? { initData } : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      const portalTarget = json.redirectTo || json.portalPath;
      if (res.ok && json.authenticated && portalTarget) {
        await redirectToPortal(portalTarget);
        return;
      }
      if (json.code === "PENDING_VERIFICATION" || json.verificationStatus === "PENDING") {
        setStatus("pending");
        return;
      }
      if (json.code === "REJECTED" || json.verificationStatus === "REJECTED") {
        setStatus("rejected");
        return;
      }
      setLoginError(json.error || t.errorTitle);
    } catch {
      setLoginError(t.errorTitle);
    } finally {
      setSubmittingLogin(false);
    }
  };

  const title =
    status === "checking"
      ? t.checkingTitle
      : status === "ready"
        ? t.readyTitle
        : status === "not_in_tg"
          ? t.notInTgTitle
          : status === "not_linked"
            ? tgGreetingName
              ? `${tgGreetingName} — ${t.notLinkedTitle}`
              : t.notLinkedTitle
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

  const showSignInForm = status === "not_in_tg" || status === "not_linked" || status === "error";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F7F5EF] dark:bg-[#161A18] text-[#292E2B] dark:text-[#F3F0E8] px-4 py-6">
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (!attemptedInitDataRef.current && window.Telegram?.WebApp?.initData) {
            initialCheckStartedRef.current = true;
            authenticate(true);
          }
        }}
      />

      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-heading text-base font-bold text-[#244C40] dark:text-[#F3F0E8]"
        >
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

      <main className="mx-auto my-6 w-full max-w-md">
        <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-5 sm:p-6 space-y-5">
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

          {showSignInForm && (
            <form onSubmit={handleInlineSignIn} className="space-y-3 pt-1">
              <div>
                <label
                  htmlFor="tg-login-email"
                  className="block text-[11px] font-semibold text-[#292E2B] dark:text-[#F3F0E8] mb-1"
                >
                  {t.emailLabel}
                </label>
                <input
                  id="tg-login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="min-h-[42px] w-full rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-2 text-xs text-[#292E2B] dark:text-[#F3F0E8] focus:border-[#244C40] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="tg-login-password"
                  className="block text-[11px] font-semibold text-[#292E2B] dark:text-[#F3F0E8] mb-1"
                >
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <input
                    id="tg-login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="min-h-[42px] w-full rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 pr-10 py-2 text-xs text-[#292E2B] dark:text-[#F3F0E8] focus:border-[#244C40] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#525954] hover:text-[#292E2B] dark:text-[#B8C2BA]"
                  >
                    {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="rounded-sm border border-[#D9B8AE] bg-[#F3EAE7] px-3 py-2 text-[11px] font-semibold text-[#7A2E2E]">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={submittingLogin || !email.trim() || !password}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-sm bg-[#244C40] hover:bg-[#1A382F] dark:bg-[#2C5B4D] px-4 py-2.5 text-xs font-semibold text-[#F7F5EF] transition-colors disabled:opacity-50"
              >
                <IconLogin className="h-4 w-4" />
                <span>{submittingLogin ? t.signingInBtn : t.signInSubmitBtn}</span>
                <IconArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}

          {status !== "checking" && status !== "ready" && (
            <div className="space-y-2.5 pt-2 border-t border-[#DDD8CC] dark:border-[#2F3733]">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/signup?role=PATIENT"
                  className="min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-2 text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8] hover:border-[#244C40]"
                >
                  <IconUserPlus className="h-3.5 w-3.5" />
                  <span>{t.signupBtn}</span>
                </Link>
                <a
                  href={`https://t.me/${botUsername}?start=webapp`}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-2 text-xs font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:border-[#244C40]"
                >
                  <IconBrandTelegram className="h-3.5 w-3.5" />
                  <span>{t.openBotBtn}</span>
                </a>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/hamjamiyat"
                  className="text-xs font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:underline underline-offset-4"
                >
                  {t.communityBtn} →
                </Link>
                <button
                  type="button"
                  onClick={() => authenticate(false)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#525954] dark:text-[#B8C2BA] hover:text-[#244C40]"
                >
                  <IconRefresh className="h-3.5 w-3.5" />
                  <span>{t.retryBtn}</span>
                </button>
              </div>

              <p className="flex items-center gap-1.5 text-[10px] text-[#525954] dark:text-[#B8C2BA]">
                <IconLock className="h-3 w-3 shrink-0" />
                <span>HTTPS + HMAC-SHA256</span>
              </p>
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
