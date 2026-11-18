"use client";
import React from "react";
import Link from "next/link";
import { IconArrowLeft, IconFileDescription, IconPhoneCall } from "@tabler/icons-react";
import { PublicHeader } from "@/components/PublicHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Emergency103Banner } from "@/components/Emergency103Banner";
import { useLanguage } from "@/context/LanguageContext";

const TERMS_COPY = {
  uz: {
    back: "Bosh sahifaga qaytish",
    badge: "Huquqiy shartlar",
    title: "Foydalanish shartlari",
    updated: "Oxirgi yangilanish: 2026-yil 18-noyabr",
    intro:
      "OnaCare platformasidan foydalanish orqali siz quyidagi xizmat ko'rsatish shartlariga rozilik bildirasiz. Iltimos, ayniqsa shoshilinch tibbiy yordam va hududiy qamrov qoidalarini diqqat bilan o'qing.",
    sections: [
      {
        title: "1. Shoshilinch tibbiy yordam o'rnini bosmaydi",
        body: "OnaCare kunlik holat kuzatuvi va rejalashtirilgan oilaviy shifokor tashriflarini muvofiqlashtirish uchun mo'ljallangan. Hayotga xavf soluvchi yoki keskin og'irlashgan holatlarda (qon ketishi, hushdan ketish, kuchli nafas qisilishi, 38.5°C dan yuqori isitma) ilova javobini kutmang — darhol 103 tez tibbiy yordam raqamiga qo'ng'iroq qiling.",
      },
      {
        title: "2. Xizmat qamrovi va 24 soatlik tashrif shartlari",
        body: "24 soat ichida uyga tashrif va bepul birlamchi ko'rik faqat tizimga ulangan hamkor poliklinikalar hududida yashovchi va hisobi tasdiqlangan bemorlarga tatbiq etiladi. OnaCare mustaqil muvofiqlashtirish platformasi bo'lib, klinik tekshiruv uchun bevosita hamkor poliklinika shifokorlari mas'uldir.",
      },
      {
        title: "3. Hisob xavfsizligi va tasdiqlash",
        body: "Ro'yxatdan o'tishda to'g'ri ism, telefon raqami va yashash manzilini ko'rsatishingiz lozim. Bemor va shifokor hisoblari xavfsizlik maqsadida poliklinika administratori tomonidan tekshirilgandan so'ng faollashtiriladi.",
      },
      {
        title: "4. Ixtiyoriy obuna va qo'shimcha xizmatlar",
        body: "Birlamchi uy ko'rigi va kunlik tekshiruvlar hamkor hududlarda bepul. Shaxsiy kabinet ichidagi kengaytirilgan obuna rejalari mutlaqo ixtiyoriy bo'lib, foydalanuvchi tanlovi bilan faollashtiriladi.",
      },
    ],
  },
  ru: {
    back: "На главную страницу",
    badge: "Правовые условия",
    title: "Условия использования сервиса OnaCare",
    updated: "Обновлено: 18 ноября 2026 г.",
    intro:
      "Используя платформу OnaCare, вы соглашаетесь с настоящими условиями. Пожалуйста, внимательно ознакомьтесь с правилами экстренной помощи и зоной действия домашних визитов.",
    sections: [
      {
        title: "1. Платформа не заменяет скорую медицинскую помощь (103)",
        body: "OnaCare предназначена для планового послеродового наблюдения и координации домашних визитов. При жизнеугрожающих симптомах (сильное кровотечение, потеря сознания, одышка, температура выше 38.5°C) не ждите ответа врача в приложении — немедленно звоните 103.",
      },
      {
        title: "2. Зона действия и условия 24-часового визита",
        body: "Бесплатный первичный домашний осмотр и 24-часовое окно визита действуют для подтвержденных пациенток в районах, обслуживаемых поликлиниками-партнерами. Клинические решения принимают непосредственно верифицированные врачи этих клиник.",
      },
      {
        title: "3. Достоверность данных и верификация аккаунта",
        body: "При регистрации необходимо указывать достоверные контактные данные и адрес. В целях безопасности новые аккаунты пациентов и врачей активируются после проверки администратором клиники.",
      },
      {
        title: "4. Добровольные подписки",
        body: "Базовая координация 24-часового визита в пилотных районах бесплатна. Расширенные тарифы в личном кабинете носят исключительно добровольный характер.",
      },
    ],
  },
  en: {
    back: "Back to Home",
    badge: "Legal Terms",
    title: "Terms of Service",
    updated: "Last updated: November 18, 2026",
    intro:
      "By creating an account or using OnaCare, you agree to these Terms of Service. Please read the emergency care notice and clinic coverage terms carefully.",
    sections: [
      {
        title: "1. Not a Substitute for Emergency Care (Call 103)",
        body: "OnaCare coordinates scheduled postpartum follow-ups and daily symptom check-ins. It does not replace emergency ambulance care. For severe bleeding, breathing difficulty, fainting, chest pain, or fever over 38.5°C, call 103 immediately.",
      },
      {
        title: "2. Participating Clinic Coverage & 24-Hour Window",
        body: "Free initial postpartum home check-ups and the 24-hour visit window apply only to verified accounts within districts served by participating family polyclinics. Licensed clinicians at those clinics remain solely responsible for medical judgment and treatment.",
      },
      {
        title: "3. Accurate Registration & Verification",
        body: "Users must provide accurate contact and address details. For patient safety, new patient, doctor, and nurse registrations remain pending until verified by a clinic administrator.",
      },
      {
        title: "4. Optional Plans",
        body: "Core postpartum coordination in partner districts is free. Any upgraded subscription tiers offered inside the patient or doctor portal are strictly optional.",
      },
    ],
  },
};

export default function TermsPage() {
  const { lang } = useLanguage();
  const t = TERMS_COPY[lang] || TERMS_COPY.uz;
  const homeHref = lang === "ru" ? "/ru" : lang === "en" ? "/en" : "/";

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8F7] dark:bg-[#091315] text-slate-900 dark:text-slate-100">
      <PublicHeader />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-8 py-10 sm:py-12 space-y-8 oc-fade-up">
        <div className="space-y-4 border-b border-[#D7E4E1] dark:border-[#1E353A] pb-8">
          <Link href={homeHref} className="inline-flex min-h-[36px] items-center gap-1.5 text-sm font-semibold text-teal-700 dark:text-teal-300 hover:underline underline-offset-4">
            <IconArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t.back}
          </Link>
          <p className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-teal-700 dark:text-teal-300">
            <IconFileDescription className="h-3.5 w-3.5" aria-hidden="true" />
            {t.badge}
          </p>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.title}
          </h1>
          <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{t.updated}</p>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.intro}
          </p>
        </div>

        <Emergency103Banner />

        <div className="space-y-5">
          {t.sections.map((sec, idx) => (
            <section
              key={idx}
              className="med-card p-6 sm:p-7 space-y-3"
            >
              <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {idx === 0 && <IconPhoneCall className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />}
                {sec.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {sec.body}
              </p>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
