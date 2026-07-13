"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  calculateExportReadiness,
  mapEvidenceStatusLabel,
  mapPackageStatusLabel,
  mapSeverityLabel,
} from "@/features/evidence-package/domain/rules";
import type {
  EvidencePackage,
  EvidenceStatus,
  EvidenceValidationItem,
  PackageStatus,
  ValidationSeverity,
} from "@/features/evidence-package/domain/types";

type Props = { pkg: EvidencePackage };
type Tone = "success" | "warning" | "danger" | "neutral" | "ai" | "info";

function statusTone(status: EvidenceStatus | PackageStatus | ValidationSeverity): Tone {
  if (status === "complete" || status === "ready_to_export" || status === "exported" || status === "info") return "success";
  if (status === "review_required" || status === "review_needed" || status === "warning" || status === "draft") return "warning";
  if (status === "missing" || status === "blocked" || status === "export_failed" || status === "critical") return "danger";
  if (status === "exporting") return "info";
  return "neutral";
}

function Badge({ children, tone }: { children: string; tone: Tone }) {
  return <span className={`ep-badge ${tone}`}>{children}</span>;
}

function Button({
  children,
  variant = "secondary",
  disabled,
  onClick,
  href,
  title,
}: {
  children: string;
  variant?: "primary" | "secondary" | "ai" | "ghost";
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  title?: string;
}) {
  const className = `ep-button ${variant}`;
  if (href && !disabled) {
    return (
      <Link className={className} href={href} title={title}>
        {children}
      </Link>
    );
  }

  return (
    <button className={className} disabled={disabled} onClick={onClick} title={title} type="button">
      {children}
    </button>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="ep-section-title">{children}</h2>;
}

const navigationGroups = [
  { title: "Clinical Operations", items: ["Patient Management", "Visit Management", "SOAP Note", "Prescription"] },
  { title: "Insurance Intelligence", items: ["Claim Readiness", "Evidence Package", "Payer Rules"] },
  { title: "AI Intelligence", items: ["AI Copilot", "AI Clinical Insight", "AI Recommendation Center"] },
  { title: "Business Intelligence", items: ["Economic Intelligence", "Executive Dashboard"] },
  { title: "Governance", items: ["Audit & Compliance", "Admin Settings"] },
];

function Sidebar() {
  return (
    <aside className="ep-sidebar" aria-label="Main navigation">
      <div className="ep-brand">
        Med AI NexSure
        <small>Enterprise Healthcare & Insurance Intelligence Platform</small>
      </div>
      {navigationGroups.map((group) => (
        <div className="ep-domain" key={group.title}>
          <h2>{group.title}</h2>
          {group.items.map((item) => (
            <div className={`ep-nav-item ${item === "Evidence Package" ? "active" : ""}`} key={item}>
              {item}
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(value);
}

function Header({ pkg, onGenerate, onExport }: Props & { onGenerate: () => void; onExport: () => void }) {
  const readiness = calculateExportReadiness(pkg);
  const exportDisabledReason = readiness.canExport ? undefined : readiness.blockingIssues.map((item) => item.evidenceName).join(", ");

  return (
    <section className="ep-header" aria-labelledby="evidence-title">
      <div>
        <nav className="ep-breadcrumb" aria-label="Breadcrumb">
          Insurance Intelligence / Evidence Assembly Workspace / {pkg.visit.visitId}
        </nav>
        <h1 id="evidence-title">Evidence Package Page</h1>
        <p className="ep-thai">หน้ารวบรวมหลักฐาน เอกสารทางการแพทย์ และข้อมูลประกอบการเคลมก่อน Export PDF</p>
        <div className="ep-meta">
          <span>Package {pkg.version}</span>
          <span>Last updated {formatDateTime(pkg.lastUpdatedAt)}</span>
          <Badge tone={statusTone(pkg.packageStatus)}>{mapPackageStatusLabel(pkg.packageStatus)}</Badge>
        </div>
      </div>
      <div className="ep-actions">
        <Button href={`/claim-readiness/${pkg.visit.visitId}`}>View Claim Readiness</Button>
        <Button href="/visit-management">Open Visit Detail</Button>
        <Button disabled={!pkg.permissions.includes("generate_ai_summary")} onClick={onGenerate} title="AI output requires human review" variant="ai">
          Generate Claim Summary
        </Button>
        <Button href={`/evidence-package/${pkg.visit.visitId}/preview`}>Preview PDF</Button>
        <Button disabled={!readiness.canExport} onClick={onExport} title={exportDisabledReason} variant="primary">
          Export Evidence Package
        </Button>
      </div>
    </section>
  );
}

function OperationalSnapshot({ pkg }: Props) {
  const readiness = calculateExportReadiness(pkg);
  return (
    <section className="ep-grid-3" aria-label="Operational Snapshot">
      <article className="ep-card">
        <h3>Queue Snapshot</h3>
        <p className="ep-thai">ภาพรวม Visit และเคสที่รอเอกสาร</p>
        <div className="ep-row"><span>Waiting</span><strong>18</strong></div>
        <div className="ep-row"><span>In Consultation</span><strong>24</strong></div>
        <div className="ep-row"><span>Pending Evidence</span><strong className="ep-value-warning">{pkg.worklist.filter((item) => item.missingEvidence.length > 0).length}</strong></div>
        <div className="ep-row"><span>Completed</span><strong>70</strong></div>
      </article>
      <article className="ep-card">
        <h3>Claim Readiness Overview</h3>
        <p className="ep-thai">สถานะความพร้อมก่อนจัดชุด Evidence</p>
        <div className="ep-row"><Badge tone="success">Ready</Badge><strong>{readiness.status === "ready" ? 1 : 0}</strong></div>
        <div className="ep-row"><Badge tone="warning">Needs Review</Badge><strong>{readiness.warningIssues.length}</strong></div>
        <div className="ep-row"><Badge tone="danger">Not Ready</Badge><strong>{readiness.blockingIssues.length}</strong></div>
      </article>
      <article className="ep-card">
        <h3>Economic Intelligence</h3>
        <p className="ep-thai">ตรวจค่าใช้จ่ายผิดปกติก่อนส่งประกัน</p>
        <div className="ep-row"><span>Visit Cost</span><strong>{formatCurrency(pkg.economicSummary.visitCost)}</strong></div>
        <div className="ep-row"><span>Expected Range</span><strong>{formatCurrency(pkg.economicSummary.expectedMin)}-{formatCurrency(pkg.economicSummary.expectedMax)}</strong></div>
        <div className="ep-row"><span>Cost Alert</span><Badge tone={statusTone(pkg.economicSummary.costStatus)}>{mapSeverityLabel(pkg.economicSummary.costStatus)}</Badge></div>
      </article>
    </section>
  );
}

function KpiGrid({ pkg }: Props) {
  const readiness = calculateExportReadiness(pkg);
  const cards = [
    { label: "Evidence Package Readiness", value: `${readiness.score}%`, context: readiness.explanation, tone: statusTone(readiness.status === "not_ready" ? "critical" : readiness.status === "needs_review" ? "warning" : "info") },
    { label: "Claim Readiness Score", value: `${pkg.claimReadinessScore}%`, context: "From claim readiness workflow", tone: "info" as Tone },
    { label: "Evidence Quality Score", value: `${pkg.evidenceQualityScore}`, context: "Completeness and consistency", tone: "success" as Tone },
    { label: "Missing / Review Items", value: `${readiness.blockingIssues.length}/${readiness.warningIssues.length}`, context: "Blocking / warning", tone: readiness.blockingIssues.length > 0 ? "danger" as Tone : "warning" as Tone },
  ];

  return (
    <section className="ep-grid-4" aria-label="Evidence package KPI">
      {cards.map((card) => (
        <article className="ep-card" key={card.label}>
          <div className="ep-kpi-label">{card.label}</div>
          <div className={`ep-kpi-value ${card.tone}`}>{card.value}</div>
          <p className="ep-muted">{card.context}</p>
        </article>
      ))}
    </section>
  );
}

function PatientContextBar({ pkg }: Props) {
  const patientName = pkg.patient.canViewFullName || pkg.permissions.includes("view_patient_name") ? pkg.patient.displayName : pkg.patient.maskedDisplayName;
  const items = [
    ["HN", pkg.patient.hn],
    ["Patient", `${patientName}, ${pkg.patient.sex}, ${pkg.patient.age} yrs`],
    ["Visit ID", pkg.visit.visitId],
    ["Visit Date", pkg.visit.visitDate],
    ["Doctor", pkg.visit.doctor],
    ["Clinic", pkg.visit.clinic],
    ["Payer", pkg.visit.payer],
    ["Claim Type", pkg.visit.claimType],
  ];
  return (
    <section className="ep-context" aria-label="Patient and visit context">
      {items.map(([label, value]) => (
        <article className="ep-context-item" key={label}>
          <small>{label}</small>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
  );
}

function EvidenceShell({
  id,
  title,
  helper,
  status,
  action,
  children,
}: {
  id: string;
  title: string;
  helper: string;
  status: EvidenceStatus;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="ep-section-card" id={id} tabIndex={-1}>
      <div className="ep-section-head">
        <div>
          <h3>{title}</h3>
          <p className="ep-thai">{helper}</p>
        </div>
        <div className="ep-section-actions">
          <Badge tone={statusTone(status)}>{mapEvidenceStatusLabel(status)}</Badge>
          {action}
        </div>
      </div>
      {children}
    </article>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="ep-empty">
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

function EvidenceSections({ pkg }: Props) {
  return (
    <div>
      <EvidenceShell helper="สรุปเหตุผลการรักษาและข้อมูลประกอบการเคลม" id="claim-summary" status={pkg.claimSummary.status} title="Insurance Claim Summary">
        {pkg.claimSummary.generatedText ? (
          <>
            <div className="ep-mini-box">{pkg.claimSummary.generatedText}</div>
            <div className="ep-inline-grid">
              <span>Confidence: {pkg.claimSummary.confidence ? `${Math.round(pkg.claimSummary.confidence * 100)}%` : "N/A"}</span>
              <span>Generated: {formatDateTime(pkg.claimSummary.generatedAt)}</span>
              <span>Reviewed by: {pkg.claimSummary.reviewedBy ?? "Pending human review"}</span>
            </div>
            <div className="ep-disclaimer">AI-generated content requires clinician review prior to claim submission. AI ช่วยสรุปข้อมูลเบื้องต้น ผู้ใช้งานต้องตรวจสอบก่อนนำไปใช้งานจริง</div>
          </>
        ) : (
          <EmptyState body="ต้องมีข้อมูลคลินิกก่อนสร้างสรุปสำหรับเคลม" title="No claim summary generated" />
        )}
      </EvidenceShell>

      <EvidenceShell action={<Button href="/visit-management" variant="ghost">Open in Visit Detail</Button>} helper="ข้อมูลทางคลินิกแบบ read-only แก้ไขที่ Visit Detail" id="soap-evidence" status={pkg.soap.status} title="SOAP Evidence">
        {pkg.soap.status === "missing" ? (
          <EmptyState body="SOAP is required for evidence completeness and export readiness." title="SOAP evidence missing" />
        ) : (
          <div className="ep-soap-grid">
            <div><strong>Subjective</strong><span>{pkg.soap.subjective}</span></div>
            <div><strong>Objective</strong><span>{pkg.soap.objective}</span></div>
            <div><strong>Assessment</strong><span>{pkg.soap.assessment}</span></div>
            <div><strong>Plan</strong><span>{pkg.soap.plan}</span></div>
          </div>
        )}
        <p className="ep-muted">Version {pkg.soap.version} · {pkg.soap.author} · {formatDateTime(pkg.soap.lastUpdatedAt)} · {pkg.soap.aiAssisted ? "AI-assisted draft" : "Clinician authored"}</p>
      </EvidenceShell>

      <EvidenceShell helper="รหัสวินิจฉัยสำหรับตรวจสอบความถูกต้องของเคลม" id="diagnosis-icd" status={pkg.diagnosis.status} title="Diagnosis & ICD">
        {pkg.diagnosis.primaryDiagnosis ? (
          <div className="ep-mini-box">
            <strong>Primary Diagnosis</strong>
            <span>{pkg.diagnosis.primaryDiagnosis}</span>
            <strong>ICD-10</strong>
            <span>{pkg.diagnosis.icd10Codes.join(", ") || "Missing"}</span>
            <strong>Payer Validation</strong>
            <span>{pkg.diagnosis.payerRuleStatus}</span>
          </div>
        ) : (
          <EmptyState body="Primary diagnosis and required ICD must be completed before export." title="Diagnosis or ICD missing" />
        )}
      </EvidenceShell>

      <EvidenceShell helper="รายการยา วิธีใช้ จำนวน และ Safety Note" id="prescription-evidence" status={pkg.prescription.status} title="Prescription Evidence">
        <div className="ep-table-wrap">
          <table className="ep-table">
            <caption>Structured medication evidence</caption>
            <thead><tr><th>Medication</th><th>Dose</th><th>Route</th><th>Frequency</th><th>Duration</th><th>Qty</th></tr></thead>
            <tbody>{pkg.prescription.medications.map((med) => <tr key={med.medication}><td>{med.medication} {med.strength}</td><td>{med.dose}</td><td>{med.route}</td><td>{med.frequency}</td><td>{med.duration}</td><td>{med.quantity}</td></tr>)}</tbody>
          </table>
        </div>
        <p className="ep-muted">{pkg.prescription.safetyStatus} · Allergy alerts {pkg.prescription.allergyAlerts.length} · Interaction warnings {pkg.prescription.interactionWarnings.length} · Pharmacist {pkg.prescription.pharmacistReviewStatus}</p>
      </EvidenceShell>

      <EvidenceShell action={<Button>Generate</Button>} helper="ใบรับรองแพทย์สำหรับแนบชุด Evidence" id="medical-certificate" status={pkg.medicalCertificate.status} title="Medical Certificate">
        {pkg.medicalCertificate.version ? (
          <div className="ep-mini-box">Version {pkg.medicalCertificate.version} · Created {formatDateTime(pkg.medicalCertificate.createdAt)} · Signed: {pkg.medicalCertificate.signed ? "Yes" : "No"} · Payer mandatory: {pkg.medicalCertificate.payerMandatory ? "Yes" : "No"}</div>
        ) : (
          <EmptyState body="ใบรับรองแพทย์ยังไม่ถูกสร้าง ตรวจสอบ payer requirement ก่อน export" title="No medical certificate" />
        )}
      </EvidenceShell>

      <EvidenceShell action={<Button disabled={!pkg.permissions.includes("upload_document")}>Upload</Button>} helper="ไฟล์แนบ เช่น Lab, Image, Consent, Referral" id="supporting-documents" status={pkg.supportingDocuments.length > 0 ? "complete" : "missing"} title="Supporting Documents">
        {pkg.supportingDocuments.length === 0 ? (
          <EmptyState body="Required supporting documents are missing and may block export." title="No supporting documents" />
        ) : (
          <div className="ep-document-list">{pkg.supportingDocuments.map((doc) => <div className="ep-document" key={doc.id}><strong>{doc.fileName}</strong><span>{doc.documentType} · {doc.mimeType} · {doc.fileSizeLabel}</span><span>{doc.uploadedBy} · {formatDateTime(doc.uploadedAt)}</span><Badge tone={statusTone(doc.verificationStatus)}>{mapEvidenceStatusLabel(doc.verificationStatus)}</Badge></div>)}</div>
        )}
      </EvidenceShell>

      <EvidenceShell action={<Button>Cost Justification</Button>} helper="ตรวจสอบความสมเหตุสมผลของค่าใช้จ่าย" id="economic-summary" status={pkg.economicSummary.reviewStatus} title="Economic Summary">
        <div className="ep-mini-box">
          Visit Cost: {formatCurrency(pkg.economicSummary.visitCost)} · Expected: {formatCurrency(pkg.economicSummary.expectedMin)}-{formatCurrency(pkg.economicSummary.expectedMax)}
          <br />
          Variance: {formatCurrency(pkg.economicSummary.varianceAmount)} ({pkg.economicSummary.variancePercent}%)
          <br />
          Cost Drivers: {pkg.economicSummary.costDrivers.join(", ")}
          <br />
          Justification: {pkg.economicSummary.justification ?? "Required before export"}
        </div>
      </EvidenceShell>
    </div>
  );
}

function DecisionPanel({ pkg, onExport }: Props & { onExport: () => void }) {
  const readiness = useMemo(() => calculateExportReadiness(pkg), [pkg]);
  const checklistClick = (item: EvidenceValidationItem) => {
    const element = document.getElementById(item.sectionId);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
    element?.focus({ preventScroll: true });
  };

  return (
    <aside className="ep-sticky" aria-label="Export readiness decision panel">
      <article className="ep-card ep-readiness-card">
        <h3>Export Readiness</h3>
        <p className="ep-thai">สถานะความพร้อมก่อน Export Evidence Package</p>
        <div className={`ep-readiness-score ${statusTone(readiness.status === "not_ready" ? "critical" : readiness.status === "needs_review" ? "warning" : "info")}`}>{readiness.score}%</div>
        <Badge tone={readiness.status === "not_ready" ? "danger" : readiness.status === "needs_review" ? "warning" : "success"}>{readiness.status === "not_ready" ? "Not Ready" : readiness.status === "needs_review" ? "Review Needed" : "Ready to Export"}</Badge>
        <div aria-label={`Readiness score ${readiness.score} percent`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={readiness.score} className="ep-progress" role="progressbar">
          <span style={{ width: `${readiness.score}%` }} />
        </div>
        <p className="ep-success-message">{readiness.explanation}<br />Blocking {readiness.blockingIssues.length} · Warning {readiness.warningIssues.length}</p>
        <div className="ep-export-actions">
          <Button href={`/evidence-package/${pkg.visit.visitId}/preview`}>Preview PDF</Button>
          <Button disabled={!readiness.canExport} onClick={onExport} variant="primary">Export Evidence Package</Button>
        </div>
      </article>

      <article className="ep-card">
        <h3>Evidence Validation Checklist</h3>
        <p className="ep-thai">คลิกเพื่อไปยังส่วนหลักฐานที่เกี่ยวข้อง</p>
        <div className="ep-checklist">
          {pkg.validationItems.map((item) => (
            <button className="ep-check" key={item.id} onClick={() => checklistClick(item)} type="button">
              <span><strong>{item.evidenceName}</strong><small>{item.required ? "Required" : "Optional"} · {item.reason}</small></span>
              <Badge tone={statusTone(item.severity)}>{mapSeverityLabel(item.severity)}</Badge>
            </button>
          ))}
        </div>
      </article>

      <article className="ep-card ep-ai-card">
        <h3>AI Recommendation</h3>
        {pkg.aiRecommendation ? (
          <>
            <div className="ep-ai-priority"><Badge tone="ai">{pkg.aiRecommendation.priority.toUpperCase()}</Badge><strong>Confidence {Math.round(pkg.aiRecommendation.confidence * 100)}%</strong></div>
            <p>{pkg.aiRecommendation.explanation}</p>
            <p className="ep-muted">Next action: {pkg.aiRecommendation.nextAction}</p>
            <div className="ep-disclaimer">AI confidence is not approval. Human review is required.</div>
          </>
        ) : (
          <EmptyState body="ไม่มีคำแนะนำจาก AI สำหรับแพ็กเกจนี้" title="No AI recommendation" />
        )}
      </article>
    </aside>
  );
}

function Timeline({ pkg }: Props) {
  return (
    <section className="ep-card">
      <ol className="ep-timeline">
        {pkg.timeline.map((item) => (
          <li className="ep-time-item" key={item.id}>
            <time>{formatDateTime(item.timestamp)}</time>
            <span><strong>{item.action}</strong><small>{item.actor} · {item.actorRole} · {item.relatedSection}</small></span>
            <Badge tone={item.source === "ai" ? "ai" : "neutral"}>{item.source}</Badge>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Worklist({ pkg }: Props) {
  return (
    <div className="ep-table-wrap">
      <table className="ep-table">
        <caption>Related evidence package worklist</caption>
        <thead><tr><th>HN / Patient</th><th>Visit Date</th><th>Visit Status</th><th>Claim</th><th>Quality</th><th>Package</th><th>Missing Evidence</th><th>Cost</th><th>Action</th></tr></thead>
        <tbody>
          {pkg.worklist.map((item) => (
            <tr key={item.visitId}>
              <td>{item.hn}<br /><span className="ep-muted">{item.patientLabel}</span></td>
              <td>{item.visitDate}</td>
              <td>{item.visitStatus}</td>
              <td>{item.claimReadinessScore}</td>
              <td>{item.evidenceQualityScore}</td>
              <td><Badge tone={statusTone(item.packageStatus)}>{mapPackageStatusLabel(item.packageStatus)}</Badge></td>
              <td>{item.missingEvidence.length ? item.missingEvidence.join(", ") : "-"}</td>
              <td><Badge tone={statusTone(item.costStatus)}>{mapSeverityLabel(item.costStatus)}</Badge></td>
              <td><Button href={`/evidence-package/${item.visitId}`}>View</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Compliance({ pkg }: Props) {
  return (
    <section className="ep-grid-3">
      <article className="ep-card"><h3>Audit Alerts</h3><p className="ep-thai">แจ้งเตือนกิจกรรมที่ต้องตรวจสอบ</p><div className="ep-row"><span>Blocked Export</span><strong>{pkg.compliance.blockedExportCount}</strong></div><div className="ep-row"><span>Missing Consent</span><strong>{pkg.compliance.missingConsentCount}</strong></div></article>
      <article className="ep-card"><h3>Export History</h3><p className="ep-thai">ประวัติการ Export PDF และ Version</p><div className="ep-row"><span>Latest Version</span><strong>{pkg.compliance.latestPackageVersion}</strong></div><div className="ep-row"><span>Exported By</span><strong>{pkg.compliance.exportedBy ?? "Not exported"}</strong></div></article>
      <article className="ep-card"><h3>Compliance Status</h3><p className="ep-thai">PDPA, Audit Trail และ Access Control</p><div className="ep-row"><span>PDPA Consent</span><Badge tone={statusTone(pkg.compliance.pdpaConsentStatus)}>{mapEvidenceStatusLabel(pkg.compliance.pdpaConsentStatus)}</Badge></div><div className="ep-row"><span>Audit Trail</span><Badge tone={statusTone(pkg.compliance.auditTrailStatus)}>{mapEvidenceStatusLabel(pkg.compliance.auditTrailStatus)}</Badge></div></article>
    </section>
  );
}

export function EvidencePackagePage({ pkg }: Props) {
  const [notice, setNotice] = useState<string | null>(null);
  const readiness = useMemo(() => calculateExportReadiness(pkg), [pkg]);

  const handleGenerate = () => setNotice("AI summary generation queued. Human review is required before claim submission.");
  const handleExport = () => {
    if (readiness.blockingIssues.length > 0) {
      setNotice(`Export blocked: ${readiness.blockingIssues.map((item) => item.evidenceName).join(", ")}`);
      return;
    }
    if (readiness.warningIssues.length > 0 && !window.confirm("Warning items remain. Confirm human review before exporting?")) return;
    setNotice("Export request recorded with audit event. Mock service does not generate a real PDF.");
  };

  return (
    <div className="ep-app">
      <style>{`
        .ep-app{--primary:#1E3A8A;--executive:#0F2A5F;--ai:#2563EB;--purple:#7C3AED;--bg:#F8FAFC;--card:#FFFFFF;--border:#E2E8F0;--text:#0F172A;--muted:#64748B;--success:#16A34A;--warning:#D97706;--danger:#DC2626;min-height:100vh;background:var(--bg);color:var(--text);display:grid;grid-template-columns:280px minmax(0,1fr);font-family:Inter,Segoe UI,Arial,sans-serif}.ep-sidebar{background:linear-gradient(180deg,var(--executive),#102A56);color:#fff;padding:26px 20px;position:sticky;top:0;height:100vh;overflow:auto}.ep-brand{font-size:22px;font-weight:900;letter-spacing:-.04em}.ep-brand small{display:block;margin-top:5px;font-size:12px;color:#BFDBFE;line-height:1.5}.ep-domain{margin-top:28px}.ep-domain h2{margin:0 0 10px;font-size:11px;color:#93C5FD;text-transform:uppercase;letter-spacing:.13em}.ep-nav-item{padding:11px 12px;border-radius:12px;color:#DBEAFE;font-size:14px;margin-bottom:5px}.ep-nav-item.active{background:rgba(255,255,255,.15);color:#fff;font-weight:800}.ep-main{min-width:0;padding:30px}.ep-header{background:linear-gradient(135deg,#FFFFFF,#EFF6FF);border:1px solid var(--border);border-radius:26px;padding:30px;box-shadow:0 18px 44px rgba(15,42,95,.08);display:flex;justify-content:space-between;gap:20px}.ep-breadcrumb{font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:var(--ai);font-weight:900}.ep-header h1{margin:8px 0;font-size:34px;color:var(--executive);letter-spacing:-.045em}.ep-thai,.ep-muted{color:var(--muted);font-size:13px;line-height:1.6}.ep-meta,.ep-actions,.ep-section-actions,.ep-inline-grid{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.ep-actions{justify-content:flex-end;align-content:flex-start}.ep-button{border:1px solid var(--border);border-radius:12px;padding:11px 16px;font-size:13px;font-weight:800;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;background:#fff;color:var(--primary);cursor:pointer}.ep-button.primary{background:var(--primary);color:#fff}.ep-button.ai{background:var(--purple);color:#fff}.ep-button.ghost{border-color:transparent;background:transparent}.ep-button:disabled{opacity:.55;cursor:not-allowed}.ep-button:focus-visible,.ep-check:focus-visible,.ep-section-card:focus-visible{outline:3px solid rgba(37,99,235,.25);outline-offset:2px}.ep-section-title{margin:30px 0 14px;font-size:22px;color:var(--executive);letter-spacing:-.03em}.ep-grid-4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.ep-grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.ep-card,.ep-section-card,.ep-context-item{background:var(--card);border:1px solid var(--border);border-radius:22px;padding:20px;box-shadow:0 18px 44px rgba(15,42,95,.08)}.ep-kpi-label{font-size:13px;color:var(--muted);font-weight:800}.ep-kpi-value{font-size:38px;font-weight:900;color:var(--executive);margin:8px 0;letter-spacing:-.04em}.ep-kpi-value.success,.ep-readiness-score.success{color:var(--success)}.ep-kpi-value.warning,.ep-readiness-score.warning{color:var(--warning)}.ep-kpi-value.danger,.ep-readiness-score.danger{color:var(--danger)}.ep-context{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.ep-context-item small{display:block;color:var(--muted);font-weight:900;font-size:11px}.ep-context-item strong{display:block;margin-top:6px}.ep-workspace{display:grid;grid-template-columns:minmax(0,1fr) 370px;gap:20px;align-items:start}.ep-section-card{margin-bottom:16px;scroll-margin-top:18px}.ep-section-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:14px}.ep-section-head h3,.ep-card h3{margin:0 0 6px;color:var(--executive);font-size:16px}.ep-badge{display:inline-flex;align-items:center;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900;white-space:nowrap}.ep-badge.success{background:#F0FDF4;color:var(--success)}.ep-badge.warning{background:#FFFBEB;color:var(--warning)}.ep-badge.danger{background:#FEF2F2;color:var(--danger)}.ep-badge.ai{background:#F5F3FF;color:var(--purple)}.ep-badge.info{background:#EFF6FF;color:var(--ai)}.ep-badge.neutral{background:#F1F5F9;color:#475569}.ep-mini-box,.ep-empty,.ep-soap-grid>div{background:#F8FAFC;border:1px solid var(--border);border-radius:16px;padding:14px;font-size:13px;line-height:1.6}.ep-mini-box strong,.ep-soap-grid strong{display:block;color:var(--executive);margin-top:8px}.ep-soap-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ep-disclaimer{margin-top:14px;padding:12px;background:#F5F3FF;color:#5B21B6;border-radius:14px;font-size:12px;font-weight:800;line-height:1.5}.ep-table-wrap{overflow-x:auto}.ep-table{width:100%;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid var(--border);border-radius:22px;overflow:hidden}.ep-table caption{text-align:left;font-weight:800;color:var(--executive);padding:8px 0}.ep-table th,.ep-table td{border-bottom:1px solid var(--border);padding:14px;text-align:left;font-size:13px;vertical-align:top}.ep-table th{background:#F8FAFC;color:#475569;text-transform:uppercase;font-size:11px;letter-spacing:.06em}.ep-document-list{display:grid;gap:10px}.ep-document{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid var(--border);border-radius:16px;padding:12px;background:#F8FAFC}.ep-sticky{position:sticky;top:24px;display:grid;gap:18px}.ep-readiness-card{background:linear-gradient(180deg,#FFFFFF,#F0FDF4);border-color:#BBF7D0}.ep-readiness-score{font-size:46px;font-weight:900;color:var(--executive);letter-spacing:-.06em}.ep-progress{height:10px;background:#DCFCE7;border-radius:999px;overflow:hidden;margin:18px 0}.ep-progress span{display:block;height:100%;background:var(--success);border-radius:999px}.ep-success-message{background:#DCFCE7;border:1px solid #BBF7D0;color:#166534;border-radius:14px;padding:12px;font-size:12px;font-weight:800;line-height:1.5}.ep-export-actions{display:grid;gap:10px}.ep-checklist{display:grid;gap:10px}.ep-check{width:100%;display:flex;justify-content:space-between;gap:10px;text-align:left;border:1px solid #BFDBFE;background:#EFF6FF;border-radius:14px;padding:12px;cursor:pointer}.ep-check small{display:block;color:var(--muted);margin-top:4px}.ep-ai-card{background:linear-gradient(180deg,#FFFFFF,#F5F3FF);border-color:#DDD6FE}.ep-ai-priority{display:flex;justify-content:space-between;align-items:center}.ep-timeline{list-style:none;margin:0;padding:0;display:grid;gap:12px}.ep-time-item{display:grid;grid-template-columns:170px minmax(0,1fr) auto;gap:12px;background:#F8FAFC;border:1px solid var(--border);border-radius:14px;padding:14px}.ep-time-item small{display:block;color:var(--muted);margin-top:4px}.ep-row{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:13px}.ep-value-warning{color:var(--warning)}.ep-notice{position:sticky;bottom:12px;z-index:5;margin-top:18px;background:#EFF6FF;border:1px solid #BFDBFE;color:#1E3A8A;border-radius:14px;padding:12px;font-weight:800}.ep-footer-actions{display:none}@media(max-width:1200px){.ep-app{grid-template-columns:1fr}.ep-sidebar{display:none}.ep-main{padding:20px}.ep-header,.ep-workspace{grid-template-columns:1fr;display:grid}.ep-grid-4,.ep-grid-3,.ep-context{grid-template-columns:1fr}.ep-sticky{position:static}.ep-actions{justify-content:flex-start}.ep-soap-grid{grid-template-columns:1fr}}@media(max-width:720px){.ep-main{padding:16px}.ep-header h1{font-size:28px}.ep-section-head,.ep-document,.ep-time-item{grid-template-columns:1fr;display:grid}.ep-actions .ep-button{flex:1 1 150px}.ep-footer-actions{display:grid;position:sticky;bottom:0;background:#fff;border-top:1px solid var(--border);padding:10px;grid-template-columns:1fr 1fr;gap:8px;margin:18px -16px -16px}}
      `}</style>
      <Sidebar />
      <main className="ep-main">
        <Header pkg={pkg} onExport={handleExport} onGenerate={handleGenerate} />
        <SectionTitle>Executive KPI</SectionTitle>
        <KpiGrid pkg={pkg} />
        <SectionTitle>Operational Snapshot</SectionTitle>
        <OperationalSnapshot pkg={pkg} />
        <SectionTitle>Evidence Package Detail</SectionTitle>
        <PatientContextBar pkg={pkg} />
        <section className="ep-workspace">
          <EvidenceSections pkg={pkg} />
          <DecisionPanel pkg={pkg} onExport={handleExport} />
        </section>
        <SectionTitle>Activity Timeline</SectionTitle>
        <Timeline pkg={pkg} />
        <SectionTitle>Operational Worklist</SectionTitle>
        <Worklist pkg={pkg} />
        <SectionTitle>Compliance</SectionTitle>
        <Compliance pkg={pkg} />
        {notice ? <div aria-live="polite" className="ep-notice">{notice}</div> : null}
        <div className="ep-footer-actions"><Button href={`/evidence-package/${pkg.visit.visitId}/preview`}>Preview</Button><Button disabled={!readiness.canExport} onClick={handleExport} variant="primary">Export</Button></div>
      </main>
    </div>
  );
}
