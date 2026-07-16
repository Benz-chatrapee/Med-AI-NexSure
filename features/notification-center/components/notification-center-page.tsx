"use client";

import {
  BadgeCheck,
  Bell,
  CheckCheck,
  ChevronDown,
  CircleCheck,
  CircleHelp,
  ClockAlert,
  ExternalLink,
  Gauge,
  History,
  Inbox,
  Link2,
  Menu,
  MessageSquareText,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  criticalTimeline,
  executiveNotificationKpis,
  initialNotifications,
  kpis,
  moduleDistribution,
  notificationTrend,
  priorityDistribution,
  queueSnapshot,
} from "../data";
import type { KpiFilter, NotificationCategory, NotificationFilters, NotificationItem, NotificationSeverity, NotificationStatus, NotificationTab } from "../types";

const defaultFilters: NotificationFilters = { tab: "all", severity: "", category: "", status: "", text: "", kpi: "" };

export function NotificationCenterPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filters, setFilters] = useState<NotificationFilters>(defaultFilters);
  const [selectedId, setSelectedId] = useState("N-240710-8842");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const query = filters.text.trim().toLowerCase();
    return notifications.filter((item) => {
      const tabMatch =
        filters.tab === "all" ||
        (filters.tab === "unread" && item.unread) ||
        (filters.tab === "critical" && item.severity === "critical") ||
        (filters.tab === "mine" && item.mine) ||
        (filters.tab === "resolved" && item.status === "resolved") ||
        filters.tab === item.category;
      const kpiMatch =
        !filters.kpi ||
        filters.kpi === "all" ||
        (filters.kpi === "critical" && item.severity === "critical") ||
        (filters.kpi === "action" && item.actionRequired) ||
        (filters.kpi === "mine" && item.mine) ||
        (filters.kpi === "due" && item.sla === "due") ||
        (filters.kpi === "overdue" && item.sla === "overdue");
      const text = [item.id, item.title, item.description, item.assignee, ...item.entity].join(" ").toLowerCase();
      return tabMatch && kpiMatch && (!filters.severity || item.severity === filters.severity) && (!filters.category || item.category === filters.category) && (!filters.status || item.status === filters.status) && (!query || text.includes(query));
    });
  }, [filters, notifications]);

  const selected = notifications.find((item) => item.id === selectedId) ?? notifications[0];
  const unreadCount = notifications.filter((item) => item.unread).length;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function selectNotification(id: string) {
    setSelectedId(id);
    setDetailOpen(true);
    setNotifications((items) => items.map((item) => (item.id === id ? { ...item, unread: false } : item)));
  }

  function markAllRead() {
    const visibleIds = new Set(filtered.map((item) => item.id));
    setNotifications((items) => items.map((item) => (visibleIds.has(item.id) ? { ...item, unread: false } : item)));
    setDialogOpen(false);
    showToast("All visible notifications were marked as read. Critical alerts remain active and require resolution.");
  }

  function resetFilters() {
    setFilters(defaultFilters);
    showToast("All notification filters cleared.");
  }

  function refresh() {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      showToast("Notification data synchronized successfully.");
    }, 720);
  }

  function toggleAll(checked: boolean) {
    setSelectedRows(checked ? new Set(filtered.map((item) => item.id)) : new Set());
  }

  return (
    <div className="notification-center-root">
      <style jsx global>{notificationCenterCss}</style>
      <div className="app-shell">
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} id="sidebar">
          <div className="brand">
            <div className="brand-mark"><Sparkles size={22} /></div>
            <div><div className="brand-title">Med AI NexSure</div><div className="brand-sub">Healthcare Intelligence</div></div>
          </div>
          <Nav unreadCount={unreadCount} />
          <div className="sidebar-footer"><div className="health-row"><span className="health-dot" />Notification Engine Online</div></div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <button className="icon-btn mobile-menu" aria-label="Open menu" type="button" onClick={() => setSidebarOpen((open) => !open)}><Menu size={20} /></button>
            <div className="global-search"><Search size={18} /><input aria-label="Global search" placeholder="Search patient, visit, claim, notification..." /><span className="key">⌘K</span></div>
            <div className="top-actions">
              <button className="icon-btn" type="button" aria-label="AI Copilot"><Sparkles size={18} /></button>
              <button className="icon-btn" type="button" aria-label="Notifications"><Bell size={18} /><span className="bell-dot" /></button>
              <button className="org-switcher" type="button">Bangkok HQ<ChevronDown size={14} /></button>
              <div className="avatar">BJ</div>
            </div>
          </header>
          <main className="page">
            <section className="page-head">
              <div className="breadcrumb"><span>Workspace</span><span>/</span><strong>Notification Center</strong></div>
              <div className="head-row">
                <div className="head-copy">
                  <div className="eyebrow">Enterprise Alert Operations</div>
                  <h1>Notification Center</h1>
                  <p>Centralized clinical safety, claim readiness, evidence, security, and compliance notifications.</p>
                  <p className="thai-support">รวมการแจ้งเตือนสำคัญเพื่อให้ทีมที่ได้รับอนุญาตตรวจสอบและดำเนินการภายใน SLA</p>
                </div>
                <div className="head-meta">
                  <span className="last-updated"><ClockAlert size={14} />Updated 10 Jul 2026 · 14:48</span>
                  <button className="btn" id="refreshBtn" type="button" onClick={refresh}><RefreshCw className={refreshing ? "spin" : ""} size={15} />Refresh</button>
                  <button className="btn" id="settingsBtn" type="button" onClick={() => showToast("Notification Preferences opened. การตั้งค่าจะแยกตาม Organization และ Access Scope")}><Settings size={15} />Preferences</button>
                  <button className="btn btn-primary" id="markAllBtn" type="button" onClick={() => setDialogOpen(true)}><CheckCheck size={15} />Mark All Read</button>
                </div>
              </div>
              <div className="kpi-grid">
                {kpis.map((kpi, index) => {
                  const Icon = kpi.icon;
                  return (
                    <button key={kpi.label} type="button" className={`kpi ${filters.kpi === kpi.filter || (!filters.kpi && index === 0) ? "active" : ""}`} onClick={() => setFilters((current) => ({ ...current, kpi: kpi.filter as KpiFilter }))}>
                      <div className="kpi-top"><div className={`kpi-icon ${kpi.tone}`}><Icon size={17} /></div><div className="kpi-value">{kpi.label === "Unread" ? unreadCount : kpi.value}</div></div>
                      <div className="kpi-label">{kpi.label}</div><div className="kpi-sub">{kpi.sub}</div>
                    </button>
                  );
                })}
              </div>
            </section>
            <NotificationAnalytics />
            <NotificationToolbar filters={filters} resultCount={filtered.length} onFiltersChange={setFilters} onReset={resetFilters} />
            <div className="workspace">
              <section className="feed-panel">
                <div className="feed-head">
                  <input className="check" id="selectAll" type="checkbox" aria-label="Select all visible notifications" checked={filtered.length > 0 && filtered.every((item) => selectedRows.has(item.id))} onChange={(event) => toggleAll(event.target.checked)} />
                  <label htmlFor="selectAll"><strong>{filtered.length}</strong> notifications shown</label>
                  <div className="sort">Sort by Priority & SLA<ChevronDown size={13} /></div>
                </div>
                <div className="feed-list">
                  {filtered.map((item) => (
                    <NotificationRow
                      key={item.id}
                      item={item}
                      selected={selected.id === item.id}
                      checked={selectedRows.has(item.id)}
                      onSelect={() => selectNotification(item.id)}
                      onCheck={(checked) => setSelectedRows((rows) => {
                        const next = new Set(rows);
                        if (checked) next.add(item.id);
                        else next.delete(item.id);
                        return next;
                      })}
                    />
                  ))}
                  {filtered.length === 0 ? <EmptyState /> : null}
                </div>
              </section>
              <NotificationDetail item={selected} open={detailOpen} onClose={() => setDetailOpen(false)} onToast={showToast} />
            </div>
          </main>
        </div>
      </div>
      <ConfirmDialog open={dialogOpen} onCancel={() => setDialogOpen(false)} onConfirm={markAllRead} />
      <div className={`toast ${toast ? "show" : ""}`}><CircleCheck className="ok" size={18} /><span>{toast || "Action completed and recorded in the audit trail."}</span></div>
    </div>
  );
}

function NotificationAnalytics() {
  return (
    <section className="analytics-section" aria-labelledby="notification-intelligence-title">
      <div className="analytics-head">
        <div>
          <div className="analytics-eyebrow">Notification Intelligence</div>
          <h2 id="notification-intelligence-title">Enterprise Notification Intelligence Dashboard</h2>
          <p>Executive signal view across clinical safety, claim readiness, evidence, AI, security, and compliance queues.</p>
          <p lang="th">ภาพรวมสัญญาณแจ้งเตือนสำหรับการติดตามความเสี่ยง การดำเนินการ และ SLA</p>
        </div>
        <div className="analytics-period">Last 7 Days</div>
      </div>

      <div className="exec-kpi-grid">
        {executiveNotificationKpis.map((kpi) => (
          <div className={`exec-kpi ${kpi.tone}`} key={kpi.label}>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <div><b>{kpi.delta}</b><span>{kpi.helper}</span></div>
          </div>
        ))}
      </div>

      <AnalyticsCard className="trend-card" title="Notification Trend" helper="Total Notifications, Critical Alerts, and AI Generated Alerts across the last 7 days.">
        <div className="chart-legend" aria-label="Notification Trend legend">
          <span><i className="legend-total" />Total Notifications</span>
          <span><i className="legend-critical" />Critical Alerts</span>
          <span><i className="legend-ai" />AI Generated Alerts</span>
        </div>
        <div className="chart-frame trend-frame">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={notificationTrend} margin={{ top: 14, right: 22, left: 2, bottom: 10 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} dy={8} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} width={36} />
              <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0", boxShadow: "0 10px 30px rgba(15,42,95,.08)" }} />
              <Line type="monotone" dataKey="total" stroke="#1E3A8A" strokeWidth={3} dot={{ r: 3 }} name="Total" />
              <Line type="monotone" dataKey="critical" stroke="#DC2626" strokeWidth={2} dot={{ r: 2 }} name="Critical" />
              <Line type="monotone" dataKey="ai" stroke="#7C3AED" strokeWidth={2} dot={{ r: 2 }} name="AI Generated" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </AnalyticsCard>

      <div className="distribution-grid">
        <AnalyticsCard title="Priority Distribution" helper="Parts-of-whole severity mix.">
          <div className="donut-layout">
            <div className="chart-frame donut-frame">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie data={priorityDistribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={2}>
                    {priorityDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="donut-legend">{priorityDistribution.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}<b>{item.value}</b></span>)}</div>
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Module Distribution" helper="Where notifications originate.">
          <div className="chart-frame bar-frame">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moduleDistribution} layout="vertical" margin={{ top: 8, right: 24, left: 34, bottom: 8 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis type="category" dataKey="module" width={142} tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0" }} />
              <Bar dataKey="value" fill="#2563EB" radius={[0, 8, 8, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </AnalyticsCard>
      </div>

      <div className="operations-grid">
        <AnalyticsCard title="Critical Alert Timeline" helper="Escalated clinical and compliance moments.">
          <div className="critical-timeline">
            {criticalTimeline.map((item) => (
              <div className="critical-event" key={`${item.time}-${item.label}`}>
                <time>{item.time}</time>
                <div><strong>{item.label}</strong><span>Requires authorized review and audit traceability.</span></div>
                <span className={`event-badge ${item.status.toLowerCase()}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Queue Snapshot" helper="Current operational queue state.">
          <div className="queue-list">
            {queueSnapshot.map((item) => <div className={`queue-row ${item.tone}`} key={item.label}><span>{item.label}</span><div><strong>{item.value}</strong><i style={{ width: `${Math.max(18, item.value)}%` }} /></div></div>)}
          </div>
        </AnalyticsCard>
      </div>
    </section>
  );
}

function AnalyticsCard({ title, helper, className = "", children }: { title: string; helper: string; className?: string; children: ReactNode }) {
  return (
    <article className={`analytics-card ${className}`}>
      <div className="analytics-card-head"><h3>{title}</h3><p>{helper}</p></div>
      {children}
    </article>
  );
}

function Nav({ unreadCount }: { unreadCount: number }) {
  const groups = [
    { label: "Workspace", items: ["Dashboard", "Task Center", "Global Search", "Notifications"] },
    { label: "Clinical Operations", items: ["Patients", "Visits", "AI Clinical", "Prescription Safety"] },
    { label: "Insurance Intelligence", items: ["Claim Readiness", "Evidence Package", "Economic Intelligence"] },
  ];
  return (
    <nav>
      {groups.map((group) => (
        <div className="nav-group" key={group.label}>
          <div className="nav-label">{group.label}</div>
          {group.items.map((item) => (
            <a className={`nav-item ${item === "Notifications" ? "active" : ""}`} href="#" key={item}>
              <Bell size={16} /><span>{item}</span>{item === "Notifications" ? <span className="count" id="navUnread">{unreadCount}</span> : null}
            </a>
          ))}
        </div>
      ))}
    </nav>
  );
}

function NotificationToolbar({ filters, resultCount, onFiltersChange, onReset }: { filters: NotificationFilters; resultCount: number; onFiltersChange: (filters: NotificationFilters) => void; onReset: () => void }) {
  const tabs: Array<{ label: string; tab: NotificationTab; count: string }> = [
    { label: "All", tab: "all", count: "128" },
    { label: "Unread", tab: "unread", count: "46" },
    { label: "Critical", tab: "critical", count: "9" },
    { label: "Clinical", tab: "clinical", count: "18" },
    { label: "Claims", tab: "claims", count: "27" },
    { label: "Evidence", tab: "evidence", count: "14" },
    { label: "Assigned to Me", tab: "mine", count: "12" },
    { label: "Resolved", tab: "resolved", count: "62" },
  ];
  const chips = [
    filters.kpi && filters.kpi !== "all" ? ["KPI", filters.kpi] : null,
    filters.severity ? ["Severity", filters.severity] : null,
    filters.category ? ["Category", filters.category] : null,
    filters.status ? ["Status", filters.status.replace("_", " ")] : null,
    filters.text ? ["Search", filters.text] : null,
  ].filter((chip): chip is string[] => Array.isArray(chip));
  return (
    <section className="toolbar">
      <div className="tabs">
        {tabs.map((tab) => (
          <button key={tab.tab} type="button" className={`tab ${filters.tab === tab.tab ? "active" : ""}`} onClick={() => onFiltersChange({ ...filters, tab: tab.tab })}>
            {tab.label}<span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>
      <div className="filter-row">
        <div className="search-box"><Search size={15} /><input id="notificationSearch" value={filters.text} onChange={(event) => onFiltersChange({ ...filters, text: event.target.value })} placeholder="Search notification, patient, visit, claim..." /></div>
        <Select value={filters.severity} label="Severity" onChange={(value) => onFiltersChange({ ...filters, severity: value as "" | NotificationSeverity })} options={["critical", "high", "medium", "low", "info"]} />
        <Select value={filters.category} label="Category" onChange={(value) => onFiltersChange({ ...filters, category: value as "" | NotificationCategory })} options={["clinical", "evidence", "security", "claims", "economic", "tasks", "system"]} />
        <Select value={filters.status} label="Status" onChange={(value) => onFiltersChange({ ...filters, status: value as "" | NotificationStatus })} options={["unread", "acknowledged", "escalated", "resolved"]} />
        <button className="btn btn-sm" type="button" onClick={onReset}>Clear Filters</button>
      </div>
      <div className="active-chips">
        <span className="chip">Results: {resultCount}</span>
        {chips.map(([label, value]) => <span className="chip" key={`${label}-${value}`}>{label}: {value}<X size={12} /></span>)}
      </div>
    </section>
  );
}

function Select({ value, label, options, onChange }: { value: string; label: string; options: string[]; onChange: (value: string) => void }) {
  return <div className="select-wrap"><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}><option value="">{label}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={14} /></div>;
}

function NotificationRow({ item, selected, checked, onSelect, onCheck }: { item: NotificationItem; selected: boolean; checked: boolean; onSelect: () => void; onCheck: (checked: boolean) => void }) {
  return (
    <article className={`notification-item ${item.unread ? "unread" : ""} ${selected ? "selected" : ""}`} tabIndex={0} onClick={onSelect} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(); } }}>
      <input type="checkbox" className="check row-check" aria-label={`Select ${item.title}`} checked={checked} onChange={(event) => onCheck(event.target.checked)} onClick={(event) => event.stopPropagation()} />
      <div className={`sev-line ${item.severity}`} />
      <div className="n-main">
        <div className="n-top">{item.badges.map((badge) => <Badge badge={badge} key={`${item.id}-${badge.label}`} />)}</div>
        <div className="n-title">{item.title}</div>
        <div className="n-desc">{item.description}</div>
        <div className="entity-row">{item.entity.map((entity, index) => <span className={index === 0 || entity.startsWith("VN") || entity.startsWith("CLM") ? "entity-link" : ""} key={entity}>{index > 0 ? "· " : ""}{entity}</span>)}</div>
      </div>
      <div className="n-side"><span className="time">{item.time}</span><span className={`sla ${item.sla}`}><ClockAlert size={13} />{item.slaLabel}</span><span className="assignee"><span className="mini-avatar">{item.assigneeInitials}</span>{item.assignee}</span></div>
    </article>
  );
}

function Badge({ badge }: { badge: NotificationItem["badges"][number] }) {
  const Icon = badge.icon;
  return <span className={`badge ${badge.tone}`}>{Icon ? <Icon size={12} /> : null}{badge.label}</span>;
}

function EmptyState() {
  return <div className="empty-state show"><div className="empty-icon"><Inbox size={27} /></div><h3>No Notifications Found</h3><p>ไม่พบรายการที่ตรงกับตัวกรองปัจจุบัน กรุณาปรับเงื่อนไขการค้นหา</p></div>;
}

function NotificationDetail({ item, open, onClose, onToast }: { item: NotificationItem; open: boolean; onClose: () => void; onToast: (message: string) => void }) {
  return (
    <aside className={`detail-panel ${open ? "open" : ""}`} aria-label="Notification details">
      <div className="detail-head">
        <div className="detail-topline">
          <div className="detail-icon"><ShieldAlert size={22} /></div>
          <div className="detail-title"><h2>{item.title}</h2><div className="detail-id">Notification ID · <span>{item.id}</span></div></div>
          <button className="icon-btn close-detail" type="button" aria-label="Close details" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="detail-badges">{item.badges.map((badge) => <Badge badge={badge} key={`detail-${badge.label}`} />)}<span className="badge status">{item.unread ? "Unread" : "Viewed"}</span></div>
      </div>
      <div className="detail-body">
        <section className="section"><div className="section-title"><MessageSquareText size={15} />Notification Summary</div><div className="message-box">Amoxicillin 500 mg was prescribed while a Penicillin allergy is documented in the patient record. This alert requires immediate clinical review before medication dispensing.</div></section>
        <section className="section"><div className="section-title"><Sparkles size={15} />Trigger & Decision Support</div><div className="reason-box"><strong>Rule PS-ALLERGY-001 triggered</strong><br />Active ingredient belongs to the Penicillin class and matches an active allergy record. AI confidence: <strong>96%</strong>.<br /><br /><small>AI provides decision support only. Final clinical judgment and accountability remain with an authorized healthcare professional.<br /><span lang="th">คำแนะนำจาก AI ไม่ใช่คำวินิจฉัย ผู้มีสิทธิ์ต้องตรวจสอบข้อมูลก่อนตัดสินใจ</span></small></div></section>
        <section className="section"><div className="section-title"><Link2 size={15} />Related Clinical & Claim Context</div><div className="kv-grid"><Kv label="Patient" value="Anong S." sub="HN-008921 · Female · 42y" /><Kv label="Visit" value="VN-20260710-0142" sub="OPD · Today 13:58" tone="blue" /><Kv label="Medication" value="Amoxicillin 500 mg" sub="1 capsule · TID · 7 days" /><Kv label="Documented Allergy" value="Penicillin" sub="Reaction: Urticaria" tone="red" /></div></section>
        <section className="section"><div className="section-title"><Gauge size={15} />Claim Readiness & SLA Context</div><div className="score-row"><div className="score"><span>72</span></div><div><strong className="score-title">Claim Readiness · Needs Review</strong><div className="score-copy">Clinical safety issue prevents Evidence Package completion until reviewed.</div><div className="sla overdue score-sla"><ClockAlert size={13} />Critical SLA overdue by 8 minutes · กรุณาดำเนินการทันที</div></div></div></section>
        <section className="section"><div className="section-title"><History size={15} />Audit Activity Timeline</div><div className="timeline"><Timeline title="Alert created by Prescription Safety Engine" meta="10 Jul 2026 · 14:40 · Status: Unread" /><Timeline title="Assigned automatically to Clinical Review Team" meta="10 Jul 2026 · 14:40 · Rule-based routing" /><Timeline title="Viewed by Benz Jam-Oum" meta="10 Jul 2026 · 14:42 · Read state updated" /></div></section>
      </div>
      <div className="detail-actions"><button className="btn" type="button" onClick={() => onToast("Notification acknowledged. Actor and timestamp were recorded in the audit trail.")}><BadgeCheck size={15} />Acknowledge Alert</button><button className="btn" type="button" onClick={() => onToast("Assignment workflow opened. เลือกผู้รับผิดชอบภายใน Organization Scope")}><UserPlus size={15} />Assign Owner</button><button className="btn btn-primary" type="button" onClick={() => onToast("Opening Visit Detail · VN-20260710-0142")}><ExternalLink size={15} />View Visit Detail</button></div>
    </aside>
  );
}

function Kv({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "blue" | "red" }) {
  return <div className="kv"><span className="label">{label}</span><strong className={tone === "blue" ? "text-blue" : tone === "red" ? "text-red" : ""}>{value}</strong><span>{sub}</span></div>;
}

function Timeline({ title, meta }: { title: string; meta: string }) {
  return <div className="tl-item"><strong>{title}</strong><span>{meta}</span></div>;
}

function ConfirmDialog({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <div className={`dialog-backdrop ${open ? "show" : ""}`} role="dialog" aria-modal="true" aria-labelledby="dialogTitle" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}><div className="dialog"><div className="dialog-icon"><CircleHelp size={22} /></div><h3 id="dialogTitle">Mark All Notifications as Read?</h3><p>This action changes the read state only. Critical alerts remain active and unresolved.</p><p lang="th" className="dialog-thai">การดำเนินการนี้ไม่เปลี่ยนสถานะการแก้ไข และไม่ปิด Critical Alert</p><div className="dialog-actions"><button className="btn" type="button" onClick={onCancel}>Cancel</button><button className="btn btn-primary" type="button" onClick={onConfirm}><CheckCheck size={15} />Confirm Action</button></div></div></div>;
}

const notificationCenterCss = `
.notification-center-root{--primary:#1E3A8A;--primary-hover:#172F73;--deep-blue:#0F2A5F;--ai-blue:#2563EB;--ai-soft:#EFF6FF;--blue-border:#BFDBFE;--azure:#38BDF8;--bg:#F8FAFC;--surface:#FFFFFF;--surface-muted:#F8FAFC;--surface-subtle:#F1F5F9;--border:#E2E8F0;--border-strong:#CBD5E1;--text:#0F172A;--text-secondary:#64748B;--text-muted:#94A3B8;--success:#059669;--success-soft:#ECFDF5;--warning:#D97706;--warning-soft:#FFF7ED;--critical:#DC2626;--critical-soft:#FEF2F2;--purple:#7C3AED;--purple-soft:#F5F3FF;--shadow-sm:0 2px 8px rgba(15,42,95,.05);--shadow-md:0 10px 30px rgba(15,42,95,.08);--sidebar:268px;--topbar:74px;--detail:430px;color:var(--text);background:var(--bg);font-size:16px;line-height:1.55;letter-spacing:-.005em;height:100vh;overflow:hidden}
.notification-center-root *{box-sizing:border-box}.notification-center-root button,.notification-center-root input,.notification-center-root select{font:inherit}.notification-center-root button{cursor:pointer}.notification-center-root button:focus-visible,.notification-center-root input:focus-visible,.notification-center-root select:focus-visible,.notification-center-root [tabindex]:focus-visible{outline:3px solid rgba(37,99,235,.25);outline-offset:2px}
.app-shell{display:grid;grid-template-columns:var(--sidebar) minmax(0,1fr);min-height:100vh;width:100vw}.sidebar{background:var(--deep-blue);color:#fff;height:100vh;overflow-y:auto;padding:20px 16px;border-right:1px solid rgba(255,255,255,.08);z-index:40}.brand{display:flex;gap:12px;align-items:center;padding:3px 8px 22px;border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:18px}.brand-mark{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:var(--ai-blue);box-shadow:0 10px 24px rgba(37,99,235,.28);flex:0 0 auto}.brand-title{font-weight:800;font-size:18px;letter-spacing:-.02em}.brand-sub{font-size:11px;color:#AFC7EE;margin-top:1px}.nav-group{margin-top:20px}.nav-label{color:#8FAAD1;font-size:11px;text-transform:uppercase;letter-spacing:.11em;font-weight:700;padding:0 12px 8px}.nav-item{display:flex;align-items:center;gap:12px;min-height:48px;padding:10px 12px;border-radius:12px;color:#D9E6FA;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:4px;transition:.2s ease;position:relative}.nav-item:hover{background:rgba(255,255,255,.07);color:#fff}.nav-item.active{background:rgba(37,99,235,.22);color:#fff;box-shadow:inset 3px 0 0 var(--azure)}.nav-item .count{margin-left:auto;min-width:24px;height:22px;padding:0 7px;display:grid;place-items:center;border-radius:999px;background:#DC2626;color:#fff;font-size:11px;font-weight:800}.sidebar-footer{margin-top:26px;padding:14px;border:1px solid rgba(255,255,255,.10);border-radius:13px;background:rgba(255,255,255,.05)}.health-row{display:flex;align-items:center;gap:9px;font-size:12px;color:#D9E6FA}.health-dot{width:9px;height:9px;border-radius:50%;background:#34D399;box-shadow:0 0 0 4px rgba(52,211,153,.12)}
.main-shell{min-width:0;height:100vh;display:flex;flex-direction:column}.topbar{height:var(--topbar);flex:0 0 var(--topbar);background:#fff;display:flex;align-items:center;gap:16px;padding:0 28px;border-bottom:1px solid var(--border);z-index:30}.mobile-menu{display:none}.global-search{flex:1;max-width:620px;height:44px;border:1px solid var(--border);background:var(--surface-muted);border-radius:12px;display:flex;align-items:center;gap:10px;padding:0 14px;color:var(--text-secondary)}.global-search input{border:0;outline:0;width:100%;background:transparent;color:var(--text);font-size:15px}.key{border:1px solid var(--border-strong);background:#fff;border-radius:6px;padding:1px 7px;color:var(--text-muted);font-size:11px}.top-actions{margin-left:auto;display:flex;align-items:center;gap:8px}.icon-btn{width:42px;height:42px;border-radius:14px;border:1px solid var(--border);background:#fff;color:var(--text-secondary);display:grid;place-items:center;position:relative;transition:.2s}.icon-btn:hover{border-color:#9DB4D5;color:var(--primary);transform:translateY(-1px)}.bell-dot{position:absolute;top:7px;right:7px;width:9px;height:9px;background:var(--critical);border:2px solid white;border-radius:50%}.org-switcher{height:42px;padding:0 12px;border:1px solid var(--border);border-radius:14px;display:flex;align-items:center;gap:9px;background:#fff;color:var(--text);font-weight:600;font-size:13px}.avatar{width:38px;height:38px;display:grid;place-items:center;border-radius:50%;background:linear-gradient(135deg,#DBEAFE,#BFDBFE);color:var(--primary);font-weight:800;border:2px solid #fff;box-shadow:0 0 0 1px var(--border)}
.page{flex:1;min-height:0;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;background:var(--bg)}.page-head{padding:24px 28px 18px;background:#fff;border-bottom:1px solid var(--border);flex:0 0 auto}.page-head>.breadcrumb,.page-head>.head-row,.page-head>.kpi-grid{max-width:1480px;margin-left:auto;margin-right:auto}.breadcrumb{display:flex;gap:7px;align-items:center;color:var(--text-muted);font-size:12px;margin-bottom:8px}.head-row{display:flex;align-items:flex-start;gap:18px}.head-copy{min-width:0;flex:1}.eyebrow{font-size:12px;color:var(--ai-blue);font-weight:800;text-transform:uppercase;letter-spacing:.08em}.head-copy h1{font-size:32px;line-height:1.18;margin:4px 0 5px;letter-spacing:-.035em;font-weight:800}.head-copy p{margin:0;color:var(--text-secondary);font-size:14px}.head-copy .thai-support{margin-top:3px;font-size:13px;color:#6B7C93}.head-meta{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end;align-items:center}.last-updated{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--text-secondary);margin-right:4px}.btn{min-height:42px;border-radius:14px;border:1px solid var(--border);padding:9px 14px;background:#fff;color:var(--text);display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:700;font-size:13px;transition:.2s ease;white-space:nowrap}.btn:hover{border-color:#9DB4D5;transform:translateY(-1px);box-shadow:var(--shadow-sm)}.btn-primary{background:var(--primary);color:#fff;border-color:var(--primary)}.btn-primary:hover{background:var(--primary-hover);border-color:var(--primary-hover)}.btn-sm{min-height:36px;padding:7px 11px;font-size:12px;border-radius:9px}
.kpi-grid{display:grid;grid-template-columns:repeat(6,minmax(130px,1fr));gap:12px;margin-top:20px}.kpi{text-align:left;border:1px solid var(--border);background:#fff;border-radius:16px;padding:16px;box-shadow:var(--shadow-sm);min-width:0;cursor:pointer;transition:.2s ease;position:relative;overflow:hidden}.kpi:hover{transform:translateY(-2px);box-shadow:var(--shadow-md);border-color:#B8C8DE}.kpi.active{box-shadow:0 0 0 2px rgba(37,99,235,.16);border-color:#7FA5DF}.kpi::after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--ai-blue);opacity:0}.kpi.active::after{opacity:1}.kpi-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.kpi-icon{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--ai-soft);color:var(--ai-blue)}.kpi-icon.red{background:var(--critical-soft);color:var(--critical)}.kpi-icon.orange{background:var(--warning-soft);color:var(--warning)}.kpi-value{font-size:28px;font-weight:800;letter-spacing:-.04em}.kpi-label{margin-top:7px;font-size:13px;color:var(--text-secondary);font-weight:700}.kpi-sub{font-size:10px;color:var(--text-muted);margin-top:2px}
.analytics-section{flex:0 0 auto;width:100%;background:#F8FAFC;border-bottom:1px solid var(--border);padding:24px 28px;overflow:visible}.analytics-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin:0 auto 18px;max-width:1480px}.analytics-eyebrow{font-size:12px;color:var(--ai-blue);font-weight:800;text-transform:uppercase;letter-spacing:.08em}.analytics-head h2{margin:3px 0 6px;font-size:25px;line-height:1.2;font-weight:800;letter-spacing:-.025em;color:var(--text)}.analytics-head p{max-width:820px;margin:0;color:var(--text-secondary);font-size:14px;line-height:1.45}.analytics-head p[lang="th"]{margin-top:4px;color:#6B7C93;font-size:13px}.analytics-period{height:36px;border:1px solid var(--blue-border);background:var(--ai-soft);border-radius:999px;padding:8px 13px;color:var(--primary);font-size:12px;font-weight:800;white-space:nowrap}.exec-kpi-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px;margin:0 auto 20px;max-width:1480px}.exec-kpi{min-height:132px;border:1px solid var(--border);background:#fff;border-radius:16px;padding:16px 17px;box-shadow:var(--shadow-sm);position:relative;overflow:hidden}.exec-kpi::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--ai-blue)}.exec-kpi.red::before{background:var(--critical)}.exec-kpi.amber::before{background:var(--warning)}.exec-kpi.green::before{background:var(--success)}.exec-kpi.purple::before{background:var(--purple)}.exec-kpi>span{display:block;min-height:28px;color:var(--text-secondary);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;line-height:1.25}.exec-kpi strong{display:block;margin-top:10px;font-size:31px;line-height:1;font-weight:800;letter-spacing:-.04em}.exec-kpi div{display:flex;gap:7px;align-items:flex-start;margin-top:11px;color:var(--text-muted);font-size:12px;line-height:1.35}.exec-kpi b{color:var(--text);font-size:12px;white-space:nowrap}.exec-kpi div span{display:block}.analytics-card{min-width:0;border:1px solid var(--border);background:#fff;border-radius:18px;padding:18px;box-shadow:var(--shadow-sm);overflow:hidden}.analytics-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}.analytics-card h3{margin:0;font-size:16px;font-weight:800;color:var(--text);letter-spacing:-.01em}.analytics-card p{margin:3px 0 0;color:var(--text-secondary);font-size:12px;line-height:1.45}.trend-card,.distribution-grid,.operations-grid{max-width:1480px;margin-left:auto;margin-right:auto}.trend-card{margin-bottom:18px}.distribution-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:18px;margin-bottom:18px}.operations-grid{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(320px,.8fr);gap:18px}.chart-frame{width:100%;min-width:0}.trend-frame{height:320px}.donut-layout{display:grid;grid-template-columns:minmax(210px,1fr) minmax(120px,.72fr);align-items:center;gap:12px}.donut-frame{height:260px}.bar-frame{height:300px}.chart-legend{display:flex;flex-wrap:wrap;gap:10px 16px;margin:0 0 10px;color:var(--text-secondary);font-size:12px;font-weight:700}.chart-legend span,.donut-legend span{display:flex;align-items:center;gap:7px}.chart-legend i,.donut-legend i{width:9px;height:9px;border-radius:999px;display:inline-block}.legend-total{background:var(--primary)}.legend-critical{background:var(--critical)}.legend-ai{background:var(--purple)}.donut-legend{display:grid;gap:9px}.donut-legend span{justify-content:space-between;color:var(--text-secondary);font-size:12px;font-weight:700}.donut-legend b{margin-left:auto;color:var(--text);font-size:12px}.critical-timeline{position:relative;display:grid;gap:10px}.critical-event{display:grid;grid-template-columns:64px minmax(0,1fr) auto;align-items:center;gap:13px;padding:13px;border:1px solid var(--border);border-radius:14px;background:var(--surface-muted)}.critical-event time{color:var(--critical);font-size:12px;font-weight:800}.critical-event strong{display:block;color:var(--text);font-size:13px}.critical-event span{color:var(--text-secondary);font-size:12px}.event-badge{border:1px solid var(--border);border-radius:999px;background:#fff;padding:5px 8px!important;color:var(--text-secondary)!important;font-size:10px!important;font-weight:800;text-transform:uppercase}.event-badge.overdue,.event-badge.escalated{border-color:#FECACA;background:var(--critical-soft);color:#B91C1C!important}.event-badge.review{border-color:#FED7AA;background:var(--warning-soft);color:#B45309!important}.event-badge.assigned{border-color:#BFDBFE;background:var(--ai-soft);color:#1D4ED8!important}.queue-list{display:grid;gap:11px}.queue-row{display:grid;grid-template-columns:minmax(0,1fr) 96px;align-items:center;gap:12px;border:1px solid var(--border);border-radius:13px;background:#fff;padding:12px}.queue-row>span{font-size:12px;font-weight:800;color:var(--text)}.queue-row strong{display:block;text-align:right;font-size:18px;font-weight:800}.queue-row div i{display:block;height:5px;margin-top:5px;margin-left:auto;border-radius:999px;background:var(--ai-blue)}.queue-row.red div i{background:var(--critical)}.queue-row.amber div i{background:var(--warning)}.queue-row.green div i{background:var(--success)}.queue-row.slate div i{background:#94A3B8}
.toolbar{flex:0 0 auto;background:#fff;border-bottom:1px solid var(--border);padding:14px 28px}.toolbar>.tabs,.toolbar>.filter-row,.toolbar>.active-chips{max-width:1480px;margin-left:auto;margin-right:auto}.tabs{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;margin-bottom:11px}.tabs::-webkit-scrollbar{display:none}.tab{min-height:36px;border:0;background:transparent;color:var(--text-secondary);padding:7px 11px;border-radius:9px;display:flex;align-items:center;gap:7px;white-space:nowrap;font-weight:700;font-size:12px}.tab:hover{background:var(--surface-muted);color:var(--text)}.tab.active{background:var(--ai-soft);color:var(--primary)}.tab-count{min-width:20px;height:20px;border-radius:999px;display:grid;place-items:center;padding:0 6px;font-size:10px;background:#E2E8F0;color:var(--text-secondary)}.tab.active .tab-count{background:#DBEAFE;color:var(--primary)}.filter-row{display:flex;align-items:center;gap:8px}.search-box{flex:1;min-width:210px;height:40px;border:1px solid var(--border);border-radius:10px;display:flex;align-items:center;gap:8px;padding:0 12px;background:var(--surface-muted)}.search-box input{border:0;outline:0;background:transparent;width:100%;color:var(--text);font-size:13px}.select-wrap{position:relative}.select-wrap select{appearance:none;min-width:124px;height:40px;border:1px solid var(--border);border-radius:10px;background:#fff;color:var(--text);padding:0 34px 0 11px;font-size:12px;font-weight:600;outline:0}.select-wrap svg{position:absolute;right:10px;top:12px;pointer-events:none;color:var(--text-muted)}.active-chips{display:flex;align-items:center;gap:7px;margin-top:10px;flex-wrap:wrap;min-height:0}.chip{background:var(--ai-soft);border:1px solid #CFE0FA;color:var(--primary);padding:5px 8px;border-radius:8px;display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700}
.workspace{flex:0 0 auto;width:calc(100% - 56px);max-width:1480px;height:720px;min-height:620px;margin:0 auto 24px;display:grid;grid-template-columns:minmax(520px,1fr) var(--detail);gap:0;overflow:hidden;border-right:1px solid var(--border);border-left:1px solid var(--border)}.feed-panel{min-width:0;background:#fff;display:flex;flex-direction:column;border-right:1px solid var(--border)}.feed-head{height:49px;flex:0 0 49px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;padding:0 18px;font-size:12px;color:var(--text-secondary)}.check{width:18px;height:18px;accent-color:var(--primary)}.feed-head strong{color:var(--text)}.sort{margin-left:auto;display:flex;align-items:center;gap:6px}.feed-list{flex:1;min-height:0;overflow-y:auto;background:var(--bg)}.notification-item{display:grid;grid-template-columns:22px 8px minmax(0,1fr) auto;gap:12px;padding:18px 20px;border-bottom:1px solid var(--border);background:#fff;cursor:pointer;transition:.16s ease;position:relative}.notification-item:hover{background:#F8FAFF}.notification-item.selected{background:var(--ai-soft);box-shadow:inset 3px 0 0 var(--ai-blue)}.notification-item.unread .n-title{font-weight:800}.notification-item.unread::after{content:"";width:7px;height:7px;border-radius:50%;background:var(--ai-blue);position:absolute;right:12px;top:12px}.sev-line{width:5px;border-radius:999px;align-self:stretch;min-height:70px;background:#94A3B8}.sev-line.critical{background:var(--critical)}.sev-line.high{background:var(--warning)}.sev-line.medium{background:var(--ai-blue)}.sev-line.low{background:var(--success)}.sev-line.info{background:#64748B}.n-main{min-width:0}.n-top{display:flex;align-items:center;flex-wrap:wrap;gap:7px}.badge{display:inline-flex;align-items:center;gap:5px;min-height:24px;padding:3px 8px;border-radius:999px;border:1px solid var(--border);font-size:10px;line-height:1;font-weight:800;white-space:nowrap}.badge.critical{color:#B91C1C;background:var(--critical-soft);border-color:#FECACA}.badge.high{color:#B45309;background:var(--warning-soft);border-color:#FED7AA}.badge.medium{color:#1D4ED8;background:var(--ai-soft);border-color:#BFDBFE}.badge.low{color:#047857;background:var(--success-soft);border-color:#A7F3D0}.badge.info{color:#475569;background:#F8FAFC;border-color:#CBD5E1}.badge.status{color:#475569;background:#fff}.badge.escalated{color:#6D28D9;background:var(--purple-soft);border-color:#DDD6FE}.badge.ai{color:#1D4ED8;background:#EEF4FF;border-color:#C7D7FE}.badge.action{color:#B91C1C;background:#fff;border-color:#FCA5A5}.n-title{font-size:15px;line-height:1.35;margin:7px 0 3px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.n-desc{color:var(--text-secondary);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.entity-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;color:var(--text-secondary);font-size:11px}.entity-link{color:var(--primary);font-weight:700}.n-side{display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;gap:12px;min-width:120px}.time{font-size:11px;color:var(--text-muted)}.sla{font-size:10px;font-weight:800;display:flex;align-items:center;gap:5px}.sla.overdue{color:var(--critical)}.sla.due{color:var(--warning)}.sla.track{color:var(--success)}.assignee{display:flex;align-items:center;gap:6px;color:var(--text-secondary);font-size:11px}.mini-avatar{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#E2E8F0;color:#334155;font-size:9px;font-weight:800}
.detail-panel{min-width:0;background:#fff;display:flex;flex-direction:column;position:relative}.detail-head{flex:0 0 auto;padding:20px;border-bottom:1px solid var(--border);background:linear-gradient(180deg,#fff,#FBFCFE)}.detail-topline{display:flex;align-items:flex-start;gap:12px}.detail-icon{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;background:var(--critical-soft);color:var(--critical);flex:0 0 auto}.detail-title{min-width:0;flex:1}.detail-title h2{font-size:20px;line-height:1.35;margin:0 0 5px;letter-spacing:-.02em;font-weight:800}.detail-id{color:var(--text-muted);font-size:10px}.close-detail{display:none}.detail-badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}.detail-body{flex:1;min-height:0;overflow-y:auto;padding:20px 20px 96px}.section{margin-bottom:20px}.section-title{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#334155;margin-bottom:10px}.message-box{padding:13px;border:1px solid var(--border);border-radius:14px;background:var(--surface-muted);color:#334155;font-size:12px}.reason-box{padding:13px;border:1px solid #BFDBFE;border-radius:14px;background:var(--ai-soft);color:#1E3A8A;font-size:12px}.label{display:block;color:var(--text-muted);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px}.kv-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.kv{border:1px solid var(--border);border-radius:10px;padding:10px;min-width:0;background:#fff}.kv strong{display:block;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kv span:last-child{font-size:10px;color:var(--text-muted)}.text-blue{color:var(--primary)}.text-red{color:var(--critical)}.score-row{display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--border);border-radius:14px}.score{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto;background:conic-gradient(var(--warning) 0 72%,#E2E8F0 72% 100%);position:relative}.score::after{content:"";position:absolute;inset:5px;border-radius:50%;background:#fff}.score span{position:relative;z-index:1;font-size:13px;font-weight:800}.score-title{font-size:13px}.score-copy{font-size:11px;color:var(--text-secondary);margin-top:3px}.score-sla{margin-top:7px}.timeline{position:relative;padding-left:20px}.timeline::before{content:"";position:absolute;left:6px;top:7px;bottom:8px;width:1px;background:var(--border-strong)}.tl-item{position:relative;margin-bottom:14px}.tl-item::before{content:"";position:absolute;left:-18px;top:5px;width:9px;height:9px;border-radius:50%;background:#fff;border:2px solid var(--ai-blue)}.tl-item strong{display:block;font-size:11px}.tl-item span{font-size:10px;color:var(--text-muted)}.detail-actions{position:absolute;left:0;right:0;bottom:0;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 20px;border-top:1px solid var(--border);background:rgba(255,255,255,.94);backdrop-filter:blur(8px)}.detail-actions .btn-primary{grid-column:span 2}
.dialog-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.42);z-index:80;display:none;align-items:center;justify-content:center;padding:20px}.dialog-backdrop.show{display:flex}.dialog{width:min(430px,100%);background:#fff;border-radius:18px;border:1px solid var(--border);box-shadow:0 24px 60px rgba(15,42,95,.16);padding:22px}.dialog-icon{width:46px;height:46px;border-radius:13px;display:grid;place-items:center;background:var(--warning-soft);color:var(--warning);margin-bottom:14px}.dialog h3{margin:0 0 6px;font-size:19px}.dialog p{margin:0;color:var(--text-secondary);font-size:13px}.dialog-thai{margin-top:8px!important}.dialog-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:20px}.toast{position:fixed;right:22px;bottom:22px;z-index:90;display:flex;align-items:center;gap:10px;background:#0F172A;color:#fff;border-radius:14px;padding:13px 15px;box-shadow:0 24px 60px rgba(15,42,95,.16);font-size:13px;font-weight:700;transform:translateY(18px);opacity:0;transition:.22s}.toast.show{transform:translateY(0);opacity:1}.toast .ok{color:#34D399}.empty-state{display:none;padding:70px 20px;text-align:center;color:var(--text-secondary)}.empty-state.show{display:block}.empty-icon{width:54px;height:54px;border-radius:16px;margin:0 auto 14px;display:grid;place-items:center;background:#fff;border:1px solid var(--border);color:var(--text-muted)}.empty-state h3{margin:0 0 5px;color:var(--text)}.empty-state p{margin:0;font-size:13px}.spin{animation:spin .7s linear}@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:1280px){.kpi-grid{grid-template-columns:repeat(3,minmax(150px,1fr))}.exec-kpi-grid{grid-template-columns:repeat(3,minmax(150px,1fr))}.distribution-grid{grid-template-columns:1fr}.operations-grid{grid-template-columns:1fr}.workspace{grid-template-columns:minmax(460px,1fr) 390px}.head-row{flex-direction:column}.head-meta{justify-content:flex-start}}
@media(max-width:1020px){.app-shell{grid-template-columns:1fr}.sidebar{position:fixed;left:0;top:0;transform:translateX(-100%);transition:.2s ease;width:268px}.sidebar.open{transform:translateX(0)}.mobile-menu{display:grid}.exec-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.donut-layout{grid-template-columns:1fr}.donut-legend{grid-template-columns:repeat(2,minmax(0,1fr))}.workspace{width:calc(100% - 48px);grid-template-columns:1fr}.detail-panel{position:fixed;inset:74px 0 0 auto;width:min(430px,100%);z-index:50;box-shadow:0 24px 60px rgba(15,42,95,.16);transform:translateX(110%);transition:.22s}.detail-panel.open{transform:translateX(0)}.close-detail{display:grid}.kpi-grid{grid-template-columns:repeat(2,minmax(140px,1fr))}}
@media(max-width:760px){.topbar{padding:0 14px}.global-search{display:none}.org-switcher{display:none}.page-head{padding:18px 16px}.analytics-section{padding:20px 16px}.analytics-head{flex-direction:column}.analytics-head h2{font-size:22px}.exec-kpi-grid{grid-template-columns:1fr;gap:12px}.trend-frame{height:260px}.donut-frame{height:240px}.bar-frame{height:280px}.critical-event{grid-template-columns:54px minmax(0,1fr);align-items:flex-start}.event-badge{grid-column:2;width:max-content}.queue-row{grid-template-columns:1fr 72px}.toolbar{padding:12px 16px}.filter-row{flex-wrap:wrap}.search-box{flex-basis:100%}.select-wrap{flex:1}.select-wrap select{width:100%;min-width:0}.kpi-grid{grid-template-columns:1fr}.workspace{width:calc(100% - 32px);height:680px;min-height:560px}.notification-item{grid-template-columns:20px 6px minmax(0,1fr);padding:14px 12px;gap:9px}.n-side{grid-column:3;align-items:flex-start;min-width:0;flex-direction:row;flex-wrap:wrap;justify-content:flex-start}.head-copy h1{font-size:26px}.detail-actions{position:static}.detail-body{padding-bottom:20px}.toast{left:14px;right:14px;bottom:14px}}
`;
