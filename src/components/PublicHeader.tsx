"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconHeartHandshake,
  IconLogin,
  IconLogout,
  IconMenu2,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage, type AppLang } from "@/context/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { UserRole } from "@/lib/types";

function getPortalHref(role: UserRole): string {
  if (role === "PATIENT") return "/patient";
  if (role === "ADMIN_RECEPTION") return "/admin";
  return "/clinical";
}

const NAV_COPY: Record<
  AppLang,
  {
    subtitle: string;
    howItWorks: string;
    portals: string;
    visitPromise: string;
    forClinics: string;
    languageLabel: string;
    signIn: string;
    signUp: string;
    signOut: string;
    openPortal: string;
  }
> = {
  uz: {
    subtitle: "Uyda 24 soatlik shifokor g'amxo'rligi",
    howItWorks: "Qanday ishlaydi",
    portals: "Kimlar uchun",
    visitPromise: "24 soatlik tashrif",
    forClinics: "Klinikalar va texnologiya",
    languageLabel: "Til",
    signIn: "Kirish",
    signUp: "Ro'yxatdan o'tish",
    signOut: "Chiqish",
    openPortal: "Kabinetimga kirish",
  },
  ru: {
    subtitle: "Забота врача на дому в течение 24 часов",
    howItWorks: "Как это работает",
    portals: "Для кого сервис",
    visitPromise: "Визит за 24 часа",
    forClinics: "Клиникам и технологии",
    languageLabel: "Язык",
    signIn: "Войти",
    signUp: "Регистрация",
    signOut: "Выйти",
    openPortal: "Открыть кабинет",
  },
  en: {
    subtitle: "Home care & doctor visit within 24 hours",
    howItWorks: "How we help",
    portals: "Who it's for",
    visitPromise: "24h home visit",
    forClinics: "For Clinics / Technology",
    languageLabel: "Language",
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    openPortal: "Open My Portal",
  },
};

export function PublicHeader({ showAnchors = false }: { showAnchors?: boolean }) {
  const { authUser, authChecked, logout } = usePlatform();
  const { lang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = NAV_COPY[lang];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
            <IconHeartHandshake className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                OnaCare
              </span>
              <span className="rounded-full bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 whitespace-nowrap">
                24/7
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block truncate">
              {t.subtitle}
            </p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {showAnchors && (
            <>
              <a href="#care-steps" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                {t.howItWorks}
              </a>
              <a href="#portals" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                {t.portals}
              </a>
              <a href="#visit-promise" className="hover:text-teal-700 dark:hover:text-teal-400 transition">
                {t.visitPromise}
              </a>
            </>
          )}
          <Link
            href="/technology"
            className="text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 transition"
          >
            {t.forClinics}
          </Link>
        </nav>

        {/* Desktop controls */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {authChecked && authUser ? (
            <>
              <Link
                href={getPortalHref(authUser.role)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition whitespace-nowrap"
              >
                {t.openPortal}
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition whitespace-nowrap"
              >
                <IconLogout className="h-3.5 w-3.5" />
                {t.signOut}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition whitespace-nowrap"
              >
                <IconLogin className="h-3.5 w-3.5" />
                {t.signIn}
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition whitespace-nowrap"
              >
                <IconUserPlus className="h-3.5 w-3.5" />
                {t.signUp}
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls + hamburger button (clean at 375px) */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {menuOpen ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Collapsible mobile drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 shadow-md">
          <nav className="flex flex-col gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
            {showAnchors && (
              <>
                <a
                  href="#care-steps"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.howItWorks}
                </a>
                <a
                  href="#portals"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.portals}
                </a>
                <a
                  href="#visit-promise"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.visitPromise}
                </a>
              </>
            )}
            <Link
              href="/technology"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2.5 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.forClinics}
            </Link>
          </nav>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.languageLabel}
            </span>
            <LanguageSwitcher />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {authChecked && authUser ? (
              <>
                <Link
                  href={getPortalHref(authUser.role)}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 transition"
                >
                  {t.openPortal}
                  <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <IconLogout className="h-3.5 w-3.5" />
                  {t.signOut}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <IconLogin className="h-3.5 w-3.5" />
                  {t.signIn}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 transition"
                >
                  <IconUserPlus className="h-3.5 w-3.5" />
                  {t.signUp}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
