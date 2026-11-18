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
    return (<div className="min-h-screen flex flex-col bg-[#F4F8F7] dark:bg-[#091315] text-slate-900 dark:text-slate-100">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full med-card oc-fade-up p-8 sm:p-10 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EDF5F3] dark:bg-[#16272B] text-teal-700 dark:text-teal-300">
            <IconFileAlert className="h-6 w-6" aria-hidden="true"/>
          </div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
            {t.code}
          </p>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
            {t.title}
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {t.desc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link href={homeHref} className="w-full sm:w-auto inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98]">
              <IconArrowLeft className="h-4 w-4" aria-hidden="true"/>
              {t.homeBtn}
            </Link>
            <Link href="/login" className="w-full sm:w-auto inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-teal-600 transition-colors">
              {t.signInBtn}
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>);
}
