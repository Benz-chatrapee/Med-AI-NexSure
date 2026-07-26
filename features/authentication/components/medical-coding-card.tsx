import { Activity, CheckCircle2 } from "lucide-react";

import styles from "./login.module.css";

type MedicalCodingSummary = {
  icd10: string;
  procedure: string;
  drgGroup: string;
  confidence: number;
};

export function MedicalCodingCard({
  summary,
}: {
  summary: MedicalCodingSummary;
}) {
  return (
    <section className={styles.codingCard} aria-label="Medical coding summary">
      <span className={styles.codingScan} aria-hidden="true" />

      <header className={styles.codingHeader}>
        <div className={styles.codingTitle}>
          <Activity aria-hidden="true" size={19} />
          <div>
            <p>Medical Coding</p>
            <strong>Validation Complete</strong>
          </div>
        </div>

        <span className={styles.validationState}>
          <CheckCircle2 aria-hidden="true" size={15} />
          Verified
        </span>
      </header>

      <div className={styles.codingGrid}>
        <CodingCell label="ICD-10" value={summary.icd10} />
        <CodingCell label="Procedure" value={summary.procedure} />
        <CodingCell label="DRG Group" value={summary.drgGroup} />
        <CodingCell
          label="Coding Confidence"
          value={`${summary.confidence}%`}
        />
      </div>
    </section>
  );
}

function CodingCell({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.codingCell}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
