"use client";

import React from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconCalendarHeart,
  IconClipboardCheck,
  IconFileText,
  IconHeartHandshake,
  IconLock,
  IconLogin,
  IconMessageHeart,
  IconShieldCheck,
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
    heroTitle: string;
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
    portalsEyebrow: string;
    portalsTitle: string;
    portalsSub: string;
    patientTitle: string;
    patientDesc: string;
    patientTag: string;
    patientCta: string;
    clinicalTitle: string;
    clinicalDesc: string;
    clinicalTag: string;
    clinicalCta: string;
    adminTitle: string;
    adminDesc: string;
    adminTag: string;
    adminCta: string;
    promiseBadge: string;
    promiseTitle: string;
    promiseDesc: string;
    promiseZones: Array<{ title: string; detail: string; tone: "green" | "yellow" | "red" }>;
    features: Array<{ title: string; desc: string }>;
    clinicLinkLabel: string;
    footerBrand: string;
    footerPrivacy: string;
    footerTechLink: string;
    footerSignIn: string;
    footerSignUp: string;
  }
> = {
  uz: {
    badge: "Onalar va chaqaloqlar uchun uyda g'amxo'rlik",
    heroTitle:
      "Tug'ruqdan keyin uyga qaytdingizmi? Mahallangizdagi oilaviy shifokor 24 soat ichida uyingizga tashrif buyuradi.",
    heroDesc:
      "Uyga chiqqaningizdan so'ng yolg'iz qolmaysiz. Mahalliy poliklinikangizdan shifokor yoki hamshira siz va chaqalog'ingizni ko'rikdan o'tkazish uchun uyingizga keladi, siz esa kunlik ahvolingizni telefoningizdan oson ulashishingiz mumkin.",
    ctaSignup: "Bepul hisob yaratish",
    ctaSignin: "Kabinetga kirish",
    ctaOpenPortal: "Kabinetimni ochish",
    trust1: "Ma'lumotlaringiz shifrlangan va maxfiy",
    trust2: "24 soat ichida shifokor yoki hamshira keladi",
    trust3: "Faqat siz va shifokoringiz ko'radi",
    pipeTitle: "Uyga qaytganingizdan keyin sizga qanday g'amxo'rlik qilamiz",
    pipeSub: "Har bir qadam siz va oilangiz xotirjamligi uchun",
    pipeBadge: "24 soatlik tashrif",
    steps: [
      {
        step: "01",
        title: "Shifoxona chiqarish xulosangiz",
        desc: "Tug'ruqxona jamoasi sizning ahvolingiz haqidagi oddiy xulosani oilaviy shifokoringizga uzatadi.",
      },
      {
        step: "02",
        title: "Shifoxona tahlillaringizni ko'rib chiqamiz",
        desc: "Oilaviy shifokoringiz uyingizga kelishidan oldin tahlil va ko'rsatkichlaringiz bilan tanishadi.",
      },
      {
        step: "03",
        title: "Shifokor yoki hamshira 24 soat ichida keladi",
        desc: "Sizga qulay vaqt belgilanadi va poliklinikadan shifokoringiz uyingizga tashrif buyuradi.",
      },
      {
        step: "04",
        title: "Kunlik ahvol tekshiruvi: o'zingizni qanday his qilyapsiz?",
        desc: "Harorat, qon bosimi yoki bezovtalik belgilarini telefoningizdan osongina yuborasiz.",
      },
    ],
    portalsEyebrow: "Shaxsiy va xavfsiz kirish",
    portalsTitle: "Ma'lumotlaringizni faqat siz va sizga qaraydigan shifokorlar ko'radi",
    portalsSub:
      "Har bir foydalanuvchi faqat o'ziga tegishli bo'limga kiradi. Bemorlar faqat o'z parvarish rejasini, shifokorlar esa o'z bemorlarini ko'radi.",
    patientTitle: "Onalar va bemorlar uchun",
    patientDesc:
      "O'zingizning parvarish rejangiz, o'zbek/rus/ingliz tillaridagi uy qoidalari, dorilar eslatmasi, kunlik holat tekshiruvi va shifokor tashrifini tasdiqlash kodini ko'ring.",
    patientTag: "Faqat shaxsiy kabinet",
    patientCta: "Bemor sifatida ro'yxatdan o'tish",
    clinicalTitle: "Shifokorlar va hamshiralar uchun",
    clinicalDesc:
      "Tug'ruqxona va oilaviy poliklinika shifokorlari bemor xulosalarini tayyorlash, uyga tashrif ro'yxatini yuritish va ko'rik natijalarini kiritish uchun ishlaydigan bo'lim.",
    clinicalTag: "Shifokorlar jamoasi",
    clinicalCta: "Shifokor kirishi",
    adminTitle: "Poliklinika koordinatorlari uchun",
    adminDesc:
      "Qabulxona va mas'ul xodimlar barcha 24 soatlik tashriflar vaqtida bajarilishini kuzatishi hamda dorixona va davlat yordami hisobini yuritishi mumkin.",
    adminTag: "Klinika boshqaruvi",
    adminCta: "Koordinator kirishi",
    promiseBadge: "24 soatlik tashrif kafolati",
    promiseTitle: "Hech bir ona uyda e'tiborsiz qolmaydi",
    promiseDesc:
      "Uyga qaytgan dastlabki soatlarda o'z vaqtida ko'rikdan o'tish juda muhim. Tizim shifokor tashrifi vaqtida amalga oshishini avtomatik kuzatib boradi.",
    promiseZones: [
      {
        title: "0 – 12 soat • Reja bo'yicha",
        detail: "Oilaviy shifokoringiz xabardor qilinadi va tashrif vaqti belgilanadi",
        tone: "green",
      },
      {
        title: "12 – 18 soat • Eslatma yuboriladi",
        detail: "Agar tashrif hali bo'lmagan bo'lsa, shifokor va poliklinikaga eslatma boradi",
        tone: "yellow",
      },
      {
        title: "18 – 24 soat • Zudlik bilan zaxira",
        detail: "Tuman mas'ul xodimiga xabar beriladi va darhol boshqa shifokor yuboriladi",
        tone: "red",
      },
    ],
    features: [
      {
        title: "Oson tushunarli xulosa",
        desc: "Shifoxonadan chiqishdagi barcha muhim tavsiyalar sodda tilda jamlanadi.",
      },
      {
        title: "Ona va chaqaloq uchun kundalik qoidalar",
        desc: "O'zbek, rus va ingliz tillarida kunlik parvarish hamda ogohlantiruvchi belgilar.",
      },
      {
        title: "Kunlik ahvol tekshiruvi",
        desc: "O'zingizni yomon his qilsangiz, bir necha tugma orqali shifokoringizga darhol xabar berasiz.",
      },
      {
        title: "Tashrifni oddiy tasdiqlash",
        desc: "Shifokor kelganda 4 xonali kod yoki bir bosish bilan tashrifni tasdiqlaysiz.",
      },
    ],
    clinicLinkLabel: "Klinikalar va mutaxassislar uchun: tizim qanday ishlashi haqida batafsil",
    footerBrand: "OnaCare — Uyda 24 soatlik g'amxo'rlik",
    footerPrivacy: "Ma'lumotlaringiz shifrlangan va maxfiy",
    footerTechLink: "Klinikalar va texnologiya",
    footerSignIn: "Kirish",
    footerSignUp: "Ro'yxatdan o'tish",
  },
  ru: {
    badge: "Домашняя забота о мамах и малышах",
    heroTitle:
      "Выписываетесь после родов домой? Семейный врач из вашей поликлиники придет к вам в течение 24 часов.",
    heroDesc:
      "После возвращения домой вы не останетесь одна. Врач или медсестра из вашей поликлиники навестит вас и малыша дома, а вы сможете каждый день легко сообщать о своем самочувствии с телефона.",
    ctaSignup: "Создать аккаунт бесплатно",
    ctaSignin: "Войти в кабинет",
    ctaOpenPortal: "Открыть мой кабинет",
    trust1: "Ваши данные зашифрованы и конфиденциальны",
    trust2: "Врач или медсестра придут в течение 24 часов",
    trust3: "Доступ есть только у вас и ваших врачей",
    pipeTitle: "Как мы заботимся о вас после возвращения домой",
    pipeSub: "Каждый шаг создан для вашего спокойствия",
    pipeBadge: "Визит за 24 часа",
    steps: [
      {
        step: "01",
        title: "Ваша выписка из роддома",
        desc: "Команда роддома передает понятную сводку о вашем самочувствии семейному врачу.",
      },
      {
        step: "02",
        title: "Мы проверяем ваши результаты из роддома",
        desc: "Врач изучает ваши анализы и рекомендации еще до прихода к вам домой.",
      },
      {
        step: "03",
        title: "Врач или медсестра приходят в течение 24 часов",
        desc: "Вы заранее видите время визита специалиста из вашей поликлиники.",
      },
      {
        step: "04",
        title: "Ежедневная проверка: расскажите, как вы себя чувствуете",
        desc: "Отправьте температуру, давление или любые жалобы прямо с телефона.",
      },
    ],
    portalsEyebrow: "Личный и защищенный доступ",
    portalsTitle: "Ваши данные видите только вы и ваша команда врачей",
    portalsSub:
      "У каждого пользователя есть свой отдельный кабинет. Мамы видят только свой план восстановления, а врачи — только своих пациенток.",
    patientTitle: "Для мам и пациенток",
    patientDesc:
      "Смотрите свой план ухода на узбекском, русском или английском языке, напоминания о лекарствах, ежедневную проверку самочувствия и код подтверждения визита.",
    patientTag: "Только ваши данные",
    patientCta: "Регистрация для мам",
    clinicalTitle: "Для врачей и медсестер",
    clinicalDesc:
      "Рабочий кабинет для врачей роддома и семейных поликлиник: передача выписки, чек-лист домашнего осмотра и запись показателей здоровья.",
    clinicalTag: "Команда врачей",
    clinicalCta: "Вход для врачей",
    adminTitle: "Для координаторов клиник",
    adminDesc:
      "Помогает регистратуре и руководству следить, чтобы каждый визит в течение 24 часов состоялся вовремя, и вести учет бесплатной помощи.",
    adminTag: "Координация клиники",
    adminCta: "Вход для координатора",
    promiseBadge: "Обещание визита за 24 часа",
    promiseTitle: "Ни одна мама не остается без внимания дома",
    promiseDesc:
      "Первые сутки после выписки очень важны. Система автоматически следит за тем, чтобы семейный врач вовремя навестил вас.",
    promiseZones: [
      {
        title: "0 – 12 часов • По графику",
        detail: "Ваш семейный врач получил уведомление, время визита назначено",
        tone: "green",
      },
      {
        title: "12 – 18 часов • Напоминание",
        detail: "Если визит еще не отмечен, врачу и поликлинике уходит напоминание",
        tone: "yellow",
      },
      {
        title: "18 – 24 часа • Срочная замена",
        detail: "Координатор клиники подключается и направляет другого врача",
        tone: "red",
      },
    ],
    features: [
      {
        title: "Понятная выписка из больницы",
        desc: "Все важные рекомендации после родов собраны в одном месте без сложных терминов.",
      },
      {
        title: "Памятка на узбекском, русском и английском",
        desc: "Простые ежедневные советы по уходу и список тревожных симптомов.",
      },
      {
        title: "Быстрая ежедневная проверка",
        desc: "Если поднимется температура или давление, ваш врач сразу получит сигнал.",
      },
      {
        title: "Простое подтверждение визита",
        desc: "Когда врач придет домой, подтвердите визит 4-значным кодом или в один клик.",
      },
    ],
    clinicLinkLabel: "Для клиник и специалистов: подробнее о стандартах и безопасности",
    footerBrand: "OnaCare — Домашняя забота в течение 24 часов",
    footerPrivacy: "Ваши данные зашифрованы и конфиденциальны",
    footerTechLink: "Для клиник / Технологии",
    footerSignIn: "Войти",
    footerSignUp: "Регистрация",
  },
  en: {
    badge: "Warm Home Care for New Mothers & Babies",
    heroTitle:
      "Going home after birth? A doctor from your local clinic will visit within 24 hours.",
    heroDesc:
      "You are never on your own after going home. A family doctor or nurse from your neighborhood clinic visits you at home, and you can share how you feel each day right from your phone.",
    ctaSignup: "Create Free Account",
    ctaSignin: "Sign In",
    ctaOpenPortal: "Open My Portal",
    trust1: "Your data is encrypted and private",
    trust2: "A nurse or doctor visits you within 24 hours",
    trust3: "Only you and your care team see your data",
    pipeTitle: "How we look after you after you go home",
    pipeSub: "Four simple steps for your peace of mind",
    pipeBadge: "24h Home Visit",
    steps: [
      {
        step: "01",
        title: "Your hospital discharge summary",
        desc: "Your birth team passes along a clear summary of how you and your baby are doing.",
      },
      {
        step: "02",
        title: "We review your hospital results",
        desc: "Your local doctor checks your test results and notes before arriving.",
      },
      {
        step: "03",
        title: "A nurse or doctor visits you within 24 hours",
        desc: "You see your reserved home visit window and your doctor's phone number.",
      },
      {
        step: "04",
        title: "Daily check-in: tell us how you feel",
        desc: "Send a quick update on your blood pressure, temperature, or any discomfort.",
      },
    ],
    portalsEyebrow: "Private & Role-Separated",
    portalsTitle: "Only you and your care team see your data",
    portalsSub:
      "Each person only enters their own dedicated space. Mothers see only their personal care plan, never other patients or clinic management screens.",
    patientTitle: "For Mothers & Patients",
    patientDesc:
      "View your personal recovery plan, simple care guides in UZ/RU/EN, medicine reminders, daily symptom check-ins, and your 4-digit visit confirmation code.",
    patientTag: "Only your data",
    patientCta: "Sign up as Patient",
    clinicalTitle: "For Doctors & Nurses",
    clinicalDesc:
      "A clear workspace for maternity doctors to share discharge summaries and for local family doctors to complete 24-hour home visit check-ups.",
    clinicalTag: "Care team",
    clinicalCta: "Doctor Sign In",
    adminTitle: "For Clinic Coordinators",
    adminDesc:
      "Helps clinic reception make sure every 24-hour home visit happens on time and track free state-covered medicines and lab tests.",
    adminTag: "Clinic support",
    adminCta: "Coordinator Sign In",
    promiseBadge: "A nurse or doctor visits you within 24 hours",
    promiseTitle: "Timely reminders so no mother is missed at home",
    promiseDesc:
      "The first 24 hours back home matter most. OnaCare gently tracks your home visit schedule and alerts backup staff if a doctor is delayed.",
    promiseZones: [
      {
        title: "0 – 12 Hours • On Schedule",
        detail: "Your local doctor is notified and your home visit time is reserved",
        tone: "green",
      },
      {
        title: "12 – 18 Hours • Friendly Reminder",
        detail: "If not yet visited, an automatic reminder goes to your doctor and clinic lead",
        tone: "yellow",
      },
      {
        title: "18 – 24+ Hours • Priority Backup",
        detail: "The clinic coordinator is alerted immediately to send another doctor",
        tone: "red",
      },
    ],
    features: [
      {
        title: "Your hospital discharge summary",
        desc: "Everything your doctor needs to know is shared clearly when you leave the clinic.",
      },
      {
        title: "Home care rules in UZ, RU & EN",
        desc: "Plain daily tips and warning signs in your preferred language.",
      },
      {
        title: "Daily check-in: tell us how you feel",
        desc: "Quickly report fever, headache, swelling, or blood pressure from home.",
      },
      {
        title: "Easy visit confirmation",
        desc: "Confirm your doctor's home visit in one tap or with your 4-digit code.",
      },
    ],
    clinicLinkLabel: "For clinics & technical teams: view security, clinical standards & workflow details",
    footerBrand: "OnaCare — Home Care Within 24 Hours",
    footerPrivacy: "Your data is encrypted and private",
    footerTechLink: "For Clinics / Technology",
    footerSignIn: "Sign In",
    footerSignUp: "Sign Up",
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
        {/* Warm Patient-Facing Hero Section */}
        <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 py-12 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 px-3.5 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <IconCalendarHeart className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  <span>{t.badge}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.16]">
                  {t.heroTitle}
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
                    <IconHeartHandshake className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    {t.trust2}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <IconShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    {t.trust3}
                  </span>
                </div>
              </div>

              {/* Plain 4-Step Care Journey Card */}
              <div id="care-steps" className="lg:col-span-5">
                <div className="rounded-2xl border border-teal-200/80 dark:border-slate-800 bg-teal-50/40 dark:bg-slate-950 p-6 shadow-sm space-y-5">
                  <div className="flex items-start justify-between gap-2 border-b border-teal-200/60 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
                        <IconHeartHandshake className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{t.pipeTitle}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.pipeSub}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                      {t.pipeBadge}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {t.steps.map((item) => (
                      <div
                        key={item.step}
                        className="flex items-start gap-3 rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200/80 dark:border-slate-800"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-600 text-[11px] font-bold text-white font-mono">
                          {item.step}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Role-Separated Portals in Plain Language */}
        <section id="portals" className="mx-auto max-w-7xl px-4 py-14 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              {t.portalsEyebrow}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t.portalsTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t.portalsSub}
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
                  {t.clinicalTag}
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
                  {t.adminTag}
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

        {/* Plain 24-Hour Promise & Everyday Care Features */}
        <section id="visit-promise" className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-14">
          <div className="mx-auto max-w-7xl px-4 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <IconCalendarHeart className="h-3.5 w-3.5" />
                  {t.promiseBadge}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t.promiseTitle}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.promiseDesc}
                </p>
                <div className="space-y-2.5 text-xs">
                  {t.promiseZones.map((zone) => (
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
                  <IconFileText className="h-6 w-6 text-teal-700 dark:text-teal-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.features[0].title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {t.features[0].desc}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-5 space-y-2">
                  <IconClipboardCheck className="h-6 w-6 text-teal-700 dark:text-teal-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.features[1].title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {t.features[1].desc}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-5 space-y-2">
                  <IconMessageHeart className="h-6 w-6 text-teal-700 dark:text-teal-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.features[2].title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {t.features[2].desc}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-5 space-y-2">
                  <IconShieldCheck className="h-6 w-6 text-teal-700 dark:text-teal-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.features[3].title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {t.features[3].desc}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {t.clinicLinkLabel}
              </span>
              <Link
                href="/technology"
                className="inline-flex items-center gap-1.5 font-semibold text-teal-700 dark:text-teal-400 hover:underline"
              >
                {t.footerTechLink}
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
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
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/login" className="hover:text-white transition">
              {t.footerSignIn}
            </Link>
            <Link href="/signup" className="hover:text-white transition">
              {t.footerSignUp}
            </Link>
            <Link href="/technology" className="hover:text-white transition">
              {t.footerTechLink}
            </Link>
            <span className="inline-flex items-center gap-1 text-slate-300">
              <IconLock className="h-3.5 w-3.5 text-teal-400" />
              {t.footerPrivacy}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
