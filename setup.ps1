param([switch]$SkipBackend)

$ErrorActionPreference = 'Stop'
$Project = Split-Path -Parent $MyInvocation.MyCommand.Path

function Require-Command([string]$Name, [string]$Hint) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Missing $Name. $Hint"
    }
}

Require-Command 'node' 'Install Node.js 20 or newer: https://nodejs.org/'

$nodeMajor = [int]((& node --version).TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 20) { throw "Node.js 20 or newer is required (found $nodeMajor)." }

$pnpmExe = 'pnpm'
$pnpmPrefix = @()
if (-not (Get-Command 'pnpm' -ErrorAction SilentlyContinue)) {
    $corepack = Get-Command 'corepack' -ErrorAction SilentlyContinue
    if (-not $corepack) { throw 'pnpm or Corepack is missing. Install Node.js 20+ or pnpm manually.' }
    Write-Host 'pnpm was not found; preparing it with Corepack...'
    $pnpmExe = 'corepack'
    $pnpmPrefix = @('pnpm')
    & $pnpmExe @pnpmPrefix --version | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Corepack could not prepare pnpm. Run npm install -g pnpm manually.' }
}

Set-Location -LiteralPath $Project
Write-Host 'Installing frontend dependencies...'
& $pnpmExe @pnpmPrefix install
if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }

if (-not $SkipBackend) {
    $backend = Join-Path $Project 'wardrobe_local_tool'
    $pyLauncher = Get-Command 'py' -ErrorAction SilentlyContinue
    $python = Get-Command 'python' -ErrorAction SilentlyContinue
    if (-not $pyLauncher -and -not $python) {
        throw 'Python was not found. Install Python 3.11 or newer and enable Add Python to PATH.'
    }
    Write-Host 'Installing local vision service dependencies...'
    & powershell -ExecutionPolicy Bypass -File (Join-Path $backend 'setup.ps1')
    if ($LASTEXITCODE -ne 0) { throw 'Local vision service dependency installation failed.' }
    $envFile = Join-Path $backend '.env'
    if (-not (Test-Path -LiteralPath $envFile)) {
        Copy-Item -LiteralPath (Join-Path $backend '.env.example') -Destination $envFile
        Write-Host 'Created wardrobe_local_tool\.env. Fill in OPENAI_API_KEY before using vision or AI advice.'
    }
}

Write-Host ''
Write-Host 'Setup complete. Start the web app with: pnpm web -- --port 8091'
Write-Host 'Start the vision service with: powershell -ExecutionPolicy Bypass -File .\wardrobe_local_tool\start_web.ps1'
