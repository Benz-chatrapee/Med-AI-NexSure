"use client";

import Link from "next/link";

export function StickyActions({
  dirty,
  saving,
  sendInvitation,
  onDraft,
  onCreate,
  createDisabled,
}: {
  dirty: boolean;
  saving: "draft" | "create" | null;
  sendInvitation: boolean;
  createDisabled: boolean;
  onDraft: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E2E8F0] bg-white/95 px-4 py-3 shadow-[0_-8px_18px_rgba(15,23,42,.05)] backdrop-blur lg:left-[260px] lg:px-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="hidden text-sm text-[#64748B] sm:block">
          <strong className="block text-[#0F172A]">{dirty ? "Unsaved changes" : "All changes saved"}</strong>
          ระบบจะแจ้งเตือนก่อนออกจากหน้าเมื่อมี Unsaved Changes
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link href="/admin/users" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#BFDBFE] bg-white px-5 font-semibold text-[#1E3A8A] hover:bg-[#EFF6FF] focus:outline-none focus:ring-2 focus:ring-[#BFDBFE]">Cancel</Link>
          <button type="button" disabled={Boolean(saving)} onClick={onDraft} className="min-h-11 rounded-lg border border-[#BFDBFE] bg-white px-5 font-semibold text-[#1E3A8A] hover:bg-[#EFF6FF] focus:outline-none focus:ring-2 focus:ring-[#BFDBFE] disabled:opacity-60">{saving === "draft" ? "Saving..." : "Save Draft"}</button>
          <button type="button" disabled={createDisabled} onClick={onCreate} className="col-span-2 min-h-11 rounded-lg bg-[#1E3A8A] px-5 font-semibold text-white hover:bg-[#0F2A5F] focus:outline-none focus:ring-2 focus:ring-[#BFDBFE] disabled:opacity-60">{saving === "create" ? "Creating..." : sendInvitation ? "Create & Invite" : "Create User"}</button>
        </div>
      </div>
    </div>
  );
}
