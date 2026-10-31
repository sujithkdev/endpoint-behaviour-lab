# Phase 1 status — 2026-10-31

User-selected targets: ASUS Windows endpoint and Kali VMware Linux collector. Kali address supplied: 192.168.71.128; username: koko. This is the observed VMware NAT subnet (ASUS VMnet8 is 192.168.71.1), not VMnet1 host-only. Restrict collection access to the intended host and verify actual routing/firewall behaviour.

Verified: TCP 22 reachable; strict-host-key SSH reaches authentication, but BatchMode authentication fails with Permission denied (publickey,password). No authenticated remote commands ran. No host-key verification was disabled.

Prepared: portable ZIP under var/, manager-only Compose configuration, collection profiles, endpoint readiness/probe scripts and archive verification tool. Compose bind defaults to loopback; Kali startup script requires an explicit address assigned to that VM.

Pending: authenticated Kali access, Docker readiness there, manager deployment and health verification, signed endpoint package installation, secure agent-key transfer, collection profile validation, exact probe receipt, disconnect/reconnect and collection-failure tests.

No agent was installed on ASUS. Phase 1 is NOT complete. Do not present packaging or unit tests as live collection verification. The previous Docker Desktop image pull/deployment was not confirmed complete; its engine is currently unavailable.
