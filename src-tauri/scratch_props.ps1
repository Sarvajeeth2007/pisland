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
    $props = Get-PnpDeviceProperty -InputObject $pnp -ErrorAction SilentlyContinue
    Write-Output "=== DEVICE: $($pnp.FriendlyName) ($($pnp.InstanceId)) Status: $($pnp.Status) ==="
    foreach ($pr in $props) {
        if ($null -ne $pr.Data -and $pr.Data.ToString() -ne "") {
            Write-Output "   $($pr.KeyName) = $($pr.Data)"
        }
    }
}
