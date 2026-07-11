import { cases, economicItems, evidenceItems, kpis, navSections, patientItems, readinessChecklist, soapSections, timeline } from "./soap-note-data";
import type { BadgeTone, ChecklistItem } from "@/types/soap-note";

const badgeClasses: Record<BadgeTone, string> = {
  ai: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
  ready: "bg-[#ECFDF5] text-[#047857] border-transparent",
  review: "bg-[#FFFBEB] text-[#92400E] border-transparent",
  risk: "bg-[#FEF2F2] text-[#991B1B] border-transparent",
};

function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-[6px] rounded-full border px-[10px] py-[6px] text-[12px] font-bold ${badgeClasses[tone]}`}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[18px] border border-[#E2E8F0] bg-white p-[18px] shadow-[0_8px_24px_rgba(15,42,95,.06)] ${className}`}>{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="mb-[14px] text-[16px] font-extrabold text-[#0F2A5F]">{children}</div>;
}

function DataList({ items, className = "" }: { items: ChecklistItem[]; className?: string }) {
  return (
    <ul className={`m-0 list-none p-0 ${className}`}>
      {items.map((item) => (
        <li key={item.label} className="mb-[8px] flex justify-between gap-[10px] rounded-[12px] bg-[#F8FAFC] p-[11px] text-[13px]">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </li>
      ))}
    </ul>
  );
}

export function SoapNotePage() {
  return (
    <div className="grid min-h-screen grid-cols-[280px_1fr] bg-[#F8FAFC] font-[Inter,'IBM_Plex_Sans',Arial,sans-serif] text-[#0F172A] max-[1200px]:grid-cols-1">
      <aside className="bg-[#0F2A5F] px-[18px] py-[24px] text-white max-[1200px]:hidden">
        <div className="text-[23px] font-extrabold">Med AI <span className="text-[#38BDF8]">NexSure</span></div>
        <div className="mt-[4px] text-[12px] text-[#BFDBFE]">Healthcare & Insurance Intelligence</div>
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="mb-[8px] mt-[26px] text-[11px] uppercase tracking-[.08em] text-[#93C5FD]">{section.title}</div>
            {section.items.map((item) => (
              <div key={item} className={`mb-[5px] rounded-[12px] px-[12px] py-[11px] text-[14px] text-[#DBEAFE] ${item === "Executive Dashboard" ? "bg-[#2563EB] text-white" : ""}`}>
                {item}
              </div>
            ))}
          </div>
        ))}
      </aside>

      <main className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-[#E2E8F0] bg-white px-[24px] py-[14px] max-[760px]:h-auto max-[760px]:items-start max-[760px]:gap-3 max-[760px]:flex-col">
          <div>
            <div className="text-[13px] text-[#64748B]">Enterprise / Healthcare Intelligence / Command Center</div>
            <div className="mt-[4px] text-[22px] font-extrabold">Med AI NexSure Command Center</div>
          </div>
          <div className="flex items-center gap-[10px] max-[760px]:flex-wrap">
            <input className="w-[260px] rounded-[12px] border border-[#E2E8F0] px-[12px] py-[10px] text-[#64748B] max-[760px]:w-full" value="Search patient, visit, claim..." readOnly aria-label="Search" />
            <Badge tone="ai">✦ AI Decision Support</Badge>
            <Badge tone="ready">✓ PDPA Ready</Badge>
            <Badge tone="review">Role: Doctor</Badge>
          </div>
        </header>

        <section className="px-[24px] pb-[90px] pt-[22px]">
          <div className="mb-[18px] grid grid-cols-4 gap-[16px] max-[1200px]:grid-cols-2 max-[760px]:grid-cols-1">
            {kpis.map((kpi) => (
              <Card key={kpi.label} className="border-t-[4px] border-t-[#1E3A8A]">
                <div className="text-[13px] text-[#64748B]">{kpi.label}</div>
                <div className="mt-[8px] text-[30px] font-extrabold text-[#0F2A5F]">{kpi.value}</div>
                <div className="mt-[6px] text-[12px] text-[#64748B]">{kpi.note}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-[1.25fr_.9fr_.85fr] gap-[16px] max-[1200px]:grid-cols-1">
            <Card>
              <SectionTitle>Enterprise Case List</SectionTitle>
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>{["Visit", "Patient", "Clinical", "Claim", "Risk"].map((head) => <th key={head} className="border-b border-[#E2E8F0] p-[10px] text-left font-bold text-[#64748B]">{head}</th>)}</tr>
                </thead>
                <tbody>
                  {cases.map((row) => (
                    <tr key={row.visit}>
                      <td className="border-b border-[#F1F5F9] px-[10px] py-[12px]">{row.visit}</td>
                      <td className="border-b border-[#F1F5F9] px-[10px] py-[12px]">{row.patient}</td>
                      <td className="border-b border-[#F1F5F9] px-[10px] py-[12px]">{row.clinical}</td>
                      <td className="border-b border-[#F1F5F9] px-[10px] py-[12px]"><Badge tone={row.claimTone}>{row.claim}</Badge></td>
                      <td className="border-b border-[#F1F5F9] px-[10px] py-[12px]"><Badge tone={row.riskTone}>{row.risk}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card>
              <SectionTitle>Claim Readiness Overview</SectionTitle>
              <div className="flex items-center gap-[16px]">
                <div className="flex h-[118px] w-[118px] items-center justify-center rounded-full bg-[conic-gradient(#F59E0B_0_86%,#E2E8F0_86%_100%)]">
                  <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full bg-white text-[25px] font-black text-[#0F2A5F]">86%</div>
                </div>
                <div>
                  <Badge tone="review">⚠ Needs Review</Badge>
                  <p className="text-[13px] text-[#64748B]">Missing ICD-10 and medical certificate before insurance export.</p>
                </div>
              </div>
              <DataList items={readinessChecklist} className="mt-[14px]" />
            </Card>

            <Card>
              <SectionTitle>AI Intelligence Panel</SectionTitle>
              <div className="mb-[10px] rounded-[14px] border border-[#BFDBFE] border-l-[5px] border-l-[#2563EB] bg-[#F8FBFF] p-[13px] text-[13px] leading-[1.45] text-[#1D4ED8]">
                <strong>✦ AI Clinical Summary</strong><br />Patient symptoms suggest Acute URI. ICD-10 J06.9 recommended with 93% confidence.
              </div>
              <div className="mb-[10px] rounded-[14px] border border-[#BFDBFE] border-l-[5px] border-l-[#2563EB] bg-[#F8FBFF] p-[13px] text-[13px] leading-[1.45] text-[#1D4ED8]">
                <strong>Human Review Status</strong><br />Awaiting physician confirmation before final diagnosis and claim use.
              </div>
            </Card>
          </div>

          <div className="mt-[16px] grid grid-cols-2 gap-[16px] max-[1200px]:grid-cols-1">
            <Card>
              <SectionTitle>Economic Intelligence</SectionTitle>
              <div className="mb-[10px] rounded-[14px] border border-[#99F6E4] border-l-[5px] border-l-[#0F766E] bg-[#F0FDFA] p-[13px] text-[13px] leading-[1.45] text-[#115E59]">
                <strong>Cost Benchmark</strong><br />Expected visit cost ฿1,420 vs clinic benchmark ฿1,350. Variance +5%.
              </div>
              <DataList items={economicItems} />
            </Card>
            <Card>
              <SectionTitle>Audit & Compliance Timeline</SectionTitle>
              <div className="border-l-[2px] border-[#E2E8F0] pl-[14px] text-[13px] text-[#334155]">
                {timeline.map((item) => <p key={item.time} className="mb-[14px] mt-0"><strong>{item.time}</strong><br />{item.description}</p>)}
              </div>
            </Card>
          </div>

          <div className="mt-[16px] grid grid-cols-[24%_46%_30%] gap-[16px] max-[1200px]:grid-cols-1">
            <Card>
              <SectionTitle>Patient 360°</SectionTitle>
              <DataList items={patientItems} />
              <div className="mt-[14px] rounded-[14px] border border-[#FECACA] border-l-[5px] border-l-[#DC2626] bg-white p-[13px] text-[13px] leading-[1.45] text-[#991B1B]">
                <strong>⚠ Critical Safety Alert</strong><br />Penicillin allergy detected. Medication review required.
              </div>
            </Card>

            <Card>
              <SectionTitle>Enterprise SOAP Note</SectionTitle>
              {soapSections.map((section) => (
                <details key={section.title} open className="mb-[12px] overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white">
                  <summary className="cursor-pointer border-l-[4px] border-l-[#2563EB] px-[16px] py-[14px] font-extrabold text-[#0F2A5F]">{section.title}</summary>
                  <div className="p-[16px]">
                    {section.fields.map((field) => (
                      <label key={field.label} className="mt-[12px] block text-[13px] font-bold text-[#334155]">
                        {field.label}
                        {field.multiline ? (
                          <textarea className="mt-[6px] min-h-[80px] w-full rounded-[12px] border border-[#CBD5E1] p-[11px] text-[14px]" value={field.value} readOnly />
                        ) : (
                          <input className="mt-[6px] w-full rounded-[12px] border border-[#CBD5E1] p-[11px] text-[14px]" value={field.value} readOnly />
                        )}
                      </label>
                    ))}
                    {section.alert ? (
                      <div className={`mt-[10px] rounded-[14px] border border-l-[5px] p-[13px] text-[13px] leading-[1.45] ${section.alert.tone === "ai" ? "border-[#BFDBFE] border-l-[#2563EB] bg-[#F8FBFF] text-[#1D4ED8]" : "border-[#FECACA] border-l-[#DC2626] bg-white text-[#991B1B]"}`}>
                        {section.alert.text}
                      </div>
                    ) : null}
                  </div>
                </details>
              ))}
            </Card>

            <Card>
              <SectionTitle>Evidence Package</SectionTitle>
              <DataList items={evidenceItems} />
              <button className="mt-[12px] w-full rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] px-[14px] py-[10px] font-bold text-[#2563EB]">Generate Evidence Package</button>
              <button className="mt-[8px] w-full rounded-[12px] border border-[#CBD5E1] bg-white px-[14px] py-[10px] font-bold text-[#334155]">Export PDF</button>
            </Card>
          </div>
        </section>

        <div className="fixed bottom-0 left-[280px] right-0 flex justify-end gap-[10px] border-t border-[#E2E8F0] bg-white px-[24px] py-[14px] max-[1200px]:left-0">
          <button className="rounded-[12px] border border-[#CBD5E1] bg-white px-[14px] py-[10px] font-bold text-[#334155]">Save Draft</button>
          <button className="rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] px-[14px] py-[10px] font-bold text-[#2563EB]">AI Assist</button>
          <button className="rounded-[12px] border border-[#CBD5E1] bg-white px-[14px] py-[10px] font-bold text-[#334155]">Generate Evidence</button>
          <button className="rounded-[12px] bg-[#1E3A8A] px-[14px] py-[10px] font-bold text-white">Finalize & Sign</button>
        </div>
      </main>
    </div>
  );
}
