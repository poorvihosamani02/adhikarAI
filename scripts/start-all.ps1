<#
.SYNOPSIS
    Safe multi-service startup script for AdhikarAI.
.DESCRIPTION
    Checks ports 3000, 8001, 8002, and 8003. Prevents duplicate instances,
    verifies process ownership, records PIDs in a project-specific tracking file,
    and probes health endpoints to confirm operational readiness.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Continue"

# Resolve absolute path to project root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = (Resolve-Path (Join-Path $scriptDir "..")).Path
$pidFile = Join-Path $scriptDir ".adhikar-services.json"

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  AdhikarAI - Safe Multi-Service Process Starter" -ForegroundColor Cyan
Write-Host "  Project Root: $projectRoot" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

# Definitions of all four architecture services
$services = @(
    @{
        Name           = "Node.js Backend Gateway"
        ShortName      = "node-gateway"
        Port           = 3000
        WorkDir        = (Join-Path $projectRoot "backend")
        Executable     = "node"
        Args           = @("server.js")
        ExpectedMarker = "server.js"
        HealthUrl      = "http://localhost:3000/api/health"
    },
    @{
        Name           = "Python RAG Chatbot Service"
        ShortName      = "rag-chatbot"
        Port           = 8001
        WorkDir        = (Join-Path $projectRoot "ai-services\rag-chatbot")
        Executable     = "python"
        Args           = @("-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8001")
        ExpectedMarker = "8001"
        HealthUrl      = "http://127.0.0.1:8001/health"
    },
    @{
        Name           = "Python Document Doctor Service"
        ShortName      = "document-doctor"
        Port           = 8002
        WorkDir        = (Join-Path $projectRoot "ai-services\document-doctor")
        Executable     = "python"
        Args           = @("-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8002")
        ExpectedMarker = "8002"
        HealthUrl      = "http://127.0.0.1:8002/health"
    },
    @{
        Name           = "Python Scam Shield Service"
        ShortName      = "scam-shield"
        Port           = 8003
        WorkDir        = (Join-Path $projectRoot "ai-services\scam-shield")
        Executable     = "python"
        Args           = @("-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8003")
        ExpectedMarker = "8003"
        HealthUrl      = "http://127.0.0.1:8003/health"
    }
)

# Load existing PID tracking records if file exists
$trackedProcesses = @{}
if (Test-Path $pidFile) {
    try {
        $rawJson = Get-Content -Path $pidFile -Raw | ConvertFrom-Json
        foreach ($prop in $rawJson.PSObject.Properties) {
            $trackedProcesses[$prop.Name] = $prop.Value
        }
    } catch {
        Write-Warning "Could not parse existing PID file: $_"
    }
}

$results = @()

foreach ($svc in $services) {
    Write-Host ""
    Write-Host "--> Checking $($svc.Name) (Port $($svc.Port))..." -ForegroundColor Yellow

    # Check if port is currently occupied
    $connection = Get-NetTCPConnection -LocalPort $svc.Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1

    if ($connection) {
        $owningPid = $connection.OwningProcess
        $procInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $owningPid" -ErrorAction SilentlyContinue
        $cmdLine = if ($procInfo) { $procInfo.CommandLine } else { "" }

        # Verify whether the process belongs to this AdhikarAI project
        $isCmdMatch = ($cmdLine -like "*$($svc.ExpectedMarker)*") -and ($cmdLine -like "*uvicorn*" -or $cmdLine -like "*server.js*" -or $cmdLine -like "*adhikar*")
        $isHealthMatch = $false
        try {
            $probe = Invoke-RestMethod -Uri $svc.HealthUrl -Method Get -TimeoutSec 2 -ErrorAction Stop
            if ($probe.status -eq "healthy") { $isHealthMatch = $true }
        } catch {}

        $isAdhikarService = $isCmdMatch -or $isHealthMatch

        if ($isAdhikarService) {
            Write-Host "    [Port $($svc.Port)] Already listening by verified AdhikarAI process (PID: $owningPid)." -ForegroundColor Green
            Write-Host "    OWNERSHIP NOTE: Started manually or in external session. Will NOT be recorded for stop-all.ps1." -ForegroundColor Gray
            
            # Probe health endpoint
            try {
                $health = Invoke-RestMethod -Uri $svc.HealthUrl -Method Get -TimeoutSec 3 -ErrorAction Stop
                Write-Host "    Health Status: HEALTHY" -ForegroundColor Green
                $statusText = "HEALTHY (Manual / Preserved)"
            } catch {
                Write-Host "    Health Status: RUNNING_UNHEALTHY ($($_.Exception.Message))" -ForegroundColor DarkYellow
                $statusText = "RUNNING_UNHEALTHY (Manual / Preserved)"
            }

            # Pre-existing processes are intentionally NOT added to $trackedProcesses,
            # ensuring stop-all.ps1 will never touch them.

            $results += [PSCustomObject]@{
                Service   = $svc.Name
                Port      = $svc.Port
                PID       = $owningPid
                Status    = $statusText
                ManagedBy = "Manual (Preserved)"
            }
            continue
        } else {
            Write-Host "    [Port $($svc.Port)] WARNING: Port is occupied by UNIDENTIFIED foreign process (PID: $owningPid, $($procInfo.Name))." -ForegroundColor Red
            Write-Host "    Foreign Command Line: $cmdLine" -ForegroundColor Red
            Write-Host "    Skipping startup for $($svc.Name) to prevent port conflict or termination of unrelated software." -ForegroundColor Red

            $results += [PSCustomObject]@{
                Service = $svc.Name
                Port    = $svc.Port
                PID     = $owningPid
                Status  = "PORT_CONFLICT_UNIDENTIFIED"
            }
            continue
        }
    }

    # Port is unoccupied: Launch the service safely
    Write-Host "    [Port $($svc.Port)] Port is free. Launching from $($svc.WorkDir)..." -ForegroundColor Cyan

    try {
        $p = Start-Process -FilePath $svc.Executable `
                           -ArgumentList $svc.Args `
                           -WorkingDirectory $svc.WorkDir `
                           -PassThru `
                           -WindowStyle Hidden

        Start-Sleep -Milliseconds 1500

        # Poll health endpoint with timeout (up to 8 seconds)
        $isHealthy = $false
        $attempts = 0
        while ($attempts -lt 8 -and -not $isHealthy) {
            $attempts++
            try {
                $null = Invoke-RestMethod -Uri $svc.HealthUrl -Method Get -TimeoutSec 2 -ErrorAction Stop
                $isHealthy = $true
            } catch {
                Start-Sleep -Seconds 1
            }
        }

        if ($isHealthy) {
            Write-Host "    [Port $($svc.Port)] Service launched and verified healthy (PID: $($p.Id))." -ForegroundColor Green
            $statusText = "HEALTHY (Started)"
        } else {
            Write-Host "    [Port $($svc.Port)] Service process spawned (PID: $($p.Id)) but health probe timed out." -ForegroundColor Yellow
            $statusText = "RUNNING_UNHEALTHY"
        }

        $trackedProcesses[$svc.ShortName] = [PSCustomObject]@{
            Service         = $svc.ShortName
            Port            = $svc.Port
            PID             = $p.Id
            StartedByScript = $true
            CommandLine     = "$($svc.Executable) $($svc.Args -join ' ')"
            WorkDir         = $svc.WorkDir
            ExpectedMarker  = $svc.ExpectedMarker
            LaunchedAt      = (Get-Date).ToString("o")
        }

        $results += [PSCustomObject]@{
            Service = $svc.Name
            Port    = $svc.Port
            PID     = $p.Id
            Status  = $statusText
        }
    } catch {
        Write-Host "    [Port $($svc.Port)] Failed to launch service: $_" -ForegroundColor Red
        $results += [PSCustomObject]@{
            Service = $svc.Name
            Port    = $svc.Port
            PID     = "N/A"
            Status  = "STARTUP_FAILED"
        }
    }
}

# Save updated tracked PIDs to project tracker file
$trackedProcesses | ConvertTo-Json -Depth 5 | Set-Content -Path $pidFile -Encoding UTF8

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  Service Status Summary" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
$results | Format-Table -AutoSize

Write-Host "PID tracking updated at: $pidFile" -ForegroundColor Gray
