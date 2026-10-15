# Test 1: Check Bluetooth Audio Endpoints
Write-Output "--- AUDIO ENDPOINTS (Bluetooth) ---"
Get-PnpDevice -Class AudioEndpoint | ForEach-Object {
    $pnp = $_
    $prop = Get-PnpDeviceProperty -InputObject $pnp -KeyName "{830b873f-90ec-4607-b56a-70829e0c57d1} 15" -ErrorAction SilentlyContinue
    $isConn = if ($null -ne $prop -and $null -ne $prop.Data) { [bool]$prop.Data } else { $false }
    Write-Output "Endpoint: $($pnp.FriendlyName) | Status: $($pnp.Status) | IsConn: $isConn"
}

Write-Output "`n--- BLUETOOTH PAIRED DEVICES ---"
Get-PnpDevice -Class Bluetooth | Where-Object { 
    $_.FriendlyName -and 
    $_.InstanceId -like 'BTHENUM\DEV_*' -or $_.InstanceId -like 'BTHLE\DEV_*'
} | ForEach-Object {
    $pnp = $_
    # Check 1: DEVPKEY_Device_IsConnected ({830b873f-90ec-4607-b56a-70829e0c57d1} 15)
    $prop1 = Get-PnpDeviceProperty -InputObject $pnp -KeyName "{830b873f-90ec-4607-b56a-70829e0c57d1} 15" -ErrorAction SilentlyContinue
    $c1 = if ($null -ne $prop1 -and $null -ne $prop1.Data) { [bool]$prop1.Data } else { $false }

    # Check 2: Siblings status (AVRCP / Audio sink services under BTHENUM)
    $name = $pnp.FriendlyName
    $activeServices = Get-PnpDevice -Class Bluetooth | Where-Object { 
        $_.FriendlyName -like "*$name*" -and $_.InstanceId -ne $pnp.InstanceId -and $_.Status -eq 'OK'
    }
    
    # Check 3: AudioEndpoint matching
    $matchedAudio = Get-PnpDevice -Class AudioEndpoint | Where-Object {
        $_.FriendlyName -like "*$name*" -and $_.Status -eq 'OK'
    }

    Write-Output "Device: $name ($($pnp.InstanceId))"
    Write-Output "   -> PnpIsConnected: $c1"
    Write-Output "   -> ActiveServicesCount: $($activeServices.Count)"
    Write-Output "   -> MatchedAudioEndpointOK: $(if ($matchedAudio) { $true } else { $false })"
}
