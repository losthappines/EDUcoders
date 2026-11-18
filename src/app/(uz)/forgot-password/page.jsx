"use client";
import React, { useState } from "react";
import Link from "next/link";
import { IconAlertTriangle, IconArrowLeft, IconCheck, IconEye, IconEyeOff, IconKey, IconLock, } from "@tabler/icons-react";
import { PublicHeader } from "@/components/PublicHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/context/LanguageContext";
const COPY = {
    uz: {
        badge: "Hisobni tiklash",
        title: "Parolni tiklash",
        subtitle: "OnaCare hisobingizga biriktirilgan elektron pochtani kiriting va 6 xonali tasdiqlash kodini oling.",
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
        codeReadyInfo: "Tasdiqlash kodi tayyorlandi. Quyiga 6 xonali kod va yangi parolingizni kiriting.",
        noAccountErr: "Bu elektron pochta manzili bilan hisob topilmadi.",
        mismatchErr: "Kiritilgan parollar bir-biriga mos emas.",
        requestErr: "Tasdiqlash kodini yuborib bo'lmadi.",
        resetErr: "Parolni yangilab bo'lmadi.",
        doneInfo: "Parol muvaffaqiyatli yangilandi. Endi tizimga kirishingiz mumkin.",
    },
    ru: {
        badge: "Восстановление доступа",
        title: "Сброс пароля",
        subtitle: "Введите email вашего аккаунта OnaCare, чтобы получить 6-значный код подтверждения.",
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
        subtitle: "Enter the email associated with your OnaCare account to receive a 6-digit verification code.",
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
        codeReadyInfo: "Verification code generated. Enter the 6-digit code and your new password below.",
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
    const [step, setStep] = useState("REQUEST");
    const [email, setEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [demoCode, setDemoCode] = useState(null);
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);
    const handleRequestCode = async (e) => {
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
            const json = (await res.json());
            if (!res.ok) {
                setError(json.error || t.requestErr);
                return;
            }
            if (json.resetToken) {
                setResetToken(json.resetToken);
                setDemoCode(json.demoVerificationCode ?? null);
                setStep("RESET");
                setInfo(json.message || t.codeReadyInfo);
            }
            else {
                setInfo(json.message || t.codeReadyInfo);
            }
        }
        finally {
            setBusy(false);
        }
    };
    const handleResetPassword = async (e) => {
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
            const json = (await res.json());
            if (!res.ok) {
                setError(json.error || t.resetErr);
                return;
            }
            setInfo(t.doneInfo);
            setStep("DONE");
        }
        finally {
            setBusy(false);
        }
    };
    return (<div className="min-h-screen flex flex-col bg-[#F7F5EF] dark:bg-[#161A18] text-[#292E2B] dark:text-[#F3F0E8] transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center px-5 sm:px-8 py-12 sm:py-16">
        <div className="w-full max-w-md border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-6 sm:p-9 rounded-sm space-y-6">
          <div className="border-b border-[#DDD8CC] dark:border-[#2F3733] pb-5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#244C40] dark:text-[#A7BBAA]">
              <IconLock className="h-3.5 w-3.5"/>
              {t.badge}
            </span>
            <h1 className="font-heading mt-2 text-2xl font-semibold tracking-tight text-[#292E2B] dark:text-[#F3F0E8]">
              {t.title}
            </h1>
            <p className="text-sm text-[#525954] dark:text-[#B8C2BA] mt-2 leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {error && (<div role="alert" className="flex items-center gap-2.5 border-l-4 border-[#9E4747] bg-[#F3EAE7] dark:bg-[#2E1E1D] px-4 py-3 text-xs font-semibold text-[#7A2E2E] dark:text-[#F0C8C4]">
              <IconAlertTriangle className="h-4 w-4 shrink-0"/>
              <span>{error}</span>
            </div>)}

          {info && (<div className="border-l-4 border-[#244C40] bg-[#EFECE3] dark:bg-[#242A27] px-4 py-3 text-xs font-medium text-[#292E2B] dark:text-[#F3F0E8] space-y-1">
              <p>{info}</p>
              {demoCode && step === "RESET" && (<p className="font-mono text-xs text-[#244C40] dark:text-[#A7BBAA]">
                  {t.demoNote} <strong>{demoCode}</strong>
                </p>)}
            </div>)}

          {step === "REQUEST" && (<form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold uppercase tracking-[0.06em] text-[#525954] dark:text-[#B8C2BA] mb-1.5">
                  {t.emailLabel}
                </label>
                <input id="forgot-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} className="w-full min-h-[44px] rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF]/60 dark:bg-[#161A18] px-3.5 py-2.5 text-sm text-[#292E2B] dark:text-[#F3F0E8] placeholder:text-[#767E78] focus:border-[#244C40] dark:focus:border-[#A7BBAA] focus:outline-none transition-colors"/>
              </div>

              <button type="submit" disabled={busy} className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-sm bg-[#244C40] dark:bg-[#2C5B4D] px-5 py-2.5 text-sm font-semibold text-[#F7F5EF] hover:bg-[#1B3A31] dark:hover:bg-[#356C5C] disabled:opacity-50 transition-colors">
                <IconKey className="h-4 w-4"/>
                {busy ? t.requesting : t.requestBtn}
              </button>
            </form>)}

          {step === "RESET" && (<form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="reset-code" className="block text-xs font-semibold uppercase tracking-[0.06em] text-[#525954] dark:text-[#B8C2BA] mb-1.5">
                  {t.codeLabel}
                </label>
                <input id="reset-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" className="w-full min-h-[44px] rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF]/60 dark:bg-[#161A18] px-3.5 py-2.5 font-mono text-sm text-[#292E2B] dark:text-[#F3F0E8] placeholder:text-[#767E78] focus:border-[#244C40] dark:focus:border-[#A7BBAA] focus:outline-none transition-colors"/>
              </div>

              <div>
                <label htmlFor="reset-new-password" className="block text-xs font-semibold uppercase tracking-[0.06em] text-[#525954] dark:text-[#B8C2BA] mb-1.5">
                  {t.newPwLabel}
                </label>
                <div className="relative">
                  <input id="reset-new-password" name="newPassword" type={showPw ? "text" : "password"} autoComplete="new-password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t.newPwPlaceholder} className="w-full min-h-[44px] rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF]/60 dark:bg-[#161A18] px-3.5 py-2.5 pr-11 text-sm text-[#292E2B] dark:text-[#F3F0E8] placeholder:text-[#767E78] focus:border-[#244C40] dark:focus:border-[#A7BBAA] focus:outline-none transition-colors"/>
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center text-[#525954] hover:text-[#292E2B] dark:text-[#B8C2BA] dark:hover:text-[#F3F0E8]" aria-label={t.togglePw}>
                    {showPw ? (<IconEyeOff className="h-4 w-4"/>) : (<IconEye className="h-4 w-4"/>)}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reset-confirm-password" className="block text-xs font-semibold uppercase tracking-[0.06em] text-[#525954] dark:text-[#B8C2BA] mb-1.5">
                  {t.confirmPwLabel}
                </label>
                <input id="reset-confirm-password" name="confirmPassword" type={showPw ? "text" : "password"} autoComplete="new-password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t.confirmPwPlaceholder} className="w-full min-h-[44px] rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF]/60 dark:bg-[#161A18] px-3.5 py-2.5 text-sm text-[#292E2B] dark:text-[#F3F0E8] placeholder:text-[#767E78] focus:border-[#244C40] dark:focus:border-[#A7BBAA] focus:outline-none transition-colors"/>
              </div>

              <button type="submit" disabled={busy} className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-sm bg-[#244C40] dark:bg-[#2C5B4D] px-5 py-2.5 text-sm font-semibold text-[#F7F5EF] hover:bg-[#1B3A31] dark:hover:bg-[#356C5C] disabled:opacity-50 transition-colors">
                <IconCheck className="h-4 w-4"/>
                {busy ? t.resetting : t.resetBtn}
              </button>
            </form>)}

          {step === "DONE" && (<Link href="/login" className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-sm bg-[#244C40] dark:bg-[#2C5B4D] px-5 py-2.5 text-sm font-semibold text-[#F7F5EF] hover:bg-[#1B3A31] dark:hover:bg-[#356C5C] transition-colors">
              {t.backToLogin}
            </Link>)}

          <div className="pt-2 border-t border-[#DDD8CC] dark:border-[#2F3733] text-center">
            <Link href="/login" className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-semibold text-[#525954] dark:text-[#B8C2BA] hover:text-[#244C40] dark:hover:text-[#F3F0E8]">
              <IconArrowLeft className="h-3.5 w-3.5"/>
              {t.backToLogin}
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>);
}
