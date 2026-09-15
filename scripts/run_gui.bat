@echo off
cd /d "%~dp0"

if not exist "dist\index.html" (
    echo Compiling application assets...
    call npm run build
)

start "" wscript "%~dp0Launch_GUI.vbs"
exit
