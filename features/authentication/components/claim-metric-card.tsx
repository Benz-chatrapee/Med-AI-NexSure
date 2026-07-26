import styles from "./login.module.css";

type Metric = {
  title: string;
  value: string;
  suffix?: string;
  helper: string;
  progress?: number;
  status?: "success";
  tone?: "blue" | "cyan" | "green" | "azure";
};

export function ClaimMetricCard({ metric }: { metric: Metric }) {
  const progress =
    typeof metric.progress === "number"
      ? Math.min(100, Math.max(0, metric.progress))
      : 0;

  return (
    <article className={styles.metricPanel}>
      <div>
        <p className={styles.metricTitle}>{metric.title}</p>
        <div className={styles.metricValue}>
          {metric.value}
          {metric.suffix ? <span>{metric.suffix}</span> : null}
        </div>
      </div>

      {metric.status === "success" ? (
        <div className={styles.metricSuccess}>
          <span aria-hidden="true" />
          {metric.helper}
        </div>
      ) : (
        <div>
          <div className={styles.metricTrack} aria-hidden="true">
            <span
              className={styles.metricProgress}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={styles.metricHelper}>{metric.helper}</p>
        </div>
      )}
    </article>
  );
}
