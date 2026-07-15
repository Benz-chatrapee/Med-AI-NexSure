"use client";

import Link from "next/link";

export function StickyActions({
  dirty,
  saving,
  sendInvitation,
  onDraft,
  onCreate,
}: {
  dirty: boolean;
  saving: "draft" | "create" | null;
  sendInvitation: boolean;
  onDraft: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 px-4 py-3 shadow-[0_-10px_24px_rgba(15,23,42,.06)] backdrop-blur lg:left-[260px] lg:px-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="hidden text-sm text-slate-500 sm:block">
          <strong className="block text-slate-900">{dirty ? "Unsaved changes" : "All changes saved"}</strong>
          ระบบจะแจ้งเตือนก่อนออกจากหน้าเมื่อมี Unsaved Changes
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link href="/admin/users" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 font-bold">Cancel</Link>
          <button type="button" disabled={Boolean(saving)} onClick={onDraft} className="min-h-11 rounded-xl border border-blue-200 bg-blue-50 px-5 font-bold text-blue-700 disabled:opacity-60">{saving === "draft" ? "Saving..." : "Save Draft"}</button>
          <button type="button" disabled={Boolean(saving)} onClick={onCreate} className="col-span-2 min-h-11 rounded-xl bg-blue-900 px-5 font-bold text-white disabled:opacity-60">{saving === "create" ? "Creating..." : sendInvitation ? "Create & Invite" : "Create User"}</button>
        </div>
      </div>
    </div>
  );
}
