"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  Clock,
  FastForward,
  HeartHandshake,
  Lock,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  UserRound,
} from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";
import type { UserRole } from "@/lib/types";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    role,
    data,
    simBusy,
    toast,
    switchRole,
    fastForwardTime,
    resetDemo,
  } = usePlatform();

  const roleButtons: Array<{
    role: UserRole;
    label: string;
    sub: string;
    icon: React.ReactNode;
  }> = [
    {
      role: "OVABMU_MD",
      label: "OvaBMU Doctor",
      sub: "Inpatient Discharge",
      icon: <Building2 className="h-3.5 w-3.5" />,
    },
    {
      role: "FAMILY_MD",
      label: "Regional Family Doctor",
      sub: "24h Home Patronage",
      icon: <Stethoscope className="h-3.5 w-3.5" />,
    },
    {
      role: "PATIENT",
      label: "Discharged Patient",
      sub: "Mobile Recovery Portal",
      icon: <UserRound className="h-3.5 w-3.5" />,
    },
    {
      role: "ADMIN_RECEPTION",
      label: "District Admin",
      sub: "SLA & Audit Control",
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
    },
  ];

  const simOffset = data?.simState.timeOffsetHours ?? 0;
  const simTimeFormatted = data?.simState.simulatedNow
    ? new Date(data.simState.simulatedNow).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  const navLinks = [
    { href: "/", label: "Overview", icon: <Activity className="h-4 w-4" /> },
    {
      href: "/clinical",
      label: "Doctor & Clinical",
      icon: <Stethoscope className="h-4 w-4" />,
    },
    {
      href: "/patient",
      label: "Patient Portal",
      icon: <HeartHandshake className="h-4 w-4" />,
    },
    {
      href: "/admin",
      label: "Reception & Admin",
      icon: <ShieldCheck className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Sticky Hackathon Judge Demo Bar */}
      <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/20 px-2 py-1 text-[11px] font-bold tracking-wide text-teal-300 border border-teal-500/30">
              HACKATHON JUDGE BAR
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {roleButtons.map((btn) => {
                const active = role === btn.role;
                return (
                  <button
                    key={btn.role}
                    onClick={() => switchRole(btn.role, true)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      active
                        ? "bg-teal-600 text-white shadow-xs"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                    title={btn.sub}
                  >
                    {btn.icon}
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-200 border border-slate-700">
              <Clock className="h-3.5 w-3.5 text-teal-400" />
              <span className="font-mono tabular-nums">{simTimeFormatted}</span>
              {simOffset > 0 && (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-300">
                  +{simOffset}h
                </span>
              )}
            </div>
            <button
              onClick={() => fastForwardTime(6)}
              disabled={simBusy}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-slate-700 border border-slate-700 disabled:opacity-50"
            >
              <FastForward className="h-3.5 w-3.5" />
              +6h
            </button>
            <button
              onClick={() => fastForwardTime(12)}
              disabled={simBusy}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
            >
              <FastForward className="h-3.5 w-3.5" />
              +12h
            </button>
            <button
              onClick={() => fastForwardTime(23)}
              disabled={simBusy}
              className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
            >
              <FastForward className="h-3.5 w-3.5" />
              +23h
            </button>
            <button
              onClick={resetDemo}
              disabled={simBusy}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 disabled:opacity-50"
              title="Reset Time & Demo Seed"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Unified Clinical Navigation Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  OnaCare AI
                </span>
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 border border-teal-200">
                  Patronaj 24/7
                </span>
              </div>
              <p className="text-xs text-slate-500">
                OvaBMU → Oilaviy Poliklinika • Avtomatlashtirilgan Patronaj Tizimi
              </p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-1.5">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-teal-50 text-teal-800 border border-teal-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700 border border-slate-200">
              <Lock className="h-3 w-3 text-teal-600" />
              AES-256-GCM • TLS 1.3
            </span>
            {data?.actor && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800 border border-emerald-200">
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                {data.actor.fullName} ({data.actor.role})
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {toast && (
        <div className="mx-auto mt-3 w-full max-w-7xl px-4">
          <div
            className={`rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-sm ${
              toast.type === "error"
                ? "border-rose-300 bg-rose-50 text-rose-800"
                : toast.type === "success"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-amber-300 bg-amber-50 text-amber-900"
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
