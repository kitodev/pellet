@echo off
title Pellet Centrum - Admin (http://localhost:3001)
cd /d "%~dp0admin"
echo Csomagok ellenorzese...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo HIBA: az npm install nem sikerult.
  pause
  exit /b 1
)
echo.
echo Admin indul: http://localhost:3001
echo Fontos: a XAMPP-ban a MySQL fusson!
echo Leallitas: zarja be ezt az ablakot.
echo.
start "" cmd /c "timeout /t 10 /nobreak >NUL & start http://localhost:3001"
call npm run dev
pause
