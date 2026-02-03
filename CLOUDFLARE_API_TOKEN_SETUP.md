# Cloudflare API Token 配置指南 - Cloudflare Pages 自动部署

## 📋 概述

本文档提供详细的 Cloudflare User API Token 配置指南，用于启用 GitHub Actions 自动部署到 Cloudflare Pages。

## 🎯 目标

配置 Cloudflare API Token，使 GitHub Actions 能够：
1. 自动构建和部署网站到 Cloudflare Pages
2. 管理 `www.liyupoetry.com` 域名的部署
3. 实现 CI/CD 自动化工作流

## 🔧 配置步骤

### 步骤 1: 登录 Cloudflare Dashboard

1. 访问 Cloudflare Dashboard: https://dash.cloudflare.com
2. 使用你的 Cloudflare 账户登录
3. 确保你的域名 `liyupoetry.com` 已经在 Cloudflare 账户中

### 步骤 2: 创建 API Token

1. 点击右上角头像 → **My Profile**
2. 选择 **API Tokens** 标签页
3. 点击 **Create Token** 按钮

### 步骤 3: 选择 Token 模板

推荐使用 **Custom token** 模板以获得更精细的权限控制：

1. 点击 **Create Custom Token**
2. 输入 Token 名称（建议）:
   ```
   GitHub Actions - liyupoetry.com Deployment
   ```

### 步骤 4: 配置权限

为 API Token 配置以下权限：

#### 1. Account 权限

| 权限类型 | 权限 | 访问级别 | 说明 |
|----------|------|----------|------|
| **Account** | **Cloudflare Pages** | **Edit** | 允许创建、更新和删除 Pages 项目 |
| **Account** | **Account Settings** | **Read** | 读取账户信息，获取 Account ID |
| **Account** | **User** | **Read** | 读取用户信息 |

#### 2. Zone 权限

| 权限类型 | 权限 | 访问级别 | 说明 |
|----------|------|----------|------|
| **Zone** | **Zone** | **Read** | 读取域名信息 |
| **Zone** | **DNS** | **Edit** | 管理 DNS 记录（用于自定义域名） |
| **Zone** | **SSL and Certificates** | **Edit** | 管理 SSL 证书 |

### 步骤 5: 配置资源范围

#### Account Resources（账户资源）
- 选择 **Include** → **Specific account**
- 选择你的 Cloudflare 账户（通常只有一个）

#### Zone Resources（域名资源）
- 选择 **Include** → **Specific zone**
- 选择 `liyupoetry.com` 域名

### 步骤 6: 配置 TTL 和限制（可选）

1. **TTL**: 保持默认（永不过期）或设置为合适的期限
2. **IP 限制**: 可以留空，或限制为 GitHub Actions 的 IP 范围
3. **Not Before**: 立即生效

### 步骤 7: 创建并保存 Token

1. 点击 **Continue to summary**
2. 仔细检查权限配置：
   - ✅ Account: Cloudflare Pages - Edit
   - ✅ Account: Account Settings - Read
   - ✅ Account: User - Read
   - ✅ Zone: Zone - Read
   - ✅ Zone: DNS - Edit
   - ✅ Zone: SSL and Certificates - Edit
3. 点击 **Create Token**
4. **立即复制 Token 值**（非常重要！Token 只显示一次）

## 🔐 保存 API Token

将复制的 API Token 安全保存：

1. **立即保存到密码管理器**（如 1Password、LastPass、Bitwarden）
2. **不要**将 Token 提交到 Git 仓库
3. **不要**将 Token 分享给他人
4. **不要**将 Token 存储在明文文件中

## 📝 获取 Account ID

你还需要获取 Cloudflare Account ID：

1. 在 Cloudflare Dashboard 首页
2. 查看右侧边栏，找到 **Account ID**
3. 或者点击任意域名，在页面右下角查看 **Account ID**
4. Account ID 格式：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 🚀 配置 GitHub Secrets

### 步骤 1: 访问 GitHub 仓库设置

1. 打开仓库: https://github.com/lukethecat/lukethecat.github.io
2. 点击 **Settings** 标签页
3. 左侧菜单选择 **Secrets and variables** → **Actions**

### 步骤 2: 添加 Secrets

点击 **New repository secret** 添加以下两个 secrets：

#### Secret 1: CF_API_TOKEN
- **Name**: `CF_API_TOKEN`
- **Value**: 步骤 7 中复制的 API Token
- **Description**: Cloudflare API Token for Pages deployment

#### Secret 2: CF_ACCOUNT_ID
- **Name**: `CF_ACCOUNT_ID`
- **Value**: 你的 Cloudflare Account ID
- **Description**: Cloudflare Account ID for Pages deployment

### 步骤 3: 验证 Secrets

添加后，你应该看到两个 secrets：
- ✅ `CF_API_TOKEN` (隐藏值)
- ✅ `CF_ACCOUNT_ID` (显示值)

## 🔍 验证 API Token 权限

创建测试脚本验证 Token 权限：

```bash
#!/bin/bash
# test-cloudflare-token.sh

CF_API_TOKEN="你的_API_Token"
CF_ACCOUNT_ID="你的_Account_ID"

echo "🔍 Testing Cloudflare API Token permissions..."

# 测试 1: 验证 Token 有效性
echo "1. Verifying token validity..."
curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" | jq .

# 测试 2: 获取账户信息
echo "2. Getting account information..."
curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" | jq .

# 测试 3: 获取域名信息
echo "3. Getting zone information..."
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=liyupoetry.com" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.result[0].id')

echo "Zone ID for liyupoetry.com: $ZONE_ID"

# 测试 4: 检查 Pages 权限
echo "4. Checking Pages projects..."
curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" | jq .
```

## ⚙️ GitHub Actions 工作流配置

GitHub Actions 工作流 (`.github/workflows/ci.yml`) 已经配置了 Cloudflare Pages 部署：

```yaml
deploy-to-cloudflare:
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  needs: build
  steps:
    - name: 🔍 Check Cloudflare configuration
      id: check-cloudflare
      run: |
        echo "Checking Cloudflare configuration..."
        if [ -z "${{ secrets.CF_API_TOKEN }}" ]; then
          echo "❌ CF_API_TOKEN secret is not configured"
          echo "status=skipped" >> $GITHUB_OUTPUT
        elif [ -z "${{ secrets.CF_ACCOUNT_ID }}" ]; then
          echo "❌ CF_ACCOUNT_ID secret is not configured"
          echo "status=skipped" >> $GITHUB_OUTPUT
        else
          echo "✅ Cloudflare configuration detected"
          echo "status=ready" >> $GITHUB_OUTPUT
        fi

    - name: 🚀 Deploy to Cloudflare Pages
      if: steps.check-cloudflare.outputs.status == 'ready'
      uses: cloudflare/pages-action@v1
      with:
        apiToken: ${{ secrets.CF_API_TOKEN }}
        accountId: ${{ secrets.CF_ACCOUNT_ID }}
        projectName: liyupoetry
        directory: ./public
```

## 🎯 创建 Cloudflare Pages 项目

如果项目不存在，API Token 会自动创建。但建议先手动创建：

### 手动创建项目步骤：

1. 访问 Cloudflare Pages: https://dash.cloudflare.com/?to=/:account/pages
2. 点击 **Create a project**
3. 选择 **Connect to Git**
4. 授权访问 GitHub
5. 选择仓库: `lukethecat/lukethecat.github.io`
6. 配置项目设置：

#### 项目配置详情：

| 设置项 | 值 | 说明 |
|--------|-----|------|
| **Project name** | `liyupoetry` | 必须与 CI 配置一致 |
| **Production branch** | `main` | 主分支 |
| **Framework preset** | `None` | 自定义构建 |
| **Build command** | `make clean && make content` | Zola 构建命令 |
| **Build output directory** | `public` | 构建输出目录 |
| **Root directory** | (留空) | 仓库根目录 |
| **Environment variables** | (无) | 不需要额外变量 |

## 🔗 配置自定义域名

### 自动配置（通过 API）：
GitHub Actions 会自动配置域名，但需要 DNS Edit 权限。

### 手动配置：
1. 在 Cloudflare Pages 项目页面
2. 点击 **Settings** → **Domains**
3. 点击 **Add custom domain**
4. 输入 `www.liyupoetry.com`
5. 按照提示配置 DNS 记录

## ✅ 验证部署

### 触发首次部署：
1. 提交更改到 main 分支
2. 或手动触发 GitHub Actions:
   - 访问: https://github.com/lukethecat/lukethecat.github.io/actions/workflows/ci.yml
   - 点击 **Run workflow**
   - 选择 **main** 分支
   - 点击 **Run workflow**

### 验证步骤：
1. 检查 GitHub Actions 运行状态（应为绿色 ✅）
2. 访问 Cloudflare Pages 部署日志
3. 验证网站可访问性：
   ```bash
   # 验证所有关键页面
   for url in "https://www.liyupoetry.com/" \
              "https://www.liyupoetry.com/1995hanxuema/" \
              "https://www.liyupoetry.com/1980/" \
              "https://www.liyupoetry.com/archive/"; do
       status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
       echo "$url: $status"
   done
   ```

## 🔧 故障排除

### 常见问题 1: 权限不足
**症状**: API 返回 403 错误
**解决方案**:
1. 检查 Token 权限配置
2. 确保有 Pages: Edit 权限
3. 确保 Token 关联到正确的账户和域名

### 常见问题 2: 项目不存在
**症状**: 部署失败，提示项目不存在
**解决方案**:
1. 手动创建 Cloudflare Pages 项目
2. 确保项目名称匹配 (`liyupoetry`)
3. 或确保 Token 有创建项目的权限

### 常见问题 3: DNS 配置失败
**症状**: 域名无法访问
**解决方案**:
1. 检查 Token 是否有 DNS: Edit 权限
2. 手动配置 DNS 记录
3. 检查域名是否在 Cloudflare 账户中

### 常见问题 4: 构建失败
**症状**: GitHub Actions 构建失败
**解决方案**:
1. 检查构建命令是否正确
2. 检查 `public` 目录是否存在
3. 查看详细的构建日志

## 🔐 安全最佳实践

1. **最小权限原则**: 只授予必要的权限
2. **定期轮换**: 每 3-6 个月更新 API Token
3. **访问监控**: 定期检查 API Token 使用日志
4. **安全存储**: 使用密码管理器存储 Token
5. **环境隔离**: 为不同环境使用不同的 Token

## 📊 监控和维护

### 定期检查清单:
- [ ] API Token 有效期
- [ ] GitHub Secrets 配置
- [ ] Cloudflare Pages 项目状态
- [ ] 部署成功率
- [ ] 网站可访问性

### 更新和维护:
1. **Token 轮换**: 创建新 Token → 更新 GitHub Secrets → 删除旧 Token
2. **权限审查**: 定期审查和调整权限
3. **日志监控**: 查看 Cloudflare API 使用日志

## 🆘 支持资源

### 官方文档:
- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Cloudflare Pages API](https://developers.cloudflare.com/pages/platform/api/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

### 故障排除:
- [Cloudflare Status](https://www.cloudflarestatus.com/)
- [GitHub Status](https://www.githubstatus.com/)
- [Cloudflare Community](https://community.cloudflare.com/)

### 联系支持:
- Cloudflare Dashboard 中的支持选项
- GitHub Issues 报告问题

## 🎉 成功指标

配置成功后，你应该看到:

1. ✅ GitHub Actions 自动触发部署
2. ✅ Cloudflare Pages 显示最新部署
3. ✅ `www.liyupoetry.com` 显示正确内容
4. ✅ 所有诗歌页面可访问 (HTTP 200)
5. ✅ 无西方内容残留

## 🔄 更新日志

| 日期 | 版本 | 变更说明 |
|------|------|----------|
| 2026-02-04 | 1.0 | 初始版本，完整 API Token 配置指南 |
| 2026-02-04 | 1.1 | 添加故障排除和安全最佳实践 |

---

**重要提示**: 完成配置后，运行 `./check-deployment-status.sh` 验证部署状态，确保 `www.liyupoetry.com` 显示正确的中文诗歌内容。