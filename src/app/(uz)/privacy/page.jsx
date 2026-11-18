"use client";
import React from "react";
import Link from "next/link";
import { IconArrowLeft, IconLock, IconMapPin, IconShieldCheck, IconShieldLock } from "@tabler/icons-react";
import { PublicHeader } from "@/components/PublicHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/context/LanguageContext";

const PRIVACY_COPY = {
  uz: {
    back: "Bosh sahifaga qaytish",
    badge: "Maxfiylik va tibbiy ma'lumotlar himoyasi",
    title: "Maxfiylik siyosati va ma'lumotlarni qayta ishlash bayonoti",
    updated: "Oxirgi yangilanish: 2026-yil 18-noyabr",
    intro:
      "OnaCare tug'ruqdan keyingi onalar va chaqaloqlarning sog'lig'iga oid nozik ma'lumotlarni himoya qilishni eng ustuvor vazifa deb biladi. Ushbu hujjatda qanday ma'lumotlar yig'ilishi, qanday shifrlanishi va ulardan kimlar foydalana olishi aniq bayon etilgan.",
    sections: [
      {
        id: "collected",
        title: "1. Qanday ma'lumotlar yig'iladi?",
        points: [
          "Shaxsiy aloqa ma'lumotlari: ism-familiya, telefon raqami, elektron pochta, tug'ilgan sana va yashash hududi (tuman/mahalla).",
          "Tibbiy va parvarish ma'lumotlari: chiqarish xulosasi, tahlil ko'rsatkichlari, dori-darmonlar, kunlik harorat/qon bosimi va bezovtalik belgilari.",
          "Ixtiyoriy GPS koordinatalar: faqat siz aniq rozilik oynasini tasdiqlaganingizdan so'ng eng yaqin poliklinika yoki shifokorni aniqlash uchun olinadi.",
        ],
      },
      {
        id: "data-handling",
        title: "2. Ma'lumotlarni saqlash va shifrlash bayonoti",
        points: [
          "JSHSHIR va shifokorlarning klinik izohlari ma'lumotlar bazasida AES-256-GCM standarti bilan shifrlangan holda saqlanadi.",
          "Rolga asoslangan kirish nazorati (RBAC): bemorlar faqat o'z kabinetini, shifokorlar esa faqat o'z hududi/poliklinikasiga biriktirilgan bemorlarni ko'radi. Qabulxona va ma'muriyat xodimlari maxfiy klinik izohlar hamda shaxsiy yozishmalar matnini ko'ra olmaydi.",
          "Tashrif va analitika telemetriyasi: Vercel Analytics hamda texnik xatoliklar monitoringiga shaxsiy ism, telefon, JSHSHIR, koordinatalar yoki tibbiy shikoyat matnlari HECH QACHON yuborilmaydi; barcha xabarlar jo'natilishidan oldin filtrlanadi.",
        ],
      },
      {
        id: "gps",
        title: "3. GPS joylashuv va foydalanuvchi nazorati",
        points: [
          "Brauzer GPS ruxsati so'ralishidan oldin alohida rozilik oynasi ko'rsatiladi. Joylashuvni ulashish majburiy emas — tuman va manzilni qo'lda kiritishingiz mumkin.",
          "Koordinatalar faqat tez yordam/shifokor tashrifi masofasini hisoblash uchun ishlatiladi va reklama yoki tashqi kompaniyalarga berilmaydi.",
        ],
      },
      {
        id: "rights",
        title: "4. Sizning huquqlaringiz va murojaat kanallari",
        points: [
          "Ma'lumotlaringizni ko'rish, tuzatish yoki hisobingizni o'chirishni so'rash huquqiga egasiz.",
          "Savol yoki maxfiylik bo'yicha murojaatlar uchun: support@onacare.uz, +998 71 200 10 30 yoki Telegram @OnaCareSupport.",
        ],
      },
    ],
  },
  ru: {
    back: "На главную страницу",
    badge: "Конфиденциальность и защита медицинских данных",
    title: "Политика конфиденциальности и обработки данных",
    updated: "Обновлено: 18 ноября 2026 г.",
    intro:
      "Здоровье мамы и малыша относится к особо чувствительной категории данных. Ниже честно и подробно описано, какие сведения собирает OnaCare, как они шифруются и кто имеет к ним доступ.",
    sections: [
      {
        id: "collected",
        title: "1. Какие данные собираются",
        points: [
          "Контактные данные: ФИО, номер телефона, email, дата рождения и район/махалля проживания.",
          "Медицинские данные: выписной эпикриз, результаты анализов, назначения, ежедневное самочувствие (температура, давление, симптомы).",
          "Добровольная GPS-геолокация: запрашивается только после вашего явного согласия для подбора ближайшего врача и расчета расстояния выезда.",
        ],
      },
      {
        id: "data-handling",
        title: "2. Заявление об обработке и защите данных",
        points: [
          "ПИНФЛ (JSHSHIR) и клинические заметки врачей хранятся в зашифрованном виде (AES-256-GCM).",
          "Строгая ролевая изоляция (RBAC): пациентки видят только свой кабинет, врачи — только пациенток своего участка/клиники. Администраторы не имеют доступа к закрытым врачебным заметкам и личной переписке.",
          "Безопасная аналитика: в Vercel Analytics и журнал технических ошибок никогда не передаются ФИО, телефоны, ПИНФЛ, GPS-координаты или симптомы — все параметры очищаются до отправки.",
        ],
      },
      {
        id: "gps",
        title: "3. Геолокация и ваше согласие",
        points: [
          "Перед обращением к GPS браузера мы всегда показываем экран явного согласия. Передача GPS добровольна — вы можете ввести адрес вручную.",
          "Координаты используются исключительно для координации визита врача и не передаются рекламным или третьим организациям.",
        ],
      },
      {
        id: "rights",
        title: "4. Ваши права и контакты",
        points: [
          "Вы вправе запросить копию, исправление или удаление ваших персональных данных.",
          "Контакты по вопросам конфиденциальности: support@onacare.uz, +998 71 200 10 30 или Telegram @OnaCareSupport.",
        ],
      },
    ],
  },
  en: {
    back: "Back to Home",
    badge: "Privacy & Health Data Protection",
    title: "Privacy Policy & Data-Handling Statement",
    updated: "Last updated: November 18, 2026",
    intro:
      "Maternal and newborn health records are deeply sensitive. This statement explains exactly what information OnaCare collects, how it is encrypted, who can view it, and how your choices are respected.",
    sections: [
      {
        id: "collected",
        title: "1. Information We Collect",
        points: [
          "Account & contact details: full name, phone number, email, date of birth, and district/mahalla.",
          "Care & health information: discharge summaries, lab values, prescriptions, daily blood pressure/temperature check-ins, and symptom complaints.",
          "Optional GPS coordinates: collected only after an explicit consent modal to match you with the nearest participating doctor or estimate visit distance.",
        ],
      },
      {
        id: "data-handling",
        title: "2. Data-Handling & Security Statement",
        points: [
          "Encryption at rest: sensitive identifiers (JSHSHIR) and inpatient clinical notes are encrypted using AES-256-GCM.",
          "Server-side Role-Based Access Control (RBAC): patients only access their own records; physicians only access patients assigned to their clinic/district; reception staff cannot read private clinical notes or direct patient-doctor chat logs.",
          "Zero health data in telemetry: Vercel Analytics and our error monitor automatically scrub PII, coordinates, JSHSHIR, and symptom descriptions before any diagnostic payload is transmitted.",
        ],
      },
      {
        id: "gps",
        title: "3. GPS & Location Consent",
        points: [
          "A clear consent dialog explains why location is requested before invoking your browser's geolocation API. Location sharing is strictly optional — manual district/address entry is always supported.",
          "Coordinates are never sold or shared for advertising.",
        ],
      },
      {
        id: "rights",
        title: "4. Your Rights & Contact Details",
        points: [
          "You may request access, correction, or deletion of your account data at any time.",
          "Privacy inquiries: support@onacare.uz, +998 71 200 10 30, or Telegram @OnaCareSupport.",
        ],
      },
    ],
  },
};

export default function PrivacyPage() {
  const { lang } = useLanguage();
  const t = PRIVACY_COPY[lang] || PRIVACY_COPY.uz;
  const homeHref = lang === "ru" ? "/ru" : lang === "en" ? "/en" : "/";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <PublicHeader />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-10 space-y-6">
        <div className="space-y-3">
          <Link href={homeHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 hover:underline">
            <IconArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t.back}
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-3 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300">
            <IconLock className="h-3.5 w-3.5" aria-hidden="true" />
            {t.badge}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">
            {t.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.updated}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {t.intro}
          </p>
        </div>

        <div className="space-y-4">
          {t.sections.map((sec, idx) => (
            <section
              key={sec.id}
              id={sec.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3"
            >
              <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
                {idx === 1 ? (
                  <IconShieldLock className="h-5 w-5 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
                ) : idx === 2 ? (
                  <IconMapPin className="h-5 w-5 text-sky-700 dark:text-sky-400 shrink-0" aria-hidden="true" />
                ) : (
                  <IconShieldCheck className="h-5 w-5 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
                )}
                {sec.title}
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-disc pl-5 leading-relaxed">
                {sec.points.map((pt, pIdx) => (
                  <li key={pIdx}>{pt}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
