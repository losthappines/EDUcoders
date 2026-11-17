"use client";

import React from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconBuildingHospital,
  IconClock,
  IconFileCode,
  IconLock,
  IconRobot,
  IconShieldCheck,
} from "@tabler/icons-react";
import { PublicHeader } from "@/components/PublicHeader";
import { InfoTooltip } from "@/components/InfoTooltip";
import { useLanguage, type AppLang } from "@/context/LanguageContext";

const TECH_COPY: Record<
  AppLang,
  {
    badge: string;
    title: string;
    subtitle: string;
    backHome: string;
    pipelineTitle: string;
    pipelineSteps: Array<{ step: string; title: string; desc: string }>;
    securityTitle: string;
    securityDesc: string;
    interoperabilityTitle: string;
    interoperabilityDesc: string;
    escalationTitle: string;
    escalationDesc: string;
    termsTitle: string;
    terms: Array<{ term: string; explanation: string }>;
  }
> = {
  uz: {
    badge: "Klinikalar, shifokorlar va texnik jamoalar uchun",
    title: "Klinik standartlar, ma'lumotlar xavfsizligi va tizim arxitekturasi",
    subtitle:
      "Bemorlarga mo'ljallangan bosh sahifa sodda tilda yozilgan. Ushbu sahifada shifokorlar va klinika mutaxassislari uchun klinik hamda texnik tafsilotlar keltirilgan.",
    backHome: "Bosh sahifaga qaytish",
    pipelineTitle: "4 bosqichli avtomatik koordinator (Agentic AI Pipeline)",
    pipelineSteps: [
      {
        step: "01",
        title: "Chiqarish ma'lumotlari va tahlillarni baholash",
        desc: "ICD-10 tashxis kodi, gemoglobin (Hb), qon bosimi (AQB) va C-reaktiv oqsil (CRP) bo'yicha xavf balli hisoblanadi.",
      },
      {
        step: "02",
        title: "Hududiy poliklinikaga marshrutlash",
        desc: "Bemorning tumani va mahallasi (MFY) bo'yicha biriktirilgan oilaviy shifokor topilib, bo'sh tashrif oynasi band qilinadi.",
      },
      {
        step: "03",
        title: "Klinik tekshiruv ro'yxati va UZ/RU/EN qo'llanma",
        desc: "Oilaviy shifokor uchun tashxisga xos tekshiruv ro'yxati, bemor uchun esa tushunarli uy parvarishi qoidalari yaratiladi.",
      },
      {
        step: "04",
        title: "24 soatlik SLA nazorati va eskalatsiya",
        desc: "12 soatda (Sariq) va 18 soatda (Qizil) avtomatik eslatmalar yuborilib, 4 xonali OTP tasdig'igacha kuzatib boriladi.",
      },
    ],
    securityTitle: "Ma'lumotlar shifrlanishi va RBAC kirish nazorati",
    securityDesc:
      "JSHSHIR va klinik izohlar ma'lumotlar bazasida AES-256-GCM algoritmi bilan shifrlanadi. Rolga asoslangan kirish nazorati (RBAC) bemorlarni faqat shaxsiy kabinetida saqlaydi, administratorlarga esa maxfiy shifokor izohlarini yopiq holda ko'rsatadi.",
    interoperabilityTitle: "HL7 FHIR R4 integratsiyasi",
    interoperabilityDesc:
      "Har bir faol chaqiruv standartlashtirilgan Patient, Encounter, CarePlan, Task va MedicationRequest JSON paketlari ko'rinishida eksport qilinadi.",
    escalationTitle: "24 soatlik SLA eskalatsiya zinapoyasi",
    escalationDesc:
      "0–12 soat: Yashil (reja bo'yicha) • 12–18 soat: Sariq (poliklinika mudiriga ogohlantirish) • 18–24+ soat: Qizil (tuman mas'uliga zudlik signali).",
    termsTitle: "Klinik va texnik atamalar lug'ati",
    terms: [
      {
        term: "OvaBMU",
        explanation: "Respublika Ona va Bola Salomatligi Markazi (tug'ruq va perinatal shifoxona).",
      },
      {
        term: "Epikriz",
        explanation: "Bemor shifoxonadan chiqayotganda yoziladigan yakuniy tibbiy xulosa.",
      },
      {
        term: "ICD-10",
        explanation: "Kasalliklarning xalqaro 10-tasnif kodi (masalan, Z39.2 yoki O14.1).",
      },
      {
        term: "Hb / CRP",
        explanation: "Hb — qondagi gemoglobin darajasi; CRP — yallig'lanish ko'rsatkichi (C-reaktiv oqsil).",
      },
      {
        term: "SLA (24h)",
        explanation: "Xizmat ko'rsatish kafolat muddati: oilaviy shifokorning 24 soat ichida tashrif buyurish majburiyati.",
      },
      {
        term: "RBAC",
        explanation: "Rolga asoslangan kirish nazorati — har bir foydalanuvchi faqat o'z vazifasiga doir ma'lumotni ko'radi.",
      },
      {
        term: "AES-256-GCM",
        explanation: "Tibbiy yozuvlar va shaxsiy identifikatorlarni himoyalovchi zamonaviy shifrlash standarti.",
      },
      {
        term: "HL7 FHIR R4",
        explanation: "Klinikalar va laboratoriyalar o'rtasida tibbiy ma'lumot almashishning xalqaro standarti.",
      },
    ],
  },
  ru: {
    badge: "Для клиник, врачей и технических специалистов",
    title: "Клинические стандарты, безопасность данных и архитектура системы",
    subtitle:
      "Главная страница написана простым языком для пациенток. Здесь собраны клинические и технические подробности для медицинских учреждений и специалистов.",
    backHome: "На главную страницу",
    pipelineTitle: "4-шаговый координатор (Agentic AI Pipeline)",
    pipelineSteps: [
      {
        step: "01",
        title: "Оценка выписки и лабораторных рисков",
        desc: "Анализируются код МКБ-10 (ICD-10), гемоглобин (Hb), давление (АД) и С-реактивный белок (CRP).",
      },
      {
        step: "02",
        title: "Территориальная маршрутизация",
        desc: "Система находит участкового семейного врача по махалле/району и бронирует свободное окно визита.",
      },
      {
        step: "03",
        title: "Клинический чек-лист и памятка UZ/RU/EN",
        desc: "Создается протокол осмотра для врача и понятная памятка по уходу на дому для мамы.",
      },
      {
        step: "04",
        title: "Контроль 24ч SLA и эскалация",
        desc: "Напоминания на 12 ч (Желтая зона) и 18 ч (Красная зона) до подтверждения визита по OTP.",
      },
    ],
    securityTitle: "Шифрование данных и контроль доступа RBAC",
    securityDesc:
      "ПИНФЛ (JSHSHIR) и клинические заметки шифруются в базе по стандарту AES-256-GCM. Ролевой доступ (RBAC) изолирует кабинеты пациенток, врачей и администраторов.",
    interoperabilityTitle: "Интеграция HL7 FHIR R4",
    interoperabilityDesc:
      "Каждый вызов доступен в виде стандартизированного JSON-пакета (Patient, Encounter, CarePlan, Task, MedicationRequest).",
    escalationTitle: "Лестница эскалации 24-часового SLA",
    escalationDesc:
      "0–12 ч: Зеленая (в графике) • 12–18 ч: Желтая (предупреждение заведующему) • 18–24+ ч: Красная (срочная замена врачом).",
    termsTitle: "Словарь медицинских и технических терминов",
    terms: [
      {
        term: "OvaBMU",
        explanation: "Центр здоровья матери и ребенка (перинатальный стационар).",
      },
      {
        term: "Эпикриз (Epikriz)",
        explanation: "Итоговая медицинская выписка из роддома с рекомендациями.",
      },
      {
        term: "ICD-10 (МКБ-10)",
        explanation: "Международная классификация болезней 10-го пересмотра.",
      },
      {
        term: "Hb / CRP",
        explanation: "Hb — уровень гемоглобина в крови; CRP — маркер воспаления (С-реактивный белок).",
      },
      {
        term: "SLA (24ч)",
        explanation: "Гарантированный срок обслуживания: визит семейного врача в течение 24 часов после выписки.",
      },
      {
        term: "RBAC",
        explanation: "Контроль доступа по ролям — каждый видит только данные своей роли.",
      },
      {
        term: "AES-256-GCM",
        explanation: "Криптографический стандарт шифрования медицинских записей и персональных данных.",
      },
      {
        term: "HL7 FHIR R4",
        explanation: "Международный стандарт обмена электронными медицинскими картами.",
      },
    ],
  },
  en: {
    badge: "For Clinics, Doctors & Technical Reviewers",
    title: "Clinical Standards, Encryption & Care Coordination Architecture",
    subtitle:
      "Our patient-facing homepage stays plain and reassuring. This page explains the underlying clinical protocols, security model, and hospital interoperability.",
    backHome: "Back to Home",
    pipelineTitle: "4-Step Agentic AI Continuity Pipeline",
    pipelineSteps: [
      {
        step: "01",
        title: "EHR & Lab Risk Synthesis",
        desc: "Scores post-discharge severity using ICD-10 diagnosis codes, Hb, blood pressure, and CRP markers.",
      },
      {
        step: "02",
        title: "Territorial Polyclinic Routing",
        desc: "Matches the patient's district and mahalla (MFY) to a regional Family MD and reserves a conflict-free visit slot.",
      },
      {
        step: "03",
        title: "Tailored Clinical Checklist & UZ/RU/EN Guide",
        desc: "Generates diagnosis-specific physical exam steps for doctors plus multilingual home-care guides.",
      },
      {
        step: "04",
        title: "24h SLA Watchdog & Escalations",
        desc: "Triggers warnings at 12h (Yellow) and urgent escalations at 18h (Red) until OTP visit verification.",
      },
    ],
    securityTitle: "AES-256-GCM Encryption & RBAC Isolation",
    securityDesc:
      "Sensitive identifiers (JSHSHIR) and inpatient clinical notes are encrypted at rest using AES-256-GCM. Strict Role-Based Access Control (RBAC) keeps patient, clinical, and admin portals isolated and redacts private clinical notes from reception views.",
    interoperabilityTitle: "HL7 FHIR R4 Interoperability",
    interoperabilityDesc:
      "Every discharge handoff exports standardized HL7 FHIR R4 JSON bundles containing Patient, Encounter, CarePlan, Task, and MedicationRequest resources.",
    escalationTitle: "24-Hour SLA Escalation Ladder",
    escalationDesc:
      "0–12h: Green (family doctor notified) • 12–18h: Yellow (polyclinic lead alerted) • 18–24h+: Red (district coordinator backup dispatch).",
    termsTitle: "Glossary of Clinical & Technical Terms",
    terms: [
      {
        term: "OvaBMU",
        explanation: "Maternal and Perinatal Health Center (inpatient maternity hospital).",
      },
      {
        term: "Epikriz",
        explanation: "Hospital discharge summary containing diagnosis, treatment, and home-care plan.",
      },
      {
        term: "ICD-10",
        explanation: "International Classification of Diseases (10th revision) standard diagnosis codes.",
      },
      {
        term: "Hb / CRP",
        explanation: "Hb is Hemoglobin (iron/oxygen protein in blood); CRP is C-reactive protein (inflammation marker).",
      },
      {
        term: "SLA (24h)",
        explanation: "Service Level Agreement guaranteeing a family doctor home visit within 24 hours of discharge.",
      },
      {
        term: "RBAC",
        explanation: "Role-Based Access Control ensuring users only access data authorized for their role.",
      },
      {
        term: "AES-256-GCM",
        explanation: "Authenticated encryption standard protecting personal IDs and sensitive clinical notes at rest.",
      },
      {
        term: "HL7 FHIR R4",
        explanation: "Healthcare data exchange standard used to share structured patient records between clinics.",
      },
    ],
  },
};

export default function TechnologyPage() {
  const { lang } = useLanguage();
  const t = TECH_COPY[lang];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10 space-y-8">
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
          >
            <IconArrowLeft className="h-3.5 w-3.5" />
            {t.backHome}
          </Link>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 px-3 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <IconBuildingHospital className="h-3.5 w-3.5" />
              {t.badge}
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {t.title}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Pipeline */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <IconRobot className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            {t.pipelineTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {t.pipelineSteps.map((s) => (
              <div
                key={s.step}
                className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-600 font-mono text-[11px] font-bold text-white">
                  {s.step}
                </span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{s.title}</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
            <IconLock className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.securityTitle}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.securityDesc}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
            <IconFileCode className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.interoperabilityTitle}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.interoperabilityDesc}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
            <IconClock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.escalationTitle}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.escalationDesc}
            </p>
          </div>
        </div>

        {/* Glossary with interactive tooltips */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <IconShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            {t.termsTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {t.terms.map((item) => (
              <div
                key={item.term}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5 space-y-1.5"
              >
                <div className="font-mono font-bold text-teal-700 dark:text-teal-400">
                  <InfoTooltip label={item.term} explanation={item.explanation} />
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
