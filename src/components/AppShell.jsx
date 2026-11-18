"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { usePathname, useRouter } from "next/navigation";
import {
  IconBrandTelegram,
  IconBuildingHospital,
  IconCalendarEvent,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconHeartHandshake,
  IconLayoutDashboard,
  IconLinkOff,
  IconLock,
  IconLogout,
  IconMenu2,
  IconMessageCircle,
  IconPill,
  IconReportAnalytics,
  IconSettings,
  IconShieldCheck,
  IconStethoscope,
  IconTrash,
  IconUserCheck,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { InfoTooltip } from "@/components/InfoTooltip";

const StaffNavContext = createContext({
  activeView: "dashboard",
  setActiveView: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
});

export function useStaffNav() {
  return useContext(StaffNavContext);
}
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
        brandTag: "Perinatal va klinik nazorat",
        navDashboard: "Dashboard",
        navPatients: "Bemorlar",
        navPatientsBeds: "Bemorlar va koykalar",
        navVisits: "24s tashriflar",
        navAppointmentsVisits: "Tashriflar va navbat",
        navDoctorsPharmacy: "Shifokorlar va dorixona",
        navMedications: "Dorilar (E-retsept)",
        navComplaintsChat: "Shikoyatlar va chat",
        navReports: "Hisobot va audit",
        navSettings: "Sozlamalar",
        navMothersQueue: "Onalar navbati",
        navSessions: "Seanslar",
        navDirectChat: "Shaxsiy chat",
        navAvailability: "Jadval va maxfiylik",
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
        brandTag: "Клинический патронаж",
        navDashboard: "Дашборд",
        navPatients: "Пациенты",
        navPatientsBeds: "Пациенты и койки",
        navVisits: "Визиты 24ч",
        navAppointmentsVisits: "Визиты и очередь",
        navDoctorsPharmacy: "Врачи и аптека",
        navMedications: "Лекарства (E-Rx)",
        navComplaintsChat: "Жалобы и чат",
        navReports: "Отчеты и аудит",
        navSettings: "Настройки",
        navMothersQueue: "Очередь мам",
        navSessions: "Сеансы",
        navDirectChat: "Личный чат",
        navAvailability: "График и защита",
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
        brandTag: "Perinatal & Clinical Care",
        navDashboard: "Dashboard",
        navPatients: "Patients",
        navPatientsBeds: "Patients & Beds",
        navVisits: "24h Visits",
        navAppointmentsVisits: "Visits & Queue",
        navDoctorsPharmacy: "Doctors & Pharmacy",
        navMedications: "Medications (E-Rx)",
        navComplaintsChat: "Complaints & Chat",
        navReports: "Reports & Audit",
        navSettings: "Settings",
        navMothersQueue: "Mothers Queue",
        navSessions: "Sessions",
        navDirectChat: "Direct Chat",
        navAvailability: "Schedule & Privacy",
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
    const [navState, setNavState] = useState({ path: "", view: "dashboard" });
    const [searchQuery, setSearchQuery] = useState("");
    const { authUser, authChecked, data, toast, logout, deleteMyAccount, refreshData } = usePlatform();
    const isProtected = isProtectedPortalPath(pathname);
    const isStaffPortal = pathname.startsWith("/admin") ||
        pathname.startsWith("/clinical") ||
        pathname.startsWith("/psychologist");
    const t = SHELL_COPY[lang];

    const activeView = navState.path === pathname ? navState.view : "dashboard";
    const setActiveView = useCallback((view, targetPath) => {
        const dest = targetPath || pathname;
        setNavState({ path: dest, view });
    }, [pathname]);

    useEffect(() => {
        if (typeof window === "undefined")
            return;
        const raf = window.requestAnimationFrame(() => {
            const params = new URLSearchParams(window.location.search);
            const qView = params.get("view");
            if (qView) {
                setNavState({ path: pathname, view: qView });
            }
        });
        return () => window.cancelAnimationFrame(raf);
    }, [pathname]);

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
        return (<div className="min-h-screen flex items-center justify-center bg-[#F6F9FC] dark:bg-[#091315] px-4">
        <div className="max-w-sm w-full med-card oc-modal-in p-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF4FF] dark:bg-[#16272B] text-[#1D6CE0] dark:text-sky-300 border border-[#E3ECF3] dark:border-[#1E353A]">
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
              <Link href={!authUser ? "/login" : getPortalForRole(authUser.role)} className="inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center rounded-xl bg-[#1D6CE0] hover:bg-[#1758BA] px-5 py-2.5 text-sm font-semibold text-white active:scale-[0.98] transition-all">
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
                icon: <IconBuildingHospital className="h-4 w-4 text-[#1D6CE0] dark:text-sky-300"/>,
            }
            : authUser.role === "FAMILY_MD"
                ? {
                    badge: t.familyBadge,
                    subtitle: t.familySub,
                    icon: <IconStethoscope className="h-4 w-4 text-[#1D6CE0] dark:text-sky-300"/>,
                }
                : authUser.role === "PSYCHOLOGIST"
                    ? {
                        badge: t.psychBadge,
                        subtitle: t.psychSub,
                        icon: <IconHeartHandshake className="h-4 w-4 text-[#1D6CE0] dark:text-sky-300"/>,
                    }
                    : {
                        badge: t.adminBadge,
                        subtitle: t.adminSub,
                        icon: <IconShieldCheck className="h-4 w-4 text-[#1D6CE0] dark:text-sky-300"/>,
                    };

    const pendingVerifCount = data?.pendingVerificationsCount ?? 0;
    const sidebarItems = authUser.role === "ADMIN_RECEPTION"
        ? [
            { key: "dashboard", label: t.navDashboard, icon: IconLayoutDashboard, href: "/admin" },
            { key: "patients", label: t.navPatientsBeds, icon: IconUsers, href: "/admin" },
            { key: "visits", label: t.navVisits, icon: IconCalendarEvent, href: "/admin" },
            { key: "doctors", label: t.navDoctorsPharmacy, icon: IconStethoscope, href: "/admin" },
            {
                key: "verifications",
                label: t.adminVerificationsNav,
                icon: IconUserCheck,
                href: "/admin/verifications",
                isRoute: true,
                badge: pendingVerifCount,
            },
            { key: "reports", label: t.navReports, icon: IconReportAnalytics, href: "/admin" },
            { key: "settings", label: t.navSettings, icon: IconSettings, href: "/admin" },
        ]
        : authUser.role === "PSYCHOLOGIST"
            ? [
                { key: "dashboard", label: t.navDashboard, icon: IconLayoutDashboard },
                { key: "mothers", label: t.navMothersQueue, icon: IconUsers },
                { key: "sessions", label: t.navSessions, icon: IconCalendarEvent },
                { key: "chat", label: t.navDirectChat, icon: IconMessageCircle },
                { key: "settings", label: t.navAvailability, icon: IconSettings },
            ]
            : [
                { key: "dashboard", label: t.navDashboard, icon: IconLayoutDashboard },
                { key: "patients", label: t.navPatients, icon: IconUsers },
                { key: "visits", label: t.navAppointmentsVisits, icon: IconCalendarEvent },
                { key: "medications", label: t.navMedications, icon: IconPill },
                { key: "complaints", label: t.navComplaintsChat, icon: IconMessageCircle },
                { key: "settings", label: t.navSettings, icon: IconSettings },
            ];

    const renderSidebarInner = (onCloseMobile) => (<div className="flex h-full flex-col justify-between py-5">
        <div className="space-y-6">
          {/* Brand Block matching DocPlace SaaS aesthetic */}
          <div className="flex items-center justify-between px-5">
            <Link href="/" className="flex items-center gap-3 group min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2585F5] to-[#1D6CE0] text-white shadow-sm group-hover:scale-[1.03] transition-transform">
                <IconStethoscope className="h-5 w-5"/>
              </div>
              <div className="min-w-0">
                <p className="font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none truncate">
                  OnaCare
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {portalMeta.badge}
                </p>
              </div>
            </Link>
            {onCloseMobile && (<button type="button" onClick={onCloseMobile} aria-label="Close sidebar" className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-[#16272B]">
                <IconX className="h-5 w-5"/>
              </button>)}
          </div>

          {/* Nav Menu */}
          <nav aria-label="Portal sidebar navigation" className="space-y-1">
            {sidebarItems.map((item) => {
            const IconComp = item.icon;
            const isVerifRoute = item.isRoute && pathname.startsWith("/admin/verifications");
            const isActive = item.isRoute
                ? isVerifRoute
                : !pathname.startsWith("/admin/verifications") && activeView === item.key;

            const itemContent = (<>
                <span className="flex items-center gap-3 min-w-0">
                  <IconComp className={`h-[19px] w-[19px] shrink-0 transition-colors ${isActive
                        ? "text-[#1D6CE0] dark:text-sky-300"
                        : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"}`} stroke={1.85}/>
                  <span className="truncate">{item.label}</span>
                </span>
                {typeof item.badge === "number" && item.badge > 0 && (<span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${isActive
                        ? "bg-[#1D6CE0] text-white"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"}`}>
                    {item.badge}
                  </span>)}
                {isActive && (<span aria-hidden="true" className="absolute right-0 top-1.5 bottom-1.5 w-[3.5px] rounded-l-full bg-[#1D6CE0] dark:bg-sky-400"/>)}
              </>);

            const itemClasses = `group relative flex w-full items-center justify-between px-5 py-2.5 min-h-[44px] text-sm transition-colors ${isActive
                ? "bg-[#EBF4FF] dark:bg-sky-950/60 text-[#1D6CE0] dark:text-sky-300 font-semibold"
                : "text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-[#132529] hover:text-slate-900 dark:hover:text-white"}`;

            if (item.isRoute && item.href) {
                return (<Link key={item.key} href={item.href} onClick={() => {
                        setNavState({ path: item.href, view: item.key });
                        if (onCloseMobile)
                            onCloseMobile();
                    }} className={itemClasses}>
                    {itemContent}
                  </Link>);
            }

            return (<button key={item.key} type="button" onClick={() => {
                    if (item.href && pathname !== item.href) {
                        setNavState({ path: item.href, view: item.key });
                        router.push(`${item.href}?view=${encodeURIComponent(item.key)}`);
                    }
                    else {
                        setActiveView(item.key);
                    }
                    if (onCloseMobile)
                        onCloseMobile();
                }} className={itemClasses}>
                {itemContent}
              </button>);
        })}
          </nav>
        </div>

        {/* Bottom Pinned Controls & Sign Out */}
        <div className="space-y-3 px-4 pt-4 border-t border-[#E3ECF3] dark:border-[#1E353A]">
          <div className="flex items-center justify-between gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          <button type="button" onClick={openTelegramModal} className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 min-h-[40px] text-xs font-semibold transition-colors ${data?.actor?.telegramLinked
            ? "border-[#CFE3FB] dark:border-sky-800 bg-[#EBF4FF] dark:bg-sky-950/50 text-[#1D6CE0] dark:text-sky-300"
            : "border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#132529] text-slate-700 dark:text-slate-200 hover:border-[#2585F5]"}`}>
            <span className="flex items-center gap-2 truncate">
              <IconBrandTelegram className="h-4 w-4 shrink-0"/>
              <span className="truncate">{data?.actor?.telegramLinked ? t.tgConnectedBtn : t.tgConnectBtn}</span>
            </span>
          </button>

          <button type="button" onClick={openAccountModal} className="w-full flex items-center gap-2.5 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#132529] px-3 py-2 min-h-[44px] text-left hover:border-[#2585F5] transition-colors">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EBF4FF] dark:bg-sky-950 text-[#1D6CE0] dark:text-sky-300">
              <IconUserCheck className="h-4 w-4"/>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">
                {authUser.fullName}
              </span>
              <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                {authUser.district || t.privateBadge}
              </span>
            </span>
          </button>

          <button type="button" onClick={() => {
            if (onCloseMobile)
                onCloseMobile();
            logout();
        }} className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition-colors">
            <IconLogout className="h-[18px] w-[18px] shrink-0"/>
            <span>{t.signOut}</span>
          </button>
        </div>
      </div>);

    const modalsContent = (<>
      {tgModalOpen && (<div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-xs px-4 oc-fade-in">
          <div className="w-full max-w-md med-card oc-modal-in p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D6CE0] text-white shadow-xs">
                  <IconBrandTelegram className="h-5 w-5"/>
                </div>
                <div>
                  <h2 className="font-heading text-base font-bold text-slate-900 dark:text-slate-100">
                    {t.tgModalTitle}
                  </h2>
                  <p className="text-xs font-medium text-[#1D6CE0] dark:text-sky-300">
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
    </>);

    if (isStaffPortal) {
        return (<StaffNavContext.Provider value={{ activeView, setActiveView, searchQuery, setSearchQuery }}>
        <div className="min-h-screen flex flex-col bg-[#F6F9FC] dark:bg-[#091315] transition-colors duration-200">
          <Script src="https://telegram.org/js/telegram-web-app.js" strategy="lazyOnload" onLoad={() => {
                try {
                    window.Telegram?.WebApp?.ready();
                    window.Telegram?.WebApp?.expand();
                }
                catch {
                    // ignore
                }
            }}/>

          {/* Desktop Fixed White Sidebar (DocPlace SaaS style) */}
          <aside className="hidden lg:flex lg:w-[252px] lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 bg-white dark:bg-[#0D1A1D] border-r border-[#E3ECF3] dark:border-[#1E353A] z-30">
            {renderSidebarInner(null)}
          </aside>

          {/* Mobile Sticky Top Bar */}
          <header className="lg:hidden sticky top-0 z-30 border-b border-[#E3ECF3] dark:border-[#1E353A] bg-white/95 dark:bg-[#0D1A1D]/95 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <Link href="/" className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2585F5] to-[#1D6CE0] text-white shadow-xs">
                  <IconStethoscope className="h-4.5 w-4.5"/>
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-base font-bold text-slate-900 dark:text-white leading-none truncate">
                    OnaCare
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {portalMeta.badge}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation menu" className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] text-slate-800 dark:text-slate-100 active:scale-95 transition-all">
                  <IconMenu2 className="h-5 w-5"/>
                </button>
              </div>
            </div>
          </header>

          {/* Mobile Slide-Out Drawer */}
          {mobileMenuOpen && (<div className="lg:hidden fixed inset-0 z-50 flex">
              <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs oc-fade-in"/>
              <aside className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-[#0D1A1D] border-r border-[#E3ECF3] dark:border-[#1E353A] shadow-2xl overflow-y-auto">
                {renderSidebarInner(() => setMobileMenuOpen(false))}
              </aside>
            </div>)}

          <div className="lg:pl-[252px] flex-1 flex flex-col min-w-0">
            {toast && (<div className="mx-auto mt-4 w-full max-w-7xl px-4 sm:px-7 oc-fade-up">
                <div className={`rounded-2xl border-l-4 px-4 py-3 text-sm font-semibold shadow-sm ${toast.type === "error"
                    ? "border-rose-600 bg-rose-50 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200"
                    : toast.type === "success"
                        ? "border-[#1D6CE0] bg-[#EBF4FF] text-[#1D6CE0] dark:border-sky-400 dark:bg-sky-950/70 dark:text-sky-200"
                        : "border-amber-600 bg-white text-slate-900 dark:bg-[#16272B] dark:text-slate-100"}`}>
                  {toast.text}
                </div>
              </div>)}

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-7 py-5 sm:py-7">
              {children}
            </main>
          </div>

          {modalsContent}
        </div>
      </StaffNavContext.Provider>);
    }

    return (<StaffNavContext.Provider value={{ activeView, setActiveView, searchQuery, setSearchQuery }}>
      <div className="min-h-screen flex flex-col bg-[#F4F8F7] dark:bg-[#091315] transition-colors duration-200">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="lazyOnload" onLoad={() => {
            try {
                window.Telegram?.WebApp?.ready();
                window.Telegram?.WebApp?.expand();
            }
            catch {
                // ignore
            }
        }}/>
      {/* Strictly Role-Isolated Portal Header (Patient Portal) */}
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
          </div>)}
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

      {modalsContent}
    </div>
    </StaffNavContext.Provider>);
}
