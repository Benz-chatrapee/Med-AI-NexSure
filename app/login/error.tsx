"use client";

import styles from "@/features/authentication/components/login.module.css";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={styles.loadingPage}>
      <div className={styles.errorCard} role="alert">
        <p className={styles.eyebrow}>Secure Access</p>
        <h1>Unable to load the login workspace</h1>
        <p>ไม่สามารถเปิดหน้าล็อกอินได้ กรุณาลองอีกครั้ง</p>
        <button className={styles.primaryButton} type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
