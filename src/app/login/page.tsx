"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuildingHospital,
  IconEye,
  IconEyeOff,
  IconHeartHandshake,
  IconLock,
  IconLogin,
  IconShieldCheck,
  IconStethoscope,
  IconUser,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { ThemeToggle } from "@/components/ThemeToggle";

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

export default function LoginPage() {
  const { login } = usePlatform();
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
        setError(res.error || "Invalid email or password.");
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
        setError(res.error || "Failed to sign in with demo account.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
              <IconHeartHandshake className="h-5 w-5" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">OnaCare AI</span>
          </Link>
          <div className="flex items-center gap-2.5 text-xs">
            <ThemeToggle />
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Hisobingiz yo&apos;qmi?</span>
            <Link
              href="/signup"
              className="rounded-xl bg-teal-600 px-3.5 py-1.5 font-semibold text-white hover:bg-teal-700 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sign In Card */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <IconLock className="h-3 w-3" />
                Role-Isolated Secure Sign In
              </span>
              <h1 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                Sign In to Your OnaCare AI Portal
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You will be routed strictly to your authorized portal (Patient, Doctor, or Admin).
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 px-3.5 py-2.5 text-xs font-semibold text-rose-800 dark:text-rose-200">
                <IconAlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.uz"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
                {busy ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-1">
              New to OnaCare AI?{" "}
              <Link href="/signup" className="font-semibold text-teal-700 dark:text-teal-400 hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          {/* Demo Accounts Quick-Sign-In Panel */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Demo Portal Accounts
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Click any seeded account below to sign in via real authentication (password:{" "}
                <code className="font-mono text-slate-700 dark:text-slate-300">Demo1234!</code>) and test its
                isolated portal.
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
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      {acc.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{acc.label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{acc.sub}</p>
                      <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{acc.email}</p>
                    </div>
                  </div>
                  <IconArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
