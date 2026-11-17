"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconBrandTelegram, IconBuildingHospital, IconHeartHandshake, IconLock, IconLogout, IconMenu2, IconShieldCheck, IconStethoscope, IconUserCheck, IconX, } from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { InfoTooltip } from "@/components/InfoTooltip";
function getPortalForRole(role) {
    switch (role) {
        case "PATIENT":
            return "/patient";
        case "OVABMU_MD":
        case "FAMILY_MD":
            return "/clinical";
        case "ADMIN_RECEPTION":
            return "/admin";
    }
}
function isProtectedPortalPath(pathname) {
    return (pathname.startsWith("/patient") ||
        pathname.startsWith("/clinical") ||
        pathname.startsWith("/admin"));
}
function isRoleAllowedOnPath(role, pathname) {
    if (pathname.startsWith("/patient"))
        return role === "PATIENT";
    if (pathname.startsWith("/clinical")) {
        return role === "OVABMU_MD" || role === "FAMILY_MD";
    }
    if (pathname.startsWith("/admin"))
        return role === "ADMIN_RECEPTION";
    return true;
}
const SHELL_COPY = {
    uz: {
        privateBadge: "Shaxsiy va himoyalangan",
        privateTooltip: "Barcha tibbiy ma'lumotlar shifrlangan va faqat siz hamda shifokoringizga ko'rinadi.",
        languageLabel: "Til",
        signOut: "Chiqish",
        patientBadge: "Bemor kabineti",
        patientSub: "Shaxsiy parvarish rejasi va 24 soatlik uy tashrifi",
        ovabmuBadge: "Tug'ruqxona shifokori",
        ovabmuSub: "Bemorlarni uyga chiqarish va shifokorga yo'naltirish",
        familyBadge: "Oilaviy shifokor",
        familySub: "Poliklinika va 24 soatlik uy ko'rigi",
        adminBadge: "Qabulxona va nazorat",
        adminSub: "24 soatlik tashriflar nazorati va hisobotlar",
        adminOverviewNav: "Umumiy nazorat",
        adminVerificationsNav: "Hisoblarni tasdiqlash",
    },
    ru: {
        privateBadge: "Приватно и зашифровано",
        privateTooltip: "Ваши медицинские данные зашифрованы и доступны только вам и вашей команде врачей.",
        languageLabel: "Язык",
        signOut: "Выйти",
        patientBadge: "Кабинет пациента",
        patientSub: "Личный план восстановления и визит врача за 24 часа",
        ovabmuBadge: "Врач роддома",
        ovabmuSub: "Выписка пациенток и направление к семейному врачу",
        familyBadge: "Семейный врач",
        familySub: "Поликлиника и домашний осмотр в течение 24 часов",
        adminBadge: "Координатор клиники",
        adminSub: "Контроль 24-часовых визитов и отчетность",
        adminOverviewNav: "Обзор клиники",
        adminVerificationsNav: "Проверка аккаунтов",
    },
    en: {
        privateBadge: "Encrypted & private",
        privateTooltip: "Your health data is encrypted and visible only to you and your care team.",
        languageLabel: "Language",
        signOut: "Sign Out",
        patientBadge: "Patient Portal",
        patientSub: "Your recovery plan & 24-hour home visit",
        ovabmuBadge: "Hospital Doctor",
        ovabmuSub: "Prepare discharge summaries & arrange home visits",
        familyBadge: "Family Doctor",
        familySub: "Local clinic & 24-hour home check-ups",
        adminBadge: "Clinic Coordinator",
        adminSub: "24-hour visit tracking, reception & summaries",
        adminOverviewNav: "Dashboard Overview",
        adminVerificationsNav: "Account Verifications",
    },
};
export function AppShell({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { lang } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { authUser, authChecked, data, toast, logout } = usePlatform();
    const isProtected = isProtectedPortalPath(pathname);
    const t = SHELL_COPY[lang];
    useEffect(() => {
        if (!isProtected || !authChecked)
            return;
        if (!authUser) {
            router.replace("/login");
            return;
        }
        if (!isRoleAllowedOnPath(authUser.role, pathname)) {
            router.replace(getPortalForRole(authUser.role));
        }
    }, [isProtected, authChecked, authUser, pathname, router]);
    if (!isProtected) {
        return (<div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        {toast && (<div className="fixed bottom-4 right-4 z-50 max-w-md">
            <div className={`rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-lg ${toast.type === "error"
                    ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/90 dark:text-rose-200"
                    : toast.type === "success"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-200"
                        : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/90 dark:text-amber-200"}`}>
              {toast.text}
            </div>
          </div>)}
        {children}
      </div>);
    }
    if (!authChecked || !authUser || !isRoleAllowedOnPath(authUser.role, pathname)) {
        return (<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="max-w-sm w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-sm space-y-3">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
            <IconLock className="h-5 w-5"/>
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {!authChecked
                ? lang === "ru"
                    ? "Проверка сессии..."
                    : lang === "en"
                        ? "Checking session..."
                        : "Sessiya tekshirilmoqda..."
                : !authUser
                    ? lang === "ru"
                        ? "Требуется вход"
                        : lang === "en"
                            ? "Sign in required"
                            : "Kirish talab qilinadi"
                    : lang === "ru"
                        ? "Доступ ограничен — перенаправление"
                        : lang === "en"
                            ? "Access restricted — redirecting"
                            : "Ruxsat cheklangan — yo'naltirilmoqda"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {!authChecked
                ? lang === "ru"
                    ? "Подключение к вашему защищенному кабинету..."
                    : lang === "en"
                        ? "Connecting to your secure portal..."
                        : "Xavfsiz kabinetga ulanilmoqda..."
                : !authUser
                    ? lang === "ru"
                        ? "Вы еще не вошли в систему. Перенаправляем на страницу входа."
                        : lang === "en"
                            ? "You are not signed in. Redirecting to Sign In."
                            : "Siz hali tizimga kirmagansiz. Kirish sahifasiga yo'naltirilmoqda."
                    : lang === "ru"
                        ? "Вы можете открыть только кабинет вашей роли."
                        : lang === "en"
                            ? "You can only open the portal assigned to your role."
                            : "Siz faqat o'zingizning rolingizga tegishli kabinetni ko'rishingiz mumkin."}
          </p>
          {authChecked && (<div className="pt-1">
              <Link href={!authUser ? "/login" : getPortalForRole(authUser.role)} className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition">
                {!authUser
                    ? lang === "ru"
                        ? "Перейти ко входу"
                        : lang === "en"
                            ? "Go to Sign In"
                            : "Kirish sahifasiga o'tish"
                    : lang === "ru"
                        ? "Открыть мой кабинет"
                        : lang === "en"
                            ? "Open My Portal"
                            : "Kabinetimga o'tish"}
              </Link>
            </div>)}
        </div>
      </div>);
    }
    const portalMeta = authUser.role === "PATIENT"
        ? {
            badge: t.patientBadge,
            subtitle: t.patientSub,
            icon: <IconHeartHandshake className="h-4 w-4 text-teal-700 dark:text-teal-300"/>,
        }
        : authUser.role === "OVABMU_MD"
            ? {
                badge: t.ovabmuBadge,
                subtitle: t.ovabmuSub,
                icon: <IconBuildingHospital className="h-4 w-4 text-teal-700 dark:text-teal-300"/>,
            }
            : authUser.role === "FAMILY_MD"
                ? {
                    badge: t.familyBadge,
                    subtitle: t.familySub,
                    icon: <IconStethoscope className="h-4 w-4 text-teal-700 dark:text-teal-300"/>,
                }
                : {
                    badge: t.adminBadge,
                    subtitle: t.adminSub,
                    icon: <IconShieldCheck className="h-4 w-4 text-teal-700 dark:text-teal-300"/>,
                };
    return (<div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Strictly Role-Isolated Portal Header (Responsive at 375px) */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs hover:bg-teal-700 transition" title="OnaCare">
              <IconHeartHandshake className="h-5 w-5"/>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link href="/" className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 hover:text-teal-700 dark:hover:text-teal-400 truncate">
                  OnaCare
                </Link>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-[11px] font-semibold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 whitespace-nowrap">
                  {portalMeta.icon}
                  <span className="truncate max-w-[125px] sm:max-w-none">{portalMeta.badge}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                {portalMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2 text-xs shrink-0">
            <Link href="/telegram" className="inline-flex items-center gap-1 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 px-2.5 py-1.5 font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition">
              <IconBrandTelegram className="h-3.5 w-3.5"/>
              <span className="hidden xl:inline">Telegram Bot</span>
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
            <span className="hidden lg:inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <IconLock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400"/>
              <InfoTooltip label={t.privateBadge} explanation={t.privateTooltip}/>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <IconUserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"/>
              {authUser.fullName}
            </span>
            <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition">
              <IconLogout className="h-3.5 w-3.5"/>
              {t.signOut}
            </button>
          </div>

          {/* Mobile actions */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <ThemeToggle />
            <button type="button" onClick={() => setMobileMenuOpen((v) => !v)} aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? "Close portal menu" : "Open portal menu"} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              {mobileMenuOpen ? <IconX className="h-5 w-5"/> : <IconMenu2 className="h-5 w-5"/>}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (<div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <IconUserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"/>
                {authUser.fullName}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <IconLock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400"/>
                {t.privateBadge}
              </span>
            </div>
            <Link href="/telegram" onClick={() => setMobileMenuOpen(false)} className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 px-3 py-2 text-xs font-semibold text-sky-700 dark:text-sky-300">
              <IconBrandTelegram className="h-4 w-4"/>
              Telegram Bot
            </Link>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                {t.languageLabel}
              </span>
              <LanguageSwitcher />
            </div>
            <button type="button" onClick={() => {
                setMobileMenuOpen(false);
                logout();
            }} className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              <IconLogout className="h-3.5 w-3.5"/>
              {t.signOut}
            </button>
            {authUser.role === "ADMIN_RECEPTION" && (<div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold border transition ${pathname === "/admin"
                    ? "border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"}`}>
                  {t.adminOverviewNav}
                </Link>
                <Link href="/admin/verifications" onClick={() => setMobileMenuOpen(false)} className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition ${pathname.startsWith("/admin/verifications")
                    ? "border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"}`}>
                  {t.adminVerificationsNav}
                  {(data?.pendingVerificationsCount ?? 0) > 0 && (<span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                      {data?.pendingVerificationsCount}
                    </span>)}
                </Link>
              </div>)}
          </div>)}

        {/* Admin Dashboard Sub-Navigation Bar */}
        {authUser.role === "ADMIN_RECEPTION" && (<nav aria-label="Admin dashboard navigation" className="hidden md:block border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
            <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2">
              <Link href="/admin" className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${pathname === "/admin"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800"}`}>
                <IconShieldCheck className="h-3.5 w-3.5"/>
                {t.adminOverviewNav}
              </Link>
              <Link href="/admin/verifications" className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${pathname.startsWith("/admin/verifications")
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800"}`}>
                <IconUserCheck className="h-3.5 w-3.5"/>
                {t.adminVerificationsNav}
                {(data?.pendingVerificationsCount ?? 0) > 0 && (<span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${pathname.startsWith("/admin/verifications")
                    ? "bg-white text-teal-800"
                    : "bg-amber-500 text-white"}`}>
                    {data?.pendingVerificationsCount}
                  </span>)}
              </Link>
            </div>
          </nav>)}
      </header>

      {toast && (<div className="mx-auto mt-3 w-full max-w-7xl px-4">
          <div className={`rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-sm ${toast.type === "error"
                ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200"
                : toast.type === "success"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200"
                    : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-200"}`}>
            {toast.text}
          </div>
        </div>)}

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>);
}
