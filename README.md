# Endpoint Behaviour Lab

Independent Windows-to-Linux telemetry research prototype. Start with the [Kali Docker quickstart](docs/KALI-QUICKSTART.md). It launches a Wazuh collector and PostgreSQL, then supports explicit imports of real endpoint archives. Windows enrollment is required. No complete malware detector or live dashboard is claimed yet.

This repository contains independently developed scaffolding and configuration, not recovered ManageEngine binaries, customer data, credentials or endpoint logs. Historical reconstruction design notes below are references, not implemented product parity.

## Endpoint behaviour project — Phase 0

[Phase 2](docs/PHASE-2.md) now supplies offline Windows-event validation and PostgreSQL import. Run `npm run test:phase2` or the documented fixture dry run. Live collection and the dashboard's real-data integration remain pending.

Phase 1 collection-lab configuration and verification utilities are now described in [Phase 1](docs/PHASE-1.md). Live Windows telemetry is pending; the web demo still uses synthetic records.

The new independent Windows-to-Linux endpoint project is scoped in [Phase 0](docs/PHASE-0.md). See [architecture](docs/architecture.md), [threat model](docs/threat-model.md), [detection scenarios](docs/detection-rules.md), and [evaluation plan](docs/evaluation-plan.md). Reserved directories are listed in [the structure manifest](docs/phase-0-structure.json); `.gitkeep` files mark future implementation locations, not working features. Existing source files and the demo below remain intact. TypeScript/React, real collection, queueing and persistence are not yet implemented.

An evidence-informed engineering foundation for a vulnerability-management platform. **This is a read-only demo, not a working replacement for ManageEngine VMP.** It uses synthetic records and does not scan endpoints, deploy patches, authenticate users or connect to a database.

## Documents

- [System architecture](docs/SYSTEM-ARCHITECTURE.md): original vs proposed architecture, diagrams, module ownership, data flows, security, deployment and open decisions.
- [Technical implementation paper](docs/TECHNICAL-IMPLEMENTATION.md): contracts, repository layout, schema, job lifecycle, UI parity, phases, testing and release gates.
- Existing recovered evidence: `C:\edr\vmp-reconstruction\ANALYSIS.md`.

## Run

Requires Node.js 24+. Run `npm ci` before checks, tests or ingestion.

```powershell
Set-Location C:\edr\vmp-platform
npm.cmd run check
npm.cmd test
npm.cmd start
```

Open `http://127.0.0.1:4100`. Stop with Ctrl+C. Change the port with `$env:PORT='4101'` before starting. The development server binds only to loopback and has no production mode.

## Included

- HTTP API with health, module/capability status, synthetic assets/findings and consistent dashboard counts.
- Responsive console with visible demo status and explicit module readiness.
- Fourteen module specifications under `packages/modules`.
- Draft PostgreSQL foundation under `infra/database` (not applied or integration-tested).
- OpenAPI contract for the current demo, HTTP tests and structural checks.
- Worker and simulator boundaries with implementation requirements; no fake execution loop.

Known unimplemented module APIs return **501**; writes return **405**. Real persistence, identity, workers, feeds, agent protocol and exact original UI/UX remain future work. Do not expose this unauthenticated scaffold to a network.

## Evidence and generation

Keep recovered binaries/database exports out of this implementation tree. Proposed new schema is not a copy of the original database. See the papers for explicit evidence boundaries.

`scripts/scaffold.py` generates the module READMEs, catalog and OpenAPI starting contract. Update that script before regenerating those files. The runnable server, UI, SQL and tests are hand-authored. Use the implementation paper's phase gates before changing status from design to implemented or verified.
