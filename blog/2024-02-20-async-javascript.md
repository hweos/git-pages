---
slug: async-javascript
title: JavaScript 异步编程进阶
authors: mason
tags: [JavaScript, 异步, Promise]
---

异步编程是 JavaScript 的核心特性。本文从原理到实践，带你深入理解 Promise 和 async/await。

<!--truncate-->

## 🔄 为什么需要异步

JavaScript 是单线程语言，如果所有操作都同步执行，遇到耗时操作（网络请求、文件读写）时，页面就会卡住。

```javascript
// 如果是同步的话...
const data = fetchData();  // 等待 3 秒
console.log(data);         // 页面卡住 3 秒才执行
```

异步编程让我们能够：
- 不阻塞主线程
- 同时处理多个任务
- 保持页面响应

---

## 📚 异步演进史

### 1. 回调函数（Callback）

```javascript
// 回调地狱
getData(function(a) {
  getMoreData(a, function(b) {
    getMoreData(b, function(c) {
      getMoreData(c, function(d) {
        console.log(d);
      });
    });
  });
});
```

**问题**：回调地狱、错误处理困难、代码难以维护

### 2. Promise

```javascript
getData()
  .then(a => getMoreData(a))
  .then(b => getMoreData(b))
  .then(c => getMoreData(c))
  .then(d => console.log(d))
  .catch(err => console.error(err));
```

**优点**：链式调用、统一的错误处理

### 3. async/await

```javascript
async function fetchAll() {
  try {
    const a = await getData();
    const b = await getMoreData(a);
    const c = await getMoreData(b);
    const d = await getMoreData(c);
    console.log(d);
  } catch (err) {
    console.error(err);
  }
}
```

**优点**：同步写法、直观易读

---

## 🎯 Promise 深入理解

### Promise 的三种状态

```javascript
// pending -> fulfilled
const p1 = new Promise((resolve) => {
  setTimeout(() => resolve('成功'), 1000);
});

// pending -> rejected
const p2 = new Promise((_, reject) => {
  setTimeout(() => reject('失败'), 1000);
});
```

```
pending（进行中）
    ├── fulfilled（已成功）
    └── rejected（已失败）
```

### 手写简易 Promise

```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.callbacks = [];

    const resolve = (value) => {
      if (this.state !== 'pending') return;
      this.state = 'fulfilled';
      this.value = value;
      this.callbacks.forEach(cb => cb.onFulfilled(value));
    };

    const reject = (reason) => {
      if (this.state !== 'pending') return;
      this.state = 'rejected';
      this.value = reason;
      this.callbacks.forEach(cb => cb.onRejected(reason));
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handle = (callback, resolveOrReject) => {
        try {
          const result = callback(this.value);
          if (result instanceof MyPromise) {
            result.then(resolve, reject);
          } else {
            resolveOrReject(result);
          }
        } catch (err) {
          reject(err);
        }
      };

      if (this.state === 'fulfilled') {
        setTimeout(() => handle(onFulfilled, resolve));
      } else if (this.state === 'rejected') {
        setTimeout(() => handle(onRejected, reject));
      } else {
        this.callbacks.push({
          onFulfilled: () => handle(onFulfilled, resolve),
          onRejected: () => handle(onRejected, reject),
        });
      }
    });
  }
}
```

---

## 🔧 Promise 静态方法

### Promise.all - 全部成功

```javascript
const promises = [
  fetch('/api/user'),
  fetch('/api/posts'),
  fetch('/api/comments')
];

// 全部成功才返回，任一失败则失败
const [user, posts, comments] = await Promise.all(promises);
```

### Promise.allSettled - 获取所有结果

```javascript
const results = await Promise.allSettled(promises);

results.forEach(result => {
  if (result.status === 'fulfilled') {
    console.log('成功:', result.value);
  } else {
    console.log('失败:', result.reason);
  }
});
```

### Promise.race - 竞速

```javascript
// 超时控制
const timeout = new Promise((_, reject) => 
  setTimeout(() => reject('超时'), 5000)
);

try {
  const data = await Promise.race([fetchData(), timeout]);
  console.log(data);
} catch (err) {
  console.error(err);  // '超时'
}
```

### Promise.any - 任一成功

```javascript
// 多个备用源，取最快成功的
const data = await Promise.any([
  fetch('https://api1.example.com/data'),
  fetch('https://api2.example.com/data'),
  fetch('https://api3.example.com/data')
]);
```

---

## ⚡ async/await 最佳实践

### 1. 并行执行

```javascript
// ❌ 串行执行，慢
async function fetchData() {
  const user = await fetchUser();      // 1秒
  const posts = await fetchPosts();    // 1秒
  const comments = await fetchComments(); // 1秒
  // 总共 3 秒
}

// ✅ 并行执行，快
async function fetchData() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]);
  // 总共约 1 秒
}
```

### 2. 错误处理

```javascript
// 方式1：try-catch
async function fetchData() {
  try {
    const data = await fetch('/api/data');
    return data.json();
  } catch (err) {
    console.error('请求失败:', err);
    return null;
  }
}

// 方式2：包装函数
async function to(promise) {
  try {
    const data = await promise;
    return [null, data];
  } catch (err) {
    return [err, null];
  }
}

// 使用
const [err, data] = await to(fetchData());
if (err) {
  console.error(err);
}
```

### 3. 循环中的异步

```javascript
// ❌ forEach 不会等待
urls.forEach(async (url) => {
  await fetch(url);  // 不会等待
});
console.log('完成');  // 立即执行

// ✅ for...of 会等待
for (const url of urls) {
  await fetch(url);
}
console.log('完成');  // 全部请求完成后执行

// ✅ 并行处理
await Promise.all(urls.map(url => fetch(url)));
console.log('完成');
```

### 4. 立即执行的 async 函数

```javascript
// IIFE 写法
(async () => {
  const data = await fetchData();
  console.log(data);
})();

// 顶层 await（ES2022+，模块中可用）
const data = await fetchData();
console.log(data);
```

---

## 🔄 Event Loop 与微任务

### 执行顺序

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');

// 输出: 1 4 3 2
```

**执行顺序**：
1. 同步代码
2. 微任务（Promise.then、queueMicrotask）
3. 宏任务（setTimeout、setInterval）

### 微任务 vs 宏任务

| 类型 | 示例 |
|------|------|
| 微任务 | Promise.then、async/await、queueMicrotask |
| 宏任务 | setTimeout、setInterval、setImmediate、I/O |

---

## 💡 实战技巧

### 1. 请求重试

```javascript
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(1000 * Math.pow(2, i));  // 指数退避
    }
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
```

### 2. 并发控制

```javascript
async function asyncPool(limit, items, fn) {
  const results = [];
  const executing = [];

  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);

    if (items.length >= limit) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.all(results);
}

// 使用：最多 3 个并发
await asyncPool(3, urls, url => fetch(url));
```

### 3. 取消请求

```javascript
const controller = new AbortController();

fetch('/api/data', { signal: controller.signal })
  .then(res => res.json())
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('请求被取消');
    }
  });

// 取消请求
controller.abort();
```

---

## 📋 总结

| 场景 | 推荐方案 |
|------|---------|
| 多个独立请求 | `Promise.all` 并行 |
| 需要所有结果 | `Promise.allSettled` |
| 竞速/超时控制 | `Promise.race` |
| 任一成功即可 | `Promise.any` |
| 顺序执行 | `for...of` + await |
| 错误处理 | try-catch 或 .catch() |

掌握异步编程是成为 JavaScript 高手的必经之路。希望这篇文章能帮助你更深入地理解这个主题！
