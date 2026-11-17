"use client";

import React, { useRef, useState } from "react";
import {
  IconAlertTriangle,
  IconCheck,
  IconEdit,
  IconRefresh,
  IconRobot,
  IconSend,
  IconSparkles,
  IconUserPlus,
} from "@tabler/icons-react";
import type { AppLang } from "@/context/LanguageContext";
import {
  createInitialDraft,
  getNextStep,
  getProgressPercent,
  getStepPrompt,
  processAiAnswer,
  type AiSignupDraft,
  type SignupPersona,
} from "@/lib/ai-signup-helper";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
}

interface AiSignupAssistantProps {
  persona: SignupPersona;
  initialDraft: AiSignupDraft;
  lang: AppLang;
  busy: boolean;
  error: string | null;
  onDraftChange: (draft: AiSignupDraft) => void;
  onSwitchToForm: (draft: AiSignupDraft) => void;
  onCreateAccount: (draft: AiSignupDraft) => Promise<void>;
  onClearError: () => void;
}

const UI_COPY: Record<
  AppLang,
  {
    headerTitle: string;
    headerSub: string;
    restartBtn: string;
    editInFormBtn: string;
    createBtn: string;
    creatingBtn: string;
    previewTitle: string;
    progressLabel: string;
    roleField: string;
    nameField: string;
    dobField: string;
    phoneField: string;
    locationField: string;
    mahallaField: string;
    bloodField: string;
    specialtyField: string;
    emailField: string;
    passwordField: string;
    pendingAnswer: string;
    passwordSet: string;
    changeEmailBtn: string;
    sendAria: string;
    personaLabels: Record<SignupPersona, string>;
  }
> = {
  uz: {
    headerTitle: "OnaCare AI Ro'yxatdan O'tish Yordamchisi",
    headerSub: "Savollarga javob bering — AI hisobingizni o'zi to'ldirib beradi",
    restartBtn: "Qayta boshlash",
    editInFormBtn: "Shaklga o'tkazib tahrirlash",
    createBtn: "Hisobni yaratish",
    creatingBtn: "Yaratilmoqda...",
    previewTitle: "AI to'ldirgan ma'lumotlar",
    progressLabel: "Tayyorlik",
    roleField: "Rol",
    nameField: "F.I.O.",
    dobField: "Tug'ilgan sana",
    phoneField: "Telefon",
    locationField: "Hudud va tuman",
    mahallaField: "Mahalla",
    bloodField: "Qon guruhi",
    specialtyField: "Mutaxassislik",
    emailField: "Elektron pochta",
    passwordField: "Parol",
    pendingAnswer: "Kutilmoqda...",
    passwordSet: "O'rnatildi (himoyalangan)",
    changeEmailBtn: "Boshqa email kiritish",
    sendAria: "Javobni yuborish",
    personaLabels: {
      PATIENT: "Bemor / Ona",
      DOCTOR: "Shifokor",
      NURSE: "Kuzatuv hamshirasi",
      ADMIN_RECEPTION: "Poliklinika koordinatori",
    },
  },
  ru: {
    headerTitle: "AI-помощник регистрации OnaCare",
    headerSub: "Отвечайте на вопросы — AI сам заполнит вашу анкету",
    restartBtn: "Начать заново",
    editInFormBtn: "Открыть в форме",
    createBtn: "Создать аккаунт",
    creatingBtn: "Создание...",
    previewTitle: "Автозаполненная анкета",
    progressLabel: "Готовность",
    roleField: "Роль",
    nameField: "ФИО",
    dobField: "Дата рождения",
    phoneField: "Телефон",
    locationField: "Регион и район",
    mahallaField: "Махалля",
    bloodField: "Группа крови",
    specialtyField: "Специальность",
    emailField: "Email",
    passwordField: "Пароль",
    pendingAnswer: "Ожидается...",
    passwordSet: "Задан (защищен)",
    changeEmailBtn: "Указать другой email",
    sendAria: "Отправить ответ",
    personaLabels: {
      PATIENT: "Пациент / Мама",
      DOCTOR: "Врач",
      NURSE: "Медсестра наблюдения",
      ADMIN_RECEPTION: "Координатор клиники",
    },
  },
  en: {
    headerTitle: "OnaCare AI Sign-Up Helper",
    headerSub: "Answer a few questions and AI will fill out your account details",
    restartBtn: "Restart",
    editInFormBtn: "Review & Edit in Form",
    createBtn: "Create Account",
    creatingBtn: "Creating account...",
    previewTitle: "Auto-Filled Profile",
    progressLabel: "Progress",
    roleField: "Role",
    nameField: "Full Name",
    dobField: "Date of Birth",
    phoneField: "Phone",
    locationField: "Region & District",
    mahallaField: "Mahalla",
    bloodField: "Blood Type",
    specialtyField: "Specialty",
    emailField: "Email",
    passwordField: "Password",
    pendingAnswer: "Waiting...",
    passwordSet: "Set (protected)",
    changeEmailBtn: "Try a different email",
    sendAria: "Send reply",
    personaLabels: {
      PATIENT: "Patient / Mother",
      DOCTOR: "Doctor",
      NURSE: "Monitoring Nurse",
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
}: AiSignupAssistantProps) {
  const t = UI_COPY[lang];
  const [draft, setDraft] = useState<AiSignupDraft>(initialDraft);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "ai-welcome",
      sender: "ai",
      text: getStepPrompt(initialDraft, lang).message,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const msgSeqRef = useRef(1);

  const nextId = (prefix: string) => {
    const seq = msgSeqRef.current;
    msgSeqRef.current += 1;
    return `${prefix}-${seq}`;
  };

  const stepPrompt = getStepPrompt(draft, lang);
  const currentStep = getNextStep(draft);
  const progress = getProgressPercent(draft);
  const isComplete = currentStep === "complete";

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = scrollContainerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  };

  const submitAnswer = (rawText: string, displayLabel?: string) => {
    const trimmed = rawText.trim();
    if (!trimmed) return;
    onClearError();

    const { nextDraft, reply, maskedUserMessage } = processAiAnswer(
      draft,
      trimmed,
      lang
    );

    const userText = maskedUserMessage ?? displayLabel ?? trimmed;
    const uId = nextId("u");
    const aId = nextId("a");

    setDraft(nextDraft);
    onDraftChange(nextDraft);
    setMessages((prev) => [
      ...prev,
      { id: uId, sender: "user", text: userText },
      { id: aId, sender: "ai", text: reply },
    ]);
    setInputValue("");
    scrollToBottom();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAnswer(inputValue);
  };

  const handleRestart = () => {
    onClearError();
    const fresh = createInitialDraft(persona);
    setDraft(fresh);
    onDraftChange(fresh);
    setInputValue("");
    const resetId = nextId("ai-reset");
    setMessages([
      {
        id: resetId,
        sender: "ai",
        text: getStepPrompt(fresh, lang).message,
      },
    ]);
  };

  const handleChangeEmail = () => {
    onClearError();
    const updated: AiSignupDraft = { ...draft, email: "" };
    setDraft(updated);
    onDraftChange(updated);
    const prompt = getStepPrompt(updated, lang);
    const emailId = nextId("ai-email");
    setMessages((prev) => [
      ...prev,
      { id: emailId, sender: "ai", text: prompt.message },
    ]);
    scrollToBottom();
  };

  const summaryRows: Array<{ label: string; value: string; filled: boolean }> = [
    {
      label: t.roleField,
      value:
        persona === "DOCTOR" && draft.doctorTypePicked
          ? `${t.personaLabels.DOCTOR} (${draft.role === "OVABMU_MD" ? "OvaBMU" : "Family Clinic"})`
          : t.personaLabels[persona],
      filled: persona !== "DOCTOR" || draft.doctorTypePicked,
    },
    { label: t.nameField, value: draft.fullName, filled: Boolean(draft.fullName) },
    { label: t.dobField, value: draft.dateOfBirth, filled: Boolean(draft.dateOfBirth) },
    { label: t.phoneField, value: draft.phone, filled: Boolean(draft.phone) },
    {
      label: t.locationField,
      value: [draft.district, draft.region].filter(Boolean).join(", "),
      filled: Boolean(draft.district),
    },
  ];

  if (persona === "PATIENT") {
    summaryRows.push(
      { label: t.mahallaField, value: draft.mahalla, filled: Boolean(draft.mahalla) },
      { label: t.bloodField, value: draft.bloodType, filled: Boolean(draft.bloodType) }
    );
  } else if (persona === "DOCTOR" || persona === "NURSE") {
    summaryRows.push({
      label: t.specialtyField,
      value: draft.specialty,
      filled: Boolean(draft.specialty),
    });
  }

  summaryRows.push(
    { label: t.emailField, value: draft.email, filled: Boolean(draft.email) },
    {
      label: t.passwordField,
      value: draft.password.length >= 6 ? t.passwordSet : "",
      filled: draft.password.length >= 6,
    }
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Conversational AI Chat Panel */}
      <div className="lg:col-span-7 flex flex-col rounded-2xl border border-teal-200 dark:border-teal-800/80 bg-slate-50/70 dark:bg-slate-950/60 overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-teal-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
              <IconSparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {t.headerTitle}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {t.headerSub}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition shrink-0"
          >
            <IconRefresh className="h-3 w-3" />
            {t.restartBtn}
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-1 max-h-[340px] min-h-[260px] overflow-y-auto p-4 space-y-3"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "ai" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <IconRobot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-teal-600 text-white rounded-br-sm"
                    : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-sm shadow-2xs"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {stepPrompt.chips.length > 0 && !isComplete && (
            <div className="flex flex-wrap gap-1.5 pl-9 pt-1">
              {stepPrompt.chips.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => submitAnswer(chip.value, chip.label)}
                  className="rounded-full border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 px-3 py-1 text-[11px] font-semibold text-teal-800 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/70 transition"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mx-3 mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/70 px-3 py-2 text-xs text-rose-800 dark:text-rose-200">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <IconAlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </span>
            <button
              type="button"
              onClick={handleChangeEmail}
              className="rounded-lg bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700 hover:bg-rose-100 transition"
            >
              {t.changeEmailBtn}
            </button>
          </div>
        )}

        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
          {isComplete ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => onCreateAccount(draft)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50 transition"
              >
                <IconUserPlus className="h-4 w-4" />
                {busy ? t.creatingBtn : t.createBtn}
              </button>
              <button
                type="button"
                onClick={() => onSwitchToForm(draft)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <IconEdit className="h-3.5 w-3.5" />
                {t.editInFormBtn}
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
              <label htmlFor="ai-signup-input" className="sr-only">
                {stepPrompt.message}
              </label>
              <input
                id="ai-signup-input"
                type={stepPrompt.inputType}
                autoComplete={
                  stepPrompt.step === "password"
                    ? "new-password"
                    : stepPrompt.step === "email"
                      ? "email"
                      : stepPrompt.step === "phone"
                        ? "tel"
                        : "off"
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={stepPrompt.placeholder}
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                aria-label={t.sendAria}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition"
              >
                <IconSend className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Live Auto-Filled Profile Preview Card */}
      <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              {t.previewTitle}
            </h3>
            <span className="rounded-full bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-[11px] font-bold text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {t.progressLabel}: {progress}%
            </span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <dl className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {summaryRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-2 py-2"
              >
                <dt className="text-slate-500 dark:text-slate-400 shrink-0">
                  {row.label}
                </dt>
                <dd className="flex items-center gap-1.5 font-semibold text-right truncate">
                  {row.filled ? (
                    <>
                      <span className="text-slate-900 dark:text-slate-100 truncate max-w-[170px]">
                        {row.value}
                      </span>
                      <IconCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    </>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600 font-normal italic">
                      {t.pendingAnswer}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <button
          type="button"
          onClick={() => onSwitchToForm(draft)}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <IconEdit className="h-3.5 w-3.5" />
          {t.editInFormBtn}
        </button>
      </div>
    </div>
  );
}
