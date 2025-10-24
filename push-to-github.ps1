# KiwiTweaks - GitHub Push Script (PowerShell)
# ===============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KiwiTweaks - GitHub Push Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $null = git --version
} catch {
    Write-Host "[ERROR] Git is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 1: Check for changes
Write-Host "[1/4] Checking for changes..." -ForegroundColor Yellow
$status = git status --short
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Not a git repository" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host $status
Write-Host ""

# Step 2: Add all changes
Write-Host "[2/4] Adding all changes..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to add changes" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[SUCCESS] All changes added" -ForegroundColor Green
Write-Host ""

# Step 3: Commit changes
Write-Host "[3/4] Committing changes..." -ForegroundColor Yellow
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: UI improvements and bug fixes"
}

git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to commit changes" -ForegroundColor Red
    Write-Host "[INFO] This might be because there are no changes to commit" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[SUCCESS] Changes committed" -ForegroundColor Green
Write-Host ""

# Step 4: Check for remote and push to GitHub
Write-Host "[4/5] Checking GitHub remote..." -ForegroundColor Yellow
$remote = git remote -v
if ([string]::IsNullOrWhiteSpace($remote)) {
    Write-Host "[INFO] No remote repository configured" -ForegroundColor Yellow
    Write-Host ""
    $repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git)"
    
    if ([string]::IsNullOrWhiteSpace($repoUrl)) {
        Write-Host "[ERROR] Repository URL is required" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host "Adding remote origin..." -ForegroundColor Yellow
    git remote add origin $repoUrl
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to add remote" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "[SUCCESS] Remote added" -ForegroundColor Green
} else {
    Write-Host "[SUCCESS] Remote already configured" -ForegroundColor Green
}
Write-Host ""

# Step 5: Push to GitHub
Write-Host "[5/5] Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to push to GitHub" -ForegroundColor Red
    Write-Host "[INFO] Make sure the repository exists and you have access" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  [SUCCESS] Pushed to GitHub!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
