# 前端面试八股文

前端面试高频知识点总结，帮助快速复习。

## JavaScript 基础

### 数据类型

**基本类型**: string, number, boolean, null, undefined, symbol, bigint

**引用类型**: object (包括 Array, Function, Date 等)

**类型判断**:
```javascript
typeof 'str'      // 'string'
typeof null       // 'object' (历史 bug)
typeof []         // 'object'
typeof function() {} // 'function'

[] instanceof Array  // true
Object.prototype.toString.call([]) // '[object Array]'
```

### 闭包

闭包是函数能够访问其词法作用域外的变量。

```javascript
function createCounter() {
  let count = 0;
  return function() {
    return ++count;
  };
}

const counter = createCounter();
counter(); // 1
counter(); // 2
```

**应用场景**: 数据私有化、函数柯里化、防抖节流

### this 指向

| 调用方式 | this 指向 |
|----------|-----------|
| 普通调用 | window / undefined |
| 对象方法 | 该对象 |
| call/apply/bind | 指定对象 |
| new | 新创建的对象 |
| 箭头函数 | 定义时的外层 this |

### 原型链

```javascript
function Person(name) {
  this.name = name;
}
Person.prototype.sayHello = function() {};

const p = new Person('Tom');

p.__proto__ === Person.prototype  // true
Person.prototype.__proto__ === Object.prototype  // true
Object.prototype.__proto__ === null  // true
```

### 事件循环

执行顺序: 同步代码 → 微任务 → 宏任务

**微任务**: Promise.then, MutationObserver, queueMicrotask

**宏任务**: setTimeout, setInterval, I/O, UI rendering

```javascript
console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);
// 输出: 1, 4, 3, 2
```

### Promise

```javascript
// 状态: pending → fulfilled / rejected
// 特点: 状态不可逆，链式调用

Promise.all([p1, p2])     // 全部成功
Promise.race([p1, p2])    // 第一个完成
Promise.allSettled([p1, p2]) // 全部完成
Promise.any([p1, p2])     // 第一个成功
```

### ES6+ 特性

- let/const (块级作用域)
- 箭头函数
- 解构赋值
- 模板字符串
- 展开运算符
- class
- Promise/async/await
- 模块化 import/export
- 可选链 ?.
- 空值合并 ??

## CSS

### 盒模型

```css
/* 标准盒模型: width = content */
box-sizing: content-box;

/* 怪异盒模型: width = content + padding + border */
box-sizing: border-box;
```

### BFC

**块级格式化上下文**，独立的渲染区域。

触发条件:
- float 不为 none
- position 为 absolute 或 fixed
- display 为 inline-block, flex, grid
- overflow 不为 visible

作用:
- 清除浮动
- 防止 margin 重叠
- 阻止元素被浮动元素覆盖

### 居中方案

```css
/* Flex */
display: flex;
justify-content: center;
align-items: center;

/* Grid */
display: grid;
place-items: center;

/* 定位 + transform */
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
```

### Flex 布局

```css
/* 容器属性 */
flex-direction: row | column
flex-wrap: nowrap | wrap
justify-content: flex-start | center | space-between
align-items: stretch | center | flex-start

/* 项目属性 */
flex: 1;  /* flex-grow: 1; flex-shrink: 1; flex-basis: 0%; */
align-self: center;
order: 1;
```

### 选择器优先级

!important > 内联 > ID > 类/伪类/属性 > 标签 > 通配符

### 重排重绘

**重排 (Reflow)**: 几何属性变化 (位置、大小)

**重绘 (Repaint)**: 外观属性变化 (颜色、背景)

**优化**: 使用 transform 和 opacity，批量修改样式

## 浏览器

### 输入 URL 到页面展示

1. DNS 解析
2. TCP 连接 (三次握手)
3. 发送 HTTP 请求
4. 服务器返回响应
5. 浏览器解析 HTML，构建 DOM
6. 解析 CSS，构建 CSSOM
7. 合并生成 Render Tree
8. Layout 布局
9. Paint 绘制
10. Composite 合成

### 缓存

**强缓存**:
- Cache-Control: max-age=31536000
- Expires

**协商缓存**:
- ETag / If-None-Match
- Last-Modified / If-Modified-Since

### 跨域

**同源策略**: 协议 + 域名 + 端口 相同

**解决方案**:
- CORS (后端设置 Access-Control-Allow-Origin)
- 代理 (开发环境)
- JSONP (仅 GET)

### XSS 和 CSRF

**XSS**: 注入恶意脚本
- 防护: 转义输出、CSP、HttpOnly Cookie

**CSRF**: 跨站请求伪造
- 防护: CSRF Token、SameSite Cookie

## React

### 生命周期

**挂载**: constructor → render → componentDidMount

**更新**: render → componentDidUpdate

**卸载**: componentWillUnmount

### Hooks

```javascript
useState     // 状态
useEffect    // 副作用
useContext   // 上下文
useRef       // 引用
useMemo      // 缓存值
useCallback  // 缓存函数
useReducer   // 复杂状态
```

### Fiber

React 16 引入的新协调引擎:
- 可中断渲染
- 优先级调度
- 增量渲染

### 虚拟 DOM

```javascript
// 虚拟 DOM 对象
{
  type: 'div',
  props: { className: 'container' },
  children: [...]
}
```

**优势**: 批量更新、跨平台、减少直接 DOM 操作

### Diff 算法

- 同层比较
- type 不同直接替换
- key 用于识别列表元素

### 性能优化

- React.memo
- useMemo / useCallback
- 列表使用 key
- 代码分割 (React.lazy)
- 虚拟化长列表

## 网络

### HTTP 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 301 | 永久重定向 |
| 302 | 临时重定向 |
| 304 | 未修改 (协商缓存) |
| 400 | 请求错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 未找到 |
| 500 | 服务器错误 |

### HTTP/1.1 vs HTTP/2

| 特性 | HTTP/1.1 | HTTP/2 |
|------|----------|--------|
| 连接 | 多个 TCP | 单个 TCP 多路复用 |
| 头部 | 文本 | 二进制，压缩 |
| 推送 | 不支持 | 服务端推送 |

### HTTPS

HTTP + TLS 加密

流程: TCP 握手 → TLS 握手 → 加密通信

### WebSocket

全双工通信协议，适用于实时应用。

## 性能优化

### 加载优化

- 资源压缩 (Gzip/Brotli)
- 图片优化 (WebP, 懒加载)
- 代码分割
- 预加载/预连接
- CDN

### 运行时优化

- 减少重排重绘
- 事件委托
- 防抖节流
- Web Worker
- 虚拟列表

### 指标

- FCP: 首次内容绘制
- LCP: 最大内容绘制 (< 2.5s)
- INP: 交互到下一帧 (< 200ms)
- CLS: 累积布局偏移 (< 0.1)

## 工程化

### Webpack

- Entry: 入口
- Output: 输出
- Loader: 处理非 JS 文件
- Plugin: 扩展功能

### Tree Shaking

移除未使用的代码，需要 ES Module。

### 模块化

- CommonJS: require/module.exports (同步，Node)
- ES Module: import/export (异步，浏览器)

## 手写代码

### 防抖

```javascript
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

### 节流

```javascript
function throttle(fn, interval) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
```

### 深拷贝

```javascript
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (map.has(obj)) return map.get(obj);
  
  const clone = Array.isArray(obj) ? [] : {};
  map.set(obj, clone);
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], map);
    }
  }
  return clone;
}
```

### 数组去重

```javascript
// Set
[...new Set(arr)]

// filter
arr.filter((item, index) => arr.indexOf(item) === index)
```

### 数组扁平化

```javascript
// flat
arr.flat(Infinity)

// 递归
function flatten(arr) {
  return arr.reduce((acc, val) => 
    acc.concat(Array.isArray(val) ? flatten(val) : val), []);
}
```

### Promise.all

```javascript
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let count = 0;
    
    promises.forEach((p, i) => {
      Promise.resolve(p).then(value => {
        results[i] = value;
        if (++count === promises.length) {
          resolve(results);
        }
      }).catch(reject);
    });
  });
}
```

## 总结

面试准备建议:

1. **理解原理** - 不只是背诵
2. **动手实践** - 手写代码
3. **项目经验** - 准备 2-3 个有深度的项目
4. **算法刷题** - LeetCode Hot 100
5. **模拟面试** - 练习表达
