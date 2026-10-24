@echo off
title Pellet Centrum - Admin (http://localhost:3001)
cd /d "%~dp0admin"
if not exist node_modules (
  echo Csomagok telepitese...
  call npm install
)
echo.
echo Admin indul: http://localhost:3001
echo Leallitas: zarja be ezt az ablakot.
echo.
start "" cmd /c "timeout /t 10 /nobreak >NUL & start http://localhost:3001"
call npm run dev
pause
