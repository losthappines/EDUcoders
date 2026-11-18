"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  IconAlertOctagon,
  IconArrowRight,
  IconBell,
  IconBrandTelegram,
  IconBrandYoutube,
  IconCalendarEvent,
  IconCamera,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconCrown,
  IconExternalLink,
  IconFlask,
  IconHeartHandshake,
  IconHeartbeat,
  IconKey,
  IconLock,
  IconMapPin,
  IconMessageCircle,
  IconPhoneCall,
  IconPill,
  IconPlus,
  IconRobot,
  IconSend,
  IconShieldCheck,
  IconStethoscope,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import AIComposer from "@/components/ui/ai-prompt-composer-with-model-selector";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
import { useStaffNav } from "@/components/AppShell";
import {
  DistributionDonutChart,
  StaffKpiCard,
  StaffWelcomeHeader,
  TrendsAreaChart,
} from "@/components/StaffAnalyticsWidgets";
import { AvatarPickerPanel, UserAvatar } from "@/components/UserAvatar";
import { Emergency103Banner } from "@/components/Emergency103Banner";
import { GpsConsentButton } from "@/components/GpsConsentButton";
import { SlaCountdownBadge } from "@/components/SlaCountdownBadge";
import { InfoTooltip } from "@/components/InfoTooltip";
import { VitalsTrendChart } from "@/components/VitalsTrendChart";
import { MotherEventsPanel } from "@/components/MotherEventsPanel";
import { OnalikDarslariPanel } from "@/components/OnalikDarslariPanel";
import {
  CONDITION_SEVERITY_OPTIONS,
  EXTENDED_SYMPTOMS_CATALOG,
  getSeverityMeta,
  getSymptomLabel,
  PRIMARY_RED_FLAG_SYMPTOMS,
} from "@/lib/symptoms-catalog";
import { VISIT_DESTINATION_OPTIONS } from "@/lib/geo";
import { PATIENT_PLANS } from "@/lib/subscriptions";
import { computeEpdsScore, EPDS_QUESTIONS, MOOD_SCALE } from "@/lib/wellbeing-catalog";

const WEEKDAYS_BY_LANG = {
  uz: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"],
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

const COPY = {
  uz: {
    loading: "Shaxsiy kabinet yuklanmoqda...",
    welcomePrefix: "Salom,",
    searchPlaceholder: "Dori, shikoyat, tadbir qidirish...",
    noCall:
      "Sizda hozircha shifoxonadan chiqish uy tashrifi yo'q, lekin shikoyat yuborishingiz, GPS lokatsiya ulashishingiz va shifokor bilan bog'lanishingiz mumkin.",
    kpiVisitLabel: "24 soatlik tashrif",
    kpiVisitActive: "Rejada",
    kpiVisitDone: "Tasdiqlangan",
    kpiVisitNone: "Faol emas",
    kpiMedsLabel: "Faol dorilar",
    kpiMedsSub: "ta qabul belgilangan",
    kpiWbLabel: "Kunlik check-in",
    kpiWbDone: "Bugun topshirildi ✓",
    kpiWbTodo: "Bugun kutilmoqda",
    kpiSupportLabel: "Seans va tadbirlar",
    kpiSupportSub: "faol jadval",
    trendTitle: "Ona salomatligi va faollik dinamikasi",
    trendSub: "Oxirgi 7 kunlik check-in va dori qabul ko'rsatkichlari",
    donutTitle: "Parvarish rejasi taqsimoti",
    donutCenterSub: "jami faollik",
    donutCheckins: "Check-inlar",
    donutMeds: "Dori qabuli",
    donutComplaints: "Shikoyatlar",
    donutSessions: "Psixolog seansi",
    profileCardTitle: "Shaxsiy profil va rasm",
    changePhotoBtn: "Profil rasmini tanlash / yuklash",
    quickActionsTitle: "Tezkor xizmatlar",
    quickOpenCare: "Check-in va GPS shikoyat",
    quickOpenAi: "AI Yordamchi bilan suhbat",
    quickOpenPsych: "Psixolog bilan seans",
    quickOpenLessons: "Onalik darslari videolari",
    doctorTitle: "Sizga biriktirilgan oilaviy shifokor",
    visitWindow: "Rejalashtirilgan tashrif vaqti:",
    visitCodeLabel: "Tasdiqlash kodi",
    visitCodeTip:
      "Shifokor uyingizga kelganda tashrifni tasdiqlash uchun ushbu 4 xonali kodni ko'rsating.",
    complaintCardTitle: "Shikoyat yuborish va paramedik/shifokor tashrif joyi (GPS)",
    complaintCardSub:
      "Shikoyatingiz eng yaqin mos shifokorga GPS orqali yuboriladi. Shifokor javob beradi, tanlangan joyga borib ko'radi va tashrifni tasdiqlaydi.",
    complaintCategoryLabel: "Yo'nalish",
    complaintSeverityLabel: "Holat jiddiyligi",
    complaintDestLabel: "Paramedik / shifokor qayerga kelsin?",
    complaintAddrLabel: "Aniq tashrif manzili",
    complaintAddrPlaceholder: "Ko'cha, uy, mo'ljal...",
    complaintDescLabel: "Shikoyatingizni yozing",
    complaintDescPlaceholder:
      "Masalan: Bosh aylanishi, qon bosimi ko'tarilishi yoki isitma...",
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
    checkinSending: "Yuborilmoqda...",
    checkinBtn: "Holatimni yuborish",
    statusNormal: "Yaxshi",
    statusAttention: "E'tibor bering",
    statusUrgent: "Zudlik bilan shifokor",
    rxTitle: "Sizga yozilgan dorilar",
    loggedDoses: "Belgilangan qabullar soni:",
    takenBtn: "Ichdim",
    labsTitle: "Shifoxona tahlillaringiz natijalari",
    labsTip:
      "Hb — qondagi gemoglobin darajasi; CRP — yallig'lanish belgisi; PLT — trombotsitlar.",
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
    wbUrgent103:
      "Shoshilinch 103 ogohlantirishi yuborildi! Iltimos, darhol 103 ga qo'ng'iroq qiling.",
    wbJumpSymptom: "Tibbiy shikoyat / belgilar bo'limiga o'tish ↓",
    wbSuggestPsych: "Psixolog bilan bepul suhbat boshlash ↓",
    rxReminderLabel: "Telegram eslatma vaqtlari (masalan: 08:00, 20:00)",
    rxSaveReminderBtn: "Vaqtni saqlash",
    rxReminderSavedOk: "Dori eslatma vaqtlari saqlandi!",
    psychTitle: "Psixolog bilan suhbat va seanslar",
    psychSub:
      "Shifoxona tahlillaringizdan alohida saqlanadigan maxfiy ruhiy qo'llab-quvvatlash",
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
    psychPrivacyNote:
      "Maxfiylik kafolati: Perinatal psixologlar hech qachon shifoxona EHR tashxislaringiz, JSHSHIR yoki laboratoriya tahlillaringizni ko'ra olmaydi.",
    psychSlotsLabel: "Mavjud qabul vaqtlari:",
    psychCancelBtn: "Bekor qilish",
    psychCancelledOk: "Seans bekor qilindi.",
    psychJoinBtn: "Seansga ulanish",
    psychQuickTopics: [
      "Uyqusizlik va charchoq",
      "Emizishdagi xavotir",
      "Kayfiyat o'zgarishi",
      "Oila bilan munosabat",
    ],
    aiTitle: "OnaCare AI Tibbiy Yordamchi",
    aiSubtitle:
      "Dorilaringiz, uy tashrifi, tug'ruqdan keyingi parvarish va chaqaloq parvarishi bo'yicha savollar bering",
    aiDisclaimer:
      "AI maslahati faqat ma'lumot uchundir; shoshilinch holatlarda darhol 103 ga qo'ng'iroq qiling yoki shifokoringizga yozing.",
    aiPlaceholder:
      "Savolingizni yozing... @medications yoki @visit deb context biriktirishingiz mumkin",
    aiThinking: "AI javob tayyorlamoqda...",
    aiEmptyTitle: "Salom! OnaCare AI yordamchisi tayyor.",
    aiEmptySub:
      "Pastdagi tezkor savollardan birini bosing yoki o'z savolingizni yozing.",
    aiUrgentBtn: "103 Tez Yordamga Qo'ng'iroq Qilish",
    aiStarters: [
      "Menga yozilgan dorilar va ichish vaqtlarim qanday? @medications",
      "24 soatlik uy tashrifi va shifokorim haqida ma'lumot bering @visit",
      "Tug'ruqdan keyin qaysi belgilarda darhol 103 ga murojaat qilish kerak?",
      "Bugungi kunlik parvarish rejamni tuzib bering",
    ],
  },
  ru: {
    loading: "Загрузка личного кабинета...",
    welcomePrefix: "Здравствуйте,",
    searchPlaceholder: "Поиск лекарств, жалоб, событий...",
    noCall:
      "У вас пока нет выписного визита, но вы можете отправить жалобу с GPS, выбрать место выезда и написать врачу.",
    kpiVisitLabel: "Визит 24ч",
    kpiVisitActive: "Ожидается",
    kpiVisitDone: "Подтвержден",
    kpiVisitNone: "Нет вызова",
    kpiMedsLabel: "Активные лекарства",
    kpiMedsSub: "приемов отмечено",
    kpiWbLabel: "Ежедневный чек-ин",
    kpiWbDone: "Выполнен сегодня ✓",
    kpiWbTodo: "Ожидает заполнения",
    kpiSupportLabel: "Сеансы и события",
    kpiSupportSub: "запланировано",
    trendTitle: "Динамика самочувствия и ухода",
    trendSub: "Показатели настроения и приемов за последние 7 дней",
    donutTitle: "Структура программы ухода",
    donutCenterSub: "активностей",
    donutCheckins: "Чек-ины",
    donutMeds: "Лекарства",
    donutComplaints: "Жалобы",
    donutSessions: "Психолог",
    profileCardTitle: "Личный профиль и фото",
    changePhotoBtn: "Добавить / выбрать фото профиля",
    quickActionsTitle: "Быстрые разделы",
    quickOpenCare: "Чек-ин и GPS жалоба",
    quickOpenAi: "Спросить ИИ-помощника",
    quickOpenPsych: "Сеансы с психологом",
    quickOpenLessons: "Видеоуроки Onalik darslari",
    doctorTitle: "Ваш семейный врач",
    visitWindow: "Ожидаемое время визита:",
    visitCodeLabel: "Код визита",
    visitCodeTip:
      "Назовите этот 4-значный код врачу или медсестре, когда они придут к вам домой.",
    complaintCardTitle: "Отправить жалобу и выбрать место выезда (GPS)",
    complaintCardSub:
      "Жалоба по GPS направляется ближайшему профильному врачу. Врач ответит, придет в выбранную точку и подтвердит осмотр.",
    complaintCategoryLabel: "Категория",
    complaintSeverityLabel: "Серьезность",
    complaintDestLabel: "Куда должен приехать парамедик / врач?",
    complaintAddrLabel: "Точный адрес визита",
    complaintAddrPlaceholder: "Улица, дом, ориентир...",
    complaintDescLabel: "Опишите вашу жалобу",
    complaintDescPlaceholder:
      "Например: головокружение, высокое давление или температура...",
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
    checkinSending: "Отправка...",
    checkinBtn: "Отправить самочувствие",
    statusNormal: "В норме",
    statusAttention: "Требует внимания",
    statusUrgent: "Срочно к врачу",
    rxTitle: "Назначенные лекарства",
    loggedDoses: "Отмечено приемов:",
    takenBtn: "Приняла",
    labsTitle: "Ваши результаты анализов из больницы",
    labsTip:
      "Hb — уровень гемоглобина; CRP — показатель воспаления; PLT — тромбоциты.",
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
    wbUrgent103:
      "Отправлено экстренное оповещение 103! Пожалуйста, немедленно позвоните 103.",
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
    remindersTitle: "Напоминания и расписание на сегодня",
    remindersMedItem: "Время приема лекарств:",
    remindersVisitItem: "24ч визит на дом:",
    remindersPsychItem: "Сеанс с психологом:",
    remindersWbDone: "Ежедневный чек-ин на сегодня выполнен ✓",
    remindersWbTodo: "Ежедневный чек-ин на сегодня еще не заполнен",
    remindersGoChat: "Чат с врачом / медсестрой →",
    psychPrivacyNote:
      "Гарантия конфиденциальности: перинатальные психологи не видят больничный EHR, ПИНФЛ и результаты анализов.",
    psychSlotsLabel: "Доступные слоты:",
    psychCancelBtn: "Отменить",
    psychCancelledOk: "Сеans отменен.",
    psychJoinBtn: "Подключиться",
    psychQuickTopics: [
      "Усталость и недосып",
      "Тревога при кормлении",
      "Перепады настроения",
      "Отношения с близкими",
    ],
    aiTitle: "ИИ-помощник OnaCare",
    aiSubtitle:
      "Задавайте вопросы о ваших лекарствах, домашнем визите и послеродовом уходе",
    aiDisclaimer:
      "ИИ-ответы носят справочный характер; в экстренных случаях немедленно звоните 103.",
    aiPlaceholder: "Задайте вопрос... Используйте @medications или @visit для контекста",
    aiThinking: "ИИ готовит ответ...",
    aiEmptyTitle: "Здравствуйте! ИИ-помощник OnaCare на связи.",
    aiEmptySub: "Выберите готовый вопрос ниже или напишите свой запрос.",
    aiUrgentBtn: "Позвонить в скорую 103",
    aiStarters: [
      "Какие лекарства мне назначены и когда их принимать? @medications",
      "Когда придет врач на домашний визит? @visit",
      "При каких тревожных симптомах нужно срочно звонить 103?",
      "Составь план ухода и восстановления на сегодня",
    ],
  },
  en: {
    loading: "Loading your portal...",
    welcomePrefix: "Welcome,",
    searchPlaceholder: "Search medicines, complaints, events...",
    noCall:
      "You have no hospital discharge visit scheduled right now, yet you can submit a complaint with GPS, pick a visit destination, and message a doctor.",
    kpiVisitLabel: "24h Home Visit",
    kpiVisitActive: "Scheduled",
    kpiVisitDone: "Completed",
    kpiVisitNone: "No active call",
    kpiMedsLabel: "Active Medicines",
    kpiMedsSub: "doses logged",
    kpiWbLabel: "Daily Check-in",
    kpiWbDone: "Completed today ✓",
    kpiWbTodo: "Due today",
    kpiSupportLabel: "Sessions & Events",
    kpiSupportSub: "upcoming items",
    trendTitle: "Recovery & Wellbeing Trend",
    trendSub: "7-day mother check-ins & adherence activity",
    donutTitle: "Care Plan Breakdown",
    donutCenterSub: "total actions",
    donutCheckins: "Check-ins",
    donutMeds: "Medications",
    donutComplaints: "Complaints",
    donutSessions: "Psych Sessions",
    profileCardTitle: "Profile & Picture",
    changePhotoBtn: "Add or choose profile picture",
    quickActionsTitle: "Quick Navigation",
    quickOpenCare: "Check-in & GPS Complaint",
    quickOpenAi: "Ask AI Assistant",
    quickOpenPsych: "Book Psychologist Session",
    quickOpenLessons: "Onalik darslari Videos",
    doctorTitle: "Your Assigned Family Doctor",
    visitWindow: "Expected Visit Window:",
    visitCodeLabel: "Visit Code",
    visitCodeTip:
      "Share this 4-digit confirmation code with your doctor when they arrive at your home.",
    complaintCardTitle:
      "Submit Complaint & Choose Paramedic / Doctor Visit Location (GPS)",
    complaintCardSub:
      "Your complaint matches the nearest specialist by GPS. The doctor responds, visits your chosen location, checks your health, and verifies the visit.",
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
    checkinSending: "Sending...",
    checkinBtn: "Send Daily Check-in",
    statusNormal: "Looking good",
    statusAttention: "Doctor will review",
    statusUrgent: "Urgent review",
    rxTitle: "Your Medicines",
    loggedDoses: "Doses logged:",
    takenBtn: "Mark Taken",
    labsTitle: "We reviewed your hospital results",
    labsTip:
      "Hb = Hemoglobin (iron/oxygen in blood); CRP = inflammation marker; PLT = platelets.",
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
    wbUrgent103:
      "Urgent 103 alert dispatched! Please call 103 emergency services right away.",
    wbJumpSymptom: "Go to Medical Symptoms & Complaint ↓",
    wbSuggestPsych: "Start Free Chat with a Psychologist ↓",
    rxReminderLabel: "Telegram Reminder Times (e.g. 08:00, 20:00)",
    rxSaveReminderBtn: "Save Times",
    rxReminderSavedOk: "Medication reminder times saved!",
    psychTitle: "Perinatal Psychologist & Sessions",
    psychSub:
      "Private emotional support kept strictly separate from hospital clinical EHR",
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
    psychPrivacyNote:
      "Privacy guarantee: Perinatal psychologists can never view your clinical EHR diagnoses, JSHSHIR, or lab test results.",
    psychSlotsLabel: "Available slots:",
    psychCancelBtn: "Cancel",
    psychCancelledOk: "Session cancelled.",
    psychJoinBtn: "Join Session",
    psychQuickTopics: [
      "Sleep exhaustion",
      "Feeding anxiety",
      "Mood swings",
      "Family support",
    ],
    aiTitle: "OnaCare AI Health Assistant",
    aiSubtitle:
      "Ask questions about your prescribed medicines, upcoming home visit, and postpartum care",
    aiDisclaimer:
      "AI answers are for informational guidance only; call 103 immediately for any medical emergency.",
    aiPlaceholder: "Ask anything... Use @medications or @visit for context",
    aiThinking: "AI is preparing an answer...",
    aiEmptyTitle: "Hi! Your OnaCare AI Assistant is ready.",
    aiEmptySub: "Pick a quick question below or type your own question.",
    aiUrgentBtn: "Call Emergency 103",
    aiStarters: [
      "What medications am I prescribed and when do I take them? @medications",
      "Tell me about my 24h home visit and assigned doctor @visit",
      "Which warning signs require calling 103 immediately?",
      "Create a simple postpartum recovery plan for today",
    ],
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
  const { authUser, data, loading, fetchWithAuth, refreshData, showToast, dataLoadedAtMs } =
    usePlatform();
  const { lang } = useLanguage();
  const { activeView, setActiveView, searchQuery, setSearchQuery, openAccountModal } =
    useStaffNav();

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
  const [psychSessionAt, setPsychSessionAt] = useState(() =>
    new Date(Date.now() + 24 * 3600000).toISOString().slice(0, 16)
  );
  const [psychTopic, setPsychTopic] = useState("");
  const [psychActionBusy, setPsychActionBusy] = useState(false);
  const [psychChatBody, setPsychChatBody] = useState("");
  const [sendingPsychChat, setSendingPsychChat] = useState(false);

  const [motherEvents, setMotherEvents] = useState([]);
  const [motherEventsLoading, setMotherEventsLoading] = useState(true);
  const [rsvpBusyId, setRsvpBusyId] = useState(null);

  const [aiMessages, setAiMessages] = useState([]);
  const [aiBusy, setAiBusy] = useState(false);
  const aiSeqRef = useRef(1);
  const aiEndRef = useRef(null);

  const loadMotherEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/community/events", {
        cache: "no-store",
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setMotherEvents(json.events || []);
      }
    } catch {
      // ignore events load failure
    } finally {
      setMotherEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/community/events", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json) setMotherEvents(json.events || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setMotherEventsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeCalls = useMemo(() => data?.activeCalls ?? [], [data?.activeCalls]);
  const call = activeCalls[0];
  const ownPatient = data?.patients?.[0];
  const complaints = useMemo(() => data?.complaints ?? [], [data?.complaints]);
  const directMessages = useMemo(() => data?.directMessages ?? [], [data?.directMessages]);
  const psychologists = useMemo(
    () => (data?.users ?? []).filter((u) => u.role === "PSYCHOLOGIST"),
    [data?.users]
  );
  const psychConsents = useMemo(() => data?.psychConsents ?? [], [data?.psychConsents]);
  const psychSessions = useMemo(() => data?.psychSessions ?? [], [data?.psychSessions]);
  const activePsychId = selectedPsychId || psychologists[0]?.id || "";
  const psychIdSet = useMemo(() => new Set(psychologists.map((p) => p.id)), [psychologists]);

  const doctorChatMessages = useMemo(
    () =>
      directMessages.filter(
        (m) =>
          !psychIdSet.has(m.senderUserId) &&
          !psychIdSet.has(m.recipientUserId) &&
          m.senderRole !== "PSYCHOLOGIST"
      ),
    [directMessages, psychIdSet]
  );
  const psychChatMessages = useMemo(
    () =>
      directMessages.filter(
        (m) =>
          activePsychId &&
          (m.senderUserId === activePsychId || m.recipientUserId === activePsychId)
      ),
    [directMessages, activePsychId]
  );

  const activePrescriptions = useMemo(() => {
    return ownPatient?.prescriptions ?? call?.patient?.prescriptions ?? [];
  }, [ownPatient?.prescriptions, call?.patient?.prescriptions]);

  const currentSubTier = authUser?.subscriptionTier || ownPatient?.subscriptionTier || "FREE";
  const currentAvatarUrl = data?.actor?.avatarUrl ?? authUser?.avatarUrl ?? null;
  const effectiveLat = gpsLat ?? authUser?.latitude ?? ownPatient?.latitude ?? null;
  const effectiveLng = gpsLng ?? authUser?.longitude ?? ownPatient?.longitude ?? null;
  const t = COPY[lang] || COPY.en;
  const q = searchQuery.trim().toLowerCase();

  const filteredPrescriptions = useMemo(() => {
    if (!q) return activePrescriptions;
    return activePrescriptions.filter((rx) =>
      `${rx.medicationName} ${rx.dosage} ${rx.frequency} ${rx.instructionsUz} ${rx.instructionsRu} ${rx.instructionsEn}`
        .toLowerCase()
        .includes(q)
    );
  }, [activePrescriptions, q]);

  const filteredComplaints = useMemo(() => {
    if (!q) return complaints;
    return complaints.filter((c) =>
      `${c.title} ${c.description} ${c.category} ${c.status} ${c.visitAddress} ${c.assignedDoctor?.fullName || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [complaints, q]);

  const physicalSymptoms = useMemo(
    () => EXTENDED_SYMPTOMS_CATALOG.filter((s) => s.category === "physical"),
    []
  );
  const illnessConditions = useMemo(
    () => EXTENDED_SYMPTOMS_CATALOG.filter((s) => s.category === "conditions"),
    []
  );

  const simulatedNow = data?.simState?.simulatedNow;
  const dateLabel = useMemo(() => {
    const baseDate = simulatedNow ? new Date(simulatedNow) : new Date();
    const locale = lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ";
    return baseDate.toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [simulatedNow, lang]);

  const wbCheckins = useMemo(
    () => ownPatient?.wellbeingCheckins ?? [],
    [ownPatient?.wellbeingCheckins]
  );

  const totalDosesLogged = useMemo(
    () =>
      activePrescriptions.reduce(
        (acc, rx) => acc + (Array.isArray(rx.adherenceLogs) ? rx.adherenceLogs.length : 0),
        0
      ),
    [activePrescriptions]
  );

  const trendSeries = useMemo(() => {
    const labels = WEEKDAYS_BY_LANG[lang] || WEEKDAYS_BY_LANG.en;
    const recent = [...wbCheckins].slice(0, 7).reverse();
    if (recent.length >= 2) {
      return labels.map((label, idx) => {
        const entry = recent[idx];
        const val = entry
          ? Math.max(1, Number(entry.mood) || 3) * 20
          : Math.max(20, 45 + (idx % 3) * 15);
        return { label, value: val };
      });
    }
    const baseScore = Math.max(40, Math.min(95, 55 + totalDosesLogged * 6));
    const weights = [0.68, 0.78, 0.74, 0.88, 0.82, 0.94, 1.0];
    return labels.map((label, idx) => ({
      label,
      value: Math.round(baseScore * weights[idx]),
    }));
  }, [wbCheckins, totalDosesLogged, lang]);

  const donutSegments = useMemo(
    () => [
      { label: t.donutCheckins, value: Math.max(1, wbCheckins.length), color: "#2585F5" },
      { label: t.donutMeds, value: Math.max(1, totalDosesLogged), color: "#16A34A" },
      { label: t.donutComplaints, value: complaints.length, color: "#F59E0B" },
      { label: t.donutSessions, value: psychSessions.length, color: "#6366F1" },
    ],
    [t, wbCheckins.length, totalDosesLogged, complaints.length, psychSessions.length]
  );

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
    } finally {
      setSharingGps(false);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaintDesc.trim()) return;
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
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatBody.trim()) return;
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
    } finally {
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
    } finally {
      setBuyingPlanCode(null);
    }
  };

  const toggleAdditionalSymptom = (id) => {
    setAdditionalSymptoms((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCustomCondition = () => {
    const trimmed = customConditionName.trim();
    if (!trimmed) return;
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
    if (!call) return;
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
        showToast(
          level === "RED_EMERGENCY" ? "error" : level === "YELLOW" ? "info" : "success",
          lang === "ru"
            ? json.checkin.aiAdviceRu
            : lang === "en"
              ? json.checkin.aiAdviceEn
              : json.checkin.aiAdviceUz
        );
        setNotes("");
        setCustomConditionName("");
        setCustomConditions([]);
        setAdditionalSymptoms([]);
      }
    } finally {
      setSubmittingSym(false);
    }
  };

  const handleConfirmVisit = async (method) => {
    if (!call) return;
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
    } finally {
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
      showToast(
        json.evaluation?.epdsSelfHarmFlag || json.evaluation?.hasPhysicalRedFlag
          ? "error"
          : "success",
        json.evaluation?.epdsSelfHarmFlag ? t.wbUrgent103 : t.wbSavedOk
      );
    } finally {
      setSubmittingWb(false);
    }
  };

  const handleSaveRxReminder = async (rx) => {
    setSavingRxId(rx.id);
    try {
      const draftVal = rxReminderDrafts[rx.id];
      const timesStr = draftVal?.timesText ?? (rx.reminderTimes ?? []).join(", ");
      const enabled = draftVal?.enabled ?? rx.remindersEnabled !== false;
      const reminderTimes = timesStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
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
    } finally {
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
    } finally {
      setPsychActionBusy(false);
    }
  };

  const handleBookPsychSession = async (e) => {
    e.preventDefault();
    if (!activePsychId) return;
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
    } finally {
      setPsychActionBusy(false);
    }
  };

  const handleSendPsychChat = async (e) => {
    e.preventDefault();
    if (!psychChatBody.trim() || !activePsychId) return;
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
    } finally {
      setSendingPsychChat(false);
    }
  };

  const handleMotherEventRsvp = async (eventId, status) => {
    setRsvpBusyId(eventId);
    try {
      const res = await fetchWithAuth("/api/community/events", {
        method: "POST",
        body: JSON.stringify({ action: "TOGGLE_RSVP", eventId, status }),
      });
      if (res.ok) {
        await loadMotherEvents();
        showToast("success", "✓");
      }
    } finally {
      setRsvpBusyId(null);
    }
  };

  const handleCancelPsychSession = async (sessionId) => {
    setPsychActionBusy(true);
    try {
      const res = await fetchWithAuth("/api/psychologist/sessions", {
        method: "POST",
        body: JSON.stringify({ action: "CANCEL_SESSION", sessionId }),
      });
      if (res.ok) {
        await refreshData();
        showToast("success", t.psychCancelledOk);
      }
    } finally {
      setPsychActionBusy(false);
    }
  };

  const handleAiChatSubmit = async (submission) => {
    const promptText = String(submission?.prompt || "").trim();
    const filesList = Array.isArray(submission?.attachedFiles)
      ? submission.attachedFiles
      : [];
    if (!promptText && filesList.length === 0) return;

    const userId = `ai-u-${aiSeqRef.current++}`;
    const userMsg = {
      id: userId,
      sender: "user",
      text: promptText || filesList.join(", "),
      mode: submission?.mode || "Ask",
      modelName: submission?.modelName || "Gemini 3.5 Flash",
      attachedFiles: filesList,
    };
    const historySnapshot = aiMessages.slice(-8).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    setAiMessages((prev) => [...prev, userMsg]);
    setAiBusy(true);
    setTimeout(
      () => aiEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
      60
    );

    try {
      const res = await fetchWithAuth("/api/ai/patient-chat", {
        method: "POST",
        body: JSON.stringify({
          message: promptText,
          mode: submission?.mode || "Ask",
          modelId: submission?.modelId || "gemini-3.5-flash",
          effort: submission?.effort || "High",
          attachedFiles: filesList,
          history: historySnapshot,
          lang,
        }),
      });
      const json = await res.json().catch(() => ({}));
      const botId = `ai-b-${aiSeqRef.current++}`;
      if (!res.ok) {
        showToast("error", json.error || "Could not reach AI assistant");
        setAiMessages((prev) => [
          ...prev,
          {
            id: botId,
            sender: "assistant",
            text:
              json.error ||
              "Kechirasiz, javob olishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.",
            urgentAlert103: false,
            suggestedQuestions: [],
            modelUsed: "system",
          },
        ]);
        return;
      }
      setAiMessages((prev) => [
        ...prev,
        {
          id: botId,
          sender: "assistant",
          text: json.reply,
          urgentAlert103: Boolean(json.urgentAlert103),
          suggestedQuestions: Array.isArray(json.suggestedQuestions)
            ? json.suggestedQuestions
            : [],
          modelUsed: json.modelUsed || "gemini-3.5-flash",
          provider: json.provider || "gemini",
        },
      ]);
      setTimeout(
        () => aiEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        80
      );
    } finally {
      setAiBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-8 text-center text-sm text-slate-600 dark:text-slate-300">
        {t.loading}
      </div>
    );
  }

  const wbEpdsPreview = wbEpdsOpen ? computeEpdsScore(wbEpdsAnswers) : null;
  const baseNowMs = simulatedNow ? new Date(simulatedNow).getTime() : dataLoadedAtMs;
  const todayTashkent = baseNowMs
    ? new Date(baseNowMs + 5 * 3600000).toISOString().slice(0, 10)
    : "";
  const hasWellbeingToday =
    Boolean(todayTashkent) &&
    wbCheckins.some((w) => String(w.createdAt || "").slice(0, 10) === todayTashkent);
  const scheduledMeds = filteredPrescriptions.filter(
    (rx) =>
      rx.active !== false && rx.remindersEnabled !== false && (rx.reminderTimes ?? []).length > 0
  );
  const upcomingPsych = psychSessions.filter(
    (s) => s.status === "SCHEDULED" || s.status === "CONFIRMED"
  );
  const activeEventsCount = motherEvents.filter(
    (e) => e.status === "IN_PROGRESS" || e.status === "BEING_ADDED"
  ).length;
  const displayName = ownPatient?.fullName ?? authUser?.fullName ?? "";
  const firstName = displayName.split(" ")[0] || displayName;

  const visitCardValue = !call
    ? t.kpiVisitNone
    : call.status === "COMPLETED"
      ? t.kpiVisitDone
      : t.kpiVisitActive;

  const totalActions = donutSegments.reduce((acc, s) => acc + s.value, 0);

  return (
    <div className="space-y-5 oc-fade-up">
      <Emergency103Banner />

      <StaffWelcomeHeader
        greeting={`${t.welcomePrefix} ${firstName}!`}
        dateLabel={dateLabel}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t.searchPlaceholder}
      />

      {/* VIEW: DASHBOARD OVERVIEW */}
      {activeView === "dashboard" && (
        <div className="space-y-5">
          {/* 4 KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StaffKpiCard
              icon={<IconStethoscope className="h-5 w-5" />}
              label={t.kpiVisitLabel}
              value={visitCardValue}
              sublabel={call?.assignedDoctor?.fullName || ownPatient?.polyclinicName || ""}
              tone="blue"
              onClick={() => setActiveView("care")}
            />
            <StaffKpiCard
              icon={<IconPill className="h-5 w-5" />}
              label={t.kpiMedsLabel}
              value={activePrescriptions.length}
              sublabel={`${totalDosesLogged} ${t.kpiMedsSub}`}
              tone="green"
              onClick={() => setActiveView("care")}
            />
            <StaffKpiCard
              icon={<IconHeartbeat className="h-5 w-5" />}
              label={t.kpiWbLabel}
              value={wbCheckins.length}
              sublabel={hasWellbeingToday ? t.kpiWbDone : t.kpiWbTodo}
              tone={hasWellbeingToday ? "teal" : "amber"}
              onClick={() => setActiveView("care")}
            />
            <StaffKpiCard
              icon={<IconCalendarEvent className="h-5 w-5" />}
              label={t.kpiSupportLabel}
              value={upcomingPsych.length + activeEventsCount}
              sublabel={t.kpiSupportSub}
              tone="blue"
              onClick={() => setActiveView("events")}
            />
          </div>

          {/* 2-Card Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <TrendsAreaChart
                title={t.trendTitle}
                subtitle={t.trendSub}
                series={trendSeries}
                unit="%"
              />
            </div>
            <div className="lg:col-span-5">
              <DistributionDonutChart
                title={t.donutTitle}
                centerValue={totalActions}
                centerLabel={t.donutCenterSub}
                segments={donutSegments}
              />
            </div>
          </div>

          {/* Reminders + Profile & Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Today's Reminders & Active Medications */}
            <section className="lg:col-span-7 rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <IconBell className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
                  <span>{t.remindersTitle}</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveView("care")}
                  className="inline-flex min-h-[36px] items-center text-xs sm:text-sm font-semibold text-[#1D6CE0] dark:text-sky-300 hover:underline underline-offset-4"
                >
                  {t.remindersGoChat}
                </button>
              </div>

              <div className="space-y-2.5 text-sm">
                <div
                  className={`rounded-xl border px-4 py-3 font-medium ${
                    hasWellbeingToday
                      ? "border-[#CFE3FB] dark:border-sky-800 bg-[#EBF4FF] dark:bg-sky-950/40 text-[#1D6CE0] dark:text-sky-200"
                      : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200"
                  }`}
                >
                  {hasWellbeingToday ? t.remindersWbDone : t.remindersWbTodo}
                </div>

                {call && call.status !== "COMPLETED" && (
                  <div className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {t.remindersVisitItem} {call.assignedDoctor?.fullName} •{" "}
                      {new Date(call.scheduledWindowStart).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      –
                      {new Date(call.scheduledWindowEnd).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="font-mono font-bold text-[#1D6CE0] dark:text-sky-300 bg-white dark:bg-[#101E21] px-2.5 py-1 rounded-lg border border-[#E3ECF3] dark:border-[#1E353A]">
                      OTP: {call.patientOtpCode}
                    </span>
                  </div>
                )}

                {scheduledMeds.map((rx) => (
                  <div
                    key={`rem-${rx.id}`}
                    className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-4 py-3 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {t.remindersMedItem} {rx.medicationName} ({rx.dosage})
                      </span>
                      <span className="ml-2 font-mono text-xs sm:text-sm text-[#1D6CE0] dark:text-sky-300">
                        {(rx.reminderTimes ?? []).join(", ")}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAdherence(rx.id)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#1D6CE0] hover:bg-[#1758BA] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white active:scale-[0.98] transition-all"
                    >
                      <IconCheck className="h-4 w-4" />
                      {t.takenBtn}
                    </button>
                  </div>
                ))}

                {upcomingPsych.map((s) => (
                  <div
                    key={`rem-psych-${s.id}`}
                    className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-4 py-3 flex flex-wrap items-center justify-between gap-2"
                  >
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {t.remindersPsychItem} {s.psychologist?.fullName || "Psychologist"}
                    </span>
                    <span className="font-mono text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {new Date(s.scheduledAt).toLocaleString("en-GB", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Right: Profile Card with Avatar Picker CTA & Quick Navigation */}
            <section className="lg:col-span-5 rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  {t.profileCardTitle}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <IconCrown className="h-3.5 w-3.5" />
                  {currentSubTier}
                </span>
              </div>

              <div className="flex items-center gap-3.5 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-3.5">
                <div className="relative shrink-0">
                  <UserAvatar avatarUrl={currentAvatarUrl} fullName={displayName} size="lg" />
                  <button
                    type="button"
                    onClick={openAccountModal}
                    aria-label={t.changePhotoBtn}
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1D6CE0] text-white border-2 border-white dark:border-[#091315] shadow-xs hover:bg-[#1758BA]"
                  >
                    <IconCamera className="h-3 w-3" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {ownPatient?.district || authUser?.district || "Toshkent"}
                    {ownPatient?.polyclinicName ? ` • ${ownPatient.polyclinicName}` : ""}
                  </p>
                  <button
                    type="button"
                    onClick={openAccountModal}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#1D6CE0] dark:text-sky-300 hover:underline underline-offset-4"
                  >
                    <IconCamera className="h-3.5 w-3.5" />
                    <span>{t.changePhotoBtn}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t.quickActionsTitle}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveView("care")}
                    className="flex items-center justify-between rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2.5 min-h-[42px] text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-[#2585F5] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <IconHeartbeat className="h-4 w-4 text-[#1D6CE0]" />
                      <span>{t.quickOpenCare}</span>
                    </span>
                    <IconArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView("chatbot")}
                    className="flex items-center justify-between rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2.5 min-h-[42px] text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-[#2585F5] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <IconRobot className="h-4 w-4 text-[#16A34A]" />
                      <span>{t.quickOpenAi}</span>
                    </span>
                    <IconArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView("psych")}
                    className="flex items-center justify-between rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2.5 min-h-[42px] text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-[#2585F5] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <IconHeartHandshake className="h-4 w-4 text-indigo-600" />
                      <span>{t.quickOpenPsych}</span>
                    </span>
                    <IconArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView("lessons")}
                    className="flex items-center justify-between rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2.5 min-h-[42px] text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-[#2585F5] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <IconBrandYoutube className="h-4 w-4 text-rose-600" />
                      <span>{t.quickOpenLessons}</span>
                    </span>
                    <IconArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Mother Events Summary (In Progress & Being Added) */}
          <MotherEventsPanel
            mode="summary"
            events={motherEvents}
            loading={motherEventsLoading}
            onRsvp={handleMotherEventRsvp}
            rsvpBusyId={rsvpBusyId}
            onOpenAllEvents={() => setActiveView("events")}
            authUser={authUser}
          />
        </div>
      )}

      {/* VIEW: HEALTH CHECK-INS, MEDICATIONS, COMPLAINTS & DOCTOR CHAT */}
      {activeView === "care" && (
        <div className="space-y-5 oc-fade-up">
          {/* Active Medicines, Adherence & Telegram Reminders */}
          {filteredPrescriptions.length > 0 && (
            <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3.5">
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <IconPill className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
                {t.rxTitle}
              </h2>
              <div className="space-y-3">
                {filteredPrescriptions.map((rx) => {
                  const draft = rxReminderDrafts[rx.id];
                  const timesText = draft?.timesText ?? (rx.reminderTimes ?? []).join(", ");
                  const remindersEnabled = draft?.enabled ?? rx.remindersEnabled !== false;
                  return (
                    <div
                      key={rx.id}
                      className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {rx.medicationName} — {rx.dosage}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                            {rx.frequency} •{" "}
                            {lang === "ru"
                              ? rx.instructionsRu
                              : lang === "en"
                                ? rx.instructionsEn
                                : rx.instructionsUz}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {t.loggedDoses} {(rx.adherenceLogs ?? []).length}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAdherence(rx.id)}
                          className="min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-[#EBF4FF] dark:bg-sky-950/60 px-4 py-2 text-sm font-semibold text-[#1D6CE0] dark:text-sky-200 border border-[#CFE3FB] dark:border-sky-800 hover:bg-sky-100 active:scale-[0.98] transition-all"
                        >
                          <IconCheck className="h-4 w-4" />
                          {t.takenBtn}
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-[#E3ECF3] dark:border-[#1E353A]">
                        <label className="min-h-[40px] inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={remindersEnabled}
                            onChange={(e) =>
                              setRxReminderDrafts((prev) => ({
                                ...prev,
                                [rx.id]: {
                                  timesText,
                                  enabled: e.target.checked,
                                },
                              }))
                            }
                            className="h-4 w-4 accent-[#1D6CE0]"
                          />
                          <IconBell className="h-4 w-4 text-[#1D6CE0] dark:text-sky-300" />
                          <span>{t.rxReminderLabel}</span>
                        </label>
                        <input
                          type="text"
                          value={timesText}
                          onChange={(e) =>
                            setRxReminderDrafts((prev) => ({
                              ...prev,
                              [rx.id]: {
                                timesText: e.target.value,
                                enabled: remindersEnabled,
                              },
                            }))
                          }
                          placeholder="08:00, 20:00"
                          className="flex-1 min-w-[150px] min-h-[44px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3 py-2 text-base sm:text-sm font-mono text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          disabled={savingRxId === rx.id}
                          onClick={() => handleSaveRxReminder(rx)}
                          className="min-h-[44px] rounded-xl bg-[#1D6CE0] hover:bg-[#1758BA] px-4 py-2 text-xs sm:text-sm font-bold text-white active:scale-[0.98] disabled:opacity-50 transition-all"
                        >
                          {savingRxId === rx.id ? "..." : t.rxSaveReminderBtn}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Daily Wellbeing & EPDS Check-in Card */}
          <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <IconHeartHandshake className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
                  <span>{t.wbTitle}</span>
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{t.wbSub}</p>
              </div>
              {ownPatient?.deliveryDate && (
                <span className="rounded-full bg-[#EBF4FF] dark:bg-[#16272B] border border-[#CFE3FB] dark:border-[#1E353A] px-3 py-1 text-xs font-mono font-semibold text-[#1D6CE0] dark:text-sky-300">
                  {String(ownPatient.deliveryDate).slice(0, 10)}
                </span>
              )}
            </div>

            <form onSubmit={handleWellbeingSubmit} className="space-y-4">
              <div className="space-y-2">
                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {t.wbMoodLabel}
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {MOOD_SCALE.map((m) => {
                    const active = wbMood === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setWbMood(m.value)}
                        className={`flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-xl border py-2.5 px-1.5 text-center transition-all active:scale-[0.97] ${
                          active
                            ? "border-[#1D6CE0] bg-[#EBF4FF] dark:bg-sky-950/60 text-[#1D6CE0] dark:text-sky-200 ring-1 ring-[#1D6CE0]"
                            : "border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] text-slate-600 dark:text-slate-300 hover:border-[#2585F5]/50"
                        }`}
                      >
                        <span className="text-xl sm:text-2xl leading-none">{m.emoji}</span>
                        <span className="text-xs font-semibold truncate max-w-full">
                          {lang === "ru" ? m.ru : lang === "en" ? m.en : m.uz}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    {t.wbPainLabel}
                  </label>
                  <select
                    value={wbMotherPain}
                    onChange={(e) => setWbMotherPain(e.target.value)}
                    className="min-h-[46px] w-full rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-slate-100 focus:border-[#2585F5] focus:outline-none"
                  >
                    <option value="none">Yo&apos;q / None</option>
                    <option value="mild">Biroz / Mild</option>
                    <option value="severe">Kuchli / Severe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    {t.wbBleedingLabel}
                  </label>
                  <select
                    value={wbMotherBleeding}
                    onChange={(e) => setWbMotherBleeding(e.target.value)}
                    className="min-h-[46px] w-full rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-slate-100 focus:border-[#2585F5] focus:outline-none"
                  >
                    <option value="normal">Me&apos;yorda / Normal</option>
                    <option value="heavy">Ko&apos;p / Heavy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    {t.wbFeedLabel}
                  </label>
                  <select
                    value={wbBabyFeeding}
                    onChange={(e) => setWbBabyFeeding(e.target.value)}
                    className="min-h-[46px] w-full rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-slate-100 focus:border-[#2585F5] focus:outline-none"
                  >
                    <option value="good">Yaxshi / Good</option>
                    <option value="less">Kam / Less</option>
                    <option value="refusing">Rad etmoqda / Refusing</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-sm">
                <label className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 cursor-pointer text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={wbMotherFever}
                    onChange={(e) => setWbMotherFever(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 accent-[#1D6CE0]"
                  />
                  <span>{t.wbFeverLabel}</span>
                </label>
                <label className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 cursor-pointer text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={wbBabyJaundice}
                    onChange={(e) => setWbBabyJaundice(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 accent-[#1D6CE0]"
                  />
                  <span>{t.wbJaundiceLabel}</span>
                </label>
                <label className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 cursor-pointer text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={wbBabyTempHigh}
                    onChange={(e) => setWbBabyTempHigh(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 accent-[#1D6CE0]"
                  />
                  <span>{t.wbBabyTempLabel}</span>
                </label>
              </div>

              {!ownPatient?.deliveryDate && (
                <div>
                  <label
                    htmlFor="wb-delivery"
                    className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    {t.wbDeliveryLabel}
                  </label>
                  <input
                    id="wb-delivery"
                    type="date"
                    value={wbDeliveryDate}
                    onChange={(e) => setWbDeliveryDate(e.target.value)}
                    className="min-h-[46px] w-full sm:w-auto rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-slate-100 focus:border-[#2585F5] focus:outline-none"
                  />
                </div>
              )}

              <div className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setWbEpdsOpen((v) => !v)}
                  className="w-full min-h-[48px] flex items-center justify-between px-4 py-3 text-left text-sm font-semibold text-[#1D6CE0] dark:text-sky-300 hover:bg-[#EBF4FF]/60 dark:hover:bg-[#16272B] transition-colors"
                >
                  <span>
                    {t.wbEpdsToggle}
                    {wbEpdsPreview ? ` (${wbEpdsPreview.totalScore}/30)` : ""}
                  </span>
                  {wbEpdsOpen ? (
                    <IconChevronUp className="h-5 w-5" />
                  ) : (
                    <IconChevronDown className="h-5 w-5" />
                  )}
                </button>
                {wbEpdsOpen && (
                  <div className="border-t border-[#E3ECF3] dark:border-[#1E353A] p-4 space-y-4 oc-slide-down">
                    {EPDS_QUESTIONS.map((qItem, qIdx) => (
                      <div key={qItem.index} className="space-y-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {lang === "ru" ? qItem.ru : lang === "en" ? qItem.en : qItem.uz}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {qItem.options.map((opt) => {
                            const selected = wbEpdsAnswers[qIdx] === opt.score;
                            return (
                              <button
                                key={opt.score}
                                type="button"
                                onClick={() =>
                                  setWbEpdsAnswers((prev) =>
                                    prev.map((v, idx) => (idx === qIdx ? opt.score : v))
                                  )
                                }
                                className={`text-left min-h-[44px] rounded-xl border px-3.5 py-2 text-sm transition-all active:scale-[0.98] ${
                                  selected
                                    ? "border-[#1D6CE0] bg-[#1D6CE0] text-white font-semibold shadow-xs"
                                    : "border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] text-slate-700 dark:text-slate-200"
                                }`}
                              >
                                {lang === "ru" ? opt.ru : lang === "en" ? opt.en : opt.uz}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingWb}
                className="w-full min-h-[48px] rounded-xl bg-[#1D6CE0] hover:bg-[#1758BA] active:scale-[0.98] py-3 text-base sm:text-sm font-bold text-white disabled:opacity-50 transition-all shadow-sm"
              >
                {submittingWb ? "..." : t.wbSubmitBtn}
              </button>
            </form>

            {wbResult && (
              <div className="space-y-2.5 oc-fade-in">
                {(wbResult.epdsSelfHarmFlag || wbResult.hasPhysicalRedFlag) && (
                  <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4 text-sm text-rose-800 dark:text-rose-200 space-y-2.5">
                    <p className="font-bold">{t.wbUrgent103}</p>
                    <div className="flex flex-wrap gap-2.5">
                      <a
                        href="tel:103"
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700"
                      >
                        <IconPhoneCall className="h-4 w-4" /> 103
                      </a>
                      <a
                        href="#symptom-checkin-section"
                        className="inline-flex min-h-[44px] items-center rounded-xl border border-rose-300 bg-white px-4 py-2 font-semibold text-rose-800"
                      >
                        {t.wbJumpSymptom}
                      </a>
                    </div>
                  </div>
                )}
                {wbResult.suggestPsychologist && (
                  <button
                    type="button"
                    onClick={() => setActiveView("psych")}
                    className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-[#1D6CE0] dark:text-sky-300 hover:underline"
                  >
                    {t.wbSuggestPsych}
                  </button>
                )}
              </div>
            )}

            {wbCheckins.length > 0 && <VitalsTrendChart records={wbCheckins} mode="mood" />}
          </section>

          {/* Complaint Submission + Paramedic Destination & GPS */}
          <section
            id="symptom-checkin-section"
            className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <IconStethoscope className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
                  {t.complaintCardTitle}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {t.complaintCardSub}
                </p>
              </div>
              <GpsConsentButton
                label={sharingGps ? "..." : t.shareGpsBtn}
                busy={sharingGps}
                className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#CFE3FB] dark:border-sky-800 bg-[#EBF4FF] dark:bg-sky-950/60 px-4 py-2 text-sm font-semibold text-[#1D6CE0] dark:text-sky-200 hover:bg-sky-100 active:scale-[0.98] transition-all disabled:opacity-50 shrink-0"
                onLocationCaptured={handleLocationCaptured}
                onError={() => showToast("error", "Could not access browser GPS location")}
              />
            </div>

            <form onSubmit={handleComplaintSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="comp-category"
                    className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    {t.complaintCategoryLabel}
                  </label>
                  <select
                    id="comp-category"
                    value={complaintCategory}
                    onChange={(e) => setComplaintCategory(e.target.value)}
                    className="min-h-[46px] w-full rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-slate-100 focus:border-[#2585F5] focus:outline-none"
                  >
                    <option value="POSTPARTUM">Postpartum / Tug&apos;ruqdan keyingi</option>
                    <option value="CARDIO">Cardio / Qon bosimi</option>
                    <option value="PEDIATRIC">Pediatric / Chaqaloq parvarishi</option>
                    <option value="GENERAL">General / Umumiy terapevt</option>
                    <option value="EMERGENCY">Emergency / Shoshilinch holat</option>
                    <option value="OTHER">Other / Boshqa</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="comp-severity"
                    className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
                  >
                    {t.complaintSeverityLabel}
                  </label>
                  <select
                    id="comp-severity"
                    value={complaintSeverity}
                    onChange={(e) => setComplaintSeverity(e.target.value)}
                    className="min-h-[46px] w-full rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-slate-100 focus:border-[#2585F5] focus:outline-none"
                  >
                    <option value="MILD">MILD</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="SEVERE">SEVERE</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {t.complaintDestLabel}
                </span>
                <div className="flex flex-wrap gap-2">
                  {VISIT_DESTINATION_OPTIONS.map((opt) => {
                    const active = complaintDest === opt.value;
                    const label = lang === "ru" ? opt.ru : lang === "en" ? opt.en : opt.uz;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setComplaintDest(opt.value)}
                        className={`min-h-[44px] rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all active:scale-[0.98] ${
                          active
                            ? "border-[#1D6CE0] bg-[#1D6CE0] text-white shadow-xs"
                            : "border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] text-slate-700 dark:text-slate-200 hover:bg-[#EBF4FF] dark:hover:bg-[#16272B]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="comp-address"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  {t.complaintAddrLabel}
                </label>
                <input
                  id="comp-address"
                  type="text"
                  value={complaintAddr}
                  onChange={(e) => setComplaintAddr(e.target.value)}
                  placeholder={ownPatient?.address || t.complaintAddrPlaceholder}
                  className="min-h-[46px] w-full rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#2585F5] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="comp-desc"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
                >
                  {t.complaintDescLabel}
                </label>
                <textarea
                  id="comp-desc"
                  rows={3}
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  placeholder={t.complaintDescPlaceholder}
                  required
                  className="min-h-[88px] w-full rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#2585F5] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingComplaint || !complaintDesc.trim()}
                className="w-full inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#1D6CE0] hover:bg-[#1758BA] py-3 text-base sm:text-sm font-bold text-white active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm"
              >
                <IconSend className="h-4 w-4" />
                {submittingComplaint ? t.complaintSubmitting : t.complaintSubmitBtn}
              </button>
            </form>

            {filteredComplaints.length > 0 && (
              <div className="pt-4 border-t border-[#E3ECF3] dark:border-[#1E353A] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t.complaintsListTitle} ({filteredComplaints.length})
                </h3>
                {filteredComplaints.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-4 space-y-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{c.title}</span>
                        <span className="rounded-full bg-slate-200/80 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                          {c.category} • {c.severity}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                          c.status === "VERIFIED_COMPLETED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                            : c.status === "EN_ROUTE" || c.status === "ARRIVED"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                              : "bg-[#EBF4FF] text-[#1D6CE0] dark:bg-sky-950/70 dark:text-sky-300"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {c.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      <span>
                        <IconMapPin className="inline h-3.5 w-3.5 mr-1" />
                        {c.visitDestination}: {c.visitAddress}
                      </span>
                      {c.visitOtpCode && (
                        <span className="font-mono font-bold text-[#1D6CE0] dark:text-sky-300">
                          OTP: {c.visitOtpCode}
                        </span>
                      )}
                      {typeof c.distanceKm === "number" && (
                        <span>
                          {t.distanceLabel} <strong>{c.distanceKm} km</strong>
                        </span>
                      )}
                    </div>
                    {c.assignedDoctor && (
                      <div className="rounded-xl bg-white dark:bg-[#101E21] border border-[#E3ECF3] dark:border-[#1E353A] p-3 text-xs sm:text-sm">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {t.matchedDocLabel} {c.assignedDoctor.fullName}
                        </span>{" "}
                        {c.assignedDoctor.specialty ? `(${c.assignedDoctor.specialty})` : ""}
                        {c.assignedDoctor.expertiseArea
                          ? ` • ${c.assignedDoctor.expertiseArea}`
                          : ""}
                        {typeof c.assignedDoctor.experienceYears === "number"
                          ? ` • ${c.assignedDoctor.experienceYears} ${t.expYearsWord}`
                          : ""}
                        {c.doctorResponse && (
                          <p className="mt-1.5 text-[#1D6CE0] dark:text-sky-300 font-medium">
                            {t.docReplyLabel} {c.doctorResponse}
                          </p>
                        )}
                      </div>
                    )}
                    {c.status === "VERIFIED_COMPLETED" && (
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-3 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                        <p className="font-bold flex items-center gap-1.5">
                          <IconCircleCheck className="h-4 w-4" />
                          {t.verifiedBanner}
                        </p>
                        {c.verifiedVitals && (
                          <p className="font-mono mt-1">
                            BP {c.verifiedVitals.systolicBp}/{c.verifiedVitals.diastolicBp} • HR{" "}
                            {c.verifiedVitals.heartRate} • {c.verifiedVitals.tempC}°C • SpO2{" "}
                            {c.verifiedVitals.spo2}%
                          </p>
                        )}
                        {c.visitVerificationNote && (
                          <p className="mt-1">{c.visitVerificationNote}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Direct Advice Chat with Assigned Doctor */}
          <section
            id="doctor-direct-chat"
            className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <IconMessageCircle className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
                  {t.chatTitle}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{t.chatSub}</p>
              </div>
              <Link
                href="/telegram"
                className="inline-flex min-h-[40px] items-center text-sm font-semibold text-[#1D6CE0] dark:text-sky-300 hover:underline"
              >
                {t.telegramCta} →
              </Link>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2.5 rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-3.5">
              {doctorChatMessages.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  {t.chatEmpty}
                </p>
              ) : (
                doctorChatMessages.map((msg) => {
                  const isMine = msg.senderUserId === authUser?.id || msg.senderRole === "PATIENT";
                  return (
                    <div
                      key={msg.id}
                      className={`rounded-2xl px-3.5 py-2.5 text-sm max-w-[88%] ${
                        isMine
                          ? "ml-auto bg-[#1D6CE0] text-white"
                          : "mr-auto bg-white dark:bg-[#101E21] border border-[#E3ECF3] dark:border-[#1E353A] text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs opacity-80 mb-0.5">
                        <span className="font-bold">{msg.senderName}</span>
                        <span>[{msg.channel}]</span>
                      </div>
                      <p className="leading-relaxed">{msg.body}</p>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendChat} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={chatBody}
                onChange={(e) => setChatBody(e.target.value)}
                placeholder={t.chatPlaceholder}
                className="min-h-[46px] flex-1 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-4 py-2.5 text-base sm:text-sm text-slate-900 dark:text-slate-100 focus:border-[#2585F5] focus:outline-none"
              />
              <button
                type="submit"
                disabled={sendingChat || !chatBody.trim()}
                className="inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl bg-[#1D6CE0] hover:bg-[#1758BA] px-5 py-2.5 text-sm font-bold text-white active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <IconSend className="h-4 w-4" />
                {t.chatSendBtn}
              </button>
            </form>
          </section>

          {!call ? (
            <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-6 text-center text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.noCall}
            </div>
          ) : (
            <>
              {/* Assigned Family Doctor & 24h Visit Window */}
              <section className="rounded-2xl border border-[#CFE3FB] dark:border-sky-800/80 bg-[#EBF4FF]/60 dark:bg-sky-950/30 p-5 space-y-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#1D6CE0] dark:text-sky-300">
                      {t.doctorTitle}
                    </p>
                    <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {call.assignedDoctor.fullName}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                      {call.polyclinicName} • {call.assignedDoctor.phone}
                    </p>
                  </div>
                  {data?.simState && (
                    <SlaCountdownBadge
                      dischargedAt={call.dischargedAt}
                      slaDeadlineAt={call.slaDeadlineAt}
                      simulatedNow={data.simState.simulatedNow}
                      dataLoadedAtMs={dataLoadedAtMs}
                      status={call.status}
                      plainMode
                    />
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-white dark:bg-[#101E21] p-3.5 border border-[#E3ECF3] dark:border-[#1E353A] text-sm text-slate-700 dark:text-slate-200">
                  <span>
                    {t.visitWindow}{" "}
                    <strong className="text-slate-900 dark:text-white">
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
                  <span className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-[#1D6CE0] dark:text-sky-200 bg-[#EBF4FF] dark:bg-sky-950/60 px-3 py-1.5 rounded-xl border border-[#CFE3FB] dark:border-sky-800">
                    <IconKey className="h-4 w-4" />
                    <InfoTooltip label={`${t.visitCodeLabel}:`} explanation={t.visitCodeTip} />
                    {call.patientOtpCode}
                  </span>
                </div>
              </section>

              {/* Home Care Guide */}
              <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 space-y-3.5">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <IconShieldCheck className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
                  {t.guideTitle}
                </h2>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-[#F6F9FC] dark:bg-[#091315] rounded-xl p-3.5 border border-[#E3ECF3] dark:border-[#1E353A]">
                  {lang === "ru"
                    ? call.patientGuide.summaryRu
                    : lang === "en"
                      ? call.patientGuide.summaryEn
                      : call.patientGuide.summaryUz}
                </p>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {t.rulesTitle}
                  </h3>
                  <ul className="space-y-2">
                    {(lang === "ru"
                      ? call.patientGuide.dailyRulesRu
                      : lang === "en"
                        ? call.patientGuide.dailyRulesEn
                        : call.patientGuide.dailyRulesUz
                    )?.map((rule, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200 leading-relaxed"
                      >
                        <IconCircleCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-rose-200 dark:border-rose-800/80 bg-rose-50/80 dark:bg-rose-950/40 p-3.5">
                  <h3 className="text-sm font-bold text-rose-800 dark:text-rose-200 mb-2 flex items-center gap-2">
                    <IconPhoneCall className="h-4 w-4" />
                    {t.dangerTitle}
                  </h3>
                  <ul className="space-y-1.5 text-sm text-rose-900 dark:text-rose-200 list-disc pl-5 leading-relaxed">
                    {(lang === "ru"
                      ? call.patientGuide.emergencySignsRu
                      : lang === "en"
                        ? call.patientGuide.emergencySignsEn
                        : call.patientGuide.emergencySignsUz
                    )?.map((sign, idx) => (
                      <li key={idx}>{sign}</li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Daily Symptom Check-in */}
              <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 space-y-4">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <IconHeartbeat className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  {t.checkinTitle}
                </h2>
                <form onSubmit={handleSymptomSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PRIMARY_RED_FLAG_SYMPTOMS.map((sym) => {
                      const stateMap = {
                        fever: { checked: fever, set: setFever },
                        severeHeadache: { checked: severeHeadache, set: setSevereHeadache },
                        bleeding: { checked: bleeding, set: setBleeding },
                        swelling: { checked: swelling, set: setSwelling },
                      };
                      const ctrl = stateMap[sym.key];
                      return (
                        <label
                          key={sym.key}
                          className={`min-h-[48px] flex items-center gap-3 rounded-xl border p-3.5 text-sm font-medium cursor-pointer transition-all ${
                            ctrl.checked
                              ? "border-rose-400 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-100 shadow-xs"
                              : "border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] text-slate-700 dark:text-slate-200 hover:border-[#2585F5]/60"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={ctrl.checked}
                            onChange={(e) => ctrl.set(e.target.checked)}
                            className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-rose-600 accent-rose-600 shrink-0"
                          />
                          <span>{lang === "ru" ? sym.ru : lang === "en" ? sym.en : sym.uz}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Extended Illnesses & Symptoms */}
                  <div className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] overflow-hidden">
                    <button
                      type="button"
                      aria-expanded={extendedOpen}
                      onClick={() => setExtendedOpen((v) => !v)}
                      className="w-full min-h-[48px] flex items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-[#EBF4FF]/60 dark:hover:bg-[#16272B] transition-colors"
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span>
                          {t.moreConditionsTitle} ({EXTENDED_SYMPTOMS_CATALOG.length})
                        </span>
                        {additionalSymptoms.length > 0 && (
                          <span className="rounded-full bg-[#EBF4FF] dark:bg-sky-950/80 border border-[#CFE3FB] dark:border-sky-800 px-2.5 py-0.5 text-xs font-bold text-[#1D6CE0] dark:text-sky-300">
                            {additionalSymptoms.length} {t.selectedCountLabel}
                          </span>
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D6CE0] dark:text-sky-300 shrink-0">
                        {extendedOpen ? t.moreConditionsToggleHide : t.moreConditionsToggleShow}
                        {extendedOpen ? (
                          <IconChevronUp className="h-4 w-4" />
                        ) : (
                          <IconChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    </button>

                    {extendedOpen && (
                      <div className="border-t border-[#E3ECF3] dark:border-[#1E353A] p-3.5 space-y-4 oc-slide-down">
                        <div className="space-y-2.5">
                          <button
                            type="button"
                            aria-expanded={physicalGroupOpen}
                            onClick={() => setPhysicalGroupOpen((v) => !v)}
                            className="w-full min-h-[40px] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                          >
                            <span>
                              {t.physicalGroupTitle} ({physicalSymptoms.length})
                            </span>
                            {physicalGroupOpen ? (
                              <IconChevronUp className="h-4 w-4" />
                            ) : (
                              <IconChevronDown className="h-4 w-4" />
                            )}
                          </button>
                          {physicalGroupOpen && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {physicalSymptoms.map((sym) => {
                                const checked = additionalSymptoms.includes(sym.id);
                                return (
                                  <label
                                    key={sym.id}
                                    className={`min-h-[44px] flex items-center gap-2.5 rounded-xl border p-3 text-sm font-medium cursor-pointer transition-all ${
                                      checked
                                        ? sym.triage === "CRITICAL"
                                          ? "border-rose-400 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-100"
                                          : "border-[#2585F5] bg-[#EBF4FF] dark:bg-sky-950/50 text-[#1D6CE0] dark:text-sky-100"
                                        : "border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] text-slate-700 dark:text-slate-200"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleAdditionalSymptom(sym.id)}
                                      className="h-4 w-4 accent-[#1D6CE0] shrink-0"
                                    />
                                    <span>
                                      {lang === "ru" ? sym.ru : lang === "en" ? sym.en : sym.uz}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2.5 pt-3 border-t border-[#E3ECF3] dark:border-[#1E353A]">
                          <button
                            type="button"
                            aria-expanded={illnessGroupOpen}
                            onClick={() => setIllnessGroupOpen((v) => !v)}
                            className="w-full min-h-[40px] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                          >
                            <span>
                              {t.illnessGroupTitle} ({illnessConditions.length})
                            </span>
                            {illnessGroupOpen ? (
                              <IconChevronUp className="h-4 w-4" />
                            ) : (
                              <IconChevronDown className="h-4 w-4" />
                            )}
                          </button>
                          {illnessGroupOpen && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {illnessConditions.map((sym) => {
                                const checked = additionalSymptoms.includes(sym.id);
                                return (
                                  <label
                                    key={sym.id}
                                    className={`min-h-[44px] flex items-center gap-2.5 rounded-xl border p-3 text-sm font-medium cursor-pointer transition-all ${
                                      checked
                                        ? "border-[#2585F5] bg-[#EBF4FF] dark:bg-sky-950/50 text-[#1D6CE0] dark:text-sky-100"
                                        : "border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] text-slate-700 dark:text-slate-200"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleAdditionalSymptom(sym.id)}
                                      className="h-4 w-4 accent-[#1D6CE0] shrink-0"
                                    />
                                    <span>
                                      {lang === "ru" ? sym.ru : lang === "en" ? sym.en : sym.uz}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom Condition Input */}
                  <div className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] overflow-hidden">
                    <button
                      type="button"
                      aria-expanded={customSectionOpen}
                      onClick={() => setCustomSectionOpen((v) => !v)}
                      className="w-full min-h-[48px] flex items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100"
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span>{t.customSectionTitle}</span>
                        {customConditions.length > 0 && (
                          <span className="rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-800 px-2.5 py-0.5 text-xs font-bold text-indigo-800 dark:text-indigo-300">
                            {customConditions.length}
                          </span>
                        )}
                      </span>
                      {customSectionOpen ? (
                        <IconChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
                      ) : (
                        <IconChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                      )}
                    </button>

                    {customSectionOpen && (
                      <div className="border-t border-[#E3ECF3] dark:border-[#1E353A] p-3.5 space-y-3 oc-slide-down">
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <div className="flex-1">
                            <label htmlFor="custom-condition-name" className="sr-only">
                              {t.customNameLabel}
                            </label>
                            <input
                              id="custom-condition-name"
                              name="customConditionName"
                              type="text"
                              value={customConditionName}
                              onChange={(e) => setCustomConditionName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddCustomCondition();
                                }
                              }}
                              placeholder={t.customNamePlaceholder}
                              className="w-full min-h-[46px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#2585F5] focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={!customConditionName.trim()}
                            onClick={handleAddCustomCondition}
                            className="min-h-[46px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#CFE3FB] dark:border-sky-800 bg-[#EBF4FF] dark:bg-sky-950/60 px-4 py-2.5 text-sm font-semibold text-[#1D6CE0] dark:text-sky-200 hover:bg-sky-100 disabled:opacity-40 active:scale-[0.98] transition-all shrink-0"
                          >
                            <IconPlus className="h-4 w-4" />
                            {t.customAddBtn}
                          </button>
                        </div>

                        <div className="space-y-2">
                          <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {t.customSeverityLabel}
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {CONDITION_SEVERITY_OPTIONS.map((opt) => {
                              const active = customConditionSeverity === opt.value;
                              const label =
                                lang === "ru" ? opt.ru : lang === "en" ? opt.en : opt.uz;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  aria-pressed={active}
                                  onClick={() => setCustomConditionSeverity(opt.value)}
                                  className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-semibold text-center transition-all active:scale-[0.98] ${
                                    active
                                      ? `${opt.badgeClass} ring-2 ring-[#2585F5]/40`
                                      : "border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] text-slate-600 dark:text-slate-300"
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {customConditions.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {customConditions.map((entry) => {
                              const sevMeta = getSeverityMeta(entry.severity);
                              const sevLabel =
                                lang === "ru"
                                  ? sevMeta.ru
                                  : lang === "en"
                                    ? sevMeta.en
                                    : sevMeta.uz;
                              return (
                                <span
                                  key={entry.id}
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${sevMeta.badgeClass}`}
                                >
                                  <span>{entry.name}</span>
                                  <span className="opacity-75">({sevLabel})</span>
                                  <button
                                    type="button"
                                    aria-label={`${t.customRemoveAria}: ${entry.name}`}
                                    onClick={() => handleRemoveCustomCondition(entry.id)}
                                    className="rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10"
                                  >
                                    <IconX className="h-3.5 w-3.5" />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="patient-bp"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
                      >
                        <InfoTooltip label={t.bpLabel} explanation={t.bpTip} />
                      </label>
                      <input
                        id="patient-bp"
                        name="bpReading"
                        type="text"
                        value={bpReading}
                        onChange={(e) => setBpReading(e.target.value)}
                        placeholder="120/80"
                        className="w-full min-h-[46px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2.5 font-mono text-base sm:text-sm text-slate-900 dark:text-white focus:border-[#2585F5] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="patient-notes"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
                      >
                        {t.notesLabel}
                      </label>
                      <input
                        id="patient-notes"
                        name="notes"
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t.notesPlaceholder}
                        className="w-full min-h-[46px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#2585F5] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingSym}
                    className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#1D6CE0] hover:bg-[#1758BA] py-3 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-50 transition-all"
                  >
                    <IconSend className="h-4 w-4" />
                    {submittingSym ? t.checkinSending : t.checkinBtn}
                  </button>
                </form>

                {call.symptomCheckins.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-[#E3ECF3] dark:border-[#1E353A]">
                    {call.symptomCheckins.map((sc) => {
                      const extraList = sc.additionalSymptoms ?? [];
                      const customList = sc.customConditions ?? [];
                      return (
                        <div
                          key={sc.id}
                          className={`rounded-xl border p-3.5 text-sm space-y-2 ${
                            sc.aiTriageLevel === "RED_EMERGENCY"
                              ? "border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200"
                              : sc.aiTriageLevel === "YELLOW"
                                ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200"
                                : "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200"
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="inline-flex items-center gap-1.5">
                              <IconAlertOctagon className="h-4 w-4" />
                              {sc.aiTriageLevel === "RED_EMERGENCY"
                                ? t.statusUrgent
                                : sc.aiTriageLevel === "YELLOW"
                                  ? t.statusAttention
                                  : t.statusNormal}{" "}
                              ({sc.bpReading})
                            </span>
                            <span className="font-mono text-xs">
                              {new Date(sc.createdAt).toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="leading-relaxed">
                            {lang === "ru"
                              ? sc.aiAdviceRu
                              : lang === "en"
                                ? sc.aiAdviceEn
                                : sc.aiAdviceUz}
                          </p>
                          {(extraList.length > 0 || customList.length > 0) && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {extraList.map((id) => (
                                <span
                                  key={id}
                                  className="rounded-full bg-white/85 dark:bg-[#101E21]/80 border border-current/20 px-2.5 py-0.5 text-xs font-semibold"
                                >
                                  {getSymptomLabel(id, lang)}
                                </span>
                              ))}
                              {customList.map((c) => {
                                const sev = getSeverityMeta(c.severity);
                                const sevLabel =
                                  lang === "ru" ? sev.ru : lang === "en" ? sev.en : sev.uz;
                                return (
                                  <span
                                    key={c.id}
                                    className="rounded-full bg-white/95 dark:bg-[#101E21]/90 border border-current/25 px-2.5 py-0.5 text-xs font-semibold"
                                  >
                                    {c.name} • {sevLabel}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          {sc.notes && <p className="text-xs opacity-85 italic">{sc.notes}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Hospital Results */}
              <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 space-y-3">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <IconFlask className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
                  <InfoTooltip label={t.labsTitle} explanation={t.labsTip} />
                </h2>
                {(call.patient?.labReports ?? []).map((lab) => (
                  <div
                    key={lab.id}
                    className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-3.5 space-y-2"
                  >
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {lab.panelName}
                    </p>
                    {(lab.results ?? []).map((r, idx) => {
                      const labTip = getLabTooltip(r.testName, lang);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-[#E3ECF3] dark:border-[#1E353A] last:border-0"
                        >
                          <span className="text-slate-600 dark:text-slate-300">
                            {labTip ? (
                              <InfoTooltip label={r.testName} explanation={labTip} />
                            ) : (
                              r.testName
                            )}
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {r.value} {r.unit}{" "}
                            {r.flag !== "NORMAL" && (
                              <span className="ml-1 text-xs text-rose-600 dark:text-rose-400">
                                ({t.flagAbnormal})
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </section>

              {/* 4-Digit Code / 1-Tap Visit Confirmation */}
              <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 space-y-3.5">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  {t.confirmTitle}
                </h2>
                {call.status === "COMPLETED" ? (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-3.5 text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <IconCircleCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      {t.confirmedPrefix}{" "}
                      {call.visitVerifiedAt
                        ? new Date(call.visitVerifiedAt).toLocaleString("en-GB")
                        : ""}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <label htmlFor="patient-otp" className="sr-only">
                        {t.visitCodeLabel}
                      </label>
                      <input
                        id="patient-otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder={`${t.otpPlaceholder} ${call.patientOtpCode})`}
                        maxLength={4}
                        className="min-h-[46px] flex-1 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2.5 font-mono text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#2585F5] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleConfirmVisit("OTP_4DIGIT")}
                        disabled={confirming || otpInput.length !== 4}
                        className="min-h-[46px] rounded-xl bg-[#1D6CE0] hover:bg-[#1758BA] px-5 py-2.5 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-50 transition-all"
                      >
                        {t.otpBtn}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConfirmVisit("ONE_TAP_PORTAL")}
                      disabled={confirming}
                      className="w-full min-h-[48px] rounded-xl border border-[#CFE3FB] dark:border-sky-800 bg-[#EBF4FF] dark:bg-sky-950/50 py-3 text-sm font-bold text-[#1D6CE0] dark:text-sky-200 hover:bg-sky-100 active:scale-[0.98] disabled:opacity-50 transition-all"
                    >
                      {t.oneTapBtn}
                    </button>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      )}

      {/* VIEW: EVENTS */}
      {activeView === "events" && (
        <div className="oc-fade-up">
          <MotherEventsPanel
            mode="full"
            events={motherEvents}
            loading={motherEventsLoading}
            onRsvp={handleMotherEventRsvp}
            rsvpBusyId={rsvpBusyId}
            authUser={authUser}
            canCreateEvent={false}
          />
        </div>
      )}

      {/* VIEW: ONALIK DARSLARI */}
      {activeView === "lessons" && (
        <div className="oc-fade-up">
          <OnalikDarslariPanel userId={authUser?.id || ownPatient?.id || "patient"} />
        </div>
      )}

      {/* VIEW: PSYCHOLOGY SESSIONS */}
      {activeView === "psych" && (
        <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] oc-fade-up space-y-5">
          <div className="space-y-2">
            <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <IconHeartHandshake className="h-6 w-6 text-[#1D6CE0] dark:text-sky-300" />
              <span>{t.psychTitle}</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t.psychSub}</p>
            <div className="rounded-xl border border-[#CFE3FB] dark:border-sky-800 bg-[#EBF4FF] dark:bg-sky-950/40 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#1D6CE0] dark:text-sky-200 flex items-start gap-2">
              <IconLock className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{t.psychPrivacyNote}</span>
            </div>
          </div>

          {psychologists.length === 0 ? (
            <p className="rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-5 text-sm text-slate-600 dark:text-slate-300">
              {t.psychEmpty}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {psychologists.map((psych) => {
                  const isSelected = psych.id === activePsychId;
                  const hasConsent = psychConsents.some(
                    (c) => c.psychologistId === psych.id && c.status === "ACTIVE"
                  );
                  const slots = Array.isArray(psych.scheduleSlots) ? psych.scheduleSlots : [];
                  return (
                    <div
                      key={psych.id}
                      className={`rounded-2xl border p-4 space-y-3 transition-all ${
                        isSelected
                          ? "border-[#1D6CE0] bg-[#EBF4FF]/60 dark:bg-sky-950/30 ring-1 ring-[#1D6CE0]/30"
                          : "border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPsychId(psych.id)}
                          className="flex items-start gap-2.5 text-left"
                        >
                          <UserAvatar
                            avatarUrl={psych.avatarUrl}
                            fullName={psych.fullName}
                            size="md"
                          />
                          <div>
                            <p className="text-base font-bold text-slate-900 dark:text-white">
                              {psych.fullName}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                              {psych.specialty || psych.expertiseArea || "Perinatal"} •{" "}
                              {psych.district}
                              {psych.experienceYears
                                ? ` • ${psych.experienceYears} ${t.expYearsWord}`
                                : ""}
                            </p>
                            {psych.bioSummary && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                                {psych.bioSummary}
                              </p>
                            )}
                          </div>
                        </button>
                        {hasConsent && (
                          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 shrink-0">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      {slots.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {t.psychSlotsLabel}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {slots.slice(0, 6).map((slot, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => {
                                  setSelectedPsychId(psych.id);
                                  setPsychTopic((prev) => prev || String(slot));
                                }}
                                className="rounded-lg border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-2.5 py-1 text-xs font-medium text-[#1D6CE0] dark:text-sky-200 hover:border-[#2585F5]"
                              >
                                {String(slot)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={psychActionBusy}
                        onClick={() => handlePsychConsent(psych.id, !hasConsent)}
                        className={`w-full min-h-[44px] rounded-xl px-3 py-2 text-xs sm:text-sm font-bold border transition-all active:scale-[0.98] disabled:opacity-50 ${
                          hasConsent
                            ? "border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200 hover:bg-rose-100"
                            : "border-[#1D6CE0] bg-[#1D6CE0] text-white hover:bg-[#1758BA]"
                        }`}
                      >
                        {hasConsent ? t.psychConsentWithdraw : t.psychConsentGrant}
                      </button>
                    </div>
                  );
                })}
              </div>

              {activePsychId && (() => {
                const selectedConsentActive = psychConsents.some(
                  (c) => c.psychologistId === activePsychId && c.status === "ACTIVE"
                );
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-[#E3ECF3] dark:border-[#1E353A]">
                    <form
                      onSubmit={handleBookPsychSession}
                      className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-4 space-y-3"
                    >
                      <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <IconCalendarEvent className="h-4 w-4 text-[#1D6CE0] dark:text-sky-300" />
                        <span>{t.psychBookBtn}</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <select
                          value={psychSessionType}
                          onChange={(e) => setPsychSessionType(e.target.value)}
                          className="min-h-[46px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
                        >
                          <option value="CHAT">Chat</option>
                          <option value="VOICE">Voice</option>
                          <option value="VIDEO">Video</option>
                          <option value="TELEGRAM_CALL">Telegram Call</option>
                        </select>
                        <input
                          type="datetime-local"
                          value={psychSessionAt}
                          onChange={(e) => setPsychSessionAt(e.target.value)}
                          className="min-h-[46px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(t.psychQuickTopics || []).map((qt) => (
                          <button
                            key={qt}
                            type="button"
                            onClick={() => setPsychTopic(qt)}
                            className="rounded-full border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-[#2585F5]"
                          >
                            {qt}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={psychTopic}
                        onChange={(e) => setPsychTopic(e.target.value)}
                        placeholder={t.psychTopicPlaceholder}
                        className="w-full min-h-[46px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={psychActionBusy || !selectedConsentActive}
                        className="w-full min-h-[46px] rounded-xl bg-[#1D6CE0] hover:bg-[#1758BA] py-2.5 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-50 transition-all"
                      >
                        {t.psychBookBtn}
                      </button>
                    </form>

                    <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-4 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <IconMessageCircle className="h-4 w-4 text-[#1D6CE0] dark:text-sky-300" />
                          <span>{t.psychChatTitle}</span>
                        </p>
                        {!selectedConsentActive && (
                          <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                            {t.psychConsentGrant}
                          </p>
                        )}
                        <div className="max-h-56 min-h-[120px] overflow-y-auto space-y-2 pr-1">
                          {psychChatMessages.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">—</p>
                          ) : (
                            psychChatMessages.map((m) => {
                              const isMine =
                                m.senderUserId === authUser?.id || m.senderRole === "PATIENT";
                              return (
                                <div
                                  key={m.id}
                                  className={`rounded-xl px-3.5 py-2.5 text-sm max-w-[90%] leading-relaxed ${
                                    isMine
                                      ? "ml-auto bg-[#1D6CE0] text-white"
                                      : "mr-auto bg-white dark:bg-[#101E21] border border-[#E3ECF3] dark:border-[#1E353A] text-slate-800 dark:text-slate-100"
                                  }`}
                                >
                                  <p className="font-bold text-xs opacity-80">{m.senderName}</p>
                                  <p>{m.body}</p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                      <form onSubmit={handleSendPsychChat} className="flex gap-2">
                        <input
                          type="text"
                          value={psychChatBody}
                          onChange={(e) => setPsychChatBody(e.target.value)}
                          disabled={!selectedConsentActive}
                          placeholder={t.psychChatPlaceholder}
                          className="flex-1 min-h-[46px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={
                            sendingPsychChat || !selectedConsentActive || !psychChatBody.trim()
                          }
                          className="min-h-[46px] min-w-[46px] inline-flex items-center justify-center rounded-xl bg-[#1D6CE0] hover:bg-[#1758BA] px-4 py-2 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-50 transition-all"
                        >
                          <IconSend className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })()}

              {psychSessions.length > 0 && (
                <div className="space-y-2.5 pt-3 border-t border-[#E3ECF3] dark:border-[#1E353A]">
                  <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                    {t.psychSessionsTitle}
                  </p>
                  {psychSessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-4 py-3 text-sm"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {s.psychologist?.fullName || "Psychologist"}
                        </span>{" "}
                        <span className="text-slate-600 dark:text-slate-300">
                          • {s.sessionType} • {new Date(s.scheduledAt).toLocaleString("en-GB")}
                        </span>
                        {s.topic && (
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                            {s.topic}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {s.meetingUrl && s.status === "SCHEDULED" && (
                          <a
                            href={s.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[38px] items-center gap-1 rounded-xl bg-[#1D6CE0] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1758BA]"
                          >
                            <span>{t.psychJoinBtn}</span>
                            <IconExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                            s.status === "COMPLETED"
                              ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 text-emerald-800 dark:text-emerald-200"
                              : s.status === "CANCELLED"
                                ? "bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500"
                                : "bg-[#EBF4FF] dark:bg-sky-950/50 border-[#CFE3FB] dark:border-sky-800 text-[#1D6CE0] dark:text-sky-200"
                          }`}
                        >
                          {s.status}
                        </span>
                        {s.status === "SCHEDULED" && (
                          <button
                            type="button"
                            disabled={psychActionBusy}
                            onClick={() => handleCancelPsychSession(s.id)}
                            className="inline-flex min-h-[36px] items-center rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-200 hover:bg-rose-100 disabled:opacity-50"
                          >
                            {t.psychCancelBtn}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* VIEW: AI CHATBOT */}
      {activeView === "chatbot" && (
        <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] oc-fade-up space-y-4">
          <div className="space-y-1.5">
            <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <IconRobot className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
              <span>{t.aiTitle}</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.aiSubtitle}
            </p>
            <p className="rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200 leading-relaxed">
              {t.aiDisclaimer}
            </p>
          </div>

          <div className="max-h-[420px] min-h-[240px] overflow-y-auto space-y-3.5 rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] p-4">
            {aiMessages.length === 0 ? (
              <div className="space-y-3.5 py-3">
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {t.aiEmptyTitle}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {t.aiEmptySub}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {(t.aiStarters || []).map((starter, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={aiBusy}
                      onClick={() =>
                        handleAiChatSubmit({
                          prompt: starter,
                          mode: "Ask",
                          modelId: "gemini-3.5-flash",
                          modelName: "Gemini 3.5 Flash",
                          effort: "High",
                          attachedFiles: [],
                        })
                      }
                      className="min-h-[44px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2.5 text-left text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-[#2585F5] hover:bg-[#EBF4FF] dark:hover:bg-[#16272B] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              aiMessages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1.5 oc-fade-in ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[92%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? "bg-[#1D6CE0] text-white"
                          : "bg-white dark:bg-[#101E21] border border-[#E3ECF3] dark:border-[#1E353A] text-slate-800 dark:text-slate-100 shadow-xs"
                      }`}
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-1.5 text-xs opacity-80">
                        <span className="font-bold">
                          {isUser ? displayName || "You" : "OnaCare AI"}
                        </span>
                        {isUser && msg.mode && <span>• {msg.mode}</span>}
                        {!isUser && msg.modelUsed && (
                          <span className="font-mono">• {msg.modelUsed}</span>
                        )}
                      </div>
                      <p>{msg.text}</p>
                      {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {msg.attachedFiles.map((f) => (
                            <span
                              key={f}
                              className="rounded-md bg-black/20 px-2 py-0.5 text-xs font-mono"
                            >
                              📎 {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {!isUser && msg.urgentAlert103 && (
                      <a
                        href="tel:103"
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 active:scale-[0.98] transition-all"
                      >
                        <IconPhoneCall className="h-4 w-4" />
                        {t.aiUrgentBtn}
                      </a>
                    )}

                    {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {msg.suggestedQuestions.map((sq, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            disabled={aiBusy}
                            onClick={() =>
                              handleAiChatSubmit({
                                prompt: sq,
                                mode: "Ask",
                                modelId: "gemini-3.5-flash",
                                modelName: "Gemini 3.5 Flash",
                                effort: "High",
                                attachedFiles: [],
                              })
                            }
                            className="min-h-[40px] rounded-full border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-1.5 text-xs font-semibold text-[#1D6CE0] dark:text-sky-300 hover:border-[#2585F5] active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {sq}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {aiBusy && (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 px-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2585F5] animate-pulse" />
                <span>{t.aiThinking}</span>
              </div>
            )}
            <div ref={aiEndRef} />
          </div>

          <AIComposer
            embedded
            initialTheme="dark"
            showUpgradeBanner={false}
            showWalkthroughControl={false}
            disabled={aiBusy}
            defaultMode="Ask"
            defaultModelId="gemini-3.5-flash"
            placeholder={t.aiPlaceholder}
            onSubmit={handleAiChatSubmit}
          />
        </section>
      )}

      {/* VIEW: PROFILE, AVATAR PICKER & SUBSCRIPTIONS */}
      {activeView === "settings" && (
        <div className="space-y-5 oc-fade-up">
          {/* Profile Picture Studio */}
          <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconUser className="h-5 w-5 text-[#1D6CE0] dark:text-sky-300" />
                <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                  {t.profileCardTitle}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {effectiveLat !== null && effectiveLng !== null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-mono text-emerald-700 dark:text-emerald-300">
                    <IconMapPin className="h-3.5 w-3.5" />
                    {Number(effectiveLat).toFixed(4)}, {Number(effectiveLng).toFixed(4)}
                  </span>
                )}
                <Link
                  href="/telegram"
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#EBF4FF] dark:bg-sky-950/60 border border-[#CFE3FB] dark:border-sky-800 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#1D6CE0] dark:text-sky-300 hover:bg-sky-100"
                >
                  <IconBrandTelegram className="h-4 w-4" />
                  {t.telegramCta}
                </Link>
              </div>
            </div>

            <AvatarPickerPanel
              currentAvatarUrl={currentAvatarUrl}
              fullName={displayName}
              lang={lang}
              onSaved={() => refreshData({ silent: true })}
            />
          </section>

          {/* Patient Subscription Plans */}
          <section className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div>
                <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <IconCrown className="h-5 w-5 text-amber-500" />
                  {t.subTitle}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{t.subSub}</p>
              </div>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                aria-label="Payment method"
                className="min-h-[44px] rounded-xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-800 dark:text-slate-100"
              >
                <option value="PAYME">Payme</option>
                <option value="CLICK">Click</option>
                <option value="UZCARD">Uzcard</option>
                <option value="HUMO">Humo</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {PATIENT_PLANS.map((plan) => {
                const isCurrent = currentSubTier === plan.code;
                const title =
                  lang === "ru" ? plan.nameRu : lang === "en" ? plan.nameEn : plan.nameUz;
                const badge =
                  lang === "ru" ? plan.badgeRu : lang === "en" ? plan.badgeEn : plan.badgeUz;
                const feats =
                  lang === "ru" ? plan.featuresRu : lang === "en" ? plan.featuresEn : plan.featuresUz;
                return (
                  <div
                    key={plan.code}
                    className={`rounded-2xl border p-4 flex flex-col justify-between space-y-3.5 transition-all ${
                      isCurrent
                        ? "border-[#1D6CE0] bg-[#EBF4FF]/70 dark:bg-sky-950/30"
                        : "border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#091315]"
                    }`}
                  >
                    <div className="space-y-2">
                      <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-950/70 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                        {badge}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {title}
                      </h3>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        {feats.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <IconCheck className="h-4 w-4 text-[#1D6CE0] shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      type="button"
                      disabled={isCurrent || buyingPlanCode === plan.code}
                      onClick={() => handleBuySubscription(plan.code)}
                      className={`w-full min-h-[46px] rounded-xl py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
                        isCurrent
                          ? "bg-emerald-600 text-white opacity-90"
                          : "bg-[#1D6CE0] hover:bg-[#1758BA] text-white"
                      } disabled:opacity-60`}
                    >
                      {isCurrent ? t.subActiveBtn : buyingPlanCode === plan.code ? "..." : t.subBuyBtn}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
