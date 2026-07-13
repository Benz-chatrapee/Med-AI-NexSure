export function PrescriptionPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="mx-auto grid max-w-[1800px] gap-4">
        <div className="h-32 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div className="h-28 animate-pulse rounded-lg bg-slate-200" key={item} />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(360px,.8fr)]">
          <div className="h-[520px] animate-pulse rounded-lg bg-slate-200" />
          <div className="grid gap-4">
            <div className="h-56 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-48 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
