"use client";

type NavGroup = {
  title: string;
  items: string[];
};

type KpiCard = {
  label: string;
  value: string;
  description: string;
};

type GovernanceModule = {
  id: string;
  title: string;
  description: string;
};

type AuditAction = "View" | "Export" | "Edit";
type RiskLevel = "Low" | "Medium" | "High";

type AuditLogRow = {
  time: string;
  user: string;
  role: string;
  action: AuditAction;
  module: string;
  patientVisit: string;
  risk: RiskLevel;
};

type ConsentStatus = {
  label: string;
  value: string;
  tone: "green" | "amber" | "red" | "purple";
};

type AlertItem = {
  title: string;
  description: string;
};

type TimelineItem = {
  title: string;
  description: string;
};

const navGroups: NavGroup[] = [
  {
    title: "Clinical Operations",
    items: [
      "Main Dashboard",
      "Patient Management",
      "Visit Management",
      "SOAP Note",
      "Prescription",
    ],
  },
  {
    title: "Insurance Intelligence",
    items: [
      "Claim Readiness",
      "Evidence Package",
      "Payer Rules",
      "Economic Intelligence",
    ],
  },
  {
    title: "AI & Governance",
    items: ["AI Copilot", "Audit & Compliance", "Admin Settings"],
  },
];

const kpis: KpiCard[] = [
  {
    label: "Today Audit Events",
    value: "1,284",
    description: "กิจกรรมที่ถูกบันทึกในวันนี้",
  },
  {
    label: "PHI Access Logged",
    value: "100%",
    description: "ทุกการเข้าถึงข้อมูลสุขภาพถูกบันทึก",
  },
  {
    label: "PDPA Consent Coverage",
    value: "96.8%",
    description: "ผู้ป่วยที่มี Consent พร้อมใช้งาน",
  },
  {
    label: "Compliance Alerts",
    value: "7",
    description: "กิจกรรมเสี่ยงที่ต้องตรวจสอบ",
  },
];

const governanceModules: GovernanceModule[] = [
  {
    id: "01",
    title: "Access History",
    description:
      "ตรวจสอบว่าใครเข้าถึงข้อมูลผู้ป่วย Visit หรือเอกสารสำคัญ พร้อมเวลา Role และบริบทการใช้งาน",
  },
  {
    id: "02",
    title: "Version History",
    description:
      "ดูประวัติการแก้ไข SOAP, Prescription และ Evidence Package เพื่อรองรับการตรวจสอบย้อนหลัง",
  },
  {
    id: "03",
    title: "PDPA Consent",
    description:
      "ตรวจสอบสถานะ Consent ก่อนเข้าถึงหรือ Export ข้อมูล ลดความเสี่ยงด้านข้อมูลส่วนบุคคล",
  },
  {
    id: "04",
    title: "Compliance Alerts",
    description:
      "แจ้งเตือนกิจกรรมที่มีความเสี่ยงด้านข้อมูลสุขภาพและประกัน เช่น Export ผิดปกติ หรือเข้าถึง PHI บ่อยเกินไป",
  },
];

const auditLogs: AuditLogRow[] = [
  {
    time: "10:42",
    user: "Dr. Anan",
    role: "Doctor",
    action: "View",
    module: "Patient Profile",
    patientVisit: "HN-24891 / VS-1029",
    risk: "Low",
  },
  {
    time: "10:31",
    user: "Nicha S.",
    role: "Claim Reviewer",
    action: "Export",
    module: "Evidence Package",
    patientVisit: "HN-77420 / VS-1017",
    risk: "High",
  },
  {
    time: "10:18",
    user: "Pharm. Kitt",
    role: "Pharmacist",
    action: "Edit",
    module: "Prescription",
    patientVisit: "HN-55201 / VS-1008",
    risk: "Medium",
  },
];

const consentStatuses: ConsentStatus[] = [
  { label: "Granted", value: "842", tone: "green" },
  { label: "Pending", value: "31", tone: "amber" },
  { label: "Revoked", value: "12", tone: "red" },
  { label: "Expired", value: "18", tone: "purple" },
];

const alerts: AlertItem[] = [
  {
    title: "High Export Activity Detected",
    description:
      "พบการ Export Evidence Package หลายรายการในช่วงเวลาสั้น กรุณาตรวจสอบเหตุผลและสิทธิ์การใช้งาน",
  },
  {
    title: "PDPA Consent Required",
    description:
      "ไม่สามารถ Export ข้อมูลได้ เนื่องจากผู้ป่วยยังไม่มี PDPA Consent ที่ใช้งานได้",
  },
];

const timelineItems: TimelineItem[] = [
  {
    title: "Evidence Package Exported",
    description: "Claim Reviewer exported VS-1017 for insurer review.",
  },
  {
    title: "Prescription Updated",
    description: "Pharmacist updated dosage with clinical justification.",
  },
  {
    title: "Patient Profile Viewed",
    description: "Doctor accessed PHI under active visit context.",
  },
];

const actionClass: Record<AuditAction, string> = {
  View: "audit-badge-view",
  Export: "audit-badge-export",
  Edit: "audit-badge-edit",
};

const consentClass: Record<ConsentStatus["tone"], string> = {
  green: "audit-text-green",
  amber: "audit-text-amber",
  red: "audit-text-red",
  purple: "audit-text-purple",
};

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`audit-badge ${className}`}>{children}</span>;
}

function SectionHead({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="audit-section-head">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function AuditCompliancePage() {
  return (
    <>
      <style>{`
        :root {
          --audit-navy: #0f2a5f;
          --audit-blue: #1e3a8a;
          --audit-ai-blue: #2563eb;
          --audit-soft-blue: #eff6ff;
          --audit-border: #dbeafe;
          --audit-card: #ffffff;
          --audit-text: #0f172a;
          --audit-muted: #64748b;
          --audit-green: #059669;
          --audit-amber: #d97706;
          --audit-red: #dc2626;
          --audit-purple: #7c3aed;
          --audit-shadow: 0 20px 50px rgba(15, 42, 95, 0.08);
        }

        .audit-compliance-shell,
        .audit-compliance-shell * {
          box-sizing: border-box;
        }

        .audit-compliance-shell {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          min-height: 100vh;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
          color: var(--audit-text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .audit-sidebar {
          background: linear-gradient(180deg, var(--audit-navy), #071a3d);
          padding: 28px 22px;
          color: #ffffff;
        }

        .audit-brand {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 34px;
        }

        .audit-logo {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: linear-gradient(135deg, #60a5fa, #2563eb);
          display: grid;
          place-items: center;
          font-weight: 800;
        }

        .audit-brand h1 {
          margin: 0;
          font-size: 18px;
          line-height: 1.2;
        }

        .audit-brand p {
          margin: 3px 0 0;
          font-size: 12px;
          color: #bfdbfe;
        }

        .audit-nav-title {
          margin: 24px 0 10px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .12em;
          color: #93c5fd;
        }

        .audit-nav-item {
          padding: 12px 14px;
          border-radius: 12px;
          color: #dbeafe;
          font-size: 14px;
          margin-bottom: 6px;
        }

        .audit-nav-item-active {
          background: rgba(255,255,255,.14);
          color: #ffffff;
        }

        .audit-main {
          min-width: 0;
          padding: 30px;
        }

        .audit-hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 24px;
        }

        .audit-eyebrow {
          font-size: 13px;
          font-weight: 800;
          color: var(--audit-ai-blue);
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .audit-hero h2 {
          margin: 8px 0;
          font-size: 34px;
          line-height: 1.15;
          letter-spacing: -0.04em;
        }

        .audit-subtitle {
          margin: 0;
          max-width: 760px;
          color: var(--audit-muted);
          font-size: 15px;
          line-height: 1.7;
        }

        .audit-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .audit-button {
          border: 0;
          padding: 11px 16px;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
          font-size: 14px;
          line-height: 1.2;
        }

        .audit-button:focus-visible,
        .audit-nav-item:focus-visible {
          outline: 3px solid rgba(37, 99, 235, .35);
          outline-offset: 2px;
        }

        .audit-primary {
          background: var(--audit-ai-blue);
          color: #ffffff;
          box-shadow: 0 14px 28px rgba(37, 99, 235, .25);
        }

        .audit-secondary {
          background: #ffffff;
          color: var(--audit-blue);
          border: 1px solid var(--audit-border);
        }

        .audit-kpis {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 18px;
        }

        .audit-card {
          background: rgba(255,255,255,.94);
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          padding: 20px;
          box-shadow: var(--audit-shadow);
        }

        .audit-kpi-label {
          color: var(--audit-muted);
          font-size: 13px;
          margin-bottom: 8px;
        }

        .audit-kpi-value {
          font-size: 30px;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }

        .audit-kpi-desc {
          margin-top: 8px;
          font-size: 12px;
          color: var(--audit-muted);
        }

        .audit-content-grid {
          display: grid;
          grid-template-columns: 1.25fr .75fr;
          gap: 18px;
        }

        .audit-section-head {
          margin-bottom: 16px;
        }

        .audit-section-head h3 {
          margin: 0 0 6px;
          font-size: 19px;
          line-height: 1.2;
        }

        .audit-section-head p {
          margin: 0;
          color: var(--audit-muted);
          line-height: 1.6;
          font-size: 14px;
        }

        .audit-feature-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .audit-feature {
          padding: 18px;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .audit-feature-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          margin-bottom: 12px;
          background: var(--audit-soft-blue);
          color: var(--audit-ai-blue);
          font-weight: 900;
        }

        .audit-feature h4 {
          margin: 0 0 6px;
          font-size: 16px;
          line-height: 1.25;
        }

        .audit-feature p {
          margin: 0;
          color: var(--audit-muted);
          line-height: 1.6;
          font-size: 13px;
        }

        .audit-table-wrap {
          overflow-x: auto;
        }

        .audit-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          min-width: 720px;
        }

        .audit-table th {
          text-align: left;
          padding: 12px 10px;
          font-size: 12px;
          color: var(--audit-muted);
          border-bottom: 1px solid #e2e8f0;
          font-weight: 700;
        }

        .audit-table td {
          padding: 14px 10px;
          font-size: 14px;
          border-bottom: 1px solid #eef2f7;
          vertical-align: middle;
        }

        .audit-table small {
          color: var(--audit-muted);
        }

        .audit-badge {
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.2;
        }

        .audit-badge-view {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .audit-badge-edit {
          background: #faf5ff;
          color: var(--audit-purple);
        }

        .audit-badge-export {
          background: #fff7ed;
          color: var(--audit-amber);
        }

        .audit-badge-risk {
          background: #fef2f2;
          color: var(--audit-red);
        }

        .audit-side-stack {
          display: grid;
          gap: 18px;
          align-content: start;
        }

        .audit-alert {
          padding: 16px;
          border-radius: 18px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          margin-bottom: 12px;
        }

        .audit-alert:last-child {
          margin-bottom: 0;
        }

        .audit-alert strong {
          display: block;
          color: #9a3412;
          margin-bottom: 6px;
        }

        .audit-alert p {
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
          color: #9a3412;
        }

        .audit-status-list {
          display: grid;
          gap: 10px;
        }

        .audit-status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 13px 14px;
          border-radius: 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .audit-status-row span {
          color: var(--audit-muted);
          font-size: 13px;
        }

        .audit-status-row strong {
          font-size: 15px;
        }

        .audit-text-green {
          color: var(--audit-green);
        }

        .audit-text-amber {
          color: var(--audit-amber);
        }

        .audit-text-red {
          color: var(--audit-red);
        }

        .audit-text-purple {
          color: var(--audit-purple);
        }

        .audit-timeline {
          display: grid;
          gap: 14px;
        }

        .audit-timeline-item {
          display: grid;
          grid-template-columns: 26px minmax(0, 1fr);
          gap: 10px;
        }

        .audit-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: var(--audit-ai-blue);
          margin-top: 5px;
          box-shadow: 0 0 0 6px #dbeafe;
        }

        .audit-timeline-item strong {
          display: block;
          font-size: 14px;
        }

        .audit-timeline-item p {
          margin: 4px 0 0;
          color: var(--audit-muted);
          font-size: 13px;
          line-height: 1.5;
        }

        .audit-log-heading {
          margin-top: 26px;
        }

        @media (max-width: 1100px) {
          .audit-compliance-shell {
            grid-template-columns: 1fr;
          }

          .audit-sidebar {
            display: none;
          }

          .audit-kpis,
          .audit-content-grid,
          .audit-feature-grid {
            grid-template-columns: 1fr;
          }

          .audit-hero {
            flex-direction: column;
          }

          .audit-actions {
            justify-content: flex-start;
          }
        }

        @media (max-width: 720px) {
          .audit-main {
            padding: 22px;
          }

          .audit-hero h2 {
            font-size: 28px;
          }

          .audit-card {
            border-radius: 18px;
            padding: 18px;
          }
        }
      `}</style>

      <div className="audit-compliance-shell">
        <aside className="audit-sidebar">
          <div className="audit-brand">
            <div className="audit-logo" aria-hidden="true">
              NX
            </div>
            <div>
              <h1>Med AI NexSure</h1>
              <p>Enterprise Healthcare Intelligence</p>
            </div>
          </div>

          <nav aria-label="Audit and compliance navigation">
            {navGroups.map((group) => (
              <div key={group.title}>
                <div className="audit-nav-title">{group.title}</div>
                {group.items.map((item) => (
                  <div
                    className={`audit-nav-item ${
                      item === "Audit & Compliance" ? "audit-nav-item-active" : ""
                    }`}
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <main className="audit-main">
          <section className="audit-hero" aria-labelledby="audit-page-title">
            <div>
              <div className="audit-eyebrow">Audit-Ready Governance Layer</div>
              <h2 id="audit-page-title">Audit & Compliance</h2>
              <p className="audit-subtitle">
                ติดตามประวัติการใช้งานและรองรับการตรวจสอบตาม PDPA พร้อมควบคุมการเข้าถึงข้อมูลสุขภาพ เอกสารเคลม และกิจกรรมสำคัญในระบบอย่างเป็นมาตรฐาน Enterprise
              </p>
            </div>

            <div className="audit-actions">
              <button className="audit-button audit-secondary" type="button">
                Apply Filter
              </button>
              <button className="audit-button audit-primary" type="button">
                Export Audit Report
              </button>
            </div>
          </section>

          <section className="audit-kpis" aria-label="Audit compliance KPIs">
            {kpis.map((kpi) => (
              <article className="audit-card" key={kpi.label}>
                <div className="audit-kpi-label">{kpi.label}</div>
                <div className="audit-kpi-value">{kpi.value}</div>
                <div className="audit-kpi-desc">{kpi.description}</div>
              </article>
            ))}
          </section>

          <section className="audit-content-grid">
            <div className="audit-card">
              <SectionHead
                title="Governance Modules"
                description="ศูนย์กลางการตรวจสอบย้อนหลัง ควบคุมการใช้งานข้อมูล และรองรับมาตรฐาน PDPA สำหรับ Healthcare & Insurance workflow"
              />

              <div className="audit-feature-grid">
                {governanceModules.map((module) => (
                  <article className="audit-feature" key={module.id}>
                    <div className="audit-feature-icon" aria-hidden="true">
                      {module.id}
                    </div>
                    <h4>{module.title}</h4>
                    <p>{module.description}</p>
                  </article>
                ))}
              </div>

              <div className="audit-log-heading">
                <SectionHead
                  title="Recent Audit Log"
                  description="Immutable audit trail สำหรับ View, Edit, Export, Approve และ Access-sensitive events"
                />
              </div>

              <div className="audit-table-wrap">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th scope="col">Time</th>
                      <th scope="col">User / Role</th>
                      <th scope="col">Action</th>
                      <th scope="col">Module</th>
                      <th scope="col">Patient / Visit</th>
                      <th scope="col">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={`${log.time}-${log.user}-${log.module}`}>
                        <td>{log.time}</td>
                        <td>
                          {log.user}
                          <br />
                          <small>{log.role}</small>
                        </td>
                        <td>
                          <Badge className={actionClass[log.action]}>{log.action}</Badge>
                        </td>
                        <td>{log.module}</td>
                        <td>{log.patientVisit}</td>
                        <td>
                          {log.risk === "High" ? (
                            <Badge className="audit-badge-risk">{log.risk}</Badge>
                          ) : (
                            log.risk
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="audit-side-stack">
              <section className="audit-card">
                <SectionHead
                  title="PDPA Consent"
                  description="ตรวจสอบสถานะ Consent ก่อนเข้าถึงหรือ Export ข้อมูล"
                />

                <div className="audit-status-list">
                  {consentStatuses.map((status) => (
                    <div className="audit-status-row" key={status.label}>
                      <span>{status.label}</span>
                      <strong className={consentClass[status.tone]}>{status.value}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="audit-card">
                <SectionHead
                  title="Compliance Alerts"
                  description="แจ้งเตือนกิจกรรมที่มีความเสี่ยงด้านข้อมูลสุขภาพและประกัน"
                />

                {alerts.map((alert) => (
                  <div className="audit-alert" key={alert.title}>
                    <strong>{alert.title}</strong>
                    <p>{alert.description}</p>
                  </div>
                ))}
              </section>

              <section className="audit-card">
                <SectionHead
                  title="User Activity Timeline"
                  description="กิจกรรมล่าสุดจากผู้ใช้งานในระบบ"
                />

                <div className="audit-timeline">
                  {timelineItems.map((item) => (
                    <div className="audit-timeline-item" key={item.title}>
                      <div className="audit-dot" aria-hidden="true" />
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
