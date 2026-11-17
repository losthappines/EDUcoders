"use client";

import React, { useMemo, useState } from "react";
import {
  IconAlertOctagon,
  IconCheck,
  IconCircleCheck,
  IconFlask,
  IconHeartbeat,
  IconKey,
  IconPhoneCall,
  IconPill,
  IconSend,
  IconShieldCheck,
  IconUser,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage, type AppLang } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SlaCountdownBadge } from "@/components/SlaCountdownBadge";
import { InfoTooltip } from "@/components/InfoTooltip";

const COPY: Record<
  AppLang,
  {
    loading: string;
    noCall: string;
    title: string;
    subtitle: string;
    doctorTitle: string;
    visitWindow: string;
    visitCodeLabel: string;
    visitCodeTip: string;
    guideTitle: string;
    rulesTitle: string;
    dangerTitle: string;
    checkinTitle: string;
    bpLabel: string;
    bpTip: string;
    notesLabel: string;
    notesPlaceholder: string;
    checkinSending: string;
    checkinBtn: string;
    statusNormal: string;
    statusAttention: string;
    statusUrgent: string;
    rxTitle: string;
    loggedDoses: string;
    takenBtn: string;
    labsTitle: string;
    labsTip: string;
    flagAbnormal: string;
    confirmTitle: string;
    confirmedPrefix: string;
    otpPlaceholder: string;
    otpBtn: string;
    oneTapBtn: string;
    confirmErr: string;
    confirmOk: string;
    adherenceOk: string;
  }
> = {
  uz: {
    loading: "Shaxsiy kabinet yuklanmoqda...",
    noCall: "Sizda hozircha rejalashtirilgan uy tashrifi yo'q.",
    title: "Shaxsiy parvarish kabineti",
    subtitle: "Shifoxona tavsiyalari va 24 soatlik oilaviy shifokor tashrifi",
    doctorTitle: "Sizga biriktirilgan oilaviy shifokor",
    visitWindow: "Rejalashtirilgan tashrif vaqti:",
    visitCodeLabel: "Tasdiqlash kodi",
    visitCodeTip:
      "Shifokor uyingizga kelganda tashrifni tasdiqlash uchun ushbu 4 xonali kodni ko'rsating.",
    guideTitle: "Uyda parvarish qoidalari",
    rulesTitle: "Kunlik tavsiyalar",
    dangerTitle: "Zudlik bilan shifokorga murojaat qiling, agar:",
    checkinTitle: "Kunlik holat tekshiruvi: o'zingizni qanday his qilyapsiz?",
    bpLabel: "Qon bosimi",
    bpTip: "Yuqori va pastki qon bosimi ko'rsatkichi (masalan, 120/80).",
    notesLabel: "Izoh",
    notesPlaceholder: "Holatingiz haqida yozing...",
    checkinSending: "Yuborilmoqda...",
    checkinBtn: "Holatimni yuborish",
    statusNormal: "Yaxshi",
    statusAttention: "E'tibor bering",
    statusUrgent: "Zudlik bilan shifokor",
    rxTitle: "Sizga yozilgan dorilar",
    loggedDoses: "Belgilangan qabullar soni:",
    takenBtn: "Ichdim",
    labsTitle: "Shifoxona tahlillaringiz natijalari",
    labsTip:
      "Hb — qondagi gemoglobin darajasi; CRP — yallig'lanish belgisi; PLT — trombotsitlar.",
    flagAbnormal: "Me'yordan chetda",
    confirmTitle: "Shifokor tashrifini tasdiqlash",
    confirmedPrefix: "Tashrif tasdiqlandi:",
    otpPlaceholder: "4 xonali kod (masalan:",
    otpBtn: "4 xonali kod bilan tasdiqlash",
    oneTapBtn: "1 bosish: Shifokor keldi ✓",
    confirmErr: "Tashrifni tasdiqlashda xatolik yuz berdi.",
    confirmOk: "Shifokor tashrifi tasdiqlandi! Salomat bo'ling.",
    adherenceOk: "Dori qabul qilinganligi belgilandi.",
  },
  ru: {
    loading: "Загрузка личного кабинета...",
    noCall: "У вас пока нет запланированного домашнего визита.",
    title: "Личный кабинет ухода",
    subtitle: "Рекомендации после роддома и визит семейного врача в течение 24 часов",
    doctorTitle: "Ваш семейный врач",
    visitWindow: "Ожидаемое время визита:",
    visitCodeLabel: "Код визита",
    visitCodeTip:
      "Назовите этот 4-значный код врачу или медсестре, когда они придут к вам домой.",
    guideTitle: "Правила ухода на дому",
    rulesTitle: "Ежедневные советы",
    dangerTitle: "Срочно обратитесь к врачу, если:",
    checkinTitle: "Ежедневная проверка: расскажите, как вы себя чувствуете",
    bpLabel: "Артериальное давление",
    bpTip: "Верхнее и нижнее давление, например 120/80.",
    notesLabel: "Комментарий",
    notesPlaceholder: "Опишите ваше самочувствие...",
    checkinSending: "Отправка...",
    checkinBtn: "Отправить самочувствие",
    statusNormal: "В норме",
    statusAttention: "Требует внимания",
    statusUrgent: "Срочно к врачу",
    rxTitle: "Назначенные лекарства",
    loggedDoses: "Отмечено приемов:",
    takenBtn: "Приняла",
    labsTitle: "Ваши результаты анализов из больницы",
    labsTip:
      "Hb — уровень гемоглобина; CRP — показатель воспаления; PLT — тромбоциты.",
    flagAbnormal: "Отклонение",
    confirmTitle: "Подтвердить визит врача",
    confirmedPrefix: "Визит подтвержден:",
    otpPlaceholder: "4-значный код (напр.",
    otpBtn: "Подтвердить 4-значным кодом",
    oneTapBtn: "1 клик: Врач посетил ✓",
    confirmErr: "Ошибка при подтверждении визита.",
    confirmOk: "Визит врача подтвержден! Будьте здоровы.",
    adherenceOk: "Прием лекарства отмечен.",
  },
  en: {
    loading: "Loading your portal...",
    noCall: "You do not have an active home visit scheduled right now.",
    title: "Your Recovery Portal",
    subtitle: "Simple home care tips and your 24-hour family doctor visit",
    doctorTitle: "Your Assigned Family Doctor",
    visitWindow: "Expected Visit Window:",
    visitCodeLabel: "Visit Code",
    visitCodeTip:
      "Share this 4-digit confirmation code with your doctor when they arrive at your home.",
    guideTitle: "Home Care Guide",
    rulesTitle: "Daily Care Tips",
    dangerTitle: "Call your doctor or emergency services right away if:",
    checkinTitle: "Daily check-in: tell us how you feel",
    bpLabel: "Blood Pressure",
    bpTip: "Your blood pressure reading (top/bottom number), e.g. 120/80.",
    notesLabel: "Notes",
    notesPlaceholder: "Tell us how you are feeling today...",
    checkinSending: "Sending...",
    checkinBtn: "Send Daily Check-in",
    statusNormal: "Looking good",
    statusAttention: "Doctor will review",
    statusUrgent: "Urgent review",
    rxTitle: "Your Medicines",
    loggedDoses: "Doses logged:",
    takenBtn: "Mark Taken",
    labsTitle: "We reviewed your hospital results",
    labsTip:
      "Hb = Hemoglobin (iron/oxygen in blood); CRP = inflammation marker; PLT = platelets.",
    flagAbnormal: "Needs follow-up",
    confirmTitle: "Confirm Family Doctor Home Visit",
    confirmedPrefix: "Visit confirmed:",
    otpPlaceholder: "4-digit code (e.g.",
    otpBtn: "Confirm with 4-Digit Code",
    oneTapBtn: "1-Tap: Doctor Visited ✓",
    confirmErr: "Could not confirm visit.",
    confirmOk: "Home visit confirmed! Wishing you a smooth recovery.",
    adherenceOk: "Medicine dose marked as taken.",
  },
};

function getLabTooltip(testName: string, lang: AppLang): string | null {
  const lower = testName.toLowerCase();
  if (lower.includes("hemoglobin") || lower.includes("hb") || lower.includes("gemoglobin")) {
    return lang === "ru"
      ? "Гемоглобин (Hb) — белок крови, переносящий кислород."
      : lang === "en"
        ? "Hemoglobin (Hb) — protein in red blood cells that carries oxygen."
        : "Gemoglobin (Hb) — qonda kislorod tashuvchi oqsil.";
  }
  if (lower.includes("crp") || lower.includes("c-reactive") || lower.includes("c-reaktiv")) {
    return lang === "ru"
      ? "CRP (СРБ) — показатель воспаления в организме."
      : lang === "en"
        ? "CRP (C-Reactive Protein) — checks for inflammation or infection."
        : "CRP — organizmdagi yallig'lanish ko'rsatkichi.";
  }
  if (lower.includes("plt") || lower.includes("platelet") || lower.includes("trombotsit")) {
    return lang === "ru"
      ? "PLT (тромбоциты) — клетки крови, отвечающие за свертываемость."
      : lang === "en"
        ? "Platelets (PLT) — blood cells that help stop bleeding."
        : "Trombotsitlar (PLT) — qon ivishiga yordam beruvchi hujayralar.";
  }
  return null;
}

export default function PatientPortalPage() {
  const { authUser, data, loading, fetchWithAuth, refreshData, showToast, dataLoadedAtMs } =
    usePlatform();
  const { lang } = useLanguage();

  const [fever, setFever] = useState(false);
  const [severeHeadache, setSevereHeadache] = useState(false);
  const [bleeding, setBleeding] = useState(false);
  const [swelling, setSwelling] = useState(false);
  const [bpReading, setBpReading] = useState("124/80");
  const [notes, setNotes] = useState("");
  const [submittingSym, setSubmittingSym] = useState(false);

  const [otpInput, setOtpInput] = useState("");
  const [confirming, setConfirming] = useState(false);

  const activeCalls = useMemo(() => data?.activeCalls ?? [], [data?.activeCalls]);
  const call = activeCalls[0];
  const ownPatient = data?.patients?.[0];
  const t = COPY[lang];

  const handleSymptomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!call) return;
    setSubmittingSym(true);
    try {
      const res = await fetchWithAuth("/api/patient/symptom-checkin", {
        method: "POST",
        body: JSON.stringify({
          activeCallId: call.id,
          fever,
          severeHeadache,
          bleeding,
          swelling,
          bpReading,
          notes,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        await refreshData();
        const level = json.checkin.aiTriageLevel;
        showToast(
          level === "RED_EMERGENCY" ? "error" : level === "YELLOW" ? "info" : "success",
          lang === "ru"
            ? json.checkin.aiAdviceRu
            : lang === "en"
              ? json.checkin.aiAdviceEn
              : json.checkin.aiAdviceUz
        );
        setNotes("");
      }
    } finally {
      setSubmittingSym(false);
    }
  };

  const handleConfirmVisit = async (method: "OTP_4DIGIT" | "ONE_TAP_PORTAL") => {
    if (!call) return;
    setConfirming(true);
    try {
      const res = await fetchWithAuth("/api/patient/confirm-visit", {
        method: "POST",
        body: JSON.stringify({
          activeCallId: call.id,
          method,
          otpCode: otpInput,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast("error", json.error || t.confirmErr);
        return;
      }
      await refreshData();
      showToast("success", t.confirmOk);
    } finally {
      setConfirming(false);
    }
  };

  const handleAdherence = async (rxId: string) => {
    const res = await fetchWithAuth("/api/patient/adherence", {
      method: "POST",
      body: JSON.stringify({ prescriptionId: rxId, taken: true }),
    });
    if (res.ok) {
      await refreshData();
      showToast("success", t.adherenceOk);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
        {t.loading}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Top Language & Personal Profile Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.title}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.subtitle}</p>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
            <IconUser className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            {ownPatient?.fullName ?? authUser?.fullName}
          </span>
          {ownPatient && (
            <span className="text-slate-500 dark:text-slate-400">
              {ownPatient.district}
              {ownPatient.mahalla ? `, ${ownPatient.mahalla}` : ""} • {ownPatient.polyclinicName}
            </span>
          )}
        </div>
      </div>

      {!call ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {t.noCall}
        </div>
      ) : (
        <>
          {/* Assigned Family Doctor & 24h Visit Window */}
          <section className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30 p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  {t.doctorTitle}
                </p>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {call.assignedDoctor.fullName}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {call.polyclinicName} • {call.assignedDoctor.phone}
                </p>
              </div>
              {data?.simState && (
                <SlaCountdownBadge
                  dischargedAt={call.dischargedAt}
                  slaDeadlineAt={call.slaDeadlineAt}
                  simulatedNow={data.simState.simulatedNow}
                  dataLoadedAtMs={dataLoadedAtMs}
                  status={call.status}
                  plainMode
                />
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white dark:bg-slate-900 p-3 border border-teal-100 dark:border-teal-900 text-xs text-slate-700 dark:text-slate-300">
              <span>
                {t.visitWindow}{" "}
                <strong className="text-slate-900 dark:text-slate-100">
                  {new Date(call.scheduledWindowStart).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  –
                  {new Date(call.scheduledWindowEnd).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
                <IconKey className="h-3.5 w-3.5" />
                <InfoTooltip label={`${t.visitCodeLabel}:`} explanation={t.visitCodeTip} />
                {call.patientOtpCode}
              </span>
            </div>
          </section>

          {/* Home Care Guide */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <IconShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              {t.guideTitle}
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
              {lang === "ru"
                ? call.patientGuide.summaryRu
                : lang === "en"
                  ? call.patientGuide.summaryEn
                  : call.patientGuide.summaryUz}
            </p>

            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">{t.rulesTitle}</h3>
              <ul className="space-y-1.5">
                {(lang === "ru"
                  ? call.patientGuide.dailyRulesRu
                  : lang === "en"
                    ? call.patientGuide.dailyRulesEn
                    : call.patientGuide.dailyRulesUz
                )?.map((rule, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <IconCircleCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40 p-3">
              <h3 className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-1.5 flex items-center gap-1.5">
                <IconPhoneCall className="h-3.5 w-3.5" />
                {t.dangerTitle}
              </h3>
              <ul className="space-y-1 text-xs text-rose-900 dark:text-rose-200 list-disc pl-4">
                {(lang === "ru"
                  ? call.patientGuide.emergencySignsRu
                  : lang === "en"
                    ? call.patientGuide.emergencySignsEn
                    : call.patientGuide.emergencySignsUz
                )?.map((sign, idx) => (
                  <li key={idx}>{sign}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Daily Symptom Check-in */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <IconHeartbeat className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              {t.checkinTitle}
            </h2>
            <form onSubmit={handleSymptomSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    checked: fever,
                    set: setFever,
                    uz: "Isitma > 38.0°C",
                    ru: "Температура > 38.0°C",
                    en: "Fever > 38.0°C",
                  },
                  {
                    checked: severeHeadache,
                    set: setSevereHeadache,
                    uz: "Kuchli bosh og'rig'i / ko'z xiralashishi",
                    ru: "Сильная головная боль / туман",
                    en: "Severe headache / blurred vision",
                  },
                  {
                    checked: bleeding,
                    set: setBleeding,
                    uz: "Kuchli qon ketishi",
                    ru: "Обильное кровотечение",
                    en: "Heavy bleeding",
                  },
                  {
                    checked: swelling,
                    set: setSwelling,
                    uz: "Yuz / qo'l / oyoqda kuchli shish",
                    ru: "Сильные отеки лица / ног",
                    en: "Severe face or leg swelling",
                  },
                ].map((sym, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-medium cursor-pointer transition ${
                      sym.checked
                        ? "border-rose-400 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sym.checked}
                      onChange={(e) => sym.set(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-rose-600"
                    />
                    <span>{lang === "ru" ? sym.ru : lang === "en" ? sym.en : sym.uz}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label htmlFor="patient-bp" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    <InfoTooltip label={t.bpLabel} explanation={t.bpTip} />
                  </label>
                  <input
                    id="patient-bp"
                    name="bpReading"
                    type="text"
                    value={bpReading}
                    onChange={(e) => setBpReading(e.target.value)}
                    placeholder="120/80"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 font-mono text-xs text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="patient-notes" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t.notesLabel}
                  </label>
                  <input
                    id="patient-notes"
                    name="notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.notesPlaceholder}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingSym}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-teal-600 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-teal-500 disabled:opacity-50 transition"
              >
                <IconSend className="h-3.5 w-3.5" />
                {submittingSym ? t.checkinSending : t.checkinBtn}
              </button>
            </form>

            {call.symptomCheckins.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {call.symptomCheckins.map((sc) => (
                  <div
                    key={sc.id}
                    className={`rounded-xl border p-3 text-xs ${
                      sc.aiTriageLevel === "RED_EMERGENCY"
                        ? "border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200"
                        : sc.aiTriageLevel === "YELLOW"
                          ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200"
                          : "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="inline-flex items-center gap-1">
                        <IconAlertOctagon className="h-3.5 w-3.5" />
                        {sc.aiTriageLevel === "RED_EMERGENCY"
                          ? t.statusUrgent
                          : sc.aiTriageLevel === "YELLOW"
                            ? t.statusAttention
                            : t.statusNormal}{" "}
                        ({sc.bpReading})
                      </span>
                      <span className="font-mono text-[10px]">
                        {new Date(sc.createdAt).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p>
                      {lang === "ru"
                        ? sc.aiAdviceRu
                        : lang === "en"
                          ? sc.aiAdviceEn
                          : sc.aiAdviceUz}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Active Medicines & Adherence */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <IconPill className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              {t.rxTitle}
            </h2>
            {call.patient.prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {rx.medicationName} — {rx.dosage}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {rx.frequency} •{" "}
                    {lang === "ru"
                      ? rx.instructionsRu
                      : lang === "en"
                        ? rx.instructionsEn
                        : rx.instructionsUz}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {t.loggedDoses} {rx.adherenceLogs.length}
                  </p>
                </div>
                <button
                  onClick={() => handleAdherence(rx.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 px-3 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60"
                >
                  <IconCheck className="h-3.5 w-3.5" />
                  {t.takenBtn}
                </button>
              </div>
            ))}
          </section>

          {/* Hospital Results */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <IconFlask className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <InfoTooltip label={t.labsTitle} explanation={t.labsTip} />
            </h2>
            {call.patient.labReports.map((lab) => (
              <div key={lab.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-1.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{lab.panelName}</p>
                {lab.results.map((r, idx) => {
                  const labTip = getLabTooltip(r.testName, lang);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <span className="text-slate-600 dark:text-slate-300">
                        {labTip ? (
                          <InfoTooltip label={r.testName} explanation={labTip} />
                        ) : (
                          r.testName
                        )}
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {r.value} {r.unit}{" "}
                        {r.flag !== "NORMAL" && (
                          <span className="ml-1 text-[10px] text-rose-600 dark:text-rose-400">
                            ({t.flagAbnormal})
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </section>

          {/* 4-Digit Code / 1-Tap Visit Confirmation */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.confirmTitle}</h2>
            {call.status === "COMPLETED" ? (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <IconCircleCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                {t.confirmedPrefix}{" "}
                {call.visitVerifiedAt
                  ? new Date(call.visitVerifiedAt).toLocaleString("en-GB")
                  : ""}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <label htmlFor="patient-otp" className="sr-only">
                    {t.visitCodeLabel}
                  </label>
                  <input
                    id="patient-otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder={`${t.otpPlaceholder} ${call.patientOtpCode})`}
                    maxLength={4}
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
                  />
                  <button
                    onClick={() => handleConfirmVisit("OTP_4DIGIT")}
                    disabled={confirming || otpInput.length !== 4}
                    className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50"
                  >
                    {t.otpBtn}
                  </button>
                </div>
                <button
                  onClick={() => handleConfirmVisit("ONE_TAP_PORTAL")}
                  disabled={confirming}
                  className="w-full rounded-xl border border-teal-600 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/50 py-2.5 text-xs font-bold text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 disabled:opacity-50"
                >
                  {t.oneTapBtn}
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
