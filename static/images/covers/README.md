# 书籍封面目录说明

## 目录结构

```
static/images/covers/
├── 1980/                    # 1980年诗集封面
│   ├── cover.jpg           # 主封面 (建议: 400x600px, JPG/PNG)
│   ├── thumbnail.jpg       # 缩略图 (建议: 200x300px)
│   └── author.jpg          # 作者照片 (可选)
├── 1995hanxuema/           # 汗血马诗集封面
│   ├── cover.jpg
│   ├── thumbnail.jpg
│   └── author.jpg
└── [其他年份]/              # 新诗集可按年份创建目录
```

## 封面文件要求

### 1. 尺寸建议
- **主封面 (cover.jpg)**: 400x600 像素 (宽:高 = 2:3)
- **缩略图 (thumbnail.jpg)**: 200x300 像素 
- **作者照片 (author.jpg)**: 300x300 像素 (正方形)

### 2. 格式建议
- **推荐格式**: JPEG (.jpg) 或 PNG (.png)
- **色彩模式**: RGB
- **文件大小**: 50KB - 500KB 之间

### 3. 图片命名约定
- 主封面: `cover.jpg` 或 `cover.png`
- 缩略图: `thumbnail.jpg` 或 `thumbnail.png`
- 作者照片: `author.jpg` 或 `author.png`

## 如何添加封面

### 方法一：手动添加
```bash
# 进入项目目录
cd /Users/jellyfishjaco/Documents/Git\|Repo/liyupoerty.com-master

# 创建目录 (如果不存在)
mkdir -p static/images/covers/1995hanxuema

# 复制封面图片
cp /path/to/your-cover.jpg static/images/covers/1995hanxuema/cover.jpg

# 创建缩略图 (如果有 ImageMagick)
convert static/images/covers/1995hanxuema/cover.jpg -resize 200x300 static/images/covers/1995hanxuema/thumbnail.jpg
```

### 方法二：使用自动生成脚本
当添加新诗集时，`generate_poetry_pages.py` 脚本会自动创建封面目录：
```bash
python3 generate_poetry_pages.py
# 会自动执行: mkdir -p static/images/covers/1995hanxuema
```

## 模板中的封面引用

在 Zola 模板中，封面文件会自动被引用：

```html
<!-- 在 templates/section.html 或 templates/page.html 中 -->
<img src="/images/covers/{{ section.slug }}/cover.jpg" 
     alt="{{ section.title }} 封面">
```

## 示例效果

### 如果封面文件存在
- 图片会自动显示在诗集页面和导航中
- 用户可以看到精美的书籍封面设计

### 如果封面文件不存在
- 显示默认的友好的占位符
- 因此封面文件是可选但推荐添加的

## 版权说明

**重要**: 确保您拥有封面图片的版权或已获得授权。

- 原创封面: 自己设计的封面可以添加
- 借用照片: 请注明摄影师信息
- 书籍封面: 需要获得出版社授权

## 访问 URL

上传封面后，可以通过以下 URL 访问：
- 主封面: `https://liyupoerty.com/images/covers/1995hanxuema/cover.jpg`
- 缩略图: `https://liyupoerty.com/images/covers/1995hanxuema/thumbnail.jpg`

## 测试封面图片

本地测试时：
```bash
# 重启 zola serve 服务器
# 访问: http://127.0.0.1:11000/archive
# 检查封面图片是否正常显示
```

## 常见问题

**Q1: 封面图片不显示?**
- 检查路径是否正确: `static/images/covers/{年份}/cover.jpg`
- 重启 zola serve 服务器
- 检查浏览器控制台错误

**Q2: 图片太大影响加载速度?**
- 使用 `convert` 工具压缩:
  ```bash
  convert input.jpg -quality 80 -strip output.jpg
  ```

**Q3: 需要中文字符的图片?**
- 可以添加 `封面-1995hanxuema.jpg` 这类文件名

## 最佳实践

1. ✅ 使用推荐的尺寸 (400x600 或 200x300)
2. ✅ 保持图片质量但压缩文件大小
3. ✅ 创建合法的缩略图用于移动端展示
4. ✅ 添加 alt 文本描述图片内容
5. ✅ 遵守版权法，使用授权图片

## 维护视图

- **封面添加后**: 无需手动修改模板，IREE 会自动引用
- **更新封面**: 直接替换同名文件即可
- **删除封面**: 删除文件，模板会显示占位符

---

**目录位置**: `static/images/covers/`  
**自动创建**: `generate_poetry_pages.py`  
**推荐封面**: 每書至少一張封面 (cover.jpg)