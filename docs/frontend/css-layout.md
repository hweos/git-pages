---
sidebar_position: 2
slug: css-layout
title: CSS 布局技巧
description: Flexbox、Grid 布局与居中方案大全
---

# CSS 布局技巧

本文总结现代 CSS 布局的常用技巧，包括 Flexbox、Grid 和各种居中方案。

## 📐 Flexbox 布局

### 基础概念

```css
.container {
  display: flex;
  flex-direction: row;      /* 主轴方向: row | column */
  justify-content: center;  /* 主轴对齐 */
  align-items: center;      /* 交叉轴对齐 */
  flex-wrap: wrap;          /* 换行 */
  gap: 16px;                /* 间距 */
}
```

### 常用对齐方式

```css
/* 主轴对齐 (justify-content) */
.flex-start    { justify-content: flex-start; }
.flex-end      { justify-content: flex-end; }
.center        { justify-content: center; }
.space-between { justify-content: space-between; }
.space-around  { justify-content: space-around; }
.space-evenly  { justify-content: space-evenly; }

/* 交叉轴对齐 (align-items) */
.align-start   { align-items: flex-start; }
.align-end     { align-items: flex-end; }
.align-center  { align-items: center; }
.align-stretch { align-items: stretch; }
```

### 子元素属性

```css
.item {
  flex-grow: 1;    /* 放大比例 */
  flex-shrink: 0;  /* 缩小比例 */
  flex-basis: 200px; /* 初始大小 */
  
  /* 简写 */
  flex: 1;           /* flex: 1 1 0% */
  flex: 0 0 200px;   /* 固定宽度 */
  
  align-self: center; /* 单独对齐 */
  order: 1;          /* 排列顺序 */
}
```

### 实用布局示例

```css
/* 导航栏：左右分布 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 卡片列表：自动换行 */
.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.card {
  flex: 0 0 calc(33.333% - 11px);
}

/* 底部固定 */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}

.footer {
  flex-shrink: 0;
}
```

---

## 🔲 Grid 布局

### 基础概念

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 3 等分列 */
  grid-template-rows: auto;
  gap: 16px;
}
```

### 定义网格

```css
/* 固定列 */
grid-template-columns: 200px 1fr 200px;

/* 等分列 */
grid-template-columns: repeat(3, 1fr);

/* 自动填充 */
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

/* 自动适应 */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
```

### 子元素定位

```css
.item {
  grid-column: 1 / 3;     /* 跨 1-3 列 */
  grid-row: 1 / 2;        /* 第 1 行 */
  
  /* 简写 */
  grid-column: span 2;    /* 跨 2 列 */
  grid-area: 1 / 1 / 2 / 3; /* row-start / col-start / row-end / col-end */
}
```

### 命名网格区域

```css
.container {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: auto 1fr auto;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

### 实用布局示例

```css
/* 响应式卡片网格 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* 圣杯布局 */
.holy-grail {
  display: grid;
  grid-template: 
    "header header header" auto
    "nav    main   aside" 1fr
    "footer footer footer" auto
    / 200px 1fr 200px;
  min-height: 100vh;
}
```

---

## 🎯 居中方案大全

### 1. Flexbox 居中（推荐）

```css
/* 最简单的方式 */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### 2. Grid 居中

```css
.center {
  display: grid;
  place-items: center;
}

/* 或者 */
.center {
  display: grid;
}
.center > * {
  margin: auto;
}
```

### 3. 绝对定位 + Transform

```css
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 4. 绝对定位 + margin: auto

```css
.center {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 200px;  /* 需要固定尺寸 */
  height: 100px;
}
```

### 5. 行内元素居中

```css
/* 水平居中 */
.text-center {
  text-align: center;
}

/* 垂直居中 */
.line-center {
  line-height: 40px; /* 等于容器高度 */
  height: 40px;
}
```

### 居中方案对比

| 方案 | 水平 | 垂直 | 需要固定尺寸 | 推荐度 |
|-----|------|------|-------------|--------|
| Flexbox | ✅ | ✅ | ❌ | ⭐⭐⭐ |
| Grid place-items | ✅ | ✅ | ❌ | ⭐⭐⭐ |
| Transform | ✅ | ✅ | ❌ | ⭐⭐ |
| margin: auto | ✅ | ✅ | ✅ | ⭐ |
| text-align | ✅ | ❌ | ❌ | ⭐⭐ |

---

## 📱 响应式布局

### 媒体查询

```css
/* 移动优先 */
.container {
  padding: 16px;
}

@media (min-width: 768px) {
  .container {
    padding: 24px;
    max-width: 720px;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 960px;
  }
}
```

### 常用断点

```css
/* 移动端 */
@media (max-width: 767px) { }

/* 平板 */
@media (min-width: 768px) and (max-width: 1023px) { }

/* 桌面 */
@media (min-width: 1024px) { }

/* 大屏 */
@media (min-width: 1440px) { }
```

### Container Queries（新特性）

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}
```

---

## 💡 实用技巧

### 宽高比

```css
/* 现代方案 */
.aspect-ratio {
  aspect-ratio: 16 / 9;
}

/* 传统方案 */
.aspect-ratio-legacy {
  position: relative;
  padding-bottom: 56.25%; /* 9/16 * 100% */
}

.aspect-ratio-legacy > * {
  position: absolute;
  inset: 0;
}
```

### 文字截断

```css
/* 单行截断 */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 多行截断 */
.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### Sticky 定位

```css
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
}
```

### 滚动容器

```css
.scroll-container {
  overflow-y: auto;
  max-height: 400px;
  
  /* 平滑滚动 */
  scroll-behavior: smooth;
  
  /* 隐藏滚动条但保持可滚动 */
  scrollbar-width: none;  /* Firefox */
}

.scroll-container::-webkit-scrollbar {
  display: none;  /* Chrome, Safari */
}
```

---

## 📚 推荐资源

- [CSS-Tricks Flexbox 指南](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [CSS-Tricks Grid 指南](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Froggy](https://flexboxfroggy.com/) - 游戏学 Flexbox
- [Grid Garden](https://cssgridgarden.com/) - 游戏学 Grid
