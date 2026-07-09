import { LoginForm } from "./login-form";
import { LoginHero } from "./login-hero";

export function LoginPage() {
  return (
    <main className="page-fade grid min-h-screen bg-slate-50 text-[#0F172A] lg:grid-cols-[68%_32%] 2xl:grid-cols-[70%_30%]">
      <LoginHero />
      <LoginForm />
    </main>
  );
}
