"use client";

type BadgeTone = "ready" | "review" | "not-ready" | "draft" | "exported" | "ai";

type Kpi = {
  label: string;
  value: string;
  trend: string;
};

type SnapshotRow = {
  label: string;
  value: string;
  tone?: "warning" | "critical" | "success";
  badgeTone?: BadgeTone;
};

type SnapshotCard = {
  title: string;
  description: string;
  rows: SnapshotRow[];
};

type ContextItem = {
  label: string;
  value: string;
  badgeTone?: BadgeTone;
};

type EvidenceSection = {
  title: string;
  description: string;
  action?: string;
  badge?: string;
  badgeTone?: BadgeTone;
  body: string | string[];
};

type TimelineItem = {
  time: string;
  title: string;
  source: string;
  actor: string;
  tone: BadgeTone;
};

type WorklistItem = {
  patient: string;
  helper?: string;
  visitDate: string;
  visitStatus: string;
  visitTone: BadgeTone;
  claimReadiness: number;
  evidenceQuality: number;
  packageStatus: string;
  packageTone: BadgeTone;
  missingEvidence: string[];
  missingTone?: BadgeTone;
  costStatus: string;
  costTone: BadgeTone;
  lastUpdated: string;
  actions: { label: string; style: "primary" | "secondary" | "ghost" }[];
};

const navigationGroups = [
  {
    title: "Clinical Operations",
    items: ["Patient Management", "Visit Management", "SOAP Note", "Prescription"],
  },
  {
    title: "Insurance Intelligence",
    items: ["Claim Readiness", "Evidence Package", "Payer Rules"],
  },
  {
    title: "AI Intelligence",
    items: ["AI Copilot", "AI Clinical Insight", "AI Recommendation Center"],
  },
  {
    title: "Business Intelligence",
    items: ["Economic Intelligence", "Executive Dashboard"],
  },
  {
    title: "Governance",
    items: ["Audit & Compliance", "Admin Settings"],
  },
];

const kpis: Kpi[] = [
  { label: "Today Visits", value: "128", trend: "▲ 12% from yesterday" },
  { label: "Claim Submission Readiness", value: "86%", trend: "▲ 8% improved" },
  { label: "AI-assisted Documentation", value: "42", trend: "AI summary generated" },
  { label: "Average Evidence Quality Score", value: "91", trend: "Enterprise-ready level" },
];

const snapshots: SnapshotCard[] = [
  {
    title: "Queue Snapshot",
    description: "ภาพรวม Visit และเคสที่รอเอกสาร",
    rows: [
      { label: "Waiting", value: "18" },
      { label: "In Consultation", value: "24" },
      { label: "Pending Evidence", value: "16", tone: "warning" },
      { label: "Completed", value: "70" },
    ],
  },
  {
    title: "Claim Readiness Overview",
    description: "สถานะความพร้อมก่อนจัดชุด Evidence",
    rows: [
      { label: "Ready", value: "64", badgeTone: "ready" },
      { label: "Needs Review", value: "38", badgeTone: "review" },
      { label: "Not Ready", value: "26", badgeTone: "not-ready" },
    ],
  },
  {
    title: "Economic Intelligence",
    description: "ตรวจค่าใช้จ่ายผิดปกติก่อนส่งประกัน",
    rows: [
      { label: "Average Visit Cost", value: "฿2,850" },
      { label: "Cost Alert Cases", value: "7", tone: "critical" },
      { label: "Normal Cost Cases", value: "121", tone: "success" },
    ],
  },
];

const patientContext: ContextItem[] = [
  { label: "HN", value: "HN-240189" },
  { label: "Patient", value: "Male, 42 yrs" },
  { label: "Visit ID", value: "VIS-2026-0081" },
  { label: "Doctor", value: "Dr. Anan" },
  { label: "Claim Status", value: "Ready", badgeTone: "ready" },
  { label: "Package Status", value: "Review Needed", badgeTone: "review" },
];

const evidenceSections: EvidenceSection[] = [
  {
    title: "Insurance Claim Summary",
    description: "สรุปเหตุผลการรักษาและข้อมูลประกอบการเคลม",
    badge: "AI Generated",
    badgeTone: "ai",
    body: "Patient presented with acute upper respiratory symptoms. Clinical assessment supports acute pharyngitis with prescribed symptomatic treatment. ICD-10 and prescription records are aligned with claim readiness requirements.",
  },
  {
    title: "SOAP Evidence",
    description: "ข้อมูลทางคลินิกแบบ Read-only แก้ไขที่ Visit Detail",
    action: "Edit in Visit Detail",
    body: [
      "Subjective|Fever, sore throat, mild cough for 2 days.",
      "Objective|Temp 38.1°C, throat erythema, no respiratory distress.",
      "Assessment|Acute pharyngitis, low complication risk.",
      "Plan|Medication, hydration, follow-up if symptoms persist.",
    ],
  },
  {
    title: "Diagnosis & ICD",
    description: "รหัสวินิจฉัยสำหรับตรวจสอบความถูกต้องของเคลม",
    badge: "Complete",
    badgeTone: "ready",
    body: "Primary Diagnosis|Acute pharyngitis — ICD-10: J02.9\nProcedure Code: Not applicable",
  },
  {
    title: "Prescription Evidence",
    description: "รายการยา วิธีใช้ จำนวน และ Safety Note",
    badge: "Safety Passed",
    badgeTone: "ready",
    body: "Paracetamol 500mg — 1 tab every 6 hours as needed, 10 tablets\nChlorpheniramine 4mg — 1 tab before bedtime, 5 tablets\nSafety Note: No allergy alert detected.",
  },
  {
    title: "Medical Certificate",
    description: "ใบรับรองแพทย์สำหรับแนบชุด Evidence",
    action: "Generate Medical Certificate",
    body: "Certificate status: Draft available. Electronic Signature Ready.",
  },
  {
    title: "Supporting Evidence",
    description: "ไฟล์แนบ เช่น Lab, Image, Consent, Referral",
    action: "Upload Supporting Document",
    body: "Lab_Result_240189.pdf · Consent_Form.png · Referral_Note.pdf",
  },
  {
    title: "Economic Summary",
    description: "ตรวจสอบความสมเหตุสมผลของค่าใช้จ่าย",
    badge: "Cost Justification Required",
    badgeTone: "review",
    body: "Visit Cost: ฿4,250\nExpected Range: ฿1,800–฿3,200\nCost Drivers: Lab, Medication\nRequired Action: Add Cost Justification before export.",
  },
];

const timelineItems: TimelineItem[] = [
  { time: "10:42", title: "Evidence Generated", source: "Insurance Claim Summary created", actor: "AI", tone: "ai" },
  { time: "10:38", title: "SOAP Updated", source: "Clinical note updated by doctor", actor: "Doctor", tone: "draft" },
  { time: "10:31", title: "ICD Added", source: "ICD-10 J02.9 added", actor: "Doctor", tone: "draft" },
  { time: "10:25", title: "Attachment Uploaded", source: "Lab result uploaded", actor: "Nurse", tone: "draft" },
];

const worklist: WorklistItem[] = [
  {
    patient: "HN-240189",
    helper: "Masked patient view",
    visitDate: "07 Jul 2026",
    visitStatus: "Pending Evidence",
    visitTone: "review",
    claimReadiness: 92,
    evidenceQuality: 96,
    packageStatus: "Ready to Export",
    packageTone: "ready",
    missingEvidence: ["Cost Review"],
    missingTone: "review",
    costStatus: "Alert",
    costTone: "review",
    lastUpdated: "10:42",
    actions: [
      { label: "View Package", style: "primary" },
      { label: "Visit Detail", style: "secondary" },
    ],
  },
  {
    patient: "HN-240191",
    visitDate: "07 Jul 2026",
    visitStatus: "Completed",
    visitTone: "ready",
    claimReadiness: 98,
    evidenceQuality: 96,
    packageStatus: "Exported",
    packageTone: "exported",
    missingEvidence: ["-"],
    costStatus: "Normal",
    costTone: "ready",
    lastUpdated: "10:18",
    actions: [
      { label: "Download", style: "secondary" },
      { label: "Audit", style: "ghost" },
    ],
  },
  {
    patient: "HN-240205",
    visitDate: "07 Jul 2026",
    visitStatus: "Pending Evidence",
    visitTone: "review",
    claimReadiness: 68,
    evidenceQuality: 62,
    packageStatus: "Not Ready",
    packageTone: "not-ready",
    missingEvidence: ["ICD Missing", "SOAP Incomplete"],
    missingTone: "not-ready",
    costStatus: "Normal",
    costTone: "ready",
    lastUpdated: "09:55",
    actions: [
      { label: "Review", style: "secondary" },
      { label: "Visit Detail", style: "secondary" },
    ],
  },
];

function StatusBadge({ children, tone }: { children: string; tone: BadgeTone }) {
  return <span className={`evidence-badge ${tone}`}>{children}</span>;
}

function Button({ children, variant = "secondary" }: { children: string; variant?: "primary" | "secondary" | "ai" | "ghost" }) {
  return (
    <button className={`evidence-button ${variant}`} type="button">
      {children}
    </button>
  );
}

function Sidebar() {
  return (
    <aside className="evidence-sidebar" aria-label="Main navigation">
      <div className="evidence-brand">
        Med AI NexSure
        <small>Enterprise Healthcare & Insurance Intelligence Platform</small>
      </div>

      {navigationGroups.map((group) => (
        <div className="evidence-domain" key={group.title}>
          <h2>{group.title}</h2>
          {group.items.map((item) => (
            <div className={`evidence-nav-item ${item === "Evidence Package" ? "active" : ""}`} key={item}>
              {item}
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}

function PageHeader() {
  return (
    <section className="evidence-header" aria-labelledby="evidence-page-title">
      <div>
        <div className="evidence-eyebrow">Insurance Intelligence / Evidence Assembly Workspace</div>
        <h1 id="evidence-page-title">Evidence Package Page</h1>
        <p className="evidence-thai">
          หน้ารวบรวมหลักฐาน เอกสารทางการแพทย์ และข้อมูลประกอบการเคลม พร้อมตรวจสอบก่อน Export PDF
        </p>
      </div>

      <div className="evidence-actions">
        <Button>View Claim Readiness</Button>
        <Button>Visit Detail</Button>
        <Button variant="ai">Generate Claim Summary</Button>
        <Button variant="primary">Export Evidence Package</Button>
      </div>
    </section>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <article className="evidence-card">
      <div className="evidence-kpi-label">{kpi.label}</div>
      <div className="evidence-kpi-value">{kpi.value}</div>
      <div className="evidence-trend">{kpi.trend}</div>
    </article>
  );
}

function SnapshotCard({ card }: { card: SnapshotCard }) {
  return (
    <article className="evidence-card">
      <h3>{card.title}</h3>
      <p className="evidence-thai">{card.description}</p>
      {card.rows.map((row) => (
        <div className="evidence-status-row" key={row.label}>
          {row.badgeTone ? <StatusBadge tone={row.badgeTone}>{row.label}</StatusBadge> : <span>{row.label}</span>}
          <strong className={row.tone ? `value-${row.tone}` : undefined}>{row.value}</strong>
        </div>
      ))}
    </article>
  );
}

function PatientContext() {
  return (
    <section className="evidence-patient-context" aria-label="Patient and visit context">
      {patientContext.map((item) => (
        <article className="evidence-context-item" key={item.label}>
          <small>{item.label}</small>
          <strong>{item.badgeTone ? <StatusBadge tone={item.badgeTone}>{item.value}</StatusBadge> : item.value}</strong>
        </article>
      ))}
    </section>
  );
}

function MiniBox({ content }: { content: string }) {
  const [title, ...body] = content.split("|");
  return (
    <div className="evidence-mini-box">
      {body.length > 0 ? (
        <>
          <strong>{title}</strong>
          {body.join("|").split("\n").map((line) => (
            <span key={line}>{line}</span>
          ))}
        </>
      ) : (
        content.split("\n").map((line) => <span key={line}>{line}</span>)
      )}
    </div>
  );
}

function EvidenceSectionCard({ section }: { section: EvidenceSection }) {
  const body = section.body;

  return (
    <article className="evidence-section-card">
      <div className="evidence-section-head">
        <div>
          <h3>{section.title}</h3>
          <p className="evidence-thai">{section.description}</p>
        </div>
        {section.badge && section.badgeTone ? <StatusBadge tone={section.badgeTone}>{section.badge}</StatusBadge> : null}
        {section.action ? <Button variant={section.action.startsWith("Edit") ? "ghost" : "secondary"}>{section.action}</Button> : null}
      </div>

      {Array.isArray(body) ? (
        <div className="evidence-soap-grid">
          {body.map((item) => (
            <MiniBox content={item} key={item} />
          ))}
        </div>
      ) : (
        <MiniBox content={body} />
      )}

      {section.title === "Insurance Claim Summary" ? (
        <div className="evidence-disclaimer">
          AI-generated content requires clinician review prior to claim submission.
          <br />
          AI ช่วยสรุปข้อมูลเบื้องต้น ผู้ใช้งานต้องตรวจสอบก่อนใช้งานจริง
        </div>
      ) : null}
    </article>
  );
}

function ReadinessPanel() {
  return (
    <aside className="evidence-sticky" aria-label="Evidence readiness controls">
      <article className="evidence-card evidence-export-readiness-card">
        <div className="evidence-panel-heading success">
          <span aria-hidden="true">●</span>
          <div>
            <h3>Export Readiness</h3>
            <p>สถานะความพร้อมก่อน Export Evidence Package</p>
          </div>
        </div>

        <div className="evidence-readiness-score">96%</div>
        <StatusBadge tone="ready">Ready to Export</StatusBadge>

        <div className="evidence-bar success-bar" aria-label="Readiness score 96 percent">
          <span style={{ width: "96%" }} />
        </div>

        <div className="evidence-success-message">
          No critical issue detected. Package is ready for PDF preview and export.
          <br />
          เอกสารพร้อมสำหรับตรวจสอบตัวอย่างและ Export
        </div>

        <div className="evidence-export-actions">
          <Button>Preview PDF</Button>
          <Button variant="primary">Export Evidence Package</Button>
        </div>
      </article>

      <article className="evidence-card evidence-checklist-card">
        <div className="evidence-panel-heading blue">
          <span aria-hidden="true">●</span>
          <div>
            <h3>Evidence Validation Checklist</h3>
            <p>ตรวจสอบเอกสารสำคัญก่อนส่งประกัน</p>
          </div>
        </div>

        <div className="evidence-checklist">
          {["Claim Summary", "SOAP Note", "Diagnosis & ICD", "Prescription", "Medical Certificate"].map((item) => (
            <div className="evidence-check blue-check" key={item}>
              <span>{item}</span>
              <strong>✓</strong>
            </div>
          ))}
          <div className="evidence-check blue-check warning-item">
            <span>Cost Justification</span>
            <strong>Review</strong>
          </div>
        </div>
      </article>

      <article className="evidence-card evidence-ai-recommendation-card">
        <div className="evidence-panel-heading purple">
          <span aria-hidden="true">●</span>
          <div>
            <h3>AI Recommendation</h3>
            <p>ข้อเสนอแนะจาก AI เพื่อเพิ่มความสมบูรณ์ของเอกสาร</p>
          </div>
        </div>

        <div className="evidence-ai-priority">
          <StatusBadge tone="ai">High Priority</StatusBadge>
          <span className="evidence-confidence">Confidence 92%</span>
        </div>

        <div className="evidence-ai-box">
          <strong>Recommended Next Action</strong>
          <p>Review cost justification and confirm medical certificate before final export.</p>
          <small>
            AI-generated content requires clinician review prior to claim submission. AI ช่วยสรุปข้อมูลเบื้องต้น
            ผู้ใช้งานต้องตรวจสอบก่อนใช้งานจริง
          </small>
        </div>

        <Button variant="ai">Open Source Reference</Button>
      </article>
    </aside>
  );
}

function Timeline() {
  return (
    <section className="evidence-card">
      <div className="evidence-timeline">
        {timelineItems.map((item) => (
          <article className="evidence-time-item" key={`${item.time}-${item.title}`}>
            <div className="evidence-time">{item.time}</div>
            <div>
              <strong>{item.title}</strong>
              <div className="evidence-source">{item.source}</div>
            </div>
            <StatusBadge tone={item.tone}>{item.actor}</StatusBadge>
          </article>
        ))}
      </div>
    </section>
  );
}

function OperationalWorklist() {
  return (
    <div className="evidence-table-wrap">
      <table className="evidence-table">
        <thead>
          <tr>
            <th>HN / Patient</th>
            <th>Visit Date</th>
            <th>Visit Status</th>
            <th>Claim Readiness</th>
            <th>Evidence Quality</th>
            <th>Package Status</th>
            <th>Missing Evidence</th>
            <th>Cost Status</th>
            <th>Last Updated</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {worklist.map((item) => (
            <tr key={`${item.patient}-${item.lastUpdated}`}>
              <td>
                {item.patient}
                {item.helper ? (
                  <>
                    <br />
                    <span className="evidence-thai">{item.helper}</span>
                  </>
                ) : null}
              </td>
              <td>{item.visitDate}</td>
              <td>
                <StatusBadge tone={item.visitTone}>{item.visitStatus}</StatusBadge>
              </td>
              <td>{item.claimReadiness}</td>
              <td>{item.evidenceQuality}</td>
              <td>
                <StatusBadge tone={item.packageTone}>{item.packageStatus}</StatusBadge>
              </td>
              <td>
                {item.missingEvidence.map((missing) =>
                  item.missingTone && missing !== "-" ? (
                    <StatusBadge tone={item.missingTone} key={missing}>
                      {missing}
                    </StatusBadge>
                  ) : (
                    <span key={missing}>{missing}</span>
                  ),
                )}
              </td>
              <td>
                <StatusBadge tone={item.costTone}>{item.costStatus}</StatusBadge>
              </td>
              <td>{item.lastUpdated}</td>
              <td>
                <div className="evidence-row-actions">
                  {item.actions.map((action) => (
                    <Button key={action.label} variant={action.style}>
                      {action.label}
                    </Button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComplianceCards() {
  return (
    <section className="evidence-grid-3">
      <article className="evidence-card">
        <h3>Audit Alerts</h3>
        <p className="evidence-thai">แจ้งเตือนกิจกรรมที่ต้องตรวจสอบ</p>
        <div className="evidence-status-row">
          <span>Blocked Export</span>
          <strong className="value-critical">3</strong>
        </div>
        <div className="evidence-status-row">
          <span>Missing Consent</span>
          <strong className="value-warning">2</strong>
        </div>
      </article>

      <article className="evidence-card">
        <h3>Export History</h3>
        <p className="evidence-thai">ประวัติการ Export PDF และ Version</p>
        <div className="evidence-status-row">
          <span>Latest Version</span>
          <strong>v3</strong>
        </div>
        <div className="evidence-status-row">
          <span>Exported By</span>
          <strong>Clinic Admin</strong>
        </div>
      </article>

      <article className="evidence-card">
        <h3>Compliance Status</h3>
        <p className="evidence-thai">PDPA, Audit Trail และ Access Control</p>
        <div className="evidence-status-row">
          <span>PDPA Consent</span>
          <StatusBadge tone="ready">Verified</StatusBadge>
        </div>
        <div className="evidence-status-row">
          <span>Audit Trail</span>
          <StatusBadge tone="ready">Enabled</StatusBadge>
        </div>
      </article>
    </section>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="evidence-section-title">{children}</h2>;
}

export function EvidencePackagePage() {
  return (
    <>
      <style>{`
        .evidence-app{--primary:#1E3A8A;--executive:#0F2A5F;--ai:#2563EB;--purple:#7C3AED;--bg:#F8FAFC;--card:#FFFFFF;--border:#E2E8F0;--text:#0F172A;--muted:#64748B;--success:#16A34A;--warning:#D97706;--critical:#DC2626;--blue-soft:#EFF6FF;--green-soft:#F0FDF4;--amber-soft:#FFFBEB;--red-soft:#FEF2F2;--purple-soft:#F5F3FF;--shadow:0 18px 44px rgba(15,42,95,.08);display:grid;grid-template-columns:280px minmax(0,1fr);min-height:100vh;background:var(--bg);color:var(--text);font-family:Inter,Segoe UI,Arial,sans-serif}.evidence-app *{box-sizing:border-box}.evidence-sidebar{background:linear-gradient(180deg,var(--executive),#102A56);color:white;padding:26px 20px;position:sticky;top:0;height:100vh;overflow:auto}.evidence-brand{font-size:22px;font-weight:900;letter-spacing:-.04em}.evidence-brand small{display:block;margin-top:5px;font-size:12px;color:#BFDBFE;line-height:1.5}.evidence-domain{margin-top:28px}.evidence-domain h2{margin:0 0 10px;font-size:11px;color:#93C5FD;text-transform:uppercase;letter-spacing:.13em}.evidence-nav-item{padding:11px 12px;border-radius:12px;color:#DBEAFE;font-size:14px;margin-bottom:5px}.evidence-nav-item.active{background:rgba(255,255,255,.15);color:white;font-weight:800}.evidence-main{padding:30px;min-width:0}.evidence-header{background:linear-gradient(135deg,#FFFFFF,#EFF6FF);border:1px solid var(--border);border-radius:26px;padding:30px;box-shadow:var(--shadow);display:flex;justify-content:space-between;gap:20px}.evidence-eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:var(--ai);font-weight:900}.evidence-header h1{margin:8px 0;font-size:34px;color:var(--executive);letter-spacing:-.045em}.evidence-thai{color:var(--muted);font-size:14px;line-height:1.6;margin:0}.evidence-actions{display:flex;gap:10px;flex-wrap:wrap;align-content:flex-start}.evidence-button{border:0;border-radius:12px;padding:11px 16px;font-size:13px;font-weight:800;cursor:pointer;line-height:1.1}.evidence-button.primary{background:var(--primary);color:white}.evidence-button.secondary{background:white;color:var(--primary);border:1px solid var(--border)}.evidence-button.ai{background:var(--purple);color:white}.evidence-button.ghost{background:transparent;color:var(--primary)}.evidence-button:focus-visible{outline:3px solid rgba(37,99,235,.28);outline-offset:2px}.evidence-section-title{margin:30px 0 14px;font-size:22px;color:var(--executive);letter-spacing:-.03em}.evidence-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.evidence-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.evidence-card{background:var(--card);border:1px solid var(--border);border-radius:22px;padding:20px;box-shadow:var(--shadow)}.evidence-card h3{margin:0 0 6px;font-size:16px;color:var(--executive)}.evidence-kpi-label{font-size:13px;color:var(--muted);font-weight:800}.evidence-kpi-value{font-size:38px;font-weight:900;color:var(--executive);margin:8px 0;letter-spacing:-.04em}.evidence-trend{font-size:12px;color:var(--success);font-weight:800}.evidence-status-row{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:13px 0;font-size:14px}.value-warning{color:var(--warning)}.value-critical{color:var(--critical)}.value-success{color:var(--success)}.evidence-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:900;white-space:nowrap}.evidence-badge.ready{background:var(--green-soft);color:var(--success)}.evidence-badge.review{background:var(--amber-soft);color:var(--warning)}.evidence-badge.not-ready{background:var(--red-soft);color:var(--critical)}.evidence-badge.draft{background:#F1F5F9;color:#475569}.evidence-badge.exported{background:var(--blue-soft);color:var(--ai)}.evidence-badge.ai{background:var(--purple-soft);color:var(--purple)}.evidence-patient-context{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-top:20px}.evidence-context-item{background:white;border:1px solid var(--border);border-radius:16px;padding:14px}.evidence-context-item small{display:block;font-size:11px;color:var(--muted);font-weight:900}.evidence-context-item strong{display:block;margin-top:6px;font-size:14px}.evidence-workspace{display:grid;grid-template-columns:minmax(0,1fr) 370px;gap:20px;align-items:start;margin-top:20px}.evidence-section-card{background:white;border:1px solid var(--border);border-radius:22px;padding:20px;margin-bottom:16px;box-shadow:var(--shadow)}.evidence-section-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px}.evidence-section-head h3{margin:0 0 6px;font-size:16px;color:var(--executive)}.evidence-mini-box{background:#F8FAFC;border:1px solid var(--border);border-radius:16px;padding:14px;font-size:13px;line-height:1.55;white-space:pre-line}.evidence-mini-box strong{display:block;color:var(--executive);margin-bottom:5px}.evidence-mini-box span{display:block}.evidence-soap-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.evidence-sticky{position:sticky;top:24px}.evidence-panel-heading{display:flex;gap:12px;align-items:flex-start;margin-bottom:16px}.evidence-panel-heading h3{margin:0;font-size:16px}.evidence-panel-heading p{margin:4px 0 0;font-size:12px;color:var(--muted);line-height:1.5}.evidence-export-readiness-card{border:1px solid #BBF7D0;background:linear-gradient(180deg,#FFFFFF,#F0FDF4)}.evidence-panel-heading.success h3{color:var(--success)}.evidence-panel-heading.success>span{color:var(--success)}.evidence-readiness-score{font-size:46px;font-weight:900;letter-spacing:-.06em;margin-bottom:8px;color:var(--success)}.evidence-bar{height:10px;border-radius:999px;overflow:hidden;background:#E5E7EB}.evidence-bar span{display:block;height:100%;border-radius:999px}.success-bar{background:#DCFCE7;margin:18px 0}.success-bar span{background:var(--success)}.evidence-success-message{background:#DCFCE7;color:#166534;border:1px solid #BBF7D0;padding:12px;border-radius:14px;font-size:12px;line-height:1.55;font-weight:800}.evidence-checklist-card{margin-top:18px;border:1px solid #BFDBFE;background:linear-gradient(180deg,#FFFFFF,#EFF6FF)}.evidence-panel-heading.blue h3,.evidence-panel-heading.blue>span{color:var(--primary)}.evidence-checklist{display:flex;flex-direction:column;gap:10px}.evidence-check{display:flex;justify-content:space-between;align-items:center;padding:12px;border-radius:14px;font-size:13px;font-weight:800}.blue-check{background:#EFF6FF;border:1px solid #BFDBFE;color:var(--primary)}.blue-check strong{color:var(--success)}.warning-item{background:#FFFBEB;border-color:#FDE68A;color:var(--warning)}.warning-item strong{color:var(--warning)}.evidence-ai-recommendation-card{margin-top:18px;border:1px solid #DDD6FE;background:linear-gradient(180deg,#FFFFFF,#F5F3FF)}.evidence-panel-heading.purple h3,.evidence-panel-heading.purple>span{color:var(--purple)}.evidence-ai-priority{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.evidence-confidence{font-size:12px;font-weight:900;color:var(--purple)}.evidence-ai-box{background:#FFFFFF;border:1px solid #DDD6FE;border-radius:16px;padding:14px;margin-bottom:14px}.evidence-ai-box strong{color:var(--purple);font-size:13px}.evidence-ai-box p{font-size:13px;line-height:1.55;margin:8px 0}.evidence-ai-box small{display:block;color:#6D28D9;font-size:12px;line-height:1.5}.evidence-disclaimer{margin-top:14px;padding:12px;background:var(--purple-soft);color:#5B21B6;border-radius:14px;font-size:12px;line-height:1.5;font-weight:800}.evidence-export-actions{display:grid;gap:10px;margin-top:16px}.evidence-export-actions .evidence-button{width:100%}.evidence-timeline{display:grid;gap:12px}.evidence-time-item{display:grid;grid-template-columns:58px minmax(0,1fr) auto;gap:12px;padding:14px;background:#F8FAFC;border:1px solid var(--border);border-radius:14px}.evidence-time{font-weight:900;color:var(--executive)}.evidence-source{font-size:12px;color:var(--muted);margin-top:3px}.evidence-table-wrap{overflow-x:auto}.evidence-table{width:100%;border-collapse:separate;border-spacing:0;background:white;border:1px solid var(--border);border-radius:22px;overflow:hidden;box-shadow:var(--shadow)}.evidence-table th,.evidence-table td{padding:14px;text-align:left;font-size:13px;border-bottom:1px solid var(--border);vertical-align:top}.evidence-table th{background:#F8FAFC;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:.06em}.evidence-table tr:last-child td{border-bottom:0}.evidence-row-actions{display:flex;gap:8px;flex-wrap:wrap}.evidence-row-actions .evidence-button{padding:9px 12px}.evidence-table .evidence-badge+.evidence-badge{margin-left:6px}.evidence-table .evidence-badge{margin-bottom:4px}@media(max-width:1200px){.evidence-app{grid-template-columns:1fr}.evidence-sidebar{display:none}.evidence-header{flex-direction:column}.evidence-grid-4,.evidence-grid-3,.evidence-patient-context,.evidence-workspace,.evidence-soap-grid{grid-template-columns:1fr}.evidence-sticky{position:static}.evidence-main{padding:20px}}@media(max-width:720px){.evidence-header h1{font-size:28px}.evidence-kpi-value{font-size:32px}.evidence-time-item{grid-template-columns:1fr}.evidence-actions{width:100%}.evidence-actions .evidence-button{flex:1 1 160px}}
      `}</style>
      <div className="evidence-app">
        <Sidebar />

        <main className="evidence-main">
          <PageHeader />

          <SectionTitle>Executive KPI</SectionTitle>
          <section className="evidence-grid-4" aria-label="Executive KPI">
            {kpis.map((kpi) => (
              <KpiCard kpi={kpi} key={kpi.label} />
            ))}
          </section>

          <SectionTitle>Operational Snapshot</SectionTitle>
          <section className="evidence-grid-3" aria-label="Operational Snapshot">
            {snapshots.map((snapshot) => (
              <SnapshotCard card={snapshot} key={snapshot.title} />
            ))}
          </section>

          <SectionTitle>Evidence Package Detail</SectionTitle>
          <PatientContext />

          <section className="evidence-workspace">
            <div>
              {evidenceSections.map((section) => (
                <EvidenceSectionCard section={section} key={section.title} />
              ))}
            </div>
            <ReadinessPanel />
          </section>

          <SectionTitle>Activity Timeline</SectionTitle>
          <Timeline />

          <SectionTitle>Operational Worklist</SectionTitle>
          <OperationalWorklist />

          <SectionTitle>Compliance</SectionTitle>
          <ComplianceCards />
        </main>
      </div>
    </>
  );
}
