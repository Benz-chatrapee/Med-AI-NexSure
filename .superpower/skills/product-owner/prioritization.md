# Product Owner Prioritization

## MoSCoW

Use MoSCoW when MVP boundaries are the central decision.

- Must Have: Required for safe, compliant MVP operation.
- Should Have: Important but not launch-blocking.
- Could Have: Valuable if capacity allows.
- Won't Have: Explicitly out of scope for the release.

## WSJF

Use Weighted Shortest Job First when sequencing high-value enterprise work.

Score: `(Business Value + Time Criticality + Risk Reduction) / Job Size`.

## RICE

Use RICE when reach and measurable impact are known.

Score: `(Reach x Impact x Confidence) / Effort`.

## ICE

Use ICE for early discovery when reach data is limited.

Score: `Impact x Confidence x Ease`.

## Kano

Use Kano to balance basic expectations, performance features, and delighters.

- Basic: Expected by users and regulators.
- Performance: More is better.
- Delighter: Creates satisfaction but is not required.

## Business Value

Assess revenue impact, cost reduction, operational efficiency, stakeholder value, strategic alignment, and learning value.

## Risk Matrix

Rate each risk by impact and probability. High-impact clinical, compliance, security, or insurance risks can override business value.

## Technical Complexity

Consider integration effort, data dependencies, implementation uncertainty, testing effort, migration needs, and operational support.

## Clinical Risk

Increase priority for controls that protect patient safety, preserve clinician authority, improve documentation quality, or reduce unsafe AI reliance.

## Insurance Risk

Increase priority for controls that prevent automatic claim approval, policy misinterpretation, evidence fabrication, or unsupported readiness claims.

## Compliance Risk

Increase priority for auditability, privacy, access control, consent, retention, traceability, and regulatory review.

## Dependency Mapping

Sequence work by upstream requirements, data availability, architecture needs, policy sources, clinical validation, QA readiness, and compliance review.

## ROI Scoring

Compare expected value against effort, risk, time to learn, and operational cost. Use ROI as an input, not a replacement for safety and compliance gates.

## MVP Prioritization

MVP work must be safe, compliant, useful, testable, and learnable. Exclude work that expands scope without proving the core workflow.
