# Threat model — Phase 0

Assets: endpoint identities, telemetry, credentials, detection state, evidence, administrative settings and availability.
Trust boundaries: endpoint -> Wazuh; source export -> ingest; broker -> worker; database -> API; API -> browser. An authenticated endpoint can still be compromised and submit false content.

| Threat | Planned control | Verification |
|---|---|---|
| Device impersonation | Supported enrollment, unique identity, protected transport, revocation | Reject unknown/revoked identities |
| Event forgery by enrolled host | Preserve provenance; avoid assuming authenticated means truthful | Mark source and uncertainty |
| Malformed/oversized events | Schema, byte/depth limits, bounded failure quarantine | Parser fuzz/negative fixtures |
| Browser script injection | Render text safely, restrictive CSP | HTML/script-like event fixture |
| No-login UI exposure | Loopback-only mode; fail closed on public bind; origin protections | Bind/origin tests before writes |
| Replay/duplicates | Source-aware identity, unique constraints, idempotent alerts | Duplicate delivery and restart |
| Event flood/storage exhaustion | Quotas, bounded queues, retention, explicit drop metrics | Noisy device and disk-pressure tests |
| False linkage | Device/process identity and evidence-backed edges | PID reuse, missing-parent and unrelated-event tests |
| Credential leakage | Secret files/OS stores, redacted operational logging | Repository and log review |
| Evidence loss | Durable snapshots, checkpoints, backup/restore | Independent restore and reconciliation |
| Unsafe response | Alert-only scope | No arbitrary command execution path |

Before enabling LAN administrative access add authenticated sessions, role checks, CSRF protection where applicable, audit records and credential recovery. This document defines required controls; it does not claim they are implemented.
