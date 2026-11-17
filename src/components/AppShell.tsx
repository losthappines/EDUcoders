"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconBuildingHospital,
  IconClock,
  IconHeartHandshake,
  IconLock,
  IconLogout,
  IconPlayerTrackNext,
  IconRotateClockwise,
  IconShieldCheck,
  IconStethoscope,
  IconUserCheck,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import type { UserRole } from "@/lib/types";

function getPortalForRole(role: UserRole): string {
  switch (role) {
    case "PATIENT":
      return "/patient";
    case "OVABMU_MD":
    case "FAMILY_MD":
      return "/clinical";
    case "ADMIN_RECEPTION":
      return "/admin";
  }
}

function isRoleAllowedOnPath(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/patient")) return role === "PATIENT";
  if (pathname.startsWith("/clinical")) {
    return role === "OVABMU_MD" || role === "FAMILY_MD";
  }
  if (pathname.startsWith("/admin")) return role === "ADMIN_RECEPTION";
  return true;
}

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    authUser,
    authChecked,
    data,
    simBusy,
    toast,
    logout,
    fastForwardTime,
    resetDemo,
  } = usePlatform();

  const isPublicPage = PUBLIC_ROUTES.has(pathname);

  useEffect(() => {
    if (isPublicPage || !authChecked) return;
    if (!authUser) {
      router.replace("/login");
      return;
    }
    if (!isRoleAllowedOnPath(authUser.role, pathname)) {
      router.replace(getPortalForRole(authUser.role));
    }
  }, [isPublicPage, authChecked, authUser, pathname, router]);

  if (isPublicPage) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        {toast && (
          <div className="fixed bottom-4 right-4 z-50 max-w-md">
            <div
              className={`rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-lg ${
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
        {children}
      </div>
    );
  }

  if (!authChecked || !authUser || !isRoleAllowedOnPath(authUser.role, pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-sm w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm space-y-3">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-200">
            <IconLock className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">
            {!authChecked
              ? "Sessiya tekshirilmoqda..."
              : !authUser
                ? "Kirish talab qilinadi"
                : "Ruxsat cheklangan — yo'naltirilmoqda"}
          </h2>
          <p className="text-xs text-slate-500">
            {!authChecked
              ? "Xavfsiz portalga ulanilmoqda..."
              : !authUser
                ? "Sizning hisobingiz tasdiqlanmadi. Kirish sahifasiga yo'naltirilmoqda."
                : "Siz faqat o'zingizning rolingizga tegishli portalni ko'rishingiz mumkin."}
          </p>
        </div>
      </div>
    );
  }

  const isStaff = authUser.role !== "PATIENT";
  const simOffset = data?.simState.timeOffsetHours ?? 0;
  const simTimeFormatted = data?.simState.simulatedNow
    ? new Date(data.simState.simulatedNow).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  const portalMeta =
    authUser.role === "PATIENT"
      ? {
          badge: "Bemor Shaxsiy Portali",
          subtitle: "Shaxsiy davolanish va 24 soatlik uy patronaji kabineti",
          icon: <IconHeartHandshake className="h-4 w-4 text-teal-700" />,
        }
      : authUser.role === "OVABMU_MD"
        ? {
            badge: "OvaBMU Shifokor Portali",
            subtitle: "Statsionar chiqaruv va AI Patronaj boshqaruvi",
            icon: <IconBuildingHospital className="h-4 w-4 text-teal-700" />,
          }
        : authUser.role === "FAMILY_MD"
          ? {
              badge: "Oilaviy Shifokor Portali",
              subtitle: "Hududiy poliklinika va 24 soatlik uy patronaji",
              icon: <IconStethoscope className="h-4 w-4 text-teal-700" />,
            }
          : {
              badge: "Admin & SLA Nazorat Portali",
              subtitle: "Qabulxona, SLA monitoring va tizim auditi",
              icon: <IconShieldCheck className="h-4 w-4 text-teal-700" />,
            };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Staff-Only SLA Time Simulator Utility Bar (Hidden from Patients) */}
      {isStaff && (
        <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-white shadow-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/20 px-2 py-0.5 text-[11px] font-bold tracking-wide text-teal-300 border border-teal-500/30">
                SLA SIMULATOR
              </span>
              <span className="text-slate-300 hidden sm:inline">
                Real-time 24h Patronage Clock Control
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-200 border border-slate-700">
                <IconClock className="h-3.5 w-3.5 text-teal-400" />
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
                <IconPlayerTrackNext className="h-3.5 w-3.5" />
                +6h
              </button>
              <button
                onClick={() => fastForwardTime(12)}
                disabled={simBusy}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
              >
                <IconPlayerTrackNext className="h-3.5 w-3.5" />
                +12h
              </button>
              <button
                onClick={() => fastForwardTime(23)}
                disabled={simBusy}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
              >
                <IconPlayerTrackNext className="h-3.5 w-3.5" />
                +23h
              </button>
              <button
                onClick={resetDemo}
                disabled={simBusy}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 disabled:opacity-50"
                title="Reset Time & Demo Seed"
              >
                <IconRotateClockwise className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strictly Role-Isolated Portal Header (Zero cross-portal links) */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs hover:bg-teal-700 transition"
              title="Bosh sahifa"
            >
              <IconHeartHandshake className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="text-base font-bold tracking-tight text-slate-900 hover:text-teal-700"
                >
                  OnaCare AI
                </Link>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800 border border-teal-200">
                  {portalMeta.icon}
                  {portalMeta.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500">{portalMeta.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700 border border-slate-200">
              <IconLock className="h-3.5 w-3.5 text-teal-600" />
              AES-256-GCM
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-800 border border-emerald-200">
              <IconUserCheck className="h-3.5 w-3.5 text-emerald-600" />
              {authUser.fullName}
            </span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <IconLogout className="h-3.5 w-3.5" />
              Chiqish
            </button>
          </div>
        </div>
      </header>

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
