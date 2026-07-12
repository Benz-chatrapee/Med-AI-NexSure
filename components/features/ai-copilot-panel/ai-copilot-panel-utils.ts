import type { BadgeTone, CaseFilters, CaseRow } from "./ai-copilot-panel-types";

const priorityOrder: Record<CaseRow["priority"], number> = {
  "P0 Critical": 0,
  "P1 High": 1,
  "P2 Medium": 2,
  "P3 Low": 3,
};

export function badgeTone(value: string): BadgeTone {
  if (["Ready", "Completed", "Valid", "Complete", "Normal", "No Critical Alert"].some((item) => value.includes(item))) {
    return "green";
  }

  if (["Needs Review", "Pending Evidence", "Pending Review", "Pharmacy", "Incomplete"].some((item) => value.includes(item))) {
    return "amber";
  }

  if (["Not Ready", "Alert", "Missing", "Critical", "Safety", "Conflict"].some((item) => value.includes(item))) {
    return "red";
  }

  if (value.includes("In Consultation")) {
    return "blue";
  }

  return "gray";
}

export function scoreColor(score: number) {
  if (score >= 85) return "#059669";
  if (score >= 60) return "#D97706";
  return "#DC2626";
}

export function filterCases(cases: CaseRow[], filters: CaseFilters) {
  const query = filters.search.trim().toLowerCase();

  return cases
    .filter((caseRow) => {
      const searchable = `${caseRow.patient} ${caseRow.hn} ${caseRow.evidence.join(" ")} ${caseRow.reviewer}`.toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (!filters.priority || caseRow.priority === filters.priority) &&
        (!filters.visit || caseRow.visit === filters.visit) &&
        (!filters.claim || caseRow.claim === filters.claim) &&
        (!filters.payer || caseRow.payer === filters.payer) &&
        (!filters.reviewer || caseRow.reviewer === filters.reviewer) &&
        (!filters.chartVisit || caseRow.visit === filters.chartVisit) &&
        (!filters.chartClaim || caseRow.claim === filters.chartClaim) &&
        (!filters.evidence || caseRow.evidence.includes(filters.evidence))
      );
    })
    .sort((first, second) => {
      if (filters.sort === "scoreAsc") return first.score - second.score;
      if (filters.sort === "agingDesc") return second.aging - first.aging;
      if (filters.sort === "updatedDesc") return second.updatedRank - first.updatedRank;
      return priorityOrder[first.priority] - priorityOrder[second.priority];
    });
}

export function currency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    currency: "THB",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

