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
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 px-4 py-3 shadow-[0_-8px_18px_color-mix(in_srgb,var(--foreground)_5%,transparent)] backdrop-blur lg:left-[260px] lg:px-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="hidden text-sm text-muted-foreground sm:block">
          <strong className="block text-foreground">{dirty ? "Unsaved changes" : "All changes saved"}</strong>
          ระบบจะแจ้งเตือนก่อนออกจากหน้าเมื่อมี Unsaved Changes
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link href="/admin/users" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--nexsure-blue-border)] bg-card px-5 font-semibold text-primary hover:bg-nav-hover focus:outline-none focus:ring-2 focus:ring-ring-strong">Cancel</Link>
          <button type="button" disabled={Boolean(saving)} onClick={onDraft} className="min-h-11 rounded-lg border border-[var(--nexsure-blue-border)] bg-card px-5 font-semibold text-primary hover:bg-nav-hover focus:outline-none focus:ring-2 focus:ring-ring-strong disabled:opacity-60">{saving === "draft" ? "Saving..." : "Save Draft"}</button>
          <button type="button" disabled={createDisabled} onClick={onCreate} className="col-span-2 min-h-11 rounded-lg bg-primary px-5 font-semibold text-primary-foreground hover:bg-deep-blue focus:outline-none focus:ring-2 focus:ring-ring-strong disabled:opacity-60">{saving === "create" ? "Creating..." : sendInvitation ? "Create & Invite" : "Create User"}</button>
        </div>
      </div>
    </div>
  );
}
