"use client";
import React from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandTelegram,
  IconBuildingHospital,
  IconClock,
  IconFileCode,
  IconLock,
  IconMapPin,
  IconRobot,
  IconShieldCheck,
  IconStethoscope,
  IconUserPlus,
} from "@tabler/icons-react";
import { PublicHeader } from "@/components/PublicHeader";
import { InfoTooltip } from "@/components/InfoTooltip";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/context/LanguageContext";

const TECH_COPY = {
  uz: {
    badge: "Klinikalar, shifokorlar va texnik jamoalar uchun",
    title: "Tizim arxitekturasi, klinik standartlar va ma'lumotlar xavfsizligi",
    subtitle:
      "Bemorlarga mo'ljallangan bosh sahifa sodda tilda yozilgan. Ushbu sahifada shifokorlar, poliklinika koordinatorlari va texnik mutaxassislar uchun ish jarayoni hamda arxitektura keltirilgan.",
    backHome: "Bosh sahifaga qaytish",
    proTitle: "Mutaxassislar va klinikalar uchun tezkor kirish",
    proDoctorLogin: "Shifokor / Hamshira kirishi",
    proDoctorSignup: "Shifokor ro'yxatdan o'tishi",
    proCoordLogin: "Koordinator kirishi",
    proTgConsole: "Telegram Bot boshqaruvi",
    archEyebrow: "Platforma arxitekturasi",
    archTitle: "3 kirish kanali → Administrator nazorati → Bemor va Shifokor kabinetlari",
    archSub:
      "Telegram bot, oddiy shakl yoki SI (Sun'iy intellekt) yordamchisi orqali GPS lokatsiya bilan ro'yxatdan o'ting. Administrator barcha hisoblarni tasdiqlaydi va tashriflarni kuzatadi.",
    archChannelsTitle: "1. Kirish va ro'yxatdan o'tish",
    archHubTitle: "2. Administrator boshqaruv markazi",
    archPortalsTitle: "3. Asosiy shaxsiy kabinetlar",
    archChannelTelegram: "Telegram Bot (GPS + Shikoyat + Chat)",
    archChannelAccount: "Hisob shakli (Bemor / Shifokor)",
    archChannelAi: "SI yordamchisi (Savol-javob asosida)",
    archHubDesc:
      "Bemor va shifokorlarni tasdiqlaydi, GPS yo'naltirishni boshqaradi va Telegram eslatma yuboradi",
    archBemorTitle: "Bemor shaxsiy kabineti",
    archBemorDesc:
      "Shikoyat + GPS manzil, hamshira/shifokor boradigan joyni tanlash, shifokor bilan maslahat chati va obuna",
    archShifokorTitle: "Shifokor shaxsiy kabineti",
    archShifokorDesc:
      "Ekspertiza, tajriba yili va GPS ulashish, eng yaqin bemorlarni ko'rish va joyida tasdiqlash",
    pipelineTitle: "4 bosqichli avtomatik koordinator (SI jarayoni)",
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
        explanation: "Ona va Bola Salomatligi Markazi (tug'ruq va perinatal shifoxona).",
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
        explanation: "Xizmat ko'rsatish muddati: oilaviy shifokorning 24 soat ichida tashrif buyurish maqsadli ko'rsatkichi.",
      },
      {
        term: "RBAC",
        explanation: "Rolga asoslangan kirish nazorati — har bir foydalanuvchi faqat o'z vazifasiga doir ma'lumotni ko'radi.",
      },
      {
        term: "AES-256-GCM",
        explanation: "Tibbiy yozuvlar va shaxsiy identifikatorlarni himoyalovchi shifrlash standarti.",
      },
      {
        term: "HL7 FHIR R4",
        explanation: "Klinikalar va laboratoriyalar o'rtasida tibbiy ma'lumot almashishning xalqaro standarti.",
      },
    ],
  },
  ru: {
    badge: "Для клиник, врачей и технических специалистов",
    title: "Архитектура системы, клинические стандарты и защита данных",
    subtitle:
      "Главная страница написана простым языком для мам. Здесь собраны архитектура платформы, вход для специалистов и технические детали.",
    backHome: "На главную страницу",
    proTitle: "Быстрый доступ для врачей и координаторов клиник",
    proDoctorLogin: "Вход для врачей и медсестер",
    proDoctorSignup: "Регистрация врача",
    proCoordLogin: "Вход для координатора",
    proTgConsole: "Консоль Telegram Бота",
    archEyebrow: "Архитектура платформы",
    archTitle: "3 канала входа → Панель администратора → Кабинеты пациента и врача",
    archSub:
      "Регистрация через Telegram-бот, стандартную форму или ИИ-помощника (SI) с GPS-локацией. Администратор верифицирует аккаунты и контролирует визиты.",
    archChannelsTitle: "1. Каналы входа",
    archHubTitle: "2. Панель администратора",
    archPortalsTitle: "3. Основные кабинеты",
    archChannelTelegram: "Telegram Бот (GPS + Жалобы + Чат)",
    archChannelAccount: "Анкета (Форма пациента / врача)",
    archChannelAi: "ИИ-помощник (Пошаговый опрос)",
    archHubDesc:
      "Проверяет пациентов и врачей, координирует GPS-вызовы и отправляет напоминания в Telegram",
    archBemorTitle: "Кабинет пациента",
    archBemorDesc:
      "Жалоба с GPS, выбор точки приезда врача/медсестры, прямой чат с врачом и подписка",
    archShifokorTitle: "Кабинет врача",
    archShifokorDesc:
      "Специализация, стаж и GPS, список ближайших пациенток и подтверждение осмотра на месте",
    pipelineTitle: "4-шаговый координатор (Конвейер ИИ)",
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
        explanation: "Целевой срок визита семейного врача в течение 24 часов после выписки.",
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
    title: "Platform Architecture, Clinical Standards & Encryption",
    subtitle:
      "Our patient-facing homepage stays plain and uncluttered. This page hosts our system architecture, professional portal entry points, clinical protocols, and security controls.",
    backHome: "Back to Home",
    proTitle: "Quick Access for Healthcare Professionals",
    proDoctorLogin: "Doctor / Nurse Sign In",
    proDoctorSignup: "Doctor Registration",
    proCoordLogin: "Coordinator Sign In",
    proTgConsole: "Telegram Bot Console",
    archEyebrow: "Platform Architecture",
    archTitle: "3 Entry Channels → Admin Hub → Patient & Doctor Portals",
    archSub:
      "Sign up via Telegram Bot, standard Account form, or SI (AI Helper) with optional GPS coordinates. Clinic administrators verify every account and coordinate dispatch.",
    archChannelsTitle: "1. Entry & Sign-Up Channels",
    archHubTitle: "2. Admin Dashboard",
    archPortalsTitle: "3. Core Portals",
    archChannelTelegram: "Telegram Bot (GPS + Complaints + Chat)",
    archChannelAccount: "Account Form (Patient / Doctor)",
    archChannelAi: "SI / AI Helper (Guided Q&A)",
    archHubDesc:
      "Verifies Patient & Doctor accounts, coordinates GPS complaint dispatch, and sends Telegram visit reminders",
    archBemorTitle: "Patient Portal",
    archBemorDesc:
      "Submit complaints with GPS, choose visit destination, direct advice chat & optional subscriptions",
    archShifokorTitle: "Doctor Portal",
    archShifokorDesc:
      "Share specialty, experience & GPS, view nearest patients & verify visits on-site",
    pipelineTitle: "4-Step Care Continuity Pipeline",
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
        explanation: "Service Level target for a family doctor home visit within 24 hours of discharge.",
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
  const t = TECH_COPY[lang] || TECH_COPY.uz;
  const homeHref = lang === "ru" ? "/ru" : lang === "en" ? "/en" : "/";

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EF] dark:bg-[#161A18] text-[#292E2B] dark:text-[#F3F0E8] transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 mx-auto w-full max-w-6xl px-5 sm:px-8 py-12 space-y-14">
        <div className="space-y-4 border-b border-[#DDD8CC] dark:border-[#2F3632] pb-8">
          <Link href={homeHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:underline underline-offset-4">
            <IconArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t.backHome}
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#244C40] dark:text-[#A7BBAA] flex items-center gap-2 pt-2">
            <IconBuildingHospital className="h-4 w-4" aria-hidden="true" />
            {t.badge}
          </p>
          <h1 className="font-heading text-2xl sm:text-4xl font-semibold tracking-tight text-[#292E2B] dark:text-[#F3F0E8]">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-[#525954] dark:text-[#B6BCB6] max-w-3xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Institutional & Professional Portals */}
        <section className="space-y-4">
          <h2 className="font-heading text-base font-semibold text-[#292E2B] dark:text-[#F3F0E8]">
            {t.proTitle}
          </h2>
          <div className="flex flex-wrap gap-3 text-xs">
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm bg-[#244C40] hover:bg-[#1A382F] dark:bg-[#2C5B4D] dark:hover:bg-[#356D5C] px-5 py-2.5 font-semibold text-[#F7F5EF] transition-colors"
            >
              <IconStethoscope className="h-4 w-4" aria-hidden="true" />
              {t.proDoctorLogin}
            </Link>
            <Link
              href="/signup?role=DOCTOR"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm border border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF] dark:bg-[#1D221F] px-5 py-2.5 font-semibold text-[#292E2B] dark:text-[#F3F0E8] hover:bg-[#EFECE3] dark:hover:bg-[#242A27] transition-colors"
            >
              <IconUserPlus className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]" aria-hidden="true" />
              {t.proDoctorSignup}
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm border border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF] dark:bg-[#1D221F] px-5 py-2.5 font-semibold text-[#292E2B] dark:text-[#F3F0E8] hover:bg-[#EFECE3] dark:hover:bg-[#242A27] transition-colors"
            >
              <IconShieldCheck className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]" aria-hidden="true" />
              {t.proCoordLogin}
            </Link>
            <Link
              href="/telegram"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm border border-[#DDD8CC] dark:border-[#2F3632] bg-[#EFECE3] dark:bg-[#242A27] px-5 py-2.5 font-semibold text-[#244C40] dark:text-[#F3F0E8] hover:bg-[#E4DFD2] dark:hover:bg-[#2F3632] transition-colors"
            >
              <IconBrandTelegram className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]" aria-hidden="true" />
              {t.proTgConsole}
            </Link>
          </div>
        </section>

        {/* System Architecture (3-Column Swiss Grid) */}
        <section className="border-t border-[#DDD8CC] dark:border-[#2F3632] pt-10 space-y-6">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#244C40] dark:text-[#A7BBAA]">
              {t.archEyebrow}
            </p>
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-[#292E2B] dark:text-[#F3F0E8]">
              {t.archTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#525954] dark:text-[#B6BCB6] max-w-3xl">
              {t.archSub}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 border-t border-l border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF] dark:bg-[#1D221F]">
            <div className="border-r border-b border-[#DDD8CC] dark:border-[#2F3632] p-6 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#525954] dark:text-[#B6BCB6]">
                {t.archChannelsTitle}
              </p>
              <div className="divide-y divide-[#DDD8CC] dark:divide-[#2F3632] border-y border-[#DDD8CC] dark:border-[#2F3632] text-xs">
                <Link href="/telegram" className="flex items-center justify-between gap-2 py-3 hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors">
                  <span className="flex items-center gap-2 font-medium">
                    <IconBrandTelegram className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA] shrink-0" aria-hidden="true" />
                    {t.archChannelTelegram}
                  </span>
                  <IconArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </Link>
                <Link href="/signup" className="flex items-center justify-between gap-2 py-3 hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors">
                  <span className="flex items-center gap-2 font-medium">
                    <IconUserPlus className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA] shrink-0" aria-hidden="true" />
                    {t.archChannelAccount}
                  </span>
                  <IconArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </Link>
                <Link href="/signup" className="flex items-center justify-between gap-2 py-3 hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors">
                  <span className="flex items-center gap-2 font-medium">
                    <IconRobot className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA] shrink-0" aria-hidden="true" />
                    {t.archChannelAi}
                  </span>
                  <IconArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="border-r border-b border-[#DDD8CC] dark:border-[#2F3632] bg-[#EFECE3]/60 dark:bg-[#242A27]/60 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#244C40] dark:text-[#A7BBAA]">
                  {t.archHubTitle}
                </p>
                <p className="text-xs sm:text-sm text-[#292E2B] dark:text-[#F3F0E8] leading-relaxed">
                  {t.archHubDesc}
                </p>
              </div>
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:underline underline-offset-4">
                {t.proCoordLogin} <IconArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="border-r border-b border-[#DDD8CC] dark:border-[#2F3632] p-6 space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#525954] dark:text-[#B6BCB6]">
                {t.archPortalsTitle}
              </p>
              <div className="divide-y divide-[#DDD8CC] dark:divide-[#2F3632] border-y border-[#DDD8CC] dark:border-[#2F3632] text-xs">
                <div className="py-3 space-y-1">
                  <p className="font-heading font-semibold text-[#292E2B] dark:text-[#F3F0E8] flex items-center gap-1.5">
                    <IconMapPin className="h-3.5 w-3.5 text-[#244C40] dark:text-[#A7BBAA]" aria-hidden="true" />
                    {t.archBemorTitle}
                  </p>
                  <p className="text-[11px] text-[#525954] dark:text-[#B6BCB6] leading-relaxed">{t.archBemorDesc}</p>
                </div>
                <div className="py-3 space-y-1">
                  <p className="font-heading font-semibold text-[#292E2B] dark:text-[#F3F0E8] flex items-center gap-1.5">
                    <IconStethoscope className="h-3.5 w-3.5 text-[#244C40] dark:text-[#A7BBAA]" aria-hidden="true" />
                    {t.archShifokorTitle}
                  </p>
                  <p className="text-[11px] text-[#525954] dark:text-[#B6BCB6] leading-relaxed">{t.archShifokorDesc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pipeline */}
        <section className="space-y-5">
          <h2 className="font-heading text-lg font-semibold text-[#292E2B] dark:text-[#F3F0E8] flex items-center gap-2">
            <IconRobot className="h-5 w-5 text-[#244C40] dark:text-[#A7BBAA]" aria-hidden="true" />
            {t.pipelineTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF] dark:bg-[#1D221F] text-xs">
            {t.pipelineSteps.map((s) => (
              <div key={s.step} className="border-r border-b border-[#DDD8CC] dark:border-[#2F3632] p-5 flex items-start gap-4">
                <span className="font-mono text-sm font-semibold text-[#244C40] dark:text-[#A7BBAA] tabular-nums">
                  {s.step}
                </span>
                <div>
                  <p className="font-heading font-semibold text-sm text-[#292E2B] dark:text-[#F3F0E8]">{s.title}</p>
                  <p className="text-[#525954] dark:text-[#B6BCB6] mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security & Interop Hairline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF] dark:bg-[#1D221F]">
          <div className="border-r border-b border-[#DDD8CC] dark:border-[#2F3632] p-6 space-y-2.5">
            <IconLock className="h-5 w-5 text-[#244C40] dark:text-[#A7BBAA]" aria-hidden="true" />
            <h3 className="font-heading text-sm font-semibold text-[#292E2B] dark:text-[#F3F0E8]">{t.securityTitle}</h3>
            <p className="text-xs text-[#525954] dark:text-[#B6BCB6] leading-relaxed">{t.securityDesc}</p>
          </div>
          <div className="border-r border-b border-[#DDD8CC] dark:border-[#2F3632] p-6 space-y-2.5">
            <IconFileCode className="h-5 w-5 text-[#244C40] dark:text-[#A7BBAA]" aria-hidden="true" />
            <h3 className="font-heading text-sm font-semibold text-[#292E2B] dark:text-[#F3F0E8]">{t.interoperabilityTitle}</h3>
            <p className="text-xs text-[#525954] dark:text-[#B6BCB6] leading-relaxed">{t.interoperabilityDesc}</p>
          </div>
          <div className="border-r border-b border-[#DDD8CC] dark:border-[#2F3632] p-6 space-y-2.5">
            <IconClock className="h-5 w-5 text-[#244C40] dark:text-[#A7BBAA]" aria-hidden="true" />
            <h3 className="font-heading text-sm font-semibold text-[#292E2B] dark:text-[#F3F0E8]">{t.escalationTitle}</h3>
            <p className="text-xs text-[#525954] dark:text-[#B6BCB6] leading-relaxed">{t.escalationDesc}</p>
          </div>
        </div>

        {/* Glossary */}
        <section className="space-y-5">
          <h2 className="font-heading text-lg font-semibold text-[#292E2B] dark:text-[#F3F0E8] flex items-center gap-2">
            <IconShieldCheck className="h-5 w-5 text-[#244C40] dark:text-[#A7BBAA]" aria-hidden="true" />
            {t.termsTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF] dark:bg-[#1D221F] text-xs">
            {t.terms.map((item) => (
              <div key={item.term} className="border-r border-b border-[#DDD8CC] dark:border-[#2F3632] p-4 space-y-1.5">
                <div className="font-mono font-semibold text-[#244C40] dark:text-[#A7BBAA]">
                  <InfoTooltip label={item.term} explanation={item.explanation} />
                </div>
                <p className="text-[#525954] dark:text-[#B6BCB6] leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
