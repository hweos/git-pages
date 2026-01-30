# RESTful API 设计规范

设计良好的 RESTful API 是后端开发的基本功。

## REST 核心概念

### 资源 (Resource)

资源是 REST 的核心抽象，使用 URI 标识：

```
/users          - 用户集合
/users/123      - 单个用户
/users/123/orders  - 用户的订单
```

### HTTP 方法

| 方法 | 操作 | 幂等性 | 安全性 |
|------|------|--------|--------|
| GET | 获取资源 | ✅ | ✅ |
| POST | 创建资源 | ❌ | ❌ |
| PUT | 完整更新 | ✅ | ❌ |
| PATCH | 部分更新 | ❌ | ❌ |
| DELETE | 删除资源 | ✅ | ❌ |

## URL 设计

### 基本规则

```
✅ 使用名词复数
GET /users
GET /articles

❌ 避免动词
GET /getUsers
GET /createUser

✅ 使用连字符
GET /user-profiles

❌ 避免下划线和驼峰
GET /user_profiles
GET /userProfiles

✅ 使用小写
GET /api/users

❌ 避免大写
GET /API/Users
```

### 资源层级

```
# 一级资源
GET /users

# 二级资源（嵌套不超过 2 层）
GET /users/123/orders

# 过深嵌套的替代方案
❌ GET /users/123/orders/456/items/789
✅ GET /orders/456/items/789
✅ GET /order-items/789
```

### 版本控制

```
# URL 路径版本（推荐）
GET /api/v1/users
GET /api/v2/users

# Header 版本
GET /api/users
Accept: application/vnd.myapp.v1+json

# 查询参数版本
GET /api/users?version=1
```

## 请求设计

### GET - 获取资源

```http
# 获取列表
GET /api/users HTTP/1.1

# 带查询参数
GET /api/users?page=1&limit=20&sort=-createdAt&status=active HTTP/1.1

# 获取单个
GET /api/users/123 HTTP/1.1
```

### POST - 创建资源

```http
POST /api/users HTTP/1.1
Content-Type: application/json

{
  "name": "Tom",
  "email": "tom@example.com",
  "password": "secret123"
}
```

### PUT - 完整更新

```http
PUT /api/users/123 HTTP/1.1
Content-Type: application/json

{
  "name": "Tom Chen",
  "email": "tom@example.com",
  "phone": "13800138000"
}
```

### PATCH - 部分更新

```http
PATCH /api/users/123 HTTP/1.1
Content-Type: application/json

{
  "name": "Tom Chen"
}
```

### DELETE - 删除资源

```http
DELETE /api/users/123 HTTP/1.1
```

## 响应设计

### 状态码

```javascript
// 2xx 成功
200 OK           // GET 成功，PUT/PATCH 更新成功
201 Created      // POST 创建成功
204 No Content   // DELETE 成功

// 3xx 重定向
301 Moved Permanently
304 Not Modified

// 4xx 客户端错误
400 Bad Request        // 请求格式错误
401 Unauthorized       // 未认证
403 Forbidden          // 无权限
404 Not Found          // 资源不存在
405 Method Not Allowed // 方法不支持
409 Conflict           // 资源冲突
422 Unprocessable Entity // 验证失败
429 Too Many Requests  // 限流

// 5xx 服务端错误
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

### 响应格式

```javascript
// 成功响应 - 列表
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      { "id": 1, "name": "Tom" },
      { "id": 2, "name": "Jerry" }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}

// 成功响应 - 单个资源
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "Tom",
    "email": "tom@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}

// 创建成功
{
  "code": 0,
  "message": "User created successfully",
  "data": {
    "id": 123,
    "name": "Tom"
  }
}

// 错误响应
{
  "code": 40001,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

## 查询参数

### 分页

```http
GET /api/users?page=2&limit=20

# 响应
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 2,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": true
    }
  }
}
```

### 排序

```http
# 单字段排序
GET /api/users?sort=createdAt       # 升序
GET /api/users?sort=-createdAt      # 降序

# 多字段排序
GET /api/users?sort=-createdAt,name
```

### 筛选

```http
# 精确匹配
GET /api/users?status=active

# 范围查询
GET /api/users?age[gte]=18&age[lte]=30
GET /api/orders?createdAt[gte]=2024-01-01

# 包含查询
GET /api/users?role[in]=admin,editor

# 模糊搜索
GET /api/users?q=tom
GET /api/users?name[like]=tom
```

### 字段选择

```http
# 只返回指定字段
GET /api/users?fields=id,name,email

# 排除字段
GET /api/users?exclude=password,salt
```

### 关联加载

```http
# 包含关联资源
GET /api/users/123?include=orders,profile

# 响应
{
  "data": {
    "id": 123,
    "name": "Tom",
    "orders": [...],
    "profile": {...}
  }
}
```

## 认证与授权

### JWT 认证

```http
# 登录获取 Token
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "tom@example.com",
  "password": "secret123"
}

# 响应
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}

# 使用 Token
GET /api/users/me HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 刷新 Token

```http
POST /api/auth/refresh HTTP/1.1
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## 实现示例

### Express 实现

```javascript
import express from 'express';

const app = express();
app.use(express.json());

// 用户列表
app.get('/api/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt', status } = req.query;
    
    // 构建查询
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sort.replace(',', ' '))
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        items: users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      code: 50000,
      message: 'Internal Server Error',
    });
  }
});

// 获取单个用户
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        code: 40401,
        message: 'User not found',
      });
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      code: 50000,
      message: 'Internal Server Error',
    });
  }
});

// 创建用户
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // 验证
    if (!name || !email || !password) {
      return res.status(400).json({
        code: 40001,
        message: 'Validation failed',
        errors: [
          !name && { field: 'name', message: 'Name is required' },
          !email && { field: 'email', message: 'Email is required' },
          !password && { field: 'password', message: 'Password is required' },
        ].filter(Boolean),
      });
    }
    
    // 检查邮箱是否已存在
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        code: 40901,
        message: 'Email already exists',
      });
    }
    
    const user = await User.create({ name, email, password });
    
    res.status(201).json({
      code: 0,
      message: 'User created successfully',
      data: { id: user._id, name, email },
    });
  } catch (err) {
    res.status(500).json({
      code: 50000,
      message: 'Internal Server Error',
    });
  }
});

// 更新用户
app.patch('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        code: 40401,
        message: 'User not found',
      });
    }
    
    res.json({
      code: 0,
      message: 'User updated successfully',
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      code: 50000,
      message: 'Internal Server Error',
    });
  }
});

// 删除用户
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        code: 40401,
        message: 'User not found',
      });
    }
    
    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      code: 50000,
      message: 'Internal Server Error',
    });
  }
});
```

## 最佳实践

### 接口文档

使用 OpenAPI (Swagger) 规范：

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0

paths:
  /api/users:
    get:
      summary: Get user list
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
    post:
      summary: Create user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUser'
      responses:
        '201':
          description: Created
```

### 安全性

```javascript
// CORS 配置
import cors from 'cors';
app.use(cors({
  origin: ['https://example.com'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

// 限流
import rateLimit from 'express-rate-limit';
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 最多 100 次请求
}));

// Helmet 安全头
import helmet from 'helmet';
app.use(helmet());
```

### 幂等性处理

```http
# 使用幂等键
POST /api/orders HTTP/1.1
Idempotency-Key: abc123-unique-key

{
  "items": [...]
}
```

## 总结

| 规则 | 说明 |
|------|------|
| 使用名词复数 | `/users` 而非 `/user` |
| 正确使用 HTTP 方法 | GET/POST/PUT/PATCH/DELETE |
| 使用合适的状态码 | 2xx/4xx/5xx |
| 统一响应格式 | code + message + data |
| 支持分页排序筛选 | page/limit/sort/filter |
| 版本控制 | `/api/v1/users` |
| 使用 HTTPS | 生产环境必须 |
| 做好错误处理 | 返回有意义的错误信息 |
