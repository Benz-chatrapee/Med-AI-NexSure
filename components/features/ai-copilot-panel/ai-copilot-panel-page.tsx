"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  activities,
  breakdownItems,
  cases,
  contextItems,
  costBenchmarkData,
  evidenceData,
  kpis,
  navItems,
  packageChecklist,
  queueData,
  readinessData,
  trendData,
} from "./ai-copilot-panel-content";
import type { ActivityItem, CaseFilters, CaseRow } from "./ai-copilot-panel-types";
import { badgeTone, currency, filterCases, scoreColor } from "./ai-copilot-panel-utils";

const defaultFilters: CaseFilters = {
  search: "",
  priority: "",
  visit: "",
  claim: "",
  payer: "",
  reviewer: "",
  chartVisit: "",
  chartClaim: "",
  evidence: "",
  sort: "priority",
};

function Badge({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return <span className={`badge ${tone ?? badgeTone(String(children))}`}>{children}</span>;
}

function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="progress">
      <span style={{ width: `${value}%`, ["--bar" as string]: color ?? scoreColor(value) }} />
    </div>
  );
}

function SectionHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        <div className="section-title">{title}</div>
        <div className="section-sub">{subtitle}</div>
      </div>
      {action}
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  return (
    <div className="spark">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.map((value, index) => ({ index, value }))}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function addActivity(action: string, module: ActivityItem["module"]): ActivityItem {
  return {
    id: Date.now(),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      timeZone: "Asia/Bangkok",
    }).format(new Date()),
    actor: "Current User",
    action,
    detail: "Interactive dashboard event · Audit logged",
    module,
  };
}

export function AiCopilotPanelPage() {
  const [filters, setFilters] = useState<CaseFilters>(defaultFilters);
  const [selectedCase, setSelectedCase] = useState<CaseRow | null>(null);
  const [activityFilter, setActivityFilter] = useState<"All" | ActivityItem["module"]>("All");
  const [activityItems, setActivityItems] = useState<ActivityItem[]>(activities);
  const [toast, setToast] = useState<string | null>(null);
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [icdAccepted, setIcdAccepted] = useState(false);

  const visibleCases = useMemo(() => filterCases(cases, filters), [filters]);
  const visibleActivities = activityItems.filter((item) => activityFilter === "All" || item.module === activityFilter);
  const activeFilterEntries = Object.entries(filters).filter(([key, value]) => key !== "sort" && value);

  function updateFilter(key: keyof CaseFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function notify(message: string, module: ActivityItem["module"] = "AI") {
    setToast(message);
    setActivityItems((current) => [addActivity(message, module), ...current]);
    window.setTimeout(() => setToast(null), 2800);
  }

  function clearFilters() {
    setFilters(defaultFilters);
    notify("All filters cleared", "Compliance");
  }

  function validatePackage() {
    const blockers = packageChecklist.filter((item) => ["Missing", "Needs Review"].includes(item.status));
    if (blockers.length > 0) {
      notify(`${blockers.length} prerequisite items require review before package generation`, "Insurance");
      return;
    }
    notify("Evidence Package generated successfully", "Insurance");
  }

  return (
    <>
      <style>{styles}</style>
      <div className="copilot-app">
        <aside className="sidebar" aria-label="Primary navigation">
          <div className="brand">
            <div className="brand-mark">NX</div>
            <div>
              <div className="brand-name">Med AI NexSure</div>
              <div className="brand-sub">Healthcare & Insurance Intelligence</div>
            </div>
          </div>
          {["Command Center", "Clinical Workflow", "Governance"].map((group) => (
            <nav className="nav-group" key={group} aria-label={group}>
              <div className="nav-label">{group}</div>
              {navItems
                .filter((item) => item.group === group)
                .map((item) => (
                  <a className={`nav-item ${item.active ? "active" : ""}`} href="#" key={item.label}>
                    <span className="nav-dot" />
                    {item.label}
                  </a>
                ))}
            </nav>
          ))}
          <div className="sidebar-foot">
            AI recommendations are explainable, logged, and governed by Human-in-the-Loop review. Decision Support Only.
          </div>
        </aside>

        <main className="main">
          <header className="sticky-header">
            <div className="header-row">
              <div>
                <div className="eyebrow">Epic 13 · AI Copilot Panel</div>
                <h1>Enterprise AI Copilot for clinical, claim, economic, and governance review.</h1>
                <div className="subtitle">
                  Real-time decision support across healthcare workflows. ศูนย์ช่วยตัดสินใจสำหรับทีมแพทย์ เคลม ประกัน และ Compliance
                </div>
              </div>
              <div className="header-actions">
                <select className="control" aria-label="Organization">
                  <option>Bangkok Care Network</option>
                  <option>NexSure Health Group</option>
                </select>
                <button className="btn ghost" type="button" onClick={() => notify("Dashboard export prepared", "Compliance")}>Export</button>
                <button className="btn secondary" type="button" onClick={() => notify("Dashboard data refreshed", "Compliance")}>Refresh</button>
              </div>
            </div>
            <div className="last-updated">Last Updated: 12 Jul 2026, 12:24 · Rule Version v2.4 · Demo Data</div>
            <section className="patient-context" aria-label="Patient context">
              {contextItems.map((item) => (
                <div className="context-item" key={item.label}>
                  <div className="context-label">{item.label}</div>
                  <div className="context-value">{item.badgeTone ? <Badge tone={item.badgeTone}>{item.value}</Badge> : item.value}</div>
                </div>
              ))}
            </section>
          </header>

          <section className="section" aria-labelledby="overview-title">
            <SectionHead
              title="Operational Intelligence Overview"
              subtitle="Clinical safety, claim readiness, AI confidence, and workflow blockers."
            />
            <div className="grid-4">
              {kpis.map((kpi) => (
                <article className="card kpi-card" key={kpi.title} style={{ ["--kpi" as string]: kpi.color }}>
                  <div className="kpi-title">{kpi.title}</div>
                  <div className="kpi-value">{kpi.value}</div>
                  <div className="kpi-meta">
                    <span className={`delta ${kpi.deltaTone}`}>{kpi.delta}</span>
                    <span className="target">{kpi.target}</span>
                  </div>
                  <Sparkline data={kpi.sparkline} color={kpi.color} />
                </article>
              ))}
            </div>
          </section>

          <section className="section">
            <SectionHead
              title="Clinical, Claim, Evidence, And Cost Signals"
              subtitle="Chart interactions filter the prioritized enterprise case worklist."
              action={<button className="btn ghost sm" type="button" onClick={clearFilters}>Reset Filters</button>}
            />
            <div className="grid-3">
              <article className="card">
                <div className="card-head">
                  <div>
                    <div className="card-title">Visit Queue Distribution</div>
                    <div className="card-sub">Waiting, consultation, evidence, and completion status</div>
                  </div>
                </div>
                <div className="chart-box">
                  <ResponsiveContainer>
                    <BarChart data={queueData} layout="vertical">
                      <CartesianGrid stroke="#EEF2F7" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={112} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} onClick={(data) => data.name && updateFilter("chartVisit", String(data.name))}>
                        {queueData.map((item) => <Cell fill={item.color} key={item.name} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="legend-list">
                  {queueData.map((item) => (
                    <button className="legend-item" key={item.name} type="button" onClick={() => updateFilter("chartVisit", item.name)}>
                      <i className="legend-swatch" style={{ background: item.color }} />
                      {item.name} {item.value}
                    </button>
                  ))}
                </div>
              </article>

              <article className="card">
                <div className="card-head">
                  <div>
                    <div className="card-title">Claim Readiness Distribution</div>
                    <div className="card-sub">Ready / Needs Review / Not Ready by case</div>
                  </div>
                  <Badge tone="green">72% Ready</Badge>
                </div>
                <div className="chart-box">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={readinessData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} onClick={(data) => data.name && updateFilter("chartClaim", String(data.name))}>
                        {readinessData.map((item) => <Cell fill={item.color} key={item.name} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="insight-strip">AI insight: documentation completeness and coding consistency remain the main readiness constraints.</div>
              </article>

              <article className="card">
                <div className="card-head">
                  <div>
                    <div className="card-title">Claim Ready Trend vs Target</div>
                    <div className="card-sub">Actual performance compared with target and previous period</div>
                  </div>
                </div>
                <div className="chart-box">
                  <ResponsiveContainer>
                    <LineChart data={trendData}>
                      <CartesianGrid stroke="#EEF2F7" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[55, 90]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Line dataKey="actual" stroke="#2563EB" strokeWidth={3} />
                      <Line dataKey="target" stroke="#DC2626" strokeDasharray="7 5" dot={false} />
                      <Line dataKey="previous" stroke="#94A3B8" strokeDasharray="3 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </div>
          </section>

          <section className="section">
            <div className="grid-2">
              <article className="card" id="scoreBreakdown">
                <SectionHead title="Claim Readiness Score Breakdown" subtitle="Explainable scoring, missing requirements, and recommended remediation." />
                <div className="breakdown-list">
                  {breakdownItems.map((item) => {
                    const percent = Math.round((item.score / item.max) * 100);
                    return (
                      <div className="breakdown-item" key={item.name}>
                        <div className="breakdown-top">
                          <div className="breakdown-name">{item.name}</div>
                          <div>
                            <Badge>{item.status}</Badge> <span className="breakdown-score">{item.score} / {item.max} · {percent}%</span>
                          </div>
                        </div>
                        <ProgressBar value={percent} />
                        <div className="breakdown-foot">
                          <span><b>Missing:</b> {item.missing}</span>
                          <span><b>Recommended:</b> {item.recommended}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="card">
                <SectionHead title="Evidence And Cost Intelligence" subtitle="Missing evidence ranking and economic benchmark signals." />
                <div className="grid-2 inner">
                  <div className="chart-box sm">
                    <ResponsiveContainer>
                      <BarChart data={evidenceData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={128} />
                        <Tooltip />
                        <Bar dataKey="cases" fill="#D97706" radius={[0, 8, 8, 0]} onClick={(data) => data.name && updateFilter("evidence", String(data.name))} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-box sm">
                    <ResponsiveContainer>
                      <BarChart data={costBenchmarkData}>
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `฿${Number(value).toLocaleString()}`} />
                        <Tooltip formatter={(value) => currency(Number(value))} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          <Cell fill="#DC2626" />
                          <Cell fill="#2563EB" />
                          <Cell fill="#D97706" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="insight-strip warning">Operational bottleneck: SOAP Assessment and ICD confirmation create the largest evidence drop-off.</div>
              </article>
            </div>
          </section>

          <section className="section" id="worklistSection" aria-labelledby="worklistTitle">
            <SectionHead
              title="Prioritized Enterprise Case Worklist"
              subtitle="Operational queue ordered by clinical safety, claim blockers, SLA exposure, and cost risk."
              action={<Badge tone="blue">{visibleCases.length} Cases</Badge>}
            />
            <article className="card">
              <div className="worklist-controls">
                <div className="search-box">
                  <input aria-label="Search cases" placeholder="Search patient, HN, evidence, reviewer..." type="search" value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} />
                </div>
                <select aria-label="Priority filter" value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value)}>
                  <option value="">All Priority</option><option>P0 Critical</option><option>P1 High</option><option>P2 Medium</option><option>P3 Low</option>
                </select>
                <select aria-label="Visit status filter" value={filters.visit} onChange={(event) => updateFilter("visit", event.target.value)}>
                  <option value="">All Visit Status</option><option>Waiting</option><option>In Consultation</option><option>Pending Evidence</option><option>Completed</option><option>Pharmacy</option>
                </select>
                <select aria-label="Claim status filter" value={filters.claim} onChange={(event) => updateFilter("claim", event.target.value)}>
                  <option value="">All Claim Status</option><option>Ready</option><option>Needs Review</option><option>Not Ready</option>
                </select>
                <select aria-label="Payer filter" value={filters.payer} onChange={(event) => updateFilter("payer", event.target.value)}>
                  <option value="">All Payers</option><option>AIA Health</option><option>Allianz Ayudhya</option><option>Muang Thai Life</option><option>Self Pay</option>
                </select>
                <select aria-label="Reviewer filter" value={filters.reviewer} onChange={(event) => updateFilter("reviewer", event.target.value)}>
                  <option value="">All Reviewers</option><option>Dr. Ananda</option><option>Ms. Nicha</option><option>Mr. Krit</option><option>Unassigned</option>
                </select>
                <select aria-label="Sort cases" value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}>
                  <option value="priority">Sort: Priority</option><option value="scoreAsc">Score: Low to High</option><option value="agingDesc">Aging: High to Low</option><option value="updatedDesc">Recently Updated</option>
                </select>
              </div>
              <div className="active-filters">
                <div className="chips">
                  <b>Active Filter:</b>
                  {activeFilterEntries.length === 0 ? <span className="muted">None</span> : activeFilterEntries.map(([key, value]) => (
                    <span className="filter-chip" key={key}>{key}: {value}<button aria-label={`Remove ${key} filter`} type="button" onClick={() => updateFilter(key as keyof CaseFilters, "")}>x</button></span>
                  ))}
                </div>
                <button className="clear-link" type="button" onClick={clearFilters}>Clear All</button>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Priority</th><th>Patient / HN</th><th>Visit Status</th><th>Readiness Score</th><th>Claim Status</th><th>Missing Evidence</th><th>AI Alert</th><th>Cost Status</th><th>Aging / SLA</th><th>Assigned Reviewer</th><th>Last Updated</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCases.map((caseRow) => (
                      <tr key={caseRow.id}>
                        <td><Badge>{caseRow.priority}</Badge></td>
                        <td><div className="patient-name">{caseRow.patient}</div><div className="muted">{caseRow.hn} · {caseRow.payer}</div></td>
                        <td><Badge>{caseRow.visit}</Badge></td>
                        <td className="score-cell"><div className="score-inline"><span>{caseRow.score} / 100</span><span>{caseRow.score >= 85 ? "Ready" : caseRow.score >= 60 ? "Needs Review" : "Not Ready"}</span></div><ProgressBar value={caseRow.score} /></td>
                        <td><Badge>{caseRow.claim}</Badge></td>
                        <td>{caseRow.evidence.length ? caseRow.evidence.map((item) => <Badge key={item}>{item}</Badge>) : <Badge tone="green">Complete</Badge>}</td>
                        <td><Badge>{caseRow.alert}</Badge></td>
                        <td><Badge>{caseRow.cost}</Badge></td>
                        <td><b>{caseRow.aging} min</b><br /><span className="muted">SLA {caseRow.sla || "—"} {caseRow.sla && caseRow.aging > caseRow.sla ? "· Breach" : "· Within"}</span></td>
                        <td>{caseRow.reviewer}</td>
                        <td>{caseRow.updated}</td>
                        <td><button className="btn secondary sm" type="button" onClick={() => setSelectedCase(caseRow)}>View Detail</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {visibleCases.length === 0 && <div className="empty-state">No cases match the selected filters.<br />ไม่พบเคสที่ตรงกับตัวกรอง กรุณาปรับเงื่อนไข</div>}
              </div>
            </article>
          </section>

          <section className="section" aria-labelledby="activityTitle">
            <SectionHead title="Recent Audit Activity" subtitle="Audit-ready event history with minimized PHI exposure." />
            <article className="card">
              <div className="timeline-filter">
                {(["All", "Clinical", "AI", "Insurance", "Compliance"] as const).map((module) => (
                  <button className={`btn sm ${activityFilter === module ? "secondary" : "ghost"}`} key={module} type="button" onClick={() => setActivityFilter(module)}>{module}</button>
                ))}
              </div>
              <div className="timeline">
                {visibleActivities.map((item) => (
                  <div className="timeline-item" key={item.id}>
                    <div className="timeline-time">{item.time} · {item.actor}</div>
                    <div className="timeline-action">{item.action}</div>
                    <div className="timeline-meta">{item.detail}</div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </main>

        <aside className={`ai-panel ${aiCollapsed ? "collapsed" : ""}`} aria-label="AI Copilot Panel">
          <div className="ai-head">
            <div className="ai-head-main"><div className="ai-orb">AI</div><div className="ai-head-copy"><div className="ai-title">AI Copilot Panel</div><div className="ai-sub">Clinical · Claim · Economic · Governance</div></div></div>
            <div className="ai-head-actions"><Badge tone="green">AI Ready</Badge><button className="btn ghost icon" type="button" onClick={() => setAiCollapsed((value) => !value)} aria-label={aiCollapsed ? "Expand AI Copilot Panel" : "Collapse AI Copilot Panel"}>{aiCollapsed ? "<" : ">"}</button></div>
          </div>
          <div className="ai-summary">
            <div className="mini-stat"><div className="mini-label">Last Evaluated</div><div className="mini-value">12:24</div></div>
            <div className="mini-stat"><div className="mini-label">Active Recommendations</div><div className="mini-value">5</div></div>
            <div className="mini-stat"><div className="mini-label">Human Review</div><div className="mini-value danger-text">2</div></div>
            <div className="mini-stat"><div className="mini-label">Confidence</div><div className="mini-value">88%</div></div>
          </div>
          <article className="ai-card score-card">
            <div className="ai-card-top"><div><div className="label">Claim Readiness Score</div><div className="score-number">78</div></div><Badge tone="amber">Needs Review</Badge></div>
            <ProgressBar value={78} color="#D97706" />
            <div className="ai-text"><b>Delta:</b> +4 points · <b>Blocking Issues:</b> 2<br /><b>Primary reasons:</b> Missing ICD-10 and SOAP Assessment incomplete.</div>
            <div className="ai-reason">Explainability: documentation completeness and coding consistency reduce the readiness score. Last evaluated 12:24.</div>
          </article>
          <article className="ai-card critical">
            <div className="ai-card-top"><div className="ai-card-title">Critical Clinical Safety Alert</div><Badge tone="red">Human Review</Badge></div>
            <div className="ai-text"><b>Allergy and prescription safety require authorized clinical review.</b><br />ระบบพบความเสี่ยงที่เกี่ยวข้องกับประวัติแพ้ยาและรายการยา ต้องได้รับการตรวจสอบโดยบุคลากรที่มีอำนาจก่อนดำเนินการต่อ</div>
            <div className="ai-reason">Potential penicillin allergy conflict detected in medication history. AI does not make the final clinical decision.</div>
            <div className="ai-actions"><button className="btn danger sm" type="button" onClick={() => { setSelectedCase(cases[0]); notify("Clinical safety review opened", "Clinical"); }}>Review Now</button></div>
          </article>
          <article className="ai-card warning">
            <div className="ai-card-top"><div className="ai-card-title">Claim Blocking Issues</div><Badge tone="red">2 Blockers</Badge></div>
            <div className="checklist"><div className="check-item"><span>ICD-10 Code</span><Badge tone={icdAccepted ? "green" : "red"}>{icdAccepted ? "Complete" : "Missing"}</Badge></div><div className="check-item"><span>SOAP Assessment</span><Badge tone="amber">Incomplete</Badge></div></div>
            <div className="ai-actions"><button className="btn secondary sm" type="button" onClick={() => updateFilter("evidence", "ICD Missing")}>View Impacted Cases</button></div>
          </article>
          <article className="ai-card">
            <div className="ai-card-top"><div className="ai-card-title">AI SOAP Review</div><Badge tone="amber">Medium Risk</Badge></div>
            <div className="ai-text"><b>Missing:</b> Assessment, Plan<br /><b>Recommended action:</b> Generate a reviewable draft; do not auto-apply clinical content.</div>
            <div className="confidence-head"><span>Confidence · 4 evidence sources</span><span>88%</span></div><ProgressBar value={88} color="#2563EB" />
            <div className="ai-actions"><button className="btn sm" type="button" onClick={() => notify("Reviewable SOAP draft generated; clinician approval required", "AI")}>Generate Draft</button><button className="btn ghost sm" type="button" onClick={() => notify("SOAP suggestion dismissed", "AI")}>Dismiss</button></div>
          </article>
          <article className="ai-card">
            <div className="ai-card-top"><div className="ai-card-title">ICD-10 Suggestion</div><Badge tone="green">High Confidence</Badge></div>
            <div className="ai-text">Suggested ICD-10:<br /><b>J06.9 - Acute upper respiratory infection</b><br />Evidence: fever, cough, sore throat, and clinical note pattern.</div>
            <div className="confidence-head"><span>Confidence · 4 evidence sources</span><span>92%</span></div><ProgressBar value={92} color="#059669" />
            <div className="ai-reason">Human confirmation is required before the code is added to the visit and claim record.</div>
            <div className="ai-actions"><button className="btn success sm" type="button" onClick={() => { setIcdAccepted(true); notify("ICD-10 accepted and audit logged", "Clinical"); }}>Accept ICD</button><button className="btn secondary sm" type="button" onClick={() => notify("ICD editor opened", "Clinical")}>Edit</button></div>
          </article>
          <article className="ai-card">
            <div className="ai-card-top"><div className="ai-card-title">Evidence Package</div><Badge tone="amber">Blocked</Badge></div>
            <div className="checklist">{packageChecklist.map((item) => <div className="check-item" key={item.name}><span>{item.name}</span><Badge>{item.status}</Badge></div>)}</div>
            <div className="ai-actions"><button className="btn sm" type="button" onClick={validatePackage}>Generate Evidence Package</button></div>
          </article>
          <article className="ai-card">
            <div className="ai-card-top"><div className="ai-card-title">Governance & Compliance</div><Badge tone="blue">Audit Ready</Badge></div>
            <div className="checklist"><div className="check-item"><span>PDPA Consent</span><Badge tone="green">Valid</Badge></div><div className="check-item"><span>Audit Logging</span><Badge tone="green">Active</Badge></div><div className="check-item"><span>Human Review Control</span><Badge tone="red">Required</Badge></div><div className="check-item"><span>Role Permission</span><Badge tone="green">Verified</Badge></div></div>
          </article>
          <div className="disclaimer"><b>AI Decision Support Disclaimer</b><br />AI Copilot supports, but does not replace, clinical judgment, claim adjudication authority, insurance approval, or compliance review. All critical actions require authorized human review.<br /><br />AI เป็นระบบช่วยตัดสินใจ ไม่ใช่ผู้ตัดสินใจแทนแพทย์ ผู้พิจารณาเคลม บริษัทประกัน หรือฝ่ายกำกับดูแล</div>
        </aside>
      </div>

      <div className={`action-bar ${aiCollapsed ? "ai-collapsed" : ""}`}>
        <div className="action-copy"><div className="action-title">Enterprise Workflow Control</div><div className="action-status">{!saved && <span className="unsaved" />}<span>{saved ? "All changes saved" : "Unsaved changes"}</span><Badge tone="red">2 blocking issues</Badge><Badge tone="amber">Human review required</Badge></div></div>
        <div className="action-buttons"><button className="btn ghost" type="button" onClick={() => { setSaved(true); notify("Changes saved and audit logged", "Compliance"); }}>Save Changes</button><button className="btn secondary" disabled={!icdAccepted} type="button" onClick={() => notify("Suggestion applied after human confirmation", "AI")}>Apply Suggestion</button><button className="btn" type="button" onClick={validatePackage}>Generate Evidence Package</button></div>
      </div>

      {selectedCase && (
        <div className="modal-backdrop open" role="dialog" aria-modal="true" aria-labelledby="drawerTitle" onClick={(event) => { if (event.currentTarget === event.target) setSelectedCase(null); }}>
          <section className="drawer">
            <div className="drawer-head"><div><div className="eyebrow">Case Detail</div><div className="drawer-title" id="drawerTitle">{selectedCase.patient} · {selectedCase.hn}</div><div className="muted">{selectedCase.visit} · {selectedCase.payer} · Last updated {selectedCase.updated}</div></div><button className="btn ghost icon" type="button" onClick={() => setSelectedCase(null)} aria-label="Close case detail">x</button></div>
            <div className="drawer-grid"><div className="mini-stat"><div className="mini-label">Priority</div><div className="mini-value"><Badge>{selectedCase.priority}</Badge></div></div><div className="mini-stat"><div className="mini-label">Readiness Score</div><div className="mini-value">{selectedCase.score} / 100</div></div><div className="mini-stat"><div className="mini-label">Claim Status</div><div className="mini-value"><Badge>{selectedCase.claim}</Badge></div></div><div className="mini-stat"><div className="mini-label">Aging / SLA</div><div className="mini-value">{selectedCase.aging} / {selectedCase.sla || "—"} min</div></div></div>
            <div className="drawer-section"><h3>Missing Evidence</h3>{selectedCase.evidence.length ? selectedCase.evidence.map((item) => <Badge key={item}>{item}</Badge>) : <Badge tone="green">Complete</Badge>}</div>
            <div className="drawer-section"><h3>AI Recommendations</h3><div className="insight-strip warning">{selectedCase.alert}. Review clinical and claim context before accepting any recommendation.</div></div>
            <div className="drawer-section"><h3>Cost Variance</h3><div className={`insight-strip ${selectedCase.cost.includes("Alert") ? "danger" : ""}`}>{selectedCase.cost}. Lab and medication are the primary suspected variance drivers.</div></div>
            <div className="drawer-actions"><button className="btn ghost" type="button" onClick={() => notify("Open Visit Detail completed", "Clinical")}>Open Visit Detail</button><button className="btn secondary" type="button" onClick={() => notify("Assign Reviewer completed", "Compliance")}>Assign Reviewer</button><button className="btn secondary" type="button" onClick={() => notify("Request Evidence completed", "Insurance")}>Request Evidence</button><button className="btn" type="button" onClick={validatePackage}>Generate Evidence Package</button></div>
          </section>
        </div>
      )}

      {toast && <div className="toast-stack" aria-live="polite"><div className="toast">{toast}</div></div>}
    </>
  );
}

const styles = `
:root{--primary:#1E3A8A;--primary-deep:#0F2A5F;--ai-blue:#2563EB;--accent:#38BDF8;--soft-blue:#EFF6FF;--background:#F8FAFC;--surface:#FFFFFF;--border:#E2E8F0;--text-primary:#0F172A;--text-secondary:#64748B;--success:#059669;--warning:#D97706;--danger:#DC2626;--sidebar:260px;--copilot:420px;--action-h:82px;--radius-lg:20px;--shadow:0 10px 28px rgba(15,42,95,.07);--shadow-strong:0 18px 44px rgba(15,42,95,.13)}
*{box-sizing:border-box}body{margin:0;background:var(--background);color:var(--text-primary)}button,input,select{font:inherit}button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid rgba(56,189,248,.45);outline-offset:2px}button:disabled{opacity:.48;cursor:not-allowed;transform:none!important;box-shadow:none!important}.copilot-app{display:grid;grid-template-columns:var(--sidebar) minmax(0,1fr) var(--copilot);min-height:100vh;width:100%;font-family:Inter,"Noto Sans Thai","Segoe UI",Arial,sans-serif;font-size:15px;line-height:1.55;background:var(--background)}
.sidebar{position:sticky;top:0;height:100vh;overflow:auto;background:linear-gradient(180deg,var(--primary-deep),#071A39);color:#fff;padding:24px 18px 100px;border-right:1px solid rgba(255,255,255,.08)}.brand{display:flex;gap:12px;align-items:center;padding:0 6px 18px;border-bottom:1px solid rgba(255,255,255,.12)}.brand-mark{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(135deg,#3B82F6,#0EA5E9);font-weight:900;box-shadow:0 8px 24px rgba(37,99,235,.35)}.brand-name{font-size:20px;font-weight:900;letter-spacing:-.02em}.brand-sub{font-size:12px;color:#BFDBFE;margin-top:2px}.nav-group{margin-top:24px}.nav-label{font-size:11px;color:#93C5FD;font-weight:800;text-transform:uppercase;letter-spacing:.09em;padding:0 10px;margin-bottom:8px}.nav-item{display:flex;align-items:center;gap:10px;color:#DBEAFE;text-decoration:none;padding:11px 12px;border-radius:11px;margin:4px 0;font-size:14px;font-weight:650;transition:.18s ease;cursor:pointer}.nav-item:hover,.nav-item.active{background:rgba(255,255,255,.12);color:white}.nav-dot{width:8px;height:8px;border-radius:50%;background:#60A5FA}.nav-item.active .nav-dot{background:#fff;box-shadow:0 0 0 4px rgba(255,255,255,.13)}.sidebar-foot{margin-top:28px;padding:14px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(255,255,255,.06);font-size:12px;color:#DBEAFE}
.main{min-width:0;height:100vh;overflow-y:auto;padding:0 24px calc(var(--action-h) + 36px)}.sticky-header{position:sticky;top:0;z-index:15;background:rgba(248,250,252,.95);backdrop-filter:blur(12px);padding:20px 0 14px;border-bottom:1px solid rgba(226,232,240,.85)}.header-row{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.eyebrow{font-size:12px;color:var(--ai-blue);font-weight:900;text-transform:uppercase;letter-spacing:.08em}h1{font-size:34px;line-height:1.15;letter-spacing:-.04em;margin:5px 0 0}.subtitle{font-size:14px;color:var(--text-secondary);margin-top:8px;max-width:900px}.header-actions{display:flex;gap:9px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.control{height:42px;border:1px solid var(--border);background:#fff;border-radius:11px;padding:0 12px;color:var(--text-primary);font-weight:650;min-width:130px}.last-updated{font-size:12px;color:var(--text-secondary);width:100%;text-align:right;margin-top:4px}
.btn{height:42px;border:0;border-radius:11px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:850;font-size:14px;cursor:pointer;background:var(--ai-blue);color:#fff;transition:.18s ease;white-space:nowrap}.btn:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(37,99,235,.22)}.btn.secondary{background:#EFF6FF;color:#1E40AF;border:1px solid #BFDBFE}.btn.ghost{background:#fff;color:#334155;border:1px solid var(--border)}.btn.danger{background:#FEE2E2;color:#991B1B;border:1px solid #FECACA}.btn.success{background:#DCFCE7;color:#166534;border:1px solid #BBF7D0}.btn.sm{height:34px;padding:0 11px;font-size:12px}.btn.icon{width:42px;padding:0}
.patient-context{margin-top:16px;background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);padding:15px;display:grid;grid-template-columns:repeat(6,minmax(120px,1fr));gap:12px;box-shadow:var(--shadow)}.context-item{padding:10px 12px;border-radius:12px;background:#FBFDFF;border:1px solid #EEF2F7}.context-label,.label{font-size:12px;color:var(--text-secondary);font-weight:650}.context-value{font-size:15px;font-weight:900;margin-top:5px;display:flex;align-items:center;gap:7px;min-height:26px}
.badge{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 9px;font-size:12px;font-weight:850;white-space:nowrap;margin:2px}.badge.green{background:#D1FAE5;color:#065F46}.badge.amber{background:#FEF3C7;color:#92400E}.badge.red{background:#FEE2E2;color:#991B1B}.badge.blue{background:#DBEAFE;color:#1E40AF}.badge.gray{background:#F1F5F9;color:#475569}.badge.purple{background:#EDE9FE;color:#5B21B6}.section{margin-top:22px}.section-head{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;margin-bottom:12px}.section-title{font-size:20px;font-weight:900;letter-spacing:-.02em}.section-sub{font-size:13px;color:var(--text-secondary);margin-top:2px}.grid-4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px}.grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.grid-2.inner{gap:10px}.grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px;box-shadow:var(--shadow);min-width:0}.card:hover{border-color:#CBD5E1}.card-title{font-size:17px;font-weight:900}.card-sub{font-size:13px;color:var(--text-secondary);margin-top:3px}.card-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}.kpi-card{position:relative;overflow:hidden;min-height:176px}.kpi-card:before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:var(--kpi,var(--ai-blue))}.kpi-title{font-size:14px;color:#475569;font-weight:800}.kpi-value{font-size:38px;font-weight:950;line-height:1;margin-top:10px;letter-spacing:-.045em}.kpi-meta{display:flex;justify-content:space-between;gap:8px;margin-top:9px;font-size:12px}.delta.up{color:var(--success);font-weight:850}.delta.down{color:var(--danger);font-weight:850}.delta.good-down{color:var(--success);font-weight:850}.target{color:var(--text-secondary)}.spark{height:48px;margin-top:8px}.chart-box{position:relative;height:260px}.chart-box.sm{height:210px}
.insight-strip{margin-top:12px;padding:11px 12px;border-radius:12px;background:#F8FAFC;border-left:4px solid var(--ai-blue);font-size:13px;color:#334155}.insight-strip.warning{border-left-color:var(--warning);background:#FFFBEB}.insight-strip.danger{border-left-color:var(--danger);background:#FEF2F2}.legend-list{display:flex;gap:12px;flex-wrap:wrap;margin-top:10px}.legend-item{display:flex;align-items:center;gap:6px;font-size:12px;color:#475569;background:transparent;border:0;cursor:pointer}.legend-swatch{width:10px;height:10px;border-radius:3px}.filter-chip{display:inline-flex;align-items:center;gap:7px;border:1px solid #BFDBFE;background:#EFF6FF;color:#1E40AF;border-radius:999px;padding:6px 9px;font-size:12px;font-weight:800}.filter-chip button{border:0;background:none;color:inherit;cursor:pointer;padding:0;font-weight:900}
.breakdown-list{display:grid;gap:14px}.breakdown-item{border-bottom:1px solid #EEF2F7;padding-bottom:12px}.breakdown-item:last-child{border-bottom:0;padding-bottom:0}.breakdown-top{display:flex;justify-content:space-between;gap:12px;align-items:center}.breakdown-name{font-weight:850}.breakdown-score{font-size:13px;font-weight:900}.progress{height:9px;background:#E5E7EB;border-radius:999px;overflow:hidden;margin-top:8px}.progress>span{display:block;height:100%;border-radius:999px;background:var(--bar,var(--ai-blue))}.breakdown-foot{display:flex;justify-content:space-between;gap:12px;margin-top:7px;font-size:12px;color:var(--text-secondary)}
.worklist-controls{display:grid;grid-template-columns:2fr repeat(5,minmax(125px,1fr)) 150px;gap:9px;margin-bottom:12px}.search-box{position:relative}.search-box input{width:100%;height:42px;border:1px solid var(--border);border-radius:11px;padding:0 12px;background:#fff}.worklist-controls select{width:100%;height:42px;border:1px solid var(--border);border-radius:11px;padding:0 10px;background:#fff;color:#334155}.active-filters{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:38px;padding:8px 10px;border:1px dashed #BFDBFE;background:#F8FBFF;border-radius:12px;margin-bottom:12px}.chips{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.chips b{font-size:12px}.clear-link{border:0;background:none;color:var(--ai-blue);font-weight:850;cursor:pointer}
.table-wrap{overflow:auto;border:1px solid var(--border);border-radius:14px}.table{width:100%;border-collapse:collapse;min-width:1550px;font-size:14px}.table th{position:sticky;top:0;z-index:2;background:#F8FAFC;text-align:left;padding:12px 10px;color:#475569;border-bottom:1px solid var(--border);font-size:12px;text-transform:uppercase;letter-spacing:.035em}.table td{padding:13px 10px;border-bottom:1px solid #EEF2F7;vertical-align:middle}.table tr:hover td{background:#FBFDFF}.patient-name{font-weight:850}.muted{color:var(--text-secondary);font-size:12px}.score-cell{min-width:130px}.score-inline{display:flex;justify-content:space-between;font-size:12px;font-weight:800}.empty-state{text-align:center;padding:34px;color:var(--text-secondary)}
.timeline-filter{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px}.timeline{position:relative;padding-left:28px}.timeline:before{content:"";position:absolute;left:8px;top:5px;bottom:6px;width:2px;background:#E2E8F0}.timeline-item{position:relative;padding:0 0 17px 8px}.timeline-item:before{content:"";position:absolute;left:-26px;top:4px;width:12px;height:12px;border-radius:50%;background:var(--ai-blue);border:3px solid #fff;box-shadow:0 0 0 1px #CBD5E1}.timeline-time{font-size:12px;color:var(--text-secondary);font-weight:800}.timeline-action{font-size:14px;font-weight:850;margin-top:2px}.timeline-meta{font-size:12px;color:var(--text-secondary);margin-top:2px}
.ai-panel{height:100vh;position:sticky;top:0;overflow-y:auto;background:#fff;border-left:1px solid var(--border);padding:20px 18px calc(var(--action-h) + 22px);transition:.25s ease}.ai-panel.collapsed{width:72px;padding:16px 12px;overflow:hidden}.ai-panel.collapsed>*:not(.ai-head){display:none}.ai-panel.collapsed .ai-head-copy,.ai-panel.collapsed .ai-summary,.ai-panel.collapsed .badge{display:none}.ai-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding-bottom:14px;border-bottom:1px solid var(--border);margin-bottom:15px}.ai-head-main{display:flex;gap:10px;align-items:center}.ai-head-actions{display:flex;gap:6px}.ai-orb{width:44px;height:44px;flex:0 0 44px;border-radius:14px;display:grid;place-items:center;color:#fff;font-weight:950;background:linear-gradient(135deg,var(--ai-blue),var(--primary-deep));box-shadow:0 10px 24px rgba(37,99,235,.24)}.ai-title{font-size:19px;font-weight:950}.ai-sub{font-size:12px;color:var(--text-secondary)}.ai-summary{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:14px}.mini-stat{border:1px solid var(--border);border-radius:12px;padding:11px;background:#FBFDFF}.mini-label{font-size:11px;color:var(--text-secondary)}.mini-value{font-size:18px;font-weight:900;margin-top:3px}.danger-text{color:var(--danger)}
.ai-card{border:1px solid var(--border);border-radius:16px;padding:14px;margin-bottom:11px;background:#fff}.ai-card.critical{border:2px solid #FCA5A5;background:#FFF7F7;box-shadow:0 8px 22px rgba(220,38,38,.08)}.ai-card.warning{border-color:#FCD34D;background:#FFFDF5}.ai-card.score-card{background:linear-gradient(135deg,#EFF6FF,#FFFFFF)}.ai-card-title{font-size:15px;font-weight:950}.ai-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:9px}.ai-text{font-size:13px;color:#475569;margin-top:8px}.ai-reason{font-size:12px;color:#475569;background:#F8FAFC;border-radius:10px;padding:9px;margin-top:9px}.ai-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.score-number{font-size:38px;font-weight:950;letter-spacing:-.04em}.confidence-head{display:flex;justify-content:space-between;font-size:12px;font-weight:800;margin-top:9px}.checklist{display:grid;gap:7px;margin-top:10px}.check-item{display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:12px;padding:7px 8px;border-radius:9px;background:#F8FAFC}.disclaimer{border:1px solid #FED7AA;background:#FFF7ED;color:#9A3412;border-radius:14px;padding:12px;font-size:12px;line-height:1.6}
.action-bar{position:fixed;bottom:0;left:var(--sidebar);right:var(--copilot);z-index:50;min-height:var(--action-h);display:flex;justify-content:space-between;align-items:center;gap:18px;padding:12px 22px;background:rgba(255,255,255,.97);backdrop-filter:blur(12px);border-top:1px solid var(--border);box-shadow:0 -12px 28px rgba(15,42,95,.08);transition:.25s ease}.action-bar.ai-collapsed{right:72px}.action-copy{min-width:280px}.action-title{font-weight:950}.action-status{font-size:12px;color:var(--text-secondary);margin-top:2px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}.unsaved{width:8px;height:8px;border-radius:50%;background:var(--warning);display:inline-block}.action-buttons{display:flex;gap:9px;align-items:center}
.modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.48);z-index:100;display:none;align-items:stretch;justify-content:flex-end}.modal-backdrop.open{display:flex}.drawer{width:min(660px,96vw);height:100%;background:#fff;box-shadow:-18px 0 50px rgba(15,23,42,.22);padding:22px;overflow:auto;animation:slideIn .22s ease}.drawer-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding-bottom:14px;border-bottom:1px solid var(--border)}.drawer-title{font-size:23px;font-weight:950}.drawer-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:16px}.drawer-section{margin-top:18px}.drawer-section h3{font-size:16px;margin:0 0 9px}.drawer-actions{position:sticky;bottom:-22px;background:#fff;border-top:1px solid var(--border);padding:13px 0 0;margin-top:20px;display:flex;gap:8px;flex-wrap:wrap}.toast-stack{position:fixed;right:20px;bottom:98px;z-index:200;display:grid;gap:8px}.toast{min-width:280px;max-width:420px;background:#0F172A;color:#fff;border-radius:12px;padding:12px 14px;box-shadow:var(--shadow-strong);animation:toastIn .2s ease;font-size:13px}
@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media(max-width:1450px){:root{--sidebar:230px;--copilot:390px}.patient-context{grid-template-columns:repeat(3,1fr)}.grid-4{grid-template-columns:repeat(2,1fr)}.worklist-controls{grid-template-columns:2fr repeat(3,1fr)}}
@media(max-width:1279px){.copilot-app{grid-template-columns:230px minmax(0,1fr)}.ai-panel{grid-column:1/-1;position:relative;height:auto;border-left:0;border-top:1px solid var(--border);padding-bottom:110px}.action-bar{left:230px;right:0}.main{height:auto;overflow:visible}.sidebar{position:sticky}.ai-panel.collapsed{width:auto;height:80px}.grid-3{grid-template-columns:1fr 1fr}.worklist-controls{grid-template-columns:2fr repeat(3,1fr)}}
@media(max-width:899px){:root{--action-h:150px}.copilot-app{display:block}.sidebar{display:none}.main{height:auto;padding:0 14px calc(var(--action-h) + 24px)}.sticky-header{position:relative}.header-row{flex-direction:column}.header-actions{justify-content:flex-start}.last-updated{text-align:left}.patient-context,.grid-4,.grid-3,.grid-2{grid-template-columns:1fr}.worklist-controls{grid-template-columns:1fr 1fr}.worklist-controls .search-box{grid-column:1/-1}.ai-panel{padding:18px 14px calc(var(--action-h) + 20px)}.action-bar{left:0;right:0;flex-direction:column;align-items:stretch;padding:10px 14px}.action-copy{min-width:0}.action-buttons{display:grid;grid-template-columns:1fr 1fr}.action-buttons .btn:last-child{grid-column:1/-1}.drawer-grid{grid-template-columns:1fr}.header-actions .control{min-width:0;flex:1}.chart-box{height:250px}}
@media(max-width:560px){h1{font-size:29px}.worklist-controls{grid-template-columns:1fr}.worklist-controls .search-box{grid-column:auto}.action-buttons{grid-template-columns:1fr}.action-buttons .btn:last-child{grid-column:auto}.patient-context{grid-template-columns:1fr}.btn{width:100%}.section-head{align-items:flex-start;flex-direction:column}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;
