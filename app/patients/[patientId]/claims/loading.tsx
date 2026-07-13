export default function PatientClaimsLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="grid gap-4 xl:grid-cols-[276px_minmax(0,1fr)]">
        <div className="hidden h-screen rounded-lg bg-slate-200 xl:block" />
        <div className="space-y-4">
          <div className="h-16 rounded-lg bg-white shadow-sm" />
          <div className="h-28 rounded-lg bg-white shadow-sm" />
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-32 rounded-lg bg-white shadow-sm" />)}</div>
          <div className="grid gap-4 xl:grid-cols-2"><div className="h-80 rounded-lg bg-white shadow-sm" /><div className="h-80 rounded-lg bg-white shadow-sm" /></div>
          <div className="h-96 rounded-lg bg-white shadow-sm" />
        </div>
      </div>
    </div>
  );
}
