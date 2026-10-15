# Check which audio device is currently default AND if any BT is connected
Write-Host "=== Current Default Playback Device ==="
$defaultAudio = powershell -NoProfile -Command "
    Add-Type -AssemblyName System.Core
    # Use reg to check default audio device
    $render = Get-ItemProperty 'HKCU:\Software\Microsoft\Multimedia\Sound Mapper' -Name 'Playback' -ErrorAction SilentlyContinue
    Write-Host 'Sound Mapper Playback:' $render.Playback
"

Write-Host "`n=== ALL AudioEndpoint devices (all statuses) ==="
Get-PnpDevice -Class AudioEndpoint -ErrorAction SilentlyContinue | Select-Object FriendlyName, Status | Format-Table -AutoSize

Write-Host "`n=== Bluetooth BTHENUM A2DP Sink children (audio profile) ==="
Get-PnpDevice | Where-Object { $_.InstanceId -like 'BTHENUM\{0000110B*' -or $_.InstanceId -like 'BTHENUM\{0000110E*' -or $_.InstanceId -like 'BTHENUM\{0000111E*' -or $_.InstanceId -like 'BTHENUM\{00001108*' -or $_.InstanceId -like 'BTHENUM\{0000110D*' } | Select-Object FriendlyName, Status, InstanceId | Format-Table -AutoSize -Wrap

Write-Host "`n=== ALL BTHENUM devices ==="
Get-PnpDevice | Where-Object { $_.InstanceId -like 'BTHENUM*' } | Select-Object FriendlyName, Status, InstanceId | Format-Table -AutoSize -Wrap

Write-Host "`n=== Bluetooth Audio Gateway Service (HFP) ==="
Get-PnpDevice | Where-Object { $_.InstanceId -like 'BTHENUM*' -and $_.FriendlyName -like '*Audio*' } | Select-Object FriendlyName, Status, InstanceId | Format-Table -AutoSize -Wrap
