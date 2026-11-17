"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IconAlertTriangle, IconArrowLeft, IconBuildingHospital, IconCheck, IconCircleCheck, IconClock, IconMail, IconMapPin, IconPhone, IconSearch, IconStethoscope, IconUser, IconUserCheck, IconX, } from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
const COPY = {
    uz: {
        backDash: "Umumiy boshqaruvga qaytish",
        title: "Bemor va shifokor hisoblarini tasdiqlash",
        subtitle: "Yangi ro'yxatdan o'tgan bemorlar va shifokorlarni ko'rib chiqing. Tasdiqlangandan so'ng ular o'z kabinetiga kira oladi.",
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
        searchPlaceholder: "Ism, email, telefon yoki tuman bo'yicha qidirish...",
        loading: "Arizalar ro'yxati yuklanmoqda...",
        empty: "Tanlangan filtrlar bo'yicha hisoblar topilmadi.",
        statusPending: "Kutilmoqda",
        statusVerified: "Tasdiqlangan",
        statusRejected: "Rad etilgan",
        rolePatient: "Bemor / Ona",
        roleOvabmu: "Tug'ruqxona shifokori",
        roleFamily: "Oilaviy shifokor",
        approveBtn: "Tasdiqlash va faollashtirish",
        rejectBtn: "Rad etish",
        reapproveBtn: "Qayta tasdiqlash",
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
    },
    ru: {
        backDash: "Назад к обзору клиники",
        title: "Проверка аккаунтов пациентов и врачей",
        subtitle: "Рассмотрите новые заявки пациентов и врачей. После подтверждения они смогут войти в свой личный кабинет.",
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
        searchPlaceholder: "Поиск по имени, email, телефону или району...",
        loading: "Загрузка списка заявок...",
        empty: "По выбранным фильтрам аккаунты не найдены.",
        statusPending: "Ожидает",
        statusVerified: "Подтвержден",
        statusRejected: "Отклонен",
        rolePatient: "Мама / Пациент",
        roleOvabmu: "Врач роддома",
        roleFamily: "Семейный врач",
        approveBtn: "Подтвердить и активировать",
        rejectBtn: "Отклонить",
        reapproveBtn: "Подтвердить повторно",
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
    },
    en: {
        backDash: "Back to Dashboard Overview",
        title: "Patient & Doctor Account Verifications",
        subtitle: "Review new patient and physician registrations. Accounts remain locked until you verify and activate them.",
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
        searchPlaceholder: "Search by name, email, phone, or district...",
        loading: "Loading account verification queue...",
        empty: "No accounts match your current filters.",
        statusPending: "Pending Review",
        statusVerified: "Verified",
        statusRejected: "Declined",
        rolePatient: "Mother / Patient",
        roleOvabmu: "Hospital Doctor",
        roleFamily: "Local Family Doctor",
        approveBtn: "Verify & Activate",
        rejectBtn: "Decline",
        reapproveBtn: "Verify Account",
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
            if (!q)
                return true;
            return (a.fullName.toLowerCase().includes(q) ||
                a.email.toLowerCase().includes(q) ||
                (a.phone || "").toLowerCase().includes(q) ||
                (a.district || "").toLowerCase().includes(q) ||
                (a.specialty || "").toLowerCase().includes(q) ||
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
        return {
            label: t.roleFamily,
            icon: <IconStethoscope className="h-4 w-4 text-emerald-700 dark:text-emerald-400"/>,
            pill: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
    };
    return (<div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline mb-2">
            <IconArrowLeft className="h-3.5 w-3.5"/>
            {t.backDash}
          </Link>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <IconUserCheck className="h-5 w-5 text-teal-600 dark:text-teal-400"/>
            {t.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/40 p-4">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            {t.pendingCard}
          </p>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">
            {counts.pending}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/40 p-4">
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            {t.verifiedCard}
          </p>
          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">
            {counts.verified}
          </p>
        </div>
        <div className="rounded-xl border border-rose-200 dark:border-rose-800/70 bg-rose-50/70 dark:bg-rose-950/40 p-4">
          <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">
            {t.rejectedCard}
          </p>
          <p className="text-2xl font-bold text-rose-900 dark:text-rose-200 mt-1">
            {counts.rejected}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {t.totalCard}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {counts.total}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {[
            { key: "PENDING", label: `${t.tabPending} (${counts.pending})` },
            { key: "VERIFIED", label: `${t.tabVerified} (${counts.verified})` },
            { key: "REJECTED", label: `${t.tabRejected} (${counts.rejected})` },
            { key: "ALL", label: `${t.tabAll} (${counts.total})` },
        ].map((tab) => (<button key={tab.key} type="button" onClick={() => setStatusFilter(tab.key)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${statusFilter === tab.key
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                {tab.label}
              </button>))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-0.5">
              {[
            { key: "ALL", label: t.roleAll },
            { key: "PATIENT", label: t.rolePatients },
            { key: "DOCTOR", label: t.roleDoctors },
        ].map((rf) => (<button key={rf.key} type="button" onClick={() => setRoleFilter(rf.key)} className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${roleFilter === rf.key
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}>
                  {rf.label}
                </button>))}
            </div>

            <div className="relative w-full sm:w-64">
              <IconSearch className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.searchPlaceholder} aria-label={t.searchPlaceholder} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"/>
            </div>
          </div>
        </div>

        {/* Account Cards */}
        {loadingList ? (<div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            {t.loading}
          </div>) : filtered.length === 0 ? (<div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            {t.empty}
          </div>) : (<div className="space-y-3">
            {filtered.map((acc) => {
                const roleMeta = getRoleMeta(acc.role);
                const isBusy = busyId === acc.id;
                const isRejecting = rejectingId === acc.id;
                return (<div key={acc.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        {roleMeta.icon}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {acc.fullName}
                          </h3>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${roleMeta.pill}`}>
                            {roleMeta.label}
                          </span>
                          {acc.role !== "PATIENT" && acc.specialty && (<span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              {acc.specialty}
                            </span>)}
                          {acc.verificationStatus === "PENDING" ? (<span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                              <IconClock className="h-3 w-3"/>
                              {t.statusPending}
                            </span>) : acc.verificationStatus === "VERIFIED" ? (<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                              <IconCircleCheck className="h-3 w-3"/>
                              {t.statusVerified}
                            </span>) : (<span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 px-2 py-0.5 text-[11px] font-semibold text-rose-800 dark:text-rose-300">
                              <IconAlertTriangle className="h-3 w-3"/>
                              {t.statusRejected}
                            </span>)}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1 font-mono">
                            <IconMail className="h-3.5 w-3.5 text-slate-400"/>
                            {acc.email}
                          </span>
                          {acc.phone && (<span className="inline-flex items-center gap-1">
                              <IconPhone className="h-3.5 w-3.5 text-slate-400"/>
                              {acc.phone}
                            </span>)}
                          {acc.district && (<span className="inline-flex items-center gap-1">
                              <IconMapPin className="h-3.5 w-3.5 text-slate-400"/>
                              {acc.district}
                              {acc.polyclinicName ? ` • ${acc.polyclinicName}` : ""}
                            </span>)}
                        </div>

                        {acc.patientProfile && (<div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
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

                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          {t.registeredLabel}{" "}
                          {new Date(acc.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                        </p>

                        {acc.verificationNote && (<p className="text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 rounded-lg px-2.5 py-1 border border-rose-200 dark:border-rose-800 inline-block">
                            {t.notePrefix} {acc.verificationNote}
                          </p>)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {acc.verificationStatus !== "VERIFIED" && (<button type="button" disabled={isBusy} onClick={() => handleDecision(acc.id, "APPROVE")} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition">
                          <IconCheck className="h-4 w-4"/>
                          {acc.verificationStatus === "REJECTED"
                            ? t.reapproveBtn
                            : t.approveBtn}
                        </button>)}

                      {acc.verificationStatus !== "REJECTED" && !isRejecting && (<button type="button" disabled={isBusy} onClick={() => {
                            setRejectingId(acc.id);
                            setRejectNote("");
                        }} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 disabled:opacity-50 transition">
                          <IconX className="h-4 w-4"/>
                          {t.rejectBtn}
                        </button>)}
                    </div>
                  </div>

                  {isRejecting && (<div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <input type="text" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder={t.notePlaceholder} className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-rose-500 focus:outline-none"/>
                      <div className="flex gap-2">
                        <button type="button" disabled={isBusy} onClick={() => handleDecision(acc.id, "REJECT", rejectNote)} className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition">
                          {t.confirmRejectBtn}
                        </button>
                        <button type="button" disabled={isBusy} onClick={() => setRejectingId(null)} className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
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
