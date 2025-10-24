# 🚀 GitHub Push Scripts

## **Quick Start**

Two scripts are available to push changes to GitHub:

### **Option 1: Batch Script (Recommended for Windows)**
```cmd
push-to-github.bat
```

### **Option 2: PowerShell Script**
```powershell
.\push-to-github.ps1
```

---

## **What These Scripts Do**

Both scripts perform the same 4 steps:

1. ✅ **Check for changes** - Shows what files have been modified
2. ✅ **Add all changes** - Stages all modified files (`git add .`)
3. ✅ **Commit changes** - Creates a commit with your message
4. ✅ **Push to GitHub** - Uploads changes to your repository

---

## **Usage**

### **Batch Script (.bat):**

**Step 1:** Double-click `push-to-github.bat`

**Step 2:** Enter your commit message when prompted:
```
Enter commit message (or press Enter for default): Fixed navbar and icons
```

**Step 3:** Press Enter to use default message or type your own

**Done!** Changes are pushed to GitHub

---

### **PowerShell Script (.ps1):**

**Step 1:** Right-click on `push-to-github.ps1` → "Run with PowerShell"

**OR** Open PowerShell in the directory and run:
```powershell
.\push-to-github.ps1
```

**Note:** If you get an execution policy error, run this once:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Step 2:** Enter your commit message when prompted

**Done!** Changes are pushed to GitHub

---

## **Features**

✅ **Error Handling**
- Checks if Git is installed
- Validates git repository
- Shows helpful error messages

✅ **User-Friendly**
- Colored output (PowerShell version)
- Progress indicators
- Pauses at the end

✅ **Smart Defaults**
- Default commit message: "Update: UI improvements and bug fixes"
- Automatically stages all changes
- Handles upstream branch setup

✅ **Safe**
- Shows status before committing
- Confirms actions
- Provides informative feedback

---

## **Manual Commands (Alternative)**

If you prefer to run commands manually:

```bash
# Step 1: Add all changes
git add .

# Step 2: Commit with message
git commit -m "Your commit message here"

# Step 3: Push to GitHub
git push

# If first time: Set upstream
git push --set-upstream origin main
```

---

## **Common Issues**

### **❌ "Git is not installed"**
**Solution:** Install Git from https://git-scm.com/download/win

### **❌ "Not a git repository"**
**Solution:** Make sure you're in the correct folder with `.git` directory

### **❌ "Failed to push to GitHub"**
**Solution:** Run this command once:
```bash
git push --set-upstream origin main
```

### **❌ PowerShell script won't run**
**Solution:** Enable script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **❌ "Nothing to commit"**
**Solution:** No changes detected. Make some changes first!

---

## **Recommended Commit Messages**

Good commit messages:
- ✅ "Fixed navbar layout and replaced emojis with icons"
- ✅ "Added Terms popup formatting improvements"
- ✅ "Updated download section with card layout"
- ✅ "Bug fixes: FAQ accordion and modal display"

Bad commit messages:
- ❌ "update"
- ❌ "changes"
- ❌ "asdf"
- ❌ "fix"

---

## **Security Notes**

⚠️ **Important:**
- Never commit sensitive data (API keys, passwords, tokens)
- Check `.gitignore` to exclude sensitive files
- Review changes before pushing with `git status`

---

## **Quick Reference**

| Action | Batch Script | PowerShell Script | Manual Command |
|--------|--------------|-------------------|----------------|
| **Push changes** | Double-click `.bat` | Run `.ps1` | `git push` |
| **Check status** | Shown automatically | Shown automatically | `git status` |
| **Custom message** | Enter when prompted | Enter when prompted | `git commit -m "msg"` |
| **Default message** | Press Enter | Press Enter | Uses default |

---

## **Tips**

💡 **Quick Push:** Just double-click the batch script - fastest way!

💡 **Custom Messages:** Always enter a descriptive commit message

💡 **Check Before Push:** Review the file list shown before committing

💡 **Regular Commits:** Push changes frequently, don't wait too long

💡 **Keyboard Shortcut:** Create a desktop shortcut to the batch script

---

## **What Happens During Push**

```
1. Check Repository
   ↓
2. Stage All Changes (git add .)
   ↓
3. Create Commit (git commit)
   ↓
4. Upload to GitHub (git push)
   ↓
✅ Done! Changes are live on GitHub
```

---

## **Example Run**

```
========================================
  KiwiTweaks - GitHub Push Script
========================================

[1/4] Checking for changes...
M  index.html
M  css/style.css
M  css/hero.css

[2/4] Adding all changes...
[SUCCESS] All changes added

[3/4] Committing changes...
Enter commit message: Fixed navbar and replaced emojis
[SUCCESS] Changes committed

[4/4] Pushing to GitHub...

========================================
  [SUCCESS] Pushed to GitHub!
========================================
```

---

## **Files Created**

- `push-to-github.bat` - Windows Batch script
- `push-to-github.ps1` - PowerShell script
- `GITHUB_PUSH_SCRIPTS.md` - This documentation

---

**Happy Coding! 🚀**
