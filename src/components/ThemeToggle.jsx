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
    return (<button type="button" onClick={toggleTheme} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} title={isDark ? "Yorug' rejim (Light mode)" : "Tungi rejim (Dark mode)"} className={`inline-flex min-h-[40px] min-w-[40px] sm:min-h-[36px] sm:min-w-0 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white transition ${className}`}>
      {!isClient ? (<span className="h-4 w-4 inline-block" aria-hidden="true"/>) : isDark ? (<>
          <IconSun className="h-4 w-4 text-amber-400"/>
          <span className="hidden sm:inline">Light</span>
        </>) : (<>
          <IconMoon className="h-4 w-4 text-slate-600"/>
          <span className="hidden sm:inline">Dark</span>
        </>)}
    </button>);
}
