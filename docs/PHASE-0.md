# Phase 0 — endpoint behaviour monitoring

Date: 2026-10-31. Status: design and repository structure established; live collection not implemented.

## Objective
Build an independent Windows-to-Linux telemetry pipeline with evidence-backed behaviour alerts, process trees and timelines. Investigate detection under delayed or incomplete telemetry. Novelty and publication acceptance are not established.

## Inspected baseline
- Existing package: vmp-platform-skeleton; plain Node.js ES modules and vanilla browser JavaScript.
- apps/api/main.mjs binds to 127.0.0.1; server.mjs serves synthetic records, rejects writes and returns 501 for unimplemented modules.
- Existing contracts/openapi.json describes the demo, not the proposed platform.
- Agent and worker boundaries are design-only. No real database, enrollment or malware detection is established.
- Existing tests cover five demo behaviours. No Git repository was present at inspection.
- Older SYSTEM-ARCHITECTURE.md and TECHNICAL-IMPLEMENTATION.md concern VMP reconstruction. The endpoint project described here is a separate, narrower direction; those documents are historical context.

## First release
One Windows test VM, one Linux server, Sysmon and selected Windows channels, supported Wazuh collection, three custom rule scenarios, local investigation UI and alert-only operation. No custom driver, automatic response, ML, clustering, proprietary agent compatibility or patch deployment.

## Decisions
1. Preserve the running demo until replacement paths are tested; never silently mix fixtures and live records.
2. Use TypeScript/Node.js for custom services and React/Vite for the future UI. These dependencies are not installed in Phase 0.
3. Use Wazuh for collection and baseline analysis. Validate a relevant-event export path before building the custom ingestion adapter; Wazuh alerts alone are insufficient.
4. Use RabbitMQ for the custom queue and PostgreSQL for application records. A single host is not highly available.
5. Keep graph relationships in PostgreSQL initially. Render bounded subgraphs with React Flow later.
6. Human login may be absent only on the loopback development interface. Agent, broker and database authentication remain required. LAN UI access requires a separate authenticated release.
7. Exact dependency and Wazuh versions will be pinned after compatibility verification in Phase 1, not guessed here.

## Phase gates
| Phase | Deliverable | Exit evidence |
|---|---|---|
| 0 | Scope, contracts design, threat model, scenarios, structure | Documents and baseline checks |
| 1 | One enrolled Windows endpoint and Linux collector | Known event arrives; identity and collector failure visible |
| 2 | Normalized ingestion and persistence | Malformed input and duplicate/reset cases tested |
| 3 | Durable queue and recovery | Restart/replay accounting; bounded resource behaviour |
| 4 | Three baseline rules | Labelled positives and benign controls |
| 5 | Real dashboard and behaviour maps | Every relationship links to evidence; no fixture contamination |
| 6 | Burst/loss/delay experiments | Reproducible accuracy, latency and resource measurements |
| 7 | Research improvement | Fair baseline comparison and failure analysis |
| 8 | Packaging and hardening | Independent restore, upgrade and access checks |
| 9 | Optional scale | A measured bottleneck and tested failover |

## Phase 1 prerequisites and unresolved choices
- Supply a Windows test VM, administrative deployment authority and a reachable Linux target.
- Confirm available CPU/RAM/disk against the chosen Wazuh version's requirements.
- Validate raw/relevant-event export semantics, log rotation, checkpoint recovery and retention.
- Choose event-channel filters based on detection requirements; establish initial EPS/size measurements.
- Define resource budgets from measurements before accepting sustained-load claims.
- Network discovery is out of scope: onboarding is explicit and limited to authorised test endpoints.

## Completion boundary
Phase 0 creates documentation and reserved directories only. No remote deployment, endpoint installation, infrastructure startup, database migration or working TypeScript service is claimed.
