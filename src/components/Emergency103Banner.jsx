"use client";
import React from "react";
import { IconAlertTriangle, IconPhoneCall } from "@tabler/icons-react";
import { useLanguage } from "@/context/LanguageContext";

const EMERGENCY_COPY = {
  uz: {
    badge: "Shoshilinch tibbiy yordam",
    headline: "Shoshilinch holatda darhol 103 raqamiga qo'ng'iroq qiling!",
    body: "Kuchli qon ketishi, nafas qisilishi, hushdan ketish, yuqori isitma (38.5°C+) yoki ko'rish buzilishida kunlik tekshiruv javobini kutmang — OnaCare shoshilinch tez yordam o'rnini bosmaydi.",
    cta: "103 ga qo'ng'iroq",
  },
  ru: {
    badge: "Экстренная помощь",
    headline: "В экстренной ситуации немедленно звоните 103!",
    body: "При сильном кровотечении, одышке, потере сознания, высокой температуре (38.5°C+) или нарушении зрения не ждите ответа в чате — OnaCare не заменяет скорую помощь.",
    cta: "Позвонить 103",
  },
  en: {
    badge: "Emergency Notice",
    headline: "If it is urgent, call 103 immediately!",
    body: "For heavy bleeding, trouble breathing, fainting, high fever (38.5°C+), or sudden vision changes, do not wait for daily check-in review — OnaCare does not replace emergency ambulance care.",
    cta: "Call 103 Now",
  },
};

export function Emergency103Banner({ className = "" }) {
  const { lang } = useLanguage();
  const t = EMERGENCY_COPY[lang] || EMERGENCY_COPY.uz;

  return (
    <aside
      aria-label={t.badge}
      className={`rounded-2xl border border-rose-200 dark:border-rose-900/70 bg-rose-50/90 dark:bg-rose-950/35 px-4 sm:px-5 py-4 text-slate-900 dark:text-slate-100 shadow-xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-200">
            <IconAlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="font-heading text-base font-bold text-rose-800 dark:text-rose-200">
              {t.headline}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
              {t.body}
            </p>
          </div>
        </div>
        <a
          href="tel:103"
          className="inline-flex min-h-[46px] w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-700 hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm active:scale-[0.98] transition-all whitespace-nowrap"
        >
          <IconPhoneCall className="h-4 w-4" aria-hidden="true" />
          {t.cta}
        </a>
      </div>
    </aside>
  );
}
