#!/bin/bash

# Cloudflare Pages 部署调试脚本
# 此脚本帮助诊断和解决 Cloudflare Pages 部署问题

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
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

# 显示标题
show_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Cloudflare Pages 部署调试工具${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# 检查环境
check_environment() {
    log_info "检查环境配置..."

    # 检查必要的工具
    local required_tools=("curl" "jq" "dig" "git")
    local missing_tools=()

    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done

    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_error "缺少必要工具: ${missing_tools[*]}"
        return 1
    fi

    log_success "所有必要工具已安装"

    # 检查当前目录
    if [ -f "config.toml" ] && [ -d ".github" ]; then
        log_success "在正确的项目目录中"
    else
        log_warning "可能不在项目根目录，某些检查可能失败"
    fi

    echo ""
}

# 检查 DNS 配置
check_dns() {
    log_info "检查 DNS 配置..."

    local domains=("lukethecat.github.io" "www.liyupoetry.com" "liyupoetry.com")

    for domain in "${domains[@]}"; do
        echo -n "  $domain: "
        local ips
        ips=$(dig +short "$domain" 2>/dev/null | head -3)

        if [ -n "$ips" ]; then
            echo -e "${GREEN}✅ 可解析${NC}"
            echo "$ips" | while read -r ip; do
                echo "    → $ip"
            done

            # 检查是否是 Cloudflare IP
            if [[ "$domain" == *"liyupoetry.com"* ]]; then
                if echo "$ips" | grep -q -E "^(104\.|172\.|108\.)"; then
                    log_debug "    指向 Cloudflare CDN"
                fi
            fi
        else
            echo -e "${RED}❌ 无法解析${NC}"
        fi
    done

    echo ""
}

# 检查网站可访问性
check_website_accessibility() {
    log_info "检查网站可访问性..."

    declare -A urls=(
        ["GitHub Pages 首页"]="https://lukethecat.github.io/"
        ["GitHub Pages 汗血马"]="https://lukethecat.github.io/1995hanxuema/"
        ["GitHub Pages 1980"]="https://lukethecat.github.io/1980/"
        ["Cloudflare Pages 首页"]="https://www.liyupoetry.com/"
        ["Cloudflare Pages 汗血马"]="https://www.liyupoetry.com/1995hanxuema/"
        ["Cloudflare Pages 1980"]="https://www.liyupoetry.com/1980/"
    )

    for desc in "${!urls[@]}"; do
        url="${urls[$desc]}"
        echo -n "  $desc ($(echo "$url" | sed 's|https://||')): "

        # 获取 HTTP 状态码
        local status_code
        status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")

        # 获取标题（如果可访问）
        local title=""
        if [ "$status_code" = "200" ]; then
            title=$(curl -s --max-time 10 "$url" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//' | head -1)
        fi

        case $status_code in
            200)
                echo -e "${GREEN}✅ HTTP 200${NC}"
                if [ -n "$title" ]; then
                    echo "      标题: \"$title\""
                fi
                ;;
            404)
                echo -e "${RED}❌ HTTP 404 (页面未找到)${NC}"
                ;;
            000)
                echo -e "${YELLOW}⚠️  连接超时${NC}"
                ;;
            *)
                echo -e "${YELLOW}⚠️  HTTP $status_code${NC}"
                ;;
        esac
    done

    echo ""
}

# 检查内容差异
check_content_differences() {
    log_info "检查 GitHub Pages 和 Cloudflare Pages 内容差异..."

    local gh_url="https://lukethecat.github.io/"
    local cf_url="https://www.liyupoetry.com/"

    echo -n "  比较首页内容... "

    # 获取标题
    local gh_title
    gh_title=$(curl -s --max-time 10 "$gh_url" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//' | head -1)
    local cf_title
    cf_title=$(curl -s --max-time 10 "$cf_url" | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//' | head -1)

    if [ "$gh_title" = "$cf_title" ]; then
        echo -e "${GREEN}✅ 标题一致: \"$gh_title\"${NC}"
    else
        echo -e "${YELLOW}⚠️  标题不一致${NC}"
        echo "      GitHub Pages: \"$gh_title\""
        echo "      Cloudflare Pages: \"$cf_title\""
    fi

    # 检查页脚问候语
    echo -n "  检查页脚问候语... "
    local gh_greeting
    gh_greeting=$(curl -s --max-time 10 "$gh_url" | grep -o 'class="greeting"[^>]*>[^<]*<' | sed 's/.*>//;s/<//' | head -1)
    local cf_greeting
    cf_greeting=$(curl -s --max-time 10 "$cf_url" | grep -o 'class="greeting"[^>]*>[^<]*<' | sed 's/.*>//;s/<//' | head -1)

    if [ -n "$gh_greeting" ] && [ -n "$cf_greeting" ]; then
        if [[ "$cf_greeting" =~ ^(Servus|Aloha|Howdy|Ahoi|Ohai|Yo)$ ]]; then
            echo -e "${RED}❌ Cloudflare 显示西方问候语: \"$cf_greeting\"${NC}"
            echo "      GitHub 显示: \"$gh_greeting\""
        elif [ "$gh_greeting" = "$cf_greeting" ]; then
            echo -e "${GREEN}✅ 问候语一致: \"$gh_greeting\"${NC}"
        else
            echo -e "${YELLOW}⚠️  问候语不一致${NC}"
            echo "      GitHub: \"$gh_greeting\""
            echo "      Cloudflare: \"$cf_greeting\""
        fi
    else
        echo -e "${YELLOW}⚠️  无法获取问候语${NC}"
    fi

    echo ""
}

# 检查 GitHub Actions 配置
check_github_actions() {
    log_info "检查 GitHub Actions 配置..."

    if [ -f ".github/workflows/ci.yml" ]; then
        log_success "CI/CD 工作流文件存在"

        # 检查 Cloudflare 配置部分
        if grep -q "CF_API_TOKEN" ".github/workflows/ci.yml" && \
           grep -q "CF_ACCOUNT_ID" ".github/workflows/ci.yml"; then
            log_success "工作流中包含 Cloudflare Pages 部署配置"

            # 检查部署步骤
            if grep -q "deploy-to-cloudflare" ".github/workflows/ci.yml"; then
                log_success "找到 Cloudflare Pages 部署任务"
            else
                log_warning "未找到 Cloudflare Pages 部署任务"
            fi
        else
            log_warning "工作流中未找到 Cloudflare Secrets 引用"
        fi
    else
        log_error "CI/CD 工作流文件不存在"
    fi

    echo ""
}

# 检查本地构建
check_local_build() {
    log_info "检查本地构建..."

    if command -v zola &> /dev/null; then
        echo -n "  Zola 版本: "
        zola --version 2>/dev/null || echo "未知"

        # 尝试构建
        echo -n "  测试构建... "
        if make clean &> /dev/null && make content &> /dev/null; then
            echo -e "${GREEN}✅ 构建成功${NC}"

            # 检查构建输出
            if [ -d "public" ] && [ -f "public/index.html" ]; then
                local page_count
                page_count=$(find public -name "index.html" | wc -l)
                log_success "生成 $page_count 个页面"

                # 检查关键页面
                local key_pages=("public/1995hanxuema/index.html" "public/1980/index.html" "public/archive/index.html")
                for page in "${key_pages[@]}"; do
                    if [ -f "$page" ]; then
                        echo "    ✅ $(basename "$(dirname "$page")") 页面存在"
                    else
                        echo "    ❌ $(basename "$(dirname "$page")") 页面缺失"
                    fi
                done
            else
                log_error "构建输出目录异常"
            fi
        else
            echo -e "${RED}❌ 构建失败${NC}"
        fi
    else
        log_warning "Zola 未安装，跳过构建测试"
    fi

    echo ""
}

# 检查 Cloudflare Pages 项目
check_cloudflare_pages() {
    log_info "检查 Cloudflare Pages 项目状态..."

    echo "  注意: 此检查需要有效的 API Token"
    echo "  如果已配置 GitHub Secrets，部署应该自动进行"

    # 提供诊断命令
    cat << 'EOF'

  手动检查 Cloudflare Pages:
  1. 登录 Cloudflare Dashboard: https://dash.cloudflare.com
  2. 转到 Pages: https://dash.cloudflare.com/?to=/:account/pages
  3. 查找项目 "liyupoetry"
  4. 检查部署历史记录

  如果项目不存在，可能需要:
  1. 手动创建项目
  2. 或确保 API Token 有创建项目的权限

EOF

    echo ""
}

# 提供解决方案建议
provide_solutions() {
    log_info "问题诊断与解决方案"
    echo -e "${CYAN}========================================${NC}"

    # 基于检查结果提供建议
    echo ""
    echo "基于当前检查，可能的问题和解决方案:"
    echo ""

    echo "1. ${GREEN}Cloudflare Pages 显示旧内容${NC}"
    echo "   → 可能原因: Cloudflare Pages 部署失败或未触发"
    echo "   → 解决方案:"
    echo "     a. 检查 GitHub Actions 日志中的 Cloudflare 部署步骤"
    echo "     b. 验证 GitHub Secrets (CF_API_TOKEN, CF_ACCOUNT_ID) 是否正确"
    echo "     c. 手动触发部署: git commit & push"
    echo ""

    echo "2. ${GREEN}Cloudflare Pages 部分页面 404${NC}"
    echo "   → 可能原因: 部署不完整或路由配置问题"
    echo "   → 解决方案:"
    echo "     a. 检查本地构建是否生成所有页面"
    echo "     b. 检查 Cloudflare Pages 项目设置中的构建目录"
    echo "     c. 确保所有文件都部署到 public/ 目录"
    echo ""

    echo "3. ${GREEN}内容不一致（标题/问候语不同）${NC}"
    echo "   → 可能原因: 部署了不同版本的代码"
    echo "   → 解决方案:"
    echo "     a. 确保 Cloudflare Pages 部署最新代码"
    echo "     b. 清除 Cloudflare 缓存"
    echo "     c. 检查构建过程中是否有缓存问题"
    echo ""

    echo "4. ${GREEN}快速修复方案${NC}"
    echo "   → 选项 A: 重新配置 Cloudflare Pages"
    echo "       运行: ./setup-cloudflare-pages.sh"
    echo "   → 选项 B: 使用 GitHub Pages"
    echo "       按照 DNS_CONFIGURATION.md 更新 DNS"
    echo "   → 选项 C: 手动部署"
    echo "       登录 Cloudflare Dashboard 手动上传"
    echo ""

    echo -e "${CYAN}========================================${NC}"
}

# 运行完整诊断
run_full_diagnostic() {
    show_header
    check_environment
    check_dns
    check_website_accessibility
    check_content_differences
    check_github_actions
    check_local_build
    check_cloudflare_pages
    provide_solutions
}

# 显示使用说明
show_usage() {
    cat << 'EOF'
使用方法:
  ./debug-cloudflare-deployment.sh [选项]

选项:
  --full          运行完整诊断（默认）
  --dns           仅检查 DNS 配置
  --web           仅检查网站可访问性
  --content       仅检查内容差异
  --github        仅检查 GitHub Actions 配置
  --build         仅检查本地构建
  --help          显示此帮助信息

示例:
  ./debug-cloudflare-deployment.sh --full
  ./debug-cloudflare-deployment.sh --dns --web
  ./debug-cloudflare-deployment.sh --content

EOF
}

# 主函数
main() {
    local check_dns=false
    local check_web=false
    local check_content=false
    local check_github=false
    local check_build=false
    local run_full=true

    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            --full)
                run_full=true
                shift
                ;;
            --dns)
                check_dns=true
                run_full=false
                shift
                ;;
            --web)
                check_web=true
                run_full=false
                shift
                ;;
            --content)
                check_content=true
                run_full=false
                shift
                ;;
            --github)
                check_github=true
                run_full=false
                shift
                ;;
            --build)
                check_build=true
                run_full=false
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                echo "未知选项: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    if [ "$run_full" = true ]; then
        run_full_diagnostic
    else
        show_header

        if [ "$check_dns" = true ]; then
            check_dns
        fi

        if [ "$check_web" = true ]; then
            check_website_accessibility
        fi

        if [ "$check_content" = true ]; then
            check_content_differences
        fi

        if [ "$check_github" = true ]; then
            check_github_actions
        fi

        if [ "$check_build" = true ]; then
            check_local_build
        fi

        provide_solutions
    fi

    echo ""
    log_info "调试完成。请根据建议采取相应措施。"
    echo ""
    echo "附加工具:"
    echo "  ./check-deployment-status.sh    - 检查部署状态"
    echo "  ./setup-cloudflare-pages.sh     - 配置 Cloudflare Pages"
    echo "  ./validate_deployment.sh        - 验证部署"
    echo ""
}

# 运行主函数
main "$@"
