# Endpoint platform architecture — proposed

Windows Sysmon / selected event channels -> Wazuh agent -> protected Wazuh receiver -> validated event export -> custom ingest -> RabbitMQ -> worker -> PostgreSQL -> API -> browser.

## Ownership
- Wazuh owns supported enrollment and collection. Do not invent an incompatible agent protocol.
- ingest owns source checkpoints and translation. Advance a checkpoint after confirmed publication; a crash may replay events.
- worker owns idempotent event handling, durable correlation state, alerts and evidence relationships. Acknowledge only after the required database transaction commits.
- PostgreSQL owns custom alerts, bounded evidence snapshots, device metadata, rule versions and processing state.
- Wazuh owns its configured searchable telemetry. Decide what is actually archived/indexed; do not assume all events are retained.
- RabbitMQ is a bounded transit queue, not permanent evidence storage. Confirm durability settings; single-node operation does not survive every disk/host loss.
- API owns bounded queries and access checks; web never directly connects to storage or the broker.

## Dependency direction
apps -> domain/detection/graph/contracts; infrastructure adapters implement the required persistence and transport interfaces. Domain logic must not depend on HTTP or broker clients. Entry points compose dependencies.

## Mapping
Nodes: device, process instance, account/session, file, registry location, domain, destination and alert.
Edges: launched, created, modified, queried, connected-to and supported-by. Every edge retains event provenance and timestamps. Inference is labelled separately. Time proximity is not causality.
Query by device and bounded time range; cap expansion, paginate results and mark truncation. Preserve event details when visually grouping repetition.

## Boundaries
The unauthenticated demo binds to loopback. For containers publish only to 127.0.0.1. Use an SSH tunnel for remote development access. Do not expose unauthenticated administrative APIs. Wazuh and service credentials are never disabled by development mode.

## Scale later
Begin with one worker. More workers require stable device partitioning or coordinated durable state. A network load balancer distributes connections, not correlation state or storage capacity.
