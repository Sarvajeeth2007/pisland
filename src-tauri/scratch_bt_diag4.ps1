# Focus: check if BT audio devices have A2DP sink profiles with DEVPKEY_Device_IsConnected
Write-Host "=== A2DP Sink (Audio) profile instances and their connection status ==="
# Service UUID 0000110B = A2DP Sink, 0000110A = A2DP Source, 0000111E = Handsfree AG, 0000111F = Handsfree HF
Get-PnpDevice | Where-Object { 
    $_.InstanceId -like 'BTHENUM\{0000110B*' -or 
    $_.InstanceId -like 'BTHENUM\{0000111E*'
} | ForEach-Object {
    $dev = $_
    $prop = Get-PnpDeviceProperty -InputObject $dev -KeyName "{830b873f-90ec-4607-b56a-70829e0c57d1} 15" -ErrorAction SilentlyContinue
    $isConn = if ($null -ne $prop -and $null -ne $prop.Data) { [bool]$prop.Data } else { $false }
    [PSCustomObject]@{
        Name = $dev.FriendlyName
        Status = $dev.Status
        IsConnected = $isConn
        InstanceId = $dev.InstanceId
    }
} | Format-Table -AutoSize -Wrap

Write-Host "`n=== Check SWD\BTHPORT devices ==="
Get-PnpDevice | Where-Object { $_.InstanceId -like 'SWD\BTHPORT*' } | Select-Object FriendlyName, Status, InstanceId | Format-Table -AutoSize -Wrap

Write-Host "`n=== Try CIM Bluetooth with CimSession ==="
# This checks if there's a WMI class for BT connection
Get-CimInstance -Namespace root\cimv2 -ClassName Win32_PnPEntity -Filter "Service='BthA2dp' OR Service='BthHFAud' OR Service='BTHUSB' OR Service='RFCOMM'" -ErrorAction SilentlyContinue | Select-Object Name, Status, StatusInfo | Format-Table -AutoSize -Wrap
