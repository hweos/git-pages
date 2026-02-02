# Express 框架详解

Express 是 Node.js 最流行的 Web 框架，简洁灵活。

## 快速开始

### 安装

```bash
npm init -y
npm install express
```

### Hello World

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## 路由

### 基础路由

```javascript
// HTTP 方法
app.get('/users', handler);
app.post('/users', handler);
app.put('/users/:id', handler);
app.patch('/users/:id', handler);
app.delete('/users/:id', handler);

// 所有方法
app.all('/secret', handler);

// 链式调用
app.route('/users')
  .get(handler)
  .post(handler);
```

### 路由参数

```javascript
// 必选参数
app.get('/users/:id', (req, res) => {
  console.log(req.params.id);  // 123
});

// 多个参数
app.get('/users/:userId/posts/:postId', (req, res) => {
  const { userId, postId } = req.params;
});

// 可选参数
app.get('/users/:id?', handler);

// 正则约束
app.get('/users/:id(\\d+)', handler);  // 只匹配数字
```

### 查询参数

```javascript
// GET /search?q=hello&page=2
app.get('/search', (req, res) => {
  const { q, page = 1 } = req.query;
});
```

### 路由模块化

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ users: [] });
});

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id });
});

router.post('/', (req, res) => {
  res.status(201).json({ id: 1, ...req.body });
});

module.exports = router;

// app.js
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);
```

## 中间件

### 中间件类型

```javascript
// 应用级中间件
app.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();
});

// 路由级中间件
router.use((req, res, next) => {
  next();
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// 第三方中间件
const cors = require('cors');
app.use(cors());
```

### 内置中间件

```javascript
// 解析 JSON
app.use(express.json());

// 解析 URL 编码
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use(express.static('public'));
app.use('/static', express.static('public'));
```

### 常用第三方中间件

```bash
npm install cors helmet morgan cookie-parser compression
```

```javascript
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// 安全头
app.use(helmet());

// 日志
app.use(morgan('dev'));      // 开发环境
app.use(morgan('combined')); // 生产环境

// Cookie 解析
app.use(cookieParser());

// Gzip 压缩
app.use(compression());
```

### 自定义中间件

```javascript
// 日志中间件
const logger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// 认证中间件
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// 使用
app.use(logger);
app.get('/protected', auth, (req, res) => {
  res.json({ user: req.user });
});
```

## 请求与响应

### 请求对象

```javascript
app.post('/users', (req, res) => {
  // 请求体
  req.body          // JSON/表单数据
  
  // 参数
  req.params        // 路由参数
  req.query         // 查询参数
  
  // 请求头
  req.headers       // 所有请求头
  req.get('Content-Type')  // 获取特定头
  
  // 其他
  req.method        // GET, POST, etc.
  req.url           // 请求 URL
  req.path          // URL 路径部分
  req.ip            // 客户端 IP
  req.cookies       // Cookie (需要 cookie-parser)
  req.hostname      // 主机名
  req.protocol      // http 或 https
});
```

### 响应对象

```javascript
app.get('/example', (req, res) => {
  // 发送响应
  res.send('Hello');              // 自动设置 Content-Type
  res.json({ message: 'Hello' }); // JSON 响应
  res.sendFile('/path/to/file');  // 发送文件
  res.download('/path/to/file');  // 下载文件
  res.redirect('/new-url');       // 重定向
  res.redirect(301, '/new-url');  // 永久重定向
  
  // 状态码
  res.status(201).json({ id: 1 });
  res.sendStatus(204);            // 发送状态码和对应消息
  
  // 响应头
  res.set('X-Custom-Header', 'value');
  res.cookie('name', 'value', { httpOnly: true });
  res.clearCookie('name');
  
  // 链式调用
  res
    .status(201)
    .set('Location', '/users/1')
    .json({ id: 1 });
});
```

## 错误处理

### 同步错误

```javascript
app.get('/error', (req, res) => {
  throw new Error('Something went wrong');
});

// 错误处理中间件会捕获
```

### 异步错误

```javascript
// Express 5 自动捕获
app.get('/async', async (req, res) => {
  const data = await fetchData();  // 抛出的错误会被捕获
  res.json(data);
});

// Express 4 需要手动处理
app.get('/async', async (req, res, next) => {
  try {
    const data = await fetchData();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// 或使用包装函数
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/async', asyncHandler(async (req, res) => {
  const data = await fetchData();
  res.json(data);
}));
```

### 自定义错误类

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// 使用
app.get('/users/:id', async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.json(user);
});

// 错误处理
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
```

## 文件上传

```bash
npm install multer
```

```javascript
const multer = require('multer');

// 内存存储
const upload = multer({ storage: multer.memoryStorage() });

// 磁盘存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

// 单文件
app.post('/upload', upload.single('avatar'), (req, res) => {
  res.json({ file: req.file });
});

// 多文件
app.post('/upload', upload.array('photos', 5), (req, res) => {
  res.json({ files: req.files });
});

// 多字段
app.post('/upload', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'gallery', maxCount: 5 },
]), (req, res) => {
  res.json({
    avatar: req.files.avatar,
    gallery: req.files.gallery,
  });
});
```

## 项目结构

```
src/
├── app.js              # Express 应用配置
├── server.js           # 启动服务器
├── config/
│   └── index.js        # 配置
├── routes/
│   ├── index.js        # 路由汇总
│   └── users.js        # 用户路由
├── controllers/
│   └── userController.js
├── services/
│   └── userService.js
├── models/
│   └── User.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validate.js
├── utils/
│   └── AppError.js
└── validators/
    └── userValidator.js
```

## 完整示例

```javascript
// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const usersRouter = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 中间件
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// 路由
app.use('/api/users', usersRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 错误处理
app.use(errorHandler);

module.exports = app;
```

```javascript
// server.js
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 总结

| 功能 | 方法 |
|------|------|
| 路由 | `app.get()` / `router.get()` |
| 中间件 | `app.use()` |
| JSON 解析 | `express.json()` |
| 静态文件 | `express.static()` |
| 错误处理 | 四参数中间件 |
| 文件上传 | multer |
