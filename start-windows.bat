@echo off
title VITECH School - Serveur local
color 0A
echo ============================================================
echo   VITECH SCHOOL MANAGEMENT SYSTEM - Lancement
echo ============================================================
echo.

REM --- Check Node.js ---
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe.
    echo Telechargez-le ici : https://nodejs.org/ (version LTS)
    pause
    exit /b 1
)

REM --- Check the app was built ---
if not exist "dist\index.html" (
    echo [INFO] L'application n'est pas encore compilee.
    echo Lancez d'abord : install-windows.bat
    echo.
    pause
    exit /b 1
)

echo [OK] Demarrage du serveur local...
echo.
echo   Ouvrez votre navigateur a l'adresse :
echo        http://localhost:4173
echo.
echo   Pour arreter le serveur, appuyez sur : Ctrl + C
echo ============================================================
echo.
call npm run preview
