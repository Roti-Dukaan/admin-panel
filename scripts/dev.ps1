# Restart Roti Dukaan local dev stack (Windows)
param([switch]$AdminOnly, [switch]$SkipKill)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

function Stop-DevPort([int]$Port) {
  Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object { Write-Host "Stopping PID $($_.OwningProcess) on port $Port"; Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

if (-not $SkipKill) { foreach ($p in 3000,3001,3002) { Stop-DevPort $p }; Start-Sleep -Seconds 2 }

function Start-DevWindow([string]$Title, [string]$Dir, [string]$Command) {
  Start-Process powershell -ArgumentList @("-NoExit", "-Command", "Set-Location '$Dir'; $Command") -WindowStyle Normal
  Write-Host "Started $Title"
}

if ($AdminOnly) {
  Stop-DevPort 3002
  Start-Sleep 1
  Start-DevWindow "admin :3002" "$Root\admin-panel" "npm run dev:clean"
  exit 0
}

Start-DevWindow "backend :3001" "$Root\dukaan-backend" "npm run dev"
Start-Sleep -Seconds 6
Start-DevWindow "frontend :3000" "$Root\next-frontend" "npm run dev"
Start-Sleep -Seconds 2
Start-DevWindow "admin :3002" "$Root\admin-panel" "npm run dev:clean"
Write-Host "Verify: http://localhost:3001/api/v1/health , :3000 , :3002/login"
