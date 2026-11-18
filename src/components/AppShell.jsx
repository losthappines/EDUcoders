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
        adminOverviewNav: "Clinic Overview",
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
        return (<div className="min-h-screen flex flex-col bg-[#F7F5EF] dark:bg-[#161A18] text-[#292E2B] dark:text-[#F3F0E8] transition-colors duration-200">
        {toast && (<div className="fixed bottom-4 right-4 z-50 max-w-md">
            <div className={`rounded-sm border-l-4 px-4 py-2.5 text-xs font-semibold shadow-sm ${toast.type === "error"
                    ? "border-[#9E4747] bg-[#F3EAE7] text-[#7A2E2E] dark:bg-[#2E1E1D] dark:text-[#F0C8C4]"
                    : toast.type === "success"
                        ? "border-[#244C40] bg-[#EFECE3] text-[#244C40] dark:border-[#A7BBAA] dark:bg-[#1D221F] dark:text-[#A7BBAA]"
                        : "border-[#9A6B42] bg-[#F7F5EF] text-[#292E2B] dark:bg-[#242A27] dark:text-[#F3F0E8]"}`}>
              {toast.text}
            </div>
          </div>)}
        {children}
      </div>);
    }
    if (!authChecked || !authUser || !isRoleAllowedOnPath(authUser.role, pathname)) {
        return (<div className="min-h-screen flex items-center justify-center bg-[#F7F5EF] dark:bg-[#161A18] px-4">
        <div className="max-w-sm w-full rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-6 text-center space-y-3">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-sm bg-[#EFECE3] dark:bg-[#242A27] text-[#244C40] dark:text-[#A7BBAA] border border-[#DDD8CC] dark:border-[#2F3733]">
            <IconLock className="h-5 w-5"/>
          </div>
          <h2 className="font-heading text-sm font-semibold text-[#292E2B] dark:text-[#F3F0E8]">
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
          <p className="text-xs text-[#525954] dark:text-[#B8C2BA]">
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
              <Link href={!authUser ? "/login" : getPortalForRole(authUser.role)} className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-[#244C40] dark:bg-[#2C5B4D] px-4 py-2 text-xs font-semibold text-[#F7F5EF] hover:bg-[#1B3A31] transition-colors">
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
            icon: <IconHeartHandshake className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]"/>,
        }
        : authUser.role === "OVABMU_MD"
            ? {
                badge: t.ovabmuBadge,
                subtitle: t.ovabmuSub,
                icon: <IconBuildingHospital className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]"/>,
            }
            : authUser.role === "FAMILY_MD"
                ? {
                    badge: t.familyBadge,
                    subtitle: t.familySub,
                    icon: <IconStethoscope className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]"/>,
                }
                : {
                    badge: t.adminBadge,
                    subtitle: t.adminSub,
                    icon: <IconShieldCheck className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]"/>,
                };
    return (<div className="min-h-screen flex flex-col bg-[#F7F5EF] dark:bg-[#161A18] transition-colors duration-200">
      {/* Strictly Role-Isolated Portal Header (Responsive at 375px) */}
      <header className="border-b border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] transition-colors duration-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#244C40] dark:bg-[#2C5B4D] text-[#F7F5EF] hover:bg-[#1B3A31] transition-colors" title="OnaCare">
              <IconHeartHandshake className="h-5 w-5"/>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link href="/" className="font-heading text-base font-semibold tracking-tight text-[#292E2B] dark:text-[#F3F0E8] hover:text-[#244C40] dark:hover:text-[#A7BBAA] truncate">
                  OnaCare
                </Link>
                <span className="inline-flex items-center gap-1 rounded-sm bg-[#EFECE3] dark:bg-[#242A27] px-2 py-0.5 text-[11px] font-semibold text-[#244C40] dark:text-[#A7BBAA] border border-[#DDD8CC] dark:border-[#2F3733] whitespace-nowrap">
                  {portalMeta.icon}
                  <span className="truncate max-w-[125px] sm:max-w-none">{portalMeta.badge}</span>
                </span>
              </div>
              <p className="text-xs text-[#525954] dark:text-[#B8C2BA] hidden sm:block truncate">
                {portalMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2 text-xs shrink-0">
            <Link href="/telegram" className="inline-flex items-center gap-1 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-2.5 py-1.5 font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:border-[#244C40] dark:hover:border-[#A7BBAA] transition-colors">
              <IconBrandTelegram className="h-3.5 w-3.5"/>
              <span className="hidden xl:inline">Telegram Bot</span>
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
            <span className="hidden lg:inline-flex items-center gap-1 rounded-sm bg-[#EFECE3] dark:bg-[#242A27] px-2.5 py-1 font-medium text-[#292E2B] dark:text-[#F3F0E8] border border-[#DDD8CC] dark:border-[#2F3733]">
              <IconLock className="h-3.5 w-3.5 text-[#244C40] dark:text-[#A7BBAA]"/>
              <InfoTooltip label={t.privateBadge} explanation={t.privateTooltip}/>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#EFECE3] dark:bg-[#242A27] px-3 py-1 font-semibold text-[#244C40] dark:text-[#A7BBAA] border border-[#A7BBAA] dark:border-[#6E8572]">
              <IconUserCheck className="h-3.5 w-3.5 text-[#244C40] dark:text-[#A7BBAA]"/>
              {authUser.fullName}
            </span>
            <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#161A18] px-3 py-1.5 text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8] hover:bg-[#EFECE3] dark:hover:bg-[#242A27] transition-colors">
              <IconLogout className="h-3.5 w-3.5"/>
              {t.signOut}
            </button>
          </div>

          {/* Mobile actions */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <ThemeToggle />
            <button type="button" onClick={() => setMobileMenuOpen((v) => !v)} aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? "Close portal menu" : "Open portal menu"} className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#161A18] text-[#292E2B] dark:text-[#F3F0E8] hover:bg-[#EFECE3] dark:hover:bg-[#242A27] transition-colors">
              {mobileMenuOpen ? <IconX className="h-5 w-5"/> : <IconMenu2 className="h-5 w-5"/>}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (<div className="md:hidden border-t border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] px-4 py-3 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#EFECE3] dark:bg-[#242A27] px-3 py-1 font-semibold text-[#244C40] dark:text-[#A7BBAA] border border-[#A7BBAA] dark:border-[#6E8572]">
                <IconUserCheck className="h-3.5 w-3.5 text-[#244C40] dark:text-[#A7BBAA]"/>
                {authUser.fullName}
              </span>
              <span className="inline-flex items-center gap-1 rounded-sm bg-[#EFECE3] dark:bg-[#242A27] px-2.5 py-1 font-medium text-[#292E2B] dark:text-[#F3F0E8] border border-[#DDD8CC] dark:border-[#2F3733]">
                <IconLock className="h-3.5 w-3.5 text-[#244C40] dark:text-[#A7BBAA]"/>
                {t.privateBadge}
              </span>
            </div>
            <Link href="/telegram" onClick={() => setMobileMenuOpen(false)} className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-2 text-xs font-semibold text-[#244C40] dark:text-[#A7BBAA]">
              <IconBrandTelegram className="h-4 w-4"/>
              Telegram Bot
            </Link>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#525954] dark:text-[#B8C2BA]">
                {t.languageLabel}
              </span>
              <LanguageSwitcher />
            </div>
            <button type="button" onClick={() => {
                setMobileMenuOpen(false);
                logout();
            }} className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#161A18] px-3 py-2 text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8] hover:bg-[#EFECE3] dark:hover:bg-[#242A27] transition-colors">
              <IconLogout className="h-3.5 w-3.5"/>
              {t.signOut}
            </button>
            {authUser.role === "ADMIN_RECEPTION" && (<div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#DDD8CC] dark:border-[#2F3733]">
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className={`min-h-[44px] inline-flex items-center justify-center rounded-sm px-3 py-2 text-xs font-semibold border transition-colors ${pathname === "/admin"
                    ? "border-[#244C40] bg-[#EFECE3] dark:bg-[#242A27] text-[#244C40] dark:text-[#A7BBAA]"
                    : "border-[#DDD8CC] dark:border-[#2F3733] text-[#292E2B] dark:text-[#F3F0E8]"}`}>
                  {t.adminOverviewNav}
                </Link>
                <Link href="/admin/verifications" onClick={() => setMobileMenuOpen(false)} className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold border transition-colors ${pathname.startsWith("/admin/verifications")
                    ? "border-[#244C40] bg-[#EFECE3] dark:bg-[#242A27] text-[#244C40] dark:text-[#A7BBAA]"
                    : "border-[#DDD8CC] dark:border-[#2F3733] text-[#292E2B] dark:text-[#F3F0E8]"}`}>
                  {t.adminVerificationsNav}
                  {(data?.pendingVerificationsCount ?? 0) > 0 && (<span className="rounded-sm bg-[#244C40] px-1.5 py-0.5 text-[10px] font-bold text-[#F7F5EF] leading-none">
                      {data?.pendingVerificationsCount}
                    </span>)}
                </Link>
              </div>)}
          </div>)}

        {/* Admin Dashboard Sub-Navigation Bar */}
        {authUser.role === "ADMIN_RECEPTION" && (<nav aria-label="Admin dashboard navigation" className="hidden md:block border-t border-[#DDD8CC] dark:border-[#2F3733] bg-[#EFECE3]/70 dark:bg-[#242A27]">
            <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2">
              <Link href="/admin" className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors ${pathname === "/admin"
                ? "bg-[#244C40] dark:bg-[#2C5B4D] text-[#F7F5EF]"
                : "text-[#525954] dark:text-[#B8C2BA] hover:bg-[#DDD8CC]/60 dark:hover:bg-[#1D221F]"}`}>
                <IconShieldCheck className="h-3.5 w-3.5"/>
                {t.adminOverviewNav}
              </Link>
              <Link href="/admin/verifications" className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors ${pathname.startsWith("/admin/verifications")
                ? "bg-[#244C40] dark:bg-[#2C5B4D] text-[#F7F5EF]"
                : "text-[#525954] dark:text-[#B8C2BA] hover:bg-[#DDD8CC]/60 dark:hover:bg-[#1D221F]"}`}>
                <IconUserCheck className="h-3.5 w-3.5"/>
                {t.adminVerificationsNav}
                {(data?.pendingVerificationsCount ?? 0) > 0 && (<span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold leading-none ${pathname.startsWith("/admin/verifications")
                    ? "bg-[#F7F5EF] text-[#244C40]"
                    : "bg-[#244C40] text-[#F7F5EF]"}`}>
                    {data?.pendingVerificationsCount}
                  </span>)}
              </Link>
            </div>
          </nav>)}
      </header>

      {toast && (<div className="mx-auto mt-3 w-full max-w-7xl px-4">
          <div className={`rounded-sm border-l-4 px-4 py-2.5 text-xs font-semibold ${toast.type === "error"
                ? "border-[#9E4747] bg-[#F3EAE7] text-[#7A2E2E] dark:bg-[#2E1E1D] dark:text-[#F0C8C4]"
                : toast.type === "success"
                    ? "border-[#244C40] bg-[#EFECE3] text-[#244C40] dark:border-[#A7BBAA] dark:bg-[#1D221F] dark:text-[#A7BBAA]"
                    : "border-[#9A6B42] bg-[#FFFFFF] text-[#292E2B] dark:bg-[#242A27] dark:text-[#F3F0E8]"}`}>
            {toast.text}
          </div>
        </div>)}

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>);
}
