@echo off
chcp 65001 >NUL
title Pellet Centrum - mentes a GitHubra
cd /d "%~dp0"
echo Valtozasok:
git status --short
echo.
git add -A
git commit -m "Termekoldal, arajanlatkeres, kezdolap csempek, fejlec, terkep, egyseges zold"
echo.
echo Feltoltes a GitHubra...
git push
if errorlevel 1 (
  echo.
  echo HIBA: a feltoltes nem sikerult. Ha bejelentkezest ker, jelentkezz be a GitHub-fiokoddal, majd futtasd ujra.
) else (
  echo.
  echo KESZ: minden fent van a GitHubon.
)
echo.
pause
