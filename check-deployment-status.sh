#!/bin/bash

# Deployment Status Check Script
# This script checks the deployment status of liyupoetry.com websites

set -e

echo "🔍 Checking deployment status for liyupoetry.com websites"
echo "=========================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs to check
declare -a url_descriptions=(
    "GitHub Pages Homepage"
    "GitHub Pages 汗血马诗集"
    "GitHub Pages 1980诗集"
    "GitHub Pages Archive"
    "GitHub Pages Test File"
    "Cloudflare Pages Homepage"
    "Cloudflare Pages 汗血马诗集"
    "Cloudflare Pages 1980诗集"
    "Cloudflare Pages Archive"
    "Cloudflare Pages Test File"
)

declare -a url_values=(
    "https://lukethecat.github.io/"
    "https://lukethecat.github.io/1995hanxuema/"
    "https://lukethecat.github.io/1980/"
    "https://lukethecat.github.io/archive/"
    "https://lukethecat.github.io/test-deployment.txt"
    "https://www.liyupoetry.com/"
    "https://www.liyupoetry.com/1995hanxuema/"
    "https://www.liyupoetry.com/1980/"
    "https://www.liyupoetry.com/archive/"
    "https://www.liyupoetry.com/test-deployment.txt"
)

# Function to check URL with retries
check_url() {
    local description="$1"
    local url="$2"
    local max_retries=2
    local retry_count=0

    while [ $retry_count -lt $max_retries ]; do
        echo -n "  Checking $description... "

        # Get HTTP status code
        local status
        status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")

        # Get page title if status is 200
        local title=""
        if [ "$status" = "200" ]; then
            title=$(curl -s --max-time 10 "$url" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//' | head -1)
        fi

        if [ "$status" = "200" ]; then
            echo -e "${GREEN}✅ HTTP $status${NC}"
            if [ -n "$title" ]; then
                echo "     Title: $title"
            fi
            return 0
        elif [ "$status" = "404" ]; then
            echo -e "${RED}❌ HTTP $status (Page not found)${NC}"
            return 1
        elif [ "$status" = "000" ]; then
            echo -e "${YELLOW}⚠️  Timeout/Connection error${NC}"
        else
            echo -e "${YELLOW}⚠️  HTTP $status${NC}"
        fi

        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $max_retries ]; then
            echo "     Retrying... ($retry_count/$max_retries)"
            sleep 2
        fi
    done

    echo -e "${RED}❌ Failed after $max_retries attempts${NC}"
    return 1
}

# Function to compare content between two URLs
compare_content() {
    local url1="$1"
    local url2="$2"
    local name1="$3"
    local name2="$4"

    echo -n "  Comparing $name1 vs $name2... "

    # Get titles
    local title1=$(curl -s --max-time 10 "$url1" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//' | head -1)
    local title2=$(curl -s --max-time 10 "$url2" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//' | head -1)

    if [ "$title1" = "$title2" ]; then
        echo -e "${GREEN}✅ Titles match: \"$title1\"${NC}"
    else
        echo -e "${YELLOW}⚠️  Titles differ:${NC}"
        echo "     $name1: \"$title1\""
        echo "     $name2: \"$title2\""
    fi
}

# Function to check DNS records
check_dns() {
    echo ""
    echo "🌐 DNS Configuration Check"
    echo "--------------------------"

    # Check GitHub Pages DNS
    echo -n "  GitHub Pages (lukethecat.github.io)... "
    if dig +short lukethecat.github.io >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Resolves${NC}"
    else
        echo -e "${RED}❌ Cannot resolve${NC}"
    fi

    # Check Cloudflare Pages DNS
    echo -n "  Cloudflare Pages (www.liyupoetry.com)... "
    local cf_ips=$(dig +short www.liyupoetry.com 2>/dev/null | head -2)
    if [ -n "$cf_ips" ]; then
        echo -e "${GREEN}✅ Resolves to:${NC}"
        echo "$cf_ips" | while read ip; do
            echo "     $ip"
        done
    else
        echo -e "${RED}❌ Cannot resolve${NC}"
    fi
}

# Main execution
echo "📊 Website Availability Check"
echo "-----------------------------"

success_count=0
total_checks=0

# Check all URLs
for i in "${!url_descriptions[@]}"; do
    description="${url_descriptions[$i]}"
    url="${url_values[$i]}"
    total_checks=$((total_checks + 1))
    if check_url "$description" "$url"; then
        success_count=$((success_count + 1))
    fi
    echo ""
done

# Compare GitHub Pages vs Cloudflare Pages
echo "🔀 Content Comparison"
echo "--------------------"
compare_content "https://lukethecat.github.io/" "https://www.liyupoetry.com/" "GitHub Pages" "Cloudflare Pages"

# Check DNS
check_dns

# Summary
echo ""
echo "📈 Deployment Status Summary"
echo "============================"
echo -e "Total checks: $total_checks"
echo -e "Successful: ${GREEN}$success_count${NC}"
echo -e "Failed: $((total_checks - success_count))"

echo ""
echo "🔧 Current Issues Identified"
echo "---------------------------"
echo "1. Cloudflare Pages shows different content than GitHub Pages"
echo "2. Cloudflare Pages deployment may be outdated or misconfigured"
echo "3. Some pages return 404 on Cloudflare Pages"
echo "4. Footer shows Western greetings on Cloudflare Pages"

echo ""
echo "🚀 Recommended Actions"
echo "---------------------"
echo "1. Check GitHub Actions workflow status"
echo "2. Verify Cloudflare Pages API token configuration"
echo "3. Consider pointing www.liyupoetry.com to GitHub Pages"
echo "4. Run validation script: ./validate_deployment.sh"

echo ""
echo "📞 Quick Diagnostics"
echo "-------------------"
echo "To check GitHub Actions status:"
echo "  Visit: https://github.com/lukethecat/lukethecat.github.io/actions"
echo ""
echo "To manually trigger deployment:"
echo "  git add . && git commit -m 'Trigger deployment' && git push"
echo ""
echo "To validate deployment:"
echo "  ./validate_deployment.sh"

# Exit with appropriate code
if [ $success_count -eq $total_checks ]; then
    echo -e "\n${GREEN}🎉 All systems operational!${NC}"
    exit 0
elif [ $success_count -ge $((total_checks / 2)) ]; then
    echo -e "\n${YELLOW}⚠️  Partial issues detected. Some manual intervention may be needed.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Significant issues detected. Immediate action required.${NC}"
    exit 1
fi
