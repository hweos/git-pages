# 浏览器工作原理

理解浏览器工作原理是性能优化的基础，也是面试高频考点。

## 浏览器架构

### 多进程架构

| 进程 | 职责 |
|------|------|
| 浏览器进程 | 主进程，UI、网络、存储 |
| 渲染进程 | 页面渲染，每个标签页独立 |
| GPU 进程 | 图形渲染 |
| 网络进程 | 网络请求 |
| 插件进程 | 浏览器插件 |

### 渲染进程线程

| 线程 | 职责 |
|------|------|
| 主线程 | DOM、CSS、JS、布局、绘制 |
| 合成线程 | 图层合成 |
| 光栅化线程 | 将图层转为位图 |

## 导航流程

### 从输入 URL 到页面展示

1. **URL 解析** - 判断是搜索还是 URL
2. **DNS 解析** - 域名 → IP 地址
3. **建立连接** - TCP 三次握手 + TLS 握手
4. **发送请求** - HTTP 请求
5. **接收响应** - 服务器返回数据
6. **解析渲染** - 构建 DOM、渲染页面

### DNS 解析

```
浏览器缓存 → 系统缓存 → hosts 文件 → 路由器缓存 → ISP DNS → 根DNS → 顶级DNS → 权威DNS
```

```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//api.example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://api.example.com">
```

### TCP 连接

```
三次握手：
1. 客户端 → SYN → 服务器
2. 服务器 → SYN+ACK → 客户端
3. 客户端 → ACK → 服务器

四次挥手：
1. 客户端 → FIN → 服务器
2. 服务器 → ACK → 客户端
3. 服务器 → FIN → 客户端
4. 客户端 → ACK → 服务器
```

## 渲染流程

### 关键渲染路径

```
HTML → DOM Tree
              ↘
                → Render Tree → Layout → Paint → Composite
              ↗
CSS → CSSOM Tree
```

### 1. 构建 DOM

```
Bytes → Characters → Tokens → Nodes → DOM Tree
```

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Page</title>
  </head>
  <body>
    <div>Hello</div>
  </body>
</html>
```

```
document
└── html
    ├── head
    │   └── title
    │       └── "Page"
    └── body
        └── div
            └── "Hello"
```

### 2. 构建 CSSOM

```css
body { font-size: 16px; }
div { color: red; }
```

```
CSSOM
└── body (font-size: 16px)
    └── div (color: red, font-size: 16px)
```

### 3. 构建 Render Tree

- 合并 DOM 和 CSSOM
- 忽略不可见元素 (`display: none`、`<script>`、`<meta>`)
- 处理伪元素

### 4. Layout (布局/回流)

计算每个元素的几何信息：位置、大小

```javascript
// 触发回流的操作
element.offsetWidth
element.offsetHeight
element.getBoundingClientRect()
element.style.width = '100px'
window.getComputedStyle(element)
```

### 5. Paint (绘制)

将元素绘制到图层上

```javascript
// 触发重绘的操作
element.style.color = 'red'
element.style.backgroundColor = 'blue'
element.style.visibility = 'hidden'
```

### 6. Composite (合成)

将多个图层合成最终画面

```css
/* 触发合成层的属性 */
transform: translateZ(0);
will-change: transform;
opacity: 0.5;
```

## 回流与重绘

### 回流 (Reflow)

触发条件：
- 添加/删除 DOM 元素
- 元素尺寸变化
- 内容变化
- 窗口大小变化
- 读取某些属性

### 重绘 (Repaint)

触发条件：
- 颜色变化
- 背景变化
- 边框样式变化

### 优化策略

```javascript
// ❌ 多次回流
el.style.width = '100px';
el.style.height = '100px';
el.style.margin = '10px';

// ✅ 批量修改
el.style.cssText = 'width: 100px; height: 100px; margin: 10px;';
// 或
el.classList.add('new-style');

// ❌ 读写交替
el.style.width = el.offsetWidth + 10 + 'px';
el.style.height = el.offsetHeight + 10 + 'px';

// ✅ 先读后写
const width = el.offsetWidth;
const height = el.offsetHeight;
el.style.width = width + 10 + 'px';
el.style.height = height + 10 + 'px';
```

## JavaScript 执行

### 执行上下文

```
全局执行上下文
└── 函数执行上下文
    └── eval 执行上下文
```

每个执行上下文包含：
- 变量环境 (var)
- 词法环境 (let/const)
- this 绑定

### 调用栈

```javascript
function a() {
  b();
}
function b() {
  c();
}
function c() {
  console.trace(); // 打印调用栈
}
a();

// 调用栈：
// c
// b
// a
// (anonymous)
```

### 事件循环

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');

// 输出: 1, 4, 3, 2
```

执行顺序：
1. 同步代码
2. 微任务队列（全部执行）
3. 宏任务队列（一个）
4. 重复 2-3

| 微任务 | 宏任务 |
|--------|--------|
| Promise.then | setTimeout |
| MutationObserver | setInterval |
| queueMicrotask | requestAnimationFrame |
| process.nextTick | I/O |

## 资源加载

### 脚本加载

```html
<!-- 阻塞解析 -->
<script src="app.js"></script>

<!-- 异步加载，下载完立即执行 -->
<script src="app.js" async></script>

<!-- 异步加载，DOM 解析完后执行 -->
<script src="app.js" defer></script>

<!-- 模块 -->
<script type="module" src="app.js"></script>
```

```
普通: HTML解析 → 暂停 → 下载JS → 执行JS → 继续解析

async: HTML解析 ────────────────────────→
              ↘ 下载JS → 执行JS ↗

defer: HTML解析 ────────────────────────→ 执行JS
              ↘ 下载JS ↗
```

### 预加载

```html
<!-- 预加载：高优先级，当前页面需要 -->
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="main.js" as="script">
<link rel="preload" href="hero.jpg" as="image">

<!-- 预获取：低优先级，下个页面可能需要 -->
<link rel="prefetch" href="next-page.js">

<!-- 预渲染：提前渲染整个页面 -->
<link rel="prerender" href="https://example.com/next">
```

### CSS 加载

```html
<!-- 阻塞渲染 -->
<link rel="stylesheet" href="style.css">

<!-- 条件加载 -->
<link rel="stylesheet" href="print.css" media="print">
<link rel="stylesheet" href="mobile.css" media="(max-width: 768px)">

<!-- 异步加载 CSS -->
<link rel="preload" href="style.css" as="style" onload="this.rel='stylesheet'">
```

## 缓存机制

### HTTP 缓存

```
强缓存：
Cache-Control: max-age=31536000
Expires: Thu, 01 Jan 2025 00:00:00 GMT

协商缓存：
ETag: "abc123"
If-None-Match: "abc123"

Last-Modified: Mon, 01 Jan 2024 00:00:00 GMT
If-Modified-Since: Mon, 01 Jan 2024 00:00:00 GMT
```

### 缓存策略

```
HTML: no-cache（每次验证）
JS/CSS: max-age=31536000 + 文件名 hash
图片: max-age=86400
API: no-store
```

### 浏览器存储

| 存储 | 大小 | 生命周期 | 作用域 |
|------|------|----------|--------|
| Cookie | 4KB | 可设置 | 同源+路径 |
| LocalStorage | 5-10MB | 永久 | 同源 |
| SessionStorage | 5-10MB | 会话 | 同源+标签页 |
| IndexedDB | 无限制 | 永久 | 同源 |

## 性能指标

### Core Web Vitals

| 指标 | 含义 | 目标 |
|------|------|------|
| LCP | 最大内容绘制 | < 2.5s |
| INP | 交互到下一帧绘制 | < 200ms |
| CLS | 累积布局偏移 | < 0.1 |

### 其他指标

| 指标 | 含义 |
|------|------|
| FCP | 首次内容绘制 |
| TTFB | 首字节时间 |
| TTI | 可交互时间 |
| TBT | 总阻塞时间 |

### 测量

```javascript
// Performance API
performance.timing
performance.getEntriesByType('navigation')
performance.getEntriesByType('resource')

// Web Vitals
import { getLCP, getFID, getCLS } from 'web-vitals';

getLCP(console.log);
getFID(console.log);
getCLS(console.log);
```

## 安全机制

### 同源策略

同源 = 协议 + 域名 + 端口 相同

```javascript
// 跨域解决方案
// 1. CORS
Access-Control-Allow-Origin: *

// 2. JSONP (仅 GET)
<script src="api?callback=handleData"></script>

// 3. 代理
// 开发环境代理或服务端代理
```

### XSS 防护

```javascript
// 内容安全策略
Content-Security-Policy: default-src 'self'; script-src 'self'

// 转义输出
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}
```

### CSRF 防护

```javascript
// CSRF Token
<input type="hidden" name="_token" value="random-token">

// SameSite Cookie
Set-Cookie: session=abc; SameSite=Strict
```

## 总结

| 阶段 | 关键点 |
|------|--------|
| 网络 | DNS、TCP、HTTP |
| 解析 | DOM、CSSOM 构建 |
| 渲染 | 布局、绘制、合成 |
| 执行 | 事件循环、调用栈 |
| 缓存 | 强缓存、协商缓存 |
| 安全 | 同源策略、CSP |
