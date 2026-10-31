#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
action="${1:-help}"
envfile=var/lab.env
compose=(docker compose --project-name endpoint-lab --env-file "$envfile" -f infra/compose/phase1.compose.yml -f infra/compose/application.compose.yml)
case "$action" in
  init)
    bind="${2:-127.0.0.1}"
    if [[ ! "$bind" =~ ^(127\.0\.0\.1|192\.168\.[0-9]{1,3}\.[0-9]{1,3})$ ]]; then echo 'Use loopback or the confirmed VMware private IPv4 address.' >&2; exit 2; fi
    if ! ip -o -4 addr show | awk '{split($4,a,"/"); print a[1]}' | grep -Fxq "$bind"; then echo 'Address is not assigned to this Linux machine.' >&2; exit 2; fi
    command -v openssl >/dev/null
    umask 077
    mkdir -p var
    if [[ -e "$envfile" ]]; then echo 'Existing lab.env preserved. Review it privately to change the binding.'; exit 0; fi
    printf 'PHASE1_BIND_IP=%s\nPOSTGRES_PASSWORD=%s\n' "$bind" "$(openssl rand -hex 32)" > "$envfile"
    echo 'Created private local configuration; no credentials printed.'
    ;;
  up)
    "${compose[@]}" config --quiet
    "${compose[@]}" up -d manager database
    "${compose[@]}" build tool
    "${compose[@]}" run --rm tool scripts/migrate.mjs
    echo 'Services launched. Run status; Windows enrollment and probe receipt are separate checks.'
    ;;
  status)
    "${compose[@]}" ps
    "${compose[@]}" exec -T manager /var/ossec/bin/wazuh-control status
    "${compose[@]}" exec -T manager /var/ossec/bin/agent_control -l
    "${compose[@]}" exec -T manager sh -c 'du -sk /var/ossec/logs/archives; df -Pk /var/ossec/logs'
    ;;
  enroll)
    "${compose[@]}" exec manager /var/ossec/bin/manage_agents
    ;;
  snapshot)
    umask 077
    id="$("${compose[@]}" ps -q manager)"
    [[ -n "$id" ]] || { echo 'Manager not running' >&2; exit 1; }
    destination="var/archives-$(date -u +%Y%m%dT%H%M%SZ)-$$.jsonl"
    # Acquire the current file once. A trailing partial JSON line is explicitly rejected by ingestion.
    docker exec "$id" cat /var/ossec/logs/archives/archives.json > "$destination"
    chmod 600 "$destination"
    echo "$destination"
    ;;
  import)
    filename="${2:?Supply snapshot filename only}"; manager="${3:?Supply manager provenance ID}"; epoch="${4:?Supply enrollment epoch}"
    [[ "$filename" =~ ^archives-[a-zA-Z0-9.-]+\.jsonl$ && -f "var/$filename" ]] || { echo 'Invalid snapshot filename' >&2; exit 2; }
    "${compose[@]}" run --rm tool apps/ingest/src/main.mjs --file "/data/$filename" --manager "$manager" --epoch "$epoch"
    ;;
  stop) "${compose[@]}" stop ;;
  *) echo 'Usage: bash scripts/kali-lab.sh {init [KALI_IP]|up|status|enroll|snapshot|import SNAPSHOT_NAME MANAGER_ID ENROLLMENT_EPOCH|stop}' ;;
esac
