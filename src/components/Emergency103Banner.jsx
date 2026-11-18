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
      className={`border-l-4 border-[#9E4747] dark:border-[#C89E92] border-y border-r border-[#E4D3CD] dark:border-[#3E2E2B] bg-[#F3EAE7] dark:bg-[#2A201E] px-5 py-4 text-[#292E2B] dark:text-[#F3F0E8] rounded-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <IconAlertTriangle className="h-5 w-5 shrink-0 text-[#7A2E2E] dark:text-[#D9B8AE] mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-heading text-sm font-bold text-[#7A2E2E] dark:text-[#F4C9C2]">
              {t.headline}
            </p>
            <p className="text-xs text-[#292E2B]/85 dark:text-[#F3F0E8]/85 leading-relaxed max-w-3xl">
              {t.body}
            </p>
          </div>
        </div>
        <a
          href="tel:103"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-sm bg-[#7A2E2E] hover:bg-[#622222] dark:bg-[#9E4747] dark:hover:bg-[#8A3B3B] px-4 py-2.5 text-xs font-semibold text-[#F7F5EF] transition-colors whitespace-nowrap"
        >
          <IconPhoneCall className="h-4 w-4" aria-hidden="true" />
          {t.cta}
        </a>
      </div>
    </aside>
  );
}
