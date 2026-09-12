$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $projectRoot 'fabricVS-backend'
$outputRoot = Join-Path $PSScriptRoot 'backend-dist'
$workRoot = Join-Path $PSScriptRoot '.pyinstaller'

Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $outputRoot, $workRoot

Push-Location $backendRoot
try {
  uv run pyinstaller `
    --noconfirm `
    --clean `
    --onefile `
    --name fabric-vision-backend `
    --paths $backendRoot `
    --distpath $outputRoot `
    --workpath $workRoot `
    --collect-all cv2 `
    --collect-all uvicorn `
    run.py
}
finally {
  Pop-Location
}
