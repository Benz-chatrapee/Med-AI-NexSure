# Med AI NexSure MVP1 Workflow

## Orchestrator-First Flow

1. User request enters the Med AI Orchestrator.
2. Orchestrator classifies the task and identifies missing information.
3. Orchestrator routes to up to 3 specialist agents at one level of depth.
4. Specialists return structured outputs using `.codex/templates/agent-output-contract.md`.
5. Orchestrator consolidates outputs, resolves conflicts, and applies quality gates.
6. Final response includes recommendation, risks, assumptions, dependencies, and next action.

## Specialist Expansion

Future specialists should follow the same structure:

- `soap-completeness`
- `clinical-summary`
- `claim-readiness`
- `evidence-package`
- `audit-compliance`
- `qa`
- `documentation`
- `prompt-engineer`

## Safety Rule

Clinical, insurance, and compliance workflows remain decision support only and require human review.
