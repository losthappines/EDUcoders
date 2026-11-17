"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { IconChevronDown, IconSearch, IconX } from "@tabler/icons-react";

interface SearchableComboboxProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  allowCustom?: boolean;
  emptyText?: string;
  customHint?: string;
}

export function SearchableCombobox({
  id,
  name,
  label,
  value,
  onChange,
  options,
  placeholder,
  autoComplete,
  required = false,
  disabled = false,
  allowCustom = false,
  emptyText = "No matches found",
  customHint = "keep typing to use custom entry",
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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
  const activePlaceholder =
    open && !allowCustom && value ? value : placeholder;

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
          setQuery("");
        }
      }}
    >
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
        <input
          id={id}
          name={name}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          value={displayValue}
          placeholder={activePlaceholder}
          onFocus={() => {
            if (!disabled) {
              setQuery(allowCustom ? value : "");
              setOpen(true);
            }
          }}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            setOpen(true);
            if (allowCustom) {
              onChange(next);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setQuery("");
            } else if (e.key === "Enter" && open && filteredOptions.length > 0 && !allowCustom) {
              e.preventDefault();
              onChange(filteredOptions[0]);
              setQuery("");
              setOpen(false);
            }
          }}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-8 pr-14 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none disabled:opacity-50"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {value && !disabled && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setQuery("");
                setOpen(true);
              }}
              aria-label={`Clear ${label}`}
              className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!disabled) setOpen((v) => !v);
            }}
            aria-label={`Toggle ${label} options`}
            className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-50"
          >
            <IconChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {open && !disabled && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="absolute z-40 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1 shadow-lg text-xs"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-3 py-2 text-slate-500 dark:text-slate-400">
              {allowCustom ? `${emptyText} — ${customHint}` : emptyText}
            </li>
          ) : (
            filteredOptions.map((opt) => {
              const selected = opt === value;
              return (
                <li key={opt} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange(opt);
                      setQuery("");
                      setOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left transition ${
                      selected
                        ? "bg-teal-50 dark:bg-teal-950/60 font-semibold text-teal-800 dark:text-teal-300"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {opt}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
