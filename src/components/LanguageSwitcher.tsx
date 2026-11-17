"use client";

import React from "react";
import { IconWorld } from "@tabler/icons-react";
import { type AppLang, useLanguage } from "@/context/LanguageContext";

const LANG_OPTIONS: Array<{ code: AppLang; label: string; title: string }> = [
  { code: "uz", label: "UZ", title: "O'zbekcha" },
  { code: "ru", label: "RU", title: "Русский" },
  { code: "en", label: "EN", title: "English" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language switcher"
      className={`inline-flex items-center gap-0.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 ${className}`}
    >
      <IconWorld className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 ml-1.5 mr-0.5 shrink-0" />
      {LANG_OPTIONS.map((opt) => {
        const active = lang === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            title={opt.title}
            onClick={() => setLang(opt.code)}
            aria-pressed={active}
            className={`rounded-lg px-2 py-1 text-[11px] font-bold uppercase transition ${
              active
                ? "bg-teal-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
