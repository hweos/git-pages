---
slug: nextjs-app-router
title: Next.js App Router 实战指南
authors: mason
tags: [Next.js, React, 框架]
---

Next.js 13 引入的 App Router 带来了全新的开发体验。本文详解 App Router 的核心概念和最佳实践。

<!--truncate-->

## 🎯 App Router vs Pages Router

| 特性 | Pages Router | App Router |
|------|-------------|------------|
| 路由定义 | `pages/` 目录 | `app/` 目录 |
| 布局 | `_app.js`, `_document.js` | `layout.tsx` 嵌套 |
| 数据获取 | `getServerSideProps` 等 | `async` 组件 |
| 默认渲染 | 客户端组件 | 服务端组件 |
| Streaming | 不支持 | 支持 |

---

## 📂 目录结构

```
app/
├── layout.tsx          # 根布局
├── page.tsx            # 首页 /
├── loading.tsx         # 加载状态
├── error.tsx           # 错误边界
├── not-found.tsx       # 404 页面
├── blog/
│   ├── layout.tsx      # 博客布局
│   ├── page.tsx        # /blog
│   └── [slug]/
│       └── page.tsx    # /blog/:slug
├── api/
│   └── users/
│       └── route.ts    # API 路由
└── (marketing)/        # 路由组
    ├── about/
    │   └── page.tsx
    └── contact/
        └── page.tsx
```

### 特殊文件

| 文件 | 作用 |
|------|------|
| `page.tsx` | 页面组件 |
| `layout.tsx` | 共享布局 |
| `loading.tsx` | 加载 UI |
| `error.tsx` | 错误边界 |
| `not-found.tsx` | 404 页面 |
| `route.ts` | API 路由 |
| `template.tsx` | 模板（每次重新挂载） |

---

## 🧩 服务端组件 vs 客户端组件

### 服务端组件（默认）

```tsx
// app/posts/page.tsx
// 默认是服务端组件，可以直接 async

async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'no-store', // 动态数据
  });
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### 客户端组件

```tsx
'use client'; // 标记为客户端组件

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### 何时使用客户端组件

```markdown
需要 'use client' 的场景：
- 使用 useState, useEffect 等 Hooks
- 使用浏览器 API（window, document）
- 事件监听（onClick, onChange）
- 使用仅客户端的库
```

### 组合模式

```tsx
// app/dashboard/page.tsx (服务端)
import Counter from './Counter'; // 客户端组件

async function getData() {
  const res = await fetch('...');
  return res.json();
}

export default async function Dashboard() {
  const data = await getData();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Server data: {data.value}</p>
      <Counter /> {/* 客户端组件 */}
    </div>
  );
}
```

---

## 📊 数据获取

### 服务端获取

```tsx
// 静态数据（构建时获取）
async function getStaticData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'force-cache', // 默认
  });
  return res.json();
}

// 动态数据（每次请求）
async function getDynamicData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'no-store',
  });
  return res.json();
}

// 定时重新验证
async function getRevalidatedData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }, // 每小时
  });
  return res.json();
}
```

### 并行数据获取

```tsx
export default async function Page() {
  // 并行获取，不阻塞
  const [user, posts] = await Promise.all([
    getUser(),
    getPosts(),
  ]);

  return (
    <div>
      <UserProfile user={user} />
      <PostList posts={posts} />
    </div>
  );
}
```

---

## 🎨 布局系统

### 根布局

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'My App',
  description: 'App description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <header>Header</header>
        <main>{children}</main>
        <footer>Footer</footer>
      </body>
    </html>
  );
}
```

### 嵌套布局

```tsx
// app/blog/layout.tsx
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="blog-layout">
      <aside>Sidebar</aside>
      <article>{children}</article>
    </div>
  );
}
```

### 路由组

```
app/
├── (marketing)/      # 不影响 URL
│   ├── layout.tsx    # 营销页布局
│   ├── about/
│   └── contact/
└── (dashboard)/
    ├── layout.tsx    # 仪表盘布局
    ├── settings/
    └── profile/
```

---

## ⏳ Loading 和 Error

### Loading UI

```tsx
// app/blog/loading.tsx
export default function Loading() {
  return (
    <div className="loading">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
}
```

### Error 边界

```tsx
'use client';

// app/blog/error.tsx
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## 🔌 API 路由

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const users = await db.users.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.users.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}

// 动态路由参数
// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.users.findUnique({
    where: { id: params.id },
  });
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(user);
}
```

---

## 🚀 Server Actions

```tsx
// app/posts/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  await db.posts.create({
    data: { title, content },
  });

  revalidatePath('/posts');
}

// app/posts/new/page.tsx
import { createPost } from '../actions';

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Title" />
      <textarea name="content" placeholder="Content" />
      <button type="submit">Create</button>
    </form>
  );
}
```

---

## 📋 最佳实践

```markdown
1. 默认使用服务端组件
2. 只在必要时使用 'use client'
3. 客户端组件放在组件树底部
4. 使用 loading.tsx 优化加载体验
5. 合理使用缓存策略
6. 使用 Server Actions 处理表单
```

---

App Router 是 Next.js 的未来方向，值得深入学习和实践。
