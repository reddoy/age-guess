# Git Push Fix Instructions

The push is failing due to authentication or configuration issues. Here are the exact commands to run:

## Quick Fix (Try This First)

Open Terminal and run these commands:

```bash
cd /Users/rohanomalley/Desktop/ageguess-new/ageGuess

# Increase git buffer size
git config http.postBuffer 524288000
git config http.version HTTP/1.1

# Try pushing again
git push origin main
```

## If That Doesn't Work - Authentication Fix

The HTTP 400 error is often caused by authentication issues. Try these:

### Option 1: Update GitHub Credentials (macOS)

```bash
# Clear old credentials
git credential-osxkeychain erase <<EOF
host=github.com
protocol=https
EOF

# Try pushing - it will prompt for new credentials
git push origin main
```

When prompted, use:
- **Username**: Your GitHub username
- **Password**: A GitHub Personal Access Token (not your password)
  - Get one at: https://github.com/settings/tokens
  - Create token with `repo` permissions

### Option 2: Switch to SSH (Recommended)

```bash
# Check if you have SSH keys
ls -la ~/.ssh/id_*.pub

# If you have SSH keys, switch remote URL
git remote set-url origin git@github.com:reddoy/ageGuess.git

# Try pushing
git push origin main
```

If you don't have SSH keys, create them:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
# Copy the output and add it to GitHub: https://github.com/settings/keys
```

### Option 3: Use GitHub CLI

If you have `gh` installed:
```bash
gh auth login
git push origin main
```

## If Large Files Are the Issue

The font files might be too large. You can use Git LFS:

```bash
git lfs install
git lfs track "*.ttf"
git add .gitattributes
git commit -m "Add Git LFS tracking"
git push origin main
```

## Current Status

You have 2 commits ready to push:
1. `c2ed854` - Modernize ageGuess game
2. `72036ab` - Modernize UI with glassmorphism

Both commits are ready and waiting to be pushed once authentication is fixed.
