# PowerShell runner for CampToCorp Backend
Set-Location $PSScriptRoot
Write-Host "Starting CampToCorp Backend Server on http://localhost:8000 ..." -ForegroundColor Cyan
& "$PSScriptRoot\.venv\Scripts\uvicorn.exe" app.main:app --reload --port 8000
