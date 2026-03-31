# poet-archive 安全规则

_安全相关的检查、事件和预防措施。*

## 安全事件日志

### 2026-03-31: axios 投毒事件
- **来源**: @evilcos (Cos 余弦) 安全警告
- **影响**: OpenClaw 3.28 可能引入被投毒的 axios
- **恶意版本**: axios@1.14.1, axios@0.30.4
- **恶意依赖**: plain-crypto-js@4.2.1 (通过 postinstall 投毒)
- **检查结果**: ✅ 系统安全，使用 axios@1.14.0
- **参考**: panewslab.com 慢雾安全提醒

## 安全检查清单

### 定期检查（每周）
```bash
# 1. 检查 axios 版本
npm list -g axios

# 2. 检查是否有恶意版本
npm list -g axios | grep -E "1.14.1|0.30.4"

# 3. 检查 OpenClaw 版本
openclaw --version

# 4. 检查可疑依赖
npm list -g | grep -i "crypto\|wallet\|seed\|mnemonic"
```

### 升级前检查
1. **查看更新日志**: 检查是否有安全修复
2. **检查依赖变更**: `npm audit` 或 `npm outdated`
3. **备份配置**: 升级前备份 `~/.openclaw/`
4. **测试环境**: 先在测试环境验证

### 安全最佳实践
- **不要使用** 来源不明的 npm 包
- **定期更新** 依赖到最新安全版本
- **监控** 安全公告和漏洞报告
- **备份** 重要配置和数据

## 应急响应

### 如果发现恶意包
1. **立即隔离**: 停止相关服务
2. **检查影响**: 查看是否已执行恶意代码
3. **清除威胁**: 卸载恶意包
4. **恢复备份**: 如果必要，从备份恢复
5. **报告事件**: 记录并报告安全事件

### 联系方式
- **安全报告**: https://github.com/lukethecat/lukethecat.github.io/issues
- **OpenClaw 安全**: 参考官方文档
