"use client";

import React, { useEffect, useState } from "react";
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconFileCode,
  IconX,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";

interface FhirBundleModalProps {
  activeCallId: string | null;
  onClose: () => void;
}

interface FhirBundlePayload {
  resourceType: string;
  id: string;
  type: string;
  timestamp: string;
  entry: Array<{ fullUrl: string; resource: { resourceType: string; id: string } }>;
}

export function FhirBundleModal({ activeCallId, onClose }: FhirBundleModalProps) {
  const { fetchWithAuth } = usePlatform();
  const [bundleState, setBundleState] = useState<{
    callId: string;
    payload: FhirBundlePayload;
  } | null>(null);
  const [selectedResource, setSelectedResource] = useState<string>("ALL");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!activeCallId) return;
    let cancelled = false;
    fetchWithAuth(`/api/fhir/${activeCallId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          setBundleState({ callId: activeCallId, payload: json as FhirBundlePayload });
        }
      })
      .catch((err) => console.error(err));
    return () => {
      cancelled = true;
    };
  }, [activeCallId, fetchWithAuth]);

  if (!activeCallId) return null;

  const bundle = bundleState?.callId === activeCallId ? bundleState.payload : null;
  const loading = !bundle;

  const displayedJson =
    !bundle
      ? ""
      : selectedResource === "ALL"
        ? JSON.stringify(bundle, null, 2)
        : JSON.stringify(
            bundle.entry
              .filter((e) => e.resource.resourceType === selectedResource)
              .map((e) => e.resource),
            null,
            2
          );

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
              <IconFileCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                HL7 FHIR R4 Interoperability Bundle
              </h3>
              <p className="text-xs text-slate-500">
                National e-Health Standard (Patient, Encounter, CarePlan, Task, MedicationRequest)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-2.5 bg-white">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedResource(tab)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  selectedResource === tab
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab === "ALL" ? "Full Bundle" : tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!bundle}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {copied ? <IconCheck className="h-3.5 w-3.5 text-emerald-600" /> : <IconCopy className="h-3.5 w-3.5" />}
              {copied ? "Nusxalandi" : "Copy JSON"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!bundle}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <IconDownload className="h-3.5 w-3.5" />
              Export .fhir.json
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-950 p-4">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Generating HL7 FHIR R4 Bundle...
            </div>
          ) : (
            <pre className="font-mono text-xs leading-relaxed text-emerald-300 whitespace-pre-wrap break-words">
              {displayedJson}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
