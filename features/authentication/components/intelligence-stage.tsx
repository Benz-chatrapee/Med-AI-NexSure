import Image from "next/image";

import styles from "./login.module.css";

export function IntelligenceStage() {
  return (
    <section
      className={styles.intelligenceStage}
      aria-label="Dr. Benz clinical intelligence assistant"
    >
      <div className={styles.stageHalo} aria-hidden="true" />
      <div className={styles.intelligenceRing} aria-hidden="true" />
      <div className={styles.intelligenceRingInner} aria-hidden="true" />

      <svg
        className={styles.sceneNetwork}
        viewBox="0 0 920 360"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <g
          fill="none"
          stroke="#7DD3FC"
          strokeOpacity=".24"
          strokeWidth="1.3"
        >
          <path
            className={styles.networkFlow}
            d="M70 204 C178 82 286 92 408 165 S620 278 842 118"
          />
          <path
            className={styles.networkFlowAlt}
            d="M128 274 C276 214 352 286 477 214 S668 86 804 228"
          />
          <path
            className={styles.networkBridge}
            d="M408 165 L477 214 L590 128 L692 168"
          />
        </g>

        <g className={styles.networkNodes}>
          <circle cx="70" cy="204" r="6" />
          <circle cx="244" cy="88" r="5" />
          <circle cx="408" cy="165" r="8" />
          <circle cx="590" cy="128" r="5" />
          <circle cx="692" cy="168" r="5" />
          <circle cx="842" cy="118" r="6" />
        </g>

        <g className={styles.networkLabels}>
          <text x="43" y="230">Clinical</text>
          <text x="221" y="70">SOAP</text>
          <text x="394" y="148">AI</text>
          <text x="565" y="110">Claim</text>
          <text x="650" y="195">Compliance</text>
          <text x="802" y="100">Analytics</text>
        </g>
      </svg>

      <div className={styles.ekgLayer} aria-hidden="true">
        <svg viewBox="0 0 1200 260" preserveAspectRatio="none">
          <path
            className={styles.ekgGlow}
            d="M0 130 H170 L205 130 L232 58 L268 207 L303 130 H450 L485 130 L520 89 L555 171 L590 130 H754 L790 130 L825 48 L866 216 L906 130 H1200"
          />
          <path
            className={styles.ekgMain}
            d="M0 130 H170 L205 130 L232 58 L268 207 L303 130 H450 L485 130 L520 89 L555 171 L590 130 H754 L790 130 L825 48 L866 216 L906 130 H1200"
          />
        </svg>
      </div>

      <span className={`${styles.domainLabel} ${styles.domainEconomic}`}>
        Economic
      </span>
      <span className={`${styles.domainLabel} ${styles.domainClaims}`}>
        Claims
      </span>
      <span className={`${styles.domainLabel} ${styles.domainCompliance}`}>
        Compliance
      </span>

      <span
        className={`${styles.dataLine} ${styles.lineEconomic}`}
        aria-hidden="true"
      />
      <span
        className={`${styles.dataLine} ${styles.lineClaims}`}
        aria-hidden="true"
      />
      <span
        className={`${styles.dataLine} ${styles.lineCompliance}`}
        aria-hidden="true"
      />

      <div className={styles.drBenz}>
        <Image
          className={styles.drBenzImage}
          src="/images/dr-benz/dr-benz-login.png"
          alt="Dr. Benz AI clinical intelligence assistant"
          width={680}
          height={1016}
          priority
        />
      </div>

      <div className={styles.drShadow} aria-hidden="true" />

      <div className={styles.aiStatus}>
        <span className={styles.aiStatusDot} aria-hidden="true" />
        <div>
          <strong>AI Intelligence Online</strong>
          <span>Decision Support · Human Governed</span>
        </div>
      </div>

      <p className={styles.aiDisclaimer}>
        Explainable clinical intelligence · Human review remains required
      </p>
    </section>
  );
}
