"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { usePathname, useRouter } from "next/navigation";
import { IconBrandTelegram, IconBuildingHospital, IconCheck, IconCopy, IconExternalLink, IconHeartHandshake, IconLinkOff, IconLock, IconLogout, IconMenu2, IconShieldCheck, IconStethoscope, IconTrash, IconUserCheck, IconX, } from "@tabler/icons-react";
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
        case "PSYCHOLOGIST":
            return "/psychologist";
        case "ADMIN_RECEPTION":
            return "/admin";
    }
}
function isProtectedPortalPath(pathname) {
    return (pathname.startsWith("/patient") ||
        pathname.startsWith("/clinical") ||
        pathname.startsWith("/psychologist") ||
        pathname.startsWith("/admin"));
}
function isRoleAllowedOnPath(role, pathname) {
    if (pathname.startsWith("/patient"))
        return role === "PATIENT";
    if (pathname.startsWith("/clinical")) {
        return role === "OVABMU_MD" || role === "FAMILY_MD";
    }
    if (pathname.startsWith("/psychologist"))
        return role === "PSYCHOLOGIST";
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
        psychBadge: "Perinatal psixolog",
        psychSub: "Onalar ruhiy holati, EPDS skrining va shaxsiy seanslar",
        adminBadge: "Qabulxona va nazorat",
        adminSub: "24 soatlik tashriflar nazorati va hisobotlar",
        adminOverviewNav: "Umumiy nazorat",
        adminVerificationsNav: "Hisoblarni tasdiqlash",
        tgConnectedBtn: "Telegram ✓",
        tgConnectBtn: "Telegram ulash",
        tgModalTitle: "Hisobingizni Telegram botga ulash",
        tgModalDesc: "Telegram orqali shaxsiy profilingiz, asosiy ma'lumotlaringiz, tashrif eslatmalari va shifokor chatidan foydalaning.",
        tgOpenWebBot: "Telegram botda ochish va profilni ko'rish",
        tgOpenApp: "Telegram ilovasida ochish",
        tgCopyCmd: "Buyruqni nusxalash",
        tgCopied: "Nusxalandi ✓",
        tgUnlink: "Telegramni uzish",
        tgLoading: "Yuklanmoqda...",
        acctTitle: "Mening hisobim",
        acctEmail: "Elektron pochta:",
        acctDistrict: "Hudud:",
        acctDeleteTitle: "Hisobni butunlay o'chirish",
        acctDeleteDesc: "Hisobingiz va unga bog'liq barcha yozuvlar (tibbiy ma'lumotlar, shikoyatlar, tashriflar, xabarlar, obunalar) bazadan butunlay o'chiriladi.",
        acctDeleteInputLabel: "Tasdiqlash uchun DELETE so'zini yozing:",
        acctDeleteBtn: "Hisob va barcha yozuvlarni o'chirish",
        acctDeleting: "O'chirilmoqda...",
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
        psychBadge: "Перинатальный психолог",
        psychSub: "Эмоциональная поддержка мам, скрининг EPDS и сеансы",
        adminBadge: "Координатор клиники",
        adminSub: "Контроль 24-часовых визитов и отчетность",
        adminOverviewNav: "Обзор клиники",
        adminVerificationsNav: "Проверка аккаунтов",
        tgConnectedBtn: "Telegram ✓",
        tgConnectBtn: "Привязать Telegram",
        tgModalTitle: "Привязка аккаунта к Telegram-боту",
        tgModalDesc: "Смотрите профиль и основные медицинские данные, получайте уведомления о визитах и общайтесь с врачом в Telegram.",
        tgOpenWebBot: "Открыть в Telegram-боте и показать профиль",
        tgOpenApp: "Открыть в приложении Telegram",
        tgCopyCmd: "Копировать команду",
        tgCopied: "Скопировано ✓",
        tgUnlink: "Отвязать Telegram",
        tgLoading: "Загрузка...",
        acctTitle: "Мой аккаунт",
        acctEmail: "Эл. почта:",
        acctDistrict: "Район:",
        acctDeleteTitle: "Удалить аккаунт навсегда",
        acctDeleteDesc: "Аккаунт и все связанные записи (медданные, жалобы, визиты, сообщения, подписки) будут безвозвратно удалены.",
        acctDeleteInputLabel: "Введите DELETE для подтверждения:",
        acctDeleteBtn: "Удалить аккаунт и все записи",
        acctDeleting: "Удаление...",
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
        psychBadge: "Perinatal Psychologist",
        psychSub: "Postpartum emotional wellbeing, EPDS screening & sessions",
        adminBadge: "Clinic Coordinator",
        adminSub: "24-hour visit tracking, reception & summaries",
        adminOverviewNav: "Clinic Overview",
        adminVerificationsNav: "Account Verifications",
        tgConnectedBtn: "Telegram ✓",
        tgConnectBtn: "Link Telegram",
        tgModalTitle: "Link Your Account to Telegram Bot",
        tgModalDesc: "View your profile & essentials, receive home-visit alerts, and message doctors directly via Telegram.",
        tgOpenWebBot: "Open in Telegram Bot & View Profile",
        tgOpenApp: "Open in Telegram App",
        tgCopyCmd: "Copy /link Command",
        tgCopied: "Copied ✓",
        tgUnlink: "Unlink Telegram",
        tgLoading: "Loading...",
        acctTitle: "My Account",
        acctEmail: "Email:",
        acctDistrict: "District:",
        acctDeleteTitle: "Delete Account Permanently",
        acctDeleteDesc: "This permanently erases your account and all associated records (medical records, complaints, visits, messages, subscriptions).",
        acctDeleteInputLabel: "Type DELETE to confirm permanent removal:",
        acctDeleteBtn: "Delete Account & All Records",
        acctDeleting: "Deleting...",
    },
};
export function AppShell({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { lang } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [tgModalOpen, setTgModalOpen] = useState(false);
    const [tgLinkData, setTgLinkData] = useState(null);
    const [tgBusy, setTgBusy] = useState(false);
    const [copiedTg, setCopiedTg] = useState(false);
    const [acctModalOpen, setAcctModalOpen] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
    const [deletingAcct, setDeletingAcct] = useState(false);
    const [deleteAcctErr, setDeleteAcctErr] = useState(null);
    const { authUser, authChecked, data, toast, logout, deleteMyAccount, refreshData } = usePlatform();
    const isProtected = isProtectedPortalPath(pathname);
    const t = SHELL_COPY[lang];
    const openAccountModal = () => {
        setMobileMenuOpen(false);
        setDeleteConfirmInput("");
        setDeleteAcctErr(null);
        setAcctModalOpen(true);
    };
    const handleSelfDeleteAccount = async () => {
        setDeleteAcctErr(null);
        setDeletingAcct(true);
        try {
            const res = await deleteMyAccount();
            if (res.ok) {
                setAcctModalOpen(false);
            }
            else {
                setDeleteAcctErr(res.error || "Failed to delete account.");
            }
        }
        finally {
            setDeletingAcct(false);
        }
    };
    const openTelegramModal = async () => {
        setMobileMenuOpen(false);
        setTgModalOpen(true);
        setTgBusy(true);
        try {
            const res = await fetch("/api/telegram/link", {
                cache: "no-store",
                credentials: "include",
            });
            if (res.ok) {
                setTgLinkData(await res.json());
            }
        }
        catch {
            // ignore link fetch failure
        }
        finally {
            setTgBusy(false);
        }
    };
    const handleUnlinkTg = async () => {
        setTgBusy(true);
        try {
            const res = await fetch("/api/telegram/link", {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                setTgLinkData((prev) => (prev ? { ...prev, linked: false } : prev));
                refreshData();
            }
        }
        finally {
            setTgBusy(false);
        }
    };
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
        return (<div className="min-h-screen flex flex-col bg-[#F4F8F7] dark:bg-[#091315] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {toast && (<div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 max-w-md oc-fade-up">
            <div className={`rounded-2xl border-l-4 px-4 py-3 text-sm font-semibold shadow-lg ${toast.type === "error"
                    ? "border-rose-600 bg-rose-50 text-rose-800 dark:bg-rose-950/90 dark:text-rose-200"
                    : toast.type === "success"
                        ? "border-teal-700 bg-white text-teal-800 dark:border-teal-400 dark:bg-[#101E21] dark:text-teal-200"
                        : "border-amber-600 bg-white text-slate-900 dark:bg-[#16272B] dark:text-slate-100"}`}>
              {toast.text}
            </div>
          </div>)}
        {children}
      </div>);
    }
    if (!authChecked || !authUser || !isRoleAllowedOnPath(authUser.role, pathname)) {
        return (<div className="min-h-screen flex items-center justify-center bg-[#F4F8F7] dark:bg-[#091315] px-4">
        <div className="max-w-sm w-full med-card oc-modal-in p-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF5F3] dark:bg-[#16272B] text-teal-700 dark:text-teal-300 border border-[#D7E4E1] dark:border-[#1E353A]">
            <IconLock className="h-5 w-5"/>
          </div>
          <h2 className="font-heading text-base font-bold text-slate-900 dark:text-slate-100">
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
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
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
              <Link href={!authUser ? "/login" : getPortalForRole(authUser.role)} className="inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white active:scale-[0.98] transition-all">
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
                : authUser.role === "PSYCHOLOGIST"
                    ? {
                        badge: t.psychBadge,
                        subtitle: t.psychSub,
                        icon: <IconHeartHandshake className="h-4 w-4 text-teal-700 dark:text-teal-300"/>,
                    }
                    : {
                        badge: t.adminBadge,
                        subtitle: t.adminSub,
                        icon: <IconShieldCheck className="h-4 w-4 text-teal-700 dark:text-teal-300"/>,
                    };
    return (<div className="min-h-screen flex flex-col bg-[#F4F8F7] dark:bg-[#091315] transition-colors duration-200">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="lazyOnload" onLoad={() => {
            try {
                window.Telegram?.WebApp?.ready();
                window.Telegram?.WebApp?.expand();
            }
            catch {
                // ignore
            }
        }}/>
      {/* Strictly Role-Isolated Portal Header (Responsive at 375px) */}
      <header className="sticky top-0 z-30 border-b border-[#D7E4E1] dark:border-[#1E353A] bg-white/95 dark:bg-[#101E21]/95 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2.5 px-3.5 sm:px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 dark:bg-teal-600 text-white shadow-sm hover:bg-teal-800 active:scale-95 transition-all" title="OnaCare">
              <IconHeartHandshake className="h-5 w-5"/>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href="/" className="font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 hover:text-teal-700 dark:hover:text-teal-300 truncate">
                  OnaCare
                </Link>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#EDF5F3] dark:bg-[#16272B] px-2.5 py-0.5 text-xs font-semibold text-teal-800 dark:text-teal-300 border border-[#D7E4E1] dark:border-[#1E353A] whitespace-nowrap">
                  {portalMeta.icon}
                  <span className="truncate max-w-[130px] sm:max-w-none">{portalMeta.badge}</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 hidden sm:block truncate mt-0.5">
                {portalMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2 text-xs shrink-0">
            <button type="button" onClick={openTelegramModal} className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border px-3 py-1.5 font-semibold transition-all active:scale-[0.98] ${data?.actor?.telegramLinked
            ? "border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200"
            : "border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#16272B] text-teal-800 dark:text-teal-200 hover:border-teal-600"}`}>
              <IconBrandTelegram className="h-4 w-4"/>
              <span className="hidden xl:inline">{data?.actor?.telegramLinked ? t.tgConnectedBtn : t.tgConnectBtn}</span>
            </button>
            <LanguageSwitcher />
            <ThemeToggle />
            <span className="hidden lg:inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#EDF5F3] dark:bg-[#16272B] px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 border border-[#D7E4E1] dark:border-[#1E353A]">
              <IconLock className="h-4 w-4 text-teal-700 dark:text-teal-400"/>
              <InfoTooltip label={t.privateBadge} explanation={t.privateTooltip}/>
            </span>
            <button type="button" onClick={openAccountModal} title={t.acctTitle} className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#EDF5F3] dark:bg-[#16272B] px-3 py-1.5 font-semibold text-teal-800 dark:text-teal-200 border border-teal-300/70 dark:border-teal-700/70 hover:border-teal-600 active:scale-[0.98] transition-all">
              <IconUserCheck className="h-4 w-4 text-teal-700 dark:text-teal-300"/>
              {authUser.fullName}
            </button>
            <button type="button" onClick={logout} className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#16272B] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#EDF5F3] dark:hover:bg-[#1E353A] active:scale-[0.98] transition-all">
              <IconLogout className="h-4 w-4"/>
              {t.signOut}
            </button>
          </div>

          {/* Mobile actions */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <ThemeToggle />
            <button type="button" onClick={() => setMobileMenuOpen((v) => !v)} aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? "Close portal menu" : "Open portal menu"} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#16272B] text-slate-800 dark:text-slate-100 hover:bg-[#EDF5F3] dark:hover:bg-[#1E353A] active:scale-95 transition-all">
              {mobileMenuOpen ? <IconX className="h-5 w-5"/> : <IconMenu2 className="h-5 w-5"/>}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (<div className="md:hidden oc-slide-down border-t border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-4 py-4 space-y-3 text-sm shadow-lg">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button type="button" onClick={openAccountModal} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#EDF5F3] dark:bg-[#16272B] px-3.5 py-2 font-semibold text-teal-800 dark:text-teal-200 border border-[#D7E4E1] dark:border-[#1E353A]">
                <IconUserCheck className="h-4 w-4 text-teal-700 dark:text-teal-300"/>
                {authUser.fullName}
              </button>
              <span className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#EDF5F3] dark:bg-[#16272B] px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 border border-[#D7E4E1] dark:border-[#1E353A]">
                <IconLock className="h-4 w-4 text-teal-700 dark:text-teal-300"/>
                {t.privateBadge}
              </span>
            </div>
            <button type="button" onClick={openTelegramModal} className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#16272B] px-3.5 py-2.5 text-sm font-semibold text-teal-800 dark:text-teal-200 active:scale-[0.98] transition-all">
              <IconBrandTelegram className="h-4 w-4"/>
              {data?.actor?.telegramLinked ? t.tgConnectedBtn : t.tgConnectBtn}
            </button>
            <div className="flex items-center justify-between gap-2 py-1">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {t.languageLabel}
              </span>
              <LanguageSwitcher />
            </div>
            <button type="button" onClick={() => {
                setMobileMenuOpen(false);
                logout();
            }} className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#16272B] px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-[#EDF5F3] dark:hover:bg-[#1E353A] active:scale-[0.98] transition-all">
              <IconLogout className="h-4 w-4"/>
              {t.signOut}
            </button>
            {authUser.role === "ADMIN_RECEPTION" && (<div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#D7E4E1] dark:border-[#1E353A]">
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className={`min-h-[46px] inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold border transition-all ${pathname === "/admin"
                    ? "border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200"
                    : "border-[#D7E4E1] dark:border-[#1E353A] text-slate-800 dark:text-slate-100"}`}>
                  {t.adminOverviewNav}
                </Link>
                <Link href="/admin/verifications" onClick={() => setMobileMenuOpen(false)} className={`min-h-[46px] inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold border transition-all ${pathname.startsWith("/admin/verifications")
                    ? "border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200"
                    : "border-[#D7E4E1] dark:border-[#1E353A] text-slate-800 dark:text-slate-100"}`}>
                  {t.adminVerificationsNav}
                  {(data?.pendingVerificationsCount ?? 0) > 0 && (<span className="rounded-full bg-teal-700 px-2 py-0.5 text-xs font-bold text-white leading-none">
                      {data?.pendingVerificationsCount}
                    </span>)}
                </Link>
              </div>)}
          </div>)}

        {/* Admin Dashboard Sub-Navigation Bar */}
        {authUser.role === "ADMIN_RECEPTION" && (<nav aria-label="Admin dashboard navigation" className="hidden md:block border-t border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3]/80 dark:bg-[#16272B]">
            <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-2">
              <Link href="/admin" className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-all ${pathname === "/admin"
                ? "bg-teal-700 dark:bg-teal-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#101E21]"}`}>
                <IconShieldCheck className="h-4 w-4"/>
                {t.adminOverviewNav}
              </Link>
              <Link href="/admin/verifications" className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-all ${pathname.startsWith("/admin/verifications")
                ? "bg-teal-700 dark:bg-teal-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#101E21]"}`}>
                <IconUserCheck className="h-4 w-4"/>
                {t.adminVerificationsNav}
                {(data?.pendingVerificationsCount ?? 0) > 0 && (<span className={`rounded-full px-2 py-0.5 text-xs font-bold leading-none ${pathname.startsWith("/admin/verifications")
                    ? "bg-white text-teal-800"
                    : "bg-teal-700 text-white"}`}>
                    {data?.pendingVerificationsCount}
                  </span>)}
              </Link>
            </div>
          </nav>)}
      </header>

      {toast && (<div className="mx-auto mt-3 w-full max-w-7xl px-3.5 sm:px-6 oc-fade-up">
          <div className={`rounded-2xl border-l-4 px-4 py-3 text-sm font-semibold shadow-sm ${toast.type === "error"
                ? "border-rose-600 bg-rose-50 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200"
                : toast.type === "success"
                    ? "border-teal-700 bg-teal-50 text-teal-900 dark:border-teal-400 dark:bg-[#101E21] dark:text-teal-200"
                    : "border-amber-600 bg-white text-slate-900 dark:bg-[#16272B] dark:text-slate-100"}`}>
            {toast.text}
          </div>
        </div>)}

      <main className="mx-auto w-full max-w-7xl flex-1 px-3.5 sm:px-6 py-5 sm:py-7">
        {children}
      </main>

      {tgModalOpen && (<div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-xs px-4 oc-fade-in">
          <div className="w-full max-w-md med-card oc-modal-in p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 dark:bg-teal-600 text-white shadow-xs">
                  <IconBrandTelegram className="h-5 w-5"/>
                </div>
                <div>
                  <h2 className="font-heading text-base font-bold text-slate-900 dark:text-slate-100">
                    {t.tgModalTitle}
                  </h2>
                  <p className="text-xs font-medium text-teal-700 dark:text-teal-300">
                    {tgLinkData?.linked || data?.actor?.telegramLinked ? t.tgConnectedBtn : t.tgConnectBtn}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setTgModalOpen(false)} aria-label="Close" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] text-slate-500 hover:bg-[#EDF5F3] hover:text-slate-900 dark:text-slate-300">
                <IconX className="h-4 w-4"/>
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.tgModalDesc}
            </p>

            {tgBusy && !tgLinkData ? (<p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{t.tgLoading}</p>) : (<div className="space-y-2.5">
                <Link href={tgLinkData?.webBotLinkUrl || "/telegram"} onClick={() => setTgModalOpen(false)} className="w-full inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white active:scale-[0.98] transition-all">
                  <IconBrandTelegram className="h-4 w-4"/>
                  <span>{t.tgOpenWebBot}</span>
                </Link>
                {tgLinkData?.telegramDeepLink && (<a href={tgLinkData.telegramDeepLink} target="_blank" rel="noreferrer" className="w-full inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#16272B] px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-teal-600 active:scale-[0.98] transition-all">
                    <span>{t.tgOpenApp}</span>
                    <IconExternalLink className="h-4 w-4 text-teal-700 dark:text-teal-300"/>
                  </a>)}
                {tgLinkData?.linkToken && (<div className="flex items-center justify-between gap-2 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#16272B] px-3.5 py-2.5">
                    <code className="text-xs font-mono text-slate-900 dark:text-slate-100 truncate">
                      {`/link ${tgLinkData.linkToken}`}
                    </code>
                    <button type="button" onClick={async () => {
                        try {
                            await navigator.clipboard.writeText(`/link ${tgLinkData.linkToken}`);
                            setCopiedTg(true);
                            setTimeout(() => setCopiedTg(false), 2000);
                        }
                        catch {
                            // ignore
                        }
                    }} className="inline-flex min-h-[36px] shrink-0 items-center gap-1 rounded-lg border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3 py-1 text-xs font-semibold text-teal-800 dark:text-teal-200">
                      {copiedTg ? <IconCheck className="h-4 w-4"/> : <IconCopy className="h-4 w-4"/>}
                      <span>{copiedTg ? t.tgCopied : t.tgCopyCmd}</span>
                    </button>
                  </div>)}
                {(tgLinkData?.linked || data?.actor?.telegramLinked) && (<button type="button" disabled={tgBusy} onClick={handleUnlinkTg} className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline underline-offset-4">
                    <IconLinkOff className="h-4 w-4"/>
                    <span>{t.tgUnlink}</span>
                  </button>)}
              </div>)}
          </div>
        </div>)}

      {acctModalOpen && (<div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-xs px-4 oc-fade-in">
          <div className="w-full max-w-md med-card oc-modal-in p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDF5F3] dark:bg-[#16272B] text-teal-700 dark:text-teal-300 border border-[#D7E4E1] dark:border-[#1E353A]">
                  <IconUserCheck className="h-5 w-5"/>
                </div>
                <div>
                  <h2 className="font-heading text-base font-bold text-slate-900 dark:text-slate-100">
                    {t.acctTitle}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {authUser.fullName}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setAcctModalOpen(false)} aria-label="Close" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] text-slate-500 hover:bg-[#EDF5F3] hover:text-slate-900 dark:text-slate-300">
                <IconX className="h-4 w-4"/>
              </button>
            </div>

            <div className="rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#16272B] p-4 text-sm space-y-1.5">
              <p className="text-slate-600 dark:text-slate-300">
                {t.acctEmail} <strong className="font-mono text-slate-900 dark:text-slate-100">{authUser.email}</strong>
              </p>
              {authUser.district && (<p className="text-slate-600 dark:text-slate-300">
                  {t.acctDistrict} <strong className="text-slate-900 dark:text-slate-100">{authUser.district}</strong>
                </p>)}
              <button type="button" onClick={() => {
                setAcctModalOpen(false);
                openTelegramModal();
            }} className="mt-2 inline-flex min-h-[38px] items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline underline-offset-4">
                <IconBrandTelegram className="h-4 w-4"/>
                {data?.actor?.telegramLinked ? t.tgConnectedBtn : t.tgConnectBtn}
              </button>
            </div>

            <div className="rounded-xl border border-rose-200 dark:border-rose-900/70 bg-rose-50/70 dark:bg-rose-950/35 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-rose-800 dark:text-rose-200">
                <IconTrash className="h-4 w-4 shrink-0"/>
                <span>{t.acctDeleteTitle}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.acctDeleteDesc}
              </p>
              <div className="space-y-1.5">
                <label htmlFor="delete-acct-confirm" className="block text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {t.acctDeleteInputLabel}
                </label>
                <input id="delete-acct-confirm" type="text" value={deleteConfirmInput} onChange={(e) => setDeleteConfirmInput(e.target.value)} placeholder="DELETE" className="min-h-[46px] w-full rounded-xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-rose-600 focus:outline-none"/>
              </div>
              {deleteAcctErr && (<p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                  {deleteAcctErr}
                </p>)}
              <button type="button" disabled={deletingAcct || deleteConfirmInput.trim().toUpperCase() !== "DELETE"} onClick={handleSelfDeleteAccount} className="w-full inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-45 active:scale-[0.98] transition-all">
                <IconTrash className="h-4 w-4"/>
                <span>{deletingAcct ? t.acctDeleting : t.acctDeleteBtn}</span>
              </button>
            </div>
          </div>
        </div>)}
    </div>);
}
