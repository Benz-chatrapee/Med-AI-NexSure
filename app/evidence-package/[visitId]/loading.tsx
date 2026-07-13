export default function LoadingEvidencePackage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="h-36 animate-pulse rounded-lg bg-white" />
      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div className="h-28 animate-pulse rounded-lg bg-white" key={item} />)}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="h-96 animate-pulse rounded-lg bg-white" />
        <div className="h-96 animate-pulse rounded-lg bg-white" />
      </div>
    </main>
  );
}
