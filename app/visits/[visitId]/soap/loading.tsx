export default function VisitSoapLoading() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-5 text-[#0F172A]">
      <section className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="h-5 w-52 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="h-20 animate-pulse rounded-lg bg-slate-100" key={index} />
          ))}
        </div>
      </section>
      <section className="mt-4 grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_390px]">
        <div className="h-96 animate-pulse rounded-lg bg-white" />
        <div className="h-[680px] animate-pulse rounded-lg bg-white" />
        <div className="h-[680px] animate-pulse rounded-lg bg-white" />
      </section>
    </main>
  );
}
