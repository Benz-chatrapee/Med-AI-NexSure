import { Columns3, Search, X } from "lucide-react";
import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { aiAccessStatusLabels, aiAccessStatusOptions, departmentOptions, roleLabels, roleOptions, statusLabels, statusOptions } from "../constants/clinic-user-options";
import type { ClinicUsersQuery } from "../types/user-management.types";

export function ClinicUsersToolbar({
  query,
  onChange,
  onClear,
}: {
  query: ClinicUsersQuery;
  onChange: (patch: Partial<ClinicUsersQuery>) => void;
  onClear: () => void;
}) {
  const searchTimeout = useRef<number | null>(null);

  const chips = useMemo(() => {
    const values: { key: keyof ClinicUsersQuery; label: string }[] = [];
    if (query.search) values.push({ key: "search", label: `Search: ${query.search}` });
    if (query.role) values.push({ key: "role", label: `Role: ${roleLabels[query.role]}` });
    if (query.status) values.push({ key: "status", label: `Status: ${statusLabels[query.status]}` });
    if (query.departmentId) values.push({ key: "departmentId", label: `Department: ${departmentOptions.find((option) => option.value === query.departmentId)?.label ?? query.departmentId}` });
    if (query.aiAccessStatus) values.push({ key: "aiAccessStatus", label: `AI: ${aiAccessStatusLabels[query.aiAccessStatus]}` });
    return values;
  }, [query.aiAccessStatus, query.departmentId, query.role, query.search, query.status]);

  return (
    <div className="border-b border-slate-200 p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 gap-2 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.6fr)_repeat(4,minmax(130px,1fr))]">
          <label className="relative block md:col-span-2 xl:col-span-1">
            <span className="sr-only">Search clinic users by name, email, employee ID, or professional license</span>
            <Search className="absolute left-3 top-3 text-slate-400" size={16} aria-hidden="true" />
            <input
              key={query.search ?? "empty-search"}
              defaultValue={query.search ?? ""}
              onChange={(event) => {
                const value = event.currentTarget.value;
                if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
                searchTimeout.current = window.setTimeout(() => onChange({ search: value || undefined, page: 1 }), 250);
              }}
              className="min-h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Search name, email, employee ID, license"
            />
          </label>
          <FilterSelect label="Role" value={query.role ?? ""} onChange={(value) => onChange({ role: value || undefined, page: 1 })} options={roleOptions} />
          <FilterSelect label="Status" value={query.status ?? ""} onChange={(value) => onChange({ status: value || undefined, page: 1 })} options={statusOptions} />
          <FilterSelect label="Department" value={query.departmentId ?? ""} onChange={(value) => onChange({ departmentId: value || undefined, page: 1 })} options={departmentOptions} />
          <FilterSelect label="AI Access" value={query.aiAccessStatus ?? ""} onChange={(value) => onChange({ aiAccessStatus: value || undefined, page: 1 })} options={aiAccessStatusOptions} />
        </div>
        <div className="flex items-center gap-2">
          {chips.length > 0 ? <Button onClick={onClear} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"><X size={15} />Clear filters</Button> : null}
          <Button onClick={() => undefined} aria-label="Column settings" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Columns3 size={16} aria-hidden="true" />
          </Button>
        </div>
      </div>
      {chips.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Active filters">
          {chips.map((chip) => (
            <button key={chip.key} type="button" onClick={() => onChange({ [chip.key]: undefined, page: 1 })} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {chip.label}
              <X size={12} aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FilterSelect<TValue extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: TValue | "") => void;
  options: { value: TValue; label: string }[];
}) {
  return (
    <label className="text-xs font-black text-slate-500">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value as TValue | "")} className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
        <option value="">All {label}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
