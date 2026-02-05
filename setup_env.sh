#!/bin/bash
# setup_env.sh - Setup Cloudflare secrets for GitHub Actions
# This script assumes you have the GitHub CLI (gh) installed

set -e

echo "🔧 Cloudflare Secrets Setup"
echo "============================"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Please install it from: https://cli.github.com/"
    echo ""
    echo "Alternatively, configure secrets manually via:"
    echo "  Repository Settings -> Secrets and variables -> Actions"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "❌ Not logged in to GitHub CLI"
    echo "Please run: gh auth login"
    exit 1
fi

# Get current repository info
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
REPO_URL=$(gh repo view --json url -q '.url')

echo "📁 Repository: $REPO"
echo "🔗 URL: $REPO_URL"
echo ""

# Prompt for values
echo "📋 Please enter your Cloudflare credentials:"
echo ""

# CF_API_TOKEN
CF_API_TOKEN="nha5E71xJkZNBrT9A3dc_fOzFdSl3rSLoJYlWDrM"

if [ -z "$CF_API_TOKEN" ]; then
    echo "❌ CF_API_TOKEN is empty!"
    exit 1
fi

echo "✅ CF_API_TOKEN received"
echo ""

# CF_ACCOUNT_ID
CF_ACCOUNT_ID="12e3a030519ba316b2f114898039ff0f"

if [ -z "$CF_ACCOUNT_ID" ]; then
    echo "❌ CF_ACCOUNT_ID is empty!"
    exit 1
fi

echo "✅ CF_ACCOUNT_ID received"
echo ""

# Verify these should be the correct values
echo "⚠️  Confirm these are correct:"
echo "   CF_API_TOKEN (first 10 chars): ${CF_API_TOKEN:0:10}..."
echo "   CF_ACCOUNT_ID: $CF_ACCOUNT_ID"
echo ""

read -p "Continue? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo "⚙️  Setting up GitHub Secrets..."
echo ""

# Set CF_API_TOKEN
echo "  Setting CF_API_TOKEN..."
gh secret set CF_API_TOKEN --body "$CF_API_TOKEN" --repo "$REPO"
if [ $? -eq 0 ]; then
    echo "    ✅ CF_API_TOKEN set"
else
    echo "    ❌ Failed to set CF_API_TOKEN"
    exit 1
fi

# Set CF_ACCOUNT_ID
echo "  Setting CF_ACCOUNT_ID..."
gh secret set CF_ACCOUNT_ID --body "$CF_ACCOUNT_ID" --repo "$REPO"
if [ $? -eq 0 ]; then
    echo "    ✅ CF_ACCOUNT_ID set"
else
    echo "    ❌ Failed to set CF_ACCOUNT_ID"
    exit 1
fi

echo ""
echo "🎉 Success! Cloudflare secrets are configured."
echo ""
echo "Next steps:"
echo "1. The existing workflow will run on next push (already done)"
echo "2. Or manually trigger: GitHub UI -> Actions -> Deploy Website -> Run workflow"
echo "3. Check deployment at: https://www.liyupoetry.com"
echo ""
echo "To verify secrets are set:"
echo "  gh secret list --repo $REPO"
echo ""
echo "To see all workflow runs:"
echo "  gh run list --repo $REPO"
echo ""
echo "For manual deployment trigger:"
echo "  gh workflow run deploy.yml --repo $REPO"
```

## 📋 Script Usage

**Method 1 - Direct run** (if you have gh CLI):
```bash
chmod +x setup_env.sh
./setup_env.sh
```

**Method 2 - Manual setup** (via GitHub Web UI):
1. Go to: `https://github.com/lukethecat/lukethecat.github.io/settings/secrets/actions`
2. Click "New repository secret"
3. Add two secrets:
   - Name: `CF_API_TOKEN`, Value: `nha5E71xJkZNBrT9A3dc_fOzFdSl3rSLoJYlWDrM`
   - Name: `CF_ACCOUNT_ID`, Value: `12e3a030519ba316b2f114898039ff0f`

**Expected result:**
- ✅ Cloudflare deployment job will run on next push
- → ✅ Build completes
- → ✅ Deploys to `https://www.liyupoetry.com`
- → ✅ Verification step completes

Once you push again (or trigger a redeploy), the full deployment pipeline will complete and your sites will be live!
