"use client";
import React, { useState } from "react";
import Link from "next/link";
import { IconArrowRight, IconLogin, IconLogout, IconMenu2, IconUserPlus, IconX } from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function getPortalHref(role) {
  if (role === "PATIENT") return "/patient";
  if (role === "PSYCHOLOGIST") return "/psychologist";
  if (role === "ADMIN_RECEPTION") return "/admin";
  return "/clinical";
}

const NAV_COPY = {
  uz: {
    subtitle: "Onalar va chaqaloqlar uchun uyda g'amxo'rlik",
    howItWorks: "Qanday ishlaydi",
    conditions: "Shartlar va qamrov",
    community: "Onalar hamjamiyati",
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
    community: "Сообщество мам",
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
    community: "Mothers Community",
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
    <header className="sticky top-0 z-30 border-b border-[#D7E4E1] dark:border-[#1E353A] bg-white/90 dark:bg-[#101E21]/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3">
        <Link href={homeHref} className="flex items-center gap-2.5 min-w-0 min-h-[44px] py-1 group">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-700 dark:bg-teal-600 text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <div className="flex items-baseline gap-2.5 min-w-0">
            <span className="font-heading text-xl font-bold tracking-tight text-teal-800 dark:text-teal-300">
              OnaCare
            </span>
            <span className="hidden xl:inline text-xs font-medium text-slate-600 dark:text-slate-300 border-l border-[#D7E4E1] dark:border-[#1E353A] pl-2.5 truncate">
              {t.subtitle}
            </span>
          </div>
        </Link>

        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          {showAnchors ? (
            <>
              <a href="#care-steps" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-2">
                {t.howItWorks}
              </a>
              <a href="#visit-conditions" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-2">
                {t.conditions}
              </a>
              <Link href="/hamjamiyat" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-2">
                {t.community}
              </Link>
              <a href="#faq" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-2">
                {t.faq}
              </a>
            </>
          ) : (
            <>
              <Link href={homeHref} className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-2">
                {t.howItWorks}
              </Link>
              <Link href="/hamjamiyat" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-2">
                {t.community}
              </Link>
            </>
          )}
          <Link href="/privacy" className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-2">
            {t.privacy}
          </Link>
        </nav>

        {/* Desktop controls */}
        <div className="hidden md:flex items-center gap-2.5">
          <LanguageSwitcher />
          <ThemeToggle />
          {authChecked && authUser ? (
            <>
              <Link
                href={getPortalHref(authUser.role)}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm active:scale-[0.98] transition-all whitespace-nowrap"
              >
                {t.openPortal}
                <IconArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#16272B] px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-[#EDF5F3] dark:hover:bg-[#1E353A] active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <IconLogout className="h-4 w-4" aria-hidden="true" />
                {t.signOut}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#EDF5F3] dark:hover:bg-[#16272B] hover:text-teal-700 dark:hover:text-teal-300 transition-colors whitespace-nowrap"
              >
                <IconLogin className="h-4 w-4" aria-hidden="true" />
                {t.signIn}
              </Link>
              <Link
                href="/signup?role=PATIENT"
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <IconUserPlus className="h-4 w-4" aria-hidden="true" />
                {t.signUp}
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls + menu button (>=44px tap targets) */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#16272B] text-slate-800 dark:text-slate-100 hover:bg-[#EDF5F3] dark:hover:bg-[#1E353A] active:scale-95 transition-all"
          >
            {menuOpen ? <IconX className="h-5 w-5" aria-hidden="true" /> : <IconMenu2 className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Collapsible mobile drawer */}
      {menuOpen && (
        <div className="md:hidden oc-slide-down border-t border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-4 py-5 space-y-4 shadow-lg">
          <nav aria-label="Mobile navigation" className="flex flex-col divide-y divide-[#D7E4E1] dark:divide-[#1E353A] text-base font-medium text-slate-800 dark:text-slate-100">
            {showAnchors ? (
              <>
                <a href="#care-steps" onClick={() => setMenuOpen(false)} className="min-h-[48px] flex items-center py-2.5 hover:text-teal-700 dark:hover:text-teal-300">
                  {t.howItWorks}
                </a>
                <a href="#visit-conditions" onClick={() => setMenuOpen(false)} className="min-h-[48px] flex items-center py-2.5 hover:text-teal-700 dark:hover:text-teal-300">
                  {t.conditions}
                </a>
                <Link href="/hamjamiyat" onClick={() => setMenuOpen(false)} className="min-h-[48px] flex items-center py-2.5 hover:text-teal-700 dark:hover:text-teal-300">
                  {t.community}
                </Link>
                <a href="#faq" onClick={() => setMenuOpen(false)} className="min-h-[48px] flex items-center py-2.5 hover:text-teal-700 dark:hover:text-teal-300">
                  {t.faq}
                </a>
              </>
            ) : (
              <>
                <Link href={homeHref} onClick={() => setMenuOpen(false)} className="min-h-[48px] flex items-center py-2.5 hover:text-teal-700 dark:hover:text-teal-300">
                  {t.howItWorks}
                </Link>
                <Link href="/hamjamiyat" onClick={() => setMenuOpen(false)} className="min-h-[48px] flex items-center py-2.5 hover:text-teal-700 dark:hover:text-teal-300">
                  {t.community}
                </Link>
              </>
            )}
            <Link href="/privacy" onClick={() => setMenuOpen(false)} className="min-h-[48px] flex items-center py-2.5 hover:text-teal-700 dark:hover:text-teal-300">
              {t.privacy}
            </Link>
          </nav>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#D7E4E1] dark:border-[#1E353A]">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {t.languageLabel}
            </span>
            <LanguageSwitcher />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {authChecked && authUser ? (
              <>
                <Link
                  href={getPortalHref(authUser.role)}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl bg-teal-700 dark:bg-teal-600 px-3 py-2.5 text-sm font-semibold text-white active:scale-[0.98] transition-all"
                >
                  {t.openPortal}
                  <IconArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#16272B] px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 active:scale-[0.98] transition-all"
                >
                  <IconLogout className="h-4 w-4" aria-hidden="true" />
                  {t.signOut}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#16272B] px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 active:scale-[0.98] transition-all"
                >
                  <IconLogin className="h-4 w-4" aria-hidden="true" />
                  {t.signIn}
                </Link>
                <Link
                  href="/signup?role=PATIENT"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl bg-teal-700 dark:bg-teal-600 px-3 py-2.5 text-sm font-semibold text-white active:scale-[0.98] transition-all"
                >
                  <IconUserPlus className="h-4 w-4" aria-hidden="true" />
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
