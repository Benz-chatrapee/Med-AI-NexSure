import { BriefcaseMedical, FileHeart, Stethoscope } from "lucide-react";
import type { CertificatePurpose, MedicalCertificateWorkspace } from "./types";

export const certificatePurposes: CertificatePurpose[] = [
  { label: "Sick Leave", thai: "ลาป่วย", icon: BriefcaseMedical, selected: true },
  { label: "Fitness to Work", thai: "รับรองความพร้อมทำงาน", icon: Stethoscope },
  { label: "Insurance Claim", thai: "ประกอบการเคลมประกัน", icon: FileHeart },
];

export function getMedicalCertificateWorkspace(visitId: string): MedicalCertificateWorkspace {
  return {
    visitId,
    patient: {
      name: "Ananya Kittisak",
      hn: "HN-008294",
      vn: "VN-2026-0718-001",
      age: "34Y",
      allergy: "No known drug allergy",
    },
    clinician: {
      name: "Dr. J. Smith",
      license: "MD-45821",
      department: "Internal Medicine",
    },
    status: "Draft",
    stats: [
      { label: "Certificates Today", value: "18", helper: "ออกเอกสารวันนี้" },
      { label: "Issued Today", value: "14", helper: "ลงนามแล้ว" },
      { label: "AI Utilization", value: "86%", helper: "ใช้ AI ช่วยร่าง" },
    ],
    clinicalReferences: [
      { label: "Primary Diagnosis", value: "Acute pharyngitis", tone: "primary" },
      { label: "ICD-10", value: "J02.9", tone: "success" },
      { label: "Visit Type", value: "Outpatient", tone: "muted" },
      { label: "Evidence", value: "SOAP complete", tone: "warning" },
    ],
    soapSnapshot: {
      subjective: "Patient reports severe throat pain and malaise for two days.",
      objective: "T 37.8 C, erythematous pharynx, no respiratory distress.",
      assessment: "Clinical findings suggest acute inflammation consistent with pharyngitis.",
      plan: "Symptomatic treatment, hydration, and rest with follow-up if symptoms worsen.",
    },
    findingsText:
      "This is to certify that the patient attended a medical examination at our facility on 18 July 2026. Clinical findings suggest acute inflammation consistent with pharyngitis. ขอรับรองว่าผู้ป่วยเข้ารับการตรวจรักษาจริงเมื่อวันที่ 18 กรกฎาคม 2569 และควรพักรักษาตัวตามคำแนะนำแพทย์",
    restPeriod: {
      startDate: "2026-07-18",
      endDate: "2026-07-20",
      days: 3,
      aiSuggestion: "AI suggests 3 days based on SOAP and diagnosis evidence.",
    },
    attachments: [
      { name: "SOAP Snapshot", detail: "Signed clinical summary" },
      { name: "Diagnosis Evidence", detail: "ICD-10 J02.9 mapped" },
    ],
    readinessScore: 92,
    readinessChecks: [
      { label: "Patient Identity Verified", thai: "ยืนยันตัวตนผู้ป่วยแล้ว", status: "Verified" },
      { label: "Clinical Evidence Linked", thai: "เชื่อมโยงหลักฐานทางคลินิกแล้ว", status: "Verified" },
      { label: "Doctor Review", thai: "รอแพทย์ตรวจทานขั้นสุดท้าย", status: "Review" },
      { label: "Digital Signature Pending", thai: "รอลงนามดิจิทัล", status: "Pending" },
    ],
  };
}
