"use client";

import React from "react";
import Link from "next/link";
import {
  IconActivity,
  IconArrowRight,
  IconBuildingHospital,
  IconChecklist,
  IconClock,
  IconFileCode,
  IconHeartHandshake,
  IconLock,
  IconLogin,
  IconLogout,
  IconRobot,
  IconShieldCheck,
  IconSparkles,
  IconStethoscope,
  IconUserPlus,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import type { UserRole } from "@/lib/types";

function getPortalHref(role: UserRole): string {
  if (role === "PATIENT") return "/patient";
  if (role === "ADMIN_RECEPTION") return "/admin";
  return "/clinical";
}

function getPortalLabel(role: UserRole): string {
  if (role === "PATIENT") return "Bemor Kabinetiga Kirish";
  if (role === "OVABMU_MD") return "OvaBMU Shifokor Portaliga Kirish";
  if (role === "FAMILY_MD") return "Oilaviy Shifokor Portaliga Kirish";
  return "Admin & SLA Portaliga Kirish";
}

export default function LandingPage() {
  const { authUser, authChecked, logout } = usePlatform();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Public Landing Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <IconHeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  OnaCare AI
                </span>
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 border border-teal-200">
                  Patronaj 24/7
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Avtomatlashtirilgan Patronaj Tizimi • Continuity of Care
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#workflow" className="hover:text-teal-700 transition">
              Agentic AI Workflow
            </a>
            <a href="#portals" className="hover:text-teal-700 transition">
              Role-Isolated Portals
            </a>
            <a href="#sla" className="hover:text-teal-700 transition">
              24h SLA Guarantee
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {authChecked && authUser ? (
              <>
                <Link
                  href={getPortalHref(authUser.role)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
                >
                  {getPortalLabel(authUser.role)}
                  <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <IconLogout className="h-3.5 w-3.5" />
                  Chiqish
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <IconLogin className="h-3.5 w-3.5" />
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
                >
                  <IconUserPlus className="h-3.5 w-3.5" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3.5 py-1.5 text-xs font-semibold text-teal-800 border border-teal-200">
                  <IconSparkles className="h-4 w-4 text-teal-600" />
                  National AI Hackathon • Task #11: Avtomatlashtirilgan Patronaj Tizimi
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12]">
                  OvaBMU → Oilaviy Poliklinika:{" "}
                  <span className="text-teal-700">Zero-Gap 24-Hour</span> Maternal
                  Continuity of Care
                </h1>

                <p className="text-base leading-relaxed text-slate-600 max-w-2xl">
                  The instant a high-risk maternal or perinatal patient is discharged
                  from OvaBMU, our <strong>4-Step Agentic AI Coordinator</strong>{" "}
                  synthesizes her EHR and labs, dispatches an automated{" "}
                  <strong>&ldquo;Aktiv Chaqiruv&rdquo;</strong> to the territorial
                  Regional Family Doctor, builds an Uzbek home-visit checklist, and
                  enforces a strict <strong>24-hour SLA</strong>.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {authChecked && authUser ? (
                    <Link
                      href={getPortalHref(authUser.role)}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition"
                    >
                      {getPortalLabel(authUser.role)}
                      <IconArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition"
                      >
                        <IconUserPlus className="h-4 w-4" />
                        Create Free Account
                      </Link>
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
                      >
                        <IconLogin className="h-4 w-4 text-teal-600" />
                        Sign In to Your Portal
                      </Link>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                    <IconLock className="h-4 w-4 text-teal-600" />
                    AES-256-GCM Encrypted EHR
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                    <IconFileCode className="h-4 w-4 text-teal-600" />
                    HL7 FHIR R4 Compliant
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                    <IconShieldCheck className="h-4 w-4 text-teal-600" />
                    Strict Role-Isolated Portals
                  </span>
                </div>
              </div>

              {/* Architectural Preview Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        <IconRobot className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          Agentic AI Continuity Pipeline
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Autonomous Post-Discharge Coordination
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                      LIVE 24h SLA
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {[
                      {
                        step: "01",
                        title: "EHR & Lab Risk Synthesis",
                        desc: "Scores post-discharge severity (ICD-10, Hb, BP, CRP) & extracts red flags.",
                      },
                      {
                        step: "02",
                        title: "Territorial Polyclinic Routing",
                        desc: "Matches Mahalla/District to the Regional Family Doctor & books conflict-free slot.",
                      },
                      {
                        step: "03",
                        title: "Uzbek Clinical Checklist & Guide",
                        desc: "Creates protocol checklist for doctor + UZ/RU/EN care guide for patient.",
                      },
                      {
                        step: "04",
                        title: "24h SLA Watchdog & Escalations",
                        desc: "Auto-escalates at 12h (Yellow) & 18h (Red) until OTP-verified home visit.",
                      },
                    ].map((item) => (
                      <div
                        key={item.step}
                        className="flex items-start gap-3 rounded-xl bg-slate-800/80 p-3 border border-slate-700/80"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-600 text-[11px] font-bold text-white font-mono">
                          {item.step}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-100">{item.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Separated Role Portals */}
        <section id="portals" className="mx-auto max-w-7xl px-4 py-14 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Role-Based Access Control (RBAC)
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              Three Strictly Isolated Portals — Accessed Only by Signing In
            </h2>
            <p className="text-sm text-slate-600">
              Every user logs into a dedicated portal tailored strictly to their role.
              Patients only see their own recovery portal and never have access to
              doctors&apos; clinical records or admin governance views.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                  <IconHeartHandshake className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Patient Portal (/patient)
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Sign up as a patient to view only your own recovery plan, UZ/RU/EN
                  home-care rules, active e-prescriptions, AI symptom triage check-in,
                  and 1-tap / 4-digit OTP home visit confirmation.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Own Data Only</span>
                <Link
                  href="/signup?role=PATIENT"
                  className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline"
                >
                  Sign up as Patient <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <IconStethoscope className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Doctors&apos; Clinical Portal (/clinical)
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Dedicated workspace for OvaBMU Inpatient Doctors to trigger AI
                  discharge handoffs, and Regional Family Doctors to execute 24h home
                  patronage checklists, vitals logging, and lab/Rx orders.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">OVABMU_MD &amp; FAMILY_MD</span>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:underline"
                >
                  Doctor Sign In <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800 border border-slate-300">
                  <IconShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Admin &amp; SLA Governance (/admin)
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Monitor district 24-hour SLA countdowns, bed turnover, state-grant vs.
                  paid diagnostic billing, HL7 FHIR R4 interoperability, and audit logs —
                  with sensitive clinical notes RBAC-redacted.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">ADMIN_RECEPTION</span>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:underline"
                >
                  Admin Sign In <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow & SLA Architecture */}
        <section id="workflow" className="border-t border-slate-200 bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 space-y-10">
            <div id="sla" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                  <IconClock className="h-3.5 w-3.5" />
                  Zero-Gap 24-Hour SLA Escalation Ladder
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Automated Escalation Prevents Post-Discharge Drop-Offs
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  In high-risk maternal care (severe preeclampsia, postpartum hemorrhage,
                  post-cesarean sepsis), missing a 24-hour follow-up can be fatal.
                  OnaCare AI continuously evaluates every active patronage window.
                </p>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
                    <span className="font-bold text-emerald-900">0 – 12 Hours • Green Zone</span>
                    <span className="text-emerald-700 font-medium">
                      Assigned Family MD notified via Telegram &amp; slot reserved
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3">
                    <span className="font-bold text-amber-900">12 – 18 Hours • Yellow Warning</span>
                    <span className="text-amber-800 font-medium">
                      Automated SLA warning dispatched to Doctor &amp; Polyclinic Lead
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-3">
                    <span className="font-bold text-rose-900">18 – 24+ Hours • Red Critical</span>
                    <span className="text-rose-800 font-medium">
                      District Medical Head &amp; Reception alerted for immediate backup
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
                  <IconBuildingHospital className="h-6 w-6 text-teal-700" />
                  <h3 className="text-sm font-bold text-slate-900">OvaBMU Instant Epikriz</h3>
                  <p className="text-xs text-slate-600">
                    Generates structured Epikriz summaries and frees ICU/maternity beds
                    with one click.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
                  <IconChecklist className="h-6 w-6 text-teal-700" />
                  <h3 className="text-sm font-bold text-slate-900">Tailored UZ Checklists</h3>
                  <p className="text-xs text-slate-600">
                    Diagnosis-specific physical exam, vitals, and lab verification items
                    for home visits.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
                  <IconActivity className="h-6 w-6 text-teal-700" />
                  <h3 className="text-sm font-bold text-slate-900">Patient AI Symptom Triage</h3>
                  <p className="text-xs text-slate-600">
                    Real-time blood pressure and red-flag check-ins auto-upgrade case
                    priority when needed.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
                  <IconFileCode className="h-6 w-6 text-teal-700" />
                  <h3 className="text-sm font-bold text-slate-900">HL7 FHIR R4 Ready</h3>
                  <p className="text-xs text-slate-600">
                    Standardized Patient, Encounter, CarePlan, Task, and MedicationRequest
                    JSON bundles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-900 text-slate-400 py-8">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <IconHeartHandshake className="h-4 w-4 text-teal-400" />
            OnaCare AI — Avtomatlashtirilgan Patronaj Tizimi
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/login" className="hover:text-white transition">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-white transition">
              Sign Up
            </Link>
            <span>AES-256-GCM • HL7 FHIR R4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
