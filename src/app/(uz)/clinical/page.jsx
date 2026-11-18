"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { IconAlertTriangle, IconBell, IconBrandTelegram, IconBuildingHospital, IconCircleCheck, IconCurrentLocation, IconExternalLink, IconFileCode, IconFlask, IconHeartbeat, IconLock, IconMapPin, IconMessageCircle, IconPill, IconPlus, IconRobot, IconSend, IconStethoscope, } from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
import { SlaCountdownBadge } from "@/components/SlaCountdownBadge";
import { GpsConsentButton } from "@/components/GpsConsentButton";
import { VitalsTrendChart } from "@/components/VitalsTrendChart";
import { FhirBundleModal } from "@/components/FhirBundleModal";
import { AgentTraceModal } from "@/components/AgentTraceModal";
import { InfoTooltip } from "@/components/InfoTooltip";
import { getSeverityMeta, getSymptomLabel, PRIMARY_RED_FLAG_SYMPTOMS, } from "@/lib/symptoms-catalog";
import { inferReminderTimesFromFrequency } from "@/lib/wellbeing-catalog";
const CLINICAL_COPY = {
    uz: {
        ovabmuTitle: "Tug'ruqxona shifokori — Chiqarish va patronaj boshqaruvi",
        ovabmuSub: "Bemorlarning chiqarish xulosasini tayyorlang va 24 soatlik uy tashrifini boshlang",
        familyTitle: "Hududiy oilaviy shifokor — 24 soatlik uy tashriflari",
        familySub: "Uy tashrifi tekshiruv ro'yxatini bajaring, ko'rsatkichlarni kiriting va tashrifni tasdiqlang",
        ovabmuBadge: "Tug'ruqxona shifokori",
        familyBadge: "Oilaviy shifokor",
        patientsWord: "bemor",
        pendingWord: "kutilmoqda",
        profileTitle: "Shifokor mutaxassisligi, tajriba va GPS lokatsiyasi",
        profileSub: "Eng yaqin bemor shikoyatlarini ko'rish uchun yo'nalishingiz, tajribangiz va GPS joylashuvingizni saqlang",
        profileToggle: "Profil va GPS",
        fieldLabel: "Tibbiy soha / Mutaxassislik",
        expertiseLabel: "Ekspertiza yo'nalishi",
        expYearsLabel: "Tajriba (yil)",
        districtLabel: "Hudud / Tuman",
        shareGpsBtn: "Jonli GPS ulashish",
        saveProfileBtn: "Profil va GPS ni saqlash",
        profileSavedOk: "Shifokor profili va GPS joylashuvi saqlandi!",
        complaintsTitle: "GPS bo'yicha eng yaqin bemor shikoyatlari",
        complaintsEmpty: "Hozircha faol shikoyatlar yo'q.",
        distanceKmWord: "km masofa",
        destLabel: "Tashrif joyi:",
        respondLabel: "Bemorga javob yozish",
        respondPlaceholder: "Maslahat yoki kelish vaqtingizni yozing...",
        respondBtn: "Javob yuborish",
        enRouteBtn: "Yo'lga chiqdim",
        arrivedBtn: "Manzilga yetib keldim",
        verifyCompTitle: "Belgilangan joyda bemorni ko'rikdan o'tkazib tasdiqlash",
        compOtpPlaceholder: "Bemor OTP kodi (ixtiyoriy)",
        compNotePlaceholder: "Ko'rik xulosasi...",
        compVerifyBtn: "Joyida tekshiruvni tasdiqlash",
        compVerifiedDone: "Shikoyat tashrifi joyida tasdiqlandi",
        compRespondOk: "Javob va holat bemorga yuborildi!",
        compVerifyOk: "Shikoyat tashrifi joyida tasdiqlandi!",
        chatTitle: "Bemor bilan to'g'ridan-to'g'ri maslahat chati",
        chatEmpty: "Ushbu bemor bilan hali xabarlar yo'q.",
        chatPlaceholder: "Bemorga maslahat yozing (Web + Telegram)...",
        chatSendBtn: "Yuborish",
        telegramCta: "Telegram bot",
        rosterTitle: "Bemorlar ro'yxati",
        loadingEhr: "Bemor ma'lumotlari yuklanmoqda...",
        inpatientTag: "SHIFOXONADA",
        verifiedTag: "TASDIQLANGAN",
        patronageTag: "24h PATRONAJ",
        allergiesLabel: "Allergiyalar:",
        polyclinicLabel: "Biriktirilgan poliklinika:",
        dischargeBtn: "Uyga chiqarish va patronajni boshlash",
        dischargingBtn: "Yuborilmoqda...",
        dischargedActive: "Uyga chiqarildi • 24 soatlik nazorat faol",
        aiTraceBtn: "Jarayon tarixi",
        fhirBtn: "FHIR",
        encryptedLabel: "Shifrlangan yozuv",
        encryptedTip: "Klinik yozuvlar bazada AES-256-GCM algoritmi bilan shifrlangan.",
        icdTip: "ICD-10 — kasalliklarning xalqaro tasnif kodi.",
        jshshirTip: "JSHSHIR — bemorning shaxsiy identifikatsiya raqami (maxfiy ko'rinishda).",
        archiveDoc: "Chiqarish xulosasi (Hujjat)",
        vitalsVisitLabel: "Uy tashrifi",
        vitalsDischargeLabel: "Chiqarish vaqti",
        labsTitle: "Tahlil natijalari",
        orderLabBtn: "Qayta tahlil",
        rxTitle: "Yozilgan dorilar (E-retsept)",
        addRxBtn: "Dori qo'shish",
        rxMedPlaceholder: "Dori nomi",
        rxDosePlaceholder: "Miqdori (doza)",
        rxFreqPlaceholder: "Ichish tartibi",
        saveRxBtn: "Saqlash",
        daysWord: "kun",
        queueTitle: "Faol uy tashriflari navbati",
        riskWord: "Xavf",
        emergencyBanner: "BEMOR XAVFLI BELGILAR HAQIDA XABAR BERDI",
        noCalls: "Hozircha hududingizda faol uy tashriflari yo'q.",
        addressLabel: "Manzil:",
        windowLabel: "Tashrif oynasi:",
        viewFhirBtn: "FHIR paketini ko'rish",
        redFlagsTitle: "Muhim e'tibor talab belgilari (Xavf darajasi:",
        checklistTitle: "24 soatlik uy ko'rigi tekshiruv ro'yxati",
        oneClickLabBtn: "Qayta tahlil buyurtmasi",
        vitalsTitle: "Uy ko'rigi ko'rsatkichlari va tashrifni tasdiqlash",
        verifiedLabel: "Tasdiqlangan",
        sbpLabel: "Yuqori bosim",
        dbpLabel: "Pastki bosim",
        hrLabel: "Puls",
        tempLabel: "Harorat (°C)",
        spo2Label: "SpO2 (%)",
        spo2Tip: "Qondagi kislorod bilan to'yinish darajasi (pulsoksimetr ko'rsatkichi).",
        visitNotesLabel: "Uy ko'rigi xulosasi",
        verifyDoneBtn: "Tashrif allaqachon tasdiqlangan",
        verifySavingBtn: "Saqlanmoqda...",
        verifySubmitBtn: "Ko'rsatkichlarni saqlash va tasdiqlash",
        alertsTitle: "Avtomatik Telegram / SMS xabarnomalar",
        patientCheckinsTitle: "Bemor yuborgan kunlik holat tekshiruvlari",
        dischargeErr: "Chiqarishda xatolik yuz berdi.",
        dischargeOk: "Uyga chiqarish va 24 soatlik patronaj boshlandi!",
        checklistErr: "Ro'yxatni yangilash uchun shifokor ruxsati kerak.",
        verifyErr: "Tashrifni tasdiqlashda xatolik.",
        verifyOk: "Uy tashrifi muvaffaqiyatli tasdiqlandi!",
        labOk: "Qayta tahlil buyurtmasi yuborildi:",
        labErr: "Tahlil buyurtmasi uchun shifokor huquqi zarur.",
        rxOk: "Dori qo'shildi:",
        rxErr: "Retsept yozish uchun shifokor huquqi zarur.",
        wellbeingSectionTitle: "Kunlik kayfiyat va EPDS ko'rsatkichi",
        latestEpdsLabel: "Oxirgi EPDS:",
        psychRiskAlert: "Psixologik xavf aniqlandi",
        selfHarmAlert: "SHOSHILINCH: EPDS Q10 (103 SLA)",
        rxReminderTimesLabel: "Telegram eslatma vaqtlari (24s)",
        rxRemindersOn: "10 daqiqa oldin eslatish faol",
        remindersStripTitle: "Bugungi eslatmalar va vazifalar",
        pendingVisitsCount: "24s uy tashriflari:",
        openComplaintsCount: "Faol shikoyatlar:",
        directMessagesCount: "Bemor xabarlari:",
        directChatPanelTitle: "Bemorlar bilan to'g'ridan-to'g'ri chat (Bot + Mini App)",
        selectPatientLabel: "Bemor:",
        noPatientsForChat: "Hozircha chat uchun bemorlar mavjud emas.",
        rxDurationLabel: "Davomiyligi (kun)",
        rxInstructionsLabel: "Qo'llash yo'riqnomasi",
        rxInstructionsPlaceholder: "Masalan: Ovqatdan keyin suv bilan iching.",
        noRxYet: "Ushbu bemorga hali dorilar tayinlanmagan.",
        assignedMedTitle: "Biriktirilgan bemorlar dorilari (E-retsept)",
        assignedMedSub: "Oilaviy shifokor va hamshiralar biriktirilgan bemorlarga dori va Telegram eslatma vaqtini qo'shishi mumkin",
        noPatientsAssigned: "Hozircha sizga biriktirilgan bemorlar topilmadi.",
    },
    ru: {
        ovabmuTitle: "Врач роддома — Выписка и передача на патронаж",
        ovabmuSub: "Оформляйте выписные заключения и запускайте 24-часовой домашний визит",
        familyTitle: "Семейный врач — 24-часовые визиты на дом",
        familySub: "Выполняйте чек-лист домашнего осмотра, вносите показатели и подтверждайте визит",
        ovabmuBadge: "Врач роддома",
        familyBadge: "Семейный врач",
        patientsWord: "пац.",
        pendingWord: "ожидает",
        profileTitle: "Специализация, опыт работы и GPS-локация врача",
        profileSub: "Укажите направление, стаж и поделитесь GPS, чтобы видеть ближайших пациентов",
        profileToggle: "Профиль и GPS",
        fieldLabel: "Специальность",
        expertiseLabel: "Область экспертизы",
        expYearsLabel: "Стаж (лет)",
        districtLabel: "Район",
        shareGpsBtn: "Поделиться GPS",
        saveProfileBtn: "Сохранить профиль и GPS",
        profileSavedOk: "Профиль и GPS врача сохранены!",
        complaintsTitle: "Ближайшие жалобы пациентов по GPS",
        complaintsEmpty: "Активных жалоб пока нет.",
        distanceKmWord: "км",
        destLabel: "Точка выезда:",
        respondLabel: "Ответ пациенту",
        respondPlaceholder: "Напишите рекомендацию или время прибытия...",
        respondBtn: "Отправить ответ",
        enRouteBtn: "Выехал",
        arrivedBtn: "Прибыл на место",
        verifyCompTitle: "Подтвердить осмотр на месте выезда",
        compOtpPlaceholder: "OTP код пациента (опц.)",
        compNotePlaceholder: "Заключение осмотра на месте...",
        compVerifyBtn: "Подтвердить визит по жалобе",
        compVerifiedDone: "Визит по жалобе подтвержден на месте",
        compRespondOk: "Ответ и статус отправлены пациенту!",
        compVerifyOk: "Осмотр на месте успешно подтвержден!",
        chatTitle: "Прямой чат-консультация с пациентом",
        chatEmpty: "Сообщений с этим пациентом пока нет.",
        chatPlaceholder: "Напишите совет пациенту (Web + Telegram)...",
        chatSendBtn: "Отправить",
        telegramCta: "Telegram-бот",
        rosterTitle: "Список пациенток",
        loadingEhr: "Загрузка карты пациентки...",
        inpatientTag: "В СТАЦИОНАРЕ",
        verifiedTag: "ПОДТВЕРЖДЕН",
        patronageTag: "24ч ПАТРОНАЖ",
        allergiesLabel: "Аллергии:",
        polyclinicLabel: "Поликлиника:",
        dischargeBtn: "Выписать и назначить визит на дом",
        dischargingBtn: "Оформление...",
        dischargedActive: "Выписана • 24ч патронаж активен",
        aiTraceBtn: "Шаги координации",
        fhirBtn: "FHIR",
        encryptedLabel: "Зашифровано",
        encryptedTip: "Клинические заметки зашифрованы в базе по стандарту AES-256-GCM.",
        icdTip: "ICD-10 (МКБ-10) — международный код диагноза.",
        jshshirTip: "ПИНФЛ — персональный идентификационный номер пациентки (скрыт).",
        archiveDoc: "Выписной эпикриз",
        vitalsVisitLabel: "Визит на дом",
        vitalsDischargeLabel: "При выписке",
        labsTitle: "Лабораторные анализы",
        orderLabBtn: "Повторный анализ",
        rxTitle: "Назначения (Е-рецепты)",
        addRxBtn: "Добавить",
        rxMedPlaceholder: "Название препарата",
        rxDosePlaceholder: "Дозировка",
        rxFreqPlaceholder: "Кратность приема",
        saveRxBtn: "Сохранить рецепт",
        daysWord: "дн.",
        queueTitle: "Очередь активных визитов",
        riskWord: "Риск",
        emergencyBanner: "ПАЦИЕНТКА СООБЩИЛА О ТРЕВОЖНЫХ СИМПТОМАХ",
        noCalls: "В вашей поликлинике пока нет активных вызовов.",
        addressLabel: "Адрес:",
        windowLabel: "Окно визита:",
        viewFhirBtn: "Открыть HL7 FHIR",
        redFlagsTitle: "Ключевые факторы риска (Оценка:",
        checklistTitle: "Чек-лист домашнего осмотра",
        oneClickLabBtn: "Назначить повторный анализ",
        vitalsTitle: "Показатели осмотра и подтверждение визита",
        verifiedLabel: "Подтвержден",
        sbpLabel: "Сист. АД",
        dbpLabel: "Диаст. АД",
        hrLabel: "Пульс",
        tempLabel: "Темп. (°C)",
        spo2Label: "SpO2 (%)",
        spo2Tip: "Насыщение крови кислородом (сатурация).",
        visitNotesLabel: "Заключение домашнего осмотра",
        verifyDoneBtn: "Визит уже подтвержден",
        verifySavingBtn: "Сохранение...",
        verifySubmitBtn: "Сохранить показатели и подтвердить визит",
        alertsTitle: "Журнал уведомлений Telegram / SMS",
        patientCheckinsTitle: "Ежедневные отчеты о самочувствии пациентки",
        dischargeErr: "Ошибка при выписке.",
        dischargeOk: "Выписка оформлена, 24-часовой визит назначен!",
        checklistErr: "Для обновления чек-листа нужны права врача.",
        verifyErr: "Ошибка подтверждения визита.",
        verifyOk: "Домашний визит успешно подтвержден!",
        labOk: "Назначен повторный анализ:",
        labErr: "Для назначения анализа нужны права врача.",
        rxOk: "Рецепт добавлен:",
        rxErr: "Для выписки рецепта нужны права врача.",
        wellbeingSectionTitle: "Ежедневное настроение и EPDS",
        latestEpdsLabel: "Последний EPDS:",
        psychRiskAlert: "Выявлен психологический риск",
        selfHarmAlert: "СРОЧНО: EPDS Q10 (103 SLA)",
        rxReminderTimesLabel: "Время напоминаний в Telegram (24ч)",
        rxRemindersOn: "Напоминание за 10 мин активно",
        remindersStripTitle: "Напоминания и задачи на сегодня",
        pendingVisitsCount: "24ч визиты на дом:",
        openComplaintsCount: "Активные жалобы:",
        directMessagesCount: "Сообщения пациентов:",
        directChatPanelTitle: "Прямой чат с пациентами (Бот + Mini App)",
        selectPatientLabel: "Пациент:",
        noPatientsForChat: "Пока нет доступных пациентов для чата.",
        rxDurationLabel: "Длительность (дней)",
        rxInstructionsLabel: "Инструкция по приему",
        rxInstructionsPlaceholder: "Например: Принимать после еды с водой.",
        noRxYet: "Этой пациентке еще не назначены лекарства.",
        assignedMedTitle: "Назначения закрепленных пациентов (Е-рецепт)",
        assignedMedSub: "Семейные врачи и медсестры могут добавлять лекарства и время напоминаний в Telegram закрепленным пациентам",
        noPatientsAssigned: "Пока нет закрепленных за вами пациентов.",
    },
    en: {
        ovabmuTitle: "Hospital Doctor — Discharge & Home Care Handoff",
        ovabmuSub: "Review inpatient records, prepare discharge summaries, and arrange 24-hour home visits",
        familyTitle: "Family Doctor — 24h Home Visit Workspace",
        familySub: "Complete home-visit check-ups, record vitals, and confirm completed visits",
        ovabmuBadge: "Hospital Doctor",
        familyBadge: "Family Doctor",
        patientsWord: "patients",
        pendingWord: "pending",
        profileTitle: "Doctor Expertise, Experience & GPS Location",
        profileSub: "Save your medical specialty, experience, and live GPS coordinates to rank nearest patient complaints",
        profileToggle: "Profile & GPS",
        fieldLabel: "Clinical Specialty",
        expertiseLabel: "Expertise Area",
        expYearsLabel: "Experience (yrs)",
        districtLabel: "District",
        shareGpsBtn: "Share Live GPS",
        saveProfileBtn: "Save Profile & GPS",
        profileSavedOk: "Doctor profile & GPS coordinates saved!",
        complaintsTitle: "Nearest Patient Complaints (GPS Ranked)",
        complaintsEmpty: "No active patient complaints right now.",
        distanceKmWord: "km away",
        destLabel: "Visit Destination:",
        respondLabel: "Reply to Patient",
        respondPlaceholder: "Write medical advice or ETA...",
        respondBtn: "Send Reply",
        enRouteBtn: "En Route",
        arrivedBtn: "Arrived at Location",
        verifyCompTitle: "Check Patient & Verify Visit at Destination",
        compOtpPlaceholder: "Patient OTP code (optional)",
        compNotePlaceholder: "On-site check-up verification note...",
        compVerifyBtn: "Verify Complaint Visit",
        compVerifiedDone: "Complaint visit verified on-site",
        compRespondOk: "Response and status sent to patient!",
        compVerifyOk: "Patient visit verified at chosen location!",
        chatTitle: "Direct Patient Advice Chat",
        chatEmpty: "No direct messages with this patient yet.",
        chatPlaceholder: "Message patient with advice (Web + Telegram)...",
        chatSendBtn: "Send",
        telegramCta: "Telegram Bot",
        rosterTitle: "Patient Roster",
        loadingEhr: "Loading patient records...",
        inpatientTag: "INPATIENT",
        verifiedTag: "VERIFIED",
        patronageTag: "24h HOME CARE",
        allergiesLabel: "Allergies:",
        polyclinicLabel: "Assigned Clinic:",
        dischargeBtn: "Discharge & Schedule Home Visit",
        dischargingBtn: "Preparing handoff...",
        dischargedActive: "Discharged • 24h Home Care Active",
        aiTraceBtn: "Handoff Steps",
        fhirBtn: "FHIR",
        encryptedLabel: "Encrypted Record",
        encryptedTip: "Clinical notes are encrypted at rest using AES-256-GCM.",
        icdTip: "ICD-10 — International standard diagnosis code.",
        jshshirTip: "JSHSHIR — masked national personal identifier.",
        archiveDoc: "Discharge Summary",
        vitalsVisitLabel: "Home visit",
        vitalsDischargeLabel: "At discharge",
        labsTitle: "Lab Results",
        orderLabBtn: "Order Follow-Up",
        rxTitle: "Prescriptions",
        addRxBtn: "Add Medicine",
        rxMedPlaceholder: "Medication name",
        rxDosePlaceholder: "Dosage",
        rxFreqPlaceholder: "Frequency",
        saveRxBtn: "Save Prescription",
        daysWord: "days",
        queueTitle: "Active Home Visit Queue",
        riskWord: "Risk",
        emergencyBanner: "PATIENT REPORTED URGENT SYMPTOMS",
        noCalls: "No active home visits assigned to your clinic yet.",
        addressLabel: "Address:",
        windowLabel: "Visit Window:",
        viewFhirBtn: "View HL7 FHIR Bundle",
        redFlagsTitle: "Priority Clinical Alerts (Risk Score:",
        checklistTitle: "24-Hour Home Visit Checklist",
        oneClickLabBtn: "1-Click Follow-Up Lab",
        vitalsTitle: "Home Visit Vitals & Verification",
        verifiedLabel: "Verified",
        sbpLabel: "Systolic BP",
        dbpLabel: "Diastolic BP",
        hrLabel: "Heart Rate",
        tempLabel: "Temp (°C)",
        spo2Label: "SpO2 (%)",
        spo2Tip: "Blood oxygen saturation measured by pulse oximeter.",
        visitNotesLabel: "Home Visit Notes",
        verifyDoneBtn: "Visit Already Verified",
        verifySavingBtn: "Saving...",
        verifySubmitBtn: "Save Vitals & Confirm Home Visit",
        alertsTitle: "Telegram / SMS Notification Log",
        patientCheckinsTitle: "Patient Daily Symptom Check-ins",
        dischargeErr: "Could not complete discharge handoff.",
        dischargeOk: "Discharge summary ready and 24-hour home visit scheduled!",
        checklistErr: "Doctor permissions required to update checklist.",
        verifyErr: "Could not verify home visit.",
        verifyOk: "Home visit verified successfully!",
        labOk: "Follow-up lab ordered:",
        labErr: "Doctor permissions required to order labs.",
        rxOk: "Prescription added:",
        rxErr: "Doctor permissions required to prescribe.",
        wellbeingSectionTitle: "Daily Mood & EPDS Screening",
        latestEpdsLabel: "Latest EPDS:",
        psychRiskAlert: "Psychological risk flagged",
        selfHarmAlert: "URGENT: EPDS Q10 (103 SLA)",
        rxReminderTimesLabel: "Telegram Reminder Times (24h)",
        rxRemindersOn: "10m pre-dose Telegram reminders active",
        remindersStripTitle: "Today's Reminders & Tasks",
        pendingVisitsCount: "24h Home Visits:",
        openComplaintsCount: "Open Complaints:",
        directMessagesCount: "Patient Messages:",
        directChatPanelTitle: "Direct Patient Chat (Bot + Mini App)",
        selectPatientLabel: "Patient:",
        noPatientsForChat: "No patients available to message yet.",
        rxDurationLabel: "Duration (days)",
        rxInstructionsLabel: "Instructions",
        rxInstructionsPlaceholder: "e.g. Take after meals with water.",
        noRxYet: "No medications prescribed for this patient yet.",
        assignedMedTitle: "Assigned Patients & Medications (E-Rx)",
        assignedMedSub: "Family doctors & nurses can prescribe medications and set Telegram reminders for assigned patients",
        noPatientsAssigned: "No assigned patients available yet.",
    },
};
export default function ClinicalDashboardPage() {
    const { role, authUser, data, loading, fetchWithAuth, refreshData, showToast, dataLoadedAtMs, } = usePlatform();
    const { lang } = useLanguage();
    const t = CLINICAL_COPY[lang];
    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [selectedCallId, setSelectedCallId] = useState("");
    const [selectedComplaintId, setSelectedComplaintId] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const [docSpecialty, setDocSpecialty] = useState("");
    const [docExpertise, setDocExpertise] = useState("");
    const [docExpYears, setDocExpYears] = useState("");
    const [docDistrict, setDocDistrict] = useState("");
    const [docLat, setDocLat] = useState(null);
    const [docLng, setDocLng] = useState(null);
    const [savingProfile, setSavingProfile] = useState(false);
    const [sharingGps, setSharingGps] = useState(false);
    const [compReplyText, setCompReplyText] = useState("");
    const [compOtp, setCompOtp] = useState("");
    const [compVerifyNote, setCompVerifyNote] = useState("");
    const [respondingComp, setRespondingComp] = useState(false);
    const [verifyingComp, setVerifyingComp] = useState(false);
    const [chatBody, setChatBody] = useState("");
    const [sendingChat, setSendingChat] = useState(false);
    const [selectedChatPatientId, setSelectedChatPatientId] = useState("");
    const [directChatBody, setDirectChatBody] = useState("");
    const [sendingDirectChat, setSendingDirectChat] = useState(false);
    const [discharging, setDischarging] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [orderingLab, setOrderingLab] = useState(false);
    const [fhirCallId, setFhirCallId] = useState(null);
    const [traceModal, setTraceModal] = useState(null);
    const [selectedRxPatientId, setSelectedRxPatientId] = useState("");
    const [rxFormOpen, setRxFormOpen] = useState(false);
    const [rxMed, setRxMed] = useState("Magne B6 Forte");
    const [rxDose, setRxDose] = useState("100 mg");
    const [rxFreq, setRxFreq] = useState("2x daily");
    const [rxDurationDays, setRxDurationDays] = useState("14");
    const [rxInstructions, setRxInstructions] = useState("");
    const [rxReminderTimes, setRxReminderTimes] = useState("08:00, 20:00");
    const [rxReminderEdited, setRxReminderEdited] = useState(false);
    const [rxRemindersEnabled, setRxRemindersEnabled] = useState(true);
    const [rxSubmitting, setRxSubmitting] = useState(false);
    const [sbp, setSbp] = useState("128");
    const [dbp, setDbp] = useState("82");
    const [hr, setHr] = useState("84");
    const [temp, setTemp] = useState("36.6");
    const [spo2, setSpo2] = useState("98");
    const [visitNotes, setVisitNotes] = useState("Uy sharoitida ko'rik o'tkazildi. Bemorning umumiy ahvoli qoniqarli, dorilarni o'z vaqtida ichmoqda.");
    const patients = useMemo(() => data?.patients ?? [], [data?.patients]);
    const activeCalls = useMemo(() => data?.activeCalls ?? [], [data?.activeCalls]);
    const complaints = useMemo(() => data?.complaints ?? [], [data?.complaints]);
    const directMessages = useMemo(() => data?.directMessages ?? [], [data?.directMessages]);
    const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? patients[0];
    const selectedCall = activeCalls.find((c) => c.id === selectedCallId) ?? activeCalls[0];
    const selectedComplaint = complaints.find((c) => c.id === selectedComplaintId) ?? complaints[0];
    const selectedPatientCall = selectedPatient
        ? activeCalls.find((c) => c.patientId === selectedPatient.id)
        : undefined;
    const isOvabmu = role === "OVABMU_MD";
    const needsProfileSetup = Boolean(authUser && (!authUser.expertiseArea || authUser.experienceYears == null || authUser.latitude == null));
    const activeDocLat = docLat ?? authUser?.latitude ?? null;
    const activeDocLng = docLng ?? authUser?.longitude ?? null;
    const chatPatients = useMemo(() => {
        const map = new Map();
        for (const p of patients) {
            map.set(p.id, {
                id: p.id,
                fullName: p.fullName,
                district: p.district || "",
            });
        }
        for (const c of activeCalls) {
            if (c.patient?.id && !map.has(c.patient.id)) {
                map.set(c.patient.id, {
                    id: c.patient.id,
                    fullName: c.patient.fullName,
                    district: c.district || c.patient.district || "",
                });
            }
        }
        for (const comp of complaints) {
            if (comp.patient?.id && !map.has(comp.patient.id)) {
                map.set(comp.patient.id, {
                    id: comp.patient.id,
                    fullName: comp.patient.fullName,
                    district: comp.patient.district || "",
                });
            }
        }
        for (const m of directMessages) {
            if (m.patientId && !map.has(m.patientId)) {
                map.set(m.patientId, {
                    id: m.patientId,
                    fullName: m.senderRole === "PATIENT" ? m.senderName : `Bemor #${m.patientId.slice(0, 6)}`,
                    district: "",
                });
            }
        }
        return Array.from(map.values());
    }, [patients, activeCalls, complaints, directMessages]);
    const effectiveChatPatientId = selectedChatPatientId ||
        selectedComplaint?.patientId ||
        selectedCall?.patientId ||
        selectedPatient?.id ||
        chatPatients[0]?.id ||
        "";
    const directPatientMessages = useMemo(() => {
        if (!effectiveChatPatientId)
            return [];
        return directMessages.filter((m) => m.patientId === effectiveChatPatientId);
    }, [directMessages, effectiveChatPatientId]);
    const complaintMessages = useMemo(() => {
        if (!selectedComplaint)
            return directMessages;
        return directMessages.filter((m) => m.patientId === selectedComplaint.patientId);
    }, [directMessages, selectedComplaint]);
    const handleDoctorLocationCaptured = async ({ latitude: lat, longitude: lng }) => {
        setDocLat(lat);
        setDocLng(lng);
        setSharingGps(true);
        try {
            const res = await fetchWithAuth("/api/clinical/profile", {
                method: "PATCH",
                body: JSON.stringify({ latitude: lat, longitude: lng }),
            });
            if (res.ok) {
                await refreshData();
                showToast("success", `GPS: ${lat}, ${lng}`);
            }
        }
        finally {
            setSharingGps(false);
        }
    };
    const handleSaveDoctorProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await fetchWithAuth("/api/clinical/profile", {
                method: "PATCH",
                body: JSON.stringify({
                    specialty: docSpecialty || authUser?.specialty || "",
                    expertiseArea: docExpertise || authUser?.expertiseArea || "",
                    experienceYears: docExpYears !== "" ? Number(docExpYears) : authUser?.experienceYears ?? 5,
                    district: docDistrict || authUser?.district || "",
                    ...(activeDocLat !== null && activeDocLng !== null
                        ? { latitude: activeDocLat, longitude: activeDocLng }
                        : {}),
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                showToast("error", json.error || "Could not save profile");
                return;
            }
            await refreshData();
            setProfileOpen(false);
            showToast("success", t.profileSavedOk);
        }
        finally {
            setSavingProfile(false);
        }
    };
    const handleRespondComplaint = async (statusOverride) => {
        if (!selectedComplaint)
            return;
        setRespondingComp(true);
        try {
            const res = await fetchWithAuth(`/api/complaints/${selectedComplaint.id}/respond`, {
                method: "POST",
                body: JSON.stringify({
                    doctorResponse: compReplyText.trim() || undefined,
                    status: statusOverride,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                showToast("error", json.error || "Failed to update complaint");
                return;
            }
            setCompReplyText("");
            await refreshData();
            showToast("success", t.compRespondOk);
        }
        finally {
            setRespondingComp(false);
        }
    };
    const handleVerifyComplaint = async (e) => {
        e.preventDefault();
        if (!selectedComplaint)
            return;
        setVerifyingComp(true);
        try {
            const res = await fetchWithAuth(`/api/complaints/${selectedComplaint.id}/verify`, {
                method: "POST",
                body: JSON.stringify({
                    otpCode: compOtp.trim() || undefined,
                    systolicBp: Number(sbp),
                    diastolicBp: Number(dbp),
                    heartRate: Number(hr),
                    tempC: Number(temp),
                    spo2: Number(spo2),
                    visitVerificationNote: compVerifyNote.trim() || visitNotes,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                showToast("error", json.error || "Failed to verify complaint visit");
                return;
            }
            setCompOtp("");
            setCompVerifyNote("");
            await refreshData();
            showToast("success", t.compVerifyOk);
        }
        finally {
            setVerifyingComp(false);
        }
    };
    const handleSendDoctorChat = async (e) => {
        e.preventDefault();
        if (!chatBody.trim() || !selectedComplaint?.patientId)
            return;
        setSendingChat(true);
        try {
            const res = await fetchWithAuth("/api/messages", {
                method: "POST",
                body: JSON.stringify({
                    patientId: selectedComplaint.patientId,
                    complaintId: selectedComplaint.id,
                    body: chatBody.trim(),
                }),
            });
            if (res.ok) {
                setChatBody("");
                await refreshData({ silent: true });
            }
        }
        finally {
            setSendingChat(false);
        }
    };
    const handleSendDirectPatientChat = async (e) => {
        e.preventDefault();
        if (!directChatBody.trim() || !effectiveChatPatientId)
            return;
        setSendingDirectChat(true);
        try {
            const linkedComp = complaints.find((c) => c.patientId === effectiveChatPatientId && c.status !== "VERIFIED_COMPLETED");
            const res = await fetchWithAuth("/api/messages", {
                method: "POST",
                body: JSON.stringify({
                    patientId: effectiveChatPatientId,
                    ...(linkedComp ? { complaintId: linkedComp.id } : {}),
                    body: directChatBody.trim(),
                }),
            });
            if (res.ok) {
                setDirectChatBody("");
                await refreshData({ silent: true });
            }
            else {
                const json = await res.json().catch(() => ({}));
                showToast("error", json.error || "Could not send message");
            }
        }
        finally {
            setSendingDirectChat(false);
        }
    };
    const handleTriggerDischarge = async (patientId) => {
        setDischarging(true);
        try {
            const res = await fetchWithAuth("/api/agent/discharge-handoff", {
                method: "POST",
                body: JSON.stringify({ patientId }),
            });
            const json = await res.json();
            if (!res.ok) {
                showToast("error", json.error || t.dischargeErr);
                return;
            }
            await refreshData();
            showToast("success", t.dischargeOk);
            setTraceModal({
                patientName: selectedPatient?.fullName ?? "",
                trace: json.agentTrace,
            });
            setSelectedCallId(json.activeCallId);
        }
        finally {
            setDischarging(false);
        }
    };
    const handleToggleChecklist = async (callId, itemId, checked) => {
        const res = await fetchWithAuth(`/api/active-calls/${callId}/verify`, {
            method: "PATCH",
            body: JSON.stringify({ checklistItemId: itemId, checked }),
        });
        if (res.ok) {
            await refreshData();
        }
        else {
            showToast("error", t.checklistErr);
        }
    };
    const handleVerifyVisit = async (e) => {
        e.preventDefault();
        if (!selectedCall)
            return;
        setVerifying(true);
        try {
            const res = await fetchWithAuth(`/api/active-calls/${selectedCall.id}/verify`, {
                method: "POST",
                body: JSON.stringify({
                    systolicBp: Number(sbp),
                    diastolicBp: Number(dbp),
                    heartRate: Number(hr),
                    tempC: Number(temp),
                    spo2: Number(spo2),
                    visitNotes,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                showToast("error", json.error || t.verifyErr);
                return;
            }
            await refreshData();
            showToast("success", t.verifyOk);
        }
        finally {
            setVerifying(false);
        }
    };
    const handleOrderFollowupLab = async (patientId, panelName) => {
        setOrderingLab(true);
        try {
            const res = await fetchWithAuth("/api/clinical/orders", {
                method: "POST",
                body: JSON.stringify({ type: "FOLLOWUP_LAB", patientId, panelName }),
            });
            if (res.ok) {
                await refreshData();
                showToast("success", `${t.labOk} ${panelName}`);
            }
            else {
                showToast("error", t.labErr);
            }
        }
        finally {
            setOrderingLab(false);
        }
    };
    const handleAddRx = async (e, targetPatientId) => {
        e.preventDefault();
        const patientId = targetPatientId ||
            (isOvabmu
                ? selectedPatient?.id
                : selectedRxPatientId || selectedCall?.patient?.id || selectedComplaint?.patientId || patients[0]?.id);
        if (!patientId)
            return;
        setRxSubmitting(true);
        try {
            const reminderTimes = rxReminderTimes
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            const res = await fetchWithAuth("/api/clinical/orders", {
                method: "POST",
                body: JSON.stringify({
                    type: "ADD_PRESCRIPTION",
                    patientId,
                    medicationName: rxMed,
                    dosage: rxDose,
                    frequency: rxFreq,
                    durationDays: Number(rxDurationDays) || 14,
                    instructionsUz: rxInstructions.trim() || undefined,
                    reminderTimes,
                    remindersEnabled: rxRemindersEnabled,
                }),
            });
            if (res.ok) {
                setRxFormOpen(false);
                setRxReminderEdited(false);
                setRxInstructions("");
                await refreshData();
                showToast("success", `${t.rxOk} ${rxMed} ${rxDose}`);
            }
            else {
                const errJson = await res.json().catch(() => ({}));
                showToast("error", errJson.error || t.rxErr);
            }
        }
        finally {
            setRxSubmitting(false);
        }
    };
    return (<div className="space-y-6 oc-fade-up">
      {/* Role-Specific Clinical Header */}
      <div className="med-card p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {isOvabmu ? t.ovabmuTitle : t.familyTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {isOvabmu ? t.ovabmuSub : t.familySub}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {authUser?.expertiseArea && (<span className="rounded-full bg-[#EDF5F3] dark:bg-[#16272B] border border-[#D7E4E1] dark:border-[#1E353A] px-3 py-1 font-semibold text-slate-700 dark:text-slate-200">
                {authUser.specialty ? `${authUser.specialty} • ` : ""}{authUser.expertiseArea}
              </span>)}
            {typeof authUser?.experienceYears === "number" && (<span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3 py-1 font-semibold text-indigo-700 dark:text-indigo-300">
                {authUser.experienceYears} yil
              </span>)}
            {activeDocLat !== null && activeDocLng !== null && (<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 font-mono text-emerald-700 dark:text-emerald-300">
                <IconMapPin className="h-3.5 w-3.5"/>
                {Number(activeDocLat).toFixed(4)}, {Number(activeDocLng).toFixed(4)}
              </span>)}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={() => setProfileOpen((v) => !v)} className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#EDF5F3] dark:hover:bg-[#16272B] active:scale-[0.98] transition-all">
            <IconCurrentLocation className="h-4 w-4 text-teal-700 dark:text-teal-300"/>
            {t.profileToggle}
          </button>
          <Link href="/telegram" className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-4 py-2 text-sm font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 active:scale-[0.98] transition-all">
            <IconBrandTelegram className="h-4 w-4"/>
            {t.telegramCta}
          </Link>
          <div className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-[#EDF5F3] dark:bg-teal-950/60 px-4 py-2 text-sm font-semibold text-teal-800 dark:text-teal-200 border border-[#D7E4E1] dark:border-teal-800">
            {isOvabmu ? (<>
                <IconBuildingHospital className="h-4 w-4 text-teal-700 dark:text-teal-300"/>
                {t.ovabmuBadge} ({patients.length} {t.patientsWord})
              </>) : (<>
                <IconStethoscope className="h-4 w-4 text-teal-700 dark:text-teal-300"/>
                {t.familyBadge} ({activeCalls.filter((c) => c.status !== "COMPLETED").length} {t.pendingWord})
              </>)}
          </div>
        </div>
      </div>

      {/* Doctor Expertise, Experience & GPS Setup Card */}
      {(profileOpen || needsProfileSetup) && (<section className="med-card border-teal-200 dark:border-teal-800/80 bg-[#EDF5F3]/75 dark:bg-teal-950/30 p-5 space-y-3.5 oc-slide-down">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">{t.profileTitle}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{t.profileSub}</p>
            </div>
            <GpsConsentButton
              label={sharingGps ? "..." : t.shareGpsBtn}
              busy={sharingGps}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 active:scale-[0.98] disabled:opacity-50 transition-all"
              onLocationCaptured={handleDoctorLocationCaptured}
              onError={() => showToast("error", "Could not access GPS location")}
            />
          </div>
          <form onSubmit={handleSaveDoctorProfile} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                {t.fieldLabel}
              </label>
              <input type="text" value={docSpecialty || authUser?.specialty || ""} onChange={(e) => setDocSpecialty(e.target.value)} placeholder="Oilaviy shifokor / Akusher" className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                {t.expertiseLabel}
              </label>
              <input type="text" value={docExpertise || authUser?.expertiseArea || ""} onChange={(e) => setDocExpertise(e.target.value)} placeholder="Postpartum & Preeclampsia" className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                {t.expYearsLabel}
              </label>
              <input type="number" min={0} max={60} value={docExpYears !== "" ? docExpYears : authUser?.experienceYears ?? ""} onChange={(e) => setDocExpYears(e.target.value)} placeholder="7" className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                {t.districtLabel}
              </label>
              <input type="text" value={docDistrict || authUser?.district || ""} onChange={(e) => setDocDistrict(e.target.value)} placeholder="Yunusobod" className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"/>
            </div>
            <button type="submit" disabled={savingProfile} className="min-h-[46px] rounded-xl bg-teal-700 dark:bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 dark:hover:bg-teal-500 active:scale-[0.98] disabled:opacity-50 transition-all">
              {savingProfile ? "..." : t.saveProfileBtn}
            </button>
          </form>
        </section>)}

      {/* In-App Reminders Summary Strip & Quick Task Counts */}
      <section className="med-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <IconBell className="h-5 w-5 text-teal-700 dark:text-teal-300"/>
          <span>{t.remindersStripTitle}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold">
          <span className="rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-1.5 text-amber-800 dark:text-amber-300">
            {t.pendingVisitsCount} {activeCalls.filter((c) => c.status !== "COMPLETED").length}
          </span>
          <span className="rounded-full border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 px-3.5 py-1.5 text-rose-800 dark:text-rose-300">
            {t.openComplaintsCount} {complaints.filter((c) => c.status !== "VERIFIED_COMPLETED").length}
          </span>
          <a href="#direct-patient-chat" className="min-h-[36px] inline-flex items-center rounded-full border border-[#D7E4E1] dark:border-teal-800 bg-[#EDF5F3] dark:bg-teal-950/60 px-3.5 py-1.5 text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors">
            {t.directMessagesCount} {directMessages.length}
          </a>
        </div>
      </section>

      {/* Standalone Direct Patient Chat (Works with or without complaints, Bot + Mini App synced) */}
      <section id="direct-patient-chat" className="med-card p-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <IconMessageCircle className="h-5 w-5 text-teal-700 dark:text-teal-300"/>
            {t.directChatPanelTitle}
          </h2>
          {chatPatients.length > 0 && (<div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <label htmlFor="clinical-direct-chat-patient" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t.selectPatientLabel}
              </label>
              <select id="clinical-direct-chat-patient" value={effectiveChatPatientId} onChange={(e) => setSelectedChatPatientId(e.target.value)} className="flex-1 sm:flex-initial min-h-[44px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3 py-2 text-base sm:text-sm font-semibold text-slate-900 dark:text-white">
                {chatPatients.map((cp) => (<option key={cp.id} value={cp.id}>
                    {cp.fullName}{cp.district ? ` (${cp.district})` : ""}
                  </option>))}
              </select>
            </div>)}
        </div>

        {chatPatients.length === 0 ? (<p className="text-sm text-slate-500 dark:text-slate-400 py-3 text-center">
            {t.noPatientsForChat}
          </p>) : (<div className="space-y-3">
            <div className="max-h-56 overflow-y-auto space-y-2 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] p-3.5">
              {directPatientMessages.length === 0 ? (<p className="text-sm text-slate-500 dark:text-slate-400 text-center py-3">{t.chatEmpty}</p>) : (directPatientMessages.map((msg) => {
                const isDoc = msg.senderRole !== "PATIENT";
                return (<div key={msg.id} className={`rounded-2xl px-3.5 py-2.5 text-sm max-w-[88%] leading-relaxed ${isDoc
                        ? "ml-auto bg-teal-700 dark:bg-teal-600 text-white"
                        : "mr-auto bg-white dark:bg-[#101E21] border border-[#D7E4E1] dark:border-[#1E353A] text-slate-800 dark:text-slate-100"}`}>
                      <div className="flex items-center justify-between gap-2 text-xs opacity-80 mb-0.5">
                        <span className="font-bold">{msg.senderName}</span>
                        <span>[{msg.channel}]</span>
                      </div>
                      <p>{msg.body}</p>
                    </div>);
            }))}
            </div>
            <form onSubmit={handleSendDirectPatientChat} className="flex flex-col sm:flex-row gap-2">
              <input type="text" value={directChatBody} onChange={(e) => setDirectChatBody(e.target.value)} placeholder={t.chatPlaceholder} aria-label={t.chatPlaceholder} className="flex-1 min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"/>
              <button type="submit" disabled={sendingDirectChat || !directChatBody.trim() || !effectiveChatPatientId} className="inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl bg-teal-700 dark:bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 dark:hover:bg-teal-500 active:scale-[0.98] disabled:opacity-50 transition-all">
                <IconSend className="h-4 w-4"/>
                {t.chatSendBtn}
              </button>
            </form>
          </div>)}
      </section>

      {/* Nearest Patient Complaints Queue (GPS Ranked) */}
      <section className="med-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <IconMapPin className="h-5 w-5 text-teal-700 dark:text-teal-300"/>
            {t.complaintsTitle} ({complaints.length})
          </h2>
          {activeDocLat !== null && activeDocLng !== null && (<span className="font-mono text-xs text-slate-600 dark:text-slate-300">
              GPS: {Number(activeDocLat).toFixed(4)}, {Number(activeDocLng).toFixed(4)}
            </span>)}
        </div>

        {complaints.length === 0 ? (<p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">{t.complaintsEmpty}</p>) : (<div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
              {complaints.map((c) => {
                const isSelected = c.id === selectedComplaint?.id;
                return (<button key={c.id} type="button" onClick={() => setSelectedComplaintId(c.id)} className={`w-full text-left rounded-2xl border p-4 space-y-2 transition-all ${isSelected
                        ? "border-teal-600 bg-[#EDF5F3] dark:bg-teal-950/40 ring-1 ring-teal-500/40"
                        : "border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7]/60 dark:bg-[#091315] hover:border-teal-500/50"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {c.patient?.fullName || c.title}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                          {c.patient?.district} • {c.category}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {typeof c.distanceKm === "number" && (<span className="rounded-full bg-[#EDF5F3] dark:bg-teal-950/80 border border-teal-300 dark:border-teal-800 px-2.5 py-0.5 text-xs font-bold text-teal-800 dark:text-teal-300">
                            {c.distanceKm} {t.distanceKmWord}
                          </span>)}
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${c.status === "VERIFIED_COMPLETED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                        : c.severity === "CRITICAL" || c.severity === "SEVERE"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"}`}>
                          {c.severity} • {c.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed">{c.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.destLabel} {c.visitDestination} — {c.visitAddress}
                    </p>
                  </button>);
            })}
            </div>

            {selectedComplaint && (<div className="lg:col-span-7 space-y-3.5 rounded-2xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7]/60 dark:bg-[#091315] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                      {selectedComplaint.patient?.fullName} — {selectedComplaint.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                      {selectedComplaint.patient?.phone} • {selectedComplaint.visitDestination}: {selectedComplaint.visitAddress}
                    </p>
                    {typeof selectedComplaint.latitude === "number" && typeof selectedComplaint.longitude === "number" && (<p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-1">
                        GPS: {selectedComplaint.latitude.toFixed(4)}, {selectedComplaint.longitude.toFixed(4)}
                        {typeof selectedComplaint.distanceKm === "number" ? ` (${selectedComplaint.distanceKm} km)` : ""}
                      </p>)}
                  </div>
                  <span className="rounded-full bg-teal-700 px-3 py-1 text-xs font-bold text-white">
                    {selectedComplaint.status}
                  </span>
                </div>

                <p className="text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#101E21] rounded-xl p-3.5 border border-[#D7E4E1] dark:border-[#1E353A] leading-relaxed">
                  {selectedComplaint.description}
                </p>

                {/* Respond & En Route / Arrived Buttons */}
                <div className="space-y-2.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-3.5">
                  <label htmlFor="comp-reply-text" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {t.respondLabel}
                  </label>
                  <textarea id="comp-reply-text" rows={2} value={compReplyText} onChange={(e) => setCompReplyText(e.target.value)} placeholder={t.respondPlaceholder} className="w-full rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"/>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={respondingComp} onClick={() => handleRespondComplaint("DOCTOR_RESPONDED")} className="min-h-[44px] rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800 active:scale-[0.98] disabled:opacity-50 transition-all">
                      {t.respondBtn}
                    </button>
                    <button type="button" disabled={respondingComp} onClick={() => handleRespondComplaint("EN_ROUTE")} className="min-h-[44px] rounded-xl border border-amber-400 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 px-4 py-2 text-sm font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 active:scale-[0.98] transition-all">
                      {t.enRouteBtn}
                    </button>
                    <button type="button" disabled={respondingComp} onClick={() => handleRespondComplaint("ARRIVED")} className="min-h-[44px] rounded-xl border border-indigo-400 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 px-4 py-2 text-sm font-semibold text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 active:scale-[0.98] transition-all">
                      {t.arrivedBtn}
                    </button>
                  </div>
                </div>

                {/* On-site Verification Form */}
                {selectedComplaint.status === "VERIFIED_COMPLETED" ? (<div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-3.5 text-sm text-emerald-800 dark:text-emerald-300">
                    <p className="font-bold flex items-center gap-2">
                      <IconCircleCheck className="h-5 w-5"/>
                      {t.compVerifiedDone}
                    </p>
                    {selectedComplaint.visitVerificationNote && <p className="mt-1">{selectedComplaint.visitVerificationNote}</p>}
                  </div>) : (<form onSubmit={handleVerifyComplaint} className="space-y-2.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-3.5">
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">{t.verifyCompTitle}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input type="text" value={compOtp} onChange={(e) => setCompOtp(e.target.value)} placeholder={t.compOtpPlaceholder} aria-label={t.compOtpPlaceholder} maxLength={4} className="min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3 py-2 font-mono text-base sm:text-sm text-slate-900 dark:text-white"/>
                      <input type="text" value={compVerifyNote} onChange={(e) => setCompVerifyNote(e.target.value)} placeholder={t.compNotePlaceholder} aria-label={t.compNotePlaceholder} className="min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3 py-2 text-base sm:text-sm text-slate-900 dark:text-white"/>
                    </div>
                    <button type="submit" disabled={verifyingComp} className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 active:scale-[0.98] disabled:opacity-50 transition-all">
                      <IconCircleCheck className="h-4 w-4"/>
                      {verifyingComp ? "..." : t.compVerifyBtn}
                    </button>
                  </form>)}

                {/* Direct Patient Advice Chat */}
                <div className="space-y-2.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-3.5">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <IconMessageCircle className="h-4 w-4 text-teal-700 dark:text-teal-300"/>
                    {t.chatTitle}
                  </p>
                  <div className="max-h-44 overflow-y-auto space-y-2">
                    {complaintMessages.length === 0 ? (<p className="text-sm text-slate-500 dark:text-slate-400">{t.chatEmpty}</p>) : (complaintMessages.map((msg) => {
                    const isDoc = msg.senderRole !== "PATIENT";
                    return (<div key={msg.id} className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${isDoc
                            ? "ml-6 bg-teal-700 text-white"
                            : "mr-6 bg-[#EDF5F3] dark:bg-[#16272B] text-slate-800 dark:text-slate-100"}`}>
                            <span className="font-bold">{msg.senderName} [{msg.channel}]: </span>
                            {msg.body}
                          </div>);
                }))}
                  </div>
                  <form onSubmit={handleSendDoctorChat} className="flex flex-col sm:flex-row gap-2">
                    <input type="text" value={chatBody} onChange={(e) => setChatBody(e.target.value)} placeholder={t.chatPlaceholder} aria-label={t.chatPlaceholder} className="flex-1 min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"/>
                    <button type="submit" disabled={sendingChat || !chatBody.trim()} className="min-h-[46px] rounded-xl bg-teal-700 dark:bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800 dark:hover:bg-teal-500 active:scale-[0.98] disabled:opacity-50 transition-all">
                      {t.chatSendBtn}
                    </button>
                  </form>
                </div>
              </div>)}
          </div>)}
      </section>

      {/* VIEW 1: HOSPITAL DOCTOR */}
      {isOvabmu && (<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 oc-fade-up">
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 px-1">
              {t.rosterTitle} ({patients.length})
            </h2>
            {patients.map((p) => {
                const selected = p.id === selectedPatient?.id;
                const isInpatient = p.status === "INPATIENT";
                const latestEhr = p.ehrRecords[p.ehrRecords.length - 1];
                return (<button key={p.id} onClick={() => setSelectedPatientId(p.id)} className={`w-full text-left rounded-2xl border p-4 sm:p-4.5 min-h-[48px] transition-all active:scale-[0.99] ${selected
                        ? "border-teal-600 dark:border-teal-500 bg-teal-50/70 dark:bg-teal-950/50 ring-1 ring-teal-500 shadow-sm"
                        : "med-card-interactive border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] hover:border-teal-400 dark:hover:border-teal-700"}`}>
                  <div className="flex items-start justify-between gap-2.5">
                    <div>
                      <p className="text-base font-bold text-slate-900 dark:text-white">{p.fullName}</p>
                      <p className="font-mono text-xs text-slate-600 dark:text-slate-300 mt-0.5">{p.jshshirMasked}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${isInpatient
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300"
                        : p.status === "VISIT_COMPLETED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"}`}>
                      {isInpatient
                        ? t.inpatientTag
                        : p.status === "VISIT_COMPLETED"
                            ? t.verifiedTag
                            : t.patronageTag}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 font-medium leading-snug">
                    {latestEhr?.diagnosisIcd10} — {latestEhr?.diagnosisText.slice(0, 62)}...
                  </p>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {p.district}{p.mahalla ? `, ${p.mahalla}` : ""} {p.bedNumber ? `• ${p.bedNumber}` : ""}
                  </p>
                </button>);
            })}
          </div>

          <div className="lg:col-span-8">
            {loading || !selectedPatient ? (<div className="med-card p-8 text-center text-base text-slate-600 dark:text-slate-300">
                {t.loadingEhr}
              </div>) : (<div className="space-y-5">
                <div className="med-card p-5 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                          {selectedPatient.fullName}
                        </h2>
                        <span className="rounded-lg bg-[#EDF5F3] dark:bg-[#16272B] border border-[#D7E4E1] dark:border-[#1E353A] px-2.5 py-1 font-mono text-xs text-slate-700 dark:text-slate-200">
                          <InfoTooltip label="JSHSHIR" explanation={t.jshshirTip}/>:{" "}
                          {selectedPatient.jshshirMasked}
                        </span>
                        <span className="rounded-lg bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          {selectedPatient.bloodType}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        {selectedPatient.district}
                        {selectedPatient.mahalla ? `, ${selectedPatient.mahalla}` : ""}, {selectedPatient.address} •{" "}
                        {selectedPatient.phone}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {t.allergiesLabel}{" "}
                        <span className="font-bold text-rose-700 dark:text-rose-400">
                          {selectedPatient.allergies.join(", ")}
                        </span>{" "}
                        • {t.polyclinicLabel}{" "}
                        <strong className="text-slate-800 dark:text-slate-100">
                          {selectedPatient.polyclinicName}
                        </strong>
                      </p>
                    </div>

                    {selectedPatient.status === "INPATIENT" ? (<button onClick={() => handleTriggerDischarge(selectedPatient.id)} disabled={discharging || role !== "OVABMU_MD"} className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-teal-700 dark:bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 dark:hover:bg-teal-500 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 shrink-0">
                        <IconRobot className="h-4 w-4"/>
                        {discharging ? t.dischargingBtn : t.dischargeBtn}
                      </button>) : (<div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <IconCircleCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400"/>
                          {t.dischargedActive}
                        </div>
                        {selectedPatientCall && (<>
                            <button onClick={() => setTraceModal({
                            patientName: selectedPatient.fullName,
                            trace: selectedPatientCall.aiAgentTrace,
                        })} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#16272B] px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-teal-500 active:scale-[0.98] transition-all">
                              <IconRobot className="h-4 w-4 text-teal-600 dark:text-teal-400"/>
                              {t.aiTraceBtn}
                            </button>
                            <button onClick={() => setFhirCallId(selectedPatientCall.id)} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#16272B] px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-teal-500 active:scale-[0.98] transition-all">
                              <IconFileCode className="h-4 w-4 text-indigo-600 dark:text-indigo-400"/>
                              {t.fhirBtn}
                            </button>
                          </>)}
                      </div>)}
                  </div>

                  {selectedPatient.ehrRecords.map((ehr) => (<div key={ehr.id} className="mt-4 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] p-4 sm:p-5 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-teal-800 dark:bg-teal-600 px-2.5 py-1 font-mono text-xs font-bold text-white">
                            <InfoTooltip label={ehr.diagnosisIcd10} explanation={t.icdTip}/>
                          </span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {ehr.recordType} ({ehr.severity})
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            <IconLock className="h-3.5 w-3.5"/>
                            <InfoTooltip label={t.encryptedLabel} explanation={t.encryptedTip}/>
                          </span>
                          {ehr.dischargeDocumentKey && (<a href={`/api/storage/${ehr.dischargeDocumentKey}`} target="_blank" rel="noreferrer" className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-white dark:bg-[#101E21] px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-[#D7E4E1] dark:border-[#1E353A] hover:border-teal-500 transition-colors">
                              <IconExternalLink className="h-3.5 w-3.5"/>
                              {t.archiveDoc}
                            </a>)}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{ehr.diagnosisText}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{ehr.clinicalNotes}</p>
                      {ehr.procedures.length > 0 && (<div className="flex flex-wrap gap-2 pt-1">
                          {ehr.procedures.map((proc, idx) => (<span key={idx} className="rounded-lg bg-white dark:bg-[#101E21] px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 border border-[#D7E4E1] dark:border-[#1E353A]">
                              {proc}
                            </span>))}
                        </div>)}
                    </div>))}
                </div>

                <VitalsTrendChart records={selectedPatient.ehrRecords.map((ehr) => ({
                    label: ehr.recordType === "POST_DISCHARGE_VITALS"
                        ? t.vitalsVisitLabel
                        : t.vitalsDischargeLabel,
                    vitals: ehr.vitals,
                }))}/>

                {(selectedPatient.wellbeingCheckins ?? []).length > 0 && (() => {
                    const checkins = selectedPatient.wellbeingCheckins || [];
                    const latestEpds = checkins.find((c) => typeof c.epdsScore === "number");
                    const hasSelfHarm = checkins.some((c) => c.epdsSelfHarmFlag || c.riskFlag === "SELF_HARM_CRITICAL");
                    const hasPsychRisk = checkins.some((c) => c.riskFlag === "PSYCH_RISK" || (typeof c.epdsScore === "number" && c.epdsScore >= 13));
                    return (<div className="space-y-3">
                        <div className="med-card flex flex-wrap items-center justify-between gap-2 px-4 py-3.5">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {t.wellbeingSectionTitle} ({checkins.length})
                          </span>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                            {latestEpds && (<span className="rounded-full bg-[#EDF5F3] dark:bg-[#16272B] border border-[#D7E4E1] dark:border-[#1E353A] px-3 py-1 font-mono text-slate-700 dark:text-slate-200">
                                {t.latestEpdsLabel} {latestEpds.epdsScore}/30
                              </span>)}
                            {hasSelfHarm ? (<span className="rounded-full bg-rose-600 px-3 py-1 text-white">
                                {t.selfHarmAlert}
                              </span>) : hasPsychRisk ? (<span className="rounded-full bg-amber-100 dark:bg-amber-950/70 px-3 py-1 text-amber-800 dark:text-amber-300">
                                {t.psychRiskAlert}
                              </span>) : null}
                          </div>
                        </div>
                        <VitalsTrendChart records={checkins} mode="mood"/>
                      </div>);
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="med-card p-5 space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <IconFlask className="h-4.5 w-4.5 text-teal-700 dark:text-teal-400"/>
                        {t.labsTitle}
                      </h3>
                      <button onClick={() => handleOrderFollowupLab(selectedPatient.id, "Qayta Gemoglobin & CRP Nazorati")} disabled={orderingLab} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#16272B] px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-teal-500 active:scale-[0.98] transition-all">
                        <IconPlus className="h-3.5 w-3.5"/>
                        {t.orderLabBtn}
                      </button>
                    </div>
                    {selectedPatient.labReports.map((lab) => (<div key={lab.id} className="rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] p-3.5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{lab.panelName}</span>
                          <span className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                            {lab.status}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {lab.results.map((r, i) => (<div key={i} className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-[#D7E4E1]/70 dark:border-[#1E353A] last:border-0">
                              <span className="text-slate-700 dark:text-slate-200">{r.testName}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                  {r.value} {r.unit}
                                </span>
                                {r.flag !== "NORMAL" && (<span className={`rounded-full px-2 py-0.5 text-xs font-bold ${r.flag === "CRITICAL"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"}`}>
                                    {r.flag}
                                  </span>)}
                              </div>
                            </div>))}
                        </div>
                      </div>))}
                  </div>

                  <div className="med-card p-5 space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <IconPill className="h-4.5 w-4.5 text-teal-700 dark:text-teal-400"/>
                        {t.rxTitle}
                      </h3>
                      <button onClick={() => setRxFormOpen((v) => !v)} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#16272B] px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-teal-500 active:scale-[0.98] transition-all">
                        <IconPlus className="h-3.5 w-3.5"/>
                        {t.addRxBtn}
                      </button>
                    </div>

                    {rxFormOpen && (<form onSubmit={(e) => handleAddRx(e, selectedPatient.id)} className="oc-slide-down rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30 p-4 space-y-3">
                        <label htmlFor="rx-med" className="sr-only">
                          {t.rxMedPlaceholder}
                        </label>
                        <input id="rx-med" name="medicationName" value={rxMed} onChange={(e) => setRxMed(e.target.value)} placeholder={t.rxMedPlaceholder} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white" required/>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <label htmlFor="rx-dose" className="sr-only">
                            {t.rxDosePlaceholder}
                          </label>
                          <input id="rx-dose" name="dosage" value={rxDose} onChange={(e) => setRxDose(e.target.value)} placeholder={t.rxDosePlaceholder} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white" required/>
                          <label htmlFor="rx-freq" className="sr-only">
                            {t.rxFreqPlaceholder}
                          </label>
                          <input id="rx-freq" name="frequency" value={rxFreq} onChange={(e) => {
                        const val = e.target.value;
                        setRxFreq(val);
                        if (!rxReminderEdited) {
                            setRxReminderTimes(inferReminderTimesFromFrequency(val).join(", "));
                        }
                    }} placeholder={t.rxFreqPlaceholder} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white" required/>
                          <input id="rx-duration" name="durationDays" type="number" min={1} max={180} value={rxDurationDays} onChange={(e) => setRxDurationDays(e.target.value)} placeholder={t.rxDurationLabel} aria-label={t.rxDurationLabel} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"/>
                        </div>
                        <input id="rx-instructions" name="instructionsUz" value={rxInstructions} onChange={(e) => setRxInstructions(e.target.value)} placeholder={t.rxInstructionsPlaceholder} aria-label={t.rxInstructionsLabel} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"/>
                        <div className="space-y-1.5">
                          <label htmlFor="rx-reminder-times" className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {t.rxReminderTimesLabel}
                          </label>
                          <input id="rx-reminder-times" name="reminderTimes" value={rxReminderTimes} onChange={(e) => {
                        setRxReminderEdited(true);
                        setRxReminderTimes(e.target.value);
                    }} placeholder="08:00, 20:00" className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] px-3.5 py-2.5 font-mono text-base sm:text-sm text-slate-900 dark:text-white"/>
                        </div>
                        <label className="flex items-center gap-2.5 min-h-[40px] text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
                          <input type="checkbox" checked={rxRemindersEnabled} onChange={(e) => setRxRemindersEnabled(e.target.checked)} className="h-4.5 w-4.5 rounded border-[#D7E4E1] text-teal-600"/>
                          <span>{t.rxRemindersOn}</span>
                        </label>
                        <button type="submit" disabled={rxSubmitting} className="w-full min-h-[46px] rounded-xl bg-teal-700 dark:bg-teal-600 py-2.5 text-sm font-bold text-white hover:bg-teal-800 dark:hover:bg-teal-500 active:scale-[0.98] transition-all disabled:opacity-50">
                          {rxSubmitting ? "..." : t.saveRxBtn}
                        </button>
                      </form>)}

                    <div className="space-y-2.5">
                      {selectedPatient.prescriptions.length === 0 ? (<p className="text-sm text-slate-500 dark:text-slate-400 py-3 text-center">{t.noRxYet}</p>) : (selectedPatient.prescriptions.map((rx) => (<div key={rx.id} className="rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] p-3.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {rx.medicationName} ({rx.dosage})
                            </span>
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${rx.pharmacyStockStatus === "IN_STOCK"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                        : rx.pharmacyStockStatus === "RESERVED"
                            ? "bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"}`}>
                              {rx.pharmacyStockStatus}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                            {rx.frequency} • {rx.durationDays} {t.daysWord} • {rx.polyclinicPharmacy}
                          </p>
                          {rx.remindersEnabled !== false && (rx.reminderTimes ?? []).length > 0 && (<p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 font-mono text-xs font-semibold text-teal-800 dark:text-teal-300">
                              🔔 {(rx.reminderTimes ?? []).join(", ")}
                            </p>)}
                          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                            {lang === "ru" ? rx.instructionsRu : lang === "en" ? rx.instructionsEn : rx.instructionsUz}
                          </p>
                        </div>)))}
                    </div>
                  </div>
                </div>
              </div>)}
          </div>
        </div>)}

      {/* VIEW 2: FAMILY DOCTOR & NURSE */}
      {!isOvabmu && (() => {
            const effectiveRxPatientId = selectedRxPatientId ||
                selectedCall?.patient?.id ||
                selectedComplaint?.patientId ||
                patients[0]?.id ||
                "";
            const effectiveRxPatient = patients.find((p) => p.id === effectiveRxPatientId) ||
                selectedCall?.patient ||
                patients[0] ||
                null;
            return (<div className="space-y-6 oc-fade-up">
          {/* Assigned Patients & Medications (E-Rx for Family Doctors & Nurses) */}
          <section id="assigned-patient-medications" className="med-card p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <IconPill className="h-5 w-5 text-teal-700 dark:text-teal-400"/>
                  {t.assignedMedTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">{t.assignedMedSub}</p>
              </div>
              {patients.length > 0 && (<div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <label htmlFor="family-rx-patient" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {t.selectPatientLabel}
                  </label>
                  <select id="family-rx-patient" value={effectiveRxPatient?.id || ""} onChange={(e) => setSelectedRxPatientId(e.target.value)} className="w-full sm:w-auto min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3.5 py-2 text-base sm:text-sm font-semibold text-slate-900 dark:text-white">
                    {patients.map((p) => (<option key={p.id} value={p.id}>
                        {p.fullName}{p.district ? ` (${p.district})` : ""} • {(p.prescriptions ?? []).length}
                      </option>))}
                  </select>
                  <button type="button" onClick={() => setRxFormOpen((v) => !v)} className="inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-teal-700 dark:bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 dark:hover:bg-teal-500 active:scale-[0.98] transition-all">
                    <IconPlus className="h-4 w-4"/>
                    {t.addRxBtn}
                  </button>
                </div>)}
            </div>

            {!effectiveRxPatient ? (<p className="text-sm text-slate-600 dark:text-slate-300 py-4 text-center">
                {t.noPatientsAssigned}
              </p>) : (<div className="space-y-3.5">
                {rxFormOpen && (<form onSubmit={(e) => handleAddRx(e, effectiveRxPatient.id)} className="oc-slide-down rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30 p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      <input id="family-rx-med" name="medicationName" value={rxMed} onChange={(e) => setRxMed(e.target.value)} placeholder={t.rxMedPlaceholder} aria-label={t.rxMedPlaceholder} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white" required/>
                      <input id="family-rx-dose" name="dosage" value={rxDose} onChange={(e) => setRxDose(e.target.value)} placeholder={t.rxDosePlaceholder} aria-label={t.rxDosePlaceholder} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white" required/>
                      <input id="family-rx-freq" name="frequency" value={rxFreq} onChange={(e) => {
                        const val = e.target.value;
                        setRxFreq(val);
                        if (!rxReminderEdited) {
                            setRxReminderTimes(inferReminderTimesFromFrequency(val).join(", "));
                        }
                    }} placeholder={t.rxFreqPlaceholder} aria-label={t.rxFreqPlaceholder} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white" required/>
                      <input id="family-rx-duration" name="durationDays" type="number" min={1} max={180} value={rxDurationDays} onChange={(e) => setRxDurationDays(e.target.value)} placeholder={t.rxDurationLabel} aria-label={t.rxDurationLabel} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input id="family-rx-instructions" name="instructionsUz" value={rxInstructions} onChange={(e) => setRxInstructions(e.target.value)} placeholder={t.rxInstructionsPlaceholder} aria-label={t.rxInstructionsLabel} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"/>
                      <input id="family-rx-reminder-times" name="reminderTimes" value={rxReminderTimes} onChange={(e) => {
                        setRxReminderEdited(true);
                        setRxReminderTimes(e.target.value);
                    }} placeholder="08:00, 20:00" aria-label={t.rxReminderTimesLabel} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] px-3.5 py-2.5 font-mono text-base sm:text-sm text-slate-900 dark:text-white"/>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <label className="flex items-center gap-2.5 min-h-[40px] text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
                        <input type="checkbox" checked={rxRemindersEnabled} onChange={(e) => setRxRemindersEnabled(e.target.checked)} className="h-4.5 w-4.5 rounded border-[#D7E4E1] text-teal-600"/>
                        <span>{t.rxRemindersOn}</span>
                      </label>
                      <button type="submit" disabled={rxSubmitting} className="min-h-[46px] w-full sm:w-auto rounded-xl bg-teal-700 dark:bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 dark:hover:bg-teal-500 active:scale-[0.98] transition-all disabled:opacity-50">
                        {rxSubmitting ? "..." : t.saveRxBtn}
                      </button>
                    </div>
                  </form>)}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(effectiveRxPatient.prescriptions ?? []).length === 0 ? (<p className="col-span-full text-sm text-slate-500 dark:text-slate-400 py-3 text-center">{t.noRxYet}</p>) : ((effectiveRxPatient.prescriptions ?? []).map((rx) => (<div key={rx.id} className="rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {rx.medicationName} ({rx.dosage})
                        </span>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${rx.pharmacyStockStatus === "IN_STOCK"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                        : rx.pharmacyStockStatus === "RESERVED"
                            ? "bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"}`}>
                          {rx.pharmacyStockStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {rx.frequency} • {rx.durationDays} {t.daysWord} • {rx.polyclinicPharmacy}
                      </p>
                      {rx.remindersEnabled !== false && (rx.reminderTimes ?? []).length > 0 && (<p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 font-mono text-xs font-semibold text-teal-800 dark:text-teal-300">
                          🔔 {(rx.reminderTimes ?? []).join(", ")}
                        </p>)}
                      <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        {lang === "ru" ? rx.instructionsRu : lang === "en" ? rx.instructionsEn : rx.instructionsUz}
                      </p>
                    </div>)))}
                </div>
              </div>)}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 px-1">
              {t.queueTitle}
            </h2>
            {activeCalls.map((call) => {
                const selected = call.id === selectedCall?.id;
                return (<button key={call.id} onClick={() => { setSelectedCallId(call.id); if (call.patientId) setSelectedRxPatientId(call.patientId); }} className={`w-full text-left rounded-2xl border p-4 min-h-[48px] space-y-2.5 transition-all active:scale-[0.99] ${selected
                        ? "border-teal-600 dark:border-teal-500 bg-teal-50/70 dark:bg-teal-950/50 ring-1 ring-teal-500 shadow-sm"
                        : "med-card-interactive border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] hover:border-teal-400 dark:hover:border-teal-700"}`}>
                  <div className="flex items-start justify-between gap-2.5">
                    <div>
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {call.patient.fullName}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {call.district}{call.patient.mahalla ? `, ${call.patient.mahalla}` : ""}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${call.riskScore >= 80
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"}`}>
                      {t.riskWord} {call.riskScore}
                    </span>
                  </div>

                  {data?.simState && (<SlaCountdownBadge dischargedAt={call.dischargedAt} slaDeadlineAt={call.slaDeadlineAt} simulatedNow={data.simState.simulatedNow} dataLoadedAtMs={dataLoadedAtMs} status={call.status}/>)}

                  {call.symptomCheckins.some((s) => s.aiTriageLevel === "RED_EMERGENCY") && (<div className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1.5">
                      <IconAlertTriangle className="h-4 w-4 shrink-0"/>
                      {t.emergencyBanner}
                    </div>)}
                </button>);
            })}
          </div>

          <div className="lg:col-span-8">
            {!selectedCall ? (<div className="med-card p-8 text-center text-base text-slate-600 dark:text-slate-300">
                {t.noCalls}
              </div>) : (<div className="space-y-5">
                <div className="med-card p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                          {selectedCall.patient.fullName}
                        </h2>
                        <span className="rounded-lg bg-[#EDF5F3] dark:bg-[#16272B] border border-[#D7E4E1] dark:border-[#1E353A] px-2.5 py-0.5 font-mono text-xs text-slate-700 dark:text-slate-200">
                          {selectedCall.patient.jshshirMasked}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        {t.addressLabel}{" "}
                        <strong className="text-slate-900 dark:text-white">
                          {selectedCall.patient.address}
                        </strong>{" "}
                        {selectedCall.patient.mahalla ? `(${selectedCall.patient.mahalla})` : ""} •{" "}
                        {selectedCall.patient.phone}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {t.windowLabel}{" "}
                        <strong className="text-slate-800 dark:text-slate-100">
                          {new Date(selectedCall.scheduledWindowStart).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
                          –
                          {new Date(selectedCall.scheduledWindowEnd).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
                        </strong>{" "}
                        • {selectedCall.assignedDoctor.fullName}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {data?.simState && (<SlaCountdownBadge dischargedAt={selectedCall.dischargedAt} slaDeadlineAt={selectedCall.slaDeadlineAt} simulatedNow={data.simState.simulatedNow} dataLoadedAtMs={dataLoadedAtMs} status={selectedCall.status}/>)}
                      <button onClick={() => setTraceModal({
                    patientName: selectedCall.patient.fullName,
                    trace: selectedCall.aiAgentTrace,
                })} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#16272B] px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-teal-500 active:scale-[0.98] transition-all">
                        <IconRobot className="h-4 w-4 text-teal-600 dark:text-teal-400"/>
                        {t.aiTraceBtn}
                      </button>
                      <button onClick={() => setFhirCallId(selectedCall.id)} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#16272B] px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-teal-500 active:scale-[0.98] transition-all">
                        <IconFileCode className="h-4 w-4 text-indigo-600 dark:text-indigo-400"/>
                        {t.viewFhirBtn}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40 p-4">
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-1.5">
                      <IconAlertTriangle className="h-4 w-4"/>
                      {t.redFlagsTitle} {selectedCall.riskScore}/100)
                    </h3>
                    <ul className="space-y-1.5 text-sm text-rose-900 dark:text-rose-200 list-disc pl-5">
                      {selectedCall.redFlags.map((flag, i) => (<li key={i}>{flag}</li>))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {t.checklistTitle}
                      </h3>
                      <button onClick={() => handleOrderFollowupLab(selectedCall.patientId, "Uy sharoitida Qayta Gemoglobin & Siydik Oqsili")} disabled={orderingLab} className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-teal-700 dark:bg-teal-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-teal-800 dark:hover:bg-teal-500 active:scale-[0.98] transition-all">
                        <IconFlask className="h-4 w-4"/>
                        {t.oneClickLabBtn}
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      {selectedCall.checklist.map((item) => (<label key={item.id} className={`flex items-start gap-3 rounded-xl border p-3.5 min-h-[48px] cursor-pointer transition-all ${item.checked
                        ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40"
                        : "border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] hover:border-teal-400 dark:hover:border-teal-700"}`}>
                          <input type="checkbox" checked={item.checked} onChange={(e) => handleToggleChecklist(selectedCall.id, item.id, e.target.checked)} className="mt-0.5 h-5 w-5 rounded border-[#D7E4E1] dark:border-[#1E353A] text-teal-600 focus:ring-teal-500"/>
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${item.checked
                        ? "line-through text-slate-500 dark:text-slate-400"
                        : "text-slate-900 dark:text-white"}`}>
                              {lang === "ru" ? item.titleRu : lang === "en" ? item.titleEn : item.titleUz}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-white dark:bg-[#101E21] border border-[#D7E4E1] dark:border-[#1E353A] px-2.5 py-0.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                            {item.category}
                          </span>
                        </label>))}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleVerifyVisit} className="med-card p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {t.vitalsTitle}
                    </h3>
                    {selectedCall.visitVerifiedAt && (<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <IconCircleCheck className="h-4 w-4"/>
                        {t.verifiedLabel} ({selectedCall.verificationMethod})
                      </span>)}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label htmlFor="vitals-sbp" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                        {t.sbpLabel}
                      </label>
                      <input id="vitals-sbp" name="systolicBp" type="number" value={sbp} onChange={(e) => setSbp(e.target.value)} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3 py-2 font-mono text-base sm:text-sm text-slate-900 dark:text-white" required/>
                    </div>
                    <div>
                      <label htmlFor="vitals-dbp" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                        {t.dbpLabel}
                      </label>
                      <input id="vitals-dbp" name="diastolicBp" type="number" value={dbp} onChange={(e) => setDbp(e.target.value)} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3 py-2 font-mono text-base sm:text-sm text-slate-900 dark:text-white" required/>
                    </div>
                    <div>
                      <label htmlFor="vitals-hr" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                        {t.hrLabel}
                      </label>
                      <input id="vitals-hr" name="heartRate" type="number" value={hr} onChange={(e) => setHr(e.target.value)} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3 py-2 font-mono text-base sm:text-sm text-slate-900 dark:text-white" required/>
                    </div>
                    <div>
                      <label htmlFor="vitals-temp" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                        {t.tempLabel}
                      </label>
                      <input id="vitals-temp" name="tempC" type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3 py-2 font-mono text-base sm:text-sm text-slate-900 dark:text-white" required/>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="vitals-spo2" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                        <InfoTooltip label={t.spo2Label} explanation={t.spo2Tip}/>
                      </label>
                      <input id="vitals-spo2" name="spo2" type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} className="w-full min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3 py-2 font-mono text-base sm:text-sm text-slate-900 dark:text-white" required/>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="vitals-notes" className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                      {t.visitNotesLabel}
                    </label>
                    <textarea id="vitals-notes" name="visitNotes" rows={3} value={visitNotes} onChange={(e) => setVisitNotes(e.target.value)} className="w-full min-h-[84px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white" required/>
                  </div>

                  <button type="submit" disabled={verifying || selectedCall.status === "COMPLETED"} className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-teal-700 dark:bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 dark:hover:bg-teal-500 active:scale-[0.98] transition-all disabled:opacity-50">
                    <IconSend className="h-4 w-4"/>
                    {selectedCall.status === "COMPLETED"
                    ? t.verifyDoneBtn
                    : verifying
                        ? t.verifySavingBtn
                        : t.verifySubmitBtn}
                  </button>
                </form>

                {(selectedCall.patient?.wellbeingCheckins ?? []).length > 0 && (() => {
                    const checkins = selectedCall.patient.wellbeingCheckins || [];
                    const latestEpds = checkins.find((c) => typeof c.epdsScore === "number");
                    const hasSelfHarm = checkins.some((c) => c.epdsSelfHarmFlag || c.riskFlag === "SELF_HARM_CRITICAL");
                    const hasPsychRisk = checkins.some((c) => c.riskFlag === "PSYCH_RISK" || (typeof c.epdsScore === "number" && c.epdsScore >= 13));
                    return (<div className="space-y-3">
                        <div className="med-card flex flex-wrap items-center justify-between gap-2 px-4 py-3.5">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {t.wellbeingSectionTitle} ({checkins.length})
                          </span>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                            {latestEpds && (<span className="rounded-full bg-[#EDF5F3] dark:bg-[#16272B] border border-[#D7E4E1] dark:border-[#1E353A] px-3 py-1 font-mono text-slate-700 dark:text-slate-200">
                                {t.latestEpdsLabel} {latestEpds.epdsScore}/30
                              </span>)}
                            {hasSelfHarm ? (<span className="rounded-full bg-rose-600 px-3 py-1 text-white">
                                {t.selfHarmAlert}
                              </span>) : hasPsychRisk ? (<span className="rounded-full bg-amber-100 dark:bg-amber-950/70 px-3 py-1 text-amber-800 dark:text-amber-300">
                                {t.psychRiskAlert}
                              </span>) : null}
                          </div>
                        </div>
                        <VitalsTrendChart records={checkins} mode="mood"/>
                      </div>);
                })()}

                {selectedCall.symptomCheckins.length > 0 && (<div className="med-card p-5 space-y-3">
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <IconHeartbeat className="h-4 w-4 text-rose-600 dark:text-rose-400"/>
                      {t.patientCheckinsTitle} ({selectedCall.symptomCheckins.length})
                    </h3>
                    {selectedCall.symptomCheckins.map((sc) => {
                        const activePrimary = PRIMARY_RED_FLAG_SYMPTOMS.filter((sym) => sym.key === "fever"
                            ? sc.fever
                            : sym.key === "severeHeadache"
                                ? sc.severeHeadache
                                : sym.key === "bleeding"
                                    ? sc.bleeding
                                    : sc.swelling);
                        const extraList = sc.additionalSymptoms ?? [];
                        const customList = sc.customConditions ?? [];
                        return (<div key={sc.id} className={`rounded-xl border p-3.5 text-sm space-y-2 ${sc.aiTriageLevel === "RED_EMERGENCY"
                                ? "border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200"
                                : sc.aiTriageLevel === "YELLOW"
                                    ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200"
                                    : "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200"}`}>
                          <div className="flex items-center justify-between font-bold">
                            <span>
                              {sc.aiTriageLevel} • BP {sc.bpReading}
                            </span>
                            <span className="font-mono text-xs opacity-80">
                              {new Date(sc.createdAt).toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                            </span>
                          </div>
                          {(activePrimary.length > 0 ||
                                extraList.length > 0 ||
                                customList.length > 0) && (<div className="flex flex-wrap gap-1.5">
                              {activePrimary.map((sym) => (<span key={sym.key} className="rounded-full bg-white/85 dark:bg-[#101E21]/85 border border-current/25 px-2.5 py-0.5 text-xs font-semibold">
                                  {lang === "ru" ? sym.ru : lang === "en" ? sym.en : sym.uz}
                                </span>))}
                              {extraList.map((id) => (<span key={id} className="rounded-full bg-white/85 dark:bg-[#101E21]/85 border border-current/25 px-2.5 py-0.5 text-xs font-semibold">
                                  {getSymptomLabel(id, lang)}
                                </span>))}
                              {customList.map((c) => {
                                    const sev = getSeverityMeta(c.severity);
                                    const sevLabel = lang === "ru" ? sev.ru : lang === "en" ? sev.en : sev.uz;
                                    return (<span key={c.id} className="rounded-full bg-white/95 dark:bg-[#101E21]/90 border border-current/30 px-2.5 py-0.5 text-xs font-semibold">
                                    {c.name} • {sevLabel}
                                  </span>);
                                })}
                            </div>)}
                          {sc.notes && (<p className="text-xs sm:text-sm opacity-90">{sc.notes}</p>)}
                        </div>);
                    })}
                  </div>)}

                <div className="med-card p-5 space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <IconBell className="h-4 w-4 text-teal-600 dark:text-teal-400"/>
                    {t.alertsTitle}
                  </h3>
                  {selectedCall.notificationLog.map((n) => (<div key={n.id} className={`rounded-xl border p-3.5 text-sm ${n.severity === "CRITICAL"
                        ? "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200"
                        : n.severity === "WARNING"
                            ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200"
                            : "border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] text-slate-800 dark:text-slate-200"}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 font-semibold mb-1">
                        <span>
                          [{n.channel}] {n.recipientName} ({n.recipientHandle})
                        </span>
                        <span className="font-mono text-xs opacity-75">
                          {new Date(n.sentAt).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed">{n.message}</p>
                    </div>))}
                </div>
              </div>)}
          </div>
        </div>
        </div>);
        })()}

      <FhirBundleModal activeCallId={fhirCallId} onClose={() => setFhirCallId(null)}/>
      <AgentTraceModal open={Boolean(traceModal)} patientName={traceModal?.patientName} trace={traceModal?.trace ?? []} onClose={() => setTraceModal(null)}/>
    </div>);
}
