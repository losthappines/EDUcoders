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
} from "@tabler/icons-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePlatform } from "@/context/PlatformContext";
import { VitalsTrendChart } from "@/components/VitalsTrendChart";
import { Emergency103Banner } from "@/components/Emergency103Banner";
import { MOOD_SCALE } from "@/lib/wellbeing-catalog";

const PSYCH_COPY = {
  uz: {
    title: "Perinatal psixolog kabineti",
    subtitle: "Onalarning ruhiy holati, EPDS skrining, rozilik asosidagi kuzatuv va shaxsiy seanslar",
    ehrGuardBadge: "Tibbiy EHR ajratilgan (AES-256 + RBAC)",
    kpiConsented: "Rozilik bergan onalar",
    kpiHighRisk: "Yuqori xavf navbati",
    kpiSelfHarm: "Shoshilinch 103 SLA",
    kpiTodaySessions: "Bugungi seanslar",
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
  },
  ru: {
    title: "Кабинет перинатального психолога",
    subtitle: "Эмоциональное состояние мам, скрининг EPDS, сеансы и работа по согласию",
    ehrGuardBadge: "Клинический EHR изолирован (AES-256 + RBAC)",
    kpiConsented: "Мамы с согласием",
    kpiHighRisk: "Высокий риск",
    kpiSelfHarm: "Срочный 103 SLA",
    kpiTodaySessions: "Сеансов сегодня",
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
  },
  en: {
    title: "Perinatal Psychologist Workspace",
    subtitle: "Postpartum emotional wellbeing, EPDS screening, consent-scoped follow-up & sessions",
    ehrGuardBadge: "Clinical EHR Separated (AES-256 + RBAC)",
    kpiConsented: "Consented Mothers",
    kpiHighRisk: "High-Risk Queue",
    kpiSelfHarm: "Urgent 103 SLA",
    kpiTodaySessions: "Today's Sessions",
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
  },
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
  const selectedQueueItem = queue.find((p) => p.patientId === selectedPatientId) || queue[0];

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

  return (
    <div className="space-y-5">
      <Emergency103Banner />

      {/* Header */}
      <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-lg font-bold text-[#292E2B] dark:text-[#F3F0E8] flex items-center gap-2">
            <IconHeartHandshake className="h-5 w-5 text-[#244C40] dark:text-[#A7BBAA]" />
            <span>{t.title}</span>
          </h1>
          <p className="text-xs text-[#525954] dark:text-[#B8C2BA]">{t.subtitle}</p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-sm border border-[#A7BBAA] dark:border-[#4D6452] bg-[#EFECE3] dark:bg-[#242A27] px-3 py-1.5 text-xs font-semibold text-[#244C40] dark:text-[#A7BBAA]">
          <IconShieldCheck className="h-4 w-4" />
          <span>{t.ehrGuardBadge}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#525954] dark:text-[#B8C2BA]">
            {t.kpiConsented}
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-[#244C40] dark:text-[#A7BBAA]">
            {queueData?.kpis?.consentedCount ?? 0}
          </p>
        </div>
        <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#525954] dark:text-[#B8C2BA]">
            {t.kpiHighRisk}
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-[#9A6B42]">
            {queueData?.kpis?.highRiskCount ?? 0}
          </p>
        </div>
        <div className="rounded-sm border border-[#D9B8AE] dark:border-[#6B3A3A] bg-[#F3EAE7]/70 dark:bg-[#2E1E1D]/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7A2E2E] dark:text-[#F0C8C4]">
            {t.kpiSelfHarm}
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-[#9E4747] dark:text-[#F4C9C2]">
            {queueData?.kpis?.selfHarmActiveCount ?? 0}
          </p>
        </div>
        <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#525954] dark:text-[#B8C2BA]">
            {t.kpiTodaySessions}
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-[#292E2B] dark:text-[#F3F0E8]">
            {queueData?.kpis?.todaySessionsCount ?? 0}
          </p>
        </div>
      </div>

      {/* Main 12-col workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Queue + Slots */}
        <div className="lg:col-span-4 space-y-4">
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#525954] dark:text-[#B8C2BA]">
              {t.queueTitle} ({queue.length})
            </h2>
            {loadingQueue ? (
              <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-5 text-xs text-[#525954]">
                {t.loadingDetail}
              </div>
            ) : queue.length === 0 ? (
              <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-5 text-xs text-[#525954] dark:text-[#B8C2BA]">
                {t.queueEmpty}
              </div>
            ) : (
              queue.map((item) => {
                const selected = item.patientId === selectedPatientId;
                const moodMeta = MOOD_SCALE.find((m) => m.value === item.latestMood);
                return (
                  <div
                    key={item.patientId}
                    className={`rounded-sm border p-4 space-y-2 transition-colors ${
                      item.activeSelfHarm
                        ? "border-[#9E4747] bg-[#F3EAE7]/80 dark:bg-[#2E1E1D]/60"
                        : selected
                          ? "border-[#244C40] bg-[#EFECE3]/70 dark:bg-[#242A27]"
                          : "border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedPatientId(item.patientId)}
                      className="w-full text-left space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-[#292E2B] dark:text-[#F3F0E8]">
                            {item.fullName}
                          </p>
                          <p className="text-[11px] text-[#525954] dark:text-[#B8C2BA]">
                            {item.district}
                            {item.mahalla ? `, ${item.mahalla}` : ""}
                          </p>
                        </div>
                        <span className="text-base" title="Mood">
                          {moodMeta ? moodMeta.emoji : "—"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                        <span
                          className={`rounded-sm px-2 py-0.5 ${
                            item.hasActiveConsent
                              ? "bg-[#EFECE3] text-[#244C40] border border-[#A7BBAA]"
                              : "bg-[#F3EAE7] text-[#7A2E2E] border border-[#D9B8AE]"
                          }`}
                        >
                          {item.hasActiveConsent ? t.consentActive : t.triageOnly}
                        </span>
                        {typeof item.latestEpdsScore === "number" && (
                          <span className="rounded-sm bg-[#F7F5EF] dark:bg-[#161A18] border border-[#DDD8CC] dark:border-[#2F3733] px-2 py-0.5 font-mono">
                            {t.epdsWord}: {item.latestEpdsScore}/30
                          </span>
                        )}
                      </div>
                    </button>

                    {item.activeSelfHarm && (
                      <div className="pt-2 border-t border-[#D9B8AE] space-y-2">
                        <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-[#7A2E2E] dark:text-[#F0C8C4]">
                          <span className="inline-flex items-center gap-1">
                            <IconAlertTriangle className="h-3.5 w-3.5" />
                            EPDS Q10 (103)
                          </span>
                          <span className="font-mono">
                            {formatCountdown(item.slaDeadlineAt, nowMs, t)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAckSelfHarm(item.patientId)}
                          className="w-full min-h-[36px] rounded-sm bg-[#9E4747] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#7A2E2E]"
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

          {/* Weekly Slots Editor */}
          <form
            onSubmit={handleSaveSlots}
            className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-4 space-y-2.5"
          >
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#525954] dark:text-[#B8C2BA] flex items-center gap-1.5">
              <IconClock className="h-3.5 w-3.5 text-[#244C40] dark:text-[#A7BBAA]" />
              <span>{t.slotsTitle}</span>
            </h3>
            <input
              type="text"
              value={slotsText}
              onChange={(e) => setSlotsText(e.target.value)}
              placeholder={t.slotsHint}
              className="min-h-[38px] w-full rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-1.5 text-xs"
            />
            <button
              type="submit"
              disabled={savingSlots}
              className="w-full min-h-[38px] rounded-sm border border-[#244C40] bg-[#EFECE3] dark:bg-[#242A27] px-3 py-1.5 text-xs font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:bg-[#244C40] hover:text-[#F7F5EF] transition-colors"
            >
              {savingSlots ? "..." : t.saveSlotsBtn}
            </button>
          </form>
        </div>

        {/* Detail Workspace */}
        <div className="lg:col-span-8 space-y-4">
          {!selectedQueueItem ? (
            <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-8 text-center text-xs text-[#525954]">
              {t.selectMother}
            </div>
          ) : loadingDetail || !detail || detail.loadError ? (
            <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-8 text-center text-xs text-[#525954]">
              {detail?.loadError ? t.selectMother : t.loadingDetail}
            </div>
          ) : (
            <>
              {/* Profile & EHR Separation Notice */}
              <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-[#292E2B] dark:text-[#F3F0E8]">
                      {detail.patient.fullName}
                    </h2>
                    <p className="text-xs text-[#525954] dark:text-[#B8C2BA]">
                      {detail.patient.district}
                      {detail.patient.mahalla ? `, ${detail.patient.mahalla}` : ""}
                      {detail.patient.phone ? ` • ${detail.patient.phone}` : ""}
                    </p>
                  </div>
                  {detail.patient.assignedFamilyDoctor && (
                    <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-1.5 text-xs">
                      <span className="text-[#525954] dark:text-[#B8C2BA]">Shifokor: </span>
                      <strong className="text-[#292E2B] dark:text-[#F3F0E8]">
                        {detail.patient.assignedFamilyDoctor.fullName}
                      </strong>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 rounded-sm border border-[#A7BBAA] dark:border-[#4D6452] bg-[#EFECE3]/70 dark:bg-[#242A27] px-3 py-2 text-[11px] text-[#244C40] dark:text-[#A7BBAA]">
                  <IconLock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{t.ehrNotice}</span>
                </div>
              </div>

              {/* 30d Mood Chart */}
              <VitalsTrendChart records={detail.checkins || []} mode="mood" />

              {/* EPDS Screening History + Escalation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-4 space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#525954] dark:text-[#B8C2BA]">
                    {t.epdsHistoryTitle}
                  </h3>
                  {detail.epdsHistory.length === 0 ? (
                    <p className="text-xs text-[#525954]">{t.epdsEmpty}</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.epdsHistory.slice(0, 6).map((row) => (
                        <div
                          key={row.id}
                          className={`rounded-sm border px-3 py-2 text-xs flex items-center justify-between ${
                            row.epdsSelfHarmFlag
                              ? "border-[#9E4747] bg-[#F3EAE7] text-[#7A2E2E]"
                              : row.epdsScore >= 13
                                ? "border-[#D9B8AE] bg-[#F7F5EF] text-[#9A6B42]"
                                : "border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18]"
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
                  className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-4 space-y-2.5"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#7A2E2E] dark:text-[#F0C8C4] flex items-center gap-1.5">
                    <IconStethoscope className="h-3.5 w-3.5" />
                    <span>{t.escalateTitle}</span>
                  </h3>
                  <textarea
                    rows={3}
                    value={escalateMsg}
                    onChange={(e) => setEscalateMsg(e.target.value)}
                    placeholder={t.escalatePlaceholder}
                    className="w-full rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-2 text-xs"
                    required
                  />
                  <button
                    type="submit"
                    disabled={escalating || !escalateMsg.trim() || !detail.patient.assignedFamilyDoctor}
                    className="w-full min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded-sm bg-[#9E4747] px-3 py-2 text-xs font-semibold text-white hover:bg-[#7A2E2E] disabled:opacity-50"
                  >
                    <IconPhoneCall className="h-3.5 w-3.5" />
                    <span>{escalating ? "..." : t.escalateBtn}</span>
                  </button>
                </form>
              </div>

              {/* Encrypted Notes */}
              <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#525954] dark:text-[#B8C2BA] flex items-center gap-1.5">
                  <IconNotes className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]" />
                  <span>{t.notesTitle}</span>
                </h3>
                <form onSubmit={handleSaveNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={noteBody}
                    onChange={(e) => setNoteBody(e.target.value)}
                    placeholder={t.notesPlaceholder}
                    className="w-full rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-2 text-xs"
                    required
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={noteRisk}
                      onChange={(e) => setNoteRisk(e.target.value)}
                      aria-label={t.riskSelectLabel}
                      className="min-h-[38px] rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-1.5 text-xs"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MODERATE">MODERATE</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                    <button
                      type="submit"
                      disabled={savingNote || !noteBody.trim()}
                      className="min-h-[38px] inline-flex items-center gap-1.5 rounded-sm bg-[#244C40] px-4 py-1.5 text-xs font-semibold text-[#F7F5EF] hover:bg-[#1A382F] disabled:opacity-50"
                    >
                      <IconPlus className="h-3.5 w-3.5" />
                      <span>{savingNote ? "..." : t.saveNoteBtn}</span>
                    </button>
                  </div>
                </form>

                {detail.notes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#DDD8CC] dark:border-[#2F3733]">
                    {detail.notes.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#525954]">
                          <span>{n.riskAssessment || "NOTE"}</span>
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-[#292E2B] dark:text-[#F3F0E8]">{n.notes}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sessions */}
              <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#525954] dark:text-[#B8C2BA] flex items-center gap-1.5">
                  <IconCalendarEvent className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]" />
                  <span>{t.sessionsTitle}</span>
                </h3>
                <form onSubmit={handleCreateSession} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                    className="min-h-[38px] rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-1.5 text-xs"
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
                    className="min-h-[38px] rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-1.5 text-xs"
                    required
                  />
                  <input
                    type="text"
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    placeholder={t.sessionTopicPlaceholder}
                    className="min-h-[38px] rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-1.5 text-xs"
                  />
                  <input
                    type="url"
                    value={sessionUrl}
                    onChange={(e) => setSessionUrl(e.target.value)}
                    placeholder={t.sessionLinkPlaceholder}
                    className="min-h-[38px] rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-1.5 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={creatingSession}
                    className="sm:col-span-2 min-h-[38px] rounded-sm bg-[#244C40] px-4 py-2 text-xs font-semibold text-[#F7F5EF] hover:bg-[#1A382F]"
                  >
                    {creatingSession ? "..." : t.createSessionBtn}
                  </button>
                </form>

                {detail.sessions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#DDD8CC] dark:border-[#2F3733]">
                    {detail.sessions.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] p-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <p className="font-semibold">
                            {s.sessionType} • {new Date(s.scheduledAt).toLocaleString()}
                          </p>
                          <p className="text-[11px] text-[#525954]">
                            {s.topic || "—"} • <strong>{s.status}</strong>
                          </p>
                        </div>
                        {s.status === "SCHEDULED" && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSessionStatus(s.id, "COMPLETED")}
                              className="inline-flex items-center gap-1 rounded-sm bg-[#244C40] px-2.5 py-1 text-[11px] font-semibold text-[#F7F5EF]"
                            >
                              <IconCheck className="h-3 w-3" />
                              {t.markComplete}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSessionStatus(s.id, "CANCELLED")}
                              className="rounded-sm border border-[#DDD8CC] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-semibold text-[#525954]"
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

              {/* Direct Chat */}
              <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#525954] dark:text-[#B8C2BA] flex items-center gap-1.5">
                  <IconMessageCircle className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]" />
                  <span>{t.chatTitle}</span>
                </h3>
                {!detail.hasActiveConsent ? (
                  <p className="text-xs text-[#525954] dark:text-[#B8C2BA]">{t.chatNeedConsent}</p>
                ) : (
                  <>
                    <div className="max-h-52 overflow-y-auto space-y-2 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] p-3">
                      {detail.messages.length === 0 ? (
                        <p className="text-xs text-[#525954]">—</p>
                      ) : (
                        detail.messages.map((m) => {
                          const mine = m.senderUserId === authUser?.id;
                          return (
                            <div
                              key={m.id}
                              className={`rounded-sm p-2.5 text-xs max-w-[85%] ${
                                mine
                                  ? "ml-auto bg-[#244C40] text-[#F7F5EF]"
                                  : "mr-auto bg-[#FFFFFF] dark:bg-[#1D221F] border border-[#DDD8CC] dark:border-[#2F3733]"
                              }`}
                            >
                              <p className="text-[10px] opacity-75 font-semibold">{m.senderName}</p>
                              <p>{m.body}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <form onSubmit={handleSendChat} className="flex gap-2">
                      <input
                        type="text"
                        value={chatBody}
                        onChange={(e) => setChatBody(e.target.value)}
                        placeholder={t.chatPlaceholder}
                        className="flex-1 min-h-[38px] rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-1.5 text-xs"
                      />
                      <button
                        type="submit"
                        disabled={sendingChat || !chatBody.trim()}
                        className="inline-flex items-center gap-1 rounded-sm bg-[#244C40] px-4 py-1.5 text-xs font-semibold text-[#F7F5EF] disabled:opacity-50"
                      >
                        <IconSend className="h-3.5 w-3.5" />
                        <span>{t.chatSendBtn}</span>
                      </button>
                    </form>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
