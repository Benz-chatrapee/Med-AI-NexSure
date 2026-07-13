"use client";

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  Activity,
  AlertTriangle,
  Bell,
  Boxes,
  BrainCircuit,
  ClipboardCheck,
  History,
  LayoutDashboard,
  ListPlus,
  PackageSearch,
  Pill,
  Plus,
  Printer,
  Save,
  ScrollText,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Table2,
  Trash2,
  Users,
  Warehouse,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { calculateStockReadiness, canEditPrescription, canSubmitPrescription, evaluatePrescriptionSafety } from "../domain/rules";
import type { MedicationOption, PrescriptionDetail, PrescriptionItem, PrescriptionUserRole, SafetyAlert, StockStatus } from "../domain/types";
import { useMedicationSearch, usePrescriptionMutations } from "../hooks/use-prescription";
import { prescriptionFormSchema, type PrescriptionFormValues } from "../schemas/prescription-schema";

const currentRole: PrescriptionUserRole = "doctor";

export function PrescriptionWorkspace({ prescription }: { prescription?: PrescriptionDetail }) {
  if (!prescription) {
    return <PrescriptionUnavailableState />;
  }

  return <PrescriptionWorkspaceContent prescription={prescription} />;
}

function PrescriptionWorkspaceContent({ prescription }: { prescription: PrescriptionDetail }) {
  const [saveState, setSaveState] = useState<"saved" | "unsaved" | "saving" | "failed">("saved");
  const [toast, setToast] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formSummary, setFormSummary] = useState<string[]>([]);
  const mutations = usePrescriptionMutations(prescription.visit.visitId);
  const form = useForm<PrescriptionFormValues>({
    defaultValues: { items: prescription.items, clinicalJustification: prescription.clinicalJustification },
    mode: "onChange",
  });
  const { fields, remove, replace } = useFieldArray({ control: form.control, name: "items" });
  const watchedItemsRaw = useWatch({ control: form.control, name: "items" });
  const watchedItems = useMemo(() => watchedItemsRaw ?? [], [watchedItemsRaw]);
  const watchedJustification = useWatch({ control: form.control, name: "clinicalJustification" }) ?? "";

  useEffect(() => {
    form.reset({ items: prescription.items, clinicalJustification: prescription.clinicalJustification });
  }, [form, prescription]);

  const alerts = useMemo(
    () => evaluatePrescriptionSafety({ patient: prescription.patient, items: watchedItems, inventory: prescription.inventory, clinicalJustification: watchedJustification }),
    [prescription.inventory, prescription.patient, watchedItems, watchedJustification],
  );
  const stock = useMemo(() => calculateStockReadiness(watchedItems, prescription.inventory), [prescription.inventory, watchedItems]);
  const canEdit = canEditPrescription(currentRole, prescription.status);
  const isMutating = mutations.saveDraft.isPending || mutations.submit.isPending;
  const decision = canSubmitPrescription({
    prescription: { ...prescription, items: watchedItems, clinicalJustification: watchedJustification },
    alerts,
    role: currentRole,
    isMutating,
  });

  function showMessage(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }

  function validateForm(): PrescriptionFormValues | null {
    const parsed = prescriptionFormSchema.safeParse(form.getValues());
    if (parsed.success) {
      setFormSummary([]);
      return parsed.data;
    }
    const messages = parsed.error.issues.map((issue) => issue.message);
    setFormSummary(messages);
    const first = parsed.error.issues[0];
    if (first?.path.length) {
      form.setFocus(first.path.join(".") as keyof PrescriptionFormValues);
    }
    return null;
  }

  async function onSaveDraft() {
    const data = validateForm();
    if (!data) return;
    setSaveState("saving");
    try {
      await mutations.saveDraft.mutateAsync(data);
      setSaveState("saved");
      showMessage("Draft saved. บันทึกฉบับร่างและ Audit Event แล้ว");
    } catch {
      setSaveState("failed");
      showMessage("Save failed. กรุณาลองใหม่อีกครั้ง");
    }
  }

  async function onSubmitConfirmed() {
    const data = validateForm();
    if (!data) return;
    if (!decision.ok) {
      setFormSummary(decision.reasons);
      return;
    }
    try {
      await mutations.submit.mutateAsync({ ...data, submittedByRole: currentRole });
      setShowConfirm(false);
      showMessage("Submitted to pharmacist review. ส่งให้เภสัชกรตรวจสอบแล้ว");
    } catch {
      showMessage("Submit failed. กรุณาลองใหม่อีกครั้ง");
    }
  }

  function addMedication() {
    const nextItem = { id: `item-${Date.now()}`, medicationId: "", medicationDisplayName: "", dosage: "", frequency: "", duration: "", quantity: 1, unit: "", instructions: "" };
    replace([...form.getValues("items"), nextItem]);
    setSaveState("unsaved");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950 lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <PrescriptionSidebar />
      <div className="min-w-0">
        <PrescriptionTopbar />
        <main className="mx-auto grid max-w-[1920px] gap-4 p-4 md:px-[30px] md:py-7 md:pb-10">
        <PageHeader
          prescription={prescription}
          saveState={saveState}
          decision={decision.reasons}
          onSave={onSaveDraft}
          onSubmit={() => setShowConfirm(true)}
          onAudit={() => document.getElementById("prescription-audit")?.scrollIntoView({ behavior: "smooth", block: "center" })}
          canSubmit={decision.ok}
          isMutating={isMutating}
        />

        <Workflow status={prescription.status} alerts={alerts} />
        <PatientContext prescription={prescription} />
        <KpiGrid itemCount={watchedItems.length} alerts={alerts} stockStatus={stock.label} prescriptionStatus={prescription.status} />

        <div className="mt-[3px] flex items-center justify-between">
          <h2 className="text-[13px] font-black uppercase tracking-[.08em] text-slate-600">Clinical Prescription Workspace</h2>
          <span className="text-xs text-slate-500">พื้นที่ทำงานหลักสำหรับแพทย์และเภสัชกร</span>
        </div>

        <div className="grid gap-[18px] xl:grid-cols-[minmax(0,1.72fr)_minmax(360px,.78fr)]">
          <section className="rounded-[15px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-[17px] md:flex-row md:items-start">
              <div>
                <h2 className="flex items-center gap-2 text-base font-black"><Table2 size={18} /> Medication Order Builder</h2>
                <p className="mt-1 text-xs text-slate-600">Build medication orders inline with real-time clinical safety and inventory validation.<br /><span lang="th">เพิ่มและแก้ไขรายการยาได้ในตารางเดียว พร้อมตรวจสอบข้อมูลแบบทันที</span></p>
              </div>
              <StatusBadge status="available">FEFO Enabled</StatusBadge>
            </div>

            {formSummary.length > 0 && (
              <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert" tabIndex={-1}>
                <strong>Submission needs attention</strong>
                <ul className="mt-2 list-disc pl-5">
                  {formSummary.map((message) => <li key={message}>{message}</li>)}
                </ul>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1280px] table-fixed border-separate border-spacing-0 text-sm">
                <colgroup>
                  <col className="w-[52px]" />
                  <col className="w-[240px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  <col className="w-[110px]" />
                  <col className="w-[80px]" />
                  <col className="w-[110px]" />
                  <col className="w-[240px]" />
                  <col className="w-[160px]" />
                  <col className="w-[64px]" />
                </colgroup>
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-[.06em] text-slate-600">
                    {["#", "Medication Search", "Dosage", "Frequency", "Duration", "Qty", "Unit", "Instructions", "Stock Status", "Actions"].map((head) => <th className="border-b border-slate-200 p-3" key={head} scope="col">{head}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <MedicationRow
                      canEdit={canEdit}
                      form={form}
                      index={index}
                      inventory={prescription.inventory[watchedItems[index]?.medicationId ?? ""]}
                      item={watchedItems[index]}
                      key={field.id}
                      onRemove={() => {
                        if (window.confirm("Remove this medication item? ข้อมูลในแถวนี้จะถูกลบ")) {
                          remove(index);
                          setSaveState("unsaved");
                        }
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sticky bottom-0 z-10 flex flex-col gap-3 rounded-b-[15px] border-t border-slate-200 bg-slate-50/95 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
              <Button className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-900 disabled:opacity-50" disabled={!canEdit} onClick={addMedication}>
                <Plus size={16} /> Add Medication / เพิ่มยา
              </Button>
              <p className="text-xs text-slate-600">Validation: required fields, quantity, stock readiness, and critical safety checks.</p>
            </div>
          </section>

          <aside className="grid content-start gap-4 xl:sticky xl:top-[196px]">
            <SafetyPanel alerts={alerts} form={form} canEdit={canEdit} />
            <StockPanel prescription={prescription} stock={stock.status} />
            <AuditTimeline prescription={prescription} />
          </aside>
        </div>
        </main>

      {showConfirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="submit-dialog-title">
          <section className="w-full max-w-lg rounded-[15px] bg-white p-5 shadow-2xl">
            <h2 className="text-xl font-black" id="submit-dialog-title">Submit this prescription for pharmacist review?</h2>
            <p className="mt-2 text-sm text-slate-600">After submission, editing may be restricted according to workflow status.</p>
            <div className="mt-4 grid gap-2 text-sm">
              <SummaryRow label="Medication items" value={String(watchedItems.length)} />
              <SummaryRow label="Safety alerts" value={String(alerts.filter((alert) => alert.severity !== "passed").length)} />
              <SummaryRow label="Warnings" value={String(alerts.filter((alert) => alert.severity === "warning").length)} />
              <SummaryRow label="Clinical justification" value={watchedJustification.trim() ? "Recorded" : "Not recorded"} />
              <SummaryRow label="Destination" value="Pharmacist Review Queue" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button className="rounded-lg border border-blue-900 bg-blue-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50" disabled={!decision.ok || mutations.submit.isPending} onClick={onSubmitConfirmed}>
                Confirm Submit
              </Button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl" aria-live="polite">{toast}</div>}
      </div>
    </div>
  );
}

function PrescriptionUnavailableState() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 text-slate-950">
      <section className="mx-auto max-w-2xl rounded-[15px] border border-slate-200 bg-white p-6 shadow-sm" role="status">
        <p className="text-xs font-black uppercase tracking-[.12em] text-blue-700">Prescription Unavailable</p>
        <h1 className="mt-2 text-2xl font-black">Prescription workspace is not ready</h1>
        <p className="mt-2 text-sm text-slate-600">ไม่พบข้อมูลใบสั่งยาสำหรับแสดงผล กรุณาเปิดจาก Visit หรือ Prescription Management route</p>
      </section>
    </main>
  );
}

function PrescriptionSidebar() {
  const navGroups = [
    {
      title: "Clinical Operations",
      items: [
        ["Dashboard", LayoutDashboard, false],
        ["Patients", Users, false],
        ["Visits", Stethoscope, false],
        ["Prescriptions", Pill, true],
      ],
    },
    {
      title: "Intelligence",
      items: [
        ["Claim Readiness", ShieldAlert, false],
        ["Inventory", PackageSearch, false],
        ["Audit & Compliance", ScrollText, false],
      ],
    },
  ] as const;

  return (
    <aside className="sticky top-0 hidden h-screen bg-gradient-to-b from-[#0F2A5F] to-[#102F6C] px-4 py-[22px] text-white lg:block">
      <div className="flex items-center gap-3 px-2 pb-6">
        <div className="grid h-[42px] w-[42px] place-items-center rounded-[13px] bg-gradient-to-br from-[#2563EB] to-[#38BDF8] shadow-[0_10px_28px_rgba(37,99,235,.3)]">
          <Activity size={22} />
        </div>
        <div>
          <div className="text-[15px] font-black">Med AI NexSure</div>
          <div className="mt-0.5 text-[11px] text-blue-200">Enterprise Health Intelligence</div>
        </div>
      </div>

      <nav className="grid gap-4" aria-label="Prescription workspace navigation">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-2 text-[11px] font-black uppercase tracking-[.12em] text-blue-300">{group.title}</p>
            <div className="grid gap-1">
              {group.items.map(([label, Icon, active]) => (
                <a
                  className={`flex items-center gap-3 rounded-[10px] px-3 py-[11px] text-sm font-semibold ${active ? "bg-white/15 text-white shadow-[inset_3px_0_0_#38BDF8]" : "text-blue-100 hover:bg-white/10"}`}
                  href="#"
                  key={label}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function PrescriptionTopbar() {
  return (
    <div className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex w-[min(540px,48vw)] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
        <Search size={17} />
        <span className="truncate">Search patient, visit, prescription, medication...</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 sm:inline-flex">
          <Sparkles size={13} /> AI Safety Active
        </span>
        <button aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-[10px] border border-slate-200 bg-white text-slate-600">
          <Bell size={17} />
        </button>
        <div className="grid h-[38px] w-[38px] place-items-center rounded-full bg-blue-100 text-sm font-black text-blue-700">DR</div>
      </div>
    </div>
  );
}

function PageHeader({ prescription, saveState, decision, onSave, onSubmit, onAudit, canSubmit, isMutating }: { prescription: PrescriptionDetail; saveState: string; decision: string[]; onSave: () => void; onSubmit: () => void; onAudit: () => void; canSubmit: boolean; isMutating: boolean }) {
  return (
    <header className="flex flex-col justify-between gap-6 bg-[#F8FAFC] lg:flex-row lg:items-start">
      <div>
        <p className="text-xs font-black uppercase tracking-[.12em] text-blue-700">Clinical Medication Workflow</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Prescription Management</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">Create, validate, review, and dispense medications with AI safety, FEFO inventory control, and audit-ready traceability.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{`Prescription ${prescription.prescriptionReference}`}</Badge>
          <Badge>{prescription.visit.visitType}</Badge>
          <Badge>{saveState === "saved" ? "Autosave Active" : saveState === "saving" ? "Saving" : saveState === "failed" ? "Save Failed" : "Unsaved Changes"}</Badge>
        </div>
        {!canSubmit && decision[0] && <p className="mt-3 text-sm font-semibold text-amber-700" aria-live="polite">Blocked: {decision[0]}</p>}
      </div>
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <Button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700"><Plus size={16} /> New Prescription</Button>
        <Button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-50" disabled={isMutating} onClick={onSave}><Save size={16} /> Save Draft</Button>
        <Button className="inline-flex items-center gap-2 rounded-lg border border-blue-900 bg-blue-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-50" disabled={!canSubmit || isMutating} onClick={onSubmit}><Send size={16} /> Submit for Dispense</Button>
        <Button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700" onClick={() => window.print()}><Printer size={16} /> Print</Button>
        <Button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700" onClick={onAudit}><History size={16} /> View Audit Trail</Button>
      </div>
    </header>
  );
}

function Workflow({ status, alerts }: { status: PrescriptionDetail["status"]; alerts: SafetyAlert[] }) {
  const hasBlock = alerts.some((alert) => alert.isBlocking);
  const steps = [
    ["Visit Context", "ยืนยันข้อมูลผู้ป่วยและ Visit"],
    ["Medication Order", "บันทึกรายการยาและวิธีใช้"],
    ["Safety & Stock Check", "ตรวจสอบความปลอดภัยและสต็อก"],
    ["Pharmacist Review", "รอเภสัชกรตรวจสอบและอนุมัติ"],
    ["Dispense & Complete", "จ่ายยาและบันทึก Audit Trail"],
  ] as const;
  return (
    <section className="rounded-[15px] border border-slate-200 bg-white px-[18px] py-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[.1em] text-blue-700">Prescription Workflow</p>
      <ol className="mt-3 grid gap-2 md:grid-cols-5">
        {steps.map(([step, helper], index) => {
          const state = index < 2 ? "completed" : index === 2 && hasBlock ? "blocked" : index === 2 && status === "draft" ? "active" : index === 3 && status === "submitted" ? "active" : "pending";
          return (
            <li className={`flex min-h-[68px] gap-2 rounded-[11px] border px-3 py-[11px] text-sm ${stateClass(state)}`} key={step}>
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[11px] font-black shadow-sm">{index + 1}</span>
              <span>
                <strong className="text-xs">{step}</strong>
                <p className="mt-1 text-[11px] leading-snug text-slate-500">{helper}</p>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function PatientContext({ prescription }: { prescription: PrescriptionDetail }) {
  const allergy = prescription.patient.allergies.map((item) => item.substance).join(", ") || "None documented";
  return (
    <section className="sticky top-[82px] z-20 overflow-hidden rounded-[15px] border border-l-4 border-l-blue-600 border-slate-200 bg-white shadow-sm">
      <div className="grid gap-px bg-slate-200 md:grid-cols-4 xl:grid-cols-[1.1fr_.9fr_.8fr_1.15fr_1.1fr_1.35fr_1.1fr]">
        {[
          ["Patient HN / เลขผู้ป่วย", prescription.patient.hn],
          ["Patient Name", prescription.patient.displayName],
          ["Age / Gender", `${prescription.patient.age ?? "-"} / ${prescription.patient.gender ?? "-"}`],
          ["Visit No.", prescription.visit.visitNumber],
          ["Chief Complaint", prescription.visit.chiefComplaint ?? "-"],
          ["Allergies / ประวัติแพ้ยา", allergy],
          ["Current Diagnosis", prescription.visit.diagnoses.map((dx) => `${dx.label} (${dx.code})`).join(", ")],
        ].map(([label, value]) => <div className="bg-white px-[17px] py-4" key={label}><p className="text-[11px] font-black uppercase tracking-[.07em] text-slate-500">{label}</p><p className={`mt-1 truncate text-sm font-black ${label.startsWith("Allergies") ? "text-red-700" : ""}`}>{value}</p></div>)}
      </div>
      <div className="flex items-center gap-2 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-800" role="alert"><ShieldAlert size={17} /> Patient Safety Notice: พบประวัติแพ้ Penicillin - verify all beta-lactam medications before submission.</div>
    </section>
  );
}

function KpiGrid({ itemCount, alerts, stockStatus, prescriptionStatus }: { itemCount: number; alerts: SafetyAlert[]; stockStatus: string; prescriptionStatus: string }) {
  const items = [
    ["Total Items", String(itemCount), "รายการยาที่สั่งทั้งหมด", ListPlus],
    ["Safety Alerts", String(alerts.filter((alert) => alert.severity !== "passed").length), "รายการที่ต้องดำเนินการ", AlertTriangle],
    ["Stock Availability", stockStatus, "FEFO and inventory readiness", Boxes],
    ["Prescription Status", prescriptionStatus, "Human workflow status", ClipboardCheck],
  ] as const;
  return <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{items.map(([label, value, helper, Icon]) => <article className="flex items-center justify-between rounded-[15px] border border-slate-200 bg-white p-4 shadow-sm" key={label}><div><p className="text-xs font-black uppercase tracking-[.07em] text-slate-500">{label}</p><strong className="mt-1 block text-2xl font-black text-slate-950">{value}</strong><p className="text-xs text-slate-500">{helper}</p></div><div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-900"><Icon size={21} /></div></article>)}</section>;
}

function MedicationRow({ canEdit, form, index, inventory, item, onRemove }: { canEdit: boolean; form: ReturnType<typeof useForm<PrescriptionFormValues>>; index: number; inventory: PrescriptionDetail["inventory"][string] | undefined; item: PrescriptionItem | undefined; onRemove: () => void }) {
  const [query, setQuery] = useState(item?.medicationDisplayName ?? "");
  const search = useMedicationSearch(query);
  const options = search.data ?? [];
  const stockLabel = inventory?.status ?? "unknown";
  return (
    <tr className="align-top">
      <td className="border-b border-slate-100 p-3 text-center font-black text-slate-500">{index + 1}</td>
      <td className="border-b border-slate-100 p-2">
        <MedicationSearch canEdit={canEdit} form={form} index={index} medicationName={item?.medicationDisplayName} options={options} query={query} setQuery={setQuery} />
      </td>
      <td className="border-b border-slate-100 p-2"><Input disabled={!canEdit} className={fieldClass} aria-label={`Dosage row ${index + 1}`} {...form.register(`items.${index}.dosage`)} /></td>
      <td className="border-b border-slate-100 p-2"><Input disabled={!canEdit} className={fieldClass} aria-label={`Frequency row ${index + 1}`} {...form.register(`items.${index}.frequency`)} /></td>
      <td className="border-b border-slate-100 p-2"><Input disabled={!canEdit} className={fieldClass} aria-label={`Duration row ${index + 1}`} {...form.register(`items.${index}.duration`)} /></td>
      <td className="border-b border-slate-100 p-2"><Input disabled={!canEdit} className={fieldClass} min={1} type="number" aria-label={`Quantity row ${index + 1}`} {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} /></td>
      <td className="border-b border-slate-100 p-2"><Input disabled={!canEdit} className={fieldClass} aria-label={`Unit row ${index + 1}`} {...form.register(`items.${index}.unit`)} /></td>
      <td className="border-b border-slate-100 p-2"><Input disabled={!canEdit} className={fieldClass} aria-label={`Instructions row ${index + 1}`} {...form.register(`items.${index}.instructions`)} /></td>
      <td className="border-b border-slate-100 p-2">
        <StatusBadge status={stockLabel}>{stockLabel.replaceAll("_", " ")}</StatusBadge>
        <p className="mt-1 text-xs text-slate-500">{inventory ? `${inventory.availableQuantity} available` : "Select medication"}</p>
      </td>
      <td className="border-b border-slate-100 p-2 text-center">
        <Button aria-label={`Remove ${item?.medicationDisplayName || "medication row"}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 disabled:opacity-40" disabled={!canEdit} onClick={onRemove}><Trash2 size={16} /></Button>
      </td>
    </tr>
  );
}

function MedicationSearch({ canEdit, form, index, medicationName, options, query, setQuery }: { canEdit: boolean; form: ReturnType<typeof useForm<PrescriptionFormValues>>; index: number; medicationName?: string; options: MedicationOption[]; query: string; setQuery: (value: string) => void }) {
  return (
    <div className="space-y-2">
      {medicationName ? <p className="break-words text-sm font-black text-slate-900">{medicationName}</p> : null}
      <Input className={fieldClass} disabled={!canEdit} list={`medication-options-${index}`} value={query} onChange={(event) => setQuery(event.target.value)} aria-label={`Medication search row ${index + 1}`} placeholder="Search medication" />
      <datalist id={`medication-options-${index}`}>
        {options.map((option) => <option key={option.id} value={option.displayName}>{option.genericName} {option.brandName ?? ""}</option>)}
      </datalist>
      <Button className="mt-1 rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-900 disabled:opacity-50" disabled={!canEdit} onClick={() => {
        const selected = options.find((option) => option.displayName === query) ?? options[0];
        if (!selected) return;
        form.setValue(`items.${index}.medicationId`, selected.id, { shouldDirty: true });
        form.setValue(`items.${index}.medicationDisplayName`, selected.displayName, { shouldDirty: true });
        form.setValue(`items.${index}.unit`, selected.dosageForm, { shouldDirty: true });
      }}>Select</Button>
    </div>
  );
}

const fieldClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";

function SafetyPanel({ alerts, form, canEdit }: { alerts: SafetyAlert[]; form: ReturnType<typeof useForm<PrescriptionFormValues>>; canEdit: boolean }) {
  const requiresJustification = alerts.some((alert) => alert.requiresJustification);
  const status = alerts.some((alert) => alert.isBlocking) ? "Submission Blocked" : alerts.some((alert) => alert.severity === "warning") ? "Action Required" : "Ready for Review";
  return (
    <section className="rounded-[15px] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-black"><BrainCircuit size={18} /> AI Drug Safety & Clinical Guardrails</h2>
          <p className="mt-1 text-xs text-slate-600">Decision support only — แพทย์และเภสัชกรต้องตรวจสอบก่อนยืนยันทุกครั้ง</p>
        </div>
        <StatusBadge status={status}>{status}</StatusBadge>
      </div>
      <div className="grid gap-2 p-4">
        {alerts.map((alert) => (
          <article className={`rounded-xl border p-3 text-sm ${alertClass(alert.severity)}`} key={alert.id} role={alert.severity === "critical" ? "alert" : undefined}>
            <div className="flex justify-between gap-3"><strong>{alert.title}</strong><StatusBadge status={alert.severity}>{alert.severity}</StatusBadge></div>
            <p className="mt-2 leading-relaxed">{alert.description}</p>
            {alert.requiresJustification ? (
              <div className="mt-3">
                <textarea className="min-h-24 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100" disabled={!canEdit} aria-describedby="clinical-justification-help" placeholder="Clinical justification required / กรุณาระบุเหตุผลทางคลินิก..." {...form.register("clinicalJustification")} />
                <p className="mt-2 text-xs text-slate-600" id="clinical-justification-help">{requiresJustification ? "Required for critical safety alert / ต้องระบุเหตุผลทางคลินิก" : "Optional rationale for pharmacist review"}</p>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function StockPanel({ prescription, stock }: { prescription: PrescriptionDetail; stock: StockStatus }) {
  const selected = Object.values(prescription.inventory)[0];
  return <section className="rounded-[15px] border border-slate-200 bg-white shadow-sm"><PanelHead icon={<Warehouse size={18} />} title="Stock Intelligence & FEFO Readiness" subtitle="Real-time batch availability, nearest expiry, and stock risk. / ตรวจสอบสต็อกและวันหมดอายุ" /><div className="grid grid-cols-2 gap-2 p-4 text-sm"><SummaryBox label="Current Stock" value={String(selected.currentStock)} /><SummaryBox label="Nearest Expiry" value={selected.selectedBatch?.expiryDays ? `${selected.selectedBatch.expiryDays} days` : "-"} /><SummaryBox label="Reorder Level" value={String(selected.reorderLevel)} /><SummaryBox label="Stock Risk" value={stock.replaceAll("_", " ")} /></div></section>;
}

function AuditTimeline({ prescription }: { prescription: PrescriptionDetail }) {
  return <section className="rounded-[15px] border border-slate-200 bg-white shadow-sm" id="prescription-audit"><PanelHead icon={<ClipboardCheck size={18} />} title="Pharmacist Review & Audit Timeline" subtitle="Immutable lifecycle events with actor and timestamp. / ติดตามทุกกิจกรรมเพื่อการตรวจสอบย้อนหลัง" /><div className="relative p-4 pl-9 before:absolute before:bottom-6 before:left-[22px] before:top-6 before:w-0.5 before:bg-blue-100">{prescription.auditEvents.length === 0 ? <p className="text-sm text-slate-500">No audit events recorded yet.</p> : prescription.auditEvents.map((event) => <article className="relative mb-[17px] text-sm last:mb-0 before:absolute before:-left-[22px] before:top-1 before:h-[11px] before:w-[11px] before:rounded-full before:bg-blue-600 before:shadow-[0_0_0_4px_#DBEAFE]" key={event.id}><strong>{humanAction(event.action)}</strong><p className="mt-1 text-slate-600">{event.actorName} - {event.actorRole} - {new Date(event.occurredAt).toLocaleString("en-GB")}</p><p className="mt-1 text-slate-500">{event.description}</p><code className="mt-1 block text-xs text-slate-400">{event.action}</code></article>)}</div></section>;
}

function PanelHead({ title, subtitle, icon }: { title: string; subtitle: string; icon?: React.ReactNode }) {
  return <div className="border-b border-slate-200 p-4"><h2 className="flex items-center gap-2 text-base font-black">{icon}{title}</h2><p className="mt-1 text-xs text-slate-600">{subtitle}</p></div>;
}

function Badge({ children }: { children: string }) {
  return <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-800">{children}</span>;
}

function StatusBadge({ children, status }: { children: string; status: string }) {
  const tone = status.includes("critical") || status.includes("out") || status.includes("insufficient") ? "border-red-200 bg-red-50 text-red-700" : status.includes("warning") || status.includes("near") || status.includes("low") ? "border-amber-200 bg-amber-50 text-amber-700" : status.includes("available") || status.includes("passed") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-700";
  return <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-black capitalize ${tone}`}>{children}</span>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0"><span className="text-slate-500">{label}</span><strong className="text-right capitalize">{value}</strong></div>;
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-slate-200 p-3"><p className="text-xs font-black uppercase text-slate-500">{label}</p><strong className="mt-1 block text-lg capitalize">{value}</strong></div>;
}

function stateClass(state: string) {
  if (state === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (state === "active") return "border-blue-200 bg-blue-50 text-blue-800";
  if (state === "blocked") return "border-red-200 bg-red-50 text-red-800";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function alertClass(severity: SafetyAlert["severity"]) {
  if (severity === "critical") return "border-red-200 bg-red-50 text-red-900";
  if (severity === "warning") return "border-amber-200 bg-amber-50 text-amber-900";
  if (severity === "passed") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  return "border-blue-200 bg-blue-50 text-blue-900";
}

function humanAction(action: string) {
  return action.split("_").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

