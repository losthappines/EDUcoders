"use client";
import React, { useState } from "react";
import Link from "next/link";
import { IconAlertTriangle, IconArrowRight, IconBrandTelegram, IconEye, IconEyeOff, IconLock, IconLogin, IconShieldCheck, IconSparkles, IconStethoscope, IconUser, } from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
import { PublicHeader } from "@/components/PublicHeader";
import { SiteFooter } from "@/components/SiteFooter";

const COPY = {
    uz: {
        badge: "Shaxsiy va himoyalangan kirish",
        title: "OnaCare kabinetingizga kiring",
        subtitle: "Siz faqat o'zingizga tegishli kabinetga (ona, shifokor yoki koordinator) yo'naltirilasiz.",
        emailLabel: "Elektron pochta",
        emailPlaceholder: "ism@example.uz",
        passwordLabel: "Parol",
        passwordPlaceholder: "Parolingizni kiriting",
        togglePw: "Parolni ko'rsatish yoki yashirish",
        forgotPassword: "Parolni unutdingizmi?",
        submit: "Kirish",
        submitting: "Kirilmoqda...",
        newHere: "Hisobingiz yo'qmi?",
        createAccount: "Ro'yxatdan o'tish",
        guideTitle: "OnaCare hisobini ochish va Telegram ulash",
        guideSub: "SI yordamchisi yoki an'anaviy shakl orqali ro'yxatdan o'ting va hisobingizni Telegram botga bog'lang.",
        patientCta: "Bemor / Ona sifatida ro'yxatdan o'tish",
        patientCtaSub: "SI yordamchisi yoki shakl orqali tez hisob ochish",
        doctorCta: "Shifokor / Hamshira ro'yxatdan o'tishi",
        doctorCtaSub: "Mutaxassislik, tajriba va GPS lokatsiya bilan",
        adminCta: "Poliklinika koordinatori (Admin) yaratish",
        adminCtaSub: "Yangi bemor va shifokorlarni tasdiqlash uchun",
        telegramCta: "Telegram botga ulash va profilni ko'rish",
        telegramCtaSub: "Web yoki mobil Telegram botda ma'lumotlaringizni boshqaring",
        defaultError: "Elektron pochta yoki parol noto'g'ri.",
    },
    ru: {
        badge: "Защищенный личный вход",
        title: "Войдите в свой кабинет OnaCare",
        subtitle: "Вы попадете только в свой раздел (личный кабинет мамы, кабинет врача или координатора).",
        emailLabel: "Электронная почта",
        emailPlaceholder: "name@example.uz",
        passwordLabel: "Пароль",
        passwordPlaceholder: "Введите ваш пароль",
        togglePw: "Показать или скрыть пароль",
        forgotPassword: "Забыли пароль?",
        submit: "Войти",
        submitting: "Вход...",
        newHere: "У вас еще нет аккаунта?",
        createAccount: "Зарегистрироваться",
        guideTitle: "Создайте аккаунт и подключите Telegram",
        guideSub: "Пройдите регистрацию через ИИ-помощник или обычную форму и привяжите профиль к Telegram-боту.",
        patientCta: "Регистрация для Мамы / Пациента",
        patientCtaSub: "Быстрое заполнение через ИИ-помощник или форму",
        doctorCta: "Регистрация для Врача / Медсестры",
        doctorCtaSub: "С указанием специализации, стажа и GPS",
        adminCta: "Создать аккаунт Координатора (Админ)",
        adminCtaSub: "Для проверки и активации пациентов и врачей",
        telegramCta: "Открыть Telegram-бот",
        telegramCtaSub: "Привязка аккаунта, профиль и быстрая связь",
        defaultError: "Неверный email или пароль.",
    },
    en: {
        badge: "Private & Secure Sign In",
        title: "Sign In to Your OnaCare Portal",
        subtitle: "You will be taken directly to your own space (Patient, Doctor, or Clinic Coordinator).",
        emailLabel: "Email Address",
        emailPlaceholder: "name@example.uz",
        passwordLabel: "Password",
        passwordPlaceholder: "Enter your password",
        togglePw: "Toggle password visibility",
        forgotPassword: "Forgot password?",
        submit: "Sign In",
        submitting: "Signing in...",
        newHere: "Don't have an account?",
        createAccount: "Create an account",
        guideTitle: "Create an Account & Link Telegram",
        guideSub: "Register using our AI Sign-Up Helper or standard form, then link your profile directly to the Telegram bot.",
        patientCta: "Register as Patient / Mother",
        patientCtaSub: "Easy AI assistant or traditional signup form",
        doctorCta: "Register as Doctor / Nurse",
        doctorCtaSub: "Include specialty, experience & live GPS",
        adminCta: "Create Clinic Coordinator (Admin)",
        adminCtaSub: "Verify and activate incoming registrations",
        telegramCta: "Open Telegram Bot Console",
        telegramCtaSub: "Link your account and view your profile in Telegram",
        defaultError: "Incorrect email or password.",
    },
};

export default function LoginPage() {
    const { login } = usePlatform();
    const { lang } = useLanguage();
    const t = COPY[lang];
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
            const res = await login(email, password);
            if (!res.ok) {
                setError(res.error || t.defaultError);
            }
        }
        finally {
            setBusy(false);
        }
    };

    const quickLinks = [
        {
            href: "/signup?role=PATIENT",
            label: t.patientCta,
            sub: t.patientCtaSub,
            icon: <IconUser className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]"/>,
        },
        {
            href: "/signup?role=DOCTOR",
            label: t.doctorCta,
            sub: t.doctorCtaSub,
            icon: <IconStethoscope className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]"/>,
        },
        {
            href: "/signup?role=ADMIN_RECEPTION",
            label: t.adminCta,
            sub: t.adminCtaSub,
            icon: <IconShieldCheck className="h-4 w-4 text-[#292E2B] dark:text-[#F3F0E8]"/>,
        },
        {
            href: "/telegram",
            label: t.telegramCta,
            sub: t.telegramCtaSub,
            icon: <IconBrandTelegram className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]"/>,
        },
    ];

    return (<div className="min-h-screen flex flex-col bg-[#F7F5EF] dark:bg-[#161A18] text-[#292E2B] dark:text-[#F3F0E8] transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center px-5 sm:px-8 py-12 sm:py-16">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Sign In Panel */}
          <div className="lg:col-span-7 border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-6 sm:p-9 rounded-sm space-y-6">
            <div className="border-b border-[#DDD8CC] dark:border-[#2F3733] pb-5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#244C40] dark:text-[#A7BBAA]">
                <IconLock className="h-3.5 w-3.5"/>
                {t.badge}
              </span>
              <h1 className="font-heading mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-[#292E2B] dark:text-[#F3F0E8]">
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-[0.06em] text-[#525954] dark:text-[#B8C2BA] mb-1.5">
                  {t.emailLabel}
                </label>
                <input id="login-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} className="w-full min-h-[44px] rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF]/60 dark:bg-[#161A18] px-3.5 py-2.5 text-sm text-[#292E2B] dark:text-[#F3F0E8] placeholder:text-[#767E78] focus:border-[#244C40] dark:focus:border-[#A7BBAA] focus:outline-none transition-colors"/>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-[0.06em] text-[#525954] dark:text-[#B8C2BA]">
                    {t.passwordLabel}
                  </label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:underline underline-offset-4">
                    {t.forgotPassword}
                  </Link>
                </div>
                <div className="relative">
                  <input id="login-password" name="password" type={showPw ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} className="w-full min-h-[44px] rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF]/60 dark:bg-[#161A18] px-3.5 py-2.5 pr-11 text-sm text-[#292E2B] dark:text-[#F3F0E8] placeholder:text-[#767E78] focus:border-[#244C40] dark:focus:border-[#A7BBAA] focus:outline-none transition-colors"/>
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center text-[#525954] hover:text-[#292E2B] dark:text-[#B8C2BA] dark:hover:text-[#F3F0E8]" aria-label={t.togglePw}>
                    {showPw ? (<IconEyeOff className="h-4 w-4"/>) : (<IconEye className="h-4 w-4"/>)}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={busy} className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-sm bg-[#244C40] dark:bg-[#2C5B4D] px-5 py-2.5 text-sm font-semibold text-[#F7F5EF] hover:bg-[#1B3A31] dark:hover:bg-[#356C5C] disabled:opacity-50 transition-colors">
                <IconLogin className="h-4 w-4"/>
                {busy ? t.submitting : t.submit}
              </button>
            </form>

            <p className="text-xs text-[#525954] dark:text-[#B8C2BA] text-center pt-2 border-t border-[#DDD8CC] dark:border-[#2F3733]">
              {t.newHere}{" "}
              <Link href="/signup?role=PATIENT" className="font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:underline underline-offset-4">
                {t.createAccount}
              </Link>
            </p>
          </div>

          {/* Account Creation & Telegram Guide Panel */}
          <div className="lg:col-span-5 border border-[#DDD8CC] dark:border-[#2F3733] bg-[#EFECE3]/60 dark:bg-[#1D221F] p-6 rounded-sm space-y-4">
            <div className="border-b border-[#DDD8CC] dark:border-[#2F3733] pb-3">
              <h2 className="font-heading text-sm font-semibold text-[#292E2B] dark:text-[#F3F0E8] flex items-center gap-1.5">
                <IconSparkles className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]"/>
                {t.guideTitle}
              </h2>
              <p className="text-xs text-[#525954] dark:text-[#B8C2BA] mt-1 leading-relaxed">
                {t.guideSub}
              </p>
            </div>

            <div className="divide-y divide-[#DDD8CC] dark:divide-[#2F3733] border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#161A18] rounded-sm">
              {quickLinks.map((item) => (<Link key={item.href} href={item.href} className="w-full min-h-[54px] flex items-center justify-between px-3.5 py-3 text-left hover:bg-[#F7F5EF] dark:hover:bg-[#242A27] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-[#EFECE3] dark:bg-[#242A27] border border-[#DDD8CC] dark:border-[#2F3733]">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8] truncate">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-[#525954] dark:text-[#B8C2BA] truncate">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                  <IconArrowRight className="h-4 w-4 shrink-0 text-[#525954] dark:text-[#B8C2BA]"/>
                </Link>))}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>);
}
