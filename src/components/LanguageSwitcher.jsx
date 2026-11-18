"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconWorld } from "@tabler/icons-react";
import { useLanguage } from "@/context/LanguageContext";

const LANG_OPTIONS = [
  { code: "uz", label: "UZ", title: "O'zbekcha" },
  { code: "ru", label: "RU", title: "Русский" },
  { code: "en", label: "EN", title: "English" },
];

export function LanguageSwitcher({ className = "" }) {
  const { lang, setLang } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const handleSelect = (code) => {
    setLang(code);
    if (pathname === "/" || pathname === "/ru" || pathname === "/en") {
      const target = code === "ru" ? "/ru" : code === "en" ? "/en" : "/";
      if (target !== pathname) {
        router.push(target);
      }
    }
  };

  return (
    <div
      role="group"
      aria-label="Language switcher"
      className={`inline-flex items-center gap-0.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 ${className}`}
    >
      <IconWorld className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300 ml-1.5 mr-0.5 shrink-0" aria-hidden="true" />
      {LANG_OPTIONS.map((opt) => {
        const active = lang === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            title={opt.title}
            onClick={() => handleSelect(opt.code)}
            aria-pressed={active}
            className={`min-h-[36px] min-w-[36px] sm:min-h-[30px] sm:min-w-[30px] rounded-lg px-2 py-1 text-[11px] font-bold uppercase transition ${
              active
                ? "bg-teal-700 text-white shadow-2xs"
                : "text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
