import "server-only";

export async function appendDoctorDashboardAuditEvent(): Promise<void> {
  return;
}

export type DoctorDashboardMutationPrerequisiteAuditInput = {
  correlationId: string;
  actorProfileId: string;
  organizationId: string;
  clinicId: string;
  visitId: string;
  claimId: string | null;
  action: string;
  reasonCode: string;
  idempotencyKey: string;
  externalEventId: string;
  result: "prerequisite_passed_no_mutation" | "prerequisite_failed_no_mutation";
};

export async function appendDoctorDashboardMutationPrerequisiteAuditEvent(
  input: DoctorDashboardMutationPrerequisiteAuditInput,
): Promise<void> {
  void input;
}
