import type { PayerRulePermissions, UserRole } from "../types/payer-rule-types";

export function getPayerRulePermissions(role: UserRole): PayerRulePermissions {
  if (role === "admin") return { canEdit: true, canSimulate: true, canExport: true, canRequestApproval: true, canActivate: true };
  if (role === "product_owner" || role === "rule_owner") return { canEdit: true, canSimulate: true, canExport: true, canRequestApproval: true, canActivate: false };
  if (role === "claim_reviewer") return { canEdit: false, canSimulate: true, canExport: false, canRequestApproval: false, canActivate: false, readOnlyReason: "Claim Reviewer can simulate and review cases only." };
  if (role === "compliance" || role === "auditor") return { canEdit: false, canSimulate: true, canExport: true, canRequestApproval: false, canActivate: false, readOnlyReason: "Compliance users have read-only governance access." };
  return { canEdit: false, canSimulate: false, canExport: false, canRequestApproval: false, canActivate: false, readOnlyReason: "Executive role is summary read-only." };
}
