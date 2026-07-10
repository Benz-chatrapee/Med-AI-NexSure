"use client";

const patients = [
  {
    hn: "HN-1029",
    name: "Somchai Jaidee",
    gender: "Male",
    age: 42,
    phone: "0812345678",
    visitNo: "VN-7782",
    visitStatus: "กำลังตรวจ",
    readiness: "Ready",
    ai: true,
    risk: "Low",
    lastVisit: "2026-07-06",
  },
  {
    hn: "HN-1030",
    name: "Suda Wongchai",
    gender: "Female",
    age: 36,
    phone: "0899876543",
    visitNo: "VN-7783",
    visitStatus: "เสร็จสิ้น",
    readiness: "Needs Review",
    ai: true,
    risk: "Medium",
    lastVisit: "2026-07-06",
  },
  {
    hn: "HN-1031",
    name: "Anan Prasert",
    gender: "Male",
    age: 58,
    phone: "0861112233",
    visitNo: "VN-7784",
    visitStatus: "รอตรวจ",
    readiness: "Not Ready",
    ai: false,
    risk: "High",
    lastVisit: "2026-07-04",
  },
  {
    hn: "HN-1032",
    name: "Malee Rattanakul",
    gender: "Female",
    age: 29,
    phone: "0827774455",
    visitNo: "VN-7785",
    visitStatus: "รอเอกสาร",
    readiness: "Ready",
    ai: true,
    risk: "Low",
    lastVisit: "2026-07-03",
  },
];

function readinessClass(readiness: string) {
  if (readiness === "Ready") return "ready";
  if (readiness === "Needs Review") return "review";
  return "notready";
}

function readinessLabel(readiness: string) {
  if (readiness === "Ready") return "✓ Ready";
  if (readiness === "Needs Review") return "⚠ Needs Review";
  return "✕ Not Ready";
}

function visitStatusClass(status: string) {
  if (status === "รอตรวจ") return "visit-waiting";
  if (status === "กำลังตรวจ") return "visit-consult";
  if (status === "รอเอกสาร") return "visit-evidence";
  if (status === "เสร็จสิ้น") return "visit-completed";
  if (status === "ยกเลิก") return "visit-cancel";
  return "neutral";
}

function visitStatusLabel(status: string) {
  if (status === "รอตรวจ") return "🟡 รอตรวจ";
  if (status === "กำลังตรวจ") return "🔵 กำลังตรวจ";
  if (status === "รอเอกสาร") return "🟣 รอเอกสาร";
  if (status === "เสร็จสิ้น") return "🟢 เสร็จสิ้น";
  if (status === "ยกเลิก") return "🔴 ยกเลิก";
  return status;
}

function riskBadge(risk: string) {
  if (risk === "Low") return <span className="badge ready">✓ Low Risk</span>;
  if (risk === "Medium") return <span className="badge review">⚠ Medium Risk</span>;
  return <span className="badge notready">✕ High Risk</span>;
}

export function DashboardPage() {
  return (
    <>
      <style>{`
        :root {
          --primary:#1E3A8A;
          --deep:#0F2A5F;
          --ai:#2563EB;
          --soft:#EFF6FF;
          --blue-border:#BFDBFE;
          --bg:#F8FAFC;
          --surface:#FFFFFF;
          --border:#E2E8F0;
          --text:#0F172A;
          --muted:#64748B;
          --success:#16A34A;
          --warning:#F59E0B;
          --danger:#DC2626;
          --success-bg:#ECFDF5;
          --warning-bg:#FFFBEB;
          --danger-bg:#FEF2F2;
        }

        * { box-sizing:border-box; }
        body { margin:0; background:var(--bg); color:var(--text); }
        .app { display:grid; grid-template-columns:280px minmax(0, 1fr); min-height:100vh; background:var(--bg); color:var(--text); font-family:Inter, Arial, sans-serif; }
        .sidebar { background:linear-gradient(180deg, var(--deep), #081B42); color:white; padding:24px 18px; }
        .logo { font-size:20px; font-weight:900; }
        .logo-sub { color:#BFDBFE; font-size:12px; margin:6px 0 28px; line-height:1.5; }
        .nav { display:grid; gap:8px; }
        .nav a { color:#DBEAFE; text-decoration:none; padding:12px 14px; border-radius:14px; font-size:14px; font-weight:700; }
        .nav a.active, .nav a:hover { background:rgba(255,255,255,.12); color:white; }
        .security-card { margin-top:28px; padding:14px; border-radius:16px; background:rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.14); font-size:12px; color:#DBEAFE; line-height:1.6; }
        .main { min-width:0; padding:24px; }
        .command-bar { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:16px; display:grid; grid-template-columns:minmax(260px,1.5fr) minmax(220px,1fr) auto auto; gap:12px; align-items:center; box-shadow:0 12px 28px rgba(15,42,95,.05); margin-bottom:22px; }
        .nex-input, .nex-select { width:100%; border:1px solid var(--border); border-radius:14px; padding:13px 14px; background:white; outline:none; color:var(--text); font:inherit; }
        .nex-input:focus, .nex-select:focus { border-color:var(--ai); box-shadow:0 0 0 4px var(--soft); }
        .pill { display:inline-flex; align-items:center; gap:6px; border-radius:999px; padding:8px 12px; font-size:12px; font-weight:900; border:1px solid var(--border); background:white; white-space:nowrap; }
        .role { color:var(--primary); background:var(--soft); border-color:var(--blue-border); }
        .header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:18px; }
        .header h1 { margin:0; font-size:32px; letter-spacing:-.04em; font-weight:900; }
        .header p { margin:8px 0 0; color:var(--muted); font-size:14px; line-height:1.6; }
        .btn { border:0; background:var(--primary); color:white; padding:12px 18px; border-radius:14px; font-weight:900; cursor:pointer; box-shadow:0 14px 28px rgba(30,58,138,.18); white-space:nowrap; }
        .btn:hover { background:var(--deep); }
        .kpis { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:16px; margin-bottom:18px; }
        .card { background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:18px; box-shadow:0 12px 30px rgba(15,42,95,.06); }
        .kpi { position:relative; overflow:hidden; }
        .kpi:before { content:""; position:absolute; top:0; left:18px; right:18px; height:3px; background:linear-gradient(90deg, var(--primary), #38BDF8); }
        .kpi-label { color:var(--muted); font-size:13px; }
        .kpi-value { font-size:30px; font-weight:900; color:var(--primary); margin-top:8px; }
        .kpi-note { color:var(--muted); font-size:12px; margin-top:8px; line-height:1.5; }
        .filters { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:12px; margin-bottom:18px; }
        .content { display:grid; grid-template-columns:minmax(0, 1fr) 380px; gap:20px; align-items:start; }
        .table-card { padding:0; overflow-x:auto; min-width:0; }
        table { width:100%; min-width:1180px; border-collapse:collapse; font-size:14px; }
        thead { background:var(--bg); color:var(--muted); }
        th, td { padding:15px 16px; border-bottom:1px solid var(--border); text-align:left; vertical-align:middle; }
        tbody tr:hover { background:rgba(239,246,255,.65); }
        .patient-name { font-weight:900; color:var(--text); }
        .sub { font-size:12px; color:var(--muted); margin-top:4px; }
        .badge { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; font-size:12px; font-weight:900; border:1px solid transparent; white-space:nowrap; }
        .ready { color:var(--success); background:var(--success-bg); border-color:rgba(22,163,74,.2); }
        .review { color:var(--warning); background:var(--warning-bg); border-color:rgba(245,158,11,.28); }
        .notready { color:var(--danger); background:var(--danger-bg); border-color:rgba(220,38,38,.22); }
        .ai { color:var(--ai); background:var(--soft); border-color:var(--blue-border); }
        .neutral { color:#475569; background:#F1F5F9; border-color:var(--border); }
        .visit-waiting { color:#92400E; background:#FEF3C7; border-color:#FCD34D; }
        .visit-consult { color:#1E3A8A; background:#DBEAFE; border-color:#93C5FD; }
        .visit-evidence { color:#7C3AED; background:#F3E8FF; border-color:#C4B5FD; }
        .visit-completed { color:#166534; background:#DCFCE7; border-color:#86EFAC; }
        .visit-cancel { color:#B91C1C; background:#FEE2E2; border-color:#FCA5A5; }
        .actions { display:flex; gap:8px; flex-wrap:wrap; }
        .link-btn { border:1px solid var(--border); background:white; color:var(--primary); padding:7px 10px; border-radius:10px; font-size:12px; font-weight:800; cursor:pointer; }
        .link-btn:hover { background:var(--soft); border-color:var(--blue-border); }
        .side { display:grid; gap:16px; align-self:start; position:sticky; top:24px; max-height:calc(100vh - 48px); overflow-y:auto; padding-right:4px; }
        .section-title { font-size:15px; font-weight:900; color:var(--primary); margin-bottom:6px; }
        .section-subtitle { font-size:12px; color:var(--muted); margin-bottom:14px; line-height:1.5; }
        .ai-panel { width:100%; background:linear-gradient(180deg, #FFFFFF, #EFF6FF); border:1px solid var(--blue-border); z-index:1; }
        .ai-title { font-weight:900; color:var(--ai); }
        .ai-copy { color:#334155; font-size:13px; line-height:1.6; margin-bottom:8px; }
        .row { display:flex; justify-content:space-between; gap:12px; padding:10px 0; border-bottom:1px solid var(--border); font-size:13px; }
        .row:last-child { border-bottom:0; }
        .critical { color:var(--danger); background:var(--danger-bg); margin:6px -8px; padding:10px 8px; border-radius:12px; }
        .audit-item { position:relative; padding-left:18px; margin-bottom:12px; color:#334155; font-size:13px; line-height:1.5; }
        .audit-item:before { content:""; position:absolute; left:0; top:5px; width:8px; height:8px; background:var(--ai); border-radius:999px; }
        .audit-time { color:var(--muted); font-size:12px; margin-top:2px; }
        @media(max-width:1280px) { .content { grid-template-columns:1fr; } .side { position:relative; top:auto; max-height:none; overflow:visible; } }
        @media(max-width:1100px) { .app { grid-template-columns:1fr; } .sidebar { display:none; } .command-bar, .filters { grid-template-columns:1fr 1fr; } .kpis { grid-template-columns:repeat(2, minmax(0,1fr)); } }
        @media(max-width:760px) { .main { padding:18px; } .command-bar, .filters, .kpis { grid-template-columns:1fr; } .header { flex-direction:column; } }
      `}</style>

      <div className="app">
        <aside className="sidebar">
          <div className="logo">Med AI NexSure</div>
          <div className="logo-sub">Enterprise Healthcare & Insurance Intelligence Platform</div>
          <nav className="nav">
            <a href="#">Main Dashboard</a>
            <a className="active" href="#">Patient Management</a>
            <a href="#">Visit Management</a>
            <a href="#">SOAP Note</a>
            <a href="#">Prescription</a>
            <a href="#">Claim Readiness</a>
            <a href="#">Evidence Package</a>
            <a href="#">Payer Rules</a>
            <a href="#">Economic Intelligence</a>
            <a href="#">AI Copilot</a>
            <a href="#">Audit & Compliance</a>
            <a href="#">Admin Settings</a>
          </nav>
          <div className="security-card">
            <b>Secure Workspace</b>
            <br />
            พื้นที่ทำงานที่รองรับ PDPA, RBAC, audit trail และ human approval workflow
          </div>
        </aside>

        <main className="main">
          <section className="command-bar">
            <input className="nex-input" placeholder="Global search: HN, patient name, visit no, claim case..." />
            <select className="nex-select" aria-label="Organization">
              <option>Med AI NexSure Clinic Group</option>
              <option>Bangkok Clinic Branch</option>
            </select>
            <span className="pill role">● Role: Claim Reviewer</span>
            <span className="pill">🔔 4 Alerts</span>
          </section>

          <section className="header">
            <div>
              <h1>Patient Management</h1>
              <p>บริหารข้อมูลผู้ป่วยและการเข้ารับบริการ พร้อมติดตามความพร้อมในการส่งเคลม</p>
            </div>
            <button className="btn">+ Create Patient</button>
          </section>

          <section className="kpis" aria-label="Patient management KPIs">
            <div className="card kpi">
              <div className="kpi-label">Today Visits</div>
              <div className="kpi-value">4</div>
              <div className="kpi-note">จำนวนผู้เข้ารับบริการวันนี้</div>
            </div>
            <div className="card kpi">
              <div className="kpi-label">Claim Ready %</div>
              <div className="kpi-value">50%</div>
              <div className="kpi-note">สัดส่วนเคสที่พร้อมส่งเคลม</div>
            </div>
            <div className="card kpi">
              <div className="kpi-label">AI Assisted Cases</div>
              <div className="kpi-value">3</div>
              <div className="kpi-note">จำนวนเคสที่ AI ช่วยวิเคราะห์</div>
            </div>
            <div className="card kpi">
              <div className="kpi-label">Average Readiness Score</div>
              <div className="kpi-value">86</div>
              <div className="kpi-note">คะแนนความพร้อมเฉลี่ย</div>
            </div>
          </section>

          <section className="filters">
            <input className="nex-input" placeholder="Search patient by HN, Name, Phone or Visit No." />
            <select className="nex-select" aria-label="Status filter">
              <option>สถานะทั้งหมด</option>
              <option>รอตรวจ</option>
              <option>กำลังตรวจ</option>
              <option>รอเอกสาร</option>
              <option>เสร็จสิ้น</option>
              <option>ยกเลิก</option>
            </select>
            <select className="nex-select" aria-label="Readiness filter">
              <option>All Claim Readiness</option>
              <option>Ready</option>
              <option>Needs Review</option>
              <option>Not Ready</option>
            </select>
            <input className="nex-input" type="date" aria-label="Date filter" />
          </section>

          <section className="content">
            <div className="card table-card">
              <table>
                <thead><tr><th>Patient</th><th>Gender / Age</th><th>Phone</th><th>Visit Status</th><th>Claim Readiness</th><th>AI Support</th><th>Risk</th><th>Last Visit</th><th>Actions</th></tr></thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.hn}>
                      <td>
                        <div className="patient-name">{patient.name}</div>
                        <div className="sub">{patient.hn} · {patient.visitNo}</div>
                      </td>
                      <td>{patient.gender} / {patient.age}</td>
                      <td>{patient.phone}</td>
                      <td>
                        <span className={`badge ${visitStatusClass(patient.visitStatus)}`}>{visitStatusLabel(patient.visitStatus)}</span>
                      </td>
                      <td>
                        <span className={`badge ${readinessClass(patient.readiness)}`}>{readinessLabel(patient.readiness)}</span>
                      </td>
                      <td>{patient.ai ? <span className="badge ai">✨ AI Assisted</span> : <span className="badge neutral">Human Only</span>}</td>
                      <td>{riskBadge(patient.risk)}</td>
                      <td>{patient.lastVisit}</td>
                      <td>
                        <div className="actions">
                          <button className="link-btn">View Detail</button>
                          <button className="link-btn">Review</button>
                          <button className="link-btn">Create</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <aside className="side">
              <div className="card ai-panel">
                <div className="ai-title">AI Decision Support</div>
                <div className="section-subtitle">AI ช่วยวิเคราะห์และแนะนำข้อมูล แต่การตัดสินใจสุดท้ายยังเป็นของแพทย์หรือผู้ตรวจเคลม</div>
                <div className="ai-copy">3 cases require human review due to missing SOAP evidence, ICD-10 mismatch, or incomplete claim documentation.</div>
                <div className="row">
                  <span>Confidence Level</span>
                  <b>87%</b>
                </div>
                <div className="row">
                  <span>Suggested Action</span>
                  <b>Review Evidence</b>
                </div>
                <div className="row">
                  <span>Human Review Status</span>
                  <b>Required</b>
                </div>
                <div className="row">
                  <span>Audit Record</span>
                  <b>Enabled</b>
                </div>
              </div>

              <div className="card">
                <div className="section-title">Claim Readiness</div>
                <div className="section-subtitle">ตรวจสอบความพร้อมของข้อมูลก่อนส่งเคลมประกัน</div>
                <div className="row">
                  <span>✓ Ready</span>
                  <b>2</b>
                </div>
                <div className="row">
                  <span>⚠ Needs Review</span>
                  <b>1</b>
                </div>
                <div className="row">
                  <span>✕ Not Ready</span>
                  <b>1</b>
                </div>
              </div>

              <div className="card">
                <div className="section-title">Missing Evidence</div>
                <div className="section-subtitle">เอกสารหรือข้อมูลที่ยังไม่ครบถ้วน</div>
                <div className="row critical">
                  <span>⚠ ข้อมูลยังไม่ครบถ้วน กรุณาตรวจสอบ SOAP Note, ICD-10 และ Prescription ก่อนส่งเคลมประกัน</span>
                  <b>Critical</b>
                </div>
                <div className="row">
                  <span>⚠ ICD-10 missing</span>
                  <b>3</b>
                </div>
                <div className="row">
                  <span>● PDPA consent pending</span>
                  <b>2</b>
                </div>
              </div>

              <div className="card">
                <div className="section-title">Economic Intelligence</div>
                <div className="section-subtitle">วิเคราะห์ต้นทุน ค่าใช้จ่าย และความผิดปกติของการรักษา</div>
                <div className="row">
                  <span>Average Visit Cost</span>
                  <b>฿1,850</b>
                </div>
                <div className="row">
                  <span>Cost Outlier</span>
                  <b>2 Cases</b>
                </div>
                <div className="row">
                  <span>Expected Range</span>
                  <b>฿1,200-2,400</b>
                </div>
              </div>

              <div className="card">
                <div className="section-title">Audit & Compliance</div>
                <div className="section-subtitle">ติดตามประวัติการใช้งาน รองรับ PDPA และการตรวจสอบย้อนหลัง</div>
                <div className="audit-item">
                  Opened patient profile
                  <div className="audit-time">เปิดข้อมูลผู้ป่วย · 5 min ago</div>
                </div>
                <div className="audit-item">
                  Viewed claim readiness
                  <div className="audit-time">ตรวจสอบความพร้อมการเคลม · 18 min ago</div>
                </div>
                <div className="audit-item">
                  Updated PDPA consent
                  <div className="audit-time">ปรับปรุงข้อมูลการให้ความยินยอม · 32 min ago</div>
                </div>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </>
  );
}
