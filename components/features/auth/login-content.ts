export type IntelligenceMetric = {
  icon: string;
  tag: string;
  title: string;
  value: string;
  description: string;
  barClassName: string;
};

export const intelligenceMetrics: IntelligenceMetric[] = [
  {
    icon: "AI",
    tag: "AI",
    title: "Clinical AI",
    value: "12,458",
    description: "Daily AI Assessments",
    barClassName: "bg-[#38BDF8]",
  },
  {
    icon: "OK",
    tag: "Score",
    title: "Claim Readiness",
    value: "98.4%",
    description: "Ready Score",
    barClassName: "bg-blue-300 [animation-delay:1s]",
  },
  {
    icon: "ON",
    tag: "Active",
    title: "Compliance",
    value: "24/7",
    description: "Audit Protection",
    barClassName: "bg-emerald-300 [animation-delay:2s]",
  },
  {
    icon: "IN",
    tag: "Payers",
    title: "Insurance Intelligence",
    value: "146",
    description: "Connected Payers",
    barClassName: "bg-cyan-300 [animation-delay:3s]",
  },
];

export const statusPills = [
  "AI Engine Online",
  "Insurance Running",
  "Compliance Active",
  "Health 99.98%",
];

export const trustBadges = [
  "Powered by Responsible AI",
  "Explainable AI",
  "Human-in-the-loop",
  "PDPA Ready",
  "Audit Ready",
];

export const careFlowSteps = [
  "Hospital",
  "Clinic",
  "SOAP",
  "ICD",
  "Evidence",
  "Claim",
  "Compliance",
  "Analytics",
];

export const supportedRoles = [
  "Administrator",
  "Clinic Manager",
  "Doctor",
  "Nurse",
  "Pharmacist",
  "Claim Reviewer",
  "Auditor",
  "Executive",
];
