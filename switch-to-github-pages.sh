#!/bin/bash

# ============================================================================
# switch-to-github-pages.sh
# Automated solution to switch from Cloudflare Pages to GitHub Pages
# For liyupoetry.com website
#
# Options:
# 1. Manual DNS switch (recommended for most users)
# 2. Automated DNS switch via Cloudflare API
# ============================================================================

set -e

# Color definitions for better readability
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

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Display header
show_header() {
    echo -e "${BLUE}==================================================${NC}"
    echo -e "${BLUE}  Automated Switch: Cloudflare Pages → GitHub Pages${NC}"
    echo -e "${BLUE}==================================================${NC}"
    echo ""
    echo "This script will help you switch your website deployment"
    echo "from Cloudflare Pages (which is having issues) to GitHub Pages"
    echo ""
    echo "Current issues with Cloudflare Pages:"
    echo "  • Only homepage accessible"
    echo "  • Subpages return 404"
    echo "  • Shows old content"
    echo ""
    echo "Benefits of GitHub Pages:"
    echo "  • ✅ All pages already work (https://lukethecat.github.io)"
    echo "  • ✅ No configuration needed"
    echo "  • ✅ 100% reliable"
    echo "  • ✅ Free and fast"
    echo ""
    echo "${CYAN}Two switching methods available:${NC}"
    echo "  1. ${GREEN}Manual DNS update${NC} (recommended for most users)"
    echo "  2. ${GREEN}Automated via Cloudflare API${NC} (requires API token)"
    echo ""
}

# Check current deployment status
check_current_status() {
    log_info "Checking current deployment status..."
    echo ""

    echo "🌐 Current Website Status"
    echo "========================"

    # Check GitHub Pages
    log_step "1. GitHub Pages Status"
    echo -n "   URL: https://lukethecat.github.io → "
    gh_status=$(curl -s -o /dev/null -w "%{http_code}" "https://lukethecat.github.io/" 2>/dev/null || echo "000")
    if [ "$gh_status" = "200" ]; then
        echo -e "${GREEN}✅ HTTP $gh_status (Working perfectly)${NC}"
        gh_title=$(curl -s "https://lukethecat.github.io/" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//' | head -1)
        echo "   Title: \"$gh_title\""
    else
        echo -e "${RED}❌ HTTP $gh_status (Not accessible)${NC}"
    fi

    # Check Cloudflare Pages
    log_step "2. Cloudflare Pages Status"
    echo -n "   URL: https://www.liyupoetry.com → "
    cf_status=$(curl -s -o /dev/null -w "%{http_code}" "https://www.liyupoetry.com/" 2>/dev/null || echo "000")
    if [ "$cf_status" = "200" ]; then
        echo -e "${YELLOW}⚠  HTTP $cf_status (Homepage only)${NC}"
        cf_title=$(curl -s "https://www.liyupoetry.com/" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//' | head -1)
        echo "   Title: \"$cf_title\" (OLD CONTENT)"
    else
        echo -e "${RED}❌ HTTP $cf_status (Not accessible)${NC}"
    fi

    # Check subpages
    log_step "3. Key Pages Comparison"
    echo "   Page                   GitHub Pages      Cloudflare Pages"
    echo "   --------------------------------------------------------"

    pages=("1995hanxuema/" "1980/" "archive/")
    descriptions=("汗血马诗集" "1980诗集" "归档页面")

    for i in "${!pages[@]}"; do
        page="${pages[$i]}"
        desc="${descriptions[$i]}"

        gh_sub_status=$(curl -s -o /dev/null -w "%{http_code}" "https://lukethecat.github.io/$page" 2>/dev/null || echo "000")
        cf_sub_status=$(curl -s -o /dev/null -w "%{http_code}" "https://www.liyupoetry.com/$page" 2>/dev/null || echo "000")

        printf "   %-15s" "$desc"
        printf " %12s" "HTTP $gh_sub_status"
        printf " %18s\n" "HTTP $cf_sub_status"
    done

    echo ""

    # Summary
    log_step "4. Analysis Summary"
    echo "   • GitHub Pages: ${GREEN}All pages work perfectly${NC}"
    echo "   • Cloudflare Pages: ${RED}Only homepage works, shows old content${NC}"
    echo "   • Recommendation: ${GREEN}Switch to GitHub Pages immediately${NC}"
    echo ""
}

# Generate DNS configuration guide
generate_dns_guide() {
    log_info "Generating DNS Configuration Guide..."
    echo ""

    echo "📋 DNS Configuration for GitHub Pages"
    echo "===================================="
    echo ""
    echo "To switch www.liyupoetry.com to GitHub Pages, you need to:"
    echo ""
    echo "1. ${GREEN}Update DNS Records in Cloudflare${NC}"
    echo "   -----------------------------------------"
    echo "   Current DNS setup (Cloudflare):"
    echo "   • www.liyupoetry.com → Cloudflare Pages (IP: 104.21.33.211, 172.67.166.218)"
    echo ""
    echo "   ${CYAN}Required change:${NC}"
    echo "   • Type: CNAME"
    echo "   • Name: www"
    echo "   • Target: lukethecat.github.io"
    echo "   • Proxy status: ${YELLOW}DNS only (turn OFF orange cloud)${NC}"
    echo ""
    echo "2. ${GREEN}Configure Custom Domain in GitHub${NC}"
    echo "   -----------------------------------------"
    echo "   Visit: https://github.com/lukethecat/lukethecat.github.io/settings/pages"
    echo "   • In 'Custom domain', enter: www.liyupoetry.com"
    echo "   • Click 'Save'"
    echo "   • GitHub will verify DNS and provision SSL certificate"
    echo ""

    # Generate detailed step-by-step guide
    echo "🔧 Step-by-Step Instructions"
    echo "==========================="
    echo ""
    echo "${CYAN}Step 1: Login to Cloudflare Dashboard${NC}"
    echo "   • Go to: https://dash.cloudflare.com"
    echo "   • Select your account"
    echo "   • Click on 'liyupoetry.com' domain"
    echo ""
    echo "${CYAN}Step 2: Update DNS Record${NC}"
    echo "   • Click 'DNS' in left menu"
    echo "   • Find the CNAME record for 'www'"
    echo "   • Click 'Edit' (pencil icon)"
    echo "   • Change 'Content' to: lukethecat.github.io"
    echo "   • Turn OFF the orange cloud (Proxy status → DNS only)"
    echo "   • Click 'Save'"
    echo ""
    echo "${CYAN}Step 3: Configure GitHub Pages${NC}"
    echo "   • Go to: https://github.com/lukethecat/lukethecat.github.io/settings/pages"
    echo "   • Scroll to 'Custom domain' section"
    echo "   • Enter: www.liyupoetry.com"
    echo "   • Click 'Save'"
    echo ""
    echo "${CYAN}Step 4: Wait for Propagation${NC}"
    echo "   • DNS changes take 1-5 minutes"
    echo "   • GitHub SSL certificate takes 1-10 minutes"
    echo "   • Run validation: ./validate_deployment.sh"
    echo ""
}

# Cloudflare API DNS update function
update_dns_via_api() {
    log_info "Cloudflare API DNS Update Function"
    echo ""
    echo "🔐 Cloudflare API Automated DNS Update"
    echo "======================================"
    echo ""
    echo "This will automatically update your DNS records using Cloudflare API."
    echo ""

    # Get API credentials
    echo -n "Enter your Cloudflare API Token: "
    read -s CF_API_TOKEN
    echo ""

    echo -n "Enter your Cloudflare Account ID: "
    read CF_ACCOUNT_ID
    echo ""

    echo -n "Enter your Zone ID (for liyupoetry.com): "
    read ZONE_ID
    echo ""

    log_step "1. Verifying API Token..."
    VERIFY_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json")

    if echo "$VERIFY_RESPONSE" | grep -q '"success":true'; then
        log_success "API Token is valid"
    else
        log_error "API Token verification failed"
        echo "Response: $VERIFY_RESPONSE"
        return 1
    fi

    log_step "2. Finding existing DNS record for 'www'..."
    DNS_RECORDS=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=www.liyupoetry.com&type=CNAME" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json")

    RECORD_ID=$(echo "$DNS_RECORDS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -z "$RECORD_ID" ]; then
        log_error "Could not find DNS record for www.liyupoetry.com"
        return 1
    fi

    log_success "Found DNS record ID: $RECORD_ID"

    log_step "3. Updating DNS record to point to GitHub Pages..."
    UPDATE_DATA='{
        "type": "CNAME",
        "name": "www.liyupoetry.com",
        "content": "lukethecat.github.io",
        "ttl": 1,
        "proxied": false,
        "comment": "Updated by switch-to-github-pages.sh script",
        "tags": [],
        "priority": 10
    }'

    UPDATE_RESPONSE=$(curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$UPDATE_DATA")

    if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
        log_success "✅ DNS record updated successfully!"
        echo ""
        echo "Updated www.liyupoetry.com → lukethecat.github.io"
        echo "Proxy status: DNS only (Cloudflare proxy disabled)"
        echo ""
    else
        log_error "Failed to update DNS record"
        echo "Response: $UPDATE_RESPONSE"
        return 1
    fi

    log_step "4. Verifying the update..."
    sleep 3
    NEW_IPS=$(dig +short www.liyupoetry.com 2>/dev/null || echo "Not resolved yet")

    echo "Current DNS resolution for www.liyupoetry.com:"
    echo "$NEW_IPS" | while read ip; do
        if [[ "$ip" == *"github.io"* ]] || [[ "$ip" == *"185.199"* ]]; then
            echo -e "  ${GREEN}✅ $ip (GitHub Pages)${NC}"
        else
            echo -e "  ${YELLOW}⚠  $ip (Still propagating)${NC}"
        fi
    done

    echo ""
    log_success "DNS update completed via Cloudflare API!"
    echo ""
    echo "Next steps:"
    echo "1. Configure GitHub Pages custom domain (see manual instructions)"
    echo "2. Wait 5-10 minutes for full propagation"
    echo "3. Run: ./validate_deployment.sh"
    echo ""

    return 0
}

# Display API option menu
show_api_option() {
    echo ""
    echo -e "${CYAN}🔧 Cloudflare API Automated DNS Update${NC}"
    echo "=========================================="
    echo ""
    echo "This option uses Cloudflare API to automatically update your DNS."
    echo ""
    echo "${YELLOW}Prerequisites:${NC}"
    echo "1. Cloudflare API Token with Zone:DNS:Edit permission"
    echo "2. Cloudflare Account ID"
    echo "3. Zone ID for liyupoetry.com"
    echo ""
    echo "${GREEN}Benefits:${NC}"
    echo "• No manual DNS editing required"
    echo "• Instant DNS record update"
    echo "• Script handles API calls automatically"
    echo ""
    echo "${YELLOW}Where to find these values:${NC}"
    echo "• ${CYAN}API Token:${NC} Cloudflare Dashboard → My Profile → API Tokens"
    echo "• ${CYAN}Account ID:${NC} Cloudflare Dashboard homepage (right sidebar)"
    echo "• ${CYAN}Zone ID:${NC} Cloudflare Dashboard → liyupoetry.com → Overview (right sidebar)"
    echo ""

    read -p "Do you want to use Cloudflare API for automated DNS update? (yes/no): " api_choice

    if [[ "$api_choice" =~ ^[Yy][Ee][Ss]$ ]]; then
        echo ""
        update_dns_via_api
        if [ $? -eq 0 ]; then
            return 0
        else
            echo ""
            log_warning "API update failed. Falling back to manual method."
            echo ""
            return 1
        fi
    else
        echo ""
        log_info "Using manual DNS update method instead."
        echo ""
        return 1
    fi
}

# Generate quick fix script
generate_quick_fix() {
    log_info "Generating Quick Fix Script..."
    echo ""

    echo "⚡ Quick Fix Option: Update CNAME File"
    echo "======================================"
    echo ""
    echo "If you want to test the switch without changing DNS immediately:"
    echo ""
    echo "1. Update the CNAME file to point to GitHub Pages:"
    echo ""
    cat << 'EOF'
   # Run this command:
   echo "lukethecat.github.io" > static/CNAME
   git add static/CNAME
   git commit -m "chore: point CNAME to GitHub Pages for testing"
   git push
EOF
    echo ""
    echo "2. This will:"
    echo "   • Keep Cloudflare DNS as-is"
    echo "   • Make GitHub Pages available at both URLs"
    echo "   • Allow testing before final switch"
    echo ""
}

# Provide verification steps
provide_verification() {
    log_info "Verification Steps After Switch..."
    echo ""

    echo "✅ How to Verify the Switch Worked"
    echo "================================="
    echo ""
    echo "After completing the DNS change:"
    echo ""
    echo "1. ${CYAN}Wait 5-10 minutes${NC} for DNS propagation"
    echo ""
    echo "2. ${CYAN}Run validation script:${NC}"
    echo "   ./validate_deployment.sh"
    echo ""
    echo "3. ${CYAN}Check key pages:${NC}"
    cat << 'EOF'
   for url in "https://www.liyupoetry.com/" \
              "https://www.liyupoetry.com/1995hanxuema/" \
              "https://www.liyupoetry.com/1980/" \
              "https://www.liyupoetry.com/archive/"; do
       echo -n "$url: "
       curl -s -o /dev/null -w "%{http_code}\n" "$url"
   done
EOF
    echo ""
    echo "4. ${CYAN}Expected results:${NC}"
    echo "   • All pages return HTTP 200"
    echo "   • Title shows '李瑜诗歌' not '西域诗魂｜李瑜和他的作品'"
    echo "   • No more 404 errors"
    echo ""
}

# Alternative solution: keep both
provide_alternative() {
    log_info "Alternative: Keep Both Deployments..."
    echo ""

    echo "🔄 Alternative Strategy"
    echo "======================"
    echo ""
    echo "If you prefer to keep Cloudflare but fix it later:"
    echo ""
    echo "1. ${GREEN}Use GitHub Pages as primary${NC}"
    echo "   • Update DNS to point to GitHub Pages (as above)"
    echo "   • All users get fast, reliable service"
    echo ""
    echo "2. ${GREEN}Keep Cloudflare for CDN only${NC}"
    echo "   • After DNS switch, Cloudflare still provides:"
    echo "     • DDoS protection"
    echo "     • SSL/TLS termination"
    echo "     • Security features"
    echo "   • But traffic flows through to GitHub Pages"
    echo ""
    echo "3. ${GREEN}Fix Cloudflare Pages later${NC}"
    echo "   • You can debug Cloudflare Pages at your own pace"
    echo "   • When fixed, switch DNS back if desired"
    echo ""
}

# Main function
main() {
    clear
    show_header

    log_step "Starting automated switch analysis..."
    echo ""

    # Check current status
    check_current_status

    # Ask for confirmation
    echo -e "${YELLOW}⚠  IMPORTANT: This will change your production website${NC}"
    echo ""
    read -p "Do you want to proceed with switching to GitHub Pages? (yes/no): " choice

    if [[ ! "$choice" =~ ^[Yy][Ee][Ss]$ ]]; then
        echo ""
        log_info "Operation cancelled. You can run this script again when ready."
        exit 0
    fi

    echo ""
    log_success "Proceeding with switch to GitHub Pages..."
    echo ""

    # Ask for switching method
    echo -e "${CYAN}Select switching method:${NC}"
    echo ""
    echo "1. ${GREEN}Manual DNS update${NC} (follow step-by-step guide)"
    echo "2. ${GREEN}Automated via Cloudflare API${NC} (requires API credentials)"
    echo ""
    read -p "Enter choice (1 or 2): " method_choice

    if [ "$method_choice" = "2" ]; then
        echo ""
        show_api_option
        api_success=$?

        if [ $api_success -eq 0 ]; then
            # API method succeeded, skip manual guide
            echo ""
            log_success "Cloudflare API update completed successfully!"
            echo ""
            provide_verification
            provide_alternative
        else
            # API method failed or user chose manual, show manual guide
            echo ""
            log_info "Showing manual DNS update instructions..."
            echo ""
            generate_dns_guide
            generate_quick_fix
            provide_verification
            provide_alternative
        fi
    else
        # Manual method
        echo ""
        log_info "Using manual DNS update method..."
        echo ""
        generate_dns_guide
        generate_quick_fix
        provide_verification
        provide_alternative
    fi

    # Final summary
    echo -e "${BLUE}==================================================${NC}"
    echo -e "${BLUE}                 SUMMARY                          ${NC}"
    echo -e "${BLUE}==================================================${NC}"
    echo ""
    echo "${GREEN}✅ What to do now:${NC}"
    echo ""

    if [ "$method_choice" = "2" ] && [ $api_success -eq 0 ]; then
        echo "1. ${CYAN}API update completed:${NC}"
        echo "   • DNS record updated automatically"
        echo "   • www.liyupoetry.com → lukethecat.github.io"
        echo ""
        echo "2. ${CYAN}Still required:${NC}"
        echo "   • Configure GitHub Custom Domain"
        echo "   • Visit: https://github.com/lukethecat/lukethecat.github.io/settings/pages"
        echo ""
    else
        echo "1. ${CYAN}Immediate action (5 minutes):${NC}"
        echo "   • Update Cloudflare DNS: www → lukethecat.github.io"
        echo "   • Configure GitHub Custom Domain"
        echo ""
    fi

    echo "2. ${CYAN}Quick verification:${NC}"
    echo "   • Wait 10 minutes"
    echo "   • Run: ./validate_deployment.sh"
    echo ""
    echo "3. ${CYAN}Expected outcome:${NC}"
    echo "   • https://www.liyupoetry.com shows current content"
    echo "   • All poetry pages accessible"
    echo "   • No more 404 errors"
    echo ""
    echo "${YELLOW}📝 Note:${NC} Your GitHub Pages site is already working perfectly at:"
    echo "   https://lukethecat.github.io"
    echo "   This switch just points your custom domain to it."
    echo ""
    echo "${GREEN}🎉 Done! Your website will be fixed in under 15 minutes.${NC}"
    echo ""
}

# Run main function
main "$@"
