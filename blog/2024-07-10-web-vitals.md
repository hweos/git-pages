---
slug: web-vitals
title: Web 性能指标与优化实战
authors: mason
tags: [性能, 前端, Core Web Vitals]
---

Core Web Vitals 是 Google 提出的网页体验核心指标。本文详解各项指标的含义和优化方法。

<!--truncate-->

## 🎯 核心指标概览

| 指标 | 全称 | 含义 | 目标值 |
|------|------|------|--------|
| **LCP** | Largest Contentful Paint | 最大内容绘制 | ≤ 2.5s |
| **INP** | Interaction to Next Paint | 交互到下一次绘制 | ≤ 200ms |
| **CLS** | Cumulative Layout Shift | 累积布局偏移 | ≤ 0.1 |

### 其他重要指标

| 指标 | 含义 | 目标值 |
|------|------|--------|
| **FCP** | 首次内容绘制 | ≤ 1.8s |
| **TTFB** | 首字节时间 | ≤ 800ms |
| **TBT** | 总阻塞时间 | ≤ 200ms |

---

## 📊 LCP 最大内容绘制

### 什么是 LCP

视口内最大可见内容元素渲染完成的时间。

```markdown
LCP 元素通常是：
- <img> 图片
- <video> 视频封面
- 带背景图的元素
- 大块文本
```

### 优化策略

**1. 优化资源加载**

```html
<!-- 预加载关键资源 -->
<link rel="preload" href="hero.jpg" as="image">
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- 预连接第三方域名 -->
<link rel="preconnect" href="https://cdn.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">
```

**2. 图片优化**

```html
<!-- 响应式图片 -->
<img 
  srcset="hero-480.jpg 480w, hero-800.jpg 800w, hero-1200.jpg 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 1000px) 800px, 1200px"
  src="hero-800.jpg"
  alt="Hero"
>

<!-- 使用现代格式 -->
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero">
</picture>
```

**3. 服务端优化**

```markdown
- 使用 CDN 分发静态资源
- 启用 Gzip/Brotli 压缩
- 优化 TTFB（服务器响应时间）
- 使用 HTTP/2 或 HTTP/3
```

---

## ⚡ INP 交互响应

### 什么是 INP

用户交互（点击、触摸、键盘）到页面视觉响应的时间。

### 优化策略

**1. 分解长任务**

```javascript
// ❌ 长任务阻塞主线程
function processLargeArray(items) {
  items.forEach(item => heavyProcess(item));
}

// ✅ 使用 scheduler 分片
async function processLargeArray(items) {
  for (const item of items) {
    heavyProcess(item);
    // 让出主线程
    await scheduler.yield();
  }
}

// ✅ 或使用 requestIdleCallback
function processInChunks(items, index = 0) {
  const chunk = items.slice(index, index + 100);
  chunk.forEach(heavyProcess);
  
  if (index + 100 < items.length) {
    requestIdleCallback(() => processInChunks(items, index + 100));
  }
}
```

**2. 避免主线程阻塞**

```javascript
// ❌ 同步操作
const data = JSON.parse(hugeString);

// ✅ Web Worker 处理
const worker = new Worker('parser.js');
worker.postMessage(hugeString);
worker.onmessage = (e) => {
  const data = e.data;
};
```

**3. 优化事件处理**

```javascript
// ❌ 频繁触发
window.addEventListener('scroll', handleScroll);

// ✅ 使用防抖/节流
window.addEventListener('scroll', throttle(handleScroll, 100));

// ✅ 使用 passive 选项
window.addEventListener('scroll', handleScroll, { passive: true });
```

---

## 📐 CLS 布局稳定性

### 什么是 CLS

页面生命周期内所有意外布局偏移的累积分数。

### 常见原因

```markdown
1. 无尺寸的图片/视频
2. 动态插入的内容
3. 字体闪烁 (FOIT/FOUT)
4. 动画使用非合成属性
```

### 优化策略

**1. 图片/视频设置尺寸**

```html
<!-- ✅ 始终设置宽高 -->
<img src="photo.jpg" width="800" height="600" alt="Photo">

<!-- ✅ 或使用 aspect-ratio -->
<style>
  img {
    width: 100%;
    aspect-ratio: 16 / 9;
  }
</style>
```

**2. 预留空间**

```css
/* 广告/嵌入内容预留空间 */
.ad-container {
  min-height: 250px;
}

/* 骨架屏 */
.skeleton {
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
}
```

**3. 字体优化**

```css
/* 使用 font-display */
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap; /* 或 optional */
}

/* 预加载关键字体 */
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
```

**4. 动画使用 transform**

```css
/* ❌ 触发布局偏移 */
.animate {
  left: 100px;
  width: 200px;
}

/* ✅ 只触发合成 */
.animate {
  transform: translateX(100px) scale(1.2);
}
```

---

## 🛠️ 测量工具

### 开发工具

| 工具 | 用途 |
|------|------|
| **Lighthouse** | Chrome DevTools 集成 |
| **PageSpeed Insights** | 在线分析 |
| **WebPageTest** | 详细瀑布图 |
| **Chrome UX Report** | 真实用户数据 |

### 代码测量

```javascript
// 使用 web-vitals 库
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP(console.log);
onINP(console.log);
onCLS(console.log);

// 上报到分析服务
function sendToAnalytics(metric) {
  fetch('/analytics', {
    method: 'POST',
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
    }),
  });
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
```

### Performance API

```javascript
// 获取 LCP
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.startTime);
}).observe({ type: 'largest-contentful-paint', buffered: true });

// 获取 CLS
let clsValue = 0;
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsValue += entry.value;
    }
  }
  console.log('CLS:', clsValue);
}).observe({ type: 'layout-shift', buffered: true });
```

---

## 📋 优化清单

### LCP 优化

- [ ] 预加载 LCP 元素资源
- [ ] 使用 CDN
- [ ] 优化图片（格式、尺寸、压缩）
- [ ] 减少服务器响应时间
- [ ] 移除阻塞渲染的资源

### INP 优化

- [ ] 分解长任务（< 50ms）
- [ ] 使用 Web Worker
- [ ] 防抖/节流事件处理
- [ ] 减少 JavaScript 体积
- [ ] 延迟非关键 JS

### CLS 优化

- [ ] 图片/视频设置尺寸
- [ ] 预留动态内容空间
- [ ] 优化字体加载
- [ ] 避免在现有内容上方插入
- [ ] 使用 transform 动画

---

## 📚 推荐资源

- [web.dev - Core Web Vitals](https://web.dev/vitals/)
- [web-vitals 库](https://github.com/GoogleChrome/web-vitals)
- [PageSpeed Insights](https://pagespeed.web.dev/)

---

性能优化是持续的过程。先测量，再优化，持续监控。
