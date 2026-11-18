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
      className={`inline-flex items-center border border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#16272B] p-1 rounded-xl ${className}`}
    >
      <IconWorld className="h-4 w-4 text-teal-700 dark:text-teal-400 mx-1.5 shrink-0" aria-hidden="true" />
      {LANG_OPTIONS.map((opt) => {
        const active = lang === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            title={opt.title}
            onClick={() => handleSelect(opt.code)}
            aria-pressed={active}
            className={`min-h-[38px] min-w-[38px] sm:min-h-[32px] sm:min-w-[34px] rounded-lg px-2.5 py-1 text-xs font-bold tracking-wider uppercase transition-all ${
              active
                ? "bg-teal-700 text-white dark:bg-teal-600 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-teal-800 dark:hover:text-teal-200"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
