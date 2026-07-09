# Insurance QA Agents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Med AI NexSure Insurance Agent and QA Agent documentation/configuration so both agents support MVP claim readiness, evidence package, policy validation, audit readiness, and human-in-the-loop safety.

**Architecture:** Merge requested agent capabilities into the existing `.superpower`, `.codex`, and `.agents` architecture without deleting prior governance. Insurance remains a specialist decision-support agent; QA remains a quality-gate agent with traceable testability and release-readiness outputs.

**Tech Stack:** Markdown skill documentation, TOML Codex agent configuration, Next.js repository validation through npm scripts.

## Global Constraints

- Preserve all existing QA and Insurance content.
- Upgrade files in place instead of replacing them.
- Create any missing files required by the Med AI NexSure architecture.
- Do not remove existing governance unless it is obsolete.
- Keep every AI Agent as Decision Support only.
- Validate repository structure, Markdown formatting, TOML syntax, internal references, and `npm run lint`.
- Report missing test/typecheck scripts instead of failing.

---

### Task 1: Insurance Skill Expansion

**Files:**
- Modify: `.superpower/skills/insurance/SKILL.md`
- Create: `.superpower/skills/insurance/templates.md`
- Create: `.superpower/skills/insurance/checklists.md`
- Create: `.superpower/skills/insurance/workflows.md`
- Create: `.superpower/skills/insurance/claim-readiness.md`
- Create: `.superpower/skills/insurance/payer-rules.md`
- Create: `.superpower/skills/insurance/evidence.md`
- Create: `.superpower/skills/insurance/healthcare.md`
- Create: `.superpower/skills/insurance/examples.md`

**Interfaces:**
- Consumes: Visit, SOAP, diagnosis, ICD, prescription, procedure, evidence, payer rule, cost, and orchestrator context.
- Produces: Claim readiness score/status, score breakdown, missing evidence, payer rule results, coverage indicator, risk level, recommendations, human review requirement, and audit notes.

- [x] **Step 1: Preserve existing governance**

Keep existing Insurance governance source, mission, responsibilities, inputs, outputs, guardrails, handoff format, and definition of done inside the upgraded SKILL file.

- [x] **Step 2: Add requested MVP logic**

Add score weights, thresholds, risk levels, reason codes, confidence, escalation, evidence severity, and decision-support-only boundaries.

- [x] **Step 3: Add focused support documents**

Create the requested templates, checklists, workflows, claim readiness, payer rules, evidence, healthcare, and examples files.

### Task 2: QA Skill Expansion

**Files:**
- Modify: `.superpower/skills/qa/SKILL.md`
- Modify: `.superpower/skills/qa/templates.md`
- Modify: `.superpower/skills/qa/checklists.md`
- Modify: `.superpower/skills/qa/workflows.md`
- Modify: `.superpower/skills/qa/test-strategy.md`
- Create: `.superpower/skills/qa/acceptance-criteria.md`
- Create: `.superpower/skills/qa/automation.md`
- Create: `.superpower/skills/qa/insurance-qa.md`
- Modify: `.superpower/skills/qa/examples.md`

**Interfaces:**
- Consumes: Requirements, user stories, acceptance criteria, workflows, UI/API/DB contracts, role matrix, audit requirements, payer rules, and insurance output.
- Produces: QA review, requirement quality score, acceptance criteria review, test scenarios, test cases, risk analysis, QA decision, blockers, and handoff.

- [x] **Step 1: Preserve existing QA governance**

Keep the current QA role, mission, scope, capabilities, quality gates, healthcare/insurance/AI/compliance rules, severity model, and handoff guidance.

- [x] **Step 2: Add requested output contract and insurance QA**

Add the requested QA review contract, testability rules, traceability rules, claim readiness matrix, and insurance-specific QA templates/checklists/workflows.

### Task 3: Codex and Agent Definitions

**Files:**
- Create: `.codex/agents/insurance.toml`
- Modify: `.codex/agents/qa.toml`
- Create: `.agents/insurance-agent.md`
- Modify: `.agents/qa-agent.md`

**Interfaces:**
- Consumes: `.superpower/skills/insurance/SKILL.md` and `.superpower/skills/qa/SKILL.md`.
- Produces: Agent metadata, capabilities, guardrails, output requirements, and handoff definitions compatible with the existing Codex agent structure.

- [x] **Step 1: Add Insurance TOML config**

Create a TOML config with high safety level, insurance capabilities, human review escalation, and output requirements.

- [x] **Step 2: Upgrade QA TOML config**

Merge requested QA capabilities and guardrails into the existing config.

- [x] **Step 3: Add/upgrade human-readable agent definitions**

Create Insurance agent definition and append the stricter QA required output contract to the existing QA agent definition.

### Task 4: Validation

**Files:**
- Validate all files created or modified above.

**Interfaces:**
- Consumes: Repository files and `package.json` scripts.
- Produces: validation report.

- [x] **Step 1: Validate structure**

Check all requested files exist.

- [x] **Step 2: Validate Markdown**

Check that files have clear headings and no empty placeholder sections.

- [x] **Step 3: Validate TOML**

Parse TOML agent configs.

- [x] **Step 4: Validate npm lint**

Run `npm run lint`.

- [x] **Step 5: Report missing scripts**

Report that `typecheck` and `test` scripts are unavailable when absent from `package.json`.
