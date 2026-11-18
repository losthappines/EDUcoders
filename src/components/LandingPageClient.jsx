"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconBuildingHospital,
  IconCalendarHeart,
  IconChevronDown,
  IconClipboardCheck,
  IconClock,
  IconFileText,
  IconHeartHandshake,
  IconLock,
  IconMessageHeart,
  IconShieldCheck,
  IconUserPlus,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
import { PublicHeader } from "@/components/PublicHeader";
import { Emergency103Banner } from "@/components/Emergency103Banner";
import { SiteFooter } from "@/components/SiteFooter";

function getPortalHref(role) {
  if (role === "PATIENT") return "/patient";
  if (role === "ADMIN_RECEPTION") return "/admin";
  return "/clinical";
}

const LANDING_COPY = {
  uz: {
    badge: "Onalar va chaqaloqlar uchun uyda g'amxo'rlik",
    heroTitle: "Tug'ruqdan keyin uyga qaytdingizmi? Oilaviy shifokor 24 soat ichida uyingizga keladi.",
    heroDesc: "Uyga chiqqaningizdan so'ng yolg'iz qolmaysiz. Hamkor oilaviy poliklinikangizdan shifokor yoki patronaj hamshirasi siz va chaqalog'ingizni ko'rikdan o'tkazish uchun uyingizga tashrif buyuradi, siz esa kunlik ahvolingizni telefoningizdan oson yuborasiz.",
    ctaPrimary: "Bepul parvarishni boshlash",
    ctaOpenPortal: "Shaxsiy kabinetimni ochish",
    ctaSecondaryLink: "Qanday ishlashini ko'rish",
    ctaSignInPrompt: "Allaqachon ro'yxatdan o'tganmisiz?",
    ctaSignInLink: "Kirish",
    heroPhotoAlt: "Uy sharoitida chaqalog'ini mehr bilan quchoqlab turgan yosh o'zbek ona",
    heroPhotoCaption: "Ilk 24 soatdan boshlab xotirjam va ishonchli uy parvarishi",
    doctorPhotoAlt: "Oilaviy shifokor uy tashrifi chog'ida ona va chaqaloqni ko'rikdan o'tkazmoqda",
    mobilePhotoAlt: "Ona uyida o'tirib telefon orqali kunlik sog'liq holatini yubormoqda",
    trust1: "Ma'lumotlaringiz AES-256-GCM bilan shifrlangan",
    trust2: "Hamkor poliklinikalarda birlamchi uy ko'rigi bepul",
    trust3: "Faqat siz va shifokoringiz ko'radi",

    pipeEyebrow: "Uyga qaytganingizdan keyingi yordam",
    pipeTitle: "To'rt oddiy qadamda oilangiz xotirjamligi",
    pipeSub: "Shifoxona chiqarish xulosasidan tortib, shifokorning uyingizga kelishigacha bo'lgan barcha jarayonlar bir joyda.",
    steps: [
      {
        step: "01",
        title: "Chiqarish xulosangiz shifokorga yetkaziladi",
        desc: "Tug'ruqxona jamoasi yoki o'zingiz kiritgan birlamchi ma'lumotlar mahallangizdagi oilaviy shifokorga uzatiladi.",
      },
      {
        step: "02",
        title: "Shifoxona tahlillari oldindan ko'rib chiqiladi",
        desc: "Shifokor uyingizga kelishidan oldin qon tahlili, bosim va tavsiyalar bilan tanishib oladi.",
      },
      {
        step: "03",
        title: "Shifokor yoki hamshira 24 soat ichida keladi",
        desc: "Qulay vaqt belgilanadi va tasdiqlash kodi orqali uy ko'rigi rasmiylashtiriladi.",
      },
      {
        step: "04",
        title: "Telefondan kunlik ahvol tekshiruvi",
        desc: "Harorat, qon bosimi yoki bezovtalik belgilarini uydan chiqmasdan yuborasiz.",
      },
    ],
    featuresTitle: "Onalar uchun har kuni kerakli qulayliklar",
    features: [
      {
        title: "Tushunarli uy parvarishi qoidalari",
        desc: "Murakkab tibbiy atamalarsiz, o'zbek, rus va ingliz tillarida kundalik tavsiyalar.",
      },
      {
        title: "Kunlik ahvol va harorat nazorati",
        desc: "O'zingizni yomon his qilsangiz, bir necha tugma orqali shifokoringizga darhol xabar berasiz.",
      },
      {
        title: "Dorilar va tahlillar eslatmasi",
        desc: "Tayinlangan dori dozalari va qayta topshiriladigan tahlillarni bir oynada kuzating.",
      },
      {
        title: "Tashrifni oddiy tasdiqlash",
        desc: "Shifokor kelganda 4 xonali kod yoki bir bosish bilan tashrif bajarilganini tasdiqlaysiz.",
      },
    ],

    conditionsEyebrow: "Shaffof shartlar va qamrov",
    conditionsTitle: "24 soatlik tashrif va «bepul uy ko'rigi» qanday ishlaydi?",
    conditionsDesc: "Biz bemorlarga aniq va halol ma'lumot beramiz: xizmatni kim ko'rsatishi, qaysi bosqichlar bepul ekani va kechikish yuz bersa nima qilinishini oldindan bilishingiz muhim.",
    conditionsCards: [
      {
        title: "Xizmatni kim ko'rsatadi?",
        body: "OnaCare — hamkor hududiy oilaviy poliklinikalar bilan ishlaydigan pilot muvofiqlashtirish platformasi. Uy tashriflarini tizimda tasdiqlangan mahalliy oilaviy shifokorlar va patronaj hamshiralari amalga oshiradi (butun respublika bo'ylab majburiy davlat tizimi emas).",
      },
      {
        title: "Nima bepul va nima ixtiyoriy?",
        body: "Ro'yxatdan o'tish, tug'ruqdan keyingi birlamchi 24 soatlik uy ko'rigi, kunlik ahvol tekshiruvi va asosiy tavsiyalar hamkor tumanlarda bepul. Qo'shimcha laborator tekshiruvlar yoki kengaytirilgan obuna rejalari mutlaqo ixtiyoriy.",
      },
      {
        title: "24 soatlik muddat shartlari",
        body: "24 soatlik maqsadli muddat tizimga ulangan hududlarda ro'yxatdan o'tgan va tasdiqlangan bemorlarga tatbiq etiladi. 12 soatda shifokorga eslatma, 18 soatda poliklinika koordinatoriga zaxira shifokor tayinlash signali yuboriladi. Shoshilinch holatlarda 103 chaqiring.",
      },
    ],
    promiseZones: [
      {
        title: "0 – 12 soat • Reja bo'yicha",
        detail: "Oilaviy shifokoringiz xabardor qilinadi va tashrif vaqti belgilanadi",
        tone: "green",
      },
      {
        title: "12 – 18 soat • Avtomatik eslatma",
        detail: "Agar ko'rik belgilanmagan bo'lsa, shifokor va poliklinikaga eslatma boradi",
        tone: "yellow",
      },
      {
        title: "18 – 24 soat • Zaxira shifokor",
        detail: "Klinika koordinatori zudlik bilan boshqa shifokorni biriktiradi",
        tone: "red",
      },
    ],

    faqEyebrow: "Ko'p beriladigan savollar",
    faqTitle: "Muhim savollarga qisqa javoblar",
    faqs: [
      {
        q: "Xizmat narxi qancha? Hammasi rostdan ham bepulmi?",
        a: "Ha, hamkor poliklinikalar hududida birlamchi uy ko'rigi, shifokor tashrifini tasdiqlash va kunlik holat tekshiruvi bepul. Shaxsiy kabinet ichidagi kengaytirilgan diagnostika yoki ustuvor maslahat obunalari ixtiyoriy va faqat sizning roziligingiz bilan tanlanadi.",
      },
      {
        q: "Kimlar OnaCare orqali yordam olishi mumkin?",
        a: "Yaqinda tug'ruqxonadan uyga chiqqan onalar, chaqaloq parvarishi bo'yicha ko'makka muhtoj oilalar hamda hamkor tumanlardagi (jumladan Toshkent shahri va viloyat pilot tumanlari) bemorlar foydalanishi mumkin.",
      },
      {
        q: "Agar 24 soat ichida shifokor kelmasa nima bo'ladi?",
        a: "12 va 18 soatda tizim avtomatik eslatma va zaxira shifokor so'rovini yuboradi. Shuningdek, ishonch telefonimiz (+998 71 200 10 30) yoki @OnaCareSupport orqali bog'lanib tezkor ko'mak olishingiz mumkin. Ahvolingiz og'irlashsa, kutmang — 103 ga qo'ng'iroq qiling.",
      },
      {
        q: "Tibbiy ma'lumotlarim va GPS manzilim qanday himoyalanadi?",
        a: "JSHSHIR va klinik yozuvlar AES-256-GCM standarti bilan shifrlanadi. Faqat siz va sizga biriktirilgan shifokor ko'radi. GPS lokatsiyani ulashish mutlaqo ixtiyoriy — xohlasangiz tuman va manzilni qo'lda kiritishingiz mumkin. Batafsil Maxfiylik siyosatimizda tanishing.",
      },
    ],
  },
  ru: {
    badge: "Домашняя забота о мамах и малышах",
    heroTitle: "Выписываетесь после родов домой? Семейный врач придет в течение 24 часов.",
    heroDesc: "После возвращения домой вы не остаетесь одна. Врач или медсестра из вашей поликлиники навестит вас и малыша дома, а вы сможете каждый день легко сообщать о самочувствии с телефона.",
    ctaPrimary: "Начать бесплатный уход",
    ctaOpenPortal: "Открыть мой кабинет",
    ctaSecondaryLink: "Как это работает",
    ctaSignInPrompt: "Уже зарегистрированы?",
    ctaSignInLink: "Войти",
    heroPhotoAlt: "Молодая мама нежно держит новорожденного малыша дома",
    heroPhotoCaption: "Спокойное восстановление и забота с первых 24 часов дома",
    doctorPhotoAlt: "Семейный врач осматривает маму и малыша во время домашнего визита",
    mobilePhotoAlt: "Мама дома легко отмечает свое самочувствие на смартфоне",
    trust1: "Медицинские записи зашифрованы (AES-256-GCM)",
    trust2: "Первичный домашний визит в клиниках-партнерах бесплатен",
    trust3: "Доступ только у вас и вашего врача",

    pipeEyebrow: "Поддержка после выписки",
    pipeTitle: "Четыре понятных шага для вашего спокойствия",
    pipeSub: "От выписки из роддома до визита семейного врача на дом — без лишней бумажной волокиты.",
    steps: [
      {
        step: "01",
        title: "Передача вашей выписки врачу",
        desc: "Сводка из роддома или указанные вами данные передаются участковому семейному врачу.",
      },
      {
        step: "02",
        title: "Предварительный просмотр анализов",
        desc: "Врач изучает показатели крови, давление и рекомендации еще до прихода к вам.",
      },
      {
        step: "03",
        title: "Визит врача или медсестры за 24 часа",
        desc: "Вы видите ожидаемое время прихода и подтверждаете осмотр простым 4-значным кодом.",
      },
      {
        step: "04",
        title: "Ежедневная проверка с телефона",
        desc: "Сообщайте о температуре, давлении или любом недомогании за пару нажатий.",
      },
    ],
    featuresTitle: "Удобные инструменты для ежедневного ухода",
    features: [
      {
        title: "Простые правила ухода дома",
        desc: "Понятные рекомендации без сложных терминов на русском, узбекском и английском.",
      },
      {
        title: "Быстрый сигнал о самочувствии",
        desc: "При появлении температуры или слабости ваш врач сразу получит уведомление.",
      },
      {
        title: "Напоминания о лекарствах",
        desc: "Список назначений и контрольных анализов всегда под рукой в телефоне.",
      },
      {
        title: "Простое подтверждение визита",
        desc: "Когда врач придет домой, подтвердите осмотр 4-значным кодом или в один клик.",
      },
    ],

    conditionsEyebrow: "Честные условия и зона действия",
    conditionsTitle: "Кто проводит визит и на каких условиях действует 24-часовое окно",
    conditionsDesc: "Нам важно ваше доверие, поэтому ниже честно описано, кто оказывает помощь, какие услуги бесплатны и что происходит при задержке.",
    conditionsCards: [
      {
        title: "Кто приезжает на дом?",
        body: "OnaCare — пилотная координационная платформа, работающая с участвующими семейными поликлиниками. Осмотры проводят верифицированные участковые врачи и патронажные медсестры этих клиник (не является общереспубликанской обязательной госслужбой).",
      },
      {
        title: "Что бесплатно, а что по желанию?",
        body: "Регистрация, первичный 24-часовой визит врача после выписки и ежедневный опрос самочувствия в пилотных районах бесплатны. Дополнительные обследования или расширенные подписки полностью добровольны.",
      },
      {
        title: "Условия 24-часового окна",
        body: "Срок 24 часа действует для подтвержденных пациенток в районах-участниках. На 12-м часе врачу уходит напоминание, на 18-м — сигнал координатору для замены врача. При острых состояниях сразу звоните 103.",
      },
    ],
    promiseZones: [
      {
        title: "0 – 12 часов • По графику",
        detail: "Семейный врач уведомлен, согласовано окно домашнего визита",
        tone: "green",
      },
      {
        title: "12 – 18 часов • Напоминание",
        detail: "Если осмотр еще не начат, врачу и клинике уходит повторный сигнал",
        tone: "yellow",
      },
      {
        title: "18 – 24 часа • Резервный врач",
        detail: "Координатор клиники срочно назначает другого свободного специалиста",
        tone: "red",
      },
    ],

    faqEyebrow: "Частые вопросы",
    faqTitle: "Ответы на главные вопросы мам",
    faqs: [
      {
        q: "Сколько стоит сервис? Визит действительно бесплатный?",
        a: "В районах, подключенных через партнерские поликлиники, первичный послеродовой осмотр на дому и ежедневная проверка самочувствия бесплатны. Платные планы или дополнительная диагностика внутри кабинета выбираются только по желанию.",
      },
      {
        q: "Кто может зарегистрироваться и получить визит?",
        a: "Женщины после выписки из роддома и молодые мамы с новорожденными в пилотных районах обслуживания (Ташкент и подключенные региональные поликлиники).",
      },
      {
        q: "Что делать, если врач не пришел в течение 24 часов?",
        a: "Система автоматически поднимает приоритет на 12-м и 18-м часе и направляет резервного врача. Вы также можете позвонить на линию поддержки +998 71 200 10 30 или написать в @OnaCareSupport. При срочной угрозе звоните 103.",
      },
      {
        q: "Как защищены мои медицинские данные и геолокация?",
        a: "ПИНФЛ и врачебные заметки шифруются по стандарту AES-256-GCM и доступны только вам и вашей команде врачей. Передача GPS полностью добровольна — можно указать район и адрес вручную.",
      },
    ],
  },
  en: {
    badge: "Warm Home Care for New Mothers & Babies",
    heroTitle: "Going home after birth? A local doctor visits within 24 hours.",
    heroDesc: "You are never on your own after going home. A family doctor or monitoring nurse from a participating neighborhood clinic visits you and your baby at home, and you can share how you feel each day from your phone.",
    ctaPrimary: "Start Free Postpartum Care",
    ctaOpenPortal: "Open My Portal",
    ctaSecondaryLink: "See how it works",
    ctaSignInPrompt: "Already registered?",
    ctaSignInLink: "Sign In",
    heroPhotoAlt: "A smiling mother holding her newborn baby comfortably at home",
    heroPhotoCaption: "Reassuring home recovery from your very first day back",
    doctorPhotoAlt: "A family doctor checking on a mother and newborn baby at home",
    mobilePhotoAlt: "A mother at home sending a quick daily health update on her phone",
    trust1: "Records encrypted with AES-256-GCM",
    trust2: "Initial home check-up free at partner clinics",
    trust3: "Only you and your care team see your data",

    pipeEyebrow: "After You Leave the Hospital",
    pipeTitle: "Four calm steps to keep you and your baby safe",
    pipeSub: "From hospital discharge summary to your family doctor's home visit — coordinated cleanly for new families.",
    steps: [
      {
        step: "01",
        title: "Your discharge summary reaches your doctor",
        desc: "Your birth team's summary or your intake notes are shared privately with your neighborhood doctor.",
      },
      {
        step: "02",
        title: "Your lab results are reviewed early",
        desc: "Your local doctor checks blood pressure, hemoglobin, and notes before arriving at your door.",
      },
      {
        step: "03",
        title: "A doctor or nurse visits within 24 hours",
        desc: "You see your visit window in advance and confirm arrival with a simple 4-digit code.",
      },
      {
        step: "04",
        title: "Quick daily check-ins from your phone",
        desc: "Share fever, blood pressure, or discomfort in seconds without leaving your baby.",
      },
    ],
    featuresTitle: "Designed for real life with a newborn",
    features: [
      {
        title: "Plain-language home care tips",
        desc: "Clear guidance and warning signs available in Uzbek, Russian, and English.",
      },
      {
        title: "Early alert if you feel unwell",
        desc: "Reporting fever or elevated blood pressure notifies your care team right away.",
      },
      {
        title: "Medicines & lab follow-ups together",
        desc: "Track prescribed doses and upcoming tests in one uncluttered place.",
      },
      {
        title: "Simple 4-digit visit confirmation",
        desc: "Verify that your doctor visited in one tap or with your personal confirmation code.",
      },
    ],

    conditionsEyebrow: "Transparent Terms & Coverage",
    conditionsTitle: "Who delivers the free home visit & 24-hour target conditions",
    conditionsDesc: "Trust comes from clear expectations. Here is exactly who provides care, what is free, and how delays are handled.",
    conditionsCards: [
      {
        title: "Who provides the visit?",
        body: "OnaCare is a pilot care-coordination platform partnering with participating regional family polyclinics. Home visits are performed by verified local family physicians and patronage nurses at those clinics — this is not a nationwide government mandate.",
      },
      {
        title: "What is free vs. optional paid?",
        body: "Account creation, initial 24-hour postpartum home visit coordination, and daily symptom check-ins are free for registered mothers in participating districts. Optional private diagnostics and priority subscription plans are strictly opt-in.",
      },
      {
        title: "24-hour target conditions",
        body: "The 24-hour target applies to verified patients located in participating clinic districts. Automatic reminders trigger at 12 hours and escalate to a backup doctor at 18 hours. For urgent symptoms, always call 103 directly.",
      },
    ],
    promiseZones: [
      {
        title: "0 – 12 Hours • On Schedule",
        detail: "Your local doctor is notified and your home visit window is reserved",
        tone: "green",
      },
      {
        title: "12 – 18 Hours • Automatic Reminder",
        detail: "If not yet marked visited, an alert goes to your doctor and clinic lead",
        tone: "yellow",
      },
      {
        title: "18 – 24 Hours • Backup Dispatch",
        detail: "A clinic coordinator immediately reassigns an available backup physician",
        tone: "red",
      },
    ],

    faqEyebrow: "Frequently Asked Questions",
    faqTitle: "Clear answers for new mothers",
    faqs: [
      {
        q: "How much does OnaCare cost? Is the home visit really free?",
        a: "For registered patients in participating family clinic districts, the initial postpartum home visit coordination, check-in triage, and basic care plan are free. Optional diagnostic lab add-ons or priority chat subscriptions inside the portal are clearly labeled and optional.",
      },
      {
        q: "Who is eligible to use OnaCare?",
        a: "New mothers recently discharged after childbirth and families caring for newborns within participating regional polyclinic districts (such as Tashkent pilot districts and partnered clinics).",
      },
      {
        q: "What happens if my 24-hour visit is missed or delayed?",
        a: "The system alerts your doctor at 12 hours and escalates to a clinic coordinator at 18 hours to dispatch a backup doctor. You can also call our support line at +998 71 200 10 30 or contact @OnaCareSupport. For emergencies, call 103 immediately.",
      },
      {
        q: "How is my medical and GPS data protected?",
        a: "National IDs (JSHSHIR) and clinical notes are encrypted with AES-256-GCM and restricted via strict role-based access control. Sharing live GPS is strictly optional — you may select your district manually at any time. See our Privacy Policy for full details.",
      },
    ],
  },
};

export function LandingPageClient() {
  const { authUser, authChecked } = usePlatform();
  const { lang } = useLanguage();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const t = LANDING_COPY[lang] || LANDING_COPY.uz;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <PublicHeader showAnchors />

      <main className="flex-1">
        {/* Empathetic Mother-First Hero with Real Photography & One Primary CTA */}
        <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 px-3.5 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <IconCalendarHeart className="h-4 w-4 shrink-0 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                  <span>{t.badge}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
                  {t.heroTitle}
                </h1>

                <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200 max-w-xl">
                  {t.heroDesc}
                </p>

                {/* Single Primary CTA */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  {authChecked && authUser ? (
                    <Link
                      href={getPortalHref(authUser.role)}
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-teal-800 transition"
                    >
                      {t.ctaOpenPortal}
                      <IconArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : (
                    <Link
                      href="/signup?role=PATIENT"
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-teal-800 transition"
                    >
                      <IconUserPlus className="h-4 w-4" aria-hidden="true" />
                      {t.ctaPrimary}
                    </Link>
                  )}

                  <a
                    href="#care-steps"
                    className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-teal-800 dark:text-teal-300 hover:underline"
                  >
                    {t.ctaSecondaryLink}
                    <IconArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>

                {!(authChecked && authUser) && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {t.ctaSignInPrompt}{" "}
                    <Link href="/login" className="font-bold text-teal-800 dark:text-teal-300 hover:underline">
                      {t.ctaSignInLink}
                    </Link>
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-700 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <IconLock className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
                    {t.trust1}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <IconHeartHandshake className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
                    {t.trust2}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <IconShieldCheck className="h-4 w-4 text-teal-700 dark:text-teal-400 shrink-0" aria-hidden="true" />
                    {t.trust3}
                  </span>
                </div>
              </div>

              {/* Warm Editorial Photography */}
              <div className="lg:col-span-6">
                <figure className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/mother-baby-home.webp"
                    alt={t.heroPhotoAlt}
                    width={960}
                    height={717}
                    loading="eager"
                    fetchPriority="high"
                    className="w-full h-64 sm:h-80 lg:h-[390px] object-cover"
                  />
                  <figcaption className="px-5 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800">
                    {t.heroPhotoCaption}
                  </figcaption>
                </figure>
              </div>
            </div>

            {/* Emergency 103 Notice */}
            <Emergency103Banner className="mt-8" />
          </div>
        </section>

        {/* How We Look After You (With Doctor Home Visit & Mobile Check-in Photos) */}
        <section id="care-steps" className="mx-auto max-w-7xl px-4 py-14 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                {t.pipeEyebrow}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white leading-snug">
                {t.pipeTitle}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {t.pipeSub}
              </p>
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/doctor-home-visit.webp"
                  alt={t.doctorPhotoAlt}
                  width={960}
                  height={717}
                  loading="lazy"
                  className="w-full h-56 sm:h-64 object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {t.steps.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5 shadow-2xs"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700 text-xs font-bold text-white font-mono">
                    {item.step}
                  </span>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Check-in Photo + Features */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 order-2 lg:order-1">
              <h2 className="sr-only">{t.featuresTitle}</h2>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
                <IconFileText className="h-6 w-6 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-950 dark:text-slate-100">
                  {t.features[0].title}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {t.features[0].desc}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
                <IconMessageHeart className="h-6 w-6 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-950 dark:text-slate-100">
                  {t.features[1].title}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {t.features[1].desc}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
                <IconClipboardCheck className="h-6 w-6 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-950 dark:text-slate-100">
                  {t.features[2].title}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {t.features[2].desc}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
                <IconShieldCheck className="h-6 w-6 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-950 dark:text-slate-100">
                  {t.features[3].title}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {t.features[3].desc}
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/mobile-care-checkin.webp"
                  alt={t.mobilePhotoAlt}
                  width={960}
                  height={717}
                  loading="lazy"
                  className="w-full h-56 sm:h-64 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Substantiated Claims: Clear Conditions, Clinic Coverage & 24h Window */}
        <section id="visit-conditions" className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-14">
          <div className="mx-auto max-w-7xl px-4 space-y-8">
            <div className="max-w-3xl space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                <IconBuildingHospital className="h-4 w-4" aria-hidden="true" />
                {t.conditionsEyebrow}
              </span>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                {t.conditionsTitle}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {t.conditionsDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {t.conditionsCards.map((card, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-5 space-y-2"
                >
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {card.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {t.promiseZones.map((zone) => (
                <div
                  key={zone.title}
                  className={`rounded-xl border px-4 py-3.5 space-y-1 ${
                    zone.tone === "green"
                      ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40"
                      : zone.tone === "yellow"
                        ? "border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40"
                        : "border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40"
                  }`}
                >
                  <p
                    className={`font-bold flex items-center gap-1.5 ${
                      zone.tone === "green"
                        ? "text-emerald-900 dark:text-emerald-200"
                        : zone.tone === "yellow"
                          ? "text-amber-900 dark:text-amber-200"
                          : "text-rose-900 dark:text-rose-200"
                    }`}
                  >
                    <IconClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {zone.title}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {zone.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Accessible FAQ Section */}
        <section id="faq" className="mx-auto max-w-4xl px-4 py-14 space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              {t.faqEyebrow}
            </span>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              {t.faqTitle}
            </h2>
          </div>

          <div className="space-y-3">
            {t.faqs.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              const panelId = `faq-panel-${idx}`;
              const btnId = `faq-btn-${idx}`;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <h3>
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                      className="w-full min-h-[52px] flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-slate-950 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                    >
                      <span>{item.q}</span>
                      <IconChevronDown
                        className={`h-5 w-5 shrink-0 text-slate-600 dark:text-slate-300 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>
                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={btnId}
                      className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
