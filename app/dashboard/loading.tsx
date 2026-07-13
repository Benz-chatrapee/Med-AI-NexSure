const blocks = Array.from({ length: 6 }, (_, index) => index);

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 md:p-6">
      <div className="mx-auto max-w-[1920px] space-y-4">
        <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="h-3 w-48 rounded bg-blue-100" />
            <div className="h-9 w-80 rounded bg-slate-200" />
            <div className="h-4 w-full max-w-3xl rounded bg-slate-100" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-36 rounded-lg bg-white" />
            <div className="h-10 w-24 rounded-lg bg-white" />
            <div className="h-10 w-32 rounded-lg bg-white" />
          </div>
        </section>
        <section className="rounded-lg border border-[#E2E8F0] bg-white p-3 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {blocks.map((item) => (
              <div key={item} className="h-9 rounded-lg bg-slate-100" />
            ))}
          </div>
        </section>
        <section className="grid gap-3 md:grid-cols-3 2xl:grid-cols-6">
          {blocks.map((item) => (
            <div key={item} className="h-40 rounded-lg border border-[#E2E8F0] bg-white shadow-sm" />
          ))}
        </section>
        <section className="grid gap-4 xl:grid-cols-12">
          <div className="h-96 rounded-lg border border-[#E2E8F0] bg-white shadow-sm xl:col-span-4" />
          <div className="h-96 rounded-lg border border-[#E2E8F0] bg-white shadow-sm xl:col-span-8" />
          <div className="h-80 rounded-lg border border-[#E2E8F0] bg-white shadow-sm xl:col-span-7" />
          <div className="h-80 rounded-lg border border-[#E2E8F0] bg-white shadow-sm xl:col-span-5" />
        </section>
        <div className="h-[520px] rounded-lg border border-[#E2E8F0] bg-white shadow-sm" />
      </div>
    </main>
  );
}
