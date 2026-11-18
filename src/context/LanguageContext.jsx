"use client";
import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
const STORAGE_KEY = "onacare_lang";
const LANG_EVENT = "onacare-lang-change";
const RouteDefaultLangContext = createContext("uz");

export function RouteLanguageProvider({ initialLang = "uz", children }) {
  return (
    <RouteDefaultLangContext.Provider value={initialLang}>
      {children}
    </RouteDefaultLangContext.Provider>
  );
}

export function detectBrowserLanguage() {
  if (typeof navigator === "undefined") return "uz";
  const candidates = Array.isArray(navigator.languages) && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language || ""];
  for (const item of candidates) {
    const code = String(item || "").trim().toLowerCase();
    if (code.startsWith("ru")) return "ru";
    if (code.startsWith("en")) return "en";
    if (code.startsWith("uz")) return "uz";
  }
  return "uz";
}

function subscribeLang(callback) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e) => {
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

export function getGlobalLanguage(routeDefault = "uz") {
  if (typeof window !== "undefined") {
    const path = window.location?.pathname || "";
    if (path === "/ru" || path.startsWith("/ru/")) return "ru";
    if (path === "/en" || path.startsWith("/en/")) return "en";
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "uz" || saved === "ru" || saved === "en") {
        return saved;
      }
    } catch {
      // Ignore storage access errors
    }
    if (routeDefault === "ru" || routeDefault === "en") return routeDefault;
    return detectBrowserLanguage();
  }
  return routeDefault;
}

export function setGlobalLanguage(next) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore storage access errors
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = next;
    document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax`;
  }
  window.dispatchEvent(new Event(LANG_EVENT));
}

function subscribeClient() {
  return () => {};
}

export function useLanguage() {
  const routeDefault = useContext(RouteDefaultLangContext);
  const isClient = useSyncExternalStore(subscribeClient, () => true, () => false);
  const storedLang = useSyncExternalStore(
    subscribeLang,
    () => getGlobalLanguage(routeDefault),
    () => routeDefault
  );
  const effectiveLang = isClient ? storedLang : routeDefault;

  useEffect(() => {
    if (typeof document !== "undefined" && document.documentElement.lang !== effectiveLang) {
      document.documentElement.lang = effectiveLang;
    }
  }, [effectiveLang]);

  return {
    lang: effectiveLang,
    setLang: setGlobalLanguage,
    isClient,
  };
}
