#!/bin/bash

echo "🔍 检查 GitHub Secrets 和 Cloudflare Pages 部署状态"
echo "=================================================="
echo ""

echo "1. 检查 GitHub Actions 工作流配置..."
if [ -f ".github/workflows/ci.yml" ]; then
    echo "   ✅ CI/CD 工作流文件存在"
    
    # 检查 Cloudflare 相关配置
    echo "   检查 Cloudflare 配置:"
    if grep -q "CF_API_TOKEN" ".github/workflows/ci.yml"; then
        echo "     ✅ 引用 CF_API_TOKEN"
    else
        echo "     ❌ 未引用 CF_API_TOKEN"
    fi
    
    if grep -q "CF_ACCOUNT_ID" ".github/workflows/ci.yml"; then
        echo "     ✅ 引用 CF_ACCOUNT_ID"
    else
        echo "     ❌ 未引用 CF_ACCOUNT_ID"
    fi
    
    if grep -q "deploy-to-cloudflare" ".github/workflows/ci.yml"; then
        echo "     ✅ 有 Cloudflare 部署任务"
    else
        echo "     ❌ 无 Cloudflare 部署任务"
    fi
else
    echo "   ❌ CI/CD 工作流文件不存在"
fi

echo ""
echo "2. 检查当前部署状态..."
echo "   GitHub Pages (lukethecat.github.io):"
curl -s -o /dev/null -w "     状态码: %{http_code}\n" https://lukethecat.github.io/
echo "   标题: $(curl -s https://lukethecat.github.io/ | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//')"

echo ""
echo "   Cloudflare Pages (www.liyupoetry.com):"
curl -s -o /dev/null -w "     状态码: %{http_code}\n" https://www.liyupoetry.com/
echo "   标题: $(curl -s https://www.liyupoetry.com/ | grep -o '<title>[^<]*</title>' | sed 's/<title>//;s/<\/title>//')"

echo ""
echo "3. 关键页面检查..."
echo "   页面                        GitHub Pages    Cloudflare Pages"
echo "   -----------------------------------------------------------"

pages=("" "1995hanxuema/" "1980/" "archive/")
for page in "${pages[@]}"; do
    gh_status=$(curl -s -o /dev/null -w "%{http_code}" "https://lukethecat.github.io/$page")
    cf_status=$(curl -s -o /dev/null -w "%{http_code}" "https://www.liyupoetry.com/$page")
    
    case $page in
        "") page_name="首页" ;;
        "1995hanxuema/") page_name="汗血马诗集" ;;
        "1980/") page_name="1980诗集" ;;
        "archive/") page_name="归档页面" ;;
    esac
    
    printf "   %-15s %12s %18s\n" "$page_name" "HTTP $gh_status" "HTTP $cf_status"
done

echo ""
echo "4. 问题诊断..."
echo ""

if curl -s https://www.liyupoetry.com/ | grep -q "西域诗魂"; then
    echo "   ❌ Cloudflare Pages 显示旧版本内容 ('西域诗魂｜李瑜和他的作品')"
    echo "   ✅ GitHub Pages 显示正确内容 ('李瑜诗歌')"
    echo ""
    echo "   可能原因:"
    echo "   a. Cloudflare Pages 部署失败"
    echo "   b. GitHub Secrets 配置不正确"
    echo "   c. Cloudflare Pages 项目不存在"
    echo "   d. API Token 权限不足"
fi

echo ""
echo "5. 解决方案..."
echo "   a. 检查 GitHub Actions 日志:"
echo "      访问: https://github.com/lukethecat/lukethecat.github.io/actions"
echo "      查看最新的工作流运行，检查 Cloudflare 部署步骤"
echo ""
echo "   b. 验证 GitHub Secrets:"
echo "      1. 访问: https://github.com/lukethecat/lukethecat.github.io/settings/secrets/actions"
echo "      2. 确认 CF_API_TOKEN 和 CF_ACCOUNT_ID 存在"
echo "      3. 确保 Token 有正确的权限"
echo ""
echo "   c. 手动触发重新部署:"
echo "      git add . && git commit -m '重新触发部署' && git push"
echo ""
echo "   d. 检查 Cloudflare Pages 项目:"
echo "      1. 登录: https://dash.cloudflare.com"
echo "      2. 转到 Pages"
echo "      3. 检查 'liyupoetry' 项目状态"
