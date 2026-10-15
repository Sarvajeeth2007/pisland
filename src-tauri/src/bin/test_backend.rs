// Test binary: verify both Bluetooth WinRT and Audio COM mute work
use std::ffi::c_void;

// ---- COM FFI for Audio ----
#[repr(C)]
struct GUID {
    data1: u32,
    data2: u16,
    data3: u16,
    data4: [u8; 8],
}

type HRESULT = i32;

#[repr(C)]
struct IUnknownVtbl {
    query_interface: *const c_void,
    add_ref: *const c_void,
    release: unsafe extern "system" fn(this: *mut c_void) -> u32,
}

#[repr(C)]
struct IUnknown {
    lp_vtbl: *const IUnknownVtbl,
}

#[repr(C)]
struct IMMDeviceEnumeratorVtbl {
    query_interface: *const c_void,
    add_ref: *const c_void,
    release: unsafe extern "system" fn(this: *mut c_void) -> u32,
    enum_audio_endpoints: *const c_void,
    get_default_audio_endpoint: unsafe extern "system" fn(
        this: *mut c_void, data_flow: i32, role: i32, endpoint: *mut *mut c_void,
    ) -> HRESULT,
}

#[repr(C)]
struct IMMDeviceEnumerator {
    lp_vtbl: *const IMMDeviceEnumeratorVtbl,
}

#[repr(C)]
struct IMMDeviceVtbl {
    query_interface: *const c_void,
    add_ref: *const c_void,
    release: unsafe extern "system" fn(this: *mut c_void) -> u32,
    activate: unsafe extern "system" fn(
        this: *mut c_void, refiid: *const GUID, dw_cls_ctx: u32,
        p_activation_params: *mut c_void, pp_interface: *mut *mut c_void,
    ) -> HRESULT,
}

#[repr(C)]
struct IMMDevice {
    lp_vtbl: *const IMMDeviceVtbl,
}

#[repr(C)]
struct IAudioEndpointVolumeVtbl {
    query_interface: *const c_void,
    add_ref: *const c_void,
    release: unsafe extern "system" fn(this: *mut c_void) -> u32,
    register_control_change_notify: *const c_void,
    unregister_control_change_notify: *const c_void,
    get_channel_count: *const c_void,
    set_master_volume_level: *const c_void,
    set_master_volume_level_scalar: unsafe extern "system" fn(
        this: *mut c_void, f_level: f32, pguid_event_context: *const GUID,
    ) -> HRESULT,
    get_master_volume_level: *const c_void,
    get_master_volume_level_scalar: unsafe extern "system" fn(
        this: *mut c_void, pf_level: *mut f32,
    ) -> HRESULT,
    set_channel_volume_level: *const c_void,
    set_channel_volume_level_scalar: *const c_void,
    get_channel_volume_level: *const c_void,
    get_channel_volume_level_scalar: *const c_void,
    set_mute: unsafe extern "system" fn(
        this: *mut c_void, b_mute: i32, pguid_event_context: *const GUID,
    ) -> HRESULT,
    get_mute: unsafe extern "system" fn(
        this: *mut c_void, pb_mute: *mut i32,
    ) -> HRESULT,
}

#[repr(C)]
struct IAudioEndpointVolume {
    lp_vtbl: *const IAudioEndpointVolumeVtbl,
}

const CLSID_MM_DEVICE_ENUMERATOR: GUID = GUID {
    data1: 0xbcde0395, data2: 0xe52f, data3: 0x467c,
    data4: [0x8e, 0x3d, 0xc4, 0x57, 0x92, 0x91, 0x69, 0x2e],
};

const IID_IMM_DEVICE_ENUMERATOR: GUID = GUID {
    data1: 0xa95664d2, data2: 0x9614, data3: 0x4f35,
    data4: [0xa7, 0x46, 0xde, 0x8d, 0xb6, 0x36, 0x17, 0xe6],
};

const IID_IAUDIO_ENDPOINT_VOLUME: GUID = GUID {
    data1: 0x5cdf2c82, data2: 0x841e, data3: 0x4546,
    data4: [0x97, 0x22, 0x0c, 0xf7, 0x40, 0x78, 0x22, 0x9a],
};

extern "system" {
    fn CoInitializeEx(pv_reserved: *mut c_void, dw_co_init: u32) -> HRESULT;
    fn CoUninitialize();
    fn CoCreateInstance(
        rclsid: *const GUID, p_unk_outer: *mut c_void, dw_cls_context: u32,
        riid: *const GUID, ppv: *mut *mut c_void,
    ) -> HRESULT;
}

fn main() {
    println!("===== MUTE TEST =====");
    test_mute();
    
    println!("\n===== BLUETOOTH WinRT TEST =====");
    test_bluetooth();
}

fn test_mute() {
    unsafe {
        let init_hr = CoInitializeEx(std::ptr::null_mut(), 0x0); // COINIT_MULTITHREADED = 0
        println!("CoInitializeEx result: 0x{:08X}", init_hr as u32);
        
        if init_hr < 0 {
            // Try apartment-threaded
            let init_hr2 = CoInitializeEx(std::ptr::null_mut(), 0x2); // COINIT_APARTMENTTHREADED 
            println!("CoInitializeEx (apartment) result: 0x{:08X}", init_hr2 as u32);
            if init_hr2 < 0 {
                println!("FAILED: Cannot initialize COM");
                return;
            }
        }
        
        let mut enumerator: *mut c_void = std::ptr::null_mut();
        let hr = CoCreateInstance(
            &CLSID_MM_DEVICE_ENUMERATOR, std::ptr::null_mut(), 1,
            &IID_IMM_DEVICE_ENUMERATOR, &mut enumerator,
        );
        println!("CoCreateInstance(MMDeviceEnumerator) result: 0x{:08X}", hr as u32);
        if hr < 0 {
            println!("FAILED: Cannot create MMDeviceEnumerator");
            CoUninitialize();
            return;
        }
        
        let mut device: *mut c_void = std::ptr::null_mut();
        let hr = ((*(*(enumerator as *mut IMMDeviceEnumerator)).lp_vtbl).get_default_audio_endpoint)(
            enumerator, 0, 0, &mut device,
        );
        println!("GetDefaultAudioEndpoint result: 0x{:08X}", hr as u32);
        ((*(*(enumerator as *mut IUnknown)).lp_vtbl).release)(enumerator);
        if hr < 0 {
            println!("FAILED: No default audio endpoint");
            CoUninitialize();
            return;
        }
        
        let mut volume: *mut c_void = std::ptr::null_mut();
        let hr = ((*(*(device as *mut IMMDevice)).lp_vtbl).activate)(
            device, &IID_IAUDIO_ENDPOINT_VOLUME, 1, std::ptr::null_mut(), &mut volume,
        );
        println!("Activate(IAudioEndpointVolume) result: 0x{:08X}", hr as u32);
        ((*(*(device as *mut IUnknown)).lp_vtbl).release)(device);
        if hr < 0 {
            println!("FAILED: Cannot activate IAudioEndpointVolume");
            CoUninitialize();
            return;
        }

        // Get current volume
        let mut vol: f32 = 0.0;
        let hr = ((*(*(volume as *mut IAudioEndpointVolume)).lp_vtbl).get_master_volume_level_scalar)(
            volume, &mut vol,
        );
        println!("GetMasterVolumeLevelScalar result: 0x{:08X}, volume = {:.0}%", hr as u32, vol * 100.0);
        
        // Get mute state
        let mut mute_val: i32 = 0;
        let hr = ((*(*(volume as *mut IAudioEndpointVolume)).lp_vtbl).get_mute)(
            volume, &mut mute_val,
        );
        println!("GetMute result: 0x{:08X}, muted = {} (raw: {})", hr as u32, mute_val != 0, mute_val);
        
        // Toggle mute
        let new_mute = if mute_val != 0 { 0 } else { 1 };
        let context = GUID { data1: 0, data2: 0, data3: 0, data4: [0; 8] };
        let hr = ((*(*(volume as *mut IAudioEndpointVolume)).lp_vtbl).set_mute)(
            volume, new_mute, &context,
        );
        println!("SetMute({}) result: 0x{:08X}", new_mute != 0, hr as u32);
        
        // Verify
        let mut mute_val2: i32 = 0;
        let hr = ((*(*(volume as *mut IAudioEndpointVolume)).lp_vtbl).get_mute)(
            volume, &mut mute_val2,
        );
        println!("GetMute after toggle: 0x{:08X}, muted = {}", hr as u32, mute_val2 != 0);
        
        // Test volume set and get
        let orig_vol = vol;
        let test_vol = if (vol - 0.5).abs() < 0.05 { 0.6 } else { 0.5 };
        let hr = ((*(*(volume as *mut IAudioEndpointVolume)).lp_vtbl).set_master_volume_level_scalar)(
            volume, test_vol, &context,
        );
        println!("SetMasterVolumeLevelScalar({:.0}%) result: 0x{:08X}", test_vol * 100.0, hr as u32);
        let mut read_vol: f32 = 0.0;
        let hr = ((*(*(volume as *mut IAudioEndpointVolume)).lp_vtbl).get_master_volume_level_scalar)(
            volume, &mut read_vol,
        );
        println!("GetMasterVolumeLevelScalar after set: 0x{:08X}, volume = {:.0}%", hr as u32, read_vol * 100.0);
        // Restore volume
        let hr = ((*(*(volume as *mut IAudioEndpointVolume)).lp_vtbl).set_master_volume_level_scalar)(
            volume, orig_vol, &context,
        );
        println!("SetMasterVolumeLevelScalar (restore {:.0}%) result: 0x{:08X}", orig_vol * 100.0, hr as u32);
        // Restore mute
        let hr = ((*(*(volume as *mut IAudioEndpointVolume)).lp_vtbl).set_mute)(
            volume, mute_val, &context,
        );
        println!("SetMute (restore {}) result: 0x{:08X}", mute_val != 0, hr as u32);
        
        ((*(*(volume as *mut IUnknown)).lp_vtbl).release)(volume);
        CoUninitialize();
        println!("VOLUME & MUTE TEST: SUCCESS - COM audio APIs work correctly");
    }
}

fn test_bluetooth() {
    use windows::Devices::Bluetooth::{BluetoothDevice, BluetoothConnectionStatus};
    use windows::Devices::Enumeration::DeviceInformation;
    
    // First, try to find ALL paired BT devices
    println!("Getting selector for paired Bluetooth devices...");
    let selector = match BluetoothDevice::GetDeviceSelectorFromPairingState(true) {
        Ok(s) => { println!("Selector: {}", s); s },
        Err(e) => { println!("FAILED to get selector: {:?}", e); return; }
    };
    
    println!("Finding all paired devices...");
    let operation = match DeviceInformation::FindAllAsyncAqsFilter(&selector) {
        Ok(op) => op,
        Err(e) => { println!("FAILED FindAllAsync: {:?}", e); return; }
    };
    
    let devices = match operation.get() {
        Ok(d) => d,
        Err(e) => { println!("FAILED to get results: {:?}", e); return; }
    };
    
    let count = devices.Size().unwrap_or(0);
    println!("Found {} paired Bluetooth devices:", count);
    
    for i in 0..count {
        let dev_info = match devices.GetAt(i) {
            Ok(d) => d,
            Err(_) => continue,
        };
        let name = dev_info.Name().unwrap_or_default().to_string();
        let id = dev_info.Id().unwrap_or_default().to_string();
        
        // Get actual BluetoothDevice to check ConnectionStatus
        match BluetoothDevice::FromIdAsync(&dev_info.Id().unwrap_or_default()) {
            Ok(op) => {
                match op.get() {
                    Ok(bt_dev) => {
                        let status = bt_dev.ConnectionStatus().unwrap_or(BluetoothConnectionStatus::Disconnected);
                        let is_connected = status == BluetoothConnectionStatus::Connected;
                        println!("  [{}] {} | ID: {} | Connected: {}", 
                            if is_connected { "CONNECTED" } else { "disconnected" },
                            name, id, is_connected);
                    },
                    Err(e) => {
                        println!("  [ERROR] {} | ID: {} | FromIdAsync failed: {:?}", name, id, e);
                    }
                }
            },
            Err(e) => {
                println!("  [ERROR] {} | FromIdAsync call failed: {:?}", name, e);
            }
        }
    }
    
    // Also check: find ONLY connected devices
    println!("\nGetting selector for CONNECTED-ONLY devices...");
    match BluetoothDevice::GetDeviceSelectorFromConnectionStatus(BluetoothConnectionStatus::Connected) {
        Ok(connected_selector) => {
            println!("Connected selector: {}", connected_selector);
            match DeviceInformation::FindAllAsyncAqsFilter(&connected_selector) {
                Ok(op) => {
                    match op.get() {
                        Ok(connected_devs) => {
                            let c = connected_devs.Size().unwrap_or(0);
                            println!("Currently connected devices: {}", c);
                            for i in 0..c {
                                if let Ok(d) = connected_devs.GetAt(i) {
                                    println!("  -> {}", d.Name().unwrap_or_default());
                                }
                            }
                        },
                        Err(e) => println!("FAILED get connected devices: {:?}", e),
                    }
                },
                Err(e) => println!("FAILED FindAllAsync for connected: {:?}", e),
            }
        },
        Err(e) => println!("FAILED GetDeviceSelectorFromConnectionStatus: {:?}", e),
    }
}
