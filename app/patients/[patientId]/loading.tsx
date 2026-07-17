export default function PatientDetailLoading() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 lg:pl-[284px]" aria-busy="true" aria-label="Loading patient detail">
      <div className="mb-4 h-7 rounded bg-[#DC2626]/25" />
      <div className="space-y-5">
        <div className="h-16 rounded border border-[#E2E8F0] bg-white" />
        <div className="h-32 rounded-xl border border-[#E2E8F0] bg-white" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-24 rounded-xl border border-[#E2E8F0] bg-white" />)}
        </div>
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="h-96 rounded-xl border border-[#E2E8F0] bg-white" />
          <div className="space-y-6">
            <div className="h-14 rounded border border-[#E2E8F0] bg-white" />
            <div className="h-72 rounded-xl border border-[#E2E8F0] bg-white" />
            <div className="h-72 rounded-xl border border-[#E2E8F0] bg-white" />
          </div>
        </div>
      </div>
    </main>
  );
}
