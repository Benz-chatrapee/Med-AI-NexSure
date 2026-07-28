import { describe, expect, it, vi } from "vitest";
import { buildDoctorDashboardProjection, exportDoctorDashboardCsv } from "./repository";
import type { DoctorDashboardCanonicalReadModel } from "./repository";

vi.mock("server-only", () => ({}));

const canonicalModel = {
  generatedAt: new Date("2026-07-27T08:15:00.000Z"),
  actor: {
    displayName: "Dr. Canon",
    organizationName: "Canonical Health",
    clinicName: "Trusted Clinic",
  },
  visits: [
    {
      id: "visit-allowed-1",
      visitNumber: "VIS-001",
      organizationId: "org-1",
      clinicId: "clinic-1",
      patientName: "Patient One",
      patientCode: "HN-001",
      gender: "Female",
      age: 40,
      department: "Internal Medicine",
      doctorName: "Dr. Canon",
      visitStatus: "waiting",
      claimStatus: "draft",
      riskLevel: "high",
      startedAt: "2026-07-27T07:00:00.000Z",
      payerName: "Canonical Payer",
      diagnosisCode: "J20.9",
      diagnosisLabel: "Acute bronchitis",
      diagnosisConfidence: 0.82,
      readiness: {
        id: "assessment-1",
        version: 2,
        totalScore: 84,
        readinessStatus: "needs_review",
        reviewStatus: "pending",
        calculatedAt: "2026-07-27T08:00:00.000Z",
        ruleSetVersion: "rules-2",
        items: [
          {
            id: "item-1",
            dimensionCode: "evidence",
            itemStatus: "blocking",
            reasonCode: "SOAP_PLAN",
            reasonText: "SOAP plan rationale missing",
            rawScore: 40,
            weightedScore: 8,
            weight: 20,
            evidenceReference: "soap-note-1",
          },
        ],
      },
    },
    {
      id: "visit-allowed-2",
      visitNumber: "VIS-002",
      organizationId: "org-1",
      clinicId: "clinic-1",
      patientName: "Patient Two",
      patientCode: "HN-002",
      gender: "Male",
      age: 52,
      department: "Internal Medicine",
      doctorName: "Dr. Canon",
      visitStatus: "completed",
      claimStatus: "ready",
      riskLevel: "low",
      startedAt: "2026-07-27T06:30:00.000Z",
      payerName: null,
      diagnosisCode: "I10",
      diagnosisLabel: "Hypertension",
      diagnosisConfidence: null,
      readiness: {
        id: "assessment-2",
        version: 1,
        totalScore: 91,
        readinessStatus: "ready",
        reviewStatus: "ready",
        calculatedAt: "2026-07-27T07:45:00.000Z",
        ruleSetVersion: "rules-2",
        items: [],
      },
    },
  ],
} satisfies DoctorDashboardCanonicalReadModel;

describe("doctor dashboard repository projection", () => {
  it("maps canonical visits and readiness records into DoctorDashboardData without mock values", () => {
    const dashboard = buildDoctorDashboardProjection(canonicalModel);

    expect(dashboard.lastUpdated).toBe("27 Jul 2026, 15:15");
    expect(dashboard.visits).toHaveLength(2);
    expect(dashboard.visits[0]).toMatchObject({
      id: "VIS-001",
      patientName: "Patient One",
      hn: "HN-001",
      readinessScore: 84,
      readinessStatus: "Needs Review",
      riskLevel: "High",
      primaryGap: "SOAP plan rationale missing",
      doctor: "Dr. Canon",
      department: "Internal Medicine",
    });
    expect(dashboard.kpis.find((item) => item.id === "today-visits")?.value).toBe(2);
    expect(dashboard.kpis.find((item) => item.id === "ready-human-review")?.value).toBe(1);
    expect(JSON.stringify(dashboard)).not.toContain("Dr. Ananda");
    expect(JSON.stringify(dashboard)).not.toContain("NexSure Rama 9 Clinic");
  });

  it("exports only the canonical projection supplied by the authorized read", () => {
    const dashboard = buildDoctorDashboardProjection(canonicalModel);
    const exported = exportDoctorDashboardCsv(dashboard, { search: "HN-001" });

    expect(exported.content).toContain("VIS-001");
    expect(exported.content).not.toContain("VIS-002");
    expect(exported.mimeType).toBe("text/csv");
  });

  it("returns deterministic zero-state projection when no authorized canonical rows exist", () => {
    const dashboard = buildDoctorDashboardProjection({
      generatedAt: new Date("2026-07-27T08:15:00.000Z"),
      actor: {
        displayName: "Dr. Canon",
        organizationName: "Canonical Health",
        clinicName: "Trusted Clinic",
      },
      visits: [],
    });

    expect(dashboard.visits).toEqual([]);
    expect(dashboard.selectedVisit).toBeNull();
    expect(dashboard.kpis.find((item) => item.id === "today-visits")).toMatchObject({
      value: 0,
      progressValue: 0,
      progressMax: 0,
      progressDisplay: "0 / 0",
    });
    expect(dashboard.readinessMix).toEqual([
      { status: "Ready for Human Review", count: 0 },
      { status: "Needs Review", count: 0 },
      { status: "Not Ready", count: 0 },
    ]);
    expect(dashboard.readinessTrend).toEqual([]);
    expect(dashboard.missingEvidence).toEqual([]);
    expect(JSON.stringify(dashboard)).not.toContain("Dr. Ananda");
    expect(JSON.stringify(dashboard)).not.toContain("VIS-001");
    expect(JSON.stringify(dashboard)).not.toContain("no-authorized-visits");
    expect(JSON.stringify(dashboard)).not.toContain("unauthorized-visits");
  });

  it("uses only canonical readiness assessments for trend points", () => {
    const dashboard = buildDoctorDashboardProjection({
      generatedAt: new Date("2026-07-27T08:15:00.000Z"),
      actor: canonicalModel.actor,
      visits: [
        {
          ...canonicalModel.visits[0],
          readiness: null,
        },
      ],
    });

    expect(dashboard.readinessTrend).toEqual([]);
    expect(dashboard.selectedVisit).toBeNull();
    expect(dashboard.visits[0]).toMatchObject({
      id: "VIS-001",
      readinessScore: null,
      readinessStatus: "Assessment Unavailable",
      blockingGapCount: 0,
      primaryGap: undefined,
      confidencePercent: 82,
    });
    expect(JSON.stringify(dashboard)).not.toContain('"readinessScore":0');
    expect(JSON.stringify(dashboard)).not.toContain('"readinessStatus":"Not Ready"');
  });

  it("uses only canonical blocking readiness items for missing evidence values", () => {
    const dashboard = buildDoctorDashboardProjection({
      ...canonicalModel,
      visits: [
        {
          ...canonicalModel.visits[0],
          readiness: {
            ...canonicalModel.visits[0].readiness,
            items: [],
          },
        },
      ],
    });

    expect(dashboard.missingEvidence).toEqual([]);
  });
});
