@echo off
title VITECH School - Installation
color 0B
echo ============================================================
echo   VITECH SCHOOL MANAGEMENT SYSTEM - Installation (Windows)
echo ============================================================
echo.

REM --- 1. Check Node.js ---
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe sur cet ordinateur.
    echo.
    echo Telechargez-le ici :  https://nodejs.org/  (choisissez la version LTS)
    echo Une fois installe, fermez cette fenetre et relancez install-windows.bat
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js detecte :
node -v
echo.

REM --- 2. Install dependencies ---
echo [1/2] Installation des dependances (peut prendre 1-3 minutes)...
echo.
call npm install --no-audit --no-fund
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERREUR] npm install a echoue. Verifiez votre connexion internet.
    pause
    exit /b 1
)
echo.

REM --- 3. Build ---
echo [2/2] Compilation de l'application...
echo.
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERREUR] La compilation a echoue.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   INSTALLATION TERMINEE AVEC SUCCES
echo ============================================================
echo.
echo   Pour lancer l'application, double-cliquez sur :
echo        start-windows.bat
echo.
echo   Puis ouvrez votre navigateur a l'adresse affichee
echo   (par defaut : http://localhost:4173)
echo.
pause
