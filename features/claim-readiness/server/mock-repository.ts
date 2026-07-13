import {
  calculateBalancedScore,
  calculateExecutiveDashboardSummary,
  classifyRisk,
} from "../domain/rules";
import type {
  ClaimReadinessDetail,
  ClaimReadinessEncounter,
  CreateDocumentationTaskInput,
  DocumentationTask,
  EvidencePackage,
  ExecutiveDashboardSummary,
  ListQuery,
  OrchestratorAgentOutput,
  PayerRuleSetting,
  ReadinessGap,
} from "../domain/types";
import { ClaimReadinessError } from "./errors";

const now = new Date("2026-07-09T03:30:00.000Z").toISOString();

const encounters: ClaimReadinessEncounter[] = [
  buildEncounter({
    id: "enc-1001",
    encounterCode: "ENC-CR-1001",
    patientLabel: "Patient A-104",
    department: "Internal Medicine",
    doctor: "Dr. Arisa V.",
    payer: "Aster Health",
    date: "2026-07-08",
    status: "clinical_review",
    missingEvidence: 2,
    topGap: "Referenced lab result is not linked to the encounter.",
    scores: [62, 78, 74, 67, 61],
    tasks: { open: 1, inProgress: 1, resolved: 0 },
  }),
  buildEncounter({
    id: "enc-1002",
    encounterCode: "ENC-CR-1002",
    patientLabel: "Patient B-228",
    department: "Orthopedics",
    doctor: "Dr. Niran S.",
    payer: "BlueCare Plus",
    date: "2026-07-07",
    status: "blocked",
    missingEvidence: 4,
    topGap: "Plan section is incomplete for the requested service.",
    scores: [44, 48, 56, 50, 58],
    tasks: { open: 2, inProgress: 0, resolved: 0 },
  }),
  buildEncounter({
    id: "enc-1003",
    encounterCode: "ENC-CR-1003",
    patientLabel: "Patient C-319",
    department: "Cardiology",
    doctor: "Dr. Mali K.",
    payer: "Siam Shield",
    date: "2026-07-06",
    status: "ready_for_review",
    missingEvidence: 0,
    topGap: "No critical gaps detected; human review still required.",
    scores: [92, 88, 89, 86, 84],
    tasks: { open: 0, inProgress: 0, resolved: 2 },
  }),
  buildEncounter({
    id: "enc-1004",
    encounterCode: "ENC-CR-1004",
    patientLabel: "Patient D-442",
    department: "Neurology",
    doctor: "Dr. Kanda P.",
    payer: "Aster Health",
    date: "2026-07-05",
    status: "documentation_pending",
    missingEvidence: 1,
    topGap: "ICD suggestion needs support from assessment documentation.",
    scores: [84, 76, 64, 72, 77],
    tasks: { open: 1, inProgress: 0, resolved: 1 },
  }),
];

const gaps: ReadinessGap[] = [
  {
    id: "gap-1001-lab",
    encounterId: "enc-1001",
    category: "evidence",
    severity: "high",
    title: "Referenced lab result missing",
    explanation:
      "The Objective section references a lab result, but the evidence package does not link the supporting result.",
    suggestedAction:
      "Attach or reference the lab result before moving the claim draft to submission review.",
    source: "SOAP Objective",
    relatedEvidence: "Evidence Package: missing lab result reference",
    status: "open",
  },
  {
    id: "gap-1001-payer",
    encounterId: "enc-1001",
    category: "payer_rule",
    severity: "medium",
    title: "Payer document check incomplete",
    explanation:
      "One configured payer rule could not be fully evaluated from the synthetic evidence set.",
    suggestedAction:
      "Ask a reviewer to confirm whether the payer-specific supporting document is required.",
    source: "Insurance rule validation",
    relatedEvidence: "Configured payer rule: Aster Health documentation check",
    status: "open",
  },
  {
    id: "gap-1002-plan",
    encounterId: "enc-1002",
    category: "soap",
    severity: "critical",
    title: "Plan section incomplete",
    explanation:
      "The Plan section does not contain enough documented next-step context for claim readiness review.",
    suggestedAction:
      "Authorized clinical staff should complete the Plan section. This task does not modify the medical record automatically.",
    source: "SOAP Plan",
    relatedEvidence: "SOAP note completeness review",
    status: "open",
  },
  {
    id: "gap-1002-evidence",
    encounterId: "enc-1002",
    category: "evidence",
    severity: "critical",
    title: "Required supporting evidence missing",
    explanation:
      "The encounter has multiple missing evidence references for documented services.",
    suggestedAction:
      "Attach or link existing supporting documentation before claim submission review.",
    source: "Evidence Package",
    relatedEvidence: "Missing clinical support documents",
    status: "task_created",
  },
  {
    id: "gap-1003-human-review",
    encounterId: "enc-1003",
    category: "compliance",
    severity: "low",
    title: "Human confirmation required",
    explanation:
      "The encounter appears ready for the next review step, but readiness signals do not approve or submit claims.",
    suggestedAction:
      "Authorized staff should complete the standard claim submission confirmation workflow.",
    source: "Compliance Guard",
    relatedEvidence: "Audit and human-in-the-loop policy",
    status: "reviewed",
  },
  {
    id: "gap-1004-icd",
    encounterId: "enc-1004",
    category: "icd",
    severity: "high",
    title: "ICD support needs review",
    explanation:
      "The suggested ICD candidate is partially supported but needs clearer assessment documentation before claim review.",
    suggestedAction:
      "Have an authorized coding or clinical reviewer confirm the documentation support.",
    source: "ICD consistency evaluator",
    relatedEvidence: "SOAP Assessment and clinical summary",
    status: "open",
  },
];

const evidencePackages: EvidencePackage[] = [
  {
    id: "evp-1001",
    encounterId: "enc-1001",
    status: "needs_review",
    completeness: 67,
    requiredItems: 3,
    linkedItems: 2,
    missingItems: 1,
    reviewerNote:
      "One referenced lab support item is missing. Human review is required before claim submission review.",
    items: [
      {
        id: "evp-1001-soap",
        label: "SOAP note",
        source: "Encounter documentation",
        status: "linked",
        required: true,
        lastCheckedAt: now,
      },
      {
        id: "evp-1001-lab",
        label: "Referenced lab result",
        source: "Evidence Package",
        status: "missing",
        required: true,
        lastCheckedAt: now,
      },
      {
        id: "evp-1001-summary",
        label: "Clinical summary",
        source: "Clinical Summary",
        status: "linked",
        required: true,
        lastCheckedAt: now,
      },
    ],
  },
  {
    id: "evp-1002",
    encounterId: "enc-1002",
    status: "blocked",
    completeness: 42,
    requiredItems: 4,
    linkedItems: 1,
    missingItems: 3,
    reviewerNote:
      "Critical supporting evidence is missing and the Plan section needs completion by authorized clinical staff.",
    items: [
      {
        id: "evp-1002-soap",
        label: "Completed SOAP Plan",
        source: "SOAP Plan",
        status: "missing",
        required: true,
        lastCheckedAt: now,
      },
      {
        id: "evp-1002-service",
        label: "Service support document",
        source: "Evidence Package",
        status: "missing",
        required: true,
        lastCheckedAt: now,
      },
      {
        id: "evp-1002-summary",
        label: "Clinical summary",
        source: "Clinical Summary",
        status: "linked",
        required: true,
        lastCheckedAt: now,
      },
      {
        id: "evp-1002-policy",
        label: "Payer policy checklist",
        source: "Payer Rule Validator",
        status: "needs_review",
        required: true,
        lastCheckedAt: now,
      },
    ],
  },
  {
    id: "evp-1003",
    encounterId: "enc-1003",
    status: "complete",
    completeness: 100,
    requiredItems: 3,
    linkedItems: 3,
    missingItems: 0,
    reviewerNote:
      "Required evidence is linked. This does not approve or submit the claim.",
    items: [
      {
        id: "evp-1003-soap",
        label: "SOAP note",
        source: "Encounter documentation",
        status: "linked",
        required: true,
        lastCheckedAt: now,
      },
      {
        id: "evp-1003-summary",
        label: "Clinical summary",
        source: "Clinical Summary",
        status: "linked",
        required: true,
        lastCheckedAt: now,
      },
      {
        id: "evp-1003-payer",
        label: "Payer checklist",
        source: "Payer Rule Validator",
        status: "linked",
        required: true,
        lastCheckedAt: now,
      },
    ],
  },
  {
    id: "evp-1004",
    encounterId: "enc-1004",
    status: "needs_review",
    completeness: 75,
    requiredItems: 4,
    linkedItems: 3,
    missingItems: 1,
    reviewerNote:
      "ICD support should be confirmed by an authorized coding or clinical reviewer.",
    items: [
      {
        id: "evp-1004-soap",
        label: "SOAP Assessment",
        source: "SOAP note",
        status: "needs_review",
        required: true,
        lastCheckedAt: now,
      },
      {
        id: "evp-1004-summary",
        label: "Clinical summary",
        source: "Clinical Summary",
        status: "linked",
        required: true,
        lastCheckedAt: now,
      },
      {
        id: "evp-1004-icd",
        label: "ICD support reference",
        source: "ICD Suggestion",
        status: "missing",
        required: true,
        lastCheckedAt: now,
      },
      {
        id: "evp-1004-policy",
        label: "Payer checklist",
        source: "Payer Rule Validator",
        status: "linked",
        required: true,
        lastCheckedAt: now,
      },
    ],
  },
];

const payerRules: PayerRuleSetting[] = [
  {
    id: "rule-aster-evidence",
    payerName: "Aster Health",
    ruleName: "Supporting evidence completeness",
    category: "evidence",
    status: "active",
    strictness: "enhanced",
    requiredEvidence: "SOAP note, clinical summary, referenced results",
    humanReviewRequired: true,
    effectiveFrom: "2026-07-01",
    lastUpdatedAt: now,
  },
  {
    id: "rule-bluecare-plan",
    payerName: "BlueCare Plus",
    ruleName: "SOAP Plan completeness",
    category: "soap",
    status: "needs_review",
    strictness: "enhanced",
    requiredEvidence: "Completed SOAP Plan and service support document",
    humanReviewRequired: true,
    effectiveFrom: "2026-07-01",
    lastUpdatedAt: now,
  },
  {
    id: "rule-siam-checklist",
    payerName: "Siam Shield",
    ruleName: "Standard claim readiness checklist",
    category: "payer_rule",
    status: "active",
    strictness: "standard",
    requiredEvidence: "SOAP note, clinical summary, payer checklist",
    humanReviewRequired: true,
    effectiveFrom: "2026-07-01",
    lastUpdatedAt: now,
  },
];

const orchestratorOutput: OrchestratorAgentOutput = {
  summary:
    "Executive Dashboard MVP 1 coordinates claim readiness, evidence package readiness, and payer rule settings for human review.",
  reasoning:
    "The Orchestrator delegates scope, workflow, architecture, implementation, data contract, and QA validation to specialist agents, then merges results behind the existing claim-readiness service boundary.",
  confidence: 0.82,
  deliverables: [
    "Claim readiness executive KPIs",
    "Evidence package readiness panel",
    "Payer rule setting overview",
    "Structured specialist agent outputs",
  ],
  risks: [
    "Synthetic data does not prove payer-specific production behavior.",
    "MVP data is in-memory and must be replaced with Supabase persistence.",
  ],
  recommendations: [
    "Require authorized human review before any claim action.",
    "Add Supabase RLS and durable audit persistence before production use.",
  ],
  nextAction:
    "Validate MVP behavior with QA and Compliance Guard, then plan database persistence.",
  specialists: [
    specialist(
      "Business Analyst Agent",
      "Confirmed MVP scope across claim readiness, evidence completeness, payer settings, audit, and dashboard metrics.",
      "Focus remains on operational intelligence and documentation quality without automated claim decisions.",
      ["MVP scope alignment", "Success metric mapping"],
      ["Production payer policies are not represented by synthetic rules."],
      ["Keep score labels as readiness indicators, not approval decisions."],
      "Review production workflow terminology with business stakeholders.",
      0.84,
    ),
    specialist(
      "Product Owner Agent",
      "Prioritized executive visibility, review queues, and payer setting transparency for MVP 1.",
      "Dashboard users need risk visibility and next actions before deeper automation.",
      ["MVP acceptance framing", "Human-in-the-loop wording"],
      ["Users may misread readiness as approval without explicit guardrails."],
      ["Keep safety disclaimer visible in dashboard and detail views."],
      "Confirm threshold labels with clinical and insurance leadership.",
      0.8,
    ),
    specialist(
      "Solution Architect Agent",
      "Kept implementation inside the existing feature boundary and service orchestration layer.",
      "Existing App Router and feature-folder architecture already separates domain, server, and UI concerns.",
      ["Domain contracts", "Service orchestration shape"],
      ["Mock repository must not become production persistence."],
      ["Introduce Supabase repositories behind the same service interface."],
      "Design RLS-backed tables for readiness, evidence, payer rules, and audit.",
      0.86,
    ),
    specialist(
      "Frontend Agent",
      "Extended current dashboard and detail surfaces without duplicate routes.",
      "Executive dashboard needs dense, scannable operational panels rather than a marketing landing page.",
      ["KPI panel", "Payer rule table", "Evidence package detail panel"],
      ["Large rule lists will need pagination and filtering later."],
      ["Add accessible form feedback when task creation errors are handled inline."],
      "Validate responsive layout on common desktop and tablet widths.",
      0.78,
    ),
    specialist(
      "Backend Agent",
      "Exposed dashboard aggregation through the existing claim readiness service.",
      "Capability checks and audit events should remain server-side to protect governance boundaries.",
      ["Dashboard service method", "Audit event contract"],
      ["In-memory audit adapter is not durable."],
      ["Persist audit events before production workflows are enabled."],
      "Replace mock repository functions with Supabase-backed adapters.",
      0.83,
    ),
    specialist(
      "Database Agent",
      "Identified persistence needs for evidence packages, payer rule settings, and audit events.",
      "MVP 1 can use synthetic fixtures, but production requires tenant-scoped relational tables and RLS.",
      ["Database gap notes", "RLS planning scope"],
      ["No migration is included in this MVP increment."],
      ["Store source references and metadata, not raw PHI-heavy note bodies."],
      "Create migrations and RLS policies in the next persistence phase.",
      0.77,
    ),
    specialist(
      "QA Agent",
      "Defined validation focus for readiness scoring, evidence status, payer settings, RBAC, audit, and safety copy.",
      "Release should be flagged if dashboard copy implies automated clinical or insurance decisions.",
      ["QA validation checklist", "Release readiness risks"],
      ["No automated test runner is configured in package scripts."],
      ["Add unit tests for domain calculations when a test runner is introduced."],
      "Run lint and build verification for this MVP increment.",
      0.81,
    ),
  ],
};

const tasks: DocumentationTask[] = [
  {
    id: "task-1001-lab",
    organizationId: "org-nexsure-demo",
    clinicId: "clinic-bangkok-01",
    encounterId: "enc-1001",
    gapId: "gap-1001-lab",
    title: "Link referenced lab result",
    category: "evidence",
    priority: "high",
    assignedRole: "clinical_team",
    reason: "Lab support is needed before submission review.",
    status: "in_progress",
    createdBy: "actor-clinical-001",
    createdAt: now,
    updatedBy: "actor-clinical-001",
    updatedAt: now,
  },
  {
    id: "task-1002-evidence",
    organizationId: "org-nexsure-demo",
    clinicId: "clinic-bangkok-01",
    encounterId: "enc-1002",
    gapId: "gap-1002-evidence",
    title: "Collect supporting evidence",
    category: "evidence",
    priority: "urgent",
    assignedRole: "clinical_team",
    reason: "Critical missing evidence blocks readiness.",
    status: "open",
    createdBy: "actor-clinical-001",
    createdAt: now,
    updatedBy: "actor-clinical-001",
    updatedAt: now,
  },
];

export async function listEncounterReadiness(query: ListQuery) {
  const scoped = [...encounters];
  const filtered = scoped.filter((encounter) => {
    const matchesSearch =
      query.q.length === 0 ||
      encounter.patientLabel.toLowerCase().includes(query.q.toLowerCase()) ||
      encounter.encounterCode.toLowerCase().includes(query.q.toLowerCase());
    const matchesRisk = query.risk === "all" || encounter.riskLevel === query.risk;
    const matchesPayer = query.payer === "all" || encounter.payerName === query.payer;
    const matchesDepartment =
      query.department === "all" || encounter.department === query.department;
    const matchesTask =
      query.taskStatus === "all" ||
      (query.taskStatus === "open" && encounter.taskSummary.open > 0) ||
      (query.taskStatus === "in_progress" && encounter.taskSummary.inProgress > 0) ||
      (query.taskStatus === "resolved" && encounter.taskSummary.resolved > 0);

    return (
      matchesSearch &&
      matchesRisk &&
      matchesPayer &&
      matchesDepartment &&
      matchesTask
    );
  });

  filtered.sort((a, b) => compareEncounters(a, b, query));

  const start = (query.page - 1) * query.pageSize;
  const items = filtered.slice(start, start + query.pageSize);
  const averageReadiness = Math.round(
    scoped.reduce((sum, item) => sum + item.readinessScore.total, 0) / scoped.length,
  );

  return {
    items,
    total: filtered.length,
    page: query.page,
    pageSize: query.pageSize,
    pageCount: Math.max(1, Math.ceil(filtered.length / query.pageSize)),
    filters: {
      payers: Array.from(new Set(scoped.map((item) => item.payerName))),
      departments: Array.from(new Set(scoped.map((item) => item.department))),
    },
    kpis: {
      averageReadiness,
      blockedEncounters: scoped.filter((item) => item.riskLevel === "blocked").length,
      missingEvidence: scoped.reduce(
        (sum, item) => sum + item.missingEvidenceCount,
        0,
      ),
      tasksOpen: scoped.reduce((sum, item) => sum + item.taskSummary.open, 0),
    },
  };
}

export async function getEncounterReadiness(
  encounterId: string,
): Promise<ClaimReadinessDetail> {
  const encounter = encounters.find((item) => item.id === encounterId);
  if (!encounter) {
    throw new ClaimReadinessError("not_found", "Encounter readiness record not found.");
  }

  return {
    ...encounter,
    gaps: gaps.filter((gap) => gap.encounterId === encounterId),
    tasks: tasks.filter((task) => task.encounterId === encounterId),
    evidencePackage:
      evidencePackages.find((item) => item.encounterId === encounterId) ??
      emptyEvidencePackage(encounterId),
  };
}

export async function getExecutiveDashboard(): Promise<ExecutiveDashboardSummary> {
  const kpis = calculateExecutiveDashboardSummary({
    encounters,
    evidencePackages,
    payerRules,
  });

  return {
    kpis,
    claimReadiness: {
      ready: encounters.filter((item) => item.riskLevel === "ready").length,
      needsReview: encounters.filter((item) => item.riskLevel === "needs_review")
        .length,
      atRisk: encounters.filter((item) => item.riskLevel === "at_risk").length,
      blocked: encounters.filter((item) => item.riskLevel === "blocked").length,
    },
    evidencePackages,
    payerRules,
    orchestrator: orchestratorOutput,
  };
}

export async function createDocumentationTask(
  input: CreateDocumentationTaskInput,
  actorId: string,
) {
  const encounter = encounters.find((item) => item.id === input.encounterId);
  const gap = gaps.find((item) => item.id === input.gapId);

  if (!encounter || !gap || gap.encounterId !== encounter.id) {
    throw new ClaimReadinessError("not_found", "Readiness gap not found.");
  }

  if (gap.status === "resolved" || gap.status === "reviewed") {
    throw new ClaimReadinessError("gap_resolved", "This gap is already reviewed.");
  }

  if (tasks.some((task) => task.gapId === input.gapId && task.status !== "resolved")) {
    throw new ClaimReadinessError(
      "task_already_exists",
      "An open documentation task already exists for this gap.",
    );
  }

  const timestamp = new Date().toISOString();
  const task: DocumentationTask = {
    id: `task-${Date.now()}`,
    organizationId: encounter.organizationId,
    clinicId: encounter.clinicId,
    encounterId: encounter.id,
    gapId: gap.id,
    title: input.title,
    category: input.category,
    priority: input.priority,
    assignedRole: input.assignedRole,
    reason: input.reason,
    status: "open",
    createdBy: actorId,
    createdAt: timestamp,
    updatedBy: actorId,
    updatedAt: timestamp,
  };

  tasks.push(task);
  gap.status = "task_created";
  encounter.taskSummary.open += 1;

  return task;
}

function buildEncounter({
  id,
  encounterCode,
  patientLabel,
  department,
  doctor,
  payer,
  date,
  status,
  missingEvidence,
  topGap,
  scores,
  tasks,
}: {
  id: string;
  encounterCode: string;
  patientLabel: string;
  department: string;
  doctor: string;
  payer: string;
  date: string;
  status: ClaimReadinessEncounter["claimDraftStatus"];
  missingEvidence: number;
  topGap: string;
  scores: [number, number, number, number, number];
  tasks: ClaimReadinessEncounter["taskSummary"];
}): ClaimReadinessEncounter {
  const readinessScore = calculateBalancedScore({
    evidenceCompleteness: scores[0],
    soapCompleteness: scores[1],
    icdValidity: scores[2],
    medicalNecessity: scores[3],
    payerRejectionRisk: scores[4],
  });

  return {
    id,
    organizationId: "org-nexsure-demo",
    clinicId: "clinic-bangkok-01",
    encounterCode,
    patientLabel,
    department,
    primaryDoctorName: doctor,
    payerName: payer,
    encounterDate: date,
    claimDraftStatus: status,
    readinessScore,
    riskLevel: classifyRisk(readinessScore.total),
    missingEvidenceCount: missingEvidence,
    topGapSummary: topGap,
    lastReviewedAt: now,
    taskSummary: tasks,
  };
}

function compareEncounters(
  a: ClaimReadinessEncounter,
  b: ClaimReadinessEncounter,
  query: ListQuery,
) {
  const riskPriority: Record<string, number> = {
    blocked: 4,
    at_risk: 3,
    needs_review: 2,
    ready: 1,
  };

  let value = 0;
  if (query.sort === "risk") value = riskPriority[a.riskLevel] - riskPriority[b.riskLevel];
  if (query.sort === "score") value = a.readinessScore.total - b.readinessScore.total;
  if (query.sort === "date") {
    value =
      new Date(a.encounterDate).getTime() - new Date(b.encounterDate).getTime();
  }
  if (query.sort === "missingEvidence") {
    value = a.missingEvidenceCount - b.missingEvidenceCount;
  }

  return query.direction === "asc" ? value : value * -1;
}

function emptyEvidencePackage(encounterId: string): EvidencePackage {
  return {
    id: `evp-empty-${encounterId}`,
    encounterId,
    status: "needs_review",
    completeness: 0,
    requiredItems: 0,
    linkedItems: 0,
    missingItems: 0,
    reviewerNote:
      "No evidence package has been configured for this synthetic encounter.",
    items: [],
  };
}

function specialist(
  agent: OrchestratorAgentOutput["specialists"][number]["agent"],
  summary: string,
  reasoning: string,
  deliverables: string[],
  risks: string[],
  recommendations: string[],
  nextAction: string,
  confidence: number,
): OrchestratorAgentOutput["specialists"][number] {
  return {
    agent,
    summary,
    reasoning,
    confidence,
    deliverables,
    risks,
    recommendations,
    nextAction,
  };
}
