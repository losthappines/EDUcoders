"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconLock,
  IconMinus,
  IconPlus,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
import { PublicHeader } from "@/components/PublicHeader";
import { Emergency103Banner } from "@/components/Emergency103Banner";
import { SiteFooter } from "@/components/SiteFooter";

function getPortalHref(role) {
  if (role === "PATIENT") return "/patient";
  if (role === "PSYCHOLOGIST") return "/psychologist";
  if (role === "ADMIN_RECEPTION") return "/admin";
  return "/clinical";
}

const LANDING_COPY = {
  uz: {
    eyebrow: "Onalar va chaqaloqlar uchun uyda g'amxo'rlik",
    heroTitleLead: "Tug'ruqdan keyin uyga qaytdingizmi?",
    heroTitleEmphasis: "Oilaviy shifokor 24 soat ichida",
    heroTitleTail: "uyingizga keladi.",
    heroDesc:
      "Uyga chiqqaningizdan so'ng yolg'iz qolmaysiz. Hamkor oilaviy poliklinikangizdan shifokor yoki patronaj hamshirasi siz va chaqalog'ingizni ko'rikdan o'tkazish uchun uyingizga tashrif buyuradi.",
    ctaPrimary: "Bepul parvarishni boshlash",
    ctaOpenPortal: "Shaxsiy kabinetimni ochish",
    ctaSecondaryLink: "Qanday ishlashini ko'rish",
    ctaSignInPrompt: "Allaqachon ro'yxatdan o'tganmisiz?",
    ctaSignInLink: "Kirish",
    heroPhotoAlt: "Uy sharoitida chaqalog'ini mehr bilan quchoqlab turgan yosh o'zbek ona",
    heroPhotoFigure: "FIG. 01 — Uyda ilk 24 soat",
    heroPhotoCaption: "Ilk kundan boshlab xotirjam, ishonchli va shaxsiy patronaj kuzatuvi",
    trust1: "AES-256-GCM shifrlangan yozuvlar",
    trust2: "Hamkor poliklinikalarda birlamchi ko'rik bepul",
    trust3: "Faqat siz va shifokoringiz ko'radi",

    conditionsEyebrow: "01 — 24 soatlik tashrif va shaffof shartlar",
    conditionsTitle: "24 soatlik uy ko'rigi qanday ishlaydi?",
    conditionsDesc:
      "Bemorlarga aniq va halol ma'lumot beramiz: xizmatni kim ko'rsatishi, qaysi bosqichlar bepul ekani va kechikish yuz bersa nima qilinishini oldindan bilishingiz muhim.",
    conditionsCards: [
      {
        title: "Xizmatni kim ko'rsatadi?",
        body: "OnaCare — hamkor hududiy oilaviy poliklinikalar bilan ishlaydigan pilot muvofiqlashtirish platformasi. Uy tashriflarini tizimda tasdiqlangan mahalliy oilaviy shifokorlar va patronaj hamshiralari amalga oshiradi.",
      },
      {
        title: "Nima bepul va nima ixtiyoriy?",
        body: "Ro'yxatdan o'tish, tug'ruqdan keyingi birlamchi 24 soatlik uy ko'rigi, kunlik ahvol tekshiruvi va asosiy tavsiyalar hamkor tumanlarda bepul. Qo'shimcha laborator tekshiruvlar yoki obuna rejalari mutlaqo ixtiyoriy.",
      },
      {
        title: "24 soatlik muddat shartlari",
        body: "24 soatlik maqsadli muddat tizimga ulangan hududlarda ro'yxatdan o'tgan va tasdiqlangan bemorlarga tatbiq etiladi. Shoshilinch holatlarda hech qachon kutmang — darhol 103 chaqiring.",
      },
    ],
    timelineLabel: "24 soatlik nazorat bosqichlari",
    promiseZones: [
      {
        window: "0 – 12 soat",
        title: "Reja bo'yicha",
        detail: "Oilaviy shifokoringiz xabardor qilinadi va tashrif vaqti belgilanadi.",
        tone: "forest",
      },
      {
        window: "12 – 18 soat",
        title: "Avtomatik eslatma",
        detail: "Agar ko'rik belgilanmagan bo'lsa, shifokor va poliklinikaga eslatma boradi.",
        tone: "sage",
      },
      {
        window: "18 – 24 soat",
        title: "Zaxira shifokor",
        detail: "Klinika koordinatori zudlik bilan boshqa bo'sh shifokorni biriktiradi.",
        tone: "rose",
      },
    ],

    pipeEyebrow: "02 — Xizmat jarayoni",
    pipeTitle: "To'rt oddiy qadamda oilangiz xotirjamligi",
    pipeSub:
      "Shifoxona chiqarish xulosasidan tortib, shifokorning uyingizga kelishigacha bo'lgan barcha jarayonlar bir tartibda.",
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

    careTeamEyebrow: "03 — Shifokor va hamshira ishtiroki",
    careTeamTitle: "Tajribali oilaviy shifokorlar va patronaj hamshiralari siz bilan",
    careTeamBody:
      "Har bir tashrif tizimda tasdiqlangan hududiy oilaviy shifokor yoki kuzatuv hamshirasi tomonidan amalga oshiriladi. Shifokorlar tug'ruqxona epikrizini oldindan ko'rib, ona va chaqaloqni uy muhitida shaxsan tekshiradi.",
    careTeamPoints: [
      "Hududingizga biriktirilgan litsenziyaga ega oilaviy shifokor va patronaj hamshirasi",
      "Uy ko'rigi yakunida 4 xonali kod orqali shaffof tasdiqlash",
      "Zarurat tug'ilganda shifokor bilan to'g'ridan-to'g'ri maslahat yozishmalari",
    ],
    careTeamLink: "Klinik standartlar va tizim arxitekturasi",
    doctorPhotoAlt: "Oilaviy shifokor uy tashrifi chog'ida ona va chaqaloqni ko'rikdan o'tkazmoqda",
    doctorPhotoFigure: "FIG. 02 — Shifokor uy tashrifi",

    benefitsEyebrow: "04 — Ona va chaqaloq uchun qulayliklar",
    featuresTitle: "Yangi ona kun tartibiga moslangan",
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
    mobilePhotoAlt: "Ona uyida o'tirib telefon orqali kunlik sog'liq holatini yubormoqda",
    mobilePhotoFigure: "FIG. 03 — Telefondan kunlik holat tekshiruvi",

    privacyEyebrow: "05 — Maxfiylik va savol-javoblar",
    privacyTitle: "Tibbiy ma'lumotlaringiz himoyasi — bizning asosiy tamoyilimiz",
    privacyDesc:
      "JSHSHIR, tahlillar va klinik yozuvlar AES-256-GCM bilan shifrlanadi. Ma'lumotlarni faqat siz va sizga biriktirilgan shifokor ko'radi; GPS lokatsiya esa faqat alohida rozilik oynasi orqali ixtiyoriy olinadi.",
    privacyLink: "Maxfiylik siyosati",
    termsLink: "Foydalanish shartlari",
    faqTitle: "Ko'p beriladigan savollar",
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

    closingEyebrow: "Ro'yxatdan o'tish",
    closingTitle: "Ona va chaqaloq uchun ilk kundan xotirjam g'amxo'rlik",
    closingSub: "Ro'yxatdan o'tish ikki daqiqa vaqt oladi. Hamkor hududlarda birlamchi uy ko'rigi bepul.",
    closingCta: "Bepul ro'yxatdan o'tish",
    closingLogin: "Kabinetga kirish",
  },
  ru: {
    eyebrow: "Домашняя забота о мамах и малышах",
    heroTitleLead: "Выписываетесь после родов домой?",
    heroTitleEmphasis: "Семейный врач придет за 24 часа",
    heroTitleTail: "прямо к вам.",
    heroDesc:
      "После возвращения домой вы не остаетесь одна. Врач или патронажная медсестра из вашей поликлиники навестит вас и малыша дома, а вы сможете каждый день легко сообщать о самочувствии с телефона.",
    ctaPrimary: "Начать бесплатный уход",
    ctaOpenPortal: "Открыть мой кабинет",
    ctaSecondaryLink: "Как это работает",
    ctaSignInPrompt: "Уже зарегистрированы?",
    ctaSignInLink: "Войти",
    heroPhotoAlt: "Молодая мама нежно держит новорожденного малыша дома",
    heroPhotoFigure: "FIG. 01 — Первые 24 часа дома",
    heroPhotoCaption: "Спокойное восстановление и бережное наблюдение с первых суток",
    trust1: "Зашифровано по AES-256-GCM",
    trust2: "Первичный визит в клиниках-партнерах бесплатен",
    trust3: "Доступ только у вас и вашего врача",

    conditionsEyebrow: "01 — Визит за 24 часа и честные условия",
    conditionsTitle: "Кто проводит визит и как работает 24-часовое окно",
    conditionsDesc:
      "Нам важно ваше доверие, поэтому ниже честно описано, кто оказывает помощь, какие услуги бесплатны и что происходит при задержке.",
    conditionsCards: [
      {
        title: "Кто приезжает на дом?",
        body: "OnaCare — пилотная координационная платформа, работающая с участвующими семейными поликлиниками. Осмотры проводят верифицированные участковые врачи и патронажные медсестры этих клиник.",
      },
      {
        title: "Что бесплатно, а что по желанию?",
        body: "Регистрация, первичный 24-часовой визит врача после выписки и ежедневный опрос самочувствия в пилотных районах бесплатны. Дополнительные обследования или расширенные подписки полностью добровольны.",
      },
      {
        title: "Условия 24-часового окна",
        body: "Срок 24 часа действует для подтвержденных пациенток в районах-участниках. При острых состояниях не ждите — сразу звоните 103.",
      },
    ],
    timelineLabel: "Этапы контроля 24-часового визита",
    promiseZones: [
      {
        window: "0 – 12 часов",
        title: "По графику",
        detail: "Семейный врач уведомлен, согласовано окно домашнего визита.",
        tone: "forest",
      },
      {
        window: "12 – 18 часов",
        title: "Автоматическое напоминание",
        detail: "Если осмотр еще не начат, врачу и клинике уходит повторный сигнал.",
        tone: "sage",
      },
      {
        window: "18 – 24 часа",
        title: "Резервный врач",
        detail: "Координатор клиники срочно назначает другого свободного специалиста.",
        tone: "rose",
      },
    ],

    pipeEyebrow: "02 — Как работает сервис",
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

    careTeamEyebrow: "03 — Врачи и патронажные медсестры",
    careTeamTitle: "Участие проверенных семейных врачей и медсестер",
    careTeamBody:
      "Каждый домашний визит выполняет подтвержденный участковый врач или патронажная медсестра вашей поликлиники. Специалист заранее знакомится с выпиской из роддома и проводит осмотр мамы и малыша дома.",
    careTeamPoints: [
      "Лицензированный семейный врач и медсестра вашего участка",
      "Прозрачное подтверждение домашнего визита по 4-значному коду",
      "Прямая переписка с врачом для спокойных ответов на вопросы",
    ],
    careTeamLink: "Клинические стандарты и архитектура",
    doctorPhotoAlt: "Семейный врач осматривает маму и малыша во время домашнего визита",
    doctorPhotoFigure: "FIG. 02 — Домашний осмотр врача",

    benefitsEyebrow: "04 — Польза для мамы и малыша",
    featuresTitle: "Создано для первых недель с новорожденным",
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
    mobilePhotoAlt: "Мама дома легко отмечает свое самочувствие на смартфоне",
    mobilePhotoFigure: "FIG. 03 — Ежедневная отметка с телефона",

    privacyEyebrow: "05 — Приватность и ответы на вопросы",
    privacyTitle: "Защита здоровья и личных данных на первом месте",
    privacyDesc:
      "ПИНФЛ и врачебные записи шифруются по стандарту AES-256-GCM. Доступ открыт только вам и вашей команде врачей, а передача GPS добровольна и защищена экраном согласия.",
    privacyLink: "Политика конфиденциальности",
    termsLink: "Условия использования",
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

    closingEyebrow: "Регистрация",
    closingTitle: "Спокойная поддержка мамы и малыша с первых часов дома",
    closingSub: "Регистрация займет пару минут. Первичный осмотр в районах-партнерах бесплатен.",
    closingCta: "Зарегистрироваться бесплатно",
    closingLogin: "Войти в кабинет",
  },
  en: {
    eyebrow: "Maternal & Newborn Home Care",
    heroTitleLead: "Going home after birth?",
    heroTitleEmphasis: "A family doctor visits within 24 hours",
    heroTitleTail: "right at your door.",
    heroDesc:
      "You are never on your own after leaving the hospital. A family physician or patronage nurse from a participating neighborhood clinic visits you and your baby at home, while daily phone check-ins keep care close.",
    ctaPrimary: "Start Free Postpartum Care",
    ctaOpenPortal: "Open My Portal",
    ctaSecondaryLink: "See how it works",
    ctaSignInPrompt: "Already registered?",
    ctaSignInLink: "Sign In",
    heroPhotoAlt: "A smiling mother holding her newborn baby comfortably at home",
    heroPhotoFigure: "FIG. 01 — First 24 Hours Home",
    heroPhotoCaption: "Calm postpartum recovery and clinical follow-up from day one",
    trust1: "Records encrypted with AES-256-GCM",
    trust2: "Initial home check-up free at partner clinics",
    trust3: "Visible only to you and your care team",

    conditionsEyebrow: "01 — The 24-Hour Home Visit & Terms",
    conditionsTitle: "How the free visit and 24-hour target work",
    conditionsDesc:
      "Trust begins with clear expectations. Below is exactly who delivers your visit, what is free, and how our clinics respond if anything is delayed.",
    conditionsCards: [
      {
        title: "Who provides the visit?",
        body: "OnaCare is a pilot care-coordination platform partnering with participating regional family polyclinics. Home visits are performed by verified local family physicians and patronage nurses at those clinics.",
      },
      {
        title: "What is free vs. optional?",
        body: "Account creation, initial 24-hour postpartum home visit coordination, and daily symptom check-ins are free in participating districts. Optional private diagnostics or priority plans are strictly opt-in.",
      },
      {
        title: "24-hour window conditions",
        body: "The 24-hour target applies to verified patients located in participating clinic districts. For urgent or severe symptoms, never wait — call 103 immediately.",
      },
    ],
    timelineLabel: "24-Hour Coordination Windows",
    promiseZones: [
      {
        window: "0 – 12 Hours",
        title: "On Schedule",
        detail: "Your local doctor is notified and your home visit window is reserved.",
        tone: "forest",
      },
      {
        window: "12 – 18 Hours",
        title: "Automatic Reminder",
        detail: "If not yet marked visited, an alert goes to your doctor and clinic lead.",
        tone: "sage",
      },
      {
        window: "18 – 24 Hours",
        title: "Backup Dispatch",
        detail: "A clinic coordinator immediately assigns an available backup physician.",
        tone: "rose",
      },
    ],

    pipeEyebrow: "02 — How the Service Works",
    pipeTitle: "Four calm steps from discharge to home check-up",
    pipeSub: "From maternity discharge summary to your doctor arriving at home — coordinated quietly behind the scenes.",
    steps: [
      {
        step: "01",
        title: "Your discharge summary reaches your doctor",
        desc: "Your birth team's summary or intake notes are shared privately with your neighborhood doctor.",
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

    careTeamEyebrow: "03 — Doctors & Monitoring Nurses",
    careTeamTitle: "Verified local physicians and patronage nurses at your side",
    careTeamBody:
      "Every home check-up is performed by a credentialed family physician or monitoring nurse from your district polyclinic. Clinicians review your hospital summary beforehand so your home exam is thoughtful and unhurried.",
    careTeamPoints: [
      "Licensed family doctors and nurses verified by participating clinics",
      "4-digit patient confirmation code ensuring every home visit is accounted for",
      "Direct follow-up messaging whenever questions arise between visits",
    ],
    careTeamLink: "Institutional overview & clinical standards",
    doctorPhotoAlt: "A family doctor checking on a mother and newborn baby at home",
    doctorPhotoFigure: "FIG. 02 — Clinician Home Visit",

    benefitsEyebrow: "04 — Benefits for Mothers & Newborns",
    featuresTitle: "Thoughtfully designed for real life with a newborn",
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
    mobilePhotoAlt: "A mother at home sending a quick daily health update on her phone",
    mobilePhotoFigure: "FIG. 03 — Gentle Daily Check-In",

    privacyEyebrow: "05 — Privacy & Questions",
    privacyTitle: "Health privacy and consent by design",
    privacyDesc:
      "National IDs (JSHSHIR) and inpatient notes are encrypted with AES-256-GCM. Strict clinic-scoped access ensures only you and your assigned team view your care record, while GPS sharing always remains optional.",
    privacyLink: "Privacy Policy",
    termsLink: "Terms of Service",
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

    closingEyebrow: "Begin Care",
    closingTitle: "Calm, trustworthy care for your first days at home",
    closingSub: "Registration takes two minutes. Initial postpartum home visits are free in partner districts.",
    closingCta: "Create Free Mother Account",
    closingLogin: "Sign In",
  },
};

export function LandingPageClient() {
  const { authUser, authChecked } = usePlatform();
  const { lang } = useLanguage();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const t = LANDING_COPY[lang] || LANDING_COPY.uz;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EF] dark:bg-[#161A18] text-[#292E2B] dark:text-[#F3F0E8] transition-colors duration-200">
      <PublicHeader showAnchors />

      <main className="flex-1">
        {/* 1. Asymmetric Scandinavian / Swiss Editorial Hero */}
        <section className="border-b border-[#DDD8CC] dark:border-[#2F3632]">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-10 pb-14 md:pt-16 md:pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              <div className="lg:col-span-7 space-y-6 lg:pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#244C40] dark:text-[#A7BBAA]">
                  {t.eyebrow}
                </p>

                <h1 className="font-heading text-3xl sm:text-5xl lg:text-[3.2rem] font-semibold tracking-tight text-[#292E2B] dark:text-[#F3F0E8] leading-[1.09]">
                  {t.heroTitleLead}{" "}
                  <span className="font-editorial-serif italic font-normal text-[#244C40] dark:text-[#A7BBAA]">
                    {t.heroTitleEmphasis}
                  </span>{" "}
                  {t.heroTitleTail}
                </h1>

                <p className="text-base sm:text-[17px] leading-relaxed text-[#525954] dark:text-[#B6BCB6] max-w-xl">
                  {t.heroDesc}
                </p>

                <div className="flex flex-wrap items-center gap-5 pt-2">
                  {authChecked && authUser ? (
                    <Link
                      href={getPortalHref(authUser.role)}
                      className="inline-flex min-h-[48px] items-center gap-2.5 rounded-sm bg-[#244C40] hover:bg-[#1A382F] dark:bg-[#2C5B4D] dark:hover:bg-[#356D5C] px-7 py-3.5 text-sm font-semibold text-[#F7F5EF] transition-colors"
                    >
                      {t.ctaOpenPortal}
                      <IconArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : (
                    <Link
                      href="/signup?role=PATIENT"
                      className="inline-flex min-h-[48px] items-center gap-2.5 rounded-sm bg-[#244C40] hover:bg-[#1A382F] dark:bg-[#2C5B4D] dark:hover:bg-[#356D5C] px-7 py-3.5 text-sm font-semibold text-[#F7F5EF] transition-colors"
                    >
                      {t.ctaPrimary}
                      <IconArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}

                  <a
                    href="#care-steps"
                    className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-[#292E2B] dark:text-[#F3F0E8] border-b border-[#244C40] dark:border-[#A7BBAA] pb-0.5 hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors"
                  >
                    {t.ctaSecondaryLink}
                  </a>
                </div>

                {!(authChecked && authUser) && (
                  <p className="text-xs text-[#525954] dark:text-[#B6BCB6]">
                    {t.ctaSignInPrompt}{" "}
                    <Link href="/login" className="font-semibold text-[#244C40] dark:text-[#A7BBAA] underline underline-offset-4">
                      {t.ctaSignInLink}
                    </Link>
                  </p>
                )}

                <div className="pt-6 border-t border-[#DDD8CC] dark:border-[#2F3632] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#525954] dark:text-[#B6BCB6]">
                  <p className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#244C40] dark:bg-[#A7BBAA] mt-1.5 shrink-0" aria-hidden="true" />
                    <span>{t.trust1}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#A7BBAA] mt-1.5 shrink-0" aria-hidden="true" />
                    <span>{t.trust2}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9B8AE] mt-1.5 shrink-0" aria-hidden="true" />
                    <span>{t.trust3}</span>
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5">
                <figure className="bg-[#EFECE3] dark:bg-[#1D221F] p-2.5 sm:p-3 border border-[#DDD8CC] dark:border-[#2F3632] rounded-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/mother-baby-home.webp"
                    alt={t.heroPhotoAlt}
                    width={960}
                    height={717}
                    loading="eager"
                    fetchPriority="high"
                    className="w-full h-72 sm:h-96 lg:h-[440px] object-cover"
                  />
                  <figcaption className="pt-3 pb-1 px-1 flex flex-col gap-0.5">
                    <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#525954] dark:text-[#B6BCB6]">
                      {t.heroPhotoFigure}
                    </span>
                    <span className="text-xs text-[#292E2B] dark:text-[#F3F0E8]">
                      {t.heroPhotoCaption}
                    </span>
                  </figcaption>
                </figure>
              </div>
            </div>

            <Emergency103Banner className="mt-10" />
          </div>
        </section>

        {/* 2. Simple Explanation of the 24-Hour Home Visit & Conditions */}
        <section id="visit-conditions" className="border-b border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF] dark:bg-[#1D221F]">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#244C40] dark:text-[#A7BBAA]">
                {t.conditionsEyebrow}
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-[#292E2B] dark:text-[#F3F0E8] leading-snug">
                {t.conditionsTitle}
              </h2>
              <p className="text-sm text-[#525954] dark:text-[#B6BCB6] leading-relaxed">
                {t.conditionsDesc}
              </p>

              {/* Calm 24-Hour Window Progression */}
              <div className="pt-4 space-y-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#525954] dark:text-[#B6BCB6]">
                  {t.timelineLabel}
                </p>
                <div className="divide-y divide-[#DDD8CC] dark:divide-[#2F3632] border-y border-[#DDD8CC] dark:border-[#2F3632]">
                  {t.promiseZones.map((zone) => (
                    <div key={zone.window} className="py-3.5 flex items-start gap-4">
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 ${
                          zone.tone === "forest"
                            ? "bg-[#244C40] dark:bg-[#A7BBAA]"
                            : zone.tone === "sage"
                              ? "bg-[#A7BBAA]"
                              : "bg-[#D9B8AE]"
                        }`}
                        aria-hidden="true"
                      />
                      <div className="space-y-0.5 text-xs">
                        <p className="font-heading font-semibold text-[#292E2B] dark:text-[#F3F0E8]">
                          <span className="font-mono tabular-nums mr-2 text-[#525954] dark:text-[#B6BCB6]">
                            {zone.window}
                          </span>
                          {zone.title}
                        </p>
                        <p className="text-[#525954] dark:text-[#B6BCB6] leading-relaxed">
                          {zone.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 divide-y divide-[#DDD8CC] dark:divide-[#2F3632] border-t border-[#DDD8CC] dark:border-[#2F3632]">
              {t.conditionsCards.map((item, idx) => (
                <div key={idx} className="py-7 first:pt-7 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6">
                  <div className="sm:col-span-4">
                    <h3 className="font-heading text-base font-semibold text-[#292E2B] dark:text-[#F3F0E8]">
                      {item.title}
                    </h3>
                  </div>
                  <div className="sm:col-span-8">
                    <p className="text-sm text-[#525954] dark:text-[#B6BCB6] leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. How the Service Works (Swiss Architectural 4-Column Rule Grid) */}
        <section id="care-steps" className="border-b border-[#DDD8CC] dark:border-[#2F3632]">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 md:py-24 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              <div className="lg:col-span-7 space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#244C40] dark:text-[#A7BBAA]">
                  {t.pipeEyebrow}
                </p>
                <h2 className="font-heading text-2xl sm:text-4xl font-semibold tracking-tight text-[#292E2B] dark:text-[#F3F0E8] leading-tight">
                  {t.pipeTitle}
                </h2>
              </div>
              <div className="lg:col-span-5">
                <p className="text-sm text-[#525954] dark:text-[#B6BCB6] leading-relaxed">
                  {t.pipeSub}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-[#DDD8CC] dark:border-[#2F3632]">
              {t.steps.map((item) => (
                <div
                  key={item.step}
                  className="border-r border-b border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF]/60 dark:bg-[#1D221F]/60 p-6 sm:p-7 flex flex-col justify-between gap-6"
                >
                  <span className="font-heading text-3xl font-light tracking-tight text-[#A7BBAA] dark:text-[#6E8572] tabular-nums">
                    {item.step}
                  </span>
                  <div className="space-y-2.5">
                    <h3 className="font-heading text-base font-semibold text-[#292E2B] dark:text-[#F3F0E8] leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#525954] dark:text-[#B6BCB6] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Doctor & Nurse Involvement + Mother/Newborn Benefits (Editorial Photography Spreads) */}
        <section className="border-b border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF] dark:bg-[#1D221F]">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 md:py-24 space-y-20">
            {/* Spread A: Doctor & Nurse Involvement */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              <figure className="lg:col-span-6 bg-[#F7F5EF] dark:bg-[#161A18] p-2.5 border border-[#DDD8CC] dark:border-[#2F3632] rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/doctor-home-visit.webp"
                  alt={t.doctorPhotoAlt}
                  width={960}
                  height={717}
                  loading="lazy"
                  className="w-full h-72 sm:h-80 lg:h-[360px] object-cover"
                />
                <figcaption className="pt-2.5 px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#525954] dark:text-[#B6BCB6]">
                  {t.doctorPhotoFigure}
                </figcaption>
              </figure>

              <div className="lg:col-span-6 space-y-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#244C40] dark:text-[#A7BBAA]">
                  {t.careTeamEyebrow}
                </p>
                <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-[#292E2B] dark:text-[#F3F0E8] leading-snug">
                  {t.careTeamTitle}
                </h2>
                <p className="text-sm text-[#525954] dark:text-[#B6BCB6] leading-relaxed">
                  {t.careTeamBody}
                </p>
                <ul className="divide-y divide-[#DDD8CC] dark:divide-[#2F3632] border-y border-[#DDD8CC] dark:border-[#2F3632] text-sm text-[#292E2B] dark:text-[#F3F0E8]">
                  {t.careTeamPoints.map((pt, i) => (
                    <li key={i} className="py-3 flex items-start gap-3">
                      <span className="font-mono text-xs text-[#244C40] dark:text-[#A7BBAA] mt-0.5">
                        0{i + 1}
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                <div>
                  <Link
                    href="/technology"
                    className="inline-flex min-h-[40px] items-center gap-2 text-xs font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:underline underline-offset-4"
                  >
                    {t.careTeamLink}
                    <IconArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Spread B: Benefits for Mothers & Newborns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center pt-14 border-t border-[#DDD8CC] dark:border-[#2F3632]">
              <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
                <div className="space-y-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#244C40] dark:text-[#A7BBAA]">
                    {t.benefitsEyebrow}
                  </p>
                  <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-[#292E2B] dark:text-[#F3F0E8] leading-snug">
                    {t.featuresTitle}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7 pt-2">
                  {t.features.map((feat, idx) => (
                    <div key={idx} className="border-t-2 border-[#A7BBAA] dark:border-[#6E8572] pt-3.5 space-y-1.5">
                      <h3 className="font-heading text-sm font-semibold text-[#292E2B] dark:text-[#F3F0E8]">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-[#525954] dark:text-[#B6BCB6] leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <figure className="lg:col-span-6 order-1 lg:order-2 bg-[#F7F5EF] dark:bg-[#161A18] p-2.5 border border-[#DDD8CC] dark:border-[#2F3632] rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/mobile-care-checkin.webp"
                  alt={t.mobilePhotoAlt}
                  width={960}
                  height={717}
                  loading="lazy"
                  className="w-full h-72 sm:h-80 lg:h-[360px] object-cover"
                />
                <figcaption className="pt-2.5 px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#525954] dark:text-[#B6BCB6]">
                  {t.mobilePhotoFigure}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 4.5 Mothers Community & Perinatal Psychological Support */}
        <section className="border-b border-[#DDD8CC] dark:border-[#2F3632] bg-[#EFECE3]/50 dark:bg-[#1A1F1C]">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#244C40] dark:text-[#A7BBAA]">
                {lang === "ru"
                  ? "Сообщество и бережная поддержка"
                  : lang === "en"
                    ? "Community & Perinatal Support"
                    : "Hamjamiyat va ruhiy qo'llab-quvvatlash"}
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-[#292E2B] dark:text-[#F3F0E8] leading-snug">
                {lang === "ru"
                  ? "Круги мам по возрасту малыша и консультации перинатального психолога"
                  : lang === "en"
                    ? "Newborn stage circles and private sessions with perinatal psychologists"
                    : "Chaqaloq yoshiga mos onalar davralari va perinatal psixolog bilan xavfsiz suhbat"}
              </h2>
              <p className="text-sm text-[#525954] dark:text-[#B6BCB6] leading-relaxed max-w-2xl">
                {lang === "ru"
                  ? "Отмечайте ежедневное настроение за 10 секунд, получайте напоминания о лекарствах за 10 минут и обращайтесь к проверенному психологу с вашего согласия."
                  : lang === "en"
                    ? "Check in daily in 10 seconds, get Telegram medication reminders 10 minutes before each dose, and connect with verified psychologists strictly on your consent."
                    : "Kundalik kayfiyatingizni 10 soniyada belgilang, har bir dori dozasidan 10 daqiqa oldin Telegram eslatma oling va o'z roziligingiz bilan tekshirilgan psixologga ulaning."}
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-wrap lg:justify-end items-center gap-3">
              <Link
                href="/hamjamiyat"
                className="inline-flex min-h-[46px] items-center gap-2 rounded-sm bg-[#244C40] hover:bg-[#1A382F] dark:bg-[#2C5B4D] dark:hover:bg-[#356D5C] px-6 py-3 text-xs sm:text-sm font-semibold text-[#F7F5EF] transition-colors"
              >
                {lang === "ru"
                  ? "Открыть сообщество мам"
                  : lang === "en"
                    ? "Explore Mothers Community"
                    : "Onalar hamjamiyatini ochish"}
                <IconArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/signup?role=PSYCHOLOGIST"
                className="inline-flex min-h-[46px] items-center gap-2 rounded-sm border border-[#DDD8CC] dark:border-[#2F3632] bg-[#FFFFFF] dark:bg-[#1D221F] px-5 py-3 text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8] hover:border-[#244C40] transition-colors"
              >
                {lang === "ru"
                  ? "Я перинатальный психолог"
                  : lang === "en"
                    ? "Join as Psychologist"
                    : "Psixolog sifatida qo'shilish"}
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Privacy Commitments & Editorial FAQ */}
        <section id="faq" className="border-b border-[#DDD8CC] dark:border-[#2F3632]">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#244C40] dark:text-[#A7BBAA]">
                {t.privacyEyebrow}
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-[#292E2B] dark:text-[#F3F0E8] leading-snug">
                {t.privacyTitle}
              </h2>
              <p className="text-sm text-[#525954] dark:text-[#B6BCB6] leading-relaxed">
                {t.privacyDesc}
              </p>
              <div className="flex flex-wrap items-center gap-5 pt-2 text-xs font-semibold">
                <Link
                  href="/privacy"
                  className="inline-flex min-h-[40px] items-center gap-1.5 text-[#244C40] dark:text-[#A7BBAA] underline underline-offset-4"
                >
                  <IconLock className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.privacyLink}
                </Link>
                <Link
                  href="/terms"
                  className="inline-flex min-h-[40px] items-center gap-1.5 text-[#525954] dark:text-[#B6BCB6] hover:text-[#244C40] dark:hover:text-[#F3F0E8] underline underline-offset-4"
                >
                  {t.termsLink}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-heading text-lg font-semibold text-[#292E2B] dark:text-[#F3F0E8]">
                {t.faqTitle}
              </h3>

              <div className="divide-y divide-[#DDD8CC] dark:divide-[#2F3632] border-y border-[#DDD8CC] dark:border-[#2F3632]">
                {t.faqs.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  const panelId = `faq-panel-${idx}`;
                  const btnId = `faq-btn-${idx}`;
                  return (
                    <div key={idx}>
                      <h4>
                        <button
                          id={btnId}
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                          className="w-full min-h-[54px] flex items-center justify-between gap-4 py-4 text-left text-sm sm:text-base font-medium text-[#292E2B] dark:text-[#F3F0E8] hover:text-[#244C40] dark:hover:text-[#A7BBAA] transition-colors"
                        >
                          <span>{item.q}</span>
                          {isOpen ? (
                            <IconMinus className="h-4 w-4 shrink-0 text-[#244C40] dark:text-[#A7BBAA]" aria-hidden="true" />
                          ) : (
                            <IconPlus className="h-4 w-4 shrink-0 text-[#525954] dark:text-[#B6BCB6]" aria-hidden="true" />
                          )}
                        </button>
                      </h4>
                      {isOpen && (
                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={btnId}
                          className="pb-5 pr-8 text-xs sm:text-sm text-[#525954] dark:text-[#B6BCB6] leading-relaxed"
                        >
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 6. Clear Registration CTA Band */}
        <section className="bg-[#244C40] dark:bg-[#1D221F] text-[#F7F5EF]">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 md:py-20 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D9B8AE]">
                {t.closingEyebrow}
              </p>
              <h2 className="font-heading text-2xl sm:text-4xl font-semibold tracking-tight text-[#F7F5EF] leading-tight">
                {t.closingTitle}
              </h2>
              <p className="text-sm text-[#F7F5EF]/80 leading-relaxed">
                {t.closingSub}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              {authChecked && authUser ? (
                <Link
                  href={getPortalHref(authUser.role)}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-sm bg-[#F7F5EF] hover:bg-[#EFECE3] px-6 py-3 text-sm font-semibold text-[#244C40] transition-colors"
                >
                  {t.ctaOpenPortal}
                  <IconArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup?role=PATIENT"
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-sm bg-[#F7F5EF] hover:bg-[#EFECE3] px-6 py-3 text-sm font-semibold text-[#244C40] transition-colors"
                  >
                    {t.closingCta}
                    <IconArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-sm border border-[#F7F5EF]/40 hover:border-[#F7F5EF] px-5 py-3 text-sm font-medium text-[#F7F5EF] transition-colors"
                  >
                    {t.closingLogin}
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
