---
slug: responsive-design
title: 响应式设计实战指南
authors: mason
tags: [CSS, 响应式, 前端]
---

响应式设计让网站在各种设备上都能良好展示。本文分享响应式布局的实用技巧。

<!--truncate-->

## 📱 响应式基础

### viewport 设置

```html
<!-- 必须的 meta 标签 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 断点设计

```css
/* 常用断点 */
/* 移动端优先 */
@media (min-width: 576px) { /* 大手机 */ }
@media (min-width: 768px) { /* 平板 */ }
@media (min-width: 992px) { /* 桌面 */ }
@media (min-width: 1200px) { /* 大桌面 */ }

/* 桌面优先 */
@media (max-width: 1199px) { /* 小桌面 */ }
@media (max-width: 991px) { /* 平板 */ }
@media (max-width: 767px) { /* 手机 */ }
```

### CSS 变量管理

```css
:root {
  --container-width: 1200px;
  --spacing: 16px;
  --font-size-base: 16px;
}

@media (max-width: 768px) {
  :root {
    --container-width: 100%;
    --spacing: 12px;
    --font-size-base: 14px;
  }
}
```

---

## 📐 布局技巧

### Flexbox 响应式

```css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.item {
  flex: 1 1 300px; /* 至少 300px，自动换行 */
}

/* 或使用媒体查询 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}
```

### Grid 响应式

```css
/* 自适应列数 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

/* 使用媒体查询 */
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 992px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

### Container Queries

```css
/* 基于容器尺寸而非视口 */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: flex;
    flex-direction: row;
  }
}

@container (max-width: 399px) {
  .card {
    display: flex;
    flex-direction: column;
  }
}
```

---

## 🖼️ 响应式图片

### srcset 和 sizes

```html
<img 
  src="image-800.jpg"
  srcset="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w
  "
  sizes="
    (max-width: 600px) 100vw,
    (max-width: 1000px) 50vw,
    800px
  "
  alt="响应式图片"
>
```

### picture 元素

```html
<picture>
  <!-- 艺术方向：不同尺寸使用不同图片 -->
  <source media="(min-width: 1200px)" srcset="hero-desktop.jpg">
  <source media="(min-width: 768px)" srcset="hero-tablet.jpg">
  <img src="hero-mobile.jpg" alt="Hero">
</picture>

<!-- 格式降级 -->
<picture>
  <source type="image/avif" srcset="image.avif">
  <source type="image/webp" srcset="image.webp">
  <img src="image.jpg" alt="图片">
</picture>
```

### CSS 背景图

```css
.hero {
  background-image: url('hero-mobile.jpg');
  background-size: cover;
}

@media (min-width: 768px) {
  .hero {
    background-image: url('hero-tablet.jpg');
  }
}

@media (min-width: 1200px) {
  .hero {
    background-image: url('hero-desktop.jpg');
  }
}

/* 或使用 image-set */
.hero {
  background-image: image-set(
    url('hero.avif') type('image/avif'),
    url('hero.webp') type('image/webp'),
    url('hero.jpg') type('image/jpeg')
  );
}
```

---

## 📝 响应式排版

### 流体字体

```css
/* clamp(最小值, 首选值, 最大值) */
h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
}

p {
  font-size: clamp(1rem, 2vw, 1.25rem);
}

/* 间距也可以使用 */
.section {
  padding: clamp(1rem, 5vw, 4rem);
}
```

### 行高和间距

```css
body {
  font-size: 16px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  body {
    font-size: 14px;
    line-height: 1.5;
  }
}

h1, h2, h3 {
  line-height: 1.2;
}
```

---

## 🧭 导航响应式

### 汉堡菜单

```html
<nav class="navbar">
  <div class="logo">Logo</div>
  <button class="menu-toggle" aria-label="菜单">
    <span></span>
    <span></span>
    <span></span>
  </button>
  <ul class="nav-links">
    <li><a href="#">首页</a></li>
    <li><a href="#">关于</a></li>
    <li><a href="#">服务</a></li>
    <li><a href="#">联系</a></li>
  </ul>
</nav>
```

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.menu-toggle {
  display: none;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
  }

  .menu-toggle span {
    width: 24px;
    height: 2px;
    background: #333;
  }

  .nav-links {
    display: none;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    flex-direction: column;
    background: white;
    padding: 1rem;
  }

  .nav-links.active {
    display: flex;
  }
}
```

---

## 📊 表格响应式

### 方案 1：横向滚动

```css
.table-container {
  overflow-x: auto;
}

table {
  min-width: 600px;
}
```

### 方案 2：卡片化

```css
@media (max-width: 768px) {
  table, thead, tbody, th, td, tr {
    display: block;
  }

  thead {
    display: none;
  }

  tr {
    margin-bottom: 1rem;
    border: 1px solid #ddd;
  }

  td {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
  }

  td::before {
    content: attr(data-label);
    font-weight: bold;
  }
}
```

```html
<tr>
  <td data-label="姓名">张三</td>
  <td data-label="邮箱">zhang@example.com</td>
  <td data-label="电话">13800138000</td>
</tr>
```

---

## 🎯 实用技巧

### 隐藏/显示元素

```css
/* 只在移动端显示 */
.mobile-only {
  display: block;
}
@media (min-width: 768px) {
  .mobile-only {
    display: none;
  }
}

/* 只在桌面端显示 */
.desktop-only {
  display: none;
}
@media (min-width: 768px) {
  .desktop-only {
    display: block;
  }
}
```

### 触摸友好

```css
/* 增大点击区域 */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}

/* 禁用 hover 在触摸设备 */
@media (hover: hover) {
  .button:hover {
    background: #f0f0f0;
  }
}
```

### 安全区域

```css
/* 适配 iPhone 刘海屏 */
.header {
  padding-top: env(safe-area-inset-top);
}

.footer {
  padding-bottom: env(safe-area-inset-bottom);
}

body {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

---

## 🛠️ 调试工具

### Chrome DevTools

```markdown
1. 打开 DevTools (F12)
2. 点击设备工具栏图标
3. 选择预设设备或自定义尺寸
4. 测试不同断点
```

### 响应式检查清单

```markdown
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone X)
- [ ] 414px (iPhone Plus)
- [ ] 768px (iPad)
- [ ] 1024px (iPad Pro)
- [ ] 1280px (笔记本)
- [ ] 1920px (桌面)
```

---

## 📋 最佳实践

```markdown
1. 移动优先
   - 先设计移动端，再扩展到桌面
   - 使用 min-width 媒体查询

2. 使用相对单位
   - rem 用于字体
   - % 或 vw 用于布局
   - px 用于边框等固定值

3. 弹性布局
   - 优先使用 Flexbox 和 Grid
   - 使用 minmax() 和 auto-fit

4. 性能考虑
   - 按需加载图片
   - 避免在媒体查询中重复大量样式

5. 测试真机
   - 模拟器不能替代真机测试
   - 测试触摸交互
```

---

响应式设计的核心是**内容优先**。先确定内容结构，再考虑如何在不同尺寸上展示。
