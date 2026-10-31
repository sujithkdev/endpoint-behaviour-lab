# Deployment boundary

The initial manager-only Docker Linux lab and Windows collection profiles are now defined in [PHASE-1.md](PHASE-1.md). Follow that runbook for current commands and the live-validation boundary. The full indexer/custom application deployment below remains future work.

Phase 0 runs only the existing loopback demo using npm start. Do not interpret it as live collection.
Phase 1 requires an authorised Windows VM and a Linux target with resources verified against the selected Wazuh release. Pin compatible component versions and record checksums/configuration versions.
The custom stack will use TypeScript services, PostgreSQL and RabbitMQ. Compose files are reserved, not supplied as untested deployment claims.
No-login development UI is loopback-only, including Docker host port publishing. Use an SSH tunnel if needed. Device/service authentication and certificate checks remain enabled. Keep databases and brokers private.
Initial operational settings must include queue/disk limits, telemetry retention, secret locations and failure behaviour. Raw-event retention begins from measured rates, not an assumed universal capacity.
