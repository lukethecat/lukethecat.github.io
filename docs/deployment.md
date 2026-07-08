# 部署链路 (Deployment)

## 流程

```
git push origin main
    ↓
GitHub Actions (Deploy Website)
    ├── build: npm install + npm run build → ./out/
    ├── deploy-gh-pages: → lukethecat.github.io
    ├── deploy-cloudflare: → liyupoetry 项目 (CF_API_TOKEN + CF_ACCOUNT_ID)
    └── verify-deployment: 检查 GitHub Pages 可达性
```

## 验证命令

```bash
# 检查最新部署状态
gh run list --repo lukethecat/lukethecat.github.io --limit 1

# 查看 Cloudflare 部署 URL
gh api repos/lukethecat/lukethecat.github.io/actions/runs/{RUN_ID}/jobs \
  --jq '.jobs[] | select(.name == "deploy-cloudflare") | .id' | \
  xargs -I{} gh api repos/lukethecat/lukethecat.github.io/actions/jobs/{}/logs \
  --header "Accept: application/vnd.github.v3+raw" | grep "pages.dev"
```

## 验证线上

| 地址 | 用途 |
|------|------|
| `lukethecat.github.io` | GitHub Pages（最先更新） |
| `www.liyupoetry.com` | Cloudflare Pages（可能有缓存） |

## 注意事项
- Cloudflare 有 CDN 缓存，新部署可能延迟生效
- 验证时优先用 GitHub Pages 地址
- `liyupoetry.com`（不带 www）可能不解析，需在 Cloudflare 配置 DNS
