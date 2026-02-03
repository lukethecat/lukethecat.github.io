# Cloudflare Pages 部署设置指南

## 📋 概述

本文档提供完整的 Cloudflare Pages 部署配置指南，用于将 liyupoetry.com 网站部署到 Cloudflare Pages。

## 🎯 当前状态

- **网站域名**: `https://www.liyupoetry.com`
- **GitHub 仓库**: `lukethecat/lukethecat.github.io`
- **构建工具**: Zola 静态网站生成器
- **部署目标**: Cloudflare Pages
- **项目名称**: `liyupoetry`

## 🔧 配置步骤

### 1. 创建 Cloudflare API Token

1. 登录 Cloudflare Dashboard: https://dash.cloudflare.com
2. 点击右上角头像 → **My Profile**
3. 选择 **API Tokens** 标签页
4. 点击 **Create Token** 按钮
5. 选择 **Custom token** 模板

#### 权限配置

为 API Token 配置以下权限：

| 权限类型 | 权限 | 访问级别 | 说明 |
|----------|------|----------|------|
| **Account** | **Cloudflare Pages** | **Edit** | 允许部署到 Cloudflare Pages |
| **Account** | **Account Settings** | **Read** | 读取账户信息 |
| **Zone** | **Cache Purge** | **Purge** | 清除 CDN 缓存 |

#### 资源配置

- **Account Resources**: Include → **Specific account** → 选择你的账户
- **Zone Resources**: Include → **Specific zone** → 选择 `liyupoetry.com` 域名

#### 创建 Token

1. 点击 **Continue to summary**
2. 确认权限配置
3. 点击 **Create Token**
4. **立即复制 Token**（只显示一次！）

### 2. 获取 Cloudflare Account ID

1. 在 Cloudflare Dashboard 首页
2. 查看右侧边栏的 **Account ID**
3. 或者点击任意域名 → 右下角查看 **Account ID**

### 3. 配置 GitHub Secrets

访问 GitHub 仓库设置页面：
```
https://github.com/lukethecat/lukethecat.github.io/settings/secrets/actions
```

添加以下两个 Secrets：

| Secret 名称 | 值 | 说明 |
|-------------|-----|------|
| `CF_API_TOKEN` | 步骤 1 创建的 API Token | Cloudflare API 访问令牌 |
| `CF_ACCOUNT_ID` | 步骤 2 获取的 Account ID | Cloudflare 账户 ID |

### 4. 创建 Cloudflare Pages 项目

如果项目不存在，需要手动创建：

1. 访问 Cloudflare Pages: https://dash.cloudflare.com/?to=/:account/pages
2. 点击 **Create a project**
3. 选择 **Connect to Git**
4. 选择 GitHub 并授权
5. 选择仓库: `lukethecat/lukethecat.github.io`
6. 配置项目设置：

#### 构建配置

| 设置项 | 值 | 说明 |
|--------|-----|------|
| **Project name** | `liyupoetry` | 必须与 CI 配置一致 |
| **Production branch** | `main` | 主分支 |
| **Framework preset** | `None` | 自定义构建命令 |
| **Build command** | `make clean && make content` | Zola 构建命令 |
| **Build output directory** | `public` | 构建输出目录 |
| **Root directory** | (留空) | 仓库根目录 |

### 5. 配置自定义域名

1. 在 Cloudflare Pages 项目页面
2. 点击 **Settings** → **Domains**
3. 点击 **Add custom domain**
4. 输入 `www.liyupoetry.com`
5. 按照提示配置 DNS 记录

#### DNS 配置

Cloudflare 会自动创建以下 DNS 记录：

| 类型 | 名称 | 内容 | TTL |
|------|------|------|-----|
| CNAME | `www` | `liyupoetry.pages.dev` | Auto |
| CNAME | `liyupoetry.com` | `www.liyupoetry.com` | Auto |

### 6. 手动触发首次部署

1. 访问 GitHub Actions: 
   ```
   https://github.com/lukethecat/lukethecat.github.io/actions/workflows/ci.yml
   ```
2. 点击 **Run workflow**
3. 选择 **main** 分支
4. 点击 **Run workflow**

## 🚀 CI/CD 工作流程

### 触发条件

- **Push 到 main 分支**: 自动构建和部署
- **Pull Request**: 仅构建测试，不部署
- **手动触发**: 通过 GitHub Actions UI
- **定时任务**: 每月 1 日 18:00 UTC 自动构建

### 构建步骤

1. **检出代码**: 使用 `actions/checkout@v2`
2. **安装 Zola**: 通过 snap 安装最新版
3. **安装构建工具**: 
   - `gh-stats`: GitHub 星标统计
   - `wasm-pack`: WebAssembly 构建
   - `tinysearch`: 搜索索引
   - `cavif`: AVIF 图像转换
   - `binaryen`: WebAssembly 优化
   - `terser`: JavaScript 压缩
   - `ImageMagick`: 图像处理
4. **构建网站**: `make clean && make content`
5. **验证 Secrets**: 检查 Cloudflare 配置
6. **部署到 Cloudflare**: 使用 `cloudflare/pages-action@v1`
7. **验证部署**: 检查关键页面可访问性

## ✅ 部署验证

部署完成后，CI 会自动验证以下页面：

| 页面 | URL | 预期状态码 |
|------|-----|------------|
| 首页 | `https://www.liyupoetry.com/` | 200 |
| 汗血马诗集 | `https://www.liyupoetry.com/1995hanxuema/` | 200 |
| 1980诗集 | `https://www.liyupoetry.com/1980/` | 200 |
| 归档页面 | `https://www.liyupoetry.com/archive/` | 200 |

### 手动验证命令

```bash
# 验证首页
curl -s -o /dev/null -w "%{http_code}\n" https://www.liyupoetry.com/

# 验证 1995hanxuema 页面
curl -s -o /dev/null -w "%{http_code}\n" https://www.liyupoetry.com/1995hanxuema/

# 验证所有关键页面
for url in "https://www.liyupoetry.com/" \
           "https://www.liyupoetry.com/1995hanxuema/" \
           "https://www.liyupoetry.com/1980/" \
           "https://www.liyupoetry.com/archive/"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    echo "$url: $status"
done
```

## 🔍 故障排除

### 常见问题

#### 1. 部署失败：缺少 Secrets

**症状**: CI 日志显示 "CF_API_TOKEN secret is not configured"

**解决方案**:
1. 确认 GitHub Secrets 已正确配置
2. 检查 Secret 名称是否正确（区分大小写）
3. 重新创建 API Token 并更新 Secret

#### 2. 部署失败：权限不足

**症状**: Cloudflare API 返回 403 错误

**解决方案**:
1. 检查 API Token 权限配置
2. 确保 Token 有 Pages: Edit 权限
3. 确保 Token 关联到正确的账户

#### 3. 页面 404 错误

**症状**: 首页可访问，其他页面返回 404

**可能原因**:
1. 构建输出目录不正确
2. Zola 构建失败
3. Cloudflare Pages 项目配置错误

**解决方案**:
1. 检查 CI 日志中的构建步骤
2. 确认 `public/` 目录包含所有页面
3. 验证 Cloudflare Pages 项目设置

#### 4. DNS 配置问题

**症状**: 域名无法解析

**解决方案**:
1. 检查 Cloudflare DNS 配置
2. 确认 CNAME 记录指向 `liyupoetry.pages.dev`
3. 等待 DNS 传播（最长 24 小时）

### 调试步骤

1. **检查 CI 日志**: 查看完整的 GitHub Actions 输出
2. **检查构建输出**: 确认 `public/` 目录内容完整
3. **检查 Cloudflare Pages**: 查看部署日志和状态
4. **手动构建测试**: 本地运行 `make clean && make content`
5. **验证 Secrets**: 使用测试脚本验证 API Token

## 📊 监控和维护

### 定期检查

1. **GitHub Actions 状态**: 每月检查运行历史
2. **网站可访问性**: 定期测试关键页面
3. **构建时间**: 监控构建性能
4. **存储使用**: 检查 Cloudflare Pages 存储限制

### 更新和维护

1. **Zola 版本更新**: 定期更新构建工具
2. **依赖更新**: 检查并更新 CI 中的工具版本
3. **安全更新**: 及时应用安全补丁
4. **备份策略**: 定期备份内容和配置

## 📞 支持资源

### 官方文档

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Zola 文档](https://www.getzola.org/documentation/getting-started/overview/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

### 故障排除资源

- [Cloudflare Status](https://www.cloudflarestatus.com/)
- [GitHub Status](https://www.githubstatus.com/)
- [Zola GitHub Issues](https://github.com/getzola/zola/issues)

### 联系支持

- **GitHub Issues**: 仓库问题跟踪
- **Cloudflare Support**: 通过 Dashboard 联系
- **社区支持**: Zola Discord 或论坛

## 🎉 成功指标

部署成功后，您应该看到：

1. ✅ GitHub Actions 运行显示绿色对勾
2. ✅ Cloudflare Pages 显示 "Active" 状态
3. ✅ 所有验证页面返回 HTTP 200
4. ✅ 网站通过 `https://www.liyupoetry.com` 可访问
5. ✅ DNS 配置正确生效

## 🔄 更新日志

| 日期 | 版本 | 变更说明 |
|------|------|----------|
| 2026-02-03 | 1.0 | 初始版本，包含完整部署指南 |
| 2026-02-03 | 1.1 | 添加故障排除和验证步骤 |

---

**重要提示**: 本文档应与 `website-maintenance-manual.md` 和 `deployment-status.md` 一起使用，形成完整的部署和维护文档体系。