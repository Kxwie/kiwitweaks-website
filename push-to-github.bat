@echo off
echo ========================================
echo   KiwiTweaks - GitHub Push Script
echo ========================================
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed or not in PATH
    pause
    exit /b 1
)

echo [1/4] Checking for changes...
git status --short
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Not a git repository
    pause
    exit /b 1
)
echo.

echo [2/4] Adding all changes...
git add .
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to add changes
    pause
    exit /b 1
)
echo [SUCCESS] All changes added
echo.

echo [3/4] Committing changes...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" (
    set commit_message=Update: UI improvements and bug fixes
)

git commit -m "%commit_message%"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to commit changes
    echo [INFO] This might be because there are no changes to commit
    pause
    exit /b 1
)
echo [SUCCESS] Changes committed
echo.

echo [4/4] Pushing to GitHub...
git push
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to push to GitHub
    echo [INFO] You might need to set upstream branch:
    echo        git push --set-upstream origin main
    pause
    exit /b 1
)
echo.
echo ========================================
echo   [SUCCESS] Pushed to GitHub!
echo ========================================
echo.
pause
