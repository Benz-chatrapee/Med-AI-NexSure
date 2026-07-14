export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="space-y-5">
        <div className="h-40 animate-pulse rounded-2xl bg-white" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
        <div className="rounded-2xl bg-white p-4">
          <div className="mb-4 h-12 animate-pulse rounded-xl bg-slate-100" />
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="mb-3 h-14 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </main>
  );
}
