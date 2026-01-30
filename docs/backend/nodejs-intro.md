# Node.js 入门指南

Node.js 是基于 Chrome V8 引擎的 JavaScript 运行时，让 JS 可以在服务端运行。

## 环境搭建

### 安装 Node.js

推荐使用 nvm (Node Version Manager) 管理多版本：

```bash
# macOS/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装 Node.js
nvm install 20
nvm use 20
nvm alias default 20

# 验证安装
node -v
npm -v
```

### 项目初始化

```bash
mkdir my-project && cd my-project
npm init -y

# 或使用 pnpm
pnpm init
```

## 核心模块

### fs - 文件系统

```javascript
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';

// 读取文件
const content = await fs.readFile('file.txt', 'utf-8');

// 写入文件
await fs.writeFile('output.txt', 'Hello World');

// 追加内容
await fs.appendFile('log.txt', 'New log entry\n');

// 检查文件是否存在
try {
  await fs.access('file.txt');
  console.log('File exists');
} catch {
  console.log('File does not exist');
}

// 读取目录
const files = await fs.readdir('./src');

// 获取文件信息
const stats = await fs.stat('file.txt');
console.log(stats.isFile(), stats.size, stats.mtime);

// 删除文件
await fs.unlink('temp.txt');

// 创建目录
await fs.mkdir('new-folder', { recursive: true });

// 流式读写（大文件）
const readStream = createReadStream('large-file.txt');
const writeStream = createWriteStream('copy.txt');
readStream.pipe(writeStream);
```

### path - 路径处理

```javascript
import path from 'path';

// 拼接路径
path.join('/users', 'tom', 'docs');  // '/users/tom/docs'

// 解析为绝对路径
path.resolve('./src', 'index.js');  // '/project/src/index.js'

// 获取目录名
path.dirname('/users/tom/file.txt');  // '/users/tom'

// 获取文件名
path.basename('/users/tom/file.txt');       // 'file.txt'
path.basename('/users/tom/file.txt', '.txt'); // 'file'

// 获取扩展名
path.extname('file.txt');  // '.txt'

// 解析路径
path.parse('/users/tom/file.txt');
// { root: '/', dir: '/users/tom', base: 'file.txt', ext: '.txt', name: 'file' }

// 格式化路径对象
path.format({ dir: '/users/tom', name: 'file', ext: '.txt' });
// '/users/tom/file.txt'
```

### http - HTTP 服务

```javascript
import http from 'http';

const server = http.createServer((req, res) => {
  const { method, url, headers } = req;
  
  // 设置响应头
  res.setHeader('Content-Type', 'application/json');
  
  // 路由处理
  if (method === 'GET' && url === '/api/users') {
    res.statusCode = 200;
    res.end(JSON.stringify({ users: [] }));
    return;
  }
  
  // 处理 POST 请求体
  if (method === 'POST' && url === '/api/users') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const data = JSON.parse(body);
      res.statusCode = 201;
      res.end(JSON.stringify({ id: 1, ...data }));
    });
    return;
  }
  
  // 404
  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
```

### events - 事件发射器

```javascript
import { EventEmitter } from 'events';

class MyEmitter extends EventEmitter {}

const emitter = new MyEmitter();

// 监听事件
emitter.on('message', (data) => {
  console.log('Received:', data);
});

// 单次监听
emitter.once('connect', () => {
  console.log('Connected!');
});

// 触发事件
emitter.emit('message', { text: 'Hello' });
emitter.emit('connect');
emitter.emit('connect'); // 不会再触发

// 移除监听器
const handler = () => {};
emitter.on('event', handler);
emitter.off('event', handler);

// 错误处理
emitter.on('error', (err) => {
  console.error('Error:', err);
});
```

### process - 进程

```javascript
// 环境变量
console.log(process.env.NODE_ENV);
console.log(process.env.PORT || 3000);

// 命令行参数
console.log(process.argv);
// ['node', '/path/script.js', 'arg1', 'arg2']

// 当前工作目录
console.log(process.cwd());

// 退出进程
process.exit(0); // 成功
process.exit(1); // 失败

// 进程事件
process.on('uncaughtException', (err) => {
  console.error('Uncaught:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// 优雅退出
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
```

## 异步编程

### Callback 风格

```javascript
import fs from 'fs';

fs.readFile('file.txt', 'utf-8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
```

### Promise 风格

```javascript
import fs from 'fs/promises';

fs.readFile('file.txt', 'utf-8')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### async/await 风格

```javascript
import fs from 'fs/promises';

async function readFile() {
  try {
    const data = await fs.readFile('file.txt', 'utf-8');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

### 并发控制

```javascript
// 并行执行
const [file1, file2] = await Promise.all([
  fs.readFile('file1.txt', 'utf-8'),
  fs.readFile('file2.txt', 'utf-8'),
]);

// 并发限制
async function limitConcurrency(tasks, limit) {
  const results = [];
  const executing = [];
  
  for (const task of tasks) {
    const p = Promise.resolve().then(task);
    results.push(p);
    
    if (tasks.length >= limit) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  
  return Promise.all(results);
}
```

## Express 框架

### 基础应用

```bash
npm install express
```

```javascript
import express from 'express';

const app = express();

// 内置中间件
app.use(express.json()); // 解析 JSON
app.use(express.urlencoded({ extended: true })); // 解析表单

// 静态文件
app.use(express.static('public'));

// 路由
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  res.status(201).json({ id: 1, name, email });
});

// 路由参数
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id, name: 'Tom' });
});

// 查询参数
app.get('/api/search', (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  res.json({ query: q, page, limit });
});

// 启动服务
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 中间件

```javascript
// 自定义中间件
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
};

app.use(logger);

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};

app.use(errorHandler); // 放在最后

// 异步错误处理
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/api/data', asyncHandler(async (req, res) => {
  const data = await fetchData();
  res.json(data);
}));
```

### 路由模块化

```javascript
// routes/users.js
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ users: [] });
});

router.post('/', (req, res) => {
  res.status(201).json({ id: 1, ...req.body });
});

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id });
});

export default router;

// app.js
import userRoutes from './routes/users.js';

app.use('/api/users', userRoutes);
```

## 数据库连接

### MySQL

```bash
npm install mysql2
```

```javascript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydb',
  waitForConnections: true,
  connectionLimit: 10,
});

// 查询
const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [1]);

// 插入
const [result] = await pool.execute(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['Tom', 'tom@example.com']
);
console.log(result.insertId);

// 事务
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  await connection.execute('INSERT INTO users (name) VALUES (?)', ['Tom']);
  await connection.execute('INSERT INTO logs (action) VALUES (?)', ['create']);
  await connection.commit();
} catch (err) {
  await connection.rollback();
  throw err;
} finally {
  connection.release();
}
```

### MongoDB

```bash
npm install mongodb
```

```javascript
import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();

const db = client.db('mydb');
const users = db.collection('users');

// 插入
const result = await users.insertOne({ name: 'Tom', age: 25 });

// 查询
const user = await users.findOne({ _id: result.insertedId });
const allUsers = await users.find({ age: { $gte: 18 } }).toArray();

// 更新
await users.updateOne({ _id: user._id }, { $set: { age: 26 } });

// 删除
await users.deleteOne({ _id: user._id });

// 关闭连接
await client.close();
```

## 实用工具

### dotenv - 环境变量

```bash
npm install dotenv
```

```javascript
// .env
// PORT=3000
// DATABASE_URL=mongodb://localhost:27017

import 'dotenv/config';
// 或
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.PORT);
console.log(process.env.DATABASE_URL);
```

### nodemon - 自动重启

```bash
npm install nodemon -D
```

```json
{
  "scripts": {
    "dev": "nodemon src/index.js"
  }
}
```

## 项目结构

```
my-project/
├── src/
│   ├── routes/          # 路由
│   │   ├── users.js
│   │   └── index.js
│   ├── controllers/     # 控制器
│   │   └── userController.js
│   ├── services/        # 业务逻辑
│   │   └── userService.js
│   ├── models/          # 数据模型
│   │   └── User.js
│   ├── middleware/      # 中间件
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── utils/           # 工具函数
│   │   └── logger.js
│   ├── config/          # 配置
│   │   └── database.js
│   └── app.js           # 应用入口
├── tests/               # 测试
├── .env                 # 环境变量
├── .env.example         # 环境变量模板
├── package.json
└── README.md
```

## 总结

| 模块 | 用途 |
|------|------|
| fs | 文件读写操作 |
| path | 路径处理 |
| http | 创建 HTTP 服务 |
| events | 事件驱动编程 |
| process | 进程信息和控制 |
| stream | 流式数据处理 |
| crypto | 加密功能 |
| child_process | 子进程管理 |
