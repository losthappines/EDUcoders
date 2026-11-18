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
    professionalsHeading: "Mutaxassislar va hamjamiyat",
    communityLink: "Onalar hamjamiyati va psixolog yordami",
    doctorLogin: "Shifokor, psixolog va hamshira kirishi",
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
    professionalsHeading: "Специалистам и сообщество",
    communityLink: "Сообщество мам и психолог",
    doctorLogin: "Вход для врачей, психологов и медсестер",
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
    professionalsHeading: "Professionals & Community",
    communityLink: "Mothers Community & Perinatal Support",
    doctorLogin: "Doctor, Psychologist & Nurse Sign In",
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
    <footer className="border-t border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#101E21] text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 text-sm">
        {/* Brand & Emergency summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="font-heading text-lg font-bold tracking-tight text-teal-800 dark:text-teal-300">
            {t.brand}
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs">
            {t.tagline}
          </p>
          <a
            href="tel:103"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 px-4 py-2 font-semibold text-rose-700 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/50 active:scale-[0.98] transition-all"
          >
            <IconPhoneCall className="h-4 w-4 shrink-0" aria-hidden="true" />
            103 — Emergency
          </a>
        </div>

        {/* Contact & Support */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.contactHeading}
          </h3>
          <ul className="space-y-2.5 text-slate-800 dark:text-slate-200">
            <li>
              <a href="tel:+998712001030" className="inline-flex min-h-[36px] items-center gap-2 hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-0.5">
                <IconPhoneCall className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
                {t.helplineLabel}
              </a>
            </li>
            <li>
              <a href="mailto:support@onacare.uz" className="inline-flex min-h-[36px] items-center gap-2 hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-0.5">
                <IconMail className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
                support@onacare.uz
              </a>
            </li>
            <li>
              <Link href="/telegram" className="inline-flex min-h-[36px] items-center gap-2 hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-0.5">
                <IconBrandTelegram className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
                {t.supportTgLabel}
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Data Trust */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.legalHeading}
          </h3>
          <ul className="space-y-2.5 text-slate-800 dark:text-slate-200">
            <li>
              <Link href="/privacy" className="inline-flex min-h-[36px] items-center hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-0.5">
                {t.privacy}
              </Link>
            </li>
            <li>
              <Link href="/privacy#data-handling" className="inline-flex min-h-[36px] items-center hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-0.5">
                {t.dataHandling}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="inline-flex min-h-[36px] items-center hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-0.5">
                {t.terms}
              </Link>
            </li>
          </ul>
        </div>

        {/* For Professionals & Languages */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.professionalsHeading}
          </h3>
          <ul className="space-y-2.5 text-slate-800 dark:text-slate-200">
            <li>
              <Link href="/hamjamiyat" className="inline-flex min-h-[36px] items-center hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-0.5">
                {t.communityLink}
              </Link>
            </li>
            <li>
              <Link href="/login" className="inline-flex min-h-[36px] items-center hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-0.5">
                {t.doctorLogin}
              </Link>
            </li>
            <li>
              <Link href="/login" className="inline-flex min-h-[36px] items-center hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-0.5">
                {t.coordinatorLogin}
              </Link>
            </li>
            <li>
              <Link href="/technology" className="inline-flex min-h-[36px] items-center hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-0.5">
                {t.techArch}
              </Link>
            </li>
            <li>
              <Link href="/telegram" className="inline-flex min-h-[36px] items-center hover:text-teal-700 dark:hover:text-teal-300 transition-colors py-0.5">
                {t.botConsole}
              </Link>
            </li>
          </ul>
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span>{t.languagesHeading}:</span>
            <Link href="/" className="hover:text-teal-700 dark:hover:text-teal-300 underline underline-offset-4 py-1">O&apos;zbekcha</Link>
            <Link href="/ru" className="hover:text-teal-700 dark:hover:text-teal-300 underline underline-offset-4 py-1">Русский</Link>
            <Link href="/en" className="hover:text-teal-700 dark:hover:text-teal-300 underline underline-offset-4 py-1">English</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D7E4E1] dark:border-[#1E353A] py-5 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <IconLock className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
            {t.copyright}
          </span>
          <span>© 2026 OnaCare</span>
        </div>
      </div>
    </footer>
  );
}
