---
slug: browser-rendering
title: 浏览器渲染原理深度解析
authors: mason
tags: [浏览器, 性能, 前端]
---

理解浏览器渲染原理是前端性能优化的基础。本文深入解析从 HTML 到像素的完整过程。

<!--truncate-->

## 🔄 渲染流程概览

```
HTML → DOM Tree
              ↘
                → Render Tree → Layout → Paint → Composite
              ↗
CSS → CSSOM Tree
```

1. **解析 HTML** → 构建 DOM Tree
2. **解析 CSS** → 构建 CSSOM Tree  
3. **合并** → 生成 Render Tree
4. **布局 (Layout)** → 计算几何信息
5. **绘制 (Paint)** → 填充像素
6. **合成 (Composite)** → 图层合成

---

## 🌳 DOM 与 CSSOM

### DOM Tree 构建

```html
<html>
  <head><title>Page</title></head>
  <body>
    <div class="container">
      <p>Hello</p>
    </div>
  </body>
</html>
```

```
Document
└── html
    ├── head
    │   └── title
    │       └── "Page"
    └── body
        └── div.container
            └── p
                └── "Hello"
```

### CSSOM Tree 构建

```css
body { font-size: 16px; }
.container { width: 100%; }
p { color: blue; }
```

```
body
├── font-size: 16px
└── .container
    ├── width: 100%
    └── p
        └── color: blue
```

### 阻塞行为

| 资源 | 阻塞 DOM 解析 | 阻塞渲染 |
|------|--------------|---------|
| HTML | - | - |
| CSS | ❌ | ✅ |
| `<script>` | ✅ | ✅ |
| `<script async>` | ❌ | ❌ |
| `<script defer>` | ❌ | ❌ |

---

## 📐 Layout (Reflow) 重排

### 什么是重排

计算元素的几何信息：位置、大小。

### 触发重排的操作

```javascript
// 修改几何属性
element.style.width = '100px';
element.style.height = '200px';
element.style.margin = '10px';
element.style.padding = '20px';

// 读取几何属性
element.offsetWidth;
element.offsetHeight;
element.getBoundingClientRect();

// DOM 操作
element.appendChild(child);
element.removeChild(child);

// 其他
window.resize
改变字体大小
```

### 避免重排

```javascript
// ❌ 触发多次重排
element.style.width = '100px';
element.style.height = '200px';
element.style.margin = '10px';

// ✅ 使用 class 一次性修改
element.classList.add('new-style');

// ✅ 使用 cssText
element.style.cssText = 'width: 100px; height: 200px; margin: 10px;';

// ✅ 离线操作 DOM
const fragment = document.createDocumentFragment();
items.forEach(item => fragment.appendChild(createItem(item)));
container.appendChild(fragment);
```

### 强制同步布局

```javascript
// ❌ 读写交替导致强制同步布局
for (let i = 0; i < elements.length; i++) {
  elements[i].style.width = box.offsetWidth + 'px'; // 每次循环都触发重排
}

// ✅ 先读后写
const width = box.offsetWidth;
for (let i = 0; i < elements.length; i++) {
  elements[i].style.width = width + 'px';
}
```

---

## 🎨 Paint (Repaint) 重绘

### 什么是重绘

填充像素：颜色、背景、阴影等。

### 只触发重绘的属性

```javascript
// 不影响布局，只触发重绘
element.style.color = 'red';
element.style.backgroundColor = 'blue';
element.style.visibility = 'hidden';
element.style.boxShadow = '0 0 10px black';
```

### 重绘 vs 重排

| 操作 | 重排 | 重绘 |
|------|------|------|
| 修改 width/height | ✅ | ✅ |
| 修改 color | ❌ | ✅ |
| 修改 transform | ❌ | ❌ |
| 修改 opacity | ❌ | ❌ |

---

## 🧩 Composite 合成

### 什么是合成

将多个图层合并成最终图像，由 GPU 处理。

### 创建独立图层的属性

```css
/* 以下属性会创建新图层 */
transform: translateZ(0);
will-change: transform;
opacity: 0.99;
position: fixed;
```

### 只触发合成的属性

```css
/* 最高性能 - 只触发合成 */
transform: translate(), scale(), rotate();
opacity: 0 ~ 1;
```

---

## ⚡ 性能优化策略

### 1. 减少关键资源

```html
<!-- 内联关键 CSS -->
<style>
  /* 首屏关键样式 */
</style>

<!-- 异步加载非关键 CSS -->
<link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
```

### 2. 减少阻塞

```html
<!-- JS 放底部或使用 defer -->
<script defer src="app.js"></script>

<!-- 预加载关键资源 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>
```

### 3. 使用 transform 替代位置属性

```css
/* ❌ 触发重排 */
.animate {
  left: 100px;
  top: 100px;
}

/* ✅ 只触发合成 */
.animate {
  transform: translate(100px, 100px);
}
```

### 4. 使用 requestAnimationFrame

```javascript
// ❌ 可能在不合适的时机执行
setInterval(() => {
  element.style.transform = `translateX(${x++}px)`;
}, 16);

// ✅ 与浏览器刷新同步
function animate() {
  element.style.transform = `translateX(${x++}px)`;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

### 5. 虚拟列表

```javascript
// 只渲染可见区域的元素
// 使用 react-window / react-virtualized
```

---

## 🔍 调试工具

### Chrome DevTools

1. **Performance** 面板
   - 录制渲染过程
   - 查看火焰图
   - 分析长任务

2. **Rendering** 面板
   - Paint flashing（高亮重绘区域）
   - Layout Shift Regions（布局偏移）
   - Layer borders（图层边界）
   - FPS meter（帧率显示）

### 打开 Rendering 面板

1. 打开 DevTools
2. Cmd+Shift+P
3. 输入 "Show Rendering"

---

## 📊 核心 Web 指标

| 指标 | 含义 | 目标 |
|------|------|------|
| **LCP** | 最大内容绘制 | < 2.5s |
| **FID** | 首次输入延迟 | < 100ms |
| **CLS** | 累积布局偏移 | < 0.1 |
| **FCP** | 首次内容绘制 | < 1.8s |
| **TTFB** | 首字节时间 | < 800ms |

---

## 📚 推荐资源

- [Inside look at modern web browser](https://developer.chrome.com/blog/inside-browser-part1/)
- [Rendering Performance](https://web.dev/rendering-performance/)
- [CSS Triggers](https://csstriggers.com/)

---

理解渲染原理后，你会更清楚为什么某些优化策略有效。记住：**测量先于优化**。
