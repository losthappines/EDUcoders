"use client";
import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { IconAlertOctagon, IconBell, IconBrandTelegram, IconCalendarEvent, IconCheck, IconChevronDown, IconChevronUp, IconCircleCheck, IconCrown, IconFlask, IconHeartHandshake, IconHeartbeat, IconKey, IconMapPin, IconMessageCircle, IconPhoneCall, IconPill, IconPlus, IconSend, IconShieldCheck, IconStethoscope, IconUser, IconX, } from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Emergency103Banner } from "@/components/Emergency103Banner";
import { GpsConsentButton } from "@/components/GpsConsentButton";
import { SlaCountdownBadge } from "@/components/SlaCountdownBadge";
import { InfoTooltip } from "@/components/InfoTooltip";
import { VitalsTrendChart } from "@/components/VitalsTrendChart";
import { CONDITION_SEVERITY_OPTIONS, EXTENDED_SYMPTOMS_CATALOG, getSeverityMeta, getSymptomLabel, PRIMARY_RED_FLAG_SYMPTOMS, } from "@/lib/symptoms-catalog";
import { VISIT_DESTINATION_OPTIONS } from "@/lib/geo";
import { PATIENT_PLANS } from "@/lib/subscriptions";
import { computeEpdsScore, EPDS_QUESTIONS, MOOD_SCALE } from "@/lib/wellbeing-catalog";
const COPY = {
    uz: {
        loading: "Shaxsiy kabinet yuklanmoqda...",
        noCall: "Sizda hozircha shifoxonadan chiqish uy tashrifi yo'q, lekin pastda shikoyat yuborishingiz, GPS lokatsiya tanlashingiz va shifokor bilan bog'lanishingiz mumkin.",
        title: "Bemor shaxsiy kabineti",
        subtitle: "Shikoyat yuborish, tez yordam manzili (GPS), shifokor maslahati va obuna",
        doctorTitle: "Sizga biriktirilgan oilaviy shifokor",
        visitWindow: "Rejalashtirilgan tashrif vaqti:",
        visitCodeLabel: "Tasdiqlash kodi",
        visitCodeTip: "Shifokor uyingizga kelganda tashrifni tasdiqlash uchun ushbu 4 xonali kodni ko'rsating.",
        complaintCardTitle: "Shikoyat yuborish va paramedik/shifokor tashrif joyi (GPS)",
        complaintCardSub: "Shikoyatingiz eng yaqin mos shifokorga GPS orqali yuboriladi. Shifokor javob beradi, tanlangan joyga borib ko'radi va tashrifni tasdiqlaydi.",
        complaintCategoryLabel: "Yo'nalish",
        complaintSeverityLabel: "Holat jiddiyligi",
        complaintDestLabel: "Paramedik / shifokor qayerga kelsin?",
        complaintAddrLabel: "Aniq tashrif manzili",
        complaintAddrPlaceholder: "Ko'cha, uy, mo'ljal...",
        complaintDescLabel: "Shikoyatingizni yozing",
        complaintDescPlaceholder: "Masalan: Bosh aylanishi, qon bosimi ko'tarilishi yoki isitma...",
        shareGpsBtn: "Jonli GPS ulashish",
        gpsReady: "GPS koordinata tayyor:",
        complaintSubmitBtn: "Shikoyatni GPS bilan yuborish",
        complaintSubmitting: "Yuborilmoqda...",
        complaintSentOk: "Shikoyat yuborildi va eng yaqin shifokorga biriktirildi!",
        complaintSentErr: "Shikoyatni yuborib bo'lmadi.",
        complaintsListTitle: "Yuborilgan shikoyatlar va tashrif holati",
        matchedDocLabel: "Biriktirilgan shifokor:",
        distanceLabel: "Masofa:",
        expYearsWord: "yil tajriba",
        docReplyLabel: "Shifokor javobi:",
        verifiedBanner: "Shifokor belgilangan joyga kelib tashrifni tasdiqladi",
        chatTitle: "Shifokor bilan to'g'ridan-to'g'ri maslahat chati",
        chatSub: "Web va Telegram bot orqali yozishmalar bir joyda sinxronlanadi",
        chatEmpty: "Hali xabarlar yo'q. Shifokorga savolingizni yozing.",
        chatPlaceholder: "Shifokorga savol yoki holatingiz haqida yozing...",
        chatSendBtn: "Yuborish",
        telegramCta: "Telegram botga ulash",
        subTitle: "Bemor obunalari",
        subSub: "Tezkor GPS biriktirish va 24/7 maslahat uchun reja tanlang",
        subActiveBadge: "Faol obuna",
        subBuyBtn: "Obunani faollashtirish",
        subActiveBtn: "Amaldagi reja ✓",
        subOk: "Obuna muvaffaqiyatli faollashtirildi!",
        guideTitle: "Uyda parvarish qoidalari",
        rulesTitle: "Kunlik tavsiyalar",
        dangerTitle: "Zudlik bilan shifokorga murojaat qiling, agar:",
        checkinTitle: "Kunlik holat tekshiruvi: o'zingizni qanday his qilyapsiz?",
        bpLabel: "Qon bosimi",
        bpTip: "Yuqori va pastki qon bosimi ko'rsatkichi (masalan, 120/80).",
        notesLabel: "Izoh",
        notesPlaceholder: "Holatingiz haqida yozing...",
        moreConditionsTitle: "Qo'shimcha belgilar va kasalliklar ro'yxati",
        moreConditionsToggleShow: "Ro'yxatni ochish",
        moreConditionsToggleHide: "Yopish",
        physicalGroupTitle: "Tug'ruqdan keyingi va jismoniy belgilar",
        illnessGroupTitle: "Kasalliklar va boshqa holatlar",
        selectedCountLabel: "tanlangan",
        customSectionTitle: "O'zingizdagi boshqa holat yoki kasallikni yozing",
        customNameLabel: "Holat yoki kasallik nomi",
        customNamePlaceholder: "Masalan: Allergiya, migren, astma, bel og'rig'i...",
        customSeverityLabel: "Qanchalik jiddiy?",
        customAddBtn: "Qo'shish",
        customRemoveAria: "Ro'yxatdan o'chirish",
        reportedConditionsLabel: "Belgilangan holatlar:",
        checkinSending: "Yuborilmoqda...",
        checkinBtn: "Holatimni yuborish",
        statusNormal: "Yaxshi",
        statusAttention: "E'tibor bering",
        statusUrgent: "Zudlik bilan shifokor",
        rxTitle: "Sizga yozilgan dorilar",
        loggedDoses: "Belgilangan qabullar soni:",
        takenBtn: "Ichdim",
        labsTitle: "Shifoxona tahlillaringiz natijalari",
        labsTip: "Hb — qondagi gemoglobin darajasi; CRP — yallig'lanish belgisi; PLT — trombotsitlar.",
        flagAbnormal: "Me'yordan chetda",
        confirmTitle: "Shifokor tashrifini tasdiqlash",
        confirmedPrefix: "Tashrif tasdiqlandi:",
        otpPlaceholder: "4 xonali kod (masalan:",
        otpBtn: "4 xonali kod bilan tasdiqlash",
        oneTapBtn: "1 bosish: Shifokor keldi ✓",
        confirmErr: "Tashrifni tasdiqlashda xatolik yuz berdi.",
        confirmOk: "Shifokor tashrifi tasdiqlandi! Salomat bo'ling.",
        adherenceOk: "Dori qabul qilinganligi belgilandi.",
        wbTitle: "Kunlik holat check-in (Ona va chaqaloq)",
        wbSub: "Bugungi kayfiyatingiz, og'riq va chaqaloq holatini 30 soniyada belgilang",
        wbMoodLabel: "Bugun o'zingizni qanday his qilyapsiz?",
        wbPainLabel: "Og'riq darajasi:",
        wbBleedingLabel: "Qon ketishi:",
        wbFeverLabel: "Ona harorati 38°C+",
        wbFeedLabel: "Chaqaloq emishi:",
        wbJaundiceLabel: "Teri sarg'ayishi",
        wbBabyTempLabel: "Chaqaloq harorati",
        wbDeliveryLabel: "Tug'ruq sanasi (ixtiyoriy):",
        wbEpdsToggle: "Haftalik EPDS ruhiy holat skriningi (10 savol)",
        wbSubmitBtn: "Kunlik holatni saqlash",
        wbSavedOk: "Kunlik holat saqlandi!",
        wbUrgent103: "Shoshilinch 103 ogohlantirishi yuborildi! Iltimos, darhol 103 ga qo'ng'iroq qiling.",
        wbJumpSymptom: "Tibbiy shikoyat / belgilar bo'limiga o'tish ↓",
        wbSuggestPsych: "Psixolog bilan bepul suhbat boshlash ↓",
        rxReminderLabel: "Telegram eslatma vaqtlari (masalan: 08:00, 20:00)",
        rxSaveReminderBtn: "Vaqtni saqlash",
        rxReminderSavedOk: "Dori eslatma vaqtlari saqlandi!",
        psychTitle: "Psixolog bilan suhbat va seanslar",
        psychSub: "Shifoxona tahlillaringizdan alohida saqlanadigan maxfiy ruhiy qo'llab-quvvatlash",
        psychEmpty: "Hozircha tasdiqlangan psixologlar qo'shilmoqda.",
        psychConsentGrant: "Rozilik berish (PsychConsent)",
        psychConsentWithdraw: "Rozilikni bekor qilish",
        psychBookBtn: "Seans band qilish",
        psychTopicPlaceholder: "Suhbat mavzusi...",
        psychSessionsTitle: "Belgilangan seanslarim",
        psychChatTitle: "Psixolog bilan shaxsiy chat",
        psychChatPlaceholder: "Psixologga yozing...",
        remindersTitle: "Bugungi eslatmalar va jadval",
        remindersMedItem: "Dori vaqtlari:",
        remindersVisitItem: "24 soatlik uy tashrifi:",
        remindersPsychItem: "Psixolog seansi:",
        remindersWbDone: "Bugungi kayfiyat check-in topshirilgan ✓",
        remindersWbTodo: "Bugungi kunlik check-in hali topshirilmagan",
        remindersGoChat: "Shifokor / hamshira bilan chat →",
        remindersEmpty: "Bugun uchun barcha asosiy eslatmalar bajarildi.",
    },
    ru: {
        loading: "Загрузка личного кабинета...",
        noCall: "У вас пока нет выписного визита, но вы можете отправить жалобу с GPS, выбрать место выезда и написать врачу ниже.",
        title: "Личный кабинет пациента",
        subtitle: "Отправка жалобы с GPS, выбор точки приезда, чат с врачом и подписка",
        doctorTitle: "Ваш семейный врач",
        visitWindow: "Ожидаемое время визита:",
        visitCodeLabel: "Код визита",
        visitCodeTip: "Назовите этот 4-значный код врачу или медсестре, когда они придут к вам домой.",
        complaintCardTitle: "Отправить жалобу и выбрать место выезда (GPS)",
        complaintCardSub: "Жалоба по GPS направляется ближайшему профильному врачу. Врач ответит, приедет в выбранную точку и подтвердит осмотр.",
        complaintCategoryLabel: "Категория",
        complaintSeverityLabel: "Серьезность",
        complaintDestLabel: "Куда должен приехать парамедик / врач?",
        complaintAddrLabel: "Точный адрес визита",
        complaintAddrPlaceholder: "Улица, дом, ориентир...",
        complaintDescLabel: "Опишите вашу жалобу",
        complaintDescPlaceholder: "Например: головокружение, высокое давление или температура...",
        shareGpsBtn: "Поделиться GPS",
        gpsReady: "GPS-координаты готовы:",
        complaintSubmitBtn: "Отправить жалобу с GPS",
        complaintSubmitting: "Отправка...",
        complaintSentOk: "Жалоба отправлена и закреплена за ближайшим врачом!",
        complaintSentErr: "Не удалось отправить жалобу.",
        complaintsListTitle: "Мои жалобы и статус визита врача",
        matchedDocLabel: "Назначенный врач:",
        distanceLabel: "Дистанция:",
        expYearsWord: "лет стажа",
        docReplyLabel: "Ответ врача:",
        verifiedBanner: "Врач посетил выбранную точку и подтвердил осмотр",
        chatTitle: "Прямой чат-консультация с врачом",
        chatSub: "Сообщения синхронизируются между сайтом и Telegram-ботом",
        chatEmpty: "Сообщений пока нет. Напишите ваш вопрос врачу.",
        chatPlaceholder: "Напишите врачу вопрос или симптомы...",
        chatSendBtn: "Отправить",
        telegramCta: "Подключить Telegram-бот",
        subTitle: "Подписки пациента",
        subSub: "Выберите тариф для быстрого GPS-подбора и связи 24/7",
        subActiveBadge: "Активная подписка",
        subBuyBtn: "Оформить подписку",
        subActiveBtn: "Текущий тариф ✓",
        subOk: "Подписка успешно активирована!",
        guideTitle: "Правила ухода на дому",
        rulesTitle: "Ежедневные советы",
        dangerTitle: "Срочно обратитесь к врачу, если:",
        checkinTitle: "Ежедневная проверка: расскажите, как вы себя чувствуете",
        bpLabel: "Артериальное давление",
        bpTip: "Верхнее и нижнее давление, например 120/80.",
        notesLabel: "Комментарий",
        notesPlaceholder: "Опишите ваше самочувствие...",
        moreConditionsTitle: "Дополнительные симптомы и заболевания",
        moreConditionsToggleShow: "Развернуть список",
        moreConditionsToggleHide: "Свернуть",
        physicalGroupTitle: "Физические и послеродовые симптомы",
        illnessGroupTitle: "Заболевания и другие состояния",
        selectedCountLabel: "выбрано",
        customSectionTitle: "Указать свое состояние или болезнь",
        customNameLabel: "Название состояния или болезни",
        customNamePlaceholder: "Например: Аллергия, мигрень, астма, боль в спине...",
        customSeverityLabel: "Насколько это серьезно?",
        customAddBtn: "Добавить",
        customRemoveAria: "Удалить из списка",
        reportedConditionsLabel: "Отмеченные состояния:",
        checkinSending: "Отправка...",
        checkinBtn: "Отправить самочувствие",
        statusNormal: "В норме",
        statusAttention: "Требует внимания",
        statusUrgent: "Срочно к врачу",
        rxTitle: "Назначенные лекарства",
        loggedDoses: "Отмечено приемов:",
        takenBtn: "Приняла",
        labsTitle: "Ваши результаты анализов из больницы",
        labsTip: "Hb — уровень гемоглобина; CRP — показатель воспаления; PLT — тромбоциты.",
        flagAbnormal: "Отклонение",
        confirmTitle: "Подтвердить визит врача",
        confirmedPrefix: "Визит подтвержден:",
        otpPlaceholder: "4-значный код (напр.",
        otpBtn: "Подтвердить 4-значным кодом",
        oneTapBtn: "1 клик: Врач посетил ✓",
        confirmErr: "Ошибка при подтверждении визита.",
        confirmOk: "Визит врача подтвержден! Будьте здоровы.",
        adherenceOk: "Прием лекарства отмечен.",
        wbTitle: "Ежедневный чек-ин (Мама и малыш)",
        wbSub: "Отметьте настроение, самочувствие и состояние малыша за 30 секунд",
        wbMoodLabel: "Как вы себя чувствуете сегодня?",
        wbPainLabel: "Уровень боли:",
        wbBleedingLabel: "Выделения:",
        wbFeverLabel: "Температура у мамы 38°C+",
        wbFeedLabel: "Кормление малыша:",
        wbJaundiceLabel: "Желтушность кожи",
        wbBabyTempLabel: "Температура у малыша",
        wbDeliveryLabel: "Дата родов (опц.):",
        wbEpdsToggle: "Еженедельный скрининг EPDS (10 вопросов)",
        wbSubmitBtn: "Сохранить ежедневный чек-ин",
        wbSavedOk: "Ежедневный чек-ин сохранен!",
        wbUrgent103: "Отправлено экстренное оповещение 103! Пожалуйста, немедленно позвоните 103.",
        wbJumpSymptom: "Перейти к медицинским симптомам ↓",
        wbSuggestPsych: "Начать беседу с психологом ↓",
        rxReminderLabel: "Время напоминаний в Telegram (напр. 08:00, 20:00)",
        rxSaveReminderBtn: "Сохранить время",
        rxReminderSavedOk: "Время напоминаний сохранено!",
        psychTitle: "Консультации и сеансы с психологом",
        psychSub: "Приватная психологическая поддержка, изолированная от больничного EHR",
        psychEmpty: "Проверенные психологи скоро появятся в списке.",
        psychConsentGrant: "Дать согласие (PsychConsent)",
        psychConsentWithdraw: "Отозвать согласие",
        psychBookBtn: "Записаться на сеанс",
        psychTopicPlaceholder: "Тема консультации...",
        psychSessionsTitle: "Мои запланированные сеансы",
        psychChatTitle: "Личный чат с психологом",
        psychChatPlaceholder: "Напишите психологу...",
    },
    en: {
        loading: "Loading your portal...",
        noCall: "You have no hospital discharge visit scheduled right now, yet you can submit a complaint with GPS, pick a visit destination, and message a doctor below.",
        title: "Patient Portal",
        subtitle: "Submit complaints with GPS, choose paramedic destination, direct advice & subscription",
        doctorTitle: "Your Assigned Family Doctor",
        visitWindow: "Expected Visit Window:",
        visitCodeLabel: "Visit Code",
        visitCodeTip: "Share this 4-digit confirmation code with your doctor when they arrive at your home.",
        complaintCardTitle: "Submit Complaint & Choose Paramedic / Doctor Visit Location (GPS)",
        complaintCardSub: "Your complaint matches the nearest specialist by GPS. The doctor responds, visits your chosen location, checks your health, and verifies the visit.",
        complaintCategoryLabel: "Category",
        complaintSeverityLabel: "Severity",
        complaintDestLabel: "Where should paramedics / doctor visit?",
        complaintAddrLabel: "Exact Visit Address",
        complaintAddrPlaceholder: "Street, house, landmark...",
        complaintDescLabel: "Describe your complaint",
        complaintDescPlaceholder: "e.g. Dizziness, high blood pressure, or fever...",
        shareGpsBtn: "Share Live GPS",
        gpsReady: "GPS coordinates ready:",
        complaintSubmitBtn: "Submit Complaint with GPS",
        complaintSubmitting: "Submitting...",
        complaintSentOk: "Complaint submitted and matched to nearest doctor!",
        complaintSentErr: "Could not submit complaint.",
        complaintsListTitle: "Submitted Complaints & Doctor Visit Status",
        matchedDocLabel: "Matched Doctor:",
        distanceLabel: "Distance:",
        expYearsWord: "yrs exp",
        docReplyLabel: "Doctor Response:",
        verifiedBanner: "Doctor visited your chosen location and verified check-up",
        chatTitle: "Direct Doctor Advice Chat",
        chatSub: "Synced live across Web Portal and Telegram Bot",
        chatEmpty: "No messages yet. Ask your doctor for advice anytime.",
        chatPlaceholder: "Message your assigned doctor for advice...",
        chatSendBtn: "Send",
        telegramCta: "Open Telegram Bot",
        subTitle: "Patient Subscription Plans",
        subSub: "Upgrade for priority GPS doctor matching and 24/7 advice chat",
        subActiveBadge: "Active Plan",
        subBuyBtn: "Activate Plan",
        subActiveBtn: "Current Plan ✓",
        subOk: "Subscription activated successfully!",
        guideTitle: "Home Care Guide",
        rulesTitle: "Daily Care Tips",
        dangerTitle: "Call your doctor or emergency services right away if:",
        checkinTitle: "Daily check-in: tell us how you feel",
        bpLabel: "Blood Pressure",
        bpTip: "Your blood pressure reading (top/bottom number), e.g. 120/80.",
        notesLabel: "Notes",
        notesPlaceholder: "Tell us how you are feeling today...",
        moreConditionsTitle: "More symptoms, illnesses & conditions",
        moreConditionsToggleShow: "Show list",
        moreConditionsToggleHide: "Collapse",
        physicalGroupTitle: "Physical & recovery symptoms",
        illnessGroupTitle: "Illnesses & other health conditions",
        selectedCountLabel: "selected",
        customSectionTitle: "Write your own condition or illness",
        customNameLabel: "Condition or illness name",
        customNamePlaceholder: "e.g. Allergy rash, migraine, asthma, back pain...",
        customSeverityLabel: "How serious is it?",
        customAddBtn: "Add",
        customRemoveAria: "Remove condition",
        reportedConditionsLabel: "Reported conditions:",
        checkinSending: "Sending...",
        checkinBtn: "Send Daily Check-in",
        statusNormal: "Looking good",
        statusAttention: "Doctor will review",
        statusUrgent: "Urgent review",
        rxTitle: "Your Medicines",
        loggedDoses: "Doses logged:",
        takenBtn: "Mark Taken",
        labsTitle: "We reviewed your hospital results",
        labsTip: "Hb = Hemoglobin (iron/oxygen in blood); CRP = inflammation marker; PLT = platelets.",
        flagAbnormal: "Needs follow-up",
        confirmTitle: "Confirm Family Doctor Home Visit",
        confirmedPrefix: "Visit confirmed:",
        otpPlaceholder: "4-digit code (e.g.",
        otpBtn: "Confirm with 4-Digit Code",
        oneTapBtn: "1-Tap: Doctor Visited ✓",
        confirmErr: "Could not confirm visit.",
        confirmOk: "Home visit confirmed! Wishing you a smooth recovery.",
        adherenceOk: "Medicine dose marked as taken.",
        wbTitle: "Daily Wellbeing Check-in (Mother & Baby)",
        wbSub: "Log today's mood, recovery check, and baby feeding in 30 seconds",
        wbMoodLabel: "How are you feeling today?",
        wbPainLabel: "Pain level:",
        wbBleedingLabel: "Bleeding:",
        wbFeverLabel: "Mother fever 38°C+",
        wbFeedLabel: "Baby feeding:",
        wbJaundiceLabel: "Skin jaundice",
        wbBabyTempLabel: "Baby high temp",
        wbDeliveryLabel: "Delivery date (optional):",
        wbEpdsToggle: "Weekly EPDS Wellbeing Screening (10 questions)",
        wbSubmitBtn: "Save Daily Check-in",
        wbSavedOk: "Daily check-in saved!",
        wbUrgent103: "Urgent 103 alert dispatched! Please call 103 emergency services right away.",
        wbJumpSymptom: "Go to Medical Symptoms & Complaint ↓",
        wbSuggestPsych: "Start Free Chat with a Psychologist ↓",
        rxReminderLabel: "Telegram Reminder Times (e.g. 08:00, 20:00)",
        rxSaveReminderBtn: "Save Times",
        rxReminderSavedOk: "Medication reminder times saved!",
        psychTitle: "Perinatal Psychologist & Sessions",
        psychSub: "Private emotional support kept strictly separate from hospital clinical EHR",
        psychEmpty: "Verified perinatal psychologists will appear here soon.",
        psychConsentGrant: "Grant Consent (PsychConsent)",
        psychConsentWithdraw: "Withdraw Consent",
        psychBookBtn: "Book Session",
        psychTopicPlaceholder: "Session topic...",
        psychSessionsTitle: "My Scheduled Sessions",
        psychChatTitle: "Direct Psychologist Chat",
        psychChatPlaceholder: "Message your psychologist...",
        remindersTitle: "Today's Reminders & Schedule",
        remindersMedItem: "Medication times:",
        remindersVisitItem: "24h Home Visit:",
        remindersPsychItem: "Psychologist session:",
        remindersWbDone: "Today's wellbeing check-in completed ✓",
        remindersWbTodo: "Today's wellbeing check-in is still pending",
        remindersGoChat: "Chat with doctor / nurse →",
        remindersEmpty: "All caught up for today.",
    },
};
function getLabTooltip(testName, lang) {
    const lower = testName.toLowerCase();
    if (lower.includes("hemoglobin") || lower.includes("hb") || lower.includes("gemoglobin")) {
        return lang === "ru"
            ? "Гемоглобин (Hb) — белок крови, переносящий кислород."
            : lang === "en"
                ? "Hemoglobin (Hb) — protein in red blood cells that carries oxygen."
                : "Gemoglobin (Hb) — qonda kislorod tashuvchi oqsil.";
    }
    if (lower.includes("crp") || lower.includes("c-reactive") || lower.includes("c-reaktiv")) {
        return lang === "ru"
            ? "CRP (СРБ) — показатель воспаления в организме."
            : lang === "en"
                ? "CRP (C-Reactive Protein) — checks for inflammation or infection."
                : "CRP — organizmdagi yallig'lanish ko'rsatkichi.";
    }
    if (lower.includes("plt") || lower.includes("platelet") || lower.includes("trombotsit")) {
        return lang === "ru"
            ? "PLT (тромбоциты) — клетки крови, отвечающие за свертываемость."
            : lang === "en"
                ? "Platelets (PLT) — blood cells that help stop bleeding."
                : "Trombotsitlar (PLT) — qon ivishiga yordam beruvchi hujayralar.";
    }
    return null;
}
export default function PatientPortalPage() {
    const { authUser, data, loading, fetchWithAuth, refreshData, showToast, dataLoadedAtMs } = usePlatform();
    const { lang } = useLanguage();
    const [fever, setFever] = useState(false);
    const [severeHeadache, setSevereHeadache] = useState(false);
    const [bleeding, setBleeding] = useState(false);
    const [swelling, setSwelling] = useState(false);
    const [additionalSymptoms, setAdditionalSymptoms] = useState([]);
    const [customConditions, setCustomConditions] = useState([]);
    const [customConditionName, setCustomConditionName] = useState("");
    const [customConditionSeverity, setCustomConditionSeverity] = useState("MODERATE");
    const [extendedOpen, setExtendedOpen] = useState(false);
    const [physicalGroupOpen, setPhysicalGroupOpen] = useState(true);
    const [illnessGroupOpen, setIllnessGroupOpen] = useState(true);
    const [customSectionOpen, setCustomSectionOpen] = useState(true);
    const customSeqRef = useRef(1);
    const [bpReading, setBpReading] = useState("124/80");
    const [notes, setNotes] = useState("");
    const [submittingSym, setSubmittingSym] = useState(false);
    const [otpInput, setOtpInput] = useState("");
    const [confirming, setConfirming] = useState(false);
    const [complaintCategory, setComplaintCategory] = useState("POSTPARTUM");
    const [complaintSeverity, setComplaintSeverity] = useState("MODERATE");
    const [complaintDest, setComplaintDest] = useState("HOME");
    const [complaintAddr, setComplaintAddr] = useState("");
    const [complaintDesc, setComplaintDesc] = useState("");
    const [gpsLat, setGpsLat] = useState(null);
    const [gpsLng, setGpsLng] = useState(null);
    const [sharingGps, setSharingGps] = useState(false);
    const [submittingComplaint, setSubmittingComplaint] = useState(false);
    const [chatBody, setChatBody] = useState("");
    const [sendingChat, setSendingChat] = useState(false);
    const [payMethod, setPayMethod] = useState("PAYME");
    const [buyingPlanCode, setBuyingPlanCode] = useState(null);
    const [wbMood, setWbMood] = useState(4);
    const [wbMotherPain, setWbMotherPain] = useState("none");
    const [wbMotherBleeding, setWbMotherBleeding] = useState("normal");
    const [wbMotherFever, setWbMotherFever] = useState(false);
    const [wbBabyFeeding, setWbBabyFeeding] = useState("good");
    const [wbBabyJaundice, setWbBabyJaundice] = useState(false);
    const [wbBabyTempHigh, setWbBabyTempHigh] = useState(false);
    const [wbDeliveryDate, setWbDeliveryDate] = useState("");
    const [wbEpdsOpen, setWbEpdsOpen] = useState(false);
    const [wbEpdsAnswers, setWbEpdsAnswers] = useState(() => Array(10).fill(0));
    const [submittingWb, setSubmittingWb] = useState(false);
    const [wbResult, setWbResult] = useState(null);
    const [rxReminderDrafts, setRxReminderDrafts] = useState({});
    const [savingRxId, setSavingRxId] = useState(null);
    const [selectedPsychId, setSelectedPsychId] = useState("");
    const [psychSessionType, setPsychSessionType] = useState("CHAT");
    const [psychSessionAt, setPsychSessionAt] = useState(() => new Date(Date.now() + 24 * 3600000).toISOString().slice(0, 16));
    const [psychTopic, setPsychTopic] = useState("");
    const [psychActionBusy, setPsychActionBusy] = useState(false);
    const [psychChatBody, setPsychChatBody] = useState("");
    const [sendingPsychChat, setSendingPsychChat] = useState(false);
    const activeCalls = useMemo(() => data?.activeCalls ?? [], [data?.activeCalls]);
    const call = activeCalls[0];
    const ownPatient = data?.patients?.[0];
    const complaints = useMemo(() => data?.complaints ?? [], [data?.complaints]);
    const directMessages = useMemo(() => data?.directMessages ?? [], [data?.directMessages]);
    const psychologists = useMemo(() => (data?.users ?? []).filter((u) => u.role === "PSYCHOLOGIST"), [data?.users]);
    const psychConsents = useMemo(() => data?.psychConsents ?? [], [data?.psychConsents]);
    const psychSessions = useMemo(() => data?.psychSessions ?? [], [data?.psychSessions]);
    const activePsychId = selectedPsychId || psychologists[0]?.id || "";
    const psychIdSet = useMemo(() => new Set(psychologists.map((p) => p.id)), [psychologists]);
    const doctorChatMessages = useMemo(() => directMessages.filter((m) => !psychIdSet.has(m.senderUserId) && !psychIdSet.has(m.recipientUserId) && m.senderRole !== "PSYCHOLOGIST"), [directMessages, psychIdSet]);
    const psychChatMessages = useMemo(() => directMessages.filter((m) => activePsychId && (m.senderUserId === activePsychId || m.recipientUserId === activePsychId)), [directMessages, activePsychId]);
    const activePrescriptions = useMemo(() => {
        const list = ownPatient?.prescriptions ?? call?.patient?.prescriptions ?? [];
        return list;
    }, [ownPatient?.prescriptions, call?.patient?.prescriptions]);
    const currentSubTier = authUser?.subscriptionTier || ownPatient?.subscriptionTier || "FREE";
    const effectiveLat = gpsLat ?? authUser?.latitude ?? ownPatient?.latitude ?? null;
    const effectiveLng = gpsLng ?? authUser?.longitude ?? ownPatient?.longitude ?? null;
    const t = COPY[lang];
    const physicalSymptoms = useMemo(() => EXTENDED_SYMPTOMS_CATALOG.filter((s) => s.category === "physical"), []);
    const illnessConditions = useMemo(() => EXTENDED_SYMPTOMS_CATALOG.filter((s) => s.category === "conditions"), []);
    const handleLocationCaptured = async ({ latitude: lat, longitude: lng }) => {
        setGpsLat(lat);
        setGpsLng(lng);
        setSharingGps(true);
        try {
            await fetchWithAuth("/api/patient/location", {
                method: "PATCH",
                body: JSON.stringify({
                    latitude: lat,
                    longitude: lng,
                    address: complaintAddr || ownPatient?.address || "",
                    district: ownPatient?.district || authUser?.district || "",
                }),
            });
            await refreshData();
            showToast("success", `${t.gpsReady} ${lat}, ${lng}`);
        }
        finally {
            setSharingGps(false);
        }
    };
    const handleComplaintSubmit = async (e) => {
        e.preventDefault();
        if (!complaintDesc.trim())
            return;
        setSubmittingComplaint(true);
        try {
            const res = await fetchWithAuth("/api/complaints", {
                method: "POST",
                body: JSON.stringify({
                    category: complaintCategory,
                    severity: complaintSeverity,
                    visitDestination: complaintDest,
                    visitAddress: complaintAddr.trim() || ownPatient?.address || authUser?.district || "",
                    description: complaintDesc.trim(),
                    latitude: effectiveLat ?? undefined,
                    longitude: effectiveLng ?? undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                showToast("error", json.error || t.complaintSentErr);
                return;
            }
            setComplaintDesc("");
            await refreshData();
            showToast("success", t.complaintSentOk);
        }
        finally {
            setSubmittingComplaint(false);
        }
    };
    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatBody.trim())
            return;
        setSendingChat(true);
        try {
            const res = await fetchWithAuth("/api/messages", {
                method: "POST",
                body: JSON.stringify({
                    body: chatBody.trim(),
                    complaintId: complaints[0]?.id || undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                showToast("error", json.error || "Could not send message");
                return;
            }
            setChatBody("");
            await refreshData();
        }
        finally {
            setSendingChat(false);
        }
    };
    const handleBuySubscription = async (planCode) => {
        setBuyingPlanCode(planCode);
        try {
            const res = await fetchWithAuth("/api/subscriptions", {
                method: "POST",
                body: JSON.stringify({ planCode, paymentMethod: payMethod }),
            });
            const json = await res.json();
            if (!res.ok) {
                showToast("error", json.error || "Failed to update subscription");
                return;
            }
            await refreshData();
            showToast("success", t.subOk);
        }
        finally {
            setBuyingPlanCode(null);
        }
    };
    const toggleAdditionalSymptom = (id) => {
        setAdditionalSymptoms((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
    };
    const handleAddCustomCondition = () => {
        const trimmed = customConditionName.trim();
        if (!trimmed)
            return;
        const nextId = `custom-${customSeqRef.current}`;
        customSeqRef.current += 1;
        setCustomConditions((prev) => [
            ...prev,
            { id: nextId, name: trimmed, severity: customConditionSeverity },
        ]);
        setCustomConditionName("");
    };
    const handleRemoveCustomCondition = (id) => {
        setCustomConditions((prev) => prev.filter((c) => c.id !== id));
    };
    const handleSymptomSubmit = async (e) => {
        e.preventDefault();
        if (!call)
            return;
        const pendingCustomName = customConditionName.trim();
        const finalCustomConditions = pendingCustomName
            ? [
                ...customConditions,
                {
                    id: `custom-${customSeqRef.current}`,
                    name: pendingCustomName,
                    severity: customConditionSeverity,
                },
            ]
            : customConditions;
        if (pendingCustomName) {
            customSeqRef.current += 1;
        }
        setSubmittingSym(true);
        try {
            const res = await fetchWithAuth("/api/patient/symptom-checkin", {
                method: "POST",
                body: JSON.stringify({
                    activeCallId: call.id,
                    fever,
                    severeHeadache,
                    bleeding,
                    swelling,
                    additionalSymptoms,
                    customConditions: finalCustomConditions,
                    bpReading,
                    notes,
                }),
            });
            const json = await res.json();
            if (res.ok) {
                await refreshData();
                const level = json.checkin.aiTriageLevel;
                showToast(level === "RED_EMERGENCY" ? "error" : level === "YELLOW" ? "info" : "success", lang === "ru"
                    ? json.checkin.aiAdviceRu
                    : lang === "en"
                        ? json.checkin.aiAdviceEn
                        : json.checkin.aiAdviceUz);
                setNotes("");
                setCustomConditionName("");
                setCustomConditions([]);
                setAdditionalSymptoms([]);
            }
        }
        finally {
            setSubmittingSym(false);
        }
    };
    const handleConfirmVisit = async (method) => {
        if (!call)
            return;
        setConfirming(true);
        try {
            const res = await fetchWithAuth("/api/patient/confirm-visit", {
                method: "POST",
                body: JSON.stringify({
                    activeCallId: call.id,
                    method,
                    otpCode: otpInput,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                showToast("error", json.error || t.confirmErr);
                return;
            }
            await refreshData();
            showToast("success", t.confirmOk);
        }
        finally {
            setConfirming(false);
        }
    };
    const handleAdherence = async (rxId) => {
        const res = await fetchWithAuth("/api/patient/adherence", {
            method: "POST",
            body: JSON.stringify({ prescriptionId: rxId, taken: true }),
        });
        if (res.ok) {
            await refreshData();
            showToast("success", t.adherenceOk);
        }
    };
    const handleWellbeingSubmit = async (e) => {
        e.preventDefault();
        setSubmittingWb(true);
        try {
            const payload = {
                mood: wbMood,
                answers: {
                    motherPain: wbMotherPain,
                    motherBleeding: wbMotherBleeding,
                    motherFever: wbMotherFever,
                    newbornFeeding: wbBabyFeeding,
                    newbornJaundice: wbBabyJaundice,
                    newbornTempHigh: wbBabyTempHigh,
                },
                ...(wbEpdsOpen ? { epdsAnswers: wbEpdsAnswers } : {}),
                ...(wbDeliveryDate ? { deliveryDate: wbDeliveryDate } : {}),
                source: "WEB",
            };
            const res = await fetchWithAuth("/api/patient/wellbeing", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) {
                showToast("error", json.error || "Failed to save check-in");
                return;
            }
            setWbResult(json.evaluation || null);
            await refreshData();
            showToast(json.evaluation?.epdsSelfHarmFlag || json.evaluation?.hasPhysicalRedFlag ? "error" : "success", json.evaluation?.epdsSelfHarmFlag ? t.wbUrgent103 : t.wbSavedOk);
        }
        finally {
            setSubmittingWb(false);
        }
    };
    const handleSaveRxReminder = async (rx) => {
        setSavingRxId(rx.id);
        try {
            const draftVal = rxReminderDrafts[rx.id];
            const timesStr = draftVal?.timesText ?? (rx.reminderTimes ?? []).join(", ");
            const enabled = draftVal?.enabled ?? rx.remindersEnabled !== false;
            const reminderTimes = timesStr.split(",").map((s) => s.trim()).filter(Boolean);
            const res = await fetchWithAuth(`/api/patient/prescriptions/${rx.id}/reminders`, {
                method: "PATCH",
                body: JSON.stringify({ reminderTimes, remindersEnabled: enabled }),
            });
            const json = await res.json();
            if (!res.ok) {
                showToast("error", json.error || "Could not update reminders");
                return;
            }
            await refreshData();
            showToast("success", t.rxReminderSavedOk);
        }
        finally {
            setSavingRxId(null);
        }
    };
    const handlePsychConsent = async (psychId, grant) => {
        setPsychActionBusy(true);
        try {
            const res = await fetchWithAuth("/api/psychologist/sessions", {
                method: "POST",
                body: JSON.stringify({
                    action: grant ? "GRANT_CONSENT" : "WITHDRAW_CONSENT",
                    psychologistId: psychId,
                }),
            });
            if (res.ok) {
                await refreshData();
                showToast("success", grant ? t.psychConsentGrant : t.psychConsentWithdraw);
            }
        }
        finally {
            setPsychActionBusy(false);
        }
    };
    const handleBookPsychSession = async (e) => {
        e.preventDefault();
        if (!activePsychId)
            return;
        setPsychActionBusy(true);
        try {
            const res = await fetchWithAuth("/api/psychologist/sessions", {
                method: "POST",
                body: JSON.stringify({
                    action: "BOOK_SESSION",
                    psychologistId: activePsychId,
                    sessionType: psychSessionType,
                    scheduledAt: new Date(psychSessionAt).toISOString(),
                    topic: psychTopic.trim() || undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                showToast("error", json.error || "Failed to book session");
                return;
            }
            setPsychTopic("");
            await refreshData();
            showToast("success", t.psychBookBtn);
        }
        finally {
            setPsychActionBusy(false);
        }
    };
    const handleSendPsychChat = async (e) => {
        e.preventDefault();
        if (!psychChatBody.trim() || !activePsychId)
            return;
        setSendingPsychChat(true);
        try {
            const res = await fetchWithAuth("/api/messages", {
                method: "POST",
                body: JSON.stringify({
                    recipientUserId: activePsychId,
                    body: psychChatBody.trim(),
                }),
            });
            if (res.ok) {
                setPsychChatBody("");
                await refreshData({ silent: true });
            }
        }
        finally {
            setSendingPsychChat(false);
        }
    };
    if (loading) {
        return (<div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
        {t.loading}
      </div>);
    }
    const wbEpdsPreview = wbEpdsOpen ? computeEpdsScore(wbEpdsAnswers) : null;
    const baseNowMs = data?.simState?.simulatedNow ? new Date(data.simState.simulatedNow).getTime() : dataLoadedAtMs;
    const todayTashkent = baseNowMs ? new Date(baseNowMs + 5 * 3600000).toISOString().slice(0, 10) : "";
    const hasWellbeingToday = Boolean(todayTashkent) && (ownPatient?.wellbeingCheckins ?? []).some((w) => String(w.createdAt || "").slice(0, 10) === todayTashkent);
    const scheduledMeds = activePrescriptions.filter((rx) => rx.active !== false && rx.remindersEnabled !== false && (rx.reminderTimes ?? []).length > 0);
    const upcomingPsych = psychSessions.filter((s) => s.status === "SCHEDULED" || s.status === "CONFIRMED");
    return (<div className="mx-auto max-w-3xl space-y-4">
      <Emergency103Banner />

      {/* Top Language & Personal Profile Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.title}</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">{t.subtitle}</p>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <IconUser className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400"/>
              {ownPatient?.fullName ?? authUser?.fullName}
            </span>
            {effectiveLat !== null && effectiveLng !== null && (<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
                <IconMapPin className="h-3 w-3"/>
                {Number(effectiveLat).toFixed(4)}, {Number(effectiveLng).toFixed(4)}
              </span>)}
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
              <IconCrown className="h-3 w-3"/>
              {currentSubTier}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {ownPatient && (<span className="text-slate-600 dark:text-slate-400">
                {ownPatient.district}
                {ownPatient.mahalla ? `, ${ownPatient.mahalla}` : ""} • {ownPatient.polyclinicName}
              </span>)}
            <Link href="/telegram" className="inline-flex min-h-[36px] items-center gap-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60">
              <IconBrandTelegram className="h-3.5 w-3.5"/>
              {t.telegramCta}
            </Link>
          </div>
        </div>
      </div>

      {/* Bugungi Eslatmalar / Today's Reminders Card */}
      <section className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-sm font-bold text-[#292E2B] dark:text-[#F3F0E8] flex items-center gap-1.5">
            <IconBell className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]"/>
            <span>{t.remindersTitle}</span>
          </h2>
          <a href="#doctor-direct-chat" className="text-xs font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:underline underline-offset-4">
            {t.remindersGoChat}
          </a>
        </div>

        <div className="space-y-2 text-xs">
          <div className={`rounded-sm border px-3 py-2 font-medium ${hasWellbeingToday
            ? "border-[#A7BBAA] bg-[#EFECE3]/70 dark:bg-[#242A27] text-[#244C40] dark:text-[#A7BBAA]"
            : "border-[#D9B8AE] bg-[#F3EAE7]/70 dark:bg-[#2E1E1D]/60 text-[#7A2E2E] dark:text-[#F0C8C4]"}`}>
            {hasWellbeingToday ? t.remindersWbDone : t.remindersWbTodo}
          </div>

          {call && call.status !== "COMPLETED" && (<div className="rounded-sm border border-[#A7BBAA] dark:border-[#4D6452] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-2 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-[#292E2B] dark:text-[#F3F0E8]">
                {t.remindersVisitItem} {call.assignedDoctor?.fullName} •{" "}
                {new Date(call.scheduledWindowStart).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                –
                {new Date(call.scheduledWindowEnd).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="font-mono font-bold text-[#244C40] dark:text-[#A7BBAA]">
                OTP: {call.patientOtpCode}
              </span>
            </div>)}

          {scheduledMeds.map((rx) => (<div key={`rem-${rx.id}`} className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-[#292E2B] dark:text-[#F3F0E8]">
                  {t.remindersMedItem} {rx.medicationName} ({rx.dosage})
                </span>
                <span className="ml-2 font-mono text-[11px] text-[#244C40] dark:text-[#A7BBAA]">
                  {(rx.reminderTimes ?? []).join(", ")}
                </span>
              </div>
              <button type="button" onClick={() => handleAdherence(rx.id)} className="inline-flex items-center gap-1 rounded-sm bg-[#244C40] px-2.5 py-1 text-[11px] font-semibold text-[#F7F5EF] hover:bg-[#1A382F]">
                <IconCheck className="h-3 w-3"/>
                {t.takenBtn}
              </button>
            </div>))}

          {upcomingPsych.map((s) => (<div key={`rem-psych-${s.id}`} className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-2 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-[#292E2B] dark:text-[#F3F0E8]">
                {t.remindersPsychItem} {s.psychologist?.fullName || "Psychologist"}
              </span>
              <span className="font-mono text-[11px] text-[#525954] dark:text-[#B8C2BA]">
                {new Date(s.scheduledAt).toLocaleString("en-GB", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>))}
        </div>
      </section>

      {/* Daily Wellbeing & EPDS Check-in Card (Phase 1) */}
      <section className="rounded-sm border border-[#A7BBAA] dark:border-[#4D6452] bg-[#FFFFFF] dark:bg-[#1D221F] p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-heading text-sm font-bold text-[#292E2B] dark:text-[#F3F0E8] flex items-center gap-1.5">
              <IconHeartHandshake className="h-4 w-4 text-[#244C40] dark:text-[#A7BBAA]"/>
              <span>{t.wbTitle}</span>
            </h2>
            <p className="text-xs text-[#525954] dark:text-[#B8C2BA] mt-0.5">{t.wbSub}</p>
          </div>
          {ownPatient?.deliveryDate && (<span className="rounded-sm bg-[#EFECE3] dark:bg-[#242A27] px-2.5 py-1 text-[10px] font-mono font-semibold text-[#244C40] dark:text-[#A7BBAA]">
              {String(ownPatient.deliveryDate).slice(0, 10)}
            </span>)}
        </div>

        <form onSubmit={handleWellbeingSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <span className="block text-[11px] font-semibold text-[#525954] dark:text-[#B8C2BA]">
              {t.wbMoodLabel}
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {MOOD_SCALE.map((m) => {
                const active = wbMood === m.value;
                return (<button key={m.value} type="button" onClick={() => setWbMood(m.value)} className={`flex flex-col items-center justify-center gap-0.5 rounded-sm border py-2 px-1 text-center transition-colors ${active
                        ? "border-[#244C40] bg-[#EFECE3] dark:bg-[#242A27] text-[#244C40] dark:text-[#A7BBAA] ring-1 ring-[#244C40]"
                        : "border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] text-[#525954]"}`}>
                    <span className="text-lg leading-none">{m.emoji}</span>
                    <span className="text-[10px] font-semibold truncate max-w-full">
                      {lang === "ru" ? m.ru : lang === "en" ? m.en : m.uz}
                    </span>
                  </button>);
            })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#525954] mb-1">{t.wbPainLabel}</label>
              <select value={wbMotherPain} onChange={(e) => setWbMotherPain(e.target.value)} className="min-h-[38px] w-full rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-2.5 py-1.5 text-xs">
                <option value="none">Yo&apos;q / None</option>
                <option value="mild">Biroz / Mild</option>
                <option value="severe">Kuchli / Severe</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#525954] mb-1">{t.wbBleedingLabel}</label>
              <select value={wbMotherBleeding} onChange={(e) => setWbMotherBleeding(e.target.value)} className="min-h-[38px] w-full rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-2.5 py-1.5 text-xs">
                <option value="normal">Me&apos;yorda / Normal</option>
                <option value="heavy">Ko&apos;p / Heavy</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#525954] mb-1">{t.wbFeedLabel}</label>
              <select value={wbBabyFeeding} onChange={(e) => setWbBabyFeeding(e.target.value)} className="min-h-[38px] w-full rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-2.5 py-1.5 text-xs">
                <option value="good">Yaxshi / Good</option>
                <option value="less">Kam / Less</option>
                <option value="refusing">Rad etmoqda / Refusing</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={wbMotherFever} onChange={(e) => setWbMotherFever(e.target.checked)} className="h-4 w-4 rounded border-[#DDD8CC]"/>
              <span>{t.wbFeverLabel}</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={wbBabyJaundice} onChange={(e) => setWbBabyJaundice(e.target.checked)} className="h-4 w-4 rounded border-[#DDD8CC]"/>
              <span>{t.wbJaundiceLabel}</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={wbBabyTempHigh} onChange={(e) => setWbBabyTempHigh(e.target.checked)} className="h-4 w-4 rounded border-[#DDD8CC]"/>
              <span>{t.wbBabyTempLabel}</span>
            </label>
          </div>

          {!ownPatient?.deliveryDate && (<div>
              <label htmlFor="wb-delivery" className="block text-[11px] font-semibold text-[#525954] mb-1">
                {t.wbDeliveryLabel}
              </label>
              <input id="wb-delivery" type="date" value={wbDeliveryDate} onChange={(e) => setWbDeliveryDate(e.target.value)} className="min-h-[38px] rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3 py-1.5 text-xs"/>
            </div>)}

          <div className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] overflow-hidden">
            <button type="button" onClick={() => setWbEpdsOpen((v) => !v)} className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-semibold text-[#244C40] dark:text-[#A7BBAA]">
              <span>
                {t.wbEpdsToggle}{wbEpdsPreview ? ` (${wbEpdsPreview.totalScore}/30)` : ""}
              </span>
              {wbEpdsOpen ? <IconChevronUp className="h-4 w-4"/> : <IconChevronDown className="h-4 w-4"/>}
            </button>
            {wbEpdsOpen && (<div className="border-t border-[#DDD8CC] dark:border-[#2F3733] p-3 space-y-3">
                {EPDS_QUESTIONS.map((q, qIdx) => (<div key={q.index} className="space-y-1.5">
                    <p className="text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8]">
                      {lang === "ru" ? q.ru : lang === "en" ? q.en : q.uz}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {q.options.map((opt) => {
                        const selected = wbEpdsAnswers[qIdx] === opt.score;
                        return (<button key={opt.score} type="button" onClick={() => setWbEpdsAnswers((prev) => prev.map((v, idx) => (idx === qIdx ? opt.score : v)))} className={`text-left rounded-sm border px-2.5 py-1.5 text-[11px] transition-colors ${selected
                                ? "border-[#244C40] bg-[#244C40] text-[#F7F5EF] font-semibold"
                                : "border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F]"}`}>
                            {lang === "ru" ? opt.ru : lang === "en" ? opt.en : opt.uz}
                          </button>);
                    })}
                    </div>
                  </div>))}
              </div>)}
          </div>

          <button type="submit" disabled={submittingWb} className="w-full min-h-[42px] rounded-sm bg-[#244C40] hover:bg-[#1A382F] dark:bg-[#2C5B4D] py-2 text-xs font-semibold text-[#F7F5EF] disabled:opacity-50">
            {submittingWb ? "..." : t.wbSubmitBtn}
          </button>
        </form>

        {wbResult && (<div className="space-y-2">
            {(wbResult.epdsSelfHarmFlag || wbResult.hasPhysicalRedFlag) && (<div className="rounded-sm border border-[#9E4747] bg-[#F3EAE7] p-3 text-xs text-[#7A2E2E] space-y-1.5">
                <p className="font-bold">{t.wbUrgent103}</p>
                <div className="flex flex-wrap gap-2">
                  <a href="tel:103" className="inline-flex items-center gap-1 rounded-sm bg-[#9E4747] px-3 py-1 font-semibold text-white">
                    <IconPhoneCall className="h-3.5 w-3.5"/> 103
                  </a>
                  <a href="#symptom-checkin-section" className="inline-flex items-center rounded-sm border border-[#9E4747] bg-white px-3 py-1 font-semibold text-[#7A2E2E]">
                    {t.wbJumpSymptom}
                  </a>
                </div>
              </div>)}
            {wbResult.suggestPsychologist && (<a href="#psychologist-support" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:underline">
                {t.wbSuggestPsych}
              </a>)}
          </div>)}

        {(ownPatient?.wellbeingCheckins ?? []).length > 0 && (<VitalsTrendChart records={ownPatient.wellbeingCheckins} mode="mood"/>)}
      </section>

      {/* Complaint Submission + Paramedic Destination & GPS */}
      <section id="symptom-checkin-section" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <IconStethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400"/>
              {t.complaintCardTitle}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{t.complaintCardSub}</p>
          </div>
          <GpsConsentButton
            label={sharingGps ? "..." : t.shareGpsBtn}
            busy={sharingGps}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-teal-600 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 px-3.5 py-2 text-xs font-semibold text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 disabled:opacity-50 shrink-0"
            onLocationCaptured={handleLocationCaptured}
            onError={() => showToast("error", "Could not access browser GPS location")}
          />
        </div>

        <form onSubmit={handleComplaintSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="comp-category" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t.complaintCategoryLabel}
              </label>
              <select id="comp-category" value={complaintCategory} onChange={(e) => setComplaintCategory(e.target.value)} className="min-h-[40px] w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100">
                <option value="POSTPARTUM">Postpartum / Tug&apos;ruqdan keyingi</option>
                <option value="CARDIO">Cardio / Qon bosimi</option>
                <option value="PEDIATRIC">Pediatric / Chaqaloq parvarishi</option>
                <option value="GENERAL">General / Umumiy terapevt</option>
                <option value="EMERGENCY">Emergency / Shoshilinch holat</option>
                <option value="OTHER">Other / Boshqa</option>
              </select>
            </div>
            <div>
              <label htmlFor="comp-severity" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t.complaintSeverityLabel}
              </label>
              <select id="comp-severity" value={complaintSeverity} onChange={(e) => setComplaintSeverity(e.target.value)} className="min-h-[40px] w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100">
                <option value="MILD">MILD</option>
                <option value="MODERATE">MODERATE</option>
                <option value="SEVERE">SEVERE</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {t.complaintDestLabel}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {VISIT_DESTINATION_OPTIONS.map((opt) => {
            const active = complaintDest === opt.value;
            const label = lang === "ru" ? opt.ru : lang === "en" ? opt.en : opt.uz;
            return (<button key={opt.value} type="button" onClick={() => setComplaintDest(opt.value)} className={`min-h-[38px] rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition ${active
                    ? "border-teal-700 bg-teal-700 text-white"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    {label}
                  </button>);
        })}
            </div>
          </div>

          <div>
            <label htmlFor="comp-address" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {t.complaintAddrLabel}
            </label>
            <input id="comp-address" type="text" value={complaintAddr} onChange={(e) => setComplaintAddr(e.target.value)} placeholder={ownPatient?.address || t.complaintAddrPlaceholder} className="min-h-[40px] w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"/>
          </div>

          <div>
            <label htmlFor="comp-desc" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {t.complaintDescLabel}
            </label>
            <textarea id="comp-desc" rows={2} value={complaintDesc} onChange={(e) => setComplaintDesc(e.target.value)} placeholder={t.complaintDescPlaceholder} required className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"/>
          </div>

          <button type="submit" disabled={submittingComplaint || !complaintDesc.trim()} className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-teal-700 py-2.5 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-50 transition">
            <IconSend className="h-3.5 w-3.5"/>
            {submittingComplaint ? t.complaintSubmitting : t.complaintSubmitBtn}
          </button>
        </form>

        {complaints.length > 0 && (<div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.complaintsListTitle} ({complaints.length})
            </h3>
            {complaints.map((c) => (<div key={c.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{c.title}</span>
                    <span className="rounded-full bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {c.category} • {c.severity}
                    </span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${c.status === "VERIFIED_COMPLETED"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                    : c.status === "EN_ROUTE" || c.status === "ARRIVED"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                        : "bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300"}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{c.description}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>
                    <IconMapPin className="inline h-3 w-3 mr-0.5"/>
                    {c.visitDestination}: {c.visitAddress}
                  </span>
                  {c.visitOtpCode && (<span className="font-mono font-bold text-teal-700 dark:text-teal-300">
                      OTP: {c.visitOtpCode}
                    </span>)}
                  {typeof c.distanceKm === "number" && (<span>
                      {t.distanceLabel} <strong>{c.distanceKm} km</strong>
                    </span>)}
                </div>
                {c.assignedDoctor && (<div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {t.matchedDocLabel} {c.assignedDoctor.fullName}
                    </span>{" "}
                    {c.assignedDoctor.specialty ? `(${c.assignedDoctor.specialty})` : ""}
                    {c.assignedDoctor.expertiseArea ? ` • ${c.assignedDoctor.expertiseArea}` : ""}
                    {typeof c.assignedDoctor.experienceYears === "number"
                        ? ` • ${c.assignedDoctor.experienceYears} ${t.expYearsWord}`
                        : ""}
                    {c.doctorResponse && (<p className="mt-1 text-teal-800 dark:text-teal-300 font-medium">
                        {t.docReplyLabel} {c.doctorResponse}
                      </p>)}
                  </div>)}
                {c.status === "VERIFIED_COMPLETED" && (<div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <p className="font-bold flex items-center gap-1">
                      <IconCircleCheck className="h-3.5 w-3.5"/>
                      {t.verifiedBanner}
                    </p>
                    {c.verifiedVitals && (<p className="font-mono mt-0.5">
                        BP {c.verifiedVitals.systolicBp}/{c.verifiedVitals.diastolicBp} • HR {c.verifiedVitals.heartRate} • {c.verifiedVitals.tempC}°C • SpO2 {c.verifiedVitals.spo2}%
                      </p>)}
                    {c.visitVerificationNote && <p className="mt-0.5">{c.visitVerificationNote}</p>}
                  </div>)}
              </div>))}
          </div>)}
      </section>

      {/* Direct Advice Chat with Assigned Doctor */}
      <section id="doctor-direct-chat" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <IconMessageCircle className="h-4 w-4 text-teal-600 dark:text-teal-400"/>
              {t.chatTitle}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.chatSub}</p>
          </div>
          <Link href="/telegram" className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline">
            {t.telegramCta} →
          </Link>
        </div>

        <div className="max-h-56 overflow-y-auto space-y-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
          {doctorChatMessages.length === 0 ? (<p className="text-xs text-slate-500 dark:text-slate-400 text-center py-3">
              {t.chatEmpty}
            </p>) : (doctorChatMessages.map((msg) => {
            const isMine = msg.senderUserId === authUser?.id || msg.senderRole === "PATIENT";
            return (<div key={msg.id} className={`rounded-xl p-2.5 text-xs max-w-[88%] ${isMine
                    ? "ml-auto bg-teal-600 text-white"
                    : "mr-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"}`}>
                  <div className="flex items-center justify-between gap-2 text-[10px] opacity-80 mb-0.5">
                    <span className="font-bold">{msg.senderName}</span>
                    <span>[{msg.channel}]</span>
                  </div>
                  <p>{msg.body}</p>
                </div>);
        }))}
        </div>

        <form onSubmit={handleSendChat} className="flex gap-2">
          <input type="text" value={chatBody} onChange={(e) => setChatBody(e.target.value)} placeholder={t.chatPlaceholder} className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"/>
          <button type="submit" disabled={sendingChat || !chatBody.trim()} className="inline-flex items-center gap-1 rounded-xl bg-slate-900 dark:bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-teal-500 disabled:opacity-50">
            <IconSend className="h-3.5 w-3.5"/>
            {t.chatSendBtn}
          </button>
        </form>
      </section>

      {/* Patient Subscription Plans */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <IconCrown className="h-4 w-4 text-amber-500"/>
              {t.subTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.subSub}</p>
          </div>
          <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} aria-label="Payment method" className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200">
            <option value="PAYME">Payme</option>
            <option value="CLICK">Click</option>
            <option value="UZCARD">Uzcard</option>
            <option value="HUMO">Humo</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PATIENT_PLANS.map((plan) => {
            const isCurrent = currentSubTier === plan.code;
            const title = lang === "ru" ? plan.nameRu : lang === "en" ? plan.nameEn : plan.nameUz;
            const badge = lang === "ru" ? plan.badgeRu : lang === "en" ? plan.badgeEn : plan.badgeUz;
            const feats = lang === "ru" ? plan.featuresRu : lang === "en" ? plan.featuresEn : plan.featuresUz;
            return (<div key={plan.code} className={`rounded-xl border p-3.5 flex flex-col justify-between space-y-3 ${isCurrent
                    ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/40"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50"}`}>
                <div className="space-y-1.5">
                  <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-950/70 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                    {badge}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{title}</h3>
                  <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    {feats.map((f, idx) => (<li key={idx} className="flex items-start gap-1">
                        <IconCheck className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5"/>
                        <span>{f}</span>
                      </li>))}
                  </ul>
                </div>
                <button type="button" disabled={isCurrent || buyingPlanCode === plan.code} onClick={() => handleBuySubscription(plan.code)} className={`w-full rounded-lg py-2 text-xs font-bold transition ${isCurrent
                    ? "bg-emerald-600 text-white opacity-90"
                    : "bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 dark:hover:bg-teal-500"} disabled:opacity-60`}>
                  {isCurrent ? t.subActiveBtn : buyingPlanCode === plan.code ? "..." : t.subBuyBtn}
                </button>
              </div>);
        })}
        </div>
      </section>

      {!call ? (<div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {t.noCall}
        </div>) : (<>
          {/* Assigned Family Doctor & 24h Visit Window */}
          <section className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30 p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  {t.doctorTitle}
                </p>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {call.assignedDoctor.fullName}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {call.polyclinicName} • {call.assignedDoctor.phone}
                </p>
              </div>
              {data?.simState && (<SlaCountdownBadge dischargedAt={call.dischargedAt} slaDeadlineAt={call.slaDeadlineAt} simulatedNow={data.simState.simulatedNow} dataLoadedAtMs={dataLoadedAtMs} status={call.status} plainMode/>)}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white dark:bg-slate-900 p-3 border border-teal-100 dark:border-teal-900 text-xs text-slate-700 dark:text-slate-300">
              <span>
                {t.visitWindow}{" "}
                <strong className="text-slate-900 dark:text-slate-100">
                  {new Date(call.scheduledWindowStart).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            })}
                  –
                  {new Date(call.scheduledWindowEnd).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            })}
                </strong>
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
                <IconKey className="h-3.5 w-3.5"/>
                <InfoTooltip label={`${t.visitCodeLabel}:`} explanation={t.visitCodeTip}/>
                {call.patientOtpCode}
              </span>
            </div>
          </section>

          {/* Home Care Guide */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <IconShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400"/>
              {t.guideTitle}
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
              {lang === "ru"
                ? call.patientGuide.summaryRu
                : lang === "en"
                    ? call.patientGuide.summaryEn
                    : call.patientGuide.summaryUz}
            </p>

            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">{t.rulesTitle}</h3>
              <ul className="space-y-1.5">
                {(lang === "ru"
                ? call.patientGuide.dailyRulesRu
                : lang === "en"
                    ? call.patientGuide.dailyRulesEn
                    : call.patientGuide.dailyRulesUz)?.map((rule, idx) => (<li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <IconCircleCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"/>
                    <span>{rule}</span>
                  </li>))}
              </ul>
            </div>

            <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40 p-3">
              <h3 className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-1.5 flex items-center gap-1.5">
                <IconPhoneCall className="h-3.5 w-3.5"/>
                {t.dangerTitle}
              </h3>
              <ul className="space-y-1 text-xs text-rose-900 dark:text-rose-200 list-disc pl-4">
                {(lang === "ru"
                ? call.patientGuide.emergencySignsRu
                : lang === "en"
                    ? call.patientGuide.emergencySignsEn
                    : call.patientGuide.emergencySignsUz)?.map((sign, idx) => (<li key={idx}>{sign}</li>))}
              </ul>
            </div>
          </section>

          {/* Daily Symptom Check-in */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <IconHeartbeat className="h-4 w-4 text-rose-600 dark:text-rose-400"/>
              {t.checkinTitle}
            </h2>
            <form onSubmit={handleSymptomSubmit} className="space-y-3">
              {/* Primary 4 Red-Flag Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRIMARY_RED_FLAG_SYMPTOMS.map((sym) => {
                const stateMap = {
                    fever: { checked: fever, set: setFever },
                    severeHeadache: { checked: severeHeadache, set: setSevereHeadache },
                    bleeding: { checked: bleeding, set: setBleeding },
                    swelling: { checked: swelling, set: setSwelling },
                };
                const ctrl = stateMap[sym.key];
                return (<label key={sym.key} className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-medium cursor-pointer transition ${ctrl.checked
                        ? "border-rose-400 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300"}`}>
                      <input type="checkbox" checked={ctrl.checked} onChange={(e) => ctrl.set(e.target.checked)} className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-rose-600"/>
                      <span>{lang === "ru" ? sym.ru : lang === "en" ? sym.en : sym.uz}</span>
                    </label>);
            })}
              </div>

              {/* Collapsible Extended Illnesses & Symptoms List */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 overflow-hidden">
                <button type="button" aria-expanded={extendedOpen} onClick={() => setExtendedOpen((v) => !v)} className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-900/60 transition">
                  <span className="flex flex-wrap items-center gap-2">
                    <span>
                      {t.moreConditionsTitle} ({EXTENDED_SYMPTOMS_CATALOG.length})
                    </span>
                    {additionalSymptoms.length > 0 && (<span className="rounded-full bg-teal-100 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-800 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-300">
                        {additionalSymptoms.length} {t.selectedCountLabel}
                      </span>)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400 shrink-0">
                    {extendedOpen ? t.moreConditionsToggleHide : t.moreConditionsToggleShow}
                    {extendedOpen ? (<IconChevronUp className="h-4 w-4"/>) : (<IconChevronDown className="h-4 w-4"/>)}
                  </span>
                </button>

                {extendedOpen && (<div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-3">
                    {/* Sub-group 1: Physical & Postpartum Symptoms */}
                    <div className="space-y-2">
                      <button type="button" aria-expanded={physicalGroupOpen} onClick={() => setPhysicalGroupOpen((v) => !v)} className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                        <span>
                          {t.physicalGroupTitle} ({physicalSymptoms.length})
                        </span>
                        {physicalGroupOpen ? (<IconChevronUp className="h-3.5 w-3.5"/>) : (<IconChevronDown className="h-3.5 w-3.5"/>)}
                      </button>
                      {physicalGroupOpen && (<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {physicalSymptoms.map((sym) => {
                        const checked = additionalSymptoms.includes(sym.id);
                        return (<label key={sym.id} className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium cursor-pointer transition ${checked
                                ? sym.triage === "CRITICAL"
                                    ? "border-rose-400 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200"
                                    : "border-teal-400 dark:border-teal-700 bg-teal-50/70 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"}`}>
                                <input type="checkbox" checked={checked} onChange={() => toggleAdditionalSymptom(sym.id)} className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-teal-600"/>
                                <span>
                                  {lang === "ru" ? sym.ru : lang === "en" ? sym.en : sym.uz}
                                </span>
                              </label>);
                    })}
                        </div>)}
                    </div>

                    {/* Sub-group 2: Illnesses & Other Health Conditions */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                      <button type="button" aria-expanded={illnessGroupOpen} onClick={() => setIllnessGroupOpen((v) => !v)} className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                        <span>
                          {t.illnessGroupTitle} ({illnessConditions.length})
                        </span>
                        {illnessGroupOpen ? (<IconChevronUp className="h-3.5 w-3.5"/>) : (<IconChevronDown className="h-3.5 w-3.5"/>)}
                      </button>
                      {illnessGroupOpen && (<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {illnessConditions.map((sym) => {
                        const checked = additionalSymptoms.includes(sym.id);
                        return (<label key={sym.id} className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium cursor-pointer transition ${checked
                                ? "border-teal-400 dark:border-teal-700 bg-teal-50/70 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"}`}>
                                <input type="checkbox" checked={checked} onChange={() => toggleAdditionalSymptom(sym.id)} className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-teal-600"/>
                                <span>
                                  {lang === "ru" ? sym.ru : lang === "en" ? sym.en : sym.uz}
                                </span>
                              </label>);
                    })}
                        </div>)}
                    </div>
                  </div>)}
              </div>

              {/* Collapsible Write-Your-Own Condition / Illness + Seriousness Rating */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 overflow-hidden">
                <button type="button" aria-expanded={customSectionOpen} onClick={() => setCustomSectionOpen((v) => !v)} className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-900/60 transition">
                  <span className="flex flex-wrap items-center gap-2">
                    <span>{t.customSectionTitle}</span>
                    {customConditions.length > 0 && (<span className="rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-800 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-300">
                        {customConditions.length}
                      </span>)}
                  </span>
                  {customSectionOpen ? (<IconChevronUp className="h-4 w-4 text-slate-500 shrink-0"/>) : (<IconChevronDown className="h-4 w-4 text-slate-500 shrink-0"/>)}
                </button>

                {customSectionOpen && (<div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-2.5">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <label htmlFor="custom-condition-name" className="sr-only">
                          {t.customNameLabel}
                        </label>
                        <input id="custom-condition-name" name="customConditionName" type="text" value={customConditionName} onChange={(e) => setCustomConditionName(e.target.value)} onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomCondition();
                    }
                }} placeholder={t.customNamePlaceholder} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"/>
                      </div>
                      <button type="button" disabled={!customConditionName.trim()} onClick={handleAddCustomCondition} className="inline-flex items-center justify-center gap-1 rounded-xl border border-teal-600 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 px-3.5 py-2 text-xs font-semibold text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 disabled:opacity-40 transition shrink-0">
                        <IconPlus className="h-3.5 w-3.5"/>
                        {t.customAddBtn}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        {t.customSeverityLabel}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {CONDITION_SEVERITY_OPTIONS.map((opt) => {
                    const active = customConditionSeverity === opt.value;
                    const label = lang === "ru" ? opt.ru : lang === "en" ? opt.en : opt.uz;
                    return (<button key={opt.value} type="button" aria-pressed={active} onClick={() => setCustomConditionSeverity(opt.value)} className={`rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold text-center transition ${active
                            ? `${opt.badgeClass} ring-2 ring-teal-500/40`
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"}`}>
                              {label}
                            </button>);
                })}
                      </div>
                    </div>

                    {customConditions.length > 0 && (<div className="flex flex-wrap gap-1.5 pt-1">
                        {customConditions.map((entry) => {
                        const sevMeta = getSeverityMeta(entry.severity);
                        const sevLabel = lang === "ru"
                            ? sevMeta.ru
                            : lang === "en"
                                ? sevMeta.en
                                : sevMeta.uz;
                        return (<span key={entry.id} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${sevMeta.badgeClass}`}>
                              <span>{entry.name}</span>
                              <span className="opacity-75">({sevLabel})</span>
                              <button type="button" aria-label={`${t.customRemoveAria}: ${entry.name}`} onClick={() => handleRemoveCustomCondition(entry.id)} className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10">
                                <IconX className="h-3 w-3"/>
                              </button>
                            </span>);
                    })}
                      </div>)}
                  </div>)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label htmlFor="patient-bp" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    <InfoTooltip label={t.bpLabel} explanation={t.bpTip}/>
                  </label>
                  <input id="patient-bp" name="bpReading" type="text" value={bpReading} onChange={(e) => setBpReading(e.target.value)} placeholder="120/80" className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 font-mono text-xs text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"/>
                </div>
                <div>
                  <label htmlFor="patient-notes" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t.notesLabel}
                  </label>
                  <input id="patient-notes" name="notes" type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.notesPlaceholder} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"/>
                </div>
              </div>

              <button type="submit" disabled={submittingSym} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-teal-600 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-teal-500 disabled:opacity-50 transition">
                <IconSend className="h-3.5 w-3.5"/>
                {submittingSym ? t.checkinSending : t.checkinBtn}
              </button>
            </form>

            {call.symptomCheckins.length > 0 && (<div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {call.symptomCheckins.map((sc) => {
                    const extraList = sc.additionalSymptoms ?? [];
                    const customList = sc.customConditions ?? [];
                    return (<div key={sc.id} className={`rounded-xl border p-3 text-xs space-y-1.5 ${sc.aiTriageLevel === "RED_EMERGENCY"
                            ? "border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200"
                            : sc.aiTriageLevel === "YELLOW"
                                ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200"
                                : "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200"}`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="inline-flex items-center gap-1">
                          <IconAlertOctagon className="h-3.5 w-3.5"/>
                          {sc.aiTriageLevel === "RED_EMERGENCY"
                            ? t.statusUrgent
                            : sc.aiTriageLevel === "YELLOW"
                                ? t.statusAttention
                                : t.statusNormal}{" "}
                          ({sc.bpReading})
                        </span>
                        <span className="font-mono text-[10px]">
                          {new Date(sc.createdAt).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                        </span>
                      </div>
                      <p>
                        {lang === "ru"
                            ? sc.aiAdviceRu
                            : lang === "en"
                                ? sc.aiAdviceEn
                                : sc.aiAdviceUz}
                      </p>
                      {(extraList.length > 0 || customList.length > 0) && (<div className="flex flex-wrap gap-1 pt-1">
                          {extraList.map((id) => (<span key={id} className="rounded-full bg-white/80 dark:bg-slate-900/70 border border-current/20 px-2 py-0.5 text-[10px] font-semibold">
                              {getSymptomLabel(id, lang)}
                            </span>))}
                          {customList.map((c) => {
                                const sev = getSeverityMeta(c.severity);
                                const sevLabel = lang === "ru" ? sev.ru : lang === "en" ? sev.en : sev.uz;
                                return (<span key={c.id} className="rounded-full bg-white/90 dark:bg-slate-900/80 border border-current/25 px-2 py-0.5 text-[10px] font-semibold">
                                {c.name} • {sevLabel}
                              </span>);
                            })}
                        </div>)}
                      {sc.notes && (<p className="text-[11px] opacity-85 italic">{sc.notes}</p>)}
                    </div>);
                })}
              </div>)}
          </section>

          {/* Hospital Results */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <IconFlask className="h-4 w-4 text-teal-600 dark:text-teal-400"/>
              <InfoTooltip label={t.labsTitle} explanation={t.labsTip}/>
            </h2>
            {(call.patient?.labReports ?? []).map((lab) => (<div key={lab.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-1.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{lab.panelName}</p>
                {(lab.results ?? []).map((r, idx) => {
                    const labTip = getLabTooltip(r.testName, lang);
                    return (<div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="text-slate-600 dark:text-slate-300">
                        {labTip ? (<InfoTooltip label={r.testName} explanation={labTip}/>) : (r.testName)}
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {r.value} {r.unit}{" "}
                        {r.flag !== "NORMAL" && (<span className="ml-1 text-[10px] text-rose-600 dark:text-rose-400">
                            ({t.flagAbnormal})
                          </span>)}
                      </span>
                    </div>);
                })}
              </div>))}
          </section>

          {/* 4-Digit Code / 1-Tap Visit Confirmation */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.confirmTitle}</h2>
            {call.status === "COMPLETED" ? (<div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <IconCircleCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400"/>
                {t.confirmedPrefix}{" "}
                {call.visitVerifiedAt
                    ? new Date(call.visitVerifiedAt).toLocaleString("en-GB")
                    : ""}
              </div>) : (<div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <label htmlFor="patient-otp" className="sr-only">
                    {t.visitCodeLabel}
                  </label>
                  <input id="patient-otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder={`${t.otpPlaceholder} ${call.patientOtpCode})`} maxLength={4} className="min-h-[44px] flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"/>
                  <button onClick={() => handleConfirmVisit("OTP_4DIGIT")} disabled={confirming || otpInput.length !== 4} className="min-h-[44px] rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-50">
                    {t.otpBtn}
                  </button>
                </div>
                <button onClick={() => handleConfirmVisit("ONE_TAP_PORTAL")} disabled={confirming} className="w-full min-h-[44px] rounded-xl border border-teal-600 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/50 py-2.5 text-xs font-bold text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 disabled:opacity-50">
                  {t.oneTapBtn}
                </button>
              </div>)}
          </section>
        </>)}

      {/* Active Medicines, Adherence & Telegram Reminders */}
      {activePrescriptions.length > 0 && (<section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <IconPill className="h-4 w-4 text-teal-600 dark:text-teal-400"/>
            {t.rxTitle}
          </h2>
          <div className="space-y-2.5">
            {activePrescriptions.map((rx) => {
                const draft = rxReminderDrafts[rx.id];
                const timesText = draft?.timesText ?? (rx.reminderTimes ?? []).join(", ");
                const remindersEnabled = draft?.enabled ?? rx.remindersEnabled !== false;
                return (<div key={rx.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {rx.medicationName} — {rx.dosage}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {rx.frequency} •{" "}
                        {lang === "ru"
                        ? rx.instructionsRu
                        : lang === "en"
                            ? rx.instructionsEn
                            : rx.instructionsUz}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {t.loggedDoses} {(rx.adherenceLogs ?? []).length}
                      </p>
                    </div>
                    <button type="button" onClick={() => handleAdherence(rx.id)} className="inline-flex items-center gap-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 px-3 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60">
                      <IconCheck className="h-3.5 w-3.5"/>
                      {t.takenBtn}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      <input type="checkbox" checked={remindersEnabled} onChange={(e) => setRxReminderDrafts((prev) => ({
                        ...prev,
                        [rx.id]: {
                            timesText,
                            enabled: e.target.checked,
                        },
                    }))} className="h-3.5 w-3.5 accent-teal-600"/>
                      <IconBell className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400"/>
                      <span>{t.rxReminderLabel}</span>
                    </label>
                    <input type="text" value={timesText} onChange={(e) => setRxReminderDrafts((prev) => ({
                        ...prev,
                        [rx.id]: {
                            timesText: e.target.value,
                            enabled: remindersEnabled,
                        },
                    }))} placeholder="08:00, 20:00" className="flex-1 min-w-[140px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1 text-xs font-mono text-slate-900 dark:text-slate-100"/>
                    <button type="button" disabled={savingRxId === rx.id} onClick={() => handleSaveRxReminder(rx)} className="rounded-lg bg-slate-900 dark:bg-teal-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-slate-800 dark:hover:bg-teal-500 disabled:opacity-50">
                      {savingRxId === rx.id ? "..." : t.rxSaveReminderBtn}
                    </button>
                  </div>
                </div>);
            })}
          </div>
        </section>)}

      {/* Perinatal Psychologist Support, Consent, Sessions & Direct Chat */}
      <section id="psychologist-support" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <IconHeartHandshake className="h-4 w-4 text-teal-600 dark:text-teal-400"/>
            {t.psychTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.psychSub}</p>
        </div>

        {psychologists.length === 0 ? (<p className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-xs text-slate-500 dark:text-slate-400">
            {t.psychEmpty}
          </p>) : (<>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {psychologists.map((psych) => {
                    const isSelected = psych.id === activePsychId;
                    const hasConsent = psychConsents.some((c) => c.psychologistId === psych.id && c.status === "ACTIVE");
                    return (<div key={psych.id} className={`rounded-xl border p-3 space-y-2 transition ${isSelected
                            ? "border-teal-600 bg-teal-50/40 dark:bg-teal-950/30"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <button type="button" onClick={() => setSelectedPsychId(psych.id)} className="text-left">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{psych.fullName}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">
                            {psych.specialty || psych.expertiseArea || "Perinatal"} • {psych.district}
                            {psych.experienceYears ? ` • ${psych.experienceYears} ${t.expYearsWord}` : ""}
                          </p>
                        </button>
                        {hasConsent && (<span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                            ACTIVE
                          </span>)}
                      </div>
                      <button type="button" disabled={psychActionBusy} onClick={() => handlePsychConsent(psych.id, !hasConsent)} className={`w-full rounded-lg px-2.5 py-1.5 text-[11px] font-bold border transition disabled:opacity-50 ${hasConsent
                            ? "border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100"
                            : "border-teal-600 bg-teal-700 text-white hover:bg-teal-800"}`}>
                        {hasConsent ? t.psychConsentWithdraw : t.psychConsentGrant}
                      </button>
                    </div>);
                })}
            </div>

            {activePsychId && (() => {
                    const selectedConsentActive = psychConsents.some((c) => c.psychologistId === activePsychId && c.status === "ACTIVE");
                    return (<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <form onSubmit={handleBookPsychSession} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3 space-y-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <IconCalendarEvent className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400"/>
                      {t.psychBookBtn}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={psychSessionType} onChange={(e) => setPsychSessionType(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100">
                        <option value="CHAT">Chat</option>
                        <option value="VOICE">Voice</option>
                        <option value="VIDEO">Video</option>
                        <option value="TELEGRAM_CALL">Telegram Call</option>
                      </select>
                      <input type="datetime-local" value={psychSessionAt} onChange={(e) => setPsychSessionAt(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100"/>
                    </div>
                    <input type="text" value={psychTopic} onChange={(e) => setPsychTopic(e.target.value)} placeholder={t.psychTopicPlaceholder} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"/>
                    <button type="submit" disabled={psychActionBusy || !selectedConsentActive} className="w-full rounded-lg bg-slate-900 dark:bg-teal-600 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-teal-500 disabled:opacity-50">
                      {t.psychBookBtn}
                    </button>
                  </form>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3 space-y-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.psychChatTitle}</p>
                    {!selectedConsentActive && (<p className="text-[11px] text-amber-700 dark:text-amber-300">
                        {t.psychConsentGrant}
                      </p>)}
                    <div className="max-h-36 overflow-y-auto space-y-1.5">
                      {psychChatMessages.length === 0 ? (<p className="text-[11px] text-slate-500 dark:text-slate-400">—</p>) : (psychChatMessages.map((m) => {
                            const isMine = m.senderUserId === authUser?.id || m.senderRole === "PATIENT";
                            return (<div key={m.id} className={`rounded-lg px-2.5 py-1.5 text-[11px] max-w-[90%] ${isMine
                                    ? "ml-auto bg-teal-600 text-white"
                                    : "mr-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"}`}>
                              <p className="font-bold text-[10px] opacity-80">{m.senderName}</p>
                              <p>{m.body}</p>
                            </div>);
                        }))}
                    </div>
                    <form onSubmit={handleSendPsychChat} className="flex gap-1.5">
                      <input type="text" value={psychChatBody} onChange={(e) => setPsychChatBody(e.target.value)} disabled={!selectedConsentActive} placeholder={t.psychChatPlaceholder} className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 disabled:opacity-50"/>
                      <button type="submit" disabled={sendingPsychChat || !selectedConsentActive || !psychChatBody.trim()} className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-50">
                        <IconSend className="h-3.5 w-3.5"/>
                      </button>
                    </form>
                  </div>
                </div>);
                })()}

            {psychSessions.length > 0 && (<div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.psychSessionsTitle}</p>
                {psychSessions.map((s) => (<div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {s.psychologist?.fullName || "Psychologist"}
                      </span>{" "}
                      <span className="text-slate-500 dark:text-slate-400">
                        • {s.sessionType} • {new Date(s.scheduledAt).toLocaleString("en-GB")}
                      </span>
                      {s.topic && <p className="text-[11px] text-slate-600 dark:text-slate-300">{s.topic}</p>}
                    </div>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {s.status}
                    </span>
                  </div>))}
              </div>)}
          </>)}
      </section>
    </div>);
}
