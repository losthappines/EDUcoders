"use client";
import React, { useEffect, useState } from "react";
import { IconCheck, IconCopy, IconDownload, IconFileCode, IconX, } from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
export function FhirBundleModal({ activeCallId, onClose }) {
    const { fetchWithAuth } = usePlatform();
    const [bundleState, setBundleState] = useState(null);
    const [selectedResource, setSelectedResource] = useState("ALL");
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (!activeCallId)
            return;
        let cancelled = false;
        fetchWithAuth(`/api/fhir/${activeCallId}`)
            .then((r) => r.json())
            .then((json) => {
            if (!cancelled) {
                setBundleState({ callId: activeCallId, payload: json });
            }
        })
            .catch((err) => console.error(err));
        return () => {
            cancelled = true;
        };
    }, [activeCallId, fetchWithAuth]);
    if (!activeCallId)
        return null;
    const bundle = bundleState?.callId === activeCallId ? bundleState.payload : null;
    const loading = !bundle;
    const displayedJson = !bundle
        ? ""
        : selectedResource === "ALL"
            ? JSON.stringify(bundle, null, 2)
            : JSON.stringify(bundle.entry
                .filter((e) => e.resource.resourceType === selectedResource)
                .map((e) => e.resource), null, 2);
    const handleCopy = () => {
        navigator.clipboard.writeText(displayedJson);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(bundle, null, 2)], {
            type: "application/fhir+json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hl7-fhir-r4-${activeCallId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const tabs = ["ALL", "Patient", "Encounter", "CarePlan", "Task", "MedicationRequest"];
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 oc-fade-in">
      <div className="oc-modal-in flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[#D7E4E1] dark:border-[#1E353A] px-5 py-4 bg-[#EDF5F3] dark:bg-[#16272B]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 dark:bg-teal-600 text-white shadow-xs">
              <IconFileCode className="h-5 w-5"/>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                HL7 FHIR R4 Interoperability Bundle
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                National e-Health Standard (Patient, Encounter, CarePlan, Task, MedicationRequest)
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close FHIR modal" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#101E21] hover:text-slate-900 dark:hover:text-white transition-colors">
            <IconX className="h-5 w-5"/>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D7E4E1] dark:border-[#1E353A] px-5 py-3 bg-white dark:bg-[#101E21]">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (<button key={tab} onClick={() => setSelectedResource(tab)} className={`min-h-[40px] rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all active:scale-[0.98] ${selectedResource === tab
                ? "bg-teal-700 dark:bg-teal-600 text-white shadow-xs"
                : "bg-[#EDF5F3] dark:bg-[#16272B] text-slate-700 dark:text-slate-200 hover:border-teal-500 border border-[#D7E4E1] dark:border-[#1E353A]"}`}>
                {tab === "ALL" ? "Full Bundle" : tab}
              </button>))}
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button onClick={handleCopy} disabled={!bundle} className="inline-flex min-h-[44px] flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#16272B] px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-teal-500 active:scale-[0.98] transition-all">
              {copied ? <IconCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400"/> : <IconCopy className="h-4 w-4"/>}
              {copied ? "Nusxalandi" : "Copy JSON"}
            </button>
            <button onClick={handleDownload} disabled={!bundle} className="inline-flex min-h-[44px] flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl bg-teal-700 dark:bg-teal-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-teal-800 dark:hover:bg-teal-500 active:scale-[0.98] transition-all">
              <IconDownload className="h-4 w-4"/>
              Export .fhir.json
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#091315] p-4 sm:p-5">
          {loading ? (<div className="py-12 text-center text-sm sm:text-base text-slate-300">
              Generating HL7 FHIR R4 Bundle...
            </div>) : (<pre className="font-mono text-xs sm:text-sm leading-relaxed text-emerald-300 whitespace-pre-wrap break-words">
              {displayedJson}
            </pre>)}
        </div>
      </div>
    </div>);
}
