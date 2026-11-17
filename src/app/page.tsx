"use client";

import React from "react";
import Link from "next/link";
import {
  IconActivity,
  IconArrowRight,
  IconBuildingHospital,
  IconChecklist,
  IconClock,
  IconFileCode,
  IconHeartHandshake,
  IconLock,
  IconLogin,
  IconRobot,
  IconShieldCheck,
  IconSparkles,
  IconStethoscope,
  IconUserPlus,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage, type AppLang } from "@/context/LanguageContext";
import { PublicHeader } from "@/components/PublicHeader";
import type { UserRole } from "@/lib/types";

function getPortalHref(role: UserRole): string {
  if (role === "PATIENT") return "/patient";
  if (role === "ADMIN_RECEPTION") return "/admin";
  return "/clinical";
}

const LANDING_COPY: Record<
  AppLang,
  {
    badge: string;
    heroPrefix: string;
    heroHighlight: string;
    heroSuffix: string;
    heroDesc: string;
    ctaSignup: string;
    ctaSignin: string;
    ctaOpenPortal: string;
    trust1: string;
    trust2: string;
    trust3: string;
    pipeTitle: string;
    pipeSub: string;
    pipeBadge: string;
    steps: Array<{ step: string; title: string; desc: string }>;
    rbacEyebrow: string;
    rbacTitle: string;
    rbacSub: string;
    patientTitle: string;
    patientDesc: string;
    patientTag: string;
    patientCta: string;
    clinicalTitle: string;
    clinicalDesc: string;
    clinicalCta: string;
    adminTitle: string;
    adminDesc: string;
    adminCta: string;
    slaBadge: string;
    slaTitle: string;
    slaDesc: string;
    slaZones: Array<{ title: string; detail: string; tone: "green" | "yellow" | "red" }>;
    features: Array<{ title: string; desc: string }>;
    footerBrand: string;
    footerSignIn: string;
    footerSignUp: string;
  }
> = {
  en: {
    badge: "National AI Hackathon • Task #11: Automated Patronage System",
    heroPrefix: "OvaBMU → Family Polyclinic:",
    heroHighlight: "Zero-Gap 24-Hour",
    heroSuffix: "Maternal Continuity of Care",
    heroDesc:
      'The instant a high-risk maternal or perinatal patient is discharged from OvaBMU, our 4-Step Agentic AI Coordinator synthesizes her EHR and labs, dispatches an automated "Aktiv Chaqiruv" to the Regional Family Doctor, builds a tailored home-visit checklist, and enforces a strict 24-hour SLA.',
    ctaSignup: "Create Free Account",
    ctaSignin: "Sign In to Your Portal",
    ctaOpenPortal: "Open Your Portal",
    trust1: "AES-256-GCM Encrypted EHR",
    trust2: "HL7 FHIR R4 Compliant",
    trust3: "Strict Role-Isolated Portals",
    pipeTitle: "Agentic AI Continuity Pipeline",
    pipeSub: "Autonomous Post-Discharge Coordination",
    pipeBadge: "LIVE 24h SLA",
    steps: [
      {
        step: "01",
        title: "EHR & Lab Risk Synthesis",
        desc: "Scores post-discharge severity (ICD-10, Hb, BP, CRP) & extracts red flags.",
      },
      {
        step: "02",
        title: "Territorial Polyclinic Routing",
        desc: "Matches Mahalla/District to the Regional Family Doctor & books conflict-free slot.",
      },
      {
        step: "03",
        title: "Uzbek Clinical Checklist & Guide",
        desc: "Creates protocol checklist for doctor + UZ/RU/EN care guide for patient.",
      },
      {
        step: "04",
        title: "24h SLA Watchdog & Escalations",
        desc: "Auto-escalates at 12h (Yellow) & 18h (Red) until OTP-verified home visit.",
      },
    ],
    rbacEyebrow: "Role-Based Access Control (RBAC)",
    rbacTitle: "Three Strictly Isolated Portals — Accessed Only by Signing In",
    rbacSub:
      "Every user logs into a dedicated portal tailored strictly to their role. Patients only see their own recovery portal and never have access to doctors' clinical records or admin governance views.",
    patientTitle: "Patient Portal (/patient)",
    patientDesc:
      "Sign up as a patient to view only your own recovery plan, UZ/RU/EN home-care rules, active e-prescriptions, AI symptom triage check-in, and 1-tap / 4-digit OTP home visit confirmation.",
    patientTag: "Own Data Only",
    patientCta: "Sign up as Patient",
    clinicalTitle: "Doctors' Clinical Portal (/clinical)",
    clinicalDesc:
      "Dedicated workspace for OvaBMU Inpatient Doctors to trigger AI discharge handoffs, and Regional Family Doctors to execute 24h home patronage checklists, vitals logging, and lab/Rx orders.",
    clinicalCta: "Doctor Sign In",
    adminTitle: "Admin & SLA Governance (/admin)",
    adminDesc:
      "Monitor district 24-hour SLA countdowns, bed turnover, state-grant vs. paid diagnostic billing, HL7 FHIR R4 interoperability, and audit logs — with sensitive clinical notes RBAC-redacted.",
    adminCta: "Admin Sign In",
    slaBadge: "Zero-Gap 24-Hour SLA Escalation Ladder",
    slaTitle: "Automated Escalation Prevents Post-Discharge Drop-Offs",
    slaDesc:
      "In high-risk maternal care (severe preeclampsia, postpartum hemorrhage, post-cesarean sepsis), missing a 24-hour follow-up can be fatal. OnaCare AI continuously evaluates every active patronage window.",
    slaZones: [
      {
        title: "0 – 12 Hours • Green Zone",
        detail: "Assigned Family MD notified via Telegram & slot reserved",
        tone: "green",
      },
      {
        title: "12 – 18 Hours • Yellow Warning",
        detail: "Automated SLA warning dispatched to Doctor & Polyclinic Lead",
        tone: "yellow",
      },
      {
        title: "18 – 24+ Hours • Red Critical",
        detail: "District Medical Head & Reception alerted for immediate backup",
        tone: "red",
      },
    ],
    features: [
      {
        title: "OvaBMU Instant Epikriz",
        desc: "Generates structured Epikriz summaries and frees ICU/maternity beds with one click.",
      },
      {
        title: "Tailored UZ Checklists",
        desc: "Diagnosis-specific physical exam, vitals, and lab verification items for home visits.",
      },
      {
        title: "Patient AI Symptom Triage",
        desc: "Real-time blood pressure and red-flag check-ins auto-upgrade case priority when needed.",
      },
      {
        title: "HL7 FHIR R4 Ready",
        desc: "Standardized Patient, Encounter, CarePlan, Task, and MedicationRequest JSON bundles.",
      },
    ],
    footerBrand: "OnaCare AI — Automated Patronage System",
    footerSignIn: "Sign In",
    footerSignUp: "Sign Up",
  },
  uz: {
    badge: "National AI Hackathon • 11-topshiriq: Avtomatlashtirilgan Patronaj Tizimi",
    heroPrefix: "OvaBMU → Oilaviy Poliklinika:",
    heroHighlight: "24 Soatlik Uzluksiz",
    heroSuffix: "Onalik Salomatligi Nazorati",
    heroDesc:
      'Yuqori xavfli bemor OvaBMUdan uyga chiqarilgan zahoti, 4 bosqichli Agentic AI Koordinatori EHR va tahlillarni sintez qiladi, hududiy oilaviy shifokorga "Aktiv Chaqiruv" yuboradi, o\'zbek tilida ko\'rik checklistini tuzadi va qat\'iy 24 soatlik SLA muddatini nazorat qiladi.',
    ctaSignup: "Bepul Hisob Yaratish",
    ctaSignin: "Portalga Kirish",
    ctaOpenPortal: "Portalimga Kirish",
    trust1: "AES-256-GCM Shifrlangan EHR",
    trust2: "HL7 FHIR R4 Standarti",
    trust3: "Rolga Ajratilgan Portallar",
    pipeTitle: "Agentic AI Uzluksiz Zanjiri",
    pipeSub: "Chiqarishdan Keyingi Avtonom Koordinatsiya",
    pipeBadge: "JONLI 24h SLA",
    steps: [
      {
        step: "01",
        title: "EHR va Tahlil Xavfini Baholash",
        desc: "ICD-10, Hb, AQB va CRP asosida xavf ballini hisoblaydi va qizil bayroqlarni ajratadi.",
      },
      {
        step: "02",
        title: "Hududiy Poliklinika Marshrutizatsiyasi",
        desc: "Mahalla/tuman bo'yicha oilaviy shifokorni topadi va bo'sh tashrif vaqtini band qiladi.",
      },
      {
        step: "03",
        title: "O'zbekcha Checklist va Qo'llanma",
        desc: "Shifokor uchun klinik checklist va bemor uchun UZ/RU/EN parvarish rejasini tuzadi.",
      },
      {
        step: "04",
        title: "24 soatlik SLA Nazorati va Eskalatsiya",
        desc: "12 soatda (Sariq) va 18 soatda (Qizil) avtomatik ogohlantirishlar yuboradi.",
      },
    ],
    rbacEyebrow: "Rolga Asoslangan Kirish Nazorati (RBAC)",
    rbacTitle: "Uchta Qat'iy Ajratilgan Portal — Faqat Kirish Orqali Ochiladi",
    rbacSub:
      "Har bir foydalanuvchi faqat o'z roliga mos portalga kiradi. Bemorlar faqat shaxsiy sog'ayish kabinetini ko'radi va shifokorlar yoki admin boshqaruv oynalariga kira olmaydi.",
    patientTitle: "Bemor Portali (/patient)",
    patientDesc:
      "Bemor sifatida ro'yxatdan o'tib, faqat shaxsiy parvarish rejangizni, UZ/RU/EN uy qoidalarini, faol e-retseptlarni, AI simptom tekshiruvini va 4-xonali OTP tashrif tasdig'ini ko'ring.",
    patientTag: "Faqat shaxsiy ma'lumot",
    patientCta: "Bemor sifatida ro'yxatdan o'tish",
    clinicalTitle: "Shifokorlar Klinik Portali (/clinical)",
    clinicalDesc:
      "OvaBMU shifokorlari AI chiqarish handoffini boshlashi, hududiy oilaviy shifokorlar esa 24 soatlik uy patronaji checklisti, ko'rsatkichlar va tahlil buyurtmalarini bajarishi uchun.",
    clinicalCta: "Shifokor Kirishi",
    adminTitle: "Admin & SLA Boshqaruvi (/admin)",
    adminDesc:
      "Tuman 24 soatlik SLA taymerlari, koyka aylanmasi, davlat granti va pullik diagnostika hisoboti, HL7 FHIR R4 hamda maxfiy klinik izohlarsiz xavfsizlik auditini kuzating.",
    adminCta: "Admin Kirishi",
    slaBadge: "24 Soatlik SLA Eskalatsiya Zanjiri",
    slaTitle: "Avtomatik Eskalatsiya Bemor Nazoratidan Uzilishning Oldini Oladi",
    slaDesc:
      "Og'ir preeklampsiya, tug'ruqdan keyingi qon ketish yoki sepsis xavfi bo'lgan bemorlarda 24 soatlik ko'rikni kechiktirish hayotiy xavf tug'diradi. OnaCare AI har bir chaqiruvni uzluksiz kuzatadi.",
    slaZones: [
      {
        title: "0 – 12 Soat • Yashil Zona",
        detail: "Oilaviy shifokorga Telegram xabar yuboriladi va vaqt band qilinadi",
        tone: "green",
      },
      {
        title: "12 – 18 Soat • Sariq Ogohlantirish",
        detail: "Shifokor va poliklinika mudiriga avtomatik SLA ogohlantirish yuboriladi",
        tone: "yellow",
      },
      {
        title: "18 – 24+ Soat • Qizil Kritik",
        detail: "Tuman tibbiyot birlashmasi va qabulxonaga zudlik bilan zaxira signali",
        tone: "red",
      },
    ],
    features: [
      {
        title: "Tezkor OvaBMU Epikrizi",
        desc: "Tuzilgan epikriz hujjatini yaratadi va bir bosishda statsionar koykani bo'shatadi.",
      },
      {
        title: "Moslashtirilgan UZ Checklist",
        desc: "Tashxisga xos jismoniy ko'rik, vital ko'rsatkichlar va tahlil nazorati bandlari.",
      },
      {
        title: "Bemor AI Simptom Triaji",
        desc: "Qon bosimi va xavfli belgilarni kiritishda ustuvorlik darajasini avtomatik oshiradi.",
      },
      {
        title: "HL7 FHIR R4 Tayyor",
        desc: "Standartlashtirilgan Patient, Encounter, CarePlan, Task va MedicationRequest JSON paketlari.",
      },
    ],
    footerBrand: "OnaCare AI — Avtomatlashtirilgan Patronaj Tizimi",
    footerSignIn: "Kirish",
    footerSignUp: "Ro'yxatdan o'tish",
  },
  ru: {
    badge: "National AI Hackathon • Задача #11: Автоматизированная система патронажа",
    heroPrefix: "OvaBMU → Семейная поликлиника:",
    heroHighlight: "Непрерывный 24-часовой",
    heroSuffix: "контроль материнства",
    heroDesc:
      "Как только пациентка высокой группы риска выписывается из OvaBMU, 4-шаговый ИИ-координатор анализирует ЭМК и анализы, отправляет «Aktiv Chaqiruv» участковому семейному врачу, формирует чек-лист осмотра и контролирует строгий 24-часовой SLA.",
    ctaSignup: "Создать аккаунт бесплатно",
    ctaSignin: "Войти в портал",
    ctaOpenPortal: "Открыть мой портал",
    trust1: "Шифрование ЭМК AES-256-GCM",
    trust2: "Совместимость с HL7 FHIR R4",
    trust3: "Изолированные порталы по ролям",
    pipeTitle: "Конвейер ИИ-координации",
    pipeSub: "Автономное сопровождение после выписки",
    pipeBadge: "LIVE 24ч SLA",
    steps: [
      {
        step: "01",
        title: "Синтез рисков ЭМК и анализов",
        desc: "Оценивает тяжесть (МКБ-10, Hb, АД, СРБ) и выделяет критические красные флаги.",
      },
      {
        step: "02",
        title: "Территориальная маршрутизация",
        desc: "Подбирает семейного врача по махалле/району и бронирует свободный слот визита.",
      },
      {
        step: "03",
        title: "Клинический чек-лист и памятка",
        desc: "Создает протокол осмотра для врача и руководство UZ/RU/EN для пациентки.",
      },
      {
        step: "04",
        title: "Контроль 24ч SLA и эскалация",
        desc: "Эскалация на 12ч (Желтая) и 18ч (Красная) до подтверждения визита по OTP.",
      },
    ],
    rbacEyebrow: "Ролевой контроль доступа (RBAC)",
    rbacTitle: "Три строго изолированных портала — доступ только после входа",
    rbacSub:
      "Каждый пользователь попадает исключительно в портал своей роли. Пациентки видят только свой план восстановления без доступа к клиническим данным врачей или панели администратора.",
    patientTitle: "Портал пациента (/patient)",
    patientDesc:
      "Зарегистрируйтесь как пациентка, чтобы видеть только свой план ухода, правила на UZ/RU/EN, активные е-рецепты, ИИ-триаж симптомов и подтверждение визита врача 4-значным OTP.",
    patientTag: "Только свои данные",
    patientCta: "Регистрация пациента",
    clinicalTitle: "Клинический портал врачей (/clinical)",
    clinicalDesc:
      "Рабочее пространство для врачей OvaBMU (выписка и запуск ИИ-патронажа) и семейных врачей (24ч чек-лист на дому, показатели витальных функций, анализы и рецепты).",
    clinicalCta: "Вход для врачей",
    adminTitle: "Администрирование и SLA (/admin)",
    adminDesc:
      "Мониторинг 24-часовых таймеров SLA по районам, освобождения коек, госгрантов и платных услуг, HL7 FHIR R4 и журнала аудита с защитой врачебной тайны.",
    adminCta: "Вход для админа",
    slaBadge: "Лестница эскалации 24-часового SLA",
    slaTitle: "Автоматическая эскалация предотвращает потерю связи после выписки",
    slaDesc:
      "При тяжелой преэклампсии, кровотечении или риске сепсиса пропуск 24-часового визита смертельно опасен. OnaCare AI непрерывно отслеживает каждый активный вызов.",
    slaZones: [
      {
        title: "0 – 12 часов • Зеленая зона",
        detail: "Семейный врач уведомлен в Telegram, время визита зарезервировано",
        tone: "green",
      },
      {
        title: "12 – 18 часов • Желтое предупреждение",
        detail: "Автоматическое предупреждение врачу и заведующему поликлиники",
        tone: "yellow",
      },
      {
        title: "18 – 24+ часов • Красный критический уровень",
        detail: "Сигнал руководителю РМО и приемной для экстренной подмены",
        tone: "red",
      },
    ],
    features: [
      {
        title: "Мгновенный эпикриз OvaBMU",
        desc: "Формирует структурированный эпикриз и освобождает койку в один клик.",
      },
      {
        title: "Целевые чек-листы осмотра",
        desc: "Специфичные для диагноза пункты осмотра, витальных показателей и анализов.",
      },
      {
        title: "ИИ-триаж симптомов пациентки",
        desc: "Контроль давления и тревожных симптомов с мгновенным повышением приоритета.",
      },
      {
        title: "Поддержка HL7 FHIR R4",
        desc: "Стандартизированные JSON-пакеты Patient, Encounter, CarePlan, Task и MedicationRequest.",
      },
    ],
    footerBrand: "OnaCare AI — Автоматизированная система патронажа",
    footerSignIn: "Войти",
    footerSignUp: "Регистрация",
  },
};

export default function LandingPage() {
  const { authUser, authChecked } = usePlatform();
  const { lang } = useLanguage();
  const t = LANDING_COPY[lang];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <PublicHeader showAnchors />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 py-12 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 px-3.5 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <IconSparkles className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  <span>{t.badge}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                  {t.heroPrefix}{" "}
                  <span className="text-teal-700 dark:text-teal-400">{t.heroHighlight}</span>{" "}
                  {t.heroSuffix}
                </h1>

                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">
                  {t.heroDesc}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {authChecked && authUser ? (
                    <Link
                      href={getPortalHref(authUser.role)}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition"
                    >
                      {t.ctaOpenPortal}
                      <IconArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition"
                      >
                        <IconUserPlus className="h-4 w-4" />
                        {t.ctaSignup}
                      </Link>
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                      >
                        <IconLogin className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        {t.ctaSignin}
                      </Link>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <IconLock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    {t.trust1}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <IconFileCode className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    {t.trust2}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <IconShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    {t.trust3}
                  </span>
                </div>
              </div>

              {/* Architectural Preview Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 p-6 text-white shadow-xl space-y-5">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        <IconRobot className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{t.pipeTitle}</p>
                        <p className="text-[11px] text-slate-400">{t.pipeSub}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                      {t.pipeBadge}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {t.steps.map((item) => (
                      <div
                        key={item.step}
                        className="flex items-start gap-3 rounded-xl bg-slate-800/80 p-3 border border-slate-700/80"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-600 text-[11px] font-bold text-white font-mono">
                          {item.step}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-100">{item.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Separated Role Portals */}
        <section id="portals" className="mx-auto max-w-7xl px-4 py-14 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              {t.rbacEyebrow}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t.rbacTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t.rbacSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <IconHeartHandshake className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {t.patientTitle}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {t.patientDesc}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  {t.patientTag}
                </span>
                <Link
                  href="/signup?role=PATIENT"
                  className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  {t.patientCta} <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <IconStethoscope className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {t.clinicalTitle}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {t.clinicalDesc}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  OVABMU_MD &amp; FAMILY_MD
                </span>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-400 hover:underline"
                >
                  {t.clinicalCta} <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                  <IconShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {t.adminTitle}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {t.adminDesc}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  ADMIN_RECEPTION
                </span>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 hover:underline"
                >
                  {t.adminCta} <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow & SLA Architecture */}
        <section id="workflow" className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-14">
          <div className="mx-auto max-w-7xl px-4 space-y-10">
            <div id="sla" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-950/60 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <IconClock className="h-3.5 w-3.5" />
                  {t.slaBadge}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t.slaTitle}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.slaDesc}
                </p>
                <div className="space-y-2.5 text-xs">
                  {t.slaZones.map((zone) => (
                    <div
                      key={zone.title}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 rounded-xl border px-4 py-3 ${
                        zone.tone === "green"
                          ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40"
                          : zone.tone === "yellow"
                            ? "border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40"
                            : "border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40"
                      }`}
                    >
                      <span
                        className={`font-bold ${
                          zone.tone === "green"
                            ? "text-emerald-900 dark:text-emerald-300"
                            : zone.tone === "yellow"
                              ? "text-amber-900 dark:text-amber-300"
                              : "text-rose-900 dark:text-rose-300"
                        }`}
                      >
                        {zone.title}
                      </span>
                      <span
                        className={`font-medium sm:text-right ${
                          zone.tone === "green"
                            ? "text-emerald-700 dark:text-emerald-300"
                            : zone.tone === "yellow"
                              ? "text-amber-800 dark:text-amber-300"
                              : "text-rose-800 dark:text-rose-300"
                        }`}
                      >
                        {zone.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-5 space-y-2">
                  <IconBuildingHospital className="h-6 w-6 text-teal-700 dark:text-teal-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.features[0].title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {t.features[0].desc}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-5 space-y-2">
                  <IconChecklist className="h-6 w-6 text-teal-700 dark:text-teal-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.features[1].title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {t.features[1].desc}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-5 space-y-2">
                  <IconActivity className="h-6 w-6 text-teal-700 dark:text-teal-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.features[2].title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {t.features[2].desc}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-5 space-y-2">
                  <IconFileCode className="h-6 w-6 text-teal-700 dark:text-teal-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.features[3].title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {t.features[3].desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 text-slate-400 py-8">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <IconHeartHandshake className="h-4 w-4 text-teal-400" />
            {t.footerBrand}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/login" className="hover:text-white transition">
              {t.footerSignIn}
            </Link>
            <Link href="/signup" className="hover:text-white transition">
              {t.footerSignUp}
            </Link>
            <span>AES-256-GCM • HL7 FHIR R4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
