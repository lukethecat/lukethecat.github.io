---
description: 运行回归测试与数据验证 (Run Regression Tests and Data Verification)
---
# 回归测试工作流 (Regression Testing Workflow)

当修改了内容、新增了书籍或更改了全局样式/组件时，请运行此工作流。

1. 运行数据处理脚本以确保拥有一份最新的合并数据：
   ```bash
   npm run process:books
   ```

2. 运行回归测试脚本，以自动化验证数据的完整性及已知边界情况（例如：是否丢失诗歌、是否存在重复章节、全局样式是否正确应用）：
   // turbo
   ```bash
   npm run test:data
   ```

3. (可选) 运行 Next.js 的构建命令，确保没有任何编译或打包错误：
   ```bash
   npm run build
   ```

## 本地验证步骤 (Local Verification Steps)
如果发现 UI 显示异常或内容缺失，请按以下手动步骤进行验证：
1. 检查 `src/content/<bookId>/book.json` 数据文件中是否输出了预期的 `lines`（诗文段落）与 `chapters`（章节）。
2. 在 `src/components/` 目录下检查关联的 `.tsx` 渲染组件（例如 `PoemView.tsx`, `Sidebar.tsx`, `LanguageSwitcher.tsx` 等）。
3. 如果发现在本地存在但线上缺失的样式，确保它们已经被移动到 `globals.css` 中，而没有被错误地封装在受限的 `<style jsx>` 块内。
4. **UI 变更内测自验 (Dogfooding)**：如果正在测试视觉组件相关的变动，必须先在本地构建并启动服务，随后使用 `agent-browser` 工具打开本地页面以核查 DOM 元素和交互，在确认效果无误后再提交给用户检阅。
