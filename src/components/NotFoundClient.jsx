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
    return (<div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <IconFileAlert className="h-6 w-6" aria-hidden="true"/>
          </div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400">
            {t.code}
          </p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.title}
          </h1>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {t.desc}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <Link href={homeHref} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-800 transition">
              <IconArrowLeft className="h-4 w-4" aria-hidden="true"/>
              {t.homeBtn}
            </Link>
            <Link href="/login" className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              {t.signInBtn}
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>);
}
