"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type {
  AdherenceLog,
  AgentTraceStep,
  ChecklistItem,
  DoctorScheduleSlot,
  LabResultItem,
  NotificationLogEntry,
  PatientGuide,
  SymptomCheckin,
  UserRole,
  VitalsSnapshot,
} from "@/lib/types";

export interface PlatformUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  polyclinicId: string | null;
  polyclinicName: string | null;
  district: string | null;
  specialty: string | null;
  phone: string | null;
  telegramHandle: string | null;
  scheduleSlots: DoctorScheduleSlot[];
}

export interface PlatformEhrRecord {
  id: string;
  patientId: string;
  authorId: string;
  recordType: string;
  diagnosisIcd10: string;
  diagnosisText: string;
  severity: string;
  clinicalNotes: string;
  encryptionCipherPreview: string;
  vitals: VitalsSnapshot;
  procedures: string[];
  dischargeDocumentKey: string | null;
  createdAt: string;
}

export interface PlatformLabReport {
  id: string;
  patientId: string;
  panelName: string;
  status: string;
  results: LabResultItem[];
  attachmentKey: string | null;
  reportedAt: string;
}

export interface PlatformPrescription {
  id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructionsUz: string;
  instructionsRu: string;
  instructionsEn: string;
  pharmacyStockStatus: string;
  polyclinicPharmacy: string;
  adherenceLogs: AdherenceLog[];
  active: boolean;
}

export interface PlatformPatient {
  id: string;
  fullName: string;
  jshshirMasked: string;
  dateOfBirth: string;
  phone: string;
  district: string;
  mahalla: string;
  address: string;
  bloodType: string;
  allergies: string[];
  polyclinicId: string;
  polyclinicName: string;
  assignedFamilyDoctorId: string | null;
  assignedFamilyDoctor: PlatformUser | null;
  emergencyContact: string;
  status: string;
  bedNumber: string | null;
  admittedAt: string;
  dischargedAt: string | null;
  ehrRecords: PlatformEhrRecord[];
  labReports: PlatformLabReport[];
  prescriptions: PlatformPrescription[];
}

export interface PlatformActiveCall {
  id: string;
  patientId: string;
  patient: PlatformPatient;
  dischargedById: string;
  dischargedBy: PlatformUser;
  assignedDoctorId: string;
  assignedDoctor: PlatformUser;
  polyclinicName: string;
  district: string;
  status: string;
  priority: string;
  riskScore: number;
  redFlags: string[];
  checklist: ChecklistItem[];
  patientGuide: PatientGuide;
  scheduledWindowStart: string;
  scheduledWindowEnd: string;
  dischargedAt: string;
  slaDeadlineAt: string;
  escalationLevel: number;
  symptomCheckins: SymptomCheckin[];
  doctorVitals: VitalsSnapshot | null;
  visitNotes: string | null;
  patientOtpCode: string;
  visitVerifiedAt: string | null;
  verificationMethod: string | null;
  aiAgentTrace: AgentTraceStep[];
  notificationLog: NotificationLogEntry[];
  sla: {
    elapsedMs: number;
    elapsedHours: number;
    remainingMs: number;
    totalWindowMs: number;
    isOverdue: boolean;
    zone: "GREEN" | "YELLOW" | "RED" | "COMPLETED";
  };
}

export interface PlatformInvoice {
  id: string;
  patientId: string;
  activeCallId: string;
  itemCode: string;
  description: string;
  category: string;
  amountUzs: number;
  stateCoveredUzs: number;
  patientPayableUzs: number;
  packageName: string;
  status: string;
  createdAt: string;
  patient: { id: string; fullName: string; district: string };
}

export interface PlatformAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  detailsJson: string;
  createdAt: string;
}

export interface PlatformStatePayload {
  actor: {
    userId: string;
    fullName: string;
    role: UserRole;
    polyclinicId: string | null;
    district: string | null;
  };
  simState: {
    timeOffsetHours: number;
    simulatedNow: string;
  };
  users: PlatformUser[];
  patients: PlatformPatient[];
  activeCalls: PlatformActiveCall[];
  invoices: PlatformInvoice[];
  auditLogs: PlatformAuditLog[];
}

interface PlatformContextValue {
  role: UserRole;
  userId: string | null;
  clinicalTab: "ovabmu" | "family";
  setClinicalTab: (tab: "ovabmu" | "family") => void;
  data: PlatformStatePayload | null;
  loading: boolean;
  simBusy: boolean;
  toast: { type: "success" | "error" | "info"; text: string } | null;
  showToast: (type: "success" | "error" | "info", text: string) => void;
  fetchWithAuth: (url: string, init?: RequestInit) => Promise<Response>;
  refreshData: (overrideRole?: UserRole, overrideUserId?: string | null) => Promise<void>;
  switchRole: (nextRole: UserRole, navigate?: boolean) => Promise<void>;
  fastForwardTime: (hours: number) => Promise<void>;
  resetDemo: () => Promise<void>;
  dataLoadedAtMs: number;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("OVABMU_MD");
  const [userId, setUserId] = useState<string | null>(null);
  const [clinicalTab, setClinicalTab] = useState<"ovabmu" | "family">("ovabmu");
  const [data, setData] = useState<PlatformStatePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simBusy, setSimBusy] = useState<boolean>(false);
  const [dataLoadedAtMs, setDataLoadedAtMs] = useState<number>(0);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const showToast = useCallback(
    (type: "success" | "error" | "info", text: string) => {
      setToast({ type, text });
      setTimeout(() => {
        setToast((curr) => (curr?.text === text ? null : curr));
      }, 4500);
    },
    []
  );

  const fetchWithAuth = useCallback(
    async (
      url: string,
      init?: RequestInit,
      overrideRole?: UserRole,
      overrideUserId?: string | null
    ) => {
      const effectiveRole = overrideRole ?? role;
      const effectiveUser = overrideUserId !== undefined ? overrideUserId : userId;
      const headers = new Headers(init?.headers || {});
      headers.set("x-demo-role", effectiveRole);
      if (effectiveUser) {
        headers.set("x-demo-user-id", effectiveUser);
      }
      if (init?.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      return fetch(url, { ...init, headers, cache: "no-store" });
    },
    [role, userId]
  );

  const refreshData = useCallback(
    async (overrideRole?: UserRole, overrideUserId?: string | null) => {
      try {
        const res = await fetchWithAuth(
          "/api/platform",
          undefined,
          overrideRole,
          overrideUserId
        );
        if (res.ok) {
          const json = (await res.json()) as PlatformStatePayload;
          setData(json);
          setDataLoadedAtMs(Date.now());
        }
      } catch (err) {
        console.error("Failed to refresh platform data:", err);
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth]
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/platform", {
      headers: { "x-demo-role": "OVABMU_MD" },
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: PlatformStatePayload | null) => {
        if (!cancelled && json) {
          setData(json);
          setDataLoadedAtMs(Date.now());
        }
      })
      .catch((err) => console.error("Initial load error:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const switchRole = useCallback(
    async (nextRole: UserRole, navigate = true) => {
      setRole(nextRole);
      const nextUserId =
        nextRole === "OVABMU_MD"
          ? "usr-ovabmu-1"
          : nextRole === "FAMILY_MD"
            ? "usr-family-tashkent"
            : nextRole === "PATIENT"
              ? "usr-patient-1"
              : "usr-admin-1";
      setUserId(nextUserId);
      document.cookie = `patronaj_role=${nextRole}; path=/`;
      document.cookie = `patronaj_user_id=${nextUserId}; path=/`;

      if (nextRole === "OVABMU_MD") setClinicalTab("ovabmu");
      if (nextRole === "FAMILY_MD") setClinicalTab("family");

      await refreshData(nextRole, nextUserId);

      if (navigate) {
        if (nextRole === "OVABMU_MD" || nextRole === "FAMILY_MD") {
          router.push("/clinical");
        } else if (nextRole === "PATIENT") {
          router.push("/patient");
        } else {
          router.push("/admin");
        }
      }
    },
    [refreshData, router]
  );

  const fastForwardTime = useCallback(
    async (hours: number) => {
      setSimBusy(true);
      try {
        const res = await fetchWithAuth("/api/sim-time", {
          method: "POST",
          body: JSON.stringify({ action: "ADD_HOURS", hours }),
        });
        if (res.ok) {
          const out = (await res.json()) as {
            timeOffsetHours: number;
            evaluation: { escalatedCount: number };
          };
          await refreshData();
          showToast(
            out.evaluation.escalatedCount > 0 ? "error" : "info",
            `Vaqt +${hours} soatga tezlashtirildi (Jami +${out.timeOffsetHours}h). ${
              out.evaluation.escalatedCount > 0
                ? `${out.evaluation.escalatedCount} ta holatda SLA eskalatsiya ishga tushdi!`
                : "SLA taymerlari yangilandi."
            }`
          );
        }
      } finally {
        setSimBusy(false);
      }
    },
    [fetchWithAuth, refreshData, showToast]
  );

  const resetDemo = useCallback(async () => {
    setSimBusy(true);
    try {
      const res = await fetchWithAuth("/api/sim-time", {
        method: "POST",
        body: JSON.stringify({ action: "RESET" }),
      });
      if (res.ok) {
        await refreshData();
        showToast("success", "Demo ma'lumotlari va SLA vaqti boshlang'ich holatga qaytarildi.");
      }
    } finally {
      setSimBusy(false);
    }
  }, [fetchWithAuth, refreshData, showToast]);

  const value = useMemo<PlatformContextValue>(
    () => ({
      role,
      userId,
      clinicalTab,
      setClinicalTab,
      data,
      loading,
      simBusy,
      toast,
      showToast,
      fetchWithAuth,
      refreshData,
      switchRole,
      fastForwardTime,
      resetDemo,
      dataLoadedAtMs,
    }),
    [
      role,
      userId,
      clinicalTab,
      data,
      loading,
      simBusy,
      toast,
      showToast,
      fetchWithAuth,
      refreshData,
      switchRole,
      fastForwardTime,
      resetDemo,
      dataLoadedAtMs,
    ]
  );

  return (
    <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
  );
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
}
