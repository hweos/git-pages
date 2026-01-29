---
slug: serverless-guide
title: Serverless 应用开发指南
authors: mason
tags: [Serverless, 云原生, 后端]
---

Serverless 让开发者专注于业务逻辑，无需管理服务器。本文介绍 Serverless 的核心概念和实践。

<!--truncate-->

## 🎯 什么是 Serverless

```markdown
Serverless ≠ 没有服务器
Serverless = 无需管理服务器

核心特点：
- 按需执行，按量计费
- 自动扩缩容
- 无需运维
- 事件驱动
```

### 对比传统架构

| 维度 | 传统服务器 | Serverless |
|------|-----------|------------|
| 服务器管理 | 需要 | 不需要 |
| 计费方式 | 按时间 | 按调用次数 |
| 扩缩容 | 手动/自动 | 自动 |
| 冷启动 | 无 | 有 |
| 最大执行时间 | 无限 | 有限制 |

---

## 🏗️ 主流平台

| 平台 | 服务名称 | 特点 |
|------|---------|------|
| AWS | Lambda | 最成熟 |
| 阿里云 | 函数计算 | 国内首选 |
| Vercel | Edge Functions | 前端友好 |
| Cloudflare | Workers | 边缘计算 |
| Netlify | Functions | 简单易用 |

---

## 📦 Vercel Serverless Functions

### 项目结构

```
my-app/
├── api/
│   ├── hello.ts        # GET /api/hello
│   ├── users/
│   │   ├── index.ts    # GET /api/users
│   │   └── [id].ts     # GET /api/users/:id
│   └── posts/
│       └── create.ts   # POST /api/posts/create
├── package.json
└── vercel.json
```

### 基础函数

```typescript
// api/hello.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ message: 'Hello, World!' });
}
```

### 处理不同方法

```typescript
// api/users/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  switch (req.method) {
    case 'GET':
      const users = await getUsers();
      return res.status(200).json(users);
    
    case 'POST':
      const newUser = await createUser(req.body);
      return res.status(201).json(newUser);
    
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

### 动态路由

```typescript
// api/users/[id].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const user = await getUserById(id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json(user);
}
```

---

## ⚡ Cloudflare Workers

### 基础示例

```typescript
// src/index.ts
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/hello') {
      return new Response(JSON.stringify({ message: 'Hello!' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response('Not Found', { status: 404 });
  },
};
```

### 使用 Hono 框架

```typescript
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('Hello Hono!'));

app.get('/api/users', async (c) => {
  const users = await getUsers();
  return c.json(users);
});

app.post('/api/users', async (c) => {
  const body = await c.req.json();
  const user = await createUser(body);
  return c.json(user, 201);
});

export default app;
```

---

## 🗄️ 数据存储

### Vercel KV (Redis)

```typescript
import { kv } from '@vercel/kv';

// 设置值
await kv.set('user:1', { name: 'John', email: 'john@example.com' });

// 获取值
const user = await kv.get('user:1');

// 设置过期时间
await kv.set('session:abc', data, { ex: 3600 }); // 1小时

// 列表操作
await kv.lpush('queue', 'task1');
const task = await kv.rpop('queue');
```

### Vercel Postgres

```typescript
import { sql } from '@vercel/postgres';

// 查询
const { rows } = await sql`SELECT * FROM users WHERE id = ${userId}`;

// 插入
await sql`INSERT INTO users (name, email) VALUES (${name}, ${email})`;

// 事务
await sql.begin(async (sql) => {
  await sql`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${from}`;
  await sql`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${to}`;
});
```

### Cloudflare D1 (SQLite)

```typescript
export default {
  async fetch(request: Request, env: Env) {
    const { results } = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(1).all();
    
    return Response.json(results);
  },
};
```

---

## 🔐 认证与安全

### JWT 验证

```typescript
import jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // 继续处理...
}
```

### CORS 处理

```typescript
export default function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 继续处理...
}
```

---

## ⏱️ 冷启动优化

### 减少包大小

```typescript
// ❌ 导入整个库
import _ from 'lodash';

// ✅ 按需导入
import debounce from 'lodash/debounce';
```

### 懒加载

```typescript
// 在函数外部初始化的代码会被缓存
let dbConnection: Database | null = null;

export default async function handler(req, res) {
  // 复用连接
  if (!dbConnection) {
    dbConnection = await createConnection();
  }
  
  // 使用连接...
}
```

### 预热

```typescript
// 定时调用保持热状态
// vercel.json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## 📊 监控和日志

```typescript
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const start = Date.now();
  
  try {
    const result = await processRequest(req);
    
    console.log({
      method: req.method,
      path: req.url,
      duration: Date.now() - start,
      status: 200,
    });
    
    return res.status(200).json(result);
  } catch (error) {
    console.error({
      method: req.method,
      path: req.url,
      duration: Date.now() - start,
      error: error.message,
    });
    
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

---

## ✅ 最佳实践

```markdown
1. 函数保持小而专注
2. 复用数据库连接
3. 减少依赖包大小
4. 使用环境变量存储敏感信息
5. 合理设置超时时间
6. 添加错误处理和日志
7. 考虑冷启动影响
```

---

## 📋 适用场景

```markdown
✅ 适合：
- API 服务
- Webhook 处理
- 定时任务
- 文件处理
- 边缘计算

❌ 不适合：
- 长时间运行的任务
- WebSocket 长连接
- 需要本地文件系统
- 高并发低延迟场景
```

---

Serverless 降低了后端开发门槛，是小型项目和 MVP 的好选择。
