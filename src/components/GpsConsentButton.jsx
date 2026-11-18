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
          "inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-teal-700/40 dark:border-teal-600 bg-white dark:bg-[#16272B] px-4 py-2.5 text-sm font-semibold text-teal-800 dark:text-teal-200 hover:bg-[#EDF5F3] dark:hover:bg-[#1E353A] active:scale-[0.98] transition-all disabled:opacity-50"
        }
      >
        {icon || <IconCurrentLocation className="h-4 w-4 shrink-0" aria-hidden="true" />}
        <span>{label}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 oc-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gps-consent-title"
        >
          <div className="w-full max-w-md med-card oc-modal-in p-6 space-y-4 text-left">
            <div className="flex items-start justify-between gap-3 border-b border-[#D7E4E1] dark:border-[#1E353A] pb-3.5">
              <div className="flex items-center gap-2.5">
                <IconMapPin className="h-5 w-5 shrink-0 text-teal-700 dark:text-teal-300" aria-hidden="true" />
                <h2 id="gps-consent-title" className="font-heading text-base font-bold text-slate-900 dark:text-slate-100">
                  {t.modalTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close GPS consent dialog"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-[#EDF5F3] dark:hover:bg-[#16272B] hover:text-slate-900 dark:hover:text-slate-100"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {t.modalIntro}
            </p>

            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              {t.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <IconShieldCheck className="h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300 mt-1" aria-hidden="true" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
              <IconLock className="h-4 w-4 text-teal-700 dark:text-teal-300 shrink-0" aria-hidden="true" />
              <a href="/privacy#data-handling" className="font-semibold text-teal-700 dark:text-teal-300 underline underline-offset-4">
                {t.privacyLinkLabel}
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-[#D7E4E1] dark:border-[#1E353A]">
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white active:scale-[0.98] transition-all"
              >
                <IconCurrentLocation className="h-4 w-4" aria-hidden="true" />
                {t.agreeBtn}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#16272B] px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-[#EDF5F3] dark:hover:bg-[#1E353A] active:scale-[0.98] transition-all"
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
