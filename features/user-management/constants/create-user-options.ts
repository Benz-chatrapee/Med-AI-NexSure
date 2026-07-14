import type { CreateUserRole } from "../types/user-management.types";

export const CREATE_USER_ROLES: Array<{
  id: CreateUserRole;
  name: string;
  description: string;
  icon: string;
  privileged?: boolean;
  licensed?: boolean;
}> = [
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
  { id: "nexsure", name: "NexSure Health Network" },
  { id: "sukhumvit", name: "Sukhumvit Medical Group" },
];

export const CLINICS: Record<string, Array<{ id: string; name: string }>> = {
  nexsure: [
    { id: "central", name: "NexSure Central Clinic" },
    { id: "sathorn", name: "NexSure Sathorn Clinic" },
    { id: "rama9", name: "NexSure Rama 9 Clinic" },
  ],
  sukhumvit: [
    { id: "main", name: "Sukhumvit Main Hospital" },
    { id: "wellness", name: "Sukhumvit Wellness Center" },
  ],
};

export const DEPARTMENTS: Record<string, string[]> = {
  central: ["General Medicine", "Pharmacy", "Claims & Revenue Cycle", "Compliance"],
  sathorn: ["Outpatient", "Nursing", "Pharmacy"],
  rama9: ["General Medicine", "Claims"],
  main: ["Internal Medicine", "Pharmacy", "Finance & Claims"],
  wellness: ["Preventive Care", "Executive Health"],
};
