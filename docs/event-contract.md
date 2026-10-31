# Event contract — Phase 2 v1

The executable v1 schema is packages/contracts/src/event.schema.json. The mapper and validation enforce that schema; docs/PHASE-2.md explains identity limitations, bounds and provenance. The notes below are original design context: internal_event_id is implemented as event_id; future session/health additions require schema evolution.

Required envelope: schema_version, internal_event_id, device_id, source, channel, source_event_id when available, source_generation when available, event_time, received_at, event_type, attributes, collector_config_version, original_record_reference.
Optional context: process_guid, pid, parent_process_guid, parent_pid, user/session identity. Missing data remains explicitly missing; do not fabricate identifiers or timestamps.

Deduplication uses device + source/channel + source generation + event identity where available. A fallback identity must document collision risk. PID alone is not a process identity. Identical event text does not imply duplicate delivery. Log clears/resets must not cause old identities to suppress new records.

Preserve source and normalized time, timestamp precision and known clock uncertainty. Correlation uses event time with bounded lateness; receive time measures pipeline delay. Define handling of events outside the window instead of silently discarding them.

Collection health: healthy / delayed / incomplete / offline / unknown. Detection outcome: observed suspicious sequence / partial evidence / no matching rule. Neither no match nor an empty stream means malware-free.

Each relationship and alert references exact events, rule version and processing version. Support late evidence without silently overwriting alert history.

Before Phase 2 implementation: freeze the JSON Schema, maximum record/attribute sizes, privacy rules, version compatibility and fixture examples. The existing contracts/openapi.json remains demo-only.
