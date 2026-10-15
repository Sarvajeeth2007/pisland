use tauri::Emitter;
use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Win32 FFI for Windows target
#[cfg(target_os = "windows")]
#[repr(C)]
struct RECT {
    left: i32,
    top: i32,
    right: i32,
    bottom: i32,
}

#[cfg(target_os = "windows")]
#[repr(C)]
struct FILETIME {
    dw_low_date_time: u32,
    dw_high_date_time: u32,
}

#[cfg(target_os = "windows")]
#[repr(C)]
struct MEMORYSTATUSEX {
    dw_length: u32,
    dw_memory_load: u32,
    ull_total_phys: u64,
    ull_avail_phys: u64,
    ull_total_page_file: u64,
    ull_avail_page_file: u64,
    ull_total_virtual: u64,
    ull_avail_virtual: u64,
    ull_avail_extended_virtual: u64,
}

#[cfg(target_os = "windows")]
#[repr(C)]
struct SYSTEM_POWER_STATUS {
    ac_line_status: u8,
    battery_flag: u8,
    battery_life_percent: u8,
    system_status_flag: u8,
    battery_life_time: u32,
    battery_full_life_time: u32,
}

#[cfg(target_os = "windows")]
#[repr(C)]
#[derive(Clone, Copy)]
struct GUID {
    data1: u32,
    data2: u16,
    data3: u16,
    data4: [u8; 8],
}

type HRESULT = i32;

#[cfg(target_os = "windows")]
#[repr(C)]
struct IUnknownVtbl {
    query_interface: *const std::ffi::c_void,
    add_ref: *const std::ffi::c_void,
    release: unsafe extern "system" fn(this: *mut std::ffi::c_void) -> u32,
}

#[cfg(target_os = "windows")]
#[repr(C)]
struct IUnknown {
    lp_vtbl: *const IUnknownVtbl,
}

#[cfg(target_os = "windows")]
#[repr(C)]
struct IMMDeviceEnumeratorVtbl {
    query_interface: *const std::ffi::c_void,
    add_ref: *const std::ffi::c_void,
    release: unsafe extern "system" fn(this: *mut std::ffi::c_void) -> u32,
    enum_audio_endpoints: *const std::ffi::c_void,
    get_default_audio_endpoint: unsafe extern "system" fn(
        this: *mut std::ffi::c_void,
        data_flow: i32,
        role: i32,
        endpoint: *mut *mut std::ffi::c_void,
    ) -> HRESULT,
}

#[cfg(target_os = "windows")]
#[repr(C)]
struct IMMDeviceEnumerator {
    lp_vtbl: *const IMMDeviceEnumeratorVtbl,
}

#[cfg(target_os = "windows")]
#[repr(C)]
struct IMMDeviceVtbl {
    query_interface: *const std::ffi::c_void,
    add_ref: *const std::ffi::c_void,
    release: unsafe extern "system" fn(this: *mut std::ffi::c_void) -> u32,
    activate: unsafe extern "system" fn(
        this: *mut std::ffi::c_void,
        refiid: *const GUID,
        dw_cls_ctx: u32,
        p_activation_params: *mut std::ffi::c_void,
        pp_interface: *mut *mut std::ffi::c_void,
    ) -> HRESULT,
}

#[cfg(target_os = "windows")]
#[repr(C)]
struct IMMDevice {
    lp_vtbl: *const IMMDeviceVtbl,
}

#[cfg(target_os = "windows")]
#[repr(C)]
struct IAudioEndpointVolumeVtbl {
    query_interface: *const std::ffi::c_void,
    add_ref: *const std::ffi::c_void,
    release: unsafe extern "system" fn(this: *mut std::ffi::c_void) -> u32,
    register_control_change_notify: *const std::ffi::c_void,
    unregister_control_change_notify: *const std::ffi::c_void,
    get_channel_count: *const std::ffi::c_void,
    set_master_volume_level: *const std::ffi::c_void,
    set_master_volume_level_scalar: unsafe extern "system" fn(
        this: *mut std::ffi::c_void,
        f_level: f32,
        pguid_event_context: *const GUID,
    ) -> HRESULT,
    get_master_volume_level: *const std::ffi::c_void,
    get_master_volume_level_scalar:
        unsafe extern "system" fn(this: *mut std::ffi::c_void, pf_level: *mut f32) -> HRESULT,
    set_channel_volume_level: *const std::ffi::c_void,
    set_channel_volume_level_scalar: *const std::ffi::c_void,
    get_channel_volume_level: *const std::ffi::c_void,
    get_channel_volume_level_scalar: *const std::ffi::c_void,
    set_mute: unsafe extern "system" fn(
        this: *mut std::ffi::c_void,
        b_mute: i32,
        pguid_event_context: *const GUID,
    ) -> HRESULT,
    get_mute: unsafe extern "system" fn(this: *mut std::ffi::c_void, pb_mute: *mut i32) -> HRESULT,
}

#[cfg(target_os = "windows")]
#[repr(C)]
struct IAudioEndpointVolume {
    lp_vtbl: *const IAudioEndpointVolumeVtbl,
}

#[cfg(target_os = "windows")]
const CLSID_MM_DEVICE_ENUMERATOR: GUID = GUID {
    data1: 0xbcde0395,
    data2: 0xe52f,
    data3: 0x467c,
    data4: [0x8e, 0x3d, 0xc4, 0x57, 0x92, 0x91, 0x69, 0x2e],
};

#[cfg(target_os = "windows")]
const IID_IMM_DEVICE_ENUMERATOR: GUID = GUID {
    data1: 0xa95664d2,
    data2: 0x9614,
    data3: 0x4f35,
    data4: [0xa7, 0x46, 0xde, 0x8d, 0xb6, 0x36, 0x17, 0xe6],
};

#[cfg(target_os = "windows")]
const IID_IAUDIO_ENDPOINT_VOLUME: GUID = GUID {
    data1: 0x5cdf2c82,
    data2: 0x841e,
    data3: 0x4546,
    data4: [0x97, 0x22, 0x0c, 0xf7, 0x40, 0x78, 0x22, 0x9a],
};

#[cfg(target_os = "windows")]
extern "system" {
    fn GetForegroundWindow() -> isize;
    fn GetDesktopWindow() -> isize;
    fn GetShellWindow() -> isize;
    fn GetWindowRect(hwnd: isize, rect: *mut RECT) -> i32;
    fn GetSystemMetrics(nIndex: i32) -> i32;
    fn GetSystemPowerStatus(status: *mut SYSTEM_POWER_STATUS) -> i32;
    fn GlobalMemoryStatusEx(lp_buffer: *mut MEMORYSTATUSEX) -> i32;
    fn GetSystemTimes(
        lp_idle_time: *mut FILETIME,
        lp_kernel_time: *mut FILETIME,
        lp_user_time: *mut FILETIME,
    ) -> i32;
    fn CoInitializeEx(pv_reserved: *mut std::ffi::c_void, dw_co_init: u32) -> HRESULT;
    fn CoUninitialize();
    fn CoCreateInstance(
        rclsid: *const GUID,
        p_unk_outer: *mut std::ffi::c_void,
        dw_cls_context: u32,
        riid: *const GUID,
        ppv: *mut *mut std::ffi::c_void,
    ) -> HRESULT;
}

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

// COM helper for volume retrieval
#[cfg(target_os = "windows")]
unsafe fn get_system_volume(data_flow: i32) -> Result<f32, i32> {
    let init_hr = CoInitializeEx(std::ptr::null_mut(), 0x2);
    let need_uninit = init_hr >= 0;

    let mut enumerator: *mut std::ffi::c_void = std::ptr::null_mut();
    let mut hr = CoCreateInstance(
        &CLSID_MM_DEVICE_ENUMERATOR,
        std::ptr::null_mut(),
        1, // CLSCTX_INPROC_SERVER
        &IID_IMM_DEVICE_ENUMERATOR,
        &mut enumerator,
    );
    if hr < 0 {
        if need_uninit {
            CoUninitialize();
        }
        return Err(hr);
    }

    let mut device: *mut std::ffi::c_void = std::ptr::null_mut();
    hr = ((*(*(enumerator as *mut IMMDeviceEnumerator)).lp_vtbl).get_default_audio_endpoint)(
        enumerator,
        data_flow, // 0 for playback, 1 for capture
        0,         // eConsole
        &mut device,
    );
    ((*(*(enumerator as *mut IUnknown)).lp_vtbl).release)(enumerator);
    if hr < 0 {
        if need_uninit {
            CoUninitialize();
        }
        return Err(hr);
    }

    let mut volume: *mut std::ffi::c_void = std::ptr::null_mut();
    hr = ((*(*(device as *mut IMMDevice)).lp_vtbl).activate)(
        device,
        &IID_IAUDIO_ENDPOINT_VOLUME,
        1, // CLSCTX_INPROC_SERVER
        std::ptr::null_mut(),
        &mut volume,
    );
    ((*(*(device as *mut IUnknown)).lp_vtbl).release)(device);
    if hr < 0 {
        if need_uninit {
            CoUninitialize();
        }
        return Err(hr);
    }

    let mut val: f32 = 0.0;
    hr = ((*(*(volume as *mut IAudioEndpointVolume)).lp_vtbl).get_master_volume_level_scalar)(
        volume, &mut val,
    );

    ((*(*(volume as *mut IUnknown)).lp_vtbl).release)(volume);
    if need_uninit {
        CoUninitialize();
    }

    if hr < 0 {
        Err(hr)
    } else {
        Ok(val)
    }
}

// COM helper for volume setting
#[cfg(target_os = "windows")]
unsafe fn set_system_volume(data_flow: i32, val: f32) -> Result<(), i32> {
    let init_hr = CoInitializeEx(std::ptr::null_mut(), 0x2);
    let need_uninit = init_hr >= 0;

    let mut enumerator: *mut std::ffi::c_void = std::ptr::null_mut();
    let mut hr = CoCreateInstance(
        &CLSID_MM_DEVICE_ENUMERATOR,
        std::ptr::null_mut(),
        1,
        &IID_IMM_DEVICE_ENUMERATOR,
        &mut enumerator,
    );
    if hr < 0 {
        if need_uninit {
            CoUninitialize();
        }
        return Err(hr);
    }

    let mut device: *mut std::ffi::c_void = std::ptr::null_mut();
    hr = ((*(*(enumerator as *mut IMMDeviceEnumerator)).lp_vtbl).get_default_audio_endpoint)(
        enumerator,
        data_flow,
        0,
        &mut device,
    );
    ((*(*(enumerator as *mut IUnknown)).lp_vtbl).release)(enumerator);
    if hr < 0 {
        if need_uninit {
            CoUninitialize();
        }
        return Err(hr);
    }

    let mut volume: *mut std::ffi::c_void = std::ptr::null_mut();
    hr = ((*(*(device as *mut IMMDevice)).lp_vtbl).activate)(
        device,
        &IID_IAUDIO_ENDPOINT_VOLUME,
        1,
        std::ptr::null_mut(),
        &mut volume,
    );
    ((*(*(device as *mut IUnknown)).lp_vtbl).release)(device);
    if hr < 0 {
        if need_uninit {
            CoUninitialize();
        }
        return Err(hr);
    }

    let context = GUID {
        data1: 0,
        data2: 0,
        data3: 0,
        data4: [0; 8],
    };
    hr = ((*(*(volume as *mut IAudioEndpointVolume)).lp_vtbl).set_master_volume_level_scalar)(
        volume, val, &context,
    );

    ((*(*(volume as *mut IUnknown)).lp_vtbl).release)(volume);
    if need_uninit {
        CoUninitialize();
    }

    if hr < 0 {
        Err(hr)
    } else {
        Ok(())
    }
}

// COM helper for mute retrieval
#[cfg(target_os = "windows")]
unsafe fn get_system_mute(data_flow: i32) -> Result<bool, i32> {
    let init_hr = CoInitializeEx(std::ptr::null_mut(), 0x2);
    let need_uninit = init_hr >= 0;

    let mut enumerator: *mut std::ffi::c_void = std::ptr::null_mut();
    let mut hr = CoCreateInstance(
        &CLSID_MM_DEVICE_ENUMERATOR,
        std::ptr::null_mut(),
        1,
        &IID_IMM_DEVICE_ENUMERATOR,
        &mut enumerator,
    );
    if hr < 0 {
        if need_uninit {
            CoUninitialize();
        }
        return Err(hr);
    }

    let mut device: *mut std::ffi::c_void = std::ptr::null_mut();
    hr = ((*(*(enumerator as *mut IMMDeviceEnumerator)).lp_vtbl).get_default_audio_endpoint)(
        enumerator,
        data_flow,
        0,
        &mut device,
    );
    ((*(*(enumerator as *mut IUnknown)).lp_vtbl).release)(enumerator);
    if hr < 0 {
        if need_uninit {
            CoUninitialize();
        }
        return Err(hr);
    }

    let mut volume: *mut std::ffi::c_void = std::ptr::null_mut();
    hr = ((*(*(device as *mut IMMDevice)).lp_vtbl).activate)(
        device,
        &IID_IAUDIO_ENDPOINT_VOLUME,
        1,
        std::ptr::null_mut(),
        &mut volume,
    );
    ((*(*(device as *mut IUnknown)).lp_vtbl).release)(device);
    if hr < 0 {
        if need_uninit {
            CoUninitialize();
        }
        return Err(hr);
    }

    let mut mute: i32 = 0;
    hr = ((*(*(volume as *mut IAudioEndpointVolume)).lp_vtbl).get_mute)(volume, &mut mute);

    ((*(*(volume as *mut IUnknown)).lp_vtbl).release)(volume);
    if need_uninit {
        CoUninitialize();
    }

    if hr < 0 {
        Err(hr)
    } else {
        Ok(mute != 0)
    }
}

// COM helper for mute setting
#[cfg(target_os = "windows")]
unsafe fn set_system_mute(data_flow: i32, mute: bool) -> Result<(), i32> {
    let init_hr = CoInitializeEx(std::ptr::null_mut(), 0x2);
    let need_uninit = init_hr >= 0;

    let mut enumerator: *mut std::ffi::c_void = std::ptr::null_mut();
    let mut hr = CoCreateInstance(
        &CLSID_MM_DEVICE_ENUMERATOR,
        std::ptr::null_mut(),
        1,
        &IID_IMM_DEVICE_ENUMERATOR,
        &mut enumerator,
    );
    if hr < 0 {
        if need_uninit {
            CoUninitialize();
        }
        return Err(hr);
    }

    let mut device: *mut std::ffi::c_void = std::ptr::null_mut();
    hr = ((*(*(enumerator as *mut IMMDeviceEnumerator)).lp_vtbl).get_default_audio_endpoint)(
        enumerator,
        data_flow,
        0,
        &mut device,
    );
    ((*(*(enumerator as *mut IUnknown)).lp_vtbl).release)(enumerator);
    if hr < 0 {
        if need_uninit {
            CoUninitialize();
        }
        return Err(hr);
    }

    let mut volume: *mut std::ffi::c_void = std::ptr::null_mut();
    hr = ((*(*(device as *mut IMMDevice)).lp_vtbl).activate)(
        device,
        &IID_IAUDIO_ENDPOINT_VOLUME,
        1,
        std::ptr::null_mut(),
        &mut volume,
    );
    ((*(*(device as *mut IUnknown)).lp_vtbl).release)(device);
    if hr < 0 {
        if need_uninit {
            CoUninitialize();
        }
        return Err(hr);
    }

    let context = GUID {
        data1: 0,
        data2: 0,
        data3: 0,
        data4: [0; 8],
    };
    hr = ((*(*(volume as *mut IAudioEndpointVolume)).lp_vtbl).set_mute)(
        volume,
        if mute { 1 } else { 0 },
        &context,
    );

    ((*(*(volume as *mut IUnknown)).lp_vtbl).release)(volume);
    if need_uninit {
        CoUninitialize();
    }

    if hr < 0 {
        Err(hr)
    } else {
        Ok(())
    }
}

// Monitor brightness helper
#[cfg(target_os = "windows")]
fn get_brightness() -> u32 {
    let output = std::process::Command::new("powershell")
        .args(&[
            "-NoProfile",
            "-Command",
            "Get-CimInstance -Namespace root/WMI -ClassName WmiMonitorBrightness | Select-Object -ExpandProperty CurrentBrightness"
        ])
        .creation_flags(0x08000000) // CREATE_NO_WINDOW
        .output();

    if let Ok(out) = output {
        let text = String::from_utf8_lossy(&out.stdout).trim().to_string();
        if let Ok(val) = text.parse::<u32>() {
            return val;
        }
    }
    100
}

// Monitor Wi-Fi helper: returns (adapter_enabled, is_connected, ssid)
#[cfg(target_os = "windows")]
fn get_wifi_status() -> (bool, bool, String) {
    let output = std::process::Command::new("netsh")
        .args(&["wlan", "show", "interfaces"])
        .creation_flags(0x08000000)
        .output();

    if let Ok(out) = output {
        let text = String::from_utf8_lossy(&out.stdout);
        let has_no_interface = text.contains("There is no wireless interface") || text.trim().is_empty();
        let is_radio_off = text.contains("Software Off") || text.contains("Hardware Off");

        let mut adapter_on = !has_no_interface && !is_radio_off;
        let mut connected = false;
        let mut ssid = String::new();

        for line in text.lines() {
            let line = line.trim();
            if line.starts_with("State") {
                if line.contains("connected") && !line.contains("disconnected") {
                    connected = true;
                }
            } else if line.starts_with("SSID") && !line.starts_with("BSSID") {
                if let Some(pos) = line.find(':') {
                    ssid = line[pos + 1..].trim().to_string();
                }
            }
        }

        if !text.contains("State") && !has_no_interface {
            adapter_on = false;
        }

        if connected {
            return (adapter_on, true, ssid);
        } else {
            return (adapter_on, false, "Disconnected".to_string());
        }
    }
    (false, false, "Disconnected".to_string())
}

// Monitor Bluetooth helper
// Strategy: check MMDEVAPI AudioEndpoint devices that are active (Status=OK) and
// contain a Bluetooth device name in parentheses, e.g. "Headphones (Tws 7335)".
// This is the reliable method on modern Windows where DEVPKEY_Device_IsConnected
// returns False even for connected devices.
#[cfg(target_os = "windows")]
fn get_bluetooth_status() -> (bool, String) {
    // Step 1: Get active audio endpoints from MMDEVAPI
    let ep_script = r#"
$eps = Get-PnpDevice -Class AudioEndpoint -Status OK -ErrorAction SilentlyContinue
$connected = @()
foreach ($ep in $eps) {
    $fn = $ep.FriendlyName
    if ($fn -match '\((.+)\)$') {
        $devName = $matches[1]
        # Exclude known non-BT devices
        if ($devName -notlike '*Realtek*' -and $devName -notlike '*VB-Audio*' -and
            $devName -notlike '*CABLE*' -and $devName -notlike '*HD Audio*' -and
            $devName -notlike '*USB*' -and $devName -notlike '*Line*') {
            $connected += $devName
        }
    }
}
$connected | Sort-Object -Unique | ConvertTo-Json -Compress
    "#;

    let output = std::process::Command::new("powershell")
        .args(&["-NoProfile", "-Command", ep_script])
        .creation_flags(0x08000000)
        .output();

    if let Ok(out) = output {
        let text = String::from_utf8_lossy(&out.stdout).trim().to_string();
        if !text.is_empty() && text != "null" {
            // May be a JSON array or a single string
            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&text) {
                let names: Vec<String> = if parsed.is_array() {
                    parsed.as_array()
                        .unwrap_or(&vec![])
                        .iter()
                        .filter_map(|v| v.as_str().map(|s| s.trim().to_string()))
                        .filter(|s| !s.is_empty())
                        .collect()
                } else if let Some(s) = parsed.as_str() {
                    let s = s.trim().to_string();
                    if s.is_empty() { vec![] } else { vec![s] }
                } else {
                    vec![]
                };
                if let Some(first) = names.into_iter().next() {
                    // Deduplicate: "Tws 7335 Hands-Free" and "Tws 7335" -> prefer shorter
                    return (true, first);
                }
            }
        }
    }
    (false, String::new())
}

// Detect if Bluetooth adapter is enabled (adapter device Status == OK)
#[cfg(target_os = "windows")]
fn get_bluetooth_adapter_on() -> bool {
    let output = std::process::Command::new("powershell")
        .args(&[
            "-NoProfile",
            "-Command",
            "$r = Get-PnpDevice -Class Bluetooth -ErrorAction SilentlyContinue | Where-Object { $_.FriendlyName -like '*Adapter*' -or $_.FriendlyName -like '*Radio*' -or ($_.InstanceId -like 'USB\\*' -and $_.FriendlyName -notlike '*Enumerator*' -and $_.FriendlyName -notlike '*Transport*' -and $_.FriendlyName -notlike '*Service*') }; if ($r) { $r[0].Status } else { 'Unknown' }"
        ])
        .creation_flags(0x08000000)
        .output();
    if let Ok(out) = output {
        let text = String::from_utf8_lossy(&out.stdout).trim().to_string();
        return text.eq_ignore_ascii_case("OK");
    }
    // If no adapter device found, assume BT is on (common on laptops with embedded BT)
    true
}

// Monitor VPN helper
#[cfg(target_os = "windows")]
fn get_vpn_status() -> bool {
    let output = std::process::Command::new("powershell")
        .args(&[
            "-NoProfile",
            "-Command",
            "Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -and ($_.Name -like '*vpn*' -or $_.Description -like '*vpn*' -or $_.Name -like '*tailscale*' -or $_.Name -like '*wireguard*' -or $_.Name -like '*tap*' -or $_.Name -like '*tunnel*') }"
        ])
        .creation_flags(0x08000000)
        .output();

    if let Ok(out) = output {
        let text = String::from_utf8_lossy(&out.stdout).trim().to_string();
        return !text.is_empty();
    }
    false
}

// Monitor network speeds helper
#[cfg(target_os = "windows")]
fn get_network_speeds() -> (u64, u64) {
    let output = std::process::Command::new("powershell")
        .args(&[
            "-NoProfile",
            "-Command",
            "$rx = 0; $tx = 0; Get-CimInstance Win32_PerfFormattedData_Tcpip_NetworkInterface -ErrorAction SilentlyContinue | ForEach-Object { $rx += $_.BytesReceivedPersec; $tx += $_.BytesSentPersec }; \"$rx|$tx\""
        ])
        .creation_flags(0x08000000)
        .output();

    if let Ok(out) = output {
        let text = String::from_utf8_lossy(&out.stdout).trim().to_string();
        let parts: Vec<&str> = text.split('|').collect();
        if parts.len() == 2 {
            let rx = parts[0].parse::<u64>().unwrap_or(0);
            let tx = parts[1].parse::<u64>().unwrap_or(0);
            return (rx, tx);
        }
    }
    (0, 0)
}

// CPU usage logic
#[cfg(target_os = "windows")]
fn filetime_to_u64(ft: FILETIME) -> u64 {
    ((ft.dw_high_date_time as u64) << 32) | (ft.dw_low_date_time as u64)
}

#[cfg(target_os = "windows")]
fn get_cpu_usage() -> u32 {
    unsafe {
        let mut idle1 = FILETIME {
            dw_low_date_time: 0,
            dw_high_date_time: 0,
        };
        let mut kernel1 = FILETIME {
            dw_low_date_time: 0,
            dw_high_date_time: 0,
        };
        let mut user1 = FILETIME {
            dw_low_date_time: 0,
            dw_high_date_time: 0,
        };

        if GetSystemTimes(&mut idle1, &mut kernel1, &mut user1) == 0 {
            return 0;
        }

        std::thread::sleep(std::time::Duration::from_millis(150));

        let mut idle2 = FILETIME {
            dw_low_date_time: 0,
            dw_high_date_time: 0,
        };
        let mut kernel2 = FILETIME {
            dw_low_date_time: 0,
            dw_high_date_time: 0,
        };
        let mut user2 = FILETIME {
            dw_low_date_time: 0,
            dw_high_date_time: 0,
        };

        if GetSystemTimes(&mut idle2, &mut kernel2, &mut user2) == 0 {
            return 0;
        }

        let idle_diff = filetime_to_u64(idle2) - filetime_to_u64(idle1);
        let kernel_diff = filetime_to_u64(kernel2) - filetime_to_u64(kernel1);
        let user_diff = filetime_to_u64(user2) - filetime_to_u64(user1);

        let total_diff = kernel_diff + user_diff;
        if total_diff == 0 {
            return 0;
        }

        let cpu = ((total_diff - idle_diff) * 100) / total_diff;
        cpu as u32
    }
}

#[cfg(target_os = "windows")]
fn get_airplane_mode_status() -> bool {
    let output = std::process::Command::new("reg")
        .args(&[
            "query",
            "HKLM\\SYSTEM\\CurrentControlSet\\Control\\RadioManagement\\SystemRadioState",
            "/ve",
        ])
        .creation_flags(0x08000000)
        .output();

    if let Ok(out) = output {
        let text = String::from_utf8_lossy(&out.stdout).to_string();
        if text.contains("0x1") {
            return true;
        }
    }
    false
}

// Night light (Blue Light Reduction) state
#[cfg(target_os = "windows")]
fn get_night_light_status() -> bool {
    // Check the CloudStore key for blue light reduction state
    // The Data binary blob: byte at offset 18 == 0x15 means ON (varies by build)
    // Simpler: check for scheduled hours key or the current state subkey
    let output = std::process::Command::new("reg")
        .args(&[
            "query",
            "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\CloudStore\\Store\\DefaultAccount\\Current\\default$windows.data.bluelightreduction.bluelightreductionstate\\windows.data.bluelightreduction.bluelightreductionstate",
            "/v",
            "Data",
        ])
        .creation_flags(0x08000000)
        .output();

    if let Ok(out) = output {
        if out.status.success() {
            // Raw binary blob: when night light is ON the 19th byte (index 18) is 0x15
            // We parse the hex dump from reg query output
            let text = String::from_utf8_lossy(&out.stdout).to_string();
            // Look for the hex data after "REG_BINARY"
            if let Some(pos) = text.find("REG_BINARY") {
                let hex_part = text[pos + 10..].trim();
                let bytes: Vec<u8> = hex_part
                    .split_whitespace()
                    .filter_map(|s| u8::from_str_radix(s, 16).ok())
                    .collect();
                // Byte 18 == 0x15 => night light on; 0x13 => off
                if bytes.len() > 18 {
                    return bytes[18] == 0x15;
                }
            }
        }
    }
    false
}

#[cfg(target_os = "windows")]
fn get_mobile_hotspot_status() -> bool {
    let output = std::process::Command::new("sc")
        .args(&["query", "icssvc"])
        .creation_flags(0x08000000)
        .output();

    if let Ok(out) = output {
        let text = String::from_utf8_lossy(&out.stdout).to_string();
        if text.contains("RUNNING") {
            return true;
        }
    }
    false
}

#[cfg(target_os = "windows")]
fn get_dnd_status() -> bool {
    let output = std::process::Command::new("reg")
        .args(&[
            "query",
            "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\QuietHours",
            "/v",
            "QuietHoursServiceState",
        ])
        .creation_flags(0x08000000)
        .output();

    if let Ok(out) = output {
        let text = String::from_utf8_lossy(&out.stdout).to_string();
        if text.contains("0x1") || text.contains("0x2") {
            return true;
        }
    }
    false
}

#[cfg(target_os = "windows")]
fn get_nearby_sharing_status() -> bool {
    let output = std::process::Command::new("reg")
        .args(&[
            "query",
            "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\CDP",
            "/v",
            "NearShareChannelUserAuthzPolicy",
        ])
        .creation_flags(0x08000000)
        .output();

    if let Ok(out) = output {
        let text = String::from_utf8_lossy(&out.stdout).to_string();
        if text.contains("0x1") || text.contains("0x2") {
            return true;
        }
    }
    false
}

#[cfg(target_os = "windows")]
fn get_camera_status() -> bool {
    let output = std::process::Command::new("reg")
        .args(&[
            "query",
            "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\webcam",
            "/v",
            "Value"
        ])
        .creation_flags(0x08000000)
        .output();

    if let Ok(out) = output {
        let text = String::from_utf8_lossy(&out.stdout).to_string();
        if text.contains("Allow") {
            return true;
        }
    }
    false
}

#[cfg(target_os = "windows")]
fn get_rotation_lock_status() -> (bool, bool) {
    let output = std::process::Command::new("reg")
        .args(&[
            "query",
            "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AutoRotation",
            "/v",
            "Enable",
        ])
        .creation_flags(0x08000000)
        .output();

    if let Ok(out) = output {
        if out.status.success() {
            let text = String::from_utf8_lossy(&out.stdout).to_string();
            let is_locked = text.contains("0x0");
            return (true, is_locked);
        }
    }
    (false, false)
}

#[derive(Clone, serde::Serialize)]
struct SystemStatusPayload {
    volume: f32,
    playback_muted: bool,
    brightness: u32,
    battery_level: u32,
    is_charging: bool,
    wifi_connected: bool,
    wifi_name: String,
    wifi_adapter_on: bool,
    bluetooth_connected: bool,
    bluetooth_device: String,
    vpn_connected: bool,
    cpu_usage: u32,
    ram_usage: u32,
    download_speed: u64,
    upload_speed: u64,
    battery_saver: bool,
    airplane_mode: bool,
    mobile_hotspot: bool,
    night_light: bool,
    dnd_active: bool,
    nearby_sharing_active: bool,
    camera_active: bool,
    rotation_lock_active: bool,
    rotation_lock_supported: bool,
    microphone_muted: bool,
    bluetooth_adapter_on: bool,
}

// Silent Startup Launcher Setup
#[cfg(target_os = "windows")]
fn setup_startup() {
    if let Ok(appdata) = std::env::var("APPDATA") {
        let startup_path = format!(
            "{}\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\Pisland.vbs",
            appdata
        );
        if let Ok(current_exe) = std::env::current_exe() {
            let exe_path = current_exe.to_string_lossy().to_string();
            let vbs_content = format!(
                "Set WshShell = CreateObject(\"WScript.Shell\")\nWshShell.Run \"\"\"{}\"\"\", 0, False",
                exe_path
            );
            let _ = std::fs::write(startup_path, vbs_content);
        }
    }
}

#[tauri::command]
fn set_volume(volume: f32) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    unsafe {
        set_system_volume(0, volume / 100.0).map_err(|e| format!("Failed to set volume: {}", e))
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = volume;
        Ok(())
    }
}

#[tauri::command]
fn set_brightness(brightness: u32) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::thread::spawn(move || {
            let cmd = format!(
                "$monitor = Get-CimInstance -Namespace root/WMI -ClassName WmiMonitorBrightnessMethods; \
                 Invoke-CimMethod -InputObject $monitor -MethodName WmiSetBrightness -Arguments @{{ Timeout = 0; Brightness = {} }}",
                brightness
            );
            let _ = std::process::Command::new("powershell")
                .args(&["-NoProfile", "-Command", &cmd])
                .creation_flags(0x08000000)
                .output();
        });
        Ok(())
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = brightness;
        Ok(())
    }
}

#[tauri::command]
fn set_wifi_state(active: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let cmd = if active {
            "Get-NetAdapter | Where-Object { $_.PhysicalMediaType -eq 'Native 802.11' -or $_.Name -like '*Wi-Fi*' } | Enable-NetAdapter -Confirm:$false"
        } else {
            "Get-NetAdapter | Where-Object { $_.PhysicalMediaType -eq 'Native 802.11' -or $_.Name -like '*Wi-Fi*' } | Disable-NetAdapter -Confirm:$false"
        };
        let _ = std::process::Command::new("powershell")
            .args(&["-NoProfile", "-Command", cmd])
            .creation_flags(0x08000000)
            .output();
    }
    let _ = active;
    Ok(())
}

#[tauri::command]
fn set_bluetooth_state(active: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let cmd = if active {
            "Get-PnpDevice -Class Bluetooth | Where-Object { $_.FriendlyName -like '*Adapter*' -or $_.FriendlyName -like '*Radio*' -or ($_.InstanceId -like 'USB\\*' -and $_.FriendlyName -notlike '*Enumerator*' -and $_.FriendlyName -notlike '*Transport*' -and $_.FriendlyName -notlike '*Service*') } | Enable-PnpDevice -Confirm:$false"
        } else {
            "Get-PnpDevice -Class Bluetooth | Where-Object { $_.FriendlyName -like '*Adapter*' -or $_.FriendlyName -like '*Radio*' -or ($_.InstanceId -like 'USB\\*' -and $_.FriendlyName -notlike '*Enumerator*' -and $_.FriendlyName -notlike '*Transport*' -and $_.FriendlyName -notlike '*Service*') } | Disable-PnpDevice -Confirm:$false"
        };
        let _ = std::process::Command::new("powershell")
            .args(&["-NoProfile", "-Command", cmd])
            .creation_flags(0x08000000)
            .output();
    }
    let _ = active;
    Ok(())
}

#[tauri::command]
fn set_airplane_mode(active: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let val = if active { 1 } else { 0 };
        let _ = std::process::Command::new("reg")
            .args(&[
                "add",
                "HKLM\\SYSTEM\\CurrentControlSet\\Control\\RadioManagement\\SystemRadioState",
                "/ve",
                "/t",
                "REG_DWORD",
                "/d",
                &val.to_string(),
                "/f",
            ])
            .creation_flags(0x08000000)
            .output();
    }
    let _ = active;
    Ok(())
}

#[tauri::command]
fn set_mobile_hotspot(active: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let cmd = if active { "start" } else { "stop" };
        let _ = std::process::Command::new("net")
            .args(&[cmd, "icssvc"])
            .creation_flags(0x08000000)
            .output();
    }
    let _ = active;
    Ok(())
}

#[tauri::command]
fn set_dnd_state(active: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let val = if active { 1 } else { 0 };
        let _ = std::process::Command::new("reg")
            .args(&[
                "add",
                "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\QuietHours",
                "/v",
                "QuietHoursServiceState",
                "/t",
                "REG_DWORD",
                "/d",
                &val.to_string(),
                "/f",
            ])
            .creation_flags(0x08000000)
            .output();
    }
    let _ = active;
    Ok(())
}

#[tauri::command]
fn set_nearby_sharing(active: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let val = if active { 2 } else { 0 };
        let _ = std::process::Command::new("reg")
            .args(&[
                "add",
                "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\CDP",
                "/v",
                "NearShareChannelUserAuthzPolicy",
                "/t",
                "REG_DWORD",
                "/d",
                &val.to_string(),
                "/f",
            ])
            .creation_flags(0x08000000)
            .output();
    }
    let _ = active;
    Ok(())
}

#[tauri::command]
fn set_camera_state(active: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let val = if active { "Allow" } else { "Deny" };
        let _ = std::process::Command::new("reg")
            .args(&[
                "add",
                "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\webcam",
                "/v",
                "Value",
                "/t",
                "REG_SZ",
                "/d",
                val,
                "/f"
            ])
            .creation_flags(0x08000000)
            .output();
    }
    let _ = active;
    Ok(())
}

#[tauri::command]
fn set_rotation_lock(active: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let val = if active { 0 } else { 1 };
        let _ = std::process::Command::new("reg")
            .args(&[
                "add",
                "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AutoRotation",
                "/v",
                "Enable",
                "/t",
                "REG_DWORD",
                "/d",
                &val.to_string(),
                "/f",
            ])
            .creation_flags(0x08000000)
            .output();
    }
    let _ = active;
    Ok(())
}

#[tauri::command]
fn get_microphone_mute() -> Result<bool, String> {
    #[cfg(target_os = "windows")]
    unsafe {
        get_system_mute(1).map_err(|e| format!("Failed to get mic mute: {}", e))
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(false)
    }
}

#[tauri::command]
fn set_microphone_mute(mute: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    unsafe {
        set_system_mute(1, mute).map_err(|e| format!("Failed to set mic mute: {}", e))
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = mute;
        Ok(())
    }
}

#[tauri::command]
fn get_playback_mute() -> Result<bool, String> {
    #[cfg(target_os = "windows")]
    unsafe {
        get_system_mute(0).map_err(|e| format!("Failed to get master mute: {}", e))
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(false)
    }
}

#[tauri::command]
fn set_playback_mute(mute: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    unsafe {
        set_system_mute(0, mute).map_err(|e| format!("Failed to set master mute: {}", e))
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = mute;
        Ok(())
    }
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct WifiNetworkItem {
    pub ssid: String,
    pub signal_strength: u32,
    pub security_type: String,
    pub is_secured: bool,
    pub is_connected: bool,
    pub is_saved: bool,
}

#[tauri::command]
fn scan_wifi_networks() -> Result<Vec<WifiNetworkItem>, String> {
    #[cfg(target_os = "windows")]
    {
        let (_adapter_on, connected, active_ssid) = get_wifi_status();

        let mut saved_profiles: std::collections::HashSet<String> =
            std::collections::HashSet::new();
        let prof_output = std::process::Command::new("netsh")
            .args(&["wlan", "show", "profiles"])
            .creation_flags(0x08000000)
            .output();
        if let Ok(out) = prof_output {
            let text = String::from_utf8_lossy(&out.stdout);
            for line in text.lines() {
                let line = line.trim();
                if line.contains(":") {
                    if let Some(pos) = line.find(':') {
                        let name = line[pos + 1..].trim().to_string();
                        if !name.is_empty() {
                            saved_profiles.insert(name);
                        }
                    }
                }
            }
        }

        let net_output = std::process::Command::new("netsh")
            .args(&["wlan", "show", "networks", "mode=bssid"])
            .creation_flags(0x08000000)
            .output();

        let mut networks: Vec<WifiNetworkItem> = Vec::new();
        let mut seen_ssids: std::collections::HashSet<String> = std::collections::HashSet::new();

        if let Ok(out) = net_output {
            let text = String::from_utf8_lossy(&out.stdout);
            let mut current_ssid = String::new();
            let mut current_auth = String::new();
            let mut current_signal: u32 = 0;

            for line in text.lines() {
                let trimmed = line.trim();
                if trimmed.starts_with("SSID") && !trimmed.starts_with("SSID %") {
                    if !current_ssid.is_empty() && !seen_ssids.contains(&current_ssid) {
                        seen_ssids.insert(current_ssid.clone());
                        let is_conn = connected && current_ssid == active_ssid;
                        let is_saved = saved_profiles.contains(&current_ssid);
                        let is_sec = !current_auth.to_lowercase().contains("open");
                        networks.push(WifiNetworkItem {
                            ssid: current_ssid.clone(),
                            signal_strength: current_signal,
                            security_type: current_auth.clone(),
                            is_secured: is_sec,
                            is_connected: is_conn,
                            is_saved,
                        });
                    }
                    current_ssid = String::new();
                    current_auth = String::new();
                    current_signal = 0;

                    if let Some(pos) = trimmed.find(':') {
                        current_ssid = trimmed[pos + 1..].trim().to_string();
                    }
                } else if trimmed.starts_with("Authentication") {
                    if let Some(pos) = trimmed.find(':') {
                        current_auth = trimmed[pos + 1..].trim().to_string();
                    }
                } else if trimmed.starts_with("Signal") {
                    if let Some(pos) = trimmed.find(':') {
                        let sig_str = trimmed[pos + 1..].replace('%', "").trim().to_string();
                        if let Ok(sig_val) = sig_str.parse::<u32>() {
                            if sig_val > current_signal {
                                current_signal = sig_val;
                            }
                        }
                    }
                }
            }
            if !current_ssid.is_empty() && !seen_ssids.contains(&current_ssid) {
                seen_ssids.insert(current_ssid.clone());
                let is_conn = connected && current_ssid == active_ssid;
                let is_saved = saved_profiles.contains(&current_ssid);
                let is_sec = !current_auth.to_lowercase().contains("open");
                networks.push(WifiNetworkItem {
                    ssid: current_ssid.clone(),
                    signal_strength: current_signal,
                    security_type: current_auth,
                    is_secured: is_sec,
                    is_connected: is_conn,
                    is_saved,
                });
            }
        }

        if connected && !active_ssid.is_empty() && !seen_ssids.contains(&active_ssid) {
            networks.insert(
                0,
                WifiNetworkItem {
                    ssid: active_ssid.clone(),
                    signal_strength: 90,
                    security_type: "WPA2-Personal".to_string(),
                    is_secured: true,
                    is_connected: true,
                    is_saved: true,
                },
            );
        }

        networks.sort_by(|a, b| {
            if a.is_connected != b.is_connected {
                b.is_connected.cmp(&a.is_connected)
            } else if a.is_saved != b.is_saved {
                b.is_saved.cmp(&a.is_saved)
            } else {
                b.signal_strength.cmp(&a.signal_strength)
            }
        });

        Ok(networks)
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(Vec::new())
    }
}

#[tauri::command]
fn connect_wifi(ssid: String, password: Option<String>) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        if let Some(pass) = password {
            if !pass.is_empty() {
                let xml = format!(
                    r#"<?xml version="1.0"?>
<WLANProfile xmlns="http://www.microsoft.com/networking/WLAN/profile/v1">
    <name>{}</name>
    <SSIDConfig>
        <SSID>
            <name>{}</name>
        </SSID>
    </SSIDConfig>
    <connectionType>ESS</connectionType>
    <connectionMode>manual</connectionMode>
    <MSM>
        <security>
            <authEncryption>
                <authentication>WPA2PSK</authentication>
                <encryption>AES</encryption>
                <useOneX>false</useOneX>
            </authEncryption>
            <sharedKey>
                <keyType>passPhrase</keyType>
                <protected>false</protected>
                <keyMaterial>{}</keyMaterial>
            </sharedKey>
        </security>
    </MSM>
</WLANProfile>"#,
                    ssid, ssid, pass
                );

                let temp_dir = std::env::temp_dir();
                let temp_path = temp_dir.join(format!("pisland_wifi_{}.xml", std::process::id()));

                if std::fs::write(&temp_path, xml).is_ok() {
                    let _ = std::process::Command::new("netsh")
                        .args(&[
                            "wlan",
                            "add",
                            "profile",
                            &format!("filename={}", temp_path.display()),
                            "user=current",
                        ])
                        .creation_flags(0x08000000)
                        .output();

                    let _ = std::fs::remove_file(temp_path);
                }
            }
        }

        let output = std::process::Command::new("netsh")
            .args(&["wlan", "connect", &format!("name={}", ssid)])
            .creation_flags(0x08000000)
            .output();

        if let Ok(out) = output {
            let res_text = String::from_utf8_lossy(&out.stdout);
            if res_text.contains("Connection request was completed successfully")
                || res_text.contains("completed successfully")
            {
                std::thread::sleep(std::time::Duration::from_millis(1500));
                let (_adapter_on, conn, active_ssid) = get_wifi_status();
                if conn && active_ssid == ssid {
                    return Ok("Connected".to_string());
                }
            }
        }

        std::thread::sleep(std::time::Duration::from_millis(1000));
        let (_adapter_on, conn, active_ssid) = get_wifi_status();
        if conn && active_ssid == ssid {
            Ok("Connected".to_string())
        } else {
            Err(
                "Failed to connect to Wi-Fi network. Please verify network credentials."
                    .to_string(),
            )
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = (ssid, password);
        Ok("Connected".to_string())
    }
}

#[tauri::command]
fn disconnect_wifi(ssid: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let _ = ssid;
        let _ = std::process::Command::new("netsh")
            .args(&["wlan", "disconnect"])
            .creation_flags(0x08000000)
            .output();
        Ok(())
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = ssid;
        Ok(())
    }
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct BluetoothDeviceItem {
    pub id: String,
    pub name: String,
    pub device_type: String,
    pub is_connected: bool,
    pub is_paired: bool,
}

#[tauri::command]
fn scan_bluetooth_devices() -> Result<Vec<BluetoothDeviceItem>, String> {
    #[cfg(target_os = "windows")]
    {
        // Get paired devices from BTHENUM\DEV_* entries
        // Get connected devices from AudioEndpoint MMDEVAPI (name in parentheses)
        let script = r#"
$audioEps = Get-PnpDevice -Class AudioEndpoint -Status OK -ErrorAction SilentlyContinue
$connectedNames = @{}
foreach ($ep in $audioEps) {
    $fn = $ep.FriendlyName
    if ($fn -match '\((.+)\)$') {
        $devName = $matches[1]
        if ($devName -notlike '*Realtek*' -and $devName -notlike '*VB-Audio*' -and
            $devName -notlike '*CABLE*' -and $devName -notlike '*HD Audio*' -and
            $devName -notlike '*USB*' -and $devName -notlike '*Line*') {
            # Strip profile suffix like " Hands-Free" to get base device name
            $baseName = $devName -replace ' Hands-Free.*$',''
            $connectedNames[$baseName] = $true
            $connectedNames[$devName] = $true
        }
    }
}
$devices = Get-PnpDevice -Class Bluetooth -ErrorAction SilentlyContinue | Where-Object {
    $_.FriendlyName -and ($_.InstanceId -like 'BTHENUM\DEV_*' -or $_.InstanceId -like 'BTHLE\DEV_*')
} | ForEach-Object {
    $name = $_.FriendlyName
    $isConn = $false
    foreach ($k in $connectedNames.Keys) {
        if ($name -like "*$k*" -or $k -like "*$name*") {
            $isConn = $true; break
        }
    }
    [PSCustomObject]@{
        FriendlyName = $name
        InstanceId = $_.InstanceId
        IsConnected = $isConn
    }
}
$devices | ConvertTo-Json -Compress
        "#;

        let output = std::process::Command::new("powershell")
            .args(&["-NoProfile", "-Command", script])
            .creation_flags(0x08000000)
            .output();

        let mut devices: Vec<BluetoothDeviceItem> = Vec::new();
        let mut seen_names: std::collections::HashSet<String> = std::collections::HashSet::new();

        if let Ok(out) = output {
            let text = String::from_utf8_lossy(&out.stdout);
            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&text) {
                let items = if parsed.is_array() {
                    parsed.as_array().cloned().unwrap_or_default()
                } else if parsed.is_object() {
                    vec![parsed]
                } else {
                    vec![]
                };

                for item in items {
                    let name = item["FriendlyName"]
                        .as_str()
                        .unwrap_or("")
                        .trim()
                        .to_string();
                    let is_conn = item["IsConnected"].as_bool().unwrap_or(false);
                    let instance_id = item["InstanceId"].as_str().unwrap_or("").trim().to_string();

                    if !name.is_empty() && !seen_names.contains(&name) {
                        seen_names.insert(name.clone());

                        let name_lower = name.to_lowercase();
                        let dev_type = if name_lower.contains("head")
                            || name_lower.contains("bud")
                            || name_lower.contains("audio")
                            || name_lower.contains("boult")
                            || name_lower.contains("tws")
                            || name_lower.contains("troke")
                            || name_lower.contains("realme")
                            || name_lower.contains("oneplus")
                            || name_lower.contains("nord")
                        {
                            "Audio"
                        } else if name_lower.contains("phone")
                            || name_lower.contains("iphone")
                            || name_lower.contains("galaxy")
                        {
                            "Phone"
                        } else if name_lower.contains("speak")
                            || name_lower.contains("hall")
                        {
                            "Speaker"
                        } else if name_lower.contains("mouse")
                            || name_lower.contains("key")
                        {
                            "Input"
                        } else {
                            "Generic"
                        };

                        devices.push(BluetoothDeviceItem {
                            id: instance_id,
                            name,
                            device_type: dev_type.to_string(),
                            is_connected: is_conn,
                            is_paired: true,
                        });
                    }
                }
            }
        }

        devices.sort_by(|a, b| b.is_connected.cmp(&a.is_connected));
        Ok(devices)
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(Vec::new())
    }
}

#[tauri::command]
fn connect_bluetooth_device(id: String, name: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        // Use the BT address from the InstanceId (BTHENUM\DEV_<ADDR>) to reconnect
        // via DevCon / PnP re-enable. Note: this re-enables the device node so Windows
        // will attempt to reconnect. For audio devices this triggers HFP/A2DP reconnect.
        let escaped_id = id.replace('\'', "''");
        let escaped_name = name.replace('\'', "''");
        let cmd = format!(
            "$dev = Get-PnpDevice | Where-Object {{ $_.InstanceId -eq '{escaped_id}' }}; \
             if ($dev) {{ Enable-PnpDevice -InstanceId $dev.InstanceId -Confirm:$false -ErrorAction SilentlyContinue }} \
             else {{ Get-PnpDevice -Class Bluetooth | Where-Object {{ $_.FriendlyName -eq '{escaped_name}' }} | Enable-PnpDevice -Confirm:$false -ErrorAction SilentlyContinue }}",
             escaped_id = escaped_id,
             escaped_name = escaped_name
        );
        let output = std::process::Command::new("powershell")
            .args(&["-NoProfile", "-Command", &cmd])
            .creation_flags(0x08000000)
            .output();

        if let Ok(out) = output {
            if out.status.success() {
                // Give Windows a moment to establish connection
                std::thread::sleep(std::time::Duration::from_millis(1500));
                return Ok("Connected".to_string());
            }
            let stderr = String::from_utf8_lossy(&out.stderr);
            if !stderr.trim().is_empty() {
                return Err(format!("BT connect error: {}", stderr.trim()));
            }
        }
        Ok("Connect attempted".to_string())
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = (id, name);
        Ok("Connected".to_string())
    }
}

#[tauri::command]
fn disconnect_bluetooth_device(id: String, name: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        // Disable the BT device node to force disconnect
        let escaped_id = id.replace('\'', "''");
        let escaped_name = name.replace('\'', "''");
        let cmd = format!(
            "$dev = Get-PnpDevice | Where-Object {{ $_.InstanceId -eq '{escaped_id}' }}; \
             if ($dev) {{ Disable-PnpDevice -InstanceId $dev.InstanceId -Confirm:$false -ErrorAction SilentlyContinue }} \
             else {{ Get-PnpDevice -Class Bluetooth | Where-Object {{ $_.FriendlyName -eq '{escaped_name}' }} | Disable-PnpDevice -Confirm:$false -ErrorAction SilentlyContinue }}",
             escaped_id = escaped_id,
             escaped_name = escaped_name
        );
        let _ = std::process::Command::new("powershell")
            .args(&["-NoProfile", "-Command", &cmd])
            .creation_flags(0x08000000)
            .output();
        Ok(())
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = (id, name);
        Ok(())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "windows")]
    setup_startup();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            // Fullscreen window detector loop
            let window_fs = window.clone();
            std::thread::spawn(move || {
                loop {
                    std::thread::sleep(std::time::Duration::from_millis(800));

                    #[cfg(target_os = "windows")]
                    {
                        unsafe {
                            let fg = GetForegroundWindow();
                            if fg != 0 && fg != GetDesktopWindow() && fg != GetShellWindow() {
                                let mut rect = RECT {
                                    left: 0,
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                };
                                if GetWindowRect(fg, &mut rect) != 0 {
                                    let cx = GetSystemMetrics(0); // SM_CXSCREEN
                                    let cy = GetSystemMetrics(1); // SM_CYSCREEN

                                    let is_fullscreen = rect.left <= 0
                                        && rect.top <= 0
                                        && rect.right >= cx
                                        && rect.bottom >= cy;

                                    if is_fullscreen {
                                        let _ = window_fs.hide();
                                    } else {
                                        if let Ok(false) = window_fs.is_visible() {
                                            let _ = window_fs.show();
                                        }
                                    }
                                }
                            } else {
                                if let Ok(false) = window_fs.is_visible() {
                                    let _ = window_fs.show();
                                }
                            }
                        }
                    }
                }
            });

            // ----------------------------------------------------------------
            // Fast polling thread: Volume, Mute, Battery, CPU, RAM (~1.5s)
            // ----------------------------------------------------------------
            let window_fast = window.clone();
            // Shared slow-poll data protected by Mutex
            let slow_data = std::sync::Arc::new(std::sync::Mutex::new((
                false,             // wifi_conn
                String::new(),     // wifi_name
                false,             // bt_conn
                String::new(),     // bt_dev
                false,             // vpn_conn
                0u64,              // net_rx
                0u64,              // net_tx
                false,             // airplane_mode
                false,             // mobile_hotspot
                false,             // dnd_active
                false,             // nearby_sharing
                false,             // camera_active
                false,             // rot_supported
                false,             // rot_locked
                false,             // night_light
                true,              // bt_adapter_on
                true,              // wifi_adapter_on
            )));
            let slow_data_writer = slow_data.clone();

            // ----------------------------------------------------------------
            // Slow polling thread: WiFi, BT, VPN, misc (~5s)
            // ----------------------------------------------------------------
            std::thread::spawn(move || loop {
                #[cfg(target_os = "windows")]
                {
                    let (wifi_on, wifi_conn, wifi_name) = get_wifi_status();
                    let (bt_conn, bt_dev) = get_bluetooth_status();
                    let bt_on = get_bluetooth_adapter_on();
                    let vpn_conn = get_vpn_status();
                    let (net_rx, net_tx) = get_network_speeds();
                    let airplane_mode = get_airplane_mode_status();
                    let mobile_hotspot = get_mobile_hotspot_status();
                    let dnd_active = get_dnd_status();
                    let nearby_sharing_active = get_nearby_sharing_status();
                    let camera_active = get_camera_status();
                    let (rot_supported, rot_locked) = get_rotation_lock_status();
                    let night_light = get_night_light_status();

                    if let Ok(mut d) = slow_data_writer.lock() {
                        *d = (
                            wifi_conn, wifi_name,
                            bt_conn, bt_dev,
                            vpn_conn,
                            net_rx, net_tx,
                            airplane_mode, mobile_hotspot,
                            dnd_active, nearby_sharing_active,
                            camera_active,
                            rot_supported, rot_locked,
                            night_light,
                            bt_on,
                            wifi_on,
                        );
                    }
                }
                std::thread::sleep(std::time::Duration::from_millis(5000));
            });

            // Fast metrics polling thread
            let window_metrics = window_fast;
            std::thread::spawn(move || loop {
                #[cfg(target_os = "windows")]
                {
                    let vol = unsafe { get_system_volume(0).unwrap_or(0.5) * 100.0 };
                    let bri = get_brightness();

                    let mut power = SYSTEM_POWER_STATUS {
                        ac_line_status: 255,
                        battery_flag: 255,
                        battery_life_percent: 255,
                        system_status_flag: 0,
                        battery_life_time: 0xFFFFFFFF,
                        battery_full_life_time: 0xFFFFFFFF,
                    };
                    let (battery_level, is_charging) = unsafe {
                        if GetSystemPowerStatus(&mut power) != 0 {
                            let pct = if power.battery_life_percent != 255 {
                                power.battery_life_percent as u32
                            } else {
                                100
                            };
                            let chg = power.ac_line_status == 1;
                            (pct, chg)
                        } else {
                            (100, false)
                        }
                    };

                    let cpu = get_cpu_usage();

                    let mut mem = MEMORYSTATUSEX {
                        dw_length: std::mem::size_of::<MEMORYSTATUSEX>() as u32,
                        dw_memory_load: 0,
                        ull_total_phys: 0,
                        ull_avail_phys: 0,
                        ull_total_page_file: 0,
                        ull_avail_page_file: 0,
                        ull_total_virtual: 0,
                        ull_avail_virtual: 0,
                        ull_avail_extended_virtual: 0,
                    };
                    let ram = unsafe {
                        if GlobalMemoryStatusEx(&mut mem) != 0 {
                            mem.dw_memory_load
                        } else {
                            0
                        }
                    };

                    let mic_muted = unsafe { get_system_mute(1).unwrap_or(false) };
                    let pb_muted = unsafe { get_system_mute(0).unwrap_or(false) };

                    // Read latest slow-poll data
                    let (
                        wifi_conn, wifi_name, bt_conn, bt_dev,
                        vpn_conn, net_rx, net_tx,
                        airplane_mode, mobile_hotspot,
                        dnd_active, nearby_sharing_active,
                        camera_active, rot_supported, rot_locked,
                        night_light, bt_on, wifi_on
                    ) = {
                        if let Ok(d) = slow_data.lock() {
                            d.clone()
                        } else {
                            (false, String::new(), false, String::new(),
                             false, 0u64, 0u64,
                             false, false, false, false, false, false, false, false, true, true)
                        }
                    };

                    let payload = SystemStatusPayload {
                        volume: vol,
                        playback_muted: pb_muted,
                        brightness: bri,
                        battery_level,
                        is_charging,
                        wifi_connected: wifi_conn,
                        wifi_name,
                        wifi_adapter_on: wifi_on,
                        bluetooth_connected: bt_conn,
                        bluetooth_device: bt_dev,
                        vpn_connected: vpn_conn,
                        cpu_usage: cpu,
                        ram_usage: ram,
                        download_speed: net_rx,
                        upload_speed: net_tx,
                        battery_saver: power.system_status_flag == 1,
                        airplane_mode,
                        mobile_hotspot,
                        night_light,
                        dnd_active,
                        nearby_sharing_active,
                        camera_active,
                        rotation_lock_active: rot_locked,
                        rotation_lock_supported: rot_supported,
                        microphone_muted: mic_muted,
                        bluetooth_adapter_on: bt_on,
                    };

                    let _ = window_metrics.emit("system-status", payload);
                }
                std::thread::sleep(std::time::Duration::from_millis(1500));
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            set_volume,
            set_brightness,
            set_wifi_state,
            set_bluetooth_state,
            set_airplane_mode,
            set_mobile_hotspot,
            set_dnd_state,
            set_nearby_sharing,
            set_camera_state,
            set_rotation_lock,
            get_microphone_mute,
            set_microphone_mute,
            get_playback_mute,
            set_playback_mute,
            scan_wifi_networks,
            connect_wifi,
            disconnect_wifi,
            scan_bluetooth_devices,
            connect_bluetooth_device,
            disconnect_bluetooth_device
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
