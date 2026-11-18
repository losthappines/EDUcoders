"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { IconChevronDown, IconSearch, IconX } from "@tabler/icons-react";
export function SearchableCombobox({ id, name, label, value, onChange, options, placeholder, autoComplete, required = false, disabled = false, allowCustom = false, emptyText = "No matches found", customHint = "keep typing to use custom entry", }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef(null);
    const listboxId = useId();
    useEffect(() => {
        const handleOutside = (e) => {
            if (containerRef.current &&
                !containerRef.current.contains(e.target)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);
    const searchTerm = query.trim().toLowerCase();
    const filteredOptions = !searchTerm
        ? options
        : options.filter((opt) => opt.toLowerCase().includes(searchTerm));
    const displayValue = allowCustom ? value : open ? query : value;
    const activePlaceholder = open && !allowCustom && value ? value : placeholder;
    return (<div ref={containerRef} className="relative" onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
                setOpen(false);
                setQuery("");
            }
        }}>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-400"/>
        <input id={id} name={name} type="text" role="combobox" aria-expanded={open} aria-controls={listboxId} aria-autocomplete="list" autoComplete={autoComplete} required={required} disabled={disabled} value={displayValue} placeholder={activePlaceholder} onFocus={() => {
            if (!disabled) {
                setQuery(allowCustom ? value : "");
                setOpen(true);
            }
        }} onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            setOpen(true);
            if (allowCustom) {
                onChange(next);
            }
        }} onKeyDown={(e) => {
            if (e.key === "Escape") {
                setOpen(false);
                setQuery("");
            }
            else if (e.key === "Enter" && open && filteredOptions.length > 0 && !allowCustom) {
                e.preventDefault();
                onChange(filteredOptions[0]);
                setQuery("");
                setOpen(false);
            }
        }} className="min-h-[46px] w-full rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] pl-10 pr-16 py-2.5 text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-600 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-[#101E21] focus:outline-none disabled:opacity-50 transition-all"/>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !disabled && (<button type="button" onClick={() => {
                onChange("");
                setQuery("");
                setOpen(true);
            }} aria-label={`Clear ${label}`} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100">
              <IconX className="h-4 w-4"/>
            </button>)}
          <button type="button" disabled={disabled} onClick={() => {
            if (!disabled)
                setOpen((v) => !v);
        }} aria-label={`Toggle ${label} options`} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 disabled:opacity-50">
            <IconChevronDown className="h-4 w-4"/>
          </button>
        </div>
      </div>

      {open && !disabled && (<ul id={listboxId} role="listbox" aria-label={label} className="oc-slide-down absolute z-40 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] py-1.5 shadow-lg text-sm">
          {filteredOptions.length === 0 ? (<li className="px-3.5 py-2.5 text-slate-500 dark:text-slate-400">
              {allowCustom ? `${emptyText} — ${customHint}` : emptyText}
            </li>) : (filteredOptions.map((opt) => {
                const selected = opt === value;
                return (<li key={opt} role="option" aria-selected={selected}>
                  <button type="button" onMouseDown={(e) => {
                        e.preventDefault();
                        onChange(opt);
                        setQuery("");
                        setOpen(false);
                    }} className={`min-h-[42px] w-full px-3.5 py-2 text-left transition-colors ${selected
                        ? "bg-teal-50 dark:bg-teal-950/60 font-semibold text-teal-800 dark:text-teal-200"
                        : "text-slate-800 dark:text-slate-100 hover:bg-[#F4F8F7] dark:hover:bg-[#16272B]"}`}>
                    {opt}
                  </button>
                </li>);
            }))}
        </ul>)}
    </div>);
}
