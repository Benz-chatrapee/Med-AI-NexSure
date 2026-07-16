export function TaskToast({ message }: { message: string }) {
  return (
    <div className={`pointer-events-none fixed bottom-5 left-1/2 z-[90] -translate-x-1/2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-xl transition-all duration-300 ${message ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"}`}>
      {message}
    </div>
  );
}
