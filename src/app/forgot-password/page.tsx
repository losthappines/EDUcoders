"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconKey,
  IconLock,
} from "@tabler/icons-react";
import { PublicHeader } from "@/components/PublicHeader";
import { useLanguage, type AppLang } from "@/context/LanguageContext";

const COPY: Record<
  AppLang,
  {
    badge: string;
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    requestBtn: string;
    requesting: string;
    codeLabel: string;
    newPwLabel: string;
    newPwPlaceholder: string;
    confirmPwLabel: string;
    confirmPwPlaceholder: string;
    togglePw: string;
    resetBtn: string;
    resetting: string;
    backToLogin: string;
    demoNote: string;
    codeReadyInfo: string;
    noAccountErr: string;
    mismatchErr: string;
    requestErr: string;
    resetErr: string;
    doneInfo: string;
  }
> = {
  uz: {
    badge: "Hisobni tiklash",
    title: "Parolni tiklash",
    subtitle:
      "OnaCare hisobingizga biriktirilgan elektron pochtani kiriting va 6 xonali tasdiqlash kodini oling.",
    emailLabel: "Elektron pochta manzili",
    emailPlaceholder: "ism@example.uz",
    requestBtn: "Tasdiqlash kodini olish",
    requesting: "Kod tayyorlanmoqda...",
    codeLabel: "6 xonali tasdiqlash kodi",
    newPwLabel: "Yangi parol (kamida 6 belgi)",
    newPwPlaceholder: "Kamida 6 ta belgi",
    confirmPwLabel: "Yangi parolni tasdiqlang",
    confirmPwPlaceholder: "Yangi parolni qayta kiriting",
    togglePw: "Parolni ko'rsatish yoki yashirish",
    resetBtn: "Parolni yangilash",
    resetting: "Yangilanmoqda...",
    backToLogin: "Kirish sahifasiga qaytish",
    demoNote: "Demo tasdiqlash kodi (pochta serveri ulanmagan):",
    codeReadyInfo:
      "Tasdiqlash kodi tayyorlandi. Quyiga 6 xonali kod va yangi parolingizni kiriting.",
    noAccountErr: "Bu elektron pochta manzili bilan hisob topilmadi.",
    mismatchErr: "Kiritilgan parollar bir-biriga mos emas.",
    requestErr: "Tasdiqlash kodini yuborib bo'lmadi.",
    resetErr: "Parolni yangilab bo'lmadi.",
    doneInfo: "Parol muvaffaqiyatli yangilandi. Endi tizimga kirishingiz mumkin.",
  },
  ru: {
    badge: "Восстановление доступа",
    title: "Сброс пароля",
    subtitle:
      "Введите email вашего аккаунта OnaCare, чтобы получить 6-значный код подтверждения.",
    emailLabel: "Электронная почта аккаунта",
    emailPlaceholder: "name@example.uz",
    requestBtn: "Получить код сброса",
    requesting: "Подготовка кода...",
    codeLabel: "6-значный код подтверждения",
    newPwLabel: "Новый пароль (мин. 6 символов)",
    newPwPlaceholder: "Не менее 6 символов",
    confirmPwLabel: "Подтвердите новый пароль",
    confirmPwPlaceholder: "Повторите новый пароль",
    togglePw: "Показать или скрыть пароль",
    resetBtn: "Обновить пароль",
    resetting: "Обновление...",
    backToLogin: "Вернуться ко входу",
    demoNote: "Демо-код подтверждения (без SMTP):",
    codeReadyInfo: "Код создан. Введите 6-значный код и новый пароль ниже.",
    noAccountErr: "Аккаунт с таким email не найден.",
    mismatchErr: "Пароли не совпадают.",
    requestErr: "Не удалось отправить код сброса.",
    resetErr: "Не удалось обновить пароль.",
    doneInfo: "Пароль успешно обновлен. Теперь вы можете войти.",
  },
  en: {
    badge: "Account Recovery",
    title: "Reset Your Password",
    subtitle:
      "Enter the email associated with your OnaCare account to receive a 6-digit verification code.",
    emailLabel: "Account Email Address",
    emailPlaceholder: "name@example.uz",
    requestBtn: "Send Reset Code",
    requesting: "Preparing reset code...",
    codeLabel: "6-Digit Verification Code",
    newPwLabel: "New Password (min 6 chars)",
    newPwPlaceholder: "At least 6 characters",
    confirmPwLabel: "Confirm New Password",
    confirmPwPlaceholder: "Repeat new password",
    togglePw: "Toggle password visibility",
    resetBtn: "Update Password",
    resetting: "Updating password...",
    backToLogin: "Back to Sign In",
    demoNote: "Demo Verification Code (no email server configured):",
    codeReadyInfo:
      "Verification code generated. Enter the 6-digit code and your new password below.",
    noAccountErr: "No account found for that email address.",
    mismatchErr: "Passwords do not match.",
    requestErr: "Unable to send reset code.",
    resetErr: "Failed to reset password.",
    doneInfo: "Password updated successfully. You can now sign in.",
  },
};

export default function ForgotPasswordPage() {
  const { lang } = useLanguage();
  const t = COPY[lang];

  const [step, setStep] = useState<"REQUEST" | "RESET" | "DONE">("REQUEST");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REQUEST", email }),
      });
      const json = (await res.json()) as {
        error?: string;
        accountFound?: boolean;
        resetToken?: string;
        demoVerificationCode?: string;
      };
      if (!res.ok) {
        setError(json.error || t.requestErr);
        return;
      }
      if (json.accountFound && json.resetToken) {
        setResetToken(json.resetToken);
        setDemoCode(json.demoVerificationCode ?? null);
        setStep("RESET");
        setInfo(t.codeReadyInfo);
      } else {
        setError(t.noAccountErr);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError(t.mismatchErr);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET",
          email,
          code,
          resetToken,
          newPassword,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error || t.resetErr);
        return;
      }
      setInfo(t.doneInfo);
      setStep("DONE");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <IconLock className="h-3 w-3" />
              {t.badge}
            </span>
            <h1 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              {t.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t.subtitle}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 px-3.5 py-2.5 text-xs font-semibold text-rose-800 dark:text-rose-200"
            >
              <IconAlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200 space-y-1">
              <p>{info}</p>
              {demoCode && step === "RESET" && (
                <p className="font-mono text-xs text-teal-800 dark:text-teal-300">
                  {t.demoNote} <strong>{demoCode}</strong>
                </p>
              )}
            </div>
          )}

          {step === "REQUEST" && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t.emailLabel}
                </label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition"
              >
                <IconKey className="h-4 w-4" />
                {busy ? t.requesting : t.requestBtn}
              </button>
            </form>
          )}

          {step === "RESET" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="reset-code"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t.codeLabel}
                </label>
                <input
                  id="reset-code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="reset-new-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t.newPwLabel}
                </label>
                <div className="relative">
                  <input
                    id="reset-new-password"
                    name="newPassword"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t.newPwPlaceholder}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    aria-label={t.togglePw}
                  >
                    {showPw ? (
                      <IconEyeOff className="h-4 w-4" />
                    ) : (
                      <IconEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reset-confirm-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t.confirmPwLabel}
                </label>
                <input
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPwPlaceholder}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition"
              >
                <IconCheck className="h-4 w-4" />
                {busy ? t.resetting : t.resetBtn}
              </button>
            </form>
          )}

          {step === "DONE" && (
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
            >
              {t.backToLogin}
            </Link>
          )}

          <div className="pt-1 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400"
            >
              <IconArrowLeft className="h-3.5 w-3.5" />
              {t.backToLogin}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
