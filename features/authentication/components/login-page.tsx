"use client";

import { useRouter } from "next/navigation";

import type { LoginFormValues } from "../schemas/login-schema";
import { LoginForm } from "./login-form";
import { LoginHero } from "./login-hero";
import { SecurityNotice } from "./security-notice";
import styles from "./login.module.css";

export function LoginPage() {
  const router = useRouter();

  async function handleLogin(values: LoginFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!values.email || !values.password) {
      throw new Error("Invalid credentials");
    }

    router.push("/dashboard");
  }

  return (
    <main className={styles.page}>
      <LoginHero />

      <section
        className={styles.loginPanel}
        aria-labelledby="workspace-login-title"
      >
        <div className={styles.loginPanelInner}>
          <div className={styles.mobileBrand}>
            <strong>Med AI NexSure</strong>
            <span>Enterprise Healthcare Intelligence</span>
          </div>

          <div className={styles.secureGatewayBadge}>
            <span className={styles.gatewayDot} aria-hidden="true" />
            Secure Enterprise Gateway
          </div>

          <header className={styles.loginHeader}>
            <p className={styles.eyebrow}>Authorized Workspace Access</p>

            <h2 id="workspace-login-title">Workspace Login</h2>

            <p>
              Secure access for authorized healthcare and insurance
              professionals.
              <span>
                เข้าสู่ระบบสำหรับบุคลากรที่ได้รับสิทธิ์เท่านั้น
              </span>
            </p>
          </header>

          <LoginForm onSubmit={handleLogin} />

          <SecurityNotice />

          <footer className={styles.loginFooter}>
            <span>Med AI NexSure</span>
            <span>Responsible AI · Human-Governed · PDPA-Aligned</span>
          </footer>
        </div>
      </section>
    </main>
  );
}