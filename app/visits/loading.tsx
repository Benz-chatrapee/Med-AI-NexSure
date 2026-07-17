export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-8 lg:pl-[292px]">
      <div className="space-y-4 pt-16">
        <div className="h-8 w-72 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-lg bg-slate-100" />)}
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}
