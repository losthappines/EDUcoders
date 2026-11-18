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
    <div className="min-h-screen flex flex-col justify-between bg-[#F4F8F7] dark:bg-[#091315] text-slate-900 dark:text-slate-100 px-4 py-6">
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
          className="inline-flex items-center gap-2.5 font-heading text-lg font-bold text-slate-900 dark:text-white"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
            <IconHeartHandshake className="h-5 w-5" />
          </span>
          <span>OnaCare</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <main className="mx-auto my-6 w-full max-w-md oc-fade-up">
        <div className="med-card p-6 space-y-5">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                status === "ready"
                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                  : status === "pending"
                    ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                    : status === "rejected" || status === "error"
                      ? "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                      : "border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300"
              }`}
            >
              {status === "ready" ? (
                <IconCheck className="h-6 w-6" />
              ) : status === "pending" ? (
                <IconClock className="h-6 w-6" />
              ) : status === "rejected" || status === "error" ? (
                <IconAlertTriangle className="h-6 w-6" />
              ) : (
                <IconBrandTelegram className="h-6 w-6" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                {t.eyebrow}
              </p>
              <h1 className="font-heading text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {title}
              </h1>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{subtitle}</p>

          {status === "checking" && (
            <div className="flex items-center gap-2.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#16272B] px-4 py-3 text-sm font-medium text-teal-800 dark:text-teal-200">
              <IconShieldCheck className="h-5 w-5 animate-pulse" />
              <span>HMAC-SHA256</span>
            </div>
          )}

          {showSignInForm && (
            <form onSubmit={handleInlineSignIn} className="space-y-4 pt-1">
              <div>
                <label
                  htmlFor="tg-login-email"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
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
                  className="min-h-[48px] w-full rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-4 py-2.5 text-base sm:text-sm text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="tg-login-password"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
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
                    className="min-h-[48px] w-full rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-4 pr-12 py-2.5 text-base sm:text-sm text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  >
                    {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="oc-slide-down rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-4 py-2.5 text-sm font-semibold text-rose-700 dark:text-rose-200">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={submittingLogin || !email.trim() || !password}
                className="w-full min-h-[50px] inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-5 py-3 text-base sm:text-sm font-semibold text-white active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
              >
                <IconLogin className="h-5 w-5" />
                <span>{submittingLogin ? t.signingInBtn : t.signInSubmitBtn}</span>
                <IconArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {status !== "checking" && status !== "ready" && (
            <div className="space-y-3 pt-3 border-t border-[#D7E4E1] dark:border-[#1E353A]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Link
                  href="/signup?role=PATIENT"
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:border-teal-600 transition-colors"
                >
                  <IconUserPlus className="h-4 w-4 text-teal-700 dark:text-teal-300" />
                  <span>{t.signupBtn}</span>
                </Link>
                <a
                  href={`https://t.me/${botUsername}?start=webapp`}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-4 py-2.5 text-sm font-semibold text-teal-700 dark:text-teal-300 hover:border-teal-600 transition-colors"
                >
                  <IconBrandTelegram className="h-4 w-4" />
                  <span>{t.openBotBtn}</span>
                </a>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/hamjamiyat"
                  className="text-sm font-semibold text-teal-700 dark:text-teal-300 hover:underline underline-offset-4"
                >
                  {t.communityBtn} →
                </Link>
                <button
                  type="button"
                  onClick={() => authenticate(false)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-700 transition-colors"
                >
                  <IconRefresh className="h-4 w-4" />
                  <span>{t.retryBtn}</span>
                </button>
              </div>

              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <IconLock className="h-3.5 w-3.5 shrink-0" />
                <span>HTTPS + HMAC-SHA256</span>
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-md text-center">
        <p className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-4 py-2.5 text-xs font-semibold text-rose-700 dark:text-rose-200">
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
        <div className="min-h-screen flex items-center justify-center bg-[#F4F8F7] dark:bg-[#091315] text-sm font-medium text-slate-600 dark:text-slate-300">
          OnaCare Telegram Mini App...
        </div>
      }
    >
      <MiniAppInner />
    </Suspense>
  );
}
