# Create a portable lab bundle containing only explicit, non-secret project files.
$ErrorActionPreference='Stop'
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$files=@(
 'infra/compose/phase1.compose.yml',
 'infra/deployment/start-phase1-kali.sh',
 'configs/wazuh/manager/phase1.conf',
 'configs/wazuh/manager/filebeat.down',
 'configs/wazuh/agent/windows-collection.fragment.xml',
 'configs/sysmon/phase1.xml',
 'scripts/check-environment/windows-phase1.ps1',
 'scripts/check-environment/new-phase1-probe.ps1',
 'scripts/check-environment/verify-phase1-events.mjs',
 'docs/PHASE-1.md',
 'docs/ASUS-KALI-SETUP.md'
)
$output=Join-Path $root 'var'
[IO.Directory]::CreateDirectory($output)|Out-Null
$destination=Join-Path $output ('phase1-kali-'+[DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss')+'.zip')
Add-Type -AssemblyName System.IO.Compression
$archive=[IO.Compression.ZipFile]::Open($destination,[IO.Compression.ZipArchiveMode]::Create)
try {
 foreach($relative in $files){
  $source=Join-Path $root $relative
  [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,$source,$relative)|Out-Null
 }
} finally { $archive.Dispose() }
Write-Output $destination
Get-FileHash -LiteralPath $destination -Algorithm SHA256 | Select-Object Hash
