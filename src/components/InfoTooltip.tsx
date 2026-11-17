"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { IconInfoCircle } from "@tabler/icons-react";

interface InfoTooltipProps {
  label: string;
  explanation: string;
  className?: string;
}

export function InfoTooltip({
  label,
  explanation,
  className = "",
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  return (
    <span
      ref={wrapperRef}
      className={`relative inline-flex items-center gap-1 align-middle ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className="border-b border-dotted border-current">{label}</span>
      <button
        type="button"
        aria-label={`${label}: ${explanation}`}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          if (!wrapperRef.current?.contains(e.relatedTarget as Node | null)) {
            setOpen(false);
          }
        }}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:text-teal-600 dark:text-slate-500 dark:hover:text-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <IconInfoCircle className="h-3.5 w-3.5" />
      </button>

      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-60 -translate-x-1/2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 dark:bg-slate-800 px-3 py-2 text-[11px] font-normal leading-relaxed text-white shadow-lg"
        >
          <strong className="block font-semibold text-teal-300 mb-0.5">
            {label}
          </strong>
          {explanation}
        </span>
      )}
    </span>
  );
}
