# Inspect only this Compose project's manager; do not dump credentials/config.
$ErrorActionPreference='Stop'
$root=[System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$compose=Join-Path $root 'infra/compose/phase1.compose.yml'
$ids=@(& docker compose -f $compose ps -q manager)
if($LASTEXITCODE -ne 0 -or -not $ids.Count){ throw 'Phase 1 manager is not running or Docker is inaccessible.' }
& docker compose -f $compose exec -T manager /var/ossec/bin/wazuh-control status
if($LASTEXITCODE -ne 0){ throw 'Manager process status failed.' }
& docker compose -f $compose exec -T manager /var/ossec/bin/agent_control -l
if($LASTEXITCODE -ne 0){ throw 'Agent status query failed.' }
& docker compose -f $compose exec -T manager sh -c 'du -sk /var/ossec/logs/archives; df -Pk /var/ossec/logs'
if($LASTEXITCODE -ne 0){ throw 'Archive/disk status query failed.' }
Write-Output 'These are collector observations, not proof of Windows probe receipt. Run verify-phase1-events.mjs separately.'
