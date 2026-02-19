#!/bin/bash
# Fix Git Push Authentication Issues

cd "$(dirname "$0")"

echo "🔧 Fixing Git Push Issues..."
echo ""

# Set git config
echo "📦 Configuring git..."
git config http.postBuffer 524288000
git config http.version HTTP/1.1

echo ""
echo "🔐 Authentication Options:"
echo ""
echo "Option 1: Use Personal Access Token (Recommended)"
echo "  1. Go to: https://github.com/settings/tokens"
echo "  2. Click 'Generate new token (classic)'"
echo "  3. Select 'repo' scope"
echo "  4. Copy the token"
echo "  5. When git asks for password, paste the token"
echo ""
echo "Option 2: Use GitHub CLI"
echo "  Run: gh auth login"
echo "  Then: git push origin main"
echo ""

# Try to push
echo "🚀 Attempting push..."
echo "If it asks for credentials:"
echo "  Username: reddoy"
echo "  Password: [Use Personal Access Token from Option 1]"
echo ""

git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Push successful!"
else
    echo ""
    echo "❌ Push failed. Please follow the authentication steps above."
fi
