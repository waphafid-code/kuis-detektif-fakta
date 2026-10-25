@echo off
title QuizMaster — Local Server 5500
echo ========================================================
echo  🚀 Memulai Server Lokal QuizMaster (Port 5500)
echo ========================================================
echo.
cd /d "%~dp0"

netstat -ano | findstr :5500 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Port 5500 sudah aktif dan sedang berjalan!
) else (
    echo [INFO] Menyalakan Python HTTP Server di port 5500...
    start /b python -m http.server 5500
    timeout /t 1 /nobreak >nul
)

echo [INFO] Membuka QuizMaster di browser default...
start http://localhost:5500/kuis_interaktif_dasbor_guru.html

echo.
echo ========================================================
echo  ✅ Server aktif di http://localhost:5500
echo  🌐 Hub 3D siap di http://localhost:5500/hub3d.html
echo ========================================================
pause
