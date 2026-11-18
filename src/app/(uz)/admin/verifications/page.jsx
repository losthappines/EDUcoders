"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IconAlertTriangle, IconArrowLeft, IconBrandTelegram, IconBuildingHospital, IconCheck, IconCircleCheck, IconClock, IconCrown, IconHeartHandshake, IconMail, IconMapPin, IconPhone, IconStethoscope, IconTrash, IconUser, IconUserCheck, IconUsers, IconX, } from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
import { StaffKpiCard, StaffWelcomeHeader } from "@/components/StaffAnalyticsWidgets";
const COPY = {
    uz: {
        backDash: "Umumiy boshqaruvga qaytish",
        title: "Bemor, shifokor va psixolog hisoblarini tasdiqlash",
        subtitle: "Yangi ro'yxatdan o'tgan bemorlar, shifokorlar va perinatal psixologlarni ko'rib chiqing. Tasdiqlangandan so'ng ular o'z kabinetiga kira oladi.",
        pendingCard: "Tasdiqlash kutilmoqda",
        verifiedCard: "Tasdiqlangan",
        rejectedCard: "Rad etilgan",
        totalCard: "Jami arizalar",
        tabPending: "Kutilmoqda",
        tabVerified: "Tasdiqlangan",
        tabRejected: "Rad etilgan",
        tabAll: "Barchasi",
        roleAll: "Barcha rollar",
        rolePatients: "Bemorlar",
        roleDoctors: "Shifokorlar",
        rolePsychologists: "Psixologlar",
        searchPlaceholder: "Ism, email, telefon yoki tuman bo'yicha qidirish...",
        loading: "Arizalar ro'yxati yuklanmoqda...",
        empty: "Tanlangan filtrlar bo'yicha hisoblar topilmadi.",
        statusPending: "Kutilmoqda",
        statusVerified: "Tasdiqlangan",
        statusRejected: "Rad etilgan",
        rolePatient: "Bemor / Ona",
        roleOvabmu: "Tug'ruqxona shifokori",
        roleFamily: "Oilaviy shifokor",
        rolePsych: "Perinatal psixolog",
        approveBtn: "Tasdiqlash va faollashtirish",
        rejectBtn: "Rad etish",
        reapproveBtn: "Qayta tasdiqlash",
        deleteBtn: "Butunlay o'chirish",
        deleteConfirmPrompt: "Ushbu hisob va uning barcha yozuvlari (tibbiy ma'lumotlar, shikoyatlar, tashriflar) bazadan butunlay o'chiriladi. Tasdiqlaysizmi?",
        confirmDeleteBtn: "Ha, butunlay o'chirish",
        deletedToast: "Hisob va barcha yozuvlari bazadan butunlay o'chirildi.",
        notePlaceholder: "Rad etish sababi (ixtiyoriy)...",
        confirmRejectBtn: "Rad etishni tasdiqlash",
        cancelBtn: "Bekor qilish",
        approvedToast: "Hisob muvaffaqiyatli tasdiqlandi va faollashtirildi.",
        rejectedToast: "Hisob arizasi rad etildi.",
        errorToast: "Hisob holatini yangilab bo'lmadi.",
        registeredLabel: "Ro'yxatdan o'tgan:",
        dobLabel: "Tug'ilgan sana:",
        bloodLabel: "Qon guruhi:",
        mahallaLabel: "Mahalla:",
        notePrefix: "Izoh:",
        expWord: "yil tajriba",
        telegramLinkedLabel: "Telegram ulangan",
    },
    ru: {
        backDash: "Назад к обзору клиники",
        title: "Проверка аккаунтов пациентов, врачей и психологов",
        subtitle: "Рассмотрите новые заявки пациентов, врачей и перинатальных психологов. После подтверждения они смогут войти в свой кабинет.",
        pendingCard: "Ожидают проверки",
        verifiedCard: "Подтверждены",
        rejectedCard: "Отклонены",
        totalCard: "Всего заявок",
        tabPending: "Ожидают",
        tabVerified: "Подтвержденные",
        tabRejected: "Отклоненные",
        tabAll: "Все",
        roleAll: "Все роли",
        rolePatients: "Пациенты",
        roleDoctors: "Врачи",
        rolePsychologists: "Психологи",
        searchPlaceholder: "Поиск по имени, email, телефону или району...",
        loading: "Загрузка списка заявок...",
        empty: "По выбранным фильтрам аккаунты не найдены.",
        statusPending: "Ожидает",
        statusVerified: "Подтвержден",
        statusRejected: "Отклонен",
        rolePatient: "Мама / Пациент",
        roleOvabmu: "Врач роддома",
        roleFamily: "Семейный врач",
        rolePsych: "Перинатальный психолог",
        approveBtn: "Подтвердить и активировать",
        rejectBtn: "Отклонить",
        reapproveBtn: "Подтвердить повторно",
        deleteBtn: "Удалить навсегда",
        deleteConfirmPrompt: "Аккаунт и все связанные записи (медданные, жалобы, визиты) будут безвозвратно удалены. Продолжить?",
        confirmDeleteBtn: "Да, удалить навсегда",
        deletedToast: "Аккаунт и все его записи безвозвратно удалены.",
        notePlaceholder: "Причина отклонения (необязательно)...",
        confirmRejectBtn: "Подтвердить отказ",
        cancelBtn: "Отмена",
        approvedToast: "Аккаунт подтвержден и активирован.",
        rejectedToast: "Заявка отклонена.",
        errorToast: "Не удалось обновить статус аккаунта.",
        registeredLabel: "Регистрация:",
        dobLabel: "Дата рождения:",
        bloodLabel: "Группа крови:",
        mahallaLabel: "Махалля:",
        notePrefix: "Комментарий:",
        expWord: "лет стажа",
        telegramLinkedLabel: "Telegram подключен",
    },
    en: {
        backDash: "Back to Clinic Overview",
        title: "Patient, Doctor & Psychologist Account Verifications",
        subtitle: "Review new patient, physician, and perinatal psychologist registrations. Accounts remain locked until verified.",
        pendingCard: "Pending Review",
        verifiedCard: "Verified Accounts",
        rejectedCard: "Declined",
        totalCard: "Total Accounts",
        tabPending: "Pending",
        tabVerified: "Verified",
        tabRejected: "Declined",
        tabAll: "All",
        roleAll: "All Roles",
        rolePatients: "Patients",
        roleDoctors: "Doctors",
        rolePsychologists: "Psychologists",
        searchPlaceholder: "Search by name, email, phone, or district...",
        loading: "Loading account verification queue...",
        empty: "No accounts match your current filters.",
        statusPending: "Pending Review",
        statusVerified: "Verified",
        statusRejected: "Declined",
        rolePatient: "Mother / Patient",
        roleOvabmu: "Hospital Doctor",
        roleFamily: "Local Family Doctor",
        rolePsych: "Perinatal Psychologist",
        approveBtn: "Verify & Activate",
        rejectBtn: "Decline",
        reapproveBtn: "Verify Account",
        deleteBtn: "Delete Permanently",
        deleteConfirmPrompt: "This will permanently erase this account and all associated records (medical records, complaints, visits, messages). Continue?",
        confirmDeleteBtn: "Yes, Delete Permanently",
        deletedToast: "Account and all its records permanently deleted.",
        notePlaceholder: "Reason for declining (optional)...",
        confirmRejectBtn: "Confirm Decline",
        cancelBtn: "Cancel",
        approvedToast: "Account verified and activated.",
        rejectedToast: "Account registration declined.",
        errorToast: "Could not update verification status.",
        registeredLabel: "Registered:",
        dobLabel: "DOB:",
        bloodLabel: "Blood Type:",
        mahallaLabel: "Mahalla:",
        notePrefix: "Note:",
        expWord: "yrs exp",
        telegramLinkedLabel: "Telegram Linked",
    },
};
export default function AdminVerificationsPage() {
    const { fetchWithAuth, refreshData, showToast } = usePlatform();
    const { lang } = useLanguage();
    const t = COPY[lang];
    const [accounts, setAccounts] = useState([]);
    const [counts, setCounts] = useState({
        total: 0,
        pending: 0,
        verified: 0,
        rejected: 0,
    });
    const [loadingList, setLoadingList] = useState(true);
    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [query, setQuery] = useState("");
    const [busyId, setBusyId] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectNote, setRejectNote] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const loadQueue = useCallback(async () => {
        try {
            const res = await fetchWithAuth("/api/admin/verifications");
            if (res.ok) {
                const json = (await res.json());
                setAccounts(json.accounts);
                setCounts(json.counts);
            }
        }
        finally {
            setLoadingList(false);
        }
    }, [fetchWithAuth]);
    useEffect(() => {
        let active = true;
        fetchWithAuth("/api/admin/verifications")
            .then((res) => (res.ok ? res.json() : null))
            .then((json) => {
            if (!active || !json)
                return;
            setAccounts(json.accounts);
            setCounts(json.counts);
        })
            .finally(() => {
            if (active)
                setLoadingList(false);
        });
        return () => {
            active = false;
        };
    }, [fetchWithAuth]);
    const handleDecision = async (userId, decision, note) => {
        setBusyId(userId);
        try {
            const res = await fetchWithAuth("/api/admin/verifications", {
                method: "POST",
                body: JSON.stringify({ userId, decision, note }),
            });
            if (res.ok) {
                showToast("success", decision === "APPROVE" ? t.approvedToast : t.rejectedToast);
                setRejectingId(null);
                setRejectNote("");
                await Promise.all([loadQueue(), refreshData()]);
            }
            else {
                const err = (await res.json().catch(() => ({})));
                showToast("error", err.error || t.errorToast);
            }
        }
        finally {
            setBusyId(null);
        }
    };
    const handleDeleteAccount = async (userId) => {
        setBusyId(userId);
        try {
            const res = await fetchWithAuth("/api/admin/verifications", {
                method: "DELETE",
                body: JSON.stringify({ userId }),
            });
            if (res.ok) {
                showToast("success", t.deletedToast);
                setDeletingId(null);
                await Promise.all([loadQueue(), refreshData()]);
            }
            else {
                const err = (await res.json().catch(() => ({})));
                showToast("error", err.error || t.errorToast);
            }
        }
        finally {
            setBusyId(null);
        }
    };
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return accounts.filter((a) => {
            if (statusFilter !== "ALL" && a.verificationStatus !== statusFilter) {
                return false;
            }
            if (roleFilter === "PATIENT" && a.role !== "PATIENT") {
                return false;
            }
            if (roleFilter === "DOCTOR" && a.role !== "OVABMU_MD" && a.role !== "FAMILY_MD") {
                return false;
            }
            if (roleFilter === "PSYCHOLOGIST" && a.role !== "PSYCHOLOGIST") {
                return false;
            }
            if (!q)
                return true;
            return (a.fullName.toLowerCase().includes(q) ||
                a.email.toLowerCase().includes(q) ||
                (a.phone || "").toLowerCase().includes(q) ||
                (a.district || "").toLowerCase().includes(q) ||
                (a.specialty || "").toLowerCase().includes(q) ||
                (a.expertiseArea || "").toLowerCase().includes(q) ||
                (a.polyclinicName || "").toLowerCase().includes(q));
        });
    }, [accounts, statusFilter, roleFilter, query]);
    const getRoleMeta = (role) => {
        if (role === "PATIENT") {
            return {
                label: t.rolePatient,
                icon: <IconUser className="h-4 w-4 text-teal-700 dark:text-teal-400"/>,
                pill: "bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800",
            };
        }
        if (role === "OVABMU_MD") {
            return {
                label: t.roleOvabmu,
                icon: <IconBuildingHospital className="h-4 w-4 text-indigo-700 dark:text-indigo-400"/>,
                pill: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
            };
        }
        if (role === "PSYCHOLOGIST") {
            return {
                label: t.rolePsych,
                icon: <IconHeartHandshake className="h-4 w-4 text-teal-700 dark:text-teal-300"/>,
                pill: "bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800",
            };
        }
        return {
            label: t.roleFamily,
            icon: <IconStethoscope className="h-4 w-4 text-emerald-700 dark:text-emerald-400"/>,
            pill: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
    };
    return (<div className="space-y-6 oc-fade-up">
      <StaffWelcomeHeader greeting={t.title} dateLabel={t.subtitle} searchValue={query} onSearchChange={setQuery} searchPlaceholder={t.searchPlaceholder} rightSlot={<Link href="/admin" className="inline-flex h-11 items-center gap-1.5 rounded-full border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-4 text-xs sm:text-sm font-semibold text-[#1D6CE0] dark:text-sky-300 hover:border-[#2585F5] transition-colors shrink-0">
            <IconArrowLeft className="h-4 w-4"/>
            <span>{t.backDash}</span>
          </Link>}/>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaffKpiCard tone="amber" icon={<IconClock className="h-5 w-5"/>} label={t.pendingCard} value={counts.pending} onClick={() => setStatusFilter("PENDING")}/>
        <StaffKpiCard tone="green" icon={<IconCircleCheck className="h-5 w-5"/>} label={t.verifiedCard} value={counts.verified} onClick={() => setStatusFilter("VERIFIED")}/>
        <StaffKpiCard tone="red" icon={<IconAlertTriangle className="h-5 w-5"/>} label={t.rejectedCard} value={counts.rejected} onClick={() => setStatusFilter("REJECTED")}/>
        <StaffKpiCard tone="blue" icon={<IconUsers className="h-5 w-5"/>} label={t.totalCard} value={counts.total} onClick={() => setStatusFilter("ALL")}/>
      </div>

      {/* Filters & Search */}
      <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
            { key: "PENDING", label: `${t.tabPending} (${counts.pending})` },
            { key: "VERIFIED", label: `${t.tabVerified} (${counts.verified})` },
            { key: "REJECTED", label: `${t.tabRejected} (${counts.rejected})` },
            { key: "ALL", label: `${t.tabAll} (${counts.total})` },
        ].map((tab) => (<button key={tab.key} type="button" onClick={() => setStatusFilter(tab.key)} className={`min-h-[40px] rounded-full px-4 py-1.5 text-sm font-semibold border transition-colors ${statusFilter === tab.key
                ? "bg-[#1D6CE0] text-white border-[#1D6CE0] shadow-xs"
                : "bg-[#F6F9FC] dark:bg-[#091315] text-slate-700 dark:text-slate-200 border-[#E3ECF3] dark:border-[#1E353A] hover:border-[#2585F5]"}`}>
                {tab.label}
              </button>))}
          </div>

          <div className="inline-flex flex-wrap rounded-full border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-1 gap-1">
            {[
            { key: "ALL", label: t.roleAll },
            { key: "PATIENT", label: t.rolePatients },
            { key: "DOCTOR", label: t.roleDoctors },
            { key: "PSYCHOLOGIST", label: t.rolePsychologists },
        ].map((rf) => (<button key={rf.key} type="button" onClick={() => setRoleFilter(rf.key)} className={`min-h-[34px] rounded-full px-3 py-1 text-xs font-semibold transition-colors ${roleFilter === rf.key
                ? "bg-white dark:bg-[#101E21] text-[#1D6CE0] dark:text-sky-300 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}>
                {rf.label}
              </button>))}
          </div>
        </div>

        {/* Account Cards */}
        {loadingList ? (<div className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-8 text-center text-sm text-slate-600 dark:text-slate-300">
            {t.loading}
          </div>) : filtered.length === 0 ? (<div className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-8 text-center text-sm text-slate-600 dark:text-slate-300">
            {t.empty}
          </div>) : (<div className="space-y-3.5">
            {filtered.map((acc) => {
                const roleMeta = getRoleMeta(acc.role);
                const isBusy = busyId === acc.id;
                const isRejecting = rejectingId === acc.id;
                const latVal = acc.latitude ?? acc.patientProfile?.latitude ?? null;
                const lngVal = acc.longitude ?? acc.patientProfile?.longitude ?? null;
                return (<div key={acc.id} className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC]/75 dark:bg-[#091315]/70 p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#101E21] border border-[#E3ECF3] dark:border-[#1E353A]">
                        {roleMeta.icon}
                      </div>
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {acc.fullName}
                          </h3>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleMeta.pill}`}>
                            {roleMeta.label}
                          </span>
                          {acc.role !== "PATIENT" && acc.specialty && (<span className="inline-flex items-center rounded-full border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                              {acc.specialty}
                            </span>)}
                          {acc.role !== "PATIENT" && acc.expertiseArea && (<span className="inline-flex items-center rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                              {acc.expertiseArea}
                            </span>)}
                          {acc.role !== "PATIENT" && typeof acc.experienceYears === "number" && (<span className="inline-flex items-center rounded-full border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {acc.experienceYears} {t.expWord}
                            </span>)}
                          {acc.telegramLinked && (<span className="inline-flex items-center gap-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:text-sky-300">
                              <IconBrandTelegram className="h-3.5 w-3.5"/>
                              {t.telegramLinkedLabel}
                            </span>)}
                          {acc.role === "PATIENT" && acc.subscriptionTier && acc.subscriptionTier !== "FREE" && (<span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                              <IconCrown className="h-3.5 w-3.5"/>
                              {acc.subscriptionTier}
                            </span>)}
                          {acc.verificationStatus === "PENDING" ? (<span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                              <IconClock className="h-3.5 w-3.5"/>
                              {t.statusPending}
                            </span>) : acc.verificationStatus === "VERIFIED" ? (<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                              <IconCircleCheck className="h-3.5 w-3.5"/>
                              {t.statusVerified}
                            </span>) : (<span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:text-rose-300">
                              <IconAlertTriangle className="h-3.5 w-3.5"/>
                              {t.statusRejected}
                            </span>)}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm">
                            <IconMail className="h-4 w-4 text-slate-400"/>
                            {acc.email}
                          </span>
                          {acc.phone && (<span className="inline-flex items-center gap-1.5">
                              <IconPhone className="h-4 w-4 text-slate-400"/>
                              {acc.phone}
                            </span>)}
                          {acc.district && (<span className="inline-flex items-center gap-1.5">
                              <IconMapPin className="h-4 w-4 text-slate-400"/>
                              {acc.district}
                              {acc.polyclinicName ? ` • ${acc.polyclinicName}` : ""}
                            </span>)}
                          {latVal !== null && lngVal !== null && (<span className="inline-flex items-center gap-1 font-mono text-xs text-teal-700 dark:text-teal-300">
                              GPS: {Number(latVal).toFixed(4)}, {Number(lngVal).toFixed(4)}
                            </span>)}
                        </div>

                        {acc.patientProfile && (<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                            {acc.patientProfile.dateOfBirth && (<span>
                                {t.dobLabel} <strong>{acc.patientProfile.dateOfBirth}</strong>
                              </span>)}
                            {acc.patientProfile.mahalla && (<span>
                                {t.mahallaLabel} <strong>{acc.patientProfile.mahalla}</strong>
                              </span>)}
                            {acc.patientProfile.bloodType && (<span>
                                {t.bloodLabel} <strong>{acc.patientProfile.bloodType}</strong>
                              </span>)}
                          </div>)}

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t.registeredLabel}{" "}
                          {new Date(acc.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                        </p>

                        {acc.verificationNote && (<p className="text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 rounded-xl px-3 py-1.5 border border-rose-200 dark:border-rose-800 inline-block">
                            {t.notePrefix} {acc.verificationNote}
                          </p>)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {acc.verificationStatus !== "VERIFIED" && (<button type="button" disabled={isBusy} onClick={() => handleDecision(acc.id, "APPROVE")} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50 transition-all active:scale-[0.98]">
                          <IconCheck className="h-4 w-4"/>
                          {acc.verificationStatus === "REJECTED"
                            ? t.reapproveBtn
                            : t.approveBtn}
                        </button>)}

                      {acc.verificationStatus !== "REJECTED" && !isRejecting && (<button type="button" disabled={isBusy} onClick={() => {
                            setDeletingId(null);
                            setRejectingId(acc.id);
                            setRejectNote("");
                        }} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-[#101E21] px-4 py-2 text-sm font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 disabled:opacity-50 transition-colors">
                          <IconX className="h-4 w-4"/>
                          {t.rejectBtn}
                        </button>)}

                      {deletingId !== acc.id && (<button type="button" disabled={isBusy} onClick={() => {
                            setRejectingId(null);
                            setDeletingId(acc.id);
                        }} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-red-300 dark:border-red-900 bg-white dark:bg-[#101E21] px-3.5 py-2 text-sm font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 disabled:opacity-50 transition-colors">
                          <IconTrash className="h-4 w-4"/>
                          {t.deleteBtn}
                        </button>)}
                    </div>
                  </div>

                  {isRejecting && (<div className="oc-slide-down flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-[#D7E4E1] dark:border-[#1E353A]">
                      <input type="text" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder={t.notePlaceholder} aria-label={t.notePlaceholder} className="min-h-[44px] flex-1 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-slate-100 focus:border-rose-500 focus:outline-none"/>
                      <div className="flex gap-2">
                        <button type="button" disabled={isBusy} onClick={() => handleDecision(acc.id, "REJECT", rejectNote)} className="min-h-[44px] rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-50 transition">
                          {t.confirmRejectBtn}
                        </button>
                        <button type="button" disabled={isBusy} onClick={() => setRejectingId(null)} className="min-h-[44px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#16272B] transition">
                          {t.cancelBtn}
                        </button>
                      </div>
                    </div>)}

                  {deletingId === acc.id && (<div className="oc-slide-down flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-red-200 dark:border-red-900/70 bg-red-50/70 dark:bg-red-950/30 rounded-xl px-4 py-3">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        {t.deleteConfirmPrompt}
                      </p>
                      <div className="flex gap-2 shrink-0">
                        <button type="button" disabled={isBusy} onClick={() => handleDeleteAccount(acc.id)} className="min-h-[42px] rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50 transition">
                          {t.confirmDeleteBtn}
                        </button>
                        <button type="button" disabled={isBusy} onClick={() => setDeletingId(null)} className="min-h-[42px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#16272B] transition">
                          {t.cancelBtn}
                        </button>
                      </div>
                    </div>)}
                </div>);
            })}
          </div>)}
      </section>
    </div>);
}
