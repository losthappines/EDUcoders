"use client";
import React from "react";
import Link from "next/link";
import { IconBrandTelegram, IconLock, IconMail, IconPhoneCall } from "@tabler/icons-react";
import { useLanguage } from "@/context/LanguageContext";

const FOOTER_COPY = {
  uz: {
    brand: "OnaCare — Tug'ruqdan keyingi uyda parvarish",
    tagline: "Yangi onalar va chaqaloqlar uchun uyda xavfsiz patronaj yordami. Shoshilinch holatlarda darhol 103 ga qo'ng'iroq qiling.",
    contactHeading: "Aloqa va qo'llab-quvvatlash",
    helplineLabel: "Ishonch telefoni: +998 71 200 10 30",
    supportTgLabel: "Telegram yordam: @OnaCareSupport",
    legalHeading: "Huquqiy ma'lumotlar va xavfsizlik",
    privacy: "Maxfiylik siyosati",
    terms: "Foydalanish shartlari",
    dataHandling: "Ma'lumotlarni saqlash bayonoti",
    professionalsHeading: "Mutaxassislar uchun",
    doctorLogin: "Shifokor va hamshira kirishi",
    coordinatorLogin: "Poliklinika koordinatori kirishi",
    techArch: "Tizim arxitekturasi va klinik standartlar",
    botConsole: "Telegram Bot boshqaruvi",
    languagesHeading: "Tillar",
    copyright: "OnaCare Patronaj Platformasi • Ma'lumotlaringiz AES-256-GCM bilan himoyalangan.",
  },
  ru: {
    brand: "OnaCare — Послеродовой уход на дому",
    tagline: "Бережная домашняя поддержка мам и малышей. При угрожающих симптомах немедленно звоните 103.",
    contactHeading: "Контакты и поддержка",
    helplineLabel: "Горячая линия: +998 71 200 10 30",
    supportTgLabel: "Поддержка в Telegram: @OnaCareSupport",
    legalHeading: "Документы и защита данных",
    privacy: "Политика конфиденциальности",
    terms: "Условия использования",
    dataHandling: "Обработка медицинских данных",
    professionalsHeading: "Для специалистов",
    doctorLogin: "Вход для врачей и медсестер",
    coordinatorLogin: "Вход для координаторов клиник",
    techArch: "Архитектура и клинические стандарты",
    botConsole: "Консоль Telegram Бота",
    languagesHeading: "Языки",
    copyright: "Платформа патронажа OnaCare • Данные защищены шифрованием AES-256-GCM.",
  },
  en: {
    brand: "OnaCare — Postpartum Home Care",
    tagline: "Safe, coordinated home follow-up for new mothers and babies. In an emergency, always call 103 immediately.",
    contactHeading: "Contact & Support",
    helplineLabel: "Support Line: +998 71 200 10 30",
    supportTgLabel: "Telegram Support: @OnaCareSupport",
    legalHeading: "Legal & Data Trust",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    dataHandling: "Data-Handling Statement",
    professionalsHeading: "For Professionals",
    doctorLogin: "Doctor & Nurse Sign In",
    coordinatorLogin: "Clinic Coordinator Sign In",
    techArch: "Architecture & Clinical Standards",
    botConsole: "Telegram Bot Console",
    languagesHeading: "Languages",
    copyright: "OnaCare Patronage Platform • Medical records encrypted with AES-256-GCM.",
  },
};

export function SiteFooter() {
  const { lang } = useLanguage();
  const t = FOOTER_COPY[lang] || FOOTER_COPY.uz;

  return (
    <footer className="border-t border-[#DDD8CC] dark:border-[#2F3632] bg-[#EFECE3] dark:bg-[#1D221F] text-[#292E2B] dark:text-[#F3F0E8]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 text-xs">
        {/* Brand & Emergency summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="font-heading text-base font-bold tracking-tight text-[#244C40] dark:text-[#F3F0E8]">
            {t.brand}
          </div>
          <p className="text-[#525954] dark:text-[#B6BCB6] leading-relaxed max-w-xs">
            {t.tagline}
          </p>
          <a
            href="tel:103"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-sm border border-[#7A2E2E]/40 dark:border-[#C89E92]/40 bg-[#F3EAE7] dark:bg-[#2A201E] px-3.5 py-2 font-semibold text-[#7A2E2E] dark:text-[#F4C9C2] hover:bg-[#EBDBD6] dark:hover:bg-[#352825] transition-colors"
          >
            <IconPhoneCall className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            103 — Emergency
          </a>
        </div>

        {/* Contact & Support */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#525954] dark:text-[#B6BCB6]">
            {t.contactHeading}
          </h3>
          <ul className="space-y-2.5 text-[#292E2B] dark:text-[#F3F0E8]">
            <li>
              <a href="tel:+998712001030" className="inline-flex items-center gap-2 hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors py-0.5">
                <IconPhoneCall className="h-3.5 w-3.5 text-[#244C40] dark:text-[#A7BBAA] shrink-0" aria-hidden="true" />
                {t.helplineLabel}
              </a>
            </li>
            <li>
              <a href="mailto:support@onacare.uz" className="inline-flex items-center gap-2 hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors py-0.5">
                <IconMail className="h-3.5 w-3.5 text-[#244C40] dark:text-[#A7BBAA] shrink-0" aria-hidden="true" />
                support@onacare.uz
              </a>
            </li>
            <li>
              <Link href="/telegram" className="inline-flex items-center gap-2 hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors py-0.5">
                <IconBrandTelegram className="h-3.5 w-3.5 text-[#244C40] dark:text-[#A7BBAA] shrink-0" aria-hidden="true" />
                {t.supportTgLabel}
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Data Trust */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#525954] dark:text-[#B6BCB6]">
            {t.legalHeading}
          </h3>
          <ul className="space-y-2.5 text-[#292E2B] dark:text-[#F3F0E8]">
            <li>
              <Link href="/privacy" className="inline-block hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors py-0.5">
                {t.privacy}
              </Link>
            </li>
            <li>
              <Link href="/privacy#data-handling" className="inline-block hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors py-0.5">
                {t.dataHandling}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="inline-block hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors py-0.5">
                {t.terms}
              </Link>
            </li>
          </ul>
        </div>

        {/* For Professionals & Languages */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#525954] dark:text-[#B6BCB6]">
            {t.professionalsHeading}
          </h3>
          <ul className="space-y-2.5 text-[#292E2B] dark:text-[#F3F0E8]">
            <li>
              <Link href="/login" className="inline-block hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors py-0.5">
                {t.doctorLogin}
              </Link>
            </li>
            <li>
              <Link href="/login" className="inline-block hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors py-0.5">
                {t.coordinatorLogin}
              </Link>
            </li>
            <li>
              <Link href="/technology" className="inline-block hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors py-0.5">
                {t.techArch}
              </Link>
            </li>
            <li>
              <Link href="/telegram" className="inline-block hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors py-0.5">
                {t.botConsole}
              </Link>
            </li>
          </ul>
          <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#525954] dark:text-[#B6BCB6]">
            <span>{t.languagesHeading}:</span>
            <Link href="/" className="hover:text-[#244C40] dark:hover:text-[#F3F0E8] underline underline-offset-4">O&apos;zbekcha</Link>
            <Link href="/ru" className="hover:text-[#244C40] dark:hover:text-[#F3F0E8] underline underline-offset-4">Русский</Link>
            <Link href="/en" className="hover:text-[#244C40] dark:hover:text-[#F3F0E8] underline underline-offset-4">English</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[#DDD8CC] dark:border-[#2F3632] py-5 px-5 sm:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#525954] dark:text-[#B6BCB6]">
          <span className="inline-flex items-center gap-1.5">
            <IconLock className="h-3.5 w-3.5 text-[#244C40] dark:text-[#A7BBAA] shrink-0" aria-hidden="true" />
            {t.copyright}
          </span>
          <span>© 2026 OnaCare</span>
        </div>
      </div>
    </footer>
  );
}
