<#
.SYNOPSIS
    Safe multi-service shutdown script for AdhikarAI.
.DESCRIPTION
    Safely terminates ONLY AdhikarAI backend and microservice processes that were
    explicitly launched by start-all.ps1 and recorded in scripts/.adhikar-services.json.
    NEVER terminates manually started processes or services running on ports without
    explicit tracking confirmation.
    NEVER uses blanket process termination (e.g., killall python/node).
#>

[CmdletBinding()]
param(
    [switch]$Force
)

$ErrorActionPreference = "Continue"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = (Resolve-Path (Join-Path $scriptDir "..")).Path
$pidFile = Join-Path $scriptDir ".adhikar-services.json"

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  AdhikarAI - Safe Multi-Service Process Stopper" -ForegroundColor Cyan
Write-Host "  Project Root: $projectRoot" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

# 1. Strictly verify the existence of the tracking file
if (-not (Test-Path $pidFile)) {
    Write-Host "No script-managed PID tracking file found ($pidFile)." -ForegroundColor Yellow
    Write-Host "SAFETY POLICY: No services were launched by start-all.ps1 in this session." -ForegroundColor Yellow
    Write-Host "Any services running manually in terminals will be left running undisturbed." -ForegroundColor Green
    Write-Host "Exiting safely without stopping any processes." -ForegroundColor Green
    return
}

# 2. Parse tracked services launched by start-all.ps1
$trackedData = @{}
try {
    $raw = Get-Content -Path $pidFile -Raw | ConvertFrom-Json
    foreach ($prop in $raw.PSObject.Properties) {
        $trackedData[$prop.Name] = $prop.Value
    }
} catch {
    Write-Warning "Could not parse PID file: $_"
    return
}

if ($trackedData.Count -eq 0) {
    Write-Host "Tracking file contains 0 script-managed services. Nothing to stop." -ForegroundColor Green
    Remove-Item -Path $pidFile -Force -ErrorAction SilentlyContinue
    return
}

$stoppedCount = 0
$skippedCount = 0
$remainingTracking = @{}

# 3. Iterate ONLY through services explicitly recorded by start-all.ps1
foreach ($svcKey in $trackedData.Keys) {
    $entry = $trackedData[$svcKey]
    Write-Host ""
    Write-Host "--> Checking script-managed service: $($entry.Service) (Port $($entry.Port), PID $($entry.PID))..." -ForegroundColor Yellow

    if (-not $entry.StartedByScript) {
        Write-Host "    [Port $($entry.Port)] SAFETY SKIPPED: Entry not marked as StartedByScript. Leaving process untouched." -ForegroundColor Yellow
        $skippedCount++
        continue
    }

    $pidToInspect = $entry.PID

    # Check if process is still running
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $pidToInspect" -ErrorAction SilentlyContinue

    if (-not $proc) {
        Write-Host "    [Port $($entry.Port)] Process PID $pidToInspect is already stopped (not in process table)." -ForegroundColor Gray
        continue
    }

    $cmd = $proc.CommandLine
    $procName = $proc.Name

    # Verify that this PID still matches the exact expected AdhikarAI command line
    $isMatchingMarker = ($cmd -like "*$($entry.ExpectedMarker)*") -and ($cmd -like "*uvicorn*" -or $cmd -like "*server.js*" -or $cmd -like "*node*")

    if ($isMatchingMarker) {
        Write-Host "    [Port $($entry.Port)] Verified script-launched process found." -ForegroundColor Green
        Write-Host "    Process: $procName (PID: $pidToInspect)" -ForegroundColor Gray
        Write-Host "    Command: $cmd" -ForegroundColor Gray
        Write-Host "    Stopping process safely..." -ForegroundColor Cyan

        try {
            Stop-Process -Id $pidToInspect -Force -ErrorAction Stop
            Start-Sleep -Milliseconds 500
            Write-Host "    [Port $($entry.Port)] Successfully stopped PID $pidToInspect." -ForegroundColor Green
            $stoppedCount++
        } catch {
            Write-Host "    [Port $($entry.Port)] Failed to stop PID $($pidToInspect): $_" -ForegroundColor Red
            $remainingTracking[$svcKey] = $entry
        }
    } else {
        Write-Host "    [Port $($entry.Port)] SAFETY SKIPPED: Process PID $pidToInspect command line does NOT match expected service marker." -ForegroundColor Red
        Write-Host "    Actual Command Line: $cmd" -ForegroundColor Red
        Write-Host "    SAFETY RULE: PID may have been recycled by the OS. Refusing to stop." -ForegroundColor Red
        $skippedCount++
        $remainingTracking[$svcKey] = $entry
    }
}

# 4. Check whether any ports are still active under manual management
$ports = @(3000, 8001, 8002, 8003)
Write-Host ""
Write-Host "--> Checking status of standard ports (3000, 8001, 8002, 8003)..." -ForegroundColor Yellow
foreach ($p in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) {
        Write-Host "    [Port $p] Active process (PID: $($conn.OwningProcess)) is running manually. Left untouched." -ForegroundColor Cyan
    } else {
        Write-Host "    [Port $p] Port is free." -ForegroundColor Gray
    }
}

# 5. Clean up tracking file if all tracked services were stopped
if ($remainingTracking.Count -eq 0) {
    if (Test-Path $pidFile) {
        Remove-Item -Path $pidFile -Force -ErrorAction SilentlyContinue
        Write-Host ""
        Write-Host "PID tracking file cleared." -ForegroundColor Gray
    }
} else {
    $remainingTracking | ConvertTo-Json -Depth 5 | Set-Content -Path $pidFile -Encoding UTF8
    Write-Host ""
    Write-Host "PID tracking file updated with remaining active services." -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  Shutdown Summary: $stoppedCount script-managed service(s) stopped, $skippedCount process(es) preserved." -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
