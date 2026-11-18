"use client";
import React from "react";
import { IconAlertTriangle, IconCircleCheck, IconCpu, IconRobot, IconX, } from "@tabler/icons-react";
export function AgentTraceModal({ open, patientName, trace, onClose, }) {
    if (!open)
        return null;
    return (<div role="dialog" aria-modal="true" aria-label="AI Continuity Trace" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 oc-fade-in">
      <div className="oc-modal-in flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#16272B] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 dark:bg-teal-600 text-white shadow-xs">
              <IconRobot className="h-5 w-5" aria-hidden="true"/>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                SI / AI Continuity Coordinator — Execution Trace
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {patientName ? `${patientName} • ` : ""}4-Step Tool-Calling Pipeline
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close trace modal" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#101E21] hover:text-slate-900 dark:hover:text-white transition-colors">
            <IconX className="h-5 w-5"/>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-5 space-y-3.5 bg-[#F4F8F7] dark:bg-[#091315]">
          {trace.map((step) => (<div key={step.step} className="med-card p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950 text-xs font-bold text-teal-800 dark:text-teal-300">
                    {step.step}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {step.agentName}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[#EDF5F3] dark:bg-[#16272B] border border-[#D7E4E1] dark:border-[#1E353A] px-2.5 py-1 font-mono text-xs text-slate-700 dark:text-slate-200">
                    <IconCpu className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400"/>
                    {step.toolCalled}()
                  </span>
                  <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                    {step.durationMs}ms
                  </span>
                  {step.status === "ESCALATED" ? (<span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <IconAlertTriangle className="h-3.5 w-3.5"/> Escalated
                    </span>) : (<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <IconCircleCheck className="h-3.5 w-3.5"/> Completed
                    </span>)}
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 mb-2.5 leading-relaxed">{step.summary}</p>
              <pre className="rounded-xl bg-[#091315] p-3 font-mono text-xs text-teal-300 overflow-x-auto border border-[#1E353A]">
                {JSON.stringify(step.structuredOutput, null, 2)}
              </pre>
            </div>))}
        </div>
      </div>
    </div>);
}
