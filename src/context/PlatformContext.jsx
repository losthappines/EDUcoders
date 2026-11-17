"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, } from "react";
import { useRouter } from "next/navigation";
import { getGlobalLanguage } from "@/context/LanguageContext";
const PlatformContext = createContext(null);
export function PlatformProvider({ children }) {
    const router = useRouter();
    const [authUser, setAuthUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [simBusy, setSimBusy] = useState(false);
    const [dataLoadedAtMs, setDataLoadedAtMs] = useState(0);
    const [toast, setToast] = useState(null);
    const showToast = useCallback((type, text) => {
        setToast({ type, text });
        setTimeout(() => {
            setToast((curr) => (curr?.text === text ? null : curr));
        }, 4500);
    }, []);
    const fetchWithAuth = useCallback(async (url, init) => {
        const headers = new Headers(init?.headers || {});
        if (init?.body && !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }
        return fetch(url, {
            ...init,
            headers,
            credentials: "include",
            cache: "no-store",
        });
    }, []);
    const refreshData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth("/api/platform");
            if (res.status === 401) {
                setAuthUser(null);
                setData(null);
                return;
            }
            if (res.ok) {
                const json = (await res.json());
                setAuthUser(json.actor);
                setData(json);
                setDataLoadedAtMs(Date.now());
            }
        }
        catch (err) {
            console.error("Failed to refresh platform data:", err);
        }
        finally {
            setLoading(false);
        }
    }, [fetchWithAuth]);
    useEffect(() => {
        let cancelled = false;
        fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
            .then((res) => (res.ok ? res.json() : null))
            .then(async (me) => {
            if (cancelled)
                return;
            if (me?.authenticated && me.user) {
                setAuthUser(me.user);
                setAuthChecked(true);
                await refreshData();
            }
            else {
                setAuthUser(null);
                setData(null);
                setAuthChecked(true);
                setLoading(false);
            }
        })
            .catch((err) => {
            console.error("Initial session check error:", err);
            if (!cancelled) {
                setAuthChecked(true);
                setLoading(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [refreshData]);
    const login = useCallback(async (email, password) => {
        const l = getGlobalLanguage();
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            const out = (await res.json());
            if (!res.ok || !out.user) {
                let message = out.error;
                if (out.code === "PENDING_VERIFICATION") {
                    message =
                        l === "ru"
                            ? "Ваш аккаунт ожидает подтверждения администратором."
                            : l === "en"
                                ? "Your account is awaiting administrator verification before you can sign in."
                                : "Hisobingiz administrator tasdig'ini kutmoqda. Tasdiqlangandan so'ng kirishingiz mumkin.";
                }
                else if (out.code === "VERIFICATION_REJECTED") {
                    message =
                        l === "ru"
                            ? `Регистрация отклонена администратором.${out.reason ? ` Причина: ${out.reason}` : ""}`
                            : l === "en"
                                ? `Your registration was declined by an administrator.${out.reason ? ` Note: ${out.reason}` : ""}`
                                : `Ro'yxatdan o'tish administrator tomonidan rad etildi.${out.reason ? ` Sabab: ${out.reason}` : ""}`;
                }
                else if (out.code === "DB_NOT_CONFIGURED" || out.code === "DB_UNREACHABLE") {
                    message =
                        l === "ru"
                            ? "Сервер базы данных временно недоступен или не подключен (DATABASE_URL)."
                            : l === "en"
                                ? "Database connection is not configured or temporarily unavailable."
                                : "Ma'lumotlar bazasi ulanmagan yoki vaqtincha mavjud emas.";
                }
                else if (res.status === 401) {
                    message =
                        l === "ru"
                            ? "Неверный email или пароль."
                            : l === "en"
                                ? "Incorrect email or password."
                                : "Elektron pochta yoki parol noto'g'ri.";
                }
                return {
                    ok: false,
                    code: out.code,
                    reason: out.reason,
                    error: message ||
                        (l === "ru"
                            ? "Не удалось войти."
                            : l === "en"
                                ? "Sign in failed."
                                : "Kirishda xatolik yuz berdi."),
                };
            }
            setAuthUser({
                userId: out.user.id,
                email: out.user.email,
                fullName: out.user.fullName,
                role: out.user.role,
                polyclinicId: out.user.polyclinicId,
                polyclinicName: out.user.polyclinicName,
                district: out.user.district,
            });
            setAuthChecked(true);
            await refreshData();
            showToast("success", l === "ru"
                ? `Добро пожаловать, ${out.user.fullName}!`
                : l === "en"
                    ? `Welcome, ${out.user.fullName}!`
                    : `Xush kelibsiz, ${out.user.fullName}!`);
            router.push(out.redirectTo || "/");
            return { ok: true };
        }
        catch {
            return {
                ok: false,
                error: l === "ru"
                    ? "Ошибка соединения с сервером."
                    : l === "en"
                        ? "Network error while signing in."
                        : "Serverga ulanishda xatolik yuz berdi.",
            };
        }
    }, [refreshData, router, showToast]);
    const signup = useCallback(async (input) => {
        const l = getGlobalLanguage();
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(input),
            });
            const out = (await res.json());
            if (!res.ok || !out.user) {
                let message = out.error;
                if (out.code === "DB_NOT_CONFIGURED" || out.code === "DB_UNREACHABLE") {
                    message =
                        l === "ru"
                            ? "Сервер базы данных временно недоступен или не подключен (DATABASE_URL)."
                            : l === "en"
                                ? "Database connection is not configured or temporarily unavailable."
                                : "Ma'lumotlar bazasi ulanmagan yoki vaqtincha mavjud emas.";
                }
                else if (res.status === 409) {
                    message =
                        l === "ru"
                            ? "Аккаунт с таким email уже существует."
                            : l === "en"
                                ? "An account with this email already exists."
                                : "Ushbu elektron pochta bilan hisob allaqachon mavjud.";
                }
                return {
                    ok: false,
                    code: out.code,
                    error: message ||
                        (l === "ru"
                            ? "Ошибка регистрации."
                            : l === "en"
                                ? "Registration failed."
                                : "Ro'yxatdan o'tishda xatolik yuz berdi."),
                };
            }
            if (out.pendingVerification) {
                setAuthUser(null);
                setData(null);
                setAuthChecked(true);
                showToast("info", l === "ru"
                    ? "Заявка отправлена! Ожидайте подтверждения администратором."
                    : l === "en"
                        ? "Account submitted! Awaiting administrator verification."
                        : "Arizangiz yuborildi! Administrator tasdig'ini kuting.");
                return { ok: true, pendingVerification: true };
            }
            setAuthUser({
                userId: out.user.id,
                email: out.user.email,
                fullName: out.user.fullName,
                role: out.user.role,
                polyclinicId: out.user.polyclinicId,
                polyclinicName: out.user.polyclinicName,
                district: out.user.district,
            });
            setAuthChecked(true);
            await refreshData();
            showToast("success", l === "ru"
                ? `Аккаунт создан: ${out.user.fullName}`
                : l === "en"
                    ? `Account created: ${out.user.fullName}`
                    : `Hisob yaratildi: ${out.user.fullName}`);
            router.push(out.redirectTo || "/");
            return { ok: true, pendingVerification: false };
        }
        catch {
            return {
                ok: false,
                error: l === "ru"
                    ? "Ошибка соединения с сервером."
                    : l === "en"
                        ? "Network error while creating account."
                        : "Serverga ulanishda xatolik yuz berdi.",
            };
        }
    }, [refreshData, router, showToast]);
    const logout = useCallback(async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });
        setAuthUser(null);
        setData(null);
        const l = getGlobalLanguage();
        showToast("info", l === "ru"
            ? "Вы успешно вышли из системы."
            : l === "en"
                ? "Signed out successfully."
                : "Tizimdan muvaffaqiyatli chiqdingiz.");
        router.push("/");
    }, [router, showToast]);
    const fastForwardTime = useCallback(async (hours) => {
        setSimBusy(true);
        try {
            const res = await fetchWithAuth("/api/sim-time", {
                method: "POST",
                body: JSON.stringify({ action: "ADD_HOURS", hours }),
            });
            if (res.ok) {
                const out = (await res.json());
                await refreshData();
                const l = getGlobalLanguage();
                showToast(out.evaluation.escalatedCount > 0 ? "error" : "info", l === "ru"
                    ? `Время ускорено на +${hours} ч (Всего +${out.timeOffsetHours}ч). ${out.evaluation.escalatedCount > 0
                        ? `Сработало срочных уведомлений: ${out.evaluation.escalatedCount}!`
                        : "Таймеры визитов обновлены."}`
                    : l === "en"
                        ? `Time fast-forwarded +${hours}h (Total +${out.timeOffsetHours}h). ${out.evaluation.escalatedCount > 0
                            ? `${out.evaluation.escalatedCount} visit reminder escalation(s) triggered!`
                            : "Visit timers updated."}`
                        : `Vaqt +${hours} soatga tezlashtirildi (Jami +${out.timeOffsetHours}h). ${out.evaluation.escalatedCount > 0
                            ? `${out.evaluation.escalatedCount} ta holatda ogohlantirish ishga tushdi!`
                            : "Tashrif taymerlari yangilandi."}`);
            }
        }
        finally {
            setSimBusy(false);
        }
    }, [fetchWithAuth, refreshData, showToast]);
    const resetDemo = useCallback(async () => {
        setSimBusy(true);
        try {
            const res = await fetchWithAuth("/api/sim-time", {
                method: "POST",
                body: JSON.stringify({ action: "RESET" }),
            });
            if (res.ok) {
                await refreshData();
                const l = getGlobalLanguage();
                showToast("success", l === "ru"
                    ? "Демо-данные и время возвращены в исходное состояние."
                    : l === "en"
                        ? "Demo data and simulation clock reset."
                        : "Demo ma'lumotlari va vaqt boshlang'ich holatga qaytarildi.");
            }
        }
        finally {
            setSimBusy(false);
        }
    }, [fetchWithAuth, refreshData, showToast]);
    const role = authUser?.role ?? null;
    const userId = authUser?.userId ?? null;
    const value = useMemo(() => ({
        authUser,
        authChecked,
        role,
        userId,
        data,
        loading,
        simBusy,
        toast,
        showToast,
        fetchWithAuth,
        refreshData,
        login,
        signup,
        logout,
        fastForwardTime,
        resetDemo,
        dataLoadedAtMs,
    }), [
        authUser,
        authChecked,
        role,
        userId,
        data,
        loading,
        simBusy,
        toast,
        showToast,
        fetchWithAuth,
        refreshData,
        login,
        signup,
        logout,
        fastForwardTime,
        resetDemo,
        dataLoadedAtMs,
    ]);
    return (<PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>);
}
export function usePlatform() {
    const ctx = useContext(PlatformContext);
    if (!ctx)
        throw new Error("usePlatform must be used within PlatformProvider");
    return ctx;
}
