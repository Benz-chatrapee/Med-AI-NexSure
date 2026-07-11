"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  aiAlerts,
  caseRows,
  economicAlert,
  economicItems,
  evidencePackage,
  kpis,
  navGroups,
  patientInfo,
  readinessChecklist,
  safetyAlert,
  soapSections,
  timelineItems,
  topBadges,
} from "./visit-management-content";
import type { Alert, Badge, ChecklistItem } from "./visit-management-types";

function BadgePill({ badge }: { badge: Badge }) {
  const toneClass = badge.tone === "ai" ? "ai-badge" : badge.tone;
  return <span className={`badge ${toneClass}`}>{badge.label}</span>;
}

function AlertBox({ alert }: { alert: Alert }) {
  return (
    <div className={`alert alert-${alert.tone}`}>
      {alert.title ? (
        <>
          <strong>{alert.title}</strong>
          <br />
        </>
      ) : null}
      {alert.body}
    </div>
  );
}

function InfoList({
  className = "",
  items,
}: {
  className?: string;
  items: ChecklistItem[];
}) {
  return (
    <ul className={`list ${className}`}>
      {items.map((item) => (
        <li key={`${item.label}-${item.value}`}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </li>
      ))}
    </ul>
  );
}

export function VisitManagementPage() {
  return (
    <>
      <style>{`
:root{--primary:#1E3A8A;--deep:#0F2A5F;--ai:#2563EB;--soft-blue:#EFF6FF;--blue-border:#BFDBFE;--white:#FFFFFF;--bg:#F8FAFC;--border:#E2E8F0;--text:#0F172A;--muted:#64748B;--success:#16A34A;--warning:#F59E0B;--danger:#DC2626;--shadow:0 8px 24px rgba(15,42,95,.06)}*{box-sizing:border-box}body{margin:0;font-family:Inter,"IBM Plex Sans",Arial,sans-serif;background:var(--bg);color:var(--text)}.app{display:grid;grid-template-columns:280px 1fr;min-height:100vh}.sidebar{background:var(--deep);color:white;padding:24px 18px}.logo{font-size:23px;font-weight:800}.logo span{color:#38BDF8}.sidebar-sub{font-size:12px;color:#BFDBFE;margin-top:4px}.nav-title{margin:26px 0 8px;font-size:11px;text-transform:uppercase;color:#93C5FD;letter-spacing:.08em}.nav-item{padding:11px 12px;border-radius:12px;color:#DBEAFE;font-size:14px;margin-bottom:5px}.nav-item.active{background:var(--ai);color:white}.main{display:flex;flex-direction:column}.topbar{height:76px;background:white;border-bottom:1px solid var(--border);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}.breadcrumb{font-size:13px;color:var(--muted)}.title{font-size:22px;font-weight:800;margin-top:4px}.command{display:flex;gap:10px;align-items:center}.search{width:260px;padding:10px 12px;border:1px solid var(--border);border-radius:12px;color:var(--muted)}.badge{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700}.ai-badge{background:var(--soft-blue);color:var(--ai);border:1px solid var(--blue-border)}.ready{background:#ECFDF5;color:#047857}.review{background:#FFFBEB;color:#92400E}.risk{background:#FEF2F2;color:#991B1B}.content{padding:22px 24px 90px}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:18px}.card{background:white;border:1px solid var(--border);border-radius:18px;padding:18px;box-shadow:var(--shadow)}.kpi-card{border-top:4px solid var(--primary)}.kpi-label{font-size:13px;color:var(--muted)}.kpi-value{margin-top:8px;font-size:30px;font-weight:800;color:var(--deep)}.kpi-note{margin-top:6px;font-size:12px;color:var(--muted)}.dashboard{display:grid;grid-template-columns:1.25fr .9fr .85fr;gap:16px}.section-title{font-size:16px;font-weight:800;color:var(--deep);margin-bottom:14px}.table{width:100%;border-collapse:collapse;font-size:13px}.table th{text-align:left;color:var(--muted);font-weight:700;padding:10px;border-bottom:1px solid var(--border)}.table td{padding:12px 10px;border-bottom:1px solid #F1F5F9}.progress-ring{width:118px;height:118px;border-radius:50%;background:conic-gradient(var(--warning) 0 86%, #E2E8F0 86% 100%);display:flex;align-items:center;justify-content:center}.progress-inner{width:82px;height:82px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:25px;color:var(--deep)}.score-row{display:flex;gap:16px;align-items:center}.alert{padding:13px;border-radius:14px;margin-bottom:10px;font-size:13px;line-height:1.45}.alert-ai{background:#F8FBFF;border:1px solid var(--blue-border);border-left:5px solid var(--ai);color:#1D4ED8}.alert-risk{background:white;border:1px solid #FECACA;border-left:5px solid var(--danger);color:#991B1B}.alert-econ{background:#F0FDFA;border:1px solid #99F6E4;border-left:5px solid #0F766E;color:#115E59}.list{list-style:none;padding:0;margin:0}.list li{display:flex;justify-content:space-between;gap:10px;padding:11px;background:#F8FAFC;border-radius:12px;margin-bottom:8px;font-size:13px}.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}.timeline{border-left:2px solid var(--border);padding-left:14px;font-size:13px;color:#334155}.timeline p{margin:0 0 14px}.soap-layout{display:grid;grid-template-columns:24% 46% 30%;gap:16px;margin-top:16px}details{border:1px solid var(--border);border-radius:16px;overflow:hidden;background:white;margin-bottom:12px}summary{padding:14px 16px;font-weight:800;color:var(--deep);border-left:4px solid var(--ai);cursor:pointer}.form-body{padding:16px}label{font-size:13px;font-weight:700;color:#334155;display:block;margin-top:12px}input,textarea{width:100%;padding:11px;border:1px solid #CBD5E1;border-radius:12px;margin-top:6px;font-size:14px}textarea{min-height:80px}.action-bar{position:fixed;left:280px;right:0;bottom:0;background:white;border-top:1px solid var(--border);padding:14px 24px;display:flex;justify-content:flex-end;gap:10px}button{border:0;border-radius:12px;padding:10px 14px;font-weight:700;cursor:pointer}.btn-primary{background:var(--primary);color:white}.btn-ai{background:var(--soft-blue);color:var(--ai);border:1px solid var(--blue-border)}.btn-secondary{background:white;color:#334155;border:1px solid #CBD5E1}@media(max-width:1200px){.app{grid-template-columns:1fr}.sidebar{display:none}.dashboard,.soap-layout,.grid-2{grid-template-columns:1fr}.kpis{grid-template-columns:repeat(2,1fr)}.action-bar{left:0}}
      `}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            Med AI <span>NexSure</span>
          </div>
          <div className="sidebar-sub">Healthcare & Insurance Intelligence</div>
          {navGroups.map((group) => (
            <div key={group.title}>
              <div className="nav-title">{group.title}</div>
              {group.items.map((item) => (
                <div className={`nav-item${item.active ? " active" : ""}`} key={item.label}>
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </aside>
        <main className="main">
          <header className="topbar">
            <div>
              <div className="breadcrumb">
                Enterprise / Healthcare Intelligence / Command Center
              </div>
              <div className="title">Med AI NexSure Command Center</div>
            </div>
            <div className="command">
              <Input
                aria-label="Search patient, visit, claim"
                className="search"
                readOnly
                value="Search patient, visit, claim..."
              />
              {topBadges.map((badge) => (
                <BadgePill badge={badge} key={badge.label} />
              ))}
            </div>
          </header>
          <section className="content">
            <div className="kpis">
              {kpis.map((kpi) => (
                <div className="card kpi-card" key={kpi.label}>
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-value">{kpi.value}</div>
                  <div className="kpi-note">{kpi.note}</div>
                </div>
              ))}
            </div>
            <div className="dashboard">
              <div className="card">
                <div className="section-title">Enterprise Case List</div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Visit</th>
                      <th>Patient</th>
                      <th>Clinical</th>
                      <th>Claim</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caseRows.map((row) => (
                      <tr key={row.visit}>
                        <td>{row.visit}</td>
                        <td>{row.patient}</td>
                        <td>{row.clinical}</td>
                        <td><BadgePill badge={row.claim} /></td>
                        <td><BadgePill badge={row.risk} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card">
                <div className="section-title">Claim Readiness Overview</div>
                <div className="score-row">
                  <div className="progress-ring"><div className="progress-inner">86%</div></div>
                  <div>
                    <BadgePill badge={{ label: "⚠ Needs Review", tone: "review" }} />
                    <p className="text-[13px] text-[var(--muted)]">
                      Missing ICD-10 and medical certificate before insurance export.
                    </p>
                  </div>
                </div>
                <InfoList className="mt-[14px]" items={readinessChecklist} />
              </div>
              <div className="card">
                <div className="section-title">AI Intelligence Panel</div>
                {aiAlerts.map((alert) => (
                  <AlertBox alert={alert} key={`${alert.title}-${alert.body}`} />
                ))}
              </div>
            </div>
            <div className="grid-2">
              <div className="card">
                <div className="section-title">Economic Intelligence</div>
                <AlertBox alert={economicAlert} />
                <InfoList items={economicItems} />
              </div>
              <div className="card">
                <div className="section-title">Audit & Compliance Timeline</div>
                <div className="timeline">
                  {timelineItems.map((item) => (
                    <p key={`${item.time}-${item.event}`}>
                      <strong>{item.time}</strong>
                      <br />
                      {item.event}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            <div className="soap-layout">
              <aside className="card">
                <div className="section-title">Patient 360°</div>
                <InfoList items={patientInfo} />
                <div className="mt-[14px]"><AlertBox alert={safetyAlert} /></div>
              </aside>
              <section className="card">
                <div className="section-title">Enterprise SOAP Note</div>
                {soapSections.map((section) => (
                  <details open key={section.title}>
                    <summary>{section.title}</summary>
                    <div className="form-body">
                      {section.fields.map((field) => (
                        <div key={`${section.title}-${field.label}`}>
                          <label>{field.label}</label>
                          {field.kind === "input" ? (
                            <Input readOnly value={field.value} />
                          ) : (
                            <textarea readOnly value={field.value} />
                          )}
                        </div>
                      ))}
                      {section.alert ? <AlertBox alert={section.alert} /> : null}
                    </div>
                  </details>
                ))}
              </section>
              <aside className="card">
                <div className="section-title">Evidence Package</div>
                <InfoList items={evidencePackage} />
                <Button className="btn-ai mt-[12px] w-full">Generate Evidence Package</Button>
                <Button className="btn-secondary mt-[8px] w-full">Export PDF</Button>
              </aside>
            </div>
          </section>
          <div className="action-bar">
            <Button className="btn-secondary">Save Draft</Button>
            <Button className="btn-ai">AI Assist</Button>
            <Button className="btn-secondary">Generate Evidence</Button>
            <Button className="btn-primary">Finalize & Sign</Button>
          </div>
        </main>
      </div>
    </>
  );
}
