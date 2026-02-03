#!/bin/bash

# Cloudflare Pages 部署设置脚本
# 此脚本帮助配置 Cloudflare Pages 自动部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Cloudflare Pages 部署设置脚本${NC}"
echo "=========================================="
echo ""

# 检查必要工具
check_tools() {
    echo -e "${BLUE}🔍 检查必要工具...${NC}"

    local missing_tools=()

    for tool in curl jq git; do
        if ! command -v $tool &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done

    if [ ${#missing_tools[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ 所有必要工具已安装${NC}"
    else
        echo -e "${YELLOW}⚠️  缺少以下工具: ${missing_tools[*]}${NC}"
        echo "请安装后再运行此脚本。"
        exit 1
    fi
    echo ""
}

# 显示当前状态
show_current_status() {
    echo -e "${BLUE}📊 当前部署状态${NC}"
    echo "-----------------"

    # 检查 GitHub Secrets
    echo -n "GitHub Secrets 配置: "
    if [ -f ".github/workflows/ci.yml" ]; then
        echo -e "${GREEN}✅ CI/CD 工作流已配置${NC}"
    else
        echo -e "${RED}❌ CI/CD 工作流未找到${NC}"
    fi

    # 检查本地构建
    echo -n "本地构建测试: "
    if command -v zola &> /dev/null; then
        echo -e "${GREEN}✅ Zola 已安装${NC}"
    else
        echo -e "${YELLOW}⚠️  Zola 未安装${NC}"
    fi

    echo ""
}

# 显示配置指南
show_configuration_guide() {
    echo -e "${BLUE}📝 Cloudflare API Token 配置指南${NC}"
    echo "--------------------------------------"
    echo ""
    echo "请按照以下步骤配置 Cloudflare API Token:"
    echo ""
    echo "1. ${GREEN}登录 Cloudflare Dashboard${NC}"
    echo "   访问: https://dash.cloudflare.com"
    echo ""
    echo "2. ${GREEN}创建 API Token${NC}"
    echo "   a. 点击右上角头像 → My Profile"
    echo "   b. 选择 API Tokens 标签页"
    echo "   c. 点击 Create Token"
    echo "   d. 选择 Custom token"
    echo ""
    echo "3. ${GREEN}配置权限${NC}"
    echo "   必需权限:"
    echo "   - Account: Cloudflare Pages → Edit"
    echo "   - Account: Account Settings → Read"
    echo "   - Zone: DNS → Edit"
    echo "   - Zone: SSL and Certificates → Edit"
    echo ""
    echo "4. ${GREEN}配置资源范围${NC}"
    echo "   - Account Resources: Include → Specific account (选择你的账户)"
    echo "   - Zone Resources: Include → Specific zone (选择 liyupoetry.com)"
    echo ""
    echo "5. ${GREEN}创建并保存 Token${NC}"
    echo "   - 点击 Create Token"
    echo "   - ${RED}立即复制 Token 值${NC} (只显示一次!)"
    echo ""
    echo "6. ${GREEN}获取 Account ID${NC}"
    echo "   - 在 Cloudflare Dashboard 首页查看 Account ID"
    echo "   - 或点击域名，在页面右下角查看"
    echo ""
}

# 显示 GitHub Secrets 配置指南
show_github_secrets_guide() {
    echo -e "${BLUE}🚀 GitHub Secrets 配置指南${NC}"
    echo "--------------------------------"
    echo ""
    echo "1. ${GREEN}访问 GitHub 仓库设置${NC}"
    echo "   访问: https://github.com/lukethecat/lukethecat.github.io/settings/secrets/actions"
    echo ""
    echo "2. ${GREEN}添加 Secrets${NC}"
    echo "   a. 点击 New repository secret"
    echo "   b. 添加第一个 Secret:"
    echo "      - Name: CF_API_TOKEN"
    echo "      - Value: 复制的 Cloudflare API Token"
    echo "   c. 添加第二个 Secret:"
    echo "      - Name: CF_ACCOUNT_ID"
    echo "      - Value: 你的 Cloudflare Account ID"
    echo ""
    echo "3. ${GREEN}验证 Secrets${NC}"
    echo "   确保看到两个 Secrets:"
    echo "   - ✅ CF_API_TOKEN (隐藏值)"
    echo "   - ✅ CF_ACCOUNT_ID (显示值)"
    echo ""
}

# 测试 API Token
test_api_token() {
    echo -e "${BLUE}🔍 测试 API Token 配置${NC}"
    echo "-------------------------"
    echo ""

    read -p "请输入 Cloudflare API Token: " CF_API_TOKEN
    read -p "请输入 Cloudflare Account ID: " CF_ACCOUNT_ID

    echo ""
    echo "正在测试 API Token..."

    # 测试 Token 有效性
    echo -n "1. 验证 Token 有效性... "
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json")

    if echo "$response" | jq -e '.success == true' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 有效${NC}"
    else
        echo -e "${RED}❌ 无效${NC}"
        echo "错误信息:"
        echo "$response" | jq .
        return 1
    fi

    # 测试账户访问
    echo -n "2. 测试账户访问... "
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json")

    if echo "$response" | jq -e '.success == true' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 成功${NC}"
        account_name=$(echo "$response" | jq -r '.result.name')
        echo "   账户名称: $account_name"
    else
        echo -e "${RED}❌ 失败${NC}"
        return 1
    fi

    # 测试域名访问
    echo -n "3. 测试域名访问... "
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=liyupoetry.com" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json")

    if echo "$response" | jq -e '.success == true and .result | length > 0' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 成功${NC}"
        zone_id=$(echo "$response" | jq -r '.result[0].id')
        zone_name=$(echo "$response" | jq -r '.result[0].name')
        echo "   域名: $zone_name"
        echo "   Zone ID: $zone_id"
    else
        echo -e "${YELLOW}⚠️  域名未找到或无权访问${NC}"
    fi

    # 测试 Pages 权限
    echo -n "4. 测试 Pages 权限... "
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json")

    if echo "$response" | jq -e '.success == true' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 成功${NC}"
    else
        echo -e "${YELLOW}⚠️  可能缺少 Pages 权限${NC}"
    fi

    echo ""
    echo -e "${GREEN}🎉 API Token 测试完成${NC}"
    echo ""
    echo "请将以下信息添加到 GitHub Secrets:"
    echo "CF_API_TOKEN: $CF_API_TOKEN"
    echo "CF_ACCOUNT_ID: $CF_ACCOUNT_ID"
    echo ""
}

# 触发部署测试
trigger_deployment_test() {
    echo -e "${BLUE}🚀 触发部署测试${NC}"
    echo "-----------------"
    echo ""

    echo "1. ${GREEN}提交更改到 GitHub${NC}"
    echo "   运行以下命令:"
    echo "   git add ."
    echo "   git commit -m '测试 Cloudflare Pages 部署'"
    echo "   git push"
    echo ""

    echo "2. ${GREEN}监控部署状态${NC}"
    echo "   访问: https://github.com/lukethecat/lukethecat.github.io/actions"
    echo ""

    echo "3. ${GREEN}验证部署结果${NC}"
    echo "   部署完成后，运行:"
    echo "   ./check-deployment-status.sh"
    echo ""
}

# 显示快速开始指南
show_quick_start() {
    echo -e "${BLUE}⚡ 快速开始指南${NC}"
    echo "----------------"
    echo ""
    echo "1. ${GREEN}配置 Cloudflare API Token${NC}"
    echo "   按照上述指南创建 Token"
    echo ""
    echo "2. ${GREEN}配置 GitHub Secrets${NC}"
    echo "   添加 CF_API_TOKEN 和 CF_ACCOUNT_ID"
    echo ""
    echo "3. ${GREEN}触发部署${NC}"
    echo "   提交更改到 main 分支"
    echo ""
    echo "4. ${GREEN}验证部署${NC}"
    echo "   运行验证脚本检查状态"
    echo ""
}

# 显示菜单
show_menu() {
    echo -e "${BLUE}📋 菜单选项${NC}"
    echo "-----------"
    echo ""
    echo "1. 显示当前状态"
    echo "2. 显示 Cloudflare API Token 配置指南"
    echo "3. 显示 GitHub Secrets 配置指南"
    echo "4. 测试 API Token"
    echo "5. 触发部署测试"
    echo "6. 显示快速开始指南"
    echo "7. 退出"
    echo ""
}

# 主函数
main() {
    check_tools

    while true; do
        show_menu
        read -p "请选择选项 (1-7): " choice

        case $choice in
            1)
                show_current_status
                ;;
            2)
                show_configuration_guide
                ;;
            3)
                show_github_secrets_guide
                ;;
            4)
                test_api_token
                ;;
            5)
                trigger_deployment_test
                ;;
            6)
                show_quick_start
                ;;
            7)
                echo -e "${GREEN}👋 退出脚本${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ 无效选项，请重新选择${NC}"
                ;;
        esac

        echo ""
        read -p "按 Enter 键继续..."
        echo ""
    done
}

# 运行主函数
main
```

这个脚本提供了完整的 Cloudflare Pages 部署设置功能，包括：

1. **工具检查** - 验证必要的命令行工具
2. **状态显示** - 显示当前部署配置状态
3. **配置指南** - 详细的 Cloudflare API Token 配置步骤
4. **GitHub Secrets 指南** - 如何配置 GitHub Secrets
5. **API Token 测试** - 交互式测试 API Token 权限
6. **部署测试** - 触发和监控部署的指南
7. **快速开始** - 简化的部署流程

使用这个脚本，你可以轻松地配置 Cloudflare Pages 自动部署，解决当前 `www.liyupoetry.com` 显示旧内容的问题。
