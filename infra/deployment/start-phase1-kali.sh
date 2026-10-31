#!/usr/bin/env bash
# Run from the copied project on the authorised Kali VM. Does not install Docker.
set -euo pipefail
cd "$(dirname "$0")/../.."
bind_ip="${1:-}"
if [[ ! "$bind_ip" =~ ^192\.168\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
  echo 'Supply the Kali VMware private 192.168.x.x address as argument 1.' >&2
  exit 2
fi
if ! ip -o -4 addr show | awk '{split($4,a,"/"); print a[1]}' | grep -Fxq "$bind_ip"; then
  echo 'Requested address is not assigned to this Linux VM.' >&2
  exit 2
fi
docker info >/dev/null
docker compose version
export PHASE1_BIND_IP="$bind_ip"
docker compose -f infra/compose/phase1.compose.yml config --quiet
docker compose -f infra/compose/phase1.compose.yml up -d
echo 'Manager launch requested; this is not proof of endpoint collection.'
echo 'Check manager processes and enroll the authorised ASUS endpoint manually.'
