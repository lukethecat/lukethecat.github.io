# 李瑜诗歌数字档案 · Liyu Poetry Archive

> **诗人数字档案馆** — 以现代化 Web 技术呈现西部诗人李瑜的诗歌世界。

🔗 **在线访问**：[liyupoetry.com](https://liyupoetry.com)

---

## 关于

本站收录了诗人李瑜的代表性诗集及相关学术文章，致力于以高质感的阅读体验展现新边塞诗的独特魅力。

### 收录诗集

| 诗集 | 年份 | 说明 |
|------|------|------|
| 《准噶尔诗草》 | 1984 | 早期兵团生活诗作 |
| 《汗血马》 | 1995 | 西域历史系列组诗，21组101首 |
| 《黑罂粟·上卷》 | 1998 | 天山以北的新疆行吟诗 |
| 《黑罂粟·下卷》 | 1998 | 天山以南的新疆行吟诗 |

### 收录文章

- 新疆兵团"新边塞诗"六十年发展综述（杨昌俊，2019）
- 一支深情的长箫——论新边塞诗婉约派代表诗人李瑜的诗歌（夏冠洲，2011）
- 各诗集序言、后记、出版信息等

---

## 技术栈

- **框架**：[Next.js](https://nextjs.org/) 14（App Router, TypeScript）
- **样式**：[Tailwind CSS](https://tailwindcss.com/)
- **内容**：Markdown 源文件 → JSON 构建产物
- **部署**：GitHub Pages + Cloudflare Pages

---

## 项目结构

```
├── books/                  # 诗集与文章源文件（唯一真理源）
│   ├── hanxuema1995/       # 汗血马
│   ├── heiyingsushangjuan1998/  # 黑罂粟·上卷
│   ├── heiyingsuxiajuan1998/    # 黑罂粟·下卷
│   ├── zhungaer1984/       # 准噶尔诗草
│   ├── essay1/             # 学术文章
│   └── essay2/
├── src/
│   ├── app/                # Next.js 页面
│   ├── components/         # UI 组件
│   ├── content/            # [生成] 构建产物（JSON/MD）
│   └── lib/                # 工具函数
├── scripts/
│   ├── process-books.ts    # 诗集处理脚本
│   └── verify-data.ts      # 数据验证
└── .agents/                # Agent 工作流与规则
```

---

## 本地开发

```bash
# 安装依赖
npm install

# 处理诗集数据
npm run process:books

# 验证数据
npm run test:data

# 启动开发服务器
npm run dev

# 构建
npm run build
```

---

## 文化注释

本站为诗集配备了文化注释（annotations），涵盖：

- 🏔️ 地理与风物（红柳、古尔班通古特、坎儿井）
- 🏛️ 历史事件与兵团背景
- 🎭 特定意象与文化引申
- 📜 典故与人物

---

## 作者

**李瑜**（1939— ），当代著名西部诗人。原籍安徽巢县，生于重庆，长在武汉。1964年从武汉支边到新疆，先后在兵团基层单位当过修理工、农工和中小学教师。诗风忧伤、缠绵、轻柔、淡远，被誉为新边塞诗"婉约派"代表诗人。

---

## 许可

内容版权归作者所有。代码部分 MIT License。
