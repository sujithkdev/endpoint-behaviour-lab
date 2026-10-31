# Deployment boundary

The current runnable demo binds to 127.0.0.1 and has no authentication or persistent storage. Do not expose it as a production service.

The proposed production topology is TLS reverse proxy → API/static UI, with separate PostgreSQL, worker and artifact storage. Select and pin deployment images only when implementing these components; no unverified container deployment is provided.

Required release artifacts: immutable application build, migrations, versioned configuration schema, least-privilege service identities, backup/restore procedures, metrics, alert rules, dependency inventory and rollback runbook. See docs/TECHNICAL-IMPLEMENTATION.md.
