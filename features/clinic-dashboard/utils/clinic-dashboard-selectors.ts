import type { ClinicDashboardFilters, QueueItem, VisitStatus } from "../types/clinic-dashboard.types";

export function filterQueue(queue: QueueItem[], filters: ClinicDashboardFilters, query: string, stage: VisitStatus | "all") {
  const normalized = query.trim().toLowerCase();

  return queue.filter((item) => {
    const matchesSearch = !normalized || item.patientName.toLowerCase().includes(normalized) || item.hn.toLowerCase().includes(normalized);
    const matchesDepartment = filters.department === "all" || item.department === filters.department;
    const matchesDoctor = filters.doctor === "all" || item.doctorName === filters.doctor;
    const matchesStatus = filters.visitStatus === "all" || item.visitStatus === filters.visitStatus;
    const matchesRisk = filters.riskLevel === "all" || item.clinicalRisk === filters.riskLevel;
    const matchesStage = stage === "all" || item.visitStatus === stage;

    return matchesSearch && matchesDepartment && matchesDoctor && matchesStatus && matchesRisk && matchesStage;
  });
}

export function sortQueue(queue: QueueItem[], sortBy: "urgency" | "wait" | "name") {
  return [...queue].sort((a, b) => {
    if (sortBy === "wait") return b.waitingMinutes - a.waitingMinutes;
    if (sortBy === "name") return a.patientName.localeCompare(b.patientName);
    return b.urgencyScore - a.urgencyScore;
  });
}
