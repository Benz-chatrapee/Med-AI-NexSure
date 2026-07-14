export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl animate-pulse space-y-4">
        <div className="h-10 w-80 rounded bg-slate-200" />
        <div className="h-20 rounded-2xl bg-white shadow-sm" />
        <div className="grid gap-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="h-28 rounded-2xl bg-white shadow-sm" key={index} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="h-[520px] rounded-2xl bg-white shadow-sm" />
          <div className="h-[520px] rounded-2xl bg-white shadow-sm" />
        </div>
      </div>
    </main>
  );
}
