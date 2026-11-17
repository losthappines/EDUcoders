"use client";

import React, { useEffect, useState } from "react";
import { IconAlertTriangle, IconCircleCheck, IconClock } from "@tabler/icons-react";

interface SlaCountdownBadgeProps {
  dischargedAt: string;
  slaDeadlineAt: string;
  simulatedNow: string;
  dataLoadedAtMs: number;
  status: string;
  compact?: boolean;
}

export function SlaCountdownBadge({
  dischargedAt,
  slaDeadlineAt,
  simulatedNow,
  dataLoadedAtMs,
  status,
  compact = false,
}: SlaCountdownBadgeProps) {
  const [realNowMs, setRealNowMs] = useState<number>(() => dataLoadedAtMs || 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRealNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
        <IconCircleCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
        Patronaj tasdiqlandi
      </span>
    );
  }

  const tickDelta =
    dataLoadedAtMs > 0 && realNowMs > dataLoadedAtMs ? realNowMs - dataLoadedAtMs : 0;
  const nowMs = new Date(simulatedNow).getTime() + tickDelta;
  const dischargedMs = new Date(dischargedAt).getTime();
  const deadlineMs = new Date(slaDeadlineAt).getTime();

  const elapsedMs = Math.max(0, nowMs - dischargedMs);
  const elapsedHours = elapsedMs / (3600 * 1000);
  const remainingMs = Math.max(0, deadlineMs - nowMs);
  const isOverdue = nowMs > deadlineMs;

  const totalSec = Math.floor(remainingMs / 1000);
  const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");

  const isRed = elapsedHours >= 18 || isOverdue;
  const isYellow = !isRed && elapsedHours >= 12;

  const badgeStyle = isRed
    ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
    : isYellow
      ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
      : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";

  const label = isOverdue
    ? "MUDDAT O'TGAN"
    : isRed
      ? "KRITIK >18h"
      : isYellow
        ? "OGOHLANTIRISH 12–18h"
        : "SLA OK <12h";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeStyle}`}
    >
      {isRed ? (
        <IconAlertTriangle className="h-3.5 w-3.5 shrink-0 animate-pulse" />
      ) : (
        <IconClock className="h-3.5 w-3.5 shrink-0" />
      )}
      <span className="font-mono tabular-nums tracking-tight">
        {isOverdue ? "00:00:00" : `${hh}:${mm}:${ss}`}
      </span>
      {!compact && <span className="opacity-80">• {label}</span>}
    </div>
  );
}
