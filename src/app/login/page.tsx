"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuildingHospital,
  IconEye,
  IconEyeOff,
  IconLock,
  IconLogin,
  IconShieldCheck,
  IconStethoscope,
  IconUser,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage, type AppLang } from "@/context/LanguageContext";
import { PublicHeader } from "@/components/PublicHeader";

const DEMO_ACCOUNTS = [
  {
    label: "Discharged Patient",
    sub: "Zulfiya Rustamova • /patient only",
    email: "zulfiya.rustamova@patient.uz",
    icon: <IconUser className="h-4 w-4 text-teal-700 dark:text-teal-400" />,
  },
  {
    label: "OvaBMU Doctor",
    sub: "Dr. Aziza Rahimova • /clinical",
    email: "a.rahimova@ovabmu.uz",
    icon: <IconBuildingHospital className="h-4 w-4 text-indigo-700 dark:text-indigo-400" />,
  },
  {
    label: "Regional Family Doctor",
    sub: "Dr. Dilnoza Toshmatova • /clinical",
    email: "d.toshmatova@op14.uz",
    icon: <IconStethoscope className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />,
  },
  {
    label: "District Admin",
    sub: "Sherzod Alimov • /admin",
    email: "sh.alimov@ssv.uz",
    icon: <IconShieldCheck className="h-4 w-4 text-slate-700 dark:text-slate-300" />,
  },
];

const COPY: Record<
  AppLang,
  {
    badge: string;
    title: string;
    subtitle: string;
    emailLabel: string;
    passwordLabel: string;
    forgotPassword: string;
    submit: string;
    submitting: string;
    newHere: string;
    createAccount: string;
    demoTitle: string;
    demoSub: string;
  }
> = {
  en: {
    badge: "Role-Isolated Secure Sign In",
    title: "Sign In to Your OnaCare AI Portal",
    subtitle:
      "You will be routed strictly to your authorized portal (Patient, Doctor, or Admin).",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    forgotPassword: "Forgot password?",
    submit: "Sign In",
    submitting: "Signing in...",
    newHere: "New to OnaCare AI?",
    createAccount: "Create an account",
    demoTitle: "Demo Portal Accounts",
    demoSub:
      "Click any seeded account below to sign in via real authentication (password: Demo1234!) and test its isolated portal.",
  },
  uz: {
    badge: "Rolga ajratilgan xavfsiz kirish",
    title: "OnaCare AI Portaliga Kirish",
    subtitle:
      "Siz faqat o'zingizga biriktirilgan portalga (Bemor, Shifokor yoki Admin) yo'naltirilasiz.",
    emailLabel: "Elektron pochta",
    passwordLabel: "Parol",
    forgotPassword: "Parolni unutdingizmi?",
    submit: "Kirish",
    submitting: "Kirilmoqda...",
    newHere: "OnaCare AI tizimida yangimisiz?",
    createAccount: "Hisob yaratish",
    demoTitle: "Demo Portal Hisoblari",
    demoSub:
      "Haqiqiy autentifikatsiya orqali sinov hisobiga kiring (parol: Demo1234!) va alohida portalni tekshiring.",
  },
  ru: {
    badge: "Защищенный вход по ролям",
    title: "Вход в портал OnaCare AI",
    subtitle:
      "Вы будете направлены строго в свой авторизованный портал (Пациент, Врач или Админ).",
    emailLabel: "Электронная почта",
    passwordLabel: "Пароль",
    forgotPassword: "Забыли пароль?",
    submit: "Войти",
    submitting: "Выполняется вход...",
    newHere: "Впервые в OnaCare AI?",
    createAccount: "Создать аккаунт",
    demoTitle: "Демо-аккаунты портала",
    demoSub:
      "Нажмите на любой демо-аккаунт для входа с реальной проверкой пароля (пароль: Demo1234!).",
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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await login(email, password);
      if (!res.ok) {
        setError(res.error || "Incorrect email or password.");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Demo1234!");
    setError(null);
    setBusy(true);
    try {
      const res = await login(demoEmail, "Demo1234!");
      if (!res.ok) {
        setError(res.error || "Incorrect email or password.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sign In Card */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t.emailLabel}
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.uz"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t.passwordLabel}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                  >
                    {t.forgotPassword}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? (
                      <IconEyeOff className="h-4 w-4" />
                    ) : (
                      <IconEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition"
              >
                <IconLogin className="h-4 w-4" />
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
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={busy}
                  onClick={() => handleDemoLogin(acc.email)}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3.5 py-2.5 text-left hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      {acc.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {acc.label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {acc.sub}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        {acc.email}
                      </p>
                    </div>
                  </div>
                  <IconArrowRight className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
