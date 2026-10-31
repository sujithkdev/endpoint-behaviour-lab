CREATE TABLE IF NOT EXISTS endpoint_schema_migrations (
  version INTEGER PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS endpoint_devices (
  id TEXT PRIMARY KEY, manager_id TEXT NOT NULL,
  collection_health TEXT NOT NULL DEFAULT 'unknown' CHECK(collection_health IN ('unknown','healthy','delayed','incomplete','offline')),
  first_received_at TIMESTAMPTZ NOT NULL, last_received_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS endpoint_events (
  id TEXT PRIMARY KEY, device_id TEXT NOT NULL REFERENCES endpoint_devices(id),
  event_time TIMESTAMPTZ, received_at TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL, channel TEXT NOT NULL,
  source_reference TEXT NOT NULL, payload JSONB NOT NULL,
  CHECK (payload->>'schema_version' = '1')
);
CREATE INDEX IF NOT EXISTS endpoint_events_device_time ON endpoint_events(device_id,event_time,id);
CREATE INDEX IF NOT EXISTS endpoint_events_received ON endpoint_events(received_at);
CREATE TABLE IF NOT EXISTS endpoint_ingestion_runs (
  id TEXT PRIMARY KEY, source_digest TEXT NOT NULL, started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ, status TEXT NOT NULL CHECK(status IN ('running','completed','partial','failed')),
  counts JSONB NOT NULL DEFAULT '{}'
);
