import type { ActivityItem, BreakdownItem, CaseRow, ContextItem, KpiCard, NavItem, PackageItem } from "./ai-copilot-panel-types";

export const navItems: NavItem[] = [
  { group: "Command Center", label: "AI Copilot Panel", active: true },
  { group: "Command Center", label: "Executive Dashboard" },
  { group: "Command Center", label: "Claim Readiness" },
  { group: "Command Center", label: "Evidence Package" },
  { group: "Clinical Workflow", label: "Patient Management" },
  { group: "Clinical Workflow", label: "Visit Management" },
  { group: "Clinical Workflow", label: "SOAP Note" },
  { group: "Governance", label: "Audit & Compliance" },
];

export const contextItems: ContextItem[] = [
  { label: "Patient", value: "S. K**** · HN-248019" },
  { label: "Visit", value: "OPD-2026-0712" },
  { label: "Visit Status", value: "Pending Evidence", badgeTone: "amber" },
  { label: "Claim Status", value: "Not Ready", badgeTone: "red" },
  { label: "Payer", value: "AIA Health" },
  { label: "Assigned Reviewer", value: "Dr. Ananda" },
];

export const kpis: KpiCard[] = [
  { title: "Today Visit Queue", value: "128", delta: "+12% vs prior", deltaTone: "up", target: "Target 115", color: "#2563EB", sparkline: [84, 92, 101, 96, 109, 114, 128] },
  { title: "Claim Ready Rate", value: "72%", delta: "+4 pts", deltaTone: "up", target: "Target 85%", color: "#059669", sparkline: [64, 66, 68, 70, 69, 73, 72] },
  { title: "Blocking Issues", value: "12", delta: "-6 cases", deltaTone: "good-down", target: "2 critical", color: "#DC2626", sparkline: [22, 19, 18, 17, 16, 15, 12] },
  { title: "AI Confidence", value: "88%", delta: "+3 pts", deltaTone: "up", target: "4 evidence sources", color: "#7C3AED", sparkline: [72, 74, 76, 75, 78, 80, 81] },
];

export const queueData = [
  { name: "Waiting", value: 18, color: "#94A3B8" },
  { name: "In Consultation", value: 24, color: "#2563EB" },
  { name: "Pending Evidence", value: 31, color: "#D97706" },
  { name: "Completed", value: 55, color: "#059669" },
];

export const readinessData = [
  { name: "Ready", value: 72, color: "#059669" },
  { name: "Needs Review", value: 19, color: "#D97706" },
  { name: "Not Ready", value: 9, color: "#DC2626" },
];

export const trendData = [
  { day: "Day 1", actual: 66, target: 85, previous: 64 },
  { day: "Day 2", actual: 68, target: 85, previous: 65 },
  { day: "Day 3", actual: 70, target: 85, previous: 67 },
  { day: "Day 4", actual: 69, target: 85, previous: 68 },
  { day: "Day 5", actual: 71, target: 85, previous: 69 },
  { day: "Day 6", actual: 73, target: 85, previous: 70 },
  { day: "Day 7", actual: 72, target: 85, previous: 71 },
];

export const evidenceData = [
  { name: "SOAP Incomplete", cases: 18 },
  { name: "ICD Missing", cases: 14 },
  { name: "Attachment Missing", cases: 7 },
  { name: "Prescription Missing", cases: 6 },
];

export const costBenchmarkData = [
  { name: "Actual Cost", value: 2850 },
  { name: "Expected Cost", value: 2400 },
  { name: "Upper Threshold", value: 2600 },
];

export const cases: CaseRow[] = [
  { id: 1, priority: "P0 Critical", patient: "S. K****", hn: "HN-248019", visit: "Pending Evidence", score: 54, claim: "Not Ready", evidence: ["ICD Missing", "SOAP Incomplete"], alert: "Allergy Safety", cost: "Alert +18.8%", aging: 192, sla: 120, reviewer: "Dr. Ananda", payer: "AIA Health", updated: "10:42", updatedRank: 6 },
  { id: 2, priority: "P1 High", patient: "N. P****", hn: "HN-248020", visit: "Pending Evidence", score: 68, claim: "Needs Review", evidence: ["ICD Missing"], alert: "Coding Conflict", cost: "Normal", aging: 148, sla: 120, reviewer: "Ms. Nicha", payer: "Allianz Ayudhya", updated: "10:31", updatedRank: 5 },
  { id: 3, priority: "P1 High", patient: "P. R****", hn: "HN-248021", visit: "In Consultation", score: 76, claim: "Needs Review", evidence: ["SOAP Incomplete"], alert: "Plan Missing", cost: "Alert +21.4%", aging: 27, sla: 30, reviewer: "Mr. Krit", payer: "Muang Thai Life", updated: "10:26", updatedRank: 4 },
  { id: 4, priority: "P2 Medium", patient: "A. T****", hn: "HN-248022", visit: "Pharmacy", score: 82, claim: "Needs Review", evidence: ["Prescription Missing"], alert: "Pending Review", cost: "Normal", aging: 14, sla: 20, reviewer: "Unassigned", payer: "AIA Health", updated: "10:18", updatedRank: 3 },
  { id: 5, priority: "P2 Medium", patient: "C. L****", hn: "HN-248023", visit: "Waiting", score: 88, claim: "Ready", evidence: ["Attachment Missing"], alert: "No Critical Alert", cost: "Normal", aging: 18, sla: 20, reviewer: "Ms. Nicha", payer: "Self Pay", updated: "10:11", updatedRank: 2 },
  { id: 6, priority: "P3 Low", patient: "M. S****", hn: "HN-248024", visit: "Completed", score: 94, claim: "Ready", evidence: [], alert: "No Critical Alert", cost: "Normal", aging: 0, sla: 0, reviewer: "Mr. Krit", payer: "Allianz Ayudhya", updated: "09:58", updatedRank: 1 },
];

export const activities: ActivityItem[] = [
  { id: 1, time: "10:45", actor: "Dr. Ananda", action: "updated SOAP Note", module: "Clinical", detail: "Clinical Documentation · Version 4 · Logged" },
  { id: 2, time: "10:43", actor: "AI Copilot", action: "suggested ICD-10 J06.9", module: "AI", detail: "Confidence 92% · Human confirmation pending · Logged" },
  { id: 3, time: "10:38", actor: "Ms. Nicha", action: "requested Evidence Package", module: "Insurance", detail: "Insurance Intelligence · Request EVT-2871 · Logged" },
  { id: 4, time: "10:32", actor: "Economic Engine", action: "triggered cost alert", module: "Compliance", detail: "Economic Intelligence · Variance +18.8% · Logged" },
];

export const packageChecklist: PackageItem[] = [
  { name: "SOAP Note", status: "Needs Review" },
  { name: "ICD-10", status: "Missing" },
  { name: "Prescription", status: "Complete" },
  { name: "Attachments", status: "Complete" },
  { name: "Medical Certificate", status: "Not Applicable" },
  { name: "Claim Summary", status: "Complete" },
  { name: "Economic Summary", status: "Needs Review" },
  { name: "Audit Summary", status: "Complete" },
];

export const breakdownItems: BreakdownItem[] = [
  { name: "SOAP Completeness", score: 18, max: 25, status: "Needs Review", missing: "Assessment and Plan incomplete", recommended: "Complete SOAP review" },
  { name: "Diagnosis and ICD", score: 12, max: 20, status: "Blocked", missing: "ICD-10 missing", recommended: "Confirm and add ICD-10" },
  { name: "Prescription and Procedure", score: 15, max: 15, status: "Complete", missing: "None", recommended: "No action required" },
  { name: "Evidence Completeness", score: 14, max: 20, status: "Needs Review", missing: "Attachment metadata pending", recommended: "Validate supporting evidence" },
  { name: "Payer Rule Alignment", score: 9, max: 10, status: "Complete", missing: "Minor payer warning", recommended: "Review benefit rule" },
  { name: "Economic Justification", score: 8, max: 10, status: "Needs Review", missing: "Cost variance explanation", recommended: "Add cost justification" },
];

