import type { OrganizationRole } from "../types/organization-settings.types";

export const ORGANIZATION_ID = "org-med-ai-nexsure";

export const SETTINGS_SECTIONS = [
  { id: "profile", title: "Organization Profile", thai: "ข้อมูลหน่วยงาน" },
  { id: "dashboard", title: "Dashboard Configuration", thai: "การตั้งค่าแดชบอร์ด" },
  { id: "ai", title: "AI Clinical Governance", thai: "ธรรมาภิบาล AI คลินิก" },
  { id: "claim", title: "Claim Readiness Policy", thai: "นโยบายความพร้อมเคลม" },
  { id: "economic", title: "Economic Intelligence", thai: "เศรษฐศาสตร์การรักษา" },
  { id: "workflow", title: "Clinical Workflow", thai: "ขั้นตอนงานคลินิก" },
  { id: "security", title: "Security & Access Control", thai: "ความปลอดภัยและสิทธิ์" },
  { id: "notifications", title: "Notification Policy", thai: "นโยบายแจ้งเตือน" },
  { id: "compliance", title: "Audit & Compliance", thai: "ตรวจสอบและกำกับดูแล" },
  { id: "capabilities", title: "Platform Capability Management", thai: "ความสามารถแพลตฟอร์ม" },
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"];

export const SECTION_FIELD_PREFIXES: Record<SettingsSectionId, string[]> = {
  profile: ["organizationProfile"],
  dashboard: ["dashboard"],
  ai: ["aiGovernance"],
  claim: ["claimReadiness"],
  economic: ["economicIntelligence"],
  workflow: ["clinicalWorkflow"],
  security: ["security"],
  notifications: ["notifications"],
  compliance: ["compliance"],
  capabilities: ["capabilities"],
};

export const ROLE_LABELS: Record<OrganizationRole, string> = {
  organization_admin: "Organization Admin",
  security_admin: "Security Admin",
  compliance_admin: "Compliance Admin",
  auditor: "Auditor",
  executive: "Executive",
};

export const EDITOR_ROLES: OrganizationRole[] = ["organization_admin", "security_admin", "compliance_admin"];

export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
