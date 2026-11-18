"use client";
import React from "react";
import Link from "next/link";
import { IconBrandTelegram, IconHeartHandshake, IconLock, IconMail, IconPhoneCall } from "@tabler/icons-react";
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
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
        {/* Brand & Emergency summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shrink-0">
              <IconHeartHandshake className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>{t.brand}</span>
          </div>
          <p className="text-slate-400 leading-relaxed">{t.tagline}</p>
          <a
            href="tel:103"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-rose-900/60 border border-rose-700/70 px-3 py-1.5 font-bold text-rose-200 hover:bg-rose-900 transition"
          >
            <IconPhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
            103 — Emergency
          </a>
        </div>

        {/* Contact & Support */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            {t.contactHeading}
          </h3>
          <ul className="space-y-2 text-slate-300">
            <li>
              <a href="tel:+998712001030" className="inline-flex items-center gap-1.5 hover:text-teal-300 transition py-0.5">
                <IconPhoneCall className="h-3.5 w-3.5 text-teal-400 shrink-0" aria-hidden="true" />
                {t.helplineLabel}
              </a>
            </li>
            <li>
              <a href="mailto:support@onacare.uz" className="inline-flex items-center gap-1.5 hover:text-teal-300 transition py-0.5">
                <IconMail className="h-3.5 w-3.5 text-teal-400 shrink-0" aria-hidden="true" />
                support@onacare.uz
              </a>
            </li>
            <li>
              <Link href="/telegram" className="inline-flex items-center gap-1.5 hover:text-sky-300 transition py-0.5">
                <IconBrandTelegram className="h-3.5 w-3.5 text-sky-400 shrink-0" aria-hidden="true" />
                {t.supportTgLabel}
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Data Trust */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            {t.legalHeading}
          </h3>
          <ul className="space-y-2 text-slate-300">
            <li>
              <Link href="/privacy" className="inline-block hover:text-teal-300 transition py-0.5">
                {t.privacy}
              </Link>
            </li>
            <li>
              <Link href="/privacy#data-handling" className="inline-block hover:text-teal-300 transition py-0.5">
                {t.dataHandling}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="inline-block hover:text-teal-300 transition py-0.5">
                {t.terms}
              </Link>
            </li>
          </ul>
        </div>

        {/* For Professionals & Languages */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            {t.professionalsHeading}
          </h3>
          <ul className="space-y-2 text-slate-300">
            <li>
              <Link href="/login" className="inline-block hover:text-teal-300 transition py-0.5">
                {t.doctorLogin}
              </Link>
            </li>
            <li>
              <Link href="/login" className="inline-block hover:text-teal-300 transition py-0.5">
                {t.coordinatorLogin}
              </Link>
            </li>
            <li>
              <Link href="/technology" className="inline-block hover:text-teal-300 transition py-0.5">
                {t.techArch}
              </Link>
            </li>
            <li>
              <Link href="/telegram" className="inline-block hover:text-sky-300 transition py-0.5">
                {t.botConsole}
              </Link>
            </li>
          </ul>
          <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-slate-400">{t.languagesHeading}:</span>
            <Link href="/" className="hover:text-white underline">O&apos;zbekcha</Link>
            <Link href="/ru" className="hover:text-white underline">Русский</Link>
            <Link href="/en" className="hover:text-white underline">English</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900 bg-slate-950/80 py-4 px-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <IconLock className="h-3.5 w-3.5 text-teal-400 shrink-0" aria-hidden="true" />
            {t.copyright}
          </span>
          <span>© 2026 OnaCare</span>
        </div>
      </div>
    </footer>
  );
}
