"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Flag,
  Home,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
  Wallet,
  X,
} from "lucide-react";

type BadgeTone = "green" | "amber" | "orange" | "red" | "blue" | "gray";
type KpiTone = "normal" | "watch" | "risk" | "critical";
type CostCategory = "Medication" | "Procedure" | "Consultation" | "Consumable";

type NavItem = {
  label: string;
  helper?: string;
  active?: boolean;
  group?: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

type ContextItem = {
  label: string;
  value: string;
  badge?: { label: string; tone: BadgeTone };
  helper?: string;
};

type KpiItem = {
  title: string;
  value: string;
  subtitle: string;
  helper: string;
  tone: KpiTone;
  compact?: boolean;
};

type BreakdownItem = {
  category: CostCategory;
  percent: string;
  width: string;
  amount: string;
  color: string;
};

type WaterfallItem = {
  label: string;
  value: string;
  height: number;
  tone: "base" | "up" | "down" | "end";
};

type CompareItem = {
  label: string;
  expectedLeft: string;
  expectedWidth: string;
  actualLeft: string;
  actualWidth: string;
  stat: string;
  note: string;
};

type OutlierItem = {
  item: string;
  category: CostCategory;
  currentCost: string;
  expectedCost: string;
  variance: string;
  reason: string;
  severity: string;
  severityTone: BadgeTone;
  action: string;
};

type MedicationItem = {
  medication: string;
  quantity: string;
  unit: string;
  unitCost: string;
  totalCost: string;
  batch: string;
  expiry: string;
  alert: string;
  alertTone: BadgeTone;
};

type RiskItem = {
  title: string;
  badge: string;
  tone: BadgeTone;
  detail: string;
  thai: string;
};

type AlertItem = {
  id: string;
  title: string;
  text: string;
  thai: string;
  critical?: boolean;
  actions: ("assign" | "review" | "evidence" | "resolve")[];
};

type EvidenceItem = {
  title: string;
  owner: string;
  note?: string;
  status: string;
  tone: BadgeTone;
};

type TimelineItem = {
  time: string;
  title: string;
  thai: string;
};

type AuditItem = {
  time: string;
  user: string;
  role: string;
  action: string;
  target: string;
  detail: string;
};

const navItems: NavItem[] = [
  { group: "Workspace", label: "Executive Dashboard", icon: Home },
  { label: "Patient & Visits", icon: Stethoscope },
  { label: "Claim Readiness", icon: CheckCircle2 },
  {
    label: "Economic Intelligence",
    helper: "วิเคราะห์ต้นทุนและความเสี่ยง",
    active: true,
    icon: Wallet,
  },
  { label: "Evidence Package", icon: ClipboardCheck },
  { group: "Governance", label: "Economic Alerts", icon: Flag },
  { label: "Audit & Compliance", icon: ShieldCheck },
  { label: "Settings", icon: Settings },
];

const contextItems: ContextItem[] = [
  { label: "HN", value: "HN-000245" },
  { label: "Patient", value: "Somchai Jaidee" },
  { label: "Visit No.", value: "VST-20260705-001" },
  { label: "Visit Date", value: "05 Jul 2026" },
  { label: "Payer", value: "AIA / Mock Insurance" },
  { label: "Claim Type", value: "OPD" },
  {
    label: "Visit Status",
    value: "Pending Evidence",
    badge: { label: "Pending Evidence", tone: "amber" },
    helper: "รอเอกสารเพิ่มเติมก่อนส่งเคลม",
  },
];

const kpis: KpiItem[] = [
  {
    title: "Total Visit Cost",
    value: "฿3,850",
    subtitle: "▲ 28.3% vs Benchmark Average",
    helper: "ต้นทุนรวมสูงกว่าค่าเฉลี่ยของกลุ่มเปรียบเทียบ",
    tone: "risk",
  },
  {
    title: "Expected Cost Range",
    value: "฿2,100-฿3,200",
    subtitle: "฿650 above upper range",
    helper: "ต้นทุนปัจจุบันอยู่นอกช่วงที่คาดการณ์ไว้",
    tone: "risk",
    compact: true,
  },
  {
    title: "Cost Variance",
    value: "+28.3%",
    subtitle: "฿850 above benchmark",
    helper: "ส่วนต่างระหว่างต้นทุนจริงและ Benchmark",
    tone: "risk",
  },
  {
    title: "Medication Cost",
    value: "฿1,650",
    subtitle: "▲ 50.0% vs Medication Benchmark",
    helper: "ค่ายาเป็นตัวขับเคลื่อนต้นทุนหลัก",
    tone: "critical",
  },
  {
    title: "Procedure Cost",
    value: "฿1,200",
    subtitle: "▲ 20.0% vs Expected",
    helper: "ค่าหัตถการสูงกว่าค่าเฉลี่ย",
    tone: "risk",
  },
  {
    title: "Claim Risk Level",
    value: "Medium",
    subtitle: "Needs Review",
    helper: "ควรตรวจสอบก่อนส่ง Claim",
    tone: "watch",
    compact: true,
  },
  {
    title: "Economic Alerts",
    value: "3",
    subtitle: "1 Critical · 2 Warning",
    helper: "รายการที่ต้องตรวจสอบเพิ่มเติม",
    tone: "risk",
  },
  {
    title: "AI Confidence",
    value: "87%",
    subtitle: "High Confidence",
    helper: "ระดับความมั่นใจของผลวิเคราะห์",
    tone: "normal",
  },
];

const breakdownItems: BreakdownItem[] = [
  { category: "Medication", percent: "42.9%", width: "100%", amount: "฿1,650", color: "#2563eb" },
  { category: "Procedure", percent: "31.2%", width: "73%", amount: "฿1,200", color: "#7c3aed" },
  { category: "Consultation", percent: "18.2%", width: "43%", amount: "฿700", color: "#38bdf8" },
  { category: "Consumable", percent: "7.7%", width: "18%", amount: "฿300", color: "#94a3b8" },
];

const waterfallItems: WaterfallItem[] = [
  { label: "Benchmark", value: "฿3,000", height: 150, tone: "base" },
  { label: "Medication", value: "+฿550", height: 72, tone: "up" },
  { label: "Procedure", value: "+฿200", height: 46, tone: "up" },
  { label: "Consultation", value: "+฿80", height: 28, tone: "up" },
  { label: "Consumable", value: "+฿20", height: 18, tone: "up" },
  { label: "Discount", value: "-฿0", height: 8, tone: "down" },
  { label: "Actual", value: "฿3,850", height: 192, tone: "end" },
];

const compareItems: CompareItem[] = [
  { label: "Medication", expectedLeft: "12%", expectedWidth: "42%", actualLeft: "54%", actualWidth: "34%", stat: "+50.0%", note: "Above expected" },
  { label: "Procedure", expectedLeft: "16%", expectedWidth: "40%", actualLeft: "47%", actualWidth: "25%", stat: "+20.0%", note: "Needs context" },
  { label: "Consultation", expectedLeft: "20%", expectedWidth: "36%", actualLeft: "44%", actualWidth: "18%", stat: "+16.7%", note: "Moderate" },
  { label: "Consumable", expectedLeft: "10%", expectedWidth: "28%", actualLeft: "36%", actualWidth: "16%", stat: "+42.9%", note: "Pattern check" },
];

const initialOutliers: OutlierItem[] = [
  {
    item: "Antibiotic A",
    category: "Medication",
    currentCost: "฿950",
    expectedCost: "฿400",
    variance: "+137%",
    reason: "High-cost drug",
    severity: "Critical",
    severityTone: "red",
    action: "Review",
  },
  {
    item: "Wound Dressing",
    category: "Procedure",
    currentCost: "฿850",
    expectedCost: "฿500",
    variance: "+70%",
    reason: "Above benchmark",
    severity: "High",
    severityTone: "orange",
    action: "Validate",
  },
  {
    item: "Repeated Supply",
    category: "Consumable",
    currentCost: "฿300",
    expectedCost: "฿120",
    variance: "+150%",
    reason: "Duplicate usage pattern",
    severity: "Medium",
    severityTone: "amber",
    action: "Check",
  },
];

const medications: MedicationItem[] = [
  {
    medication: "Antibiotic A",
    quantity: "10",
    unit: "tab",
    unitCost: "฿95",
    totalCost: "฿950",
    batch: "B-2026-01",
    expiry: "31 Jan 2027",
    alert: "High Cost",
    alertTone: "red",
  },
  {
    medication: "Paracetamol",
    quantity: "10",
    unit: "tab",
    unitCost: "฿2",
    totalCost: "฿20",
    batch: "B-2026-08",
    expiry: "31 Aug 2027",
    alert: "Normal",
    alertTone: "green",
  },
  {
    medication: "Wound Gel",
    quantity: "1",
    unit: "tube",
    unitCost: "฿680",
    totalCost: "฿680",
    batch: "B-2026-03",
    expiry: "15 Mar 2027",
    alert: "Review",
    alertTone: "amber",
  },
];

const riskItems: RiskItem[] = [
  {
    title: "Cost Above Benchmark",
    badge: "Warning",
    tone: "amber",
    detail: "Total Visit Cost exceeds the expected upper range.",
    thai: "ต้นทุนรวมสูงกว่าช่วงที่ระบบคาดการณ์ไว้",
  },
  {
    title: "High-cost Medication",
    badge: "Critical",
    tone: "red",
    detail: "Medication Cost is 50% above benchmark.",
    thai: "ค่ายาสูงกว่าค่าเฉลี่ยและเป็นปัจจัยเสี่ยงหลัก",
  },
  {
    title: "Missing Justification",
    badge: "Warning",
    tone: "amber",
    detail: "SOAP Note does not explain the high-cost antibiotic.",
    thai: "ยังไม่มีเหตุผลทางคลินิกที่เพียงพอ",
  },
  {
    title: "Payer Benefit Limit",
    badge: "Warning",
    tone: "amber",
    detail: "Medication cost may exceed the OPD benefit threshold.",
    thai: "ควรตรวจสอบวงเงินและเงื่อนไข Payer",
  },
  {
    title: "Duplicate Item Risk",
    badge: "Normal",
    tone: "green",
    detail: "No confirmed duplicate billing found.",
    thai: "ยังไม่พบรายการเรียกเก็บซ้ำที่ยืนยันแล้ว",
  },
];

const alerts: AlertItem[] = [
  {
    id: "high-cost-medication",
    title: "High-cost Medication Exceeds Cohort",
    text: "Antibiotic A is 137% above expected cost.",
    thai: "ควรตรวจสอบความจำเป็น ขนาดยา และความคุ้มครอง",
    critical: true,
    actions: ["assign", "review", "evidence"],
  },
  {
    id: "clinical-justification",
    title: "Clinical Justification Missing",
    text: "Evidence Package lacks sufficient justification.",
    thai: "กรุณาเพิ่ม Clinical Justification ก่อนส่ง Claim",
    actions: ["assign", "review"],
  },
  {
    id: "payer-benefit",
    title: "Potential Payer Benefit Limit",
    text: "Medication cost may exceed OPD threshold.",
    thai: "ควรตรวจสอบ Payer Rule และวงเงินคงเหลือ",
    actions: ["review", "resolve"],
  },
];

const evidenceItems: EvidenceItem[] = [
  { title: "SOAP Clinical Summary", owner: "Doctor", status: "Completed", tone: "green" },
  {
    title: "High-cost Drug Justification",
    owner: "Doctor",
    note: "ยังไม่มีคำอธิบายความจำเป็นทางการแพทย์",
    status: "Missing",
    tone: "red",
  },
  { title: "Procedure Note", owner: "Nurse", status: "Completed", tone: "green" },
  {
    title: "Payer Rule Validation",
    owner: "Claim Reviewer",
    note: "ควรตรวจสอบข้อจำกัดของแผนประกัน",
    status: "Warning",
    tone: "amber",
  },
  { title: "Medication Batch Record", owner: "Pharmacist", status: "Completed", tone: "green" },
];

const timelineItems: TimelineItem[] = [
  { time: "09:10", title: "Visit Created", thai: "เริ่มต้น Visit และสร้างบริบทสำหรับการวิเคราะห์ต้นทุน" },
  { time: "09:25", title: "SOAP Note Drafted", thai: "แพทย์เริ่มบันทึกข้อมูล Clinical Documentation" },
  { time: "09:45", title: "Prescription Created", thai: "สร้างใบสั่งยาและคำนวณต้นทุนยาเบื้องต้น" },
  { time: "10:00", title: "Medication Dispensed", thai: "เภสัชกรจ่ายยาตามใบสั่งยา" },
  { time: "10:05", title: "Stock Deducted", thai: "ระบบหัก Stock ตามจำนวนยาที่จ่ายจริงและบันทึก Stock Movement" },
  { time: "10:15", title: "Economic Analysis Generated", thai: "ระบบสร้างผลวิเคราะห์ต้นทุนและ Benchmark" },
  { time: "10:20", title: "High-cost Alert Created", thai: "สร้าง Alert สำหรับรายการยาต้นทุนสูง" },
];

const auditItems: AuditItem[] = [
  { time: "10:15", user: "Dr. A", role: "Doctor", action: "update", target: "soap_notes", detail: "Added clinical summary" },
  { time: "10:20", user: "Claim User", role: "Claim Reviewer", action: "review", target: "economic_alerts", detail: "Marked as needs review" },
  { time: "10:25", user: "Pharmacist B", role: "Pharmacist", action: "dispense", target: "stock_movements", detail: "Dispensed Antibiotic A" },
];

function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return <span className={`economic-badge ${tone}`}>{children}</span>;
}

function notifyMessage(category: string) {
  return `${category} selected · ไฮไลต์รายการต้นทุนที่เกี่ยวข้องแล้ว`;
}

export function EconomicIntelligencePage() {
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState("10:15");
  const [selectedCategory, setSelectedCategory] = useState<CostCategory | null>(null);
  const [reviewItem, setReviewItem] = useState<string | null>(null);
  const [resolvedAlerts, setResolvedAlerts] = useState<Set<string>>(new Set());
  const [sortState, setSortState] = useState<{ column: keyof OutlierItem; direction: "asc" | "desc" }>({
    column: "item",
    direction: "asc",
  });

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setReviewItem(null);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const sortedOutliers = useMemo(() => {
    return [...initialOutliers].sort((first, second) => {
      const firstValue = first[sortState.column];
      const secondValue = second[sortState.column];
      return firstValue.localeCompare(secondValue, undefined, { numeric: true }) * (sortState.direction === "asc" ? 1 : -1);
    });
  }, [sortState]);

  function notify(message: string) {
    setToast(message);
  }

  function refreshAnalysis() {
    setIsLoading(true);
    window.setTimeout(() => {
      const now = new Date();
      setLastAnalyzed(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
      setIsLoading(false);
      notify("Analysis refreshed successfully · ระบบคำนวณข้อมูลต้นทุนล่าสุดเรียบร้อยแล้ว");
    }, 900);
  }

  function highlightCategory(category: CostCategory) {
    setSelectedCategory(category);
    notify(notifyMessage(category));
  }

  function sortOutliers(column: keyof OutlierItem) {
    setSortState((current) => ({
      column,
      direction: current.column === column && current.direction === "asc" ? "desc" : "asc",
    }));
    notify("Table sorted · จัดเรียงข้อมูลเรียบร้อยแล้ว");
  }

  function resolveAlert(alertId: string) {
    setResolvedAlerts((current) => {
      const next = new Set(current);
      next.add(alertId);
      return next;
    });
    notify("Alert resolved successfully · ปิดรายการแจ้งเตือนเรียบร้อยแล้ว");
  }

  return (
    <>
      <style>{`
        :root {
          --primary:#1E3A8A;--deep:#0F2A5F;--ai:#2563EB;--soft:#EFF6FF;--accent:#38BDF8;
          --bg:#F8FAFC;--surface:#FFFFFF;--border:#E2E8F0;--text:#0F172A;--muted:#64748B;
          --success:#059669;--warning:#D97706;--high:#EA580C;--critical:#DC2626;--purple:#7C3AED;
          --shadow:0 10px 26px rgba(15,42,95,.07);
        }
        *{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{margin:0;background:var(--bg);color:var(--text);font-size:14px}
        button,input,select,textarea{font:inherit}
        button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid rgba(37,99,235,.24);outline-offset:2px}
        .economic-app{display:grid;grid-template-columns:248px minmax(0,1fr);min-height:100vh;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .economic-sidebar{position:sticky;top:0;height:100vh;background:linear-gradient(180deg,#0b1f46,#0F2A5F 55%,#12366f);color:#dce8ff;padding:22px 16px;overflow:auto}
        .economic-brand{display:flex;gap:11px;align-items:center;padding:0 8px 24px}
        .economic-brand-mark{width:40px;height:40px;border-radius:13px;background:linear-gradient(135deg,#60a5fa,#2563eb);display:grid;place-items:center;font-weight:900;color:#fff;box-shadow:0 10px 24px #071a3a}
        .economic-brand strong{display:block;color:#fff;font-size:15px}.economic-brand span{font-size:11px;color:#9fb7dc}
        .economic-nav-label{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#829bc1;padding:14px 12px 7px}
        .economic-nav-item{display:flex;align-items:center;gap:11px;padding:11px 12px;border-radius:10px;color:#bfd0eb;text-decoration:none;margin:3px 0;border:1px solid transparent}
        .economic-nav-item small{display:block;font-size:10px;color:#89a2c7;margin-top:2px}
        .economic-nav-item.active{background:rgba(96,165,250,.17);color:#fff;border-color:rgba(147,197,253,.22)}
        .economic-nav-item.active small{color:#cfe0fb}.economic-nav-item:hover{background:rgba(255,255,255,.07)}
        .economic-nav-icon{width:20px;display:grid;place-items:center}
        .economic-main{min-width:0}
        .economic-topbar{height:68px;background:rgba(255,255,255,.96);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 26px;position:sticky;top:0;z-index:20;backdrop-filter:blur(10px)}
        .economic-search{width:min(460px,46vw);display:flex;align-items:center;gap:9px;background:#f8fafc;border:1px solid var(--border);border-radius:10px;padding:10px 12px;color:var(--muted)}
        .economic-top-actions{display:flex;gap:9px;align-items:center}.economic-icon-btn{border:1px solid var(--border);background:#fff;border-radius:10px;padding:9px 11px;color:#475569;cursor:pointer}
        .economic-avatar{width:36px;height:36px;border-radius:50%;background:#dbeafe;color:var(--primary);display:grid;place-items:center;font-weight:800}
        .economic-content{padding:24px 28px 48px;max-width:1800px;margin:auto}
        .economic-page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:16px}
        .economic-page-header h1{font-size:28px;line-height:1.2;margin:0 0 7px;font-weight:800}
        .economic-page-header .subtitle{margin:0;color:#334155}
        .thai-helper{margin-top:5px;color:var(--muted);font-size:12px;line-height:1.55}
        .economic-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
        .economic-btn{border:1px solid var(--border);background:#fff;color:#334155;padding:9px 12px;border-radius:9px;cursor:pointer;font-weight:700;transition:.2s}
        .economic-btn:hover{transform:translateY(-1px);box-shadow:0 5px 14px rgba(15,23,42,.08)}
        .economic-btn.primary{background:var(--primary);border-color:var(--primary);color:#fff}
        .economic-btn.danger{background:#fff5f5;border-color:#fecaca;color:#b91c1c}
        .economic-decision-banner{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;margin-bottom:16px}
        .economic-decision-banner strong{display:block;font-size:12px;color:#92400e}.economic-decision-banner p{margin:3px 0 0;color:#92400e;font-size:11.5px}
        .economic-context{display:grid;grid-template-columns:repeat(7,minmax(118px,1fr));background:#fff;border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow);overflow:hidden;margin-bottom:16px}
        .economic-context-item{padding:13px 15px;border-right:1px solid var(--border)}
        .economic-context-item:last-child{border:0}.economic-label{font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.055em}
        .economic-value{font-weight:760;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .economic-value .mini-thai{display:block;font-size:10px;color:var(--muted);margin-top:4px;font-weight:500;white-space:normal}
        .economic-badge{display:inline-flex;align-items:center;border-radius:999px;padding:4px 8px;font-size:10.5px;font-weight:850;white-space:nowrap}
        .economic-badge.green{background:#d1fae5;color:#047857}.economic-badge.amber{background:#fef3c7;color:#b45309}.economic-badge.orange{background:#ffedd5;color:#c2410c}.economic-badge.red{background:#fee2e2;color:#b91c1c}.economic-badge.blue{background:#dbeafe;color:#1d4ed8}.economic-badge.gray{background:#e2e8f0;color:#475569}
        .economic-filters-card{background:#fff;border:1px solid var(--border);border-radius:13px;padding:12px 14px;box-shadow:var(--shadow);margin-bottom:16px}
        .economic-filters{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
        .economic-select{background:#fff;border:1px solid var(--border);border-radius:9px;padding:9px 32px 9px 11px;color:#334155}
        .economic-filter-note{margin-left:auto;color:var(--muted);font-size:11.5px}
        .economic-kpis{display:grid;grid-template-columns:repeat(8,minmax(128px,1fr));gap:12px;margin-bottom:16px}
        .economic-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow)}
        .economic-kpi{padding:15px;min-height:148px;position:relative;overflow:hidden}
        .economic-kpi:before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:#94a3b8}
        .economic-kpi.normal:before{background:var(--success)}.economic-kpi.watch:before{background:var(--warning)}.economic-kpi.risk:before{background:var(--high)}.economic-kpi.critical:before{background:var(--critical)}
        .economic-kpi-title{font-size:11.5px;color:var(--muted);font-weight:760}.economic-kpi-value{font-size:24px;font-weight:880;letter-spacing:-.04em;margin:12px 0 7px}
        .economic-kpi-sub{font-size:11px;color:var(--muted);line-height:1.45}.economic-kpi .thai-helper{font-size:10.5px;line-height:1.4}
        .trend-up{color:var(--critical);font-weight:800}.trend-good{color:var(--success);font-weight:800}
        .economic-grid-main{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(360px,.85fr);gap:16px}
        .economic-left,.economic-right{display:grid;gap:16px;align-content:start}
        .economic-section{padding:18px}
        .economic-section-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px}
        .economic-section h2{font-size:15px;margin:0 0 4px;font-weight:800}.economic-section p{margin:0;color:var(--muted);font-size:11.8px}
        .economic-legend{display:flex;gap:12px;flex-wrap:wrap;color:var(--muted);font-size:10.5px}
        .economic-dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:5px}
        .economic-chart-pair{display:grid;grid-template-columns:1fr 1.35fr;gap:18px;align-items:center}
        .economic-donut-wrap{display:flex;align-items:center;justify-content:center}
        .economic-donut{width:196px;height:196px;border-radius:50%;background:conic-gradient(#2563eb 0 42.9%,#7c3aed 42.9% 74.1%,#38bdf8 74.1% 92.3%,#94a3b8 92.3% 100%);position:relative;cursor:pointer;border:0}
        .economic-donut:after{content:"";position:absolute;inset:39px;border-radius:50%;background:#fff}
        .economic-donut-center{position:absolute;z-index:2;inset:0;display:grid;place-content:center;text-align:center;pointer-events:none}
        .economic-donut-center strong{font-size:25px}.economic-donut-center span{font-size:10.5px;color:var(--muted)}
        .economic-breakdown-list{display:grid;gap:12px}.economic-break-row{display:grid;grid-template-columns:112px 1fr 74px;gap:10px;align-items:center;padding:6px;border-radius:8px;cursor:pointer;border:0;background:transparent;text-align:left;color:inherit}
        .economic-break-row:hover,.economic-break-row.active{background:#eff6ff}
        .economic-bar-track{height:9px;background:#edf2f7;border-radius:999px;overflow:hidden}.economic-bar-fill{height:100%;border-radius:999px}.economic-money{text-align:right;font-weight:760}
        .economic-waterfall{height:230px;display:flex;align-items:flex-end;gap:12px;padding:18px 8px 30px;border-bottom:1px solid var(--border);position:relative}
        .economic-wf-item{flex:1;text-align:center;position:relative}.economic-wf-bar{border-radius:6px 6px 2px 2px;min-height:8px;position:relative}
        .economic-wf-val{position:absolute;top:-20px;width:100%;font-size:10.5px;font-weight:800}.economic-wf-label{position:absolute;top:calc(100% + 8px);width:100%;font-size:9.5px;color:var(--muted)}
        .wf-base{background:var(--primary)}.wf-up{background:var(--critical)}.wf-down{background:var(--success)}.wf-end{background:var(--high)}
        .economic-compare-chart{display:grid;gap:13px}.economic-compare-row{display:grid;grid-template-columns:126px 1fr 94px;gap:10px;align-items:center}
        .economic-dual{height:18px;position:relative;background:#eef2f7;border-radius:5px;overflow:hidden}.economic-expected{position:absolute;top:3px;bottom:3px;background:#bfdbfe;border:1px solid #60a5fa;border-radius:3px}
        .economic-actual{position:absolute;top:6px;height:6px;background:var(--high);border-radius:5px}.economic-compare-stat{text-align:right;font-size:10.5px}.economic-compare-stat strong{display:block;font-size:12px}
        .economic-table{width:100%;border-collapse:collapse}.economic-table th{text-align:left;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.045em;padding:10px 9px;border-bottom:1px solid var(--border);white-space:nowrap}
        .economic-table th button{border:0;background:transparent;color:inherit;font:inherit;text-transform:inherit;letter-spacing:inherit;cursor:pointer;padding:0}
        .economic-table td{padding:11px 9px;border-bottom:1px solid #edf1f6;font-size:11.5px;vertical-align:middle}.economic-table tbody tr:hover{background:#f8fafc}.economic-table-wrap{overflow:auto}
        .economic-table-action{border:0;background:#eff6ff;color:#1d4ed8;padding:6px 8px;border-radius:7px;font-weight:760;cursor:pointer}
        .economic-ai-panel{background:linear-gradient(145deg,#fff,#f7f9ff);border-color:#bfdbfe;position:relative}.economic-ai-panel:before{content:"AI";position:absolute;right:16px;top:14px;background:#dbeafe;color:#1d4ed8;border-radius:8px;padding:5px 7px;font-size:9.5px;font-weight:900}
        .economic-ai-lead{font-size:12.5px;line-height:1.65;color:#334155;margin:8px 0 13px}.economic-recommend{background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px}
        .economic-recommend ol{padding-left:18px;margin:8px 0 0;line-height:1.55}.economic-thai-summary{margin-top:12px;padding-top:12px;border-top:1px dashed #bfdbfe;color:#475569;font-size:11.5px;line-height:1.6}
        .economic-meta-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.economic-meta-pill{background:#f8fafc;border:1px solid var(--border);border-radius:999px;padding:5px 8px;font-size:10px;color:#475569}
        .economic-gauge{width:180px;height:95px;margin:4px auto 12px;overflow:hidden;position:relative}.economic-gauge-bg{width:180px;height:180px;border-radius:50%;background:conic-gradient(from 270deg,#10b981 0 25%,#f59e0b 25% 50%,#f97316 50% 75%,#ef4444 75% 100%);position:absolute}
        .economic-gauge-mask{position:absolute;left:25px;top:25px;width:130px;height:130px;border-radius:50%;background:#fff}.economic-gauge-bottom{position:absolute;left:0;right:0;top:90px;height:100px;background:#fff}
        .economic-gauge-value{position:absolute;z-index:2;left:0;right:0;top:49px;text-align:center;font-size:28px;font-weight:900}.economic-gauge-value small{font-size:10.5px;color:var(--muted)}
        .economic-risk-list{display:grid;gap:9px}.economic-risk-row{display:grid;grid-template-columns:1fr auto;gap:7px;padding:10px;border:1px solid var(--border);border-radius:9px}.economic-risk-row span:first-child{font-weight:760}.economic-risk-row small{grid-column:1/-1;color:var(--muted)}
        .economic-alert{display:grid;grid-template-columns:auto 1fr;gap:10px;border:1px solid var(--border);border-left:4px solid var(--warning);padding:11px;border-radius:9px;margin-top:9px;transition:.2s}
        .economic-alert.critical{border-left-color:var(--critical)}.economic-alert.resolved{opacity:.45;pointer-events:none}.economic-alert strong{display:block;font-size:11.5px}.economic-alert p{font-size:11px;margin-top:3px}.economic-alert-actions{grid-column:2;display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}
        .economic-alert-actions button{border:0;background:#f1f5f9;padding:5px 7px;border-radius:6px;font-size:10px;cursor:pointer}
        .economic-evidence-item{display:grid;grid-template-columns:1fr auto;gap:7px;padding:10px 0;border-bottom:1px solid #edf1f6}.economic-evidence-item:last-child{border:0}.economic-evidence-item small{color:var(--muted)}
        .economic-timeline{position:relative;padding-left:19px}.economic-timeline:before{content:"";position:absolute;left:5px;top:7px;bottom:7px;width:2px;background:#dbeafe}
        .economic-time-item{position:relative;display:grid;grid-template-columns:55px 1fr;gap:10px;padding:7px 0;cursor:pointer;border:0;background:transparent;text-align:left;width:100%;color:inherit}.economic-time-item:before{content:"";position:absolute;left:-18px;top:12px;width:9px;height:9px;background:var(--ai);border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 1px #93c5fd}
        .economic-time-item:hover strong{color:var(--primary)}.economic-time-item time{color:var(--muted);font-size:10.5px}.economic-time-item strong{font-size:11.5px}
        .economic-bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}
        .economic-modal{position:fixed;inset:0;background:rgba(15,23,42,.52);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
        .economic-modal-card{background:#fff;border-radius:16px;max-width:660px;width:100%;box-shadow:0 25px 70px rgba(0,0,0,.25);padding:20px}.economic-modal-head{display:flex;justify-content:space-between}.economic-close{border:0;background:#eef2f7;width:30px;height:30px;border-radius:8px;cursor:pointer;display:grid;place-items:center}
        .economic-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.economic-field label{display:block;font-weight:760;margin-bottom:6px}.economic-field select,.economic-field textarea{width:100%;border:1px solid var(--border);border-radius:9px;padding:9px}.economic-field textarea{min-height:110px;resize:vertical}
        .economic-toast{position:fixed;right:22px;bottom:22px;background:#0f172a;color:#fff;padding:12px 16px;border-radius:10px;opacity:0;transform:translateY(12px);transition:.25s;z-index:200;max-width:360px}.economic-toast.show{opacity:1;transform:translateY(0)}
        .economic-loading-overlay{position:fixed;inset:0;background:rgba(248,250,252,.76);z-index:90;display:flex;align-items:center;justify-content:center}.economic-loading-card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:20px 24px;box-shadow:var(--shadow);text-align:center}.economic-spinner{width:32px;height:32px;border:4px solid #dbeafe;border-top-color:var(--ai);border-radius:50%;margin:0 auto 12px;animation:economic-spin .8s linear infinite}
        @keyframes economic-spin{to{transform:rotate(360deg)}}
        .economic-highlight-row{background:#eff6ff!important}
        @media(max-width:1450px){.economic-kpis{grid-template-columns:repeat(4,1fr)}.economic-context{grid-template-columns:repeat(4,1fr)}.economic-context-item{border-bottom:1px solid var(--border)}}
        @media(max-width:1100px){.economic-app{grid-template-columns:78px 1fr}.economic-sidebar{padding:18px 10px}.economic-brand div:last-child,.economic-nav-label,.economic-nav-item div{display:none}.economic-brand{padding:0 8px 18px}.economic-nav-item{justify-content:center}.economic-grid-main{grid-template-columns:1fr}.economic-context{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:760px){.economic-app{display:block;overflow-x:hidden}.economic-sidebar{display:none}.economic-topbar{padding:0 14px;gap:8px;overflow:hidden}.economic-top-actions{gap:6px;min-width:0}.economic-icon-btn{padding:8px 9px}.economic-avatar{width:32px;height:32px}.economic-content{padding:18px 14px;max-width:100vw;overflow-x:hidden}.economic-page-header{display:block;min-width:0}.economic-page-header .subtitle{max-width:100%}.economic-actions{display:grid;grid-template-columns:1fr;justify-content:stretch;margin-top:14px}.economic-actions .economic-btn{width:100%;padding:9px 10px;font-size:12px;white-space:normal}.economic-context{grid-template-columns:1fr 1fr;min-width:0}.economic-kpis{grid-template-columns:1fr 1fr}.economic-chart-pair,.economic-bottom-grid,.economic-form-grid{grid-template-columns:1fr}.economic-filters-card{min-width:0}.economic-filters label{flex:1 1 100%;min-width:0}.economic-select{width:100%}.economic-filter-note{width:100%;margin-left:0}.economic-search{width:auto;flex:1;min-width:0}.economic-search span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.economic-waterfall{gap:5px}.economic-wf-label{font-size:8px}.economic-page-header h1{font-size:24px}}
      `}</style>

      <div className="economic-app">
        <aside className="economic-sidebar" aria-label="Primary navigation">
          <div className="economic-brand">
            <div className="economic-brand-mark">N</div>
            <div>
              <strong>Med AI NexSure</strong>
              <span>Enterprise Healthcare Intelligence</span>
            </div>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label}>
                {item.group ? <div className="economic-nav-label">{item.group}</div> : null}
                <a className={`economic-nav-item${item.active ? " active" : ""}`} href="#">
                  <span className="economic-nav-icon">
                    <Icon size={18} strokeWidth={2.2} />
                  </span>
                  <div>
                    <span>{item.label}</span>
                    {item.helper ? <small>{item.helper}</small> : null}
                  </div>
                </a>
              </div>
            );
          })}
        </aside>

        <main className="economic-main">
          <header className="economic-topbar">
            <div className="economic-search" role="search">
              <Search size={16} />
              <span>Search patient, visit, claim, or alert...</span>
            </div>
            <div className="economic-top-actions">
              <button className="economic-icon-btn" type="button" onClick={() => notify("AI Copilot opened · เปิดผู้ช่วยวิเคราะห์แล้ว")}>
                AI Copilot
              </button>
              <button className="economic-icon-btn" type="button" aria-label="Notifications" onClick={() => notify("3 unread notifications · มี 3 การแจ้งเตือนใหม่")}>
                <Bell size={16} />
              </button>
              <div className="economic-avatar" aria-label="User profile">CJ</div>
            </div>
          </header>

          <div className="economic-content">
            <div className="economic-page-header">
              <div>
                <h1>Economic Dashboard Detail</h1>
                <p className="subtitle">Analyze visit cost, medication usage, benchmark variance, and claim economic risk.</p>
                <div className="thai-helper">ตรวจสอบต้นทุนของ Visit เทียบกับ Benchmark พร้อมระบุรายการผิดปกติและความเสี่ยงก่อนส่ง Claim</div>
              </div>
              <div className="economic-actions">
                <button className="economic-btn" type="button" onClick={() => notify("Report exported successfully · ระบบจัดเตรียม Economic Summary เรียบร้อยแล้ว")}>Export Report</button>
                <button className="economic-btn" type="button" onClick={() => notify("Opening Evidence Package · กำลังเปิดชุดหลักฐานประกอบ Claim")}>View Evidence Package</button>
                <button className="economic-btn" type="button" onClick={() => notify("Opening Claim Readiness · กำลังเปิดหน้าความพร้อมเคลม")}>View Claim Readiness</button>
                <button className="economic-btn" type="button" onClick={() => notify("Opening Complete Audit Trail · แสดงประวัติการดำเนินการทั้งหมด")}>Audit Trail</button>
                <button className="economic-btn primary" type="button" onClick={refreshAnalysis}>Refresh Analysis</button>
              </div>
            </div>

            <div className="economic-decision-banner">
              <TriangleAlert size={18} />
              <div>
                <strong>Decision Support Only</strong>
                <p>ข้อมูลจากระบบเป็นเครื่องมือสนับสนุนการตัดสินใจ ผู้มีอำนาจต้องตรวจสอบข้อมูลและหลักฐานก่อนดำเนินการทุกครั้ง</p>
              </div>
            </div>

            <section className="economic-context" aria-label="Patient and visit context">
              {contextItems.map((item) => (
                <div className="economic-context-item" key={item.label}>
                  <div className="economic-label">{item.label}</div>
                  <div className="economic-value">
                    {item.badge ? <Badge tone={item.badge.tone}>{item.badge.label}</Badge> : item.value}
                    {item.helper ? <span className="mini-thai">{item.helper}</span> : null}
                  </div>
                </div>
              ))}
            </section>

            <section className="economic-filters-card" aria-label="Benchmark filters">
              <div className="economic-filters">
                {["Diagnosis: S91.3", "Visit Type: OPD", "Payer: AIA", "Claim Type: Medical Expense", "Period: Last 12 Months"].map((label) => (
                  <label key={label}>
                    <span className="sr-only">{label}</span>
                    <select className="economic-select" onChange={() => notify("Benchmark updated · ระบบปรับกลุ่มเปรียบเทียบตาม Filter แล้ว")} defaultValue={label}>
                      <option>{label}</option>
                      <option>{label.includes("Diagnosis") ? "Diagnosis: Similar Group" : label.replace(/^[^:]+: /, "All ")}</option>
                    </select>
                  </label>
                ))}
                <span className="economic-filter-note">
                  Benchmark Cohort: 1,284 comparable visits · Last analyzed: {lastAnalyzed}
                  <br />
                  เปรียบเทียบตาม Diagnosis, Payer และ Visit Type
                </span>
              </div>
            </section>

            <section className="economic-kpis" aria-label="Economic KPI summary">
              {kpis.map((kpi) => (
                <div className={`economic-card economic-kpi ${kpi.tone}`} key={kpi.title}>
                  <div className="economic-kpi-title">{kpi.title}</div>
                  <div className="economic-kpi-value" style={kpi.compact ? { fontSize: kpi.title === "Expected Cost Range" ? 20 : 22 } : undefined}>{kpi.value}</div>
                  <div className="economic-kpi-sub">
                    <span className={kpi.subtitle.startsWith("▲") ? "trend-up" : undefined}>{kpi.subtitle}</span>
                  </div>
                  <div className="thai-helper">{kpi.helper}</div>
                </div>
              ))}
            </section>

            <div className="economic-grid-main">
              <div className="economic-left">
                <section className="economic-card economic-section">
                  <div className="economic-section-head">
                    <div>
                      <h2>Cost Breakdown</h2>
                      <p>Contribution of each category to Total Visit Cost.</p>
                      <div className="thai-helper">แสดงสัดส่วนต้นทุนเพื่อระบุหมวดค่าใช้จ่ายหลักของ Visit</div>
                    </div>
                    <div className="economic-legend">
                      <span><i className="economic-dot" style={{ background: "#2563eb" }} />Medication</span>
                      <span><i className="economic-dot" style={{ background: "#7c3aed" }} />Procedure</span>
                    </div>
                  </div>
                  <div className="economic-chart-pair">
                    <div className="economic-donut-wrap">
                      <button className="economic-donut" type="button" onClick={() => highlightCategory("Medication")} aria-label="Cost breakdown donut chart">
                        <span className="economic-donut-center"><strong>฿3,850</strong><span>Total Visit Cost</span></span>
                      </button>
                    </div>
                    <div className="economic-breakdown-list">
                      {breakdownItems.map((item) => (
                        <button className={`economic-break-row${selectedCategory === item.category ? " active" : ""}`} type="button" key={item.category} onClick={() => highlightCategory(item.category)}>
                          <span>{item.category} <small>{item.percent}</small></span>
                          <span className="economic-bar-track"><span className="economic-bar-fill" style={{ width: item.width, background: item.color }} /></span>
                          <span className="economic-money">{item.amount}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="economic-card economic-section">
                  <div className="economic-section-head">
                    <div>
                      <h2>Benchmark Variance Bridge</h2>
                      <p>How the visit moved from Benchmark Average to Actual Cost.</p>
                      <div className="thai-helper">แสดงปัจจัยที่ทำให้ต้นทุนเพิ่มขึ้นหรือลดลงจากค่า Benchmark</div>
                    </div>
                    <Badge tone="orange">Total Variance +฿850</Badge>
                  </div>
                  <div className="economic-waterfall" aria-label="Benchmark variance waterfall">
                    {waterfallItems.map((item) => (
                      <div className="economic-wf-item" key={item.label}>
                        <div className={`economic-wf-bar wf-${item.tone}`} style={{ height: item.height }}>
                          <div className="economic-wf-val">{item.value}</div>
                        </div>
                        <div className="economic-wf-label">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="economic-card economic-section">
                  <div className="economic-section-head">
                    <div>
                      <h2>Expected vs Actual Cost</h2>
                      <p>Category-level comparison against expected economic bands.</p>
                      <div className="thai-helper">เปรียบเทียบช่วงต้นทุนที่คาดการณ์กับต้นทุนจริงในแต่ละหมวด</div>
                    </div>
                    <div className="economic-legend">
                      <span><i className="economic-dot" style={{ background: "#bfdbfe" }} />Expected</span>
                      <span><i className="economic-dot" style={{ background: "#ea580c" }} />Actual</span>
                    </div>
                  </div>
                  <div className="economic-compare-chart">
                    {compareItems.map((item) => (
                      <div className="economic-compare-row" key={item.label}>
                        <span>{item.label}</span>
                        <div className="economic-dual">
                          <span className="economic-expected" style={{ left: item.expectedLeft, width: item.expectedWidth }} />
                          <span className="economic-actual" style={{ left: item.actualLeft, width: item.actualWidth }} />
                        </div>
                        <span className="economic-compare-stat"><strong>{item.stat}</strong>{item.note}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="economic-card economic-section">
                  <div className="economic-section-head">
                    <div>
                      <h2>Cost Outlier Detection</h2>
                      <p>Items with significant variance against historical and payer benchmarks.</p>
                      <div className="thai-helper">รายการที่มีต้นทุนสูงผิดปกติและอาจต้องใช้หลักฐานเพิ่มเติม</div>
                    </div>
                    <button className="economic-btn" type="button" onClick={() => notify("Showing all outliers · แสดงรายการผิดปกติทั้งหมด")}>View All</button>
                  </div>
                  <div className="economic-table-wrap">
                    <table className="economic-table">
                      <thead>
                        <tr>
                          <th><button type="button" onClick={() => sortOutliers("item")}>Item</button></th>
                          <th><button type="button" onClick={() => sortOutliers("category")}>Category</button></th>
                          <th>Current Cost</th>
                          <th>Expected Cost</th>
                          <th>Variance</th>
                          <th>Detection Reason</th>
                          <th>Severity</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedOutliers.map((item) => (
                          <tr className={selectedCategory === item.category ? "economic-highlight-row" : undefined} key={item.item}>
                            <td><b>{item.item}</b></td>
                            <td>{item.category}</td>
                            <td>{item.currentCost}</td>
                            <td>{item.expectedCost}</td>
                            <td className="trend-up">{item.variance}</td>
                            <td>{item.reason}</td>
                            <td><Badge tone={item.severityTone}>{item.severity}</Badge></td>
                            <td><button className="economic-table-action" type="button" onClick={() => setReviewItem(item.item)}>{item.action}</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="economic-card economic-section">
                  <div className="economic-section-head">
                    <div>
                      <h2>Medication Cost Detail</h2>
                      <p>Prescription, stock batch, FEFO, and medication cost information.</p>
                      <div className="thai-helper">ตรวจสอบต้นทุนยา Lot การหมดอายุ และความเชื่อมโยงกับ Inventory</div>
                    </div>
                    <div className="economic-actions">
                      <button className="economic-btn" type="button" onClick={() => notify("Opening Prescription Detail · กำลังเปิดข้อมูลใบสั่งยา")}>View Prescription</button>
                      <button className="economic-btn" type="button" onClick={() => notify("Opening Inventory Detail · กำลังเปิดข้อมูลคลังยา")}>View Inventory</button>
                    </div>
                  </div>
                  <div className="economic-table-wrap">
                    <table className="economic-table">
                      <thead>
                        <tr><th>Medication</th><th>Quantity</th><th>Unit</th><th>Unit Cost</th><th>Total Cost</th><th>Stock Batch</th><th>Expiry</th><th>Alert</th></tr>
                      </thead>
                      <tbody>
                        {medications.map((item) => (
                          <tr className={selectedCategory === "Medication" ? "economic-highlight-row" : undefined} key={item.medication}>
                            <td><b>{item.medication}</b></td>
                            <td>{item.quantity}</td>
                            <td>{item.unit}</td>
                            <td>{item.unitCost}</td>
                            <td><b>{item.totalCost}</b></td>
                            <td>{item.batch}</td>
                            <td>{item.expiry}</td>
                            <td><Badge tone={item.alertTone}>{item.alert}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <aside className="economic-right">
                <section className="economic-card economic-section economic-ai-panel">
                  <div className="economic-section-head"><div><h2>AI Economic Insight</h2><p>Business-readable explanation and recommended next actions.</p></div></div>
                  <div className="economic-ai-lead">
                    This visit is <b>28.3% above</b> the expected benchmark range. The primary cost driver is <b>Medication Cost</b>, especially Antibiotic A, which is <b>137% higher</b> than typical usage for comparable diagnosis groups. The current pattern may increase the likelihood of claim review if clinical justification is incomplete.
                  </div>
                  <div className="economic-recommend">
                    <b>Recommended Actions</b>
                    <ol>
                      <li>Verify medication necessity and dosage.</li>
                      <li>Validate payer coverage for the high-cost antibiotic.</li>
                      <li>Add clinical justification before claim submission.</li>
                      <li>Review whether procedure cost matches the treatment record.</li>
                    </ol>
                  </div>
                  <div className="economic-thai-summary"><b>Thai Business Summary</b><br />ระบบพบว่าต้นทุน Visit สูงกว่าค่า Benchmark 28.3% โดยสาเหตุหลักมาจากค่ายา แนะนำให้ตรวจสอบความจำเป็นทางการแพทย์ เงื่อนไขความคุ้มครอง และเพิ่ม Clinical Justification ก่อนส่ง Claim</div>
                  <div className="economic-meta-row"><span className="economic-meta-pill">AI Confidence 87%</span><span className="economic-meta-pill">Generated {lastAnalyzed}</span><span className="economic-meta-pill">Version EC-1.4</span></div>
                  <div className="thai-helper" style={{ marginTop: 12 }}><b>AI-generated economic analysis is decision support only.</b><br />ผลวิเคราะห์จาก AI ไม่ใช่คำตัดสินสุดท้าย</div>
                </section>

                <section className="economic-card economic-section">
                  <div className="economic-section-head">
                    <div><h2>Claim Economic Risk</h2><p>Economic risk score linked to claim approval exposure.</p><div className="thai-helper">มีปัจจัยด้านต้นทุนและหลักฐานที่ควรตรวจสอบก่อนส่ง Claim</div></div>
                    <Badge tone="amber">Needs Review</Badge>
                  </div>
                  <div className="economic-gauge"><div className="economic-gauge-bg" /><div className="economic-gauge-mask" /><div className="economic-gauge-bottom" /><div className="economic-gauge-value">72 <small>/ 100</small></div></div>
                  <div className="economic-risk-list">
                    {riskItems.map((risk) => (
                      <div className="economic-risk-row" key={risk.title}>
                        <span>{risk.title}</span><Badge tone={risk.tone}>{risk.badge}</Badge>
                        <small>{risk.detail}<br />{risk.thai}</small>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="economic-card economic-section">
                  <div className="economic-section-head">
                    <div><h2>Economic Alerts</h2><p>Open items requiring ownership, review, or resolution.</p><div className="thai-helper">รายการแจ้งเตือนที่อาจส่งผลต่อการพิจารณา Claim</div></div>
                    <Badge tone="red">3 Open</Badge>
                  </div>
                  {alerts.map((alert) => (
                    <div className={`economic-alert${alert.critical ? " critical" : ""}${resolvedAlerts.has(alert.id) ? " resolved" : ""}`} key={alert.id}>
                      <div>!</div>
                      <div>
                        <strong>{alert.title}</strong>
                        <p>{alert.text}<br />{alert.thai}</p>
                        <div className="economic-alert-actions">
                          {alert.actions.includes("assign") ? <button type="button" onClick={() => notify("Alert assigned successfully · มอบหมายรายการให้ Claim Reviewer เรียบร้อยแล้ว")}>Assign</button> : null}
                          {alert.actions.includes("review") ? <button type="button" onClick={() => setReviewItem(alert.title)}>Review</button> : null}
                          {alert.actions.includes("evidence") ? <button type="button" onClick={() => notify("Opening related evidence · กำลังเปิดหลักฐานที่เกี่ยวข้อง")}>Open Evidence</button> : null}
                          {alert.actions.includes("resolve") ? <button type="button" onClick={() => resolveAlert(alert.id)}>Resolve</button> : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </section>

                <section className="economic-card economic-section">
                  <div className="economic-section-head">
                    <div><h2>Evidence & Justification</h2><p>Required evidence supporting cost reasonableness.</p><div className="thai-helper">ตรวจสอบว่ามีหลักฐานเพียงพอก่อนส่ง Claim หรือไม่</div></div>
                    <b>3 / 5</b>
                  </div>
                  {evidenceItems.map((item) => (
                    <div className="economic-evidence-item" key={item.title}>
                      <div><b>{item.title}</b><br /><small>Owner: {item.owner}{item.note ? ` · ${item.note}` : ""}</small></div>
                      <Badge tone={item.tone}>{item.status}</Badge>
                    </div>
                  ))}
                  <button className="economic-btn" style={{ width: "100%", marginTop: 12 }} type="button" onClick={() => notify("Opening Evidence Checklist · กำลังเปิดรายการหลักฐานทั้งหมด")}>Open Evidence Checklist</button>
                </section>
              </aside>
            </div>

            <div className="economic-bottom-grid">
              <section className="economic-card economic-section">
                <div className="economic-section-head"><div><h2>Financial Timeline</h2><p>Cost, prescription, inventory, and analysis events throughout the visit.</p><div className="thai-helper">ลำดับเหตุการณ์สำคัญที่เกี่ยวข้องกับต้นทุนและการเปลี่ยนแปลงข้อมูล</div></div></div>
                <div className="economic-timeline">
                  {timelineItems.map((item) => (
                    <button className="economic-time-item" type="button" key={item.title} onClick={() => notify(`${item.title} · ${item.thai}`)}>
                      <time>{item.time}</time><strong>{item.title}</strong>
                    </button>
                  ))}
                </div>
              </section>

              <section className="economic-card economic-section">
                <div className="economic-section-head">
                  <div><h2>Audit & Compliance</h2><p>Traceable access, update, review, export, and dispense activities.</p><div className="thai-helper">ทุกกิจกรรมสำคัญต้องตรวจสอบย้อนหลังได้ตามหลัก PDPA และ Compliance</div></div>
                  <button className="economic-btn" type="button" onClick={() => notify("Opening Complete Audit Trail · แสดงประวัติการดำเนินการทั้งหมดของ Visit นี้")}>Full Audit Trail</button>
                </div>
                <div className="economic-table-wrap">
                  <table className="economic-table">
                    <thead><tr><th>Time</th><th>User</th><th>Role</th><th>Action</th><th>Target</th><th>Detail</th></tr></thead>
                    <tbody>
                      {auditItems.map((item) => (
                        <tr key={`${item.time}-${item.target}`}><td>{item.time}</td><td>{item.user}</td><td>{item.role}</td><td>{item.action}</td><td>{item.target}</td><td>{item.detail}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {reviewItem ? (
        <div className="economic-modal" role="dialog" aria-modal="true" aria-labelledby="economic-modal-title" onMouseDown={(event) => {
          if (event.currentTarget === event.target) setReviewItem(null);
        }}>
          <div className="economic-modal-card">
            <div className="economic-modal-head">
              <div>
                <h2 id="economic-modal-title" style={{ margin: "0 0 5px" }}>Review Outlier - {reviewItem}</h2>
                <p style={{ margin: 0, color: "#64748b" }}>Validate economic reasonableness and supporting evidence.</p>
              </div>
              <button className="economic-close" type="button" aria-label="Close modal" onClick={() => setReviewItem(null)}><X size={16} /></button>
            </div>
            <hr style={{ border: 0, borderTop: "1px solid #e2e8f0", margin: "17px 0" }} />
            <div className="thai-helper">กรุณาตรวจสอบความจำเป็นทางการแพทย์ เงื่อนไขผู้ชำระเงิน และหลักฐานประกอบก่อนบันทึกผลการ Review</div>
            <div className="economic-form-grid" style={{ marginTop: 14 }}>
              <div className="economic-field"><label htmlFor="reviewer">Assign Reviewer</label><select id="reviewer"><option>Claim Reviewer</option><option>Doctor</option><option>Pharmacist</option><option>Compliance Officer</option></select></div>
              <div className="economic-field"><label htmlFor="severity">Severity</label><select id="severity"><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div>
              <div className="economic-field" style={{ gridColumn: "1/-1" }}><label htmlFor="reviewNote">Reviewer Note</label><textarea id="reviewNote" placeholder="Add review note..." /></div>
            </div>
            <div className="economic-actions" style={{ marginTop: 14 }}>
              <button className="economic-btn" type="button" onClick={() => setReviewItem(null)}>Cancel</button>
              <button className="economic-btn" type="button" onClick={() => { setReviewItem(null); notify("Reviewer assigned successfully · มอบหมายผู้ตรวจสอบเรียบร้อยแล้ว"); }}>Assign Reviewer</button>
              <button className="economic-btn primary" type="button" onClick={() => { setReviewItem(null); notify("Item marked as reviewed · บันทึกผลการตรวจสอบใน Audit Trail แล้ว"); }}>Mark Reviewed</button>
              <button className="economic-btn danger" type="button" onClick={() => { setReviewItem(null); notify("Alert resolved successfully · ปิดรายการแจ้งเตือนเรียบร้อยแล้ว"); }}>Resolve Alert</button>
            </div>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="economic-loading-overlay">
          <div className="economic-loading-card">
            <div className="economic-spinner" />
            <strong>Recalculating Analysis</strong>
            <div className="thai-helper">ระบบกำลังคำนวณข้อมูลล่าสุด กรุณารอสักครู่</div>
          </div>
        </div>
      ) : null}

      <div className={`economic-toast${toast ? " show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </>
  );
}
