"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { IconInfoCircle } from "@tabler/icons-react";
export function InfoTooltip({ label, explanation, className = "", }) {
    const [open, setOpen] = useState(false);
    const tooltipId = useId();
    const wrapperRef = useRef(null);
    useEffect(() => {
        if (!open)
            return;
        const handleOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const handleEsc = (e) => {
            if (e.key === "Escape")
                setOpen(false);
        };
        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [open]);
    return (<span ref={wrapperRef} className={`relative inline-flex items-center gap-1 align-middle ${className}`} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span className="border-b border-dotted border-current">{label}</span>
      <button type="button" aria-label={`${label}: ${explanation}`} aria-expanded={open} aria-describedby={open ? tooltipId : undefined} onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((v) => !v);
        }} onFocus={() => setOpen(true)} onBlur={(e) => {
            if (!wrapperRef.current?.contains(e.relatedTarget)) {
                setOpen(false);
            }
        }} className="inline-flex h-4 w-4 items-center justify-center rounded-sm text-[#525954] hover:text-[#244C40] dark:text-[#B8C2BA] dark:hover:text-[#A7BBAA] focus:outline-none focus:ring-2 focus:ring-[#244C40]">
        <IconInfoCircle className="h-3.5 w-3.5"/>
      </button>

      {open && (<span id={tooltipId} role="tooltip" className="absolute bottom-full left-1/2 z-50 mb-2 w-60 -translate-x-1/2 rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#292E2B] dark:bg-[#1D221F] px-3 py-2 text-[11px] font-normal leading-relaxed text-[#F7F5EF] shadow-sm">
          <strong className="block font-semibold text-[#A7BBAA] mb-0.5">
            {label}
          </strong>
          {explanation}
        </span>)}
    </span>);
}
