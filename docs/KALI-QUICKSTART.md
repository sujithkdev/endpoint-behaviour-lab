# Kali Docker quickstart

Requires Docker Engine, Docker Compose v2, Git, OpenSSL and permission to use Docker. This launcher does not install host packages or alter the firewall. Private GitHub cloning requires your own GitHub login/SSH key; never paste access tokens into commands or chat.

```bash
git clone https://github.com/sujithkdev/endpoint-behaviour-lab.git
cd endpoint-behaviour-lab
bash scripts/kali-lab.sh init 192.168.71.128
bash scripts/kali-lab.sh up
bash scripts/kali-lab.sh status
```
Replace the example IP with the confirmed VMware interface address if it changes. Init verifies that it is locally assigned. Only agent TCP 1514 is published. Restrict access to the ASUS VMware interface using the effective Docker/VM firewall configuration; no public enrollment/API/dashboard is published. The development web UI is still synthetic and is not part of this telemetry launcher.

The manager is limited to 2 GB and PostgreSQL to 512 MB; these are initial lab caps, not demonstrated capacity. Docker builds also consume memory. On a 4 GB Kali VM use an attended small workload and watch swapping/disk use. Indexer, Wazuh dashboard and RabbitMQ are deferred.

## Enroll Windows
Run `bash scripts/kali-lab.sh enroll` to use the official interactive agent-management utility. Create the intended ASUS endpoint, export its unique key and import it privately on the authorised Windows agent. Do not commit or send keys in chat. Configure that agent to the confirmed Kali address, TCP 1514; merge the supplied Windows collection fragment and apply the validated Sysmon profile. See PHASE-1.md and ASUS-KALI-SETUP.md. Enrollment is not automatic and Windows installer execution is not performed by this Linux script.

## Use real telemetry
After confirming the endpoint is active and generating the harmless Phase 1 probe:
```bash
bash scripts/kali-lab.sh snapshot
bash scripts/kali-lab.sh import archives-REPLACE_WITH_PRINTED_NAME.jsonl kali-lab-1 asus-enrollment-1
```
Use the exact filename printed by snapshot. Preserve the manager identity and enrollment epoch on replay; change epoch on agent-ID reassignment. Snapshots contain private telemetry and remain under ignored var/. A live archive copy may end with a partial record: the importer counts it as rejected. Rotation/repeated-snapshot overlap is not solved by this offline importer; do not call it continuous lossless ingestion. Phase 3 will supply a durable source/checkpoint path.

The database migration executes before import. Data persists in project-specific Docker volumes. Run `bash scripts/kali-lab.sh stop` to stop this project without deleting evidence. Never delete volumes as a routine restart. Store a protected copy of var/lab.env; changing its password alone does not rotate an existing PostgreSQL user's password.

## Limitations
Raw-event archives are enabled for the bounded lab and are not automatically capped by Docker console logging. Stop the lab after experiments; configure retention before unattended operation. Detection, live UI integration and graph rendering are future phases. Server startup is not proof of Windows collection or malware detection.
