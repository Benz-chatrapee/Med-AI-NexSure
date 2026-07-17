import type { AiPermissionId, CreateUserRole, CustomPermissionId, PermissionAction, PermissionRiskLevel } from "../types/user-management.types";

export const CREATE_USER_ROLES: Array<{
  id: CreateUserRole;
  name: string;
  description: string;
  icon: string;
  privileged?: boolean;
  licensed?: boolean;
}> = [
  { id: "system_admin", name: "System Admin", description: "Highest administrative controls available only within authorized admin scope.", icon: "SA", privileged: true },
  { id: "organization_admin", name: "Organization Admin", description: "Govern organization structure, users and access policies.", icon: "Org", privileged: true },
  { id: "clinic_admin", name: "Clinic Admin", description: "Administer users and operational settings within assigned clinics.", icon: "Ops", privileged: true },
  { id: "doctor", name: "Doctor", description: "Manage clinical documentation and authorized AI-assisted decisions.", icon: "MD", licensed: true },
  { id: "nurse", name: "Nurse", description: "Manage queue, triage, vital signs and preliminary documentation.", icon: "RN" },
  { id: "pharmacist", name: "Pharmacist", description: "Review prescription safety and dispensing workflow.", icon: "Rx", licensed: true },
  { id: "clinic_staff", name: "Clinic Staff", description: "Manage registration, visits and operational documentation.", icon: "CS" },
  { id: "claim_reviewer", name: "Claim Reviewer", description: "Review claim readiness, evidence and payer requirements.", icon: "CR" },
  { id: "auditor_compliance", name: "Auditor / Compliance", description: "Review audit records and compliance controls.", icon: "AC" },
  { id: "executive", name: "Executive", description: "Access enterprise dashboards and executive insights.", icon: "EX" },
];

export const ORGANIZATIONS = [
  { id: "nexsure-healthcare", name: "NexSure Healthcare Group" },
  { id: "bangkok-medical", name: "Bangkok Medical Network" },
  { id: "central-clinical", name: "Central Clinical Alliance" },
];

export const CLINICS: Record<string, Array<{ id: string; name: string }>> = {
  "nexsure-healthcare": [
    { id: "sukhumvit", name: "Sukhumvit Clinic" },
    { id: "rama9", name: "Rama 9 Clinic" },
    { id: "sathorn", name: "Sathorn Clinic" },
  ],
  "bangkok-medical": [
    { id: "chiangmai", name: "Chiang Mai Medical Center" },
    { id: "bangna", name: "Bangna Clinic" },
  ],
  "central-clinical": [
    { id: "central", name: "Central Clinical Center" },
    { id: "wellness", name: "Wellness Clinic" },
  ],
};

export const DEPARTMENTS: Record<string, string[]> = {
  sukhumvit: ["General Medicine", "Pharmacy", "Claims & Revenue Cycle", "Compliance"],
  rama9: ["General Medicine", "Claims"],
  sathorn: ["Outpatient", "Nursing", "Pharmacy"],
  chiangmai: ["Internal Medicine", "Pharmacy", "Finance & Claims"],
  bangna: ["Outpatient", "Claims"],
  central: ["Administration", "Audit", "Clinical Operations"],
  wellness: ["Preventive Care", "Executive Health"],
};

export const CURRENT_ADMIN_SCOPE = {
  permissions: ["users.create", "roles.assign", "audit.write"],
  maxAccessScope: "organization_wide",
  organizationIds: ["nexsure-healthcare", "bangkok-medical", "central-clinical"],
};

export const PERMISSION_GROUPS: Array<{ id: CustomPermissionId; name: string; description: string; highRisk?: boolean }> = [
  { id: "patient_management", name: "Patient Management", description: "View and manage patient administration within assigned scope." },
  { id: "claim_approval", name: "Claim Readiness", description: "Review claim readiness outputs; approval remains human-controlled.", highRisk: true },
  { id: "audit_access", name: "Audit & Compliance", description: "Read audit events and compliance evidence.", highRisk: true },
  { id: "user_management", name: "User Management", description: "Create and maintain user access assignments.", highRisk: true },
  { id: "data_export", name: "Data Export", description: "Export permitted operational data with audit trace.", highRisk: true },
  { id: "evidence_package", name: "Evidence Package", description: "Generate evidence packages for authorized review.", highRisk: true },
];

export const AI_PERMISSION_OPTIONS: Array<{ id: AiPermissionId; name: string; helper: string }> = [
  { id: "clinical_summary", name: "Clinical Summary", helper: "สรุปข้อมูลเพื่อช่วยทบทวน ไม่ใช่การวินิจฉัยสุดท้าย" },
  { id: "icd_suggestion", name: "ICD Suggestion", helper: "ต้องได้รับการตรวจสอบจากผู้มีอำนาจ" },
  { id: "differential_support", name: "Differential Support", helper: "สนับสนุนการพิจารณา ไม่แทนแพทย์" },
  { id: "prescription_safety", name: "Prescription Safety", helper: "แสดงความเสี่ยงยาและต้องมี Human Review" },
  { id: "claim_readiness", name: "Claim Readiness", helper: "ประเมินความพร้อมของเคลมแบบ Decision Support" },
  { id: "missing_evidence", name: "Missing Evidence Detection", helper: "ค้นหาหลักฐานที่อาจขาดหาย" },
  { id: "insurance_rule_validation", name: "Insurance Rule Validation", helper: "ตรวจสอบตามกฎ payer แบบช่วยตัดสินใจ" },
  { id: "economic_intelligence", name: "Economic Intelligence", helper: "สนับสนุนมุมมองต้นทุนและความเหมาะสม" },
  { id: "evidence_package_generation", name: "Evidence Package Generation", helper: "สร้างแพ็กเกจหลักฐานเพื่อให้มนุษย์ตรวจสอบ" },
];

export const ADD_USER_DUPLICATE_EMAILS = ["anong.k@nexsure.health", "identity.service@nexsure.health"] as const;
export const ADD_USER_DUPLICATE_EMPLOYEE_IDS = ["EMP-1024", "SYS-0001"] as const;

export const PERMISSION_MATRIX_MODULES: Array<{
  id: string;
  module: string;
  scope: string;
  risk: PermissionRiskLevel;
  locked?: PermissionAction[];
  helper: string;
}> = [
  { id: "dashboard", module: "Dashboard", scope: "Organization", risk: "Low", locked: ["view"], helper: "Executive and operational visibility." },
  { id: "patient", module: "Patient Management", scope: "Clinic", risk: "High", helper: "Patient data must follow least privilege and PDPA." },
  { id: "visit", module: "Visit Management", scope: "Clinic", risk: "Medium", helper: "Visit workflow and queue actions." },
  { id: "soap", module: "SOAP Notes", scope: "Department", risk: "High", helper: "Clinical documentation requires authorized review." },
  { id: "ai_clinical", module: "AI Clinical Engine", scope: "Role", risk: "High", helper: "AI output is decision support only." },
  { id: "diagnosis", module: "Diagnosis and ICD", scope: "Role", risk: "Critical", helper: "Clinical coding requires human verification." },
  { id: "prescription", module: "Prescription Safety", scope: "Role", risk: "Critical", helper: "Medication safety actions require authorized personnel." },
  { id: "certificate", module: "Medical Certificate", scope: "Clinic", risk: "High", helper: "Medical certificates are auditable documents." },
  { id: "claim", module: "Claim Readiness", scope: "Clinic", risk: "High", helper: "Claim output cannot imply guaranteed approval." },
  { id: "evidence", module: "Evidence Package", scope: "Clinic", risk: "High", helper: "Export packages require audit trace." },
  { id: "insurance", module: "Insurance Intelligence", scope: "Organization", risk: "Medium", helper: "Payer context and rule validation." },
  { id: "economic", module: "Economic Intelligence", scope: "Organization", risk: "Medium", helper: "Operational cost and utilization insight." },
  { id: "audit", module: "Audit and Compliance", scope: "Organization", risk: "Critical", helper: "Audit access is high privilege." },
  { id: "users", module: "User Management", scope: "Organization", risk: "Critical", helper: "User administration is explicit high risk." },
  { id: "settings", module: "Organization Settings", scope: "Global", risk: "Critical", helper: "Global settings require MFA and reason." },
];
