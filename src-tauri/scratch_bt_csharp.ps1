$code = @'
using System;
using System.Threading.Tasks;
using Windows.Devices.Bluetooth;
using Windows.Devices.Enumeration;

public class BtTest {
    public static void CheckDevices() {
        try {
            var selector = BluetoothDevice.GetDeviceSelector();
            var task1 = DeviceInformation.FindAllAsync(selector).AsTask();
            task1.Wait();
            var devices = task1.Result;
            Console.WriteLine("Found " + devices.Count + " Bluetooth devices in WinRT:");
            
            foreach (var dev in devices) {
                try {
                    var task2 = BluetoothDevice.FromIdAsync(dev.Id).AsTask();
                    task2.Wait();
                    var btDev = task2.Result;
                    if (btDev != null) {
                        Console.WriteLine("Device: '" + dev.Name + "' | ConnectionStatus: " + btDev.ConnectionStatus + " | Address: " + btDev.BluetoothAddress.ToString("X"));
                    } else {
                        Console.WriteLine("Device: '" + dev.Name + "' | Null WinRT object");
                    }
                } catch (Exception ex) {
                    Console.WriteLine("Device: '" + dev.Name + "' | Error: " + ex.Message);
                }
            }
        } catch (Exception e) {
            Console.WriteLine("Main error: " + e.ToString());
        }
    }
}
'@

Add-Type -TypeDefinition $code -Language CSharp
[BtTest]::CheckDevices()
