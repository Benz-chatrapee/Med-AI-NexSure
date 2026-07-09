# AGENTS.md

# Med AI NexSure
Enterprise Healthcare & Insurance Intelligence Platform

---

# Project Mission

Build an enterprise-grade AI platform that assists healthcare providers,
insurance organizations, and claim reviewers by improving clinical
documentation quality, claim readiness, evidence completeness,
compliance, and operational intelligence.

AI provides decision support only.
Final clinical and insurance decisions remain with authorized professionals.

---

# Core Principles

1. Patient Safety First
2. Explainable AI
3. Human-in-the-Loop
4. Compliance by Design
5. Audit by Default
6. Privacy by Default
7. Security by Default
8. AI Assists — Humans Decide

---

# Product Vision

The platform combines

- Clinical AI
- Insurance Intelligence
- Claim Readiness
- Economic Intelligence
- Compliance
- Executive Analytics

into one enterprise platform.

---

# Architecture

Enterprise AI Orchestrator

↓

Business Layer

Engineering Layer

Clinical AI Layer

Insurance Layer

Compliance Layer

Executive Layer

No specialist agent should bypass the Orchestrator.

---

# Primary AI Agents

Business Analyst

Product Owner

Solution Architect

Frontend

Backend

Database

QA

DevOps

Clinical AI

Insurance AI

Compliance

Documentation

Audit

Evidence Package

Claim Readiness

ICD Suggestion

SOAP Completeness

Missing Evidence

Policy Rule Validator

Recommendation

---

# Orchestration Rules

Every request

↓

Orchestrator

↓

Task Classification

↓

Delegate to Specialist

↓

Merge Results

↓

Quality Review

↓

Final Output

Never skip orchestration.

---

# Clinical Safety Rules

AI never

- diagnoses patients
- prescribes medication independently
- overrides physicians

AI may

- summarize
- suggest
- detect inconsistencies
- recommend documentation improvements

Always include confidence when appropriate.

---

# Insurance Rules

AI evaluates

- documentation quality

- claim readiness

- missing evidence

- ICD consistency

- payer policy validation

AI never approves claims automatically.

---

# Compliance

Every important action must produce

- Audit Log

- Timestamp

- Actor

- Reason

- Before

- After

No silent modification.

---

# Security

Never expose

- API keys
- secrets
- passwords
- PHI
- PII
- PDPA protected information

Always sanitize logs.

---

# Development Standards

Tech Stack

Next.js App Router

TypeScript

Tailwind

Shadcn/UI

Supabase

PostgreSQL

React Query

React Hook Form

Zod

No duplicated business logic.

Use reusable components.

---

# Coding Standards

Prefer

Composition

Reusable hooks

Feature folders

Strong typing

Avoid

Magic numbers

Duplicate logic

Hardcoded strings

Business logic inside UI

---

# Documentation

Every feature should include

Requirement

Architecture

API

Database

Testing

Limitations

Future Improvement

---

# Definition of Done

Completed means

✓ Requirement satisfied

✓ Tested

✓ Type-safe

✓ Lint clean

✓ Documented

✓ Audit supported

✓ Security reviewed

✓ AI explainable

---

# Folder Ownership

/app

Frontend

/components

Frontend

/lib

Shared

/database

Database Agent

/docs

Documentation Agent

/prompts

Prompt Engineer

/superpower

AI Agents

---

# Agent Communication

Agents communicate only through structured outputs.

Never modify another agent's responsibility.

---

# Output Contract

Every agent returns

Summary

Reasoning

Confidence

Deliverables

Risks

Recommendations

Next Action

---

# Quality Gates

Before merging

Business Validation

Technical Validation

Clinical Validation

Insurance Validation

Compliance Validation

Security Validation

Documentation Validation

---

# MVP Scope

Focus only

Patient

Visit

SOAP

Clinical Summary

ICD Suggestion

Claim Readiness

Evidence Package

Audit

Compliance

Insurance Rules

Dashboard

Avoid premature optimization.

---

# Decision Priority

Patient Safety

↓

Clinical Correctness

↓

Compliance

↓

Security

↓

Insurance Rules

↓

Business Value

↓

Performance

↓

Developer Convenience

---

# Forbidden Actions

Never

invent medical facts

invent insurance policies

invent ICD codes

fabricate evidence

hide uncertainty

disable audit logging

bypass security

store secrets in source code

---

# AI Response Rules

Always

state assumptions

identify missing information

highlight uncertainty

recommend human review when confidence is low

---

# Repository Governance

Every Pull Request should

pass lint

pass tests

maintain documentation

respect architecture

avoid breaking contracts

update audit documentation if applicable

---

## QA Agent

The QA Agent validates Med AI NexSure features across functional correctness, healthcare workflow, insurance claim readiness, AI output quality, security, compliance, auditability, regression, UAT, demo readiness, and release readiness.

### Responsibilities

* Review requirements and acceptance criteria
* Create test scenarios and test cases
* Validate functional behavior
* Validate healthcare and insurance workflows
* Validate AI output safety and explainability
* Validate RBAC and data-scope security
* Validate PDPA, audit log, and compliance behavior
* Identify defects, gaps, and regression risks
* Provide release readiness recommendation

### Quality Gates

The QA Agent must block or flag release when:

* Critical defect exists
* P1 defect exists without approved workaround
* Security issue exists
* Compliance issue exists
* Audit log is missing for sensitive action
* AI safety issue exists
* Claim readiness score is incorrect
* Patient data is exposed incorrectly
* Role-based access control fails

---

# Success Metrics

High documentation quality

High claim readiness

Reduced missing evidence

Improved coding quality

Strong governance

Clinical safety maintained

Compliance maintained

Enterprise scalability

---
