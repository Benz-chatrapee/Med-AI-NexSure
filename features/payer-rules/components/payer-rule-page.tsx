"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertTriangle, Bot, Copy, Download, FileUp, History, Play, RotateCcw, Save, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { usePayerRuleWorkspace } from "../hooks/use-payer-rule-workspace";
import { baseForm } from "../mock/payer-rule-mock-data";
import type { AffectedCase, AuditEvent, CoverageStatus, EvidenceRequirement, ImpactMetric, Payer, PayerRuleFormValues, PayerStatus, ReadinessStatus, RiskLevel, RuleSetSummary, SimulationResult, VersionHistory } from "../types/payer-rule-types";

type Workspace = ReturnType<typeof usePayerRuleWorkspace>;
type Tone = "green" | "amber" | "red" | "blue" | "purple" | "gray";

const navItems = ["Main Dashboard", "Patient Management", "Visit Management", "SOAP Note", "Prescription", "Claim Readiness", "Evidence Package", "Payer Rules", "Economic Intelligence", "AI Copilot", "Audit & Compliance", "Admin Settings"];
const tabs = ["profile", "evidence", "icd", "coverage", "cost", "risk matrix", "advanced"];

export function PayerRulePage() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <PayerRuleWorkspace />
    </QueryClientProvider>
  );
}

function PayerRuleWorkspace() {
  const workspace = usePayerRuleWorkspace();
  const values = workspace.watchedValues;

  if (workspace.payersQuery.isLoading || workspace.ruleSetQuery.isLoading || !workspace.ruleSetQuery.data || !values) return <PageSkeleton />;
  if (workspace.payersQuery.isError || workspace.ruleSetQuery.isError) return <ErrorState onRetry={() => void workspace.ruleSetQuery.refetch()} />;

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 min-[1001px]:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar />
        <div className="min-w-0 overflow-x-hidden px-[18px] py-[18px] min-[641px]:px-7 min-[641px]:py-7">
          <Header workspace={workspace} />
          <KpiGrid onFilter={workspace.setCaseFilter} />
          {workspace.formMessage ? (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900" role="status">
              {workspace.formMessage}
            </div>
          ) : null}
          <section className="grid items-start gap-[18px] min-[1001px]:grid-cols-[280px_minmax(0,1fr)] min-[1401px]:grid-cols-[300px_minmax(0,1fr)_380px]">
            <PayerListPanel workspace={workspace} />
            <PayerRuleForm workspace={workspace} />
            <RightPanel workspace={workspace} />
          </section>
          <AffectedCaseTable workspace={workspace} />
          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <VersionHistoryPanel items={workspace.versionQuery.data ?? []} />
            <AuditEventsPanel items={workspace.auditQuery.data ?? []} />
          </section>
          <PayerRuleActionBar workspace={workspace} />
        </div>
      </div>
      <RuleSimulationDialog workspace={workspace} />
    </main>
  );
}

function Sidebar() {
  return (
    <aside className="hidden bg-gradient-to-b from-[#0F2A5F] to-[#06172F] px-[22px] py-7 text-white min-[1001px]:block" aria-label="Main navigation">
      <div className="text-[22px] font-black tracking-tight">Med AI NexSure</div>
      <p className="mb-7 mt-1.5 text-xs leading-5 text-blue-100">Enterprise Healthcare & Insurance Intelligence Platform</p>
      <nav>
        {navItems.map((item) => (
          <a key={item} className={`mb-[7px] block rounded-[14px] px-3.5 py-3 text-sm font-bold ${item === "Payer Rules" ? "bg-white/15 text-white" : "text-blue-100 hover:bg-white/10"}`} href={item === "Payer Rules" ? "/payer-rules" : "#"}>
            {item}
          </a>
        ))}
      </nav>
    </aside>
  );
}

function Header({ workspace }: { workspace: Workspace }) {
  const ruleSet = workspace.ruleSetQuery.data;
  return (
    <header className="mb-5 flex flex-col items-start gap-6 min-[1001px]:flex-row min-[1001px]:justify-between">
      <div>
        <nav className="mb-2.5 text-xs font-bold text-slate-500" aria-label="Breadcrumb">Insurance Intelligence / Rule Governance / Payer Rules</nav>
        <h1 className="mt-2 text-[34px] font-black tracking-tight text-[#0F2A5F]">Payer Rules</h1>
        <p className="mt-1.5 text-[13px] leading-5 text-slate-600">ตั้งค่ากฎประกันจำลองสำหรับประเมิน Claim Readiness, Coverage, Evidence และ Cost Governance</p>
        <div className="mt-3.5 flex flex-wrap gap-2.5 text-xs font-bold text-slate-600">
          <Meta>Current Payer: {workspace.form.getValues("payerName")}</Meta>
          <Meta>Active Rule Set: {ruleSet?.name}</Meta>
          <Meta>Version: {ruleSet?.version}</Meta>
          <Meta>Updated By: {ruleSet?.updatedBy}</Meta>
          <Meta>Last Updated: {formatDate(ruleSet?.updatedAt)}</Meta>
        </div>
      </div>
      <div className="flex flex-wrap justify-start gap-2.5 min-[1001px]:justify-end">
        <ActionButton icon={<FileUp size={16} />} label="Import" disabled={!workspace.permissions.canEdit} />
        <ActionButton icon={<Download size={16} />} label="Export" disabled={!workspace.permissions.canExport} />
        <ActionButton icon={<Copy size={16} />} label="Clone" disabled={!workspace.permissions.canEdit} />
        <ActionButton icon={<Play size={16} />} label="Test Rule" onClick={() => workspace.setSimulationOpen(true)} disabled={!workspace.permissions.canSimulate} variant="dark" />
        <ActionButton icon={<Save size={16} />} label={workspace.saveMutation.isPending ? "Saving" : "Save Changes"} onClick={() => void workspace.saveDraft()} disabled={!workspace.permissions.canEdit || workspace.saveMutation.isPending} variant="primary" />
      </div>
    </header>
  );
}

function KpiGrid({ onFilter }: { onFilter: (filter: string) => void }) {
  const kpis = [
    ["Today Visits", "128", "Evaluated by active rule", "all"],
    ["Claim Ready %", "72%", "+8% rule impact", "all"],
    ["AI Assisted Cases", "94", "AI evidence review", "all"],
    ["Average Readiness Score", "86", "+4 from previous rule", "all"],
    ["Pending Evidence", "27", "-6 after ICD rule update", "pending_evidence"],
    ["High Risk Claims", "9", "Requires human review", "high_risk"],
    ["Cost Alert Cases", "18", "Above threshold", "cost_alert"],
    ["Active Rule Sets", "5", "Across mock payers", "all"],
  ];
  return (
    <section className="mb-5 grid grid-cols-[repeat(8,minmax(160px,1fr))] gap-3.5 overflow-x-auto pb-1" aria-label="Payer rule KPIs">
      {kpis.map(([label, value, helper, filter]) => (
        <button key={label} type="button" onClick={() => onFilter(filter)} className="min-w-40 rounded-[20px] border border-[#DBEAFE] bg-white p-[17px] text-left shadow-[0_18px_50px_rgba(15,42,95,.08)] transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <span className="text-xs font-black uppercase text-slate-500">{label}</span>
          <strong className="mt-[9px] block text-[26px] font-black text-[#0F2A5F]">{value}</strong>
          <span className="mt-2 block text-xs font-extrabold text-slate-500">{helper}</span>
        </button>
      ))}
    </section>
  );
}

function PayerListPanel({ workspace }: { workspace: Workspace }) {
  const [search, setSearch] = useState("");
  const payers = (workspace.payersQuery.data ?? []).filter((payer) => `${payer.name} ${payer.code}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <aside className="rounded-[20px] border border-[#DBEAFE] bg-white p-[18px] shadow-[0_18px_50px_rgba(15,42,95,.08)]" aria-label="Payer navigation">
      <PanelTitle title="Payer List" thai="เลือกบริษัทประกันและ Rule Set สำหรับจำลองการประเมินเคลม" />
      <label className="mt-4 block text-xs font-black text-slate-500" htmlFor="payer-search">Search payer or rule set</label>
      <div className="relative mt-2">
        <Search className="absolute left-3 top-3 text-slate-400" size={16} />
        <input id="payer-search" placeholder="Search payer or rule set" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-[13px] border border-[#D8E3F5] bg-white py-[11px] pl-9 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="mt-4 space-y-3">
        {payers.length === 0 ? <EmptyState label="No payer found" /> : null}
        {payers.map((payer) => (
          <PayerItem key={payer.id} payer={payer} ruleSet={workspace.ruleSetsQuery.data?.find((item) => item.payerId === payer.id)} active={workspace.selectedPayerId === payer.id} onSelect={() => workspace.selectPayer(payer.id, payer.defaultRuleSetId)} />
        ))}
      </div>
      <div className="mt-4 grid gap-2">
        <ActionButton label="Create" disabled={!workspace.permissions.canEdit} variant="primary" />
        <ActionButton label="Clone Rule" disabled={!workspace.permissions.canEdit} />
      </div>
      {workspace.permissions.readOnlyReason ? <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-600">{workspace.permissions.readOnlyReason}</p> : null}
    </aside>
  );
}

function PayerItem({ payer, ruleSet, active, onSelect }: { payer: Payer; ruleSet?: RuleSetSummary; active: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className={`w-full rounded-2xl border p-3.5 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${active ? "border-blue-500 bg-[#EFF6FF]" : "border-slate-200 bg-white hover:border-blue-200"}`}>
      <div className="text-sm font-black text-[#0F2A5F]">{payer.name}</div>
      <div className="mt-1 text-[11px] font-bold text-slate-500">{payer.code} / {ruleSet?.name ?? "No rule set"} {ruleSet?.version}</div>
      <Badge tone={payerStatusTone(payer.status)}>{labelize(payer.status)}</Badge>
      {active ? <Badge tone="blue">Default</Badge> : null}
    </button>
  );
}

function PayerRuleForm({ workspace }: { workspace: Workspace }) {
  const form = workspace.form;
  const disabled = !workspace.permissions.canEdit;
  return (
    <section className="min-w-0">
      <div className="mb-3.5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Payer rule sections">
        {tabs.map((tab) => (
          <button key={tab} role="tab" aria-selected={workspace.activeTab === tab} type="button" onClick={() => workspace.setActiveTab(tab)} className={`whitespace-nowrap rounded-full border px-3 py-[9px] text-xs font-black capitalize focus:outline-none focus:ring-2 focus:ring-blue-500 ${workspace.activeTab === tab ? "border-[#0F2A5F] bg-[#0F2A5F] text-white" : "border-[#DBEAFE] bg-white text-slate-500"}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        <ProfileBuilder form={form} disabled={disabled} />
        <EvidenceRuleBuilder form={form} disabled={disabled} />
        <IcdRuleBuilder form={form} disabled={disabled} />
        <CoverageRuleBuilder form={form} disabled={disabled} />
        <CostRuleBuilder form={form} disabled={disabled} />
        <RiskMatrixBuilder form={form} disabled={disabled} />
        <AdvancedBuilder form={form} disabled={disabled} />
      </div>
    </section>
  );
}

function ProfileBuilder({ form, disabled }: { form: UseFormReturn<PayerRuleFormValues>; disabled: boolean }) {
  return (
    <Card>
      <PanelTitle title="Payer Profile" thai="กำหนดข้อมูลบริษัทประกันจำลองและสถานะ Rule ที่ใช้ประเมินเคลม" />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Payer Name" error={form.formState.errors.payerName?.message}><input disabled={disabled} className={inputClass} {...form.register("payerName")} /></Field>
        <Field label="Payer Code" error={form.formState.errors.payerCode?.message}><input disabled={disabled} className={inputClass} {...form.register("payerCode")} /></Field>
        <Field label="Status"><select disabled={disabled} className={inputClass} {...form.register("status")}><option value="active">Active</option><option value="needs_review">Needs Review</option><option value="draft">Draft</option><option value="simulation">Simulation</option><option value="inactive">Inactive</option></select></Field>
        <Field label="Rule Set"><input disabled={disabled} className={inputClass} {...form.register("ruleSetName")} /></Field>
        <Field label="Effective Date"><input disabled={disabled} className={inputClass} type="date" {...form.register("effectiveDate")} /></Field>
        <Field label="Governance Owner"><input disabled={disabled} className={inputClass} {...form.register("governanceOwner")} /></Field>
        <Field label="Description" wide><textarea disabled={disabled} className={`${inputClass} min-h-[78px] resize-y`} {...form.register("description")} /></Field>
      </div>
    </Card>
  );
}

function EvidenceRuleBuilder({ form, disabled }: { form: UseFormReturn<PayerRuleFormValues>; disabled: boolean }) {
  const rules = form.watch("evidenceRules") ?? baseForm.evidenceRules;
  const summary = rules.filter((rule) => rule.enabled).map((rule) => `${rule.label}: ${labelize(rule.requirement)}`).join("; ");
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <PanelTitle title="Required Evidence Builder" thai="กำหนดเอกสารและข้อมูลที่ต้องครบก่อนส่งเคลม" />
        <VisualToggle />
      </div>
      <div className="mt-3.5">
        {rules.map((rule, index) => (
          <div key={rule.key} className="grid items-center gap-3 border-t border-[#EEF2F7] py-[11px] text-[13px] min-[641px]:grid-cols-[1fr_170px]">
            <label className="flex items-center gap-3 font-black text-[#0F2A5F]"><input disabled={disabled} type="checkbox" checked={rule.enabled} onChange={(event) => form.setValue(`evidenceRules.${index}.enabled`, event.target.checked, { shouldDirty: true })} />{rule.label}</label>
            <select disabled={disabled} className="rounded-[13px] border border-[#D8E3F5] px-3 py-[11px] text-[13px]" value={rule.requirement} onChange={(event) => form.setValue(`evidenceRules.${index}.requirement`, event.target.value as EvidenceRequirement, { shouldDirty: true })}>
                <option value="required">Required</option><option value="required_if">Required if</option><option value="recommended">Recommended</option><option value="optional">Optional</option>
            </select>
          </div>
        ))}
      </div>
      <Summary>{summary || "No evidence rules enabled. กรุณาเปิดใช้งานหลักฐานขั้นต่ำก่อนบันทึก"}</Summary>
    </Card>
  );
}

function IcdRuleBuilder({ form, disabled }: { form: UseFormReturn<PayerRuleFormValues>; disabled: boolean }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <PanelTitle title="ICD Rule Builder" thai="ควบคุม ICD Requirement, ICD Coverage Group และ High-risk ICD" />
        <VisualToggle />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ToggleField label="Require ICD-10" checked={form.watch("icdRules.requireIcd10") ?? baseForm.icdRules.requireIcd10} disabled={disabled} onChange={(checked) => form.setValue("icdRules.requireIcd10", checked, { shouldDirty: true })} />
        <ToggleField label="Require ICD-9 for procedures" checked={form.watch("icdRules.requireIcd9ForProcedures") ?? baseForm.icdRules.requireIcd9ForProcedures} disabled={disabled} onChange={(checked) => form.setValue("icdRules.requireIcd9ForProcedures", checked, { shouldDirty: true })} />
        <Field label="Missing ICD Action"><select disabled={disabled} className={inputClass} {...form.register("icdRules.missingIcdAction")}><option value="block">Block - Mark Not Ready</option><option value="warn">Warning Only</option></select></Field>
        <ToggleField label="Diagnosis and ICD consistency" checked={form.watch("icdRules.diagnosisIcdConsistency") ?? baseForm.icdRules.diagnosisIcdConsistency} disabled={disabled} onChange={(checked) => form.setValue("icdRules.diagnosisIcdConsistency", checked, { shouldDirty: true })} />
        <Field label="High-risk ICD Groups"><input disabled={disabled} className={inputClass} value={(form.watch("icdRules.highRiskGroups") ?? baseForm.icdRules.highRiskGroups).join(", ")} onChange={(event) => form.setValue("icdRules.highRiskGroups", splitList(event.target.value), { shouldDirty: true })} /></Field>
        <Field label="Excluded ICD Groups"><input disabled={disabled} className={inputClass} value={(form.watch("icdRules.excludedGroups") ?? baseForm.icdRules.excludedGroups).join(", ")} onChange={(event) => form.setValue("icdRules.excludedGroups", splitList(event.target.value), { shouldDirty: true })} /></Field>
        <ToggleField label="Human review required" checked={form.watch("icdRules.humanReview") ?? baseForm.icdRules.humanReview} disabled={disabled} onChange={(checked) => form.setValue("icdRules.humanReview", checked, { shouldDirty: true })} />
      </div>
    </Card>
  );
}

function CoverageRuleBuilder({ form, disabled }: { form: UseFormReturn<PayerRuleFormValues>; disabled: boolean }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <PanelTitle title="Coverage Rule Builder" thai="จำลอง Coverage, Exclusion, Waiting Period และ Benefit Limit" />
        <VisualToggle />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Default Coverage Status"><select disabled={disabled} className={inputClass} {...form.register("coverageRules.defaultStatus")}><option value="likely_covered">Likely Covered</option><option value="need_review">Need Review</option><option value="not_covered">Not Covered</option></select></Field>
        <ToggleField label="Waiting period simulation" checked={form.watch("coverageRules.waitingPeriodSimulation") ?? baseForm.coverageRules.waitingPeriodSimulation} disabled={disabled} onChange={(checked) => form.setValue("coverageRules.waitingPeriodSimulation", checked, { shouldDirty: true })} />
        <Field label="Benefit Limit"><input disabled={disabled} className={inputClass} type="number" {...form.register("coverageRules.benefitLimit", { valueAsNumber: true })} /></Field>
        <Field label="Exclusions"><input disabled={disabled} className={inputClass} value={(form.watch("coverageRules.exclusions") ?? baseForm.coverageRules.exclusions).join(", ")} onChange={(event) => form.setValue("coverageRules.exclusions", splitList(event.target.value), { shouldDirty: true })} /></Field>
        <Field label="Required Evidence" wide><input disabled={disabled} className={inputClass} value={(form.watch("coverageRules.requiredEvidence") ?? baseForm.coverageRules.requiredEvidence).join(", ")} onChange={(event) => form.setValue("coverageRules.requiredEvidence", splitList(event.target.value), { shouldDirty: true })} /></Field>
        <ToggleField label="Human review required" checked={form.watch("coverageRules.humanReview") ?? baseForm.coverageRules.humanReview} disabled={disabled} onChange={(checked) => form.setValue("coverageRules.humanReview", checked, { shouldDirty: true })} />
      </div>
      <Summary>Coverage results are decision-support indicators and do not represent final insurer approval.</Summary>
    </Card>
  );
}

function CostRuleBuilder({ form, disabled }: { form: UseFormReturn<PayerRuleFormValues>; disabled: boolean }) {
  const cost = form.watch("costRules") ?? baseForm.costRules;
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <PanelTitle title="Cost Threshold Configuration" thai="ตั้งค่าเพดานค่าใช้จ่ายและเงื่อนไข Cost Governance" />
        <VisualToggle />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Expected Minimum"><input disabled={disabled} className={inputClass} type="number" {...form.register("costRules.expectedMinimum", { valueAsNumber: true })} /></Field>
        <Field label="Expected Maximum"><input disabled={disabled} className={inputClass} type="number" {...form.register("costRules.expectedMaximum", { valueAsNumber: true })} /></Field>
        <Field label="Alert Threshold"><input disabled={disabled} className={inputClass} type="number" {...form.register("costRules.alertThreshold", { valueAsNumber: true })} /></Field>
        <Field label="Block Threshold"><input disabled={disabled} className={inputClass} type="number" {...form.register("costRules.blockThreshold", { valueAsNumber: true })} /></Field>
        <Field label="Justification Threshold"><input disabled={disabled} className={inputClass} type="number" {...form.register("costRules.justificationThreshold", { valueAsNumber: true })} /></Field>
        <Field label="Currency"><select disabled={disabled} className={inputClass} {...form.register("costRules.currency")}><option value="THB">THB</option><option value="USD">USD</option></select></Field>
      </div>
      <Summary>Normal: {cost.expectedMinimum}-{cost.expectedMaximum} {cost.currency}. Review: above {cost.expectedMaximum} to below {cost.blockThreshold}. Escalated: {cost.blockThreshold} and above.</Summary>
    </Card>
  );
}

function RiskMatrixBuilder({ form, disabled }: { form: UseFormReturn<PayerRuleFormValues>; disabled: boolean }) {
  const rules = form.watch("riskRules") ?? baseForm.riskRules;
  return (
    <Card>
      <PanelTitle title="Risk Matrix Configuration" thai="กำหนด Risk Level และ Action เมื่อ Rule ไม่ผ่าน" />
      <div className="mt-4 space-y-3">
        {rules.map((rule, index) => (
          <div key={rule.key} className="grid gap-3 rounded-lg border border-slate-200 p-3 lg:grid-cols-[1.3fr_130px_160px_120px] lg:items-center">
            <label className="flex items-center gap-3 font-black text-[#0F2A5F]"><input disabled={disabled} type="checkbox" checked={rule.enabled} onChange={(event) => form.setValue(`riskRules.${index}.enabled`, event.target.checked, { shouldDirty: true })} />{rule.label}</label>
            <select disabled={disabled} className={inputClass} value={rule.riskLevel} onChange={(event) => form.setValue(`riskRules.${index}.riskLevel`, event.target.value as RiskLevel, { shouldDirty: true })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select>
            <select disabled={disabled} className={inputClass} value={rule.resultingStatus} onChange={(event) => form.setValue(`riskRules.${index}.resultingStatus`, event.target.value as ReadinessStatus, { shouldDirty: true })}><option value="ready">Ready</option><option value="needs_review">Needs Review</option><option value="not_ready">Not Ready</option><option value="pending_evidence">Pending Evidence</option></select>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600"><input disabled={disabled} type="checkbox" checked={rule.humanReview} onChange={(event) => form.setValue(`riskRules.${index}.humanReview`, event.target.checked, { shouldDirty: true })} />Human review</label>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AdvancedBuilder({ form, disabled }: { form: UseFormReturn<PayerRuleFormValues>; disabled: boolean }) {
  return (
    <Card>
      <PanelTitle title="Advanced Governance Notes" thai="บันทึกข้อจำกัดและแนวทางตรวจสอบเพิ่มเติม" />
      <textarea disabled={disabled} className={`${inputClass} mt-4 min-h-40`} {...form.register("advancedNotes")} />
      <Summary>AI assists only. Final clinical and insurance decisions remain with authorized professionals.</Summary>
    </Card>
  );
}

function RightPanel({ workspace }: { workspace: Workspace }) {
  return (
    <aside className="grid gap-4 min-[1001px]:col-span-2 min-[1001px]:grid-cols-2 min-[1401px]:sticky min-[1401px]:top-5 min-[1401px]:col-span-1 min-[1401px]:grid-cols-1">
      <RuleImpactPreview workspace={workspace} />
      <AiRecommendationCard workspace={workspace} />
      <Card>
        <PanelTitle title="Export Readiness" thai="ตรวจสอบความพร้อมก่อน Export Rule Configuration" />
        <div className="mt-3 flex flex-wrap gap-2"><Badge tone="green">No PHI Detected</Badge><Badge tone="blue">Audit Ready</Badge><Badge tone="purple">Human Review Required</Badge></div>
      </Card>
    </aside>
  );
}

function RuleImpactPreview({ workspace }: { workspace: Workspace }) {
  return (
    <Card>
      <PanelTitle title="Rule Impact Preview" thai="วิเคราะห์ผลกระทบของ Rule ก่อนบันทึก" />
      <div className="mt-4 space-y-2">
        {workspace.impactQuery.isLoading ? <SkeletonRows /> : null}
        {workspace.impactQuery.isError ? <ErrorInline onRetry={() => void workspace.impactQuery.refetch()} /> : null}
        {(workspace.impactQuery.data ?? []).map((metric) => <ImpactRow key={metric.key} metric={metric} />)}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
        <span>Last calculated: {formatDate(workspace.lastCalculatedAt)}</span>
        <ActionButton label="Recalculate Preview" icon={<RotateCcw size={14} />} onClick={() => void workspace.impactQuery.refetch()} />
      </div>
      <p className="mt-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3 text-sm leading-6 text-amber-900">Sample-data disclaimer: preview uses typed mock calculations until payer-rule APIs are connected.</p>
    </Card>
  );
}

function ImpactRow({ metric }: { metric: ImpactMetric }) {
  const delta = metric.after - metric.before;
  const positive = metric.lowerIsBetter ? delta < 0 : delta > 0;
  return (
    <div className="grid grid-cols-[1fr_55px_55px_55px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
      <strong className="text-[#0F2A5F]">{metric.label}</strong>
      <span className="text-right font-black">{metric.before}{metric.unit === "%" ? "%" : ""}</span>
      <span className="text-right font-black">{metric.after}{metric.unit === "%" ? "%" : ""}</span>
      <span className={`text-right font-black ${positive ? "text-emerald-700" : delta === 0 ? "text-slate-500" : "text-red-700"}`}>{delta > 0 ? "+" : ""}{delta}</span>
    </div>
  );
}

function AiRecommendationCard({ workspace }: { workspace: Workspace }) {
  const recommendation = workspace.recommendationQuery.data;
  return (
    <Card className="border-purple-200 bg-gradient-to-b from-white to-purple-50">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-800"><Bot size={14} /> AI Recommendation</div>
      <PanelTitle title={recommendation?.title ?? "Suggested Rule Optimization"} thai="AI ให้คำแนะนำเท่านั้น ต้องได้รับการยืนยันจากผู้ใช้งานก่อนนำไปใช้" />
      {recommendation ? (
        <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
          <AiItem title="Missing evidence pattern" value={recommendation.missingEvidencePattern} />
          <AiItem title="Predicted claim impact" value={recommendation.predictedClaimImpact} />
          <AiItem title="Cost insight" value={recommendation.costInsight} />
          <AiItem title="Confidence" value={`${Math.round(recommendation.confidence * 100)}% - ${recommendation.evidenceBasis}`} />
          <AiItem title="Generated" value={formatDate(recommendation.generatedAt)} />
        </div>
      ) : <SkeletonRows />}
      <p className="mt-3 rounded-lg bg-white/70 p-3 text-xs font-semibold text-purple-900">AI recommendations are decision-support only. Human review and approval are required.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <ActionButton label="Review" />
        <ActionButton label="Apply to Draft" onClick={workspace.applyRecommendationToDraft} disabled={!workspace.permissions.canEdit} variant="primary" />
      </div>
    </Card>
  );
}

function AffectedCaseTable({ workspace }: { workspace: Workspace }) {
  const rows = workspace.filteredCases;
  return (
    <section className="mt-[18px] overflow-x-auto rounded-[20px] border border-[#DBEAFE] bg-white p-[18px] shadow-[0_18px_50px_rgba(15,42,95,.08)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <PanelTitle title="Case List" thai="รายการเคสที่ถูกประเมินด้วย Active Payer Rule" />
        <div className="flex gap-2">
          <select className={inputClass} value={workspace.caseFilter} onChange={(event) => workspace.setCaseFilter(event.target.value)} aria-label="Case filter"><option value="all">All</option><option value="pending_evidence">Pending Evidence</option><option value="high_risk">High Risk</option><option value="cost_alert">Cost Alert</option></select>
          <input className={inputClass} value={workspace.caseSearch} onChange={(event) => workspace.setCaseSearch(event.target.value)} placeholder="Search HN or visit" aria-label="Search affected cases" />
        </div>
      </div>
      {workspace.casesQuery.isLoading ? <SkeletonRows /> : null}
      {workspace.casesQuery.isError ? <ErrorInline onRetry={() => void workspace.casesQuery.refetch()} /> : null}
      {!workspace.casesQuery.isLoading && rows.length === 0 ? <EmptyState label="No affected cases match this filter" /> : null}
      <div className="mt-4 overflow-x-auto">
        <table className="mt-3.5 w-full min-w-[1100px] border-collapse bg-white text-left text-xs">
          <thead><tr className="bg-[#F8FAFC] text-slate-500">{["HN", "Visit", "Patient", "Payer", "Rule Set", "Readiness Score", "Status", "Coverage", "Risk", "Missing Evidence", "Rule Failures", "Cost Status", "Updated", "Action"].map((head) => <th key={head} className="border-b border-[#EEF2F7] p-3 font-black">{head}</th>)}</tr></thead>
          <tbody>{rows.map((item) => <CaseRow key={item.id} item={item} onSimulate={() => workspace.setSimulationOpen(true)} />)}</tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500"><span>Page 1 of 1</span><span>Sorted by latest update</span></div>
    </section>
  );
}

function CaseRow({ item, onSimulate }: { item: AffectedCase; onSimulate: () => void }) {
  return <tr><td className="border-b p-3 font-bold">{item.hn}</td><td className="border-b p-3">{item.visitId}</td><td className="border-b p-3">{item.patientNameMasked}</td><td className="border-b p-3">{item.payer}</td><td className="border-b p-3">{item.ruleSet}</td><td className="border-b p-3 font-black">{item.readinessScore}</td><td className="border-b p-3"><Badge tone={statusTone(item.status)}>{labelize(item.status)}</Badge></td><td className="border-b p-3">{coverageLabel(item.coverage)}</td><td className="border-b p-3"><Badge tone={riskTone(item.risk)}>{labelize(item.risk)}</Badge></td><td className="border-b p-3">{dashList(item.missingEvidence)}</td><td className="border-b p-3">{dashList(item.ruleFailures)}</td><td className="border-b p-3"><Badge tone={item.costStatus === "normal" ? "green" : item.costStatus === "alert" ? "amber" : "red"}>{labelize(item.costStatus)}</Badge></td><td className="border-b p-3">{item.updatedAt}</td><td className="border-b p-3"><ActionButton label="Test Rule" onClick={onSimulate} /></td></tr>;
}

function VersionHistoryPanel({ items }: { items: VersionHistory[] }) {
  return <Card><PanelTitle title="Version History" thai="ติดตาม Version และ Before / After Snapshot ของ Rule" /> <Timeline>{items.map((item) => <TimelineItem key={item.version} icon={<History size={16} />} title={`${item.version} - ${item.changeSummary}`} meta={`${item.changedBy} / ${item.changedAt} / ${labelize(item.approvalStatus)}`} />)}</Timeline></Card>;
}

function AuditEventsPanel({ items }: { items: AuditEvent[] }) {
  return <Card><PanelTitle title="Audit & Governance" thai="รองรับการตรวจสอบ Rule Change, Access History และ Compliance Events" /> <Timeline>{items.map((item) => <TimelineItem key={item.id} icon={<ShieldCheck size={16} />} title={item.event} meta={`${item.actor} (${item.role}) / ${item.timestamp} / ${item.version} / ${labelize(item.phiStatus)}`} />)}</Timeline></Card>;
}

function PayerRuleActionBar({ workspace }: { workspace: Workspace }) {
  return (
    <div className="sticky bottom-0 z-20 mt-5 border-t border-[#DBEAFE] bg-[#F8FAFC]/90 pt-3.5 backdrop-blur">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-xs font-semibold leading-5 text-slate-600">
          <strong>{workspace.form.formState.isDirty ? "Unsaved changes" : "No unsaved changes"}</strong> / Validation runs before save / Last saved: {formatDate(workspace.lastSavedAt)}
          <br />AI cannot modify payer rules automatically. Human approval is required before activation.
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton label="Import" disabled={!workspace.permissions.canEdit} />
          <ActionButton label="Export" disabled={!workspace.permissions.canExport} />
          <ActionButton label="Clone" disabled={!workspace.permissions.canEdit} />
          <ActionButton label="Run Simulation" onClick={() => workspace.setSimulationOpen(true)} disabled={!workspace.permissions.canSimulate} variant="dark" />
          <ActionButton label={workspace.saveMutation.isPending ? "Saving" : "Save Changes"} onClick={() => void workspace.saveDraft()} disabled={!workspace.permissions.canEdit || workspace.saveMutation.isPending} variant="primary" />
        </div>
      </div>
    </div>
  );
}

function RuleSimulationDialog({ workspace }: { workspace: Workspace }) {
  const [caseId, setCaseId] = useState("case-2");
  const [visitId, setVisitId] = useState("OPD-24072");
  if (!workspace.simulationOpen) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="simulation-title">
      <section className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div><h2 id="simulation-title" className="text-xl font-black text-[#0F2A5F]">Rule Simulation</h2><p className="text-sm text-slate-600">จำลองผลลัพธ์โดยไม่บันทึกหรืออนุมัติ Rule</p></div>
          <button type="button" onClick={() => workspace.setSimulationOpen(false)} className="rounded-lg border px-3 py-2 text-sm font-bold">Close</button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Mock Case"><select className={inputClass} value={caseId} onChange={(event) => setCaseId(event.target.value)}>{(workspace.casesQuery.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.hn} / {item.visitId}</option>)}</select></Field>
          <Field label="Mock Visit ID"><input className={inputClass} value={visitId} onChange={(event) => setVisitId(event.target.value)} /></Field>
        </div>
        <div className="mt-4"><ActionButton icon={<Play size={16} />} label={workspace.simulationMutation.isPending ? "Running" : "Run Simulation"} variant="primary" onClick={() => workspace.simulationMutation.mutate({ caseId, visitId })} disabled={workspace.simulationMutation.isPending} /></div>
        <SimulationResultPanel result={workspace.simulation} />
      </section>
    </div>
  );
}

function SimulationResultPanel({ result }: { result: SimulationResult }) {
  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap gap-2"><Badge tone={result.status === "completed" ? "green" : result.status === "failed" ? "red" : "blue"}>{labelize(result.status)}</Badge><Badge tone={riskTone(result.risk)}>{labelize(result.risk)}</Badge><Badge tone={statusTone(result.humanReviewRequired ? "needs_review" : "ready")}>{result.humanReviewRequired ? "Human Review" : "No Review Required"}</Badge></div>
      <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
        <ResultLine label="Readiness Score" value={String(result.readinessScore)} />
        <ResultLine label="Coverage" value={coverageLabel(result.coverage)} />
        <ResultLine label="Passed Rules" value={dashList(result.passedRules)} />
        <ResultLine label="Failed Rules" value={dashList(result.failedRules)} />
        <ResultLine label="Missing Evidence" value={dashList(result.missingEvidence)} />
        <ResultLine label="Cost Impact" value={result.costImpact} />
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <section className={`rounded-[20px] border border-[#DBEAFE] bg-white p-[18px] shadow-[0_18px_50px_rgba(15,42,95,.08)] ${className}`}>{children}</section>; }
function PanelTitle({ title, thai }: { title: string; thai: string }) { return <div><h2 className="text-[15px] font-black tracking-tight text-[#0F2A5F]">{title}</h2><p className="mt-1 text-[13px] leading-5 text-slate-500">{thai}</p></div>; }
function Field({ label, error, children, wide }: { label: string; error?: string; children: React.ReactNode; wide?: boolean }) { return <label className={`block ${wide ? "md:col-span-2" : ""}`}><span className="mb-[7px] block text-xs font-black text-slate-500">{label}</span>{children}{error ? <span className="mt-1 block text-xs font-bold text-red-700">{error}</span> : null}</label>; }
function ToggleField({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled: boolean; onChange: (checked: boolean) => void }) { return <label className="flex items-center justify-between gap-3 rounded-[14px] border border-[#EEF2F7] p-3 text-sm font-black text-[#0F2A5F]"><span>{label}</span><input disabled={disabled} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>; }
function VisualToggle() { return <span aria-hidden="true" className="relative h-[26px] w-12 flex-none rounded-full bg-[#2563EB] after:absolute after:right-1 after:top-1 after:h-[18px] after:w-[18px] after:rounded-full after:bg-white" />; }
function Summary({ children }: { children: React.ReactNode }) { return <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm leading-6 text-slate-600">{children}</div>; }
function Meta({ children }: { children: React.ReactNode }) { return <span className="rounded-full border border-blue-100 bg-white px-3 py-1">{children}</span>; }
function Badge({ children, tone }: { children: React.ReactNode; tone: Tone }) { const tones: Record<Tone, string> = { green: "bg-[#DCFCE7] text-[#166534]", amber: "bg-[#FEF3C7] text-[#92400E]", red: "bg-[#FEE2E2] text-[#991B1B]", blue: "bg-[#DBEAFE] text-[#1E40AF]", purple: "bg-[#EDE9FE] text-[#5B21B6]", gray: "bg-[#F1F5F9] text-[#475569]" }; return <span className={`mt-[7px] inline-flex items-center whitespace-nowrap rounded-full px-[9px] py-[5px] text-[11px] font-black ${tones[tone]}`}>{children}</span>; }
function ActionButton({ label, icon, onClick, disabled, variant = "outline" }: { label: string; icon?: React.ReactNode; onClick?: () => void; disabled?: boolean; variant?: "outline" | "primary" | "dark" }) { const variants = { outline: "border border-[#DBEAFE] bg-white text-slate-700", primary: "border border-[#2563EB] bg-[#2563EB] text-white shadow-[0_14px_28px_rgba(37,99,235,.24)]", dark: "border border-[#0F2A5F] bg-[#0F2A5F] text-white" }; return <button type="button" disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-[13px] px-[15px] py-[11px] text-[13px] font-extrabold transition focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`}>{icon}{label}</button>; }
function AiItem({ title, value }: { title: string; value: string }) { return <div className="border-t border-purple-100 pt-3"><strong className="block text-[#0F2A5F]">{title}</strong>{value}</div>; }
function Timeline({ children }: { children: React.ReactNode }) { return <div className="mt-4 space-y-3">{children}</div>; }
function TimelineItem({ icon, title, meta }: { icon: React.ReactNode; title: string; meta: string }) { return <div className="flex gap-3 border-l-4 border-blue-500 pl-3 text-sm"><span className="mt-0.5 text-blue-700">{icon}</span><div><strong className="text-[#0F2A5F]">{title}</strong><p className="mt-1 text-xs leading-5 text-slate-500">{meta}</p></div></div>; }
function ResultLine({ label, value }: { label: string; value: string }) { return <div><span className="block text-xs font-black text-slate-500">{label}</span><strong className="text-slate-800">{value || "-"}</strong></div>; }
function EmptyState({ label }: { label: string }) { return <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm font-semibold text-slate-500">{label}</div>; }
function ErrorInline({ onRetry }: { onRetry: () => void }) { return <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-800"><AlertTriangle className="mr-2 inline" size={16} />Unable to load section. <button className="font-black underline" type="button" onClick={onRetry}>Retry</button></div>; }
function ErrorState({ onRetry }: { onRetry: () => void }) { return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><div className="rounded-lg border bg-white p-6 text-center shadow-sm"><AlertTriangle className="mx-auto text-red-600" /><h1 className="mt-3 text-xl font-black">Unable to load payer rules</h1><ActionButton label="Retry" onClick={onRetry} /></div></main>; }
function PageSkeleton() { return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-6xl space-y-4"><div className="h-28 animate-pulse rounded-lg bg-white" /><div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-lg bg-white" />)}</div><div className="h-96 animate-pulse rounded-lg bg-white" /></div></main>; }
function SkeletonRows() { return <div className="space-y-2">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}</div>; }

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500";

function splitList(value: string) { return value.split(",").map((item) => item.trim()).filter(Boolean); }
function dashList(values: string[]) { return values.length > 0 ? values.join(", ") : "-"; }
function labelize(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase()); }
function coverageLabel(status: CoverageStatus) { return status === "likely_covered" ? "Likely Covered" : status === "need_review" ? "Need Review" : "Not Covered"; }
function formatDate(value?: string | null) { if (!value) return "Not available"; return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function payerStatusTone(status: PayerStatus): Tone { return status === "active" ? "green" : status === "needs_review" ? "amber" : status === "draft" ? "gray" : status === "simulation" ? "purple" : "red"; }
function statusTone(status: ReadinessStatus): Tone { return status === "ready" ? "green" : status === "needs_review" || status === "pending_evidence" ? "amber" : "red"; }
function riskTone(risk: RiskLevel): Tone { return risk === "low" ? "green" : risk === "medium" ? "amber" : risk === "high" ? "red" : "purple"; }
