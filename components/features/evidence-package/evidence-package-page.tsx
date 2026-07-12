"use client";

const navItems = [
  "Main Dashboard",
  "Patient Management",
  "Visit Management",
  "SOAP Note",
  "Prescription",
  "Claim Readiness",
  "Evidence Package",
  "Payer Rules",
  "Economic Intelligence",
  "AI Copilot",
  "Audit & Compliance",
  "Admin Settings",
];

const patientContext = [
  ["HN", "HN-240071"],
  ["Patient", "Somchai K."],
  ["Age", "42 Years"],
  ["Visit Type", "OPD"],
  ["Diagnosis", "J06.9"],
  ["Payer", "AIA Health"],
  ["Claim Type", "Medical Claim"],
  ["Consent", "Valid"],
];

const kpis = [
  ["Today Visits", "128", "Operational volume today"],
  ["Claim Ready %", "74%", "พร้อมสำหรับการส่งเคลม"],
  ["AI Assisted Cases", "56", "AI SOAP summary / ICD suggestion"],
  ["Average Readiness Score", "86", "คะแนนความครบถ้วนของหลักฐาน"],
];

const queueItems = [
  ["Waiting", "18"],
  ["In Consultation", "32"],
  ["Pending Evidence", "21"],
  ["Completed", "57"],
];

const readinessBars = [
  ["Ready", "74%"],
  ["Needs Review", "19%"],
  ["Not Ready", "7%"],
];

const missingEvidence = [
  ["SOAP incomplete", "Review SOAP"],
  ["ICD missing", "Add ICD"],
  ["Prescription missing", "Add Prescription"],
  ["Medical Certificate missing", "Create Certificate"],
  ["Attachment missing", "Upload File"],
];

const cases = [
  {
    visit: "VIS-10291",
    patient: "Somchai K.",
    detail: "HN-240071 · Tel 089-xxx-1122",
    evidence: "SOAP, ICD, Prescription, Attachments",
    ai: "AI Assisted",
    readiness: "Needs Review",
    readinessClass: "review",
    missing: "Certificate",
    action: "View Detail",
    actionClass: "btn-secondary",
  },
  {
    visit: "VIS-10292",
    patient: "Araya P.",
    detail: "HN-240072 · Tel 081-xxx-5588",
    evidence: "Complete Package",
    ai: "AI Assisted",
    readiness: "Ready",
    readinessClass: "ready",
    missing: "None",
    action: "Export",
    actionClass: "btn-primary",
  },
  {
    visit: "VIS-10293",
    patient: "Niran T.",
    detail: "HN-240073 · Tel 092-xxx-4410",
    evidence: "SOAP Evidence only",
    ai: "-",
    readiness: "Not Ready",
    readinessClass: "not-ready",
    missing: "ICD, RX, Certificate",
    action: "View Detail",
    actionClass: "btn-secondary",
  },
];

const checklist = [
  ["ok", "✓", "SOAP Evidence", "SOAP Note completed by doctor"],
  ["ok", "✓", "ICD Evidence", "ICD-10 J06.9 attached with diagnosis"],
  ["ok", "✓", "Prescription Evidence", "Prescription items verified"],
  ["warn", "!", "Medical Certificate", "ต้องแนบก่อน Export PDF"],
  ["ok", "✓", "Attachments", "Lab result and scanned document attached"],
];

const soapSections = [
  ["Subjective", "ผู้ป่วยมีอาการไอ เจ็บคอ มีน้ำมูก 2 วัน ไม่มีหอบเหนื่อย ไม่มีไข้สูง"],
  ["Objective", "Vital signs stable, throat mildly injected, lungs clear, no respiratory distress."],
  ["Assessment", "Acute upper respiratory infection. ICD-10: J06.9"],
  ["Plan", "Symptomatic treatment, medication prescribed, follow-up if symptoms worsen within 3 days."],
];

const activityItems = [
  "Doctor updated SOAP Note · 09:24 · VIS-10291",
  "AI suggested ICD-10 J06.9 · 09:28 · VIS-10291",
  "Claim Reviewer exported PDF · 09:41 · VIS-10292",
  "Nurse uploaded attachment · 09:52 · VIS-10293",
];

function StatusPill({ label, tone = "ai" }: { label: string; tone?: string }) {
  return <span className={`status-pill ${tone}`}>{label}</span>;
}

export function EvidencePackagePage() {
  return (
    <>
      <style>{`
        :root{
          --ep-bg:#f6f9fc;
          --ep-panel:#ffffff;
          --ep-panel-soft:#f8fbff;
          --ep-blue-900:#0f2a5f;
          --ep-blue-800:#1e3a8a;
          --ep-blue-700:#1d4ed8;
          --ep-blue-600:#2563eb;
          --ep-blue-100:#dbeafe;
          --ep-blue-50:#eff6ff;
          --ep-cyan:#06b6d4;
          --ep-green:#16a34a;
          --ep-green-bg:#ecfdf5;
          --ep-amber:#d97706;
          --ep-amber-bg:#fffbeb;
          --ep-red:#dc2626;
          --ep-red-bg:#fef2f2;
          --ep-slate-900:#0f172a;
          --ep-slate-700:#334155;
          --ep-slate-500:#64748b;
          --ep-border:#e2e8f0;
          --ep-shadow:0 18px 50px rgba(15,42,95,.09);
          --ep-radius:22px;
        }

        .evidence-shell *{box-sizing:border-box}
        .evidence-shell{display:grid;grid-template-columns:280px minmax(0,1fr);min-height:100vh;background:linear-gradient(135deg,#f8fbff 0%,#eef5ff 45%,#f8fafc 100%);color:var(--ep-slate-900);font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif}
        .evidence-sidebar{background:linear-gradient(180deg,var(--ep-blue-900),#071a3f);color:white;padding:28px 22px;position:sticky;top:0;height:100vh}
        .evidence-brand{display:flex;gap:12px;align-items:center;margin-bottom:32px}
        .evidence-brand-mark{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#60a5fa,#22d3ee);display:grid;place-items:center;font-weight:900;box-shadow:0 16px 40px rgba(37,99,235,.35)}
        .evidence-brand h1{font-size:17px;margin:0;letter-spacing:.2px}.evidence-brand p{font-size:12px;margin:3px 0 0;color:#bfdbfe}
        .evidence-nav-title{font-size:11px;color:#93c5fd;text-transform:uppercase;letter-spacing:.12em;margin:24px 8px 10px}
        .evidence-nav-item{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:14px;color:#dbeafe;font-size:14px;margin-bottom:6px;text-decoration:none}
        .evidence-nav-item.active{background:rgba(255,255,255,.13);color:white;border:1px solid rgba(255,255,255,.14)}
        .evidence-nav-dot{width:8px;height:8px;border-radius:999px;background:#60a5fa;flex:0 0 auto}
        .evidence-security-box{margin-top:28px;padding:16px;border-radius:18px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16)}
        .evidence-security-box strong{display:block;font-size:13px;margin-bottom:6px}.evidence-security-box span{font-size:12px;color:#c7d2fe;line-height:1.55}
        .evidence-main{min-width:0;padding:28px;overflow:hidden}
        .evidence-topbar{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:22px}
        .eyebrow{display:inline-flex;align-items:center;gap:8px;padding:7px 11px;background:var(--ep-blue-50);border:1px solid var(--ep-blue-100);border-radius:999px;color:var(--ep-blue-800);font-size:12px;font-weight:700;margin-bottom:12px}
        .evidence-title{font-size:31px;line-height:1.1;margin:0;color:var(--ep-blue-900);letter-spacing:-.03em}
        .subtitle{font-size:14px;color:var(--ep-slate-500);max-width:820px;line-height:1.7;margin:10px 0 0}
        .actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}
        .btn{border:0;border-radius:14px;padding:11px 15px;font-weight:800;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap}
        .btn-primary{background:linear-gradient(135deg,var(--ep-blue-700),var(--ep-cyan));color:white;box-shadow:0 14px 30px rgba(37,99,235,.24)}
        .btn-secondary{background:white;color:var(--ep-blue-800);border:1px solid var(--ep-border)}
        .patient-context{display:grid;grid-template-columns:repeat(8,1fr);gap:12px;margin:20px 0}
        .context-item{background:rgba(255,255,255,.78);backdrop-filter:blur(10px);border:1px solid var(--ep-border);border-radius:18px;padding:13px 14px}
        .context-item label{display:block;font-size:11px;color:var(--ep-slate-500);margin-bottom:5px}.context-item strong{font-size:13px;color:var(--ep-slate-900)}
        .alert-banner{display:flex;justify-content:space-between;align-items:center;gap:16px;background:linear-gradient(135deg,#fff7ed,#fffbeb);border:1px solid #fed7aa;border-radius:20px;padding:15px 18px;margin-bottom:20px;color:#9a3412}
        .alert-banner strong{font-size:14px}.alert-banner span{font-size:13px;color:#92400e}
        .grid-kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:18px}
        .card{background:rgba(255,255,255,.88);border:1px solid var(--ep-border);border-radius:var(--ep-radius);box-shadow:var(--ep-shadow)}
        .kpi{padding:20px;position:relative;overflow:hidden}.kpi:after{content:"";position:absolute;right:-38px;top:-38px;width:110px;height:110px;border-radius:999px;background:var(--ep-blue-50)}
        .kpi label{font-size:12px;color:var(--ep-slate-500);font-weight:700}.kpi .value{font-size:30px;font-weight:900;color:var(--ep-blue-900);margin-top:8px}.kpi .hint{font-size:12px;color:var(--ep-slate-500);margin-top:5px}
        .status-pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800;white-space:nowrap}
        .ready{background:var(--ep-green-bg);color:var(--ep-green)}.review{background:var(--ep-amber-bg);color:var(--ep-amber)}.not-ready{background:var(--ep-red-bg);color:var(--ep-red)}.ai{background:var(--ep-blue-50);color:var(--ep-blue-700)}
        .dashboard-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:18px;margin-bottom:18px}
        .section{padding:20px}.section-header{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:16px}.section h3{font-size:16px;margin:0;color:var(--ep-blue-900)}.section p{font-size:12px;color:var(--ep-slate-500);margin:4px 0 0;line-height:1.5}
        .queue{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.queue-item{background:var(--ep-panel-soft);border:1px solid var(--ep-border);border-radius:17px;padding:14px}.queue-item span{font-size:12px;color:var(--ep-slate-500)}.queue-item strong{display:block;font-size:23px;margin-top:5px;color:var(--ep-blue-900)}
        .readiness-bars{display:grid;gap:12px}.bar-row{display:grid;grid-template-columns:110px 1fr 40px;align-items:center;gap:10px;font-size:13px}.track{height:10px;border-radius:999px;background:#e2e8f0;overflow:hidden}.fill{height:100%;border-radius:999px;background:linear-gradient(90deg,var(--ep-blue-700),var(--ep-cyan))}
        .missing-list{display:grid;gap:10px}.missing-item{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 14px;background:var(--ep-panel-soft);border:1px solid var(--ep-border);border-radius:15px;font-size:13px}.missing-item button{border:0;border-radius:10px;background:var(--ep-blue-50);color:var(--ep-blue-700);padding:7px 10px;font-weight:800}
        .case-table-wrapper{overflow-x:auto}.case-table{width:100%;border-collapse:separate;border-spacing:0 10px;min-width:920px}.case-table th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--ep-slate-500);padding:0 12px}.case-table td{background:white;border-top:1px solid var(--ep-border);border-bottom:1px solid var(--ep-border);padding:14px 12px;font-size:13px}.case-table td:first-child{border-left:1px solid var(--ep-border);border-radius:16px 0 0 16px}.case-table td:last-child{border-right:1px solid var(--ep-border);border-radius:0 16px 16px 0}.patient strong{display:block;color:var(--ep-slate-900)}.patient span{font-size:12px;color:var(--ep-slate-500)}
        .detail-grid{display:grid;grid-template-columns:340px 1fr 310px;gap:18px;margin-top:18px}.checklist{padding:18px}.check-item{display:flex;gap:11px;align-items:flex-start;padding:13px 0;border-bottom:1px solid var(--ep-border)}.check-icon{width:24px;height:24px;border-radius:999px;display:grid;place-items:center;font-size:13px;font-weight:900;flex:0 0 auto}.ok{background:var(--ep-green-bg);color:var(--ep-green)}.warn{background:var(--ep-amber-bg);color:var(--ep-amber)}.check-item strong{font-size:13px}.check-item span{display:block;font-size:12px;color:var(--ep-slate-500);margin-top:3px}
        .tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.tab{padding:9px 12px;border-radius:12px;border:1px solid var(--ep-border);background:white;color:var(--ep-slate-700);font-weight:800;font-size:12px}.tab.active{background:var(--ep-blue-800);color:white;border-color:var(--ep-blue-800)}
        .doc-panel{padding:20px}.soap-box{background:var(--ep-panel-soft);border:1px solid var(--ep-border);border-radius:18px;padding:16px;margin-bottom:12px}.soap-box h4{font-size:13px;margin:0 0 8px;color:var(--ep-blue-900)}.soap-box p{font-size:13px;line-height:1.65;color:var(--ep-slate-700);margin:0}
        .pdf-preview{padding:18px}.preview-sheet{background:white;border:1px solid var(--ep-border);border-radius:18px;padding:18px;min-height:330px;box-shadow:inset 0 0 0 6px #f8fafc}.preview-sheet h4{margin:0 0 10px;color:var(--ep-blue-900)}.preview-line{height:9px;background:#e2e8f0;border-radius:999px;margin:12px 0}.preview-line.short{width:58%}.preview-line.mid{width:76%}.activity{display:grid;gap:11px}.activity-item{display:flex;gap:10px;font-size:12px;color:#475569}.activity-dot{width:9px;height:9px;border-radius:999px;background:var(--ep-blue-600);margin-top:4px;flex:0 0 auto}
        @media(max-width:1180px){.evidence-shell{grid-template-columns:1fr}.evidence-sidebar{display:none}.patient-context{grid-template-columns:repeat(2,1fr)}.grid-kpi,.queue{grid-template-columns:repeat(2,1fr)}.dashboard-grid,.detail-grid{grid-template-columns:1fr}}
        @media(max-width:720px){.evidence-main{padding:18px}.evidence-topbar{flex-direction:column}.grid-kpi,.queue,.patient-context{grid-template-columns:1fr}.actions{justify-content:flex-start}.evidence-title{font-size:25px}.alert-banner{align-items:flex-start;flex-direction:column}.section-header{align-items:flex-start;flex-direction:column}}
      `}</style>

      <div className="evidence-shell">
        <aside className="evidence-sidebar">
          <div className="evidence-brand">
            <div className="evidence-brand-mark">NX</div>
            <div>
              <h1>Med AI NexSure</h1>
              <p>Healthcare & Claim Intelligence</p>
            </div>
          </div>
          <div className="evidence-nav-title">Enterprise Workspace</div>
          <nav aria-label="Evidence package navigation">
            {navItems.map((item) => (
              <a className={`evidence-nav-item ${item === "Evidence Package" ? "active" : ""}`} href="#" key={item}>
                <span className="evidence-nav-dot" />
                {item}
              </a>
            ))}
          </nav>
          <div className="evidence-security-box">
            <strong>PHI Protected Workspace</strong>
            <span>ควบคุมสิทธิ์การเข้าถึงข้อมูลผู้ป่วย รองรับ PDPA, audit trail และ permission-based file access</span>
          </div>
        </aside>

        <main className="evidence-main">
          <section className="evidence-topbar">
            <div>
              <div className="eyebrow">AI Assisted Evidence Builder · Insurance-ready PDF Export</div>
              <h2 className="evidence-title">Evidence Package Dashboard</h2>
              <p className="subtitle">สรุปหลักฐานทางการแพทย์สำหรับส่งบริษัทประกัน พร้อมตรวจเอกสารที่ขาดและความพร้อมก่อนส่งเคลม</p>
            </div>
            <div className="actions">
              <button className="btn btn-secondary">Preview PDF</button>
              <button className="btn btn-primary">Export PDF</button>
            </div>
          </section>

          <section className="patient-context" aria-label="Patient context">
            {patientContext.map(([label, value]) => (
              <div className="context-item" key={label}>
                <label>{label}</label>
                <strong>{value}</strong>
              </div>
            ))}
          </section>

          <div className="alert-banner">
            <div>
              <strong>Missing Evidence Detected</strong>
              <br />
              <span>กรุณาสร้างหรือแนบ Medical Certificate ก่อน Export PDF</span>
            </div>
            <button className="btn btn-secondary">Create Certificate</button>
          </div>

          <section className="grid-kpi" aria-label="Evidence package KPIs">
            {kpis.map(([label, value, hint]) => (
              <div className="card kpi" key={label}>
                <label>{label}</label>
                <div className="value">{value}</div>
                <div className="hint">{hint}</div>
              </div>
            ))}
          </section>

          <section className="dashboard-grid">
            <div className="card section">
              <div className="section-header">
                <div>
                  <h3>Queue Snapshot</h3>
                  <p>ภาพรวมสถานะเคสสำหรับวันนี้</p>
                </div>
                <StatusPill label="Live" />
              </div>
              <div className="queue">
                {queueItems.map(([label, value]) => (
                  <div className="queue-item" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="card section">
              <div className="section-header">
                <div>
                  <h3>Claim Readiness Overview</h3>
                  <p>Ready / Needs Review / Not Ready</p>
                </div>
              </div>
              <div className="readiness-bars">
                {readinessBars.map(([label, value]) => (
                  <div className="bar-row" key={label}>
                    <span>{label}</span>
                    <div className="track">
                      <div className="fill" style={{ width: value }} />
                    </div>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="card section">
              <div className="section-header">
                <div>
                  <h3>Missing Evidence Chart</h3>
                  <p>แสดงรายการเอกสารที่ต้องดำเนินการเพิ่มเติม</p>
                </div>
              </div>
              <div className="missing-list">
                {missingEvidence.map(([label, action]) => (
                  <div className="missing-item" key={label}>
                    <span>{label}</span>
                    <button>{action}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="card section">
              <div className="section-header">
                <div>
                  <h3>Economic Intelligence Card</h3>
                  <p>วิเคราะห์ต้นทุนและความผิดปกติก่อนส่งเคลม</p>
                </div>
              </div>
              <div className="queue" style={{ gridTemplateColumns: "1fr" }}>
                <div className="queue-item"><span>Average Visit Cost</span><strong>฿2,840</strong></div>
                <div className="queue-item"><span>Cost Alert Cases</span><strong>9</strong></div>
                <div className="queue-item"><span>Normal Cost Cases</span><strong>119</strong></div>
              </div>
            </div>
          </section>

          <section className="card section">
            <div className="section-header">
              <div>
                <h3>Evidence Case List</h3>
                <p>เลือกเคสเพื่อดูรายละเอียดหลักฐานและสถานะเคลม</p>
              </div>
              <button className="btn btn-secondary">Today</button>
            </div>
            <div className="case-table-wrapper">
              <table className="case-table">
                <thead>
                  <tr><th>Visit</th><th>Patient</th><th>Evidence</th><th>AI</th><th>Readiness</th><th>Missing</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {cases.map((item) => (
                    <tr key={item.visit}>
                      <td>{item.visit}</td>
                      <td className="patient"><strong>{item.patient}</strong><span>{item.detail}</span></td>
                      <td>{item.evidence}</td>
                      <td>{item.ai === "-" ? "-" : <StatusPill label={item.ai} />}</td>
                      <td><StatusPill label={item.readiness} tone={item.readinessClass} /></td>
                      <td>{item.missing}</td>
                      <td><button className={`btn ${item.actionClass}`}>{item.action}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="detail-grid">
            <aside className="card checklist">
              <div className="section-header">
                <div>
                  <h3>Evidence Checklist</h3>
                  <p>ตรวจสอบความครบถ้วนจากข้อมูล Visit อัตโนมัติ</p>
                </div>
              </div>
              {checklist.map(([tone, icon, title, detail]) => (
                <div className="check-item" key={title}>
                  <div className={`check-icon ${tone}`}>{icon}</div>
                  <div><strong>{title}</strong><span>{detail}</span></div>
                </div>
              ))}
            </aside>

            <section className="card doc-panel">
              <div className="section-header">
                <div>
                  <h3>Evidence Package Detail</h3>
                  <p>จัดเอกสารเป็นหมวดหมู่เพื่อการตรวจสอบเคลม</p>
                </div>
                <StatusPill label="Needs Review" tone="review" />
              </div>
              <div className="tabs">
                {["SOAP", "ICD", "Prescription", "Certificate", "Attachments"].map((tab) => (
                  <button className={`tab ${tab === "SOAP" ? "active" : ""}`} key={tab}>{tab}</button>
                ))}
              </div>
              {soapSections.map(([title, detail]) => (
                <div className="soap-box" key={title}>
                  <h4>{title}</h4>
                  <p>{detail}</p>
                </div>
              ))}
            </section>

            <aside className="card pdf-preview">
              <div className="section-header">
                <div>
                  <h3>Preview PDF</h3>
                  <p>ตรวจสอบความถูกต้องก่อนสร้างเอกสาร</p>
                </div>
              </div>
              <div className="preview-sheet">
                <h4>Evidence Package</h4>
                <div className="preview-line mid" /><div className="preview-line" /><div className="preview-line short" />
                <div className="preview-line mid" /><div className="preview-line" /><div className="preview-line short" />
                <br />
                <StatusPill label="Pending Certificate" tone="review" />
              </div>
              <div className="actions" style={{ marginTop: 14, justifyContent: "stretch" }}>
                <button className="btn btn-secondary" style={{ flex: 1 }}>Preview</button>
                <button className="btn btn-primary" style={{ flex: 1 }}>Generate PDF</button>
              </div>
            </aside>
          </section>

          <section className="dashboard-grid" style={{ marginTop: 18 }}>
            <div className="card section">
              <div className="section-header">
                <div>
                  <h3>AI Recommendation Panel</h3>
                  <p>สรุปข้อเสนอแนะจาก AI เพื่อช่วยตรวจความครบถ้วนของเคส</p>
                </div>
                <StatusPill label="AI Assisted" />
              </div>
              <div className="missing-list">
                <div className="missing-item"><span>Recommended Action</span><button>Create Certificate</button></div>
                <div className="missing-item"><span>Clinical Evidence Risk</span><StatusPill label="Needs Review" tone="review" /></div>
                <div className="missing-item"><span>Suggested Next Step</span><span>Review certificate requirement before export</span></div>
              </div>
            </div>
            <div className="card section">
              <div className="section-header">
                <div>
                  <h3>Language & UI Standard</h3>
                  <p>English-first interface with Thai operational support</p>
                </div>
              </div>
              <div className="missing-list">
                <div className="missing-item"><span>Navigation</span><span>English</span></div>
                <div className="missing-item"><span>Page Title / KPI / Status</span><span>English</span></div>
                <div className="missing-item"><span>Helper / Alert / Empty State</span><span>Thai Support</span></div>
              </div>
            </div>
          </section>

          <section className="dashboard-grid" style={{ marginTop: 18 }}>
            <div className="card section">
              <div className="section-header">
                <div>
                  <h3>Recent Activity</h3>
                  <p>ประวัติการทำงานล่าสุดสำหรับตรวจสอบย้อนหลัง</p>
                </div>
              </div>
              <div className="activity">
                {activityItems.map((item) => (
                  <div className="activity-item" key={item}>
                    <span className="activity-dot" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card section">
              <div className="section-header">
                <div>
                  <h3>Security & Compliance</h3>
                  <p>Access control, privacy protection และ audit readiness</p>
                </div>
              </div>
              <div className="missing-list">
                <div className="missing-item"><span>Export Permission</span><StatusPill label="Enabled" tone="ready" /></div>
                <div className="missing-item"><span>Data Masking</span><StatusPill label="Active" tone="ready" /></div>
                <div className="missing-item"><span>Audit Logging</span><StatusPill label="On" tone="ready" /></div>
                <div className="missing-item"><span>No Direct File Access</span><StatusPill label="Protected" tone="ready" /></div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
