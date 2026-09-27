param([int]$WebPort = 8091, [int]$ApiPort = 8000)

$ErrorActionPreference = 'Stop'
$Project = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendScript = Join-Path $Project 'wardrobe_local_tool\start_web.ps1'
$python = Join-Path $Project 'wardrobe_local_tool\.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $python)) {
    throw 'The local vision service is not installed. Run .\setup.ps1 first.'
}
if (-not (Test-Path -LiteralPath (Join-Path $Project 'wardrobe_local_tool\.env'))) {
    Write-Warning 'wardrobe_local_tool\.env is missing. Vision and AI features will not work until you create it.'
}

Start-Process -FilePath 'powershell' -ArgumentList @('-NoExit', '-ExecutionPolicy', 'Bypass', '-File', $backendScript, '-Port', $ApiPort) -WorkingDirectory (Join-Path $Project 'wardrobe_local_tool')
Set-Location -LiteralPath $Project
Write-Host "Starting Outfit App at http://localhost:$WebPort"
if (Get-Command 'pnpm' -ErrorAction SilentlyContinue) {
    & pnpm web -- --port $WebPort
} elseif (Get-Command 'corepack' -ErrorAction SilentlyContinue) {
    & corepack pnpm web -- --port $WebPort
} else {
    throw 'pnpm is missing. Run .\setup.ps1 first.'
}
