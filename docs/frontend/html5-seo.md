# HTML5 语义化与 SEO

语义化 HTML 不仅让代码更易读，还能提升 SEO 和无障碍性。

## 为什么要语义化

1. **SEO 优化** - 搜索引擎更好理解内容
2. **无障碍** - 屏幕阅读器能正确解析
3. **可维护性** - 代码结构清晰
4. **跨设备兼容** - 不同设备正确渲染

## 语义化标签

### 文档结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="页面描述，用于搜索结果展示">
  <meta name="keywords" content="关键词1, 关键词2">
  <title>页面标题 - 网站名称</title>
</head>
<body>
  <header>
    <nav>导航</nav>
  </header>
  
  <main>
    <article>
      <header>文章头部</header>
      <section>章节内容</section>
      <footer>文章底部</footer>
    </article>
    <aside>侧边栏</aside>
  </main>
  
  <footer>页脚</footer>
</body>
</html>
```

### 常用语义标签

| 标签 | 用途 | 说明 |
|------|------|------|
| `<header>` | 页眉/文章头 | 可多次使用 |
| `<nav>` | 导航链接 | 主要导航区域 |
| `<main>` | 主要内容 | 每页只能有一个 |
| `<article>` | 独立内容 | 可单独分发的内容 |
| `<section>` | 主题分组 | 有标题的内容块 |
| `<aside>` | 侧边内容 | 与主内容相关但独立 |
| `<footer>` | 页脚 | 版权、链接等 |
| `<figure>` | 图表容器 | 配合 figcaption |
| `<figcaption>` | 图表说明 | figure 的标题 |
| `<time>` | 时间日期 | 机器可读的时间 |
| `<mark>` | 高亮文本 | 标记重要内容 |
| `<details>` | 折叠内容 | 配合 summary |
| `<summary>` | 折叠标题 | details 的标题 |

### 标题层级

```html
<!-- ✅ 正确：标题层级有序 -->
<h1>网站标题</h1>
  <h2>章节标题</h2>
    <h3>子章节</h3>
    <h3>子章节</h3>
  <h2>章节标题</h2>

<!-- ❌ 错误：跳过层级 -->
<h1>标题</h1>
  <h3>直接跳到 h3</h3>

<!-- ❌ 错误：多个 h1 -->
<h1>标题1</h1>
<h1>标题2</h1>
```

### 图片语义化

```html
<!-- 内容图片：使用 alt -->
<img src="product.jpg" alt="iPhone 15 Pro 深空黑色正面图">

<!-- 装饰图片：空 alt -->
<img src="decoration.png" alt="">

<!-- 复杂图片：使用 figure -->
<figure>
  <img src="chart.png" alt="2024年销售数据图表">
  <figcaption>图1：2024年各季度销售额对比</figcaption>
</figure>

<!-- 响应式图片 -->
<picture>
  <source media="(min-width: 800px)" srcset="large.jpg">
  <source media="(min-width: 400px)" srcset="medium.jpg">
  <img src="small.jpg" alt="响应式图片示例">
</picture>
```

### 表单语义化

```html
<form>
  <fieldset>
    <legend>用户信息</legend>
    
    <div>
      <label for="username">用户名</label>
      <input type="text" id="username" name="username" required>
    </div>
    
    <div>
      <label for="email">邮箱</label>
      <input type="email" id="email" name="email" required>
    </div>
  </fieldset>
  
  <fieldset>
    <legend>联系方式</legend>
    
    <div>
      <label for="phone">电话</label>
      <input type="tel" id="phone" name="phone">
    </div>
  </fieldset>
  
  <button type="submit">提交</button>
</form>
```

## SEO 优化

### Meta 标签

```html
<head>
  <!-- 基础 Meta -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO Meta -->
  <title>页面标题 | 网站名称</title>
  <meta name="description" content="150字以内的页面描述">
  <meta name="keywords" content="关键词1, 关键词2, 关键词3">
  <meta name="author" content="作者名称">
  <link rel="canonical" href="https://example.com/page">
  
  <!-- Open Graph (社交分享) -->
  <meta property="og:title" content="分享标题">
  <meta property="og:description" content="分享描述">
  <meta property="og:image" content="https://example.com/image.jpg">
  <meta property="og:url" content="https://example.com/page">
  <meta property="og:type" content="article">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="分享标题">
  <meta name="twitter:description" content="分享描述">
  <meta name="twitter:image" content="https://example.com/image.jpg">
  
  <!-- 爬虫控制 -->
  <meta name="robots" content="index, follow">
  <!-- noindex: 不索引, nofollow: 不跟踪链接 -->
</head>
```

### 结构化数据

```html
<!-- JSON-LD 格式 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题",
  "author": {
    "@type": "Person",
    "name": "作者名称"
  },
  "datePublished": "2024-01-15",
  "image": "https://example.com/image.jpg",
  "publisher": {
    "@type": "Organization",
    "name": "网站名称",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}
</script>
```

### 常用结构化数据类型

```javascript
// 文章
{
  "@type": "Article",
  "headline": "标题",
  "author": { "@type": "Person", "name": "作者" },
  "datePublished": "2024-01-15"
}

// 产品
{
  "@type": "Product",
  "name": "产品名称",
  "image": "图片URL",
  "offers": {
    "@type": "Offer",
    "price": "99.00",
    "priceCurrency": "CNY"
  }
}

// 面包屑
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "首页", "item": "URL" },
    { "@type": "ListItem", "position": 2, "name": "分类", "item": "URL" }
  ]
}

// FAQ
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "问题1",
      "acceptedAnswer": { "@type": "Answer", "text": "答案1" }
    }
  ]
}
```

### URL 优化

```
✅ 好的 URL
/blog/javascript-basics
/products/iphone-15-pro

❌ 差的 URL
/page?id=123
/p/1234567890
```

### 性能与 SEO

```html
<!-- 预加载关键资源 -->
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="hero.jpg" as="image">

<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//api.example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- 延迟加载图片 -->
<img src="image.jpg" loading="lazy" alt="延迟加载">

<!-- 异步加载脚本 -->
<script src="analytics.js" async></script>
<script src="app.js" defer></script>
```

## 无障碍 (a11y)

### ARIA 属性

```html
<!-- 角色 -->
<div role="navigation">导航内容</div>
<div role="main">主要内容</div>
<div role="complementary">补充内容</div>

<!-- 状态 -->
<button aria-expanded="false">展开菜单</button>
<input aria-invalid="true" aria-describedby="error-msg">
<span id="error-msg">请输入有效邮箱</span>

<!-- 标签 -->
<button aria-label="关闭对话框">×</button>
<div aria-labelledby="section-title">
  <h2 id="section-title">章节标题</h2>
</div>

<!-- 实时区域 -->
<div aria-live="polite">内容更新会被朗读</div>
<div aria-live="assertive">紧急更新，立即朗读</div>
```

### 键盘导航

```html
<!-- 可聚焦元素 -->
<a href="#">链接</a>
<button>按钮</button>
<input type="text">

<!-- 使 div 可聚焦 -->
<div tabindex="0">可以用 Tab 聚焦</div>
<div tabindex="-1">只能用 JS 聚焦</div>

<!-- 跳过导航 -->
<a href="#main-content" class="skip-link">跳到主内容</a>
```

### 颜色对比度

```css
/* WCAG AA 标准：普通文本 4.5:1，大文本 3:1 */
/* WCAG AAA 标准：普通文本 7:1，大文本 4.5:1 */

/* ✅ 高对比度 */
.text { color: #333; background: #fff; }

/* ❌ 低对比度 */
.text { color: #999; background: #eee; }
```

## SEO 检查清单

### 技术 SEO
- [ ] 使用 HTTPS
- [ ] 移动端友好
- [ ] 页面加载速度 < 3秒
- [ ] 正确的 robots.txt
- [ ] XML Sitemap
- [ ] 无死链 (404)

### 内容 SEO
- [ ] 唯一的 title 标签
- [ ] 描述性 meta description
- [ ] 正确的标题层级 (h1-h6)
- [ ] 图片有 alt 属性
- [ ] 内部链接合理
- [ ] URL 结构清晰

### 结构化数据
- [ ] 添加相关的 Schema.org 标记
- [ ] 通过 Google 结构化数据测试工具验证

## 常用工具

| 工具 | 用途 |
|------|------|
| Lighthouse | 性能、SEO、无障碍审计 |
| Google Search Console | 搜索表现分析 |
| Schema.org Validator | 结构化数据验证 |
| WAVE | 无障碍检测 |
| axe DevTools | 无障碍检测 |

## 总结

| 要点 | 说明 |
|------|------|
| 语义化标签 | 使用正确的 HTML5 标签 |
| 标题层级 | h1 唯一，层级有序 |
| 图片 alt | 内容图片必须有 alt |
| Meta 标签 | title、description 优化 |
| 结构化数据 | JSON-LD 格式 |
| 无障碍 | ARIA 属性、键盘导航 |
