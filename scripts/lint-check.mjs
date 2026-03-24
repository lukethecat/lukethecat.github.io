#!/usr/bin/env node
/**
 * pre-commit linter: 检查常见错误
 * 运行: node scripts/lint-check.mjs
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
let errors = 0;

function check(msg, condition) {
  if (!condition) {
    console.error(`❌ ${msg}`);
    errors++;
  } else {
    console.log(`✅ ${msg}`);
  }
}

// GR-1: JSON 安全 — 检查 works.json 中是否有 ASCII 引号包裹中文
console.log('\n=== GR-1: JSON 安全 ===');
const worksPath = path.join(ROOT, 'src/content/works.json');
if (fs.existsSync(worksPath)) {
  const content = fs.readFileSync(worksPath, 'utf-8');
  // 检查是否有 中文 + " + 中文 模式（ASCII引号在中文之间）
  const badQuotes = content.match(/[\u4e00-\u9fff]"[\u4e00-\u9fff]/g);
  check('works.json 无内嵌 ASCII 引号', !badQuotes || badQuotes.length === 0);
  if (badQuotes) {
    console.log(`   发现 ${badQuotes.length} 处: ${badQuotes.join(', ')}`);
  }
  // 验证 JSON 语法
  try {
    JSON.parse(content);
    check('works.json JSON 语法有效', true);
  } catch (e) {
    check(`works.json JSON 语法错误: ${e.message}`, false);
  }
}

// GR-3: 检查 src/content 中没有手动编辑的 essay book.json
console.log('\n=== GR-3: 源文件隔离 ===');
const essayDirs = fs.readdirSync(path.join(ROOT, 'src/content'))
  .filter(d => d.startsWith('essay') && fs.statSync(path.join(ROOT, 'src/content', d)).isDirectory());
check('src/content/ 中无 essay 误生成目录', essayDirs.length === 0);
if (essayDirs.length > 0) {
  console.log(`   发现: ${essayDirs.join(', ')}（应删除，essays 不走 book 处理）`);
}

// 检查所有 JSON 文件可解析
console.log('\n=== 全局 JSON 检查 ===');
const jsonFiles = [];
function walkJson(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory() && !f.startsWith('.')) walkJson(full);
    else if (f.endsWith('.json')) jsonFiles.push(full);
  }
}
walkJson(path.join(ROOT, 'src/content'));
for (const f of jsonFiles) {
  try {
    JSON.parse(fs.readFileSync(f, 'utf-8'));
  } catch (e) {
    check(`${path.relative(ROOT, f)}: ${e.message}`, false);
  }
}
console.log(`✅ 检查了 ${jsonFiles.length} 个 JSON 文件`);

// 汇总
console.log(`\n${errors === 0 ? '🎉 全部通过' : `💥 ${errors} 个错误`}`);
process.exit(errors > 0 ? 1 : 0);
