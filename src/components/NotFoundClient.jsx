"use client";
import Link from "next/link";
import { IconArrowLeft, IconFileAlert } from "@tabler/icons-react";
import { PublicHeader } from "@/components/PublicHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/context/LanguageContext";
const NOT_FOUND_COPY = {
    uz: {
        code: "404 • Sahifa topilmadi",
        title: "Bu sahifa topilmadi",
        desc: "Siz so'ragan manzil mavjud emas yoki ko'chirilgan. OnaCare bosh sahifasiga qayting yoki hisobingizga kiring.",
        homeBtn: "Bosh sahifaga qaytish",
        signInBtn: "Kirish",
    },
    ru: {
        code: "404 • Страница не найдена",
        title: "Эта страница не найдена",
        desc: "Запрошенный адрес не существует или был перемещен. Вернитесь на главную страницу OnaCare или войдите в аккаунт.",
        homeBtn: "На главную",
        signInBtn: "Войти",
    },
    en: {
        code: "404 • Page Not Found",
        title: "This page could not be found",
        desc: "The URL you requested does not exist or may have moved. Return to the OnaCare homepage or sign in to your account.",
        homeBtn: "Back to Home",
        signInBtn: "Sign In",
    },
};
export default function NotFoundClient() {
    const { lang } = useLanguage();
    const t = NOT_FOUND_COPY[lang] || NOT_FOUND_COPY.uz;
    const homeHref = lang === "ru" ? "/ru" : lang === "en" ? "/en" : "/";
    return (<div className="min-h-screen flex flex-col bg-[#F7F5EF] dark:bg-[#161A18] text-[#292E2B] dark:text-[#F3F0E8]">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="max-w-md w-full border border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF] dark:bg-[#1D221F] p-8 sm:p-10 text-center space-y-4 rounded-sm">
          <IconFileAlert className="mx-auto h-7 w-7 text-[#244C40] dark:text-[#A7BBAA]" aria-hidden="true"/>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#244C40] dark:text-[#A7BBAA]">
            {t.code}
          </p>
          <h1 className="font-heading text-2xl font-semibold text-[#292E2B] dark:text-[#F3F0E8]">
            {t.title}
          </h1>
          <p className="text-xs sm:text-sm leading-relaxed text-[#525954] dark:text-[#B6BCB6]">
            {t.desc}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link href={homeHref} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-sm bg-[#244C40] hover:bg-[#1A382F] dark:bg-[#2C5B4D] dark:hover:bg-[#356D5C] px-5 py-2.5 text-xs font-semibold text-[#F7F5EF] transition-colors">
              <IconArrowLeft className="h-4 w-4" aria-hidden="true"/>
              {t.homeBtn}
            </Link>
            <Link href="/login" className="inline-flex min-h-[44px] items-center gap-1.5 rounded-sm border border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF] dark:bg-[#242A27] px-5 py-2.5 text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8] hover:bg-[#EFECE3] dark:hover:bg-[#2F3632] transition-colors">
              {t.signInBtn}
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>);
}
