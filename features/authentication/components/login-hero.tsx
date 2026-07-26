import { ClaimMetricCard } from "./claim-metric-card";
import { IntelligenceStage } from "./intelligence-stage";
import { MedicalCodingCard } from "./medical-coding-card";
import styles from "./login.module.css";

const metrics = [
  {
    title: "Claim Readiness",
    value: "92",
    suffix: "%",
    helper: "Ready for submission",
    progress: 92,
    tone: "blue",
  },
  {
    title: "Evidence Package",
    value: "8",
    suffix: "/9",
    helper: "Documents verified",
    progress: 89,
    tone: "cyan",
  },
  {
    title: "Coverage Status",
    value: "Active",
    helper: "Policy validation passed",
    status: "success",
    tone: "green",
  },
  {
    title: "Payer Network",
    value: "450",
    suffix: "+",
    helper: "Insurance connections",
    progress: 78,
    tone: "azure",
  },
] as const;

const codingSummary = {
  icd10: "J18.9",
  procedure: "Chest X-Ray",
  drgGroup: "Valid",
  confidence: 96,
} as const;

export function LoginHero() {
  return (
    <section className={styles.heroLeft} aria-labelledby="login-hero-title">
      <div className={styles.heroGradient} aria-hidden="true" />
      <div className={styles.blueprintBg} aria-hidden="true" />

      <div className={`${styles.aurora} ${styles.auroraA}`} aria-hidden="true" />
      <div className={`${styles.aurora} ${styles.auroraB}`} aria-hidden="true" />
      <div className={`${styles.aurora} ${styles.auroraC}`} aria-hidden="true" />

      <svg
        className={styles.backgroundFlow}
        viewBox="0 0 1200 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="heroFlowGradient" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#7DD3FC" stopOpacity=".34" />
            <stop offset="1" stopColor="#2563EB" stopOpacity=".05" />
          </linearGradient>
        </defs>

        <path
          className={styles.backgroundFlowPath}
          d="M45 650 C190 505 305 610 440 480 S700 345 850 465 1030 605 1160 430"
          fill="none"
          stroke="url(#heroFlowGradient)"
          strokeWidth="1.5"
        />
        <path
          className={styles.backgroundFlowPathSecondary}
          d="M75 275 C250 170 385 275 520 178 S755 125 915 255 1035 320 1160 225"
          fill="none"
          stroke="#7DD3FC"
          strokeOpacity=".17"
          strokeWidth="1.2"
        />
      </svg>

      <div className={styles.heroInner}>
        <div className={styles.heroPlatformBadge}>
          <span className={styles.heroPlatformDot} aria-hidden="true" />
          Enterprise Intelligence Platform
        </div>

        <header className={styles.heroIdentity}>
          <span className={styles.identityIndicator} aria-hidden="true" />
          <div>
            <p className={styles.identityName}>Med AI NexSure</p>
            <p className={styles.identitySubtitle}>
              Enterprise Healthcare Intelligence
            </p>
          </div>
        </header>

        <div className={styles.heroStatement}>
          <h1 id="login-hero-title">
            <span>From Clinical Evidence</span>
            <span className={styles.heroHeadlineAccent}>
              to Claim Confidence.
            </span>
          </h1>

          <p className={styles.heroDescription}>
            <strong>Explainable claim intelligence</strong> that detects gaps,
            validates requirements, and flags <em>cost and risk</em> before
            submission.
          </p>

          <div className={styles.governanceLabels}>
            <span>Explainable by Design</span>
            <i aria-hidden="true">•</i>
            <span>Human-Governed</span>
            <i aria-hidden="true">•</i>
            <span>PDPA-Aligned</span>
          </div>
        </div>

        <div className={styles.metricsGrid} aria-label="Claim intelligence metrics">
          {metrics.map((metric) => (
            <ClaimMetricCard key={metric.title} metric={metric} />
          ))}
        </div>

        <IntelligenceStage />

        <MedicalCodingCard summary={codingSummary} />
      </div>
    </section>
  );
}
