export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1920px] space-y-4">
        <div className="h-16 rounded-lg border border-slate-200 bg-white" />
        <div className="h-32 rounded-lg border border-slate-200 bg-white" />
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-40 rounded-lg border border-slate-200 bg-white" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="h-80 rounded-lg border border-slate-200 bg-white lg:col-span-7" />
          <div className="h-80 rounded-lg border border-slate-200 bg-white lg:col-span-5" />
          <div className="h-96 rounded-lg border border-slate-200 bg-white lg:col-span-12" />
        </div>
      </div>
    </main>
  );
}
