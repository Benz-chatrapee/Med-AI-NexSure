import { mockSoapClinicalWorkspace } from "../mock/soap.mock";
import { calculateSoapCompleteness, getReadinessStatus } from "../schemas/soap.schema";
import type { SoapClinicalWorkspaceData, SoapFormValues } from "../types/soap.types";

export async function getSoapClinicalWorkspace(visitId: string): Promise<SoapClinicalWorkspaceData | null> {
  if (!visitId || visitId === "not-found") return null;
  return {
    ...mockSoapClinicalWorkspace,
    visit: {
      ...mockSoapClinicalWorkspace.visit,
      visitId,
    },
  };
}

export function buildSoapFormValues(data: SoapClinicalWorkspaceData): SoapFormValues {
  return data.sections.reduce<SoapFormValues>(
    (values, section) => ({ ...values, [section.key]: section.content }),
    { subjective: "", objective: "", assessment: "", plan: "" },
  );
}

export function summarizeSoapReadiness(values: SoapFormValues) {
  const completeness = calculateSoapCompleteness(values);
  return {
    completeness,
    status: getReadinessStatus(completeness),
  };
}
