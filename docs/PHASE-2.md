# Phase 2 — offline event ingestion and persistence

Implemented: v1 JSON Schema, strict validation, Wazuh Windows mapper, byte-bounded JSONL reader, PostgreSQL migration and transactional repository, explicit file-import CLI and synthetic tests. No live collector, event HTTP endpoint, queue, detection or dashboard integration is claimed. Phase 1 enrollment remains pending.

## Implementation choice
Use existing Node ES-module runtime for this increment, with JSON Schema as the executable contract. TypeScript migration is deferred rather than creating non-running .ts placeholders. Runtime dependencies: pg and ajv; PGlite is development-only for SQL tests. Exact resolved versions are in package-lock.json. Run npm ci for reproducible dependency installation.

## Validate a fixture without a database
```powershell
npm.cmd run ingest:file -- --file tests/fixtures/phase2-synthetic.jsonl --manager fixture-manager --epoch fixture-enrollment --dry-run
```
The fixture is synthetic, not evidence of Windows collection. Output reports counts, not sensitive event content. Exit 0: all supported records validated; 2: at least one rejected; 1: fatal input/database failure. Rejection diagnostics are limited to the first 20 records. Unsupported non-Windows events are explicitly rejected, not silently treated as Windows activity.

## Import an immutable archive into PostgreSQL
Provision a dedicated database with authenticated access. Supply DATABASE_URL privately in the process environment; the application does not automatically load .env files. Do not disable TLS checks for a remote database. A migration user needs DDL permission; constrain the runtime user's privileges to the necessary application tables.
```powershell
npm.cmd run db:migrate
npm.cmd run ingest:file -- --file var/archives-snapshot.json --manager kali-lab-1 --epoch asus-enrollment-1
```
No PostgreSQL instance is automatically deployed. Migration is transactional, locked and checksum-checked. Replaying the same immutable export is idempotent. A failed import may have already committed earlier events; the run is marked failed and replay resumes safely by deduplicating, not by claiming file-level atomicity.

## Identity and trust
manager and epoch are operator-supplied provenance, not authentication. Import only archives obtained through the trusted manager path. Epoch must change when agent IDs are reassigned/re-enrolled. Do not mix different enrollment generations for one ID within an import.
If the true source log generation is known, --generation supplies it. Do not substitute an arbitrary current date. Otherwise identity is scoped to file SHA-256 + line + device/channel. Re-exporting overlapping records into a different file can create duplicates; cross-export deduplication is deliberately not guessed. Changing log generations or agent assignments preserves distinct identity.
Do not feed a growing live file to this importer. It hashes and then reads the same open file and checks size/mtime afterwards; detected changes fail the run but do not roll back already committed rows. This is not a secure snapshot mechanism against a concurrent hostile writer. Make a trusted immutable export first.
Conflicting payloads reusing an event identity fail the transaction rather than silently discarding the changed observation. Receive time and export location may vary on legitimate replay.

## Bounds and missing data
Raw records: 64 KiB per line. Oversized lines are drained without retaining their remainder. Attributes: at most 128 flat properties, strings at most 8192 characters. Normalized records: at most 128 KiB. Unknown nested input is rejected. Raw data is not automatically echoed or stored; approved flat attributes may contain personal command lines/paths and require restricted access and retention.
Unknown source time remains null with original source_time retained. UTC conversion occurs only for parseable timezone-bearing times. No receive timestamp is fabricated as event time. Process GUIDs may be null; PID is never promoted to a stable process identity. Receipt alone leaves device collection_health unknown.

## Database scope
endpoint_devices, endpoint_events, endpoint_ingestion_runs and endpoint_schema_migrations. Future rule/alert/graph/checkpoint schemas belong to their implementation phases; this release does not create misleading empty feature tables. The demo API remains read-only and synthetic; no open event-upload endpoint is added.

## Validation boundary
PGlite executes PostgreSQL in-process for migrations, JSONB, constraints and transaction tests. It does not verify TCP/TLS, a remote pg server, multi-client concurrency, backups or production performance. Kali deployment and real archive shape compatibility are pending. Phase 3 durable queue/rotation checkpoints and retention are not implemented.
