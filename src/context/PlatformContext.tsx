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

export interface AuthUserSummary {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  polyclinicId: string | null;
  polyclinicName: string | null;
  district: string | null;
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
  actor: AuthUserSummary;
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

export interface SignupInput {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  district?: string;
  mahalla?: string;
  address?: string;
  dateOfBirth?: string;
  bloodType?: string;
}

interface PlatformContextValue {
  authUser: AuthUserSummary | null;
  authChecked: boolean;
  role: UserRole | null;
  userId: string | null;
  data: PlatformStatePayload | null;
  loading: boolean;
  simBusy: boolean;
  toast: { type: "success" | "error" | "info"; text: string } | null;
  showToast: (type: "success" | "error" | "info", text: string) => void;
  fetchWithAuth: (url: string, init?: RequestInit) => Promise<Response>;
  refreshData: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (input: SignupInput) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  fastForwardTime: (hours: number) => Promise<void>;
  resetDemo: () => Promise<void>;
  dataLoadedAtMs: number;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<AuthUserSummary | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
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

  const fetchWithAuth = useCallback(async (url: string, init?: RequestInit) => {
    const headers = new Headers(init?.headers || {});
    if (init?.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return fetch(url, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/platform");
      if (res.status === 401) {
        setAuthUser(null);
        setData(null);
        return;
      }
      if (res.ok) {
        const json = (await res.json()) as PlatformStatePayload;
        setAuthUser(json.actor);
        setData(json);
        setDataLoadedAtMs(Date.now());
      }
    } catch (err) {
      console.error("Failed to refresh platform data:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        async (me: { authenticated: boolean; user: AuthUserSummary | null } | null) => {
          if (cancelled) return;
          if (me?.authenticated && me.user) {
            setAuthUser(me.user);
            setAuthChecked(true);
            await refreshData();
          } else {
            setAuthUser(null);
            setData(null);
            setAuthChecked(true);
            setLoading(false);
          }
        }
      )
      .catch((err) => {
        console.error("Initial session check error:", err);
        if (!cancelled) {
          setAuthChecked(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refreshData]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const out = (await res.json()) as {
        error?: string;
        redirectTo?: string;
        user?: {
          id: string;
          email: string;
          fullName: string;
          role: UserRole;
          polyclinicId: string | null;
          polyclinicName: string | null;
          district: string | null;
        };
      };
      if (!res.ok || !out.user) {
        return { ok: false, error: out.error || "Sign in failed." };
      }
      setAuthUser({
        userId: out.user.id,
        email: out.user.email,
        fullName: out.user.fullName,
        role: out.user.role,
        polyclinicId: out.user.polyclinicId,
        polyclinicName: out.user.polyclinicName,
        district: out.user.district,
      });
      setAuthChecked(true);
      await refreshData();
      showToast("success", `Xush kelibsiz, ${out.user.fullName}!`);
      router.push(out.redirectTo || "/");
      return { ok: true };
    },
    [refreshData, router, showToast]
  );

  const signup = useCallback(
    async (input: SignupInput) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      });
      const out = (await res.json()) as {
        error?: string;
        redirectTo?: string;
        user?: {
          id: string;
          email: string;
          fullName: string;
          role: UserRole;
          polyclinicId: string | null;
          polyclinicName: string | null;
          district: string | null;
        };
      };
      if (!res.ok || !out.user) {
        return { ok: false, error: out.error || "Registration failed." };
      }
      setAuthUser({
        userId: out.user.id,
        email: out.user.email,
        fullName: out.user.fullName,
        role: out.user.role,
        polyclinicId: out.user.polyclinicId,
        polyclinicName: out.user.polyclinicName,
        district: out.user.district,
      });
      setAuthChecked(true);
      await refreshData();
      showToast("success", `Hisob yaratildi: ${out.user.fullName}`);
      router.push(out.redirectTo || "/");
      return { ok: true };
    },
    [refreshData, router, showToast]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setAuthUser(null);
    setData(null);
    showToast("info", "Tizimdan muvaffaqiyatli chiqdingiz.");
    router.push("/");
  }, [router, showToast]);

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
        showToast(
          "success",
          "Demo ma'lumotlari va SLA vaqti boshlang'ich holatga qaytarildi."
        );
      }
    } finally {
      setSimBusy(false);
    }
  }, [fetchWithAuth, refreshData, showToast]);

  const role = authUser?.role ?? null;
  const userId = authUser?.userId ?? null;

  const value = useMemo<PlatformContextValue>(
    () => ({
      authUser,
      authChecked,
      role,
      userId,
      data,
      loading,
      simBusy,
      toast,
      showToast,
      fetchWithAuth,
      refreshData,
      login,
      signup,
      logout,
      fastForwardTime,
      resetDemo,
      dataLoadedAtMs,
    }),
    [
      authUser,
      authChecked,
      role,
      userId,
      data,
      loading,
      simBusy,
      toast,
      showToast,
      fetchWithAuth,
      refreshData,
      login,
      signup,
      logout,
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
