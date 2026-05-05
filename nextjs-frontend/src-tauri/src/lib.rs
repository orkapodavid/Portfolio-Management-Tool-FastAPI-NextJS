use std::{
    env, io,
    path::PathBuf,
    sync::Mutex,
    thread,
    time::{Duration, Instant},
};

use reqwest::blocking::Client;
use serde::Serialize;
use tauri::{App, AppHandle, Manager, RunEvent, Runtime, State};
use tauri_plugin_shell::{
    process::{CommandChild, CommandEvent},
    ShellExt,
};

const DEFAULT_API_BASE_URL: &str = "http://127.0.0.1:18475";
const DEFAULT_SIDECAR_HOST: &str = "127.0.0.1";
const DEFAULT_SIDECAR_PORT: u16 = 18475;
const DEFAULT_HEALTH_TIMEOUT_MS: u64 = 120_000;
const HEALTH_PATH: &str = "/api/health";
const HEALTH_POLL_INTERVAL: Duration = Duration::from_millis(250);
const HEALTH_REQUEST_TIMEOUT: Duration = Duration::from_secs(1);
const DEFAULT_CORS_ORIGINS: &str = r#"["tauri://localhost","http://tauri.localhost","http://localhost:3000","http://127.0.0.1:3000"]"#;
const SIDECAR_BINARY_NAME: &str = "pmt-backend";
const SIDECAR_WORKDIR_ENV: &str = "PMT_SIDECAR_WORKDIR";
const SIDECAR_PORT_ENV: &str = "PMT_SIDECAR_PORT";
const SIDECAR_HEALTH_TIMEOUT_ENV: &str = "PMT_SIDECAR_HEALTH_TIMEOUT_MS";

#[derive(Debug, Default)]
struct SidecarState {
    runtime: Mutex<SidecarRuntime>,
}

#[derive(Debug)]
struct SidecarRuntime {
    api_base_url: String,
    child: Option<CommandChild>,
}

impl Default for SidecarRuntime {
    fn default() -> Self {
        Self {
            api_base_url: DEFAULT_API_BASE_URL.to_string(),
            child: None,
        }
    }
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeConfig {
    api_base_url: String,
    desktop_target: bool,
}

#[tauri::command]
fn get_runtime_config(state: State<'_, SidecarState>) -> RuntimeConfig {
    let api_base_url = state
        .runtime
        .lock()
        .map(|runtime| runtime.api_base_url.clone())
        .unwrap_or_else(|_| DEFAULT_API_BASE_URL.to_string());

    RuntimeConfig {
        api_base_url,
        desktop_target: true,
    }
}

pub fn run() {
    let app = tauri::Builder::default()
        .manage(SidecarState::default())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_runtime_config])
        .setup(|app| {
            start_sidecar(app)?;
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle, event| {
        if matches!(event, RunEvent::Exit) {
            stop_sidecar(app_handle);
        }
    });
}

fn start_sidecar<R: Runtime>(app: &mut App<R>) -> Result<(), Box<dyn std::error::Error>> {
    let port = resolve_sidecar_port()?;
    let api_base_url = format!("http://{DEFAULT_SIDECAR_HOST}:{port}");
    let health_url = format!("{api_base_url}{HEALTH_PATH}");
    let sidecar_command = build_sidecar_command(app.handle(), port)?;
    let (mut events, child) = sidecar_command.spawn()?;

    tauri::async_runtime::spawn(async move {
        while let Some(event) = events.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    log::info!("sidecar stdout: {}", String::from_utf8_lossy(&line).trim());
                }
                CommandEvent::Stderr(line) => {
                    log::warn!("sidecar stderr: {}", String::from_utf8_lossy(&line).trim());
                }
                CommandEvent::Error(error) => {
                    log::error!("sidecar event error: {error}");
                }
                CommandEvent::Terminated(payload) => {
                    log::warn!(
                        "sidecar terminated with code {:?} and signal {:?}",
                        payload.code,
                        payload.signal
                    );
                }
                _ => {}
            }
        }
    });

    if let Err(error) = wait_for_health(&health_url, resolve_health_timeout()?) {
        let _ = child.kill();
        return Err(error);
    }

    let state = app.state::<SidecarState>();
    let mut runtime = state.runtime.lock().expect("sidecar state lock poisoned");
    runtime.api_base_url = api_base_url;
    runtime.child = Some(child);

    Ok(())
}

fn stop_sidecar<R: Runtime>(app_handle: &AppHandle<R>) {
    let state = app_handle.state::<SidecarState>();
    let mut runtime = state.runtime.lock().expect("sidecar state lock poisoned");

    if let Some(child) = runtime.child.take() {
        let _ = child.kill();
    }
}

fn build_sidecar_command<R: Runtime>(
    app_handle: &AppHandle<R>,
    port: u16,
) -> Result<tauri_plugin_shell::process::Command, Box<dyn std::error::Error>> {
    let mut command = app_handle
        .shell()
        .sidecar(SIDECAR_BINARY_NAME)?
        .env("PORT", port.to_string());

    if env::var_os("CORS_ORIGINS").is_none() {
        command = command.env("CORS_ORIGINS", DEFAULT_CORS_ORIGINS);
    }

    if let Some(workdir) = env::var_os(SIDECAR_WORKDIR_ENV).map(PathBuf::from) {
        command = command.current_dir(workdir);
    }

    Ok(command)
}

fn resolve_sidecar_port() -> Result<u16, Box<dyn std::error::Error>> {
    match env::var(SIDECAR_PORT_ENV) {
        Ok(raw_port) => raw_port.parse::<u16>().map_err(|error| {
            io::Error::other(format!(
                "failed to parse {SIDECAR_PORT_ENV}={raw_port:?}: {error}"
            ))
            .into()
        }),
        Err(env::VarError::NotPresent) => Ok(DEFAULT_SIDECAR_PORT),
        Err(error) => {
            Err(io::Error::other(format!("failed to read {SIDECAR_PORT_ENV}: {error}")).into())
        }
    }
}

fn resolve_health_timeout() -> Result<Duration, Box<dyn std::error::Error>> {
    match env::var(SIDECAR_HEALTH_TIMEOUT_ENV) {
        Ok(raw_timeout_ms) => raw_timeout_ms
            .parse::<u64>()
            .map(Duration::from_millis)
            .map_err(|error| {
                io::Error::other(format!(
                    "failed to parse {SIDECAR_HEALTH_TIMEOUT_ENV}={raw_timeout_ms:?}: {error}"
                ))
                .into()
            }),
        Err(env::VarError::NotPresent) => Ok(Duration::from_millis(DEFAULT_HEALTH_TIMEOUT_MS)),
        Err(error) => Err(io::Error::other(format!(
            "failed to read {SIDECAR_HEALTH_TIMEOUT_ENV}: {error}"
        ))
        .into()),
    }
}

fn wait_for_health(health_url: &str, timeout: Duration) -> Result<(), Box<dyn std::error::Error>> {
    let deadline = Instant::now() + timeout;
    let client = Client::builder().timeout(HEALTH_REQUEST_TIMEOUT).build()?;
    let mut last_error = None;

    while Instant::now() < deadline {
        match client.get(health_url).send() {
            Ok(response) if response.status().is_success() => return Ok(()),
            Ok(response) => {
                last_error = Some(format!(
                    "health endpoint returned status {}",
                    response.status()
                ));
            }
            Err(error) => {
                last_error = Some(error.to_string());
            }
        }

        thread::sleep(HEALTH_POLL_INTERVAL);
    }

    let error_message = last_error.unwrap_or_else(|| "no response received".to_string());
    Err(io::Error::other(format!(
        "timed out waiting for sidecar health at {health_url}: {error_message}"
    ))
    .into())
}
