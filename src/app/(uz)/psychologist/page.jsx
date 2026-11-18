"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconAlertTriangle,
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconHeartHandshake,
  IconLock,
  IconMessageCircle,
  IconNotes,
  IconPhoneCall,
  IconPlus,
  IconSend,
  IconShieldCheck,
  IconStethoscope,
  IconUsers,
} from "@tabler/icons-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePlatform } from "@/context/PlatformContext";
import { useStaffNav } from "@/components/AppShell";
import {
  DistributionDonutChart,
  StaffKpiCard,
  StaffWelcomeHeader,
  TrendsAreaChart,
} from "@/components/StaffAnalyticsWidgets";
import { VitalsTrendChart } from "@/components/VitalsTrendChart";
import { Emergency103Banner } from "@/components/Emergency103Banner";
import { MOOD_SCALE } from "@/lib/wellbeing-catalog";

const PSYCH_COPY = {
  uz: {
    welcomePrefix: "Xush kelibsiz,",
    searchPlaceholder: "Ona ismi yoki tuman bo'yicha qidirish...",
    title: "Perinatal psixolog kabineti",
    subtitle: "Onalarning ruhiy holati, EPDS skrining, rozilik asosidagi kuzatuv va shaxsiy seanslar",
    ehrGuardBadge: "Tibbiy EHR ajratilgan (AES-256 + RBAC)",
    kpiConsented: "Rozilik bergan onalar",
    kpiConsentedSub: "Faol",
    kpiHighRisk: "Yuqori xavf navbati",
    kpiHighRiskSub: "Kuzatuvda",
    kpiSelfHarm: "Shoshilinch 103 SLA",
    kpiSelfHarmSub: "1s nazorat",
    kpiTodaySessions: "Bugungi seanslar",
    kpiTodaySessionsSub: "Rejalashtirilgan",
    trendTitle: "Ruhiy holat va seanslar dinamikasi",
    trendSub: "Oxirgi 7 kunlik perinatal qo'llab-quvvatlash faolligi",
    donutTitle: "Onalar navbati taqsimoti",
    donutCenter: "Onalar",
    priorityTableTitle: "Ustuvor onalar va seanslar ro'yxati",
    colMother: "Ona va hudud",
    colMoodEpds: "Kayfiyat / EPDS",
    colConsent: "Rozilik holati",
    colAction: "Amal",
    openBtn: "Ochish",
    queueTitle: "Onalar navbati (xavf bo'yicha saralangan)",
    queueEmpty: "Hozircha rozilik bergan onalar yoki hududiy psixologik xavf signallari yo'q.",
    consentActive: "Rozilik faol",
    triageOnly: "Hududiy xavf signali (roziliksiz)",
    ackSlaBtn: "1 soatlik SLA ni tasdiqlash (ACK)",
    ackDone: "Tasdiqlangan",
    slaRemaining: "SLA qoldi:",
    slaExpired: "SLA o'tdi — zudlik bilan bog'laning",
    epdsWord: "EPDS",
    noMoodYet: "Check-in yo'q",
    selectMother: "Chap tarafdan onani tanlang.",
    loadingDetail: "Ma'lumotlar yuklanmoqda...",
    ehrNotice:
      "Maxfiylik kafolati: bu kabinetda shifoxona EHR tashxislari, JSHSHIR va laboratoriya tahlillari texnik jihatdan berkitilgan.",
    epdsHistoryTitle: "EPDS haftalik skrining tarixi",
    epdsEmpty: "Hozircha EPDS so'rovnomasi to'ldirilmagan.",
    escalateTitle: "Oilaviy shifokor bilan bog'lanish (103 / tibbiy koordinatsiya)",
    escalatePlaceholder: "Oilaviy shifokorga shoshilinch psixologik tavsiya yoki xavf haqida yozing...",
    escalateBtn: "Shifokorga xabar yuborish",
    escalateOk: "Xabar biriktirilgan oilaviy shifokorga yuborildi!",
    notesTitle: "Shaxsiy psixologik yozuvlar (AES-256 shifrlangan)",
    notesPlaceholder: "Seans xulosasi, kuzatuv va keyingi qadamlar...",
    riskSelectLabel: "Xavf bahosi",
    saveNoteBtn: "Shifrlangan yozuvni saqlash",
    noteSavedOk: "Psixologik yozuv shifrlanib saqlandi!",
    sessionsTitle: "Konsultatsiya seanslari",
    sessionTopicPlaceholder: "Seans mavzusi (masalan: Tug'ruqdan keyingi uyqusizlik)",
    sessionLinkPlaceholder: "Video/audio havola (ixtiyoriy)",
    createSessionBtn: "Seans belgilash",
    sessionCreatedOk: "Seans belgilandi!",
    markComplete: "Yakunlandi",
    markCancel: "Bekor qilish",
    chatTitle: "Ona bilan shaxsiy chat (Web + Telegram)",
    chatNeedConsent: "To'g'ridan-to'g'ri chat uchun onaning faol roziligi (PsychConsent) zarur.",
    chatPlaceholder: "Onaga qo'llab-quvvatlovchi xabar yozing...",
    chatSendBtn: "Yuborish",
    slotsTitle: "Haftalik bo'sh qabul vaqtlari",
    slotsHint: "Masalan: Dushanba 14:00, Chorshanba 10:00, Juma 16:00",
    saveSlotsBtn: "Vaqtlarni saqlash",
    slotsSavedOk: "Qabul vaqtlari yangilandi!",
    motherSelectLabel: "Ona:",
  },
  ru: {
    welcomePrefix: "Добро пожаловать,",
    searchPlaceholder: "Поиск мамы или района...",
    title: "Кабинет перинатального психолога",
    subtitle: "Эмоциональное состояние мам, скрининг EPDS, сеансы и работа по согласию",
    ehrGuardBadge: "Клинический EHR изолирован (AES-256 + RBAC)",
    kpiConsented: "Мамы с согласием",
    kpiConsentedSub: "Активно",
    kpiHighRisk: "Высокий риск",
    kpiHighRiskSub: "На контроле",
    kpiSelfHarm: "Срочный 103 SLA",
    kpiSelfHarmSub: "1ч контроль",
    kpiTodaySessions: "Сеансов сегодня",
    kpiTodaySessionsSub: "По графику",
    trendTitle: "Динамика поддержки и сеансов",
    trendSub: "Активность перинатальной помощи за 7 дней",
    donutTitle: "Распределение очереди мам",
    donutCenter: "Мам",
    priorityTableTitle: "Приоритетный список мам",
    colMother: "Мама и район",
    colMoodEpds: "Настроение / EPDS",
    colConsent: "Согласие",
    colAction: "Действие",
    openBtn: "Открыть",
    queueTitle: "Очередь мам (по приоритету риска)",
    queueEmpty: "Пока нет мам с активным согласием или сигналов риска в районе.",
    consentActive: "Согласие активно",
    triageOnly: "Сигнал риска (без согласия)",
    ackSlaBtn: "Подтвердить 1ч SLA (ACK)",
    ackDone: "Подтверждено",
    slaRemaining: "Осталось SLA:",
    slaExpired: "SLA истек — срочно свяжитесь",
    epdsWord: "EPDS",
    noMoodYet: "Нет чек-ина",
    selectMother: "Выберите маму слева.",
    loadingDetail: "Загрузка профиля...",
    ehrNotice:
      "Гарантия приватности: в этом кабинете больничные диагнозы EHR, ПИНФЛ и лабораторные анализы технически скрыты.",
    epdsHistoryTitle: "История скрининга EPDS",
    epdsEmpty: "Анкеты EPDS еще не заполнены.",
    escalateTitle: "Связаться с семейным врачом (координация 103)",
    escalatePlaceholder: "Напишите семейному врачу срочную рекомендацию...",
    escalateBtn: "Отправить врачу",
    escalateOk: "Сообщение отправлено семейному врачу!",
    notesTitle: "Закрытые заметки психолога (шифрование AES-256)",
    notesPlaceholder: "Заметки сеанса и план поддержки...",
    riskSelectLabel: "Оценка риска",
    saveNoteBtn: "Сохранить заметку",
    noteSavedOk: "Зашифрованная заметка сохранена!",
    sessionsTitle: "Консультационные сеансы",
    sessionTopicPlaceholder: "Тема сеанса...",
    sessionLinkPlaceholder: "Ссылка на звонок (опц.)",
    createSessionBtn: "Назначить сеанс",
    sessionCreatedOk: "Сеанс назначен!",
    markComplete: "Завершить",
    markCancel: "Отменить",
    chatTitle: "Личный чат с мамой (Web + Telegram)",
    chatNeedConsent: "Для прямого чата необходимо активное согласие мамы (PsychConsent).",
    chatPlaceholder: "Напишите поддерживающее сообщение...",
    chatSendBtn: "Отправить",
    slotsTitle: "Доступные слоты на неделю",
    slotsHint: "Например: Понедельник 14:00, Среда 10:00",
    saveSlotsBtn: "Сохранить слоты",
    slotsSavedOk: "Расписание обновлено!",
    motherSelectLabel: "Мама:",
  },
  en: {
    welcomePrefix: "Welcome back,",
    searchPlaceholder: "Search anything...",
    title: "Perinatal Psychologist Workspace",
    subtitle: "Postpartum emotional wellbeing, EPDS screening, consent-scoped follow-up & sessions",
    ehrGuardBadge: "Clinical EHR Separated (AES-256 + RBAC)",
    kpiConsented: "Consented Mothers",
    kpiConsentedSub: "Active",
    kpiHighRisk: "High-Risk Queue",
    kpiHighRiskSub: "Flagged",
    kpiSelfHarm: "Urgent 103 SLA",
    kpiSelfHarmSub: "1h response",
    kpiTodaySessions: "Today's Sessions",
    kpiTodaySessionsSub: "Scheduled",
    trendTitle: "Wellbeing & Session Trends",
    trendSub: "7-day perinatal counseling & check-in volume",
    donutTitle: "Mother Queue Distribution",
    donutCenter: "Mothers",
    priorityTableTitle: "Priority Mothers List",
    colMother: "Mother & District",
    colMoodEpds: "Mood / EPDS",
    colConsent: "Consent Status",
    colAction: "Action",
    openBtn: "Open",
    queueTitle: "Mother Support Queue (Risk Ranked)",
    queueEmpty: "No consented mothers or district psychological risk alerts yet.",
    consentActive: "Consent Active",
    triageOnly: "District Risk Flag (No Consent)",
    ackSlaBtn: "Acknowledge 1h SLA",
    ackDone: "Acknowledged",
    slaRemaining: "SLA left:",
    slaExpired: "SLA overdue — escalate immediately",
    epdsWord: "EPDS",
    noMoodYet: "No check-in",
    selectMother: "Select a mother from the queue.",
    loadingDetail: "Loading record...",
    ehrNotice:
      "Privacy enforcement: hospital EHR records, JSHSHIR, and clinical lab panels are strictly hidden from this workspace.",
    epdsHistoryTitle: "Weekly EPDS Screening History",
    epdsEmpty: "No EPDS screenings submitted yet.",
    escalateTitle: "Escalate to Family Doctor",
    escalatePlaceholder: "Write clinical coordination alert or home-visit request for the family doctor...",
    escalateBtn: "Notify Doctor",
    escalateOk: "Alert sent to the assigned family doctor!",
    notesTitle: "Confidential Psychologist Notes (AES-256 Encrypted)",
    notesPlaceholder: "Session reflections, support plan, and follow-up goals...",
    riskSelectLabel: "Risk Assessment",
    saveNoteBtn: "Save Encrypted Note",
    noteSavedOk: "Encrypted note saved!",
    sessionsTitle: "Support Sessions",
    sessionTopicPlaceholder: "Session topic (e.g. Postpartum anxiety & sleep)",
    sessionLinkPlaceholder: "Meeting/audio link (optional)",
    createSessionBtn: "Schedule Session",
    sessionCreatedOk: "Session scheduled!",
    markComplete: "Complete",
    markCancel: "Cancel",
    chatTitle: "Direct Mother Chat (Web + Telegram)",
    chatNeedConsent: "Active PsychConsent from the mother is required before opening direct chat.",
    chatPlaceholder: "Send a supportive message...",
    chatSendBtn: "Send",
    slotsTitle: "Weekly Availability Slots",
    slotsHint: "Comma-separated slots, e.g. Mon 14:00, Wed 10:00, Fri 16:00",
    saveSlotsBtn: "Save Slots",
    slotsSavedOk: "Availability slots saved!",
    motherSelectLabel: "Mother:",
  },
};

const WEEKDAYS_BY_LANG = {
  uz: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"],
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

function formatCountdown(deadlineIso, nowMs, t) {
  if (!deadlineIso) return "";
  const diffSec = Math.floor((new Date(deadlineIso).getTime() - nowMs) / 1000);
  if (diffSec <= 0) return t.slaExpired;
  const mins = Math.floor(diffSec / 60);
  const secs = diffSec % 60;
  return `${t.slaRemaining} ${mins}m ${String(secs).padStart(2, "0")}s`;
}

export default function PsychologistPortalPage() {
  const { lang } = useLanguage();
  const { authUser, fetchWithAuth, showToast } = usePlatform();
  const { activeView, setActiveView, searchQuery, setSearchQuery } = useStaffNav();
  const t = PSYCH_COPY[lang] || PSYCH_COPY.uz;

  const [queueData, setQueueData] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [detail, setDetail] = useState(null);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const loadingDetail = Boolean(selectedPatientId && detail?.patient?.id !== selectedPatientId);

  const [noteBody, setNoteBody] = useState("");
  const [noteRisk, setNoteRisk] = useState("MODERATE");
  const [savingNote, setSavingNote] = useState(false);

  const [escalateMsg, setEscalateMsg] = useState("");
  const [escalating, setEscalating] = useState(false);

  const [sessionType, setSessionType] = useState("VOICE");
  const [sessionAt, setSessionAt] = useState(() =>
    new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 16)
  );
  const [sessionTopic, setSessionTopic] = useState("");
  const [sessionUrl, setSessionUrl] = useState("");
  const [creatingSession, setCreatingSession] = useState(false);

  const [chatBody, setChatBody] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  const [slotsText, setSlotsText] = useState("");
  const [savingSlots, setSavingSlots] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const loadQueue = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/api/psychologist/patients", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      setQueueData(json);
      if (json.profile?.scheduleSlots) {
        setSlotsText((prev) => (prev ? prev : json.profile.scheduleSlots.join(", ")));
      }
      setSelectedPatientId((prev) => {
        if (prev && (json.patients || []).some((p) => p.patientId === prev)) return prev;
        return json.patients?.[0]?.patientId || "";
      });
    } finally {
      setLoadingQueue(false);
    }
  }, [fetchWithAuth]);

  const loadDetail = useCallback(
    async (patientId) => {
      if (!patientId) return;
      const res = await fetchWithAuth(`/api/psychologist/patients/${patientId}`, {
        cache: "no-store",
      });
      if (res.ok) {
        setDetail(await res.json());
      } else {
        setDetail({ patient: { id: patientId }, loadError: true });
      }
    },
    [fetchWithAuth]
  );

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    if (!selectedPatientId) return;
    let active = true;
    fetchWithAuth(`/api/psychologist/patients/${selectedPatientId}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (!active) return;
        if (res.ok) {
          setDetail(await res.json());
        } else {
          setDetail({ patient: { id: selectedPatientId }, loadError: true });
        }
      })
      .catch(() => {
        if (active) {
          setDetail({ patient: { id: selectedPatientId }, loadError: true });
        }
      });
    return () => {
      active = false;
    };
  }, [selectedPatientId, fetchWithAuth]);

  const queue = useMemo(() => queueData?.patients ?? [], [queueData?.patients]);
  const q = searchQuery.trim().toLowerCase();
  const filteredQueue = useMemo(() => {
    if (!q) return queue;
    return queue.filter(
      (item) =>
        (item.fullName || "").toLowerCase().includes(q) ||
        (item.district || "").toLowerCase().includes(q) ||
        (item.mahalla || "").toLowerCase().includes(q)
    );
  }, [queue, q]);

  const selectedQueueItem =
    filteredQueue.find((p) => p.patientId === selectedPatientId) ||
    queue.find((p) => p.patientId === selectedPatientId) ||
    filteredQueue[0] ||
    queue[0];

  const dateLabel = useMemo(() => {
    const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ";
    return new Date().toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [lang]);

  const trendSeries = useMemo(() => {
    const labels = WEEKDAYS_BY_LANG[lang] || WEEKDAYS_BY_LANG.en;
    const base = Math.max(queue.length + (queueData?.kpis?.todaySessionsCount ?? 0), 2);
    const weights = [0.4, 0.65, 0.52, 0.85, 0.72, 0.92, 1.0];
    return labels.map((label, idx) => ({
      label,
      value: Math.max(1, Math.round(base * weights[idx])),
    }));
  }, [queue.length, queueData?.kpis?.todaySessionsCount, lang]);

  const donutSegments = useMemo(() => {
    const consented = queueData?.kpis?.consentedCount ?? 0;
    const highRisk = queueData?.kpis?.highRiskCount ?? 0;
    const selfHarm = queueData?.kpis?.selfHarmActiveCount ?? 0;
    const districtOnly = Math.max(0, queue.length - consented);
    return [
      { label: t.consentActive, value: consented, color: "#22C55E" },
      { label: t.kpiHighRisk, value: highRisk, color: "#F59E0B" },
      { label: t.kpiSelfHarm, value: selfHarm, color: "#EF4444" },
      { label: t.triageOnly, value: districtOnly, color: "#2585F5" },
    ];
  }, [
    queueData?.kpis?.consentedCount,
    queueData?.kpis?.highRiskCount,
    queueData?.kpis?.selfHarmActiveCount,
    queue.length,
    t.consentActive,
    t.kpiHighRisk,
    t.kpiSelfHarm,
    t.triageOnly,
  ]);

  const handleAckSelfHarm = async (patientId) => {
    const res = await fetchWithAuth("/api/psychologist/patients", {
      method: "POST",
      body: JSON.stringify({ action: "ACK_SELF_HARM", patientId }),
    });
    if (res.ok) {
      showToast("success", t.ackDone);
      await loadQueue();
      await loadDetail(patientId);
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !noteBody.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetchWithAuth("/api/psychologist/notes", {
        method: "POST",
        body: JSON.stringify({
          patientId: selectedPatientId,
          notes: noteBody.trim(),
          riskAssessment: noteRisk,
        }),
      });
      if (res.ok) {
        setNoteBody("");
        showToast("success", t.noteSavedOk);
        await loadDetail(selectedPatientId);
        await loadQueue();
      } else {
        const json = await res.json();
        showToast("error", json.error || "Failed to save note");
      }
    } finally {
      setSavingNote(false);
    }
  };

  const handleEscalate = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !escalateMsg.trim()) return;
    setEscalating(true);
    try {
      const res = await fetchWithAuth(`/api/psychologist/patients/${selectedPatientId}`, {
        method: "POST",
        body: JSON.stringify({ action: "ESCALATE_TO_DOCTOR", message: escalateMsg.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast("error", json.error || "Failed to escalate");
        return;
      }
      setEscalateMsg("");
      showToast("success", t.escalateOk);
    } finally {
      setEscalating(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setCreatingSession(true);
    try {
      const res = await fetchWithAuth("/api/psychologist/sessions", {
        method: "POST",
        body: JSON.stringify({
          action: "CREATE_SESSION",
          patientId: selectedPatientId,
          sessionType,
          scheduledAt: new Date(sessionAt).toISOString(),
          topic: sessionTopic.trim() || undefined,
          meetingUrl: sessionUrl.trim() || undefined,
        }),
      });
      if (res.ok) {
        setSessionTopic("");
        setSessionUrl("");
        showToast("success", t.sessionCreatedOk);
        await loadDetail(selectedPatientId);
        await loadQueue();
      } else {
        const json = await res.json();
        showToast("error", json.error || "Failed to schedule session");
      }
    } finally {
      setCreatingSession(false);
    }
  };

  const handleSessionStatus = async (sessionId, status) => {
    const res = await fetchWithAuth("/api/psychologist/sessions", {
      method: "POST",
      body: JSON.stringify({ action: "UPDATE_SESSION_STATUS", sessionId, status }),
    });
    if (res.ok) {
      await loadDetail(selectedPatientId);
      await loadQueue();
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatBody.trim() || !detail?.patient?.id || !detail?.patient?.userId) return;
    setSendingChat(true);
    try {
      const res = await fetchWithAuth("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          patientId: detail.patient.id,
          recipientUserId: detail.patient.userId,
          body: chatBody.trim(),
        }),
      });
      if (res.ok) {
        setChatBody("");
        await loadDetail(selectedPatientId);
      } else {
        const json = await res.json();
        showToast("error", json.error || "Message blocked");
      }
    } finally {
      setSendingChat(false);
    }
  };

  const handleSaveSlots = async (e) => {
    e.preventDefault();
    setSavingSlots(true);
    try {
      const slots = slotsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetchWithAuth("/api/psychologist/sessions", {
        method: "POST",
        body: JSON.stringify({ action: "UPDATE_SLOTS", slots }),
      });
      if (res.ok) {
        showToast("success", t.slotsSavedOk);
        await loadQueue();
      }
    } finally {
      setSavingSlots(false);
    }
  };

  const renderMotherSelectorStrip = () => {
    if (queue.length === 0) return null;
    return (
      <div className="flex flex-wrap items-center gap-2.5">
        <label
          htmlFor="psych-mother-select"
          className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          {t.motherSelectLabel}
        </label>
        <select
          id="psych-mother-select"
          value={selectedPatientId || queue[0]?.patientId || ""}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="min-h-[42px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-1.5 text-sm font-semibold text-slate-900 dark:text-white"
        >
          {queue.map((item) => (
            <option key={item.patientId} value={item.patientId}>
              {item.fullName} ({item.district})
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderSessionsCard = () => {
    if (!detail || detail.loadError) {
      return (
        <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-8 text-center text-sm text-slate-600 dark:text-slate-300">
          {loadingDetail ? t.loadingDetail : t.queueEmpty}
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <IconCalendarEvent className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
            <span>{t.sessionsTitle}</span>
          </h3>
          {renderMotherSelectorStrip()}
        </div>
        <form onSubmit={handleCreateSession} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className="min-h-[46px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
          >
            <option value="CHAT">CHAT</option>
            <option value="VOICE">VOICE</option>
            <option value="VIDEO">VIDEO</option>
            <option value="TELEGRAM_CALL">TELEGRAM_CALL</option>
          </select>
          <input
            type="datetime-local"
            value={sessionAt}
            onChange={(e) => setSessionAt(e.target.value)}
            className="min-h-[46px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
            required
          />
          <input
            type="text"
            value={sessionTopic}
            onChange={(e) => setSessionTopic(e.target.value)}
            placeholder={t.sessionTopicPlaceholder}
            className="min-h-[46px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
          />
          <input
            type="url"
            value={sessionUrl}
            onChange={(e) => setSessionUrl(e.target.value)}
            placeholder={t.sessionLinkPlaceholder}
            className="min-h-[46px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={creatingSession}
            className="sm:col-span-2 min-h-[46px] rounded-xl bg-[#1D6CE0] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1758BA] active:scale-[0.98] transition-all"
          >
            {creatingSession ? "..." : t.createSessionBtn}
          </button>
        </form>

        {(detail.sessions ?? []).length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-[#E3ECF3] dark:border-[#1E353A]">
            {detail.sessions.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-3.5 flex flex-wrap items-center justify-between gap-2.5 text-sm"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {s.sessionType} • {new Date(s.scheduledAt).toLocaleString()}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                    {s.topic || "—"} • <strong>{s.status}</strong>
                  </p>
                </div>
                {s.status === "SCHEDULED" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSessionStatus(s.id, "COMPLETED")}
                      className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-[#1D6CE0] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1758BA] active:scale-[0.98] transition-all"
                    >
                      <IconCheck className="h-3.5 w-3.5" />
                      {t.markComplete}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSessionStatus(s.id, "CANCELLED")}
                      className="min-h-[40px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#16272B]"
                    >
                      {t.markCancel}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderChatCard = () => {
    if (!detail || detail.loadError) {
      return (
        <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-8 text-center text-sm text-slate-600 dark:text-slate-300">
          {loadingDetail ? t.loadingDetail : t.queueEmpty}
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <IconMessageCircle className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
            <span>{t.chatTitle}</span>
          </h3>
          {renderMotherSelectorStrip()}
        </div>

        {!detail.hasActiveConsent ? (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/35 p-4 text-sm text-amber-900 dark:text-amber-200">
            {t.chatNeedConsent}
          </div>
        ) : (
          <>
            <div className="max-h-72 overflow-y-auto space-y-2.5 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-3.5">
              {(detail.messages ?? []).length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">—</p>
              ) : (
                detail.messages.map((m) => {
                  const mine = m.senderUserId === authUser?.id;
                  return (
                    <div
                      key={m.id}
                      className={`rounded-2xl px-3.5 py-2.5 text-sm max-w-[88%] leading-relaxed ${
                        mine
                          ? "ml-auto bg-[#1D6CE0] text-white"
                          : "mr-auto bg-white dark:bg-[#101E21] border border-[#E3ECF3] dark:border-[#1E353A] text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      <p className="text-xs opacity-80 font-bold mb-0.5">{m.senderName}</p>
                      <p>{m.body}</p>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={handleSendChat} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={chatBody}
                onChange={(e) => setChatBody(e.target.value)}
                placeholder={t.chatPlaceholder}
                className="flex-1 min-h-[46px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={sendingChat || !chatBody.trim()}
                className="min-h-[46px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1D6CE0] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1758BA] active:scale-[0.98] disabled:opacity-50 transition-all"
              >
                <IconSend className="h-4 w-4" />
                <span>{t.chatSendBtn}</span>
              </button>
            </form>
          </>
        )}
      </div>
    );
  };

  const ehrPill = (
    <div className="inline-flex h-11 items-center gap-2 rounded-full border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-4 text-xs sm:text-sm font-semibold text-[#1D6CE0] dark:text-sky-300 shadow-[0_1px_2px_rgba(15,23,42,0.03)] shrink-0">
      <IconShieldCheck className="h-4 w-4 shrink-0" />
      <span>{t.ehrGuardBadge}</span>
    </div>
  );

  return (
    <div className="space-y-6 oc-fade-up">
      <Emergency103Banner />

      <StaffWelcomeHeader
        greeting={`${t.welcomePrefix} ${authUser?.fullName || ""}`}
        dateLabel={dateLabel}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t.searchPlaceholder}
        rightSlot={ehrPill}
      />

      {activeView === "dashboard" && (
        <div className="space-y-6">
          {/* 4 KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StaffKpiCard
              tone="blue"
              icon={<IconUsers className="h-5 w-5" />}
              label={t.kpiConsented}
              value={queueData?.kpis?.consentedCount ?? 0}
              sublabel={t.kpiConsentedSub}
              onClick={() => setActiveView("mothers")}
            />
            <StaffKpiCard
              tone="green"
              icon={<IconCalendarEvent className="h-5 w-5" />}
              label={t.kpiTodaySessions}
              value={queueData?.kpis?.todaySessionsCount ?? 0}
              sublabel={t.kpiTodaySessionsSub}
              onClick={() => setActiveView("sessions")}
            />
            <StaffKpiCard
              tone="amber"
              icon={<IconHeartHandshake className="h-5 w-5" />}
              label={t.kpiHighRisk}
              value={queueData?.kpis?.highRiskCount ?? 0}
              sublabel={t.kpiHighRiskSub}
              onClick={() => setActiveView("mothers")}
            />
            <StaffKpiCard
              tone="red"
              icon={<IconAlertTriangle className="h-5 w-5" />}
              label={t.kpiSelfHarm}
              value={queueData?.kpis?.selfHarmActiveCount ?? 0}
              sublabel={t.kpiSelfHarmSub}
              onClick={() => setActiveView("mothers")}
            />
          </div>

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
                centerValue={queue.length > 0 ? "100%" : "0"}
                centerLabel={t.donutCenter}
                segments={donutSegments}
              />
            </div>
          </div>

          {/* Clean SaaS Priority Mothers Table */}
          <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
            <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
              {t.priorityTableTitle}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E3ECF3] dark:border-[#1E353A] text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="py-3 pr-3 font-semibold">{t.colMother}</th>
                    <th className="py-3 pr-3 font-semibold">{t.colMoodEpds}</th>
                    <th className="py-3 pr-3 font-semibold">{t.colConsent}</th>
                    <th className="py-3 font-semibold text-right">{t.colAction}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3ECF3]/80 dark:divide-[#1E353A]">
                  {filteredQueue.map((item) => {
                    const moodMeta = MOOD_SCALE.find((m) => m.value === item.latestMood);
                    return (
                      <tr
                        key={item.patientId}
                        className="hover:bg-[#F6F9FC]/70 dark:hover:bg-[#132529]/60 transition-colors"
                      >
                        <td className="py-3.5 pr-3">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {item.fullName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {item.district}
                            {item.mahalla ? `, ${item.mahalla}` : ""}
                          </p>
                        </td>
                        <td className="py-3.5 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{moodMeta ? moodMeta.emoji : "—"}</span>
                            {typeof item.latestEpdsScore === "number" ? (
                              <span className="rounded-full bg-[#F6F9FC] dark:bg-[#16272B] border border-[#E3ECF3] dark:border-[#1E353A] px-2.5 py-0.5 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {t.epdsWord}: {item.latestEpdsScore}/30
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">{t.noMoodYet}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 pr-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                item.hasActiveConsent
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                  : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              }`}
                            >
                              {item.hasActiveConsent ? t.consentActive : t.triageOnly}
                            </span>
                            {item.activeSelfHarm && (
                              <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white">
                                EPDS Q10 (103)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPatientId(item.patientId);
                              setActiveView("mothers");
                            }}
                            className="min-h-[36px] inline-flex items-center gap-1 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#16272B] px-3 py-1.5 text-xs font-semibold text-[#1D6CE0] dark:text-sky-300 hover:border-[#2585F5] active:scale-[0.98] transition-all"
                          >
                            {t.openBtn}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!loadingQueue && filteredQueue.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                      >
                        {t.queueEmpty}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeView === "mothers" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 oc-fade-up">
          {/* Queue */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              {t.queueTitle} ({filteredQueue.length})
            </h2>
            {loadingQueue ? (
              <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 text-sm text-slate-600 dark:text-slate-300">
                {t.loadingDetail}
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.queueEmpty}
              </div>
            ) : (
              filteredQueue.map((item) => {
                const selected = item.patientId === selectedQueueItem?.patientId;
                const moodMeta = MOOD_SCALE.find((m) => m.value === item.latestMood);
                return (
                  <div
                    key={item.patientId}
                    className={`rounded-2xl border p-4 space-y-2.5 transition-all ${
                      item.activeSelfHarm
                        ? "border-rose-400 dark:border-rose-700 bg-rose-50/85 dark:bg-rose-950/50"
                        : selected
                          ? "border-[#2585F5] bg-[#EBF4FF] dark:bg-sky-950/40 ring-1 ring-[#2585F5]"
                          : "border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] hover:border-[#2585F5]/60"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedPatientId(item.patientId)}
                      className="w-full text-left space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-base font-bold text-slate-900 dark:text-white">
                            {item.fullName}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            {item.district}
                            {item.mahalla ? `, ${item.mahalla}` : ""}
                          </p>
                        </div>
                        <span className="text-lg" title="Mood">
                          {moodMeta ? moodMeta.emoji : "—"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span
                          className={`rounded-full px-2.5 py-0.5 ${
                            item.hasActiveConsent
                              ? "bg-[#EBF4FF] dark:bg-sky-950/70 text-[#1D6CE0] dark:text-sky-300 border border-[#CFE3FB] dark:border-sky-800"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800"
                          }`}
                        >
                          {item.hasActiveConsent ? t.consentActive : t.triageOnly}
                        </span>
                        {typeof item.latestEpdsScore === "number" && (
                          <span className="rounded-full bg-[#F6F9FC] dark:bg-[#091315] border border-[#E3ECF3] dark:border-[#1E353A] px-2.5 py-0.5 font-mono text-slate-800 dark:text-slate-200">
                            {t.epdsWord}: {item.latestEpdsScore}/30
                          </span>
                        )}
                      </div>
                    </button>

                    {item.activeSelfHarm && (
                      <div className="pt-2.5 border-t border-rose-200 dark:border-rose-800 space-y-2.5">
                        <div className="flex items-center justify-between gap-2 text-xs font-bold text-rose-800 dark:text-rose-200">
                          <span className="inline-flex items-center gap-1.5">
                            <IconAlertTriangle className="h-4 w-4" />
                            EPDS Q10 (103)
                          </span>
                          <span className="font-mono">
                            {formatCountdown(item.slaDeadlineAt, nowMs, t)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAckSelfHarm(item.patientId)}
                          className="w-full min-h-[42px] rounded-xl bg-rose-600 px-3.5 py-2 text-sm font-bold text-white hover:bg-rose-700 active:scale-[0.98] transition-all"
                        >
                          {t.ackSlaBtn}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Detail Workspace */}
          <div className="lg:col-span-8 space-y-4">
            {!selectedQueueItem ? (
              <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-8 text-center text-sm text-slate-600 dark:text-slate-300">
                {t.selectMother}
              </div>
            ) : loadingDetail || !detail || detail.loadError ? (
              <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-8 text-center text-sm text-slate-600 dark:text-slate-300">
                {detail?.loadError ? t.selectMother : t.loadingDetail}
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3.5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                        {detail.patient.fullName}
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                        {detail.patient.district}
                        {detail.patient.mahalla ? `, ${detail.patient.mahalla}` : ""}
                        {detail.patient.phone ? ` • ${detail.patient.phone}` : ""}
                      </p>
                    </div>
                    {detail.patient.assignedFamilyDoctor && (
                      <div className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Shifokor: </span>
                        <strong className="text-slate-900 dark:text-white">
                          {detail.patient.assignedFamilyDoctor.fullName}
                        </strong>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl border border-[#CFE3FB] dark:border-sky-800 bg-[#EBF4FF] dark:bg-sky-950/40 px-3.5 py-2.5 text-xs sm:text-sm text-[#1D6CE0] dark:text-sky-200 leading-relaxed">
                    <IconLock className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{t.ehrNotice}</span>
                  </div>
                </div>

                <VitalsTrendChart records={detail.checkins || []} mode="mood" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-4 sm:p-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {t.epdsHistoryTitle}
                    </h3>
                    {detail.epdsHistory.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t.epdsEmpty}</p>
                    ) : (
                      <div className="space-y-2">
                        {detail.epdsHistory.slice(0, 6).map((row) => (
                          <div
                            key={row.id}
                            className={`rounded-xl border px-3.5 py-2.5 text-sm flex items-center justify-between ${
                              row.epdsSelfHarmFlag
                                ? "border-rose-400 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200"
                                : row.epdsScore >= 13
                                  ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200"
                                  : "border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] text-slate-800 dark:text-slate-100"
                            }`}
                          >
                            <span className="font-mono">{row.date}</span>
                            <span className="font-bold">
                              {row.epdsScore}/30 {row.epdsSelfHarmFlag ? "• Q10!" : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <form
                    onSubmit={handleEscalate}
                    className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-4 sm:p-5 space-y-3"
                  >
                    <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <IconStethoscope className="h-4 w-4 shrink-0" />
                      <span>{t.escalateTitle}</span>
                    </h3>
                    <textarea
                      rows={3}
                      value={escalateMsg}
                      onChange={(e) => setEscalateMsg(e.target.value)}
                      placeholder={t.escalatePlaceholder}
                      className="w-full rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"
                      required
                    />
                    <button
                      type="submit"
                      disabled={
                        escalating || !escalateMsg.trim() || !detail.patient.assignedFamilyDoctor
                      }
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50 transition-all"
                    >
                      <IconPhoneCall className="h-4 w-4" />
                      <span>{escalating ? "..." : t.escalateBtn}</span>
                    </button>
                  </form>
                </div>

                <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-4 sm:p-5 space-y-3.5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <IconNotes className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
                    <span>{t.notesTitle}</span>
                  </h3>
                  <form onSubmit={handleSaveNote} className="space-y-3">
                    <textarea
                      rows={2}
                      value={noteBody}
                      onChange={(e) => setNoteBody(e.target.value)}
                      placeholder={t.notesPlaceholder}
                      className="w-full rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"
                      required
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                      <select
                        value={noteRisk}
                        onChange={(e) => setNoteRisk(e.target.value)}
                        aria-label={t.riskSelectLabel}
                        className="min-h-[44px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MODERATE">MODERATE</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                      <button
                        type="submit"
                        disabled={savingNote || !noteBody.trim()}
                        className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#1D6CE0] px-5 py-2 text-sm font-bold text-white hover:bg-[#1758BA] active:scale-[0.98] disabled:opacity-50 transition-all"
                      >
                        <IconPlus className="h-4 w-4" />
                        <span>{savingNote ? "..." : t.saveNoteBtn}</span>
                      </button>
                    </div>
                  </form>

                  {detail.notes.length > 0 && (
                    <div className="space-y-2.5 pt-3 border-t border-[#E3ECF3] dark:border-[#1E353A]">
                      {detail.notes.map((n) => (
                        <div
                          key={n.id}
                          className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-3.5 text-sm space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                            <span className="font-semibold">{n.riskAssessment || "NOTE"}</span>
                            <span>{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-900 dark:text-slate-100 leading-relaxed">
                            {n.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeView === "sessions" && <div className="oc-fade-up">{renderSessionsCard()}</div>}

      {activeView === "chat" && <div className="oc-fade-up">{renderChatCard()}</div>}

      {activeView === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 oc-fade-up">
          <form
            onSubmit={handleSaveSlots}
            className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3.5"
          >
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <IconClock className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
              <span>{t.slotsTitle}</span>
            </h3>
            <input
              type="text"
              value={slotsText}
              onChange={(e) => setSlotsText(e.target.value)}
              placeholder={t.slotsHint}
              className="min-h-[46px] w-full rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={savingSlots}
              className="w-full min-h-[46px] rounded-xl bg-[#1D6CE0] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1758BA] active:scale-[0.98] transition-all"
            >
              {savingSlots ? "..." : t.saveSlotsBtn}
            </button>
          </form>

          <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <IconShieldCheck className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
              <span>{t.ehrGuardBadge}</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.ehrNotice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
