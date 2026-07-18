import { describe, expect, it } from "vitest";

import { calculateSoapCompleteness, getReadinessStatus, soapFormSchema } from "./soap.schema";

describe("soapFormSchema", () => {
  it("requires all SOAP sections before signing", () => {
    const result = soapFormSchema.safeParse({
      subjective: "Headache",
      objective: "",
      assessment: "",
      plan: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(
        expect.arrayContaining(["objective", "assessment", "plan"]),
      );
    }
  });

  it("calculates completeness from populated SOAP sections", () => {
    expect(
      calculateSoapCompleteness({
        subjective: "Recurrent morning headache and dizziness",
        objective: "BP 158/94, HR 72, neuro exam intact",
        assessment: "Essential hypertension with poor control",
        plan: "",
      }),
    ).toBe(75);
  });

  it("maps claim readiness status thresholds", () => {
    expect(getReadinessStatus(59)).toBe("Not Ready");
    expect(getReadinessStatus(60)).toBe("Needs Review");
    expect(getReadinessStatus(85)).toBe("Ready");
  });
});
