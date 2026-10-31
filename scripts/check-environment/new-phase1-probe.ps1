# Run only on the authorised test endpoint. Creates a harmless local marker.
$ErrorActionPreference='Stop'
$probeId='phase1-' + [guid]::NewGuid().ToString('N')
$directory=Join-Path ([System.IO.Path]::GetTempPath()) 'EndpointPhase1'
[System.IO.Directory]::CreateDirectory($directory) | Out-Null
$path=Join-Path $directory ($probeId + '.txt')
[System.IO.File]::WriteAllText($path, $probeId)
[ordered]@{ probe_id=$probeId; computer=$env:COMPUTERNAME; created_at=[DateTime]::UtcNow.ToString('o'); path=$path; expected_source='Microsoft-Windows-Sysmon/Operational'; expected_event_id=11; server_receipt_verified=$false } | ConvertTo-Json
