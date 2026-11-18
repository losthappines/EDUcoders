"use client";
import React from "react";
import { IconAlertTriangle, IconCircleCheck, IconCpu, IconRobot, IconX, } from "@tabler/icons-react";
export function AgentTraceModal({ open, patientName, trace, onClose, }) {
    if (!open)
        return null;
    return (<div role="dialog" aria-modal="true" aria-label="AI Continuity Trace" className="fixed inset-0 z-50 flex items-center justify-center bg-[#292E2B]/75 p-4">
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white">
              <IconRobot className="h-5 w-5" aria-hidden="true"/>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                SI / AI Continuity Coordinator — Execution Trace
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {patientName ? `${patientName} • ` : ""}4-Step Tool-Calling Pipeline
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close trace modal" className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">
            <IconX className="h-5 w-5"/>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-3 bg-slate-50 dark:bg-slate-950">
          {trace.map((step) => (<div key={step.step} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950 text-xs font-bold text-teal-800 dark:text-teal-300">
                    {step.step}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {step.agentName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    <IconCpu className="h-3 w-3 text-teal-600 dark:text-teal-400"/>
                    {step.toolCalled}()
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {step.durationMs}ms
                  </span>
                  {step.status === "ESCALATED" ? (<span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <IconAlertTriangle className="h-3 w-3"/> Escalated
                    </span>) : (<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <IconCircleCheck className="h-3 w-3"/> Completed
                    </span>)}
                </div>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">{step.summary}</p>
              <pre className="rounded-lg bg-slate-900 dark:bg-slate-950 p-2.5 font-mono text-[11px] text-teal-300 overflow-x-auto border border-slate-800">
                {JSON.stringify(step.structuredOutput, null, 2)}
              </pre>
            </div>))}
        </div>
      </div>
    </div>);
}
