"use client";

import {
  caseRows,
  contextItems,
  differentialDiagnoses,
  icdSuggestions,
  impactCards,
  kpis,
  missingEvidenceChecklist,
  navItems,
  recommendationCards,
  soapSections,
  systemCards,
  timelineItems,
  traceItems,
} from "./ai-clinical-engine-content";
import type { Pill as PillType } from "./ai-clinical-engine-types";

function Pill({ pill, prefix }: { pill: PillType; prefix?: string }) {
  return <span className={`pill ${pill.tone}`}>{prefix ? `${prefix} ${pill.label}` : pill.label}</span>;
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="confidence">
      <div className="bar">
        <i style={{ width: `${value}%` }} />
      </div>
      <span className="score">{value}%</span>
    </div>
  );
}

export function AiClinicalEnginePage() {
  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
:root{--primary:#1E3A8A;--deep:#0F2A5F;--deep2:#071B42;--ai:#2563EB;--soft:#EFF6FF;--blue-border:#BFDBFE;--azure:#38BDF8;--bg:#F8FAFC;--surface:#FFFFFF;--section:#F1F5F9;--border:#E2E8F0;--text:#0F172A;--muted:#64748B;--success:#059669;--warning:#D97706;--danger:#DC2626;--purple:#7C3AED;--shadow:0 16px 36px rgba(15,42,95,.08)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;color:var(--text)}
.app{display:grid;grid-template-columns:292px 1fr;min-height:100vh}.sidebar{background:linear-gradient(180deg,var(--deep),var(--deep2));color:white;padding:24px 18px;position:sticky;top:0;height:100vh;overflow:auto}.brand{display:flex;gap:12px;align-items:center;margin-bottom:26px}.logo{width:44px;height:44px;border-radius:16px;background:linear-gradient(135deg,var(--azure),var(--ai));display:grid;place-items:center;font-weight:900;box-shadow:0 14px 30px rgba(37,99,235,.35)}.brand h1{font-size:16px;margin:0}.brand p{font-size:11px;color:#BFDBFE;margin:4px 0 0}.nav-title{font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#93C5FD;margin:22px 10px 9px}.nav a{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:15px;color:#DBEAFE;text-decoration:none;font-size:13px;font-weight:750;margin:4px 0}.nav a.active,.nav a:hover{background:rgba(239,246,255,.14);color:white}.nav small{display:block;font-size:10px;color:#BFDBFE;font-weight:500;margin-top:2px}.main{min-width:0}.topbar{height:74px;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 28px;position:sticky;top:0;z-index:10}.search{width:460px;max-width:44vw;background:white;border:1px solid var(--border);border-radius:15px;padding:12px 14px;color:var(--muted);font-size:13px;display:flex;gap:10px;align-items:center}.top-actions{display:flex;gap:10px;align-items:center}.org,.icon-btn,.profile{border:1px solid var(--border);background:white;border-radius:15px;padding:10px 12px;font-size:13px;font-weight:800;color:var(--text)}.icon-btn{width:42px;height:42px;display:grid;place-items:center}.ai-btn{background:var(--soft);border-color:var(--blue-border);color:var(--ai)}.content{padding:28px;max-width:1580px;margin:0 auto}.hero{background:linear-gradient(135deg,#fff 0%,#fff 58%,var(--soft) 100%);border:1px solid var(--border);border-radius:26px;padding:26px;box-shadow:var(--shadow);display:flex;justify-content:space-between;gap:24px;align-items:flex-start}.eyebrow{font-size:12px;font-weight:900;color:var(--ai);letter-spacing:.09em;text-transform:uppercase}.hero h2{font-size:32px;margin:8px 0 8px;letter-spacing:-.045em}.hero p{margin:0;color:var(--muted);font-size:14px;line-height:1.75;max-width:860px}.hero-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}.btn{border:0;border-radius:15px;padding:11px 15px;font-weight:900;font-size:13px;cursor:pointer}.btn.primary{background:var(--primary);color:white}.btn.secondary{background:white;color:var(--primary);border:1px solid var(--blue-border)}.btn.ghost{background:var(--section);color:var(--text);border:1px solid var(--border)}.btn.danger{background:#FEF2F2;color:var(--danger);border:1px solid #FECACA}.btn.success{background:#ECFDF5;color:var(--success);border:1px solid #A7F3D0}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:18px}.card{background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:18px;box-shadow:0 10px 24px rgba(15,23,42,.04)}.kpi .icon{width:38px;height:38px;border-radius:14px;display:grid;place-items:center;background:var(--soft);color:var(--ai);font-weight:900;margin-bottom:12px}.kpi .label{font-size:13px;color:var(--muted);font-weight:800}.kpi .value{font-size:31px;font-weight:900;margin:9px 0 2px;letter-spacing:-.04em}.kpi .note{font-size:12px;color:var(--muted);line-height:1.55}.grid{display:grid;grid-template-columns:1.25fr .95fr;gap:18px;margin-top:18px}.workspace{display:grid;grid-template-columns:.92fr 1.2fr .92fr;gap:18px;margin-top:18px;align-items:start}.section-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}.section-head h3{margin:0;font-size:16px}.section-head p{margin:4px 0 0;color:var(--muted);font-size:12px;line-height:1.55}.pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:900;border:1px solid var(--border);white-space:nowrap}.pill.ai{color:var(--ai);background:var(--soft);border-color:var(--blue-border)}.pill.success{color:var(--success);background:#ECFDF5;border-color:#A7F3D0}.pill.warn{color:var(--warning);background:#FFFBEB;border-color:#FDE68A}.pill.danger{color:var(--danger);background:#FEF2F2;border-color:#FECACA}.pill.gray{color:#475569;background:#F8FAFC}.pill.purple{color:var(--purple);background:#F5F3FF;border-color:#DDD6FE}.context{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}.context div{padding:13px;border:1px solid var(--border);border-radius:16px;background:white}.context span{display:block;font-size:11px;color:var(--muted);font-weight:800}.context b{font-size:13px;margin-top:5px;display:block}.soap-box{background:#F8FAFC;border:1px solid var(--border);border-radius:16px;padding:14px;margin:12px 0}.soap-box b{display:block;margin-bottom:6px}.soap-box p{margin:0;color:var(--muted);font-size:13px;line-height:1.65}.ai-panel{border:1px solid var(--blue-border);background:linear-gradient(180deg,#fff 0%,var(--soft) 100%);box-shadow:0 16px 36px rgba(37,99,235,.08)}.ai-card{border:1px solid var(--blue-border);background:white;border-radius:18px;padding:16px;margin-bottom:12px}.ai-card h4{margin:0 0 8px;font-size:14px;color:var(--primary)}.ai-card p,.list p{margin:0;color:var(--muted);font-size:13px;line-height:1.62}.confidence{display:flex;align-items:center;gap:12px;margin-top:12px}.bar{height:10px;background:#DBEAFE;border-radius:999px;overflow:hidden;flex:1}.bar i{display:block;height:100%;background:var(--ai);border-radius:999px}.score{font-weight:900;color:var(--ai)}.row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;border-top:1px solid var(--border);padding:12px 0}.row:first-child{border-top:0}.code{font-weight:900;color:var(--primary)}.muted{color:var(--muted);font-size:12px;line-height:1.5}.warning-box{background:#FFFBEB;border:1px solid #FDE68A;color:#92400E;border-radius:16px;padding:14px;font-size:13px;line-height:1.65;margin-top:12px}.danger-box{background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;border-radius:16px;padding:14px;font-size:13px;line-height:1.65;margin-bottom:12px}.safety{border:1px solid #FECACA;background:#FEF2F2;color:#991B1B;border-radius:18px;padding:16px;margin-top:18px;display:flex;gap:12px;align-items:flex-start}.safety b{display:block;margin-bottom:4px}.safety p{margin:0;font-size:13px;line-height:1.6}.drawer{background:white;border:1px solid var(--border);border-radius:18px;padding:16px}.trace{border-left:3px solid var(--ai);padding-left:12px;margin:12px 0}.trace b{font-size:13px}.trace p{margin:4px 0 0;color:var(--muted);font-size:12px;line-height:1.55}.audit .row{align-items:center}.dot{width:10px;height:10px;border-radius:999px;background:var(--ai);box-shadow:0 0 0 4px var(--soft)}table{width:100%;border-collapse:collapse}th{text-align:left;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em;padding:12px;border-bottom:1px solid var(--border)}td{padding:14px 12px;border-bottom:1px solid var(--border);font-size:13px;vertical-align:middle}tr:hover{background:#F8FAFC}.impact{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:18px}.impact .card{border-top:4px solid var(--primary)}.empty{border:1px dashed var(--blue-border);background:var(--soft);border-radius:18px;padding:18px;text-align:center;color:var(--muted);font-size:13px;line-height:1.65}.system{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:18px}.system .card{box-shadow:none}.footer-note{margin-top:18px;color:var(--muted);font-size:12px;text-align:center}
@media(max-width:1180px){.app{grid-template-columns:1fr}.sidebar{display:none}.workspace,.grid,.kpis,.impact,.context,.system{grid-template-columns:1fr}.search{display:none}.hero{flex-direction:column}.topbar{padding:0 16px}.content{padding:18px}}
      `}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <div className="logo">NX</div>
            <div>
              <h1>Med AI NexSure</h1>
              <p>Enterprise Healthcare & Insurance Intelligence</p>
            </div>
          </div>
          <div className="nav-title">Enterprise Modules</div>
          <nav className="nav" aria-label="Enterprise Modules">
            {navItems.map((item) => (
              <a className={item.active ? "active" : undefined} href="#" key={item.label}>
                <span>{item.icon}</span>
                <div>
                  {item.label}
                  <small>{item.description}</small>
                </div>
              </a>
            ))}
          </nav>
        </aside>
        <main className="main">
          <header className="topbar">
            <div className="search">🔎 Search patient, visit, ICD-10, claim case, audit event</div>
            <div className="top-actions">
              <button className="org" type="button">Bangkok Care Network ▾</button>
              <button className="icon-btn ai-btn" type="button">AI</button>
              <button className="icon-btn" type="button">🔔</button>
              <button className="profile" type="button">Dr. Benz ▾</button>
            </div>
          </header>
          <section className="content">
            <div className="hero">
              <div>
                <div className="eyebrow">AI Clinical Engine · Decision Support Workspace</div>
                <h2>AI Clinical Engine</h2>
                <p>สรุป SOAP, แนะนำ ICD-10, วิเคราะห์ Differential Diagnosis และตรวจ Clinical Correlation เพื่อช่วยแพทย์ตัดสินใจอย่างปลอดภัย พร้อม Explainability, Confidence Score และ Audit Trail สำหรับงานคลินิก ประกัน และ Compliance</p>
              </div>
              <div className="hero-actions">
                <button className="btn primary" type="button">Generate AI Summary</button>
                <button className="btn secondary" type="button">Open Explainability</button>
                <button className="btn ghost" type="button">Export Evidence</button>
              </div>
            </div>

            <div className="context">
              {contextItems.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <b>{item.value}</b>
                </div>
              ))}
            </div>

            <div className="kpis">
              {kpis.map((kpi) => (
                <div className="card kpi" key={kpi.label}>
                  <div className="icon">{kpi.icon}</div>
                  <div className="label">{kpi.label}</div>
                  <div className="value">{kpi.value}</div>
                  <div className="note">{kpi.note}</div>
                </div>
              ))}
            </div>

            <div className="safety">
              <div>⚠️</div>
              <div>
                <b>Clinical Safety Notice</b>
                <p>AI recommendation must be reviewed by a licensed clinician before clinical use. ระบบ AI เป็น Decision Support เท่านั้น ไม่ใช่ผู้วินิจฉัยหรือสั่งการรักษาแทนแพทย์</p>
              </div>
            </div>

            <div className="grid">
              <div className="card">
                <div className="section-head">
                  <div>
                    <h3>AI Case List</h3>
                    <p>Track AI status, review progress, and clinician decision for each visit.</p>
                  </div>
                  <span className="pill ai">● AI Monitoring</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Visit ID</th>
                      <th>Patient</th>
                      <th>AI Status</th>
                      <th>Confidence</th>
                      <th>Claim Impact</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caseRows.map((row) => (
                      <tr key={row.visitId}>
                        <td>{row.visitId}</td>
                        <td>{row.patient}</td>
                        <td><Pill pill={row.aiStatus} /></td>
                        <td>{row.confidence}</td>
                        <td><Pill pill={row.claimImpact} /></td>
                        <td><button className={`btn ${row.action.variant}`} type="button">{row.action.label}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card ai-panel">
                <div className="section-head">
                  <div>
                    <h3>AI Recommendation Panel</h3>
                    <p>ข้อเสนอแนะที่ต้องตรวจสอบโดยแพทย์ก่อนนำไปใช้</p>
                  </div>
                  <span className="pill ai">AI Assisted</span>
                </div>
                {recommendationCards.map((card) => (
                  <div className="ai-card" key={card.title}>
                    <h4>{card.title}</h4>
                    <p>{card.body}</p>
                    {card.confidence ? <ConfidenceBar value={card.confidence} /> : null}
                  </div>
                ))}
                <button className="btn primary" type="button">Review Recommendation</button>
              </div>
            </div>

            <div className="workspace">
              <div className="card">
                <div className="section-head">
                  <div>
                    <h3>Clinical Workspace</h3>
                    <p>SOAP source data used by AI Clinical Engine.</p>
                  </div>
                  <span className="pill success">Consent Verified</span>
                </div>
                {soapSections.map((section) => (
                  <div className="soap-box" key={section.title}>
                    <b>{section.title}</b>
                    <p>{section.body}</p>
                  </div>
                ))}
                <div className="warning-box">ข้อมูลทางคลินิกควรระบุ Red Flag และ Follow-up instruction ให้ครบถ้วนก่อนส่งเคลม</div>
              </div>

              <div className="card ai-panel">
                <div className="section-head">
                  <div>
                    <h3>AI Clinical Insight</h3>
                    <p>AI-generated summary, ICD suggestion, differential diagnosis and correlation analysis.</p>
                  </div>
                  <span className="pill ai">Generated · v1.3</span>
                </div>
                <div className="ai-card">
                  <h4>AI SOAP Summary</h4>
                  <p>Patient presents with acute fever, cough, and sore throat for 2 days. Vital signs are stable with mild fever and normal oxygen saturation. Findings support uncomplicated upper respiratory infection with no current respiratory distress.</p>
                  <ConfidenceBar value={94} />
                </div>
                <div className="ai-card">
                  <h4>AI ICD Suggestion</h4>
                  {icdSuggestions.map((suggestion) => (
                    <div className="row" key={suggestion.code}>
                      <div>
                        <div className="code">{suggestion.code} · {suggestion.description}</div>
                        <div className="muted">{suggestion.support}</div>
                      </div>
                      <Pill pill={suggestion.status} />
                    </div>
                  ))}
                </div>
                <div className="ai-card">
                  <h4>AI Differential Diagnosis</h4>
                  {differentialDiagnoses.map((diagnosis) => (
                    <div className="row" key={diagnosis.label}>
                      <div>
                        <b>{diagnosis.label}</b>
                        <div className="muted">{diagnosis.note}</div>
                      </div>
                      <span className="score">{diagnosis.score}</span>
                    </div>
                  ))}
                </div>
                <div className="ai-card">
                  <h4>Clinical Correlation</h4>
                  <p>Symptoms, vital signs and assessment are clinically aligned. Prescription should remain symptomatic unless bacterial evidence is documented.</p>
                </div>
              </div>

              <div className="card">
                <div className="section-head">
                  <div>
                    <h3>Intelligence Panel</h3>
                    <p>Claim, evidence, cost and audit readiness.</p>
                  </div>
                  <span className="pill ai">Enterprise AI</span>
                </div>
                <div className="ai-card">
                  <h4>Claim Readiness</h4>
                  <div className="row">
                    <div>
                      <b>Ready</b>
                      <div className="muted">SOAP, ICD-10 and prescription are aligned.</div>
                    </div>
                    <span className="pill success">Ready</span>
                  </div>
                  <div className="confidence">
                    <div className="bar"><i style={{ width: "92%" }} /></div>
                    <span className="score">92</span>
                  </div>
                </div>
                <div className="ai-card">
                  <h4>Missing Evidence Checklist</h4>
                  {missingEvidenceChecklist.map((item) => (
                    <div className="row" key={item.label}>
                      <div>{item.label}</div>
                      <Pill pill={item.status} />
                    </div>
                  ))}
                </div>
                <div className="ai-card">
                  <h4>Economic Intelligence</h4>
                  <p>Visit cost is within expected range. No high-cost anomaly detected.</p>
                  <div className="row">
                    <div>
                      <b>Visit Cost</b>
                      <div className="muted">Estimated OPD cost</div>
                    </div>
                    <b>1,280 THB</b>
                  </div>
                </div>
                <div className="danger-box">
                  <b>Priority Alert</b>
                  <br />
                  Clinical safety alerts must be reviewed before claim or financial processing.
                </div>
              </div>
            </div>

            <div className="grid">
              <div className="drawer">
                <div className="section-head">
                  <div>
                    <h3>Explainability</h3>
                    <p>Traceable reasoning for AI recommendation and ICD suggestion.</p>
                  </div>
                  <span className="pill ai">Transparent AI</span>
                </div>
                {traceItems.map((item) => (
                  <div className="trace" key={item.title}>
                    <b>{item.title}</b>
                    <p>{item.body}</p>
                  </div>
                ))}
              </div>
              <div className="card audit">
                <div className="section-head">
                  <div>
                    <h3>Recent Activity Timeline</h3>
                    <p>Audit-ready trace for generate, review, accept and reject actions.</p>
                  </div>
                  <span className="pill success">Audit Logged</span>
                </div>
                {timelineItems.map((item) => (
                  <div className="row" key={item.title}>
                    <span className="dot" />
                    <div>
                      <b>{item.title}</b>
                      <div className="muted">{item.detail}</div>
                    </div>
                    <Pill pill={item.status} />
                  </div>
                ))}
              </div>
            </div>

            <div className="system">
              {systemCards.map((card) => (
                <div className="card" key={card.title}>
                  <div className="section-head">
                    <div>
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                    </div>
                  </div>
                  <p className="muted">{card.body}</p>
                </div>
              ))}
            </div>

            <div className="impact">
              {impactCards.map((card) => (
                <div className="card" key={card.title}>
                  <h3>{card.title}</h3>
                  <p className="muted">{card.body}</p>
                </div>
              ))}
            </div>
            <p className="footer-note">Med AI NexSure · Enterprise Healthcare & Insurance Intelligence Platform · AI Decision Support with Human-in-the-Loop Governance</p>
          </section>
        </main>
      </div>
    </>
  );
}
