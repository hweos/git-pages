---
slug: ssr-ssg-isr
title: SSR vs SSG vs ISR 渲染策略对比
authors: mason
tags: [渲染, Next.js, 性能]
---

现代前端有多种渲染策略可选。本文对比 SSR、SSG、ISR、CSR 的特点和适用场景。

<!--truncate-->

## 🎯 渲染策略概览

| 策略 | 全称 | 渲染时机 | 特点 |
|------|------|---------|------|
| **CSR** | Client-Side Rendering | 浏览器 | SPA 默认 |
| **SSR** | Server-Side Rendering | 每次请求 | 动态内容 |
| **SSG** | Static Site Generation | 构建时 | 静态内容 |
| **ISR** | Incremental Static Regeneration | 按需重新生成 | 混合策略 |

---

## 🖥️ CSR 客户端渲染

### 工作流程

```
1. 浏览器请求 HTML
2. 返回空 HTML + JS
3. 下载并执行 JS
4. JS 请求数据
5. 渲染页面
```

### 示例 (React)

```tsx
function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <Loading />;
  
  return <PostList posts={posts} />;
}
```

### 优缺点

```markdown
✅ 优点：
- 交互体验好
- 服务器压力小
- 部署简单（CDN）

❌ 缺点：
- 首屏加载慢
- SEO 不友好
- 白屏时间长
```

### 适用场景

```markdown
- 后台管理系统
- 不需要 SEO 的应用
- 高度交互的应用
- 用户登录后的页面
```

---

## 🌐 SSR 服务端渲染

### 工作流程

```
1. 浏览器请求页面
2. 服务器获取数据
3. 服务器渲染 HTML
4. 返回完整 HTML
5. 浏览器显示页面
6. Hydration 激活交互
```

### 示例 (Next.js)

```tsx
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'no-store', // 每次请求都获取
  });
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <h1>Posts</h1>
      <PostList posts={posts} />
    </div>
  );
}
```

### 优缺点

```markdown
✅ 优点：
- 首屏加载快
- SEO 友好
- 数据实时性好

❌ 缺点：
- 服务器压力大
- TTFB 较长
- 需要服务器运行
- 成本较高
```

### 适用场景

```markdown
- 需要 SEO 的页面
- 数据频繁更新
- 个性化内容
- 用户相关页面
```

---

## 📄 SSG 静态生成

### 工作流程

```
构建阶段：
1. 获取所有数据
2. 生成所有 HTML
3. 部署到 CDN

访问阶段：
1. 直接返回静态 HTML
```

### 示例 (Next.js)

```tsx
// app/blog/[slug]/page.tsx

// 生成静态路径
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 页面组件
export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}

// 数据获取（构建时缓存）
async function getPost(slug: string) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    cache: 'force-cache', // 默认，构建时缓存
  });
  return res.json();
}
```

### 优缺点

```markdown
✅ 优点：
- 性能最好
- CDN 加速
- 成本低
- 安全性高

❌ 缺点：
- 数据更新需重新构建
- 构建时间长（大量页面）
- 不适合频繁更新内容
```

### 适用场景

```markdown
- 博客、文档
- 营销页面
- 产品介绍
- 内容不常变化的页面
```

---

## ♻️ ISR 增量静态再生

### 工作流程

```
1. 构建时生成静态页面
2. 设置重新验证时间
3. 超时后，下次请求触发重新生成
4. 新页面替换旧页面
```

### 示例 (Next.js)

```tsx
// app/products/[id]/page.tsx

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>${product.price}</p>
    </div>
  );
}

async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    next: { revalidate: 60 }, // 60 秒后重新验证
  });
  return res.json();
}
```

### 按需重新验证

```tsx
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { path, tag } = await request.json();

  if (path) {
    revalidatePath(path);
  }
  
  if (tag) {
    revalidateTag(tag);
  }

  return Response.json({ revalidated: true });
}

// 使用 tag
async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    next: { tags: ['products', `product-${id}`] },
  });
  return res.json();
}

// 触发重新验证
await fetch('/api/revalidate', {
  method: 'POST',
  body: JSON.stringify({ tag: 'products' }),
});
```

### 优缺点

```markdown
✅ 优点：
- 兼顾性能和实时性
- 按需更新
- 减少构建时间

❌ 缺点：
- 首次访问可能返回旧数据
- 配置复杂度增加
```

### 适用场景

```markdown
- 电商产品页
- 新闻内容
- 需要定期更新的静态内容
```

---

## 📊 对比总结

| 维度 | CSR | SSR | SSG | ISR |
|------|-----|-----|-----|-----|
| 首屏速度 | 慢 | 中 | 快 | 快 |
| SEO | 差 | 好 | 好 | 好 |
| 数据实时性 | 高 | 高 | 低 | 中 |
| 服务器负载 | 低 | 高 | 无 | 低 |
| 构建时间 | 短 | - | 长 | 中 |
| 部署成本 | 低 | 高 | 低 | 低 |

---

## 🎨 混合使用

### Next.js 中的混合策略

```tsx
// 静态页面
// app/about/page.tsx
export default function About() {
  return <div>About Us</div>;
}

// SSR 页面
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const data = await fetchUserData();
  return <Dashboard data={data} />;
}

// ISR 页面
// app/products/page.tsx
async function getProducts() {
  const res = await fetch('...', {
    next: { revalidate: 3600 },
  });
  return res.json();
}

// 客户端组件
'use client';
export default function InteractiveWidget() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

---

## 🎯 选择指南

```markdown
1. 需要 SEO 吗？
   - 不需要 → CSR
   - 需要 → 继续

2. 数据更新频率？
   - 很少更新 → SSG
   - 定期更新 → ISR
   - 实时更新 → SSR

3. 是否个性化内容？
   - 是 → SSR
   - 否 → SSG / ISR
```

---

## 📋 框架支持

| 框架 | CSR | SSR | SSG | ISR |
|------|-----|-----|-----|-----|
| Next.js | ✅ | ✅ | ✅ | ✅ |
| Nuxt.js | ✅ | ✅ | ✅ | ✅ |
| Astro | ✅ | ✅ | ✅ | ✅ |
| Gatsby | ✅ | - | ✅ | - |
| React | ✅ | - | - | - |

---

没有最好的策略，只有最适合的策略。根据页面特点选择合适的渲染方式。
