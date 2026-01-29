---
slug: micro-frontend
title: 微前端架构设计指南
authors: mason
tags: [微前端, 架构, 前端]
---

微前端是一种将前端应用拆分为独立部署单元的架构模式。本文介绍微前端的核心概念和实现方案。

<!--truncate-->

## 🎯 什么是微前端

```markdown
微前端 = 微服务理念 + 前端应用

核心思想：
- 将大型应用拆分为小型、独立的应用
- 每个应用可以独立开发、测试、部署
- 应用之间松耦合
```

### 适用场景

| 场景 | 说明 |
|------|------|
| 大型企业应用 | 多团队协作 |
| 遗留系统改造 | 渐进式重构 |
| 技术栈迁移 | 新旧并存 |
| 多产品整合 | 统一门户 |

### 不适用场景

```markdown
- 小型项目
- 团队规模小
- 性能要求极高
- 没有明确的业务边界
```

---

## 🏗️ 主流方案

| 方案 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| **qiankun** | 基于 single-spa | 成熟稳定 | 有侵入性 |
| **Module Federation** | Webpack 5 | 共享依赖 | 耦合 Webpack |
| **iframe** | 原生隔离 | 隔离性好 | 通信复杂 |
| **Web Components** | 标准组件 | 框架无关 | 浏览器兼容 |

---

## 📦 qiankun 实战

### 主应用

```bash
npm install qiankun
```

```tsx
// main-app/src/main.tsx
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'react-app',
    entry: '//localhost:3001',
    container: '#subapp-container',
    activeRule: '/react',
    props: {
      user: { name: 'admin' },
    },
  },
  {
    name: 'vue-app',
    entry: '//localhost:3002',
    container: '#subapp-container',
    activeRule: '/vue',
  },
]);

start({
  sandbox: {
    experimentalStyleIsolation: true,
  },
});
```

```tsx
// main-app/src/App.tsx
function App() {
  return (
    <div>
      <nav>
        <Link to="/react">React App</Link>
        <Link to="/vue">Vue App</Link>
      </nav>
      <div id="subapp-container"></div>
    </div>
  );
}
```

### 子应用 (React)

```tsx
// react-app/src/main.tsx
import { createRoot } from 'react-dom/client';
import App from './App';

let root: ReturnType<typeof createRoot> | null = null;

// 独立运行
if (!(window as any).__POWERED_BY_QIANKUN__) {
  root = createRoot(document.getElementById('root')!);
  root.render(<App />);
}

// 生命周期
export async function bootstrap() {
  console.log('react app bootstrap');
}

export async function mount(props: any) {
  console.log('react app mount', props);
  const container = props.container?.querySelector('#root') || document.getElementById('root');
  root = createRoot(container!);
  root.render(<App {...props} />);
}

export async function unmount() {
  console.log('react app unmount');
  root?.unmount();
}
```

```javascript
// react-app/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  plugins: [
    react(),
    qiankun('react-app', { useDevMode: true }),
  ],
  server: {
    port: 3001,
    cors: true,
    origin: 'http://localhost:3001',
  },
});
```

---

## 🔗 Module Federation

### 主应用配置

```javascript
// webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

### 远程应用配置

```javascript
// webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remoteApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button',
        './UserList': './src/components/UserList',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

### 使用远程组件

```tsx
// host/src/App.tsx
import React, { lazy, Suspense } from 'react';

const RemoteButton = lazy(() => import('remoteApp/Button'));
const RemoteUserList = lazy(() => import('remoteApp/UserList'));

function App() {
  return (
    <Suspense fallback="Loading...">
      <RemoteButton />
      <RemoteUserList />
    </Suspense>
  );
}
```

---

## 🔒 样式隔离

### CSS Modules

```tsx
// 子应用使用 CSS Modules
import styles from './App.module.css';

function App() {
  return <div className={styles.container}>...</div>;
}
```

### Shadow DOM

```tsx
// 使用 Shadow DOM 隔离
const container = document.getElementById('app');
const shadow = container.attachShadow({ mode: 'open' });
shadow.innerHTML = `
  <style>
    .btn { color: red; }
  </style>
  <button class="btn">Click</button>
`;
```

### qiankun 样式隔离

```tsx
start({
  sandbox: {
    strictStyleIsolation: true, // Shadow DOM
    // 或
    experimentalStyleIsolation: true, // 添加前缀
  },
});
```

---

## 📡 应用通信

### Props 传递

```tsx
// 主应用
registerMicroApps([
  {
    name: 'sub-app',
    entry: '//localhost:3001',
    container: '#container',
    activeRule: '/sub',
    props: {
      user: currentUser,
      onLogout: handleLogout,
    },
  },
]);

// 子应用
export async function mount(props) {
  console.log(props.user);
  props.onLogout();
}
```

### 全局状态

```tsx
// 主应用
import { initGlobalState } from 'qiankun';

const actions = initGlobalState({
  user: null,
  theme: 'light',
});

actions.onGlobalStateChange((state, prev) => {
  console.log('state changed', state, prev);
});

actions.setGlobalState({ user: { name: 'admin' } });

// 子应用
export async function mount(props) {
  props.onGlobalStateChange((state) => {
    console.log('global state', state);
  });
  
  props.setGlobalState({ theme: 'dark' });
}
```

### 自定义事件

```tsx
// 发送
window.dispatchEvent(new CustomEvent('micro-app-event', {
  detail: { type: 'LOGIN', payload: user },
}));

// 接收
window.addEventListener('micro-app-event', (e) => {
  console.log(e.detail);
});
```

---

## 📂 公共依赖

### 外部化

```javascript
// 子应用 webpack.config.js
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};

// 主应用加载公共依赖
<script src="https://cdn.example.com/react.min.js"></script>
<script src="https://cdn.example.com/react-dom.min.js"></script>
```

### 共享组件库

```tsx
// packages/shared-ui
export { Button } from './Button';
export { Modal } from './Modal';

// 子应用使用
import { Button } from '@company/shared-ui';
```

---

## 🛠️ 开发调试

### 本地开发

```javascript
// 主应用判断环境
const apps = [
  {
    name: 'sub-app',
    entry: process.env.NODE_ENV === 'development'
      ? '//localhost:3001'
      : '//cdn.example.com/sub-app/',
    container: '#container',
    activeRule: '/sub',
  },
];
```

### 独立调试

```javascript
// 子应用独立运行
if (!(window as any).__POWERED_BY_QIANKUN__) {
  render();
}
```

---

## 📋 最佳实践

```markdown
1. 明确应用边界
   - 按业务域拆分
   - 避免过度拆分

2. 统一技术规范
   - 代码规范
   - 接口规范
   - 部署规范

3. 公共资源管理
   - 共享组件库
   - 公共依赖
   - 全局样式

4. 性能优化
   - 预加载
   - 资源复用
   - 按需加载

5. 监控和调试
   - 错误监控
   - 性能监控
   - 日志聚合
```

---

## 📊 架构对比

| 维度 | 单体应用 | 微前端 |
|------|---------|--------|
| 团队协作 | 困难 | 容易 |
| 技术栈 | 统一 | 灵活 |
| 部署 | 整体 | 独立 |
| 性能 | 较好 | 需优化 |
| 复杂度 | 低 | 高 |

---

微前端不是银弹。在决定采用前，请确保它能解决你的实际问题。
