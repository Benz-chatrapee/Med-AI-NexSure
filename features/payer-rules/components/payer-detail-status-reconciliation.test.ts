import { describe, expect, it } from "vitest";
import {
  defaultCaseSelectFilters,
  detailCases,
  matchesCaseSelectFilters,
  type CaseSelectFilters,
} from "./payer-detail-page";

function filter(overrides: Partial<CaseSelectFilters>): CaseSelectFilters {
  return { ...defaultCaseSelectFilters, ...overrides };
}

describe("payer detail status reconciliation", () => {
  it("keeps the original case total while separating every status domain", () => {
    expect(detailCases).toHaveLength(8);

    expect(detailCases.find((item) => item.caseId === "CLM-260710-0148")).toMatchObject({
      workflowStatus: "Submitted",
      decisionStatus: "Pending",
      paymentStatus: "Not Paid",
      readinessStatus: "ready",
      payerRuleReviewStatus: "Not Under Review",
    });

    expect(detailCases.find((item) => item.caseId === "CLM-260710-0142")).toMatchObject({
      workflowStatus: "Draft",
      decisionStatus: "Pending",
      paymentStatus: "Not Paid",
      readinessStatus: "pending_evidence",
      payerRuleReviewStatus: "Not Under Review",
    });

    expect(detailCases.find((item) => item.caseId === "CLM-260709-0131")).toMatchObject({
      workflowStatus: "Submitted",
      decisionStatus: "Pending",
      paymentStatus: "Not Paid",
      payerRuleReviewStatus: "Under Review",
    });
  });

  it("represents approval independently from payment", () => {
    const approvedUnpaid = detailCases.filter((item) =>
      matchesCaseSelectFilters(item, filter({ decisionStatus: "Approved", paymentStatus: "Not Paid" })),
    );
    const paid = detailCases.filter((item) =>
      matchesCaseSelectFilters(item, filter({ paymentStatus: "Paid" })),
    );

    expect(approvedUnpaid.map((item) => item.caseId)).toEqual(["CLM-260708-0119"]);
    expect(paid.map((item) => item.caseId)).toEqual(["CLM-260707-0104"]);
    expect(paid[0]).toMatchObject({ decisionStatus: "Approved", workflowStatus: "Submitted" });
  });

  it("represents submitted workflow independently from readiness", () => {
    const submittedReady = detailCases.filter((item) =>
      matchesCaseSelectFilters(item, filter({ workflowStatus: "Submitted", readinessStatus: "Ready" })),
    );
    const pendingEvidence = detailCases.filter((item) =>
      matchesCaseSelectFilters(item, filter({ readinessStatus: "Pending Evidence" })),
    );

    expect(submittedReady.length).toBeGreaterThan(0);
    expect(pendingEvidence).toHaveLength(2);
    expect(pendingEvidence.every((item) => item.readinessStatus === "pending_evidence")).toBe(true);
  });

  it("applies independent filters with existing AND behavior", () => {
    const results = detailCases.filter((item) =>
      matchesCaseSelectFilters(
        item,
        filter({
          workflowStatus: "Submitted",
          decisionStatus: "Pending",
          paymentStatus: "Not Paid",
          readinessStatus: "Ready",
          payerRuleReviewStatus: "Under Review",
        }),
      ),
    );

    expect(results.map((item) => item.caseId)).toEqual(["CLM-260709-0131"]);
  });

  it("uses explicit safe pending and unpaid values instead of false approval defaults", () => {
    const draft = detailCases.find((item) => item.caseId === "CLM-260709-0126");

    expect(draft).toMatchObject({
      decisionStatus: "Pending",
      paymentStatus: "Not Paid",
    });
  });
});
