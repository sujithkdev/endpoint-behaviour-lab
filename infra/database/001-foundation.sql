-- PROPOSED PostgreSQL foundation, not a translation of the 4,967 recovered tables.
-- Not applied by the demo. Review schema and migration policy before deployment.
BEGIN;
CREATE SCHEMA IF NOT EXISTS platform;
CREATE TABLE platform.organization (
  id uuid PRIMARY KEY, name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE platform.asset (
  organization_id uuid NOT NULL REFERENCES platform.organization(id),
  id uuid NOT NULL, hostname text NOT NULL, platform text NOT NULL,
  last_seen timestamptz, version bigint NOT NULL DEFAULT 1,
  PRIMARY KEY (organization_id, id)
);
CREATE TABLE platform.vulnerability_definition (
  id uuid PRIMARY KEY, external_id text, source text NOT NULL,
  source_version text NOT NULL, title text NOT NULL,
  UNIQUE (source, source_version, external_id)
);
CREATE TABLE platform.finding (
  organization_id uuid NOT NULL, id uuid NOT NULL, asset_id uuid NOT NULL,
  definition_id uuid NOT NULL REFERENCES platform.vulnerability_definition(id),
  severity text NOT NULL CHECK (severity IN ('critical','high','medium','low','unknown')),
  state text NOT NULL CHECK (state IN ('open','resolved','excepted','unknown')),
  evidence_key text NOT NULL, observed_at timestamptz NOT NULL,
  version bigint NOT NULL DEFAULT 1,
  PRIMARY KEY (organization_id,id),
  FOREIGN KEY (organization_id,asset_id) REFERENCES platform.asset(organization_id,id),
  UNIQUE (organization_id,asset_id,definition_id,evidence_key)
);
CREATE INDEX finding_asset_state ON platform.finding(organization_id,asset_id,state);
CREATE TABLE platform.job (
  organization_id uuid NOT NULL REFERENCES platform.organization(id), id uuid NOT NULL,
  kind text NOT NULL, payload jsonb NOT NULL,
  state text NOT NULL CHECK (state IN ('queued','leased','running','succeeded','failed','cancelled')),
  idempotency_key text NOT NULL, attempt integer NOT NULL DEFAULT 0 CHECK (attempt >= 0),
  lease_owner text, lease_until timestamptz, available_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id,id), UNIQUE (organization_id,kind,idempotency_key)
);
CREATE INDEX job_claim ON platform.job(state,available_at);
CREATE TABLE platform.outbox (
  id uuid PRIMARY KEY, organization_id uuid NOT NULL REFERENCES platform.organization(id),
  event_type text NOT NULL, schema_version integer NOT NULL CHECK (schema_version > 0),
  payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz
);
CREATE TABLE platform.audit_event (
  id uuid PRIMARY KEY, organization_id uuid NOT NULL REFERENCES platform.organization(id),
  actor_id text NOT NULL, action text NOT NULL, resource_type text NOT NULL,
  resource_id text NOT NULL, outcome text NOT NULL, request_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
COMMIT;
-- Production role grants, append-only enforcement, RLS and identity tables are
-- intentionally unimplemented gates. Never assume this schema enforces auth.
