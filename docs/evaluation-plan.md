# Evaluation and release gates

Research question: can evidence-aware correlation retain useful detection under delayed, reordered or incomplete endpoint telemetry? This is a candidate contribution; conduct a literature review before claiming novelty.

Baselines: single-event rules; straightforward sequence correlation; proposed missing/late-evidence method. Use identical sources and scenarios, frozen versions and equal resource budgets.

Ground truth is maintained independently of detector output. Collect normal installations, updates, administration and development alongside controlled suspicious simulations. Distinguish simulated activity from actual malware. Separate development/tuning traces from held-out evaluation; do not split near-duplicate traces across sets.

Inject bounded bursts, disconnections, duplicates, reordering, worker crashes, slow storage and known event removal. Retain experiment parameters, seeds where relevant and event accounting. Measure detection/misses, false alerts per endpoint-day, latency distributions, inconclusive fraction, backlog age/recovery, measured loss, CPU/RAM/disk and graph-link correctness.

Do not let an always-unknown result masquerade as accuracy. Report incomplete cases and costs alongside detection rates. Repeat runs and report variability. Infrastructure tests do not establish real malware coverage.

## Acceptance ledger
- Phase 0: baseline demo checks and design documents only.
- Phase 1+: live event proof with identities/timestamps and collector health.
- Reliability: account for generated test events as processed, pending, excluded or lost.
- Security: unauthorized access, hostile log text and malformed input checks.
- Recovery: independent restore and checkpoint/evidence reconciliation.
- Publication: reproducible artifacts, fair baselines, limitations and reviewed novelty claim.
