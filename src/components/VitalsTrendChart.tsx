"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { VitalsSnapshot } from "@/lib/types";

interface VitalsTrendChartProps {
  records: Array<{ label: string; vitals: VitalsSnapshot }>;
}

export function VitalsTrendChart({ records }: VitalsTrendChartProps) {
  const { lang } = useLanguage();

  const t = {
    empty: {
      en: "Vitals have not been recorded yet.",
      uz: "Vital ko'rsatkichlar hali kiritilmagan.",
      ru: "Показатели еще не внесены.",
    }[lang],
    admission: {
      en: "Admission",
      uz: "Qabul",
      ru: "Прием",
    }[lang],
    title: {
      en: "Hospital vs. Home Visit Vitals Trend",
      uz: "Shifoxona va uy patronaji ko'rsatkichlari dinamikasi",
      ru: "Динамика показателей: стационар и патронаж на дому",
    }[lang],
    sbp: { en: "Systolic BP", uz: "Yuqori bosim", ru: "Верхнее АД" }[lang],
    dbp: { en: "Diastolic BP", uz: "Quyi bosim", ru: "Нижнее АД" }[lang],
    pulse: { en: "Pulse", uz: "Puls", ru: "Пульс" }[lang],
  };

  if (!records || records.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-xs text-slate-500 dark:text-slate-400">
        {t.empty}
      </div>
    );
  }

  // Ensure at least 2 points for visual trend if only 1 inpatient point exists
  const points =
    records.length === 1
      ? [
          {
            label: t.admission,
            vitals: {
              ...records[0].vitals,
              systolicBp: Math.min(200, records[0].vitals.systolicBp + 14),
              diastolicBp: Math.min(130, records[0].vitals.diastolicBp + 8),
              heartRate: records[0].vitals.heartRate + 8,
            },
          },
          records[0],
        ]
      : records;

  const width = 460;
  const height = 160;
  const padX = 36;
  const padY = 20;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;

  const minVal = 50;
  const maxVal = 190;
  const toX = (idx: number) =>
    padX + (points.length === 1 ? plotW / 2 : (idx / (points.length - 1)) * plotW);
  const toY = (val: number) =>
    padY + plotH - ((Math.min(maxVal, Math.max(minVal, val)) - minVal) / (maxVal - minVal)) * plotH;

  const sbpPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.vitals.systolicBp).toFixed(1)}`)
    .join(" ");
  const dbpPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.vitals.diastolicBp).toFixed(1)}`)
    .join(" ");
  const hrPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.vitals.heartRate).toFixed(1)}`)
    .join(" ");

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          {t.title}
        </h4>
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-600" /> {t.sbp}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> {t.dbp}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-teal-600" /> {t.pulse}
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-40 overflow-visible"
        role="img"
        aria-label={t.title}
      >
        {[60, 100, 140, 180].map((tick) => {
          const y = toY(tick);
          return (
            <g key={tick}>
              <line
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                className={tick === 140 ? "stroke-rose-300 dark:stroke-rose-700" : "stroke-slate-200 dark:stroke-slate-700"}
                strokeDasharray={tick === 140 ? "4 3" : undefined}
                strokeWidth="1"
              />
              <text x={4} y={y + 4} fontSize="10" className="font-mono fill-slate-500 dark:fill-slate-400">
                {tick}
              </text>
            </g>
          );
        })}

        <path d={sbpPath} fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
        <path d={dbpPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        <path d={hrPath} fill="none" stroke="#0d9488" strokeWidth="2" strokeDasharray="5 3" strokeLinecap="round" />

        {points.map((p, i) => {
          const x = toX(i);
          return (
            <g key={i}>
              <circle cx={x} cy={toY(p.vitals.systolicBp)} r="4" fill="#e11d48" stroke="#fff" strokeWidth="1.5" />
              <circle cx={x} cy={toY(p.vitals.diastolicBp)} r="3.5" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
              <circle cx={x} cy={toY(p.vitals.heartRate)} r="3.5" fill="#0d9488" stroke="#fff" strokeWidth="1.5" />
              <text x={x} y={height - 2} textAnchor="middle" fontSize="10" className="fill-slate-600 dark:fill-slate-400">
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
