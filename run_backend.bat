@echo off
cd /d "%~dp0"
echo Starting CampToCorp Backend Server on http://localhost:8000 ...
.\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
