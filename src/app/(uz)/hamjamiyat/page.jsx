"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconArrowRight,
  IconBell,
  IconBrandTelegram,
  IconBrandYoutube,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconHeart,
  IconHeartFilled,
  IconHeartHandshake,
  IconLock,
  IconMessageCircle,
  IconMicrophone,
  IconPhoneCall,
  IconPlayerPlay,
  IconPlus,
  IconSend,
  IconShieldCheck,
  IconStethoscope,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePlatform } from "@/context/PlatformContext";
import { PublicHeader } from "@/components/PublicHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MotherEventsPanel } from "@/components/MotherEventsPanel";
import { BABY_CARE_LESSONS, getYoutubeThumbnailUrl } from "@/lib/baby-care-lessons";
import { MOOD_SCALE } from "@/lib/wellbeing-catalog";

const STAFF_ROLES = new Set(["OVABMU_MD", "FAMILY_MD", "ADMIN_RECEPTION", "PSYCHOLOGIST"]);

const COMMUNITY_COPY = {
  uz: {
    eyebrow: "Onalar hamjamiyati va perinatal ruhiy ko'mak",
    heroTitle: "Tug'ruqdan keyin siz yolg'iz emassiz.",
    heroDesc:
      "Yangi onalar uchun yoshga mos jonli davralar, o'zaro muloqot forumi, Onalik darslari video qo'llanmalari, kunlik kayfiyat tekshiruvi (EPDS) va perinatal psixolog ko'magi.",
    primaryCta: "Kabinetda psixologga yozilish",
    joinSignupCta: "Onalar hamjamiyatiga qo'shilish",
    psychCta: "Psixolog sifatida qo'shilish",
    emergencyBanner:
      "Shoshilinch jismoniy yoki ruhiy holatlarda (kuchli qon ketish, yuqori isitma, o'ziga zarar yetkazish fikri) darhol 103 ga qo'ng'iroq qiling.",
    metricsMothers: "Ro'yxatdan o'tgan onalar",
    metricsSessions: "Band qilingan psixolog seanslari",
    metricsSpecialists: "Tasdiqlangan mutaxassislar",
    metricsEvents: "Faol va kutilayotgan tadbirlar",
    cohortsTitle: "Chaqaloq yoshiga ko'ra onalar davralari",
    cohortsSub:
      "Guruhni tanlang — pastdagi Onalar muloqoti o'sha davr savol-javoblariga avtomatik filtrlanadi.",
    cohorts: [
      { key: "d0_30", label: "0–30 kunlik davr", desc: "Chaqaloq bilan ilk kunlar, emizish va tiklanish" },
      { key: "m1_3", label: "1–3 oylik davr", desc: "Uyqu ritmi, kolika va kundalik parvarish" },
      { key: "m3_6", label: "3–6 oylik davr", desc: "Chaqaloq o'sishi, charchoqni yengish va qo'llab-quvvatlash" },
      { key: "m6_12", label: "6–12 oylik davr", desc: "Qo'shimcha ovqat, onaning o'ziga vaqt ajratishi" },
    ],
    mothersWord: "ona",
    openCohortFeed: "Muloqotni ko'rish",
    forumTitle: "Onalar davrasi muloqoti va savol-javob",
    forumSub:
      "Tajriba almashing, savol bering va oilaviy shifokorlar hamda psixologlardan iliq javob oling. Istasangiz anonim yozishingiz mumkin.",
    forumAll: "Barcha davrlar",
    forumNewBtn: "Savol yoki tajriba yozish",
    forumSignInHint: "Savol yozish, javob qoldirish va qo'llab-quvvatlash tugmasini bosish uchun tizimga kiring.",
    forumSignInBtn: "Kirish / Ro'yxatdan o'tish",
    forumTitlePh: "Mavzu sarlavhasi (masalan: Kechasi emizish tartibi haqida)...",
    forumBodyPh: "Fikringiz, tajribangiz yoki savolingizni yozing...",
    forumAnonLabel: "Anonim ona sifatida joylash (ismim ko'rinmasin)",
    forumSubmitBtn: "Hamjamiyatga joylash",
    forumPosting: "Joylanmoqda...",
    forumReplyPh: "Iliq javob yoki maslahat yozing...",
    forumReplyBtn: "Javob berish",
    forumEmpty: "Bu davr bo'yicha hali postlar yo'q — birinchi bo'lib suhbat boshlang!",
    topicLabels: {
      FEEDING: "Emizish",
      SLEEP: "Uyqu",
      RECOVERY: "Tiklanish",
      MENTAL_HEALTH: "Ruhiy holat",
      BABY_CARE: "Chaqaloq parvarishi",
    },
    lessonsStripTitle: "Onalik darslari — Mashhur video qo'llanmalar",
    lessonsStripSub:
      "Emizish, cho'miltirish va xavfsiz uyqu bo'yicha ishonchli YouTube video darslari.",
    lessonsOpenPortal: "Barcha 19 ta darsni ochish",
    voicePreviewTitle: "Ovozli kunlik check-in namunasi (Interaktiv ko'rik)",
    voicePreviewSub:
      "Ona ovoz orqali holatini aytganda tizim kayfiyat bali (1–5) va shoshilinch belgilarni qanday ajratishini sinab ko'ring.",
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
    specialistsTitle: "Tasdiqlangan perinatal psixologlar va oilaviy shifokorlar",
    specialistsSub:
      "Psixologlar faqat sizning aniq roziligingiz (PsychConsent) bilan kayfiyat va EPDS natijalarini ko'radi. Tibbiy EHR tahlillari alohida saqlanadi.",
    specialistsEmpty: "Mutaxassislar jamoasi tasdiqlash jarayonida — ro'yxat tez orada to'ldiriladi.",
    expWord: "yil tajriba",
    bookConsult: "Psixolog seanslariga o'tish",
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
        q: "Onalar hamjamiyati, tadbirlar va Onalik darslari bepulmi?",
        a: "Ha. Kundalik kayfiyat tekshiruvi, haftalik EPDS skrining, Telegram dori eslatmalari, Onalik darslari va onalar tadbirlari barcha ro'yxatdan o'tgan onalar uchun bepul.",
      },
      {
        q: "Psixolog mening shifoxona tahlillarimni ko'ra oladimi?",
        a: "Yo'q. Tizimda tibbiy EHR (EhrRecord, LabReport) va psixologik yozuvlar (PsychNote, PsychConsent) qat'iy ajratilgan.",
      },
      {
        q: "Rozilikni keyinroq bekor qilsam bo'ladimi?",
        a: "Ha, istalgan payt Bemor kabinetidagi «Psixolog seanslari» bo'limida 1 bosish bilan rozilikni bekor qilishingiz mumkin.",
      },
    ],
  },
  ru: {
    eyebrow: "Сообщество мам и перинатальная поддержка",
    heroTitle: "После родов вы не остаетесь один на один.",
    heroDesc:
      "Бережные круги по возрасту малыша, открытый форум мам, видеоуроки «Onalik darslari», ежедневный чек-ин EPDS и сеансы с проверенными психологами.",
    primaryCta: "Перейти к сеансам психолога",
    joinSignupCta: "Присоединиться к сообществу",
    psychCta: "Для психологов",
    emergencyBanner:
      "При угрожающих физических или кризисных состояниях (сильное кровотечение, высокая температура, мысли о самоповреждении) немедленно звоните 103.",
    metricsMothers: "Зарегистрированных мам",
    metricsSessions: "Забронированных сеансов",
    metricsSpecialists: "Проверенных специалистов",
    metricsEvents: "Активных и скорых событий",
    cohortsTitle: "Группы мам по возрасту малыша",
    cohortsSub: "Выберите этап — форум ниже сразу отфильтрует обсуждения мам того же возраста.",
    cohorts: [
      { key: "d0_30", label: "0–30 дней", desc: "Первые недели после роддома, ГВ и восстановление" },
      { key: "m1_3", label: "1–3 месяца", desc: "Режим сна, колики и адаптация семьи" },
      { key: "m3_6", label: "3–6 месяцев", desc: "Развитие малыша, профилактика выгорания" },
      { key: "m6_12", label: "6–12 месяцев", desc: "Прикорм и возвращение ресурса мамы" },
    ],
    mothersWord: "мам",
    openCohortFeed: "Открыть обсуждения",
    forumTitle: "Форум сообщества мам и ответы специалистов",
    forumSub:
      "Делитесь опытом, задавайте вопросы и получайте поддержку от мам и проверенных врачей. Мамы могут публиковать анонимно.",
    forumAll: "Все этапы",
    forumNewBtn: "Задать вопрос или поделиться",
    forumSignInHint: "Войдите в аккаунт, чтобы создавать посты, отвечать и поддерживать других мам.",
    forumSignInBtn: "Войти / Регистрация",
    forumTitlePh: "Заголовок вопроса или темы...",
    forumBodyPh: "Опишите ваш вопрос или опыт...",
    forumAnonLabel: "Опубликовать анонимно («Анонимная мама»)",
    forumSubmitBtn: "Опубликовать в сообществе",
    forumPosting: "Публикация...",
    forumReplyPh: "Написать бережный ответ...",
    forumReplyBtn: "Ответить",
    forumEmpty: "Пока нет постов в этой группе — станьте первой!",
    topicLabels: {
      FEEDING: "Кормление",
      SLEEP: "Сон",
      RECOVERY: "Восстановление",
      MENTAL_HEALTH: "Эмоции",
      BABY_CARE: "Уход за малышом",
    },
    lessonsStripTitle: "Onalik darslari — Популярные видеоуроки",
    lessonsStripSub: "Подборка проверенных видео по уходу за новорожденным с YouTube.",
    lessonsOpenPortal: "Открыть все 19 уроков",
    voicePreviewTitle: "Демо голосового чек-ина (Интерактивный предпросмотр)",
    voicePreviewSub:
      "Посмотрите, как голосовой ответ мамы превращается в шкалу настроения (1–5) и сигналы заботы.",
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
    specialistsTitle: "Проверенные перинатальные психологи и семейные врачи",
    specialistsSub:
      "Психолог видит отметки настроения и EPDS только после вашего явного согласия (PsychConsent). Клинические анализы и диагнозы EHR изолированы.",
    specialistsEmpty: "Специалисты проходят верификацию — список обновляется в реальном времени.",
    expWord: "лет стажа",
    bookConsult: "Перейти в сеансы психолога",
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
        q: "Бесплатны ли сообщество, мероприятия и видеоуроки?",
        a: "Да. Ежедневный трекер настроения, еженедельный EPDS, напоминания о лекарствах, уроки и круги бесплатны для всех мам.",
      },
      {
        q: "Видит ли психолог мои больничные анализы?",
        a: "Нет. Клинические записи (EhrRecord, LabReport) и заметки психолога (PsychNote) строго разделены на уровне сервера.",
      },
      {
        q: "Можно ли отозвать согласие?",
        a: "Да, в любое время в разделе «Сеансы психолога» вашего личного кабинета.",
      },
    ],
  },
  en: {
    eyebrow: "Mothers Community & Perinatal Mental Wellbeing",
    heroTitle: "You never have to navigate postpartum alone.",
    heroDesc:
      "Age-matched newborn circles, interactive mothers discussion board, curated YouTube baby-care lessons, EPDS wellbeing tracking, and private perinatal psychology sessions.",
    primaryCta: "Open Psych Sessions",
    joinSignupCta: "Join the Mothers Community",
    psychCta: "Join as a Psychologist",
    emergencyBanner:
      "For urgent medical or mental health emergencies (heavy bleeding, high fever, thoughts of self-harm), call 103 immediately.",
    metricsMothers: "Verified Mothers",
    metricsSessions: "Booked Psych Sessions",
    metricsSpecialists: "Verified Specialists",
    metricsEvents: "Active & Upcoming Events",
    cohortsTitle: "Live Newborn Age Circles",
    cohortsSub: "Tap any baby stage to jump straight to discussions from mothers in that exact cohort.",
    cohorts: [
      { key: "d0_30", label: "0–30 Days", desc: "First weeks home, feeding rhythm & physical recovery" },
      { key: "m1_3", label: "1–3 Months", desc: "Sleep shifts, soothing & emotional adjustment" },
      { key: "m3_6", label: "3–6 Months", desc: "Growth milestones, maternal rest & burnout prevention" },
      { key: "m6_12", label: "6–12 Months", desc: "First solids, returning to routines & community" },
    ],
    mothersWord: "mothers",
    openCohortFeed: "Open circle feed",
    forumTitle: "Mothers Discussion Circle & Specialist Q&A",
    forumSub:
      "Share experiences, ask everyday newborn questions, and get supportive answers from mothers and verified doctors/psychologists.",
    forumAll: "All Stages",
    forumNewBtn: "Start a Discussion",
    forumSignInHint: "Sign in to post questions, reply to other mothers, and send supportive likes.",
    forumSignInBtn: "Sign In / Sign Up",
    forumTitlePh: "Topic title (e.g. Nighttime feeding rhythm)...",
    forumBodyPh: "Share your question or experience with the circle...",
    forumAnonLabel: "Post anonymously as \"Anonim ona\" (hide my name)",
    forumSubmitBtn: "Post to Circle",
    forumPosting: "Posting...",
    forumReplyPh: "Write a supportive reply...",
    forumReplyBtn: "Reply",
    forumEmpty: "No discussions in this cohort yet — start the conversation!",
    topicLabels: {
      FEEDING: "Feeding",
      SLEEP: "Sleep",
      RECOVERY: "Recovery",
      MENTAL_HEALTH: "Wellbeing",
      BABY_CARE: "Baby Care",
    },
    lessonsStripTitle: "Onalik Darslari — Featured Baby Care Videos",
    lessonsStripSub: "Popular pediatrician-approved YouTube guides on feeding, bathing & safe sleep.",
    lessonsOpenPortal: "Explore All 19 Lessons",
    voicePreviewTitle: "Voice Check-in Preview (Interactive Demo)",
    voicePreviewSub:
      "Preview how spoken daily check-ins map to a 1–5 mood score and supportive follow-up prompts.",
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
    specialistsTitle: "Verified Perinatal Psychologists & Family Doctors",
    specialistsSub:
      "Psychologists only view wellbeing & EPDS trends with your explicit PsychConsent. Clinical EHR lab results remain strictly separated.",
    specialistsEmpty: "Verified specialists will appear here as soon as coordinator onboarding completes.",
    expWord: "yrs exp",
    bookConsult: "Manage Consent & Sessions",
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
        q: "Are the community, mother events, and baby care lessons free?",
        a: "Yes. Daily mood tracking, weekly EPDS screening, Telegram medication reminders, video lessons, and community events are free.",
      },
      {
        q: "Can psychologists read my clinical hospital records?",
        a: "No. Server-side RBAC keeps hospital EHR records and lab panels strictly separated from psychological wellbeing notes.",
      },
      {
        q: "Can I withdraw psychologist consent later?",
        a: "Yes. One tap in your Patient Portal under «Psych Sessions» immediately stops sharing.",
      },
    ],
  },
};

const FEATURED_LESSON_IDS = [
  "yt-99EkOBIbVGs",
  "yt-D-Mzghc1uF8",
  "yt-5N2WRjkGmbY",
  "yt-U_B13ZyyeVI",
];

function getRoleBadgeMeta(role) {
  if (role === "PSYCHOLOGIST") return { label: "Perinatal Psixolog", cls: "bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800" };
  if (role === "FAMILY_MD" || role === "OVABMU_MD") return { label: "Tasdiqlangan Shifokor", cls: "bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-800" };
  if (role === "ADMIN_RECEPTION") return { label: "Koordinator", cls: "bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-800" };
  return null;
}

export default function CommunityPage() {
  const { lang } = useLanguage();
  const { authUser, fetchWithAuth, showToast } = usePlatform();
  const t = COMMUNITY_COPY[lang] || COMMUNITY_COPY.uz;
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "OnaCarePatronajBot";
  const tgInviteUrl = `https://t.me/${botUsername}?start=community`;

  const [overview, setOverview] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [rsvpBusyId, setRsvpBusyId] = useState(null);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [cohortFilter, setCohortFilter] = useState("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postCohort, setPostCohort] = useState("d0_30");
  const [postTopic, setPostTopic] = useState("BABY_CARE");
  const [postAnonymous, setPostAnonymous] = useState(false);
  const [postingBusy, setPostingBusy] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyBusyId, setReplyBusyId] = useState(null);
  const [likeBusyId, setLikeBusyId] = useState(null);

  const [selectedSampleId, setSelectedSampleId] = useState("calm");
  const [copiedTg, setCopiedTg] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/community/events", { cache: "no-store", credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setEvents(json.events || []);
      }
    } catch {
      // ignore fetch error
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const loadPosts = useCallback(async (cohort = "all") => {
    setPostsLoading(true);
    try {
      const res = await fetch(`/api/community/posts?cohort=${encodeURIComponent(cohort)}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setPosts(json.posts || []);
      }
    } catch {
      // ignore fetch error
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/community/overview", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json) setOverview(json);
      })
      .catch(() => {});

    fetch("/api/community/events", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json) setEvents(json.events || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setEventsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`/api/community/posts?cohort=${encodeURIComponent(cohortFilter)}`, {
      cache: "no-store",
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json) setPosts(json.posts || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setPostsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [cohortFilter]);

  const handleRsvp = async (eventId, status) => {
    setRsvpBusyId(eventId);
    try {
      const res = await fetchWithAuth("/api/community/events", {
        method: "POST",
        body: JSON.stringify({ action: "TOGGLE_RSVP", eventId, status }),
      });
      if (res.ok) {
        await loadEvents();
        showToast("success", "✓");
      }
    } finally {
      setRsvpBusyId(null);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) return;
    setPostingBusy(true);
    try {
      const res = await fetchWithAuth("/api/community/posts", {
        method: "POST",
        body: JSON.stringify({
          action: "CREATE_POST",
          cohortKey: postCohort,
          topicTag: postTopic,
          title: postTitle.trim(),
          body: postBody.trim(),
          isAnonymous: postAnonymous,
        }),
      });
      if (res.ok) {
        setPostTitle("");
        setPostBody("");
        setComposerOpen(false);
        await loadPosts(cohortFilter);
        showToast("success", "✓");
      } else {
        const err = await res.json().catch(() => ({}));
        showToast("error", err.error || "Could not create post");
      }
    } finally {
      setPostingBusy(false);
    }
  };

  const handleAddReply = async (e, postId) => {
    e.preventDefault();
    const text = String(replyDrafts[postId] || "").trim();
    if (!text) return;
    setReplyBusyId(postId);
    try {
      const res = await fetchWithAuth("/api/community/posts", {
        method: "POST",
        body: JSON.stringify({
          action: "ADD_REPLY",
          postId,
          body: text,
        }),
      });
      if (res.ok) {
        setReplyDrafts((prev) => ({ ...prev, [postId]: "" }));
        await loadPosts(cohortFilter);
      }
    } finally {
      setReplyBusyId(null);
    }
  };

  const handleToggleLike = async (postId) => {
    if (!authUser) {
      showToast("info", t.forumSignInHint);
      return;
    }
    setLikeBusyId(postId);
    try {
      const res = await fetchWithAuth("/api/community/posts", {
        method: "POST",
        body: JSON.stringify({ action: "LIKE_POST", postId }),
      });
      if (res.ok) {
        const json = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likesCount: json.likesCount, likedByMe: json.likedByMe }
              : p
          )
        );
      }
    } finally {
      setLikeBusyId(null);
    }
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

  const featuredLessons = BABY_CARE_LESSONS.filter((l) => FEATURED_LESSON_IDS.includes(l.id));
  const lessonsPortalHref =
    authUser?.role === "PATIENT" ? "/patient?tab=lessons" : "/signup?role=PATIENT";
  const psychPortalHref =
    authUser?.role === "PATIENT" ? "/patient?tab=psych" : "/signup?role=PATIENT";

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
        <section className="border-b border-[#D7E4E1] dark:border-[#1E353A] py-12 sm:py-18 bg-linear-to-b from-white via-[#F4F8F7] to-[#EDF5F3] dark:from-[#101E21] dark:via-[#091315] dark:to-[#091315]">
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
                  href={psychPortalHref}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-6 py-3 text-sm font-semibold text-white active:scale-[0.98] transition-all shadow-sm"
                >
                  <IconHeartHandshake className="h-5 w-5" />
                  <span>{authUser?.role === "PATIENT" ? t.primaryCta : t.joinSignupCta}</span>
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

            <div className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="med-card p-4 sm:p-5 flex items-baseline justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">{t.metricsMothers}</span>
                <span className="font-heading text-2xl sm:text-3xl font-bold text-teal-700 dark:text-teal-300 tabular-nums">
                  {overview?.totalVerifiedMothers ?? 0}
                </span>
              </div>
              <div className="med-card p-4 sm:p-5 flex items-baseline justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">{t.metricsEvents}</span>
                <span className="font-heading text-2xl sm:text-3xl font-bold text-teal-700 dark:text-teal-300 tabular-nums">
                  {events.length}
                </span>
              </div>
              <div className="med-card p-4 sm:p-5 flex items-baseline justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">{t.metricsSessions}</span>
                <span className="font-heading text-2xl sm:text-3xl font-bold text-teal-700 dark:text-teal-300 tabular-nums">
                  {overview?.totalCompletedOrBookedSessions ?? 0}
                </span>
              </div>
              <div className="med-card p-4 sm:p-5 flex items-baseline justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">{t.metricsSpecialists}</span>
                <span className="font-heading text-2xl sm:text-3xl font-bold text-teal-700 dark:text-teal-300 tabular-nums">
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
                const active = cohortFilter === cohort.key;
                return (
                  <button
                    key={cohort.key}
                    type="button"
                    onClick={() => {
                      setCohortFilter(cohort.key);
                      setPostCohort(cohort.key);
                      document.getElementById("community-forum")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`med-card med-card-interactive p-5 flex flex-col justify-between gap-4 text-left ${
                      active ? "border-teal-600 ring-1 ring-teal-500/40" : ""
                    }`}
                  >
                    <div className="space-y-2">
                      <span className="inline-block rounded-full bg-[#EDF5F3] dark:bg-[#16272B] px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
                        {cohort.label}
                      </span>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {cohort.desc}
                      </p>
                    </div>
                    <div className="w-full flex items-baseline justify-between border-t border-[#D7E4E1] dark:border-[#1E353A] pt-3">
                      <span className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                        {count} {t.mothersWord}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-teal-700 dark:text-teal-300">
                        <span>{t.openCohortFeed}</span>
                        <IconArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Live Mother Events (In Progress, Being Added, Upcoming) */}
        <section className="border-b border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#101E21]/60 py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <MotherEventsPanel
              mode="full"
              events={events}
              loading={eventsLoading}
              onRsvp={handleRsvp}
              rsvpBusyId={rsvpBusyId}
              authUser={authUser}
              canCreateEvent={Boolean(authUser && STAFF_ROLES.has(authUser.role))}
              onEventCreated={loadEvents}
              fetchWithAuth={fetchWithAuth}
            />
          </div>
        </section>

        {/* Interactive Mothers Community Discussions Forum */}
        <section id="community-forum" className="border-b border-[#D7E4E1] dark:border-[#1E353A] py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl space-y-2">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold flex items-center gap-2.5 text-slate-900 dark:text-white">
                  <IconMessageCircle className="h-6 w-6 text-teal-700 dark:text-teal-300" />
                  <span>{t.forumTitle}</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{t.forumSub}</p>
              </div>
              {authUser && (
                <button
                  type="button"
                  onClick={() => setComposerOpen((v) => !v)}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-teal-700 dark:bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 active:scale-[0.98] transition-all"
                >
                  <IconPlus className="h-4 w-4" />
                  <span>{t.forumNewBtn}</span>
                </button>
              )}
            </div>

            {!authUser && (
              <div className="med-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-[#EDF5F3] dark:bg-[#101E21] border-teal-200 dark:border-teal-800">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.forumSignInHint}</p>
                <Link
                  href="/login"
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-teal-700 dark:bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800"
                >
                  {t.forumSignInBtn}
                </Link>
              </div>
            )}

            {/* Cohort Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setCohortFilter("all")}
                className={`min-h-[42px] shrink-0 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all ${
                  cohortFilter === "all"
                    ? "border-teal-700 bg-teal-700 dark:bg-teal-600 text-white"
                    : "border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] text-slate-700 dark:text-slate-200"
                }`}
              >
                {t.forumAll}
              </button>
              {t.cohorts.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCohortFilter(c.key)}
                  className={`min-h-[42px] shrink-0 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all ${
                    cohortFilter === c.key
                      ? "border-teal-700 bg-teal-700 dark:bg-teal-600 text-white"
                      : "border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Post Composer */}
            {composerOpen && authUser && (
              <form
                onSubmit={handleCreatePost}
                className="med-card border-teal-300 dark:border-teal-700 p-5 space-y-4 oc-slide-down"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={postCohort}
                    onChange={(e) => setPostCohort(e.target.value)}
                    className="min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
                  >
                    <option value="all">{t.forumAll}</option>
                    {t.cohorts.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={postTopic}
                    onChange={(e) => setPostTopic(e.target.value)}
                    className="min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
                  >
                    {Object.entries(t.topicLabels).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder={t.forumTitlePh}
                  className="min-h-[46px] w-full rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
                />
                <textarea
                  rows={3}
                  required
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  placeholder={t.forumBodyPh}
                  className="w-full rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {authUser.role === "PATIENT" ? (
                    <label className="inline-flex min-h-[42px] items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postAnonymous}
                        onChange={(e) => setPostAnonymous(e.target.checked)}
                        className="h-4 w-4 accent-teal-700"
                      />
                      <span>{t.forumAnonLabel}</span>
                    </label>
                  ) : (
                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                      {authUser.fullName}
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={postingBusy}
                    className="min-h-[46px] rounded-xl bg-teal-700 dark:bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50"
                  >
                    {postingBusy ? t.forumPosting : t.forumSubmitBtn}
                  </button>
                </div>
              </form>
            )}

            {/* Posts Feed */}
            {postsLoading ? (
              <div className="med-card p-6 text-sm text-slate-500 dark:text-slate-400">...</div>
            ) : posts.length === 0 ? (
              <div className="med-card p-6 text-sm text-slate-600 dark:text-slate-300">{t.forumEmpty}</div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const roleBadge = getRoleBadgeMeta(post.authorRole);
                  const cohortObj = t.cohorts.find((c) => c.key === post.cohortKey);
                  return (
                    <article key={post.id} className="med-card p-5 space-y-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {post.authorDisplayName}
                          </span>
                          {roleBadge && (
                            <span className={`rounded-full border px-2.5 py-0.5 font-semibold ${roleBadge.cls}`}>
                              {roleBadge.label}
                            </span>
                          )}
                          <span className="rounded-full bg-[#EDF5F3] dark:bg-[#16272B] px-2.5 py-0.5 font-semibold text-teal-800 dark:text-teal-200">
                            {t.topicLabels[post.topicTag] || post.topicTag}
                          </span>
                          {cohortObj && (
                            <span className="rounded-full border border-[#D7E4E1] dark:border-[#1E353A] px-2.5 py-0.5 text-slate-600 dark:text-slate-300">
                              {cohortObj.label}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={likeBusyId === post.id}
                          onClick={() => handleToggleLike(post.id)}
                          className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all active:scale-95 ${
                            post.likedByMe
                              ? "border-rose-300 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-200"
                              : "border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {post.likedByMe ? (
                            <IconHeartFilled className="h-4 w-4 text-rose-600" />
                          ) : (
                            <IconHeart className="h-4 w-4" />
                          )}
                          <span>{post.likesCount}</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {post.title}
                        </h3>
                        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                          {post.body}
                        </p>
                      </div>

                      {/* Replies */}
                      <div className="pt-3 border-t border-[#D7E4E1] dark:border-[#1E353A] space-y-2.5">
                        {(post.replies || []).map((rep) => {
                          const repBadge = getRoleBadgeMeta(rep.authorRole);
                          return (
                            <div
                              key={rep.id}
                              className="rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] p-3 text-sm space-y-1"
                            >
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {rep.authorDisplayName}
                                </span>
                                {repBadge && (
                                  <span className={`rounded-full border px-2 py-0.5 font-semibold ${repBadge.cls}`}>
                                    {repBadge.label}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{rep.body}</p>
                            </div>
                          );
                        })}

                        {authUser && (
                          <form onSubmit={(e) => handleAddReply(e, post.id)} className="flex gap-2 pt-1">
                            <input
                              type="text"
                              value={replyDrafts[post.id] || ""}
                              onChange={(e) =>
                                setReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              placeholder={t.forumReplyPh}
                              className="flex-1 min-h-[44px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
                            />
                            <button
                              type="submit"
                              disabled={replyBusyId === post.id || !(replyDrafts[post.id] || "").trim()}
                              className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl bg-teal-700 dark:bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50"
                            >
                              <IconSend className="h-4 w-4" />
                              <span className="hidden sm:inline">{t.forumReplyBtn}</span>
                            </button>
                          </form>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Onalik Darslari Featured Strip */}
        <section className="border-b border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#101E21]/60 py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <IconBrandYoutube className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                  <span>{t.lessonsStripTitle}</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{t.lessonsStripSub}</p>
              </div>
              <Link
                href={lessonsPortalHref}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-teal-700 dark:bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800 transition-all"
              >
                <span>{t.lessonsOpenPortal}</span>
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredLessons.map((lesson) => {
                const title =
                  lang === "ru" ? lesson.titleRu : lang === "en" ? lesson.titleEn : lesson.titleUz;
                return (
                  <a
                    key={lesson.id}
                    href={lesson.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="med-card med-card-interactive overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        <Image
                          src={getYoutubeThumbnailUrl(lesson.videoId)}
                          alt={title}
                          width={640}
                          height={360}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                        <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-950/80 px-2.5 py-0.5 text-xs font-bold text-white">
                          {lesson.langBadge}
                        </span>
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-600/95 text-white shadow-md">
                            <IconPlayerPlay className="h-5 w-5 ml-0.5" />
                          </span>
                        </span>
                      </div>
                      <div className="p-4 space-y-1.5">
                        <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">{lesson.channel}</p>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                          {title}
                        </h3>
                      </div>
                    </div>
                    <div className="px-4 pb-3.5 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                      <span>YouTube</span>
                      <IconExternalLink className="h-3.5 w-3.5" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* Interactive Voice Check-in Preview */}
        <section className="border-b border-[#D7E4E1] dark:border-[#1E353A] py-12 sm:py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-8">
            <div className="med-card p-6 space-y-4">
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
                      href={psychPortalHref}
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
