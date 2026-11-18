"use client";
import React, { useSyncExternalStore } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";
const STORAGE_KEY = "onacare_theme";
const THEME_EVENT = "onacare-theme-change";
function subscribeTheme(callback) {
    if (typeof window === "undefined")
        return () => { };
    const onStorage = (e) => {
        if (e.key === null || e.key === STORAGE_KEY)
            callback();
    };
    const onThemeEvent = () => callback();
    window.addEventListener("storage", onStorage);
    window.addEventListener(THEME_EVENT, onThemeEvent);
    return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(THEME_EVENT, onThemeEvent);
    };
}
function getThemeSnapshot() {
    if (typeof document !== "undefined") {
        return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
}
function getThemeServerSnapshot() {
    return "light";
}
function subscribeClient() {
    return () => { };
}
export function ThemeToggle({ className = "" }) {
    const isClient = useSyncExternalStore(subscribeClient, () => true, () => false);
    const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
    const toggleTheme = () => {
        const next = theme === "dark" ? "light" : "dark";
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        }
        catch {
            // Ignore storage errors in restricted browsing modes
        }
        document.documentElement.classList.toggle("dark", next === "dark");
        window.dispatchEvent(new Event(THEME_EVENT));
    };
    const isDark = isClient && theme === "dark";
    return (<button type="button" onClick={toggleTheme} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} title={isDark ? "Yorug' rejim (Light mode)" : "Tungi rejim (Dark mode)"} className={`inline-flex min-h-[40px] min-w-[40px] sm:min-h-[34px] sm:min-w-0 items-center justify-center gap-1.5 rounded-sm border border-[#DDD8CC] bg-[#FFFFFF] px-2.5 py-1.5 text-xs font-medium text-[#292E2B] hover:bg-[#EFECE3] dark:border-[#2F3632] dark:bg-[#1D221F] dark:text-[#F3F0E8] dark:hover:bg-[#242A27] transition-colors ${className}`}>
      {!isClient ? (<span className="h-4 w-4 inline-block" aria-hidden="true"/>) : isDark ? (<>
          <IconSun className="h-4 w-4 text-[#D9B8AE]"/>
          <span className="hidden sm:inline">Light</span>
        </>) : (<>
          <IconMoon className="h-4 w-4 text-[#244C40]"/>
          <span className="hidden sm:inline">Dark</span>
        </>)}
    </button>);
}
