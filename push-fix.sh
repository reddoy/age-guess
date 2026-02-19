#!/bin/bash
# Git Push Fix Script
# Run this script to fix common git push issues

cd "$(dirname "$0")"

echo "🔧 Attempting to fix git push issues..."

# Increase buffer size
echo "📦 Setting git buffer size..."
git config http.postBuffer 524288000
git config http.version HTTP/1.1

# Try pushing
echo "🚀 Attempting to push..."
if git push origin main; then
    echo "✅ Push successful!"
    exit 0
fi

echo "⚠️  Standard push failed. Trying alternative methods..."

# Try SSH if available
if git remote get-url origin | grep -q "^https"; then
    echo "🔄 Trying to switch to SSH..."
    SSH_URL=$(git remote get-url origin | sed 's|https://github.com/|git@github.com:|')
    echo "Would switch to: $SSH_URL"
    echo "To switch manually, run: git remote set-url origin $SSH_URL"
fi

# Try pushing with force-with-lease (safer than force)
echo "🔄 Trying force-with-lease..."
if git push origin main --force-with-lease; then
    echo "✅ Push successful with force-with-lease!"
    exit 0
fi

echo "❌ All push methods failed."
echo ""
echo "📋 Manual steps to try:"
echo "1. Check your GitHub authentication:"
echo "   - Visit: https://github.com/settings/tokens"
echo "   - Or update credentials in macOS Keychain"
echo ""
echo "2. Try using SSH instead of HTTPS:"
echo "   git remote set-url origin git@github.com:reddoy/ageGuess.git"
echo "   git push origin main"
echo ""
echo "3. Check if you need to authenticate:"
echo "   git push origin main"
echo "   (It will prompt for credentials)"
echo ""
echo "4. If large files are the issue, consider using Git LFS:"
echo "   git lfs install"
echo "   git lfs track '*.ttf'"
echo "   git add .gitattributes"
echo "   git commit -m 'Add Git LFS'"
echo "   git push origin main"

exit 1
