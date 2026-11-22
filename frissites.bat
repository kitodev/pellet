@echo off
chcp 65001 >NUL
title Pellet Centrum - adatbazis frissites es feltoltes
cd /d "%~dp0"
echo 1/2 Adatbazis frissitese (TiDB)...
call pnpm db:migrate
echo.
echo 2/2 Mentes a GitHubra...
git add -A
git commit -m "Termekkepek, galeria"
git push
if errorlevel 1 (
  echo.
  echo HIBA: a feltoltes nem sikerult.
) else (
  echo.
  echo KESZ: adatbazis frissitve, minden fent van a GitHubon. 1-2 perc mulva kint lesz az oldalon.
)
echo.
pause
