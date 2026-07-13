const blocks = Array.from({ length: 6 }, (_, index) => index);

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-5 sm:px-6 lg:px-8">
      <section className="rounded-2xl bg-[#0F2A5F] p-6">
        <div className="h-5 w-64 rounded bg-white/20" />
        <div className="mt-5 h-9 w-full max-w-3xl rounded bg-white/15" />
        <div className="mt-3 h-4 w-full max-w-5xl rounded bg-white/10" />
      </section>
      <section className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white p-4">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {blocks.map((item) => (
            <div key={item} className="h-16 rounded-xl bg-slate-100" />
          ))}
        </div>
      </section>
      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {blocks.map((item) => (
          <div key={item} className="h-44 rounded-2xl border border-[#E2E8F0] bg-white" />
        ))}
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-12">
        <div className="h-96 rounded-2xl border border-[#E2E8F0] bg-white xl:col-span-4" />
        <div className="h-96 rounded-2xl border border-[#E2E8F0] bg-white xl:col-span-8" />
      </section>
      <div className="mt-5 h-[520px] rounded-2xl border border-[#E2E8F0] bg-white" />
    </main>
  );
}
