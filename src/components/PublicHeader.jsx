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
    <header className="sticky top-0 z-30 border-b border-[#DDD8CC] dark:border-[#2F3632] bg-[#F7F5EF] dark:bg-[#161A18]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 py-3.5">
        <Link href={homeHref} className="flex items-baseline gap-2.5 min-w-0 min-h-[44px] py-1">
          <span className="font-heading text-xl font-bold tracking-tight text-[#244C40] dark:text-[#F3F0E8]">
            OnaCare
          </span>
          <span className="hidden xl:inline text-[11px] font-medium tracking-wide text-[#525954] dark:text-[#B6BCB6] border-l border-[#DDD8CC] dark:border-[#2F3632] pl-2.5 truncate">
            {t.subtitle}
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-6 text-xs font-medium tracking-wide text-[#525954] dark:text-[#B6BCB6]">
          {showAnchors ? (
            <>
              <a href="#care-steps" className="hover:text-[#244C40] dark:hover:text-[#F3F0E8] transition-colors py-2">
                {t.howItWorks}
              </a>
              <a href="#visit-conditions" className="hover:text-[#244C40] dark:hover:text-[#F3F0E8] transition-colors py-2">
                {t.conditions}
              </a>
              <Link href="/hamjamiyat" className="hover:text-[#244C40] dark:hover:text-[#F3F0E8] transition-colors py-2">
                {t.community}
              </Link>
              <a href="#faq" className="hover:text-[#244C40] dark:hover:text-[#F3F0E8] transition-colors py-2">
                {t.faq}
              </a>
            </>
          ) : (
            <>
              <Link href={homeHref} className="hover:text-[#244C40] dark:hover:text-[#F3F0E8] transition-colors py-2">
                {t.howItWorks}
              </Link>
              <Link href="/hamjamiyat" className="hover:text-[#244C40] dark:hover:text-[#F3F0E8] transition-colors py-2">
                {t.community}
              </Link>
            </>
          )}
          <Link href="/privacy" className="hover:text-[#244C40] dark:hover:text-[#F3F0E8] transition-colors py-2">
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
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-sm bg-[#244C40] hover:bg-[#1A382F] dark:bg-[#2C5B4D] dark:hover:bg-[#356D5C] px-4 py-2 text-xs font-semibold text-[#F7F5EF] transition-colors whitespace-nowrap"
              >
                {t.openPortal}
                <IconArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-sm border border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF] dark:bg-[#1D221F] px-3 py-2 text-xs font-medium text-[#292E2B] dark:text-[#F3F0E8] hover:bg-[#EFECE3] dark:hover:bg-[#242A27] transition-colors whitespace-nowrap"
              >
                <IconLogout className="h-3.5 w-3.5" aria-hidden="true" />
                {t.signOut}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex min-h-[40px] items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8] hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors whitespace-nowrap"
              >
                <IconLogin className="h-3.5 w-3.5" aria-hidden="true" />
                {t.signIn}
              </Link>
              <Link
                href="/signup?role=PATIENT"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-sm bg-[#244C40] hover:bg-[#1A382F] dark:bg-[#2C5B4D] dark:hover:bg-[#356D5C] px-4 py-2 text-xs font-semibold text-[#F7F5EF] transition-colors whitespace-nowrap"
              >
                <IconUserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                {t.signUp}
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls + menu button (>=44px tap targets) */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF] dark:bg-[#1D221F] text-[#292E2B] dark:text-[#F3F0E8] hover:bg-[#EFECE3] dark:hover:bg-[#242A27] transition-colors"
          >
            {menuOpen ? <IconX className="h-5 w-5" aria-hidden="true" /> : <IconMenu2 className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Collapsible mobile drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#DDD8CC] dark:border-[#2F3632] bg-[#F7F5EF] dark:bg-[#161A18] px-5 py-5 space-y-4">
          <nav aria-label="Mobile navigation" className="flex flex-col divide-y divide-[#DDD8CC] dark:divide-[#2F3632] text-sm font-medium text-[#292E2B] dark:text-[#F3F0E8]">
            {showAnchors ? (
              <>
                <a href="#care-steps" onClick={() => setMenuOpen(false)} className="min-h-[44px] flex items-center py-2 hover:text-[#244C40]">
                  {t.howItWorks}
                </a>
                <a href="#visit-conditions" onClick={() => setMenuOpen(false)} className="min-h-[44px] flex items-center py-2 hover:text-[#244C40]">
                  {t.conditions}
                </a>
                <Link href="/hamjamiyat" onClick={() => setMenuOpen(false)} className="min-h-[44px] flex items-center py-2 hover:text-[#244C40]">
                  {t.community}
                </Link>
                <a href="#faq" onClick={() => setMenuOpen(false)} className="min-h-[44px] flex items-center py-2 hover:text-[#244C40]">
                  {t.faq}
                </a>
              </>
            ) : (
              <>
                <Link href={homeHref} onClick={() => setMenuOpen(false)} className="min-h-[44px] flex items-center py-2 hover:text-[#244C40]">
                  {t.howItWorks}
                </Link>
                <Link href="/hamjamiyat" onClick={() => setMenuOpen(false)} className="min-h-[44px] flex items-center py-2 hover:text-[#244C40]">
                  {t.community}
                </Link>
              </>
            )}
            <Link href="/privacy" onClick={() => setMenuOpen(false)} className="min-h-[44px] flex items-center py-2 hover:text-[#244C40]">
              {t.privacy}
            </Link>
          </nav>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#DDD8CC] dark:border-[#2F3632]">
            <span className="text-xs font-medium text-[#525954] dark:text-[#B6BCB6]">
              {t.languageLabel}
            </span>
            <LanguageSwitcher />
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {authChecked && authUser ? (
              <>
                <Link
                  href={getPortalHref(authUser.role)}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-sm bg-[#244C40] dark:bg-[#2C5B4D] px-3 py-2.5 text-xs font-semibold text-[#F7F5EF] transition-colors"
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
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-sm border border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF] dark:bg-[#1D221F] px-3 py-2.5 text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8] transition-colors"
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
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-sm border border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF] dark:bg-[#1D221F] px-3 py-2.5 text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8] transition-colors"
                >
                  <IconLogin className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.signIn}
                </Link>
                <Link
                  href="/signup?role=PATIENT"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-sm bg-[#244C40] dark:bg-[#2C5B4D] px-3 py-2.5 text-xs font-semibold text-[#F7F5EF] transition-colors"
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
