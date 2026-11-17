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
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
              <IconFileCode className="h-5 w-5"/>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                HL7 FHIR R4 Interoperability Bundle
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                National e-Health Standard (Patient, Encounter, CarePlan, Task, MedicationRequest)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200">
            <IconX className="h-5 w-5"/>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 px-5 py-2.5 bg-white dark:bg-slate-900">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (<button key={tab} onClick={() => setSelectedResource(tab)} className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${selectedResource === tab
                ? "bg-teal-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
                {tab === "ALL" ? "Full Bundle" : tab}
              </button>))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} disabled={!bundle} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
              {copied ? <IconCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"/> : <IconCopy className="h-3.5 w-3.5"/>}
              {copied ? "Nusxalandi" : "Copy JSON"}
            </button>
            <button onClick={handleDownload} disabled={!bundle} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-teal-500">
              <IconDownload className="h-3.5 w-3.5"/>
              Export .fhir.json
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-950 p-4">
          {loading ? (<div className="py-12 text-center text-sm text-slate-400">
              Generating HL7 FHIR R4 Bundle...
            </div>) : (<pre className="font-mono text-xs leading-relaxed text-emerald-300 whitespace-pre-wrap break-words">
              {displayedJson}
            </pre>)}
        </div>
      </div>
    </div>);
}
