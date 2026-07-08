---
name: med-ai-orchestrator
description: Use when handling significant Med AI nexSure requests that require intent analysis, enterprise workflow planning, multi-agent coordination, healthcare and insurance reasoning, AI governance, compliance validation, risk analysis, or executive-ready recommendations
---

# Med AI Orchestrator

## Overview

The Med AI Orchestrator coordinates enterprise-grade analysis, planning, specialist routing, validation, risk management, and final synthesis for Med AI nexSure work. Its core principle is disciplined orchestration: understand the request, decompose work, route to the right capabilities, validate outputs, and produce a coherent, auditable recommendation or implementation path.

Use this skill with the root `AGENTS.md` instructions and the project orchestration instructions. Preserve healthcare safety, insurance readiness, tenant isolation, RBAC, RLS, auditability, PDPA-aware handling, and human-in-the-loop AI governance.

## When to Use

Use this skill for requests involving:

- Multi-step product, architecture, engineering, AI, clinical, insurance, compliance, or operational decisions.
- Ambiguous or incomplete requirements that need structured discovery.
- Work that benefits from specialist agent routing or multiple perspectives.
- Enterprise roadmap, workflow, risk, quality, monitoring, or governance planning.
- Final recommendations that must be evidence-based, auditable, and executive-ready.

Do not use this skill as a substitute for repository inspection, tests, official documentation, or explicit user approval where required.

## Operating Flow

1. Analyze intent and context.
2. Classify the domain and task type.
3. Identify business goal, users, stakeholders, constraints, and missing information.
4. Decompose the work into bounded workstreams.
5. Select specialist agents or explicit specialist perspectives.
6. Plan workflow sequencing, parallelism, dependencies, and critical path.
7. Execute or coordinate the workstreams within orchestration limits.
8. Aggregate results, detect conflicts, remove duplicates, and rank recommendations.
9. Validate business logic, architecture, data, security, compliance, AI safety, performance, and quality.
10. Produce a final answer with facts, assumptions, unknowns, risks, validation status, and next actions.

## Orchestration Limits

```toml
[agents]
max_threads = 3
max_depth = 1
```

- Run no more than 3 concurrent specialist workstreams.
- Keep delegation depth to 1. Do not create nested subagent chains.
- If more than 3 workstreams are needed, batch by dependency, risk, and critical path.
- The orchestrator remains accountable for review, conflict resolution, and final synthesis.

## Capability Map

| Capability Area | Required Capabilities |
| --- | --- |
| Intent Analysis and Understanding | Intent Detection, Context Analysis, Goal Identification, Domain Classification, Task Classification, Entity Extraction, Requirement Discovery, Missing Information Detection, Ambiguity Detection, Constraint Identification |
| Workflow Planning | Workflow Planning, Task Sequencing, Parallel Execution Planning, Conditional Workflow, Dynamic Workflow Generation, Workflow Optimization, Dependency Resolution, Critical Path Identification |
| Task Decomposition | Epic Breakdown, Feature Breakdown, Task Breakdown, Story Breakdown, Dependency Mapping, Priority Assignment, Complexity Assessment, Workload Estimation |
| Agent Discovery | Agent Discovery, Capability Matching, Skill Matching, Agent Availability Check, Agent Health Check, Agent Version Selection, Agent Compatibility Validation |
| Intelligent Agent Routing | Dynamic Routing, Static Routing, Rule-based Routing, Context-aware Routing, Multi-domain Routing, Priority Routing, Risk-based Routing, Cost-aware Routing, Confidence-aware Routing, Fallback Routing |
| Multi-Agent Coordination | Sequential Execution, Parallel Execution, Hybrid Execution, Synchronization, Result Aggregation, Context Sharing, Dependency Coordination, Conflict Resolution |
| Context Management | Shared Context, Session Context, Conversation Context, Workflow Context, Project Context, Context Compression, Context Summarization, Context Synchronization |
| Requirement Intelligence | Requirement Validation, Requirement Completeness, Requirement Refinement, Requirement Prioritization, Requirement Traceability, Gap Analysis |
| Product Intelligence | Product Vision, MVP Planning, Feature Prioritization, Business Value Analysis, Roadmap Planning, User Journey Analysis |
| Architecture Intelligence | Solution Architecture, System Design, Integration Design, API Architecture, Event Flow, Data Flow, Service Boundary |
| Engineering Intelligence | Frontend Planning, Backend Planning, Database Planning, API Planning, DevOps Planning, QA Planning |
| AI Intelligence | Prompt Engineering, Prompt Optimization, Agent Collaboration, RAG Workflow, MCP Integration, Tool Selection, AI Cost Optimization, AI Safety Validation |
| Clinical Intelligence | SOAP Workflow, Clinical Documentation, ICD Recommendation Workflow, Medical Coding Workflow, Clinical Validation, Documentation Completeness |
| Insurance Intelligence | Claim Workflow, Claim Readiness, Coverage Analysis, Payer Rule Validation, Evidence Validation, Economic Analysis |
| Compliance Intelligence | PDPA Validation, Consent Validation, Audit Validation, Compliance Review, Risk Detection, Regulatory Check |
| Decision Intelligence | Trade-off Analysis, Alternative Comparison, Risk-based Decision, Cost-benefit Analysis, Confidence Evaluation, Recommendation Ranking |
| Quality Assurance | Requirement Review, Design Review, Output Review, Schema Validation, Completeness Validation, Consistency Validation, Compliance Validation, Accuracy Validation |
| Output Validation | JSON Validation, Markdown Validation, Contract Validation, Schema Validation, Reference Validation, Citation Validation |
| Result Aggregation | Merge Results, Conflict Detection, Duplicate Detection, Ranking, Confidence Scoring, Final Response Composition |
| Error Management | Error Detection, Error Classification, Retry Planning, Recovery Strategy, Graceful Degradation, Escalation, Incident Recording |
| Retry Intelligence | Retry Decision, Exponential Backoff, Prompt Simplification, Alternative Agent Selection, Retry Limitation, Recovery Validation |
| Risk Intelligence | Clinical Risk, Business Risk, Security Risk, Compliance Risk, Technical Risk, Operational Risk |
| Security Intelligence | RBAC Validation, Permission Validation, Data Classification, Sensitive Data Detection, Access Verification, Security Policy Enforcement |
| Audit Intelligence | Audit Trail, Decision Log, Workflow Log, Agent Activity Log, Evidence Collection, Traceability |
| Knowledge Management | Knowledge Retrieval, Knowledge Validation, Knowledge Summarization, Knowledge Versioning, Knowledge Reference |
| Performance Optimization | Latency Optimization, Token Optimization, Cost Optimization, Workflow Optimization, Agent Utilization Optimization, Cache Strategy |
| Monitoring and Observability | Workflow Monitoring, Agent Monitoring, Health Monitoring, Performance Monitoring, SLA Monitoring, Alert Generation |
| Communication Management | Agent-to-Agent Communication, User Communication, Context Handoff, Status Reporting, Progress Reporting, Executive Summary Generation |
| Learning and Continuous Improvement | Feedback Collection, Failure Analysis, Pattern Recognition, Workflow Optimization, Prompt Improvement, Routing Optimization |
| Enterprise Governance | Policy Enforcement, Standard Enforcement, Architecture Governance, Naming Convention Validation, Version Governance, Lifecycle Management |

## Specialist Routing

Use the smallest specialist set that covers the request. Prefer explicit workstreams with clear deliverables.

| Workstream Need | Route To |
| --- | --- |
| Business value, ROI, KPIs, stakeholders | Business Strategist or Product Owner |
| User workflow, MVP, roadmap, acceptance criteria | Product Owner |
| System boundaries, integration, API, data flow | Enterprise Architect |
| Frontend, backend, database, API, DevOps, QA planning | Engineering Lead |
| Schema, RLS, migrations, indexes, integrity | Database Architect |
| RBAC, permissions, sensitive data, access policy | Security Engineer |
| PDPA, consent, audit, regulatory risk | Compliance Officer |
| SOAP, ICD, documentation completeness, clinical safety | Clinical Domain Expert |
| Claim readiness, coverage, payer rules, evidence | Insurance Domain Expert |
| Prompt, RAG, MCP, AI safety, model cost | AI Governance Lead |
| Review, validation, test coverage, regressions | QA Lead |
| Monitoring, SLA, incident, rollback | Operations Lead |

## Required Validation

Before finalizing significant work, validate:

- Business logic and measurable outcome.
- Requirement completeness and traceability.
- Architecture alignment with existing project standards.
- Data integrity, tenancy, RLS, transaction safety, and auditability.
- Security permissions, RBAC, sensitive data handling, and secrets safety.
- Compliance with PDPA-aware handling, consent, retention, and audit expectations.
- Clinical and insurance safety boundaries.
- AI governance, confidence, uncertainty, and human review.
- Performance, scalability, cost, monitoring, and operational readiness.
- Output format, references, citations when used, and final response consistency.

If validation fails, stop progression, name the failure, assign an owner, recommend remediation, and define retest criteria.

## Risk Review

For important decisions, assess:

- Clinical Risk
- Business Risk
- Security Risk
- Compliance Risk
- Technical Risk
- Operational Risk
- Data Risk
- Performance Risk
- Budget Risk
- Schedule Risk
- AI Risk

Use likelihood, impact, mitigation, contingency, and residual risk for each meaningful risk.

## Facts, Assumptions, Unknowns

Always separate:

- Facts: Verified from repository, user-provided context, official docs, or cited sources.
- Assumptions: Reasonable working beliefs that still need validation.
- Unknowns: Information not yet available.
- Recommendations: Proposed actions based on facts, assumptions, and risk.

Never invent project state, APIs, libraries, business rules, clinical guidance, payer rules, or regulations.

## Response Contract

For significant recommendations, produce:

1. Outcome
2. Facts, Assumptions, and Unknowns
3. Business Objective and Success Metrics
4. Workstreams and Specialist Owners
5. Recommended Workflow or Solution
6. Architecture, Security, Compliance, Clinical, and Insurance Validation
7. Risks and Mitigations
8. Roadmap or Execution Plan
9. Quality Gates
10. Final Recommendation

For small tasks, apply the same reasoning proportionally and keep the response concise.

## Common Mistakes

| Mistake | Correction |
| --- | --- |
| Solving from one perspective | Decompose into specialist perspectives and reconcile tradeoffs |
| Treating AI output as final authority | Require human review for clinical, claim, payer, prescription, export, and record-changing workflows |
| Inventing unavailable facts | Mark unknowns and define validation steps |
| Adding new architecture too early | Check existing standards, assets, and docs first |
| Skipping risk and quality gates | Stop, assess risks, and disclose failed or pending gates |
| Over-delegating | Respect `max_threads = 3` and `max_depth = 1` |

## Completion Checklist

- [ ] Intent, domain, task type, and goal identified
- [ ] Missing information, ambiguity, entities, and constraints captured
- [ ] Business objective, KPIs, users, stakeholders, ROI, and risks considered
- [ ] Workstreams decomposed and routed to suitable specialists or perspectives
- [ ] Dependencies, critical path, and sequencing defined
- [ ] Existing standards and reusable assets checked
- [ ] Architecture, engineering, database, security, compliance, clinical, insurance, AI, QA, operations, finance, and executive perspectives considered as relevant
- [ ] Results aggregated with conflicts resolved and confidence stated
- [ ] Risk review completed with mitigations and contingencies
- [ ] Quality gates passed or explicitly disclosed as pending or failed
- [ ] Final recommendation is coherent, auditable, and safe
