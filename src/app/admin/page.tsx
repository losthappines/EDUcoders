"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  BedDouble,
  CheckCircle2,
  Clock,
  FileCode2,
  Lock,
  MapPin,
  Package,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";
import { SlaCountdownBadge } from "@/components/SlaCountdownBadge";
import { FhirBundleModal } from "@/components/FhirBundleModal";

export default function AdminPanelPage() {
  const { role, data, loading, dataLoadedAtMs } = usePlatform();
  const [fhirCallId, setFhirCallId] = useState<string | null>(null);
  const [slaFilter, setSlaFilter] = useState<"ALL" | "GREEN" | "YELLOW" | "RED" | "COMPLETED">("ALL");

  const calls = data?.activeCalls ?? [];
  const patients = data?.patients ?? [];
  const doctors = (data?.users ?? []).filter((u) => u.role === "FAMILY_MD");
  const invoices = data?.invoices ?? [];
  const auditLogs = data?.auditLogs ?? [];

  const greenCount = calls.filter((c) => c.sla.zone === "GREEN").length;
  const yellowCount = calls.filter((c) => c.sla.zone === "YELLOW").length;
  const redCount = calls.filter((c) => c.sla.zone === "RED").length;
  const completedCount = calls.filter((c) => c.sla.zone === "COMPLETED").length;

  const filteredCalls =
    slaFilter === "ALL" ? calls : calls.filter((c) => c.sla.zone === slaFilter);

  const totalStateCovered = invoices.reduce((acc, inv) => acc + inv.stateCoveredUzs, 0);
  const totalPatientPaid = invoices.reduce((acc, inv) => acc + inv.patientPayableUzs, 0);

  return (
    <div className="space-y-6">
      {/* Header & RBAC Redaction Notice */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Reception, 24-Hour SLA Monitor &amp; Governance Console
          </h1>
          <p className="text-xs text-slate-500">
            Bed release tracking, territorial polyclinic routing, pharmacy &amp; state grant accounting, and immutable security audit logs
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white">
          <Lock className="h-3.5 w-3.5 text-teal-400" />
          {role === "ADMIN_RECEPTION"
            ? "RBAC Active: Clinical Notes Redacted for Admin"
            : `Viewing as ${role} (Switch to District Admin to see redaction)`}
        </div>
      </div>

      {/* Real-time 24-Hour SLA Compliance Monitor */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-600" />
            Real-Time 24-Hour SLA Compliance Monitor
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: "ALL" as const, label: `All (${calls.length})` },
              { key: "GREEN" as const, label: `Green <12h (${greenCount})` },
              { key: "YELLOW" as const, label: `Yellow 12–18h (${yellowCount})` },
              { key: "RED" as const, label: `Red >18h (${redCount})` },
              { key: "COMPLETED" as const, label: `Verified (${completedCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSlaFilter(tab.key)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  slaFilter === tab.key
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
            <p className="text-xs font-semibold text-emerald-800">Green (&lt;12h elapsed)</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700 tabular-nums">{greenCount}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
            <p className="text-xs font-semibold text-amber-800">Yellow (12–18h Warning)</p>
            <p className="mt-1 text-2xl font-bold text-amber-700 tabular-nums">{yellowCount}</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5">
            <p className="text-xs font-semibold text-rose-800">Red (&gt;18h Critical)</p>
            <p className="mt-1 text-2xl font-bold text-rose-700 tabular-nums">{redCount}</p>
          </div>
          <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-3.5">
            <p className="text-xs font-semibold text-teal-800">Verified Visits</p>
            <p className="mt-1 text-2xl font-bold text-teal-700 tabular-nums">{completedCount}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-3 font-semibold">Patient</th>
                <th className="py-2 pr-3 font-semibold">Polyclinic &amp; Family MD</th>
                <th className="py-2 pr-3 font-semibold">Clinical Note (RBAC)</th>
                <th className="py-2 pr-3 font-semibold">24h SLA Countdown</th>
                <th className="py-2 font-semibold">FHIR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCalls.map((call) => {
                const latestEhr = call.patient.ehrRecords[call.patient.ehrRecords.length - 1];
                return (
                  <tr key={call.id}>
                    <td className="py-3 pr-3">
                      <p className="font-bold text-slate-900">{call.patient.fullName}</p>
                      <p className="font-mono text-[11px] text-slate-500">
                        {call.patient.jshshirMasked} • {call.district}
                      </p>
                    </td>
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-slate-800">{call.assignedDoctor.fullName}</p>
                      <p className="text-[11px] text-slate-500">{call.polyclinicName}</p>
                    </td>
                    <td className="py-3 pr-3 max-w-xs">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[11px] font-mono ${
                          role === "ADMIN_RECEPTION"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-teal-50 text-teal-800"
                        }`}
                      >
                        {latestEhr?.diagnosisText ?? "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      {data?.simState && (
                        <SlaCountdownBadge
                          dischargedAt={call.dischargedAt}
                          slaDeadlineAt={call.slaDeadlineAt}
                          simulatedNow={data.simState.simulatedNow}
                          dataLoadedAtMs={dataLoadedAtMs}
                          status={call.status}
                        />
                      )}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => setFhirCallId(call.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <FileCode2 className="h-3.5 w-3.5 text-indigo-600" />
                        FHIR
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredCalls.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No calls matching selected SLA zone.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bed Release + Territorial Routing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bed Release & Check-Out */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-teal-600" />
            OvaBMU Bed Release &amp; Check-out Status
          </h2>
          <div className="space-y-2">
            {patients.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{p.fullName}</p>
                  <p className="text-slate-500">
                    {p.bedNumber ? p.bedNumber : "Bed Released • Checked Out"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    p.status === "INPATIENT"
                      ? "bg-indigo-100 text-indigo-800"
                      : p.status === "VISIT_COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Territorial Routing Table */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-600" />
            Territorial Polyclinic &amp; Family Doctor Routing
          </h2>
          <div className="space-y-2">
            {doctors.map((doc) => {
              const openSlots = doc.scheduleSlots.filter((s) => !s.bookedPatientId).length;
              const bookedSlots = doc.scheduleSlots.length - openSlots;
              return (
                <div
                  key={doc.id}
                  className="rounded-xl border border-slate-200 p-3 text-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-bold text-slate-900">{doc.fullName}</p>
                    <p className="text-slate-600">{doc.polyclinicName}</p>
                    <p className="text-[11px] text-slate-400">
                      Districts: {doc.district} • {doc.telegramHandle}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block rounded-lg bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 border border-emerald-200">
                      {openSlots} open / {bookedSlots} booked
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Pharmacy Stock & State Patronage Grant Accounting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-4 w-4 text-teal-600" />
            Polyclinic Pharmacy Stock Overview
          </h2>
          <div className="space-y-2">
            {patients.flatMap((p) =>
              p.prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-2.5 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {rx.medicationName} ({rx.dosage})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {rx.polyclinicPharmacy} • Patient: {p.fullName}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      rx.pharmacyStockStatus === "IN_STOCK"
                        ? "bg-emerald-100 text-emerald-800"
                        : rx.pharmacyStockStatus === "RESERVED"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {rx.pharmacyStockStatus}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-teal-600" />
              State Patronage &amp; Billing Accounting
            </h2>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              State Covered: {totalStateCovered.toLocaleString()} UZS
            </span>
          </div>
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-2.5 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{inv.description}</p>
                  <p className="text-[11px] text-slate-500">
                    {inv.patient.fullName} • {inv.packageName}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-slate-900">
                    {inv.amountUzs.toLocaleString()} UZS
                  </p>
                  <p
                    className={`text-[10px] font-bold ${
                      inv.category === "STATE_GRANT" ? "text-emerald-700" : "text-slate-500"
                    }`}
                  >
                    {inv.category === "STATE_GRANT"
                      ? "100% Davlat Granti"
                      : `Patient: ${inv.patientPayableUzs.toLocaleString()} UZS`}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Total optional patient diagnostics: <strong>{totalPatientPaid.toLocaleString()} UZS</strong>
          </p>
        </section>
      </div>

      {/* Immutable Security Audit Log Viewer */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-teal-600" />
          Immutable Security Audit Log (audit_logs)
        </h2>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-3 font-semibold">Timestamp</th>
                <th className="py-2 pr-3 font-semibold">Action</th>
                <th className="py-2 pr-3 font-semibold">Actor &amp; Role</th>
                <th className="py-2 pr-3 font-semibold">Resource</th>
                <th className="py-2 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2 pr-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("en-GB", {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-bold ${
                        log.action === "SLA_ESCALATED" ||
                        log.action === "SYMPTOM_ALERT" ||
                        log.action === "RBAC_DENIED"
                          ? "bg-rose-100 text-rose-800"
                          : log.action === "VISIT_VERIFIED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {log.action === "SLA_ESCALATED" && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {log.action === "VISIT_VERIFIED" && (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-sans text-slate-800">
                    {log.actorName}{" "}
                    <span className="text-slate-400">({log.actorRole})</span>
                  </td>
                  <td className="py-2 pr-3 text-slate-600">
                    {log.resourceType}:{log.resourceId.slice(-8)}
                  </td>
                  <td className="py-2 text-slate-500 max-w-xs truncate">
                    {log.detailsJson}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <FhirBundleModal activeCallId={fhirCallId} onClose={() => setFhirCallId(null)} />
    </div>
  );
}
