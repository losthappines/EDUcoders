"use client";
import React, { useRef, useState } from "react";
import {
  IconAlertTriangle,
  IconCheck,
  IconEdit,
  IconMapPin,
  IconRefresh,
  IconRobot,
  IconSend,
  IconSparkles,
  IconUserPlus,
} from "@tabler/icons-react";
import {
  createInitialDraft,
  getNextStep,
  getProgressPercent,
  getStarterFaqChips,
  getStepPrompt,
  isLikelyQuestion,
  processAiAnswer,
} from "@/lib/ai-signup-helper";
import { GpsConsentButton } from "@/components/GpsConsentButton";

const UI_COPY = {
  uz: {
    headerTitle: "OnaCare Gemini 3.5 Flash Yordamchisi",
    headerSub: "Savol bering yoki ma'lumotlaringizni yozing — SI o'zi javob beradi va shaklni to'ldiradi",
    restartBtn: "Qayta boshlash",
    editInFormBtn: "Shaklga o'tkazib tahrirlash",
    createBtn: "Hisobni yaratish",
    creatingBtn: "Yaratilmoqda...",
    previewTitle: "SI to'ldirgan ma'lumotlar",
    progressLabel: "Tayyorlik",
    roleField: "Rol",
    nameField: "F.I.O.",
    dobField: "Tug'ilgan sana",
    deliveryField: "Chaqaloq tug'ilgan sana",
    phoneField: "Telefon",
    locationField: "Hudud va tuman",
    gpsField: "GPS koordinata",
    shareGpsBtn: "Jonli GPS ulashish",
    gpsShared: "GPS ulashildi",
    gpsError: "GPS ruxsati olinmadi — hudud bo'yicha avtomatik koordinata qo'llanadi.",
    mahallaField: "Mahalla",
    bloodField: "Qon guruhi",
    specialtyField: "Soha / Mutaxassislik",
    expertiseField: "Ekspertiza",
    experienceField: "Tajriba (yil)",
    emailField: "Elektron pochta",
    passwordField: "Parol",
    pendingAnswer: "Kutilmoqda...",
    optionalTag: "ixtiyoriy",
    passwordSet: "O'rnatildi (himoyalangan)",
    changeEmailBtn: "Boshqa elektron pochta kiritish",
    sendAria: "Xabarni yuborish",
    thinking: "Gemini 3.5 Flash javob tayyorlamoqda...",
    askAnyHint: "Yana savolingiz bormi yoki biror ma'lumotni o'zgartirasizmi? Yozing...",
    welcomeExtra:
      "Savol berishingiz (masalan, 24 soatlik tashrif yoki maxfiylik haqida) yoxud bir nechta ma'lumotingizni birdaniga yozishingiz mumkin.",
    autoFilledNotice: "To'ldirildi",
    personaLabels: {
      PATIENT: "Bemor / Ona",
      DOCTOR: "Shifokor",
      NURSE: "Kuzatuv hamshirasi",
      PSYCHOLOGIST: "Perinatal psixolog",
      ADMIN_RECEPTION: "Poliklinika koordinatori",
    },
  },
  ru: {
    headerTitle: "ИИ-помощник OnaCare · Gemini 3.5 Flash",
    headerSub: "Задавайте любые вопросы или пишите данные сразу — ИИ ответит и заполнит анкету",
    restartBtn: "Начать заново",
    editInFormBtn: "Открыть в форме",
    createBtn: "Создать аккаунт",
    creatingBtn: "Создание...",
    previewTitle: "Автозаполненная анкета",
    progressLabel: "Готовность",
    roleField: "Роль",
    nameField: "ФИО",
    dobField: "Дата рождения",
    deliveryField: "Дата родов (малыша)",
    phoneField: "Телефон",
    locationField: "Регион и район",
    gpsField: "GPS-координаты",
    shareGpsBtn: "Поделиться GPS",
    gpsShared: "GPS добавлен",
    gpsError: "Не удалось получить GPS — используются координаты района.",
    mahallaField: "Махалля",
    bloodField: "Группа крови",
    specialtyField: "Сфера / Специальность",
    expertiseField: "Экспертиза",
    experienceField: "Стаж (лет)",
    emailField: "Электронная почта",
    passwordField: "Пароль",
    pendingAnswer: "Ожидается...",
    optionalTag: "необяз.",
    passwordSet: "Задан (защищен)",
    changeEmailBtn: "Указать другой email",
    sendAria: "Отправить сообщение",
    thinking: "Gemini 3.5 Flash думает...",
    askAnyHint: "Есть вопрос об OnaCare или нужно изменить данные? Напишите...",
    welcomeExtra:
      "Вы можете задать любой вопрос (о бесплатном визите, конфиденциальности, Telegram-боте) или сразу указать несколько данных в одном сообщении.",
    autoFilledNotice: "Заполнено",
    personaLabels: {
      PATIENT: "Пациент / Мама",
      DOCTOR: "Врач",
      NURSE: "Медсестра наблюдения",
      PSYCHOLOGIST: "Перинатальный психолог",
      ADMIN_RECEPTION: "Координатор клиники",
    },
  },
  en: {
    headerTitle: "OnaCare AI Assistant · Gemini 3.5 Flash",
    headerSub: "Ask questions anytime or share your details naturally — AI answers and fills your profile",
    restartBtn: "Restart",
    editInFormBtn: "Review & Edit in Form",
    createBtn: "Create Account",
    creatingBtn: "Creating account...",
    previewTitle: "Auto-Filled Profile",
    progressLabel: "Progress",
    roleField: "Role",
    nameField: "Full Name",
    dobField: "Date of Birth",
    deliveryField: "Baby Delivery Date",
    phoneField: "Phone",
    locationField: "Region & District",
    gpsField: "GPS Coordinates",
    shareGpsBtn: "Share Live GPS",
    gpsShared: "GPS shared",
    gpsError: "GPS permission denied — district center coordinates will be used.",
    mahallaField: "Mahalla",
    bloodField: "Blood Type",
    specialtyField: "Field / Specialty",
    expertiseField: "Expertise",
    experienceField: "Experience (yrs)",
    emailField: "Email",
    passwordField: "Password",
    pendingAnswer: "Waiting...",
    optionalTag: "optional",
    passwordSet: "Set (protected)",
    changeEmailBtn: "Try a different email",
    sendAria: "Send message",
    thinking: "Gemini 3.5 Flash is thinking...",
    askAnyHint: "Ask a question about OnaCare or request a change (e.g., change district)...",
    welcomeExtra:
      "You can ask questions anytime (about the 24h home visit, privacy, verification, or blood type) or share multiple details in one message.",
    autoFilledNotice: "Filled",
    personaLabels: {
      PATIENT: "Patient / Mother",
      DOCTOR: "Doctor",
      NURSE: "Monitoring Nurse",
      PSYCHOLOGIST: "Perinatal Psychologist",
      ADMIN_RECEPTION: "Clinic Coordinator",
    },
  },
};

export function AiSignupAssistant({
  persona,
  initialDraft,
  lang,
  busy,
  error,
  onDraftChange,
  onSwitchToForm,
  onCreateAccount,
  onClearError,
}) {
  const t = UI_COPY[lang] || UI_COPY.uz;
  const [draft, setDraft] = useState(initialDraft);
  const [messages, setMessages] = useState(() => [
    {
      id: "ai-welcome",
      sender: "ai",
      text: `${t.welcomeExtra}\n\n${getStepPrompt(initialDraft, lang).message}`,
    },
  ]);
  const [suggestedChips, setSuggestedChips] = useState(null);
  const [recentlyFilled, setRecentlyFilled] = useState([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [providerLabel, setProviderLabel] = useState("gemini-3.5-flash");
  const [inputValue, setInputValue] = useState("");
  const [gpsNotice, setGpsNotice] = useState(null);
  const scrollContainerRef = useRef(null);
  const msgSeqRef = useRef(1);

  const nextId = (prefix) => {
    const seq = msgSeqRef.current;
    msgSeqRef.current += 1;
    return `${prefix}-${seq}`;
  };

  const stepPrompt = getStepPrompt(draft, lang);
  const currentStep = getNextStep(draft);
  const progress = getProgressPercent(draft);
  const isComplete = currentStep === "complete";
  const starterFaq = getStarterFaqChips(persona, lang);

  // Contextual chips inside the chat thread (AI suggestions or step quick-picks)
  const activeChips =
    suggestedChips && suggestedChips.length > 0 ? suggestedChips : stepPrompt.chips;

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = scrollContainerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  };

  const submitAnswer = async (rawText, displayLabel, opts = {}) => {
    const trimmed = String(rawText || "").trim();
    if (!trimmed || aiBusy) return;
    onClearError();

    const stepNow = getNextStep(draft);
    const treatAsPassword =
      stepNow === "password" && !opts.isQuestionChip && !isLikelyQuestion(trimmed);

    // Password is ALWAYS processed locally in the browser and NEVER sent to the LLM endpoint
    if (treatAsPassword) {
      const { nextDraft, reply, maskedUserMessage, filledFields } = processAiAnswer(
        draft,
        trimmed,
        lang
      );
      const userText = maskedUserMessage ?? displayLabel ?? trimmed;
      setDraft(nextDraft);
      onDraftChange(nextDraft);
      setRecentlyFilled(filledFields || []);
      setSuggestedChips(null);
      setMessages((prev) => [
        ...prev,
        { id: nextId("u"), sender: "user", text: userText },
        { id: nextId("a"), sender: "ai", text: reply },
      ]);
      setInputValue("");
      scrollToBottom();
      return;
    }

    const userText = displayLabel ?? trimmed;
    const uId = nextId("u");
    const nextHistory = [...messages, { id: uId, sender: "user", text: userText }];
    setMessages(nextHistory);
    setInputValue("");
    setAiBusy(true);
    scrollToBottom();

    try {
      const safePayloadDraft = { ...draft, hasPassword: Boolean(draft.password && draft.password.length >= 6) };
      delete safePayloadDraft.password;

      const res = await fetch("/api/ai/signup-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          lang,
          draft: safePayloadDraft,
          history: messages.slice(-8).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const json = await res.json();
      if (res.ok && json.ok && json.nextDraft) {
        const mergedDraft = {
          ...json.nextDraft,
          password: draft.password || "",
        };
        setDraft(mergedDraft);
        onDraftChange(mergedDraft);
        setRecentlyFilled(Array.isArray(json.filledFields) ? json.filledFields : []);
        setSuggestedChips(Array.isArray(json.chips) && json.chips.length > 0 ? json.chips : null);
        if (json.provider) {
          setProviderLabel(json.provider);
        }
        setMessages((prev) => [
          ...prev,
          {
            id: nextId("a"),
            sender: "ai",
            text: json.reply,
            filledFields: json.filledFields || [],
          },
        ]);
      } else {
        // Local deterministic fallback if API returns rate-limit or network error
        const local = processAiAnswer(draft, trimmed, lang);
        setDraft(local.nextDraft);
        onDraftChange(local.nextDraft);
        setRecentlyFilled(local.filledFields || []);
        setSuggestedChips(null);
        setMessages((prev) => [
          ...prev,
          { id: nextId("a"), sender: "ai", text: local.reply, filledFields: local.filledFields || [] },
        ]);
      }
    } catch {
      const local = processAiAnswer(draft, trimmed, lang);
      setDraft(local.nextDraft);
      onDraftChange(local.nextDraft);
      setRecentlyFilled(local.filledFields || []);
      setSuggestedChips(null);
      setMessages((prev) => [
        ...prev,
        { id: nextId("a"), sender: "ai", text: local.reply, filledFields: local.filledFields || [] },
      ]);
    } finally {
      setAiBusy(false);
      scrollToBottom();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    submitAnswer(inputValue);
  };

  const handleRestart = () => {
    onClearError();
    const fresh = createInitialDraft(persona);
    setDraft(fresh);
    onDraftChange(fresh);
    setInputValue("");
    setSuggestedChips(null);
    setRecentlyFilled([]);
    setMessages([
      {
        id: nextId("ai-reset"),
        sender: "ai",
        text: `${t.welcomeExtra}\n\n${getStepPrompt(fresh, lang).message}`,
      },
    ]);
  };

  const handleChangeEmail = () => {
    onClearError();
    const updated = { ...draft, email: "" };
    setDraft(updated);
    onDraftChange(updated);
    setSuggestedChips(null);
    const prompt = getStepPrompt(updated, lang);
    setMessages((prev) => [...prev, { id: nextId("ai-email"), sender: "ai", text: prompt.message }]);
    scrollToBottom();
  };

  const hasGps = typeof draft.latitude === "number" && typeof draft.longitude === "number";
  const summaryRows = [
    {
      key: "role",
      label: t.roleField,
      value:
        persona === "DOCTOR" && draft.doctorTypePicked
          ? `${t.personaLabels.DOCTOR} (${draft.role === "OVABMU_MD" ? "OvaBMU" : "Family Clinic"})`
          : t.personaLabels[persona],
      filled: persona !== "DOCTOR" || draft.doctorTypePicked,
    },
    { key: "fullName", label: t.nameField, value: draft.fullName, filled: Boolean(draft.fullName) },
    { key: "dateOfBirth", label: t.dobField, value: draft.dateOfBirth, filled: Boolean(draft.dateOfBirth) },
    { key: "phone", label: t.phoneField, value: draft.phone, filled: Boolean(draft.phone) },
    {
      key: "district",
      label: t.locationField,
      value: [draft.district, draft.region].filter(Boolean).join(", "),
      filled: Boolean(draft.district),
    },
    {
      key: "gps",
      label: t.gpsField,
      value: hasGps ? `${draft.latitude.toFixed(4)}, ${draft.longitude.toFixed(4)}` : "",
      filled: hasGps,
    },
  ];

  if (persona === "PATIENT") {
    summaryRows.push(
      { key: "mahalla", label: t.mahallaField, value: draft.mahalla, filled: Boolean(draft.mahalla) },
      { key: "bloodType", label: t.bloodField, value: draft.bloodType, filled: Boolean(draft.bloodType) }
    );
    if (draft.deliveryDate) {
      summaryRows.push({
        key: "deliveryDate",
        label: t.deliveryField,
        value: draft.deliveryDate,
        filled: true,
      });
    }
  } else if (persona === "DOCTOR" || persona === "NURSE" || persona === "PSYCHOLOGIST") {
    summaryRows.push(
      { key: "specialty", label: t.specialtyField, value: draft.specialty, filled: Boolean(draft.specialty) },
      { key: "expertiseArea", label: t.expertiseField, value: draft.expertiseArea, filled: Boolean(draft.expertiseArea) },
      {
        key: "experienceYears",
        label: t.experienceField,
        value:
          draft.experienceYears !== "" &&
          draft.experienceYears !== null &&
          draft.experienceYears !== undefined
            ? `${draft.experienceYears}`
            : "",
        filled:
          draft.experienceYears !== "" &&
          draft.experienceYears !== null &&
          draft.experienceYears !== undefined,
      }
    );
  }

  summaryRows.push(
    { key: "email", label: t.emailField, value: draft.email, filled: Boolean(draft.email) },
    {
      key: "password",
      label: t.passwordField,
      value: draft.password.length >= 6 ? t.passwordSet : "",
      filled: draft.password.length >= 6,
    }
  );

  const isPasswordStep = currentStep === "password";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 oc-fade-in">
      {/* Conversational Gemini 3.5 Flash Chat Panel */}
      <div className="lg:col-span-7 flex flex-col rounded-2xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] overflow-hidden shadow-xs">
        <div className="flex items-center justify-between gap-2 border-b border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-4 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 dark:bg-teal-600 text-white shadow-xs">
              <IconSparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-sm font-bold text-slate-900 dark:text-white truncate">
                  {t.headerTitle}
                </h2>
                <span className="hidden sm:inline-block rounded-full border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 font-mono text-xs font-semibold text-teal-700 dark:text-teal-300">
                  {providerLabel === "smart-fallback" ? "Smart Assist" : providerLabel}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
                {t.headerSub}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#16272B] px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-teal-600 dark:hover:border-teal-400 transition-colors shrink-0"
          >
            <IconRefresh className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.restartBtn}</span>
          </button>
        </div>

        {/* Starter FAQ bar — always visible so users know they can ask questions */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#101E21]/80 px-4 py-2.5">
          {starterFaq.map((chip) => (
            <button
              key={chip.value}
              type="button"
              disabled={aiBusy}
              onClick={() => submitAnswer(chip.value, chip.label, { isQuestionChip: true })}
              className="min-h-[34px] rounded-full border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:border-teal-600 dark:hover:border-teal-400 disabled:opacity-50 transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-1 max-h-[380px] min-h-[260px] overflow-y-auto p-4 space-y-3"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`oc-fade-up flex items-start gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EDF5F3] dark:bg-[#16272B] text-teal-700 dark:text-teal-300 border border-[#D7E4E1] dark:border-[#1E353A]">
                  <IconRobot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-2xs ${
                  msg.sender === "user"
                    ? "bg-teal-700 dark:bg-teal-600 text-white rounded-br-sm"
                    : "bg-white dark:bg-[#101E21] text-slate-900 dark:text-slate-100 border border-[#D7E4E1] dark:border-[#1E353A] rounded-bl-sm"
                }`}
              >
                {msg.text}
                {Array.isArray(msg.filledFields) && msg.filledFields.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-teal-200/50 dark:border-[#1E353A] flex flex-wrap gap-1.5">
                    {msg.filledFields.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 rounded-full bg-[#EDF5F3] dark:bg-[#16272B] px-2.5 py-0.5 text-xs font-semibold text-teal-800 dark:text-teal-200"
                      >
                        <IconCheck className="h-3 w-3" />
                        {t.autoFilledNotice}: {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {aiBusy && (
            <div className="oc-fade-in flex items-start gap-2.5 justify-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EDF5F3] dark:bg-[#16272B] text-teal-700 dark:text-teal-300 border border-[#D7E4E1] dark:border-[#1E353A]">
                <IconRobot className="h-4 w-4 animate-pulse" />
              </div>
              <div className="rounded-2xl px-4 py-3 text-sm bg-white dark:bg-[#101E21] text-slate-600 dark:text-slate-300 border border-[#D7E4E1] dark:border-[#1E353A] italic">
                {t.thinking}
              </div>
            </div>
          )}

          {activeChips.length > 0 && !isComplete && !aiBusy && activeChips !== starterFaq && (
            <div className="flex flex-wrap gap-2 pl-10 pt-1">
              {activeChips.map((chip) => (
                <button
                  key={`${chip.value}-${chip.label}`}
                  type="button"
                  onClick={() =>
                    submitAnswer(chip.value, chip.label, {
                      isQuestionChip: isLikelyQuestion(chip.value),
                    })
                  }
                  className="min-h-[40px] rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-[#101E21] px-3.5 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-[#EDF5F3] dark:hover:bg-[#16272B] transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mx-3 mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-4 py-2.5 text-sm text-rose-800 dark:text-rose-200">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <IconAlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </span>
            <button
              type="button"
              onClick={handleChangeEmail}
              className="rounded-lg bg-white dark:bg-[#101E21] px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 transition-colors"
            >
              {t.changeEmailBtn}
            </button>
          </div>
        )}

        <div className="border-t border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-3.5 space-y-2.5">
          {isComplete && (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => onCreateAccount(draft)}
                className="flex-1 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-teal-700 dark:bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 dark:hover:bg-teal-500 active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm"
              >
                <IconUserPlus className="h-4 w-4" />
                {busy ? t.creatingBtn : t.createBtn}
              </button>
              <button
                type="button"
                onClick={() => onSwitchToForm(draft)}
                className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-teal-600 dark:hover:border-teal-400 transition-colors"
              >
                <IconEdit className="h-4 w-4" />
                {t.editInFormBtn}
              </button>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <label htmlFor="ai-signup-input" className="sr-only">
              {isComplete ? t.askAnyHint : stepPrompt.message}
            </label>
            <input
              id="ai-signup-input"
              type={isPasswordStep ? "password" : stepPrompt.inputType}
              autoComplete={
                isPasswordStep
                  ? "new-password"
                  : stepPrompt.step === "email"
                    ? "email"
                    : stepPrompt.step === "phone"
                      ? "tel"
                      : "off"
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={aiBusy}
              placeholder={isComplete ? t.askAnyHint : stepPrompt.placeholder}
              className="min-h-[46px] flex-1 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-4 py-2 text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-600 dark:focus:border-teal-400 focus:outline-none transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || aiBusy}
              aria-label={t.sendAria}
              className="inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-teal-700 dark:bg-teal-600 text-white hover:bg-teal-800 dark:hover:bg-teal-500 active:scale-[0.96] disabled:opacity-40 transition-all"
            >
              <IconSend className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Live Auto-Filled Profile Summary Panel */}
      <div className="lg:col-span-5 rounded-2xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#101E21] p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading text-xs font-bold uppercase tracking-[0.08em] text-slate-800 dark:text-slate-100">
              {t.previewTitle}
            </h3>
            <span className="rounded-full border border-teal-200 dark:border-teal-800 bg-white dark:bg-[#091315] px-2.5 py-0.5 font-mono text-xs font-semibold text-teal-700 dark:text-teal-300">
              {t.progressLabel}: {progress}%
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-[#D7E4E1] dark:bg-[#1E353A] overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-700 dark:bg-teal-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <dl className="divide-y divide-[#D7E4E1] dark:divide-[#1E353A] text-sm">
            {summaryRows.map((row) => {
              const justFilled = recentlyFilled.includes(row.key);
              return (
                <div
                  key={row.key}
                  className={`flex items-center justify-between gap-2 py-2.5 px-2 rounded-lg transition-colors ${
                    justFilled ? "bg-teal-100/70 dark:bg-teal-950/50" : ""
                  }`}
                >
                  <dt className="text-slate-600 dark:text-slate-400 shrink-0">{row.label}</dt>
                  <dd className="flex items-center gap-1.5 font-semibold text-right truncate">
                    {row.filled ? (
                      <>
                        <span className="text-slate-900 dark:text-white truncate max-w-[180px]">
                          {row.value}
                        </span>
                        <IconCheck className="h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300" />
                      </>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-normal italic text-xs">
                        {t.pendingAnswer}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        <div className="space-y-2.5 pt-3 border-t border-[#D7E4E1] dark:border-[#1E353A]">
          <GpsConsentButton
            label={t.shareGpsBtn}
            className="w-full inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-teal-700 dark:border-teal-500 bg-white dark:bg-[#091315] px-4 py-2.5 text-sm font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-[#16272B] transition-colors"
            onLocationCaptured={({ latitude, longitude }) => {
              const updated = { ...draft, latitude, longitude };
              setDraft(updated);
              onDraftChange(updated);
              setRecentlyFilled(["gps"]);
              setGpsNotice(`${t.gpsShared}: ${latitude}, ${longitude}`);
            }}
            onError={() => setGpsNotice(t.gpsError)}
          />
          {gpsNotice && (
            <p className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <IconMapPin className="h-3.5 w-3.5 shrink-0 text-teal-700 dark:text-teal-300" />
              {gpsNotice}
            </p>
          )}
          <button
            type="button"
            onClick={() => onSwitchToForm(draft)}
            className="w-full inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#091315] px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-teal-600 dark:hover:border-teal-400 transition-colors"
          >
            <IconEdit className="h-4 w-4" />
            {t.editInFormBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
