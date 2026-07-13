import { ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BulkUserActions({
  count,
  pending,
  onClear,
  onMockAction,
  onSuspend,
}: {
  count: number;
  pending: boolean;
  onClear: () => void;
  onMockAction: (message: string) => void;
  onSuspend: (reason: string) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (count === 0) return null;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 overflow-x-auto rounded-2xl bg-slate-950 p-3 text-white shadow-xl sm:w-auto" role="region" aria-label="Bulk user actions">
        <strong className="whitespace-nowrap text-sm">{count} users selected - เลือกรายการแล้ว</strong>
        <BulkButton onClick={() => onMockAction("Assign Role opened - mock action recorded")}>Assign Role</BulkButton>
        <BulkButton onClick={() => onMockAction("Assign Clinic opened - mock action recorded")}>Assign Clinic</BulkButton>
        <BulkButton onClick={() => onMockAction("Manage AI opened - mock action recorded")}>Manage AI</BulkButton>
        <BulkButton danger onClick={() => setConfirmOpen(true)}>Suspend</BulkButton>
        <button type="button" onClick={onClear} aria-label="Clear selection" className="grid h-9 w-9 flex-none place-items-center rounded-xl border border-white/15 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-300">
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      {confirmOpen ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="bulk-suspend-title" className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-700"><ShieldAlert size={20} /></div>
              <div>
                <h2 id="bulk-suspend-title" className="text-xl font-black text-[#0F2A5F]">Confirm Bulk Suspend</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">การระงับผู้ใช้หลายรายการต้องระบุเหตุผล และจะถูกบันทึกใน Audit Log</p>
              </div>
            </div>
            <label className="mt-4 block text-sm font-black text-slate-700">
              Reason <span className="text-red-700">*</span>
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <Button onClick={() => setConfirmOpen(false)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Cancel</Button>
              <Button disabled={pending || reason.trim().length < 8} onClick={() => { onSuspend(reason); setConfirmOpen(false); setReason(""); }} className="rounded-xl border border-red-700 bg-red-700 px-3 py-2 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                {pending ? "Suspending..." : "Confirm Suspend"}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function BulkButton({ children, danger, onClick }: { children: React.ReactNode; danger?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`min-h-9 flex-none rounded-xl border px-3 text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-300 ${danger ? "border-red-300/40 bg-red-900/40 text-red-100" : "border-white/15 bg-white/10 text-white"}`}>
      {children}
    </button>
  );
}
