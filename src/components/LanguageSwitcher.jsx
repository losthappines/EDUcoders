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
      className={`inline-flex items-center border border-[#DDD8CC] dark:border-[#2F3632] bg-[#EFECE3] dark:bg-[#242A27] p-0.5 rounded-sm ${className}`}
    >
      <IconWorld className="h-3.5 w-3.5 text-[#525954] dark:text-[#B6BCB6] mx-1.5 shrink-0" aria-hidden="true" />
      {LANG_OPTIONS.map((opt) => {
        const active = lang === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            title={opt.title}
            onClick={() => handleSelect(opt.code)}
            aria-pressed={active}
            className={`min-h-[36px] min-w-[36px] sm:min-h-[30px] sm:min-w-[30px] rounded-xs px-2 py-1 text-[11px] font-semibold tracking-wider uppercase transition-colors ${
              active
                ? "bg-[#244C40] text-[#F7F5EF] dark:bg-[#2C5B4D]"
                : "text-[#525954] dark:text-[#B6BCB6] hover:text-[#292E2B] dark:hover:text-[#F3F0E8]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
