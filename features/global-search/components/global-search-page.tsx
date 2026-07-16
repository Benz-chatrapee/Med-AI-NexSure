"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { globalSearchResults, moduleFilterChips, searchDistribution, searchQuality, searchTrend, summaryCards } from "../data/global-search.mock";
import type { GlobalSearchCategory, GlobalSearchResult } from "../types";
import { filterGlobalSearchResults } from "../utils/global-search-selectors";

type SearchTrendPeriod = "7 Days" | "30 Days" | "90 Days";

type SearchTrendTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{
    value?: number;
    payload?: {
      count: number;
      day: string;
    };
  }>;
};

const filters = {
  recordTypes: [
    ["Patient Records", "5", true],
    ["Visit Records", "14", true],
    ["Claim Records", "8", true],
    ["Task Records", "6", false],
    ["Evidence Package", "4", false],
    ["Audit & Compliance", "2", false],
  ] as const,
  statuses: ["Completed", "Pending Evidence", "Needs Review", "Active"],
  risks: ["Low", "Medium", "High", "Critical"],
};

export function GlobalSearchPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [query, setQuery] = useState("Somchai");
  const [queryLabel, setQueryLabel] = useState("Somchai");
  const [category, setCategory] = useState<GlobalSearchCategory>("all");
  const [selectedEntity, setSelectedEntity] = useState(globalSearchResults[0].entity);
  const [filterCount, setFilterCount] = useState(3);
  const [trendPeriod, setTrendPeriod] = useState<SearchTrendPeriod>("7 Days");
  const [toast, setToast] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => filterGlobalSearchResults(globalSearchResults, queryLabel, category), [category, queryLabel]);
  const selectedResult = results.find((result) => result.entity === selectedEntity) ?? results[0] ?? globalSearchResults[0];
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (commandOpen) {
      window.setTimeout(() => commandInputRef.current?.focus(), 30);
    }
  }, [commandOpen]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  function runSearch(nextQuery = query) {
    const label = nextQuery.trim() || "All Accessible Records";
    setQueryLabel(label);
    showToast(`Showing permission-approved results for "${label}"`);
  }

  function clearSearch() {
    setQuery("");
    setQueryLabel("");
    searchInputRef.current?.focus();
    showToast("Search query cleared");
  }

  function chooseHint(value: string) {
    setQuery(value);
    runSearch(value);
  }

  function chooseCategory(nextCategory: GlobalSearchCategory, label: string) {
    setCategory(nextCategory);
    showToast(`${label} view selected`);
  }

  return (
    <div className="global-search-root">
      <style jsx global>{globalSearchCss}</style>
      <div className="app">
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} id="sidebar">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><path d="M12 3v18M3 12h18" /><path d="M7 5.5c1.6-1.2 3.2-1.8 5-1.8s3.4.6 5 1.8M7 18.5c1.6 1.2 3.2 1.8 5 1.8s3.4-.6 5-1.8" opacity=".65" /></svg>
            </div>
            <div className="brand-copy"><strong>Med AI NexSure</strong><span>Healthcare & Insurance Intelligence</span></div>
          </div>
          <div className="workspace-card"><div className="avatar">NS</div><div><strong>NexSure Health Network</strong><small>Bangkok Enterprise</small></div><span className="chevron">⌄</span></div>
          <SidebarNav />
          <div className="sidebar-footer"><div className="secure"><span>◉</span><div><b>Secure Enterprise Session</b>Role and data-scope policies are enforced on every search.</div></div></div>
        </aside>

        <main className="main">
          <header className="topbar">
            <button className="mobile-menu" aria-label="Open navigation" type="button" onClick={() => setSidebarOpen((open) => !open)}>☰</button>
            <button className="top-search" aria-label="Open Global Search" type="button" onClick={() => setCommandOpen(true)}><span className="top-search-icon">⌕</span><span>Search patients, visits, claims, evidence, tasks, and audit records</span><kbd className="kbd">Ctrl K</kbd></button>
            <div className="top-actions">
              <button className="icon-btn" aria-label="AI Copilot" type="button">✦</button>
              <button className="icon-btn" aria-label="Notifications" type="button">♢<span className="dot" /></button>
              <div className="profile"><div className="pic">BC</div><div className="profile-copy"><strong>Benz Chatrapee</strong><small>Product Owner · Admin</small></div><span>⌄</span></div>
            </div>
          </header>

          <div className="content">
            <div className="breadcrumb"><span>Main Dashboard</span><span>/</span><b>Global Search</b></div>
            <section className="page-head">
              <div><div className="eyebrow">Enterprise Intelligence Access</div><h1>Global Search</h1><p>Search across patients, visits, claims, evidence, tasks, and audit records. ค้นหาข้อมูลจากทุกโมดูลภายในระบบตามสิทธิ์การเข้าถึง</p></div>
              <div className="security-pill"><span>✓</span> Permission-aware results</div>
            </section>

            <section className="hero-search" aria-label="Search controls">
              <div className="search-row">
                <label className="search-box"><span className="search-icon">⌕</span><input ref={searchInputRef} value={query} placeholder="Search by HN, patient name, visit, claim, task, payer, or keyword..." aria-label="Global search query" onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") runSearch(); }} />{query ? <button className="clear show" type="button" aria-label="Clear search" onClick={clearSearch}>×</button> : null}<kbd className="kbd">Enter</kbd></label>
                <button className="primary-btn" type="button" onClick={() => runSearch()}>Search Records</button>
              </div>
              <div className="search-hints"><div className="hint-tags"><span>Suggested:</span>{["HN000342", "CLM-2026-00549", "Pending Evidence"].map((hint) => <button className="hint-tag" type="button" key={hint} onClick={() => chooseHint(hint)}>{hint}</button>)}</div><span>ผลลัพธ์ถูกจำกัดตาม Role, Organization, Clinic และ Data Scope ของคุณ</span></div>
            </section>

            <section className="summary-grid" aria-label="Result categories">
              {summaryCards.map((card) => <button key={card.type} className={`summary-card ${category === card.type ? "active" : ""}`} type="button" onClick={() => chooseCategory(card.type, card.label)}><span>{card.label}</span><strong>{card.count}</strong></button>)}
            </section>

            <section className="analytics-panel" aria-labelledby="search-analytics-title">
              <div className="analytics-head">
                <div><div className="analytics-eyebrow">Executive Search Intelligence</div><h2 id="search-analytics-title">Search Analytics Overview</h2><p>Permission-aware search performance across healthcare, insurance, evidence, and audit modules. ภาพรวมการค้นหาสำหรับทีมที่ได้รับอนุญาต</p></div>
                <div className="analytics-period">Last 7 Days</div>
              </div>
              <div className="module-chips" aria-label="Searchable modules">
                {moduleFilterChips.map((chip) => <button key={chip.label} className={`module-chip ${chip.type === category || (chip.type === "all" && category === "all") ? "active" : ""}`} type="button" onClick={() => { if (chip.type === "evidence" || chip.type === "audit") chooseCategory("other", chip.label); else if (chip.type === "notifications" || chip.type === "users") showToast(`${chip.label} module filter ready for authorized records`); else chooseCategory(chip.type, chip.label); }}>{chip.label}</button>)}
              </div>
              <div className="analytics-grid">
                <article className="analytics-card distribution-card">
                  <div className="analytics-card-head"><h3>Search Result Distribution</h3><p>Results by module. สัดส่วนผลลัพธ์แยกตามโมดูล</p></div>
                  <div className="bar-chart" role="img" aria-label="Search Result Distribution horizontal bar chart">
                    {searchDistribution.map((item) => <div className="bar-row" key={item.module}><span>{item.module}</span><div><i style={{ width: `${(item.count / 14) * 100}%` }} /></div><b>{item.count}</b></div>)}
                  </div>
                </article>
                <article className="analytics-card quality-card">
                  <div className="analytics-card-head"><h3>Search Quality</h3><p>Match composition. คุณภาพการจับคู่ของผลการค้นหา</p></div>
                  <div className="donut-layout">
                    <div className="quality-donut" role="img" aria-label="Search Quality donut chart" />
                    <div className="quality-legend">{searchQuality.map((item) => <span key={item.label}><i style={{ background: item.color }} />{item.label}<b>{item.value}%</b></span>)}</div>
                  </div>
                </article>
                <article className="analytics-card trend-card">
                  <div className="analytics-card-head trend-card-head">
                    <div><h3>Search Trend</h3><p>แนวโน้มจำนวนการค้นหาตามช่วงเวลา</p></div>
                    <div className="trend-period-selector" aria-label="Search Trend period selector">
                      {(["7 Days", "30 Days", "90 Days"] as const).map((period) => (
                        <button
                          aria-pressed={trendPeriod === period}
                          className={trendPeriod === period ? "active" : ""}
                          key={period}
                          type="button"
                          onClick={() => setTrendPeriod(period)}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="trend-chart-wrap" role="img" aria-label={`Search Trend line chart for ${trendPeriod}`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={searchTrend} margin={{ top: 12, right: 18, left: -10, bottom: 6 }}>
                        <defs>
                          <linearGradient id="searchTrendFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#2563EB" stopOpacity={0.12} />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#E2E8F0" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 700 }} />
                        <YAxis allowDecimals={false} axisLine={false} domain={[0, "dataMax + 8"]} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 700 }} width={42} />
                        <Tooltip content={<SearchTrendTooltip />} cursor={{ stroke: "#BFDBFE", strokeWidth: 1 }} />
                        <Area activeDot={{ r: 5, stroke: "#FFFFFF", strokeWidth: 2 }} dataKey="count" fill="url(#searchTrendFill)" name="Total Searches" stroke="#2563EB" strokeWidth={3} type="monotone" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </article>
              </div>
            </section>

            <div className="layout">
              <aside className="panel filters">
                <div className="panel-title"><h2>Advanced Filters <span className="active-filter">{filterCount}</span></h2><button className="text-btn" type="button" onClick={() => { setFilterCount(0); showToast("All search filters cleared"); }}>Clear All</button></div>
                <div className="filter-body">
                  <div className="filter-group"><h3>Record Type</h3>{filters.recordTypes.map(([label, count, checked]) => <label className="check" key={label}><input type="checkbox" defaultChecked={checked} />{label}<span className="mini-count">{count}</span></label>)}</div>
                  <div className="filter-group"><h3>Organization & Clinic</h3><select className="select" defaultValue="NexSure Health Network"><option>NexSure Health Network</option></select><select className="select select-spaced" defaultValue="All authorized clinics"><option>All authorized clinics</option><option>Sukhumvit Medical Center</option><option>Bangkok North Clinic</option></select></div>
                  <div className="filter-group"><h3>Status</h3>{filters.statuses.map((status) => <label className="check" key={status}><input type="checkbox" />{status}</label>)}</div>
                  <div className="filter-group"><h3>Date Range</h3><select className="select" defaultValue="Last 30 Days"><option>Last 30 Days</option><option>Today</option><option>Last 7 Days</option><option>This Month</option><option>Custom Range</option></select></div>
                  <div className="filter-group"><h3>Risk Level</h3>{filters.risks.map((risk) => <label className="check" key={risk}><input type="checkbox" />{risk}</label>)}</div>
                </div>
              </aside>

              <section className="panel results-panel">
                <div className="results-head"><strong>Accessible results for “<span>{queryLabel}</span>”</strong><span className="meta">42 permission-approved records</span><div className="sort"><span>Sort Results</span><select defaultValue="Relevance"><option>Relevance</option><option>Latest Update</option><option>Recent Access</option></select></div></div>
                <div className="result-list">{results.length ? results.map((result) => <ResultCard key={`${result.entity}-${result.actionLabel}`} result={result} selected={selectedResult.entity === result.entity} onSelect={() => setSelectedEntity(result.entity)} onOpen={() => showToast(result.actionLabel.replace(" →", ""))} />) : <div className="empty-state-block">ไม่พบผลลัพธ์ที่ตรงกับเงื่อนไข กรุณาปรับคำค้นหาหรือตัวกรอง</div>}</div>
                <div className="pagination"><span>Showing 1–6 of 42 permission-approved results</span><div className="pages">{["‹", "1", "2", "3", "…", "7", "›"].map((page) => <button className={`page-btn ${page === "1" ? "active" : ""}`} type="button" key={page}>{page}</button>)}</div></div>
              </section>
              <AiInsightPanel result={selectedResult} />
            </div>
          </div>
        </main>
      </div>

      {commandOpen ? <CommandPalette commandQuery={commandQuery} inputRef={commandInputRef} onBackdrop={() => setCommandOpen(false)} onQuery={setCommandQuery} /> : null}
      <div className={`toast ${toast ? "show" : ""}`}>{toast || "Search results updated"}</div>
    </div>
  );
}

function SearchTrendTooltip({ active, label, payload }: SearchTrendTooltipProps) {
  if (!active || !payload?.length) return null;
  const currentValue = Number(payload[0]?.value ?? 0);
  const currentIndex = searchTrend.findIndex((item) => item.day === label);
  const previousValue = currentIndex > 0 ? searchTrend[currentIndex - 1].count : undefined;
  const change = previousValue ? ((currentValue - previousValue) / previousValue) * 100 : undefined;
  return (
    <div className="trend-tooltip">
      <strong>{label}</strong>
      <span>{currentValue} Searches</span>
      {change === undefined ? <small>No prior period</small> : <small className={change >= 0 ? "positive" : "negative"}>{change >= 0 ? "+" : ""}{change.toFixed(1)}% vs previous day</small>}
    </div>
  );
}

function SidebarNav() {
  return (
    <>
      <div className="nav-label">Intelligence</div>
      <nav className="nav">
        {["⌂ Main Dashboard", "⌕ Global Search", "✦ AI Copilot", "▥ Claim Readiness", "◈ Economic Intelligence"].map((item) => <a className={item.includes("Global Search") ? "active" : ""} href="#" key={item}><span className="nav-icon">{item.split(" ")[0]}</span>{item.replace(`${item.split(" ")[0]} `, "")}{item.includes("Claim") ? <span className="count">12</span> : null}</a>)}
      </nav>
      <div className="nav-label">Operations</div>
      <nav className="nav">
        {["♙ Patient Management", "▣ Visit Management", "✓ Task Management", "▤ Evidence Package", "◌ Audit & Compliance"].map((item) => <a href="#" key={item}><span className="nav-icon">{item.split(" ")[0]}</span>{item.replace(`${item.split(" ")[0]} `, "")}{item.includes("Task") ? <span className="count">8</span> : null}</a>)}
      </nav>
      <div className="nav-label">Administration</div>
      <nav className="nav"><a href="#"><span className="nav-icon">⚙</span>Admin Settings</a></nav>
    </>
  );
}

function ResultCard({ result, selected, onOpen, onSelect }: { result: GlobalSearchResult; selected: boolean; onOpen: () => void; onSelect: () => void }) {
  return (
    <article className={`result-card ${selected ? "selected" : ""}`} role="button" tabIndex={0} onClick={onSelect} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(); }}>
      <div className={`entity-icon ${result.entity}`}>{result.icon}</div>
      <div className="result-main">
        <div className="result-top"><span className="entity-label">{result.entityLabel}</span>{result.badges.map((badge) => <span className={`badge ${badge.tone}`} key={badge.label}>{badge.label}</span>)}</div>
        <h3 className="result-title">{result.titlePrefix}<mark>{result.titleHighlight}</mark>{result.titleSuffix}</h3>
        <div className="result-meta">{result.meta.map((item) => <span key={item.label}><b>{item.label}:</b> {item.value}</span>)}</div>
        <div className="subline">{result.subBadges?.map((badge) => <span className={`badge ${badge.tone}`} key={badge.label}>{badge.label}</span>)}{result.subline.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
      </div>
      <div className="result-actions"><button className="open-btn" type="button" onClick={(event) => { event.stopPropagation(); onOpen(); }}>{result.actionLabel}</button><button className="more-btn" type="button" aria-label={`More actions for ${result.entityLabel}`} onClick={(event) => event.stopPropagation()}>•••</button></div>
    </article>
  );
}

function AiInsightPanel({ result }: { result: GlobalSearchResult }) {
  return (
    <aside className="panel ai-insight-panel" aria-labelledby="ai-insight-title">
      <div className="panel-title"><h2 id="ai-insight-title">AI Insight</h2><span className="badge info">Decision Support</span></div>
      <div className="insight-body">
        <div className="insight-entity"><div className={`entity-icon ${result.entity}`}>{result.icon}</div><div><span>{result.entityLabel}</span><strong>{result.titlePrefix}{result.titleHighlight}{result.titleSuffix}</strong></div></div>
        <div className="insight-metrics">
          <div><span>Confidence</span><strong>{result.confidence}</strong></div>
          <div><span>Risk Level</span><strong className={`risk-${result.riskLevel.toLowerCase()}`}>{result.riskLevel}</strong></div>
        </div>
        <div className="insight-section"><h3>Related Entities</h3>{result.relatedEntities.map((entity) => <span className="related-chip" key={entity}>{entity}</span>)}</div>
        <div className="insight-section"><h3>Recommended Next Action</h3><p>{result.recommendedAction}</p></div>
        <div className="insight-note">AI insight is decision support only. Human review and permission scope still apply.</div>
      </div>
    </aside>
  );
}

function CommandPalette({ commandQuery, inputRef, onBackdrop, onQuery }: { commandQuery: string; inputRef: React.RefObject<HTMLInputElement | null>; onBackdrop: () => void; onQuery: (query: string) => void }) {
  const hasQuery = commandQuery.trim().length > 0;
  return (
    <div className="modal-backdrop open" role="dialog" aria-modal="true" aria-label="Global Search Command Palette" onMouseDown={(event) => { if (event.target === event.currentTarget) onBackdrop(); }}>
      <div className="command">
          <div className="command-head"><div className="command-title"><strong>Global Search</strong><span>Search key records across authorized modules · ค้นหาตามสิทธิ์ของคุณ</span></div><label className="command-input"><span className="command-search-icon">⌕</span><input ref={inputRef} value={commandQuery} placeholder="Search patients, visits, claims, evidence, tasks, and audit records" onChange={(event) => onQuery(event.target.value)} /><kbd className="kbd">ESC</kbd></label></div>
        <div className="command-body">
          {!hasQuery ? <RecentAndQuick onQuery={onQuery} /> : <PreviewSection />}
        </div>
        <div className="command-footer"><div className="key-guide"><span><kbd className="kbd">↑↓</kbd> Navigate</span><span><kbd className="kbd">↵</kbd> Open</span><span><kbd className="kbd">Esc</kbd> Close</span></div><span>ผลลัพธ์ผ่าน Permission Scope และพร้อมรองรับ Audit</span></div>
      </div>
    </div>
  );
}

function RecentAndQuick({ onQuery }: { onQuery: (query: string) => void }) {
  return (
    <>
      <div className="command-section"><h3>Recent Searches</h3>{[["HN000342", "Patient"], ["CLM-2026-00549", "Claim"], ["Pending Evidence", "Visit status"]].map(([label, helper]) => <div className="recent-row" key={label}><button className="recent-item" type="button" onClick={() => onQuery(label)}>↻ <span>{label}<small>{helper}</small></span></button><button className="remove-recent" type="button">×</button></div>)}</div>
      <div className="command-section"><h3>Quick Navigation</h3><div className="quick-grid">{[["⌂", "Open Main Dashboard", "View executive KPIs, queues, and operational signals"], ["＋", "Create Patient", "ลงทะเบียนผู้ป่วยใหม่ตาม Workflow ขององค์กร"], ["▣", "Create Visit", "Start a new clinical encounter and care workflow"], ["▥", "Claim Readiness", "ตรวจสอบความพร้อมก่อนส่งเคลมประกัน"], ["✓", "Task Management", "Review assigned tasks, priorities, and due dates"], ["◌", "Audit & Compliance", "ติดตามประวัติการเข้าถึงและเหตุการณ์สำคัญ"]].map(([icon, title, helper]) => <button className="quick-item" type="button" key={title}><span className="qicon">{icon}</span><span><b>{title}</b><small>{helper}</small></span></button>)}</div></div>
    </>
  );
}

function PreviewSection() {
  return <div className="command-section"><h3>Top Matches</h3>{[["patient", "P", "Somchai Jaidee", "HN000342 · Patient · Active", "↵"], ["visit", "V", "VST-2026-0710-0342", "Somchai Jaidee · In Consultation", "›"], ["claim", "C", "CLM-2026-00549", "Somchai Jaidee · Needs Review", "›"], ["task", "T", "Complete missing SOAP evidence", "TSK-2026-1184 · Overdue", "›"]].map(([entity, icon, title, helper, key], index) => <div className={`command-result ${index === 0 ? "active" : ""}`} key={title}><div className={`entity-icon ${entity}`}>{icon}</div><div><strong>{title}</strong><small>{helper}</small></div>{key === "↵" ? <kbd className="kbd">↵</kbd> : <span>{key}</span>}</div>)}</div>;
}

const globalSearchCss = `
.global-search-root{--navy-950:#07152f;--navy-900:#0f2a5f;--blue-800:#1e3a8a;--blue-700:#1d4ed8;--blue-600:#2563eb;--blue-500:#3b82f6;--sky-400:#38bdf8;--blue-100:#dbeafe;--blue-50:#eff6ff;--slate-950:#0f172a;--slate-800:#1e293b;--slate-700:#334155;--slate-600:#475569;--slate-500:#64748b;--slate-400:#94a3b8;--slate-300:#cbd5e1;--slate-200:#e2e8f0;--slate-100:#f1f5f9;--slate-50:#f8fafc;--white:#fff;--green:#059669;--green-bg:#ecfdf5;--amber:#d97706;--amber-bg:#fffbeb;--red:#dc2626;--red-bg:#fef2f2;--violet:#1e3a8a;--violet-bg:#eff6ff;--shadow:0 10px 28px rgba(15,42,95,.06);--shadow-lg:0 24px 72px rgba(7,21,47,.22);--focus:0 0 0 4px rgba(37,99,235,.15);min-height:100vh;width:100%;color:var(--slate-950);background:var(--slate-50);font-family:Inter,"IBM Plex Sans","Noto Sans Thai",ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.001em;overflow-x:hidden}.global-search-root *{box-sizing:border-box}.global-search-root button,.global-search-root input,.global-search-root select{font:inherit}.global-search-root button{cursor:pointer}.global-search-root :focus-visible{outline:none;box-shadow:var(--focus)!important}
.global-search-root .app{min-height:100vh;display:grid;grid-template-columns:272px minmax(0,1fr);background:radial-gradient(circle at 90% -10%,rgba(56,189,248,.14),transparent 28%),var(--slate-50)}.global-search-root .sidebar{position:sticky;top:0;height:100vh;background:linear-gradient(180deg,#07152f 0%,#0b2250 46%,#0f2a5f 100%);color:#fff;padding:24px 18px;display:flex;flex-direction:column;border-right:1px solid rgba(255,255,255,.08);z-index:20}.global-search-root .sidebar:after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 20% 0%,rgba(56,189,248,.12),transparent 28%)}.global-search-root .brand,.global-search-root .workspace-card,.global-search-root .nav,.global-search-root .sidebar-footer{position:relative;z-index:1}.global-search-root .brand{display:flex;align-items:center;gap:12px;padding:0 10px 24px;border-bottom:1px solid rgba(255,255,255,.1)}.global-search-root .brand-mark{width:42px;height:42px;border-radius:13px;background:linear-gradient(145deg,#38bdf8 0%,#2563eb 52%,#1e3a8a 100%);display:grid;place-items:center;box-shadow:0 10px 30px rgba(37,99,235,.4)}.global-search-root .brand-mark svg{width:24px;height:24px}.global-search-root .brand-copy strong{display:block;font-size:17px;letter-spacing:.1px}.global-search-root .brand-copy span{font-size:11px;color:#a8c7ff;letter-spacing:.12em;text-transform:uppercase}.global-search-root .workspace-card{margin:18px 6px 14px;padding:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);border-radius:12px;display:flex;gap:10px;align-items:center}.global-search-root .workspace-card .avatar{width:34px;height:34px;border-radius:10px;background:#dbeafe;color:#1d4ed8;display:grid;place-items:center;font-weight:800;font-size:12px}.global-search-root .workspace-card strong{display:block;font-size:13px}.global-search-root .workspace-card small{color:#9fb8de;font-size:11px}.global-search-root .chevron{margin-left:auto}.global-search-root .nav-label{margin:16px 12px 7px;font-size:10px;color:#7892bc;letter-spacing:.16em;text-transform:uppercase;font-weight:800}.global-search-root .nav{display:flex;flex-direction:column;gap:5px}.global-search-root .nav a{color:#b8cae8;text-decoration:none;display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:11px;font-size:14px;font-weight:600;transition:.2s;min-height:44px}.global-search-root .nav a:hover{background:rgba(255,255,255,.08);color:#fff}.global-search-root .nav a.active{background:linear-gradient(90deg,rgba(37,99,235,.30),rgba(56,189,248,.08));border:1px solid rgba(147,197,253,.16);color:#fff;box-shadow:inset 3px 0 #60a5fa}.global-search-root .nav-icon{width:20px;height:20px;display:grid;place-items:center;font-size:16px}.global-search-root .nav .count{margin-left:auto;min-width:24px;padding:2px 7px;border-radius:999px;background:rgba(255,255,255,.1);font-size:10px;text-align:center}.global-search-root .sidebar-footer{margin-top:auto;padding:16px 8px 2px;border-top:1px solid rgba(255,255,255,.1)}.global-search-root .secure{display:flex;gap:10px;align-items:flex-start;color:#9fb8de;font-size:11px;line-height:1.45}.global-search-root .secure b{color:#d9e8ff;display:block;font-size:12px}
.global-search-root .main{min-width:0;min-height:100vh;background:var(--slate-50)}.global-search-root .topbar{height:78px;position:sticky;top:0;z-index:15;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border-bottom:1px solid var(--slate-200);display:flex;align-items:center;gap:18px;padding:0 30px;box-shadow:0 1px 0 rgba(15,42,95,.03)}.global-search-root .mobile-menu{display:none;border:0;background:transparent;font-size:24px}.global-search-root .top-search{max-width:700px;flex:1;height:46px;border:1px solid var(--slate-300);background:var(--slate-50);border-radius:13px;display:flex;align-items:center;gap:11px;padding:0 12px;color:var(--slate-500);transition:.2s}.global-search-root .top-search:hover{border-color:var(--blue-500);background:#fff;box-shadow:0 0 0 4px rgba(59,130,246,.08)}.global-search-root .top-search span{flex:1;font-size:14px;text-align:left}.global-search-root .top-search-icon{font-size:20px!important;flex:0!important}.global-search-root .kbd{border:1px solid var(--slate-300);background:#fff;border-bottom-width:2px;border-radius:7px;padding:3px 7px;font-size:11px;color:var(--slate-600);font-weight:700}.global-search-root .top-actions{margin-left:auto;display:flex;align-items:center;gap:10px}.global-search-root .icon-btn{width:42px;height:42px;border:1px solid var(--slate-200);background:#fff;border-radius:12px;color:var(--slate-600);display:grid;place-items:center;position:relative}.global-search-root .icon-btn:hover{border-color:#bfdbfe;color:var(--blue-700)}.global-search-root .dot{position:absolute;right:8px;top:8px;width:7px;height:7px;border-radius:99px;background:var(--red);box-shadow:0 0 0 2px #fff}.global-search-root .profile{display:flex;align-items:center;gap:10px;padding-left:8px}.global-search-root .profile .pic{width:40px;height:40px;border-radius:12px;background:linear-gradient(145deg,#1e3a8a,#2563eb);color:#fff;display:grid;place-items:center;font-weight:800}.global-search-root .profile strong{display:block;font-size:13px}.global-search-root .profile small{color:var(--slate-500);font-size:11px}
.global-search-root .content{width:100%;min-height:calc(100vh - 78px);padding:28px 30px 34px;margin:0}.global-search-root .breadcrumb{font-size:12px;color:var(--slate-500);display:flex;gap:8px;align-items:center;margin-bottom:16px}.global-search-root .breadcrumb b{color:var(--blue-700)}.global-search-root .page-head{display:flex;gap:24px;align-items:flex-end;justify-content:space-between;margin-bottom:22px}.global-search-root .eyebrow{font-size:11px;color:var(--blue-700);font-weight:800;text-transform:uppercase;letter-spacing:.15em;margin-bottom:7px}.global-search-root .page-head h1{margin:0;font-size:38px;letter-spacing:-.035em;color:var(--navy-900)}.global-search-root .page-head p{max-width:1040px;margin:10px 0 0;color:var(--slate-600);font-size:16px;line-height:1.65}.global-search-root .security-pill{white-space:nowrap;border:1px solid #bbf7d0;background:var(--green-bg);color:#047857;border-radius:999px;padding:9px 13px;font-size:12px;font-weight:700;display:flex;gap:7px;align-items:center;box-shadow:0 4px 14px rgba(5,150,105,.08)}.global-search-root .hero-search{background:#fff;border:1px solid var(--blue-100);border-radius:20px;padding:18px 20px;box-shadow:var(--shadow);margin-bottom:18px}.global-search-root .search-row{display:flex;gap:12px;align-items:stretch}.global-search-root .search-box{min-width:0;flex:1;height:58px;border:1.5px solid #93c5fd;background:#fff;border-radius:14px;display:flex;align-items:center;gap:12px;padding:0 16px;box-shadow:0 0 0 4px rgba(59,130,246,.06)}.global-search-root .search-box:focus-within{border-color:var(--blue-600);box-shadow:var(--focus)}.global-search-root .search-box .search-icon{font-size:20px;color:var(--blue-700)}.global-search-root .search-box input{border:0;outline:0;min-width:0;flex:1;font-size:16px;color:var(--slate-950);background:transparent}.global-search-root .search-box .clear{border:0;background:var(--slate-100);width:30px;height:30px;border-radius:8px;color:var(--slate-500);display:none}.global-search-root .search-box .clear.show{display:grid;place-items:center}.global-search-root .primary-btn{min-height:58px;border:0;background:var(--blue-600);color:#fff;border-radius:13px;padding:0 22px;font-weight:800;box-shadow:0 8px 20px rgba(37,99,235,.18)}.global-search-root .primary-btn:hover{filter:brightness(1.04);transform:translateY(-1px);box-shadow:0 12px 24px rgba(37,99,235,.24)}.global-search-root .search-hints{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:12px;color:var(--slate-500);font-size:12px}.global-search-root .hint-tags{display:flex;gap:7px;flex-wrap:wrap}.global-search-root .hint-tag{border:1px solid var(--slate-200);background:#fff;border-radius:999px;padding:5px 9px;color:var(--slate-600)}
.global-search-root .summary-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;margin-bottom:18px}.global-search-root .summary-card{border:1px solid var(--slate-200);background:#fff;border-radius:14px;padding:13px 14px;text-align:left;transition:.2s;min-width:0;min-height:88px;display:flex;flex-direction:column;justify-content:center}.global-search-root .summary-card:hover,.global-search-root .summary-card.active{border-color:#93c5fd;box-shadow:0 8px 24px rgba(30,58,138,.08);transform:translateY(-1px)}.global-search-root .summary-card.active{background:linear-gradient(180deg,#eff6ff,#ffffff);border-color:#93c5fd}.global-search-root .summary-card span{display:block;color:var(--slate-500);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.global-search-root .summary-card strong{font-size:24px;display:block;margin-top:4px;color:#0f172a}.global-search-root .layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,34%);gap:20px;align-items:start}.global-search-root .panel{background:#fff;border:1px solid var(--slate-200);border-radius:18px;box-shadow:0 10px 28px rgba(15,42,95,.055)}.global-search-root .filters{grid-column:1/-1;overflow:hidden}.global-search-root .panel-title{padding:15px 18px;border-bottom:1px solid var(--slate-200);display:flex;align-items:center;justify-content:space-between}.global-search-root .panel-title h2{margin:0;font-size:15px}.global-search-root .text-btn{border:0;background:transparent;color:var(--blue-700);font-size:12px;font-weight:800}.global-search-root .filter-body{padding:14px 18px;display:grid;grid-template-columns:1.2fr 1.25fr 1fr .8fr .75fr;gap:14px;align-items:start}.global-search-root .filter-group{padding:0;border-bottom:0;min-width:0}.global-search-root .filter-group h3{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--slate-500);margin:0 0 10px}.global-search-root .check{display:flex;align-items:center;gap:8px;margin:7px 0;font-size:12px;color:var(--slate-700)}.global-search-root .check input{accent-color:var(--blue-600);width:16px;height:16px}.global-search-root .check .mini-count{margin-left:auto;color:var(--slate-400);font-size:11px}.global-search-root .select{width:100%;height:38px;border:1px solid var(--slate-300);border-radius:10px;background:#fff;color:var(--slate-700);padding:0 10px;font-size:13px}.global-search-root .select-spaced{margin-top:8px}.global-search-root .active-filter{margin-left:6px;background:var(--blue-600);color:#fff;border-radius:999px;font-size:10px;padding:2px 6px}
.global-search-root .analytics-panel{margin-bottom:20px;border:1px solid var(--slate-200);background:#fff;border-radius:18px;box-shadow:var(--shadow);padding:18px}.global-search-root .analytics-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:14px}.global-search-root .analytics-eyebrow{font-size:11px;color:var(--blue-700);font-weight:800;text-transform:uppercase;letter-spacing:.13em}.global-search-root .analytics-head h2{font-size:21px;line-height:1.2;margin:3px 0 5px;letter-spacing:-.025em;color:var(--navy-900)}.global-search-root .analytics-head p{margin:0;color:var(--slate-600);font-size:13px}.global-search-root .analytics-period{height:34px;border:1px solid var(--blue-100);background:var(--blue-50);border-radius:999px;padding:8px 12px;color:var(--blue-800);font-size:12px;font-weight:800;white-space:nowrap}.global-search-root .module-chips{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px}.global-search-root .module-chip{border:1px solid var(--slate-200);background:#fff;color:var(--slate-600);border-radius:999px;padding:7px 10px;font-size:12px;font-weight:800}.global-search-root .module-chip:hover,.global-search-root .module-chip.active{border-color:#93c5fd;background:var(--blue-50);color:var(--blue-800)}.global-search-root .analytics-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(280px,1fr);gap:14px;align-items:stretch}.global-search-root .analytics-card{min-width:0;border:1px solid var(--slate-200);background:#fff;border-radius:16px;padding:15px;box-shadow:0 8px 18px rgba(15,42,95,.04)}.global-search-root .distribution-card{grid-column:1}.global-search-root .quality-card{grid-column:2}.global-search-root .trend-card{grid-column:1/-1}.global-search-root .analytics-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;min-height:42px}.global-search-root .analytics-card h3{margin:0;font-size:15px;font-weight:800;color:var(--navy-900)}.global-search-root .analytics-card p{margin:3px 0 0;color:var(--slate-500);font-size:11px;line-height:1.4}.global-search-root .bar-chart{display:grid;gap:10px;min-height:158px;align-content:center}.global-search-root .bar-row{display:grid;grid-template-columns:86px minmax(0,1fr) 28px;gap:10px;align-items:center;font-size:12px;color:var(--slate-600)}.global-search-root .bar-row div{height:10px;border-radius:999px;background:var(--slate-100);overflow:hidden}.global-search-root .bar-row i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#1e3a8a,#38bdf8)}.global-search-root .bar-row b{color:var(--slate-900);font-size:12px;text-align:right}.global-search-root .trend-svg{width:100%;height:360px;display:block}.global-search-root .trend-svg text{font-size:10px;fill:var(--slate-500);font-weight:700}.global-search-root .donut-layout{display:grid;grid-template-columns:120px minmax(0,1fr);gap:14px;align-items:center;min-height:158px}.global-search-root .quality-donut{width:120px;height:120px;border-radius:50%;background:conic-gradient(#1D4ED8 0 52%,#38BDF8 52% 85%,#D97706 85% 100%);position:relative}.global-search-root .quality-donut:after{content:"";position:absolute;inset:24px;border-radius:50%;background:#fff;box-shadow:inset 0 0 0 1px var(--slate-200)}.global-search-root .quality-legend{display:grid;gap:9px;min-width:0}.global-search-root .quality-legend span{display:flex;align-items:center;gap:7px;color:var(--slate-600);font-size:12px;font-weight:700;min-width:0}.global-search-root .quality-legend i{width:9px;height:9px;border-radius:999px;flex:0 0 auto}.global-search-root .quality-legend b{margin-left:auto;color:var(--slate-900)}
.global-search-root .results-panel{min-width:0}.global-search-root .results-head{min-height:62px;padding:14px 18px;border-bottom:1px solid var(--slate-200);display:flex;align-items:center;gap:12px;flex-wrap:wrap}.global-search-root .results-head strong{font-size:15px}.global-search-root .results-head .meta{color:var(--slate-500);font-size:12px}.global-search-root .sort{margin-left:auto;display:flex;align-items:center;gap:8px;color:var(--slate-500);font-size:12px}.global-search-root .sort select{height:34px;border:1px solid var(--slate-300);border-radius:9px;padding:0 8px;background:#fff;color:var(--slate-700)}.global-search-root .result-list{padding:8px}.global-search-root .result-card{display:grid;grid-template-columns:46px minmax(0,1fr) auto;gap:14px;padding:15px 14px;border:1px solid transparent;border-radius:13px;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;align-items:start;min-height:128px}.global-search-root .result-card + .result-card{border-top-color:var(--slate-100);border-radius:0}.global-search-root .result-card:hover{transform:translateY(-1px);border-color:#bfdbfe;background:#f8fbff;border-radius:13px;box-shadow:0 12px 26px rgba(15,42,95,.07)}.global-search-root .entity-icon{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;font-size:18px;font-weight:800;box-shadow:inset 0 0 0 1px rgba(15,42,95,.06);flex:0 0 auto}.global-search-root .patient{background:#eff6ff;color:#2563eb}.global-search-root .visit{background:#ecfeff;color:#0891b2}.global-search-root .claim{background:#f5f3ff;color:#7c3aed}.global-search-root .task{background:#fff7ed;color:#ea580c}.global-search-root .audit{background:#f1f5f9;color:#475569}.global-search-root .evidence{background:#ecfdf5;color:#059669}.global-search-root .result-main{min-width:0}.global-search-root .result-top{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.global-search-root .entity-label{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--slate-400)}.global-search-root .result-title{margin:5px 0 7px;font-size:16px;line-height:1.35;letter-spacing:-.01em}.global-search-root .result-title mark{background:#fef3c7;color:inherit;border-radius:4px;padding:0 2px}.global-search-root .result-meta{display:flex;gap:7px 14px;flex-wrap:wrap;color:var(--slate-500);font-size:12px}.global-search-root .result-meta b{color:var(--slate-700);font-weight:700}.global-search-root .subline{margin-top:9px;font-size:12px;color:var(--slate-600);display:flex;gap:8px;align-items:center;flex-wrap:wrap}.global-search-root .badge{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:700;white-space:nowrap}.global-search-root .badge.success{background:var(--green-bg);color:var(--green)}.global-search-root .badge.warning{background:var(--amber-bg);color:var(--amber)}.global-search-root .badge.danger{background:var(--red-bg);color:var(--red)}.global-search-root .badge.info{background:var(--blue-50);color:var(--blue-700);border-color:var(--blue-100)}.global-search-root .badge.neutral{background:var(--slate-100);color:var(--slate-600)}.global-search-root .result-actions{display:flex;align-items:center;gap:8px;justify-self:end}.global-search-root .open-btn{border:1px solid var(--slate-300);background:#fff;color:var(--slate-700);border-radius:10px;padding:9px 11px;font-size:12px;font-weight:750;white-space:nowrap}.global-search-root .open-btn:hover{border-color:var(--blue-500);color:var(--blue-700)}.global-search-root .more-btn{border:0;background:transparent;width:34px;height:34px;border-radius:9px;color:var(--slate-500)}.global-search-root .more-btn:hover{background:var(--slate-100)}.global-search-root .empty-state-block{text-align:center;padding:28px;color:var(--slate-500);font-size:13px}.global-search-root .pagination{border-top:1px solid var(--slate-200);padding:14px 18px;display:flex;justify-content:space-between;align-items:center;color:var(--slate-500);font-size:12px}.global-search-root .pages{display:flex;gap:6px}.global-search-root .page-btn{width:34px;height:34px;border:1px solid var(--slate-200);background:#fff;border-radius:9px;color:var(--slate-600)}.global-search-root .page-btn.active{background:var(--blue-700);color:#fff;border-color:var(--blue-700)}
.global-search-root .result-card.selected{border-color:#93c5fd;background:#f8fbff;border-radius:13px;box-shadow:inset 3px 0 0 var(--blue-600)}.global-search-root .ai-insight-panel{position:sticky;top:98px;overflow:hidden}.global-search-root .insight-body{padding:15px 16px;display:grid;gap:12px}.global-search-root .insight-entity{display:flex;align-items:flex-start;gap:11px}.global-search-root .insight-entity span{display:block;color:var(--slate-500);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.global-search-root .insight-entity strong{display:block;margin-top:4px;color:var(--slate-950);font-size:14px;line-height:1.35}.global-search-root .insight-metrics{display:grid;grid-template-columns:1fr 1fr;gap:8px}.global-search-root .insight-metrics div{border:1px solid var(--slate-200);border-radius:12px;padding:9px 10px;background:var(--slate-50)}.global-search-root .insight-metrics span{display:block;color:var(--slate-500);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.07em}.global-search-root .insight-metrics strong{display:block;margin-top:4px;font-size:18px;color:var(--blue-800)}.global-search-root .risk-low{color:var(--green)!important}.global-search-root .risk-medium{color:var(--amber)!important}.global-search-root .risk-high,.global-search-root .risk-critical{color:var(--red)!important}.global-search-root .insight-section{border-top:1px solid var(--slate-100);padding-top:12px}.global-search-root .insight-section h3{margin:0 0 8px;color:var(--slate-500);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em}.global-search-root .insight-section p{margin:0;color:var(--slate-700);font-size:13px;line-height:1.5}.global-search-root .related-chip{display:inline-flex;margin:0 6px 6px 0;border:1px solid var(--blue-100);background:var(--blue-50);color:var(--blue-800);border-radius:999px;padding:5px 8px;font-size:11px;font-weight:800}.global-search-root .insight-note{border:1px solid #fed7aa;background:#fffbeb;color:#92400e;border-radius:12px;padding:10px;font-size:11px;line-height:1.45;font-weight:700}
.global-search-root .modal-backdrop{position:fixed;inset:0;background:rgba(7,21,47,.62);backdrop-filter:blur(7px);z-index:100;display:none;align-items:flex-start;justify-content:center;padding:8vh 20px}.global-search-root .modal-backdrop.open{display:flex}.global-search-root .command{width:min(760px,100%);max-height:82vh;background:#fff;border-radius:20px;box-shadow:var(--shadow-lg);overflow:hidden;border:1px solid rgba(191,219,254,.65);display:flex;flex-direction:column}.global-search-root .command-head{padding:18px;border-bottom:1px solid var(--slate-200);background:linear-gradient(180deg,#ffffff,#f8fbff)}.global-search-root .command-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.global-search-root .command-title strong{font-size:16px}.global-search-root .command-title span{font-size:11px;color:var(--slate-500)}.global-search-root .command-input{height:54px;border:1.5px solid #93c5fd;border-radius:13px;display:flex;align-items:center;gap:11px;padding:0 14px;background:#fbfdff}.global-search-root .command-search-icon{font-size:20px;color:#2563eb}.global-search-root .command-input input{flex:1;border:0;outline:0;font-size:15px;background:transparent}.global-search-root .command-body{overflow:auto;padding:10px}.global-search-root .command-section{padding:8px}.global-search-root .command-section h3{margin:4px 8px 8px;font-size:10px;color:var(--slate-400);letter-spacing:.13em;text-transform:uppercase}.global-search-root .quick-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}.global-search-root .quick-item,.global-search-root .recent-item{border:0;background:#fff;border-radius:11px;padding:11px;display:flex;align-items:center;gap:11px;text-align:left;color:var(--slate-700)}.global-search-root .quick-item:hover,.global-search-root .recent-item:hover,.global-search-root .command-result.active,.global-search-root .command-result:hover{background:var(--blue-50);color:var(--blue-800)}.global-search-root .quick-item .qicon{width:32px;height:32px;background:var(--slate-100);border-radius:9px;display:grid;place-items:center}.global-search-root .quick-item small,.global-search-root .recent-item small{display:block;color:var(--slate-500);font-size:10px;margin-top:2px}.global-search-root .recent-row{display:flex;align-items:center}.global-search-root .recent-item{flex:1}.global-search-root .remove-recent{border:0;background:transparent;color:var(--slate-400);width:34px;height:34px}.global-search-root .command-result{padding:11px;border-radius:11px;display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:11px;align-items:center}.global-search-root .command-result .entity-icon{width:36px;height:36px;border-radius:9px;font-size:14px}.global-search-root .command-result strong{display:block;font-size:13px}.global-search-root .command-result small{color:var(--slate-500);font-size:11px}.global-search-root .command-footer{border-top:1px solid var(--slate-200);padding:11px 16px;display:flex;justify-content:space-between;gap:10px;font-size:10px;color:var(--slate-500);background:var(--slate-50)}.global-search-root .key-guide{display:flex;gap:12px}.global-search-root .key-guide span{display:flex;gap:5px;align-items:center}.global-search-root .toast{position:fixed;right:24px;bottom:24px;background:var(--navy-950);color:#fff;padding:13px 16px;border-radius:12px;box-shadow:var(--shadow-lg);z-index:200;font-size:13px;transform:translateY(30px);opacity:0;pointer-events:none;transition:.25s}.global-search-root .toast.show{transform:translateY(0);opacity:1}
.global-search-root .claim{background:var(--blue-50);color:var(--blue-800)}
@media(max-width:1200px){.global-search-root .summary-grid{grid-template-columns:repeat(3,1fr)}.global-search-root .analytics-grid{grid-template-columns:1fr 1fr}.global-search-root .distribution-card,.global-search-root .quality-card{grid-column:auto}.global-search-root .trend-card{grid-column:1/-1}.global-search-root .app{grid-template-columns:238px minmax(0,1fr)}.global-search-root .sidebar{padding-left:12px;padding-right:12px}.global-search-root .layout{grid-template-columns:minmax(0,1fr) minmax(280px,36%)}.global-search-root .filter-body{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:900px){.global-search-root .app{display:block}.global-search-root .sidebar{position:fixed;left:-280px;width:270px;transition:.25s}.global-search-root .sidebar.open{left:0}.global-search-root .mobile-menu{display:block}.global-search-root .content{padding:22px}.global-search-root .trend-svg{height:300px}.global-search-root .layout{grid-template-columns:1fr}.global-search-root .filters,.global-search-root .ai-insight-panel{position:static}.global-search-root .filter-body{grid-template-columns:repeat(2,1fr);gap:16px 24px}.global-search-root .analytics-grid{grid-template-columns:1fr}.global-search-root .distribution-card,.global-search-root .quality-card,.global-search-root .trend-card{grid-column:auto}.global-search-root .page-head{align-items:flex-start}.global-search-root .security-pill{display:none}.global-search-root .profile-copy{display:none}}@media(max-width:640px){.global-search-root .topbar{padding:0 14px;height:68px}.global-search-root .top-search span{font-size:0}.global-search-root .top-search span:after{content:'Search';font-size:13px}.global-search-root .content{padding:16px}.global-search-root .trend-svg{height:260px}.global-search-root .page-head{display:block}.global-search-root .page-head h1{font-size:28px}.global-search-root .search-row{flex-direction:column}.global-search-root .primary-btn{height:48px;min-height:48px}.global-search-root .search-hints{align-items:flex-start;flex-direction:column}.global-search-root .summary-grid{grid-template-columns:repeat(2,1fr)}.global-search-root .filter-body{grid-template-columns:1fr}.global-search-root .analytics-head{flex-direction:column}.global-search-root .module-chips{flex-wrap:nowrap;overflow-x:auto;padding-bottom:3px}.global-search-root .module-chip{flex:0 0 auto}.global-search-root .donut-layout{grid-template-columns:1fr}.global-search-root .result-card{grid-template-columns:40px minmax(0,1fr);min-height:0}.global-search-root .result-actions{grid-column:2;justify-content:flex-start;flex-wrap:wrap}.global-search-root .result-meta{display:grid;grid-template-columns:1fr}.global-search-root .pagination{flex-direction:column;gap:12px}.global-search-root .quick-grid{grid-template-columns:1fr}.global-search-root .command-footer{display:none}.global-search-root .modal-backdrop{padding:0;align-items:stretch}.global-search-root .command{max-height:none;height:100%;border-radius:0}.global-search-root .hint-tags{display:none}}@media(prefers-reduced-motion:reduce){.global-search-root *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
.global-search-root .distribution-card,.global-search-root .quality-card{min-height:410px}
.global-search-root .distribution-card .analytics-card-head,.global-search-root .quality-card .analytics-card-head{min-height:52px}
.global-search-root .bar-chart{min-height:315px;gap:18px}
.global-search-root .bar-row{grid-template-columns:112px minmax(0,1fr) 36px}
.global-search-root .bar-row div{height:18px}
.global-search-root .quality-card .donut-layout{min-height:315px;grid-template-columns:1fr;justify-items:center;align-content:center}
.global-search-root .quality-donut{width:246px;height:246px;background:conic-gradient(#1D4ED8 0 52%,#2563EB 52% 85%,#38BDF8 85% 100%)}
.global-search-root .quality-donut:after{inset:54px}
.global-search-root .quality-donut:before{content:"52%";position:absolute;inset:0;display:grid;place-items:center;color:var(--navy-900);font-size:26px;font-weight:800;z-index:1}
.global-search-root .quality-legend{width:100%;max-width:280px}
.global-search-root .trend-card{min-height:438px}
.global-search-root .trend-card-head{align-items:flex-start;margin-bottom:8px;min-height:50px}
.global-search-root .trend-period-selector{display:flex;align-items:center;gap:4px;border:1px solid var(--blue-100);background:#fff;border-radius:999px;padding:3px;white-space:nowrap}
.global-search-root .trend-period-selector button{height:28px;border:0;border-radius:999px;background:transparent;color:var(--slate-600);padding:0 10px;font-size:11px;font-weight:800;cursor:pointer}
.global-search-root .trend-period-selector button:hover,.global-search-root .trend-period-selector button:focus-visible{background:var(--blue-50);color:var(--blue-800);outline:2px solid transparent}
.global-search-root .trend-period-selector button.active{background:var(--blue-600);color:#fff;box-shadow:0 6px 14px rgba(37,99,235,.18)}
.global-search-root .trend-chart-wrap{width:100%;height:362px;min-height:362px;overflow:hidden}
.global-search-root .trend-tooltip{display:grid;gap:4px;border:1px solid var(--slate-200);border-radius:12px;background:#fff;box-shadow:0 12px 28px rgba(15,23,42,.12);padding:10px 12px;color:var(--slate-900)}
.global-search-root .trend-tooltip strong{font-size:12px;font-weight:800}
.global-search-root .trend-tooltip span{font-size:12px;color:var(--slate-700);font-weight:700}
.global-search-root .trend-tooltip small{font-size:11px;color:var(--slate-500);font-weight:800}
.global-search-root .trend-tooltip .positive{color:var(--green)}
.global-search-root .trend-tooltip .negative{color:var(--red)}
@media(max-width:1200px){.global-search-root .distribution-card,.global-search-root .quality-card{min-height:390px}.global-search-root .bar-chart{min-height:292px}.global-search-root .quality-card .donut-layout{min-height:292px}.global-search-root .quality-donut{width:224px;height:224px}.global-search-root .quality-donut:after{inset:50px}.global-search-root .trend-card{min-height:380px}.global-search-root .trend-chart-wrap{height:310px;min-height:310px}}
@media(max-width:900px){.global-search-root .analytics-grid{grid-template-columns:1fr}.global-search-root .distribution-card,.global-search-root .quality-card{min-height:360px}.global-search-root .bar-chart{min-height:270px}.global-search-root .quality-card .donut-layout{min-height:270px}.global-search-root .quality-donut{width:220px;height:220px}.global-search-root .quality-donut:after{inset:48px}.global-search-root .trend-card{min-height:356px}.global-search-root .trend-chart-wrap{height:292px;min-height:292px}}
@media(max-width:640px){.global-search-root .distribution-card,.global-search-root .quality-card{min-height:330px}.global-search-root .bar-chart{min-height:238px;gap:14px}.global-search-root .bar-row{grid-template-columns:88px minmax(0,1fr) 28px}.global-search-root .bar-row div{height:15px}.global-search-root .quality-card .donut-layout{min-height:238px}.global-search-root .quality-donut{width:190px;height:190px}.global-search-root .quality-donut:after{inset:42px}.global-search-root .quality-donut:before{font-size:22px}.global-search-root .trend-card{min-height:326px}.global-search-root .trend-card-head{display:grid}.global-search-root .trend-period-selector{max-width:100%;overflow-x:auto}.global-search-root .trend-chart-wrap{height:258px;min-height:258px}}
`;
