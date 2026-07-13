import { SearchX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClinicUsersEmptyState({ filtered, onClear, onInvite }: { filtered: boolean; onClear: () => void; onInvite: () => void }) {
  const Icon = filtered ? SearchX : Users;
  return (
    <div className="grid place-items-center px-4 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-800">
        <Icon size={24} aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-900">{filtered ? "No users match the selected filters" : "No clinic users yet"}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {filtered ? "ไม่พบผู้ใช้งานตามเงื่อนไขที่เลือก กรุณาปรับตัวกรองหรือล้างตัวกรองทั้งหมด" : "ยังไม่มีผู้ใช้งานในคลินิกนี้ เริ่มต้นด้วยการส่งคำเชิญพร้อม Role และ Access Scope"}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {filtered ? <Button onClick={onClear} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Clear filters</Button> : null}
        <Button onClick={onInvite} className="rounded-xl border border-blue-800 bg-[#1E3A8A] px-3 py-2 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500">Invite User</Button>
      </div>
    </div>
  );
}
