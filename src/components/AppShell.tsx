"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconBuildingHospital,
  IconClock,
  IconHeartHandshake,
  IconLock,
  IconLogout,
  IconMenu2,
  IconPlayerTrackNext,
  IconRotateClockwise,
  IconShieldCheck,
  IconStethoscope,
  IconUserCheck,
  IconX,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
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

function isProtectedPortalPath(pathname: string): boolean {
  return (
    pathname.startsWith("/patient") ||
    pathname.startsWith("/clinical") ||
    pathname.startsWith("/admin")
  );
}

function isRoleAllowedOnPath(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/patient")) return role === "PATIENT";
  if (pathname.startsWith("/clinical")) {
    return role === "OVABMU_MD" || role === "FAMILY_MD";
  }
  if (pathname.startsWith("/admin")) return role === "ADMIN_RECEPTION";
  return true;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const isProtected = isProtectedPortalPath(pathname);

  useEffect(() => {
    if (!isProtected || !authChecked) return;
    if (!authUser) {
      router.replace("/login");
      return;
    }
    if (!isRoleAllowedOnPath(authUser.role, pathname)) {
      router.replace(getPortalForRole(authUser.role));
    }
  }, [isProtected, authChecked, authUser, pathname, router]);

  if (!isProtected) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        {toast && (
          <div className="fixed bottom-4 right-4 z-50 max-w-md">
            <div
              className={`rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-lg ${
                toast.type === "error"
                  ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/90 dark:text-rose-200"
                  : toast.type === "success"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-200"
                    : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/90 dark:text-amber-200"
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="max-w-sm w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-sm space-y-3">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
            <IconLock className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {!authChecked
              ? lang === "ru"
                ? "Проверка сессии..."
                : lang === "uz"
                  ? "Sessiya tekshirilmoqda..."
                  : "Checking session..."
              : !authUser
                ? lang === "ru"
                  ? "Требуется вход"
                  : lang === "uz"
                    ? "Kirish talab qilinadi"
                    : "Sign in required"
                : lang === "ru"
                  ? "Доступ ограничен — перенаправление"
                  : lang === "uz"
                    ? "Ruxsat cheklangan — yo'naltirilmoqda"
                    : "Access restricted — redirecting"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {!authChecked
              ? lang === "ru"
                ? "Подключение к защищенному порталу..."
                : lang === "uz"
                  ? "Xavfsiz portalga ulanilmoqda..."
                  : "Connecting to your secure portal..."
              : !authUser
                ? lang === "ru"
                  ? "Сессия не подтверждена. Перенаправление на страницу входа."
                  : lang === "uz"
                    ? "Sizning hisobingiz tasdiqlanmadi. Kirish sahifasiga yo'naltirilmoqda."
                    : "Your session is not signed in. Redirecting to Sign In."
                : lang === "ru"
                  ? "Вы можете видеть только портал вашей роли."
                  : lang === "uz"
                    ? "Siz faqat o'zingizning rolingizga tegishli portalni ko'rishingiz mumkin."
                    : "You can only access the portal assigned to your role."}
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
          badge: lang === "ru" ? "Портал пациента" : lang === "uz" ? "Bemor Portali" : "Patient Portal",
          subtitle:
            lang === "ru"
              ? "Личный план выздоровления и 24ч патронаж"
              : lang === "uz"
                ? "Shaxsiy davolanish va 24 soatlik uy patronaji kabineti"
                : "Personal recovery plan & 24h home patronage",
          icon: <IconHeartHandshake className="h-4 w-4 text-teal-700 dark:text-teal-300" />,
        }
      : authUser.role === "OVABMU_MD"
        ? {
            badge: "OvaBMU MD Portal",
            subtitle: "Inpatient discharge & AI Patronage dispatch",
            icon: <IconBuildingHospital className="h-4 w-4 text-teal-700 dark:text-teal-300" />,
          }
        : authUser.role === "FAMILY_MD"
          ? {
              badge: "Family MD Portal",
              subtitle: "Regional polyclinic & 24h home patronage",
              icon: <IconStethoscope className="h-4 w-4 text-teal-700 dark:text-teal-300" />,
            }
          : {
              badge: "Admin & SLA Portal",
              subtitle: "Reception, 24h SLA monitor & system audit",
              icon: <IconShieldCheck className="h-4 w-4 text-teal-700 dark:text-teal-300" />,
            };

  const signOutLabel = lang === "ru" ? "Выйти" : lang === "uz" ? "Chiqish" : "Sign Out";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Staff-Only SLA Time Simulator Utility Bar (Hidden from Patients) */}
      {isStaff && (
        <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 dark:bg-slate-950 text-white shadow-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/20 px-2 py-0.5 text-[11px] font-bold tracking-wide text-teal-300 border border-teal-500/30">
                SLA SIMULATOR
              </span>
              <span className="text-slate-300 hidden sm:inline">
                Real-time 24h Patronage Clock Control
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-200 border border-slate-700">
                <IconClock className="h-3.5 w-3.5 text-teal-400" />
                <span className="font-mono tabular-nums">{simTimeFormatted}</span>
                {simOffset > 0 && (
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-300">
                    +{simOffset}h
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fastForwardTime(6)}
                disabled={simBusy}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-xs font-semibold text-amber-300 hover:bg-slate-700 border border-slate-700 disabled:opacity-50"
              >
                <IconPlayerTrackNext className="h-3.5 w-3.5" />
                +6h
              </button>
              <button
                type="button"
                onClick={() => fastForwardTime(12)}
                disabled={simBusy}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
              >
                <IconPlayerTrackNext className="h-3.5 w-3.5" />
                +12h
              </button>
              <button
                type="button"
                onClick={() => fastForwardTime(23)}
                disabled={simBusy}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
              >
                <IconPlayerTrackNext className="h-3.5 w-3.5" />
                +23h
              </button>
              <button
                type="button"
                onClick={resetDemo}
                disabled={simBusy}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 disabled:opacity-50"
                title="Reset Time & Demo Seed"
              >
                <IconRotateClockwise className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strictly Role-Isolated Portal Header (Responsive at 375px) */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs hover:bg-teal-700 transition"
              title="Home"
            >
              <IconHeartHandshake className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 hover:text-teal-700 dark:hover:text-teal-400 truncate"
                >
                  OnaCare AI
                </Link>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-[11px] font-semibold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 whitespace-nowrap">
                  {portalMeta.icon}
                  <span className="truncate max-w-[120px] sm:max-w-none">{portalMeta.badge}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                {portalMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2 text-xs shrink-0">
            <LanguageSwitcher />
            <ThemeToggle />
            <span className="hidden lg:inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <IconLock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              AES-256-GCM
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <IconUserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              {authUser.fullName}
            </span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition"
            >
              <IconLogout className="h-3.5 w-3.5" />
              {signOutLabel}
            </button>
          </div>

          {/* Mobile actions (ThemeToggle + Hamburger) */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close portal menu" : "Open portal menu"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              {mobileMenuOpen ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <IconUserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                {authUser.fullName}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <IconLock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                AES-256
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Language</span>
              <LanguageSwitcher />
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <IconLogout className="h-3.5 w-3.5" />
              {signOutLabel}
            </button>
          </div>
        )}
      </header>

      {toast && (
        <div className="mx-auto mt-3 w-full max-w-7xl px-4">
          <div
            className={`rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-sm ${
              toast.type === "error"
                ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200"
                : toast.type === "success"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200"
                  : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-200"
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
