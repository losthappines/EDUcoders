"use client";
import React, { useEffect, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";
import { buildSafeErrorReport, sanitizeTelemetryPath } from "@/lib/monitoring";

export class SafeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    try {
      const report = buildSafeErrorReport({
        name: error?.name || "ReactRenderError",
        message: error?.message || "Component render error",
        route: typeof window !== "undefined" ? window.location.pathname : "/",
        source: "boundary",
      });
      fetch("/api/monitoring/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Never throw inside error boundary
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="mx-auto my-12 max-w-md rounded-2xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 p-6 text-center space-y-3 shadow-sm"
        >
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            OnaCare — Kutilmagan xatolik yuz berdi
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Sahifani yangilab ko&apos;ring. Shoshilinch tibbiy holatda darhol{" "}
            <a href="tel:103" className="font-bold text-rose-700 dark:text-rose-400 underline">
              103
            </a>{" "}
            raqamiga qo&apos;ng&apos;iroq qiling.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition"
          >
            Sahifani yangilash
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function TelemetryAndErrorMonitor() {
  const sentCountRef = useRef(0);

  useEffect(() => {
    const sendSafeReport = (payload) => {
      if (sentCountRef.current >= 3) return;
      sentCountRef.current += 1;
      const report = buildSafeErrorReport(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/monitoring/error",
          new Blob([JSON.stringify(report)], { type: "application/json" })
        );
      } else {
        fetch("/api/monitoring/error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(report),
          keepalive: true,
        }).catch(() => {});
      }
    };

    const onError = (event) => {
      sendSafeReport({
        name: event?.error?.name || "WindowError",
        message: event?.message || "Unhandled script error",
        route: window.location.pathname,
        source: "window",
      });
    };

    const onRejection = (event) => {
      const reason = event?.reason;
      sendSafeReport({
        name: reason?.name || "UnhandledRejection",
        message: reason?.message || String(reason || "Promise rejection"),
        route: window.location.pathname,
        source: "rejection",
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return (
    <Analytics
      beforeSend={(event) => {
        // Strip query params and keep only non-sensitive allowlisted paths
        const safePath = sanitizeTelemetryPath(event?.url || "/");
        return {
          ...event,
          url: `https://edu-coders.vercel.app${safePath}`,
        };
      }}
    />
  );
}
