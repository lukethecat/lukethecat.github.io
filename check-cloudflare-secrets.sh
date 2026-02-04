#!/bin/bash

# Cloudflare Secrets and Deployment Diagnostic Tool
# This script helps diagnose Cloudflare Pages deployment issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    echo -e "${CYAN}[DEBUG]${NC} $1"
}

# Header
show_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Cloudflare Secrets & Deployment Diagnostic${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Check for required tools
check_tools() {
    log_info "Checking required tools..."

    local required_tools=("curl" "jq")
    local missing_tools=()

    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done

    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_info "Please install:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        return 1
    fi

    log_success "All required tools available"
    echo ""
}

# Check GitHub Actions configuration
check_github_actions_config() {
    log_info "Checking GitHub Actions configuration..."

    if [ -f ".github/workflows/ci.yml" ]; then
        log_success "CI/CD workflow file exists: .github/workflows/ci.yml"

        echo ""
        echo "📋 Secrets Configuration in CI/CD workflow:"
        echo "----------------------------------------"

        # Check for CF_API_TOKEN reference
        if grep -q "CF_API_TOKEN" ".github/workflows/ci.yml"; then
            log_success "✓ CF_API_TOKEN is referenced in workflow"
            local line_num=$(grep -n "CF_API_TOKEN" ".github/workflows/ci.yml" | head -1 | cut -d: -f1)
            echo "   Line $line_num: $(grep "CF_API_TOKEN" ".github/workflows/ci.yml" | head -1)"
        else
            log_error "✗ CF_API_TOKEN is NOT referenced in workflow"
        fi

        # Check for CF_ACCOUNT_ID reference
        if grep -q "CF_ACCOUNT_ID" ".github/workflows/ci.yml"; then
            log_success "✓ CF_ACCOUNT_ID is referenced in workflow"
            local line_num=$(grep -n "CF_ACCOUNT_ID" ".github/workflows/ci.yml" | head -1 | cut -d: -f1)
            echo "   Line $line_num: $(grep "CF_ACCOUNT_ID" ".github/workflows/ci.yml" | head -1)"
        else
            log_error "✗ CF_ACCOUNT_ID is NOT referenced in workflow"
        fi

        # Check for deploy-to-cloudflare job
        if grep -q "deploy-to-cloudflare" ".github/workflows/ci.yml"; then
            log_success "✓ Cloudflare Pages deployment job exists"
        else
            log_error "✗ Cloudflare Pages deployment job NOT found"
        fi

        # Check project name configuration
        echo ""
        echo "🔧 Cloudflare Pages Project Configuration:"
        echo "-----------------------------------------"
        if grep -q "projectName.*liyupoetry" ".github/workflows/ci.yml"; then
            log_success "✓ Project name set to 'liyupoetry'"
        else
            log_warning "⚠  Project name may not be 'liyupoetry'"
            echo "   Expected: projectName: liyupoetry"
            echo "   Found: $(grep -i 'projectname' ".github/workflows/ci.yml" || echo 'Not found')"
        fi

    else
        log_error "CI/CD workflow file NOT found: .github/workflows/ci.yml"
    fi

    echo ""
}

# Check GitHub Secrets configuration (indirectly)
check_github_secrets_status() {
    log_info "Checking GitHub Secrets configuration status..."

    echo "📊 How to verify GitHub Secrets are correctly configured:"
    echo "------------------------------------------------------"
    echo ""
    echo "1. Visit GitHub repository Settings:"
    echo "   https://github.com/lukethecat/lukethecat.github.io/settings/secrets/actions"
    echo ""
    echo "2. Look for these two secrets:"
    echo "   ✅ CF_API_TOKEN (value hidden)"
    echo "   ✅ CF_ACCOUNT_ID (value visible)"
    echo ""
    echo "3. Check if they were added recently:"
    echo "   - Hover over 'Updated X time ago'"
    echo "   - Ensure they were updated after token creation"
    echo ""
    echo "4. Verify secret names are EXACTLY:"
    echo "   - CF_API_TOKEN (not CF_API_KEY, CF_TOKEN, etc.)"
    echo "   - CF_ACCOUNT_ID (case-sensitive)"
    echo ""

    # Check recent GitHub Actions runs for Cloudflare errors
    echo "🔍 Recent GitHub Actions Cloudflare Deployment Status:"
    echo "----------------------------------------------------"
    echo "Visit: https://github.com/lukethecat/lukethecat.github.io/actions"
    echo ""
    echo "Look for 'Check Cloudflare configuration' step in latest run"
    echo "If it shows '❌ Cloudflare Pages deployment cannot proceed',"
    echo "click on that step to see detailed error message."
    echo ""
}

# Check Cloudflare Pages project and token validity
check_cloudflare_configuration() {
    log_info "Cloudflare API Token and Project Verification"
    echo "=================================================="
    echo ""

    echo "🤔 Common reasons Cloudflare deployment fails even with secrets configured:"
    echo "----------------------------------------------------------------------"
    echo ""
    echo "1. 🔐 API Token Permissions Insufficient"
    echo "   Required permissions:"
    echo "   - Account: Cloudflare Pages → Edit"
    echo "   - Account: Account Settings → Read"
    echo "   - Zone: DNS → Edit"
    echo "   - Zone: SSL and Certificates → Edit"
    echo ""
    echo "2. 🔢 Incorrect Account ID"
    echo "   - Must be your Cloudflare Account ID (32 characters)"
    echo "   - Found in Cloudflare Dashboard home page"
    echo ""
    echo "3. 📁 Project Doesn't Exist"
    echo "   - GitHub Actions expects project named 'liyupoetry'"
    echo "   - If project doesn't exist, deployment fails"
    echo ""
    echo "4. ⏰ Token Expired or Revoked"
    echo "   - API tokens can expire or be deleted"
    echo ""
    echo "5. 🌐 Domain Not in Cloudflare Account"
    echo "   - liyupoetry.com must be in your Cloudflare account"
    echo ""

    echo ""
    echo "🛠️ How to Test Cloudflare API Token Manually:"
    echo "---------------------------------------------"
    echo ""
    echo "1. Get your API Token from GitHub Secrets or Cloudflare Dashboard"
    echo "2. Get your Account ID from Cloudflare Dashboard"
    echo "3. Run these commands (replace values):"
    echo ""
    cat << 'EOF'
   # Test 1: Verify token is valid
   curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json" | jq .

   # Test 2: Check account access
   curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json" | jq .

   # Test 3: Check Pages projects
   curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/pages/projects" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json" | jq .
EOF
    echo ""
}

# Check current deployment status
check_deployment_status() {
    log_info "Current Deployment Status Check"
    echo "==================================="
    echo ""

    echo "🌐 Website Availability:"
    echo "----------------------"

    # Check GitHub Pages
    echo -n "  GitHub Pages (lukethecat.github.io): "
    if curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://lukethecat.github.io/" &>/dev/null; then
        echo -e "${GREEN}✅ Accessible${NC}"
        local gh_title=$(curl -s --max-time 10 "https://lukethecat.github.io/" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//' | head -1)
        echo "     Title: \"$gh_title\""
    else
        echo -e "${RED}❌ Not accessible${NC}"
    fi

    # Check Cloudflare Pages
    echo -n "  Cloudflare Pages (www.liyupoetry.com): "
    if curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://www.liyupoetry.com/" &>/dev/null; then
        echo -e "${GREEN}✅ Accessible${NC}"
        local cf_title=$(curl -s --max-time 10 "https://www.liyupoetry.com/" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//' | head -1)
        echo "     Title: \"$cf_title\""

        # Check if showing old content
        if [[ "$cf_title" == *"西域诗魂"* ]]; then
            echo -e "${YELLOW}     ⚠  Showing OLD content ('西域诗魂｜李瑜和他的作品')${NC}"
        elif [[ "$cf_title" == *"李瑜诗歌"* ]]; then
            echo -e "${GREEN}     ✓ Showing CURRENT content ('李瑜诗歌')${NC}"
        fi
    else
        echo -e "${RED}❌ Not accessible${NC}"
    fi

    echo ""
    echo "📄 Key Page Status (Cloudflare):"
    echo "------------------------------"

    local pages=("/1995hanxuema/" "/1980/" "/archive/")
    local descriptions=("汗血马诗集" "1980诗集" "归档页面")

    for i in "${!pages[@]}"; do
        local page="${pages[$i]}"
        local desc="${descriptions[$i]}"

        echo -n "  $desc (https://www.liyupoetry.com$page): "
        local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://www.liyupoetry.com$page" 2>/dev/null || echo "000")

        case $status in
            200) echo -e "${GREEN}✅ HTTP 200${NC}" ;;
            404) echo -e "${RED}❌ HTTP 404 (Page not found)${NC}" ;;
            000) echo -e "${YELLOW}⚠  Connection failed${NC}" ;;
            *) echo -e "${YELLOW}⚠  HTTP $status${NC}" ;;
        esac
    done

    echo ""
}

# Provide solutions based on diagnosis
provide_solutions() {
    log_info "Recommended Solutions"
    echo "========================"
    echo ""

    echo "🔧 Based on common issues, here are solutions to try:"
    echo ""

    echo "1. ${GREEN}Re-create Cloudflare API Token${NC}"
    echo "   a. Go to Cloudflare Dashboard → My Profile → API Tokens"
    echo "   b. Create new token with correct permissions (see above)"
    echo "   c. Update GitHub Secrets with new token"
    echo "   d. Trigger new deployment"
    echo ""

    echo "2. ${GREEN}Verify Account ID${NC}"
    echo "   a. Login to Cloudflare Dashboard"
    echo "   b. Check Account ID on home page (right sidebar)"
    echo "   c. Ensure GitHub Secrets has EXACT same value"
    echo ""

    echo "3. ${GREEN}Check Cloudflare Pages Project${NC}"
    echo "   a. Visit: https://dash.cloudflare.com/?to=/:account/pages"
    echo "   b. Look for project named 'liyupoetry'"
    echo "   c. If missing, create it manually or ensure token has create permission"
    echo ""

    echo "4. ${GREEN}Test API Token Directly${NC}"
    echo "   Run the interactive test:"
    echo "   ./setup-cloudflare-pages.sh"
    echo "   Choose option 4: Test API Token"
    echo ""

    echo "5. ${GREEN}Quick Switch to GitHub Pages${NC}"
    echo "   If Cloudflare continues to fail, point domain to GitHub Pages:"
    echo "   a. Cloudflare DNS: Change www CNAME to lukethecat.github.io"
    echo "   b. GitHub Pages: Add custom domain www.liyupoetry.com"
    echo ""

    echo "6. ${GREEN}Examine Detailed GitHub Actions Logs${NC}"
    echo "   a. Go to: https://github.com/lukethecat/lukethecat.github.io/actions"
    echo "   b. Click latest failed run"
    echo "   c. Click 'deploy-to-cloudflare' job"
    echo "   d. Click 'Check Cloudflare configuration' step"
    echo "   e. Copy error message for further diagnosis"
    echo ""
}

# Main function
main() {
    show_header

    # Check tools
    if ! check_tools; then
        log_error "Please install missing tools and try again"
        exit 1
    fi

    # Run diagnostics
    check_github_actions_config
    check_github_secrets_status
    check_cloudflare_configuration
    check_deployment_status
    provide_solutions

    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}     Diagnostic Complete${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review the diagnostic output above"
    echo "2. Follow the recommended solutions"
    echo "3. Run validation: ./check-deployment-status.sh"
    echo "4. Check GitHub Actions after making changes"
    echo ""
    echo "Need more help? Run: ./debug-cloudflare-deployment.sh --full"
    echo ""
}

# Run main function
main "$@"
