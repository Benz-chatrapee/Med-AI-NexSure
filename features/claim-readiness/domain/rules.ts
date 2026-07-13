import type {
  ClaimRiskLevel,
  ClaimReadinessEncounter,
  CreateDocumentationTaskInput,
  DocumentationTaskPriority,
  EvidencePackage,
  GapCategory,
  PayerRuleSetting,
  ListQuery,
  ReadinessScore,
} from "./types";

export const SCORE_WEIGHTS = {
  evidenceCompleteness: 0.25,
  soapCompleteness: 0.25,
  icdValidity: 0.2,
  medicalNecessity: 0.2,
  payerRejectionRisk: 0.1,
} as const;

export function calculateBalancedScore(
  dimensions: Omit<ReadinessScore, "total">,
): ReadinessScore {
  const total = Math.round(
    dimensions.evidenceCompleteness * SCORE_WEIGHTS.evidenceCompleteness +
      dimensions.soapCompleteness * SCORE_WEIGHTS.soapCompleteness +
      dimensions.icdValidity * SCORE_WEIGHTS.icdValidity +
      dimensions.medicalNecessity * SCORE_WEIGHTS.medicalNecessity +
      dimensions.payerRejectionRisk * SCORE_WEIGHTS.payerRejectionRisk,
  );

  return {
    ...dimensions,
    total,
  };
}

export function classifyRisk(score: number): ClaimRiskLevel {
  if (score >= 85) return "ready";
  if (score >= 70) return "needs_review";
  if (score >= 50) return "at_risk";
  return "blocked";
}

export function parseListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): ListQuery {
  const getString = (key: string, fallback = "") => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] ?? fallback : value ?? fallback;
  };

  const risk = getString("risk", "all");
  const taskStatus = getString("taskStatus", "all");
  const sort = getString("sort", "risk");
  const direction = getString("direction", "desc");
  const page = Number.parseInt(getString("page", "1"), 10);
  const pageSize = Number.parseInt(getString("pageSize", "10"), 10);

  return {
    q: getString("q").trim(),
    risk: isRisk(risk) ? risk : "all",
    payer: getString("payer", "all"),
    department: getString("department", "all"),
    taskStatus: isTaskStatus(taskStatus) ? taskStatus : "all",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) ? Math.min(Math.max(pageSize, 5), 25) : 10,
    sort: isSort(sort) ? sort : "risk",
    direction: direction === "asc" ? "asc" : "desc",
  };
}

export function calculateExecutiveDashboardSummary({
  encounters,
  evidencePackages,
  payerRules,
}: {
  encounters: ClaimReadinessEncounter[];
  evidencePackages: EvidencePackage[];
  payerRules: PayerRuleSetting[];
}) {
  const encounterCount = encounters.length || 1;
  const evidenceCount = evidencePackages.length || 1;

  const averageReadiness = Math.round(
    encounters.reduce((sum, item) => sum + item.readinessScore.total, 0) /
      encounterCount,
  );
  const evidencePackageCompleteness = Math.round(
    evidencePackages.reduce((sum, item) => sum + item.completeness, 0) /
      evidenceCount,
  );

  return {
    averageReadiness,
    blockedEncounters: encounters.filter((item) => item.riskLevel === "blocked")
      .length,
    missingEvidence: evidencePackages.reduce(
      (sum, item) => sum + item.missingItems,
      0,
    ),
    tasksOpen: encounters.reduce((sum, item) => sum + item.taskSummary.open, 0),
    evidencePackageCompleteness,
    payerRulesActive: payerRules.filter((item) => item.status === "active").length,
    payerRulesNeedReview: payerRules.filter(
      (item) => item.status === "needs_review",
    ).length,
    humanReviewRequiredRules: payerRules.filter(
      (item) => item.humanReviewRequired,
    ).length,
  };
}

export function validateDocumentationTask(
  input: Partial<CreateDocumentationTaskInput>,
): { ok: true; value: CreateDocumentationTaskInput } | { ok: false; error: string } {
  const required = [
    "encounterId",
    "gapId",
    "title",
    "category",
    "priority",
    "assignedRole",
    "reason",
  ] as const;

  for (const key of required) {
    if (!input[key] || String(input[key]).trim().length === 0) {
      return { ok: false, error: `${key} is required.` };
    }
  }

  if (String(input.reason).trim().length < 12) {
    return {
      ok: false,
      error: "Reason must explain the documentation review need.",
    };
  }

  if (!isGapCategory(String(input.category))) {
    return { ok: false, error: "Invalid gap category." };
  }

  if (!isPriority(String(input.priority))) {
    return { ok: false, error: "Invalid task priority." };
  }

  return {
    ok: true,
    value: {
      encounterId: String(input.encounterId),
      gapId: String(input.gapId),
      title: String(input.title).trim(),
      category: input.category as GapCategory,
      priority: input.priority as DocumentationTaskPriority,
      assignedRole: input.assignedRole as CreateDocumentationTaskInput["assignedRole"],
      reason: String(input.reason).trim(),
    },
  };
}

function isRisk(value: string): value is ListQuery["risk"] {
  return ["all", "ready", "needs_review", "at_risk", "blocked"].includes(value);
}

function isTaskStatus(value: string): value is ListQuery["taskStatus"] {
  return ["all", "open", "in_progress", "resolved"].includes(value);
}

function isSort(value: string): value is ListQuery["sort"] {
  return ["risk", "score", "date", "missingEvidence"].includes(value);
}

function isGapCategory(value: string): value is GapCategory {
  return [
    "evidence",
    "soap",
    "icd",
    "medical_necessity",
    "payer_rule",
    "compliance",
  ].includes(value);
}

function isPriority(value: string): value is DocumentationTaskPriority {
  return ["urgent", "high", "normal"].includes(value);
}
