"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  Building2,
  FileCode2,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";
import { SlaCountdownBadge } from "@/components/SlaCountdownBadge";
import { FhirBundleModal } from "@/components/FhirBundleModal";
import { AgentTraceModal } from "@/components/AgentTraceModal";
import type { AgentTraceStep } from "@/lib/types";

export default function HomePage() {
  const { data, loading, switchRole, dataLoadedAtMs } = usePlatform();
  const [fhirCallId, setFhirCallId] = useState<string | null>(null);
  const [traceModal, setTraceModal] = useState<{
    patientName: string;
    trace: AgentTraceStep[];
  } | null>(null);

  const patients = data?.patients ?? [];
  const calls = data?.activeCalls ?? [];

  const inpatientCount = patients.filter((p) => p.status === "INPATIENT").length;
  const activeCount = calls.filter((c) => c.status !== "COMPLETED").length;
  const criticalCount = calls.filter(
    (c) => c.status !== "COMPLETED" && (c.sla.zone === "RED" || c.priority === "CRITICAL")
  ).length;
  const completedCount = calls.filter((c) => c.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 border border-teal-200">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              National AI Hackathon • Task #11: Avtomatlashtirilgan Patronaj Tizimi
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              OvaBMU → Oilaviy Poliklinika: Zero-Gap 24-Hour Maternal Continuity of Care
            </h1>
            <p className="text-sm leading-relaxed text-slate-600">
              The instant a high-risk maternal or perinatal patient is discharged from OvaBMU,
              our <strong>4-Step Agentic AI Coordinator</strong> synthesizes her EHR and labs,
              routes an automated <strong>&ldquo;Aktiv Chaqiruv&rdquo;</strong> to the territorial
              Regional Family Doctor, generates a tailored Uzbek home-visit checklist, and
              enforces a strict <strong>24-hour SLA</strong> with automated 12h &amp; 18h escalations.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={() => switchRole("OVABMU_MD", true)}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 shadow-xs"
              >
                <Building2 className="h-4 w-4" />
                Demo: Discharge Inpatient (OvaBMU MD)
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => switchRole("FAMILY_MD", true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Stethoscope className="h-4 w-4 text-teal-600" />
                Open Family Doctor Queue
              </button>
              <button
                onClick={() => switchRole("PATIENT", true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <HeartHandshake className="h-4 w-4 text-rose-600" />
                Patient Mobile Portal
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-80 shrink-0">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">OvaBMU Inpatients</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
                {loading ? "—" : inpatientCount}
              </p>
              <p className="mt-0.5 text-[11px] text-teal-700 font-medium">Ready for discharge</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Aktiv Chaqiruv (24h)</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
                {loading ? "—" : activeCount}
              </p>
              <p className="mt-0.5 text-[11px] text-amber-700 font-medium">Live SLA tracked</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4">
              <p className="text-xs font-medium text-rose-700">High / Red Escalation</p>
              <p className="mt-1 text-2xl font-bold text-rose-700 tabular-nums">
                {loading ? "—" : criticalCount}
              </p>
              <p className="mt-0.5 text-[11px] text-rose-600 font-medium">Priority monitoring</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
              <p className="text-xs font-medium text-emerald-700">Verified Visits</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700 tabular-nums">
                {loading ? "—" : completedCount}
              </p>
              <p className="mt-0.5 text-[11px] text-emerald-600 font-medium">OTP / MD signed</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Agentic AI Architecture */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          {
            step: "01",
            title: "EHR & Lab Synthesis Agent",
            desc: "Parses ICD-10, Hb, BP, proteinuria & WBC to compute a 0–100 post-discharge risk score and top 3 clinical red flags.",
          },
          {
            step: "02",
            title: "Territorial Routing Agent",
            desc: "Maps patient mahalla/district to the responsible Polyclinic & checks Family MD slots to prevent scheduling conflicts.",
          },
          {
            step: "03",
            title: "Checklist & Guide Agent",
            desc: "Generates a tailored 5-item Uzbek physical exam checklist for the doctor and UZ/RU/EN home care rules for the mother.",
          },
          {
            step: "04",
            title: "Autonomous SLA Agent",
            desc: "Tracks live 24:00:00 countdowns, evaluates patient symptom check-ins, and fires 12h/18h Chief Doctor alerts.",
          },
        ].map((card) => (
          <div
            key={card.step}
            className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  AGENT {card.step}
                </span>
                <Bot className="h-4 w-4 text-teal-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">{card.title}</h2>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{card.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Live Active Patronage Feed */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-600" />
              Live &ldquo;Aktiv Chaqiruv&rdquo; Continuity Queue
            </h2>
            <p className="text-xs text-slate-500">
              Real-time 24-hour patronage handoffs synced with the Time Simulator &amp; RBAC Engine
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
          >
            <ShieldCheck className="h-4 w-4" />
            Open Full SLA &amp; Audit Monitor
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {calls.map((call) => (
            <div
              key={call.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {call.patient.fullName}
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    {call.patient.jshshirMasked}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      call.riskScore >= 80
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    AI Risk: {call.riskScore}/100
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {call.district}, {call.patient.mahalla} • Assigned:{" "}
                  <strong>{call.assignedDoctor.fullName}</strong> ({call.polyclinicName})
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {data?.simState && (
                  <SlaCountdownBadge
                    dischargedAt={call.dischargedAt}
                    slaDeadlineAt={call.slaDeadlineAt}
                    simulatedNow={data.simState.simulatedNow}
                    dataLoadedAtMs={dataLoadedAtMs}
                    status={call.status}
                  />
                )}
                <button
                  onClick={() =>
                    setTraceModal({
                      patientName: call.patient.fullName,
                      trace: call.aiAgentTrace,
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Bot className="h-3.5 w-3.5 text-teal-600" />
                  AI Trace
                </button>
                <button
                  onClick={() => setFhirCallId(call.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <FileCode2 className="h-3.5 w-3.5 text-indigo-600" />
                  HL7 FHIR
                </button>
              </div>
            </div>
          ))}

          {!loading && calls.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
              No active calls in current RBAC scope.
            </div>
          )}
        </div>

        {/* Role Portal Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-200 pt-5">
          <Link
            href="/clinical"
            className="group rounded-xl border border-slate-200 p-4 hover:border-teal-400 hover:bg-teal-50/30 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">1. Clinical Dashboard</span>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600" />
            </div>
            <p className="mt-1 text-xs text-slate-600">
              OvaBMU discharge trigger, 24h Aktiv Chaqiruv queue, 5-item Uzbek checklist &amp; vitals verification.
            </p>
          </Link>
          <Link
            href="/patient"
            className="group rounded-xl border border-slate-200 p-4 hover:border-teal-400 hover:bg-teal-50/30 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">2. Patient Portal (UZ/RU/EN)</span>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600" />
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Home recovery rules, active e-prescriptions, AI symptom check-in &amp; 4-digit OTP visit confirmation.
            </p>
          </Link>
          <Link
            href="/admin"
            className="group rounded-xl border border-slate-200 p-4 hover:border-teal-400 hover:bg-teal-50/30 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">3. Reception &amp; Admin</span>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600" />
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Red/Yellow/Green SLA monitor, territorial routing, state-grant billing &amp; immutable audit logs.
            </p>
          </Link>
        </div>
      </section>

      <FhirBundleModal activeCallId={fhirCallId} onClose={() => setFhirCallId(null)} />
      <AgentTraceModal
        open={Boolean(traceModal)}
        patientName={traceModal?.patientName}
        trace={traceModal?.trace ?? []}
        onClose={() => setTraceModal(null)}
      />
    </div>
  );
}
