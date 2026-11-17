"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconBuildingHospital,
  IconEye,
  IconEyeOff,
  IconHeartHandshake,
  IconShieldCheck,
  IconStethoscope,
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { UserRole } from "@/lib/types";

const ROLE_OPTIONS: Array<{
  role: UserRole;
  title: string;
  desc: string;
  portal: string;
  icon: React.ReactNode;
}> = [
  {
    role: "PATIENT",
    title: "Patient (Bemor)",
    desc: "Personal recovery portal, symptom check-ins & visit OTP",
    portal: "/patient only",
    icon: <IconUser className="h-4 w-4 text-teal-700 dark:text-teal-400" />,
  },
  {
    role: "OVABMU_MD",
    title: "OvaBMU Doctor",
    desc: "Inpatient discharge & AI Patronage dispatch",
    portal: "/clinical only",
    icon: <IconBuildingHospital className="h-4 w-4 text-indigo-700 dark:text-indigo-400" />,
  },
  {
    role: "FAMILY_MD",
    title: "Regional Family Doctor",
    desc: "24h home patronage checklist & visit verification",
    portal: "/clinical only",
    icon: <IconStethoscope className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />,
  },
  {
    role: "ADMIN_RECEPTION",
    title: "District Admin / Reception",
    desc: "24h SLA monitor, billing & audit compliance",
    portal: "/admin only",
    icon: <IconShieldCheck className="h-4 w-4 text-slate-700 dark:text-slate-300" />,
  },
];

export default function SignupPage() {
  const { signup } = usePlatform();
  const [role, setRole] = useState<UserRole>("PATIENT");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [phone, setPhone] = useState("+998 90 ");
  const [district, setDistrict] = useState("Yunusobod");
  const [mahalla, setMahalla] = useState("Bog'ishamol MFY");
  const [dateOfBirth, setDateOfBirth] = useState("1996-05-15");
  const [bloodType, setBloodType] = useState("A(II) Rh+");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await signup({
        fullName,
        email,
        password,
        role,
        phone,
        district,
        mahalla: role === "PATIENT" ? mahalla : undefined,
        dateOfBirth: role === "PATIENT" ? dateOfBirth : undefined,
        bloodType: role === "PATIENT" ? bloodType : undefined,
      });
      if (!res.ok) {
        setError(res.error || "Could not create account.");
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
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Allaqachon hisobingiz bormi?</span>
            <Link
              href="/login"
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Create Your OnaCare AI Account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your role below. Your account will have exclusive access only to your
              designated portal.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 px-3.5 py-2.5 text-xs font-semibold text-rose-800 dark:text-rose-200">
              <IconAlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Account Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ROLE_OPTIONS.map((opt) => {
                  const active = role === opt.role;
                  return (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => setRole(opt.role)}
                      className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                        active
                          ? "border-teal-600 bg-teal-50/70 dark:bg-teal-950/50 ring-1 ring-teal-600"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        {opt.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{opt.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                          {opt.desc}
                        </p>
                        <span className="mt-1 inline-block rounded bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-teal-700 dark:text-teal-400 border border-slate-200 dark:border-slate-700">
                          {opt.portal}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Malika Karimova"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.uz"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password (min 6 chars)
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  District / Region
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"
                >
                  <option value="Yunusobod">Yunusobod (Toshkent • OP-14)</option>
                  <option value="Chilonzor">Chilonzor (Toshkent • OP-14)</option>
                  <option value="Davlatobod, Namangan">Davlatobod, Namangan (OP-03)</option>
                </select>
              </div>

              {role === "PATIENT" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mahalla
                    </label>
                    <input
                      type="text"
                      value={mahalla}
                      onChange={(e) => setMahalla(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Blood Type
                    </label>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"
                    >
                      <option value="A(II) Rh+">A(II) Rh+</option>
                      <option value="O(I) Rh+">O(I) Rh+</option>
                      <option value="O(I) Rh-">O(I) Rh-</option>
                      <option value="B(III) Rh+">B(III) Rh+</option>
                      <option value="AB(IV) Rh+">AB(IV) Rh+</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition"
            >
              <IconUserPlus className="h-4 w-4" />
              {busy ? "Creating account..." : "Create Account & Enter Portal"}
            </button>
          </form>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-teal-700 dark:text-teal-400 hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
