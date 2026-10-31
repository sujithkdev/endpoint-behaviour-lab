# ASUS endpoint -> Kali VMware collector

Updated target selection: user chose the original ASUS Windows host for harmless Phase 1 collection, with Kali running the manager in Docker. Keep disruptive tests in a separate Windows VM.

Observed host interfaces: VMnet1 192.168.118.1 (host-only), VMnet8 192.168.71.1 (NAT). Kali's address and access method remain unconfirmed. Do not assume either host address is Kali's address. Do not scan the subnet to guess the target.

## Kali preparation
Use VMware console to obtain `ip -br addr`. Verify a host-only adapter is connected to the same VMnet1 network. A second NAT adapter may supply downloads; do not bind the collector to the NAT/wider-LAN interface.
Transfer the generated phase1-kali ZIP through an available trusted channel and extract it into a new directory in Kali. Preserve relative paths.
Docker Engine and Compose must already be installed and accessible. The script does not install dependencies or change firewall rules.

From that directory:
```bash
bash infra/deployment/start-phase1-kali.sh KALI_HOST_ONLY_IP
docker compose -f infra/compose/phase1.compose.yml exec -T manager /var/ossec/bin/wazuh-control status
docker compose -f infra/compose/phase1.compose.yml exec -T manager /var/ossec/bin/agent_control -l
```
Only agent TCP 1514 is published. Restrict access to ASUS's host-only address using the VM firewall, accounting for Docker forwarding rules; verify effective access rather than assuming a host firewall automatically filters Docker-published ports. No enrollment or admin API is published. The manager uses an authenticated-key Wazuh channel, not generic mTLS.

## ASUS enrollment (pending actual target)
1. Verify the manager is healthy on the confirmed Kali address.
2. Obtain matching Wazuh Windows installer and official Sysmon package; verify publisher signatures and record hashes before execution.
3. Back up existing configurations if any; install only on the authorised ASUS endpoint.
4. Use the manager's interactive manage_agents utility to create a named ASUS agent and export its individual key. Transfer/import it privately using the Windows agent utility. Never place keys in chat, Git or public logs.
5. Configure the Windows client to the confirmed Kali host-only address, TCP 1514. Do not disable transport or identity checks.
6. Apply the supplied Sysmon profile after validating it with the installed Sysmon schema. Merge the Wazuh collection fragment without duplicating subscriptions or replacing connection settings.
7. Restart the agent, check the manager's active identity, run the benign marker probe and verify exact receipt using the JSON archive verifier.

## Limits
Phase 1 has no custom UI live telemetry, indexer or automated malware response. Archive logging is for attended, bounded experiments; Docker console rotation does not limit archive volume. Stop collection when unattended until retention/disk-pressure controls are implemented.
No live endpoint success may be recorded until a probe from ASUS is observed in Kali archives. Also verify disconnect/reconnect and collector failure separately. Installing collectors may record personal paths and command lines; keep evidence local and access restricted.

Docker Desktop on ASUS was unavailable during the latest check. Do not claim its earlier lab was successfully stopped or deployed; inspect it separately if re-enabled, and avoid duplicate collectors.
