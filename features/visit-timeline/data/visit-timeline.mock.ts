import {
  Activity,
  Bot,
  ClipboardCheck,
  ClipboardPlus,
  FileText,
  Pill,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TriangleAlert,
} from "lucide-react";

import type {
  ClaimReadiness,
  MissingEvidence,
  RecentActivity,
  TimelineEvent,
  TimelineSummary,
  VisitContext,
} from "../types/visit-timeline.types";

export const visitContext: VisitContext = {
  visitId: "VIS-2026-0710-0142",
  patientName: "Kanya Wattanakul",
  patientInitials: "KW",
  patientMeta: "HN 02-884921 · Female · 42 yrs · Bangkok",
  visitType: "OPD Follow-up",
  department: "Internal Medicine",
  physician: "Dr. Anan P.",
  payer: "AIA Health Plus",
  policy: "OPD-HP-2026",
  visitStatus: "Active · Needs Review",
};

export const timelineSummary: TimelineSummary[] = [
  { id: "all", label: "Total Events", value: "18", footnote: "Across clinical, AI, claim, and audit" },
  { id: "clinical", label: "Clinical Updates", value: "7", footnote: "SOAP, vitals, orders, prescription" },
  { id: "document", label: "Documentation Gaps", value: "2", footnote: "Action required today", tone: "warning" },
  { id: "ai", label: "AI Suggestions", value: "5", footnote: "Decision support only", tone: "ai" },
  { id: "insurance", label: "Payer Checks", value: "4", footnote: "AIA rule set validated" },
  { id: "audit", label: "Readiness Score", value: "82", footnote: "Needs Review · +14 today", tone: "score" },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "evt-readiness",
    day: "Today · 10 Jul 2026",
    time: "10:44",
    title: "Claim View Readiness Recalculated",
    actor: "Claim View Intelligence Engine · System Service",
    description:
      "Readiness improved after ICD-10 confirmation and SOAP assessment completion. Medical certificate evidence is still required before Ready status.",
    category: ["ai", "insurance", "audit"],
    severity: "ai",
    badges: [
      { label: "AI-Assisted", tone: "ai" },
      { label: "+14 Score Impact", tone: "azure" },
      { label: "Human Review Required", tone: "amber" },
    ],
    actions: ["Open Intelligence Detail", "View Rule Trace", "Copy Audit Ref"],
    searchText: "claim readiness recalculated ai insurance audit score aia medical certificate",
    icon: Sparkles,
    details: {
      eventRef: "EVT-26-0710-1044",
      auditRef: "AUD-9F2A7D",
      source: "System Generated",
      department: "Internal Medicine",
      module: "Claim View Readiness",
      timestamp: "10 Jul 2026 · 10:44:18",
      operationalDescription:
        "Claim View Readiness was automatically recalculated following confirmation of ICD-10 code J20.9 and completion of SOAP Assessment. The score improved by 14 points, while two evidence items remain open.",
      scoreImpact: { previous: 68, current: 82 },
    },
  },
  {
    id: "evt-icd",
    day: "Today · 10 Jul 2026",
    time: "10:32",
    title: "ICD-10 Suggestion Accepted",
    actor: "Dr. Anan P. · Physician Workspace",
    description:
      "AI suggestion J20.9 was accepted after physician review. The system logged rationale, source note, and reviewer confirmation.",
    category: ["clinical", "ai", "audit"],
    severity: "success",
    badges: [
      { label: "Physician Accepted", tone: "green" },
      { label: "Explainable AI", tone: "ai" },
      { label: "Audit Logged", tone: "gray" },
    ],
    actions: ["View ICD Rationale", "Audit View Record"],
    searchText: "icd suggestion accepted j20.9 physician ai rationale audit",
    icon: Bot,
  },
  {
    id: "evt-soap",
    day: "Today · 10 Jul 2026",
    time: "10:21",
    title: "SOAP Assessment Completed",
    actor: "Dr. Anan P. · Clinical Documentation",
    description:
      "Assessment section completed with updated clinical impression. The note remains subject to physician final sign-off.",
    category: ["clinical", "document", "audit"],
    severity: "success",
    badges: [
      { label: "SOAP Complete", tone: "green" },
      { label: "Version v3", tone: "blue" },
    ],
    actions: ["View SOAP Version", "Compare Changes"],
    searchText: "soap assessment completed documentation clinical version compare",
    icon: ClipboardCheck,
  },
  {
    id: "evt-med-cert",
    day: "Today · 10 Jul 2026",
    time: "10:08",
    title: "Medical Certificate Evidence Missing",
    actor: "Evidence Completeness Agent · Policy Rule Validator",
    description:
      "AIA-MC-01 requires a medical certificate for this claim package. No certificate is attached to the visit evidence set.",
    category: ["document", "insurance", "ai"],
    severity: "critical",
    badges: [
      { label: "Critical Evidence Gap", tone: "red" },
      { label: "Payer Rule AIA-MC-01", tone: "amber" },
    ],
    actions: ["Open Medical Certificate", "Assign Task"],
    searchText: "medical certificate missing evidence aia mc 01 policy payer",
    icon: TriangleAlert,
  },
  {
    id: "evt-prescription",
    day: "Today · 10 Jul 2026",
    time: "09:58",
    title: "Prescription Draft Created",
    actor: "Pharmacy Review Queue · Medication Safety Rule",
    description:
      "Prescription draft was created and flagged for justification review before claim package finalization.",
    category: ["clinical", "document", "insurance"],
    severity: "warning",
    badges: [
      { label: "Justification Required", tone: "amber" },
      { label: "Pharmacy Review", tone: "blue" },
    ],
    actions: ["View Prescription", "Assign Review Task"],
    searchText: "prescription draft justification medication pharmacy review insurance",
    icon: Pill,
  },
  {
    id: "evt-vitals",
    day: "Today · 10 Jul 2026",
    time: "09:34",
    title: "Vital Signs Recorded",
    actor: "Nurse Pimchanok K. · Triage Station 2",
    category: ["clinical", "audit"],
    severity: "neutral",
    badges: [
      { label: "Nurse Recorded", tone: "blue" },
      { label: "Clinical Input", tone: "gray" },
    ],
    actions: ["View Vital Signs", "View Clinical Trend"],
    searchText: "vital signs bp pulse temperature spo2 weight triage nurse",
    icon: Activity,
    metrics: [
      { label: "BP", value: "148/92 mmHg" },
      { label: "Pulse", value: "88 bpm" },
      { label: "Temp", value: "37.8 C" },
      { label: "SpO2", value: "97%" },
      { label: "Weight", value: "74.2 kg" },
    ],
  },
  {
    id: "evt-registration",
    day: "Today · 10 Jul 2026",
    time: "09:15",
    title: "Visit Registration Completed",
    actor: "Siriporn T. · Clinic Staff · Front Desk",
    description:
      "OPD visit created with queue number A-0142. Insurance eligibility was verified and matched to the AIA Health Plus policy.",
    category: ["audit", "insurance"],
    severity: "neutral",
    badges: [
      { label: "User-Initiated", tone: "gray" },
      { label: "Completed", tone: "green" },
    ],
    actions: ["View Registration Detail", "Audit View Record"],
    searchText: "patient registration visit created queue opd imported insurance eligibility",
    icon: ClipboardPlus,
  },
  {
    id: "evt-eligibility",
    day: "Yesterday · 9 Jul 2026",
    time: "16:42",
    title: "Payer Eligibility Response Imported",
    actor: "Insurance Gateway · AIA Health Plus",
    description:
      "Eligibility payload confirmed active OPD benefits. Policy exclusions require human review when respiratory medication exceeds covered threshold.",
    category: ["insurance", "audit"],
    severity: "success",
    badges: [
      { label: "Eligibility Matched", tone: "green" },
      { label: "Policy Trace Stored", tone: "blue" },
    ],
    actions: ["View Eligibility", "Open Policy Trace"],
    searchText: "eligibility imported insurance gateway aia opd benefits policy",
    icon: ShieldCheck,
  },
  {
    id: "evt-summary",
    day: "Yesterday · 9 Jul 2026",
    time: "15:18",
    title: "Clinical Summary Drafted",
    actor: "Clinical Summary Assistant · Decision Support",
    description:
      "Summary draft prepared from visit documentation. The draft is not a diagnosis and requires clinician verification before release.",
    category: ["clinical", "ai", "document"],
    severity: "ai",
    badges: [
      { label: "Draft Only", tone: "amber" },
      { label: "AI Decision Support", tone: "ai" },
    ],
    actions: ["Review Summary", "Open Source Evidence"],
    searchText: "clinical summary drafted ai decision support documentation source evidence",
    icon: FileText,
  },
  {
    id: "evt-invoice",
    day: "Yesterday · 9 Jul 2026",
    time: "14:05",
    title: "Charge Capture Linked to Visit",
    actor: "Billing Operations · OPD Cashier",
    description:
      "Charge lines were linked to the encounter and made available for economic validation and claim package review.",
    category: ["insurance", "audit"],
    severity: "neutral",
    badges: [
      { label: "Billing Linked", tone: "blue" },
      { label: "Audit Logged", tone: "gray" },
    ],
    actions: ["View Charge Detail", "Economic Validation"],
    searchText: "charge capture invoice billing economic validation claim package",
    icon: ReceiptText,
  },
  {
    id: "evt-complaint",
    day: "Yesterday · 9 Jul 2026",
    time: "13:22",
    title: "Chief Complaint Updated",
    actor: "Dr. Anan P. · Clinical Documentation",
    description:
      "Chief complaint and onset information were updated after patient interview. Previous version remains available in audit history.",
    category: ["clinical", "document", "audit"],
    severity: "neutral",
    badges: [
      { label: "Documentation Update", tone: "blue" },
      { label: "Versioned", tone: "gray" },
    ],
    actions: ["Compare Versions", "View Audit"],
    searchText: "chief complaint updated onset patient interview documentation audit",
    icon: Stethoscope,
  },
];

export const claimReadiness: ClaimReadiness = {
  score: 82,
  status: "Needs Review",
  help: "3 points from Ready\nLast assessed 3 minutes ago",
  improvement: "+14 Improvement",
  breakdown: [
    { label: "SOAP Completeness", points: "23/25", percent: 92, tone: "good" },
    { label: "Diagnosis & ICD-10", points: "20/20", percent: 100, tone: "good" },
    { label: "Prescription & Procedure", points: "11/15", percent: 73, tone: "warning" },
    { label: "Evidence Completeness", points: "12/20", percent: 60, tone: "warning" },
    { label: "Payer Rule Validation", points: "9/10", percent: 90, tone: "good" },
    { label: "Economic Validation", points: "7/10", percent: 70, tone: "default" },
  ],
};

export const missingEvidence: MissingEvidence[] = [
  {
    id: "ev-med-cert",
    title: "Medical Certificate Required",
    meta: "Rule AIA-MC-01 · Responsible: Doctor · Due Today",
    action: "Open Medical Certificate",
  },
  {
    id: "ev-prescription",
    title: "Prescription Justification Required",
    meta: "Medication Safety Rule · Pharmacist · Due 11:30",
    action: "Assign Review Task",
  },
];

export const recentActivity: RecentActivity[] = [
  { id: "act-anan", initials: "AN", text: "Dr. Anan accepted an AI ICD recommendation.", time: "8 minutes ago · Web Application" },
  { id: "act-ai", initials: "AI", text: "Claim View Engine recalculated readiness to 82.", time: "3 minutes ago · System Service" },
  { id: "act-pim", initials: "PK", text: "Nurse Pimchanok recorded the latest vital signs.", time: "1 hour ago · Triage Tablet" },
];
