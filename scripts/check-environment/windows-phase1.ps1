# Read-only checks; does not install agents or modify configuration.
$ErrorActionPreference = 'Stop'
$services = @('WazuhSvc','Sysmon','Sysmon64') | ForEach-Object {
    $item = Get-Service -Name $_ -ErrorAction SilentlyContinue
    [ordered]@{ name=$_; installed=($null -ne $item); status=if($item){[string]$item.Status}else{'absent'} }
}
try {
    $channel = Get-WinEvent -ListLog 'Microsoft-Windows-Sysmon/Operational' -ErrorAction Stop
    $channelResult = @{ available=$true; enabled=$channel.IsEnabled; records=$channel.RecordCount }
} catch { $channelResult = @{ available=$false; reason=$_.Exception.Message } }
[ordered]@{ checked_at=[DateTime]::UtcNow.ToString('o'); computer=$env:COMPUTERNAME; services=@($services); sysmon_channel=$channelResult; live_collection_verified=$false } | ConvertTo-Json -Depth 5
