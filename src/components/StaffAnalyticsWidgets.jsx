"use client";
import React, { useMemo, useState } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";

const TONE_MAP = {
  blue: {
    iconWrap: "bg-[#EBF4FF] text-[#1D6CE0] dark:bg-sky-950/70 dark:text-sky-300",
    ring: "border-[#E3ECF3] dark:border-[#1E353A]",
  },
  green: {
    iconWrap: "bg-[#E8F8F0] text-[#16A34A] dark:bg-emerald-950/70 dark:text-emerald-300",
    ring: "border-[#E3ECF3] dark:border-[#1E353A]",
  },
  amber: {
    iconWrap: "bg-[#FFF4E5] text-[#D97706] dark:bg-amber-950/70 dark:text-amber-300",
    ring: "border-[#E3ECF3] dark:border-[#1E353A]",
  },
  red: {
    iconWrap: "bg-[#FEECEC] text-[#DC2626] dark:bg-rose-950/70 dark:text-rose-300",
    ring: "border-[#E3ECF3] dark:border-[#1E353A]",
  },
  teal: {
    iconWrap: "bg-[#E7F6F4] text-[#0F766E] dark:bg-teal-950/70 dark:text-teal-300",
    ring: "border-[#E3ECF3] dark:border-[#1E353A]",
  },
};

export function StaffWelcomeHeader({
  greeting,
  dateLabel,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search anything...",
  rightSlot = null,
}) {
  return (
    <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight truncate">
          {greeting}
        </h1>
        {dateLabel && (
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            {dateLabel}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {typeof onSearchChange === "function" && (
          <div className="relative w-full sm:w-64 lg:w-72">
            <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-11 w-full rounded-full border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] pl-10 pr-9 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.03)] focus:border-[#2585F5] focus:outline-none transition-colors"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <IconX className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
        {rightSlot}
      </div>
    </div>
  );
}

export function StaffKpiCard({
  icon,
  label,
  value,
  sublabel,
  tone = "blue",
  onClick,
}) {
  const styles = TONE_MAP[tone] || TONE_MAP.blue;
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`w-full text-left rounded-2xl border ${styles.ring} bg-white dark:bg-[#101E21] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition-all duration-200 ${
        onClick
          ? "hover:-translate-y-0.5 hover:border-[#BFD9F8] dark:hover:border-sky-700 hover:shadow-[0_8px_20px_-10px_rgba(37,133,245,0.18)] active:scale-[0.99] cursor-pointer"
          : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles.iconWrap}`}
        >
          {icon}
        </span>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-snug">
          {label}
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-2.5">
        <span className="font-heading text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
          {value}
        </span>
        {sublabel && (
          <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            {sublabel}
          </span>
        )}
      </div>
    </Comp>
  );
}

function buildSmoothPath(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export function TrendsAreaChart({
  title,
  subtitle,
  series = [],
  unit = "",
  accentColor = "#4DA3FF",
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const safeSeries = useMemo(() => {
    if (Array.isArray(series) && series.length >= 2) return series;
    return [
      { label: "Mon", value: 0 },
      { label: "Tue", value: 0 },
      { label: "Wed", value: 0 },
      { label: "Thu", value: 0 },
      { label: "Fri", value: 0 },
      { label: "Sat", value: 0 },
      { label: "Sun", value: 0 },
    ];
  }, [series]);

  const width = 560;
  const height = 220;
  const padL = 38;
  const padR = 16;
  const padT = 16;
  const padB = 30;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const rawMax = Math.max(...safeSeries.map((s) => Number(s.value) || 0), 4);
  const niceStep = rawMax <= 8 ? 2 : rawMax <= 20 ? 5 : rawMax <= 80 ? 20 : Math.ceil(rawMax / 4 / 10) * 10;
  const yMax = Math.max(niceStep * 4, rawMax);
  const yTicks = [0, niceStep, niceStep * 2, niceStep * 3, yMax];

  const coords = safeSeries.map((item, idx) => {
    const x =
      safeSeries.length === 1
        ? padL + plotW / 2
        : padL + (idx / (safeSeries.length - 1)) * plotW;
    const val = Math.max(0, Number(item.value) || 0);
    const y = padT + plotH - (val / yMax) * plotH;
    return { x, y, val, label: item.label };
  });

  const linePath = buildSmoothPath(coords);
  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x} ${padT + plotH} L ${coords[0].x} ${padT + plotH} Z`
      : "";

  const activePoint = hoveredIdx !== null ? coords[hoveredIdx] : null;
  const gradId = `ocTrendFill-${title.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "main"}`;

  return (
    <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {activePoint && (
          <span className="rounded-full bg-[#EBF4FF] dark:bg-sky-950/60 px-3 py-1 text-xs font-semibold text-[#1D6CE0] dark:text-sky-300 tabular-nums">
            {activePoint.label}: {activePoint.val}
            {unit ? ` ${unit}` : ""}
          </span>
        )}
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          role="img"
          aria-label={title}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.45" />
              <stop offset="75%" stopColor={accentColor} stopOpacity="0.12" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = padT + plotH - (tick / yMax) * plotH;
            return (
              <g key={tick}>
                <line
                  x1={padL}
                  y1={y}
                  x2={width - padR}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <text
                  x={padL - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 dark:fill-slate-500 text-[10px] font-medium"
                >
                  {tick === 0 ? "00" : tick}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line
            x1={padL}
            y1={padT}
            x2={padL}
            y2={padT + plotH}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth="1.1"
          />
          <line
            x1={padL}
            y1={padT + plotH}
            x2={width - padR}
            y2={padT + plotH}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth="1.1"
          />

          {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={accentColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {coords.map((pt, idx) => {
            const isActive = hoveredIdx === idx;
            return (
              <g
                key={`${pt.label}-${idx}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <rect
                  x={pt.x - plotW / (safeSeries.length * 2)}
                  y={padT}
                  width={plotW / safeSeries.length}
                  height={plotH + 22}
                  fill="transparent"
                />
                {isActive && (
                  <line
                    x1={pt.x}
                    y1={padT}
                    x2={pt.x}
                    y2={padT + plotH}
                    stroke={accentColor}
                    strokeOpacity="0.35"
                    strokeDasharray="3 3"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? 5 : 3}
                  fill="#FFFFFF"
                  stroke={accentColor}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className="transition-all duration-150"
                />
                <text
                  x={pt.x}
                  y={padT + plotH + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-medium ${
                    isActive
                      ? "fill-[#1D6CE0] dark:fill-sky-300 font-semibold"
                      : "fill-slate-500 dark:fill-slate-400"
                  }`}
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function DistributionDonutChart({
  title,
  centerValue,
  centerLabel,
  segments = [],
}) {
  const safeSegments = useMemo(
    () =>
      segments.map((s) => ({
        ...s,
        value: Math.max(0, Number(s.value) || 0),
      })),
    [segments]
  );

  const total = safeSegments.reduce((acc, s) => acc + s.value, 0);
  const radius = 56;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  const arcs = useMemo(() => {
    if (total <= 0) return [];
    let offset = 0;
    return safeSegments
      .filter((s) => s.value > 0)
      .map((s) => {
        const fraction = s.value / total;
        const length = fraction * circumference;
        const gap = safeSegments.filter((x) => x.value > 0).length > 1 ? 3 : 0;
        const dash = Math.max(1, length - gap);
        const currentOffset = offset;
        offset += length;
        return {
          ...s,
          pct: Math.round(fraction * 100),
          dashArray: `${dash} ${circumference - dash}`,
          dashOffset: -currentOffset,
        };
      });
  }, [safeSegments, total, circumference]);

  return (
    <div className="rounded-2xl border border-[#E3ECF3] dark:border-[#1E353A] bg-white dark:bg-[#101E21] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col justify-between gap-4">
      <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
        {title}
      </h2>

      <div className="flex items-center justify-center py-1">
        <div className="relative h-44 w-44">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label={title}>
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth={strokeWidth}
            />
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeDasharray={arc.dashArray}
                strokeDashoffset={arc.dashOffset}
                strokeLinecap="butt"
                className="transition-all duration-300"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="font-heading text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {centerValue ?? (total > 0 ? "100%" : "0")}
            </span>
            {centerLabel && (
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {centerLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
        {safeSegments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div key={seg.label} className="flex items-center justify-between gap-1.5 text-xs min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-xs"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="truncate font-medium text-slate-600 dark:text-slate-300">
                  {seg.label}
                </span>
              </div>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-100 shrink-0 tabular-nums">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
