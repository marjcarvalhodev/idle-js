@echo off
setlocal
cd /d "%~dp0"

set PORT=8000

echo.
echo ==========================================
echo              IDLE RPG DEV
echo ==========================================
echo.
echo PC:   http://localhost:%PORT%
echo LAN:  http://YOUR-PC-IP:%PORT%
echo.
echo Find your IPv4 with:
echo   ipconfig
echo.
echo Stop with Ctrl+C.
echo.

python -m http.server %PORT% --bind 0.0.0.0
