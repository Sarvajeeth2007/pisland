Get-PnpDevice -Class Bluetooth | Where-Object { 
    $_.FriendlyName -and 
    $_.FriendlyName -notlike '*Adapter*' -and 
    $_.FriendlyName -notlike '*Enumerator*' -and 
    $_.FriendlyName -notlike '*Service*' -and 
    $_.FriendlyName -notlike '*Attribute*' -and 
    $_.FriendlyName -notlike '*Protocol*' -and 
    $_.FriendlyName -notlike '*RFCOMM*' -and 
    $_.FriendlyName -notlike '*Transport*'
} | ForEach-Object {
    $pnp = $_
    $prop = Get-PnpDeviceProperty -InputObject $pnp -KeyName "{830b873f-90ec-4607-b56a-70829e0c57d1} 15" -ErrorAction SilentlyContinue
    $isConn = if ($null -ne $prop -and $null -ne $prop.Data) { [bool]$prop.Data } else { $false }
    [PSCustomObject]@{
        Name = $pnp.FriendlyName
        Status = $pnp.Status
        InstanceId = $pnp.InstanceId
        IsConnected = $isConn
        PropData = if ($null -ne $prop) { $prop.Data } else { "N/A" }
        PropType = if ($null -ne $prop) { $prop.Type } else { "N/A" }
    }
} | Format-Table -AutoSize -Wrap
