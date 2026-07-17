import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  ClipboardList,
  CreditCard,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import type { QueueSnapshot, UserRole, VisitKpi, VisitRecord } from "./types";

export const currentVisitRole: UserRole = "Doctor";

export const visitKpis: VisitKpi[] = [
  { label: "Total Visits", value: "1,284", trend: "+4%", helper: "All active visit records", tone: "primary", icon: ClipboardList },
  { label: "Waiting", value: "18", helper: "รอพบแพทย์", tone: "neutral", icon: Activity },
  { label: "In Consultation", value: "12", helper: "กำลังตรวจรักษา", tone: "primary", icon: Stethoscope },
  { label: "Completed", value: "84", helper: "Clinical flow completed", tone: "success", icon: BadgeCheck },
  { label: "Claim Ready", value: "65", helper: "Ready after human review", tone: "info", icon: ShieldCheck },
  { label: "Needs Attention", value: "7", helper: "Clinical alerts first", tone: "danger", icon: AlertTriangle },
];

export const queueSnapshots: QueueSnapshot[] = [
  { label: "Registration", value: "08", averageWait: "4m 12s", progress: 25, tone: "blue", icon: ClipboardList },
  { label: "Consultation", value: "12", averageWait: "28m 45s", progress: 85, tone: "warning", alert: "ABOVE OPERATIONAL THRESHOLD", icon: Stethoscope },
  { label: "Checkout", value: "05", averageWait: "6m 08s", progress: 45, tone: "success", icon: CreditCard },
];

export const visitRecords: VisitRecord[] = [
  { id: "visit-670412-01", visitId: "VN670412-01", patientId: "patient-prasert", patientName: "Prasert Kiatpakdee", initials: "PK", hnMasked: "HN 10••-55", demographics: "M, 42y", visitDate: "12 Apr 2026, 09:18", department: "Internal Medicine", clinician: "Dr. Malee S.", status: "In Consultation", completedSteps: 5, totalSteps: 8, aiState: "Reviewed", aiSummary: "2 suggestions reviewed", claimScore: 86, claimStatus: "Ready", evidenceSummary: "2 missing (SOAP)", risk: "High Clinical Risk", clinicalAlertPriority: 1, economicAmount: 2450, economicSignal: "Within range", assignedToMe: true, isToday: true, allowedActions: ["Doctor", "Nurse", "Claim Reviewer"] },
  { id: "visit-670412-05", visitId: "VN670412-05", patientId: "patient-somsak", patientName: "Somsak Manee", initials: "SM", hnMasked: "HN 10••-12", demographics: "M, 68y", visitDate: "12 Apr 2026, 10:02", department: "Cardiology", clinician: "Dr. Arun P.", status: "Completed", completedSteps: 8, totalSteps: 8, aiState: "Reviewed", aiSummary: "Claim code reviewed by clinician", claimScore: 100, claimStatus: "Ready", evidenceSummary: "Complete", risk: "Medication Risk", clinicalAlertPriority: 2, economicAmount: 8900, economicSignal: "Outlier", assignedToMe: false, isToday: true, allowedActions: ["Doctor", "Claim Reviewer"] },
  { id: "visit-670412-08", visitId: "VN670412-08", patientId: "patient-naree", patientName: "Naree Anan", initials: "NA", hnMasked: "HN 10••-90", demographics: "F, 29y", visitDate: "12 Apr 2026, 10:34", department: "General Practice", clinician: "Unassigned", status: "Waiting", completedSteps: 1, totalSteps: 8, aiState: "Processing", aiSummary: "Processing...", claimScore: null, claimStatus: "Calculating", evidenceSummary: "Pending triage", risk: "Low", clinicalAlertPriority: 5, economicAmount: null, economicSignal: "Pending", assignedToMe: false, isToday: true, allowedActions: ["Doctor", "Nurse"] },
  { id: "visit-670411-11", visitId: "VN670411-11", patientId: "patient-kanya", patientName: "Kanya Rattanakul", initials: "KR", hnMasked: "HN 11••-27", demographics: "F, 51y", visitDate: "11 Apr 2026, 15:20", department: "Orthopedics", clinician: "Dr. Narin C.", status: "Pharmacy", completedSteps: 7, totalSteps: 8, aiState: "Suggested", aiSummary: "1 low-confidence ICD suggestion", claimScore: 72, claimStatus: "Needs Review", evidenceSummary: "Medical certificate missing", risk: "Critical", clinicalAlertPriority: 0, economicAmount: 12680, economicSignal: "Outlier", assignedToMe: true, isToday: false, allowedActions: ["Doctor", "Claim Reviewer"] },
  { id: "visit-670411-18", visitId: "VN670411-18", patientId: "patient-anon", patientName: "Anon Chaiyo", initials: "AC", hnMasked: "HN 12••-63", demographics: "M, 34y", visitDate: "11 Apr 2026, 11:45", department: "ENT", clinician: "Dr. Sirin T.", status: "Completed", completedSteps: 8, totalSteps: 8, aiState: "Reviewed", aiSummary: "Evidence mapping reviewed", claimScore: 91, claimStatus: "Ready", evidenceSummary: "Complete", risk: "Low", clinicalAlertPriority: 5, economicAmount: 4100, economicSignal: "Within range", assignedToMe: false, isToday: false, allowedActions: ["Claim Reviewer"] },
  { id: "visit-670410-24", visitId: "VN670410-24", patientId: "patient-ploy", patientName: "Ploy Thanasit", initials: "PT", hnMasked: "HN 09••-09", demographics: "F, 46y", visitDate: "10 Apr 2026, 16:12", department: "Neurology", clinician: "Dr. Chai B.", status: "Completed", completedSteps: 8, totalSteps: 8, aiState: "Suggested", aiSummary: "AI summary requires human review", claimScore: 58, claimStatus: "Not Ready", evidenceSummary: "Prescription incomplete", risk: "High Clinical Risk", clinicalAlertPriority: 1, economicAmount: 7200, economicSignal: "Within range", assignedToMe: true, isToday: false, allowedActions: ["Doctor", "Claim Reviewer"] },
];
