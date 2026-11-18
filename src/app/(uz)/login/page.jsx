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
            icon: <IconUser className="h-5 w-5 text-teal-700 dark:text-teal-300"/>,
        },
        {
            href: "/signup?role=DOCTOR",
            label: t.doctorCta,
            sub: t.doctorCtaSub,
            icon: <IconStethoscope className="h-5 w-5 text-teal-700 dark:text-teal-300"/>,
        },
        {
            href: "/signup?role=ADMIN_RECEPTION",
            label: t.adminCta,
            sub: t.adminCtaSub,
            icon: <IconShieldCheck className="h-5 w-5 text-slate-700 dark:text-slate-200"/>,
        },
        {
            href: "/telegram",
            label: t.telegramCta,
            sub: t.telegramCtaSub,
            icon: <IconBrandTelegram className="h-5 w-5 text-sky-700 dark:text-sky-300"/>,
        },
    ];

    return (<div className="min-h-screen flex flex-col bg-[#F4F8F7] dark:bg-[#091315] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-16">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start oc-fade-up">
          {/* Sign In Panel */}
          <div className="lg:col-span-7 med-card p-6 sm:p-9 space-y-6">
            <div className="border-b border-[#D7E4E1] dark:border-[#1E353A] pb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-teal-700 dark:text-teal-300">
                <IconLock className="h-3.5 w-3.5"/>
                {t.badge}
              </span>
              <h1 className="font-heading mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {error && (<div role="alert" className="oc-slide-down flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm font-semibold text-rose-700 dark:text-rose-200">
                <IconAlertTriangle className="h-5 w-5 shrink-0"/>
                <span>{error}</span>
              </div>)}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  {t.emailLabel}
                </label>
                <input id="login-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} className="w-full min-h-[48px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-4 py-2.5 text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-600 dark:focus:border-teal-400 focus:outline-none transition-colors"/>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {t.passwordLabel}
                  </label>
                  <Link href="/forgot-password" className="text-sm font-semibold text-teal-700 dark:text-teal-300 hover:underline underline-offset-4">
                    {t.forgotPassword}
                  </Link>
                </div>
                <div className="relative">
                  <input id="login-password" name="password" type={showPw ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} className="w-full min-h-[48px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-4 py-2.5 pr-12 text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-600 dark:focus:border-teal-400 focus:outline-none transition-colors"/>
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" aria-label={t.togglePw}>
                    {showPw ? (<IconEyeOff className="h-5 w-5"/>) : (<IconEye className="h-5 w-5"/>)}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={busy} className="w-full min-h-[50px] inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 dark:bg-teal-600 px-5 py-3 text-base sm:text-sm font-semibold text-white hover:bg-teal-800 dark:hover:bg-teal-500 active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm">
                <IconLogin className="h-5 w-5"/>
                {busy ? t.submitting : t.submit}
              </button>
            </form>

            <p className="text-sm text-slate-600 dark:text-slate-300 text-center pt-3 border-t border-[#D7E4E1] dark:border-[#1E353A]">
              {t.newHere}{" "}
              <Link href="/signup?role=PATIENT" className="font-semibold text-teal-700 dark:text-teal-300 hover:underline underline-offset-4">
                {t.createAccount}
              </Link>
            </p>
          </div>

          {/* Account Creation & Telegram Guide Panel */}
          <div className="lg:col-span-5 rounded-2xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#101E21] p-6 space-y-4">
            <div className="border-b border-[#D7E4E1] dark:border-[#1E353A] pb-3.5">
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <IconSparkles className="h-5 w-5 text-teal-700 dark:text-teal-300"/>
                {t.guideTitle}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                {t.guideSub}
              </p>
            </div>

            <div className="divide-y divide-[#D7E4E1] dark:divide-[#1E353A] border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] rounded-xl overflow-hidden">
              {quickLinks.map((item) => (<Link key={item.href} href={item.href} className="w-full min-h-[60px] flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#F4F8F7] dark:hover:bg-[#16272B] transition-colors group">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDF5F3] dark:bg-[#16272B] border border-[#D7E4E1] dark:border-[#1E353A]">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                  <IconArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:translate-x-0.5 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-all"/>
                </Link>))}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>);
}
