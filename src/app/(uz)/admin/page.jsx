"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBed,
  IconBell,
  IconBrandTelegram,
  IconCalendarEvent,
  IconCircleCheck,
  IconClock,
  IconCrown,
  IconFileCode,
  IconLock,
  IconMapPin,
  IconPackage,
  IconReceipt,
  IconSend,
  IconShieldCheck,
  IconStethoscope,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
import { useStaffNav } from "@/components/AppShell";
import {
  DistributionDonutChart,
  StaffKpiCard,
  StaffWelcomeHeader,
  TrendsAreaChart,
} from "@/components/StaffAnalyticsWidgets";
import { SlaCountdownBadge } from "@/components/SlaCountdownBadge";
import { FhirBundleModal } from "@/components/FhirBundleModal";
import { InfoTooltip } from "@/components/InfoTooltip";

const ADMIN_COPY = {
  uz: {
    welcomePrefix: "Xush kelibsiz,",
    searchPlaceholder: "Bemor, shifokor yoki tuman qidirish...",
    title: "Qabulxona, 24 soatlik tashriflar va klinika boshqaruvi",
    subtitle: "Koykalar bo'shatilishini, poliklinikalarga taqsimotni, dorixona va davlat granti hisobini kuzatish",
    rbacBadge: "Maxfiy izohlar yashirilgan (RBAC)",
    rbacTip: "Rolga asoslangan kirish nazorati: qabulxona xodimlariga bemorning maxfiy shifokor izohlari ko'rsatilmaydi.",
    kpiPatients: "Jami bemorlar",
    kpiPatientsSub: "Faol",
    kpiVisits: "24s uy tashriflari",
    kpiVisitsSub: "Nazoratda",
    kpiDoctors: "Oilaviy shifokorlar",
    kpiDoctorsSub: "Hududiy",
    kpiAlerts: "Qizil / Kutilmoqda",
    kpiAlertsSub: "Diqqat talab",
    trendTitle: "Tashriflar va qabullar dinamikasi",
    trendSub: "Oxirgi 7 kunlik 24 soatlik patronaj oqimi",
    donutTitle: "24s tashrif holati taqsimoti",
    donutCenter: "Tashrif",
    slaMonitorTitle: "24 soatlik tashriflar ro'yxati",
    slaTip: "SLA — shifoxonadan chiqqandan keyin 24 soat ichida oilaviy shifokor tashrif buyurish muddati.",
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
    complaintsMonitorTitle: "Bemor shikoyatlari va GPS koordinator nazorati",
    remindAllBtn: "Barcha shifokorlarga Telegram eslatma",
    remindOneBtn: "Shifokorga eslatma",
    complaintsEmpty: "Hozircha faol shikoyatlar yo'q.",
    tgControlTitle: "Telegram Bot boshqaruv paneli (@BotFather & Webhook)",
    tgTokenPlaceholder: "@BotFather API tokeni (masalan: 123456:ABC...)",
    tgUserPlaceholder: "Bot username (masalan: @OnaCareBot)",
    tgWebhookPlaceholder: "Webhook URL",
    tgSaveBtn: "Saqlash va Webhook ulash",
    tgConsoleBtn: "Bot Konsolni ochish",
    tgConfiguredBadge: "Token sozlangan",
    tgSimBadge: "Simulyator rejimi",
    subsTitle: "Bemor obunalari",
    subsEmpty: "Hozircha xarid qilingan obunalar yo'q.",
    remindedOk: "Telegram tashrif eslatmasi yuborildi!",
    tgSavedOk: "Telegram Bot va Webhook sozlandi!",
    backOverview: "Dashboardga qaytish",
  },
  ru: {
    welcomePrefix: "Добро пожаловать,",
    searchPlaceholder: "Поиск пациента, врача или района...",
    title: "Координация клиники и контроль 24-часовых визитов",
    subtitle: "Учет освобождения коек, распределение по поликлиникам, аптека, госгранты и журнал аудита",
    rbacBadge: "Врачебная тайна защищена (RBAC)",
    rbacTip: "Ролевой контроль доступа: скрывает чувствительные клинические заметки врачей в панели координатора.",
    kpiPatients: "Всего пациенток",
    kpiPatientsSub: "Активно",
    kpiVisits: "Визиты 24ч",
    kpiVisitsSub: "Мониторинг",
    kpiDoctors: "Семейные врачи",
    kpiDoctorsSub: "По районам",
    kpiAlerts: "Красные / Заявки",
    kpiAlertsSub: "Требует внимания",
    trendTitle: "Динамика визитов и выписок",
    trendSub: "Поток 24-часового патронажа за 7 дней",
    donutTitle: "Статусы 24-часовых визитов",
    donutCenter: "Визитов",
    slaMonitorTitle: "Список 24-часовых визитов",
    slaTip: "SLA — гарантированное окно в 24 часа для визита семейного врача после выписки.",
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
    complaintsMonitorTitle: "Мониторинг жалоб и GPS-координация",
    remindAllBtn: "Напомнить всем врачам в Telegram",
    remindOneBtn: "Напомнить врачу",
    complaintsEmpty: "Активных жалоб пока нет.",
    tgControlTitle: "Управление Telegram Ботом (@BotFather & Webhook)",
    tgTokenPlaceholder: "Токен @BotFather",
    tgUserPlaceholder: "Username бота (@OnaCareBot)",
    tgWebhookPlaceholder: "Webhook URL",
    tgSaveBtn: "Сохранить и подключить Webhook",
    tgConsoleBtn: "Открыть консоль бота",
    tgConfiguredBadge: "Токен настроен",
    tgSimBadge: "Режим симулятора",
    subsTitle: "Подписки пациентов",
    subsEmpty: "Оформленных подписок пока нет.",
    remindedOk: "Напоминание врачу в Telegram отправлено!",
    tgSavedOk: "Telegram бот и Webhook настроены!",
    backOverview: "На дашборд",
  },
  en: {
    welcomePrefix: "Welcome back,",
    searchPlaceholder: "Search anything...",
    title: "Clinic Reception, 24-Hour Visit Monitor & Governance",
    subtitle: "Track hospital bed turnover, local clinic assignments, pharmacy stock, state coverage, and audit logs",
    rbacBadge: "Private Clinical Notes Redacted (RBAC)",
    rbacTip: "Role-Based Access Control hides private doctor notes from reception and admin screens.",
    kpiPatients: "Total Patients",
    kpiPatientsSub: "Active",
    kpiVisits: "24h Visits",
    kpiVisitsSub: "Monitored",
    kpiDoctors: "Family Doctors",
    kpiDoctorsSub: "Districts",
    kpiAlerts: "Red Alerts / Queue",
    kpiAlertsSub: "Needs review",
    trendTitle: "Patient Intake & Visit Trends",
    trendSub: "7-day 24-hour postpartum care throughput",
    donutTitle: "24h Visit Status Distribution",
    donutCenter: "Visits",
    slaMonitorTitle: "Appointments & 24h Visits List",
    slaTip: "SLA = 24-hour window guaranteeing a local family doctor home visit after discharge.",
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
    complaintsMonitorTitle: "Patient Complaints & GPS Dispatch Monitor",
    remindAllBtn: "Send Batch Doctor Reminders",
    remindOneBtn: "Remind Doctor on Telegram",
    complaintsEmpty: "No patient complaints recorded yet.",
    tgControlTitle: "Telegram Bot Control Panel (@BotFather & Webhook)",
    tgTokenPlaceholder: "@BotFather token (e.g. 123456:ABC...)",
    tgUserPlaceholder: "Bot username (e.g. @OnaCareBot)",
    tgWebhookPlaceholder: "Webhook URL",
    tgSaveBtn: "Save & Bind Webhook",
    tgConsoleBtn: "Open Bot Console",
    tgConfiguredBadge: "Bot Token Configured",
    tgSimBadge: "Simulator Mode",
    subsTitle: "Patient Subscriptions",
    subsEmpty: "No subscription transactions recorded yet.",
    remindedOk: "Telegram visit reminder sent to doctor!",
    tgSavedOk: "Telegram bot token & webhook updated!",
    backOverview: "Back to Dashboard",
  },
};

const WEEKDAYS_BY_LANG = {
  uz: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"],
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

export default function AdminPanelPage() {
  const { authUser, data, loading, dataLoadedAtMs, fetchWithAuth, showToast } = usePlatform();
  const { lang } = useLanguage();
  const { activeView, setActiveView, searchQuery, setSearchQuery } = useStaffNav();
  const t = ADMIN_COPY[lang] || ADMIN_COPY.uz;

  const [fhirCallId, setFhirCallId] = useState(null);
  const [slaFilter, setSlaFilter] = useState("ALL");
  const [tgStatus, setTgStatus] = useState(null);
  const [tgToken, setTgToken] = useState("");
  const [tgUsername, setTgUsername] = useState("");
  const [tgWebhookUrl, setTgWebhookUrl] = useState("");
  const [savingTg, setSavingTg] = useState(false);
  const [remindingId, setRemindingId] = useState(null);

  useEffect(() => {
    let active = true;
    fetchWithAuth("/api/telegram/setup")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!active) return;
        if (typeof window !== "undefined") {
          setTgWebhookUrl((prev) => prev || `${window.location.origin}/api/telegram/webhook`);
        }
        if (json) {
          setTgStatus(json);
          if (json.botUsername) setTgUsername(json.botUsername);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [fetchWithAuth]);

  const handleSaveTelegram = async (e) => {
    e.preventDefault();
    setSavingTg(true);
    try {
      const res = await fetchWithAuth("/api/telegram/setup", {
        method: "POST",
        body: JSON.stringify({
          botToken: tgToken.trim() || undefined,
          botUsername: tgUsername.trim() || undefined,
          webhookUrl: tgWebhookUrl.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast("error", json.error || "Could not configure Telegram bot");
        return;
      }
      if (json.status) setTgStatus(json.status);
      setTgToken("");
      showToast("success", t.tgSavedOk);
    } finally {
      setSavingTg(false);
    }
  };

  const handleRemindDoctor = async (doctorId) => {
    setRemindingId(doctorId || "BATCH");
    try {
      const res = await fetchWithAuth("/api/admin/remind-doctor", {
        method: "POST",
        body: JSON.stringify(doctorId ? { doctorId } : {}),
      });
      if (res.ok) {
        showToast("success", t.remindedOk);
      } else {
        const json = await res.json().catch(() => ({}));
        showToast("error", json.error || "Failed to send reminder");
      }
    } finally {
      setRemindingId(null);
    }
  };

  const calls = useMemo(() => data?.activeCalls ?? [], [data?.activeCalls]);
  const patients = useMemo(() => data?.patients ?? [], [data?.patients]);
  const complaints = useMemo(() => data?.complaints ?? [], [data?.complaints]);
  const subscriptions = useMemo(() => data?.subscriptions ?? [], [data?.subscriptions]);
  const doctors = useMemo(
    () => (data?.users ?? []).filter((u) => u.role === "FAMILY_MD"),
    [data?.users]
  );
  const invoices = useMemo(() => data?.invoices ?? [], [data?.invoices]);
  const auditLogs = useMemo(() => data?.auditLogs ?? [], [data?.auditLogs]);

  const greenCount = calls.filter((c) => c.sla.zone === "GREEN").length;
  const yellowCount = calls.filter((c) => c.sla.zone === "YELLOW").length;
  const redCount = calls.filter((c) => c.sla.zone === "RED").length;
  const completedCount = calls.filter((c) => c.sla.zone === "COMPLETED").length;

  const q = searchQuery.trim().toLowerCase();

  const filteredCalls = useMemo(() => {
    return calls.filter((c) => {
      if (slaFilter !== "ALL" && c.sla.zone !== slaFilter) return false;
      if (!q) return true;
      return (
        (c.patient?.fullName || "").toLowerCase().includes(q) ||
        (c.district || "").toLowerCase().includes(q) ||
        (c.assignedDoctor?.fullName || "").toLowerCase().includes(q) ||
        (c.polyclinicName || "").toLowerCase().includes(q)
      );
    });
  }, [calls, slaFilter, q]);

  const filteredPatients = useMemo(() => {
    if (!q) return patients;
    return patients.filter(
      (p) =>
        (p.fullName || "").toLowerCase().includes(q) ||
        (p.district || "").toLowerCase().includes(q) ||
        (p.bedNumber || "").toLowerCase().includes(q)
    );
  }, [patients, q]);

  const filteredDoctors = useMemo(() => {
    if (!q) return doctors;
    return doctors.filter(
      (d) =>
        (d.fullName || "").toLowerCase().includes(q) ||
        (d.district || "").toLowerCase().includes(q) ||
        (d.polyclinicName || "").toLowerCase().includes(q)
    );
  }, [doctors, q]);

  const filteredComplaints = useMemo(() => {
    if (!q) return complaints;
    return complaints.filter(
      (c) =>
        (c.patient?.fullName || "").toLowerCase().includes(q) ||
        (c.visitAddress || "").toLowerCase().includes(q) ||
        (c.category || "").toLowerCase().includes(q)
    );
  }, [complaints, q]);

  const totalStateCovered = invoices.reduce((acc, inv) => acc + inv.stateCoveredUzs, 0);
  const totalPatientPaid = invoices.reduce((acc, inv) => acc + inv.patientPayableUzs, 0);
  const pendingVerifications = data?.pendingVerificationsCount ?? 0;

  const simulatedNow = data?.simState?.simulatedNow;
  const dateLabel = useMemo(() => {
    const baseDate = simulatedNow ? new Date(simulatedNow) : new Date();
    const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ";
    return baseDate.toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [simulatedNow, lang]);

  const trendSeries = useMemo(() => {
    const labels = WEEKDAYS_BY_LANG[lang] || WEEKDAYS_BY_LANG.en;
    const baseCount = Math.max(calls.length, patients.length, 2);
    const weights = [0.45, 0.72, 0.58, 0.88, 0.76, 0.94, 1.0];
    return labels.map((label, idx) => {
      const bucketEvents = calls.filter((c) => {
        const d = new Date(c.dischargedAt).getDay();
        const mapped = d === 0 ? 6 : d - 1;
        return mapped === idx;
      }).length;
      const val = bucketEvents > 0
        ? bucketEvents + Math.round(baseCount * 0.4)
        : Math.max(1, Math.round(baseCount * weights[idx]));
      return { label, value: val };
    });
  }, [calls, patients.length, lang]);

  const donutSegments = useMemo(
    () => [
      { label: t.greenTab, value: greenCount, color: "#22C55E" },
      { label: t.yellowTab, value: yellowCount, color: "#F59E0B" },
      { label: t.redTab, value: redCount, color: "#EF4444" },
      { label: t.verifiedTab, value: completedCount, color: "#2585F5" },
    ],
    [t.greenTab, t.yellowTab, t.redTab, t.verifiedTab, greenCount, yellowCount, redCount, completedCount]
  );

  const renderSlaTable = () => (
    <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <IconClock className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
          <InfoTooltip label={t.slaMonitorTitle} explanation={t.slaTip} />
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "ALL", label: `${t.allTab} (${calls.length})` },
            { key: "GREEN", label: `${t.greenTab} (${greenCount})` },
            { key: "YELLOW", label: `${t.yellowTab} (${yellowCount})` },
            { key: "RED", label: `${t.redTab} (${redCount})` },
            { key: "COMPLETED", label: `${t.verifiedTab} (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSlaFilter(tab.key)}
              className={`min-h-[38px] rounded-full px-3.5 py-1.5 text-xs font-semibold active:scale-[0.98] transition-all ${
                slaFilter === tab.key
                  ? "bg-[#1D6CE0] text-white shadow-xs"
                  : "bg-[#F6F9FC] dark:bg-[#16272B] text-slate-600 dark:text-slate-300 border border-[#E3ECF3] dark:border-[#1E353A] hover:border-[#2585F5]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#E3ECF3] dark:border-[#1E353A] text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <th className="py-3 pr-3 font-semibold">{t.colPatient}</th>
              <th className="py-3 pr-3 font-semibold">{t.colDoctor}</th>
              <th className="py-3 pr-3 font-semibold">{t.colNote}</th>
              <th className="py-3 pr-3 font-semibold">{t.colTimer}</th>
              <th className="py-3 font-semibold text-right">
                <InfoTooltip label={t.colFhir} explanation={t.fhirTip} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3ECF3]/80 dark:divide-[#1E353A]">
            {filteredCalls.map((call) => {
              const ehrList = call.patient?.ehrRecords ?? [];
              const latestEhr = ehrList[ehrList.length - 1];
              return (
                <tr
                  key={call.id}
                  className="hover:bg-[#F6F9FC]/70 dark:hover:bg-[#132529]/60 transition-colors"
                >
                  <td className="py-3.5 pr-3">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {call.patient.fullName}
                    </p>
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {call.patient.jshshirMasked} • {call.district}
                    </p>
                  </td>
                  <td className="py-3.5 pr-3">
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {call.assignedDoctor.fullName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {call.polyclinicName}
                    </p>
                  </td>
                  <td className="py-3.5 pr-3 max-w-xs">
                    <span className="inline-block rounded-lg px-2.5 py-1 text-xs font-mono bg-[#F6F9FC] dark:bg-[#16272B] text-slate-700 dark:text-slate-200 border border-[#E3ECF3] dark:border-[#1E353A]">
                      {latestEhr?.diagnosisText ?? "—"}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3">
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
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setFhirCallId(call.id)}
                      className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#16272B] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#2585F5] hover:text-[#1D6CE0] active:scale-[0.98] transition-all"
                    >
                      <IconFileCode className="h-4 w-4 text-[#1D6CE0] dark:text-sky-300" />
                      FHIR
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && filteredCalls.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t.noCalls}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderRbacBadge = (
    <div className="inline-flex h-11 items-center gap-2 rounded-full bg-white dark:bg-[#101E21] border border-[#E3ECF3] dark:border-[#1E353A] px-4 text-xs sm:text-sm font-semibold text-[#1D6CE0] dark:text-sky-300 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <IconLock className="h-4 w-4 shrink-0" />
      <InfoTooltip label={t.rbacBadge} explanation={t.rbacTip} />
    </div>
  );

  return (
    <div className="space-y-6 oc-fade-up">
      <StaffWelcomeHeader
        greeting={`${t.welcomePrefix} ${authUser?.fullName || "Coordinator"}`}
        dateLabel={dateLabel}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t.searchPlaceholder}
        rightSlot={renderRbacBadge}
      />

      {activeView === "dashboard" && (
        <div className="space-y-6">
          {/* 4 KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StaffKpiCard
              tone="blue"
              icon={<IconUsers className="h-5 w-5" />}
              label={t.kpiPatients}
              value={patients.length}
              sublabel={t.kpiPatientsSub}
              onClick={() => setActiveView("patients")}
            />
            <StaffKpiCard
              tone="green"
              icon={<IconCalendarEvent className="h-5 w-5" />}
              label={t.kpiVisits}
              value={calls.length}
              sublabel={t.kpiVisitsSub}
              onClick={() => setActiveView("visits")}
            />
            <StaffKpiCard
              tone="amber"
              icon={<IconStethoscope className="h-5 w-5" />}
              label={t.kpiDoctors}
              value={doctors.length}
              sublabel={t.kpiDoctorsSub}
              onClick={() => setActiveView("doctors")}
            />
            <StaffKpiCard
              tone="red"
              icon={<IconAlertTriangle className="h-5 w-5" />}
              label={t.kpiAlerts}
              value={redCount + pendingVerifications}
              sublabel={t.kpiAlertsSub}
              onClick={() => setActiveView("visits")}
            />
          </div>

          {/* Pending Verifications Alert Strip */}
          {pendingVerifications > 0 && (
            <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/85 dark:bg-amber-950/35 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                  <IconUserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    {t.verifTitle}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                    {pendingVerifications} {t.verifPendingDesc}
                  </p>
                </div>
              </div>
              <Link
                href="/admin/verifications"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#1D6CE0] hover:bg-[#1758BA] px-5 py-2.5 text-sm font-bold text-white shadow-xs active:scale-[0.98] transition-all whitespace-nowrap"
              >
                {t.verifBtn}
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* 2-Card Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <TrendsAreaChart
                title={t.trendTitle}
                subtitle={t.trendSub}
                series={trendSeries}
              />
            </div>
            <div className="lg:col-span-5">
              <DistributionDonutChart
                title={t.donutTitle}
                centerValue={calls.length > 0 ? "100%" : "0"}
                centerLabel={t.donutCenter}
                segments={donutSegments}
              />
            </div>
          </div>

          {renderSlaTable()}
        </div>
      )}

      {activeView === "visits" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StaffKpiCard
              tone="green"
              icon={<IconCircleCheck className="h-5 w-5" />}
              label={t.greenCard}
              value={greenCount}
              onClick={() => setSlaFilter("GREEN")}
            />
            <StaffKpiCard
              tone="amber"
              icon={<IconClock className="h-5 w-5" />}
              label={t.yellowCard}
              value={yellowCount}
              onClick={() => setSlaFilter("YELLOW")}
            />
            <StaffKpiCard
              tone="red"
              icon={<IconAlertTriangle className="h-5 w-5" />}
              label={t.redCard}
              value={redCount}
              onClick={() => setSlaFilter("RED")}
            />
            <StaffKpiCard
              tone="blue"
              icon={<IconUserCheck className="h-5 w-5" />}
              label={t.verifiedCard}
              value={completedCount}
              onClick={() => setSlaFilter("COMPLETED")}
            />
          </div>
          {renderSlaTable()}
        </div>
      )}

      {activeView === "patients" && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
            <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <IconBed className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
              {t.bedTitle} ({filteredPatients.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPatients.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-4 text-sm"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{p.fullName}</p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {p.bedNumber ? p.bedNumber : t.bedReleased} • {p.district}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold shrink-0 ${
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

          <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <IconMapPin className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
                {t.complaintsMonitorTitle} ({filteredComplaints.length})
              </h2>
              <button
                type="button"
                disabled={remindingId === "BATCH"}
                onClick={() => handleRemindDoctor(null)}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#1D6CE0] px-4 py-2 text-sm font-bold text-white hover:bg-[#1758BA] active:scale-[0.98] disabled:opacity-50 transition-all"
              >
                <IconBell className="h-4 w-4" />
                {remindingId === "BATCH" ? "..." : t.remindAllBtn}
              </button>
            </div>

            {filteredComplaints.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-3">{t.complaintsEmpty}</p>
            ) : (
              <div className="space-y-2.5">
                {filteredComplaints.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-4 text-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {c.patient?.fullName}
                        </span>
                        <span className="rounded-full bg-white dark:bg-[#16272B] border border-[#E3ECF3] dark:border-[#1E353A] px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                          {c.category} • {c.severity}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            c.status === "VERIFIED_COMPLETED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {c.visitDestination}: {c.visitAddress}
                        {typeof c.distanceKm === "number" ? ` • ${c.distanceKm} km` : ""}
                        {c.assignedDoctor ? ` • Dr. ${c.assignedDoctor.fullName}` : ""}
                      </p>
                    </div>
                    {c.assignedDoctorId && (
                      <button
                        type="button"
                        disabled={remindingId === c.assignedDoctorId}
                        onClick={() => handleRemindDoctor(c.assignedDoctorId)}
                        className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#CFE3FB] dark:border-sky-800 bg-[#EBF4FF] dark:bg-sky-950/60 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#1D6CE0] dark:text-sky-300 hover:bg-sky-100 active:scale-[0.98] transition-all shrink-0"
                      >
                        <IconBrandTelegram className="h-4 w-4" />
                        {remindingId === c.assignedDoctorId ? "..." : t.remindOneBtn}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {activeView === "doctors" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3.5">
            <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <IconMapPin className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
              {t.routingTitle}
            </h2>
            <div className="space-y-2.5">
              {filteredDoctors.map((doc) => {
                const openSlots = doc.scheduleSlots.filter((s) => !s.bookedPatientId).length;
                const bookedSlots = doc.scheduleSlots.length - openSlots;
                return (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-3.5 text-sm flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{doc.fullName}</p>
                      <p className="text-slate-600 dark:text-slate-300">{doc.polyclinicName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t.districtsLabel} {doc.district} • {doc.telegramHandle}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block rounded-xl bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {openSlots} {t.slotsOpen} / {bookedSlots} {t.slotsBooked}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3.5">
            <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <IconPackage className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
              {t.pharmacyTitle}
            </h2>
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto">
              {filteredPatients.flatMap((p) =>
                p.prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-3.5 text-sm"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {rx.medicationName} ({rx.dosage})
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                        {rx.polyclinicPharmacy} • {t.patientLabel} {p.fullName}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold shrink-0 ${
                        rx.pharmacyStockStatus === "IN_STOCK"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                          : rx.pharmacyStockStatus === "RESERVED"
                            ? "bg-sky-100 text-[#1D6CE0] dark:bg-sky-950/70 dark:text-sky-300"
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
        </div>
      )}

      {activeView === "reports" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <IconReceipt className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
                  {t.billingTitle}
                </h2>
                <span className="text-xs font-bold text-[#1D6CE0] dark:text-sky-300 bg-[#EBF4FF] dark:bg-sky-950/60 px-3 py-1 rounded-full border border-[#CFE3FB] dark:border-sky-800">
                  {t.stateCoveredLabel} {totalStateCovered.toLocaleString()} UZS
                </span>
              </div>
              <div className="space-y-2.5">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-3.5 text-sm"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{inv.description}</p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                        {inv.patient.fullName} • {inv.packageName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-slate-900 dark:text-white">
                        {inv.amountUzs.toLocaleString()} UZS
                      </p>
                      <p
                        className={`text-xs font-bold ${
                          inv.category === "STATE_GRANT"
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-slate-500 dark:text-slate-400"
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
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {t.optionalDiagLabel}{" "}
                <strong className="text-slate-800 dark:text-white">
                  {totalPatientPaid.toLocaleString()} UZS
                </strong>
              </p>
            </section>

            <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3.5">
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <IconCrown className="h-5 w-5 text-amber-500" />
                {t.subsTitle} ({subscriptions.length})
              </h2>
              {subscriptions.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-3">{t.subsEmpty}</p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-3.5 text-sm"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {sub.user?.fullName || sub.userId} ({sub.targetRole})
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                          {sub.planName} • {sub.paymentMethod}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-slate-900 dark:text-white">
                          {Number(sub.priceUzs || 0).toLocaleString()} UZS
                        </p>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3.5">
            <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <IconShieldCheck className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
              {t.auditTitle}
            </h2>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E3ECF3] dark:border-[#1E353A] text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="py-2.5 pr-3 font-semibold">{t.colTime}</th>
                    <th className="py-2.5 pr-3 font-semibold">{t.colAction}</th>
                    <th className="py-2.5 pr-3 font-semibold">{t.colActor}</th>
                    <th className="py-2.5 pr-3 font-semibold">{t.colResource}</th>
                    <th className="py-2.5 font-semibold">{t.colDetails}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3ECF3]/80 dark:divide-[#1E353A] font-mono text-xs">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2.5 pr-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("en-GB", {
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-bold ${
                            log.action === "SLA_ESCALATED" ||
                            log.action === "SYMPTOM_ALERT" ||
                            log.action === "RBAC_DENIED"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300"
                              : log.action === "VISIT_VERIFIED"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                                : "bg-[#F6F9FC] text-slate-800 dark:bg-[#16272B] dark:text-slate-200"
                          }`}
                        >
                          {log.action === "SLA_ESCALATED" && (
                            <IconAlertTriangle className="h-3.5 w-3.5" />
                          )}
                          {log.action === "VISIT_VERIFIED" && (
                            <IconCircleCheck className="h-3.5 w-3.5" />
                          )}
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 font-sans text-sm text-slate-800 dark:text-slate-100">
                        {log.actorName}{" "}
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ({log.actorRole})
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-300">
                        {log.resourceType}:{log.resourceId.slice(-8)}
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {log.detailsJson}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeView === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <IconBrandTelegram className="h-5 w-5 text-[#1D6CE0]" />
                {t.tgControlTitle}
              </h2>
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                  tgStatus?.configured
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                }`}
              >
                {tgStatus?.configured ? t.tgConfiguredBadge : t.tgSimBadge}
              </span>
            </div>

            <form onSubmit={handleSaveTelegram} className="space-y-3">
              <input
                type="password"
                value={tgToken}
                onChange={(e) => setTgToken(e.target.value)}
                placeholder={t.tgTokenPlaceholder}
                aria-label={t.tgTokenPlaceholder}
                className="w-full min-h-[46px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2.5 font-mono text-base sm:text-sm text-slate-900 dark:text-white focus:border-[#2585F5] focus:outline-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={tgUsername}
                  onChange={(e) => setTgUsername(e.target.value)}
                  placeholder={t.tgUserPlaceholder}
                  aria-label={t.tgUserPlaceholder}
                  className="min-h-[46px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white focus:border-[#2585F5] focus:outline-none"
                />
                <input
                  type="url"
                  value={tgWebhookUrl}
                  onChange={(e) => setTgWebhookUrl(e.target.value)}
                  placeholder={t.tgWebhookPlaceholder}
                  aria-label={t.tgWebhookPlaceholder}
                  className="min-h-[46px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2.5 font-mono text-base sm:text-sm text-slate-900 dark:text-white focus:border-[#2585F5] focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="submit"
                  disabled={savingTg}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#1D6CE0] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1758BA] active:scale-[0.98] disabled:opacity-50 transition-all"
                >
                  <IconSend className="h-4 w-4" />
                  {savingTg ? "..." : t.tgSaveBtn}
                </button>
                <Link
                  href="/telegram"
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#16272B] px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-[#2585F5] active:scale-[0.98] transition-all"
                >
                  {t.tgConsoleBtn}
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3">
            <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <IconShieldCheck className="h-5 w-5 text-[#1D6CE0]" />
              {t.rbacBadge}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.rbacTip}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.subtitle}
            </p>
          </section>
        </div>
      )}

      <FhirBundleModal activeCallId={fhirCallId} onClose={() => setFhirCallId(null)} />
    </div>
  );
}
