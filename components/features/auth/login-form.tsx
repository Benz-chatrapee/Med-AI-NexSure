import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { supportedRoles } from "./login-content";
import { PasswordField } from "./password-field";

export function LoginForm() {
  return (
    <section className="relative grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(145deg,#F8FAFC_0%,#FFFFFF_48%,#EFF6FF_100%)] px-5 py-10 sm:px-7 lg:px-8 xl:px-10">
      <div className="absolute right-[-180px] top-[-140px] h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-[-180px] left-[-160px] h-[420px] w-[420px] rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative mx-auto mb-8 flex items-center gap-3 lg:hidden">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0F2A5F] font-bold text-white shadow-lg shadow-blue-950/20">
          NX
        </div>
        <div>
          <div className="font-bold text-[#0F172A]">Med AI NexSure</div>
          <div className="text-xs text-[#64748B]">Enterprise Workspace</div>
        </div>
      </div>

      <div className="card-up relative mx-auto w-full max-w-[410px]">
        <div className="mb-5 rounded-[24px] border border-blue-100 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#2563EB]">
                Enterprise Access Portal
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#0F172A]">
                Secure Clinical & Insurance Workspace
              </h2>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
              Protected
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-600">
            <span className="rounded-full border border-blue-100 bg-[#EFF6FF] px-2 py-2">PDPA Ready</span>
            <span className="rounded-full border border-blue-100 bg-[#EFF6FF] px-2 py-2">RBAC</span>
            <span className="rounded-full border border-blue-100 bg-[#EFF6FF] px-2 py-2">Audit Trail</span>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-7 shadow-[0_30px_90px_rgba(15,42,95,.18)] sm:p-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0F2A5F] text-sm font-bold text-white shadow-lg shadow-blue-950/20">
              NX
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Welcome Back</h1>
              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Sign in to continue to your Enterprise Workspace
              </p>
            </div>
          </div>

          <form className="stagger space-y-5" aria-label="Med AI NexSure sign in form">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-700">Organization</span>
              <div className="relative">
                <span className="input-icon" aria-hidden="true">Org</span>
                <Input aria-label="Organization" className="form-input" placeholder="Med AI Group" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-700">Clinic / Hospital</span>
              <div className="relative">
                <span className="input-icon" aria-hidden="true">Hosp</span>
                <Input aria-label="Clinic or Hospital" className="form-input" placeholder="NexSure Medical Center" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-700">Email</span>
              <div className="relative">
                <span className="input-icon" aria-hidden="true">Mail</span>
                <Input type="email" aria-label="Email" className="form-input" placeholder="name@organization.com" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-700">Password</span>
              <PasswordField id="password" />
            </label>
            <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]" />
                Remember me
              </label>
              <Link href="/forgot-password" className="rounded font-bold text-[#1E3A8A] hover:text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                Forgot Password?
              </Link>
            </div>
            <Button className="h-13 w-full rounded-2xl bg-[#1E3A8A] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-[#2563EB] hover:shadow-[0_22px_60px_rgba(37,99,235,.20)] focus:outline-none focus:ring-4 focus:ring-blue-600/20">
              Sign In
            </Button>
          </form>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-[#EFF6FF] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#2563EB]">
              Supported Roles
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
              {supportedRoles.map((role, index) => (
                <span className="contents" key={role}>
                  {index > 0 ? <span>-</span> : null}
                  <span>{role}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
            <strong className="text-slate-800">Authorized Healthcare Personnel Only.</strong>
            <br />
            Protected by PDPA, RBAC, Audit Logging, Secure Authentication,
            and Session Encryption.
          </div>
          <a href="#" className="mt-5 block rounded text-center text-xs font-bold text-[#64748B] transition hover:text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
            Contact Administrator
          </a>
        </div>
      </div>

      <footer className="absolute bottom-6 left-1/2 w-full max-w-[410px] -translate-x-1/2 text-center text-[11px] leading-5 text-slate-500">
        <div>Version 1.0.0 - Production Environment</div>
        <div>© 2026 Med AI NexSure - Secure - Compliant - Explainable AI</div>
        <div>
          <a className="hover:text-[#2563EB]" href="#">Privacy Policy</a>
          {" - "}
          <a className="hover:text-[#2563EB]" href="#">Terms of Use</a>
          {" - "}
          <a className="hover:text-[#2563EB]" href="#">Need Help?</a>
        </div>
      </footer>
    </section>
  );
}
