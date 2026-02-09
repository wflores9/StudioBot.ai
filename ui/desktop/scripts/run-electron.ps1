Param(
  [string]$Url = 'http://localhost:3001',
  [int]$TimeoutSec = 120
)

Write-Host "Waiting for $Url (timeout ${TimeoutSec}s)..."
$start = Get-Date
while ((New-TimeSpan -Start $start).TotalSeconds -lt $TimeoutSec) {
  try {
    $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) {
      Write-Host "Server is up: $($resp.StatusCode)"
      break
    }
  } catch {
    Start-Sleep -Seconds 1
  }
}

if ((New-TimeSpan -Start $start).TotalSeconds -ge $TimeoutSec) {
  Write-Error "Timed out waiting for $Url"
  exit 1
}

Push-Location (Join-Path $PSScriptRoot '..')
Write-Host "Starting Electron..."
if (Test-Path node_modules\.bin\electron.cmd) {
  & node_modules\.bin\electron.cmd .
} elseif (Get-Command electron -ErrorAction SilentlyContinue) {
  electron .
} else {
  Write-Error "Electron not found. Run 'npm install' in this folder first or use npx electron ."
  exit 1
}
Pop-Location
