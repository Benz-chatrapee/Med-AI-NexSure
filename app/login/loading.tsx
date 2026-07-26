import styles from "@/features/authentication/components/login.module.css";

export default function Loading() {
  return (
    <main className={styles.loadingPage} aria-label="Loading Med AI NexSure">
      <div className={styles.loadingCard}>
        <div className={styles.loadingMark} />
        <p>Loading secure workspace...</p>
      </div>
    </main>
  );
}
