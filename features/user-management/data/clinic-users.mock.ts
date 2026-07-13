import { defaultPermissions } from "../constants/clinic-user-options";
import type { ClinicUser } from "../types/user-management.types";

export const clinicUsersMock: ClinicUser[] = [
  createClinicUser({
    id: "usr-001",
    fullName: "Dr. Anong Kittipong",
    initials: "AK",
    employeeId: "EMP-1024",
    email: "anong.k@nexsure.health",
    jobTitle: "Senior Physician",
    professionalLicense: "MD-TH-4287",
    primaryRole: "doctor",
    additionalRoles: ["claim_reviewer"],
    departmentId: "general-medicine",
    departmentName: "General Medicine",
    aiAccessLevel: "clinical_assist",
    status: "active",
    lastActiveAt: "2026-07-13T09:11:00+07:00",
  }),
  createClinicUser({
    id: "usr-002",
    fullName: "Nattaya Srisuk",
    initials: "NS",
    employeeId: "EMP-1048",
    email: "nattaya.s@nexsure.health",
    jobTitle: "Charge Nurse",
    primaryRole: "nurse",
    additionalRoles: [],
    departmentId: "nursing",
    departmentName: "Nursing",
    aiAccessLevel: "view_only",
    status: "active",
    lastActiveAt: "2026-07-13T08:56:00+07:00",
  }),
  createClinicUser({
    id: "usr-003",
    fullName: "Preecha Meesuk",
    initials: "PM",
    employeeId: "EMP-0952",
    email: "preecha.m@nexsure.health",
    jobTitle: "Clinical Pharmacist",
    professionalLicense: "PH-TH-7782",
    primaryRole: "pharmacist",
    additionalRoles: [],
    departmentId: "pharmacy",
    departmentName: "Pharmacy",
    aiAccessLevel: "clinical_review",
    status: "active",
    clinicCount: 2,
  }),
  createClinicUser({
    id: "usr-004",
    fullName: "Sirinapa Rattanakul",
    initials: "SR",
    employeeId: "EMP-1128",
    email: "sirinapa.r@nexsure.health",
    jobTitle: "Claim Reviewer",
    primaryRole: "claim_reviewer",
    additionalRoles: [],
    departmentId: "claims",
    departmentName: "Claims",
    aiAccessLevel: "view_only",
    status: "active",
    clinicCount: 3,
  }),
  createClinicUser({
    id: "usr-005",
    fullName: "Narin Wongchai",
    initials: "NW",
    employeeId: "EMP-1185",
    email: "narin.w@nexsure.health",
    jobTitle: "Physician",
    professionalLicense: "MD-TH-2511",
    primaryRole: "doctor",
    additionalRoles: [],
    departmentId: "general-medicine",
    departmentName: "General Medicine",
    aiAccessLevel: "clinical_assist",
    status: "invited",
    lastLoginAt: undefined,
    lastActiveAt: undefined,
  }),
  createClinicUser({
    id: "usr-006",
    fullName: "Wichai Thongdee",
    initials: "WT",
    employeeId: "EMP-0871",
    email: "wichai.t@nexsure.health",
    jobTitle: "Clinic Admin",
    primaryRole: "clinic_admin",
    additionalRoles: ["compliance_officer"],
    departmentId: "administration",
    departmentName: "Administration",
    aiAccessLevel: "ai_administrator",
    status: "locked",
    failedAttempts: 5,
  }),
  createClinicUser({
    id: "usr-007",
    fullName: "Kanya Boonmee",
    initials: "KB",
    employeeId: "EMP-0765",
    email: "kanya.b@nexsure.health",
    jobTitle: "Nurse",
    primaryRole: "nurse",
    additionalRoles: [],
    departmentId: "nursing",
    departmentName: "Nursing",
    aiAccessLevel: "disabled",
    status: "suspended",
  }),
  createClinicUser({
    id: "usr-008",
    fullName: "Thanawat Chaiyo",
    initials: "TC",
    employeeId: "EMP-1093",
    email: "thanawat.c@nexsure.health",
    jobTitle: "Clinic Staff",
    primaryRole: "clinic_staff",
    additionalRoles: [],
    departmentId: "administration",
    departmentName: "Administration",
    aiAccessLevel: "disabled",
    status: "inactive",
  }),
];

function createClinicUser(input: {
  id: string;
  fullName: string;
  initials: string;
  employeeId: string;
  email: string;
  jobTitle?: string;
  professionalLicense?: string;
  primaryRole: ClinicUser["primaryRole"];
  additionalRoles: ClinicUser["additionalRoles"];
  departmentId: string;
  departmentName: string;
  aiAccessLevel: ClinicUser["aiAccessLevel"];
  status: ClinicUser["status"];
  clinicCount?: number;
  failedAttempts?: number;
  lastLoginAt?: string;
  lastActiveAt?: string;
}): ClinicUser {
  const clinicScopes: ClinicUser["clinicScopes"] = [
    {
      clinicId: "clinic-bangkok",
      clinicName: "NexSure Medical Center - Bangkok",
      departmentIds: [input.departmentId],
      dataAccessLevel: input.primaryRole === "executive" ? "cross_clinic_view_only" : "assigned_clinic",
    },
  ];

  if ((input.clinicCount ?? 1) > 1) {
    clinicScopes.push({
      clinicId: "clinic-sukhumvit",
      clinicName: "Sukhumvit Clinic",
      departmentIds: [input.departmentId],
      dataAccessLevel: "cross_clinic_view_only",
    });
  }

  if ((input.clinicCount ?? 1) > 2) {
    clinicScopes.push({
      clinicId: "clinic-rama9",
      clinicName: "Rama 9 Clinic",
      departmentIds: [input.departmentId],
      dataAccessLevel: "cross_clinic_view_only",
    });
  }

  return {
    id: input.id,
    fullName: input.fullName,
    initials: input.initials,
    employeeId: input.employeeId,
    email: input.email,
    phone: "+66 81 234 5678",
    jobTitle: input.jobTitle,
    professionalLicense: input.professionalLicense,
    primaryRole: input.primaryRole,
    additionalRoles: input.additionalRoles,
    departmentId: input.departmentId,
    departmentName: input.departmentName,
    clinicScopes,
    aiAccessStatus: input.aiAccessLevel === "disabled" ? "disabled" : input.aiAccessLevel === "view_only" ? "restricted" : "enabled",
    aiAccessLevel: input.aiAccessLevel,
    aiPermissions: {
      ...defaultPermissions,
      generateSoapDraft: input.aiAccessLevel === "clinical_assist" || input.aiAccessLevel === "clinical_review" || input.aiAccessLevel === "ai_administrator",
      acceptAiRecommendation: input.aiAccessLevel === "clinical_review" || input.aiAccessLevel === "ai_administrator",
    },
    status: input.status,
    mfaEnabled: input.status !== "invited",
    lastLoginAt: input.lastLoginAt ?? "2026-07-13T08:40:00+07:00",
    lastActiveAt: input.lastActiveAt ?? "2026-07-12T16:20:00+07:00",
    createdAt: "2026-07-01T10:05:00+07:00",
    updatedAt: "2026-07-13T09:00:00+07:00",
    security: {
      failedAttempts: input.failedAttempts ?? 0,
      activeSessions: input.status === "active" ? 2 : 0,
      currentSession: "Chrome on Windows - Bangkok",
      browserDevice: "Chrome 126 / Windows 11",
      location: "Bangkok, Thailand",
      maskedIpAddress: "10.28.**.45",
      mfaVerified: input.status !== "invited",
    },
    auditTrail: [
      {
        id: `${input.id}-audit-1`,
        event: "AI permission changed",
        actor: "Somchai P.",
        occurredAt: "2026-07-10T13:52:00+07:00",
        reason: "Assigned clinical workflow",
        source: "Admin Console",
        result: "success",
      },
      {
        id: `${input.id}-audit-2`,
        event: "Role assigned",
        actor: "Clinic Admin",
        occurredAt: "2026-07-08T09:14:00+07:00",
        reason: "Role-based access onboarding",
        source: "RBAC Service",
        result: "success",
      },
      {
        id: `${input.id}-audit-3`,
        event: "MFA enrolled",
        actor: "System",
        occurredAt: "2026-07-02T16:20:00+07:00",
        reason: "Security policy",
        source: "Identity Provider",
        result: "success",
      },
    ],
  };
}
