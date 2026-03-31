# Axios 供应链投毒事件 - 修复与规避

## 事件摘要 (2026-03-31)

axios 维护者账号被盗，攻击者发布了恶意版本：
- `axios@1.14.1`
- `axios@0.30.4`

恶意版本包含 `plain-crypto-js@4.2.1`，通过 postinstall 脚本投递跨平台 RAT。

## 检查方法

### 1. 检查 axios 版本
```bash
# 全局检查
npm list -g axios

# 项目检查
npm list axios

# 锁定文件检查
grep "axios" package-lock.json | grep -E "1.14.1|0.30.4"
```

### 2. 检查恶意依赖
```bash
# 检查是否存在恶意包
ls node_modules/plain-crypto-js 2>/dev/null && echo "⚠️ 发现恶意包!" || echo "✅ 安全"

# 全局检查
ls ~/.npm-global/lib/node_modules/*/node_modules/plain-crypto-js 2>/dev/null && echo "⚠️ 发现恶意包!" || echo "✅ 安全"
```

### 3. 检查恶意文件
```bash
# macOS
ls -la /Library/Caches/com.apple.act.mond 2>/dev/null && echo "⚠️ 发现恶意文件!" || echo "✅ 安全"

# Linux
ls -la /tmp/ld.py 2>/dev/null && echo "⚠️ 发现恶意文件!" || echo "✅ 安全"

# Windows (PowerShell)
# Test-Path "$env:PROGRAMDATA\wt.exe"
```

## 修复方案

### 如果已安装恶意版本

#### 1. 立即隔离
```bash
# 断开网络（如果可能）
# 不要在感染的系统上输入敏感信息
```

#### 2. 降级 axios
```bash
# 全局降级
npm install -g axios@1.14.0

# 项目降级
npm install axios@1.14.0

# 锁定版本在 package.json
"dependencies": {
  "axios": "1.14.0"  # 不要用 ^ 或 ~
}
```

#### 3. 清除恶意包
```bash
# 删除 plain-crypto-js
rm -rf node_modules/plain-crypto-js

# 全局删除
rm -rf ~/.npm-global/lib/node_modules/*/node_modules/plain-crypto-js

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

#### 4. 轮换凭证
**必须立即轮换所有凭证：**
- [ ] npm token (`npm token revoke --all`)
- [ ] GitHub token (Settings → Developer settings → Personal access tokens)
- [ ] SSH keys (`~/.ssh/`)
- [ ] API keys (OpenRouter, Cloudflare, etc.)
- [ ] 云服务凭证 (AWS, GCP, Azure)
- [ ] 数据库密码
- [ ] 任何在该系统上使用的密码

#### 5. 监控网络流量
```bash
# 检查是否有连接到 C2 服务器
netstat -an | grep -E "sfrclak.com|142.11.206.73"

# 使用 lsof 检查可疑连接
lsof -i | grep -E "sfrclak|142.11.206"
```

## 长期规避策略

### 1. 锁定依赖版本
```json
// package.json - 使用精确版本
{
  "dependencies": {
    "axios": "1.14.0",     // 不用 ^1.14.0
    "express": "4.18.2"    // 不用 ~4.18.2
  }
}
```

### 2. 使用 package-lock.json
- 始终提交 `package-lock.json` 到版本控制
- 使用 `npm ci` 而不是 `npm install` 进行生产部署

### 3. 禁用 postinstall 脚本
```bash
# 安装时禁用脚本
npm install --ignore-scripts

# 设置为默认行为
npm config set ignore-scripts true

# 在 CI/CD 中使用
# .github/workflows/deploy.yml
- run: npm ci --ignore-scripts
```

### 4. 使用 npm audit
```bash
# 检查漏洞
npm audit

# 自动修复
npm audit fix

# 强制修复（谨慎使用）
npm audit fix --force
```

### 5. 监控依赖更新
```bash
# 检查过时的包
npm outdated

# 使用 Dependabot 或 Renovate 自动更新
```

### 6. 使用 SRI（子资源完整性）
对于 CDN 引入的脚本：
```html
<script src="https://cdn.jsdelivr.net/npm/axios@1.14.0/dist/axios.min.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

### 7. 定期安全审计
```bash
# 每周运行
npm audit
npm list -g | grep -i "crypto\|wallet\|seed"

# 检查可疑包
npm list --depth=0 | grep -v "node_modules"
```

## OpenClaw 特定建议

### 1. 检查 OpenClaw 依赖
```bash
# 查看 OpenClaw 的依赖
npm list -g openclaw --depth=1

# 检查 axios 版本
npm list -g openclaw | grep axios
```

### 2. 更新 OpenClaw
```bash
# 检查最新版本
npm view openclaw version

# 更新（在确认安全后）
npm install -g openclaw@latest
```

### 3. 备份配置
```bash
# 升级前备份
cp -r ~/.openclaw ~/.openclaw.backup.$(date +%Y%m%d)
```

## 应急响应流程

### 发现感染后
1. **隔离** - 断开网络连接
2. **评估** - 检查哪些凭证可能泄露
3. **轮换** - 立即轮换所有凭证
4. **清除** - 删除恶意包和文件
5. **重建** - 从干净备份重建系统
6. **监控** - 持续监控异常活动
7. **报告** - 记录事件并报告

### 预防胜于治疗
- ✅ 锁定依赖版本
- ✅ 使用 `--ignore-scripts`
- ✅ 定期运行 `npm audit`
- ✅ 监控安全公告
- ✅ 备份重要配置

## 参考资源

- [SlowMist 安全提醒](https://www.panewslab.com/...)
- [Snyk 分析](https://snyk.io/...)
- [Vercel 安全公告](https://vercel.com/...)
- [npm 官方文档](https://docs.npmjs.com/...)

## 我们的检查结果

✅ **系统安全**
- axios 版本: 1.14.0 (安全)
- 未发现恶意包
- 未发现恶意文件

🔒 **已采取的措施**
- 锁定 axios 版本到 1.14.0
- 创建安全规则文档
- 建立定期检查机制
