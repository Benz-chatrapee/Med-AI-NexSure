import { LoginHero } from "./login-hero";
import { ResetPasswordForm } from "./reset-password-form";

export function ResetPasswordPage() {
  return (
    <main className="page-fade grid min-h-screen bg-slate-50 text-[#0F172A] lg:grid-cols-[68%_32%] 2xl:grid-cols-[70%_30%]">
      <LoginHero />
      <ResetPasswordForm />
    </main>
  );
}
