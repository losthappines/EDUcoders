"use client";
import React, { useState } from "react";
import Link from "next/link";
import { IconAlertTriangle, IconArrowRight, IconBuildingHospital, IconEye, IconEyeOff, IconLock, IconLogin, IconShieldCheck, IconStethoscope, IconUser, } from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
import { PublicHeader } from "@/components/PublicHeader";
const DEMO_ACCOUNTS = [
    {
        email: "zulfiya.rustamova@patient.uz",
        label: {
            uz: "Uyga chiqqan ona (Bemor)",
            ru: "Выписанная мама (Пациент)",
            en: "New Mother (Patient)",
        },
        sub: {
            uz: "Zulfiya Rustamova • Shaxsiy kabinet",
            ru: "Зульфия Рустамова • Личный кабинет",
            en: "Zulfiya Rustamova • Personal portal",
        },
        icon: <IconUser className="h-4 w-4 text-teal-700 dark:text-teal-400"/>,
    },
    {
        email: "a.rahimova@ovabmu.uz",
        label: {
            uz: "Tug'ruqxona shifokori",
            ru: "Врач роддома",
            en: "Hospital Doctor",
        },
        sub: {
            uz: "Dr. Aziza Rahimova • Shifokor kabineti",
            ru: "Д-р Азиза Рахимова • Кабинет врача",
            en: "Dr. Aziza Rahimova • Doctor workspace",
        },
        icon: <IconBuildingHospital className="h-4 w-4 text-indigo-700 dark:text-indigo-400"/>,
    },
    {
        email: "d.toshmatova@op14.uz",
        label: {
            uz: "Hududiy oilaviy shifokor",
            ru: "Участковый семейный врач",
            en: "Local Family Doctor",
        },
        sub: {
            uz: "Dr. Dilnoza Toshmatova • Uy tashriflari",
            ru: "Д-р Дильноза Тошматова • Визиты на дом",
            en: "Dr. Dilnoza Toshmatova • Home visits",
        },
        icon: <IconStethoscope className="h-4 w-4 text-emerald-700 dark:text-emerald-400"/>,
    },
    {
        email: "sh.alimov@ssv.uz",
        label: {
            uz: "Poliklinika koordinatori",
            ru: "Координатор клиники",
            en: "Clinic Coordinator",
        },
        sub: {
            uz: "Sherzod Alimov • Tashriflar nazorati",
            ru: "Шерзод Алимов • Контроль визитов",
            en: "Sherzod Alimov • Visit oversight",
        },
        icon: <IconShieldCheck className="h-4 w-4 text-slate-700 dark:text-slate-300"/>,
    },
];
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
        demoTitle: "Tezkor sinov hisoblari",
        demoSub: "Sinab ko'rish uchun quyidagi tayyor hisoblardan birini bosing (parol: Demo1234!).",
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
        demoTitle: "Демо-аккаунты для проверки",
        demoSub: "Нажмите на любой аккаунт ниже для быстрого входа (пароль: Demo1234!).",
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
        demoTitle: "Demo Accounts",
        demoSub: "Click any sample account below to sign in and try that view (password: Demo1234!).",
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
    const handleDemoLogin = async (demoEmail) => {
        setEmail(demoEmail);
        setPassword("Demo1234!");
        setError(null);
        setBusy(true);
        try {
            const res = await login(demoEmail, "Demo1234!");
            if (!res.ok) {
                setError(res.error || t.defaultError);
            }
        }
        finally {
            setBusy(false);
        }
    };
    return (<div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sign In Card */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <IconLock className="h-3 w-3"/>
                {t.badge}
              </span>
              <h1 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {t.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t.subtitle}
              </p>
            </div>

            {error && (<div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 px-3.5 py-2.5 text-xs font-semibold text-rose-800 dark:text-rose-200">
                <IconAlertTriangle className="h-4 w-4 shrink-0"/>
                <span>{error}</span>
              </div>)}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.emailLabel}
                </label>
                <input id="login-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"/>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t.passwordLabel}
                  </label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline">
                    {t.forgotPassword}
                  </Link>
                </div>
                <div className="relative">
                  <input id="login-password" name="password" type={showPw ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"/>
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label={t.togglePw}>
                    {showPw ? (<IconEyeOff className="h-4 w-4"/>) : (<IconEye className="h-4 w-4"/>)}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition">
                <IconLogin className="h-4 w-4"/>
                {busy ? t.submitting : t.submit}
              </button>
            </form>

            <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-1">
              {t.newHere}{" "}
              <Link href="/signup" className="font-semibold text-teal-700 dark:text-teal-400 hover:underline">
                {t.createAccount}
              </Link>
            </p>
          </div>

          {/* Demo Accounts Quick-Sign-In Panel */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.demoTitle}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {t.demoSub}
              </p>
            </div>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (<button key={acc.email} type="button" disabled={busy} onClick={() => handleDemoLogin(acc.email)} className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3.5 py-2.5 text-left hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition disabled:opacity-50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      {acc.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {acc.label[lang]}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {acc.sub[lang]}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        {acc.email}
                      </p>
                    </div>
                  </div>
                  <IconArrowRight className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"/>
                </button>))}
            </div>
          </div>
        </div>
      </main>
    </div>);
}
