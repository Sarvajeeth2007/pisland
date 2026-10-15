# Try multiple approaches to detect actual BT connection state

Write-Host "=== Approach 1: Check Audio endpoints for active BT devices ==="
Get-PnpDevice -Class AudioEndpoint -Status OK -ErrorAction SilentlyContinue | Where-Object {
    $_.FriendlyName -and ($_.FriendlyName -like '*Tws*' -or $_.FriendlyName -like '*Buds*' -or $_.FriendlyName -like '*Bluetooth*' -or $_.FriendlyName -like '*Hands-Free*' -or $_.FriendlyName -like '*Stereo*' -or $_.FriendlyName -like '*speaker*' -or $_.FriendlyName -like '*headphone*' -or $_.FriendlyName -like '*realme*' -or $_.FriendlyName -like '*OnePlus*' -or $_.FriendlyName -like '*Boult*' -or $_.FriendlyName -like '*troke*' -or $_.FriendlyName -like '*Hall*')
} | Select-Object FriendlyName, Status, InstanceId | Format-Table -AutoSize -Wrap

Write-Host "`n=== Approach 2: ALL AudioEndpoint devices that are OK ==="
Get-PnpDevice -Class AudioEndpoint -Status OK -ErrorAction SilentlyContinue | Select-Object FriendlyName, Status, InstanceId | Format-Table -AutoSize -Wrap

Write-Host "`n=== Approach 3: Check Bluetooth InstanceId cross-reference with AudioEndpoint ==="
$btDevices = Get-PnpDevice -Class Bluetooth | Where-Object { 
    $_.FriendlyName -and 
    $_.FriendlyName -notlike '*Adapter*' -and 
    $_.FriendlyName -notlike '*Enumerator*' -and 
    $_.FriendlyName -notlike '*Service*' -and 
    $_.FriendlyName -notlike '*Attribute*' -and 
    $_.FriendlyName -notlike '*Protocol*' -and 
    $_.FriendlyName -notlike '*RFCOMM*' -and 
    $_.FriendlyName -notlike '*Transport*'
}

$audioDevices = Get-PnpDevice -Class AudioEndpoint -ErrorAction SilentlyContinue
foreach ($bt in $btDevices) {
    # Extract BT address from InstanceId
    $btAddr = ""
    if ($bt.InstanceId -match 'DEV_([0-9A-Fa-f]+)') {
        $btAddr = $matches[1]
    } elseif ($bt.InstanceId -match 'BLUETOOTHDEVICE_([0-9A-Fa-f]+)') {
        $btAddr = $matches[1]
    }
    
    $matchingAudio = @()
    if ($btAddr) {
        $matchingAudio = $audioDevices | Where-Object {
            $_.InstanceId -like "*$btAddr*"
        }
    }
    
    Write-Host "BT Device: $($bt.FriendlyName) | BTAddr: $btAddr | Matching Audio Endpoints: $($matchingAudio.Count)"
    foreach ($ae in $matchingAudio) {
        Write-Host "  -> AudioEndpoint: $($ae.FriendlyName) | Status: $($ae.Status)"
    }
}

Write-Host "`n=== Approach 4: BTHLEDEVICE children status ==="
Get-PnpDevice | Where-Object { $_.InstanceId -like 'BTHLEDEVICE*' } | Select-Object FriendlyName, Status, InstanceId | Format-Table -AutoSize -Wrap

Write-Host "`n=== Approach 5: Check DEVPKEY_Bluetooth_LastConnectedTime ==="
$btDevices | ForEach-Object {
    $connTime = Get-PnpDeviceProperty -InputObject $_ -KeyName '{2BD67D8B-8BEB-48D5-87E0-6CDA3428040A} 11' -ErrorAction SilentlyContinue
    $lastSeen = Get-PnpDeviceProperty -InputObject $_ -KeyName '{2BD67D8B-8BEB-48D5-87E0-6CDA3428040A} 12' -ErrorAction SilentlyContinue
    Write-Host "$($_.FriendlyName) | LastConnTime: $($connTime.Data) | LastSeen: $($lastSeen.Data)"
}
