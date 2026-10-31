"""Generate module boundary documents and API contracts for the skeleton."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
modules = [
 ('identity','Identity and access','Users, sessions, roles and resource scope.','design-only','Principal, Role, Permission, Scope','Session verification; authorize(principal, action, resource)','Authentication dictionaries and security route declarations'),
 ('assets','Asset inventory','Device identities, platforms, groups and inventory.','demo-read','Asset, AssetGroup, InventorySnapshot','List assets; ingest validated inventory snapshots','SoM API documentation and Resource/ManagedComputer declarations'),
 ('vulnerabilities','Vulnerability management','Finding lifecycle, severity, affected assets and exceptions.','demo-read','VulnerabilityDefinition, Finding, Exception','List scoped findings; ingest assessment results; approve exceptions','VulnerabilityManagement dictionaries and security-vulnerability.xml'),
 ('patches','Patch management','Patch catalog, applicability, deployment and rollback.','design-only','Patch, Applicability, DeploymentPlan, DeploymentResult','Assess applicability; approve/schedule/cancel deployment','PatchManagement dictionaries and patch-app UI'),
 ('configurations','Configuration assessment','Misconfiguration rules, assessments and remediation plans.','design-only','ConfigurationRule, Assessment, RemediationPlan','Evaluate policy results; propose and approve changes','VMP product-module mapping and misconfiguration API declarations'),
 ('compliance','Compliance policies','Policy definitions, evaluation and historical results.','design-only','Policy, PolicyVersion, Evaluation','Version policies; evaluate results; resolve exclusions','vulnerability-engine module names; entitlement still unresolved'),
 ('agents','Agent gateway','Enrollment, heartbeat, inventory and typed command exchange.','design-only','AgentIdentity, Enrollment, AgentCommand, AgentResult','Authenticate devices; ingest snapshots; deliver typed signed commands','Packaged agent components and servlet declarations; protocol unverified'),
 ('jobs','Scheduling and execution','Durable jobs, leases, retry policy and cancellation.','design-only','Job, Attempt, Lease, Schedule','Enqueue idempotently; claim lease; renew; acknowledge; cancel','Shipped scheduling/service infrastructure; detailed behavior unresolved'),
 ('reports','Reporting and exports','Scoped reports, asynchronous exports and retention.','design-only','ReportDefinition, ExportJob, ExportArtifact','Build scoped read models; request export; authorize download','Report routes, export/table assets and dashboard metadata'),
 ('integrations','Feeds and integrations','Versioned content ingestion and external-system adapters.','design-only','Connector, FeedSnapshot, SyncRun','Validate and stage feed; atomically activate version; sync external records','vmp_general_properties.conf endpoints and integration admin metadata'),
 ('audit','Audit trail','Append-only records of access and state-changing decisions.','design-only','AuditEvent','Append actor/action/resource/result; query with restricted scope','Audit quicklaunch/admin declarations; retention behavior unresolved'),
 ('settings','Administration','Product settings, secrets references and maintenance policy.','design-only','Setting, SecretReference, MaintenanceWindow','Read validated settings; update with approval/audit','VMP admin homepage configuration'),
 ('dashboard','Dashboards','Scoped summary projections with freshness information.','demo-read','DashboardProjection, CardDefinition','Aggregate fixture counts now; scoped database projections later','10 VMP dashboards / 87 declared cards'),
 ('recovery','Backup and recovery','Backup manifests, restore rehearsals and migration history.','design-only','BackupManifest, RestoreRun, MigrationRecord','Create backups; verify hashes; restore isolated copy','Shipped backup/migration scripts and successful copied-cluster export'),
]
catalog = []
for ident, name, description, status, entities, ports, evidence in modules:
    catalog.append(dict(id=ident,name=name,description=description,status=status))
    folder = root / 'packages/modules' / ident
    folder.mkdir(parents=True, exist_ok=True)
    (folder / 'README.md').write_text(f'''# {name}

Status: **{status}**. This boundary is a proposed replacement design, not recovered source.

Responsibility: {description}

Owned concepts: {entities}.

Application ports to implement: {ports}.

Evidence seed: {evidence}. Resolve actual behavior through the evidence ledger before claiming parity.

## Implementation boundary

Use application services behind HTTP/worker adapters. Domain code must not import HTTP, database drivers, UI or other modules' private tables. Cross-module writes use public service contracts or a durable outbox event.

All future requests must carry principal and resource scope. State changes must validate authorization, concurrency version and idempotency before transaction commit; audit and outbox records commit with the business change.

## Acceptance gate

Test success, validation, unauthorized/forbidden access, cross-scope access, empty data, stale state and dependency failure. For external effects also test retry, duplicate delivery, cancellation, partial failure and recovery. Mark production-ready only after contract and reference-product comparisons are documented.
''', encoding='utf-8')
(root/'packages/domain/catalog.mjs').write_text('export const catalog = '+json.dumps(catalog,indent=2)+';\n', encoding='utf-8')
contracts = root/'contracts'
contracts.mkdir(exist_ok=True)
paths = {}
for path, description in {
 '/health/live':'Process liveness; explicitly reports demo mode and no persistence.',
 '/api/v1/assets':'Synthetic asset fixtures.',
 '/api/v1/vulnerabilities':'Synthetic vulnerability finding fixtures.',
 '/api/v1/dashboard':'Counts derived from the same fixture repository.',
 '/api/v1/modules':'Module implementation status.',
 '/api/v1/capabilities':'Actual skeleton capabilities; no authentication or agent execution.'
}.items():
    paths[path] = {'get':{'summary':description,'responses':{'200':{'description':'Development response; no production capability implied','content':{'application/json':{'schema':{'type':'object'}}}}}}}
for m in catalog:
    path = '/api/v1/'+m['id']
    if path not in paths:
        paths[path]={'get':{'summary':m['description'],'responses':{'501':{'description':'Not implemented in this skeleton'}}}}
doc={'openapi':'3.1.0','info':{'title':'VMP reconstruction development API','version':'0.1.0','description':'Read-only synthetic skeleton. This contract documents the new skeleton, not the original ManageEngine API. No production authentication is implemented.'},'servers':[{'url':'http://127.0.0.1:4100'}],'paths':paths}
(contracts/'openapi.json').write_text(json.dumps(doc,indent=2),encoding='utf-8')
print(f'Created {len(catalog)} module boundaries and {len(paths)} API paths.')
