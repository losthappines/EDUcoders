"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { IconCamera, IconCheck, IconTrash, IconUpload, IconUser } from "@tabler/icons-react";

export const AVATAR_PRESETS = [
  {
    id: "preset:mother-rose",
    labelUz: "Ona (Atirgul)",
    labelRu: "Мама (Роза)",
    labelEn: "Mother (Rose)",
    bg: "#FFE4E9",
    accent: "#E11D48",
    skin: "#FCD5B5",
    hair: "#3B2314",
    badge: "heart",
  },
  {
    id: "preset:mother-mint",
    labelUz: "Ona (Yalpiz)",
    labelRu: "Мама (Мята)",
    labelEn: "Mother (Mint)",
    bg: "#DCFCE7",
    accent: "#0D9488",
    skin: "#F6C8A4",
    hair: "#4A2C1D",
    badge: "leaf",
  },
  {
    id: "preset:mother-sky",
    labelUz: "Ona (Moviy)",
    labelRu: "Мама (Небо)",
    labelEn: "Mother (Sky)",
    bg: "#E0F2FE",
    accent: "#1D6CE0",
    skin: "#FCE0C8",
    hair: "#2D1E17",
    badge: "star",
  },
  {
    id: "preset:baby-sun",
    labelUz: "Ona va bola",
    labelRu: "Мама и малыш",
    labelEn: "Mom & Baby",
    bg: "#FEF3C7",
    accent: "#D97706",
    skin: "#FBD4B4",
    hair: "#5C3A21",
    badge: "baby",
  },
  {
    id: "preset:doctor-blue",
    labelUz: "Shifokor",
    labelRu: "Врач",
    labelEn: "Clinician",
    bg: "#EBF4FF",
    accent: "#1D6CE0",
    skin: "#F8CFAF",
    hair: "#1E293B",
    badge: "cross",
  },
  {
    id: "preset:nurse-teal",
    labelUz: "Hamshira",
    labelRu: "Медсестра",
    labelEn: "Care Nurse",
    bg: "#E6FAF6",
    accent: "#0F766E",
    skin: "#FAD6BA",
    hair: "#332219",
    badge: "plus",
  },
  {
    id: "preset:psych-lavender",
    labelUz: "Psixolog",
    labelRu: "Психолог",
    labelEn: "Psychologist",
    bg: "#F3E8FF",
    accent: "#7C3AED",
    skin: "#F9D6BA",
    hair: "#3E2723",
    badge: "calm",
  },
  {
    id: "preset:care-star",
    labelUz: "OnaCare Yulduz",
    labelRu: "Звезда OnaCare",
    labelEn: "OnaCare Star",
    bg: "#E0E7FF",
    accent: "#4338CA",
    skin: "#F5C6A5",
    hair: "#1E1B4B",
    badge: "spark",
  },
];

function PresetAvatarSvg({ preset }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <rect width="64" height="64" fill={preset.bg} />
      {/* Hair back */}
      <circle cx="32" cy="25" r="14" fill={preset.hair} />
      {/* Shoulders / Top */}
      <path d="M12 62 C12 46, 52 46, 52 62 Z" fill={preset.accent} />
      {/* Neck */}
      <rect x="27" y="36" width="10" height="9" rx="4" fill={preset.skin} />
      {/* Face */}
      <circle cx="32" cy="27" r="11" fill={preset.skin} />
      {/* Hair fringe */}
      <path d="M21 24 C22 16, 42 16, 43 24 C38 20, 26 20, 21 24 Z" fill={preset.hair} />
      {/* Eyes */}
      <circle cx="28" cy="27.5" r="1.35" fill="#1E293B" />
      <circle cx="36" cy="27.5" r="1.35" fill="#1E293B" />
      {/* Warm smile */}
      <path d="M28.5 31.5 Q32 34.5 35.5 31.5" fill="none" stroke="#9A4E3C" strokeWidth="1.6" strokeLinecap="round" />
      {/* Subtle cheeks */}
      <circle cx="25" cy="30" r="1.7" fill="#FB7185" fillOpacity="0.35" />
      <circle cx="39" cy="30" r="1.7" fill="#FB7185" fillOpacity="0.35" />
      {/* Accent collar highlight */}
      <circle cx="32" cy="51" r="3" fill="#FFFFFF" fillOpacity="0.85" />
    </svg>
  );
}

function getInitials(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

const SIZE_CLASSES = {
  xs: "h-7 w-7 text-[11px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function UserAvatar({ avatarUrl, fullName, size = "md", className = "" }) {
  const sizeCls = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const preset = typeof avatarUrl === "string" && avatarUrl.startsWith("preset:")
    ? AVATAR_PRESETS.find((p) => p.id === avatarUrl)
    : null;
  const isImageData = typeof avatarUrl === "string" && avatarUrl.startsWith("data:image/");
  const initials = getInitials(fullName);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#D4E3F5] dark:border-[#1E353A] bg-[#EBF4FF] dark:bg-sky-950/80 text-[#1D6CE0] dark:text-sky-300 font-bold select-none ${sizeCls} ${className}`}
    >
      {isImageData ? (
        <Image
          src={avatarUrl}
          alt={fullName || "Profile"}
          width={96}
          height={96}
          unoptimized
          className="h-full w-full object-cover"
        />
      ) : preset ? (
        <PresetAvatarSvg preset={preset} />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <IconUser className="h-[52%] w-[52%]" />
      )}
    </span>
  );
}

export async function compressImageToAvatarDataUrl(file) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode image"));
      el.src = objectUrl;
    });
    const canvas = document.createElement("canvas");
    const targetSize = 256;
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");

    const minDim = Math.min(img.width, img.height);
    const sx = (img.width - minDim) / 2;
    const sy = (img.height - minDim) / 2;
    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);

    let dataUrl = canvas.toDataURL("image/jpeg", 0.84);
    if (dataUrl.length > 320000) {
      dataUrl = canvas.toDataURL("image/jpeg", 0.65);
    }
    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

const PICKER_COPY = {
  uz: {
    title: "Profil rasmini tanlang yoki yuklang",
    subtitle: "Tanlangan rasm yon panelda va kabinet sarlavhasida ko'rinadi.",
    uploadBtn: "Qurilmadan rasm yuklash",
    presetsLabel: "Yoki tayyor avatarlardan birini tanlang:",
    removeBtn: "Rasmni olib tashlash",
    saving: "Saqlanmoqda...",
    savedOk: "Profil rasmi yangilandi!",
    removedOk: "Profil rasmi olib tashlandi.",
    errMsg: "Rasmni saqlashda xatolik yuz berdi.",
  },
  ru: {
    title: "Загрузите или выберите фото профиля",
    subtitle: "Иконка профиля отображается в боковом меню и шапке кабинета.",
    uploadBtn: "Загрузить фото с устройства",
    presetsLabel: "Или выберите готовый аватар:",
    removeBtn: "Удалить фото",
    saving: "Сохранение...",
    savedOk: "Фото профиля обновлено!",
    removedOk: "Фото профиля удалено.",
    errMsg: "Не удалось сохранить фото профиля.",
  },
  en: {
    title: "Upload or choose a profile picture",
    subtitle: "Your profile picture appears in the sidebar and portal header.",
    uploadBtn: "Upload photo from device",
    presetsLabel: "Or pick a preset avatar:",
    removeBtn: "Remove picture",
    saving: "Saving...",
    savedOk: "Profile picture updated!",
    removedOk: "Profile picture removed.",
    errMsg: "Could not save profile picture.",
  },
};

export function AvatarPickerPanel({
  currentAvatarUrl,
  fullName,
  lang = "uz",
  onSaved,
  compact = false,
}) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const copy = PICKER_COPY[lang] || PICKER_COPY.en;

  const persistAvatar = async (nextUrl, isRemove = false) => {
    setBusy(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/auth/avatar", {
        method: isRemove ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: isRemove ? undefined : JSON.stringify({ avatarUrl: nextUrl }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatusMsg({ type: "error", text: json.error || copy.errMsg });
        return;
      }
      setStatusMsg({ type: "success", text: isRemove ? copy.removedOk : copy.savedOk });
      if (onSaved) await onSaved(json.avatarUrl ?? null);
    } catch {
      setStatusMsg({ type: "error", text: copy.errMsg });
    } finally {
      setBusy(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatusMsg(null);
    try {
      const compressed = await compressImageToAvatarDataUrl(file);
      await persistAvatar(compressed, false);
    } catch {
      setStatusMsg({ type: "error", text: copy.errMsg });
      setBusy(false);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className={`rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-[#F6F9FC] dark:bg-[#0D1A1D] ${compact ? "p-3.5" : "p-5"} space-y-3.5`}>
      <div className="flex flex-wrap items-center gap-3.5">
        <div className="relative">
          <UserAvatar avatarUrl={currentAvatarUrl} fullName={fullName} size={compact ? "lg" : "xl"} />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            aria-label={copy.uploadBtn}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#1D6CE0] text-white border-2 border-white dark:border-[#0D1A1D] shadow-sm hover:bg-[#1758BA] transition-colors disabled:opacity-50"
          >
            <IconCamera className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{copy.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#1D6CE0] hover:bg-[#1758BA] px-3.5 py-1.5 text-xs font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <IconUpload className="h-3.5 w-3.5" />
              <span>{busy ? copy.saving : copy.uploadBtn}</span>
            </button>
            {currentAvatarUrl && (
              <button
                type="button"
                disabled={busy}
                onClick={() => persistAvatar(null, true)}
                className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-[#101E21] px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-50"
              >
                <IconTrash className="h-3.5 w-3.5" />
                <span>{copy.removeBtn}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{copy.presetsLabel}</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {AVATAR_PRESETS.map((preset) => {
            const active = currentAvatarUrl === preset.id;
            const title = lang === "ru" ? preset.labelRu : lang === "en" ? preset.labelEn : preset.labelUz;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={busy}
                title={title}
                aria-label={title}
                onClick={() => persistAvatar(preset.id, false)}
                className={`group relative flex flex-col items-center justify-center rounded-xl p-1.5 border transition-all active:scale-95 disabled:opacity-50 ${
                  active
                    ? "border-[#1D6CE0] bg-[#EBF4FF] dark:bg-sky-950/60 ring-2 ring-[#1D6CE0]/25"
                    : "border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] hover:border-[#2585F5]"
                }`}
              >
                <UserAvatar avatarUrl={preset.id} fullName={title} size="md" />
                {active && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1D6CE0] text-white shadow-xs">
                    <IconCheck className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {statusMsg && (
        <p className={`text-xs font-semibold ${statusMsg.type === "error" ? "text-rose-600 dark:text-rose-300" : "text-[#16A34A] dark:text-emerald-300"}`}>
          {statusMsg.text}
        </p>
      )}
    </div>
  );
}
