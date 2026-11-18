"use client";
import React, { useState } from "react";
import Link from "next/link";
import { IconArrowRight, IconHeartHandshake, IconLogin, IconLogout, IconMenu2, IconUserPlus, IconX } from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function getPortalHref(role) {
  if (role === "PATIENT") return "/patient";
  if (role === "ADMIN_RECEPTION") return "/admin";
  return "/clinical";
}

const NAV_COPY = {
  uz: {
    subtitle: "Onalar va chaqaloqlar uchun uyda g'amxo'rlik",
    howItWorks: "Qanday ishlaydi",
    conditions: "Shartlar va qamrov",
    faq: "Savol-javob",
    privacy: "Maxfiylik",
    languageLabel: "Til",
    signIn: "Kirish",
    signUp: "Ro'yxatdan o'tish",
    signOut: "Chiqish",
    openPortal: "Kabinetimga kirish",
  },
  ru: {
    subtitle: "Домашняя забота о мамах и малышах",
    howItWorks: "Как это работает",
    conditions: "Условия визита",
    faq: "Вопросы и ответы",
    privacy: "Конфиденциальность",
    languageLabel: "Язык",
    signIn: "Войти",
    signUp: "Начать уход",
    signOut: "Выйти",
    openPortal: "Мой кабинет",
  },
  en: {
    subtitle: "Postpartum Home Care & Family Follow-Up",
    howItWorks: "How we help",
    conditions: "Visit terms",
    faq: "FAQ",
    privacy: "Privacy",
    languageLabel: "Language",
    signIn: "Sign In",
    signUp: "Get Started",
    signOut: "Sign Out",
    openPortal: "Open My Portal",
  },
};

export function PublicHeader({ showAnchors = false }) {
  const { authUser, authChecked, logout } = usePlatform();
  const { lang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = NAV_COPY[lang] || NAV_COPY.uz;
  const homeHref = lang === "ru" ? "/ru" : lang === "en" ? "/en" : "/";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5">
        <Link href={homeHref} className="flex items-center gap-2.5 min-w-0 min-h-[44px]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-xs">
            <IconHeartHandshake className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                OnaCare
              </span>
              <span className="rounded-full bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 whitespace-nowrap">
                24 soat
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 hidden lg:block truncate">
              {t.subtitle}
            </p>
          </div>
        </Link>

        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          {showAnchors ? (
            <>
              <a href="#care-steps" className="hover:text-teal-700 dark:hover:text-teal-400 transition py-2">
                {t.howItWorks}
              </a>
              <a href="#visit-conditions" className="hover:text-teal-700 dark:hover:text-teal-400 transition py-2">
                {t.conditions}
              </a>
              <a href="#faq" className="hover:text-teal-700 dark:hover:text-teal-400 transition py-2">
                {t.faq}
              </a>
            </>
          ) : (
            <Link href={homeHref} className="hover:text-teal-700 dark:hover:text-teal-400 transition py-2">
              {t.howItWorks}
            </Link>
          )}
          <Link href="/privacy" className="hover:text-teal-700 dark:hover:text-teal-400 transition py-2">
            {t.privacy}
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
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-800 transition whitespace-nowrap"
              >
                {t.openPortal}
                <IconArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition whitespace-nowrap"
              >
                <IconLogout className="h-3.5 w-3.5" aria-hidden="true" />
                {t.signOut}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap"
              >
                <IconLogin className="h-3.5 w-3.5" aria-hidden="true" />
                {t.signIn}
              </Link>
              <Link
                href="/signup?role=PATIENT"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-800 transition whitespace-nowrap"
              >
                <IconUserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                {t.signUp}
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls + hamburger button (>=44px tap targets) */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {menuOpen ? <IconX className="h-5 w-5" aria-hidden="true" /> : <IconMenu2 className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Collapsible mobile drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 shadow-md">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1 text-xs font-semibold text-slate-800 dark:text-slate-100">
            {showAnchors ? (
              <>
                <a href="#care-steps" onClick={() => setMenuOpen(false)} className="min-h-[44px] flex items-center rounded-lg px-2.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                  {t.howItWorks}
                </a>
                <a href="#visit-conditions" onClick={() => setMenuOpen(false)} className="min-h-[44px] flex items-center rounded-lg px-2.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                  {t.conditions}
                </a>
                <a href="#faq" onClick={() => setMenuOpen(false)} className="min-h-[44px] flex items-center rounded-lg px-2.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                  {t.faq}
                </a>
              </>
            ) : (
              <Link href={homeHref} onClick={() => setMenuOpen(false)} className="min-h-[44px] flex items-center rounded-lg px-2.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                {t.howItWorks}
              </Link>
            )}
            <Link href="/privacy" onClick={() => setMenuOpen(false)} className="min-h-[44px] flex items-center rounded-lg px-2.5 hover:bg-slate-100 dark:hover:bg-slate-800">
              {t.privacy}
            </Link>
          </nav>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
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
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-3 py-2.5 text-xs font-semibold text-white hover:bg-teal-800 transition"
                >
                  {t.openPortal}
                  <IconArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <IconLogout className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.signOut}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <IconLogin className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.signIn}
                </Link>
                <Link
                  href="/signup?role=PATIENT"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-3 py-2.5 text-xs font-semibold text-white hover:bg-teal-800 transition"
                >
                  <IconUserPlus className="h-3.5 w-3.5" aria-hidden="true" />
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
