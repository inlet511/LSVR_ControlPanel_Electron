@echo off
set scriptDir=%~dp0

cd /d "%scriptDir%"

echo Running npm run build...
npm run build
if %errorlevel% neq 0 (
    echo npm run build Failed！
    pause
    exit /b 1
)



echo Finished!
pause