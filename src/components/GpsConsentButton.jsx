"use client";
import React, { useEffect, useState } from "react";
import { IconCurrentLocation, IconLock, IconMapPin, IconShieldCheck, IconX } from "@tabler/icons-react";
import { useLanguage } from "@/context/LanguageContext";

const CONSENT_COPY = {
  uz: {
    modalTitle: "GPS joylashuvni ulashishga rozilik",
    modalIntro: "Joylashuv ma'lumoti faqat sizga eng yaqin oilaviy shifokor yoki poliklinikani topish hamda chaqiruv masofasini hisoblash uchun ishlatiladi.",
    bullets: [
      "Joylashuv ruxsati mutlaqo ixtiyoriy — xohlamasangiz tuman yoki manzilni qo'lda kiritishingiz mumkin.",
      "GPS koordinatalaringiz reklama yoki uchinchi tomonlarga berilmaydi va faqat sizga xizmat ko'rsatuvchi tibbiy jamoaga ko'rinadi.",
      "Istalgan vaqtda brauzer sozlamalari orqali joylashuv ruxsatini bekor qilishingiz mumkin.",
    ],
    privacyLinkLabel: "Maxfiylik siyosati bilan tanishish",
    agreeBtn: "Roziman, GPS ni ulashish",
    cancelBtn: "Bekor qilish (qo'lda kiritaman)",
  },
  ru: {
    modalTitle: "Согласие на передачу GPS-геолокации",
    modalIntro: "Координаты используются только для подбора ближайшего семейного врача или поликлиники и расчета расстояния до места выезда.",
    bullets: [
      "Передача GPS полностью добровольна — при желании можно выбрать район или ввести адрес вручную.",
      "Ваши координаты не передаются третьим лицам и доступны только вашей медицинской команде.",
      "Вы можете отозвать разрешение на геолокацию в настройках браузера в любой момент.",
    ],
    privacyLinkLabel: "Подробнее в Политике конфиденциальности",
    agreeBtn: "Согласна, передать GPS",
    cancelBtn: "Отмена (укажу адрес вручную)",
  },
  en: {
    modalTitle: "GPS & Location Sharing Consent",
    modalIntro: "Your location is used solely to match you with the nearest family doctor or local clinic and calculate visit distance.",
    bullets: [
      "Location sharing is strictly optional — you may select your district or type your address manually instead.",
      "Your coordinates are never sold or shared with advertisers and are accessible only to authorized care staff.",
      "You can revoke location permission anytime in your browser settings.",
    ],
    privacyLinkLabel: "Read our Privacy & Data Handling Policy",
    agreeBtn: "I Agree — Share GPS",
    cancelBtn: "Cancel (Enter Manually)",
  },
};

export function GpsConsentButton({
  label,
  busy = false,
  disabled = false,
  className = "",
  icon,
  onLocationCaptured,
  onError,
  onDeniedFallback,
}) {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const t = CONSENT_COPY[lang] || CONSENT_COPY.uz;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleConfirm = () => {
    setOpen(false);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      if (onError) onError("GPS is not supported in this browser.");
      if (onDeniedFallback) onDeniedFallback();
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = Number(pos.coords.latitude.toFixed(5));
          const lng = Number(pos.coords.longitude.toFixed(5));
          await onLocationCaptured({ latitude: lat, longitude: lng });
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        if (onError) onError("Could not access browser GPS location.");
        if (onDeniedFallback) onDeniedFallback();
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled || busy || locating}
        onClick={() => setOpen(true)}
        className={
          className ||
          "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-sky-800 dark:text-sky-200 hover:bg-sky-50 dark:hover:bg-sky-950 transition disabled:opacity-50"
        }
      >
        {icon || <IconCurrentLocation className="h-4 w-4 shrink-0" aria-hidden="true" />}
        <span>{label}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gps-consent-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-xl space-y-4 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  <IconMapPin className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 id="gps-consent-title" className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.modalTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close GPS consent dialog"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {t.modalIntro}
            </p>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {t.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <IconShieldCheck className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" aria-hidden="true" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <IconLock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" aria-hidden="true" />
              <a href="/privacy#data-handling" className="font-semibold text-teal-700 dark:text-teal-400 hover:underline">
                {t.privacyLinkLabel}
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition"
              >
                <IconCurrentLocation className="h-4 w-4" aria-hidden="true" />
                {t.agreeBtn}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                {t.cancelBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
