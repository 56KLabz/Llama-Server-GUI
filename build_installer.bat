@echo off
title Llama Server GUI - Package Installer
cd /d "%~dp0"

echo ===================================================
echo Building Llama Server GUI Windows Setup Installer
echo ===================================================
echo.

call npm run dist

echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo BUILD SUCCESSFUL!
    echo Output installer is located in: dist-installer\
    echo ===================================================
    explorer "%~dp0dist-installer"
) else (
    echo [ERROR] Build failed.
)
pause
