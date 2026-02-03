#!/bin/bash

# Deployment Validation Script for liyupoetry.com
# Simplified version for older bash versions

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
MAX_RETRIES=3
RETRY_DELAY=10
TIMEOUT=30

# Function to check URL
check_url() {
    local url="$1"
    local description="$2"
    local retry_count=0
    local status=""

    echo -e "${BLUE}🔍 Checking $description...${NC}"
    echo "URL: $url"

    while [ $retry_count -lt $MAX_RETRIES ]; do
        echo "Attempt $((retry_count + 1))/$MAX_RETRIES..."

        if status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null); then
            if [ "$status" = "200" ]; then
                echo -e "${GREEN}✅ Accessible (HTTP 200)${NC}"
                return 0
            else
                echo -e "${YELLOW}⚠️  HTTP $status (expected 200)${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  Connection failed${NC}"
        fi

        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $MAX_RETRIES ]; then
            echo "Waiting ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        fi
    done

    echo -e "${RED}❌ Failed after $MAX_RETRIES attempts${NC}"
    return 1
}

# Function to validate deployment
validate_deployment() {
    local base_url="$1"
    local name="$2"
    local pages=("$base_url"
                 "${base_url}1995hanxuema/"
                 "${base_url}1980/"
                 "${base_url}archive/")
    local descriptions=("Homepage"
                        "汗血马诗集"
                        "1980诗集"
                        "Archive")

    echo -e "\n${BLUE}========== Validating $name ==========${NC}"

    local success=0
    local total=0

    # Check base URL first
    if check_url "$base_url" "$name Homepage"; then
        success=$((success + 1))
    fi
    total=$((total + 1))

    # Check other pages
    for i in {1..3}; do
        total=$((total + 1))
        if check_url "${pages[$i]}" "$name ${descriptions[$i]}"; then
            success=$((success + 1))
        fi
    done

    echo -e "\n${BLUE}========== $name Summary ==========${NC}"
    echo -e "${GREEN}✅ Passed: $success / $total${NC}"

    if [ $success -eq $total ]; then
        echo -e "${GREEN}🎉 $name validation successful!${NC}"
        return 0
    elif [ $success -ge 2 ]; then
        echo -e "${YELLOW}⚠️  $name partial success${NC}"
        return 0
    else
        echo -e "${RED}❌ $name validation failed${NC}"
        return 1
    fi
}

# Main function
main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}    liyupoetry.com Deployment Validation${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "Starting at: $(date)"
    echo ""

    local overall_success=true
    local deployments=0
    local passed=0

    # Validate GitHub Pages
    if validate_deployment "https://lukethecat.github.io/" "GitHub Pages"; then
        passed=$((passed + 1))
    else
        overall_success=false
    fi
    deployments=$((deployments + 1))

    # Validate Cloudflare Pages
    echo -e "\n${BLUE}Checking Cloudflare Pages...${NC}"
    if check_url "https://www.liyupoetry.com/" "Cloudflare Test" >/dev/null 2>&1; then
        if validate_deployment "https://www.liyupoetry.com/" "Cloudflare Pages"; then
            passed=$((passed + 1))
        else
            overall_success=false
        fi
        deployments=$((deployments + 1))
    else
        echo -e "${YELLOW}⚠️  Cloudflare Pages not accessible${NC}"
        echo -e "${YELLOW}   (This is OK if not configured)${NC}"
    fi

    # Summary
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}          Validation Complete           ${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "Completed at: $(date)"
    echo ""
    echo -e "${BLUE}Results:${NC}"
    echo -e "  Deployments: $deployments"
    echo -e "  Passed: $passed"
    echo ""

    if [ "$overall_success" = true ]; then
        echo -e "${GREEN}🎉 Deployment validation successful!${NC}"
        echo ""
        echo -e "${BLUE}Key URLs:${NC}"
        echo "  GitHub Pages: https://lukethecat.github.io/"
        echo "  Cloudflare: https://www.liyupoetry.com/"
        echo ""
        echo -e "${BLUE}Next Steps:${NC}"
        echo "  1. Visit the websites"
        echo "  2. Test navigation"
        echo "  3. Check for broken links"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Some issues detected${NC}"
        echo ""
        echo -e "${BLUE}Troubleshooting:${NC}"
        echo "  1. Check GitHub Actions logs"
        echo "  2. Verify deployment settings"
        echo "  3. Wait 5-10 minutes (CDN propagation)"
        echo "  4. Run validation again"
        exit 1
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  -h, --help    Show this help"
    echo "  -q, --quiet   Quiet mode"
    echo "  -v, --verbose Verbose mode"
    echo ""
    echo "Examples:"
    echo "  $0            # Validate all deployments"
    echo "  $0 --quiet    # Quiet validation"
    echo ""
    echo "Exit codes:"
    echo "  0 - Success"
    echo "  1 - Issues found"
}

# Parse arguments
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    -q|--quiet)
        # Redirect output
        exec >/dev/null
        ;;
    -v|--verbose)
        set -x
        ;;
    "")
        # No arguments, continue
        ;;
    *)
        echo "Error: Unknown option $1"
        show_help
        exit 2
        ;;
esac

# Run main validation
main
