"use client";

import { useMemo, useState } from "react";

type SafetyLevel = "safe" | "warning" | "critical";

type Medication = {
  id: number;
  drugName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  quantity: string;
};

const agentCards = [
  {
    name: "Orchestrator",
    role: "Classifies request, delegates work, merges agent outputs.",
    state: "Running",
    tone: "border-t-[#2563EB]",
    pill: "bg-[#EFF6FF] text-[#1D4ED8]",
  },
  {
    name: "Clinical Safety",
    role: "Checks allergy, duplicate drug, interaction, and dose risk.",
    state: "Ready",
    tone: "border-t-[#059669]",
    pill: "bg-[#ECFDF5] text-[#047857]",
  },
  {
    name: "Claim Readiness",
    role: "Validates medication evidence against claim workflow.",
    state: "Ready",
    tone: "border-t-[#059669]",
    pill: "bg-[#ECFDF5] text-[#047857]",
  },
  {
    name: "Pharmacist Review",
    role: "Receives warning or override cases for human review.",
    state: "On Demand",
    tone: "border-t-[#D97706]",
    pill: "bg-[#FFFBEB] text-[#B45309]",
  },
  {
    name: "Compliance Guard",
    role: "Checks safety boundaries, PDPA posture, and governance.",
    state: "Monitoring",
    tone: "border-t-[#059669]",
    pill: "bg-[#ECFDF5] text-[#047857]",
  },
  {
    name: "Audit Agent",
    role: "Records actor, reason, timestamp, before and after.",
    state: "Enabled",
    tone: "border-t-[#059669]",
    pill: "bg-[#ECFDF5] text-[#047857]",
  },
];

const patientContext = [
  ["HN", "HN24000021"],
  ["Name", "Somchai Jaidee"],
  ["Age", "52 ปี"],
  ["Allergy", "Penicillin"],
  ["Diagnosis", "J18.9"],
  ["Visit Type", "OPD"],
  ["Payer", "AIA"],
  ["Claim Type", "Health Rider"],
];

const initialMedication: Medication = {
  id: 1,
  drugName: "",
  genericName: "",
  dosage: "",
  frequency: "",
  quantity: "",
};

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function ShellCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={classNames("rounded-[14px] border border-[#D8E4F2] bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,.06)]", className)}>
      {children}
    </section>
  );
}

function StatusChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-[12px] py-[7px] text-[12px] font-extrabold text-[#1E3A8A]">
      {children}
    </span>
  );
}

function getSafetyResult(medications: Medication[], hasJustification: boolean) {
  const issues: string[] = [];
  let level: SafetyLevel = "safe";
  let hasCriticalIssue = false;
  const normalized = medications.map((medication) => ({
    drugName: medication.drugName.trim().toLowerCase(),
    genericName: medication.genericName.trim().toLowerCase(),
  }));

  normalized.forEach((drug, index) => {
    const text = `${drug.drugName} ${drug.genericName}`;
    if (text.includes("penicillin")) {
      hasCriticalIssue = true;
      issues.push("Critical: ผู้ป่วยมีประวัติแพ้ Penicillin ห้าม Submit");
    }

    const duplicate = normalized.findIndex((item, otherIndex) => otherIndex !== index && item.drugName && item.drugName === drug.drugName);
    if (duplicate !== -1) {
      hasCriticalIssue = true;
      issues.push(`Critical: พบรายการยาซ้ำ ${drug.drugName}`);
    }
  });

  if (hasCriticalIssue) {
    level = "critical";
  }

  const hasWarfarin = normalized.some((drug) => drug.drugName.includes("warfarin"));
  const hasNsaid = normalized.some((drug) => drug.drugName.includes("ibuprofen") || drug.drugName.includes("diclofenac"));

  if (hasWarfarin && hasNsaid && !hasCriticalIssue) {
    level = "warning";
    issues.push("Warning: พบ Interaction ระหว่าง Warfarin และ NSAIDs ต้องระบุเหตุผล");
  }

  return { level, issues, canSubmit: level === "safe" || (level === "warning" && hasJustification) };
}

export function PrescriptionManagementPage() {
  const [medications, setMedications] = useState<Medication[]>([initialMedication]);
  const [hasJustification, setHasJustification] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [auditItems, setAuditItems] = useState([
    {
      title: "10:22 Prescription workspace opened",
      detail: "By Dr. Benz · Audit enabled",
      tone: "border-[#2563EB]",
    },
  ]);

  const safety = useMemo(() => getSafetyResult(medications, hasJustification), [medications, hasJustification]);

  const safetyTone = {
    safe: {
      card: "border-[#059669]/25 bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5] text-[#065F46]",
      title: "Safe to Prescribe",
      summary: "ไม่พบความเสี่ยงสำคัญ",
      badge: "SAFE",
      badgeClass: "border-[#059669] text-[#059669]",
      kpi: "Safe",
      review: "Ready",
      reviewClass: "text-[#1E3A8A]",
    },
    warning: {
      card: "border-[#D97706]/30 bg-[#FFFBEB] text-[#92400E]",
      title: "Warning - Review Required",
      summary: "ต้องระบุเหตุผลหรือส่ง Pharmacist Review",
      badge: "WARNING",
      badgeClass: "border-[#D97706] text-[#D97706]",
      kpi: "Warning",
      review: "Needs Review",
      reviewClass: "text-[#D97706]",
    },
    critical: {
      card: "border-[#DC2626]/30 bg-[#FEF2F2] text-[#991B1B]",
      title: "Critical Safety Risk",
      summary: "ห้าม Submit จนกว่าจะปรับรายการยา",
      badge: "CRITICAL",
      badgeClass: "border-[#DC2626] text-[#DC2626]",
      kpi: "Critical",
      review: "Blocked",
      reviewClass: "text-[#DC2626]",
    },
  }[safety.level];

  function updateMedication(id: number, key: keyof Medication, value: string) {
    setHasJustification(false);
    setMedications((current) => current.map((medication) => (medication.id === id ? { ...medication, [key]: value } : medication)));
  }

  function addMedication() {
    setMedications((current) => [
      ...current,
      {
        ...initialMedication,
        id: Date.now(),
      },
    ]);
  }

  function removeMedication(id: number) {
    setHasJustification(false);
    setMedications((current) => (current.length === 1 ? current : current.filter((medication) => medication.id !== id)));
  }

  function saveJustification() {
    setHasJustification(true);
    setShowModal(false);
    setAuditItems((current) => [
      ...current,
      {
        title: "10:27 Clinical justification added",
        detail: "By Dr. Benz · Warning override recorded",
        tone: "border-[#D97706]",
      },
    ]);
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-b from-[#F8FAFC] via-[#EEF3F8] to-[#E8EEF6] text-[#0F172A]">
      <aside className="sticky top-0 hidden h-screen w-[292px] min-w-[292px] overflow-auto bg-gradient-to-b from-[#082457] via-[#0F2A5F] to-[#10213F] p-[24px] text-white shadow-[12px_0_36px_rgba(15,42,95,.18)] lg:block">
        <div className="mb-[28px] border-b border-white/15 pb-[22px]">
          <p className="m-0 text-[12px] font-extrabold uppercase tracking-[.14em] text-[#7DD3FC]">Med AI NexSure</p>
          <h1 className="mt-[8px] text-[20px] font-extrabold leading-tight">Healthcare Intelligence</h1>
        </div>

        <nav className="grid gap-[8px] text-[14px]">
          {["Orchestrator", "Clinical AI Agent", "Prescription Agent", "Claim Readiness Agent", "Evidence Package Agent", "Compliance Guard", "Audit Agent"].map((item) => (
            <div
              key={item}
              className={classNames(
                "rounded-[12px] border border-transparent px-[16px] py-[12px] text-[#D9E8FF]",
                item === "Orchestrator" && "border-[#7DD3FC]/25 bg-white/10 font-extrabold text-white shadow-[inset_3px_0_0_#38BDF8]",
              )}
            >
              {item}
            </div>
          ))}
        </nav>

        <div className="mt-[22px] rounded-[14px] border border-[#7DD3FC]/20 bg-white/10 p-[16px]">
          <p className="m-0 text-[12px] font-extrabold text-[#BFDBFE]">Agent Frontend</p>
          <p className="mt-[6px] text-[12px] leading-relaxed text-[#BFDBFE]">
            Every action routes through the Orchestrator, then delegates to specialist agents with audit and human review.
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-[20px] lg:p-[24px]">
        <div className="grid gap-[20px]">
          <ShellCard className="flex flex-col justify-between gap-[14px] p-[18px] md:flex-row md:items-center">
            <div>
              <div className="text-[13px] font-black uppercase tracking-[.08em] text-[#1E3A8A]">Enterprise AI Orchestrator</div>
              <p className="mt-[4px] text-[13px] text-[#64748B]">Agent frontend for prescription safety, claim evidence, pharmacist review, and audit governance</p>
            </div>
            <div className="flex flex-wrap gap-[10px]">
              <StatusChip>Route: Patient / Visit / Prescription</StatusChip>
              <StatusChip>Human-in-the-loop</StatusChip>
              <StatusChip>Audit: Enabled</StatusChip>
            </div>
          </ShellCard>

          <ShellCard className="border-[#B7D4F8] bg-gradient-to-br from-white via-[#F8FBFF] to-[#EEF6FF] p-[24px]">
            <div className="text-[12px] font-black uppercase tracking-[.04em] text-[#2563EB]">Orchestrator / Agent Frontend / EPIC 9</div>
            <div className="mt-[12px] flex flex-col justify-between gap-[18px] md:flex-row md:items-start">
              <div>
                <h2 className="m-0 text-[32px] font-black tracking-[-.02em]">Prescription Agent Workspace</h2>
                <p className="mt-[8px] text-[14px] text-[#64748B]">
                  Enterprise agent interface for clinical safety, claim readiness, pharmacist review, evidence completeness, and audit trail.
                </p>
              </div>
              <span className="inline-flex rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-[16px] py-[8px] text-[14px] font-extrabold text-[#1E3A8A]">
                Orchestrated AI
              </span>
            </div>
          </ShellCard>

          <section className="grid gap-[14px] md:grid-cols-2 xl:grid-cols-6">
            {agentCards.map((agent) => (
              <ShellCard key={agent.name} className={classNames("border-t-[4px] p-[16px]", agent.tone)}>
                <p className="m-0 text-[13px] font-black">{agent.name}</p>
                <p className="my-[10px] text-[12px] leading-relaxed text-[#64748B]">{agent.role}</p>
                <span className={classNames("inline-flex rounded-full px-[9px] py-[5px] text-[11px] font-black uppercase", agent.pill)}>{agent.state}</span>
              </ShellCard>
            ))}
          </section>

          <section className="grid gap-[20px] xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,.8fr)]">
            <ShellCard className="p-[22px]">
              <h2 className="m-0 text-[18px] font-black">Structured Agent Output</h2>
              <div className="mt-[14px] grid gap-[10px] text-[14px]">
                {[
                  ["Summary", "Prescription workflow initialized for patient context and medication safety review."],
                  ["Reasoning", "Agents evaluate allergy, duplicate medication, drug interaction, claim evidence, and audit readiness."],
                  ["Confidence", "High for rule-based safety checks; human review required for clinical decisions."],
                  ["Risks", "Penicillin allergy and Warfarin + NSAID interaction are actively monitored."],
                  ["Next Action", "Add medication rows, review dynamic safety result, then save or justify warning cases."],
                ].map(([label, value]) => (
                  <div key={label} className="grid gap-[8px] border-b border-[#E2E8F0] py-[10px] last:border-b-0 md:grid-cols-[150px_minmax(0,1fr)]">
                    <strong className="text-[12px] uppercase tracking-[.04em] text-[#334155]">{label}</strong>
                    <span className={label === "Confidence" ? "text-[#059669]" : ""}>{value}</span>
                  </div>
                ))}
              </div>
            </ShellCard>

            <ShellCard className="border-[#B7D4F8] bg-gradient-to-br from-[#F8FBFF] to-[#EFF6FF] p-[22px]">
              <h2 className="m-0 text-[18px] font-black text-[#1E3A8A]">Agent Governance</h2>
              <div className="mt-[16px] grid text-[14px]">
                {[
                  ["Orchestrator Required", "Active", "text-[#059669]"],
                  ["Human Final Decision", "Required", "text-[#059669]"],
                  ["Clinical Diagnosis by AI", "Disabled", "text-[#DC2626]"],
                  ["Auto Claim Approval", "Disabled", "text-[#DC2626]"],
                  ["Audit Trail", "Enabled", "text-[#059669]"],
                ].map(([label, value, tone]) => (
                  <div key={label} className="flex justify-between gap-[12px] border-b border-[#E2E8F0] py-[10px] last:border-b-0">
                    <span>{label}</span>
                    <strong className={tone}>{value}</strong>
                  </div>
                ))}
              </div>
            </ShellCard>
          </section>

          <section className="grid overflow-hidden rounded-[14px] border border-[#B7D4F8] bg-[#D8E4F2] md:grid-cols-4 xl:grid-cols-8">
            {patientContext.map(([label, value]) => (
              <div key={label} className="bg-white p-[16px]">
                <p className="mb-[5px] mt-0 text-[11px] font-extrabold uppercase tracking-[.04em] text-[#64748B]">{label}</p>
                <p className={classNames("m-0 font-black", label === "Allergy" && "text-[#DC2626]")}>{value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-[16px] md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Prescription Safety", safetyTone.kpi, safety.level === "critical" ? "text-[#DC2626]" : safety.level === "warning" ? "text-[#D97706]" : "text-[#059669]", safety.level === "critical" ? "พบความเสี่ยงต่อผู้ป่วย" : safety.level === "warning" ? "ต้อง Review" : "ผ่านการตรวจสอบ"],
              ["Review Status", safetyTone.review, safetyTone.reviewClass, "Pharmacist workflow"],
              ["AI Confidence", "96%", "text-[#1E3A8A]", "Safety evaluation"],
              ["Claim Ready", safety.level === "critical" ? "Blocked" : "92%", safety.level === "critical" ? "text-[#DC2626]" : "text-[#059669]", "Medication evidence linked"],
            ].map(([label, value, tone, note]) => (
              <ShellCard key={label} className="border-t-[4px] border-t-[#DBEAFE] p-[18px]">
                <p className="m-0 text-[#64748B]">{label}</p>
                <h3 className={classNames("my-[8px] text-[28px] font-black tracking-[-.02em]", tone)}>{value}</h3>
                <p className="m-0 text-[11px] font-extrabold uppercase tracking-[.04em] text-[#64748B]">{note}</p>
              </ShellCard>
            ))}
          </section>

          <ShellCard className="border-[#FECACA] bg-gradient-to-br from-[#FFF7F7] to-[#FEF2F2] p-[20px] text-[#991B1B]">
            <h3 className="mb-[6px] mt-0">Allergy History</h3>
            <p className="m-0 text-[14px]">ผู้ป่วยมีประวัติแพ้ยา <strong>Penicillin</strong> ระดับ Severe - ต้องหลีกเลี่ยงยาที่เกี่ยวข้อง</p>
          </ShellCard>

          <div className="grid gap-[20px] xl:grid-cols-[minmax(0,2.2fr)_minmax(380px,.8fr)]">
            <section className="grid content-start gap-[20px]">
              <ShellCard className={classNames("p-[20px]", safetyTone.card)}>
                <div className="flex justify-between gap-[16px]">
                  <div>
                    <h3 className="m-0 text-[18px] font-black">{safetyTone.title}</h3>
                    <p className="mt-[4px]">{safetyTone.summary}</p>
                  </div>
                  <span className={classNames("h-fit rounded-full border bg-white px-[12px] py-[5px] text-[12px] font-black", safetyTone.badgeClass)}>{safetyTone.badge}</span>
                </div>
                <div className="mt-[12px] text-[14px]">
                  {safety.issues.map((issue) => (
                    <div key={issue}>{issue}</div>
                  ))}
                </div>
              </ShellCard>

              <ShellCard className="p-[22px]">
                <div className="mb-[20px] flex flex-col justify-between gap-[16px] border-b border-[#E2E8F0] pb-[16px] md:flex-row md:items-center">
                  <div>
                    <h2 className="m-0 text-[18px] font-black">Create Prescription</h2>
                    <p className="mt-[4px] text-[14px] text-[#64748B]">เพิ่มรายการยาและตรวจสอบ Safety Result แบบ Dynamic</p>
                  </div>
                  <button className="rounded-[10px] border border-[#BFDBFE] bg-[#EFF6FF] px-[16px] py-[10px] font-black text-[#1E3A8A]" onClick={addMedication}>
                    + Add Medication
                  </button>
                </div>

                <div className="mb-[10px] hidden grid-cols-[3fr_2fr_2fr_2fr_1fr_2fr] gap-[12px] text-[11px] font-black uppercase tracking-[.04em] text-[#64748B] md:grid">
                  <div>Drug Name</div>
                  <div>Generic</div>
                  <div>Dosage</div>
                  <div>Frequency</div>
                  <div>Qty</div>
                  <div>Action</div>
                </div>

                <div className="grid gap-[12px]">
                  {medications.map((medication) => (
                    <div key={medication.id} className="grid gap-[12px] rounded-[14px] border border-[#DDE7F2] bg-[#F8FAFC] p-[14px] md:grid-cols-[3fr_2fr_2fr_2fr_1fr_2fr]">
                      <input className="rounded-[10px] border border-[#CBD5E1] bg-white px-[12px] py-[10px]" placeholder="Amoxicillin / Warfarin" value={medication.drugName} onChange={(event) => updateMedication(medication.id, "drugName", event.target.value)} />
                      <input className="rounded-[10px] border border-[#CBD5E1] bg-white px-[12px] py-[10px]" placeholder="Generic" value={medication.genericName} onChange={(event) => updateMedication(medication.id, "genericName", event.target.value)} />
                      <input className="rounded-[10px] border border-[#CBD5E1] bg-white px-[12px] py-[10px]" placeholder="500 mg" value={medication.dosage} onChange={(event) => updateMedication(medication.id, "dosage", event.target.value)} />
                      <input className="rounded-[10px] border border-[#CBD5E1] bg-white px-[12px] py-[10px]" placeholder="After meal" value={medication.frequency} onChange={(event) => updateMedication(medication.id, "frequency", event.target.value)} />
                      <input className="rounded-[10px] border border-[#CBD5E1] bg-white px-[12px] py-[10px]" placeholder="10" value={medication.quantity} onChange={(event) => updateMedication(medication.id, "quantity", event.target.value)} />
                      <button className="rounded-[10px] border border-[#FECACA] bg-white px-[16px] py-[10px] font-black text-[#DC2626]" onClick={() => removeMedication(medication.id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-[24px] flex flex-col justify-end gap-[12px] md:flex-row">
                  <button className="rounded-[10px] border border-[#CBD5E1] bg-white px-[16px] py-[10px] font-black text-[#475569]">Save Draft</button>
                  {safety.level === "warning" && (
                    <button className="rounded-[10px] border border-[#D97706] bg-[#D97706] px-[16px] py-[10px] font-black text-white" onClick={() => setShowModal(true)}>
                      Add Justification
                    </button>
                  )}
                  <button className="rounded-[10px] border border-[#1E3A8A] bg-[#1E3A8A] px-[16px] py-[10px] font-black text-white disabled:cursor-not-allowed disabled:border-[#CBD5E1] disabled:bg-[#CBD5E1]" disabled={!safety.canSubmit}>
                    Save Prescription
                  </button>
                </div>
              </ShellCard>

              <ShellCard className="p-[22px]">
                <h2 className="m-0 text-[18px] font-black">Prescription Audit Trail</h2>
                <div className="mt-[16px] grid gap-[12px] text-[14px]">
                  {auditItems.map((item) => (
                    <div key={`${item.title}-${item.detail}`} className={classNames("border-l-[3px] pl-[16px]", item.tone)}>
                      <p className="m-0 font-bold">{item.title}</p>
                      <p className="mt-[4px] text-[#64748B]">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </ShellCard>
            </section>

            <aside className="grid content-start gap-[20px]">
              <ShellCard className="border-[#B7D4F8] bg-gradient-to-br from-[#F8FBFF] to-[#EFF6FF] p-[22px]">
                <h2 className="m-0 text-[18px] font-black text-[#1E3A8A]">Clinical Safety Agent</h2>
                <div className="mt-[16px] grid text-[14px]">
                  {[
                    ["Allergy Check", safety.level === "critical" ? "Critical" : "Safe", safety.level === "critical" ? "text-[#DC2626]" : "text-[#059669]"],
                    ["Duplicate Drug", safety.level === "critical" ? "Check Required" : "Safe", safety.level === "critical" ? "text-[#DC2626]" : "text-[#059669]"],
                    ["Drug Interaction", safety.level === "warning" ? "Warning" : safety.level === "critical" ? "Blocked" : "Safe", safety.level === "safe" ? "text-[#059669]" : safety.level === "warning" ? "text-[#D97706]" : "text-[#DC2626]"],
                    ["Max Dose", "Safe", "text-[#059669]"],
                    ["Renal Dose", "Safe", "text-[#059669]"],
                  ].map(([label, value, tone]) => (
                    <div key={label} className="flex justify-between gap-[12px] border-b border-[#E2E8F0] py-[10px] last:border-b-0">
                      <span>{label}</span>
                      <strong className={tone}>{value}</strong>
                    </div>
                  ))}
                </div>
              </ShellCard>

              <ShellCard className="p-[22px]">
                <h2 className="m-0 text-[18px] font-black">Drug Interaction Agent</h2>
                <div className="mt-[16px] rounded-[12px] border border-[#DDE7F2] bg-[#F8FAFC] p-[16px] text-[14px] text-[#64748B]">
                  {safety.level === "warning" ? (
                    <>
                      <p className="m-0 font-bold text-[#D97706]">Warfarin + NSAIDs</p>
                      <p className="mt-[6px]">เพิ่มความเสี่ยงเลือดออก ควรพิจารณาทางเลือกหรือส่ง Pharmacist Review</p>
                    </>
                  ) : (
                    "ไม่พบ drug interaction"
                  )}
                </div>
              </ShellCard>

              <ShellCard className="p-[22px]">
                <h2 className="m-0 text-[18px] font-black">Pharmacist Review Agent Queue</h2>
                <div className="mt-[16px] rounded-[12px] border border-[#DDE7F2] bg-[#F8FAFC] p-[16px] text-[14px]">
                  {safety.level === "critical" ? (
                    <>
                      <p className="m-0 font-bold text-[#DC2626]">Blocked</p>
                      <p className="mt-[6px] text-[#64748B]">ต้องแก้ไข Critical Risk ก่อนส่งต่อ</p>
                    </>
                  ) : safety.level === "warning" ? (
                    <>
                      <p className="m-0 font-bold text-[#D97706]">Review Required</p>
                      <p className="mt-[6px] text-[#64748B]">Priority: Medium · Reason: Drug Interaction</p>
                    </>
                  ) : (
                    <>
                      <p className="m-0 font-bold text-[#059669]">No review required</p>
                      <p className="mt-[6px] text-[#64748B]">Prescription can proceed</p>
                    </>
                  )}
                </div>
              </ShellCard>

              <ShellCard className="p-[22px]">
                <div className="flex justify-between gap-[12px]">
                  <h2 className="m-0 text-[18px] font-black">Claim Readiness Agent</h2>
                  <span className="h-fit rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-[16px] py-[8px] text-[14px] font-extrabold text-[#1E3A8A]">92%</span>
                </div>
                <div className="mt-[16px] grid text-[14px]">
                  {[
                    ["SOAP", "Complete", "text-[#059669]"],
                    ["Diagnosis", "Complete", "text-[#059669]"],
                    ["Medication", safety.level === "critical" ? "Blocked" : safety.level === "warning" ? "Needs Review" : "Complete", safety.level === "critical" ? "text-[#DC2626]" : safety.level === "warning" ? "text-[#D97706]" : "text-[#059669]"],
                    ["Doctor Signature", "Needs Review", "text-[#D97706]"],
                  ].map(([label, value, tone]) => (
                    <div key={label} className="flex justify-between gap-[12px] border-b border-[#E2E8F0] py-[10px] last:border-b-0">
                      <span>{label}</span>
                      <strong className={tone}>{value}</strong>
                    </div>
                  ))}
                </div>
              </ShellCard>
            </aside>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-[16px]">
          <div className="w-full max-w-[520px] rounded-[18px] bg-white p-[24px] shadow-[0_20px_60px_rgba(15,23,42,.25)]">
            <h2 className="m-0 text-[20px] font-black">Clinical Justification Required</h2>
            <p className="mt-[10px] text-[14px] text-[#64748B]">กรณี Warning ต้องระบุเหตุผลก่อนบันทึก เพื่อรองรับ audit และ pharmacist review</p>
            <textarea className="mt-[12px] h-[128px] w-full rounded-[10px] border border-[#CBD5E1] p-[12px]" placeholder="ระบุเหตุผลทางคลินิก..." />
            <div className="mt-[24px] flex justify-end gap-[12px]">
              <button className="rounded-[10px] border border-[#CBD5E1] bg-white px-[16px] py-[10px] font-black text-[#475569]" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="rounded-[10px] border border-[#1E3A8A] bg-[#1E3A8A] px-[16px] py-[10px] font-black text-white" onClick={saveJustification}>
                Save Justification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
