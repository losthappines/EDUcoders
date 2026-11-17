"use client";

import React, { useMemo, useState } from "react";
import {
  IconAlertTriangle,
  IconBell,
  IconBuildingHospital,
  IconCircleCheck,
  IconExternalLink,
  IconFileCode,
  IconFlask,
  IconLock,
  IconPill,
  IconPlus,
  IconRobot,
  IconSend,
  IconStethoscope,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { SlaCountdownBadge } from "@/components/SlaCountdownBadge";
import { VitalsTrendChart } from "@/components/VitalsTrendChart";
import { FhirBundleModal } from "@/components/FhirBundleModal";
import { AgentTraceModal } from "@/components/AgentTraceModal";
import type { AgentTraceStep } from "@/lib/types";

export default function ClinicalDashboardPage() {
  const {
    role,
    data,
    loading,
    fetchWithAuth,
    refreshData,
    showToast,
    dataLoadedAtMs,
  } = usePlatform();

  const [selectedPatientId, setSelectedPatientId] = useState<string>("pat-malika");
  const [selectedCallId, setSelectedCallId] = useState<string>("");
  const [discharging, setDischarging] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [orderingLab, setOrderingLab] = useState(false);

  const [fhirCallId, setFhirCallId] = useState<string | null>(null);
  const [traceModal, setTraceModal] = useState<{
    patientName: string;
    trace: AgentTraceStep[];
  } | null>(null);

  // New e-prescription form
  const [rxFormOpen, setRxFormOpen] = useState(false);
  const [rxMed, setRxMed] = useState("Magne B6 Forte");
  const [rxDose, setRxDose] = useState("100 mg");
  const [rxFreq, setRxFreq] = useState("Kuniga 2 mahal");

  // Post-discharge vitals form
  const [sbp, setSbp] = useState("128");
  const [dbp, setDbp] = useState("82");
  const [hr, setHr] = useState("84");
  const [temp, setTemp] = useState("36.6");
  const [spo2, setSpo2] = useState("98");
  const [visitNotes, setVisitNotes] = useState(
    "Uy sharoitida ko'rik o'tkazildi. Bemorning umumiy ahvoli qoniqarli, dorilarni o'z vaqtida ichmoqda."
  );

  const patients = data?.patients ?? [];
  const activeCalls = useMemo(() => data?.activeCalls ?? [], [data?.activeCalls]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? patients[0];
  const selectedCall = activeCalls.find((c) => c.id === selectedCallId) ?? activeCalls[0];
  const selectedPatientCall = selectedPatient
    ? activeCalls.find((c) => c.patientId === selectedPatient.id)
    : undefined;

  const isOvabmu = role === "OVABMU_MD";

  const handleTriggerDischarge = async (patientId: string) => {
    setDischarging(true);
    try {
      const res = await fetchWithAuth("/api/agent/discharge-handoff", {
        method: "POST",
        body: JSON.stringify({ patientId }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast("error", json.error || "Chiqarishda xatolik yuz berdi");
        return;
      }
      await refreshData();
      showToast(
        "success",
        `Agentic AI Patronaj ishga tushdi (${json.totalDurationMs}ms)! Aktiv Chaqiruv yaratildi.`
      );
      setTraceModal({
        patientName: selectedPatient?.fullName ?? "Bemor",
        trace: json.agentTrace as AgentTraceStep[],
      });
      setSelectedCallId(json.activeCallId);
    } finally {
      setDischarging(false);
    }
  };

  const handleToggleChecklist = async (callId: string, itemId: string, checked: boolean) => {
    const res = await fetchWithAuth(`/api/active-calls/${callId}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ checklistItemId: itemId, checked }),
    });
    if (res.ok) {
      await refreshData();
    } else {
      showToast("error", "Checklistni yangilash uchun shifokor roli talab qilinadi.");
    }
  };

  const handleVerifyVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCall) return;
    setVerifying(true);
    try {
      const res = await fetchWithAuth(`/api/active-calls/${selectedCall.id}/verify`, {
        method: "POST",
        body: JSON.stringify({
          systolicBp: Number(sbp),
          diastolicBp: Number(dbp),
          heartRate: Number(hr),
          tempC: Number(temp),
          spo2: Number(spo2),
          visitNotes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast("error", json.error || "Tasdiqlashda xatolik");
        return;
      }
      await refreshData();
      showToast("success", "Uy patronaji muvaffaqiyatli tasdiqlandi va SLA yopildi!");
    } finally {
      setVerifying(false);
    }
  };

  const handleOrderFollowupLab = async (patientId: string, panelName: string) => {
    setOrderingLab(true);
    try {
      const res = await fetchWithAuth("/api/clinical/orders", {
        method: "POST",
        body: JSON.stringify({ type: "FOLLOWUP_LAB", patientId, panelName }),
      });
      if (res.ok) {
        await refreshData();
        showToast("success", `Qayta tahlil buyurtmasi yuborildi: ${panelName}`);
      } else {
        showToast("error", "Tahlil buyurtmasi uchun shifokor huquqi zarur.");
      }
    } finally {
      setOrderingLab(false);
    }
  };

  const handleAddRx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const res = await fetchWithAuth("/api/clinical/orders", {
      method: "POST",
      body: JSON.stringify({
        type: "ADD_PRESCRIPTION",
        patientId: selectedPatient.id,
        medicationName: rxMed,
        dosage: rxDose,
        frequency: rxFreq,
      }),
    });
    if (res.ok) {
      setRxFormOpen(false);
      await refreshData();
      showToast("success", `E-retsept qo'shildi: ${rxMed} ${rxDose}`);
    } else {
      showToast("error", "E-retsept yozish uchun shifokor huquqi zarur.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Role-Specific Clinical Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            {isOvabmu
              ? "OvaBMU Inpatient Discharge & AI Continuity Console"
              : "Regional Family Doctor — 24h Aktiv Chaqiruv Workspace"}
          </h1>
          <p className="text-xs text-slate-500">
            {isOvabmu
              ? "Manage inpatient maternal EHRs, trigger AI post-discharge patronage, and track handoffs"
              : "Execute 24-hour home patronage checklists, record post-discharge vitals, and verify visits"}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-teal-50 px-3.5 py-2 text-xs font-semibold text-teal-800 border border-teal-200">
          {isOvabmu ? (
            <>
              <IconBuildingHospital className="h-4 w-4 text-teal-600" />
              OvaBMU Inpatient Doctor ({patients.length} Patients)
            </>
          ) : (
            <>
              <IconStethoscope className="h-4 w-4 text-teal-600" />
              Regional Family Doctor ({activeCalls.filter((c) => c.status !== "COMPLETED").length} Pending)
            </>
          )}
        </div>
      </div>

      {/* ==================== VIEW 1: OVABMU INPATIENT DOCTOR VIEW ==================== */}
      {isOvabmu && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Patient Roster */}
          <div className="lg:col-span-4 space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              OvaBMU Maternal &amp; Perinatal Roster ({patients.length})
            </h2>
            {patients.map((p) => {
              const selected = p.id === selectedPatient?.id;
              const isInpatient = p.status === "INPATIENT";
              const latestEhr = p.ehrRecords[p.ehrRecords.length - 1];
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`w-full text-left rounded-xl border p-4 transition ${
                    selected
                      ? "border-teal-500 bg-teal-50/40 ring-1 ring-teal-500"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{p.fullName}</p>
                      <p className="font-mono text-[11px] text-slate-500">{p.jshshirMasked}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isInpatient
                          ? "bg-indigo-100 text-indigo-800"
                          : p.status === "VISIT_COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isInpatient
                        ? "INPATIENT"
                        : p.status === "VISIT_COMPLETED"
                          ? "VERIFIED"
                          : "24h PATRONAGE"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-700 font-medium">
                    {latestEhr?.diagnosisIcd10} — {latestEhr?.diagnosisText.slice(0, 62)}...
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {p.district}, {p.mahalla} {p.bedNumber ? `• ${p.bedNumber}` : ""}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right EHR Workspace */}
          <div className="lg:col-span-8">
            {loading || !selectedPatient ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Loading patient EHR...
              </div>
            ) : (
              <div className="space-y-4">
                {/* Patient Header + Discharge Trigger */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">
                          {selectedPatient.fullName}
                        </h2>
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                          JSHSHIR: {selectedPatient.jshshirMasked}
                        </span>
                        <span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                          {selectedPatient.bloodType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {selectedPatient.district}, {selectedPatient.mahalla}, {selectedPatient.address} •{" "}
                        {selectedPatient.phone}
                      </p>
                      <p className="text-xs text-slate-500">
                        Allergies:{" "}
                        <span className="font-semibold text-rose-700">
                          {selectedPatient.allergies.join(", ")}
                        </span>{" "}
                        • Assigned Polyclinic: <strong>{selectedPatient.polyclinicName}</strong>
                      </p>
                    </div>

                    {selectedPatient.status === "INPATIENT" ? (
                      <button
                        onClick={() => handleTriggerDischarge(selectedPatient.id)}
                        disabled={discharging || role !== "OVABMU_MD"}
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-xs font-bold text-white hover:bg-teal-700 shadow-sm disabled:opacity-50 shrink-0"
                      >
                        <IconRobot className="h-4 w-4" />
                        {discharging
                          ? "AI Agent ishlamoqda..."
                          : "Discharge & Trigger AI Patronage (Javob berish)"}
                      </button>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 border border-emerald-200">
                          <IconCircleCheck className="h-4 w-4 text-emerald-600" />
                          Discharged • AI Patronage Active
                        </div>
                        {selectedPatientCall && (
                          <>
                            <button
                              onClick={() =>
                                setTraceModal({
                                  patientName: selectedPatient.fullName,
                                  trace: selectedPatientCall.aiAgentTrace,
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <IconRobot className="h-3.5 w-3.5 text-teal-600" />
                              AI Trace
                            </button>
                            <button
                              onClick={() => setFhirCallId(selectedPatientCall.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <IconFileCode className="h-3.5 w-3.5 text-indigo-600" />
                              FHIR
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Latest Inpatient EHR & AES-256 Encryption */}
                  {selectedPatient.ehrRecords.map((ehr) => (
                    <div
                      key={ehr.id}
                      className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                            {ehr.diagnosisIcd10}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {ehr.recordType} ({ehr.severity})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-800 border border-teal-200">
                            <IconLock className="h-3 w-3" />
                            AES-256-GCM Encrypted
                          </span>
                          {ehr.dischargeDocumentKey && (
                            <a
                              href={`/api/storage/${ehr.dischargeDocumentKey}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-teal-700 border border-slate-300 hover:bg-slate-100"
                            >
                              <IconExternalLink className="h-3 w-3" />
                              S3 Archive Artifact
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">{ehr.diagnosisText}</p>
                      <p className="text-xs text-slate-700 leading-relaxed">{ehr.clinicalNotes}</p>
                      {ehr.procedures.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {ehr.procedures.map((proc, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-white px-2 py-0.5 text-[11px] text-slate-600 border border-slate-200"
                            >
                              {proc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Vitals Trend Chart */}
                <VitalsTrendChart
                  records={selectedPatient.ehrRecords.map((ehr) => ({
                    label:
                      ehr.recordType === "POST_DISCHARGE_VITALS"
                        ? "Uy patronaji"
                        : "Chiqarish (OvaBMU)",
                    vitals: ehr.vitals,
                  }))}
                />

                {/* Labs & E-Prescriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Labs */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <IconFlask className="h-4 w-4 text-teal-600" />
                        OvaBMU Lab Panels
                      </h3>
                      <button
                        onClick={() =>
                          handleOrderFollowupLab(
                            selectedPatient.id,
                            "Qayta Gemoglobin & CRP Nazorati"
                          )
                        }
                        disabled={orderingLab}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <IconPlus className="h-3 w-3" />
                        Order Follow-Up
                      </button>
                    </div>
                    {selectedPatient.labReports.map((lab) => (
                      <div key={lab.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{lab.panelName}</span>
                          <span className="text-[10px] font-semibold uppercase text-slate-500">
                            {lab.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {lab.results.map((r, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
                            >
                              <span className="text-slate-700">{r.testName}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900">
                                  {r.value} {r.unit}
                                </span>
                                {r.flag !== "NORMAL" && (
                                  <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                      r.flag === "CRITICAL"
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {r.flag}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* E-Prescriptions */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <IconPill className="h-4 w-4 text-teal-600" />
                        Discharge E-Prescriptions
                      </h3>
                      <button
                        onClick={() => setRxFormOpen((v) => !v)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <IconPlus className="h-3 w-3" />
                        Add Rx
                      </button>
                    </div>

                    {rxFormOpen && (
                      <form
                        onSubmit={handleAddRx}
                        className="rounded-xl border border-teal-200 bg-teal-50/40 p-3 space-y-2"
                      >
                        <input
                          value={rxMed}
                          onChange={(e) => setRxMed(e.target.value)}
                          placeholder="Dori nomi"
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                          required
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={rxDose}
                            onChange={(e) => setRxDose(e.target.value)}
                            placeholder="Doza"
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                            required
                          />
                          <input
                            value={rxFreq}
                            onChange={(e) => setRxFreq(e.target.value)}
                            placeholder="Davriyligi"
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full rounded-lg bg-teal-600 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                        >
                          Save E-Prescription
                        </button>
                      </form>
                    )}

                    <div className="space-y-2">
                      {selectedPatient.prescriptions.map((rx) => (
                        <div key={rx.id} className="rounded-xl border border-slate-200 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              {rx.medicationName} ({rx.dosage})
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                rx.pharmacyStockStatus === "IN_STOCK"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : rx.pharmacyStockStatus === "RESERVED"
                                    ? "bg-teal-50 text-teal-700"
                                    : "bg-amber-50 text-amber-800"
                              }`}
                            >
                              {rx.pharmacyStockStatus}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            {rx.frequency} • {rx.durationDays} kun • {rx.polyclinicPharmacy}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">{rx.instructionsUz}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== VIEW 2: REGIONAL FAMILY DOCTOR VIEW ==================== */}
      {!isOvabmu && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Aktiv Chaqiruv Queue */}
          <div className="lg:col-span-4 space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Aktiv Chaqiruv Queue (Sorted by SLA)
            </h2>
            {activeCalls.map((call) => {
              const selected = call.id === selectedCall?.id;
              return (
                <button
                  key={call.id}
                  onClick={() => setSelectedCallId(call.id)}
                  className={`w-full text-left rounded-xl border p-4 space-y-2 transition ${
                    selected
                      ? "border-teal-500 bg-teal-50/40 ring-1 ring-teal-500"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {call.patient.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {call.district}, {call.patient.mahalla}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        call.riskScore >= 80
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      Risk {call.riskScore}
                    </span>
                  </div>

                  {data?.simState && (
                    <SlaCountdownBadge
                      dischargedAt={call.dischargedAt}
                      slaDeadlineAt={call.slaDeadlineAt}
                      simulatedNow={data.simState.simulatedNow}
                      dataLoadedAtMs={dataLoadedAtMs}
                      status={call.status}
                    />
                  )}

                  {call.symptomCheckins.some((s) => s.aiTriageLevel === "RED_EMERGENCY") && (
                    <div className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white flex items-center gap-1.5">
                      <IconAlertTriangle className="h-3.5 w-3.5" />
                      PATIENT REPORTED EMERGENCY SYMPTOMS
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Family Doctor Execution Workspace */}
          <div className="lg:col-span-8">
            {!selectedCall ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                No Active Calls in your polyclinic scope yet.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Call Header & Actions */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">
                          {selectedCall.patient.fullName}
                        </h2>
                        <span className="font-mono text-xs text-slate-500">
                          {selectedCall.patient.jshshirMasked}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Address: <strong>{selectedCall.patient.address}</strong> ({selectedCall.patient.mahalla}) •{" "}
                        {selectedCall.patient.phone}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Assigned Window:{" "}
                        <strong>
                          {new Date(selectedCall.scheduledWindowStart).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          –
                          {new Date(selectedCall.scheduledWindowEnd).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </strong>{" "}
                        • {selectedCall.assignedDoctor.fullName}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {data?.simState && (
                        <SlaCountdownBadge
                          dischargedAt={selectedCall.dischargedAt}
                          slaDeadlineAt={selectedCall.slaDeadlineAt}
                          simulatedNow={data.simState.simulatedNow}
                          dataLoadedAtMs={dataLoadedAtMs}
                          status={selectedCall.status}
                        />
                      )}
                      <button
                        onClick={() =>
                          setTraceModal({
                            patientName: selectedCall.patient.fullName,
                            trace: selectedCall.aiAgentTrace,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <IconRobot className="h-3.5 w-3.5 text-teal-600" />
                        AI Agent Trace
                      </button>
                      <button
                        onClick={() => setFhirCallId(selectedCall.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <IconFileCode className="h-3.5 w-3.5 text-indigo-600" />
                        View HL7 FHIR Bundle
                      </button>
                    </div>
                  </div>

                  {/* AI Top 3 Red Flags */}
                  <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-rose-800 mb-1.5 flex items-center gap-1.5">
                      <IconAlertTriangle className="h-3.5 w-3.5" />
                      AI-Synthesized Clinical Red Flags (Risk Score: {selectedCall.riskScore}/100)
                    </h3>
                    <ul className="space-y-1 text-xs text-rose-900 list-disc pl-4">
                      {selectedCall.redFlags.map((flag, i) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 5-Item Custom Uzbek Checklist */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        24-Hour Home-Visit Examination Checklist (O&apos;zbekcha)
                      </h3>
                      <button
                        onClick={() =>
                          handleOrderFollowupLab(
                            selectedCall.patientId,
                            "Uy sharoitida Qayta Gemoglobin & Siydik Oqsili"
                          )
                        }
                        disabled={orderingLab}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800"
                      >
                        <IconFlask className="h-3.5 w-3.5" />
                        1-Click Follow-Up Lab Order
                      </button>
                    </div>
                    <div className="space-y-2">
                      {selectedCall.checklist.map((item) => (
                        <label
                          key={item.id}
                          className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                            item.checked
                              ? "border-emerald-300 bg-emerald-50/50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) =>
                              handleToggleChecklist(selectedCall.id, item.id, e.target.checked)
                            }
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <div className="flex-1">
                            <p
                              className={`text-xs font-semibold ${
                                item.checked ? "line-through text-slate-500" : "text-slate-900"
                              }`}
                            >
                              {item.titleUz}
                            </p>
                            <p className="text-[11px] text-slate-500">{item.titleEn}</p>
                          </div>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                            {item.category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Post-Discharge Vitals Logger & Visit Verification */}
                <form
                  onSubmit={handleVerifyVisit}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Post-Discharge Home Vitals &amp; Visit Verification
                    </h3>
                    {selectedCall.visitVerifiedAt && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <IconCircleCheck className="h-3.5 w-3.5" />
                        Verified ({selectedCall.verificationMethod})
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Systolic BP
                      </label>
                      <input
                        type="number"
                        value={sbp}
                        onChange={(e) => setSbp(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Diastolic BP
                      </label>
                      <input
                        type="number"
                        value={dbp}
                        onChange={(e) => setDbp(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Heart Rate
                      </label>
                      <input
                        type="number"
                        value={hr}
                        onChange={(e) => setHr(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Temp (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={temp}
                        onChange={(e) => setTemp(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        SpO2 (%)
                      </label>
                      <input
                        type="number"
                        value={spo2}
                        onChange={(e) => setSpo2(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Patronaj ko&apos;rigi xulosasi (Visit Notes)
                    </label>
                    <textarea
                      rows={2}
                      value={visitNotes}
                      onChange={(e) => setVisitNotes(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={verifying || selectedCall.status === "COMPLETED"}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50"
                  >
                    <IconSend className="h-3.5 w-3.5" />
                    {selectedCall.status === "COMPLETED"
                      ? "Patronaj allaqachon tasdiqlangan"
                      : verifying
                        ? "Saqlanmoqda..."
                        : "Submit Vitals & Verify Home Visit"}
                  </button>
                </form>

                {/* Telegram / SMS Notification Dispatch Log */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                    <IconBell className="h-3.5 w-3.5 text-teal-600" />
                    Automated Telegram / SMS Alert Log
                  </h3>
                  {selectedCall.notificationLog.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-lg border p-2.5 text-xs ${
                        n.severity === "CRITICAL"
                          ? "border-rose-200 bg-rose-50 text-rose-900"
                          : n.severity === "WARNING"
                            ? "border-amber-200 bg-amber-50 text-amber-900"
                            : "border-slate-200 bg-slate-50 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold mb-0.5">
                        <span>
                          [{n.channel}] {n.recipientName} ({n.recipientHandle})
                        </span>
                        <span className="font-mono text-[10px] opacity-75">
                          {new Date(n.sentAt).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p>{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
