"use client";

import { useSyncExternalStore } from "react";

export type AppLang = "en" | "uz" | "ru";

const STORAGE_KEY = "onacare_lang";
const LANG_EVENT = "onacare-lang-change";

function subscribeLang(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === STORAGE_KEY) callback();
  };
  const onLangEvent = () => callback();
  window.addEventListener("storage", onStorage);
  window.addEventListener(LANG_EVENT, onLangEvent);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LANG_EVENT, onLangEvent);
  };
}

function getLangSnapshot(): AppLang {
  if (typeof window !== "undefined") {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "uz" || saved === "ru" || saved === "en") {
        return saved;
      }
    } catch {
      // Ignore storage access errors
    }
  }
  return "en";
}

function getLangServerSnapshot(): AppLang {
  return "en";
}

function subscribeClient(): () => void {
  return () => {};
}

export function setGlobalLanguage(next: AppLang): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore storage access errors
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = next;
  }
  window.dispatchEvent(new Event(LANG_EVENT));
}

export function useLanguage(): {
  lang: AppLang;
  setLang: (next: AppLang) => void;
  isClient: boolean;
} {
  const isClient = useSyncExternalStore(
    subscribeClient,
    () => true,
    () => false
  );
  const storedLang = useSyncExternalStore(
    subscribeLang,
    getLangSnapshot,
    getLangServerSnapshot
  );

  return {
    lang: isClient ? storedLang : "en",
    setLang: setGlobalLanguage,
    isClient,
  };
}
