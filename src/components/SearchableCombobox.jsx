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
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.06em] text-[#525954] dark:text-[#B8C2BA] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#767E78] dark:text-[#8E9890]"/>
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
        }} className="min-h-[44px] w-full rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#F7F5EF]/60 dark:bg-[#161A18] pl-8 pr-14 py-2 text-sm text-[#292E2B] dark:text-[#F3F0E8] placeholder:text-[#767E78] focus:border-[#244C40] dark:focus:border-[#A7BBAA] focus:outline-none disabled:opacity-50 transition-colors"/>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {value && !disabled && (<button type="button" onClick={() => {
                onChange("");
                setQuery("");
                setOpen(true);
            }} aria-label={`Clear ${label}`} className="rounded-sm p-1 text-[#767E78] hover:text-[#292E2B] dark:hover:text-[#F3F0E8]">
              <IconX className="h-3.5 w-3.5"/>
            </button>)}
          <button type="button" disabled={disabled} onClick={() => {
            if (!disabled)
                setOpen((v) => !v);
        }} aria-label={`Toggle ${label} options`} className="rounded-sm p-1 text-[#767E78] hover:text-[#292E2B] dark:hover:text-[#F3F0E8] disabled:opacity-50">
            <IconChevronDown className="h-4 w-4"/>
          </button>
        </div>
      </div>

      {open && !disabled && (<ul id={listboxId} role="listbox" aria-label={label} className="absolute z-40 mt-1 max-h-52 w-full overflow-y-auto rounded-sm border border-[#DDD8CC] dark:border-[#2F3733] bg-[#FFFFFF] dark:bg-[#1D221F] py-1 shadow-sm text-xs">
          {filteredOptions.length === 0 ? (<li className="px-3 py-2 text-[#525954] dark:text-[#B8C2BA]">
              {allowCustom ? `${emptyText} — ${customHint}` : emptyText}
            </li>) : (filteredOptions.map((opt) => {
                const selected = opt === value;
                return (<li key={opt} role="option" aria-selected={selected}>
                  <button type="button" onMouseDown={(e) => {
                        e.preventDefault();
                        onChange(opt);
                        setQuery("");
                        setOpen(false);
                    }} className={`w-full px-3 py-2 text-left transition-colors ${selected
                        ? "bg-[#EFECE3] dark:bg-[#242A27] font-semibold text-[#244C40] dark:text-[#A7BBAA]"
                        : "text-[#292E2B] dark:text-[#F3F0E8] hover:bg-[#F7F5EF] dark:hover:bg-[#242A27]"}`}>
                    {opt}
                  </button>
                </li>);
            }))}
        </ul>)}
    </div>);
}
