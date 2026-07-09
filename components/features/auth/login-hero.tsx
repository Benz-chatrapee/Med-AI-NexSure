import Image from "next/image";
import {
  careFlowSteps,
  intelligenceMetrics,
  statusPills,
  trustBadges,
} from "./login-content";
import { MetricCard } from "./metric-card";

export function LoginHero() {
  return (
    <section className="hero-left relative hidden min-h-screen overflow-hidden bg-[#0F2A5F] px-12 py-10 text-white lg:flex lg:flex-col xl:px-20 2xl:px-24">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#071936_0%,#0F2A5F_58%,#123A7B_100%)]" />
      <div className="blueprint-bg absolute inset-0" />
      <div className="aurora aurora-a" />
      <div className="aurora aurora-b" />
      <div className="aurora aurora-c" />

      <svg
        className="absolute inset-0 h-full w-full opacity-[.16]"
        viewBox="0 0 1200 900"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="flowGradient" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#38BDF8" stopOpacity=".35" />
            <stop offset="1" stopColor="#93C5FD" stopOpacity=".08" />
          </linearGradient>
        </defs>
        <path
          className="data-flow"
          d="M120 650 C250 520 330 610 460 480 S720 360 845 475 1010 620 1110 470"
          fill="none"
          stroke="url(#flowGradient)"
          strokeWidth="2"
        />
        <path
          className="data-flow"
          d="M180 280 C330 190 460 250 560 165 S760 130 900 245 1020 330 1120 250"
          fill="none"
          stroke="#60A5FA"
          strokeOpacity=".22"
          strokeWidth="1.5"
        />
        <g fill="#7DD3FC" opacity=".7">
          <circle className="const-node" cx="140" cy="650" r="5" />
          <circle className="const-node" cx="460" cy="480" r="5" />
          <circle className="const-node" cx="845" cy="475" r="5" />
          <circle className="const-node" cx="1110" cy="470" r="5" />
          <circle className="const-node" cx="180" cy="280" r="4" />
          <circle className="const-node" cx="560" cy="165" r="4" />
          <circle className="const-node" cx="900" cy="245" r="4" />
        </g>
        <g className="const-label">
          <text x="112" y="676">Clinic</text>
          <text x="430" y="506">Hospital</text>
          <text x="812" y="501">Insurer</text>
          <text x="1066" y="496">Analytics</text>
          <text x="150" y="260">SOAP</text>
          <text x="538" y="146">ICD</text>
          <text x="866" y="226">Claim</text>
        </g>
      </svg>

      <div className="status-in relative z-30 mb-8 flex items-center justify-between gap-4 rounded-2xl border border-white/12 bg-white/[.075] px-4 py-3 shadow-lg shadow-blue-950/20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-sm font-black text-white ring-1 ring-white/15">
            NX
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">Med AI NexSure</div>
            <div className="text-[10px] font-semibold uppercase tracking-[.18em] text-blue-200">
              Enterprise Intelligence OS
            </div>
          </div>
        </div>
        <div className="hidden flex-wrap justify-end gap-2 text-[11px] font-bold xl:flex">
          {statusPills.map((status) => (
            <span className="status-pill" key={status}>
              <i className="status-dot" />
              {status}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-20 max-w-[860px]">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200/20 bg-white/7 px-3 py-2 text-[11px] font-bold uppercase tracking-[.16em] text-blue-100 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[#38BDF8] shadow-[0_0_18px_#38BDF8]" />
          Healthcare AI - Insurance Intelligence
        </div>
        <h1 className="text-5xl font-bold leading-[.92] tracking-tight xl:text-7xl">
          Med AI NexSure
        </h1>
        <p className="mt-4 text-xl font-semibold text-blue-100">
          Enterprise Healthcare & Insurance Intelligence Platform
        </p>
        <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-300">
          Transforming Clinical Documentation, Claim Readiness, Insurance
          Intelligence, and Healthcare Operations through Responsible AI.
        </p>

        <div className="mt-8 max-w-[860px]">
          <div className="mb-3 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
            <div className="text-[11px] font-bold uppercase tracking-[.18em] text-blue-100">
              AI Intelligence Metrics
            </div>
            <div className="hidden text-[10px] font-semibold uppercase tracking-[.16em] text-blue-200/80 sm:block">
              Clinical - Claim - Compliance - Insurance
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {intelligenceMetrics.map((metric) => (
              <MetricCard metric={metric} key={metric.title} />
            ))}
          </div>
        </div>

        <div className="mt-6 max-w-[780px] rounded-2xl border border-white/10 bg-white/[.055] px-5 py-3 text-[11px] font-bold uppercase tracking-[.12em] text-blue-100 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            {careFlowSteps.map((item, index) => (
              <span className="contents" key={item}>
                {index > 0 ? <span className="text-[#38BDF8]">-&gt;</span> : null}
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        className="hero-scene"
        aria-label="Dr.Benz AI assistant with healthcare intelligence network"
      >
        <svg
          className="absolute left-12 right-12 top-[4%] z-[2] h-[250px] w-[calc(100%-6rem)] opacity-45"
          viewBox="0 0 920 320"
          aria-hidden="true"
        >
          <g fill="none" stroke="#60A5FA" strokeOpacity=".22" strokeWidth="1.25">
            <path className="data-flow" d="M90 190 C190 70 300 84 410 155 S620 270 820 116" />
            <path className="data-flow" d="M145 238 C284 190 355 255 470 198 S660 78 790 206" />
            <path d="M410 155 L470 198 L590 122 L690 162" />
          </g>
          <g>
            <circle className="const-node" cx="90" cy="190" r="7" fill="#38BDF8" />
            <text className="const-label" x="64" y="215">Clinical</text>
            <circle className="const-node" cx="250" cy="82" r="6" fill="#93C5FD" />
            <text className="const-label" x="228" y="66">SOAP</text>
            <circle className="const-node" cx="410" cy="155" r="8" fill="#2563EB" />
            <text className="const-label" x="390" y="140">AI</text>
            <circle className="const-node" cx="590" cy="122" r="6" fill="#7DD3FC" />
            <text className="const-label" x="568" y="104">ICD</text>
            <circle className="const-node" cx="820" cy="116" r="7" fill="#38BDF8" />
            <text className="const-label" x="790" y="100">Claim</text>
          </g>
        </svg>

        <div className="ekg-layer">
          <svg viewBox="0 0 980 210" aria-hidden="true">
            <path
              className="ekg-glow"
              d="M10 110 H190 L220 84 L252 142 L286 56 L330 110 H450 L490 110 L518 92 L548 128 L580 72 L628 110 H970"
            />
            <path
              className="ekg-main"
              d="M10 110 H190 L220 84 L252 142 L286 56 L330 110 H450 L490 110 L518 92 L548 128 L580 72 L628 110 H970"
            />
          </svg>
        </div>

        <div className="drbenz">
          <Image
            src="/images/dr-benz-login.png"
            alt="Dr.Benz AI Assistant"
            width={1536}
            height={1024}
            priority
            className="h-auto w-full"
          />
        </div>
        <div className="dr-shadow" />
      </div>

      <div className="relative z-20 mt-0 flex flex-wrap gap-2 pb-1 text-xs text-blue-100">
        {trustBadges.map((badge) => (
          <span
            className="rounded-full border border-white/10 bg-white/7 px-3 py-2 backdrop-blur"
            key={badge}
          >
            {badge}
          </span>
        ))}
      </div>
    </section>
  );
}
