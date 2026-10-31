# Feeds and integrations

Status: **design-only**. This boundary is a proposed replacement design, not recovered source.

Responsibility: Versioned content ingestion and external-system adapters.

Owned concepts: Connector, FeedSnapshot, SyncRun.

Application ports to implement: Validate and stage feed; atomically activate version; sync external records.

Evidence seed: vmp_general_properties.conf endpoints and integration admin metadata. Resolve actual behavior through the evidence ledger before claiming parity.

## Implementation boundary

Use application services behind HTTP/worker adapters. Domain code must not import HTTP, database drivers, UI or other modules' private tables. Cross-module writes use public service contracts or a durable outbox event.

All future requests must carry principal and resource scope. State changes must validate authorization, concurrency version and idempotency before transaction commit; audit and outbox records commit with the business change.

## Acceptance gate

Test success, validation, unauthorized/forbidden access, cross-scope access, empty data, stale state and dependency failure. For external effects also test retry, duplicate delivery, cancellation, partial failure and recovery. Mark production-ready only after contract and reference-product comparisons are documented.
