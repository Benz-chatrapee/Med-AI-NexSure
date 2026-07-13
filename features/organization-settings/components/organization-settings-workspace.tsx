"use client";

import { AlertTriangle, Bell, CheckCircle2, CircleDot, FileClock, HelpCircle, Lock, Plus, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type { FieldErrors, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLE_LABELS, SETTINGS_SECTIONS, type SettingsSectionId } from "../constants/organization-settings.constants";
import { useOrganizationSettings } from "../hooks/use-organization-settings";
import type { OrganizationRole, OrganizationSettings, PlatformCapability } from "../types/organization-settings.types";
import { formatConfigurationTimestamp, getCapabilityImpact, getChangedSections, getClaimWeightTotal, getFirstInvalidSection } from "../utils/organization-settings.utils";

type Workspace = ReturnType<typeof useOrganizationSettings>;
type Form = UseFormReturn<OrganizationSettings, unknown, OrganizationSettings>;

const input = "org-input";
const select = input;

export function OrganizationSettingsWorkspace() {
  const workspace = useOrganizationSettings();
  const { form, settingsQuery } = workspace;
  const [saveOpen, setSaveOpen] = useState(false);
  const [restoreVersion, setRestoreVersion] = useState<number | null>(null);
  const [capabilityImpact, setCapabilityImpact] = useState<PlatformCapability | null>(null);

  const changedSections = getChangedSections(form.formState.dirtyFields);

  if (settingsQuery.isLoading) return <OrganizationSettingsSkeleton />;
  if (settingsQuery.isError) return <OrganizationSettingsError onRetry={() => settingsQuery.refetch()} />;
  if (!settingsQuery.data) return <EmptyState />;

  async function requestSave() {
    const valid = await form.trigger();
    if (!valid) {
      workspace.setActiveSection(getFirstInvalidSection(form.formState.errors));
      workspace.setMessage("Please fix validation errors before saving.");
      return;
    }
    setSaveOpen(true);
  }

  return (
    <main className={`org-reference ${workspace.canEdit ? "" : "readonly"}`}>
        <EnterpriseSidebar />
        <div className="org-main">
          <Topbar role={workspace.role} setRole={workspace.setRole} />
          <div className="org-page">
            <Header workspace={workspace} />
            {workspace.message ? <div className="org-banner" role="status"><strong>{workspace.message}</strong></div> : null}
            {!workspace.canEdit ? <div className="org-banner warning" role="status">{workspace.permissions.readOnlyReason}</div> : null}
            <form className="org-settings-shell" aria-busy={workspace.updateMutation.isPending}>
              <SectionNav active={workspace.activeSection as SettingsSectionId} changedSections={changedSections} setActive={(id) => workspace.setActiveSection(id)} errors={form.formState.errors} />
              <div className="org-settings-content">
                <ActiveSection workspace={workspace} onAddRule={() => workspace.setMessage("Add Rule is a typed placeholder. Backend persistence is not available yet.")} onRestore={setRestoreVersion} onCapabilityImpact={setCapabilityImpact} />
              </div>
            </form>
          </div>
        </div>
      <SaveBar changedCount={changedSections.length} isDirty={form.formState.isDirty} isSubmitting={workspace.updateMutation.isPending} onDiscard={() => form.reset(settingsQuery.data)} onSave={requestSave} canEdit={workspace.canEdit} />
      {saveOpen ? <SaveDialog workspace={workspace} changedCount={changedSections.length} onClose={() => setSaveOpen(false)} /> : null}
      {restoreVersion ? <RestoreDialog workspace={workspace} version={restoreVersion} onClose={() => setRestoreVersion(null)} /> : null}
      {capabilityImpact ? <CapabilityDialog capability={capabilityImpact} capabilities={workspace.values.capabilities.items} onClose={() => setCapabilityImpact(null)} /> : null}
    </main>
  );
}

function EnterpriseSidebar() {
  const items = [
    { icon: "⌂", label: "Main Dashboard" },
    { icon: "♙", label: "Patient Management" },
    { icon: "▣", label: "Visit Management" },
    { icon: "◇", label: "Claim Readiness" },
    { icon: "⚙", label: "Admin Settings" },
  ];
  return (
    <aside className="org-sidebar" aria-label="Main navigation">
      <div className="org-brand">
        <div className="org-brand-mark">N</div>
        <div className="org-brand-copy"><div className="org-brand-title">Med AI NexSure</div><p className="org-brand-sub">Healthcare & Insurance Intelligence</p></div>
      </div>
      <nav className="org-global-nav" aria-label="Platform sections">
        <div className="org-global-label">Workspace</div>
        {items.map((item) => <a key={item.label} href={item.label === "Admin Settings" ? "/admin/settings/organization" : "#"} className={`org-global-item ${item.label === "Admin Settings" ? "active" : ""}`}><b>{item.icon}</b><span>{item.label}</span></a>)}
      </nav>
      <div className="org-sidebar-footer"><div className="org-user-card"><div className="org-avatar">BC</div><div><div className="text-[12.5px] font-semibold">Benz Chatrapee</div><div className="mt-0.5 text-[10.5px] text-blue-200">Organization Admin</div></div></div></div>
    </aside>
  );
}

function Topbar({ role, setRole }: { role: OrganizationRole; setRole: (role: OrganizationRole) => void }) {
  return (
    <header className="org-topbar">
      <div className="org-crumbs">Admin Settings / <strong>Organization Configuration</strong></div>
      <div className="org-top-actions">
        <select className="org-role-select" value={role} onChange={(event) => setRole(event.target.value as OrganizationRole)} aria-label="Role preview">
          {Object.entries(ROLE_LABELS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
        </select>
        <Button aria-label="Notifications" className="org-icon-btn"><Bell size={17} /></Button>
        <Button aria-label="Help" className="org-icon-btn"><HelpCircle size={17} /></Button>
      </div>
    </header>
  );
}

function Header({ workspace }: { workspace: Workspace }) {
  const metadata = workspace.values.metadata;
  return (
    <section className="org-page-header">
      <div>
        <p className="org-eyebrow">Enterprise Administration</p>
        <h1 className="org-page-title">Organization Configuration</h1>
        <p className="org-subtitle">กำหนดนโยบายและค่าเริ่มต้นระดับองค์กรสำหรับทุก Clinic, Hospital และ Operational Unit</p>
      </div>
      <div className="org-header-meta">
        <Badge tone="green"><CheckCircle2 size={14} /> Active</Badge>
        <Badge tone="blue"><FileClock size={14} /> Configuration v{metadata.version}</Badge>
        <Badge tone="slate"><CircleDot size={14} /> Last updated {formatConfigurationTimestamp(metadata.lastUpdatedAt)}</Badge>
      </div>
    </section>
  );
}

function SectionNav({ active, changedSections, setActive, errors }: { active: SettingsSectionId; changedSections: SettingsSectionId[]; setActive: (id: SettingsSectionId) => void; errors: FieldErrors<OrganizationSettings> }) {
  const invalid = new Set(Object.keys(errors).flatMap((key) => SETTINGS_SECTIONS.filter((section) => section.id === key || key.toLowerCase().includes(section.id)).map((section) => section.id)));
  return (
    <nav className="org-settings-nav" aria-label="Organization settings sections">
      {SETTINGS_SECTIONS.map((section) => (
        <button key={section.id} type="button" onClick={() => setActive(section.id)} className={active === section.id ? "active" : ""}>
          <span>{section.id === "capabilities" ? "Platform Capabilities" : section.title}</span>
          <span className="flex items-center gap-1">{invalid.has(section.id) ? <AlertTriangle size={14} className="text-red-600" /> : null}<span className={`org-nav-dot ${changedSections.includes(section.id) ? "dirty" : ""}`} aria-label={changedSections.includes(section.id) ? "Unsaved changes" : undefined} /></span>
        </button>
      ))}
    </nav>
  );
}

function ActiveSection({ workspace, onAddRule, onRestore, onCapabilityImpact }: { workspace: Workspace; onAddRule: () => void; onRestore: (version: number) => void; onCapabilityImpact: (capability: PlatformCapability) => void }) {
  const form = workspace.form;
  const disabled = !workspace.canEdit || workspace.updateMutation.isPending;
  switch (workspace.activeSection) {
    case "profile": return <ProfileSection form={form} disabled={disabled} />;
    case "dashboard": return <DashboardSection form={form} disabled={disabled} values={workspace.values} />;
    case "ai": return <AiSection form={form} disabled={disabled} aiEnabled={workspace.values.aiGovernance.enabled} />;
    case "claim": return <ClaimSection form={form} disabled={disabled} values={workspace.values} onAddRule={onAddRule} />;
    case "economic": return <EconomicSection form={form} disabled={disabled} />;
    case "workflow": return <WorkflowSection form={form} disabled={disabled} values={workspace.values} />;
    case "security": return <SecuritySection form={form} disabled={disabled} />;
    case "notifications": return <NotificationsSection form={form} disabled={disabled} />;
    case "compliance": return <ComplianceSection form={form} disabled={disabled} values={workspace.values} onRestore={onRestore} />;
    case "capabilities": return <CapabilitiesSection form={form} disabled={disabled} values={workspace.values} onCapabilityImpact={onCapabilityImpact} />;
    default: return null;
  }
}

function SectionCard({ title, thai, children, alert, badge, cardTitle, cardHelp, action }: { title: string; thai: string; children: React.ReactNode; alert?: React.ReactNode; badge?: React.ReactNode; cardTitle?: string; cardHelp?: string; action?: React.ReactNode }) {
  return <section aria-labelledby={title.replaceAll(" ", "-")}><div className="org-section-head"><div className="org-section-title-row"><h2 id={title.replaceAll(" ", "-")} className="org-section-title">{title}</h2>{badge}</div><p className="org-section-desc">{thai}</p></div>{alert}<div className="org-card"><div className="org-card-head"><div><div className="org-card-title">{cardTitle ?? title}</div>{cardHelp ? <div className="org-card-help">{cardHelp}</div> : null}</div>{action}</div><div className="org-card-body">{children}</div></div></section>;
}

function Field({ form, name, title, disabled, type = "text", help }: { form: Form; name: Parameters<Form["register"]>[0]; title: string; disabled: boolean; type?: string; help?: string }) {
  const error = name.split(".").reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), form.formState.errors) as { message?: string } | undefined;
  return <div className="org-field"><label>{title}</label><Input type={type} disabled={disabled} className={input} {...form.register(name)} aria-invalid={Boolean(error)} />{help ? <small className="org-help">{help}</small> : null}{error?.message ? <small className="org-error" role="alert">{error.message}</small> : null}</div>;
}

function Toggle({ form, name, title, disabled, help }: { form: Form; name: Parameters<Form["register"]>[0]; title: string; disabled: boolean; help?: string }) {
  return <div className="org-toggle-row"><div><div className="org-toggle-title">{title}</div>{help ? <div className="org-toggle-desc">{help}</div> : null}</div><label className="org-switch"><input type="checkbox" disabled={disabled} {...form.register(name)} /><span className="org-slider" /></label></div>;
}

function ProfileSection({ form, disabled }: { form: Form; disabled: boolean }) {
  return <SectionCard title="Organization Profile" thai="จัดการข้อมูลหลักขององค์กรและค่าเริ่มต้นที่ใช้ร่วมกันในทุก Clinic" badge={<Badge tone="green">Active</Badge>} cardTitle="Organization Identity" cardHelp="ข้อมูลอ้างอิงหลักสำหรับเอกสาร ระบบงาน และ Audit Trail" action={<Badge tone="blue">Organization Default</Badge>}><div className="org-grid two"><Field form={form} name="organizationProfile.organizationName" title="Organization Name" disabled={disabled} /><Field form={form} name="organizationProfile.organizationCode" title="Organization Code" disabled help="ไม่ควรเปลี่ยนหลังเริ่มมี Transaction" /><SelectField form={form} name="organizationProfile.organizationType" title="Organization Type" disabled={disabled} options={["clinic_group", "hospital", "insurer", "enterprise_network"]} /><SelectField form={form} name="organizationProfile.status" title="Status" disabled={disabled} options={["active", "implementation", "suspended"]} /><Field form={form} name="organizationProfile.registrationNumber" title="Registration Number" disabled={disabled} /><Field form={form} name="organizationProfile.taxId" title="Tax ID" disabled={disabled} /><Field form={form} name="organizationProfile.primaryContact" title="Primary Contact" disabled={disabled} /><Field form={form} name="organizationProfile.contactEmail" title="Contact Email" disabled={disabled} /><Field form={form} name="organizationProfile.phoneNumber" title="Phone Number" disabled={disabled} /><Field form={form} name="organizationProfile.logoFileName" title="Organization Logo" disabled={disabled} help="PNG, JPG หรือ SVG · สูงสุด 2 MB" /><Field form={form} name="organizationProfile.registeredOfficeAddress" title="Registered Office Address" disabled={disabled} /><Field form={form} name="organizationProfile.defaultTimezone" title="Default Timezone" disabled={disabled} /><SelectField form={form} name="organizationProfile.defaultLanguage" title="Default Language" disabled={disabled} options={["en", "th", "bilingual"]} /><SelectField form={form} name="organizationProfile.currency" title="Currency" disabled={disabled} options={["THB", "USD"]} /><SelectField form={form} name="organizationProfile.dateFormat" title="Date Format" disabled={disabled} options={["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"]} /></div></SectionCard>;
}

function SelectField({ form, name, title, disabled, options }: { form: Form; name: Parameters<Form["register"]>[0]; title: string; disabled: boolean; options: string[] }) {
  return <div className="org-field"><label>{title}</label><select disabled={disabled} className={select} {...form.register(name)}>{options.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select></div>;
}

function DashboardSection({ form, disabled, values }: { form: Form; disabled: boolean; values: OrganizationSettings }) {
  return <SectionCard title="Dashboard Configuration" thai="กำหนด KPI, Queue Snapshot และ Default Dashboard ที่ผู้บริหารเห็นเป็นค่าเริ่มต้น" cardTitle="Executive KPI Configuration" cardHelp="เลือก KPI ที่แสดงบน Dashboard และกำหนดลำดับการแสดงผล"><div className="org-grid two"><div>{values.dashboard.executiveKpis.map((kpi, index) => <div key={kpi.key}><Toggle form={form} name={`dashboard.executiveKpis.${index}.visible`} title={kpi.label} disabled={disabled} /><div className="org-grid two"><SelectField form={form} name={`dashboard.executiveKpis.${index}.comparison`} title="Comparison" disabled={disabled} options={["previous_day", "previous_week", "target", "none"]} /><Field form={form} name={`dashboard.executiveKpis.${index}.displayOrder`} title="Display Order" disabled={disabled} type="number" /></div></div>)}</div><div><h3 className="org-card-title">Live Preview</h3><div className="org-kpi-preview">{values.dashboard.executiveKpis.filter((item) => item.visible).sort((a, b) => a.displayOrder - b.displayOrder).map((item) => <div key={item.key} className="org-kpi"><div className="org-kpi-name">{item.label}</div><div className="org-kpi-value">--</div><p className="org-toggle-desc">{item.comparison.replaceAll("_", " ")}</p></div>)}</div></div></div><div className="org-card mt-[17px]"><div className="org-card-head"><div><div className="org-card-title">Operational Queue Snapshot</div><div className="org-card-help">ตั้งค่า Queue ที่แสดงในภาพรวมการปฏิบัติงาน</div></div></div><div className="org-card-body org-grid two">{values.dashboard.queueSnapshots.map((queue, index) => <div key={queue.key}><Toggle form={form} name={`dashboard.queueSnapshots.${index}.visible`} title={queue.label} disabled={disabled} /><div className="org-grid two"><Field form={form} name={`dashboard.queueSnapshots.${index}.attentionThreshold`} title="Attention Threshold" disabled={disabled} type="number" /><Field form={form} name={`dashboard.queueSnapshots.${index}.criticalThreshold`} title="Critical Threshold" disabled={disabled} type="number" /></div></div>)}</div></div></SectionCard>;
}

function AiSection({ form, disabled, aiEnabled }: { form: Form; disabled: boolean; aiEnabled: boolean }) {
  const dependentDisabled = disabled || !aiEnabled;
  return <SectionCard title="AI Clinical Governance" thai="กำหนดขอบเขตการใช้งาน AI ทางคลินิก เพื่อให้ AI เป็น Decision Support เท่านั้น" cardTitle="Clinical AI Policy" cardHelp="AI ทุกผลลัพธ์ต้องมี Explainability, Confidence และ Human Review ตามระดับความเสี่ยง" alert={<Alert tone="blue" text="AI output is decision support only and must not independently finalize diagnosis, sign SOAP notes, issue medical certificates, or replace authorized medical personnel." />}><div><Toggle form={form} name="aiGovernance.enabled" title="AI Clinical master switch" disabled={disabled} /><Toggle form={form} name="aiGovernance.clinicalSummary" title="AI Clinical Summary" disabled={dependentDisabled} /><Toggle form={form} name="aiGovernance.icdRecommendation" title="AI ICD-10 Recommendation" disabled={dependentDisabled} /><Toggle form={form} name="aiGovernance.differentialDiagnosisInsight" title="Differential Diagnosis Insight" disabled={dependentDisabled} /><Toggle form={form} name="aiGovernance.explainabilitySourceContext" title="AI Explainability and Source Context" disabled={dependentDisabled} /><Toggle form={form} name="aiGovernance.mandatoryHumanReview" title="Mandatory Human Review" disabled help="Protected policy: cannot be disabled." /><div className="org-grid three"><Field form={form} name="aiGovernance.minimumConfidenceThreshold" title="Minimum AI Confidence Threshold" disabled={dependentDisabled} type="number" /><Field form={form} name="aiGovernance.approvedModelVersion" title="Approved AI Model Version" disabled={dependentDisabled} /><Field form={form} name="aiGovernance.effectiveDate" title="Effective Date" disabled={dependentDisabled} type="date" /></div><SelectField form={form} name="aiGovernance.clinicOverridePolicy" title="Clinic Override policy" disabled={dependentDisabled} options={["not_allowed", "requires_approval", "allowed_with_audit"]} /></div></SectionCard>;
}

function ClaimSection({ form, disabled, values, onAddRule }: { form: Form; disabled: boolean; values: OrganizationSettings; onAddRule: () => void }) {
  const total = getClaimWeightTotal(values);
  return <SectionCard title="Claim Readiness Policy" thai="กำหนด Scoring Model, Threshold และ Validation Rule สำหรับ Claim Readiness" cardTitle="Claim Readiness Scoring Model" cardHelp="น้ำหนักรวมต้องเท่ากับ 100% เพื่อป้องกันการคำนวณคะแนนผิดพลาด" action={<Badge tone={total === 100 ? "green" : "red"}>{total}%</Badge>}><div className="org-grid two">{values.claimReadiness.scoringModel.map((item, index) => <Field key={item.key} form={form} name={`claimReadiness.scoringModel.${index}.weight`} title={item.label} disabled={disabled} type="number" />)}</div><div className="org-grid three mt-[17px]">{values.claimReadiness.thresholds.map((item, index) => <div key={item.key}><h3 className="org-card-title">{item.label}</h3><Field form={form} name={`claimReadiness.thresholds.${index}.minimum`} title="Minimum" disabled={disabled} type="number" /><Field form={form} name={`claimReadiness.thresholds.${index}.maximum`} title="Maximum" disabled={disabled} type="number" /></div>)}</div><Toggle form={form} name="claimReadiness.recalculateActiveCases" title="Recalculate Active Cases" disabled={disabled} /><div className="mt-4 overflow-x-auto"><table className="org-mini-table"><thead><tr><th>Rule</th><th>Severity</th><th>Scope</th></tr></thead><tbody>{values.claimReadiness.validationRules.map((rule) => <tr key={rule.id}><td><b>{rule.name}</b></td><td>{rule.severity}</td><td>{rule.scope}</td></tr>)}</tbody></table></div><Button disabled={disabled} onClick={onAddRule} className="org-ghost-btn mt-4"><Plus size={16} /> Add Rule</Button></SectionCard>;
}

function EconomicSection({ form, disabled }: { form: Form; disabled: boolean }) {
  return <SectionCard title="Economic Intelligence" thai="กำหนด Cost Benchmark และ Deviation Policy ระดับองค์กร" cardTitle="Economic Benchmark Policy" cardHelp="ใช้เพื่อแจ้งเตือนความเบี่ยงเบนของต้นทุน ไม่ใช่การปฏิเสธการรักษาหรือ Claim อัตโนมัติ" alert={<Alert tone="amber" text="Cost alerts are decision-support signals and must not automatically deny treatment or claims." />}><div className="org-grid two"><Toggle form={form} name="economicIntelligence.enabled" title="Economic Intelligence master switch" disabled={disabled} /><Toggle form={form} name="economicIntelligence.requireJustificationAboveThreshold" title="Require Justification above threshold" disabled={disabled} /><Field form={form} name="economicIntelligence.expectedCostMinimum" title="Expected Cost Minimum" disabled={disabled} type="number" /><Field form={form} name="economicIntelligence.expectedCostMaximum" title="Expected Cost Maximum" disabled={disabled} type="number" /><SelectField form={form} name="economicIntelligence.benchmarkScope" title="Benchmark Scope" disabled={disabled} options={["clinic", "hospital", "payer", "national"]} /><Field form={form} name="economicIntelligence.deviationAlertPercent" title="Deviation Alert %" disabled={disabled} type="number" /></div></SectionCard>;
}

function WorkflowSection({ form, disabled, values }: { form: Form; disabled: boolean; values: OrganizationSettings }) {
  return <SectionCard title="Clinical Workflow" thai="กำหนด Workflow State และ Transition Guardrail ระดับองค์กร" cardTitle="Default Visit Workflow" cardHelp="Core Clinical Status ไม่ควรถูกแก้ไขโดยไม่มี Change Control และ Audit Trail"><div className="overflow-x-auto"><ol className="org-status-flow">{values.clinicalWorkflow.statuses.map((status) => <li key={status} className="flex items-center gap-2"><span className="org-flow-step">{status}</span><span className="org-flow-arrow">→</span></li>)}</ol></div><div className="mt-5"><Toggle form={form} name="clinicalWorkflow.allowClinicOverride" title="Allow Clinic Override" disabled={disabled} /><Toggle form={form} name="clinicalWorkflow.requireReasonForBackwardTransition" title="Require reason for backward transition" disabled={disabled} /><Toggle form={form} name="clinicalWorkflow.allowApprovedAutoTransitionRules" title="Allow approved auto-transition rules" disabled={disabled} /></div><Alert tone="blue" text="Core clinical statuses remain protected. Backward transitions require a reason and audit entry; critical transitions require human action." /></SectionCard>;
}

function SecuritySection({ form, disabled }: { form: Form; disabled: boolean }) {
  const rows = form.getValues("security.roleMatrix");
  return <SectionCard title="Security & Access Control" thai="กำหนด Security Baseline และ Role Permission Matrix ระดับองค์กร" cardTitle="Security Policy" cardHelp="Sensitive security changes require Change Reason and Audit Log" alert={<Alert tone="red" text="Security policy changes require a change reason and server-side authorization. UI read-only mode is not sufficient security." />}><div className="org-grid three"><Field form={form} name="security.sessionTimeoutMinutes" title="Session Timeout" disabled={disabled} type="number" /><Field form={form} name="security.maximumLoginAttempts" title="Maximum Login Attempts" disabled={disabled} type="number" /><Field form={form} name="security.accountLockoutDurationMinutes" title="Account Lockout Duration" disabled={disabled} type="number" /><Field form={form} name="security.passwordMinimumLength" title="Password Minimum Length" disabled={disabled} type="number" /><Toggle form={form} name="security.requireMfaForPrivilegedRoles" title="Require MFA for privileged roles" disabled={disabled} /><Toggle form={form} name="security.forceLogoutAfterPolicyChange" title="Force logout all sessions after policy change" disabled={disabled} /></div><div className="org-field mt-4"><label>Security Change Reason</label><textarea disabled={disabled} className={input} {...form.register("security.changeReason")} /></div><div className="mt-4 overflow-x-auto"><table className="org-mini-table"><thead><tr>{["Role", "Settings", "AI", "Claim", "Security", "Audit"].map((head) => <th key={head}>{head}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.role}><td><b>{row.role}</b></td><td>{row.settings}</td><td>{row.ai}</td><td>{row.claim}</td><td>{row.security}</td><td>{row.audit}</td></tr>)}</tbody></table></div></SectionCard>;
}

function NotificationsSection({ form, disabled }: { form: Form; disabled: boolean }) {
  const alerts = form.getValues("notifications.alerts");
  return <SectionCard title="Notification Policy" thai="กำหนด Event Trigger, Delivery Channel และ Recipient Scope ระดับองค์กร" cardTitle="Operational & Risk Alerts" cardHelp="In-app Notification เป็นช่องทางหลักสำหรับเหตุการณ์สำคัญ"><div>{alerts.map((alertItem, index) => <Toggle key={alertItem.key} form={form} name={`notifications.alerts.${index}.enabled`} title={alertItem.label} disabled={disabled} />)}</div><div className="org-card mt-[17px]"><div className="org-card-head"><div><div className="org-card-title">Notification Delivery Preferences</div></div></div><div className="org-card-body org-grid two"><SelectField form={form} name="notifications.defaultChannel" title="Default Channel" disabled={disabled} options={["email", "in_app", "sms", "webhook"]} /><SelectField form={form} name="notifications.digestSchedule" title="Digest Schedule" disabled={disabled} options={["realtime", "hourly", "daily"]} /></div></div></SectionCard>;
}

function ComplianceSection({ form, disabled, values, onRestore }: { form: Form; disabled: boolean; values: OrganizationSettings; onRestore: (version: number) => void }) {
  return <SectionCard title="Audit & Compliance" thai="กำหนด Audit Trail, Data Retention และ PDPA Governance เพื่อรองรับการตรวจสอบย้อนหลัง" cardTitle="Data Retention & Privacy Policy" cardHelp="Retention Policy ต้องสอดคล้องกับกฎหมาย นโยบายองค์กร และ Infrastructure Standard"><div className="org-grid two"><Field form={form} name="compliance.auditLogRetentionDays" title="Audit Log Retention" disabled={disabled} type="number" /><Field form={form} name="compliance.clinicalRecordRetentionYears" title="Clinical Record Retention" disabled={disabled} type="number" /><Field form={form} name="compliance.configurationVersionRetention" title="Configuration Version Retention" disabled={disabled} type="number" /><Field form={form} name="compliance.pdpaDataSubjectRequestSlaDays" title="PDPA Data Subject Request SLA" disabled={disabled} type="number" /></div><div className="org-card mt-[17px]"><div className="org-card-head"><div><div className="org-card-title">Configuration Version History</div><div className="org-card-help">Append-only Audit Trail · Version เดิมจะไม่ถูกลบหรือแก้ไขย้อนหลัง</div></div><Button disabled={disabled} onClick={() => onRestore(values.compliance.versionHistory[1]?.version ?? values.metadata.version)} className="org-ghost-btn">Restore Version</Button></div><div className="org-card-body"><div className="org-timeline">{values.compliance.versionHistory.map((version) => <div key={`${version.version}-${version.activatedAt}`} className="org-event"><div className="org-event-title">Configuration v{version.version} activated</div><div className="org-event-meta">{version.actorName} · {version.actorRole} · {formatConfigurationTimestamp(version.activatedAt)} · {version.changeSummary}</div></div>)}</div></div></div></SectionCard>;
}

function CapabilitiesSection({ form, disabled, values, onCapabilityImpact }: { form: Form; disabled: boolean; values: OrganizationSettings; onCapabilityImpact: (capability: PlatformCapability) => void }) {
  return <section aria-labelledby="Platform-Capability-Management"><div className="org-section-head"><h2 id="Platform-Capability-Management" className="org-section-title">Platform Capability Management</h2><p className="org-section-desc">บริหาร Enterprise Capabilities ระดับองค์กร พร้อมตรวจสอบ Dependency และผลกระทบก่อนเปลี่ยนแปลง</p></div><div className="org-feature-grid">{values.capabilities.items.map((capability, index) => <div key={capability.key} className="org-feature-card"><div className="org-feature-top"><div><b>{capability.label}</b><div className="org-toggle-desc">{capability.usedBy.length ? `Used by ${capability.usedBy.join(", ")}` : "Organization-wide capability"}</div></div><label className="org-switch"><input type="checkbox" disabled={disabled || capability.locked} checked={capability.enabled} onChange={(event) => { if (!event.target.checked && getCapabilityImpact(capability, values.capabilities.items).length > 0) onCapabilityImpact(capability); form.setValue(`capabilities.items.${index}.enabled`, event.target.checked, { shouldDirty: true, shouldValidate: true }); }} aria-label={`${capability.label} enabled`} /><span className="org-slider" /></label></div><div className="org-dep">{capability.locked ? "Critical feature cannot be disabled" : capability.dependencies.length ? `Dependency: ${capability.dependencies.join(", ")}` : "Dependency: None"}</div>{capability.locked ? <Badge tone="blue"><Lock size={13} /> Cannot be disabled</Badge> : null}</div>)}</div></section>;
}

function SaveBar({ changedCount, isDirty, isSubmitting, onDiscard, onSave, canEdit }: { changedCount: number; isDirty: boolean; isSubmitting: boolean; onDiscard: () => void; onSave: () => void; canEdit: boolean }) {
  return <div className="org-sticky-save"><div className="org-save-info"><span className={`org-unsaved-dot ${isDirty ? "on" : ""}`} /><strong>{isDirty ? `${changedCount} configuration section${changedCount === 1 ? "" : "s"} pending review` : "All changes saved"}</strong><span>Configuration will be validated before activation.</span></div><div className="org-save-actions"><Button disabled={!isDirty || isSubmitting || !canEdit} onClick={onDiscard} className="org-ghost-btn">Discard Changes</Button><Button disabled={!isDirty || isSubmitting || !canEdit} onClick={onSave} className="org-primary-btn">Save Changes</Button></div></div>;
}

function SaveDialog({ workspace, changedCount, onClose }: { workspace: Workspace; changedCount: number; onClose: () => void }) {
  const [reason, setReason] = useState("");
  return <Dialog title="Review Configuration Changes" description="ตรวจสอบรายละเอียดก่อนสร้าง Configuration Version และนำค่าใหม่ไปใช้งาน" onClose={onClose}><p className="org-subtitle">Changed sections: <strong>{changedCount}</strong>. Affected Scope: Organization Default · All authorized Clinics.</p><div className="org-field mt-4"><label>Change Reason</label><textarea className={input} value={reason} onChange={(event) => setReason(event.target.value)} autoFocus /></div><div className="org-modal-actions"><Button className="org-ghost-btn" onClick={onClose}>Cancel</Button><Button disabled={!reason.trim() || workspace.updateMutation.isPending} className="org-primary-btn" onClick={async () => { await workspace.updateMutation.mutateAsync({ settings: workspace.form.getValues(), changeReason: reason }); onClose(); }}>Confirm & Activate</Button></div></Dialog>;
}

function RestoreDialog({ workspace, version, onClose }: { workspace: Workspace; version: number; onClose: () => void }) {
  const [reason, setReason] = useState("");
  return <Dialog title="Restore Previous Configuration" description={`Restore v${version} as a new configuration version.`} onClose={onClose}><Alert tone="amber" text="ระบบจะสร้าง Configuration Version ใหม่จากค่าที่เลือก โดยไม่ลบ Version History เดิม" /><div className="org-field mt-4"><label>Change Reason</label><textarea className={input} value={reason} onChange={(event) => setReason(event.target.value)} autoFocus /></div><div className="org-modal-actions"><Button className="org-ghost-btn" onClick={onClose}>Cancel</Button><Button disabled={!reason.trim() || workspace.restoreMutation.isPending} className="org-primary-btn" onClick={async () => { await workspace.restoreMutation.mutateAsync({ sourceVersion: version, changeReason: reason }); onClose(); }}>Restore as New Version</Button></div></Dialog>;
}

function CapabilityDialog({ capability, capabilities, onClose }: { capability: PlatformCapability; capabilities: PlatformCapability[]; onClose: () => void }) {
  const impacted = useMemo(() => getCapabilityImpact(capability, capabilities), [capability, capabilities]);
  return <Dialog title={`Disable ${capability.label}?`} description="Capability Dependency Impact" onClose={onClose}><Alert tone="red" text="Dependent capabilities may lose functionality. Historical data will be preserved and nothing is silently disabled." /><ul className="mt-3 space-y-2">{impacted.map((item) => <li key={item.key} className="org-banner danger mb-0" role="listitem">{item.label}</li>)}</ul><div className="org-modal-actions"><Button className="org-ghost-btn" onClick={onClose}>Close</Button></div></Dialog>;
}

function Dialog({ title, description, children, onClose }: { title: string; description: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="org-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description"><div className="org-modal"><div className="org-modal-head"><div className="flex items-start justify-between gap-3"><div><h3 id="dialog-title">{title}</h3><p id="dialog-description" className="org-card-help">{description}</p></div><Button aria-label="Close dialog" className="org-icon-btn" onClick={onClose}>×</Button></div></div><div className="org-modal-body">{children}</div></div></div>;
}

function Alert({ tone, text }: { tone: "blue" | "amber" | "red"; text: string }) {
  const classes = tone === "red" ? "danger" : tone === "amber" ? "warning" : "";
  return <div className={`org-banner ${classes}`} role="alert"><AlertTriangle size={17} className="mt-0.5 shrink-0" /> {text}</div>;
}

function Badge({ tone, children }: { tone: "blue" | "green" | "slate" | "red"; children: React.ReactNode }) {
  const classes = tone === "green" ? "success" : tone === "red" ? "danger" : tone === "blue" ? "info" : "neutral";
  return <span className={`org-badge ${classes}`}>{children}</span>;
}

export function OrganizationSettingsSkeleton() {
  return <main className="min-h-screen bg-[#F8FAFC] p-6" aria-busy="true"><div className="mb-6 h-20 animate-pulse rounded-lg bg-slate-200" /><div className="grid gap-5 lg:grid-cols-[280px_1fr]"><div className="h-[620px] animate-pulse rounded-lg bg-slate-200" /><div className="h-[620px] animate-pulse rounded-lg bg-slate-200" /></div></main>;
}

export function OrganizationSettingsError({ onRetry }: { onRetry: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[#F8FAFC] p-6"><section className="max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm"><ShieldCheck className="mx-auto text-red-600" /><h1 className="mt-3 text-xl font-black text-[#0F2A5F]">Unable to load organization settings</h1><p className="mt-2 text-sm text-slate-600">Please retry. If this continues, verify authorization and service availability.</p><Button className="org-primary-btn mt-4" onClick={onRetry}>Retry</Button></section></main>;
}

function EmptyState() {
  return <main className="grid min-h-screen place-items-center bg-[#F8FAFC] p-6"><section className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm"><SlidersHorizontal className="mx-auto text-blue-700" /><h1 className="mt-3 text-xl font-black text-[#0F2A5F]">No configuration found</h1><p className="mt-2 text-sm text-slate-600">Create an initial organization configuration through the backend setup workflow.</p></section></main>;
}
