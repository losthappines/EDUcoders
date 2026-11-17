"use client";

import React from "react";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCpu,
  IconRobot,
  IconX,
} from "@tabler/icons-react";
import type { AgentTraceStep } from "@/lib/types";

interface AgentTraceModalProps {
  open: boolean;
  patientName?: string;
  trace: AgentTraceStep[];
  onClose: () => void;
}

export function AgentTraceModal({
  open,
  patientName,
  trace,
  onClose,
}: AgentTraceModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
              <IconRobot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Agentic AI Continuity Coordinator — Autonomous Execution Trace
              </h3>
              <p className="text-xs text-slate-500">
                {patientName ? `Bemor: ${patientName} • ` : ""}4-Step Tool-Calling Pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-3 bg-slate-50">
          {trace.map((step) => (
            <div
              key={step.step}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                    {step.step}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {step.agentName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700">
                    <IconCpu className="h-3 w-3 text-teal-600" />
                    {step.toolCalled}()
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {step.durationMs}ms
                  </span>
                  {step.status === "ESCALATED" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
                      <IconAlertTriangle className="h-3 w-3" /> Escalated
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                      <IconCircleCheck className="h-3 w-3" /> Completed
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-700 mb-2">{step.summary}</p>
              <pre className="rounded-lg bg-slate-900 p-2.5 font-mono text-[11px] text-teal-300 overflow-x-auto">
                {JSON.stringify(step.structuredOutput, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
