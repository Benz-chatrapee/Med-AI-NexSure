import { describe, expect, it, vi } from "vitest";
import {
  buildDoctorDashboardProjection,
  exportDoctorDashboardCsv,
  resolveDoctorDashboardClaimMutationContext,
} from "./repository";
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

describe("resolveDoctorDashboardClaimMutationContext", () => {
  const actor = {
    profileId: "doctor-1",
    activeOrganizationId: "org-1",
    authorizedOrganizationIds: ["org-1"],
    activeClinicId: "clinic-1",
    authorizedClinicIds: ["clinic-1"],
    roles: ["doctor"],
    permissions: ["claim.read", "claim.review"],
  };

  it("resolves exactly one authorized claim for the selected visit", async () => {
    const context = await resolveDoctorDashboardClaimMutationContext(
      createClaimContextClient({
        visit: { id: "visit-1", organization_id: "org-1", clinic_id: "clinic-1" },
        claims: [{
          id: "claim-1",
          organization_id: "org-1",
          clinic_id: "clinic-1",
          visit_id: "visit-1",
          workflow_status: "draft",
          version: 4,
        }],
      }),
      actor,
      "visit-1",
    );

    expect(context).toEqual({
      claimId: "claim-1",
      claimOrganizationId: "org-1",
      claimClinicId: "clinic-1",
      claimVisitId: "visit-1",
      workflowStatus: "draft",
      expectedVersion: 4,
    });
  });

  it.each([
    ["no matching claim", []],
    ["ambiguous claims", [
      {
        id: "claim-1",
        organization_id: "org-1",
        clinic_id: "clinic-1",
        visit_id: "visit-1",
        workflow_status: "draft",
        version: 4,
      },
      {
        id: "claim-2",
        organization_id: "org-1",
        clinic_id: "clinic-1",
        visit_id: "visit-1",
        workflow_status: "collecting_data",
        version: 1,
      },
    ]],
  ])("fails closed for %s", async (_label, claims) => {
    await expect(resolveDoctorDashboardClaimMutationContext(
      createClaimContextClient({
        visit: { id: "visit-1", organization_id: "org-1", clinic_id: "clinic-1" },
        claims,
      }),
      actor,
      "visit-1",
    )).rejects.toThrow("claim_context_unavailable");
  });

  it.each([
    ["wrong organization", { id: "claim-1", organization_id: "org-2", clinic_id: "clinic-1", visit_id: "visit-1", workflow_status: "draft", version: 4 }],
    ["wrong clinic", { id: "claim-1", organization_id: "org-1", clinic_id: "clinic-2", visit_id: "visit-1", workflow_status: "draft", version: 4 }],
    ["stale version", { id: "claim-1", organization_id: "org-1", clinic_id: "clinic-1", visit_id: "visit-1", workflow_status: "draft", version: 1.5 }],
  ])("fails closed for %s", async (_label, claim) => {
    await expect(resolveDoctorDashboardClaimMutationContext(
      createClaimContextClient({
        visit: { id: "visit-1", organization_id: "org-1", clinic_id: "clinic-1" },
        claims: [claim],
      }),
      actor,
      "visit-1",
    )).rejects.toThrow("claim_context_unavailable");
  });
});

type MockVisit = { id: string; organization_id: string; clinic_id: string } | null;
type MockClaim = {
  id: string;
  organization_id: string;
  clinic_id: string;
  visit_id: string;
  workflow_status: string;
  version: number;
};

function createClaimContextClient(data: { visit: MockVisit; claims: MockClaim[] }) {
  return {
    from(table: string) {
      const query = {
        select: () => query,
        eq: () => query,
        in: () => query,
        is: () => query,
        gte: () => query,
        lt: () => query,
        order: () => query,
        limit: () => query,
        maybeSingle: async () => ({
          data: table === "visits" ? data.visit : null,
          error: null,
        }),
        returns: async () => ({
          data: table === "claims" ? data.claims : [],
          error: null,
        }),
      };
      return query;
    },
  };
}
