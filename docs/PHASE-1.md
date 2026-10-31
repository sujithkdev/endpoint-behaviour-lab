# Phase 1 — Docker Linux collection lab

Status: implementation and deployment preparation in progress; Windows-to-Linux collection is not yet verified.
User selected Docker Linux lab and a separate Windows test VM, not the everyday Windows host.

## Scope and version
The official Docker documentation inspected on 2026-10-31 specifies v4.14.9. The matching official repository was cloned into ignored var/wazuh-docker, commit 56ece955b1107b7b62823afae5b7057e1dab9d98. This is a fixed lab version, not a claim of latest-version support indefinitely.

This phase runs only the manager/collector. Docker reports approximately 8 GB memory with existing workloads, so the indexer and Wazuh dashboard are deferred. The existing custom demo remains separate and synthetic. No manager API, indexer or dashboard port is exposed.

## Commands (project root)
```powershell
docker compose -f infra/compose/phase1.compose.yml config --quiet
docker compose -f infra/compose/phase1.compose.yml up -d
docker compose -f infra/compose/phase1.compose.yml exec -T manager /var/ossec/bin/wazuh-control status
docker compose -f infra/compose/phase1.compose.yml exec -T manager /var/ossec/bin/agent_control -l
```
Stop only this lab, preserving data:
```powershell
docker compose -f infra/compose/phase1.compose.yml stop
```
Do not run down --volumes unless intentionally discarding the lab's identities and evidence.

## Network and enrollment
Current publish: 127.0.0.1:1514/tcp. A separate VM cannot automatically reach that loopback endpoint. Once VM networking is known, either use an authenticated tunnel or change the binding to the specific host-only interface and restrict host firewall access to that VM. Do not blindly publish to all interfaces.

Enrollment listener is disabled. Create one named agent using the official interactive manage_agents tool inside the manager, export its key, and securely import it using manage_agents.exe in the separate Windows VM. Do not print or commit exported keys. Configure the enrolled agent's client/server address to the verified manager/tunnel endpoint and protocol tcp, port 1514. The secure Wazuh 4.x agent channel uses enrolled keys; do not describe this legacy transport as generic mTLS.

Install a matching supported Windows agent only on the authorised VM. Obtain it from the official packages source, verify publisher signature and record installer SHA-256. Do the same for the Sysmon package. Do not execute installers on the host ASUS PC. Sysmon version/schema compatibility must be checked on the VM before applying configs/sysmon/phase1.xml; use its schema inspection and validate the loaded configuration. No Sysmon binary is pinned or installed yet.

## Collection
- Apply configs/sysmon/phase1.xml on the VM after backing up any existing Sysmon configuration.
- Merge configs/wazuh/agent/windows-collection.fragment.xml localfile elements into the existing agent ossec.conf without replacing enrollment/client identity or duplicating an existing channel subscription.
- Process creation/termination is broad for the small lab. File and registry collection is filtered; DNS/network/image-load collection is not enabled in this initial profile.
- No claim of collecting every event. Startup registry filters are a baseline and do not cover every persistence mechanism.
- Read-only endpoint readiness check: scripts/check-environment/windows-phase1.ps1.
- Preserve prior configs and document service restart/recovery before changes.

## Raw-event evidence and volume boundary
The manager has logall_json enabled for this bounded lab: /var/ossec/logs/archives/archives.json provides a candidate raw decoded JSONL source, including non-alerting events. Filebeat is disabled with an s6 down marker; there is no searchable archive index in this phase.
Docker console logs are capped, but that does not cap Wazuh archive-volume growth. This is an attended lab: monitor archive volume and host free space, stop collection when the experiment ends. Automated archive retention/disk-pressure handling remains a Phase 3 prerequisite for unattended operation.
Source rotation, crash checkpointing and sustained-loss behaviour must be validated before Phase 2/3 ingestion claims.

## End-to-end probe
1. Confirm the VM appears active with the intended agent identity.
2. Run new-phase1-probe.ps1 on that VM. It writes one harmless marker in the temporary EndpointPhase1 directory; preserve its emitted probe ID.
3. Confirm Sysmon Event 11 locally has that marker path.
4. Export manager archives securely into ignored var/, avoiding public log output. Use docker cp from the project-specific manager container, not a global matching container name.
5. Run:
```powershell
node scripts/check-environment/verify-phase1-events.mjs var/archives.json 001 phase1-REPLACE_WITH_ACTUAL_32_HEX_ID
```
Use the actual agent ID. Exit 0 means an exact agent/channel/EventID/marker match; exit 2 means no match; exit 1 means invalid input/read failure. This proves receipt of that probe only.
6. Stop the VM's agent deliberately within the test window and observe manager disconnection state; restore it and observe reconnection. Collector failure must also be tested separately from agent connectivity.

## Remaining gate
One real Windows probe received, exact identity verified, configuration health checked, and failure/recovery observed. Without VM access this gate remains pending, even if the Linux container is running.

## Sources
- https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html
- https://documentation.wazuh.com/current/user-manual/capabilities/log-data-collection/configuration.html
- https://documentation.wazuh.com/current/user-manual/manager/event-logging.html
- https://learn.microsoft.com/windows/security/operating-system-security/sysmon/how-to-enable-sysmon
