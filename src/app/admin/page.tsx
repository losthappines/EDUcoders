"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBed,
  IconCircleCheck,
  IconClock,
  IconFileCode,
  IconLock,
  IconMapPin,
  IconPackage,
  IconReceipt,
  IconShieldCheck,
  IconUserCheck,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage, type AppLang } from "@/context/LanguageContext";
import { SlaCountdownBadge } from "@/components/SlaCountdownBadge";
import { FhirBundleModal } from "@/components/FhirBundleModal";
import { InfoTooltip } from "@/components/InfoTooltip";

const ADMIN_COPY: Record<
  AppLang,
  {
    title: string;
    subtitle: string;
    rbacBadge: string;
    rbacTip: string;
    slaMonitorTitle: string;
    slaTip: string;
    allTab: string;
    greenTab: string;
    yellowTab: string;
    redTab: string;
    verifiedTab: string;
    greenCard: string;
    yellowCard: string;
    redCard: string;
    verifiedCard: string;
    colPatient: string;
    colDoctor: string;
    colNote: string;
    colTimer: string;
    colFhir: string;
    fhirTip: string;
    noCalls: string;
    bedTitle: string;
    bedReleased: string;
    routingTitle: string;
    districtsLabel: string;
    slotsOpen: string;
    slotsBooked: string;
    pharmacyTitle: string;
    patientLabel: string;
    billingTitle: string;
    stateCoveredLabel: string;
    stateGrantLabel: string;
    optionalDiagLabel: string;
    auditTitle: string;
    colTime: string;
    colAction: string;
    colActor: string;
    colResource: string;
    colDetails: string;
    verifTitle: string;
    verifPendingDesc: string;
    verifClearDesc: string;
    verifBtn: string;
  }
> = {
  uz: {
    title: "Qabulxona, 24 soatlik tashriflar va klinika boshqaruvi",
    subtitle:
      "Koykalar bo'shatilishini, poliklinikalarga taqsimotni, dorixona va davlat granti hisobini kuzatish",
    rbacBadge: "Maxfiy izohlar yashirilgan (RBAC)",
    rbacTip:
      "Rolga asoslangan kirish nazorati: qabulxona xodimlariga bemorning maxfiy shifokor izohlari ko'rsatilmaydi.",
    slaMonitorTitle: "24 soatlik tashriflar nazorati",
    slaTip:
      "SLA — shifoxonadan chiqqandan keyin 24 soat ichida oilaviy shifokor tashrif buyurish muddati.",
    allTab: "Barchasi",
    greenTab: "Yashil <12s",
    yellowTab: "Sariq 12–18s",
    redTab: "Qizil >18s",
    verifiedTab: "Tasdiqlangan",
    greenCard: "Yashil (<12 soat)",
    yellowCard: "Sariq (12–18 soat)",
    redCard: "Qizil (>18 soat)",
    verifiedCard: "Tasdiqlangan tashriflar",
    colPatient: "Bemor",
    colDoctor: "Poliklinika va shifokor",
    colNote: "Klinik eslatma (RBAC)",
    colTimer: "24 soatlik taymer",
    colFhir: "FHIR",
    fhirTip: "HL7 FHIR R4 — shifoxona va poliklinika o'rtasidagi xalqaro ma'lumot almashish standarti.",
    noCalls: "Tanlangan zona bo'yicha chaqiruvlar yo'q.",
    bedTitle: "Shifoxona koykalari holati",
    bedReleased: "Koyka bo'shatilgan • Uyga chiqarilgan",
    routingTitle: "Hududiy poliklinika va shifokorlar jadvali",
    districtsLabel: "Hududlar:",
    slotsOpen: "bo'sh",
    slotsBooked: "band",
    pharmacyTitle: "Poliklinika dorixonasi zaxirasi",
    patientLabel: "Bemor:",
    billingTitle: "Davlat kafolati va diagnostika hisobi",
    stateCoveredLabel: "Davlat qoplagan:",
    stateGrantLabel: "100% Davlat granti",
    optionalDiagLabel: "Qo'shimcha diagnostika jami:",
    auditTitle: "Xavfsizlik auditi jurnali",
    colTime: "Vaqt",
    colAction: "Harakat",
    colActor: "Foydalanuvchi",
    colResource: "Obyekt",
    colDetails: "Tafsilotlar",
    verifTitle: "Yangi ro'yxatdan o'tgan hisoblarni tasdiqlash",
    verifPendingDesc: "ta yangi bemor yoki shifokor hisobi tasdiqlashingizni kutmoqda.",
    verifClearDesc: "Barcha yangi bemor va shifokor arizalari ko'rib chiqilgan.",
    verifBtn: "Tasdiqlash sahifasini ochish",
  },
  ru: {
    title: "Координация клиники и контроль 24-часовых визитов",
    subtitle:
      "Учет освобождения коек, распределение по поликлиникам, аптека, госгранты и журнал аудита",
    rbacBadge: "Врачебная тайна защищена (RBAC)",
    rbacTip:
      "Ролевой контроль доступа: скрывает чувствительные клинические заметки врачей в панели координатора.",
    slaMonitorTitle: "Монитор 24-часовых визитов",
    slaTip:
      "SLA — гарантированное окно в 24 часа для визита семейного врача после выписки.",
    allTab: "Все",
    greenTab: "Зеленая <12ч",
    yellowTab: "Желтая 12–18ч",
    redTab: "Красная >18ч",
    verifiedTab: "Подтверждено",
    greenCard: "Зеленая (<12 часов)",
    yellowCard: "Желтая (12–18 часов)",
    redCard: "Красная (>18 часов)",
    verifiedCard: "Подтвержденные визиты",
    colPatient: "Пациентка",
    colDoctor: "Поликлиника и врач",
    colNote: "Заметка (RBAC)",
    colTimer: "Таймер 24ч",
    colFhir: "FHIR",
    fhirTip: "HL7 FHIR R4 — международный стандарт обмена медицинскими данными между клиниками.",
    noCalls: "Нет вызовов в выбранной зоне.",
    bedTitle: "Статус коек стационара",
    bedReleased: "Койка освобождена • Выписана",
    routingTitle: "Территориальная маршрутизация врачей",
    districtsLabel: "Районы:",
    slotsOpen: "свободно",
    slotsBooked: "занято",
    pharmacyTitle: "Остатки аптеки поликлиники",
    patientLabel: "Пациент:",
    billingTitle: "Государственное покрытие и счета",
    stateCoveredLabel: "Покрыто государством:",
    stateGrantLabel: "100% Госгрант",
    optionalDiagLabel: "Итого доп. диагностика:",
    auditTitle: "Журнал аудита безопасности",
    colTime: "Время",
    colAction: "Действие",
    colActor: "Пользователь",
    colResource: "Ресурс",
    colDetails: "Детали",
    verifTitle: "Проверка новых аккаунтов (Пациенты и Врачи)",
    verifPendingDesc: "новых аккаунтов ожидают вашего подтверждения перед входом.",
    verifClearDesc: "Все заявки пациентов и врачей уже рассмотрены.",
    verifBtn: "Открыть страницу проверки",
  },
  en: {
    title: "Clinic Reception, 24-Hour Visit Monitor & Governance",
    subtitle:
      "Track hospital bed turnover, local clinic assignments, pharmacy stock, state coverage, and audit logs",
    rbacBadge: "Private Clinical Notes Redacted (RBAC)",
    rbacTip:
      "Role-Based Access Control hides private doctor notes from reception and admin screens.",
    slaMonitorTitle: "24-Hour Home Visit Monitor",
    slaTip:
      "SLA = 24-hour window guaranteeing a local family doctor home visit after discharge.",
    allTab: "All",
    greenTab: "Green <12h",
    yellowTab: "Yellow 12–18h",
    redTab: "Red >18h",
    verifiedTab: "Verified",
    greenCard: "Green (<12h elapsed)",
    yellowCard: "Yellow (12–18h Warning)",
    redCard: "Red (>18h Critical)",
    verifiedCard: "Verified Visits",
    colPatient: "Patient",
    colDoctor: "Clinic & Family Doctor",
    colNote: "Summary (RBAC)",
    colTimer: "24h Countdown",
    colFhir: "FHIR",
    fhirTip: "HL7 FHIR R4 — healthcare standard for exchanging patient records across clinics.",
    noCalls: "No calls matching selected time zone.",
    bedTitle: "Hospital Bed Release Status",
    bedReleased: "Bed Released • Checked Out",
    routingTitle: "Local Clinic & Family Doctor Slots",
    districtsLabel: "Districts:",
    slotsOpen: "open",
    slotsBooked: "booked",
    pharmacyTitle: "Clinic Pharmacy Stock Overview",
    patientLabel: "Patient:",
    billingTitle: "State Coverage & Billing Summary",
    stateCoveredLabel: "State Covered:",
    stateGrantLabel: "100% State Grant",
    optionalDiagLabel: "Total optional patient diagnostics:",
    auditTitle: "Security Audit Log",
    colTime: "Timestamp",
    colAction: "Action",
    colActor: "Actor & Role",
    colResource: "Resource",
    colDetails: "Details",
    verifTitle: "Account Verification Queue (Patients & Doctors)",
    verifPendingDesc: "new patient or doctor registration(s) awaiting your verification.",
    verifClearDesc: "All patient and doctor registrations have been reviewed.",
    verifBtn: "Open Verifications Page",
  },
};

export default function AdminPanelPage() {
  const { data, loading, dataLoadedAtMs } = usePlatform();
  const { lang } = useLanguage();
  const t = ADMIN_COPY[lang];

  const [fhirCallId, setFhirCallId] = useState<string | null>(null);
  const [slaFilter, setSlaFilter] = useState<"ALL" | "GREEN" | "YELLOW" | "RED" | "COMPLETED">("ALL");

  const calls = data?.activeCalls ?? [];
  const patients = data?.patients ?? [];
  const doctors = (data?.users ?? []).filter((u) => u.role === "FAMILY_MD");
  const invoices = data?.invoices ?? [];
  const auditLogs = data?.auditLogs ?? [];

  const greenCount = calls.filter((c) => c.sla.zone === "GREEN").length;
  const yellowCount = calls.filter((c) => c.sla.zone === "YELLOW").length;
  const redCount = calls.filter((c) => c.sla.zone === "RED").length;
  const completedCount = calls.filter((c) => c.sla.zone === "COMPLETED").length;

  const filteredCalls =
    slaFilter === "ALL" ? calls : calls.filter((c) => c.sla.zone === slaFilter);

  const totalStateCovered = invoices.reduce((acc, inv) => acc + inv.stateCoveredUzs, 0);
  const totalPatientPaid = invoices.reduce((acc, inv) => acc + inv.patientPayableUzs, 0);

  const pendingVerifications = data?.pendingVerificationsCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.subtitle}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-white">
          <IconLock className="h-3.5 w-3.5 text-teal-400" />
          <InfoTooltip label={t.rbacBadge} explanation={t.rbacTip} />
        </div>
      </div>

      {/* Dedicated Account Verifications Callout */}
      <div
        className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          pendingVerifications > 0
            ? "border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40"
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        }`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              pendingVerifications > 0
                ? "bg-amber-100 dark:bg-amber-900/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                : "bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300"
            }`}
          >
            <IconUserCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t.verifTitle}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {pendingVerifications > 0
                ? `${pendingVerifications} ${t.verifPendingDesc}`
                : t.verifClearDesc}
            </p>
          </div>
        </div>
        <Link
          href="/admin/verifications"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition whitespace-nowrap"
        >
          {t.verifBtn}
          <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <IconClock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <InfoTooltip label={t.slaMonitorTitle} explanation={t.slaTip} />
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: "ALL" as const, label: `${t.allTab} (${calls.length})` },
              { key: "GREEN" as const, label: `${t.greenTab} (${greenCount})` },
              { key: "YELLOW" as const, label: `${t.yellowTab} (${yellowCount})` },
              { key: "RED" as const, label: `${t.redTab} (${redCount})` },
              { key: "COMPLETED" as const, label: `${t.verifiedTab} (${completedCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSlaFilter(tab.key)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  slaFilter === tab.key
                    ? "bg-slate-900 dark:bg-teal-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5">
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{t.greenCard}</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{greenCount}</p>
          </div>
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 p-3.5">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">{t.yellowCard}</p>
            <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">{yellowCount}</p>
          </div>
          <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40 p-3.5">
            <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">{t.redCard}</p>
            <p className="mt-1 text-2xl font-bold text-rose-700 dark:text-rose-400 tabular-nums">{redCount}</p>
          </div>
          <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/40 p-3.5">
            <p className="text-xs font-semibold text-teal-800 dark:text-teal-300">{t.verifiedCard}</p>
            <p className="mt-1 text-2xl font-bold text-teal-700 dark:text-teal-400 tabular-nums">{completedCount}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2 pr-3 font-semibold">{t.colPatient}</th>
                <th className="py-2 pr-3 font-semibold">{t.colDoctor}</th>
                <th className="py-2 pr-3 font-semibold">{t.colNote}</th>
                <th className="py-2 pr-3 font-semibold">{t.colTimer}</th>
                <th className="py-2 font-semibold">
                  <InfoTooltip label={t.colFhir} explanation={t.fhirTip} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCalls.map((call) => {
                const latestEhr = call.patient.ehrRecords[call.patient.ehrRecords.length - 1];
                return (
                  <tr key={call.id}>
                    <td className="py-3 pr-3">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{call.patient.fullName}</p>
                      <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {call.patient.jshshirMasked} • {call.district}
                      </p>
                    </td>
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{call.assignedDoctor.fullName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{call.polyclinicName}</p>
                    </td>
                    <td className="py-3 pr-3 max-w-xs">
                      <span className="inline-block rounded px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {latestEhr?.diagnosisText ?? "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      {data?.simState && (
                        <SlaCountdownBadge
                          dischargedAt={call.dischargedAt}
                          slaDeadlineAt={call.slaDeadlineAt}
                          simulatedNow={data.simState.simulatedNow}
                          dataLoadedAtMs={dataLoadedAtMs}
                          status={call.status}
                        />
                      )}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => setFhirCallId(call.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <IconFileCode className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        FHIR
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredCalls.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 dark:text-slate-400">
                    {t.noCalls}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <IconBed className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            {t.bedTitle}
          </h2>
          <div className="space-y-2">
            {patients.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{p.fullName}</p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {p.bedNumber ? p.bedNumber : t.bedReleased}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    p.status === "INPATIENT"
                      ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300"
                      : p.status === "VISIT_COMPLETED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <IconMapPin className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            {t.routingTitle}
          </h2>
          <div className="space-y-2">
            {doctors.map((doc) => {
              const openSlots = doc.scheduleSlots.filter((s) => !s.bookedPatientId).length;
              const bookedSlots = doc.scheduleSlots.length - openSlots;
              return (
                <div
                  key={doc.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{doc.fullName}</p>
                    <p className="text-slate-600 dark:text-slate-300">{doc.polyclinicName}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {t.districtsLabel} {doc.district} • {doc.telegramHandle}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {openSlots} {t.slotsOpen} / {bookedSlots} {t.slotsBooked}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <IconPackage className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            {t.pharmacyTitle}
          </h2>
          <div className="space-y-2">
            {patients.flatMap((p) =>
              p.prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {rx.medicationName} ({rx.dosage})
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {rx.polyclinicPharmacy} • {t.patientLabel} {p.fullName}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      rx.pharmacyStockStatus === "IN_STOCK"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                        : rx.pharmacyStockStatus === "RESERVED"
                          ? "bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                    }`}
                  >
                    {rx.pharmacyStockStatus}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <IconReceipt className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              {t.billingTitle}
            </h2>
            <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
              {t.stateCoveredLabel} {totalStateCovered.toLocaleString()} UZS
            </span>
          </div>
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{inv.description}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {inv.patient.fullName} • {inv.packageName}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {inv.amountUzs.toLocaleString()} UZS
                  </p>
                  <p
                    className={`text-[10px] font-bold ${
                      inv.category === "STATE_GRANT" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {inv.category === "STATE_GRANT"
                      ? t.stateGrantLabel
                      : `${t.patientLabel} ${inv.patientPayableUzs.toLocaleString()} UZS`}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t.optionalDiagLabel}{" "}
            <strong className="text-slate-700 dark:text-slate-200">
              {totalPatientPaid.toLocaleString()} UZS
            </strong>
          </p>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <IconShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          {t.auditTitle}
        </h2>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2 pr-3 font-semibold">{t.colTime}</th>
                <th className="py-2 pr-3 font-semibold">{t.colAction}</th>
                <th className="py-2 pr-3 font-semibold">{t.colActor}</th>
                <th className="py-2 pr-3 font-semibold">{t.colResource}</th>
                <th className="py-2 font-semibold">{t.colDetails}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2 pr-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("en-GB", {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-bold ${
                        log.action === "SLA_ESCALATED" ||
                        log.action === "SYMPTOM_ALERT" ||
                        log.action === "RBAC_DENIED"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300"
                          : log.action === "VISIT_VERIFIED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {log.action === "SLA_ESCALATED" && (
                        <IconAlertTriangle className="h-3 w-3" />
                      )}
                      {log.action === "VISIT_VERIFIED" && (
                        <IconCircleCheck className="h-3 w-3" />
                      )}
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-sans text-slate-800 dark:text-slate-200">
                    {log.actorName}{" "}
                    <span className="text-slate-400 dark:text-slate-500">({log.actorRole})</span>
                  </td>
                  <td className="py-2 pr-3 text-slate-600 dark:text-slate-300">
                    {log.resourceType}:{log.resourceId.slice(-8)}
                  </td>
                  <td className="py-2 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {log.detailsJson}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <FhirBundleModal activeCallId={fhirCallId} onClose={() => setFhirCallId(null)} />
    </div>
  );
}
