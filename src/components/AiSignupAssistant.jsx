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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Conversational Gemini 3.5 Flash Chat Panel */}
      <div className="lg:col-span-7 flex flex-col rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF]/60 dark:bg-[#161A18] overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] px-4 py-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-[#244C40] dark:bg-[#2C5B4D] text-[#F7F5EF]">
              <IconSparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8] truncate">
                  {t.headerTitle}
                </h2>
                <span className="hidden sm:inline-block rounded-sm border border-[#A7BBAA] dark:border-[#6E8572] bg-[#EFECE3] dark:bg-[#242A27] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#244C40] dark:text-[#A7BBAA]">
                  {providerLabel === "smart-fallback" ? "Smart Assist" : providerLabel}
                </span>
              </div>
              <p className="text-[11px] text-[#525954] dark:text-[#B8C2BA] truncate">
                {t.headerSub}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex min-h-[34px] items-center gap-1 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#EFECE3] dark:bg-[#242A27] px-2.5 py-1 text-[11px] font-semibold text-[#292E2B] dark:text-[#F3F0E8] hover:border-[#244C40] dark:hover:border-[#A7BBAA] transition-colors shrink-0"
          >
            <IconRefresh className="h-3 w-3" />
            {t.restartBtn}
          </button>
        </div>

        {/* Starter FAQ bar — always visible so users know they can ask questions */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#DDD8CC] dark:border-[#2F3733] bg-[#EFECE3]/60 dark:bg-[#1D221F]/60 px-4 py-2">
          {starterFaq.map((chip) => (
            <button
              key={chip.value}
              type="button"
              disabled={aiBusy}
              onClick={() => submitAnswer(chip.value, chip.label, { isQuestionChip: true })}
              className="rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#161A18] px-2.5 py-1 text-[10px] font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:border-[#244C40] dark:hover:border-[#A7BBAA] disabled:opacity-50 transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-1 max-h-[360px] min-h-[260px] overflow-y-auto p-4 space-y-3"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-[#EFECE3] dark:bg-[#242A27] text-[#244C40] dark:text-[#A7BBAA] border border-[#DDD8CC] dark:border-[#2F3733]">
                  <IconRobot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-sm px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                  msg.sender === "user"
                    ? "bg-[#244C40] dark:bg-[#2C5B4D] text-[#F7F5EF]"
                    : "bg-[#FFFFFF] dark:bg-[#1D221F] text-[#292E2B] dark:text-[#F3F0E8] border border-[#DDD8CC] dark:border-[#2F3733]"
                }`}
              >
                {msg.text}
                {Array.isArray(msg.filledFields) && msg.filledFields.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-[#DDD8CC]/70 dark:border-[#2F3733] flex flex-wrap gap-1">
                    {msg.filledFields.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-0.5 rounded-sm bg-[#EFECE3] dark:bg-[#242A27] px-1.5 py-0.5 text-[10px] font-semibold text-[#244C40] dark:text-[#A7BBAA]"
                      >
                        <IconCheck className="h-2.5 w-2.5" />
                        {t.autoFilledNotice}: {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {aiBusy && (
            <div className="flex items-start gap-2.5 justify-start">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-[#EFECE3] dark:bg-[#242A27] text-[#244C40] dark:text-[#A7BBAA] border border-[#DDD8CC] dark:border-[#2F3733]">
                <IconRobot className="h-4 w-4" />
              </div>
              <div className="rounded-sm px-3.5 py-2.5 text-xs bg-[#FFFFFF] dark:bg-[#1D221F] text-[#525954] dark:text-[#B8C2BA] border border-[#DDD8CC] dark:border-[#2F3733] italic">
                {t.thinking}
              </div>
            </div>
          )}

          {activeChips.length > 0 && !isComplete && !aiBusy && activeChips !== starterFaq && (
            <div className="flex flex-wrap gap-1.5 pl-9 pt-1">
              {activeChips.map((chip) => (
                <button
                  key={`${chip.value}-${chip.label}`}
                  type="button"
                  onClick={() =>
                    submitAnswer(chip.value, chip.label, {
                      isQuestionChip: isLikelyQuestion(chip.value),
                    })
                  }
                  className="min-h-[36px] rounded-sm border border-[#A7BBAA] dark:border-[#6E8572] bg-[#FFFFFF] dark:bg-[#1D221F] px-3 py-1.5 text-[11px] font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:bg-[#EFECE3] dark:hover:bg-[#242A27] transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mx-3 mb-2 flex flex-wrap items-center justify-between gap-2 border-l-4 border-[#9E4747] bg-[#F3EAE7] dark:bg-[#2E1E1D] px-3.5 py-2.5 text-xs text-[#7A2E2E] dark:text-[#F0C8C4]">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <IconAlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </span>
            <button
              type="button"
              onClick={handleChangeEmail}
              className="rounded-sm bg-[#FFFFFF] dark:bg-[#1D221F] px-2.5 py-1.5 text-[11px] font-semibold text-[#7A2E2E] dark:text-[#F0C8C4] border border-[#D9B8AE] dark:border-[#7A2E2E] hover:bg-[#F7F5EF] transition-colors"
            >
              {t.changeEmailBtn}
            </button>
          </div>
        )}

        <div className="border-t border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] p-3 space-y-2.5">
          {isComplete && (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => onCreateAccount(draft)}
                className="flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-sm bg-[#244C40] dark:bg-[#2C5B4D] px-4 py-2.5 text-xs font-semibold text-[#F7F5EF] hover:bg-[#1B3A31] dark:hover:bg-[#356C5C] disabled:opacity-50 transition-colors"
              >
                <IconUserPlus className="h-4 w-4" />
                {busy ? t.creatingBtn : t.createBtn}
              </button>
              <button
                type="button"
                onClick={() => onSwitchToForm(draft)}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF] dark:bg-[#161A18] px-3.5 py-2.5 text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8] hover:border-[#244C40] dark:hover:border-[#A7BBAA] transition-colors"
              >
                <IconEdit className="h-3.5 w-3.5" />
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
              className="min-h-[44px] flex-1 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF]/60 dark:bg-[#161A18] px-3.5 py-2 text-xs sm:text-sm text-[#292E2B] dark:text-[#F3F0E8] placeholder:text-[#767E78] focus:border-[#244C40] dark:focus:border-[#A7BBAA] focus:outline-none transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || aiBusy}
              aria-label={t.sendAria}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-[#244C40] dark:bg-[#2C5B4D] text-[#F7F5EF] hover:bg-[#1B3A31] dark:hover:bg-[#356C5C] disabled:opacity-40 transition-colors"
            >
              <IconSend className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Live Auto-Filled Profile Summary Panel */}
      <div className="lg:col-span-5 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#EFECE3]/50 dark:bg-[#1D221F] p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-[#292E2B] dark:text-[#F3F0E8]">
              {t.previewTitle}
            </h3>
            <span className="border border-[#A7BBAA] dark:border-[#6E8572] bg-[#FFFFFF] dark:bg-[#161A18] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#244C40] dark:text-[#A7BBAA]">
              {t.progressLabel}: {progress}%
            </span>
          </div>

          <div className="h-1.5 w-full bg-[#DDD8CC] dark:bg-[#2F3733] overflow-hidden">
            <div
              className="h-full bg-[#244C40] dark:bg-[#A7BBAA] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <dl className="divide-y divide-[#DDD8CC] dark:divide-[#2F3733] text-xs">
            {summaryRows.map((row) => {
              const justFilled = recentlyFilled.includes(row.key);
              return (
                <div
                  key={row.key}
                  className={`flex items-center justify-between gap-2 py-2 px-1 transition-colors ${
                    justFilled ? "bg-[#A7BBAA]/20 dark:bg-[#244C40]/30" : ""
                  }`}
                >
                  <dt className="text-[#525954] dark:text-[#B8C2BA] shrink-0">{row.label}</dt>
                  <dd className="flex items-center gap-1.5 font-semibold text-right truncate">
                    {row.filled ? (
                      <>
                        <span className="text-[#292E2B] dark:text-[#F3F0E8] truncate max-w-[170px]">
                          {row.value}
                        </span>
                        <IconCheck className="h-3.5 w-3.5 shrink-0 text-[#244C40] dark:text-[#A7BBAA]" />
                      </>
                    ) : (
                      <span className="text-[#767E78] dark:text-[#8E9890] font-normal italic">
                        {t.pendingAnswer}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        <div className="space-y-2 pt-2 border-t border-[#DDD8CC] dark:border-[#2F3733]">
          <GpsConsentButton
            label={t.shareGpsBtn}
            className="w-full inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-sm border border-[#244C40] dark:border-[#A7BBAA] bg-[#FFFFFF] dark:bg-[#161A18] px-3 py-2 text-xs font-semibold text-[#244C40] dark:text-[#A7BBAA] hover:bg-[#EFECE3] dark:hover:bg-[#242A27] transition-colors"
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
            <p className="inline-flex items-center gap-1 text-[11px] text-[#525954] dark:text-[#B8C2BA]">
              <IconMapPin className="h-3 w-3 shrink-0 text-[#244C40] dark:text-[#A7BBAA]" />
              {gpsNotice}
            </p>
          )}
          <button
            type="button"
            onClick={() => onSwitchToForm(draft)}
            className="w-full inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#161A18] px-3 py-2 text-xs font-semibold text-[#292E2B] dark:text-[#F3F0E8] hover:border-[#244C40] dark:hover:border-[#A7BBAA] transition-colors"
          >
            <IconEdit className="h-3.5 w-3.5" />
            {t.editInFormBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
