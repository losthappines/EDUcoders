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
    return (<button type="button" onClick={toggleTheme} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} title={isDark ? "Yorug' rejim (Light mode)" : "Tungi rejim (Dark mode)"} className={`inline-flex min-h-[44px] min-w-[44px] sm:min-h-[38px] sm:min-w-0 items-center justify-center gap-1.5 rounded-xl border border-[#D7E4E1] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#EDF5F3] dark:border-[#1E353A] dark:bg-[#16272B] dark:text-slate-100 dark:hover:bg-[#1E353A] active:scale-[0.97] transition-all ${className}`}>
      {!isClient ? (<span className="h-4 w-4 inline-block" aria-hidden="true"/>) : isDark ? (<>
          <IconSun className="h-4 w-4 text-amber-300"/>
          <span className="hidden sm:inline">Light</span>
        </>) : (<>
          <IconMoon className="h-4 w-4 text-teal-700"/>
          <span className="hidden sm:inline">Dark</span>
        </>)}
    </button>);
}
