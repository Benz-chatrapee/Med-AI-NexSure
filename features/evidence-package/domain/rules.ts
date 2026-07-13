import type { ClaimReadinessStatus, EvidencePackage, EvidenceStatus, EvidenceValidationItem, PackageStatus, ValidationSeverity } from "./types";

export function calculateExportReadiness(pkg: EvidencePackage) {
  const blockingIssues = pkg.validationItems.filter((item) => item.severity === "critical" && item.status !== "complete");
  const warningIssues = pkg.validationItems.filter((item) => item.severity === "warning" && item.status !== "complete");
  const permissionBlockers: EvidenceValidationItem[] = pkg.permissions.includes("export")
    ? []
    : [{
        id: "permission-export",
        evidenceName: "Export Permission",
        required: true,
        status: "blocked",
        severity: "critical",
        reason: "Current role is not permitted to export evidence packages.",
        resolutionAction: "Request claim export permission from an administrator.",
        source: "system",
        sectionId: "export-readiness",
      }];
  const exportingBlockers: EvidenceValidationItem[] = pkg.packageStatus === "exporting"
    ? [{
        id: "package-exporting",
        evidenceName: "Export in Progress",
        required: true,
        status: "blocked",
        severity: "critical",
        reason: "The package is already exporting.",
        resolutionAction: "Wait until the current export finishes.",
        source: "system",
        sectionId: "export-readiness",
      }]
    : [];
  const allBlockingIssues = [...blockingIssues, ...permissionBlockers, ...exportingBlockers];
  const requiredItems = pkg.validationItems.filter((item) => item.required);
  const completedRequired = requiredItems.filter((item) => item.status === "complete").length;
  const baseScore = requiredItems.length === 0 ? 100 : Math.round((completedRequired / requiredItems.length) * 100);
  const score = Math.max(0, Math.min(100, baseScore - allBlockingIssues.length * 8 - warningIssues.length * 3));
  const status = mapReadinessStatus(pkg.packageStatus, allBlockingIssues.length, warningIssues.length);

  return {
    score,
    status,
    blockingIssues: allBlockingIssues,
    warningIssues,
    canExport: allBlockingIssues.length === 0 && pkg.packageStatus !== "exporting",
    explanation: getReadinessExplanation(status, allBlockingIssues.length, warningIssues.length),
  };
}

export function mapEvidenceStatusLabel(status: EvidenceStatus) {
  const labels: Record<EvidenceStatus, string> = {
    complete: "Complete",
    review_required: "Review Required",
    missing: "Missing",
    blocked: "Blocked",
    not_applicable: "Not Applicable",
  };
  return labels[status];
}

export function mapPackageStatusLabel(status: PackageStatus) {
  const labels: Record<PackageStatus, string> = {
    draft: "Draft",
    review_needed: "Review Needed",
    ready_to_export: "Ready to Export",
    exporting: "Exporting",
    exported: "Exported",
    export_failed: "Export Failed",
  };
  return labels[status];
}

export function mapSeverityLabel(severity: ValidationSeverity) {
  const labels: Record<ValidationSeverity, string> = { info: "Info", warning: "Warning", critical: "Critical" };
  return labels[severity];
}

function mapReadinessStatus(packageStatus: PackageStatus, blockingIssueCount: number, warningIssueCount: number): ClaimReadinessStatus {
  if (packageStatus === "exported" || (blockingIssueCount === 0 && warningIssueCount === 0)) return "ready";
  if (blockingIssueCount > 0) return "not_ready";
  return "needs_review";
}

function getReadinessExplanation(status: ClaimReadinessStatus, blockingIssueCount: number, warningIssueCount: number) {
  if (status === "not_ready") return `${blockingIssueCount} blocking issue(s) must be resolved before export.`;
  if (status === "needs_review") return `${warningIssueCount} warning item(s) require human confirmation before export.`;
  return "No blocking issue detected. Package is ready for preview and export.";
}
