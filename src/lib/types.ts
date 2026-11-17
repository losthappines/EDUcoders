export type UserRole = "OVABMU_MD" | "FAMILY_MD" | "PATIENT" | "ADMIN_RECEPTION";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface VitalsSnapshot {
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  tempC: number;
  spo2: number;
  respRate: number;
  recordedAt: string;
  phase: "INPATIENT_ADMISSION" | "INPATIENT_PRE_DISCHARGE" | "POST_DISCHARGE_HOME";
}

export interface LabResultItem {
  testName: string;
  value: string;
  numericValue?: number;
  unit: string;
  refRange: string;
  flag: "NORMAL" | "HIGH" | "LOW" | "CRITICAL";
}

export interface ChecklistItem {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  category: "VITALS" | "LAB_CHECK" | "PHYSICAL_EXAM" | "MEDICATION" | "RED_FLAG";
  checked: boolean;
  note?: string;
}

export interface PatientGuide {
  summaryUz: string;
  summaryRu: string;
  summaryEn: string;
  dailyRulesUz: string[];
  dailyRulesRu: string[];
  dailyRulesEn: string[];
  emergencySignsUz: string[];
  emergencySignsRu: string[];
  emergencySignsEn: string[];
}

export interface SymptomCheckin {
  id: string;
  createdAt: string;
  fever: boolean;
  severeHeadache: boolean;
  bleeding: boolean;
  swelling: boolean;
  bpReading: string;
  notes: string;
  aiTriageLevel: "GREEN" | "YELLOW" | "RED_EMERGENCY";
  aiAdviceUz: string;
  aiAdviceRu: string;
  aiAdviceEn: string;
}

export interface AgentTraceStep {
  step: number;
  agentName: string;
  toolCalled: string;
  durationMs: number;
  status: "COMPLETED" | "ESCALATED";
  summary: string;
  structuredOutput: Record<string, unknown>;
}

export interface NotificationLogEntry {
  id: string;
  channel: "TELEGRAM" | "SMS" | "INTERNAL_ALERT";
  recipientName: string;
  recipientRole: string;
  recipientHandle: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  sentAt: string;
}

export interface AdherenceLog {
  date: string;
  taken: boolean;
  note?: string;
}

export interface DoctorScheduleSlot {
  slotId: string;
  startHourOffset: number;
  endHourOffset: number;
  bookedPatientId?: string | null;
}
