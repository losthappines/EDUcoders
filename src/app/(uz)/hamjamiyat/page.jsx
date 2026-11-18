"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconBell,
  IconBrandTelegram,
  IconCalendarEvent,
  IconCheck,
  IconCopy,
  IconHeadphones,
  IconHeartHandshake,
  IconLock,
  IconMicrophone,
  IconPhoneCall,
  IconShieldCheck,
  IconStethoscope,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePlatform } from "@/context/PlatformContext";
import { PublicHeader } from "@/components/PublicHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MOOD_SCALE } from "@/lib/wellbeing-catalog";

const COMMUNITY_COPY = {
  uz: {
    eyebrow: "Onalar hamjamiyati va perinatal ruhiy ko'mak",
    heroTitle: "Tug'ruqdan keyin siz yolg'iz emassiz.",
    heroDesc:
      "Yangi onalar uchun yoshga mos xavfsiz davralar, kunlik kayfiyat tekshiruvi (EPDS), tasdiqlangan perinatal psixologlar bilan shaxsiy seanslar va Telegram hamjamiyat.",
    primaryCta: "Onalar hamjamiyatiga qo'shilish",
    psychCta: "Psixolog sifatida qo'shilish",
    emergencyBanner:
      "Shoshilinch jismoniy yoki ruhiy holatlarda (kuchli qon ketish, yuqori isitma, o'ziga zarar yetkazish fikri) darhol 103 ga qo'ng'iroq qiling.",
    metricsMothers: "Ro'yxatdan o'tgan onalar",
    metricsSessions: "Band qilingan psixolog seanslari",
    metricsSpecialists: "Tasdiqlangan mutaxassislar",
    cohortsTitle: "Chaqaloq yoshiga ko'ra onalar davralari",
    cohortsSub:
      "Haqiqiy foydalanuvchi oqimlari asosida anonimlashtirilgan guruhlar — har bir ona o'ziga o'xshash bosqichdagi onalar bilan birga.",
    cohorts: [
      { key: "d0_30", label: "0–30 kunlik davr", desc: "Chaqaloq bilan ilk kunlar, emizish va tiklanish" },
      { key: "m1_3", label: "1–3 oylik davr", desc: "Uyqu ritmi, kolika va kundalik parvarish" },
      { key: "m3_6", label: "3–6 oylik davr", desc: "Chaqaloq o'sishi, charchoqni yengish va qo'llab-quvvatlash" },
      { key: "m6_12", label: "6–12 oylik davr", desc: "Qo'shimcha ovqat, onaning o'ziga vaqt ajratishi" },
    ],
    mothersWord: "ona",
    circlesTitle: "Haftalik jonli audio va psixolog davralari",
    circlesSub: "Kamerasiz, sokin muhitda mutaxassis va boshqa onalar bilan suhbatlashing.",
    rsvpBtn: "Joy band qilish",
    rsvpedBtn: "Band qilindi ✓",
    specialistsTitle: "Tasdiqlangan perinatal psixologlar va oilaviy shifokorlar",
    specialistsSub:
      "Psixologlar faqat sizning aniq roziligingiz (PsychConsent) bilan kayfiyat va EPDS natijalarini ko'radi. Tibbiy EHR tahlillari alohida saqlanadi.",
    specialistsEmpty: "Mutaxassislar jamoasi tasdiqlash jarayonida — ro'yxat tez orada to'ldiriladi.",
    expWord: "yil tajriba",
    bookConsult: "Kabinetda rozilik va seans",
    voicePreviewTitle: "Ovozli kunlik check-in namunasi (Interaktiv ko'rik)",
    voicePreviewSub:
      "Ona ovoz orqali holatini aytganda tizim kayfiyat bali (1–5) va shoshilinch belgilarni qanday ajratishini sinab ko'ring.",
    voiceTryBtn: "Namuna matnni sinash",
    voiceSamples: [
      {
        id: "calm",
        label: "Yaxshi kun",
        transcript: "Bugun chaqalog'im yaxshi emdi, o'zim ham 6 soat uxladim, kayfiyatim yaxshi.",
        mood: 4,
        tags: ["Uyqu barqaror", "Emizish yaxshi"],
        flag: "GREEN",
      },
      {
        id: "tired",
        label: "Tashvish va charchoq",
        transcript: "Uch kundan beri uxlay olmayapman, sababsiz xavotir va yig'i kelyapti.",
        mood: 2,
        tags: ["EPDS skrining tavsiya etiladi", "Psixolog ko'magi"],
        flag: "PSYCH_RISK",
      },
    ],
    privacyTitle: "Maxfiylik va klinik ma'lumotlardan ajratilganlik kafolati",
    privacyPoints: [
      "Psixolog kabineti hech qachon shifoxona EHR tashxislari, JSHSHIR yoki laboratoriya tahlillarini ko'ra olmaydi.",
      "Kundalik kayfiyat yozuvlaringizni psixologga ochish faqat sizning «Rozilik berish / Bekor qilish» tugmangiz bilan boshqariladi.",
      "Faqat EPDS Q10 (o'ziga zarar yetkazish xavfi) holatida 1 soatlik 103 SLA ogohlantirishi hudud shifokori va psixologiga yuboriladi.",
    ],
    tgTitle: "Telegram bot va Mini App orqali tezkor ulanish",
    tgSub:
      "Ertalab 09:00 da 1-bosish kayfiyat check-in, dori ichishdan 10 daqiqa oldin eslatmalar va psixolog bilan shaxsiy muloqot.",
    tgCopy: "Havolani nusxalash",
    tgCopied: "Nusxalandi ✓",
    tgOpen: "Telegram botni ochish",
    faqTitle: "Ko'p beriladigan savollar",
    faqs: [
      {
        q: "Onalar hamjamiyati va kunlik check-in bepulmi?",
        a: "Ha. Kundalik kayfiyat tekshiruvi, haftalik EPDS skrining, Telegram dori eslatmalari va onalar davralari barcha ro'yxatdan o'tgan onalar uchun bepul.",
      },
      {
        q: "Psixolog mening shifoxona tahlillarimni ko'ra oladimi?",
        a: "Yo'q. Tizimda tibbiy EHR (EhrRecord, LabReport) va psixologik yozuvlar (PsychNote, PsychConsent) qat'iy ajratilgan.",
      },
      {
        q: "Rozilikni keyinroq bekor qilsam bo'ladimi?",
        a: "Ha, istalgan payt Bemor kabinetidagi «Psixolog» bo'limida 1 bosish bilan rozilikni bekor qilishingiz mumkin.",
      },
    ],
  },
  ru: {
    eyebrow: "Сообщество мам и перинатальная поддержка",
    heroTitle: "После родов вы не остаетесь один на один.",
    heroDesc:
      "Бережные круги по возрасту малыша, ежедневная проверка самочувствия и EPDS, сеансы с проверенными перинатальными психологами и Telegram-сообщество.",
    primaryCta: "Присоединиться к сообществу",
    psychCta: "Для психологов",
    emergencyBanner:
      "При угрожающих физических или кризисных состояниях (сильное кровотечение, высокая температура, мысли о самоповреждении) немедленно звоните 103.",
    metricsMothers: "Зарегистрированных мам",
    metricsSessions: "Забронированных сеансов",
    metricsSpecialists: "Проверенных специалистов",
    cohortsTitle: "Группы мам по возрасту малыша",
    cohortsSub: "Анонимизированная статистика реальных потоков: вы всегда среди мам на том же этапе.",
    cohorts: [
      { key: "d0_30", label: "0–30 дней", desc: "Первые недели после роддома, ГВ и восстановление" },
      { key: "m1_3", label: "1–3 месяца", desc: "Режим сна, колики и адаптация семьи" },
      { key: "m3_6", label: "3–6 месяцев", desc: "Развитие малыша, профилактика выгорания" },
      { key: "m6_12", label: "6–12 месяцев", desc: "Прикорм и возвращение ресурса мамы" },
    ],
    mothersWord: "мам",
    circlesTitle: "Еженедельные аудио-круги поддержки",
    circlesSub: "Спокойный формат без видеокамер с психологом и другими мамами.",
    rsvpBtn: "Записаться",
    rsvpedBtn: "Вы записаны ✓",
    specialistsTitle: "Проверенные перинатальные психологи и семейные врачи",
    specialistsSub:
      "Психолог видит отметки настроения и EPDS только после вашего явного согласия (PsychConsent). Клинические анализы и диагнозы EHR изолированы.",
    specialistsEmpty: "Специалисты проходят верификацию — список обновляется в реальном времени.",
    expWord: "лет стажа",
    bookConsult: "Перейти в кабинет",
    voicePreviewTitle: "Демо голосового чек-ина (Интерактивный предпросмотр)",
    voicePreviewSub:
      "Посмотрите, как голосовой ответ мамы превращается в шкалу настроения (1–5) и сигналы заботы.",
    voiceTryBtn: "Выбрать пример",
    voiceSamples: [
      {
        id: "calm",
        label: "Спокойный день",
        transcript: "Сегодня малыш хорошо поел, я поспала 6 часов, чувствую себя уверенно.",
        mood: 4,
        tags: ["Сон стабилен", "ГВ в норме"],
        flag: "GREEN",
      },
      {
        id: "tired",
        label: "Тревога и усталость",
        transcript: "Три дня почти не сплю, постоянная тревога без причины и слезы.",
        mood: 2,
        tags: ["Рекомендован скрининг EPDS", "Поддержка психолога"],
        flag: "PSYCH_RISK",
      },
    ],
    privacyTitle: "Гарантия приватности и изоляции медкарты",
    privacyPoints: [
      "Кабинет психолога технически не имеет доступа к больничному EHR, ПИНФЛ и анализам крови.",
      "Доступ к дневнику настроения включается и отзывается вами в один клик.",
      "Лишь при кризисном ответе EPDS Q10 включается 1-часовой 103 SLA для экстренной помощи.",
    ],
    tgTitle: "Быстрый доступ через Telegram-бота и Mini App",
    tgSub:
      "Утренний чек-ин в 09:00, напоминания о лекарствах за 10 минут до приема и прямая связь с психологом.",
    tgCopy: "Копировать ссылку",
    tgCopied: "Скопировано ✓",
    tgOpen: "Открыть Telegram-бота",
    faqTitle: "Частые вопросы",
    faqs: [
      {
        q: "Бесплатны ли сообщество и ежедневные чек-ины?",
        a: "Да. Ежедневный трекер настроения, еженедельный EPDS, напоминания о лекарствах и групповые круги бесплатны для всех мам.",
      },
      {
        q: "Видит ли психолог мои больничные анализы?",
        a: "Нет. Клинические записи (EhrRecord, LabReport) и заметки психолога (PsychNote) строго разделены на уровне сервера.",
      },
      {
        q: "Можно ли отозвать согласие?",
        a: "Да, в любое время в разделе «Психолог» вашего личного кабинета.",
      },
    ],
  },
  en: {
    eyebrow: "Mothers Community & Perinatal Mental Wellbeing",
    heroTitle: "You never have to navigate postpartum alone.",
    heroDesc:
      "Age-matched newborn circles, 1-tap daily mood & EPDS check-ins, private consultations with verified perinatal psychologists, and instant Telegram support.",
    primaryCta: "Join the Mothers Community",
    psychCta: "Join as a Psychologist",
    emergencyBanner:
      "For urgent medical or mental health emergencies (heavy bleeding, high fever, thoughts of self-harm), call 103 immediately.",
    metricsMothers: "Verified Mothers",
    metricsSessions: "Booked Psych Sessions",
    metricsSpecialists: "Verified Specialists",
    cohortsTitle: "Live Newborn Age Circles",
    cohortsSub: "Anonymized live community cohorts matching your baby's exact stage.",
    cohorts: [
      { key: "d0_30", label: "0–30 Days", desc: "First weeks home, feeding rhythm & physical recovery" },
      { key: "m1_3", label: "1–3 Months", desc: "Sleep shifts, soothing & emotional adjustment" },
      { key: "m3_6", label: "3–6 Months", desc: "Growth milestones, maternal rest & burnout prevention" },
      { key: "m6_12", label: "6–12 Months", desc: "First solids, returning to routines & community" },
    ],
    mothersWord: "mothers",
    circlesTitle: "Weekly Audio Support Circles",
    circlesSub: "Camera-free calm sessions guided by verified perinatal specialists.",
    rsvpBtn: "Reserve Spot",
    rsvpedBtn: "Reserved ✓",
    specialistsTitle: "Verified Perinatal Psychologists & Family Doctors",
    specialistsSub:
      "Psychologists only view wellbeing & EPDS trends with your explicit PsychConsent. Clinical EHR lab results remain strictly separated.",
    specialistsEmpty: "Verified specialists will appear here as soon as coordinator onboarding completes.",
    expWord: "yrs exp",
    bookConsult: "Manage Consent & Book",
    voicePreviewTitle: "Voice Check-in Preview (Interactive Demo)",
    voicePreviewSub:
      "Preview how spoken daily check-ins map to a 1–5 mood score and supportive follow-up prompts.",
    voiceTryBtn: "Preview sample",
    voiceSamples: [
      {
        id: "calm",
        label: "Steady Day",
        transcript: "Baby fed well today and I got 6 hours of sleep — feeling calmer and rested.",
        mood: 4,
        tags: ["Sleep steady", "Feeding good"],
        flag: "GREEN",
      },
      {
        id: "tired",
        label: "Overwhelmed",
        transcript: "I haven't slept well for three nights and keep feeling anxious for no clear reason.",
        mood: 2,
        tags: ["EPDS check recommended", "Psychologist support"],
        flag: "PSYCH_RISK",
      },
    ],
    privacyTitle: "Privacy & Strict EHR Separation Guarantee",
    privacyPoints: [
      "Psychologists can never view hospital discharge diagnoses, JSHSHIR, or blood test results.",
      "You control wellbeing sharing via an explicit opt-in consent toggle and can revoke anytime.",
      "Only an EPDS Q10 self-harm alert triggers a 1-hour 103 SLA escalation to protect safety.",
    ],
    tgTitle: "Connect via Telegram Bot & Mini App",
    tgSub:
      "Receive gentle 09:00 morning mood check-ins, 10-minute medication reminders, and 1-tap Mini App portal access.",
    tgCopy: "Copy Invite Link",
    tgCopied: "Copied ✓",
    tgOpen: "Open Telegram Bot",
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        q: "Is the community and daily wellbeing check-in free?",
        a: "Yes. Daily mood tracking, weekly EPDS screening, Telegram medication reminders, and peer circles are free for mothers.",
      },
      {
        q: "Can psychologists read my clinical hospital records?",
        a: "No. Server-side RBAC keeps hospital EHR records and lab panels strictly separated from psychological wellbeing notes.",
      },
      {
        q: "Can I withdraw psychologist consent later?",
        a: "Yes. One tap in your Patient Portal under «Psixolog» immediately stops sharing.",
      },
    ],
  },
};

const AUDIO_CIRCLES = [
  {
    id: "circle-thu",
    dayUz: "Payshanba • 19:00 (Toshkent)",
    dayRu: "Четверг • 19:00 (Ташкент)",
    dayEn: "Thursday • 19:00 (Tashkent)",
    titleUz: "Ilk 40 kun: uyqusizlik va xavotir bilan kelishish",
    titleRu: "Первые 40 дней: как справляться с бессонницей и тревогой",
    titleEn: "First 40 days: coping with sleeplessness & anxiety",
    host: "Perinatal psixolog • Audio (kamerasiz)",
  },
  {
    id: "circle-sat",
    dayUz: "Shanba • 11:00 (Toshkent)",
    dayRu: "Суббота • 11:00 (Ташкент)",
    dayEn: "Saturday • 11:00 (Tashkent)",
    titleUz: "Emizish, charchoq va yaqinlaringizdan yordam so'rash",
    titleRu: "Грудное вскармливание, усталость и поддержка семьи",
    titleEn: "Breastfeeding, fatigue & asking family for support",
    host: "OnaCare oilaviy shifokor + onalar davrasi",
  },
];

export default function CommunityPage() {
  const { lang } = useLanguage();
  const { authUser } = usePlatform();
  const t = COMMUNITY_COPY[lang] || COMMUNITY_COPY.uz;
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "OnaCarePatronajBot";
  const tgInviteUrl = `https://t.me/${botUsername}?start=community`;

  const [overview, setOverview] = useState(null);
  const [rsvpedCircles, setRsvpedCircles] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState("calm");
  const [copiedTg, setCopiedTg] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/community/overview", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json) setOverview(json);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const toggleRsvp = (id) => {
    setRsvpedCircles((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const activeSample =
    t.voiceSamples.find((s) => s.id === selectedSampleId) || t.voiceSamples[0];
  const sampleMood = MOOD_SCALE.find((m) => m.value === activeSample.mood) || MOOD_SCALE[2];

  const handleCopyTg = async () => {
    try {
      await navigator.clipboard.writeText(tgInviteUrl);
      setCopiedTg(true);
      setTimeout(() => setCopiedTg(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8F7] dark:bg-[#091315] text-slate-900 dark:text-slate-100">
      <PublicHeader />

      <main className="flex-1">
        {/* Emergency 103 top bar */}
        <div className="border-b border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40">
          <div className="mx-auto flex max-w-7xl flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-8 py-3 text-sm text-rose-800 dark:text-rose-200">
            <p className="font-medium leading-snug">{t.emergencyBanner}</p>
            <a
              href="tel:103"
              className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-rose-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-rose-800 transition-colors"
            >
              <IconPhoneCall className="h-4 w-4" />
              103
            </a>
          </div>
        </div>

        {/* Hero */}
        <section className="border-b border-[#D7E4E1] dark:border-[#1E353A] py-12 sm:py-20 bg-linear-to-b from-white via-[#F4F8F7] to-[#EDF5F3] dark:from-[#101E21] dark:via-[#091315] dark:to-[#091315]">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start oc-fade-up">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-teal-700 dark:text-teal-300">
                {t.eyebrow}
              </span>
              <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                {t.heroTitle}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {t.heroDesc}
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href={authUser?.role === "PATIENT" ? "/patient#psychologist-support" : "/signup?role=PATIENT"}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-6 py-3 text-sm font-semibold text-white active:scale-[0.98] transition-all shadow-sm"
                >
                  <IconHeartHandshake className="h-5 w-5" />
                  <span>{t.primaryCta}</span>
                  <IconArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/signup?role=PSYCHOLOGIST"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-6 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:border-teal-600 transition-colors"
                >
                  <span>{t.psychCta}</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <div className="med-card p-5 flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t.metricsMothers}</span>
                <span className="font-heading text-3xl font-bold text-teal-700 dark:text-teal-300 tabular-nums">
                  {overview?.totalVerifiedMothers ?? 0}
                </span>
              </div>
              <div className="med-card p-5 flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t.metricsSessions}</span>
                <span className="font-heading text-3xl font-bold text-teal-700 dark:text-teal-300 tabular-nums">
                  {overview?.totalCompletedOrBookedSessions ?? 0}
                </span>
              </div>
              <div className="med-card p-5 flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t.metricsSpecialists}</span>
                <span className="font-heading text-3xl font-bold text-teal-700 dark:text-teal-300 tabular-nums">
                  {overview?.specialists?.length ?? 0}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Newborn Age Cohorts */}
        <section className="border-b border-[#D7E4E1] dark:border-[#1E353A] py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5 text-slate-900 dark:text-white">
                <IconUsersGroup className="h-6 w-6 text-teal-700 dark:text-teal-300" />
                <span>{t.cohortsTitle}</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{t.cohortsSub}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.cohorts.map((cohort) => {
                const count = overview?.cohorts?.[cohort.key] ?? 0;
                return (
                  <div
                    key={cohort.key}
                    className="med-card med-card-interactive p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <span className="inline-block rounded-full bg-[#EDF5F3] dark:bg-[#16272B] px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
                        {cohort.label}
                      </span>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {cohort.desc}
                      </p>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-[#D7E4E1] dark:border-[#1E353A] pt-3">
                      <span className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                        {count} {t.mothersWord}
                      </span>
                      <Link
                        href="/signup?role=PATIENT"
                        className="inline-flex min-h-[36px] items-center px-2 text-sm font-semibold text-teal-700 dark:text-teal-300 hover:underline"
                      >
                        →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Audio Circles + Interactive Voice Check-in Preview */}
        <section className="border-b border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#101E21]/60 py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-1.5">
                <h2 className="font-heading text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <IconHeadphones className="h-6 w-6 text-teal-700 dark:text-teal-300" />
                  <span>{t.circlesTitle}</span>
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{t.circlesSub}</p>
              </div>
              <div className="space-y-3">
                {AUDIO_CIRCLES.map((circle) => {
                  const reserved = rsvpedCircles.includes(circle.id);
                  const title =
                    lang === "ru" ? circle.titleRu : lang === "en" ? circle.titleEn : circle.titleUz;
                  const day = lang === "ru" ? circle.dayRu : lang === "en" ? circle.dayEn : circle.dayUz;
                  return (
                    <div
                      key={circle.id}
                      className="med-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                          <IconCalendarEvent className="h-4 w-4" />
                          <span>{day}</span>
                        </p>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{circle.host}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleRsvp(circle.id)}
                        className={`min-h-[44px] shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-[0.98] ${
                          reserved
                            ? "bg-[#EDF5F3] dark:bg-[#16272B] border border-teal-600 text-teal-700 dark:text-teal-300"
                            : "bg-teal-700 dark:bg-teal-600 text-white hover:bg-teal-800"
                        }`}
                      >
                        {reserved ? t.rsvpedBtn : t.rsvpBtn}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-6 med-card p-6 space-y-4">
              <div className="space-y-1.5">
                <h2 className="font-heading text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <IconMicrophone className="h-5 w-5 text-teal-700 dark:text-teal-300" />
                  <span>{t.voicePreviewTitle}</span>
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{t.voicePreviewSub}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {t.voiceSamples.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => setSelectedSampleId(sample.id)}
                    className={`min-h-[42px] rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                      activeSample.id === sample.id
                        ? "border-teal-700 bg-teal-700 text-white"
                        : "border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] text-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] p-4 space-y-3">
                <p className="italic text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                  &ldquo;{activeSample.transcript}&rdquo;
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-[#D7E4E1] dark:border-[#1E353A]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-[#101E21] border border-[#D7E4E1] dark:border-[#1E353A] px-3 py-1 text-xs font-semibold">
                    <span>{sampleMood.emoji}</span>
                    <span>
                      {sampleMood.value}/5 ({lang === "ru" ? sampleMood.ru : lang === "en" ? sampleMood.en : sampleMood.uz})
                    </span>
                  </span>
                  {activeSample.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                        activeSample.flag === "PSYCH_RISK"
                          ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200 border-rose-200 dark:border-rose-800"
                          : "bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-800"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Verified Specialists Directory */}
        <section className="border-b border-[#D7E4E1] dark:border-[#1E353A] py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <IconStethoscope className="h-6 w-6 text-teal-700 dark:text-teal-300" />
                <span>{t.specialistsTitle}</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{t.specialistsSub}</p>
            </div>

            {!overview?.specialists || overview.specialists.length === 0 ? (
              <div className="med-card p-6 text-sm text-slate-600 dark:text-slate-300">
                {t.specialistsEmpty}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overview.specialists.map((spec) => (
                  <div
                    key={spec.id}
                    className="med-card med-card-interactive p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-[#EDF5F3] dark:bg-[#16272B] px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
                          {spec.role === "PSYCHOLOGIST" ? "PSYCHOLOGIST" : "FAMILY_MD"}
                        </span>
                        {typeof spec.experienceYears === "number" && (
                          <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                            {spec.experienceYears} {t.expWord}
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                        {spec.fullName}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {[spec.specialty, spec.expertiseArea, spec.district].filter(Boolean).join(" • ")}
                      </p>
                      {spec.bioSummary && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                          {spec.bioSummary}
                        </p>
                      )}
                    </div>
                    <Link
                      href={authUser?.role === "PATIENT" ? "/patient#psychologist-support" : "/signup?role=PATIENT"}
                      className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-teal-700 dark:text-teal-300 hover:underline underline-offset-4"
                    >
                      <span>{t.bookConsult}</span>
                      <IconArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Privacy Guarantee + Telegram Invite + FAQ */}
        <section className="py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-6">
              <div className="med-card p-6 space-y-4">
                <h2 className="font-heading text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <IconLock className="h-5 w-5 text-teal-700 dark:text-teal-300" />
                  <span>{t.privacyTitle}</span>
                </h2>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {t.privacyPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <IconShieldCheck className="h-5 w-5 text-teal-700 dark:text-teal-300 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="med-card p-6 space-y-4">
                <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">{t.faqTitle}</h2>
                <div className="divide-y divide-[#D7E4E1] dark:divide-[#1E353A]">
                  {t.faqs.map((item, idx) => (
                    <div key={idx} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.q}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-[#EDF5F3] dark:bg-[#101E21] p-6 space-y-5 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-xs">
                    <IconBrandTelegram className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">{t.tgTitle}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t.tgSub}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] p-4">
                  {/* Minimal geometric QR badge */}
                  <div
                    className="h-24 w-24 shrink-0 rounded-xl border border-[#D7E4E1] bg-[#F4F8F7] p-2 flex items-center justify-center"
                    aria-label="Telegram QR preview"
                  >
                    <svg viewBox="0 0 24 24" className="h-full w-full text-teal-700" fill="currentColor">
                      <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h2v2h-2v-2zm4 0h4v2h-4v-2zm-4 4h4v2h-4v-2zm2 4h6v-4h-2v2h-4v2zm4-6h2v2h-2v-2z" />
                    </svg>
                  </div>
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <IconBell className="h-4 w-4 text-teal-700 dark:text-teal-300 shrink-0" />
                      <span className="font-mono truncate">{tgInviteUrl}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                      <a
                        href={tgInviteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                      >
                        <IconBrandTelegram className="h-4 w-4" />
                        <span>{t.tgOpen}</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyTg}
                        className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#101E21] px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-teal-600 transition-colors"
                      >
                        {copiedTg ? <IconCheck className="h-4 w-4 text-teal-700" /> : <IconCopy className="h-4 w-4" />}
                        <span>{copiedTg ? t.tgCopied : t.tgCopy}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
