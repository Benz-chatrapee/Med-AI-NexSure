export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-[1760px] space-y-5">
        <div className="h-28 animate-pulse rounded-2xl bg-white" />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-5">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-56 animate-pulse rounded-2xl bg-white" />)}
          </div>
          <div className="h-96 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    </main>
  );
}
