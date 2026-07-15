"use client";

import { useState } from "react";

type BadgeTone = "medium" | "verified" | "review" | "updated" | "passed" | "ai" | "fail";
type DiffMode = "structured" | "inline" | "json";
type ModalId = "export" | "actions" | "note";

type Kpi = {
  label: string;
  value: string;
  foot: string;
  icon: string;
  target: "risk" | "changes" | "entities" | "ai-trace";
  valueClass?: string;
  footClass?: string;
  risk?: boolean;
};

type Field = {
  label: string;
  value: string;
  mono?: boolean;
};

type ChangeRow = {
  field: string;
  path: string;
  previous: string;
  next: string;
  mono?: boolean;
};

type TimelineItem = {
  time: string;
  title: string;
  description: string;
  current?: boolean;
};

type PolicyItem = {
  title: string;
  description: string;
  warning?: boolean;
};

type EntityItem = {
  icon: string;
  title: string;
  subtitle: string;
  action: string;
};

const kpis: Kpi[] = [
  { label: "Event Severity", value: "Medium", foot: "ตรวจพบการแก้ไขข้อมูลทางคลินิก", icon: "!", target: "risk", valueClass: "ad-kpi-amber" },
  { label: "Changes Detected", value: "4 Fields", foot: "3 business fields · 1 system field", icon: "↔", target: "changes" },
  { label: "Related Entity Context", value: "4 Records", foot: "Patient, Visit, SOAP, Claim", icon: "⌘", target: "entities" },
  { label: "Risk Score", value: "42 / 100", foot: "", icon: "△", target: "risk", risk: true },
  { label: "AI Involvement", value: "AI Suggested", foot: "ผ่านการตรวจสอบและปรับแก้โดยแพทย์", icon: "✦", target: "ai-trace", valueClass: "ad-kpi-ai" },
  { label: "Policy Checks", value: "5 Passed", foot: "1 warning · 0 failed", icon: "✓", target: "risk", footClass: "ad-kpi-warning-foot" },
];

const eventFields: Field[] = [
  { label: "Event Type", value: "SOAP_NOTE_UPDATED", mono: true },
  { label: "Module", value: "Clinical Documentation" },
  { label: "Timestamp", value: "10 Jul 2026, 14:25:37 ICT" },
  { label: "Severity", value: "Medium" },
  { label: "Entity Type", value: "SOAP Note" },
  { label: "Entity ID", value: "SOAP-00129", mono: true },
  { label: "Visit ID", value: "VIS-20260710-0124", mono: true },
  { label: "Correlation ID", value: "REQ-8BA8-49C2", mono: true },
];

const changes: ChangeRow[] = [
  { field: "Visit Status", path: "visit.status", previous: "In Consultation", next: "Pharmacy" },
  { field: "Diagnosis Code", path: "assessment.primary_icd10", previous: "R05", next: "J06.9", mono: true },
  {
    field: "SOAP Assessment",
    path: "soap.assessment",
    previous: "Acute cough, likely viral infection.",
    next: "Acute upper respiratory infection with cough. No red-flag symptoms identified.",
  },
  { field: "Claim Readiness Score", path: "claim_readiness.score", previous: "72", next: "86" },
];

const timeline: TimelineItem[] = [
  { time: "14:22:04 · 3m 33s before", title: "User opened Visit Detail", description: "Dr. Narin opened VIS-20260710-0124" },
  { time: "14:23:18 · 2m 19s before", title: "AI generated ICD suggestion", description: "Suggested J06.9 with 91% confidence" },
  { time: "14:25:37 · Current event", title: "SOAP Note Updated", description: "3 clinical fields and 1 claim field changed", current: true },
  { time: "14:25:38 · 1s after", title: "Claim Readiness recalculated", description: "Score increased from 72 to 86 — status changed to Ready" },
  { time: "14:26:12 · 35s after", title: "Evidence Package marked complete", description: "Mandatory SOAP and ICD evidence validated" },
];

const policies: PolicyItem[] = [
  { title: "Valid permission", description: "ผู้ใช้งานมีสิทธิ์ soap_note.update ตาม Role และ Access Scope" },
  { title: "Clinic scope matched", description: "ผู้ดำเนินการและ Visit อยู่ภายใต้ CLINIC-001 เดียวกัน" },
  { title: "Patient consent active", description: "Patient Consent มีสถานะ Active ณ เวลาที่เข้าถึงข้อมูล" },
  { title: "MFA verified", description: "ผ่านการยืนยันตัวตนเพิ่มเติมตาม Security Policy" },
  { title: "AI override policy followed", description: "ระบบบันทึกเหตุผลและ Human Decision ครบถ้วน" },
  { title: "Diagnosis change after AI suggestion", description: "แนะนำให้ตรวจสอบเพิ่มเติม เนื่องจากมีผลต่อ Claim Readiness Score อย่างมีนัยสำคัญ", warning: true },
];

const entities: EntityItem[] = [
  { icon: "P", title: "Patient", subtitle: "HN-000238 · Anong S•••••", action: "Open ↗" },
  { icon: "V", title: "Visit", subtitle: "VIS-20260710-0124", action: "Open ↗" },
  { icon: "S", title: "SOAP Note", subtitle: "SOAP-00129 · Version 6", action: "View ↗" },
  { icon: "C", title: "Claim Readiness", subtitle: "CRA-0291 · Score 86", action: "View ↗" },
];

const jsonView = `{
  "event_type": "SOAP_NOTE_UPDATED",
  "previous_values": {
    "visit_status": "in_consultation",
    "diagnosis_code": "R05",
    "claim_score": 72
  },
  "new_values": {
    "visit_status": "pharmacy",
    "diagnosis_code": "J06.9",
    "claim_score": 86
  },
  "change_reason": "Clinical assessment updated after examination"
}`;

function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return <span className={`ad-badge ad-${tone}`}>{children}</span>;
}

function Card({
  title,
  description,
  action,
  children,
  id,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section className="ad-card" id={id}>
      <div className="ad-card-head">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {action}
      </div>
      <div className="ad-card-body">{children}</div>
    </section>
  );
}

export function AuditDetailPage({ auditId }: { auditId: string }) {
  const [diffMode, setDiffMode] = useState<DiffMode>("structured");
  const [activeFilter, setActiveFilter] = useState("All Changes");
  const [note, setNote] = useState("");
  const [modal, setModal] = useState<ModalId | null>(null);
  const [toast, setToast] = useState("");

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  }

  function copyAuditId() {
    void navigator.clipboard?.writeText(auditId);
    showToast(`Copied: ${auditId}`);
  }

  function addNote() {
    if (note.trim().length < 10) {
      showToast("กรุณาระบุ Review Note อย่างน้อย 10 ตัวอักษร");
      return;
    }

    setNote("");
    showToast("Review note saved successfully. บันทึกข้อมูลการตรวจสอบแล้ว");
  }

  function selectDiffMode(mode: DiffMode) {
    setDiffMode(mode);
    if (mode === "inline") {
      showToast("Inline diff mode enabled.");
    }
  }

  return (
    <>
      <style>{auditDetailStyles}</style>
      <div className="ad-app">
        <aside className="ad-sidebar">
          <div className="ad-brand">
            <div className="ad-brandmark">N</div>
            <div>
              <strong>Med AI NexSure</strong>
              <span>HEALTHCARE & INSURANCE INTELLIGENCE</span>
            </div>
          </div>
          <nav className="ad-nav" aria-label="Primary">
            <div className="ad-navlabel">Clinical Operations</div>
            {[
              ["⌂", "Main Dashboard"],
              ["♙", "Patient Management"],
              ["✚", "Visit Management"],
              ["◇", "Claim Readiness"],
              ["✦", "AI Copilot"],
            ].map(([icon, item]) => (
              <a href="#" key={item}><span className="ad-ico">{icon}</span>{item}</a>
            ))}
            <div className="ad-navlabel">Governance</div>
            {[
              ["▣", "Audit Trail"],
              ["⚖", "Compliance Review"],
              ["⚙", "Admin Settings"],
            ].map(([icon, item]) => (
              <a href="#" className={item === "Audit Trail" ? "active" : undefined} key={item}><span className="ad-ico">{icon}</span>{item}</a>
            ))}
          </nav>
          <div className="ad-sidebar-foot">
            <div className="ad-profile">
              <div className="ad-avatar">SC</div>
              <div><b>Sirin C.</b><small>Compliance Officer</small></div>
            </div>
          </div>
        </aside>

        <main className="ad-main">
          <div className="ad-topbar">
            <div className="ad-search"><input aria-label="Global Search — ค้นหาข้อมูลทั้งระบบ" placeholder="Search patients, visits, claims, evidence, or audit IDs..." /></div>
            <div className="ad-topactions">
              <button className="ad-iconbtn" aria-label="AI Copilot" type="button">✦</button>
              <button className="ad-iconbtn" aria-label="Notifications" type="button">♢</button>
              <button className="ad-iconbtn" type="button">?</button>
            </div>
          </div>

          <div className="ad-content">
            <div className="ad-breadcrumb"><span>Audit & Compliance</span><span>/</span><span>Audit Events</span><span>/</span><b>{auditId}</b></div>
            <section className="ad-audit-head">
              <div className="ad-head-row">
                <div>
                  <div className="ad-eyebrow"><span>CLINICAL DOCUMENTATION</span><span>•</span><span>10 Jul 2026, 14:25:37 ICT</span></div>
                  <div className="ad-head-title">
                    <h1>SOAP Note Updated</h1>
                    <Badge tone="medium">Medium Severity</Badge>
                    <Badge tone="verified">Integrity Verified</Badge>
                    <Badge tone="review">Review Required</Badge>
                  </div>
                  <div className="ad-head-sub">ตรวจสอบผู้ดำเนินการ รายการเปลี่ยนแปลง ความเสี่ยง และหลักฐานที่เกี่ยวข้องกับเหตุการณ์นี้</div>
                  <div className="ad-head-sub ad-audit-id">Audit ID: <span className="ad-mono">{auditId}</span> <button className="ad-copy" type="button" onClick={copyAuditId}>Copy</button> · Source: Med AI NexSure Web</div>
                </div>
                <div className="ad-head-actions">
                  <button className="ad-btn" type="button" onClick={() => history.back()}>← Back to Audit Logs</button>
                  <button className="ad-btn ad-primary" type="button" onClick={() => setModal("export")}>⇩ Export Audit Record</button>
                  <button className="ad-iconbtn" type="button" onClick={() => setModal("actions")}>•••</button>
                </div>
              </div>
              <div className="ad-readonly"><span>🔒 <strong>Immutable Audit Record</strong> — รายการนี้เป็นข้อมูลแบบ Read-only ไม่สามารถแก้ไขหรือลบจากระบบได้</span><span>Production · v1.4.2</span></div>
            </section>

            <section className="ad-kpis" aria-label="Audit detail KPIs">
              {kpis.map((kpi) => (
                <article className="ad-kpi" key={kpi.label} onClick={() => { window.location.hash = kpi.target; }}>
                  <div className="ad-kpi-top"><span>{kpi.label}</span><span className="ad-kpi-icon">{kpi.icon}</span></div>
                  <div className={`ad-kpi-value ${kpi.valueClass ?? ""}`}>{kpi.value}</div>
                  {kpi.risk ? <div className="ad-riskbar"><i /></div> : null}
                  {kpi.foot ? (
                    <div className={`ad-kpi-foot ${kpi.footClass ?? ""}`}>
                      {kpi.footClass ? <><span className="ad-amber-text">1 warning</span> · 0 failed</> : kpi.foot}
                    </div>
                  ) : null}
                </article>
              ))}
            </section>

            <div className="ad-layout">
              <div className="ad-left">
                <Card title="Audit Event Metadata" description="ข้อมูลหลักของเหตุการณ์ Audit และความสัมพันธ์กับระบบที่เกี่ยวข้อง">
                  <div className="ad-grid2">{eventFields.map((field) => <FieldView field={field} key={field.label} />)}</div>
                </Card>

                <section className="ad-card" id="changes">
                  <div className="ad-card-head">
                    <div><h2>Change History</h2><p>เปรียบเทียบข้อมูลก่อนและหลังการเปลี่ยนแปลง</p></div>
                    <div className="ad-tabs">
                      {(["structured", "inline", "json"] as const).map((mode) => (
                        <button className={diffMode === mode ? "active" : undefined} key={mode} type="button" onClick={() => selectDiffMode(mode)}>
                          {mode === "structured" ? "Structured" : mode === "inline" ? "Inline Diff" : "JSON"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="ad-filter-row">
                    <div className="ad-filters">
                      {["All Changes", "Clinical", "Claim", "System Metadata", "Sensitive Fields"].map((filter) => (
                        <button className={`ad-chip ${activeFilter === filter ? "active" : ""}`} key={filter} type="button" onClick={() => { setActiveFilter(filter); showToast(`Change filter: ${filter}`); }}>{filter}</button>
                      ))}
                    </div>
                    <span>4 fields changed</span>
                  </div>
                  {diffMode === "json" ? <pre className="ad-json-view">{jsonView}</pre> : (
                    <div className="ad-table-wrap">
                      <table className="ad-diff-table">
                        <thead><tr><th>Field</th><th>Previous Value</th><th>New Value</th><th>Change Type</th></tr></thead>
                        <tbody>{changes.map((change) => <ChangeTableRow change={change} key={change.path} />)}</tbody>
                      </table>
                    </div>
                  )}
                </section>

                <Card title="AI Decision Trace" description="ติดตามตั้งแต่คำแนะนำของ AI จนถึงการตัดสินใจของผู้เชี่ยวชาญ" action={<Badge tone="ai">AI Suggested</Badge>} id="ai-trace">
                  <div className="ad-ai-grid">
                    <Mini label="AI Feature" value="ICD-10 Suggestion" />
                    <Mini label="Model / Prompt Version" value="NexSure-Clinical-v3.2 · ICD-PROMPT-2.4" mono />
                    <div className="ad-mini"><label>Confidence Score</label><strong>91%</strong><div className="ad-confidence"><i /></div></div>
                    <Mini label="Safety Validation" value="Passed" success />
                    <Mini label="AI Recommendation" value="J06.9 — Acute upper respiratory infection, unspecified" />
                    <Mini label="Human Decision" value="Modified and Accepted by Dr. Narin" />
                    <Mini label="Override Reason" value="Updated diagnosis after physical examination findings." />
                    <Mini label="Processing Time" value="1,284 ms · 1,462 tokens" />
                  </div>
                  <div className="ad-disclaimer"><b>Decision Support Notice:</b> AI-generated recommendations require professional review and must not replace clinical judgment.<br />คำแนะนำจาก AI ต้องได้รับการตรวจสอบโดยผู้เชี่ยวชาญก่อนนำไปใช้</div>
                </Card>

                <ClaimTrace />
                <AccessTrace />
                <Timeline />
              </div>

              <aside className="ad-right">
                <ActorCard />
                <RiskCard />
                <EntitiesCard />
                <SourceCard />
                <ReviewCard note={note} setNote={setNote} addNote={addNote} />
                <IntegrityCard showToast={showToast} />
              </aside>
            </div>
          </div>
        </main>
      </div>

      <div className="ad-bottom-bar">
        <p>Last integrity verification: 10 Jul 2026, 14:25:39 ICT · Audit records are append-only · ข้อมูลต้นฉบับไม่สามารถแก้ไขได้</p>
        <div className="ad-bottom-actions">
          <button className="ad-btn" type="button" onClick={() => setModal("note")}>＋ Add Review Note</button>
          <button className="ad-btn ad-danger" type="button" onClick={() => showToast("Event flagged for review. ระบบได้ส่งรายการเข้าสู่ Compliance Review แล้ว")}>⚑ Flag for Review</button>
          <button className="ad-btn ad-primary" type="button" onClick={() => setModal("export")}>⇩ Export Evidence Package</button>
        </div>
      </div>

      <AuditModals modal={modal} setModal={setModal} showToast={showToast} />
      <div className={`ad-toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}

function FieldView({ field }: { field: Field }) {
  return <div className="ad-field"><label>{field.label}</label><div className={`ad-value ${field.mono ? "ad-mono" : ""}`}>{field.value}</div></div>;
}

function ChangeTableRow({ change }: { change: ChangeRow }) {
  return (
    <tr>
      <td><div className="ad-diff-field">{change.field}</div><small>{change.path}</small></td>
      <td><div className={`ad-old ${change.mono ? "ad-mono" : ""}`}>{change.previous}</div></td>
      <td><div className={`ad-new ${change.mono ? "ad-mono" : ""}`}>{change.next}</div></td>
      <td><Badge tone="updated">Updated</Badge></td>
    </tr>
  );
}

function Mini({ label, value, mono, success }: { label: string; value: string; mono?: boolean; success?: boolean }) {
  return <div className="ad-mini"><label>{label}</label><strong className={`${mono ? "ad-mono" : ""} ${success ? "ad-success" : ""}`}>{value}</strong></div>;
}

function ClaimTrace() {
  const rows = [
    ["SOAP Completeness", "18", "25", "25%"],
    ["Diagnosis & ICD", "15", "18", "20%"],
    ["Prescription", "12", "12", "15%"],
    ["Evidence", "10", "18", "20%"],
    ["Insurance Rule", "8", "8", "10%"],
    ["Economic", "9", "9", "10%"],
  ];
  return (
    <Card title="Claim Readiness Trace" description="แสดงการเปลี่ยนแปลงคะแนนและปัจจัยที่มีผลต่อความพร้อมส่งเคลม" action={<Badge tone="passed">Needs Review → Ready</Badge>}>
      <div className="ad-score-row ad-score-head"><span>Factor</span><span>Previous</span><span>New</span><span>Weight</span></div>
      {rows.map(([factor, previous, next, weight]) => <div className="ad-score-row" key={factor}><b>{factor}</b><span>{previous}</span><b className={previous !== next ? "ad-success" : ""}>{next}</b><span>{weight}</span></div>)}
    </Card>
  );
}

function AccessTrace() {
  const fields: Field[] = [
    { label: "Requested Action", value: "Update SOAP Note" },
    { label: "Resource", value: "VIS-20260710-0124", mono: true },
    { label: "Role / Permission", value: "Doctor · soap_note.update" },
    { label: "Clinic Scope", value: "CLINIC-001", mono: true },
    { label: "RLS Policy", value: "doctor_same_clinic_policy", mono: true },
    { label: "Decision Reason", value: "User belongs to the same clinic and is assigned to this visit." },
  ];
  return <Card title="Access Decision Trace" description="อธิบายเหตุผลการอนุญาตหรือปฏิเสธ โดยไม่เปิดเผย Security Rules ที่มีความอ่อนไหว" action={<Badge tone="passed">Allowed</Badge>}><div className="ad-grid2">{fields.map((field) => <FieldView field={field} key={field.label} />)}</div></Card>;
}

function Timeline() {
  return (
    <Card title="Related Event Timeline" description="ลำดับเหตุการณ์ที่เชื่อมโยงก่อนและหลัง Audit Event ปัจจุบัน" action={<div className="ad-tabs"><button className="active" type="button">All</button><button type="button">Entity</button><button type="button">Actor</button></div>}>
      <div className="ad-timeline">{timeline.map((event) => <div className={`ad-event ${event.current ? "current" : ""}`} key={event.time}><time>{event.time}</time><b>{event.title}</b><p>{event.description}</p></div>)}</div>
    </Card>
  );
}

function ActorCard() {
  return (
    <Card title="Actor & Access Context" description="ข้อมูลผู้ดำเนินการ บทบาท วิธี Authentication และขอบเขตการเข้าถึง">
      <div className="ad-actor-head"><div className="ad-avatar">NS</div><div><h3>Dr. Narin Sutham</h3><p>Doctor · Clinical Department</p></div><Badge tone="verified">MFA</Badge></div>
      <DetailList items={[["User ID", "USR-00492"], ["Organization", "NexSure Health Network"], ["Clinic", "Sukhumvit Clinic"], ["Authentication", "SSO + MFA"], ["Session ID", "SES-8F21••••"], ["Delegated Access", "No"]]} />
      <button className="ad-btn ad-full" type="button">View User Detail ↗</button>
    </Card>
  );
}

function RiskCard() {
  return (
    <Card title="Risk & Compliance Assessment" description="สรุปผลการตรวจสอบ Policy, Security Anomaly และ Compliance Risk" action={<Badge tone="medium">Medium Risk</Badge>} id="risk">
      <div className="ad-risk-circle"><b>42<small>/ 100</small></b></div>
      <div className="ad-risk-caption">ไม่พบความผิดปกติด้านความปลอดภัยระดับ Critical</div>
      {policies.map((policy) => <div className={`ad-policy ${policy.warning ? "warning" : ""}`} key={policy.title}><div className="ad-policy-icon">{policy.warning ? "!" : "✓"}</div><div><b>{policy.title}</b><p>{policy.description}</p></div></div>)}
    </Card>
  );
}

function EntitiesCard() {
  return <Card title="Related Entity Context" description="ข้อมูลอ้างอิงที่เกี่ยวข้องจะแสดงตามสิทธิ์และขอบเขตการเข้าถึง" id="entities">{entities.map((entity) => <div className="ad-entity" key={entity.title}><div className="ad-entity-icon">{entity.icon}</div><div><b>{entity.title}</b><span>{entity.subtitle}</span></div><button type="button">{entity.action}</button></div>)}</Card>;
}

function SourceCard() {
  return <Card title="Source, Device & Network" description="ข้อมูลอุปกรณ์และเครือข่ายถูก Mask ตาม Privacy Policy และสิทธิ์ผู้ใช้งาน"><DetailList items={[["Source", "Med AI NexSure Web"], ["Device", "Desktop · Windows 11"], ["Browser", "Chrome 150"], ["IP Address", "10.24.***.***"], ["Location", "Bangkok, Thailand"], ["Endpoint", "PATCH /api/soap-notes/123"], ["Response", "200 Success"]]} /></Card>;
}

function ReviewCard({ note, setNote, addNote }: { note: string; setNote: (value: string) => void; addNote: () => void }) {
  return (
    <Card title="Compliance Review Workflow" description="บันทึกการตรวจสอบแยกจาก Audit Event เดิมและไม่กระทบข้อมูลต้นฉบับ" action={<Badge tone="review">In Review</Badge>}>
      <div className="ad-review-step"><div><small>Assigned Reviewer</small><b>Sirin Chantarat</b></div><button className="ad-btn" type="button">Reassign</button></div>
      <select className="ad-select" aria-label="Review status"><option>In Review</option><option>Information Requested</option><option>Resolved</option><option>Escalated</option></select>
      <label className="ad-note-label">Review Note</label>
      <textarea className="ad-textarea" placeholder="ระบุเหตุผลหรือข้อสังเกตอย่างน้อย 10 ตัวอักษร..." value={note} onChange={(event) => setNote(event.target.value)} />
      <div className="ad-note-meta"><span>การเพิ่ม Note จะสร้าง Audit Event ใหม่โดยอัตโนมัติ</span><span>{note.length} / 5,000</span></div>
      <button className="ad-btn ad-primary ad-full" type="button" onClick={addNote}>Add Review Note</button>
    </Card>
  );
}

function IntegrityCard({ showToast }: { showToast: (message: string) => void }) {
  return (
    <Card title="Data Integrity Verification" description="ตรวจสอบความสมบูรณ์ของข้อมูลด้วย Append-only Hash Chain">
      <div className="ad-integrity"><div className="ad-integrity-top">✓ Record integrity verified</div><code>SHA-256: 7c82e2f84b5aa9c816e6f2a03f418267...e197</code><div>Verified 10 Jul 2026, 14:25:39 ICT · Hash Chain v2</div></div>
      <button className="ad-btn ad-full" type="button" onClick={() => showToast("Integrity verified successfully. ตรวจสอบความสมบูรณ์ของข้อมูลเรียบร้อยแล้ว")}>Verify Again</button>
    </Card>
  );
}

function DetailList({ items }: { items: [string, string][] }) {
  return <div className="ad-detail-list">{items.map(([label, value]) => <div className="ad-detail-item" key={label}><span>{label}</span><b className={label.includes("ID") || label === "Endpoint" || label === "IP Address" ? "ad-mono" : ""}>{value}</b></div>)}</div>;
}

function AuditModals({ modal, setModal, showToast }: { modal: ModalId | null; setModal: (modal: ModalId | null) => void; showToast: (message: string) => void }) {
  return (
    <>
      <div className={`ad-modal ${modal === "export" ? "open" : ""}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
        <div className="ad-modal-card"><div className="ad-card-head"><div><h2>Export Audit Evidence</h2><p>การ Export ข้อมูล PHI ต้องระบุเหตุผล และระบบจะสร้าง Audit Event ใหม่ทุกครั้ง</p></div><button className="ad-iconbtn" type="button" onClick={() => setModal(null)}>×</button></div><div className="ad-card-body"><label className="ad-note-label">Export Format</label><select className="ad-select"><option>PDF — Compliance Evidence</option><option>JSON — Complete Record</option><option>CSV — Field Changes</option></select><label className="ad-note-label">Data Version</label><select className="ad-select"><option>Redacted Version (Recommended)</option><option>Full Version — Step-up authentication required</option></select><label className="ad-note-label">Export Reason</label><textarea className="ad-textarea" placeholder="ระบุวัตถุประสงค์และเหตุผลที่ต้องการ Export ข้อมูล..." /><div className="ad-modal-actions"><button className="ad-btn" type="button" onClick={() => setModal(null)}>Cancel</button><button className="ad-btn ad-primary" type="button" onClick={() => { setModal(null); showToast("Evidence package generated. ระบบสร้าง Signed URL เรียบร้อยแล้ว"); }}>Generate Evidence</button></div></div></div>
      </div>
      <div className={`ad-modal ${modal === "actions" ? "open" : ""}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
        <div className="ad-modal-card ad-modal-small"><div className="ad-card-head"><h2>More Actions</h2><button className="ad-iconbtn" type="button" onClick={() => setModal(null)}>×</button></div><div className="ad-card-body ad-action-list"><button className="ad-btn" type="button">View Related Visit</button><button className="ad-btn" type="button">View Actor Activity</button><button className="ad-btn" type="button">Create Investigation</button><button className="ad-btn ad-danger" type="button">Escalate to Security Admin</button></div></div>
      </div>
      <div className={`ad-modal ${modal === "note" ? "open" : ""}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
        <div className="ad-modal-card"><div className="ad-card-head"><div><h2>Add Review Note</h2><p>ทุก Review Note จะสร้าง Audit Event ใหม่ พร้อมบันทึกผู้เขียนและเวลา</p></div><button className="ad-iconbtn" type="button" onClick={() => setModal(null)}>×</button></div><div className="ad-card-body"><select className="ad-select"><option>Compliance Review</option><option>General Note</option><option>Security Review</option><option>Investigation Note</option><option>Resolution</option></select><textarea className="ad-textarea ad-modal-note" placeholder="เพิ่มรายละเอียด ข้อสังเกต หรือผลการตรวจสอบ..." /><div className="ad-modal-actions"><button className="ad-btn" type="button" onClick={() => setModal(null)}>Cancel</button><button className="ad-btn ad-primary" type="button" onClick={() => { setModal(null); showToast("Review note saved successfully. บันทึกข้อมูลการตรวจสอบแล้ว"); }}>Save Note</button></div></div></div>
      </div>
    </>
  );
}

const auditDetailStyles = `
.ad-app,.ad-app *{box-sizing:border-box}.ad-app{display:grid;grid-template-columns:284px minmax(0,1fr);min-height:100vh;background:#F8FAFC;color:#0F172A;font-family:Inter,"Noto Sans Thai",ui-sans-serif,system-ui,sans-serif;font-size:18px;line-height:1.65}.ad-sidebar{position:fixed;inset:0 auto 0 0;width:284px;background:#0F2A5F;color:#fff;padding:26px 18px;display:flex;flex-direction:column;z-index:30}.ad-brand{display:flex;gap:13px;align-items:center;padding:0 10px 28px}.ad-brandmark{width:46px;height:46px;border-radius:14px;background:#2563EB;display:grid;place-items:center;font-weight:800;font-size:22px;box-shadow:0 8px 22px rgba(37,99,235,.28)}.ad-brand strong{font-size:18px}.ad-brand span{display:block;font-size:11px;color:#b9c8e7;margin-top:2px;line-height:1.4}.ad-navlabel{font-size:12px;color:#8fa7d2;letter-spacing:.12em;padding:10px 14px;text-transform:none}.ad-nav{display:grid;gap:7px}.ad-nav a{color:#d6e0f3;text-decoration:none;padding:13px 14px;border-radius:11px;display:flex;gap:12px;align-items:center;font-size:15px}.ad-nav a:hover,.ad-nav a.active{background:rgba(255,255,255,.12);color:#fff}.ad-nav a.active{background:rgba(37,99,235,.34);box-shadow:inset 3px 0 #38BDF8}.ad-ico{width:21px;text-align:center;font-size:17px}.ad-sidebar-foot{margin-top:auto;border-top:1px solid rgba(255,255,255,.12);padding:18px 10px 0}.ad-profile{display:flex;align-items:center;gap:12px}.ad-avatar{width:42px;height:42px;border-radius:50%;background:#dce8ff;color:#1E3A8A;display:grid;place-items:center;font-weight:700;font-size:16px;flex:0 0 auto}.ad-profile small{display:block;color:#9db1d7;font-size:12px}.ad-main{grid-column:2;min-width:0}.ad-topbar{height:78px;background:#fff;border-bottom:1px solid #E2E8F0;position:sticky;top:0;z-index:20;display:flex;align-items:center;padding:0 36px;gap:22px}.ad-search{flex:1;max-width:760px;position:relative}.ad-search input{width:100%;height:48px;border:1px solid #E2E8F0;border-radius:12px;background:#F8FAFC;padding:0 48px;color:#0F172A;font-size:16px}.ad-search:before{content:'⌕';position:absolute;left:16px;top:8px;font-size:26px;color:#64748B}.ad-topactions{margin-left:auto;display:flex;gap:8px;align-items:center}.ad-iconbtn,.ad-btn{border:1px solid #E2E8F0;background:#fff;border-radius:11px;min-height:46px;padding:10px 16px;color:#0F172A;display:inline-flex;align-items:center;justify-content:center;gap:9px;font-weight:600;font-size:15px;cursor:pointer}.ad-iconbtn{width:46px;padding:0}.ad-btn:hover,.ad-iconbtn:hover{border-color:#BFDBFE;background:#EFF6FF}.ad-primary{background:#1E3A8A;color:#fff;border-color:#1E3A8A;box-shadow:0 6px 14px rgba(30,58,138,.18)}.ad-primary:hover{background:#0F2A5F}.ad-danger{color:#DC2626;border-color:#efc5c5}.ad-content{width:100%;max-width:none;margin:0;padding:30px 36px 118px}.ad-breadcrumb{display:flex;gap:10px;color:#64748B;font-size:14px;margin-bottom:18px}.ad-breadcrumb b{color:#0F172A}.ad-audit-head{background:#fff;border:1px solid #E2E8F0;border-top:4px solid #1E3A8A;border-radius:18px;box-shadow:0 10px 30px rgba(15,42,95,.08);padding:28px 30px;margin-bottom:20px}.ad-head-row{display:flex;gap:26px;justify-content:space-between;align-items:flex-start}.ad-eyebrow{display:flex;align-items:center;gap:10px;font-size:14px;color:#64748B;font-weight:600}.ad-head-title{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:10px 0 8px}.ad-head-title h1{font-size:clamp(34px,3vw,46px);line-height:1.16;margin:0;letter-spacing:-.03em}.ad-head-sub{color:#64748B;font-size:16px;line-height:1.6}.ad-audit-id{margin-top:5px}.ad-head-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}.ad-badge{display:inline-flex;align-items:center;gap:7px;padding:7px 11px;border-radius:999px;font-size:13px;font-weight:700;border:1px solid transparent}.ad-badge:before{content:'';width:7px;height:7px;border-radius:50%;background:currentColor}.ad-medium,.ad-review{background:#fff7e6;color:#D97706;border-color:#f5d89e}.ad-verified,.ad-passed{background:#ecfdf5;color:#059669;border-color:#b9ead7}.ad-ai,.ad-updated{background:#EFF6FF;color:#2563EB;border-color:#BFDBFE}.ad-fail{background:#fff1f1;color:#DC2626}.ad-readonly{margin-top:20px;border-top:1px solid #E2E8F0;padding-top:16px;display:flex;align-items:center;justify-content:space-between;gap:20px;color:#64748B;font-size:14px}.ad-readonly strong{color:#1E3A8A}.ad-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.ad-copy{border:0;background:transparent;color:#2563EB;padding:2px 4px;cursor:pointer}.ad-kpis{display:grid;grid-template-columns:repeat(6,minmax(170px,1fr));gap:16px;margin-bottom:20px}.ad-kpi{background:#fff;border:1px solid #E2E8F0;border-radius:15px;padding:20px;min-height:142px;transition:.2s;cursor:pointer}.ad-kpi:first-child{border-top:3px solid #D97706}.ad-kpi:nth-child(4){border-top:3px solid #1E3A8A}.ad-kpi:nth-child(5){border-top:3px solid #2563EB}.ad-kpi:nth-child(6){border-top:3px solid #059669}.ad-kpi:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(15,42,95,.08);border-color:#BFDBFE}.ad-kpi-top{display:flex;justify-content:space-between;color:#64748B;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}.ad-kpi-icon{width:36px;height:36px;border-radius:10px;background:#EFF6FF;border:1px solid #BFDBFE;display:grid;place-items:center;color:#2563EB;font-size:16px}.ad-kpi-value{font-size:30px;font-weight:800;margin-top:16px;letter-spacing:-.03em}.ad-kpi-foot{color:#64748B;font-size:13px;margin-top:7px;line-height:1.5}.ad-riskbar{height:7px;background:#edf1f7;border-radius:8px;margin-top:11px;overflow:hidden}.ad-riskbar i{display:block;width:42%;height:100%;background:#e5a52f}.ad-layout{display:grid;grid-template-columns:minmax(0,2.1fr) minmax(390px,.9fr);gap:20px}.ad-left,.ad-right{display:grid;gap:20px;align-content:start}.ad-right{position:sticky;top:94px}.ad-card{background:#fff;border:1px solid #E2E8F0;border-radius:18px;box-shadow:0 3px 16px rgba(15,42,95,.035);overflow:hidden}.ad-card-head{padding:22px 24px;border-bottom:1px solid #E2E8F0;display:flex;justify-content:space-between;gap:16px;align-items:center;background:linear-gradient(180deg,#fff 0%,#FBFDFF 100%)}.ad-card-head h2{font-size:21px;line-height:1.2;margin:0}.ad-card-head p{font-size:13px;color:#64748B;margin:3px 0 0}.ad-card-body{padding:22px 24px}.ad-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 32px}.ad-field label{display:block;color:#64748B;font-size:13px;margin-bottom:5px}.ad-value{font-weight:600;font-size:15px;overflow-wrap:anywhere}.ad-tabs{display:flex;gap:4px;background:#f2f5fa;padding:4px;border-radius:9px}.ad-tabs button{border:0;background:transparent;padding:7px 11px;border-radius:7px;font-size:13px;font-weight:700;color:#64748B;cursor:pointer}.ad-tabs button.active{background:#fff;color:#1E3A8A;box-shadow:0 1px 4px rgba(15,42,95,.14)}.ad-filter-row{padding:14px 24px;border-bottom:1px solid #E2E8F0;display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap}.ad-filter-row span{font-size:13px;color:#64748B}.ad-filters{display:flex;gap:5px;flex-wrap:wrap}.ad-chip{border:1px solid #E2E8F0;background:#fff;color:#64748B;border-radius:999px;padding:7px 11px;font-size:13px;cursor:pointer}.ad-chip.active{background:#EFF6FF;border-color:#BFDBFE;color:#1E3A8A;font-weight:700}.ad-table-wrap{overflow:auto}.ad-diff-table{width:100%;border-collapse:collapse}.ad-diff-table th{background:#f8fafc;color:#64748B;font-size:12px;text-transform:uppercase;letter-spacing:.06em;text-align:left;padding:13px 16px;border-bottom:1px solid #E2E8F0}.ad-diff-table td{padding:15px 16px;border-bottom:1px solid #edf1f5;vertical-align:top;font-size:14px}.ad-diff-table tr:last-child td{border-bottom:0}.ad-diff-field{font-weight:700}.ad-old,.ad-new{padding:10px 12px;border-radius:8px;white-space:pre-wrap}.ad-old{background:#FEF2F2;border-left:3px solid #DC2626}.ad-new{background:#ECFDF5;border-left:3px solid #059669}.ad-json-view{background:#0F2A5F;color:#EFF6FF;padding:22px 24px;font:14px/1.7 ui-monospace,monospace;overflow:auto;margin:0}.ad-ai-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ad-mini{border:1px solid #E2E8F0;border-radius:10px;padding:15px}.ad-mini label{display:block;font-size:12px;color:#64748B;margin-bottom:6px;text-transform:uppercase}.ad-mini strong{font-size:14px}.ad-confidence{height:7px;background:#e8eef7;border-radius:99px;margin-top:7px;overflow:hidden}.ad-confidence i{display:block;width:91%;height:100%;background:#2563EB}.ad-disclaimer{margin-top:15px;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:9px;padding:13px;color:#1E3A8A;font-size:13px}.ad-success{color:#059669}.ad-score-row{display:grid;grid-template-columns:1.4fr .6fr .6fr .6fr;gap:8px;padding:11px 0;border-bottom:1px solid #edf1f5;align-items:center;font-size:14px}.ad-score-row:last-child{border-bottom:0}.ad-score-head{color:#64748B;font-size:12px;font-weight:700;text-transform:uppercase}.ad-timeline{position:relative;padding-left:25px}.ad-timeline:before{content:'';position:absolute;left:7px;top:6px;bottom:8px;width:2px;background:#dce5f2}.ad-event{position:relative;padding:0 0 20px 10px}.ad-event:before{content:'';position:absolute;left:-23px;top:4px;width:10px;height:10px;border:3px solid #fff;background:#9eb2cf;border-radius:50%;box-shadow:0 0 0 2px #c9d6e8}.ad-event.current{background:#EFF6FF;border:1px solid #BFDBFE;border-radius:9px;padding:12px 14px 12px 20px;margin:0 0 16px -10px}.ad-event.current:before{left:-14px;top:14px;background:#2563EB;box-shadow:0 0 0 3px #BFDBFE}.ad-event time{color:#64748B;font-size:12px}.ad-event b{display:block;font-size:14px;margin:3px 0}.ad-event p{margin:0;color:#64748B;font-size:13px}.ad-actor-head{display:flex;gap:12px;align-items:center;margin-bottom:15px}.ad-actor-head .ad-avatar{width:46px;height:46px}.ad-actor-head h3{font-size:16px;margin:0}.ad-actor-head p{color:#64748B;font-size:13px;margin:2px 0 0}.ad-actor-head .ad-badge{margin-left:auto}.ad-detail-list{display:grid;gap:10px}.ad-detail-item{display:flex;justify-content:space-between;gap:16px;font-size:13px}.ad-detail-item span{color:#64748B}.ad-detail-item b{text-align:right}.ad-full{width:100%;margin-top:15px}.ad-risk-circle{width:92px;height:92px;border-radius:50%;background:conic-gradient(#e6a62f 0 42%,#edf1f6 42%);display:grid;place-items:center;margin:auto;position:relative}.ad-risk-circle:before{content:'';width:68px;height:68px;border-radius:50%;background:#fff;position:absolute}.ad-risk-circle b{z-index:1;font-size:22px;text-align:center}.ad-risk-circle small{font-size:9px;display:block;color:#64748B}.ad-risk-caption{text-align:center;font-size:13px;color:#64748B;margin:9px 0 16px}.ad-policy{display:flex;align-items:flex-start;gap:9px;padding:10px 0;border-bottom:1px solid #edf1f5}.ad-policy:last-child{border-bottom:0}.ad-policy-icon{width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:10px;font-weight:800;background:#ecfdf5;color:#059669;flex:0 0 auto}.ad-policy.warning .ad-policy-icon{background:#fff7e6;color:#D97706}.ad-policy b{font-size:13px;display:block}.ad-policy p{font-size:12px;color:#64748B;margin:2px 0 0}.ad-entity{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #edf1f5}.ad-entity:last-child{border-bottom:0}.ad-entity-icon{width:32px;height:32px;border-radius:9px;background:#EFF6FF;color:#1E3A8A;border:1px solid #BFDBFE;display:grid;place-items:center}.ad-entity b{font-size:13px;display:block}.ad-entity span{font-size:12px;color:#64748B}.ad-entity button{margin-left:auto;border:0;background:transparent;color:#2563EB;font-size:13px;font-weight:700;cursor:pointer}.ad-review-step{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}.ad-review-step small{color:#64748B}.ad-review-step b{display:block;font-size:14px}.ad-select,.ad-textarea{border:1px solid #E2E8F0;border-radius:9px;background:#fff;color:#0F172A;font-size:15px}.ad-select{height:42px;padding:0 10px;width:100%;margin:6px 0 14px}.ad-textarea{width:100%;min-height:88px;padding:10px;resize:vertical}.ad-note-label{display:block;font-size:13px;font-weight:700;margin:13px 0 6px}.ad-note-meta{display:flex;justify-content:space-between;color:#64748B;font-size:12px;margin-top:6px}.ad-integrity{background:#ECFDF5;border:1px solid #bce8d5;border-radius:10px;padding:13px}.ad-integrity-top{display:flex;align-items:center;gap:9px;color:#059669;font-weight:700;font-size:14px}.ad-integrity code{display:block;background:#fff;border:1px solid #d9eee5;border-radius:7px;padding:8px;margin-top:9px;color:#49615a;font-size:11px;word-break:break-all}.ad-integrity div:last-child{font-size:12px;color:#64748B;margin-top:7px}.ad-bottom-bar{position:fixed;left:284px;right:0;bottom:0;min-height:66px;background:rgba(255,255,255,.96);backdrop-filter:blur(12px);border-top:1px solid #E2E8F0;z-index:25;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px 36px}.ad-bottom-bar p{font-size:13px;color:#64748B;margin:0}.ad-bottom-actions{display:flex;gap:8px;flex-wrap:wrap}.ad-modal{position:fixed;inset:0;background:rgba(15,42,95,.58);display:none;align-items:center;justify-content:center;z-index:100;padding:20px}.ad-modal.open{display:flex}.ad-modal-card{background:#fff;border-radius:16px;width:min(520px,100%);box-shadow:0 30px 80px rgba(0,0,0,.28);overflow:hidden}.ad-modal-small{width:min(390px,100%)}.ad-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}.ad-action-list{display:grid;gap:8px}.ad-modal-note{margin-top:12px}.ad-toast{position:fixed;right:24px;bottom:84px;background:#0F2A5F;color:#fff;border-radius:10px;padding:12px 16px;font-size:14px;opacity:0;transform:translateY(10px);transition:.25s;z-index:120;pointer-events:none}.ad-toast.show{opacity:1;transform:none}:focus-visible{outline:3px solid rgba(56,189,248,.45);outline-offset:2px}.ad-select:focus,.ad-textarea:focus,.ad-search input:focus{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.12);outline:none}#ai-trace{border-color:#BFDBFE}#ai-trace>.ad-card-head{background:#EFF6FF}@media(max-width:1250px){.ad-kpis{grid-template-columns:repeat(3,1fr)}.ad-layout{grid-template-columns:1fr}.ad-right{position:static;grid-template-columns:repeat(2,1fr)}.ad-bottom-bar{left:284px}}@media(max-width:850px){.ad-app{display:block}.ad-sidebar{transform:translateX(-100%)}.ad-main{grid-column:auto}.ad-content{padding:16px 15px 95px}.ad-topbar{padding:0 15px}.ad-head-row{display:block}.ad-head-actions{justify-content:flex-start;margin-top:16px}.ad-kpis{grid-template-columns:repeat(2,1fr)}.ad-grid2,.ad-ai-grid,.ad-right{grid-template-columns:1fr}.ad-bottom-bar{left:0;padding:10px 15px}.ad-bottom-bar p{display:none}.ad-diff-table th:nth-child(2),.ad-diff-table td:nth-child(2){display:none}.ad-search{display:none}}@media(max-width:520px){.ad-app{font-size:14px}.ad-kpis{grid-template-columns:1fr 1fr}.ad-kpi{min-height:100px;padding:13px}.ad-head-title h1{font-size:21px}.ad-audit-head{padding:18px}.ad-head-actions .ad-btn:nth-child(2){display:none}.ad-bottom-actions .ad-btn:not(.ad-primary){display:none}.ad-score-row{grid-template-columns:1.5fr .6fr .6fr}.ad-score-row span:last-child{display:none}.ad-card-head{align-items:flex-start;flex-direction:column}.ad-tabs{width:100%}.ad-tabs button{flex:1}.ad-diff-table th,.ad-diff-table td{padding:10px 8px}}
.ad-kpi-amber{color:#D97706}.ad-kpi-ai{font-size:17px;color:#2563EB}.ad-amber-text{color:#D97706}
`;
