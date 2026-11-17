"use client";
import { useSyncExternalStore } from "react";
const STORAGE_KEY = "onacare_lang";
const LANG_EVENT = "onacare-lang-change";
function subscribeLang(callback) {
    if (typeof window === "undefined")
        return () => { };
    const onStorage = (e) => {
        if (e.key === null || e.key === STORAGE_KEY)
            callback();
    };
    const onLangEvent = () => callback();
    window.addEventListener("storage", onStorage);
    window.addEventListener(LANG_EVENT, onLangEvent);
    return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(LANG_EVENT, onLangEvent);
    };
}
export function getGlobalLanguage() {
    if (typeof window !== "undefined") {
        try {
            const saved = window.localStorage.getItem(STORAGE_KEY);
            if (saved === "uz" || saved === "ru" || saved === "en") {
                return saved;
            }
        }
        catch {
            // Ignore storage access errors
        }
    }
    return "uz";
}
function getLangServerSnapshot() {
    return "uz";
}
function subscribeClient() {
    return () => { };
}
export function setGlobalLanguage(next) {
    if (typeof window === "undefined")
        return;
    try {
        window.localStorage.setItem(STORAGE_KEY, next);
    }
    catch {
        // Ignore storage access errors
    }
    if (typeof document !== "undefined") {
        document.documentElement.lang = next;
    }
    window.dispatchEvent(new Event(LANG_EVENT));
}
export function useLanguage() {
    const isClient = useSyncExternalStore(subscribeClient, () => true, () => false);
    const storedLang = useSyncExternalStore(subscribeLang, getGlobalLanguage, getLangServerSnapshot);
    return {
        lang: isClient ? storedLang : "uz",
        setLang: setGlobalLanguage,
        isClient,
    };
}
