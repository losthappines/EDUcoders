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
      className={`rounded-2xl border border-rose-300 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/50 px-4 py-3.5 text-rose-950 dark:text-rose-100 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
            <IconAlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-100">
              {t.headline}
            </p>
            <p className="text-xs text-rose-900/90 dark:text-rose-200/90 leading-relaxed">
              {t.body}
            </p>
          </div>
        </div>
        <a
          href="tel:103"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-800 transition whitespace-nowrap"
        >
          <IconPhoneCall className="h-4 w-4" aria-hidden="true" />
          {t.cta}
        </a>
      </div>
    </aside>
  );
}
