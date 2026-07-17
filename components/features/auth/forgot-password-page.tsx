import { ForgotPasswordForm } from "./forgot-password-form";

function BrandMark() {
  return (
    <div className="flex items-center gap-4">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-white p-2 text-sm font-extrabold text-[#00236f]">
        NX
      </div>
      <div className="flex flex-col">
        <span className="text-[32px] font-bold leading-none text-white">Med AI NexSure</span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b6c4ff]">
          Enterprise Health Intelligence
        </span>
      </div>
    </div>
  );
}

function IntelligenceIllustration() {
  return (
    <div className="group relative w-full max-w-md">
      <div className="absolute -inset-4 rounded-full bg-white/5 blur-3xl transition-all duration-500 group-hover:bg-white/10" />
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
        <div
          className="relative h-full w-full"
          aria-label="A sophisticated abstract network illustration representing AI intelligence in healthcare."
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="select-none text-[120px] leading-none text-white/20" aria-hidden="true">
              AI
            </span>
          </div>
          <div className="absolute left-1/4 top-1/4 animate-pulse text-4xl text-[#38BDF8]/40" aria-hidden="true">
            ◈
          </div>
          <div className="absolute bottom-1/4 right-1/4 animate-pulse text-4xl text-[#b6c4ff]/40" aria-hidden="true">
            ⛨
          </div>
          <div className="absolute right-[12%] top-1/2 animate-pulse text-3xl text-white/30" aria-hidden="true">
            ⬡
          </div>
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[#059669]" aria-hidden="true">
        ●
      </span>
      <span className="text-sm leading-5 text-[#dce1ff]">{children}</span>
    </div>
  );
}

function ForgotPasswordHero() {
  return (
    <section className="relative hidden flex-col justify-between overflow-hidden bg-[#00236f] p-8 text-white lg:flex lg:w-[45%]">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#00236f] via-[#00236f] to-[#1e3a8a] opacity-90" />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative z-10">
        <BrandMark />
      </div>
      <div className="relative z-10 flex flex-1 items-center justify-center">
        <IntelligenceIllustration />
      </div>
      <div className="relative z-10 border-t border-white/10 pt-6">
        <div className="grid grid-cols-1 gap-4">
          <ChecklistItem>HIPAA / PDPA Standards Ready</ChecklistItem>
          <ChecklistItem>AI Assisted Clinical Workflow Integration</ChecklistItem>
          <ChecklistItem>Enterprise Grade Security &amp; Framework</ChecklistItem>
        </div>
      </div>
    </section>
  );
}

export function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen w-full overflow-hidden bg-[#faf8ff] font-sans">
      <ForgotPasswordHero />
      <ForgotPasswordForm />
    </main>
  );
}
